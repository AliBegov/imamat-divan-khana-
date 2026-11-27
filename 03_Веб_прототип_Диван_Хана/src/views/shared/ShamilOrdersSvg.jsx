// Чистая HTML + SVG реконструкция 25 подлинных орденов и знаков отличия Имамата Шамиля (XIX в.)
// По экспозиции Национального музея Республики Дагестан им. А. Тахо-Годи (кубачинская и гоцатлинская чеканка, чернь, позолота)
import { useId, useState } from 'react';
import {
  KUBACHI_25_ORDERS_CATALOG,
  getOrderCatalogItemById
} from '../../game/naibPoliticsEngine.js';

const DEG = Math.PI / 180;

function polar(cx, cy, r, deg) {
  const rad = (deg - 90) * DEG;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}

// Плавный фестончатый контур 8- или 24-лепестковой звезды / резного обода
function scallopedPath(cx, cy, lobes, rOuter, rInner, sharp = 0.65) {
  const steps = Math.max(72, lobes * 18);
  const pts = [];
  for (let i = 0; i < steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const wave = Math.pow(0.5 + 0.5 * Math.cos(lobes * t), sharp);
    const r = rInner + (rOuter - rInner) * wave;
    const x = cx + r * Math.cos(t - Math.PI / 2);
    const y = cy + r * Math.sin(t - Math.PI / 2);
    pts.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return `${pts.join(' ')} Z`;
}

// Прорезной сердцевидный лепесток (для круглого прорезного знака храбрости — order_lion)
function heartPetalPath(cx, cy, angleDeg, rInner, rOuter, spreadDeg) {
  const [x0, y0] = polar(cx, cy, rInner, angleDeg);
  const [xL, yL] = polar(cx, cy, rOuter * 0.88, angleDeg - spreadDeg);
  const [xLC, yLC] = polar(cx, cy, rOuter * 1.04, angleDeg - spreadDeg * 0.48);
  const [xM, yM] = polar(cx, cy, rOuter * 0.88, angleDeg);
  const [xRC, yRC] = polar(cx, cy, rOuter * 1.04, angleDeg + spreadDeg * 0.48);
  const [xR, yR] = polar(cx, cy, rOuter * 0.88, angleDeg + spreadDeg);
  return [
    `M${x0.toFixed(2)},${y0.toFixed(2)}`,
    `C${xL.toFixed(2)},${yL.toFixed(2)} ${xLC.toFixed(2)},${yLC.toFixed(2)} ${xM.toFixed(2)},${yM.toFixed(2)}`,
    `C${xRC.toFixed(2)},${yRC.toFixed(2)} ${xR.toFixed(2)},${yR.toFixed(2)} ${x0.toFixed(2)},${y0.toFixed(2)}`,
    'Z'
  ].join(' ');
}

// Заострённый миндалевидный прорезной лепесток (для 5-, 6- и 8-лучевых розеток)
function almondPetalPath(cx, cy, angleDeg, rInner, rOuter, halfSpread) {
  const [x0, y0] = polar(cx, cy, rInner, angleDeg);
  const [xL, yL] = polar(cx, cy, (rInner + rOuter) * 0.54, angleDeg - halfSpread);
  const [x1, y1] = polar(cx, cy, rOuter, angleDeg);
  const [xR, yR] = polar(cx, cy, (rInner + rOuter) * 0.54, angleDeg + halfSpread);
  return `M${x0.toFixed(2)},${y0.toFixed(2)} Q${xL.toFixed(2)},${yL.toFixed(2)} ${x1.toFixed(2)},${y1.toFixed(2)} Q${xR.toFixed(2)},${yR.toFixed(2)} ${x0.toFixed(2)},${y0.toFixed(2)} Z`;
}

// Звезда с заданным числом лучей (для центральных накладок и гравировки)
function starPolyPoints(cx, cy, points, rOuter, rInner, rotOffset = 0) {
  const res = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? rOuter : rInner;
    const [x, y] = polar(cx, cy, r, (i * 180) / points + rotOffset);
    res.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return res.join(' ');
}

// Каплевидный / трилистный картуш (лепестки звезды Мудира)
function teardropLobePath(cx, cy, angleDeg, rIn, rOut, widthDeg) {
  const [x0, y0] = polar(cx, cy, rIn, angleDeg);
  const [c1x, c1y] = polar(cx, cy, rIn + (rOut - rIn) * 0.65, angleDeg - widthDeg);
  const [t1x, t1y] = polar(cx, cy, rOut, angleDeg - widthDeg * 0.32);
  const [tipX, tipY] = polar(cx, cy, rOut + 1.5, angleDeg);
  const [t2x, t2y] = polar(cx, cy, rOut, angleDeg + widthDeg * 0.32);
  const [c2x, c2y] = polar(cx, cy, rIn + (rOut - rIn) * 0.65, angleDeg + widthDeg);
  return `M${x0.toFixed(2)},${y0.toFixed(2)} C${c1x.toFixed(2)},${c1y.toFixed(2)} ${t1x.toFixed(2)},${t1y.toFixed(2)} ${tipX.toFixed(2)},${tipY.toFixed(2)} C${t2x.toFixed(2)},${t2y.toFixed(2)} ${c2x.toFixed(2)},${c2y.toFixed(2)} ${x0.toFixed(2)},${y0.toFixed(2)} Z`;
}

// Общие SVG-градиенты кубачинского серебра, черни и античной позолоты
function KubachiMetalDefs({ uid }) {
  return (
    <defs>
      {/* Полированное чеканное серебро с лёгким тёплым античным оттенком */}
      <radialGradient id={`${uid}-sil`} cx="34%" cy="28%" r="72%">
        <stop offset="0%" stopColor="#fdfbf5" />
        <stop offset="28%" stopColor="#e4ded0" />
        <stop offset="62%" stopColor="#b9b09f" />
        <stop offset="88%" stopColor="#857c6d" />
        <stop offset="100%" stopColor="#c7bfb0" />
      </radialGradient>
      {/* Яркое кованое серебро (полумесяц, инкрустация картушей) */}
      <linearGradient id={`${uid}-sil-lin`} x1="12%" y1="8%" x2="88%" y2="92%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="25%" stopColor="#e6e1d6" />
        <stop offset="55%" stopColor="#b5ada0" />
        <stop offset="82%" stopColor="#ded8cb" />
        <stop offset="100%" stopColor="#8a8173" />
      </linearGradient>
      {/* Античная ртутная позолота по серебру (звезда Мудира, 1-й ряд) */}
      <radialGradient id={`${uid}-gilt`} cx="35%" cy="28%" r="74%">
        <stop offset="0%" stopColor="#fff4c4" />
        <stop offset="26%" stopColor="#e6c164" />
        <stop offset="58%" stopColor="#b88c31" />
        <stop offset="86%" stopColor="#7a5718" />
        <stop offset="100%" stopColor="#d8af4b" />
      </radialGradient>
      {/* Тёплая бронзово-золотистая патина (правая часть 4-го ряда) */}
      <radialGradient id={`${uid}-bronze`} cx="36%" cy="30%" r="72%">
        <stop offset="0%" stopColor="#f6e4b8" />
        <stop offset="32%" stopColor="#d1b170" />
        <stop offset="68%" stopColor="#947640" />
        <stop offset="92%" stopColor="#654d26" />
        <stop offset="100%" stopColor="#b59457" />
      </radialGradient>
      {/* Выпуклый сферический серебряный умбон / шарик */}
      <radialGradient id={`${uid}-boss-sil`} cx="32%" cy="28%" r="68%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="26%" stopColor="#e8e2d5" />
        <stop offset="62%" stopColor="#8e8577" />
        <stop offset="100%" stopColor="#3c352d" />
      </radialGradient>
      {/* Выпуклый золочёный купольный умбон */}
      <radialGradient id={`${uid}-boss-gilt`} cx="32%" cy="28%" r="68%">
        <stop offset="0%" stopColor="#fff8d4" />
        <stop offset="30%" stopColor="#ecc55d" />
        <stop offset="66%" stopColor="#996d1e" />
        <stop offset="100%" stopColor="#462f0a" />
      </radialGradient>
      {/* Бордовый музейный бархат для прорезных окон */}
      <radialGradient id={`${uid}-velvet-hole`} cx="45%" cy="40%" r="75%">
        <stop offset="0%" stopColor="#6e1922" />
        <stop offset="65%" stopColor="#470e15" />
        <stop offset="100%" stopColor="#27060a" />
      </radialGradient>
      {/* Тень чеканного рельефа */}
      <filter id={`${uid}-drop`} x="-14%" y="-14%" width="128%" height="128%">
        <feDropShadow dx="1.1" dy="2.1" stdDeviation="1.6" floodColor="#140406" floodOpacity="0.65" />
      </filter>
      {/* Мягкий внутренний рельеф умбона */}
      <filter id={`${uid}-emboss`} x="-15%" y="-15%" width="130%" height="130%">
        <feDropShadow dx="0.6" dy="1.1" stdDeviation="0.9" floodColor="#180a08" floodOpacity="0.58" />
      </filter>
    </defs>
  );
}

// Маппинг названия вручённого ордена -> канонический ID (поддержка всех 25 орденов + войлочный знак)
export function inferOrderIdFromName(name = '') {
  const s = String(name).toLowerCase();
  if (/войлоч|позор|felt|shame/.test(s)) return 'felt_shame_badge';
  const exact = KUBACHI_25_ORDERS_CATALOG.find(
    (o) => o.name.toLowerCase() === s || (o.nameEn && o.nameEn.toLowerCase() === s)
  );
  if (exact) return exact.id;
  if (/мудир|звезд|фестон|mudir|star/.test(s)) return 'order_mudir';
  if (/полумесяц|хилял|crescent|hilal/.test(s)) return 'order_crescent';
  if (/шашк|розетк|медальон|sword|shashka|rosette/.test(s)) return 'order_sword';
  return 'order_lion';
}

// ============================================================================
// ЧЕТЫРЕ ГЛАВНЫХ ИГРОВЫХ ОРДЕНА + 21 ЭКСПОНАТ МУЗЕЙНОЙ ВИТРИНЫ (ВСЕ 25 ЗНАКОВ)
// ============================================================================
function renderOrderArtwork(variant, uid) {
  const sil = `url(#${uid}-sil)`;
  const silLin = `url(#${uid}-sil-lin)`;
  const gilt = `url(#${uid}-gilt)`;
  const bronze = `url(#${uid}-bronze)`;
  const bossSil = `url(#${uid}-boss-sil)`;
  const bossGilt = `url(#${uid}-boss-gilt)`;
  const hole = `url(#${uid}-velvet-hole)`;
  const niello = '#231d19';

  switch (variant) {
    // ---- 1. КРУГЛЫЙ ПРОРЕЗНОЙ ЗНАК ХРАБРОСТИ (Ряд 3, №5 — order_lion) ----
    case 'order_lion':
    case 'case_16': {
      const petals = [0, 72, 144, 216, 288];
      return (
        <g filter={`url(#${uid}-drop)`}>
          <defs>
            <path id={`${uid}-lion-arc`} d="M 16,66 A 39,39 0 0,0 84,66" />
          </defs>
          {/* Основной серебряный чеканный диск */}
          <circle cx="50" cy="50" r="46" fill={sil} stroke="#635b4e" strokeWidth="1.2" />
          <circle cx="50" cy="50" r="43.2" fill="none" stroke={niello} strokeWidth="0.85" strokeOpacity="0.82" />
          <circle cx="50" cy="50" r="40.5" fill="none" stroke="#f7f3ea" strokeWidth="0.6" strokeOpacity="0.65" />

          {/* Пять прорезных сердцевидных лепестков (виднеется музейный бархат) */}
          <g transform="translate(0,-4.5)">
            {petals.map((deg) => (
              <g key={deg}>
                <path
                  d={heartPetalPath(50, 48, deg, 12.5, 34.5, 29)}
                  fill={hole}
                  stroke="#3b2620"
                  strokeWidth="1.2"
                />
                <path
                  d={heartPetalPath(50, 48, deg, 13.4, 33.6, 27)}
                  fill="none"
                  stroke="#f4eee2"
                  strokeWidth="0.55"
                  strokeOpacity="0.55"
                />
              </g>
            ))}

            {/* Центральная 5-лучевая звезда-оправа с чернью */}
            <polygon
              points={starPolyPoints(50, 48, 5, 19.5, 11.2, 36)}
              fill={sil}
              stroke={niello}
              strokeWidth="0.95"
            />
            {[36, 108, 180, 252, 324].map((deg) => {
              const [px, py] = polar(50, 48, 14.5, deg);
              return <circle key={deg} cx={px} cy={py} r="1.4" fill={niello} opacity="0.8" />;
            })}

            {/* Выпуклый сферический умбон с 4-лепестковой чернёной розеткой */}
            <circle cx="50" cy="48" r="10.8" fill={bossSil} stroke={niello} strokeWidth="1.1" filter={`url(#${uid}-emboss)`} />
            {[45, 135, 225, 315].map((deg) => (
              <path key={deg} d={almondPetalPath(50, 48, deg, 1.5, 8.6, 22)} fill={niello} opacity="0.88" />
            ))}
            <circle cx="47.5" cy="45.2" r="2.2" fill="#ffffff" opacity="0.5" />
          </g>

          {/* Изогнутая гравированная шашка вдоль правого и нижнего обода */}
          <path
            d="M 79,30 C 86,44 85,62 72,76 C 69,79 66,81 63,82.5 L 65.2,78.4 C 76,68 80,52 76.5,36 Z"
            fill={niello}
            opacity="0.84"
          />
          {/* Гарда/рукоять шашки внизу справа */}
          <path d="M 62,79 L 68,85 M 65,81 L 60,84" stroke={niello} strokeWidth="1.6" strokeLinecap="round" />

          {/* Нижняя арабская гравированная вязь (чернь) */}
          <path d="M 20,74 Q 50,91 80,74" fill="none" stroke={niello} strokeWidth="0.55" strokeOpacity="0.45" />
          <text
            fontSize="6.7"
            fill={niello}
            fontFamily="'Times New Roman', Georgia, serif"
            fontWeight="700"
            letterSpacing="0.3"
          >
            <textPath href={`#${uid}-lion-arc`} startOffset="50%" textAnchor="middle">
              من تفكر في العواقب لم يشجع
            </textPath>
          </text>
        </g>
      );
    }

    // ---- 2. СЕРЕБРЯНЫЙ ПОЛУМЕСЯЦ «ХИЛЯЛЬ» (Ряд 3, №4 — order_crescent) ----
    case 'order_crescent':
    case 'case_15': {
      return (
        <g filter={`url(#${uid}-drop)`}>
          <defs>
            <path id={`${uid}-hilal-arc`} d="M 16,44 C 21,81 79,81 84,44" />
          </defs>
          {/* Подлинный кованый полумесяц Имамата с острыми рогами */}
          <path
            d="M 11,22 C 6,59 24,86 50,86 C 76,86 94,59 89,22 C 83,49 69,62 50,62 C 31,62 17,49 11,22 Z"
            fill={silLin}
            stroke="#595044"
            strokeWidth="1.35"
            strokeLinejoin="round"
          />
          {/* Внутренняя чеканная обводка по краю пластины */}
          <path
            d="M 13.8,29.5 C 11.2,59 27,82.2 50,82.2 C 73,82.2 88.8,59 86.2,29.5 C 79.8,52.8 67.5,65.2 50,65.2 C 32.5,65.2 20.2,52.8 13.8,29.5 Z"
            fill="none"
            stroke={niello}
            strokeWidth="0.7"
            strokeOpacity="0.72"
          />
          {/* Блик на кованом серебре */}
          <path
            d="M 22,55 C 31,67 44,71 57,69"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeOpacity="0.52"
          />
          {/* Характерный поперечный штрих-отметка на оригинале */}
          <path d="M 38,65 L 40.5,72.5 M 36,68.5 L 43,69" stroke={niello} strokeWidth="0.75" strokeOpacity="0.65" />
          {/* Гравированная арабская надпись вдоль серпа полумесяца */}
          <text
            fontSize="6.4"
            fill={niello}
            fontFamily="'Times New Roman', Georgia, serif"
            fontWeight="700"
            letterSpacing="0.2"
          >
            <textPath href={`#${uid}-hilal-arc`} startOffset="50%" textAnchor="middle">
              نصر من الله وفتح قريب وبشر المؤمنين
            </textPath>
          </text>
          {/* Мелкие штрихи у концов рогов */}
          <circle cx="14.5" cy="36" r="0.9" fill={niello} opacity="0.65" />
          <circle cx="85.5" cy="36" r="0.9" fill={niello} opacity="0.65" />
        </g>
      );
    }

    // ---- 3. МЕДАЛЬОН С РОЗЕТКОЙ И ШАШКОЙ (Ряд 2, №1 — order_sword) ----
    case 'order_sword':
    case 'case_7': {
      return (
        <g filter={`url(#${uid}-drop)`}>
          <defs>
            <path id={`${uid}-sw-bot`} d="M 15,61 A 36.5,36.5 0 0,0 84,61" />
            <path id={`${uid}-sw-top`} d="M 17,45 A 34,34 0 0,1 67,20" />
          </defs>
          {/* Круглый выпуклый серебряный диск с античной патиной */}
          <circle cx="50" cy="50" r="46" fill={sil} stroke="#635b4e" strokeWidth="1.25" />
          <circle cx="50" cy="50" r="42.5" fill="none" stroke={niello} strokeWidth="0.9" strokeOpacity="0.78" />

          {/* Центральный медальон с 8-лепестковой розеткой */}
          <circle cx="48.5" cy="49.5" r="24.2" fill="none" stroke={niello} strokeWidth="1.15" strokeOpacity="0.86" />
          <circle cx="48.5" cy="49.5" r="22.4" fill="none" stroke="#f7f4ec" strokeWidth="0.6" strokeOpacity="0.55" />

          {/* 8 лепестков цветочной розетки */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
            const [cx, cy] = polar(48.5, 49.5, 14.5, deg);
            return (
              <ellipse
                key={deg}
                cx={cx}
                cy={cy}
                rx="6.2"
                ry="8.4"
                transform={`rotate(${deg} ${cx.toFixed(1)} ${cy.toFixed(1)})`}
                fill="none"
                stroke={niello}
                strokeWidth="1.05"
                strokeOpacity="0.82"
              />
            );
          })}

          {/* Внутренняя вихревая 6-лепестковая розетка в самом центре */}
          <circle cx="48.5" cy="49.5" r="9.6" fill={sil} stroke={niello} strokeWidth="1.05" />
          {[0, 60, 120, 180, 240, 300].map((deg) => {
            const [x1, y1] = polar(48.5, 49.5, 9.2, deg);
            const [cx, cy] = polar(48.5, 49.5, 5.2, deg + 32);
            return (
              <path
                key={deg}
                d={`M48.5,49.5 Q${cx.toFixed(1)},${cy.toFixed(1)} ${x1.toFixed(1)},${y1.toFixed(1)}`}
                fill="none"
                stroke={niello}
                strokeWidth="0.95"
                strokeOpacity="0.88"
              />
            );
          })}
          <circle cx="48.5" cy="49.5" r="2.1" fill={niello} opacity="0.75" />

          {/* Гравированный силуэт кавказской шашки справа (как на оригинале!) */}
          <path
            d="M 65,18 C 76,25 81,36 82.5,47 L 80.2,47.5 C 78.6,37 74,27 64,20.5 Z"
            fill={niello}
            opacity="0.88"
          />
          <path d="M 76.5,46 L 86,44.5 M 81.2,45.5 L 82.5,52" stroke={niello} strokeWidth="1.6" strokeLinecap="round" />

          {/* Арабская вязь по нижнему и верхне-левому картушу */}
          <text fontSize="6.4" fill={niello} fontFamily="'Times New Roman', Georgia, serif" fontWeight="700">
            <textPath href={`#${uid}-sw-bot`} startOffset="50%" textAnchor="middle">
              من تفكر في العواقب لم يشجع
            </textPath>
          </text>
          <text fontSize="5.6" fill={niello} fontFamily="'Times New Roman', Georgia, serif" fontWeight="700" opacity="0.82">
            <textPath href={`#${uid}-sw-top`} startOffset="50%" textAnchor="middle">
              عز وشجاعة للمجاهد
            </textPath>
          </text>
        </g>
      );
    }

    // ---- 4. БОЛЬШАЯ ФЕСТОНЧАТАЯ ЗВЕЗДА МУДИРА (Ряд 2, №3 — order_mudir) ----
    case 'order_mudir':
    case 'case_9': {
      const outerBosses = [0, 45, 90, 135, 180, 225, 270, 315];
      const innerPetals = [30, 90, 150, 210, 270, 330];
      const arabWords = ['الإمام', 'شامل', 'المدير', 'نصر', 'الحق', 'شجاعة'];
      return (
        <g filter={`url(#${uid}-drop)`}>
          {/* Позолоченная 8-лепестковая фестончатая звезда-основа */}
          <path d={scallopedPath(50, 50, 8, 47.5, 39.5, 0.55)} fill={gilt} stroke="#5c4010" strokeWidth="1.2" />
          {/* Двойной чеканный рубчатый ободок */}
          <path
            d={scallopedPath(50, 50, 8, 44.6, 37.2, 0.55)}
            fill="none"
            stroke="#5a3d0d"
            strokeWidth="0.85"
            strokeDasharray="1.8 1.2"
          />
          {/* Радиальная золочёная насечка по полю звезды */}
          {Array.from({ length: 36 }).map((_, idx) => {
            const deg = idx * 10;
            const [x1, y1] = polar(50, 50, 22, deg);
            const [x2, y2] = polar(50, 50, 39.5, deg);
            return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#735012" strokeWidth="0.45" opacity="0.42" />;
          })}

          {/* 8 периферийных выпуклых серебряных шариков-умбонов в вершинах фестонов */}
          {outerBosses.map((deg) => {
            const [bx, by] = polar(50, 50, 42.2, deg);
            return (
              <g key={deg}>
                <circle cx={bx} cy={by} r="3.6" fill="#4f360c" opacity="0.65" />
                <circle cx={bx} cy={by} r="2.9" fill={bossSil} stroke="#4e453b" strokeWidth="0.55" />
                <circle cx={bx - 0.8} cy={by - 0.9} r="0.85" fill="#ffffff" opacity="0.75" />
              </g>
            );
          })}

          {/* 6 крупных серебряных картушных лепестков с арабской чернью */}
          {innerPetals.map((deg, idx) => {
            const [tx, ty] = polar(50, 50, 22.8, deg);
            const [sx, sy] = polar(50, 50, 29.8, deg + 30);
            return (
              <g key={deg}>
                <path
                  d={teardropLobePath(50, 50, deg, 10.5, 34.5, 24)}
                  fill={sil}
                  stroke={niello}
                  strokeWidth="1.05"
                />
                <path
                  d={teardropLobePath(50, 50, deg, 12.2, 32.0, 20)}
                  fill="none"
                  stroke={niello}
                  strokeWidth="0.55"
                  strokeOpacity="0.65"
                />
                <text
                  x={tx}
                  y={ty + 1.8}
                  textAnchor="middle"
                  fontSize="5.4"
                  fontFamily="'Times New Roman', Georgia, serif"
                  fontWeight="700"
                  fill={niello}
                  transform={`rotate(${deg > 90 && deg < 270 ? deg + 180 : deg} ${tx.toFixed(1)} ${ty.toFixed(1)})`}
                >
                  {arabWords[idx]}
                </text>
                {/* 6 внутренних серебряных жемчужин между лепестками */}
                <circle cx={sx} cy={sy} r="3.1" fill={bossSil} stroke="#4e453b" strokeWidth="0.6" />
                <circle cx={sx - 0.7} cy={sy - 0.8} r="0.85" fill="#ffffff" opacity="0.78" />
              </g>
            );
          })}

          {/* Центральная выпуклая позолоченная 6-лучевая звезда-умбон */}
          <polygon
            points={starPolyPoints(50, 50, 6, 13.5, 7.6, 0)}
            fill={bossGilt}
            stroke="#5a3c0c"
            strokeWidth="0.95"
            filter={`url(#${uid}-emboss)`}
          />
          <circle cx="50" cy="50" r="4.6" fill={bossSil} stroke="#5d461c" strokeWidth="0.7" />
          <circle cx="48.8" cy="48.6" r="1.4" fill="#ffffff" opacity="0.72" />
        </g>
      );
    }

    // ---- РЯД 1 (№1–6): ВЫПУКЛЫЕ КРУГЛЫЕ ЗНАКИ С УМБОНАМИ И ПОЗОЛОТОЙ ----
    case 'case_1': {
      // Фестончатый серебряно-позолоченный медальон с ажурным куполом
      return (
        <g filter={`url(#${uid}-drop)`}>
          <path d={scallopedPath(50, 50, 28, 46.5, 43.2, 0.7)} fill={gilt} stroke="#634818" strokeWidth="0.9" />
          <circle cx="50" cy="50" r="41.2" fill={sil} stroke={niello} strokeWidth="0.85" />
          <circle cx="50" cy="50" r="35.5" fill="none" stroke={niello} strokeWidth="0.7" strokeDasharray="3.2 1.8" />
          {[0, 90, 180, 270].map((deg) => {
            const [x, y] = polar(50, 50, 31.5, deg);
            return <circle key={deg} cx={x} cy={y} r="3.4" fill={bossSil} stroke={niello} strokeWidth="0.6" />;
          })}
          {/* Ажурный чернёно-золотой купол */}
          <circle cx="50" cy="50" r="21" fill="#2c2419" stroke="#d9b252" strokeWidth="1.5" filter={`url(#${uid}-emboss)`} />
          {[0, 30, 60, 90, 120, 150].map((deg) => {
            const [x1, y1] = polar(50, 50, 20, deg);
            const [x2, y2] = polar(50, 50, 20, deg + 180);
            return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#e2be64" strokeWidth="1.15" />;
          })}
          <circle cx="50" cy="50" r="12.5" fill="none" stroke="#e2be64" strokeWidth="1.1" />
          <circle cx="50" cy="50" r="4.8" fill={bossGilt} />
        </g>
      );
    }

    case 'case_2': {
      // Фестончатый золочёно-серебряный диск с 8-лучевой выпуклой золотой звездой-умбоном
      return (
        <g filter={`url(#${uid}-drop)`}>
          <path d={scallopedPath(50, 50, 32, 46.5, 43.4, 0.7)} fill={gilt} stroke="#634818" strokeWidth="0.9" />
          <circle cx="50" cy="50" r="41" fill={sil} stroke="#785e2b" strokeWidth="0.9" />
          <circle cx="50" cy="50" r="35.5" fill="none" stroke={niello} strokeWidth="0.65" strokeDasharray="4 2" />
          <polygon
            points={starPolyPoints(50, 50, 8, 29, 15, 0)}
            fill={bossGilt}
            stroke="#735012"
            strokeWidth="1.0"
            filter={`url(#${uid}-emboss)`}
          />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
            const [x, y] = polar(50, 50, 27, deg);
            return <line key={deg} x1="50" y1="50" x2={x} y2={y} stroke="#fff4c4" strokeWidth="1.1" opacity="0.65" />;
          })}
          <circle cx="50" cy="50" r="6" fill={bossGilt} />
        </g>
      );
    }

    case 'case_3': {
      // Гладкий круглый серебряный знак с 8-лепестковой розеткой на чёрном фоне
      return (
        <g filter={`url(#${uid}-drop)`}>
          <circle cx="50" cy="50" r="45.5" fill={sil} stroke="#5d5447" strokeWidth="1.2" />
          <circle cx="50" cy="50" r="41" fill="none" stroke={niello} strokeWidth="0.8" />
          <circle cx="50" cy="50" r="24.5" fill="#28231e" stroke="#a69a88" strokeWidth="1.2" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <path key={deg} d={almondPetalPath(50, 50, deg, 6, 22, 22)} fill={sil} stroke={niello} strokeWidth="0.7" />
          ))}
          <circle cx="50" cy="50" r="8.2" fill={bossSil} stroke={niello} strokeWidth="0.8" />
          <circle cx="50" cy="50" r="33.5" fill="none" stroke={niello} strokeWidth="1.1" strokeDasharray="2.5 2.2" opacity="0.7" />
        </g>
      );
    }

    case 'case_4': {
      // Круглый серебряный знак с 8 прорезными миндалевидными лепестками и звёздочками по краю
      return (
        <g filter={`url(#${uid}-drop)`}>
          <circle cx="50" cy="50" r="45.5" fill={sil} stroke="#5d5447" strokeWidth="1.2" />
          <circle cx="50" cy="50" r="41.5" fill="none" stroke={niello} strokeWidth="0.9" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <g key={deg}>
              <path d={almondPetalPath(50, 50, deg, 11.5, 29.5, 14)} fill={hole} stroke={niello} strokeWidth="0.9" />
              <circle cx={polar(50, 50, 35.5, deg + 22.5)[0]} cy={polar(50, 50, 35.5, deg + 22.5)[1]} r="1.5" fill={niello} opacity="0.75" />
            </g>
          ))}
          <circle cx="50" cy="50" r="11" fill={bossSil} stroke={niello} strokeWidth="0.95" filter={`url(#${uid}-emboss)`} />
          <circle cx="47.8" cy="47.6" r="2.6" fill="#ffffff" opacity="0.55" />
        </g>
      );
    }

    case 'case_5': {
      // Крупный фестончатый золочёный медальон с 12-ребристым куполом-солнцем
      return (
        <g filter={`url(#${uid}-drop)`}>
          <path d={scallopedPath(50, 50, 20, 47, 42.5, 0.55)} fill={gilt} stroke="#634510" strokeWidth="1.1" />
          <circle cx="50" cy="50" r="39.5" fill="none" stroke="#61420f" strokeWidth="0.9" />
          <circle cx="50" cy="50" r="34" fill="none" stroke="#5e400e" strokeWidth="0.7" strokeDasharray="3.5 1.8" />
          {[45, 135, 225, 315].map((deg) => {
            const [x, y] = polar(50, 50, 33, deg);
            return <circle key={deg} cx={x} cy={y} r="2.6" fill={bossGilt} stroke="#5d3f0d" strokeWidth="0.5" />;
          })}
          <circle cx="50" cy="50" r="25.5" fill={bossGilt} stroke="#63430e" strokeWidth="1.1" filter={`url(#${uid}-emboss)`} />
          {Array.from({ length: 12 }).map((_, i) => {
            const deg = i * 30;
            const [x, y] = polar(50, 50, 24.5, deg);
            const [x2, y2] = polar(50, 50, 24.5, deg + 15);
            return (
              <g key={deg}>
                <line x1="50" y1="50" x2={x} y2={y} stroke="#fff6cf" strokeWidth="1.35" opacity="0.7" />
                <line x1="50" y1="50" x2={x2} y2={y2} stroke="#5d3f0e" strokeWidth="1.05" opacity="0.7" />
              </g>
            );
          })}
          <circle cx="50" cy="50" r="5" fill={bossGilt} />
        </g>
      );
    }

    case 'case_6': {
      // Крупный фестончатый ярко-позолоченный орден с ажурной короной-куполом
      return (
        <g filter={`url(#${uid}-drop)`}>
          <path d={scallopedPath(50, 50, 24, 47.5, 43, 0.6)} fill={gilt} stroke="#684a10" strokeWidth="1.1" />
          <circle cx="50" cy="50" r="40.2" fill={sil} stroke="#785614" strokeWidth="1.1" />
          <circle cx="50" cy="50" r="35" fill="none" stroke={niello} strokeWidth="0.75" strokeDasharray="4 2" />
          {[0, 90, 180, 270].map((deg) => {
            const [x, y] = polar(50, 50, 32, deg);
            return <polygon key={deg} points={starPolyPoints(x, y, 4, 4.2, 1.8, 45)} fill={bossGilt} stroke="#5d3f0d" strokeWidth="0.5" />;
          })}
          {/* Прорезной золотой купол */}
          <circle cx="50" cy="50" r="22.5" fill={bossGilt} stroke="#5e400c" strokeWidth="1.2" filter={`url(#${uid}-emboss)`} />
          {[0, 60, 120, 180, 240, 300].map((deg) => {
            const [x, y] = polar(50, 50, 13.2, deg);
            return <circle key={deg} cx={x} cy={y} r="3.4" fill="#2c2112" stroke="#f7dc84" strokeWidth="0.8" />;
          })}
          <circle cx="50" cy="50" r="6.2" fill={bossSil} stroke="#614311" strokeWidth="0.8" />
        </g>
      );
    }

    // ---- РЯД 2 (остальные 3 знака: №8, №10, №11) ----
    case 'case_8': {
      // Левая большая 8-лепестковая серебряная прорезная звезда Мудира
      return (
        <g filter={`url(#${uid}-drop)`}>
          <path d={scallopedPath(50, 50, 8, 47.5, 38.5, 0.55)} fill={sil} stroke="#575045" strokeWidth="1.2" />
          {/* 8 прорезных арочных проёмов по внешнему венцу */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <path key={deg} d={almondPetalPath(50, 50, deg, 31.5, 42.5, 14)} fill={hole} stroke={niello} strokeWidth="0.85" />
          ))}
          {/* 6 внутренних серебряных лепестков-картушей */}
          {[0, 60, 120, 180, 240, 300].map((deg) => (
            <path key={deg} d={teardropLobePath(50, 50, deg, 11, 32, 23)} fill={sil} stroke={niello} strokeWidth="1.0" />
          ))}
          {/* Центральный выпуклый филигранный умбон */}
          <circle cx="50" cy="50" r="14.5" fill={bossSil} stroke={niello} strokeWidth="1.1" filter={`url(#${uid}-emboss)`} />
          <polygon points={starPolyPoints(50, 50, 8, 12.5, 7, 0)} fill="none" stroke={niello} strokeWidth="0.85" />
          <circle cx="50" cy="50" r="4.5" fill={bossSil} stroke={niello} strokeWidth="0.7" />
        </g>
      );
    }

    case 'case_10': {
      // Правая большая 8-лепестковая звезда с 4 крестообразными арабскими картушами
      return (
        <g filter={`url(#${uid}-drop)`}>
          <path d={scallopedPath(50, 50, 8, 47.5, 38.2, 0.55)} fill={sil} stroke="#575045" strokeWidth="1.2" />
          {/* Прорезные окна в диагональных лепестках */}
          {[45, 135, 225, 315].map((deg) => (
            <path key={deg} d={almondPetalPath(50, 50, deg, 27, 41.5, 15)} fill={hole} stroke={niello} strokeWidth="0.9" />
          ))}
          {/* 4 крупных прямоугольно-арочных картуша по осям */}
          {[0, 90, 180, 270].map((deg) => (
            <g key={deg} transform={`rotate(${deg} 50 50)`}>
              <rect x="37" y="13" width="26" height="23" rx="6" fill={silLin} stroke={niello} strokeWidth="1.05" />
              <line x1="41" y1="21" x2="59" y2="21" stroke={niello} strokeWidth="0.8" opacity="0.75" />
              <line x1="41" y1="27" x2="59" y2="27" stroke={niello} strokeWidth="0.8" opacity="0.75" />
            </g>
          ))}
          {/* Центральный круглый умбон с крестовой розеткой */}
          <circle cx="50" cy="50" r="14.5" fill={bossSil} stroke={niello} strokeWidth="1.15" filter={`url(#${uid}-emboss)`} />
          {[0, 90, 180, 270].map((deg) => (
            <path key={deg} d={almondPetalPath(50, 50, deg, 2, 11.5, 22)} fill="none" stroke={niello} strokeWidth="0.95" />
          ))}
          <circle cx="50" cy="50" r="3" fill={niello} opacity="0.75" />
        </g>
      );
    }

    case 'case_11': {
      // Выпуклая прорезная 6-лепестковая серебряная розетка (Ряд 2, крайний справа)
      return (
        <g filter={`url(#${uid}-drop)`}>
          <circle cx="50" cy="50" r="44.5" fill={sil} stroke="#5d5447" strokeWidth="1.2" />
          <circle cx="50" cy="50" r="40.5" fill="none" stroke={niello} strokeWidth="0.85" />
          <g transform="translate(0,-4)">
            {[0, 60, 120, 180, 240, 300].map((deg) => (
              <path key={deg} d={almondPetalPath(50, 46, deg, 10, 31, 17)} fill={hole} stroke={niello} strokeWidth="0.95" />
            ))}
            <circle cx="50" cy="46" r="9.2" fill={bossSil} stroke={niello} strokeWidth="0.9" />
          </g>
          <path d="M 21,76 Q 50,90 79,76" fill="none" stroke={niello} strokeWidth="1.4" strokeDasharray="3.5 1.8" opacity="0.78" />
        </g>
      );
    }

    // ---- РЯД 3 (остальные 6 знаков: №12, 13, 14, 17, 18, 19) ----
    case 'case_12': {
      // Прорезная 5-лепестковая серебряная розетка (Ряд 3, №1)
      return (
        <g filter={`url(#${uid}-drop)`}>
          <circle cx="50" cy="50" r="44.5" fill={sil} stroke="#5d5447" strokeWidth="1.2" />
          <circle cx="50" cy="50" r="40.5" fill="none" stroke={niello} strokeWidth="0.8" />
          <g transform="translate(0,-4)">
            {[0, 72, 144, 216, 288].map((deg) => (
              <path key={deg} d={almondPetalPath(50, 47, deg, 8, 30, 19)} fill={hole} stroke={niello} strokeWidth="0.95" />
            ))}
            <circle cx="50" cy="47" r="7.5" fill={bossSil} stroke={niello} strokeWidth="0.85" />
          </g>
          <path d="M 22,78 Q 50,89 78,78" fill="none" stroke={niello} strokeWidth="1.3" strokeDasharray="3 1.5" opacity="0.75" />
        </g>
      );
    }

    case 'case_13': {
      // Выпуклый круглый знак со звёздчатым центром и густой вязью (Ряд 3, №2)
      return (
        <g filter={`url(#${uid}-drop)`}>
          <circle cx="50" cy="50" r="44.5" fill={sil} stroke="#5d5447" strokeWidth="1.2" />
          <circle cx="50" cy="50" r="39" fill="none" stroke={niello} strokeWidth="1.05" strokeDasharray="4 2.2" />
          <circle cx="50" cy="50" r="27" fill="none" stroke={niello} strokeWidth="0.9" strokeDasharray="3 1.8" />
          <polygon points={starPolyPoints(50, 50, 5, 16, 7.5, 0)} fill={bossSil} stroke={niello} strokeWidth="0.95" />
          <circle cx="50" cy="50" r="4.5" fill={bossSil} />
        </g>
      );
    }

    case 'case_14': {
      // Выпуклый серебряный знак с двумя кольцами густой арабской вязи (Ряд 3, №3)
      return (
        <g filter={`url(#${uid}-drop)`}>
          <circle cx="50" cy="50" r="44.5" fill={sil} stroke="#5d5447" strokeWidth="1.2" />
          <circle cx="50" cy="50" r="40" fill="none" stroke={niello} strokeWidth="0.85" />
          <circle cx="50" cy="50" r="33" fill="none" stroke={niello} strokeWidth="1.6" strokeDasharray="2.5 1.8" opacity="0.78" />
          <circle cx="50" cy="50" r="23" fill="none" stroke={niello} strokeWidth="0.85" />
          <circle cx="50" cy="50" r="16" fill="none" stroke={niello} strokeWidth="1.35" strokeDasharray="2.2 1.6" opacity="0.78" />
          <circle cx="50" cy="50" r="7.5" fill={bossSil} stroke={niello} strokeWidth="0.9" />
        </g>
      );
    }

    case 'case_17': {
      // Круглый знак с коническим умбоном и 6 тёмными лучами-звёздочками (Ряд 3, №6)
      return (
        <g filter={`url(#${uid}-drop)`}>
          <circle cx="50" cy="50" r="44.5" fill={sil} stroke="#5d5447" strokeWidth="1.2" />
          <circle cx="50" cy="50" r="40.5" fill="none" stroke={niello} strokeWidth="0.85" />
          {[0, 60, 120, 180, 240, 300].map((deg) => {
            const [x1, y1] = polar(50, 50, 12, deg);
            const [x2, y2] = polar(50, 50, 36, deg);
            const [sx, sy] = polar(50, 50, 28, deg + 30);
            return (
              <g key={deg}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={niello} strokeWidth="1.15" opacity="0.82" />
                <polygon points={starPolyPoints(sx, sy, 5, 3.6, 1.4, 0)} fill={niello} opacity="0.78" />
              </g>
            );
          })}
          <circle cx="50" cy="50" r="11.5" fill={bossSil} stroke={niello} strokeWidth="1.05" filter={`url(#${uid}-emboss)`} />
          <circle cx="50" cy="50" r="3.4" fill={niello} opacity="0.7" />
        </g>
      );
    }

    case 'case_18': {
      // Круглый серебряно-золотистый медальон с умбоном и двойным ободом вязи (Ряд 3, №7)
      return (
        <g filter={`url(#${uid}-drop)`}>
          <circle cx="50" cy="50" r="44.5" fill={bronze} stroke="#5d4c33" strokeWidth="1.2" />
          <circle cx="50" cy="50" r="40" fill={sil} stroke={niello} strokeWidth="0.8" />
          <circle cx="50" cy="50" r="32" fill="none" stroke={niello} strokeWidth="1.5" strokeDasharray="3 1.7" opacity="0.8" />
          <circle cx="50" cy="50" r="22" fill="none" stroke={niello} strokeWidth="0.85" />
          <circle cx="50" cy="50" r="10.5" fill={bossSil} stroke={niello} strokeWidth="0.95" />
          <circle cx="50" cy="50" r="3.5" fill="#fff8e0" opacity="0.7" />
        </g>
      );
    }

    case 'case_19': {
      // Прорезной 5-лепестковый веерный медальон с золотистым отливом (Ряд 3, крайний справа)
      return (
        <g filter={`url(#${uid}-drop)`}>
          <circle cx="50" cy="50" r="44.5" fill={bronze} stroke="#5e4b2c" strokeWidth="1.2" />
          <circle cx="50" cy="50" r="40.5" fill="none" stroke={niello} strokeWidth="0.85" />
          <g transform="translate(2,-4)">
            {[0, 72, 144, 216, 288].map((deg) => (
              <path key={deg} d={almondPetalPath(50, 46, deg, 6.5, 28, 22)} fill={hole} stroke={niello} strokeWidth="0.9" />
            ))}
            <circle cx="50" cy="46" r="5.5" fill={bronze} stroke={niello} strokeWidth="0.8" />
          </g>
          <path d="M 18,74 Q 48,91 80,74" fill="none" stroke={niello} strokeWidth="1.5" strokeDasharray="3.8 1.8" opacity="0.82" />
        </g>
      );
    }

    // ---- РЯД 4 (№20–25): 6 КРУПНЫХ ЧЕКАННЫХ КРУГЛЫХ МЕДАЛЕЙ С ПЕЧАТЬЮ ИМАМА ШАМИЛЯ ----
    case 'case_20':
    case 'case_21':
    case 'case_22':
    case 'case_23':
    case 'case_24':
    case 'case_25': {
      const idx = Number(variant.split('_')[1]) - 20; // 0..5 (от яркого серебра к античной позолоте)
      const discFill = idx <= 2 ? sil : idx === 3 ? gilt : bronze;
      const sealRot = (idx - 2.5) * 4;
      return (
        <g filter={`url(#${uid}-drop)`}>
          <defs>
            <path id={`${uid}-r4-top-${idx}`} d="M 15,50 A 35,35 0 1,1 85,50" />
            <path id={`${uid}-r4-bot-${idx}`} d="M 15,50 A 35,35 0 1,0 85,50" />
          </defs>
          <circle cx="50" cy="50" r="46" fill={discFill} stroke="#5e523f" strokeWidth="1.2" />
          <circle cx="50" cy="50" r="42.2" fill="none" stroke={niello} strokeWidth="0.95" strokeOpacity="0.82" />
          <circle cx="50" cy="50" r="30.5" fill="none" stroke={niello} strokeWidth="0.9" strokeOpacity="0.82" />
          <circle cx="50" cy="50" r="28.2" fill="none" stroke="#fff8e8" strokeWidth="0.55" strokeOpacity="0.55" />

          {/* Кольцевая арабская надпись вдоль широкого обода */}
          <text fontSize="5.4" fill={niello} fontFamily="'Times New Roman', Georgia, serif" fontWeight="700" opacity="0.86">
            <textPath href={`#${uid}-r4-top-${idx}`} startOffset="50%" textAnchor="middle">
              هذا نيشان الشجاعة من أمير المؤمنين
            </textPath>
          </text>
          <text fontSize="5.4" fill={niello} fontFamily="'Times New Roman', Georgia, serif" fontWeight="700" opacity="0.86">
            <textPath href={`#${uid}-r4-bot-${idx}`} startOffset="50%" textAnchor="middle">
              الإمام شامل سلطان داغستان وشيشان
            </textPath>
          </text>

          {/* Центральный картуш-печать Имама Шамиля */}
          <g transform={`rotate(${sealRot} 50 50)`}>
            <path d={scallopedPath(50, 50, 12, 20.5, 18.2, 0.6)} fill="none" stroke={niello} strokeWidth="0.9" opacity="0.82" />
            <circle cx="50" cy="50" r="16.2" fill="none" stroke={niello} strokeWidth="0.65" opacity="0.65" />
            <text
              x="50"
              y="46.5"
              textAnchor="middle"
              fontSize="7.4"
              fontFamily="'Times New Roman', Georgia, serif"
              fontWeight="700"
              fill={niello}
              opacity="0.9"
            >
              الإمام
            </text>
            <text
              x="50"
              y="57.2"
              textAnchor="middle"
              fontSize="8.6"
              fontFamily="'Times New Roman', Georgia, serif"
              fontWeight="700"
              fill={niello}
              opacity="0.92"
            >
              شامل
            </text>
          </g>
        </g>
      );
    }

    // ---- ДИСЦИПЛИНАРНЫЙ ЗНАК НИЗАМА: ВОЙЛОЧНЫЙ ЛОСКУТ ПОЗОРА ТРУСУ ----
    case 'felt_shame_badge': {
      return (
        <g filter={`url(#${uid}-drop)`}>
          <path
            d="M 16,22 L 82,19 L 86,78 L 19,83 Z"
            fill="#4a3b31"
            stroke="#2a201a"
            strokeWidth="2.2"
          />
          <path
            d="M 21,27 L 77,25 L 80,73 L 24,77 Z"
            fill="none"
            stroke="#9a8368"
            strokeWidth="1.4"
            strokeDasharray="4 3"
            opacity="0.85"
          />
          {/* Грубые крестовые стежки суровой нитью по углам войлочного лоскута */}
          <path d="M 18,22 L 28,31 M 28,22 L 18,31" stroke="#d9c6a5" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M 72,20 L 82,29 M 82,20 L 72,29" stroke="#d9c6a5" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M 20,70 L 30,79 M 30,70 L 20,79" stroke="#d9c6a5" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M 73,67 L 83,76 M 83,67 L 73,76" stroke="#d9c6a5" strokeWidth="1.8" strokeLinecap="round" />
          <text
            x="50"
            y="53"
            textAnchor="middle"
            fontSize="10"
            fontFamily="Georgia, serif"
            fontWeight="700"
            fill="#d9c6a5"
            opacity="0.85"
          >
            НИЗАМ
          </text>
        </g>
      );
    }

    default:
      return renderOrderArtwork('order_lion', uid);
  }
}

// ============================================================================
// КОМПОНЕНТ ОДНОГО ОРДЕНА (чистый HTML + inline SVG, без растровых фото)
// ============================================================================
export function ShamilOrderMedallion({
  orderId = 'order_lion',
  size = 56,
  showVelvet = false,
  className = '',
  title = ''
}) {
  const rawId = useId();
  const uid = `ord-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`;

  return (
    <span
      title={title || undefined}
      className={`inline-flex items-center justify-center shrink-0 select-none ${
        showVelvet
          ? 'rounded-full bg-gradient-to-br from-[#741a23] via-[#531118] to-[#34090d] border-2 border-amber-400/75 shadow-[inset_0_2px_8px_rgba(0,0,0,0.65),0_4px_12px_rgba(0,0,0,0.55)] p-1'
          : ''
      } ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full overflow-visible"
        role="img"
        aria-label={title || orderId}
      >
        <KubachiMetalDefs uid={uid} />
        {renderOrderArtwork(orderId, uid)}
      </svg>
    </span>
  );
}

// Каталог 25 подлинных знаков в 4 рядах музейной витрины (Нац. музей РД им. А. Тахо-Годи)
const MUSEUM_CASE_ROWS = [
  {
    rowNum: 1,
    rowTitleRu: '1-й ряд — Выпуклые знаки с умбонами и позолотой',
    rowTitleEn: 'Row 1 — Domed Boss Medallions & Gilding',
    items: [
      { id: 'case_1', num: 1, nameRu: 'Фестончатый знак с ажурным куполом', nameEn: 'Scalloped Filigree-Dome Order', metalRu: 'Серебро, позолота, ажурная резьба', metalEn: 'Silver, gilding, pierced filigree' },
      { id: 'case_2', num: 2, nameRu: 'Знак со звёздчатым золочёным умбоном', nameEn: 'Gilt Star-Boss Medallion', metalRu: 'Серебро, позолота, чеканка', metalEn: 'Silver, gilding, repoussé' },
      { id: 'case_3', num: 3, nameRu: 'Круглый знак с чернёной розеткой', nameEn: 'Niello Rosette Silver Order', metalRu: 'Серебро, чернь, гравировка', metalEn: 'Silver, niello, engraving' },
      { id: 'case_4', num: 4, nameRu: 'Прорезной 8-лучевой знак отваги', nameEn: '8-Petal Pierced Valor Disc', metalRu: 'Серебро, прорезная чеканка', metalEn: 'Silver, pierced chasing' },
      { id: 'case_5', num: 5, nameRu: 'Позолоченный орден с ребристым куполом', nameEn: 'Fluted-Sunburst Gilt Order', metalRu: 'Серебро, медь, ртутная позолота', metalEn: 'Silver, copper, mercury gilding' },
      { id: 'case_6', num: 6, nameRu: 'Высший золочёный знак с короной-куполом', nameEn: 'Gilt Openwork-Crown Order', metalRu: 'Серебро, густая позолота, скань', metalEn: 'Silver, heavy gilding, filigree' }
    ]
  },
  {
    rowNum: 2,
    rowTitleRu: '2-й ряд — Большие звёзды мудиров и знак с шашкой',
    rowTitleEn: 'Row 2 — Grand Mudir Stars & Shashka Medallion',
    items: [
      { id: 'order_sword', num: 7, playableId: 'order_sword', nameRu: 'Медальон с розеткой и шашкой', nameEn: 'Medallion with Rosette & Shashka', metalRu: 'Серебро, чернь, гравированная шашка', metalEn: 'Silver, niello, engraved shashka', scale: 0.96 },
      { id: 'case_8', num: 8, nameRu: 'Большая 8-лепестковая серебряная звезда мудира', nameEn: 'Grand 8-Lobed Silver Mudir Star', metalRu: 'Серебро, прорезные арки, чернь', metalEn: 'Silver, pierced arches, niello', scale: 1.24 },
      { id: 'order_mudir', num: 9, playableId: 'order_mudir', nameRu: 'Большая фестончатая звезда Мудира', nameEn: 'Grand Scalloped Star of the Mudir', metalRu: 'Серебро, позолота, 14 шариков-умбонов', metalEn: 'Silver, gilding, 14 silver pearl bosses', scale: 1.26 },
      { id: 'case_10', num: 10, nameRu: 'Звезда мудира с крестовыми арабскими картушами', nameEn: 'Mudir Star with 4 Arabic Cartouches', metalRu: 'Серебро, чернь, арабская вязь', metalEn: 'Silver, niello, Arabic calligraphy', scale: 1.24 },
      { id: 'case_11', num: 11, nameRu: 'Выпуклая 6-лепестковая прорезная розетка', nameEn: 'Domed 6-Petal Pierced Rosette', metalRu: 'Серебро, прорезная резьба, умбон', metalEn: 'Silver, pierced chasing, central boss', scale: 0.94 }
    ]
  },
  {
    rowNum: 3,
    rowTitleRu: '3-й ряд — Знаки храбрости и полумесяц «Хиляль»',
    rowTitleEn: 'Row 3 — Valor Badges & Silver Crescent “Hilal”',
    items: [
      { id: 'case_12', num: 12, nameRu: 'Прорезной 5-лепестковый знак смельчака', nameEn: '5-Petal Pierced Bravery Badge', metalRu: 'Серебро, прорезная резьба', metalEn: 'Silver, pierced work' },
      { id: 'case_13', num: 13, nameRu: 'Выпуклый знак со звездой и вязью', nameEn: 'Star-Boss Calligraphic Medal', metalRu: 'Серебро, чернь, ковка', metalEn: 'Silver, niello, forged' },
      { id: 'case_14', num: 14, nameRu: 'Двухкольцевой знак с арабским девизом', nameEn: 'Double-Ring Arabic Motto Medal', metalRu: 'Серебро, гравировка, умбон', metalEn: 'Silver, engraving, boss' },
      { id: 'order_crescent', num: 15, playableId: 'order_crescent', nameRu: 'Серебряный полумесяц «Хиляль»', nameEn: 'Silver Crescent “Hilal”', metalRu: 'Кованое серебро, арабская гравировка', metalEn: 'Forged silver, Arabic engraving' },
      { id: 'order_lion', num: 16, playableId: 'order_lion', nameRu: 'Круглый прорезной знак храбрости', nameEn: 'Pierced Silver Order of Valor', metalRu: 'Серебро, 5 сердцевидных прорезей, сабля', metalEn: 'Silver, 5 heart-cutouts, saber' },
      { id: 'case_17', num: 17, nameRu: 'Лучевой знак храбрости с коническим умбоном', nameEn: 'Six-Ray Star-Punched Valor Disc', metalRu: 'Серебро, чернь, штамп', metalEn: 'Silver, niello, chased' },
      { id: 'case_18', num: 18, nameRu: 'Серебряно-золотистый медальон наиба', nameEn: 'Silver-Gilt Naib Medallion', metalRu: 'Серебро, лёгкая позолота, чернь', metalEn: 'Silver, light gilding, niello' },
      { id: 'case_19', num: 19, nameRu: 'Прорезной 5-лепестковый веерный знак', nameEn: '5-Fan Pierced Valor Badge', metalRu: 'Серебро, бронзовая патина, гравировка', metalEn: 'Silver, bronze patina, engraving' }
    ]
  },
  {
    rowNum: 4,
    rowTitleRu: '4-й ряд — Чеканные диски-медали с печатью Имама Шамиля',
    rowTitleEn: 'Row 4 — Chased Silver & Gilt Imamate Seal Discs',
    items: [
      { id: 'case_20', num: 20, nameRu: 'Большой серебряный диск с печатью Имама (I)', nameEn: 'Large Silver Imamate Seal Disc (I)', metalRu: 'Серебро, круговая вязь и тугра', metalEn: 'Silver, ring script & seal' },
      { id: 'case_21', num: 21, nameRu: 'Большой серебряный диск с печатью Имама (II)', nameEn: 'Large Silver Imamate Seal Disc (II)', metalRu: 'Серебро, глубокая гравировка', metalEn: 'Silver, deep engraving' },
      { id: 'case_22', num: 22, nameRu: 'Чеканная медаль казны Байт аль-маль (III)', nameEn: 'Bayt al-Mal Chased Medal (III)', metalRu: 'Серебро, двойной кант, тугра', metalEn: 'Silver, double rim, tugra' },
      { id: 'case_23', num: 23, nameRu: 'Позолоченная медаль Имамата (IV)', nameEn: 'Gilded Imamate Medal (IV)', metalRu: 'Серебро, позолота, арабский девиз', metalEn: 'Silver, gilding, Arabic motto' },
      { id: 'case_24', num: 24, nameRu: 'Медно-золочёная наградная бляха (V)', nameEn: 'Copper-Gilt Decoration Plate (V)', metalRu: 'Медь, позолота, чеканка', metalEn: 'Copper, gilding, chasing' },
      { id: 'case_25', num: 25, nameRu: 'Почётный знак старшего наиба (VI)', nameEn: 'Senior Naib Honour Plate (VI)', metalRu: 'Медь, патина, печать Шамиля', metalEn: 'Copper, patina, Shamil seal' }
    ]
  }
];

// ============================================================================
// ПОЛНАЯ ИНТЕРАКТИВНАЯ HTML/SVG-ВИТРИНА 25 ОРДЕНОВ НА БОРДОВОМ БАРХАТЕ
// ============================================================================
export function ShamilOrdersMuseumShowcase({
  compact = false,
  interactive = true,
  t = (ru) => ru,
  className = '',
  onAwardOrder = null,
  recipientName = '',
  availableSilver = 999,
  awardedOrderIds = []
}) {
  const [activeItem, setActiveItem] = useState(MUSEUM_CASE_ROWS[1].items[2]); // По умолчанию — Звезда Мудира (центр)
  const activeCatalogItem = activeItem ? getOrderCatalogItemById(activeItem.id) : null;
  const awardedSet = new Set(awardedOrderIds || []);

  return (
    <div
      className={`relative w-full select-none overflow-hidden rounded-xl border border-amber-500/40 shadow-[inset_0_0_40px_rgba(0,0,0,0.65)] ${className}`}
      style={{
        background:
          'radial-gradient(ellipse at 50% 24%, #821d27 0%, #63151d 44%, #450d13 82%, #2c070b 100%)'
      }}
    >
      {/* Тончайшая текстура музейного бархата + лёгкий диагональный блик стекла витрины */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'repeating-linear-gradient(135deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 5px)'
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(118deg, rgba(255,244,214,0.11) 0%, rgba(255,255,255,0.02) 32%, transparent 56%, rgba(0,0,0,0.28) 100%)'
        }}
      />

      {/* 4 исторических ряда экспозиции (6 + 5 + 8 + 6 = 25 орденов) */}
      <div className={`relative z-10 flex flex-col justify-between ${compact ? 'gap-1.5 px-2.5 py-2' : 'gap-3 px-4 py-4 sm:px-6 sm:py-5'}`}>
        {MUSEUM_CASE_ROWS.map((row) => (
          <div
            key={row.rowNum}
            className="flex items-center justify-around gap-1 sm:gap-2"
          >
            {row.items.map((item) => {
              const isSelected = interactive && activeItem?.id === item.id;
              const isHeld = awardedSet.has(item.id);
              const baseSize = compact
                ? row.rowNum === 2
                  ? 34
                  : row.rowNum === 3
                    ? 24
                    : 28
                : row.rowNum === 2
                  ? 74
                  : row.rowNum === 3
                    ? 52
                    : 60;
              const finalSize = Math.round(baseSize * (item.scale || 1));

              if (!interactive) {
                return (
                  <div
                    key={item.id}
                    className="relative flex items-center justify-center"
                    style={{ width: finalSize, height: finalSize }}
                  >
                    <ShamilOrderMedallion
                      orderId={item.id}
                      size={finalSize}
                      title={t(item.nameRu, item.nameEn)}
                    />
                  </div>
                );
              }

              return (
                <button
                  key={item.id}
                  type="button"
                  onMouseEnter={() => setActiveItem(item)}
                  onFocus={() => setActiveItem(item)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveItem(item);
                  }}
                  title={`№${item.num}. ${t(item.nameRu, item.nameEn)}`}
                  className={`group relative flex items-center justify-center rounded-full transition duration-200 cursor-pointer focus:outline-none ${
                    isSelected
                      ? 'scale-110 z-20 ring-2 ring-amber-300/90 shadow-[0_0_20px_rgba(251,191,36,0.55)]'
                      : 'hover:scale-108 hover:z-10'
                  }`}
                  style={{ width: finalSize, height: finalSize }}
                >
                  <ShamilOrderMedallion
                    orderId={item.id}
                    size={finalSize}
                    title={t(item.nameRu, item.nameEn)}
                  />
                  {!compact && (
                    <span
                      className={`pointer-events-none absolute -bottom-1 right-0 w-2.5 h-2.5 rounded-full border border-stone-950 shadow ${
                        isHeld ? 'bg-emerald-400' : 'bg-amber-400/90'
                      }`}
                      title={
                        isHeld
                          ? t('Уже пожалован этому наибу', 'Already bestowed on this Naib')
                          : t('Доступен к пожалованию в Диван-хане', 'Available to bestow in Divan-Khana')
                      }
                    />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Подлинная мини-бирка музейной витрины [2] в правом нижнем углу бархатного поля */}
      <span
        className={`pointer-events-none absolute right-2.5 z-10 px-1.5 py-0.5 rounded-[2px] bg-[#ece4d2] text-[#292018] font-mono text-[9px] font-bold shadow ${
          interactive && !compact ? 'bottom-16' : 'bottom-2'
        }`}
      >
        2
      </span>

      {/* Интерактивная латунная табличка выбранного экспоната с 1-клик пожалованием (в полном режиме) */}
      {interactive && !compact && activeItem && (
        <div className="relative z-10 border-t border-amber-500/35 bg-gradient-to-r from-[#18100c]/95 via-[#211610]/95 to-[#18100c]/95 px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2.5 text-[11px]">
          <div className="flex items-center gap-2.5 min-w-0">
            <ShamilOrderMedallion orderId={activeItem.id} size={34} showVelvet />
            <div className="min-w-0">
              <div className="font-serif font-bold text-amber-200 truncate">
                №{activeItem.num} • {t(activeItem.nameRu, activeItem.nameEn)}
              </div>
              <div className="font-mono text-[10px] text-emerald-300 truncate">
                {activeCatalogItem ? t(activeCatalogItem.perkRu, activeCatalogItem.perkEn) : t(activeItem.metalRu, activeItem.metalEn)}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {activeCatalogItem && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/55 text-amber-200 font-mono text-[10px] font-bold">
                {t(`${activeCatalogItem.silverCost}₽`, `${activeCatalogItem.silverCost} rub.`)}
              </span>
            )}
            {onAwardOrder && activeCatalogItem ? (
              <button
                type="button"
                disabled={availableSilver < activeCatalogItem.silverCost}
                onClick={(e) => {
                  e.stopPropagation();
                  onAwardOrder(activeCatalogItem);
                }}
                className={`px-3 py-1 rounded-lg font-serif font-bold text-[11px] transition ${
                  availableSilver < activeCatalogItem.silverCost
                    ? 'bg-stone-800 text-stone-500 border border-stone-700 cursor-not-allowed'
                    : 'bg-gradient-to-b from-amber-400 to-amber-600 hover:brightness-110 text-stone-950 shadow cursor-pointer'
                }`}
              >
                {t(
                  `Жаловать${recipientName ? ` (${recipientName})` : ''}`,
                  `Bestow${recipientName ? ` (${recipientName})` : ''}`
                )}
              </button>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/55 text-amber-200 font-mono text-[9.5px] font-bold">
                ★ {t('Награда Диван-ханы (1 из 25)', 'Divan-Khana Award (1 of 25)')}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// КОМПАКТНАЯ ГЕРАЛЬДИЧЕСКАЯ ПЛАНКА 4 ОРДЕНОВ ШАМИЛЯ (ДЛЯ ГЛАВНОЙ СТРАНИЦЫ)
// ============================================================================
const HERO_FOUR_ORDERS = [
  {
    id: 'order_lion',
    ru: 'Прорезной знак храбрости',
    en: 'Pierced Order of Valor',
    mottoRu: '«Кто думает о последствиях — не храбрец»',
    mottoEn: '“He who ponders consequences is no brave man”'
  },
  {
    id: 'order_crescent',
    ru: 'Полумесяц «Хиляль»',
    en: 'Silver Crescent “Hilal”',
    mottoRu: '«Помощь от Аллаха и близкая победа»',
    mottoEn: '“Victory from Allah & imminent triumph”'
  },
  {
    id: 'order_sword',
    ru: 'Медальон с шашкой',
    en: 'Rosette & Shashka Medal',
    mottoRu: '«Слава не отступающему в бою»',
    mottoEn: '“Glory to the steadfast warrior”'
  },
  {
    id: 'order_mudir',
    ru: 'Звезда Мудира',
    en: 'Grand Star of the Mudir',
    mottoRu: '«Повиновение Имаму — залог победы»',
    mottoEn: '“Obedience to the Imam — pledge of victory”'
  }
];

export function ShamilOrdersHeraldicStrip({ t = (ru) => ru, className = '' }) {
  const [hovered, setHovered] = useState(null);
  const current = HERO_FOUR_ORDERS.find((o) => o.id === hovered);

  return (
    <div
      className={`rounded-xl border border-amber-500/40 bg-gradient-to-r from-[#3a0d12]/88 via-[#26110e]/92 to-[#17110b]/92 px-3 py-2.5 shadow-xl backdrop-blur-sm ${className}`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[9.5px] font-serif uppercase tracking-[0.14em] text-amber-300/95 font-bold whitespace-nowrap shrink-0">
          {t('Ордена Имамата • XIX в.', 'Orders of Shamil • 19th c.')}
        </span>
        <span className="text-[9.5px] font-mono text-amber-200/80 truncate text-right">
          {current
            ? t(current.mottoRu, current.mottoEn)
            : t('Серебро, чернь и позолота', 'Silver, niello & antique gilt')}
        </span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {HERO_FOUR_ORDERS.map((ord) => {
          const isHot = hovered === ord.id;
          return (
            <div
              key={ord.id}
              onMouseEnter={() => setHovered(ord.id)}
              onMouseLeave={() => setHovered(null)}
              className={`group flex flex-col items-center text-center rounded-lg px-1.5 py-1.5 border transition ${
                isHot
                  ? 'bg-[#5a141c]/80 border-amber-400/80 shadow-[0_0_14px_rgba(251,191,36,0.28)]'
                  : 'bg-[#461016]/55 border-amber-500/25 hover:border-amber-400/60'
              }`}
            >
              <ShamilOrderMedallion
                orderId={ord.id}
                size={46}
                title={t(ord.ru, ord.en)}
                className="transition-transform duration-200 group-hover:scale-110"
              />
              <span className="mt-1 text-[9.5px] font-serif font-bold text-amber-100 leading-tight line-clamp-2">
                {t(ord.ru, ord.en)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
