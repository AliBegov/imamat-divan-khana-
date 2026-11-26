#!/usr/bin/env python3
"""
Автоматический аудит преемственности, историко-антропологического канона и редакционных правил (Season 1)
для сериала-докудрамы «Шамиль: свод неба и кремень».

Проверяет:
  1. shamil_s1_continuity_registry.json (включая канон Шамиля-брюнета в С1 и хны только в пожилом возрасте С3–С4)
  2. master_refs_manifest.json (Reference-First кастинг-портреты и чистые мастер-локации)
  3. s1_previz_shots.json (72 одноклеточных 35mm кадра, отсутствие диптихов/керосиновых ламп/рыжей бороды у Шамиля в С1)
"""

import json
import re
import sys
from pathlib import Path


def main() -> int:
    base_dir = Path(__file__).resolve().parent
    project_root = base_dir.parent
    reg_path = base_dir / "shamil_s1_continuity_registry.json"
    shots_path = base_dir / "s1_previz_shots.json"
    refs_manifest_path = base_dir / "master_refs_manifest.json"

    with reg_path.open("r", encoding="utf-8") as f:
        reg = json.load(f)
    with shots_path.open("r", encoding="utf-8") as f:
        shots_data = json.load(f)

    errors: list[str] = []
    warnings: list[str] = []

    if not refs_manifest_path.exists():
        errors.append("Missing master_refs_manifest.json for Reference-First pipeline")
        refs_manifest = {}
    else:
        with refs_manifest_path.open("r", encoding="utf-8") as f:
            refs_manifest = json.load(f)

    valid_chars = set(reg["characters"].keys())
    valid_wards = set(reg["wardrobe"].keys())
    valid_locs = set(reg["locations"].keys())
    valid_eras = set(reg["eras_and_ages"].keys())
    forbidden_terms = reg.get("editorial_forbidden_terms_in_output", [])

    # 1. Verify CHAR_01 Season 1 brunette canon in registry
    c01_profiles = reg["characters"]["CHAR_01"].get("age_profiles", {})
    for era_key, desc in c01_profiles.items():
        low = desc.lower()
        if any(bad in low for bad in ("reddish", "ginger", "dark-blond", "blond")):
            errors.append(
                f"[REGISTRY CHAR_01:{era_key}] Violates brunette canon in Season 1: '{desc}'"
            )

    # 2. Verify master_refs_manifest.json Shamil spine
    spine = refs_manifest.get("stage_1_shamil_identity_spine", [])
    if len(spine) < 5:
        errors.append("master_refs_manifest.json must define at least 5 Season-1 Shamil age portraits")
    for item in spine:
        rid = item["ref_id"]
        p_low = item["prompt_en"].lower()
        if item["age"] <= 45:
            if "jet-black" not in p_low and "black beard" not in p_low:
                errors.append(f"[MASTER_REF {rid}] Missing explicit black hair/beard lock for S1 brunette Shamil")
        else:
            if "henna" not in p_low:
                errors.append(f"[MASTER_REF {rid}] Elderly lookahead ref should document henna on greyed beard")

    shots = shots_data.get("shots", [])
    if len(shots) != 72:
        warnings.append(f"Expected 72 shots across 8 episodes, got {len(shots)}")

    seen_ids = set()
    past_milyutin_wound = False
    past_surkhai_collapse = False
    past_bridge_cut = False
    past_gimry_scar = False

    forbidden_prompt_structures = (
        "diptych",
        "split-screen",
        "two-part",
        "intercut below",
        "hard cut to",
        "cut to ",
        "kerosene",
    )

    for shot in shots:
        sid = shot["shot_id"]
        if sid in seen_ids:
            errors.append(f"[{sid}] Duplicate shot_id")
        seen_ids.add(sid)

        if shot["era"] not in valid_eras:
            errors.append(f"[{sid}] Unknown era '{shot['era']}'")

        if shot["location_id"] not in valid_locs:
            errors.append(f"[{sid}] Unknown location_id '{shot['location_id']}'")

        for cid in shot.get("characters", []):
            if cid not in valid_chars:
                errors.append(f"[{sid}] Unknown character '{cid}'")

        for cid, wcode in shot.get("wardrobe_codes", {}).items():
            if cid not in valid_chars:
                errors.append(f"[{sid}] Unknown character in wardrobe_codes '{cid}'")
            if wcode not in valid_wards:
                errors.append(f"[{sid}] Unknown wardrobe code '{wcode}' for '{cid}'")

        for field_name in ("existing_ref",):
            ref = shot.get(field_name)
            if ref and not (project_root / ref).exists():
                errors.append(f"[{sid}] Missing existing_ref file: {ref}")

        doc = shot.get("docudrama_insert")
        if doc and doc.get("visual_ref"):
            if not (project_root / doc["visual_ref"]).exists():
                errors.append(f"[{sid}] Missing docudrama visual_ref: {doc['visual_ref']}")

        ip_low = shot.get("image_prompt_en", "").lower()

        # Check single-frame live-action rule & anachronism bans
        for bad_struct in forbidden_prompt_structures:
            if bad_struct in ip_low:
                errors.append(f"[{sid}] Image prompt contains forbidden multi-scene/anachronistic term '{bad_struct}'")

        # Check Shamil brunette rule in every shot containing CHAR_01
        if "CHAR_01" in shot.get("characters", []):
            if re.search(r"\b(reddish|ginger|dark-blond)\b", ip_low):
                errors.append(f"[{sid}] CHAR_01 shot contains ginger/reddish/blond error in image_prompt_en")
            age = shot.get("character_ages", {}).get("CHAR_01", 35)
            if age >= 20 and ("black-bearded" not in ip_low and "jet-black beard" not in ip_low):
                errors.append(f"[{sid}] Adult CHAR_01 shot missing explicit black-beard lock in image_prompt_en")

        if not shot.get("master_ingredients"):
            errors.append(f"[{sid}] Missing master_ingredients linkage for Reference-First Stage 3")

        # Check forbidden editorial terms in shot text
        blob = " ".join([
            shot.get("scene_title_ru", ""),
            shot.get("continuity_state_in", ""),
            shot.get("continuity_state_out", ""),
            shot.get("image_prompt_en", ""),
            shot.get("video_prompt_en", ""),
            shot.get("sfx_prompt_en", ""),
            doc.get("caption_ru", "") if doc else "",
        ]).lower()

        for term in forbidden_terms:
            if term.lower() in blob:
                errors.append(f"[{sid}] Editorial violation: forbidden term '{term}' found")

        # Causal state milestone progression checks
        if sid == "S1E03_SH06":
            past_gimry_scar = True
        if past_gimry_scar and "CHAR_01" in shot.get("characters", []):
            if shot["wardrobe_codes"].get("CHAR_01") in ("WARD_SHAMIL_01", "WARD_SHAMIL_02", "WARD_SHAMIL_03"):
                errors.append(f"[{sid}] Pre-wound wardrobe used after E03 Gimry wound")

        if sid == "S1E07_SH02":
            past_surkhai_collapse = True
        if past_surkhai_collapse and shot["location_id"] == "LOC_S1_14A":
            if "intact" in ip_low:
                errors.append(f"[{sid}] Surkhai Tower described as intact after July 4 destruction")

        if sid == "S1E07_SH03":
            past_milyutin_wound = True
        if past_milyutin_wound and "CHAR_15C" in shot.get("characters", []):
            combined = (shot.get("continuity_state_in", "") + " " + ip_low).lower()
            if "sling" not in combined:
                errors.append(f"[{sid}] Captain Milyutin missing black sling after July 16 wound (E07 Sc.2)")

        if sid == "S1E08_SH03":
            past_bridge_cut = True
        if past_bridge_cut and shot["location_id"] == "LOC_S1_14C":
            errors.append(f"[{sid}] Scene uses severed hanging bridge [LOC_S1_14C] after E08 Sc.2 collapse")

    chars_dir = base_dir / "shared_refs" / "characters"
    locs_dir = base_dir / "shared_refs" / "locations"
    kf_dir = base_dir / "keyframes"
    n_char_refs = len(list(chars_dir.glob("*.jpg"))) + len(list(chars_dir.glob("*.png"))) if chars_dir.exists() else 0
    n_loc_refs = len(list(locs_dir.glob("*.jpg"))) + len(list(locs_dir.glob("*.png"))) if locs_dir.exists() else 0
    n_kf = len(list(kf_dir.glob("*.jpg"))) + len(list(kf_dir.glob("*.png"))) if kf_dir.exists() else 0

    print(f"Audited {len(shots)} shots across {shots_data.get('total_episodes')} episodes.")
    print(f"Registry: {len(valid_chars)} characters, {len(valid_wards)} wardrobes, {len(valid_locs)} locations.")
    print(
        f"Master Assets Ready: {n_char_refs} character casting portraits, "
        f"{n_loc_refs} location plates, {n_kf}/72 approved scene keyframes."
    )
    if warnings:
        print("WARNINGS:")
        for w in warnings:
            print("  -", w)
    if errors:
        print("ERRORS:")
        for e in errors:
            print("  !", e)
        return 1
    print("PASS: All 72 Season 1 shots + Reference-First Master Manifest verified cleanly.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
