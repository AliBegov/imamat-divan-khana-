#!/usr/bin/env python3
"""
IMAMAT: DIVAN-KHANA — Blender 4.x Studio Headless 3D Sculptor & glTF 2.0 PBR Exporter (Stage 2)
Usage:
  ~/Applications/Blender.app/Contents/MacOS/Blender --background --python 04_UE5_ImamatWargame/Tools/blender_studio_builder.py

Generates 12 sculpted, multi-material, bevel-chamfered PBR .glb 3D models in Content/Models_GLB/:
  1. Vedeno_DivanKhana_Capital.glb  (vedeno_capital)
  2. Caucasian_Watchtower.glb       (watchtower)
  3. Bastion_Fortress.glb           (fortress)
  4. Hero_Hadji_Murat.glb           (hero_hadji_murat)
  5. Hero_Baysungur_Benoy.glb       (hero_baysungur)
  6. Cavalry_Naib.glb               (cavalry_naib)
  7. Mountain_Unicorn_Cannon.glb    (unicorn_cannon)
  8. Imperial_Column.glb            (imperial_column)
  9. Supply_Wagon.glb               (supply_wagon)
 10. Stone_Arch_Bridge.glb          (stone_bridge)
 11. Signal_Fire_Beacon.glb         (signal_beacon)
 12. Caucasian_Golden_Eagle.glb     (golden_eagle)
"""
import math
from pathlib import Path

try:
    import bpy  # type: ignore
    import bmesh  # type: ignore
except ImportError:
    bpy = None
    bmesh = None

ROOT = Path(__file__).resolve().parents[2]
GLB_DIR = ROOT / "04_UE5_ImamatWargame" / "Content" / "Models_GLB"


def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def make_pbr_mat(name: str, rgba=(0.8, 0.7, 0.5, 1.0), metallic=0.1, roughness=0.75, emission_rgb=None, emission_strength=0.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    bsdf = nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = rgba
        bsdf.inputs["Metallic"].default_value = metallic
        bsdf.inputs["Roughness"].default_value = roughness
        if emission_rgb and emission_strength > 0:
            em_in = bsdf.inputs.get("Emission Color") or bsdf.inputs.get("Emission")
            if em_in:
                em_in.default_value = (*emission_rgb, 1.0)
            st_in = bsdf.inputs.get("Emission Strength")
            if st_in:
                st_in.default_value = emission_strength
    return mat


def assign_mat_and_bevel(obj, mat, bevel_width=0.015, smooth=False):
    if obj.data.materials:
        obj.data.materials[0] = mat
    else:
        obj.data.materials.append(mat)
    if bevel_width > 0:
        bev = obj.modifiers.new(name="Bevel", type="BEVEL")
        bev.width = bevel_width
        bev.segments = 1
        bev.limit_method = "ANGLE"
        bev.angle_limit = math.radians(32)
    if smooth:
        for poly in obj.data.polygons:
            poly.use_smooth = True


def add_box(name: str, mat, size=(1.0, 1.0, 1.0), loc=(0.0, 0.0, 0.5), rot=(0.0, 0.0, 0.0), taper=1.0, bevel=0.015):
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=loc, rotation=rot)
    obj = bpy.context.active_object
    obj.name = name
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    sx, sy, sz = size
    for v in bm.verts:
        tf = taper if v.co.z > 0 else 1.0
        v.co.x *= sx * tf
        v.co.y *= sy * tf
        v.co.z *= sz
    bm.normal_update()
    bm.to_mesh(obj.data)
    bm.free()
    assign_mat_and_bevel(obj, mat, bevel_width=bevel, smooth=False)
    return obj


def add_cyl(name: str, mat, r1=0.5, r2=0.5, depth=1.0, verts=12, loc=(0.0, 0.0, 0.5), rot=(0.0, 0.0, 0.0), smooth=True, bevel=0.01):
    bpy.ops.mesh.primitive_cone_add(vertices=verts, radius1=r1, radius2=r2, depth=depth, location=loc, rotation=rot)
    obj = bpy.context.active_object
    obj.name = name
    assign_mat_and_bevel(obj, mat, bevel_width=bevel, smooth=smooth)
    return obj


def add_sphere(name: str, mat, radius=0.5, segs=12, rings=8, loc=(0.0, 0.0, 0.5), scale=(1.0, 1.0, 1.0)):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segs, ring_count=rings, radius=radius, location=loc)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    assign_mat_and_bevel(obj, mat, bevel_width=0.0, smooth=True)
    return obj


def add_spoked_wheel(prefix: str, m_rim, m_hub, m_spoke, center, radius=0.34, width=0.07, spokes=8):
    cx, cy, cz = center
    # Hollow segmented tire rim (12 segments)
    rim_segs = 12
    seg_len = (2.0 * math.pi * radius / rim_segs) * 1.08
    for i in range(rim_segs):
        ang = (i / rim_segs) * math.pi * 2.0
        sy = cy + math.cos(ang) * radius
        sz = cz + math.sin(ang) * radius
        add_box(f"{prefix}_Rim{i}", m_rim, (width, seg_len, radius * 0.14), (cx, sy, sz), rot=(ang, 0, 0), bevel=0.004)
    add_cyl(f"{prefix}_Hub", m_hub, radius * 0.24, radius * 0.22, width * 1.6, 10, (cx, cy, cz), rot=(0, math.pi / 2, 0), bevel=0.005)
    for s in range(spokes):
        ang = (s / spokes) * math.pi * 2.0
        sy = cy + math.cos(ang) * (radius * 0.50)
        sz = cz + math.sin(ang) * (radius * 0.50)
        add_box(f"{prefix}_Spk{s}", m_spoke, (width * 0.45, radius * 0.86, radius * 0.08), (cx, sy, sz), rot=(ang, 0, 0), bevel=0.002)


def export_current_glb(filename: str) -> int:
    GLB_DIR.mkdir(parents=True, exist_ok=True)
    out_path = GLB_DIR / filename
    bpy.ops.export_scene.gltf(
        filepath=str(out_path),
        export_format="GLB",
        export_yup=True,
        export_apply=True,
        export_normals=True,
        export_materials="EXPORT",
    )
    size_b = out_path.stat().st_size
    print(f"  [BLENDER 4.2 GLB] {filename:<34} -> {size_b:>7,} bytes")
    return size_b


# ---------------------------------------------------------------------------
# 1. Capital Dargo-Vedeno (Divan-Khana Council Hall + Minaret + Slate Roof & Palisade)
# ---------------------------------------------------------------------------
def build_vedeno_capital():
    reset_scene()
    m_stone = make_pbr_mat("VedenoLimestone", (0.28, 0.24, 0.19, 1.0), 0.04, 0.88)
    m_walnut = make_pbr_mat("CarvedWalnut", (0.12, 0.065, 0.032, 1.0), 0.04, 0.82)
    m_roof_slate = make_pbr_mat("SlateRoof", (0.08, 0.08, 0.09, 1.0), 0.06, 0.86)
    m_gold = make_pbr_mat("KubachiGold", (0.72, 0.54, 0.14, 1.0), 0.86, 0.28, (0.72, 0.50, 0.12), 0.10)
    m_slate = make_pbr_mat("DarkPlinth", (0.07, 0.065, 0.055, 1.0), 0.04, 0.94)
    m_window = make_pbr_mat("WarmHallWindow", (0.95, 0.58, 0.16, 1.0), 0.0, 0.4, (0.95, 0.52, 0.12), 1.1)

    add_cyl("CapitalPlinth", m_slate, 1.42, 1.32, 0.12, 18, (0, 0, 0.06))

    # Sharpened oak log palisade surrounding the hill fort (leaving South gate clear)
    for i in range(18):
        ang = (i / 18.0) * math.pi * 2.0
        gate_delta = abs(math.atan2(math.sin(ang + math.pi * 0.5), math.cos(ang + math.pi * 0.5)))
        if gate_delta < 0.32:
            continue
        sx = math.cos(ang) * 1.28
        sy = math.sin(ang) * 1.28
        add_cyl(f"Palisade_{i}", m_walnut, 0.05, 0.02, 0.42, 6, (sx, sy, 0.30), bevel=0.004)

    # Main Divan-Khana Council Hall + Protruding Timber Beams + Caucasian Pitched Slate Roof
    add_box("DivanHallBase", m_stone, (1.62, 1.32, 0.94), (-0.15, 0.0, 0.59), taper=0.95)
    add_box("WalnutGallery", m_walnut, (1.78, 1.46, 0.20), (-0.15, 0.0, 1.14))
    for bx in (-0.82, -0.48, -0.15, 0.18, 0.52):
        add_box(f"RoofBeam_{bx:.2f}", m_walnut, (0.08, 1.62, 0.08), (bx, 0.0, 1.10), bevel=0.005)
    for wx in (-0.52, -0.15, 0.22):
        add_box(f"FacadeWin_{wx:.2f}", m_window, (0.14, 0.04, 0.26), (wx, -0.64, 0.68), bevel=0.0)

    add_box("DivanHippedRoof", m_roof_slate, (1.84, 1.52, 0.44), (-0.15, 0.0, 1.46), taper=0.28, bevel=0.012)
    add_box("DivanChimney", m_stone, (0.20, 0.20, 0.36), (-0.72, 0.38, 1.62), bevel=0.006)
    add_cyl("DomeFinial", m_gold, 0.045, 0.015, 0.38, 10, (-0.15, 0.0, 1.84))

    # Octagonal Caucasian Stone Minaret & Watchtower with Corbels & Dark Slate Spire
    add_cyl("VedenoMinaret", m_stone, 0.36, 0.27, 2.85, 8, (0.88, -0.35, 1.52), smooth=False, bevel=0.018)
    add_cyl("MinaretBalcony", m_walnut, 0.43, 0.39, 0.18, 8, (0.88, -0.35, 2.86), smooth=False)
    add_cyl("MinaretSpire", m_roof_slate, 0.26, 0.02, 0.65, 8, (0.88, -0.35, 3.26), smooth=False)
    add_sphere("CrescentOrb", m_gold, 0.085, 10, 8, (0.88, -0.35, 3.64))

    # Arsenal Wing & Stone Parapet Merlons
    add_box("ArsenalWing", m_stone, (0.85, 0.78, 0.66), (-0.75, -0.58, 0.45), taper=0.96)
    add_box("ArsenalRoof", m_walnut, (0.94, 0.86, 0.10), (-0.75, -0.58, 0.82))
    for mx, my in [(-1.12, -0.92), (-0.75, -0.92), (-0.38, -0.92)]:
        add_box(f"Merlon_{mx:.2f}", m_stone, (0.16, 0.12, 0.16), (mx, my, 0.92), bevel=0.008)
    return export_current_glb("Vedeno_DivanKhana_Capital.glb")


# ---------------------------------------------------------------------------
# 2. Caucasian Watchtower & Stepped Mountain Aul Saklyas
# ---------------------------------------------------------------------------
def build_caucasian_watchtower():
    reset_scene()
    m_stone = make_pbr_mat("AulLimestone", (0.60, 0.55, 0.47, 1.0), 0.05, 0.86)
    m_dark = make_pbr_mat("SlateTrim", (0.22, 0.20, 0.18, 1.0), 0.08, 0.80)
    m_wood = make_pbr_mat("OakBeam", (0.40, 0.25, 0.12, 1.0), 0.04, 0.86)
    m_window = make_pbr_mat("HearthGlow", (0.98, 0.65, 0.18, 1.0), 0.0, 0.4, (0.98, 0.58, 0.12), 1.4)

    add_cyl("Plinth", m_dark, 1.12, 1.02, 0.14, 16, (0, 0, 0.07))

    # Tall tapered Vainakh/Avar combat tower with machicolation corbels
    add_box("CombatTower", m_stone, (0.86, 0.86, 2.75), (0.08, -0.08, 1.50), taper=0.68, bevel=0.02)
    for cx, cy in [(-0.22, -0.38), (0.38, -0.38), (-0.22, 0.22), (0.38, 0.22)]:
        add_box(f"Corbel_{cx:.2f}_{cy:.2f}", m_dark, (0.16, 0.16, 0.22), (cx, cy, 2.78), bevel=0.008)
    add_box("Machicolation", m_dark, (0.82, 0.82, 0.22), (0.08, -0.08, 2.94), taper=1.08)
    add_box("PyramidalRoof", m_dark, (0.76, 0.76, 0.40), (0.08, -0.08, 3.23), taper=0.10)

    # 3 stepped mountain saklya houses with protruding roof beams & chimneys
    add_box("SaklyaLower", m_stone, (0.98, 0.82, 0.68), (-0.58, 0.36, 0.48), taper=0.96)
    add_box("SaklyaLowerRoof", m_wood, (1.08, 0.92, 0.08), (-0.58, 0.36, 0.85))
    add_box("LowerBeamA", m_wood, (1.16, 0.08, 0.07), (-0.58, 0.15, 0.79), bevel=0.005)
    add_box("LowerBeamB", m_wood, (1.16, 0.08, 0.07), (-0.58, 0.55, 0.79), bevel=0.005)
    add_cyl("ChimneyL", m_stone, 0.09, 0.07, 0.26, 8, (-0.82, 0.54, 1.00))

    add_box("SaklyaMid", m_stone, (0.78, 0.72, 0.62), (-0.42, -0.42, 0.79), taper=0.96)
    add_box("SaklyaMidRoof", m_wood, (0.88, 0.82, 0.08), (-0.42, -0.42, 1.13))
    add_box("MidBeam", m_wood, (0.96, 0.08, 0.07), (-0.42, -0.42, 1.07), bevel=0.005)

    add_box("SaklyaEast", m_stone, (0.74, 0.68, 0.58), (0.64, 0.36, 0.43), taper=0.96)
    add_box("SaklyaEastRoof", m_wood, (0.82, 0.76, 0.07), (0.64, 0.36, 0.74))
    add_box("WarmLoophole", m_window, (0.14, 0.06, 0.24), (0.08, 0.31, 2.08), bevel=0.0)
    add_box("DoorWarm", m_window, (0.18, 0.05, 0.28), (-0.58, 0.76, 0.36), bevel=0.0)
    return export_current_glb("Caucasian_Watchtower.glb")


# ---------------------------------------------------------------------------
# 3. Imperial Cordon Star-Bastion Fortress
# ---------------------------------------------------------------------------
def build_bastion_fortress():
    reset_scene()
    m_brick = make_pbr_mat("FortressBrick", (0.18, 0.052, 0.038, 1.0), 0.04, 0.88)
    m_glacis = make_pbr_mat("EarthGlacis", (0.08, 0.10, 0.055, 1.0), 0.02, 0.95)
    m_roof = make_pbr_mat("IronRoof", (0.045, 0.085, 0.065, 1.0), 0.38, 0.56)
    m_gold = make_pbr_mat("ImperialBrass", (0.62, 0.48, 0.14, 1.0), 0.78, 0.30)
    m_wood = make_pbr_mat("GateTimber", (0.12, 0.065, 0.030, 1.0), 0.04, 0.88)

    add_cyl("StarGlacis", m_glacis, 1.56, 1.32, 0.22, 8, (0, 0, 0.11), smooth=False)
    add_box("CurtainWall", m_brick, (1.58, 1.58, 0.66), (0, 0, 0.52), taper=0.92)
    add_box("SallyPortGate", m_wood, (0.36, 0.08, 0.44), (0, -0.78, 0.42), bevel=0.008)
    for bx, by, nm in [(-0.80, -0.80, "BastNW"), (0.80, -0.80, "BastNE"), (-0.80, 0.80, "BastSW"), (0.80, 0.80, "BastSE")]:
        add_cyl(nm, m_brick, 0.42, 0.35, 0.78, 6, (bx, by, 0.57), smooth=False)
        add_cyl(f"{nm}_Roof", m_roof, 0.38, 0.06, 0.24, 6, (bx, by, 1.06), smooth=False)
    for mx in (-0.42, 0.0, 0.42):
        add_box(f"WallMerlonN_{mx:.2f}", m_brick, (0.18, 0.12, 0.14), (mx, -0.74, 0.90), bevel=0.006)
        add_box(f"WallMerlonS_{mx:.2f}", m_brick, (0.18, 0.12, 0.14), (mx, 0.74, 0.90), bevel=0.006)

    add_box("CommandCitadel", m_brick, (0.76, 0.76, 0.62), (0, 0, 1.02), taper=0.95)
    add_box("CitadelRoof", m_roof, (0.84, 0.84, 0.34), (0, 0, 1.48), taper=0.14)
    add_cyl("Flagstaff", m_gold, 0.025, 0.02, 0.88, 8, (0, 0, 1.96))
    add_box("FortBanner", m_gold, (0.03, 0.38, 0.22), (0, 0.19, 2.24), rot=(0, 0, 0.12), bevel=0.004)
    return export_current_glb("Bastion_Fortress.glb")


# ---------------------------------------------------------------------------
# Helper: Sculpted Caucasian Warhorse + Detailed Rider Builder
# ---------------------------------------------------------------------------
def populate_sculpted_horse_and_rider(
    coat_rgba,
    cherkeska_rgba,
    burka_rgba,
    papakha_rgba,
    pedestal_rgba,
    has_banner=False,
    banner_rgba=(0.06, 0.54, 0.34, 1.0),
    rearing=False,
):
    m_horse = make_pbr_mat("HorseCoat", coat_rgba, 0.06, 0.54)
    m_cherk = make_pbr_mat("Cherkeska", cherkeska_rgba, 0.06, 0.74)
    m_burka = make_pbr_mat("FeltBurka", burka_rgba, 0.03, 0.92)
    m_papakha = make_pbr_mat("Papakha", papakha_rgba, 0.03, 0.94)
    m_skin = make_pbr_mat("FaceTone", (0.82, 0.66, 0.52, 1.0), 0.02, 0.74)
    m_steel = make_pbr_mat("BazalaiBlade", (0.88, 0.91, 0.95, 1.0), 0.92, 0.18)
    m_silver = make_pbr_mat("KubachiSilver", (0.84, 0.86, 0.90, 1.0), 0.86, 0.24)
    m_gold = make_pbr_mat("PedestalBrass", pedestal_rgba, 0.05, 0.92)
    m_leather = make_pbr_mat("SaddleLeather", (0.12, 0.06, 0.03, 1.0), 0.06, 0.72)
    m_hoof = make_pbr_mat("HoofDark", (0.04, 0.035, 0.03, 1.0), 0.08, 0.58)

    # Compact natural rocky slate-earth ground base (no oversized disc overhanging canyon cliffs)
    add_cyl("Pedestal", m_gold, 0.50, 0.44, 0.05, 16, (0, 0, 0.025))

    pitch = -0.24 if rearing else 0.0
    z_lift = 0.16 if rearing else 0.0

    # Sculpted horse barrel, chest, croup, neck, tapered muzzle & upright ears
    add_sphere("HorseBarrel", m_horse, 0.33, 14, 10, (0, 0.02, 0.82 + z_lift * 0.5), scale=(0.76, 1.72, 0.80))
    add_sphere("HorseChest", m_horse, 0.28, 12, 8, (0, -0.38, 0.89 + z_lift), scale=(0.82, 0.94, 0.92))
    add_sphere("HorseCroup", m_horse, 0.27, 12, 8, (0, 0.42, 0.84 + z_lift * 0.3), scale=(0.80, 0.88, 0.86))
    add_cyl("HorseNeck", m_horse, 0.20, 0.12, 0.64, 12, (0, -0.52, 1.24 + z_lift), rot=(0.54 + pitch, 0, 0))
    add_box("HorseHead", m_horse, (0.18, 0.40, 0.20), (0, -0.74, 1.48 + z_lift), rot=(0.40, 0, 0), taper=0.58)
    add_box("HorseEarL", m_horse, (0.04, 0.05, 0.12), (-0.06, -0.60, 1.62 + z_lift), rot=(0.20, 0, -0.15), taper=0.3)
    add_box("HorseEarR", m_horse, (0.04, 0.05, 0.12), (0.06, -0.60, 1.62 + z_lift), rot=(0.20, 0, 0.15), taper=0.3)
    add_box("HorseMane", m_papakha, (0.06, 0.14, 0.54), (0, -0.44, 1.28 + z_lift), rot=(0.52, 0, 0))
    add_cyl("HorseTail", m_papakha, 0.05, 0.12, 0.68, 10, (0, 0.70, 0.64), rot=(-0.40, 0, 0))

    # 4 two-segment articulated legs with knees/hocks and hooves
    legs = [
        (-0.16, -0.38, 0.62 + z_lift, 0.35 if rearing else 0.12, -0.18 if rearing else 0.04, "FL"),
        (0.16, -0.38, 0.62 + z_lift, -0.15 if rearing else -0.12, 0.24 if rearing else -0.05, "FR"),
        (-0.16, 0.40, 0.60, -0.10, 0.14, "BL"),
        (0.16, 0.40, 0.60, 0.14, -0.12, "BR"),
    ]
    for lx, ly, lz, rot_up, rot_lo, tag in legs:
        add_cyl(f"LegU_{tag}", m_horse, 0.075, 0.055, 0.36, 8, (lx, ly, lz), rot=(rot_up, 0, 0))
        add_cyl(f"LegL_{tag}", m_horse, 0.050, 0.042, 0.36, 8, (lx, ly + rot_up * 0.14, lz - 0.32), rot=(rot_lo, 0, 0))
        add_cyl(f"Hoof_{tag}", m_hoof, 0.052, 0.044, 0.07, 8, (lx, ly + (rot_up + rot_lo) * 0.14, lz - 0.50))

    # Saddle, stirrups & rider anatomy
    add_box("SaddleCloth", m_leather, (0.56, 0.60, 0.15), (0, -0.02, 1.05 + z_lift * 0.5))
    add_box("RiderSkirt", m_cherk, (0.42, 0.36, 0.32), (0, 0.02, 1.12 + z_lift * 0.5), taper=0.78)
    add_box("RiderTorso", m_cherk, (0.38, 0.26, 0.54), (0, 0.0, 1.42 + z_lift * 0.5), taper=0.88)
    add_box("RiderBelt", m_leather, (0.40, 0.28, 0.06), (0, 0.0, 1.24 + z_lift * 0.5))
    # Chest gazyri cartridge tubes (left & right breast pockets)
    for side in (-0.11, 0.11):
        for g in range(4):
            add_cyl(f"Gazyri_{side:.2f}_{g}", m_silver, 0.015, 0.015, 0.11, 6, (side + (g - 1.5) * 0.032, -0.13, 1.48 + z_lift * 0.5))

    # Felt burka cloak draped across shoulders + shaggy papakha fur cap
    add_box("BurkaCape", m_burka, (0.44, 0.20, 0.56), (0, 0.13, 1.36 + z_lift * 0.5), rot=(-0.20, 0, 0), taper=0.68)
    add_box("ArmRight", m_cherk, (0.10, 0.10, 0.34), (0.23, -0.10, 1.58 + z_lift * 0.5), rot=(0.42, 0, -0.35))
    add_box("ArmLeft", m_cherk, (0.10, 0.10, 0.32), (-0.21, -0.12, 1.42 + z_lift * 0.5), rot=(0.55, 0, 0.18))
    add_sphere("RiderHead", m_skin, 0.115, 10, 8, (0, -0.02, 1.78 + z_lift * 0.5))
    add_cyl("RiderPapakha", m_papakha, 0.16, 0.185, 0.26, 12, (0, -0.02, 1.94 + z_lift * 0.5))
    add_box("ShashkaBlade", m_steel, (0.025, 0.075, 0.84), (0.31, -0.22, 1.88 + z_lift * 0.5), rot=(0.38, 0.20, 0))
    add_cyl("ScabbardHip", m_leather, 0.025, 0.02, 0.68, 6, (-0.23, 0.12, 1.12 + z_lift * 0.5), rot=(-0.75, 0, -0.15))

    if has_banner:
        m_ban = make_pbr_mat("SilkBanner", banner_rgba, 0.10, 0.58)
        add_cyl("BannerStaff", m_gold, 0.026, 0.022, 2.48, 8, (-0.28, 0.06, 1.38))
        # 3-segment waving silk banner
        for b_seg in range(3):
            by = 0.24 + b_seg * 0.28
            bx = -0.28 + math.sin(b_seg * 1.1) * 0.05
            add_box(f"WavingBanner_{b_seg}", m_ban, (0.035, 0.30, 0.52 - b_seg * 0.03), (bx, by, 2.26), rot=(0, 0, 0.18 * (1 if b_seg % 2 == 0 else -1)), bevel=0.003)


# ---------------------------------------------------------------------------
# 4. Hero: Hadji Murad of Khunzakh (Dapple Ivory Charger + Felt Burka + Crimson Cherkeska)
# ---------------------------------------------------------------------------
def build_hero_hadji_murat():
    reset_scene()
    populate_sculpted_horse_and_rider(
        coat_rgba=(0.46, 0.44, 0.40, 1.0),
        cherkeska_rgba=(0.26, 0.024, 0.028, 1.0),
        burka_rgba=(0.34, 0.32, 0.29, 1.0),
        papakha_rgba=(0.42, 0.40, 0.36, 1.0),
        pedestal_rgba=(0.075, 0.068, 0.058, 1.0),
        has_banner=True,
        banner_rgba=(0.34, 0.03, 0.035, 1.0),
        rearing=True,
    )
    return export_current_glb("Hero_Hadji_Murat.glb")


# ---------------------------------------------------------------------------
# 5. Hero: Baysungur of Benoy (Dark Charger + Emerald Banner of Benoy)
# ---------------------------------------------------------------------------
def build_hero_baysungur():
    reset_scene()
    populate_sculpted_horse_and_rider(
        coat_rgba=(0.055, 0.045, 0.04, 1.0),
        cherkeska_rgba=(0.032, 0.18, 0.11, 1.0),
        burka_rgba=(0.065, 0.058, 0.052, 1.0),
        papakha_rgba=(0.055, 0.048, 0.042, 1.0),
        pedestal_rgba=(0.065, 0.082, 0.065, 1.0),
        has_banner=True,
        banner_rgba=(0.025, 0.26, 0.14, 1.0),
        rearing=False,
    )
    return export_current_glb("Hero_Baysungur_Benoy.glb")


# ---------------------------------------------------------------------------
# 6. Mounted Murtazek / Chapar Courier
# ---------------------------------------------------------------------------
def build_cavalry_naib():
    reset_scene()
    populate_sculpted_horse_and_rider(
        coat_rgba=(0.14, 0.072, 0.038, 1.0),
        cherkeska_rgba=(0.08, 0.095, 0.12, 1.0),
        burka_rgba=(0.09, 0.072, 0.058, 1.0),
        papakha_rgba=(0.07, 0.058, 0.045, 1.0),
        pedestal_rgba=(0.075, 0.068, 0.058, 1.0),
        has_banner=False,
        rearing=False,
    )
    return export_current_glb("Cavalry_Naib.glb")


# ---------------------------------------------------------------------------
# 7. Mountain Unicorn Cannon + Spoked Carriage Wheels & Stacked Shot
# ---------------------------------------------------------------------------
def build_unicorn_cannon():
    reset_scene()
    m_bronze = make_pbr_mat("UnicornBronze", (0.58, 0.40, 0.11, 1.0), 0.88, 0.28)
    m_oak = make_pbr_mat("CarriageOak", (0.18, 0.095, 0.042, 1.0), 0.05, 0.84)
    m_iron = make_pbr_mat("ForgedIron", (0.09, 0.095, 0.105, 1.0), 0.72, 0.40)
    m_base = make_pbr_mat("ArtilleryBase", (0.075, 0.068, 0.058, 1.0), 0.04, 0.92)

    add_cyl("ArtilleryPlinth", m_base, 0.64, 0.58, 0.048, 14, (0, 0, 0.024))
    add_box("CheekL", m_oak, (0.09, 1.24, 0.22), (-0.12, 0.18, 0.38), rot=(-0.16, 0, 0), taper=0.84)
    add_box("CheekR", m_oak, (0.09, 1.24, 0.22), (0.12, 0.18, 0.38), rot=(-0.16, 0, 0), taper=0.84)
    add_box("AxleBeam", m_oak, (0.86, 0.12, 0.12), (0, -0.10, 0.44), bevel=0.008)
    add_spoked_wheel("WheelL", m_iron, m_bronze, m_oak, (-0.42, -0.10, 0.44), radius=0.38, width=0.07, spokes=8)
    add_spoked_wheel("WheelR", m_iron, m_bronze, m_oak, (0.42, -0.10, 0.44), radius=0.38, width=0.07, spokes=8)
    add_cyl("BronzeBarrel", m_bronze, 0.15, 0.11, 1.32, 16, (0, -0.26, 0.65), rot=(math.pi / 2 - 0.16, 0, 0))
    add_sphere("BreechCascabel", m_bronze, 0.14, 12, 8, (0, 0.38, 0.55))
    add_cyl("ElevScrew", m_iron, 0.035, 0.035, 0.24, 8, (0, 0.28, 0.42))
    for sx, sy, sz, i in [(-0.24, 0.48, 0.16, 1), (-0.40, 0.48, 0.16, 2), (-0.32, 0.62, 0.16, 3), (-0.32, 0.53, 0.30, 4)]:
        add_sphere(f"Cannonball_{i}", m_iron, 0.085, 8, 6, (sx, sy, sz))
    return export_current_glb("Mountain_Unicorn_Cannon.glb")


# ---------------------------------------------------------------------------
# 8. Imperial Infantry Battalion Column (Anatomical Ranks + Packs + Shako)
# ---------------------------------------------------------------------------
def build_imperial_column():
    reset_scene()
    m_coat = make_pbr_mat("ImperialCoat", (0.042, 0.105, 0.062, 1.0), 0.04, 0.82)
    m_pant = make_pbr_mat("TrouserCloth", (0.07, 0.075, 0.08, 1.0), 0.04, 0.86)
    m_belt = make_pbr_mat("WhiteCrossbelt", (0.48, 0.46, 0.42, 1.0), 0.03, 0.84)
    m_pack = make_pbr_mat("KnapsackHide", (0.12, 0.072, 0.042, 1.0), 0.04, 0.88)
    m_crimson = make_pbr_mat("ColumnPlinth", (0.075, 0.068, 0.058, 1.0), 0.05, 0.92)
    m_shako = make_pbr_mat("BlackShako", (0.042, 0.042, 0.048, 1.0), 0.12, 0.68)
    m_steel = make_pbr_mat("BayonetSteel", (0.68, 0.72, 0.78, 1.0), 0.88, 0.22)
    m_brass = make_pbr_mat("RegimentBrass", (0.68, 0.50, 0.13, 1.0), 0.84, 0.26)
    m_skin = make_pbr_mat("SoldierFace", (0.46, 0.32, 0.22, 1.0), 0.02, 0.76)

    add_cyl("ColumnPlinth", m_crimson, 0.70, 0.64, 0.05, 16, (0, 0, 0.025))
    for rx in (-0.36, 0.0, 0.36):
        for ry in (-0.26, 0.26):
            tag = f"{rx:.1f}_{ry:.1f}"
            add_cyl(f"LegL_{tag}", m_pant, 0.05, 0.045, 0.30, 6, (rx - 0.05, ry, 0.22))
            add_cyl(f"LegR_{tag}", m_pant, 0.05, 0.045, 0.30, 6, (rx + 0.05, ry, 0.22))
            add_box(f"Torso_{tag}", m_coat, (0.22, 0.17, 0.52), (rx, ry, 0.60), taper=0.88)
            add_box(f"Crossbelt_{tag}", m_belt, (0.23, 0.18, 0.08), (rx, ry, 0.65), rot=(0, 0.45, 0))
            add_box(f"Pack_{tag}", m_pack, (0.18, 0.10, 0.24), (rx, ry + 0.12, 0.64), bevel=0.006)
            add_sphere(f"Head_{tag}", m_skin, 0.085, 8, 6, (rx, ry, 0.96))
            add_cyl(f"Shako_{tag}", m_shako, 0.085, 0.115, 0.21, 10, (rx, ry, 1.12))
            add_cyl(f"Musket_{tag}", m_steel, 0.016, 0.007, 1.06, 6, (rx + 0.11, ry - 0.05, 1.16))

    # Regimental Standard on Brass Pole
    add_cyl("EaglePole", m_brass, 0.024, 0.02, 2.08, 8, (0.0, -0.02, 1.14))
    add_box("RegimentFlagA", m_belt, (0.035, 0.34, 0.44), (0.0, 0.16, 1.88), rot=(0, 0, 0.10), bevel=0.003)
    add_box("RegimentFlagB", m_belt, (0.035, 0.34, 0.42), (-0.03, 0.46, 1.88), rot=(0, 0, -0.14), bevel=0.003)
    return export_current_glb("Imperial_Column.glb")


# ---------------------------------------------------------------------------
# 9. Covered Supply Wagon (Spoked Wheels + Canvas Tilt Ribs + Draft Shafts)
# ---------------------------------------------------------------------------
def build_supply_wagon():
    reset_scene()
    m_canvas = make_pbr_mat("WagonCanvas", (0.89, 0.84, 0.72, 1.0), 0.02, 0.90)
    m_wood = make_pbr_mat("WagonOak", (0.44, 0.27, 0.13, 1.0), 0.05, 0.84)
    m_iron = make_pbr_mat("RimIron", (0.20, 0.19, 0.18, 1.0), 0.60, 0.44)

    add_box("WagonBox", m_wood, (0.68, 1.28, 0.28), (0, 0, 0.44), taper=1.06)
    add_cyl("TiltCover", m_canvas, 0.36, 0.36, 1.22, 14, (0, 0, 0.66), rot=(math.pi / 2, 0, 0))
    for hy in (-0.42, 0.0, 0.42):
        add_cyl(f"TiltHoop_{hy:.2f}", m_wood, 0.375, 0.375, 0.05, 14, (0, hy, 0.66), rot=(math.pi / 2, 0, 0))
    for sx in (-0.22, 0.22):
        add_box(f"Shaft_{sx:.2f}", m_wood, (0.05, 0.76, 0.05), (sx, -0.92, 0.38), rot=(-0.10, 0, 0), bevel=0.004)
    for wx, wy, nm in [(-0.39, -0.40, "WFL"), (0.39, -0.40, "WFR"), (-0.39, 0.40, "WBL"), (0.39, 0.40, "WBR")]:
        add_spoked_wheel(nm, m_iron, m_iron, m_wood, (wx, wy, 0.28), radius=0.27, width=0.06, spokes=6)
    return export_current_glb("Supply_Wagon.glb")


# ---------------------------------------------------------------------------
# 10. Caucasian Vaulted Stone Arch Bridge (True Semicircular Voussoir Arch!)
# ---------------------------------------------------------------------------
def build_stone_bridge():
    reset_scene()
    m_stone = make_pbr_mat("BridgeAshlar", (0.58, 0.53, 0.46, 1.0), 0.04, 0.88)
    m_cobble = make_pbr_mat("BridgeDeck", (0.44, 0.40, 0.35, 1.0), 0.05, 0.90)
    m_trim = make_pbr_mat("BridgeKeystone", (0.48, 0.43, 0.37, 1.0), 0.05, 0.85)

    # River abutment piers with cutwaters
    add_box("AbutmentL", m_stone, (0.74, 0.46, 0.56), (0, -0.84, 0.28), taper=0.90)
    add_box("AbutmentR", m_stone, (0.74, 0.46, 0.56), (0, 0.84, 0.28), taper=0.90)
    # Vaulted radial voussoir arch ring leaving an open arch void beneath
    arch_r = 0.56
    arch_cz = 0.22
    for v_idx in range(9):
        ang = (v_idx / 8.0) * math.pi  # 0 .. PI
        vy = math.cos(ang) * arch_r
        vz = arch_cz + math.sin(ang) * arch_r
        add_box(
            f"ArchVoussoir_{v_idx}",
            m_trim if v_idx == 4 else m_stone,
            (0.68, 0.22, 0.16),
            (0, vy, vz),
            rot=(-ang + math.pi * 0.5, 0, 0),
            bevel=0.008,
        )
    # Stone spandrel walls flanking the arch + cobbled deck + crenellated parapets
    add_box("SpandrelL", m_stone, (0.64, 0.42, 0.34), (0, -0.78, 0.64), taper=0.95)
    add_box("SpandrelR", m_stone, (0.64, 0.42, 0.34), (0, 0.78, 0.64), taper=0.95)
    add_box("ArchSpanDeck", m_cobble, (0.68, 2.08, 0.11), (0, 0, 0.80))
    add_box("RampW", m_cobble, (0.64, 0.42, 0.18), (0, -1.16, 0.66), rot=(0.35, 0, 0))
    add_box("RampE", m_cobble, (0.64, 0.42, 0.18), (0, 1.16, 0.66), rot=(-0.35, 0, 0))
    add_box("ParapetW", m_stone, (0.09, 2.12, 0.16), (-0.31, 0, 0.92))
    add_box("ParapetE", m_stone, (0.09, 2.12, 0.16), (0.31, 0, 0.92))
    for px in (-0.31, 0.31):
        for py in (-0.98, 0.0, 0.98):
            add_box(f"Bollard_{px:.2f}_{py:.2f}", m_trim, (0.12, 0.14, 0.22), (px, py, 0.98), bevel=0.006)
    return export_current_glb("Stone_Arch_Bridge.glb")


# ---------------------------------------------------------------------------
# 11. Mountain Signal Fire Beacon (Stacked Criss-Cross Log Pyre + Flame)
# ---------------------------------------------------------------------------
def build_signal_beacon():
    reset_scene()
    m_stone = make_pbr_mat("BeaconStone", (0.52, 0.48, 0.43, 1.0), 0.05, 0.88)
    m_wood = make_pbr_mat("PyreLogs", (0.34, 0.20, 0.09, 1.0), 0.04, 0.88)
    m_ember = make_pbr_mat("EmberBed", (0.95, 0.32, 0.04, 1.0), 0.0, 0.4, (1.0, 0.34, 0.04), 2.2)
    m_flame = make_pbr_mat("SignalFlame", (1.0, 0.64, 0.10, 1.0), 0.0, 0.25, (1.0, 0.52, 0.06), 3.4)

    add_cyl("WatchBase", m_stone, 0.62, 0.46, 1.12, 10, (0, 0, 0.56), smooth=False)
    add_cyl("StoneCoping", m_stone, 0.52, 0.52, 0.12, 10, (0, 0, 1.14), smooth=False)
    # 4 tiers of stacked criss-cross round timber logs (no plain brown box!)
    for tier in range(4):
        tz = 1.24 + tier * 0.095
        horiz_x = tier % 2 == 0
        for off in (-0.22, 0.0, 0.22):
            loc = (0, off, tz) if horiz_x else (off, 0, tz)
            rot = (0, math.pi / 2, 0) if horiz_x else (math.pi / 2, 0, 0)
            add_cyl(f"PyreLog_{tier}_{off:.2f}", m_wood, 0.052, 0.048, 0.64, 7, loc, rot=rot, bevel=0.004)
    add_cyl("EmberCore", m_ember, 0.24, 0.18, 0.18, 8, (0, 0, 1.54))
    add_cyl("BlazingFlame", m_flame, 0.26, 0.02, 0.72, 10, (0, 0, 1.88))
    add_cyl("SideFlameA", m_flame, 0.14, 0.02, 0.44, 8, (0.12, -0.06, 1.72), rot=(0.15, 0.2, 0))
    return export_current_glb("Signal_Fire_Beacon.glb")


# ---------------------------------------------------------------------------
# 12. Sculpted Caucasian Golden Eagle
# ---------------------------------------------------------------------------
def build_golden_eagle():
    reset_scene()
    m_plumage = make_pbr_mat("EagleUmber", (0.20, 0.13, 0.08, 1.0), 0.06, 0.74)
    m_gold = make_pbr_mat("GoldenCrown", (0.82, 0.58, 0.18, 1.0), 0.12, 0.64)

    add_sphere("EagleTorso", m_plumage, 0.16, 12, 8, (0, 0, 0), scale=(0.85, 2.5, 0.72))
    add_sphere("EagleHead", m_gold, 0.10, 10, 8, (0, -0.44, 0.05), scale=(0.85, 1.35, 0.85))
    add_box("WingL", m_plumage, (1.24, 0.36, 0.05), (-0.66, 0.02, 0.05), rot=(0, -0.08, 0.06), taper=0.78)
    add_box("WingR", m_plumage, (1.24, 0.36, 0.05), (0.66, 0.02, 0.05), rot=(0, 0.08, -0.06), taper=0.78)
    add_box("TailFan", m_gold, (0.40, 0.36, 0.04), (0, 0.48, 0.01), taper=0.85)
    return export_current_glb("Caucasian_Golden_Eagle.glb")


def main():
    if bpy is None:
        print("[ERROR] Run via Blender CLI: ~/Applications/Blender.app/Contents/MacOS/Blender --background --python blender_studio_builder.py")
        return
    print("==============================================================================")
    print(" BLENDER 4.2 STUDIO HEADLESS PIPELINE: SCULPTING 12 CAUCASIAN PBR .GLB MODELS")
    print("==============================================================================")
    builders = [
        build_vedeno_capital,
        build_caucasian_watchtower,
        build_bastion_fortress,
        build_hero_hadji_murat,
        build_hero_baysungur,
        build_cavalry_naib,
        build_unicorn_cannon,
        build_imperial_column,
        build_supply_wagon,
        build_stone_bridge,
        build_signal_beacon,
        build_golden_eagle,
    ]
    total = sum(fn() for fn in builders)
    print(f"  [DONE] Exported {len(builders)} Blender 4.2 PBR .glb models ({total:,} bytes total)")
    print("==============================================================================")


if __name__ == "__main__":
    main()
