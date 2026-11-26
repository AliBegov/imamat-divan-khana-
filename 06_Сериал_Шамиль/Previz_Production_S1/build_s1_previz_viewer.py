#!/usr/bin/env python3
"""
Генератор автономной производственной консоли Reference-First Live-Action Pipeline
(1-й сезон сериала-докудрамы «Шамиль: свод неба и кремень»).

Читает:
  - shamil_s1_continuity_registry.json
  - master_refs_manifest.json (Stage 1: Кастинг-портреты + Stage 2: Чистые мастер-локации)
  - s1_previz_shots.json (Stage 3: 72 одноклеточных кинокадра 16:9)
  - Previz_Production_S1/shared_refs/** и Previz_Production_S1/keyframes/**

Собирает:
  - ../Shamil_S1_Previz_Viewer.html (автономный HTML в корне 06_Сериал_Шамиль)
"""

import json
from pathlib import Path


def find_existing_media(base_dir: Path, rel_path: str) -> str | None:
    stem = Path(rel_path).with_suffix("")
    for ext in (".jpg", ".png", ".jpeg", ".webp"):
        candidate = base_dir / f"{stem}{ext}"
        if candidate.exists():
            return f"Previz_Production_S1/{stem}{ext}"
    return None


def find_generated_keyframe(keyframes_dir: Path, shot_id: str) -> str | None:
    for ext in (".png", ".jpg", ".jpeg", ".webp"):
        candidate = keyframes_dir / f"{shot_id}{ext}"
        if candidate.exists():
            return f"Previz_Production_S1/keyframes/{shot_id}{ext}"
    return None


def main() -> None:
    base_dir = Path(__file__).resolve().parent
    project_root = base_dir.parent
    keyframes_dir = base_dir / "keyframes"

    with (base_dir / "shamil_s1_continuity_registry.json").open("r", encoding="utf-8") as f:
        reg = json.load(f)
    with (base_dir / "master_refs_manifest.json").open("r", encoding="utf-8") as f:
        refs_doc = json.load(f)
    with (base_dir / "s1_previz_shots.json").open("r", encoding="utf-8") as f:
        shots_doc = json.load(f)

    def enrich_refs(items: list[dict], group_tag: str) -> tuple[list[dict], int]:
        out = []
        ready = 0
        for it in items:
            found = find_existing_media(base_dir, it["output_path"])
            if found:
                ready += 1
            out.append({
                **it,
                "group_tag": group_tag,
                "rendered_src": found,
            })
        return out, ready

    spine_refs, spine_ready = enrich_refs(refs_doc.get("stage_1_shamil_identity_spine", []), "SHAMIL_SPINE")
    cast_refs, cast_ready = enrich_refs(refs_doc.get("stage_1_core_s1_cast", []), "CAST_S1")
    loc_refs, loc_ready = enrich_refs(refs_doc.get("stage_2_master_location_plates", []), "LOC_S1")

    shots = shots_doc["shots"]
    enriched_shots = []
    generated_count = 0

    for s in shots:
        sid = s["shot_id"]
        gen_path = find_generated_keyframe(keyframes_dir, sid)
        if gen_path:
            generated_count += 1
        doc = s.get("docudrama_insert")
        doc_ref = doc["visual_ref"] if (doc and doc.get("visual_ref")) else None
        fallback_ref = s.get("existing_ref") or doc_ref

        char_badges = []
        for cid in s.get("characters", []):
            c_info = reg["characters"].get(cid, {})
            cname = c_info.get("name_ru", cid).split(" (")[0]
            age = s.get("character_ages", {}).get(cid)
            wcode = s.get("wardrobe_codes", {}).get(cid, "—")
            char_badges.append(
                f"{cname}" + (f" ({age} л.)" if age is not None else "") + f" · {wcode}"
            )

        enriched_shots.append({
            **s,
            "generated_keyframe": gen_path,
            "fallback_ref": fallback_ref,
            "location_desc": reg["locations"].get(s["location_id"], s["location_id"]),
            "char_badges": char_badges,
        })

    ep_titles = {
        1: "Е01 · Мальчик по имени Али (1797–1823)",
        2: "Е02 · Клятва в Яраге (1824–1830)",
        3: "Е03 · Прыжок из огня (1831–1833)",
        4: "Е04 · Кровь в мечети (1834)",
        5: "Е05 · Родник Бурундук-Кале (1835–1837)",
        6: "Е06 · Осиное гнездо (май–3 июля 1839)",
        7: "Е07 · Цена воды (4 июля–17 авг. 1839)",
        8: "Е08 · Чёрная река (17–31 авг. 1839)",
    }

    total_refs = len(spine_refs) + len(cast_refs) + len(loc_refs)
    ready_refs = spine_ready + cast_ready + loc_ready

    html_content = f"""<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ШАМИЛЬ: СВОД НЕБА И КРЕМЕНЬ — Reference-First Консоль кастинга и раскадровки С1</title>
  <style>
    :root {{
      --bg: #0c0e12;
      --panel: #151922;
      --panel-2: #1d2330;
      --gold: #d4a853;
      --gold-soft: rgba(212, 168, 83, 0.16);
      --crimson: #b93c3c;
      --crimson-soft: rgba(185, 60, 60, 0.18);
      --green: #34a867;
      --green-soft: rgba(52, 168, 103, 0.16);
      --text: #ece9e2;
      --muted: #9aa3b2;
      --border: rgba(212, 168, 83, 0.24);
    }}
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: radial-gradient(circle at 18% 0%, #19202d 0%, #0a0c10 72%);
      color: var(--text);
      line-height: 1.5;
      padding-bottom: 60px;
    }}
    header.topbar {{
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(12, 14, 18, 0.94);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid var(--border);
      padding: 14px 24px;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }}
    .brand h1 {{
      font-family: "Georgia", serif;
      font-size: 18px;
      color: var(--gold);
      letter-spacing: 0.04em;
    }}
    .brand p {{
      font-size: 12px;
      color: var(--muted);
    }}
    .stats {{
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }}
    .pill {{
      font-size: 12px;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 6px;
      background: var(--panel-2);
      border: 1px solid var(--border);
      color: var(--text);
    }}
    .pill.gold {{ background: var(--gold-soft); color: #f6d58e; }}
    .pill.green {{ background: var(--green-soft); border-color: rgba(52, 168, 103, 0.45); color: #86efac; }}
    .container {{
      max-width: 1440px;
      margin: 20px auto;
      padding: 0 22px;
    }}
    .canon-banner {{
      background: rgba(212, 168, 83, 0.09);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 12px 16px;
      margin-bottom: 16px;
      font-size: 13px;
      color: #e6dfd1;
    }}
    .canon-banner strong {{ color: var(--gold); }}
    .filters {{
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 18px;
    }}
    .filter-btn {{
      background: var(--panel);
      color: var(--muted);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 7px;
      padding: 7px 12px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;
    }}
    .filter-btn:hover {{
      color: var(--gold);
      border-color: var(--gold);
    }}
    .filter-btn.active {{
      background: var(--gold);
      color: #0b0d11;
      border-color: var(--gold);
    }}
    .hero-inspector {{
      display: grid;
      grid-template-columns: 1.35fr 1fr;
      gap: 20px;
      background: linear-gradient(155deg, var(--panel) 0%, #10131a 100%);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 18px;
      margin-bottom: 24px;
    }}
    @media (max-width: 980px) {{
      .hero-inspector {{ grid-template-columns: 1fr; }}
    }}
    .stage-box {{
      position: relative;
      width: 100%;
      aspect-ratio: 16 / 9;
      background: #060709;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 8px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }}
    .stage-box img {{
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }}
    .stage-placeholder {{
      padding: 28px;
      text-align: center;
      color: var(--muted);
      font-size: 13px;
      max-width: 520px;
    }}
    .stage-tag {{
      position: absolute;
      top: 10px;
      left: 10px;
      font-size: 11px;
      font-weight: 700;
      padding: 4px 9px;
      border-radius: 5px;
      background: rgba(10, 12, 16, 0.86);
      border: 1px solid var(--border);
      color: var(--gold);
      letter-spacing: 0.04em;
    }}
    .inspector-meta h2 {{
      font-family: "Georgia", serif;
      font-size: 20px;
      color: var(--text);
      margin-bottom: 8px;
    }}
    .meta-row {{
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 10px;
    }}
    .tag {{
      font-size: 11px;
      padding: 3px 8px;
      border-radius: 4px;
      background: var(--panel-2);
      border: 1px solid rgba(255,255,255,0.1);
      color: #d1d7e2;
    }}
    .block {{
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 8px;
      padding: 10px 12px;
      margin-bottom: 10px;
      font-size: 12.5px;
    }}
    .block-title {{
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--gold);
      font-weight: 700;
      margin-bottom: 4px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }}
    .copy-btn {{
      background: rgba(212,168,83,0.18);
      color: #f6d58e;
      border: 1px solid var(--border);
      border-radius: 4px;
      padding: 2px 8px;
      font-size: 10.5px;
      cursor: pointer;
    }}
    .block.mutation {{
      border-color: rgba(185, 60, 60, 0.45);
      background: var(--crimson-soft);
    }}
    .grid {{
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
      gap: 14px;
    }}
    .card {{
      background: var(--panel);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 10px;
      overflow: hidden;
      cursor: pointer;
      transition: transform 0.15s, border-color 0.15s;
      display: flex;
      flex-direction: column;
    }}
    .card:hover {{
      transform: translateY(-2px);
      border-color: var(--gold);
    }}
    .card.selected {{
      border: 2px solid var(--gold);
      box-shadow: 0 0 0 3px var(--gold-soft);
    }}
    .thumb {{
      position: relative;
      width: 100%;
      aspect-ratio: 16 / 9;
      background: #080a0e;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }}
    .thumb img {{
      width: 100%;
      height: 100%;
      object-fit: cover;
    }}
    .thumb-empty {{
      font-size: 11.5px;
      color: #8b95a5;
      padding: 14px;
      text-align: center;
    }}
    .thumb-badge {{
      position: absolute;
      bottom: 8px;
      right: 8px;
      font-size: 10px;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 4px;
      background: rgba(12,14,18,0.86);
      border: 1px solid rgba(255,255,255,0.18);
    }}
    .thumb-badge.gen {{ border-color: var(--green); color: #86efac; }}
    .thumb-badge.ref {{ border-color: var(--gold); color: #f6d58e; }}
    .card-body {{
      padding: 12px 14px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }}
    .card-id {{
      font-size: 11px;
      color: var(--gold);
      font-weight: 700;
      display: flex;
      justify-content: space-between;
    }}
    .card-title {{
      font-family: "Georgia", serif;
      font-size: 14px;
      color: var(--text);
      font-weight: 600;
    }}
    .card-sub {{
      font-size: 11.5px;
      color: var(--muted);
    }}
    .nav-btns {{
      display: flex;
      gap: 8px;
      margin-top: 10px;
    }}
  </style>
</head>
<body>
  <header class="topbar">
    <div class="brand">
      <h1>ШАМИЛЬ: СВОД НЕБА И КРЕМЕНЬ — REFERENCE-FIRST КОНСОЛЬ С1</h1>
      <p>Этап 1: Актёрские кастинг-эталоны (35mm) → Этап 2: Чистые мастер-локации → Этап 3: 72 кинокадра сцен</p>
    </div>
    <div class="stats">
      <span class="pill gold">Мастер-эталоны (Stage 1–2): {ready_refs} / {total_refs}</span>
      <span class="pill green">Утверждённые кадры сцен (Stage 3): {generated_count} / {len(enriched_shots)}</span>
      <span class="pill">Персонажей: {len(reg["characters"])} · Локаций: {len(reg["locations"])}</span>
    </div>
  </header>

  <main class="container">
    <div class="canon-banner">
      <strong>Закон исторического кастинга и конвейера:</strong>
      1) Имам Шамиль (<code>CHAR_01</code>) с детства и весь 1-й сезон (<code>1797–1839</code>) — <strong>природный кавказский брюнет</strong> (угольно-чёрные волосы, прямые чёрные брови, плотная чёрная борода без рыжины); медно-рыжий тон появляется <strong>только в пожилом возрасте (1850–1860-е, С3–С4)</strong> от окрашивания седеющей бороды хной по сунне.
      2) Сначала утверждаются крупноплановые кинопортреты кастинга (<code>shared_refs/characters/</code>) и чистые локации (<code>shared_refs/locations/</code>), которые затем подаются как <em>Ingredients</em> для генерации сцен и видео.
    </div>

    <div class="filters" id="filters"></div>

    <section class="hero-inspector" id="inspector">
      <div>
        <div class="stage-box" id="stage-box"></div>
        <div class="nav-btns">
          <button class="filter-btn" id="prev-btn">← Предыдущий</button>
          <button class="filter-btn" id="next-btn">Следующий →</button>
        </div>
      </div>
      <div class="inspector-meta" id="inspector-meta"></div>
    </section>

    <section class="grid" id="grid"></section>
  </main>

  <script>
    const SHAMIL_SPINE = {json.dumps(spine_refs, ensure_ascii=False)};
    const CAST_REFS = {json.dumps(cast_refs, ensure_ascii=False)};
    const LOC_REFS = {json.dumps(loc_refs, ensure_ascii=False)};
    const SHOTS = {json.dumps(enriched_shots, ensure_ascii=False)};
    const EP_TITLES = {json.dumps(ep_titles, ensure_ascii=False)};

    let currentTab = "SHAMIL_SPINE";
    let selectedId = SHAMIL_SPINE[0].ref_id;

    function esc(str) {{
      return String(str || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    }}

    function copyText(txt, btn) {{
      navigator.clipboard.writeText(txt);
      const orig = btn.textContent;
      btn.textContent = "Скопировано!";
      setTimeout(() => btn.textContent = orig, 1200);
    }}

    function getActiveList() {{
      if (currentTab === "SHAMIL_SPINE") return SHAMIL_SPINE.map(r => ({{ ...r, _kind: "REF", _id: r.ref_id }}));
      if (currentTab === "CAST_S1") return CAST_REFS.map(r => ({{ ...r, _kind: "REF", _id: r.ref_id }}));
      if (currentTab === "LOC_S1") return LOC_REFS.map(r => ({{ ...r, _kind: "REF", _id: r.ref_id }}));
      if (currentTab === "ALL_SHOTS") return SHOTS.map(s => ({{ ...s, _kind: "SHOT", _id: s.shot_id }}));
      const ep = Number(currentTab);
      return SHOTS.filter(s => s.episode === ep).map(s => ({{ ...s, _kind: "SHOT", _id: s.shot_id }}));
    }}

    function renderFilters() {{
      const root = document.getElementById("filters");
      const tabs = [
        {{ key: "SHAMIL_SPINE", label: `Этап 1А · Эволюция Шамиля (${{SHAMIL_SPINE.length}})` }},
        {{ key: "CAST_S1", label: `Этап 1Б · Кастинг героев С1 (${{CAST_REFS.length}})` }},
        {{ key: "LOC_S1", label: `Этап 2 · Чистые локации (${{LOC_REFS.length}})` }},
        {{ key: "ALL_SHOTS", label: `Этап 3 · Все 72 шота` }},
      ];
      for (let e = 1; e <= 8; e++) {{
        tabs.push({{ key: String(e), label: `С${{e}}` }});
      }}
      root.innerHTML = "";
      for (const t of tabs) {{
        const btn = document.createElement("button");
        btn.className = "filter-btn" + (currentTab === t.key ? " active" : "");
        btn.textContent = t.label;
        btn.onclick = () => {{
          currentTab = t.key;
          const list = getActiveList();
          if (list.length && !list.some(x => x._id === selectedId)) {{
            selectedId = list[0]._id;
          }}
          renderFilters();
          renderInspector();
          renderGrid();
        }};
        root.appendChild(btn);
      }}
    }}

    function renderInspector() {{
      const list = getActiveList();
      const item = list.find(x => x._id === selectedId) || list[0];
      const stage = document.getElementById("stage-box");
      const meta = document.getElementById("inspector-meta");

      if (item._kind === "REF") {{
        const src = item.rendered_src || (item.character_id === "CHAR_01" && item.age >= 35 && item.age <= 50 ? "Визуальный_каталог/Portrait_Imam_Shamil_Vedeno_1845.jpg" : null);
        const tag = item.rendered_src ? "APPROVED 35MM MASTER REF" : "STAGE 1–2 MASTER PROMPT READY";
        if (src) {{
          stage.innerHTML = `<img src="${{esc(src)}}" alt="${{esc(item.ref_id)}}" /><div class="stage-tag">${{tag}}</div>`;
        }} else {{
          stage.innerHTML = `<div class="stage-placeholder">Ожидает генерации эталонного 35mm-кастинг-кадра:<br/><code>Previz_Production_S1/${{esc(item.output_path)}}</code></div><div class="stage-tag">${{tag}}</div>`;
        }}
        const noteHtml = item.historical_note_ru
          ? `<div class="block mutation"><div class="block-title">Антропологический и исторический контроль</div>${{esc(item.historical_note_ru)}}</div>`
          : "";
        const condHtml = item.condition_from_ref
          ? `<div class="block"><div class="block-title">Опорный Ingredient предыдущего возраста</div><code>${{esc(item.condition_from_ref)}}</code> (подаётся в Google Flow / референс-вход для 100% сохранения костной геометрии лица)</div>`
          : "";
        meta.innerHTML = `
          <div class="meta-row">
            <span class="pill gold">${{esc(item.ref_id)}}</span>
            <span class="pill">Файл: ${{esc(item.output_path)}}</span>
          </div>
          <h2>${{esc(item.title_ru)}}</h2>
          ${{noteHtml}}
          ${{condHtml}}
          <div class="block">
            <div class="block-title">
              <span>Master 35mm Live-Action Prompt (EN)</span>
              <button class="copy-btn" id="copy-ref-prompt">Копировать</button>
            </div>
            ${{esc(item.prompt_en)}}
          </div>
        `;
        document.getElementById("copy-ref-prompt").onclick = (ev) => copyText(item.prompt_en, ev.target);
        return;
      }}

      const shot = item;
      const imgSrc = shot.generated_keyframe || shot.fallback_ref;
      const badgeLabel = shot.generated_keyframe
        ? "APPROVED 16:9 SCENE KEYFRAME"
        : (shot.fallback_ref ? "3D / ARCHIVE REFERENCE" : "STAGE 3 SCENE PROMPT READY");
      if (imgSrc) {{
        stage.innerHTML = `<img src="${{esc(imgSrc)}}" alt="${{esc(shot.shot_id)}}" /><div class="stage-tag">${{badgeLabel}}</div>`;
      }} else {{
        stage.innerHTML = `<div class="stage-placeholder">Сценический кадр генерируется на Этапе 3 с подключением утверждённых портретов и локации (Ingredients).</div><div class="stage-tag">${{badgeLabel}}</div>`;
      }}
      const docBlock = shot.docudrama_insert
        ? `<div class="block"><div class="block-title">Документальная врезка (${{shot.docudrama_insert.duration_s}} с)</div>${{esc(shot.docudrama_insert.caption_ru)}}</div>`
        : "";
      const ingHtml = (shot.master_ingredients || []).map(i => `<span class="tag">${{esc(i)}}</span>`).join("");
      meta.innerHTML = `
        <div class="meta-row">
          <span class="pill gold">${{esc(shot.shot_id)}}</span>
          <span class="pill">${{esc(EP_TITLES[shot.episode] || ("Серия " + shot.episode))}}</span>
          <span class="pill">Эпоха: ${{esc(shot.era)}}</span>
          <span class="pill">${{esc(shot.location_id)}}</span>
        </div>
        <h2>${{esc(shot.scene_title_ru)}}</h2>
        <div class="meta-row">
          ${{shot.char_badges.map(b => `<span class="tag">${{esc(b)}}</span>`).join("")}}
        </div>
        <div class="block"><div class="block-title">Входные Ingredients (Stage 1 & 2 Refs)</div><div class="meta-row" style="margin-top:4px;margin-bottom:0">${{ingHtml}}</div></div>
        <div class="block"><div class="block-title">Входное состояние (Initial State)</div>${{esc(shot.continuity_state_in)}}</div>
        <div class="block mutation"><div class="block-title">Воздействие и выходное состояние (Impact → Exit)</div>${{esc(shot.continuity_state_out)}}</div>
        ${{docBlock}}
        <div class="block">
          <div class="block-title">
            <span>Single-Frame 35mm Image Prompt (EN)</span>
            <button class="copy-btn" id="copy-shot-prompt">Копировать</button>
          </div>
          ${{esc(shot.image_prompt_en)}}
        </div>
        <div class="block"><div class="block-title">Video Motion & SFX Prompt (EN)</div>${{esc(shot.video_prompt_en)}}<br/><br/><em>SFX: ${{esc(shot.sfx_prompt_en)}}</em></div>
      `;
      document.getElementById("copy-shot-prompt").onclick = (ev) => copyText(shot.image_prompt_en, ev.target);
    }}

    function renderGrid() {{
      const root = document.getElementById("grid");
      const list = getActiveList();
      root.innerHTML = "";
      for (const it of list) {{
        const card = document.createElement("article");
        card.className = "card" + (it._id === selectedId ? " selected" : "");
        if (it._kind === "REF") {{
          const badge = it.rendered_src
            ? `<span class="thumb-badge gen">READY</span>`
            : `<span class="thumb-badge ref">STAGE 1–2</span>`;
          const thumbHtml = it.rendered_src
            ? `<img src="${{esc(it.rendered_src)}}" alt="${{esc(it.ref_id)}}" loading="lazy" />${{badge}}`
            : `<div class="thumb-empty">${{esc(it.ref_id)}}<br/>Ожидает генерации эталона</div>${{badge}}`;
          card.innerHTML = `
            <div class="thumb">${{thumbHtml}}</div>
            <div class="card-body">
              <div class="card-id"><span>${{esc(it.ref_id)}}</span><span>MASTER REF</span></div>
              <div class="card-title">${{esc(it.title_ru)}}</div>
              <div class="card-sub">${{esc(it.output_path)}}</div>
            </div>
          `;
        }} else {{
          const imgSrc = it.generated_keyframe || it.fallback_ref;
          const badge = it.generated_keyframe
            ? `<span class="thumb-badge gen">16:9 КАДР</span>`
            : (it.fallback_ref ? `<span class="thumb-badge ref">3D / АРХИВ</span>` : `<span class="thumb-badge">STAGE 3</span>`);
          const thumbHtml = imgSrc
            ? `<img src="${{esc(imgSrc)}}" alt="${{esc(it.shot_id)}}" loading="lazy" />${{badge}}`
            : `<div class="thumb-empty">${{esc(it.location_id)}} · ${{esc(it.era)}}</div>${{badge}}`;
          card.innerHTML = `
            <div class="thumb">${{thumbHtml}}</div>
            <div class="card-body">
              <div class="card-id"><span>${{esc(it.shot_id)}}</span><span>С${{it.episode}} · Сц.${{it.scene}}</span></div>
              <div class="card-title">${{esc(it.scene_title_ru)}}</div>
              <div class="card-sub">${{esc(it.location_id)}} · Ingredients: ${{(it.master_ingredients || []).length}}</div>
            </div>
          `;
        }}
        card.onclick = () => {{
          selectedId = it._id;
          renderInspector();
          renderGrid();
          window.scrollTo({{ top: 0, behavior: "smooth" }});
        }};
        root.appendChild(card);
      }}
    }}

    document.getElementById("prev-btn").onclick = () => {{
      const list = getActiveList();
      const idx = list.findIndex(x => x._id === selectedId);
      if (idx > 0) {{
        selectedId = list[idx - 1]._id;
        renderInspector();
        renderGrid();
      }}
    }};

    document.getElementById("next-btn").onclick = () => {{
      const list = getActiveList();
      const idx = list.findIndex(x => x._id === selectedId);
      if (idx >= 0 && idx < list.length - 1) {{
        selectedId = list[idx + 1]._id;
        renderInspector();
        renderGrid();
      }}
    }};

    renderFilters();
    renderInspector();
    renderGrid();
  </script>
</body>
</html>
"""

    out_path = project_root / "Shamil_S1_Previz_Viewer.html"
    out_path.write_text(html_content, encoding="utf-8")
    print(
        f"Built {out_path} ({ready_refs}/{total_refs} master refs, "
        f"{generated_count}/{len(enriched_shots)} scene keyframes)."
    )


if __name__ == "__main__":
    main()
