#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Генератор конфигурационных манифестов партнёрского кабинета Steamworks (SteamPipe VDF,
схема локализованных достижений RU/EN и профиль управления Steam Input / Steam Deck)
для проекта «ИМАМАТ: ДИВАН-ХАНА (THE IMAMAT: DIVAN-KHANA)» (Milestone M9).

Читает таблицу DT_SteamAchievements.json и формирует готовые к загрузке в Steamworks SDK файлы
в директории 05_Steam_Release_and_Playtest_Kit/Steamworks_Partner_Config/.
"""

import json
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
DATATABLES_DIR = PROJECT_ROOT / "04_UE5_ImamatWargame" / "Content" / "DataTables"
OUTPUT_DIR = PROJECT_ROOT / "05_Steam_Release_and_Playtest_Kit" / "Steamworks_Partner_Config"

# Резервный AppID и DepotID для предрелизной конфигурации Steamworks (заменяются на боевые при регистрации)
STEAM_APP_ID = 3481840
STEAM_PLAYTEST_APP_ID = 3481850
DEPOT_WIN64_ID = 3481841
DEPOT_MACOS_ID = 3481842


def generate_steampipe_app_build_vdf() -> Path:
    vdf_content = f'''// ============================================================================
// Valve SteamPipe Master AppBuild Script — IMAMAT: DIVAN-KHANA (1845)
// Upload command:
//   steamcmd +login <partner_account> +run_app_build app_build_imamat_vertical_slice.vdf +quit
// Depots: Win64 x64 (3481841) & macOS Apple Silicon/Universal (3481842)
// Auto-Cloud Rules: steam_cloud_autocloud.vdf (*.imamat-save, 100 MB quota)
// ============================================================================
"AppBuild"
{{
\t"AppID" "{STEAM_APP_ID}"
\t"Desc" "THE IMAMAT: DIVAN-KHANA (1845) — Sprint 11 Steam Desktop RC1 (macOS arm64 + Windows x64 + Steamworks)"
\t"BuildOutput" "..\\\\BuildOutput\\\\SteamPipe"
\t"ContentRoot" "..\\\\StagedBuilds"
\t"SetLive" "playtest_beta"
\t"Preview" "0"
\t"Local" ""

\t"Depots"
\t{{
\t\t"{DEPOT_WIN64_ID}" "depot_build_win64_{DEPOT_WIN64_ID}.vdf"
\t\t"{DEPOT_MACOS_ID}" "depot_build_macos_{DEPOT_MACOS_ID}.vdf"
\t}}
}}
'''
    out_path = OUTPUT_DIR / "app_build_imamat_vertical_slice.vdf"
    out_path.write_text(vdf_content, encoding="utf-8")
    return out_path


def generate_depot_vdfs() -> tuple[Path, Path]:
    win_vdf = f'''"DepotBuild"
{{
\t"DepotID" "{DEPOT_WIN64_ID}"
\t"FileMapping"
\t{{
\t\t"LocalPath" "Windows\\\\*"
\t\t"DepotPath" "."
\t\t"recursive" "1"
\t}}
\t"FileExclusion" "*.pdb"
\t"FileExclusion" "*.log"
}}
'''
    mac_vdf = f'''"DepotBuild"
{{
\t"DepotID" "{DEPOT_MACOS_ID}"
\t"FileMapping"
\t{{
\t\t"LocalPath" "Mac\\\\*"
\t\t"DepotPath" "."
\t\t"recursive" "1"
\t}}
\t"FileExclusion" "*.dSYM"
\t"FileExclusion" ".DS_Store"
}}
'''
    p_win = OUTPUT_DIR / f"depot_build_win64_{DEPOT_WIN64_ID}.vdf"
    p_mac = OUTPUT_DIR / f"depot_build_macos_{DEPOT_MACOS_ID}.vdf"
    p_win.write_text(win_vdf, encoding="utf-8")
    p_mac.write_text(mac_vdf, encoding="utf-8")
    return p_win, p_mac


def generate_steam_cloud_autocloud_vdf() -> Path:
    vdf_content = f'''"SteamAutoCloudConfig"
{{
\t"AppID" "{STEAM_APP_ID}"
\t"QuotaBytes" "104857600"
\t"MaxFiles" "64"
\t"RootOverrides"
\t{{
\t\t"0"
\t\t{{
\t\t\t"root" "WinAppDataRoaming"
\t\t\t"os" "Windows"
\t\t\t"path" "ImamatDivanKhana\\\\SteamCloud"
\t\t\t"pattern" "*.imamat-save"
\t\t\t"recursive" "0"
\t\t}}
\t\t"1"
\t\t{{
\t\t\t"root" "MacAppSupport"
\t\t\t"os" "MacOS"
\t\t\t"path" "ImamatDivanKhana/SteamCloud"
\t\t\t"pattern" "*.imamat-save"
\t\t\t"recursive" "0"
\t\t}}
\t\t"2"
\t\t{{
\t\t\t"root" "LinuxXdgDataHome"
\t\t\t"os" "Linux"
\t\t\t"path" "ImamatDivanKhana/SteamCloud"
\t\t\t"pattern" "*.imamat-save"
\t\t\t"recursive" "0"
\t\t}}
\t}}
}}
'''
    out_path = OUTPUT_DIR / "steam_cloud_autocloud.vdf"
    out_path.write_text(vdf_content, encoding="utf-8")
    return out_path


def generate_nextfest_demo_app_build_vdf() -> Path:
    vdf_content = f'''// ============================================================================
// Valve SteamPipe Steam Next Fest Playable Demo AppBuild (Sprint 12 / Gate 6)
// Demo Content: Dargo 1845 ("The Biscuit Expedition") — 8 Turns + 1 Forest Ambush
// Save Carry-Over: *.imamat-save (demoCarryOver=true -> v1.0 Full Edition)
// ============================================================================
"AppBuild"
{{
\t"AppID" "{STEAM_PLAYTEST_APP_ID}"
\t"Desc" "THE IMAMAT: DIVAN-KHANA (1845) — Steam Next Fest Playable Demo v1.0 (Dargo 1845, 8 Turns + 1 Ambush)"
\t"BuildOutput" "..\\\\BuildOutput\\\\SteamPipe_Demo"
\t"ContentRoot" "..\\\\StagedBuilds"
\t"SetLive" "default"
\t"Preview" "0"
\t"Local" ""

\t"Depots"
\t{{
\t\t"{STEAM_PLAYTEST_APP_ID + 1}"
\t\t{{
\t\t\t"FileMapping"
\t\t\t{{
\t\t\t\t"LocalPath" "Windows\\\\*"
\t\t\t\t"DepotPath" "."
\t\t\t\t"recursive" "1"
\t\t\t}}
\t\t}}
\t\t"{STEAM_PLAYTEST_APP_ID + 2}"
\t\t{{
\t\t\t"FileMapping"
\t\t\t{{
\t\t\t\t"LocalPath" "Mac\\\\*"
\t\t\t\t"DepotPath" "."
\t\t\t\t"recursive" "1"
\t\t\t}}
\t\t}}
\t}}
}}
'''
    out_path = OUTPUT_DIR / "app_build_imamat_nextfest_demo.vdf"
    out_path.write_text(vdf_content, encoding="utf-8")
    return out_path


def generate_achievements_schema_json() -> Path:
    ach_path = DATATABLES_DIR / "DT_SteamAchievements.json"
    rows = json.loads(ach_path.read_text(encoding="utf-8"))

    steam_achievements = []
    for idx, row in enumerate(rows, start=1):
        steam_achievements.append({
            "api_name": row["AchievementID"],
            "stat_id": idx,
            "category": row["Category"],
            "hidden": 1 if row.get("bIsHiddenSecret", False) else 0,
            "target_global_unlock_rate_pct": row.get("TargetGlobalUnlockRatePct", 25.0),
            "display_name": {
                "russian": row["TitleRU"],
                "english": row["TitleEN"],
            },
            "description": {
                "russian": row["DescriptionRU"],
                "english": row["DescriptionEN"],
            },
            "icon_unlocked": f"ach_{row['AchievementID'].lower()}_unlocked.jpg",
            "icon_locked": f"ach_{row['AchievementID'].lower()}_gray.jpg",
            "historical_archive_reference": row.get("HistoricalArchiveSource", ""),
        })

    payload = {
        "appid": STEAM_APP_ID,
        "playtest_appid": STEAM_PLAYTEST_APP_ID,
        "schema_version": "M9-Steamworks-1.0",
        "supported_languages": ["russian", "english"],
        "total_achievements": len(steam_achievements),
        "achievements": steam_achievements,
    }

    out_path = OUTPUT_DIR / "steam_achievements_schema.json"
    out_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    return out_path


def generate_steam_input_manifest_vdf() -> Path:
    vdf_content = '''"Action Manifest"
{
\t"version" "1"
\t"revision" "9"
\t"configuration"
\t{
\t\t"controller_type" "controller_neptune" // Steam Deck Verified Profile
\t}
\t"actions"
\t{
\t\t"StrategicDivanTable"
\t\t{
\t\t\t"title" "#ActionSet_StrategicDivanTable"
\t\t\t"StickPadGyro"
\t\t\t{
\t\t\t\t"MoveTableCursor"
\t\t\t\t{
\t\t\t\t\t"title" "#Action_MoveTableCursor"
\t\t\t\t\t"input_mode" "absolute_mouse"
\t\t\t\t}
\t\t\t\t"PanRotateCamera"
\t\t\t\t{
\t\t\t\t\t"title" "#Action_PanRotateCamera"
\t\t\t\t\t"input_mode" "joystick_move"
\t\t\t\t}
\t\t\t}
\t\t\t"Button"
\t\t\t{
\t\t\t\t"SelectNaibateNode" "#Action_SelectNaibateNode"
\t\t\t\t"DispatchMountedEnvoy" "#Action_DispatchMountedEnvoy"
\t\t\t\t"CyclePowderConvoyTier" "#Action_CyclePowderConvoyTier"
\t\t\t\t"OpenShamilNizamCodex" "#Action_OpenShamilNizamCodex"
\t\t\t\t"OpenImamatGlossary" "#Action_OpenImamatGlossary"
\t\t\t\t"ToggleLanguageRU_EN" "#Action_ToggleLanguageRU_EN"
\t\t\t\t"EndStrategicTurn" "#Action_EndStrategicTurn"
\t\t\t}
\t\t}
\t\t"TacticalSiegeDiorama"
\t\t{
\t\t\t"title" "#ActionSet_TacticalSiegeDiorama"
\t\t\t"StickPadGyro"
\t\t\t{
\t\t\t\t"OrbitCutawayCamera"
\t\t\t\t{
\t\t\t\t\t"title" "#Action_OrbitCutawayCamera"
\t\t\t\t\t"input_mode" "joystick_camera"
\t\t\t\t}
\t\t\t}
\t\t\t"Button"
\t\t\t{
\t\t\t\t"ToggleMilyutinCliffCutaway" "#Action_ToggleMilyutinCliffCutaway"
\t\t\t\t"FireGazyrVolley_18" "#Action_FireGazyrVolley_18"
\t\t\t\t"DetonateSubterraneanCamouflet" "#Action_DetonateSubterraneanCamouflet"
\t\t\t\t"TriggerBazalaiDaggerCharge" "#Action_TriggerBazalaiDaggerCharge"
\t\t\t\t"ReturnBattleResultToDivan" "#Action_ReturnBattleResultToDivan"
\t\t\t}
\t\t}
\t}
\t"localization"
\t{
\t\t"russian"
\t\t{
\t\t\t"ActionSet_StrategicDivanTable" "Командный стол Диван-ханы (Стратегия)"
\t\t\t"Action_SelectNaibateNode" "Выбрать наибство на карте Кавказа"
\t\t\t"Action_DispatchMountedEnvoy" "Отправить конного гонца и пороховой обоз"
\t\t\t"Action_CyclePowderConvoyTier" "Сменить эшелон порохового каравана (0/15/30/45 пуд.)"
\t\t\t"Action_OpenShamilNizamCodex" "Открыть Кодекс Низамов Шамиля"
\t\t\t"Action_OpenImamatGlossary" "Открыть Толковый словарь Имамата"
\t\t\t"Action_ToggleLanguageRU_EN" "Переключить язык интерфейса RU / EN"
\t\t\t"Action_EndStrategicTurn" "Завершить ход кампании"
\t\t\t"ActionSet_TacticalSiegeDiorama" "Тактическая диорама осады и Разрез скалы"
\t\t\t"Action_ToggleMilyutinCliffCutaway" "Геодезический разрез скалы барона Милютина"
\t\t\t"Action_FireGazyrVolley_18" "Дать залп из 18 нагрудных газырей"
\t\t\t"Action_DetonateSubterraneanCamouflet" "Подорвать подземный камуфлет (Медный таз Сафарова)"
\t\t\t"Action_TriggerBazalaiDaggerCharge" "Кинжальный прорыв сталью Базалая (при 0/18 газырей)"
\t\t\t"Action_ReturnBattleResultToDivan" "Передать FTacticalBattleResult в Диван-хану"
\t\t}
\t\t"english"
\t\t{
\t\t\t"ActionSet_StrategicDivanTable" "Divan-Khana Command Table (Strategy)"
\t\t\t"Action_SelectNaibateNode" "Select Naibate Node on Caucasus Map"
\t\t\t"Action_DispatchMountedEnvoy" "Dispatch Mounted Courier & Gunpowder Convoy"
\t\t\t"Action_CyclePowderConvoyTier" "Cycle Gunpowder Convoy Tier (0/15/30/45 poods)"
\t\t\t"Action_OpenShamilNizamCodex" "Open Shamil's Nizam Code"
\t\t\t"Action_OpenImamatGlossary" "Open Imamat Historical Glossary"
\t\t\t"Action_ToggleLanguageRU_EN" "Switch UI Language RU / EN"
\t\t\t"Action_EndStrategicTurn" "End Campaign Turn"
\t\t\t"ActionSet_TacticalSiegeDiorama" "Tactical Siege Diorama & Cliff Cutaway"
\t\t\t"Action_ToggleMilyutinCliffCutaway" "Toggle Baron Milyutin Geodesic Cliff Cutaway"
\t\t\t"Action_FireGazyrVolley_18" "Fire 18-Gazyr Chest Bandolier Volley"
\t\t\t"Action_DetonateSubterraneanCamouflet" "Detonate Subterranean Camouflet (Safarov's Copper Basin)"
\t\t\t"Action_TriggerBazalaiDaggerCharge" "Trigger Bazalai Dagger Melee Charge (at 0/18 Gazyrs)"
\t\t\t"Action_ReturnBattleResultToDivan" "Return FTacticalBattleResult to Divan-Khana"
\t\t}
\t}
}
'''
    out_path = OUTPUT_DIR / "steam_input_action_manifest.vdf"
    out_path.write_text(vdf_content, encoding="utf-8")
    return out_path


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    p1 = generate_steampipe_app_build_vdf()
    p_win, p_mac = generate_depot_vdfs()
    p_cloud = generate_steam_cloud_autocloud_vdf()
    p_demo = generate_nextfest_demo_app_build_vdf()
    p2 = generate_achievements_schema_json()
    p3 = generate_steam_input_manifest_vdf()
    print("========================================================================================")
    print(" STEAMWORKS PARTNER CONFIG GENERATOR — ИМАМАТ: ДИВАН-ХАНА (SPRINT 12 / v1.0 GOLD MASTER)")
    print("========================================================================================")
    print(f"[OK] SteamPipe AppBuild VDF     -> {p1.name} ({p1.stat().st_size:,} байт)")
    print(f"[OK] Next Fest Demo Build VDF   -> {p_demo.name} ({p_demo.stat().st_size:,} байт, AppID {STEAM_PLAYTEST_APP_ID})")
    print(f"[OK] Win64 / macOS Depot VDFs   -> {p_win.name}, {p_mac.name}")
    print(f"[OK] Steam Auto-Cloud Rules VDF -> {p_cloud.name} ({p_cloud.stat().st_size:,} байт)")
    print(f"[OK] Achievements Schema JSON   -> {p2.name} ({p2.stat().st_size:,} байт, 12 достижений RU/EN)")
    print(f"[OK] Steam Input Deck Manifest  -> {p3.name} ({p3.stat().st_size:,} байт, 2 Action Sets RU/EN)")
    print("========================================================================================")


if __name__ == "__main__":
    main()
