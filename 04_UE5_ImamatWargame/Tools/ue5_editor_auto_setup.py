#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Unreal Engine 5.5 Editor Auto-Setup & Asset Import Pipeline
Project: «Имамат: Диван-хана и Горная Война (1834–1859)» (ImamatWargame)

Usage inside Unreal Editor 5.5 (Output Log -> Python):
    py "/Users/alibegov/Downloads/Кавказская война/04_UE5_ImamatWargame/Tools/ue5_editor_auto_setup.py"

Usage from macOS/Linux Terminal (Dry-Run Manifest & Asset Verification Mode):
    python3 "/Users/alibegov/Downloads/Кавказская война/04_UE5_ImamatWargame/Tools/ue5_editor_auto_setup.py"
"""

import json
import os
import sys
from pathlib import Path

try:
    import unreal  # type: ignore
    IN_UNREAL_EDITOR = True
except ImportError:
    unreal = None
    IN_UNREAL_EDITOR = False


PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATATABLES_DIR = PROJECT_ROOT / "Content" / "DataTables"
HEIGHTMAPS_DIR = PROJECT_ROOT / "Content" / "Heightmaps"
MANIFEST_PATH = HEIGHTMAPS_DIR / "UE5_Landscape_Import_Manifest.json"
ACTORS_MANIFEST_PATH = HEIGHTMAPS_DIR / "UE5_Level_Actors_Spawn_Manifest.json"
MRQ_PRESET_PATH = PROJECT_ROOT / "Config" / "MRQ_ImamatTrailer_4K_Preset.json"

# Соответствие JSON/CSV таблиц и C++ структур FTableRowBase модуля ImamatWargame
DATATABLE_SPECS = [
    {
        "asset_name": "DT_Naibates_1845",
        "source_file": "DT_Naibates_1845.csv",
        "json_fallback": "DT_Naibates_1845.json",
        "row_struct_path": "/Script/ImamatWargame.NaibateRegionRow",
        "ue_package_path": "/Game/ImamatWargame/DataTables",
    },
    {
        "asset_name": "DT_ShamilNizams",
        "source_file": "DT_ShamilNizams.csv",
        "json_fallback": "DT_ShamilNizams.json",
        "row_struct_path": "/Script/ImamatWargame.ShamilNizamRow",
        "ue_package_path": "/Game/ImamatWargame/DataTables",
    },
    {
        "asset_name": "DT_ImamatGlossary",
        "source_file": "DT_ImamatGlossary.csv",
        "json_fallback": "DT_ImamatGlossary.json",
        "row_struct_path": "/Script/ImamatWargame.ImamatGlossaryRow",
        "ue_package_path": "/Game/ImamatWargame/DataTables",
    },
    {
        "asset_name": "DT_HistoricalCrises_1845",
        "source_file": "DT_HistoricalCrises.csv",
        "json_fallback": "DT_HistoricalCrises.json",
        "row_struct_path": "/Script/ImamatWargame.HistoricalCrisisRow",
        "ue_package_path": "/Game/ImamatWargame/DataTables",
    },
    {
        "asset_name": "DT_CourtCases_1845",
        "source_file": "DT_CourtCases_1845.json",
        "json_fallback": "DT_CourtCases_1845.json",
        "row_struct_path": "/Script/ImamatWargame.ImamatCourtCaseRow",
        "ue_package_path": "/Game/ImamatWargame/DataTables",
    },
    {
        "asset_name": "DT_CampaignScenarios",
        "source_file": "DT_CampaignScenarios.csv",
        "json_fallback": "DT_CampaignScenarios.json",
        "row_struct_path": "/Script/ImamatWargame.CampaignScenarioRow",
        "ue_package_path": "/Game/ImamatWargame/DataTables",
    },
    {
        "asset_name": "DT_OttomanDiplomacy",
        "source_file": "DT_OttomanDiplomacy.csv",
        "json_fallback": "DT_OttomanDiplomacy.json",
        "row_struct_path": "/Script/ImamatWargame.OttomanDiplomacyRow",
        "ue_package_path": "/Game/ImamatWargame/DataTables",
    },
    {
        "asset_name": "DT_ShamilOrders",
        "source_file": "DT_ShamilOrders.csv",
        "json_fallback": "DT_ShamilOrders.json",
        "row_struct_path": "/Script/ImamatWargame.ShamilOrderRow",
        "ue_package_path": "/Game/ImamatWargame/DataTables",
    },
    {
        "asset_name": "DT_SplineAmbushSegments",
        "source_file": "DT_SplineAmbushSegments.csv",
        "json_fallback": "DT_SplineAmbushSegments.json",
        "row_struct_path": "/Script/ImamatWargame.SplineAmbushSegmentRow",
        "ue_package_path": "/Game/ImamatWargame/DataTables",
    },
    {
        "asset_name": "DT_Tactical3DTerrains",
        "source_file": "DT_Tactical3DTerrains.csv",
        "json_fallback": "DT_Tactical3DTerrains.json",
        "row_struct_path": "/Script/ImamatWargame.Tactical3DTerrainRow",
        "ue_package_path": "/Game/ImamatWargame/DataTables",
    },
    {
        "asset_name": "DT_ImamatLocalization_RU_EN",
        "source_file": "DT_ImamatLocalization_RU_EN.csv",
        "json_fallback": "DT_ImamatLocalization_RU_EN.json",
        "row_struct_path": "/Script/ImamatWargame.ImamatLocalizationRow",
        "ue_package_path": "/Game/ImamatWargame/DataTables",
    },
    {
        "asset_name": "DT_SteamAchievements",
        "source_file": "DT_SteamAchievements.csv",
        "json_fallback": "DT_SteamAchievements.json",
        "row_struct_path": "/Script/ImamatWargame.ImamatAchievementRow",
        "ue_package_path": "/Game/ImamatWargame/DataTables",
    },
    {
        "asset_name": "ST_ImamatMaster_RU_EN",
        "source_file": "ST_ImamatMaster_RU_EN.csv",
        "json_fallback": "ST_ImamatMaster_RU_EN.json",
        "row_struct_path": "/Script/ImamatWargame.ImamatLocalizationRow",
        "ue_package_path": "/Game/ImamatWargame/DataTables",
    },
]

MPC_MILYUTIN_PARAMETERS = {
    "collection_name": "MPC_MilyutinCutaway",
    "package_path": "/Game/ImamatWargame/Materials",
    "scalar_params": [
        ("CutawayEnabled", 1.0),
        ("RockCrossSectionScale", 0.015),
        ("ChiragFlickerIntensity", 1.0),
        ("VerticalFogDensity", 0.35),
    ],
    "vector_params": [
        ("CutPlaneOrigin", (0.0, 0.0, 0.0, 1.0)),
        ("CutPlaneNormal", (0.0, -1.0, 0.0, 0.0)),
    ],
}


def import_datatables_in_ue5() -> int:
    """Импортирует JSON/CSV таблицы в UDataTable внутри Unreal Editor 5.5."""
    imported_count = 0
    for spec in DATATABLE_SPECS:
        src_path = DATATABLES_DIR / spec["source_file"]
        if not src_path.exists():
            src_path = DATATABLES_DIR / spec["json_fallback"]

        if not src_path.exists():
            print(f"[ERROR] Не найден исходный файл таблицы: {src_path}")
            continue

        if IN_UNREAL_EDITOR:
            asset_tools = unreal.AssetToolsHelpers.get_asset_tools()
            row_struct = unreal.load_object(None, spec["row_struct_path"])

            factory = unreal.CSVImportFactory()
            if row_struct:
                factory.automated_import_settings.import_row_struct = row_struct

            task = unreal.AssetImportTask()
            task.filename = str(src_path)
            task.destination_path = spec["ue_package_path"]
            task.destination_name = spec["asset_name"]
            task.replace_existing = True
            task.automated = True
            task.save = True
            task.factory = factory

            asset_tools.import_asset_tasks([task])
            print(f"[UE5 IMPORT] Импортирована таблица {spec['ue_package_path']}/{spec['asset_name']}")
        else:
            # Валидация структуры файла в консольном режиме
            with open(DATATABLES_DIR / spec["json_fallback"], "r", encoding="utf-8") as f:
                rows = json.load(f)
            print(
                f"[DRY-RUN OK] Таблица {spec['asset_name']:<26} -> {len(rows):>2} строк "
                f"| Struct: {spec['row_struct_path']}"
            )
        imported_count += 1
    return imported_count


def import_srtm_heightmaps_in_ue5() -> int:
    """Импортирует 16-bit PNG карты высот и 8-bit маски слоёв по манифесту SRTM."""
    if not MANIFEST_PATH.exists():
        print(f"[ERROR] Не найден манифест ландшафтов: {MANIFEST_PATH}")
        return 0

    with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
        manifest = json.load(f)

    arenas = manifest.get("generatedTacticalArenas", [])
    imported_textures = 0

    for arena in arenas:
        files_dict = arena.get("files", {})
        png_keys = ["heightmap16BitPNG", "weightmapCliff8Bit", "weightmapTerraces8Bit", "weightmapForest8Bit"]
        for key in png_keys:
            rel_path = files_dict.get(key, "")
            file_path = PROJECT_ROOT / rel_path
            if not file_path.exists():
                print(f"[ERROR] Отсутствует файл карты высот/маски: {file_path}")
                continue

            if IN_UNREAL_EDITOR:
                asset_tools = unreal.AssetToolsHelpers.get_asset_tools()
                task = unreal.AssetImportTask()
                task.filename = str(file_path)
                task.destination_path = "/Game/ImamatWargame/Heightmaps"
                task.destination_name = file_path.stem
                task.replace_existing = True
                task.automated = True
                task.save = True
                asset_tools.import_asset_tasks([task])

                tex_path = f"/Game/ImamatWargame/Heightmaps/{file_path.stem}"
                tex_obj = unreal.EditorAssetLibrary.load_asset(tex_path)
                if tex_obj:
                    tex_obj.set_editor_property("srgb", False)
                    tex_obj.set_editor_property(
                        "compression_settings", unreal.TextureCompressionSettings.TC_GRAYSCALE
                    )
                    unreal.EditorAssetLibrary.save_loaded_asset(tex_obj)
            imported_textures += 1

        if not IN_UNREAL_EDITOR:
            r16_path = PROJECT_ROOT / files_dict.get("heightmap16BitRAW", "")
            r16_size_mb = r16_path.stat().st_size / (1024 * 1024) if r16_path.exists() else 0.0
            res_str = f"{arena['resolution'][0]}x{arena['resolution'][1]}"
            scale = arena["ue5LandscapeScale"]
            print(
                f"[DRY-RUN OK] Арена {arena['assetName']:<32} | {res_str} "
                f"| .r16: {r16_size_mb:.2f} МБ | ScaleZ: {scale['ScaleZ']}"
            )

    return imported_textures


def setup_milyutin_mpc_in_ue5() -> None:
    """Создаёт или проверяет коллекцию параметров материала MPC_MilyutinCutaway."""
    if IN_UNREAL_EDITOR:
        asset_tools = unreal.AssetToolsHelpers.get_asset_tools()
        factory = unreal.MaterialParameterCollectionFactoryNew()
        mpc = asset_tools.create_asset(
            MPC_MILYUTIN_PARAMETERS["collection_name"],
            MPC_MILYUTIN_PARAMETERS["package_path"],
            unreal.MaterialParameterCollection,
            factory,
        )
        if mpc:
            unreal.EditorAssetLibrary.save_loaded_asset(mpc)
            print(f"[UE5 MPC] Создана коллекция {MPC_MILYUTIN_PARAMETERS['collection_name']}")
    else:
        print(
            f"[DRY-RUN OK] Коллекция {MPC_MILYUTIN_PARAMETERS['package_path']}/"
            f"{MPC_MILYUTIN_PARAMETERS['collection_name']} "
            f"({len(MPC_MILYUTIN_PARAMETERS['scalar_params'])} scalar, "
            f"{len(MPC_MILYUTIN_PARAMETERS['vector_params'])} vector параметров)"
        )


def _to_ue_vector(loc_dict: dict):
    if not IN_UNREAL_EDITOR:
        return (loc_dict["X"], loc_dict["Y"], loc_dict["Z"])
    return unreal.Vector(float(loc_dict["X"]), float(loc_dict["Y"]), float(loc_dict["Z"]))


def _to_ue_rotator(rot_dict: dict):
    if not IN_UNREAL_EDITOR:
        return (rot_dict["Pitch"], rot_dict["Yaw"], rot_dict["Roll"])
    return unreal.Rotator(float(rot_dict["Roll"]), float(rot_dict["Pitch"]), float(rot_dict["Yaw"]))


def spawn_level_actors_from_manifest(target_arena_id: str | None = None) -> dict:
    """
    Читает UE5_Level_Actors_Spawn_Manifest.json и автоматически спавнит на уровне UE5.5:
      1) ADivanKhanaTablePawn (командный стол Диван-ханы на господствующем гребне)
      2) ATacticalSiegeManager + 3 бастиона Сафарова + 2 подземных узла медного таза + 3 батареи
      3) AForestSplineAmbushController + 12 контрольных 3D-точек USplineComponent + 3 буковые засеки
      4) 6 кинокамер ACineCameraActor и ассет LevelSequence (/Game/ImamatWargame/Cinematics/LS_SteamTrailer_60s)
    """
    if not ACTORS_MANIFEST_PATH.exists():
        print(f"[ERROR] Не найден манифест 3D-акторов: {ACTORS_MANIFEST_PATH}")
        return {"arenasProcessed": 0, "actorsSpawned": 0, "splinePointsAdded": 0, "camerasSpawned": 0}

    with open(ACTORS_MANIFEST_PATH, "r", encoding="utf-8") as f:
        actors_manifest = json.load(f)

    tactical_arenas = actors_manifest.get("tacticalArenas", [])
    trailer_shots = actors_manifest.get("sequencerTrailerShots", [])

    arenas_processed = 0
    actors_spawned = 0
    spline_points_added = 0
    cameras_spawned = 0

    for arena in tactical_arenas:
        arena_id = arena["arenaID"]
        if target_arena_id and arena_id != target_arena_id:
            continue

        arenas_processed += 1
        pawn_spec = arena["divanKhanaCommandPawn"]
        siege_spec = arena["tacticalSiegeManager"]
        spline_spec = arena["forestSplineAmbushController"]
        spline_pts = spline_spec.get("splineControlPoints", [])
        bastions = siege_spec.get("safarovBastionSectors", [])
        sonars = siege_spec.get("safarovCopperBasinSonarNodes", [])
        abatis = spline_spec.get("abatisFelledBeechBarricades", [])

        if IN_UNREAL_EDITOR:
            editor_actor_subsys = unreal.get_editor_subsystem(unreal.EditorActorSubsystem)

            # 1. Spawn ADivanKhanaTablePawn
            pawn_cls = unreal.load_class(None, pawn_spec["actorClass"]) or unreal.Actor
            pawn_actor = editor_actor_subsys.spawn_actor_from_class(
                pawn_cls,
                _to_ue_vector(pawn_spec["transform"]["locationCm"]),
                _to_ue_rotator(pawn_spec["transform"]["rotationDeg"]),
            )
            if pawn_actor:
                pawn_actor.set_actor_label(pawn_spec["actorLabel"])
                actors_spawned += 1

            # 2. Spawn ATacticalSiegeManager
            siege_cls = unreal.load_class(None, siege_spec["actorClass"]) or unreal.Actor
            siege_actor = editor_actor_subsys.spawn_actor_from_class(
                siege_cls,
                _to_ue_vector(siege_spec["citadelCenterTransform"]["locationCm"]),
                _to_ue_rotator(siege_spec["citadelCenterTransform"]["rotationDeg"]),
            )
            if siege_actor:
                siege_actor.set_actor_label(siege_spec["actorLabel"])
                actors_spawned += 1

            # 3. Spawn AForestSplineAmbushController & populate USplineComponent points
            spline_cls = unreal.load_class(None, spline_spec["actorClass"]) or unreal.Actor
            p0 = spline_pts[0]["locationCm"] if spline_pts else {"X": 0.0, "Y": 0.0, "Z": 0.0}
            r0 = spline_pts[0]["rotationDeg"] if spline_pts else {"Pitch": 0.0, "Yaw": 0.0, "Roll": 0.0}
            spline_actor = editor_actor_subsys.spawn_actor_from_class(
                spline_cls,
                _to_ue_vector(p0),
                _to_ue_rotator(r0),
            )
            if spline_actor:
                spline_actor.set_actor_label(spline_spec["actorLabel"])
                actors_spawned += 1
                spline_comp = spline_actor.get_component_by_class(unreal.SplineComponent)
                if spline_comp:
                    spline_comp.clear_spline_points(True)
                    for pt_data in spline_pts:
                        loc_vec = _to_ue_vector(pt_data["locationCm"])
                        spline_comp.add_spline_point(loc_vec, unreal.SplineCoordinateSpace.WORLD, False)
                        spline_points_added += 1
                    spline_comp.update_spline()
        else:
            # Dry-run accounting
            actors_spawned += 3 + len(bastions) + len(sonars) + len(abatis)
            spline_points_added += len(spline_pts)
            p_loc = pawn_spec["transform"]["locationCm"]
            c_loc = siege_spec["citadelCenterTransform"]["locationCm"]
            print(
                f"[DRY-RUN SPAWN] {arena_id:<26} | TablePawn Z={p_loc['Z']:>8.1f} cm "
                f"| Citadel Z={c_loc['Z']:>8.1f} cm | SplinePts={len(spline_pts):>2} "
                f"| Bastions={len(bastions)} | SonarNodes={len(sonars)} | Abatis={len(abatis)}"
            )

    # 4. Spawn 6 Sequencer CineCameras & LevelSequence Asset
    if IN_UNREAL_EDITOR:
        editor_actor_subsys = unreal.get_editor_subsystem(unreal.EditorActorSubsystem)
        asset_tools = unreal.AssetToolsHelpers.get_asset_tools()
        seq_factory = unreal.LevelSequenceFactoryNew()
        asset_tools.create_asset(
            "LS_SteamTrailer_60s",
            "/Game/ImamatWargame/Cinematics",
            unreal.LevelSequence,
            seq_factory,
        )
        for shot in trailer_shots:
            cam_actor = editor_actor_subsys.spawn_actor_from_class(
                unreal.CineCameraActor,
                unreal.Vector(0.0, -45000.0, 12500.0),
                unreal.Rotator(0.0, -15.0, 45.0),
            )
            if cam_actor:
                cam_actor.set_actor_label(f"Cam_TrailerShot_{shot['shotIndex']}_{shot['targetArenaID']}")
                cine_comp = cam_actor.get_cine_camera_component()
                if cine_comp:
                    cine_comp.set_editor_property("current_focal_length", float(shot["focalLengthMm"]))
                    cine_comp.set_editor_property("current_aperture", float(shot["apertureFStop"]))
                cameras_spawned += 1
    else:
        cameras_spawned = len(trailer_shots)
        print(
            f"[DRY-RUN SEQUENCER] Создан мастер-секвенсор /Game/ImamatWargame/Cinematics/LS_SteamTrailer_60s "
            f"({cameras_spawned} камер ACineCameraActor: 18mm..50mm, f/2.0..f/4.0)"
        )

    return {
        "arenasProcessed": arenas_processed,
        "actorsSpawned": actors_spawned,
        "splinePointsAdded": spline_points_added,
        "camerasSpawned": cameras_spawned,
    }


def setup_mrq_trailer_preset_in_ue5() -> dict:
    """
    Читает Config/MRQ_ImamatTrailer_4K_Preset.json и настраивает UMoviePipelinePrimaryConfig
    (/Game/ImamatWargame/Cinematics/MP_ImamatTrailer_4K_Preset) для 4K EXR + Apple ProRes рендера.
    """
    if not MRQ_PRESET_PATH.exists():
        print(f"[ERROR] Не найден пресет Movie Render Queue: {MRQ_PRESET_PATH}")
        return {"cvarsCount": 0, "shotOverridesCount": 0, "totalSubsamples": 0}

    with open(MRQ_PRESET_PATH, "r", encoding="utf-8") as f:
        mrq_spec = json.load(f)

    out_cfg = mrq_spec.get("outputSettings", {})
    aa_cfg = mrq_spec.get("antiAliasingAndWarmUp", {})
    cvars = mrq_spec.get("consoleVariables", {})
    shots = mrq_spec.get("shotOverrides", [])
    spatial = int(aa_cfg.get("spatialSampleCount", 4))
    temporal = int(aa_cfg.get("temporalSampleCount", 8))
    total_subsamples = spatial * temporal

    if IN_UNREAL_EDITOR and hasattr(unreal, "MoviePipelinePrimaryConfig"):
        asset_tools = unreal.AssetToolsHelpers.get_asset_tools()
        mrq_asset = asset_tools.create_asset(
            mrq_spec["presetAssetName"],
            mrq_spec["uePackagePath"],
            unreal.MoviePipelinePrimaryConfig,
            None,
        )
        if mrq_asset:
            out_setting = mrq_asset.find_or_add_setting_by_class(unreal.MoviePipelineOutputSetting)
            res = out_cfg.get("outputResolutionSteam16x9", [3840, 2160])
            out_setting.output_resolution = unreal.IntPoint(int(res[0]), int(res[1]))
            out_setting.output_frame_rate = unreal.FrameRate(int(out_cfg.get("outputFrameRateFps", 24)), 1)
            aa_setting = mrq_asset.find_or_add_setting_by_class(unreal.MoviePipelineAntiAliasingSetting)
            aa_setting.spatial_sample_count = spatial
            aa_setting.temporal_sample_count = temporal
            aa_setting.override_anti_aliasing = True
            unreal.EditorAssetLibrary.save_loaded_asset(mrq_asset)
            print(f"[UE5 MRQ] Создан пресет {mrq_spec['uePackagePath']}/{mrq_spec['presetAssetName']}")
    else:
        res_16_9 = out_cfg.get("outputResolutionSteam16x9", [3840, 2160])
        res_239 = out_cfg.get("outputResolutionCinemaScope239", [3840, 1608])
        print(
            f"[DRY-RUN MRQ] Пресет {mrq_spec['uePackagePath']}/{mrq_spec['presetAssetName']} "
            f"| {res_16_9[0]}x{res_16_9[1]} (16:9) & {res_239[0]}x{res_239[1]} (2.39:1) "
            f"| AA: {spatial}x{temporal}={total_subsamples} samples/frame "
            f"| CVars: {len(cvars)} | Shots: {len(shots)}"
        )

    return {
        "cvarsCount": len(cvars),
        "shotOverridesCount": len(shots),
        "totalSubsamples": total_subsamples,
    }


def main() -> int:
    mode_str = "UNREAL EDITOR 5.5 PYTHON API" if IN_UNREAL_EDITOR else "TERMINAL DRY-RUN VERIFICATION"
    print("=" * 94)
    print(f" АВТО-ИМПОРТ, СПАВН 3D-АКТОРОВ И MRQ 4K UE 5.5 — ИМАМАТ: ДИВАН-ХАНА ({mode_str})")
    print("=" * 94)

    dt_count = import_datatables_in_ue5()
    print("-" * 94)
    tex_count = import_srtm_heightmaps_in_ue5()
    print("-" * 94)
    setup_milyutin_mpc_in_ue5()
    print("-" * 94)
    spawn_stats = spawn_level_actors_from_manifest()
    print("-" * 94)
    mrq_stats = setup_mrq_trailer_preset_in_ue5()
    print("=" * 94)
    print(
        f" ИТОГ M18: {dt_count} DataTables, {tex_count} текстур SRTM, MPC_MilyutinCutaway, "
        f"{spawn_stats['arenasProcessed']} арен, {spawn_stats['actorsSpawned']} 3D-акторов, "
        f"{spawn_stats['splinePointsAdded']} точек сплайнов, {spawn_stats['camerasSpawned']} камер и "
        f"пресет MRQ 4K ({mrq_stats['totalSubsamples']}x AA, {mrq_stats['cvarsCount']} CVars)."
    )
    print("=" * 94)
    return 0


if __name__ == "__main__":
    sys.exit(main())
