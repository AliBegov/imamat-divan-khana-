// ============================================================================
// УЛЬТРА-ДЕТАЛИЗИРОВАННЫЕ КАВКАЗСКИЕ БЕРКУТЫ (Aquila chrysaetos) — ПЕРЬЕВАЯ 3D-СКУЛЬПТУРА
// 1. Процедурный орнитологический PBR-атлас 2048×2048 (диффуз + альфа + карта нормалей +
//    карта шероховатости кератина): прорисовано каждое отдельное перо вплоть до рогового
//    стержня (rachis), сотен диагональных бородок I–II порядка и естественных расщепов опахала.
// 2. Свыше 340 реальных 3D-черепичных перьев на экземпляр (сшитых в единые BufferGeometry
//    без просадки FPS!):
//    - 84 золотисто-медных ланцетовидных пера темени, щёк и зашейка («золотой орёл»);
//    - 168 покровных перьев спины, плечевых пучков (scapulars), груди, надхвостья, подхвостья
//      и оперённых до пальцев цевок («штанов» беркута);
//    - 3 яруса черепичных верхних кроющих крыла (малые, охристо-рыжие средние и большие кроющие),
//      кроющие кисти, 3-перьевое крылышко (alula) и нижние кроющие подбоя на каждом крыле;
//    - 11 индивидуальных второстепенных/третьестепенных маховых перьев с объёмными стержнями;
//    - 7 индивидуально артикулированных пальцевых первостепенных маховых перьев (P10..P4) с
//      3D-очинами, выемкой сужения (emargination) и аэроупругим изгибом вверх;
//    - 12 раздельных 3D-рулевых перьев хвоста (R6..L6) с мраморной перевязью и 3D-стержнями;
//    - детальная голова (надбровные валики, ноздри в восковице, надклювье, подклювье, роговица глаза)
//      и четырёхпалые лапы хищника с задним когтем (hallux).
// ============================================================================
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

let cachedEagleAssets = null;

function drawBarbedPlumeOnCanvas(ctx, nctx, rctx, opts) {
  const {
    cx,
    topY,
    botY,
    halfW,
    pointed = false,
    baseColor = '#1b1009',
    midColor = '#3f2716',
    tipColor = '#8f5d32',
    shaftBase = '#cbbba5',
    shaftTip = '#2c1b10',
    barbDensity = 88
  } = opts;

  const h = botY - topY;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(cx - halfW * 0.28, botY);
  if (pointed) {
    // Заострённое ланцетовидное перо зашейка беркута
    ctx.bezierCurveTo(cx - halfW * 1.05, botY - h * 0.28, cx - halfW * 0.92, topY + h * 0.34, cx, topY);
    ctx.bezierCurveTo(cx + halfW * 0.92, topY + h * 0.34, cx + halfW * 1.05, botY - h * 0.28, cx + halfW * 0.28, botY);
  } else {
    // Миндалевидно-округлое покровное / кроющее перо с зубчатой бахромой бородки
    ctx.bezierCurveTo(cx - halfW * 1.04, botY - h * 0.24, cx - halfW * 1.08, topY + h * 0.22, cx - halfW * 0.42, topY + h * 0.05);
    ctx.quadraticCurveTo(cx, topY - h * 0.02, cx + halfW * 0.42, topY + h * 0.05);
    ctx.bezierCurveTo(cx + halfW * 1.08, topY + h * 0.22, cx + halfW * 1.04, botY - h * 0.24, cx + halfW * 0.28, botY);
  }
  ctx.closePath();

  const grad = ctx.createLinearGradient(cx, botY, cx, topY);
  grad.addColorStop(0.0, baseColor);
  grad.addColorStop(0.54, midColor);
  grad.addColorStop(0.88, tipColor);
  grad.addColorStop(1.0, tipColor);
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.save();
  ctx.clip();

  // Внутренний тёмный клин вокруг стержня и светлая кайма износа по краю пера
  const coreGrad = ctx.createRadialGradient(cx, botY - h * 0.38, halfW * 0.08, cx, botY - h * 0.38, halfW * 1.05);
  coreGrad.addColorStop(0.0, 'rgba(18, 10, 5, 0.55)');
  coreGrad.addColorStop(0.65, 'rgba(18, 10, 5, 0.12)');
  coreGrad.addColorStop(1.0, 'rgba(255, 222, 168, 0.18)');
  ctx.fillStyle = coreGrad;
  ctx.fillRect(cx - halfW * 1.2, topY, halfW * 2.4, h);

  // Индивидуальные диагональные бородки опахала (влево и вправо от стержня)
  for (let i = 0; i < barbDensity; i++) {
    const f = i / (barbDensity - 1);
    const y = botY - f * h * 0.96;
    const span = halfW * Math.sin(Math.min(1, f * 1.12) * Math.PI * (pointed ? 0.86 : 0.78) + 0.18);
    const barbTipY = y - h * (pointed ? 0.14 : 0.1);

    ctx.strokeStyle = i % 2 === 0 ? 'rgba(12, 7, 4, 0.44)' : 'rgba(252, 214, 152, 0.20)';
    ctx.lineWidth = pointed ? 2.1 : 2.3;
    ctx.beginPath();
    ctx.moveTo(cx, y);
    ctx.quadraticCurveTo(cx - span * 0.55, y - h * 0.03, cx - span * 1.08, barbTipY);
    ctx.moveTo(cx, y);
    ctx.quadraticCurveTo(cx + span * 0.55, y - h * 0.03, cx + span * 1.08, barbTipY);
    ctx.stroke();

    if (i % 2 === 0) {
      nctx.lineWidth = 2.6;
      nctx.strokeStyle = 'rgb(106, 150, 246)';
      nctx.beginPath();
      nctx.moveTo(cx, y);
      nctx.lineTo(cx - span, barbTipY);
      nctx.stroke();

      nctx.strokeStyle = 'rgb(150, 150, 246)';
      nctx.beginPath();
      nctx.moveTo(cx, y);
      nctx.lineTo(cx + span, barbTipY);
      nctx.stroke();
    }
  }

  // Естественные микро-расщепы (V-выемки) между группами бородок по краю пера
  ctx.globalCompositeOperation = 'destination-out';
  ctx.fillStyle = 'rgba(0,0,0,1)';
  const notches = pointed ? 9 : 12;
  for (let n = 1; n < notches; n++) {
    const nf = 0.22 + (n / notches) * 0.72;
    const ny = botY - nf * h;
    const edgeX = halfW * Math.sin(nf * Math.PI * (pointed ? 0.85 : 0.76) + 0.18);
    for (const sgn of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(cx + sgn * (edgeX * 1.06), ny - 7);
      ctx.lineTo(cx + sgn * (edgeX * 0.78), ny + 5);
      ctx.lineTo(cx + sgn * (edgeX * 1.06), ny + 9);
      ctx.closePath();
      ctx.fill();
    }
  }
  ctx.globalCompositeOperation = 'source-over';
  ctx.restore();

  // Роговой стержень (rachis) пера
  const sGrad = ctx.createLinearGradient(cx, botY, cx, topY);
  sGrad.addColorStop(0.0, shaftBase);
  sGrad.addColorStop(0.65, shaftTip);
  sGrad.addColorStop(1.0, tipColor);
  ctx.strokeStyle = sGrad;
  ctx.lineWidth = 6.5;
  ctx.beginPath();
  ctx.moveTo(cx, botY);
  ctx.lineTo(cx, topY + 8);
  ctx.stroke();

  nctx.strokeStyle = 'rgb(176, 128, 255)';
  nctx.lineWidth = 8.0;
  nctx.beginPath();
  nctx.moveTo(cx, botY);
  nctx.lineTo(cx, topY + 8);
  nctx.stroke();

  // Блестящий кератиновый стержень на карте шероховатости (темнее = более глянцевый кератин)
  rctx.strokeStyle = 'rgb(88, 88, 88)';
  rctx.lineWidth = 8.0;
  rctx.beginPath();
  rctx.moveTo(cx, botY);
  rctx.lineTo(cx, topY + 8);
  rctx.stroke();
  ctx.restore();
}

function createGoldenEaglePlumageTextures() {
  const W = 2048;
  const H = 2048;

  const diffCanvas = document.createElement('canvas');
  diffCanvas.width = W;
  diffCanvas.height = H;
  const ctx = diffCanvas.getContext('2d');
  ctx.clearRect(0, 0, W, H);

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
  rctx.fillStyle = 'rgb(186, 186, 186)';
  rctx.fillRect(0, 0, W, H);

  // --------------------------------------------------------------------------
  // КВАДРАНТ 1A [x: 0..512, y: 28..984] -> u:[0.02..0.23], v:[0.52..0.986]
  // Тёмно-умбристое покровное и большое кроющее перо беркута с тёплой каймой
  // --------------------------------------------------------------------------
  drawBarbedPlumeOnCanvas(ctx, nctx, rctx, {
    cx: 256,
    topY: 28,
    botY: 984,
    halfW: 196,
    pointed: false,
    baseColor: '#160d07',
    midColor: '#2e1c10',
    tipColor: '#694323',
    shaftBase: '#b8a68e',
    shaftTip: '#1c110a',
    barbDensity: 96
  });

  // --------------------------------------------------------------------------
  // КВАДРАНТ 1B [x: 512..1024, y: 28..984] -> u:[0.27..0.48], v:[0.52..0.986]
  // Выгоревшее на высокогорном солнце охристо-каштановое среднее кроющее / плечевое перо
  // --------------------------------------------------------------------------
  drawBarbedPlumeOnCanvas(ctx, nctx, rctx, {
    cx: 768,
    topY: 28,
    botY: 984,
    halfW: 196,
    pointed: false,
    baseColor: '#21130b',
    midColor: '#5c381c',
    tipColor: '#b98043',
    shaftBase: '#d4c3aa',
    shaftTip: '#3b2413',
    barbDensity: 96
  });

  // --------------------------------------------------------------------------
  // КВАДРАНТ 2 [x: 1024..2048, y: 28..984] -> u:[0.54..0.96], v:[0.52..0.986]
  // Золотисто-медное ланцетовидное перо шапочки и зашейка («золотой орёл» — Aquila chrysaetos)
  // --------------------------------------------------------------------------
  drawBarbedPlumeOnCanvas(ctx, nctx, rctx, {
    cx: 1536,
    topY: 28,
    botY: 984,
    halfW: 340,
    pointed: true,
    baseColor: '#28160a',
    midColor: '#ab6019',
    tipColor: '#f4be5c',
    shaftBase: '#e8cfa6',
    shaftTip: '#8c4d14',
    barbDensity: 112
  });

  // Гарантированный чистый прозрачный буфер между верхними и нижними квадрантами (защита mipmap)
  ctx.clearRect(0, 988, W, 76);

  // --------------------------------------------------------------------------
  // КВАДРАНТ 3 [x: 0..1024, y: 1068..2024] -> u:[0.02..0.48], v:[0.012..0.478]
  // Асимметричное маховое перо крыла (Primary / Secondary Remex) с выемкой emargination
  // --------------------------------------------------------------------------
  ctx.save();
  ctx.translate(432, 1068);
  ctx.beginPath();
  ctx.moveTo(-92, 956); // широкое основание пера (v ~ 0.012)
  ctx.bezierCurveTo(-298, 760, -334, 410, -232, 138); // узкое жёсткое переднее опахало
  ctx.bezierCurveTo(-152, 42, -52, 8, 8, 0); // вершина пера (v ~ 0.478)
  ctx.bezierCurveTo(92, 16, 194, 98, 232, 286); // выемка пальцевого сужения (emargination)
  ctx.bezierCurveTo(418, 438, 488, 730, 332, 956); // широкое внутреннее опахало
  ctx.closePath();

  const remexGrad = ctx.createLinearGradient(0, 956, 0, 0);
  remexGrad.addColorStop(0.0, '#6a5745');
  remexGrad.addColorStop(0.28, '#4a3728');
  remexGrad.addColorStop(0.52, '#291c13');
  remexGrad.addColorStop(0.78, '#150e0a');
  remexGrad.addColorStop(1.0, '#0b0705');
  ctx.fillStyle = remexGrad;
  ctx.fill();

  ctx.save();
  ctx.clip();
  // Поперечные дымчато-мраморные перевязи на внутреннем опахале махового пера
  for (let b = 0; b < 9; b++) {
    const by = 340 + b * 68;
    ctx.fillStyle = b % 2 === 0 ? 'rgba(156, 134, 108, 0.25)' : 'rgba(15, 9, 5, 0.38)';
    ctx.beginPath();
    ctx.ellipse(155, by, 330, 24, -0.15, 0, Math.PI * 2);
    ctx.fill();
  }
  // 190 детальных диагональных бородок I порядка
  for (let k = 12; k < 950; k += 5) {
    ctx.strokeStyle = k % 10 === 0 ? 'rgba(218, 192, 158, 0.14)' : 'rgba(8, 5, 3, 0.42)';
    ctx.lineWidth = 2.1;
    ctx.beginPath();
    ctx.moveTo(-14, k);
    ctx.lineTo(-345, k - 68);
    ctx.moveTo(-8, k);
    ctx.lineTo(505, k - 88);
    ctx.stroke();
  }
  // Естественные микро-зубчики бородок по заднему краю махового пера
  ctx.globalCompositeOperation = 'destination-out';
  ctx.fillStyle = 'rgba(0,0,0,1)';
  for (let n = 0; n < 14; n++) {
    const ny = 180 + n * 52;
    const ex = ny < 310 ? 228 : 415;
    ctx.beginPath();
    ctx.moveTo(ex + 35, ny - 6);
    ctx.lineTo(ex - 26, ny + 4);
    ctx.lineTo(ex + 35, ny + 10);
    ctx.closePath();
    ctx.fill();
  }
  ctx.globalCompositeOperation = 'source-over';
  ctx.restore();

  // Мощный роговой стержень махового пера (rachis)
  const remShaftGrad = ctx.createLinearGradient(0, 956, 0, 0);
  remShaftGrad.addColorStop(0.0, '#dfd2be');
  remShaftGrad.addColorStop(0.48, '#9c866d');
  remShaftGrad.addColorStop(1.0, '#241811');
  ctx.beginPath();
  ctx.moveTo(-16, 956);
  ctx.quadraticCurveTo(-22, 460, 4, 6);
  ctx.lineWidth = 10.5;
  ctx.strokeStyle = remShaftGrad;
  ctx.stroke();
  ctx.restore();

  nctx.save();
  nctx.translate(432, 1068);
  nctx.lineWidth = 13;
  nctx.strokeStyle = 'rgb(184, 128, 255)';
  nctx.beginPath();
  nctx.moveTo(-16, 956);
  nctx.lineTo(4, 6);
  nctx.stroke();
  for (let k = 18; k < 946; k += 10) {
    nctx.strokeStyle = 'rgb(112, 152, 246)';
    nctx.lineWidth = 2.6;
    nctx.beginPath();
    nctx.moveTo(-12, k);
    nctx.lineTo(465, k - 80);
    nctx.moveTo(-12, k);
    nctx.lineTo(-325, k - 60);
    nctx.stroke();
  }
  nctx.restore();

  rctx.save();
  rctx.translate(432, 1068);
  rctx.lineWidth = 11;
  rctx.strokeStyle = 'rgb(82, 82, 82)';
  rctx.beginPath();
  rctx.moveTo(-16, 956);
  rctx.lineTo(4, 6);
  rctx.stroke();
  rctx.restore();

  // --------------------------------------------------------------------------
  // КВАДРАНТ 4 [x: 1024..2048, y: 1068..2024] -> u:[0.53..0.97], v:[0.012..0.478]
  // Широкое рулевое перо хвоста (Rectrix) с пепельно-мраморными волнами и тёмной вершиной
  // --------------------------------------------------------------------------
  ctx.save();
  ctx.translate(1536, 1068);
  ctx.beginPath();
  ctx.moveTo(-165, 956);
  ctx.bezierCurveTo(-345, 690, -395, 315, -318, 82);
  ctx.quadraticCurveTo(0, -10, 318, 82);
  ctx.bezierCurveTo(395, 315, 345, 690, 165, 956);
  ctx.closePath();

  const rectrixGrad = ctx.createLinearGradient(0, 956, 0, 0);
  rectrixGrad.addColorStop(0.0, '#24160d');
  rectrixGrad.addColorStop(0.20, '#786653');
  rectrixGrad.addColorStop(0.45, '#96836e');
  rectrixGrad.addColorStop(0.62, '#241810');
  rectrixGrad.addColorStop(0.93, '#120b07');
  rectrixGrad.addColorStop(1.0, '#b59e82');
  ctx.fillStyle = rectrixGrad;
  ctx.fill();

  ctx.save();
  ctx.clip();
  for (let w = 0; w < 6; w++) {
    const wy = 430 + w * 72;
    ctx.strokeStyle = w % 2 === 0 ? 'rgba(30, 19, 12, 0.46)' : 'rgba(186, 166, 140, 0.28)';
    ctx.lineWidth = 26;
    ctx.beginPath();
    ctx.moveTo(-400, wy);
    ctx.quadraticCurveTo(0, wy - 34, 400, wy + 10);
    ctx.stroke();
  }
  for (let k = 16; k < 948; k += 5.5) {
    ctx.strokeStyle = k % 11 === 0 ? 'rgba(220, 198, 168, 0.14)' : 'rgba(10, 6, 4, 0.40)';
    ctx.lineWidth = 2.1;
    ctx.beginPath();
    ctx.moveTo(0, k);
    ctx.lineTo(-390, k - 66);
    ctx.moveTo(0, k);
    ctx.lineTo(390, k - 66);
    ctx.stroke();
  }
  // Расщепы бородок на закруглённой вершине рулевого пера
  ctx.globalCompositeOperation = 'destination-out';
  ctx.fillStyle = 'rgba(0,0,0,1)';
  for (let a = -5; a <= 5; a++) {
    if (a === 0) continue;
    const nx = a * 54;
    const ny = 18 + Math.abs(a) * 11;
    ctx.beginPath();
    ctx.moveTo(nx - 7, ny - 10);
    ctx.lineTo(nx, ny + 18);
    ctx.lineTo(nx + 7, ny - 10);
    ctx.closePath();
    ctx.fill();
  }
  ctx.globalCompositeOperation = 'source-over';
  ctx.restore();

  const tailShaftGrad = ctx.createLinearGradient(0, 956, 0, 0);
  tailShaftGrad.addColorStop(0.0, '#e2d6c3');
  tailShaftGrad.addColorStop(0.58, '#a8947b');
  tailShaftGrad.addColorStop(1.0, '#2a1d14');
  ctx.beginPath();
  ctx.moveTo(0, 956);
  ctx.lineTo(0, 10);
  ctx.lineWidth = 9.5;
  ctx.strokeStyle = tailShaftGrad;
  ctx.stroke();
  ctx.restore();

  nctx.save();
  nctx.translate(1536, 1068);
  nctx.lineWidth = 12;
  nctx.strokeStyle = 'rgb(180, 128, 255)';
  nctx.beginPath();
  nctx.moveTo(0, 956);
  nctx.lineTo(0, 10);
  nctx.stroke();
  for (let k = 22; k < 944; k += 11) {
    nctx.strokeStyle = 'rgb(114, 150, 246)';
    nctx.lineWidth = 2.4;
    nctx.beginPath();
    nctx.moveTo(0, k);
    nctx.lineTo(-375, k - 64);
    nctx.moveTo(0, k);
    nctx.lineTo(375, k - 64);
    nctx.stroke();
  }
  nctx.restore();

  // Маленькая непрозрачная текстура пухового подслоя (чтобы между 3D-перьями ни под каким углом не светилось небо)
  const underCanvas = document.createElement('canvas');
  underCanvas.width = 256;
  underCanvas.height = 256;
  const uctx = underCanvas.getContext('2d');
  const uGrad = uctx.createLinearGradient(0, 0, 0, 256);
  uGrad.addColorStop(0.0, '#22140c');
  uGrad.addColorStop(0.5, '#2e1b10');
  uGrad.addColorStop(1.0, '#170e08');
  uctx.fillStyle = uGrad;
  uctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 420; i++) {
    const ux = (i * 53) % 256;
    const uy = (i * 37) % 256;
    uctx.strokeStyle = i % 3 === 0 ? 'rgba(138, 92, 48, 0.25)' : 'rgba(12, 7, 4, 0.45)';
    uctx.lineWidth = 1.4;
    uctx.beginPath();
    uctx.moveTo(ux, uy);
    uctx.lineTo(ux + ((i % 5) - 2) * 3, uy + 14);
    uctx.stroke();
  }

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

  const underTex = new THREE.CanvasTexture(underCanvas);
  underTex.colorSpace = THREE.SRGBColorSpace;
  underTex.wrapS = THREE.RepeatWrapping;
  underTex.wrapT = THREE.RepeatWrapping;
  underTex.needsUpdate = true;

  return { diffTex, normTex, roughTex, underTex };
}

function remapGeometryUVQuad(geo, u0, v0, u1, v1) {
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

function ensureNonIndexedUV(geo) {
  const g = geo.index ? geo.toNonIndexed() : geo;
  if (!g.attributes.uv) {
    const count = g.attributes.position.count;
    const uvs = new Float32Array(count * 2);
    g.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  }
  return g;
}

// Универсальная выгнутая 3D-карточка одиночного покровного / кроющего / ланцетовидного пера:
// очин в (0,0,0), рост к кончику вдоль +Z (0..length), ширина по X, дорсальный свод по +Y.
function createPlumeCardTemplate(length, width, camber, u0, v0, u1, v1) {
  const geo = new THREE.PlaneGeometry(width, length, 2, 4);
  geo.translate(0, length * 0.5, 0); // root at y=0 (uv.y=0), tip at y=length (uv.y=1)
  geo.rotateX(Math.PI * 0.5); // root at z=0, tip at z=+length
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const z = p.getZ(i);
    const t = Math.max(0, Math.min(1, z / length));
    const archY = Math.sin(t * Math.PI) * camber - (x * x) / Math.max(0.001, width * width) * camber * 0.65;
    p.setY(i, archY);
  }
  geo.computeVertexNormals();
  remapGeometryUVQuad(geo, u0, v0, u1, v1);
  return ensureNonIndexedUV(geo);
}

function placePlumeInstance(templateGeo, rootPos, growDir, outwardNormal, scaleLen = 1, scaleWid = 1, shingleLift = 0.11) {
  const zAxis = growDir.clone().normalize();
  const nrm = outwardNormal.clone().normalize();
  // Приподнимаем кончик пера на малый угол над поверхностью для настоящей 3D-черепичной ступеньки перьев!
  zAxis.addScaledVector(nrm, shingleLift).normalize();
  let xAxis = new THREE.Vector3().crossVectors(nrm, zAxis);
  if (xAxis.lengthSq() < 1e-5) {
    xAxis.set(1, 0, 0);
  } else {
    xAxis.normalize();
  }
  const yAxis = new THREE.Vector3().crossVectors(zAxis, xAxis).normalize();

  const mat = new THREE.Matrix4().makeBasis(
    xAxis.multiplyScalar(scaleWid),
    yAxis,
    zAxis.multiplyScalar(scaleLen)
  );
  mat.setPosition(rootPos);
  const g = templateGeo.clone();
  g.applyMatrix4(mat);
  return g;
}

function createSingleRemexFeatherGeo(length = 0.52, width = 0.16, camber = 0.024, sideSign = -1) {
  const segL = 9;
  const segW = 3;
  const blade = new THREE.PlaneGeometry(width, length, segW, segL);
  blade.translate(0, length * 0.5, 0);
  const pos = blade.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const t = Math.max(0, Math.min(1, y / length));
    const curveSweepX = -sideSign * t * t * width * 0.15;
    const archZ = Math.sin(t * Math.PI) * camber + sideSign * (x / width) * 0.012;
    pos.setXYZ(i, x + curveSweepX, y, archZ);
  }
  blade.computeVertexNormals();
  if (sideSign < 0) {
    remapGeometryUVQuad(blade, 0.02, 0.012, 0.48, 0.478);
  } else {
    remapGeometryUVQuad(blade, 0.48, 0.012, 0.02, 0.478);
  }

  // Настоящий 3D-объёмный роговой стержень (rachis/calamus) вдоль пера!
  const quill = new THREE.CylinderGeometry(0.0014, 0.0048, length * 0.88, 5, 4);
  quill.translate(0, length * 0.44, 0.002);
  const qp = quill.attributes.position;
  for (let i = 0; i < qp.count; i++) {
    const qy = qp.getY(i);
    const qt = Math.max(0, Math.min(1, qy / length));
    const qSweepX = -sideSign * qt * qt * width * 0.14;
    const qArchZ = Math.sin(qt * Math.PI) * camber;
    qp.setXYZ(i, qp.getX(i) + qSweepX, qy, qp.getZ(i) + qArchZ);
  }
  quill.computeVertexNormals();
  remapGeometryUVQuad(quill, 0.23, 0.02, 0.27, 0.46);

  return mergeGeometries([ensureNonIndexedUV(blade), ensureNonIndexedUV(quill)], false);
}

function createSingleTailRectrixGeo(length = 0.40, width = 0.116, camber = 0.016) {
  const blade = new THREE.PlaneGeometry(width, length, 3, 7);
  blade.translate(0, length * 0.5, 0);
  const pos = blade.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const t = Math.max(0, Math.min(1, y / length));
    const widen = 0.56 + t * 0.52;
    const archZ = Math.sin(t * Math.PI) * camber;
    pos.setXYZ(i, x * widen, y, archZ);
  }
  blade.computeVertexNormals();
  remapGeometryUVQuad(blade, 0.53, 0.012, 0.97, 0.478);

  const quill = new THREE.CylinderGeometry(0.0013, 0.0042, length * 0.86, 5, 3);
  quill.translate(0, length * 0.43, 0.002);
  const qp = quill.attributes.position;
  for (let i = 0; i < qp.count; i++) {
    const qy = qp.getY(i);
    const qt = Math.max(0, Math.min(1, qy / length));
    qp.setZ(i, qp.getZ(i) + Math.sin(qt * Math.PI) * camber);
  }
  quill.computeVertexNormals();
  remapGeometryUVQuad(quill, 0.74, 0.02, 0.76, 0.46);

  const merged = mergeGeometries([ensureNonIndexedUV(blade), ensureNonIndexedUV(quill)], false);
  merged.rotateX(-Math.PI * 0.5); // root at (0,0,0), grows along -Z, camber along +Y
  return merged;
}

function buildEagleSharedGeometries() {
  // Базовые шаблоны одиночных 3D-перьев из 2048×2048 атласа
  const darkPlumeTpl = createPlumeCardTemplate(0.115, 0.068, 0.011, 0.02, 0.52, 0.23, 0.986);
  const tawnyPlumeTpl = createPlumeCardTemplate(0.12, 0.072, 0.012, 0.27, 0.52, 0.48, 0.986);
  const goldenHackleTpl = createPlumeCardTemplate(0.095, 0.042, 0.009, 0.54, 0.52, 0.96, 0.986);

  // ==========================================================================
  // 1. КОРПУС: внутреннее мускулистое пуховое ядро + 168 черепичных 3D-перьев!
  // ==========================================================================
  const sampleTorsoRadius = (z) => {
    // z от -0.38 (гузка) до +0.32 (шея)
    const u = Math.max(0, Math.min(1, (z + 0.38) / 0.70));
    const profile = Math.sin(Math.pow(u, 0.72) * Math.PI);
    return {
      rx: 0.022 + profile * 0.112,
      ryTop: 0.018 + profile * 0.068,
      ryBot: 0.018 + profile * 0.088
    };
  };

  const torsoProfile = [
    new THREE.Vector2(0.001, -0.39),
    new THREE.Vector2(0.045, -0.30),
    new THREE.Vector2(0.084, -0.15),
    new THREE.Vector2(0.108, 0.02),
    new THREE.Vector2(0.102, 0.16),
    new THREE.Vector2(0.072, 0.26),
    new THREE.Vector2(0.001, 0.33)
  ];
  const torsoCore = new THREE.LatheGeometry(torsoProfile, 18);
  torsoCore.rotateX(Math.PI * 0.5);
  const tPos = torsoCore.attributes.position;
  for (let i = 0; i < tPos.count; i++) {
    const x = tPos.getX(i);
    const y = tPos.getY(i);
    const z = tPos.getZ(i);
    const wS = z > -0.15 && z < 0.22 ? 1.15 : 1.02;
    const hS = y > 0 ? 0.74 : 0.86;
    tPos.setXYZ(i, x * wS, y * hS, z);
  }
  torsoCore.computeVertexNormals();

  // Оперённые цевки («штаны» беркута)
  const tarsusCoreL = new THREE.ConeGeometry(0.029, 0.135, 8);
  tarsusCoreL.rotateX(-Math.PI * 0.48);
  tarsusCoreL.translate(-0.038, -0.056, -0.22);
  const tarsusCoreR = new THREE.ConeGeometry(0.029, 0.135, 8);
  tarsusCoreR.rotateX(-Math.PI * 0.48);
  tarsusCoreR.translate(0.038, -0.056, -0.22);

  const bodyUndercoatGeo = mergeGeometries(
    [ensureNonIndexedUV(torsoCore), ensureNonIndexedUV(tarsusCoreL), ensureNonIndexedUV(tarsusCoreR)],
    false
  );

  // 168 реальных 3D-перьев по всему корпусу (спина, плечевые пучки scapulars, грудь, брюшко, надхвостье и «штаны» лап!)
  const bodyPlumes = [];
  const rowCount = 13;
  for (let r = 0; r < rowCount; r++) {
    const rf = r / (rowCount - 1);
    const z = 0.255 - rf * 0.585; // укладываем от шеи (+0.255) к хвосту (-0.33), чтобы передние ряды накрывали задние черепицей!
    const { rx, ryTop, ryBot } = sampleTorsoRadius(z);
    const ringCount = r < 2 || r > 10 ? 10 : 14;
    for (let c = 0; c < ringCount; c++) {
      const ang = ((c + (r % 2) * 0.5) / ringCount) * Math.PI * 2;
      const cosA = Math.cos(ang); // +1 спина (+Y), -1 киль/брюшко (-Y)
      const sinA = Math.sin(ang); // -1 левый бок, +1 правый бок
      const ry = cosA >= 0 ? ryTop : ryBot;
      const root = new THREE.Vector3(sinA * rx * 0.96, cosA * ry * 0.96, z);
      const nrm = new THREE.Vector3(sinA / Math.max(0.02, rx), cosA / Math.max(0.02, ry), -0.08).normalize();
      const grow = new THREE.Vector3(sinA * 0.14, cosA * 0.06, -1.0).normalize();

      // На плечах и лопатках (scapulars) добавляем выгоревшие охристо-рыжие перья взрослого беркута
      const isScapularTawny = cosA > 0.25 && Math.abs(sinA) > 0.42 && r >= 2 && r <= 7;
      const tpl = isScapularTawny ? tawnyPlumeTpl : darkPlumeTpl;
      const sLen = 0.78 + Math.sin(rf * Math.PI) * 0.38;
      const sWid = 0.82 + Math.sin(rf * Math.PI) * 0.34;
      bodyPlumes.push(placePlumeInstance(tpl, root, grow, nrm, sLen, sWid, 0.13));
    }
  }

  // Веер верхних и нижних кроющих хвоста (надхвостье и подхвостье — закрывают стык 12 рулевых перьев!)
  for (let tc = -4; tc <= 4; tc++) {
    const tf = tc / 4;
    bodyPlumes.push(
      placePlumeInstance(
        tc % 2 === 0 ? tawnyPlumeTpl : darkPlumeTpl,
        new THREE.Vector3(tf * 0.055, 0.022 - Math.abs(tf) * 0.008, -0.285),
        new THREE.Vector3(tf * 0.22, -0.04, -1.0),
        new THREE.Vector3(tf * 0.2, 1.0, 0.05),
        1.12,
        0.95,
        0.09
      )
    );
    bodyPlumes.push(
      placePlumeInstance(
        darkPlumeTpl,
        new THREE.Vector3(tf * 0.048, -0.024 + Math.abs(tf) * 0.006, -0.275),
        new THREE.Vector3(tf * 0.18, 0.05, -1.0),
        new THREE.Vector3(tf * 0.2, -1.0, 0.05),
        1.04,
        0.9,
        0.08
      )
    );
  }

  // Мелкие перья на оперённых до самых пальцев цевках («штаны» беркута)
  for (const legX of [-0.038, 0.038]) {
    for (let lr = 0; lr < 3; lr++) {
      for (let lc = 0; lc < 5; lc++) {
        const la = (lc / 5) * Math.PI * 2;
        const lz = -0.175 - lr * 0.036;
        const ly = -0.052 - lr * 0.006 + Math.cos(la) * 0.021;
        const lx = legX + Math.sin(la) * 0.021;
        bodyPlumes.push(
          placePlumeInstance(
            lr === 1 ? tawnyPlumeTpl : darkPlumeTpl,
            new THREE.Vector3(lx, ly, lz),
            new THREE.Vector3(Math.sin(la) * 0.12, -0.15, -1.0),
            new THREE.Vector3(Math.sin(la), Math.cos(la), -0.1),
            0.52,
            0.48,
            0.14
          )
        );
      }
    }
  }

  const bodyPlumageCardsGeo = mergeGeometries(bodyPlumes, false);

  // ==========================================================================
  // 2. ГОЛОВА И ШЕЯ: череп, надбровные дуги, 84 золотисто-медных 3D-пера зашейка,
  //    восковица с ноздрями, двусоставный крючковатый клюв и глаза с роговицей!
  // ==========================================================================
  const skullCore = new THREE.SphereGeometry(0.064, 14, 12);
  skullCore.scale(0.92, 0.84, 1.24);
  const neckCore = new THREE.ConeGeometry(0.068, 0.16, 12);
  neckCore.rotateX(-Math.PI * 0.56);
  neckCore.translate(0, -0.004, -0.055);
  const browL = new THREE.BoxGeometry(0.028, 0.015, 0.064);
  browL.rotateY(0.19);
  browL.translate(-0.043, 0.029, 0.036);
  const browR = new THREE.BoxGeometry(0.028, 0.015, 0.064);
  browR.rotateY(-0.19);
  browR.translate(0.043, 0.029, 0.036);
  const headUndercoatGeo = mergeGeometries(
    [ensureNonIndexedUV(skullCore), ensureNonIndexedUV(neckCore), ensureNonIndexedUV(browL), ensureNonIndexedUV(browR)],
    false
  );

  // 98 заострённых золотисто-янтарных ланцетовидных перьев ото лба (у самой восковицы!) по темени, щекам и зашейку!
  const headHackles = [];
  for (let hr = 0; hr < 9; hr++) {
    const hf = hr / 8;
    const hz = 0.076 - hf * 0.196; // от самого края жёлтой восковицы (+0.076) по темени и зашейку до плеч (-0.120)
    const foreheadPinch = hr < 2 ? 0.72 + hr * 0.14 : 1.0;
    const radX = (0.042 + hf * 0.032) * foreheadPinch;
    const radY = (0.040 + hf * 0.024) * foreheadPinch;
    const countInRow = 9 + Math.floor(hf * 6);
    for (let hc = 0; hc < countInRow; hc++) {
      const u = countInRow > 1 ? hc / (countInRow - 1) : 0.5;
      const ang = (u - 0.5) * (hr < 2 ? 2.2 : 4.4);
      const sinA = Math.sin(ang);
      const cosA = Math.cos(ang);
      // Оставляем открытыми глазницы под надбровными дугами
      if (hr >= 1 && hr <= 3 && Math.abs(ang) > 0.85 && Math.abs(ang) < 1.92) continue;

      const root = new THREE.Vector3(sinA * radX, cosA * radY, hz);
      const nrm = new THREE.Vector3(sinA, cosA, 0.12).normalize();
      const grow = new THREE.Vector3(sinA * 0.22, cosA * 0.05 - 0.10, -1.0).normalize();
      const sLen = 0.46 + hf * 0.72;
      const sWid = 0.54 + hf * 0.52;
      headHackles.push(placePlumeInstance(goldenHackleTpl, root, grow, nrm, sLen, sWid, 0.14));
    }
  }
  const headHacklesGeo = mergeGeometries(headHackles, false);

  // Глаза хищника: тёмное веко + янтарная радужка + чёрный зрачок
  const irisL = new THREE.SphereGeometry(0.0135, 10, 10);
  irisL.translate(-0.043, 0.014, 0.044);
  const irisR = new THREE.SphereGeometry(0.0135, 10, 10);
  irisR.translate(0.043, 0.014, 0.044);
  const eyesGeo = mergeGeometries([ensureNonIndexedUV(irisL), ensureNonIndexedUV(irisR)], false);

  const pupilL = new THREE.SphereGeometry(0.0075, 8, 8);
  pupilL.translate(-0.049, 0.014, 0.047);
  const pupilR = new THREE.SphereGeometry(0.0075, 8, 8);
  pupilR.translate(0.049, 0.014, 0.047);

  // Жёлтая восковица и четырёхпалые чешуйчатые лапы беркута (3 пальца вперёд + мощный задний палец hallux!)
  const cere = new THREE.SphereGeometry(0.028, 10, 8);
  cere.scale(0.88, 0.84, 1.08);
  cere.translate(0, -0.001, 0.086);
  const cereGeo = ensureNonIndexedUV(cere);

  const toeParts = [];
  const headHornParts = [ensureNonIndexedUV(pupilL), ensureNonIndexedUV(pupilR)];
  const footClawParts = [];
  // Ноздри на восковице
  for (const nx of [-0.014, 0.014]) {
    const naris = new THREE.SphereGeometry(0.0045, 6, 6);
    naris.scale(0.7, 1.1, 1.5);
    naris.translate(nx, 0.005, 0.095);
    headHornParts.push(ensureNonIndexedUV(naris));
  }

  for (const footX of [-0.038, 0.038]) {
    // 3 передних пальца и 1 задний внутренний хватательный палец (hallux) с самым крупным серповидным когтем
    const toes = [
      { ox: -0.009, oy: -0.065, oz: -0.285, rotX: -Math.PI * 0.62, clawScale: 0.95 },
      { ox: 0.0, oy: -0.067, oz: -0.289, rotX: -Math.PI * 0.65, clawScale: 1.12 },
      { ox: 0.009, oy: -0.065, oz: -0.285, rotX: -Math.PI * 0.62, clawScale: 0.95 },
      { ox: -Math.sign(footX) * 0.005, oy: -0.056, oz: -0.268, rotX: Math.PI * 0.58, clawScale: 1.28 }
    ];
    toes.forEach((td) => {
      const digit = new THREE.CylinderGeometry(0.0042, 0.0055, 0.024, 6);
      digit.rotateX(td.rotX);
      digit.translate(footX + td.ox, td.oy, td.oz);
      toeParts.push(ensureNonIndexedUV(digit));

      const claw = new THREE.ConeGeometry(0.0048 * td.clawScale, 0.030 * td.clawScale, 7);
      claw.rotateX(td.rotX - 0.35);
      claw.translate(footX + td.ox, td.oy - 0.011, td.oz - 0.014);
      footClawParts.push(ensureNonIndexedUV(claw));
    });
  }
  const feetYellowGeo = mergeGeometries(toeParts, false);
  const talonsGeo = mergeGeometries(footClawParts, false);

  // Цельное плавно изогнутое вниз хищное надклювье (без швов!) и подклювье
  const upperBeak = new THREE.ConeGeometry(0.025, 0.116, 12, 7);
  upperBeak.translate(0, 0.058, 0); // основание в (0,0,0), остриё в y=+0.116
  upperBeak.rotateX(Math.PI * 0.5); // основание в (0,0,0), остриё вдоль +Z (0..0.116)
  const bp = upperBeak.attributes.position;
  for (let i = 0; i < bp.count; i++) {
    const bx = bp.getX(i);
    const by = bp.getY(i);
    const bz = bp.getZ(i);
    const t = Math.max(0, Math.min(1, bz / 0.116));
    // Плавный серповидный загиб хищного клюва орла вниз к кончику
    const hookDropY = -Math.pow(t, 2.2) * 0.044;
    const pullBackZ = -Math.pow(t, 3.0) * 0.016;
    bp.setXYZ(i, bx * 0.78, by * 0.92 + hookDropY, 0.088 + bz * 0.84 + pullBackZ);
  }
  upperBeak.computeVertexNormals();

  const lowerMandible = new THREE.ConeGeometry(0.017, 0.068, 10);
  lowerMandible.rotateX(Math.PI * 0.52);
  lowerMandible.scale(0.74, 0.68, 1.0);
  lowerMandible.translate(0, -0.019, 0.112);

  const beakAndHeadHornGeo = mergeGeometries(
    [ensureNonIndexedUV(upperBeak), ensureNonIndexedUV(lowerMandible), ...headHornParts],
    false
  );

  // ==========================================================================
  // 3. ВНУТРЕННЕЕ КРЫЛО: профилированное ядро + 3 ЧЕРЕПИЧНЫХ ЯРУСА 3D-КРОЮЩИХ ПЕРЬЕВ
  //    (малые, охристо-золотистые средние и большие кроющие) + нижний подбой + 11 маховых!
  // ==========================================================================
  const buildInnerLeadingWingGeo = (sideSign) => {
    const span = 0.50;
    const sparCore = new THREE.BoxGeometry(span, 0.026, 0.19, 10, 1, 4);
    sparCore.translate(sideSign * (span * 0.46), 0.006, 0.002);
    const sp = sparCore.attributes.position;
    for (let i = 0; i < sp.count; i++) {
      const x = sp.getX(i);
      const y = sp.getY(i);
      const z = sp.getZ(i);
      const u = Math.min(1, Math.abs(x) / span);
      const chordFrac = Math.max(0, Math.min(1, (0.098 - z) / 0.19));
      const thick = Math.sin(chordFrac * Math.PI * 0.88) * (1.0 - u * 0.32);
      const sweepZ = Math.sin(u * Math.PI * 0.7) * 0.046;
      const camberY = Math.sin(chordFrac * Math.PI) * 0.018 + Math.sin(u * Math.PI) * 0.01;
      sp.setXYZ(i, x, y * thick + camberY, z + sweepZ);
    }
    sparCore.computeVertexNormals();

    // Настоящие 3D-ряды кроющих перьев крыла!
    const covertPlumes = [];
    // Ярус 1 (передняя кромка): 14 малых кроющих перьев (Lesser Coverts)
    for (let i = 0; i < 14; i++) {
      const u = i / 13;
      const x = sideSign * (0.01 + u * 0.46);
      const sweepZ = Math.sin(u * Math.PI * 0.7) * 0.046;
      covertPlumes.push(
        placePlumeInstance(
          darkPlumeTpl,
          new THREE.Vector3(x, 0.018, 0.078 + sweepZ),
          new THREE.Vector3(sideSign * 0.14, -0.04, -1.0),
          new THREE.Vector3(0, 1, 0.18),
          0.74,
          0.78,
          0.11
        )
      );
    }
    // Ярус 2 (средний пояс): 13 выгоревших охристо-рыжих средних кроющих (Median Coverts — визитная карточка взрослого беркута!)
    for (let i = 0; i < 13; i++) {
      const u = i / 12;
      const x = sideSign * (0.012 + u * 0.455);
      const sweepZ = Math.sin(u * Math.PI * 0.7) * 0.046;
      covertPlumes.push(
        placePlumeInstance(
          tawnyPlumeTpl,
          new THREE.Vector3(x, 0.020, 0.036 + sweepZ),
          new THREE.Vector3(sideSign * 0.12, -0.05, -1.0),
          new THREE.Vector3(0, 1, 0.08),
          0.98,
          0.94,
          0.10
        )
      );
    }
    // Ярус 3 (задний ряд кроющих): 12 длинных больших кроющих перьев (Greater Coverts), перекрывающих основания второстепенных маховых!
    for (let i = 0; i < 12; i++) {
      const u = i / 11;
      const x = sideSign * (0.014 + u * 0.45);
      const sweepZ = Math.sin(u * Math.PI * 0.7) * 0.046;
      covertPlumes.push(
        placePlumeInstance(
          i % 3 === 1 ? tawnyPlumeTpl : darkPlumeTpl,
          new THREE.Vector3(x, 0.016, -0.018 + sweepZ),
          new THREE.Vector3(sideSign * 0.09, -0.04, -1.0),
          new THREE.Vector3(0, 1, 0.02),
          1.22,
          1.05,
          0.08
        )
      );
    }
    // Нижние кроющие подбоя крыла (Underwing Coverts — для реализма при взгляде снизу с земли!)
    for (let i = 0; i < 12; i++) {
      const u = i / 11;
      const x = sideSign * (0.015 + u * 0.445);
      const sweepZ = Math.sin(u * Math.PI * 0.7) * 0.046;
      covertPlumes.push(
        placePlumeInstance(
          i % 2 === 0 ? tawnyPlumeTpl : darkPlumeTpl,
          new THREE.Vector3(x, -0.006, 0.032 + sweepZ),
          new THREE.Vector3(sideSign * 0.1, 0.03, -1.0),
          new THREE.Vector3(0, -1, 0.06),
          1.12,
          0.98,
          0.08
        )
      );
    }

    // 11 широких второстепенных и третьестепенных маховых перьев с объёмными 3D-стержнями
    const secFeathers = [];
    const secCount = 11;
    for (let s = 0; s < secCount; s++) {
      const f = s / (secCount - 1);
      const len = 0.38 + Math.sin(f * Math.PI) * 0.055 + (1 - f) * 0.03;
      const wid = 0.156 - f * 0.014;
      const rem = createSingleRemexFeatherGeo(len, wid, 0.02, sideSign);
      rem.rotateX(-Math.PI * 0.5 + 0.035);
      rem.rotateY(-sideSign * (-0.04 + f * 0.12));
      const rootX = sideSign * (0.005 + f * 0.455);
      const rootZ = 0.028 + Math.sin(f * Math.PI * 0.7) * 0.042;
      rem.translate(rootX, 0.003 - s * 0.0014, rootZ);
      secFeathers.push(rem);
    }

    return {
      sparUndercoatGeo: ensureNonIndexedUV(sparCore),
      feathersGeo: mergeGeometries([...covertPlumes, ...secFeathers], false)
    };
  };

  const leftInner = buildInnerLeadingWingGeo(-1);
  const rightInner = buildInnerLeadingWingGeo(1);

  // ==========================================================================
  // 4. КИСТЬ (MANUS): ядро кисти + кроющие первостепенных перьев + 3-перьевое крылышко (alula)
  // ==========================================================================
  const buildManusPack = (sideSign) => {
    const handCore = new THREE.BoxGeometry(0.24, 0.020, 0.13, 5, 1, 3);
    handCore.translate(sideSign * 0.105, 0.006, 0.015);
    const hp = handCore.attributes.position;
    for (let i = 0; i < hp.count; i++) {
      const x = hp.getX(i);
      const y = hp.getY(i);
      const z = hp.getZ(i);
      const u = Math.min(1, Math.abs(x) / 0.24);
      hp.setXYZ(i, x, y * (1 - u * 0.6), z * (1 - u * 0.3) + u * 0.02);
    }
    handCore.computeVertexNormals();

    const handPlumes = [];
    // 9 кроющих первостепенных маховых сверху и 7 снизу
    for (let i = 0; i < 9; i++) {
      const u = i / 8;
      handPlumes.push(
        placePlumeInstance(
          i < 3 ? tawnyPlumeTpl : darkPlumeTpl,
          new THREE.Vector3(sideSign * (0.01 + u * 0.20), 0.014, 0.048 - u * 0.02),
          new THREE.Vector3(sideSign * (0.55 + u * 0.35), -0.02, -0.85),
          new THREE.Vector3(0, 1, 0.06),
          1.08 - u * 0.22,
          0.86,
          0.09
        )
      );
    }
    for (let i = 0; i < 7; i++) {
      const u = i / 6;
      handPlumes.push(
        placePlumeInstance(
          darkPlumeTpl,
          new THREE.Vector3(sideSign * (0.015 + u * 0.18), -0.004, 0.042 - u * 0.018),
          new THREE.Vector3(sideSign * (0.55 + u * 0.35), 0.02, -0.85),
          new THREE.Vector3(0, -1, 0.06),
          0.95 - u * 0.2,
          0.82,
          0.08
        )
      );
    }
    // 3 настоящих пера крылышка (alula) на переднем сгибе кисти!
    for (let a = 0; a < 3; a++) {
      const af = a / 2;
      const alulaRem = createSingleRemexFeatherGeo(0.14 + af * 0.045, 0.046, 0.012, sideSign);
      alulaRem.rotateX(-Math.PI * 0.5 + 0.14);
      alulaRem.rotateY(-sideSign * (1.18 - af * 0.16));
      alulaRem.translate(sideSign * (0.035 + af * 0.035), 0.019 + (2 - a) * 0.002, 0.068);
      handPlumes.push(alulaRem);
    }

    return {
      manusUndercoatGeo: ensureNonIndexedUV(handCore),
      manusFeathersGeo: mergeGeometries(handPlumes, false)
    };
  };
  const leftManus = buildManusPack(-1);
  const rightManus = buildManusPack(1);

  // 7 индивидуально артикулированных пальцевых первостепенных маховых перьев (P10..P4)
  const buildPrimariesForSide = (sideSign) => [
    createSingleRemexFeatherGeo(0.44, 0.122, 0.025, sideSign), // P10
    createSingleRemexFeatherGeo(0.54, 0.138, 0.028, sideSign), // P9
    createSingleRemexFeatherGeo(0.57, 0.148, 0.029, sideSign), // P8 (самое длинное перо крыла беркута)
    createSingleRemexFeatherGeo(0.54, 0.152, 0.026, sideSign), // P7
    createSingleRemexFeatherGeo(0.49, 0.156, 0.022, sideSign), // P6
    createSingleRemexFeatherGeo(0.44, 0.158, 0.019, sideSign), // P5
    createSingleRemexFeatherGeo(0.40, 0.158, 0.017, sideSign)  // P4
  ];
  const leftPrimaryGeos = buildPrimariesForSide(-1);
  const rightPrimaryGeos = buildPrimariesForSide(1);

  // ==========================================================================
  // 5. ХВОСТ: 12 раздельных 3D-рулевых перьев (R6..L6) с правильной орнитологической
  //    черепицей (центральная пара R1/L1 лежит СВЕРХУ, крайние R6/L6 — СНИЗУ!)
  // ==========================================================================
  const rectrices = [];
  for (let idx = 0; idx < 12; idx++) {
    const r = idx - 5.5; // -5.5 .. +5.5
    const norm = Math.abs(r) / 5.5;
    const len = 0.415 - norm * norm * 0.052;
    const rec = createSingleTailRectrixGeo(len, 0.106, 0.017);
    // Слегка больше угловой веер, чтобы на краях читались отдельные вершины всех 12 рулевых перьев!
    rec.rotateY(-r * 0.106);
    rec.rotateZ(r * 0.028);
    // Центральная пара рулевых выше остальных — виден каждый перехлёст пера и его светлый 3D-стержень!
    const deckHeight = (1.0 - norm) * 0.018 + (r > 0 ? 0.0008 : 0.0);
    rec.translate(r * 0.010, deckHeight - 0.008, 0);
    rectrices.push(rec);
  }
  const tailGeo = mergeGeometries(rectrices, false);

  return {
    bodyUndercoatGeo,
    bodyPlumageCardsGeo,
    headUndercoatGeo,
    headHacklesGeo,
    eyesGeo,
    cereGeo,
    feetYellowGeo,
    talonsGeo,
    beakAndHeadHornGeo,
    leftInner,
    rightInner,
    leftManus,
    rightManus,
    leftPrimaryGeos,
    rightPrimaryGeos,
    tailGeo
  };
}

function applyBacklitFeatherSSS(material, sunDirUniform, translucencyStrength = 0.65) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uEagleSunDir = sunDirUniform;
    shader.uniforms.uFeatherTranslucency = { value: translucencyStrength };
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
        varying vec3 vEagleWorldPos;`
      )
      .replace(
        '#include <worldpos_vertex>',
        `#include <worldpos_vertex>
        vEagleWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;`
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
        uniform vec3 uEagleSunDir;
        uniform float uFeatherTranslucency;
        varying vec3 vEagleWorldPos;`
      )
      .replace(
        '#include <dithering_fragment>',
        `vec3 viewToEagle = normalize(vEagleWorldPos - cameraPosition);
        float backSun = pow(clamp(dot(viewToEagle, normalize(uEagleSunDir)), 0.0, 1.0), 2.3);
        float rimGraze = pow(1.0 - abs(dot(normalize(vNormal), -viewToEagle)), 2.2);
        vec3 warmKeratinGlow = vec3(1.0, 0.76, 0.40) * (backSun * 0.56 + rimGraze * 0.16) * uFeatherTranslucency;
        gl_FragColor.rgb += warmKeratinGlow * gl_FragColor.rgb + warmKeratinGlow * 0.10;
        #include <dithering_fragment>`
      );
  };
  material.customProgramCacheKey = () => `eagle_feather_sss_v2_${translucencyStrength.toFixed(2)}`;
  return material;
}

export function getSharedPhotorealEagleAssets() {
  if (cachedEagleAssets) return cachedEagleAssets;

  const { diffTex, normTex, roughTex, underTex } = createGoldenEaglePlumageTextures();
  const geos = buildEagleSharedGeometries();
  const sunDirUniform = { value: new THREE.Vector3(-0.45, 0.78, -0.35).normalize() };

  // Непрозрачный пуховой подслой под 3D-перьями (исключает любые просветы между перьями)
  const undercoatMat = new THREE.MeshStandardMaterial({
    map: underTex,
    roughness: 0.92,
    metalness: 0.01
  });

  // Единый 2048×2048 alphaTest PBR-материал для всех 340+ индивидуальных 3D-перьев!
  const flightFeatherMat = applyBacklitFeatherSSS(
    new THREE.MeshStandardMaterial({
      map: diffTex,
      normalMap: normTex,
      normalScale: new THREE.Vector2(0.62, 0.62),
      roughnessMap: roughTex,
      roughness: 0.88,
      metalness: 0.04,
      alphaTest: 0.30,
      side: THREE.DoubleSide
    }),
    sunDirUniform,
    0.78
  );

  const featherDepthMat = new THREE.MeshDepthMaterial({
    depthPacking: THREE.RGBADepthPacking,
    map: diffTex,
    alphaTest: 0.30
  });

  const cereMat = new THREE.MeshStandardMaterial({
    color: '#d49b1a',
    roughness: 0.50,
    metalness: 0.02
  });

  const beakHornMat = new THREE.MeshStandardMaterial({
    color: '#1b232e',
    roughness: 0.28,
    metalness: 0.18
  });

  const eyeIrisMat = new THREE.MeshStandardMaterial({
    color: '#e0820b',
    emissive: '#78350f',
    emissiveIntensity: 0.24,
    roughness: 0.12,
    metalness: 0.10
  });

  cachedEagleAssets = {
    diffTex,
    normTex,
    roughTex,
    underTex,
    geos,
    sunDirUniform,
    undercoatMat,
    flightFeatherMat,
    featherDepthMat,
    cereMat,
    beakHornMat,
    eyeIrisMat
  };
  return cachedEagleAssets;
}

/**
 * Создаёт ультра-детализированный 3D-экземпляр кавказского беркута (Aquila chrysaetos)
 * с прорисованным и вылепленным в 3D оперением вплоть до отдельных перьев и стержней.
 */
export function createPhotorealGoldenEagleInstance({
  scale = 1.0,
  castShadow = true,
  clippingPlanes = null
} = {}) {
  const assets = getSharedPhotorealEagleAssets();
  const { geos } = assets;

  const underMat = clippingPlanes
    ? Object.assign(assets.undercoatMat.clone(), { clippingPlanes })
    : assets.undercoatMat;
  const featherMat = clippingPlanes
    ? Object.assign(assets.flightFeatherMat.clone(), { clippingPlanes })
    : assets.flightFeatherMat;
  const cereMat = clippingPlanes
    ? Object.assign(assets.cereMat.clone(), { clippingPlanes })
    : assets.cereMat;
  const beakMat = clippingPlanes
    ? Object.assign(assets.beakHornMat.clone(), { clippingPlanes })
    : assets.beakHornMat;
  const eyeMat = clippingPlanes
    ? Object.assign(assets.eyeIrisMat.clone(), { clippingPlanes })
    : assets.eyeIrisMat;
  if (clippingPlanes) {
    applyBacklitFeatherSSS(featherMat, assets.sunDirUniform, 0.78);
  }

  const root = new THREE.Group();
  root.scale.setScalar(scale);

  const postureNode = new THREE.Group();
  root.add(postureNode);

  const setupMesh = (mesh, isFeather = false) => {
    mesh.castShadow = castShadow;
    mesh.receiveShadow = false;
    if (isFeather && castShadow) {
      mesh.customDepthMaterial = assets.featherDepthMat;
    }
    return mesh;
  };

  // 1. Корпус: пуховое ядро + 168 черепичных 3D-перьев + четырёхпалые лапы и когти
  const torsoCoreMesh = setupMesh(new THREE.Mesh(geos.bodyUndercoatGeo, underMat), false);
  const torsoPlumesMesh = setupMesh(new THREE.Mesh(geos.bodyPlumageCardsGeo, featherMat), true);
  const feetMesh = setupMesh(new THREE.Mesh(geos.feetYellowGeo, cereMat), false);
  const talonsMesh = setupMesh(new THREE.Mesh(geos.talonsGeo, beakMat), false);
  postureNode.add(torsoCoreMesh, torsoPlumesMesh, feetMesh, talonsMesh);

  // 2. Голова и зашеек: череп + 84 золотистых ланцетовидных пера + глаза + восковица + клюв с ноздрями
  const headPivot = new THREE.Group();
  headPivot.position.set(0, 0.036, 0.295);
  postureNode.add(headPivot);

  const skullCoreMesh = setupMesh(new THREE.Mesh(geos.headUndercoatGeo, underMat), false);
  const hacklesMesh = setupMesh(new THREE.Mesh(geos.headHacklesGeo, featherMat), true);
  const eyesMesh = setupMesh(new THREE.Mesh(geos.eyesGeo, eyeMat), false);
  const cereMesh = setupMesh(new THREE.Mesh(geos.cereGeo, cereMat), false);
  const beakHeadMesh = setupMesh(new THREE.Mesh(geos.beakAndHeadHornGeo, beakMat), false);
  headPivot.add(skullCoreMesh, hacklesMesh, eyesMesh, cereMesh, beakHeadMesh);

  // 3. Двухзвенные крылья с 3 ярусами черепичных кроющих, крылышком (alula) и 7 пальцевыми первостепенными перьями
  const buildArticulatedWing = (sideSign) => {
    const innerGeoPack = sideSign < 0 ? geos.leftInner : geos.rightInner;
    const manusPack = sideSign < 0 ? geos.leftManus : geos.rightManus;
    const primaryGeos = sideSign < 0 ? geos.leftPrimaryGeos : geos.rightPrimaryGeos;

    const shoulderPivot = new THREE.Group();
    shoulderPivot.position.set(sideSign * 0.088, 0.032, 0.042);

    const innerSparMesh = setupMesh(new THREE.Mesh(innerGeoPack.sparUndercoatGeo, underMat), false);
    const innerFeathersMesh = setupMesh(new THREE.Mesh(innerGeoPack.feathersGeo, featherMat), true);
    shoulderPivot.add(innerSparMesh, innerFeathersMesh);

    const wristPivot = new THREE.Group();
    wristPivot.position.set(sideSign * 0.468, 0.008, 0.036);
    shoulderPivot.add(wristPivot);

    const manusSparMesh = setupMesh(new THREE.Mesh(manusPack.manusUndercoatGeo, underMat), false);
    const manusFeathersMesh = setupMesh(new THREE.Mesh(manusPack.manusFeathersGeo, featherMat), true);
    wristPivot.add(manusSparMesh, manusFeathersMesh);

    const primarySlots = [];
    const sweepAngles = [0.11, 0.29, 0.49, 0.71, 0.94, 1.17, 1.39];
    const baseTipDihedral = [0.32, 0.26, 0.20, 0.14, 0.09, 0.05, 0.02];

    primaryGeos.forEach((pGeo, idx) => {
      const fPivot = new THREE.Group();
      const t = idx / 6;
      fPivot.position.set(sideSign * (0.21 - t * 0.18), 0.004 - idx * 0.0012, 0.036 - t * 0.032);
      fPivot.rotation.order = 'YXZ';

      const fMesh = setupMesh(new THREE.Mesh(pGeo, featherMat), true);
      fMesh.rotation.x = -Math.PI * 0.5;
      fPivot.add(fMesh);

      fPivot.rotation.y = -sideSign * (Math.PI * 0.5 - sweepAngles[idx]);
      fPivot.rotation.x = baseTipDihedral[idx];
      wristPivot.add(fPivot);

      primarySlots.push({
        pivot: fPivot,
        baseSweep: sweepAngles[idx],
        baseCurl: baseTipDihedral[idx],
        idx
      });
    });

    postureNode.add(shoulderPivot);
    return { sideSign, shoulderPivot, wristPivot, primarySlots };
  };

  const wingL = buildArticulatedWing(-1);
  const wingR = buildArticulatedWing(1);

  // 4. Рулевой 12-перьевой 3D-веер хвоста
  const tailPivot = new THREE.Group();
  tailPivot.position.set(0, 0.008, -0.34);
  const tailMesh = setupMesh(new THREE.Mesh(geos.tailGeo, featherMat), true);
  tailPivot.add(tailMesh);
  postureNode.add(tailPivot);

  const rig = {
    postureNode,
    headPivot,
    wingL,
    wingR,
    tailPivot,
    disposableClones: clippingPlanes ? [underMat, featherMat, cereMat, beakMat, eyeMat] : []
  };
  root.userData.photorealEagleRig = rig;
  return root;
}

export function updatePhotorealGoldenEagle(eagleObj, elapsed, sunDir = null) {
  if (!eagleObj) return;
  const rig = eagleObj.userData?.photorealEagleRig;
  const cfg = eagleObj.userData?.flightCfg;
  if (!rig || !cfg) return;

  if (sunDir) {
    const assets = getSharedPhotorealEagleAssets();
    assets.sunDirUniform.value.copy(sunDir).normalize();
  }

  const w = cfg.omega;
  const t = elapsed * w + cfg.phase;
  const driftX = Math.sin(t * 0.23 + cfg.phase) * cfg.driftRadius;
  const driftZ = Math.cos(t * 0.19 + cfg.phase * 0.7) * cfg.driftRadius;

  const samplePos = (tau) => {
    const dX = Math.sin(tau * 0.23 + cfg.phase) * cfg.driftRadius;
    const dZ = Math.cos(tau * 0.19 + cfg.phase * 0.7) * cfg.driftRadius;
    const x = cfg.cx + dX + Math.cos(tau * cfg.dir) * cfg.rx;
    const z = cfg.cz + dZ + Math.sin(tau * cfg.dir) * cfg.rz;
    const thermalWave = Math.sin(tau * 0.5 + cfg.phase) * cfg.altAmp;
    return { x, y: cfg.baseAlt + thermalWave, z };
  };

  const eps = 0.035;
  const pPrev = samplePos(t - eps);
  const pCur = samplePos(t);
  const pNext = samplePos(t + eps);

  const vx = (pNext.x - pPrev.x) / (2 * eps);
  const vy = (pNext.y - pPrev.y) / (2 * eps);
  const vz = (pNext.z - pPrev.z) / (2 * eps);
  const horizSpeed = Math.max(0.001, Math.hypot(vx, vz));

  const ax = (pNext.x - 2 * pCur.x + pPrev.x) / (eps * eps);
  const az = (pNext.z - 2 * pCur.z + pPrev.z) / (eps * eps);
  const signedCurvature = (vx * az - vz * ax) / Math.pow(horizSpeed, 2.2);
  const bankRoll = Math.max(-0.56, Math.min(0.56, signedCurvature * 0.42)) + Math.sin(elapsed * 1.9 + cfg.phase) * 0.024;

  eagleObj.position.set(pCur.x + driftX * 0.05, pCur.y, pCur.z + driftZ * 0.05);

  const headingYaw = Math.atan2(vx, vz);
  const climbPitch = Math.max(-0.26, Math.min(0.24, -Math.atan2(vy, horizSpeed) * 0.72));
  eagleObj.rotation.order = 'YXZ';
  eagleObj.rotation.y = headingYaw;
  eagleObj.rotation.x = climbPitch;

  const cyclePeriod = cfg.flapPeriod || 9.2;
  const cyclePos = ((elapsed + cfg.phase * 2.1) % cyclePeriod) / cyclePeriod;
  const flapWindow = cyclePos < 0.28 ? Math.sin((cyclePos / 0.28) * Math.PI) : 0.0;
  const strokePhase = (cyclePos / 0.28) * Math.PI * 2.0 * 3.0;

  const rawSin = Math.sin(strokePhase);
  const rawCos = Math.cos(strokePhase);
  const shoulderFlap = flapWindow * (rawSin - 0.18 * Math.sin(2 * strokePhase)) * 0.44;
  const wristFold = flapWindow * Math.max(0, rawCos) * 0.36;
  const wristWhip = flapWindow * Math.sin(strokePhase - 0.55) * 0.26;

  const gustL = Math.sin(elapsed * 3.1 + cfg.phase) * 0.025 + Math.cos(elapsed * 5.3 + cfg.phase) * 0.011;
  const gustR = Math.sin(elapsed * 2.9 + cfg.phase + 0.8) * 0.025 + Math.cos(elapsed * 5.7 + cfg.phase) * 0.011;
  const soarDihedral = 0.12 + Math.max(0, vy * 0.08);

  rig.postureNode.position.y = -flapWindow * rawSin * 0.036;
  rig.postureNode.rotation.z = bankRoll;

  rig.wingL.shoulderPivot.rotation.z = -(soarDihedral + shoulderFlap + gustL);
  rig.wingL.shoulderPivot.rotation.y = flapWindow * rawSin * 0.075;
  rig.wingL.wristPivot.rotation.z = -(wristWhip - wristFold * 0.82);
  rig.wingL.wristPivot.rotation.y = -wristFold * 0.32;

  rig.wingR.shoulderPivot.rotation.z = soarDihedral + shoulderFlap + gustR;
  rig.wingR.shoulderPivot.rotation.y = -flapWindow * rawSin * 0.075;
  rig.wingR.wristPivot.rotation.z = wristWhip - wristFold * 0.82;
  rig.wingR.wristPivot.rotation.y = wristFold * 0.32;

  const aeroLoad = Math.max(0.22, 1.0 - wristFold * 1.15 + Math.max(0, -rawSin * flapWindow) * 0.52);
  const updatePrimaries = (wing, gust) => {
    const s = wing.sideSign;
    for (let i = 0; i < wing.primarySlots.length; i++) {
      const slot = wing.primarySlots[i];
      const flutter = Math.sin(elapsed * (11.5 + i * 1.7) + cfg.phase + i) * 0.014;
      const tipUpAngle = slot.baseCurl * aeroLoad + flutter + gust * 0.32;
      const dynSweep = slot.baseSweep + wristFold * 0.045 * (7 - i);
      slot.pivot.rotation.y = -s * (Math.PI * 0.5 - dynSweep);
      slot.pivot.rotation.x = tipUpAngle;
    }
  };
  updatePrimaries(rig.wingL, gustL);
  updatePrimaries(rig.wingR, gustR);

  const tailSpread = 1.05 - flapWindow * 0.14 + Math.abs(bankRoll) * 0.16;
  rig.tailPivot.scale.set(tailSpread, 1.0, 1.0);
  rig.tailPivot.rotation.x = -0.06 - Math.abs(bankRoll) * 0.12 + gustL * 0.35;
  rig.tailPivot.rotation.z = -bankRoll * 0.34;

  rig.headPivot.rotation.z = -bankRoll * 0.65;
  rig.headPivot.rotation.y = Math.sin(elapsed * 0.85 + cfg.phase * 1.7) * 0.24;
  rig.headPivot.rotation.x = 0.15 + Math.cos(elapsed * 0.62 + cfg.phase) * 0.075;
}

export function disposePhotorealEagleInstance(eagleObj) {
  const rig = eagleObj?.userData?.photorealEagleRig;
  if (rig?.disposableClones) {
    rig.disposableClones.forEach((m) => m.dispose());
  }
}
