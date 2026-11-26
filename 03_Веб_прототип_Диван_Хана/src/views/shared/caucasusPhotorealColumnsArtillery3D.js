// ============================================================================
// АНАТОМИЧЕСКИЕ КОЛОННЫ ПЕХОТЫ РИ, ГОРНЫЕ ЕДИНОРОГИ И СУХАРНЫЕ ОБОЗЫ (1845–1859)
// 1. Процедурный PBR-атлас 2048×2048 (диффуз + альфа + карта нормалей + шероховатость):
//    - николаевское тёмно-зелёное мундирное сукно с алой выпушкой и пуговицами;
//    - грубое серое шинельное сукно скаток через левое плечо;
//    - небелёная парусина сухарного фургона со швами и верёвочной шнуровкой;
//    - окованный железом горный дуб/ясень лафетов, ступиц, спиц и бортов повозок;
//    - чёрная лакированная кожа кавказских киверов обр. 1844–1845 гг. и белые портупеи;
//    - литая орудийная бронза единорогов Шувалова с чеканным орлом;
//    - воронованая кованая сталь трёхгранных штыков, шин колёс и оковки;
//    - полковое Георгиевское знамя Отдельного Кавказского корпуса.
// 2. Три полностью артикулированные музейные 3D-сборки (все ориентированы вперёд по +Z):
//    - createPhotorealImperialColumnInstance(): 9 фигур в строю (офицер с обнажённой
//      пехотной саблей обр. 1827 г. и эполетами, знамёнщик с развевающимся полковым
//      знаменем, ротный барабанщик с медным барабаном и 6 гренадер/егерей в двух
//      шеренгах со скрещёнными портупеями, ранцами, скатками шинелей и трёхгранными штыками);
//    - createPhotorealUnicornCannonInstance(): горный 1/4-пудовый бронзовый единорог
//      (литой ствол с винградом, дельфинами, фризами и дульным раструбом, подъёмный
//      винт, окованный двухстанинный лафет, банник/прибойник, два 12-спицевых колеса
//      в железных шинах, зарядный ящик и пирамидка чугунных гранат);
//    - createPhotorealSupplyWagonInstance(): упряжной конь в хомуте, оглоблях и высокой
//      русской дуге + ездовой фурштата на козлах + 4-колёсный крытый парусиной сухарный
//      фургон с обручами, бочонками сухарей/пороха и дегтярницей под задней осью.
// ============================================================================
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

let cachedCorpsAssets = null;

function remapUVRect(geo, u0, v0, u1, v1) {
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

function ensureNonIndexedWithUV(geo) {
  const g = geo.index ? geo.toNonIndexed() : geo;
  if (!g.attributes.uv) {
    g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
  }
  if (!g.attributes.normal) {
    g.computeVertexNormals();
  }
  return g;
}

// Горизонтальная лофтинговая труба вдоль оси Z (сечения в XY: ствол единорога, корпус упряжного коня, тент фургона)
function buildHorizontalTubeGeo(slices, radialSegs = 18, u0 = 0.02, v0 = 0.53, u1 = 0.23, v1 = 0.97) {
  const ringCount = slices.length;
  const cols = radialSegs + 1;
  const positions = [];
  const uvs = [];
  const indices = [];
  const goingForward = slices[ringCount - 1].cz >= slices[0].cz;

  for (let i = 0; i < ringCount; i++) {
    const s = slices[i];
    const vFrac = ringCount > 1 ? i / (ringCount - 1) : 0;
    for (let j = 0; j <= radialSegs; j++) {
      const uFrac = j / radialSegs;
      const ang = uFrac * Math.PI * 2;
      const sinA = Math.sin(ang);
      const cosA = Math.cos(ang);
      let rx = s.rx ?? s.r ?? 0.05;
      const ry = cosA >= 0 ? (s.ryTop ?? s.ry ?? s.r ?? rx) : (s.ryBot ?? s.ry ?? s.r ?? rx);
      if (s.flatBottom && cosA < 0) {
        positions.push((s.cx || 0) + sinA * rx, s.cy + Math.max(-s.flatBottom, cosA * ry), s.cz);
      } else {
        positions.push((s.cx || 0) + sinA * rx, (s.cy || 0) + cosA * ry, s.cz);
      }
      uvs.push(u0 + uFrac * (u1 - u0), v0 + vFrac * (v1 - v0));
    }
  }

  for (let i = 0; i < ringCount - 1; i++) {
    for (let j = 0; j < radialSegs; j++) {
      const a = i * cols + j;
      const b = (i + 1) * cols + j;
      const c = (i + 1) * cols + (j + 1);
      const d = i * cols + (j + 1);
      if (goingForward) {
        indices.push(a, b, d, b, c, d);
      } else {
        indices.push(a, d, b, d, c, b);
      }
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return ensureNonIndexedWithUV(geo);
}

// Вертикальная лофтинговая труба вдоль оси Y (горизонтальные сечения в XZ: мундиры, кивера, ноги солдат и упряжных коней)
function buildVerticalTubeGeo(slices, radialSegs = 14, u0 = 0.02, v0 = 0.53, u1 = 0.23, v1 = 0.97) {
  const ringCount = slices.length;
  const cols = radialSegs + 1;
  const positions = [];
  const uvs = [];
  const indices = [];
  const goingUp = slices[ringCount - 1].cy >= slices[0].cy;

  for (let i = 0; i < ringCount; i++) {
    const s = slices[i];
    const vFrac = ringCount > 1 ? i / (ringCount - 1) : 0;
    for (let j = 0; j <= radialSegs; j++) {
      const uFrac = j / radialSegs;
      const ang = uFrac * Math.PI * 2;
      const sinA = Math.sin(ang);
      const cosA = Math.cos(ang);
      const rx = s.rx ?? s.r ?? 0.04;
      const rz = cosA >= 0 ? (s.rzF ?? s.rz ?? s.r ?? rx) : (s.rzB ?? s.rz ?? s.r ?? rx);
      positions.push((s.cx || 0) + sinA * rx, s.cy, (s.cz || 0) + cosA * rz);
      uvs.push(u0 + uFrac * (u1 - u0), v0 + vFrac * (v1 - v0));
    }
  }

  for (let i = 0; i < ringCount - 1; i++) {
    for (let j = 0; j < radialSegs; j++) {
      const a = i * cols + j;
      const b = (i + 1) * cols + j;
      const c = (i + 1) * cols + (j + 1);
      const d = i * cols + (j + 1);
      if (goingUp) {
        indices.push(a, d, b, d, c, b);
      } else {
        indices.push(a, b, d, b, c, d);
      }
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return ensureNonIndexedWithUV(geo);
}

function buildLimbCylGeo(p0, p1, rStart, rEnd, u0, v0, u1, v1, segs = 8) {
  const vStart = new THREE.Vector3(...p0);
  const vEnd = new THREE.Vector3(...p1);
  const dir = new THREE.Vector3().subVectors(vEnd, vStart);
  const len = dir.length();
  const cyl = new THREE.CylinderGeometry(rEnd, rStart, len + 0.012, segs);
  const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  const mid = new THREE.Vector3().addVectors(vStart, vEnd).multiplyScalar(0.5);
  cyl.applyMatrix4(new THREE.Matrix4().compose(mid, quat, new THREE.Vector3(1, 1, 1)));
  remapUVRect(cyl, u0, v0, u1, v1);
  return ensureNonIndexedWithUV(cyl);
}

function createImperialCorpsPbrAtlas() {
  const W = 2048;
  const H = 2048;

  const diffCanvas = document.createElement('canvas');
  diffCanvas.width = W;
  diffCanvas.height = H;
  const ctx = diffCanvas.getContext('2d');

  const normCanvas = document.createElement('canvas');
  normCanvas.width = W;
  normCanvas.height = H;
  const nctx = normCanvas.getContext('2d');
  nctx.fillStyle = 'rgb(128, 128, 255)';
  nctx.fillRect(0, 0, W, H);

  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = W;
  roughCanvas.height = H;
  const rctx = roughCanvas.getContext('2d');
  rctx.fillStyle = 'rgb(195, 195, 195)';
  rctx.fillRect(0, 0, W, H);

  // ==========================================================================
  // Q1-A [x:0..512, y:0..992] -> u:[0.02..0.23], v:[0.53..0.98]
  // Тёмно-зелёное мундирное сукно Отдельного Кавказского корпуса (1845 г.)
  // ==========================================================================
  const greenWool = ctx.createLinearGradient(0, 0, 0, 992);
  greenWool.addColorStop(0.0, '#182b1f');
  greenWool.addColorStop(0.5, '#1d3526');
  greenWool.addColorStop(1.0, '#122218');
  ctx.fillStyle = greenWool;
  ctx.fillRect(0, 0, 512, 992);

  for (let y = 0; y < 992; y += 5) {
    ctx.strokeStyle = y % 10 === 0 ? 'rgba(10, 18, 12, 0.26)' : 'rgba(65, 98, 74, 0.16)';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y + 48);
    ctx.stroke();

    nctx.strokeStyle = y % 10 === 0 ? 'rgb(118, 138, 250)' : 'rgb(138, 120, 250)';
    nctx.lineWidth = 2.0;
    nctx.beginPath();
    ctx.moveTo(0, y);
    nctx.moveTo(0, y);
    nctx.lineTo(512, y + 48);
    nctx.stroke();
  }
  rctx.fillStyle = 'rgb(222, 222, 222)';
  rctx.fillRect(0, 0, 512, 992);

  // ==========================================================================
  // Q1-B [x:512..1024, y:0..992] -> u:[0.27..0.48], v:[0.53..0.98]
  // Грубое серо-шинельное сукно скатки через плечо и шинелей ездовых
  // ==========================================================================
  const coatGrey = ctx.createLinearGradient(512, 0, 1024, 992);
  coatGrey.addColorStop(0.0, '#78756e');
  coatGrey.addColorStop(0.5, '#8a867e');
  coatGrey.addColorStop(1.0, '#68655e');
  ctx.fillStyle = coatGrey;
  ctx.fillRect(512, 0, 512, 992);

  for (let i = 0; i < 1100; i++) {
    const gx = 514 + ((i * 53) % 506);
    const gy = (i * 37) % 986;
    ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.12)' : 'rgba(35,32,28,0.16)';
    ctx.fillRect(gx, gy, 4, 3);
    nctx.fillStyle = i % 2 === 0 ? 'rgb(140, 128, 248)' : 'rgb(116, 132, 248)';
    nctx.fillRect(gx, gy, 4, 3);
  }
  // Поперечные кожаные ремешки перетяжки скатки шинели
  for (let s = 140; s < 900; s += 190) {
    ctx.fillStyle = '#3b2415';
    ctx.fillRect(512, s, 512, 16);
    nctx.fillStyle = 'rgb(128, 156, 246)';
    nctx.fillRect(512, s, 512, 8);
  }
  rctx.fillStyle = 'rgb(234, 234, 234)';
  rctx.fillRect(512, 0, 512, 992);

  // ==========================================================================
  // Q2-A [x:1024..1536, y:0..992] -> u:[0.52..0.73], v:[0.53..0.98]
  // Небелёная парусина сухарного фургона Воронцова (швы полотнищ и походная пыль)
  // ==========================================================================
  const canvasGrad = ctx.createLinearGradient(1024, 0, 1024, 992);
  canvasGrad.addColorStop(0.0, '#ebe5d5');
  canvasGrad.addColorStop(0.65, '#ded5c0');
  canvasGrad.addColorStop(1.0, '#b8ab92'); // дорожная пыль по нижнему краю тента
  ctx.fillStyle = canvasGrad;
  ctx.fillRect(1024, 0, 512, 992);

  // Холщовое переплетение нитей + швы между полотнищами парусины
  for (let y = 0; y < 992; y += 6) {
    ctx.strokeStyle = 'rgba(110, 98, 78, 0.14)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(1024, y);
    ctx.lineTo(1536, y);
    ctx.stroke();
  }
  for (let seamX = 1110; seamX < 1520; seamX += 96) {
    ctx.strokeStyle = 'rgba(92, 78, 58, 0.42)';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(seamX, 0);
    ctx.lineTo(seamX, 992);
    ctx.stroke();

    nctx.strokeStyle = 'rgb(154, 128, 246)';
    nctx.lineWidth = 5.0;
    nctx.beginPath();
    nctx.moveTo(seamX, 0);
    nctx.lineTo(seamX, 992);
    nctx.stroke();
  }
  rctx.fillStyle = 'rgb(228, 228, 228)';
  rctx.fillRect(1024, 0, 512, 992);

  // ==========================================================================
  // Q2-B [x:1536..2048, y:0..992] -> u:[0.77..0.98], v:[0.53..0.98]
  // Горный дуб / ясень лафетов, спиц и бортов фургонов с заклёпками
  // ==========================================================================
  const woodGrad = ctx.createLinearGradient(1536, 0, 2048, 0);
  woodGrad.addColorStop(0.0, '#5a3e26');
  woodGrad.addColorStop(0.5, '#6b4b2e');
  woodGrad.addColorStop(1.0, '#4b321d');
  ctx.fillStyle = woodGrad;
  ctx.fillRect(1536, 0, 512, 992);

  for (let b = 0; b < 8; b++) {
    const bx = 1536 + b * 64;
    ctx.strokeStyle = 'rgba(28, 16, 8, 0.48)';
    ctx.lineWidth = 3;
    ctx.strokeRect(bx, 0, 64, 992);
    nctx.strokeStyle = 'rgb(102, 128, 246)';
    nctx.lineWidth = 4;
    nctx.strokeRect(bx, 0, 64, 992);
  }
  for (let g = 0; g < 650; g++) {
    const wx = 1538 + ((g * 43) % 506);
    const wy = (g * 29) % 960;
    ctx.strokeStyle = g % 2 === 0 ? 'rgba(35, 20, 10, 0.25)' : 'rgba(155, 118, 76, 0.16)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(wx, wy);
    ctx.lineTo(wx, wy + 28);
    ctx.stroke();
  }
  rctx.fillStyle = 'rgb(186, 186, 186)';
  rctx.fillRect(1536, 0, 512, 992);

  // Прозрачный буфер безопасности mipmap посередине атласа
  ctx.clearRect(0, 994, W, 62);

  // ==========================================================================
  // Q3-A [x:0..512, y:1060..2048] -> u:[0.02..0.23], v:[0.02..0.46]
  // Чёрная лакированная кожа киверов/ранцев/сапог (левая половина) и белые портупеи (правая)
  // ==========================================================================
  ctx.fillStyle = '#18181b';
  ctx.fillRect(0, 1060, 256, 988);
  rctx.fillStyle = 'rgb(96, 96, 96)'; // глянцевая лакированная кожа кивера
  rctx.fillRect(0, 1060, 256, 988);

  ctx.fillStyle = '#f1eee6';
  ctx.fillRect(256, 1060, 256, 988);
  rctx.fillStyle = 'rgb(182, 182, 182)'; // белёная лосиная кожа портупей
  rctx.fillRect(256, 1060, 256, 988);

  // ==========================================================================
  // Q3-B [x:512..1024, y:1060..2048] -> u:[0.27..0.48], v:[0.02..0.46]
  // Литая артиллерийская бронза горного единорога Шувалова с чеканным орлом и патиной
  // ==========================================================================
  const bronzeGrad = ctx.createLinearGradient(512, 1060, 1024, 2048);
  bronzeGrad.addColorStop(0.0, '#d6a347');
  bronzeGrad.addColorStop(0.45, '#b8832c');
  bronzeGrad.addColorStop(0.82, '#8d5f1c');
  bronzeGrad.addColorStop(1.0, '#694716');
  ctx.fillStyle = bronzeGrad;
  ctx.fillRect(512, 1060, 512, 988);

  // Гравированные фризы и чеканный герб на казённой части бронзового ствола
  for (let fy = 1180; fy <= 1920; fy += 185) {
    ctx.strokeStyle = 'rgba(255, 232, 162, 0.45)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(512, fy);
    ctx.lineTo(1024, fy);
    ctx.stroke();

    nctx.strokeStyle = 'rgb(128, 166, 246)';
    nctx.lineWidth = 7;
    nctx.beginPath();
    nctx.moveTo(512, fy);
    nctx.lineTo(1024, fy);
    nctx.stroke();
  }
  rctx.fillStyle = 'rgb(74, 74, 74)'; // благородный металлический блеск бронзы
  rctx.fillRect(512, 1060, 512, 988);

  // ==========================================================================
  // Q4-A [x:1024..1536, y:1060..2048] -> u:[0.52..0.73], v:[0.02..0.46]
  // Кованая сталь штыков (верх) и тёмное воронованое железо шин/оковки лафета (низ)
  // ==========================================================================
  ctx.fillStyle = '#dce3ec';
  ctx.fillRect(1024, 1060, 512, 480);
  rctx.fillStyle = 'rgb(52, 52, 52)';
  rctx.fillRect(1024, 1060, 512, 480);

  ctx.fillStyle = '#272a30';
  ctx.fillRect(1024, 1540, 512, 508);
  rctx.fillStyle = 'rgb(112, 112, 112)';
  rctx.fillRect(1024, 1540, 512, 508);

  // ==========================================================================
  // Q4-B [x:1536..2048, y:1060..2048] -> u:[0.76..0.99], v:[0.02..0.46]
  // Полковое Георгиевское знамя Кавказского корпуса (бело-зелёно-золотой крест и орёл)
  // ==========================================================================
  ctx.fillStyle = '#14532d'; // зелёные углы полкового знамени
  ctx.fillRect(1536, 1060, 512, 988);

  // Прямой белый георгиевский крест
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(1736, 1060, 112, 988);
  ctx.fillRect(1536, 1490, 512, 128);

  // Оранжево-чёрная георгиевская кайма и золотой медальон с двуглавым орлом в центре
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 18;
  ctx.strokeRect(1548, 1072, 488, 964);

  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.arc(1792, 1554, 86, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#18181b';
  ctx.beginPath();
  ctx.arc(1792, 1554, 52, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = 8;
  ctx.stroke();

  rctx.fillStyle = 'rgb(168, 168, 168)';
  rctx.fillRect(1536, 1060, 512, 988);

  const diffTex = new THREE.CanvasTexture(diffCanvas);
  diffTex.colorSpace = THREE.SRGBColorSpace;
  diffTex.anisotropy = 8;
  diffTex.needsUpdate = true;

  const normTex = new THREE.CanvasTexture(normCanvas);
  normTex.anisotropy = 4;
  normTex.needsUpdate = true;

  const roughTex = new THREE.CanvasTexture(roughCanvas);
  roughTex.anisotropy = 4;
  roughTex.needsUpdate = true;

  return { diffTex, normTex, roughTex };
}

// 12-спицевое деревянное колесо в кованой железной шине (ось вращения вдоль X в (0,0,0)!)
function buildSpokedArtilleryWheelGeo({ radius = 0.34, width = 0.046, spokes = 12 } = {}) {
  const woodParts = [];
  const ironParts = [];

  // Железная шина снаружи деревянного обода
  const ironTyre = new THREE.TorusGeometry(radius, width * 0.28, 8, 24);
  ironTyre.rotateY(Math.PI * 0.5);
  ironTyre.scale(1.35, 1.0, 1.0);
  remapUVRect(ironTyre, 0.54, 0.04, 0.71, 0.22);
  ironParts.push(ensureNonIndexedWithUV(ironTyre));

  // Деревянный обод (косяки)
  const woodFelloe = new THREE.TorusGeometry(radius * 0.91, width * 0.48, 8, 24);
  woodFelloe.rotateY(Math.PI * 0.5);
  woodFelloe.scale(1.25, 1.0, 1.0);
  remapUVRect(woodFelloe, 0.78, 0.56, 0.96, 0.94);
  woodParts.push(ensureNonIndexedWithUV(woodFelloe));

  // Массивная деревянная ступица и стальные бугели с осевой чекой
  const hubWood = new THREE.CylinderGeometry(radius * 0.21, radius * 0.21, width * 2.45, 12);
  hubWood.rotateZ(Math.PI * 0.5);
  remapUVRect(hubWood, 0.78, 0.56, 0.96, 0.94);
  woodParts.push(ensureNonIndexedWithUV(hubWood));

  const hubIronBand = new THREE.CylinderGeometry(radius * 0.225, radius * 0.225, width * 1.15, 12);
  hubIronBand.rotateZ(Math.PI * 0.5);
  remapUVRect(hubIronBand, 0.54, 0.04, 0.71, 0.22);
  ironParts.push(ensureNonIndexedWithUV(hubIronBand));

  // Точёные радиальные спицы
  const spokeLen = radius * 0.76;
  for (let s = 0; s < spokes; s++) {
    const ang = (s / spokes) * Math.PI * 2;
    const sp = new THREE.CylinderGeometry(width * 0.22, width * 0.30, spokeLen, 6);
    sp.translate(0, radius * 0.14 + spokeLen * 0.5, 0);
    sp.rotateX(ang);
    remapUVRect(sp, 0.78, 0.56, 0.96, 0.94);
    woodParts.push(ensureNonIndexedWithUV(sp));
  }

  return {
    woodGeo: mergeGeometries(woodParts, false),
    ironGeo: mergeGeometries(ironParts, false)
  };
}

function buildSharedCorpsGeometries() {
  // ==========================================================================
  // А. СОЛДАТЫ И ОФИЦЕР ОТДЕЛЬНОГО КАВКАЗСКОГО КОРПУСА (1845 г., стопы на y=0, рост ~1.08)
  // ==========================================================================
  // 1. Нога солдата (относительно тазобедренного шарнира y=0.46: бедро -> голень -> сапог до dy=-0.46 -> y=0.0!)
  const legBootGeo = buildVerticalTubeGeo(
    [
      { cy: 0.02, rx: 0.001, rz: 0.001 },
      { cy: 0.0, rx: 0.048, rzF: 0.052, rzB: 0.054 },
      { cy: -0.21, rx: 0.038, rz: 0.040 }, // колено
      { cy: -0.39, rx: 0.032, rz: 0.035 }, // голенище сапога
      { cy: -0.44, rx: 0.034, rzF: 0.058, rzB: 0.036 }, // носок сапога (+Z) и каблук (-Z)
      { cy: -0.46, cz: 0.012, rx: 0.032, rzF: 0.055, rzB: 0.034 },
      { cy: -0.462, cz: 0.012, rx: 0.001, rz: 0.001 }
    ],
    10,
    0.03,
    0.05,
    0.12,
    0.42
  );

  // 2. Мундир николаевского пехотинца: расклёшенные фалды + приталенный торс + левая рука (всё на корпусе)
  const coatParts = [];
  const coatSkirt = buildVerticalTubeGeo(
    [
      { cy: 0.34, rx: 0.001, rz: 0.001 },
      { cy: 0.35, rx: 0.118, rzF: 0.092, rzB: 0.098 }, // подол фалд мундира
      { cy: 0.48, rx: 0.088, rzF: 0.072, rzB: 0.076 }, // перетянутая ремнём талия
      { cy: 0.64, rx: 0.118, rzF: 0.088, rzB: 0.084 }, // грудная клетка
      { cy: 0.75, rx: 0.142, rzF: 0.088, rzB: 0.085 }, // плечи
      { cy: 0.79, rx: 0.052, rz: 0.050 },
      { cy: 0.80, rx: 0.001, rz: 0.001 }
    ],
    14,
    0.03,
    0.55,
    0.22,
    0.96
  );
  coatParts.push(coatSkirt);
  // Левая рука (+X), поддерживающая приклад ружья / шагающая в такт
  coatParts.push(buildLimbCylGeo([0.136, 0.735, 0.01], [0.155, 0.59, 0.06], 0.036, 0.030, 0.03, 0.58, 0.22, 0.92));
  coatParts.push(buildLimbCylGeo([0.155, 0.59, 0.06], [0.115, 0.52, 0.15], 0.030, 0.026, 0.03, 0.58, 0.22, 0.92));
  const soldierCoatGeo = mergeGeometries(coatParts, false);

  // Алый стоячий воротник и обшлага Кавказского корпуса
  const redCollar = new THREE.CylinderGeometry(0.048, 0.052, 0.040, 12);
  redCollar.translate(0, 0.795, 0.004);
  const soldierRedTrimGeo = ensureNonIndexedWithUV(redCollar);
  remapUVRect(soldierRedTrimGeo, 0.03, 0.58, 0.22, 0.92);

  // 3. Белые скрещённые портупеи, поясной ремень, ранец, патронная сума и скатка шинели через плечо!
  const whiteBeltParts = [];
  const blackEquipParts = [];
  const greyRollParts = [];
  const brassParts = [];
  const skinParts = [];

  const beltWaist = new THREE.CylinderGeometry(0.092, 0.093, 0.028, 14);
  beltWaist.scale(1.02, 1.0, 0.84);
  beltWaist.translate(0, 0.485, 0.0);
  remapUVRect(beltWaist, 0.14, 0.06, 0.23, 0.42);
  whiteBeltParts.push(ensureNonIndexedWithUV(beltWaist));

  for (const sgn of [-1, 1]) {
    // Выразительные белые скрещённые портупеи («X» по груди и спине николаевского пехотинца!)
    const frontCross = new THREE.BoxGeometry(0.028, 0.33, 0.014);
    frontCross.rotateZ(sgn * 0.56);
    frontCross.translate(0, 0.625, 0.092);
    remapUVRect(frontCross, 0.14, 0.06, 0.23, 0.42);
    whiteBeltParts.push(ensureNonIndexedWithUV(frontCross));

    const backCross = new THREE.BoxGeometry(0.028, 0.32, 0.014);
    backCross.rotateZ(-sgn * 0.56);
    backCross.translate(0, 0.625, -0.086);
    remapUVRect(backCross, 0.14, 0.06, 0.23, 0.42);
    whiteBeltParts.push(ensureNonIndexedWithUV(backCross));

    // Плечевые ремни перетяжки портупей сверху плеч
    const shoulderStrap = new THREE.BoxGeometry(0.028, 0.018, 0.185);
    shoulderStrap.translate(sgn * 0.088, 0.762, 0.002);
    remapUVRect(shoulderStrap, 0.14, 0.06, 0.23, 0.42);
    whiteBeltParts.push(ensureNonIndexedWithUV(shoulderStrap));
  }

  // Латунная пряжка с орлом на поясе и пуговицы
  const beltBuckle = new THREE.BoxGeometry(0.034, 0.028, 0.012);
  beltBuckle.translate(0, 0.485, 0.078);
  remapUVRect(beltBuckle, 0.30, 0.08, 0.45, 0.40);
  brassParts.push(ensureNonIndexedWithUV(beltBuckle));

  // Чёрный телячий ранец за спиной (-Z) и патронная сума сзади справа
  const knapsack = new THREE.BoxGeometry(0.185, 0.195, 0.078);
  knapsack.translate(0, 0.635, -0.112);
  remapUVRect(knapsack, 0.02, 0.06, 0.11, 0.42);
  blackEquipParts.push(ensureNonIndexedWithUV(knapsack));

  const cartridgePouch = new THREE.BoxGeometry(0.095, 0.075, 0.052);
  cartridgePouch.translate(-0.075, 0.455, -0.095);
  remapUVRect(cartridgePouch, 0.02, 0.06, 0.11, 0.42);
  blackEquipParts.push(ensureNonIndexedWithUV(cartridgePouch));

  // Знаменитая кавказская походная СКАТКА СЕРОЙ ШИНЕЛИ через левое плечо (объёмное кольцо-хомут вокруг торса!)
  const greatcoatRoll = new THREE.TorusGeometry(0.162, 0.036, 9, 20);
  greatcoatRoll.scale(0.84, 1.16, 0.72);
  greatcoatRoll.rotateZ(-0.56);
  greatcoatRoll.translate(0.005, 0.625, -0.008);
  remapUVRect(greatcoatRoll, 0.28, 0.55, 0.47, 0.96);
  greyRollParts.push(ensureNonIndexedWithUV(greatcoatRoll));

  // Голова солдата с усами + высокий кавказский кивер/каска 1844–1845 гг. с орлом и султаном!
  const headSphere = new THREE.SphereGeometry(0.058, 12, 10);
  headSphere.scale(0.92, 1.06, 1.0);
  headSphere.translate(0, 0.855, 0.008);
  skinParts.push(ensureNonIndexedWithUV(headSphere));

  const leftFist = new THREE.SphereGeometry(0.025, 7, 7);
  leftFist.translate(0.115, 0.52, 0.15);
  skinParts.push(ensureNonIndexedWithUV(leftFist));

  // Усы, глаза и брови николаевского гренадера + латунная чешуя подбородного ремня кивера!
  for (const sgn of [-1, 1]) {
    const must = new THREE.ConeGeometry(0.009, 0.034, 6);
    must.rotateZ(sgn * Math.PI * 0.45);
    must.translate(sgn * 0.015, 0.838, 0.062);
    remapUVRect(must, 0.02, 0.06, 0.11, 0.42);
    blackEquipParts.push(ensureNonIndexedWithUV(must));

    const eyeDot = new THREE.SphereGeometry(0.006, 6, 6);
    eyeDot.translate(sgn * 0.020, 0.862, 0.056);
    remapUVRect(eyeDot, 0.02, 0.06, 0.11, 0.42);
    blackEquipParts.push(ensureNonIndexedWithUV(eyeDot));

    const brow = new THREE.BoxGeometry(0.018, 0.005, 0.008);
    brow.translate(sgn * 0.020, 0.872, 0.057);
    remapUVRect(brow, 0.02, 0.06, 0.11, 0.42);
    blackEquipParts.push(ensureNonIndexedWithUV(brow));

    const chinScale = new THREE.BoxGeometry(0.010, 0.062, 0.014);
    chinScale.rotateZ(-sgn * 0.34);
    chinScale.translate(sgn * 0.044, 0.848, 0.028);
    remapUVRect(chinScale, 0.30, 0.08, 0.45, 0.40);
    brassParts.push(ensureNonIndexedWithUV(chinScale));
  }

  // Кивер-каска обр. 1844–1845 гг. (расширяющийся кверху тулейный купол + кожаный козырёк + герб РИ + султан)
  const shakoBody = buildVerticalTubeGeo(
    [
      { cy: 0.885, cz: 0.004, rx: 0.060, rz: 0.064 },
      { cy: 0.955, cz: 0.002, rx: 0.066, rz: 0.070 },
      { cy: 1.015, cz: 0.0, rx: 0.074, rz: 0.078 },
      { cy: 1.022, cz: 0.0, rx: 0.001, rz: 0.001 }
    ],
    14,
    0.02,
    0.06,
    0.11,
    0.42
  );
  blackEquipParts.push(shakoBody);

  const visor = new THREE.CylinderGeometry(0.064, 0.068, 0.012, 12, 1, false, -Math.PI * 0.45, Math.PI * 0.9);
  visor.rotateX(0.32);
  visor.translate(0, 0.886, 0.022);
  remapUVRect(visor, 0.02, 0.06, 0.11, 0.42);
  blackEquipParts.push(ensureNonIndexedWithUV(visor));

  // Чеканный двуглавый орёл на лбу кивера + чешуйчатый подбородный ремень
  const eaglePlate = new THREE.OctahedronGeometry(0.028, 1);
  eaglePlate.scale(1.15, 1.15, 0.25);
  eaglePlate.translate(0, 0.952, 0.072);
  remapUVRect(eaglePlate, 0.30, 0.08, 0.45, 0.40);
  brassParts.push(ensureNonIndexedWithUV(eaglePlate));

  const plume = new THREE.SphereGeometry(0.024, 8, 8);
  plume.scale(0.82, 1.85, 0.82);
  plume.translate(0, 1.058, 0.018);
  remapUVRect(plume, 0.14, 0.06, 0.23, 0.42);
  whiteBeltParts.push(ensureNonIndexedWithUV(plume));

  // 4. Правая рука с ударным пехотным ружьём обр. 1845 г. и длинным трёхгранным штыком (шарнир правого плеча (-0.136, 0.735, 0.01))
  const rightMusketArmGeo = mergeGeometries(
    [
      buildLimbCylGeo([0, 0, 0], [-0.022, -0.155, 0.055], 0.036, 0.030, 0.03, 0.58, 0.22, 0.92),
      buildLimbCylGeo([-0.022, -0.155, 0.055], [0.018, -0.195, 0.145], 0.030, 0.026, 0.03, 0.58, 0.22, 0.92)
    ],
    false
  );
  const musketStock = buildLimbCylGeo([0.012, -0.26, 0.10], [-0.015, 0.34, -0.04], 0.022, 0.012, 0.78, 0.56, 0.96, 0.94, 7);
  const musketBarrel = buildLimbCylGeo([-0.002, 0.04, 0.038], [-0.026, 0.52, -0.082], 0.010, 0.008, 0.54, 0.28, 0.71, 0.45, 7);
  const socketBayonet = buildLimbCylGeo([-0.022, 0.51, -0.076], [-0.038, 0.82, -0.148], 0.007, 0.0015, 0.54, 0.28, 0.71, 0.45, 3); // 3 грани русского штыка!
  const musketSteelGeo = mergeGeometries([musketBarrel, socketBayonet], false);

  // 5. Офицерская атрибутика: золотые эполеты, фуражка с кокардой и обнажённая пехотная сабля обр. 1827 г.
  const officerBrassParts = [];
  for (const sgn of [-1, 1]) {
    const ep = new THREE.SphereGeometry(0.038, 8, 7);
    ep.scale(1.15, 0.45, 0.85);
    ep.translate(sgn * 0.138, 0.768, 0.008);
    remapUVRect(ep, 0.30, 0.08, 0.45, 0.40);
    officerBrassParts.push(ensureNonIndexedWithUV(ep));
  }
  const offCockade = new THREE.SphereGeometry(0.012, 6, 6);
  offCockade.translate(0, 0.925, 0.068);
  remapUVRect(offCockade, 0.30, 0.08, 0.45, 0.40);
  officerBrassParts.push(ensureNonIndexedWithUV(offCockade));
  const officerBrassGeo = mergeGeometries(officerBrassParts, false);

  const capCrown = new THREE.CylinderGeometry(0.078, 0.060, 0.055, 14);
  capCrown.translate(0, 0.928, -0.002);
  remapUVRect(capCrown, 0.14, 0.06, 0.23, 0.42); // белая кавказская летняя тулья фуражки офицера!
  const officerCapWhiteGeo = ensureNonIndexedWithUV(capCrown);

  const sabreCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.015, -0.14, 0.17),
    new THREE.Vector3(0.012, 0.08, 0.24),
    new THREE.Vector3(0.008, 0.32, 0.26),
    new THREE.Vector3(0.005, 0.52, 0.22)
  ]);
  const officerSabreBladeGeo = ensureNonIndexedWithUV(new THREE.TubeGeometry(sabreCurve, 10, 0.0065, 4, false));
  remapUVRect(officerSabreBladeGeo, 0.54, 0.28, 0.71, 0.45);

  // 6. Полковой ротный барабан (медный корпус с верёвочной перетяжкой у бедра барабанщика)
  const drumShell = new THREE.CylinderGeometry(0.095, 0.095, 0.175, 14);
  drumShell.rotateZ(0.28);
  drumShell.rotateX(0.22);
  drumShell.translate(0.115, 0.46, 0.115);
  remapUVRect(drumShell, 0.30, 0.08, 0.45, 0.40);
  const drumBrassGeo = ensureNonIndexedWithUV(drumShell);

  const drumHeads = new THREE.CylinderGeometry(0.100, 0.100, 0.184, 14, 1, true);
  drumHeads.rotateZ(0.28);
  drumHeads.rotateX(0.22);
  drumHeads.translate(0.115, 0.46, 0.115);
  remapUVRect(drumHeads, 0.14, 0.06, 0.23, 0.42);
  const drumRimWhiteGeo = ensureNonIndexedWithUV(drumHeads);

  // 7. Древко полкового Георгиевского знамени и шаблон полотнища (для знамёнщика)
  const flagPike = buildLimbCylGeo([0.02, -0.35, 0.12], [0.02, 1.18, 0.12], 0.012, 0.010, 0.78, 0.56, 0.96, 0.94, 7);
  const flagFinial = new THREE.OctahedronGeometry(0.034, 1);
  flagFinial.scale(0.85, 1.45, 0.45);
  flagFinial.translate(-0.116, 1.94, 0.13);
  remapUVRect(flagFinial, 0.30, 0.08, 0.45, 0.40);
  const flagFinialGeo = ensureNonIndexedWithUV(flagFinial);

  const regimentalFlagTemplate = new THREE.PlaneGeometry(0.56, 0.42, 8, 4);
  regimentalFlagTemplate.translate(-0.28, 0, 0);
  regimentalFlagTemplate.rotateY(-Math.PI * 0.5); // уходит назад вдоль -Z от древка
  remapUVRect(regimentalFlagTemplate, 0.76, 0.03, 0.99, 0.45);

  // ==========================================================================
  // Б. ГОРНЫЙ 1/4-ПУДОВЫЙ БРОНЗОВЫЙ ЕДИНОРОГ ОБР. 1805/1838 ГГ. (дуло в +Z, колёса стоят на y=0.0)
  // ==========================================================================
  const cannonWheel = buildSpokedArtilleryWheelGeo({ radius: 0.34, width: 0.046, spokes: 12 });

  // Ствол бронзового единорога относительно цапф barrelPivot = (0, 0.41, 0.08)
  const unicornBarrelSlices = [
    { cz: -0.44, r: 0.001 },
    { cz: -0.42, r: 0.036 }, // шаровидный винград (cascabel)
    { cz: -0.38, r: 0.022 }, // шейка винграда
    { cz: -0.35, r: 0.098 }, // тарель казённой части
    { cz: -0.31, r: 0.092 },
    { cz: -0.10, r: 0.088 }, // казённый конус с гербом
    { cz: -0.08, r: 0.096 }, // казённый фриз
    { cz: -0.06, r: 0.082 },
    { cz: 0.16, r: 0.075 },  // средняя часть с дельфинами
    { cz: 0.18, r: 0.083 },  // средний поясок
    { cz: 0.20, r: 0.070 },
    { cz: 0.46, r: 0.064 },  // дульная часть
    { cz: 0.51, r: 0.086 },  // характерный дульный раструб русского единорога!
    { cz: 0.54, r: 0.080 },
    { cz: 0.545, r: 0.052 },
    { cz: 0.40, r: 0.048 },  // внутренний канал ствола (углубление жерла!)
    { cz: 0.39, r: 0.001 }
  ];
  const barrelMain = buildHorizontalTubeGeo(unicornBarrelSlices, 20, 0.28, 0.05, 0.47, 0.44);

  // Цапфы (trunnions) и две фигурные скобы-«дельфины» сверху ствола единорога
  const trunnions = new THREE.CylinderGeometry(0.028, 0.028, 0.28, 10);
  trunnions.rotateZ(Math.PI * 0.5);
  remapUVRect(trunnions, 0.28, 0.05, 0.47, 0.44);

  const dolphinParts = [barrelMain, ensureNonIndexedWithUV(trunnions)];
  for (const sgn of [-1, 1]) {
    const dol = new THREE.TorusGeometry(0.032, 0.009, 6, 12, Math.PI);
    dol.rotateY(Math.PI * 0.5);
    dol.translate(sgn * 0.028, 0.082, 0.02);
    remapUVRect(dol, 0.28, 0.05, 0.47, 0.44);
    dolphinParts.push(ensureNonIndexedWithUV(dol));
  }
  const unicornBarrelBronzeGeo = mergeGeometries(dolphinParts, false);

  // Чёрное жерло внутри канала ствола для глубокого контраста при взгляде спереди
  const boreBlack = new THREE.CylinderGeometry(0.049, 0.049, 0.14, 14);
  boreBlack.rotateX(Math.PI * 0.5);
  boreBlack.translate(0, 0, 0.465);
  const unicornBoreGeo = ensureNonIndexedWithUV(boreBlack);

  // Двухстанинный деревянный лафет со стяжками, подъёмным винтом, банником и правильным кольцом
  const carriageWoodParts = [];
  const carriageIronParts = [];

  for (const sgn of [-1, 1]) {
    // Наклонная станина лафета от передней подушки (y=0.39, z=0.22) вниз к хоботу на земле (y=0.06, z=-0.76)
    const cheekUpper = buildLimbCylGeo(
      [sgn * 0.135, 0.39, 0.22],
      [sgn * 0.145, 0.28, -0.22],
      0.058,
      0.054,
      0.78,
      0.56,
      0.96,
      0.94,
      6
    );
    const cheekTrail = buildLimbCylGeo(
      [sgn * 0.145, 0.28, -0.20],
      [sgn * 0.115, 0.065, -0.76],
      0.052,
      0.040,
      0.78,
      0.56,
      0.96,
      0.94,
      6
    );
    carriageWoodParts.push(cheekUpper, cheekTrail);

    // Железные накладки цапфенных гнёзд (намётки) сверху станин
    const capSq = new THREE.BoxGeometry(0.052, 0.035, 0.14);
    capSq.translate(sgn * 0.135, 0.42, 0.08);
    remapUVRect(capSq, 0.54, 0.04, 0.71, 0.22);
    carriageIronParts.push(ensureNonIndexedWithUV(capSq));
  }

  // Боевая деревянная ось и железные стяжные подушки лафета
  const axleBeam = new THREE.BoxGeometry(0.76, 0.068, 0.072);
  axleBeam.translate(0, 0.34, 0.08);
  remapUVRect(axleBeam, 0.78, 0.56, 0.96, 0.94);
  carriageWoodParts.push(ensureNonIndexedWithUV(axleBeam));

  const trailTransom = new THREE.BoxGeometry(0.28, 0.045, 0.16);
  trailTransom.rotateX(0.38);
  trailTransom.translate(0, 0.08, -0.68);
  remapUVRect(trailTransom, 0.54, 0.04, 0.71, 0.22);
  carriageIronParts.push(ensureNonIndexedWithUV(trailTransom));

  const trailRing = new THREE.TorusGeometry(0.052, 0.010, 6, 14);
  trailRing.rotateX(Math.PI * 0.35);
  trailRing.translate(0, 0.06, -0.82);
  remapUVRect(trailRing, 0.54, 0.04, 0.71, 0.22);
  carriageIronParts.push(ensureNonIndexedWithUV(trailRing));

  // Подъёмный винт с крестовиной под казённой частью ствола
  const elevScrew = new THREE.CylinderGeometry(0.012, 0.012, 0.18, 8);
  elevScrew.translate(0, 0.30, -0.22);
  remapUVRect(elevScrew, 0.54, 0.04, 0.71, 0.22);
  carriageIronParts.push(ensureNonIndexedWithUV(elevScrew));

  const elevWheel = new THREE.TorusGeometry(0.044, 0.006, 6, 12);
  elevWheel.rotateX(Math.PI * 0.5);
  elevWheel.translate(0, 0.34, -0.22);
  remapUVRect(elevWheel, 0.28, 0.05, 0.47, 0.44);
  carriageIronParts.push(ensureNonIndexedWithUV(elevWheel));

  // Древко артиллерийского банника и прибойника вдоль правой станины + пороховое ведро под осью
  const ramrodShaft = buildLimbCylGeo([-0.195, 0.36, 0.28], [-0.175, 0.12, -0.68], 0.010, 0.010, 0.78, 0.56, 0.96, 0.94, 6);
  carriageWoodParts.push(ramrodShaft);
  const spongeHead = new THREE.CylinderGeometry(0.032, 0.032, 0.12, 10);
  spongeHead.rotateX(Math.PI * 0.42);
  spongeHead.translate(-0.197, 0.375, 0.32);
  remapUVRect(spongeHead, 0.28, 0.55, 0.47, 0.96);
  carriageWoodParts.push(ensureNonIndexedWithUV(spongeHead));

  const bucket = new THREE.CylinderGeometry(0.052, 0.044, 0.11, 10);
  bucket.translate(0.08, 0.21, 0.08);
  remapUVRect(bucket, 0.54, 0.04, 0.71, 0.22);
  carriageIronParts.push(ensureNonIndexedWithUV(bucket));

  // Зарядный ящик с двускатной крышкой и пирамидка из 4 чугунных гранат сбоку от орудия
  const ammoChest = new THREE.BoxGeometry(0.34, 0.22, 0.24);
  ammoChest.translate(0.56, 0.11, -0.32);
  remapUVRect(ammoChest, 0.78, 0.56, 0.96, 0.94);
  const ammoLid = new THREE.CylinderGeometry(0.14, 0.14, 0.35, 3);
  ammoLid.rotateZ(Math.PI * 0.5);
  ammoLid.scale(1.0, 0.45, 1.1);
  ammoLid.translate(0.56, 0.24, -0.32);
  remapUVRect(ammoLid, 0.54, 0.04, 0.71, 0.22);

  const shellStackParts = [ensureNonIndexedWithUV(ammoLid)];
  [
    [-0.48, 0.048, -0.24],
    [-0.58, 0.048, -0.24],
    [-0.53, 0.048, -0.33],
    [-0.53, 0.125, -0.27]
  ].forEach(([sx, sy, sz]) => {
    const sh = new THREE.SphereGeometry(0.048, 10, 8);
    sh.translate(sx, sy, sz);
    remapUVRect(sh, 0.54, 0.04, 0.71, 0.22);
    shellStackParts.push(ensureNonIndexedWithUV(sh));
  });

  const cannonCarriageGeo = mergeGeometries(carriageWoodParts, false);
  const cannonIronGeo = mergeGeometries(carriageIronParts, false);
  const cannonAmmoChestGeo = ensureNonIndexedWithUV(ammoChest);
  const cannonAmmoIronGeo = mergeGeometries(shellStackParts, false);

  // ==========================================================================
  // В. ЧЕТЫРЁХКОЛЁСНЫЙ СУХАРНЫЙ ФУРГОН ВОРОНЦОВА С УПРЯЖНЫМ КОНЁМ В РУССКОЙ ДУГЕ!
  // ==========================================================================
  const wagonWheelFront = buildSpokedArtilleryWheelGeo({ radius: 0.21, width: 0.038, spokes: 10 });
  const wagonWheelRear = buildSpokedArtilleryWheelGeo({ radius: 0.27, width: 0.042, spokes: 12 });

  const wagonWoodParts = [];
  const wagonIronParts = [];

  // Деревянный кузов с расклёшенными бортами (грядками), козлами ездового и бочонками сухарей
  const wagonBed = new THREE.BoxGeometry(0.62, 0.06, 1.18);
  wagonBed.translate(0, 0.28, -0.22);
  remapUVRect(wagonBed, 0.78, 0.56, 0.96, 0.94);
  wagonWoodParts.push(ensureNonIndexedWithUV(wagonBed));

  for (const sgn of [-1, 1]) {
    const sideWall = new THREE.BoxGeometry(0.036, 0.24, 1.16);
    sideWall.rotateZ(-sgn * 0.14);
    sideWall.translate(sgn * 0.315, 0.41, -0.22);
    remapUVRect(sideWall, 0.78, 0.56, 0.96, 0.94);
    wagonWoodParts.push(ensureNonIndexedWithUV(sideWall));

    // Две длинные деревянные оглобли от передка фургона вперёд к хомуту упряжного коня!
    const shaft = buildLimbCylGeo(
      [sgn * 0.24, 0.26, 0.34],
      [sgn * 0.21, 0.62, 1.08],
      0.020,
      0.016,
      0.78,
      0.56,
      0.96,
      0.94,
      6
    );
    wagonWoodParts.push(shaft);
  }

  // Высокая изогнутая РУССКАЯ ДУГА над хомутом упряжного коня!
  const russianDuga = new THREE.TorusGeometry(0.245, 0.022, 8, 18, Math.PI * 1.08);
  russianDuga.rotateZ(-Math.PI * 0.04);
  russianDuga.translate(0, 0.68, 1.07);
  remapUVRect(russianDuga, 0.78, 0.56, 0.96, 0.94);
  wagonWoodParts.push(ensureNonIndexedWithUV(russianDuga));

  // Хомут на шее упряжного коня и дегтярница под задней осью
  const horseCollar = new THREE.TorusGeometry(0.145, 0.030, 8, 14);
  horseCollar.scale(0.82, 1.25, 0.85);
  horseCollar.rotateX(0.32);
  horseCollar.translate(0, 0.64, 1.04);
  remapUVRect(horseCollar, 0.02, 0.06, 0.11, 0.42);
  wagonIronParts.push(ensureNonIndexedWithUV(horseCollar));

  const tarBucket = new THREE.CylinderGeometry(0.044, 0.038, 0.095, 9);
  tarBucket.translate(0.12, 0.17, -0.56);
  remapUVRect(tarBucket, 0.54, 0.04, 0.71, 0.22);
  wagonIronParts.push(ensureNonIndexedWithUV(tarBucket));

  // Бочонки с сухарями и порохом на передке/корме фургона
  for (const [kx, ky, kz] of [
    [-0.14, 0.40, 0.26],
    [0.14, 0.40, 0.26],
    [0.0, 0.40, -0.68]
  ]) {
    const keg = new THREE.CylinderGeometry(0.085, 0.075, 0.19, 10);
    keg.rotateZ(Math.PI * 0.5);
    keg.translate(kx, ky, kz);
    remapUVRect(keg, 0.78, 0.56, 0.96, 0.94);
    wagonWoodParts.push(ensureNonIndexedWithUV(keg));
  }

  // Волнистый парусиновый верх фургона на 5 деревянных дугах-обручах!
  const canopySlices = [];
  for (let s = 0; s <= 16; s++) {
    const u = s / 16;
    const cz = -0.78 + u * 0.96; // от -0.78 до +0.18 (оставляя спереди открытые козлы ездового!)
    const endCap = s === 0 || s === 16 ? 0.06 : 1.0;
    // Лёгкая ребристость парусины поверх 5 деревянных обручей!
    const hoopBump = 1.0 + Math.cos(u * Math.PI * 4 * 2) * 0.028;
    canopySlices.push({
      cz,
      cy: 0.48,
      rx: 0.345 * hoopBump * (s === 0 || s === 16 ? 0.88 : 1.0),
      ryTop: 0.36 * hoopBump * endCap,
      ryBot: 0.04,
      flatBottom: 0.02
    });
  }
  const wagonCanvasTiltGeo = buildHorizontalTubeGeo(canopySlices, 16, 0.53, 0.55, 0.72, 0.96);

  // Сидящий на козлах ездовой фурштата в серой солдатской шинели и фуражке (держит вожжи!)
  const driverGreyParts = [
    buildVerticalTubeGeo(
      [
        { cy: 0.42, cz: 0.28, rx: 0.001, rz: 0.001 },
        { cy: 0.44, cz: 0.28, rx: 0.088, rz: 0.075 },
        { cy: 0.64, cz: 0.27, rx: 0.105, rz: 0.078 },
        { cy: 0.68, cz: 0.27, rx: 0.042, rz: 0.040 },
        { cy: 0.69, cz: 0.27, rx: 0.001, rz: 0.001 }
      ],
      12,
      0.28,
      0.55,
      0.47,
      0.95
    ),
    buildLimbCylGeo([-0.095, 0.62, 0.27], [-0.065, 0.52, 0.42], 0.028, 0.022, 0.28, 0.55, 0.47, 0.95),
    buildLimbCylGeo([0.095, 0.62, 0.27], [0.065, 0.52, 0.42], 0.028, 0.022, 0.28, 0.55, 0.47, 0.95)
  ];
  const driverGreyGeo = mergeGeometries(driverGreyParts, false);

  const driverHead = new THREE.SphereGeometry(0.044, 10, 8);
  driverHead.translate(0, 0.725, 0.275);
  const driverSkinGeo = ensureNonIndexedWithUV(driverHead);

  const driverCap = new THREE.CylinderGeometry(0.056, 0.045, 0.038, 12);
  driverCap.translate(0, 0.768, 0.272);
  remapUVRect(driverCap, 0.03, 0.58, 0.22, 0.92);
  const driverCapGeo = ensureNonIndexedWithUV(driverCap);

  // Вожжи от рук ездового к удилам упряжного коня
  const wagonReinsParts = [];
  for (const sgn of [-1, 1]) {
    const rc = new THREE.CatmullRomCurve3([
      new THREE.Vector3(sgn * 0.065, 0.52, 0.42),
      new THREE.Vector3(sgn * 0.11, 0.58, 0.82),
      new THREE.Vector3(sgn * 0.042, 0.68, 1.32)
    ]);
    const rt = new THREE.TubeGeometry(rc, 8, 0.005, 4, false);
    remapUVRect(rt, 0.02, 0.06, 0.11, 0.42);
    wagonReinsParts.push(ensureNonIndexedWithUV(rt));
  }
  wagonIronParts.push(...wagonReinsParts);

  // Анатомический упряжной конь (центр корпуса z = +0.92, копыта на y = 0.0!)
  const draftHorseBodyGeo = buildHorizontalTubeGeo(
    [
      { cz: 0.54, cy: 0.62, r: 0.001 },
      { cz: 0.58, cy: 0.62, rx: 0.115, ryTop: 0.125, ryBot: 0.145 },
      { cz: 0.74, cy: 0.59, rx: 0.142, ryTop: 0.135, ryBot: 0.165 },
      { cz: 0.94, cy: 0.60, rx: 0.144, ryTop: 0.155, ryBot: 0.168 },
      { cz: 1.08, cy: 0.59, rx: 0.118, ryTop: 0.122, ryBot: 0.132 },
      { cz: 1.13, cy: 0.58, r: 0.001 }
    ],
    16,
    0.78,
    0.56,
    0.96,
    0.94
  );

  // Шея + голова упряжного коня относительно шарнира draftNeckPivot = (0, 0.66, 1.05)
  const draftNeck = buildHorizontalTubeGeo(
    [
      { cz: -0.06, cy: -0.06, r: 0.001 },
      { cz: -0.04, cy: -0.05, rx: 0.108, ry: 0.125 },
      { cz: 0.08, cy: 0.12, rx: 0.078, ry: 0.095 },
      { cz: 0.16, cy: 0.23, rx: 0.056, ry: 0.068 },
      { cz: 0.18, cy: 0.25, r: 0.001 }
    ],
    14,
    0.78,
    0.56,
    0.96,
    0.94
  );
  const draftHead = buildHorizontalTubeGeo(
    [
      { cz: -0.02, cy: 0.01, r: 0.001 },
      { cz: 0.03, cy: 0.0, rx: 0.052, ry: 0.058 },
      { cz: 0.15, cy: -0.005, rx: 0.036, ry: 0.038 },
      { cz: 0.25, cy: -0.01, rx: 0.028, ry: 0.028 },
      { cz: 0.27, cy: -0.012, r: 0.001 }
    ],
    12,
    0.78,
    0.56,
    0.96,
    0.94
  );
  draftHead.rotateX(0.65);
  draftHead.translate(0, 0.24, 0.16);
  const draftEarL = new THREE.ConeGeometry(0.016, 0.065, 6);
  draftEarL.translate(-0.032, 0.29, 0.16);
  const draftEarR = new THREE.ConeGeometry(0.016, 0.065, 6);
  draftEarR.translate(0.032, 0.29, 0.16);
  const draftManeParts = [];
  for (let m = 0; m < 7; m++) {
    const f = m / 6;
    const tuft = new THREE.BoxGeometry(0.024, 0.075, 0.048);
    tuft.translate(-0.022, 0.04 + f * 0.23, 0.01 + f * 0.14);
    remapUVRect(tuft, 0.02, 0.06, 0.11, 0.42);
    draftManeParts.push(ensureNonIndexedWithUV(tuft));
  }
  for (const sgn of [-1, 1]) {
    const dhEye = new THREE.SphereGeometry(0.011, 7, 7);
    dhEye.translate(sgn * 0.044, 0.205, 0.235);
    remapUVRect(dhEye, 0.02, 0.06, 0.11, 0.42);
    draftManeParts.push(ensureNonIndexedWithUV(dhEye));
  }
  const draftNeckHeadGeo = mergeGeometries(
    [draftNeck, draftHead, ensureNonIndexedWithUV(draftEarL), ensureNonIndexedWithUV(draftEarR)],
    false
  );
  const draftHorseManeAndEyesGeo = mergeGeometries(draftManeParts, false);

  // Нога упряжного коня (шарнир на y=0.52 -> копыто на dy=-0.52 -> y=0.0!)
  const draftHorseLegGeo = buildVerticalTubeGeo(
    [
      { cy: 0.03, r: 0.001 },
      { cy: 0.01, rx: 0.052, rz: 0.062 },
      { cy: -0.24, rx: 0.030, rz: 0.034 },
      { cy: -0.45, rx: 0.024, rz: 0.026 },
      { cy: -0.515, cz: 0.012, rx: 0.028, rz: 0.032 },
      { cy: -0.52, cz: 0.012, r: 0.001 }
    ],
    10,
    0.78,
    0.56,
    0.96,
    0.94
  );

  const draftTail = buildLimbCylGeo([0, 0, 0], [0, -0.34, -0.08], 0.028, 0.012, 0.02, 0.06, 0.11, 0.42, 7);

  return {
    legBootGeo,
    soldierCoatGeo,
    soldierRedTrimGeo,
    soldierWhiteBeltGeo: mergeGeometries(whiteBeltParts, false),
    soldierBlackEquipGeo: mergeGeometries(blackEquipParts, false),
    soldierGreyRollGeo: mergeGeometries(greyRollParts, false),
    soldierBrassGeo: mergeGeometries(brassParts, false),
    soldierSkinGeo: mergeGeometries(skinParts, false),
    rightMusketArmGeo,
    musketStockGeo: musketStock,
    musketSteelGeo,
    officerBrassGeo,
    officerCapWhiteGeo,
    officerSabreBladeGeo,
    drumBrassGeo,
    drumRimWhiteGeo,
    flagPikeGeo: flagPike,
    flagFinialGeo,
    regimentalFlagTemplate,

    cannonWheel,
    unicornBarrelBronzeGeo,
    unicornBoreGeo,
    cannonCarriageGeo,
    cannonIronGeo,
    cannonAmmoChestGeo,
    cannonAmmoIronGeo,

    wagonWheelFront,
    wagonWheelRear,
    wagonWoodGeo: mergeGeometries(wagonWoodParts, false),
    wagonIronGeo: mergeGeometries(wagonIronParts, false),
    wagonCanvasTiltGeo,
    driverGreyGeo,
    driverSkinGeo,
    driverCapGeo,
    draftHorseBodyGeo,
    draftNeckHeadGeo,
    draftHorseManeAndEyesGeo,
    draftHorseLegGeo,
    draftTailGeo: draftTail
  };
}

export function getSharedImperialCorpsAssets() {
  if (cachedCorpsAssets) return cachedCorpsAssets;

  const { diffTex, normTex, roughTex } = createImperialCorpsPbrAtlas();
  const geos = buildSharedCorpsGeometries();

  const makeMat = (opts) =>
    new THREE.MeshStandardMaterial({
      map: diffTex,
      normalMap: normTex,
      roughnessMap: roughTex,
      ...opts
    });

  const materials = {
    uniformGreen: makeMat({
      color: '#ffffff',
      normalScale: new THREE.Vector2(0.45, 0.45),
      roughness: 0.86
    }),
    greatcoatGrey: makeMat({
      color: '#ffffff',
      normalScale: new THREE.Vector2(0.55, 0.55),
      roughness: 0.92
    }),
    crimsonTrim: new THREE.MeshStandardMaterial({
      color: '#dc2626',
      roughness: 0.72,
      metalness: 0.04
    }),
    leatherAndWhiteBelts: makeMat({
      color: '#ffffff',
      normalScale: new THREE.Vector2(0.32, 0.32),
      roughness: 0.58
    }),
    artilleryBronze: makeMat({
      color: '#f7d07a',
      normalScale: new THREE.Vector2(0.55, 0.55),
      roughness: 0.32,
      metalness: 0.86
    }),
    bayonetAndIron: makeMat({
      color: '#ffffff',
      normalScale: new THREE.Vector2(0.42, 0.42),
      roughness: 0.36,
      metalness: 0.82
    }),
    boreMatteBlack: new THREE.MeshBasicMaterial({
      color: '#09090b'
    }),
    carriageImpGreenWood: makeMat({
      color: '#5c7c4e', // защитный оливково-зелёный окрас русских артиллерийских лафетов XIX в.!
      normalScale: new THREE.Vector2(0.52, 0.52),
      roughness: 0.78
    }),
    carriageOakWood: makeMat({
      color: '#ffffff',
      normalScale: new THREE.Vector2(0.55, 0.55),
      roughness: 0.80
    }),
    wagonCanvasTilt: makeMat({
      color: '#ffffff',
      normalScale: new THREE.Vector2(0.52, 0.52),
      roughness: 0.90,
      side: THREE.DoubleSide
    }),
    draftBayCoat: new THREE.MeshStandardMaterial({
      color: '#5c2e16',
      roughness: 0.76,
      metalness: 0.02
    }),
    skinTone: new THREE.MeshStandardMaterial({
      color: '#deb092',
      roughness: 0.68,
      metalness: 0.01
    }),
    regimentalBanner: makeMat({
      color: '#ffffff',
      normalScale: new THREE.Vector2(0.35, 0.35),
      roughness: 0.68,
      side: THREE.DoubleSide
    })
  };

  cachedCorpsAssets = { diffTex, normTex, roughTex, geos, materials };
  return cachedCorpsAssets;
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

/**
 * 1. ПЕХОТНАЯ КОЛОННА ОТДЕЛЬНОГО КАВКАЗСКОГО КОРПУСА (9 ФИГУР В ПОХОДНОМ СТРОЮ)
 * Ориентирована лицом к +Z (офицер и знамёнщик впереди, барабанщик и 2 шеренги со штыками сзади).
 */
export function createPhotorealImperialColumnInstance({
  scale = 1.0,
  castShadow = true,
  clippingPlanes = null
} = {}) {
  const { geos, materials } = getSharedImperialCorpsAssets();
  const { disposableClones, matWithClip } = makeClipHelper(clippingPlanes);

  const greenMat = matWithClip(materials.uniformGreen);
  const greyMat = matWithClip(materials.greatcoatGrey);
  const redMat = matWithClip(materials.crimsonTrim);
  const equipMat = matWithClip(materials.leatherAndWhiteBelts);
  const bronzeMat = matWithClip(materials.artilleryBronze);
  const steelMat = matWithClip(materials.bayonetAndIron);
  const woodMat = matWithClip(materials.carriageOakWood);
  const skinMat = matWithClip(materials.skinTone);
  const bannerMat = matWithClip(materials.regimentalBanner);

  const setup = (m) => {
    m.castShadow = castShadow;
    m.receiveShadow = true;
    return m;
  };

  const root = new THREE.Group();
  root.scale.setScalar(scale);

  const legsL = [];
  const legsR = [];
  const rightArms = [];

  const spawnFigure = ({ x, z, role = 'infantry' }) => {
    const fig = new THREE.Group();
    fig.position.set(x, 0, z);
    root.add(fig);

    // Подвижные левая и правая ноги в сапогах (шарниры таза на y=0.46)
    const legL = new THREE.Group();
    legL.position.set(0.044, 0.46, 0);
    legL.add(setup(new THREE.Mesh(geos.legBootGeo, equipMat)));
    fig.add(legL);
    legsL.push(legL);

    const legR = new THREE.Group();
    legR.position.set(-0.044, 0.46, 0);
    legR.add(setup(new THREE.Mesh(geos.legBootGeo, equipMat)));
    fig.add(legR);
    legsR.push(legR);

    // Торс мундира, алый воротник, лицо
    fig.add(setup(new THREE.Mesh(geos.soldierCoatGeo, greenMat)));
    fig.add(setup(new THREE.Mesh(geos.soldierRedTrimGeo, redMat)));
    fig.add(setup(new THREE.Mesh(geos.soldierSkinGeo, skinMat)));

    // Правое плечо на шарнире (-0.136, 0.735, 0.01)
    const rArm = new THREE.Group();
    rArm.position.set(-0.136, 0.735, 0.01);
    rArm.add(setup(new THREE.Mesh(geos.rightMusketArmGeo, greenMat)));
    fig.add(rArm);
    rightArms.push(rArm);

    if (role === 'officer') {
      fig.add(setup(new THREE.Mesh(geos.officerBrassGeo, bronzeMat)));
      fig.add(setup(new THREE.Mesh(geos.officerCapWhiteGeo, equipMat)));
      rArm.add(setup(new THREE.Mesh(geos.officerSabreBladeGeo, steelMat)));
    } else {
      fig.add(setup(new THREE.Mesh(geos.soldierWhiteBeltGeo, equipMat)));
      fig.add(setup(new THREE.Mesh(geos.soldierBlackEquipGeo, equipMat)));
      fig.add(setup(new THREE.Mesh(geos.soldierGreyRollGeo, greyMat)));
      fig.add(setup(new THREE.Mesh(geos.soldierBrassGeo, bronzeMat)));

      if (role === 'standard') {
        rArm.add(setup(new THREE.Mesh(geos.flagPikeGeo, woodMat)));
        fig.add(setup(new THREE.Mesh(geos.flagFinialGeo, bronzeMat)));
      } else if (role === 'drummer') {
        fig.add(setup(new THREE.Mesh(geos.drumBrassGeo, bronzeMat)));
        fig.add(setup(new THREE.Mesh(geos.drumRimWhiteGeo, equipMat)));
      } else {
        rArm.add(setup(new THREE.Mesh(geos.musketStockGeo, woodMat)));
        rArm.add(setup(new THREE.Mesh(geos.musketSteelGeo, steelMat)));
      }
    }
    return fig;
  };

  // Командная пара в голове колонны (+Z): офицер с саблей и знамёнщик с Георгиевским знаменем
  spawnFigure({ x: -0.20, z: 0.56, role: 'officer' });
  spawnFigure({ x: 0.20, z: 0.56, role: 'standard' });

  // Ротный барабанщик в центре перед штыковыми шеренгами
  spawnFigure({ x: 0.0, z: 0.24, role: 'drummer' });

  // Две сомкнутые шеренги по 3 пехотинца со скатками шинелей и примкнутыми трёхгранными штыками!
  for (const rz of [-0.08, -0.44]) {
    for (const rx of [-0.29, 0.0, 0.29]) {
      spawnFigure({ x: rx, z: rz, role: 'infantry' });
    }
  }

  // Развевающееся полковое знамя на вершине древка знамёнщика (0.20 - 0.116 = 0.084, y=1.69, z=0.56 + 0.13 = 0.69)
  const flagGeoInst = geos.regimentalFlagTemplate.clone();
  disposableClones.push(flagGeoInst);
  const flagMesh = setup(new THREE.Mesh(flagGeoInst, bannerMat));
  flagMesh.position.set(0.084, 1.69, 0.69);
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
    flagMesh,
    baseFlagZ,
    disposableClones
  };
  return root;
}

/**
 * 2. ГОРНЫЙ 1/4-ПУДОВЫЙ БРОНЗОВЫЙ ЕДИНОРОГ НА ОКОВАННОМ ЛАФЕТЕ С ЗАРЯДНЫМ ЯЩИКОМ
 * Дуло направлено в +Z, колёса стоят на y = 0.0.
 */
export function createPhotorealUnicornCannonInstance({
  variant = 'imperial',
  includeAmmoChest = true,
  scale = 1.0,
  castShadow = true,
  clippingPlanes = null
} = {}) {
  const { geos, materials } = getSharedImperialCorpsAssets();
  const { disposableClones, matWithClip } = makeClipHelper(clippingPlanes);

  const isImamat = variant === 'imamat';
  const carriageMat = matWithClip(isImamat ? materials.carriageOakWood : materials.carriageImpGreenWood);
  const wheelWoodMat = matWithClip(materials.carriageOakWood);
  const bronzeMat = matWithClip(materials.artilleryBronze);
  const ironMat = matWithClip(materials.bayonetAndIron);
  const boreMat = matWithClip(materials.boreMatteBlack);

  const setup = (m) => {
    m.castShadow = castShadow;
    m.receiveShadow = true;
    return m;
  };

  const root = new THREE.Group();
  root.scale.setScalar(scale);

  // Откатная часть лафета с орудием и двумя 12-спицевыми колёсами
  const gunCarriageGroup = new THREE.Group();
  root.add(gunCarriageGroup);

  gunCarriageGroup.add(setup(new THREE.Mesh(geos.cannonCarriageGeo, carriageMat)));
  gunCarriageGroup.add(setup(new THREE.Mesh(geos.cannonIronGeo, ironMat)));

  const wheelL = new THREE.Group();
  wheelL.position.set(0.39, 0.34, 0.08);
  wheelL.add(setup(new THREE.Mesh(geos.cannonWheel.woodGeo, wheelWoodMat)));
  wheelL.add(setup(new THREE.Mesh(geos.cannonWheel.ironGeo, ironMat)));
  gunCarriageGroup.add(wheelL);

  const wheelR = new THREE.Group();
  wheelR.position.set(-0.39, 0.34, 0.08);
  wheelR.add(setup(new THREE.Mesh(geos.cannonWheel.woodGeo, wheelWoodMat)));
  wheelR.add(setup(new THREE.Mesh(geos.cannonWheel.ironGeo, ironMat)));
  gunCarriageGroup.add(wheelR);

  // Шарнир цапф бронзового ствола единорога (0, 0.41, 0.08)
  const barrelPivot = new THREE.Group();
  barrelPivot.position.set(0, 0.41, 0.08);
  barrelPivot.add(setup(new THREE.Mesh(geos.unicornBarrelBronzeGeo, bronzeMat)));
  barrelPivot.add(new THREE.Mesh(geos.unicornBoreGeo, boreMat));
  gunCarriageGroup.add(barrelPivot);

  if (includeAmmoChest) {
    root.add(setup(new THREE.Mesh(geos.cannonAmmoChestGeo, carriageMat)));
    root.add(setup(new THREE.Mesh(geos.cannonAmmoIronGeo, ironMat)));
  }

  root.userData.photorealCorpsRig = {
    kind: 'cannon',
    gunCarriageGroup,
    wheelL,
    wheelR,
    barrelPivot,
    wheelSpin: 0,
    disposableClones
  };
  return root;
}

/**
 * 3. КРЫТЫЙ ЧЕТЫРЁХКОЛЁСНЫЙ СУХАРНЫЙ ФУРГОН ВОРОНЦОВА С УПРЯЖНЫМ КОНЁМ В РУССКОЙ ДУГЕ
 * Ориентирован вперёд по +Z (упряжной конь тянет повозку в +Z, колёса стоят на y = 0.0).
 */
export function createPhotorealSupplyWagonInstance({
  includeDraftHorse = true,
  scale = 1.0,
  castShadow = true,
  clippingPlanes = null
} = {}) {
  const { geos, materials } = getSharedImperialCorpsAssets();
  const { disposableClones, matWithClip } = makeClipHelper(clippingPlanes);

  const woodMat = matWithClip(materials.carriageOakWood);
  const ironMat = matWithClip(materials.bayonetAndIron);
  const canvasMat = matWithClip(materials.wagonCanvasTilt);
  const greyMat = matWithClip(materials.greatcoatGrey);
  const greenMat = matWithClip(materials.uniformGreen);
  const skinMat = matWithClip(materials.skinTone);
  const bayMat = matWithClip(materials.draftBayCoat);
  const blackMat = matWithClip(materials.leatherAndWhiteBelts);

  const setup = (m) => {
    m.castShadow = castShadow;
    m.receiveShadow = true;
    return m;
  };

  const root = new THREE.Group();
  root.scale.setScalar(scale);

  // Кузов фургона, парусиновый свод на обручах и ездовой на козлах
  root.add(setup(new THREE.Mesh(geos.wagonWoodGeo, woodMat)));
  root.add(setup(new THREE.Mesh(geos.wagonIronGeo, ironMat)));
  root.add(setup(new THREE.Mesh(geos.wagonCanvasTiltGeo, canvasMat)));
  root.add(setup(new THREE.Mesh(geos.driverGreyGeo, greyMat)));
  root.add(setup(new THREE.Mesh(geos.driverSkinGeo, skinMat)));
  root.add(setup(new THREE.Mesh(geos.driverCapGeo, greenMat)));

  // 4 спицованных колеса фургона (передние R=0.21 на z=+0.22, задние R=0.27 на z=-0.56)
  const wheels = [];
  for (const sgn of [-1, 1]) {
    const wf = new THREE.Group();
    wf.position.set(sgn * 0.35, 0.21, 0.22);
    wf.add(setup(new THREE.Mesh(geos.wagonWheelFront.woodGeo, woodMat)));
    wf.add(setup(new THREE.Mesh(geos.wagonWheelFront.ironGeo, ironMat)));
    root.add(wf);
    wheels.push({ group: wf, speedMul: 1.28 });

    const wr = new THREE.Group();
    wr.position.set(sgn * 0.36, 0.27, -0.56);
    wr.add(setup(new THREE.Mesh(geos.wagonWheelRear.woodGeo, woodMat)));
    wr.add(setup(new THREE.Mesh(geos.wagonWheelRear.ironGeo, ironMat)));
    root.add(wr);
    wheels.push({ group: wr, speedMul: 1.0 });
  }

  let draftHorse = null;
  if (includeDraftHorse) {
    const horseGrp = new THREE.Group();
    root.add(horseGrp);
    horseGrp.add(setup(new THREE.Mesh(geos.draftHorseBodyGeo, bayMat)));

    const neckPivot = new THREE.Group();
    neckPivot.position.set(0, 0.66, 1.05);
    neckPivot.add(setup(new THREE.Mesh(geos.draftNeckHeadGeo, bayMat)));
    neckPivot.add(setup(new THREE.Mesh(geos.draftHorseManeAndEyesGeo, blackMat)));
    horseGrp.add(neckPivot);

    const tailPivot = new THREE.Group();
    tailPivot.position.set(0, 0.62, 0.56);
    tailPivot.add(setup(new THREE.Mesh(geos.draftTailGeo, blackMat)));
    horseGrp.add(tailPivot);

    const makeDraftLeg = (lx, lz) => {
      const lp = new THREE.Group();
      lp.position.set(lx, 0.52, lz);
      lp.add(setup(new THREE.Mesh(geos.draftHorseLegGeo, bayMat)));
      horseGrp.add(lp);
      return lp;
    };
    const legFL = makeDraftLeg(0.095, 1.02);
    const legFR = makeDraftLeg(-0.095, 1.02);
    const legBL = makeDraftLeg(0.10, 0.64);
    const legBR = makeDraftLeg(-0.10, 0.64);

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
 * Живая биомеханика походных колонн РИ, отката и наводки единорогов и упряжных обозов.
 */
export function updatePhotorealCorpsAsset(
  rootObj,
  { elapsed = 0, dt = 0.016, phase = 0, moving = false, recoil = 0, elevRad = 0.08 } = {}
) {
  const rig = rootObj?.userData?.photorealCorpsRig;
  if (!rig) return;

  if (rig.kind === 'column') {
    const stepFreq = 8.8;
    for (let i = 0; i < rig.legsL.length; i++) {
      const rankLag = (i % 3) * 0.18;
      const swing = moving ? Math.sin(elapsed * stepFreq + phase + rankLag) * 0.44 : 0;
      rig.legsL[i].rotation.x = swing;
      rig.legsR[i].rotation.x = -swing;

      if (rig.rightArms[i]) {
        // Офицер (i===0) ведёт саблей, знамёнщик (i===1) твёрдо держит древко знамени, солдаты покачивают ружьями
        if (i === 0) {
          rig.rightArms[i].rotation.x = moving
            ? -0.24 + Math.sin(elapsed * stepFreq * 0.5 + phase) * 0.14
            : -0.15 + Math.sin(elapsed * 2.1 + phase) * 0.06;
        } else if (i === 1) {
          rig.rightArms[i].rotation.x = 0;
        } else {
          rig.rightArms[i].rotation.x = moving
            ? swing * 0.12
            : Math.sin(elapsed * 1.8 + phase + i * 0.5) * 0.025;
        }
      }
    }

    // Живая вершинная волна полкового Георгиевского знамени на горном ветру
    const fp = rig.flagMesh.geometry.attributes.position;
    const windSpd = moving ? 7.8 : 4.6;
    const windAmp = moving ? 0.065 : 0.042;
    for (let k = 0; k < fp.count; k++) {
      const bz = rig.baseFlagZ[k]; // 0 .. -0.56
      const pin = Math.min(1, Math.abs(bz) / 0.56);
      fp.setX(k, Math.sin(elapsed * windSpd + bz * 9.5 + phase) * windAmp * pin);
    }
    fp.needsUpdate = true;
  } else if (rig.kind === 'cannon') {
    if (moving) {
      rig.wheelSpin += dt * 4.6;
    }
    // При вращении вперёд в +Z нижняя точка колеса уходит в -Z -> положительный rotation.x!
    const wheelRot = rig.wheelSpin - recoil * 1.15;
    rig.wheelL.rotation.x = wheelRot;
    rig.wheelR.rotation.x = wheelRot;

    // Плавное возвышение бронзового ствола (-rotation.x поднимает дуло +Z вверх!) и откат в цапфах
    rig.barrelPivot.rotation.x = -elevRad - recoil * 0.14;
    rig.barrelPivot.position.z = 0.08 - recoil * 0.09;
    rig.gunCarriageGroup.position.z = -recoil * 0.18;
  } else if (rig.kind === 'wagon') {
    if (moving) {
      rig.wheelSpin += dt * 5.2;
    }
    for (let w = 0; w < rig.wheels.length; w++) {
      rig.wheels[w].group.rotation.x = rig.wheelSpin * rig.wheels[w].speedMul;
    }

    if (rig.draftHorse) {
      const dh = rig.draftHorse;
      if (moving) {
        const wPh = elapsed * 8.6 + phase;
        dh.legFL.rotation.x = Math.sin(wPh) * 0.42;
        dh.legBR.rotation.x = Math.sin(wPh + 0.35) * 0.38;
        dh.legFR.rotation.x = -Math.sin(wPh) * 0.42;
        dh.legBL.rotation.x = -Math.sin(wPh + 0.35) * 0.38;
        dh.neckPivot.rotation.x = 0.08 + Math.sin(wPh * 2.0) * 0.07;
        dh.tailPivot.rotation.x = 0.18 + Math.sin(wPh * 1.5) * 0.08;
      } else {
        dh.legFL.rotation.x = 0;
        dh.legFR.rotation.x = 0;
        dh.legBL.rotation.x = 0;
        dh.legBR.rotation.x = 0;
        dh.neckPivot.rotation.x = Math.sin(elapsed * 1.7 + phase) * 0.05;
        dh.neckPivot.rotation.y = Math.sin(elapsed * 0.8 + phase) * 0.12;
        dh.tailPivot.rotation.z = Math.sin(elapsed * 1.9 + phase) * 0.12;
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
