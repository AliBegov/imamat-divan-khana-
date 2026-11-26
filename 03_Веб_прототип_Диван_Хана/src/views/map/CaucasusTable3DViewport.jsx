// ============================================================================
// ЖИВОЙ 3D-ДАГЕСТАН И КАВКАЗ (Three.js WebGL2 + NASA SRTM 30м DEM 384x256 + Triplanar GLSL PBR)
// Реальная спутниковая топография Дагестана и Восточного Кавказа (196 608 треугольников):
// Сулакский каньон, столовые плато Хунзаха и Верхнего Гуниба, куэсты Андалала и Чоха,
// Богосский массив (4152 м), Главный Кавказский хребет, 7 рек по реальным тальвегам SRTM,
// берег Каспия, каскадные каменные аулы, леса Ичкерии и Дагестана, физическое небо и облака.
// ============================================================================
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { attachCleanGtaoPass, loadCaucasusPbrPack } from '../../data/caucasusPbrTextures.js';
import {
  attachCinematicPostFX,
  createBillowingSmokeTexture,
  createBlackPowderSmokeSystem,
  createCaucasusPrecipitationSystem,
  createLayeredValleyMistTexture
} from '../shared/caucasusAtmosphereAndPostFX.js';
import {
  createBeechFoliageAtlasTexture,
  createConiferBoughAtlasTexture,
  createFernUndergrowthTexture,
  createFoliageCardMaterial,
  createRealisticBeechCanopyGeometry,
  createRealisticConiferGeometry,
  createRealisticTrunkGeometry,
  createUndergrowthBushGeometry
} from '../shared/caucasusFoliageAndUnits3D.js';
import {
  playHistoricalSound,
  playSpatialBattleSound,
  suspendSpatialBattleAudio,
  unlockSpatialBattleAudio,
  updateSpatialBattleScape
} from '../../game/audio.js';
import { updateGlbArticulation } from '../shared/caucasusTroopAnimation3D.js';
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
  createPhotorealImperialColumnInstance,
  createPhotorealSupplyWagonInstance,
  createPhotorealUnicornCannonInstance,
  disposePhotorealCorpsInstance
} from '../shared/caucasusPhotorealColumnsArtillery3D.js';
import {
  createPhotorealImamatCapitalInstance,
  createPhotorealImperialFortressInstance,
  createPhotorealStoneBridgeInstance,
  createPhotorealVainakhTowerInstance,
  disposePhotorealFortressInstance,
  getDetailedSaklyaAssets,
  updatePhotorealFortressFlags
} from '../shared/caucasusPhotorealFortresses3D.js';
import {
  createBarkPbrMaterials,
  createPhotorealSignalBeaconInstance,
  createRiverBoulderFoamWakeGeometry,
  createRiverBoulderFoamWakeMaterial,
  createRiverRapidBoulderGeometry,
  createStratifiedCliffRockGeometry,
  disposePhotorealNatureInstance,
  updatePhotorealSignalBeacons
} from '../shared/caucasusPhotorealNature3D.js';
import {
  CAUCASUS_RIVER_DEFS,
  buildPhotorealRiverRibbonGeometry,
  createExtendedCaucasusSurroundMaterial,
  createPhotorealCaucasusTerrainMaterial,
  createPhotorealRiverMaterial,
  createPhotorealSkyMaterial,
  sampleCaucasusRiverRapidPoints,
  samplePhotorealCaucasusWorld,
  snapBridgeToRiverChannel
} from './caucasusPhotorealShaders.js';

// Перевод игровых координат карты (0..700, 0..460) в мировые 3D-координаты стола (-35..+35, -23..+23)
function mapToWorld(mx, my) {
  return samplePhotorealCaucasusWorld(mx, my);
}

// Генерация процедурной PBR-карты микрорельефа слоистого известняка и каменной кладки (512x512)
function createProceduralBumpCanvas() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  const img = ctx.createImageData(512, 512);
  const d = img.data;
  for (let y = 0; y < 512; y++) {
    for (let x = 0; x < 512; x++) {
      const n1 = Math.sin(x * 0.19 + y * 0.11) * Math.cos(y * 0.23 - x * 0.07);
      const n2 = Math.sin(x * 0.63 - y * 0.47) * 0.5;
      const strata = Math.sin(y * 0.41 + n1 * 2.4) * 0.38;
      const grain = ((x * 73856093) ^ (y * 19349663)) & 31;
      const val = Math.max(0, Math.min(255, Math.round(128 + (n1 + n2 + strata) * 44 + (grain - 16))));
      const idx = (y * 512 + x) * 4;
      d[idx] = val;
      d[idx + 1] = val;
      d[idx + 2] = val;
      d[idx + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}

export default function CaucasusTable3DViewport({
  battleMemorials = [],
  capitalLabelEn = 'Dargo-Vedeno',
  capitalLabelRu = 'Дарго-Ведено',
  capitalNaibateId = 'vedeno',
  cordonFortresses = [],
  dioramaTimeOfDay = 'day',
  externalCameraCmd = null,
  handleCycleSeason3D,
  handleCycleTimeOfDay,
  handleInterceptImperialColumn,
  handleSeverColumnSupplyLine,
  handleStrategicMapClick,
  handleToggleRiverBridge,
  handleToggleSignalBeacon,
  imperialHeldIds = [],
  liveFieldUnits = [],
  liveImperialColumns = [],
  naibates = [],
  riverBridges = [],
  seasonPhase = 'summer',
  selectedNaibateId,
  selectedUnitId,
  setHoveredMapInfo,
  setSelectedNaibateId,
  setSelectedUnitId,
  signalBeacons = [],
  soundEnabled = true,
  t,
  weatherOverlayEnabled = true
}) {
  const mountRef = useRef(null);
  const salvoCommandRef = useRef(0);
  const trackedEagleIdxRef = useRef(0);
  const trackedRiderIdxRef = useRef(0);
  const trackedCorpsIdxRef = useRef(0);
  const trackedFortIdxRef = useRef(0);
  const trackedNatureIdxRef = useRef(0);
  const [cameraPresetLabel, setCameraPresetLabel] = useState('theatre');
  const [showAllLabels3D, setShowAllLabels3D] = useState(false);
  const [weatherMode3D, setWeatherMode3D] = useState('auto');
  const [hudLabels, setHudLabels] = useState([]);
  const orbitRef = useRef({
    yaw: 0.0,
    pitch: 0.76,
    radius: 47.5,
    targetX: 0,
    targetZ: -0.4,
    isDragging: false,
    dragButton: 0,
    lastX: 0,
    lastY: 0,
    movedPx: 0
  });

  // Синхронизация внешних кнопок зума/сброса/панорамы из верхней панели MapTab
  const lastExtSeqRef = useRef(0);
  useEffect(() => {
    if (!externalCameraCmd || !externalCameraCmd.seq || externalCameraCmd.seq === lastExtSeqRef.current) {
      return;
    }
    lastExtSeqRef.current = externalCameraCmd.seq;
    const o = orbitRef.current;
    if (externalCameraCmd.type === 'zoom_in') {
      o.radius = Math.max(18, o.radius - 8.5);
    } else if (externalCameraCmd.type === 'zoom_out') {
      o.radius = Math.min(80, o.radius + 8.5);
    } else if (externalCameraCmd.type === 'reset') {
      o.yaw = 0.0;
      o.pitch = 0.76;
      o.radius = 47.5;
      o.targetX = 0;
      o.targetZ = -0.4;
      setCameraPresetLabel('theatre');
    } else if (externalCameraCmd.type === 'pan') {
      o.targetX = Math.max(-28, Math.min(28, o.targetX + (externalCameraCmd.dx || 0) * 0.08));
      o.targetZ = Math.max(-20, Math.min(20, o.targetZ + (externalCameraCmd.dy || 0) * 0.08));
    } else if (externalCameraCmd.type === 'focus_point') {
      const wx = Math.max(-28, Math.min(28, ((externalCameraCmd.mx ?? 350) - 350) / 10));
      const wz = Math.max(-20, Math.min(20, ((externalCameraCmd.my ?? 230) - 230) / 10));
      o.targetX = wx;
      o.targetZ = wz;
      o.radius = Math.min(o.radius, 25.5);
      o.pitch = 0.52;
      setCameraPresetLabel('focus');
    }
  }, [externalCameraCmd]);

  // Храним актуальные пропсы в ref для плавного игрового цикла 60–120 FPS без пересоздания WebGLRenderer
  const latestPropsRef = useRef({
    cameraPresetLabel,
    naibates,
    capitalNaibateId,
    capitalLabelRu,
    capitalLabelEn,
    imperialHeldIds,
    seasonPhase,
    showAllLabels3D,
    weatherMode3D,
    liveFieldUnits,
    liveImperialColumns,
    cordonFortresses,
    riverBridges,
    signalBeacons,
    battleMemorials,
    selectedNaibateId,
    selectedUnitId,
    dioramaTimeOfDay,
    weatherOverlayEnabled,
    soundEnabled,
    setSelectedNaibateId,
    setSelectedUnitId,
    setHoveredMapInfo,
    handleInterceptImperialColumn,
    handleSeverColumnSupplyLine,
    handleToggleRiverBridge,
    handleToggleSignalBeacon,
    handleStrategicMapClick
  });
  useEffect(() => {
    latestPropsRef.current = {
      cameraPresetLabel,
      naibates,
      capitalNaibateId,
      capitalLabelRu,
      capitalLabelEn,
      imperialHeldIds,
      seasonPhase,
      showAllLabels3D,
      weatherMode3D,
      liveFieldUnits,
      liveImperialColumns,
      cordonFortresses,
      riverBridges,
      signalBeacons,
      battleMemorials,
      selectedNaibateId,
      selectedUnitId,
      dioramaTimeOfDay,
      weatherOverlayEnabled,
      soundEnabled,
      setSelectedNaibateId,
      setSelectedUnitId,
      setHoveredMapInfo,
      handleInterceptImperialColumn,
      handleSeverColumnSupplyLine,
      handleToggleRiverBridge,
      handleToggleSignalBeacon,
      handleStrategicMapClick
    };
  });

  const applyCameraPreset = (preset) => {
    const o = orbitRef.current;
    setCameraPresetLabel(preset);
    if (preset === 'theatre') {
      o.yaw = 0.0;
      o.pitch = 0.76;
      o.radius = 47.5;
      o.targetX = 0;
      o.targetZ = -0.4;
    } else if (preset === 'heroes') {
      o.yaw = 2.78;
      o.pitch = 0.5;
      o.radius = 21.5;
      o.targetX = -11.5;
      o.targetZ = -1.8;
    } else if (preset === 'dargo') {
      o.yaw = 2.62;
      o.pitch = 0.54;
      o.radius = 28;
      o.targetX = -10.5;
      o.targetZ = -3.5;
    } else if (preset === 'avaria') {
      o.yaw = -2.84;
      o.pitch = 0.44;
      o.radius = 22.5;
      o.targetX = 8.8;
      o.targetZ = 0.8;
    } else if (preset === 'cordon') {
      o.yaw = 3.08;
      o.pitch = 0.46;
      o.radius = 43;
      o.targetX = -2.0;
      o.targetZ = -6.0;
    } else if (preset === 'eagles') {
      if (cameraPresetLabel === 'eagles') {
        trackedEagleIdxRef.current = (trackedEagleIdxRef.current + 1) % 9;
      }
      o.yaw = 0.52;
      o.pitch = 0.34;
      o.radius = 2.05;
      o.targetX = 4.5;
      o.targetZ = -1.8;
      playSpatialBattleSound('eagle_cry_3d', { x: 4.5, y: 9.2, z: -1.8 }, {
        enabled: Boolean(latestPropsRef.current.soundEnabled),
        environment: 'gorge'
      });
    } else if (preset === 'riders') {
      const heroOrder = { unit_hadji_murat: 0, unit_baysungur: 1, unit_chapar_vedeno: 2 };
      const mounted = (latestPropsRef.current.liveFieldUnits || [])
        .filter((u) => {
          const nm = `${u.nameRu || ''} ${u.badgeRu || ''}`.toLowerCase();
          return (
            u.type !== 'artillery' &&
            !nm.includes('оруд') &&
            !nm.includes('артил') &&
            u.type !== 'wagon' &&
            !nm.includes('обоз')
          );
        })
        .sort((a, b) => (heroOrder[a.id] ?? 9) - (heroOrder[b.id] ?? 9));
      if (mounted.length > 0) {
        if (cameraPresetLabel === 'riders') {
          trackedRiderIdxRef.current = (trackedRiderIdxRef.current + 1) % mounted.length;
        } else {
          trackedRiderIdxRef.current = 0;
        }
        const targetU = mounted[trackedRiderIdxRef.current];
        if (targetU && latestPropsRef.current.setSelectedUnitId) {
          latestPropsRef.current.setSelectedUnitId(targetU.id);
        }
      }
      o.yaw = -0.68;
      o.pitch = 0.17;
      o.radius = 4.15;
      playHistoricalSound('gallop', latestPropsRef.current.soundEnabled);
    } else if (preset === 'columns') {
      if (cameraPresetLabel === 'columns') {
        trackedCorpsIdxRef.current = (trackedCorpsIdxRef.current + 1) % 12;
      } else {
        trackedCorpsIdxRef.current = 0;
      }
      o.yaw = -0.58;
      o.pitch = 0.22;
      o.radius = 3.65;
      playHistoricalSound('paper', latestPropsRef.current.soundEnabled);
    } else if (preset === 'fortresses') {
      if (cameraPresetLabel === 'fortresses') {
        trackedFortIdxRef.current = (trackedFortIdxRef.current + 1) % 14;
      } else {
        trackedFortIdxRef.current = 0;
      }
      o.yaw = 0.56;
      o.pitch = 0.30;
      o.radius = 5.45;
      playHistoricalSound('seal', latestPropsRef.current.soundEnabled);
    } else if (preset === 'nature') {
      const totalNature = 6 + (latestPropsRef.current.riverBridges?.length || 0);
      if (cameraPresetLabel === 'nature') {
        trackedNatureIdxRef.current = (trackedNatureIdxRef.current + 1) % totalNature;
      } else {
        trackedNatureIdxRef.current = 0;
      }
      const nIdx = trackedNatureIdxRef.current;
      if (nIdx === 0 || nIdx === 3 || nIdx === 5) {
        // Сигнальные сторожевые маяки с огнём и дымом
        o.yaw = 0.64;
        o.pitch = 0.25;
        o.radius = 3.45;
      } else if (nIdx === 1 || nIdx === 4) {
        // Пенистые горные пороги Койсу и Аргуна (вдоль оси ущелья, прямо над водой!)
        o.yaw = 0.14;
        o.pitch = 0.44;
        o.radius = 4.15;
      } else if (nIdx >= 6) {
        // Каменные сводчатые мосты строго над руслами рек Сунжи, Аргуна, Сулака и Кара-Койсу
        o.yaw = 0.0;
        o.pitch = 0.44;
        o.radius = 5.2;
      } else {
        // Горный буково-сосновый лес, подлесок и скальные обрывы
        o.yaw = 0.56;
        o.pitch = 0.34;
        o.radius = 4.35;
      }
      playHistoricalSound('paper', latestPropsRef.current.soundEnabled);
    }
  };

  const triggerManualBatterySalvo = () => {
    salvoCommandRef.current += 1;
    playHistoricalSound('cannon', latestPropsRef.current.soundEnabled);
  };

  const fpsGovRef = useRef(null);
  const [perfMode3D, setPerfMode3D] = useState('auto');
  const [isTouchUi] = useState(() => detectMobileDeviceProfile().isTouch);
  const handleCyclePerfMode = () => {
    const next = perfMode3D === 'auto' ? 'perf60' : perfMode3D === 'perf60' ? 'ultra' : 'auto';
    setPerfMode3D(next);
    if (fpsGovRef.current) fpsGovRef.current.setQualityMode(next);
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return undefined;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    } catch {
      return undefined;
    }

    const devProfile = detectMobileDeviceProfile();
    const width = container.clientWidth || 960;
    const height = container.clientHeight || 540;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, devProfile.maxDpr));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#9dc0dc');
    scene.fog = new THREE.FogExp2('#9dc0dc', 0.0021);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.18, 680);

    // Пакет CC0-фотограмметрии Кавказа и небесный PMREM IBL
    let skyUniformsRef = null;
    let riverMatRef = null;
    const pbrPack = loadCaucasusPbrPack(renderer, {
      onSkyReady: (pack) => {
        if (scene) scene.environment = pack.envMap;
        if (skyUniformsRef) {
          skyUniformsRef.uSkyTex.value = pack.skyEquirectTex;
          skyUniformsRef.uHasSkyTex.value = 1.0;
        }
        if (riverMatRef?.uniforms?.uSkyTex) {
          riverMatRef.uniforms.uSkyTex.value = pack.skyEquirectTex;
          riverMatRef.uniforms.uHasSky.value = 1.0;
        }
      }
    });
    scene.environment = pbrPack.envMap;
    scene.environmentIntensity = 0.62;

    // Постобработка: RenderPass + контактные тени GTAOPass + UnrealBloomPass + SMAAPass + OutputPass + CinematicGradePass
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
        width,
        height,
        clipBox: new THREE.Box3(new THREE.Vector3(-42, -3, -30), new THREE.Vector3(42, 22, 30)),
        blendIntensity: 0.72,
        radius: 0.85,
        distanceExponent: 1.4,
        thickness: 1.0
      });
      bloomPass = new UnrealBloomPass(
        new THREE.Vector2(Math.max(256, Math.round(width / 2)), Math.max(256, Math.round(height / 2))),
        0.2,
        0.36,
        0.93
      );
      composer.addPass(bloomPass);
      postFx = attachCinematicPostFX(composer, { width, height });
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
    fpsGovRef.current = fpsGov;

    // 0. Фотореалистичный небосвод Кавказа (CC0 Pure Sky облака + Рэлей–Ми + звёзды ночью)
    const skyGeo = new THREE.SphereGeometry(310, 48, 28);
    const { skyMat, skyUniforms } = createPhotorealSkyMaterial(pbrPack);
    skyUniformsRef = skyUniforms;
    const skyDome = new THREE.Mesh(skyGeo, skyMat);
    scene.add(skyDome);

    // Дальняя многослойная панорама заснеженных вершин Большого Кавказа по горизонту (360°)
    const ridgeGeo = new THREE.CylinderGeometry(172, 182, 42, 160, 8, true);
    const rPos = ridgeGeo.attributes.position;
    const rColors = new Float32Array(rPos.count * 3);
    const rcTmp = new THREE.Color();
    for (let i = 0; i < rPos.count; i++) {
      const rx = rPos.getX(i);
      const ry = rPos.getY(i);
      const rz = rPos.getZ(i);
      const ang = Math.atan2(rz, rx);
      // На юге (положительный Z) высится стена Главного хребта, на севере — плавная дымка степи
      const southWeight = 0.42 + 0.58 * Math.max(0, Math.sin(ang));
      const jagged =
        (Math.abs(Math.sin(ang * 7.0 + 0.4)) * 0.46 +
          Math.abs(Math.cos(ang * 17.0 + 1.3)) * 0.31 +
          Math.abs(Math.sin(ang * 33.0 - 0.8)) * 0.16 +
          0.32) *
        southWeight;
      const normY = (ry + 21) / 42;
      const finalY = -3.0 + normY * (4.2 + jagged * 21.0);
      rPos.setY(i, finalY);
      if (normY > 0.62 && southWeight > 0.52) {
        rcTmp.set('#e2ecf5');
      } else if (normY > 0.36) {
        rcTmp.set('#647e99');
      } else {
        rcTmp.set('#475e75');
      }
      rColors[i * 3] = rcTmp.r;
      rColors[i * 3 + 1] = rcTmp.g;
      rColors[i * 3 + 2] = rcTmp.b;
    }
    ridgeGeo.setAttribute('color', new THREE.BufferAttribute(rColors, 3));
    ridgeGeo.computeVertexNormals();
    const ridgeMat = new THREE.MeshStandardMaterial({
      color: '#d8e6f2',
      vertexColors: true,
      roughness: 0.94,
      metalness: 0.02,
      fog: true,
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.9
    });
    const distantRidgeMesh = new THREE.Mesh(ridgeGeo, ridgeMat);
    scene.add(distantRidgeMesh);

    // Физически сбалансированное горное освещение с мягкими тенями 2048x2048
    const hemiLight = new THREE.HemisphereLight('#dbeafe', '#574736', 1.04);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight('#fff5de', 2.42);
    sunLight.position.set(-34, 42, -18);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.set(devProfile.shadowMapSize, devProfile.shadowMapSize);
    sunLight.shadow.bias = -0.00032;
    sunLight.shadow.normalBias = 0.02;
    sunLight.shadow.camera.near = 6;
    sunLight.shadow.camera.far = 140;
    sunLight.shadow.camera.left = -42;
    sunLight.shadow.camera.right = 42;
    sunLight.shadow.camera.top = 30;
    sunLight.shadow.camera.bottom = -30;
    scene.add(sunLight);

    // Мягкий контровой свет от снежных склонов (Fill Light для читаемости теневых каньонов)
    const bounceLight = new THREE.DirectionalLight('#93c5fd', 0.42);
    bounceLight.position.set(28, 22, 26);
    scene.add(bounceLight);

    // Деликатный фронтальный свет на южный геологический срез макета (убирает чернильную тень разреза)
    const frontRimLight = new THREE.DirectionalLight('#cbd5e1', 0.58);
    frontRimLight.position.set(0, 18, 44);
    scene.add(frontRimLight);

    const oilLampLight = new THREE.PointLight('#fb923c', 0.35, 64, 1.5);
    oilLampLight.position.set(-24, 20, 12);
    scene.add(oilLampLight);

    const salvoFlashLight = new THREE.PointLight('#fde047', 0.0, 26, 1.35);
    scene.add(salvoFlashLight);

    const lightningLight = new THREE.DirectionalLight('#bae6fd', 0.0);
    lightningLight.position.set(14, 48, -10);
    scene.add(lightningLight);

    // 1. Бесшовная континентальная панорама вокруг карты Дагестана и Кавказа (0-й ряд сшит с границей 70x46 — без рамы и обрыва!)
    const segX = 384;
    const segZ = 256;
    const buildSeamlessSurroundGeo = () => {
      const halfW = 35.0;
      const halfD = 23.0;
      const ringCount = 24;
      const edgeSamples = [];
      for (let i = 0; i < segX; i++) edgeSamples.push({ bx: -halfW + (i / segX) * (halfW * 2), bz: -halfD });
      for (let i = 0; i < segZ; i++) edgeSamples.push({ bx: halfW, bz: -halfD + (i / segZ) * (halfD * 2) });
      for (let i = 0; i < segX; i++) edgeSamples.push({ bx: halfW - (i / segX) * (halfW * 2), bz: halfD });
      for (let i = 0; i < segZ; i++) edgeSamples.push({ bx: -halfW, bz: halfD - (i / segZ) * (halfD * 2) });

      const P = edgeSamples.length;
      const edgeHeights = new Float32Array(P);
      for (let p = 0; p < P; p++) {
        const mx = Math.max(0, Math.min(700, edgeSamples[p].bx * 10 + 350));
        const my = Math.max(0, Math.min(460, edgeSamples[p].bz * 10 + 230));
        edgeHeights[p] = mapToWorld(mx, my).wy;
      }

      const smooth = (e0, e1, v) => {
        const t = Math.max(0, Math.min(1, (v - e0) / (e1 - e0)));
        return t * t * (3 - 2 * t);
      };

      const verts = new Float32Array((ringCount + 1) * P * 3);
      const uvs = new Float32Array((ringCount + 1) * P * 2);
      const indices = [];

      for (let r = 0; r <= ringCount; r++) {
        const dist = 158.0 * Math.pow(r / ringCount, 1.75);
        const blendEdge = Math.exp(-dist / 13.5);
        for (let p = 0; p < P; p++) {
          const { bx, bz } = edgeSamples[p];
          const wx = bx + (bx / halfW) * dist;
          const wz = bz + (bz / halfD) * dist;

          // Бесшовное продолжение реального Каспия на востоке и отрогов Главного Кавказского хребта на юге
          const isEdgeSea = edgeHeights[p] <= 0.065 && bx >= halfW - 0.15;
          const caspianCoast =
            37.8 + Math.sin(wz * 0.055) * 3.8 + smooth(-6.0, 18.0, wz) * 5.2;
          const seaDrop = isEdgeSea ? 1.0 : smooth(caspianCoast - 2.4, caspianCoast + 4.8, wx);
          const southMtn = smooth(21.0, 96.0, wz);
          const westFoot = smooth(-35.0, -98.0, wx);
          const ridgeWave =
            0.55 +
            0.35 * Math.sin(wx * 0.085 + 0.6) * Math.cos(wz * 0.072) +
            0.22 * Math.sin((wx + wz) * 0.14);
          let farH =
            0.34 +
            southMtn * (3.8 + 5.2 * Math.max(0, ridgeWave)) +
            westFoot * (1.2 + 2.0 * Math.max(0, ridgeWave)) +
            0.22 * Math.sin(wx * 0.11) * Math.cos(wz * 0.11);
          farH = isEdgeSea ? 0.04 : farH * (1.0 - seaDrop * 0.96) + seaDrop * 0.04;

          const wy = r === 0 ? edgeHeights[p] : isEdgeSea ? 0.04 : edgeHeights[p] * blendEdge + farH * (1.0 - blendEdge);
          const vIdx = r * P + p;
          verts[vIdx * 3] = wx;
          verts[vIdx * 3 + 1] = wy;
          verts[vIdx * 3 + 2] = wz;
          uvs[vIdx * 2] = wx * 0.02 + 0.5;
          uvs[vIdx * 2 + 1] = wz * 0.02 + 0.5;

          if (r < ringCount) {
            const next = (p + 1) % P;
            const i0 = r * P + p;
            const i1 = r * P + next;
            const o0 = (r + 1) * P + p;
            const o1 = (r + 1) * P + next;
            indices.push(i0, i1, o1, i0, o1, o0);
          }
        }
      }

      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(verts, 3));
      g.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
      g.setIndex(indices);
      g.computeVertexNormals();
      return g;
    };

    const initialPhase = latestPropsRef.current.seasonPhase || 'summer';

    const deskSurroundGeo = buildSeamlessSurroundGeo();
    const deskSurroundMat = createExtendedCaucasusSurroundMaterial({ pbrPack, edgeMap: null });
    const surroundUniforms = deskSurroundMat.userData.shaderUniforms;
    const deskSurround = new THREE.Mesh(deskSurroundGeo, deskSurroundMat);
    deskSurround.receiveShadow = true;
    scene.add(deskSurround);

    // 2. Ультрадетальный 3D-рельеф Дагестана и Кавказа NASA SRTM 30м (384x256 = 196 608 тр. + литологический GLSL PBR)
    const terrainGeo = new THREE.PlaneGeometry(70, 46, segX, segZ);
    terrainGeo.rotateX(-Math.PI / 2);
    const posAttr = terrainGeo.attributes.position;
    const terrainMeta = new Float32Array(posAttr.count * 4);

    for (let i = 0; i < posAttr.count; i++) {
      const vx = posAttr.getX(i);
      const vz = posAttr.getZ(i);
      const mx = vx * 10 + 350;
      const my = vz * 10 + 230;
      const w = mapToWorld(mx, my);
      posAttr.setY(i, w.wy);

      terrainMeta[i * 4] = Math.max(0.0, Math.min(1.0, (w.elev + 20) / 4180));
      terrainMeta[i * 4 + 1] = w.riverMask;
      terrainMeta[i * 4 + 2] = w.roadMask;
      terrainMeta[i * 4 + 3] = w.tpi ?? 0.5;
    }
    terrainGeo.setAttribute('aTerrainMeta', new THREE.BufferAttribute(terrainMeta, 4));
    terrainGeo.computeVertexNormals();

    // Выравниваем граничные нормали 70x46 и 0-го ряда окружения для идеально бесшовного освещения без складки
    const tNormAttr = terrainGeo.attributes.normal;
    const sNormAttr = deskSurroundGeo.attributes.normal;
    const perimeterMapIndices = [];
    for (let i = 0; i < segX; i++) perimeterMapIndices.push(i);
    for (let i = 0; i < segZ; i++) perimeterMapIndices.push(i * (segX + 1) + segX);
    for (let i = 0; i < segX; i++) perimeterMapIndices.push(segZ * (segX + 1) + (segX - i));
    for (let i = 0; i < segZ; i++) perimeterMapIndices.push((segZ - i) * (segX + 1));
    for (let p = 0; p < perimeterMapIndices.length; p++) {
      const ti = perimeterMapIndices[p];
      const nx = tNormAttr.getX(ti) + sNormAttr.getX(p);
      const ny = tNormAttr.getY(ti) + sNormAttr.getY(p);
      const nz = tNormAttr.getZ(ti) + sNormAttr.getZ(p);
      const len = Math.hypot(nx, ny, nz) || 1;
      tNormAttr.setXYZ(ti, nx / len, ny / len, nz / len);
      sNormAttr.setXYZ(p, nx / len, ny / len, nz / len);
    }
    tNormAttr.needsUpdate = true;
    sNormAttr.needsUpdate = true;

    const bumpTex = new THREE.CanvasTexture(createProceduralBumpCanvas());
    bumpTex.wrapS = THREE.RepeatWrapping;
    bumpTex.wrapT = THREE.RepeatWrapping;
    bumpTex.repeat.set(9, 6);

    const terrainMat = createPhotorealCaucasusTerrainMaterial({
      summerMap: null,
      bumpMap: bumpTex,
      pbrPack
    });
    const terrainUniforms = terrainMat.userData.shaderUniforms;
    terrainUniforms.uSeasonMix.value =
      initialPhase === 'winter' ? 2.0 : initialPhase === 'autumn' ? 1.0 : 0.0;

    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    terrainMesh.castShadow = true;
    terrainMesh.receiveShadow = true;
    terrainMesh.userData = { kind: 'terrain' };
    scene.add(terrainMesh);

    // 2.5. Объёмные GLSL-реки Кавказа с преломлением русла, отражением неба и пенными порогами
    const riverMat = createPhotorealRiverMaterial({ pbrPack });
    riverMatRef = riverMat;
    if (pbrPack.skyEquirectTex?.image?.complete && pbrPack.skyEquirectTex?.image?.naturalWidth > 0) {
      riverMat.uniforms.uHasSky.value = 1.0;
    }
    const riversGroup = new THREE.Group();
    const riverGeos = [];
    CAUCASUS_RIVER_DEFS.forEach((rd) => {
      const rGeo = buildPhotorealRiverRibbonGeometry(rd.pts, rd.hw, 180);
      riverGeos.push(rGeo);
      const rMesh = new THREE.Mesh(rGeo, riverMat);
      riversGroup.add(rMesh);
    });
    scene.add(riversGroup);

    // 3. Многопородные леса Кавказа (2200+ InstancedMesh): восточные буки Ичкерии, горные сосны Дагестана,
    // пойменные рощи Терека/Сунжи, альпийский подлесок, слоистые известняковые утёсы и валуны речных порогов!
    const settlementClearings = [
      [410, 245],
      [255, 155],
      [145, 125],
      [325, 225],
      [495, 215],
      [425, 330],
      [545, 355],
      [215, 245],
      [495, 285],
      [585, 255],
      [192, 118],
      [315, 212],
      [304, 206],
      [388, 124],
      [492, 272],
      [68, 99],
      [84, 162],
      [395, 87],
      [512, 240]
    ];
    const isNearSettlement = (mx, my, minR = 11.5) =>
      settlementClearings.some(([sx, sy]) => Math.hypot(mx - sx, my - sy) < minR);

    // Густые восточно-буковые леса Чечни/Ичкерии и северных предгорий (внутренний куэстовый Дагестан остаётся открытым известняковым нагорьем!)
    const beechPositions = [];
    for (let i = 0; i < 2100 && beechPositions.length < 940; i++) {
      const mx = 44 + ((i * 73 + Math.floor(i / 9) * 31 + (i % 7) * 5) % 480);
      const my = 76 + ((i * 47 + Math.floor(i / 11) * 23 + (i % 5) * 7) % 224);
      const inHumidBelt = mx < 342 || (my < 158 && mx < 515);
      if (!inHumidBelt) continue;
      const w = mapToWorld(mx, my);
      const effSlope = Math.max(w.terr.slopeDeg, w.meshSlopeDeg || 0);
      if (
        w.elev > 220 &&
        w.elev < (mx < 342 ? 2020 : 1220) &&
        effSlope < 32 &&
        w.riverMask < 0.24 &&
        w.roadMask < 0.40 &&
        !isNearSettlement(mx, my, 12.5)
      ) {
        beechPositions.push({
          wx: w.wx,
          wy: w.wy,
          wz: w.wz,
          scale: 0.44 + (i % 6) * 0.075,
          tintSeed: (i * 19) % 100
        });
      }
    }

    // Горная кавказская сосна Коха: естественные компактные рощи на северных уступах (внутренние куэсты Дагестана остаются открытыми!)
    const pinePositions = [];
    for (let i = 0; i < 2100 && pinePositions.length < 340; i++) {
      const mx = 195 + ((i * 89 + Math.floor(i / 7) * 29) % 455);
      const my = 104 + ((i * 59 + Math.floor(i / 8) * 19) % 268);
      // Кластерная мозаика сосновых рощ (Верхний Гуниб, северные лощины хребтов) вместо равномерной россыпи по всем известняковым плато!
      const groveCluster = Math.sin(mx * 0.052 + 0.8) * Math.cos(my * 0.058 - 0.4);
      if (mx > 348 && groveCluster < 0.24) continue;
      const w = mapToWorld(mx, my);
      const effSlope = Math.max(w.terr.slopeDeg, w.meshSlopeDeg || 0);
      if (
        w.elev > 1180 &&
        w.elev < 2520 &&
        effSlope < 34 &&
        w.riverMask < 0.22 &&
        w.roadMask < 0.40 &&
        !isNearSettlement(mx, my, 12.5)
      ) {
        pinePositions.push({
          wx: w.wx,
          wy: w.wy,
          wz: w.wz,
          scale: 0.46 + (i % 5) * 0.088,
          tintSeed: (i * 13) % 100
        });
      }
    }

    // Пойменные рощи вдоль Терека, Сунжи и нижнего Аргуна (строго выше уровня Каспия и только на пологих берегах!)
    const riparianPositions = [];
    for (let i = 0; i < 820 && riparianPositions.length < 220; i++) {
      const mx = 24 + ((i * 61 + Math.floor(i / 6) * 17) % 585);
      const my = 18 + ((i * 29 + Math.floor(i / 5) * 13) % 94);
      const w = mapToWorld(mx, my);
      const effSlope = Math.max(w.terr.slopeDeg, w.meshSlopeDeg || 0);
      if (
        w.elev > 25 &&
        w.riverMask > 0.16 &&
        w.riverMask < 0.50 &&
        effSlope < 24 &&
        w.roadMask < 0.45 &&
        !isNearSettlement(mx, my, 9.5)
      ) {
        riparianPositions.push({
          wx: w.wx,
          wy: w.wy,
          wz: w.wz,
          scale: 0.38 + (i % 4) * 0.068,
          tintSeed: (i * 23) % 100
        });
      }
    }

    // Горный подлесок (кавказский рододендрон и папоротник строго на пологих лесных опушках — 0 кустов на отвесных стенах каньонов!)
    const undergrowthPositions = [];
    for (let i = 0; i < 1450 && undergrowthPositions.length < 360; i++) {
      const mx = 52 + ((i * 97 + Math.floor(i / 7) * 37 + (i % 5) * 11) % 540);
      const my = 72 + ((i * 53 + Math.floor(i / 9) * 29) % 256);
      const w = mapToWorld(mx, my);
      const effSlope = Math.max(w.terr.slopeDeg, w.meshSlopeDeg || 0);
      const inGreenNiche = mx < 348 || (my < 162 && mx < 510);
      if (
        inGreenNiche &&
        w.elev > 220 &&
        w.elev < 1980 &&
        effSlope < 22 &&
        w.riverMask < 0.24 &&
        w.roadMask < 0.44 &&
        !isNearSettlement(mx, my, 10.5)
      ) {
        undergrowthPositions.push({
          wx: w.wx,
          wy: w.wy,
          wz: w.wz,
          scale: 0.36 + (i % 5) * 0.085,
          tintSeed: (i * 31) % 100
        });
      }
    }

    // Скульптурные слоистые известняковые утёсы на крутых обрывах куэст (строго ниже снеговой линии и с глубоким заглублением!)
    const boulderPositions = [];
    for (let i = 0; i < 820 && boulderPositions.length < 280; i++) {
      const mx = 70 + ((i * 113 + Math.floor(i / 5) * 19) % 575);
      const my = 96 + ((i * 67 + Math.floor(i / 6) * 37) % 305);
      const w = mapToWorld(mx, my);
      const effSlope = Math.max(w.terr.slopeDeg, w.meshSlopeDeg || 0);
      if (
        w.elev > 620 &&
        w.elev < 2520 &&
        effSlope >= 22 &&
        effSlope <= 36 &&
        w.riverMask < 0.10 &&
        w.roadMask < 0.32 &&
        !isNearSettlement(mx, my, 10.5)
      ) {
        boulderPositions.push({
          wx: w.wx,
          wy: w.wy,
          wz: w.wz,
          scale: 0.38 + (i % 5) * 0.13,
          rot: i * 1.37
        });
      }
    }

    // Мокрые речные валуны и V-образные пенистые буруны строго в руслах реальных 7 рек Дагестана и Чечни (с отступом от всех мостов!)
    const initialBridgeDefs =
      latestPropsRef.current.riverBridges && latestPropsRef.current.riverBridges.length > 0
        ? latestPropsRef.current.riverBridges
        : [
            { id: 'bridge_sunzha_goyta', riverId: 'sunzha', x: 68, y: 99 },
            { id: 'bridge_chanty_argun', riverId: 'argun', x: 84, y: 162 },
            { id: 'bridge_salatau_sulak', riverId: 'andi_koisu', x: 395, y: 87 },
            { id: 'bridge_salty_karakoysu', riverId: 'kara_koisu', x: 512, y: 240 }
          ];
    const bridgeAvoidPts = initialBridgeDefs.map((br) => {
      const sn = snapBridgeToRiverChannel(br.x, br.y, br.riverId, br.id);
      return { wx: sn.wx, wz: sn.wz, r: 2.35 };
    });
    const riverRapidPoints = sampleCaucasusRiverRapidPoints(CAUCASUS_RIVER_DEFS, {
      avoidWorldPts: bridgeAvoidPts
    });

    // Подбираем лучшие обзорные точки для пресета «🌲 Природа и Реки» строго по реальным порогам Сулакского каньона и Аргуна
    const pickRapidShowcase = (riverId, targetProg) => {
      let best = null;
      let bestScore = Infinity;
      riverRapidPoints.forEach((rp) => {
        if (rp.riverId !== riverId) return;
        const sc = Math.abs(rp.prog - targetProg);
        if (sc < bestScore) {
          bestScore = sc;
          best = rp;
        }
      });
      return best || { ...mapToWorld(422, 118), flowYaw: 2.76 };
    };
    const andiKoisuRapidSpot = pickRapidShowcase('andi_koisu', 0.66);
    const argunRapidSpot = pickRapidShowcase('argun', 0.48);

    const avoidShowcaseWorld = [
      ...settlementClearings.map(([mx, my]) => mapToWorld(mx, my)),
      mapToWorld(272, 204),
      mapToWorld(432, 174),
      mapToWorld(192, 118)
    ];
    let forestCliffShowcaseSpot = mapToWorld(278, 178);
    let bestForestScore = -1;
    boulderPositions.forEach((bp) => {
      if (bp.wy > 3.15 || bp.wy < 0.75) return; // зелёный горно-лесной пояс (ниже снега, выше равнины)
      const wProbe = mapToWorld(bp.wx * 10 + 350, bp.wz * 10 + 230);
      if (wProbe.riverMask > 0.10 || wProbe.terr.slopeDeg > 36) return;
      if (avoidShowcaseWorld.some((a) => Math.hypot(bp.wx - a.wx, bp.wz - a.wz) < 5.2)) return;
      let nBeech = 0;
      let nPine = 0;
      let nBush = 0;
      let nRock = 0;
      for (let i = 0; i < beechPositions.length; i++) {
        if (Math.hypot(beechPositions[i].wx - bp.wx, beechPositions[i].wz - bp.wz) < 4.5) nBeech++;
      }
      for (let i = 0; i < pinePositions.length; i++) {
        if (Math.hypot(pinePositions[i].wx - bp.wx, pinePositions[i].wz - bp.wz) < 4.5) nPine++;
      }
      for (let i = 0; i < undergrowthPositions.length; i++) {
        if (Math.hypot(undergrowthPositions[i].wx - bp.wx, undergrowthPositions[i].wz - bp.wz) < 4.5) nBush++;
      }
      for (let i = 0; i < boulderPositions.length; i++) {
        if (Math.hypot(boulderPositions[i].wx - bp.wx, boulderPositions[i].wz - bp.wz) < 4.2) nRock++;
      }
      if (nBeech >= 1 && nPine >= 1) {
        const sc =
          Math.min(nBeech, 7) * 3.2 +
          Math.min(nPine, 7) * 3.0 +
          Math.min(nBush, 5) * 2.0 +
          Math.min(nRock, 4) * 2.2;
        if (sc > bestForestScore) {
          bestForestScore = sc;
          forestCliffShowcaseSpot = { wx: bp.wx, wy: bp.wy, wz: bp.wz };
        }
      }
    });

    const allBroadleaf = [...beechPositions, ...riparianPositions];

    const beechAtlasTex = createBeechFoliageAtlasTexture();
    const pineAtlasTex = createConiferBoughAtlasTexture();
    const fernAtlasTex = createFernUndergrowthTexture();
    const barkMats = createBarkPbrMaterials();

    const trunkGeo = createRealisticTrunkGeometry({ isPine: false });
    const pineTrunkGeo = createRealisticTrunkGeometry({ isPine: true });
    const trunkInstanced = new THREE.InstancedMesh(trunkGeo, barkMats.beechBarkMat, allBroadleaf.length);
    const pineTrunkInstanced = new THREE.InstancedMesh(pineTrunkGeo, barkMats.pineBarkMat, pinePositions.length);
    trunkInstanced.castShadow = true;
    trunkInstanced.receiveShadow = true;
    pineTrunkInstanced.castShadow = true;
    pineTrunkInstanced.receiveShadow = true;

    const crownGeo = createRealisticBeechCanopyGeometry();
    const crownMat = createFoliageCardMaterial({ map: beechAtlasTex, windStrength: 0.022, isPine: false });
    const beechCrownInstanced = new THREE.InstancedMesh(crownGeo, crownMat, allBroadleaf.length);
    beechCrownInstanced.castShadow = true;
    beechCrownInstanced.receiveShadow = true;

    const pineGeo = createRealisticConiferGeometry();
    const pineMat = createFoliageCardMaterial({ map: pineAtlasTex, windStrength: 0.016, isPine: true });
    const pineInstanced = new THREE.InstancedMesh(pineGeo, pineMat, pinePositions.length);
    pineInstanced.castShadow = true;
    pineInstanced.receiveShadow = true;

    const undergrowthGeo = createUndergrowthBushGeometry();
    const undergrowthMat = createFoliageCardMaterial({ map: fernAtlasTex, windStrength: 0.014, isPine: false });
    const undergrowthInstanced = new THREE.InstancedMesh(undergrowthGeo, undergrowthMat, undergrowthPositions.length);
    undergrowthInstanced.castShadow = false;
    undergrowthInstanced.receiveShadow = true;

    const boulderGeo = createStratifiedCliffRockGeometry();
    const boulderMat = new THREE.MeshStandardMaterial({
      color: '#a39988',
      map: pbrPack.rockDiff,
      normalMap: pbrPack.rockNor,
      normalScale: new THREE.Vector2(1.05, 1.05),
      roughnessMap: pbrPack.rockArm,
      vertexColors: true,
      roughness: 0.94,
      metalness: 0.02
    });
    const boulderInstanced = new THREE.InstancedMesh(boulderGeo, boulderMat, boulderPositions.length);
    boulderInstanced.castShadow = true;
    boulderInstanced.receiveShadow = true;

    const riverBoulderGeo = createRiverRapidBoulderGeometry();
    const riverBoulderMat = new THREE.MeshStandardMaterial({
      color: '#5a6369',
      map: pbrPack.rockDiff,
      normalMap: pbrPack.rockNor,
      normalScale: new THREE.Vector2(0.88, 0.88),
      vertexColors: true,
      roughness: 0.34,
      metalness: 0.08
    });
    const riverBoulderInstanced = new THREE.InstancedMesh(
      riverBoulderGeo,
      riverBoulderMat,
      Math.max(1, riverRapidPoints.length)
    );
    riverBoulderInstanced.castShadow = true;
    riverBoulderInstanced.receiveShadow = true;

    const riverFoamWakeGeo = createRiverBoulderFoamWakeGeometry();
    const riverFoamWakeMat = createRiverBoulderFoamWakeMaterial();
    const riverFoamWakeInstanced = new THREE.InstancedMesh(
      riverFoamWakeGeo,
      riverFoamWakeMat,
      Math.max(1, riverRapidPoints.length)
    );
    riverFoamWakeInstanced.userData.excludeFromGtao = true;
    riverFoamWakeInstanced.renderOrder = 2;

    const dummy = new THREE.Object3D();
    allBroadleaf.forEach((tp, idx) => {
      const sc = tp.scale * 0.78;
      const rotY = idx * 0.95;
      dummy.position.set(tp.wx, tp.wy - 0.09, tp.wz);
      dummy.scale.set(sc * 1.06, sc, sc * 1.06);
      dummy.rotation.set(((idx % 3) - 1) * 0.035, rotY, (((idx + 1) % 3) - 1) * 0.035);
      dummy.updateMatrix();
      trunkInstanced.setMatrixAt(idx, dummy.matrix);
      beechCrownInstanced.setMatrixAt(idx, dummy.matrix);
    });

    pinePositions.forEach((pp, idx) => {
      const sc = pp.scale * 0.82;
      dummy.position.set(pp.wx, pp.wy - 0.09, pp.wz);
      dummy.scale.set(sc * 0.94, sc * (0.96 + (idx % 3) * 0.11), sc * 0.94);
      dummy.rotation.set(((idx % 3) - 1) * 0.03, idx * 0.73, 0);
      dummy.updateMatrix();
      pineTrunkInstanced.setMatrixAt(idx, dummy.matrix);
      pineInstanced.setMatrixAt(idx, dummy.matrix);
    });

    undergrowthPositions.forEach((up, idx) => {
      const sc = up.scale * 0.74;
      dummy.position.set(up.wx, up.wy - 0.06, up.wz);
      dummy.scale.set(sc * 1.15, sc * 0.85, sc * 1.15);
      dummy.rotation.set(0, idx * 1.21, 0);
      dummy.updateMatrix();
      undergrowthInstanced.setMatrixAt(idx, dummy.matrix);
    });

    boulderPositions.forEach((bp, idx) => {
      // Глубокая посадка в склон (bp.wy - 0.34 * scale): ноль парящих камней даже на отвесных стенах куэст!
      dummy.position.set(bp.wx, bp.wy - 0.34 * bp.scale, bp.wz);
      dummy.scale.set(bp.scale * 1.34, bp.scale * 0.90, bp.scale * 1.06);
      dummy.rotation.set(Math.sin(bp.rot) * 0.14, bp.rot, Math.cos(bp.rot) * 0.12);
      dummy.updateMatrix();
      boulderInstanced.setMatrixAt(idx, dummy.matrix);
    });

    riverRapidPoints.forEach((rp, idx) => {
      // Мокрый речной валун уверенно выступает над поверхностью бурной воды (не накрывается пеной!)
      dummy.rotation.order = 'XYZ';
      dummy.position.set(rp.wx, rp.wy + 0.03 * rp.scale, rp.wz);
      dummy.scale.set(rp.scale * 1.15, rp.scale * 1.05, rp.scale * 1.02);
      dummy.rotation.set(0, rp.flowYaw + (idx % 5) * 0.42, 0);
      dummy.updateMatrix();
      riverBoulderInstanced.setMatrixAt(idx, dummy.matrix);

      // Пенный V-бурун строго наклонён по продольному уклону русла (slopePitch) и никогда не выходит за берега!
      const wSc = rp.scale * (0.78 + rp.rapids * 0.34);
      dummy.rotation.order = 'YXZ';
      dummy.position.set(rp.wx, rp.wy + 0.012, rp.wz);
      dummy.scale.set(wSc, 1.0, wSc * (0.95 + rp.rapids * 0.32));
      dummy.rotation.set(rp.slopePitch || 0, rp.flowYaw, 0);
      dummy.updateMatrix();
      riverFoamWakeInstanced.setMatrixAt(idx, dummy.matrix);
    });
    dummy.rotation.order = 'XYZ';

    // Реалистичная природная палитра кавказской листвы, хвои и подлеска под фотоатлас
    const applySeasonalFoliagePalette = (phase) => {
      const col = new THREE.Color();
      const summerPalette = ['#4b7a38', '#568540', '#3f6d31', '#618f43', '#4e7c3e'];
      const autumnPalette = ['#d66b1d', '#e58e26', '#b83f18', '#798c2b', '#e2ad2c'];
      const winterPalette = ['#93a4b5', '#b0becb', '#738494', '#8697a6', '#c5d1dc'];
      const pal =
        phase === 'winter' ? winterPalette : phase === 'autumn' ? autumnPalette : summerPalette;

      allBroadleaf.forEach((tp, idx) => {
        col.set(pal[tp.tintSeed % pal.length]);
        beechCrownInstanced.setColorAt(idx, col);
      });
      if (beechCrownInstanced.instanceColor) beechCrownInstanced.instanceColor.needsUpdate = true;

      const pineSummer = ['#356647', '#407452', '#2d583d', '#487a58'];
      const pineWinter = ['#6c888c', '#829da1', '#5c787c', '#92abb0'];
      const pPal = phase === 'winter' ? pineWinter : pineSummer;
      pinePositions.forEach((pp, idx) => {
        col.set(pPal[pp.tintSeed % pPal.length]);
        pineInstanced.setColorAt(idx, col);
      });
      if (pineInstanced.instanceColor) pineInstanced.instanceColor.needsUpdate = true;

      const bushSummer = ['#3f6b32', '#527d3b', '#365e2d', '#62853d'];
      const bushAutumn = ['#9e5620', '#b87624', '#7a4b1f', '#6b7528'];
      const bushWinter = ['#7b8d9c', '#95a7b5', '#687987', '#899ca9'];
      const bPal =
        phase === 'winter' ? bushWinter : phase === 'autumn' ? bushAutumn : bushSummer;
      undergrowthPositions.forEach((up, idx) => {
        col.set(bPal[up.tintSeed % bPal.length]);
        undergrowthInstanced.setColorAt(idx, col);
      });
      if (undergrowthInstanced.instanceColor) undergrowthInstanced.instanceColor.needsUpdate = true;

      terrainUniforms.uSeasonMix.value =
        phase === 'winter' ? 2.0 : phase === 'autumn' ? 1.0 : 0.0;
      riverMat.uniforms.uSeasonMix.value = terrainUniforms.uSeasonMix.value;
      surroundUniforms.uSeasonMix.value = terrainUniforms.uSeasonMix.value;
    };
    applySeasonalFoliagePalette(initialPhase);

    scene.add(
      trunkInstanced,
      pineTrunkInstanced,
      beechCrownInstanced,
      pineInstanced,
      undergrowthInstanced,
      boulderInstanced,
      riverBoulderInstanced,
      riverFoamWakeInstanced
    );

    // 3.5. Двухъярусная слоистая дымка в глубоких речных теснинах Койсу, Аргуна и Ичкерии (строго ниже порога Bloom)
    const mistTex = createLayeredValleyMistTexture();
    const valleyMistGroup = new THREE.Group();
    valleyMistGroup.userData.excludeFromGtao = true;
    const mistGeo = new THREE.PlaneGeometry(9.4, 5.2);
    const mistMat = new THREE.MeshBasicMaterial({
      map: mistTex,
      color: '#cfe0ef',
      transparent: true,
      opacity: 0.12,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    const mistAnchors = [
      [181, 215, 0.34, 1.0],
      [172, 152, 0.36, 1.0],
      [382, 222, 0.38, 1.05],
      [408, 156, 0.34, 0.95],
      [458, 232, 0.38, 1.1],
      [448, 172, 0.36, 1.0],
      [508, 238, 0.4, 1.05],
      [356, 290, 0.38, 1.15],
      [212, 184, 0.92, 1.18],
      [285, 228, 0.88, 1.1],
      [395, 190, 0.96, 1.15],
      [432, 260, 0.92, 1.2],
      [482, 205, 0.95, 1.12],
      [536, 268, 0.98, 1.15],
      [318, 264, 0.9, 1.08],
      [246, 210, 0.94, 1.16]
    ];
    mistAnchors.forEach(([mx, my, yOff, sMult], idx) => {
      const { wx, wy, wz } = mapToWorld(mx, my);
      const mPlane = new THREE.Mesh(mistGeo, mistMat);
      mPlane.rotation.x = -Math.PI / 2;
      mPlane.rotation.z = idx * 0.62;
      mPlane.scale.setScalar(sMult);
      mPlane.position.set(wx, wy + yOff, wz);
      mPlane.userData = { baseX: wx, baseZ: wz, phase: idx * 1.15, excludeFromGtao: true };
      valleyMistGroup.add(mPlane);
    });
    scene.add(valleyMistGroup);

    // 4. Слои сцены: статические укрепления и террасные аулы (сакли), войска (60 FPS), маршруты и эффекты боя
    const staticLayer = new THREE.Group();
    const mobileLayer = new THREE.Group();
    const routeLayer = new THREE.Group();
    const fxLayer = new THREE.Group();
    const eaglesGroup = new THREE.Group();
    scene.add(staticLayer, mobileLayer, routeLayer, fxLayer, eaglesGroup);

    // 9 ультра-детализированных кавказских беркутов (Aquila chrysaetos) с поштучно вылепленными 3D-перьями (доступен клик по любому орлу!)
    const eaglePickables = [];
    [
      { cx: 4.5, cz: -1.8, rx: 5.2, rz: 4.0, baseAlt: 8.6, altAmp: 0.68, omega: 0.33, dir: 1, driftRadius: 0.85, phase: 0.35, flapPeriod: 9.2, scale: 1.14 },
      { cx: 5.2, cz: -1.3, rx: 5.7, rz: 4.4, baseAlt: 9.05, altAmp: 0.62, omega: 0.33, dir: 1, driftRadius: 0.8, phase: 0.92, flapPeriod: 9.8, scale: 1.04 },
      { cx: -11.5, cz: -2.4, rx: 6.2, rz: 4.6, baseAlt: 9.1, altAmp: 0.76, omega: 0.31, dir: -1, driftRadius: 1.1, phase: 1.8, flapPeriod: 8.8, scale: 1.12 },
      { cx: -10.6, cz: -1.9, rx: 6.6, rz: 4.9, baseAlt: 9.55, altAmp: 0.7, omega: 0.31, dir: -1, driftRadius: 1.0, phase: 2.38, flapPeriod: 9.6, scale: 1.02 },
      { cx: 9.6, cz: 3.6, rx: 5.8, rz: 4.3, baseAlt: 9.9, altAmp: 0.75, omega: 0.29, dir: 1, driftRadius: 1.05, phase: 2.9, flapPeriod: 10.2, scale: 1.1 },
      { cx: 14.2, cz: 5.8, rx: 5.4, rz: 4.1, baseAlt: 10.3, altAmp: 0.72, omega: 0.33, dir: -1, driftRadius: 0.95, phase: 4.1, flapPeriod: 9.4, scale: 1.06 },
      { cx: -16.0, cz: 8.8, rx: 6.6, rz: 4.9, baseAlt: 11.1, altAmp: 0.84, omega: 0.27, dir: 1, driftRadius: 1.2, phase: 5.0, flapPeriod: 10.6, scale: 1.14 },
      { cx: -1.6, cz: 4.6, rx: 5.5, rz: 4.2, baseAlt: 9.5, altAmp: 0.68, omega: 0.32, dir: -1, driftRadius: 0.95, phase: 6.1, flapPeriod: 9.2, scale: 1.06 },
      { cx: 11.8, cz: -4.2, rx: 5.3, rz: 4.0, baseAlt: 9.2, altAmp: 0.66, omega: 0.3, dir: 1, driftRadius: 0.9, phase: 4.8, flapPeriod: 9.5, scale: 1.08 }
    ].forEach((cfg, eagleIdx) => {
      const eagle = createPhotorealGoldenEagleInstance({ scale: cfg.scale, castShadow: true });
      eagle.userData.flightCfg = cfg;
      eagle.traverse((ch) => {
        if (ch.isMesh) {
          ch.userData = { kind: 'eagle', eagleIdx };
          eaglePickables.push(ch);
        }
      });
      updatePhotorealGoldenEagle(eagle, 0);
      eaglesGroup.add(eagle);
    });

    // Материал светящихся окон саклей (динамически зажигается на закате и ночью — 0 лишних геометрий)
    const sharedSaklyaWinMat = new THREE.MeshStandardMaterial({
      color: '#231c16',
      emissive: '#f59e0b',
      emissiveIntensity: 0.0,
      roughness: 0.45
    });

    // Деликатные тактические кольца выбора (тонкая латунная/изумрудная/алая насечка вместо грубых плоских кругов)
    const sharedCapitalHaloGeo = new THREE.RingGeometry(1.62, 1.78, 48);
    const sharedNaibHaloGeo = new THREE.RingGeometry(1.32, 1.46, 44);
    const sharedBeaconHaloGeo = new THREE.RingGeometry(0.68, 0.84, 32);
    const sharedObeliskGeo = new THREE.ConeGeometry(0.28, 1.25, 4);

    // Маршрутная лента с предвыделенным GPU-буфером (0 аллокаций на кадр!) + пульсирующее кольцо перевала
    const MAX_ROUTE_PTS = 32;
    const activeRoutePositions = new Float32Array(MAX_ROUTE_PTS * 3);
    const activeRoutePosAttr = new THREE.BufferAttribute(activeRoutePositions, 3);
    activeRoutePosAttr.setUsage(THREE.DynamicDrawUsage);
    const activeRouteGeo = new THREE.BufferGeometry();
    activeRouteGeo.setAttribute('position', activeRoutePosAttr);
    activeRouteGeo.setDrawRange(0, 0);
    const activeRouteLine = new THREE.Line(
      activeRouteGeo,
      new THREE.LineBasicMaterial({ color: '#34d399', transparent: true, opacity: 0.92 })
    );
    activeRouteLine.visible = false;
    const routeTargetBeaconGeo = new THREE.RingGeometry(0.52, 0.78, 32);
    const routeTargetBeaconMat = new THREE.MeshBasicMaterial({
      color: '#fbbf24',
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.86,
      depthWrite: false
    });
    const routeTargetBeacon = new THREE.Mesh(routeTargetBeaconGeo, routeTargetBeaconMat);
    routeTargetBeacon.rotation.x = -Math.PI / 2;
    routeTargetBeacon.visible = false;
    routeLayer.add(activeRouteLine, routeTargetBeacon);

    const precipSys = createCaucasusPrecipitationSystem({
      spanX: 72,
      spanY: 20,
      spanZ: 48,
      rainCount: 780,
      snowCount: 920
    });
    scene.add(precipSys.group);

    // =========================================================================
    // ПУЛ КЛУБЯЩЕГОСЯ ПОРОХОВОГО ДЫМА XIX ВЕКА, ПЫЛИ ИЗ-ПОД КОПЫТ И ЯДЕР
    // =========================================================================
    const powderSmokeTex = createBillowingSmokeTexture();
    const smokeSys = createBlackPowderSmokeSystem({
      parentGroup: fxLayer,
      smokeTex: powderSmokeTex,
      maxParticles: 300
    });
    const sharedShellGeo = new THREE.SphereGeometry(0.18, 10, 10);
    const activeTableShells = [];

    const fireArtilleryArc3D = (fromW, toW, isFriendly = true) => {
      salvoFlashLight.position.set(fromW.wx, fromW.wy + 0.85, fromW.wz);
      salvoFlashLight.color.set('#fde047');
      salvoFlashLight.intensity = 6.5;

      for (let i = 0; i < 14; i++) {
        smokeSys.spawnSmoke({
          x: fromW.wx + (Math.random() - 0.5) * 0.48,
          y: fromW.wy + 0.36 + Math.random() * 0.25,
          z: fromW.wz + (Math.random() - 0.5) * 0.48,
          vx: (toW.wx - fromW.wx) * 0.08 + (Math.random() - 0.5) * 0.6,
          vy: 0.52 + Math.random() * 0.72,
          vz: (toW.wz - fromW.wz) * 0.08 + (Math.random() - 0.5) * 0.6,
          scale: 0.46 + Math.random() * 0.3,
          grow: 1.18,
          life: 2.8 + Math.random() * 1.4,
          flash: i < 3,
          colorHex: i < 3 ? '#f5f5f4' : '#cbd5e1',
          flashHex: '#fbbf24',
          maxOpacity: i < 3 ? 0.72 : 0.56
        });
      }

      const shellMat = new THREE.MeshStandardMaterial({
        color: '#1c1917',
        emissive: isFriendly ? '#fbbf24' : '#ef4444',
        emissiveIntensity: 1.9,
        metalness: 0.75,
        roughness: 0.25
      });
      const shellMesh = new THREE.Mesh(sharedShellGeo, shellMat);
      shellMesh.position.set(fromW.wx, fromW.wy + 0.55, fromW.wz);
      fxLayer.add(shellMesh);

      const dist = Math.hypot(toW.wx - fromW.wx, toW.wz - fromW.wz);
      activeTableShells.push({
        mesh: shellMesh,
        mat: shellMat,
        from: new THREE.Vector3(fromW.wx, fromW.wy + 0.55, fromW.wz),
        to: new THREE.Vector3(toW.wx, toW.wy + 0.55, toW.wz),
        apex: Math.min(7.2, Math.max(2.1, dist * 0.3)),
        progress: 0,
        speed: 0.85,
        trailTimer: 0
      });
    };

    let disposed = false;
    let lastStaticSig = '';
    let lastSeasonApplied = initialPhase;
    let lastHandledSalvoCmd = salvoCommandRef.current;

    const staticPickables = [];
    const mobilePickables = [];
    const staticLabels = [];
    const staticDisposableMats = [];
    const resolvedBeaconPositions = new Map();
    const unitRegistry = new Map();
    const columnRegistry = new Map();
    const sharedUnitRingGeo = new THREE.RingGeometry(1.04, 1.2, 36);
    const sharedLegendOuterRingGeo = new THREE.RingGeometry(1.42, 1.58, 40);
    const sharedLegendStarGeo = new THREE.RingGeometry(0.68, 0.92, 8);
    const sharedLegendCrownGeo = new THREE.OctahedronGeometry(0.24, 0);
    const sharedLegendGoldMat = new THREE.MeshStandardMaterial({
      color: '#fbbf24',
      emissive: '#f59e0b',
      emissiveIntensity: 0.95,
      metalness: 0.88,
      roughness: 0.22,
      side: THREE.DoubleSide
    });
    const sharedLegendAuraMat = new THREE.MeshBasicMaterial({
      color: '#fde047',
      transparent: true,
      opacity: 0.72,
      depthWrite: false,
      side: THREE.DoubleSide
    });

    const clearStaticDisposables = () => {
      while (staticDisposableMats.length > 0) {
        const m = staticDisposableMats.pop();
        if (m && typeof m.dispose === 'function') m.dispose();
      }
    };

    // Построение статических сооружений: цитадели + каскадные каменные сакли вокруг каждого наибства,
    // бастионные земляные валы крепостей кордона, мосты, сигнальные башни и мемориалы
    const syncStaticStructures = () => {
      if (disposed) return;
      const p = latestPropsRef.current;
      const capId = p.capitalNaibateId || 'vedeno';
      const impHeldSet = new Set(p.imperialHeldIds || []);
      const sig = [
        capId,
        p.capitalLabelRu || '',
        (p.imperialHeldIds || []).join(','),
        p.selectedNaibateId || '',
        (p.naibates || []).map((n) => `${n.id}:${n.underSiege ? 1 : 0}:${n.snowbound ? 1 : 0}`).join(','),
        (p.riverBridges || []).map((b) => `${b.id}:${b.status}`).join(','),
        (p.signalBeacons || []).map((b) => `${b.id}:${b.isLit ? 1 : 0}`).join(','),
        (p.battleMemorials || []).length
      ].join('|');

      if (sig === lastStaticSig) return;
      lastStaticSig = sig;

      clearStaticDisposables();
      while (staticLayer.children.length > 0) {
        const ch = staticLayer.children[0];
        if (ch.isInstancedMesh) ch.dispose();
        disposePhotorealFortressInstance(ch);
        disposePhotorealNatureInstance(ch);
        staticLayer.remove(ch);
      }
      staticPickables.length = 0;
      staticLabels.length = 0;

      // Собираем каскады террасных каменных саклей вокруг всех наибств за 1 общий InstancedMesh-проход
      const saklyaPlacements = [];

      // 1. Боевые вайнахские/аварские башни наибств + Столица Имамата Дарго-Ведено + кварталы саклей с айванами
      (p.naibates || []).forEach((n, nIdx) => {
        const isCapital = n.id === capId;
        const isImpHeld = impHeldSet.has(n.id);
        if (!n.coords) return;
        const { wx, wy, wz } = mapToWorld(n.coords.x, n.coords.y);
        const isSel = n.id === p.selectedNaibateId;
        const inst = isImpHeld
          ? createPhotorealImperialFortressInstance({ scale: isSel ? 1.05 : 0.94, castShadow: true })
          : isCapital
          ? createPhotorealImamatCapitalInstance({ scale: isSel ? 1.24 : 1.12, castShadow: true })
          : createPhotorealVainakhTowerInstance({ scale: isSel ? 1.16 : 1.02, castShadow: true });
        inst.position.set(wx, wy, wz);
        inst.rotation.y = (nIdx * 0.72) % (Math.PI * 2);
        inst.traverse((ch) => {
          if (ch.isMesh) {
            ch.castShadow = true;
            ch.receiveShadow = true;
            ch.userData = { ...ch.userData, kind: 'naibate', id: n.id, raw: n };
            staticPickables.push(ch);
          }
        });

        // Каскадные каменные сакли на склонах вокруг башни/цитадели наибства
        if (!isImpHeld) {
          const houseCount = isCapital ? 18 : 11;
          for (let h = 0; h < houseCount; h++) {
            const tier = h < 7 ? 0 : 1;
            const ang = (h / (tier === 0 ? 7 : houseCount - 7)) * Math.PI * 2 + nIdx * 0.67 + tier * 0.42;
            const rad = (isCapital ? 1.72 : 1.04) + tier * 0.56 + ((h * 13) % 5) * 0.06;
            const hx = wx + Math.cos(ang) * rad;
            const hz = wz + Math.sin(ang) * rad;
            const hw = mapToWorld(hx * 10 + 350, hz * 10 + 230);
            if (hw.riverMask < 0.4) {
              saklyaPlacements.push({
                x: hx,
                y: hw.wy,
                z: hz,
                rotY: -ang + Math.PI * 0.5 + (((h + nIdx) % 3) - 1) * 0.16,
                scaleX: 0.92 + ((h * 7) % 5) * 0.11,
                scaleY: 0.92 + ((h * 11) % 4) * 0.18,
                scaleZ: 0.92 + ((h * 5) % 5) * 0.1
              });
            }
          }
        }

        if (isCapital || isSel || n.underSiege || isImpHeld) {
          const haloMat = new THREE.MeshBasicMaterial({
            color:
              isImpHeld || n.underSiege
                ? '#ef4444'
                : isCapital && !isSel
                ? '#10b981'
                : '#fbbf24',
            transparent: true,
            opacity: isSel ? 0.82 : 0.62,
            depthWrite: false,
            side: THREE.DoubleSide
          });
          staticDisposableMats.push(haloMat);
          const halo = new THREE.Mesh(
            isCapital ? sharedCapitalHaloGeo : sharedNaibHaloGeo,
            haloMat
          );
          halo.rotation.x = -Math.PI / 2;
          halo.position.set(wx, wy + 0.08, wz);
          staticLayer.add(halo);
        }
        staticLayer.add(inst);
        const priority = isCapital || isSel || n.underSiege || isImpHeld ? 1 : 2;
        staticLabels.push({
          key: `nb-${n.id}`,
          wx,
          wy: wy + (isCapital ? 3.55 : 3.18),
          wz,
          priority,
          tone: isImpHeld || n.underSiege ? 'siege' : isSel || isCapital ? 'selected' : 'naib',
          textRu: `${
            isImpHeld ? '🦅 Гарнизон РИ: ' : n.underSiege ? '🔥 ' : isCapital ? '★ ' : n.snowbound ? '❄ ' : ''
          }${isCapital ? p.capitalLabelRu || 'Дарго-Ведено' : n.name.split(' ')[0]}`,
          textEn: `${
            isImpHeld ? '🦅 Imp. Fort: ' : n.underSiege ? '🔥 ' : isCapital ? '★ ' : n.snowbound ? '❄ ' : ''
          }${isCapital ? p.capitalLabelEn || 'Dargo-Vedeno' : (n.nameEn || n.name).split(' ')[0]}`,
          onClick: () => p.setSelectedNaibateId && p.setSelectedNaibateId(n.id)
        });
      });

      if (saklyaPlacements.length > 0) {
        const saklyaPack = getDetailedSaklyaAssets();
        const saklyaBodies = new THREE.InstancedMesh(
          saklyaPack.stoneGeo,
          saklyaPack.stoneMat,
          saklyaPlacements.length
        );
        const saklyaRoofs = new THREE.InstancedMesh(
          saklyaPack.roofTimberGeo,
          saklyaPack.roofTimberMat,
          saklyaPlacements.length
        );
        const saklyaWins = new THREE.InstancedMesh(
          saklyaPack.winGeo,
          sharedSaklyaWinMat,
          saklyaPlacements.length
        );
        saklyaBodies.castShadow = true;
        saklyaBodies.receiveShadow = true;
        saklyaRoofs.castShadow = true;
        saklyaRoofs.receiveShadow = true;

        const sDummy = new THREE.Object3D();
        saklyaPlacements.forEach((sp, idx) => {
          sDummy.position.set(sp.x, sp.y - 0.02, sp.z);
          sDummy.rotation.set(0, sp.rotY, 0);
          sDummy.scale.set(sp.scaleX, sp.scaleY, sp.scaleZ);
          sDummy.updateMatrix();
          saklyaBodies.setMatrixAt(idx, sDummy.matrix);
          saklyaRoofs.setMatrixAt(idx, sDummy.matrix);
          saklyaWins.setMatrixAt(idx, sDummy.matrix);
        });
        staticLayer.add(saklyaBodies, saklyaRoofs, saklyaWins);
      }

      // 2. Звёздчатые бастионные крепости Кавказской линии (Вобан + амбразурные орудия + штаб + блокгауз)
      (p.cordonFortresses || []).forEach((fort, fIdx) => {
        const { wx, wy, wz } = mapToWorld(fort.x, fort.y);
        const inst = createPhotorealImperialFortressInstance({
          scale: 1.06,
          castShadow: true
        });
        inst.position.set(wx, wy, wz);
        inst.rotation.y = fIdx * 0.48;
        staticLayer.add(inst);
      });

      // 3. Каменные сводчатые арочные мосты строго НАД руслами реальных SRTM-рек (перпендикулярно течению, устои на обоих берегах!)
      (p.riverBridges || []).forEach((br) => {
        const snap = snapBridgeToRiverChannel(br.x, br.y, br.riverId, br.id);
        const isDismantled = br.status === 'dismantled';
        const inst = createPhotorealStoneBridgeInstance({
          dismantled: isDismantled,
          scale: snap.archSpanScale,
          castShadow: true
        });
        inst.position.set(snap.wx, Math.max(0.08, snap.waterY - 0.14), snap.wz);
        inst.rotation.y = snap.bridgeYaw;
        inst.traverse((ch) => {
          if (ch.isMesh) {
            ch.castShadow = true;
            ch.receiveShadow = true;
            ch.userData = { ...ch.userData, kind: 'bridge', id: br.id, raw: br };
            staticPickables.push(ch);
          }
        });
        staticLayer.add(inst);
        staticLabels.push({
          key: `br-${br.id}`,
          wx: snap.wx,
          wy: snap.waterY + 1.55,
          wz: snap.wz,
          priority: isDismantled ? 2 : 3,
          tone: isDismantled ? 'siege' : 'convoy',
          textRu: `${isDismantled ? '💥' : '🌉'} ${br.badgeRu}`,
          textEn: `${isDismantled ? '💥' : '🌉'} ${br.badgeEn}`,
          onClick: () => p.handleToggleRiverBridge && p.handleToggleRiverBridge(br.id)
        });
      });

      // 4. Сигнальные сторожевые маяки-вежи на вершинах хребтов (каменный цоколь, ступени, сруб, живой GLSL-огонь)
      // Автоматический отступ от башен наибств и крепостей исключает пересечение маяка с боевыми башнями
      resolvedBeaconPositions.clear();
      const towerObstacles = [
        ...(p.naibates || []).filter((n) => n.coords).map((n) => ({ mx: n.coords.x, my: n.coords.y })),
        ...(p.cordonFortresses || []).map((f) => ({ mx: f.x, my: f.y }))
      ];
      (p.signalBeacons || []).forEach((b, bIdx) => {
        let bx = b.x;
        let by = b.y;
        towerObstacles.forEach((ob) => {
          const dx = bx - ob.mx;
          const dy = by - ob.my;
          const dist = Math.hypot(dx, dy);
          if (dist < 26) {
            const nx = dist > 0.1 ? dx / dist : -0.7;
            const ny = dist > 0.1 ? dy / dist : -0.7;
            bx = ob.mx + nx * 28;
            by = ob.my + ny * 28;
          }
        });
        const resolved = mapToWorld(bx, by);
        const { wx, wy, wz } = resolved;
        resolvedBeaconPositions.set(b.id, { wx, wy, wz, mx: bx, my: by });
        const inst = createPhotorealSignalBeaconInstance({
          isLit: Boolean(b.isLit),
          scale: 1.26,
          castShadow: true,
          phase: bIdx * 1.73
        });
        inst.position.set(wx, wy, wz);
        inst.rotation.y = (bIdx * 1.15) % (Math.PI * 2);
        inst.traverse((ch) => {
          if (ch.isMesh && !ch.userData?.excludeFromGtao) {
            ch.userData = { ...ch.userData, kind: 'beacon', id: b.id, raw: b };
            staticPickables.push(ch);
          }
        });
        staticLayer.add(inst);
        if (b.isLit) {
          const glowMat = new THREE.MeshBasicMaterial({
            color: '#fb923c',
            transparent: true,
            opacity: 0.38,
            depthWrite: false,
            side: THREE.DoubleSide
          });
          staticDisposableMats.push(glowMat);
          const glowRing = new THREE.Mesh(sharedBeaconHaloGeo, glowMat);
          glowRing.rotation.x = -Math.PI / 2;
          glowRing.position.set(wx, wy + 0.06, wz);
          glowRing.userData.excludeFromGtao = true;
          staticLayer.add(glowRing);
        }
        staticLabels.push({
          key: `bcn-${b.id}`,
          wx,
          wy: wy + 2.05,
          wz,
          priority: 3,
          tone: b.isLit ? 'convoy' : 'default',
          textRu: `${b.isLit ? '🔥' : '🪨'} ${b.badgeRu}`,
          textEn: `${b.isLit ? '🔥' : '🪨'} ${b.badgeEn}`,
          onClick: () => p.handleToggleSignalBeacon && p.handleToggleSignalBeacon(b.id)
        });
      });

      // 5. Мемориалы славы на местах минувших сражений (с отступом от сигнальных маяков и башен — без пересечений!)
      (p.battleMemorials || []).forEach((mem) => {
        let mx = mem.x ?? 350;
        let my = mem.y ?? 230;
        resolvedBeaconPositions.forEach((bp) => {
          const dx = mx - bp.mx;
          const dy = my - bp.my;
          const dist = Math.hypot(dx, dy);
          if (dist < 22) {
            const nx = dist > 0.1 ? dx / dist : 0.78;
            const ny = dist > 0.1 ? dy / dist : 0.62;
            mx = bp.mx + nx * 25;
            my = bp.my + ny * 25;
          }
        });
        const { wx, wy, wz } = mapToWorld(mx, my);
        const isVictoryMem = mem.won !== false;
        const dateRu = mem.year || mem.seasonRu || '1845 г.';
        const dateEn = mem.year || mem.seasonEn || '1845';
        const obMat = new THREE.MeshStandardMaterial({
          color: isVictoryMem ? '#d99b26' : '#94a3b8',
          emissive: isVictoryMem ? '#92400e' : '#000000',
          emissiveIntensity: isVictoryMem ? 0.35 : 0,
          metalness: 0.72,
          roughness: 0.28
        });
        staticDisposableMats.push(obMat);
        const obelisk = new THREE.Mesh(sharedObeliskGeo, obMat);
        obelisk.position.set(wx, wy + 0.62, wz);
        obelisk.castShadow = true;
        staticLayer.add(obelisk);
        staticLabels.push({
          key: `mem-${mem.id}`,
          wx,
          wy: wy + 1.62,
          wz,
          priority: 3,
          tone: isVictoryMem ? 'convoy' : 'default',
          textRu: `${isVictoryMem ? '⚔' : '🕯'} ${mem.titleRu} (${dateRu})`,
          textEn: `${isVictoryMem ? '⚔' : '🕯'} ${mem.titleEn || mem.titleRu} (${dateEn})`,
          onClick: () => {}
        });
      });
    };

    const rebuildPickablesList = () => {
      mobilePickables.length = 0;
      unitRegistry.forEach((ent) => {
        ent.meshes.forEach((m) => mobilePickables.push(m));
      });
      columnRegistry.forEach((ent) => {
        ent.meshes.forEach((m) => mobilePickables.push(m));
        ent.convoyMeshes.forEach((m) => mobilePickables.push(m));
      });
    };

    // Мгновенная синхронная сборка всех процедурных фотореалистичных укреплений, саклей, мостов и маяков (0 мс ожидания GLB!)
    syncStaticStructures();

    // Управление 3D-камерой (Orbit + Pan + Wheel Zoom + Raycast клик)
    const raycaster = new THREE.Raycaster();
    const pointerNdc = new THREE.Vector2();

    const onPointerDown = (e) => {
      unlockSpatialBattleAudio(Boolean(latestPropsRef.current.soundEnabled));
      const o = orbitRef.current;
      o.isDragging = true;
      o.dragButton = e.button;
      o.lastX = e.clientX;
      o.lastY = e.clientY;
      o.movedPx = 0;
    };

    const onPointerMove = (e) => {
      const o = orbitRef.current;
      if (!o.isDragging) return;
      const dx = e.clientX - o.lastX;
      const dy = e.clientY - o.lastY;
      o.lastX = e.clientX;
      o.lastY = e.clientY;
      o.movedPx += Math.hypot(dx, dy);

      if (o.dragButton === 2 || e.shiftKey) {
        const curPreset = latestPropsRef.current.cameraPresetLabel;
        if (
          curPreset === 'eagles' ||
          curPreset === 'riders' ||
          curPreset === 'columns' ||
          curPreset === 'fortresses' ||
          curPreset === 'nature'
        ) {
          o.radius = Math.max(22, o.radius);
          setCameraPresetLabel('focus');
        }
        const panScale = o.radius * 0.0018;
        o.targetX = Math.max(-28, Math.min(28, o.targetX - dx * Math.cos(o.yaw) * panScale));
        o.targetZ = Math.max(-20, Math.min(20, o.targetZ - dy * panScale));
      } else {
        const curPreset = latestPropsRef.current.cameraPresetLabel;
        const minPitch =
          curPreset === 'eagles'
            ? -0.22
            : curPreset === 'riders' || curPreset === 'columns' || curPreset === 'fortresses' || curPreset === 'nature'
            ? 0.06
            : 0.24;
        o.yaw -= dx * 0.0065;
        o.pitch = Math.max(minPitch, Math.min(1.36, o.pitch + dy * 0.0055));
      }
    };

    const handleRaycastAt = (clientX, clientY) => {
      const rect = renderer.domElement.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      pointerNdc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointerNdc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointerNdc, camera);

      const p = latestPropsRef.current;
      const allPickables = [...eaglePickables, ...mobilePickables, ...staticPickables];
      const hits = raycaster.intersectObjects(allPickables, false);
      if (hits.length > 0) {
        const ud = hits[0].object.userData || {};
        if (ud.kind === 'eagle') {
          trackedEagleIdxRef.current = ud.eagleIdx ?? 0;
          const o = orbitRef.current;
          o.yaw = 0.52;
          o.pitch = 0.34;
          o.radius = 2.05;
          setCameraPresetLabel('eagles');
          playSpatialBattleSound('eagle_cry_3d', hits[0].point, {
            enabled: Boolean(p.soundEnabled),
            environment: 'gorge'
          });
          return;
        }
        if (ud.kind === 'naibate' && p.setSelectedNaibateId) {
          p.setSelectedNaibateId(ud.id);
          return;
        }
        if (ud.kind === 'unit' && p.setSelectedUnitId) {
          p.setSelectedUnitId(ud.id);
          if (p.cameraPresetLabel === 'riders') {
            const heroOrder = { unit_hadji_murat: 0, unit_baysungur: 1, unit_chapar_vedeno: 2 };
            const mounted = (p.liveFieldUnits || [])
              .filter((u) => {
                const nm = `${u.nameRu || ''} ${u.badgeRu || ''}`.toLowerCase();
                return (
                  u.type !== 'artillery' &&
                  !nm.includes('оруд') &&
                  !nm.includes('артил') &&
                  u.type !== 'wagon' &&
                  !nm.includes('обоз')
                );
              })
              .sort((a, b) => (heroOrder[a.id] ?? 9) - (heroOrder[b.id] ?? 9));
            const mIdx = mounted.findIndex((u) => u.id === ud.id);
            if (mIdx >= 0) trackedRiderIdxRef.current = mIdx;
          }
          return;
        }
        if (ud.kind === 'column' && p.handleInterceptImperialColumn) {
          p.handleInterceptImperialColumn(ud.id);
          return;
        }
        if (ud.kind === 'convoy' && p.handleSeverColumnSupplyLine) {
          p.handleSeverColumnSupplyLine(ud.id);
          return;
        }
        if (ud.kind === 'bridge' && p.handleToggleRiverBridge) {
          p.handleToggleRiverBridge(ud.id);
          return;
        }
        if (ud.kind === 'beacon' && p.handleToggleSignalBeacon) {
          p.handleToggleSignalBeacon(ud.id);
          return;
        }
      }

      // Клик / тап по 3D-рельефу отправляет выбранный отряд в поход с 3D-галопом и пылью из-под копыт!
      const terrHits = raycaster.intersectObject(terrainMesh, false);
      if (terrHits.length > 0 && p.handleStrategicMapClick) {
        const pt = terrHits[0].point;
        const mx = Math.round(pt.x * 10 + 350);
        const my = Math.round(pt.z * 10 + 230);
        for (let k = 0; k < 6; k++) {
          smokeSys.spawnSmoke({
            x: pt.x + (Math.random() - 0.5) * 0.36,
            y: pt.y + 0.16,
            z: pt.z + (Math.random() - 0.5) * 0.36,
            vx: (Math.random() - 0.5) * 0.72,
            vy: 0.48 + Math.random() * 0.45,
            vz: (Math.random() - 0.5) * 0.72,
            scale: 0.34,
            grow: 0.85,
            life: 1.0,
            flash: true,
            flashHex: '#34d399',
            colorHex: '#d97706',
            maxOpacity: 0.62
          });
        }
        p.handleStrategicMapClick(mx, my);
      }
    };

    const onPointerUp = (e) => {
      const o = orbitRef.current;
      const wasClick = o.isDragging && o.movedPx < 6 && o.dragButton === 0;
      o.isDragging = false;
      if (!wasClick) return;
      handleRaycastAt(e.clientX, e.clientY);
    };

    const onWheel = (e) => {
      e.preventDefault();
      const o = orbitRef.current;
      const curPreset = latestPropsRef.current.cameraPresetLabel;
      const isMacroCam =
        curPreset === 'eagles' ||
        curPreset === 'riders' ||
        curPreset === 'columns' ||
        curPreset === 'fortresses' ||
        curPreset === 'nature';
      const minR = isMacroCam ? 1.15 : 17;
      const wheelStep = isMacroCam ? 0.008 : 0.04;
      o.radius = Math.max(minR, Math.min(82, o.radius + e.deltaY * wheelStep));
    };

    const onContextMenu = (e) => e.preventDefault();

    const domEl = renderer.domElement;
    domEl.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    domEl.addEventListener('wheel', onWheel, { passive: false });
    domEl.addEventListener('contextmenu', onContextMenu);

    const touchControls = attachUnified3DTouchControls(domEl, {
      onInteractionStart: () => unlockSpatialBattleAudio(Boolean(latestPropsRef.current.soundEnabled)),
      onOrbit: (dx, dy) => {
        const o = orbitRef.current;
        const curPreset = latestPropsRef.current.cameraPresetLabel;
        const minPitch =
          curPreset === 'eagles'
            ? -0.22
            : curPreset === 'riders' || curPreset === 'columns' || curPreset === 'fortresses' || curPreset === 'nature'
            ? 0.06
            : 0.24;
        o.yaw -= dx * 0.0072;
        o.pitch = Math.max(minPitch, Math.min(1.36, o.pitch + dy * 0.0062));
      },
      onPan: (dx, dy) => {
        const o = orbitRef.current;
        const curPreset = latestPropsRef.current.cameraPresetLabel;
        if (
          curPreset === 'eagles' ||
          curPreset === 'riders' ||
          curPreset === 'columns' ||
          curPreset === 'fortresses' ||
          curPreset === 'nature'
        ) {
          o.radius = Math.max(22, o.radius);
          setCameraPresetLabel('focus');
        }
        const panScale = o.radius * 0.0022;
        o.targetX = Math.max(-28, Math.min(28, o.targetX - dx * Math.cos(o.yaw) * panScale));
        o.targetZ = Math.max(-20, Math.min(20, o.targetZ - dy * panScale));
      },
      onPinchZoom: (pinchDelta) => {
        const o = orbitRef.current;
        const curPreset = latestPropsRef.current.cameraPresetLabel;
        const isMacroCam =
          curPreset === 'eagles' ||
          curPreset === 'riders' ||
          curPreset === 'columns' ||
          curPreset === 'fortresses' ||
          curPreset === 'nature';
        const minR = isMacroCam ? 1.15 : 17;
        const pinchScale = isMacroCam ? 0.03 : 0.14;
        o.radius = Math.max(minR, Math.min(82, o.radius - pinchDelta * pinchScale));
      },
      onTap: (cx, cy) => handleRaycastAt(cx, cy),
      onLongPress: (cx, cy) => handleRaycastAt(cx, cy)
    });

    const onResize = () => {
      if (!container || disposed) return;
      const w = container.clientWidth || 960;
      const h = container.clientHeight || 540;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      if (composer) {
        composer.setSize(w, h);
      }
      if (gtaoPass) {
        gtaoPass.setSize(Math.max(256, Math.round(w * 0.75)), Math.max(256, Math.round(h * 0.75)));
      }
      if (bloomPass) {
        bloomPass.resolution.set(Math.max(256, Math.round(w / 2)), Math.max(256, Math.round(h / 2)));
      }
      if (postFx) {
        postFx.setSize(w, h);
      }
    };
    window.addEventListener('resize', onResize);
    const resizeObs =
      typeof ResizeObserver !== 'undefined' && container
        ? new ResizeObserver(() => onResize())
        : null;
    if (resizeObs && container) {
      resizeObs.observe(container);
    }

    // Главный цикл 3D-рендера (60–120 FPS)
    let rafId = 0;
    let frameNum = 0;
    let ambientSiegeTimer = 1.6;
    let smokePlumeTimer = 0;
    const clock = new THREE.Clock();
    const projVec = new THREE.Vector3();
    const sunDirTmp = new THREE.Vector3();

    const animate = () => {
      if (disposed) return;
      rafId = requestAnimationFrame(animate);
      const dt = Math.min(0.05, clock.getDelta());
      const elapsed = clock.elapsedTime;
      frameNum++;

      const p = latestPropsRef.current;
      if (p.seasonPhase && p.seasonPhase !== lastSeasonApplied) {
        lastSeasonApplied = p.seasonPhase;
        applySeasonalFoliagePalette(lastSeasonApplied);
      }
      if (frameNum % 15 === 0) {
        syncStaticStructures();
      }

      // 0. Бегущие тени облаков на рельефе, живые пороги горных рек, буруны у валунов и дрейф тумана в теснинах
      terrainUniforms.uTime.value = elapsed;
      riverMat.uniforms.uTime.value = elapsed;
      riverFoamWakeMat.uniforms.uTime.value = elapsed;
      skyUniforms.uTime.value = elapsed;
      surroundUniforms.uTime.value = elapsed;
      if (crownMat.userData.foliageUniforms) crownMat.userData.foliageUniforms.uFoliageTime.value = elapsed;
      if (pineMat.userData.foliageUniforms) pineMat.userData.foliageUniforms.uFoliageTime.value = elapsed;
      if (undergrowthMat.userData.foliageUniforms) {
        undergrowthMat.userData.foliageUniforms.uFoliageTime.value = elapsed;
      }
      valleyMistGroup.children.forEach((mp) => {
        const ud = mp.userData;
        mp.position.x = ud.baseX + Math.sin(elapsed * 0.24 + ud.phase) * 0.95;
        mp.position.z = ud.baseZ + Math.cos(elapsed * 0.19 + ud.phase) * 0.65;
      });

      // 1. Ручной залп всех горных батарей Имамата (кнопка «💥 Залп батарей (3D)»)
      if (salvoCommandRef.current !== lastHandledSalvoCmd) {
        lastHandledSalvoCmd = salvoCommandRef.current;
        const visibleCols = (p.liveImperialColumns || []).filter((c) => !c.fogHidden);
        const targetCol = visibleCols[0] || { x: 185, y: 112 };
        const targetW = mapToWorld(targetCol.x, targetCol.y);

        const talkhig = (p.liveFieldUnits || []).find((u) => u.id === 'unit_talkhig_artillery');
        if (talkhig) {
          fireArtilleryArc3D(mapToWorld(talkhig.x, talkhig.y), targetW, true);
          const ent = unitRegistry.get(talkhig.id);
          if (ent) ent.recoil = 1.0;
        }
        const capId = p.capitalNaibateId || 'vedeno';
        const capNaib = (p.naibates || []).find((n) => n.id === capId);
        if (capNaib?.coords) {
          fireArtilleryArc3D(mapToWorld(capNaib.coords.x, capNaib.coords.y), targetW, true);
        }
      }

      // 2. Автоматическая живая перестрелка над осаждёнными аулами + дым пожаров и костров
      ambientSiegeTimer -= dt;
      smokePlumeTimer -= dt;
      if (ambientSiegeTimer <= 0) {
        ambientSiegeTimer = 2.8 + Math.random() * 1.4;
        const besieged = (p.naibates || []).filter((n) => n.underSiege && n.coords);
        const visCols = (p.liveImperialColumns || []).filter((c) => !c.fogHidden);
        if (besieged.length > 0) {
          const nb = besieged[Math.floor(Math.random() * besieged.length)];
          const nbW = mapToWorld(nb.coords.x, nb.coords.y);
          const srcCol = visCols[0];
          const fromW = srcCol
            ? mapToWorld(srcCol.x, srcCol.y)
            : { wx: nbW.wx + 3.8, wy: nbW.wy + 0.2, wz: nbW.wz - 3.6 };
          if (Math.random() > 0.4) {
            fireArtilleryArc3D(fromW, nbW, false);
          } else {
            fireArtilleryArc3D(nbW, fromW, true);
          }
        }
      }

      if (smokePlumeTimer <= 0) {
        smokePlumeTimer = 0.18;
        (p.naibates || []).forEach((n) => {
          if (!n.underSiege || !n.coords) return;
          const { wx, wy, wz } = mapToWorld(n.coords.x, n.coords.y);
          smokeSys.spawnSmoke({
            x: wx + (Math.random() - 0.5) * 0.72,
            y: wy + 1.85,
            z: wz + (Math.random() - 0.5) * 0.72,
            vx: 0.28 + (Math.random() - 0.5) * 0.2,
            vy: 0.78 + Math.random() * 0.45,
            vz: (Math.random() - 0.5) * 0.2,
            scale: 0.44,
            grow: 0.92,
            life: 3.1,
            flash: Math.random() > 0.76,
            flashHex: '#ea580c',
            colorHex: '#64748b',
            maxOpacity: 0.52
          });
        });
        (p.signalBeacons || []).forEach((b) => {
          if (!b.isLit) return;
          const bPos = resolvedBeaconPositions.get(b.id) || mapToWorld(b.x, b.y);
          // Высокий столб густого горного сигнального дыма, уносимого ветром с вершины хребта
          smokeSys.spawnSmoke({
            x: bPos.wx + (Math.random() - 0.5) * 0.16,
            y: bPos.wy + 1.88,
            z: bPos.wz + (Math.random() - 0.5) * 0.16,
            vx: 0.28 + (Math.random() - 0.5) * 0.08,
            vy: 1.05 + Math.random() * 0.36,
            vz: -0.09 + (Math.random() - 0.5) * 0.08,
            scale: 0.36 + Math.random() * 0.10,
            grow: 0.92,
            life: 2.85,
            flash: Math.random() > 0.52,
            flashHex: '#ea580c',
            colorHex: '#64748b',
            maxOpacity: 0.62
          });
        });
      }

      // 3. Плавная 60 FPS кинематика сотен Имамата: галоп коней, пыль из-под копыт и 3D-маршрут по перевалам
      const dynamicLabels = [];
      let registryChanged = false;

      {
        const seenUnitIds = new Set();
        let activeMarchUnit = null;

        (p.liveFieldUnits || []).forEach((u, idx) => {
          seenUnitIds.add(u.id);
          const isHero = u.id === 'unit_hadji_murat' || u.id === 'unit_baysungur';
          const isCannon = u.id === 'unit_talkhig_artillery';
          const isWagon = u.id === 'unit_powder_caravan';
          const key =
            u.id === 'unit_hadji_murat'
              ? 'hero_hadji_murat'
              : u.id === 'unit_baysungur'
              ? 'hero_baysungur'
              : isCannon
              ? 'unicorn_cannon'
              : isWagon
              ? 'supply_wagon'
              : 'cavalry_naib';

          const targetW = mapToWorld(u.x, u.y);
          const isCavalryKey =
            key === 'hero_hadji_murat' || key === 'hero_baysungur' || key === 'cavalry_naib';
          const isPhotorealCorpsKey = key === 'unicorn_cannon' || key === 'supply_wagon';
          let ent = unitRegistry.get(u.id);
          if (!ent) {
            const root = new THREE.Group();
            const inner = isCavalryKey
              ? createPhotorealCavalryInstance(key, { scale: 1.0, castShadow: true })
              : key === 'unicorn_cannon'
              ? createPhotorealUnicornCannonInstance({
                  variant: 'imamat',
                  includeAmmoChest: true,
                  scale: 1.12,
                  castShadow: true
                })
              : createPhotorealSupplyWagonInstance({
                  includeDraftHorse: true,
                  scale: 0.96,
                  castShadow: true
                });
            const meshes = [];
            inner.traverse((ch) => {
              if (ch.isMesh) {
                ch.castShadow = true;
                ch.receiveShadow = true;
                ch.userData = { ...ch.userData, kind: 'unit', id: u.id, raw: u };
                meshes.push(ch);
              }
            });
            const ringMat = new THREE.MeshBasicMaterial({
              color: '#34d399',
              transparent: true,
              opacity: 0.74,
              depthWrite: false,
              side: THREE.DoubleSide
            });
            const ring = new THREE.Mesh(sharedUnitRingGeo, ringMat);
            ring.rotation.x = -Math.PI / 2;
            ring.position.y = 0.07;

            const legendGroup = new THREE.Group();
            const legendOuter = new THREE.Mesh(sharedLegendOuterRingGeo, sharedLegendAuraMat);
            legendOuter.rotation.x = -Math.PI / 2;
            legendOuter.position.y = 0.085;
            const legendStar = new THREE.Mesh(sharedLegendStarGeo, sharedLegendGoldMat);
            legendStar.rotation.x = -Math.PI / 2;
            legendStar.position.y = 0.1;
            const legendCrown = new THREE.Mesh(sharedLegendCrownGeo, sharedLegendGoldMat);
            legendCrown.position.y = 2.62;
            legendGroup.add(legendOuter, legendStar, legendCrown);
            legendGroup.visible = false;

            // Ночной факел всадника (включается при ночных вылазках)
            const nightTorch = new THREE.PointLight('#fb923c', 0, 9.5, 1.6);
            nightTorch.position.set(0, 1.6, 0.3);
            root.add(inner, ring, legendGroup, nightTorch);
            root.position.set(targetW.wx, targetW.wy, targetW.wz);
            mobileLayer.add(root);
            ent = {
              root,
              inner,
              isPhotorealCavalry: isCavalryKey,
              isPhotorealCorps: isPhotorealCorpsKey,
              ring,
              ringMat,
              legendGroup,
              legendStar,
              legendCrown,
              nightTorch,
              meshes,
              wx: targetW.wx,
              wy: targetW.wy,
              wz: targetW.wz,
              rotY: Math.PI + ((u.headingDeg || 0) * Math.PI) / 180,
              dustCooldown: 0,
              recoil: 0,
              seed: idx * 1.7
            };
            unitRegistry.set(u.id, ent);
            registryChanged = true;
          }

          if (!ent) return;

          const dx = targetW.wx - ent.wx;
          const dz = targetW.wz - ent.wz;
          const distDelta = Math.hypot(dx, dz);
          const lerpFactor = Math.min(1, dt * 8.5);
          ent.wx += dx * lerpFactor;
          ent.wz += dz * lerpFactor;
          const groundNow = mapToWorld(ent.wx * 10 + 350, ent.wz * 10 + 230).wy;
          ent.wy += (groundNow - ent.wy) * Math.min(1, dt * 12);

          const desiredRotY =
            distDelta > 0.02
              ? Math.atan2(-dx, -dz) + Math.PI
              : Math.PI + ((u.headingDeg || 0) * Math.PI) / 180;
          ent.rotY += (desiredRotY - ent.rotY) * Math.min(1, dt * 7);

          const isSel = u.id === p.selectedUnitId;
          const isMoving = u.status === 'moving' || distDelta > 0.025;
          ent.root.position.set(ent.wx, ent.wy, ent.wz);
          ent.inner.rotation.y = ent.rotY;
          ent.inner.scale.setScalar(isHero ? (isSel ? 1.28 : 1.15) : isSel ? 1.15 : 0.98);

          if (ent.nightTorch) {
            ent.nightTorch.intensity =
              p.dioramaTimeOfDay === 'night' && (isHero || isSel || isMoving)
                ? 2.2 + Math.sin(elapsed * 9 + ent.seed) * 0.45
                : 0;
          }

          if (ent.recoil > 0.01) {
            ent.inner.position.z = ent.recoil * 0.35;
            ent.recoil = Math.max(0, ent.recoil - dt * 2.5);
          } else {
            ent.inner.position.z = 0;
          }

          if (isMoving) {
            if (ent.isPhotorealCavalry || ent.isPhotorealCorps) {
              ent.inner.position.y = 0;
              ent.inner.rotation.x = 0;
            } else if (!isCannon && !isWagon) {
              const stride = elapsed * 13.0 + ent.seed;
              ent.inner.position.y = Math.abs(Math.sin(stride)) * 0.22;
              ent.inner.rotation.x = Math.sin(stride) * 0.11;
            } else {
              ent.inner.position.y = Math.abs(Math.sin(elapsed * 17.0 + ent.seed)) * 0.06;
              ent.inner.rotation.x = 0;
            }
            ent.dustCooldown -= dt;
            if (ent.dustCooldown <= 0) {
              ent.dustCooldown = 0.08;
              smokeSys.spawnSmoke({
                x: ent.wx + (Math.random() - 0.5) * 0.32,
                y: ent.wy + 0.13,
                z: ent.wz + (Math.random() - 0.5) * 0.32,
                vx: (Math.random() - 0.5) * 0.42,
                vy: 0.28 + Math.random() * 0.26,
                vz: (Math.random() - 0.5) * 0.42,
                scale: 0.26 + Math.random() * 0.14,
                grow: 0.65,
                life: 0.9,
                colorHex: p.seasonPhase === 'winter' ? '#cbd5e1' : '#b8a68e',
                maxOpacity: 0.45
              });
            }
          } else {
            ent.inner.position.y =
              ent.isPhotorealCavalry || ent.isPhotorealCorps
                ? 0
                : Math.sin(elapsed * 2.4 + ent.seed) * 0.025;
            ent.inner.rotation.x = 0;
          }
          let cavSlopePitch = 0;
          let cavSlopeRoll = 0;
          if (ent.isPhotorealCavalry) {
            const curMapX = ent.wx * 10 + 350;
            const curMapY = ent.wz * 10 + 230;
            const fwdX = Math.sin(ent.rotY);
            const fwdZ = Math.cos(ent.rotY);
            const leftX = Math.cos(ent.rotY);
            const leftZ = -Math.sin(ent.rotY);
            const dW = 0.56;
            const dL = 0.34;
            const hFwd = mapToWorld(
              Math.max(0, Math.min(700, curMapX + fwdX * dW * 10)),
              Math.max(0, Math.min(460, curMapY + fwdZ * dW * 10))
            ).wy;
            const hBack = mapToWorld(
              Math.max(0, Math.min(700, curMapX - fwdX * dW * 10)),
              Math.max(0, Math.min(460, curMapY - fwdZ * dW * 10))
            ).wy;
            const hLeft = mapToWorld(
              Math.max(0, Math.min(700, curMapX + leftX * dL * 10)),
              Math.max(0, Math.min(460, curMapY + leftZ * dL * 10))
            ).wy;
            const hRight = mapToWorld(
              Math.max(0, Math.min(700, curMapX - leftX * dL * 10)),
              Math.max(0, Math.min(460, curMapY - leftZ * dL * 10))
            ).wy;
            const tgtPitch = Math.max(-0.34, Math.min(0.34, -Math.atan2(hFwd - hBack, 2 * dW)));
            const tgtRoll = Math.max(-0.28, Math.min(0.28, Math.atan2(hLeft - hRight, 2 * dL)));
            ent.slopePitch = (ent.slopePitch ?? tgtPitch) + (tgtPitch - (ent.slopePitch ?? tgtPitch)) * Math.min(1, dt * 8);
            ent.slopeRoll = (ent.slopeRoll ?? tgtRoll) + (tgtRoll - (ent.slopeRoll ?? tgtRoll)) * Math.min(1, dt * 8);
            cavSlopePitch = ent.slopePitch;
            cavSlopeRoll = ent.slopeRoll;
          }
          updateGlbArticulation(ent.inner, {
            elapsed,
            dt,
            phase: ent.seed,
            moving: isMoving,
            selected: isSel,
            recoil: ent.recoil,
            slopePitch: cavSlopePitch,
            slopeRoll: cavSlopeRoll
          });

          ent.ring.visible = isSel || isHero || Boolean(u.legendaryHero);
          if (ent.ring.visible) {
            ent.ringMat.color.set(
              u.legendaryHero
                ? '#fbbf24'
                : isSel
                ? '#34d399'
                : u.id === 'unit_hadji_murat'
                ? '#ef4444'
                : '#10b981'
            );
          }

          if (ent.legendGroup) {
            ent.legendGroup.visible = Boolean(u.legendaryHero);
            if (u.legendaryHero) {
              ent.legendStar.rotation.z = elapsed * 0.85 + ent.seed;
              ent.legendCrown.rotation.y = elapsed * 1.45;
              ent.legendCrown.position.y =
                (isHero ? 2.65 : 2.32) + Math.sin(elapsed * 2.8 + ent.seed) * 0.1;
            }
          }

          if (
            (isSel || isMoving) &&
            Number.isFinite(u.targetX) &&
            Number.isFinite(u.targetY) &&
            Math.hypot(u.targetX - u.x, u.targetY - u.y) > 8
          ) {
            activeMarchUnit = u;
          }

          const stars = u.vetXp ? '★'.repeat(Math.min(3, u.vetXp)) + ' ' : '';
          const crownPrefix = u.legendaryHero ? '👑 ' : '';
          dynamicLabels.push({
            key: `un-${u.id}`,
            wx: ent.wx,
            wy: ent.wy + (u.legendaryHero ? 3.2 : isHero ? 2.9 : 2.55),
            wz: ent.wz,
            priority: isSel || isHero || u.legendaryHero || isMoving ? 1 : 2,
            tone: u.legendaryHero ? 'legend_hero' : isSel ? 'unit_sel' : 'unit',
            textRu: `${crownPrefix}${isMoving ? '🏇 ' : ''}${stars}${u.badgeRu} (${u.sabers ?? 180})`,
            textEn: `${crownPrefix}${isMoving ? '🏇 ' : ''}${stars}${u.badgeEn} (${u.sabers ?? 180})`,
            onClick: () => p.setSelectedUnitId && p.setSelectedUnitId(u.id)
          });
        });

        unitRegistry.forEach((ent, id) => {
          if (!seenUnitIds.has(id)) {
            mobileLayer.remove(ent.root);
            ent.ringMat.dispose();
            if (ent.isPhotorealCavalry) {
              disposePhotorealCavalryInstance(ent.inner);
            }
            if (ent.isPhotorealCorps) {
              disposePhotorealCorpsInstance(ent.inner);
            }
            unitRegistry.delete(id);
            registryChanged = true;
          }
        });

        if (activeMarchUnit) {
          const rawPts =
            activeMarchUnit.waypoints && activeMarchUnit.waypoints.length > 1
              ? activeMarchUnit.waypoints.slice(activeMarchUnit.waypointIdx || 0)
              : [
                  { x: activeMarchUnit.x, y: activeMarchUnit.y },
                  { x: activeMarchUnit.targetX, y: activeMarchUnit.targetY }
                ];
          let ptCount = 0;
          const startW = mapToWorld(activeMarchUnit.x, activeMarchUnit.y);
          activeRoutePositions[0] = startW.wx;
          activeRoutePositions[1] = startW.wy + 0.24;
          activeRoutePositions[2] = startW.wz;
          ptCount = 1;
          for (let ri = 0; ri < rawPts.length && ptCount < MAX_ROUTE_PTS; ri++) {
            const w = mapToWorld(rawPts[ri].x, rawPts[ri].y);
            activeRoutePositions[ptCount * 3] = w.wx;
            activeRoutePositions[ptCount * 3 + 1] = w.wy + 0.25;
            activeRoutePositions[ptCount * 3 + 2] = w.wz;
            ptCount++;
          }
          activeRoutePosAttr.needsUpdate = true;
          activeRouteGeo.setDrawRange(0, ptCount);
          activeRouteLine.visible = true;

          const destW = mapToWorld(activeMarchUnit.targetX, activeMarchUnit.targetY);
          routeTargetBeacon.position.set(destW.wx, destW.wy + 0.11, destW.wz);
          routeTargetBeacon.scale.setScalar(0.85 + Math.sin(elapsed * 5.0) * 0.18);
          routeTargetBeacon.visible = true;
        } else {
          activeRouteLine.visible = false;
          routeTargetBeacon.visible = false;
        }

        // 4. Плавное движение колонн РИ и сухарных обозов
        const seenColIds = new Set();
        (p.liveImperialColumns || []).forEach((col, idx) => {
          if (col.fogHidden) return;
          seenColIds.add(col.id);
          const colW = mapToWorld(col.x, col.y);
          const origX = col.originX ?? 260;
          const origY = col.originY ?? 48;
          const ratio = col.supplyCut ? 0.5 : Math.max(0.2, Math.min(0.9, col.convoyProgress ?? 0.45));
          const origW = mapToWorld(origX, origY);
          const rawRoadDx = colW.wx - origW.wx;
          const rawRoadDz = colW.wz - origW.wz;
          const rawRoadDist = Math.hypot(rawRoadDx, rawRoadDz);
          let rawConvWx = origW.wx + rawRoadDx * ratio;
          let rawConvWz = origW.wz + rawRoadDz * ratio;
          if (rawRoadDist > 0.2 && rawRoadDist < 5.8) {
            const ux = rawRoadDx / rawRoadDist;
            const uz = rawRoadDz / rawRoadDist;
            const backDist = Math.max(2.15, rawRoadDist * (1 - ratio));
            rawConvWx = colW.wx - ux * backDist;
            rawConvWz = colW.wz - uz * backDist;
            // Если звёздчатые бастионы крепости слишком близко, выводим обоз на чистую обочину дороги рядом с колонной!
            if (Math.hypot(rawConvWx - origW.wx, rawConvWz - origW.wz) < 2.45) {
              rawConvWx = colW.wx - ux * 1.45 - uz * 2.05;
              rawConvWz = colW.wz - uz * 1.45 + ux * 2.05;
            }
          }
          const convW = mapToWorld(
            Math.max(0, Math.min(700, rawConvWx * 10 + 350)),
            Math.max(0, Math.min(460, rawConvWz * 10 + 230))
          );

          let cent = columnRegistry.get(col.id);
          if (!cent) {
            const colRoot = createPhotorealImperialColumnInstance({
              scale: 1.05,
              castShadow: true
            });
            const meshes = [];
            colRoot.traverse((ch) => {
              if (ch.isMesh) {
                ch.castShadow = true;
                ch.receiveShadow = true;
                ch.userData = { ...ch.userData, kind: 'column', id: col.id, raw: col };
                meshes.push(ch);
              }
            });

            const convoyRoot = createPhotorealSupplyWagonInstance({
              includeDraftHorse: true,
              scale: 0.94,
              castShadow: true
            });
            const convoyMeshes = [];
            convoyRoot.traverse((ch) => {
              if (ch.isMesh) {
                ch.castShadow = true;
                ch.receiveShadow = true;
                ch.userData = { ...ch.userData, kind: 'convoy', id: col.id, raw: col };
                convoyMeshes.push(ch);
              }
            });

            const lineMat = new THREE.LineBasicMaterial({
              color: '#f59e0b',
              transparent: true,
              opacity: 0.72
            });
            const supplyPositions = new Float32Array(9);
            const supplyPosAttr = new THREE.BufferAttribute(supplyPositions, 3);
            supplyPosAttr.setUsage(THREE.DynamicDrawUsage);
            const supplyGeo = new THREE.BufferGeometry();
            supplyGeo.setAttribute('position', supplyPosAttr);
            const supplyLine = new THREE.Line(supplyGeo, lineMat);

            const initMarchYaw = Math.atan2(colW.wx - origW.wx, colW.wz - origW.wz);
            colRoot.rotation.y = initMarchYaw;

            mobileLayer.add(colRoot, convoyRoot, supplyLine);
            cent = {
              colRoot,
              convoyRoot,
              supplyLine,
              supplyPositions,
              supplyPosAttr,
              lineMat,
              meshes,
              convoyMeshes,
              wx: colW.wx,
              wy: colW.wy,
              wz: colW.wz,
              rotY: initMarchYaw,
              cwx: convW.wx,
              cwy: convW.wy,
              cwz: convW.wz,
              seed: idx * 2.1
            };
            columnRegistry.set(col.id, cent);
            registryChanged = true;
          }

          if (!cent) return;
          const clerp = Math.min(1, dt * 6.5);
          const cdx = colW.wx - cent.wx;
          const cdz = colW.wz - cent.wz;
          cent.wx += cdx * clerp;
          cent.wy += (colW.wy - cent.wy) * clerp;
          cent.wz += cdz * clerp;
          const marchVecX = Math.hypot(cdx, cdz) > 0.02 ? cdx : colW.wx - origW.wx;
          const marchVecZ = Math.hypot(cdx, cdz) > 0.02 ? cdz : colW.wz - origW.wz;
          if (Math.hypot(marchVecX, marchVecZ) > 0.01) {
            cent.rotY = Math.atan2(marchVecX, marchVecZ);
          }
          const colMoving = Math.hypot(cdx, cdz) > 0.015 || !col.supplyCut;
          cent.colRoot.position.set(cent.wx, cent.wy, cent.wz);
          cent.colRoot.rotation.y = cent.rotY;
          updateGlbArticulation(cent.colRoot, {
            elapsed,
            dt,
            phase: cent.seed,
            moving: colMoving
          });

          cent.cwx += (convW.wx - cent.cwx) * clerp;
          cent.cwy += (convW.wy - cent.cwy) * clerp;
          cent.cwz += (convW.wz - cent.cwz) * clerp;
          cent.convoyRoot.visible = !col.supplyCut;
          if (!col.supplyCut) {
            cent.convoyRoot.position.set(cent.cwx, cent.cwy, cent.cwz);
            cent.convoyRoot.lookAt(cent.wx, cent.cwy, cent.wz);
            updateGlbArticulation(cent.convoyRoot, {
              elapsed,
              dt,
              phase: cent.seed + 0.8,
              moving: true
            });
          }

          cent.lineMat.color.set(col.supplyCut ? '#ef4444' : '#d97706');
          const sp = cent.supplyPositions;
          sp[0] = origW.wx;
          sp[1] = origW.wy + 0.16;
          sp[2] = origW.wz;
          sp[3] = cent.cwx;
          sp[4] = cent.cwy + 0.2;
          sp[5] = cent.cwz;
          sp[6] = cent.wx;
          sp[7] = cent.wy + 0.16;
          sp[8] = cent.wz;
          cent.supplyPosAttr.needsUpdate = true;

          dynamicLabels.push({
            key: `col-${col.id}`,
            wx: cent.wx,
            wy: cent.wy + 2.32,
            wz: cent.wz,
            priority: 1,
            tone: 'enemy',
            textRu: `⚔ ${col.badgeRu} (${col.bayonets})`,
            textEn: `⚔ ${col.badgeEn} (${col.bayonets})`,
            onClick: () => p.handleInterceptImperialColumn && p.handleInterceptImperialColumn(col.id)
          });

          if (!col.supplyCut) {
            dynamicLabels.push({
              key: `conv-${col.id}`,
              wx: cent.cwx,
              wy: cent.cwy + 1.52,
              wz: cent.cwz,
              priority: 2,
              tone: 'convoy',
              textRu: `🥖 Обоз ${Math.round(ratio * 100)}%`,
              textEn: `🥖 Convoy ${Math.round(ratio * 100)}%`,
              onClick: () => p.handleSeverColumnSupplyLine && p.handleSeverColumnSupplyLine(col.id)
            });
          }
        });

        columnRegistry.forEach((cent, id) => {
          if (!seenColIds.has(id)) {
            mobileLayer.remove(cent.colRoot, cent.convoyRoot, cent.supplyLine);
            disposePhotorealCorpsInstance(cent.colRoot);
            disposePhotorealCorpsInstance(cent.convoyRoot);
            cent.supplyLine.geometry.dispose();
            cent.lineMat.dispose();
            columnRegistry.delete(id);
            registryChanged = true;
          }
        });

        if (registryChanged) {
          rebuildPickablesList();
        }
      }

      // 5. Полёт живых 3D-ядер между батареями и взрывы с клубами порохового дыма
      salvoFlashLight.intensity *= 0.84;
      for (let s = activeTableShells.length - 1; s >= 0; s--) {
        const sh = activeTableShells[s];
        sh.progress += dt * sh.speed;
        sh.trailTimer += dt;
        const u = Math.min(1, sh.progress);
        sh.mesh.position.lerpVectors(sh.from, sh.to, u);
        sh.mesh.position.y += Math.sin(u * Math.PI) * sh.apex;

        if (sh.trailTimer > 0.055) {
          sh.trailTimer = 0;
          smokeSys.spawnSmoke({
            x: sh.mesh.position.x,
            y: sh.mesh.position.y,
            z: sh.mesh.position.z,
            vx: 0,
            vy: 0.22,
            vz: 0,
            scale: 0.24,
            grow: 0.58,
            life: 0.9,
            flash: true,
            flashHex: '#d97706',
            colorHex: '#cbd5e1',
            maxOpacity: 0.44
          });
        }

        if (sh.progress >= 1) {
          const hit = sh.to;
          playSpatialBattleSound('explosion_3d', hit, {
            enabled: Boolean(p.soundEnabled),
            environment: 'strategic'
          });
          salvoFlashLight.position.set(hit.x, hit.y + 0.8, hit.z);
          salvoFlashLight.color.set('#fb923c');
          salvoFlashLight.intensity = 7.4;
          for (let k = 0; k < 14; k++) {
            smokeSys.spawnSmoke({
              x: hit.x + (Math.random() - 0.5) * 0.52,
              y: hit.y + 0.22,
              z: hit.z + (Math.random() - 0.5) * 0.52,
              vx: (Math.random() - 0.5) * 1.35,
              vy: 0.72 + Math.random() * 0.95,
              vz: (Math.random() - 0.5) * 1.35,
              scale: 0.48 + Math.random() * 0.24,
              grow: 1.15,
              life: 2.6 + Math.random() * 1.4,
              flash: k < 4,
              flashHex: '#fb923c',
              colorHex: k < 4 ? '#e2e8f0' : '#94a3b8',
              maxOpacity: k < 4 ? 0.68 : 0.52
            });
          }
          fxLayer.remove(sh.mesh);
          sh.mat.dispose();
          activeTableShells.splice(s, 1);
        }
      }

      // 6. Анимация клубящегося порохового дыма и дорожной пыли
      smokeSys.update(dt, camera, 0.28, 0.06);

      // 7. Динамическое физическое освещение и горная погода Кавказа
      const effWeather =
        p.weatherMode3D === 'auto'
          ? p.seasonPhase === 'winter'
            ? 'snow'
            : p.seasonPhase === 'autumn' && p.weatherOverlayEnabled
            ? 'rain'
            : 'clear'
          : p.weatherMode3D || 'clear';

      if (p.dioramaTimeOfDay === 'sunset') {
        sunLight.color.set('#ff9d5c');
        sunLight.intensity = 2.35;
        sunLight.position.set(-46, 15, 16);
        hemiLight.color.set('#fed7aa');
        hemiLight.groundColor.set('#3b2316');
        hemiLight.intensity = 0.84;
        bounceLight.color.set('#f97316');
        bounceLight.intensity = 0.28;
        frontRimLight.color.set('#fdba74');
        frontRimLight.intensity = 0.42;
        oilLampLight.intensity = 0.75;
        skyUniforms.topColor.value.set('#1a1838');
        skyUniforms.midColor.value.set('#8c3c29');
        skyUniforms.horizonColor.value.set('#e69453');
        skyUniforms.sunGlowColor.value.set('#ffb26b');
        skyUniforms.cloudTint.value.set('#f7b786');
        skyUniforms.nightStarMix.value = 0.16;
        scene.fog.color.set('#7a4b3a');
        scene.fog.density = 0.0029;
        ridgeMat.color.set('#d99b78');
        surroundUniforms.uTint.value.set('#f5b88e');
        mistMat.color.set('#f5cba7');
        mistMat.opacity = 0.19;
        sharedSaklyaWinMat.color.set('#fde68a');
        sharedSaklyaWinMat.emissiveIntensity = 1.45;
        terrainUniforms.uCloudShadowStrength.value = 0.26;
        riverMat.uniforms.uLightScale.value = 0.68;
        riverMat.uniforms.uSunColor.value.set('#ffb36b');
        riverMat.uniforms.uSkyTint.value.set('#e89961');
        if (bloomPass) bloomPass.strength = 0.28;
      } else if (p.dioramaTimeOfDay === 'night') {
        sunLight.color.set('#93c5fd');
        sunLight.intensity = 1.05;
        sunLight.position.set(26, 36, -22);
        hemiLight.color.set('#60a5fa');
        hemiLight.groundColor.set('#141e2e');
        hemiLight.intensity = 0.54;
        bounceLight.color.set('#38bdf8');
        bounceLight.intensity = 0.22;
        frontRimLight.color.set('#60a5fa');
        frontRimLight.intensity = 0.28;
        oilLampLight.intensity = 1.05;
        skyUniforms.topColor.value.set('#030814');
        skyUniforms.midColor.value.set('#0c1b30');
        skyUniforms.horizonColor.value.set('#1d3352');
        skyUniforms.sunGlowColor.value.set('#93c5fd');
        skyUniforms.cloudTint.value.set('#273b56');
        skyUniforms.nightStarMix.value = 1.0;
        scene.fog.color.set('#0f1d30');
        scene.fog.density = 0.0034;
        ridgeMat.color.set('#476282');
        surroundUniforms.uTint.value.set('#3b597d');
        mistMat.color.set('#7aa2c9');
        mistMat.opacity = 0.14;
        sharedSaklyaWinMat.color.set('#fde68a');
        sharedSaklyaWinMat.emissiveIntensity = 2.35;
        terrainUniforms.uCloudShadowStrength.value = 0.14;
        riverMat.uniforms.uLightScale.value = 0.26;
        riverMat.uniforms.uSunColor.value.set('#bae6fd');
        riverMat.uniforms.uSkyTint.value.set('#38bdf8');
        if (bloomPass) bloomPass.strength = 0.34;
      } else {
        sunLight.color.set('#fff5de');
        sunLight.intensity = 2.42;
        sunLight.position.set(-34, 42, -18);
        hemiLight.color.set('#dbeafe');
        hemiLight.groundColor.set('#574736');
        hemiLight.intensity = 1.06;
        bounceLight.color.set('#93c5fd');
        bounceLight.intensity = 0.44;
        frontRimLight.color.set('#cbd5e1');
        frontRimLight.intensity = 0.58;
        oilLampLight.intensity = 0.28;
        skyUniforms.topColor.value.set('#1b4d86');
        skyUniforms.midColor.value.set('#528ec8');
        skyUniforms.horizonColor.value.set('#c5dced');
        skyUniforms.sunGlowColor.value.set('#fff2cf');
        skyUniforms.cloudTint.value.set('#f1f5f9');
        skyUniforms.nightStarMix.value = 0.0;
        scene.fog.color.set('#a8c5de');
        scene.fog.density = 0.0022;
        ridgeMat.color.set('#d8e6f2');
        surroundUniforms.uTint.value.set('#ffffff');
        mistMat.color.set('#b8d2e8');
        mistMat.opacity = 0.11;
        sharedSaklyaWinMat.color.set('#231c16');
        sharedSaklyaWinMat.emissiveIntensity = 0.0;
        terrainUniforms.uCloudShadowStrength.value = 0.22;
        riverMat.uniforms.uLightScale.value = 1.0;
        riverMat.uniforms.uSunColor.value.set('#fff3d6');
        riverMat.uniforms.uSkyTint.value.set('#7dd3fc');
        if (bloomPass) bloomPass.strength = 0.2;
      }

      if (effWeather === 'rain' || effWeather === 'snow') {
        scene.fog.density += 0.0011;
        sunLight.intensity *= 0.78;
        mistMat.opacity = Math.min(0.22, mistMat.opacity + 0.05);
      }

      sunDirTmp.copy(sunLight.position).normalize();
      terrainUniforms.uSunDir.value.copy(sunDirTmp);
      riverMat.uniforms.uSunDir.value.copy(sunDirTmp);
      riverFoamWakeMat.uniforms.uLightScale.value = riverMat.uniforms.uLightScale.value;
      riverFoamWakeMat.uniforms.uFoamTint.value.set(
        p.dioramaTimeOfDay === 'sunset'
          ? '#fde2c4'
          : p.dioramaTimeOfDay === 'night'
          ? '#93c5fd'
          : '#eef7fc'
      );
      skyUniforms.sunDir.value.copy(sunDirTmp);

      if (p.weatherOverlayEnabled && Math.sin(elapsed * 2.7) > 0.988) {
        lightningLight.intensity = 2.2;
      } else {
        lightningLight.intensity *= 0.82;
      }

      eaglesGroup.children.forEach((eg, idx) => {
        updatePhotorealGoldenEagle(eg, elapsed, idx === 0 ? sunDirTmp : null);
      });
      updatePhotorealFortressFlags(staticLayer, elapsed, p.dioramaTimeOfDay);
      updatePhotorealSignalBeacons(staticLayer, elapsed, p.dioramaTimeOfDay);

      const o = orbitRef.current;
      // В макро-режимах (у русла рек / маяков / всадников) мягко растворяем плоские слои тумана, чтобы они не резали стены каньонов
      valleyMistGroup.visible = o.radius > 11.5;
      precipSys.setMode(effWeather);
      precipSys.update(elapsed, o.targetX, o.targetZ);

      // 8. Камера с защитой от пересечения с рельефом хребтов (или макро-сопровождение беркута / конного всадника)
      const horiz = Math.cos(o.pitch) * o.radius;
      if (p.cameraPresetLabel === 'eagles' && eaglesGroup.children.length > 0) {
        const egIdx = Math.max(0, Math.min(eaglesGroup.children.length - 1, trackedEagleIdxRef.current || 0));
        const trackedEgObj = eaglesGroup.children[egIdx];
        const leadEg = trackedEgObj.position;
        const chaseYaw = trackedEgObj.rotation.y + Math.PI + o.yaw;
        const camX = leadEg.x + Math.sin(chaseYaw) * horiz;
        const camZ = leadEg.z + Math.cos(chaseYaw) * horiz;
        const camY = Math.max(leadEg.y - 0.75, leadEg.y + Math.sin(o.pitch) * o.radius);
        camera.position.set(camX, camY, camZ);
        camera.lookAt(leadEg.x, leadEg.y - 0.04, leadEg.z);
      } else if (p.cameraPresetLabel === 'riders' && unitRegistry.size > 0) {
        const heroOrder = { unit_hadji_murat: 0, unit_baysungur: 1, unit_chapar_vedeno: 2 };
        const mountedIds = (p.liveFieldUnits || [])
          .filter((u) => {
            const nm = `${u.nameRu || ''} ${u.badgeRu || ''}`.toLowerCase();
            return (
              u.type !== 'artillery' &&
              !nm.includes('оруд') &&
              !nm.includes('артил') &&
              u.type !== 'wagon' &&
              !nm.includes('обоз')
            );
          })
          .sort((a, b) => (heroOrder[a.id] ?? 9) - (heroOrder[b.id] ?? 9))
          .map((u) => u.id);
        const rIdx = mountedIds.length > 0 ? (trackedRiderIdxRef.current || 0) % mountedIds.length : 0;
        const targetId = mountedIds[rIdx] || Array.from(unitRegistry.keys())[0];
        const rEnt = unitRegistry.get(targetId);
        if (rEnt) {
          const riderScale = rEnt.inner.scale.x || 1.15;
          const lookY = rEnt.wy + 1.46 * riderScale;
          const riderWorldYaw = rEnt.rotY + o.yaw;
          const camX = rEnt.wx + Math.sin(riderWorldYaw) * horiz;
          const camZ = rEnt.wz + Math.cos(riderWorldYaw) * horiz;
          const camGround = mapToWorld(
            Math.max(0, Math.min(700, camX * 10 + 350)),
            Math.max(0, Math.min(460, camZ * 10 + 230))
          ).wy;
          const camY = Math.max(camGround + 0.35, lookY + Math.sin(o.pitch) * o.radius);
          camera.position.set(camX, camY, camZ);
          camera.lookAt(rEnt.wx, lookY, rEnt.wz);
        }
      } else if (p.cameraPresetLabel === 'columns') {
        // 1-й клик -> головная пехотная колонна РИ; 2-й клик -> сухарный фургон с упряжным конём; 3-й клик -> горный единорог Талхига; далее остальные колонны/обозы
        const colList = [];
        const convList = [];
        columnRegistry.forEach((cent) => {
          colList.push({
            wx: cent.wx,
            wy: cent.wy,
            wz: cent.wz,
            rotY: cent.rotY || 0,
            lookH: 1.12
          });
          if (cent.convoyRoot.visible) {
            convList.push({
              wx: cent.cwx,
              wy: cent.cwy,
              wz: cent.cwz,
              rotY: Math.atan2(cent.wx - cent.cwx, cent.wz - cent.cwz),
              lookH: 0.72
            });
          }
        });

        const corpsTargets = [];
        if (colList.length > 0) corpsTargets.push(colList[0]);
        if (convList.length > 0) corpsTargets.push(convList[0]);

        const talkhigEnt = unitRegistry.get('unit_talkhig_artillery');
        if (talkhigEnt) {
          corpsTargets.push({
            wx: talkhigEnt.wx,
            wy: talkhigEnt.wy,
            wz: talkhigEnt.wz,
            rotY: talkhigEnt.rotY || 0,
            lookH: 0.56
          });
        }
        for (let i = 1; i < colList.length; i++) corpsTargets.push(colList[i]);
        for (let i = 1; i < convList.length; i++) corpsTargets.push(convList[i]);

        const caravanEnt = unitRegistry.get('unit_powder_caravan');
        if (caravanEnt) {
          corpsTargets.push({
            wx: caravanEnt.wx,
            wy: caravanEnt.wy,
            wz: caravanEnt.wz,
            rotY: caravanEnt.rotY || 0,
            lookH: 0.72
          });
        }

        if (corpsTargets.length > 0) {
          const tgt = corpsTargets[(trackedCorpsIdxRef.current || 0) % corpsTargets.length];
          const lookY = tgt.wy + tgt.lookH;
          const worldYaw = tgt.rotY + o.yaw;
          const camX = tgt.wx + Math.sin(worldYaw) * horiz;
          const camZ = tgt.wz + Math.cos(worldYaw) * horiz;
          const camGround = mapToWorld(
            Math.max(0, Math.min(700, camX * 10 + 350)),
            Math.max(0, Math.min(460, camZ * 10 + 230))
          ).wy;
          const camY = Math.max(camGround + 0.32, lookY + Math.sin(o.pitch) * o.radius);
          camera.position.set(camX, camY, camZ);
          camera.lookAt(tgt.wx, lookY, tgt.wz);
        }
      } else if (p.cameraPresetLabel === 'fortresses') {
        // 1-й клик -> Столица Дарго-Ведено; 2-й клик -> Звёздчатая крепость Грозная; 3-й клик -> Боевая башня аула; далее остальные крепости и наибства!
        const fortTargets = [];
        const capId = p.capitalNaibateId || 'vedeno';
        const capN = (p.naibates || []).find((n) => n.id === capId && n.coords);
        if (capN) {
          const cw = mapToWorld(capN.coords.x, capN.coords.y);
          fortTargets.push({ wx: cw.wx, wy: cw.wy, wz: cw.wz, lookH: 1.48 });
        }
        const forts = p.cordonFortresses || [];
        if (forts.length > 0) {
          const fw = mapToWorld(forts[0].x, forts[0].y);
          fortTargets.push({ wx: fw.wx, wy: fw.wy, wz: fw.wz, lookH: 1.32 });
        }
        const otherNaibs = (p.naibates || []).filter((n) => n.id !== capId && n.coords);
        if (otherNaibs.length > 0) {
          const nw = mapToWorld(otherNaibs[0].coords.x, otherNaibs[0].coords.y);
          fortTargets.push({ wx: nw.wx, wy: nw.wy, wz: nw.wz, lookH: 1.48 });
        }
        for (let i = 1; i < forts.length; i++) {
          const fw = mapToWorld(forts[i].x, forts[i].y);
          fortTargets.push({ wx: fw.wx, wy: fw.wy, wz: fw.wz, lookH: 1.32 });
        }
        for (let i = 1; i < otherNaibs.length; i++) {
          const nw = mapToWorld(otherNaibs[i].coords.x, otherNaibs[i].coords.y);
          fortTargets.push({ wx: nw.wx, wy: nw.wy, wz: nw.wz, lookH: 1.48 });
        }

        if (fortTargets.length > 0) {
          const tgt = fortTargets[(trackedFortIdxRef.current || 0) % fortTargets.length];
          const lookY = tgt.wy + tgt.lookH;
          const camX = tgt.wx + Math.sin(o.yaw) * horiz;
          const camZ = tgt.wz + Math.cos(o.yaw) * horiz;
          const camGround = mapToWorld(
            Math.max(0, Math.min(700, camX * 10 + 350)),
            Math.max(0, Math.min(460, camZ * 10 + 230))
          ).wy;
          const camY = Math.max(camGround + 0.45, lookY + Math.sin(o.pitch) * o.radius);
          camera.position.set(camX, camY, camZ);
          camera.lookAt(tgt.wx, lookY, tgt.wz);
        }
      } else if (p.cameraPresetLabel === 'nature') {
        // 1 -> Зажжённый сигнальный маяк Качкалык; 2 -> Пенистые пороги Андийского Койсу (вдоль русла каньона);
        // 3 -> Буково-сосновый лес, подлесок и скальные утёсы; 4 -> Костёр Анди; 5 -> Пороги Аргуна; 6 -> Вежа Салатау
        const beacons = p.signalBeacons || [];
        const litBeacons = beacons.filter((b) => b.isLit);
        const unlitBeacons = beacons.filter((b) => !b.isLit);
        const firstLit = litBeacons[0] || beacons[0] || { id: 'beacon_kachkalyk', x: 192, y: 118 };
        const secondLit = litBeacons[1] || beacons[1] || { id: 'beacon_andi_gates', x: 315, y: 212 };
        const unlitOne = unlitBeacons[0] || beacons[2] || { id: 'beacon_salatau', x: 388, y: 124 };
        const posOfBeacon = (b) => resolvedBeaconPositions.get(b.id) || mapToWorld(b.x, b.y);

        const bridgeTargets = (p.riverBridges || []).map((br) => {
          const sn = snapBridgeToRiverChannel(br.x, br.y, br.riverId, br.id);
          return {
            wx: sn.wx,
            wy: sn.waterY,
            wz: sn.wz,
            lookH: 0.42,
            baseYaw: sn.bridgeYaw + 0.62
          };
        });
        const natureTargets = [
          { ...posOfBeacon(firstLit), lookH: 0.96, baseYaw: 0 },
          { ...andiKoisuRapidSpot, lookH: 0.14, baseYaw: andiKoisuRapidSpot.flowYaw || 2.76 },
          { ...forestCliffShowcaseSpot, lookH: 0.42, baseYaw: 0 },
          { ...posOfBeacon(secondLit), lookH: 0.96, baseYaw: 0 },
          { ...argunRapidSpot, lookH: 0.14, baseYaw: argunRapidSpot.flowYaw || 3.28 },
          { ...posOfBeacon(unlitOne), lookH: 0.88, baseYaw: 0 },
          ...bridgeTargets
        ];
        const tgt = natureTargets[(trackedNatureIdxRef.current || 0) % natureTargets.length];
        const lookY = tgt.wy + tgt.lookH;
        const worldYaw = (tgt.baseYaw || 0) + o.yaw;
        const camX = tgt.wx + Math.sin(worldYaw) * horiz;
        const camZ = tgt.wz + Math.cos(worldYaw) * horiz;
        const camGround = mapToWorld(
          Math.max(0, Math.min(700, camX * 10 + 350)),
          Math.max(0, Math.min(460, camZ * 10 + 230))
        ).wy;
        const camY = Math.max(camGround + 0.42, lookY + Math.sin(o.pitch) * o.radius);
        camera.position.set(camX, camY, camZ);
        camera.lookAt(tgt.wx, lookY, tgt.wz);
      } else {
        const camX = o.targetX + Math.sin(o.yaw) * horiz;
        const camZ = o.targetZ + Math.cos(o.yaw) * horiz;
        const camGround = mapToWorld(
          Math.max(0, Math.min(700, camX * 10 + 350)),
          Math.max(0, Math.min(460, camZ * 10 + 230))
        ).wy;
        const camY = Math.max(camGround + 3.2, Math.sin(o.pitch) * o.radius);
        camera.position.set(camX, camY, camZ);
        camera.lookAt(o.targetX, 1.4, o.targetZ);
      }
      skyDome.position.copy(camera.position);

      updateSpatialBattleScape({
        enabled: Boolean(p.soundEnabled),
        mode: 'strategic',
        camera,
        riverPoint: { x: 12.5, y: 1.4, z: 2.0 },
        weatherMode: effWeather
      });

      if (postFx) {
        postFx.update({
          elapsed,
          camera,
          sunDir: sunDirTmp,
          sunColor: sunLight.color,
          weatherMode: effWeather
        });
      }

      fpsGov.tick(dt);
      if (frameNum % 6 === 0) {
        domEl.dataset.camRadius = o.radius.toFixed(2);
        domEl.dataset.camYaw = o.yaw.toFixed(3);
      }

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

      // 9. Умная LOD-проекция тактических шильдиков без визуальной каши (каждые 3 кадра)
      if (frameNum % 3 === 0) {
        const allAnchors = [...staticLabels, ...dynamicLabels];
        if (allAnchors.length > 0) {
          const w = renderer.domElement.clientWidth || width;
          const h = renderer.domElement.clientHeight || height;
          const showAll = Boolean(p.showAllLabels3D);
          const maxPriority = showAll ? 3 : o.radius <= 31 ? 3 : o.radius <= 47 ? 2 : 1;

          const candidates = [];
          for (let i = 0; i < allAnchors.length; i++) {
            const lb = allAnchors[i];
            const prio = lb.priority || 2;
            if (prio > maxPriority) continue;
            projVec.set(lb.wx, lb.wy, lb.wz).project(camera);
            if (projVec.z < 1 && projVec.x > -0.95 && projVec.x < 0.95 && projVec.y > -0.92 && projVec.y < 0.92) {
              candidates.push({
                ...lb,
                prio,
                depth: projVec.z,
                sx: Math.round((projVec.x * 0.5 + 0.5) * w),
                sy: Math.round((-projVec.y * 0.5 + 0.5) * h)
              });
            }
          }

          candidates.sort((a, b) => a.prio - b.prio || a.depth - b.depth);
          const nextLabels = [];
          for (let i = 0; i < candidates.length; i++) {
            const cand = candidates[i];
            if (!showAll && cand.prio > 1) {
              const collides = nextLabels.some(
                (placed) => Math.abs(placed.sx - cand.sx) < 64 && Math.abs(placed.sy - cand.sy) < 21
              );
              if (collides) continue;
            }
            nextLabels.push(cand);
          }
          setHudLabels(nextLabels);
        }
      }
    };
    animate();

    return () => {
      disposed = true;
      suspendSpatialBattleAudio();
      cancelAnimationFrame(rafId);
      fpsGovRef.current = null;
      touchControls.dispose();
      domEl.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      domEl.removeEventListener('wheel', onWheel);
      domEl.removeEventListener('contextmenu', onContextMenu);
      window.removeEventListener('resize', onResize);
      if (resizeObs) resizeObs.disconnect();
      clearStaticDisposables();
      staticLayer.children.forEach((ch) => {
        if (ch.isInstancedMesh) ch.dispose();
        disposePhotorealFortressInstance(ch);
        disposePhotorealNatureInstance(ch);
      });
      eaglesGroup.children.forEach((eg) => disposePhotorealEagleInstance(eg));
      smokeSys.dispose();
      powderSmokeTex.dispose();
      precipSys.dispose();
      activeTableShells.forEach((sh) => sh.mat.dispose());
      unitRegistry.forEach((ent) => {
        ent.ringMat.dispose();
        if (ent.isPhotorealCavalry) {
          disposePhotorealCavalryInstance(ent.inner);
        }
        if (ent.isPhotorealCorps) {
          disposePhotorealCorpsInstance(ent.inner);
        }
      });
      columnRegistry.forEach((cent) => {
        disposePhotorealCorpsInstance(cent.colRoot);
        disposePhotorealCorpsInstance(cent.convoyRoot);
        cent.supplyLine.geometry.dispose();
        cent.lineMat.dispose();
      });
      activeRouteLine.geometry.dispose();
      activeRouteLine.material.dispose();
      routeTargetBeaconGeo.dispose();
      routeTargetBeaconMat.dispose();
      riverGeos.forEach((rg) => rg.dispose());
      riverMat.dispose();
      bumpTex.dispose();
      terrainMat.dispose();
      deskSurroundGeo.dispose();
      deskSurroundMat.dispose();
      if (gtaoPass) gtaoPass.dispose();
      if (postFx) postFx.dispose();
      if (composer) composer.dispose();
      pbrPack.dispose();
      skyGeo.dispose();
      skyMat.dispose();
      ridgeGeo.dispose();
      ridgeMat.dispose();
      mistTex.dispose();
      mistGeo.dispose();
      mistMat.dispose();
      trunkInstanced.dispose();
      pineTrunkInstanced.dispose();
      beechCrownInstanced.dispose();
      pineInstanced.dispose();
      undergrowthInstanced.dispose();
      boulderInstanced.dispose();
      riverBoulderInstanced.dispose();
      riverFoamWakeInstanced.dispose();
      trunkGeo.dispose();
      pineTrunkGeo.dispose();
      barkMats.dispose();
      crownGeo.dispose();
      beechAtlasTex.dispose();
      crownMat.dispose();
      pineGeo.dispose();
      pineAtlasTex.dispose();
      pineMat.dispose();
      undergrowthGeo.dispose();
      fernAtlasTex.dispose();
      undergrowthMat.dispose();
      boulderGeo.dispose();
      boulderMat.dispose();
      riverBoulderGeo.dispose();
      riverBoulderMat.dispose();
      riverFoamWakeGeo.dispose();
      riverFoamWakeMat.dispose();
      sharedSaklyaWinMat.dispose();
      sharedCapitalHaloGeo.dispose();
      sharedNaibHaloGeo.dispose();
      sharedBeaconHaloGeo.dispose();
      sharedObeliskGeo.dispose();
      sharedUnitRingGeo.dispose();
      sharedShellGeo.dispose();
      sharedLegendOuterRingGeo.dispose();
      sharedLegendStarGeo.dispose();
      sharedLegendCrownGeo.dispose();
      sharedLegendGoldMat.dispose();
      sharedLegendAuraMat.dispose();
      terrainGeo.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative isolate w-full h-[380px] sm:h-[540px] lg:h-[600px] max-h-[72dvh] lg:max-h-none rounded-xl overflow-hidden border-2 border-amber-500/60 bg-[#1a2b3d] shadow-2xl select-none">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Проекционные тактические шильдики поверх 3D-фигурок .glb с автоматическим анти-наложением (LOD) */}
      <div className="absolute inset-0 z-[5] pointer-events-none overflow-hidden">
        {hudLabels.map((lb) => (
          <button
            key={lb.key}
            type="button"
            onClick={lb.onClick}
            style={{ transform: `translate(${lb.sx}px, ${lb.sy}px) translate(-50%, -100%)` }}
            className={`pointer-events-auto absolute left-0 top-0 px-1.5 py-0.5 rounded text-[9.5px] font-serif font-bold tracking-tight whitespace-nowrap border shadow-md backdrop-blur-[2px] cursor-pointer transition ${
              lb.tone === 'siege'
                ? 'bg-red-950/90 border-red-400 text-red-100'
                : lb.tone === 'legend_hero'
                ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-stone-950 border-amber-100 ring-1 ring-amber-300 font-extrabold shadow-lg'
                : lb.tone === 'selected'
                ? 'bg-amber-500 text-stone-950 border-amber-200'
                : lb.tone === 'enemy'
                ? 'bg-rose-950/90 border-rose-400/80 text-rose-100'
                : lb.tone === 'convoy'
                ? 'bg-amber-950/90 border-amber-400/80 text-amber-200'
                : lb.tone === 'unit_sel'
                ? 'bg-emerald-500 text-stone-950 border-emerald-200'
                : lb.tone === 'unit'
                ? 'bg-emerald-950/90 border-emerald-400/75 text-emerald-100'
                : 'bg-stone-950/85 border-amber-500/45 text-amber-100'
            }`}
          >
            {t(lb.textRu, lb.textEn)}
          </button>
        ))}
      </div>

      {/* Верхняя плашка управления ракурсами реальной 3D-камеры Three.js + переключатель LOD и залп батарей */}
      <div className="absolute top-2 left-2 right-2 z-10 flex flex-wrap items-center justify-between gap-1.5 pointer-events-none">
        <div className="hud-mobile-scroll pointer-events-auto max-w-full overflow-x-auto flex items-center flex-nowrap lg:flex-wrap gap-1 bg-[#120e0a]/90 border border-amber-500/50 rounded-lg px-2 py-1 text-[10.5px] sm:text-[11px] backdrop-blur-sm">
          <span className="text-amber-300 font-serif font-extrabold mr-1 shrink-0 hidden sm:inline">
            🏔️ {t('3D-Диорама Кавказа:', '3D Caucasus Diorama:')}
          </span>
          {[
            ['theatre', t('Обзор Кавказа', 'Caucasus Overview')],
            ['heroes', t('Герои и Столица', 'Heroes & Capital')],
            ['dargo', t('Леса Ичкерии', 'Ichkeria Forests')],
            ['avaria', t('Плато Аварии', 'Avaria Plateau')],
            ['cordon', t('Кордон Терека', 'Terek Cordon')],
            ['riders', t('🐎 Всадники', '🐎 Riders')],
            ['columns', t('⚔️ Колонны и Орудия', '⚔️ Columns & Guns')],
            ['fortresses', t('🏰 Крепости и Аулы', '🏰 Fortresses & Auls')],
            ['nature', t('🌲 Природа и Реки', '🌲 Nature & Rivers')],
            ['eagles', t('🦅 Беркуты', '🦅 Eagles')]
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => applyCameraPreset(id)}
              className={`shrink-0 px-2 py-0.5 rounded font-serif font-bold cursor-pointer transition ${
                cameraPresetLabel === id
                  ? 'bg-amber-500 text-stone-950'
                  : 'bg-stone-900/90 hover:bg-stone-800 text-amber-200 border border-amber-500/30'
              }`}
            >
              {label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setShowAllLabels3D((prev) => !prev)}
            className={`shrink-0 px-2 py-0.5 rounded font-serif font-bold cursor-pointer transition border ${
              showAllLabels3D
                ? 'bg-sky-500 text-stone-950 border-sky-300'
                : 'bg-stone-900/90 hover:bg-stone-800 text-sky-200 border-sky-500/35'
            }`}
            title={t(
              'Авто-LOD показывает главные цели на общем плане и плавно раскрывает мосты и костры при приближении',
              'Auto-LOD keeps key targets clean at wide view and reveals bridges & beacons as you zoom in'
            )}
          >
            {showAllLabels3D ? t('🏷️ Все ярлыки', '🏷️ All Labels') : t('🏷️ Умный LOD', '🏷️ Smart LOD')}
          </button>
          {handleCycleTimeOfDay && (
            <button
              type="button"
              onClick={handleCycleTimeOfDay}
              className="shrink-0 px-2 py-0.5 rounded font-serif font-bold cursor-pointer transition border bg-stone-900/90 hover:bg-stone-800 text-amber-200 border-amber-500/40"
              title={t('Переключить освещение Кавказа: День / Закат / Ночь', 'Cycle Caucasus lighting: Day / Sunset / Night')}
            >
              {dioramaTimeOfDay === 'sunset'
                ? t('🌅 Закат', '🌅 Sunset')
                : dioramaTimeOfDay === 'night'
                ? t('🌙 Ночь', '🌙 Night')
                : t('☀️ День', '☀️ Day')}
            </button>
          )}
          {handleCycleSeason3D && (
            <button
              type="button"
              onClick={handleCycleSeason3D}
              className={`shrink-0 px-2 py-0.5 rounded font-serif font-bold cursor-pointer transition border ${
                seasonPhase === 'winter'
                  ? 'bg-sky-200 text-slate-950 border-white shadow'
                  : 'bg-stone-900/90 hover:bg-stone-800 text-emerald-200 border-emerald-500/40'
              }`}
              title={t(
                'Переключить сезонный покров 3D-рельефа: Летняя зелень / Снега Кавказа',
                'Toggle 3D relief season: Summer foliage / Caucasian Winter snow'
              )}
            >
              {seasonPhase === 'winter'
                ? t('❄️ Зима', '❄️ Winter')
                : seasonPhase === 'autumn'
                ? t('🍂 Осень', '🍂 Autumn')
                : t('🌿 Лето', '🌿 Summer')}
            </button>
          )}
          <button
            type="button"
            onClick={() =>
              setWeatherMode3D((prev) =>
                prev === 'auto' ? 'rain' : prev === 'rain' ? 'snow' : prev === 'snow' ? 'clear' : 'auto'
              )
            }
            className={`shrink-0 px-2 py-0.5 rounded font-serif font-bold cursor-pointer transition border ${
              weatherMode3D === 'rain'
                ? 'bg-sky-700 text-sky-100 border-sky-400'
                : weatherMode3D === 'snow'
                ? 'bg-slate-200 text-slate-950 border-white'
                : 'bg-stone-900/90 hover:bg-stone-800 text-sky-200 border-sky-500/35'
            }`}
            title={t(
              'Погода Кавказа: Авто / Ливень / Снегопад / Ясно',
              'Caucasus weather: Auto / Rain / Snowfall / Clear'
            )}
          >
            {weatherMode3D === 'rain'
              ? t('🌧️ Ливень', '🌧️ Rain')
              : weatherMode3D === 'snow'
              ? t('🌨️ Метель', '🌨️ Snow')
              : weatherMode3D === 'clear'
              ? t('🌤️ Ясно', '🌤️ Clear')
              : t('🌦️ Авто', '🌦️ Auto')}
          </button>
          <button
            type="button"
            onClick={handleCyclePerfMode}
            className={`shrink-0 px-2 py-0.5 rounded font-serif font-bold cursor-pointer transition border ${
              perfMode3D === 'ultra'
                ? 'bg-amber-400 text-stone-950 border-amber-200'
                : perfMode3D === 'perf60'
                ? 'bg-emerald-500 text-stone-950 border-emerald-200'
                : 'bg-stone-900/90 hover:bg-stone-800 text-emerald-200 border-emerald-500/35'
            }`}
            title={t(
              'Профиль 3D-графики: Авто 60 FPS / Турбо 60 FPS / Ультра PBR+GTAO',
              '3D GPU profile: Auto 60 FPS / Turbo 60 FPS / Ultra PBR+GTAO'
            )}
          >
            {perfMode3D === 'ultra'
              ? t('💎 Ультра', '💎 Ultra')
              : perfMode3D === 'perf60'
              ? t('⚡ 60 FPS', '⚡ 60 FPS')
              : t('⚡ Авто', '⚡ Auto')}
          </button>
        </div>

        <div className="pointer-events-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={triggerManualBatterySalvo}
            className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-stone-950 font-serif font-extrabold px-2.5 py-1 rounded-lg text-[10.5px] sm:text-[11px] shadow-lg cursor-pointer transition"
          >
            💥 {t('Залп батарей (3D)', '3D Battery Salvo')}
          </button>
          {isTouchUi ? (
            <div className="hidden md:block bg-[#120e0a]/85 border border-emerald-500/45 rounded-lg px-2 py-1 text-[10px] text-emerald-200 font-serif">
              {t(
                '👆 1 палец — обзор • 2 пальца — зум и сдвиг • Тап — марш',
                '👆 1 finger — orbit • 2 fingers — pinch & pan • Tap — march'
              )}
            </div>
          ) : (
            <div className="hidden xl:block bg-[#120e0a]/85 border border-emerald-500/45 rounded-lg px-2.5 py-1 text-[10px] text-emerald-200 font-serif">
              {t(
                'ЛКМ по горе — марш • Зажать ЛКМ — вращение • ПКМ / Shift — сдвиг • Колесо — масштаб',
                'LMB on ridge — march • Drag LMB — orbit • RMB / Shift — pan • Wheel — zoom'
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
