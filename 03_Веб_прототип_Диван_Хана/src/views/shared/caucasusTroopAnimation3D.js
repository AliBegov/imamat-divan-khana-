// Процедурное оживление 3D-войск, конницы наибов, расчётов артиллерии, обозов и парящих беркутов (60–120 FPS):
// 1. GPU-вершинный шейдер дыхания, прицеливания, отдачи залпов, маршевого шага и кинжального броска для InstancedMesh
// 2. Шарнирный риггинг моделей Blender .glb (крылья беркутов, 4 ноги коней, шагающие колонны РИ, откат колёс и стволов орудий)
import * as THREE from 'three';
import { updatePhotorealCavalry } from './caucasusPhotorealCavalry3D.js';
import { updatePhotorealCorpsAsset } from './caucasusPhotorealColumnsArtillery3D.js';

export function createTroopAnimUniforms({
  marchAmount = 0.0,
  volleyPulse = 0.0,
  chargePulse = 0.0
} = {}) {
  return {
    uTroopTime: { value: 0.0 },
    uMarchAmount: { value: marchAmount },
    uVolleyPulse: { value: volleyPulse },
    uChargePulse: { value: chargePulse }
  };
}

/**
 * Подключает живую GPU-анимацию к MeshStandardMaterial анатомических фигурок пехоты РИ и горских мюридов.
 */
export function applyAnimatedTroopShader(
  material,
  { keyTag = 'imp', sharedUniforms = null, clipped = false } = {}
) {
  const uniforms = sharedUniforms || createTroopAnimUniforms();
  material.userData.troopAnimUniforms = uniforms;

  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTroopTime = uniforms.uTroopTime;
    shader.uniforms.uMarchAmount = uniforms.uMarchAmount;
    shader.uniforms.uVolleyPulse = uniforms.uVolleyPulse;
    shader.uniforms.uChargePulse = uniforms.uChargePulse;

    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
        attribute float aAnimPart;
        uniform float uTroopTime;
        uniform float uMarchAmount;
        uniform float uVolleyPulse;
        uniform float uChargePulse;`
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        float instSeed = 0.0;
        #ifdef USE_INSTANCING
          instSeed = fract(sin(instanceMatrix[3][0] * 12.9898 + instanceMatrix[3][2] * 78.233) * 43758.5453) * 6.2831853;
        #endif
        float breath = sin(uTroopTime * 2.35 + instSeed);
        float marchW = clamp(uMarchAmount + uChargePulse * 0.9, 0.0, 1.3);
        float strideAng = sin(uTroopTime * 7.6 + instSeed) * 0.42 * marchW;
        float idleShift = sin(uTroopTime * 1.15 + instSeed * 1.3) * 0.011 * (1.0 - min(1.0, marchW));
        float fireSlot = fract(uTroopTime * 0.22 + instSeed * 0.1591549);
        float indivKick = step(fireSlot, 0.072) * exp(-fireSlot * 46.0) * 0.52 * (1.0 - min(1.0, marchW * 0.8));
        float recoilKick = clamp(uVolleyPulse * (0.74 + 0.26 * sin(instSeed * 3.0)) + indivKick, 0.0, 1.35);

        if (aAnimPart > 0.5 && aAnimPart < 2.5) {
          float legSign = aAnimPart < 1.5 ? 1.0 : -1.0;
          float ang = strideAng * legSign;
          float ca = cos(ang);
          float sa = sin(ang);
          float dy = transformed.y - 0.155;
          float dz = transformed.z;
          transformed.y = 0.155 + dy * ca - dz * sa + max(0.0, legSign * sin(uTroopTime * 7.6 + instSeed)) * 0.018 * marchW;
          transformed.z = dy * sa + dz * ca;
        } else if (aAnimPart >= 2.5) {
          float bobY = abs(cos(uTroopTime * 7.6 + instSeed)) * 0.016 * marchW + breath * 0.0045;
          transformed.y += bobY;
          transformed.x += idleShift;
          float upperFrac = clamp((transformed.y - 0.15) * 3.2, 0.0, 1.0);
          transformed.z += (uChargePulse * 0.048 + marchW * 0.018 - recoilKick * 0.026) * upperFrac;

          if (aAnimPart > 3.5 && aAnimPart < 4.5) {
            float headYaw = sin(uTroopTime * 0.92 + instSeed * 1.7) * 0.16 * (1.0 - min(1.0, recoilKick));
            float cy = cos(headYaw);
            float sy = sin(headYaw);
            float hx = transformed.x;
            float hz = transformed.z;
            transformed.x = hx * cy + hz * sy;
            transformed.z = -hx * sy + hz * cy;
            transformed.y += recoilKick * 0.006;
          } else if (aAnimPart > 4.5) {
            float swayY = sin(uTroopTime * 1.85 + instSeed * 0.9) * 0.007;
            transformed.y += swayY + recoilKick * 0.022 - uChargePulse * 0.012;
            transformed.z += uChargePulse * 0.056 - recoilKick * 0.048 + sin(uTroopTime * 7.6 + instSeed) * 0.015 * marchW;
          }
        }`
      );
  };

  material.customProgramCacheKey = () =>
    `imamat_troop_anim_${keyTag}_${clipped ? 'clip' : 'noclip'}_v1`;
  return material;
}

function reparentIntoPivot(rootObj, matchFn, px, py, pz) {
  const matched = [];
  rootObj.traverse((node) => {
    if (node !== rootObj && matchFn(node.name || '')) {
      matched.push(node);
    }
  });
  if (matched.length === 0) return null;

  const commonParent = matched[0].parent;
  if (!commonParent) return null;

  const pivot = new THREE.Group();
  pivot.position.set(px, py, pz);
  commonParent.add(pivot);

  matched.forEach((node) => {
    if (node.parent === commonParent) {
      node.position.x -= px;
      node.position.y -= py;
      node.position.z -= pz;
      pivot.add(node);
    }
  });
  return pivot;
}

/**
 * Создаёт шарнирные узлы вращения внутри клонированной GLB-сцены без дополнительных draw-вызовов.
 */
export function rigGlbArticulation(rootObj, modelKey) {
  if (!rootObj) return null;
  if (rootObj.userData?.articulationRig) return rootObj.userData.articulationRig;

  let rig = null;

  if (modelKey === 'golden_eagle') {
    const wingL = reparentIntoPivot(rootObj, (n) => n === 'WingL', -0.12, 0.05, -0.02);
    const wingR = reparentIntoPivot(rootObj, (n) => n === 'WingR', 0.12, 0.05, -0.02);
    const tail = reparentIntoPivot(rootObj, (n) => n === 'TailFan', 0.0, 0.01, -0.34);
    const head = reparentIntoPivot(rootObj, (n) => n === 'EagleHead', 0.0, 0.05, 0.34);
    rig = { kind: 'eagle', wingL, wingR, tail, head };
  } else if (
    modelKey === 'hero_hadji_murat' ||
    modelKey === 'hero_baysungur' ||
    modelKey === 'cavalry_naib'
  ) {
    const flSet = new Set(['LegU_FL', 'LegL_FL', 'Hoof_FL']);
    const frSet = new Set(['LegU_FR', 'LegL_FR', 'Hoof_FR']);
    const blSet = new Set(['LegU_BL', 'LegL_BL', 'Hoof_BL']);
    const brSet = new Set(['LegU_BR', 'LegL_BR', 'Hoof_BR']);
    const neckSet = new Set(['HorseNeck', 'HorseHead', 'HorseEarL', 'HorseEarR', 'HorseMane']);

    const legFL = reparentIntoPivot(rootObj, (n) => flSet.has(n), -0.16, 0.9, 0.38);
    const legFR = reparentIntoPivot(rootObj, (n) => frSet.has(n), 0.16, 0.9, 0.38);
    const legBL = reparentIntoPivot(rootObj, (n) => blSet.has(n), -0.16, 0.74, -0.4);
    const legBR = reparentIntoPivot(rootObj, (n) => brSet.has(n), 0.16, 0.74, -0.4);
    const neckHead = reparentIntoPivot(rootObj, (n) => neckSet.has(n), 0.0, 1.22, 0.42);
    const tail = reparentIntoPivot(rootObj, (n) => n === 'HorseTail', 0.0, 0.78, -0.6);
    const swordArm = reparentIntoPivot(
      rootObj,
      (n) => n === 'ArmRight' || n === 'ShashkaBlade',
      0.14,
      1.56,
      0.02
    );

    const banners = [];
    rootObj.traverse((node) => {
      if (node.name && node.name.startsWith('WavingBanner_')) {
        banners.push({
          node,
          baseX: node.position.x,
          idx: Number(node.name.split('_')[1]) || 0
        });
      }
    });

    rig = {
      kind: 'cavalry',
      legFL,
      legFR,
      legBL,
      legBR,
      neckHead,
      tail,
      swordArm,
      banners
    };
  } else if (modelKey === 'imperial_column') {
    const rawLegsL = [];
    const rawLegsR = [];
    const rawMuskets = [];
    const flags = [];

    rootObj.traverse((node) => {
      const nm = node.name || '';
      if (nm.startsWith('LegL_')) rawLegsL.push(node);
      else if (nm.startsWith('LegR_')) rawLegsR.push(node);
      else if (nm.startsWith('Musket_')) rawMuskets.push(node);
      else if (nm.startsWith('RegimentFlag')) {
        flags.push({ node, baseX: node.position.x });
      }
    });

    const wrapSinglePivot = (node, py) => {
      if (!node.parent) return null;
      const p = new THREE.Group();
      p.position.set(node.position.x, py, node.position.z);
      node.parent.add(p);
      node.position.set(0, node.position.y - py, 0);
      p.add(node);
      return p;
    };

    const legsL = rawLegsL.map((n) => wrapSinglePivot(n, 0.42)).filter(Boolean);
    const legsR = rawLegsR.map((n) => wrapSinglePivot(n, 0.42)).filter(Boolean);
    const muskets = rawMuskets.map((n) => wrapSinglePivot(n, 0.82)).filter(Boolean);

    rig = { kind: 'column', legsL, legsR, muskets, flags };
  } else if (modelKey === 'unicorn_cannon') {
    const wheelL = reparentIntoPivot(rootObj, (n) => n.startsWith('WheelL_'), -0.42, 0.44, 0.1);
    const wheelR = reparentIntoPivot(rootObj, (n) => n.startsWith('WheelR_'), 0.42, 0.44, 0.1);
    const barrel = reparentIntoPivot(
      rootObj,
      (n) => n === 'BronzeBarrel' || n === 'BreechCascabel',
      0.0,
      0.48,
      0.08
    );
    rig = { kind: 'cannon', wheelL, wheelR, barrel, wheelSpin: 0 };
  } else if (modelKey === 'supply_wagon') {
    const findHubPos = (prefix, fallback) => {
      let pos = null;
      rootObj.traverse((n) => {
        if (n.name === `${prefix}_Hub`) {
          pos = [n.position.x, n.position.y, n.position.z];
        }
      });
      return pos || fallback;
    };
    const [flX, flY, flZ] = findHubPos('WFL', [-0.36, 0.24, 0.38]);
    const [frX, frY, frZ] = findHubPos('WFR', [0.36, 0.24, 0.38]);
    const [blX, blY, blZ] = findHubPos('WBL', [-0.36, 0.24, -0.38]);
    const [brX, brY, brZ] = findHubPos('WBR', [0.36, 0.24, -0.38]);

    const wheels = [
      reparentIntoPivot(rootObj, (n) => n.startsWith('WFL_'), flX, flY, flZ),
      reparentIntoPivot(rootObj, (n) => n.startsWith('WFR_'), frX, frY, frZ),
      reparentIntoPivot(rootObj, (n) => n.startsWith('WBL_'), blX, blY, blZ),
      reparentIntoPivot(rootObj, (n) => n.startsWith('WBR_'), brX, brY, brZ)
    ].filter(Boolean);
    rig = { kind: 'wagon', wheels, wheelSpin: 0 };
  }

  if (rig) {
    rootObj.userData = rootObj.userData || {};
    rootObj.userData.articulationRig = rig;
  }
  return rig;
}

/**
 * Обновляет шарнирную анимацию ригованного объекта за O(1).
 */
export function updateGlbArticulation(
  rootObj,
  {
    elapsed = 0,
    dt = 0.016,
    phase = 0,
    moving = false,
    selected = false,
    recoil = 0,
    elevRad = 0,
    slopePitch = 0,
    slopeRoll = 0
  } = {}
) {
  if (rootObj?.userData?.photorealCavalryRig) {
    updatePhotorealCavalry(rootObj, { elapsed, dt, phase, moving, selected, slopePitch, slopeRoll });
    return;
  }
  if (rootObj?.userData?.photorealCorpsRig) {
    updatePhotorealCorpsAsset(rootObj, { elapsed, dt, phase, moving, recoil, elevRad });
    return;
  }
  const rig = rootObj?.userData?.articulationRig;
  if (!rig) return;

  if (rig.kind === 'eagle') {
    // 7.2-секундный цикл кавказского беркута: 3 взмаха крыльями -> плавное парение в восходящем потоке
    const cycle = (elapsed + phase * 1.7) % 7.2;
    let flap = 0.06 + Math.sin(elapsed * 5.8 + phase) * 0.025;
    if (cycle < 2.25) {
      const env = Math.sin((cycle / 2.25) * Math.PI);
      flap = Math.sin((cycle / 2.25) * Math.PI * 6.0) * 0.44 * env + 0.05;
    }
    if (rig.wingL) rig.wingL.rotation.z = flap;
    if (rig.wingR) rig.wingR.rotation.z = -flap;
    if (rig.tail) rig.tail.rotation.x = Math.sin(elapsed * 2.1 + phase) * 0.08 - flap * 0.12;
    if (rig.head) rig.head.rotation.y = Math.sin(elapsed * 1.3 + phase) * 0.18;
  } else if (rig.kind === 'cavalry') {
    if (moving) {
      // Четырёхтактный галоп с противофазой передней и задней пар ног
      const g = elapsed * 13.0 + phase;
      if (rig.legFL) rig.legFL.rotation.x = Math.sin(g) * 0.52;
      if (rig.legFR) rig.legFR.rotation.x = Math.sin(g + 0.85) * 0.52;
      if (rig.legBL) rig.legBL.rotation.x = Math.sin(g + 3.2) * 0.48;
      if (rig.legBR) rig.legBR.rotation.x = Math.sin(g + 4.05) * 0.48;
      if (rig.neckHead) {
        rig.neckHead.rotation.x = Math.sin(g + 1.4) * 0.14;
        rig.neckHead.rotation.y = 0;
      }
      if (rig.tail) {
        rig.tail.rotation.x = -0.36 + Math.sin(g * 1.2) * 0.16;
        rig.tail.rotation.z = Math.cos(g * 0.8) * 0.08;
      }
      if (rig.swordArm) {
        rig.swordArm.rotation.x = -0.28 + Math.sin(g) * 0.12;
      }
    } else {
      // Дыхание боевого коня, поворот шеи, отмахивание хвостом и нетерпеливый переступ копытом
      const pawRaw = Math.max(0, Math.sin(elapsed * 1.45 + phase * 2.1));
      const paw = Math.pow(pawRaw, 5.0) * 0.32;
      if (rig.legFL) rig.legFL.rotation.x = 0;
      if (rig.legFR) rig.legFR.rotation.x = -paw;
      if (rig.legBL) rig.legBL.rotation.x = 0;
      if (rig.legBR) rig.legBR.rotation.x = 0;
      if (rig.neckHead) {
        rig.neckHead.rotation.x = Math.sin(elapsed * 1.9 + phase) * 0.06 + paw * 0.18;
        rig.neckHead.rotation.y = Math.sin(elapsed * 0.85 + phase * 1.3) * 0.14;
      }
      if (rig.tail) {
        rig.tail.rotation.x = -0.06 + Math.sin(elapsed * 2.2 + phase) * 0.05;
        rig.tail.rotation.z = Math.sin(elapsed * 1.7 + phase * 2.4) * 0.14;
      }
      if (rig.swordArm) {
        rig.swordArm.rotation.x = selected
          ? -0.45 + Math.sin(elapsed * 3.2) * 0.08
          : Math.sin(elapsed * 1.6 + phase) * 0.04;
      }
    }

    rig.banners.forEach((b) => {
      b.node.position.x =
        b.baseX + Math.sin(elapsed * 5.6 + phase - b.idx * 0.9) * (0.025 + b.idx * 0.022);
      b.node.rotation.y = Math.cos(elapsed * 5.2 + phase - b.idx * 0.8) * 0.14;
    });
  } else if (rig.kind === 'column') {
    const cadence = moving ? Math.sin(elapsed * 9.5 + phase) * 0.4 : 0;
    rig.legsL.forEach((p, idx) => {
      const off = moving ? Math.sin(elapsed * 9.5 + phase + (idx % 2) * 0.25) * 0.42 : 0;
      p.rotation.x = off;
    });
    rig.legsR.forEach((p, idx) => {
      const off = moving ? -Math.sin(elapsed * 9.5 + phase + (idx % 2) * 0.25) * 0.42 : 0;
      p.rotation.x = off;
    });
    rig.muskets.forEach((m, idx) => {
      m.rotation.x = moving
        ? cadence * 0.12
        : Math.sin(elapsed * 1.7 + phase + idx * 0.6) * 0.035;
    });
    rig.flags.forEach((f, idx) => {
      f.node.rotation.y = Math.sin(elapsed * 4.8 + phase + idx) * 0.22;
      f.node.position.x = f.baseX + Math.cos(elapsed * 4.8 + phase + idx) * 0.02;
    });
  } else if (rig.kind === 'cannon') {
    if (moving) {
      rig.wheelSpin += dt * 4.8;
    }
    const wheelRot = rig.wheelSpin - recoil * 1.25;
    if (rig.wheelL) rig.wheelL.rotation.x = wheelRot;
    if (rig.wheelR) rig.wheelR.rotation.x = wheelRot;
    if (rig.barrel) {
      rig.barrel.rotation.x = -elevRad - recoil * 0.16;
      rig.barrel.position.z = 0.08 - recoil * 0.12;
    }
  } else if (rig.kind === 'wagon') {
    if (moving) {
      rig.wheelSpin += dt * 5.6;
    }
    rig.wheels.forEach((w) => {
      w.rotation.x = rig.wheelSpin;
    });
  }
}
