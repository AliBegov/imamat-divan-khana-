// Общий модуль высокодетальной 3D-флоры, анатомической пехоты и осадных укреплений (Этап 2):
// - Ботанические RGBA-атласы (бук/дуб, сосна/ель, лесной папоротник, плетёные сапёрные туры)
// - Объединённые 3D-кроны с вынесенными сферическими нормалями и запечённым AO (60–120 FPS InstancedMesh)
// - Анатомические фигурки пехотинцев РИ (шинель, ранцы, кивера, скрещённые ремни, штыки) и мюридов (черкеска, папаха, газыри, кинжал)
// - Реалистичные двускатные офицерские палатки, плетёные туры с кольями и спицованные колёса обоза
import * as THREE from 'three';

function hash01(seed) {
  const s = Math.sin(seed * 127.1 + 311.7) * 43758.5453123;
  return s - Math.floor(s);
}

/**
 * Объединяет массив BufferGeometry в одну индексированную BufferGeometry с position, normal, uv и color.
 */
export function mergeBufferGeometries(geos) {
  let totalVerts = 0;
  let totalIdx = 0;
  const hasAnimPart = geos.some((g) => Boolean(g.attributes.aAnimPart));
  const normalized = geos.map((src) => {
    const pos = src.attributes.position;
    const count = pos.count;
    let nor = src.attributes.normal;
    if (!nor) {
      src.computeVertexNormals();
      nor = src.attributes.normal;
    }
    const uv = src.attributes.uv;
    const col = src.attributes.color;
    const animPart = src.attributes.aAnimPart;
    const idx = src.getIndex();
    const idxCount = idx ? idx.count : count;
    totalVerts += count;
    totalIdx += idxCount;
    return { count, pos, nor, uv, col, animPart, idx, idxCount };
  });

  const positions = new Float32Array(totalVerts * 3);
  const normals = new Float32Array(totalVerts * 3);
  const uvs = new Float32Array(totalVerts * 2);
  const colors = new Float32Array(totalVerts * 3);
  const animParts = hasAnimPart ? new Float32Array(totalVerts) : null;
  const indices = new Uint32Array(totalIdx);

  let vOffset = 0;
  let iOffset = 0;
  for (let g = 0; g < normalized.length; g++) {
    const item = normalized[g];
    for (let v = 0; v < item.count; v++) {
      const dst1 = vOffset + v;
      const dst3 = dst1 * 3;
      const dst2 = dst1 * 2;
      positions[dst3] = item.pos.getX(v);
      positions[dst3 + 1] = item.pos.getY(v);
      positions[dst3 + 2] = item.pos.getZ(v);
      normals[dst3] = item.nor.getX(v);
      normals[dst3 + 1] = item.nor.getY(v);
      normals[dst3 + 2] = item.nor.getZ(v);
      uvs[dst2] = item.uv ? item.uv.getX(v) : 0.5;
      uvs[dst2 + 1] = item.uv ? item.uv.getY(v) : 0.5;
      if (item.col) {
        colors[dst3] = item.col.getX(v);
        colors[dst3 + 1] = item.col.getY(v);
        colors[dst3 + 2] = item.col.getZ(v);
      } else {
        colors[dst3] = 1.0;
        colors[dst3 + 1] = 1.0;
        colors[dst3 + 2] = 1.0;
      }
      if (animParts) {
        animParts[dst1] = item.animPart ? item.animPart.getX(v) : 0.0;
      }
    }
    if (item.idx) {
      for (let i = 0; i < item.idxCount; i++) {
        indices[iOffset + i] = vOffset + item.idx.getX(i);
      }
    } else {
      for (let i = 0; i < item.count; i++) {
        indices[iOffset + i] = vOffset + i;
      }
    }
    vOffset += item.count;
    iOffset += item.idxCount;
  }

  geos.forEach((g) => g.dispose());
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  out.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  out.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  out.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  if (animParts) {
    out.setAttribute('aAnimPart', new THREE.BufferAttribute(animParts, 1));
  }
  out.setIndex(new THREE.BufferAttribute(indices, 1));
  return out;
}

function tagAnimPart(geo, partId) {
  const count = geo.attributes.position.count;
  const arr = new Float32Array(count);
  arr.fill(partId);
  geo.setAttribute('aAnimPart', new THREE.BufferAttribute(arr, 1));
  return geo;
}

function setGeoColor(geo, r, g, b) {
  const count = geo.attributes.position.count;
  const cols = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    cols[i * 3] = r;
    cols[i * 3 + 1] = g;
    cols[i * 3 + 2] = b;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(cols, 3));
  return geo;
}

function makePartBox(w, h, d, tx = 0, ty = 0, tz = 0, rx = 0, ry = 0, rz = 0, color = [1, 1, 1]) {
  const g = new THREE.BoxGeometry(w, h, d);
  if (rx) g.rotateX(rx);
  if (ry) g.rotateY(ry);
  if (rz) g.rotateZ(rz);
  g.translate(tx, ty, tz);
  return setGeoColor(g, color[0], color[1], color[2]);
}

function makePartCyl(rt, rb, h, segs, tx = 0, ty = 0, tz = 0, rx = 0, ry = 0, rz = 0, color = [1, 1, 1]) {
  const g = new THREE.CylinderGeometry(rt, rb, h, segs);
  if (rx) g.rotateX(rx);
  if (ry) g.rotateY(ry);
  if (rz) g.rotateZ(rz);
  g.translate(tx, ty, tz);
  return setGeoColor(g, color[0], color[1], color[2]);
}

function makePartSphere(rad, segs, rings, tx = 0, ty = 0, tz = 0, sx = 1, sy = 1, sz = 1, color = [1, 1, 1]) {
  const g = new THREE.SphereGeometry(rad, segs, rings);
  g.scale(sx, sy, sz);
  g.translate(tx, ty, tz);
  return setGeoColor(g, color[0], color[1], color[2]);
}

// =============================================================================
// 1. БОТАНИЧЕСКИЕ RGBA-АТЛАСЫ (512x512, нейтрально-светлый тон под instanceColor)
// =============================================================================
export function createBeechFoliageAtlasTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, 512, 512);
    // Ветвистый каркас веточек кавказского бука (Fagus orientalis)
    const twigs = [
      [256, 488, 256, 265, 9],
      [256, 360, 148, 225, 6],
      [256, 330, 368, 210, 6],
      [256, 275, 196, 130, 4.5],
      [256, 275, 318, 125, 4.5],
      [195, 280, 112, 165, 3.5],
      [315, 265, 404, 168, 3.5],
      [256, 220, 256, 86, 3.5]
    ];
    ctx.lineCap = 'round';
    twigs.forEach(([x0, y0, x1, y1, lw]) => {
      ctx.strokeStyle = 'rgba(135, 116, 98, 0.94)';
      ctx.lineWidth = lw;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
    });

    // ~115 плотных перекрывающихся зубчатых листьев с прожилками и градиентом глубины
    for (let i = 0; i < 118; i++) {
      const a = hash01(i * 1.3 + 2.1) * Math.PI * 2;
      const rad = Math.pow(hash01(i * 2.7 + 4.3), 0.62) * 192;
      const cx = 256 + Math.cos(a) * rad * 1.04;
      const cy = 248 + Math.sin(a) * rad * 0.96 - 14;
      const len = 30 + hash01(i * 3.1) * 28;
      const wid = len * (0.48 + hash01(i * 4.7) * 0.16);
      const rot = a + (hash01(i * 5.9) - 0.5) * 1.2;
      const depthLayer = i / 118; // дальние темнее, ближние ярче под солнцем
      const lum = Math.round(145 + depthLayer * 98);
      const gTint = Math.min(255, lum + 10);
      const bTint = Math.max(120, lum - 16);

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      const grad = ctx.createLinearGradient(-len * 0.5, 0, len * 0.5, 0);
      grad.addColorStop(0.0, `rgba(${lum - 18}, ${gTint - 15}, ${bTint - 14}, 0.99)`);
      grad.addColorStop(0.6, `rgba(${lum}, ${gTint}, ${bTint}, 0.99)`);
      grad.addColorStop(1.0, `rgba(${Math.min(255, lum + 18)}, ${Math.min(255, gTint + 14)}, ${Math.min(245, bTint + 8)}, 0.99)`);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(-len * 0.48, 0);
      ctx.quadraticCurveTo(-len * 0.12, -wid * 0.58, len * 0.5, 0);
      ctx.quadraticCurveTo(-len * 0.12, wid * 0.58, -len * 0.48, 0);
      ctx.closePath();
      ctx.fill();

      // Центральная жилка листа
      ctx.strokeStyle = `rgba(${Math.max(95, lum - 42)}, ${Math.max(100, gTint - 38)}, ${Math.max(85, bTint - 42)}, 0.65)`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(-len * 0.44, 0);
      ctx.lineTo(len * 0.42, 0);
      ctx.stroke();
      ctx.restore();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

export function createConiferBoughAtlasTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, 512, 512);
    // Главный побег хвойной лапы и боковые ветки
    const shoots = [
      [256, 488, 256, 70, 9],
      [256, 390, 108, 255, 6],
      [256, 380, 404, 255, 6],
      [256, 305, 118, 170, 5],
      [256, 300, 396, 175, 5],
      [256, 215, 148, 100, 4],
      [256, 210, 364, 102, 4]
    ];
    ctx.lineCap = 'round';
    shoots.forEach(([x0, y0, x1, y1, lw]) => {
      ctx.strokeStyle = 'rgba(130, 98, 78, 0.96)';
      ctx.lineWidth = lw;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();

      // Пучки хвоинок вдоль каждой ветки
      const steps = 16;
      for (let s = 1; s <= steps; s++) {
        const u = s / steps;
        const px = x0 + (x1 - x0) * u;
        const py = y0 + (y1 - y0) * u;
        const bAng = Math.atan2(y1 - y0, x1 - x0);
        for (let k = -4; k <= 4; k++) {
          const nAng = bAng + k * 0.28 + (hash01(s * 17 + k) - 0.5) * 0.16;
          const nLen = (30 + hash01(s * 9 + k * 3) * 26) * (1.12 - u * 0.32);
          const lum = Math.round(150 + u * 85 - Math.abs(k) * 6);
          ctx.strokeStyle = `rgba(${lum - 8}, ${Math.min(255, lum + 10)}, ${lum - 4}, 0.96)`;
          ctx.lineWidth = 4.2;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px + Math.cos(nAng) * nLen, py + Math.sin(nAng) * nLen);
          ctx.stroke();
        }
      }
    });
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

export function createFernUndergrowthTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, 512, 512);
    const frondCount = 9;
    for (let f = 0; f < frondCount; f++) {
      const angle = -Math.PI * 0.5 + (f - (frondCount - 1) * 0.5) * 0.34;
      const length = 220 + hash01(f * 5.2) * 145;
      const lum = Math.round(168 + (f % 3) * 26);

      ctx.save();
      ctx.translate(256, 488);
      ctx.rotate(angle + Math.PI * 0.5);
      // Стебель вайи папоротника
      ctx.strokeStyle = `rgba(${lum - 34}, ${lum - 14}, ${lum - 48}, 0.95)`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo((f - 4) * 12, -length * 0.55, (f - 4) * 22, -length);
      ctx.stroke();

      // Перья листа папоротника по бокам
      const pinnae = 14;
      for (let p = 1; p <= pinnae; p++) {
        const u = p / pinnae;
        const yPos = -u * length * 0.96;
        const xBase = (f - 4) * 16 * u;
        const wing = Math.sin(u * Math.PI * 0.92) * 56 + 10;
        const tipFade = Math.min(255, Math.round(lum + u * 28));
        ctx.fillStyle = `rgba(${tipFade - 14}, ${tipFade}, ${tipFade - 26}, 0.96)`;
        for (const side of [-1, 1]) {
          ctx.beginPath();
          ctx.ellipse(xBase + side * wing * 0.52, yPos, wing * 0.54, 11.5, side * -0.25, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

export function createWickerGabionTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#5f3f21';
    ctx.fillRect(0, 0, 256, 256);
    // Горизонтальное плетение лозы
    for (let y = 0; y < 256; y += 12) {
      const rowAlt = (y / 12) % 2;
      for (let x = 0; x < 256; x += 28) {
        const shade = 78 + Math.round(hash01(x * 0.3 + y * 1.1) * 48);
        ctx.fillStyle = `rgb(${shade + 24}, ${shade - 4}, ${Math.max(20, shade - 36)})`;
        ctx.fillRect(x + rowAlt * 10, y + 1, 24, 9);
        ctx.fillStyle = 'rgba(28, 18, 9, 0.5)';
        ctx.fillRect(x, y + 10, 28, 2);
      }
    }
    // Вертикальные колья каркаса тура
    for (let vx = 8; vx < 256; vx += 32) {
      ctx.fillStyle = 'rgba(42, 26, 12, 0.55)';
      ctx.fillRect(vx, 0, 5, 256);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

// =============================================================================
// 2. ОБЪЕДИНЁННАЯ 3D-ГЕОМЕТРИЯ СТВОЛОВ, КРОН ЛИСТВЫ И КУСТАРНИКА
// =============================================================================
function makeSmoothTaperedTrunk({
  yMin = -0.16,
  yMax = 0.92,
  rBase = 0.118,
  rMid = 0.072,
  rTop = 0.048,
  bendX = 0.025,
  bendZ = -0.012,
  radialSegs = 8,
  heightSegs = 6
} = {}) {
  const geo = new THREE.CylinderGeometry(1.0, 1.0, yMax - yMin, radialSegs, heightSegs, false);
  const pos = geo.attributes.position;
  const cols = new Float32Array(pos.count * 3);
  const halfH = (yMax - yMin) * 0.5;
  for (let i = 0; i < pos.count; i++) {
    const lx = pos.getX(i);
    const ly = pos.getY(i);
    const lz = pos.getZ(i);
    const t = Math.max(0, Math.min(1, (ly + halfH) / Math.max(0.001, yMax - yMin)));
    // Естественное утолщение корневой шейки снизу (buttress flare) + плавное утончение ствола вверх
    const flare = Math.pow(1.0 - t, 3.2) * (rBase - rMid);
    const rad = rMid + (rTop - rMid) * t + flare;
    const ang = Math.atan2(lz, lx);
    const rootRib = 1.0 + Math.cos(ang * 3.0) * 0.16 * Math.pow(1.0 - t, 2.8);
    const cx = Math.sin(t * Math.PI * 0.85) * bendX;
    const cz = Math.sin(t * Math.PI * 0.75) * bendZ;
    pos.setXYZ(i, lx * rad * rootRib + cx, yMin + t * (yMax - yMin), lz * rad * rootRib + cz);

    // Плавный градиент вершинного AO от мшистой корневой шейки к светлой коре (БЕЗ швов!)
    const shade = 0.72 + 0.28 * Math.min(1.0, t * 1.45);
    cols[i * 3] = shade;
    cols[i * 3 + 1] = shade;
    cols[i * 3 + 2] = shade * 0.98;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(cols, 3));
  geo.computeVertexNormals();
  return geo;
}

export function createRealisticTrunkGeometry({ isPine = false } = {}) {
  const parts = [];
  if (isPine) {
    // Единый бесшовный стройный ствол кавказской сосны / пихты (y = -0.18 .. 1.62)
    parts.push(
      makeSmoothTaperedTrunk({
        yMin: -0.18,
        yMax: 1.62,
        rBase: 0.098,
        rMid: 0.062,
        rTop: 0.014,
        bendX: 0.015,
        bendZ: 0.006,
        radialSegs: 8,
        heightSegs: 7
      })
    );
    // 4 скелетных сука, поддерживающих ярусы хвойных лап
    parts.push(makePartCyl(0.013, 0.028, 0.38, 5, 0.14, 0.64, 0.04, 0.14, 0, -0.96, [0.92, 0.9, 0.88]));
    parts.push(makePartCyl(0.013, 0.026, 0.36, 5, -0.13, 0.82, -0.05, -0.18, 0, 0.92, [0.92, 0.9, 0.88]));
    parts.push(makePartCyl(0.011, 0.023, 0.30, 5, 0.04, 1.06, -0.12, -0.95, 0, -0.12, [0.95, 0.94, 0.92]));
    parts.push(makePartCyl(0.010, 0.021, 0.28, 5, -0.04, 1.18, 0.11, 0.92, 0, 0.14, [0.95, 0.94, 0.92]));
  } else {
    // Единый бесшовный ствол восточного бука с плавными контрфорсами корней (y = -0.18 .. 0.88)
    parts.push(
      makeSmoothTaperedTrunk({
        yMin: -0.18,
        yMax: 0.88,
        rBase: 0.122,
        rMid: 0.076,
        rTop: 0.052,
        bendX: 0.026,
        bendZ: -0.012,
        radialSegs: 8,
        heightSegs: 6
      })
    );
    // 4 раскидистых скелетных сука в подкуполы кроны
    parts.push(makePartCyl(0.023, 0.046, 0.54, 5, -0.16, 1.02, 0.09, 0.32, 0, 0.58, [0.92, 0.92, 0.90]));
    parts.push(makePartCyl(0.023, 0.046, 0.56, 5, 0.18, 1.06, -0.08, -0.26, 0, -0.60, [0.96, 0.96, 0.94]));
    parts.push(makePartCyl(0.021, 0.040, 0.48, 5, 0.02, 1.12, 0.14, -0.48, 0, 0.06, [0.95, 0.95, 0.92]));
    parts.push(makePartCyl(0.020, 0.038, 0.46, 5, -0.03, 1.14, -0.15, 0.46, 0, -0.08, [0.94, 0.94, 0.92]));
  }
  return mergeBufferGeometries(parts);
}

function buildLeafCard(w, h, centerPos, rotEuler, domeCenter, aoBrightness) {
  const card = new THREE.PlaneGeometry(w, h, 1, 1);
  // Лёгкий V-излом не нужен на 1x1, но сферическая нормализация по domeCenter даст идеальное объёмное освещение!
  const mat4 = new THREE.Matrix4().makeRotationFromEuler(rotEuler);
  mat4.setPosition(centerPos);
  card.applyMatrix4(mat4);

  const pos = card.attributes.position;
  const nor = card.attributes.normal;
  const cols = new Float32Array(pos.count * 3);
  const v = new THREE.Vector3();
  const n = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    n.subVectors(v, domeCenter);
    if (n.lengthSq() < 1e-4) n.set(0, 1, 0);
    n.normalize();
    // Подмешиваем верхнюю полусферу, чтобы теневые бока листвы не были глухо-чёрными
    n.y = n.y * 0.78 + 0.35;
    n.normalize();
    nor.setXYZ(i, n.x, n.y, n.z);

    const distFrac = Math.min(1.0, v.distanceTo(domeCenter) / 0.85);
    const shade = aoBrightness * (0.72 + 0.34 * distFrac);
    cols[i * 3] = shade;
    cols[i * 3 + 1] = shade;
    cols[i * 3 + 2] = shade;
  }
  card.setAttribute('color', new THREE.BufferAttribute(cols, 3));
  return card;
}

/**
 * 26 скрещённых лиственных карточек в 4 асимметричных подкуполах раскидистого восточного бука (52 треуг. / крона).
 */
export function createRealisticBeechCanopyGeometry() {
  const parts = [];
  const subDomes = [
    { cx: 0.0, cy: 1.24, cz: 0.0, r: 0.60, count: 9 },
    { cx: -0.36, cy: 0.98, cz: 0.18, r: 0.48, count: 6 },
    { cx: 0.38, cy: 1.00, cz: -0.16, r: 0.48, count: 6 },
    { cx: 0.04, cy: 0.96, cz: 0.34, r: 0.42, count: 5 }
  ];
  let seed = 1;
  subDomes.forEach((d) => {
    const dCenter = new THREE.Vector3(d.cx, d.cy, d.cz);
    for (let k = 0; k < d.count; k++) {
      const phi = (k / d.count) * Math.PI * 2 + seed * 0.43;
      const elev = (hash01(seed * 2.3) - 0.25) * 0.9;
      const offR = d.r * (0.22 + hash01(seed * 3.7) * 0.46);
      const pos = new THREE.Vector3(
        d.cx + Math.cos(phi) * offR,
        d.cy + Math.sin(elev) * d.r * 0.48,
        d.cz + Math.sin(phi) * offR
      );
      const euler = new THREE.Euler(
        (hash01(seed * 4.1) - 0.5) * 1.15,
        phi + hash01(seed * 5.3) * 1.4,
        (hash01(seed * 6.7) - 0.5) * 0.95
      );
      const cardSize = d.r * (1.30 + hash01(seed * 7.9) * 0.36);
      const ao = 0.76 + hash01(seed * 8.3) * 0.24;
      parts.push(buildLeafCard(cardSize, cardSize * 0.92, pos, euler, dCenter, ao));
      seed++;
    }
  });
  return mergeBufferGeometries(parts);
}

/**
 * Многоярусная кавказская сосна / пихта Нордмана: 6 веерных мутовок хвои + шпиль макушки (~44 треуг. / дерево).
 */
export function createRealisticConiferGeometry() {
  const parts = [];
  const tiers = [
    { y: 0.46, rad: 0.56, w: 1.06, h: 0.74, blades: 4 },
    { y: 0.72, rad: 0.49, w: 0.94, h: 0.70, blades: 4 },
    { y: 0.98, rad: 0.40, w: 0.80, h: 0.64, blades: 3 },
    { y: 1.22, rad: 0.32, w: 0.66, h: 0.56, blades: 3 },
    { y: 1.44, rad: 0.22, w: 0.48, h: 0.48, blades: 3 },
    { y: 1.63, rad: 0.13, w: 0.34, h: 0.40, blades: 3 }
  ];
  const centerCore = new THREE.Vector3(0, 1.02, 0);
  tiers.forEach((tier, tIdx) => {
    for (let b = 0; b < tier.blades; b++) {
      const ang = (b / tier.blades) * Math.PI * 2 + tIdx * 0.92;
      const pos = new THREE.Vector3(Math.cos(ang) * tier.rad * 0.46, tier.y, Math.sin(ang) * tier.rad * 0.46);
      // Наклон вниз-наружу как у настоящих хвойных лап горной ели и сосны
      const euler = new THREE.Euler(0.50, -ang + Math.PI * 0.5, 0.05 * (b - 1), 'YXZ');
      const ao = 0.70 + (tIdx / tiers.length) * 0.30;
      parts.push(buildLeafCard(tier.w, tier.h, pos, euler, centerCore, ao));
    }
  });
  // Шпиль-верхушка (два перекрещённых вертикальных побега)
  parts.push(buildLeafCard(0.32, 0.50, new THREE.Vector3(0, 1.80, 0), new THREE.Euler(0, 0.3, 0), centerCore, 1.0));
  parts.push(buildLeafCard(0.32, 0.50, new THREE.Vector3(0, 1.80, 0), new THREE.Euler(0, 1.85, 0), centerCore, 0.96));
  return mergeBufferGeometries(parts);
}

/**
 * Лесной подлесок (кавказский рододендрон / папоротник / горный кустарник, 6 скрещённых вееров = 12 треуг.).
 */
export function createUndergrowthBushGeometry() {
  const parts = [];
  const center = new THREE.Vector3(0, 0.14, 0);
  for (let i = 0; i < 6; i++) {
    const ang = (i / 6) * Math.PI + (i % 2) * 0.24;
    const pos = new THREE.Vector3(Math.cos(ang) * 0.08, 0.22, Math.sin(ang) * 0.08);
    const euler = new THREE.Euler(0.28 - (i % 2) * 0.12, ang, ((i % 3) - 1) * 0.18, 'YXZ');
    parts.push(buildLeafCard(0.82, 0.58, pos, euler, center, 0.82 + (i % 2) * 0.16));
  }
  return mergeBufferGeometries(parts);
}

/**
 * PBR-материал для растительных карточек с alphaTest: 0.42, мягким ветровым колыханием и подсвечиванием на просвет.
 */
export function createFoliageCardMaterial({ map, clippingPlanes = null, windStrength = 0.032, isPine = false } = {}) {
  const uniforms = {
    uFoliageTime: { value: 0.0 }
  };
  const mat = new THREE.MeshStandardMaterial({
    color: '#ffffff',
    map,
    vertexColors: true,
    alphaTest: 0.42,
    side: THREE.DoubleSide,
    roughness: isPine ? 0.84 : 0.76,
    metalness: 0.0,
    clippingPlanes: clippingPlanes || undefined
  });
  mat.userData.foliageUniforms = uniforms;
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uFoliageTime = uniforms.uFoliageTime;
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
        uniform float uFoliageTime;`
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        float swayWeight = smoothstep(0.2, 1.35, position.y);
        float instSeed = 0.0;
        #ifdef USE_INSTANCING
          instSeed = instanceMatrix[3][0] * 0.7 + instanceMatrix[3][2] * 1.1;
        #endif
        transformed.x += sin(uFoliageTime * 1.65 + instSeed + position.y * 1.8) * ${windStrength.toFixed(4)} * swayWeight;
        transformed.z += cos(uFoliageTime * 1.35 + instSeed * 1.3) * ${(windStrength * 0.7).toFixed(4)} * swayWeight;`
      );
  };
  mat.customProgramCacheKey = () => `imamat_foliage_card_${isPine ? 'pine' : 'leaf'}_${clippingPlanes ? 'clip' : 'full'}_v1`;
  return mat;
}

// =============================================================================
// 3. АНАТОМИЧЕСКИЕ ФИГУРКИ СОЛДАТ, МЮРИДОВ И ФОРТИФИКАЦИИ (ДЛЯ INSTANCED MESH)
// =============================================================================
/**
 * Возвращает { coatGeo, equipGeo, metalGeo } для пехоты Отдельного Кавказского корпуса (~88 треуг.).
 * Ноги на y = 0.0, верх кивера y = 0.50, штык до y = 0.58.
 */
export function createImperialSoldierGeometrySet() {
  const coatParts = [
    // Сапоги и голени (1.0 = левая нога, 2.0 = правая нога)
    tagAnimPart(makePartCyl(0.026, 0.028, 0.14, 5, -0.026, 0.07, 0, 0, 0, 0, [0.45, 0.45, 0.45]), 1.0),
    tagAnimPart(makePartCyl(0.026, 0.028, 0.14, 5, 0.026, 0.07, 0, 0, 0, 0, [0.45, 0.45, 0.45]), 2.0),
    // Расклешённые полы шинели и туловище в темно-зелёном мундире (3.0 = корпус)
    tagAnimPart(makePartCyl(0.056, 0.078, 0.13, 7, 0, 0.17, 0, 0, 0, 0, [0.85, 0.85, 0.85]), 3.0),
    tagAnimPart(makePartBox(0.115, 0.15, 0.075, 0, 0.28, 0, 0, 0, 0, [1.0, 1.0, 1.0]), 3.0),
    // Руки, удерживающие ружьё в прицеле или у плеча (5.0 = руки и оружие)
    tagAnimPart(makePartBox(0.036, 0.13, 0.038, -0.068, 0.27, 0.03, -0.55, 0, 0.18, [0.92, 0.92, 0.92]), 5.0),
    tagAnimPart(makePartBox(0.036, 0.13, 0.038, 0.068, 0.27, 0.04, -0.65, 0, -0.22, [0.92, 0.92, 0.92]), 5.0)
  ];

  const equipParts = [
    // Белые скрещённые портупеи, ранец и свёрнутая скатка серой шинели на спине (3.0 = корпус)
    tagAnimPart(makePartBox(0.12, 0.025, 0.082, 0, 0.28, 0, 0, 0, 0.58, [1.0, 1.0, 1.0]), 3.0),
    tagAnimPart(makePartBox(0.12, 0.025, 0.082, 0, 0.28, 0, 0, 0, -0.58, [1.0, 1.0, 1.0]), 3.0),
    tagAnimPart(makePartBox(0.092, 0.105, 0.048, 0, 0.285, -0.056, 0, 0, 0, [0.42, 0.34, 0.26]), 3.0),
    tagAnimPart(makePartCyl(0.026, 0.026, 0.125, 6, 0, 0.345, -0.055, 0, 0, Math.PI * 0.5, [0.68, 0.7, 0.72]), 3.0),
    // Голова и высокий кавказский кивер (1845 г.) с султаном (4.0 = голова)
    tagAnimPart(makePartSphere(0.038, 6, 5, 0, 0.388, 0.006, 0.95, 1.08, 1.0, [0.94, 0.78, 0.64]), 4.0),
    tagAnimPart(makePartCyl(0.052, 0.042, 0.10, 7, 0, 0.452, 0, -0.05, 0, 0, [0.16, 0.16, 0.18]), 4.0),
    tagAnimPart(makePartSphere(0.018, 5, 4, 0, 0.51, 0.01, 1, 1.3, 1, [0.95, 0.95, 0.95]), 4.0)
  ];

  const metalParts = [
    // Ложа и ствол ударного ружья + длинный трёхгранный штык (5.0 = оружие), кокарда кивера (4.0 = голова)
    tagAnimPart(makePartBox(0.024, 0.18, 0.032, 0.052, 0.29, 0.078, -0.34, 0, 0, [0.55, 0.36, 0.22]), 5.0),
    tagAnimPart(makePartCyl(0.008, 0.011, 0.32, 4, 0.052, 0.41, 0.12, -0.34, 0, 0, [0.95, 0.97, 1.0]), 5.0),
    tagAnimPart(makePartBox(0.034, 0.03, 0.012, 0, 0.45, 0.048, 0, 0, 0, [0.95, 0.78, 0.28]), 4.0)
  ];

  return {
    coatGeo: mergeBufferGeometries(coatParts),
    equipGeo: mergeBufferGeometries(equipParts),
    metalGeo: mergeBufferGeometries(metalParts)
  };
}

/**
 * Возвращает { cherkeskaGeo, papakhaAccGeo, weaponGeo } для горских стрелков-мюридов (~84 треуг.).
 */
export function createMuridWarriorGeometrySet() {
  const cherkeskaParts = [
    // Горские сапоги и мягкие ноговицы (1.0 / 2.0 = левая / правая нога)
    tagAnimPart(makePartCyl(0.025, 0.026, 0.13, 5, -0.026, 0.065, 0, 0, 0, 0, [0.65, 0.65, 0.65]), 1.0),
    tagAnimPart(makePartCyl(0.025, 0.026, 0.13, 5, 0.026, 0.065, 0, 0, 0, 0, [0.65, 0.65, 0.65]), 2.0),
    // Расклешённый подол черкески, перетянутый в талии + башлык за плечами (3.0 = корпус)
    tagAnimPart(makePartCyl(0.05, 0.082, 0.15, 7, 0, 0.175, 0, 0, 0, 0, [0.92, 0.9, 0.88]), 3.0),
    tagAnimPart(makePartBox(0.115, 0.14, 0.072, 0, 0.285, 0, 0, 0, 0, [1.0, 1.0, 1.0]), 3.0),
    tagAnimPart(makePartBox(0.11, 0.10, 0.042, 0, 0.305, -0.048, 0.25, 0, 0, [0.76, 0.66, 0.54]), 3.0),
    // Прицеливающиеся руки (5.0 = руки и штуцер)
    tagAnimPart(makePartBox(0.035, 0.125, 0.036, -0.065, 0.285, 0.036, -0.78, 0, 0.18, [0.94, 0.94, 0.94]), 5.0),
    tagAnimPart(makePartBox(0.035, 0.125, 0.036, 0.065, 0.285, 0.046, -0.88, 0, -0.22, [0.94, 0.94, 0.94]), 5.0)
  ];

  const papakhaParts = [
    // Овчинная кудлатая папаха с суконным донцем + лицо (4.0 = голова) + пояс (3.0 = корпус)
    tagAnimPart(makePartSphere(0.037, 6, 5, 0, 0.386, 0.008, 0.95, 1.06, 1.0, [0.95, 0.78, 0.62]), 4.0),
    tagAnimPart(makePartCyl(0.058, 0.052, 0.095, 7, 0, 0.448, 0, -0.06, 0, 0, [0.88, 0.84, 0.8]), 4.0),
    tagAnimPart(makePartBox(0.118, 0.022, 0.078, 0, 0.228, 0, 0, 0, 0, [0.65, 0.52, 0.38]), 3.0)
  ];

  const weaponParts = [
    // Два нагрудных ряда серебряных газырей + кинжал-кама на поясе (3.0) + длинный кавказский штуцер (5.0)
    tagAnimPart(makePartBox(0.042, 0.048, 0.015, -0.032, 0.295, 0.042, 0, 0, 0, [0.94, 0.96, 1.0]), 3.0),
    tagAnimPart(makePartBox(0.042, 0.048, 0.015, 0.032, 0.295, 0.042, 0, 0, 0, [0.94, 0.96, 1.0]), 3.0),
    tagAnimPart(makePartBox(0.018, 0.11, 0.012, 0.01, 0.20, 0.048, 0, 0, 0.28, [0.9, 0.85, 0.75]), 3.0),
    tagAnimPart(makePartCyl(0.008, 0.012, 0.36, 5, 0.032, 0.33, 0.16, -1.28, 0, 0, [0.82, 0.78, 0.7]), 5.0)
  ];

  return {
    cherkeskaGeo: mergeBufferGeometries(cherkeskaParts),
    papakhaAccGeo: mergeBufferGeometries(papakhaParts),
    weaponGeo: mergeBufferGeometries(weaponParts)
  };
}

/**
 * Реалистичный плетёный тур (габион) с деревянными кольями и земляной засыпкой (~64 треуг.).
 */
export function createWovenGabionGeometry() {
  const parts = [];
  parts.push(makePartCyl(0.165, 0.175, 0.42, 10, 0, 0.21, 0, 0, 0, 0, [1.0, 0.96, 0.92]));
  parts.push(makePartSphere(0.155, 8, 5, 0, 0.40, 0, 1, 0.26, 1, [0.55, 0.46, 0.36]));
  for (let i = 0; i < 6; i++) {
    const ang = (i / 6) * Math.PI * 2;
    const sx = Math.cos(ang) * 0.152;
    const sz = Math.sin(ang) * 0.152;
    parts.push(makePartCyl(0.004, 0.014, 0.50, 5, sx, 0.26, sz, 0, 0, 0, [0.64, 0.46, 0.28]));
  }
  return mergeBufferGeometries(parts);
}

/**
 * Полое спицованное деревянно-железное колесо повозки (ось вращения по Z, как у rotated CylinderGeometry).
 */
export function createSpokedWagonWheelGeometry(radius = 0.22, width = 0.06) {
  const parts = [];
  const rimSegs = 10;
  const segLen = (2 * Math.PI * radius / rimSegs) * 1.1;
  for (let i = 0; i < rimSegs; i++) {
    const ang = (i / rimSegs) * Math.PI * 2;
    const px = Math.cos(ang) * radius;
    const py = Math.sin(ang) * radius;
    parts.push(makePartBox(radius * 0.15, segLen, width, px, py, 0, 0, 0, ang, [0.35, 0.33, 0.32]));
  }
  parts.push(makePartCyl(radius * 0.22, radius * 0.22, width * 1.5, 8, 0, 0, 0, Math.PI * 0.5, 0, 0, [0.52, 0.38, 0.24]));
  for (let s = 0; s < 6; s++) {
    const ang = (s / 6) * Math.PI * 2;
    const px = Math.cos(ang) * (radius * 0.48);
    const py = Math.sin(ang) * (radius * 0.48);
    parts.push(makePartBox(radius * 0.86, radius * 0.08, width * 0.45, px, py, 0, 0, 0, ang, [0.76, 0.58, 0.38]));
  }
  return mergeBufferGeometries(parts);
}

/**
 * Двускатная офицерская палатка Кавказского корпуса образца 1840-х (стены + скаты крыши + полог входа).
 */
export function createRidgeTentGeometry() {
  const w = 1.06;
  const wallH = 0.28;
  const peakH = 0.92;
  const d = 1.32;
  const parts = [
    makePartBox(w, wallH, d, 0, wallH * 0.5, 0, 0, 0, 0, [0.88, 0.86, 0.82]),
    // Двускатная крыша (левый и правый брезентовые скаты)
    makePartBox(w * 0.68, 0.05, d * 1.08, -w * 0.26, wallH + (peakH - wallH) * 0.48, 0, 0, 0, 0.82, [1.0, 0.99, 0.96]),
    makePartBox(w * 0.68, 0.05, d * 1.08, w * 0.26, wallH + (peakH - wallH) * 0.48, 0, 0, 0, -0.82, [1.0, 0.99, 0.96]),
    // Задний треугольный фронтон и приоткрытый тёмный полог входа спереди
    makePartCyl(0.02, w * 0.50, peakH - wallH, 4, 0, wallH + (peakH - wallH) * 0.5, -d * 0.46, 0, Math.PI * 0.25, 0, [0.84, 0.82, 0.78]),
    makePartBox(0.32, 0.48, 0.06, 0, 0.24, d * 0.50, 0, 0, 0, [0.16, 0.14, 0.12]),
    // Коньковый шест с торцами
    makePartCyl(0.025, 0.025, d * 1.14, 6, 0, peakH + 0.02, 0, Math.PI * 0.5, 0, 0, [0.48, 0.34, 0.2])
  ];
  return mergeBufferGeometries(parts);
}
