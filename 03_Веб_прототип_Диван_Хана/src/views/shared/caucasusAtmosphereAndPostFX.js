// Общий модуль атмосферы 3-го этапа (WebGL2):
// 1) Многослойный клубящийся пороховой дым XIX века (термальная вспышка -> остывающий шлейф) + мелкие осколки камня;
// 2) Многоярусный слоистый горный/лесной туман без краёв спрайта;
// 3) GPU-осадки (косой горный ливень и вихревой снегопад Кавказа с нулевой нагрузкой на CPU);
// 4) Финальная кинематографическая постобработка: SMAAPass -> OutputPass -> CinematicGradePass.
import * as THREE from 'three';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

function smoothstep(e0, e1, x) {
  const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
}

function fbm2D(x, y) {
  const n1 = Math.sin(x * 1.9 + Math.cos(y * 1.7) * 1.2) * 0.5 + 0.5;
  const n2 = Math.sin(x * 4.1 - y * 3.3 + 0.8) * 0.5 + 0.5;
  const n3 = Math.cos(x * 8.3 + y * 7.7 - 1.4) * 0.5 + 0.5;
  return n1 * 0.56 + n2 * 0.30 + n3 * 0.14;
}

/**
 * Генерирует мягкую многодольную фактуру клубов чёрного пороха (256x256 RGBA).
 * Альфа строго равна 0.0 при радиусе > 0.46, исключая прямоугольные границы спрайта.
 */
export function createBillowingSmokeTexture() {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const img = ctx.createImageData(size, size);
    const data = img.data;
    const lobes = [
      { x: 0.0, y: -0.02, r: 0.34, w: 0.95 },
      { x: -0.14, y: -0.09, r: 0.24, w: 0.78 },
      { x: 0.15, y: -0.08, r: 0.25, w: 0.78 },
      { x: -0.11, y: 0.12, r: 0.24, w: 0.72 },
      { x: 0.13, y: 0.11, r: 0.23, w: 0.70 },
      { x: -0.02, y: -0.17, r: 0.21, w: 0.68 },
      { x: 0.03, y: 0.16, r: 0.20, w: 0.64 }
    ];

    for (let py = 0; py < size; py++) {
      const dy = (py + 0.5) / size - 0.5;
      for (let px = 0; px < size; px++) {
        const dx = (px + 0.5) / size - 0.5;
        const idx = (py * size + px) * 4;
        const dist = Math.hypot(dx, dy);
        if (dist >= 0.46) {
          data[idx] = 0;
          data[idx + 1] = 0;
          data[idx + 2] = 0;
          data[idx + 3] = 0;
          continue;
        }

        let lobeSum = 0;
        for (let l = 0; l < lobes.length; l++) {
          const lb = lobes[l];
          const ld = Math.hypot(dx - lb.x, dy - lb.y) / lb.r;
          if (ld < 1.0) {
            const k = 1.0 - ld * ld;
            lobeSum += k * k * lb.w;
          }
        }

        const n = fbm2D(dx * 7.5 + 3.2, dy * 7.5 - 1.7);
        const outerFade = 1.0 - smoothstep(0.24, 0.46, dist);
        const density = Math.max(0, Math.min(1, (lobeSum * (0.56 + 0.62 * n) - 0.11) * outerFade * 1.15));
        const lit = Math.max(152, Math.min(255, Math.round((0.76 - dy * 0.42 + n * 0.16) * 255)));

        data[idx] = lit;
        data[idx + 1] = lit;
        data[idx + 2] = Math.min(255, Math.round(lit * 1.01));
        data[idx + 3] = Math.round(density * 255);
      }
    }
    ctx.putImageData(img, 0, 0);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Слоистый горный/лесной туман (512x256 RGBA) с полным затуханием альфы на всех 4 краях.
 */
export function createLayeredValleyMistTexture() {
  const w = 512;
  const h = 256;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const img = ctx.createImageData(w, h);
    const data = img.data;
    for (let py = 0; py < h; py++) {
      const v = (py + 0.5) / h;
      const edgeY = smoothstep(0.0, 0.30, v) * (1.0 - smoothstep(0.70, 1.0, v));
      for (let px = 0; px < w; px++) {
        const u = (px + 0.5) / w;
        const idx = (py * w + px) * 4;
        const edgeX = smoothstep(0.0, 0.24, u) * (1.0 - smoothstep(0.76, 1.0, u));
        const envelope = edgeX * edgeY;
        if (envelope <= 0.002) {
          data[idx] = 0;
          data[idx + 1] = 0;
          data[idx + 2] = 0;
          data[idx + 3] = 0;
          continue;
        }
        const streakA = fbm2D(u * 4.4 + 1.2, v * 7.6 + 0.5);
        const streakB = fbm2D(u * 9.2 - 2.1, v * 14.5 + 3.1);
        const wisp = Math.max(0, Math.min(1, (streakA * 0.65 + streakB * 0.35 - 0.16) * 1.25));
        const alpha = Math.max(0, Math.min(1, envelope * wisp));
        data[idx] = 228;
        data[idx + 1] = 236;
        data[idx + 2] = 244;
        data[idx + 3] = Math.round(alpha * 215);
      }
    }
    ctx.putImageData(img, 0, 0);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Система объёмного порохового дыма (биллборды с термальным остыванием) и мелких осколков камня.
 */
export function createBlackPowderSmokeSystem({
  parentGroup,
  smokeTex,
  maxParticles = 300,
  clippingPlanes = null
}) {
  const billboardGeo = new THREE.PlaneGeometry(1, 1);
  const debrisGeo = new THREE.DodecahedronGeometry(0.075, 0);
  debrisGeo.scale(1.0, 0.58, 0.76);

  const items = [];
  const tmpStartCol = new THREE.Color();
  const tmpEndCol = new THREE.Color();

  const removeAt = (idx) => {
    const it = items[idx];
    parentGroup.remove(it.mesh);
    it.mat.dispose();
    items.splice(idx, 1);
  };

  const spawnSmoke = ({
    x,
    y,
    z,
    vx = 0,
    vy = 0.55,
    vz = 0,
    scale = 0.5,
    grow = 0.95,
    gravity = -0.05,
    life = 3.2,
    flash = false,
    colorHex = '#cbd5e1',
    flashHex = '#fbbf24',
    maxOpacity = 0.54
  }) => {
    if (items.length >= maxParticles) removeAt(0);
    const mat = new THREE.MeshBasicMaterial({
      map: smokeTex,
      color: flash ? flashHex : colorHex,
      transparent: true,
      opacity: 0.01,
      depthWrite: false,
      side: THREE.DoubleSide,
      clippingPlanes: clippingPlanes || undefined
    });
    const mesh = new THREE.Mesh(billboardGeo, mat);
    mesh.position.set(x, y, z);
    mesh.scale.setScalar(scale);
    mesh.userData.excludeFromGtao = true;
    parentGroup.add(mesh);

    items.push({
      kind: 'smoke',
      mesh,
      mat,
      vx,
      vy,
      vz,
      scale,
      grow,
      gravity,
      age: 0,
      life,
      flash,
      startColor: new THREE.Color(flashHex),
      endColor: new THREE.Color(colorHex),
      maxOpacity,
      roll: (Math.random() - 0.5) * Math.PI * 2,
      rollSpeed: (Math.random() - 0.5) * 0.45
    });
  };

  const spawnDebris = ({
    x,
    y,
    z,
    vx = 0,
    vy = 2.5,
    vz = 0,
    scale = 0.09,
    gravity = 8.8,
    life = 0.9,
    colorHex = '#57534e',
    emissiveHex = '#000000'
  }) => {
    if (items.length >= maxParticles) removeAt(0);
    const clampedScale = Math.max(0.04, Math.min(0.14, scale));
    const mat = new THREE.MeshStandardMaterial({
      color: colorHex,
      emissive: emissiveHex,
      emissiveIntensity: emissiveHex !== '#000000' ? 1.2 : 0,
      roughness: 0.85,
      clippingPlanes: clippingPlanes || undefined
    });
    const mesh = new THREE.Mesh(debrisGeo, mat);
    mesh.position.set(x, y, z);
    mesh.scale.setScalar(clampedScale / 0.075);
    mesh.userData.excludeFromGtao = true;
    parentGroup.add(mesh);

    items.push({
      kind: 'debris',
      mesh,
      mat,
      vx,
      vy,
      vz,
      gravity,
      age: 0,
      life,
      spinX: (Math.random() - 0.5) * 11,
      spinZ: (Math.random() - 0.5) * 11
    });
  };

  const update = (dt, camera, windX = 0.24, windZ = 0.07) => {
    const drag = Math.exp(-1.55 * dt);
    for (let i = items.length - 1; i >= 0; i--) {
      const it = items[i];
      it.age += dt;
      if (it.age >= it.life) {
        removeAt(i);
        continue;
      }
      if (it.kind === 'debris') {
        it.vy -= it.gravity * dt;
        it.mesh.position.x += it.vx * dt;
        it.mesh.position.y += it.vy * dt;
        it.mesh.position.z += it.vz * dt;
        it.mesh.rotation.x += it.spinX * dt;
        it.mesh.rotation.z += it.spinZ * dt;
      } else {
        it.vx = it.vx * drag + windX * 0.45 * dt;
        it.vz = it.vz * drag + windZ * 0.45 * dt;
        it.vy -= it.gravity * dt;
        it.vy = Math.min(1.85, Math.max(-0.25, it.vy * (1.0 - 0.18 * dt)));
        it.mesh.position.x += it.vx * dt;
        it.mesh.position.y += it.vy * dt;
        it.mesh.position.z += it.vz * dt;

        const lifeFrac = it.age / it.life;
        it.scale += it.grow * dt * (1.0 - lifeFrac * 0.45);
        it.mesh.scale.setScalar(it.scale);

        if (camera) {
          it.mesh.quaternion.copy(camera.quaternion);
          it.roll += it.rollSpeed * dt;
          it.mesh.rotateZ(it.roll);
        }

        if (it.flash) {
          const coolT = Math.min(1.0, it.age / 0.24);
          tmpStartCol.copy(it.startColor);
          tmpEndCol.copy(it.endColor);
          it.mat.color.copy(tmpStartCol.lerp(tmpEndCol, coolT));
        }

        const fadeIn = Math.sin(Math.min(1.0, it.age / Math.min(0.16, it.life * 0.18)) * (Math.PI * 0.5));
        const fadeOut = Math.pow(1.0 - lifeFrac, 1.35);
        it.mat.opacity = it.maxOpacity * fadeIn * fadeOut;
      }
    }
  };

  const dispose = () => {
    while (items.length > 0) removeAt(items.length - 1);
    billboardGeo.dispose();
    debrisGeo.dispose();
  };

  return {
    spawnSmoke,
    spawnDebris,
    update,
    dispose,
    getActiveCount: () => items.length
  };
}

/**
 * GPU-система осадков Кавказа (горный ливень + турбулентный снегопад, 0 нагрузок CPU).
 */
export function createCaucasusPrecipitationSystem({
  spanX = 68,
  spanY = 18,
  spanZ = 46,
  rainCount = 750,
  snowCount = 900
} = {}) {
  const group = new THREE.Group();
  group.userData.excludeFromGtao = true;

  const rainGeo = new THREE.BufferGeometry();
  const rainPos = new Float32Array(rainCount * 6);
  const rainSeeds = new Float32Array(rainCount * 6);
  const rainFlags = new Float32Array(rainCount * 2);
  const rainSpeeds = new Float32Array(rainCount * 2);

  for (let i = 0; i < rainCount; i++) {
    const rx = (Math.random() - 0.5) * spanX;
    const ry = Math.random() * spanY;
    const rz = (Math.random() - 0.5) * spanZ;
    const spd = 16.0 + Math.random() * 8.0;
    for (let v = 0; v < 2; v++) {
      const i3 = (i * 2 + v) * 3;
      rainSeeds[i3] = rx;
      rainSeeds[i3 + 1] = ry;
      rainSeeds[i3 + 2] = rz;
      rainFlags[i * 2 + v] = v;
      rainSpeeds[i * 2 + v] = spd;
    }
  }
  rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
  rainGeo.setAttribute('aSeed', new THREE.BufferAttribute(rainSeeds, 3));
  rainGeo.setAttribute('aTail', new THREE.BufferAttribute(rainFlags, 1));
  rainGeo.setAttribute('aSpeed', new THREE.BufferAttribute(rainSpeeds, 1));

  const rainUniforms = {
    uTime: { value: 0 },
    uSpan: { value: new THREE.Vector3(spanX, spanY, spanZ) },
    uCenterXZ: { value: new THREE.Vector2(0, 0) }
  };

  const rainMat = new THREE.ShaderMaterial({
    uniforms: rainUniforms,
    vertexShader: `
      uniform float uTime;
      uniform vec3 uSpan;
      uniform vec2 uCenterXZ;
      attribute vec3 aSeed;
      attribute float aTail;
      attribute float aSpeed;
      varying float vTail;
      void main() {
        vTail = aTail;
        vec2 halfXZ = uSpan.xz * 0.5;
        vec2 relXZ = mod(aSeed.xz - uCenterXZ + halfXZ, uSpan.xz) - halfXZ + uCenterXZ;
        float wy = mod(aSeed.y - uTime * aSpeed, uSpan.y) + 0.2;
        vec3 wp = vec3(relXZ.x, wy, relXZ.y) + vec3(-0.18, -0.98, 0.09) * (aTail * 0.78);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(wp, 1.0);
      }
    `,
    fragmentShader: `
      varying float vTail;
      void main() {
        float alpha = mix(0.28, 0.04, vTail);
        gl_FragColor = vec4(0.76, 0.87, 0.96, alpha);
      }
    `,
    transparent: true,
    depthWrite: false
  });

  const rainLines = new THREE.LineSegments(rainGeo, rainMat);
  rainLines.frustumCulled = false;
  rainLines.visible = false;
  rainLines.userData.excludeFromGtao = true;

  const snowGeo = new THREE.BufferGeometry();
  const snowPos = new Float32Array(snowCount * 3);
  const snowSeeds = new Float32Array(snowCount * 3);
  const snowSpeeds = new Float32Array(snowCount);
  const snowSizes = new Float32Array(snowCount);

  for (let i = 0; i < snowCount; i++) {
    const i3 = i * 3;
    snowSeeds[i3] = (Math.random() - 0.5) * spanX;
    snowSeeds[i3 + 1] = Math.random() * spanY;
    snowSeeds[i3 + 2] = (Math.random() - 0.5) * spanZ;
    snowSpeeds[i] = 1.45 + Math.random() * 1.35;
    snowSizes[i] = 22.0 + Math.random() * 18.0;
  }
  snowGeo.setAttribute('position', new THREE.BufferAttribute(snowPos, 3));
  snowGeo.setAttribute('aSeed', new THREE.BufferAttribute(snowSeeds, 3));
  snowGeo.setAttribute('aSpeed', new THREE.BufferAttribute(snowSpeeds, 1));
  snowGeo.setAttribute('aSize', new THREE.BufferAttribute(snowSizes, 1));

  const snowUniforms = {
    uTime: { value: 0 },
    uSpan: { value: new THREE.Vector3(spanX, spanY, spanZ) },
    uCenterXZ: { value: new THREE.Vector2(0, 0) }
  };

  const snowMat = new THREE.ShaderMaterial({
    uniforms: snowUniforms,
    vertexShader: `
      uniform float uTime;
      uniform vec3 uSpan;
      uniform vec2 uCenterXZ;
      attribute vec3 aSeed;
      attribute float aSpeed;
      attribute float aSize;
      void main() {
        float phase = aSeed.x * 0.43 + aSeed.z * 0.67;
        vec2 swirl = vec2(
          sin(uTime * 1.45 + phase) * 0.72 + uTime * 0.35,
          cos(uTime * 1.15 + phase * 1.3) * 0.55
        );
        vec2 halfXZ = uSpan.xz * 0.5;
        vec2 relXZ = mod(aSeed.xz + swirl - uCenterXZ + halfXZ, uSpan.xz) - halfXZ + uCenterXZ;
        float wy = mod(aSeed.y - uTime * aSpeed, uSpan.y) + 0.15;
        vec4 mvPos = modelViewMatrix * vec4(relXZ.x, wy, relXZ.y, 1.0);
        gl_Position = projectionMatrix * mvPos;
        gl_PointSize = clamp(aSize * 12.0 / max(1.0, -mvPos.z), 2.2, 7.2);
      }
    `,
    fragmentShader: `
      void main() {
        float d = length(gl_PointCoord - vec2(0.5));
        if (d > 0.5) discard;
        float mask = smoothstep(0.5, 0.08, d);
        gl_FragColor = vec4(0.93, 0.96, 1.0, mask * 0.78);
      }
    `,
    transparent: true,
    depthWrite: false
  });

  const snowPoints = new THREE.Points(snowGeo, snowMat);
  snowPoints.frustumCulled = false;
  snowPoints.visible = false;
  snowPoints.userData.excludeFromGtao = true;

  group.add(rainLines, snowPoints);

  let currentMode = 'clear';
  const setMode = (mode) => {
    currentMode = mode === 'rain' || mode === 'snow' ? mode : 'clear';
    rainLines.visible = currentMode === 'rain';
    snowPoints.visible = currentMode === 'snow';
  };

  const update = (elapsed, centerX = 0, centerZ = 0) => {
    if (currentMode === 'rain') {
      rainUniforms.uTime.value = elapsed;
      rainUniforms.uCenterXZ.value.set(centerX, centerZ);
    } else if (currentMode === 'snow') {
      snowUniforms.uTime.value = elapsed;
      snowUniforms.uCenterXZ.value.set(centerX, centerZ);
    }
  };

  const dispose = () => {
    rainGeo.dispose();
    rainMat.dispose();
    snowGeo.dispose();
    snowMat.dispose();
  };

  return {
    group,
    setMode,
    getMode: () => currentMode,
    update,
    dispose
  };
}

const CinematicGradeShader = {
  uniforms: {
    tDiffuse: { value: null },
    uResolution: { value: new THREE.Vector2(1280, 720) },
    uTime: { value: 0.0 },
    uSunScreen: { value: new THREE.Vector2(0.5, 0.25) },
    uSunWeight: { value: 0.0 },
    uSunTint: { value: new THREE.Color('#ffd9a0') },
    uWeatherDim: { value: 0.0 },
    uSharpen: { value: 0.13 },
    uVignette: { value: 0.15 },
    uGrain: { value: 0.009 }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform vec2 uResolution;
    uniform float uTime;
    uniform vec2 uSunScreen;
    uniform float uSunWeight;
    uniform vec3 uSunTint;
    uniform float uWeatherDim;
    uniform float uSharpen;
    uniform float uVignette;
    uniform float uGrain;
    varying vec2 vUv;

    float gHash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    void main() {
      vec2 texel = 1.0 / max(vec2(1.0), uResolution);
      vec4 base = texture2D(tDiffuse, vUv);
      vec3 col = base.rgb;

      // 1. Деликатная 5-выборочная микрорезкость без гало-ореолов
      vec3 n = texture2D(tDiffuse, vUv + vec2(0.0, texel.y)).rgb;
      vec3 s = texture2D(tDiffuse, vUv - vec2(0.0, texel.y)).rgb;
      vec3 e = texture2D(tDiffuse, vUv + vec2(texel.x, 0.0)).rgb;
      vec3 w = texture2D(tDiffuse, vUv - vec2(texel.x, 0.0)).rgb;
      vec3 blurAvg = (n + s + e + w) * 0.25;
      float sharpAmt = uSharpen * (1.0 - uWeatherDim * 0.35);
      col = clamp(col + (col - blurAvg) * sharpAmt, 0.0, 1.0);

      // 2. Экранное атмосферное свечение солнечного рассеяния (мягкие лучи у края склонов)
      if (uSunWeight > 0.01) {
        vec2 aspectFix = vec2(uResolution.x / max(1.0, uResolution.y), 1.0);
        float sunDist = length((vUv - uSunScreen) * aspectFix);
        float scatter = exp(-sunDist * 2.6) * uSunWeight * (1.0 - uWeatherDim * 0.65);
        col = min(vec3(1.0), col + uSunTint * scatter * 0.085);
      }

      // 3. Кинематографическая цветокоррекция (холодные горные тени + тёплые света)
      float lum = dot(col, vec3(0.2126, 0.7152, 0.0722));
      vec3 shadowShift = vec3(0.97, 0.99, 1.03);
      vec3 highShift = vec3(1.02, 1.00, 0.96);
      vec3 splitTint = mix(shadowShift, highShift, smoothstep(0.18, 0.78, lum));
      col = clamp(col * mix(vec3(1.0), splitTint, 0.55 - uWeatherDim * 0.25), 0.0, 1.0);

      // При дожде или метели слегка приглушаем насыщенность и поднимаем дымку
      if (uWeatherDim > 0.01) {
        float gLum = dot(col, vec3(0.2126, 0.7152, 0.0722));
        col = mix(col, vec3(gLum), 0.14 * uWeatherDim);
      }

      // 4. Мягкое оптическое виньетирование и деликатная плёночная зернистость
      vec2 dc = vUv - 0.5;
      float vig = 1.0 - uVignette * smoothstep(0.32, 1.08, dot(dc, dc) * 2.0);
      col *= vig;

      float grain = (gHash(vUv * uResolution + fract(uTime * 13.7)) - 0.5) * uGrain;
      col = clamp(col + grain, 0.0, 1.0);

      gl_FragColor = vec4(col, base.a);
    }
  `
};

/**
 * Подключает финальный конвейер 3-го этапа строго в правильном цветовом порядке:
 * SMAAPass (linear-srgb) -> OutputPass (ToneMapping+sRGB) -> CinematicGradePass (sRGB).
 */
export function attachCinematicPostFX(composer, { width = 960, height = 540 } = {}) {
  const smaaPass = new SMAAPass();
  smaaPass.setSize(Math.max(256, Math.round(width)), Math.max(256, Math.round(height)));
  composer.addPass(smaaPass);

  const outputPass = new OutputPass();
  composer.addPass(outputPass);

  const gradePass = new ShaderPass(CinematicGradeShader);
  gradePass.uniforms.uResolution.value.set(Math.max(256, width), Math.max(256, height));
  composer.addPass(gradePass);

  const projVec = new THREE.Vector3();
  const camDirTmp = new THREE.Vector3();
  const sunWorldTmp = new THREE.Vector3();

  const update = ({ elapsed = 0, camera = null, sunDir = null, sunColor = null, weatherMode = 'clear' } = {}) => {
    const u = gradePass.uniforms;
    u.uTime.value = elapsed;
    u.uWeatherDim.value = weatherMode === 'rain' || weatherMode === 'snow' ? 1.0 : 0.0;
    if (sunColor) u.uSunTint.value.copy(sunColor);

    if (camera && sunDir) {
      camera.getWorldDirection(camDirTmp);
      const facing = camDirTmp.dot(sunDir);
      if (facing > 0.05) {
        sunWorldTmp.copy(camera.position).addScaledVector(sunDir, 80);
        projVec.copy(sunWorldTmp).project(camera);
        u.uSunScreen.value.set(projVec.x * 0.5 + 0.5, projVec.y * 0.5 + 0.5);
        u.uSunWeight.value = Math.min(1.0, (facing - 0.05) * 1.45);
      } else {
        u.uSunWeight.value = 0.0;
      }
    } else {
      u.uSunWeight.value = 0.0;
    }
  };

  const setSize = (w, h) => {
    const cw = Math.max(256, Math.round(w));
    const ch = Math.max(256, Math.round(h));
    smaaPass.setSize(cw, ch);
    gradePass.uniforms.uResolution.value.set(cw, ch);
  };

  const dispose = () => {
    smaaPass.dispose();
    outputPass.dispose();
    gradePass.dispose();
  };

  return {
    smaaPass,
    outputPass,
    gradePass,
    update,
    setSize,
    dispose
  };
}
