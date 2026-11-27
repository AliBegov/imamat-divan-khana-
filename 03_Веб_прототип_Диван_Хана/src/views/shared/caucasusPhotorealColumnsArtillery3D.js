// ============================================================================
// СКУЛЬПТУРНАЯ 3D-АРМИЯ КАВКАЗА (BLENDER 4.2.9 LTS OPENVDB + RAYCAST AO PACK)
// 1. Пехотная колонна Отдельного Кавказского корпуса 1845 г. (9 скульптурных фигур:
//    офицер с фуражкой, золотыми эполетами и саблей; знамёнщик с развевающимся
//    Георгиевским знаменем; ротный барабанщик; 6 егерей в киверах обр. 1844 г.,
//    с перевязями, скатками шинелей, ранцами и ударными ружьями со штыками).
// 2. Горный 1/2-пудовый бронзовый единорог на окованном лафете:
//    - литой бронзовый ствол с винградом, дельфинами, цапфами и раструбом;
//    - 12-спицевые колёса в железных шинах, зарядный ящик и пирамида ядер;
//    - 2 скульптурных артиллериста расчёта (русский расчёт или мюриды Талхига!).
// 3. Крытый сухарный фургон Воронцова / пороховой обоз Ведено с упряжным конём:
//    - парусиновый свод на 5 гнутых обручах, дощатый кузов, 4 спицованных колеса,
//      бочки/ящики груза, ездовой на козлах с вожжами и русская гнутая дуга;
//    - OpenVDB-скульптурный тяжеловозный конь в хомуте, шорах и шлее с
//      раздельными передними и задними (со скакательными суставами) ногами!
// 4. Пешая сотня мюридов Имамата (черкески, алые бешметы, 14 серебряных газырей,
//    кинжалы, каракулевые папахи, длинные кремнёвки и зелёное знамя Шамиля).
// ============================================================================
import * as THREE from 'three';
import { ARMY_PACK_MESHES, ARMY_PACK_B64 } from '../../data/armySculptedAssetsData.js';

let cachedArmyResources = null;

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
// ПРОЦЕДУРНЫЕ PBR-КАРТЫ (СУКНО, КАРАКУЛЬ, ДУБ, ПАРУСИНА, КОНТАКТНЫЕ ТЕНИ, ЗНАМЁНА)
// ============================================================================
function createArmyPbrTextures() {
  const hash = (x, y) => {
    const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    return s - Math.floor(s);
  };

  const buildNormalMap = (size, mode) => {
    const hData = new Float32Array(size * size);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const u = x / size;
        const v = y / size;
        let h = 0.5;
        if (mode === 'wool') {
          const twill = Math.sin((x + y) * 0.78) * 0.16 + Math.cos((x - y) * 0.52) * 0.10;
          h = 0.5 + twill + (hash(x, y) - 0.5) * 0.24;
        } else if (mode === 'karakul') {
          const c1 = Math.sin(u * Math.PI * 20 + Math.cos(v * Math.PI * 16) * 2.3);
          const c2 = Math.cos(v * Math.PI * 24 - Math.sin(u * Math.PI * 18) * 2.1);
          h = 0.5 + c1 * c2 * 0.36 + (hash(Math.floor(x * 0.5), Math.floor(y * 0.5)) - 0.5) * 0.42;
        } else if (mode === 'wood') {
          const grain = Math.sin(v * Math.PI * 30 + Math.sin(u * Math.PI * 6) * 1.8) * 0.22;
          h = 0.5 + grain + (hash(Math.floor(x * 0.5), y) - 0.5) * 0.18;
        } else if (mode === 'canvas') {
          const weave = Math.sin(x * 1.15) * 0.14 + Math.cos(y * 1.15) * 0.14;
          h = 0.5 + weave + (hash(x, y) - 0.5) * 0.16;
        } else if (mode === 'metal') {
          const cast = Math.sin(u * Math.PI * 18) * Math.cos(v * Math.PI * 18) * 0.08;
          h = 0.5 + cast + (hash(x, y) - 0.5) * 0.18;
        } else {
          // horse coat / leather
          const streak = Math.sin(u * Math.PI * 52 + Math.sin(v * Math.PI * 10) * 1.2) * 0.14;
          h = 0.5 + streak + (hash(x, y) - 0.5) * 0.20;
        }
        hData[y * size + x] = Math.max(0, Math.min(1, h));
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const img = ctx.createImageData(size, size);
    const strength =
      mode === 'karakul'
        ? 3.1
        : mode === 'wood'
        ? 2.2
        : mode === 'wool' || mode === 'canvas'
        ? 1.9
        : 1.4;

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
    tex.repeat.set(3, 3);
    return tex;
  };

  const buildContactShadowTex = () => {
    const S = 128;
    const c = document.createElement('canvas');
    c.width = S;
    c.height = S;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(S * 0.5, S * 0.5, S * 0.08, S * 0.5, S * 0.5, S * 0.48);
    g.addColorStop(0.0, 'rgba(8, 7, 6, 0.52)');
    g.addColorStop(0.5, 'rgba(10, 9, 8, 0.28)');
    g.addColorStop(0.85, 'rgba(12, 10, 8, 0.08)');
    g.addColorStop(1.0, 'rgba(12, 10, 8, 0.0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, S, S);
    return new THREE.CanvasTexture(c);
  };

  const buildStGeorgeBannerTex = () => {
    const W = 256;
    const H = 160;
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    const ctx = c.getContext('2d');
    // Белый шёлк и оранжево-чёрная Георгиевская крестовина полкового знамени РИ 1845 г.
    ctx.fillStyle = '#f5f1e6';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#d97706';
    ctx.fillRect(0, H * 0.34, W, H * 0.32);
    ctx.fillRect(W * 0.36, 0, W * 0.28, H);
    ctx.fillStyle = '#18181b';
    ctx.fillRect(0, H * 0.43, W, H * 0.14);
    ctx.fillRect(W * 0.45, 0, W * 0.10, H);
    // Золотая кайма и центральный медальон двуглавого орла
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 8;
    ctx.strokeRect(6, 6, W - 12, H - 12);
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(W * 0.5, H * 0.5, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = '#111827';
    ctx.beginPath();
    ctx.arc(W * 0.5, H * 0.5, 13, 0, Math.PI * 2);
    ctx.fill();
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  };

  const buildImamatBannerTex = () => {
    const W = 256;
    const H = 160;
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    const ctx = c.getContext('2d');
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, '#064e3b');
    g.addColorStop(1, '#042f2e');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 7;
    ctx.strokeRect(7, 7, W - 14, H - 14);
    // Золотой полумесяц и скрещённые шашки Имамата
    ctx.fillStyle = '#f3d078';
    ctx.beginPath();
    ctx.arc(W * 0.48, H * 0.50, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#053b2f';
    ctx.beginPath();
    ctx.arc(W * 0.54, H * 0.47, 25, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f3d078';
    ctx.beginPath();
    ctx.arc(W * 0.62, H * 0.48, 7, 0, Math.PI * 2);
    ctx.fill();
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  };

  return {
    woolNorm: buildNormalMap(128, 'wool'),
    karakulNorm: buildNormalMap(128, 'karakul'),
    woodNorm: buildNormalMap(128, 'wood'),
    canvasNorm: buildNormalMap(128, 'canvas'),
    metalNorm: buildNormalMap(128, 'metal'),
    coatNorm: buildNormalMap(128, 'coat'),
    contactShadowTex: buildContactShadowTex(),
    stGeorgeBannerTex: buildStGeorgeBannerTex(),
    imamatBannerTex: buildImamatBannerTex()
  };
}

// ============================================================================
// СИНХРОННАЯ РАСПАКОВКА КВАНТОВАННОЙ ГЕОМЕТРИИ BLENDER (0ms, ZERO FETCH)
// Формат: Uint16[3*V] pos + Int8[3*V] norm + Uint16[2*V] uv + Uint8[V] ao + Uint16[3*T] idx
// ============================================================================
function decodeSculptedArmyPack() {
  const bytes = decodeBase64ToBytes(ARMY_PACK_B64);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const geos = {};

  for (const meta of ARMY_PACK_MESHES) {
    const V = meta.verts;
    const T = meta.tris;
    let off = meta.offset;

    const pos = new Float32Array(V * 3);
    const sx = (meta.bmax[0] - meta.bmin[0]) / 65535;
    const sy = (meta.bmax[1] - meta.bmin[1]) / 65535;
    const sz = (meta.bmax[2] - meta.bmin[2]) / 65535;
    for (let i = 0; i < V; i++) {
      pos[i * 3] = meta.bmin[0] + view.getUint16(off, true) * sx;
      pos[i * 3 + 1] = meta.bmin[1] + view.getUint16(off + 2, true) * sy;
      pos[i * 3 + 2] = meta.bmin[2] + view.getUint16(off + 4, true) * sz;
      off += 6;
    }

    const norm = new Float32Array(V * 3);
    for (let i = 0; i < V; i++) {
      const nx = view.getInt8(off) / 127;
      const ny = view.getInt8(off + 1) / 127;
      const nz = view.getInt8(off + 2) / 127;
      const nl = Math.hypot(nx, ny, nz) || 1;
      norm[i * 3] = nx / nl;
      norm[i * 3 + 1] = ny / nl;
      norm[i * 3 + 2] = nz / nl;
      off += 3;
    }

    const uv = new Float32Array(V * 2);
    for (let i = 0; i < V; i++) {
      uv[i * 2] = view.getUint16(off, true) / 65535;
      uv[i * 2 + 1] = view.getUint16(off + 2, true) / 65535;
      off += 4;
    }

    // Запечённый 3D Raycast AO в линейном пространстве цвета вершин
    const col = new Float32Array(V * 3);
    for (let i = 0; i < V; i++) {
      const ao = 0.24 + (bytes[off++] / 255) * 0.76;
      col[i * 3] = ao;
      col[i * 3 + 1] = ao;
      col[i * 3 + 2] = ao;
    }

    const idx = new Uint16Array(T * 3);
    for (let i = 0; i < T * 3; i++) {
      idx[i] = view.getUint16(off, true);
      off += 2;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('normal', new THREE.BufferAttribute(norm, 3));
    geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    geo.setIndex(new THREE.BufferAttribute(idx, 1));
    geo.computeBoundingSphere();
    geos[meta.name] = geo;
  }

  // Шаблон развевающегося полотнища знамени (вершинная волна по X от z=0 до z=-0.62)
  const flagGeo = new THREE.PlaneGeometry(0.62, 0.40, 12, 5);
  flagGeo.rotateY(Math.PI / 2);
  flagGeo.translate(0, 0, -0.31);
  geos.DynamicFlagTemplate = flagGeo;

  geos.ContactShadowPlane = new THREE.PlaneGeometry(1, 1);
  geos.ContactShadowPlane.rotateX(-Math.PI / 2);

  return geos;
}

function getSharedSculptedArmyAssets() {
  if (cachedArmyResources) return cachedArmyResources;

  const geos = decodeSculptedArmyPack();
  const tex = createArmyPbrTextures();

  const std = (opts) =>
    new THREE.MeshStandardMaterial({
      vertexColors: true,
      ...opts
    });

  const materials = {
    uniformGreen: std({
      color: '#1b4728',
      normalMap: tex.woolNorm,
      normalScale: new THREE.Vector2(0.45, 0.45),
      roughness: 0.84,
      metalness: 0.02
    }),
    greatcoatGrey: std({
      color: '#88857d',
      normalMap: tex.woolNorm,
      normalScale: new THREE.Vector2(0.55, 0.55),
      roughness: 0.90,
      metalness: 0.01
    }),
    crimsonTrim: std({
      color: '#c92328',
      normalMap: tex.woolNorm,
      normalScale: new THREE.Vector2(0.32, 0.32),
      roughness: 0.68,
      metalness: 0.04
    }),
    whiteBelts: std({
      color: '#ebe6d8',
      normalMap: tex.canvasNorm,
      normalScale: new THREE.Vector2(0.28, 0.28),
      roughness: 0.72,
      metalness: 0.01
    }),
    blackLeather: std({
      color: '#221f1c',
      normalMap: tex.coatNorm,
      normalScale: new THREE.Vector2(0.32, 0.32),
      roughness: 0.46,
      metalness: 0.06
    }),
    darkHair: std({
      color: '#181411',
      normalMap: tex.karakulNorm,
      normalScale: new THREE.Vector2(0.45, 0.45),
      roughness: 0.86,
      metalness: 0.02
    }),
    skinTone: std({
      color: '#dfb090',
      roughness: 0.62,
      metalness: 0.01
    }),
    artilleryBronze: std({
      color: '#e8bc62',
      normalMap: tex.metalNorm,
      normalScale: new THREE.Vector2(0.35, 0.35),
      roughness: 0.28,
      metalness: 0.88
    }),
    bayonetSteel: std({
      color: '#d4dce6',
      normalMap: tex.metalNorm,
      normalScale: new THREE.Vector2(0.25, 0.25),
      roughness: 0.24,
      metalness: 0.92
    }),
    forgedIron: std({
      color: '#34383f',
      normalMap: tex.metalNorm,
      normalScale: new THREE.Vector2(0.42, 0.42),
      roughness: 0.42,
      metalness: 0.84
    }),
    boreMatteBlack: new THREE.MeshBasicMaterial({ color: '#070709' }),
    carriageImpGreen: std({
      color: '#4c6d3e',
      normalMap: tex.woodNorm,
      normalScale: new THREE.Vector2(0.55, 0.55),
      roughness: 0.78,
      metalness: 0.03
    }),
    oakWood: std({
      color: '#734b2a',
      normalMap: tex.woodNorm,
      normalScale: new THREE.Vector2(0.58, 0.58),
      roughness: 0.78,
      metalness: 0.02
    }),
    wagonCanvasImperial: std({
      color: '#dfd5c0',
      normalMap: tex.canvasNorm,
      normalScale: new THREE.Vector2(0.48, 0.48),
      roughness: 0.88,
      metalness: 0.01,
      side: THREE.DoubleSide
    }),
    wagonCanvasImamat: std({
      color: '#6b634b',
      normalMap: tex.canvasNorm,
      normalScale: new THREE.Vector2(0.52, 0.52),
      roughness: 0.90,
      metalness: 0.01,
      side: THREE.DoubleSide
    }),
    draftBayCoat: std({
      color: '#6e3418',
      normalMap: tex.coatNorm,
      normalScale: new THREE.Vector2(0.42, 0.42),
      roughness: 0.66,
      metalness: 0.03
    }),
    draftDarkBayCoat: std({
      color: '#3c1e10',
      normalMap: tex.coatNorm,
      normalScale: new THREE.Vector2(0.42, 0.42),
      roughness: 0.64,
      metalness: 0.03
    }),
    muridCherkesskaDark: std({
      color: '#3a3026',
      normalMap: tex.woolNorm,
      normalScale: new THREE.Vector2(0.54, 0.54),
      roughness: 0.86,
      metalness: 0.02
    }),
    muridCherkesskaOlive: std({
      color: '#494230',
      normalMap: tex.woolNorm,
      normalScale: new THREE.Vector2(0.54, 0.54),
      roughness: 0.86,
      metalness: 0.02
    }),
    muridPapakha: std({
      color: '#26201b',
      normalMap: tex.karakulNorm,
      normalScale: new THREE.Vector2(0.75, 0.75),
      roughness: 0.94,
      metalness: 0.01
    }),
    kubachiSilver: std({
      color: '#dfe5ed',
      normalMap: tex.metalNorm,
      normalScale: new THREE.Vector2(0.24, 0.24),
      roughness: 0.22,
      metalness: 0.94
    }),
    stGeorgeBanner: new THREE.MeshStandardMaterial({
      map: tex.stGeorgeBannerTex,
      normalMap: tex.canvasNorm,
      normalScale: new THREE.Vector2(0.28, 0.28),
      roughness: 0.64,
      metalness: 0.04,
      side: THREE.DoubleSide
    }),
    imamatBanner: new THREE.MeshStandardMaterial({
      map: tex.imamatBannerTex,
      normalMap: tex.canvasNorm,
      normalScale: new THREE.Vector2(0.28, 0.28),
      roughness: 0.66,
      metalness: 0.04,
      side: THREE.DoubleSide
    }),
    contactShadow: new THREE.MeshBasicMaterial({
      map: tex.contactShadowTex,
      transparent: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -1
    })
  };

  cachedArmyResources = { geos, tex, materials };
  return cachedArmyResources;
}

function makeClipHelper(clippingPlanes) {
  const disposableClones = [];
  const matWithClip = (baseMat) => {
    if (!clippingPlanes) return baseMat;
    const cl = baseMat.clone();
    cl.clippingPlanes = clippingPlanes;
    disposableClones.push(cl);
    return cl;
  };
  return { disposableClones, matWithClip };
}

function attachContactShadow(parent, geos, shadowMat, width, depth, zOffset = 0) {
  const m = new THREE.Mesh(geos.ContactShadowPlane, shadowMat);
  m.scale.set(width, 1, depth);
  m.position.set(0, 0.012, zOffset);
  m.renderOrder = 1;
  parent.add(m);
  return m;
}

// Вспомогательная сборка одного скульптурного русского солдата / офицера / артиллериста
function buildSculptedRussianFigure({ geos, mats, setup, role = 'infantry' }) {
  const fig = new THREE.Group();

  const legL = new THREE.Group();
  legL.position.set(0.052, 0.52, 0);
  legL.add(setup(new THREE.Mesh(geos.RusLegBoot, mats.leather)));
  fig.add(legL);

  const legR = new THREE.Group();
  legR.position.set(-0.052, 0.52, 0);
  legR.add(setup(new THREE.Mesh(geos.RusLegBoot, mats.leather)));
  fig.add(legR);

  fig.add(setup(new THREE.Mesh(geos.RusTorso, mats.green)));
  fig.add(setup(new THREE.Mesh(geos.RusRedTrim, mats.red)));
  fig.add(setup(new THREE.Mesh(geos.RusHead, mats.skin)));
  fig.add(setup(new THREE.Mesh(geos.RusMustacheEyes, mats.hair)));

  const rArm = new THREE.Group();
  rArm.position.set(-0.148, 0.84, 0.008);
  rArm.add(setup(new THREE.Mesh(geos.RusArmR, mats.green)));
  rArm.add(setup(new THREE.Mesh(geos.SoldierHandR, mats.skin)));
  fig.add(rArm);

  const lArm = new THREE.Group();
  lArm.position.set(0.148, 0.84, 0.008);
  lArm.add(setup(new THREE.Mesh(geos.RusArmL, mats.green)));
  lArm.add(setup(new THREE.Mesh(geos.SoldierHandL, mats.skin)));
  fig.add(lArm);

  if (role === 'officer') {
    fig.add(setup(new THREE.Mesh(geos.RusOfficerCap, mats.white)));
    fig.add(setup(new THREE.Mesh(geos.RusOfficerBrass, mats.bronze)));
    rArm.add(setup(new THREE.Mesh(geos.RusOfficerSaber, mats.steel)));
  } else {
    fig.add(setup(new THREE.Mesh(geos.RusShako, mats.leather)));
    fig.add(setup(new THREE.Mesh(geos.RusShakoBrass, mats.bronze)));
    fig.add(setup(new THREE.Mesh(geos.RusWhiteBelts, mats.white)));
    if (role !== 'gunner') {
      fig.add(setup(new THREE.Mesh(geos.RusGreatcoatRoll, mats.grey)));
      fig.add(setup(new THREE.Mesh(geos.RusKnapsack, mats.leather)));
    }
    if (role === 'standard') {
      rArm.add(setup(new THREE.Mesh(geos.RusFlagPike, mats.wood)));
      rArm.add(setup(new THREE.Mesh(geos.RusFlagFinial, mats.bronze)));
    } else if (role === 'drummer') {
      fig.add(setup(new THREE.Mesh(geos.RusDrumBrass, mats.bronze)));
      fig.add(setup(new THREE.Mesh(geos.RusDrumRim, mats.white)));
    } else if (role === 'gunner') {
      rArm.add(setup(new THREE.Mesh(geos.CannonRammer, mats.wood)));
    } else {
      rArm.add(setup(new THREE.Mesh(geos.RusMusketWood, mats.wood)));
      rArm.add(setup(new THREE.Mesh(geos.RusMusketSteel, mats.steel)));
    }
  }

  return { fig, legL, legR, rArm, lArm };
}

// Вспомогательная сборка одного скульптурного горца-мюрида / артиллериста Имамата
function buildSculptedMuridFigure({ geos, mats, setup, role = 'rifle', altCoat = false }) {
  const fig = new THREE.Group();
  const coatMat = altCoat ? mats.cherkAlt : mats.cherk;

  const legL = new THREE.Group();
  legL.position.set(0.052, 0.52, 0);
  legL.add(setup(new THREE.Mesh(geos.RusLegBoot, mats.leather)));
  fig.add(legL);

  const legR = new THREE.Group();
  legR.position.set(-0.052, 0.52, 0);
  legR.add(setup(new THREE.Mesh(geos.RusLegBoot, mats.leather)));
  fig.add(legR);

  fig.add(setup(new THREE.Mesh(geos.MuridCherkesska, coatMat)));
  fig.add(setup(new THREE.Mesh(geos.MuridBeshmet, mats.red)));
  fig.add(setup(new THREE.Mesh(geos.MuridHead, mats.skin)));
  fig.add(setup(new THREE.Mesh(geos.MuridBeard, mats.hair)));
  fig.add(setup(new THREE.Mesh(geos.MuridPapakha, mats.papakha)));
  fig.add(setup(new THREE.Mesh(geos.MuridSilverGear, mats.silver)));

  const rArm = new THREE.Group();
  rArm.position.set(-0.148, 0.84, 0.008);
  rArm.add(setup(new THREE.Mesh(geos.RusArmR, coatMat)));
  rArm.add(setup(new THREE.Mesh(geos.SoldierHandR, mats.skin)));
  fig.add(rArm);

  const lArm = new THREE.Group();
  lArm.position.set(0.148, 0.84, 0.008);
  lArm.add(setup(new THREE.Mesh(geos.RusArmL, coatMat)));
  lArm.add(setup(new THREE.Mesh(geos.SoldierHandL, mats.skin)));
  fig.add(lArm);

  if (role === 'standard') {
    rArm.add(setup(new THREE.Mesh(geos.RusFlagPike, mats.wood)));
    rArm.add(setup(new THREE.Mesh(geos.RusFlagFinial, mats.bronze)));
  } else if (role === 'gunner') {
    rArm.add(setup(new THREE.Mesh(geos.CannonRammer, mats.wood)));
  } else if (role === 'officer') {
    rArm.add(setup(new THREE.Mesh(geos.RusOfficerSaber, mats.steel)));
  } else {
    rArm.add(setup(new THREE.Mesh(geos.MuridRifleWood, mats.wood)));
    rArm.add(setup(new THREE.Mesh(geos.MuridRifleSteel, mats.steel)));
  }

  return { fig, legL, legR, rArm, lArm };
}

/**
 * 1. СКУЛЬПТУРНАЯ ПЕХОТНАЯ КОЛОННА ОТДЕЛЬНОГО КАВКАЗСКОГО КОРПУСА (9 ФИГУР В СТРОЮ)
 * Ориентирована лицом к +Z, подошвы стоят на y = 0.0.
 */
export function createPhotorealImperialColumnInstance({
  scale = 1.0,
  castShadow = true,
  clippingPlanes = null
} = {}) {
  const { geos, materials } = getSharedSculptedArmyAssets();
  const { disposableClones, matWithClip } = makeClipHelper(clippingPlanes);

  const mats = {
    green: matWithClip(materials.uniformGreen),
    grey: matWithClip(materials.greatcoatGrey),
    red: matWithClip(materials.crimsonTrim),
    white: matWithClip(materials.whiteBelts),
    leather: matWithClip(materials.blackLeather),
    hair: matWithClip(materials.darkHair),
    skin: matWithClip(materials.skinTone),
    bronze: matWithClip(materials.artilleryBronze),
    steel: matWithClip(materials.bayonetSteel),
    wood: matWithClip(materials.oakWood)
  };
  const bannerMat = matWithClip(materials.stGeorgeBanner);
  const shadowMat = matWithClip(materials.contactShadow);

  const setup = (m) => {
    m.castShadow = castShadow;
    m.receiveShadow = true;
    return m;
  };

  const root = new THREE.Group();
  root.scale.setScalar(scale);

  attachContactShadow(root, geos, shadowMat, 1.35, 1.65, 0.06);

  const legsL = [];
  const legsR = [];
  const rightArms = [];
  const leftArms = [];

  const place = (x, z, role) => {
    const built = buildSculptedRussianFigure({ geos, mats, setup, role });
    built.fig.position.set(x, 0, z);
    root.add(built.fig);
    legsL.push(built.legL);
    legsR.push(built.legR);
    rightArms.push(built.rArm);
    leftArms.push(built.lArm);
  };

  // Головная командная пара (+Z): офицер с саблей и знамёнщик с Георгиевским знаменем
  place(-0.22, 0.60, 'officer');
  place(0.22, 0.60, 'standard');

  // Ротный барабанщик перед шеренгами
  place(0.0, 0.25, 'drummer');

  // 2 сомкнутые шеренги по 3 егеря в киверах со скатками и штыками!
  for (const rz of [-0.10, -0.48]) {
    for (const rx of [-0.31, 0.0, 0.31]) {
      place(rx, rz, 'infantry');
    }
  }

  // Развевающееся полковое знамя на верхушке древка знамёнщика (0.22 - 0.148 + 0.012 = 0.084, y = 1.66, z = 0.60 + 0.236 = 0.836)
  const flagGeoInst = geos.DynamicFlagTemplate.clone();
  disposableClones.push(flagGeoInst);
  const flagMesh = setup(new THREE.Mesh(flagGeoInst, bannerMat));
  flagMesh.position.set(0.084, 1.66, 0.836);
  const baseFlagZ = new Float32Array(flagGeoInst.attributes.position.count);
  for (let i = 0; i < baseFlagZ.length; i++) {
    baseFlagZ[i] = flagGeoInst.attributes.position.getZ(i);
  }
  root.add(flagMesh);

  root.userData.photorealCorpsRig = {
    kind: 'column',
    legsL,
    legsR,
    rightArms,
    leftArms,
    flagMesh,
    baseFlagZ,
    disposableClones
  };
  return root;
}

/**
 * 2. СКУЛЬПТУРНЫЙ ГОРНЫЙ 1/2-ПУДОВЫЙ БРОНЗОВЫЙ ЕДИНОРОГ НА ЛАФЕТЕ С РАСЧЁТОМ
 * Дуло направлено в +Z, 12-спицевые колёса стоят на y = 0.0.
 * При variant === 'imamat' лафет дубовый, а у орудия стоят 2 скульптурных мюрида-артиллериста!
 */
export function createPhotorealUnicornCannonInstance({
  variant = 'imperial',
  includeAmmoChest = true,
  includeCrew = true,
  scale = 1.0,
  castShadow = true,
  clippingPlanes = null
} = {}) {
  const { geos, materials } = getSharedSculptedArmyAssets();
  const { disposableClones, matWithClip } = makeClipHelper(clippingPlanes);

  const isImamat = variant === 'imamat';
  const carriageMat = matWithClip(isImamat ? materials.oakWood : materials.carriageImpGreen);
  const wheelWoodMat = matWithClip(isImamat ? materials.oakWood : materials.carriageImpGreen);
  const bronzeMat = matWithClip(materials.artilleryBronze);
  const ironMat = matWithClip(materials.forgedIron);
  const boreMat = matWithClip(materials.boreMatteBlack);
  const shadowMat = matWithClip(materials.contactShadow);

  const setup = (m) => {
    m.castShadow = castShadow;
    m.receiveShadow = true;
    return m;
  };

  const root = new THREE.Group();
  root.scale.setScalar(scale);

  attachContactShadow(root, geos, shadowMat, 1.65, 1.85, -0.22);

  // Откатная часть лафета с орудием и двумя 12-спицевыми колёсами (R = 0.36 на y = 0.36)
  const gunCarriageGroup = new THREE.Group();
  root.add(gunCarriageGroup);

  gunCarriageGroup.add(setup(new THREE.Mesh(geos.CannonCarriageWood, carriageMat)));
  gunCarriageGroup.add(setup(new THREE.Mesh(geos.CannonCarriageIron, ironMat)));

  const wheelL = new THREE.Group();
  wheelL.position.set(0.42, 0.36, 0.08);
  wheelL.add(setup(new THREE.Mesh(geos.CannonWheelWood, wheelWoodMat)));
  wheelL.add(setup(new THREE.Mesh(geos.CannonWheelIron, ironMat)));
  gunCarriageGroup.add(wheelL);

  const wheelR = new THREE.Group();
  wheelR.position.set(-0.42, 0.36, 0.08);
  wheelR.add(setup(new THREE.Mesh(geos.CannonWheelWood, wheelWoodMat)));
  wheelR.add(setup(new THREE.Mesh(geos.CannonWheelIron, ironMat)));
  gunCarriageGroup.add(wheelR);

  // Шарнир цапф бронзового ствола единорога (0, 0.46, 0.08)
  const barrelPivot = new THREE.Group();
  barrelPivot.position.set(0, 0.46, 0.08);
  barrelPivot.add(setup(new THREE.Mesh(geos.CannonBarrelBronze, bronzeMat)));
  barrelPivot.add(new THREE.Mesh(geos.CannonBore, boreMat));
  gunCarriageGroup.add(barrelPivot);

  if (includeAmmoChest) {
    root.add(setup(new THREE.Mesh(geos.AmmoChestWood, carriageMat)));
    root.add(setup(new THREE.Mesh(geos.AmmoChestIron, ironMat)));
  }

  // 2 скульптурных артиллериста расчёта (мюриды Талхига или имперские канониры!)
  const crewArms = [];
  if (includeCrew) {
    const crewMats = {
      green: matWithClip(materials.uniformGreen),
      grey: matWithClip(materials.greatcoatGrey),
      red: matWithClip(materials.crimsonTrim),
      white: matWithClip(materials.whiteBelts),
      leather: matWithClip(materials.blackLeather),
      hair: matWithClip(materials.darkHair),
      skin: matWithClip(materials.skinTone),
      bronze: bronzeMat,
      steel: matWithClip(materials.bayonetSteel),
      wood: matWithClip(materials.oakWood),
      cherk: matWithClip(materials.muridCherkesskaDark),
      cherkAlt: matWithClip(materials.muridCherkesskaOlive),
      papakha: matWithClip(materials.muridPapakha),
      silver: matWithClip(materials.kubachiSilver)
    };

    const g1 = isImamat
      ? buildSculptedMuridFigure({ geos, mats: crewMats, setup, role: 'gunner', altCoat: false })
      : buildSculptedRussianFigure({ geos, mats: crewMats, setup, role: 'gunner' });
    g1.fig.position.set(0.64, 0, -0.34);
    g1.fig.rotation.y = -0.32;
    g1.fig.scale.setScalar(0.86);
    root.add(g1.fig);
    crewArms.push(g1.rArm);

    const g2 = isImamat
      ? buildSculptedMuridFigure({ geos, mats: crewMats, setup, role: 'officer', altCoat: true })
      : buildSculptedRussianFigure({ geos, mats: crewMats, setup, role: 'officer' });
    g2.fig.position.set(-0.56, 0, -0.44);
    g2.fig.rotation.y = 0.28;
    g2.fig.scale.setScalar(0.86);
    root.add(g2.fig);
    crewArms.push(g2.rArm);
  }

  root.userData.photorealCorpsRig = {
    kind: 'cannon',
    gunCarriageGroup,
    wheelL,
    wheelR,
    barrelPivot,
    crewArms,
    wheelSpin: 0,
    disposableClones
  };
  return root;
}

/**
 * 3. СКУЛЬПТУРНЫЙ СУХАРНЫЙ ФУРГОН ВОРОНЦОВА / ПОРОХОВОЙ ОБОЗ С УПРЯЖНЫМ КОНЁМ В ДУГЕ
 * Ориентирован вперёд по +Z, 4 спицованных колеса и копыта коня стоят ровно на y = 0.0.
 */
export function createPhotorealSupplyWagonInstance({
  variant = 'imperial',
  includeDraftHorse = true,
  scale = 1.0,
  castShadow = true,
  clippingPlanes = null
} = {}) {
  const { geos, materials } = getSharedSculptedArmyAssets();
  const { disposableClones, matWithClip } = makeClipHelper(clippingPlanes);

  const isImamat = variant === 'imamat';
  const woodMat = matWithClip(materials.oakWood);
  const ironMat = matWithClip(materials.forgedIron);
  const canvasMat = matWithClip(isImamat ? materials.wagonCanvasImamat : materials.wagonCanvasImperial);
  const coatMat = matWithClip(isImamat ? materials.muridCherkesskaDark : materials.greatcoatGrey);
  const greenMat = matWithClip(materials.uniformGreen);
  const skinMat = matWithClip(materials.skinTone);
  const hairMat = matWithClip(materials.darkHair);
  const papakhaMat = matWithClip(materials.muridPapakha);
  const silverMat = matWithClip(materials.kubachiSilver);
  const bayMat = matWithClip(isImamat ? materials.draftDarkBayCoat : materials.draftBayCoat);
  const leatherMat = matWithClip(materials.blackLeather);
  const shadowMat = matWithClip(materials.contactShadow);

  const setup = (m) => {
    m.castShadow = castShadow;
    m.receiveShadow = true;
    return m;
  };

  const root = new THREE.Group();
  root.scale.setScalar(scale);

  attachContactShadow(root, geos, shadowMat, 1.15, includeDraftHorse ? 2.55 : 1.55, includeDraftHorse ? 0.25 : -0.18);

  // Кузов фургона, оковка, парусиновый свод на 5 обручах, бочки/ящики груза и ездовой на козлах
  root.add(setup(new THREE.Mesh(geos.WagonWood, woodMat)));
  root.add(setup(new THREE.Mesh(geos.WagonIron, ironMat)));
  root.add(setup(new THREE.Mesh(geos.WagonCanvasTilt, canvasMat)));
  root.add(setup(new THREE.Mesh(geos.WagonCargo, woodMat)));
  root.add(setup(new THREE.Mesh(geos.WagonCoachmanArms, coatMat)));

  // Скульптурный ездовой на козлах (русский обозник в шинели и фуражке ИЛИ горец в папахе и черкеске!)
  const driverGrp = new THREE.Group();
  driverGrp.position.set(0, 0.24, 0.34);
  if (isImamat) {
    driverGrp.add(setup(new THREE.Mesh(geos.MuridCherkesska, coatMat)));
    driverGrp.add(setup(new THREE.Mesh(geos.MuridHead, skinMat)));
    driverGrp.add(setup(new THREE.Mesh(geos.MuridBeard, hairMat)));
    driverGrp.add(setup(new THREE.Mesh(geos.MuridPapakha, papakhaMat)));
    driverGrp.add(setup(new THREE.Mesh(geos.MuridSilverGear, silverMat)));
  } else {
    driverGrp.add(setup(new THREE.Mesh(geos.RusTorso, coatMat)));
    driverGrp.add(setup(new THREE.Mesh(geos.RusHead, skinMat)));
    driverGrp.add(setup(new THREE.Mesh(geos.RusMustacheEyes, hairMat)));
    driverGrp.add(setup(new THREE.Mesh(geos.RusOfficerCap, greenMat)));
  }
  root.add(driverGrp);

  // 4 спицованных колеса фургона (передние R=0.23 на z=+0.26, задние R=0.30 на z=-0.58)
  const wheels = [];
  for (const sgn of [-1, 1]) {
    const wf = new THREE.Group();
    wf.position.set(sgn * 0.38, 0.23, 0.26);
    wf.add(setup(new THREE.Mesh(geos.WagonWheelFrontWood, woodMat)));
    wf.add(setup(new THREE.Mesh(geos.WagonWheelFrontIron, ironMat)));
    root.add(wf);
    wheels.push({ group: wf, speedMul: 1.30 });

    const wr = new THREE.Group();
    wr.position.set(sgn * 0.39, 0.30, -0.58);
    wr.add(setup(new THREE.Mesh(geos.WagonWheelRearWood, woodMat)));
    wr.add(setup(new THREE.Mesh(geos.WagonWheelRearIron, ironMat)));
    root.add(wr);
    wheels.push({ group: wr, speedMul: 1.0 });
  }

  let draftHorse = null;
  if (includeDraftHorse) {
    const horseGrp = new THREE.Group();
    root.add(horseGrp);
    horseGrp.add(setup(new THREE.Mesh(geos.DraftHorseBody, bayMat)));
    horseGrp.add(setup(new THREE.Mesh(geos.DraftHorseCollar, leatherMat)));

    const neckPivot = new THREE.Group();
    neckPivot.position.set(0, 0.74, 1.05);
    neckPivot.add(setup(new THREE.Mesh(geos.DraftHorseNeckHead, bayMat)));
    neckPivot.add(setup(new THREE.Mesh(geos.DraftHorseMane, hairMat)));
    horseGrp.add(neckPivot);

    const tailPivot = new THREE.Group();
    tailPivot.position.set(0, 0.74, 0.48);
    tailPivot.add(setup(new THREE.Mesh(geos.DraftHorseTail, hairMat)));
    horseGrp.add(tailPivot);

    const makeLeg = (geo, lx, lz) => {
      const lp = new THREE.Group();
      lp.position.set(lx, 0.58, lz);
      lp.add(setup(new THREE.Mesh(geo, bayMat)));
      horseGrp.add(lp);
      return lp;
    };
    const legFL = makeLeg(geos.DraftHorseForeLeg, 0.11, 1.03);
    const legFR = makeLeg(geos.DraftHorseForeLeg, -0.11, 1.03);
    const legBL = makeLeg(geos.DraftHorseHindLeg, 0.11, 0.60);
    const legBR = makeLeg(geos.DraftHorseHindLeg, -0.11, 0.60);

    draftHorse = { neckPivot, tailPivot, legFL, legFR, legBL, legBR };
  }

  root.userData.photorealCorpsRig = {
    kind: 'wagon',
    wheels,
    draftHorse,
    wheelSpin: 0,
    disposableClones
  };
  return root;
}

/**
 * 4. СКУЛЬПТУРНЫЙ ОТРЯД ПЕШИХ МЮРИДОВ ИМАМАТА (6 ГОРЦЕВ С ЗЕЛЁНЫМ ЗНАМЕНЕМ И КРЕМНЁВКАМИ)
 * Готов для горных гарнизонов, лесных засад и тактических теснин (лицом к +Z, y = 0.0).
 */
export function createPhotorealMuridInfantryInstance({
  scale = 1.0,
  castShadow = true,
  clippingPlanes = null
} = {}) {
  const { geos, materials } = getSharedSculptedArmyAssets();
  const { disposableClones, matWithClip } = makeClipHelper(clippingPlanes);

  const mats = {
    cherk: matWithClip(materials.muridCherkesskaDark),
    cherkAlt: matWithClip(materials.muridCherkesskaOlive),
    red: matWithClip(materials.crimsonTrim),
    skin: matWithClip(materials.skinTone),
    hair: matWithClip(materials.darkHair),
    papakha: matWithClip(materials.muridPapakha),
    silver: matWithClip(materials.kubachiSilver),
    leather: matWithClip(materials.blackLeather),
    bronze: matWithClip(materials.artilleryBronze),
    steel: matWithClip(materials.bayonetSteel),
    wood: matWithClip(materials.oakWood)
  };
  const bannerMat = matWithClip(materials.imamatBanner);
  const shadowMat = matWithClip(materials.contactShadow);

  const setup = (m) => {
    m.castShadow = castShadow;
    m.receiveShadow = true;
    return m;
  };

  const root = new THREE.Group();
  root.scale.setScalar(scale);

  attachContactShadow(root, geos, shadowMat, 1.25, 1.35, 0.04);

  const legsL = [];
  const legsR = [];
  const rightArms = [];
  const leftArms = [];

  const formation = [
    { x: -0.20, z: 0.44, role: 'officer', altCoat: false },
    { x: 0.22, z: 0.42, role: 'standard', altCoat: true },
    { x: -0.34, z: 0.02, role: 'rifle', altCoat: true },
    { x: 0.02, z: -0.04, role: 'rifle', altCoat: false },
    { x: 0.34, z: 0.00, role: 'rifle', altCoat: true },
    { x: -0.14, z: -0.40, role: 'rifle', altCoat: false }
  ];

  formation.forEach((f) => {
    const built = buildSculptedMuridFigure({
      geos,
      mats,
      setup,
      role: f.role,
      altCoat: f.altCoat
    });
    built.fig.position.set(f.x, 0, f.z);
    root.add(built.fig);
    legsL.push(built.legL);
    legsR.push(built.legR);
    rightArms.push(built.rArm);
    leftArms.push(built.lArm);
  });

  const flagGeoInst = geos.DynamicFlagTemplate.clone();
  disposableClones.push(flagGeoInst);
  const flagMesh = setup(new THREE.Mesh(flagGeoInst, bannerMat));
  flagMesh.position.set(0.084, 1.66, 0.656);
  const baseFlagZ = new Float32Array(flagGeoInst.attributes.position.count);
  for (let i = 0; i < baseFlagZ.length; i++) {
    baseFlagZ[i] = flagGeoInst.attributes.position.getZ(i);
  }
  root.add(flagMesh);

  root.userData.photorealCorpsRig = {
    kind: 'column',
    legsL,
    legsR,
    rightArms,
    leftArms,
    flagMesh,
    baseFlagZ,
    disposableClones
  };
  return root;
}

/**
 * Живая биомеханика походных колонн РИ и мюридов, отката/наводки орудий с расчётом и обозов.
 */
export function updatePhotorealCorpsAsset(
  rootObj,
  { elapsed = 0, dt = 0.016, phase = 0, moving = false, recoil = 0, elevRad = 0.08 } = {}
) {
  const rig = rootObj?.userData?.photorealCorpsRig;
  if (!rig) return;

  if (rig.kind === 'column') {
    const stepFreq = 8.6;
    for (let i = 0; i < rig.legsL.length; i++) {
      const rankLag = (i % 3) * 0.22;
      const swing = moving ? Math.sin(elapsed * stepFreq + phase + rankLag) * 0.42 : 0;
      rig.legsL[i].rotation.x = swing;
      rig.legsR[i].rotation.x = -swing;

      if (rig.leftArms?.[i]) {
        rig.leftArms[i].rotation.x = moving ? -swing * 0.55 : Math.sin(elapsed * 1.4 + phase + i) * 0.03;
      }

      if (rig.rightArms[i]) {
        if (i === 0) {
          rig.rightArms[i].rotation.x = moving
            ? -0.22 + Math.sin(elapsed * stepFreq * 0.5 + phase) * 0.14
            : -0.14 + Math.sin(elapsed * 2.1 + phase) * 0.06;
        } else if (i === 1) {
          rig.rightArms[i].rotation.x = 0;
        } else {
          rig.rightArms[i].rotation.x = moving
            ? swing * 0.12
            : Math.sin(elapsed * 1.8 + phase + i * 0.5) * 0.025;
        }
      }
    }

    // Вершинная волна знамени на горном ветру
    const fp = rig.flagMesh.geometry.attributes.position;
    const windSpd = moving ? 7.6 : 4.5;
    const windAmp = moving ? 0.065 : 0.044;
    for (let k = 0; k < fp.count; k++) {
      const bz = rig.baseFlagZ[k];
      const pin = Math.min(1, Math.abs(bz) / 0.62);
      fp.setX(k, Math.sin(elapsed * windSpd + bz * 9.0 + phase) * windAmp * pin);
    }
    fp.needsUpdate = true;
  } else if (rig.kind === 'cannon') {
    if (moving) {
      rig.wheelSpin += dt * 4.4;
    }
    const wheelRot = rig.wheelSpin - recoil * 1.15;
    rig.wheelL.rotation.x = wheelRot;
    rig.wheelR.rotation.x = wheelRot;

    rig.barrelPivot.rotation.x = -elevRad - recoil * 0.14;
    rig.barrelPivot.position.z = 0.08 - recoil * 0.09;
    rig.gunCarriageGroup.position.z = -recoil * 0.18;

    if (rig.crewArms) {
      for (let c = 0; c < rig.crewArms.length; c++) {
        rig.crewArms[c].rotation.x =
          -0.08 + Math.sin(elapsed * 2.2 + phase + c * 1.7) * 0.08 - recoil * 0.35;
      }
    }
  } else if (rig.kind === 'wagon') {
    if (moving) {
      rig.wheelSpin += dt * 5.0;
    }
    for (let w = 0; w < rig.wheels.length; w++) {
      rig.wheels[w].group.rotation.x = rig.wheelSpin * rig.wheels[w].speedMul;
    }

    if (rig.draftHorse) {
      const dh = rig.draftHorse;
      if (moving) {
        const wPh = elapsed * 8.4 + phase;
        dh.legFL.rotation.x = Math.sin(wPh) * 0.40;
        dh.legBR.rotation.x = Math.sin(wPh + 0.38) * 0.36;
        dh.legFR.rotation.x = -Math.sin(wPh) * 0.40;
        dh.legBL.rotation.x = -Math.sin(wPh + 0.38) * 0.36;
        dh.neckPivot.rotation.x = 0.06 + Math.sin(wPh * 2.0) * 0.06;
        dh.tailPivot.rotation.x = 0.16 + Math.sin(wPh * 1.5) * 0.08;
      } else {
        dh.legFL.rotation.x = 0;
        dh.legFR.rotation.x = 0;
        dh.legBL.rotation.x = 0;
        dh.legBR.rotation.x = 0;
        dh.neckPivot.rotation.x = Math.sin(elapsed * 1.6 + phase) * 0.045;
        dh.neckPivot.rotation.y = Math.sin(elapsed * 0.75 + phase) * 0.10;
        dh.tailPivot.rotation.z = Math.sin(elapsed * 1.8 + phase) * 0.10;
      }
    }
  }
}

export function disposePhotorealCorpsInstance(rootObj) {
  const rig = rootObj?.userData?.photorealCorpsRig;
  if (rig?.disposableClones) {
    rig.disposableClones.forEach((item) => item.dispose());
  }
}
