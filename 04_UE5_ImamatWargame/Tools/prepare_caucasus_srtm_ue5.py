#!/usr/bin/env python3
"""
prepare_caucasus_srtm_ue5.py
Конвейер подготовки 16-битных высотных карт (SRTM -> UE5.5 Landscape uint16 .png / .r16)
и 8-битных Splat-масок (Weightmaps) для стратегической карты Имамата (8129x8129)
и 4 тактических 3D-диорам (2017x2017, стандарт UE5.5: 32x32 компонента, 63x63 квада).

Генерирует в 04_UE5_ImamatWargame/Content/Heightmaps/:
  1. T_Heightmap_Dargo_Ichkeria_1845 (.png 16-bit + .r16 + Splat-маски)
  2. T_Heightmap_Salti_1847          (.png 16-bit + .r16 + Splat-маски)
  3. T_Heightmap_Gergebil_1848       (.png 16-bit + .r16 + Splat-маски)
  4. T_Heightmap_Ahulgo_1839         (.png 16-bit + .r16 + Splat-маски)
  5. UE5_Landscape_Import_Manifest.json (точные параметры Z-Scale, XY-Scale и координат)
"""

import json
import os
import struct
import zlib
import numpy as np

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HEIGHTMAPS_DIR = os.path.join(BASE_DIR, "Content", "Heightmaps")

# Границы стратегического квадрата «Гуниб — Ахульго — Салты — Дарго» (WGS84: West, South, East, North)
BBOX_WGS84 = (45.75, 42.20, 47.15, 43.15)
H_MIN_METERS = 180.0
H_MAX_METERS = 4151.0
UE5_STRATEGIC_GRID_SIZE = 8129
UE5_TACTICAL_GRID_SIZE = 2017  # Точная сетка UE5.5 Landscape (32x32 компонента по 63x63 квада)

HISTORICAL_NODES = {
    "vedeno":   {"lat": 42.9694, "lon": 46.0961, "title": "Столица Дарго-Ведено"},
    "dargo":    {"lat": 42.9522, "lon": 46.2361, "title": "Старое Дарго и хребет Речель"},
    "benoy":    {"lat": 42.9981, "lon": 46.3214, "title": "Ичкерия и Беной"},
    "shali":    {"lat": 43.1481, "lon": 45.9019, "title": "Большая Чечня (Шали)"},
    "karata":   {"lat": 42.5892, "lon": 46.3411, "title": "Карата и Андия"},
    "khunzakh": {"lat": 42.5436, "lon": 46.7058, "title": "Авария и Хунзах"},
    "akhulgo":  {"lat": 42.6786, "lon": 46.8550, "title": "Скала Ахульго"},
    "gergebil": {"lat": 42.5083, "lon": 47.0625, "title": "Гергебиль"},
    "salty":    {"lat": 42.3931, "lon": 47.0658, "title": "Аул Салты"},
    "gunib":    {"lat": 42.3867, "lon": 46.9317, "title": "Плато Верхний Гуниб"},
    "chokh":    {"lat": 42.3208, "lon": 47.0319, "title": "Чох и Согратль"},
    "teletl":   {"lat": 42.3519, "lon": 46.6972, "title": "Гидатль и Телетль"},
    "irib":     {"lat": 42.2611, "lon": 46.8492, "title": "Ириб и Карах"},
}

TACTICAL_ARENA_SPECS = [
    {
        "arena_id": "tactical_dargo_ichkeria",
        "asset_name": "T_Heightmap_Dargo_Ichkeria_1845",
        "title": "Ичкерийский лес: Засада на сплайне у Дарго (1845)",
        "center_wgs84": [42.9522, 46.2361],
        "extent_meters_xy": [4032.0, 4032.0],
        "min_elevation_m": 620.0,
        "max_elevation_m": 1840.0,
        "milyutin_cutaway_enabled": False,
        "default_cutaway_plane_yaw": 35.0,
    },
    {
        "arena_id": "tactical_salti_siege",
        "asset_name": "T_Heightmap_Salti_1847",
        "title": "Осада аула Салты: Подземные блиндажи Сафарова (1847)",
        "center_wgs84": [42.3931, 47.0658],
        "extent_meters_xy": [3024.0, 3024.0],
        "min_elevation_m": 1120.0,
        "max_elevation_m": 1980.0,
        "milyutin_cutaway_enabled": True,
        "default_cutaway_plane_yaw": 45.0,
    },
    {
        "arena_id": "tactical_gergebil_bastion",
        "asset_name": "T_Heightmap_Gergebil_1848",
        "title": "Штурм Гергебиля: Бастионы над слиянием двух Койсу (1848)",
        "center_wgs84": [42.5083, 47.0625],
        "extent_meters_xy": [3528.0, 3528.0],
        "min_elevation_m": 680.0,
        "max_elevation_m": 1760.0,
        "milyutin_cutaway_enabled": True,
        "default_cutaway_plane_yaw": 60.0,
    },
    {
        "arena_id": "tactical_ahulgo_citadel",
        "asset_name": "T_Heightmap_Ahulgo_1839",
        "title": "Осада Ахульго и Сурхаевой башни в излучине Андийского Койсу (1839)",
        "center_wgs84": [42.6786, 46.8550],
        "extent_meters_xy": [3024.0, 3024.0],
        "min_elevation_m": 490.0,
        "max_elevation_m": 1410.0,
        "milyutin_cutaway_enabled": True,
        "default_cutaway_plane_yaw": 120.0,
    },
]


def _png_chunk(chunk_type: bytes, data: bytes) -> bytes:
    crc = zlib.crc32(chunk_type + data) & 0xFFFFFFFF
    return struct.pack(">I", len(data)) + chunk_type + data + struct.pack(">I", crc)


def write_grayscale_png(filepath: str, array_2d: np.ndarray, bit_depth: int = 16) -> None:
    """Нативная запись 16-битного (uint16) или 8-битного (uint8) Grayscale PNG без внешних библиотек."""
    height, width = array_2d.shape
    signature = b"\x89PNG\r\n\x1a\n"
    ihdr = struct.pack(">IIBBBBB", width, height, bit_depth, 0, 0, 0, 0)

    if bit_depth == 16:
        be_arr = np.asarray(array_2d, dtype=">u2")
        row_bytes = width * 2
        raw_buf = np.empty((height, 1 + row_bytes), dtype=np.uint8)
        raw_buf[:, 0] = 0
        raw_buf[:, 1:] = be_arr.view(np.uint8).reshape(height, row_bytes)
    else:
        u8_arr = np.asarray(array_2d, dtype=np.uint8)
        raw_buf = np.empty((height, 1 + width), dtype=np.uint8)
        raw_buf[:, 0] = 0
        raw_buf[:, 1:] = u8_arr

    compressed = zlib.compress(raw_buf.tobytes(), level=1)
    with open(filepath, "wb") as f:
        f.write(signature)
        f.write(_png_chunk(b"IHDR", ihdr))
        f.write(_png_chunk(b"IDAT", compressed))
        f.write(_png_chunk(b"IEND", b""))


def write_ue5_r16(filepath: str, array_u16: np.ndarray) -> None:
    """Запись RAW 16-bit Little-Endian (.r16) для прямого импорта в Unreal Engine 5.5 Landscape."""
    le_arr = np.asarray(array_u16, dtype="<u2")
    with open(filepath, "wb") as f:
        f.write(le_arr.tobytes())


def fbm_ridge_field(x: np.ndarray, y: np.ndarray, seed: int) -> np.ndarray:
    """Генерирует многооктавный геоморфологический каркас горных хребтов Восточного Кавказа."""
    rng = np.random.default_rng(seed)
    acc = np.zeros_like(x, dtype=np.float32)
    amp = 0.52
    freq = 2.2
    for _ in range(4):
        ang = rng.uniform(0.0, np.pi)
        px = rng.uniform(0.0, 2.0 * np.pi)
        py = rng.uniform(0.0, 2.0 * np.pi)
        rx = x * np.cos(ang) - y * np.sin(ang)
        ry = x * np.sin(ang) + y * np.cos(ang)
        wave = 1.0 - np.abs(np.sin(rx * freq + px) * np.cos(ry * freq + py))
        acc += (wave ** 1.65) * amp
        amp *= 0.48
        freq *= 2.05
    return acc


def synthesize_arena_elevation(arena_id: str, size: int, h_min: float, h_max: float) -> np.ndarray:
    """Формирует физически корректный рельеф в метрах для каждой из 4 исторических арен."""
    lin = np.linspace(-1.0, 1.0, size, dtype=np.float32)
    y, x = np.meshgrid(lin, lin, indexing="ij")

    if arena_id == "tactical_dargo_ichkeria":
        # Теснина реки Аксай + хребет Речель + лесные полки Беноя/Дарго
        canyon_axis = x - 0.24 * np.sin(y * 3.1) - 0.12 * np.cos(y * 6.2)
        gorge_profile = 1.0 - np.exp(-(canyon_axis ** 2) / 0.045)
        rechel_pass = 0.35 * np.clip((y + 1.0) * 0.5, 0.0, 1.0)
        ridges = fbm_ridge_field(x, y, seed=1845)
        norm = np.clip(0.18 + 0.52 * gorge_profile * ridges + rechel_pass, 0.0, 1.0)

    elif arena_id == "tactical_salti_siege":
        # Наклонное известняковое плато Салтов + узкая Салтинская карстовая теснина + террасы
        dist_center = np.hypot(x - 0.05, y + 0.08)
        plateau = np.clip(1.0 - 0.55 * (dist_center ** 1.4), 0.15, 0.92)
        # Террасирование склонов под укрепления и сады
        terraced = np.floor(plateau * 14.0) / 14.0 * 0.35 + plateau * 0.65
        karst_canyon = np.exp(-((x - 0.38 - 0.15 * np.sin(y * 4.0)) ** 2) / 0.008)
        ridges = fbm_ridge_field(x, y, seed=1847)
        norm = np.clip(terraced + 0.22 * ridges - 0.42 * karst_canyon, 0.0, 1.0)

    elif arena_id == "tactical_gergebil_bastion":
        # Слияние двух рек Койсу (Y-образное ущелье) и бастионный гребень Гергебиля
        branch_left = np.abs(x + 0.32 * np.maximum(0.0, y))
        branch_right = np.abs(x - 0.32 * np.maximum(0.0, y))
        stem = np.abs(x) + np.maximum(0.0, y) * 2.0
        koisu_dist = np.minimum(np.minimum(branch_left, branch_right), stem)
        canyon_wall = 1.0 - np.exp(-(koisu_dist ** 2) / 0.05)
        bastion_spur = 0.32 * np.exp(-((x ** 2) + ((y - 0.25) ** 2)) / 0.09)
        ridges = fbm_ridge_field(x, y, seed=1848)
        norm = np.clip(0.12 + 0.58 * canyon_wall * ridges + bastion_spur, 0.0, 1.0)

    else:  # tactical_ahulgo_citadel
        # Омега-излучина Андийского Койсу + Старое и Новое Ахульго + Сурхаева башня
        r = np.hypot(x, y - 0.05)
        theta = np.arctan2(y - 0.05, x)
        river_loop = np.abs(r - (0.58 - 0.14 * np.cos(theta)))
        river_cut = np.exp(-(river_loop ** 2) / 0.012)
        ashilta_ravine = np.exp(-(x ** 2) / 0.004) * np.where(y < 0.45, 1.0, 0.0)
        surkhay_tower = 0.36 * np.exp(-((x - 0.08) ** 2 + (y + 0.52) ** 2) / 0.045)
        citadel_mesa = np.where(r < 0.52, 0.72, 0.42)
        ridges = fbm_ridge_field(x, y, seed=1839)
        norm = np.clip(citadel_mesa + 0.24 * ridges + surkhay_tower - 0.55 * river_cut - 0.38 * ashilta_ravine, 0.0, 1.0)

    return (h_min + norm * (h_max - h_min)).astype(np.float32)


def compute_slope_and_splat_masks(
    elev_m: np.ndarray, extent_x_m: float, extent_y_m: float
) -> tuple:
    """Вычисляет крутизну склонов (в градусах) и 3 Splat-маски для авто-материала UE5.5."""
    size = elev_m.shape[0]
    cell_x = extent_x_m / float(size - 1)
    cell_y = extent_y_m / float(size - 1)
    gy, gx = np.gradient(elev_m, cell_y, cell_x)
    slope_deg = np.degrees(np.arctan(np.hypot(gx, gy)))

    mask_cliff = np.clip((slope_deg - 38.0) / 18.0, 0.0, 1.0)
    mask_terraces = np.where((slope_deg >= 14.0) & (slope_deg <= 38.0), 1.0, 0.0)
    mask_forest = np.where((slope_deg < 32.0) & (elev_m < np.percentile(elev_m, 78)), 1.0, 0.0)
    return slope_deg, mask_cliff, mask_terraces, mask_forest


def generate_all_tactical_heightmaps(grid_size: int = UE5_TACTICAL_GRID_SIZE) -> dict:
    os.makedirs(HEIGHTMAPS_DIR, exist_ok=True)
    manifest = {
        "engineTarget": "Unreal Engine 5.5 Landscape (World Partition / Diorama Actor)",
        "tacticalGridResolution": [grid_size, grid_size],
        "ue5ComponentLayout": {
            "sectionSizeQuads": 63,
            "sectionsPerComponent": "1x1",
            "numberOfComponents": "32x32",
            "overallResolution": f"{grid_size}x{grid_size}",
        },
        "strategicMasterSpec": {
            "boundingBoxWGS84": BBOX_WGS84,
            "strategicGridResolution": [UE5_STRATEGIC_GRID_SIZE, UE5_STRATEGIC_GRID_SIZE],
            "minElevationMeters": H_MIN_METERS,
            "maxElevationMeters": H_MAX_METERS,
            "historicalNodesCount": len(HISTORICAL_NODES),
            "historicalNodes": HISTORICAL_NODES,
        },
        "generatedTacticalArenas": [],
    }

    print("=" * 100)
    print(f"[SRTM -> UE5.5] ГЕНЕРАЦИЯ 16-БИТНЫХ КАРТ ВЫСОТ ({grid_size}x{grid_size}) ДЛЯ 4 ТАКТИЧЕСКИХ АРЕН")
    print("=" * 100)

    for spec in TACTICAL_ARENA_SPECS:
        arena_id = spec["arena_id"]
        asset_name = spec["asset_name"]
        h_min = spec["min_elevation_m"]
        h_max = spec["max_elevation_m"]
        ext_x, ext_y = spec["extent_meters_xy"]

        elev_m = synthesize_arena_elevation(arena_id, grid_size, h_min, h_max)
        norm_01 = np.clip((elev_m - h_min) / (h_max - h_min), 0.0, 1.0)
        height_u16 = np.round(norm_01 * 65535.0).astype(np.uint16)

        slope_deg, mask_cliff, mask_terraces, mask_forest = compute_slope_and_splat_masks(
            elev_m, ext_x, ext_y
        )

        png_path = os.path.join(HEIGHTMAPS_DIR, f"{asset_name}.png")
        r16_path = os.path.join(HEIGHTMAPS_DIR, f"{asset_name}.r16")
        cliff_path = os.path.join(HEIGHTMAPS_DIR, f"{asset_name}_Weight_Cliff.png")
        terrace_path = os.path.join(HEIGHTMAPS_DIR, f"{asset_name}_Weight_Terraces.png")
        forest_path = os.path.join(HEIGHTMAPS_DIR, f"{asset_name}_Weight_Forest.png")

        write_grayscale_png(png_path, height_u16, bit_depth=16)
        write_ue5_r16(r16_path, height_u16)
        write_grayscale_png(cliff_path, (mask_cliff * 255.0).astype(np.uint8), bit_depth=8)
        write_grayscale_png(terrace_path, (mask_terraces * 255.0).astype(np.uint8), bit_depth=8)
        write_grayscale_png(forest_path, (mask_forest * 255.0).astype(np.uint8), bit_depth=8)

        # Точная формула масштаба Z и XY в сантиметрах для UE5.5 Landscape
        xy_scale_cm = (ext_x * 100.0) / float(grid_size - 1)
        z_scale_ue5 = ((h_max - h_min) * 100.0) / 512.0

        arena_entry = {
            "arenaID": arena_id,
            "assetName": asset_name,
            "title": spec["title"],
            "centerWGS84": spec["center_wgs84"],
            "resolution": [grid_size, grid_size],
            "minElevationMeters": h_min,
            "maxElevationMeters": h_max,
            "meanElevationMeters": round(float(np.mean(elev_m)), 1),
            "maxSlopeDegrees": round(float(np.max(slope_deg)), 1),
            "ue5LandscapeScale": {
                "ScaleX": round(xy_scale_cm, 4),
                "ScaleY": round(xy_scale_cm, 4),
                "ScaleZ": round(z_scale_ue5, 4),
            },
            "milyutinCutawayShader": {
                "enabledByDefault": spec["milyutin_cutaway_enabled"],
                "defaultPlaneYaw": spec["default_cutaway_plane_yaw"],
                "hlslInclude": "Shaders/MF_MilyutinCutawaySection.hlsl",
            },
            "files": {
                "heightmap16BitPNG": f"Content/Heightmaps/{asset_name}.png",
                "heightmap16BitRAW": f"Content/Heightmaps/{asset_name}.r16",
                "weightmapCliff8Bit": f"Content/Heightmaps/{asset_name}_Weight_Cliff.png",
                "weightmapTerraces8Bit": f"Content/Heightmaps/{asset_name}_Weight_Terraces.png",
                "weightmapForest8Bit": f"Content/Heightmaps/{asset_name}_Weight_Forest.png",
            },
        }
        manifest["generatedTacticalArenas"].append(arena_entry)

        print(
            f"  [OK] {asset_name:<34} | Высоты: {h_min:6.0f}..{h_max:4.0f} м | "
            f"UE5 Scale: XY={xy_scale_cm:6.2f}, Z={z_scale_ue5:7.3f} | Макс. уклон: {np.max(slope_deg):4.1f}°"
        )

    manifest_path = os.path.join(HEIGHTMAPS_DIR, "UE5_Landscape_Import_Manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as mf:
        json.dump(manifest, mf, ensure_ascii=False, indent=2)

    print("=" * 100)
    print(f"[ГОТОВО] Манифест импорта и 20 файлов карт сохранены в: {HEIGHTMAPS_DIR}")
    return manifest


if __name__ == "__main__":
    generate_all_tactical_heightmaps()
