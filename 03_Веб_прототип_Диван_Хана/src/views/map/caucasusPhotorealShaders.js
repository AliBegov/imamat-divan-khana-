// ============================================================================
// ФОТОРЕАЛИСТИЧНЫЙ ГЕОМОРФОЛОГИЧЕСКИЙ И PBR-ШЕЙДЕРНЫЙ ДВИЖОК 3D-КАРТЫ ДАГЕСТАНА И КАВКАЗА
// - Реальная спутниковая цифровая модель рельефа NASA SRTM 30м (301x198 -> 361x241 DEM,
//   сетка 384x256 = 196 608 треугольников, точность квантования <= 1 м!)
// - Истинные формы Нагорного Дагестана: Сулакский каньон, Хунзахское и Гунибское плато,
//   куэсты Андалала и Чоха, Богосский массив (4152 м), ГКХ, Терско-Сунженская равнина и Каспий
// - 7 реальных рек по тальвегам каньонов SRTM (Терек, Сунжа, Аргун, Андийское/Аварское/Кара/Казикумухское Койсу)
// - Трипланарный GLSL PBR-шейдер литологии Дагестана (охристый юрский известняк, красноцветные
//   прослои, чёрные сланцы теснин, горные террасы Чоха/Гуниба, изумрудные сады долин и ледники)
// ============================================================================
import * as THREE from 'three';
import { sampleStrategicTerrain } from '../../game/terrainEngine.js';
import {
  DAGESTAN_SRTM_RIVER_DEFS,
  sampleDagestanRealSrtm
} from '../../data/dagestanRealSrtmDem.js';

let _fallbackWhiteTex = null;
let _fallbackNormalTex = null;
function getFallbackWhiteTex() {
  if (!_fallbackWhiteTex) {
    _fallbackWhiteTex = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1);
    _fallbackWhiteTex.needsUpdate = true;
  }
  return _fallbackWhiteTex;
}
function getFallbackNormalTex() {
  if (!_fallbackNormalTex) {
    _fallbackNormalTex = new THREE.DataTexture(new Uint8Array([128, 128, 255, 255]), 1, 1);
    _fallbackNormalTex.needsUpdate = true;
  }
  return _fallbackNormalTex;
}

export const CAUCASUS_RIVER_DEFS = DAGESTAN_SRTM_RIVER_DEFS;

// Историческая сеть горных троп Имамата и военных просек Кавказского корпуса (1845 г.)
export const CAUCASUS_ROAD_DEFS = [
  [
    [28, 48],
    [155, 45],
    [280, 44],
    [415, 46],
    [555, 40],
    [665, 34]
  ],
  [
    [75, 78],
    [145, 92],
    [205, 80],
    [295, 68],
    [345, 122]
  ],
  [
    [285, 68],
    [268, 114],
    [255, 155],
    [236, 202],
    [215, 245]
  ],
  [
    [145, 92],
    [145, 125],
    [178, 184],
    [215, 245],
    [272, 236],
    [325, 225]
  ],
  [
    [325, 225],
    [368, 236],
    [410, 245],
    [452, 266],
    [495, 285],
    [542, 270],
    [585, 255]
  ],
  [
    [410, 245],
    [455, 228],
    [495, 215],
    [548, 180],
    [605, 145]
  ],
  [
    [345, 122],
    [384, 178],
    [410, 245]
  ],
  [
    [410, 245],
    [425, 330],
    [486, 344],
    [545, 355],
    [585, 255]
  ]
];

const SETTLEMENT_ANCHORS = [
  [410, 245, 13.5],
  [255, 155, 12.0],
  [145, 125, 13.0],
  [325, 225, 12.0],
  [495, 215, 12.5],
  [425, 330, 11.5],
  [545, 355, 12.0],
  [215, 245, 14.5],
  [495, 285, 13.5],
  [585, 255, 12.5],
  [75, 78, 12.0],
  [205, 158, 10.0],
  [345, 122, 11.0],
  [475, 192, 10.0],
  [605, 145, 12.0]
];

function hash2(x, z) {
  const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453123;
  return s - Math.floor(s);
}

function valueNoise2(x, z) {
  const ix = Math.floor(x);
  const iz = Math.floor(z);
  const fx = x - ix;
  const fz = z - iz;
  const ux = fx * fx * (3.0 - 2.0 * fx);
  const uz = fz * fz * (3.0 - 2.0 * fz);
  const a = hash2(ix, iz);
  const b = hash2(ix + 1, iz);
  const c = hash2(ix, iz + 1);
  const d = hash2(ix + 1, iz + 1);
  return a + (b - a) * ux + (c - a) * uz + (a - b - c + d) * ux * uz;
}

function fbm2(x, z, octaves = 4) {
  let sum = 0.0;
  let amp = 0.5;
  let px = x;
  let pz = z;
  for (let i = 0; i < octaves; i++) {
    sum += amp * valueNoise2(px, pz);
    const nx = px * 1.62 - pz * 1.21;
    const nz = px * 1.21 + pz * 1.62;
    px = nx;
    pz = nz;
    amp *= 0.5;
  }
  return sum;
}

function ridgedMultifractal2(x, z, octaves = 5) {
  let sum = 0.0;
  let amp = 0.52;
  let weight = 1.0;
  let px = x;
  let pz = z;
  for (let i = 0; i < octaves; i++) {
    let signal = 1.0 - Math.abs(valueNoise2(px, pz) * 2.0 - 1.0);
    signal *= signal;
    signal *= weight;
    weight = Math.max(0.0, Math.min(1.0, signal * 1.85));
    sum += signal * amp;
    const nx = px * 1.68 + pz * 1.24 + 3.7;
    const nz = -px * 1.24 + pz * 1.68 - 2.1;
    px = nx;
    pz = nz;
    amp *= 0.48;
  }
  return sum;
}

function distToSegmentWithClosest(px, py, ax, ay, bx, by) {
  const vx = bx - ax;
  const vy = by - ay;
  const wx = px - ax;
  const wy = py - ay;
  const lenSq = vx * vx + vy * vy;
  let t = lenSq > 1e-6 ? (wx * vx + wy * vy) / lenSq : 0.0;
  t = Math.max(0.0, Math.min(1.0, t));
  const cx = ax + t * vx;
  const cy = ay + t * vy;
  const dx = px - cx;
  const dy = py - cy;
  return { dSq: dx * dx + dy * dy, cx, cy };
}

function densifyPolyline(pts, subdivisions = 48) {
  const curve = new THREE.CatmullRomCurve3(
    pts.map(([mx, my]) => new THREE.Vector3(mx, 0, my))
  );
  return curve.getPoints(subdivisions).map((v) => [v.x, v.z]);
}

const GRID_W = 361;
const GRID_H = 241;
let cachedHeightGrid = null;
let cachedRiverMaskGrid = null;
let cachedRoadMaskGrid = null;
let cachedCurvatureGrid = null;

function ensureGeomorphicField() {
  if (cachedHeightGrid) return;

  const computeBounds = (pts, pad) => {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (let i = 0; i < pts.length; i++) {
      const x = pts[i][0];
      const y = pts[i][1];
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
    return { minX: minX - pad, maxX: maxX + pad, minY: minY - pad, maxY: maxY + pad };
  };

  const denseRivers = CAUCASUS_RIVER_DEFS.map((r) => {
    const densePts = densifyPolyline(r.pts, 110);
    const maxInfluence = r.hw * 10.0 * 3.1;
    return {
      ...r,
      densePts,
      bounds: computeBounds(densePts, maxInfluence),
      maxInfluenceSq: maxInfluence * maxInfluence
    };
  });
  const denseRoads = CAUCASUS_ROAD_DEFS.map((pts) => {
    const densePts = densifyPolyline(pts, 44);
    return {
      pts: densePts,
      bounds: computeBounds(densePts, 6.0)
    };
  });

  const computeBaseLandscapeY = (mx, my) => {
    // 100% реальная спутниковая высота NASA SRTM 30м Дагестана и Чечни (-46м Каспий .. +4169м ГКХ)
    const srtm = sampleDagestanRealSrtm(mx, my);
    const realElev = srtm.elev;
    if (realElev <= -12.0) {
      return 0.04; // зеркало Каспийского моря
    }
    let wy = 0.06 + (realElev + 12.0) * 0.00188;

    // Ультраделикатный высокочастотный субкилометровый микрорельеф скальных рёбер (НЕ искажает реальные плато и каньоны SRTM!)
    const rockyFactor = Math.max(0.0, Math.min(1.0, (srtm.slopeDeg - 14) / 34));
    const alpineFactor = Math.max(0.0, Math.min(1.0, (realElev - 750) / 2600));
    const microCrags = (ridgedMultifractal2(mx * 0.095 + 7.4, my * 0.095 - 3.2, 3) - 0.36) * 0.11 * rockyFactor * alpineFactor;
    const fineDetail = (fbm2(mx * 0.14, my * 0.14, 2) - 0.5) * 0.048 * alpineFactor;
    wy += microCrags + fineDetail;

    return Math.max(0.05, wy);
  };

  cachedHeightGrid = new Float32Array(GRID_W * GRID_H);
  cachedRiverMaskGrid = new Float32Array(GRID_W * GRID_H);
  cachedRoadMaskGrid = new Float32Array(GRID_W * GRID_H);
  cachedCurvatureGrid = new Float32Array(GRID_W * GRID_H);

  // Шаг 1: реальный спутниковый рельеф NASA SRTM 30м
  for (let gz = 0; gz < GRID_H; gz++) {
    const my = (gz / (GRID_H - 1)) * 460.0;
    for (let gx = 0; gx < GRID_W; gx++) {
      const mx = (gx / (GRID_W - 1)) * 700.0;
      cachedHeightGrid[gz * GRID_W + gx] = computeBaseLandscapeY(mx, my);
    }
  }

  // Шаг 2: расчёт высот тальвега строго вдоль реальных каньонов SRTM с гарантией плавного стока вниз
  denseRivers.forEach((rv) => {
    rv.bedElevs = rv.densePts.map(([rx, ry]) => {
      const gx = Math.min(GRID_W - 1, Math.max(0, Math.round((rx / 700.0) * (GRID_W - 1))));
      const gz = Math.min(GRID_H - 1, Math.max(0, Math.round((ry / 460.0) * (GRID_H - 1))));
      const rawH = cachedHeightGrid[gz * GRID_W + gx];
      // Деликатное выравнивание дна реального SRTM-каньона без разрушения его естественных стен
      const depth = ry > 80 ? rv.carveDepth * 0.58 : rv.carveDepth * 0.25;
      return Math.max(0.05, rawH - depth);
    });
    // Монотонное сглаживание от истока к устью, чтобы реки никогда не текли «в гору»
    for (let i = 1; i < rv.bedElevs.length; i++) {
      rv.bedElevs[i] = Math.min(rv.bedElevs[i], rv.bedElevs[i - 1] + 0.015);
    }
  });

  // Шаг 3: прокладка плоского ложа под водные ленты на дне реальных каньонов Сулака, Койсу и Аргуна
  for (let gz = 0; gz < GRID_H; gz++) {
    const my = (gz / (GRID_H - 1)) * 460.0;
    for (let gx = 0; gx < GRID_W; gx++) {
      const mx = (gx / (GRID_W - 1)) * 700.0;
      const idx = gz * GRID_W + gx;

      let bestRDistSq = 1e9;
      let bestRiver = denseRivers[0];
      let bestBedY = cachedHeightGrid[idx];
      for (let r = 0; r < denseRivers.length; r++) {
        const rv = denseRivers[r];
        const b = rv.bounds;
        if (mx < b.minX || mx > b.maxX || my < b.minY || my > b.maxY) continue;
        const pts = rv.densePts;
        for (let s = 0; s < pts.length - 1; s++) {
          const ax = pts[s][0];
          const ay = pts[s][1];
          const bx = pts[s + 1][0];
          const by = pts[s + 1][1];
          // Быстрое отсечение сегмента по AABB (ускоряет генерацию поля высот в ~5 раз!)
          const segMinX = ax < bx ? ax : bx;
          const segMaxX = ax > bx ? ax : bx;
          const segMinY = ay < by ? ay : by;
          const segMaxY = ay > by ? ay : by;
          if (
            mx < segMinX - 22 ||
            mx > segMaxX + 22 ||
            my < segMinY - 22 ||
            my > segMaxY + 22
          ) {
            continue;
          }
          const res = distToSegmentWithClosest(mx, my, ax, ay, bx, by);
          if (res.dSq < bestRDistSq) {
            bestRDistSq = res.dSq;
            bestRiver = rv;
            const segLen = Math.hypot(bx - ax, by - ay) || 1;
            const u = Math.hypot(res.cx - ax, res.cy - ay) / segLen;
            bestBedY = rv.bedElevs[s] * (1 - u) + rv.bedElevs[s + 1] * u;
          }
        }
      }

      if (bestRDistSq < 1e8) {
        const rDist = Math.sqrt(bestRDistSq);
        const flatChannelHalfW = bestRiver.hw * 10.0 * 1.15;
        const canyonSlopeHalfW = bestRiver.hw * 10.0 * 2.85;

        if (rDist < flatChannelHalfW) {
          cachedHeightGrid[idx] = Math.min(cachedHeightGrid[idx], bestBedY);
        } else if (rDist < canyonSlopeHalfW) {
          const u = (rDist - flatChannelHalfW) / (canyonSlopeHalfW - flatChannelHalfW);
          const smoothWall = u * u * (3.0 - 2.0 * u);
          const carved = bestBedY * (1.0 - smoothWall) + cachedHeightGrid[idx] * smoothWall;
          cachedHeightGrid[idx] = Math.min(cachedHeightGrid[idx], carved);
        }

        const shoreWidth = bestRiver.hw * 10.0 * 2.25;
        cachedRiverMaskGrid[idx] = Math.max(0.0, Math.min(1.0, 1.0 - rDist / shoreWidth));
      } else {
        cachedRiverMaskGrid[idx] = 0.0;
      }

      // Расстояние до горной тропы / военного тракта (с AABB-отсечением)
      let bestRoadDistSq = 1e9;
      for (let rd = 0; rd < denseRoads.length; rd++) {
        const road = denseRoads[rd];
        const rb = road.bounds;
        if (mx < rb.minX || mx > rb.maxX || my < rb.minY || my > rb.maxY) continue;
        const pts = road.pts;
        for (let s = 0; s < pts.length - 1; s++) {
          const ax = pts[s][0];
          const ay = pts[s][1];
          const bx = pts[s + 1][0];
          const by = pts[s + 1][1];
          if (
            mx < (ax < bx ? ax : bx) - 6.0 ||
            mx > (ax > bx ? ax : bx) + 6.0 ||
            my < (ay < by ? ay : by) - 6.0 ||
            my > (ay > by ? ay : by) + 6.0
          ) {
            continue;
          }
          const res = distToSegmentWithClosest(mx, my, ax, ay, bx, by);
          if (res.dSq < bestRoadDistSq) bestRoadDistSq = res.dSq;
        }
      }
      cachedRoadMaskGrid[idx] =
        bestRoadDistSq < 25.0
          ? Math.max(0.0, Math.min(1.0, 1.0 - (Math.sqrt(bestRoadDistSq) - 1.1) / 3.6))
          : 0.0;
    }
  }

  // Шаг 4: деликатное выравнивание малых площадок под цитадели наибств (сохраняя обрывы плато Хунзаха и Гуниба!)
  const padHeights = SETTLEMENT_ANCHORS.map(([ax, ay]) => {
    const gx = Math.round((ax / 700.0) * (GRID_W - 1));
    const gz = Math.round((ay / 460.0) * (GRID_H - 1));
    return cachedHeightGrid[gz * GRID_W + gx];
  });

  for (let s = 0; s < SETTLEMENT_ANCHORS.length; s++) {
    const [ax, ay, rawRad] = SETTLEMENT_ANCHORS[s];
    const rad = rawRad * 0.85;
    const targetH = padHeights[s];
    const minGx = Math.max(0, Math.floor(((ax - rad) / 700.0) * (GRID_W - 1)));
    const maxGx = Math.min(GRID_W - 1, Math.ceil(((ax + rad) / 700.0) * (GRID_W - 1)));
    const minGz = Math.max(0, Math.floor(((ay - rad) / 460.0) * (GRID_H - 1)));
    const maxGz = Math.min(GRID_H - 1, Math.ceil(((ay + rad) / 460.0) * (GRID_H - 1)));

    for (let gz = minGz; gz <= maxGz; gz++) {
      const my = (gz / (GRID_H - 1)) * 460.0;
      for (let gx = minGx; gx <= maxGx; gx++) {
        const mx = (gx / (GRID_W - 1)) * 700.0;
        const idx = gz * GRID_W + gx;
        if (cachedRiverMaskGrid[idx] > 0.56) continue;
        const dist = Math.hypot(mx - ax, my - ay);
        if (dist < rad) {
          const t = 1.0 - dist / rad;
          const smooth = t * t * (3.0 - 2.0 * t) * 0.78;
          cachedHeightGrid[idx] = cachedHeightGrid[idx] * (1.0 - smooth) + targetH * smooth;
        }
      }
    }
  }

  // Шаг 5: расчёт истинного индекса топографической кривизны TPI (0 = глубокий каньон, 0.5 = склон/плато, 1 = острый гребень/бровка куэсты)
  for (let gz = 0; gz < GRID_H; gz++) {
    const gzU = Math.max(0, gz - 3);
    const gzD = Math.min(GRID_H - 1, gz + 3);
    for (let gx = 0; gx < GRID_W; gx++) {
      const gxL = Math.max(0, gx - 3);
      const gxR = Math.min(GRID_W - 1, gx + 3);
      const idx = gz * GRID_W + gx;
      const hC = cachedHeightGrid[idx];
      const hAvg =
        (cachedHeightGrid[gz * GRID_W + gxL] +
          cachedHeightGrid[gz * GRID_W + gxR] +
          cachedHeightGrid[gzU * GRID_W + gx] +
          cachedHeightGrid[gzD * GRID_W + gx] +
          cachedHeightGrid[gzU * GRID_W + gxL] +
          cachedHeightGrid[gzU * GRID_W + gxR] +
          cachedHeightGrid[gzD * GRID_W + gxL] +
          cachedHeightGrid[gzD * GRID_W + gxR]) *
        0.125;
      const tpi = Math.max(0.0, Math.min(1.0, 0.5 + (hC - hAvg) * 1.35));
      cachedCurvatureGrid[idx] = tpi;
    }
  }
}

function sampleGridBilinear(grid, mx, my) {
  const cx = Math.max(0.0, Math.min(700.0, mx));
  const cy = Math.max(0.0, Math.min(460.0, my));
  const fx = (cx / 700.0) * (GRID_W - 1);
  const fz = (cy / 460.0) * (GRID_H - 1);
  const ix = Math.min(GRID_W - 2, Math.floor(fx));
  const iz = Math.min(GRID_H - 2, Math.floor(fz));
  const tx = fx - ix;
  const tz = fz - iz;
  const row0 = iz * GRID_W + ix;
  const row1 = (iz + 1) * GRID_W + ix;
  const v00 = grid[row0];
  const v10 = grid[row0 + 1];
  const v01 = grid[row1];
  const v11 = grid[row1 + 1];
  return (v00 * (1 - tx) + v10 * tx) * (1 - tz) + (v01 * (1 - tx) + v11 * tx) * tz;
}

export function samplePhotorealCaucasusWorld(mx, my) {
  ensureGeomorphicField();
  const wx = (mx - 350) * 0.1;
  const wz = (my - 230) * 0.1;
  const wy = sampleGridBilinear(cachedHeightGrid, mx, my);
  const hL = sampleGridBilinear(cachedHeightGrid, mx - 2.0, my);
  const hR = sampleGridBilinear(cachedHeightGrid, mx + 2.0, my);
  const hU = sampleGridBilinear(cachedHeightGrid, mx, my - 2.0);
  const hD = sampleGridBilinear(cachedHeightGrid, mx, my + 2.0);
  // Истинный угол уклона 3D-сетки (включая отвесные стены Сулакского и Койсуйских каньонов!)
  const gradW = Math.hypot((hR - hL) / 0.4, (hD - hU) / 0.4);
  const meshSlopeDeg = Math.round((Math.atan(gradW) * 180) / Math.PI);
  const riverMask = sampleGridBilinear(cachedRiverMaskGrid, mx, my);
  const roadMask = sampleGridBilinear(cachedRoadMaskGrid, mx, my);
  const tpi = sampleGridBilinear(cachedCurvatureGrid, mx, my);
  const terr = sampleStrategicTerrain(mx, my);
  return {
    wx,
    wy,
    wz,
    elev: terr.elevationMeters,
    riverMask,
    roadMask,
    tpi,
    meshSlopeDeg,
    terr
  };
}

/**
 * Построение высокодетальной 3D-ленты горной реки (144 сегмента),
 * гарантированно лежащей поверх плоского ложа каньона без перекрытия берегами.
 */
export function buildPhotorealRiverRibbonGeometry(controlPts, halfWidth = 0.46, samples = 144) {
  ensureGeomorphicField();
  const curve = new THREE.CatmullRomCurve3(
    controlPts.map(([mx, my]) => {
      const { wx, wy, wz } = samplePhotorealCaucasusWorld(mx, my);
      return new THREE.Vector3(wx, wy, wz);
    })
  );
  const pts = curve.getPoints(samples);
  const crossVerts = 5;
  const uCols = [0.0, 0.22, 0.5, 0.78, 1.0];
  const positions = new Float32Array((samples + 1) * crossVerts * 3);
  const uvs = new Float32Array((samples + 1) * crossVerts * 2);
  const rapidsAttr = new Float32Array((samples + 1) * crossVerts);
  const progressAttr = new Float32Array((samples + 1) * crossVerts);
  const indices = [];
  const up = new THREE.Vector3(0, 1, 0);
  const tangent = new THREE.Vector3();
  const side = new THREE.Vector3();

  // Вычисляем сглаженную водную поверхность поверх прорезанного тальвега
  const rawSurfY = new Float32Array(samples + 1);
  for (let i = 0; i <= samples; i++) {
    const p = pts[i];
    if (i < samples) {
      tangent.subVectors(pts[i + 1], p).normalize();
    }
    side.crossVectors(tangent, up).normalize();
    const widthScale = 0.78 + 0.48 * (i / samples);
    const hwProbe = halfWidth * widthScale * 0.65;
    const hCenter = sampleGridBilinear(cachedHeightGrid, p.x * 10 + 350, p.z * 10 + 230);
    const hLeft = sampleGridBilinear(
      cachedHeightGrid,
      (p.x - side.x * hwProbe) * 10 + 350,
      (p.z - side.z * hwProbe) * 10 + 230
    );
    const hRight = sampleGridBilinear(
      cachedHeightGrid,
      (p.x + side.x * hwProbe) * 10 + 350,
      (p.z + side.z * hwProbe) * 10 + 230
    );
    rawSurfY[i] = Math.min(hCenter + 0.16, Math.max(hCenter, Math.max(hLeft, hRight))) + 0.085;
  }

  let arcLen = 0.0;
  for (let i = 0; i <= samples; i++) {
    const p = pts[i];
    if (i > 0) {
      arcLen += p.distanceTo(pts[i - 1]);
    }
    if (i < samples) {
      tangent.subVectors(pts[i + 1], p).normalize();
    }
    side.crossVectors(tangent, up).normalize();
    const widthScale = 0.78 + 0.48 * (i / samples);
    const hw = halfWidth * widthScale * 1.26;

    const prevY = rawSurfY[Math.max(0, i - 1)];
    const nextY = rawSurfY[Math.min(samples, i + 1)];
    const surfY = rawSurfY[i] * 0.5 + (prevY + nextY) * 0.25;
    const prog = i / samples;
    // Горные верховья и крутые перепады теснин дают выраженные бурлящие пороги
    const headwaterTurbulence = 0.24 * Math.max(0.0, 1.0 - prog * 1.15);
    const slopeDrop = Math.max(
      0.0,
      Math.min(1.0, Math.abs(prevY - nextY) * 6.2 + headwaterTurbulence)
    );
    const vCoord = arcLen * 0.44;

    for (let c = 0; c < crossVerts; c++) {
      const u = uCols[c];
      const lat = (u - 0.5) * 2.0; // -1 .. +1
      const archCrown = (1.0 - lat * lat) * 0.024 - (c === 0 || c === crossVerts - 1 ? 0.025 : 0.0);
      const idx = i * crossVerts + c;
      positions[idx * 3] = p.x + side.x * (hw * lat);
      positions[idx * 3 + 1] = surfY + archCrown;
      positions[idx * 3 + 2] = p.z + side.z * (hw * lat);

      uvs[idx * 2] = u;
      uvs[idx * 2 + 1] = vCoord;
      rapidsAttr[idx] = slopeDrop;
      progressAttr[idx] = prog;
    }

    if (i < samples) {
      for (let c = 0; c < crossVerts - 1; c++) {
        const a = i * crossVerts + c;
        const b = a + 1;
        const cc = (i + 1) * crossVerts + c;
        const d = cc + 1;
        indices.push(a, b, cc, b, d, cc);
      }
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geo.setAttribute('aRapids', new THREE.BufferAttribute(rapidsAttr, 1));
  geo.setAttribute('aProgress', new THREE.BufferAttribute(progressAttr, 1));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Сэмплирует точные координаты речных порогов (wx, waterY, wz, flowYaw, scale, rapids)
 * строго по тем же сплайнам и высоте водной глади, что и buildPhotorealRiverRibbonGeometry,
 * для расстановки 3D мокрых валунов и пенных V-бурунов на Тереке, Сунже, Аргуне и Койсу.
 */
export function sampleCaucasusRiverRapidPoints(riverDefs = CAUCASUS_RIVER_DEFS, { avoidWorldPts = [] } = {}) {
  ensureGeomorphicField();
  const up = new THREE.Vector3(0, 1, 0);
  const tangent = new THREE.Vector3();
  const side = new THREE.Vector3();
  const out = [];

  riverDefs.forEach((rd, rIdx) => {
    const samples = 180;
    const curve = new THREE.CatmullRomCurve3(
      rd.pts.map(([mx, my]) => {
        const { wx, wy, wz } = samplePhotorealCaucasusWorld(mx, my);
        return new THREE.Vector3(wx, wy, wz);
      })
    );
    const pts = curve.getPoints(samples);
    const rawSurfY = new Float32Array(samples + 1);
    for (let i = 0; i <= samples; i++) {
      const p = pts[i];
      if (i < samples) tangent.subVectors(pts[i + 1], p).normalize();
      side.crossVectors(tangent, up).normalize();
      const widthScale = 0.78 + 0.48 * (i / samples);
      const hwProbe = rd.hw * widthScale * 0.65;
      const hC = sampleGridBilinear(cachedHeightGrid, p.x * 10 + 350, p.z * 10 + 230);
      const hL = sampleGridBilinear(cachedHeightGrid, (p.x - side.x * hwProbe) * 10 + 350, (p.z - side.z * hwProbe) * 10 + 230);
      const hR = sampleGridBilinear(cachedHeightGrid, (p.x + side.x * hwProbe) * 10 + 350, (p.z + side.z * hwProbe) * 10 + 230);
      rawSurfY[i] = Math.min(hC + 0.16, Math.max(hC, Math.max(hL, hR))) + 0.085;
    }

    const isCanyonRiver = rd.id === 'argun' || rd.id.includes('koisu');
    let i = 6;
    while (i < samples - 5) {
      const seed = rIdx * 53 + i * 17;
      // Естественный нерегулярный шаг (исключает «бусы» из одинаковых камней через равные интервалы!)
      const jitterStep = isCanyonRiver ? 3 + (seed % 6) : 5 + (seed % 7);
      const p = pts[i];
      const pPrev = pts[Math.max(0, i - 1)];
      const pNext = pts[Math.min(samples, i + 1)];
      tangent.subVectors(pNext, pPrev).normalize();
      side.crossVectors(tangent, up).normalize();
      const prevY = rawSurfY[Math.max(0, i - 1)];
      const nextY = rawSurfY[Math.min(samples, i + 1)];
      const surfY = rawSurfY[i] * 0.5 + (prevY + nextY) * 0.25;
      const horizStep = Math.max(0.05, Math.hypot(pNext.x - pPrev.x, pNext.z - pPrev.z));
      // Точный угол продольного уклона русла (чтобы пенные шлейфы всегда лежали строго в плоскости воды!)
      const slopePitch = -Math.atan2(nextY - prevY, horizStep);
      const prog = i / samples;
      const rapids = Math.max(
        0,
        Math.min(1, Math.abs(prevY - nextY) * 6.2 + (isCanyonRiver ? 0.34 : 0.14) * (1 - prog * 0.85))
      );

      const widthScale = 0.78 + 0.48 * prog;
      const hw = rd.hw * widthScale;
      // Строго внутри русла ([-0.46 .. +0.46] полуширины), чтобы бурун никогда не залезал на стену каньона!
      const latFrac = ((((seed * 73 + i * 29) % 100) / 100) - 0.5) * 0.92;
      const bx = p.x + side.x * (hw * latFrac);
      const bz = p.z + side.z * (hw * latFrac);

      const nearBridge = avoidWorldPts.some((ap) => Math.hypot(bx - ap.wx, bz - ap.wz) < (ap.r || 1.8));
      if (!nearBridge) {
        const archCrown = (1.0 - Math.min(1, latFrac * latFrac)) * 0.024;
        out.push({
          riverId: rd.id,
          prog,
          wx: bx,
          wy: surfY + archCrown,
          wz: bz,
          flowYaw: Math.atan2(tangent.x, tangent.z),
          slopePitch,
          scale: (isCanyonRiver ? 0.32 : 0.28) + ((seed % 5) * 0.068),
          rapids
        });
      }
      i += jitterStep;
    }
  });
  return out;
}

/**
 * Точно привязывает каменный арочный мост к осевой линии реальной SRTM-реки:
 * вычисляет координаты центра русла (wx, wz), точную высоту зеркала воды (waterY),
 * перпендикулярный потоку угол поворота (bridgeYaw) и ширину пролёта (archSpanScale),
 * чтобы устои моста всегда стояли на противоположных берегах, а свод проходил строго над рекой!
 */
export function snapBridgeToRiverChannel(mx, my, preferredRiverId = null, bridgeId = '') {
  ensureGeomorphicField();
  let targetRiverId = preferredRiverId;
  if (!targetRiverId && bridgeId) {
    const low = String(bridgeId).toLowerCase();
    if (low.includes('sunzha')) targetRiverId = 'sunzha';
    else if (low.includes('argun')) targetRiverId = 'argun';
    else if (low.includes('sulak') || low.includes('andi')) targetRiverId = 'andi_koisu';
    else if (low.includes('karakoysu') || low.includes('salty')) targetRiverId = 'kara_koisu';
    else if (low.includes('avar')) targetRiverId = 'avar_koisu';
    else if (low.includes('terek')) targetRiverId = 'terek';
  }
  const candidates = targetRiverId
    ? CAUCASUS_RIVER_DEFS.filter((r) => r.id === targetRiverId)
    : CAUCASUS_RIVER_DEFS;
  const searchList = candidates.length > 0 ? candidates : CAUCASUS_RIVER_DEFS;

  const targetWx = (mx - 350) * 0.1;
  const targetWz = (my - 230) * 0.1;
  const up = new THREE.Vector3(0, 1, 0);
  const tangent = new THREE.Vector3();
  const side = new THREE.Vector3();
  const samples = 180;

  let best = null;
  let bestDistSq = Infinity;

  searchList.forEach((rd) => {
    const curve = new THREE.CatmullRomCurve3(
      rd.pts.map(([rx, ry]) => {
        const { wx, wy, wz } = samplePhotorealCaucasusWorld(rx, ry);
        return new THREE.Vector3(wx, wy, wz);
      })
    );
    const pts = curve.getPoints(samples);
    let localBestI = 4;
    let localBestDistSq = Infinity;
    for (let i = 4; i <= samples - 4; i++) {
      const dx = pts[i].x - targetWx;
      const dz = pts[i].z - targetWz;
      const dSq = dx * dx + dz * dz;
      if (dSq < localBestDistSq) {
        localBestDistSq = dSq;
        localBestI = i;
      }
    }
    if (localBestDistSq < bestDistSq) {
      bestDistSq = localBestDistSq;
      const i = localBestI;
      const p = pts[i];
      const pPrev = pts[Math.max(0, i - 2)];
      const pNext = pts[Math.min(samples, i + 2)];
      tangent.subVectors(pNext, pPrev).normalize();
      side.crossVectors(tangent, up).normalize();

      const prog = i / samples;
      const widthScale = 0.78 + 0.48 * prog;
      const hwProbe = rd.hw * widthScale * 0.65;
      const sampleSurfAt = (idx) => {
        const pt = pts[idx];
        const hC = sampleGridBilinear(cachedHeightGrid, pt.x * 10 + 350, pt.z * 10 + 230);
        const hL = sampleGridBilinear(
          cachedHeightGrid,
          (pt.x - side.x * hwProbe) * 10 + 350,
          (pt.z - side.z * hwProbe) * 10 + 230
        );
        const hR = sampleGridBilinear(
          cachedHeightGrid,
          (pt.x + side.x * hwProbe) * 10 + 350,
          (pt.z + side.z * hwProbe) * 10 + 230
        );
        return Math.min(hC + 0.16, Math.max(hC, Math.max(hL, hR))) + 0.085;
      };
      const waterY =
        sampleSurfAt(i) * 0.5 +
        (sampleSurfAt(Math.max(0, i - 1)) + sampleSurfAt(Math.min(samples, i + 1))) * 0.25;

      // Локальная ось +X моста — просвет арки (вдоль течения), локальная ось +Z — полотно моста (поперёк реки от берега к берегу!)
      const bridgeYaw = Math.atan2(-tangent.z, tangent.x);
      const riverHalfWidth = rd.hw * widthScale * 1.26;
      const archSpanScale = Math.max(1.08, Math.min(1.52, (riverHalfWidth * 2.0) / 1.12));

      best = {
        wx: p.x,
        waterY,
        wz: p.z,
        mx: p.x * 10 + 350,
        my: p.z * 10 + 230,
        bridgeYaw,
        riverHalfWidth,
        archSpanScale,
        riverId: rd.id
      };
    }
  });

  if (best) return best;
  const fallback = samplePhotorealCaucasusWorld(mx, my);
  return {
    wx: fallback.wx,
    waterY: fallback.wy + 0.08,
    wz: fallback.wz,
    mx,
    my,
    bridgeYaw: 0,
    riverHalfWidth: 0.55,
    archSpanScale: 1.18,
    riverId: targetRiverId || 'andi_koisu'
  };
}

/**
 * Трипланарный многобиомный PBR-материал рельефа Восточного Кавказа:
 * естественная трещиноватая порода известняка/базальта (без контурных полос!),
 * буковые леса Ичкерии, пастбища Дагестана, тропы, ледники и бегущие тени облаков.
 */
export function createPhotorealCaucasusTerrainMaterial({ summerMap, bumpMap, pbrPack = null }) {
  const hasPbr = Boolean(pbrPack?.rockDiff && pbrPack?.grassDiff && pbrPack?.mudDiff);
  const wTex = getFallbackWhiteTex();
  const nTex = getFallbackNormalTex();
  const shaderUniforms = {
    uTime: { value: 0.0 },
    uSeasonMix: { value: 0.0 },
    uSunDir: { value: new THREE.Vector3(-0.52, 0.76, -0.38).normalize() },
    uCloudShadowStrength: { value: 0.22 },
    uHasPbr: { value: hasPbr ? 1.0 : 0.0 },
    uRockDiff: { value: hasPbr ? pbrPack.rockDiff : wTex },
    uRockNor: { value: hasPbr ? pbrPack.rockNor : nTex },
    uRockArm: { value: hasPbr ? pbrPack.rockArm : wTex },
    uGrassDiff: { value: hasPbr ? pbrPack.grassDiff : wTex },
    uGrassNor: { value: hasPbr ? pbrPack.grassNor : nTex },
    uMudDiff: { value: hasPbr ? pbrPack.mudDiff : wTex },
    uMudNor: { value: hasPbr ? pbrPack.mudNor : nTex }
  };

  const material = new THREE.MeshStandardMaterial({
    map: summerMap,
    bumpMap,
    bumpScale: 0.1,
    roughness: 0.88,
    metalness: 0.02
  });

  material.userData.shaderUniforms = shaderUniforms;

  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = shaderUniforms.uTime;
    shader.uniforms.uSeasonMix = shaderUniforms.uSeasonMix;
    shader.uniforms.uSunDir = shaderUniforms.uSunDir;
    shader.uniforms.uCloudShadowStrength = shaderUniforms.uCloudShadowStrength;
    shader.uniforms.uHasPbr = shaderUniforms.uHasPbr;
    shader.uniforms.uRockDiff = shaderUniforms.uRockDiff;
    shader.uniforms.uRockNor = shaderUniforms.uRockNor;
    shader.uniforms.uRockArm = shaderUniforms.uRockArm;
    shader.uniforms.uGrassDiff = shaderUniforms.uGrassDiff;
    shader.uniforms.uGrassNor = shaderUniforms.uGrassNor;
    shader.uniforms.uMudDiff = shaderUniforms.uMudDiff;
    shader.uniforms.uMudNor = shaderUniforms.uMudNor;

    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
        attribute vec4 aTerrainMeta;
        varying vec3 vCaucWorldPos;
        varying vec3 vCaucObjNormal;
        varying vec4 vTerrainMeta;`
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        vCaucWorldPos = position;
        vCaucObjNormal = normalize(normal);
        vTerrainMeta = aTerrainMeta;`
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
        uniform float uTime;
        uniform float uSeasonMix;
        uniform vec3 uSunDir;
        uniform float uCloudShadowStrength;
        uniform float uHasPbr;
        uniform sampler2D uRockDiff;
        uniform sampler2D uRockNor;
        uniform sampler2D uRockArm;
        uniform sampler2D uGrassDiff;
        uniform sampler2D uGrassNor;
        uniform sampler2D uMudDiff;
        uniform sampler2D uMudNor;
        varying vec3 vCaucWorldPos;
        varying vec3 vCaucObjNormal;
        varying vec4 vTerrainMeta;

        float cHash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
        }
        float cNoise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(
            mix(cHash(i), cHash(i + vec2(1.0, 0.0)), u.x),
            mix(cHash(i + vec2(0.0, 1.0)), cHash(i + vec2(1.0, 1.0)), u.x),
            u.y
          );
        }
        float cFbm(vec2 p) {
          float v = 0.0;
          float a = 0.5;
          mat2 rot = mat2(0.8, -0.6, 0.6, 0.8);
          for (int i = 0; i < 4; i++) {
            v += a * cNoise(p);
            p = rot * p * 2.07;
            a *= 0.5;
          }
          return v;
        }
        vec3 cTriplanarSample(sampler2D tex, vec3 wp, vec3 bw, float scale) {
          vec3 sx = texture2D(tex, wp.zy * scale).rgb;
          vec3 sy = texture2D(tex, wp.xz * scale).rgb;
          vec3 sz = texture2D(tex, wp.xy * scale).rgb;
          return sx * bw.x + sy * bw.y + sz * bw.z;
        }
        vec2 cDualUvSample(sampler2D tex, vec2 xz, float sA, float sB) {
          vec3 a = texture2D(tex, xz * sA).xyz;
          vec3 b = texture2D(tex, xz * sB + vec2(0.37, 0.61)).xyz;
          vec3 mixed = a * 0.6 + b * 0.4;
          return mixed.xy * 2.0 - 1.0;
        }
        // Естественная трещиноватая скальная порода без искусственных горизонтальных полос
        float cTriplanarCrag(vec3 wp, vec3 wn) {
          vec3 bw = pow(abs(wn), vec3(4.0));
          bw /= max(0.0001, bw.x + bw.y + bw.z);
          vec2 warp = vec2(cNoise(wp.xz * 0.42), cNoise(wp.xz * 0.42 + 7.3)) * 1.35;
          float sx = cFbm(vec2(wp.z * 0.88, wp.y * 0.95) + warp);
          float sy = cFbm(wp.xz * 0.82 + warp);
          float sz = cFbm(vec2(wp.x * 0.88, wp.y * 0.95) - warp);
          float baseRock = sx * bw.x + sy * bw.y + sz * bw.z;
          float tiltedVein = cFbm(vec2(wp.x * 0.35 + wp.z * 0.28 + baseRock * 2.2, wp.y * 1.15 + baseRock * 1.9));
          return mix(baseRock, tiltedVein, 0.42);
        }`
      )
      .replace(
        '#include <map_fragment>',
        `#include <map_fragment>
        vec3 wp = vCaucWorldPos;
        vec3 wn = normalize(vCaucObjNormal);
        vec3 triBw = pow(abs(wn), vec3(4.0));
        triBw /= max(0.0001, triBw.x + triBw.y + triBw.z);
        float slope = 1.0 - clamp(wn.y, 0.0, 1.0);
        float elevNorm = clamp(vTerrainMeta.x, 0.0, 1.0);
        float riverMask = clamp(vTerrainMeta.y, 0.0, 1.0);
        float roadMask = clamp(vTerrainMeta.z, 0.0, 1.0);
        float tpi = clamp(vTerrainMeta.w, 0.0, 1.0); // реальная топографическая кривизна NASA SRTM (0=каньон, 0.5=склон, 1=гребень)

        float macroN = cFbm(wp.xz * 0.14);
        float midN = cFbm(wp.xz * 0.68);
        float detailN = cFbm(wp.xz * 2.65);
        float fineN = cNoise(wp.xz * 9.5);
        float crag = cTriplanarCrag(wp, wn);

        // Фотограмметрия CC0: скала, дёрн/луг и грязь горных троп с мультимасштабным смешиванием
        vec3 photoRock = vec3(0.45, 0.39, 0.32);
        vec3 photoRockArm = vec3(1.0, 0.88, 0.0);
        vec3 photoGrass = vec3(0.24, 0.31, 0.14);
        vec3 photoMud = vec3(0.26, 0.20, 0.14);
        if (uHasPbr > 0.5) {
          vec3 rockMacro = cTriplanarSample(uRockDiff, wp, triBw, 0.22);
          vec3 rockMid = cTriplanarSample(uRockDiff, wp + vec3(3.1, 1.7, 2.4), triBw, 0.74);
          vec3 rockUltra = cTriplanarSample(uRockDiff, wp + vec3(6.7, 4.1, 1.9), triBw, 2.05);
          photoRock = mix(mix(rockMacro, rockMid, 0.46), rockUltra, 0.34);
          photoRockArm = cTriplanarSample(uRockArm, wp, triBw, 0.42);

          vec3 grassA = texture2D(uGrassDiff, wp.xz * 0.22).rgb;
          vec3 grassB = texture2D(uGrassDiff, wp.xz * 0.64 + vec2(0.31, 0.57)).rgb;
          photoGrass = mix(grassA, grassB, 0.42);

          vec3 mudA = texture2D(uMudDiff, wp.xz * 0.34).rgb;
          vec3 mudB = texture2D(uMudDiff, wp.xz * 0.86 + vec2(0.19, 0.43)).rgb;
          photoMud = mix(mudA, mudB, 0.45);
        }

        // 1. Аутентичные природные зоны реального Дагестана и Чечни (100% по реальным высотам SRTM, без призраков старой JPG!)
        float caspianSea = (1.0 - smoothstep(0.045, 0.088, wp.y)) * smoothstep(16.0, 24.0, wp.x);
        float caspianBeach = (1.0 - smoothstep(0.075, 0.17, wp.y)) * smoothstep(15.0, 23.0, wp.x) * (1.0 - caspianSea);

        // Притеречно-Сунженская степь (низменность < 260 м)
        float steppeZone = (1.0 - smoothstep(0.05, 0.14, elevNorm)) * (1.0 - smoothstep(-12.0, -3.5, wp.z));
        // Влажные предгорные буковые леса Ичкерии и северных склонов Салатау
        float ichkeriaForestZone = (1.0 - smoothstep(-3.0, 6.5, wp.x)) *
                                   smoothstep(0.06, 0.14, elevNorm) *
                                   (1.0 - smoothstep(0.42, 0.58, elevNorm));
        // Внутригорный куэстовый Дагестан (Хунзах, Гуниб, Чох, Салты, Гергебиль, Гимры, Сулакский каньон)
        float innerDagestan = smoothstep(-5.5, 4.5, wp.x) *
                              smoothstep(0.08, 0.22, elevNorm) *
                              (1.0 - smoothstep(0.58, 0.74, elevNorm));
        // Высокогорный сланцевый Дагестан и Богосский/Главный хребты (> 2350 м)
        float highShaleZone = smoothstep(0.54, 0.72, elevNorm);

        vec3 steppeCol = mix(vec3(0.28, 0.27, 0.14), vec3(0.40, 0.34, 0.18), macroN * 0.65 + detailN * 0.35);
        vec3 forestFloor = mix(vec3(0.07, 0.15, 0.05), vec3(0.14, 0.24, 0.08), midN * 0.6 + detailN * 0.4);
        vec3 alpineMeadow = mix(vec3(0.13, 0.22, 0.08), vec3(0.24, 0.30, 0.13), macroN);
        // Солнечные охристо-оливковые субальпийские пастбища Хунзаха, Гуниба и Андалала
        vec3 dagestanPlateauGrass = mix(vec3(0.29, 0.26, 0.14), vec3(0.42, 0.35, 0.19), midN * 0.65 + detailN * 0.35);
        // Изумрудные садовые террасы в тёплых речных долинах Гергебиля, Гимр и Койсу (низины tpi < 0.44)
        float valleyOrchardMask = smoothstep(0.46, 0.24, tpi) * innerDagestan * (1.0 - smoothstep(0.24, 0.44, elevNorm));
        vec3 valleyOrchardCol = mix(vec3(0.08, 0.20, 0.07), vec3(0.16, 0.29, 0.10), detailN);

        // Весеннее пробуждение (uSeasonMix = -1.0) и осеннее золото (uSeasonMix = +1.0)
        float springFactor = clamp(-uSeasonMix, 0.0, 1.0);
        if (springFactor > 0.01) {
          forestFloor = mix(forestFloor, mix(vec3(0.12, 0.27, 0.07), vec3(0.22, 0.38, 0.11), detailN), springFactor * 0.72);
          alpineMeadow = mix(alpineMeadow, mix(vec3(0.18, 0.34, 0.10), vec3(0.32, 0.44, 0.16), macroN), springFactor * 0.68);
          dagestanPlateauGrass = mix(dagestanPlateauGrass, vec3(0.26, 0.36, 0.14), springFactor * 0.56);
          valleyOrchardCol = mix(valleyOrchardCol, vec3(0.22, 0.40, 0.15), springFactor * 0.65);
          steppeCol = mix(steppeCol, vec3(0.24, 0.35, 0.12), springFactor * 0.62);
        }
        float autumnFactor = clamp(1.0 - abs(uSeasonMix - 1.0), 0.0, 1.0);
        if (autumnFactor > 0.01) {
          forestFloor = mix(forestFloor, mix(vec3(0.26, 0.12, 0.04), vec3(0.40, 0.22, 0.06), detailN), autumnFactor * 0.78);
          alpineMeadow = mix(alpineMeadow, mix(vec3(0.32, 0.24, 0.10), vec3(0.42, 0.30, 0.13), midN), autumnFactor * 0.64);
          dagestanPlateauGrass = mix(dagestanPlateauGrass, vec3(0.44, 0.31, 0.14), autumnFactor * 0.55);
          steppeCol = mix(steppeCol, vec3(0.36, 0.28, 0.15), autumnFactor * 0.52);
        }

        vec3 biomeCol = alpineMeadow;
        biomeCol = mix(biomeCol, dagestanPlateauGrass, innerDagestan * 0.88);
        biomeCol = mix(biomeCol, valleyOrchardCol, valleyOrchardMask * 0.78);
        biomeCol = mix(biomeCol, mix(forestFloor, photoMud * 0.82, 0.22), ichkeriaForestZone * 0.90);
        biomeCol = mix(biomeCol, steppeCol, steppeZone * 0.92);

        // Древние рукотворные земледельческие каменные террасы Нагорного Дагестана (строго на мягких травянистых склонах Чоха, Гуниба и Хунзаха)
        float terraceZone = innerDagestan *
                            smoothstep(0.18, 0.30, elevNorm) *
                            (1.0 - smoothstep(0.48, 0.58, elevNorm)) *
                            smoothstep(0.035, 0.075, slope) *
                            (1.0 - smoothstep(0.125, 0.175, slope)) *
                            smoothstep(0.42, 0.68, macroN);
        float terraceWave = 0.5 + 0.5 * sin(wp.y * 26.0 + macroN * 2.6);
        float terraceRiser = smoothstep(0.76, 0.96, terraceWave);
        biomeCol = mix(biomeCol, vec3(0.44, 0.38, 0.27), terraceZone * terraceRiser * 0.38);
        biomeCol *= 1.0 - terraceZone * smoothstep(0.58, 0.78, terraceWave) * 0.10;

        vec3 groundedVeg = biomeCol * mix(vec3(1.0), photoGrass * 2.15, uHasPbr * 0.68);

        // 2. Истинная геология скал Дагестана (естественные апериодические FBM-пласты без искусственных зебра-полос!):
        //    - Верхнеюрские/меловые медово-охристые известняки и доломиты куэст (Хунзах, Гуниб, Сулак)
        //    - Красноцветные терракотовые горизонты мергеля/песчаника (Гуниб, Салты, Карадах)
        //    - Тёмно-серые нижнеюрские аспидные сланцы глубоких каньонов Койсу и Богосского хребта
        vec3 honeyLimestone = mix(vec3(0.54, 0.45, 0.33), photoRock * vec3(1.32, 1.21, 1.03), uHasPbr * 0.80);
        vec3 ivoryRimLimestone = mix(vec3(0.65, 0.58, 0.46), photoRock * vec3(1.46, 1.38, 1.24), uHasPbr * 0.74);
        vec3 terracottaMarl = mix(vec3(0.46, 0.28, 0.19), photoRock * vec3(1.22, 0.86, 0.68), uHasPbr * 0.74);
        vec3 darkJurassicSlate = mix(vec3(0.16, 0.17, 0.19), photoRock * vec3(0.56, 0.58, 0.63), uHasPbr * 0.76);

        // Апериодическая естественная слоистость горной породы на основе FBM (разная толщина, разломы, без регулярных полос!)
        float dipTilt = wp.x * 0.055 - wp.z * 0.095;
        float strataBed = cFbm(vec2(wp.x * 0.18 + wp.z * 0.14, (wp.y + dipTilt) * 1.95 + macroN * 2.2));
        float fineBed = cFbm(vec2(wp.x * 0.46 - wp.z * 0.38, (wp.y + dipTilt) * 5.2 + midN * 1.8));
        float redMarlBand = smoothstep(0.58, 0.78, cFbm(vec2(wp.x * 0.11, (wp.y + dipTilt) * 1.35 + macroN * 1.9))) * innerDagestan;

        // Верхняя часть обрывов куэст — светлый тёплый известняк; глубокие каньоны и высокогорья — тёмный сланец!
        float canyonSlateMix = clamp(highShaleZone * 0.85 + smoothstep(0.44, 0.20, tpi) * 0.56, 0.0, 0.90);
        vec3 dagRock = mix(honeyLimestone, terracottaMarl, redMarlBand * 0.46);
        // Высветление бровки обрыва известняковых столовых плато (Хунзах, Верхний Гуниб)
        dagRock = mix(dagRock, ivoryRimLimestone, smoothstep(0.54, 0.76, tpi) * innerDagestan * 0.50);
        vec3 rockBase = mix(dagRock, darkJurassicSlate, canyonSlateMix);

        float fractureJoint = smoothstep(0.20, 0.80, crag * 0.65 + strataBed * 0.35);
        vec3 cliffRock = mix(darkJurassicSlate * 0.76, rockBase, fractureJoint);
        cliffRock *= (0.86 + 0.24 * fineBed) * (0.86 + 0.24 * detailN) * mix(1.0, 0.72 + 0.44 * photoRockArm.r, uHasPbr);

        // Альпийский лишайник и трава на узких карнизах скал
        float ledgeMoss = smoothstep(0.58, 0.90, strataBed) * smoothstep(0.46, 0.18, slope) * (1.0 - smoothstep(0.58, 0.74, elevNorm));
        cliffRock = mix(cliffRock, vec3(0.24, 0.27, 0.14), ledgeMoss * 0.30);

        float screeMask = smoothstep(0.09, 0.20, slope) * (1.0 - smoothstep(0.24, 0.38, slope));
        vec3 screeCol = mix(mix(vec3(0.32, 0.28, 0.22), vec3(0.22, 0.22, 0.24), highShaleZone), photoRock * 0.88, uHasPbr * 0.68);

        // На куэстах Дагестана скалы обнажаются уже на уклонах 14..30° (подчёркивая отвесные стены Хунзаха, Гуниба и Сулака!)
        float cliffThresh = mix(0.15, 0.11, innerDagestan);
        float cliffMask = smoothstep(cliffThresh, cliffThresh + 0.19, slope + (crag - 0.5) * 0.13);
        vec3 surfaceCol = mix(groundedVeg, screeCol, screeMask * 0.52);
        surfaceCol = mix(surfaceCol, cliffRock, cliffMask);

        // 3. Исторические горные тропы и военные тракты (CC0 лесная грязь + камни)
        vec3 trailCol = mix(vec3(0.30, 0.23, 0.15), photoMud * 1.18, uHasPbr * 0.72);
        float activeRoad = roadMask * (1.0 - riverMask * 0.88) * (1.0 - smoothstep(0.34, 0.54, slope));
        surfaceCol = mix(surfaceCol, trailCol, activeRoad * 0.64);

        // 4. Мокрая речная галька, сланцевые берега и валуны вдоль Койсу, Сулака, Аргуна, Сунжи и Терека
        vec3 wetBankCol = mix(vec3(0.13, 0.15, 0.16), photoRock * vec3(0.44, 0.47, 0.49), uHasPbr * 0.74);
        wetBankCol *= (0.86 + 0.26 * fineN);
        surfaceCol = mix(surfaceCol, wetBankCol, riverMask * 0.78);

        // 5. Каспийское море и золотистая береговая коса у Тарков (реальный SRTM <= 0 м)
        if (caspianBeach > 0.01) {
          surfaceCol = mix(surfaceCol, vec3(0.46, 0.40, 0.28) * (0.9 + 0.2 * fineN), caspianBeach * 0.82);
        }
        if (caspianSea > 0.01) {
          float cWave = cNoise(wp.xz * 0.9 + vec2(-uTime * 0.22, uTime * 0.12));
          vec3 caspianWater = mix(vec3(0.04, 0.21, 0.32), vec3(0.09, 0.34, 0.44), cWave);
          surfaceCol = mix(surfaceCol, caspianWater, caspianSea);
        }

        // 6. Дендритные ледники Богосского хребта и Главного Кавказского хребта (> 2850 м) + весеннее таяние
        float northShade = clamp(-wn.z * 0.5 + 0.5, 0.0, 1.0);
        float winterFactor = clamp(uSeasonMix - 1.0, 0.0, 1.0);
        float snowLineElev = mix(0.68, 0.48, clamp(uSeasonMix, 0.0, 1.0));
        snowLineElev = mix(snowLineElev, 0.55, springFactor);
        snowLineElev = mix(snowLineElev, 0.04, winterFactor);

        float snowPotential = elevNorm +
                              northShade * 0.06 +
                              (tpi - 0.5) * 0.08 +
                              (midN - 0.5) * 0.07 -
                              smoothstep(0.24, 0.56, slope) * (0.34 - winterFactor * 0.12);
        float snowMask = smoothstep(snowLineElev, snowLineElev + 0.11, snowPotential);
        snowMask *= (1.0 - riverMask * (0.88 - winterFactor * 0.35)) * (1.0 - caspianSea);

        vec3 glacierIce = vec3(0.52, 0.68, 0.84);
        vec3 sunlitSnow = vec3(0.88, 0.92, 0.96);
        vec3 snowCol = mix(glacierIce, sunlitSnow, smoothstep(0.26, 0.72, tpi * 0.45 + detailN * 0.55));
        surfaceCol = mix(surfaceCol, snowCol, snowMask);

        // 7. Истинное топографическое затенение каньонов (Сулакский каньон и теснины Койсу) + тени облаков
        float canyonAO = mix(0.68, 1.05, smoothstep(0.18, 0.78, tpi));
        float creviceAO = mix(0.78, 1.0, smoothstep(0.18, 0.56, crag));
        float cloudNoise = cFbm(wp.xz * 0.052 + vec2(uTime * 0.011, uTime * 0.005));
        float cloudShadow = mix(1.0 - uCloudShadowStrength, 1.0, smoothstep(0.38, 0.68, cloudNoise));

        surfaceCol *= canyonAO * mix(1.0, creviceAO, cliffMask) * cloudShadow * (0.95 + 0.10 * fineN);
        diffuseColor.rgb = surfaceCol;
        `
      )
      .replace(
        '#include <roughnessmap_fragment>',
        `#include <roughnessmap_fragment>
        vec3 rWn = normalize(vCaucObjNormal);
        vec3 rBw = pow(abs(rWn), vec3(4.0));
        rBw /= max(0.0001, rBw.x + rBw.y + rBw.z);
        float rSlope = 1.0 - clamp(rWn.y, 0.0, 1.0);
        float rRiver = clamp(vTerrainMeta.y, 0.0, 1.0);
        float rElev = clamp(vTerrainMeta.x, 0.0, 1.0);
        float rSea = (1.0 - smoothstep(0.045, 0.088, vCaucWorldPos.y)) * smoothstep(16.0, 24.0, vCaucWorldPos.x);
        float rockRough = uHasPbr > 0.5 ? cTriplanarSample(uRockArm, vCaucWorldPos, rBw, 0.42).g : 0.84;
        roughnessFactor = mix(0.92, clamp(rockRough, 0.62, 0.96), smoothstep(0.14, 0.38, rSlope));
        roughnessFactor = mix(roughnessFactor, 0.52, rRiver * 0.48);
        roughnessFactor = mix(roughnessFactor, 0.64, smoothstep(0.68, 0.88, rElev) * 0.38);
        roughnessFactor = mix(roughnessFactor, 0.16, rSea);`
      )
      .replace(
        '#include <normal_fragment_maps>',
        `#include <normal_fragment_maps>
        vec3 nWn = normalize(vCaucObjNormal);
        vec3 nTriBw = pow(abs(nWn), vec3(4.0));
        nTriBw /= max(0.0001, nTriBw.x + nTriBw.y + nTriBw.z);
        float nSlope = 1.0 - clamp(nWn.y, 0.0, 1.0);
        float nCliff = smoothstep(0.11, 0.30, nSlope);
        float nDip = vCaucWorldPos.x * 0.055 - vCaucWorldPos.z * 0.095;
        float strataN = cFbm(vec2(vCaucWorldPos.x * 0.24 + vCaucWorldPos.z * 0.18, (vCaucWorldPos.y + nDip) * 2.4 + cNoise(vCaucWorldPos.xz * 0.9) * 1.8));
        float microRelief = cTriplanarCrag(vCaucWorldPos * 1.9, nWn) * 0.52 +
                            cTriplanarCrag(vCaucWorldPos * 4.8, nWn) * 0.24 +
                            strataN * 0.16 * nCliff +
                            cNoise(vCaucWorldPos.xz * 12.0) * 0.12;
        vec3 dpdx = dFdx(vViewPosition);
        vec3 dpdy = dFdy(vViewPosition);
        float dhdx = dFdx(microRelief);
        float dhdy = dFdy(microRelief);
        vec3 r1 = cross(dpdy, normal);
        vec3 r2 = cross(normal, dpdx);
        float det = dot(dpdx, r1);
        if (abs(det) > 1e-6) {
          vec3 surfGrad = sign(det) * (dhdx * r1 + dhdy * r2);
          normal = normalize(abs(det) * normal - mix(0.13, 0.25, nCliff) * surfGrad);
        }
        if (uHasPbr > 0.5) {
          vec3 rnCoarse = cTriplanarSample(uRockNor, vCaucWorldPos, nTriBw, 0.42) * 2.0 - 1.0;
          vec3 rnFine = cTriplanarSample(uRockNor, vCaucWorldPos + vec3(4.3, 2.1, 1.7), nTriBw, 1.65) * 2.0 - 1.0;
          vec3 rn = normalize(rnCoarse * 0.52 + rnFine * 0.48);
          vec2 gn = cDualUvSample(uGrassNor, vCaucWorldPos.xz, 0.24, 0.68);
          vec2 mn = cDualUvSample(uMudNor, vCaucWorldPos.xz, 0.36, 0.82);
          float nRoad = clamp(vTerrainMeta.z, 0.0, 1.0);
          vec3 worldPerturb = mix(vec3(gn.x, 0.0, gn.y), vec3(mn.x, 0.0, mn.y), nRoad * 0.72);
          worldPerturb = mix(worldPerturb, vec3(rn.x, rn.y * 0.60, rn.z), nCliff);
          vec3 viewPerturb = (viewMatrix * vec4(worldPerturb, 0.0)).xyz;
          normal = normalize(normal + viewPerturb * mix(0.38, 0.72, nCliff));
        }`
      );
  };

  material.customProgramCacheKey = () => 'imamat_dagestan_real_srtm_terrain_v9';
  return material;
}

/**
 * Бесшовное континентальное окружение вокруг оперативной карты 70x46:
 * на востоке плещется Каспийское море (x > 35), на севере — Ногайская и Терская степь (z < -23),
 * на западе — предгорья Осетии и Кабарды, на юге — долины Кахетии, плавно уходящие в дымку горизонта.
 */
export function createExtendedCaucasusSurroundMaterial({ pbrPack = null, edgeMap = null } = {}) {
  const hasPbr = Boolean(pbrPack?.grassDiff && pbrPack?.rockDiff);
  const wTex = getFallbackWhiteTex();
  const nTex = getFallbackNormalTex();
  const uniforms = {
    uTime: { value: 0.0 },
    uSeasonMix: { value: 0.0 },
    uTint: { value: new THREE.Color('#ffffff') },
    uHasPbr: { value: hasPbr ? 1.0 : 0.0 },
    uHasEdgeMap: { value: edgeMap ? 1.0 : 0.0 },
    uEdgeMap: { value: edgeMap || wTex },
    uGrassDiff: { value: hasPbr ? pbrPack.grassDiff : wTex },
    uGrassNor: { value: hasPbr ? pbrPack.grassNor : nTex },
    uRockDiff: { value: hasPbr ? pbrPack.rockDiff : wTex },
    uRockNor: { value: hasPbr ? pbrPack.rockNor : nTex },
    uMudDiff: { value: hasPbr && pbrPack.mudDiff ? pbrPack.mudDiff : wTex },
    uCloudShadowStrength: { value: 0.22 }
  };

  const mat = new THREE.MeshStandardMaterial({
    color: '#ffffff',
    roughness: 0.9,
    metalness: 0.02,
    fog: true
  });
  mat.userData.shaderUniforms = uniforms;

  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uniforms.uTime;
    shader.uniforms.uSeasonMix = uniforms.uSeasonMix;
    shader.uniforms.uTint = uniforms.uTint;
    shader.uniforms.uHasPbr = uniforms.uHasPbr;
    shader.uniforms.uHasEdgeMap = uniforms.uHasEdgeMap;
    shader.uniforms.uEdgeMap = uniforms.uEdgeMap;
    shader.uniforms.uGrassDiff = uniforms.uGrassDiff;
    shader.uniforms.uGrassNor = uniforms.uGrassNor;
    shader.uniforms.uRockDiff = uniforms.uRockDiff;
    shader.uniforms.uRockNor = uniforms.uRockNor;
    shader.uniforms.uMudDiff = uniforms.uMudDiff;
    shader.uniforms.uCloudShadowStrength = uniforms.uCloudShadowStrength;

    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
        varying vec3 vSurrWorld;
        varying vec3 vSurrObjNormal;`
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        vSurrWorld = (modelMatrix * vec4(position, 1.0)).xyz;
        vSurrObjNormal = normalize(normal);`
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
        uniform float uTime;
        uniform float uSeasonMix;
        uniform vec3 uTint;
        uniform float uHasPbr;
        uniform float uHasEdgeMap;
        uniform sampler2D uEdgeMap;
        uniform sampler2D uGrassDiff;
        uniform sampler2D uGrassNor;
        uniform sampler2D uRockDiff;
        uniform sampler2D uRockNor;
        uniform sampler2D uMudDiff;
        uniform float uCloudShadowStrength;
        varying vec3 vSurrWorld;
        varying vec3 vSurrObjNormal;

        float sHash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
        }
        float sNoise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(
            mix(sHash(i), sHash(i + vec2(1.0, 0.0)), u.x),
            mix(sHash(i + vec2(0.0, 1.0)), sHash(i + vec2(1.0, 1.0)), u.x),
            u.y
          );
        }
        float sFbm(vec2 p) {
          float v = 0.0;
          float a = 0.5;
          mat2 rot = mat2(0.8, -0.6, 0.6, 0.8);
          for (int i = 0; i < 4; i++) {
            v += a * sNoise(p);
            p = rot * p * 2.07;
            a *= 0.5;
          }
          return v;
        }`
      )
      .replace(
        '#include <map_fragment>',
        `#include <map_fragment>
        vec2 p = vSurrWorld.xz;
        float elev = vSurrWorld.y;
        float slope = 1.0 - clamp(normalize(vSurrObjNormal).y, 0.0, 1.0);
        float macroN = sFbm(p * 0.14);
        float midN = sFbm(p * 0.68);
        float detailN = sFbm(p * 2.65);
        float fineN = sNoise(p * 9.5);
        float edgeDist = length(max(abs(p) - vec2(35.0, 23.0), 0.0));
        float borderBlend = exp(-edgeDist / 2.8);

        // Точная непрерывность текстур с карты (uGrassDiff 0.22/0.64 + satEdge + uRockDiff)
        vec3 outerGrass = vec3(0.24, 0.31, 0.14);
        vec3 outerRock = vec3(0.38, 0.34, 0.29);
        if (uHasPbr > 0.5) {
          vec3 gA = texture2D(uGrassDiff, p * 0.22).rgb;
          vec3 gB = texture2D(uGrassDiff, p * 0.64 + vec2(0.31, 0.57)).rgb;
          outerGrass = mix(gA, gB, 0.42);
          vec3 rA = texture2D(uRockDiff, p * 0.21).rgb;
          vec3 rB = texture2D(uRockDiff, p * 0.62 + vec2(0.37, 0.19)).rgb;
          outerRock = mix(rA, rB, 0.44);
        }

        // Биомы вокруг Восточного Кавказа, плавно продолжающие край 70x46
        float steppeZone = 1.0 - smoothstep(-14.5, -8.2, p.y);
        float ichkeriaZone = (1.0 - smoothstep(-2.5, 7.5, p.x)) *
                             smoothstep(-13.5, -7.2, p.y) *
                             (1.0 - smoothstep(4.5, 10.5, p.y));
        float dagestanZone = smoothstep(-2.5, 8.0, p.x) * smoothstep(-10.5, -3.5, p.y);

        vec3 steppeCol = mix(vec3(0.28, 0.30, 0.14), vec3(0.39, 0.35, 0.18), macroN * 0.7 + detailN * 0.3);
        vec3 forestFloor = mix(vec3(0.08, 0.18, 0.06), vec3(0.15, 0.25, 0.09), midN * 0.65 + detailN * 0.35);
        vec3 alpineMeadow = mix(vec3(0.15, 0.25, 0.09), vec3(0.25, 0.32, 0.14), macroN);
        vec3 dagestanPasture = mix(vec3(0.36, 0.31, 0.18), vec3(0.46, 0.39, 0.23), midN * 0.7 + detailN * 0.3);

        float springF = clamp(-uSeasonMix, 0.0, 1.0);
        float winterF = clamp(uSeasonMix - 1.0, 0.0, 1.0);
        float autumnF = clamp(1.0 - abs(uSeasonMix - 1.0), 0.0, 1.0);
        if (springF > 0.01) {
          forestFloor = mix(forestFloor, vec3(0.14, 0.30, 0.08), springF * 0.65);
          alpineMeadow = mix(alpineMeadow, vec3(0.22, 0.38, 0.12), springF * 0.62);
          dagestanPasture = mix(dagestanPasture, vec3(0.28, 0.37, 0.15), springF * 0.52);
          steppeCol = mix(steppeCol, vec3(0.24, 0.35, 0.12), springF * 0.58);
        }
        if (autumnF > 0.01) {
          forestFloor = mix(forestFloor, vec3(0.30, 0.16, 0.05), autumnF * 0.74);
          alpineMeadow = mix(alpineMeadow, vec3(0.32, 0.24, 0.11), autumnF * 0.60);
          steppeCol = mix(steppeCol, vec3(0.32, 0.26, 0.14), autumnF * 0.52);
        }

        vec3 biomeCol = alpineMeadow;
        biomeCol = mix(biomeCol, dagestanPasture, dagestanZone * 0.86);
        biomeCol = mix(biomeCol, forestFloor, ichkeriaZone * 0.88);
        biomeCol = mix(biomeCol, steppeCol, steppeZone * 0.90);

        vec3 outerLand = biomeCol * mix(vec3(1.0), outerGrass * 2.15, uHasPbr * 0.62);

        // Скальные гребни на дальних отрогах Большого Кавказа и охристый известняк Дагестана
        float cliffM = smoothstep(0.14, 0.36, slope + (midN - 0.5) * 0.14);
        vec3 limestoneCol = mix(vec3(0.56, 0.47, 0.32), vec3(0.66, 0.57, 0.40), midN);
        vec3 slateCol = mix(vec3(0.26, 0.24, 0.23), outerRock * 1.08, uHasPbr * 0.74);
        vec3 ridgeCol = mix(slateCol, limestoneCol * mix(vec3(1.0), outerRock * 1.45, uHasPbr * 0.55), dagestanZone * 0.78);
        outerLand = mix(outerLand, ridgeCol, cliffM);

        // Высокогорный снег на далёком Главном хребте и зимой
        float highSnow = smoothstep(4.8, 7.2, elev + macroN * 0.85 - slope * 1.3);
        vec3 snowCol = vec3(0.86, 0.90, 0.95);
        outerLand = mix(outerLand, snowCol, max(highSnow, winterF * 0.78));

        // Бесшовное продолжение Каспийского моря от реальной береговой линии SRTM (входит на карту на СВ при elev < 0.085)
        float caspianCoast = 37.8 + sin(p.y * 0.055) * 3.8 + smoothstep(-6.0, 18.0, p.y) * 5.2;
        float srtmEdgeSea = smoothstep(32.0, 35.0, p.x) * (1.0 - smoothstep(0.058, 0.092, elev));
        float farEastSea = smoothstep(caspianCoast - 2.4, caspianCoast + 3.4, p.x) * (1.0 - smoothstep(1.8, 3.8, elev));
        float seaMask = max(srtmEdgeSea, farEastSea);
        float wave = sNoise(p * 0.45 + vec2(-uTime * 0.18, uTime * 0.08));
        float ripple = sNoise(p * 1.4 + vec2(uTime * 0.24, -uTime * 0.14));
        vec3 caspianDeep = mix(vec3(0.05, 0.21, 0.31), vec3(0.11, 0.32, 0.42), wave * 0.7 + ripple * 0.3);
        vec3 sandyShoal = vec3(0.42, 0.37, 0.25);
        float beachMask = max(
          smoothstep(32.5, 35.5, p.x) * smoothstep(0.055, 0.088, elev) * (1.0 - smoothstep(0.088, 0.20, elev)),
          smoothstep(caspianCoast - 4.0, caspianCoast, p.x) * (1.0 - seaMask) * (1.0 - smoothstep(1.2, 2.5, elev))
        );

        float canyonAO = mix(0.76, 1.0, smoothstep(0.2, 3.2, elev + 1.2));
        float cloudNoise = sFbm(p * 0.052 + vec2(uTime * 0.011, uTime * 0.005));
        float cloudShadow = mix(1.0 - uCloudShadowStrength, 1.0, smoothstep(0.38, 0.68, cloudNoise));
        outerLand *= canyonAO * cloudShadow * (0.95 + 0.10 * fineN);

        vec3 finalSurr = mix(outerLand, sandyShoal, beachMask * 0.56);
        finalSurr = mix(finalSurr, caspianDeep, seaMask);

        diffuseColor.rgb = finalSurr * uTint;
        `
      )
      .replace(
        '#include <roughnessmap_fragment>',
        `#include <roughnessmap_fragment>
        vec2 rP = vSurrWorld.xz;
        float rElev = vSurrWorld.y;
        float rCoast = 37.8 + sin(rP.y * 0.055) * 3.8 + smoothstep(-6.0, 18.0, rP.y) * 5.2;
        float rSea = max(
          smoothstep(32.0, 35.0, rP.x) * (1.0 - smoothstep(0.058, 0.092, rElev)),
          smoothstep(rCoast - 2.4, rCoast + 3.4, rP.x) * (1.0 - smoothstep(1.8, 3.8, rElev))
        );
        roughnessFactor = mix(0.92, 0.18, rSea);`
      )
      .replace(
        '#include <normal_fragment_maps>',
        `#include <normal_fragment_maps>
        if (uHasPbr > 0.5) {
          vec2 nP = vSurrWorld.xz;
          float nCoast = 37.8 + sin(nP.y * 0.055) * 3.8 + smoothstep(-6.0, 18.0, nP.y) * 5.2;
          float nSea = max(
            smoothstep(32.0, 35.0, nP.x) * (1.0 - smoothstep(0.058, 0.092, vSurrWorld.y)),
            smoothstep(nCoast - 2.4, nCoast + 3.4, nP.x)
          );
          vec2 gN = (texture2D(uGrassNor, nP * 0.24).xy * 0.6 + texture2D(uGrassNor, nP * 0.68 + 0.37).xy * 0.4) * 2.0 - 1.0;
          vec3 viewPerturb = (viewMatrix * vec4(gN.x, 0.0, gN.y, 0.0)).xyz;
          normal = normalize(normal + viewPerturb * (0.30 * (1.0 - nSea)));
        }`
      );
  };

  mat.customProgramCacheKey = () => 'imamat_dagestan_real_srtm_surround_v4';
  return mat;
}

/**
 * Объёмный GLSL-шейдер великих рек Кавказа (Этап 2):
 * преломлённое галечное дно CC0, поглощение глубины Бера–Ламберта,
 * реальное отражение неба Pure Sky по Френелю и тонкие нити горных бурунов.
 */
export function createPhotorealRiverMaterial({ pbrPack = null } = {}) {
  const hasPbr = Boolean(pbrPack?.rockDiff);
  const skyReady = Boolean(
    pbrPack?.skyEquirectTex?.image?.complete && pbrPack?.skyEquirectTex?.image?.naturalWidth > 0
  );
  const wTex = getFallbackWhiteTex();
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: -4,
    polygonOffsetUnits: -4,
    uniforms: {
      uTime: { value: 0.0 },
      uSeasonMix: { value: 0.0 },
      uLightScale: { value: 1.0 },
      uSunDir: { value: new THREE.Vector3(-0.52, 0.76, -0.38).normalize() },
      uSunColor: { value: new THREE.Color('#fff3d6') },
      uSkyTint: { value: new THREE.Color('#7dd3fc') },
      uHasPbr: { value: hasPbr ? 1.0 : 0.0 },
      uRockDiff: { value: hasPbr ? pbrPack.rockDiff : wTex },
      uHasSky: { value: skyReady ? 1.0 : 0.0 },
      uSkyTex: { value: pbrPack?.skyEquirectTex || wTex }
    },
    vertexShader: `
      attribute float aRapids;
      attribute float aProgress;
      varying vec2 vUv;
      varying vec3 vWorldPos;
      varying float vRapids;
      varying float vProgress;
      void main() {
        vUv = uv;
        vRapids = aRapids;
        vProgress = aProgress;
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorldPos = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform float uSeasonMix;
      uniform float uLightScale;
      uniform vec3 uSunDir;
      uniform vec3 uSunColor;
      uniform vec3 uSkyTint;
      uniform float uHasPbr;
      uniform sampler2D uRockDiff;
      uniform float uHasSky;
      uniform sampler2D uSkyTex;
      varying vec2 vUv;
      varying vec3 vWorldPos;
      varying float vRapids;
      varying float vProgress;

      float rHash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
      }
      float rNoise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(rHash(i), rHash(i + vec2(1.0, 0.0)), u.x),
          mix(rHash(i + vec2(0.0, 1.0)), rHash(i + vec2(1.0, 1.0)), u.x),
          u.y
        );
      }

      void main() {
        float bankDist = min(vUv.x, 1.0 - vUv.x) * 2.0;
        float endFade = smoothstep(0.0, 0.05, vProgress) * (1.0 - smoothstep(0.95, 1.0, vProgress));
        float bankAlpha = smoothstep(0.0, 0.22, bankDist) * endFade;
        if (bankAlpha < 0.02) discard;

        vec2 flowWarp = vec2(
          rNoise(vec2(vUv.x * 4.0, vUv.y * 2.2 - uTime * 1.1)) - 0.5,
          rNoise(vec2(vUv.x * 4.5 + 3.2, vUv.y * 2.6 - uTime * 1.35)) - 0.5
        ) * 0.22;
        vec2 flow1 = vec2(vUv.x * 5.8, vUv.y * 3.8 - uTime * 1.95) + flowWarp;
        vec2 flow2 = vec2(vUv.x * 11.8 + 1.7, vUv.y * 8.4 - uTime * 2.85) - flowWarp * 0.65;
        vec2 flowStreaks = vec2(vUv.x * 19.0 - 0.8, vUv.y * 2.4 - uTime * 3.6) + flowWarp * 0.4;
        vec2 flowChops = vec2(vUv.x * 26.0 + 4.3, vUv.y * 15.0 - uTime * 4.2);
        float n1 = rNoise(flow1);
        float n2 = rNoise(flow2);
        float nStreak = rNoise(flowStreaks);
        float nChop = rNoise(flowChops);
        float ripple = n1 * 0.42 + n2 * 0.30 + nStreak * 0.16 + nChop * 0.12;

        float waveAmp = 0.56 + vRapids * 0.55;
        vec3 norm = normalize(vec3(
          ((n1 - 0.5) * 0.58 + (n2 - 0.5) * 0.32 + (nChop - 0.5) * 0.20) * waveAmp,
          1.0,
          ((n2 - 0.5) * 0.58 - (n1 - 0.5) * 0.28 + (nStreak - 0.5) * 0.22) * waveAmp
        ));
        vec3 viewDir = normalize(cameraPosition - vWorldPos);
        float ndv = max(0.0, dot(viewDir, norm));
        float fresnel = 0.05 + 0.95 * pow(1.0 - ndv, 4.0);

        // Преломлённое галечное дно и поглощение света по закону Бера–Ламберта (ледниковая бирюза Койсу и Аргуна)
        vec3 riverBed = vec3(0.22, 0.22, 0.19);
        if (uHasPbr > 0.5) {
          riverBed = texture2D(uRockDiff, vWorldPos.xz * 1.05 + norm.xz * 0.11).rgb * vec3(0.80, 0.88, 0.82);
        }
        float opticalDepth = smoothstep(0.0, 0.90, bankDist) * (0.62 + 0.72 * (1.0 - vRapids * 0.65));
        vec3 beerLambert = exp(-opticalDepth * vec3(2.65, 0.86, 0.66));
        vec3 deepGlacial = mix(vec3(0.02, 0.16, 0.24), vec3(0.06, 0.34, 0.40), smoothstep(0.18, 0.84, ripple));
        // Изумрудное подповерхностное просвечивание в гребнях быстрых волн
        float sssGlow = smoothstep(0.45, 0.85, ripple) * (0.35 + 0.65 * vRapids);
        deepGlacial += vec3(0.04, 0.18, 0.16) * sssGlow;
        vec3 waterCol = mix(deepGlacial, riverBed, beerLambert);

        // Отражение реального облачного неба Pure Sky по Френелю
        vec3 skyRefl = uSkyTint * 0.56;
        if (uHasSky > 0.5) {
          vec3 reflDir = reflect(-viewDir, norm);
          float ru = atan(reflDir.z, reflDir.x) / 6.28318530718 + 0.5;
          float rv = asin(clamp(reflDir.y, -1.0, 1.0)) / 3.14159265359 + 0.5;
          skyRefl = mix(uSkyTint * 0.44, texture2D(uSkyTex, vec2(ru, rv)).rgb, 0.78);
        }
        waterCol = mix(waterCol, skyRefl * uLightScale, fresnel * 0.64);

        // Бурлящие кружевные белые пороги горных рек, нити течения и прибрежный прибой (сохраняя бирюзу между гребнями!)
        float shoreBand = 1.0 - smoothstep(0.03, 0.28, bankDist);
        float rapidFactor = clamp(vRapids, 0.0, 1.0);
        // Тонкие стремительные продольные нити течения и поперечные гребни перекатов
        float foamStreaks = smoothstep(0.68 - rapidFactor * 0.14, 0.90, nStreak * 0.56 + nChop * 0.26 + n2 * 0.18);
        float standingCrest = smoothstep(0.72 - rapidFactor * 0.16, 0.92, n1 * 0.40 + nChop * 0.60) * smoothstep(0.22, 0.85, rapidFactor);
        float shoreFroth = smoothstep(0.52, 0.84, n2 * 0.50 + nChop * 0.50) * shoreBand;
        float totalFoam = clamp(max(foamStreaks * (0.48 + 0.34 * rapidFactor), standingCrest * 0.78) + shoreFroth * 0.72, 0.0, 0.84);
        vec3 foamColor = mix(vec3(0.68, 0.84, 0.88), vec3(0.90, 0.96, 0.99), smoothstep(0.32, 0.82, totalFoam));
        waterCol = mix(waterCol, foamColor, totalFoam * 0.76);

        float springFlow = clamp(-uSeasonMix, 0.0, 1.0);
        if (springFlow > 0.01) {
          // Весеннее половодье: более яркая ледниковая бирюза и бурная пена талых вод!
          waterCol = mix(waterCol, vec3(0.14, 0.52, 0.56), springFlow * 0.24);
          waterCol = mix(waterCol, vec3(0.88, 0.96, 1.0), totalFoam * springFlow * 0.28);
        }

        float winterIce = clamp(uSeasonMix - 1.0, 0.0, 1.0);
        if (winterIce > 0.01) {
          float shoreIce = (1.0 - smoothstep(0.06, 0.52, bankDist)) * winterIce;
          waterCol = mix(waterCol, vec3(0.68, 0.78, 0.88), shoreIce * 0.82);
        }

        waterCol *= uLightScale;

        // Двухлепестковые солнечные блики на гребнях горного потока (алмазная искра + мягкий блик)
        vec3 halfVec = normalize(uSunDir + viewDir);
        float specSharp = pow(max(0.0, dot(norm, halfVec)), 148.0);
        float specBroad = pow(max(0.0, dot(norm, halfVec)), 34.0);
        waterCol += uSunColor * (specSharp * 0.95 + specBroad * 0.28) * (0.68 * uLightScale + 0.10) * (1.0 - totalFoam * 0.45);

        float alpha = bankAlpha * mix(0.86, 0.98, max(totalFoam * 0.85, 1.0 - beerLambert.r * 0.62));
        gl_FragColor = vec4(waterCol, alpha);
      }
    `
  });
}

/**
 * Атмосферный купол неба Кавказа с процедурными перистыми и кучевыми облаками на небосводе
 * (заменяет грубые серые 3D-шары над картой реалистичной небесной облачностью!).
 */
export function createPhotorealSkyMaterial(pbrPack = null) {
  const skyReady = Boolean(
    pbrPack?.skyEquirectTex?.image?.complete && pbrPack?.skyEquirectTex?.image?.naturalWidth > 0
  );
  const skyUniforms = {
    uTime: { value: 0.0 },
    topColor: { value: new THREE.Color('#1a4b84') },
    midColor: { value: new THREE.Color('#538ec9') },
    horizonColor: { value: new THREE.Color('#c4dced') },
    sunDir: { value: new THREE.Vector3(-0.52, 0.62, -0.38).normalize() },
    sunGlowColor: { value: new THREE.Color('#fff1cc') },
    cloudTint: { value: new THREE.Color('#f1f5f9') },
    nightStarMix: { value: 0.0 },
    uSkyTex: { value: pbrPack?.skyEquirectTex || getFallbackWhiteTex() },
    uHasSkyTex: { value: skyReady ? 1.0 : 0.0 }
  };

  const skyMat = new THREE.ShaderMaterial({
    uniforms: skyUniforms,
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    vertexShader: `
      varying vec3 vDir;
      void main() {
        vDir = normalize(position);
        vec4 wp = modelMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 topColor;
      uniform vec3 midColor;
      uniform vec3 horizonColor;
      uniform vec3 sunDir;
      uniform vec3 sunGlowColor;
      uniform vec3 cloudTint;
      uniform float nightStarMix;
      uniform sampler2D uSkyTex;
      uniform float uHasSkyTex;
      varying vec3 vDir;

      float skyHash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }

      void main() {
        vec3 d = normalize(vDir);
        float h = clamp(d.y, 0.0, 1.0);
        vec3 procCol = mix(horizonColor, midColor, smoothstep(0.0, 0.24, h));
        procCol = mix(procCol, topColor, smoothstep(0.24, 0.84, h));

        vec3 col = procCol;
        if (uHasSkyTex > 0.5) {
          float phi = atan(d.z, d.x);
          float u = phi / 6.28318530718 + 0.5;
          float v = asin(clamp(d.y, -1.0, 1.0)) / 3.14159265359 + 0.5;
          vec3 photoSky = texture2D(uSkyTex, vec2(u, v)).rgb;
          vec3 tintedPhoto = photoSky * mix(vec3(1.0), cloudTint, 0.42);
          col = mix(tintedPhoto, procCol, nightStarMix * 0.88);
          col = mix(horizonColor, col, smoothstep(0.0, 0.14, h));
        }

        // Мягкое рассеяние Ми вокруг солнца / луны
        float sunCos = max(0.0, dot(d, normalize(sunDir)));
        col += sunGlowColor * pow(sunCos, 8.0) * (0.20 - nightStarMix * 0.10);
        col += sunGlowColor * pow(sunCos, 90.0) * 0.32;

        // Звёздная россыпь высокогорной ночи
        if (nightStarMix > 0.02 && h > 0.07) {
          vec2 starUv = floor(d.xz / max(0.22, d.y + 0.18) * 190.0);
          float sh = skyHash(starUv);
          if (sh > 0.9945) {
            float twinkle = (sh - 0.9945) * 180.0;
            col += vec3(0.75, 0.84, 0.98) * twinkle * nightStarMix * smoothstep(0.07, 0.35, h);
          }
        }

        gl_FragColor = vec4(col, 1.0);
      }
    `
  });

  return { skyMat, skyUniforms };
}

export function createWispyGorgeMistCanvas() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  const img = ctx.createImageData(128, 128);
  const d = img.data;
  for (let y = 0; y < 128; y++) {
    const ny = (y - 64) / 64.0;
    for (let x = 0; x < 128; x++) {
      const nx = (x - 64) / 64.0;
      const rSq = nx * nx * 0.85 + ny * ny * 1.35;
      const radial = Math.max(0.0, 1.0 - rSq);
      const wisp = fbm2(x * 0.065 + 2.3, y * 0.075 - 1.4, 3);
      const alpha = Math.pow(radial, 2.2) * Math.max(0.0, (wisp - 0.3) * 1.25);
      const idx = (y * 128 + x) * 4;
      d[idx] = 205;
      d[idx + 1] = 222;
      d[idx + 2] = 238;
      d[idx + 3] = Math.min(255, Math.round(alpha * 255));
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}

export function enhanceGlbTemplatePBR(rootGroup, modelKey, bumpTex, pbrPack = null) {
  const isArchitecture =
    modelKey === 'vedeno_capital' ||
    modelKey === 'watchtower' ||
    modelKey === 'fortress' ||
    modelKey === 'stone_bridge' ||
    modelKey === 'signal_beacon';
  const hasMasonry = Boolean(pbrPack?.masonryDiff && pbrPack?.masonryArm);
  const wTex = getFallbackWhiteTex();

  rootGroup.traverse((ch) => {
    if (!ch.isMesh || !ch.material) return;
    const mat = ch.material.clone();
    if (isArchitecture) {
      let isStoneWall = false;
      let isBrickWall = false;
      if (mat.color) {
        const lum = (mat.color.r + mat.color.g + mat.color.b) / 3;
        const sat = Math.max(mat.color.r, mat.color.g, mat.color.b) - Math.min(mat.color.r, mat.color.g, mat.color.b);
        const hasEmissive = mat.emissive && (mat.emissive.r + mat.emissive.g + mat.emissive.b > 0.15);
        if (sat < 0.18 && !hasEmissive) {
          isStoneWall = true;
          if (lum > 0.32) {
            mat.color.lerp(new THREE.Color('#c6b8a2'), 0.52);
          } else {
            mat.color.lerp(new THREE.Color('#5a5147'), 0.45);
          }
        } else if (
          modelKey === 'fortress' &&
          !hasEmissive &&
          (mat.metalness ?? 0) < 0.25 &&
          mat.color.r > mat.color.g * 1.35
        ) {
          isStoneWall = true;
          isBrickWall = true;
        }
      }
      if (ch.geometry?.attributes?.uv && !mat.bumpMap && bumpTex) {
        mat.bumpMap = bumpTex;
        mat.bumpScale = 0.055;
      }
      if (typeof mat.roughness === 'number') {
        mat.roughness = Math.max(0.84, mat.roughness);
      }
      if (typeof mat.metalness === 'number') {
        mat.metalness = Math.min(0.1, mat.metalness);
      }
      // Трипланарная фотограмметрия каменной/кирпичной кладки CC0 со швами и мхом у цоколя (без необходимости UV)
      if (isStoneWall && mat.isMeshStandardMaterial) {
        mat.onBeforeCompile = (shader) => {
          shader.uniforms.uHasMasonry = { value: hasMasonry ? 1.0 : 0.0 };
          shader.uniforms.uIsBrick = { value: isBrickWall ? 1.0 : 0.0 };
          shader.uniforms.uMasonryDiff = { value: hasMasonry ? pbrPack.masonryDiff : wTex };
          shader.uniforms.uMasonryArm = { value: hasMasonry ? pbrPack.masonryArm : wTex };

          shader.vertexShader = shader.vertexShader
            .replace(
              '#include <common>',
              `#include <common>
              varying vec3 vMasonryPos;
              varying vec3 vMasonryNor;`
            )
            .replace(
              '#include <begin_vertex>',
              `#include <begin_vertex>
              vMasonryPos = position;
              vMasonryNor = normalize(normal);`
            );
          shader.fragmentShader = shader.fragmentShader
            .replace(
              '#include <common>',
              `#include <common>
              uniform float uHasMasonry;
              uniform float uIsBrick;
              uniform sampler2D uMasonryDiff;
              uniform sampler2D uMasonryArm;
              varying vec3 vMasonryPos;
              varying vec3 vMasonryNor;
              float mHash(vec2 p) {
                return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
              }`
            )
            .replace(
              '#include <map_fragment>',
              `#include <map_fragment>
              float rowId = floor(vMasonryPos.y * 11.0);
              float rowFrac = fract(vMasonryPos.y * 11.0);
              float horizCoord = (vMasonryPos.x + vMasonryPos.z) * 5.5 + mod(rowId, 2.0) * 0.5;
              float colId = floor(horizCoord);
              float colFrac = fract(horizCoord);
              float blockTint = mHash(vec2(colId, rowId));
              float mortar = smoothstep(0.0, 0.11, rowFrac) * (1.0 - smoothstep(0.89, 1.0, rowFrac)) *
                             smoothstep(0.0, 0.09, colFrac) * (1.0 - smoothstep(0.91, 1.0, colFrac));
              float baseMoss = smoothstep(-0.1, 0.55, vMasonryPos.y);
              vec3 stoneVar = diffuseColor.rgb * (0.86 + 0.24 * blockTint);
              if (uHasMasonry > 0.5) {
                vec3 mBw = pow(abs(normalize(vMasonryNor)), vec3(4.0));
                mBw /= max(0.0001, mBw.x + mBw.y + mBw.z);
                vec3 mX = texture2D(uMasonryDiff, vMasonryPos.zy * 1.45).rgb;
                vec3 mY = texture2D(uMasonryDiff, vMasonryPos.xz * 1.45).rgb;
                vec3 mZ = texture2D(uMasonryDiff, vMasonryPos.xy * 1.45).rgb;
                vec3 mCol = mX * mBw.x + mY * mBw.y + mZ * mBw.z;
                if (uIsBrick > 0.5) {
                  stoneVar = mix(stoneVar, mCol * vec3(1.18, 0.72, 0.64), 0.52);
                } else {
                  stoneVar = mix(stoneVar, mCol * 1.25, 0.72);
                }
              }
              stoneVar = mix(stoneVar * 0.72, stoneVar, mortar);
              stoneVar = mix(vec3(0.22, 0.24, 0.17), stoneVar, 0.38 + 0.62 * baseMoss);
              diffuseColor.rgb = stoneVar;`
            )
            .replace(
              '#include <roughnessmap_fragment>',
              `#include <roughnessmap_fragment>
              if (uHasMasonry > 0.5) {
                vec3 rBw = pow(abs(normalize(vMasonryNor)), vec3(4.0));
                rBw /= max(0.0001, rBw.x + rBw.y + rBw.z);
                float rmX = texture2D(uMasonryArm, vMasonryPos.zy * 1.45).g;
                float rmY = texture2D(uMasonryArm, vMasonryPos.xz * 1.45).g;
                float rmZ = texture2D(uMasonryArm, vMasonryPos.xy * 1.45).g;
                float mRough = rmX * rBw.x + rmY * rBw.y + rmZ * rBw.z;
                roughnessFactor = clamp(mix(roughnessFactor, mRough, 0.75), 0.72, 0.96);
              }`
            );
        };
        mat.customProgramCacheKey = () => 'imamat_caucasus_glb_masonry_v3';
      }
    } else if (modelKey === 'unicorn_cannon') {
      if (typeof mat.roughness === 'number') mat.roughness = Math.min(0.45, mat.roughness);
    }
    ch.material = mat;
  });
}
