// ============================================================================
// ФОТОРЕАЛИСТИЧНАЯ ПРИРОДА И РЕЛЬЕФ КАВКАЗА (3D PBR + GLSL):
// - Сигнальные сторожевые маяки-вежи (сухая кладка, каменные ступени, сруб-колодец
//   из обугленных брёвен, поленница, веха, GLSL-пламя, тлеющие угли, искры, огонь)
// - Процедурные PBR-текстуры коры (серебристый восточный бук Fagus orientalis
//   и красно-бурая горная сосна Pinus kochiana) с картами нормалей и шероховатости
// - Скульптурные слоистые известняковые утёсы (с глубоким цоколем — без парения!)
// - Мокрые речные валуны порогов и GLSL V-образные пенные буруны за камнями
// ============================================================================
import * as THREE from 'three';

function hash2D(x, y) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return s - Math.floor(s);
}

function valueNoise2D(x, y) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const a = hash2D(ix, iy);
  const b = hash2D(ix + 1, iy);
  const c = hash2D(ix, iy + 1);
  const d = hash2D(ix + 1, iy + 1);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}

function fbm2D(x, y, octaves = 4) {
  let v = 0;
  let amp = 0.5;
  let freq = 1;
  for (let i = 0; i < octaves; i++) {
    v += amp * valueNoise2D(x * freq, y * freq);
    freq *= 2.04;
    amp *= 0.5;
  }
  return v;
}

function buildNormalTextureFromHeight(heightBuf, size, strength = 2.4) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(size, size);
  const out = img.data;
  for (let y = 0; y < size; y++) {
    const ym = (y - 1 + size) % size;
    const yp = (y + 1) % size;
    for (let x = 0; x < size; x++) {
      const xm = (x - 1 + size) % size;
      const xp = (x + 1) % size;
      const dx = (heightBuf[y * size + xp] - heightBuf[y * size + xm]) * strength;
      const dy = (heightBuf[yp * size + x] - heightBuf[ym * size + x]) * strength;
      let nx = -dx;
      let ny = -dy;
      let nz = 1.0;
      const inv = 1.0 / Math.hypot(nx, ny, nz);
      nx *= inv;
      ny *= inv;
      nz *= inv;
      const idx = (y * size + x) * 4;
      out[idx] = Math.max(0, Math.min(255, Math.round((nx * 0.5 + 0.5) * 255)));
      out[idx + 1] = Math.max(0, Math.min(255, Math.round((ny * 0.5 + 0.5) * 255)));
      out[idx + 2] = Math.max(0, Math.min(255, Math.round((nz * 0.5 + 0.5) * 255)));
      out[idx + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.needsUpdate = true;
  return tex;
}

function remapBoxUVs(geo, u0, v0, u1, v1) {
  const uv = geo.attributes.uv;
  if (!uv) return geo;
  for (let i = 0; i < uv.count; i++) {
    const u = uv.getX(i);
    const v = uv.getY(i);
    uv.setXY(i, u0 + u * (u1 - u0), v0 + v * (v1 - v0));
  }
  uv.needsUpdate = true;
  return geo;
}

function mergeGeosWithColors(geometries) {
  const nonIndexed = geometries.map((g) => {
    const src = g.index ? g.toNonIndexed() : g.clone();
    if (!src.attributes.normal) src.computeVertexNormals();
    if (!src.attributes.uv) {
      src.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(src.attributes.position.count * 2), 2));
    }
    if (!src.attributes.color) {
      const cols = new Float32Array(src.attributes.position.count * 3);
      cols.fill(1.0);
      src.setAttribute('color', new THREE.BufferAttribute(cols, 3));
    }
    return src;
  });
  let total = 0;
  nonIndexed.forEach((g) => {
    total += g.attributes.position.count;
  });
  const pos = new Float32Array(total * 3);
  const nor = new Float32Array(total * 3);
  const uv = new Float32Array(total * 2);
  const col = new Float32Array(total * 3);
  let off = 0;
  nonIndexed.forEach((g) => {
    const c = g.attributes.position.count;
    pos.set(g.attributes.position.array, off * 3);
    nor.set(g.attributes.normal.array, off * 3);
    uv.set(g.attributes.uv.array, off * 2);
    col.set(g.attributes.color.array, off * 3);
    off += c;
    g.dispose();
  });
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  out.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  out.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return out;
}

// ============================================================================
// 1. ПРОЦЕДУРНЫЕ PBR-МАТЕРИАЛЫ КОРЫ КАВКАЗСКОГО БУКА И ГОРНОЙ СОСНЫ (512x512)
// ============================================================================
function buildBarkTexturePair(isPine) {
  const size = 512;
  const diffCanvas = document.createElement('canvas');
  diffCanvas.width = size;
  diffCanvas.height = size;
  const ctx = diffCanvas.getContext('2d');
  const img = ctx.createImageData(size, size);
  const d = img.data;
  const hBuf = new Float32Array(size * size);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / size;
      const v = y / size;
      const idx = (y * size + x) * 4;
      if (isPine) {
        // Красно-бурая глубоко-трещиноватая чешуйчатая кора горной кавказской сосны
        const vertFurrow = fbm2D(u * 18.0, v * 4.2, 4);
        const plateCrack = fbm2D(u * 8.5 + 4.1, v * 12.0 + 1.7, 3);
        const fineGrain = fbm2D(u * 38.0 + 1.3, v * 14.0 + 2.9, 2);
        const ridge = Math.pow(Math.max(0, vertFurrow * 0.68 + plateCrack * 0.24 + fineGrain * 0.08), 1.35);
        const deepCrack = ridge < 0.36 ? (0.36 - ridge) * 3.2 : 0.0;
        const height = Math.max(0, Math.min(1, ridge - deepCrack * 0.72));
        hBuf[y * size + x] = height;

        const russetMix = fbm2D(u * 5.0 + 11.2, v * 6.0 + 3.4, 3);
        let r = 84 + height * 78 + russetMix * 32 - deepCrack * 68;
        let g = 48 + height * 46 + russetMix * 14 - deepCrack * 46;
        let b = 30 + height * 26 - deepCrack * 32;
        const moss = Math.max(0, (1.0 - v * 2.2) * (fbm2D(u * 10.0 + 2.5, v * 9.0, 3) - 0.44));
        r = r * (1 - moss * 0.62) + 54 * moss * 0.62;
        g = g * (1 - moss * 0.62) + 78 * moss * 0.62;
        b = b * (1 - moss * 0.62) + 38 * moss * 0.62;

        d[idx] = Math.max(14, Math.min(255, Math.round(r)));
        d[idx + 1] = Math.max(10, Math.min(255, Math.round(g)));
        d[idx + 2] = Math.max(8, Math.min(255, Math.round(b)));
        d[idx + 3] = 255;
      } else {
        // Контрастная серебристо-пепельная кора восточного бука с тёмными чечевичками, бороздами и лишайником
        const baseGrain = fbm2D(u * 10.0, v * 7.0, 4);
        const horizBand = fbm2D(u * 4.5 + 6.1, v * 42.0, 3);
        const vertSeam = fbm2D(u * 28.0 + 2.3, v * 4.5, 3);
        const fineSpeck = fbm2D(u * 48.0, v * 26.0, 2);
        const lenticel = horizBand > 0.62 ? (horizBand - 0.62) * 3.1 : 0.0;
        const seamCrevice = vertSeam < 0.30 ? (0.30 - vertSeam) * 2.8 : 0.0;
        const height = Math.max(
          0,
          Math.min(
            1,
            0.58 + (baseGrain - 0.5) * 0.42 - lenticel * 0.36 - seamCrevice * 0.32 + (fineSpeck - 0.5) * 0.16
          )
        );
        hBuf[y * size + x] = height;

        const lichen = Math.max(0, fbm2D(u * 9.5 + 14.3, v * 9.5 + 7.1, 3) - 0.60) * 2.4;
        const baseMoss = Math.max(0, (1.0 - v * 2.6) * (fbm2D(u * 11.0, v * 10.0, 3) - 0.40));

        let r = 136 + (height - 0.5) * 68 - lenticel * 52 - seamCrevice * 48;
        let g = 132 + (height - 0.5) * 64 - lenticel * 50 - seamCrevice * 46;
        let b = 124 + (height - 0.5) * 58 - lenticel * 44 - seamCrevice * 42;
        // Светло-оливковые пятна кавказского лишайника
        r = r * (1 - lichen * 0.5) + 158 * lichen * 0.5;
        g = g * (1 - lichen * 0.5) + 170 * lichen * 0.5;
        b = b * (1 - lichen * 0.5) + 136 * lichen * 0.5;
        // Мшистый низ ствола
        r = r * (1 - baseMoss * 0.62) + 52 * baseMoss * 0.62;
        g = g * (1 - baseMoss * 0.62) + 78 * baseMoss * 0.62;
        b = b * (1 - baseMoss * 0.62) + 38 * baseMoss * 0.62;

        d[idx] = Math.max(20, Math.min(255, Math.round(r)));
        d[idx + 1] = Math.max(20, Math.min(255, Math.round(g)));
        d[idx + 2] = Math.max(18, Math.min(255, Math.round(b)));
        d[idx + 3] = 255;
      }
    }
  }
  ctx.putImageData(img, 0, 0);
  const diffTex = new THREE.CanvasTexture(diffCanvas);
  diffTex.colorSpace = THREE.SRGBColorSpace;
  diffTex.wrapS = THREE.RepeatWrapping;
  diffTex.wrapT = THREE.RepeatWrapping;
  diffTex.repeat.set(2.0, 3.2);
  diffTex.needsUpdate = true;

  const norTex = buildNormalTextureFromHeight(hBuf, size, isPine ? 3.8 : 2.6);
  norTex.repeat.set(2.0, 3.2);

  return { diffTex, norTex };
}

export function createBarkPbrMaterials({ clippingPlanes = null } = {}) {
  const beech = buildBarkTexturePair(false);
  const pine = buildBarkTexturePair(true);

  const beechBarkMat = new THREE.MeshStandardMaterial({
    color: '#ddd9d0',
    map: beech.diffTex,
    normalMap: beech.norTex,
    normalScale: new THREE.Vector2(1.22, 1.22),
    vertexColors: true,
    roughness: 0.88,
    metalness: 0.02,
    clippingPlanes: clippingPlanes || undefined
  });

  const pineBarkMat = new THREE.MeshStandardMaterial({
    color: '#dec9b5',
    map: pine.diffTex,
    normalMap: pine.norTex,
    normalScale: new THREE.Vector2(1.32, 1.32),
    vertexColors: true,
    roughness: 0.90,
    metalness: 0.02,
    clippingPlanes: clippingPlanes || undefined
  });

  return {
    beechBarkMat,
    pineBarkMat,
    dispose: () => {
      beech.diffTex.dispose();
      beech.norTex.dispose();
      pine.diffTex.dispose();
      pine.norTex.dispose();
      beechBarkMat.dispose();
      pineBarkMat.dispose();
    }
  };
}

// ============================================================================
// 2. СКУЛЬПТУРНЫЕ СЛОИСТЫЕ ИЗВЕСТНЯКОВЫЕ УТЁСЫ И МОКРЫЕ РЕЧНЫЕ ВАЛУНЫ
// ============================================================================
/**
 * Скульптурный угловатый скальный выступ слоистого кавказского известняка
 * с глубоким подземным корнем (до y = -0.44), полностью исключающим парение на крутых склонах!
 */
export function createStratifiedCliffRockGeometry() {
  const slabs = [
    { rx: 0.36, ry: 0.32, rz: 0.30, ox: 0.0, oy: 0.02, oz: 0.0, rotY: 0.22, seed: 1.3 },
    { rx: 0.28, ry: 0.24, rz: 0.24, ox: 0.24, oy: -0.06, oz: 0.10, rotY: 1.48, seed: 4.7 },
    { rx: 0.24, ry: 0.21, rz: 0.22, ox: -0.22, oy: -0.08, oz: -0.09, rotY: 2.75, seed: 8.1 }
  ];

  const parts = slabs.map((sl) => {
    const g = new THREE.IcosahedronGeometry(1.0, 1);
    const pos = g.attributes.position;
    const cols = new Float32Array(pos.count * 3);
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const n1 = fbm2D(v.x * 2.1 + sl.seed, v.z * 2.1 - sl.seed, 3);
      // Слоистая геологическая террасировка известняка (ступени по Y)
      const strata = Math.sin(v.y * 7.8 + n1 * 2.4) * 0.08;
      let sx = v.x * sl.rx * (0.84 + n1 * 0.36 + strata);
      let sz = v.z * sl.rz * (0.84 + (1.0 - n1) * 0.34 - strata * 0.7);
      let sy;
      if (v.y < -0.18) {
        // Глубокий уходящий в склон корень — утёс вросший в гору
        sy = v.y * sl.ry * 1.45 - 0.14;
      } else {
        // Скошенные плоские грани скального скола
        sy = v.y * sl.ry * (0.86 + n1 * 0.26);
        if (sy > sl.ry * 0.62) sy = sl.ry * 0.62 + (sy - sl.ry * 0.62) * 0.35;
      }
      const c = Math.cos(sl.rotY);
      const s = Math.sin(sl.rotY);
      const rx = sx * c - sz * s + sl.ox;
      const rz = sx * s + sz * c + sl.oz;
      const ry = sy + sl.oy;
      pos.setXYZ(i, rx, ry, rz);

      // Затенение в трещинах (AO) и тёплый охристо-серый налёт на верхних полках
      const topWarm = Math.max(0, Math.min(1, (v.y + 0.5) * 0.78));
      const ao = 0.64 + topWarm * 0.36;
      cols[i * 3] = ao * (0.98 + topWarm * 0.04);
      cols[i * 3 + 1] = ao * (0.97 + topWarm * 0.03);
      cols[i * 3 + 2] = ao * (0.92 - topWarm * 0.04);
    }
    g.setAttribute('color', new THREE.BufferAttribute(cols, 3));
    g.computeVertexNormals();
    return g;
  });

  return mergeGeosWithColors(parts);
}

/**
 * Окатанные горным потоком тёмные мокрые речные валуны для порогов Терека, Сунжи, Аргуна и Койсу.
 */
export function createRiverRapidBoulderGeometry() {
  const stones = [
    { rx: 0.24, ry: 0.16, rz: 0.20, ox: 0.0, oy: 0.02, oz: 0.0, seed: 2.1 },
    { rx: 0.14, ry: 0.11, rz: 0.13, ox: 0.17, oy: -0.02, oz: 0.08, seed: 5.4 },
    { rx: 0.12, ry: 0.09, rz: 0.11, ox: -0.15, oy: -0.03, oz: -0.07, seed: 9.2 }
  ];

  const parts = stones.map((st) => {
    const g = new THREE.IcosahedronGeometry(1.0, 1);
    const pos = g.attributes.position;
    const cols = new Float32Array(pos.count * 3);
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const n = valueNoise2D(v.x * 2.4 + st.seed, v.z * 2.4 - st.seed);
      const rx = v.x * st.rx * (0.86 + n * 0.28) + st.ox;
      const rz = v.z * st.rz * (0.86 + (1 - n) * 0.28) + st.oz;
      const ry = (v.y < -0.1 ? v.y * st.ry * 1.9 - 0.08 : v.y * st.ry * (0.88 + n * 0.22)) + st.oy;
      pos.setXYZ(i, rx, ry, rz);

      // Мокрая тёмная ватерлиния и более светлая окатанная макушка валуна
      const dryTop = Math.max(0, Math.min(1, (v.y + 0.15) * 0.9));
      const shade = 0.56 + dryTop * 0.42;
      cols[i * 3] = shade * 0.94;
      cols[i * 3 + 1] = shade * 0.98;
      cols[i * 3 + 2] = shade * 1.02;
    }
    g.setAttribute('color', new THREE.BufferAttribute(cols, 3));
    g.computeVertexNormals();
    return g;
  });

  return mergeGeosWithColors(parts);
}

/**
 * GLSL V-образный пенистый бурун, обтекающий речной валун по течению (1 draw call через InstancedMesh).
 */
export function createRiverBoulderFoamWakeGeometry() {
  const geo = new THREE.PlaneGeometry(0.68, 1.16, 1, 1);
  // rotateX(+PI/2): uv.y=0 -> -Z (вверх по течению), uv.y=1 -> +Z (хвост буруна вниз по течению)
  geo.rotateX(Math.PI / 2);
  // Центрируем воротник пены (uv.y = 0.26) точно на z = 0 вокруг валуна
  geo.translate(0, 0.0, 0.278);
  return geo;
}

export function createRiverBoulderFoamWakeMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: -5,
    polygonOffsetUnits: -5,
    uniforms: {
      uTime: { value: 0.0 },
      uLightScale: { value: 1.0 },
      uFoamTint: { value: new THREE.Color('#eef7fc') }
    },
    vertexShader: `
      varying vec2 vUv;
      varying float vSeed;
      void main() {
        vUv = uv;
        vSeed = 0.0;
        #ifdef USE_INSTANCING
          vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0);
          vSeed = instanceMatrix[3][0] * 1.31 + instanceMatrix[3][2] * 2.17;
        #else
          vec4 wp = modelMatrix * vec4(position, 1.0);
        #endif
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform float uLightScale;
      uniform vec3 uFoamTint;
      varying vec2 vUv;
      varying float vSeed;

      float wHash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
      }
      float wNoise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(wHash(i), wHash(i + vec2(1.0, 0.0)), u.x),
          mix(wHash(i + vec2(0.0, 1.0)), wHash(i + vec2(1.0, 1.0)), u.x),
          u.y
        );
      }

      void main() {
        // vUv.y: 0 = вверх по течению перед камнем, 1 = хвост буруна вниз по течению
        float x = (vUv.x - 0.5) * 2.0;
        float y = vUv.y;

        // Мягкое затухание к краям плоскости (полностью исключает прямоугольную кромку!)
        float edgeMask = smoothstep(1.0, 0.62, abs(x)) * smoothstep(0.0, 0.14, y) * smoothstep(1.0, 0.72, y);

        // Воротник белой пены с набегающей стороны камня (вокруг y = 0.26, без захода на макушку!)
        float collarDist = length(vec2(x * 1.35, (y - 0.26) * 2.35));
        float collar = smoothstep(0.66, 0.32, collarDist) * smoothstep(0.14, 0.30, collarDist);

        // Тонкий кружевной V-образный шлейф пены за камнем вниз по течению
        float wakeY = max(0.0, y - 0.24);
        float vSpread = 0.16 + wakeY * 0.44;
        float vArm = exp(-pow((abs(x) - vSpread) / (0.12 + wakeY * 0.14), 2.0));
        float centerBoil = exp(-pow(x / (0.18 + wakeY * 0.15), 2.0)) * (1.0 - smoothstep(0.26, 0.78, y)) * 0.48;
        float tailFade = smoothstep(0.20, 0.34, y) * (1.0 - smoothstep(0.56, 0.96, y));

        float n1 = wNoise(vec2(x * 6.5 + vSeed, y * 8.5 - uTime * 3.4));
        float n2 = wNoise(vec2(x * 13.0 - vSeed * 0.7, y * 15.0 - uTime * 4.8));
        float froth = smoothstep(0.32, 0.80, n1 * 0.58 + n2 * 0.42);

        float alpha = clamp((collar * 0.85 + (vArm * 0.76 + centerBoil) * tailFade) * (0.42 + 0.65 * froth) * edgeMask, 0.0, 0.78);
        if (alpha < 0.03) discard;

        vec3 col = uFoamTint * (0.72 + 0.28 * froth) * (0.34 + 0.66 * uLightScale);
        gl_FragColor = vec4(col, alpha);
      }
    `
  });
}

// ============================================================================
// 3. СИГНАЛЬНЫЕ СТОРОЖЕВЫЕ МАЯКИ-ВЕЖИ С КАМЕННЫМ ЦОКОЛЕМ, СРУБОМ И GLSL-ОГНЁМ
// ============================================================================
let _sharedBeaconAtlas = null;

function getBeaconPbrAtlas() {
  if (_sharedBeaconAtlas) return _sharedBeaconAtlas;
  const size = 1024;
  const diffCanvas = document.createElement('canvas');
  diffCanvas.width = size;
  diffCanvas.height = size;
  const ctx = diffCanvas.getContext('2d');
  ctx.fillStyle = '#5a534a';
  ctx.fillRect(0, 0, size, size);

  // Q0 (0..512, 0..512): Сухая горская кладка известняка/песчаника с тёмными швами и копотью сверху
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, 512, 512);
  ctx.clip();
  ctx.fillStyle = '#332d26';
  ctx.fillRect(0, 0, 512, 512);
  const rows = 14;
  const rowH = 512 / rows;
  for (let r = 0; r < rows; r++) {
    const y0 = r * rowH;
    const cols = 6 + (r % 2);
    const colW = 512 / cols;
    const offset = (r % 2) * (colW * 0.48);
    for (let c = -1; c <= cols; c++) {
      const x0 = c * colW + offset;
      const w = colW - 3.5;
      const h = rowH - 3.5;
      const rnd = hash2D(c * 3.7 + 1.1, r * 5.3 + 2.7);
      const soot = r < 3 ? (3 - r) * 14 : 0;
      const cr = Math.max(38, Math.round(146 + (rnd - 0.5) * 40 - soot));
      const cg = Math.max(35, Math.round(135 + (rnd - 0.5) * 36 - soot));
      const cb = Math.max(30, Math.round(118 + (rnd - 0.5) * 32 - soot));
      ctx.fillStyle = `rgb(${cr},${cg},${cb})`;
      ctx.fillRect(x0 + 1.5, y0 + 1.5, w, h);

      // Верхняя светлая кромка и нижняя тень каждого тёсаного камня
      ctx.fillStyle = 'rgba(255,248,232,0.14)';
      ctx.fillRect(x0 + 2, y0 + 2, w - 1, 3);
      ctx.fillStyle = 'rgba(18,14,10,0.22)';
      ctx.fillRect(x0 + 2, y0 + h - 2, w - 1, 3);
      if (rnd > 0.72) {
        ctx.fillStyle = 'rgba(132,146,84,0.22)';
        ctx.fillRect(x0 + 6, y0 + 6, w * 0.38, h * 0.35);
      }
    }
  }
  ctx.restore();

  // Q1 (512..1024, 0..512): Сухие и обугленные сосновые брёвна с трещинами и тёплым спилом
  ctx.save();
  ctx.beginPath();
  ctx.rect(512, 0, 512, 512);
  ctx.clip();
  // Левая половина (512..768): натуральная смолистая сосновая древесина / кора брёвен
  ctx.fillStyle = '#5e3c24';
  ctx.fillRect(512, 0, 256, 512);
  for (let i = 0; i < 68; i++) {
    const x = 514 + hash2D(i, 1.3) * 250;
    const w = 2 + hash2D(i, 2.9) * 6;
    ctx.fillStyle = i % 3 === 0 ? 'rgba(34,20,11,0.48)' : 'rgba(148,104,64,0.28)';
    ctx.fillRect(x, 0, w, 512);
  }
  // Правая половина (768..1024): обугленные почерневшие брёвна костра с трещинами углей
  ctx.fillStyle = '#1b1614';
  ctx.fillRect(768, 0, 256, 512);
  for (let i = 0; i < 84; i++) {
    const x = 770 + hash2D(i, 7.1) * 250;
    const y = hash2D(i, 3.7) * 500;
    const w = 2 + hash2D(i, 4.9) * 5;
    const h = 14 + hash2D(i, 6.2) * 44;
    ctx.fillStyle = i % 5 === 0 ? 'rgba(234,88,12,0.45)' : 'rgba(58,48,44,0.55)';
    ctx.fillRect(x, y, w, h);
  }
  ctx.restore();

  // Q2 (0..512, 512..1024): Слой горячих углей и седой древесной золы в очаге
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 512, 512, 512);
  ctx.clip();
  ctx.fillStyle = '#221a17';
  ctx.fillRect(0, 512, 512, 512);
  for (let i = 0; i < 420; i++) {
    const cx = 8 + hash2D(i, 11.4) * 496;
    const cy = 520 + hash2D(i, 17.2) * 496;
    const rad = 4 + hash2D(i, 23.1) * 14;
    const hot = hash2D(i, 29.7);
    if (hot > 0.56) {
      ctx.fillStyle = hot > 0.82 ? '#fbbf24' : hot > 0.68 ? '#f97316' : '#dc2626';
    } else {
      ctx.fillStyle = hot > 0.28 ? '#3d3431' : '#181311';
    }
    ctx.beginPath();
    ctx.arc(cx, cy, rad, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Q3 (512..1024, 512..1024): Кованое почерневшее железо очажной решётки + флажок сигнальной вехи
  ctx.save();
  ctx.beginPath();
  ctx.rect(512, 512, 512, 512);
  ctx.clip();
  // Левая половина (512..768): кованое железо
  ctx.fillStyle = '#25272b';
  ctx.fillRect(512, 512, 256, 512);
  for (let i = 0; i < 90; i++) {
    const x = 516 + hash2D(i, 33.1) * 244;
    const y = 516 + hash2D(i, 37.9) * 500;
    ctx.fillStyle = i % 2 === 0 ? 'rgba(148,163,184,0.14)' : 'rgba(120,53,15,0.20)';
    ctx.fillRect(x, y, 16, 4);
  }
  // Правая половина (768..1024): сукно сигнального вымпела (алый/изумрудный)
  ctx.fillStyle = '#8b1e1e';
  ctx.fillRect(768, 512, 256, 512);
  ctx.fillStyle = '#d4a348';
  ctx.fillRect(768, 530, 256, 18);
  ctx.fillRect(768, 976, 256, 18);
  ctx.restore();

  const diffTex = new THREE.CanvasTexture(diffCanvas);
  diffTex.colorSpace = THREE.SRGBColorSpace;
  diffTex.needsUpdate = true;

  // Генерируем карту нормалей из яркости диффуза
  const rawImg = ctx.getImageData(0, 0, size, size).data;
  const hBuf = new Float32Array(size * size);
  for (let i = 0; i < size * size; i++) {
    hBuf[i] = (rawImg[i * 4] * 0.3 + rawImg[i * 4 + 1] * 0.59 + rawImg[i * 4 + 2] * 0.11) / 255;
  }
  const norTex = buildNormalTextureFromHeight(hBuf, size, 2.2);

  _sharedBeaconAtlas = { diffTex, norTex };
  return _sharedBeaconAtlas;
}

/**
 * Создаёт многослойный GLSL-материал живого сигнального пламени (без выжигания в белый треугольник Bloom!).
 */
function createAnimatedFlameMaterial({ isCore = false, clippingPlanes = null } = {}) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: isCore ? THREE.AdditiveBlending : THREE.NormalBlending,
    clipping: Boolean(clippingPlanes && clippingPlanes.length > 0),
    clippingPlanes: clippingPlanes || [],
    uniforms: {
      uTime: { value: 0.0 },
      uPhase: { value: 0.0 },
      uIntensity: { value: 1.0 }
    },
    vertexShader: `
      uniform float uTime;
      uniform float uPhase;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        vec3 p = position;
        float h = clamp(uv.y, 0.0, 1.0);
        // Порывистое горное колебание языков пламени на ветру
        float swayX = sin(uTime * 6.4 + h * 4.5 + uPhase) * 0.095 * h * h;
        float swayZ = cos(uTime * 5.2 + h * 3.8 + uPhase * 1.3) * 0.075 * h * h;
        // Лёгкий ветер вправо-вверх
        p.x += swayX + h * h * 0.08;
        p.z += swayZ;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform float uPhase;
      uniform float uIntensity;
      varying vec2 vUv;

      float fHash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }
      float fNoise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(fHash(i), fHash(i + vec2(1.0, 0.0)), u.x),
          mix(fHash(i + vec2(0.0, 1.0)), fHash(i + vec2(1.0, 1.0)), u.x),
          u.y
        );
      }
      float fFbm(vec2 p) {
        float v = 0.0;
        float a = 0.5;
        for (int i = 0; i < 4; i++) {
          v += a * fNoise(p);
          p *= 2.08;
          a *= 0.5;
        }
        return v;
      }

      void main() {
        float x = (vUv.x - 0.5) * 2.0;
        float y = vUv.y;

        // Поток турбулентного огня вверх
        vec2 q = vec2(x * 2.2 + sin(y * 5.0 - uTime * 5.2 + uPhase) * 0.25, y * 3.2 - uTime * 3.8);
        float n = fFbm(q + vec2(uPhase, 0.0));
        float nDetail = fFbm(q * 2.1 - vec2(0.0, uTime * 2.4));

        // Сужение профиля языка пламени к вершине + язычки на краях
        float widthAtY = mix(0.88, 0.14, pow(y, 0.78));
        float dist = abs(x) / max(0.08, widthAtY);
        float shape = (1.0 - dist * dist) - y * 0.62 + (n * 0.65 + nDetail * 0.35 - 0.42) * (0.45 + 0.65 * y);

        float alpha = smoothstep(0.02, 0.32, shape) * smoothstep(0.0, 0.14, y) * (1.0 - smoothstep(0.76, 1.0, y));
        if (alpha < 0.02) discard;

        // Многоступенчатый цветовой градиент настоящего соснового костра (без пересвета в белый)
        vec3 deepCrimson = vec3(0.66, 0.10, 0.03);
        vec3 brightOrange = vec3(0.95, 0.38, 0.05);
        vec3 warmGold = vec3(0.98, 0.78, 0.24);
        float heat = clamp(shape * 1.15 - y * 0.38 + nDetail * 0.18, 0.0, 1.0);
        vec3 col = mix(deepCrimson, brightOrange, smoothstep(0.12, 0.54, heat));
        col = mix(col, warmGold, smoothstep(0.54, 0.92, heat));

        ${
          isCore
            ? 'gl_FragColor = vec4(col * (0.68 * uIntensity), alpha * 0.68);'
            : 'gl_FragColor = vec4(col * (0.94 * uIntensity), alpha * 0.92);'
        }
      }
    `
  });
}

/**
 * Создаёт высокодетализированный сторожевой сигнальный маяк Имамата (вежа-кострище на каменном цоколе):
 * - Глубокий цоколь из тёсаного горного камня (y = -0.34 .. +0.62) + 5 наружных каменных ступеней
 * - Угловые каменные парапетные тумбы, ниша для растопки, поленница дров сбоку, сигнальная веха с вымпелом
 * - Кованый очажный обод и 3-ярусный колодец из 12 сосновых/обугленных брёвен
 * - При isLit=true: тлеющий слой углей, многослойное живое GLSL-пламя, взлетающие искры и мерцающий PointLight
 */
export function createPhotorealSignalBeaconInstance({
  isLit = true,
  scale = 1.0,
  castShadow = true,
  clippingPlanes = null,
  phase = 0.0
} = {}) {
  const atlas = getBeaconPbrAtlas();
  const root = new THREE.Group();
  root.scale.setScalar(scale);

  const ownedGeos = [];
  const ownedMats = [];
  const clip = clippingPlanes || undefined;

  const stoneMat = new THREE.MeshStandardMaterial({
    color: '#d8d0c4',
    map: atlas.diffTex,
    normalMap: atlas.norTex,
    normalScale: new THREE.Vector2(0.95, 0.95),
    roughness: 0.90,
    metalness: 0.03,
    clippingPlanes: clip
  });
  const woodMat = new THREE.MeshStandardMaterial({
    color: '#d4c8ba',
    map: atlas.diffTex,
    normalMap: atlas.norTex,
    normalScale: new THREE.Vector2(0.85, 0.85),
    roughness: 0.88,
    metalness: 0.04,
    clippingPlanes: clip
  });
  const ironMat = new THREE.MeshStandardMaterial({
    color: '#34383e',
    map: atlas.diffTex,
    roughness: 0.56,
    metalness: 0.74,
    clippingPlanes: clip
  });
  const emberMat = new THREE.MeshStandardMaterial({
    color: isLit ? '#3a2218' : '#3a3430',
    map: atlas.diffTex,
    emissive: isLit ? '#ea580c' : '#000000',
    emissiveMap: isLit ? atlas.diffTex : null,
    emissiveIntensity: isLit ? 0.92 : 0.0,
    roughness: 0.92,
    metalness: 0.02,
    clippingPlanes: clip
  });
  ownedMats.push(stoneMat, woodMat, ironMat, emberMat);

  const addStoneMesh = (geo, x, y, z, rx = 0, ry = 0, rz = 0) => {
    remapBoxUVs(geo, 0.015, 0.515, 0.485, 0.985);
    ownedGeos.push(geo);
    const m = new THREE.Mesh(geo, stoneMat);
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, rz);
    m.castShadow = castShadow;
    m.receiveShadow = true;
    root.add(m);
    return m;
  };

  // 1. Широкий заглублённый каменный фундамент (y = -0.34 .. +0.16) — прочно сидит на любом горном гребне
  addStoneMesh(new THREE.CylinderGeometry(0.62, 0.78, 0.50, 8), 0, -0.09, 0, 0, Math.PI / 8, 0);

  // 2. Сужающийся каменный постамент-вежа (y = 0.14 .. 0.58)
  addStoneMesh(new THREE.CylinderGeometry(0.49, 0.59, 0.46, 8), 0, 0.37, 0, 0, Math.PI / 8, 0);

  // 3. Выступающая каменная карнизная плита площадки очага (y = 0.58 .. 0.65)
  addStoneMesh(new THREE.CylinderGeometry(0.56, 0.52, 0.075, 8), 0, 0.615, 0, 0, Math.PI / 8, 0);

  // 4. Четыре каменные угловые тумбы-ветрозащиты вокруг кострища
  for (let i = 0; i < 4; i++) {
    const ang = (i / 4) * Math.PI * 2 + Math.PI / 4;
    addStoneMesh(
      new THREE.BoxGeometry(0.16, 0.14, 0.16),
      Math.cos(ang) * 0.44,
      0.70,
      Math.sin(ang) * 0.44,
      0,
      -ang,
      0
    );
  }

  // 5. Наружная каменная лестница из 5 ступеней к площадке маяка (с передне-правой стороны)
  for (let s = 0; s < 5; s++) {
    const stepY = 0.05 + s * 0.115;
    const stepZ = 0.76 - s * 0.085;
    const stepH = 0.16 + s * 0.04;
    addStoneMesh(new THREE.BoxGeometry(0.28, stepH, 0.13), 0.0, stepY - stepH * 0.35, stepZ);
  }
  // Низкие каменные щёчки лестницы
  addStoneMesh(new THREE.BoxGeometry(0.06, 0.32, 0.44), -0.15, 0.24, 0.60, 0.52, 0, 0);
  addStoneMesh(new THREE.BoxGeometry(0.06, 0.32, 0.44), 0.15, 0.24, 0.60, 0.52, 0, 0);

  // 6. Кованый очажный обруч и решётка
  const ironRingGeo = remapBoxUVs(new THREE.TorusGeometry(0.39, 0.022, 6, 16), 0.52, 0.02, 0.73, 0.48);
  ironRingGeo.rotateX(Math.PI / 2);
  ownedGeos.push(ironRingGeo);
  const ironRing = new THREE.Mesh(ironRingGeo, ironMat);
  ironRing.position.set(0, 0.67, 0);
  ironRing.castShadow = castShadow;
  root.add(ironRing);

  // 7. Холмик золы и раскалённых углей в чаше очага
  const coalGeo = remapBoxUVs(new THREE.SphereGeometry(0.36, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.52), 0.02, 0.02, 0.48, 0.48);
  coalGeo.scale(1.0, 0.44, 1.0);
  ownedGeos.push(coalGeo);
  const coalMound = new THREE.Mesh(coalGeo, emberMat);
  coalMound.position.set(0, 0.64, 0);
  root.add(coalMound);

  // 8. 3-ярусный сруб-колодец из сосновых/обугленных брёвен (12 брёвен)
  const logU0 = isLit ? 0.76 : 0.52;
  const logU1 = isLit ? 0.98 : 0.73;
  const cribLogGeo = remapBoxUVs(new THREE.CylinderGeometry(0.044, 0.048, 0.64, 7), logU0, 0.52, logU1, 0.98);
  ownedGeos.push(cribLogGeo);

  for (let tier = 0; tier < 3; tier++) {
    const ty = 0.70 + tier * 0.088;
    const span = 0.24 - tier * 0.042;
    const lenScale = 1.0 - tier * 0.14;
    const alongX = tier % 2 === 0;
    for (let side = -1; side <= 1; side += 2) {
      const lg = new THREE.Mesh(cribLogGeo, woodMat);
      lg.scale.set(1, lenScale, 1);
      if (alongX) {
        lg.rotation.z = Math.PI / 2;
        lg.position.set(0, ty, side * span);
      } else {
        lg.rotation.x = Math.PI / 2;
        lg.position.set(side * span, ty, 0);
      }
      lg.castShadow = castShadow;
      lg.receiveShadow = true;
      root.add(lg);
    }
  }
  // 4 диагональных верхних полена шатром в центре очага (аккуратно сложенный костёр, не закрывающий пламя)
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * Math.PI * 2 + 0.45;
    const lg = new THREE.Mesh(cribLogGeo, woodMat);
    lg.scale.set(0.76, 0.56, 0.76);
    lg.position.set(Math.cos(a) * 0.14, 0.86, Math.sin(a) * 0.14);
    lg.rotation.set(Math.sin(a) * 0.72, 0, -Math.cos(a) * 0.72);
    lg.castShadow = castShadow;
    root.add(lg);
  }

  // 9. Запасная поленница сухих дров сбоку на земле (x = -0.68, z = 0.22)
  const reserveLogGeo = remapBoxUVs(new THREE.CylinderGeometry(0.036, 0.038, 0.44, 6), 0.52, 0.52, 0.73, 0.98);
  reserveLogGeo.rotateZ(Math.PI / 2);
  ownedGeos.push(reserveLogGeo);
  const stackOffsets = [
    [-0.72, 0.04, 0.14],
    [-0.72, 0.04, 0.22],
    [-0.72, 0.04, 0.30],
    [-0.72, 0.04, 0.38],
    [-0.72, 0.11, 0.18],
    [-0.72, 0.11, 0.26],
    [-0.72, 0.11, 0.34],
    [-0.72, 0.18, 0.22],
    [-0.72, 0.18, 0.30]
  ];
  stackOffsets.forEach(([sx, sy, sz], idx) => {
    const rl = new THREE.Mesh(reserveLogGeo, woodMat);
    rl.position.set(sx, sy, sz);
    rl.rotation.y = 0.24 + (idx % 3 - 1) * 0.04;
    rl.castShadow = castShadow;
    rl.receiveShadow = true;
    root.add(rl);
  });

  // 10. Сторожевая веха-мачта рядом с площадкой и суконный сигнальный флажок
  const poleGeo = remapBoxUVs(new THREE.CylinderGeometry(0.022, 0.032, 1.62, 6), 0.52, 0.52, 0.73, 0.98);
  ownedGeos.push(poleGeo);
  const pole = new THREE.Mesh(poleGeo, woodMat);
  pole.position.set(0.56, 0.72, -0.32);
  pole.rotation.z = -0.04;
  pole.castShadow = castShadow;
  root.add(pole);

  const pennantGeo = remapBoxUVs(new THREE.PlaneGeometry(0.42, 0.18, 4, 1), 0.76, 0.03, 0.98, 0.47);
  pennantGeo.translate(0.21, 0, 0);
  ownedGeos.push(pennantGeo);
  const pennantMat = new THREE.MeshStandardMaterial({
    color: isLit ? '#c2410c' : '#854d27',
    map: atlas.diffTex,
    roughness: 0.85,
    side: THREE.DoubleSide,
    clippingPlanes: clip
  });
  ownedMats.push(pennantMat);
  const pennant = new THREE.Mesh(pennantGeo, pennantMat);
  pennant.position.set(0.59, 1.38, -0.32);
  pennant.castShadow = castShadow;
  root.add(pennant);

  // 11. Живое многослойное GLSL-пламя, взлетающие искры и мерцающий свет очага (если маяк зажжён)
  let flameOuterMat = null;
  let flameCoreMat = null;
  let fireLight = null;
  const sparkMeshes = [];

  if (isLit) {
    flameOuterMat = createAnimatedFlameMaterial({ isCore: false, clippingPlanes });
    flameCoreMat = createAnimatedFlameMaterial({ isCore: true, clippingPlanes });
    flameOuterMat.uniforms.uPhase.value = phase;
    flameCoreMat.uniforms.uPhase.value = phase + 1.9;
    ownedMats.push(flameOuterMat, flameCoreMat);

    // 3 перекрещённые изогнутые ленты внешнего пламени
    const outerBladeGeo = new THREE.PlaneGeometry(0.76, 1.18, 2, 6);
    outerBladeGeo.translate(0, 0.54, 0);
    ownedGeos.push(outerBladeGeo);
    for (let i = 0; i < 3; i++) {
      const fMesh = new THREE.Mesh(outerBladeGeo, flameOuterMat);
      fMesh.position.set(0, 0.72, 0);
      fMesh.rotation.y = (i / 3) * Math.PI;
      fMesh.userData.excludeFromGtao = true;
      fMesh.renderOrder = 3;
      root.add(fMesh);
    }

    // 2 внутренние перекрещённые сердцевины горячего золотистого огня
    const coreBladeGeo = new THREE.PlaneGeometry(0.46, 0.82, 2, 5);
    coreBladeGeo.translate(0, 0.38, 0);
    ownedGeos.push(coreBladeGeo);
    for (let i = 0; i < 2; i++) {
      const cMesh = new THREE.Mesh(coreBladeGeo, flameCoreMat);
      cMesh.position.set(0, 0.74, 0);
      cMesh.rotation.y = (i / 2) * Math.PI + 0.45;
      cMesh.userData.excludeFromGtao = true;
      cMesh.renderOrder = 4;
      root.add(cMesh);
    }

    // 8 взлетающих тлеющих искр над кострищем (объёмные октаэдры — видны с любого ракурса)
    const sparkGeo = new THREE.OctahedronGeometry(0.024, 0);
    const sparkMat = new THREE.MeshBasicMaterial({
      color: '#fdba74',
      transparent: true,
      opacity: 0.90,
      depthWrite: false,
      clippingPlanes: clip
    });
    ownedGeos.push(sparkGeo);
    ownedMats.push(sparkMat);
    for (let s = 0; s < 8; s++) {
      const sp = new THREE.Mesh(sparkGeo, sparkMat);
      sp.userData = {
        excludeFromGtao: true,
        sparkSeed: s * 0.79 + phase,
        baseAng: (s / 8) * Math.PI * 2
      };
      sp.renderOrder = 5;
      root.add(sp);
      sparkMeshes.push(sp);
    }

    // Живой мерцающий свет сторожевого огня (подсвечивает камни цоколя и ближайшие ели)
    fireLight = new THREE.PointLight('#ff7b24', 1.4, 7.2, 1.7);
    fireLight.position.set(0, 1.38, 0);
    root.add(fireLight);
  }

  root.userData.photorealNatureBeacon = {
    isLit,
    phase,
    flameOuterMat,
    flameCoreMat,
    emberMat,
    fireLight,
    pennant,
    sparkMeshes,
    ownedGeos,
    ownedMats
  };

  return root;
}

/**
 * Обновляет анимацию огня, искр, вымпела и мерцающего освещения всех сигнальных маяков внутри parentGroup.
 */
export function updatePhotorealSignalBeacons(parentGroup, elapsed, timeOfDay = 'day') {
  if (!parentGroup) return;
  const lightMult = timeOfDay === 'night' ? 3.8 : timeOfDay === 'sunset' ? 2.4 : 1.15;
  const flameBright = timeOfDay === 'night' ? 1.18 : timeOfDay === 'sunset' ? 1.08 : 0.96;

  parentGroup.traverse((obj) => {
    const b = obj.userData?.photorealNatureBeacon;
    if (!b) return;
    if (b.pennant) {
      b.pennant.rotation.y = Math.sin(elapsed * 3.8 + b.phase) * 0.24 + 0.18;
    }
    if (!b.isLit) return;
    if (b.flameOuterMat) {
      b.flameOuterMat.uniforms.uTime.value = elapsed;
      b.flameOuterMat.uniforms.uIntensity.value = flameBright;
    }
    if (b.flameCoreMat) {
      b.flameCoreMat.uniforms.uTime.value = elapsed * 1.14;
      b.flameCoreMat.uniforms.uIntensity.value = flameBright;
    }
    const flicker =
      0.86 +
      Math.sin(elapsed * 11.4 + b.phase) * 0.09 +
      Math.sin(elapsed * 23.7 + b.phase * 2.1) * 0.05;
    if (b.emberMat) {
      b.emberMat.emissiveIntensity = (timeOfDay === 'night' ? 1.25 : 0.88) * flicker;
    }
    if (b.fireLight) {
      b.fireLight.intensity = lightMult * flicker;
    }
    if (b.sparkMeshes && b.sparkMeshes.length > 0) {
      b.sparkMeshes.forEach((sp) => {
        const sd = sp.userData.sparkSeed;
        const cycle = (elapsed * 0.58 + sd) % 1.0;
        const ang = sp.userData.baseAng + elapsed * 1.3 + cycle * 2.2;
        const rad = 0.08 + cycle * 0.28;
        sp.position.set(
          Math.cos(ang) * rad + cycle * 0.18,
          0.95 + cycle * 1.35,
          Math.sin(ang) * rad
        );
        const sScale = Math.sin(cycle * Math.PI) * 1.15;
        sp.scale.setScalar(Math.max(0.01, sScale));
        sp.rotation.y = elapsed * 2.0 + sd;
      });
    }
  });
}

export function disposePhotorealNatureInstance(root) {
  if (!root) return;
  const b = root.userData?.photorealNatureBeacon;
  if (b) {
    (b.ownedGeos || []).forEach((g) => g && g.dispose());
    (b.ownedMats || []).forEach((m) => m && m.dispose());
  }
}
