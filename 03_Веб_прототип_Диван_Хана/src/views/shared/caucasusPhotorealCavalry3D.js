// ============================================================================
// СКУЛЬПТУРНАЯ СКЕЛЕТНАЯ 3D-КОННИЦА КАВКАЗА (BLENDER 4.2 OPENVDB + 30-BONE SKINNEDMESH)
// 1. Бесшовная скульптурная анатомия кабардинского скакуна (4 395 тр., OpenVDB Remesh):
//    - единый мускулистый корпус без швов (атлетичная грудь, холка, круп, 4 трёхсуставные
//      ноги со скакательными суставами, наклонными бабками 50° и копытами);
//    - сухая восточно-кавказская голова (ганаши, надбровья, ноздри, глаза, уши);
//    - запечённая 3D Raycast Ambient Occlusion + анатомическая окраска мастей:
//      • Хаджи-Мурат: яблочно-серый кабардинец (бархатный тёмный нос, яблоки на крупе/плечах)
//      • Байсунгур: тёмно-гнедой скакун (чёрные «чулки» ниже запястий/скакалок, ремень по спине)
//      • Чапар / Наиб: каштаново-гнедой с белой проточиной на лбу и тёмными ногами.
// 2. Скульптурный всадник-горец (единый 30-костный скелет THREE.Skeleton + SkinnedMesh):
//    - резное лицо (нос с горбинкой, брови, скулы, глаза) + отдельная борода и усы;
//    - 3 органичные каракулевые папахи без «бубликов» + перекрёстная чалма с хвостом (Хаджи-Мурат)
//      + кожаная повязка на глаз (Байсунгур);
//    - приталенная черкеска с полами поверх бёдер, стоячий ворот и V-вырез бешмета, 18 серебряных
//      газырей, наборный пояс, кинжал Базалая, шашка «Гурда», мягкие ичиги в стременах,
//      драпированная 2-костная андийская бурка поверх крупа и живые динамические поводья.
// 3. Многослойные alpha-пряди гривы, чёлки и хвоста + контактная тень под копытами +
//    адаптация корпуса к наклону горных склонов Дагестана.
// ============================================================================
import * as THREE from 'three';
import {
  CAVALRY_RIG_BONES,
  CAVALRY_RIG_MESHES,
  CAVALRY_RIG_B64
} from '../../data/cavalrySculptedRigData.js';

let cachedRigResources = null;

function decodeBase64ToBytes(b64) {
  const binStr = atob(b64);
  const len = binStr.length;
  const out = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    out[i] = binStr.charCodeAt(i);
  }
  return out;
}

// ============================================================================
// ПРОЦЕДУРНЫЕ PBR-КАРТЫ (ШЕЛКОВАЯ ШЕРСТЬ, ALPHA-ПРЯДИ ГРИВЫ/ХВОСТА, КАРАКУЛЬ, СУКНО, КОЖА)
// ============================================================================
function createCavalryTextures() {
  const hash = (x, y) => {
    const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    return s - Math.floor(s);
  };

  const buildBumpNormalTex = (size, mode) => {
    const hData = new Float32Array(size * size);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const u = x / size;
        const v = y / size;
        let h = 0.5;
        if (mode === 'coat') {
          const streak = Math.sin(u * Math.PI * 64 + Math.sin(v * Math.PI * 12) * 1.4) * 0.16;
          const fine = (hash(x, Math.floor(y * 0.5)) - 0.5) * 0.22;
          h = 0.5 + streak + fine;
        } else if (mode === 'karakul') {
          const c1 = Math.sin(u * Math.PI * 22 + Math.cos(v * Math.PI * 18) * 2.4);
          const c2 = Math.cos(v * Math.PI * 26 - Math.sin(u * Math.PI * 20) * 2.1);
          const n = (hash(Math.floor(x * 0.5), Math.floor(y * 0.5)) - 0.5) * 0.45;
          h = 0.5 + c1 * c2 * 0.36 + n;
        } else if (mode === 'wool') {
          const twill = Math.sin((x + y) * 0.72) * 0.18 + Math.cos((x - y) * 0.48) * 0.10;
          const fuzz = (hash(x, y) - 0.5) * 0.26;
          h = 0.5 + twill + fuzz;
        } else if (mode === 'leather') {
          const pebble = Math.sin(u * Math.PI * 36) * Math.sin(v * Math.PI * 36) * 0.14;
          h = 0.5 + pebble + (hash(x, y) - 0.5) * 0.24;
        }
        hData[y * size + x] = Math.max(0, Math.min(1, h));
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const img = ctx.createImageData(size, size);
    const strength = mode === 'karakul' ? 3.2 : mode === 'wool' ? 2.1 : mode === 'leather' ? 1.8 : 1.35;
    for (let y = 0; y < size; y++) {
      const ym = (y - 1 + size) % size;
      const yp = (y + 1) % size;
      for (let x = 0; x < size; x++) {
        const xm = (x - 1 + size) % size;
        const xp = (x + 1) % size;
        const dx = (hData[y * size + xp] - hData[y * size + xm]) * strength;
        const dy = (hData[yp * size + x] - hData[ym * size + x]) * strength;
        const len = Math.hypot(-dx, -dy, 1.0);
        const idx = (y * size + x) * 4;
        img.data[idx] = Math.round(((-dx / len) * 0.5 + 0.5) * 255);
        img.data[idx + 1] = Math.round(((-dy / len) * 0.5 + 0.5) * 255);
        img.data[idx + 2] = Math.round(((1.0 / len) * 0.5 + 0.5) * 255);
        img.data[idx + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(mode === 'coat' ? 4 : 3, mode === 'coat' ? 4 : 3);
    return tex;
  };

  const buildHairStrandTex = () => {
    const W = 256;
    const H = 256;
    const diffC = document.createElement('canvas');
    diffC.width = W;
    diffC.height = H;
    const dCtx = diffC.getContext('2d');

    const alphaC = document.createElement('canvas');
    alphaC.width = W;
    alphaC.height = H;
    const aCtx = alphaC.getContext('2d');

    dCtx.fillStyle = '#9a9690';
    dCtx.fillRect(0, 0, W, H);
    aCtx.fillStyle = '#000000';
    aCtx.fillRect(0, 0, W, H);

    for (let i = 0; i < 76; i++) {
      const u = 0.06 + (i / 75) * 0.88;
      const edgeFade = Math.sin(Math.min(1, Math.max(0, (u - 0.04) / 0.92)) * Math.PI);
      const lenFrac = 0.62 + hash(i, 3.7) * 0.36 * (0.55 + 0.45 * edgeFade);
      const shade = Math.round(168 + hash(i, 9.1) * 78);
      const lw = 2.2 + hash(i, 1.9) * 2.8;
      const sway = (hash(i, 5.2) - 0.5) * 18;

      dCtx.strokeStyle = `rgb(${shade},${Math.round(shade * 0.98)},${Math.round(shade * 0.94)})`;
      dCtx.lineWidth = lw;
      dCtx.lineCap = 'round';
      dCtx.beginPath();
      dCtx.moveTo(u * W, 0);
      dCtx.quadraticCurveTo(u * W + sway, H * lenFrac * 0.55, u * W - sway * 0.5, H * lenFrac);
      dCtx.stroke();

      const grad = aCtx.createLinearGradient(0, 0, 0, H * lenFrac);
      const peakA = Math.min(1, 0.72 + 0.28 * edgeFade);
      grad.addColorStop(0.0, `rgba(255,255,255,${peakA.toFixed(2)})`);
      grad.addColorStop(0.68, `rgba(245,245,245,${(peakA * 0.92).toFixed(2)})`);
      grad.addColorStop(1.0, 'rgba(0,0,0,0)');
      aCtx.strokeStyle = grad;
      aCtx.lineWidth = lw + 0.8;
      aCtx.lineCap = 'round';
      aCtx.beginPath();
      aCtx.moveTo(u * W, 0);
      aCtx.quadraticCurveTo(u * W + sway, H * lenFrac * 0.55, u * W - sway * 0.5, H * lenFrac);
      aCtx.stroke();
    }

    const diffTex = new THREE.CanvasTexture(diffC);
    diffTex.colorSpace = THREE.SRGBColorSpace;
    const alphaTex = new THREE.CanvasTexture(alphaC);
    return { diffTex, alphaTex };
  };

  const buildContactShadowTex = () => {
    const S = 128;
    const c = document.createElement('canvas');
    c.width = S;
    c.height = S;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(S * 0.5, S * 0.5, S * 0.08, S * 0.5, S * 0.5, S * 0.48);
    g.addColorStop(0.0, 'rgba(10, 8, 6, 0.58)');
    g.addColorStop(0.45, 'rgba(12, 10, 8, 0.34)');
    g.addColorStop(0.80, 'rgba(14, 11, 8, 0.10)');
    g.addColorStop(1.0, 'rgba(14, 11, 8, 0.0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, S, S);
    return new THREE.CanvasTexture(c);
  };

  const buildBannerTex = (variantKey) => {
    const W = 256;
    const H = 128;
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    const ctx = c.getContext('2d');
    const isHadji = variantKey === 'hero_hadji_murat';
    const isBay = variantKey === 'hero_baysungur';

    const g = ctx.createLinearGradient(0, 0, W, H);
    if (isHadji) {
      g.addColorStop(0, '#881313');
      g.addColorStop(0.55, '#680d0d');
      g.addColorStop(1, '#450808');
    } else if (isBay) {
      g.addColorStop(0, '#0f4c35');
      g.addColorStop(0.55, '#0a3324');
      g.addColorStop(1, '#061f16');
    } else {
      g.addColorStop(0, '#1e4e34');
      g.addColorStop(0.6, '#143624');
      g.addColorStop(1, '#0c2317');
    }
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 6;
    ctx.strokeRect(5, 5, W - 10, H - 10);

    ctx.fillStyle = '#fde68a';
    ctx.beginPath();
    ctx.arc(88, 64, 24, 0.45, Math.PI * 2 - 0.45);
    ctx.arc(98, 64, 19, Math.PI * 2 - 0.55, 0.55, true);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#fef3c7';
    ctx.font = 'bold 24px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(isHadji ? 'نصر' : isBay ? 'الله' : 'شامل', 175, 72);

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  };

  return {
    coatNormal: buildBumpNormalTex(128, 'coat'),
    karakulNormal: buildBumpNormalTex(128, 'karakul'),
    woolNormal: buildBumpNormalTex(128, 'wool'),
    leatherNormal: buildBumpNormalTex(128, 'leather'),
    hairMaps: buildHairStrandTex(),
    contactShadowTex: buildContactShadowTex(),
    bannerHadji: buildBannerTex('hero_hadji_murat'),
    bannerBaysungur: buildBannerTex('hero_baysungur'),
    bannerNaib: buildBannerTex('cavalry_naib')
  };
}

// ============================================================================
// АНАТОМИЧЕСКАЯ ПОКРАСКА ВЕРШИН + ЗАПЕЧЁННЫЙ 3D RAYCAST AO
// ============================================================================
function paintMeshVertexColors(meshName, posArr, aoArr, variantKey) {
  const n = aoArr.length;
  const cols = new Float32Array(n * 3);
  const isHadji = variantKey === 'hero_hadji_murat';
  const isBay = variantKey === 'hero_baysungur';
  const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const lerp = (a, b, t) => a + (b - a) * clamp01(t);

  for (let i = 0; i < n; i++) {
    const x = posArr[i * 3];
    const y = posArr[i * 3 + 1];
    const z = posArr[i * 3 + 2];
    const rawAo = aoArr[i] / 255.0;
    const ao = 0.24 + rawAo * 0.76;

    let r = 1.0;
    let g = 1.0;
    let b = 1.0;

    if (meshName === 'HorseBody') {
      if (isHadji) {
        r = 0.93;
        g = 0.92;
        b = 0.89;
        const dap =
          Math.sin(z * 21.0 + Math.cos(y * 19.0) * 1.6) *
          Math.cos(y * 23.0 + Math.sin(x * 24.0) * 1.4);
        const dapZone = clamp01((y - 0.85) / 0.45) * (1.0 - clamp01((z - 0.50) / 0.25));
        const dapDrop = Math.max(0, dap) * 0.13 * dapZone;
        r -= dapDrop;
        g -= dapDrop;
        b -= dapDrop * 0.92;

        const legShade = 1.0 - clamp01((y - 0.12) / 0.36);
        r = lerp(r, 0.56, legShade * 0.65);
        g = lerp(g, 0.55, legShade * 0.65);
        b = lerp(b, 0.54, legShade * 0.65);

        const muzzleDist = Math.hypot(x * 1.4, (y - 1.51) * 1.25, (z - 1.04) * 1.1);
        const muzzleW = 1.0 - clamp01((muzzleDist - 0.04) / 0.11);
        r = lerp(r, 0.27, muzzleW * 0.88);
        g = lerp(g, 0.26, muzzleW * 0.88);
        b = lerp(b, 0.27, muzzleW * 0.88);

        const eyeDist = Math.hypot((Math.abs(x) - 0.064) * 2.1, (y - 1.775) * 2.1, (z - 0.865) * 2.0);
        const eyeW = 1.0 - clamp01((eyeDist - 0.025) / 0.045);
        r = lerp(r, 0.34, eyeW * 0.72);
        g = lerp(g, 0.33, eyeW * 0.72);
        b = lerp(b, 0.34, eyeW * 0.72);
      } else if (isBay) {
        r = 0.44;
        g = 0.18;
        b = 0.095;
        const warmFlank = clamp01(1.0 - Math.abs(y - 1.04) / 0.32) * 0.14;
        r += warmFlank;
        g += warmFlank * 0.55;
        const dorsal = clamp01(1.0 - Math.abs(x) / 0.075) * clamp01((y - 1.24) / 0.16);
        r = lerp(r, 0.14, dorsal * 0.70);
        g = lerp(g, 0.07, dorsal * 0.70);
        b = lerp(b, 0.04, dorsal * 0.70);
        const sockW = 1.0 - clamp01((y - 0.46) / 0.18);
        r = lerp(r, 0.085, sockW * 0.92);
        g = lerp(g, 0.068, sockW * 0.92);
        b = lerp(b, 0.058, sockW * 0.92);
        const muzzleDist = Math.hypot(x * 1.4, (y - 1.51) * 1.25, (z - 1.04) * 1.1);
        const muzzleW = 1.0 - clamp01((muzzleDist - 0.035) / 0.12);
        r = lerp(r, 0.12, muzzleW * 0.85);
        g = lerp(g, 0.085, muzzleW * 0.85);
        b = lerp(b, 0.070, muzzleW * 0.85);
      } else {
        r = 0.56;
        g = 0.27;
        b = 0.125;
        const sockW = 1.0 - clamp01((y - 0.42) / 0.18);
        r = lerp(r, 0.12, sockW * 0.86);
        g = lerp(g, 0.085, sockW * 0.86);
        b = lerp(b, 0.068, sockW * 0.86);
        if (Math.abs(x) < 0.024 && z > 0.84 && z < 1.01 && y > 1.56 && y < 1.84) {
          const blW = (1.0 - Math.abs(x) / 0.024) * 0.88;
          r = lerp(r, 0.94, blW);
          g = lerp(g, 0.92, blW);
          b = lerp(b, 0.88, blW);
        } else {
          const muzzleDist = Math.hypot(x * 1.4, (y - 1.51) * 1.25, (z - 1.04) * 1.1);
          const muzzleW = 1.0 - clamp01((muzzleDist - 0.03) / 0.11);
          r = lerp(r, 0.18, muzzleW * 0.82);
          g = lerp(g, 0.12, muzzleW * 0.82);
          b = lerp(b, 0.10, muzzleW * 0.82);
        }
      }

      if (y < 0.094) {
        const hoofW = 1.0 - clamp01((y - 0.072) / 0.022);
        r = lerp(r, 0.14, hoofW);
        g = lerp(g, 0.125, hoofW);
        b = lerp(b, 0.115, hoofW);
        if (y < 0.018) {
          r = 0.62;
          g = 0.64;
          b = 0.67;
        }
      }
    } else if (meshName === 'RiderHead' || meshName === 'RiderHands') {
      r = 0.84;
      g = 0.61;
      b = 0.46;
      if (meshName === 'RiderHead') {
        const cheekD = Math.hypot((Math.abs(x) - 0.044) * 2.0, (y - 2.092) * 2.2, (z - 0.074) * 2.0);
        const blush = 1.0 - clamp01(cheekD / 0.09);
        r = lerp(r, 0.88, blush * 0.35);
        g = lerp(g, 0.52, blush * 0.35);
        b = lerp(b, 0.40, blush * 0.35);
        const sockD = Math.hypot((Math.abs(x) - 0.032) * 2.5, (y - 2.118) * 2.8, (z - 0.096) * 2.5);
        const sock = 1.0 - clamp01(sockD / 0.065);
        r *= 1.0 - sock * 0.32;
        g *= 1.0 - sock * 0.36;
        b *= 1.0 - sock * 0.36;
      }
    } else if (meshName === 'SaddleShabrack') {
      if (isHadji) {
        r = 0.66;
        g = 0.11;
        b = 0.11;
      } else if (isBay) {
        r = 0.10;
        g = 0.36;
        b = 0.22;
      } else {
        r = 0.16;
        g = 0.25;
        b = 0.42;
      }
      if (y < 1.155 || z < -0.305 || z > 0.175) {
        r = 0.90;
        g = 0.72;
        b = 0.24;
      }
    } else if (meshName === 'RiderCherkesska') {
      if (isHadji) {
        r = 0.23;
        g = 0.155;
        b = 0.125;
      } else if (isBay) {
        r = 0.135;
        g = 0.135;
        b = 0.128;
      } else {
        r = 0.15;
        g = 0.19;
        b = 0.23;
      }
      if (y < 1.105) {
        r = lerp(r, 0.78, 0.62);
        g = lerp(g, 0.66, 0.62);
        b = lerp(b, 0.34, 0.62);
      }
    } else if (meshName === 'RiderBeshmet') {
      if (isHadji) {
        r = 0.76;
        g = 0.12;
        b = 0.12;
      } else if (isBay) {
        r = 0.12;
        g = 0.50;
        b = 0.28;
      } else {
        r = 0.82;
        g = 0.52;
        b = 0.14;
      }
    } else if (meshName === 'HorseHair') {
      if (isHadji) {
        r = 0.86;
        g = 0.85;
        b = 0.82;
      } else {
        r = 0.11;
        g = 0.09;
        b = 0.08;
      }
    } else if (meshName === 'RiderBeard') {
      r = isHadji ? 0.16 : 0.10;
      g = isHadji ? 0.11 : 0.08;
      b = isHadji ? 0.085 : 0.07;
    } else if (meshName.startsWith('Papakha')) {
      r = isHadji ? 0.20 : isBay ? 0.10 : 0.22;
      g = isHadji ? 0.15 : isBay ? 0.095 : 0.21;
      b = isHadji ? 0.12 : isBay ? 0.095 : 0.21;
    } else if (meshName === 'HadjiTurban') {
      r = 0.96;
      g = 0.94;
      b = 0.89;
    } else if (meshName === 'RiderBurka') {
      r = isHadji ? 0.16 : 0.09;
      g = isHadji ? 0.15 : 0.085;
      b = isHadji ? 0.14 : 0.085;
    } else if (
      meshName === 'RiderBoots' ||
      meshName === 'TackLeather' ||
      meshName === 'HorseBridle' ||
      meshName === 'BaysungurPatch'
    ) {
      r = 0.15;
      g = 0.10;
      b = 0.068;
    } else if (meshName === 'KubachiSilver') {
      r = 0.88;
      g = 0.90;
      b = 0.93;
    } else if (meshName === 'ShashkaGurda') {
      r = 0.92;
      g = 0.95;
      b = 0.98;
    } else if (meshName === 'EyesGlossy') {
      r = 0.05;
      g = 0.04;
      b = 0.035;
    }

    // Three.js BufferGeometry vertexColors ожидает линейное RGB-пространство: конвертируем sRGB -> Linear!
    const toLin = (c) => Math.pow(clamp01(c), 2.2);
    cols[i * 3] = toLin(r) * ao;
    cols[i * 3 + 1] = toLin(g) * ao;
    cols[i * 3 + 2] = toLin(b) * ao;
  }
  return cols;
}

// ============================================================================
// СИНХРОННЫЙ ДЕКОДЕР СКУЛЬПТУРНОГО РИГА BLENDER 4.2
// ============================================================================
function getRigResources() {
  if (cachedRigResources) return cachedRigResources;

  const rawBytes = decodeBase64ToBytes(CAVALRY_RIG_B64);
  const dv = new DataView(rawBytes.buffer, rawBytes.byteOffset, rawBytes.byteLength);

  const decodedMeshes = {};
  for (const meta of CAVALRY_RIG_MESHES) {
    let ptr = meta.offset;
    const nV = meta.verts;
    const nT = meta.tris;
    const pos = new Float32Array(nV * 3);
    const norm = new Float32Array(nV * 3);
    const uv = new Float32Array(nV * 2);
    const ao = new Uint8Array(nV);
    const skinIdx = new Uint16Array(nV * 4);
    const skinWt = new Float32Array(nV * 4);
    const indices = new Uint16Array(nT * 3);

    const [minX, minY, minZ] = meta.bmin;
    const spanX = Math.max(1e-5, meta.bmax[0] - minX);
    const spanY = Math.max(1e-5, meta.bmax[1] - minY);
    const spanZ = Math.max(1e-5, meta.bmax[2] - minZ);

    for (let i = 0; i < nV; i++) {
      pos[i * 3] = minX + (dv.getUint16(ptr, true) / 65535.0) * spanX;
      ptr += 2;
      pos[i * 3 + 1] = minY + (dv.getUint16(ptr, true) / 65535.0) * spanY;
      ptr += 2;
      pos[i * 3 + 2] = minZ + (dv.getUint16(ptr, true) / 65535.0) * spanZ;
      ptr += 2;
    }
    for (let i = 0; i < nV * 3; i++) {
      norm[i] = dv.getInt8(ptr++) / 127.0;
    }
    for (let i = 0; i < nV * 2; i++) {
      uv[i] = dv.getUint16(ptr, true) / 65535.0;
      ptr += 2;
    }
    for (let i = 0; i < nV; i++) {
      ao[i] = rawBytes[ptr++];
    }
    for (let i = 0; i < nV * 4; i++) {
      skinIdx[i] = rawBytes[ptr++];
    }
    for (let i = 0; i < nV * 4; i++) {
      skinWt[i] = rawBytes[ptr++] / 255.0;
    }
    for (let i = 0; i < nT * 3; i++) {
      indices[i] = dv.getUint16(ptr, true);
      ptr += 2;
    }

    decodedMeshes[meta.name] = { pos, norm, uv, ao, skinIdx, skinWt, indices };
  }

  const variantGeos = {};
  for (const vKey of ['hero_hadji_murat', 'hero_baysungur', 'cavalry_naib']) {
    const map = {};
    for (const [mName, d] of Object.entries(decodedMeshes)) {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(d.pos, 3));
      geo.setAttribute('normal', new THREE.BufferAttribute(d.norm, 3));
      geo.setAttribute('uv', new THREE.BufferAttribute(d.uv, 2));
      geo.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(d.skinIdx, 4));
      geo.setAttribute('skinWeight', new THREE.Float32BufferAttribute(d.skinWt, 4));
      geo.setAttribute(
        'color',
        new THREE.BufferAttribute(paintMeshVertexColors(mName, d.pos, d.ao, vKey), 3)
      );
      geo.setIndex(new THREE.BufferAttribute(d.indices, 1));
      geo.computeBoundingSphere();
      map[mName] = geo;
    }
    variantGeos[vKey] = map;
  }

  const textures = createCavalryTextures();

  const materials = {
    horseCoat: new THREE.MeshPhysicalMaterial({
      color: '#ffffff',
      vertexColors: true,
      normalMap: textures.coatNormal,
      normalScale: new THREE.Vector2(0.32, 0.32),
      roughness: 0.64,
      metalness: 0.0,
      sheen: 0.45,
      sheenRoughness: 0.56,
      sheenColor: new THREE.Color('#f7efe4')
    }),
    horseHair: new THREE.MeshStandardMaterial({
      color: '#ffffff',
      vertexColors: true,
      map: textures.hairMaps.diffTex,
      alphaMap: textures.hairMaps.alphaTex,
      alphaTest: 0.24,
      roughness: 0.72,
      metalness: 0.0,
      side: THREE.DoubleSide
    }),
    riderSkin: new THREE.MeshStandardMaterial({
      color: '#ffffff',
      vertexColors: true,
      roughness: 0.60,
      metalness: 0.0
    }),
    riderBeard: new THREE.MeshStandardMaterial({
      color: '#ffffff',
      vertexColors: true,
      normalMap: textures.karakulNormal,
      normalScale: new THREE.Vector2(0.55, 0.55),
      roughness: 0.88,
      metalness: 0.0
    }),
    papakhaFur: new THREE.MeshStandardMaterial({
      color: '#ffffff',
      vertexColors: true,
      normalMap: textures.karakulNormal,
      normalScale: new THREE.Vector2(1.15, 1.15),
      roughness: 0.92,
      metalness: 0.0
    }),
    clothWool: new THREE.MeshPhysicalMaterial({
      color: '#ffffff',
      vertexColors: true,
      normalMap: textures.woolNormal,
      normalScale: new THREE.Vector2(0.55, 0.55),
      roughness: 0.84,
      metalness: 0.0,
      sheen: 0.30,
      sheenRoughness: 0.78,
      sheenColor: new THREE.Color('#c8baa8')
    }),
    burkaFelt: new THREE.MeshStandardMaterial({
      color: '#ffffff',
      vertexColors: true,
      normalMap: textures.karakulNormal,
      normalScale: new THREE.Vector2(0.85, 0.85),
      roughness: 0.94,
      metalness: 0.0,
      side: THREE.DoubleSide
    }),
    beshmetSilk: new THREE.MeshPhysicalMaterial({
      color: '#ffffff',
      vertexColors: true,
      normalMap: textures.woolNormal,
      normalScale: new THREE.Vector2(0.28, 0.28),
      roughness: 0.52,
      metalness: 0.05,
      sheen: 0.55,
      sheenRoughness: 0.42
    }),
    leather: new THREE.MeshStandardMaterial({
      color: '#ffffff',
      vertexColors: true,
      normalMap: textures.leatherNormal,
      normalScale: new THREE.Vector2(0.50, 0.50),
      roughness: 0.44,
      metalness: 0.06
    }),
    silver: new THREE.MeshStandardMaterial({
      color: '#ffffff',
      vertexColors: true,
      roughness: 0.22,
      metalness: 0.94
    }),
    bladeSteel: new THREE.MeshStandardMaterial({
      color: '#ffffff',
      vertexColors: true,
      roughness: 0.14,
      metalness: 0.98
    }),
    eyesGlossy: new THREE.MeshPhysicalMaterial({
      color: '#0c0908',
      roughness: 0.05,
      metalness: 0.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04
    }),
    reinLeather: new THREE.MeshStandardMaterial({
      color: '#22150d',
      roughness: 0.48,
      metalness: 0.06
    }),
    poleWood: new THREE.MeshStandardMaterial({
      color: '#4e3422',
      roughness: 0.76,
      metalness: 0.04
    }),
    contactShadow: new THREE.MeshBasicMaterial({
      map: textures.contactShadowTex,
      transparent: true,
      opacity: 0.72,
      depthWrite: false
    })
  };

  const contactShadowGeo = new THREE.PlaneGeometry(1.18, 1.85);
  contactShadowGeo.rotateX(-Math.PI / 2);

  const lancePoleGeo = new THREE.CylinderGeometry(0.011, 0.013, 2.55, 8);
  const lanceTipGeo = new THREE.ConeGeometry(0.022, 0.12, 8);

  cachedRigResources = {
    variantGeos,
    textures,
    materials,
    contactShadowGeo,
    lancePoleGeo,
    lanceTipGeo
  };
  return cachedRigResources;
}

function createCavalrySkeleton() {
  const bones = [];
  const boneMap = {};
  const restPos = [];

  for (let i = 0; i < CAVALRY_RIG_BONES.length; i++) {
    const def = CAVALRY_RIG_BONES[i];
    const b = new THREE.Bone();
    b.name = def.name;
    if (def.parent >= 0) {
      const pDef = CAVALRY_RIG_BONES[def.parent];
      b.position.set(
        def.head[0] - pDef.head[0],
        def.head[1] - pDef.head[1],
        def.head[2] - pDef.head[2]
      );
      bones[def.parent].add(b);
    } else {
      b.position.set(def.head[0], def.head[1], def.head[2]);
    }
    restPos.push(b.position.clone());
    bones.push(b);
    boneMap[def.name] = b;
  }

  bones[0].updateMatrixWorld(true);
  const skeleton = new THREE.Skeleton(bones);
  return { bones, boneMap, restPos, skeleton };
}

export function createPhotorealCavalryInstance(
  variantKey = 'cavalry_naib',
  { scale = 1.0, castShadow = true, clippingPlanes = null } = {}
) {
  const res = getRigResources();
  const normKey =
    variantKey === 'hero_hadji_murat' || variantKey === 'hero_baysungur'
      ? variantKey
      : 'cavalry_naib';
  const isHadji = normKey === 'hero_hadji_murat';
  const isBay = normKey === 'hero_baysungur';

  const geos = res.variantGeos[normKey];
  const disposableClones = [];

  const matWithClip = (baseMat) => {
    if (!clippingPlanes) return baseMat;
    const cl = baseMat.clone();
    cl.clippingPlanes = clippingPlanes;
    disposableClones.push(cl);
    return cl;
  };

  const root = new THREE.Group();
  root.scale.setScalar(scale);

  const contactShadow = new THREE.Mesh(
    res.contactShadowGeo,
    matWithClip(res.materials.contactShadow)
  );
  contactShadow.position.set(0, 0.016, 0.02);
  contactShadow.renderOrder = 1;
  root.add(contactShadow);

  const slopeGroup = new THREE.Group();
  root.add(slopeGroup);

  const { bones, boneMap, restPos, skeleton } = createCavalrySkeleton();
  slopeGroup.add(bones[0]);

  const addSkinnedPart = (meshName, mat, doubleCast = true) => {
    const geo = geos[meshName];
    if (!geo) return null;
    const sm = new THREE.SkinnedMesh(geo, matWithClip(mat));
    sm.name = meshName;
    sm.castShadow = castShadow && doubleCast;
    sm.receiveShadow = true;
    sm.frustumCulled = false;
    sm.bind(skeleton);
    slopeGroup.add(sm);
    return sm;
  };

  addSkinnedPart('HorseBody', res.materials.horseCoat);
  addSkinnedPart('HorseHair', res.materials.horseHair, false);
  addSkinnedPart('SaddleShabrack', res.materials.clothWool);
  addSkinnedPart('TackLeather', res.materials.leather);
  addSkinnedPart('HorseBridle', res.materials.leather);
  addSkinnedPart('KubachiSilver', res.materials.silver);
  addSkinnedPart('EyesGlossy', res.materials.eyesGlossy, false);

  addSkinnedPart('RiderHead', res.materials.riderSkin);
  addSkinnedPart('RiderBeard', res.materials.riderBeard);
  addSkinnedPart('RiderCherkesska', res.materials.clothWool);
  addSkinnedPart('RiderBeshmet', res.materials.beshmetSilk);
  addSkinnedPart('RiderHands', res.materials.riderSkin);
  addSkinnedPart('RiderBoots', res.materials.leather);
  addSkinnedPart('RiderBurka', res.materials.burkaFelt);
  addSkinnedPart('ShashkaGurda', res.materials.bladeSteel);

  if (isHadji) {
    addSkinnedPart('PapakhaHadji', res.materials.papakhaFur);
    addSkinnedPart('HadjiTurban', res.materials.clothWool);
  } else if (isBay) {
    addSkinnedPart('PapakhaBaysungur', res.materials.papakhaFur);
    addSkinnedPart('BaysungurPatch', res.materials.leather);
  } else {
    addSkinnedPart('PapakhaNaib', res.materials.papakhaFur);
  }

  const reinSegs = 8;
  const createDynamicRein = () => {
    const geo = new THREE.BufferGeometry();
    const verts = new Float32Array((reinSegs + 1) * 2 * 3);
    const idxs = [];
    for (let i = 0; i < reinSegs; i++) {
      const a = i * 2;
      const b = a + 1;
      const c = a + 2;
      const d = a + 3;
      idxs.push(a, c, b, b, c, d);
    }
    geo.setAttribute('position', new THREE.BufferAttribute(verts, 3));
    geo.setIndex(idxs);
    disposableClones.push(geo);
    const mesh = new THREE.Mesh(geo, matWithClip(res.materials.reinLeather));
    mesh.frustumCulled = false;
    mesh.castShadow = false;
    slopeGroup.add(mesh);
    return mesh;
  };
  const reinL = createDynamicRein();
  const reinR = createDynamicRein();

  const bannerPivot = new THREE.Group();
  bannerPivot.position.set(-0.24, 0.06, -0.18);
  boneMap.Rider_Pelvis.add(bannerPivot);

  const lancePole = new THREE.Mesh(res.lancePoleGeo, matWithClip(res.materials.poleWood));
  lancePole.position.set(0, 0.86, 0);
  lancePole.castShadow = castShadow;
  bannerPivot.add(lancePole);

  const lanceTip = new THREE.Mesh(res.lanceTipGeo, matWithClip(res.materials.silver));
  lanceTip.position.set(0, 2.18, 0);
  bannerPivot.add(lanceTip);

  const bannerGeo = new THREE.PlaneGeometry(0.56, 0.28, 12, 3);
  bannerGeo.rotateY(Math.PI / 2);
  bannerGeo.translate(0, 1.94, -0.28);
  disposableClones.push(bannerGeo);
  const bPos = bannerGeo.attributes.position;
  const baseBannerZ = new Float32Array(bPos.count);
  for (let i = 0; i < bPos.count; i++) {
    baseBannerZ[i] = bPos.getZ(i);
  }

  const bannerTex = isHadji
    ? res.textures.bannerHadji
    : isBay
    ? res.textures.bannerBaysungur
    : res.textures.bannerNaib;
  const bannerMat = new THREE.MeshStandardMaterial({
    map: bannerTex,
    roughness: 0.72,
    metalness: 0.08,
    side: THREE.DoubleSide
  });
  if (clippingPlanes) bannerMat.clippingPlanes = clippingPlanes;
  disposableClones.push(bannerMat);
  const bannerMesh = new THREE.Mesh(bannerGeo, bannerMat);
  bannerMesh.castShadow = castShadow;
  bannerPivot.add(bannerMesh);

  const bitLocalL = new THREE.Vector3(0.056, 1.535 - 1.84, 1.005 - 0.76);
  const bitLocalR = new THREE.Vector3(-0.056, 1.535 - 1.84, 1.005 - 0.76);
  const handLocal = new THREE.Vector3(0.078 - 0.262, 1.552 - 1.648, 0.295 - 0.088);

  root.userData.photorealCavalryRig = {
    variantKey: normKey,
    slopeGroup,
    contactShadow,
    bones,
    boneMap,
    restPos,
    skeleton,
    reinL,
    reinR,
    reinSegs,
    bitLocalL,
    bitLocalR,
    handLocal,
    bannerMesh,
    baseBannerZ,
    disposableClones,
    _pA: new THREE.Vector3(),
    _pB: new THREE.Vector3(),
    _invSlope: new THREE.Matrix4(),
    _pCur: new THREE.Vector3()
  };

  updatePhotorealCavalry(root, { elapsed: 0, phase: 0, moving: false, selected: false });
  return root;
}

function updateDynamicReinMesh(reinMesh, pStart, pEnd, segs, sagAmt) {
  const pos = reinMesh.geometry.attributes.position;
  const halfW = 0.0048;
  for (let i = 0; i <= segs; i++) {
    const t = i / segs;
    const x = pStart.x + (pEnd.x - pStart.x) * t;
    const y = pStart.y + (pEnd.y - pStart.y) * t - Math.sin(t * Math.PI) * sagAmt;
    const z = pStart.z + (pEnd.z - pStart.z) * t;
    const vi = i * 2;
    pos.setXYZ(vi, x, y + halfW, z);
    pos.setXYZ(vi + 1, x, y - halfW, z);
  }
  pos.needsUpdate = true;
  reinMesh.geometry.computeVertexNormals();
}

export function updatePhotorealCavalry(
  rootObj,
  { elapsed = 0, phase = 0, moving = false, selected = false, slopePitch = 0, slopeRoll = 0 } = {}
) {
  const rig = rootObj?.userData?.photorealCavalryRig;
  if (!rig) return;

  const b = rig.boneMap;
  const rp = rig.restPos;

  rig.slopeGroup.rotation.x = slopePitch;
  rig.slopeGroup.rotation.z = slopeRoll;
  rig.contactShadow.rotation.x = slopePitch;
  rig.contactShadow.rotation.z = slopeRoll;

  if (moving) {
    const g = elapsed * 11.8 + phase;
    const heave = Math.max(0, Math.sin(g)) * 0.135;
    const pitch = Math.cos(g) * 0.088;

    b.Pelvis.position.set(rp[1].x, rp[1].y + heave, rp[1].z);
    b.Pelvis.rotation.set(pitch, 0, Math.sin(g * 0.5) * 0.025);
    b.Spine_Chest.rotation.set(-pitch * 0.35 + Math.sin(g) * 0.03, 0, 0);

    const animFore = (upper, lower, pastern, ph) => {
      const s = Math.sin(ph);
      const c = Math.cos(ph);
      upper.rotation.x = s * 0.54;
      lower.rotation.x = Math.max(0, c) * 0.85;
      pastern.rotation.x = -Math.max(0, -s) * 0.32 + Math.max(0, c) * 0.24;
    };
    const animHind = (thigh, hock, pastern, ph) => {
      const s = Math.sin(ph);
      const c = Math.cos(ph);
      thigh.rotation.x = s * 0.48;
      hock.rotation.x = -Math.max(0, -c) * 0.62;
      pastern.rotation.x = Math.max(0, s) * 0.28;
    };

    animFore(b.UpperLeg_FL, b.LowerLeg_FL, b.Pastern_FL, g);
    animFore(b.UpperLeg_FR, b.LowerLeg_FR, b.Pastern_FR, g + 0.78);
    animHind(b.Thigh_BL, b.Hock_BL, b.Pastern_BL, g + 3.05);
    animHind(b.Thigh_BR, b.Hock_BR, b.Pastern_BR, g + 3.82);

    b.Neck_1.rotation.set(0.06 + Math.sin(g + 1.3) * 0.10, 0, 0);
    b.Neck_2.rotation.set(0.04 + Math.sin(g + 1.7) * 0.08, 0, 0);
    b.Head.rotation.set(-0.08 - Math.sin(g + 1.5) * 0.08, 0, 0);

    b.Tail_1.rotation.set(0.46 + Math.sin(g * 1.2) * 0.14, 0, Math.cos(g * 0.7) * 0.06);
    b.Tail_2.rotation.set(0.24 + Math.sin(g * 1.2 - 0.6) * 0.14, 0, Math.cos(g * 0.7 - 0.5) * 0.08);
    b.Tail_3.rotation.set(0.16 + Math.sin(g * 1.2 - 1.2) * 0.16, 0, 0);

    b.Rider_Pelvis.rotation.set(0.14 - pitch * 0.52, 0, 0);
    b.Rider_Chest.rotation.set(0.09 + Math.sin(g) * 0.03, 0, 0);
    b.Rider_Head.rotation.set(-0.16, 0, 0);
    b.Rider_Arm_R.rotation.set(-0.28 + Math.sin(g) * 0.12, 0, -0.05);
    b.Rider_Forearm_R.rotation.set(-0.12 + Math.cos(g) * 0.08, 0, 0);
    b.Rider_Arm_L.rotation.set(0.08, 0, 0);
    b.Rider_Forearm_L.rotation.set(-0.06, 0, 0);

    b.Burka_Upper.rotation.set(0.22 + Math.abs(Math.sin(g)) * 0.10, 0, 0);
    b.Burka_Lower.rotation.set(0.24 + Math.sin(g - 0.7) * 0.14, 0, Math.cos(g * 0.6) * 0.05);
  } else {
    const breath = Math.sin(elapsed * 2.2 + phase);
    const pawWave = Math.max(0, Math.sin(elapsed * 1.25 + phase * 2.1));
    const pawAmt = Math.pow(pawWave, 6.0);

    b.Pelvis.position.set(rp[1].x, rp[1].y + breath * 0.005, rp[1].z);
    b.Pelvis.rotation.set(breath * 0.008, 0, 0);
    b.Spine_Chest.rotation.set(breath * 0.012, 0, 0);

    b.UpperLeg_FL.rotation.x = 0;
    b.LowerLeg_FL.rotation.x = 0;
    b.Pastern_FL.rotation.x = 0;

    b.UpperLeg_FR.rotation.x = -pawAmt * 0.36;
    b.LowerLeg_FR.rotation.x = pawAmt * 0.72;
    b.Pastern_FR.rotation.x = pawAmt * 0.28;

    b.Thigh_BL.rotation.x = 0.02;
    b.Hock_BL.rotation.x = -0.02;
    b.Pastern_BL.rotation.x = 0;
    b.Thigh_BR.rotation.x = -0.015;
    b.Hock_BR.rotation.x = 0.015;
    b.Pastern_BR.rotation.x = 0;

    const neckYaw = Math.sin(elapsed * 0.68 + phase * 1.3) * 0.11;
    b.Neck_1.rotation.set(breath * 0.025 + pawAmt * 0.08, neckYaw * 0.6, 0);
    b.Neck_2.rotation.set(breath * 0.018 + pawAmt * 0.05, neckYaw * 0.5, 0);
    b.Head.rotation.set(Math.sin(elapsed * 1.4 + phase) * 0.035, neckYaw * 0.4, 0);

    const tailSway = Math.sin(elapsed * 1.45 + phase * 2.3);
    b.Tail_1.rotation.set(0.05 + breath * 0.02, 0, tailSway * 0.11);
    b.Tail_2.rotation.set(0.04, 0, Math.sin(elapsed * 1.45 + phase * 2.3 - 0.6) * 0.13);
    b.Tail_3.rotation.set(0.03, 0, Math.sin(elapsed * 1.45 + phase * 2.3 - 1.2) * 0.14);

    b.Rider_Pelvis.rotation.set(0.02, 0, 0);
    b.Rider_Chest.rotation.set(breath * 0.015, Math.sin(elapsed * 0.55 + phase) * 0.03, 0);
    b.Rider_Head.rotation.set(
      Math.cos(elapsed * 0.85 + phase) * 0.035,
      Math.sin(elapsed * 0.62 + phase * 1.9) * 0.16,
      0
    );

    b.Rider_Arm_R.rotation.set(
      selected ? -0.44 + Math.sin(elapsed * 3.0) * 0.07 : Math.sin(elapsed * 1.5 + phase) * 0.035,
      0,
      selected ? -0.10 : 0
    );
    b.Rider_Forearm_R.rotation.set(selected ? -0.18 : 0, 0, 0);
    b.Rider_Arm_L.rotation.set(0.02, 0, 0);
    b.Rider_Forearm_L.rotation.set(0, 0, 0);

    b.Burka_Upper.rotation.set(0.02 + Math.sin(elapsed * 2.1 + phase) * 0.02, 0, 0);
    b.Burka_Lower.rotation.set(0.03 + Math.sin(elapsed * 2.1 + phase - 0.5) * 0.03, 0, 0);
  }

  rig.slopeGroup.updateMatrixWorld(true);
  rig._invSlope.copy(rig.slopeGroup.matrixWorld).invert();

  const handSlope = rig._pB
    .copy(rig.handLocal)
    .applyMatrix4(b.Rider_Forearm_L.matrixWorld)
    .applyMatrix4(rig._invSlope);
  const bitLSlope = rig._pA
    .copy(rig.bitLocalL)
    .applyMatrix4(b.Head.matrixWorld)
    .applyMatrix4(rig._invSlope);
  const sag = moving ? 0.032 : 0.068;
  updateDynamicReinMesh(rig.reinL, bitLSlope, handSlope, rig.reinSegs, sag);

  const bitRSlope = rig._pCur
    .copy(rig.bitLocalR)
    .applyMatrix4(b.Head.matrixWorld)
    .applyMatrix4(rig._invSlope);
  updateDynamicReinMesh(rig.reinR, bitRSlope, handSlope, rig.reinSegs, sag);

  const bp = rig.bannerMesh.geometry.attributes.position;
  const windFreq = moving ? 11.5 : 5.2;
  const windAmp = moving ? 0.075 : 0.042;
  for (let i = 0; i < bp.count; i++) {
    const bz = rig.baseBannerZ[i];
    const pin = Math.min(1, Math.abs(bz) / 0.56);
    bp.setX(i, Math.sin(elapsed * windFreq + bz * 10.5 + phase) * windAmp * pin);
  }
  bp.needsUpdate = true;
}

export function disposePhotorealCavalryInstance(rootObj) {
  const rig = rootObj?.userData?.photorealCavalryRig;
  if (!rig) return;
  if (rig.skeleton && typeof rig.skeleton.dispose === 'function') {
    rig.skeleton.dispose();
  }
  if (rig.disposableClones) {
    rig.disposableClones.forEach((item) => item.dispose());
  }
}
