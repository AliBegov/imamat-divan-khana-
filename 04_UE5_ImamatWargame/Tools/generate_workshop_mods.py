#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
IMAMAT: DIVAN-KHANA — Steam Workshop Reference Mod Pack Generator (Milestone M13)
Generates 3 ready-to-import custom historical scenario JSON mods in:
  05_Steam_Release_and_Playtest_Kit/Workshop_Mods/
    1. Mod_1839_Akhulgo_Siege.json
    2. Mod_1843_Avaria_Uprising.json
    3. Mod_1857_Baryatinsky_Endgame.json
"""

import copy
import json
import pathlib
from datetime import datetime, timezone

ROOT_DIR = pathlib.Path(__file__).resolve().parents[2]
DT_NAIBATES_PATH = ROOT_DIR / "04_UE5_ImamatWargame" / "Content" / "DataTables" / "DT_Naibates_1845.json"
WORKSHOP_DIR = ROOT_DIR / "05_Steam_Release_and_Playtest_Kit" / "Workshop_Mods"


def build_mod_payload(mod_id, title_ru, title_en, year_ru, year_en, general_idx, resources, naibates_mutator):
    base_naibates = json.loads(DT_NAIBATES_PATH.read_text(encoding="utf-8"))
    modified = []
    for row in base_naibates:
        item = copy.deepcopy(row)
        naibates_mutator(item)
        modified.append(item)

    return {
        "schemaVersion": "ImamatCustomScenarioMod_UE5_5_v1",
        "exportedAtUtc": datetime.now(timezone.utc).isoformat(),
        "modId": mod_id,
        "titleRu": title_ru,
        "titleEn": title_en,
        "yearLabel": year_ru,
        "yearLabelEn": year_en,
        "generalIdx": general_idx,
        "initialResources": resources,
        "DT_Naibates_1845": modified,
    }


def main():
    WORKSHOP_DIR.mkdir(parents=True, exist_ok=True)

    # 1. Mod_1839_Akhulgo_Siege.json
    def mutate_1839(n):
        n["gunpowder"] = max(16, int(n.get("gunpowder", 40)) - 12)
        n["imperialPressure"] = min(92, int(n.get("imperialPressure", 55)) + 16)
        n["underSiege"] = n.get("id") in ("gunib", "karata", "gergebil") or n["imperialPressure"] >= 78
        if "traits" in n and isinstance(n["traits"], dict):
            n["traits"]["courage"] = min(100, int(n["traits"].get("courage", 85)) + 6)

    mod_1839 = build_mod_payload(
        mod_id="Mod_1839_Akhulgo_Siege",
        title_ru="1839: Осада Ахульго и Сурхаевой башни (Ген. П. Х. Граббе)",
        title_en="1839: Siege of Akhulgo & Surkhay's Tower (Gen. P. Kh. Grabbe)",
        year_ru="1839 г. — 80 дней обороны скалы Ахульго",
        year_en="1839 — 80-Day Defense of Mount Akhulgo",
        general_idx=1,
        resources={
            "gunpowder": 110,
            "provisions": 680,
            "silver": 310,
            "authority": 82,
            "ottomanSupport": 25,
        },
        naibates_mutator=mutate_1839,
    )

    # 2. Mod_1843_Avaria_Uprising.json
    def mutate_1843(n):
        n["gunpowder"] = int(n.get("gunpowder", 45)) + 30
        n["murtazeks"] = int(n.get("murtazeks", 400)) + 120
        n["imperialPressure"] = max(20, int(n.get("imperialPressure", 55)) - 15)
        n["underSiege"] = False
        if "traits" in n and isinstance(n["traits"], dict):
            n["traits"]["iman"] = min(100, int(n["traits"].get("iman", 80)) + 8)

    mod_1843 = build_mod_payload(
        mod_id="Mod_1843_Avaria_Uprising",
        title_ru="1843: Сверкающий Газават и освобождение Аварии (Ген. Р. К. Фрейтаг)",
        title_en="1843: The Shining Ghazawat & Liberation of Avaria (Gen. R. K. Freytag)",
        year_ru="1843 г. — Золотой век Имамата",
        year_en="1843 — Golden Age of the Imamate",
        general_idx=2,
        resources={
            "gunpowder": 345,
            "provisions": 1950,
            "silver": 1120,
            "authority": 95,
            "ottomanSupport": 70,
        },
        naibates_mutator=mutate_1843,
    )

    # 3. Mod_1857_Baryatinsky_Endgame.json
    def mutate_1857(n):
        n["gunpowder"] = max(12, int(n.get("gunpowder", 40)) - 18)
        n["imperialPressure"] = min(94, int(n.get("imperialPressure", 55)) + 20)
        n["underSiege"] = n["imperialPressure"] >= 78
        if n.get("id") in ("shali", "benoy", "vedeno"):
            n["pastureAccess"] = False

    mod_1857 = build_mod_payload(
        mod_id="Mod_1857_Baryatinsky_Endgame",
        title_ru="1857–1859: Просеки Барятинского и оборона Ведено (Кн. А. И. Барятинский)",
        title_en="1857–1859: Baryatinsky's Clearings & Defense of Vedeno (Prince A. I. Baryatinsky)",
        year_ru="1857–1859 гг. — Системная блокада просек и Джайляу",
        year_en="1857–1859 — Systemic Forest Clearings & Pasture Blockade",
        general_idx=3,
        resources={
            "gunpowder": 85,
            "provisions": 520,
            "silver": 210,
            "authority": 74,
            "ottomanSupport": 15,
        },
        naibates_mutator=mutate_1857,
    )

    mods = [
        ("Mod_1839_Akhulgo_Siege.json", mod_1839),
        ("Mod_1843_Avaria_Uprising.json", mod_1843),
        ("Mod_1857_Baryatinsky_Endgame.json", mod_1857),
    ]

    print("=" * 88)
    print(" STEAM WORKSHOP REFERENCE MOD PACK GENERATOR — MILESTONE M13")
    print("=" * 88)
    for filename, payload in mods:
        out_path = WORKSHOP_DIR / filename
        out_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"[OK] {filename:<34} -> {out_path.stat().st_size:,} bytes (10 Naibates)")
    print("=" * 88)


if __name__ == "__main__":
    main()
