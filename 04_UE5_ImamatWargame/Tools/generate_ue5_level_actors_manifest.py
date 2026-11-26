#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
IMAMAT: DIVAN-KHANA — UE5.5 Level Actors & Spline Spawn Manifest Generator (Milestone M16)
Reads the 4 actual 16-bit SRTM .r16 heightmaps (2017x2017) and UE5_Landscape_Import_Manifest.json
to compute exact 3D World-Space Transforms (X, Y, Z in cm, Pitch, Yaw, Roll in deg) for:
  - ADivanKhanaTablePawn (Diegetic Command Table & Camera Rig)
  - ATacticalSiegeManager (Bastions, Safarov Copper Basin Sonar Nodes, Imperial Siege Batteries, Milyutin Cutaway Plane)
  - AForestSplineAmbushController (12 3D USplineComponent Control Points + Abatis Barricades)
  - ACineCameraActor (6 Sequencer Keyframe Shots for the 60-Second Steam Trailer)

Outputs:
  04_UE5_ImamatWargame/Content/Heightmaps/UE5_Level_Actors_Spawn_Manifest.json
"""

import json
import math
import pathlib
import struct
from datetime import datetime, timezone

ROOT_DIR = pathlib.Path(__file__).resolve().parents[2]
HM_DIR = ROOT_DIR / "04_UE5_ImamatWargame" / "Content" / "Heightmaps"
GRID_SIZE = 2017


def sample_r16_uint16(r16_path: pathlib.Path, u_norm: float, v_norm: float) -> int:
    ix = max(0, min(GRID_SIZE - 1, int(round(u_norm * (GRID_SIZE - 1)))))
    iy = max(0, min(GRID_SIZE - 1, int(round(v_norm * (GRID_SIZE - 1)))))
    byte_offset = (iy * GRID_SIZE + ix) * 2
    with r16_path.open("rb") as f:
        f.seek(byte_offset)
        raw = f.read(2)
        if len(raw) < 2:
            return 32768
        return struct.unpack("<H", raw)[0]


def grid_to_ue5_world_cm(u_norm: float, v_norm: float, sample_u16: int, scale: dict) -> dict:
    sx = float(scale["ScaleX"])
    sy = float(scale["ScaleY"])
    sz = float(scale["ScaleZ"])
    # Center landscape at (0, 0) in X/Y; UE5 16-bit heightmap neutral is 32768, vertical step = ScaleZ / 128.0 cm
    half_span = (GRID_SIZE - 1) * 0.5
    ix = u_norm * (GRID_SIZE - 1)
    iy = v_norm * (GRID_SIZE - 1)
    world_x = round((ix - half_span) * sx, 1)
    world_y = round((iy - half_span) * sy, 1)
    world_z = round(((sample_u16 - 32768) * sz) / 128.0, 1)
    return {"X": world_x, "Y": world_y, "Z": world_z, "rawHeightU16": sample_u16}


def build_arena_actors(arena_spec: dict) -> dict:
    r16_rel = arena_spec["files"]["heightmap16BitRAW"]
    r16_path = ROOT_DIR / "04_UE5_ImamatWargame" / r16_rel
    scale = arena_spec["ue5LandscapeScale"]
    cutaway = arena_spec["milyutinCutawayShader"]

    def pt(u: float, v: float, z_offset_cm: float = 0.0, pitch: float = 0.0, yaw: float = 0.0, roll: float = 0.0):
        u16 = sample_r16_uint16(r16_path, u, v)
        w = grid_to_ue5_world_cm(u, v, u16, scale)
        w["Z"] = round(w["Z"] + z_offset_cm, 1)
        return {
            "gridUV": [round(u, 4), round(v, 4)],
            "locationCm": {"X": w["X"], "Y": w["Y"], "Z": w["Z"]},
            "rotationDeg": {"Pitch": round(pitch, 1), "Yaw": round(yaw, 1), "Roll": round(roll, 1)},
            "rawHeightU16": w["rawHeightU16"],
        }

    # 1. Diegetic Command Post (ADivanKhanaTablePawn) on the high ridge overlooking the arena
    table_pawn = {
        "actorClass": "/Script/ImamatWargame.DivanKhanaTablePawn",
        "actorLabel": f"BP_DivanKhanaTable_{arena_spec['arenaID']}",
        "transform": pt(0.52, 0.22, z_offset_cm=185.0, pitch=-14.0, yaw=90.0),
        "components": {
            "CandlePointLightIntensityLumens": 420.0,
            "MapParchmentMesh": "SM_DivanMapTable_Oak_1845",
            "SilverSignetStampSocket": "Socket_ShamilRing_Octagonal",
        },
    }

    # 2. Siege Manager & Safarov Counter-Mine Acoustic Nodes (ATacticalSiegeManager)
    siege_manager = {
        "actorClass": "/Script/ImamatWargame.TacticalSiegeManager",
        "actorLabel": f"BP_TacticalSiegeManager_{arena_spec['arenaID']}",
        "citadelCenterTransform": pt(0.50, 0.48, z_offset_cm=120.0, yaw=cutaway["defaultPlaneYaw"]),
        "milyutinCutawayPlane": {
            "enabledByDefault": cutaway["enabledByDefault"],
            "planeOriginCm": pt(0.50, 0.48, z_offset_cm=0.0)["locationCm"],
            "planeNormal": [
                round(math.cos(math.radians(cutaway["defaultPlaneYaw"])), 4),
                round(math.sin(math.radians(cutaway["defaultPlaneYaw"])), 4),
                0.0,
            ],
            "hlslShaderPath": cutaway["hlslInclude"],
        },
        "safarovBastionSectors": [
            {"sectorId": "Bastion_North_Gabion", "transform": pt(0.46, 0.42, z_offset_cm=80.0, yaw=-45.0), "gabionIntegrityPct": 100.0},
            {"sectorId": "Bastion_East_LogBlindage", "transform": pt(0.55, 0.47, z_offset_cm=60.0, yaw=15.0), "gabionIntegrityPct": 100.0},
            {"sectorId": "Bastion_South_SurkhayTower", "transform": pt(0.49, 0.56, z_offset_cm=140.0, yaw=110.0), "gabionIntegrityPct": 100.0},
        ],
        "safarovCopperBasinSonarNodes": [
            {"nodeId": "Sonar_Gallery_Alpha", "transform": pt(0.48, 0.44, z_offset_cm=-320.0), "optimalCamoufletRadiusMeters": 18.5},
            {"nodeId": "Sonar_Gallery_Beta", "transform": pt(0.53, 0.51, z_offset_cm=-290.0), "optimalCamoufletRadiusMeters": 16.0},
        ],
        "imperialSiegeBatteries": [
            {"batteryId": "Battery_12Pdr_Grabbe_Left", "transform": pt(0.28, 0.30, z_offset_cm=45.0, yaw=42.0), "gunsCount": 4},
            {"batteryId": "Battery_Mortar_Argutinsky_Center", "transform": pt(0.31, 0.52, z_offset_cm=50.0, yaw=8.0), "gunsCount": 6},
            {"batteryId": "Battery_MountainUnicorn_Right", "transform": pt(0.35, 0.72, z_offset_cm=40.0, yaw=-36.0), "gunsCount": 4},
        ],
    }

    # 3. 12-Point 3D Canyon/Forest Road Spline & Abatis Ambush Nodes (AForestSplineAmbushController)
    spline_points = []
    for idx in range(12):
        t_step = idx / 11.0
        u_coord = 0.14 + t_step * 0.72
        v_coord = 0.50 + 0.16 * math.sin(t_step * math.pi * 2.0)
        yaw_tangent = math.degrees(math.atan2(0.16 * 2.0 * math.pi * math.cos(t_step * math.pi * 2.0), 0.72))
        sp = pt(u_coord, v_coord, z_offset_cm=25.0, yaw=yaw_tangent)
        sp["splinePointIndex"] = idx
        sp["normalizedDistance"] = round(t_step, 3)
        spline_points.append(sp)

    spline_controller = {
        "actorClass": "/Script/ImamatWargame.ForestSplineAmbushController",
        "actorLabel": f"BP_ForestSplineAmbush_{arena_spec['arenaID']}",
        "splineControlPointsCount": len(spline_points),
        "splineControlPoints": spline_points,
        "abatisFelledBeechBarricades": [
            {"abatisId": "Abatis_Chokepoint_1", "splineNormalizedRange": [0.24, 0.31], "transform": spline_points[3]},
            {"abatisId": "Abatis_Chokepoint_2", "splineNormalizedRange": [0.52, 0.60], "transform": spline_points[6]},
            {"abatisId": "Abatis_Chokepoint_3", "splineNormalizedRange": [0.76, 0.84], "transform": spline_points[9]},
        ],
        "murtazekFlankAmbushZones": [
            {"zoneId": "Ambush_HighSlope_North", "transform": pt(0.38, 0.34, z_offset_cm=110.0, pitch=-18.0, yaw=82.0), "gazyrVolleySlots": 18},
            {"zoneId": "Ambush_GorgeLedge_Center", "transform": pt(0.56, 0.64, z_offset_cm=95.0, pitch=-15.0, yaw=-78.0), "gazyrVolleySlots": 18},
            {"zoneId": "Ambush_RearGuard_East", "transform": pt(0.74, 0.41, z_offset_cm=130.0, pitch=-21.0, yaw=105.0), "gazyrVolleySlots": 18},
        ],
    }

    return {
        "arenaID": arena_spec["arenaID"],
        "assetName": arena_spec["assetName"],
        "title": arena_spec["title"],
        "divanKhanaCommandPawn": table_pawn,
        "tacticalSiegeManager": siege_manager,
        "forestSplineAmbushController": spline_controller,
    }


def main():
    landscape_manifest_path = HM_DIR / "UE5_Landscape_Import_Manifest.json"
    landscape_manifest = json.loads(landscape_manifest_path.read_text(encoding="utf-8"))

    arenas_output = []
    for arena_spec in landscape_manifest.get("generatedTacticalArenas", []):
        arenas_output.append(build_arena_actors(arena_spec))

    sequencer_trailer_shots = [
        {
            "shotIndex": 1,
            "timecode": "00:00 - 00:10",
            "titleRu": "Кадр 1: Очаг Диван-ханы и карта Кавказа при свечах",
            "titleEn": "Shot 1: Divan-Khana Hearth & Candlelit Caucasus Map",
            "targetArenaID": "tactical_dargo_ichkeria",
            "focalLengthMm": 35.0,
            "apertureFStop": 2.0,
            "audioLayerCue": "Hearth_And_Vedeno_Watermill_Layer3",
        },
        {
            "shotIndex": 2,
            "timecode": "00:10 - 00:20",
            "titleRu": "Кадр 2: Оттиск восьмиугольного перстня Шамиля и выезд чапара",
            "titleEn": "Shot 2: Shamil's Octagonal Signet Stamp & Chapar Dispatch",
            "targetArenaID": "tactical_ahulgo_citadel",
            "focalLengthMm": 50.0,
            "apertureFStop": 2.4,
            "audioLayerCue": "WaxSeal_And_AhkTash_Gorge_Wind_Layer1",
        },
        {
            "shotIndex": 3,
            "timecode": "00:20 - 00:32",
            "titleRu": "Кадр 3: 3D-разрез скалы Милютина и медный таз Сафарова (Салты/Чох)",
            "titleEn": "Shot 3: Milyutin 3D Rock Cutaway & Safarov's Copper Basin Sonar",
            "targetArenaID": "tactical_salti_siege",
            "focalLengthMm": 28.0,
            "apertureFStop": 2.8,
            "audioLayerCue": "Safarov_CopperBasin_Sonar_Layer2",
        },
        {
            "shotIndex": 4,
            "timecode": "00:32 - 00:44",
            "titleRu": "Кадр 4: Буковая засека в Ичкерии и залп 18 нагрудных газырей",
            "titleEn": "Shot 4: Ichkeria Beech Abatis Ambush & 18-Gazyr Volley",
            "targetArenaID": "tactical_dargo_ichkeria",
            "focalLengthMm": 24.0,
            "apertureFStop": 2.8,
            "audioLayerCue": "Gazyr_Volley_And_Shashka_Charge",
        },
        {
            "shotIndex": 5,
            "timecode": "00:44 - 00:52",
            "titleRu": "Кадр 5: Кодекс Низамов, суд по Шариату и бастионы Гергебиля",
            "titleEn": "Shot 5: Code of Nizams, Sharia Court & Gergebil Bastions",
            "targetArenaID": "tactical_gergebil_bastion",
            "focalLengthMm": 40.0,
            "apertureFStop": 2.2,
            "audioLayerCue": "Nizam_Decree_And_Artillery_Echo",
        },
        {
            "shotIndex": 6,
            "timecode": "00:52 - 01:00",
            "titleRu": "Кадр 6: Цитадель Верхнего Гуниба и призыв Добавить в Желаемое в Steam",
            "titleEn": "Shot 6: Upper Gunib Citadel Reveal & Steam Wishlist Call-to-Action",
            "targetArenaID": "tactical_ahulgo_citadel",
            "focalLengthMm": 18.0,
            "apertureFStop": 4.0,
            "audioLayerCue": "Full_3Layer_Caucasus_Chord_Crescendo",
        },
    ]

    manifest = {
        "schemaVersion": "ImamatUE5_LevelActorsManifest_v1.6",
        "generatedAtUtc": datetime.now(timezone.utc).isoformat(),
        "engineTarget": "Unreal Engine 5.5 (C++20 Native Actors + LevelSequence)",
        "arenasCount": len(arenas_output),
        "totalSampledSplinePoints": sum(len(a["forestSplineAmbushController"]["splineControlPoints"]) for a in arenas_output),
        "sequencerTrailerShotsCount": len(sequencer_trailer_shots),
        "sequencerTrailerShots": sequencer_trailer_shots,
        "tacticalArenas": arenas_output,
    }

    out_path = HM_DIR / "UE5_Level_Actors_Spawn_Manifest.json"
    out_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")

    print("=" * 88)
    print(" UE5.5 LEVEL ACTORS & SPLINE SPAWN MANIFEST GENERATOR — MILESTONE M16")
    print("=" * 88)
    for a in arenas_output:
        z_table = a["divanKhanaCommandPawn"]["transform"]["locationCm"]["Z"]
        z_citadel = a["tacticalSiegeManager"]["citadelCenterTransform"]["locationCm"]["Z"]
        print(
            f"[OK] {a['arenaID']:26s} -> Table Z={z_table:8.1f} cm | Citadel Z={z_citadel:8.1f} cm | "
            f"12 Spline Pts + 3 Bastions + 2 Sonar Nodes"
        )
    print(f"[OK] Saved UE5 Level Actors Manifest ({out_path.stat().st_size:,} bytes) -> {out_path}")
    print("=" * 88)


if __name__ == "__main__":
    main()
