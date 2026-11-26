// Шейдеры, высокодетальная интерполяция рельефа NASA SRTM, CC0 фотограмметрия (Albedo/Normal/ARM),
// бесшовный внешний горный пояс и реальное облачное небо для тактических 3D-полей сражений
import * as THREE from 'three';
import { decodeSrtmHeightGrid } from '../../data/srtmReal3DData.js';

function catmullRom(p0, p1, p2, p3, t) {
  const t2 = t * t;
  const t3 = t2 * t;
  return (
    0.5 *
    (2 * p1 +
      (-p0 + p2) * t +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
      (-p0 + 3 * p1 - 3 * p2 + p3) * t3)
  );
}

function hash2D(x, z) {
  const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453123;
  return s - Math.floor(s);
}

function noise2D(x, z) {
  const ix = Math.floor(x);
  const iz = Math.floor(z);
  const fx = x - ix;
  const fz = z - iz;
  const ux = fx * fx * (3 - 2 * fx);
  const uz = fz * fz * (3 - 2 * fz);
  const a = hash2D(ix, iz);
  const b = hash2D(ix + 1, iz);
  const c = hash2D(ix, iz + 1);
  const d = hash2D(ix + 1, iz + 1);
  return a + (b - a) * ux + (c - a) * uz + (a - b - c + d) * ux * uz;
}

function ridgedFbm(x, z) {
  let sum = 0;
  let amp = 0.5;
  let freq = 1.0;
  for (let i = 0; i < 4; i++) {
    const n = 1.0 - Math.abs(noise2D(x * freq, z * freq) * 2.0 - 1.0);
    sum += n * n * amp;
    freq *= 2.12;
    amp *= 0.48;
  }
  return sum;
}

let cachedFallbackTex = null;
function getNeutralFallbackTexture() {
  if (cachedFallbackTex) return cachedFallbackTex;
  const data = new Uint8Array([128, 128, 255, 255]);
  const tx = new THREE.DataTexture(data, 1, 1, THREE.RGBAFormat);
  tx.needsUpdate = true;
  cachedFallbackTex = tx;
  return tx;
}

/**
 * Повышает детализацию 16-битной спутниковой матрицы NASA SRTM (65x65 -> 176x176)
 * с бикубической сплайн-интерполяцией Катмулла-Рома, скальной микро-эрозией и
 * инженерными террасами под сакли аула и осадные редуты Кавказского корпуса.
 */
export function buildHighResBattleHeightfield(terrainId, targetGrid = 176) {
  const { gridSize: srcN, heights: srcH } = decodeSrtmHeightGrid(terrainId);
  const isForestDefile = terrainId === 'dargo_1845';
  const heightScale =
    terrainId === 'akhulgo_1839' ? 11.8 : isForestDefile ? 7.8 : terrainId === 'gunib_1859' ? 10.6 : 9.8;

  const getSrc = (gx, gz) => {
    const cx = Math.max(0, Math.min(srcN - 1, gx));
    const cz = Math.max(0, Math.min(srcN - 1, gz));
    return srcH[cz * srcN + cx] ?? 0.4;
  };

  const sampleBicubicNorm = (u, v) => {
    const fx = u * (srcN - 1);
    const fz = v * (srcN - 1);
    const ix = Math.floor(fx);
    const iz = Math.floor(fz);
    const tx = fx - ix;
    const tz = fz - iz;

    const col = [0, 0, 0, 0];
    for (let dz = -1; dz <= 2; dz++) {
      col[dz + 1] = catmullRom(
        getSrc(ix - 1, iz + dz),
        getSrc(ix, iz + dz),
        getSrc(ix + 1, iz + dz),
        getSrc(ix + 2, iz + dz),
        tx
      );
    }
    return Math.max(0.02, Math.min(1.05, catmullRom(col[0], col[1], col[2], col[3], tz)));
  };

  const outHeights = new Float32Array(targetGrid * targetGrid);

  for (let gz = 0; gz < targetGrid; gz++) {
    const v = gz / (targetGrid - 1);
    const wz = -17 + v * 34;
    for (let gx = 0; gx < targetGrid; gx++) {
      const u = gx / (targetGrid - 1);
      const wx = -17 + u * 34;

      let h = sampleBicubicNorm(u, v) * heightScale;

      const ridgeDetail = (ridgedFbm(wx * 0.28 + 3.1, wz * 0.28 - 1.7) - 0.45) * 0.62;
      const fineCrag = (noise2D(wx * 1.15, wz * 1.15) - 0.5) * 0.18;
      const heightFactor = Math.max(0, Math.min(1, (h - 1.5) / 5.0));
      h += (ridgeDetail + fineCrag) * heightFactor;

      if (!isForestDefile) {
        const riverCenter = 0.45 + Math.sin(wz * 0.22) * 1.05;
        const distToRiver = Math.abs(wx - riverCenter);
        if (distToRiver < 2.6) {
          const carve = Math.cos((distToRiver / 2.6) * (Math.PI * 0.5));
          h = Math.min(h, 0.72 + (1 - carve * carve) * Math.max(0.5, h - 0.72));
        }
      }

      const distRedoubt = Math.hypot((wx - 7.8) * 0.85, wz * 0.62);
      if (distRedoubt < 2.9 && !isForestDefile) {
        const flatBlend = Math.max(0, 1 - distRedoubt / 2.9);
        const targetPad = sampleBicubicNorm((7.8 + 17) / 34, 0.5) * heightScale;
        h = h * (1 - flatBlend * 0.68) + targetPad * (flatBlend * 0.68);
      }

      const distCitadel = Math.hypot((wx + 5.5) * 0.9, (wz + 0.3) * 0.75);
      if (distCitadel < 2.4 && !isForestDefile) {
        const cBlend = Math.max(0, 1 - distCitadel / 2.4);
        const targetCit = sampleBicubicNorm((-5.5 + 17) / 34, (-0.3 + 17) / 34) * heightScale + 0.32;
        h = h * (1 - cBlend * 0.62) + targetCit * (cBlend * 0.62);
      }

      outHeights[gz * targetGrid + gx] = Math.max(0.38, h);
    }
  }

  const sampleHeightAt = (wx, wz) => {
    const u = Math.max(0, Math.min(1, (wx + 17) / 34));
    const v = Math.max(0, Math.min(1, (wz + 17) / 34));
    const fx = u * (targetGrid - 1);
    const fz = v * (targetGrid - 1);
    const ix = Math.min(targetGrid - 2, Math.floor(fx));
    const iz = Math.min(targetGrid - 2, Math.floor(fz));
    const tx = fx - ix;
    const tz = fz - iz;
    const h00 = outHeights[iz * targetGrid + ix];
    const h10 = outHeights[iz * targetGrid + ix + 1];
    const h01 = outHeights[(iz + 1) * targetGrid + ix];
    const h11 = outHeights[(iz + 1) * targetGrid + ix + 1];
    const hx0 = h00 + (h10 - h00) * tx;
    const hx1 = h01 + (h11 - h01) * tx;
    return hx0 + (hx1 - hx0) * tz;
  };

  return {
    gridSize: targetGrid,
    heights: outHeights,
    heightScale,
    isForestDefile,
    sampleHeightAt
  };
}

/**
 * Подключает к MeshStandardMaterial трипланарный PBR-шейдер горного поля боя
 * с реальными скан-текстурами CC0 фотограмметрии (скалы, дёрн, грязь, нормали, шероховатость).
 */
export function applyBattleTerrainPBRShader(
  material,
  { heightScale = 9.8, isForest = false, pbrPack = null } = {}
) {
  const fb = getNeutralFallbackTexture();
  const hasMaps = pbrPack ? 1.0 : 0.0;

  material.onBeforeCompile = (shader) => {
    shader.uniforms.uHeightScale = { value: heightScale };
    shader.uniforms.uIsForest = { value: isForest ? 1.0 : 0.0 };
    shader.uniforms.uHasPbrMaps = { value: hasMaps };
    shader.uniforms.uRockDiff = { value: pbrPack?.rockDiff || fb };
    shader.uniforms.uRockNor = { value: pbrPack?.rockNor || fb };
    shader.uniforms.uRockArm = { value: pbrPack?.rockArm || fb };
    shader.uniforms.uGrassDiff = { value: pbrPack?.grassDiff || fb };
    shader.uniforms.uGrassNor = { value: pbrPack?.grassNor || fb };
    shader.uniforms.uMudDiff = { value: pbrPack?.mudDiff || fb };
    shader.uniforms.uMudNor = { value: pbrPack?.mudNor || fb };

    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
        varying vec3 vBattleWorldPos;
        varying vec3 vBattleObjNormal;
        varying vec3 vBattleViewX;
        varying vec3 vBattleViewY;
        varying vec3 vBattleViewZ;`
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        vBattleWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
        vBattleObjNormal = normalize(mat3(modelMatrix) * normal);
        vBattleViewX = normalize((viewMatrix * vec4(1.0, 0.0, 0.0, 0.0)).xyz);
        vBattleViewY = normalize((viewMatrix * vec4(0.0, 1.0, 0.0, 0.0)).xyz);
        vBattleViewZ = normalize((viewMatrix * vec4(0.0, 0.0, 1.0, 0.0)).xyz);`
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
        uniform float uHeightScale;
        uniform float uIsForest;
        uniform float uHasPbrMaps;
        uniform sampler2D uRockDiff;
        uniform sampler2D uRockNor;
        uniform sampler2D uRockArm;
        uniform sampler2D uGrassDiff;
        uniform sampler2D uGrassNor;
        uniform sampler2D uMudDiff;
        uniform sampler2D uMudNor;
        varying vec3 vBattleWorldPos;
        varying vec3 vBattleObjNormal;
        varying vec3 vBattleViewX;
        varying vec3 vBattleViewY;
        varying vec3 vBattleViewZ;

        float bHash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
        }
        float bNoise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(
            mix(bHash(i), bHash(i + vec2(1.0, 0.0)), u.x),
            mix(bHash(i + vec2(0.0, 1.0)), bHash(i + vec2(1.0, 1.0)), u.x),
            u.y
          );
        }
        float bFbm(vec2 p) {
          float v = 0.0;
          float a = 0.5;
          mat2 rot = mat2(0.8, -0.6, 0.6, 0.8);
          for (int i = 0; i < 4; i++) {
            v += a * bNoise(p);
            p = rot * p * 2.07;
            a *= 0.5;
          }
          return v;
        }
        float triplanarRock(vec3 wp, vec3 wn) {
          vec3 bw = pow(abs(wn), vec3(4.0));
          bw /= max(0.0001, bw.x + bw.y + bw.z);
          float sx = bFbm(vec2(wp.z * 0.85, wp.y * 1.45));
          float sy = bFbm(wp.xz * 0.75);
          float sz = bFbm(vec2(wp.x * 0.85, wp.y * 1.45));
          return sx * bw.x + sy * bw.y + sz * bw.z;
        }
        vec3 sampleDualScaleColor(sampler2D tex, vec2 uv) {
          vec3 a = texture2D(tex, uv).rgb;
          vec2 uvRot = mat2(0.8, -0.6, 0.6, 0.8) * (uv * 0.37) + vec2(0.41, 0.17);
          vec3 b = texture2D(tex, uvRot).rgb;
          float mixW = smoothstep(0.24, 0.76, bNoise(uv * 0.42));
          return mix(a, b, mixW);
        }
        vec2 sampleDualScaleNormalXY(sampler2D norTex, vec2 uv) {
          vec2 a = texture2D(norTex, uv).xy * 2.0 - 1.0;
          vec2 uvRot = mat2(0.8, -0.6, 0.6, 0.8) * (uv * 0.37) + vec2(0.41, 0.17);
          vec2 b = texture2D(norTex, uvRot).xy * 2.0 - 1.0;
          vec2 bUnrot = mat2(0.8, 0.6, -0.6, 0.8) * b;
          float mixW = smoothstep(0.24, 0.76, bNoise(uv * 0.42));
          return mix(a, bUnrot, mixW);
        }
        vec3 sampleTriplanarColor(sampler2D tex, vec3 wp, vec3 wn, float sc) {
          vec3 bw = pow(abs(wn), vec3(4.0));
          bw /= max(0.0001, bw.x + bw.y + bw.z);
          vec3 cx = texture2D(tex, vec2(wp.z * sc, wp.y * sc)).rgb;
          vec3 cy = texture2D(tex, wp.xz * sc).rgb;
          vec3 cz = texture2D(tex, vec2(wp.x * sc, wp.y * sc)).rgb;
          return cx * bw.x + cy * bw.y + cz * bw.z;
        }
        vec3 sampleTriplanarWorldBump(sampler2D norTex, vec3 wp, vec3 wn, float sc) {
          vec3 bw = pow(abs(wn), vec3(4.0));
          bw /= max(0.0001, bw.x + bw.y + bw.z);
          vec2 nx = texture2D(norTex, vec2(wp.z * sc, wp.y * sc)).xy * 2.0 - 1.0;
          vec2 ny = texture2D(norTex, wp.xz * sc).xy * 2.0 - 1.0;
          vec2 nz = texture2D(norTex, vec2(wp.x * sc, wp.y * sc)).xy * 2.0 - 1.0;
          vec3 wx = vec3(0.0, nx.y, nx.x);
          vec3 wy = vec3(ny.x, 0.0, -ny.y);
          vec3 wz = vec3(nz.x, nz.y, 0.0);
          return wx * bw.x + wy * bw.y + wz * bw.z;
        }`
      )
      .replace(
        '#include <map_fragment>',
        `
        vec3 wp = vBattleWorldPos;
        vec3 wn = normalize(vBattleObjNormal);
        float slope = 1.0 - clamp(wn.y, 0.0, 1.0);
        float hNorm = clamp(wp.y / max(1.0, uHeightScale), 0.0, 1.15);

        float macroN = bFbm(wp.xz * 0.18);
        float detailN = bFbm(wp.xz * 1.15);
        float fineN = bNoise(wp.xz * 4.8);
        float rockPattern = triplanarRock(wp, wn);

        vec3 lushGrass = mix(vec3(0.16, 0.25, 0.11), vec3(0.26, 0.34, 0.15), macroN);
        vec3 cliffCol = mix(vec3(0.24, 0.22, 0.20), vec3(0.50, 0.45, 0.37), smoothstep(0.22, 0.78, rockPattern));
        vec3 mudEarth = mix(vec3(0.24, 0.18, 0.12), vec3(0.35, 0.28, 0.20), detailN);
        float rockAO = 1.0;

        if (uHasPbrMaps > 0.5) {
          vec3 scanGrass = sampleDualScaleColor(uGrassDiff, wp.xz * 0.22);
          vec3 scanMud = sampleDualScaleColor(uMudDiff, wp.xz * 0.26);
          vec3 scanRock = sampleTriplanarColor(uRockDiff, wp, wn, 0.24);
          vec3 rockArmVal = sampleTriplanarColor(uRockArm, wp, wn, 0.24);
          rockAO = mix(0.66, 1.08, rockArmVal.r);

          // Подгоняем оттенок фотосканов под Кавказ: оливково-альпийский дёрн и тёплый дагестанский известняк
          lushGrass = mix(scanGrass, scanGrass * vec3(0.86, 0.96, 0.76), macroN * 0.65);
          if (uIsForest > 0.5) {
            lushGrass = mix(scanGrass * vec3(0.76, 0.88, 0.66), scanMud * vec3(0.92, 0.96, 0.84), macroN * 0.35);
          }
          cliffCol = mix(scanRock * vec3(0.98, 0.92, 0.84), scanRock * vec3(1.16, 1.08, 0.96), macroN);
          mudEarth = scanMud * vec3(0.96, 0.90, 0.82);
        }

        float distRedoubt = length((wp.xz - vec2(7.8, 0.0)) * vec2(0.65, 0.55));
        float distSap = exp(-pow((wp.x - 4.2) * 0.38, 2.0) - pow(wp.z * 0.55, 2.0));
        float distAul = length((wp.xz - vec2(-5.6, -0.4)) * vec2(0.6, 0.55));
        float earthMask = clamp(
          smoothstep(3.4, 1.1, distRedoubt) * 0.88 +
          distSap * 0.72 +
          smoothstep(3.6, 1.2, distAul) * 0.75,
          0.0,
          1.0
        );
        if (uIsForest > 0.5) {
          float roadZ = sin(wp.x * 0.24) * 2.8 + cos(wp.x * 0.11) * 1.2;
          float roadDist = abs(wp.z - roadZ);
          earthMask = clamp(smoothstep(2.05, 0.55, roadDist) * smoothstep(24.0, 17.0, abs(wp.x)), 0.0, 1.0);
        }

        float craterField = smoothstep(0.74, 0.92, bNoise(wp.xz * 2.3 + vec2(4.1, 1.7))) *
                            smoothstep(5.5, 1.8, length(wp.xz - vec2(-2.2, 0.2)));
        mudEarth = mix(mudEarth, vec3(0.11, 0.09, 0.08), craterField * 0.75);

        float cliffMask = smoothstep(0.16, 0.38, slope + (rockPattern - 0.5) * 0.12);
        vec3 col = mix(lushGrass, mudEarth, earthMask * (1.0 - cliffMask * 0.55));
        col = mix(col, cliffCol, cliffMask);

        float shoreMask = 1.0 - smoothstep(1.12, 1.95, wp.y);
        col = mix(col, vec3(0.27, 0.25, 0.22) * (0.85 + 0.3 * fineN), shoreMask * 0.65);

        float snowMask = smoothstep(0.95, 1.15, hNorm + detailN * 0.05 - slope * 0.42) * (1.0 - uIsForest);
        col = mix(col, vec3(0.87, 0.91, 0.96), snowMask);

        float gorgeAO = mix(0.76, 1.0, smoothstep(0.8, 3.6, wp.y));
        col *= gorgeAO * mix(1.0, rockAO, cliffMask);

        diffuseColor.rgb = col;
        `
      )
      .replace(
        '#include <roughnessmap_fragment>',
        `#include <roughnessmap_fragment>
        float rSlope = 1.0 - clamp(normalize(vBattleObjNormal).y, 0.0, 1.0);
        float rCliff = smoothstep(0.16, 0.38, rSlope);
        float rRough = 0.90;
        if (uHasPbrMaps > 0.5) {
          float rockG = sampleTriplanarColor(uRockArm, vBattleWorldPos, normalize(vBattleObjNormal), 0.24).g;
          rRough = mix(0.90, clamp(rockG * 1.06, 0.72, 0.96), rCliff);
          if (uIsForest > 0.5) {
            float roadZ = sin(vBattleWorldPos.x * 0.24) * 2.8 + cos(vBattleWorldPos.x * 0.11) * 1.2;
            float mudW = smoothstep(2.0, 0.5, abs(vBattleWorldPos.z - roadZ));
            rRough = mix(rRough, 0.54, mudW * 0.78);
          }
        } else {
          rRough = mix(0.90, 0.78, rCliff);
        }
        roughnessFactor = rRough;`
      )
      .replace(
        '#include <normal_fragment_maps>',
        `#include <normal_fragment_maps>
        vec3 bWn = normalize(vBattleObjNormal);
        float bSlope = 1.0 - clamp(bWn.y, 0.0, 1.0);
        float bCliff = smoothstep(0.16, 0.38, bSlope);
        vec3 worldPerturb = vec3(0.0);
        if (uHasPbrMaps > 0.5) {
          vec2 gN = sampleDualScaleNormalXY(uGrassNor, vBattleWorldPos.xz * 0.22);
          vec2 mN = sampleDualScaleNormalXY(uMudNor, vBattleWorldPos.xz * 0.26);
          float mixMud = 0.0;
          if (uIsForest > 0.5) {
            float roadZ = sin(vBattleWorldPos.x * 0.24) * 2.8 + cos(vBattleWorldPos.x * 0.11) * 1.2;
            mixMud = smoothstep(2.05, 0.55, abs(vBattleWorldPos.z - roadZ));
          }
          vec2 flatN = mix(gN, mN, mixMud);
          vec3 flatWorld = vec3(flatN.x, 0.0, -flatN.y) * 0.42;
          vec3 cliffWorld = sampleTriplanarWorldBump(uRockNor, vBattleWorldPos, bWn, 0.24) * 0.74;
          worldPerturb = mix(flatWorld, cliffWorld, bCliff);
        } else {
          float microH = triplanarRock(vBattleWorldPos * 2.1, bWn) * 0.35;
          worldPerturb = vec3(microH - 0.18, 0.0, microH - 0.18) * 0.12;
        }
        vec3 viewPerturb = vBattleViewX * worldPerturb.x + vBattleViewY * worldPerturb.y + vBattleViewZ * worldPerturb.z;
        normal = normalize(normal + viewPerturb);`
      );
  };
  material.customProgramCacheKey = () =>
    `imamat_battle_pbr_${isForest ? 'forest' : 'gorge'}_${pbrPack ? 'scan' : 'proc'}_v3`;
  return material;
}

/**
 * Создаёт купол неба с реальной фотографической облачностью CC0 Pure Sky
 * и плавным переходом День / Закат / Ночь.
 */
export function createPhotorealSkyDome(pbrPack = null) {
  const fb = getNeutralFallbackTexture();
  const skyGeo = new THREE.SphereGeometry(225, 48, 28);
  const skyUniforms = {
    uSkyTex: { value: pbrPack?.skyEquirectTex || fb },
    uHasSkyTex: { value: pbrPack?.skyEquirectTex ? 1.0 : 0.0 },
    uHorizonColor: { value: new THREE.Color('#9ec2dc') },
    uTintColor: { value: new THREE.Color('#ffffff') },
    uNightFactor: { value: 0.0 }
  };
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    uniforms: skyUniforms,
    vertexShader: `
      varying vec3 vSkyDir;
      void main() {
        vSkyDir = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D uSkyTex;
      uniform float uHasSkyTex;
      uniform vec3 uHorizonColor;
      uniform vec3 uTintColor;
      uniform float uNightFactor;
      varying vec3 vSkyDir;

      float sHash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }

      void main() {
        vec3 d = normalize(vSkyDir);
        float u = atan(d.z, d.x) / 6.28318530718 + 0.5;
        float v = asin(clamp(d.y, -1.0, 1.0)) / 3.14159265359 + 0.5;
        vec3 col = uHorizonColor;
        if (uHasSkyTex > 0.5) {
          col = texture2D(uSkyTex, vec2(u, clamp(v, 0.02, 0.98))).rgb;
        } else {
          col = mix(uHorizonColor, vec3(0.14, 0.34, 0.58), smoothstep(0.0, 0.65, max(0.0, d.y)));
        }
        col *= uTintColor;

        // Звёзды ночью
        if (uNightFactor > 0.05 && d.y > 0.06) {
          vec2 starUv = floor(d.xz / max(0.24, d.y + 0.16) * 185.0);
          float sh = sHash(starUv);
          if (sh > 0.994) {
            float twinkle = (sh - 0.994) * 165.0;
            col += vec3(0.75, 0.85, 1.0) * twinkle * uNightFactor * smoothstep(0.06, 0.35, d.y);
          }
        }

        // Мягкая дымка у линии горизонта для бесшовного стыка с далёкими хребтами
        float horizMix = 1.0 - smoothstep(0.01, 0.16, d.y);
        col = mix(col, uHorizonColor, horizMix * 0.72);
        gl_FragColor = vec4(col, 1.0);
      }
    `
  });
  const skyMesh = new THREE.Mesh(skyGeo, skyMat);
  return { skyMesh, skyUniforms };
}

/**
 * Создаёт бесшовное продолжение горной долины и хребтов Кавказа за пределами
 * игровой площадки, чтобы полностью убрать обрыв рельефа и пустоту на горизонте.
 */
export function createSeamlessOuterValley({
  innerHalfW = 17,
  innerHalfD = 17,
  sampleEdgeHeight,
  isForest = false,
  pbrPack = null
}) {
  const sideSegs = 96;
  const perimSegs = sideSegs * 4;
  const cols = perimSegs + 1;
  const radialSegs = 44;
  const rows = radialSegs + 1;
  const outerMaxSpan = Math.max(0, 135 - Math.max(innerHalfW, innerHalfD));

  const vertCount = rows * cols;
  const positions = new Float32Array(vertCount * 3);
  const uvs = new Float32Array(vertCount * 2);
  const indices = new Uint32Array(radialSegs * perimSegs * 6);

  const unitPerim = (sIdx) => {
    const wrapped = sIdx % perimSegs;
    const side = Math.floor(wrapped / sideSegs);
    const t = (wrapped % sideSegs) / sideSegs;
    if (side === 0) return [-1 + 2 * t, 1];
    if (side === 1) return [1, 1 - 2 * t];
    if (side === 2) return [1 - 2 * t, -1];
    return [-1, -1 + 2 * t];
  };

  let vPtr = 0;
  let uvPtr = 0;
  for (let r = 0; r < rows; r++) {
    const isLip = r === 0;
    const isSeam = r === 1;
    const uOut = r <= 1 ? 0 : (r - 1) / (radialSegs - 1);
    const pad = isLip ? -0.06 : isSeam ? 0.0 : Math.pow(uOut, 1.42) * outerMaxSpan;

    for (let s = 0; s < cols; s++) {
      const [ux, uz] = unitPerim(s);
      const wx = ux * (innerHalfW + pad);
      const wz = uz * (innerHalfD + pad);

      const ex = Math.max(-innerHalfW, Math.min(innerHalfW, wx));
      const ez = Math.max(-innerHalfD, Math.min(innerHalfD, wz));
      const edgeY = sampleEdgeHeight ? sampleEdgeHeight(ex, ez) : 1.5;

      let y;
      if (isLip) {
        y = edgeY - 0.08;
      } else if (isSeam) {
        y = edgeY - 0.015;
      } else {
        const dx = Math.max(0, Math.abs(wx) - innerHalfW);
        const dz = Math.max(0, Math.abs(wz) - innerHalfD);
        const distOut = Math.hypot(dx, dz);
        const grow = Math.min(1, distOut / 24.0);
        const smoothGrow = grow * grow * (3 - 2 * grow);
        const ridge = ridgedFbm(wx * 0.036 + 4.7, wz * 0.036 - 2.3);
        const detail = (noise2D(wx * 0.14, wz * 0.14) - 0.5) * 1.4;
        const valleyPass = isForest
          ? Math.exp(-Math.pow(wz / 15.0, 2.0)) * 0.55
          : Math.exp(-Math.pow((wx - 0.5) / 11.5, 2.0)) * 0.62;
        const mountainGain = ((ridge - 0.26) * (isForest ? 18.0 : 24.0) + detail) * (1.0 - valleyPass);
        y = Math.max(0.25, edgeY - 0.015 + mountainGain * smoothGrow + smoothGrow * (isForest ? 2.4 : 3.2));
      }

      positions[vPtr++] = wx;
      positions[vPtr++] = y;
      positions[vPtr++] = wz;
      uvs[uvPtr++] = (wx + 135) / 270;
      uvs[uvPtr++] = (wz + 135) / 270;
    }
  }

  let iPtr = 0;
  for (let r = 0; r < radialSegs; r++) {
    for (let s = 0; s < perimSegs; s++) {
      const i00 = r * cols + s;
      const i01 = i00 + 1;
      const i10 = (r + 1) * cols + s;
      const i11 = i10 + 1;
      indices[iPtr++] = i00;
      indices[iPtr++] = i10;
      indices[iPtr++] = i01;
      indices[iPtr++] = i10;
      indices[iPtr++] = i11;
      indices[iPtr++] = i01;
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geo.setIndex(new THREE.BufferAttribute(indices, 1));
  geo.computeVertexNormals();

  const mat = applyBattleTerrainPBRShader(
    new THREE.MeshStandardMaterial({
      color: '#ffffff',
      roughness: 0.92,
      metalness: 0.02,
      fog: true
    }),
    { heightScale: 12.2, isForest, pbrPack }
  );

  const mesh = new THREE.Mesh(geo, mat);
  mesh.receiveShadow = true;
  return mesh;
}

/**
 * Объёмный GLSL-материал бурной горной кавказской реки (Койсу / Салтинка) и ручья Ичкерии:
 * 3D-волнение поверхности, преломление галечного дна CC0, поглощение Бера–Ламберта,
 * отражение облачного неба и V-образные буруны за опорами каменного моста.
 */
export function createCanyonRiverMaterial(
  clippingPlanes = [],
  { pbrPack = null, isStream = false, bridgePos = new THREE.Vector2(0.45, 1.8) } = {}
) {
  const fb = getNeutralFallbackTexture();
  const hasPbr = Boolean(pbrPack?.rockDiff);
  const skyReady = Boolean(
    pbrPack?.skyEquirectTex?.image?.complete && pbrPack?.skyEquirectTex?.image?.naturalWidth > 0
  );
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    clippingPlanes,
    clipping: clippingPlanes.length > 0,
    uniforms: {
      uTime: { value: 0 },
      uSunDir: { value: new THREE.Vector3(0.45, 0.78, 0.42).normalize() },
      uSunColor: { value: new THREE.Color('#fff3d1') },
      uDeepColor: { value: new THREE.Color('#092530') },
      uShallowColor: { value: new THREE.Color('#1c6074') },
      uIsStream: { value: isStream ? 1.0 : 0.0 },
      uBridgePos: { value: bridgePos },
      uHasPbr: { value: hasPbr ? 1.0 : 0.0 },
      uRockDiff: { value: hasPbr ? pbrPack.rockDiff : fb },
      uHasSky: { value: skyReady ? 1.0 : 0.0 },
      uSkyTex: { value: pbrPack?.skyEquirectTex || fb }
    },
    vertexShader: `
      #include <common>
      #include <clipping_planes_pars_vertex>
      uniform float uTime;
      varying vec3 vWorldPos;
      varying vec2 vRiverUv;
      void main() {
        vRiverUv = uv;
        vec3 displaced = position;
        vec4 worldPre = modelMatrix * vec4(displaced, 1.0);
        float swell = sin(worldPre.x * 2.9 + uTime * 3.1) * cos(worldPre.z * 2.2 - uTime * 2.6);
        displaced.y += swell * 0.022;
        vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
        vWorldPos = (modelMatrix * vec4(displaced, 1.0)).xyz;
        gl_Position = projectionMatrix * mvPosition;
        #include <clipping_planes_vertex>
      }
    `,
    fragmentShader: `
      #include <common>
      #include <clipping_planes_pars_fragment>
      uniform float uTime;
      uniform vec3 uSunDir;
      uniform vec3 uSunColor;
      uniform vec3 uDeepColor;
      uniform vec3 uShallowColor;
      uniform float uIsStream;
      uniform vec2 uBridgePos;
      uniform float uHasPbr;
      uniform sampler2D uRockDiff;
      uniform float uHasSky;
      uniform sampler2D uSkyTex;
      varying vec3 vWorldPos;
      varying vec2 vRiverUv;

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
        #include <clipping_planes_fragment>
        vec2 flowUv1 = uIsStream > 0.5
          ? vec2(vWorldPos.x * 1.4 - uTime * 1.9, vWorldPos.z * 2.1)
          : vec2(vWorldPos.x * 1.8, vWorldPos.z * 1.15 - uTime * 2.05);
        vec2 flowUv2 = uIsStream > 0.5
          ? vec2(vWorldPos.x * 2.8 - uTime * 2.6, vWorldPos.z * 3.6 + 1.1)
          : vec2(vWorldPos.x * 3.4 + 1.3, vWorldPos.z * 2.35 - uTime * 2.85);
        float n1 = wNoise(flowUv1);
        float n2 = wNoise(flowUv2);
        float wave = n1 * 0.58 + n2 * 0.42;

        vec3 norm = normalize(vec3((n1 - 0.5) * 0.58, 1.0, (n2 - 0.5) * 0.58));
        vec3 viewDir = normalize(cameraPosition - vWorldPos);
        float ndv = max(0.0, dot(viewDir, norm));
        float fresnel = 0.04 + 0.96 * pow(1.0 - ndv, 3.8);

        // Оценка глубины и ширины русла (каньон или лесной ручей)
        float centerFactor = 0.7;
        float bankFoam = 0.0;
        if (uIsStream > 0.5) {
          float sEdge = min(vRiverUv.y, 1.0 - vRiverUv.y) * 2.0;
          centerFactor = smoothstep(0.0, 0.85, sEdge);
          bankFoam = (1.0 - smoothstep(0.08, 0.42, sEdge)) * 0.46;
        } else {
          float riverAxis = 0.45 + sin(vWorldPos.z * 0.22) * 1.05;
          float bankDist = abs(vWorldPos.x - riverAxis);
          centerFactor = smoothstep(2.0, 0.2, bankDist);
          bankFoam = smoothstep(0.65, 1.75, bankDist) * 0.42;
        }

        // Преломление галечного русла под прозрачными мелководьями + Бера–Ламберт
        vec3 bedCol = vec3(0.24, 0.22, 0.18);
        if (uHasPbr > 0.5) {
          bedCol = texture2D(uRockDiff, vWorldPos.xz * 0.48 + norm.xz * 0.12).rgb * vec3(0.82, 0.86, 0.78);
        }
        float depth = centerFactor * 1.25;
        vec3 beerLambert = exp(-depth * vec3(2.35, 0.92, 0.72));
        vec3 glacialCol = mix(uShallowColor, uDeepColor, clamp(centerFactor * 0.85 + wave * 0.18, 0.0, 1.0));
        vec3 waterCol = mix(glacialCol, bedCol, beerLambert * 0.88);

        // Отражение облачного неба Pure Sky по Френелю
        vec3 skyRefl = vec3(0.56, 0.74, 0.88);
        if (uHasSky > 0.5) {
          vec3 reflDir = reflect(-viewDir, norm);
          float ru = atan(reflDir.z, reflDir.x) / 6.28318530718 + 0.5;
          float rv = asin(clamp(reflDir.y, -1.0, 1.0)) / 3.14159265359 + 0.5;
          skyRefl = texture2D(uSkyTex, vec2(ru, rv)).rgb;
        }
        waterCol = mix(waterCol, skyRefl, fresnel * 0.65);

        // V-образный бурун за опорами каменного моста через Койсу + пенные перекаты
        float bridgeWake = 0.0;
        if (uIsStream < 0.5) {
          float bdz = vWorldPos.z - uBridgePos.y;
          float bdx = abs(vWorldPos.x - uBridgePos.x);
          if (bdz > -0.35 && bdz < 4.6) {
            float armDistL = abs(bdx - (0.52 + max(0.0, bdz) * 0.16));
            float wakeLine = exp(-pow(armDistL / 0.24, 2.0)) * (1.0 - smoothstep(1.2, 4.6, bdz));
            bridgeWake = wakeLine * 0.62;
          }
        }

        float rapids = smoothstep(0.56, 0.86, wave + bankFoam + bridgeWake * 0.75);
        waterCol = mix(waterCol, vec3(0.86, 0.92, 0.96), rapids * 0.68);

        vec3 halfVec = normalize(uSunDir + viewDir);
        float spec = pow(max(0.0, dot(norm, halfVec)), 72.0);
        waterCol += uSunColor * spec * 0.88;

        float alpha = mix(0.68, 0.94, 1.0 - beerLambert.r * 0.62);
        if (uIsStream > 0.5) {
          alpha *= smoothstep(0.0, 0.16, min(vRiverUv.y, 1.0 - vRiverUv.y) * 2.0);
        }
        gl_FragColor = vec4(waterCol, alpha);
      }
    `
  });
  return mat;
}

/**
 * Геологическая текстура осадочных пластов известняка, песчаника и тёмного сланца
 * для фронтальной стены разреза Д. А. Милютина.
 */
export function createGeologicalStrataCanvas() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const grad = ctx.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0.0, '#6b5c4c');
  grad.addColorStop(0.28, '#52463b');
  grad.addColorStop(0.62, '#3a322c');
  grad.addColorStop(1.0, '#1e1916');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 256);

  const bandColors = [
    'rgba(180, 162, 138, 0.26)',
    'rgba(42, 36, 32, 0.42)',
    'rgba(146, 108, 72, 0.24)',
    'rgba(87, 83, 78, 0.32)',
    'rgba(28, 25, 23, 0.48)'
  ];
  for (let b = 0; b < 26; b++) {
    const baseY = (b / 26) * 256;
    ctx.beginPath();
    ctx.moveTo(0, baseY);
    for (let x = 0; x <= 512; x += 16) {
      const wy =
        baseY +
        Math.sin(x * 0.018 + b * 0.4) * 7 +
        Math.cos(x * 0.045 - b) * 3;
      ctx.lineTo(x, wy);
    }
    ctx.strokeStyle = bandColors[b % bandColors.length];
    ctx.lineWidth = 3 + (b % 4) * 2.2;
    ctx.stroke();
  }

  ctx.strokeStyle = 'rgba(18, 15, 13, 0.35)';
  ctx.lineWidth = 1.2;
  for (let f = 0; f < 38; f++) {
    let fx = ((f * 47) % 500) + 6;
    let fy = (f * 29) % 180;
    ctx.beginPath();
    ctx.moveTo(fx, fy);
    for (let s = 0; s < 5; s++) {
      fx += ((f + s) % 3 - 1) * 5;
      fy += 14;
      ctx.lineTo(fx, fy);
    }
    ctx.stroke();
  }
  return canvas;
}

export function createSoftSmokeCanvas() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  const g = ctx.createRadialGradient(64, 64, 4, 64, 64, 62);
  g.addColorStop(0.0, 'rgba(255, 255, 255, 0.95)');
  g.addColorStop(0.38, 'rgba(241, 245, 249, 0.58)');
  g.addColorStop(0.72, 'rgba(203, 213, 225, 0.18)');
  g.addColorStop(1.0, 'rgba(148, 163, 184, 0.0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  return canvas;
}

export function createGorgeStrataBumpCanvas() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 256, 256);

  for (let y = 0; y < 256; y += 2) {
    const wave = Math.round(124 + Math.sin(y * 0.14) * 28 + Math.cos(y * 0.37) * 14);
    ctx.fillStyle = `rgb(${wave},${wave},${wave})`;
    ctx.fillRect(0, y, 256, 2);
  }

  for (let i = 0; i < 420; i++) {
    const gx = (i * 73) % 256;
    const gy = (i * 139) % 256;
    const lum = i % 2 === 0 ? 185 : 72;
    ctx.fillStyle = `rgba(${lum},${lum},${lum},0.35)`;
    ctx.fillRect(gx, gy, 3 + (i % 4), 2 + (i % 3));
  }
  return canvas;
}
