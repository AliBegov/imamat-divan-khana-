#!/usr/bin/env python3
"""
export_app_datatables_to_ue5.py
Автоматический мост данных (Data Bridge):
Извлекает каноничные таблицы баланса из веб-прототипа (03_Веб_прототип_Диван_Хана/src/App.jsx)
и генерирует готовые к импорту в Unreal Engine 5.5 DataTables (.json и .csv),
строго соответствующие C++20 структурам в Source/ImamatWargame/Public/Strategic/ImamatStrategicTypes.h.
"""

import csv
import json
import os
import pathlib
import re
import subprocess
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
# После модуляризации веб-прототипа каноничные таблицы живут в отдельном ES-модуле без JSX
CAMPAIGN_DATA_PATH = os.path.join(BASE_DIR, "03_Веб_прототип_Диван_Хана", "src", "data", "campaignData.js")
OUTPUT_DIR = os.path.join(BASE_DIR, "04_UE5_ImamatWargame", "Content", "DataTables")

EXPORTED_TABLES = [
    "TACTICAL_3D_TERRAINS",
    "CAMPAIGN_SCENARIOS",
    "TARIKAT_PRACTICES",
    "SEASON_CLIMATE_MODIFIERS",
    "HISTORICAL_FIGURES_ARCHIVE",
    "IMPERIAL_GENERALS",
    "INITIAL_ARSENAL_ITEMS",
    "INITIAL_NAIBATES",
    "NAIB_ORDER_TYPES",
    "INITIAL_NIZAMS",
    "INITIAL_COURT_CASES",
    "SHAMIL_ORDERS",
    "OTTOMAN_OPTIONS",
    "INITIAL_SPLINE_SEGMENTS",
    "INITIAL_SPLINE_ECHELONS",
    "INITIAL_HISTORICAL_CRISES",
]


def extract_js_constants_via_node(module_path: str) -> dict:
    # Импортируем ES-модуль данных напрямую в Node.js (без вырезания текста по маркерам)
    module_url = pathlib.Path(module_path).resolve().as_uri()
    js_eval_script = (
        f"const d = await import({json.dumps(module_url)});\n"
        f"const names = {json.dumps(EXPORTED_TABLES)};\n"
        "const missing = names.filter((n) => !(n in d));\n"
        "if (missing.length) { console.error('Missing exports: ' + missing.join(', ')); process.exit(2); }\n"
        "process.stdout.write(JSON.stringify(Object.fromEntries(names.map((n) => [n, d[n]]))));\n"
    )
    env = os.environ.copy()
    env["PATH"] = f"/Users/alibegov/.nvm/versions/node/v20.20.2/bin:{env.get('PATH', '')}"
    res = subprocess.run(
        ["node", "--input-type=module", "-e", js_eval_script],
        capture_output=True,
        text=True,
        env=env,
        check=True,
    )
    return json.loads(res.stdout)


def write_ue5_datatable(table_name: str, rows: list[dict], fieldnames: list[str]) -> None:
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    json_path = os.path.join(OUTPUT_DIR, f"{table_name}.json")
    csv_path = os.path.join(OUTPUT_DIR, f"{table_name}.csv")

    with open(json_path, "w", encoding="utf-8") as jf:
        json.dump(rows, jf, ensure_ascii=False, indent=2)

    with open(csv_path, "w", encoding="utf-8", newline="") as cf:
        writer = csv.DictWriter(cf, fieldnames=fieldnames)
        writer.writeheader()
        for r in rows:
            flat_row = {}
            for k in fieldnames:
                v = r.get(k, "")
                if isinstance(v, (dict, list)):
                    flat_row[k] = json.dumps(v, ensure_ascii=False)
                else:
                    flat_row[k] = v
            writer.writerow(flat_row)

    print(f"[OK] {table_name}: {len(rows)} rows -> {json_path} & {csv_path}")


def main():
    raw = extract_js_constants_via_node(CAMPAIGN_DATA_PATH)

    # 1. DT_Naibates_1845 (FNaibateRegionRow)
    naibates_rows = []
    for n in raw["INITIAL_NAIBATES"]:
        # Перевод 2D координат карты в мировые координаты Landscape UE 5.5 (масштаб см)
        wx = float(n["coords"]["x"]) * 100.0
        wy = float(n["coords"]["y"]) * 100.0
        wz = float(n["slope"]) * 25.0
        naibates_rows.append({
            "Name": n["id"],
            "NaibateID": n["id"],
            "RegionName": n["name"],
            "GeographicSubregion": n["region"],
            "NaibName": n["naibName"],
            "NaibTitle": n["naibTitle"],
            "HistoricalBio": n["bio"],
            "WorldCoordinates": f"(X={wx:.1f},Y={wy:.1f},Z={wz:.1f})",
            "BaseTravelTurns": n["travelTurns"],
            "SlopeDegrees": float(n["slope"]),
            "TerraceYieldPercent": float(n["terraceYield"]),
            "bPastureAccessOpen": bool(n["pastureAccess"]),
            "GarrisonInfantry": int(n["garrison"]),
            "MurtazekCavalry": int(n["murtazeks"]),
            "GunpowderPoods": int(n["gunpowder"]),
            "ProvisionsMeasures": int(n["provisions"]),
            "ImperialPressure": float(n["imperialPressure"]),
            "bUnderSiege": bool(n["underSiege"]),
            "Traits": {
                "Iman": float(n["traits"]["iman"]),
                "Courage": float(n["traits"]["courage"]),
                "Greed": float(n["traits"]["greed"]),
                "Pride": float(n["traits"]["pride"]),
            },
            "OrdersAwarded": n["ordersAwarded"],
        })
    write_ue5_datatable(
        "DT_Naibates_1845",
        naibates_rows,
        [
            "Name", "NaibateID", "RegionName", "GeographicSubregion", "NaibName",
            "NaibTitle", "HistoricalBio", "WorldCoordinates", "BaseTravelTurns",
            "SlopeDegrees", "TerraceYieldPercent", "bPastureAccessOpen",
            "GarrisonInfantry", "MurtazekCavalry", "GunpowderPoods",
            "ProvisionsMeasures", "ImperialPressure", "bUnderSiege",
            "Traits", "OrdersAwarded"
        ],
    )

    # 2. DT_ShamilNizams (FShamilNizamRow)
    pillar_map = {
        "judicial": "Judicial",
        "military": "Military",
        "tax": "Tax",
        "family": "Family",
    }
    nizam_rows = []
    for niz in raw["INITIAL_NIZAMS"]:
        mods = niz["modifiers"]
        nizam_rows.append({
            "Name": niz["id"],
            "NizamID": niz["id"],
            "Pillar": pillar_map.get(niz["pillar"], "Judicial"),
            "Title": niz["title"],
            "YearAndLocation": niz["year"],
            "HistoricalText": niz["historicalText"],
            "CostAuthority": float(niz["costAuthority"]),
            "CostSilver": int(niz["costSilver"]),
            "bEnacted": bool(niz["enacted"]),
            "StressReduction": float(mods["stressReduction"]),
            "GlobalImanBonus": float(mods["globalImanBonus"]),
            "GreedPenaltyReductionPercent": float(mods["greedPenaltyReduction"]),
            "PridePenaltyReductionPercent": float(mods["pridePenaltyReduction"]),
            "PowderPerTurnBonus": int(mods["powderPerTurnBonus"]),
            "ProvisionsPerTurnBonus": int(mods["provisionsPerTurnBonus"]),
            "SilverPerTurnBonus": int(mods["silverPerTurnBonus"]),
        })
    write_ue5_datatable(
        "DT_ShamilNizams",
        nizam_rows,
        [
            "Name", "NizamID", "Pillar", "Title", "YearAndLocation", "HistoricalText",
            "CostAuthority", "CostSilver", "bEnacted", "StressReduction",
            "GlobalImanBonus", "GreedPenaltyReductionPercent",
            "PridePenaltyReductionPercent", "PowderPerTurnBonus",
            "ProvisionsPerTurnBonus", "SilverPerTurnBonus"
        ],
    )

    # 3. DT_ShamilOrders (FShamilOrderRow)
    order_rows = []
    for o in raw["SHAMIL_ORDERS"]:
        order_rows.append({
            "Name": o["id"],
            "OrderID": o["id"],
            "OrderName": o["name"],
            "ArabicMotto": o["arabicMotto"],
            "CraftDescription": o["shape"],
            "SilverCost": int(o["silverCost"]),
            "ImanBonus": float(o["imanBonus"]),
            "PrideReduction": float(o["prideReduction"]),
        })
    write_ue5_datatable(
        "DT_ShamilOrders",
        order_rows,
        ["Name", "OrderID", "OrderName", "ArabicMotto", "CraftDescription", "SilverCost", "ImanBonus", "PrideReduction"],
    )

    # 4. DT_OttomanDiplomacy (FOttomanDiplomacyRow)
    ottoman_rows = []
    for opt in raw["OTTOMAN_OPTIONS"]:
        ottoman_rows.append({
            "Name": opt["id"],
            "OptionID": opt["id"],
            "Title": opt["title"],
            "Description": opt["desc"],
            "CostSilver": int(opt["costSilver"]),
            "RewardPowderPoods": int(opt["rewardPowder"]),
            "RewardSilverRubles": int(opt["rewardSilver"]),
            "RewardSupportPercent": float(opt["rewardSupport"]),
        })
    write_ue5_datatable(
        "DT_OttomanDiplomacy",
        ottoman_rows,
        ["Name", "OptionID", "Title", "Description", "CostSilver", "RewardPowderPoods", "RewardSilverRubles", "RewardSupportPercent"],
    )

    # 5. DT_CampaignScenarios (FCampaignScenarioRow)
    doctrine_by_idx = {
        0: "VorontsovDeepThrust",
        1: "ArgutinskySiegeRam",
        2: "FreytagFlyingColumns",
        3: "EvdokimovForestAxe",
    }
    scenario_rows = []
    for sc in raw["CAMPAIGN_SCENARIOS"]:
        res = sc["initialResources"]
        scenario_rows.append({
            "Name": sc["id"],
            "ScenarioID": sc["id"],
            "YearLabel": sc["yearLabel"],
            "Subtitle": sc["subtitle"],
            "GoalDescription": sc["goalDesc"],
            "InitialGunpowderPoods": int(res["gunpowder"]),
            "InitialProvisionsMeasures": int(res["provisions"]),
            "InitialSilverRubles": int(res["silver"]),
            "InitialAuthorityPercent": float(res["authority"]),
            "InitialOttomanSupportPercent": float(res["ottomanSupport"]),
            "PressureModifier": float(sc["pressureModifier"]),
            "StartingGeneralDoctrine": doctrine_by_idx.get(sc["generalIdx"], "VorontsovDeepThrust"),
        })
    write_ue5_datatable(
        "DT_CampaignScenarios",
        scenario_rows,
        [
            "Name", "ScenarioID", "YearLabel", "Subtitle", "GoalDescription",
            "InitialGunpowderPoods", "InitialProvisionsMeasures", "InitialSilverRubles",
            "InitialAuthorityPercent", "InitialOttomanSupportPercent",
            "PressureModifier", "StartingGeneralDoctrine"
        ],
    )

    # 6. DT_Tactical3DTerrains (FTactical3DTerrainRow)
    terrain_rows = []
    for ter in raw["TACTICAL_3D_TERRAINS"]:
        bmode = "ForestSplineAmbush" if ter["id"] == "dargo_1845" else "MountainSiegeCutaway"
        terrain_rows.append({
            "Name": ter["id"],
            "TerrainID": ter["id"],
            "Title": ter["title"],
            "Subtitle": ter["subtitle"],
            "BattleMode": bmode,
            "CliffSteepness": float(ter["cliffSteepness"]),
            "GorgeDepth": float(ter["gorgeDepth"]),
            "TerraceSteps": int(ter["terraceSteps"]),
            "ElevationLabel": ter["elevationMeters"],
            "DeadZoneAngleDegrees": float(ter["deadZoneAngleDeg"]),
        })
    write_ue5_datatable(
        "DT_Tactical3DTerrains",
        terrain_rows,
        [
            "Name", "TerrainID", "Title", "Subtitle", "BattleMode",
            "CliffSteepness", "GorgeDepth", "TerraceSteps",
            "ElevationLabel", "DeadZoneAngleDegrees"
        ],
    )

    # 7. DT_SplineAmbushSegments (FSplineAmbushSegmentRow)
    spline_rows = []
    for seg in raw["INITIAL_SPLINE_SEGMENTS"]:
        sx = float(seg["coords"]["x"]) * 100.0
        sy = float(seg["coords"]["y"]) * 100.0
        spline_rows.append({
            "Name": seg["id"],
            "SegmentID": seg["id"],
            "SegmentName": seg["name"],
            "ElevationLabel": seg["elevation"],
            "WidthDescription": seg["widthDesc"],
            "InitialAbatisBarricades": int(seg["barricades"]),
            "InitialAmbushSquads": int(seg["ambushSquads"]),
            "MapCoordinates": f"(X={sx:.1f},Y={sy:.1f},Z=0.0)",
        })
    write_ue5_datatable(
        "DT_SplineAmbushSegments",
        spline_rows,
        [
            "Name", "SegmentID", "SegmentName", "ElevationLabel",
            "WidthDescription", "InitialAbatisBarricades",
            "InitialAmbushSquads", "MapCoordinates"
        ],
    )

    # 8. DT_HistoricalCrises (FHistoricalCrisisRow — объединяет судебные казусы и исторические развилки)
    crisis_rows = []
    for c in raw["INITIAL_COURT_CASES"]:
        opt_a = c["options"][0]
        opt_b = c["options"][1]
        crisis_rows.append({
            "Name": c["id"],
            "CrisisID": c["id"],
            "YearLabel": "1845 г. (Диван-хана)",
            "Title": c["title"],
            "HistoricalContext": c["description"],
            "OptionALabel": opt_a["label"],
            "OptionAPowderDelta": int(opt_a.get("powderDelta", 0)),
            "OptionASilverDelta": int(opt_a.get("silverDelta", 0)),
            "OptionAProvisionsDelta": int(opt_a.get("provisionsDelta", 0)),
            "OptionAAuthorityDelta": float(opt_a.get("authorityDelta", 0)),
            "OptionATargetNaibateID": opt_a.get("targetNaibId", "khunzakh"),
            "OptionAImanDelta": float(opt_a.get("imanDelta", 0)),
            "OptionAPrideDelta": float(opt_a.get("prideDelta", 0)),
            "OptionBLabel": opt_b["label"],
            "OptionBPowderDelta": int(opt_b.get("powderDelta", 0)),
            "OptionBSilverDelta": int(opt_b.get("silverDelta", 0)),
            "OptionBProvisionsDelta": int(opt_b.get("provisionsDelta", 0)),
            "OptionBAuthorityDelta": float(opt_b.get("authorityDelta", 0)),
            "OptionBTargetNaibateID": opt_b.get("targetNaibId", "khunzakh"),
            "OptionBImanDelta": float(opt_b.get("imanDelta", 0)),
            "OptionBPrideDelta": float(opt_b.get("prideDelta", 0)),
        })
    for c in raw["INITIAL_HISTORICAL_CRISES"]:
        opt_a = c["options"][0]
        opt_b = c["options"][1]
        crisis_rows.append({
            "Name": c["id"],
            "CrisisID": c["id"],
            "YearLabel": c["year"],
            "Title": c["title"],
            "HistoricalContext": c["historicalContext"],
            "OptionALabel": opt_a["label"],
            "OptionAPowderDelta": int(opt_a.get("powderDelta", 0)),
            "OptionASilverDelta": int(opt_a.get("silverDelta", 0)),
            "OptionAProvisionsDelta": int(opt_a.get("provisionsDelta", 0)),
            "OptionAAuthorityDelta": float(opt_a.get("authorityDelta", 0)),
            "OptionATargetNaibateID": opt_a.get("targetNaibId", "khunzakh"),
            "OptionAImanDelta": float(opt_a.get("imanDelta", 0)),
            "OptionAPrideDelta": float(opt_a.get("prideDelta", 0)),
            "OptionBLabel": opt_b["label"],
            "OptionBPowderDelta": int(opt_b.get("powderDelta", 0)),
            "OptionBSilverDelta": int(opt_b.get("silverDelta", 0)),
            "OptionBProvisionsDelta": int(opt_b.get("provisionsDelta", 0)),
            "OptionBAuthorityDelta": float(opt_b.get("authorityDelta", 0)),
            "OptionBTargetNaibateID": opt_b.get("targetNaibId", "khunzakh"),
            "OptionBImanDelta": float(opt_b.get("imanDelta", 0)),
            "OptionBPrideDelta": float(opt_b.get("prideDelta", 0)),
        })
    write_ue5_datatable(
        "DT_HistoricalCrises",
        crisis_rows,
        [
            "Name", "CrisisID", "YearLabel", "Title", "HistoricalContext",
            "OptionALabel", "OptionAPowderDelta", "OptionASilverDelta",
            "OptionAProvisionsDelta", "OptionAAuthorityDelta",
            "OptionATargetNaibateID", "OptionAImanDelta", "OptionAPrideDelta",
            "OptionBLabel", "OptionBPowderDelta", "OptionBSilverDelta",
            "OptionBProvisionsDelta", "OptionBAuthorityDelta",
            "OptionBTargetNaibateID", "OptionBImanDelta", "OptionBPrideDelta"
        ],
    )


if __name__ == "__main__":
    main()
