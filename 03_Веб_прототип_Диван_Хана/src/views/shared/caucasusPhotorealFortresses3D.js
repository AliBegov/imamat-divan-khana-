// ============================================================================
// СКУЛЬПТУРНАЯ 3D-АРХИТЕКТУРА КАВКАЗА (BLENDER 4.2.9 LTS + 3D RAYCAST AO PACK)
// 1. 5-бастионная полая звёздчатая крепость Кавказской линии (1845):
//    - открытый мощёный плац, 2-этажный кирпичный штаб с зелёной фальцевой кровлей
//      и светящимися окнами, пороховой погреб, круглая башня-блокгауз, арочные ворота,
//      5 амбразурных орудий с турами и волновой имперский флаг;
// 2. Вайнахская/аварская боевая башня: трапециевидный ствол, 4 навесных машикуля
//    «чIерх» на 3 ступенчатых кронштейнах, 5-ступенчатая сланцевая пирамида «цIурку»
//    с навершием «цIогал», резной балкон-айван на балясинах и каменный двор;
// 3. Столица Имамата Дарго-Ведено: заострённый бревенчатый острог, 4 угловых бастиона,
//    двухэтажная Диван-хана с резной галереей, купольная мечеть, стройный минарет с
//    шерефе и золотым полумесяцем, волновое изумрудное знамя Имамата;
// 4. Каменный сводчатый арочный мост (15 клинчатых камней + замковый камень + плавное
//    горбатое полотно) и обрушенные руины подрыва;
// 5. Террасная горская сакля с деревянным айваном, стропилами и дымоходом (InstancedMesh);
// 6. Буковая лесная засека Ичкерии (поваленные стволы с заострёнными сучьями и валуны);
// 7. Живая 4-сезонная адаптация материалов (Весна / Лето / Осень / Зима + зимние очаги!).
// ============================================================================
import * as THREE from 'three';
import { FORTRESS_PACK_MESHES, FORTRESS_PACK_B64 } from '../../data/fortressesSculptedAssetsData.js';

let cachedFortressAssets = null;

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
// ПРОЦЕДУРНЫЕ PBR-ТЕКСТУРЫ КАМНЯ, КИРПИЧА, ДЁРНА, ЖЕСТИ, ДЕРЕВА И ЗНАМЁН
// ============================================================================
function createFortressPbrMaps() {
  let seed = 41;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  const makePair = (size, drawFn, repeatX = 2, repeatY = 2) => {
    const dc = document.createElement('canvas');
    dc.width = size;
    dc.height = size;
    const dctx = dc.getContext('2d');

    const nc = document.createElement('canvas');
    nc.width = size;
    nc.height = size;
    const nctx = nc.getContext('2d');
    nctx.fillStyle = 'rgb(128,128,255)';
    nctx.fillRect(0, 0, size, size);

    drawFn(dctx, nctx, size);

    const diff = new THREE.CanvasTexture(dc);
    diff.colorSpace = THREE.SRGBColorSpace;
    diff.wrapS = THREE.RepeatWrapping;
    diff.wrapT = THREE.RepeatWrapping;
    diff.repeat.set(repeatX, repeatY);
    diff.anisotropy = 4;

    const norm = new THREE.CanvasTexture(nc);
    norm.wrapS = THREE.RepeatWrapping;
    norm.wrapT = THREE.RepeatWrapping;
    norm.repeat.set(repeatX, repeatY);
    norm.anisotropy = 4;
    return { diff, norm };
  };

  // 1. Тёсаная кладка горного сланца и известняка с мхом в швах
  const stone = makePair(256, (ctx, nctx, S) => {
    ctx.fillStyle = '#5e594f';
    ctx.fillRect(0, 0, S, S);
    for (let row = 0; row < 10; row++) {
      const y = Math.round((row * S) / 10);
      const h = Math.round(S / 10) - 2;
      let x = row % 2 === 0 ? 0 : -18;
      while (x < S) {
        const w = 28 + Math.floor(rand() * 28);
        const t = 136 + Math.floor(rand() * 44);
        const warm = Math.floor(rand() * 14);
        ctx.fillStyle = `rgb(${t + warm},${t + Math.floor(warm * 0.65)},${t - 8})`;
        ctx.fillRect(x + 1, y + 1, w - 2, h - 1);
        if (rand() > 0.78) {
          ctx.fillStyle = 'rgba(78,104,56,0.34)';
          ctx.fillRect(x + 2, y + 1, w * 0.5, 3);
        }
        nctx.fillStyle = 'rgb(128,174,242)';
        nctx.fillRect(x + 1, y + 1, w - 2, 2);
        nctx.fillStyle = 'rgb(128,82,242)';
        nctx.fillRect(x + 1, y + h - 2, w - 2, 2);
        nctx.fillStyle = 'rgb(86,128,242)';
        nctx.fillRect(x + 1, y + 1, 2, h - 1);
        x += w;
      }
    }
  });

  // 2. Николаевский красный крепостной кирпич с белым раствором
  const brick = makePair(256, (ctx, nctx, S) => {
    ctx.fillStyle = '#cbc3b4';
    ctx.fillRect(0, 0, S, S);
    for (let row = 0; row < 16; row++) {
      const y = row * 16;
      const off = (row % 2) * 18;
      for (let col = -1; col < 8; col++) {
        const x = col * 36 + off;
        const r = 148 + Math.floor(rand() * 40);
        const g = 66 + Math.floor(rand() * 22);
        const b = 48 + Math.floor(rand() * 16);
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(x + 1, y + 1, 34, 13);
        nctx.fillStyle = 'rgb(128,166,244)';
        nctx.fillRect(x + 1, y + 1, 34, 2);
        nctx.fillStyle = 'rgb(128,90,244)';
        nctx.fillRect(x + 1, y + 12, 34, 2);
      }
    }
  });

  // 3. Земляной дёрн валов Вобана (перекрашивается динамически по 4 сезонам!)
  const turf = makePair(256, (ctx, nctx, S) => {
    ctx.fillStyle = '#9aa878';
    ctx.fillRect(0, 0, S, S);
    for (let i = 0; i < 900; i++) {
      const x = Math.floor(rand() * S);
      const y = Math.floor(rand() * S);
      ctx.fillStyle = i % 2 === 0 ? 'rgba(60,78,42,0.28)' : 'rgba(205,212,175,0.24)';
      ctx.fillRect(x, y, 4, 4);
      nctx.fillStyle = i % 2 === 0 ? 'rgb(144,136,246)' : 'rgb(112,120,246)';
      nctx.fillRect(x, y, 4, 4);
    }
  });

  // 4. Резной кавказский орех/дуб (острог, балконы, ворота, засеки)
  const wood = makePair(256, (ctx, nctx, S) => {
    ctx.fillStyle = '#5c3d25';
    ctx.fillRect(0, 0, S, S);
    for (let p = 0; p < 8; p++) {
      const x = p * 32;
      const t = 78 + Math.floor(rand() * 32);
      ctx.fillStyle = `rgb(${t + 24},${t + 6},${t - 12})`;
      ctx.fillRect(x + 1, 0, 30, S);
      ctx.strokeStyle = 'rgba(24,14,6,0.55)';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, 0, 32, S);
      nctx.fillStyle = 'rgb(154,128,246)';
      nctx.fillRect(x + 1, 0, 3, S);
      nctx.fillStyle = 'rgb(102,128,246)';
      nctx.fillRect(x + 28, 0, 3, S);
    }
  });

  // 5. Имперская фальцевая жестяная кровля (с вертикальными фальцами!)
  const tin = makePair(256, (ctx, nctx, S) => {
    ctx.fillStyle = '#9ec2b0';
    ctx.fillRect(0, 0, S, S);
    for (let rx = 16; rx < S; rx += 24) {
      ctx.fillStyle = 'rgba(18,38,28,0.42)';
      ctx.fillRect(rx, 0, 3, S);
      nctx.fillStyle = 'rgb(168,128,246)';
      nctx.fillRect(rx - 2, 0, 4, S);
    }
  });

  // 6. Сланцевая черепица и мостовая
  const slate = makePair(256, (ctx, nctx, S) => {
    ctx.fillStyle = '#6c655b';
    ctx.fillRect(0, 0, S, S);
    for (let row = 0; row < 10; row++) {
      const y = Math.round((row * S) / 10);
      for (let col = 0; col < 6; col++) {
        const x = col * 44 + (row % 2) * 20;
        const t = 104 + Math.floor(rand() * 34);
        ctx.fillStyle = `rgb(${t + 6},${t + 2},${t - 4})`;
        ctx.fillRect(x, y, 41, 22);
        nctx.fillStyle = 'rgb(128,88,246)';
        nctx.fillRect(x, y + 19, 41, 3);
      }
    }
  });

  // 7. Штукатурка Диван-ханы
  const plaster = makePair(256, (ctx, nctx, S) => {
    ctx.fillStyle = '#e2d8c2';
    ctx.fillRect(0, 0, S, S);
    for (let i = 0; i < 650; i++) {
      const x = Math.floor(rand() * S);
      const y = Math.floor(rand() * S);
      ctx.fillStyle = i % 2 === 0 ? 'rgba(255,252,240,0.22)' : 'rgba(116,100,76,0.16)';
      ctx.fillRect(x, y, 5, 4);
      nctx.fillStyle = i % 2 === 0 ? 'rgb(134,132,250)' : 'rgb(122,124,250)';
      nctx.fillRect(x, y, 5, 4);
    }
  });

  // 8. Флаги (Имперский триколор РИ и Изумрудное знамя Имамата)
  const buildImpFlag = () => {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 160;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, 256, 54);
    ctx.fillStyle = '#1d4ed8';
    ctx.fillRect(0, 54, 256, 53);
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(0, 107, 256, 53);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(8, 8, 74, 66);
    ctx.fillStyle = '#18181b';
    ctx.beginPath();
    ctx.arc(45, 41, 20, 0, Math.PI * 2);
    ctx.fill();
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  };

  const buildImamatFlag = () => {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 160;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#065f46';
    ctx.fillRect(0, 0, 256, 160);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 10;
    ctx.strokeRect(8, 8, 240, 144);
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(120, 80, 36, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#065f46';
    ctx.beginPath();
    ctx.arc(134, 80, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(154, 80, 9, 0, Math.PI * 2);
    ctx.fill();
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  };

  return {
    stone,
    brick,
    turf,
    wood,
    tin,
    slate,
    plaster,
    impFlagTex: buildImpFlag(),
    imamatFlagTex: buildImamatFlag()
  };
}

// ============================================================================
// СИНХРОННАЯ РАСПАКОВКА КВАНТОВАННОЙ АРХИТЕКТУРЫ BLENDER (0ms, ZERO FETCH)
// ============================================================================
function decodeSculptedFortressPack() {
  const bytes = decodeBase64ToBytes(FORTRESS_PACK_B64);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const geos = {};

  for (const meta of FORTRESS_PACK_MESHES) {
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

    const col = new Float32Array(V * 3);
    for (let i = 0; i < V; i++) {
      const ao = 0.28 + (bytes[off++] / 255) * 0.72;
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

  const impFlagTemplate = new THREE.PlaneGeometry(0.50, 0.31, 8, 3);
  impFlagTemplate.translate(-0.25, 0, 0);
  impFlagTemplate.rotateY(-Math.PI * 0.5);

  const imamatFlagTemplate = new THREE.PlaneGeometry(0.54, 0.35, 8, 3);
  imamatFlagTemplate.translate(-0.27, 0, 0);
  imamatFlagTemplate.rotateY(-Math.PI * 0.5);

  geos.impFlagTemplate = impFlagTemplate;
  geos.imamatFlagTemplate = imamatFlagTemplate;
  return geos;
}

export function getSharedPhotorealFortressAssets() {
  if (cachedFortressAssets) return cachedFortressAssets;

  const maps = createFortressPbrMaps();
  const geos = decodeSculptedFortressPack();

  const std = (pair, opts = {}) =>
    new THREE.MeshStandardMaterial({
      map: pair.diff,
      normalMap: pair.norm,
      vertexColors: true,
      ...opts
    });

  const materials = {
    masonry: std(maps.stone, {
      color: '#dedad0',
      normalScale: new THREE.Vector2(0.75, 0.75),
      roughness: 0.88,
      metalness: 0.02
    }),
    brick: std(maps.brick, {
      color: '#e8d8ce',
      normalScale: new THREE.Vector2(0.70, 0.70),
      roughness: 0.86,
      metalness: 0.02
    }),
    turf: std(maps.turf, {
      color: '#5f7842',
      normalScale: new THREE.Vector2(0.52, 0.52),
      roughness: 0.92,
      metalness: 0.01
    }),
    slateRoof: std(maps.slate, {
      color: '#8f887d',
      normalScale: new THREE.Vector2(0.66, 0.66),
      roughness: 0.86,
      metalness: 0.03
    }),
    roadCobble: std(maps.slate, {
      color: '#a39b8e',
      normalScale: new THREE.Vector2(0.62, 0.62),
      roughness: 0.88,
      metalness: 0.02
    }),
    plaster: std(maps.plaster, {
      color: '#f0e8d6',
      normalScale: new THREE.Vector2(0.32, 0.32),
      roughness: 0.84,
      metalness: 0.01
    }),
    timber: std(maps.wood, {
      color: '#c9a684',
      normalScale: new THREE.Vector2(0.64, 0.64),
      roughness: 0.82,
      metalness: 0.02
    }),
    saklyaRoofTimber: std(maps.wood, {
      color: '#bfa182',
      normalScale: new THREE.Vector2(0.58, 0.58),
      roughness: 0.84,
      metalness: 0.02
    }),
    tinRoof: std(maps.tin, {
      color: '#2e6f52',
      normalScale: new THREE.Vector2(0.45, 0.45),
      roughness: 0.44,
      metalness: 0.38
    }),
    castIron: new THREE.MeshStandardMaterial({
      color: '#262a31',
      vertexColors: true,
      roughness: 0.38,
      metalness: 0.86
    }),
    darkLoophole: new THREE.MeshBasicMaterial({ color: '#0b0908' }),
    whiteFinial: new THREE.MeshStandardMaterial({
      color: '#ede7d8',
      vertexColors: true,
      roughness: 0.68,
      metalness: 0.02
    }),
    goldCrescent: new THREE.MeshStandardMaterial({
      color: '#fbbf24',
      emissive: '#92400e',
      emissiveIntensity: 0.28,
      roughness: 0.22,
      metalness: 0.94
    }),
    warmWindow: new THREE.MeshStandardMaterial({
      color: '#fde68a',
      emissive: '#f59e0b',
      emissiveIntensity: 0.42,
      roughness: 0.32
    }),
    impFlagCloth: new THREE.MeshStandardMaterial({
      map: maps.impFlagTex,
      roughness: 0.64,
      side: THREE.DoubleSide
    }),
    imamatFlagCloth: new THREE.MeshStandardMaterial({
      map: maps.imamatFlagTex,
      roughness: 0.66,
      side: THREE.DoubleSide
    })
  };

  cachedFortressAssets = { maps, geos, materials };
  return cachedFortressAssets;
}

function makeClip(clippingPlanes) {
  const disposableClones = [];
  const mat = (baseMat) => {
    if (!clippingPlanes) return baseMat;
    const cl = baseMat.clone();
    cl.clippingPlanes = clippingPlanes;
    disposableClones.push(cl);
    return cl;
  };
  return { disposableClones, mat };
}

/**
 * 1. ПОЛАЯ 5-БАСТИОННАЯ ЗВЁЗДЧАТАЯ КРЕПОСТЬ КАВКАЗСКОЙ ЛИНИИ (Грозная, Внезапная, Темир-Хан-Шура)
 */
export function createPhotorealImperialFortressInstance({
  scale = 1.0,
  castShadow = true,
  clippingPlanes = null
} = {}) {
  const { geos, materials } = getSharedPhotorealFortressAssets();
  const { disposableClones, mat } = makeClip(clippingPlanes);

  const setup = (m) => {
    m.castShadow = castShadow;
    m.receiveShadow = true;
    return m;
  };

  const root = new THREE.Group();
  root.scale.setScalar(scale);

  root.add(setup(new THREE.Mesh(geos.ImpFortBrick, mat(materials.brick))));
  root.add(setup(new THREE.Mesh(geos.ImpFortStone, mat(materials.masonry))));
  root.add(setup(new THREE.Mesh(geos.ImpFortTurf, mat(materials.turf))));
  root.add(setup(new THREE.Mesh(geos.ImpFortRoof, mat(materials.tinRoof))));
  root.add(setup(new THREE.Mesh(geos.ImpFortWood, mat(materials.timber))));
  root.add(setup(new THREE.Mesh(geos.ImpFortIron, mat(materials.castIron))));
  root.add(setup(new THREE.Mesh(geos.ImpFortWin, mat(materials.warmWindow))));

  const flagGeo = geos.impFlagTemplate.clone();
  disposableClones.push(flagGeo);
  const flagMesh = setup(new THREE.Mesh(flagGeo, mat(materials.impFlagCloth)));
  flagMesh.position.set(0.34, 2.31, -0.26);
  const baseFlagZ = new Float32Array(flagGeo.attributes.position.count);
  for (let i = 0; i < baseFlagZ.length; i++) {
    baseFlagZ[i] = flagGeo.attributes.position.getZ(i);
  }
  root.add(flagMesh);

  root.userData.photorealFortressRig = {
    flagMesh,
    baseFlagZ,
    span: 0.50,
    disposableClones
  };
  return root;
}

/**
 * 2. БОЕВАЯ КАВКАЗСКАЯ (ВАЙНАХСКАЯ / АВАРСКАЯ) БАШНЯ С 4 МАШИКУЛЯМИ И СТУПЕНЧАТОЙ КРЫШЕЙ
 */
export function createPhotorealVainakhTowerInstance({
  scale = 1.0,
  castShadow = true,
  clippingPlanes = null
} = {}) {
  const { geos, materials } = getSharedPhotorealFortressAssets();
  const { disposableClones, mat } = makeClip(clippingPlanes);

  const setup = (m) => {
    m.castShadow = castShadow;
    m.receiveShadow = true;
    return m;
  };

  const root = new THREE.Group();
  root.scale.setScalar(scale);

  root.add(setup(new THREE.Mesh(geos.VainakhStone, mat(materials.masonry))));
  root.add(setup(new THREE.Mesh(geos.VainakhSlate, mat(materials.slateRoof))));
  root.add(setup(new THREE.Mesh(geos.VainakhWood, mat(materials.timber))));
  root.add(new THREE.Mesh(geos.VainakhDark, mat(materials.darkLoophole)));
  root.add(setup(new THREE.Mesh(geos.VainakhFinial, mat(materials.whiteFinial))));

  root.userData.photorealFortressRig = { disposableClones };
  return root;
}

/**
 * 3. СТОЛИЦА ИМАМАТА ДАРГО-ВЕДЕНО (ДИВАН-ХАНА, МЕЧЕТЬ, МИНАРЕТ, ЗАОСТРЁННЫЙ ОСТРОГ)
 */
export function createPhotorealImamatCapitalInstance({
  scale = 1.0,
  castShadow = true,
  clippingPlanes = null
} = {}) {
  const { geos, materials } = getSharedPhotorealFortressAssets();
  const { disposableClones, mat } = makeClip(clippingPlanes);

  const setup = (m) => {
    m.castShadow = castShadow;
    m.receiveShadow = true;
    return m;
  };

  const root = new THREE.Group();
  root.scale.setScalar(scale);

  root.add(setup(new THREE.Mesh(geos.CapStone, mat(materials.masonry))));
  root.add(setup(new THREE.Mesh(geos.CapTurf, mat(materials.turf))));
  root.add(setup(new THREE.Mesh(geos.CapPlaster, mat(materials.plaster))));
  root.add(setup(new THREE.Mesh(geos.CapWood, mat(materials.timber))));
  root.add(setup(new THREE.Mesh(geos.CapRoof, mat(materials.slateRoof))));
  root.add(setup(new THREE.Mesh(geos.CapGold, mat(materials.goldCrescent))));
  root.add(setup(new THREE.Mesh(geos.CapWin, mat(materials.warmWindow))));

  const flagGeo = geos.imamatFlagTemplate.clone();
  disposableClones.push(flagGeo);
  const flagMesh = setup(new THREE.Mesh(flagGeo, mat(materials.imamatFlagCloth)));
  flagMesh.position.set(-0.72, 2.02, 0.42);
  const baseFlagZ = new Float32Array(flagGeo.attributes.position.count);
  for (let i = 0; i < baseFlagZ.length; i++) {
    baseFlagZ[i] = flagGeo.attributes.position.getZ(i);
  }
  root.add(flagMesh);

  root.userData.photorealFortressRig = {
    flagMesh,
    baseFlagZ,
    span: 0.54,
    disposableClones
  };
  return root;
}

/**
 * 4. КАМЕННЫЙ СВОДЧАТЫЙ МОСТ ЧЕРЕЗ ГОРНУЮ РЕКУ (ЦЕЛЫЙ ИЛИ ОБРУШЕННЫЙ)
 */
export function createPhotorealStoneBridgeInstance({
  dismantled = false,
  scale = 1.0,
  castShadow = true,
  clippingPlanes = null
} = {}) {
  const { geos, materials } = getSharedPhotorealFortressAssets();
  const { disposableClones, mat } = makeClip(clippingPlanes);

  const setup = (m) => {
    m.castShadow = castShadow;
    m.receiveShadow = true;
    return m;
  };

  const root = new THREE.Group();
  root.scale.setScalar(scale);

  if (dismantled) {
    const scorched = mat(materials.masonry).clone();
    scorched.color.set('#443c36');
    scorched.emissive = new THREE.Color('#7f1d1d');
    scorched.emissiveIntensity = 0.24;
    disposableClones.push(scorched);
    root.add(setup(new THREE.Mesh(geos.BridgeDismantled, scorched)));
  } else {
    root.add(setup(new THREE.Mesh(geos.BridgeIntactStone, mat(materials.masonry))));
    root.add(setup(new THREE.Mesh(geos.BridgeIntactRoad, mat(materials.roadCobble))));
  }

  root.userData.photorealFortressRig = { disposableClones };
  return root;
}

/**
 * 5. ГЕОМЕТРИИ И МАТЕРИАЛЫ ТЕРРАСНЫХ КАМЕННЫХ САКЛЕЙ С РЕЗНЫМ АЙВАНОМ (ДЛЯ INSTANCEDMESH)
 */
export function getDetailedSaklyaAssets() {
  const { geos, materials } = getSharedPhotorealFortressAssets();
  return {
    stoneGeo: geos.SaklyaStone,
    roofTimberGeo: geos.SaklyaRoofTimber,
    winGeo: geos.SaklyaWin,
    stoneMat: materials.masonry,
    roofTimberMat: materials.saklyaRoofTimber
  };
}

/**
 * 6. СКУЛЬПТУРНАЯ БУКОВАЯ ЛЕСНАЯ ЗАСЕКА ИЧКЕРИИ (ПОВАЛЕННЫЕ СТВОЛЫ, ЗАОСТРЁННЫЕ СУЧЬЯ, ВАЛУНЫ)
 */
export function createPhotorealBeechAbatisInstance({
  scale = 1.0,
  castShadow = true,
  clippingPlanes = null
} = {}) {
  const { geos, materials } = getSharedPhotorealFortressAssets();
  const { disposableClones, mat } = makeClip(clippingPlanes);

  const setup = (m) => {
    m.castShadow = castShadow;
    m.receiveShadow = true;
    return m;
  };

  const root = new THREE.Group();
  root.scale.setScalar(scale);
  root.add(setup(new THREE.Mesh(geos.AbatisLogs, mat(materials.timber))));
  root.add(setup(new THREE.Mesh(geos.AbatisStones, mat(materials.masonry))));

  root.userData.photorealFortressRig = { disposableClones };
  return root;
}

/**
 * Обновляет развевание флагов крепостей/столицы, ночное/зимнее свечение очагов в окнах
 * и живую 4-сезонную палитру валов и кровель (Весна / Лето / Осень / Зима).
 */
export function updatePhotorealFortressFlags(
  parentGroup,
  elapsed,
  timeOfDay = 'day',
  seasonPhase = 'summer'
) {
  const assets = cachedFortressAssets;
  if (assets?.materials) {
    const { warmWindow, turf, tinRoof, slateRoof, saklyaRoofTimber } = assets.materials;

    // 4-сезонное состояние валов Вобана и кровель горских башен/саклей
    if (seasonPhase === 'winter') {
      turf.color.set('#cbd8e4');
      tinRoof.color.set('#9ab8ba');
      slateRoof.color.set('#c4cfd9');
      saklyaRoofTimber.color.set('#c8d2dc');
    } else if (seasonPhase === 'autumn') {
      turf.color.set('#8f6f3b');
      tinRoof.color.set('#2c664a');
      slateRoof.color.set('#8b7d6b');
      saklyaRoofTimber.color.set('#b88f64');
    } else if (seasonPhase === 'spring') {
      turf.color.set('#5e9640');
      tinRoof.color.set('#2d7656');
      slateRoof.color.set('#969288');
      saklyaRoofTimber.color.set('#c4a582');
    } else {
      turf.color.set('#5f7842');
      tinRoof.color.set('#2e6f52');
      slateRoof.color.set('#8f887d');
      saklyaRoofTimber.color.set('#bfa182');
    }

    if (warmWindow) {
      if (timeOfDay === 'night') {
        warmWindow.color.set('#fef08a');
        warmWindow.emissiveIntensity = seasonPhase === 'winter' ? 2.5 : 2.2;
      } else if (timeOfDay === 'sunset') {
        warmWindow.color.set('#fde68a');
        warmWindow.emissiveIntensity = 1.35;
      } else if (seasonPhase === 'winter') {
        // Зимой днём в саклях и Диван-хане мягко светятся тёплые очаги!
        warmWindow.color.set('#fcd34d');
        warmWindow.emissiveIntensity = 0.72;
      } else {
        warmWindow.color.set('#362c22');
        warmWindow.emissiveIntensity = 0.0;
      }
    }
  }

  if (!parentGroup) return;
  let idx = 0;
  parentGroup.children.forEach((child) => {
    const rig = child.userData?.photorealFortressRig;
    if (rig?.flagMesh && rig.baseFlagZ) {
      const fp = rig.flagMesh.geometry.attributes.position;
      const span = rig.span || 0.5;
      for (let k = 0; k < fp.count; k++) {
        const bz = rig.baseFlagZ[k];
        const pin = Math.min(1, Math.abs(bz) / span);
        fp.setX(k, Math.sin(elapsed * 4.8 + bz * 10.0 + idx * 1.3) * 0.045 * pin);
      }
      fp.needsUpdate = true;
      idx++;
    }
  });
}

export function disposePhotorealFortressInstance(rootObj) {
  const rig = rootObj?.userData?.photorealFortressRig;
  if (rig?.disposableClones) {
    rig.disposableClones.forEach((item) => item.dispose());
  }
}
