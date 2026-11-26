// ============================================================================
// МУЗЕЙНАЯ 3D-АРХИТЕКТУРА КРЕПОСТЕЙ, БОЕВЫХ БАШЕН, САКЛЕЙ И МОСТОВ КАВКАЗА (1845)
// 1. Процедурный архитектурный PBR-атлас 2048×2048 (диффуз + нормали + шероховатость):
//    - тёсаный горный сланец и известняк вайнахских/аварских башен со швами и мхом;
//    - николаевский красный крепостной кирпич с белым известковым раствором;
//    - земляной дёрн валов Вобана и плетёные фашины;
//    - резной кавказский орех/дуб галерей-айванов, кованых ворот и частокола;
//    - зелёная фальцевая жесть кровель штабов/казарм РИ и золочёный металл куполов;
//    - каменная черепица / плоские крыши саклей и светлая штукатурка Диван-ханы;
//    - крепостные знамёна (Андреевский/Имперский флаг РИ и изумрудное знамя Имамата).
// 2. Пять исторических 3D-ансамблей:
//    - createPhotorealImperialFortressInstance(): 5-бастионная звёздчатая крепость
//      Кавказской линии (Грозная, Внезапная, Темир-Хан-Шура, Владикавказ) с каменным
//      эскарпом, земляными брустверами, 5 амбразурными пушками, турами, арочными
//      воротами с караулками, кирпичным штабом с зелёной крышей, пороховым погребом,
//      круглой башней-блокгаузом и развевающимся крепостным флагом;
//    - createPhotorealVainakhTowerInstance(): трапециевидная боевая башня Ичкерии и
//      Дагестана с 5-ступенчатой сланцевой пирамидой-крышей, 4 навесными машикулями
//      на каменных кронштейнах, бойницами, арочным входом и двором-оградой;
//    - createPhotorealImamatCapitalInstance(): Дарго-Ведено — двухэтажные палаты
//      Диван-ханы с резной деревянной галереей, соборная мечеть, высокий минарет с
//      резным балконом-шерефе и золотым полумесяцем, двойной рубленый частокол с
//      угловыми бастионами и развевающееся знамя Имамата;
//    - createPhotorealStoneBridgeInstance(): одноарочный сводчатый каменный мост
//      с клинчатой кладкой, замковым камнем и зубчатыми парапетами (целый / взорванный);
//    - createDetailedSaklyaGeometries(): детализированные террасные сакли с деревянным
//      айваном-галереей, выступающими балками кровли и дымоходом для InstancedMesh.
// ============================================================================
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

let cachedFortressAssets = null;

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

function buildBox(w, h, d, x, y, z, rx = 0, ry = 0, rz = 0, uvRect = [0.02, 0.53, 0.23, 0.97]) {
  const g = new THREE.BoxGeometry(w, h, d);
  if (rx) g.rotateX(rx);
  if (ry) g.rotateY(ry);
  if (rz) g.rotateZ(rz);
  g.translate(x, y, z);
  remapUVRect(g, ...uvRect);
  return ensureNonIndexedWithUV(g);
}

function buildCyl(rt, rb, h, segs, x, y, z, rx = 0, ry = 0, rz = 0, uvRect = [0.02, 0.53, 0.23, 0.97]) {
  const g = new THREE.CylinderGeometry(rt, rb, h, segs);
  if (rx) g.rotateX(rx);
  if (ry) g.rotateY(ry);
  if (rz) g.rotateZ(rz);
  g.translate(x, y, z);
  remapUVRect(g, ...uvRect);
  return ensureNonIndexedWithUV(g);
}

function createFortressArchPbrAtlas() {
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
  rctx.fillStyle = 'rgb(218, 218, 218)';
  rctx.fillRect(0, 0, W, H);

  // ==========================================================================
  // Q1-A [x:0..512, y:0..992] -> u:[0.02..0.23], v:[0.53..0.98]
  // Горная кладка вайнахских и аварских башен (тёсаный серый/охристый сланец с мхом)
  // ==========================================================================
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, 504, 992);
  ctx.clip();
  ctx.fillStyle = '#5f5b52';
  ctx.fillRect(0, 0, 504, 992);
  let seed = 17;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  for (let row = 0; row < 28; row++) {
    const ry = row * 35;
    const rh = 31;
    let cx = row % 2 === 0 ? 0 : -26;
    while (cx < 504) {
      const rw = 44 + Math.floor(rand() * 44);
      const tone = 112 + Math.floor(rand() * 48);
      const warm = Math.floor(rand() * 18);
      ctx.fillStyle = `rgb(${tone + warm}, ${tone + Math.floor(warm * 0.65)}, ${tone - 8})`;
      ctx.fillRect(cx + 2, ry + 2, rw - 4, rh - 3);

      // Тонкий горный лишайник / мох в верхних швах
      if (rand() > 0.78) {
        ctx.fillStyle = 'rgba(84, 108, 62, 0.36)';
        ctx.fillRect(cx + 3, ry + 2, rw * 0.55, 5);
      }

      // Рельефная карта нормалей камня (скосы верхней/левой и нижней/правой граней)
      nctx.fillStyle = 'rgb(128, 128, 255)';
      nctx.fillRect(cx + 3, ry + 3, rw - 6, rh - 5);
      nctx.fillStyle = 'rgb(128, 178, 240)';
      nctx.fillRect(cx + 2, ry + 2, rw - 4, 4);
      nctx.fillStyle = 'rgb(128, 78, 240)';
      nctx.fillRect(cx + 2, ry + rh - 4, rw - 4, 4);
      nctx.fillStyle = 'rgb(82, 128, 240)';
      nctx.fillRect(cx + 2, ry + 2, 4, rh - 3);
      nctx.fillStyle = 'rgb(174, 128, 240)';
      nctx.fillRect(cx + rw - 5, ry + 2, 4, rh - 3);

      rctx.fillStyle = `rgb(${202 + Math.floor(rand() * 34)}, ${202 + Math.floor(rand() * 34)}, ${202 + Math.floor(rand() * 34)})`;
      rctx.fillRect(cx + 2, ry + 2, rw - 4, rh - 3);
      cx += rw;
    }
  }
  ctx.restore();

  // ==========================================================================
  // Q1-B [x:520..1024, y:0..992] -> u:[0.27..0.48], v:[0.53..0.98]
  // Красный обожжённый кирпич и известковый раствор крепостей Кавказской линии (1845 г.)
  // ==========================================================================
  ctx.save();
  ctx.beginPath();
  ctx.rect(520, 0, 504, 992);
  ctx.clip();
  ctx.fillStyle = '#c8bfb0'; // известковый раствор
  ctx.fillRect(520, 0, 504, 992);
  for (let row = 0; row < 44; row++) {
    const ry = row * 22;
    const off = (row % 2) * 28;
    for (let col = -1; col < 10; col++) {
      const bx = 520 + col * 56 + off;
      const rCol = 132 + Math.floor(rand() * 44);
      const gCol = 58 + Math.floor(rand() * 24);
      const bCol = 42 + Math.floor(rand() * 18);
      ctx.fillStyle = `rgb(${rCol}, ${gCol}, ${bCol})`;
      ctx.fillRect(bx + 2, ry + 2, 52, 18);

      nctx.fillStyle = 'rgb(128, 168, 244)';
      nctx.fillRect(bx + 2, ry + 2, 52, 3);
      nctx.fillStyle = 'rgb(128, 88, 244)';
      nctx.fillRect(bx + 2, ry + 17, 52, 3);
      nctx.fillStyle = 'rgb(92, 128, 244)';
      nctx.fillRect(bx + 2, ry + 2, 3, 18);

      rctx.fillStyle = `rgb(${214 + Math.floor(rand() * 26)}, ${214 + Math.floor(rand() * 26)}, ${214 + Math.floor(rand() * 26)})`;
      rctx.fillRect(bx + 2, ry + 2, 52, 18);
    }
  }
  // Тёсаный светло-серый каменный цоколь в нижней кромке кирпичных стен (y: 855..992)
  ctx.fillStyle = '#8b857b';
  ctx.fillRect(520, 855, 504, 137);
  for (let s = 0; s < 6; s++) {
    ctx.strokeStyle = '#47433d';
    ctx.lineWidth = 3;
    ctx.strokeRect(520 + s * 86, 855, 86, 68);
    ctx.strokeRect(520 + s * 86 - 40, 923, 86, 68);
  }
  ctx.restore();

  // ==========================================================================
  // Q2-A [x:1024..1536, y:0..992] -> u:[0.52..0.73], v:[0.53..0.98]
  // Земляные валы Вобана: дёрн, уплотнённая глина и плетёные фашины
  // ==========================================================================
  const turfGrad = ctx.createLinearGradient(1024, 0, 1024, 992);
  turfGrad.addColorStop(0.0, '#4f6236'); // зелёный дёрн сверху вала
  turfGrad.addColorStop(0.42, '#5a6338');
  turfGrad.addColorStop(0.68, '#66533b'); // откос суглинка
  turfGrad.addColorStop(1.0, '#4d3e2d');
  ctx.fillStyle = turfGrad;
  ctx.fillRect(1024, 0, 512, 992);

  for (let i = 0; i < 1600; i++) {
    const tx = 1026 + Math.floor(rand() * 508);
    const ty = Math.floor(rand() * 984);
    ctx.fillStyle = i % 2 === 0 ? 'rgba(34, 46, 22, 0.25)' : 'rgba(136, 122, 86, 0.22)';
    ctx.fillRect(tx, ty, 5, 4);
    nctx.fillStyle = i % 2 === 0 ? 'rgb(144, 138, 246)' : 'rgb(112, 118, 246)';
    nctx.fillRect(tx, ty, 5, 4);
  }
  rctx.fillStyle = 'rgb(238, 238, 238)';
  rctx.fillRect(1024, 0, 512, 992);

  // ==========================================================================
  // Q2-B [x:1536..2048, y:0..992] -> u:[0.77..0.98], v:[0.53..0.98]
  // Тёмный кавказский орех/дуб: брёвна частокола, резные галереи айванов, кованые ворота
  // ==========================================================================
  ctx.fillStyle = '#4a311e';
  ctx.fillRect(1536, 0, 512, 992);
  for (let p = 0; p < 12; p++) {
    const px = 1536 + p * 43;
    const tone = 56 + Math.floor(rand() * 34);
    ctx.fillStyle = `rgb(${tone + 26}, ${tone + 6}, ${tone - 12})`;
    ctx.fillRect(px + 2, 0, 39, 992);
    ctx.strokeStyle = 'rgba(20, 12, 6, 0.6)';
    ctx.lineWidth = 3;
    ctx.strokeRect(px, 0, 43, 992);

    nctx.fillStyle = 'rgb(156, 128, 246)';
    nctx.fillRect(px + 2, 0, 4, 992);
    nctx.fillStyle = 'rgb(100, 128, 246)';
    nctx.fillRect(px + 37, 0, 4, 992);
  }
  // Кованые железные петли и гвозди по горизонтали
  for (const hy of [190, 520, 820]) {
    ctx.fillStyle = '#1e2228';
    ctx.fillRect(1536, hy, 512, 18);
    rctx.fillStyle = 'rgb(102, 102, 102)';
    rctx.fillRect(1536, hy, 512, 18);
  }

  // Прозрачный буфер безопасности mipmap посередине атласа
  ctx.clearRect(0, 994, W, 62);

  // ==========================================================================
  // Q3-A [x:0..512, y:1060..2048] -> u:[0.02..0.23], v:[0.02..0.46]
  // Имперская зелёная фальцевая жестяная кровля (штабы, казармы, блокгаузы XIX века!)
  // ==========================================================================
  const roofGreen = ctx.createLinearGradient(0, 1060, 0, 2048);
  roofGreen.addColorStop(0.0, '#2a5640');
  roofGreen.addColorStop(0.5, '#214534');
  roofGreen.addColorStop(1.0, '#183427');
  ctx.fillStyle = roofGreen;
  ctx.fillRect(0, 1060, 512, 988);
  for (let rx = 24; rx < 512; rx += 32) {
    ctx.strokeStyle = 'rgba(10, 22, 16, 0.55)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(rx, 1060);
    ctx.lineTo(rx, 2048);
    ctx.stroke();

    nctx.strokeStyle = 'rgb(168, 128, 246)';
    nctx.lineWidth = 5;
    nctx.beginPath();
    nctx.moveTo(rx - 2, 1060);
    nctx.lineTo(rx - 2, 2048);
    nctx.stroke();
  }
  rctx.fillStyle = 'rgb(112, 112, 112)'; // полуматовый металлический блеск крашеной жести
  rctx.fillRect(0, 1060, 512, 988);

  // ==========================================================================
  // Q3-B [x:512..1024, y:1060..2048] -> u:[0.27..0.48], v:[0.02..0.46]
  // Светлый тёсаный известняк и штукатурка палат Диван-ханы и мечети Дарго-Ведено
  // ==========================================================================
  const plaster = ctx.createLinearGradient(512, 1060, 512, 2048);
  plaster.addColorStop(0.0, '#e5dcc8');
  plaster.addColorStop(0.65, '#d6cab0');
  plaster.addColorStop(1.0, '#b5a78c');
  ctx.fillStyle = plaster;
  ctx.fillRect(512, 1060, 512, 988);
  for (let i = 0; i < 900; i++) {
    const px = 514 + Math.floor(rand() * 508);
    const py = 1062 + Math.floor(rand() * 982);
    ctx.fillStyle = i % 2 === 0 ? 'rgba(255,252,240,0.22)' : 'rgba(110,96,72,0.16)';
    ctx.fillRect(px, py, 6, 4);
  }
  rctx.fillStyle = 'rgb(212, 212, 212)';
  rctx.fillRect(512, 1060, 512, 988);

  // ==========================================================================
  // Q4-A [x:1024..1536, y:1060..2048] -> u:[0.52..0.73], v:[0.02..0.46]
  // Сланцевая черепица и утрамбованная земляно-деревянная кровля горских башен и саклей
  // ==========================================================================
  ctx.fillStyle = '#524b42';
  ctx.fillRect(1024, 1060, 512, 988);
  for (let row = 0; row < 26; row++) {
    const ry = 1064 + row * 38;
    for (let col = 0; col < 10; col++) {
      const sx = 1026 + col * 51 + (row % 2) * 24;
      const t = 72 + Math.floor(rand() * 34);
      ctx.fillStyle = `rgb(${t + 8}, ${t + 2}, ${t - 5})`;
      ctx.fillRect(sx, ry, 47, 34);
      nctx.fillStyle = 'rgb(128, 86, 246)';
      nctx.fillRect(sx, ry + 30, 47, 5);
    }
  }
  rctx.fillStyle = 'rgb(226, 226, 226)';
  rctx.fillRect(1024, 1060, 512, 988);

  // ==========================================================================
  // Q4-B [x:1536..2048, y:1060..2048] -> u:[0.76..0.99], v:[0.02..0.46]
  // Верх (y:1060..1550 -> v:0.24..0.46): Имперский крепостной флаг РИ (триколор + Андреевский знак)
  // Низ  (y:1560..2048 -> v:0.01..0.23): Изумрудное знамя Имамата с золотым полумесяцем и арабской каймой
  // ==========================================================================
  // Имперский бело-сине-красный флаг РИ (1845)
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(1536, 1060, 512, 162);
  ctx.fillStyle = '#1d4ed8';
  ctx.fillRect(1536, 1222, 512, 162);
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(1536, 1384, 512, 166);
  // Золотой гербовый квадрат в крыже
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(1548, 1072, 148, 138);
  ctx.fillStyle = '#18181b';
  ctx.beginPath();
  ctx.arc(1622, 1141, 42, 0, Math.PI * 2);
  ctx.fill();

  // Государственное знамя Имамата (Дарго-Ведено)
  ctx.fillStyle = '#065f46';
  ctx.fillRect(1536, 1560, 512, 488);
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 20;
  ctx.strokeRect(1552, 1576, 480, 456);
  // Золотой полумесяц и звезда в центре
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.arc(1776, 1804, 106, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#065f46';
  ctx.beginPath();
  ctx.arc(1816, 1804, 88, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.arc(1868, 1804, 24, 0, Math.PI * 2);
  ctx.fill();

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

function buildSharedFortressGeometries() {
  const UV_SLATE = [0.02, 0.53, 0.23, 0.97];
  const UV_BRICK = [0.27, 0.53, 0.48, 0.97];
  const UV_TURF = [0.52, 0.53, 0.73, 0.97];
  const UV_WOOD = [0.77, 0.53, 0.98, 0.97];
  const UV_TIN_ROOF = [0.02, 0.03, 0.23, 0.45];
  const UV_PLASTER = [0.27, 0.03, 0.48, 0.45];
  const UV_SHINGLE = [0.52, 0.03, 0.73, 0.45];

  // ==========================================================================
  // 1. ЗВЁЗДЧАТАЯ БАСТИОННАЯ КРЕПОСТЬ КАВКАЗСКОЙ ЛИНИИ (ГРОЗНАЯ / ВНЕЗАПНАЯ / ТЕМИР-ХАН-ШУРА)
  // ==========================================================================
  const impStoneParts = [];
  const impRoofMetalParts = [];
  const impIronParts = [];
  const impWindowParts = [];

  // 1.1 Пятилучевой звёздчатый земляной гласис Вобана + глубокий каменный эскарп-цоколь для горных склонов + 5 бастионов!
  const outerPlinth = buildCyl(1.42, 1.72, 0.22, 10, 0, 0.11, 0, 0, 0, 0, UV_TURF);
  const deepFortFoundation = buildCyl(1.68, 1.98, 0.72, 10, 0, -0.35, 0, 0, 0, 0, UV_SLATE);
  impStoneParts.push(outerPlinth, deepFortFoundation);

  const bastionCount = 5;
  for (let b = 0; b < bastionCount; b++) {
    const a0 = (b / bastionCount) * Math.PI * 2;
    const a1 = ((b + 1) / bastionCount) * Math.PI * 2;
    const midA = (a0 + a1) * 0.5;

    // Угловой 5-угольный бастион с каменным эскарпом и земляным бруствером (проекция вперёд!)
    const bx = Math.sin(a0) * 1.12;
    const bz = Math.cos(a0) * 1.12;
    const bastionWall = buildCyl(0.42, 0.49, 0.62, 5, bx, 0.42, bz, 0, a0, 0, UV_BRICK);
    const bastionTurf = buildCyl(0.36, 0.41, 0.10, 5, bx, 0.76, bz, 0, a0, 0, UV_TURF);
    impStoneParts.push(bastionWall, bastionTurf);

    // Крепостное чугунное орудие в амбразуре каждого бастиона + 2 плетёных тура по бокам!
    const gunX = Math.sin(a0) * 1.38;
    const gunZ = Math.cos(a0) * 1.38;
    const gunBarrel = buildCyl(0.026, 0.038, 0.36, 8, gunX, 0.80, gunZ, Math.PI * 0.5, a0, 0, UV_SHINGLE);
    impIronParts.push(gunBarrel);

    for (const sideSgn of [-1, 1]) {
      const ga = a0 + sideSgn * 0.17;
      impStoneParts.push(
        buildCyl(0.055, 0.058, 0.16, 8, Math.sin(ga) * 1.24, 0.80, Math.cos(ga) * 1.24, 0, 0, 0, UV_WOOD)
      );
    }

    // Куртина (стена между соседними бастионами) с бойницами и боевым ходом
    const cx = Math.sin(midA) * 0.90;
    const cz = Math.cos(midA) * 0.90;
    const curtain = buildBox(0.96, 0.56, 0.24, cx, 0.40, cz, 0, midA, 0, UV_BRICK);
    const curtainTop = buildBox(0.96, 0.08, 0.20, cx, 0.71, cz, 0, midA, 0, UV_TURF);
    impStoneParts.push(curtain, curtainTop);

    // Зубцы/мерлоны и банкет вдоль куртины (кроме передней куртины b===0, где стоят главные арочные ворота!)
    if (b === 0) {
      // Главный воротный бастион с арочным проёмом, коваными дубовыми воротами и каменным порталом
      const gx = cx + Math.sin(midA) * 0.06;
      const gz = cz + Math.cos(midA) * 0.06;
      const gateArch = buildBox(0.46, 0.68, 0.34, gx, 0.52, gz, 0, midA, 0, UV_SLATE);
      const gatePediment = buildCyl(0.04, 0.34, 0.18, 4, gx, 0.95, gz, 0, midA + Math.PI * 0.25, 0, UV_TIN_ROOF);
      const gateDoors = buildBox(0.24, 0.38, 0.37, gx, 0.37, gz, 0, midA, 0, UV_WOOD);
      impStoneParts.push(gateArch, gateDoors);
      impRoofMetalParts.push(gatePediment);
    } else {
      for (const mOff of [-0.30, 0.0, 0.30]) {
        const mx = cx + Math.cos(midA) * mOff;
        const mz = cz - Math.sin(midA) * mOff;
        impStoneParts.push(buildBox(0.16, 0.13, 0.12, mx, 0.79, mz, 0, midA, 0, UV_BRICK));
      }
    }
  }

  // 1.2 Внутренний плац крепости: кирпичный Штаб-казарма, пороховой погреб и круглая башня-блокгауз!
  const courtyardFloor = buildCyl(0.92, 0.96, 0.18, 10, 0, 0.24, 0, 0, 0, 0, UV_SLATE);
  impStoneParts.push(courtyardFloor);

  // Штаб и офицерские казармы (2 этажа кирпича, зелёная вальмовая жестяная крыша, 2 дымовые трубы, ряды окон)
  impStoneParts.push(buildBox(0.76, 0.54, 0.42, -0.20, 0.58, -0.18, 0, 0.18, 0, UV_BRICK));
  const hqRoof = buildCyl(0.08, 0.56, 0.24, 4, -0.20, 0.96, -0.18, 0, 0.18 + Math.PI * 0.25, 0, UV_TIN_ROOF);
  hqRoof.scale(1.12, 1.0, 0.76);
  // (Внимание: scale после translate сдвинул бы центр, поэтому соберём крышу правильно!)
  const hqRoofClean = new THREE.CylinderGeometry(0.14, 0.54, 0.24, 4);
  hqRoofClean.rotateY(Math.PI * 0.25);
  hqRoofClean.scale(1.16, 1.0, 0.72);
  hqRoofClean.rotateY(0.18);
  hqRoofClean.translate(-0.20, 0.97, -0.18);
  remapUVRect(hqRoofClean, ...UV_TIN_ROOF);
  impRoofMetalParts.push(ensureNonIndexedWithUV(hqRoofClean));
  hqRoof.dispose();

  // Дымовые трубы штаба и светящиеся окна
  impStoneParts.push(buildBox(0.07, 0.22, 0.07, -0.34, 1.06, -0.22, 0, 0.18, 0, UV_BRICK));
  impStoneParts.push(buildBox(0.07, 0.22, 0.07, -0.06, 1.06, -0.16, 0, 0.18, 0, UV_BRICK));

  for (let w = -2; w <= 2; w++) {
    const wx = -0.20 + Math.cos(0.18) * (w * 0.14) + Math.sin(0.18) * 0.215;
    const wz = -0.18 - Math.sin(0.18) * (w * 0.14) + Math.cos(0.18) * 0.215;
    impWindowParts.push(buildBox(0.065, 0.11, 0.02, wx, 0.66, wz, 0, 0.18, 0, UV_PLASTER));
    impWindowParts.push(buildBox(0.065, 0.10, 0.02, wx, 0.47, wz, 0, 0.18, 0, UV_PLASTER));
  }

  // Сводчатый каменный пороховой погреб во дворе
  impStoneParts.push(buildBox(0.36, 0.26, 0.28, 0.36, 0.45, 0.22, 0, -0.32, 0, UV_SLATE));
  const magRoof = new THREE.CylinderGeometry(0.145, 0.145, 0.37, 10, 1, false, 0, Math.PI);
  magRoof.rotateZ(Math.PI * 0.5);
  magRoof.rotateY(-0.32);
  magRoof.translate(0.36, 0.58, 0.22);
  remapUVRect(magRoof, ...UV_TIN_ROOF);
  impRoofMetalParts.push(ensureNonIndexedWithUV(magRoof));

  // Круглая сторожевая башня-блокгауз с бойницами и конической зелёной жестяной крышей + флагшток!
  impStoneParts.push(buildCyl(0.24, 0.29, 0.96, 14, 0.34, 0.78, -0.26, 0, 0, 0, UV_BRICK));
  impStoneParts.push(buildCyl(0.28, 0.26, 0.14, 14, 0.34, 1.30, -0.26, 0, 0, 0, UV_SLATE)); // боевой ярус с консолью
  impRoofMetalParts.push(buildCyl(0.02, 0.31, 0.38, 14, 0.34, 1.56, -0.26, 0, 0, 0, UV_TIN_ROOF));

  // Флагшток на вершине башни крепости
  impIronParts.push(buildCyl(0.014, 0.018, 0.92, 7, 0.34, 2.02, -0.26, 0, 0, 0, UV_SHINGLE));

  const impFortStoneGeo = mergeGeometries(impStoneParts, false);
  const impFortRoofGeo = mergeGeometries(impRoofMetalParts, false);
  const impFortIronGeo = mergeGeometries(impIronParts, false);
  const impFortWinGeo = mergeGeometries(impWindowParts, false);

  // ==========================================================================
  // 2. БОЕВАЯ КАВКАЗСКАЯ (ВАЙНАХСКАЯ / АВАРСКАЯ) БАШНЯ С МАШИКУЛЯМИ И СТУПЕНЧАТОЙ КРЫШЕЙ
  // ==========================================================================
  const towerStoneParts = [];
  const towerWoodParts = [];
  const towerDarkSlitParts = [];

  // Каменная ограда, цоколь двора-башни и глубокая подпорная скальная кладка-фундамент для отвесных куэст Дагестана!
  towerStoneParts.push(buildBox(1.12, 0.16, 1.12, 0, 0.08, 0, 0, 0, 0, UV_SLATE));
  towerStoneParts.push(buildCyl(0.79, 1.02, 0.88, 4, 0, -0.42, 0, 0, Math.PI * 0.25, 0, UV_SLATE));
  for (const sgn of [-1, 1]) {
    towerStoneParts.push(buildBox(1.10, 0.28, 0.10, 0, 0.26, sgn * 0.51, 0, 0, 0, UV_SLATE));
    towerStoneParts.push(buildBox(0.10, 0.28, 0.94, sgn * 0.51, 0.26, 0, 0, 0, 0, UV_SLATE));
  }

  // Классический трапециевидный сужающийся кверху ствол боевой башни (4 грани с уклоном ~7°!)
  const shaft = new THREE.CylinderGeometry(0.30, 0.44, 1.78, 4);
  shaft.rotateY(Math.PI * 0.25);
  shaft.translate(0, 1.04, 0);
  remapUVRect(shaft, ...UV_SLATE);
  towerStoneParts.push(ensureNonIndexedWithUV(shaft));

  // 4 навесных каменных балкончика-машикуля («чIерх») на резных кронштейнах по всем 4 стенам!
  for (let side = 0; side < 4; side++) {
    const a = side * (Math.PI * 0.5);
    const sx = Math.sin(a) * 0.26;
    const sz = Math.cos(a) * 0.26;
    // Каменный парапет машикуля
    towerStoneParts.push(buildBox(0.24, 0.18, 0.12, sx, 1.78, sz, 0, a, 0, UV_SLATE));
    // 2 ступенчатых каменных кронштейна под балкончиком
    for (const cs of [-0.075, 0.075]) {
      const kx = Math.sin(a) * 0.23 + Math.cos(a) * cs;
      const kz = Math.cos(a) * 0.23 - Math.sin(a) * cs;
      towerStoneParts.push(buildBox(0.045, 0.10, 0.11, kx, 1.65, kz, 0, a, 0, UV_SLATE));
    }
    // Вертикальные узкие бойницы на 2-м, 3-м и 4-м ярусах
    for (const [ly, lr] of [
      [0.82, 0.275],
      [1.24, 0.248],
      [1.56, 0.228]
    ]) {
      towerDarkSlitParts.push(
        buildBox(0.036, 0.12, 0.03, Math.sin(a) * lr, ly, Math.cos(a) * lr, 0, a, 0, UV_SHINGLE)
      );
    }
  }

  // Знаменитая 5-ступенчатая пирамидальная сланцевая крыша «цIурку» с каменным шаром-навершием («цIогал»)!
  for (let st = 0; st < 5; st++) {
    const f = st / 5;
    const w = 0.48 - f * 0.36;
    const y = 1.97 + st * 0.115;
    towerStoneParts.push(buildBox(w, 0.11, w, 0, y, 0, 0, 0, 0, UV_SHINGLE));
  }
  // Венчающий камень-навершие «цIогал»
  const capstone = new THREE.SphereGeometry(0.068, 9, 8);
  capstone.scale(1.0, 1.35, 1.0);
  capstone.translate(0, 2.57, 0);
  remapUVRect(capstone, ...UV_PLASTER);
  towerStoneParts.push(ensureNonIndexedWithUV(capstone));

  // Приподнятый арочный вход с деревянной окованной дверью и каменным крыльцом на 2-м ярусе
  towerWoodParts.push(buildBox(0.14, 0.26, 0.05, 0, 0.56, 0.29, 0, 0, 0, UV_WOOD));
  towerStoneParts.push(buildBox(0.24, 0.38, 0.16, 0, 0.24, 0.36, 0, 0, 0, UV_SLATE));

  // Пристроенный деревянный жилой балкон-галерея к одной из стен башни
  towerWoodParts.push(buildBox(0.46, 0.05, 0.22, -0.34, 0.68, 0.0, 0, 0, 0, UV_WOOD));
  towerWoodParts.push(buildBox(0.04, 0.22, 0.22, -0.55, 0.78, 0.0, 0, 0, 0, UV_WOOD));
  towerWoodParts.push(buildBox(0.04, 0.56, 0.04, -0.54, 0.40, -0.09, 0, 0, 0, UV_WOOD));
  towerWoodParts.push(buildBox(0.04, 0.56, 0.04, -0.54, 0.40, 0.09, 0, 0, 0, UV_WOOD));

  const vainakhStoneGeo = mergeGeometries(towerStoneParts, false);
  const vainakhWoodGeo = mergeGeometries(towerWoodParts, false);
  const vainakhSlitsGeo = mergeGeometries(towerDarkSlitParts, false);

  // ==========================================================================
  // 3. СТОЛИЦА ИМАМАТА ДАРГО-ВЕДЕНО (ПАЛАТЫ ДИВАН-ХАНЫ, МЕЧЕТЬ, МИНАРЕТ, ЧАСТОКОЛ)
  // ==========================================================================
  const capStoneParts = [];
  const capPlasterParts = [];
  const capWoodParts = [];
  const capGoldParts = [];
  const capWinParts = [];

  // Внешняя двойная ограда Дарго-Ведено: земляной вал + глубокий каменный террасный цоколь + 8-угольный частокол!
  capStoneParts.push(buildCyl(1.48, 1.72, 0.20, 8, 0, 0.10, 0, 0, Math.PI / 8, 0, UV_TURF));
  capStoneParts.push(buildCyl(1.70, 2.02, 0.78, 8, 0, -0.38, 0, 0, Math.PI / 8, 0, UV_SLATE));
  for (let side = 0; side < 8; side++) {
    const a = (side / 8) * Math.PI * 2;
    const wx = Math.sin(a) * 1.28;
    const wz = Math.cos(a) * 1.28;
    if (side !== 0) {
      capWoodParts.push(buildBox(0.98, 0.46, 0.14, wx, 0.36, wz, 0, a, 0, UV_WOOD));
    } else {
      // Деревянно-каменные ворота Дарго-Ведено с надвратной башенкой!
      capStoneParts.push(buildBox(0.56, 0.66, 0.28, wx, 0.46, wz, 0, a, 0, UV_SLATE));
      capWoodParts.push(buildBox(0.26, 0.38, 0.31, wx, 0.34, wz, 0, a, 0, UV_WOOD));
      capStoneParts.push(buildBox(0.62, 0.12, 0.34, wx, 0.83, wz, 0, a, 0, UV_SHINGLE));
    }
    if (side % 2 === 1) {
      // Угловые бревенчатые бастионы Ведено под трофейные пушки Имамата
      const ba = a + Math.PI / 8;
      capWoodParts.push(buildCyl(0.28, 0.34, 0.56, 6, Math.sin(ba) * 1.38, 0.40, Math.cos(ba) * 1.38, 0, 0, 0, UV_WOOD));
      capStoneParts.push(buildCyl(0.24, 0.28, 0.08, 6, Math.sin(ba) * 1.38, 0.70, Math.cos(ba) * 1.38, 0, 0, 0, UV_TURF));
    }
  }

  // Двухэтажные каменные палаты Диван-ханы (резиденция Имама Шамиля) с резной деревянной галереей на колоннах!
  capPlasterParts.push(buildBox(0.98, 0.68, 0.56, -0.26, 0.52, -0.05, 0, 0.12, 0, UV_PLASTER));
  capStoneParts.push(buildBox(1.06, 0.10, 0.64, -0.26, 0.89, -0.05, 0, 0.12, 0, UV_SHINGLE));
  // Деревянный двухъярусный айван-галерея вдоль переднего фасада палат!
  capWoodParts.push(buildBox(0.96, 0.05, 0.22, -0.22, 0.52, 0.29, 0, 0.12, 0, UV_WOOD));
  capWoodParts.push(buildBox(0.96, 0.05, 0.22, -0.22, 0.84, 0.29, 0, 0.12, 0, UV_WOOD));
  for (let p = -2; p <= 2; p++) {
    const px = -0.22 + Math.cos(0.12) * (p * 0.21);
    const pz = 0.38 - Math.sin(0.12) * (p * 0.21);
    capWoodParts.push(buildCyl(0.022, 0.026, 0.68, 6, px, 0.52, pz, 0, 0, 0, UV_WOOD));
  }
  // Тёплые стрельчатые окна Диван-ханы
  for (let w = -2; w <= 2; w++) {
    const wx = -0.24 + Math.cos(0.12) * (w * 0.18);
    const wz = 0.235 - Math.sin(0.12) * (w * 0.18);
    capWinParts.push(buildBox(0.08, 0.14, 0.03, wx, 0.68, wz, 0, 0.12, 0, UV_PLASTER));
    capWinParts.push(buildBox(0.08, 0.12, 0.03, wx, 0.38, wz, 0, 0.12, 0, UV_PLASTER));
  }

  // Соборная Джума-мечеть с куполом + стройный минарет с балконом-шерефе и золотым полумесяцем!
  capPlasterParts.push(buildBox(0.62, 0.52, 0.58, 0.48, 0.44, -0.26, 0, -0.15, 0, UV_PLASTER));
  const mosqueDome = new THREE.SphereGeometry(0.28, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.55);
  mosqueDome.translate(0.48, 0.69, -0.26);
  remapUVRect(mosqueDome, ...UV_TIN_ROOF);
  capStoneParts.push(ensureNonIndexedWithUV(mosqueDome));

  // Высокий цилиндрический минарет из тёсаного камня + балкон-шерефе + конический купол + золотой полумесяц!
  capStoneParts.push(buildCyl(0.16, 0.22, 1.56, 14, 0.64, 0.98, 0.20, 0, 0, 0, UV_SLATE));
  capWoodParts.push(buildCyl(0.24, 0.18, 0.14, 14, 0.64, 1.66, 0.20, 0, 0, 0, UV_WOOD)); // балкон шерефе
  capPlasterParts.push(buildCyl(0.13, 0.15, 0.26, 14, 0.64, 1.84, 0.20, 0, 0, 0, UV_PLASTER));
  capStoneParts.push(buildCyl(0.015, 0.16, 0.36, 14, 0.64, 2.15, 0.20, 0, 0, 0, UV_TIN_ROOF));

  // Золочёные навершия-полумесяцы над минаретом и куполом мечети + флагшток знамени Имамата!
  const finialSpire = buildCyl(0.012, 0.016, 0.22, 6, 0.64, 2.42, 0.20, 0, 0, 0, UV_PLASTER);
  const crescent = new THREE.TorusGeometry(0.055, 0.014, 7, 14, Math.PI * 1.45);
  crescent.rotateZ(Math.PI * 0.78);
  crescent.translate(0.64, 2.54, 0.20);
  const domeFinial = buildCyl(0.01, 0.014, 0.18, 6, 0.48, 1.05, -0.26, 0, 0, 0, UV_PLASTER);
  capGoldParts.push(finialSpire, ensureNonIndexedWithUV(crescent), domeFinial);

  // Флагшток знамени Имамата у палат Диван-ханы
  capWoodParts.push(buildCyl(0.014, 0.018, 1.38, 7, -0.58, 1.52, 0.24, 0, 0, 0, UV_WOOD));
  capGoldParts.push(buildCyl(0.008, 0.022, 0.08, 6, -0.58, 2.24, 0.24, 0, 0, 0, UV_PLASTER));

  const capStoneGeo = mergeGeometries(capStoneParts, false);
  const capPlasterGeo = mergeGeometries(capPlasterParts, false);
  const capWoodGeo = mergeGeometries(capWoodParts, false);
  const capGoldGeo = mergeGeometries(capGoldParts, false);
  const capWinGeo = mergeGeometries(capWinParts, false);

  // ==========================================================================
  // 4. КАМЕННЫЙ СВОДЧАТЫЙ АРОЧНЫЙ МОСТ ЧЕРЕЗ ГОРНЫЕ РЕКИ (ЦЕЛЫЙ И РАЗОБРАННЫЙ)
  // Локальная ось +Z — пролёт моста от берега к берегу (длина ~2.64),
  // локальная ось +X — направление течения реки строго под высоким сводом (просвет ~1.22)!
  // ==========================================================================
  const bridgeIntactParts = [];
  const bridgeDismantledParts = [];

  // Мощные береговые устои (быки) с глубоким заглублением в скальные берега каньона (до y = -1.25 — ноль парения даже в Сулакском каньоне!)
  for (const sgn of [-1, 1]) {
    bridgeIntactParts.push(buildBox(0.60, 1.72, 0.78, 0, -0.39, sgn * 0.94, 0, 0, 0, UV_SLATE));
    bridgeIntactParts.push(buildBox(0.68, 1.08, 0.42, 0, -0.44, sgn * 1.28, 0, 0, 0, UV_SLATE)); // береговые крылья-контрфорсы
    bridgeDismantledParts.push(buildBox(0.58, 1.62, 0.74, 0, -0.42, sgn * 0.96, 0, 0, 0, UV_SLATE));
    bridgeDismantledParts.push(buildBox(0.64, 1.00, 0.40, 0, -0.46, sgn * 1.28, 0, 0, 0, UV_SLATE));
    // Плавные береговые пандусы-въезды на оба берега (соединяют пролёт с уровнем дороги на берегу без обрыва!)
    bridgeIntactParts.push(
      buildBox(0.48, 0.10, 0.56, 0, 0.27, sgn * 1.48, sgn * 0.52, 0, 0, UV_SHINGLE)
    );
    bridgeIntactParts.push(
      buildBox(0.56, 0.46, 0.52, 0, 0.04, sgn * 1.50, 0, 0, 0, UV_SLATE)
    );
    // Каменные парапеты-ограждения с плавным уклоном по арке (x = ±0.255) + тёсаные каменные тумбы на въездах
    for (let k = -5; k <= 5; k++) {
      const bz = k * 0.24;
      const archRise = Math.max(0, Math.cos((bz / 1.18) * Math.PI * 0.5)) * 0.34;
      const pTilt = Math.sin((bz / 1.18) * Math.PI * 0.5) * 0.34;
      bridgeIntactParts.push(buildBox(0.08, 0.17, 0.25, sgn * 0.255, 0.53 + archRise, bz, pTilt, 0, 0, UV_SLATE));
    }
    for (const endSgn of [-1, 1]) {
      bridgeIntactParts.push(buildBox(0.13, 0.24, 0.13, sgn * 0.265, 0.53, endSgn * 1.24, 0, 0, 0, UV_SLATE));
      // Пологие каменные парапеты на береговых пандусах
      bridgeIntactParts.push(buildBox(0.08, 0.15, 0.52, sgn * 0.255, 0.34, endSgn * 1.48, endSgn * 0.52, 0, 0, UV_SLATE));
    }
  }
  // 13 клинчатых камней высокого полуциркульного свода арки (чистый пролёт над водой!) с выступающим замковым камнем
  for (let v = 0; v < 13; v++) {
    const t = v / 12; // 0..1
    const ang = -Math.PI * 0.46 + t * Math.PI * 0.92;
    const isKeystone = v === 6;
    const rad = 0.65;
    const vz = Math.sin(ang) * rad;
    const vy = 0.14 + Math.cos(ang) * rad;
    bridgeIntactParts.push(
      buildBox(
        0.58 + (isKeystone ? 0.05 : 0),
        isKeystone ? 0.17 : 0.13,
        0.16,
        0,
        vy,
        vz,
        ang,
        0,
        0,
        UV_SLATE
      )
    );
  }
  // Плавное горбатое мощёное дорожное полотно (от левого берега через свод к правому берегу — без ступенек!)
  for (let k = -5; k <= 5; k++) {
    const bz = k * 0.24;
    const archRise = Math.max(0, Math.cos((bz / 1.18) * Math.PI * 0.5)) * 0.34;
    const slopeTilt = Math.sin((bz / 1.18) * Math.PI * 0.5) * 0.36;
    bridgeIntactParts.push(buildBox(0.48, 0.09, 0.27, 0, 0.46 + archRise, bz, slopeTilt, 0, 0, UV_SHINGLE));
  }

  // Руины обрушенного свода при подрыве/разборе моста (оба устоя стоят на противоположных берегах, арка проломлена в поток)
  bridgeDismantledParts.push(buildBox(0.50, 0.12, 0.42, 0, 0.46, -0.56, 0.38, 0, 0, UV_SLATE));
  bridgeDismantledParts.push(buildBox(0.50, 0.12, 0.42, 0, 0.46, 0.56, -0.40, 0, 0, UV_SLATE));
  bridgeDismantledParts.push(buildBox(0.28, 0.14, 0.24, -0.09, 0.06, 0.05, 0.2, 0.5, 0.15, UV_SLATE));
  bridgeDismantledParts.push(buildBox(0.24, 0.12, 0.22, 0.14, 0.05, -0.10, -0.15, 0.9, 0.2, UV_SLATE));

  const bridgeIntactGeo = mergeGeometries(bridgeIntactParts, false);
  const bridgeDismantledGeo = mergeGeometries(bridgeDismantledParts, false);

  // ==========================================================================
  // 5. ДЕТАЛИЗИРОВАННАЯ ГОРСКАЯ САКЛЯ С ДЕРЕВЯННЫМ АЙВАНОМ И БАЛКАМИ (ДЛЯ INSTANCEDMESH)
  // ==========================================================================
  const saklyaStone = mergeGeometries(
    [
      buildBox(0.42, 0.30, 0.36, 0, 0.15, 0, 0, 0, 0, UV_SLATE),
      buildBox(0.44, 0.42, 0.38, 0, -0.20, 0, 0, 0, 0, UV_SLATE), // подпорная каменная кладка горской террасной сакли!
      buildBox(0.08, 0.16, 0.08, -0.13, 0.34, -0.10, 0, 0, 0, UV_SLATE) // каменный дымоход на крыше!
    ],
    false
  );
  const saklyaTimberRoof = mergeGeometries(
    [
      buildBox(0.48, 0.055, 0.46, 0, 0.31, 0.04, 0, 0, 0, UV_SHINGLE), // нависающая плоская кровля
      buildBox(0.42, 0.035, 0.14, 0, 0.12, 0.23, 0, 0, 0, UV_WOOD),    // настил деревянного балкона-айвана!
      buildBox(0.42, 0.06, 0.025, 0, 0.17, 0.29, 0, 0, 0, UV_WOOD),    // перила айвана
      buildBox(0.03, 0.28, 0.03, -0.18, 0.17, 0.27, 0, 0, 0, UV_WOOD), // столбы-опоры галереи
      buildBox(0.03, 0.28, 0.03, 0.18, 0.17, 0.27, 0, 0, 0, UV_WOOD)
    ],
    false
  );
  const saklyaWin = mergeGeometries(
    [
      buildBox(0.075, 0.085, 0.02, -0.09, 0.21, 0.185, 0, 0, 0, UV_PLASTER),
      buildBox(0.075, 0.085, 0.02, 0.09, 0.21, 0.185, 0, 0, 0, UV_PLASTER)
    ],
    false
  );

  // Шаблоны полотнищ крепостных флагов (Имперский и знамя Имамата)
  const impFlagTemplate = new THREE.PlaneGeometry(0.48, 0.30, 8, 3);
  impFlagTemplate.translate(-0.24, 0, 0);
  impFlagTemplate.rotateY(-Math.PI * 0.5);
  remapUVRect(impFlagTemplate, 0.76, 0.25, 0.99, 0.46);

  const imamatFlagTemplate = new THREE.PlaneGeometry(0.52, 0.34, 8, 3);
  imamatFlagTemplate.translate(-0.26, 0, 0);
  imamatFlagTemplate.rotateY(-Math.PI * 0.5);
  remapUVRect(imamatFlagTemplate, 0.76, 0.015, 0.99, 0.23);

  return {
    impFortStoneGeo,
    impFortRoofGeo,
    impFortIronGeo,
    impFortWinGeo,
    vainakhStoneGeo,
    vainakhWoodGeo,
    vainakhSlitsGeo,
    capStoneGeo,
    capPlasterGeo,
    capWoodGeo,
    capGoldGeo,
    capWinGeo,
    bridgeIntactGeo,
    bridgeDismantledGeo,
    saklyaStone,
    saklyaTimberRoof,
    saklyaWin,
    impFlagTemplate,
    imamatFlagTemplate
  };
}

export function getSharedPhotorealFortressAssets() {
  if (cachedFortressAssets) return cachedFortressAssets;

  const { diffTex, normTex, roughTex } = createFortressArchPbrAtlas();
  const geos = buildSharedFortressGeometries();

  const makeMat = (opts) =>
    new THREE.MeshStandardMaterial({
      map: diffTex,
      normalMap: normTex,
      roughnessMap: roughTex,
      ...opts
    });

  const materials = {
    masonry: makeMat({
      color: '#ffffff',
      normalScale: new THREE.Vector2(0.72, 0.72),
      roughness: 0.88
    }),
    plaster: makeMat({
      color: '#ffffff',
      normalScale: new THREE.Vector2(0.35, 0.35),
      roughness: 0.84
    }),
    timber: makeMat({
      color: '#ffffff',
      normalScale: new THREE.Vector2(0.62, 0.62),
      roughness: 0.84
    }),
    tinRoof: makeMat({
      color: '#ffffff',
      normalScale: new THREE.Vector2(0.45, 0.45),
      roughness: 0.48,
      metalness: 0.36
    }),
    castIron: new THREE.MeshStandardMaterial({
      color: '#252930',
      roughness: 0.42,
      metalness: 0.82
    }),
    darkLoophole: new THREE.MeshBasicMaterial({
      color: '#0c0a09'
    }),
    goldCrescent: new THREE.MeshStandardMaterial({
      color: '#fbbf24',
      emissive: '#92400e',
      emissiveIntensity: 0.25,
      roughness: 0.22,
      metalness: 0.92
    }),
    warmWindow: new THREE.MeshStandardMaterial({
      color: '#fde68a',
      emissive: '#f59e0b',
      emissiveIntensity: 0.42,
      roughness: 0.35
    }),
    flagCloth: makeMat({
      color: '#ffffff',
      normalScale: new THREE.Vector2(0.32, 0.32),
      roughness: 0.68,
      side: THREE.DoubleSide
    })
  };

  cachedFortressAssets = { diffTex, normTex, roughTex, geos, materials };
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
 * 1. ЗВЁЗДЧАТАЯ БАСТИОННАЯ КРЕПОСТЬ КАВКАЗСКОЙ ЛИНИИ (Грозная, Внезапная, Темир-Хан-Шура и др.)
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

  root.add(setup(new THREE.Mesh(geos.impFortStoneGeo, mat(materials.masonry))));
  root.add(setup(new THREE.Mesh(geos.impFortRoofGeo, mat(materials.tinRoof))));
  root.add(setup(new THREE.Mesh(geos.impFortIronGeo, mat(materials.castIron))));
  root.add(setup(new THREE.Mesh(geos.impFortWinGeo, mat(materials.warmWindow))));

  const flagGeo = geos.impFlagTemplate.clone();
  disposableClones.push(flagGeo);
  const flagMesh = setup(new THREE.Mesh(flagGeo, mat(materials.flagCloth)));
  flagMesh.position.set(0.34, 2.31, -0.26);
  const baseFlagZ = new Float32Array(flagGeo.attributes.position.count);
  for (let i = 0; i < baseFlagZ.length; i++) {
    baseFlagZ[i] = flagGeo.attributes.position.getZ(i);
  }
  root.add(flagMesh);

  root.userData.photorealFortressRig = {
    flagMesh,
    baseFlagZ,
    span: 0.48,
    disposableClones
  };
  return root;
}

/**
 * 2. БОЕВАЯ КАВКАЗСКАЯ (ВАЙНАХСКАЯ / АВАРСКАЯ) БАШНЯ С МАШИКУЛЯМИ И СТУПЕНЧАТОЙ КРЫШЕЙ
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

  root.add(setup(new THREE.Mesh(geos.vainakhStoneGeo, mat(materials.masonry))));
  root.add(setup(new THREE.Mesh(geos.vainakhWoodGeo, mat(materials.timber))));
  root.add(new THREE.Mesh(geos.vainakhSlitsGeo, mat(materials.darkLoophole)));

  root.userData.photorealFortressRig = { disposableClones };
  return root;
}

/**
 * 3. СТОЛИЦА ИМАМАТА ДАРГО-ВЕДЕНО (ПАЛАТЫ ДИВАН-ХАНЫ, МЕЧЕТЬ, МИНАРЕТ, ДВОЙНОЙ ЧАСТОКОЛ)
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

  root.add(setup(new THREE.Mesh(geos.capStoneGeo, mat(materials.masonry))));
  root.add(setup(new THREE.Mesh(geos.capPlasterGeo, mat(materials.plaster))));
  root.add(setup(new THREE.Mesh(geos.capWoodGeo, mat(materials.timber))));
  root.add(setup(new THREE.Mesh(geos.capGoldGeo, mat(materials.goldCrescent))));
  root.add(setup(new THREE.Mesh(geos.capWinGeo, mat(materials.warmWindow))));

  const flagGeo = geos.imamatFlagTemplate.clone();
  disposableClones.push(flagGeo);
  const flagMesh = setup(new THREE.Mesh(flagGeo, mat(materials.flagCloth)));
  flagMesh.position.set(-0.58, 2.02, 0.24);
  const baseFlagZ = new Float32Array(flagGeo.attributes.position.count);
  for (let i = 0; i < baseFlagZ.length; i++) {
    baseFlagZ[i] = flagGeo.attributes.position.getZ(i);
  }
  root.add(flagMesh);

  root.userData.photorealFortressRig = {
    flagMesh,
    baseFlagZ,
    span: 0.52,
    disposableClones
  };
  return root;
}

/**
 * 4. КАМЕННЫЙ СВОДЧАТЫЙ МОСТ ЧЕРЕЗ ГОРНУЮ РЕКУ (ЦЕЛЫЙ ИЛИ ПОДОРВАННЫЙ)
 */
export function createPhotorealStoneBridgeInstance({
  dismantled = false,
  scale = 1.0,
  castShadow = true,
  clippingPlanes = null
} = {}) {
  const { geos, materials } = getSharedPhotorealFortressAssets();
  const { disposableClones, mat } = makeClip(clippingPlanes);

  const root = new THREE.Group();
  root.scale.setScalar(scale);

  const bridgeMat = mat(materials.masonry);
  if (dismantled) {
    const scorched = bridgeMat.clone();
    scorched.color.set('#3b342f');
    scorched.emissive = new THREE.Color('#7f1d1d');
    scorched.emissiveIntensity = 0.28;
    disposableClones.push(scorched);
    const mesh = new THREE.Mesh(geos.bridgeDismantledGeo, scorched);
    mesh.castShadow = castShadow;
    mesh.receiveShadow = true;
    root.add(mesh);
  } else {
    const mesh = new THREE.Mesh(geos.bridgeIntactGeo, bridgeMat);
    mesh.castShadow = castShadow;
    mesh.receiveShadow = true;
    root.add(mesh);
  }

  root.userData.photorealFortressRig = { disposableClones };
  return root;
}

/**
 * 5. ГЕОМЕТРИИ И МАТЕРИАЛЫ ТЕРРАСНЫХ КАМЕННЫХ САКЛЕЙ С ДЕРЕВЯННЫМИ ГАЛЕРЕЯМИ (ДЛЯ INSTANCEDMESH)
 */
export function getDetailedSaklyaAssets() {
  const { geos, materials } = getSharedPhotorealFortressAssets();
  return {
    stoneGeo: geos.saklyaStone,
    roofTimberGeo: geos.saklyaTimberRoof,
    winGeo: geos.saklyaWin,
    stoneMat: materials.masonry,
    roofTimberMat: materials.timber
  };
}

/**
 * Обновляет развевание флагов крепостей и столицы, а также ночное свечение окон.
 */
export function updatePhotorealFortressFlags(parentGroup, elapsed, timeOfDay = 'day') {
  const assets = cachedFortressAssets;
  if (assets?.materials?.warmWindow) {
    if (timeOfDay === 'night') {
      assets.materials.warmWindow.color.set('#fef08a');
      assets.materials.warmWindow.emissiveIntensity = 2.2;
    } else if (timeOfDay === 'sunset') {
      assets.materials.warmWindow.color.set('#fde68a');
      assets.materials.warmWindow.emissiveIntensity = 1.25;
    } else {
      assets.materials.warmWindow.color.set('#362c22');
      assets.materials.warmWindow.emissiveIntensity = 0.0;
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
