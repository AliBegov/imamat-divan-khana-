#!/usr/bin/env python3
"""
Builds CC0 scanned photogrammetry PBR maps (Albedo + Normal + ARM) and photographed
mountain cloud sky equirectangular map from Poly Haven for Imamat WebGL2 Stage 1.
Outputs: 03_Веб_прототип_Диван_Хана/src/data/caucasusPbrTextures.js
"""

import base64
import io
import json
import pathlib
import subprocess
from PIL import Image

ROOT_DIR = pathlib.Path(__file__).resolve().parents[2]
OUT_JS = ROOT_DIR / "03_Веб_прототип_Диван_Хана" / "src" / "data" / "caucasusPbrTextures.js"
CACHE_DIR = ROOT_DIR / "04_UE5_ImamatWargame" / "Tools" / "_pbr_cache"
CACHE_DIR.mkdir(parents=True, exist_ok=True)

USER_AGENT = "ImamatDivanKhanaGame/2.5 (https://imamat-divan-khana.netlify.app)"


def curl_bytes(url: str) -> bytes:
    proc = subprocess.run(
        ["curl", "-fL", "-sS", "-A", USER_AGENT, url],
        capture_output=True,
        check=True,
    )
    return proc.stdout


def get_asset_files(slug: str) -> dict:
    cache_json = CACHE_DIR / f"{slug}_files.json"
    if cache_json.exists():
        return json.loads(cache_json.read_text(encoding="utf-8"))
    raw = curl_bytes(f"https://api.polyhaven.com/files/{slug}")
    cache_json.write_bytes(raw)
    return json.loads(raw.decode("utf-8"))


def download_and_resize_jpg(url: str, size: tuple[int, int], quality: int, cache_name: str) -> str:
    cached_out = CACHE_DIR / f"{cache_name}_{size[0]}x{size[1]}_q{quality}.jpg"
    if cached_out.exists():
        b64 = base64.b64encode(cached_out.read_bytes()).decode("ascii")
        return f"data:image/jpeg;base64,{b64}"

    raw = curl_bytes(url)
    im = Image.open(io.BytesIO(raw)).convert("RGB")
    resized = im.resize(size, Image.Resampling.LANCZOS)
    buf = io.BytesIO()
    resized.save(buf, format="JPEG", quality=quality, optimize=True)
    out_bytes = buf.getvalue()
    cached_out.write_bytes(out_bytes)
    b64 = base64.b64encode(out_bytes).decode("ascii")
    print(f"  [OK] {cache_name}: {im.size} -> {size}, {len(out_bytes):,} bytes")
    return f"data:image/jpeg;base64,{b64}"


def pick_map_url(files_json: dict, keys: list[str]) -> str | None:
    for k in keys:
        if k in files_json:
            node = files_json[k]
            if isinstance(node, dict):
                if "1k" in node and "jpg" in node["1k"]:
                    return node["1k"]["jpg"]["url"]
                if "1k" in node and "png" in node["1k"]:
                    return node["1k"]["png"]["url"]
    return None


def main() -> None:
    print("Fetching Poly Haven CC0 Photogrammetry PBR & Pure-Sky metadata...")

    rock_files = get_asset_files("rock_face_03")
    grass_files = get_asset_files("aerial_grass_rock")
    mud_files = get_asset_files("brown_mud_leaves_01")

    masonry_slug = "castle_brick_broken_06"
    try:
        masonry_files = get_asset_files(masonry_slug)
        if not pick_map_url(masonry_files, ["Diffuse", "col_1"]):
            raise RuntimeError("Missing diffuse in castle_brick_broken_06")
    except Exception:
        masonry_slug = "stone_brick_wall_001"
        masonry_files = get_asset_files(masonry_slug)

    sky_files = get_asset_files("kloofendal_48d_partly_cloudy_puresky")
    sky_url = sky_files.get("tonemapped", {}).get("url")
    if not sky_url:
        raise RuntimeError("Missing tonemapped sky URL for kloofendal_48d_partly_cloudy_puresky")

    rock_diff = download_and_resize_jpg(
        pick_map_url(rock_files, ["Diffuse", "col_1"]), (512, 512), 82, "rock_face_03_diff"
    )
    rock_nor = download_and_resize_jpg(
        pick_map_url(rock_files, ["nor_gl"]), (512, 512), 82, "rock_face_03_nor"
    )
    rock_arm = download_and_resize_jpg(
        pick_map_url(rock_files, ["arm"]), (256, 256), 80, "rock_face_03_arm"
    )

    grass_diff = download_and_resize_jpg(
        pick_map_url(grass_files, ["Diffuse", "col_1"]), (512, 512), 82, "aerial_grass_rock_diff"
    )
    grass_nor = download_and_resize_jpg(
        pick_map_url(grass_files, ["nor_gl"]), (512, 512), 82, "aerial_grass_rock_nor"
    )

    mud_diff = download_and_resize_jpg(
        pick_map_url(mud_files, ["Diffuse", "col_1"]), (512, 512), 82, "brown_mud_leaves_01_diff"
    )
    mud_nor = download_and_resize_jpg(
        pick_map_url(mud_files, ["nor_gl"]), (512, 512), 82, "brown_mud_leaves_01_nor"
    )

    masonry_diff = download_and_resize_jpg(
        pick_map_url(masonry_files, ["Diffuse", "col_1"]), (512, 512), 82, f"{masonry_slug}_diff"
    )
    masonry_nor = download_and_resize_jpg(
        pick_map_url(masonry_files, ["nor_gl"]), (512, 512), 82, f"{masonry_slug}_nor"
    )
    masonry_arm_url = pick_map_url(masonry_files, ["arm"])
    masonry_arm = (
        download_and_resize_jpg(masonry_arm_url, (256, 256), 80, f"{masonry_slug}_arm")
        if masonry_arm_url
        else rock_arm
    )

    sky_equirect = download_and_resize_jpg(
        sky_url, (1024, 512), 84, "kloofendal_48d_partly_cloudy_puresky"
    )

    js_code = f"""// Автогенерировано Tools/build_stage1_pbr_pack.py (CC0 Poly Haven Photogrammetry + Pure Sky HDRI Tonemapped)
// Реальные фототекстуры скал (rock_face_03), альпийского дёрна (aerial_grass_rock),
// лесной грязи (brown_mud_leaves_01), кладки дикого камня ({masonry_slug}) и горного неба с облаками.
import * as THREE from 'three';

export const PBR_ROCK_DIFF_URI = '{rock_diff}';
export const PBR_ROCK_NOR_URI = '{rock_nor}';
export const PBR_ROCK_ARM_URI = '{rock_arm}';
export const PBR_GRASS_DIFF_URI = '{grass_diff}';
export const PBR_GRASS_NOR_URI = '{grass_nor}';
export const PBR_MUD_DIFF_URI = '{mud_diff}';
export const PBR_MUD_NOR_URI = '{mud_nor}';
export const PBR_MASONRY_DIFF_URI = '{masonry_diff}';
export const PBR_MASONRY_NOR_URI = '{masonry_nor}';
export const PBR_MASONRY_ARM_URI = '{masonry_arm}';
export const PBR_SKY_EQUIRECT_URI = '{sky_equirect}';

function createFallbackSkyDataTexture() {{
  const w = 64;
  const h = 32;
  const data = new Uint8Array(w * h * 4);
  for (let y = 0; y < h; y++) {{
    const v = y / (h - 1);
    let r;
    let g;
    let b;
    if (v > 0.52) {{
      const t = (v - 0.52) / 0.48;
      r = Math.round(168 - t * 105);
      g = Math.round(198 - t * 88);
      b = Math.round(225 - t * 45);
    }} else if (v > 0.45) {{
      const t = (v - 0.45) / 0.07;
      r = Math.round(92 + t * 76);
      g = Math.round(86 + t * 112);
      b = Math.round(74 + t * 151);
    }} else {{
      r = 68;
      g = 62;
      b = 52;
    }}
    for (let x = 0; x < w; x++) {{
      const idx = (y * w + x) * 4;
      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = 255;
    }}
  }}
  const tex = new THREE.DataTexture(data, w, h, THREE.RGBAFormat);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.mapping = THREE.EquirectangularReflectionMapping;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  return tex;
}}

/**
 * Создаёт свежий комплект PBR-текстур и PMREM-карту освещения IBL для конкретного WebGLRenderer.
 * Каждый viewport владеет своими текстурами и обязан вызвать pack.dispose() при размонтировании.
 */
export function loadCaucasusPbrPack(renderer, {{ onSkyReady }} = {{}}) {{
  const maxAniso = Math.min(8, renderer?.capabilities?.getMaxAnisotropy?.() || 4);
  const ownedTextures = [];
  let disposed = false;

  const makeRepeatTex = (uri, isColor = true) => {{
    const img = new Image();
    const tex = new THREE.Texture(img);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = isColor ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    tex.anisotropy = maxAniso;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = true;
    img.onload = () => {{
      if (!disposed) tex.needsUpdate = true;
    }};
    img.src = uri;
    ownedTextures.push(tex);
    return tex;
  }};

  const rockDiff = makeRepeatTex(PBR_ROCK_DIFF_URI, true);
  const rockNor = makeRepeatTex(PBR_ROCK_NOR_URI, false);
  const rockArm = makeRepeatTex(PBR_ROCK_ARM_URI, false);
  const grassDiff = makeRepeatTex(PBR_GRASS_DIFF_URI, true);
  const grassNor = makeRepeatTex(PBR_GRASS_NOR_URI, false);
  const mudDiff = makeRepeatTex(PBR_MUD_DIFF_URI, true);
  const mudNor = makeRepeatTex(PBR_MUD_NOR_URI, false);
  const masonryDiff = makeRepeatTex(PBR_MASONRY_DIFF_URI, true);
  const masonryNor = makeRepeatTex(PBR_MASONRY_NOR_URI, false);
  const masonryArm = makeRepeatTex(PBR_MASONRY_ARM_URI, false);

  const fallbackEquirect = createFallbackSkyDataTexture();
  ownedTextures.push(fallbackEquirect);

  let pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  let envRT = pmrem.fromEquirectangular(fallbackEquirect);

  // Отключаем мипмапы у equirectangular неба (wrapS Repeat + LinearFilter), чтобы убрать 1px шов atan() на горизонте
  const skyImg = new Image();
  const skyEquirectTex = new THREE.Texture(skyImg);
  skyEquirectTex.colorSpace = THREE.SRGBColorSpace;
  skyEquirectTex.mapping = THREE.EquirectangularReflectionMapping;
  skyEquirectTex.wrapS = THREE.RepeatWrapping;
  skyEquirectTex.wrapT = THREE.ClampToEdgeWrapping;
  skyEquirectTex.generateMipmaps = false;
  skyEquirectTex.minFilter = THREE.LinearFilter;
  skyEquirectTex.magFilter = THREE.LinearFilter;
  ownedTextures.push(skyEquirectTex);

  const pack = {{
    rockDiff,
    rockNor,
    rockArm,
    grassDiff,
    grassNor,
    mudDiff,
    mudNor,
    masonryDiff,
    masonryNor,
    masonryArm,
    skyEquirectTex,
    envMap: envRT.texture,
    dispose: () => {{
      disposed = true;
      if (pmrem) {{
        pmrem.dispose();
        pmrem = null;
      }}
      if (envRT) {{
        envRT.dispose();
        envRT = null;
      }}
      ownedTextures.forEach((tx) => tx.dispose());
    }}
  }};

  skyImg.onload = () => {{
    if (disposed || !pmrem) return;
    skyEquirectTex.needsUpdate = true;
    try {{
      const nextEnvRT = pmrem.fromEquirectangular(skyEquirectTex);
      if (disposed) {{
        nextEnvRT.dispose();
        return;
      }}
      const prevEnvRT = envRT;
      envRT = nextEnvRT;
      pack.envMap = nextEnvRT.texture;
      if (prevEnvRT) prevEnvRT.dispose();
      pmrem.dispose();
      pmrem = null;
      if (onSkyReady) onSkyReady(pack);
    }} catch {{
      if (pmrem) {{
        pmrem.dispose();
        pmrem = null;
      }}
    }}
  }};
  skyImg.src = PBR_SKY_EQUIRECT_URI;

  return pack;
}}
"""

    OUT_JS.write_text(js_code, encoding="utf-8")
    print(f"Wrote {OUT_JS}: {OUT_JS.stat().st_size:,} bytes (masonry={masonry_slug})")


if __name__ == "__main__":
    main()

