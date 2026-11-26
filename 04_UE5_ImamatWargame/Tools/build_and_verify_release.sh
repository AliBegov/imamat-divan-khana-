#!/usr/bin/env bash
# ==============================================================================
# IMAMAT: DIVAN-KHANA — Master One-Command Build, Package & Integrity Script
# Milestone M11: Full 11-Tab Bilingual Vertical Slice 1.0 + Pitch Auto-Tour
# ==============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "=============================================================================="
echo " IMAMAT: DIVAN-KHANA — MASTER RELEASE & INTEGRITY PIPELINE (M11)"
echo " Workspace: $ROOT_DIR"
echo "=============================================================================="

echo ""
echo "[0a/6] Generating Mobile iOS App Store & Android Google Play Kit + PWA Icons..."
python3 "$ROOT_DIR/04_UE5_ImamatWargame/Tools/build_mobile_ios_android_kit.py"

echo ""
echo "[0/6] Web QA Gate — ESLint & Static Route Check (blocks release on any error)..."
bash "$ROOT_DIR/04_UE5_ImamatWargame/Tools/web_qa/run_web_qa_gate.sh" static

echo ""
echo "[1/6] Running 4,000-Campaign Headless Monte Carlo Balance Validator..."
python3 "$ROOT_DIR/04_UE5_ImamatWargame/Tools/headless_balance_sim.py"

echo ""
echo "[2/6] Running Playtest Cohort Telemetry KPI Aggregator (50 Sessions)..."
python3 "$ROOT_DIR/04_UE5_ImamatWargame/Tools/aggregate_playtest_telemetry.py"

echo ""
echo "[3/6] Generating Steamworks VDFs, 3 Workshop Mods, UE5 3D Actors Manifest, Trailer SRT/EDL & UE5 Editor Dry-Run..."
python3 "$ROOT_DIR/04_UE5_ImamatWargame/Tools/generate_steamworks_vdf.py"
python3 "$ROOT_DIR/04_UE5_ImamatWargame/Tools/generate_workshop_mods.py"
python3 "$ROOT_DIR/04_UE5_ImamatWargame/Tools/generate_ue5_level_actors_manifest.py"
python3 "$ROOT_DIR/04_UE5_ImamatWargame/Tools/generate_trailer_postprod_assets.py"
python3 "$ROOT_DIR/04_UE5_ImamatWargame/Tools/export_ue5_string_tables.py"
python3 "$ROOT_DIR/04_UE5_ImamatWargame/Tools/ue5_editor_auto_setup.py"

echo ""
echo "[4/6] Building Production React 18 + Vite 6 Bundle (11/11 Bilingual RU/EN Tabs + Pitch Auto-Tour)..."
npm --prefix "$ROOT_DIR/03_Веб_прототип_Диван_Хана" run build

echo ""
echo "[5/6] Packaging Single-File Standalone HTML & Steam Playtest Release ZIPs (v1.0 & v0.5)..."
python3 - "$ROOT_DIR" <<'PYEOF'
import pathlib
import sys
import zipfile

root = pathlib.Path(sys.argv[1])
dist_dir = root / "03_Веб_прототип_Диван_Хана" / "dist"
kit_dir = root / "05_Steam_Release_and_Playtest_Kit"
dt_dir = root / "04_UE5_ImamatWargame" / "Content" / "DataTables"
hm_dir = root / "04_UE5_ImamatWargame" / "Content" / "Heightmaps"

css_files = sorted((dist_dir / "assets").glob("*.css"))
js_files = sorted((dist_dir / "assets").glob("*.js"))
if not css_files or not js_files:
    raise RuntimeError("Missing built CSS or JS assets in 03_Веб_прототип_Диван_Хана/dist/assets")

css_text = css_files[0].read_text(encoding="utf-8")
js_text = js_files[0].read_text(encoding="utf-8")

standalone_html = f"""<!doctype html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
    <meta name="theme-color" content="#0c0e12" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="ИМАМАТ" />
    <title>ИМАМАТ: ДИВАН-ХАНА (1845) — Standalone Bilingual Vertical Slice 1.0 (RU / EN)</title>
    <style>{css_text}</style>
  </head>
  <body class="bg-[#0c0e12] text-stone-100">
    <div id="root"></div>
    <script type="module">{js_text}</script>
  </body>
</html>
"""

pwa_dist_html = f"""<!doctype html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
    <meta name="theme-color" content="#0c0e12" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="ИМАМАТ" />
    <title>ИМАМАТ: ДИВАН-ХАНА (1845) — Военно-историческая 3D-стратегия (RU / EN)</title>
    <link rel="manifest" href="./manifest.webmanifest" />
    <link rel="apple-touch-icon" href="./apple-touch-icon.png" />
    <link rel="icon" type="image/png" sizes="192x192" href="./icon-192.png" />
    <style>{css_text}</style>
  </head>
  <body class="bg-[#0c0e12] text-stone-100">
    <div id="root"></div>
    <script type="module">{js_text}</script>
  </body>
</html>
"""

standalone_path = kit_dir / "Imamat_DivanKhana_Standalone_Playtest.html"
standalone_path.write_text(standalone_html, encoding="utf-8")
(dist_dir / "index.html").write_text(pwa_dist_html, encoding="utf-8")
print(f"  -> Built Standalone HTML: {standalone_path.name} ({standalone_path.stat().st_size:,} bytes)")

bundle_items = [
    (root / "00_MASTER_RELEASE_MANIFEST_M1_M16.md", "00_MASTER_RELEASE_MANIFEST_M1_M16.md"),
    (standalone_path, "Imamat_DivanKhana_Standalone_Playtest.html"),
    (kit_dir / "Imamat_Publisher_Pitch_Deck_Interactive.html", "Imamat_Publisher_Pitch_Deck_Interactive.html"),
] + [(jpg_path, jpg_path.name) for jpg_path in sorted(kit_dir.glob("*.jpg"))] + [
    (kit_dir / "01_Steam_Store_Page_RU_EN.md", "01_Steam_Store_Page_RU_EN.md"),
    (kit_dir / "02_Steam_Tag_Matrix_and_Trailer_Script.md", "02_Steam_Tag_Matrix_and_Trailer_Script.md"),
    (kit_dir / "03_Playtest_Telemetry_and_QA_Checklist.md", "03_Playtest_Telemetry_and_QA_Checklist.md"),
    (kit_dir / "04_Publisher_Pitch_Deck_and_Budget_ROI.md", "04_Publisher_Pitch_Deck_and_Budget_ROI.md"),
    (kit_dir / "05_Press_Kit_and_Executive_OnePager.md", "05_Press_Kit_and_Executive_OnePager.md"),
    (kit_dir / "06_Tacticians_Field_Manual_RU_EN.md", "06_Tacticians_Field_Manual_RU_EN.md"),
    (kit_dir / "07_Creator_and_Curator_Outreach_Kit_RU_EN.md", "07_Creator_and_Curator_Outreach_Kit_RU_EN.md"),
    (kit_dir / "Playtest_Cohort_KPI_Report.json", "Playtest_Cohort_KPI_Report.json"),
    (dt_dir / "DT_Naibates_1845.json", "DT_Naibates_1845.json"),
    (dt_dir / "MonteCarlo_1000x20_Report.json", "MonteCarlo_1000x20_Report.json"),
    (dt_dir / "MonteCarlo_16000_DoctrineMatrix_Report.json", "MonteCarlo_16000_DoctrineMatrix_Report.json"),
    (dt_dir / "DT_ImamatLocalization_RU_EN.json", "DT_ImamatLocalization_RU_EN.json"),
    (dt_dir / "ST_ImamatMaster_RU_EN.json", "ST_ImamatMaster_RU_EN.json"),
    (dt_dir / "ST_ImamatMaster_RU_EN.csv", "ST_ImamatMaster_RU_EN.csv"),
    (dt_dir / "DT_SteamAchievements.json", "DT_SteamAchievements.json"),
    (hm_dir / "UE5_Level_Actors_Spawn_Manifest.json", "UE5_Level_Actors_Spawn_Manifest.json"),
    (root / "04_UE5_ImamatWargame" / "Config" / "MRQ_ImamatTrailer_4K_Preset.json", "Config/MRQ_ImamatTrailer_4K_Preset.json"),
    (kit_dir / "Steamworks_Partner_Config" / "app_build_imamat_vertical_slice.vdf", "Steamworks_Partner_Config/app_build_imamat_vertical_slice.vdf"),
    (kit_dir / "Steamworks_Partner_Config" / "steam_achievements_schema.json", "Steamworks_Partner_Config/steam_achievements_schema.json"),
    (kit_dir / "Steamworks_Partner_Config" / "steam_input_action_manifest.vdf", "Steamworks_Partner_Config/steam_input_action_manifest.vdf"),
    (kit_dir / "Workshop_Mods" / "Mod_1839_Akhulgo_Siege.json", "Workshop_Mods/Mod_1839_Akhulgo_Siege.json"),
    (kit_dir / "Workshop_Mods" / "Mod_1843_Avaria_Uprising.json", "Workshop_Mods/Mod_1843_Avaria_Uprising.json"),
    (kit_dir / "Workshop_Mods" / "Mod_1857_Baryatinsky_Endgame.json", "Workshop_Mods/Mod_1857_Baryatinsky_Endgame.json"),
    (kit_dir / "Trailer_PostProduction" / "Imamat_Steam_Trailer_60s_RU.srt", "Trailer_PostProduction/Imamat_Steam_Trailer_60s_RU.srt"),
    (kit_dir / "Trailer_PostProduction" / "Imamat_Steam_Trailer_60s_EN.srt", "Trailer_PostProduction/Imamat_Steam_Trailer_60s_EN.srt"),
    (kit_dir / "Trailer_PostProduction" / "Imamat_Steam_Trailer_60s_CMX3600.edl", "Trailer_PostProduction/Imamat_Steam_Trailer_60s_CMX3600.edl"),
    (kit_dir / "Trailer_PostProduction" / "Imamat_Steam_Trailer_60s_Timeline.json", "Trailer_PostProduction/Imamat_Steam_Trailer_60s_Timeline.json"),
]

for zip_name in ["Imamat_DivanKhana_Web_Playtest_v1.0.zip", "Imamat_DivanKhana_Web_Playtest_v0.5.zip"]:
    zip_path = kit_dir / zip_name
    with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        for src_file, arc_name in bundle_items:
            if src_file.exists():
                zf.write(src_file, arcname=arc_name)
    print(f"  -> Packaged Archive: {zip_path.name} ({zip_path.stat().st_size:,} bytes)")
PYEOF

echo ""
echo "[5.2/6] Web QA Gate — Headless Chrome Runtime Smoke Test of Standalone HTML (blocks release on any error)..."
bash "$ROOT_DIR/04_UE5_ImamatWargame/Tools/web_qa/run_web_qa_gate.sh" runtime

echo ""
echo "[5.5/6] Building Native macOS (.app + .icns) & Windows Desktop Bundle (M22)..."
python3 "$ROOT_DIR/04_UE5_ImamatWargame/Tools/build_macos_desktop_app.py"

echo ""
echo "[6/6] Running Master Vertical Slice Integrity Validator (PASS 7/7)..."
python3 "$ROOT_DIR/04_UE5_ImamatWargame/Tools/verify_vertical_slice_integrity.py"

echo ""
echo "=============================================================================="
echo " ALL 6 RELEASE PIPELINE STAGES COMPLETED SUCCESSFULLY (PASS 7/7)"
echo "=============================================================================="
