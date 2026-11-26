// Аппаратное 3D-поле лесной засады в Ичкерии (Three.js WebGL2 + NASA SRTM 152x152 + Triplanar PBR + Bloom):
// вековой буковый лес на хребте Речель (июль 1845 г.), извилистая лесная дорога к Дарго, поваленные буковые засеки,
// растянутый сухарный обоз и колонны пехоты РИ, перекрёстный штуцерный огонь мюридов с обоих лесистых гребней.
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { attachCleanGtaoPass, loadCaucasusPbrPack } from '../../data/caucasusPbrTextures.js';
import {
  playSpatialBattleSound,
  suspendSpatialBattleAudio,
  unlockSpatialBattleAudio,
  updateSpatialBattleScape
} from '../../game/audio.js';
import {
  attachCinematicPostFX,
  createBillowingSmokeTexture,
  createBlackPowderSmokeSystem,
  createCaucasusPrecipitationSystem,
  createLayeredValleyMistTexture
} from '../shared/caucasusAtmosphereAndPostFX.js';
import {
  applyAnimatedTroopShader,
  createTroopAnimUniforms,
  updateGlbArticulation
} from '../shared/caucasusTroopAnimation3D.js';
import {
  attachUnified3DTouchControls,
  createFpsGovernor,
  detectMobileDeviceProfile
} from '../shared/caucasusMobileTouchAndPerf.js';
import {
  createPhotorealGoldenEagleInstance,
  disposePhotorealEagleInstance,
  updatePhotorealGoldenEagle
} from '../shared/caucasusPhotorealEagles3D.js';
import {
  createPhotorealCavalryInstance,
  disposePhotorealCavalryInstance
} from '../shared/caucasusPhotorealCavalry3D.js';
import {
  createPhotorealSupplyWagonInstance,
  createPhotorealUnicornCannonInstance,
  disposePhotorealCorpsInstance
} from '../shared/caucasusPhotorealColumnsArtillery3D.js';
import {
  createBeechFoliageAtlasTexture,
  createConiferBoughAtlasTexture,
  createFernUndergrowthTexture,
  createFoliageCardMaterial,
  createImperialSoldierGeometrySet,
  createMuridWarriorGeometrySet,
  createRealisticBeechCanopyGeometry,
  createRealisticConiferGeometry,
  createRealisticTrunkGeometry,
  createUndergrowthBushGeometry
} from '../shared/caucasusFoliageAndUnits3D.js';
import {
  applyBattleTerrainPBRShader,
  buildHighResBattleHeightfield,
  createCanyonRiverMaterial,
  createGorgeStrataBumpCanvas,
  createPhotorealSkyDome,
  createSeamlessOuterValley
} from './tacticalBattle3DShaders.js';

const SECTOR_WORLD_X = [-11.2, -5.6, 0.0, 5.6, 11.2];

function sampleRoadZ(wx) {
  return Math.sin(wx * 0.24) * 2.8 + Math.cos(wx * 0.11) * 1.2;
}

function sampleRoadTangentAngle(wx) {
  const dzDx = Math.cos(wx * 0.24) * 0.24 * 2.8 - Math.sin(wx * 0.11) * 0.11 * 1.2;
  return Math.atan2(dzDx, 1.0);
}

export default function ForestAmbush3DViewport({
  splineSegments = [],
  splineEchelons = [],
  selectedSplineIdx = 0,
  setSelectedSplineIdx,
  soundEnabled = true,
  stats3D,
  t = (ru) => ru
}) {
  const mountRef = useRef(null);
  const [webglReady, setWebglReady] = useState(true);
  const [forestTimeOfDay, setForestTimeOfDay] = useState('day');
  const [forestWeather, setForestWeather] = useState('clear');
  const [spatialAudioOn, setSpatialAudioOn] = useState(true);
  const [activePreset, setActivePreset] = useState('defile');
  const [tallCinema, setTallCinema] = useState(false);
  const [projectedBadges, setProjectedBadges] = useState([]);

  const cameraCtrlRef = useRef({
    yaw: -0.24,
    pitch: 0.56,
    zoom: 1.24,
    panX: -0.4,
    panZ: 0.3,
    autoRotate: false
  });

  const sceneApiRef = useRef(null);
  const latestPropsRef = useRef({
    activePreset,
    splineSegments,
    splineEchelons,
    selectedSplineIdx,
    soundEnabled,
    spatialAudioOn,
    stats3D,
    forestTimeOfDay,
    forestWeather
  });

  useEffect(() => {
    latestPropsRef.current = {
      activePreset,
      splineSegments,
      splineEchelons,
      selectedSplineIdx,
      soundEnabled,
      spatialAudioOn,
      stats3D,
      forestTimeOfDay,
      forestWeather
    };
  }, [activePreset, splineSegments, splineEchelons, selectedSplineIdx, soundEnabled, spatialAudioOn, stats3D, forestTimeOfDay, forestWeather]);

  const applyCameraPreset = (presetId) => {
    setActivePreset(presetId);
    const c = cameraCtrlRef.current;
    if (presetId === 'defile') {
      c.yaw = -0.24;
      c.pitch = 0.56;
      c.zoom = 1.24;
      c.panX = -0.4;
      c.panZ = 0.3;
    } else if (presetId === 'convoy') {
      const selX = SECTOR_WORLD_X[selectedSplineIdx] ?? 0;
      c.yaw = -0.18;
      c.pitch = 0.44;
      c.zoom = 1.62;
      c.panX = selX;
      c.panZ = sampleRoadZ(selX);
    } else if (presetId === 'ridge') {
      c.yaw = 0.38;
      c.pitch = 0.42;
      c.zoom = 1.38;
      c.panX = -1.2;
      c.panZ = -0.6;
    } else if (presetId === 'eagle') {
      c.yaw = 0.46;
      c.pitch = 0.25;
      c.zoom = 1.42;
      c.panX = -0.8;
      c.panZ = 0.4;
      playSpatialBattleSound('eagle_cry_3d', { x: -0.8, y: 8.35, z: 0.4 }, {
        enabled: Boolean(latestPropsRef.current.soundEnabled && latestPropsRef.current.spatialAudioOn),
        environment: 'forest'
      });
    } else if (presetId === 'top') {
      c.yaw = 0.0;
      c.pitch = 1.18;
      c.zoom = 1.02;
      c.panX = 0.0;
      c.panZ = 0.0;
    }
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return undefined;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance'
      });
    } catch {
      setWebglReady(false);
      return undefined;
    }

    const devProfile = detectMobileDeviceProfile();
    const initW = Math.max(320, container.clientWidth || 760);
    const initH = Math.max(260, container.clientHeight || 420);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, devProfile.maxDpr));
    renderer.setSize(initW, initH);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    container.innerHTML = '';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.cursor = 'grab';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#86a79e');
    scene.fog = new THREE.FogExp2('#86a79e', 0.0076);

    const camera = new THREE.PerspectiveCamera(40, initW / initH, 0.4, 360);

    // Пакет CC0-фотограмметрии Кавказа и небесный IBL (PMREM Pure Sky)
    let skyUniformsRef = null;
    let streamMatRef = null;
    const pbrPack = loadCaucasusPbrPack(renderer, {
      onSkyReady: (pack) => {
        if (scene) {
          scene.environment = pack.envMap;
        }
        if (skyUniformsRef) {
          skyUniformsRef.uSkyTex.value = pack.skyEquirectTex;
          skyUniformsRef.uHasSkyTex.value = 1.0;
        }
        if (streamMatRef?.uniforms) {
          streamMatRef.uniforms.uSkyTex.value = pack.skyEquirectTex;
          streamMatRef.uniforms.uHasSky.value = 1.0;
        }
      }
    });
    scene.environment = pbrPack.envMap;
    scene.environmentIntensity = 0.58;

    let composer = null;
    let gtaoPass = null;
    let bloomPass = null;
    let postFx = null;
    try {
      composer = new EffectComposer(renderer);
      const renderPass = new RenderPass(scene, camera);
      composer.addPass(renderPass);
      gtaoPass = attachCleanGtaoPass({
        scene,
        camera,
        composer,
        width: initW,
        height: initH,
        clipBox: new THREE.Box3(new THREE.Vector3(-22, -2, -18), new THREE.Vector3(22, 16, 18)),
        blendIntensity: 0.76,
        radius: 0.68
      });
      bloomPass = new UnrealBloomPass(
        new THREE.Vector2(Math.max(256, Math.round(initW / 2)), Math.max(256, Math.round(initH / 2))),
        0.2,
        0.5,
        0.88
      );
      composer.addPass(bloomPass);
      postFx = attachCinematicPostFX(composer, { width: initW, height: initH });
    } catch {
      composer = null;
      postFx = null;
    }

    const fpsGov = createFpsGovernor({
      renderer,
      composer,
      gtaoPass,
      postFx,
      profile: devProfile
    });

    const disposableGeometries = [];
    const disposableMaterials = [];
    const disposableTextures = [];
    const trackGeo = (g) => {
      disposableGeometries.push(g);
      return g;
    };
    const trackMat = (m) => {
      disposableMaterials.push(m);
      return m;
    };
    const trackTex = (tx) => {
      disposableTextures.push(tx);
      return tx;
    };

    // Освещение букового ущелья Ичкерии
    const hemiLight = new THREE.HemisphereLight(0xb7dec8, 0x22301c, 0.92);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfff0cc, 2.25);
    sunLight.position.set(16, 26, 14);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = devProfile.shadowMapSize;
    sunLight.shadow.mapSize.height = devProfile.shadowMapSize;
    sunLight.shadow.camera.near = 2;
    sunLight.shadow.camera.far = 76;
    sunLight.shadow.camera.left = -22;
    sunLight.shadow.camera.right = 22;
    sunLight.shadow.camera.top = 18;
    sunLight.shadow.camera.bottom = -18;
    sunLight.shadow.bias = -0.00045;
    sunLight.shadow.normalBias = 0.025;
    scene.add(sunLight);

    const canopyRimLight = new THREE.DirectionalLight(0x6ee7b7, 0.52);
    canopyRimLight.position.set(-18, 14, -14);
    scene.add(canopyRimLight);

    const ambushFireLight = new THREE.PointLight(0xff8c28, 1.3, 18);
    ambushFireLight.position.set(0, 4.2, 0);
    scene.add(ambushFireLight);

    // 1. ВЫСОКОДЕТАЛЬНЫЙ РЕЛЬЕФ ХРЕБТА РЕЧЕЛЬ И ЛЕСНОЙ ТЕСНИНЫ ДАРГО (152x116)
    const baseField = buildHighResBattleHeightfield('dargo_1845', 152);
    const gridX = 152;
    const gridZ = 116;
    const worldW = 34;
    const worldD = 26;
    const heights = new Float32Array(gridX * gridZ);

    for (let gz = 0; gz < gridZ; gz++) {
      const wz = -worldD * 0.5 + (gz / (gridZ - 1)) * worldD;
      for (let gx = 0; gx < gridX; gx++) {
        const wx = -worldW * 0.5 + (gx / (gridX - 1)) * worldW;
        let h = baseField.sampleHeightAt(wx, wz) * 0.68;

        // Общий уклон хребта Речель слева направо к Дарго + крутые лесистые гребни по бокам тропы
        const rZ = sampleRoadZ(wx);
        const distRoad = Math.abs(wz - rZ);
        const ridgeSlope = (1.0 - (wx + 17) / 34) * 2.35;
        const roadElevation = 2.05 + ridgeSlope + Math.sin(wx * 0.35) * 0.18;

        // Крутой северный лесной гребень Ичкерии (задний план) и пологий берег ручья на переднем плане (открытый обзор камеры)
        const flankRise =
          wz < rZ
            ? Math.min(4.8, Math.pow(Math.max(0, (rZ - wz - 1.55) / 5.8), 1.25) * 4.5)
            : Math.min(0.85, Math.pow(Math.max(0, (wz - rZ - 1.65) / 7.5), 1.1) * 0.85);

        // Русло лесного ручья в южной лощине (мягкое русло без резких обрывов у края планшета)
        const streamCenter = Math.min(worldD * 0.5 - 2.2, rZ + 5.6);
        const distStream = Math.abs(wz - streamCenter);

        h = h * 0.38 + roadElevation + flankRise;

        // Вырезаем накатанную лесную дорогу с колеями сухарного обоза
        if (distRoad < 2.35) {
          const roadBlend = Math.cos((distRoad / 2.35) * (Math.PI * 0.5));
          const rut = distRoad < 0.85 ? Math.cos(distRoad * 5.2) * 0.04 : 0;
          h = h * (1 - roadBlend * 0.9) + (roadElevation - 0.14 + rut) * (roadBlend * 0.9);
        }

        if (distStream < 1.55) {
          const sBlend = Math.cos((distStream / 1.55) * (Math.PI * 0.5));
          h -= sBlend * sBlend * 0.52;
        }

        heights[gz * gridX + gx] = Math.max(0.75, h);
      }
    }

    const sampleForestY = (wx, wz) => {
      const u = Math.max(0, Math.min(1, (wx + worldW * 0.5) / worldW));
      const v = Math.max(0, Math.min(1, (wz + worldD * 0.5) / worldD));
      const fx = u * (gridX - 1);
      const fz = v * (gridZ - 1);
      const ix = Math.min(gridX - 2, Math.floor(fx));
      const iz = Math.min(gridZ - 2, Math.floor(fz));
      const tx = fx - ix;
      const tz = fz - iz;
      const h00 = heights[iz * gridX + ix];
      const h10 = heights[iz * gridX + ix + 1];
      const h01 = heights[(iz + 1) * gridX + ix];
      const h11 = heights[(iz + 1) * gridX + ix + 1];
      const hx0 = h00 + (h10 - h00) * tx;
      const hx1 = h01 + (h11 - h01) * tx;
      return hx0 + (hx1 - hx0) * tz;
    };

    const terrainGeo = trackGeo(new THREE.PlaneGeometry(worldW, worldD, gridX - 1, gridZ - 1));
    terrainGeo.rotateX(-Math.PI / 2);
    const tPos = terrainGeo.attributes.position;
    for (let i = 0; i < tPos.count; i++) {
      const wx = tPos.getX(i);
      const wz = tPos.getZ(i);
      tPos.setY(i, sampleForestY(wx, wz));
    }
    terrainGeo.computeVertexNormals();

    const bumpTex = trackTex(new THREE.CanvasTexture(createGorgeStrataBumpCanvas()));
    bumpTex.wrapS = THREE.RepeatWrapping;
    bumpTex.wrapT = THREE.RepeatWrapping;
    bumpTex.repeat.set(8, 6);

    const terrainMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        bumpMap: bumpTex,
        bumpScale: 0.24,
        roughness: 0.88,
        metalness: 0.03
      })
    );
    applyBattleTerrainPBRShader(terrainMat, { heightScale: 8.6, isForest: true, pbrPack });

    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    terrainMesh.castShadow = true;
    terrainMesh.receiveShadow = true;
    scene.add(terrainMesh);

    // Купол реального облачного неба CC0 Pure Sky и бесшовная лесная долина Большого Кавказа до горизонта
    const { skyMesh: forestSkyDome, skyUniforms } = createPhotorealSkyDome(pbrPack);
    skyUniformsRef = skyUniforms;
    if (pbrPack.skyEquirectTex?.image?.complete && pbrPack.skyEquirectTex?.image?.naturalWidth > 0) {
      skyUniforms.uHasSkyTex.value = 1.0;
    }
    trackGeo(forestSkyDome.geometry);
    trackMat(forestSkyDome.material);
    scene.add(forestSkyDome);

    const outerForestMesh = createSeamlessOuterValley({
      innerHalfW: worldW * 0.5,
      innerHalfD: worldD * 0.5,
      sampleEdgeHeight: sampleForestY,
      isForest: true,
      pbrPack
    });
    trackGeo(outerForestMesh.geometry);
    trackMat(outerForestMesh.material);
    scene.add(outerForestMesh);

    const horizonGeo = trackGeo(new THREE.CylinderGeometry(116, 122, 28, 112, 6, true));
    const hPos = horizonGeo.attributes.position;
    const hCols = new Float32Array(hPos.count * 3);
    const hColor = new THREE.Color();
    for (let i = 0; i < hPos.count; i++) {
      const hx = hPos.getX(i);
      const hy = hPos.getY(i);
      const hz = hPos.getZ(i);
      const ang = Math.atan2(hz, hx);
      const normH = (hy + 14) / 28;
      if (normH > 0.1) {
        const wave = Math.sin(ang * 6.0) * 3.1 + Math.cos(ang * 11.0 + 0.7) * 1.9 + Math.sin(ang * 21.0) * 0.9;
        hPos.setY(i, -14 + normH * (16.0 + wave));
      }
      if (normH > 0.78) hColor.set('#dce6ef');
      else if (normH > 0.42) hColor.set('#446055');
      else hColor.set('#2c3f38');
      hCols[i * 3] = hColor.r;
      hCols[i * 3 + 1] = hColor.g;
      hCols[i * 3 + 2] = hColor.b;
    }
    horizonGeo.setAttribute('color', new THREE.BufferAttribute(hCols, 3));
    horizonGeo.computeVertexNormals();
    const horizonMat = trackMat(
      new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.96,
        metalness: 0.0,
        side: THREE.DoubleSide,
        fog: true
      })
    );
    const horizonMesh = new THREE.Mesh(horizonGeo, horizonMat);
    horizonMesh.position.y = 4.6;
    scene.add(horizonMesh);

    // 3 фотореалистичных кавказских беркута (Aquila chrysaetos), кружащих над пологом букового леса Речель
    const forestEaglesGroup = new THREE.Group();
    scene.add(forestEaglesGroup);
    [
      { cx: -0.8, cz: 0.4, rx: 5.2, rz: 3.8, baseAlt: 8.35, altAmp: 0.48, omega: 0.34, dir: 1, driftRadius: 0.72, phase: 0.4, flapPeriod: 9.0, scale: 1.06 },
      { cx: 0.1, cz: 0.9, rx: 5.6, rz: 4.1, baseAlt: 8.85, altAmp: 0.44, omega: 0.34, dir: 1, driftRadius: 0.68, phase: 1.02, flapPeriod: 9.8, scale: 0.94 },
      { cx: -6.4, cz: -1.2, rx: 6.0, rz: 4.4, baseAlt: 9.45, altAmp: 0.56, omega: 0.29, dir: -1, driftRadius: 0.88, phase: 3.1, flapPeriod: 10.2, scale: 0.9 }
    ].forEach((cfg) => {
      const eagle = createPhotorealGoldenEagleInstance({ scale: cfg.scale, castShadow: true });
      eagle.userData.flightCfg = cfg;
      updatePhotorealGoldenEagle(eagle, 0);
      forestEaglesGroup.add(eagle);
    });

    // 2. ГОРНЫЙ РУЧЕЙ ИЧКЕРИИ (ПРЕЛОМЛЕНИЕ ПО КАМЕННОМУ ДНУ, СНЕЛЛИУС-ГЛУБИНА, НЕБО И БУРУНЫ) И ГАТИ
    const streamGeo = trackGeo(new THREE.PlaneGeometry(worldW + 0.6, 1.48, 92, 12));
    streamGeo.rotateX(-Math.PI / 2);
    const sPos = streamGeo.attributes.position;
    for (let i = 0; i < sPos.count; i++) {
      const wx = sPos.getX(i);
      const localZ = sPos.getZ(i);
      const clampedX = Math.max(-worldW * 0.495, Math.min(worldW * 0.495, wx));
      const centerZ = Math.min(worldD * 0.5 - 1.85, sampleRoadZ(clampedX) + 5.6);
      const wz = centerZ + localZ;
      sPos.setZ(i, wz);
      sPos.setY(i, sampleForestY(clampedX, centerZ) + 0.11);
    }
    streamGeo.computeVertexNormals();
    const streamMat = trackMat(createCanyonRiverMaterial([], { pbrPack, isStream: true }));
    streamMatRef = streamMat;
    if (pbrPack.skyEquirectTex?.image?.complete && pbrPack.skyEquirectTex?.image?.naturalWidth > 0) {
      streamMat.uniforms.uHasSky.value = 1.0;
    }
    const streamMesh = new THREE.Mesh(streamGeo, streamMat);
    scene.add(streamMesh);

    // Бревенчатая гать (corduroy log road) на сырых низинах лесной тропы
    const corduroyGeo = trackGeo(new THREE.CylinderGeometry(0.055, 0.055, 1.85, 6));
    corduroyGeo.rotateX(Math.PI / 2);
    const corduroyMat = trackMat(
      new THREE.MeshStandardMaterial({ color: 0x4a3525, roughness: 0.92 })
    );
    const corduroyInst = new THREE.InstancedMesh(corduroyGeo, corduroyMat, 48);
    corduroyInst.receiveShadow = true;
    const dummy = new THREE.Object3D();
    for (let i = 0; i < 48; i++) {
      const cluster = i < 24 ? -8.4 + (i / 24) * 3.1 : 2.3 + ((i - 24) / 24) * 3.2;
      const rz = sampleRoadZ(cluster);
      const ang = sampleRoadTangentAngle(cluster);
      dummy.position.set(cluster, sampleForestY(cluster, rz) + 0.03, rz);
      dummy.rotation.set(0, -ang, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      corduroyInst.setMatrixAt(i, dummy.matrix);
    }
    corduroyInst.instanceMatrix.needsUpdate = true;
    scene.add(corduroyInst);

    // 3. ВЕКОВОЙ ИЧКЕРИЙСКИЙ БУКОВЫЙ И ХВОЙНЫЙ ЛЕС (310 ДЕРЕВЬЕВ + ЗАМШЕЛЫЕ ВАЛУНЫ)
    const beechPositions = [];
    const pinePositions = [];
    for (let i = 0; i < 520; i++) {
      const s1 = Math.sin(i * 73.17 + 1.9) * 43758.5453;
      const s2 = Math.sin(i * 191.31 + 4.7) * 24634.6345;
      const s3 = Math.sin(i * 317.91 + 8.2) * 19283.7123;
      const rx = s1 - Math.floor(s1);
      const rz = s2 - Math.floor(s2);
      const rs = s3 - Math.floor(s3);

      const wx = -16.1 + rx * 32.2;
      const wz = -12.2 + rz * 23.2;
      const rZ = sampleRoadZ(wx);
      const sCenter = Math.min(worldD * 0.5 - 2.2, rZ + 5.6);
      // Открытый тактический коридор дороги и переднего сектора камеры (Total War diorama sightline)
      if (wz > rZ - 3.05 && wz < rZ + 3.45) continue;
      if (wz >= rZ + 3.45 && Math.abs(wx) < 11.4) continue;
      if (Math.abs(wz - sCenter) < 1.35) continue;

      const wy = sampleForestY(wx, wz);
      const scale = (wz > rZ ? 0.52 : 0.66) + rs * 0.44;
      if ((wy > 5.4 && rs > 0.38) || i % 4 === 0) {
        if (pinePositions.length < 95) pinePositions.push({ wx, wy, wz, scale, seed: rs });
      } else if (beechPositions.length < 215) {
        beechPositions.push({ wx, wy, wz, scale, seed: rs });
      }
    }

    // Серебристо-серые стволы кавказских буков (Fagus orientalis) и резные лиственные кроны с альфа-листвой
    const beechAtlasTex = trackTex(createBeechFoliageAtlasTexture());
    const coniferAtlasTex = trackTex(createConiferBoughAtlasTexture());
    const fernAtlasTex = trackTex(createFernUndergrowthTexture());

    const beechTrunkGeo = trackGeo(createRealisticTrunkGeometry({ isPine: false }));
    const beechTrunkMat = trackMat(
      new THREE.MeshStandardMaterial({ color: 0x766e64, roughness: 0.9, vertexColors: true })
    );
    const beechCrownGeo = trackGeo(createRealisticBeechCanopyGeometry());
    const beechCrownMat = trackMat(
      createFoliageCardMaterial({ map: beechAtlasTex, windStrength: 0.032, isPine: false })
    );

    const bTrunks = new THREE.InstancedMesh(beechTrunkGeo, beechTrunkMat, Math.max(1, beechPositions.length));
    const bCrowns = new THREE.InstancedMesh(beechCrownGeo, beechCrownMat, Math.max(1, beechPositions.length));
    bTrunks.castShadow = true;
    bTrunks.receiveShadow = true;
    bCrowns.castShadow = true;
    bCrowns.receiveShadow = true;

    const foliagePalette = [
      new THREE.Color(0x5d9645),
      new THREE.Color(0x6da74d),
      new THREE.Color(0x7cb453),
      new THREE.Color(0x4f863d),
      new THREE.Color(0x88bd5a)
    ];
    const fernPalette = [
      new THREE.Color(0x86bc56),
      new THREE.Color(0x98cc60),
      new THREE.Color(0x74aa4c),
      new THREE.Color(0xa6d668)
    ];

    beechPositions.forEach((p, idx) => {
      const sc = p.scale * 1.24;
      dummy.position.set(p.wx, p.wy - 0.04, p.wz);
      dummy.rotation.set((p.seed - 0.5) * 0.1, p.seed * Math.PI * 2, (0.5 - p.seed) * 0.09);
      dummy.scale.set(sc * (0.94 + p.seed * 0.14), sc, sc * (0.94 + p.seed * 0.14));
      dummy.updateMatrix();
      bTrunks.setMatrixAt(idx, dummy.matrix);
      bCrowns.setMatrixAt(idx, dummy.matrix);
      bCrowns.setColorAt(idx, foliagePalette[idx % foliagePalette.length]);
    });
    bTrunks.instanceMatrix.needsUpdate = true;
    bCrowns.instanceMatrix.needsUpdate = true;
    if (bCrowns.instanceColor) bCrowns.instanceColor.needsUpdate = true;
    scene.add(bTrunks, bCrowns);

    // Высокогорные сосны и пихты с ярусной хвоей на гребнях
    const pineCrownMat = trackMat(
      createFoliageCardMaterial({ map: coniferAtlasTex, windStrength: 0.022, isPine: true })
    );
    const pinePalette = [
      new THREE.Color(0x3f7b4c),
      new THREE.Color(0x366e43),
      new THREE.Color(0x4b8756)
    ];
    if (pinePositions.length > 0) {
      const pTrunkGeo = trackGeo(createRealisticTrunkGeometry({ isPine: true }));
      const pCrownGeo = trackGeo(createRealisticConiferGeometry());
      const pTrunkMat = trackMat(
        new THREE.MeshStandardMaterial({ color: 0x4f3421, roughness: 0.92, vertexColors: true })
      );
      const pTrunks = new THREE.InstancedMesh(pTrunkGeo, pTrunkMat, pinePositions.length);
      const pCrowns = new THREE.InstancedMesh(pCrownGeo, pineCrownMat, pinePositions.length);
      pTrunks.castShadow = true;
      pTrunks.receiveShadow = true;
      pCrowns.castShadow = true;
      pCrowns.receiveShadow = true;
      pinePositions.forEach((p, idx) => {
        const sc = p.scale * 1.32;
        dummy.position.set(p.wx, p.wy - 0.04, p.wz);
        dummy.rotation.set(0, p.seed * Math.PI * 2, 0);
        dummy.scale.set(sc, sc * (0.96 + p.seed * 0.16), sc);
        dummy.updateMatrix();
        pTrunks.setMatrixAt(idx, dummy.matrix);
        pCrowns.setMatrixAt(idx, dummy.matrix);
        pCrowns.setColorAt(idx, pinePalette[idx % pinePalette.length]);
      });
      pTrunks.instanceMatrix.needsUpdate = true;
      pCrowns.instanceMatrix.needsUpdate = true;
      if (pCrowns.instanceColor) pCrowns.instanceColor.needsUpdate = true;
      scene.add(pTrunks, pCrowns);
    }

    // Лесной подлесок: папоротники и кустарник вдоль валунов, берега ручья и лесных склонов Ичкерии
    const bushGeo = trackGeo(createUndergrowthBushGeometry());
    const bushMat = trackMat(
      createFoliageCardMaterial({ map: fernAtlasTex, windStrength: 0.024, isPine: false })
    );
    const bushPlacements = [];
    for (let i = 0; i < 380 && bushPlacements.length < 175; i++) {
      const s1 = Math.sin(i * 97.31 + 3.1) * 43758.5453;
      const s2 = Math.sin(i * 211.73 + 6.4) * 24634.6345;
      const rx = s1 - Math.floor(s1);
      const rz = s2 - Math.floor(s2);
      const wx = -15.4 + rx * 30.8;
      const wz = -11.8 + rz * 22.4;
      const rZ = sampleRoadZ(wx);
      if (Math.abs(wz - rZ) < 1.85) continue;
      const sCenter = Math.min(worldD * 0.5 - 2.2, rZ + 5.6);
      if (Math.abs(wz - sCenter) < 0.72) continue;
      const wy = sampleForestY(wx, wz);
      bushPlacements.push({ wx, wy, wz, sc: 0.78 + ((i % 5) * 0.16), rotY: rx * Math.PI * 2, idx: i });
    }
    if (bushPlacements.length > 0) {
      const bushInst = new THREE.InstancedMesh(bushGeo, bushMat, bushPlacements.length);
      bushInst.receiveShadow = true;
      bushPlacements.forEach((b, idx) => {
        dummy.position.set(b.wx, b.wy - 0.03, b.wz);
        dummy.rotation.set(0, b.rotY, 0);
        dummy.scale.setScalar(b.sc);
        dummy.updateMatrix();
        bushInst.setMatrixAt(idx, dummy.matrix);
        bushInst.setColorAt(idx, fernPalette[b.idx % fernPalette.length]);
      });
      bushInst.instanceMatrix.needsUpdate = true;
      if (bushInst.instanceColor) bushInst.instanceColor.needsUpdate = true;
      scene.add(bushInst);
    }

    // Продолжение буково-хвойного леса на внешние склоны Ичкерии (бесшовный горизонт)
    const outerPos = outerForestMesh.geometry.attributes.position;
    const outerCandidates = [];
    for (let i = 0; i < outerPos.count; i++) {
      const ovx = outerPos.getX(i);
      const ovy = outerPos.getY(i);
      const ovz = outerPos.getZ(i);
      const dxEdge = Math.max(0, Math.abs(ovx) - worldW * 0.5);
      const dzEdge = Math.max(0, Math.abs(ovz) - worldD * 0.5);
      const edgeDist = Math.hypot(dxEdge, dzEdge);
      if (edgeDist >= 1.8 && edgeDist <= 38.0 && ovy > 0.4) {
        outerCandidates.push({ x: ovx, y: ovy, z: ovz, edgeDist });
      }
    }
    if (outerCandidates.length > 0) {
      const distCount = Math.min(240, outerCandidates.length);
      const distTrunks = new THREE.InstancedMesh(beechTrunkGeo, beechTrunkMat, distCount);
      const distCrowns = new THREE.InstancedMesh(beechCrownGeo, beechCrownMat, distCount);
      for (let dIdx = 0; dIdx < distCount; dIdx++) {
        const pick = Math.floor(((dIdx * 0.6180339887) % 1) * outerCandidates.length);
        const cand = outerCandidates[pick];
        const sc = (0.95 + ((dIdx % 5) * 0.16)) * 1.28;
        dummy.position.set(cand.x, cand.y - 0.05, cand.z);
        dummy.rotation.set(0, dIdx * 1.4, 0);
        dummy.scale.set(sc * 1.08, sc, sc * 1.08);
        dummy.updateMatrix();
        distTrunks.setMatrixAt(dIdx, dummy.matrix);
        distCrowns.setMatrixAt(dIdx, dummy.matrix);
        distCrowns.setColorAt(dIdx, foliagePalette[(dIdx + 1) % foliagePalette.length]);
      }
      distTrunks.instanceMatrix.needsUpdate = true;
      distCrowns.instanceMatrix.needsUpdate = true;
      if (distCrowns.instanceColor) distCrowns.instanceColor.needsUpdate = true;
      scene.add(distTrunks, distCrowns);
    }

    // Колотые известняковые глыбы и укрытия мюридов (угловатые грани + фотограмметрия CC0 Rock Face 03)
    const boulderGeo = trackGeo(new THREE.DodecahedronGeometry(0.44, 1));
    const bPos = boulderGeo.attributes.position;
    for (let i = 0; i < bPos.count; i++) {
      const vx = bPos.getX(i);
      const vy = bPos.getY(i);
      const vz = bPos.getZ(i);
      const h = Math.sin(vx * 11.7 + vy * 17.3 + vz * 23.9) * 43758.5453;
      const frac = h - Math.floor(h);
      const disp = 0.72 + frac * 0.52;
      bPos.setXYZ(i, vx * disp, vy * (0.82 + frac * 0.28), vz * disp);
    }
    boulderGeo.computeVertexNormals();
    const boulderMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: '#c9c6bc',
        map: pbrPack.rockDiff,
        normalMap: pbrPack.rockNor,
        normalScale: new THREE.Vector2(0.88, 0.88),
        roughnessMap: pbrPack.rockArm,
        roughness: 0.94,
        metalness: 0.03
      })
    );
    const boulders = new THREE.InstancedMesh(boulderGeo, boulderMat, 64);
    boulders.castShadow = true;
    boulders.receiveShadow = true;
    for (let i = 0; i < 64; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const wx = -14.8 + (i / 64) * 29.6;
      const wz = sampleRoadZ(wx) + side * (2.05 + (i % 5) * 0.48);
      const wy = sampleForestY(wx, wz);
      dummy.position.set(wx, wy + 0.14, wz);
      dummy.rotation.set(i * 0.7, i * 1.3, i * 0.4);
      dummy.scale.set(0.85 + (i % 4) * 0.35, 0.55 + (i % 3) * 0.22, 0.8 + (i % 5) * 0.25);
      dummy.updateMatrix();
      boulders.setMatrixAt(i, dummy.matrix);
    }
    boulders.instanceMatrix.needsUpdate = true;
    scene.add(boulders);

    // 4. СТРЕЛКОВЫЕ ЦЕПИ ГОРЦЕВ БАЙСУНГУРА НА ОБОИХ ЛЕСНЫХ ГРЕБНЯХ (46 АНАТОМИЧЕСКИХ СТРЕЛКОВ + ЗНАМЯ ИМАМАТА)
    const {
      cherkeskaGeo: highlandTorsoGeo,
      papakhaAccGeo: highlandHeadGeo,
      weaponGeo: rifleGeo
    } = createMuridWarriorGeometrySet();
    trackGeo(highlandTorsoGeo);
    trackGeo(highlandHeadGeo);
    trackGeo(rifleGeo);
    const forestMuridUniforms = createTroopAnimUniforms({ marchAmount: 0.14 });
    const cherkeskaMat = trackMat(
      applyAnimatedTroopShader(
        new THREE.MeshStandardMaterial({ color: 0x26201c, vertexColors: true, roughness: 0.88 }),
        { keyTag: 'forest_murid_coat', sharedUniforms: forestMuridUniforms }
      )
    );
    const papakhaMat = trackMat(
      applyAnimatedTroopShader(
        new THREE.MeshStandardMaterial({ color: 0xdfd7ce, vertexColors: true, roughness: 0.92 }),
        { keyTag: 'forest_murid_hat', sharedUniforms: forestMuridUniforms }
      )
    );
    const muridWeaponMat = trackMat(
      applyAnimatedTroopShader(
        new THREE.MeshStandardMaterial({
          color: 0x7b6046,
          vertexColors: true,
          metalness: 0.35,
          roughness: 0.56
        }),
        { keyTag: 'forest_murid_weap', sharedUniforms: forestMuridUniforms }
      )
    );
    const steelWoodMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x6b533b, metalness: 0.35, roughness: 0.6 }));

    const muridPositions = [];
    const muridCount = 46;
    const mTorso = new THREE.InstancedMesh(highlandTorsoGeo, cherkeskaMat, muridCount);
    const mPapakha = new THREE.InstancedMesh(highlandHeadGeo, papakhaMat, muridCount);
    const mRifles = new THREE.InstancedMesh(rifleGeo, muridWeaponMat, muridCount);
    mTorso.castShadow = true;
    mTorso.receiveShadow = true;
    mPapakha.castShadow = true;

    for (let i = 0; i < muridCount; i++) {
      const side = i % 3 === 0 ? 1 : -1;
      const wx = -13.6 + (i / (muridCount - 1)) * 27.2;
      const rZ = sampleRoadZ(wx);
      const wz = rZ + side * (2.55 + (i % 4) * 0.65);
      const wy = sampleForestY(wx, wz);
      // +Z геометрии направлен на дорогу: северный склон (side < 0) стреляет на юг (0), южный — на север (PI)
      const aimYaw = (side < 0 ? 0 : Math.PI) + Math.sin(i * 17.3) * 0.18;
      const sc = 1.04 + (i % 3) * 0.05;
      muridPositions.push({ wx, wy, wz, side, aimYaw, sc });

      dummy.position.set(wx, wy - 0.02, wz);
      dummy.rotation.set(0.06 * -side, aimYaw, 0);
      dummy.scale.setScalar(sc);
      dummy.updateMatrix();
      mTorso.setMatrixAt(i, dummy.matrix);
      mPapakha.setMatrixAt(i, dummy.matrix);
      mRifles.setMatrixAt(i, dummy.matrix);
    }
    mTorso.instanceMatrix.needsUpdate = true;
    mPapakha.instanceMatrix.needsUpdate = true;
    mRifles.instanceMatrix.needsUpdate = true;
    scene.add(mTorso, mPapakha, mRifles);

    // Развевающееся зелёное знамя Имамата на северном гребне Байсунгура
    const bannerX = -2.4;
    const bannerZ = sampleRoadZ(bannerX) - 4.1;
    const bannerY = sampleForestY(bannerX, bannerZ);
    const poleMesh = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.035, 0.045, 2.2, 6)),
      steelWoodMat
    );
    poleMesh.position.set(bannerX, bannerY + 1.1, bannerZ);
    scene.add(poleMesh);

    const flagGeo = trackGeo(new THREE.PlaneGeometry(1.15, 0.68, 12, 6));
    const flagMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x059669,
        emissive: 0x064e3b,
        emissiveIntensity: 0.35,
        side: THREE.DoubleSide,
        roughness: 0.65
      })
    );
    const flagMesh = new THREE.Mesh(flagGeo, flagMat);
    flagMesh.position.set(bannerX + 0.58, bannerY + 1.82, bannerZ);
    scene.add(flagMesh);

    // Многослойная стелющаяся дымка в лесных лощинах Ичкерии и система осадков
    const mistTex = trackTex(createLayeredValleyMistTexture());
    const powderSmokeTex = trackTex(createBillowingSmokeTexture());
    const mistGroup = new THREE.Group();
    mistGroup.userData.excludeFromGtao = true;
    const mistPlaneGeo = trackGeo(new THREE.PlaneGeometry(7.2, 3.8));
    const mistMat = trackMat(
      new THREE.MeshBasicMaterial({
        map: mistTex,
        color: 0xcce8d8,
        transparent: true,
        opacity: 0.14,
        depthWrite: false,
        side: THREE.DoubleSide
      })
    );
    const mistSprites = [];
    for (let i = 0; i < 22; i++) {
      const mPlane = new THREE.Mesh(mistPlaneGeo, mistMat);
      const wx = -15.2 + i * 1.45;
      const wz = sampleRoadZ(wx) + (i % 3 === 0 ? -1.8 : i % 3 === 1 ? 2.4 : 4.2);
      mPlane.rotation.x = -Math.PI / 2;
      mPlane.rotation.z = i * 0.55;
      mPlane.position.set(wx, sampleForestY(wx, wz) + 0.48 + (i % 3) * 0.34, wz);
      mPlane.userData = { excludeFromGtao: true };
      mistGroup.add(mPlane);
      mistSprites.push({ mesh: mPlane, baseX: wx, baseZ: wz, phase: i * 0.72 });
    }
    scene.add(mistGroup);

    const precipSys = createCaucasusPrecipitationSystem({
      spanX: 38,
      spanY: 15,
      spanZ: 28,
      rainCount: 650,
      snowCount: 780
    });
    scene.add(precipSys.group);

    // 5. ДИНАМИЧЕСКАЯ ГРУППА СЕКТОРОВ #1..#5: БУКОВЫЕ ЗАСЕКИ, ЭШЕЛОНЫ ОБОЗА РИ И КОЛЬЦА ВЫБОРА
    const dynamicGroup = new THREE.Group();
    scene.add(dynamicGroup);
    let disposed = false;

    // Общие геометрии и материалы для динамических засек, повозок и пехоты РИ (не пересоздаются при каждом клике)
    const felledTrunkGeo = trackGeo(createRealisticTrunkGeometry({ isPine: false }));
    felledTrunkGeo.rotateX(Math.PI * 0.5);
    felledTrunkGeo.scale(1.15, 1.15, 2.35);
    const felledBranchGeo = trackGeo(createRealisticBeechCanopyGeometry());
    felledBranchGeo.rotateX(Math.PI * 0.5);
    felledBranchGeo.scale(1.05, 0.72, 1.05);
    const felledWoodMat = trackMat(
      new THREE.MeshStandardMaterial({ color: 0x625444, roughness: 0.92, vertexColors: true })
    );
    const felledLeafMat = trackMat(
      createFoliageCardMaterial({ map: beechAtlasTex, windStrength: 0.008, isPine: false })
    );
    felledLeafMat.color.set('#5a863a');

    const {
      coatGeo: rusCoatGeo,
      equipGeo: rusHeadGeo,
      metalGeo: bayonetGeo
    } = createImperialSoldierGeometrySet();
    trackGeo(rusCoatGeo);
    trackGeo(rusHeadGeo);
    trackGeo(bayonetGeo);
    const forestImpUniforms = createTroopAnimUniforms({ marchAmount: 0.34 });
    const rusCoatMat = trackMat(
      applyAnimatedTroopShader(
        new THREE.MeshStandardMaterial({ color: 0x193829, vertexColors: true, roughness: 0.84 }),
        { keyTag: 'forest_imp_coat', sharedUniforms: forestImpUniforms }
      )
    );
    const rusShakoMat = trackMat(
      applyAnimatedTroopShader(
        new THREE.MeshStandardMaterial({ color: 0xf4efe6, vertexColors: true, roughness: 0.72 }),
        { keyTag: 'forest_imp_hat', sharedUniforms: forestImpUniforms }
      )
    );
    const steelBayonetMat = trackMat(
      applyAnimatedTroopShader(
        new THREE.MeshStandardMaterial({
          color: 0xffffff,
          vertexColors: true,
          metalness: 0.62,
          roughness: 0.34
        }),
        { keyTag: 'forest_imp_steel', sharedUniforms: forestImpUniforms }
      )
    );

    const ringGeo = trackGeo(new THREE.RingGeometry(1.45, 1.72, 36));
    ringGeo.rotateX(-Math.PI / 2);
    const ringSelectedMat = trackMat(
      new THREE.MeshBasicMaterial({
        color: 0x34d399,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.92
      })
    );
    const ringIdleMat = trackMat(
      new THREE.MeshBasicMaterial({
        color: 0xfbbf24,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.45
      })
    );

    const dynamicRiggedGlbs = [];
    const dynamicWheelMeshes = [];

    const rebuildDynamicSectors = () => {
      if (disposed) return;
      while (dynamicGroup.children.length > 0) {
        const ch = dynamicGroup.children[0];
        ch.traverse((sub) => {
          if (sub.isInstancedMesh) sub.dispose();
          disposePhotorealCavalryInstance(sub);
          disposePhotorealCorpsInstance(sub);
        });
        dynamicGroup.remove(ch);
      }
      dynamicRiggedGlbs.length = 0;
      dynamicWheelMeshes.length = 0;
      const { splineSegments: segs, splineEchelons: echs, selectedSplineIdx: selIdx } =
        latestPropsRef.current;

      // Анатомический скакун и наиб Байсунгур Беноевский на командном выступе над выбранным участком
      const cmdX = SECTOR_WORLD_X[selIdx] ?? 0;
      const cmdZ = sampleRoadZ(cmdX) - 3.0;
      const cmdY = sampleForestY(cmdX, cmdZ);
      {
        const heroMount = createPhotorealCavalryInstance('hero_baysungur', {
          scale: 0.72,
          castShadow: true
        });
        heroMount.position.set(cmdX, cmdY + 0.02, cmdZ);
        heroMount.rotation.y = 0.25;
        dynamicGroup.add(heroMount);
        dynamicRiggedGlbs.push({ obj: heroMount, moving: false, selected: true, phase: 0.4 });
      }

      segs.forEach((seg, idx) => {
        const sx = SECTOR_WORLD_X[idx] ?? -11.2 + idx * 5.6;
        const sz = sampleRoadZ(sx);
        const sy = sampleForestY(sx, sz);
        const roadAngle = sampleRoadTangentAngle(sx);
        const isSel = idx === selIdx;

        // Тактическое кольцо участка на земле
        const ring = new THREE.Mesh(ringGeo, isSel ? ringSelectedMat : ringIdleMat);
        ring.position.set(sx, sy + 0.08, sz);
        dynamicGroup.add(ring);

        // Поваленные вековые буки (засеки) поперёк лесной тропы пропорционально seg.barricades
        const countBarricades = Math.min(5, seg.barricades || 0);
        for (let b = 0; b < countBarricades; b++) {
          const offsetX = sx + 1.1 + b * 0.42;
          const bZ = sampleRoadZ(offsetX);
          const bY = sampleForestY(offsetX, bZ);
          const logGroup = new THREE.Group();
          logGroup.position.set(offsetX, bY + 0.16 + (b % 2) * 0.12, bZ);
          logGroup.rotation.y = -roadAngle + (b % 2 === 0 ? 0.26 : -0.24);

          const trunk = new THREE.Mesh(felledTrunkGeo, felledWoodMat);
          trunk.position.set(0, 0.06, -1.45);
          trunk.castShadow = true;
          trunk.receiveShadow = true;
          logGroup.add(trunk);

          const crownA = new THREE.Mesh(felledBranchGeo, felledLeafMat);
          crownA.position.set(0.08, 0.1, -0.35);
          crownA.castShadow = true;
          const crownB = new THREE.Mesh(felledBranchGeo, felledLeafMat);
          crownB.position.set(-0.08, 0.08, 0.95);
          crownB.rotation.z = 2.1;
          crownB.castShadow = true;
          logGroup.add(crownA, crownB);

          dynamicGroup.add(logGroup);
        }

        // Растянутый эшелон «Сухарной экспедиции» Воронцова (повозки с белыми тентами, орудия и пехота прикрытия)
        const echelon = echs.find((e) => e.segmentIdx === idx);
        if (echelon) {
          const echGroup = new THREE.Group();
          dynamicGroup.add(echGroup);
          const canCreep = countBarricades === 0;

          // 2 сухарные фургонные повозки Воронцова с упряжным конём в русской дуге
          for (let w = 0; w < 2; w++) {
            const wx = sx - 1.25 + w * 1.65;
            const wz = sampleRoadZ(wx) + (w === 0 ? -0.16 : 0.18);
            const wy = sampleForestY(wx, wz);
            const wAngle = sampleRoadTangentAngle(wx) + (echelon.cohesion < 50 ? (w === 0 ? 0.22 : -0.28) : 0);

            const wagon = createPhotorealSupplyWagonInstance({
              includeDraftHorse: w === 1, // головная повозка (справа по ходу +X) с упряжным конём!
              scale: 0.72,
              castShadow: true
            });
            wagon.position.set(wx, wy + 0.01, wz);
            wagon.rotation.y = -wAngle + Math.PI * 0.5;
            echGroup.add(wagon);
            dynamicRiggedGlbs.push({ obj: wagon, moving: canCreep, selected: false, phase: idx + w });
          }

          // Полковые горные бронзовые единороги эшелона
          const gunCount = Math.min(2, echelon.guns || 0);
          for (let g = 0; g < gunCount; g++) {
            const gx = sx - 0.25 + g * 0.95;
            const gz = sampleRoadZ(gx) + (g === 0 ? 0.56 : -0.56);
            const gy = sampleForestY(gx, gz);
            const cannon = createPhotorealUnicornCannonInstance({
              variant: 'imperial',
              includeAmmoChest: false,
              scale: 0.68,
              castShadow: true
            });
            cannon.position.set(gx, gy + 0.01, gz);
            cannon.rotation.y = g === 0 ? 0.2 : Math.PI - 0.2;
            echGroup.add(cannon);
            dynamicRiggedGlbs.push({ obj: cannon, moving: canCreep, selected: false, phase: idx + g * 1.5 });
          }

          // Пехота прикрытия колонны (строй рассыпается по мере падения Cohesion)
          const soldierCount = Math.max(8, Math.min(24, Math.round(echelon.strength / 36)));
          const disorder = Math.max(0, (100 - echelon.cohesion) / 100);
          const sCoats = new THREE.InstancedMesh(rusCoatGeo, rusCoatMat, soldierCount);
          const sShakos = new THREE.InstancedMesh(rusHeadGeo, rusShakoMat, soldierCount);
          const sBayonets = new THREE.InstancedMesh(bayonetGeo, steelBayonetMat, soldierCount);
          sCoats.castShadow = true;
          sCoats.receiveShadow = true;
          sShakos.castShadow = true;

          for (let s = 0; s < soldierCount; s++) {
            const row = Math.floor(s / 4);
            const col = s % 4;
            const jitterX = Math.sin(s * 19.7 + idx) * 0.45 * disorder;
            const jitterZ = Math.cos(s * 31.3 + idx) * 0.55 * disorder;
            const px = sx - 1.7 + row * 0.52 + jitterX;
            const pz = sampleRoadZ(px) - 0.72 + col * 0.48 + jitterZ;
            const py = sampleForestY(px, pz);
            const faceOut = -roadAngle + (col < 2 ? Math.PI : 0);

            dummy.position.set(px, py - 0.02, pz);
            dummy.rotation.set(0, faceOut + jitterX * 0.6, 0);
            dummy.scale.setScalar(1.06);
            dummy.updateMatrix();
            sCoats.setMatrixAt(s, dummy.matrix);
            sShakos.setMatrixAt(s, dummy.matrix);
            sBayonets.setMatrixAt(s, dummy.matrix);
          }
          sCoats.instanceMatrix.needsUpdate = true;
          sShakos.instanceMatrix.needsUpdate = true;
          sBayonets.instanceMatrix.needsUpdate = true;
          echGroup.add(sCoats, sShakos, sBayonets);
        }
      });
    };

    rebuildDynamicSectors();

    // 6. ПЕРЕКРЁСТНЫЕ ШТУЦЕРНЫЕ ТРАССЕРЫ, КЛУБЯЩИЙСЯ ПОРОХОВОЙ ДЫМ XIX ВЕКА И ЭФФЕКТЫ ПРИКАЗОВ
    const activeTracers = [];
    const smokeGroup = new THREE.Group();
    scene.add(smokeGroup);
    const smokeSys = createBlackPowderSmokeSystem({
      parentGroup: smokeGroup,
      smokeTex: powderSmokeTex,
      maxParticles: 280
    });
    const tracerGeo = trackGeo(new THREE.CylinderGeometry(0.018, 0.018, 1.0, 5));
    tracerGeo.rotateX(Math.PI / 2);
    const tracerGoldMat = trackMat(
      new THREE.MeshBasicMaterial({ color: 0xfef08a, transparent: true, opacity: 0.95 })
    );
    const tracerCrimsonMat = trackMat(
      new THREE.MeshBasicMaterial({ color: 0xfca5a5, transparent: true, opacity: 0.9 })
    );

    const spawnSmokePuff = (x, y, z, scale = 0.75, colorHex = '#cbd5e1', flash = false) => {
      const hexStr =
        typeof colorHex === 'number' ? `#${colorHex.toString(16).padStart(6, '0')}` : colorHex;
      smokeSys.spawnSmoke({
        x,
        y,
        z,
        vx: (Math.random() - 0.5) * 0.35,
        vy: 0.32 + Math.random() * 0.28,
        vz: (Math.random() - 0.5) * 0.35,
        scale,
        grow: 0.85,
        life: 2.8 + Math.random() * 1.8,
        flash,
        flashHex: '#fde047',
        colorHex: hexStr,
        maxOpacity: 0.52
      });
    };

    const spawnCrossfireTracer = (fromX, fromY, fromZ, toX, toY, toZ, isMurid = true) => {
      if (activeTracers.length > 36) return;
      const mesh = new THREE.Mesh(tracerGeo, isMurid ? tracerGoldMat : tracerCrimsonMat);
      mesh.position.set(fromX, fromY, fromZ);
      mesh.lookAt(toX, toY, toZ);
      mesh.scale.set(1, 1, 1.35);
      scene.add(mesh);
      activeTracers.push({
        mesh,
        sx: fromX,
        sy: fromY,
        sz: fromZ,
        tx: toX,
        ty: toY,
        tz: toZ,
        progress: 0,
        speed: 2.8 + Math.random() * 1.1
      });
      spawnSmokePuff(fromX, fromY + 0.14, fromZ, 0.58, '#cbd5e1', true);
    };

    let chargeWaveTimer = 0;

    const triggerAmbushSpectacle = (actionType, sectorIdx) => {
      const sx = SECTOR_WORLD_X[sectorIdx] ?? 0;
      const sz = sampleRoadZ(sx);
      const sy = sampleForestY(sx, sz);
      const pCur = latestPropsRef.current;
      const audioOn = Boolean(pCur.soundEnabled && pCur.spatialAudioOn);

      if (actionType === 'fell_beeches') {
        playSpatialBattleSound(
          'felling_axes_3d',
          { x: sx, y: sy + 0.5, z: sz },
          { enabled: audioOn, environment: 'forest' }
        );
        for (let i = 0; i < 12; i++) {
          spawnSmokePuff(
            sx + 0.9 + (Math.random() - 0.5) * 1.6,
            sy + 0.35 + Math.random() * 0.5,
            sz + (Math.random() - 0.5) * 1.8,
            1.25,
            '#a89882',
            false
          );
        }
      } else if (actionType === 'crossfire') {
        forestMuridUniforms.uVolleyPulse.value = 1.2;
        forestImpUniforms.uVolleyPulse.value = 0.7;
        playSpatialBattleSound(
          'rifle_murid_3d',
          { x: sx - 1.2, y: sy + 0.8, z: sz - 2.6 },
          { enabled: audioOn, environment: 'forest' }
        );
        playSpatialBattleSound(
          'ricochet_3d',
          { x: sx + 0.6, y: sy + 0.5, z: sz },
          { enabled: audioOn, environment: 'forest' }
        );
        for (let i = 0; i < 14; i++) {
          const side = i % 2 === 0 ? -1 : 1;
          const fx = sx + (Math.random() - 0.5) * 4.4;
          const fz = sampleRoadZ(fx) + side * (2.6 + Math.random() * 1.8);
          const fy = sampleForestY(fx, fz) + 0.38;
          spawnCrossfireTracer(
            fx,
            fy,
            fz,
            sx + (Math.random() - 0.5) * 2.2,
            sy + 0.35,
            sz + (Math.random() - 0.5) * 1.1,
            true
          );
        }
      } else if (actionType === 'dagger_charge') {
        chargeWaveTimer = 1.0;
        forestMuridUniforms.uChargePulse.value = 1.15;
        forestImpUniforms.uVolleyPulse.value = 0.85;
        playSpatialBattleSound(
          'dagger_charge_3d',
          { x: sx, y: sy + 0.6, z: sz },
          { enabled: audioOn, environment: 'forest' }
        );
        for (let i = 0; i < 12; i++) {
          const side = i % 2 === 0 ? -1 : 1;
          const fx = sx + (Math.random() - 0.5) * 3.0;
          const fz = sampleRoadZ(fx) + side * 2.4;
          const fy = sampleForestY(fx, fz) + 0.35;
          spawnCrossfireTracer(fx, fy, fz, sx, sy + 0.3, sz, true);
          spawnSmokePuff(
            sx + (Math.random() - 0.5) * 1.8,
            sy + 0.4,
            sz + (Math.random() - 0.5) * 1.2,
            1.2,
            '#e2e8f0',
            true
          );
        }
      }
    };

    sceneApiRef.current = {
      rebuildDynamicSectors,
      triggerAmbushSpectacle
    };

    // Управление камерой (ЛКМ — орбита, ПКМ / Shift+ЛКМ — панорама, колесо — зум, клик — выбор сектора #1..#5)
    const dragState = {
      active: false,
      panMode: false,
      moved: false,
      startX: 0,
      startY: 0,
      lastX: 0,
      lastY: 0
    };
    const raycaster = new THREE.Raycaster();
    const pointerNdc = new THREE.Vector2();

    const pickSectorAt = (clientX, clientY) => {
      if (!setSelectedSplineIdx) return;
      const rect = renderer.domElement.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      pointerNdc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointerNdc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointerNdc, camera);
      const hits = raycaster.intersectObject(terrainMesh, false);
      if (hits.length > 0) {
        const hitPt = hits[0].point;
        let bestIdx = -1;
        let bestDist = 4.2;
        SECTOR_WORLD_X.forEach((sx, idx) => {
          const d = Math.hypot(hitPt.x - sx, hitPt.z - sampleRoadZ(sx));
          if (d < bestDist) {
            bestDist = d;
            bestIdx = idx;
          }
        });
        if (bestIdx >= 0) setSelectedSplineIdx(bestIdx);
      }
    };

    const onPointerDown = (e) => {
      if (e.pointerType === 'touch') return;
      const pCur = latestPropsRef.current;
      unlockSpatialBattleAudio(Boolean(pCur.soundEnabled && pCur.spatialAudioOn));
      dragState.active = true;
      dragState.panMode = e.button === 2 || e.shiftKey;
      dragState.moved = false;
      dragState.startX = e.clientX;
      dragState.startY = e.clientY;
      dragState.lastX = e.clientX;
      dragState.lastY = e.clientY;
      renderer.domElement.style.cursor = 'grabbing';
    };

    const onPointerMove = (e) => {
      if (e.pointerType === 'touch' || !dragState.active) return;
      const dx = e.clientX - dragState.lastX;
      const dy = e.clientY - dragState.lastY;
      dragState.lastX = e.clientX;
      dragState.lastY = e.clientY;
      if (Math.hypot(e.clientX - dragState.startX, e.clientY - dragState.startY) > 5) {
        dragState.moved = true;
      }
      const c = cameraCtrlRef.current;
      if (dragState.panMode) {
        const cosY = Math.cos(c.yaw);
        const sinY = Math.sin(c.yaw);
        c.panX = Math.max(-12, Math.min(12, c.panX - (dx * cosY + dy * sinY) * 0.025));
        c.panZ = Math.max(-8, Math.min(8, c.panZ - (-dx * sinY + dy * cosY) * 0.025));
      } else {
        c.yaw -= dx * 0.0065;
        c.pitch = Math.max(0.16, Math.min(1.32, c.pitch + dy * 0.0055));
      }
    };

    const onPointerUp = (e) => {
      if (e.pointerType === 'touch') return;
      if (dragState.active && !dragState.moved) {
        pickSectorAt(e.clientX, e.clientY);
      }
      dragState.active = false;
      renderer.domElement.style.cursor = 'grab';
    };

    const onWheel = (e) => {
      e.preventDefault();
      const c = cameraCtrlRef.current;
      c.zoom = Math.max(0.75, Math.min(1.85, c.zoom + (e.deltaY < 0 ? 0.08 : -0.08)));
    };
    const onContextMenu = (e) => e.preventDefault();

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    renderer.domElement.addEventListener('wheel', onWheel, { passive: false });
    renderer.domElement.addEventListener('contextmenu', onContextMenu);

    const touchControls = attachUnified3DTouchControls(renderer.domElement, {
      onInteractionStart: () => {
        const pCur = latestPropsRef.current;
        unlockSpatialBattleAudio(Boolean(pCur.soundEnabled && pCur.spatialAudioOn));
      },
      onOrbit: (dx, dy) => {
        const c = cameraCtrlRef.current;
        c.yaw -= dx * 0.0072;
        c.pitch = Math.max(0.16, Math.min(1.32, c.pitch + dy * 0.0062));
      },
      onPan: (dx, dy) => {
        const c = cameraCtrlRef.current;
        const cosY = Math.cos(c.yaw);
        const sinY = Math.sin(c.yaw);
        c.panX = Math.max(-12, Math.min(12, c.panX - (dx * cosY + dy * sinY) * 0.028));
        c.panZ = Math.max(-8, Math.min(8, c.panZ - (-dx * sinY + dy * cosY) * 0.028));
      },
      onPinchZoom: (pinchDelta) => {
        const c = cameraCtrlRef.current;
        c.zoom = Math.max(0.75, Math.min(1.85, c.zoom + pinchDelta * 0.0042));
      },
      onTap: (cx, cy) => pickSectorAt(cx, cy),
      onLongPress: (cx, cy) => pickSectorAt(cx, cy)
    });

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = Math.max(320, Math.floor(entry.contentRect.width));
        const h = Math.max(260, Math.floor(entry.contentRect.height));
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
        if (composer) composer.setSize(w, h);
        if (gtaoPass) {
          gtaoPass.setSize(Math.max(256, Math.round(w * 0.75)), Math.max(256, Math.round(h * 0.75)));
        }
        if (bloomPass) {
          bloomPass.resolution.set(Math.max(256, Math.round(w / 2)), Math.max(256, Math.round(h / 2)));
        }
        if (postFx) {
          postFx.setSize(w, h);
        }
      }
    });
    resizeObserver.observe(container);

    // Главный цикл 60 FPS
    let rafId = 0;
    let prevTime = performance.now();
    let ambientSkirmishTimer = 0;
    let badgeSyncTimer = 0;
    let lastHandledShotSeq = latestPropsRef.current.stats3D?.lastShotEvent?.seq || 0;
    const projVec = new THREE.Vector3();
    const sunDirTmp = new THREE.Vector3();
    const baseFlagPos = flagGeo.attributes.position.array.slice();

    const animate = (now) => {
      rafId = requestAnimationFrame(animate);
      const dt = Math.min(0.05, (now - prevTime) / 1000);
      prevTime = now;
      const elapsed = now * 0.001;

      const {
        forestTimeOfDay: tod,
        forestWeather: fWeather = 'clear',
        soundEnabled: sndOn,
        spatialAudioOn: spOn,
        stats3D: st3,
        selectedSplineIdx: selIdx
      } = latestPropsRef.current;
      const audioActive = Boolean(sndOn && spOn);

      forestMuridUniforms.uTroopTime.value = elapsed;
      forestImpUniforms.uTroopTime.value = elapsed;
      forestMuridUniforms.uVolleyPulse.value = Math.max(0, forestMuridUniforms.uVolleyPulse.value - dt * 2.4);
      forestImpUniforms.uVolleyPulse.value = Math.max(0, forestImpUniforms.uVolleyPulse.value - dt * 2.4);
      forestMuridUniforms.uChargePulse.value = Math.max(0, forestMuridUniforms.uChargePulse.value - dt * 1.2);

      // Время суток в лесу + синхронизация атмосферного тумана и облачного неба
      if (tod === 'sunset') {
        scene.background.set('#9d5b44');
        scene.fog.color.set('#9d5b44');
        scene.fog.density = 0.0092;
        scene.environmentIntensity = 0.45;
        horizonMat.color.set('#dba485');
        skyUniforms.uTintColor.value.set('#ffb478');
        skyUniforms.uHorizonColor.value.set('#c66f4e');
        skyUniforms.uNightFactor.value = 0.14;
        sunLight.color.setHex(0xff9e5e);
        sunLight.intensity = 2.05;
        sunLight.position.set(-20, 11, 14);
        hemiLight.intensity = 0.68;
        if (bloomPass) bloomPass.strength = 0.28;
      } else if (tod === 'night') {
        scene.background.set('#0c1722');
        scene.fog.color.set('#0c1722');
        scene.fog.density = 0.0096;
        scene.environmentIntensity = 0.24;
        horizonMat.color.set('#3e546d');
        skyUniforms.uTintColor.value.set('#223656');
        skyUniforms.uHorizonColor.value.set('#121d2d');
        skyUniforms.uNightFactor.value = 0.88;
        sunLight.color.setHex(0x7aa2d4);
        sunLight.intensity = 0.85;
        sunLight.position.set(12, 22, -12);
        hemiLight.intensity = 0.42;
        if (bloomPass) bloomPass.strength = 0.4;
      } else {
        scene.background.set('#86a79e');
        scene.fog.color.set('#86a79e');
        scene.fog.density = 0.0076;
        scene.environmentIntensity = 0.58;
        horizonMat.color.set('#dce8e6');
        skyUniforms.uTintColor.value.set('#ffffff');
        skyUniforms.uHorizonColor.value.set('#96b7ad');
        skyUniforms.uNightFactor.value = 0.0;
        sunLight.color.setHex(0xfff2d2);
        sunLight.intensity = 2.28;
        sunLight.position.set(16, 26, 14);
        hemiLight.intensity = 0.96;
        if (bloomPass) bloomPass.strength = 0.2;
      }

      if (fWeather !== 'clear') {
        scene.fog.density += 0.0022;
        sunLight.intensity *= 0.75;
        mistMat.opacity = 0.24;
      } else {
        mistMat.opacity = 0.14;
      }

      const selX = SECTOR_WORLD_X[selIdx] ?? 0;
      ambushFireLight.position.set(selX, sampleForestY(selX, sampleRoadZ(selX)) + 2.4, sampleRoadZ(selX));
      ambushFireLight.intensity = 1.2 + Math.sin(elapsed * 9.0) * 0.35;

      // Реакция на приказы игрока (1. Рубить завал / 2. Перекрёстный залп / 3. Кинжальная атака)
      const shotEv = st3?.lastShotEvent;
      if (shotEv && shotEv.seq && shotEv.seq !== lastHandledShotSeq) {
        lastHandledShotSeq = shotEv.seq;
        triggerAmbushSpectacle(shotEv.type, shotEv.sectorIdx ?? selIdx);
      }

      // Непрерывная перестрелка в буковом лесу вокруг эшелонов Воронцова
      ambientSkirmishTimer += dt;
      if (ambientSkirmishTimer > 0.38 && muridPositions.length > 0) {
        ambientSkirmishTimer = 0;
        const m = muridPositions[Math.floor(Math.random() * muridPositions.length)];
        const targetX = m.wx + (Math.random() - 0.5) * 2.4;
        const targetZ = sampleRoadZ(targetX) + (Math.random() - 0.5) * 0.9;
        const targetY = sampleForestY(targetX, targetZ) + 0.32;
        const isMuridShot = Math.random() > 0.25;
        spawnCrossfireTracer(m.wx, m.wy + 0.36, m.wz, targetX, targetY, targetZ, isMuridShot);
        if (isMuridShot) {
          forestMuridUniforms.uVolleyPulse.value = Math.max(forestMuridUniforms.uVolleyPulse.value, 0.36);
          playSpatialBattleSound(
            'rifle_murid_3d',
            { x: m.wx, y: m.wy + 0.4, z: m.wz },
            { enabled: audioActive, environment: 'forest' }
          );
          if (Math.random() < 0.25) {
            playSpatialBattleSound(
              'ricochet_3d',
              { x: targetX, y: targetY, z: targetZ },
              { enabled: audioActive, environment: 'forest' }
            );
          }
        } else {
          forestImpUniforms.uVolleyPulse.value = Math.max(forestImpUniforms.uVolleyPulse.value, 0.35);
          playSpatialBattleSound(
            'rifle_imperial_3d',
            { x: targetX, y: targetY, z: targetZ },
            { enabled: audioActive, environment: 'forest' }
          );
        }
      }

      // Живой бросок мюридов вниз со склонов к обозу при кинжальной атаке
      if (chargeWaveTimer > 0.001) {
        chargeWaveTimer = Math.max(0, chargeWaveTimer - dt * 0.46);
        const surge = Math.sin(chargeWaveTimer * Math.PI) * 1.15;
        for (let i = 0; i < muridPositions.length; i++) {
          const mp = muridPositions[i];
          const curZ = mp.wz - mp.side * surge;
          const curY = sampleForestY(mp.wx, curZ);
          dummy.position.set(mp.wx, curY - 0.02 + Math.abs(Math.sin(elapsed * 8.5 + i)) * 0.025, curZ);
          dummy.rotation.set(0.06 * -mp.side, mp.aimYaw, 0);
          dummy.scale.setScalar(mp.sc);
          dummy.updateMatrix();
          mTorso.setMatrixAt(i, dummy.matrix);
          mPapakha.setMatrixAt(i, dummy.matrix);
          mRifles.setMatrixAt(i, dummy.matrix);
        }
        mTorso.instanceMatrix.needsUpdate = true;
        mPapakha.instanceMatrix.needsUpdate = true;
        mRifles.instanceMatrix.needsUpdate = true;
      }

      dynamicRiggedGlbs.forEach((item) => {
        updateGlbArticulation(item.obj, {
          elapsed,
          dt,
          phase: item.phase,
          moving: item.moving,
          selected: item.selected
        });
      });
      dynamicWheelMeshes.forEach((wItem, wIdx) => {
        wItem.mesh.rotation.z = wItem.moving
          ? -elapsed * 2.2 + wIdx * 0.3
          : Math.sin(elapsed * 1.6 + wIdx) * 0.06;
      });

      // Анимация воды ручья, ветрового колыхания листвы/папоротников, знамени и тумана
      if (streamMat.uniforms?.uTime) {
        streamMat.uniforms.uTime.value = elapsed;
      }
      [beechCrownMat, pineCrownMat, bushMat, felledLeafMat].forEach((m) => {
        if (m.userData?.foliageUniforms?.uFoliageTime) {
          m.userData.foliageUniforms.uFoliageTime.value = elapsed;
        }
      });
      const fAttr = flagGeo.attributes.position;
      for (let i = 0; i < fAttr.count; i++) {
        const bx = baseFlagPos[i * 3];
        const pin = (bx + 0.575) / 1.15;
        fAttr.setZ(i, Math.sin(elapsed * 5.2 - bx * 4.5) * 0.14 * pin);
      }
      fAttr.needsUpdate = true;

      mistSprites.forEach((m) => {
        m.mesh.position.x = m.baseX + Math.sin(elapsed * 0.28 + m.phase) * 0.85;
        m.mesh.position.z = m.baseZ + Math.cos(elapsed * 0.21 + m.phase) * 0.65;
      });

      // Обновление трассеров, клубящегося порохового дыма и лесных осадков
      for (let i = activeTracers.length - 1; i >= 0; i--) {
        const tr = activeTracers[i];
        tr.progress += dt * tr.speed;
        if (tr.progress >= 1) {
          scene.remove(tr.mesh);
          activeTracers.splice(i, 1);
        } else {
          tr.mesh.position.set(
            tr.sx + (tr.tx - tr.sx) * tr.progress,
            tr.sy + (tr.ty - tr.sy) * tr.progress,
            tr.sz + (tr.tz - tr.sz) * tr.progress
          );
        }
      }

      smokeSys.update(dt, camera, 0.26, 0.05);

      sunDirTmp.copy(sunLight.position).normalize();
      forestEaglesGroup.children.forEach((eg, idx) => {
        updatePhotorealGoldenEagle(eg, elapsed, idx === 0 ? sunDirTmp : null);
      });

      // Камера (гарантированно выше рельефа и крон переднего берега, или сопровождение парящего беркута в ракурсе 'eagle')
      const c = cameraCtrlRef.current;
      if (latestPropsRef.current.activePreset === 'eagle' && forestEaglesGroup.children.length > 0) {
        const leadPos = forestEaglesGroup.children[0].position;
        const egDist = 3.85 / Math.max(0.65, c.zoom);
        const camX = leadPos.x + Math.sin(c.yaw) * Math.cos(c.pitch) * egDist;
        const camZ = leadPos.z + Math.cos(c.yaw) * Math.cos(c.pitch) * egDist;
        const camY = Math.max(leadPos.y - 0.8, leadPos.y + Math.sin(c.pitch) * egDist);
        camera.position.set(camX, camY, camZ);
        camera.lookAt(leadPos.x, leadPos.y - 0.1, leadPos.z);
      } else {
        const dist = 24.5 / c.zoom;
        const lookY = sampleForestY(c.panX, c.panZ) + 0.75;
        const camX = c.panX + Math.sin(c.yaw) * Math.cos(c.pitch) * dist;
        const camZ = c.panZ + Math.cos(c.yaw) * Math.cos(c.pitch) * dist;
        const minSafeY = sampleForestY(camX, camZ) + 4.2;
        const camY = Math.max(minSafeY, lookY + Math.sin(c.pitch) * dist);
        camera.position.set(camX, camY, camZ);
        camera.lookAt(c.panX, lookY, c.panZ);
      }
      forestSkyDome.position.copy(camera.position);

      const streamZ = Math.min(worldD * 0.5 - 2.2, sampleRoadZ(c.panX) + 5.6);
      updateSpatialBattleScape({
        enabled: audioActive,
        mode: 'forest',
        camera,
        riverPoint: { x: c.panX, y: sampleForestY(c.panX, streamZ), z: streamZ },
        weatherMode: fWeather
      });

      precipSys.setMode(fWeather);
      precipSys.update(elapsed, c.panX, c.panZ);

      if (postFx) {
        postFx.update({
          elapsed,
          camera,
          sunDir: sunDirTmp,
          sunColor: sunLight.color,
          weatherMode: fWeather
        });
      }

      // Проекция экранных координат плашек 5 участков сплайна (~12 раз в секунду)
      badgeSyncTimer += dt;
      if (badgeSyncTimer > 0.085) {
        badgeSyncTimer = 0;
        const w = renderer.domElement.clientWidth || initW;
        const h = renderer.domElement.clientHeight || initH;
        const nextBadges = SECTOR_WORLD_X.map((sx, idx) => {
          const sz = sampleRoadZ(sx);
          const sy = sampleForestY(sx, sz) + 1.55;
          projVec.set(sx, sy, sz).project(camera);
          return {
            idx,
            visible: projVec.z < 1.0 && Math.abs(projVec.x) < 0.96 && Math.abs(projVec.y) < 0.92,
            x: (projVec.x * 0.5 + 0.5) * w,
            y: (-projVec.y * 0.5 + 0.5) * h
          };
        });
        setProjectedBadges(nextBadges);
      }

      fpsGov.tick(dt);
      renderer.domElement.dataset.camZoom = String(cameraCtrlRef.current.zoom.toFixed(3));
      renderer.domElement.dataset.camYaw = String(cameraCtrlRef.current.yaw.toFixed(3));

      if (composer) {
        try {
          composer.render();
        } catch {
          composer = null;
          renderer.render(scene, camera);
        }
      } else {
        renderer.render(scene, camera);
      }
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      disposed = true;
      suspendSpatialBattleAudio();
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      touchControls.dispose();
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      renderer.domElement.removeEventListener('wheel', onWheel);
      renderer.domElement.removeEventListener('contextmenu', onContextMenu);
      sceneApiRef.current = null;
      smokeSys.dispose();
      precipSys.dispose();
      if (gtaoPass) gtaoPass.dispose();
      if (postFx) postFx.dispose();
      if (composer) composer.dispose();
      pbrPack.dispose();
      scene.traverse((sub) => {
        if (sub.isInstancedMesh) sub.dispose();
        disposePhotorealCavalryInstance(sub);
        disposePhotorealCorpsInstance(sub);
        disposePhotorealEagleInstance(sub);
      });
      disposableGeometries.forEach((g) => g.dispose());
      disposableMaterials.forEach((m) => m.dispose());
      disposableTextures.forEach((tx) => tx.dispose());
      renderer.dispose();
    };
  }, [setSelectedSplineIdx]);

  // Перестраиваем 3D-засеки и эшелоны при изменении состояния боя
  useEffect(() => {
    if (sceneApiRef.current?.rebuildDynamicSectors) {
      sceneApiRef.current.rebuildDynamicSectors();
    }
  }, [splineSegments, splineEchelons, selectedSplineIdx]);

  if (!webglReady) {
    return (
      <div className="p-6 text-center text-xs text-stone-300 bg-[#0b120d]">
        {t('WebGL недоступен — переключитесь на 2D-схему сплайна.', 'WebGL unavailable — switch to 2D spline diagram.')}
      </div>
    );
  }

  return (
    <div
      className={`relative w-full overflow-hidden select-none transition-all duration-300 ${
        tallCinema ? 'h-[480px] sm:h-[640px]' : 'h-[350px] sm:h-[450px]'
      } max-h-[74dvh] lg:max-h-none`}
    >
      <div ref={mountRef} className="w-full h-full" />

      {/* Интерактивные тактические маркеры 5 участков Ичкерийской лесной тропы поверх 3D-дороги */}
      {projectedBadges.map((b) => {
        if (!b.visible) return null;
        const seg = splineSegments[b.idx];
        if (!seg) return null;
        const ech = splineEchelons.find((e) => e.segmentIdx === b.idx);
        const isSel = b.idx === selectedSplineIdx;
        return (
          <button
            key={seg.id || b.idx}
            type="button"
            onClick={() => setSelectedSplineIdx && setSelectedSplineIdx(b.idx)}
            style={{
              left: `${b.x}px`,
              top: `${b.y}px`,
              transform: 'translate(-50%, -50%)'
            }}
            className={`absolute z-10 px-2 py-1 rounded-lg border text-left backdrop-blur-sm cursor-pointer transition shadow-lg ${
              isSel
                ? 'bg-emerald-950/92 border-emerald-400 ring-1 ring-emerald-300/60 scale-105'
                : ech
                ? 'bg-rose-950/88 border-rose-400/75 hover:border-amber-300'
                : 'bg-[#0b110e]/85 border-amber-500/45 hover:border-emerald-400/70'
            }`}
          >
            <div className="flex items-center gap-1.5 text-[10px] font-serif font-bold text-stone-100 whitespace-nowrap">
              <span className={isSel ? 'text-emerald-300' : 'text-amber-300'}>
                #{b.idx + 1}
              </span>
              <span>{t('Завал:', 'Abatis:')} {seg.barricades}</span>
            </div>
            {ech && (
              <div className="text-[9.5px] hud-num font-bold text-rose-200 whitespace-nowrap">
                🥖 {ech.strength} {t('шт.', 'bay.')} • {t('Строй', 'Coh.')} {ech.cohesion}%
              </div>
            )}
          </button>
        );
      })}

      {/* Панель ракурсов Total War и освещения букового леса */}
      <div className="absolute bottom-2 left-2 right-2 z-20 flex flex-wrap items-center justify-between gap-1.5 pointer-events-none">
        <div className="hud-mobile-scroll max-w-full overflow-x-auto flex items-center flex-nowrap lg:flex-wrap gap-1 bg-[#090f0c]/88 border border-emerald-500/40 rounded-lg p-1 pointer-events-auto backdrop-blur-sm">
          {[
            { id: 'defile', ru: '🌲 Панорама Речель', en: '🌲 Rechel Panorama' },
            { id: 'convoy', ru: '🥖 Обоз в западне', en: '🥖 Trapped Convoy' },
            { id: 'ridge', ru: '🏔️ Гребень мюридов', en: '🏔️ Murid Ridge' },
            { id: 'eagle', ru: '🦅 Беркуты', en: '🦅 Eagles' },
            { id: 'top', ru: '🗺️ С высоты', en: '🗺️ Tactical Top' }
          ].map((pr) => (
            <button
              key={pr.id}
              type="button"
              onClick={() => applyCameraPreset(pr.id)}
              className={`shrink-0 px-2 py-0.5 rounded text-[10.5px] font-bold cursor-pointer transition ${
                activePreset === pr.id
                  ? 'bg-emerald-500 text-stone-950 shadow'
                  : 'text-stone-200 hover:bg-stone-800'
              }`}
            >
              {t(pr.ru, pr.en)}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 bg-[#090f0c]/88 border border-amber-500/35 rounded-lg p-1 pointer-events-auto backdrop-blur-sm">
          {[
            { id: 'day', label: '☀️' },
            { id: 'sunset', label: '🌅' },
            { id: 'night', label: '🌙' }
          ].map((tm) => (
            <button
              key={tm.id}
              type="button"
              onClick={() => setForestTimeOfDay(tm.id)}
              className={`px-1.5 py-0.5 rounded text-[11px] cursor-pointer transition ${
                forestTimeOfDay === tm.id ? 'bg-amber-400 text-stone-950 font-bold' : 'text-stone-300 hover:bg-stone-800'
              }`}
            >
              {tm.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setForestWeather((prev) => (prev === 'clear' ? 'rain' : prev === 'rain' ? 'snow' : 'clear'))}
            className={`px-1.5 py-0.5 rounded text-[11px] cursor-pointer transition border ${
              forestWeather === 'rain'
                ? 'bg-sky-700 text-sky-100 border-sky-400'
                : forestWeather === 'snow'
                ? 'bg-slate-200 text-slate-950 border-white'
                : 'text-sky-200 border-transparent hover:bg-stone-800'
            }`}
            title={t('Погода леса: Ясно / Ливень / Снегопад', 'Forest weather: Clear / Rain / Snow')}
          >
            {forestWeather === 'rain' ? '🌧️' : forestWeather === 'snow' ? '❄️' : '🌤️'}
          </button>
          <button
            type="button"
            onClick={() => {
              setSpatialAudioOn((prev) => {
                const next = !prev;
                if (next) unlockSpatialBattleAudio(true);
                else suspendSpatialBattleAudio();
                return next;
              });
            }}
            className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer transition border ${
              soundEnabled && spatialAudioOn
                ? 'bg-emerald-500/25 text-emerald-200 border-emerald-400/50'
                : 'text-stone-400 border-transparent hover:bg-stone-800'
            }`}
            title={t('Пространственный 3D-звук букового леса и ручья', 'Spatial 3D Beech Forest & Stream Audio')}
          >
            {soundEnabled && spatialAudioOn ? '🔊 3D' : '🔇 3D'}
          </button>
          <button
            type="button"
            onClick={() => setTallCinema((v) => !v)}
            className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition ${
              tallCinema ? 'bg-sky-400 text-stone-950' : 'text-sky-200 hover:bg-stone-800'
            }`}
          >
            {tallCinema ? t('🗗 Компактно', '🗗 Compact') : t('🖥️ Крупный план', '🖥️ Cinema')}
          </button>
        </div>
      </div>
    </div>
  );
}
