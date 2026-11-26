#!/usr/bin/env python3
"""
IMAMAT: DIVAN-KHANA — Real NASA SRTM (.r16) & glTF 2.0 Binary (.glb) 3D Asset Compiler
1. Compiles 4 real 2017x2017 16-bit NASA SRTM heightmaps (.r16) into compact 65x65 WebGL2 elevation grids.
2. Generates 7 spec-compliant glTF 2.0 binary (.glb) PBR 3D models in Content/Models_GLB/
   (watchtower, bastion fortress, mounted Naib, Imperial column, unicorn cannon, supply wagon, Caucasian eagle).
3. Exports src/data/srtmReal3DData.js for zero-CORS, instant Three.js + GLTFLoader rendering in standalone .app.
"""
import base64
import json
import math
import struct
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
HM_DIR = ROOT / "04_UE5_ImamatWargame" / "Content" / "Heightmaps"
GLB_DIR = ROOT / "04_UE5_ImamatWargame" / "Content" / "Models_GLB"
OUT_JS = ROOT / "03_Веб_прототип_Диван_Хана" / "src" / "data" / "srtmReal3DData.js"

TERRAIN_SOURCES = {
    "salty_1847": ("T_Heightmap_Salti_1847.r16", "Salti Gorge 1847 (SRTM 16-bit)"),
    "akhulgo_1839": ("T_Heightmap_Ahulgo_1839.r16", "Mount Akhulgo 1839 (SRTM 16-bit)"),
    "gunib_1859": ("T_Heightmap_Gergebil_1848.r16", "Upper Gunib & Andalal Massif (SRTM 16-bit)"),
    "dargo_1845": ("T_Heightmap_Dargo_Ichkeria_1845.r16", "Dargo Beech Defile 1845 (SRTM 16-bit)"),
}


def sample_r16_grid(r16_path: Path, grid_n: int = 65) -> dict:
    raw = r16_path.read_bytes()
    dim = int(round(math.sqrt(len(raw) // 2)))
    samples = []
    min_h = 65535
    max_h = 0
    for gy in range(grid_n):
        sy = min(dim - 1, int(round(gy * (dim - 1) / (grid_n - 1))))
        row_offset = sy * dim
        for gx in range(grid_n):
            sx = min(dim - 1, int(round(gx * (dim - 1) / (grid_n - 1))))
            idx = (row_offset + sx) * 2
            val = struct.unpack_from("<H", raw, idx)[0]
            samples.append(val)
            if val < min_h:
                min_h = val
            if val > max_h:
                max_h = val

    span = max(1, max_h - min_h)
    norm_bytes = bytearray()
    for v in samples:
        norm_v = int(round((v - min_h) * 65535.0 / span))
        norm_bytes.extend(struct.pack("<H", max(0, min(65535, norm_v))))

    return {
        "gridSize": grid_n,
        "sourceDim": dim,
        "rawMin": min_h,
        "rawMax": max_h,
        "heightU16Base64": base64.b64encode(bytes(norm_bytes)).decode("ascii"),
    }


# ---------------------------------------------------------------------------
# Minimalist Procedural glTF 2.0 Binary (.glb) Builder with PBR Materials
# ---------------------------------------------------------------------------
class GLBBuilder:
    def __init__(self):
        self.materials = []
        self.primitives_data = []  # list of (positions_flat, normals_flat, indices, mat_idx, node_name, translation)

    def add_material(self, name: str, rgba=(0.8, 0.7, 0.5, 1.0), metallic=0.15, roughness=0.75) -> int:
        idx = len(self.materials)
        self.materials.append({
            "name": name,
            "pbrMetallicRoughness": {
                "baseColorFactor": [round(float(c), 4) for c in rgba],
                "metallicFactor": round(float(metallic), 3),
                "roughnessFactor": round(float(roughness), 3),
            },
            "doubleSided": True,
        })
        return idx

    def add_box(self, name: str, mat_idx: int, size=(1.0, 1.0, 1.0), center=(0.0, 0.0, 0.0), taper_top=1.0):
        hx, hy, hz = size[0] * 0.5, size[1] * 0.5, size[2] * 0.5
        tx, tz = hx * taper_top, hz * taper_top
        cx, cy, cz = center
        faces = [
            # Front (+Z)
            ([(-hx, -hy, hz), (hx, -hy, hz), (tx, hy, tz), (-tx, hy, tz)], (0.0, 0.15, 0.99)),
            # Back (-Z)
            ([(hx, -hy, -hz), (-hx, -hy, -hz), (-tx, hy, -tz), (tx, hy, -tz)], (0.0, 0.15, -0.99)),
            # Right (+X)
            ([(hx, -hy, hz), (hx, -hy, -hz), (tx, hy, -tz), (tx, hy, tz)], (0.99, 0.15, 0.0)),
            # Left (-X)
            ([(-hx, -hy, -hz), (-hx, -hy, hz), (-tx, hy, tz), (-tx, hy, -tz)], (-0.99, 0.15, 0.0)),
            # Top (+Y)
            ([(-tx, hy, tz), (tx, hy, tz), (tx, hy, -tz), (-tx, hy, -tz)], (0.0, 1.0, 0.0)),
            # Bottom (-Y)
            ([(-hx, -hy, -hz), (hx, -hy, -hz), (hx, -hy, hz), (-hx, -hy, hz)], (0.0, -1.0, 0.0)),
        ]
        pos, nrm, ind = [], [], []
        v_offset = 0
        for verts, normal in faces:
            nx, ny, nz = normal
            nl = math.sqrt(nx * nx + ny * ny + nz * nz) or 1.0
            nx, ny, nz = nx / nl, ny / nl, nz / nl
            for vx, vy, vz in verts:
                pos.extend([vx + cx, vy + cy, vz + cz])
                nrm.extend([nx, ny, nz])
            ind.extend([v_offset, v_offset + 1, v_offset + 2, v_offset, v_offset + 2, v_offset + 3])
            v_offset += 4
        self.primitives_data.append((pos, nrm, ind, mat_idx, name))

    def add_cylinder(self, name: str, mat_idx: int, r_bottom=0.5, r_top=0.5, height=1.0, segs=12, center=(0.0, 0.0, 0.0), axis="y"):
        cx, cy, cz = center
        hy = height * 0.5
        pos, nrm, ind = [], [], []

        def rot_axis(x, y, z):
            if axis == "z":
                return (x + cx, -z + cy, y + cz)
            if axis == "x":
                return (y + cx, x + cy, z + cz)
            return (x + cx, y + cy, z + cz)

        def rot_norm(x, y, z):
            if axis == "z":
                return (x, -z, y)
            if axis == "x":
                return (y, x, z)
            return (x, y, z)

        for i in range(segs):
            a0 = (2.0 * math.pi * i) / segs
            a1 = (2.0 * math.pi * (i + 1)) / segs
            c0, s0 = math.cos(a0), math.sin(a0)
            c1, s1 = math.cos(a1), math.sin(a1)
            base = len(pos) // 3
            p0 = rot_axis(r_bottom * c0, -hy, r_bottom * s0)
            p1 = rot_axis(r_bottom * c1, -hy, r_bottom * s1)
            p2 = rot_axis(r_top * c1, hy, r_top * s1)
            p3 = rot_axis(r_top * c0, hy, r_top * s0)
            pos.extend([*p0, *p1, *p2, *p3])
            n0 = rot_norm(c0, 0.15, s0)
            n1 = rot_norm(c1, 0.15, s1)
            nrm.extend([*n0, *n1, *n1, *n0])
            ind.extend([base, base + 1, base + 2, base, base + 2, base + 3])

        # Top cap
        if r_top > 0.001:
            top_center_idx = len(pos) // 3
            pos.extend(rot_axis(0.0, hy, 0.0))
            nrm.extend(rot_norm(0.0, 1.0, 0.0))
            for i in range(segs):
                a0 = (2.0 * math.pi * i) / segs
                a1 = (2.0 * math.pi * (i + 1)) / segs
                idx0 = len(pos) // 3
                pos.extend(rot_axis(r_top * math.cos(a0), hy, r_top * math.sin(a0)))
                nrm.extend(rot_norm(0.0, 1.0, 0.0))
                pos.extend(rot_axis(r_top * math.cos(a1), hy, r_top * math.sin(a1)))
                nrm.extend(rot_norm(0.0, 1.0, 0.0))
                ind.extend([top_center_idx, idx0 + 1, idx0])

        self.primitives_data.append((pos, nrm, ind, mat_idx, name))

    def to_glb_bytes(self) -> bytes:
        bin_buf = bytearray()
        buffer_views = []
        accessors = []
        meshes = []
        nodes = []

        for pos, nrm, ind, mat_idx, node_name in self.primitives_data:
            # Align to 4 bytes
            while len(bin_buf) % 4 != 0:
                bin_buf.append(0)

            # Positions
            pos_offset = len(bin_buf)
            for f in pos:
                bin_buf.extend(struct.pack("<f", f))
            pos_len = len(bin_buf) - pos_offset
            xs = pos[0::3]
            ys = pos[1::3]
            zs = pos[2::3]
            bv_pos = len(buffer_views)
            buffer_views.append({"buffer": 0, "byteOffset": pos_offset, "byteLength": pos_len, "target": 34962})
            acc_pos = len(accessors)
            accessors.append({
                "bufferView": bv_pos,
                "componentType": 5126,
                "count": len(xs),
                "type": "VEC3",
                "min": [min(xs), min(ys), min(zs)],
                "max": [max(xs), max(ys), max(zs)],
            })

            # Normals
            nrm_offset = len(bin_buf)
            for f in nrm:
                bin_buf.extend(struct.pack("<f", f))
            nrm_len = len(bin_buf) - nrm_offset
            bv_nrm = len(buffer_views)
            buffer_views.append({"buffer": 0, "byteOffset": nrm_offset, "byteLength": nrm_len, "target": 34962})
            acc_nrm = len(accessors)
            accessors.append({
                "bufferView": bv_nrm,
                "componentType": 5126,
                "count": len(nrm) // 3,
                "type": "VEC3",
            })

            # Indices (UNSIGNED_SHORT)
            ind_offset = len(bin_buf)
            for ix in ind:
                bin_buf.extend(struct.pack("<H", ix))
            ind_len = len(bin_buf) - ind_offset
            while len(bin_buf) % 4 != 0:
                bin_buf.append(0)
            bv_ind = len(buffer_views)
            buffer_views.append({"buffer": 0, "byteOffset": ind_offset, "byteLength": ind_len, "target": 34963})
            acc_ind = len(accessors)
            accessors.append({
                "bufferView": bv_ind,
                "componentType": 5123,
                "count": len(ind),
                "type": "SCALAR",
            })

            mesh_idx = len(meshes)
            meshes.append({
                "name": f"{node_name}_mesh",
                "primitives": [{
                    "attributes": {"POSITION": acc_pos, "NORMAL": acc_nrm},
                    "indices": acc_ind,
                    "material": mat_idx,
                }],
            })
            nodes.append({"name": node_name, "mesh": mesh_idx})

        root_children = list(range(len(nodes)))
        root_idx = len(nodes)
        nodes.append({"name": "Root", "children": root_children})

        gltf_dict = {
            "asset": {"version": "2.0", "generator": "ImamatDivanKhana-GLBCompiler-1.0"},
            "scene": 0,
            "scenes": [{"name": "Scene", "nodes": [root_idx]}],
            "nodes": nodes,
            "meshes": meshes,
            "materials": self.materials,
            "accessors": accessors,
            "bufferViews": buffer_views,
            "buffers": [{"byteLength": len(bin_buf)}],
        }
        json_bytes = json.dumps(gltf_dict, separators=(",", ":")).encode("utf-8")
        while len(json_bytes) % 4 != 0:
            json_bytes += b" "

        total_len = 12 + 8 + len(json_bytes) + 8 + len(bin_buf)
        out = bytearray()
        out.extend(struct.pack("<III", 0x46546C67, 2, total_len))
        out.extend(struct.pack("<II", len(json_bytes), 0x4E4F534A))
        out.extend(json_bytes)
        out.extend(struct.pack("<II", len(bin_buf), 0x004E4942))
        out.extend(bin_buf)
        return bytes(out)


def build_all_glb_models() -> dict:
    GLB_DIR.mkdir(parents=True, exist_ok=True)
    catalog = {}

    # 1. Caucasian Watchtower & Saklya Cluster
    b = GLBBuilder()
    m_stone = b.add_material("Limestone", (0.58, 0.53, 0.46, 1.0), 0.08, 0.86)
    m_dark = b.add_material("DarkSlate", (0.20, 0.18, 0.16, 1.0), 0.12, 0.80)
    m_wood = b.add_material("OakTimber", (0.42, 0.27, 0.14, 1.0), 0.05, 0.85)
    m_brass = b.add_material("BrassRim", (0.85, 0.66, 0.22, 1.0), 0.72, 0.32)
    b.add_cylinder("Plinth", m_dark, 1.35, 1.25, 0.22, 16, (0, 0.11, 0))
    b.add_cylinder("BrassRing", m_brass, 1.38, 1.38, 0.06, 16, (0, 0.18, 0))
    b.add_box("MainWatchtower", m_stone, (0.86, 2.55, 0.86), (0, 1.48, 0), taper_top=0.72)
    b.add_box("MachicolationCrown", m_dark, (0.74, 0.22, 0.74), (0, 2.78, 0), taper_top=1.08)
    b.add_box("SaklyaTier1", m_stone, (0.92, 0.68, 0.76), (-0.65, 0.56, 0.35), taper_top=0.96)
    b.add_box("SaklyaTier2", m_stone, (0.72, 0.58, 0.66), (0.62, 0.51, 0.28), taper_top=0.96)
    b.add_box("RoofBeam", m_wood, (0.96, 0.08, 0.80), (-0.65, 0.93, 0.35))
    catalog["watchtower"] = ("Caucasian_Watchtower.glb", b.to_glb_bytes())

    # 2. Bastion Fortress (Imperial Cordon)
    b = GLBBuilder()
    m_fort = b.add_material("BrickBastion", (0.52, 0.26, 0.24, 1.0), 0.12, 0.78)
    m_glacis = b.add_material("EarthGlacis", (0.30, 0.28, 0.22, 1.0), 0.05, 0.92)
    m_roof = b.add_material("IronRoof", (0.22, 0.28, 0.34, 1.0), 0.45, 0.52)
    b.add_cylinder("GlacisBase", m_glacis, 1.65, 1.42, 0.26, 8, (0, 0.13, 0))
    b.add_box("CurtainWalls", m_fort, (1.55, 0.62, 1.55), (0, 0.52, 0), taper_top=0.92)
    for bx, bz, nm in [(-0.78, -0.78, "BastionNW"), (0.78, -0.78, "BastionNE"), (-0.78, 0.78, "BastionSW"), (0.78, 0.78, "BastionSE")]:
        b.add_cylinder(nm, m_fort, 0.38, 0.32, 0.72, 6, (bx, 0.56, bz))
    b.add_box("CommandKeep", m_roof, (0.68, 0.55, 0.68), (0, 1.05, 0), taper_top=0.75)
    catalog["fortress"] = ("Bastion_Fortress.glb", b.to_glb_bytes())

    # 3. Mounted Naib on Caucasian Warhorse
    b = GLBBuilder()
    m_horse = b.add_material("WarhorseCoat", (0.16, 0.13, 0.11, 1.0), 0.10, 0.65)
    m_cherkeska = b.add_material("CherkeskaEmerald", (0.07, 0.48, 0.34, 1.0), 0.08, 0.72)
    m_papakha = b.add_material("PapakhaFleece", (0.12, 0.11, 0.10, 1.0), 0.04, 0.92)
    m_steel = b.add_material("BazalaiSteel", (0.86, 0.89, 0.92, 1.0), 0.88, 0.22)
    m_gold = b.add_material("GoldTrim", (0.94, 0.76, 0.24, 1.0), 0.78, 0.28)
    b.add_cylinder("BasePedestal", m_gold, 0.95, 0.88, 0.16, 16, (0, 0.08, 0))
    b.add_box("HorseBarrel", m_horse, (0.48, 0.46, 1.18), (0, 0.78, 0), taper_top=0.92)
    b.add_box("HorseNeck", m_horse, (0.28, 0.58, 0.34), (0, 1.16, 0.46), taper_top=0.72)
    b.add_box("HorseHead", m_horse, (0.22, 0.24, 0.44), (0, 1.38, 0.68), taper_top=0.68)
    for lx, lz, nm in [(-0.16, 0.42, "LegFL"), (0.16, 0.42, "LegFR"), (-0.16, -0.42, "LegBL"), (0.16, -0.42, "LegBR")]:
        b.add_box(nm, m_horse, (0.11, 0.62, 0.12), (lx, 0.38, lz))
    b.add_box("RiderTorso", m_cherkeska, (0.42, 0.62, 0.32), (0, 1.32, -0.04), taper_top=0.86)
    b.add_cylinder("RiderPapakha", m_papakha, 0.17, 0.19, 0.26, 10, (0, 1.82, -0.04))
    b.add_box("DrawnShashka", m_steel, (0.04, 0.72, 0.08), (0.32, 1.72, 0.18))
    b.add_cylinder("BannerPole", m_gold, 0.03, 0.03, 2.25, 8, (-0.28, 1.28, -0.15))
    b.add_box("ImamateBanner", m_cherkeska, (0.04, 0.46, 0.72), (-0.28, 2.12, -0.52))
    catalog["cavalry_naib"] = ("Cavalry_Naib.glb", b.to_glb_bytes())

    # 4. Imperial Infantry Column with Bayonets
    b = GLBBuilder()
    m_coat = b.add_material("ImperialGreenCoat", (0.14, 0.24, 0.18, 1.0), 0.08, 0.78)
    m_crimson = b.add_material("CrimsonBase", (0.68, 0.14, 0.16, 1.0), 0.35, 0.48)
    m_bayonet = b.add_material("BayonetSteel", (0.84, 0.86, 0.90, 1.0), 0.85, 0.25)
    b.add_cylinder("ColumnBase", m_crimson, 1.05, 0.96, 0.16, 16, (0, 0.08, 0))
    for rx in (-0.34, 0.0, 0.34):
        for rz in (-0.28, 0.24):
            nm = f"Inf_{rx}_{rz}"
            b.add_box(nm, m_coat, (0.22, 0.76, 0.20), (rx, 0.54, rz), taper_top=0.88)
            b.add_cylinder(f"Shako_{nm}", m_crimson, 0.09, 0.11, 0.20, 8, (rx, 1.02, rz))
            b.add_cylinder(f"Bayonet_{nm}", m_bayonet, 0.018, 0.008, 0.95, 6, (rx + 0.09, 1.12, rz + 0.06))
    catalog["imperial_column"] = ("Imperial_Column.glb", b.to_glb_bytes())

    # 5. Mountain Unicorn Cannon (Горный единорог)
    b = GLBBuilder()
    m_bronze = b.add_material("GunmetalBronze", (0.82, 0.62, 0.22, 1.0), 0.82, 0.28)
    m_carriage = b.add_material("CarriageOak", (0.36, 0.22, 0.11, 1.0), 0.08, 0.82)
    m_iron = b.add_material("WheelIron", (0.18, 0.18, 0.20, 1.0), 0.65, 0.42)
    b.add_cylinder("ArtilleryBase", m_carriage, 0.95, 0.88, 0.14, 16, (0, 0.07, 0))
    b.add_box("GunTrail", m_carriage, (0.28, 0.18, 1.15), (0, 0.38, -0.18), taper_top=0.85)
    b.add_cylinder("WheelL", m_iron, 0.38, 0.38, 0.09, 14, (-0.34, 0.45, 0.12), axis="x")
    b.add_cylinder("WheelR", m_iron, 0.38, 0.38, 0.09, 14, (0.34, 0.45, 0.12), axis="x")
    b.add_cylinder("UnicornBarrel", m_bronze, 0.14, 0.11, 1.18, 12, (0, 0.62, 0.26), axis="z")
    catalog["unicorn_cannon"] = ("Mountain_Unicorn_Cannon.glb", b.to_glb_bytes())

    # 6. Covered Supply Wagon (Сухарный и пороховой фургон)
    b = GLBBuilder()
    m_canvas = b.add_material("LinenTilt", (0.88, 0.83, 0.70, 1.0), 0.02, 0.92)
    m_plank = b.add_material("WagonWood", (0.45, 0.28, 0.13, 1.0), 0.06, 0.84)
    m_rim = b.add_material("IronRim", (0.20, 0.19, 0.18, 1.0), 0.55, 0.48)
    b.add_box("WagonBed", m_plank, (0.66, 0.28, 1.24), (0, 0.42, 0))
    b.add_cylinder("CanvasCover", m_canvas, 0.34, 0.34, 1.16, 10, (0, 0.64, 0), axis="z")
    for wx, wz, nm in [(-0.38, 0.38, "WFL"), (0.38, 0.38, "WFR"), (-0.38, -0.38, "WBL"), (0.38, -0.38, "WBR")]:
        b.add_cylinder(nm, m_rim, 0.26, 0.26, 0.07, 12, (wx, 0.28, wz), axis="x")
    catalog["supply_wagon"] = ("Supply_Wagon.glb", b.to_glb_bytes())

    # 7. Caucasian Golden Eagle (Горный каменный орёл)
    b = GLBBuilder()
    m_plumage = b.add_material("DarkPlumage", (0.22, 0.15, 0.09, 1.0), 0.06, 0.78)
    m_nape = b.add_material("GoldenNape", (0.78, 0.56, 0.20, 1.0), 0.12, 0.68)
    b.add_box("EagleBody", m_plumage, (0.24, 0.18, 0.78), (0, 0, 0), taper_top=0.75)
    b.add_box("EagleHead", m_nape, (0.16, 0.15, 0.26), (0, 0.05, 0.46), taper_top=0.65)
    b.add_box("WingLeft", m_plumage, (1.15, 0.05, 0.36), (-0.64, 0.04, 0.04), taper_top=0.82)
    b.add_box("WingRight", m_plumage, (1.15, 0.05, 0.36), (0.64, 0.04, 0.04), taper_top=0.82)
    b.add_box("TailFan", m_nape, (0.38, 0.04, 0.34), (0, 0.01, -0.48))
    catalog["golden_eagle"] = ("Caucasian_Golden_Eagle.glb", b.to_glb_bytes())

    blender_studio_files = {
        "vedeno_capital": "Vedeno_DivanKhana_Capital.glb",
        "watchtower": "Caucasian_Watchtower.glb",
        "fortress": "Bastion_Fortress.glb",
        "hero_hadji_murat": "Hero_Hadji_Murat.glb",
        "hero_baysungur": "Hero_Baysungur_Benoy.glb",
        "cavalry_naib": "Cavalry_Naib.glb",
        "unicorn_cannon": "Mountain_Unicorn_Cannon.glb",
        "imperial_column": "Imperial_Column.glb",
        "supply_wagon": "Supply_Wagon.glb",
        "stone_bridge": "Stone_Arch_Bridge.glb",
        "signal_beacon": "Signal_Fire_Beacon.glb",
        "golden_eagle": "Caucasian_Golden_Eagle.glb",
    }

    b64_map = {}
    for key, fname in blender_studio_files.items():
        out_path = GLB_DIR / fname
        if out_path.exists() and b"Blender" in out_path.read_bytes()[:600]:
            raw_glb = out_path.read_bytes()
            b64_map[key] = base64.b64encode(raw_glb).decode("ascii")
            print(f"  [BLENDER 4.2 GLB] {fname:<32} -> {len(raw_glb):>7,} bytes (key={key})")
        elif key in catalog:
            _, fallback_glb = catalog[key]
            out_path.write_bytes(fallback_glb)
            b64_map[key] = base64.b64encode(fallback_glb).decode("ascii")
            print(f"  [FALLBACK GLB]    {fname:<32} -> {len(fallback_glb):>7,} bytes (key={key})")
        elif out_path.exists():
            raw_glb = out_path.read_bytes()
            b64_map[key] = base64.b64encode(raw_glb).decode("ascii")
            print(f"  [DISK GLB]        {fname:<32} -> {len(raw_glb):>7,} bytes (key={key})")

    return b64_map


def main():
    print("==============================================================================")
    print(" IMAMAT 3D ASSET PIPELINE: NASA SRTM (.r16) + glTF 2.0 (.glb) COMPILER")
    print("==============================================================================")
    srtm_grids = {}
    for tid, (fname, label) in TERRAIN_SOURCES.items():
        p = HM_DIR / fname
        grid = sample_r16_grid(p, grid_n=65)
        grid["label"] = label
        srtm_grids[tid] = grid
        print(f"  [SRTM OK] {tid:<15} <- {fname:<36} (65x65 u16, min={grid['rawMin']}, max={grid['rawMax']})")

    glb_b64 = build_all_glb_models()

    js_lines = [
        "// Auto-generated by 04_UE5_ImamatWargame/Tools/build_3d_glb_and_srtm_pipeline.py",
        "// Real 16-bit NASA SRTM Caucasian gorge heightgrids + embedded glTF 2.0 (.glb) PBR 3D models",
        f"export const SRTM_REAL_GORGE_HEIGHTMAPS = {json.dumps(srtm_grids, indent=2)};",
        "",
        f"export const EMBEDDED_GLB_MODELS_BASE64 = {json.dumps(glb_b64, indent=2)};",
        "",
        "export function decodeSrtmHeightGrid(terrainId) {",
        "  const entry = SRTM_REAL_GORGE_HEIGHTMAPS[terrainId] || SRTM_REAL_GORGE_HEIGHTMAPS.salty_1847;",
        "  const bin = atob(entry.heightU16Base64);",
        "  const bytes = new Uint8Array(bin.length);",
        "  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);",
        "  const u16 = new Uint16Array(bytes.buffer);",
        "  const out = new Float32Array(u16.length);",
        "  for (let i = 0; i < u16.length; i++) out[i] = u16[i] / 65535.0;",
        "  return { gridSize: entry.gridSize, heights: out, label: entry.label };",
        "}",
        "",
        "export function decodeGlbArrayBuffer(modelKey) {",
        "  const b64 = EMBEDDED_GLB_MODELS_BASE64[modelKey];",
        "  if (!b64) return null;",
        "  const bin = atob(b64);",
        "  const bytes = new Uint8Array(bin.length);",
        "  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);",
        "  return bytes.buffer;",
        "}",
        "",
    ]
    OUT_JS.write_text("\n".join(js_lines), encoding="utf-8")
    print(f"  [JS OK]  {OUT_JS} ({OUT_JS.stat().st_size:,} bytes)")
    print("==============================================================================")


if __name__ == "__main__":
    main()
