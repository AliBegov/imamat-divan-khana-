#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
IMAMAT: DIVAN-KHANA (1845) — Valve Steam Store «Coming Soon» Capsule Kit,
Official 1920x1080 Screenshots & 60-Second 1080p Gameplay Trailer Builder (Sprint 11 / Phase 6)
"""

import argparse
import json
import math
import pathlib
import struct
import subprocess
import sys
import wave
from PIL import Image, ImageDraw, ImageFont, ImageOps

SCRIPT_DIR = pathlib.Path(__file__).resolve().parent
ROOT_DIR = SCRIPT_DIR.parent.parent
KIT_DIR = ROOT_DIR / "05_Steam_Release_and_Playtest_Kit"
OUT_DIR = KIT_DIR / "Steam_Store_Coming_Soon_Kit"
SHOTS_OUT_DIR = OUT_DIR / "screenshots"
TRAILER_DIR = KIT_DIR / "Trailer_PostProduction"

FONT_SERIF_BOLD = "/System/Library/Fonts/Supplemental/Georgia Bold.ttf"
FONT_SERIF = "/System/Library/Fonts/Supplemental/Georgia.ttf"
FONT_SANS_BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"

CAPSULE_SPECS = [
    ("header_capsule", "header_capsule_920x430.png", 920, 430, "KeyArt_DivanKhana_Council_Vedeno_1845.jpg", "landscape"),
    ("small_capsule", "small_capsule_462x174.png", 462, 174, "KeyArt_Dargo_BeechForest_Ambush_1845.jpg", "compact"),
    ("main_capsule", "main_capsule_1232x706.png", 1232, 706, "KeyArt_DivanKhana_Council_Vedeno_1845.jpg", "hero"),
    ("vertical_capsule", "vertical_capsule_748x896.png", 748, 896, "KeyArt_Salty_Siege_CopperBasin_1847.jpg", "portrait"),
    ("library_capsule", "library_capsule_600x900.png", 600, 900, "KeyArt_Salty_Siege_CopperBasin_1847.jpg", "portrait"),
    ("library_hero", "library_hero_3840x1240.png", 3840, 1240, "Caucasus_SRTM_Realistic_Relief_1845.jpg", "banner"),
]


def load_font(path: str, size: int) -> ImageFont.FreeTypeFont:
    try:
        return ImageFont.truetype(path, size)
    except Exception:
        return ImageFont.load_default()


def draw_octagonal_crest(draw: ImageDraw.ImageDraw, cx: float, cy: float, radius: float) -> None:
    pts_outer = []
    pts_inner = []
    for i in range(8):
        ang = math.radians(22.5 + i * 45)
        pts_outer.append((cx + math.cos(ang) * radius, cy + math.sin(ang) * radius))
        pts_inner.append((cx + math.cos(ang) * (radius * 0.84), cy + math.sin(ang) * (radius * 0.84)))
    draw.polygon(pts_outer, fill=(22, 18, 14, 235), outline=(245, 180, 48, 255))
    draw.polygon(pts_inner, fill=(14, 22, 26, 240), outline=(217, 119, 6, 220))
    peaks = [
        (cx - radius * 0.56, cy + radius * 0.34),
        (cx - radius * 0.20, cy - radius * 0.16),
        (cx + radius * 0.02, cy + radius * 0.08),
        (cx + radius * 0.24, cy - radius * 0.26),
        (cx + radius * 0.56, cy + radius * 0.34),
    ]
    draw.polygon(peaks, fill=(52, 42, 30, 255), outline=(251, 191, 36, 255))
    star_r = radius * 0.14
    draw.ellipse((cx - star_r, cy - radius * 0.48 - star_r, cx + star_r, cy - radius * 0.48 + star_r), fill=(253, 224, 71, 255))


def apply_cinematic_vignette(img: Image.Image, bottom_darkness: float = 0.82, left_darkness: float = 0.0) -> Image.Image:
    w, h = img.size
    res = img.convert("RGBA")
    # Smooth bottom gradient layer
    bot = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d_bot = ImageDraw.Draw(bot)
    start_y = int(h * 0.32)
    for y in range(start_y, h):
        t = (y - start_y) / max(1, h - start_y)
        alpha = int(255 * bottom_darkness * (t ** 1.6))
        d_bot.line([(0, y), (w, y)], fill=(10, 11, 15, alpha))
    res = Image.alpha_composite(res, bot)
    # Smooth separate left gradient layer (full-width cosine falloff — zero hard seam!)
    if left_darkness > 0:
        lft = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        d_lft = ImageDraw.Draw(lft)
        end_x = int(w * 0.72)
        for x in range(0, end_x):
            t = 0.5 * (1.0 + math.cos(math.pi * (x / max(1, end_x))))
            alpha = int(255 * left_darkness * (t ** 1.35))
            d_lft.line([(x, 0), (x, h)], fill=(10, 11, 15, alpha))
        res = Image.alpha_composite(res, lft)
    # Subtle warm amber edge frame
    frm = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d_frm = ImageDraw.Draw(frm)
    border = max(2, min(w, h) // 160)
    d_frm.rectangle([border, border, w - border - 1, h - border - 1], outline=(217, 150, 48, 175), width=border)
    return Image.alpha_composite(res, frm)


def draw_text_with_shadow(draw, pos, text, font, fill, shadow=(0, 0, 0, 225), offset=2):
    x, y = pos
    draw.text((x + offset, y + offset), text, font=font, fill=shadow)
    draw.text((x, y), text, font=font, fill=fill)


def build_capsule(spec_id: str, filename: str, w: int, h: int, art_name: str, layout: str) -> dict:
    src_path = KIT_DIR / art_name
    base = Image.open(src_path).convert("RGB")
    fitted = ImageOps.fit(base, (w, h), method=Image.Resampling.LANCZOS, centering=(0.5, 0.38))

    if layout == "banner":
        comp = apply_cinematic_vignette(fitted, bottom_darkness=0.58, left_darkness=0.22)
    elif layout == "compact":
        comp = apply_cinematic_vignette(fitted, bottom_darkness=0.88, left_darkness=0.45)
        draw = ImageDraw.Draw(comp)
        f_title = load_font(FONT_SERIF_BOLD, 34)
        f_sub = load_font(FONT_SANS_BOLD, 14)
        draw_octagonal_crest(draw, 44, h // 2, 26)
        draw_text_with_shadow(draw, (82, 42), "IMAMAT", f_title, (253, 224, 130, 255), offset=2)
        draw_text_with_shadow(draw, (84, 84), "DIVAN-KHANA • 1845", f_sub, (245, 240, 228, 255), offset=2)
        draw_text_with_shadow(draw, (84, 108), "CAUCASUS GRAND STRATEGY", load_font(FONT_SANS_BOLD, 11), (245, 158, 11, 255), offset=1)
    elif layout == "landscape":
        # Valve Store Capsule Compliant: Clean game title + crest, zero marketing CTA badges
        comp = apply_cinematic_vignette(fitted, bottom_darkness=0.86, left_darkness=0.52)
        draw = ImageDraw.Draw(comp)
        draw_octagonal_crest(draw, 84, 88, 42)
        draw_text_with_shadow(draw, (142, 62), "CAUCASIAN MOUNTAIN WARFARE", load_font(FONT_SANS_BOLD, 16), (245, 180, 66, 255), offset=2)
        draw_text_with_shadow(draw, (142, 88), "1834 – 1859", load_font(FONT_SANS_BOLD, 15), (218, 210, 196, 240), offset=2)
        draw_text_with_shadow(draw, (48, 224), "IMAMAT:", load_font(FONT_SERIF_BOLD, 68), (254, 232, 162, 255), offset=3)
        draw_text_with_shadow(draw, (48, 304), "DIVAN-KHANA (1845)", load_font(FONT_SERIF_BOLD, 30), (248, 244, 235, 255), offset=2)
        draw_text_with_shadow(draw, (48, 358), "HISTORICAL 3D GRAND STRATEGY & SIEGE WARGAME", load_font(FONT_SANS_BOLD, 14), (251, 191, 36, 255), offset=2)
    elif layout == "hero":
        # Valve Store Main Capsule Compliant: Clean atmospheric key art + title, zero marketing CTA badges
        comp = apply_cinematic_vignette(fitted, bottom_darkness=0.88, left_darkness=0.48)
        draw = ImageDraw.Draw(comp)
        draw_octagonal_crest(draw, 112, 112, 56)
        draw_text_with_shadow(draw, (190, 82), "CAUCASIAN WAR • 1834–1859", load_font(FONT_SANS_BOLD, 21), (245, 180, 66, 255), offset=2)
        draw_text_with_shadow(draw, (190, 116), "HISTORICAL GRAND STRATEGY & 3D SIEGE WARGAME", load_font(FONT_SANS_BOLD, 16), (225, 218, 205, 235), offset=2)
        draw_text_with_shadow(draw, (64, 428), "IMAMAT:", load_font(FONT_SERIF_BOLD, 98), (254, 232, 162, 255), offset=4)
        draw_text_with_shadow(draw, (64, 542), "DIVAN-KHANA (1845)", load_font(FONT_SERIF_BOLD, 46), (250, 246, 238, 255), offset=3)
        draw_text_with_shadow(draw, (64, 616), "Rule through Law, Mounted Couriers & Black Powder", load_font(FONT_SERIF, 24), (251, 191, 36, 255), offset=2)
    else:
        comp = apply_cinematic_vignette(fitted, bottom_darkness=0.92, left_darkness=0.0)
        draw = ImageDraw.Draw(comp)
        scale = w / 600.0
        draw_octagonal_crest(draw, w / 2, int(115 * scale), int(56 * scale))
        f_title = load_font(FONT_SERIF_BOLD, int(74 * scale))
        f_sub = load_font(FONT_SERIF_BOLD, int(34 * scale))
        f_sub2 = load_font(FONT_SANS_BOLD, int(16 * scale))
        for txt, font, y_ratio, col in [
            ("IMAMAT", f_title, 0.63, (254, 232, 162, 255)),
            ("DIVAN-KHANA", f_sub, 0.74, (250, 246, 238, 255)),
            ("1845 • CAUCASUS WARGAME", f_sub2, 0.82, (251, 191, 36, 255)),
            ("3D RELIEF MAP • 25 ORDERS • SIEGES", load_font(FONT_SANS_BOLD, int(13 * scale)), 0.87, (215, 208, 196, 240)),
        ]:
            bbox = draw.textbbox((0, 0), txt, font=font)
            tw = bbox[2] - bbox[0]
            draw_text_with_shadow(draw, ((w - tw) / 2, int(h * y_ratio)), txt, font, col, offset=3)

    out_path = OUT_DIR / filename
    comp.convert("RGB").save(out_path, format="PNG", optimize=True)
    return {
        "id": spec_id,
        "filename": filename,
        "width": w,
        "height": h,
        "bytes": out_path.stat().st_size,
    }


def build_library_logo() -> dict:
    w, h = 1280, 720
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    draw_octagonal_crest(draw, w / 2, 175, 92)
    for txt, font, y, col in [
        ("IMAMAT", load_font(FONT_SERIF_BOLD, 126), 300, (254, 232, 162, 255)),
        ("DIVAN-KHANA • 1845", load_font(FONT_SERIF_BOLD, 56), 452, (250, 246, 238, 255)),
        ("CAUCASIAN GRAND STRATEGY & 3D MOUNTAIN WARFARE", load_font(FONT_SANS_BOLD, 24), 540, (245, 180, 66, 255)),
    ]:
        bbox = draw.textbbox((0, 0), txt, font=font)
        tw = bbox[2] - bbox[0]
        draw_text_with_shadow(draw, ((w - tw) / 2, y), txt, font, col, shadow=(0, 0, 0, 245), offset=5)
    out_path = OUT_DIR / "library_logo_1280x720.png"
    img.save(out_path, format="PNG", optimize=True)
    return {
        "id": "library_logo",
        "filename": "library_logo_1280x720.png",
        "width": w,
        "height": h,
        "bytes": out_path.stat().st_size,
    }


def collect_official_1080p_screenshots(artifact_dir: pathlib.Path) -> list[dict]:
    SHOTS_OUT_DIR.mkdir(parents=True, exist_ok=True)
    candidates = [
        ("screenshot_01_3d_map_table_1920x1080.png", artifact_dir / "sprint10_4_wide_1920x1080_en.png", KIT_DIR / "QA_Web_Gate_Screenshot.png"),
        ("screenshot_02_siege_cutaway_1920x1080.png", artifact_dir / "sprint10_2_siege_en_zero_leaks.png", KIT_DIR / "Diorama_Siege_Cutaway_Blindage_1847.jpg"),
        ("screenshot_03_naib_politics_25orders_1920x1080.png", artifact_dir / "sprint10_3_diplomacy_25orders_en.png", KIT_DIR / "Orders_Shamil_Kubachi_Showcase_1845.jpg"),
        ("screenshot_04_forest_ambush_3d_1920x1080.png", artifact_dir / "sprint5_3_forest_ambush_blender.png", KIT_DIR / "Diorama_Ichkeria_Forest_Ambush_1845.jpg"),
        ("screenshot_05_steamdeck_verified_1920x1080.png", artifact_dir / "sprint10_1_steamdeck_1280x800_en.png", KIT_DIR / "KeyArt_DivanKhana_Council_Vedeno_1845.jpg"),
    ]
    results = []
    for out_name, primary, fallback in candidates:
        src = primary if primary.exists() else fallback
        img = Image.open(src).convert("RGB")
        if img.size != (1920, 1080):
            img = ImageOps.fit(img, (1920, 1080), method=Image.Resampling.LANCZOS)
        dest = SHOTS_OUT_DIR / out_name
        img.save(dest, format="PNG", optimize=True)
        results.append({
            "filename": out_name,
            "width": 1920,
            "height": 1080,
            "bytes": dest.stat().st_size,
            "source": src.name,
        })
    return results


def synthesize_caucasus_trailer_audio(wav_path: pathlib.Path, duration_sec: float = 60.0) -> None:
    """Synthesizes a 60s stereo 44.1kHz D-Dorian Caucasus war-drum & duduk drone soundtrack."""
    sr = 44100
    n_samples = int(sr * duration_sec)
    melody = [146.83, 174.61, 196.00, 220.00, 196.00, 174.61, 164.81, 146.83]
    frames = bytearray()
    for i in range(n_samples):
        t = i / sr
        env = min(1.0, t / 2.2) * min(1.0, (duration_sec - t) / 3.0)
        drone = 0.24 * math.sin(2 * math.pi * 73.42 * t) + 0.14 * math.sin(2 * math.pi * 110.0 * t + 0.3)
        lead_gain = 0.0 if t < 3.5 else (0.14 if t < 24 else 0.21)
        note_idx = int(t / 3.75) % len(melody)
        note_pos = (t % 3.75) / 3.75
        note_env = math.sin(math.pi * min(1.0, note_pos * 1.1))
        vib = 1.0 + 0.006 * math.sin(2 * math.pi * 5.2 * t)
        f0 = melody[note_idx] * vib
        lead = lead_gain * note_env * (
            0.70 * math.sin(2 * math.pi * f0 * t)
            + 0.22 * math.sin(2 * math.pi * 2 * f0 * t)
            + 0.08 * math.sin(2 * math.pi * 3 * f0 * t)
        )
        bpm = 68.0 if t < 24.0 else (112.0 if t < 52.0 else 72.0)
        beat_len = 60.0 / bpm
        bt = t % beat_len
        drum_env = math.exp(-bt * 16.0)
        drum_freq = 58.0 + 42.0 * math.exp(-bt * 24.0)
        drum = (0.34 if t >= 10.0 else 0.14) * drum_env * math.sin(2 * math.pi * drum_freq * bt)

        sig_l = max(-0.92, min(0.92, env * (drone + lead * 1.04 + drum)))
        sig_r = max(-0.92, min(0.92, env * (drone * 0.98 + lead * 0.96 + drum * 1.02)))
        frames += struct.pack("<hh", int(sig_l * 30000), int(sig_r * 30000))

    with wave.open(str(wav_path), "wb") as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(sr)
        wf.writeframes(frames)


def build_60s_trailer_mp4(screenshots: list[dict]) -> dict | None:
    ffmpeg_bin = "/Library/Frameworks/Python.framework/Versions/3.13/bin/ffmpeg"
    if not pathlib.Path(ffmpeg_bin).exists():
        ffmpeg_bin = "ffmpeg"

    TRAILER_DIR.mkdir(parents=True, exist_ok=True)
    tmp_dir = OUT_DIR / "_trailer_tmp"
    tmp_dir.mkdir(parents=True, exist_ok=True)

    slide_defs = [
        (KIT_DIR / "KeyArt_DivanKhana_Council_Vedeno_1845.jpg", "CAUCASIAN WAR • 1834 – 1859", "IMAMAT: DIVAN-KHANA (1845)", "Rule through Law, Mounted Couriers & Black Powder"),
        (SHOTS_OUT_DIR / "screenshot_01_3d_map_table_1920x1080.png", "3D TOPOGRAPHIC WAR TABLE", "COMMAND TEN NAIBATES OVER LIVE SRTM RELIEF", "Visible Enemy Intent • Dynamic Fog of War • 4 Seasons"),
        (SHOTS_OUT_DIR / "screenshot_02_siege_cutaway_1920x1080.png", "MILYUTIN 3D SIEGE CUTAWAY", "DEFEND ROCK CITADELS & COUNTER-MINE SAPPERS", "Safarov's Copper Basin Sonar • 18 Chest Gazyrs"),
        (SHOTS_OUT_DIR / "screenshot_04_forest_ambush_3d_1920x1080.png", "THE 1845 BISCUIT EXPEDITION", "AMBUSH IMPERIAL COLUMNS IN ICHKERIA FORESTS", "Fell Beech Abatis • Cut Supply Trains • Kindjal Shock"),
        (SHOTS_OUT_DIR / "screenshot_03_naib_politics_25orders_1920x1080.png", "NAIB POLITICS & 25 KUBACHI ORDERS", "LOYALTY, AMBITION & GLORY ACROSS 32 DILEMMAS", "Authentic Silver-Niello Orders • 2–4 Turn Delayed Echoes"),
        (KIT_DIR / "KeyArt_Salty_Siege_CopperBasin_1847.jpg", "THREE FLAGSHIP CAMPAIGNS", "AKHULGO 1839 • DARGO 1845 • SALTY & CHOKH 1847", "4 Imperial Generals • 20,001-Run Balanced Difficulty Ladder"),
        (SHOTS_OUT_DIR / "screenshot_05_steamdeck_verified_1920x1080.png", "STEAM DECK 1280×800 TO 4K UHD", "ADAPTIVE CAUCASUS SCORE • STEAM CLOUD & ACHIEVEMENTS", "Full RU / EN Localization • Native macOS & Windows"),
        (KIT_DIR / "KeyArt_Dargo_BeechForest_Ambush_1845.jpg", "WISHLIST NOW ON STEAM", "IMAMAT: DIVAN-KHANA (1845)", "COMING SOON • PC (WINDOWS / MACOS) & STEAM DECK"),
    ]

    slide_paths = []
    for idx, (src_img, kicker, title, sub) in enumerate(slide_defs, start=1):
        img = Image.open(src_img).convert("RGB")
        img = ImageOps.fit(img, (1920, 1080), method=Image.Resampling.LANCZOS)
        comp = apply_cinematic_vignette(img, bottom_darkness=0.86 if idx in (1, 8) else 0.72, left_darkness=0.18)
        draw = ImageDraw.Draw(comp)
        if idx in (1, 8):
            draw_octagonal_crest(draw, 960, 260, 88)
            for txt, fnt, y, col in [
                (kicker, load_font(FONT_SANS_BOLD, 28), 400, (245, 180, 66, 255)),
                (title, load_font(FONT_SERIF_BOLD, 88), 460, (254, 232, 162, 255)),
                (sub, load_font(FONT_SANS_BOLD, 30), 590, (240, 236, 228, 255)),
            ]:
                bb = draw.textbbox((0, 0), txt, font=fnt)
                tw = bb[2] - bb[0]
                draw_text_with_shadow(draw, ((1920 - tw) / 2, y), txt, fnt, col, offset=4)
        else:
            draw.rounded_rectangle([64, 892, 1260, 1036], radius=14, fill=(10, 12, 16, 215), outline=(217, 150, 48, 220), width=2)
            draw_text_with_shadow(draw, (92, 906), kicker, load_font(FONT_SANS_BOLD, 20), (245, 180, 66, 255), offset=2)
            draw_text_with_shadow(draw, (92, 936), title, load_font(FONT_SERIF_BOLD, 38), (254, 240, 195, 255), offset=2)
            draw_text_with_shadow(draw, (92, 988), sub, load_font(FONT_SANS_BOLD, 21), (225, 220, 210, 255), offset=2)
        sp = tmp_dir / f"slide_{idx:02d}.png"
        comp.convert("RGB").save(sp, format="PNG")
        slide_paths.append(sp)

    wav_path = tmp_dir / "trailer_score.wav"
    synthesize_caucasus_trailer_audio(wav_path, duration_sec=60.0)

    out_mp4 = TRAILER_DIR / "Imamat_DivanKhana_Steam_Trailer_60s_1080p.mp4"
    inputs = []
    for sp in slide_paths:
        inputs += ["-loop", "1", "-t", "8.0", "-i", str(sp)]
    inputs += ["-i", str(wav_path)]

    fade_d = 0.57
    step = 8.0 - fade_d
    fc_parts = []
    for i in range(len(slide_paths)):
        fc_parts.append(f"[{i}:v]scale=1920:1080,fps=30,format=yuv420p[v{i}]")
    prev = "v0"
    for i in range(1, len(slide_paths)):
        offset = round(step * i, 3)
        nxt = f"xf{i}" if i < len(slide_paths) - 1 else "vout"
        fc_parts.append(f"[{prev}][v{i}]xfade=transition=fade:duration={fade_d}:offset={offset}[{nxt}]")
        prev = nxt
    filter_complex = ";".join(fc_parts)

    cmd = [
        ffmpeg_bin, "-y",
        *inputs,
        "-filter_complex", filter_complex,
        "-map", "[vout]",
        "-map", f"{len(slide_paths)}:a",
        "-c:v", "libx264", "-preset", "medium", "-crf", "24", "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "160k",
        "-t", "60",
        "-movflags", "+faststart",
        str(out_mp4),
    ]
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    for p in tmp_dir.glob("*"):
        p.unlink(missing_ok=True)
    tmp_dir.rmdir()

    return {
        "filename": out_mp4.name,
        "path": str(out_mp4),
        "durationSec": 60,
        "resolution": "1920x1080",
        "bytes": out_mp4.stat().st_size,
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--with-trailer", action="store_true", help="Also render 60s 1080p MP4 gameplay trailer")
    parser.add_argument("--artifact-dir", default="/Users/alibegov/.gemini/antigravity/brain/3d42cc95-faca-463f-8896-c788dca88d3f")
    args = parser.parse_args()

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    capsules = [build_capsule(*spec) for spec in CAPSULE_SPECS]
    capsules.append(build_library_logo())
    screenshots = collect_official_1080p_screenshots(pathlib.Path(args.artifact_dir))
    trailer_meta = build_60s_trailer_mp4(screenshots) if args.with_trailer else None

    manifest = {
        "appId": 3481840,
        "specVersion": "Valve-Steamworks-2026",
        "capsules": capsules,
        "screenshots1080p": screenshots,
        "trailer60s": trailer_meta,
    }
    manifest_path = OUT_DIR / "steam_store_capsules_manifest.json"
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")

    print("==============================================================================")
    print(" STEAM STORE «COMING SOON» CAPSULE & TRAILER KIT BUILDER (SPRINT 11)")
    print("==============================================================================")
    for c in capsules:
        print(f"  [OK] {c['filename']:32s} {c['width']}x{c['height']} ({c['bytes']:,} B)")
    print(f"  [OK] Official 1920x1080 Screenshots -> {len(screenshots)} PNG files")
    if trailer_meta:
        print(f"  [OK] 60s Gameplay Trailer MP4       -> {trailer_meta['filename']} ({trailer_meta['bytes']:,} B)")
    print(f"  [OK] Manifest                       -> {manifest_path.name}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
