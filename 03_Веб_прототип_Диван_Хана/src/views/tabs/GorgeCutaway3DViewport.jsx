// Аппаратное 3D-поле сражения в горном ущелье Кавказа (Three.js WebGL2 + NASA SRTM 176x176 + Triplanar PBR + Bloom):
// террасный каменный аул (16 саклей, брустверы, крытый спуск к воде), осадные редуты и зигзагообразные апроши РИ с турами,
// сомкнутые коробки пехоты и стрелковые цепи мюридов, геологический срез Д. А. Милютина, живая баллистика и ночной бой.
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
  createPhotorealImperialColumnInstance,
  createPhotorealSupplyWagonInstance,
  createPhotorealUnicornCannonInstance,
  disposePhotorealCorpsInstance
} from '../shared/caucasusPhotorealColumnsArtillery3D.js';
import {
  createPhotorealStoneBridgeInstance,
  createPhotorealVainakhTowerInstance,
  disposePhotorealFortressInstance
} from '../shared/caucasusPhotorealFortresses3D.js';
import {
  createBarkPbrMaterials,
  createPhotorealSignalBeaconInstance,
  createStratifiedCliffRockGeometry,
  disposePhotorealNatureInstance,
  updatePhotorealSignalBeacons
} from '../shared/caucasusPhotorealNature3D.js';
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
  createRidgeTentGeometry,
  createUndergrowthBushGeometry,
  createWickerGabionTexture,
  createWovenGabionGeometry
} from '../shared/caucasusFoliageAndUnits3D.js';
import {
  applyBattleTerrainPBRShader,
  buildHighResBattleHeightfield,
  createCanyonRiverMaterial,
  createGeologicalStrataCanvas,
  createGorgeStrataBumpCanvas,
  createPhotorealSkyDome,
  createSeamlessOuterValley
} from './tacticalBattle3DShaders.js';

export default function GorgeCutaway3DViewport({
  cam3D,
  setCam3D,
  selected3DTerrainId = 'salty_1847',
  mortarAngle3D = 58,
  unicornAngle3D = 15,
  siegeState,
  soundEnabled = true,
  stats3D,
  deployedSector = 'blindage',
  t = (ru) => ru,
  fallbackCanvasRef,
  onPointerDownFallback,
  onPointerMoveFallback,
  onPointerUpFallback
}) {
  const mountRef = useRef(null);
  const [webglReady, setWebglReady] = useState(true);
  const [battleTimeOfDay, setBattleTimeOfDay] = useState('day');
  const [battleWeather, setBattleWeather] = useState('clear');
  const [spatialAudioOn, setSpatialAudioOn] = useState(true);
  const [activePreset, setActivePreset] = useState('panorama');
  const [tallCinema, setTallCinema] = useState(false);
  const panOffsetRef = useRef({ x: -0.4, z: 0.0 });

  const latestRef = useRef({
    cam3D,
    mortarAngle3D,
    unicornAngle3D,
    siegeState,
    soundEnabled,
    spatialAudioOn,
    stats3D,
    deployedSector,
    battleTimeOfDay,
    battleWeather,
    activePreset
  });
  useEffect(() => {
    latestRef.current = {
      cam3D,
      mortarAngle3D,
      unicornAngle3D,
      siegeState,
      soundEnabled,
      spatialAudioOn,
      stats3D,
      deployedSector,
      battleTimeOfDay,
      battleWeather,
      activePreset
    };
  }, [cam3D, mortarAngle3D, unicornAngle3D, siegeState, soundEnabled, spatialAudioOn, stats3D, deployedSector, battleTimeOfDay, battleWeather, activePreset]);

  const applyTacticalPreset = (presetId) => {
    setActivePreset(presetId);
    if (!setCam3D) return;
    if (presetId === 'panorama') {
      panOffsetRef.current = { x: -0.4, z: 0.0 };
      setCam3D((prev) => ({ ...prev, yaw: -0.54, pitch: 0.44, zoom: 1.18, cutawayRatio: 0.98, autoRotate: false }));
    } else if (presetId === 'aul') {
      panOffsetRef.current = { x: -5.2, z: -0.4 };
      setCam3D((prev) => ({ ...prev, yaw: -0.35, pitch: 0.36, zoom: 1.55, cutawayRatio: 0.98, autoRotate: false }));
    } else if (presetId === 'redoubt') {
      panOffsetRef.current = { x: 8.2, z: 0.2 };
      setCam3D((prev) => ({ ...prev, yaw: 0.58, pitch: 0.48, zoom: 1.95, cutawayRatio: 0.98, autoRotate: false }));
    } else if (presetId === 'cutaway') {
      panOffsetRef.current = { x: -0.8, z: 0.8 };
      setCam3D((prev) => ({ ...prev, yaw: 0.0, pitch: 0.18, zoom: 1.24, cutawayRatio: 0.56, autoRotate: false }));
    } else if (presetId === 'bridge') {
      panOffsetRef.current = { x: 0.95, z: 2.3 };
      setCam3D((prev) => ({ ...prev, yaw: 0.06, pitch: 0.44, zoom: 2.85, cutawayRatio: 0.98, autoRotate: false }));
    } else if (presetId === 'eagle') {
      panOffsetRef.current = { x: -2.0, z: -0.6 };
      setCam3D((prev) => ({ ...prev, yaw: 0.62, pitch: 0.24, zoom: 1.42, cutawayRatio: 0.98, autoRotate: false }));
      playSpatialBattleSound('eagle_cry_3d', { x: -2.0, y: 9.2, z: -0.6 }, {
        enabled: Boolean(latestRef.current.soundEnabled && latestRef.current.spatialAudioOn),
        environment: 'gorge'
      });
    }
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return undefined;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: 'high-performance'
      });
    } catch {
      setWebglReady(false);
      return undefined;
    }

    const devProfile = detectMobileDeviceProfile();
    const width = container.clientWidth || 860;
    const height = container.clientHeight || 500;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, devProfile.maxDpr));
    renderer.setSize(width, height);
    renderer.localClippingEnabled = true;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#86a7c0');
    scene.fog = new THREE.FogExp2('#86a7c0', 0.0085);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.35, 360);

    // Пакет реальной CC0-фотограмметрии (скалы, дёрн, грязь, каменная кладка) + PMREM небесный IBL
    let skyUniformsRef = null;
    let riverMatRef = null;
    const pbrPack = loadCaucasusPbrPack(renderer, {
      onSkyReady: (pack) => {
        if (scene) {
          scene.environment = pack.envMap;
        }
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

    // Пост-обработка: контактные тени GTAO + HDR Bloom + SMAA + ACES Output + CinematicGrade
    let composer = null;
    let gtaoPass = null;
    let bloomPass = null;
    let postFx = null;
    try {
      composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      gtaoPass = attachCleanGtaoPass({
        scene,
        camera,
        composer,
        width,
        height,
        clipBox: new THREE.Box3(new THREE.Vector3(-22, -3, -22), new THREE.Vector3(22, 18, 22)),
        blendIntensity: 0.78,
        radius: 0.72
      });
      bloomPass = new UnrealBloomPass(
        new THREE.Vector2(Math.max(256, Math.round(width / 2)), Math.max(256, Math.round(height / 2))),
        0.3,
        0.52,
        0.9
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

    // Купол реального облачного горного неба CC0 Pure Sky с поддержкой Дня / Заката / Ночи
    const { skyMesh: gorgeSkyDome, skyUniforms } = createPhotorealSkyDome(pbrPack);
    skyUniformsRef = skyUniforms;
    if (pbrPack.skyEquirectTex?.image?.complete && pbrPack.skyEquirectTex?.image?.naturalWidth > 0) {
      skyUniforms.uHasSkyTex.value = 1.0;
    }
    scene.add(gorgeSkyDome);

    // 360° цепь далёких вершин Большого Кавказа, растворяющаяся в атмосферной дымке
    const gorgeRidgeGeo = new THREE.CylinderGeometry(114, 120, 28, 112, 6, true);
    const rPos = gorgeRidgeGeo.attributes.position;
    const rColors = new Float32Array(rPos.count * 3);
    const rCol = new THREE.Color();
    for (let i = 0; i < rPos.count; i++) {
      const rx = rPos.getX(i);
      const ry = rPos.getY(i);
      const rz = rPos.getZ(i);
      const ang = Math.atan2(rz, rx);
      const normH = (ry + 14) / 28;
      if (normH > 0.08) {
        const peakMod =
          Math.sin(ang * 7.0) * 3.6 +
          Math.cos(ang * 13.0 + 0.9) * 2.3 +
          Math.sin(ang * 25.0) * 1.25;
        rPos.setY(i, -14 + normH * (16.2 + peakMod));
      }
      if (normH > 0.72) {
        rCol.set('#d5e2ee');
      } else if (normH > 0.42) {
        rCol.set('#5e6f82');
      } else {
        rCol.set('#3e4e5c');
      }
      rColors[i * 3] = rCol.r;
      rColors[i * 3 + 1] = rCol.g;
      rColors[i * 3 + 2] = rCol.b;
    }
    gorgeRidgeGeo.setAttribute('color', new THREE.BufferAttribute(rColors, 3));
    gorgeRidgeGeo.computeVertexNormals();
    const gorgeRidgeMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.96,
      metalness: 0.0,
      side: THREE.DoubleSide,
      fog: true
    });
    const gorgeRidgeMesh = new THREE.Mesh(gorgeRidgeGeo, gorgeRidgeMat);
    gorgeRidgeMesh.position.y = 4.6;
    scene.add(gorgeRidgeMesh);

    // Постамент штабного зала из кавказского ореха с чеканным латунным кантом
    const dioramaSurroundGeo = new THREE.PlaneGeometry(260, 260);
    dioramaSurroundGeo.rotateX(-Math.PI / 2);
    const dioramaSurroundMat = new THREE.MeshStandardMaterial({
      color: '#120e0b',
      roughness: 0.92,
      metalness: 0.04
    });
    const dioramaSurroundMesh = new THREE.Mesh(dioramaSurroundGeo, dioramaSurroundMat);
    dioramaSurroundMesh.position.y = -0.84;
    dioramaSurroundMesh.receiveShadow = true;
    scene.add(dioramaSurroundMesh);

    const plinthGeo = new THREE.BoxGeometry(36.0, 0.84, 36.0);
    const plinthMat = new THREE.MeshStandardMaterial({
      color: '#2a170c',
      roughness: 0.54,
      metalness: 0.08
    });
    const plinthMesh = new THREE.Mesh(plinthGeo, plinthMat);
    plinthMesh.position.y = -0.41;
    plinthMesh.receiveShadow = true;
    plinthMesh.castShadow = true;
    scene.add(plinthMesh);

    const brassTrimGeo = new THREE.BoxGeometry(36.34, 0.15, 36.34);
    const brassTrimMat = new THREE.MeshStandardMaterial({
      color: '#d97706',
      roughness: 0.26,
      metalness: 0.82
    });
    const brassTrimMesh = new THREE.Mesh(brassTrimGeo, brassTrimMat);
    brassTrimMesh.position.y = -0.05;
    scene.add(brassTrimMesh);

    // Освещение поля боя
    const hemi = new THREE.HemisphereLight('#dceeff', '#3a2818', 0.92);
    scene.add(hemi);

    const sun = new THREE.DirectionalLight('#fff2d2', 2.35);
    sun.position.set(19, 32, 15);
    sun.castShadow = true;
    sun.shadow.mapSize.set(devProfile.shadowMapSize, devProfile.shadowMapSize);
    sun.shadow.bias = -0.00035;
    sun.shadow.normalBias = 0.02;
    sun.shadow.camera.left = -22;
    sun.shadow.camera.right = 22;
    sun.shadow.camera.top = 22;
    sun.shadow.camera.bottom = -22;
    scene.add(sun);

    const aulWarmGlow = new THREE.PointLight('#fb923c', 0.9, 14, 1.5);
    const redoubtBrazierLight = new THREE.PointLight('#f97316', 1.1, 14, 1.5);
    const muzzleFlashLight = new THREE.PointLight('#fde047', 0, 24, 1.35);
    const impactBlastLight = new THREE.PointLight('#fb923c', 0, 28, 1.25);
    scene.add(aulWarmGlow, redoubtBrazierLight, muzzleFlashLight, impactBlastLight);

    // Плоскость геодезического разреза Д. А. Милютина
    const clipPlane = new THREE.Plane(new THREE.Vector3(0, 0, -1), 5.6);

    // 1. ВЫСОКОДЕТАЛЬНЫЙ РЕЛЬЕФ УЩЕЛЬЯ NASA SRTM (176x176 вершин + Triplanar PBR Shader)
    const {
      gridSize,
      heights,
      heightScale,
      isForestDefile,
      sampleHeightAt
    } = buildHighResBattleHeightfield(selected3DTerrainId, 176);

    const geo = new THREE.PlaneGeometry(34, 34, gridSize - 1, gridSize - 1);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      pos.setY(i, heights[i] ?? 1.5);
    }
    geo.computeVertexNormals();

    const gorgeBumpTex = new THREE.CanvasTexture(createGorgeStrataBumpCanvas());
    gorgeBumpTex.wrapS = THREE.RepeatWrapping;
    gorgeBumpTex.wrapT = THREE.RepeatWrapping;
    gorgeBumpTex.repeat.set(7, 7);

    const terrainMat = applyBattleTerrainPBRShader(
      new THREE.MeshStandardMaterial({
        color: '#ffffff',
        roughness: 0.88,
        metalness: 0.02,
        clippingPlanes: [clipPlane],
        side: THREE.DoubleSide
      }),
      { heightScale, isForest: isForestDefile, pbrPack }
    );
    const terrainMesh = new THREE.Mesh(geo, terrainMat);
    terrainMesh.castShadow = true;
    terrainMesh.receiveShadow = true;
    scene.add(terrainMesh);

    // Бесшовная внешняя горная долина Кавказа (скрывает обрыв карты и чёрный пол в режиме Панорамы боя)
    const outerValleyMesh = createSeamlessOuterValley({
      innerHalfW: 17,
      innerHalfD: 17,
      sampleEdgeHeight: sampleHeightAt,
      isForest: isForestDefile,
      pbrPack
    });
    scene.add(outerValleyMesh);

    // 2. ОБЪЁМНАЯ ГОРНАЯ РЕКА В КАНЬОНЕ (преломление дна, Бера–Ламберт и V-буруны за мостом)
    const riverMat = createCanyonRiverMaterial([clipPlane], {
      pbrPack,
      isStream: false,
      bridgePos: new THREE.Vector2(0.85, 1.8)
    });
    riverMatRef = riverMat;
    if (pbrPack.skyEquirectTex?.image?.complete && pbrPack.skyEquirectTex?.image?.naturalWidth > 0) {
      riverMat.uniforms.uHasSky.value = 1.0;
    }
    const riverGeo = new THREE.PlaneGeometry(33.8, 33.8, 72, 72);
    const riverMesh = new THREE.Mesh(riverGeo, riverMat);
    riverMesh.rotation.x = -Math.PI / 2;
    riverMesh.position.y = 1.18;
    scene.add(riverMesh);

    // 3. ГУСТЫЕ КАВКАЗСКИЕ РОЩИ (двухъярусные кроны буков + высокогорные сосны + валуны осыпей)
    const beechPts = [];
    const pinePts = [];
    const boulderPts = [];
    const targetTrees = isForestDefile ? 210 : 88;
    for (let tIdx = 0; tIdx < targetTrees * 3 && beechPts.length + pinePts.length < targetTrees; tIdx++) {
      const tx = -16.0 + ((tIdx * 6.73) % 32.0);
      const tz = -16.0 + ((tIdx * 10.91 + Math.floor(tIdx / 7) * 3.7) % 32.0);
      // Оставляем чистым сектор прямой наводки между аулом (-5.5, 0) и редутом РИ (7.8, 0) и русло реки
      if (Math.abs(tz) < 3.5 && tx > -9.2 && tx < 11.2) continue;
      const riverAxis = 0.45 + Math.sin(tz * 0.22) * 1.05;
      if (!isForestDefile && Math.abs(tx - riverAxis) < 2.2) continue;
      const ty = sampleHeightAt(tx, tz);
      if (ty > 1.45 && ty < heightScale * 0.84) {
        const sc = 0.46 + (tIdx % 5) * 0.11;
        if (isForestDefile || (ty < heightScale * 0.56 && tIdx % 3 !== 0)) {
          beechPts.push({ tx, ty, tz, s: sc });
        } else {
          pinePts.push({ tx, ty, tz, s: sc * 1.05 });
        }
      }
    }
    for (let bIdx = 0; bIdx < 85; bIdx++) {
      const bx = -16.2 + ((bIdx * 5.37) % 32.4);
      const bz = -16.2 + ((bIdx * 8.83) % 32.4);
      const by = sampleHeightAt(bx, bz);
      if (by > 1.05 && by < heightScale * 0.78) {
        boulderPts.push({ bx, by, bz, s: 0.22 + (bIdx % 4) * 0.12, rot: bIdx * 1.3 });
      }
    }

    const beechAtlasTex = createBeechFoliageAtlasTexture();
    const pineAtlasTex = createConiferBoughAtlasTexture();
    const fernAtlasTex = createFernUndergrowthTexture();

    const trunkGeo = createRealisticTrunkGeometry({ isPine: false });
    const pineTrunkGeo = createRealisticTrunkGeometry({ isPine: true });
    const barkMats = createBarkPbrMaterials({ clippingPlanes: [clipPlane] });
    const beechCrownGeo = createRealisticBeechCanopyGeometry();
    const beechCrownMat = createFoliageCardMaterial({
      map: beechAtlasTex,
      clippingPlanes: [clipPlane],
      windStrength: 0.032,
      isPine: false
    });
    const pineGeo = createRealisticConiferGeometry();
    const pineMat = createFoliageCardMaterial({
      map: pineAtlasTex,
      clippingPlanes: [clipPlane],
      windStrength: 0.022,
      isPine: true
    });
    const bushGeo = createUndergrowthBushGeometry();
    const bushMat = createFoliageCardMaterial({
      map: fernAtlasTex,
      clippingPlanes: [clipPlane],
      windStrength: 0.024,
      isPine: false
    });
    const rockGeo = createStratifiedCliffRockGeometry();
    const rockMat = new THREE.MeshStandardMaterial({
      color: '#c2b9aa',
      map: pbrPack.rockDiff,
      normalMap: pbrPack.rockNor,
      normalScale: new THREE.Vector2(0.92, 0.92),
      roughnessMap: pbrPack.rockArm,
      vertexColors: true,
      roughness: 0.92,
      metalness: 0.02,
      clippingPlanes: [clipPlane]
    });

    const beechTrunks = new THREE.InstancedMesh(trunkGeo, barkMats.beechBarkMat, Math.max(1, beechPts.length));
    const beechCrowns = new THREE.InstancedMesh(beechCrownGeo, beechCrownMat, Math.max(1, beechPts.length));
    const pineTrunksInst = new THREE.InstancedMesh(pineTrunkGeo, barkMats.pineBarkMat, Math.max(1, pinePts.length));
    const pinesInst = new THREE.InstancedMesh(pineGeo, pineMat, Math.max(1, pinePts.length));
    const rocksInst = new THREE.InstancedMesh(rockGeo, rockMat, Math.max(1, boulderPts.length));
    beechTrunks.castShadow = true;
    beechCrowns.castShadow = true;
    beechCrowns.receiveShadow = true;
    pineTrunksInst.castShadow = true;
    pinesInst.castShadow = true;
    pinesInst.receiveShadow = true;
    rocksInst.castShadow = true;
    rocksInst.receiveShadow = true;

    const dummy = new THREE.Object3D();
    const foliagePalette = ['#4b7a38', '#568540', '#3f6d31', '#618f43', '#4e7c3e'];
    const pinePalette = ['#356647', '#407452', '#2d583d', '#487a58'];
    const tmpCol = new THREE.Color();
    beechPts.forEach((tp, idx) => {
      dummy.position.set(tp.tx, tp.ty - 0.04, tp.tz);
      dummy.scale.setScalar(tp.s * 0.86);
      dummy.rotation.set((idx % 3 - 1) * 0.04, idx * 1.1, 0);
      dummy.updateMatrix();
      beechTrunks.setMatrixAt(idx, dummy.matrix);
      beechCrowns.setMatrixAt(idx, dummy.matrix);
      tmpCol.set(foliagePalette[idx % foliagePalette.length]);
      beechCrowns.setColorAt(idx, tmpCol);
    });
    if (beechCrowns.instanceColor) beechCrowns.instanceColor.needsUpdate = true;

    pinePts.forEach((pp, idx) => {
      dummy.position.set(pp.tx, pp.ty - 0.04, pp.tz);
      dummy.scale.setScalar(pp.s * 0.92);
      dummy.rotation.set(0, idx * 0.9, 0);
      dummy.updateMatrix();
      pineTrunksInst.setMatrixAt(idx, dummy.matrix);
      pinesInst.setMatrixAt(idx, dummy.matrix);
      tmpCol.set(pinePalette[idx % pinePalette.length]);
      pinesInst.setColorAt(idx, tmpCol);
    });
    if (pinesInst.instanceColor) pinesInst.instanceColor.needsUpdate = true;

    // 95 кустов альпийского папоротника и кустарника у скал, речных берегов и троп
    const bushPts = [];
    for (let kIdx = 0; kIdx < 95; kIdx++) {
      const kx = -15.5 + ((kIdx * 4.87 + 1.3) % 31.0);
      const kz = -15.5 + ((kIdx * 9.31 + 2.7) % 31.0);
      const ky = sampleHeightAt(kx, kz);
      if (ky > 1.2 && ky < heightScale * 0.72) {
        bushPts.push({ kx, ky, kz, s: 0.42 + (kIdx % 4) * 0.14 });
      }
    }
    const bushInst = new THREE.InstancedMesh(bushGeo, bushMat, Math.max(1, bushPts.length));
    bushPts.forEach((bp, idx) => {
      dummy.position.set(bp.kx, bp.ky - 0.02, bp.kz);
      dummy.scale.setScalar(bp.s);
      dummy.rotation.set(0, idx * 1.37, 0);
      dummy.updateMatrix();
      bushInst.setMatrixAt(idx, dummy.matrix);
      tmpCol.set(foliagePalette[(idx + 2) % foliagePalette.length]);
      bushInst.setColorAt(idx, tmpCol);
    });
    if (bushInst.instanceColor) bushInst.instanceColor.needsUpdate = true;

    boulderPts.forEach((bp, idx) => {
      dummy.position.set(bp.bx, bp.by - 0.14 * bp.s, bp.bz);
      dummy.scale.set(bp.s * 1.45, bp.s * 1.05, bp.s * 1.15);
      dummy.rotation.set(Math.sin(bp.rot) * 0.14, bp.rot, Math.cos(bp.rot) * 0.12);
      dummy.updateMatrix();
      rocksInst.setMatrixAt(idx, dummy.matrix);
    });
    scene.add(beechTrunks, beechCrowns, pineTrunksInst, pinesInst, bushInst, rocksInst);

    // 140 фоновых деревьев на внешних хребтах Кавказа (скрываются в режиме Среза сапы)
    const outerTreesGroup = new THREE.Group();
    const outerPosAttr = outerValleyMesh.geometry.attributes.position;
    const outerTreeCands = [];
    for (let i = 0; i < outerPosAttr.count; i++) {
      const ox = outerPosAttr.getX(i);
      const oy = outerPosAttr.getY(i);
      const oz = outerPosAttr.getZ(i);
      const edgeD = Math.hypot(Math.max(0, Math.abs(ox) - 17), Math.max(0, Math.abs(oz) - 17));
      if (edgeD >= 2.2 && edgeD <= 34.0 && oy > 0.7) {
        outerTreeCands.push({ x: ox, y: oy, z: oz });
      }
    }
    const outerTrunkMat = new THREE.MeshStandardMaterial({ color: '#453226', roughness: 0.94 });
    const outerCrownMat = createFoliageCardMaterial({
      map: beechAtlasTex,
      windStrength: 0.02,
      isPine: false
    });
    if (outerTreeCands.length > 0) {
      const distCnt = Math.min(140, outerTreeCands.length);
      const oTrunks = new THREE.InstancedMesh(trunkGeo, outerTrunkMat, distCnt);
      const oCrowns = new THREE.InstancedMesh(beechCrownGeo, outerCrownMat, distCnt);
      for (let dIdx = 0; dIdx < distCnt; dIdx++) {
        const cand = outerTreeCands[Math.floor(((dIdx * 0.6180339887) % 1) * outerTreeCands.length)];
        const sc = 0.85 + (dIdx % 5) * 0.14;
        dummy.position.set(cand.x, cand.y - 0.04, cand.z);
        dummy.scale.setScalar(sc);
        dummy.rotation.set(0, dIdx * 1.4, 0);
        dummy.updateMatrix();
        oTrunks.setMatrixAt(dIdx, dummy.matrix);
        oCrowns.setMatrixAt(dIdx, dummy.matrix);
        tmpCol.set(foliagePalette[dIdx % foliagePalette.length]);
        oCrowns.setColorAt(dIdx, tmpCol);
      }
      if (oCrowns.instanceColor) oCrowns.instanceColor.needsUpdate = true;
      outerTreesGroup.add(oTrunks, oCrowns);
    }
    scene.add(outerTreesGroup);

    // Опциональная геодезическая сетка SRTM
    const wireframeMat = new THREE.MeshBasicMaterial({
      color: '#fbbf24',
      wireframe: true,
      transparent: true,
      opacity: 0.2,
      clippingPlanes: [clipPlane]
    });
    const wireframeMesh = new THREE.Mesh(geo, wireframeMat);
    wireframeMesh.position.y = 0.03;
    wireframeMesh.visible = false;
    scene.add(wireframeMesh);

    // 4. ГЕОЛОГИЧЕСКАЯ СТЕНА РАЗРЕЗА МИЛЮТИНА С ОСАДОЧНЫМИ ПЛАСТАМИ ПОРОДЫ
    const strataSegs = 128;
    const strataTex = new THREE.CanvasTexture(createGeologicalStrataCanvas());
    strataTex.colorSpace = THREE.SRGBColorSpace;
    strataTex.wrapS = THREE.RepeatWrapping;
    strataTex.wrapT = THREE.ClampToEdgeWrapping;
    strataTex.repeat.set(2.5, 1);

    const strataGeo = new THREE.PlaneGeometry(34, 1, strataSegs, 1);
    const strataMat = new THREE.MeshStandardMaterial({
      map: strataTex,
      bumpMap: gorgeBumpTex,
      bumpScale: 0.28,
      roughness: 0.9,
      metalness: 0.04,
      side: THREE.DoubleSide
    });
    const cutawayWallMesh = new THREE.Mesh(strataGeo, strataMat);
    cutawayWallMesh.receiveShadow = true;
    scene.add(cutawayWallMesh);

    const buildSideWallGeo = (fixedAxis, fixedVal) => {
      const g = new THREE.PlaneGeometry(34, 1, strataSegs, 1);
      const p = g.attributes.position;
      const cols = strataSegs + 1;
      for (let idx = 0; idx < cols; idx++) {
        const coord = -17 + (idx / strataSegs) * 34;
        const wx = fixedAxis === 'x' ? fixedVal : coord;
        const wz = fixedAxis === 'z' ? fixedVal : coord;
        const topY = Math.max(0.12, sampleHeightAt(wx, wz));
        p.setXYZ(idx, wx, topY, wz);
        p.setXYZ(cols + idx, wx, 0.02, wz);
      }
      p.needsUpdate = true;
      g.computeVertexNormals();
      return g;
    };
    const sideStrataMat = new THREE.MeshStandardMaterial({
      map: strataTex,
      bumpMap: gorgeBumpTex,
      bumpScale: 0.24,
      roughness: 0.92,
      metalness: 0.04,
      side: THREE.DoubleSide,
      clippingPlanes: [clipPlane]
    });
    const leftWallMesh = new THREE.Mesh(buildSideWallGeo('x', -17), sideStrataMat);
    const rightWallMesh = new THREE.Mesh(buildSideWallGeo('x', 17), sideStrataMat);
    const backWallMesh = new THREE.Mesh(buildSideWallGeo('z', -17), sideStrataMat);
    scene.add(leftWallMesh, rightWallMesh, backWallMesh);

    const updateCutawayStrataWall = (clipZ) => {
      if (clipZ > 16.8) {
        cutawayWallMesh.visible = false;
        return;
      }
      cutawayWallMesh.visible = true;
      const sp = strataGeo.attributes.position;
      const cols = strataSegs + 1;
      for (let ix = 0; ix < cols; ix++) {
        const wx = -17 + (ix / strataSegs) * 34;
        const topY = Math.max(0.22, sampleHeightAt(wx, clipZ));
        sp.setXYZ(ix, wx, topY, clipZ - 0.03);
        sp.setXYZ(cols + ix, wx, 0.03, clipZ - 0.03);
      }
      sp.needsUpdate = true;
      strataGeo.computeVertexNormals();
    };

    // =========================================================================
    // 5. ТЕРРАСНЫЙ КАМЕННЫЙ АУЛ КАВКАЗА + ОСАДНЫЕ РЕДУТЫ РИ + СОМКНУТЫЕ СТРОИ ВОЙСК
    // =========================================================================
    const battlefieldStructures = new THREE.Group();
    scene.add(battlefieldStructures);

    const citadelY = sampleHeightAt(-5.5, -0.3);
    const batteryY = sampleHeightAt(7.8, 0.0);
    aulWarmGlow.position.set(-5.4, citadelY + 1.4, -0.3);
    redoubtBrazierLight.position.set(7.6, batteryY + 1.2, 0.2);

    const disposableBattleGeos = [];
    const disposableBattleMats = [];
    const trackGeo = (g) => {
      disposableBattleGeos.push(g);
      return g;
    };
    const trackMat = (m) => {
      disposableBattleMats.push(m);
      return m;
    };

    const saklyaStoneMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: '#c2b6a3',
        map: pbrPack.masonryDiff,
        normalMap: pbrPack.masonryNor,
        normalScale: new THREE.Vector2(0.85, 0.85),
        roughnessMap: pbrPack.masonryArm,
        roughness: 0.9,
        metalness: 0.02,
        clippingPlanes: [clipPlane]
      })
    );
    const saklyaRoofMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: '#6e5e4e',
        map: pbrPack.mudDiff,
        normalMap: pbrPack.mudNor,
        normalScale: new THREE.Vector2(0.55, 0.55),
        roughness: 0.94,
        metalness: 0.02,
        clippingPlanes: [clipPlane]
      })
    );
    const oakTimberMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: '#6d3b16',
        roughness: 0.82,
        clippingPlanes: [clipPlane]
      })
    );
    const saklyaWindowMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: '#fef08a',
        emissive: '#f59e0b',
        emissiveIntensity: 1.45,
        roughness: 0.3,
        clippingPlanes: [clipPlane]
      })
    );
    const parapetStoneMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: '#a39788',
        map: pbrPack.masonryDiff,
        normalMap: pbrPack.masonryNor,
        normalScale: new THREE.Vector2(0.85, 0.85),
        roughnessMap: pbrPack.masonryArm,
        roughness: 0.92,
        metalness: 0.02,
        clippingPlanes: [clipPlane]
      })
    );

    // 5.1. 16 ступенчатых каменных саклей аула вокруг главной башни + каменные брустверы + крытый спуск к Койсу
    const saklyaLayout = [
      [-4.1, -1.1, 1.25, 0.82, 1.05, 0.12],
      [-4.0, 0.35, 1.32, 0.86, 1.12, -0.08],
      [-4.3, 1.65, 1.18, 0.78, 0.98, 0.22],
      [-5.6, -1.75, 1.42, 0.92, 1.18, 0.05],
      [-5.8, 1.25, 1.38, 0.88, 1.15, -0.14],
      [-6.8, -0.85, 1.48, 0.95, 1.22, 0.18],
      [-6.9, 0.55, 1.35, 0.88, 1.1, -0.12],
      [-3.15, -0.45, 1.15, 0.74, 0.96, 0.08],
      [-3.25, 0.95, 1.12, 0.72, 0.92, -0.18],
      [-4.85, -2.55, 1.22, 0.78, 1.02, 0.28],
      [-6.4, -2.35, 1.28, 0.82, 1.04, -0.06],
      [-7.75, -1.65, 1.25, 0.84, 1.06, 0.15],
      [-7.85, 0.15, 1.3, 0.86, 1.08, -0.2],
      [-6.55, 2.25, 1.2, 0.78, 1.0, 0.14],
      [-5.0, 2.65, 1.18, 0.76, 0.96, -0.1],
      [-2.45, -1.35, 1.05, 0.68, 0.88, 0.24]
    ];

    const saklyaBodyGeo = trackGeo(new THREE.BoxGeometry(1, 1, 1));
    const saklyaRoofGeo = trackGeo(new THREE.BoxGeometry(1.08, 0.12, 1.08));
    const saklyaBeamGeo = trackGeo(new THREE.CylinderGeometry(0.032, 0.036, 1.24, 6));
    saklyaBeamGeo.rotateX(Math.PI / 2);
    const saklyaChimneyGeo = trackGeo(new THREE.CylinderGeometry(0.065, 0.085, 0.24, 7));
    const windowSlitGeo = trackGeo(new THREE.BoxGeometry(0.14, 0.18, 0.05));
    const rifleFiringPoints = [];

    saklyaLayout.forEach(([sx, sz, w, h, d, rotY], sIdx) => {
      const sy = sampleHeightAt(sx, sz);
      const house = new THREE.Group();
      house.position.set(sx, sy, sz);
      house.rotation.y = rotY;

      // Каменный цоколь и стены сакли (уходят на 0.45 в склон, чтобы нигде не висеть в воздухе)
      const body = new THREE.Mesh(saklyaBodyGeo, saklyaStoneMat);
      body.scale.set(w, h + 0.55, d);
      body.position.y = (h - 0.55) * 0.5 + 0.22;
      body.castShadow = true;
      body.receiveShadow = true;
      house.add(body);

      // Плоская глинобитная кровля на выступающих дубовых балках + дымоход
      const roof = new THREE.Mesh(saklyaRoofGeo, saklyaRoofMat);
      roof.scale.set(w, 1, d);
      roof.position.y = h + 0.02;
      roof.castShadow = true;
      roof.receiveShadow = true;
      house.add(roof);

      [-0.32, 0.0, 0.32].forEach((bOff) => {
        const beam = new THREE.Mesh(saklyaBeamGeo, oakTimberMat);
        beam.scale.set(1, 1, d);
        beam.position.set(w * bOff, h - 0.04, 0);
        house.add(beam);
      });
      if (sIdx % 2 === 0) {
        const chim = new THREE.Mesh(saklyaChimneyGeo, parapetStoneMat);
        chim.position.set(-w * 0.28, h + 0.16, d * 0.26);
        chim.castShadow = true;
        house.add(chim);
      }

      // Каменный стрелковый парапет с зубцами на крыше сакли, обращённой к русским батареям
      const parapet = new THREE.Mesh(saklyaBodyGeo, parapetStoneMat);
      parapet.scale.set(0.14, 0.24, d * 0.92);
      parapet.position.set(w * 0.44, h + 0.16, 0);
      parapet.castShadow = true;
      house.add(parapet);

      // Деревянная приставная лестница террасных саклей
      if (sIdx % 3 === 0) {
        const ladder = new THREE.Mesh(saklyaBeamGeo, oakTimberMat);
        ladder.scale.set(0.85, 0.85, h * 0.82);
        ladder.rotation.set(Math.PI * 0.38, 0, 0);
        ladder.position.set(-w * 0.48, h * 0.48, d * 0.52);
        house.add(ladder);
      }

      // Светящиеся бойницы / окна сакли
      const win1 = new THREE.Mesh(windowSlitGeo, saklyaWindowMat);
      win1.position.set(w * 0.5 + 0.01, h * 0.56, -d * 0.22);
      win1.rotation.y = Math.PI / 2;
      const win2 = new THREE.Mesh(windowSlitGeo, saklyaWindowMat);
      win2.position.set(w * 0.5 + 0.01, h * 0.56, d * 0.22);
      win2.rotation.y = Math.PI / 2;
      house.add(win1, win2);

      battlefieldStructures.add(house);
      rifleFiringPoints.push(new THREE.Vector3(sx + w * 0.42, sy + h + 0.34, sz));
    });

    // Наземный дубовый накат блиндажа Хаджи-Юсуфа у подножия главной башни (число слоёв = blindageLayers)
    const surfaceBlindageGroup = new THREE.Group();
    const surfaceLogGeo = trackGeo(new THREE.CylinderGeometry(0.09, 0.09, 2.5, 7));
    surfaceLogGeo.rotateZ(Math.PI / 2);
    for (let layer = 0; layer < 4; layer++) {
      const layerGrp = new THREE.Group();
      layerGrp.name = `surfBlindage_${layer}`;
      for (let k = -4; k <= 4; k++) {
        const logM = new THREE.Mesh(surfaceLogGeo, oakTimberMat);
        logM.position.set(-4.65, citadelY - 0.12 + layer * 0.17, -0.35 + k * 0.19);
        logM.castShadow = true;
        logM.receiveShadow = true;
        layerGrp.add(logM);
      }
      surfaceBlindageGroup.add(layerGrp);
    }
    battlefieldStructures.add(surfaceBlindageGroup);

    // Зубчатая каменная стена-бруствер по гребню скалы и крытый каменный спуск к воде р. Койсу
    const breastworkPts = [
      [-2.6, -2.4],
      [-2.35, -1.2],
      [-2.25, 0.0],
      [-2.4, 1.2],
      [-2.8, 2.3]
    ];
    breastworkPts.forEach(([bx, bz]) => {
      const by = sampleHeightAt(bx, bz);
      const wallSeg = new THREE.Mesh(saklyaBodyGeo, parapetStoneMat);
      wallSeg.scale.set(0.32, 0.85, 1.22);
      wallSeg.position.set(bx, by + 0.15, bz);
      wallSeg.castShadow = true;
      wallSeg.receiveShadow = true;
      battlefieldStructures.add(wallSeg);
    });

    // Крытый каменный коридор к воде (от нижних саклей к каньону реки)
    for (let step = 0; step < 6; step++) {
      const u = step / 5;
      const wx = -2.4 + u * 2.1;
      const wz = -1.6 - u * 0.9;
      const wy = sampleHeightAt(wx, wz);
      const corr = new THREE.Mesh(saklyaBodyGeo, parapetStoneMat);
      corr.scale.set(0.52, 0.65, 0.48);
      corr.position.set(wx, wy + 0.12, wz);
      corr.rotation.y = -0.38;
      corr.castShadow = true;
      battlefieldStructures.add(corr);
    }

    // Развевающиеся изумрудные знамёна Имамата над бастионами аула
    const bannerMeshes = [];
    const poleGeo = trackGeo(new THREE.CylinderGeometry(0.03, 0.035, 1.55, 6));
    const flagGeo = trackGeo(new THREE.PlaneGeometry(0.72, 0.42, 8, 2));
    const poleMat = trackMat(new THREE.MeshStandardMaterial({ color: '#d97706', metalness: 0.7, roughness: 0.3, clippingPlanes: [clipPlane] }));
    const flagMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: '#059669',
        emissive: '#064e3b',
        emissiveIntensity: 0.4,
        side: THREE.DoubleSide,
        roughness: 0.65,
        clippingPlanes: [clipPlane]
      })
    );
    [
      [-5.1, -0.35, 1.15],
      [-3.95, 0.35, 0.92],
      [-6.75, -0.85, 1.0]
    ].forEach(([fx, fz, hOff], bIdx) => {
      const fy = sampleHeightAt(fx, fz) + hOff;
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.set(fx, fy + 0.72, fz);
      const flag = new THREE.Mesh(flagGeo.clone(), flagMat);
      disposableBattleGeos.push(flag.geometry);
      flag.position.set(fx - 0.36, fy + 1.26, fz);
      flag.userData = { baseGeo: flag.geometry, phase: bIdx * 1.7 };
      bannerMeshes.push(flag);
      battlefieldStructures.add(pole, flag);
    });

    // Золотое тактическое кольцо активного сектора резерва муртазеков (citadel / blindage / water_descent / counter_mine)
    const sectorRingGeo = trackGeo(new THREE.RingGeometry(0.95, 1.18, 32));
    const sectorRingMat = trackMat(
      new THREE.MeshBasicMaterial({
        color: '#fbbf24',
        transparent: true,
        opacity: 0.85,
        side: THREE.DoubleSide,
        clippingPlanes: [clipPlane]
      })
    );
    const sectorHighlightRing = new THREE.Mesh(sectorRingGeo, sectorRingMat);
    sectorHighlightRing.rotation.x = -Math.PI / 2;
    battlefieldStructures.add(sectorHighlightRing);

    // 5.2. ОСАДНЫЕ РЕДУТЫ РИ, ПЛЕТЁНЫЕ ТУРЫ (ГАБИОНЫ), ПАЛАТКИ ЛАГЕРЯ И ЗИГЗАГООБРАЗНЫЕ АПРОШИ
    const earthworkMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: '#73604e',
        map: pbrPack.mudDiff,
        normalMap: pbrPack.mudNor,
        normalScale: new THREE.Vector2(0.75, 0.75),
        roughness: 0.92,
        metalness: 0.02,
        clippingPlanes: [clipPlane]
      })
    );
    const wickerGabionTex = createWickerGabionTexture();
    const gabionMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: '#ffffff',
        map: wickerGabionTex,
        vertexColors: true,
        roughness: 0.9,
        clippingPlanes: [clipPlane]
      })
    );
    const tentMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: '#ffffff',
        vertexColors: true,
        roughness: 0.82,
        clippingPlanes: [clipPlane]
      })
    );
    const torchFlameMat = trackMat(
      new THREE.MeshBasicMaterial({
        color: '#fde047',
        clippingPlanes: [clipPlane]
      })
    );

    // Земляной вал главной осадной батареи РИ с амбразурами и дубовыми орудийными платформами
    [-2.1, -0.35, 1.35, 2.65].forEach((rz) => {
      const ry = sampleHeightAt(6.95, rz);
      const berm = new THREE.Mesh(saklyaBodyGeo, earthworkMat);
      berm.scale.set(0.68, 0.62, 1.15);
      berm.position.set(6.95, ry + 0.16, rz);
      berm.rotation.y = 0.06;
      berm.castShadow = true;
      berm.receiveShadow = true;
      battlefieldStructures.add(berm);
    });
    [
      [7.45, -1.2],
      [7.55, 1.4],
      [7.85, 0.15]
    ].forEach(([gx, gz]) => {
      const deck = new THREE.Mesh(saklyaBodyGeo, oakTimberMat);
      deck.scale.set(1.05, 0.12, 0.85);
      deck.position.set(gx, sampleHeightAt(gx, gz) + 0.02, gz);
      deck.receiveShadow = true;
      battlefieldStructures.add(deck);
    });

    // Плетёные сапёрные туры (габионы) вдоль батарей и зигзагообразных траншей-апрошей
    const gabionPositions = [];
    for (let gz = -2.6; gz <= 2.8; gz += 0.38) {
      if (Math.abs(gz + 1.2) < 0.28 || Math.abs(gz - 1.4) < 0.28) continue; // амбразуры орудий
      gabionPositions.push([6.65, gz]);
    }
    // Зигзаг русских сапёрных апрошей вниз по склону к реке
    const sapZigZag = [
      [6.2, -0.6],
      [5.6, -0.1],
      [5.0, 0.45],
      [4.45, 0.05],
      [3.9, -0.45],
      [3.35, 0.0],
      [2.85, 0.48]
    ];
    const trenchFiringPoints = [];
    sapZigZag.forEach(([zx, zz], idx) => {
      gabionPositions.push([zx, zz], [zx + 0.22, zz + 0.26]);
      const zy = sampleHeightAt(zx, zz);
      // Тёмный ров сапы
      const trenchCut = new THREE.Mesh(saklyaBodyGeo, earthworkMat);
      trenchCut.scale.set(0.85, 0.22, 0.65);
      trenchCut.position.set(zx + 0.15, zy + 0.02, zz);
      trenchCut.rotation.y = idx % 2 === 0 ? 0.52 : -0.52;
      battlefieldStructures.add(trenchCut);
      trenchFiringPoints.push(new THREE.Vector3(zx, zy + 0.42, zz));

      // Факелы в ночных/вечерних траншеях
      if (idx % 2 === 0) {
        const flame = new THREE.Mesh(trackGeo(new THREE.SphereGeometry(0.09, 6, 6)), torchFlameMat);
        flame.position.set(zx - 0.08, zy + 0.46, zz + 0.15);
        battlefieldStructures.add(flame);
      }
    });

    const gabionGeo = trackGeo(createWovenGabionGeometry());
    const gabionsInst = new THREE.InstancedMesh(gabionGeo, gabionMat, gabionPositions.length);
    gabionsInst.castShadow = true;
    gabionsInst.receiveShadow = true;
    gabionPositions.forEach(([gx, gz], idx) => {
      const gy = sampleHeightAt(gx, gz);
      dummy.position.set(gx, gy - 0.02, gz);
      dummy.scale.setScalar(1);
      dummy.rotation.set(0, idx * 0.5, 0);
      dummy.updateMatrix();
      gabionsInst.setMatrixAt(idx, dummy.matrix);
    });
    battlefieldStructures.add(gabionsInst);

    // Двускатные походные шатры осадного лагеря Кавказского корпуса в тылу батарей
    const tentGeo = trackGeo(createRidgeTentGeometry());
    [
      [11.8, -2.8],
      [12.4, -0.9],
      [12.1, 1.6],
      [10.9, 3.1]
    ].forEach(([tx, tz], idx) => {
      const ty = sampleHeightAt(tx, tz);
      const tent = new THREE.Mesh(tentGeo, tentMat);
      tent.position.set(tx, ty - 0.02, tz);
      tent.rotation.y = -Math.PI * 0.48 + idx * 0.18;
      tent.castShadow = true;
      tent.receiveShadow = true;
      battlefieldStructures.add(tent);
    });

    // 5.3. СОМКНУТЫЕ СТРОИ ПЕХОТЫ РИ (74 штыка) И СТРЕЛКОВЫЕ ЦЕПИ ГОРЦЕВ (44 мюрида) — Анатомические InstancedMesh
    const impGeoSet = createImperialSoldierGeometrySet();
    const soldierCoatGeo = trackGeo(impGeoSet.coatGeo);
    const soldierEquipGeo = trackGeo(impGeoSet.equipGeo);
    const soldierMetalGeo = trackGeo(impGeoSet.metalGeo);

    const muridGeoSet = createMuridWarriorGeometrySet();
    const muridCherkGeo = trackGeo(muridGeoSet.cherkeskaGeo);
    const muridPapakhaGeo = trackGeo(muridGeoSet.papakhaAccGeo);
    const muridWeaponGeo = trackGeo(muridGeoSet.weaponGeo);

    const impAnimUniforms = createTroopAnimUniforms({ marchAmount: 0.16 });
    const muridAnimUniforms = createTroopAnimUniforms({ marchAmount: 0.12 });

    const rusCoatMat = trackMat(
      applyAnimatedTroopShader(
        new THREE.MeshStandardMaterial({ color: '#14532d', vertexColors: true, roughness: 0.78, clippingPlanes: [clipPlane] }),
        { keyTag: 'gorge_imp_coat', sharedUniforms: impAnimUniforms, clipped: true }
      )
    );
    const rusEquipMat = trackMat(
      applyAnimatedTroopShader(
        new THREE.MeshStandardMaterial({ color: '#f1ede6', vertexColors: true, roughness: 0.72, clippingPlanes: [clipPlane] }),
        { keyTag: 'gorge_imp_equip', sharedUniforms: impAnimUniforms, clipped: true }
      )
    );
    const steelMat = trackMat(
      applyAnimatedTroopShader(
        new THREE.MeshStandardMaterial({ color: '#e2e8f0', vertexColors: true, metalness: 0.78, roughness: 0.28, clippingPlanes: [clipPlane] }),
        { keyTag: 'gorge_imp_steel', sharedUniforms: impAnimUniforms, clipped: true }
      )
    );

    const muridCoatMat = trackMat(
      applyAnimatedTroopShader(
        new THREE.MeshStandardMaterial({ color: '#2b2420', vertexColors: true, roughness: 0.84, clippingPlanes: [clipPlane] }),
        { keyTag: 'gorge_murid_coat', sharedUniforms: muridAnimUniforms, clipped: true }
      )
    );
    const papakhaMat = trackMat(
      applyAnimatedTroopShader(
        new THREE.MeshStandardMaterial({ color: '#3b2416', vertexColors: true, roughness: 0.9, clippingPlanes: [clipPlane] }),
        { keyTag: 'gorge_murid_hat', sharedUniforms: muridAnimUniforms, clipped: true }
      )
    );
    const muridSteelMat = trackMat(
      applyAnimatedTroopShader(
        new THREE.MeshStandardMaterial({ color: '#d6d3d1', vertexColors: true, metalness: 0.68, roughness: 0.34, clippingPlanes: [clipPlane] }),
        { keyTag: 'gorge_murid_steel', sharedUniforms: muridAnimUniforms, clipped: true }
      )
    );

    const imperialTroopCoords = [];
    // Три полковые коробки Кавказского корпуса + расчёты у батарей и в сапе
    const platoonCenters = [
      [9.4, -1.8],
      [9.6, 1.5],
      [11.0, 0.1]
    ];
    platoonCenters.forEach(([px, pz]) => {
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 5; c++) {
          imperialTroopCoords.push([px + r * 0.34, pz + (c - 2) * 0.28, -Math.PI / 2]);
        }
      }
    });
    // 6 артиллеристов орудийной прислуги у трёх батарейных платформ
    const gunnerCrewMeta = [];
    [
      [7.45, -1.2, 'mortar'],
      [7.55, 1.4, 'unicorn'],
      [7.85, 0.15, 'flank']
    ].forEach(([gx, gz, gunKey]) => {
      [-0.36, 0.36].forEach((zOff, sideIdx) => {
        const idx = imperialTroopCoords.length;
        imperialTroopCoords.push([gx + 0.34, gz + zOff, -Math.PI / 2 + (sideIdx === 0 ? 0.25 : -0.25)]);
        gunnerCrewMeta.push({ idx, baseX: gx + 0.34, baseZ: gz + zOff, gunKey, sideIdx });
      });
    });
    sapZigZag.forEach(([zx, zz]) => {
      imperialTroopCoords.push([zx + 0.18, zz - 0.12, -Math.PI / 2]);
      imperialTroopCoords.push([zx + 0.32, zz + 0.14, -Math.PI / 2]);
    });
    // 4 движущихся сапёра сменяющейся рабочей смены вдоль зигзага апрошей
    const sapperPatrolIndices = [];
    for (let sp = 0; sp < 4; sp++) {
      sapperPatrolIndices.push(imperialTroopCoords.length);
      imperialTroopCoords.push([sapZigZag[0][0], sapZigZag[0][1], -Math.PI / 2]);
    }

    const rusBodies = new THREE.InstancedMesh(soldierCoatGeo, rusCoatMat, imperialTroopCoords.length);
    const rusHeads = new THREE.InstancedMesh(soldierEquipGeo, rusEquipMat, imperialTroopCoords.length);
    const rusBayonets = new THREE.InstancedMesh(soldierMetalGeo, steelMat, imperialTroopCoords.length);
    rusBodies.castShadow = true;
    rusHeads.castShadow = true;
    imperialTroopCoords.forEach(([ix, iz, rotY], idx) => {
      const iy = sampleHeightAt(ix, iz);
      dummy.position.set(ix, iy - 0.02, iz);
      dummy.rotation.set(0, rotY, 0);
      dummy.scale.setScalar(0.92);
      dummy.updateMatrix();
      rusBodies.setMatrixAt(idx, dummy.matrix);
      rusHeads.setMatrixAt(idx, dummy.matrix);
      rusBayonets.setMatrixAt(idx, dummy.matrix);
    });
    battlefieldStructures.add(rusBodies, rusHeads, rusBayonets);

    // Горские штуцерники и мюриды на плоских крышах саклей, за каменными брустверами и у спуска к воде
    const muridCoords = [];
    saklyaLayout.forEach(([sx, sz, w, h]) => {
      const sy = sampleHeightAt(sx, sz);
      muridCoords.push([sx + w * 0.26, sy + h + 0.06, sz - 0.18]);
      muridCoords.push([sx + w * 0.26, sy + h + 0.06, sz + 0.2]);
    });
    breastworkPts.forEach(([bx, bz]) => {
      const by = sampleHeightAt(bx - 0.28, bz);
      muridCoords.push([bx - 0.28, by, bz - 0.22]);
      muridCoords.push([bx - 0.28, by, bz + 0.22]);
    });
    // 4 дозорных мюрида, патрулирующих крытый спуск к воде и передовой бруствер
    const muridPatrolIndices = [];
    for (let mp = 0; mp < 4; mp++) {
      muridPatrolIndices.push(muridCoords.length);
      muridCoords.push([-2.4, sampleHeightAt(-2.4, -1.6), -1.6]);
    }

    const muridBodies = new THREE.InstancedMesh(muridCherkGeo, muridCoatMat, muridCoords.length);
    const muridHeads = new THREE.InstancedMesh(muridPapakhaGeo, papakhaMat, muridCoords.length);
    const muridRifles = new THREE.InstancedMesh(muridWeaponGeo, muridSteelMat, muridCoords.length);
    muridBodies.castShadow = true;
    muridHeads.castShadow = true;
    muridCoords.forEach(([mx, my, mz], idx) => {
      dummy.position.set(mx, my - 0.02, mz);
      dummy.rotation.set(0, Math.PI / 2, 0);
      dummy.scale.setScalar(0.94);
      dummy.updateMatrix();
      muridBodies.setMatrixAt(idx, dummy.matrix);
      muridHeads.setMatrixAt(idx, dummy.matrix);
      muridRifles.setMatrixAt(idx, dummy.matrix);
    });
    battlefieldStructures.add(muridBodies, muridHeads, muridRifles);

    // =========================================================================
    // 6. ПОДЗЕМНАЯ ИНЖЕНЕРНАЯ СХЕМА СТРОГО ВНУТРИ СТЕНЫ РАЗРЕЗА (0 ВЫСТУПОВ НАРУЖУ!)
    // =========================================================================
    const undergroundGroup = new THREE.Group();
    const blindageLight = new THREE.PointLight('#fbbf24', 2.4, 9);
    undergroundGroup.add(blindageLight);

    const cavernRecessMat = trackMat(new THREE.MeshBasicMaterial({ color: '#0c0907' }));
    const blindageAssembly = new THREE.Group();
    const cavernBack = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(3.2, 1.15, 0.14)), cavernRecessMat);
    blindageAssembly.add(cavernBack);

    // Отдельные круглые дубовые брёвна наката в подземном каземате
    const cutLogGeo = trackGeo(new THREE.CylinderGeometry(0.08, 0.08, 3.4, 8));
    cutLogGeo.rotateZ(Math.PI / 2);
    for (let layerIdx = 0; layerIdx < 4; layerIdx++) {
      const logBeam = new THREE.Mesh(cutLogGeo, oakTimberMat);
      logBeam.position.set(0, 0.56 + layerIdx * 0.15, 0.04);
      logBeam.name = `logLayer_${layerIdx}`;
      blindageAssembly.add(logBeam);
    }
    // Опорные стойки каземата
    [-1.4, 0, 1.4].forEach((px) => {
      const post = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.14, 1.1, 0.16)), oakTimberMat);
      post.position.set(px, 0, 0.04);
      blindageAssembly.add(post);
    });

    // Медный сейсмический таз с водой Хаджи-Юсуфа Сафарова внутри каземата
    const copperBasin = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.46, 0.34, 0.24, 18)),
      trackMat(new THREE.MeshStandardMaterial({ color: '#d97706', metalness: 0.88, roughness: 0.22 }))
    );
    copperBasin.position.set(0, -0.38, 0.12);
    blindageAssembly.add(copperBasin);

    const basinRippleMat = trackMat(
      new THREE.MeshBasicMaterial({
        color: '#38bdf8',
        transparent: true,
        opacity: 0.85,
        side: THREE.DoubleSide
      })
    );
    const basinRipple = new THREE.Mesh(trackGeo(new THREE.RingGeometry(0.1, 0.16, 20)), basinRippleMat);
    basinRipple.rotation.x = -Math.PI / 2;
    basinRipple.position.set(0, -0.24, 0.12);
    blindageAssembly.add(basinRipple);
    undergroundGroup.add(blindageAssembly);

    // Арочная подземная минная галерея сапёров РИ с деревянной крепью (строго ниже поверхности скалы!)
    const sapTunnelGroup = new THREE.Group();
    const sapTunnelLight = new THREE.PointLight('#fb923c', 2.4, 9);
    sapTunnelLight.position.set(-1.2, 0.05, 0.35);
    sapTunnelGroup.add(sapTunnelLight);
    const sapShaftMesh = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(7.2, 0.62, 0.14)),
      trackMat(new THREE.MeshBasicMaterial({ color: '#17110d' }))
    );
    sapTunnelGroup.add(sapShaftMesh);

    const sapPropMat = trackMat(new THREE.MeshStandardMaterial({ color: '#a16207', roughness: 0.78 }));
    const sapLanternMat = trackMat(new THREE.MeshBasicMaterial({ color: '#fb923c' }));
    for (let pIdx = 0; pIdx < 9; pIdx++) {
      const lx = -3.3 + pIdx * 0.82;
      const prop = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.09, 0.54, 0.18)), sapPropMat);
      prop.position.set(lx, 0, 0.02);
      sapTunnelGroup.add(prop);
      if (pIdx % 3 === 0) {
        const lamp = new THREE.Mesh(trackGeo(new THREE.SphereGeometry(0.06, 6, 6)), sapLanternMat);
        lamp.position.set(lx + 0.18, 0.14, 0.08);
        sapTunnelGroup.add(lamp);
      }
    }
    // Пороховой минный горн в голове русской сапы
    const mineHeadGlow = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.42, 0.36, 0.18)),
      trackMat(new THREE.MeshStandardMaterial({ color: '#991b1b', emissive: '#dc2626', emissiveIntensity: 0.9 }))
    );
    mineHeadGlow.position.set(-3.45, -0.05, 0.04);
    sapTunnelGroup.add(mineHeadGlow);
    undergroundGroup.add(sapTunnelGroup);

    // 3D-ударная волна подземного камуфлета
    const camoufletShockMat = trackMat(
      new THREE.MeshBasicMaterial({
        color: '#fbbf24',
        transparent: true,
        opacity: 0.0,
        side: THREE.DoubleSide
      })
    );
    const camoufletShockRing = new THREE.Mesh(trackGeo(new THREE.RingGeometry(0.35, 0.72, 28)), camoufletShockMat);
    camoufletShockRing.visible = false;
    undergroundGroup.add(camoufletShockRing);
    scene.add(undergroundGroup);

    // Полупрозрачный 3D-конус мёртвой зоны рельефа
    const deadZoneConeMat = trackMat(
      new THREE.MeshBasicMaterial({
        color: '#ef4444',
        transparent: true,
        opacity: 0.12,
        side: THREE.DoubleSide,
        depthWrite: false
      })
    );
    const deadZoneCone = new THREE.Mesh(trackGeo(new THREE.ConeGeometry(2.1, 8.6, 18, 1, true)), deadZoneConeMat);
    deadZoneCone.rotation.z = Math.PI / 2 - 0.24;
    deadZoneCone.position.set(-4.2, citadelY + 0.35, -0.2);
    scene.add(deadZoneCone);

    // =========================================================================
    // 7. ВЫСОКОДЕТАЛИЗИРОВАННЫЕ 3D-ОБЪЕКТЫ УЩЕЛЬЯ (Башня, Герои, Орудия, Колонны, Каменный мост, Маяк и Беркуты)
    // =========================================================================
    const actorsGroup = new THREE.Group();
    const eaglesGroup = new THREE.Group();
    const gorgeBeaconGroup = new THREE.Group();
    scene.add(actorsGroup, eaglesGroup, gorgeBeaconGroup);

    const cannonRefs = { mortar: null, unicorn: null, flank: null };
    const heroRefs = [];
    const marchSupportRefs = [];
    const fortressArchRefs = [];
    {
      const citadelTower = createPhotorealVainakhTowerInstance({
        scale: 1.48,
        castShadow: true,
        clippingPlanes: [clipPlane]
      });
      citadelTower.position.set(-5.55, citadelY - 0.06, -0.35);
      citadelTower.rotation.y = 0.18;
      scene.add(citadelTower);
      fortressArchRefs.push(citadelTower);
    }
    [
      { key: 'hero_baysungur', x: -6.75, z: 3.65, scale: 0.72, rotY: 0.65 },
      { key: 'hero_hadji_murat', x: -5.05, z: 3.85, scale: 0.72, rotY: 0.42 }
    ].forEach((hCfg) => {
      const hy = sampleHeightAt(hCfg.x, hCfg.z);
      const heroMount = createPhotorealCavalryInstance(hCfg.key, {
        scale: hCfg.scale,
        castShadow: true,
        clippingPlanes: [clipPlane]
      });
      heroMount.position.set(hCfg.x, hy, hCfg.z);
      heroMount.rotation.y = hCfg.rotY;
      heroMount.userData.baseY = hy;
      actorsGroup.add(heroMount);
      heroRefs.push(heroMount);
    });
    {
      const gorgeBeacon = createPhotorealSignalBeaconInstance({
        isLit: true,
        scale: 1.24,
        castShadow: true,
        clippingPlanes: [clipPlane],
        phase: 0.8
      });
      gorgeBeacon.position.set(-8.8, sampleHeightAt(-8.8, -2.8), -2.8);
      gorgeBeacon.rotation.y = 0.4;
      gorgeBeaconGroup.add(gorgeBeacon);
    }
    {
      const gorgeBridge = createPhotorealStoneBridgeInstance({
        dismantled: false,
        scale: 2.15,
        castShadow: true,
        clippingPlanes: [clipPlane]
      });
      gorgeBridge.position.set(0.85, 0.78, 1.8);
      gorgeBridge.rotation.y = Math.PI / 2;
      scene.add(gorgeBridge);
      fortressArchRefs.push(gorgeBridge);
    }

    // Осадная батарея бронзовых горных единорогов РИ и колонна резерва с сухарными фургонами
    [
      { slot: 'mortar', x: 7.45, z: -1.2, scale: 0.72 },
      { slot: 'unicorn', x: 7.55, z: 1.4, scale: 0.72 },
      { slot: 'flank', x: 7.85, z: 0.15, scale: 0.68 }
    ].forEach((gCfg) => {
      const gy = sampleHeightAt(gCfg.x, gCfg.z);
      const gun = createPhotorealUnicornCannonInstance({
        variant: 'imperial',
        includeAmmoChest: true,
        scale: gCfg.scale,
        castShadow: true,
        clippingPlanes: [clipPlane]
      });
      gun.position.set(gCfg.x, gy, gCfg.z);
      gun.rotation.y = -Math.PI / 2;
      gun.userData.baseX = gCfg.x;
      gun.userData.baseY = gy;
      actorsGroup.add(gun);
      cannonRefs[gCfg.slot] = gun;
    });

    {
      const colY = sampleHeightAt(10.2, 0.15);
      const colInst = createPhotorealImperialColumnInstance({
        scale: 0.58,
        castShadow: true,
        clippingPlanes: [clipPlane]
      });
      colInst.position.set(10.2, colY, 0.15);
      colInst.rotation.y = -Math.PI / 2;
      actorsGroup.add(colInst);
      marchSupportRefs.push(colInst);
    }

    [
      { x: 11.6, z: -1.6, scale: 0.68, rotY: -Math.PI / 2 },
      { x: 11.9, z: 1.8, scale: 0.66, rotY: -Math.PI / 2 + 0.25 }
    ].forEach((wCfg) => {
      const wy = sampleHeightAt(wCfg.x, wCfg.z);
      const wag = createPhotorealSupplyWagonInstance({
        includeDraftHorse: true,
        scale: wCfg.scale,
        castShadow: true,
        clippingPlanes: [clipPlane]
      });
      wag.position.set(wCfg.x, wy, wCfg.z);
      wag.rotation.y = wCfg.rotY;
      actorsGroup.add(wag);
      marchSupportRefs.push(wag);
    });

    // 4 фотореалистичных кавказских беркута (Aquila chrysaetos) в восходящих потоках над тесниной и саклями аула
    [
      { cx: -2.1, cz: -0.7, rx: 4.8, rz: 3.5, baseAlt: citadelY + 3.55, altAmp: 0.52, omega: 0.36, dir: 1, driftRadius: 0.65, phase: 0.45, flapPeriod: 8.8, scale: 1.08 },
      { cx: -1.4, cz: -0.2, rx: 5.3, rz: 3.9, baseAlt: citadelY + 4.15, altAmp: 0.48, omega: 0.36, dir: 1, driftRadius: 0.6, phase: 1.05, flapPeriod: 9.6, scale: 0.96 },
      { cx: 3.6, cz: 1.8, rx: 5.6, rz: 4.2, baseAlt: citadelY + 5.2, altAmp: 0.62, omega: 0.31, dir: -1, driftRadius: 0.8, phase: 2.6, flapPeriod: 9.2, scale: 0.92 },
      { cx: -3.8, cz: 3.2, rx: 5.0, rz: 3.8, baseAlt: citadelY + 5.8, altAmp: 0.58, omega: 0.29, dir: 1, driftRadius: 0.75, phase: 4.2, flapPeriod: 10.0, scale: 0.88 }
    ].forEach((cfg) => {
      const eagle = createPhotorealGoldenEagleInstance({
        scale: cfg.scale,
        castShadow: true,
        clippingPlanes: [clipPlane]
      });
      eagle.userData.flightCfg = cfg;
      updatePhotorealGoldenEagle(eagle, 0);
      eaglesGroup.add(eagle);
    });

    // Многоярусный слоистый горный туман в Салтинской теснине и у каменного моста
    const mistTex = createLayeredValleyMistTexture();
    const powderSmokeTex = createBillowingSmokeTexture();
    const mistGroup = new THREE.Group();
    mistGroup.userData.excludeFromGtao = true;
    const mistPlaneGeo = trackGeo(new THREE.PlaneGeometry(10.2, 5.6));
    const mistPlaneMat = trackMat(
      new THREE.MeshBasicMaterial({
        map: mistTex,
        color: '#dbeafe',
        transparent: true,
        opacity: 0.19,
        depthWrite: false,
        side: THREE.DoubleSide,
        clippingPlanes: [clipPlane]
      })
    );
    [
      [0.3, -10.8, 1.72, 1.0],
      [0.5, -5.8, 1.85, 1.05],
      [0.4, -0.8, 1.82, 1.1],
      [0.3, 4.8, 1.78, 1.0],
      [0.2, 9.6, 1.82, 1.05],
      [-2.8, 2.2, 2.55, 0.95],
      [3.6, -3.4, 2.5, 0.95],
      [-1.4, -7.2, 2.75, 1.05],
      [1.8, 1.4, 2.68, 1.08],
      [-3.4, -2.5, 2.95, 0.9],
      [2.6, 6.2, 2.65, 1.0],
      [0.2, -3.2, 2.4, 1.12],
      [0.8, 3.2, 2.45, 1.1],
      [-0.8, 7.6, 2.72, 0.96]
    ].forEach(([mx, mz, my, sMult], idx) => {
      const m = new THREE.Mesh(mistPlaneGeo, mistPlaneMat);
      m.rotation.x = -Math.PI / 2;
      m.rotation.z = idx * 0.65;
      m.scale.setScalar(sMult);
      m.position.set(mx, my, mz);
      m.userData = { baseX: mx, baseZ: mz, phase: idx * 1.18, excludeFromGtao: true };
      mistGroup.add(m);
    });
    scene.add(mistGroup);

    const precipSys = createCaucasusPrecipitationSystem({
      spanX: 38,
      spanY: 16,
      spanZ: 38,
      rainCount: 650,
      snowCount: 800
    });
    scene.add(precipSys.group);

    // Прицельные баллистические дуги мортиры и единорога
    const mortarCurveMesh = new THREE.Line(
      new THREE.BufferGeometry(),
      trackMat(new THREE.LineBasicMaterial({ color: '#fb923c', transparent: true, opacity: 0.68 }))
    );
    const unicornCurveMesh = new THREE.Line(
      new THREE.BufferGeometry(),
      trackMat(new THREE.LineBasicMaterial({ color: '#38bdf8', transparent: true, opacity: 0.62 }))
    );
    const aimMarkerGlow = new THREE.Mesh(
      trackGeo(new THREE.SphereGeometry(0.18, 10, 10)),
      trackMat(new THREE.MeshBasicMaterial({ color: '#fde047' }))
    );
    scene.add(mortarCurveMesh, unicornCurveMesh, aimMarkerGlow);

    // =========================================================================
    // 8. ОБЪЁМНЫЙ ПОРОХОВОЙ ДЫМ XIX ВЕКА, ТРАССЕРЫ ШТУЦЕРОВ, БОМБЫ И ВЫЛАЗКИ МЮРИДОВ
    // =========================================================================
    const fxGroup = new THREE.Group();
    scene.add(fxGroup);

    const smokeSys = createBlackPowderSmokeSystem({
      parentGroup: fxGroup,
      smokeTex: powderSmokeTex,
      maxParticles: 320,
      clippingPlanes: [clipPlane]
    });
    const sharedShellGeo = new THREE.SphereGeometry(0.24, 12, 12);
    const sharedTracerGeo = new THREE.BoxGeometry(0.75, 0.045, 0.045);

    const activeShells = [];
    const activeTracers = [];
    const animState = {
      recoilMortar: 0,
      recoilUnicorn: 0,
      recoilFlank: 0,
      blindageShudder: 0,
      cameraShake: 0,
      shockwaveAge: -1,
      lastProcessedSeq: latestRef.current.stats3D?.lastShotEvent?.seq || 0,
      nextAmbientShotAt: 2.4,
      nextSkirmishAt: 0.7,
      nextEagleCryAt: 5.5
    };

    const spawnRifleTracer = (fromVec, toVec, colorHex = '#fde047') => {
      if (activeTracers.length > 48) return;
      const mat = new THREE.MeshBasicMaterial({
        color: colorHex,
        transparent: true,
        opacity: 0.95
      });
      const mesh = new THREE.Mesh(sharedTracerGeo, mat);
      mesh.position.copy(fromVec);
      mesh.lookAt(toVec);
      mesh.rotateY(Math.PI / 2);
      fxGroup.add(mesh);
      activeTracers.push({
        mesh,
        mat,
        from: fromVec.clone(),
        to: toVec.clone(),
        progress: 0,
        speed: 3.4 + Math.random() * 1.1
      });
      smokeSys.spawnSmoke({
        x: fromVec.x,
        y: fromVec.y + 0.08,
        z: fromVec.z,
        vx: (toVec.x - fromVec.x) * 0.07,
        vy: 0.42 + Math.random() * 0.35,
        vz: (Math.random() - 0.5) * 0.25,
        scale: 0.44,
        grow: 0.85,
        life: 1.65,
        flash: true,
        flashHex: '#f59e0b',
        colorHex: '#e2e8f0',
        maxOpacity: 0.46
      });
    };

    const spawnMuzzleSalvoFX = (mx, my, mz, dirX = -1) => {
      muzzleFlashLight.position.set(mx + dirX * 0.4, my + 0.35, mz);
      muzzleFlashLight.color.set('#fde047');
      muzzleFlashLight.intensity = 10.5;

      for (let s = 0; s < 7; s++) {
        smokeSys.spawnSmoke({
          x: mx + dirX * 0.35,
          y: my + 0.14,
          z: mz + (Math.random() - 0.5) * 0.25,
          vx: dirX * (2.5 + Math.random() * 2.2),
          vy: 0.38 + Math.random() * 1.1,
          vz: (Math.random() - 0.5) * 1.4,
          scale: 0.65 + Math.random() * 0.45,
          grow: 1.8,
          life: 0.48 + Math.random() * 0.22,
          flash: true,
          flashHex: '#fde047',
          colorHex: '#fed7aa',
          maxOpacity: 0.72
        });
      }

      for (let i = 0; i < 14; i++) {
        smokeSys.spawnSmoke({
          x: mx + dirX * (0.4 + Math.random() * 0.65),
          y: my + 0.18 + Math.random() * 0.26,
          z: mz + (Math.random() - 0.5) * 0.5,
          vx: dirX * (0.9 + Math.random() * 1.25),
          vy: 0.58 + Math.random() * 0.85,
          vz: (Math.random() - 0.5) * 0.65,
          scale: 0.58 + Math.random() * 0.42,
          grow: 1.15,
          gravity: -0.06,
          life: 3.2 + Math.random() * 1.6,
          colorHex: i % 2 === 0 ? '#e2e8f0' : '#cbd5e1',
          maxOpacity: 0.58
        });
      }
    };

    const spawnImpactExplosionFX = (ix, iy, iz, kind) => {
      const isCamouflet = kind === 'camouflet';
      const isCliffHit = kind === 'cliff_blocked';
      impactBlastLight.position.set(ix, iy + 0.4, iz + 0.6);
      impactBlastLight.color.set(isCamouflet ? '#f97316' : isCliffHit ? '#ef4444' : '#fbbf24');
      impactBlastLight.intensity = isCamouflet ? 15.0 : 9.0;

      const smokeCount = isCamouflet ? 26 : 18;
      for (let i = 0; i < smokeCount; i++) {
        const ang = (i / smokeCount) * Math.PI * 2 + Math.random() * 0.4;
        const spd = (isCamouflet ? 2.2 : 1.55) * (0.45 + Math.random() * 0.8);
        smokeSys.spawnSmoke({
          x: ix + (Math.random() - 0.5) * 0.5,
          y: iy + (Math.random() - 0.5) * 0.35,
          z: iz + (Math.random() - 0.5) * 0.45,
          vx: Math.cos(ang) * spd,
          vy: (isCamouflet ? 1.35 : 1.1) + Math.random() * 1.35,
          vz: Math.sin(ang) * spd * 0.55,
          scale: isCamouflet ? 1.1 : 0.82,
          grow: isCamouflet ? 1.85 : 1.4,
          gravity: -0.06,
          life: (isCamouflet ? 3.2 : 2.6) + Math.random() * 1.3,
          flash: i < 5,
          flashHex: '#f97316',
          colorHex: isCliffHit ? '#d6d3d1' : '#94a3b8',
          maxOpacity: i < 5 ? 0.68 : 0.54
        });
      }

      const debrisCount = isCamouflet ? 16 : 10;
      for (let d = 0; d < debrisCount; d++) {
        smokeSys.spawnDebris({
          x: ix,
          y: iy + 0.1,
          z: iz,
          vx: (Math.random() - 0.5) * 5.6,
          vy: 2.2 + Math.random() * 3.4,
          vz: (Math.random() - 0.5) * 2.8,
          scale: 0.065 + Math.random() * 0.06,
          gravity: 8.8,
          life: 0.85 + Math.random() * 0.4,
          colorHex: isCliffHit ? '#a8a29e' : '#57534e',
          emissiveHex: d % 4 === 0 ? '#ea580c' : '#000000'
        });
      }
      const curSt = latestRef.current;
      playSpatialBattleSound(
        isCamouflet ? 'camouflet_3d' : 'explosion_3d',
        { x: ix, y: iy, z: iz },
        { enabled: Boolean(curSt.soundEnabled && curSt.spatialAudioOn), environment: 'gorge' }
      );
    };

    const buildArcPoints = (angleDeg, startX, startY, startZ, endX, endY, endZ) => {
      const pts = [];
      const steps = 40;
      const apexBoost = Math.tan((Math.min(72, Math.max(8, angleDeg)) * Math.PI) / 180) * 3.2;
      for (let i = 0; i <= steps; i++) {
        const u = i / steps;
        const x = startX + (endX - startX) * u;
        const z = startZ + (endZ - startZ) * u;
        const baseLinY = startY + (endY - startY) * u;
        const arc = 4 * u * (1 - u) * Math.min(8.2, apexBoost);
        pts.push(new THREE.Vector3(x, baseLinY + arc, z));
      }
      return pts;
    };

    const trigger3DShot = (shotType, customAngle, blockedByDeadZone) => {
      const st = latestRef.current;
      const audioOn = Boolean(st.soundEnabled && st.spatialAudioOn);
      if (shotType === 'camouflet_3d' || shotType === 'camouflet') {
        const headWorld = new THREE.Vector3();
        mineHeadGlow.getWorldPosition(headWorld);
        camoufletShockRing.position.copy(undergroundGroup.worldToLocal(headWorld.clone()));
        camoufletShockRing.scale.setScalar(0.3);
        camoufletShockRing.visible = true;
        animState.shockwaveAge = 0;
        animState.cameraShake = 0.42;
        animState.blindageShudder = 0.65;
        spawnImpactExplosionFX(headWorld.x, headWorld.y + 0.35, headWorld.z + 0.25, 'camouflet');
        return;
      }

      if (shotType === 'sharpshooters') {
        // Залп всех штуцерников с крыш саклей по амбразурам русских орудий!
        muridAnimUniforms.uVolleyPulse.value = 1.15;
        rifleFiringPoints.forEach((fp, idx) => {
          const targetGun = new THREE.Vector3(
            7.2,
            batteryY + 0.45,
            idx % 2 === 0 ? -1.2 : 1.4
          );
          spawnRifleTracer(fp, targetGun, '#fde047');
        });
        playSpatialBattleSound(
          'rifle_murid_3d',
          { x: -4.8, y: citadelY + 0.6, z: 0.0 },
          { enabled: audioOn, environment: 'gorge' }
        );
        playSpatialBattleSound(
          'ricochet_3d',
          { x: 7.25, y: batteryY + 0.4, z: -1.1 },
          { enabled: audioOn, environment: 'gorge' }
        );
        spawnImpactExplosionFX(7.25, batteryY + 0.4, -1.1, 'cliff_blocked');
        spawnImpactExplosionFX(7.35, batteryY + 0.4, 1.3, 'cliff_blocked');
        animState.cameraShake = 0.18;
        return;
      }

      if (shotType === 'night_sortie') {
        // Кинжальная вылазка мюридов через каменный мост в передовые апроши и заклёпка пушек!
        muridAnimUniforms.uChargePulse.value = 1.05;
        impAnimUniforms.uVolleyPulse.value = 0.9;
        playSpatialBattleSound(
          'dagger_charge_3d',
          { x: 0.85, y: 1.45, z: 1.8 },
          { enabled: audioOn, environment: 'gorge' }
        );
        sapZigZag.forEach(([zx, zz], idx) => {
          const zy = sampleHeightAt(zx, zz);
          if (idx % 2 === 0) {
            spawnImpactExplosionFX(zx, zy + 0.35, zz, 'camouflet');
          }
        });
        spawnImpactExplosionFX(7.4, batteryY + 0.5, -1.2, 'camouflet');
        animState.cameraShake = 0.32;
        return;
      }

      const isFlank = shotType === 'flank_3d';
      const isMortar = !isFlank && (shotType === 'mortar_3d' || shotType === 'repair_blindage');
      const angle = customAngle ?? (isMortar ? st.mortarAngle3D || 58 : st.unicornAngle3D || 15);
      const isBlocked = blockedByDeadZone ?? (!isMortar && angle < 28);

      const startX = isFlank ? 7.28 : isMortar ? 6.85 : 7.05;
      const startZ = isFlank ? 0.15 : isMortar ? -1.2 : 1.4;
      const startY = sampleHeightAt(isFlank ? 7.85 : 7.45, startZ) + (isMortar ? 0.72 : 0.62);
      const endX = isMortar ? -4.7 : -4.4;
      const endY = isMortar ? citadelY + 0.55 : citadelY - 0.35;
      const endZ = isFlank ? 0.0 : isMortar ? -0.25 : 0.25;

      if (isFlank) animState.recoilFlank = 1.0;
      else if (isMortar) animState.recoilMortar = 1.0;
      else animState.recoilUnicorn = 1.0;
      impAnimUniforms.uVolleyPulse.value = Math.max(impAnimUniforms.uVolleyPulse.value, 0.55);

      spawnMuzzleSalvoFX(startX, startY, startZ, -1);
      playSpatialBattleSound(
        isMortar ? 'mortar_3d' : 'cannon_3d',
        { x: startX, y: startY, z: startZ },
        { enabled: audioOn, environment: 'gorge' }
      );

      const pts = buildArcPoints(angle, startX, startY, startZ, endX, endY, endZ);
      const shellMat = new THREE.MeshStandardMaterial({
        color: '#1c1917',
        emissive: isMortar ? '#fb923c' : '#ef4444',
        emissiveIntensity: 2.2,
        metalness: 0.8,
        roughness: 0.25
      });
      const shellMesh = new THREE.Mesh(sharedShellGeo, shellMat);
      shellMesh.position.copy(pts[0]);
      fxGroup.add(shellMesh);

      activeShells.push({
        mesh: shellMesh,
        mat: shellMat,
        pts,
        progress: 0,
        maxProgress: isBlocked ? 0.74 : 1.0,
        speed: isMortar ? 0.66 : 1.18,
        impactKind: isBlocked ? 'cliff_blocked' : 'blindage_hit',
        trailTimer: 0
      });
    };

    // Управление камерой (ЛКМ — орбита, ПКМ / Shift+ЛКМ — панорама, Колесо — зум)
    let dragging = false;
    let dragMode = 'orbit';
    let prevX = 0;
    let prevY = 0;
    const dom = renderer.domElement;

    const onDown = (e) => {
      unlockSpatialBattleAudio(Boolean(latestRef.current.soundEnabled && latestRef.current.spatialAudioOn));
      dragging = true;
      dragMode = e.button === 2 || e.shiftKey ? 'pan' : 'orbit';
      prevX = e.clientX;
      prevY = e.clientY;
    };
    const onMove = (e) => {
      if (!dragging) return;
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;
      prevX = e.clientX;
      prevY = e.clientY;
      if (dragMode === 'pan') {
        const yaw = latestRef.current.cam3D?.yaw || -0.54;
        const cosY = Math.cos(yaw);
        const sinY = Math.sin(yaw);
        panOffsetRef.current.x = Math.max(
          -12,
          Math.min(12, panOffsetRef.current.x - (dx * cosY + dy * sinY * 0.6) * 0.025)
        );
        panOffsetRef.current.z = Math.max(
          -10,
          Math.min(10, panOffsetRef.current.z - (-dx * sinY + dy * cosY * 0.6) * 0.025)
        );
      } else if (setCam3D) {
        setCam3D((prev) => ({
          ...prev,
          autoRotate: false,
          yaw: prev.yaw - dx * 0.0075,
          pitch: Math.max(0.08, Math.min(1.38, prev.pitch + dy * 0.0065))
        }));
      }
    };
    const onUp = () => {
      dragging = false;
    };
    const onContext = (e) => e.preventDefault();
    const onWheel = (e) => {
      e.preventDefault();
      if (!setCam3D) return;
      setCam3D((prev) => ({
        ...prev,
        zoom: Math.max(0.68, Math.min(2.15, prev.zoom - e.deltaY * 0.0011))
      }));
    };

    dom.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    dom.addEventListener('contextmenu', onContext);
    dom.addEventListener('wheel', onWheel, { passive: false });

    const touchControls = attachUnified3DTouchControls(dom, {
      onInteractionStart: () =>
        unlockSpatialBattleAudio(Boolean(latestRef.current.soundEnabled && latestRef.current.spatialAudioOn)),
      onOrbit: (dx, dy) => {
        if (!setCam3D) return;
        setCam3D((prev) => ({
          ...prev,
          autoRotate: false,
          yaw: prev.yaw - dx * 0.008,
          pitch: Math.max(0.08, Math.min(1.38, prev.pitch + dy * 0.0068))
        }));
      },
      onPan: (dx, dy) => {
        const yaw = latestRef.current.cam3D?.yaw || -0.54;
        const cosY = Math.cos(yaw);
        const sinY = Math.sin(yaw);
        panOffsetRef.current.x = Math.max(
          -12,
          Math.min(12, panOffsetRef.current.x - (dx * cosY + dy * sinY * 0.6) * 0.028)
        );
        panOffsetRef.current.z = Math.max(
          -10,
          Math.min(10, panOffsetRef.current.z - (-dx * sinY + dy * cosY * 0.6) * 0.028)
        );
      },
      onPinchZoom: (pinchDelta) => {
        if (!setCam3D) return;
        setCam3D((prev) => ({
          ...prev,
          zoom: Math.max(0.68, Math.min(2.15, prev.zoom + pinchDelta * 0.0045))
        }));
      }
    });

    const resizeObs = new ResizeObserver(() => {
      if (!container) return;
      const w = Math.max(320, container.clientWidth);
      const h = Math.max(260, container.clientHeight);
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
    });
    resizeObs.observe(container);

    let disposed = false;
    let raf = 0;
    let lastTimeOfDayApplied = '';
    let lastMortarAngleBuilt = NaN;
    let lastUnicornAngleBuilt = NaN;
    let cachedMortarPts = [];
    const clock = new THREE.Clock();

    const applyLightingMood = (tod) => {
      if (tod === 'sunset') {
        sun.color.set('#fb923c');
        sun.intensity = 2.45;
        sun.position.set(-22, 13, 14);
        hemi.color.set('#fed7aa');
        hemi.groundColor.set('#2e1a12');
        hemi.intensity = 0.78;
        scene.environmentIntensity = 0.48;
        scene.fog.color.set('#9e5a44');
        scene.fog.density = 0.0085;
        gorgeRidgeMat.color.set('#dba485');
        skyUniforms.uTintColor.value.set('#ffb37a');
        skyUniforms.uHorizonColor.value.set('#c46d4c');
        skyUniforms.uNightFactor.value = 0.14;
        saklyaWindowMat.emissiveIntensity = 2.4;
        aulWarmGlow.intensity = 2.1;
        redoubtBrazierLight.intensity = 2.2;
      } else if (tod === 'night') {
        sun.color.set('#93c5fd');
        sun.intensity = 0.76;
        sun.position.set(14, 28, -12);
        hemi.color.set('#27477a');
        hemi.groundColor.set('#090d16');
        hemi.intensity = 0.48;
        scene.environmentIntensity = 0.24;
        scene.fog.color.set('#0e1726');
        scene.fog.density = 0.0095;
        gorgeRidgeMat.color.set('#4c6078');
        skyUniforms.uTintColor.value.set('#223656');
        skyUniforms.uHorizonColor.value.set('#131e30');
        skyUniforms.uNightFactor.value = 0.88;
        saklyaWindowMat.emissiveIntensity = 3.2;
        aulWarmGlow.intensity = 3.1;
        redoubtBrazierLight.intensity = 3.2;
      } else {
        sun.color.set('#fff2d2');
        sun.intensity = 2.35;
        sun.position.set(19, 32, 15);
        hemi.color.set('#dceeff');
        hemi.groundColor.set('#3a2818');
        hemi.intensity = 0.92;
        scene.environmentIntensity = 0.62;
        scene.fog.color.set('#86a7c0');
        scene.fog.density = 0.0078;
        gorgeRidgeMat.color.set('#e2ecf5');
        skyUniforms.uTintColor.value.set('#ffffff');
        skyUniforms.uHorizonColor.value.set('#9cb8ce');
        skyUniforms.uNightFactor.value = 0.0;
        saklyaWindowMat.emissiveIntensity = 0.95;
        aulWarmGlow.intensity = 0.75;
        redoubtBrazierLight.intensity = 0.9;
      }
      riverMat.uniforms.uSunDir.value.copy(sun.position).normalize();
      riverMat.uniforms.uSunColor.value.copy(sun.color);
    };

    const animate = () => {
      if (disposed) return;
      raf = requestAnimationFrame(animate);
      const dt = Math.min(0.05, clock.getDelta());
      const tSec = clock.elapsedTime;
      const st = latestRef.current;

      if (st.battleTimeOfDay !== lastTimeOfDayApplied) {
        lastTimeOfDayApplied = st.battleTimeOfDay;
        applyLightingMood(lastTimeOfDayApplied);
      }

      const curWeather = st.battleWeather || 'clear';
      const baseFog =
        st.battleTimeOfDay === 'sunset' ? 0.0085 : st.battleTimeOfDay === 'night' ? 0.0095 : 0.0078;
      const baseSunInt =
        st.battleTimeOfDay === 'sunset' ? 2.45 : st.battleTimeOfDay === 'night' ? 0.76 : 2.35;
      scene.fog.density = baseFog + (curWeather !== 'clear' ? 0.0018 : 0.0);
      sun.intensity = baseSunInt * (curWeather !== 'clear' ? 0.76 : 1.0);
      mistPlaneMat.opacity = curWeather !== 'clear' ? 0.28 : 0.19;

      riverMat.uniforms.uTime.value = tSec;
      if (beechCrownMat.userData.foliageUniforms) beechCrownMat.userData.foliageUniforms.uFoliageTime.value = tSec;
      if (pineMat.userData.foliageUniforms) pineMat.userData.foliageUniforms.uFoliageTime.value = tSec;
      if (bushMat.userData.foliageUniforms) bushMat.userData.foliageUniforms.uFoliageTime.value = tSec;
      if (outerCrownMat.userData.foliageUniforms) outerCrownMat.userData.foliageUniforms.uFoliageTime.value = tSec;

      impAnimUniforms.uTroopTime.value = tSec;
      muridAnimUniforms.uTroopTime.value = tSec;
      impAnimUniforms.uVolleyPulse.value = Math.max(0, impAnimUniforms.uVolleyPulse.value - dt * 2.4);
      muridAnimUniforms.uVolleyPulse.value = Math.max(0, muridAnimUniforms.uVolleyPulse.value - dt * 2.4);
      muridAnimUniforms.uChargePulse.value = Math.max(0, muridAnimUniforms.uChargePulse.value - dt * 1.4);

      const audioActive = Boolean(st.soundEnabled && st.spatialAudioOn);

      // 1. Новые боевые приказы и живая перестрелка штуцеров и артиллерии
      const incomingEvt = st.stats3D?.lastShotEvent;
      if (incomingEvt && incomingEvt.seq !== animState.lastProcessedSeq) {
        animState.lastProcessedSeq = incomingEvt.seq;
        animState.nextAmbientShotAt = tSec + 6.5;
        trigger3DShot(incomingEvt.type, incomingEvt.angleDeg, incomingEvt.blockedByDeadZone);
      } else if (tSec >= animState.nextAmbientShotAt) {
        animState.nextAmbientShotAt = tSec + 5.6;
        const cyc = Math.floor(tSec) % 3;
        trigger3DShot(cyc === 0 ? 'mortar_3d' : cyc === 1 ? 'unicorn_3d' : 'flank_3d');
      }

      if (tSec >= animState.nextSkirmishAt && rifleFiringPoints.length > 0 && trenchFiringPoints.length > 0) {
        animState.nextSkirmishAt = tSec + 0.78 + Math.random() * 0.65;
        const fromAul = Math.random() > 0.42;
        const rp = rifleFiringPoints[Math.floor(Math.random() * rifleFiringPoints.length)];
        const tp = trenchFiringPoints[Math.floor(Math.random() * trenchFiringPoints.length)];
        if (fromAul) {
          spawnRifleTracer(rp, tp, '#fde047');
          muridAnimUniforms.uVolleyPulse.value = Math.max(muridAnimUniforms.uVolleyPulse.value, 0.42);
          playSpatialBattleSound('rifle_murid_3d', rp, { enabled: audioActive, environment: 'gorge' });
          if (Math.random() < 0.32) {
            playSpatialBattleSound('ricochet_3d', tp, { enabled: audioActive, environment: 'gorge' });
          }
        } else {
          spawnRifleTracer(tp, rp, '#fca5a5');
          impAnimUniforms.uVolleyPulse.value = Math.max(impAnimUniforms.uVolleyPulse.value, 0.38);
          playSpatialBattleSound('rifle_imperial_3d', tp, { enabled: audioActive, environment: 'gorge' });
        }
      }

      eaglesGroup.children.forEach((eg, idx) => {
        updatePhotorealGoldenEagle(eg, tSec, idx === 0 ? riverMat.uniforms.uSunDir.value : null);
      });
      updatePhotorealSignalBeacons(gorgeBeaconGroup, tSec, st.battleTimeOfDay);

      if (tSec >= animState.nextEagleCryAt && eaglesGroup.children.length > 0) {
        animState.nextEagleCryAt = tSec + 14.0 + Math.random() * 8.0;
        const leadEagle = eaglesGroup.children[0];
        playSpatialBattleSound('eagle_cry_3d', leadEagle.position, {
          enabled: audioActive,
          environment: 'gorge'
        });
      }

      // 2. Камера + панорамирование + сейсмическая микро-дрожь (или живое сопровождение беркута в ракурсе 'eagle')
      const c = st.cam3D || { yaw: -0.54, pitch: 0.44, zoom: 1.16, cutawayRatio: 0.78, autoRotate: false };
      const liveYaw = c.autoRotate ? c.yaw + tSec * 0.22 : c.yaw;
      const dist = 28.5 / Math.max(0.65, c.zoom || 1.0);
      const horiz = Math.cos(c.pitch) * dist;
      let shakeX = 0;
      let shakeY = 0;
      if (animState.cameraShake > 0.004) {
        shakeX = Math.sin(tSec * 48) * animState.cameraShake;
        shakeY = Math.cos(tSec * 56) * animState.cameraShake * 0.7;
        animState.cameraShake = Math.max(0, animState.cameraShake - dt * 1.1);
      }
      const cutRatio = c.cutawayRatio ?? 0.98;
      const isCutawayActive = cutRatio < 0.92;
      const isEagleFocus = !isCutawayActive && st.activePreset === 'eagle' && eaglesGroup.children.length > 0;
      const isBridgeFocus =
        !isCutawayActive &&
        !isEagleFocus &&
        (st.activePreset === 'bridge' || (Math.abs(panOffsetRef.current.x) < 1.8 && c.zoom > 1.38));
      let lookX = panOffsetRef.current.x + shakeX * 0.4;
      let lookZ = panOffsetRef.current.z;
      let lookY = (isBridgeFocus ? 1.65 : citadelY * 0.56) + shakeY * 0.4;
      if (isEagleFocus) {
        const leadPos = eaglesGroup.children[0].position;
        const eagleDist = 3.85 / Math.max(0.65, c.zoom || 1.0);
        const egHoriz = Math.cos(c.pitch) * eagleDist;
        lookX = leadPos.x;
        lookY = leadPos.y - 0.08;
        lookZ = leadPos.z;
        camera.position.set(
          lookX + Math.sin(liveYaw) * egHoriz + shakeX * 0.25,
          Math.max(leadPos.y - 0.85, leadPos.y + Math.sin(c.pitch) * eagleDist) + shakeY * 0.25,
          lookZ + Math.cos(liveYaw) * egHoriz
        );
      } else {
        camera.position.set(
          lookX + Math.sin(liveYaw) * horiz + shakeX,
          (isBridgeFocus ? 1.55 : 3.8) + Math.sin(c.pitch) * dist + shakeY,
          lookZ + Math.cos(liveYaw) * horiz
        );
      }
      camera.lookAt(lookX, lookY, lookZ);
      gorgeSkyDome.position.copy(camera.position);

      // 3. Геодезический срез скалы + строго подземная привязка каземата и сапы (без выступов над рельефом!)
      // В обычной Панораме боя (cutRatio >= 0.92) ущелье бесшовно продолжается горной долиной; постамент показан только в режиме «Срез сапы»
      outerValleyMesh.visible = !isCutawayActive;
      outerTreesGroup.visible = !isCutawayActive;
      mistGroup.visible = !isCutawayActive;
      precipSys.group.visible = !isCutawayActive && curWeather !== 'clear';
      precipSys.setMode(curWeather);
      if (precipSys.group.visible) precipSys.update(tSec, lookX, lookZ);
      dioramaSurroundMesh.visible = isCutawayActive;
      plinthMesh.visible = isCutawayActive;
      brassTrimMesh.visible = isCutawayActive;
      leftWallMesh.visible = isCutawayActive;
      rightWallMesh.visible = isCutawayActive;
      backWallMesh.visible = isCutawayActive;
      const clipConst = !isCutawayActive ? 24.0 : (cutRatio - 0.5) * 26.0;
      clipPlane.constant = clipConst;
      updateCutawayStrataWall(clipConst);

      if (cutRatio < 0.96 && clipConst >= -15.5 && clipConst <= 15.5) {
        undergroundGroup.visible = true;
        undergroundGroup.position.z = clipConst + 0.06;

        const surfAulAtCut = sampleHeightAt(-5.4, clipConst);
        const blindY = Math.max(0.68, Math.min(surfAulAtCut - 1.05, citadelY - 1.55));
        const shudderOff =
          animState.blindageShudder > 0.005
            ? -Math.abs(Math.sin(tSec * 36)) * animState.blindageShudder * 0.14
            : 0;
        blindageAssembly.position.set(-5.4, blindY + shudderOff, 0);
        blindageLight.position.set(-5.4, blindY + 0.35, 1.2);
        blindageAssembly.visible = surfAulAtCut > 1.65;

        const mineDist = st.siegeState?.russianMineDistance ?? 9.5;
        const sapCenterX = -1.1 + Math.min(6.4, mineDist * 0.38);
        const surfSapAtCut = Math.min(
          sampleHeightAt(sapCenterX - 2.2, clipConst),
          sampleHeightAt(sapCenterX, clipConst),
          sampleHeightAt(sapCenterX + 2.2, clipConst)
        );
        const sapY = Math.max(0.45, surfSapAtCut - 0.62);
        sapTunnelGroup.position.set(sapCenterX, sapY, 0);
        sapTunnelGroup.visible = surfSapAtCut > 1.08;
      } else {
        undergroundGroup.visible = false;
      }

      if (animState.blindageShudder > 0.005) {
        animState.blindageShudder = Math.max(0, animState.blindageShudder - dt * 1.9);
      }

      deadZoneCone.visible = Boolean(c.showDeadZoneCone);
      wireframeMesh.visible = Boolean(c.showWireframeContours);

      // 4. Слои дубовых накатов, подсветка сектора резерва муртазеков и рябь медного таза
      const layersCount = st.siegeState?.blindageLayers ?? 3;
      blindageAssembly.children.forEach((ch) => {
        if (ch.name.startsWith('logLayer_')) {
          ch.visible = Number(ch.name.split('_')[1]) < layersCount;
        }
      });
      surfaceBlindageGroup.children.forEach((ch) => {
        if (ch.name.startsWith('surfBlindage_')) {
          ch.visible = Number(ch.name.split('_')[1]) < layersCount;
        }
      });

      const secId = st.deployedSector || 'blindage';
      const secPos =
        secId === 'citadel'
          ? [-5.5, -0.35]
          : secId === 'water_descent'
          ? [-1.4, -2.0]
          : secId === 'counter_mine'
          ? [-2.8, 0.2]
          : [-4.65, -0.35];
      sectorHighlightRing.position.set(secPos[0], sampleHeightAt(secPos[0], secPos[1]) + 0.16, secPos[1]);
      sectorHighlightRing.scale.setScalar(0.92 + Math.sin(tSec * 3.5) * 0.08);

      const mineDist = st.siegeState?.russianMineDistance ?? 9.5;
      const dangerSpeed = mineDist < 5 ? 4.2 : 2.1;
      const ripplePhase = (tSec * dangerSpeed) % 1;
      basinRipple.scale.setScalar(0.45 + ripplePhase * 1.9);
      basinRippleMat.opacity = (1 - ripplePhase) * (mineDist < 5 ? 0.95 : 0.68);

      // 5. Развевающиеся знамёна Имамата, дрейф тумана и откат бронзовых орудий
      bannerMeshes.forEach((fl) => {
        const fp = fl.geometry.attributes.position;
        for (let k = 0; k < fp.count; k++) {
          const fx = fp.getX(k);
          const wave = Math.sin(tSec * 5.2 + fx * 6.0 + fl.userData.phase) * 0.06 * (0.36 - fx);
          fp.setZ(k, wave);
        }
        fp.needsUpdate = true;
      });

      mistGroup.children.forEach((mp) => {
        mp.position.x = mp.userData.baseX + Math.sin(tSec * 0.28 + mp.userData.phase) * 0.85;
        mp.position.z = mp.userData.baseZ + Math.cos(tSec * 0.22 + mp.userData.phase) * 0.95;
      });

      if (cannonRefs.mortar) {
        const rec = animState.recoilMortar;
        cannonRefs.mortar.position.x = cannonRefs.mortar.userData.baseX + rec * 0.48;
        cannonRefs.mortar.rotation.z = -rec * 0.14;
        updateGlbArticulation(cannonRefs.mortar, {
          elapsed: tSec,
          dt,
          recoil: rec,
          elevRad: (((st.mortarAngle3D || 58) - 18) * Math.PI) / 180 * 0.45
        });
        animState.recoilMortar = Math.max(0, rec - dt * 2.4);
      }
      if (cannonRefs.unicorn) {
        const rec = animState.recoilUnicorn;
        cannonRefs.unicorn.position.x = cannonRefs.unicorn.userData.baseX + rec * 0.44;
        cannonRefs.unicorn.rotation.z = -rec * 0.11;
        updateGlbArticulation(cannonRefs.unicorn, {
          elapsed: tSec,
          dt,
          recoil: rec,
          elevRad: (((st.unicornAngle3D || 15) - 12) * Math.PI) / 180 * 0.5
        });
        animState.recoilUnicorn = Math.max(0, rec - dt * 2.6);
      }
      if (cannonRefs.flank) {
        const rec = animState.recoilFlank;
        cannonRefs.flank.position.x = cannonRefs.flank.userData.baseX + rec * 0.42;
        cannonRefs.flank.rotation.z = -rec * 0.1;
        updateGlbArticulation(cannonRefs.flank, {
          elapsed: tSec,
          dt,
          recoil: rec,
          elevRad: 0.12
        });
        animState.recoilFlank = Math.max(0, rec - dt * 2.5);
      }

      // Живое движение расчётов батарей, сапёров в апрошах и дозорных мюридов у спуска к Койсу
      gunnerCrewMeta.forEach((gm) => {
        const gunRec =
          gm.gunKey === 'mortar'
            ? animState.recoilMortar
            : gm.gunKey === 'unicorn'
            ? animState.recoilUnicorn
            : animState.recoilFlank;
        const reloadLean = gunRec < 0.15 ? Math.sin(tSec * 2.6 + gm.idx) * 0.1 : -gunRec * 0.28;
        const gx = gm.baseX - reloadLean;
        const gz = gm.baseZ;
        const gy = sampleHeightAt(gx, gz);
        dummy.position.set(gx, gy - 0.02, gz);
        dummy.rotation.set(0, -Math.PI / 2 + (gm.sideIdx === 0 ? 0.28 : -0.28), 0);
        dummy.scale.setScalar(0.92);
        dummy.updateMatrix();
        rusBodies.setMatrixAt(gm.idx, dummy.matrix);
        rusHeads.setMatrixAt(gm.idx, dummy.matrix);
        rusBayonets.setMatrixAt(gm.idx, dummy.matrix);
      });

      sapperPatrolIndices.forEach((instIdx, sSlot) => {
        const pingPong = 1 - Math.abs((((tSec * 0.18 + sSlot * 0.25) % 2) - 1));
        const segFloat = pingPong * (sapZigZag.length - 1);
        const s0 = Math.floor(segFloat);
        const s1 = Math.min(sapZigZag.length - 1, s0 + 1);
        const f = segFloat - s0;
        const px = sapZigZag[s0][0] + (sapZigZag[s1][0] - sapZigZag[s0][0]) * f;
        const pz = sapZigZag[s0][1] + (sapZigZag[s1][1] - sapZigZag[s0][1]) * f;
        const py = sampleHeightAt(px, pz);
        const dirSign = ((tSec * 0.18 + sSlot * 0.25) % 2) < 1 ? 1 : -1;
        const faceYaw =
          Math.atan2(
            (sapZigZag[s1][0] - sapZigZag[s0][0]) * dirSign,
            (sapZigZag[s1][1] - sapZigZag[s0][1]) * dirSign
          );
        dummy.position.set(px, py - 0.01 + Math.abs(Math.sin(tSec * 7.6 + sSlot)) * 0.02, pz);
        dummy.rotation.set(0, faceYaw, 0);
        dummy.scale.setScalar(0.92);
        dummy.updateMatrix();
        rusBodies.setMatrixAt(instIdx, dummy.matrix);
        rusHeads.setMatrixAt(instIdx, dummy.matrix);
        rusBayonets.setMatrixAt(instIdx, dummy.matrix);
      });
      rusBodies.instanceMatrix.needsUpdate = true;
      rusHeads.instanceMatrix.needsUpdate = true;
      rusBayonets.instanceMatrix.needsUpdate = true;

      muridPatrolIndices.forEach((instIdx, mSlot) => {
        const rawT = (tSec * 0.22 + mSlot * 0.27) % 2;
        const u = rawT < 1 ? rawT : 2 - rawT;
        const mx = -2.55 + u * 2.15;
        const mz = -1.55 - u * 0.92;
        const my = sampleHeightAt(mx, mz);
        const dirSign = rawT < 1 ? 1 : -1;
        dummy.position.set(mx, my - 0.01 + Math.abs(Math.sin(tSec * 7.8 + mSlot)) * 0.022, mz);
        dummy.rotation.set(0, Math.atan2(2.15 * dirSign, -0.92 * dirSign), 0);
        dummy.scale.setScalar(0.94);
        dummy.updateMatrix();
        muridBodies.setMatrixAt(instIdx, dummy.matrix);
        muridHeads.setMatrixAt(instIdx, dummy.matrix);
        muridRifles.setMatrixAt(instIdx, dummy.matrix);
      });
      muridBodies.instanceMatrix.needsUpdate = true;
      muridHeads.instanceMatrix.needsUpdate = true;
      muridRifles.instanceMatrix.needsUpdate = true;

      heroRefs.forEach((hr, idx) => {
        hr.position.y = hr.userData.baseY;
        updateGlbArticulation(hr, { elapsed: tSec, dt, phase: idx * 1.9, moving: false, selected: true });
      });

      marchSupportRefs.forEach((mr, idx) => {
        updateGlbArticulation(mr, { elapsed: tSec, dt, phase: idx * 1.3, moving: idx === 0 });
      });

      const clampedRiverZ = Math.max(-14, Math.min(14, lookZ));
      updateSpatialBattleScape({
        enabled: audioActive,
        mode: isForestDefile ? 'forest' : 'gorge',
        camera,
        riverPoint: isForestDefile
          ? { x: 0.0, y: 1.2, z: clampedRiverZ }
          : { x: 0.45 + Math.sin(clampedRiverZ * 0.22) * 1.05, y: 1.18, z: clampedRiverZ },
        weatherMode: isCutawayActive ? 'clear' : curWeather
      });

      // 6. Затухание вспышек, полёт трассеров штуцеров, бомб и клубов дыма
      muzzleFlashLight.intensity *= 0.82;
      impactBlastLight.intensity *= 0.86;
      if (animState.shockwaveAge >= 0) {
        animState.shockwaveAge += dt;
        const prog = animState.shockwaveAge / 0.85;
        if (prog >= 1) {
          camoufletShockRing.visible = false;
          animState.shockwaveAge = -1;
        } else {
          camoufletShockRing.scale.setScalar(0.4 + prog * 4.8);
          camoufletShockMat.opacity = (1 - prog) * 0.9;
        }
      }

      for (let tr = activeTracers.length - 1; tr >= 0; tr--) {
        const item = activeTracers[tr];
        item.progress += dt * item.speed;
        if (item.progress >= 1) {
          fxGroup.remove(item.mesh);
          item.mat.dispose();
          activeTracers.splice(tr, 1);
          continue;
        }
        item.mesh.position.lerpVectors(item.from, item.to, item.progress);
      }

      for (let s = activeShells.length - 1; s >= 0; s--) {
        const sh = activeShells[s];
        sh.progress += dt * sh.speed;
        sh.trailTimer += dt;
        const clampedU = Math.min(sh.maxProgress, sh.progress);
        const fIdx = clampedU * (sh.pts.length - 1);
        const i0 = Math.floor(fIdx);
        const i1 = Math.min(sh.pts.length - 1, i0 + 1);
        const frac = fIdx - i0;
        sh.mesh.position.lerpVectors(sh.pts[i0], sh.pts[i1], frac);

        if (sh.trailTimer > 0.042) {
          sh.trailTimer = 0;
          smokeSys.spawnSmoke({
            x: sh.mesh.position.x,
            y: sh.mesh.position.y,
            z: sh.mesh.position.z,
            vx: (Math.random() - 0.5) * 0.3,
            vy: 0.35 + Math.random() * 0.3,
            vz: (Math.random() - 0.5) * 0.3,
            scale: 0.44,
            grow: 1.0,
            gravity: -0.05,
            life: 1.25,
            flash: true,
            flashHex: '#f59e0b',
            colorHex: '#e2e8f0',
            maxOpacity: 0.44
          });
        }

        if (sh.progress >= sh.maxProgress) {
          const hitPos = sh.mesh.position.clone();
          spawnImpactExplosionFX(hitPos.x, hitPos.y, hitPos.z, sh.impactKind);
          if (sh.impactKind === 'blindage_hit') {
            animState.blindageShudder = 1.0;
            animState.cameraShake = Math.max(animState.cameraShake, 0.24);
          } else {
            animState.cameraShake = Math.max(animState.cameraShake, 0.16);
          }
          fxGroup.remove(sh.mesh);
          sh.mat.dispose();
          activeShells.splice(s, 1);
        }
      }

      smokeSys.update(dt, camera, -0.22, 0.08);

      // 7. Прицельные дуги мортиры и единорога (перестраиваются ТОЛЬКО при изменении угла наводки — 0 лишних GPU-буферов!)
      const curMortarAng = st.mortarAngle3D || 58;
      if (curMortarAng !== lastMortarAngleBuilt) {
        lastMortarAngleBuilt = curMortarAng;
        cachedMortarPts = buildArcPoints(
          curMortarAng,
          6.85,
          sampleHeightAt(7.45, -1.2) + 0.72,
          -1.2,
          -4.7,
          citadelY + 0.55,
          -0.25
        );
        mortarCurveMesh.geometry.dispose();
        mortarCurveMesh.geometry = new THREE.BufferGeometry().setFromPoints(cachedMortarPts);
      }

      const curUnicornAng = st.unicornAngle3D || 15;
      if (curUnicornAng !== lastUnicornAngleBuilt) {
        lastUnicornAngleBuilt = curUnicornAng;
        const unicornPts = buildArcPoints(
          curUnicornAng,
          7.05,
          sampleHeightAt(7.55, 1.4) + 0.62,
          1.4,
          -4.4,
          citadelY - 0.35,
          0.25
        );
        unicornCurveMesh.geometry.dispose();
        unicornCurveMesh.geometry = new THREE.BufferGeometry().setFromPoints(unicornPts);
      }

      const flyIdx = Math.floor(((tSec * 0.62) % 1) * Math.max(1, cachedMortarPts.length - 1));
      if (cachedMortarPts[flyIdx]) {
        aimMarkerGlow.position.copy(cachedMortarPts[flyIdx]);
      }

      if (postFx) {
        postFx.update({
          elapsed: tSec,
          camera,
          sunDir: riverMat.uniforms.uSunDir.value,
          sunColor: sun.color,
          weatherMode: isCutawayActive ? 'clear' : curWeather
        });
      }

      fpsGov.tick(dt);
      dom.dataset.camZoom = String((c.zoom || 1.16).toFixed(3));
      dom.dataset.camYaw = String(liveYaw.toFixed(3));

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
    animate();

    return () => {
      disposed = true;
      suspendSpatialBattleAudio();
      cancelAnimationFrame(raf);
      resizeObs.disconnect();
      touchControls.dispose();
      dom.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      dom.removeEventListener('contextmenu', onContext);
      dom.removeEventListener('wheel', onWheel);
      smokeSys.dispose();
      precipSys.dispose();
      powderSmokeTex.dispose();
      mistTex.dispose();
      activeShells.forEach((sh) => sh.mat.dispose());
      activeTracers.forEach((tr) => tr.mat.dispose());
      eaglesGroup.children.forEach(disposePhotorealEagleInstance);
      heroRefs.forEach(disposePhotorealCavalryInstance);
      Object.values(cannonRefs).forEach((c) => c && disposePhotorealCorpsInstance(c));
      marchSupportRefs.forEach(disposePhotorealCorpsInstance);
      fortressArchRefs.forEach(disposePhotorealFortressInstance);
      gorgeBeaconGroup.children.forEach(disposePhotorealNatureInstance);
      disposableBattleGeos.forEach((g) => g.dispose());
      disposableBattleMats.forEach((m) => m.dispose());
      sharedShellGeo.dispose();
      sharedTracerGeo.dispose();
      gorgeSkyDome.geometry.dispose();
      gorgeSkyDome.material.dispose();
      outerValleyMesh.geometry.dispose();
      outerValleyMesh.material.dispose();
      gorgeRidgeGeo.dispose();
      gorgeRidgeMat.dispose();
      dioramaSurroundGeo.dispose();
      dioramaSurroundMat.dispose();
      plinthGeo.dispose();
      plinthMat.dispose();
      brassTrimGeo.dispose();
      brassTrimMat.dispose();
      gorgeBumpTex.dispose();
      strataTex.dispose();
      terrainMat.dispose();
      riverGeo.dispose();
      riverMat.dispose();
      wireframeMat.dispose();
      strataMat.dispose();
      sideStrataMat.dispose();
      leftWallMesh.geometry.dispose();
      rightWallMesh.geometry.dispose();
      backWallMesh.geometry.dispose();
      trunkGeo.dispose();
      pineTrunkGeo.dispose();
      barkMats.dispose();
      beechCrownGeo.dispose();
      beechCrownMat.dispose();
      outerTrunkMat.dispose();
      outerCrownMat.dispose();
      pineGeo.dispose();
      pineMat.dispose();
      bushGeo.dispose();
      bushMat.dispose();
      beechAtlasTex.dispose();
      pineAtlasTex.dispose();
      fernAtlasTex.dispose();
      wickerGabionTex.dispose();
      rockGeo.dispose();
      rockMat.dispose();
      geo.dispose();
      strataGeo.dispose();
      mortarCurveMesh.geometry.dispose();
      unicornCurveMesh.geometry.dispose();
      scene.traverse((obj) => {
        if (obj.isInstancedMesh) obj.dispose();
      });
      if (gtaoPass) gtaoPass.dispose();
      if (postFx) postFx.dispose();
      if (composer) composer.dispose();
      pbrPack.dispose();
      renderer.dispose();
    };
  }, [selected3DTerrainId, setCam3D]);

  if (!webglReady) {
    return (
      <canvas
        ref={fallbackCanvasRef}
        width={820}
        height={460}
        onMouseDown={(e) => onPointerDownFallback && onPointerDownFallback(e.clientX, e.clientY)}
        onMouseMove={(e) => onPointerMoveFallback && onPointerMoveFallback(e.clientX, e.clientY)}
        onMouseUp={onPointerUpFallback}
        onMouseLeave={onPointerUpFallback}
        className="w-full h-auto block cursor-grab active:cursor-grabbing select-none"
      />
    );
  }

  return (
    <div
      className={`relative w-full ${
        tallCinema ? 'h-[480px] sm:h-[640px]' : 'h-[360px] sm:h-[510px]'
      } max-h-[74dvh] lg:max-h-none transition-all duration-300 select-none`}
    >
      <div ref={mountRef} className="w-full h-full block cursor-grab active:cursor-grabbing" />

      {/* Нижняя тактическая плашка быстрых ракурсов Total War, времени суток и широкого экрана */}
      <div className="absolute bottom-2 left-2 right-2 flex flex-wrap items-center justify-between gap-1.5 pointer-events-none">
        <div className="hud-mobile-scroll pointer-events-auto max-w-full overflow-x-auto flex items-center flex-nowrap lg:flex-wrap gap-1 bg-[#120e0a]/90 border border-amber-500/45 rounded-lg px-2 py-1 text-[10.5px] backdrop-blur-sm">
          {[
            ['panorama', t('⚔️ Панорама боя', '⚔️ Battle Panorama')],
            ['aul', t('🏰 Аул и сакли', '🏰 Terraced Aul')],
            ['redoubt', t('💣 Редуты РИ', '💣 Siege Redoubts')],
            ['bridge', t('🌉 Мост и река', '🌉 Bridge & Gorge')],
            ['eagle', t('🦅 Беркуты', '🦅 Eagles')],
            ['cutaway', t('⛏️ Срез сапы', '⛏️ Sap Cutaway')]
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => applyTacticalPreset(id)}
              className={`shrink-0 px-2 py-0.5 rounded font-serif font-bold cursor-pointer transition ${
                activePreset === id
                  ? 'bg-amber-500 text-stone-950'
                  : 'bg-stone-900/90 hover:bg-stone-800 text-amber-200 border border-amber-500/30'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="pointer-events-auto flex items-center gap-1 bg-[#120e0a]/90 border border-amber-500/45 rounded-lg px-1.5 py-1 text-[10.5px] backdrop-blur-sm">
          {[
            ['day', '☀️', t('День', 'Day')],
            ['sunset', '🌅', t('Закат', 'Sunset')],
            ['night', '🌙', t('Ночь', 'Night')]
          ].map(([todId, icon, label]) => (
            <button
              key={todId}
              type="button"
              title={label}
              onClick={() => setBattleTimeOfDay(todId)}
              className={`px-1.5 py-0.5 rounded font-serif font-bold cursor-pointer transition ${
                battleTimeOfDay === todId
                  ? 'bg-amber-400 text-stone-950 shadow'
                  : 'bg-stone-900/90 hover:bg-stone-800 text-amber-200 border border-amber-500/25'
              }`}
            >
              {icon}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setBattleWeather((prev) => (prev === 'clear' ? 'rain' : prev === 'rain' ? 'snow' : 'clear'))}
            className={`px-1.5 py-0.5 rounded font-serif font-bold cursor-pointer transition border ${
              battleWeather === 'rain'
                ? 'bg-sky-700 text-sky-100 border-sky-400'
                : battleWeather === 'snow'
                ? 'bg-slate-200 text-slate-950 border-white'
                : 'bg-stone-900/90 hover:bg-stone-800 text-sky-200 border-sky-500/25'
            }`}
            title={t('Погода ущелья: Ясно / Ливень / Снегопад', 'Gorge weather: Clear / Rain / Snow')}
          >
            {battleWeather === 'rain' ? '🌧️' : battleWeather === 'snow' ? '❄️' : '🌤️'}
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
            className={`px-1.5 py-0.5 rounded font-serif font-bold cursor-pointer transition border ${
              soundEnabled && spatialAudioOn
                ? 'bg-amber-500/25 text-amber-200 border-amber-400/60'
                : 'bg-stone-900/90 text-stone-400 border-stone-700'
            }`}
            title={t('Пространственный 3D-звук теснины и реки Койсу', 'Spatial 3D Gorge & Koisu River Audio')}
          >
            {soundEnabled && spatialAudioOn ? '🔊 3D' : '🔇 3D'}
          </button>
          <button
            type="button"
            onClick={() => setTallCinema((prev) => !prev)}
            className={`px-2 py-0.5 rounded font-serif font-bold cursor-pointer transition border ${
              tallCinema
                ? 'bg-emerald-500 text-stone-950 border-emerald-300'
                : 'bg-stone-900 hover:bg-stone-800 text-emerald-200 border-emerald-500/35'
            }`}
          >
            {tallCinema ? t('🗗 Компактно', '🗗 Compact') : t('🖥️ Крупный план', '🖥️ Cinema Size')}
          </button>
        </div>
      </div>
    </div>
  );
}
