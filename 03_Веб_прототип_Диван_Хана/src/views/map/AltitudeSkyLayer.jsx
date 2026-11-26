// Высотный фотореалистичный слой неба над 3D-столом Кавказа (100% GPU-ускоренный, 0 CPU SVG-фильтров):
// - Анатомически достоверные парящие кавказские беркуты (Aquila chrysaetos) с пальчатыми маховыми перьями,
//   веерным хвостом, золотистым загривком, живым циклом взмахов/планирования и круговым парением в термиках;
// - Многоярусные орографические кучевые и грозовые облака (Cumulonimbus) с освещёнными солнцем куполами,
//   объёмными теневыми складками, плавным дрейфом и мягкими радиальными тенями на хребтах (без тяжёлых feTurbulence);
// - Многоячеечная горная гроза с внутриоблачными зарницами, ветвистыми ступенчатыми разрядами молний и вспышками ударов в пики;
// - Четырёхслойный косой горный ливень на кэшируемых тайлах с матричным GPU-сдвигом (0 перерисовок паттернов на кадр);
// - Трёхслойная снежная метель и позёмка на перевалах.
import { memo } from 'react';

// Всплески и круги водяной пыли на мокрых скальных уступах и в речных долинах (анимируются в 2 фазах через GPU transform)
const RAIN_SPLASH_GROUP_A = [
  [148, 138],
  [318, 162],
  [496, 182],
  [366, 294],
  [162, 356]
];

const RAIN_SPLASH_GROUP_B = [
  [242, 184],
  [412, 208],
  [205, 276],
  [528, 286],
  [445, 368]
];

// Координаты снежной крупки и шестилучевых кристаллов внутри бесшовных кэшируемых тайлов метели
const SNOW_TILE_DOTS = [
  [14, 18, 1.2], [46, 11, 1.5], [82, 24, 1.1], [108, 14, 1.4],
  [26, 48, 1.4], [64, 42, 1.1], [96, 56, 1.5], [12, 82, 1.3],
  [48, 76, 1.6], [78, 88, 1.2], [110, 79, 1.3], [32, 108, 1.4],
  [72, 112, 1.1], [104, 106, 1.5]
];

const SNOW_TILE_CRYSTALS = [
  [24, 26, 2.7], [78, 18, 2.3], [134, 34, 2.9],
  [48, 74, 2.5], [106, 68, 3.0], [148, 88, 2.4],
  [22, 126, 2.8], [84, 122, 2.4], [132, 142, 2.7]
];

const SNOW_TILE_BOKEH = [
  [36, 42, 6.2], [128, 28, 5.4], [192, 76, 6.8],
  [74, 134, 5.8], [168, 158, 6.5], [32, 194, 5.2]
];

// Анатомический силуэт кавказского беркута (Aquila chrysaetos), ориентированный головой вдоль +X для точного следования по касательной rotate="auto":
// хищная голова с крючковатым клювом, вынесенный вперёд кистевой сгиб, 6 расставленных пальчатых первостепенных маховых перьев,
// волнистая задняя кромка второстепенных маховых и широкий веерный хвост с округлой кромкой.
const EAGLE_SILHOUETTE_PATH = [
  'M 7.6,0',
  'C 7.1,-0.62 6.1,-0.98 4.8,-1.02',
  'C 3.9,-1.05 3.2,-1.42 2.7,-2.15',
  'C 3.3,-5.2 3.8,-8.8 2.8,-12.2',
  'L 1.5,-15.4 L 0.9,-13.0',
  'L -0.2,-16.4 L -0.4,-13.5',
  'L -1.7,-16.2 L -1.5,-13.2',
  'L -3.1,-15.3 L -2.6,-12.4',
  'L -4.3,-14.0 L -3.5,-11.3',
  'L -5.0,-12.2 L -3.9,-10.0',
  'C -3.8,-7.6 -3.4,-4.8 -2.8,-2.2',
  'L -8.2,-3.7',
  'C -9.3,-2.0 -9.6,-0.7 -9.6,0',
  'C -9.6,0.7 -9.3,2.0 -8.2,3.7',
  'L -2.8,2.2',
  'C -3.4,4.8 -3.8,7.6 -3.9,10.0',
  'L -5.0,12.2 L -3.5,11.3',
  'L -4.3,14.0 L -2.6,12.4',
  'L -3.1,15.3 L -1.5,13.2',
  'L -1.7,16.2 L -0.4,13.5',
  'L -0.2,16.4 L 0.9,13.0',
  'L 1.5,15.4 L 2.8,12.2',
  'C 3.8,8.8 3.3,5.2 2.7,2.15',
  'C 3.2,1.42 3.9,1.05 4.8,1.02',
  'C 6.1,0.98 7.1,0.62 7.6,0 Z'
].join(' ');

// Индивидуальные координаты перьев для поштучной прорисовки оперения 2D-беркута при любом увеличении карты
const SVG_TAIL_ANGLES = [-24, -18.5, -13, -7.8, -2.6, 2.6, 7.8, 13, 18.5, 24];
const SVG_SECONDARIES_Y = [2.1, 3.3, 4.5, 5.7, 6.9, 8.1, 9.2, 10.3];
const SVG_PRIMARIES = [
  { rx: 1.9, ry: 11.4, tx: 1.6, ty: 15.6, w: 0.55 },
  { rx: 1.5, ry: 11.7, tx: -0.1, ty: 16.6, w: 0.62 },
  { rx: 1.1, ry: 11.8, tx: -1.7, ty: 16.4, w: 0.65 },
  { rx: 0.6, ry: 11.6, tx: -3.1, ty: 15.5, w: 0.65 },
  { rx: 0.1, ry: 11.3, tx: -4.2, ty: 14.2, w: 0.64 },
  { rx: -0.4, ry: 10.9, tx: -4.9, ty: 12.6, w: 0.62 },
  { rx: -0.8, ry: 10.5, tx: -4.8, ty: 11.1, w: 0.6 }
];
const SVG_COVERT_SCALLOPS = [2.4, 3.8, 5.2, 6.6, 8.0, 9.4, 10.7];
const SVG_MANTLE_PLUMES = [
  [-2.3, 0, 1.05], [-1.5, -0.72, 0.95], [-1.5, 0.72, 0.95],
  [-0.6, 0, 1.12], [0.2, -0.82, 1.0], [0.2, 0.82, 1.0],
  [1.0, 0, 1.08], [1.8, -0.7, 0.92], [1.8, 0.7, 0.92], [2.5, 0, 0.95]
];
const SVG_NAPE_HACKLES = [
  [2.9, -0.72, -16], [2.9, 0.72, 16], [3.1, -0.36, -8], [3.1, 0.36, 8], [3.2, 0, 0],
  [3.7, -0.58, -14], [3.7, 0.58, 14], [3.85, -0.24, -5], [3.85, 0.24, 5], [4.35, 0, 0]
];

// Парящий по замкнутой термической спирали/восьмёрке кавказский беркут с детальной поштучной прорисовкой перьев
function SoaringGoldenEagle({
  orbitPath,
  dur = '26s',
  begin = '0s',
  scale = 1,
  flapDur = '8.6s',
  shadowOffsetX = 18,
  shadowOffsetY = 26
}) {
  return (
    <g>
      {/* 1. Мягкая проекционная тень беркута с пальцевыми маховыми перьями на горных склонах */}
      <g transform={`translate(${shadowOffsetX}, ${shadowOffsetY})`} opacity="0.26">
        <g>
          <animateMotion path={orbitPath} dur={dur} begin={begin} repeatCount="indefinite" rotate="auto" />
          <g transform={`scale(${scale * 0.92})`}>
            <path d={EAGLE_SILHOUETTE_PATH} fill="#020617" stroke="#020617" strokeWidth="1.2" strokeOpacity="0.42" strokeLinejoin="round" />
          </g>
        </g>
      </g>

      {/* 2. Живой парящий кавказский беркут с прорисовкой каждого пера, стержня и кроющего яруса */}
      <g>
        <animateMotion path={orbitPath} dur={dur} begin={begin} repeatCount="indefinite" rotate="auto" />
        <g transform={`scale(${scale})`}>
          <g>
            <animateTransform
              attributeName="transform"
              type="scale"
              values="1,1; 0.96,0.62; 1.02,1.05; 0.97,0.68; 1,1; 1.01,0.97; 1,1.02; 1,1"
              keyTimes="0; 0.08; 0.16; 0.24; 0.34; 0.62; 0.84; 1"
              dur={flapDur}
              begin={begin}
              repeatCount="indefinite"
            />

            {/* А. 10 индивидуальных рулевых перьев хвоста с мраморной перевязью, тёмной вершиной и стержнем */}
            <g transform="translate(-2.7, 0)">
              {SVG_TAIL_ANGLES.map((ang, idx) => (
                <g key={idx} transform={`rotate(${ang})`}>
                  <path
                    d="M 0,-0.46 L -6.8,-0.88 C -7.25,-0.42 -7.25,0.42 -6.8,0.88 L 0,0.46 Z"
                    fill="#140d09"
                    stroke="#b89f80"
                    strokeWidth="0.11"
                    strokeOpacity="0.55"
                  />
                  <path
                    d="M -1.1,-0.52 L -4.4,-0.74 C -4.6,-0.32 -4.6,0.32 -4.4,0.74 L -1.1,0.52 Z"
                    fill="#9c8b76"
                    fillOpacity="0.62"
                  />
                  <line x1="-0.2" y1="0" x2="-6.85" y2="0" stroke="#e2d5c1" strokeWidth="0.14" strokeOpacity="0.72" />
                </g>
              ))}
            </g>

            {/* Б. Левое (-Y) и правое (+Y) крылья: второстепенные маховые, 7 пальцевых первостепенных и 3 ряда кроющих */}
            {[-1, 1].map((sgn) => (
              <g key={sgn} transform={`scale(1, ${sgn})`}>
                {/* 8 широких второстепенных маховых перьев с закруглёнными концами и стержнями */}
                {SVG_SECONDARIES_Y.map((sy, idx) => (
                  <g key={`sec-${idx}`}>
                    <path
                      d={`M 0.8,${sy - 0.65} L -3.75,${sy - 0.52} C -4.28,${sy - 0.15} -4.28,${sy + 0.55} -3.72,${sy + 0.78} L 0.8,${sy + 0.68} Z`}
                      fill="#1a110b"
                      stroke="#573d28"
                      strokeWidth="0.12"
                      strokeOpacity="0.65"
                    />
                    <path
                      d={`M 0.2,${sy - 0.42} L -1.95,${sy - 0.36} L -1.95,${sy + 0.48} L 0.2,${sy + 0.42} Z`}
                      fill="#6e5a46"
                      fillOpacity="0.34"
                    />
                    <line x1="0.7" y1={sy + 0.04} x2="-3.95" y2={sy + 0.14} stroke="#d4c5af" strokeWidth="0.13" strokeOpacity="0.68" />
                  </g>
                ))}

                {/* 7 пальцевых первостепенных маховых перьев (P10..P4) с выемкой и упругим стержнем */}
                {SVG_PRIMARIES.map((pf, idx) => (
                  <g key={`pri-${idx}`}>
                    <path
                      d={`M ${pf.rx + pf.w},${pf.ry - 0.35} Q ${(pf.rx + pf.tx) * 0.5 + pf.w * 0.65},${(pf.ry + pf.ty) * 0.5} ${pf.tx},${pf.ty} Q ${(pf.rx + pf.tx) * 0.5 - pf.w * 0.8},${(pf.ry + pf.ty) * 0.5 + 0.25} ${pf.rx - pf.w},${pf.ry + 0.25} Z`}
                      fill="#120b07"
                      stroke="#78583a"
                      strokeWidth="0.11"
                      strokeOpacity="0.58"
                    />
                    <line x1={pf.rx} y1={pf.ry} x2={pf.tx} y2={pf.ty} stroke="#dfd2be" strokeWidth="0.15" strokeOpacity="0.78" />
                  </g>
                ))}

                {/* Большие кроющие крыла (Greater Coverts) — тёмно-умбристый черепичный ряд */}
                {SVG_COVERT_SCALLOPS.map((cy, idx) => (
                  <path
                    key={`gc-${idx}`}
                    d={`M 1.9,${cy - 0.78} L -0.75,${cy - 0.68} C -1.25,${cy - 0.22} -1.25,${cy + 0.42} -0.75,${cy + 0.76} L 1.9,${cy + 0.72} Z`}
                    fill="#2b1b10"
                    stroke="#6b4425"
                    strokeWidth="0.12"
                  />
                ))}

                {/* Средние кроющие крыла (Median Coverts) — фирменная золотисто-охристая перевязь беркута */}
                {SVG_COVERT_SCALLOPS.map((cy, idx) => (
                  <path
                    key={`mc-${idx}`}
                    d={`M 2.75,${cy - 0.72} L 0.65,${cy - 0.65} C 0.18,${cy - 0.22} 0.18,${cy + 0.38} 0.65,${cy + 0.72} L 2.75,${cy + 0.68} Z`}
                    fill="url(#skyEagleCovertGrad)"
                    stroke="#c28544"
                    strokeWidth="0.13"
                    strokeOpacity="0.82"
                  />
                ))}

                {/* Малые кроющие передней кромки и крылышко (Alula) */}
                <path
                  d="M 2.7,1.8 C 3.45,5.2 3.65,8.8 2.55,11.9 C 1.95,11.4 1.65,8.4 1.65,2.0 Z"
                  fill="#24150c"
                  stroke="#9a6735"
                  strokeWidth="0.16"
                  strokeOpacity="0.7"
                />
                <path d="M 2.55,10.6 L 2.15,12.8 L 1.65,11.2 Z" fill="#180f09" stroke="#bfa07a" strokeWidth="0.11" />
              </g>
            ))}

            {/* В. Черепичные контурные перья мантии спины и надхвостья */}
            <ellipse cx="0.2" cy="0" rx="3.45" ry="1.65" fill="#21140c" />
            {SVG_MANTLE_PLUMES.map(([px, py, sc], idx) => (
              <path
                key={`mp-${idx}`}
                d={`M ${px + 0.9 * sc},${py - 0.55 * sc} L ${px - 0.75 * sc},${py - 0.65 * sc} C ${px - 1.25 * sc},${py} ${px - 1.25 * sc},${py} ${px - 0.75 * sc},${py + 0.65 * sc} L ${px + 0.9 * sc},${py + 0.55 * sc} Z`}
                fill={idx % 3 === 1 ? '#4a2e19' : '#2c1b10'}
                stroke="#8c5a2e"
                strokeWidth="0.12"
                strokeOpacity="0.78"
              />
            ))}

            {/* Г. Ланцетовидные золотисто-медные перья зашейка и шапочки + надбровные дуги + глаза + клюв */}
            <ellipse cx="4.25" cy="0" rx="1.85" ry="1.02" fill="#7c4312" />
            {SVG_NAPE_HACKLES.map(([hx, hy, rot], idx) => (
              <path
                key={`hk-${idx}`}
                transform={`translate(${hx}, ${hy}) rotate(${rot})`}
                d="M 0.75,0 C 0.2,-0.32 -0.45,-0.28 -1.05,0 C -0.45,0.28 0.2,0.32 0.75,0 Z"
                fill={idx % 2 === 0 ? '#f59e0b' : '#b45309'}
                stroke="#fde68a"
                strokeWidth="0.09"
                strokeOpacity="0.75"
              />
            ))}
            {/* Надбровные валики и зоркие янтарные глаза */}
            <circle cx="4.95" cy="-0.56" r="0.18" fill="#fbbf24" />
            <circle cx="4.95" cy="0.56" r="0.18" fill="#fbbf24" />
            <path d="M 4.45,-0.68 L 5.45,-0.52 M 4.45,0.68 L 5.45,0.52" stroke="#29180b" strokeWidth="0.22" strokeLinecap="round" />
            {/* Жёлтая восковица и крючковатый тёмно-роговой клюв */}
            <ellipse cx="5.75" cy="0" rx="0.45" ry="0.42" fill="#eab308" />
            <path d="M 5.95,-0.38 L 7.65,0 L 5.95,0.38 Z" fill="#475569" />
            <path d="M 6.55,-0.24 L 7.82,0 L 6.55,0.24 Z" fill="#0f172a" />
          </g>
        </g>
      </g>
    </g>
  );
}

// Объёмная многоярусная орографическая облачная гряда на мульти-стопных радиальных градиентах (0 CPU-фильтров):
// 11 перекрывающихся клубящихся куполов с мягким растворением кромки формируют живую кучевую/грозовую фактуру
function VolumetricCloudBank({
  cx,
  cy,
  driftRx = 52,
  driftRy = 7,
  dur = '38s',
  rx = 74,
  variant = 'cumulus', // 'cumulus' | 'storm' | 'snow'
  opacity = 0.56
}) {
  const isStormBank = variant === 'storm';
  const isSnowBank = variant === 'snow';
  const shadowOpacity = isStormBank ? opacity * 0.72 : opacity * 0.48;
  const baseGrad = isStormBank
    ? 'url(#skyStormBaseRadGrad)'
    : isSnowBank
    ? 'url(#skySnowBaseRadGrad)'
    : 'url(#skyCumulusBaseRadGrad)';
  const foldGrad = isStormBank ? 'url(#skyStormFoldRadGrad)' : 'url(#skyCumulusFoldRadGrad)';
  const puffGrad = isStormBank
    ? 'url(#skyStormPuffRadGrad)'
    : isSnowBank
    ? 'url(#skySnowPuffRadGrad)'
    : 'url(#skyCumulusPuffRadGrad)';
  const crownGrad = isStormBank ? 'url(#skyStormCrownRadGrad)' : 'url(#skyCumulusCrownRadGrad)';

  return (
    <g transform={`translate(${cx}, ${cy})`}>
      <g>
        {/* Единый лёгкий GPU-сдвиг облачной гряды по ветру */}
        <animateTransform
          attributeName="transform"
          type="translate"
          values={`0,0; ${driftRx},${driftRy}; 0,0`}
          dur={dur}
          repeatCount="indefinite"
        />

        {/* 1. Глубокая мягкая радиальная тень облачной гряды на горном рельефе */}
        <g transform="translate(22, 32)" opacity={shadowOpacity}>
          <ellipse cx="0" cy="0" rx={rx * 1.24} ry={rx * 0.48} fill="url(#skySoftShadowRadGrad)" />
          <ellipse cx={-rx * 0.48} cy={rx * 0.08} rx={rx * 0.84} ry={rx * 0.34} fill="url(#skySoftShadowRadGrad)" />
          <ellipse cx={rx * 0.52} cy={rx * 0.05} rx={rx * 0.8} ry={rx * 0.32} fill="url(#skySoftShadowRadGrad)" />
        </g>

        {/* 2. Многослойное клубящееся тело кучевого / грозового облака с мягкими краевыми ореолами */}
        <g opacity={opacity}>
          {/* Плоская тёмная подошва конденсации у основания облака */}
          <ellipse cx="0" cy={rx * 0.16} rx={rx * 1.22} ry={rx * 0.4} fill={baseGrad} />
          <ellipse cx={-rx * 0.56} cy={rx * 0.19} rx={rx * 0.82} ry={rx * 0.31} fill={baseGrad} />
          <ellipse cx={rx * 0.58} cy={rx * 0.17} rx={rx * 0.78} ry={rx * 0.3} fill={baseGrad} />

          {/* Теневые ложбины и складки между кучевыми башнями (ambient occlusion) */}
          <ellipse cx={-rx * 0.24} cy={rx * 0.06} rx={rx * 0.94} ry={rx * 0.42} fill={foldGrad} />
          <ellipse cx={rx * 0.36} cy={rx * 0.07} rx={rx * 0.76} ry={rx * 0.35} fill={foldGrad} />

          {/* Асимметричные клубящиеся купола среднего яруса (эффект «цветной капусты» Cumulus congestus) */}
          <ellipse cx={-rx * 0.62} cy={rx * 0.04} rx={rx * 0.56} ry={rx * 0.32} fill={puffGrad} />
          <ellipse cx={-rx * 0.26} cy={-rx * 0.08} rx={rx * 0.72} ry={rx * 0.42} fill={puffGrad} />
          <ellipse cx={rx * 0.16} cy={-rx * 0.04} rx={rx * 0.68} ry={rx * 0.39} fill={puffGrad} />
          <ellipse cx={rx * 0.56} cy={rx * 0.05} rx={rx * 0.54} ry={rx * 0.3} fill={puffGrad} />

          {/* Высокая грозовая наковальня (Cumulonimbus incus) */}
          {isStormBank && (
            <ellipse
              cx={rx * 0.08}
              cy={-rx * 0.25}
              rx={rx * 0.98}
              ry={rx * 0.27}
              fill="url(#skyStormAnvilRadGrad)"
            />
          )}

          {/* Освещённые солнцем бело-золотистые вершины верхних клубов */}
          <ellipse cx={-rx * 0.28} cy={-rx * 0.19} rx={rx * 0.58} ry={rx * 0.28} fill={crownGrad} />
          <ellipse cx={rx * 0.18} cy={-rx * 0.15} rx={rx * 0.52} ry={rx * 0.25} fill={crownGrad} />
          <ellipse cx={-rx * 0.58} cy={-rx * 0.03} rx={rx * 0.4} ry={rx * 0.2} fill={crownGrad} />
          <ellipse cx={rx * 0.48} cy={-rx * 0.02} rx={rx * 0.38} ry={rx * 0.19} fill={crownGrad} />
        </g>
      </g>
    </g>
  );
}

// Змеевидная лента речного тумана в ущельях Аргуна и Койсу (мягкие радиальные эллипсы без feTurbulence)
function ValleyMistRibbon({ x, y, rx, ry, angle = -8, dur = '26s' }) {
  return (
    <g transform={`translate(${x}, ${y}) rotate(${angle})`} opacity="0.56">
      <g>
        <animateTransform
          attributeName="transform"
          type="translate"
          values="-18,-2; 18,3; -18,-2"
          dur={dur}
          repeatCount="indefinite"
        />
        <ellipse cx="0" cy="0" rx={rx * 1.15} ry={ry * 1.28} fill="url(#skyValleyMistGrad)" />
        <ellipse cx={-rx * 0.45} cy={ry * 0.24} rx={rx * 0.82} ry={ry * 0.95} fill="url(#skyValleyMistGrad)" />
        <ellipse cx={rx * 0.46} cy={-ry * 0.2} rx={rx * 0.78} ry={ry * 0.9} fill="url(#skyValleyMistGrad)" />
      </g>
    </g>
  );
}

// Реалистичная грозовая ячейка без CPU-размытия: плазменное свечение построено концентрическими обводками и радиальной зарницей
function StormLightningCell({
  x,
  y,
  dur,
  keyTimes,
  sheetValues,
  boltValues,
  mainTrunk,
  branches,
  strikeX,
  strikeY,
  tint = '#fde047'
}) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* 1. Мягкая внутриоблачная зарница (sheet lightning) */}
      <g>
        <animate
          attributeName="opacity"
          values={sheetValues}
          keyTimes={keyTimes}
          dur={dur}
          repeatCount="indefinite"
        />
        <ellipse cx="0" cy="6" rx="112" ry="54" fill="url(#skySheetLightningOuterGrad)" />
        <ellipse cx="-6" cy="0" rx="64" ry="30" fill="url(#skySheetLightningCoreGrad)" />
      </g>

      {/* 2. Главный ступенчатый ствол молнии, дендритные ветви и коронная вспышка на скале */}
      <g>
        <animate
          attributeName="opacity"
          values={boltValues}
          keyTimes={keyTimes}
          dur={dur}
          repeatCount="indefinite"
        />

        {/* Широкий внешний плазменный ореол без feGaussianBlur */}
        <polyline
          points={mainTrunk}
          fill="none"
          stroke={tint}
          strokeWidth="8.5"
          strokeOpacity="0.18"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polyline
          points={mainTrunk}
          fill="none"
          stroke="#7dd3fc"
          strokeWidth="4.2"
          strokeOpacity="0.54"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Ослепительно-белое ядро канала разряда */}
        <polyline
          points={mainTrunk}
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Вторичные и третичные ветвистые лидеры */}
        {branches.map((pts, idx) => (
          <g key={`br-${idx}`}>
            <polyline
              points={pts}
              fill="none"
              stroke="#7dd3fc"
              strokeWidth={idx % 2 === 0 ? '2.4' : '1.7'}
              strokeOpacity="0.38"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <polyline
              points={pts}
              fill="none"
              stroke="#ffffff"
              strokeWidth={idx % 2 === 0 ? '0.85' : '0.55'}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        ))}

        {/* Вспышка попадания молнии в горный гребень */}
        <g transform={`translate(${strikeX}, ${strikeY})`}>
          <circle cx="0" cy="0" r="18" fill="url(#skySheetLightningCoreGrad)" />
          <ellipse cx="0" cy="0" rx="12" ry="5.5" fill={tint} fillOpacity="0.52" />
          <circle cx="0" cy="0" r="4.2" fill="#ffffff" />
          <line x1="-11" y1="-2" x2="11" y2="2" stroke="#fef08a" strokeWidth="1.1" strokeLinecap="round" />
          <line x1="-6" y1="-6" x2="6" y2="4" stroke="#ffffff" strokeWidth="0.9" strokeLinecap="round" />
        </g>
      </g>
    </g>
  );
}

function AltitudeSkyLayer({ visibility, weather }) {
  if (visibility <= 0.02) return null;

  const isStorm = weather === 'thunderstorm';
  const isRain = weather === 'rain_clouds';
  const isSnow = weather === 'snow_blizzard';

  return (
    <g opacity={visibility} className="pointer-events-none" data-sky-layer={weather}>
      <defs>
        {/* Оперение кавказского беркута */}
        <linearGradient id="skyEaglePlumageGrad" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b1d0b" />
          <stop offset="48%" stopColor="#1f1713" />
          <stop offset="100%" stopColor="#090706" />
        </linearGradient>

        <linearGradient id="skyEagleCovertGrad" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b45309" stopOpacity="0.9" />
          <stop offset="58%" stopColor="#78350f" stopOpacity="0.72" />
          <stop offset="100%" stopColor="#291d16" stopOpacity="0.2" />
        </linearGradient>

        {/* Мягкая радиальная тень облаков на горных склонах (заменяет feGaussianBlur) */}
        <radialGradient id="skySoftShadowRadGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#020617" stopOpacity="0.58" />
          <stop offset="52%" stopColor="#020617" stopOpacity="0.28" />
          <stop offset="82%" stopColor="#020617" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#020617" stopOpacity="0" />
        </radialGradient>

        {/* Мульти-стопные радиальные градиенты объёмных кучевых, снежных и грозовых облаков (0% CPU-фильтров) */}
        <radialGradient id="skyCumulusBaseRadGrad" cx="50%" cy="56%" r="50%">
          <stop offset="0%" stopColor="#334155" stopOpacity="0.62" />
          <stop offset="56%" stopColor="#475569" stopOpacity="0.36" />
          <stop offset="85%" stopColor="#64748b" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#64748b" stopOpacity="0" />
        </radialGradient>

        <radialGradient id="skyCumulusFoldRadGrad" cx="48%" cy="46%" r="50%">
          <stop offset="0%" stopColor="#cbd5e1" stopOpacity="0.76" />
          <stop offset="55%" stopColor="#94a3b8" stopOpacity="0.46" />
          <stop offset="86%" stopColor="#64748b" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#64748b" stopOpacity="0" />
        </radialGradient>

        <radialGradient id="skyCumulusPuffRadGrad" cx="44%" cy="38%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.94" />
          <stop offset="48%" stopColor="#f1f5f9" stopOpacity="0.72" />
          <stop offset="78%" stopColor="#cbd5e1" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#94a3b8" stopOpacity="0" />
        </radialGradient>

        <radialGradient id="skyCumulusCrownRadGrad" cx="42%" cy="32%" r="50%">
          <stop offset="0%" stopColor="#fffbeb" stopOpacity="0.96" />
          <stop offset="52%" stopColor="#f8fafc" stopOpacity="0.64" />
          <stop offset="84%" stopColor="#e2e8f0" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#cbd5e1" stopOpacity="0" />
        </radialGradient>

        <radialGradient id="skySnowBaseRadGrad" cx="50%" cy="55%" r="50%">
          <stop offset="0%" stopColor="#475569" stopOpacity="0.62" />
          <stop offset="58%" stopColor="#64748b" stopOpacity="0.34" />
          <stop offset="100%" stopColor="#94a3b8" stopOpacity="0" />
        </radialGradient>

        <radialGradient id="skySnowPuffRadGrad" cx="45%" cy="38%" r="50%">
          <stop offset="0%" stopColor="#f0f9ff" stopOpacity="0.92" />
          <stop offset="52%" stopColor="#e0f2fe" stopOpacity="0.66" />
          <stop offset="82%" stopColor="#bae6fd" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#94a3b8" stopOpacity="0" />
        </radialGradient>

        <radialGradient id="skyStormBaseRadGrad" cx="50%" cy="56%" r="50%">
          <stop offset="0%" stopColor="#050811" stopOpacity="0.92" />
          <stop offset="55%" stopColor="#0f172a" stopOpacity="0.68" />
          <stop offset="85%" stopColor="#1e293b" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#1e293b" stopOpacity="0" />
        </radialGradient>

        <radialGradient id="skyStormFoldRadGrad" cx="48%" cy="46%" r="50%">
          <stop offset="0%" stopColor="#334155" stopOpacity="0.86" />
          <stop offset="56%" stopColor="#1e293b" stopOpacity="0.58" />
          <stop offset="86%" stopColor="#0f172a" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
        </radialGradient>

        <radialGradient id="skyStormPuffRadGrad" cx="44%" cy="38%" r="50%">
          <stop offset="0%" stopColor="#64748b" stopOpacity="0.88" />
          <stop offset="50%" stopColor="#334155" stopOpacity="0.64" />
          <stop offset="82%" stopColor="#1e293b" stopOpacity="0.24" />
          <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
        </radialGradient>

        <radialGradient id="skyStormCrownRadGrad" cx="42%" cy="34%" r="50%">
          <stop offset="0%" stopColor="#cbd5e1" stopOpacity="0.78" />
          <stop offset="52%" stopColor="#64748b" stopOpacity="0.42" />
          <stop offset="85%" stopColor="#334155" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#1e293b" stopOpacity="0" />
        </radialGradient>

        <radialGradient id="skyStormAnvilRadGrad" cx="50%" cy="42%" r="50%">
          <stop offset="0%" stopColor="#e2e8f0" stopOpacity="0.64" />
          <stop offset="56%" stopColor="#64748b" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#1e293b" stopOpacity="0" />
        </radialGradient>

        {/* Зарница внутри грозовой тучи */}
        <radialGradient id="skySheetLightningOuterGrad" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.54" />
          <stop offset="36%" stopColor="#818cf8" stopOpacity="0.25" />
          <stop offset="70%" stopColor="#fde047" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#090d16" stopOpacity="0" />
        </radialGradient>

        <radialGradient id="skySheetLightningCoreGrad" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.76" />
          <stop offset="36%" stopColor="#bae6fd" stopOpacity="0.34" />
          <stop offset="72%" stopColor="#6366f1" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#090d16" stopOpacity="0" />
        </radialGradient>

        {/* Полосы проливного дождя под подошвой грозовых туч (Virga) */}
        <linearGradient id="skyVirgaShaftGrad" x1="0.2" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.32" />
          <stop offset="55%" stopColor="#bae6fd" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#e0f2fe" stopOpacity="0" />
        </linearGradient>

        {/* Каплевидный градиент струи дождя */}
        <linearGradient id="skyRainStreakGrad" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#93c5fd" stopOpacity="0" />
          <stop offset="55%" stopColor="#bae6fd" stopOpacity="0.46" />
          <stop offset="100%" stopColor="#f0f9ff" stopOpacity="0.9" />
        </linearGradient>

        {/* СТАТИЧЕСКИЕ КЭШИРУЕМЫЕ ПАТТЕРНЫ ЛИВНЯ (наклон струй -2/3 точно совпадает с вектором GPU-сдвига тайла!) */}
        <pattern id="skyRainCurtainFar" width="80" height="120" patternUnits="userSpaceOnUse">
          <g stroke="url(#skyRainStreakGrad)" strokeWidth="0.6" strokeLinecap="round">
            <line x1="20" y1="6" x2="4" y2="30" />
            <line x1="48" y1="22" x2="32" y2="46" />
            <line x1="74" y1="10" x2="58" y2="34" />
            <line x1="30" y1="54" x2="14" y2="78" />
            <line x1="62" y1="64" x2="46" y2="88" />
            <line x1="18" y1="88" x2="2" y2="112" />
            <line x1="50" y1="92" x2="34" y2="116" />
            <line x1="78" y1="78" x2="62" y2="102" />
          </g>
        </pattern>

        <pattern id="skyRainCurtainMid" width="110" height="165" patternUnits="userSpaceOnUse">
          <g stroke="url(#skyRainStreakGrad)" strokeWidth="0.92" strokeLinecap="round">
            <line x1="28" y1="8" x2="6" y2="41" />
            <line x1="70" y1="26" x2="48" y2="59" />
            <line x1="106" y1="14" x2="84" y2="47" />
            <line x1="42" y1="76" x2="20" y2="109" />
            <line x1="88" y1="90" x2="66" y2="123" />
            <line x1="26" y1="124" x2="4" y2="157" />
            <line x1="72" y1="128" x2="50" y2="161" />
          </g>
        </pattern>

        <pattern id="skyRainCurtainNear" width="160" height="240" patternUnits="userSpaceOnUse">
          <g stroke="url(#skyRainStreakGrad)" strokeWidth="1.26" strokeLinecap="round">
            <line x1="42" y1="14" x2="12" y2="59" />
            <line x1="112" y1="38" x2="82" y2="83" />
            <line x1="154" y1="18" x2="124" y2="63" />
            <line x1="68" y1="112" x2="38" y2="157" />
            <line x1="138" y1="132" x2="108" y2="177" />
            <line x1="38" y1="184" x2="8" y2="229" />
            <line x1="104" y1="190" x2="74" y2="235" />
          </g>
        </pattern>

        {/* СТАТИЧЕСКИЕ КЭШИРУЕМЫЕ ПАТТЕРНЫ МЕТЕЛИ (0 индивидуальных таймеров снежинок, чистый GPU-сдвиг слоёв) */}
        <radialGradient id="skySnowBokehRadGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.65" />
          <stop offset="48%" stopColor="#f0f9ff" stopOpacity="0.34" />
          <stop offset="100%" stopColor="#e0f2fe" stopOpacity="0" />
        </radialGradient>

        <pattern id="skySnowPatternFar" width="120" height="120" patternUnits="userSpaceOnUse">
          <g fill="#f8fafc" opacity="0.76">
            {SNOW_TILE_DOTS.map(([sx, sy, sr], idx) => (
              <circle key={`sd-${idx}`} cx={sx} cy={sy} r={sr} />
            ))}
          </g>
        </pattern>

        <pattern id="skySnowPatternMid" width="160" height="160" patternUnits="userSpaceOnUse">
          <g>
            {SNOW_TILE_CRYSTALS.map(([sx, sy, r], idx) => (
              <g key={`sc-${idx}`} transform={`translate(${sx}, ${sy})`}>
                <circle cx="0" cy="0" r={r * 0.52} fill="#ffffff" fillOpacity="0.95" />
                <line x1={-r} y1="0" x2={r} y2="0" stroke="#f0f9ff" strokeWidth="0.62" />
                <line x1="0" y1={-r} x2="0" y2={r} stroke="#f0f9ff" strokeWidth="0.62" />
                <line x1={-r * 0.7} y1={-r * 0.7} x2={r * 0.7} y2={r * 0.7} stroke="#e0f2fe" strokeWidth="0.48" />
                <line x1={r * 0.7} y1={-r * 0.7} x2={-r * 0.7} y2={r * 0.7} stroke="#e0f2fe" strokeWidth="0.48" />
              </g>
            ))}
          </g>
        </pattern>

        <pattern id="skySnowPatternNear" width="220" height="220" patternUnits="userSpaceOnUse">
          <g>
            {SNOW_TILE_BOKEH.map(([sx, sy, r], idx) => (
              <circle key={`sb-${idx}`} cx={sx} cy={sy} r={r} fill="url(#skySnowBokehRadGrad)" />
            ))}
          </g>
        </pattern>

        <radialGradient id="skyValleyMistGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f1f5f9" stopOpacity="0.46" />
          <stop offset="55%" stopColor="#cbd5e1" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#94a3b8" stopOpacity="0" />
        </radialGradient>

        <radialGradient id="skyBlizzardGustRadGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.38" />
          <stop offset="52%" stopColor="#e0f2fe" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#bae6fd" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Атмосферное свинцовое затенение неба в грозу и ливень */}
      {(isStorm || isRain) && (
        <rect
          x="0"
          y="0"
          width="700"
          height="460"
          fill={isStorm ? '#090d18' : '#0f172a'}
          fillOpacity={isStorm ? '0.24' : '0.14'}
        />
      )}

      {/* 1. Змеевидные ленты тумана в глубоких теснинах Аргуна, Андийского и Аварского Койсу */}
      <ValleyMistRibbon x={192} y={222} rx={84} ry={22} angle={-12} dur="25s" />
      <ValleyMistRibbon x={396} y={266} rx={96} ry={25} angle={-6} dur="31s" />
      <ValleyMistRibbon x={518} y={322} rx={88} ry={23} angle={8} dur="27s" />

      {/* 2. Объёмные высотные орографические облака с мягкими тенями на горных хребтах */}
      <g>
        <VolumetricCloudBank
          cx={118}
          cy={86}
          driftRx={56}
          driftRy={6}
          dur="38s"
          rx={66}
          variant={isSnow ? 'snow' : 'cumulus'}
          opacity={isSnow ? 0.64 : 0.52}
        />
        <VolumetricCloudBank
          cx={468}
          cy={138}
          driftRx={52}
          driftRy={6}
          dur="43s"
          rx={78}
          variant={isSnow ? 'snow' : 'cumulus'}
          opacity={isSnow ? 0.62 : 0.5}
        />
        <VolumetricCloudBank
          cx={268}
          cy={332}
          driftRx={62}
          driftRy={7}
          dur="41s"
          rx={86}
          variant={isSnow ? 'snow' : 'cumulus'}
          opacity={isSnow ? 0.68 : 0.54}
        />
        <VolumetricCloudBank
          cx={542}
          cy={364}
          driftRx={48}
          driftRy={5}
          dur="46s"
          rx={72}
          variant={isSnow ? 'snow' : 'cumulus'}
          opacity={isSnow ? 0.64 : 0.48}
        />
      </g>

      {/* 3. Парящие в восходящих горных термиках кавказские беркуты (Aquila chrysaetos) */}
      <SoaringGoldenEagle
        orbitPath="M 115,155 C 155,102 245,104 268,148 C 292,192 215,216 172,176 C 132,140 82,192 115,155 Z"
        dur="27s"
        begin="0s"
        scale={1.36}
        flapDur="4.8s"
      />
      <SoaringGoldenEagle
        orbitPath="M 115,155 C 155,102 245,104 268,148 C 292,192 215,216 172,176 C 132,140 82,192 115,155 Z"
        dur="27s"
        begin="-4.2s"
        scale={1.06}
        flapDur="4.3s"
      />

      {!isSnow && (
        <>
          <SoaringGoldenEagle
            orbitPath="M 485,195 C 548,152 622,186 592,236 C 562,286 462,278 432,234 C 402,192 432,158 485,195 Z"
            dur="31s"
            begin="-7s"
            scale={1.44}
            flapDur="5.2s"
          />
          <SoaringGoldenEagle
            orbitPath="M 485,195 C 548,152 622,186 592,236 C 562,286 462,278 432,234 C 402,192 432,158 485,195 Z"
            dur="31s"
            begin="-19s"
            scale={1.04}
            flapDur="4.4s"
          />
        </>
      )}

      {!isStorm && !isSnow && (
        <SoaringGoldenEagle
          orbitPath="M 245,356 C 318,318 428,322 456,364 C 482,404 385,422 315,396 C 248,372 195,382 245,356 Z"
          dur="33s"
          begin="-11s"
          scale={1.22}
          flapDur="4.9s"
        />
      )}

      {/* 4. Тяжёлые свинцовые грозовые фронты (Cumulonimbus) и наклонные полосы ливня под их подошвой */}
      {(isStorm || isRain) && (
        <g>
          <g opacity={isStorm ? '0.76' : '0.56'}>
            <polygon points="165,132 308,132 268,268 125,268" fill="url(#skyVirgaShaftGrad)" />
            <polygon points="418,224 566,224 524,362 376,362" fill="url(#skyVirgaShaftGrad)" />
            <polygon points="88,286 218,286 184,405 54,405" fill="url(#skyVirgaShaftGrad)" />
          </g>

          <VolumetricCloudBank cx={218} cy={124} driftRx={48} driftRy={5} dur="26s" rx={98} variant="storm" opacity={0.82} />
          <VolumetricCloudBank cx={466} cy={218} driftRx={46} driftRy={5} dur="29s" rx={94} variant="storm" opacity={0.8} />
          <VolumetricCloudBank cx={132} cy={286} driftRx={42} driftRy={4} dur="31s" rx={82} variant="storm" opacity={0.7} />
        </g>
      )}

      {/* 5. Многоячеечная горная гроза: внутриоблачные зарницы, ветвистые лидеры молний и вспышки ударов в скалы */}
      {isStorm && (
        <g>
          <StormLightningCell
            x={244}
            y={128}
            dur="4.7s"
            keyTimes="0; 0.14; 0.16; 0.185; 0.205; 0.23; 0.255; 0.31; 1"
            sheetValues="0; 0.85; 1; 0.32; 0.96; 0.22; 0.72; 0; 0"
            boltValues="0; 0; 1; 0.15; 0.95; 0.08; 0.58; 0; 0"
            mainTrunk="0,0 -9,14 2,21 -12,38 -5,45 -19,66 -11,73 -26,98 -21,106 -34,126"
            branches={[
              '-9,14 -24,27 -21,34 -36,49 -44,56',
              '-12,38 7,52 5,59 19,74 26,84',
              '-19,66 -38,81 -35,89 -49,103',
              '-26,98 -8,112 -11,119 -3,128'
            ]}
            strikeX={-34}
            strikeY={126}
            tint="#fde047"
          />

          <StormLightningCell
            x={492}
            y={218}
            dur="6.1s"
            keyTimes="0; 0.42; 0.44; 0.465; 0.485; 0.51; 0.56; 1"
            sheetValues="0; 0.78; 1; 0.28; 0.92; 0.35; 0; 0"
            boltValues="0; 0; 0.98; 0.12; 0.92; 0.18; 0; 0"
            mainTrunk="0,0 11,15 2,23 16,42 7,50 22,74 14,82 29,108 24,118"
            branches={[
              '11,15 28,28 25,35 41,51',
              '16,42 -4,56 -2,63 -16,78',
              '22,74 40,89 37,96 51,111'
            ]}
            strikeX={24}
            strikeY={118}
            tint="#38bdf8"
          />

          <StormLightningCell
            x={148}
            y={288}
            dur="7.3s"
            keyTimes="0; 0.68; 0.70; 0.72; 0.745; 0.77; 0.82; 1"
            sheetValues="0; 0.72; 0.96; 0.24; 0.88; 0.28; 0; 0"
            boltValues="0; 0; 0.95; 0.1; 0.86; 0; 0; 0"
            mainTrunk="0,0 -8,16 3,24 -10,44 -2,52 -16,76 -12,88 -24,106"
            branches={[
              '-8,16 -23,30 -20,38 -33,52',
              '-10,44 9,58 6,66 18,79'
            ]}
            strikeX={-24}
            strikeY={106}
            tint="#c084fc"
          />
        </g>
      )}

      {/* 6. Четырёхслойный косой горный ливень на GPU-матрицах статических паттернов (0 перерисовок тайлов!) */}
      {(isStorm || isRain) && (
        <g>
          {/* Слой А: Дальняя завеса ливня */}
          <g opacity={isStorm ? '0.62' : '0.46'}>
            <animateTransform
              attributeName="transform"
              type="translate"
              from="0 0"
              to="-80 120"
              dur={isStorm ? '0.56s' : '0.68s'}
              repeatCount="indefinite"
            />
            <rect x="-80" y="-120" width="860" height="700" fill="url(#skyRainCurtainFar)" />
          </g>

          {/* Слой Б: Средняя ускоренная завеса косого ливня */}
          <g opacity={isStorm ? '0.68' : '0.5'}>
            <animateTransform
              attributeName="transform"
              type="translate"
              from="0 0"
              to="-110 165"
              dur={isStorm ? '0.44s' : '0.54s'}
              repeatCount="indefinite"
            />
            <rect x="-110" y="-165" width="920" height="790" fill="url(#skyRainCurtainMid)" />
          </g>

          {/* Слой В: Ближние крупные струи шквала перед объективом камеры */}
          <g opacity={isStorm ? '0.8' : '0.62'}>
            <animateTransform
              attributeName="transform"
              type="translate"
              from="0 0"
              to="-160 240"
              dur={isStorm ? '0.35s' : '0.45s'}
              repeatCount="indefinite"
            />
            <rect x="-160" y="-240" width="1020" height="940" fill="url(#skyRainCurtainNear)" />
          </g>

          {/* Слой Г: Две фазовые группы кругов водяной пыли на мокрых хребтах (всего 2 анимации opacity вместо 30!) */}
          <g fill="none" stroke="#e0f2fe" strokeWidth="0.65">
            <g>
              <animate attributeName="opacity" values="0.72; 0.14; 0.72" dur="1.15s" repeatCount="indefinite" />
              {RAIN_SPLASH_GROUP_A.map(([sx, sy], idx) => (
                <ellipse key={`sp-a-${idx}`} cx={sx} cy={sy} rx="6.2" ry="2.3" />
              ))}
            </g>
            <g>
              <animate attributeName="opacity" values="0.14; 0.72; 0.14" dur="1.28s" repeatCount="indefinite" />
              {RAIN_SPLASH_GROUP_B.map(([sx, sy], idx) => (
                <ellipse key={`sp-b-${idx}`} cx={sx} cy={sy} rx="5.6" ry="2.1" />
              ))}
            </g>
          </g>
        </g>
      )}

      {/* 7. Трёхслойная горная метель на кэшируемых тайлах (всего 4 GPU-сдвига вместо 75 таймеров!) */}
      {isSnow && (
        <g>
          {/* Снежная позёмка вдоль хребтов */}
          <g opacity="0.64">
            <animateTransform
              attributeName="transform"
              type="translate"
              values="-42,-8; 42,10; -42,-8"
              dur="11s"
              repeatCount="indefinite"
            />
            <ellipse cx="220" cy="180" rx="205" ry="44" fill="url(#skyBlizzardGustRadGrad)" transform="rotate(-8 220 180)" />
            <ellipse cx="475" cy="275" rx="225" ry="50" fill="url(#skyBlizzardGustRadGrad)" transform="rotate(-11 475 275)" />
            <ellipse cx="340" cy="380" rx="250" ry="54" fill="url(#skyBlizzardGustRadGrad)" transform="rotate(-6 340 380)" />
          </g>

          {/* Слой 1 (Дальний план): снежная крупка */}
          <g>
            <animateTransform
              attributeName="transform"
              type="translate"
              from="0 0"
              to="120 120"
              dur="4.6s"
              repeatCount="indefinite"
            />
            <rect x="-120" y="-120" width="940" height="700" fill="url(#skySnowPatternFar)" />
          </g>

          {/* Слой 2 (Средний план): шестилучевые кристаллы снежинок */}
          <g>
            <animateTransform
              attributeName="transform"
              type="translate"
              from="0 0"
              to="-160 160"
              dur="3.4s"
              repeatCount="indefinite"
            />
            <rect x="-160" y="-160" width="1020" height="780" fill="url(#skySnowPatternMid)" />
          </g>

          {/* Слой 3 (Передний план у камеры): мягкое снежное боке */}
          <g>
            <animateTransform
              attributeName="transform"
              type="translate"
              from="0 0"
              to="220 220"
              dur="2.4s"
              repeatCount="indefinite"
            />
            <rect x="-220" y="-220" width="1140" height="900" fill="url(#skySnowPatternNear)" />
          </g>
        </g>
      )}
    </g>
  );
}

export default memo(AltitudeSkyLayer);
