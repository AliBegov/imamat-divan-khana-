// Вкладка «MapTab» — вынесено из App.jsx; все значения состояния и обработчики приходят через props
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import AltitudeSkyLayer from '../map/AltitudeSkyLayer.jsx';
import CaucasusTable3DViewport from '../map/CaucasusTable3DViewport.jsx';
import { IMAMAT_RELICS_CATALOG, getNaibLoyaltyMemory } from '../../data/imamatRelics.js';
import { HERO_STORY_ARCS } from '../../data/heroArcs.js';
import { HISTORICAL_EPISODES } from '../../data/historicalEpisodes.js';
import { Minimap, UnitCardBar } from '../hud/TableHUD.jsx';
import {
  CompassRoseIcon,
  HighlandEagleIcon,
  ImperialEagleIcon,
  MountainPeakIcon,
  SeveredConvoyIcon,
  ShashkaSabersIcon,
  SpyglassLensIcon,
  UnicornCannonIcon,
  WaxSealIcon
} from '../hud/PeriodIcons.jsx';
import { computeTerrainAwarePath, sampleWeatherAtPoint, sampleStrategicTerrain } from '../../game/terrainEngine.js';
import {
  IMPERIAL_GENERALS,
  FORTIFICATION_BLUEPRINTS,
  NAIB_ORDER_TYPES,
  OTTOMAN_OPTIONS,
  SHAMIL_ORDERS
} from '../../data/campaignData.js';
import { SQUADRON_GEAR_CATALOG } from '../../data/theaterEntities.js';
import {
  SRTM_SUMMER_RELIEF_DATA_URI,
  SRTM_WINTER_RELIEF_DATA_URI
} from '../../data/terrainTexturesData.js';
import { DAGESTAN_SRTM_RIVER_DEFS } from '../../data/dagestanRealSrtmDem.js';
import { resolveMediaAsset } from '../../data/embeddedMediaAssets.js';
import { playHistoricalSound } from '../../game/audio.js';
import { PortraitMedallion, findPortrait } from '../hud/GameHUD.jsx';
import {
  ShamilOrderMedallion,
  ShamilOrdersMuseumShowcase,
  inferOrderIdFromName
} from '../shared/ShamilOrdersSvg.jsx';
import { Target, Award, Shield, Users, Crosshair, MapPin, Send, Swords } from 'lucide-react';

// Определение преобладающего рода войск в наибстве (Всадники / Пушки / Пехота)
function getDominantForceForNaibate(n) {
  if (!n) return { type: 'infantry', badgeRu: '💂 Пехота', badgeEn: '💂 Infantry', color: '#10b981' };
  if (
    n.id === 'vedeno' ||
    n.id === 'salty' ||
    n.id === 'chokh' ||
    n.id === 'gergebil' ||
    (n.gunpowder >= 85 && n.underSiege)
  ) {
    return { type: 'artillery', badgeRu: '💣 Пушки', badgeEn: '💣 Cannons', color: '#f59e0b' };
  }
  if ((n.murtazeks || 0) >= 310 || n.id === 'khunzakh' || n.id === 'shali' || n.id === 'andi') {
    return { type: 'cavalry', badgeRu: '🐎 Всадники', badgeEn: '🐎 Horsemen', color: '#34d399' };
  }
  return { type: 'infantry', badgeRu: '💂 Пехота', badgeEn: '💂 Infantry', color: '#38bdf8' };
}

// Определение преобладающего рода войск в походном отряде Имамата
function getDominantForceForUnit(unit) {
  if (!unit) return { type: 'cavalry', badgeRu: '🐎 Всадники', badgeEn: '🐎 Horsemen' };
  if (unit.id === 'unit_talkhig_artillery' || unit.type === 'artillery') {
    return { type: 'artillery', badgeRu: '💣 Пушки', badgeEn: '💣 Cannons' };
  }
  if (unit.id === 'unit_baysungur' || unit.id === 'unit_powder_caravan' || unit.type === 'infantry') {
    return { type: 'infantry', badgeRu: '💂 Пехота', badgeEn: '💂 Infantry' };
  }
  return { type: 'cavalry', badgeRu: '🐎 Всадники', badgeEn: '🐎 Horsemen' };
}

// Анатомическая 3D-модель кавказского боевого скакуна с артикулированными передними и задними ногами,
// живым циклом галопа в походе и нулевой фоновой нагрузкой на стоянке (0 холостых SMIL-таймеров в покое)
function renderSculptedWarhorse({
  coatFill = '#1c1917',
  coatHighlight = '#44403c',
  farLegFill = '#090b10',
  maneFill = '#090b10',
  clothFill = '#10b981',
  trimColor = '#fde047',
  isMoving = false,
  gaitDur = '0.44s'
}) {
  return (
    <g>
      {/* Пышный развевающийся хвост скакуна */}
      <g transform="translate(-5.6, -0.6)">
        {isMoving && (
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="-10 0 0; 16 0 0; -10 0 0"
            dur={gaitDur}
            repeatCount="indefinite"
          />
        )}
        <path
          d="M 0,0 C -2.6,-0.5 -4.9,0.8 -6.1,3.3 C -4.1,3.1 -2.3,1.9 -0.2,0.9 Z"
          fill={maneFill}
          stroke={trimColor}
          strokeWidth="0.32"
          strokeOpacity="0.65"
        />
      </g>

      {/* Задние ноги с бедром, скакательным суставом и подкованными копытами */}
      <g>
        {isMoving && (
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="-24 -4.3 0.3; 21 -4.3 0.3; -24 -4.3 0.3"
            dur={gaitDur}
            repeatCount="indefinite"
          />
        )}
        {/* Дальняя задняя нога */}
        <path
          d="M -3.8,0.4 L -5.2,2.4 L -4.4,4.5 L -3.3,4.5 L -3.9,2.3 L -2.7,0.5 Z"
          fill={farLegFill}
        />
        {/* Ближняя мускулистая задняя нога */}
        <path
          d="M -5.4,0.1 C -6.3,1.3 -6.5,2.3 -5.8,3.1 L -6.8,4.7 L -5.4,4.7 L -4.5,3.0 C -4.0,2.1 -4.8,1.1 -3.8,0.2 Z"
          fill={coatFill}
          stroke="#090b10"
          strokeWidth="0.42"
        />
        <rect x="-6.9" y="4.3" width="1.5" height="0.55" rx="0.2" fill="#d6d3d1" />
      </g>

      {/* Мускулистый корпус, круп и глубокая грудь скакуна */}
      <g>
        <path
          d="M -5.9,0.3 C -6.4,-1.7 -4.7,-2.7 -2.3,-2.4 C 0.2,-2.1 2.4,-2.2 4.3,-3.0 C 5.8,-2.1 6.1,0.2 4.6,1.2 C 2.1,1.65 -2.5,1.65 -5.1,1.05 Z"
          fill={coatFill}
          stroke="#090b10"
          strokeWidth="0.52"
        />
        {/* Анатомический блик на крупе и плече коня */}
        <path
          d="M -4.8,-1.5 C -3.2,-2.2 -1.2,-2.0 0.8,-1.8 M 2.4,-2.0 C 3.8,-2.4 4.9,-1.5 4.8,-0.2"
          fill="none"
          stroke={coatHighlight}
          strokeWidth="0.75"
          strokeLinecap="round"
          strokeOpacity="0.8"
        />
        {/* Шитый золотом кавказский чепрак (попона) и подпруга */}
        <path
          d="M -3.3,-2.25 L 2.5,-2.25 L 3.1,0.65 L -3.7,0.65 Z"
          fill={clothFill}
          stroke={trimColor}
          strokeWidth="0.52"
        />
        <line x1="-0.2" y1="-2.25" x2="-0.2" y2="1.35" stroke="#1c1917" strokeWidth="0.55" />
      </g>

      {/* Передние ноги с коленом, бабкой и копытами (в противофазе галопа к задним ногам) */}
      <g>
        {isMoving && (
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="25 3.9 0.2; -21 3.9 0.2; 25 3.9 0.2"
            dur={gaitDur}
            repeatCount="indefinite"
          />
        )}
        {/* Дальняя передняя нога */}
        <path
          d="M 3.3,0.4 L 4.5,2.5 L 3.9,4.5 L 5.0,4.5 L 5.6,2.4 L 4.4,0.3 Z"
          fill={farLegFill}
        />
        {/* Ближняя передняя нога в вымахе */}
        <path
          d="M 3.6,0.1 L 5.3,2.0 L 7.1,3.7 L 6.1,4.5 L 4.2,2.6 L 2.8,0.6 Z"
          fill={coatFill}
          stroke="#090b10"
          strokeWidth="0.42"
        />
        <rect x="5.9" y="4.1" width="1.4" height="0.55" rx="0.2" fill="#d6d3d1" />
      </g>

      {/* Изогнутая лебединая шея, грива, точёная голова с ушами и золотая уздечка */}
      <g>
        {isMoving && (
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="-5 3.6 -2.2; 4.5 3.6 -2.2; -5 3.6 -2.2"
            dur={gaitDur}
            repeatCount="indefinite"
          />
        )}
        {/* Развевающаяся грива */}
        <path
          d="M 2.8,-2.5 C 3.8,-4.5 4.8,-6.0 6.1,-6.8 C 4.5,-5.3 3.4,-3.9 2.2,-2.2 Z"
          fill={maneFill}
        />
        {/* Шея и голова */}
        <path
          d="M 2.9,-2.2 C 3.8,-4.4 5.0,-6.2 6.3,-6.9 L 6.6,-8.0 L 7.2,-6.8 L 7.7,-7.7 L 7.8,-6.4 L 9.6,-4.7 C 9.8,-4.2 9.3,-3.6 8.6,-3.7 L 6.8,-4.3 C 6.2,-3.0 5.4,-1.4 4.7,-0.4 Z"
          fill={coatFill}
          stroke="#090b10"
          strokeWidth="0.45"
          strokeLinejoin="round"
        />
        {/* Глаз коня, удила и поводья */}
        <circle cx="7.4" cy="-5.8" r="0.38" fill="#fef08a" />
        <circle cx="8.9" cy="-4.1" r="0.42" fill={trimColor} />
        <path
          d="M 6.5,-6.4 L 8.9,-4.1 M 8.8,-4.0 Q 5.2,-3.2 1.8,-3.8"
          fill="none"
          stroke={trimColor}
          strokeWidth="0.48"
        />
      </g>
    </g>
  );
}

// Скульптурные 3D-фигуры полководцев, конных сотен, горных батарей и царских батальонных колонн
// с анатомическими формами, исторической амуницией Кавказской войны, поворотом по курсу и живой анимацией
function renderForceFigurine(
  forceType,
  primaryColor = '#10b981',
  accentColor = '#fde047',
  scale = 1,
  isMoving = false,
  isFiring = false,
  headingDeg = 0,
  commanderId = ''
) {
  const rad = ((headingDeg || 0) * Math.PI) / 180;
  const facingX = Math.cos(rad) < -0.18 ? -1 : 1;

  // 1. АРТИЛЛЕРИЯ (Мудир Талгик Шалинский, горные батареи Яхьи аль-Мильки и Хаджи-Юсуфа, крепостные расчёты)
  if (forceType === 'artillery') {
    return (
      <g transform={`scale(${scale * facingX}, ${scale})`} className="pointer-events-none">
        {/* Каменный бруствер с объёмной светотенью и плетёными турами (габионами) */}
        <path
          d="M -11.5,5.4 Q 0,7.5 11.5,5.4 L 10.0,2.1 Q 0,3.9 -10.0,2.1 Z"
          fill="url(#stoneWallShadeGrad)"
          stroke="#1c1917"
          strokeWidth="0.65"
        />
        {[-7.6, -3.8, 4.2].map((gx, idx) => (
          <g key={`gab-${idx}`} transform={`translate(${gx}, 1.3)`}>
            <rect x="-1.6" y="-2.3" width="3.2" height="4.4" rx="0.8" fill="#78350f" stroke="#451a03" strokeWidth="0.5" />
            <line x1="-1.5" y1="-0.9" x2="1.5" y2="-0.9" stroke="#d97706" strokeWidth="0.42" />
            <line x1="-1.5" y1="0.5" x2="1.5" y2="0.5" stroke="#d97706" strokeWidth="0.42" />
            <ellipse cx="0" cy="-2.3" rx="1.6" ry="0.62" fill="#78716c" stroke="#292524" strokeWidth="0.35" />
          </g>
        ))}

        {/* Фигура полководца-артиллериста (Мудир Талгик) в черкеске и высокой папахе с латунной подзорной трубой */}
        <g transform="translate(-8.8, -0.4)">
          {/* Сапоги */}
          <rect x="-1.5" y="2.8" width="1.1" height="1.8" rx="0.3" fill="#090b10" />
          <rect x="0.4" y="2.8" width="1.1" height="1.8" rx="0.3" fill="#090b10" />
          {/* Приталенная черкеска с расклешённым подолом */}
          <path
            d="M -2.3,3.2 L -1.4,-1.0 L -2.1,-3.8 L 2.1,-3.8 L 1.4,-1.0 L 2.3,3.2 Z"
            fill={primaryColor}
            stroke="#090b10"
            strokeWidth="0.58"
          />
          {/* Серебряные газыри и кавказский пояс с кинжалом */}
          <line x1="-1.4" y1="-2.3" x2="1.4" y2="-2.3" stroke="#fef08a" strokeWidth="0.65" strokeDasharray="0.6,0.35" />
          <line x1="-1.4" y1="-0.9" x2="1.4" y2="-0.9" stroke="#fbbf24" strokeWidth="0.55" />
          {/* Лицо с бородой и меховая папаха */}
          <circle cx="0" cy="-4.7" r="1.15" fill="#fed7aa" />
          <path d="M -0.9,-4.3 Q 0,-3.4 0.9,-4.3" fill="#1c1917" />
          <path
            d="M -1.9,-5.1 C -2.1,-7.2 2.1,-7.2 1.9,-5.1 Z"
            fill="#1c1917"
            stroke={accentColor}
            strokeWidth="0.5"
          />
          {/* Рука с наведённой латунной подзорной трубой */}
          <g>
            <line x1="0.8" y1="-3.6" x2="4.4" y2="-5.1" stroke="#fbbf24" strokeWidth="0.85" strokeLinecap="round" />
            <circle cx="4.6" cy="-5.2" r="0.45" fill="#e0f2fe" />
          </g>
        </g>

        {/* Бомбардир-топчи с искрящимся пальником у запального отверстия */}
        <g transform="translate(-4.5, -1.0)">
          <path
            d="M -2.0,3.8 L -1.2,-0.8 L -1.8,-3.5 L 1.8,-3.5 L 1.2,-0.8 L 2.0,3.8 Z"
            fill="#1e293b"
            stroke="#090b10"
            strokeWidth="0.55"
          />
          <circle cx="0" cy="-4.4" r="1.05" fill="#fed7aa" />
          <ellipse cx="0" cy="-5.5" rx="1.75" ry="1.45" fill="#292524" stroke={accentColor} strokeWidth="0.45" />
          {/* Древко пальника с тлеющим фитилём */}
          <g>
            {isFiring && (
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="0 1 -2; 14 1 -2; 0 1 -2"
                dur="1.05s"
                repeatCount="indefinite"
              />
            )}
            <line x1="1.0" y1="-2.0" x2="4.3" y2="-4.7" stroke="#fde68a" strokeWidth="0.62" />
            <circle cx="4.5" cy="-4.9" r="0.95" fill="#f97316" />
            <circle cx="4.5" cy="-4.9" r="0.45" fill="#fef9c3" />
          </g>
        </g>

        {/* Кованый дубовый лафет горного орудия */}
        <path
          d="M -9.8,4.6 L -2.6,-1.6 L 2.4,-1.2 L 5.6,4.6 L 3.2,4.6 L 0.2,1.2 L -7.4,4.6 Z"
          fill="#78350f"
          stroke="#451a03"
          strokeWidth="0.75"
        />
        <line x1="-8.2" y1="3.9" x2="2.8" y2="0.4" stroke="#fbbf24" strokeWidth="0.6" />

        {/* Литой бронзовый ствол полупудового горного единорога с вингардом, фризами и откатом */}
        <g transform="rotate(-21 0 -1.5)">
          <g>
            {isFiring && (
              <animateTransform
                attributeName="transform"
                type="translate"
                values="0,0; -3.1,0.75; 0,0"
                dur="1.05s"
                repeatCount="indefinite"
              />
            )}
            <circle cx="-7.5" cy="-2.4" r="1.45" fill="#92400e" stroke="#fef08a" strokeWidth="0.5" />
            <path
              d="M -6.6,-4.45 L 8.0,-3.9 L 8.9,-4.55 L 9.8,-4.55 L 9.8,-0.25 L 8.9,-0.25 L 8.0,-0.9 L -6.6,-0.35 Z"
              fill="url(#bronzeCannonGrad)"
              stroke="#fef08a"
              strokeWidth="0.65"
            />
            {/* Дельфины (скобы на стволе) и рельефные пояски */}
            <path d="M -1.2,-4.3 Q 0,-5.3 1.2,-4.2" fill="none" stroke="#fef08a" strokeWidth="0.6" />
            <line x1="-5.6" y1="-3.2" x2="7.8" y2="-2.9" stroke="#ffffff" strokeWidth="0.65" strokeOpacity="0.72" />
            <line x1="-2.4" y1="-4.35" x2="-2.4" y2="-0.45" stroke="#78350f" strokeWidth="0.7" />
            <line x1="3.0" y1="-4.15" x2="3.0" y2="-0.65" stroke="#78350f" strokeWidth="0.7" />

            {isFiring && (
              <g>
                <polygon points="10.0,-2.4 18.8,-6.6 16.0,-2.4 18.8,1.8" fill="#f97316" fillOpacity="0.9">
                  <animate attributeName="opacity" values="0.98;0.08;0.98" dur="1.05s" repeatCount="indefinite" />
                </polygon>
                <circle cx="12.0" cy="-2.4" r="2.8" fill="#fef08a">
                  <animate attributeName="r" values="1.2;4.1;1.2" dur="1.05s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="1;0.12;1" dur="1.05s" repeatCount="indefinite" />
                </circle>
                <circle cx="15.2" cy="-4.0" r="3.5" fill="#e7e5e4" fillOpacity="0.58">
                  <animate attributeName="cx" values="11.5;20.5;11.5" dur="1.05s" repeatCount="indefinite" />
                  <animate attributeName="r" values="2.1;5.8;2.1" dur="1.05s" repeatCount="indefinite" />
                  <animate attributeName="fill-opacity" values="0.68;0.06;0.68" dur="1.05s" repeatCount="indefinite" />
                </circle>
              </g>
            )}
          </g>
        </g>

        {/* Артиллерийское колесо с 8 дубовыми спицами и кованой шиной (вращается на марше!) */}
        <g transform="translate(-1.2, 2.6)">
          <g>
            {isMoving && (
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 0 0"
                to="360 0 0"
                dur="1.05s"
                repeatCount="indefinite"
              />
            )}
            <circle cx="0" cy="0" r="4.35" fill="#1c1917" fillOpacity="0.88" stroke={accentColor} strokeWidth="1.15" />
            <line x1="-4.1" y1="0" x2="4.1" y2="0" stroke="#b45309" strokeWidth="0.75" />
            <line x1="0" y1="-4.1" x2="0" y2="4.1" stroke="#b45309" strokeWidth="0.75" />
            <line x1="-2.9" y1="-2.9" x2="2.9" y2="2.9" stroke="#b45309" strokeWidth="0.65" />
            <line x1="2.9" y1="-2.9" x2="-2.9" y2="2.9" stroke="#b45309" strokeWidth="0.65" />
            <circle cx="0" cy="0" r="1.45" fill="#78350f" stroke={accentColor} strokeWidth="0.7" />
          </g>
        </g>

        {/* Пороховой бочонок и пирамидка чугунных пудовых гранат */}
        <rect x="5.4" y="0.7" width="3.3" height="3.9" rx="0.9" fill="#78350f" stroke="#fde047" strokeWidth="0.5" />
        <line x1="5.4" y1="2.0" x2="8.7" y2="2.0" stroke="#fde047" strokeWidth="0.45" />
        <line x1="5.4" y1="3.3" x2="8.7" y2="3.3" stroke="#fde047" strokeWidth="0.45" />
        <circle cx="9.5" cy="4.0" r="1.25" fill="#1c1917" stroke="#a8a29e" strokeWidth="0.45" />
        <circle cx="11.5" cy="4.0" r="1.25" fill="#1c1917" stroke="#a8a29e" strokeWidth="0.45" />
        <circle cx="10.5" cy="2.1" r="1.25" fill="#1c1917" stroke="#a8a29e" strokeWidth="0.45" />
      </g>
    );
  }

  // 2. ИНЖЕНЕРНЫЙ ПОРОХОВОЙ КАРАВАН ХАДЖИ-ЮСУФА САФАРОВА (вьючные мулы, горская арба с бочонками и конвой)
  if (commanderId === 'unit_powder_caravan') {
    return (
      <g transform={`scale(${scale * facingX}, ${scale})`} className="pointer-events-none">
        {/* Горская двуколка-арба с дубовыми бочками пороха и тюками селитры */}
        <g transform="translate(-5.8, 0.4)">
          <path d="M -5.2,0.8 L 4.8,0.8 L 4.2,-2.8 L -4.6,-2.8 Z" fill="#78350f" stroke="#fde047" strokeWidth="0.55" />
          <ellipse cx="-1.8" cy="-3.1" rx="2.1" ry="1.4" fill="#fef3c7" stroke="#92400e" strokeWidth="0.48" />
          <rect x="0.6" y="-4.2" width="2.8" height="3.2" rx="0.7" fill="#92400e" stroke="#fde047" strokeWidth="0.48" />
          <g transform="translate(-0.4, 2.2)">
            {isMoving && (
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 0 0"
                to="360 0 0"
                dur="1.15s"
                repeatCount="indefinite"
              />
            )}
            <circle cx="0" cy="0" r="3.2" fill="#1c1917" stroke={accentColor} strokeWidth="0.95" />
            <line x1="-3.0" y1="0" x2="3.0" y2="0" stroke="#b45309" strokeWidth="0.6" />
            <line x1="0" y1="-3.0" x2="0" y2="3.0" stroke="#b45309" strokeWidth="0.6" />
            <circle cx="0" cy="0" r="0.95" fill="#fde047" />
          </g>
        </g>

        {/* Вьючный конь с перемётными сумами селитры */}
        <g transform="translate(2.4, 0.2) scale(0.76)">
          {renderSculptedWarhorse({
            coatFill: '#57534e',
            coatHighlight: '#a8a29e',
            farLegFill: '#292524',
            maneFill: '#1c1917',
            clothFill: primaryColor,
            trimColor: accentColor,
            isMoving,
            gaitDur: '0.54s'
          })}
          <ellipse cx="-0.4" cy="-3.4" rx="3.2" ry="1.9" fill="#fef3c7" stroke="#78350f" strokeWidth="0.55" />
          <line x1="-1.2" y1="-5.1" x2="-1.2" y2="-1.6" stroke="#dc2626" strokeWidth="0.55" />
          <line x1="0.8" y1="-5.1" x2="0.8" y2="-1.6" stroke="#dc2626" strokeWidth="0.55" />
        </g>

        {/* Главный инженер Хаджи-Юсуф Сафаров с чертёжным свитком укреплений и саблей */}
        <g transform="translate(-0.6, 0.4)">
          <path
            d="M -2.5,4.2 L -1.5,-0.6 L -2.3,-4.4 L 2.3,-4.4 L 1.5,-0.6 L 2.5,4.2 Z"
            fill={primaryColor}
            stroke={accentColor}
            strokeWidth="0.68"
          />
          <line x1="-1.5" y1="-2.5" x2="1.5" y2="-2.5" stroke="#fef08a" strokeWidth="0.65" strokeDasharray="0.7,0.35" />
          <circle cx="0" cy="-5.5" r="1.25" fill="#fed7aa" />
          <path d="M -1.0,-5.0 Q 0,-4.0 1.0,-5.0" fill="#1c1917" />
          {/* Инженерная феска с белой чалмой учёного-мухаджира */}
          <path d="M -1.6,-6.0 L -1.2,-8.2 L 1.2,-8.2 L 1.6,-6.0 Z" fill="#991b1b" stroke="#fde047" strokeWidth="0.45" />
          <ellipse cx="0" cy="-6.2" rx="1.95" ry="0.75" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.35" />
          {/* Свиток чертежей крепостей в руке */}
          <rect x="1.6" y="-3.8" width="3.1" height="1.15" rx="0.4" fill="#fef3c7" stroke="#92400e" strokeWidth="0.4" transform="rotate(-18 2.8 -3.2)" />
        </g>
      </g>
    );
  }

  // 3. ПЕХОТА И ЦАРСКИЕ ЭКСПЕДИЦИОННЫЕ КОЛОННЫ (Генералы Воронцов, Фрейтаг, Аргутинский / Ичкерийские стрелки Байсунгура)
  if (forceType === 'infantry' || forceType === 'imperial_infantry' || forceType === 'infantry_artillery') {
    const isImperial = forceType === 'imperial_infantry' || forceType === 'infantry_artillery';
    const coatFill = isImperial ? '#14532d' : primaryColor;
    const collarFill = isImperial ? '#dc2626' : accentColor;
    const hatFill = isImperial ? '#090d16' : '#1c1917';
    const isVorontsov = commanderId.includes('vorontsov');

    if (isImperial) {
      // ЦАРСКАЯ КОЛОННА: Конный генерал Кавказского корпуса во главе сомкнутых батальонных шеренг со штыками и орудием
      return (
        <g transform={`scale(${scale * facingX}, ${scale})`} className="pointer-events-none">
          {/* Сомкнутая шеренга гренадер и егерей Кавказского корпуса со штыками на втором плане */}
          {[-8.4, -4.4, -0.4].map((sx, idx) => (
            <g key={`imp-rank-${idx}`} transform={`translate(${sx}, -0.4) scale(0.82)`}>
              {/* Шагающие сапоги */}
              <g>
                {isMoving && (
                  <animateTransform
                    attributeName="transform"
                    type="translate"
                    values={idx % 2 === 0 ? '0,0; 0,-1.0; 0,0' : '0,-1.0; 0,0; 0,-1.0'}
                    dur="0.56s"
                    repeatCount="indefinite"
                  />
                )}
                <rect x="-1.6" y="2.8" width="1.15" height="2.0" rx="0.3" fill="#090b10" />
                <rect x="0.45" y="2.8" width="1.15" height="2.0" rx="0.3" fill="#090b10" />
                {/* Мундир тёмно-зелёного сукна с красным воротником и белыми кожаными перевязями */}
                <path
                  d="M -2.5,3.2 L -1.8,-0.8 L -2.4,-4.2 L 2.4,-4.2 L 1.8,-0.8 L 2.5,3.2 Z"
                  fill={coatFill}
                  stroke="#090b10"
                  strokeWidth="0.6"
                />
                <line x1="-1.9" y1="-3.9" x2="1.9" y2="2.2" stroke="#f8fafc" strokeWidth="0.8" />
                <line x1="1.9" y1="-3.9" x2="-1.9" y2="2.2" stroke="#f8fafc" strokeWidth="0.8" />
                <rect x="-1.7" y="-4.3" width="3.4" height="0.95" fill={collarFill} />
                {/* Лицо и кивер/папаха с двуглавым орлом */}
                <circle cx="0" cy="-5.2" r="1.15" fill="#fed7aa" />
                <path d="M -2.1,-5.7 L -2.4,-8.2 L 2.4,-8.2 L 2.1,-5.7 Z" fill={hatFill} stroke="#fde047" strokeWidth="0.5" />
                <circle cx="0" cy="-6.9" r="0.65" fill="#fbbf24" />
                {/* Ружьё с примкнутым трёхгранным штыком */}
                <line x1="-1.6" y1="1.4" x2="2.8" y2="-9.6" stroke="#78350f" strokeWidth="1.0" />
                <line x1="2.8" y1="-9.6" x2="4.7" y2="-14.5" stroke="#e2e8f0" strokeWidth="0.88" />
              </g>
            </g>
          ))}

          {/* Полковой штандарт с имперским двуглавым орлом */}
          <g transform="translate(-5.8, 0)">
            <line x1="0" y1="3.4" x2="0" y2="-17.6" stroke="#fde047" strokeWidth="1.05" />
            <circle cx="0" cy="-18.2" r="0.85" fill="#fbbf24" />
            <g>
              {isMoving && (
                <animateTransform
                  attributeName="transform"
                  type="skewY"
                  values="-3; 4; -3"
                  dur="0.72s"
                  repeatCount="indefinite"
                />
              )}
              <path
                d="M 0,-17.4 Q 4.8,-18.4 9.6,-15.8 L 9.4,-11.4 Q 4.8,-13.2 0,-12.0 Z"
                fill="#fef3c7"
                stroke="#dc2626"
                strokeWidth="0.65"
              />
              <circle cx="4.6" cy="-14.4" r="1.25" fill="#090b10" />
            </g>
          </g>

          {/* КОННЫЙ ГЕНЕРАЛ РИ ВПЕРЕДИ КОЛОННЫ (Кн. Воронцов в двууголке с султаном / Ген. Фрейтаг или Аргутинский в фуражке) */}
          <g transform="translate(3.2, 0.5) scale(0.9)">
            {renderSculptedWarhorse({
              coatFill: isVorontsov ? '#78350f' : '#451a03',
              coatHighlight: '#b45309',
              farLegFill: '#1c1917',
              maneFill: '#090b10',
              clothFill: '#991b1b',
              trimColor: '#fde047',
              isMoving,
              gaitDur: '0.52s'
            })}
            {/* Торс генерала в мундире с золотыми генеральскими эполетами и Георгиевской лентой */}
            <path
              d="M -2.2,-0.6 L -1.6,-4.4 L -2.3,-7.6 L 2.1,-7.6 L 1.6,-4.4 L 2.2,-0.6 Z"
              fill="#14532d"
              stroke="#fde047"
              strokeWidth="0.6"
            />
            <line x1="-1.8" y1="-7.2" x2="1.6" y2="-2.2" stroke="#f97316" strokeWidth="0.85" />
            <ellipse cx="-2.1" cy="-7.4" rx="1.2" ry="0.7" fill="#fbbf24" />
            <ellipse cx="1.9" cy="-7.4" rx="1.2" ry="0.7" fill="#fbbf24" />
            <circle cx="0" cy="-8.8" r="1.25" fill="#fed7aa" />
            {isVorontsov ? (
              <>
                {/* Генеральская двууголка кн. Воронцова с белым султаном */}
                <path d="M -3.0,-9.3 Q 0,-12.2 3.0,-9.3 Z" fill="#090d16" stroke="#fde047" strokeWidth="0.5" />
                <ellipse cx="0.2" cy="-11.7" rx="0.9" ry="1.45" fill="#f8fafc" />
              </>
            ) : (
              <>
                {/* Офицерская кавказская фуражка с белым верхом и козырьком */}
                <ellipse cx="0" cy="-9.9" rx="2.2" ry="0.85" fill="#f8fafc" stroke="#dc2626" strokeWidth="0.45" />
                <line x1="0.4" y1="-9.4" x2="2.5" y2="-9.2" stroke="#090b10" strokeWidth="0.55" />
              </>
            )}
            {/* Обнажённый офицерский палаш, указывающий направление марша */}
            <g>
              {isMoving && (
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  values="0 1.8 -6.6; -7 1.8 -6.6; 0 1.8 -6.6"
                  dur="0.65s"
                  repeatCount="indefinite"
                />
              )}
              <path d="M 1.8,-6.6 Q 6.2,-9.8 9.4,-11.8" fill="none" stroke="#f8fafc" strokeWidth="1.2" strokeLinecap="round" />
              <circle cx="1.8" cy="-6.6" r="0.75" fill="#fbbf24" />
            </g>
          </g>

          {/* Приданное осадное орудие для тяжёлых колонн Воронцова и Аргутинского */}
          {forceType === 'infantry_artillery' && (
            <g transform="translate(-10.2, 1.8) scale(0.68)">
              <polygon points="-5.8,3.8 -0.8,-1.2 4.4,3.8" fill="#365314" stroke="#fde047" strokeWidth="0.7" />
              <rect
                x="-5.4"
                y="-3.6"
                width="11.6"
                height="3.0"
                rx="0.9"
                fill="url(#bronzeCannonGrad)"
                stroke="#fef08a"
                strokeWidth="0.75"
                transform="rotate(-14)"
              />
              <g transform="translate(-0.8, 2.2)">
                {isMoving && (
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from="0 0 0"
                    to="360 0 0"
                    dur="1.1s"
                    repeatCount="indefinite"
                  />
                )}
                <circle cx="0" cy="0" r="3.4" fill="#1c1917" stroke="#fde047" strokeWidth="1.0" />
                <line x1="-3.2" y1="0" x2="3.2" y2="0" stroke="#a16207" strokeWidth="0.65" />
                <line x1="0" y1="-3.2" x2="0" y2="3.2" stroke="#a16207" strokeWidth="0.65" />
                <circle cx="0" cy="0" r="1.05" fill="#fde047" />
              </g>
              {isFiring && (
                <circle cx="7.4" cy="-3.2" r="2.5" fill="#fb923c">
                  <animate attributeName="r" values="1;3.4;1" dur="0.85s" repeatCount="indefinite" />
                </circle>
              )}
            </g>
          )}
        </g>
      );
    }

    // ГОРСКАЯ ПЕХОТА ИМАМАТА: Наиб Байсунгур Беноевский и отборные стрелки Ичкерии с длинными нарезными винтовками
    return (
      <g transform={`scale(${scale * facingX}, ${scale})`} className="pointer-events-none">
        {/* Фланговые горские стрелки в черкесках и папахах с длинными кремнёвыми ружьями */}
        {[-6.2, 6.0].map((mx, idx) => (
          <g key={`murid-inf-${idx}`} transform={`translate(${mx}, 0.2) scale(0.86)`}>
            <g>
              {isMoving && (
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values={idx === 0 ? '0,0; 0,-1.1; 0,0' : '0,-1.1; 0,0; 0,-1.1'}
                  dur="0.54s"
                  repeatCount="indefinite"
                />
              )}
              <rect x="-1.6" y="2.8" width="1.1" height="1.9" rx="0.3" fill="#090b10" />
              <rect x="0.5" y="2.8" width="1.1" height="1.9" rx="0.3" fill="#090b10" />
              <path
                d="M -2.6,3.3 L -1.5,-0.7 L -2.3,-4.3 L 2.3,-4.3 L 1.5,-0.7 L 2.6,3.3 Z"
                fill="#1e293b"
                stroke="#090b10"
                strokeWidth="0.62"
              />
              <line x1="-1.5" y1="-2.5" x2="1.5" y2="-2.5" stroke="#fef08a" strokeWidth="0.7" strokeDasharray="0.65,0.35" />
              <circle cx="0" cy="-5.3" r="1.15" fill="#fed7aa" />
              <path d="M -0.9,-4.9 Q 0,-3.9 0.9,-4.9" fill="#1c1917" />
              <path d="M -2.2,-5.6 C -2.5,-8.3 2.5,-8.3 2.2,-5.6 Z" fill="#292524" stroke={accentColor} strokeWidth="0.55" />
              {/* Длинная кавказская кремнёвая винтовка в руках */}
              <line x1="-2.8" y1="1.2" x2="5.8" y2="-8.6" stroke="#78350f" strokeWidth="1.1" />
              <line x1="2.2" y1="-4.5" x2="7.2" y2="-10.2" stroke="#e2e8f0" strokeWidth="0.85" />
            </g>
          </g>
        ))}

        {/* Изумрудное знамя Беноя с полумесяцем и арабской вязью */}
        <g transform="translate(-2.8, 0)">
          <line x1="0" y1="3.8" x2="0" y2="-17.8" stroke="#fde047" strokeWidth="1.1" />
          <circle cx="0" cy="-18.4" r="0.85" fill="#fde047" />
          <g>
            {isMoving && (
              <animateTransform
                attributeName="transform"
                type="skewY"
                values="-3; 4; -3"
                dur="0.58s"
                repeatCount="indefinite"
              />
            )}
            <path
              d="M 0,-17.5 Q 4.6,-18.6 9.4,-15.6 L 8.8,-11.5 Q 4.4,-13.0 0,-11.8 Z"
              fill={primaryColor}
              stroke="#fef08a"
              strokeWidth="0.65"
            />
            <circle cx="3.5" cy="-14.6" r="0.95" fill="#fef08a" />
          </g>
        </g>

        {/* Центральная фигура полководца — Наиб Байсунгур Беноевский в бурке, черкеске с газырями и с воздетой шашкой */}
        <g>
          {isMoving && (
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,0; 0,-1.2; 0,0"
              dur="0.54s"
              repeatCount="indefinite"
            />
          )}
          {/* Развевающаяся за плечами чёрная бурка */}
          <path
            d="M -2.6,-4.8 C -4.6,-1.6 -5.2,1.8 -4.4,4.2 L 3.4,4.2 L 2.6,-4.8 Z"
            fill="#0c0a09"
            stroke={primaryColor}
            strokeWidth="0.55"
          />
          <rect x="-1.7" y="3.1" width="1.25" height="2.0" rx="0.35" fill="#090b10" />
          <rect x="0.45" y="3.1" width="1.25" height="2.0" rx="0.35" fill="#090b10" />
          {/* Приталенная черкеска полководца */}
          <path
            d="M -3.0,3.6 L -1.8,-0.8 L -2.7,-5.0 L 2.7,-5.0 L 1.8,-0.8 L 3.0,3.6 Z"
            fill={primaryColor}
            stroke={accentColor}
            strokeWidth="0.78"
          />
          {/* Серебряные газыри, пояс и кинжал кама */}
          <line x1="-1.9" y1="-3.0" x2="1.9" y2="-3.0" stroke="#fef08a" strokeWidth="0.88" strokeDasharray="0.75,0.4" />
          <line x1="-1.9" y1="-0.8" x2="1.9" y2="-0.8" stroke="#fbbf24" strokeWidth="0.7" />
          <line x1="0.2" y1="-1.1" x2="-0.7" y2="2.3" stroke="#f8fafc" strokeWidth="0.9" strokeLinecap="round" />
          {/* Лицо, борода и высокая папаха с зелёной чалмой газия */}
          <circle cx="0" cy="-6.2" r="1.35" fill="#fed7aa" />
          <path d="M -1.1,-5.7 Q 0,-4.4 1.1,-5.7" fill="#1c1917" />
          <path d="M -2.6,-6.6 C -2.9,-9.8 2.9,-9.8 2.6,-6.6 Z" fill="#1c1917" stroke={accentColor} strokeWidth="0.7" />
          <path d="M -2.5,-7.2 Q 0,-6.1 2.5,-7.2" fill="none" stroke="#34d399" strokeWidth="1.15" />
          {/* Воздетая кавказская шашка с солнечным бликом */}
          <g>
            {isMoving && (
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="0 2.2 -4.6; -8 2.2 -4.6; 0 2.2 -4.6"
                dur="0.54s"
                repeatCount="indefinite"
              />
            )}
            <path d="M 2.2,-4.6 Q 5.8,-9.6 8.4,-13.6" fill="none" stroke="#f8fafc" strokeWidth="1.3" strokeLinecap="round" />
            <circle cx="2.1" cy="-4.5" r="0.8" fill="#fbbf24" />
          </g>
        </g>
      </g>
    );
  }

  // 4. КОННИЦА И КОННЫЕ ПОЛКОВОДЦЫ ИМАМАТА (Хаджи-Мурат Хунзахский на белом аргамаке / Чапар Исмаил / Конные сотни муртазеков)
  const isHadjiMurad = commanderId === 'unit_hadji_murat';
  const heroHorseCoat = isHadjiMurad ? '#f1f5f9' : '#1c1917';
  const heroHorseHighlight = isHadjiMurad ? '#ffffff' : '#57534e';
  const heroHorseFarLeg = isHadjiMurad ? '#94a3b8' : '#090b10';
  const heroHorseMane = isHadjiMurad ? '#cbd5e1' : '#090b10';

  return (
    <g transform={`scale(${scale * facingX}, ${scale})`} className="pointer-events-none">
      <g>
        {/* Плавный наклон корпуса в стремительном галопе или спокойная выправка в седле */}
        {isMoving && (
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="-4.2 0 1; 3.4 0 1; -4.2 0 1"
            dur="0.44s"
            repeatCount="indefinite"
          />
        )}

        {/* Клубы пыли и комья снега из-под копыт скачущей сотни */}
        {isMoving && (
          <g>
            <circle cx="-9.2" cy="4.4" r="2.2" fill="#e7e5e4" fillOpacity="0.54">
              <animate attributeName="cx" values="-7.5;-12.5;-7.5" dur="0.44s" repeatCount="indefinite" />
              <animate attributeName="r" values="1.1;3.4;1.1" dur="0.44s" repeatCount="indefinite" />
              <animate attributeName="fill-opacity" values="0.64;0.08;0.64" dur="0.44s" repeatCount="indefinite" />
            </circle>
            <circle cx="-5.2" cy="4.7" r="1.6" fill={accentColor} fillOpacity="0.42">
              <animate attributeName="r" values="0.8;2.5;0.8" dur="0.52s" repeatCount="indefinite" />
            </circle>
          </g>
        )}

        {/* Левый фланговый мюрид-всадник на гнедом скакуне (второй план) */}
        <g transform="translate(-6.6, -0.7) scale(0.7)" opacity="0.93">
          {renderSculptedWarhorse({
            coatFill: '#5c2808',
            coatHighlight: '#9a3412',
            farLegFill: '#291205',
            maneFill: '#090b10',
            clothFill: primaryColor,
            trimColor: '#fde047',
            isMoving,
            gaitDur: '0.47s'
          })}
          <path d="M -2.2,-0.5 L -1.5,-7.6 L 1.8,-7.6 L 2.4,-0.5 Z" fill="#1c1917" stroke={primaryColor} strokeWidth="0.7" />
          <circle cx="0.2" cy="-8.7" r="1.15" fill="#fed7aa" />
          <ellipse cx="0.2" cy="-9.9" rx="2.1" ry="1.8" fill="#292524" stroke="#fde047" strokeWidth="0.55" />
          <line x1="1.6" y1="-5.6" x2="7.2" y2="-12.4" stroke="#e2e8f0" strokeWidth="1.0" strokeLinecap="round" />
        </g>

        {/* Правый фланговый мюрид-всадник на вороном/сером скакуне (второй план) */}
        <g transform="translate(6.0, -0.3) scale(0.7)" opacity="0.93">
          {renderSculptedWarhorse({
            coatFill: isHadjiMurad ? '#292524' : '#475569',
            coatHighlight: '#94a3b8',
            farLegFill: '#0f172a',
            maneFill: '#090b10',
            clothFill: primaryColor,
            trimColor: '#fde047',
            isMoving,
            gaitDur: '0.41s'
          })}
          <path d="M -2.2,-0.5 L -1.5,-7.6 L 1.8,-7.6 L 2.4,-0.5 Z" fill="#1c1917" stroke={primaryColor} strokeWidth="0.7" />
          <circle cx="0.2" cy="-8.7" r="1.15" fill="#fed7aa" />
          <ellipse cx="0.2" cy="-9.9" rx="2.1" ry="1.8" fill="#1c1917" stroke="#fde047" strokeWidth="0.55" />
          <line x1="1.6" y1="-5.6" x2="7.5" y2="-12.2" stroke="#e2e8f0" strokeWidth="1.0" strokeLinecap="round" />
        </g>

        {/* Знаменная пика с шёлковым знаменем наиба и золотым полумесяцем (на втором плане за плечом полководца) */}
        <g transform="translate(-4.6, -0.5)">
          <line x1="0" y1="3.0" x2="0" y2="-18.6" stroke="#fde047" strokeWidth="1.1" />
          <circle cx="0" cy="-19.3" r="0.88" fill="#fef08a" />
          <g>
            {isMoving && (
              <animateTransform
                attributeName="transform"
                type="skewY"
                values="-4; 5; -4"
                dur="0.44s"
                repeatCount="indefinite"
              />
            )}
            <path
              d="M 0,-18.4 Q 4.8,-19.6 9.8,-16.6 L 7.8,-14.3 L 9.4,-12.0 Q 4.6,-13.4 0,-12.4 Z"
              fill={primaryColor}
              stroke="#fef08a"
              strokeWidth="0.62"
            />
            <circle cx="3.2" cy="-15.4" r="1.05" fill="#fef08a" />
            <circle cx="3.7" cy="-15.4" r="0.82" fill={primaryColor} />
          </g>
        </g>

        {/* ГЛАВНЫЙ БОЕВОЙ КОНЬ И СКУЛЬПТУРНАЯ ФИГУРА КОННОГО ПОЛКОВОДЦА НА ПЕРЕДНЕМ ПЛАНЕ */}
        {renderSculptedWarhorse({
          coatFill: heroHorseCoat,
          coatHighlight: heroHorseHighlight,
          farLegFill: heroHorseFarLeg,
          maneFill: heroHorseMane,
          clothFill: primaryColor,
          trimColor: accentColor,
          isMoving,
          gaitDur: '0.44s'
        })}

        {/* Широкая войлочная кавказская бурка полководца */}
        <path
          d="M -2.2,-7.8 C -5.2,-6.4 -6.8,-3.2 -6.2,0.2 L -1.4,-0.2 L 1.4,-7.8 Z"
          fill="#0c0a09"
          stroke={primaryColor}
          strokeWidth="0.68"
        />

        {/* Сапог в стремени, приталенная черкеска с 18 серебряными газырями и кинжал на поясе */}
        <path d="M -0.5,-0.4 L 0.5,2.2 L 1.6,2.2 L 0.9,-0.4 Z" fill="#090b10" />
        <ellipse cx="1.1" cy="2.3" rx="0.65" ry="0.35" fill="none" stroke="#fde047" strokeWidth="0.4" />
        <path
          d="M -2.1,-0.4 L -1.5,-4.2 L -2.3,-8.1 L 2.2,-8.1 L 1.6,-4.2 L 2.2,-0.4 Z"
          fill={primaryColor}
          stroke="#090b10"
          strokeWidth="0.6"
        />
        <line x1="-1.5" y1="-6.0" x2="1.5" y2="-6.0" stroke="#fef08a" strokeWidth="0.82" strokeDasharray="0.72,0.36" />
        <line x1="-1.5" y1="-4.1" x2="1.5" y2="-4.1" stroke="#fbbf24" strokeWidth="0.65" />
        <line x1="0.2" y1="-4.3" x2="-0.5" y2="-1.8" stroke="#f8fafc" strokeWidth="0.8" strokeLinecap="round" />

        {/* Волевое лицо с бородой и высокая папаха (белая аварская у Хаджи-Мурата, каракулевая у муртазеков) */}
        <circle cx="0.2" cy="-9.2" r="1.28" fill="#fed7aa" />
        <path d="M -0.8,-8.8 Q 0.2,-7.7 1.2,-8.8" fill="#1c1917" />
        <path
          d="M -2.2,-9.6 C -2.5,-12.8 2.9,-12.8 2.6,-9.6 Z"
          fill={isHadjiMurad ? '#f8fafc' : '#1c1917'}
          stroke={accentColor}
          strokeWidth="0.72"
        />
        <path
          d="M -2.1,-10.1 Q 0.2,-9.1 2.5,-10.1"
          fill="none"
          stroke={isHadjiMurad ? '#ef4444' : primaryColor}
          strokeWidth="0.95"
        />

        {/* Воздетая кавказская шашка дамасской стали с солнечным бликом */}
        <g>
          {isMoving && (
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="-6 2.1 -6.8; 8 2.1 -6.8; -6 2.1 -6.8"
              dur="0.44s"
              repeatCount="indefinite"
            />
          )}
          <path
            d="M 2.1,-6.8 Q 6.4,-11.9 9.8,-15.6"
            fill="none"
            stroke="#f8fafc"
            strokeWidth="1.38"
            strokeLinecap="round"
          />
          <path
            d="M 3.6,-8.6 Q 6.8,-12.3 9.6,-15.4"
            fill="none"
            stroke="#ffffff"
            strokeWidth="0.7"
            strokeLinecap="round"
          />
          <circle cx="2.0" cy="-6.7" r="0.85" fill="#fbbf24" />
        </g>
      </g>
    </g>
  );
}

// Детализированные 3D-миниатюры для караванов, гонцов, мостов, сигнальных башен, мельниц и укреплений (вместо плоских кружков с эмодзи)
function renderAuxiliaryMiniature(kind, strokeColor = '#fbbf24', isActive = false) {
  if (kind === 'caravan') {
    // Вьючный караван: навьюченный мул с пороховыми бочонками и тюками + двуколка-арба + конный страж
    return (
      <g className="pointer-events-none">
        <ellipse cx="0" cy="4.2" rx="10.5" ry="4.6" fill="#0f172a" stroke={strokeColor} strokeWidth="1.3" />
        {/* Деревянная горская арба с бочонками */}
        <rect x="-8.2" y="-1.8" width="6.2" height="3.6" rx="0.8" fill="#78350f" stroke="#fde047" strokeWidth="0.55" />
        <ellipse cx="-5.1" cy="-2.2" rx="2.4" ry="1.5" fill="#fef3c7" stroke="#92400e" strokeWidth="0.5" />
        <circle cx="-5.2" cy="2.2" r="2.6" fill="#1c1917" stroke={strokeColor} strokeWidth="0.9" />
        <circle cx="-5.2" cy="2.2" r="0.8" fill={strokeColor} />
        {/* Вьючный конь/мул с тюками пороха и зерна */}
        <path
          d="M -0.8,3.6 L 0.4,-1.2 L 4.5,-1.5 L 6.8,-4.5 L 8.2,-3.2 L 6.6,0.4 L 7.2,3.6 L 5.4,3.6 L 4.8,1.1 L 1.2,1.2 L 0.4,3.6 Z"
          fill="#57534e"
          stroke="#e7e5e4"
          strokeWidth="0.65"
        />
        {/* Навьюченные тюки и бочонок на спине мула */}
        <ellipse cx="2.8" cy="-2.4" rx="2.5" ry="1.7" fill="#d97706" stroke="#fef08a" strokeWidth="0.55" />
        <line x1="2.8" y1="-4.1" x2="2.8" y2="-0.7" stroke="#78350f" strokeWidth="0.6" />
        {/* Флажок охранения Байт-уль-Мал */}
        {isActive && (
          <g>
            <line x1="-1.5" y1="2" x2="-1.5" y2="-10.5" stroke="#fde047" strokeWidth="0.9" />
            <polygon points="-1.5,-10.5 5.2,-8.6 -1.5,-6.8" fill="#10b981" stroke="#fef08a" strokeWidth="0.5" />
          </g>
        )}
      </g>
    );
  }

  if (kind === 'envoy') {
    // Стремительный конный гонец / лазутчик / посол в бурке со свитком или значком
    return (
      <g className="pointer-events-none">
        <ellipse cx="0" cy="3.8" rx="9" ry="4.2" fill="#0f172a" stroke={strokeColor} strokeWidth="1.3" />
        <path
          d="M -6,3.4 L -4.2,-1.2 L 2.8,-1.6 L 5.6,-5.2 L 7.4,-3.8 L 5.4,0.2 L 6.2,3.4 L 4.4,3.4 L 3.8,0.8 L -2.6,1 L -4.2,3.4 Z"
          fill="#1c1917"
          stroke={strokeColor}
          strokeWidth="0.75"
        />
        <polygon points="-2.2,-0.5 -1.4,-6.8 1.8,-6.8 2.4,-0.5" fill={strokeColor} stroke="#090b10" strokeWidth="0.65" />
        <circle cx="0.2" cy="-8.5" r="1.9" fill="#292524" stroke="#fef08a" strokeWidth="0.6" />
        <line x1="-1.8" y1="1.8" x2="-1.8" y2="-12.5" stroke="#fde047" strokeWidth="0.9" />
        <polygon points="-1.8,-12.5 4.8,-10.6 -1.8,-8.8" fill={strokeColor} stroke="#ffffff" strokeWidth="0.5" />
      </g>
    );
  }

  if (kind === 'flock') {
    // Альпийская отара овец на джайляу (3 объёмные овечки с чабаном)
    return (
      <g className="pointer-events-none">
        <ellipse cx="0" cy="3.8" rx="9.5" ry="4.2" fill="#064e3b" stroke={strokeColor} strokeWidth="1.2" />
        {[
          [-4.2, 0.8],
          [0.5, -0.6],
          [4.4, 1.1]
        ].map(([sx, sy], idx) => (
          <g key={`sheep-${idx}`} transform={`translate(${sx}, ${sy})`}>
            <ellipse cx="0" cy="0" rx="2.6" ry="1.8" fill="#f8fafc" stroke="#94a3b8" strokeWidth="0.5" />
            <circle cx="-1.4" cy="-0.4" r="1.2" fill="#ffffff" />
            <circle cx="1.2" cy="-0.3" r="1.2" fill="#ffffff" />
            <ellipse cx="2.4" cy="-0.6" rx="1.1" ry="0.8" fill="#1c1917" />
          </g>
        ))}
        {/* Посох чабана */}
        <line x1="-1.5" y1="3" x2="-1.5" y2="-7.5" stroke="#fde047" strokeWidth="0.85" />
      </g>
    );
  }

  if (kind === 'beacon') {
    // Горная каменная сигнальная башня со сторожевым костром на вершине
    return (
      <g className="pointer-events-none">
        <ellipse cx="0" cy="4.8" rx="9.5" ry="4.4" fill="#1c1917" stroke={strokeColor} strokeWidth="1.4" />
        {/* Сужающаяся каменная башня */}
        <polygon points="-4.8,4.6 -3.4,-7.5 3.4,-7.5 4.8,4.6" fill="url(#towerStoneGrad)" stroke="#d6d3d1" strokeWidth="0.8" />
        <line x1="-4.1" y1="0" x2="4.1" y2="0" stroke="#292524" strokeWidth="0.6" />
        <line x1="-3.7" y1="-3.8" x2="3.7" y2="-3.8" stroke="#292524" strokeWidth="0.6" />
        <rect x="-1" y="-5.2" width="2" height="3.2" rx="0.6" fill="#090b10" />
        {/* Дровяной костёр (поленница) на площадке башни */}
        <line x1="-4.2" y1="-7.8" x2="4.2" y2="-7.8" stroke="#78350f" strokeWidth="1.6" strokeLinecap="round" />
        {isActive && (
          <g>
            {/* Пламя и дым сигнального костра */}
            <polygon points="-3.8,-8 -1.2,-16.5 0.8,-11.5 2.4,-17.2 3.8,-8" fill="#f97316" />
            <polygon points="-2.2,-8 0,-14.2 2.2,-8" fill="#fef08a" />
            <circle cx="0" cy="-20" r="3.4" fill="#57534e" fillOpacity="0.46" />
          </g>
        )}
      </g>
    );
  }

  if (kind === 'fortification') {
    // Каменный завал и бревенчатый редут с рогатками и габионами на перевале
    return (
      <g className="pointer-events-none">
        <ellipse cx="0" cy="4.2" rx="11" ry="5" fill="#1c1917" stroke={strokeColor} strokeWidth="1.4" />
        {/* Каменная кладка завала */}
        <polygon points="-9,4 -7,-3.5 7,-3.5 9,4" fill="url(#towerStoneGrad)" stroke={strokeColor} strokeWidth="0.9" />
        {/* Зубцы и амбразуры */}
        <rect x="-5.5" y="-5.2" width="2.8" height="2.2" fill="#57534e" stroke="#1c1917" strokeWidth="0.5" />
        <rect x="-1.4" y="-5.2" width="2.8" height="2.2" fill="#57534e" stroke="#1c1917" strokeWidth="0.5" />
        <rect x="2.7" y="-5.2" width="2.8" height="2.2" fill="#57534e" stroke="#1c1917" strokeWidth="0.5" />
        {/* Заострённые колья палисада */}
        <line x1="-8" y1="3" x2="-11" y2="-1.5" stroke="#92400e" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="8" y1="3" x2="11" y2="-1.5" stroke="#92400e" strokeWidth="1.2" strokeLinecap="round" />
      </g>
    );
  }

  if (kind === 'bridge') {
    // Каменно-бревенчатый арочный мост через горную реку (или взорванные устои)
    return (
      <g className="pointer-events-none">
        {/* Поток горной реки под мостом */}
        <ellipse cx="0" cy="2" rx="11" ry="5.2" fill="#0c4a6e" stroke={strokeColor} strokeWidth="1.3" />
        <path d="M -6,-2.5 Q 0,0 6,2.5 M -5,0 Q 0,2 5,3.8" fill="none" stroke="#bae6fd" strokeWidth="0.8" strokeOpacity="0.7" />
        {/* Каменные береговые устои моста */}
        <rect x="-9.5" y="-3.2" width="3.8" height="6.4" rx="0.6" fill="#57534e" stroke="#d6d3d1" strokeWidth="0.6" />
        <rect x="5.7" y="-3.2" width="3.8" height="6.4" rx="0.6" fill="#57534e" stroke="#d6d3d1" strokeWidth="0.6" />
        {isActive ? (
          /* Мост разобран сапёрами — обрушенные брёвна и пламя */
          <g>
            <line x1="-6" y1="-1.5" x2="-1.8" y2="2.2" stroke="#78350f" strokeWidth="2" />
            <line x1="6" y1="-1.5" x2="1.8" y2="2.2" stroke="#78350f" strokeWidth="2" />
            <polygon points="-2.5,0 0,-6.5 2.5,0" fill="#f97316" />
          </g>
        ) : (
          /* Целый арочный бревенчатый настил с перилами */
          <g>
            <path d="M -6.5,-0.5 Q 0,-4.2 6.5,-0.5 L 6.5,1.8 Q 0,-1.8 -6.5,1.8 Z" fill="#92400e" stroke="#fde68a" strokeWidth="0.7" />
            <line x1="-6" y1="-2.2" x2="6" y2="-2.2" stroke="#fef08a" strokeWidth="0.65" />
          </g>
        )}
      </g>
    );
  }

  if (kind === 'mill') {
    // Пороховая мельница с водяным колесом и каменной сушильней
    return (
      <g className="pointer-events-none">
        <ellipse cx="0" cy="4.2" rx="10" ry="4.5" fill="#1c1917" stroke={strokeColor} strokeWidth="1.3" />
        <polygon points="-6.5,3.8 -5.5,-3.8 3.5,-3.8 4.5,3.8" fill="#57534e" stroke="#d6d3d1" strokeWidth="0.7" />
        <polygon points="-7.2,-3.8 -1,-8.2 5.2,-3.8" fill="#78350f" stroke="#fde047" strokeWidth="0.7" />
        {/* Водяное колесо со спицами */}
        <circle cx="5.2" cy="1.2" r="3.6" fill="#292524" stroke="#f59e0b" strokeWidth="0.95" />
        <line x1="1.8" y1="1.2" x2="8.6" y2="1.2" stroke="#f59e0b" strokeWidth="0.65" />
        <line x1="5.2" y1="-2.2" x2="5.2" y2="4.6" stroke="#f59e0b" strokeWidth="0.65" />
        {/* Дымок над трубой пороховой мельницы */}
        <circle cx="-3" cy="-10.5" r="2.2" fill="#a8a29e" fillOpacity="0.52" />
      </g>
    );
  }

  if (kind === 'hospital') {
    // Полевой шатёр-лазарет хакимов и джаррахов
    return (
      <g className="pointer-events-none">
        <ellipse cx="0" cy="4" rx="9.5" ry="4.2" fill="#042f2e" stroke={strokeColor} strokeWidth="1.3" />
        <polygon points="-7,3.5 -5.5,-2.5 5.5,-2.5 7,3.5" fill="#f8fafc" stroke={strokeColor} strokeWidth="0.75" />
        <polygon points="-7.5,-2.5 0,-8.2 7.5,-2.5" fill="#e2e8f0" stroke={strokeColor} strokeWidth="0.8" />
        {/* Полумесяц/эмблема лазарета */}
        <circle cx="0" cy="-4.6" r="1.6" fill="#10b981" />
        <rect x="-1.2" y="0" width="2.4" height="3.5" fill="#0f172a" />
      </g>
    );
  }

  // 'mine' — подземная минная галерея и пороховые бочки камуфлета
  return (
    <g className="pointer-events-none">
      <ellipse cx="0" cy="3.8" rx="9" ry="4" fill="#1c1917" stroke={strokeColor} strokeWidth="1.3" />
      {/* Бревенчатый портал минной штольни */}
      <path d="M -5,3.5 L -4,-3.5 L 4,-3.5 L 5,3.5 Z" fill="#090b10" stroke="#78350f" strokeWidth="1.2" />
      {/* Пороховые бочонки с фитилём */}
      <rect x="-2.8" y="-0.8" width="2.6" height="3.4" rx="0.7" fill="#991b1b" stroke="#fde047" strokeWidth="0.5" />
      <rect x="0.4" y="-0.8" width="2.6" height="3.4" rx="0.7" fill="#991b1b" stroke="#fde047" strokeWidth="0.5" />
      {isActive && (
        <circle cx="0" cy="-3.8" r="1.8" fill="#fb923c" stroke="#fef08a" strokeWidth="0.5" />
      )}
    </g>
  );
}


function MapTab({
  activeDivanPacket = null,
  activeEnvoys,
  activeEpisodeId = 'ep_1845_dargo',
  activeEpisodeModal = false,
  activeHeroArcModal = null,
  activeRelicIds = [],
  activeTacticalEncounter,
  animatedBattleVfx,
  arsenalItems = [],
  attachedPowder,
  attachedSilver,
  battleMemorials = [],
  capitalLabelEn = 'Dargo-Vedeno',
  capitalLabelRu = 'Дарго-Ведено',
  capitalNaibateId = 'vedeno',
  commandDockTab,
  cordonFortresses,
  crises = [],
  deepRaidTargets,
  dioramaTimeOfDay,
  episodesState = {},
  eraObjectivesProgress = null,
  fieldHospitals,
  floatingCombatPopups,
  forestClearings,
  fortBuildMode,
  fullScreenTableMode,
  gameCameraTilt,
  handleActivateKunakSpyNetwork,
  handleArmSapperMine,
  handleAutoResolveEncounter,
  handleAwardOrder,
  handleBlowBridgesAheadOfColumns,
  handleBoostPowderMill,
  handleBuildFortificationAheadOfColumn,
  handleClaimPrologueReward,
  handleCommandUnitMoveToPoint,
  handleConcentrateArtilleryFire,
  handleCraftArsenalItem,
  handleCycleTimeOfDay,
  handleDefendForestClearing,
  handleDeployBatteryToRidge,
  handleDetonateAllSapperMines,
  handleDispatchAllUnitsDemo,
  handleDispatchMuhtasibToNaibate,
  handleDispatchPrisonerExchange,
  handleDisruptImperialColumn,
  handleEnactNizam,
  handleEnterTacticalDiorama,
  handleEnterTacticalEncounter,
  handleEscortDiplomaticMission,
  handleEscortMuhajirCaravan,
  handleEscortSupplyCaravan,
  handleEvacuateWoundedToHospitals,
  handleExecuteMichikGrandExchange,
  handleExecuteRadialCommand,
  handleFocusThreatHotspot,
  handleIgniteAllSignalBeacons,
  handleInterceptImperialColumn,
  handleInterceptImperialCourier,
  handleLaunchDeepCavalryRaid,
  handleLaunchGeneralCordonAssault,
  handleLaunchGeneralForestAmbush,
  handleLaunchNightSortie,
  handleMediateNaibRivalry,
  handleNextTurn,
  handleOpenBattlePrelude,
  handleOpenHeroArcModal,
  handleOrganizeMuhajirRelief,
  handleOttomanDiplomacy,
  handleOverdriveAllPowderMills,
  handleProclaimEraTriumph,
  handleProtectTranshumanceFlock,
  handleResolveDivanPacket,
  handleResolveEpisodePhase,
  handleResolveHeroArcChoice,
  handleResolveHistoricalCrisis,
  handleRetreatFromEncounter,
  handleSendEnvoy,
  handleSeverColumnSupplyLine,
  handleStrategicMapClick,
  handleStrategicMapMouseMove,
  handleSummonDivanPacket,
  handleToggleActiveRelic,
  handleToggleRiverBridge,
  handleToggleSignalBeacon,
  handleTriggerArtillerySmokeVfx,
  handleUpgradeFieldHospital,
  heroArcsState = {},
  hoveredMapInfo,
  imperialAi,
  imperialHeldIds = [],
  kunakSpyRings,
  lastBattleAfterActionReport = null,
  leaderStressData,
  liveCannonSmokePlumes,
  liveDiplomaticMissions,
  liveFieldUnits,
  liveImperialColumns,
  liveImperialCouriers,
  liveMapFortifications,
  liveMountainBatteries,
  liveMuhajirCaravans,
  liveMuhtasibPatrols,
  livePrisonerConvoys,
  liveSkirmishBursts,
  liveSupplyCaravans,
  liveTranshumanceFlocks,
  liveWeatherFronts,
  mapLayer,
  naibRivalries = [],
  naibates,
  nizams = [],
  orderExecutionCalc,
  powderMills,
  prologueRewardClaimed = false,
  radialWheelTarget,
  real3DTableMode = false,
  reconSources = [],
  resources,
  riverBridges,
  routeMode,
  sapperMines,
  selectedFieldUnit,
  selectedFortBlueprintId,
  selectedNaibate,
  selectedNaibateId,
  selectedOrderType,
  selectedUnitId,
  setActiveDivanPacket,
  setActiveEpisodeId,
  setActiveEpisodeModal,
  setActiveHeroArcModal,
  setActiveTab,
  setActiveTacticalEncounter,
  setAnimatedBattleVfx,
  setAttachedPowder,
  setAttachedSilver,
  setCommandDockTab,
  setFortBuildMode,
  setFullScreenTableMode,
  setGameCameraTilt,
  setHoveredMapInfo,
  setImperialAi,
  setLastBattleAfterActionReport,
  setMapLayer,
  setRadialWheelTarget,
  setReal3DTableMode,
  setRouteMode,
  setSelectedFortBlueprintId,
  setSelectedNaibateId,
  setSelectedOrderType,
  setSelectedUnitId,
  setShowSchematicLabels,
  setShowThreatRadarOverlay,
  setTableQuickDrawer,
  setTerrainSimSpeed,
  setWeatherOverlayEnabled,
  showSchematicLabels,
  showThreatRadarOverlay,
  signalBeacons,
  soundEnabled,
  t,
  tableQuickDrawer,
  terrainProbe,
  terrainSimSpeed,
  totalBatterySalvos,
  totalCaravansDelivered,
  totalCouriersIntercepted,
  totalDeepRaidsCompleted,
  totalDiplomaticMissionsArrived,
  totalFlockMigrations,
  totalForestAmbushesTriggered,
  totalFortressesStormed,
  totalMapInterceptions,
  totalMillBatchesProduced,
  totalMinesDetonatedOnMap,
  totalMuhajirCaravansSaved,
  totalMuhtasibInspections,
  totalPrisonerExchangesCompleted,
  totalWoundedRecoveredOnMap,
  turn,
  turnActionQuota,
  unitMovementLog,
  unlockedRelicIds = [],
  weatherOverlayEnabled
}) {
  // ===== КАМЕРА 3D-СТОЛА: зум 1.0 (орлиная высота, весь театр) … 2.6 (крупный план фигурок) =====
  // Камера хранится одним объектом (центр + зум), чтобы зум и панорама менялись атомарно и всегда оставались в границах карты.
  const MAP_W = 700;
  const MAP_H = 460;
  const ZOOM_MIN = 1.0;
  const ZOOM_MAX = 2.6;
  const clampCamera = (cam) => {
    const z = Math.round(Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, cam.z)) * 100) / 100;
    const halfW = MAP_W / 2 / z;
    const halfH = MAP_H / 2 / z;
    return {
      z,
      cx: Math.max(halfW, Math.min(MAP_W - halfW, cam.cx)),
      cy: Math.max(halfH, Math.min(MAP_H - halfH, cam.cy))
    };
  };
  const [camera, setCamera] = useState({ z: 1, cx: MAP_W / 2, cy: MAP_H / 2 });
  const [showDivanHall, setShowDivanHall] = useState(true); // интерьер зала Диван-ханы вокруг стола
  const [skyWeatherMode, setSkyWeatherMode] = useState('auto'); // 'auto' | 'thunderstorm' | 'rain_clouds' | 'snow_blizzard' | 'eagles_clouds'
  const svgRef = useRef(null);
  const dragRef = useRef(null);
  const suppressClickRef = useRef(false);

  const mapZoom = camera.z;
  const vbW = Math.round(MAP_W / mapZoom);
  const vbH = Math.round(MAP_H / mapZoom);
  const vbX = Math.round(camera.cx - vbW / 2);
  const vbY = Math.round(camera.cy - vbH / 2);

  // Фигурки и подписи растут медленнее карты: при приближении войска расходятся и не налезают друг на друга
  const pieceScale = Math.round(Math.pow(mapZoom, -0.6) * 1000) / 1000;
  const pieceTf = pieceScale === 1 ? '' : ` scale(${pieceScale})`;

  // Небо (орлы, кучевые облака, тучи, гроза, ливень, снег) видно на «орлиной высоте» и плавно тает при крупном зуме
  const altitudeSkyFactor = Math.round(Math.max(0, Math.min(1, (2.05 - mapZoom) / 1.05)) * 100) / 100;

  // Один ход = один месяц кампании (июнь → ноябрь 1845, затем цикл повторяется)
  const monthIdx = (((turn || 1) - 1) % 6 + 6) % 6;
  const autoSkyWeather = monthIdx <= 2 ? 'thunderstorm' : monthIdx <= 4 ? 'rain_clouds' : 'snow_blizzard';
  const seasonLabelRu = monthIdx <= 2 ? '☀️ Лето: грозы и орлы' : monthIdx <= 4 ? '🍂 Осень: тучи и ливни' : '❄️ Предзимье: снег';
  const seasonLabelEn = monthIdx <= 2 ? '☀️ Summer: storms & eagles' : monthIdx <= 4 ? '🍂 Autumn: clouds & rain' : '❄️ Early winter: snow';
  const effectiveSkyWeather = skyWeatherMode === 'auto' ? autoSkyWeather : skyWeatherMode;
  const [isPointerOnMap, setIsPointerOnMap] = useState(false);

  // 3-уровневый семантический зум (Victoria 3 / Total War / Unity of Command II):
  // Уровень I (1.0..1.45): Орлиный обзор ТВД — границы наибств и артерии снабжения из Дарго-Ведено
  // Уровень II (1.45..1.95): Оперативный стол — полководцы, обозы, перехваты на перевалах
  // Уровень III (1.95..2.6): Тактика ущелий — сектора обстрела горных батарей и уклоны высот
  const strategicOverviewOpacity = Math.round(Math.max(0, Math.min(1, (1.58 - mapZoom) / 0.48)) * 100) / 100;
  const tacticalCloseUpOpacity = Math.round(Math.max(0, Math.min(1, (mapZoom - 1.82) / 0.48)) * 100) / 100;

  // Упреждающий предпросмотр маршрута и расхода Очков Движения (ОД / MP) при наведении курсора на карту
  const hoveredRoutePreview = useMemo(() => {
    if (!isPointerOnMap || fortBuildMode || radialWheelTarget || !selectedFieldUnit || !terrainProbe) {
      return null;
    }
    const sx = selectedFieldUnit.x;
    const sy = selectedFieldUnit.y;
    const tx = terrainProbe.x;
    const ty = terrainProbe.y;
    if (Math.hypot(tx - sx, ty - sy) < 18) return null;

    const wps = computeTerrainAwarePath(sx, sy, tx, ty);
    if (!wps || wps.length < 2) return null;

    const unitMaxMp = selectedFieldUnit.maxMp ?? 150;
    const availMp = Math.max(0, selectedFieldUnit.mp ?? unitMaxMp);
    let cumulativeCost = 0;
    const thisTurnPts = [{ x: wps[0].x, y: wps[0].y }];
    const nextTurnPts = [];
    let splitPt = null;

    for (let i = 1; i < wps.length; i++) {
      const prev = wps[i - 1];
      const curr = wps[i];
      const segDist = Math.hypot(curr.x - prev.x, curr.y - prev.y);
      const midX = (prev.x + curr.x) * 0.5;
      const midY = (prev.y + curr.y) * 0.5;
      const midTerr = sampleStrategicTerrain(midX, midY);
      const midWea = sampleWeatherAtPoint(midX, midY, liveWeatherFronts, weatherOverlayEnabled);
      const speedMult = Math.max(0.28, midTerr.speedMult * midWea.speedMult);
      // В движке mp списывается пропорционально stepDist / terrain.speedMult; учитываем среднюю пересечённость
      const segMp = segDist / Math.max(0.45, Math.min(1.25, speedMult));

      if (cumulativeCost + segMp <= availMp && !splitPt) {
        thisTurnPts.push({ x: curr.x, y: curr.y });
      } else if (!splitPt) {
        const remMp = Math.max(0, availMp - cumulativeCost);
        const frac = segMp > 0.01 ? Math.max(0, Math.min(1, remMp / segMp)) : 0;
        const bx = +(prev.x + (curr.x - prev.x) * frac).toFixed(1);
        const by = +(prev.y + (curr.y - prev.y) * frac).toFixed(1);
        splitPt = { x: bx, y: by };
        thisTurnPts.push(splitPt);
        nextTurnPts.push(splitPt, { x: curr.x, y: curr.y });
      } else {
        nextTurnPts.push({ x: curr.x, y: curr.y });
      }
      cumulativeCost += segMp;
    }

    const mpCost = Math.max(4, Math.round(cumulativeCost));
    const turnsNeeded =
      mpCost <= availMp ? 1 : 1 + Math.max(1, Math.ceil((mpCost - availMp) / Math.max(60, unitMaxMp)));
    const destAmbushBonus =
      (terrainProbe.slopeDeg >= 26 ? 15 : 0) +
      (terrainProbe.biomeRu?.includes('лес') ? 20 : 0) +
      (terrainProbe.elevationMeters >= 1800 ? 10 : 0);

    return {
      thisTurnStr: thisTurnPts.map((p) => `${p.x},${p.y}`).join(' '),
      nextTurnStr: nextTurnPts.length >= 2 ? nextTurnPts.map((p) => `${p.x},${p.y}`).join(' ') : '',
      splitPt,
      mpCost,
      availMp: Math.round(availMp),
      turnsNeeded,
      destAmbushBonus,
      tx,
      ty
    };
  }, [
    isPointerOnMap,
    fortBuildMode,
    radialWheelTarget,
    selectedFieldUnit,
    terrainProbe,
    liveWeatherFronts,
    weatherOverlayEnabled
  ]);

  // Северные кордонные сектора для реального Тумана Войны (рассеиваются башнями, разъездами, кострами и кунаками)
  const cordonFogSectors = useMemo(() => {
    const sectors = [
      { id: 'fog_w1', x: 78, y: 48, rx: 68, ry: 38, labelRu: 'Кордон Терека', labelEn: 'Terek Cordon' },
      { id: 'fog_w2', x: 185, y: 44, rx: 72, ry: 36, labelRu: 'Сунженский рубеж', labelEn: 'Sunzha Line' },
      { id: 'fog_c1', x: 295, y: 46, rx: 74, ry: 38, labelRu: 'Подступы Грозной', labelEn: 'Groznaya Approaches' },
      { id: 'fog_c2', x: 405, y: 52, rx: 78, ry: 42, labelRu: 'Кумыкская плоскость', labelEn: 'Kumyk Lowland' },
      { id: 'fog_e1', x: 515, y: 58, rx: 82, ry: 44, labelRu: 'Салатавия и Внезапная', labelEn: 'Salatavia & Vnezapnaya' },
      { id: 'fog_e2', x: 622, y: 72, rx: 78, ry: 48, labelRu: 'Темир-Хан-Шура', labelEn: 'Temir-Khan-Shura' },
      { id: 'fog_se', x: 635, y: 142, rx: 66, ry: 42, labelRu: 'Кази-Кумухский тракт', labelEn: 'Kazi-Kumukh Road' }
    ];
    return sectors.filter((sec) => {
      const covered = (reconSources || []).some((src) => Math.hypot(sec.x - src.x, sec.y - src.y) <= src.r * 0.92);
      return !covered;
    });
  }, [reconSources]);

  const extCamSeqRef = useRef(1);
  const [extCamCmd, setExtCamCmd] = useState(null);
  const [season3DOverride, setSeason3DOverride] = useState(null);
  const baseSeasonPhase =
    effectiveSkyWeather === 'snow_blizzard'
      ? 'winter'
      : monthIdx >= 3
      ? 'autumn'
      : 'summer';
  const seasonPhase = season3DOverride || baseSeasonPhase;
  const activeEpisodeObj =
    HISTORICAL_EPISODES.find((e) => e.id === activeEpisodeId) || HISTORICAL_EPISODES[2];
  const activeEpProgress = episodesState?.[activeEpisodeObj.id] || {
    phaseIdx: 0,
    completed: false,
    history: []
  };
  const activeEpPhase =
    activeEpisodeObj.phases[
      Math.min(activeEpisodeObj.phases.length - 1, activeEpProgress.phaseIdx || 0)
    ] || activeEpisodeObj.phases[0];

  // Зум с привязкой к точке (по умолчанию — центр текущего вида): точка под курсором остаётся на месте
  const zoomTo = (nextZ, anchorX, anchorY) => {
    setCamera((prev) => {
      const z = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, nextZ(prev.z)));
      const ax = anchorX ?? prev.cx;
      const ay = anchorY ?? prev.cy;
      const k = prev.z / z;
      return clampCamera({ z, cx: ax - (ax - prev.cx) * k, cy: ay - (ay - prev.cy) * k });
    });
  };
  const handleAdjustZoom = (delta) => {
    zoomTo((z) => z + delta);
    extCamSeqRef.current += 1;
    setExtCamCmd({ seq: extCamSeqRef.current, type: delta > 0 ? 'zoom_in' : 'zoom_out' });
  };
  const handleResetCamera = () => {
    setCamera({ z: 1, cx: MAP_W / 2, cy: MAP_H / 2 });
    extCamSeqRef.current += 1;
    setExtCamCmd({ seq: extCamSeqRef.current, type: 'reset' });
  };
  const handlePanCamera = (dx, dy) => {
    setCamera((prev) => clampCamera({ ...prev, cx: prev.cx + dx / prev.z, cy: prev.cy + dy / prev.z }));
    extCamSeqRef.current += 1;
    setExtCamCmd({ seq: extCamSeqRef.current, type: 'pan', dx, dy });
  };

  // Плавный облёт камеры к точке (Total War: клик по карточке отряда или мини-карте)
  const flyRafRef = useRef(0);
  const cameraRef = useRef(camera);
  cameraRef.current = camera;
  const flyCameraTo = (x, y, minZoom = 1, instant = false) => {
    extCamSeqRef.current += 1;
    setExtCamCmd({ seq: extCamSeqRef.current, type: 'focus_point', mx: x, my: y });
    cancelAnimationFrame(flyRafRef.current);
    const start = cameraRef.current;
    const target = clampCamera({ z: Math.max(start.z, minZoom), cx: x, cy: y });
    if (instant) {
      setCamera(target);
      return;
    }
    const t0 = performance.now();
    const step = (now) => {
      const k = Math.min(1, (now - t0) / 420);
      const e = 1 - Math.pow(1 - k, 3);
      setCamera(
        clampCamera({
          z: start.z + (target.z - start.z) * e,
          cx: start.cx + (target.cx - start.cx) * e,
          cy: start.cy + (target.cy - start.cy) * e
        })
      );
      if (k < 1) flyRafRef.current = requestAnimationFrame(step);
    };
    flyRafRef.current = requestAnimationFrame(step);
  };
  useEffect(() => () => cancelAnimationFrame(flyRafRef.current), []);
  const handleMinimapJump = (x, y, dragging) => {
    // На «орлиной высоте» перенос взгляда бессмыслен — мини-карта сразу приближает к точке
    flyCameraTo(x, y, 1.8, dragging);
  };
  const handlePickUnitCard = (u) => {
    setSelectedUnitId(u.id);
    playHistoricalSound('paper', soundEnabled);
    flyCameraTo(u.x, u.y, 1.6);
  };
  const handlePickEnemyCard = (c) => {
    flyCameraTo(c.x, c.y, 1.6);
    if (handleOpenBattlePrelude) handleOpenBattlePrelude(c.id);
  };

  // Колесо мыши: обычная прокрутка листает страницу; Ctrl/⌘ + колесо или щипок на трекпаде — зум к курсору.
  // Нативный слушатель с passive:false — React вешает wheel как passive, и preventDefault там вызывал ошибку консоли.
  const zoomToRef = useRef(zoomTo);
  zoomToRef.current = zoomTo;
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return undefined;
    const onWheel = (e) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const rect = svg.getBoundingClientRect();
      if (!rect.width) return;
      const vb = svg.viewBox.baseVal;
      const ax = vb.x + ((e.clientX - rect.left) / rect.width) * vb.width;
      const ay = vb.y + ((e.clientY - rect.top) / rect.height) * vb.height;
      const factor = Math.exp(-Math.max(-60, Math.min(60, e.deltaY)) * 0.01);
      zoomToRef.current((z) => z * factor, ax, ay);
    };
    svg.addEventListener('wheel', onWheel, { passive: false });
    return () => svg.removeEventListener('wheel', onWheel);
  }, [real3DTableMode]);

  // Перетаскивание карты мышью при приближении (короткий клик по-прежнему отдаёт приказ)
  const dragRafRef = useRef(0);
  const handlePointerDown = (e) => {
    if (e.button !== 0 || mapZoom <= 1.001) return;
    const rect = svgRef.current?.getBoundingClientRect();
    const unitsPerPx = rect && rect.width ? vbW / rect.width : 1;
    dragRef.current = { x: e.clientX, y: e.clientY, cx: camera.cx, cy: camera.cy, unitsPerPx, moved: false };
  };
  const handlePointerMove = (e) => {
    const d = dragRef.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (!d.moved && Math.hypot(dx, dy) < 6) return;
    d.moved = true;
    d.lastDx = dx;
    d.lastDy = dy;
    if (dragRafRef.current) return;
    dragRafRef.current = requestAnimationFrame(() => {
      dragRafRef.current = 0;
      const cur = dragRef.current;
      if (!cur) return;
      setCamera((prev) =>
        clampCamera({
          ...prev,
          cx: cur.cx - cur.lastDx * cur.unitsPerPx,
          cy: cur.cy - cur.lastDy * cur.unitsPerPx
        })
      );
    });
  };
  const handlePointerUp = () => {
    if (dragRafRef.current) {
      cancelAnimationFrame(dragRafRef.current);
      dragRafRef.current = 0;
    }
    if (dragRef.current?.moved) suppressClickRef.current = true;
    dragRef.current = null;
  };
  useEffect(() => () => cancelAnimationFrame(dragRafRef.current), []);
  const handleClickCapture = (e) => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      e.stopPropagation();
      e.preventDefault();
    }
  };

  // Колесо приказов всегда остаётся внутри видимой части стола
  const wheelMarginX = 95 * pieceScale;
  const wheelMarginY = 75 * pieceScale;

  // Поочерёдная смена всплывающих боевых сводок на карте (чтобы «Залп единорогов…» и «Каменный завал…» никогда не налезали друг на друга)
  const [bannerCycleTick, setBannerCycleTick] = useState(0);
  useEffect(() => {
    const totalBanners =
      (liveSkirmishBursts?.length || 0) + (animatedBattleVfx ? floatingCombatPopups?.length || 0 : 0);
    if (totalBanners <= 1) return undefined;
    const timer = setInterval(() => {
      setBannerCycleTick((prev) => (prev + 1) % 1000);
    }, 1600);
    return () => clearInterval(timer);
  }, [liveSkirmishBursts?.length, floatingCombatPopups?.length, animatedBattleVfx]);

  // В режиме «Игра (Миниатюры)» вспомогательные кружки-слои показываются по выбранной вкладке Дока (или при включении «Схемы»),
  // чтобы центр карты вокруг Дарго-Ведено не перегружался десятками значков одновременно
  const showDefenseMapLayer =
    showSchematicLabels || fortBuildMode || commandDockTab === 'all' || commandDockTab === 'defense';
  const showArtilleryForestMapLayer =
    showSchematicLabels || commandDockTab === 'all' || commandDockTab === 'artillery_forest';
  const showEconomyMapLayer =
    showSchematicLabels || commandDockTab === 'all' || commandDockTab === 'economy';
  const showMedicineMuhajirMapLayer =
    showSchematicLabels || commandDockTab === 'all' || commandDockTab === 'medicine_muhajir';
  const showIntelDiplomacyMapLayer =
    showSchematicLabels || commandDockTab === 'all' || commandDockTab === 'intel_diplomacy';

  // Координаты постоянных подписей столицы, башен наибств и крепостей для защиты от наложения шильдиков отрядов и всплывающих сводок
  const stationaryLabelAnchors = [
    { x: 225, y: 195 + 17 * pieceScale, halfW: 50 * pieceScale, halfH: 10.5 * pieceScale },
    ...naibates.map((n) => ({
      x: n.coords.x,
      y: n.coords.y + 18 * pieceScale,
      halfW: 42 * pieceScale,
      halfH: 10.5 * pieceScale
    })),
    ...cordonFortresses.map((f) => ({
      x: f.x,
      y: f.y - 19 * pieceScale,
      halfW: 46 * pieceScale,
      halfH: 10.5 * pieceScale
    }))
  ];
  const overlapsStationaryLabel = (lx, ly, halfW = 36 * pieceScale, halfH = 7 * pieceScale) =>
    stationaryLabelAnchors.some(
      (a) => Math.abs(lx - a.x) < halfW + a.halfW && Math.abs(ly - a.y) < halfH + a.halfH
    );

  // Интерактивный 3-шаговый пролог «Совет в Ведено», меню «⚙️ Инструменты и слои», сворачиваемые детали дока и карточки наиба
  const [showQuickPrologue, setShowQuickPrologue] = useState(true);
  const [showMapToolsMenu, setShowMapToolsMenu] = useState(false);
  const [showCommandDeckDetails, setShowCommandDeckDetails] = useState(false);
  const [showNaibDetailsDrawer, setShowNaibDetailsDrawer] = useState(false);
  const [showStaffDrawer, setShowStaffDrawer] = useState(false);
  const [showRelicsDrawer, setShowRelicsDrawer] = useState(false);
  const [showHeroArcsDrawer, setShowHeroArcsDrawer] = useState(false);
  const completedHeroArcsCount = HERO_STORY_ARCS.filter(
    (arc) => heroArcsState?.[arc.id]?.completed
  ).length;
  const step1Done =
    7 - cordonFogSectors.length >= 5 ||
    Boolean(radialWheelTarget) ||
    (kunakSpyRings?.filter((r) => r.active).length || 0) >= 2 ||
    selectedNaibateId !== 'khunzakh';
  const step2Done =
    liveImperialColumns.some((c) => c.supplyCut) ||
    Boolean(activeTacticalEncounter) ||
    totalMapInterceptions > 0 ||
    activeEnvoys.length > 0 ||
    liveFieldUnits.some((u) => u.status === 'moving' || u.status === 'camped');
  const step3Done = (turn || 1) > 1;
  const allPrologueDone = step1Done && step2Done && step3Done;

  return (
    <div className="space-y-2">
            {showQuickPrologue && !fullScreenTableMode && !prologueRewardClaimed && (
              <div className="relative hud-walnut-bezel bg-gradient-to-r from-[#17120c] via-[#13100c] to-[#0f1512] border border-amber-500/45 rounded-xl px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 text-[10.5px] shadow-md">
                <span className="hud-brass-corner tl" />
                <span className="hud-brass-corner tr" />
                <div className="flex items-center gap-1.5 text-amber-200 font-serif font-bold tracking-wide">
                  <WaxSealIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{t('ВВОДНЫЙ СОВЕТ В ВЕДЕНО (3 ШАГА):', 'VEDENO OPENING COUNCIL (3 STEPS):')}</span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={() => {
                      const ring = kunakSpyRings?.find((r) => !r.active) || kunakSpyRings?.[0];
                      if (ring && handleActivateKunakSpyNetwork) {
                        handleActivateKunakSpyNetwork(ring.id);
                        return;
                      }
                      const target = naibates.find((n) => n.underSiege) || naibates[1] || naibates[0];
                      if (!target) return;
                      setSelectedNaibateId(target.id);
                    }}
                    className={`px-2 py-0.5 rounded border cursor-pointer transition font-serif font-bold ${
                      step1Done
                        ? 'bg-emerald-500/20 border-emerald-400/60 text-emerald-200'
                        : 'bg-amber-500/20 hover:bg-amber-500/35 border-amber-400/60 text-amber-100'
                    }`}
                  >
                    {step1Done ? '✓ ' : '① '}
                    {t('1. Разведать кордон (Кунаки)', '1. Scout Cordon (Kunaks)')}
                  </button>
                  <button
                    onClick={() => {
                      const col = liveImperialColumns[0];
                      if (col && handleSeverColumnSupplyLine) {
                        handleSeverColumnSupplyLine(col.id);
                      } else if (col) {
                        handleInterceptImperialColumn(col.id);
                      }
                    }}
                    className={`px-2 py-0.5 rounded border cursor-pointer transition font-serif font-bold ${
                      step2Done
                        ? 'bg-emerald-500/20 border-emerald-400/60 text-emerald-200'
                        : 'bg-sky-500/20 hover:bg-sky-500/35 border-sky-400/60 text-sky-100'
                    }`}
                  >
                    {step2Done ? '✓ ' : '② '}
                    {t('2. Перерезать обоз колонны', '2. Sever Column Supply Line')}
                  </button>
                  <button
                    onClick={handleNextTurn}
                    className={`px-2 py-0.5 rounded border cursor-pointer transition font-serif font-bold ${
                      step3Done
                        ? 'bg-emerald-500/20 border-emerald-400/60 text-emerald-200'
                        : 'bg-orange-500/25 hover:bg-orange-500/40 border-orange-400/70 text-orange-100'
                    }`}
                  >
                    {step3Done ? '✓ ' : '③ '}
                    {t('3. Сдать сезон (Новый ход)', '3. Advance Season (Next Turn)')}
                  </button>
                  {allPrologueDone && handleClaimPrologueReward && (
                    <button
                      onClick={handleClaimPrologueReward}
                      className="px-2.5 py-0.5 rounded bg-gradient-to-b from-emerald-400 to-emerald-600 hover:from-emerald-300 hover:to-emerald-500 text-stone-950 font-serif font-extrabold cursor-pointer shadow"
                    >
                      🎁 {t('Получить +15п пороха и +3% Авторитета', 'Claim +15p Powder & +3% Authority')}
                    </button>
                  )}
                  <button
                    onClick={() => setShowQuickPrologue(false)}
                    className="px-1.5 py-0.5 rounded bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-400 hover:text-stone-200 cursor-pointer"
                    title={t('Скрыть совет в Ведено', 'Hide Vedeno council bar')}
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            {/* ОПЕРАТИВНЫЙ СВИТОК ИСТОРИЧЕСКОГО ЭПИЗОДА (4 ФАЗЫ • 1839 / 1843 / 1845 / 1853 / 1859) */}
            {!fullScreenTableMode && activeEpisodeObj && (
              <div className="relative hud-walnut-bezel bg-gradient-to-r from-[#1a130c] via-[#13110e] to-[#0e1714] border border-amber-400/50 rounded-xl px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 text-[10.5px] shadow-lg">
                <span className="hud-brass-corner tl" />
                <span className="hud-brass-corner tr" />
                <div className="flex flex-wrap items-center gap-2 min-w-0">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/20 border border-amber-400/60 text-amber-200 font-serif font-extrabold shrink-0">
                    📜 {t(activeEpisodeObj.yearsLabelRu, activeEpisodeObj.yearsLabelEn)}
                  </span>
                  <span className="font-serif font-extrabold text-amber-100 text-xs truncate">
                    {t(activeEpisodeObj.titleRu, activeEpisodeObj.titleEn)}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/90 border border-emerald-500/45 text-emerald-300 font-mono font-bold text-[10px] shrink-0">
                    ★ {t('Столица:', 'Capital:')} {t(capitalLabelRu, capitalLabelEn)}
                  </span>
                  {imperialHeldIds.length > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-950/90 border border-rose-500/60 text-rose-200 font-mono font-bold text-[10px] shrink-0">
                      🏰 {t(`Крепостей РИ к штурму: ${imperialHeldIds.length}`, `Forts to Storm: ${imperialHeldIds.length}`)}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {/* Прогресс 4 оперативных фаз текущего эпизода */}
                  <div className="flex items-center gap-1 bg-black/45 px-2 py-0.5 rounded-lg border border-stone-800">
                    {activeEpisodeObj.phases.map((ph, idx) => {
                      const isDone = activeEpProgress.completed || (activeEpProgress.phaseIdx || 0) > idx;
                      const isCurrent = !activeEpProgress.completed && (activeEpProgress.phaseIdx || 0) === idx;
                      return (
                        <span
                          key={ph.id}
                          title={t(ph.titleRu, ph.titleEn)}
                          className={`px-1.5 py-0.5 rounded text-[9.5px] font-mono font-bold transition ${
                            isDone
                              ? 'bg-emerald-500 text-stone-950'
                              : isCurrent
                              ? 'bg-amber-400 text-stone-950 ring-1 ring-amber-200'
                              : 'bg-stone-900 text-stone-500'
                          }`}
                        >
                          {idx + 1}/4{isDone ? '✓' : ''}
                        </span>
                      );
                    })}
                  </div>

                  {/* Быстрое переключение между 5 историческими эпизодами */}
                  <div className="hidden xl:flex items-center gap-0.5 bg-black/35 px-1.5 py-0.5 rounded-lg border border-stone-800">
                    {HISTORICAL_EPISODES.map((ep) => {
                      const epDone = episodesState?.[ep.id]?.completed;
                      const isSel = ep.id === activeEpisodeObj.id;
                      return (
                        <button
                          key={ep.id}
                          type="button"
                          onClick={() => {
                            if (setActiveEpisodeId) setActiveEpisodeId(ep.id);
                            if (setActiveEpisodeModal) setActiveEpisodeModal(true);
                          }}
                          title={t(ep.titleRu, ep.titleEn)}
                          className={`px-1.5 py-0.5 rounded text-[9.5px] font-serif font-bold cursor-pointer transition ${
                            isSel
                              ? 'bg-amber-500/30 border border-amber-400 text-amber-100'
                              : epDone
                              ? 'bg-emerald-950/70 text-emerald-300 hover:bg-emerald-900/70'
                              : 'text-stone-400 hover:text-amber-200'
                          }`}
                        >
                          {ep.episodeNumber}
                          {epDone ? '✓' : ''}
                        </button>
                      );
                    })}
                  </div>

                  {activeEpProgress.completed && activeEpisodeObj.nextChainEpisodeId && (
                    <button
                      type="button"
                      onClick={() => {
                        if (setActiveEpisodeId) setActiveEpisodeId(activeEpisodeObj.nextChainEpisodeId);
                        if (setActiveEpisodeModal) setActiveEpisodeModal(true);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-stone-950 font-serif font-extrabold cursor-pointer shadow"
                    >
                      ▶ {t('К следующему Эпизоду', 'Next Episode')}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setActiveEpisodeModal && setActiveEpisodeModal(true)}
                    className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-serif font-extrabold cursor-pointer shadow"
                  >
                    ⚔️{' '}
                    {activeEpProgress.completed
                      ? t('Итоги операции (4/4)', 'Operation Summary (4/4)')
                      : t(
                          `Открыть фазу операции (${(activeEpProgress.phaseIdx || 0) + 1}/4)`,
                          `Open Operation Phase (${(activeEpProgress.phaseIdx || 0) + 1}/4)`
                        )}
                  </button>
                </div>
              </div>
            )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
            {/* Левая колонка (8 из 12 или 12 из 12 в режиме Стола Полководца): Интерактивная 3D-диорама Кавказского театра военных действий */}
            <div
              className={`${
                fullScreenTableMode ? 'lg:col-span-12' : 'lg:col-span-8'
              } bg-[#110e0b] border border-amber-700/35 rounded-xl p-2.5 shadow-2xl space-y-1.5 transition-all duration-300`}
            >
              {/* ЕДИНАЯ ГРАВИРОВАННАЯ ПАНЕЛЬ КАМЕРЫ И СЕМАНТИЧЕСКОГО ЗУМА НАД 3D-СТОЛОМ */}
              <div className="relative isolate flex flex-wrap items-center justify-between gap-1.5 bg-[#0c0a08] border border-amber-600/35 rounded-lg px-2.5 py-1 text-[10.5px] font-mono">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xs font-bold font-serif text-amber-300 uppercase flex items-center gap-1.5 tracking-wide">
                    <CompassRoseIcon className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{t('3D-Стол Кавказа', '3D Caucasus Table')}</span>
                  </h2>
                  <span className="hidden xl:inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-stone-900/90 border border-amber-700/30 text-stone-300 text-[9.5px]">
                    <span className="text-emerald-300 font-semibold">
                      {t(
                        `Разведка кордона: ${7 - cordonFogSectors.length}/7 секторов`,
                        `Cordon Recon: ${7 - cordonFogSectors.length}/7 sectors`
                      )}
                    </span>
                  </span>
                  {eraObjectivesProgress && (
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[9.5px] hud-num ${
                        eraObjectivesProgress.allDone
                          ? 'bg-amber-500/20 border-amber-400/80 text-amber-200 font-bold'
                          : 'bg-stone-900/95 border-amber-700/40 text-amber-100/90'
                      }`}
                      title={eraObjectivesProgress.items
                        .map((obj) => `${obj.done ? '✓' : '○'} ${t(obj.labelRu, obj.labelEn)}`)
                        .join('\n')}
                    >
                      <Award className="w-3 h-3 text-amber-400 shrink-0" />
                      <span>
                        {t(
                          `Цели эпохи: ${eraObjectivesProgress.doneCount}/${eraObjectivesProgress.totalCount}`,
                          `Era Goals: ${eraObjectivesProgress.doneCount}/${eraObjectivesProgress.totalCount}`
                        )}
                      </span>
                      <span className="hidden sm:inline-flex items-center gap-0.5">
                        {eraObjectivesProgress.items.map((obj) => (
                          <span
                            key={obj.id}
                            className={`inline-block w-1.5 h-1.5 rounded-full ${
                              obj.done ? 'bg-emerald-400' : 'bg-stone-600'
                            }`}
                          />
                        ))}
                      </span>
                    </span>
                  )}
                  {eraObjectivesProgress?.allDone && handleProclaimEraTriumph && (
                    <button
                      onClick={handleProclaimEraTriumph}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-stone-950 font-serif font-extrabold text-[10px] cursor-pointer shadow"
                    >
                      <span>🏆 {t('Триумф эпохи!', 'Era Triumph!')}</span>
                    </button>
                  )}
                  {naibates.some((n) => n.snowbound) && (
                    <button
                      onClick={handleIgniteAllSignalBeacons}
                      title={t(
                        'Зимние бураны замели высокогорные перевалы (-25 провианта/ход). Кликните, чтобы зажечь сигнальные башни ориентиров!',
                        'Winter blizzards blocked highland passes (-25 provisions/turn). Click to light mountain signal beacons!'
                      )}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-sky-950/90 hover:bg-sky-900 border border-sky-400/60 text-sky-200 font-serif font-bold text-[10px] cursor-pointer"
                    >
                      <span>❄️ {t('Перевалы в снегу (Зажечь маяки)', 'Snowbound Passes (Light Beacons)')}</span>
                    </button>
                  )}
                </div>

                {/* Главные игровые кнопки: Зум, Погода, Стол на весь экран и «Инструменты и слои» */}
                <div className="flex flex-wrap items-center gap-1">
                  <button
                    onClick={() => handleAdjustZoom(-0.3)}
                    disabled={!real3DTableMode && mapZoom <= ZOOM_MIN}
                    className="px-2 py-0.5 rounded bg-stone-900 hover:bg-stone-800 border border-amber-500/40 text-amber-200 font-bold cursor-pointer transition disabled:opacity-40 disabled:cursor-not-allowed"
                    title={t('Отдалить камеру: над хребтами появляются стаи орлов, облака, тучи, грозы, дождь и снег', 'Zoom out: flocks of eagles, clouds, storms, rain & snow appear above the ridges')}
                  >
                    − {t('Отдалить (Небо и тучи)', 'Zoom Out (Sky & Clouds)')}
                  </button>
                  <span className="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/40 text-amber-200 font-extrabold text-center hud-num inline-flex items-center gap-1">
                    <HighlandEagleIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>
                      ×{mapZoom.toFixed(1)} •{' '}
                      {mapZoom < 1.38
                        ? t('І. Обзор ТВД', 'I. Theatre View')
                        : mapZoom < 1.92
                        ? t('ІІ. Оперативный стол', 'II. Operational')
                        : t('ІІІ. Тактика ущелий', 'III. Gorge Tactics')}
                    </span>
                  </span>
                  <button
                    onClick={() => handleAdjustZoom(0.3)}
                    disabled={!real3DTableMode && mapZoom >= ZOOM_MAX}
                    className="px-2 py-0.5 rounded bg-stone-900 hover:bg-stone-800 border border-emerald-500/40 text-emerald-200 font-bold cursor-pointer transition disabled:opacity-40 disabled:cursor-not-allowed"
                    title={t('Приблизить камеру к фигуркам всадников, пушек и пехоты', 'Zoom in on the horsemen, cannon & infantry figurines')}
                  >
                    + {t('Приблизить (Фигурки)', 'Zoom In (Figurines)')}
                  </button>
                  {mapZoom > ZOOM_MIN && (
                    <>
                      <button
                        onClick={handleResetCamera}
                        className="px-1.5 py-0.5 rounded bg-stone-900 hover:bg-stone-800 border border-stone-600 text-stone-300 cursor-pointer"
                      >
                        {t('Сброс', 'Reset')}
                      </button>
                      <div className="flex items-center gap-0.5">
                        {[
                          ['◀', -60, 0, t('Запад', 'West')],
                          ['▲', 0, -45, t('Север', 'North')],
                          ['▼', 0, 45, t('Юг', 'South')],
                          ['▶', 60, 0, t('Восток', 'East')]
                        ].map(([icon, dx, dy, label]) => (
                          <button
                            key={icon}
                            onClick={() => handlePanCamera(dx, dy)}
                            className="px-1.5 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-amber-200 cursor-pointer"
                            title={label}
                          >
                            {icon}
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  <button
                    onClick={() => {
                      const order = ['auto', 'thunderstorm', 'rain_clouds', 'eagles_clouds', 'snow_blizzard'];
                      setSkyWeatherMode(order[(order.indexOf(skyWeatherMode) + 1) % order.length]);
                    }}
                    className="px-2 py-0.5 rounded bg-indigo-950/90 hover:bg-indigo-900 border border-indigo-400/50 text-indigo-200 font-bold cursor-pointer transition"
                    title={t(
                      'Быстрое переключение погоды над 3D-столом: Гроза и молнии, Ливень, Орлы и облака, Снежный буран',
                      'Cycle sky weather over the 3D table: Thunderstorm, Downpour, Eagles & Clouds, Blizzard'
                    )}
                  >
                    {effectiveSkyWeather === 'thunderstorm'
                      ? t('⛈️ Гроза', '⛈️ Storm')
                      : effectiveSkyWeather === 'rain_clouds'
                      ? t('🌧️ Ливень', '🌧️ Rain')
                      : effectiveSkyWeather === 'snow_blizzard'
                      ? t('❄️ Буран', '❄️ Blizzard')
                      : t('🦅 Орлы и небо', '🦅 Eagles & Sky')}
                  </button>

                  <button
                    onClick={() => setReal3DTableMode && setReal3DTableMode((prev) => !prev)}
                    className={`px-2.5 py-0.5 rounded cursor-pointer transition font-serif font-extrabold ${
                      real3DTableMode
                        ? 'bg-gradient-to-r from-amber-400 to-emerald-400 text-stone-950 shadow-lg ring-1 ring-amber-200'
                        : 'bg-emerald-950/90 hover:bg-emerald-900 text-emerald-200 border border-emerald-400/60'
                    }`}
                    title={t(
                      'Переключить стол между аппаратным 3D-движком Three.js WebGL2 (рельеф NASA SRTM + .glb модели башен, конницы, колонн и орлов) и тактическим штабным планом',
                      'Switch between Three.js WebGL2 3D Engine (NASA SRTM terrain + .glb PBR towers, cavalry, columns & eagles) and Tactical Staff Map'
                    )}
                  >
                    {real3DTableMode
                      ? t('🗺️ Тактический План', '🗺️ Tactical Staff Plan')
                      : t('🏔️ Настоящее 3D (WebGL)', '🏔️ Real 3D (WebGL)')}
                  </button>

                  <button
                    onClick={() => setShowHeroArcsDrawer((prev) => !prev)}
                    className={`px-2 py-0.5 rounded cursor-pointer transition font-serif font-bold ${
                      showHeroArcsDrawer
                        ? 'bg-emerald-400 text-stone-950 shadow'
                        : 'bg-emerald-950/85 hover:bg-emerald-900/85 text-emerald-200 border border-emerald-400/55'
                    }`}
                    title={t(
                      'Личные сюжетные цепочки решений 3 ключевых героев Имамата: Хаджи-Мурат, Хаджи-Юсуф Сафаров и Байсунгур Беноевский (Акты I–III)',
                      'Personal 3-Act Story Chains of 3 Iconic Imamate Heroes: Hadji Murad, Hajji Yusuf Safarov & Baysungur of Benoy'
                    )}
                  >
                    ⚔️ {t('Судьбы Героев', 'Hero Arcs')} ({completedHeroArcsCount}/3)
                  </button>

                  <button
                    onClick={() => setShowRelicsDrawer((prev) => !prev)}
                    className={`px-2 py-0.5 rounded cursor-pointer transition font-serif font-bold ${
                      showRelicsDrawer
                        ? 'bg-amber-400 text-stone-950 shadow'
                        : 'bg-amber-950/80 hover:bg-amber-900/80 text-amber-200 border border-amber-500/45'
                    }`}
                    title={t(
                      'Сокровищница Реликвий Имамата: выберите до 2 исторических реликвий, дающих постоянные бонусы в кампаниях',
                      'Imamate Relics Treasury: equip up to 2 historical relics granting persistent campaign bonuses'
                    )}
                  >
                    🏛️ {t('Реликвии', 'Relics')} ({activeRelicIds.length}/2)
                  </button>

                  <button
                    onClick={() => setFullScreenTableMode((prev) => !prev)}
                    className={`px-2 py-0.5 rounded cursor-pointer transition ${
                      fullScreenTableMode
                        ? 'bg-sky-400 text-stone-950 font-extrabold shadow'
                        : 'bg-stone-900 text-sky-300 hover:bg-stone-800 border border-sky-500/40 font-bold'
                    }`}
                  >
                    {fullScreenTableMode ? t('Обычный вид', 'Standard View') : t('Стол на весь экран', 'Full-Screen Table')}
                  </button>

                  {/* Единая кнопка «Инструменты и слои» */}
                  <button
                    onClick={() => setShowMapToolsMenu((prev) => !prev)}
                    className={`px-2 py-0.5 rounded cursor-pointer transition font-bold border inline-flex items-center gap-1 ${
                      showMapToolsMenu
                        ? 'bg-amber-500 text-stone-950 border-amber-400 font-extrabold shadow'
                        : 'bg-stone-900 hover:bg-stone-800 text-amber-200 border-amber-500/45'
                    }`}
                  >
                    <SpyglassLensIcon className="w-3.5 h-3.5 shrink-0" />
                    <span>{t('Инструменты и слои', 'Tools & Layers')} ▾</span>
                  </button>
                </div>

                {/* Выпадающая панель «Инструменты и слои» (все сервисные, огневые и атмосферные переключатели) */}
                {showMapToolsMenu && (
                  <div className="w-full mt-1.5 pt-2 border-t border-amber-500/30 bg-[#120f0c] rounded-lg p-2.5 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[10px] uppercase text-amber-300 font-bold">
                        {t('Слои карты и семантическая детализация:', 'Map Layers & Semantic Detail:')}
                      </span>
                      <div className="flex flex-wrap items-center gap-1">
                        <button
                          onClick={() => setMapLayer('realistic_3d')}
                          className={`px-2 py-0.5 rounded cursor-pointer transition ${
                            mapLayer === 'realistic_3d'
                              ? 'bg-sky-500 text-stone-950 font-bold'
                              : 'bg-stone-900 text-stone-300 border border-stone-700'
                          }`}
                        >
                          {t('3D-Рельеф SRTM', '3D SRTM Relief')}
                        </button>
                        <button
                          onClick={() => setMapLayer('political')}
                          className={`px-2 py-0.5 rounded cursor-pointer transition ${
                            mapLayer === 'political'
                              ? 'bg-amber-500 text-stone-950 font-bold'
                              : 'bg-stone-900 text-stone-300 border border-stone-700'
                          }`}
                        >
                          {t('Натиск и Порох', 'Pressure & Powder')}
                        </button>
                        <button
                          onClick={() => setMapLayer('relief')}
                          className={`px-2 py-0.5 rounded cursor-pointer transition ${
                            mapLayer === 'relief'
                              ? 'bg-emerald-500 text-stone-950 font-bold'
                              : 'bg-stone-900 text-stone-300 border border-stone-700'
                          }`}
                        >
                          {t('Террасы и Джайляу', 'Terraces & Pastures')}
                        </button>
                        <button
                          onClick={() => setShowSchematicLabels((prev) => !prev)}
                          className={`px-2 py-0.5 rounded cursor-pointer transition ${
                            !showSchematicLabels
                              ? 'bg-emerald-500 text-stone-950 font-extrabold'
                              : 'bg-stone-800 text-amber-300 font-bold border border-amber-500/40'
                          }`}
                        >
                          {!showSchematicLabels
                            ? t('🎮 Игра (Миниатюры)', '🎮 Game (Miniatures)')
                            : t('📐 Схема (Все подписи)', '📐 Schematic (Labels)')}
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-stone-800/80">
                      <span className="text-[10px] uppercase text-amber-300 font-bold">
                        {t('Атмосфера, залпы и инструменты:', 'Atmosphere, Salvos & Tools:')}
                      </span>
                      <div className="flex flex-wrap items-center gap-1">
                        <button
                          onClick={handleTriggerArtillerySmokeVfx}
                          className="px-2 py-0.5 rounded cursor-pointer transition bg-red-600/90 hover:bg-red-500 text-white font-extrabold shadow inline-flex items-center gap-1"
                          title={t('Дать залп из всех горных батарей и засек по колоннам РИ', 'Fire synchronized artillery & rifle salvo across the mountain passes')}
                        >
                          <UnicornCannonIcon className="w-3.5 h-3.5 shrink-0" />
                          <span>{t('Залп орудий', 'Fire Salvo')}</span>
                        </button>
                        <button
                          onClick={() => setGameCameraTilt((prev) => !prev)}
                          className={`px-2 py-0.5 rounded cursor-pointer transition ${
                            gameCameraTilt
                              ? 'bg-amber-500 text-stone-950 font-extrabold'
                              : 'bg-stone-900 text-stone-300 border border-stone-700'
                          }`}
                        >
                          🎥 {t('3D-Стол', '3D Tilt')}
                        </button>
                        <button
                          onClick={() => setShowDivanHall((prev) => !prev)}
                          className={`px-2 py-0.5 rounded cursor-pointer transition font-bold border ${
                            showDivanHall
                              ? 'bg-amber-500/25 border-amber-400 text-amber-200'
                              : 'bg-stone-900 border-stone-700 text-stone-300'
                          }`}
                        >
                          {showDivanHall ? t('🕯️ Зал Диван-ханы: вкл', '🕯️ Divan-Khana hall: on') : t('🗺️ Только карта', '🗺️ Map only')}
                        </button>
                        <button
                          onClick={handleCycleTimeOfDay}
                          className={`px-2 py-0.5 rounded cursor-pointer transition font-extrabold ${
                            dioramaTimeOfDay === 'night'
                              ? 'bg-indigo-600 text-indigo-100 border border-indigo-400'
                              : dioramaTimeOfDay === 'sunset'
                              ? 'bg-orange-600 text-amber-100 border border-orange-400'
                              : 'bg-stone-800 text-amber-300 border border-stone-700'
                          }`}
                        >
                          {dioramaTimeOfDay === 'night'
                            ? t('🌙 Ночь (+20%)', '🌙 Night (+20%)')
                            : dioramaTimeOfDay === 'sunset'
                            ? t('🌅 Закат (+10%)', '🌅 Sunset (+10%)')
                            : t('☀️ День', '☀️ Day')}
                        </button>
                        <button
                          onClick={() => {
                            const order = ['auto', 'thunderstorm', 'rain_clouds', 'snow_blizzard', 'eagles_clouds'];
                            setSkyWeatherMode(order[(order.indexOf(skyWeatherMode) + 1) % order.length]);
                          }}
                          className="px-2 py-0.5 rounded bg-indigo-950/90 hover:bg-indigo-900 border border-indigo-400/50 text-indigo-200 font-bold cursor-pointer transition"
                        >
                          {skyWeatherMode === 'auto'
                            ? `${t('🌦️ Сезон:', '🌦️ Season:')} ${t(seasonLabelRu, seasonLabelEn)}`
                            : skyWeatherMode === 'thunderstorm'
                            ? t('⛈️ Небо: Гроза', '⛈️ Sky: Thunderstorm')
                            : skyWeatherMode === 'rain_clouds'
                            ? t('🌧️ Небо: Ливень', '🌧️ Sky: Rain')
                            : skyWeatherMode === 'snow_blizzard'
                            ? t('❄️ Небо: Снег и буран', '❄️ Sky: Snow & blizzard')
                            : t('🦅 Небо: Ясно, стаи птиц', '🦅 Sky: Clear, bird flocks')}
                        </button>
                        <button
                          onClick={handleLaunchNightSortie}
                          className="px-2 py-0.5 rounded cursor-pointer transition bg-indigo-900/90 hover:bg-indigo-800 border border-indigo-400/60 text-indigo-200 font-extrabold"
                        >
                          🗡️ {t('Ночная вылазка', 'Night Sortie')}
                        </button>
                        <button
                          onClick={() => setAnimatedBattleVfx((prev) => !prev)}
                          className={`px-2 py-0.5 rounded cursor-pointer transition ${
                            animatedBattleVfx
                              ? 'bg-orange-500 text-stone-950 font-extrabold'
                              : 'bg-stone-900 text-stone-300 border border-stone-700'
                          }`}
                        >
                          💥 {t('Спецэффекты (VFX)', 'Battle VFX')}
                        </button>
                        <button
                          onClick={() => setShowThreatRadarOverlay((prev) => !prev)}
                          className={`px-2 py-0.5 rounded cursor-pointer transition ${
                            showThreatRadarOverlay
                              ? 'bg-rose-500 text-stone-950 font-extrabold'
                              : 'bg-stone-800 text-rose-300 border border-rose-500/40 font-bold'
                          }`}
                        >
                          📡 {t('Радар угроз', 'Threat Radar')}
                        </button>
                        <button
                          onClick={() => setShowQuickPrologue((prev) => !prev)}
                          className={`px-2 py-0.5 rounded cursor-pointer transition font-bold border ${
                            showQuickPrologue
                              ? 'bg-amber-500/30 border-amber-400 text-amber-200'
                              : 'bg-stone-900 border-stone-700 text-stone-300'
                          }`}
                        >
                          🧭 {t('Пролог (3 шага)', 'Prologue (3 steps)')}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {showHeroArcsDrawer && (
                  <div className="pt-2 mt-1.5 border-t border-emerald-500/40 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                      <span className="font-serif font-bold text-emerald-200">
                        ⚔️ {t('СУДЬБЫ ГЕРОЕВ ИМАМАТА: ЛИЧНЫЕ СЮЖЕТНЫЕ ЦЕПОЧКИ (АКТЫ I–III):', 'HEROES OF THE IMAMATE: PERSONAL 3-ACT STORY ARCS:')}
                      </span>
                      <span className="text-stone-400 text-[10.5px]">
                        {t(
                          `Завершено судеб: ${completedHeroArcsCount}/3 • Каждая развязка дарует 👑 золотой венец 3D-отряду и открывает Реликвию`,
                          `Completed Arcs: ${completedHeroArcsCount}/3 • Completing Act III grants a 👑 3D Golden Crown & unlocks a signature Relic`
                        )}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                      {HERO_STORY_ARCS.map((arc) => {
                        const st = heroArcsState?.[arc.id] || { stage: 0, completed: false };
                        const stageIdx = Math.min(arc.chapters.length - 1, st.stage || 0);
                        const curChap = arc.chapters[stageIdx];
                        const linkedNaib = naibates.find((n) => n.id === arc.naibateId);
                        const linkedUnit = liveFieldUnits.find((u) => u.id === arc.unitId);
                        const naibMem = linkedNaib ? getNaibLoyaltyMemory(linkedNaib) : null;
                        return (
                          <div
                            key={arc.id}
                            className={`rounded-xl border p-2.5 flex flex-col justify-between gap-2 transition ${
                              st.completed
                                ? 'bg-gradient-to-br from-[#1b1609] to-[#121612] border-amber-400/75 shadow-lg'
                                : 'bg-[#13110e] border-stone-700/90 hover:border-emerald-400/60'
                            }`}
                          >
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2.5">
                                <img
                                  src={resolveMediaAsset(arc.portraitUrl)}
                                  alt={arc.heroNameRu}
                                  className="w-12 h-14 rounded-lg object-cover object-top border border-amber-500/60 shrink-0 shadow"
                                />
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="font-serif font-extrabold text-[11.5px] text-amber-100 truncate">
                                      {st.completed ? '👑 ' : ''}
                                      {t(arc.heroNameRu, arc.heroNameEn)}
                                    </span>
                                  </div>
                                  <div className="text-[9.5px] text-amber-400/90 font-mono truncate">
                                    {t(arc.epithetRu, arc.epithetEn)}
                                  </div>
                                  <div className="flex items-center gap-1 mt-1">
                                    {[0, 1, 2].map((idx) => {
                                      const done = st.completed || (st.stage || 0) > idx;
                                      const active = !st.completed && (st.stage || 0) === idx;
                                      return (
                                        <span
                                          key={idx}
                                          className={`px-1.5 py-0.5 rounded text-[8.5px] font-mono font-bold ${
                                            done
                                              ? 'bg-emerald-500 text-stone-950'
                                              : active
                                              ? 'bg-amber-400 text-stone-950'
                                              : 'bg-stone-900 text-stone-500 border border-stone-800'
                                          }`}
                                        >
                                          {t(`Акт ${idx + 1}`, `Act ${idx + 1}`)} {done ? '✓' : ''}
                                        </span>
                                      );
                                    })}
                                    {linkedUnit && (
                                      <span className="ml-auto text-[9px] font-mono text-emerald-300 font-bold">
                                        ⚔️ {linkedUnit.sabers ?? 180}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="text-[10px] text-stone-300 leading-snug bg-black/35 rounded px-2 py-1 border border-stone-800/80">
                                {st.completed ? (
                                  st.outcome === 'tragic_departure' ? (
                                    <span className="text-rose-300 font-semibold">
                                      📜 {t('Исторический разлом 1851 г.: гарнизон Хунзаха реорганизован под властью Диван-ханы.', '1851 Historical Rift: Khunzakh Murtazek garrison reorganized under Divan-Khana command.')}
                                    </span>
                                  ) : (
                                    <span className="text-amber-300 font-semibold">
                                      👑 {t('Все 3 главы свершились! Отряд обрёл легендарный венец в 3D и реликвию.', 'All 3 Acts fulfilled! Unit crowned in 3D & signature Relic unlocked.')}
                                    </span>
                                  )
                                ) : (
                                  <>
                                    <span className="text-amber-300 font-bold">
                                      {t(curChap.actLabelRu, curChap.actLabelEn)}:{' '}
                                    </span>
                                    <span>{t(curChap.titleRu, curChap.titleEn)}</span>
                                  </>
                                )}
                              </div>
                              {naibMem && (
                                <div className="text-[9.5px] text-stone-400 truncate">
                                  {naibMem.icon} {t(naibMem.badgeRu, naibMem.badgeEn)}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5 pt-0.5">
                              <button
                                type="button"
                                onClick={() => handleOpenHeroArcModal && handleOpenHeroArcModal(arc.id)}
                                className={`flex-1 px-2 py-1 rounded-lg font-serif font-extrabold text-[10.5px] cursor-pointer transition ${
                                  st.completed
                                    ? st.outcome === 'tragic_departure'
                                      ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-400/55'
                                      : 'bg-amber-500/25 hover:bg-amber-500/35 text-amber-200 border border-amber-400/60'
                                    : 'bg-emerald-500 hover:bg-emerald-400 text-stone-950 shadow'
                                }`}
                              >
                                {st.completed
                                  ? `${st.outcome === 'tragic_departure' ? '📜' : '👑'} ${t('Итог судьбы', 'View Destiny')}`
                                  : `📜 ${t(`Принять решение (Глава ${(st.stage || 0) + 1})`, `Decide (Act ${(st.stage || 0) + 1})`)}`}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (setSelectedNaibateId) setSelectedNaibateId(arc.naibateId);
                                  if (setSelectedUnitId) setSelectedUnitId(arc.unitId);
                                  if (linkedUnit) flyCameraTo(linkedUnit.x, linkedUnit.y, 1.65);
                                }}
                                className="px-2 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 text-amber-200 border border-stone-700 text-[10px] font-bold cursor-pointer transition"
                                title={t('Навести камеру на героя и выбрать его сотню', 'Focus camera on hero & select squadron')}
                              >
                                🎯 {t('Отряд', 'Unit')}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {showRelicsDrawer && (
                  <div className="pt-2 mt-1.5 border-t border-amber-500/35 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                      <span className="font-serif font-bold text-amber-200">
                        🏛️ {t('СОКРОВИЩНИЦА РЕЛИКВИЙ ДИВАН-ХАНЫ (МЕТА-ПРОГРЕССИЯ КАМПАНИЙ):', 'DIVAN-KHANA RELICS TREASURY (CAMPAIGN META-PROGRESSION):')}
                      </span>
                      <span className="text-stone-400 text-[10.5px]">
                        {t(
                          `Открыто: ${unlockedRelicIds.length}/${IMAMAT_RELICS_CATALOG.length} • Активно в походе: ${activeRelicIds.length}/2 (клик для выбора)`,
                          `Unlocked: ${unlockedRelicIds.length}/${IMAMAT_RELICS_CATALOG.length} • Equipped: ${activeRelicIds.length}/2 (click to toggle)`
                        )}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {IMAMAT_RELICS_CATALOG.map((rel) => {
                        const isUnlocked = unlockedRelicIds.includes(rel.id);
                        const isActive = activeRelicIds.includes(rel.id);
                        return (
                          <button
                            key={rel.id}
                            type="button"
                            disabled={!isUnlocked}
                            onClick={() => handleToggleActiveRelic && handleToggleActiveRelic(rel.id)}
                            className={`text-left p-2 rounded-lg border transition ${
                              isActive
                                ? 'bg-amber-500/20 border-amber-400 text-amber-100 shadow cursor-pointer'
                                : isUnlocked
                                ? 'bg-[#14110e] hover:bg-stone-900 border-stone-700 text-stone-200 cursor-pointer'
                                : 'bg-stone-950/70 border-stone-800/80 text-stone-500 opacity-75 cursor-not-allowed'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1.5">
                              <span className="font-serif font-bold text-[11px] truncate">
                                {rel.icon} {t(rel.titleRu, rel.titleEn)}
                              </span>
                              <span
                                className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold shrink-0 ${
                                  isActive
                                    ? 'bg-amber-400 text-stone-950'
                                    : isUnlocked
                                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                                    : 'bg-stone-900 text-stone-500'
                                }`}
                              >
                                {isActive
                                  ? t('В ПОХОДЕ', 'ACTIVE')
                                  : isUnlocked
                                  ? t('ОТКРЫТО', 'UNLOCKED')
                                  : t('ЗАКРЫТО', 'LOCKED')}
                              </span>
                            </div>
                            <div className="text-[10px] text-emerald-300/90 mt-0.5">
                              {t(rel.bonusSummaryRu, rel.bonusSummaryEn)}
                            </div>
                            <div className="text-[9.5px] text-stone-400 mt-0.5">
                              {isUnlocked
                                ? t(rel.originRu, rel.originEn)
                                : `🔒 ${t(rel.unlockCondRu, rel.unlockCondEn)}`}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* СРОЧНЫЙ ВЫЗОВ В 3D-БОЙ ДЛЯ ОСАЖДЁННОГО АУЛА (1 клик прямо над 3D-картой) */}
              {selectedNaibate?.underSiege && !activeTacticalEncounter && handleOpenBattlePrelude && (
                <div className="flex flex-wrap items-center justify-between gap-2 bg-gradient-to-r from-rose-950/90 via-[#1f1210] to-[#121614] border border-rose-500/65 rounded-xl px-3 py-1.5 text-xs shadow-lg">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-rose-600 text-white font-serif font-extrabold text-[10px] uppercase">
                      🔥 {t('Осада аула', 'Aul Under Siege')}
                    </span>
                    <span className="font-serif font-bold text-amber-100">
                      {t(
                        `Округ «${selectedNaibate.name}» (${selectedNaibate.naibName}) штурмуют войска РИ (${selectedNaibate.imperialPressure}% натиска)`,
                        `“${selectedNaibate.nameEn || selectedNaibate.name}” (${selectedNaibate.naibNameEn || selectedNaibate.naibName}) is besieged (${selectedNaibate.imperialPressure}% pressure)`
                      )}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenBattlePrelude(null, selectedNaibate.id)}
                    className="px-3 py-1 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-stone-950 font-serif font-extrabold text-[11px] cursor-pointer shadow"
                  >
                    ⚔️ {t('Возглавить 3D-прорыв осады →', 'Lead 3D Siege Relief →')}
                  </button>
                </div>
              )}

              {/* РЕЛЯЦИЯ С ПОЛЯ 3D-БОЯ НАД КАРТОЙ ПОСЛЕ ПОБЕДЫ / СХВАТКИ */}
              {lastBattleAfterActionReport && !activeTacticalEncounter && (
                <div className="relative hud-walnut-bezel bg-gradient-to-r from-[#1f1810] via-[#17130e] to-[#0f1916] border-2 border-emerald-400/65 rounded-xl p-3 shadow-2xl space-y-2">
                  <span className="hud-brass-corner tl" />
                  <span className="hud-brass-corner tr" />
                  <span className="hud-brass-corner bl" />
                  <span className="hud-brass-corner br" />
                  <div className="flex flex-wrap items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <PortraitMedallion
                        src={findPortrait(lastBattleAfterActionReport.commanderRu)}
                        name={lastBattleAfterActionReport.commanderRu}
                        color={lastBattleAfterActionReport.isVictory ? '#10b981' : '#f59e0b'}
                        size={44}
                        selected
                      />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-serif uppercase tracking-wider font-extrabold">
                          <span
                            className={`px-2 py-0.5 rounded border ${
                              lastBattleAfterActionReport.isVictory
                                ? 'bg-emerald-500/20 border-emerald-400/70 text-emerald-200'
                                : 'bg-amber-500/20 border-amber-400/70 text-amber-200'
                            }`}
                          >
                            {lastBattleAfterActionReport.isVictory
                              ? t('★ РЕЛЯЦИЯ О ПОБЕДЕ В 3D-БОЮ', '★ 3D BATTLE VICTORY DISPATCH')
                              : t('⚔️ РЕЛЯЦИЯ С РУБЕЖА', '⚔️ BATTLEFIELD REPORT')}
                          </span>
                          <span className="text-amber-300/90 hud-num">
                            {t('Ход', 'Turn')} #{lastBattleAfterActionReport.turn} •{' '}
                            {t(lastBattleAfterActionReport.seasonRu, lastBattleAfterActionReport.seasonEn)}
                          </span>
                        </div>
                        <div className="text-xs sm:text-sm font-serif font-extrabold text-amber-100 truncate">
                          {t(lastBattleAfterActionReport.titleRu, lastBattleAfterActionReport.titleEn)}
                        </div>
                        <div className="text-[11px] text-stone-300">
                          {t(lastBattleAfterActionReport.commanderRu, lastBattleAfterActionReport.commanderEn)} •{' '}
                          <span className="text-amber-200/90">
                            {t(lastBattleAfterActionReport.locationRu, lastBattleAfterActionReport.locationEn)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] hud-num">
                      <span className="px-2 py-1 rounded bg-rose-950/85 border border-rose-500/50 text-rose-200 font-bold">
                        -{lastBattleAfterActionReport.enemyLoss} {t('шт. РИ (колонна отступает!)', 'bay. (retreating!)')}
                      </span>
                      <span className="px-2 py-1 rounded bg-stone-900 border border-stone-700 text-stone-300">
                        -{lastBattleAfterActionReport.muridLoss} {t('саб.', 'sab.')}
                      </span>
                      <span className="px-2 py-1 rounded bg-emerald-950/85 border border-emerald-500/50 text-emerald-200 font-bold">
                        +{lastBattleAfterActionReport.powderGain}{t('п', 'p')} • +{lastBattleAfterActionReport.silverGain}₽
                        {lastBattleAfterActionReport.capturedUnicorn ? ' • +1💣 единорог • +1★' : ''}
                      </span>
                      <button
                        onClick={() => setActiveTab('chronicle')}
                        className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/35 border border-amber-400/60 text-amber-200 font-serif font-bold cursor-pointer"
                      >
                        📜 {t('Летопись', 'Chronicle')}
                      </button>
                      {setLastBattleAfterActionReport && (
                        <button
                          onClick={() => setLastBattleAfterActionReport(null)}
                          aria-label={t('Свернуть реляцию', 'Dismiss report')}
                          className="px-2 py-1 rounded bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 cursor-pointer"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ПРЕДБОЕВОЙ СОВЕТ ДИВАН-ХАНЫ ПРЯМО НАД 3D-КАРТОЙ КАВКАЗА (ВЫБОР ДОКТРИНЫ + БЕСШОВНЫЙ ВХОД В 3D-БИТВУ) */}
              {activeTacticalEncounter && (() => {
                const curDoc = activeTacticalEncounter.selectedDoctrineId || 'lava_charge';
                const docWinBonus = curDoc === 'safarov_mine' ? 8 : curDoc === 'ridge_snipers' ? 4 : 3;
                const shownWinOdds = Math.min(96, (activeTacticalEncounter.winChancePct ?? 62) + docWinBonus);
                const shownMuridLoss =
                  curDoc === 'ridge_snipers'
                    ? Math.max(10, Math.round((activeTacticalEncounter.autoResolveMuridLoss || 42) * 0.68))
                    : activeTacticalEncounter.autoResolveMuridLoss || 42;
                const isForestRec = activeTacticalEncounter.recommendedTacticalMode === 'spline_ambush';
                return (
                  <div className="relative hud-walnut-bezel bg-gradient-to-r from-[#220e0d] via-[#191310] to-[#101620] border-2 border-amber-400/80 rounded-xl p-3 shadow-2xl space-y-2.5">
                    <span className="hud-brass-corner tl" />
                    <span className="hud-brass-corner tr" />
                    <span className="hud-brass-corner bl" />
                    <span className="hud-brass-corner br" />
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <PortraitMedallion
                          src={findPortrait(activeTacticalEncounter.unitCommanderRu, activeTacticalEncounter.unitId)}
                          name={activeTacticalEncounter.unitCommanderRu || activeTacticalEncounter.unitNameRu}
                          color="#10b981"
                          size={44}
                          selected
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 text-[10px] font-serif uppercase tracking-wider text-emerald-300 font-bold">
                            <ShashkaSabersIcon className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{t('Сотня Имамата', 'Imamate Force')}</span>
                            {activeTacticalEncounter.unitVetStars > 0 && (
                              <span className="text-amber-300">{'★'.repeat(activeTacticalEncounter.unitVetStars)}</span>
                            )}
                          </div>
                          <div className="text-xs sm:text-sm font-serif font-bold text-amber-100 truncate">
                            {t(activeTacticalEncounter.unitNameRu, activeTacticalEncounter.unitNameEn)}
                          </div>
                          <div className="hud-num text-[11px] text-emerald-300 font-semibold">
                            {activeTacticalEncounter.unitSabers ?? 540} {t('сабель в строю', 'sabers ready')}
                            {(activeTacticalEncounter.unitCapturedGuns || 0) > 0
                              ? ` • +${activeTacticalEncounter.unitCapturedGuns}💣`
                              : ''}
                            {(activeTacticalEncounter.unitMedalsCount || 0) > 0
                              ? ` • 🥈×${activeTacticalEncounter.unitMedalsCount}`
                              : ''}
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 min-w-[230px] max-w-md space-y-1">
                        <div className="flex items-center justify-between text-[10.5px] font-serif font-bold">
                          <span className="text-amber-300 flex items-center gap-1">
                            <WaxSealIcon className="w-3.5 h-3.5 text-amber-400" />
                            <span>{t('ПРЕДБОЕВОЙ СОВЕТ В ТЕСНИНЕ', 'PRE-BATTLE DEFILE COUNCIL')}</span>
                          </span>
                          <span className="hud-num px-2 py-0.5 rounded bg-amber-500/20 border border-amber-400/50 text-amber-200">
                            {t('Шанс победы:', 'Win odds:')} {shownWinOdds}%
                          </span>
                        </div>
                        <div className="h-2.5 rounded-full bg-rose-950/90 border border-amber-500/40 overflow-hidden flex">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-amber-300 transition-all duration-300"
                            style={{ width: `${Math.max(15, Math.min(92, shownWinOdds))}%` }}
                          />
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-1.5 text-[10px] hud-num text-stone-300">
                          <span className="px-1.5 py-0.5 rounded bg-stone-900/90 border border-stone-700/80 inline-flex items-center gap-1">
                            <MountainPeakIcon className="w-3 h-3 text-sky-300" />
                            <span>
                              {activeTacticalEncounter.elevationMeters}{t('м', 'm')} • {activeTacticalEncounter.slopeDeg}°
                            </span>
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-stone-900/90 border border-stone-700/80">
                            {t(activeTacticalEncounter.weatherBadgeRu, activeTacticalEncounter.weatherBadgeEn)}
                          </span>
                          {activeTacticalEncounter.supplyCut && (
                            <span className="px-1.5 py-0.5 rounded bg-orange-950/80 border border-orange-400/70 text-orange-200 font-bold inline-flex items-center gap-1">
                              <SeveredConvoyIcon className="w-3 h-3 text-orange-300" />
                              <span>{t('Обоз РИ отрезан (-25%)', 'Supply Cut (-25%)')}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="min-w-0 text-right">
                          <div className="flex items-center justify-end gap-1.5 text-[10px] font-serif uppercase tracking-wider text-rose-300 font-bold">
                            <span>{t('Кавказский корпус', 'Caucasian Corps')}</span>
                            <ImperialEagleIcon className="w-3.5 h-3.5 text-rose-400" />
                          </div>
                          <div className="text-xs sm:text-sm font-serif font-bold text-rose-100 truncate">
                            {t(activeTacticalEncounter.columnNameRu, activeTacticalEncounter.columnNameEn)}
                          </div>
                          <div className="hud-num text-[11px] text-rose-300 font-semibold">
                            {activeTacticalEncounter.remainingBayonets} {t('штыков', 'bayonets')}
                          </div>
                        </div>
                        <PortraitMedallion
                          src={findPortrait(activeTacticalEncounter.columnNameRu, activeTacticalEncounter.columnId)}
                          name={activeTacticalEncounter.columnNameRu}
                          color="#ef4444"
                          size={44}
                        />
                        <button
                          onClick={() => setActiveTacticalEncounter(null)}
                          aria-label={t('Скрыть совет боя', 'Dismiss battle council')}
                          className="ml-1 px-2 py-1 rounded bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 text-xs cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    {/* Выбор предбоевой тактики горцев (напрямую влияет на 3D-бой и авторасчёт) */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 pt-1 border-t border-stone-800/90 text-[10.5px]">
                      {[
                        {
                          id: 'lava_charge',
                          titleRu: '🦅 Конно-кинжальная лава',
                          titleEn: '🦅 Cavalry & Kindjal Shock',
                          descRu: '+30% трофеев пороха и казны, мощнее вылазки',
                          descEn: '+30% captured powder & silver, stronger charges'
                        },
                        {
                          id: 'ridge_snipers',
                          titleRu: '🎯 Штуцерные заслоны на гребнях',
                          titleEn: '🎯 Ridge Rifle Screens',
                          descRu: '-35% наших потерь • старт с 21 газырём',
                          descEn: '-35% Murid casualties • start with 21 gazyrs'
                        },
                        {
                          id: 'safarov_mine',
                          titleRu: '🧨 Минный горн Сафарова',
                          titleEn: '🧨 Safarov Powder Mine',
                          descRu: '1-й подрыв камуфлета бесплатно (0п) и +8% шанс',
                          descEn: 'Free 1st camouflet mine (0p) & +8% win odds'
                        }
                      ].map((doc) => {
                        const isSel = curDoc === doc.id;
                        return (
                          <button
                            key={doc.id}
                            type="button"
                            onClick={() =>
                              setActiveTacticalEncounter((prev) =>
                                prev ? { ...prev, selectedDoctrineId: doc.id } : prev
                              )
                            }
                            className={`text-left px-2.5 py-1.5 rounded-lg border cursor-pointer transition ${
                              isSel
                                ? 'bg-amber-500/20 border-amber-400 text-amber-100 shadow'
                                : 'bg-[#120f0c] hover:bg-stone-900 border-stone-800 text-stone-300'
                            }`}
                          >
                            <div className="font-serif font-bold flex items-center justify-between">
                              <span>{t(doc.titleRu, doc.titleEn)}</span>
                              {isSel && <span className="text-amber-300 text-[9.5px]">✓</span>}
                            </div>
                            <div className="text-[9.5px] text-emerald-300/90">{t(doc.descRu, doc.descEn)}</div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-amber-500/25">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          onClick={() => handleEnterTacticalEncounter(activeTacticalEncounter, 'auto')}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-b from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-stone-950 font-serif text-xs font-extrabold cursor-pointer shadow-lg ring-1 ring-amber-200"
                        >
                          <ShashkaSabersIcon className="w-3.5 h-3.5 text-stone-950" />
                          <span>
                            {isForestRec
                              ? t('⚔️ Вступить в 3D-Бой (Лесная засада)', '⚔️ Enter 3D Battle (Forest Ambush)')
                              : t('⚔️ Вступить в 3D-Бой (Осада ущелья)', '⚔️ Enter 3D Battle (Gorge Siege)')}
                          </span>
                        </button>
                        <button
                          onClick={() =>
                            handleEnterTacticalEncounter(
                              activeTacticalEncounter,
                              isForestRec ? 'siege' : 'spline'
                            )
                          }
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-900/80 hover:bg-emerald-800 border border-emerald-400/55 text-emerald-100 font-serif text-[11px] font-bold cursor-pointer"
                        >
                          <UnicornCannonIcon className="w-3.5 h-3.5 text-amber-200" />
                          <span>
                            {isForestRec
                              ? t('🏰 Или бой у скального аула', '🏰 Or Rock Aul Siege')
                              : t('🌲 Или лесная засада', '🌲 Or Forest Ambush')}
                          </span>
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        {handleAutoResolveEncounter && (
                          <button
                            onClick={() => handleAutoResolveEncounter(activeTacticalEncounter)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-950/90 hover:bg-amber-900 border border-amber-400/70 text-amber-200 font-serif text-xs font-bold cursor-pointer"
                          >
                            <WaxSealIcon className="w-3.5 h-3.5 text-amber-300" />
                            <span className="hud-num">
                              {t(
                                `Авторасчёт наиба (${shownWinOdds}% • -${shownMuridLoss} саб.)`,
                                `Auto-Resolve (${shownWinOdds}% • -${shownMuridLoss} sab.)`
                              )}
                            </span>
                          </button>
                        )}
                        {handleRetreatFromEncounter && (
                          <button
                            onClick={() => handleRetreatFromEncounter(activeTacticalEncounter)}
                            className="px-2.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 text-xs font-semibold cursor-pointer"
                          >
                            ↩ {t('Отход (-12 саб.)', 'Withdraw (-12 sab.)')}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* 3D НАСТОЛЬНАЯ ВОЕННАЯ ДИОРАМА КАВКАЗА: рельефная карта в резной орехово-латунной оправе Диван-ханы */}
              <div
                className={`relative isolate rounded-2xl overflow-hidden transition-[padding] duration-300 ${
                  showDivanHall ? 'p-2 sm:p-3.5 md:p-4' : ''
                }`}
                style={
                  showDivanHall
                    ? {
                        backgroundImage:
                          `radial-gradient(ellipse at center, rgba(9,11,16,0.12) 32%, rgba(9,11,16,0.84) 100%), url("${resolveMediaAsset('DivanKhana_Table_Diorama_1845.jpg')}")`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center 62%'
                      }
                    : undefined
                }
              >
              <div
                className="relative rounded-2xl overflow-hidden border-4 border-[#8a5d29] hud-walnut-bezel bg-[#0d1110] shadow-[0_22px_50px_rgba(0,0,0,0.9)] transition-transform duration-500"
                style={
                  gameCameraTilt && !real3DTableMode
                    ? {
                        transform: 'perspective(1350px) rotateX(11deg) scale(1.01)',
                        transformOrigin: 'center 58%',
                        boxShadow: '0 26px 55px rgba(0, 0, 0, 0.92), inset 0 0 28px rgba(245, 158, 11, 0.22)'
                      }
                    : undefined
                }
              >
                <div className="relative">
                {real3DTableMode ? (
                  <CaucasusTable3DViewport
                    naibates={naibates}
                    capitalNaibateId={capitalNaibateId}
                    capitalLabelRu={capitalLabelRu}
                    capitalLabelEn={capitalLabelEn}
                    imperialHeldIds={imperialHeldIds}
                    seasonPhase={seasonPhase}
                    externalCameraCmd={extCamCmd}
                    liveFieldUnits={liveFieldUnits}
                    liveImperialColumns={liveImperialColumns}
                    cordonFortresses={cordonFortresses}
                    riverBridges={riverBridges}
                    signalBeacons={signalBeacons}
                    battleMemorials={battleMemorials}
                    selectedNaibateId={selectedNaibateId}
                    selectedUnitId={selectedUnitId}
                    dioramaTimeOfDay={dioramaTimeOfDay}
                    handleCycleTimeOfDay={handleCycleTimeOfDay}
                    handleCycleSeason3D={() =>
                      setSeason3DOverride((prev) => {
                        const cur = prev || baseSeasonPhase;
                        const next = cur === 'summer' ? 'autumn' : cur === 'autumn' ? 'winter' : 'summer';
                        setSkyWeatherMode(next === 'winter' ? 'snow_blizzard' : 'eagles_clouds');
                        return next;
                      })
                    }
                    weatherOverlayEnabled={weatherOverlayEnabled}
                    soundEnabled={soundEnabled}
                    setSelectedNaibateId={setSelectedNaibateId}
                    setSelectedUnitId={setSelectedUnitId}
                    setHoveredMapInfo={setHoveredMapInfo}
                    handleInterceptImperialColumn={handleInterceptImperialColumn}
                    handleSeverColumnSupplyLine={handleSeverColumnSupplyLine}
                    handleToggleRiverBridge={handleToggleRiverBridge}
                    handleToggleSignalBeacon={handleToggleSignalBeacon}
                    handleStrategicMapClick={(mx, my) =>
                      handleCommandUnitMoveToPoint(selectedUnitId, mx, my)
                    }
                    t={t}
                  />
                ) : (
                <>
                {/* Чеканные латунные угловые накладки и градусная сетка штабного стола XIX в. (pointer-events-none, 0 влияния на проекцию клика) */}
                <div className="pointer-events-none absolute inset-0 z-10 border border-amber-400/25 rounded-t-xl">
                  <span className="hud-brass-corner absolute top-1 left-1 w-3.5 h-3.5 rounded-br border border-amber-300/60 opacity-85" />
                  <span className="hud-brass-corner absolute top-1 right-1 w-3.5 h-3.5 rounded-bl border border-amber-300/60 opacity-85" />
                  <span className="hud-brass-corner absolute bottom-1 left-1 w-3.5 h-3.5 rounded-tr border border-amber-300/60 opacity-85" />
                  <span className="hud-brass-corner absolute bottom-1 right-1 w-3.5 h-3.5 rounded-tl border border-amber-300/60 opacity-85" />
                  <span className="hidden md:inline-block absolute top-1.5 left-6 px-1.5 py-0.5 rounded bg-black/55 border border-amber-500/25 text-[8.5px] font-serif tracking-wider text-amber-200/80">
                    43°15′ С.Ш. • 45°40′ В.Д. — {t('Карта Кавказского Имамата, 1845 г.', 'Caucasus Imamate Staff Map, 1845')}
                  </span>
                  <span className="hidden md:inline-block absolute bottom-1.5 left-6 px-1.5 py-0.5 rounded bg-black/55 border border-amber-500/25 text-[8.5px] font-serif tracking-wider text-amber-200/75 hud-num">
                    {t('Масштаб: 15 вёрст в дюйме', 'Scale: 15 Versts / Inch')}
                  </span>
                </div>
                <svg
                  ref={svgRef}
                  viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
                  onClickCapture={handleClickCapture}
                  onClick={handleStrategicMapClick}
                  onMouseEnter={() => setIsPointerOnMap(true)}
                  onMouseMove={(e) => {
                    if (!isPointerOnMap) setIsPointerOnMap(true);
                    handleStrategicMapMouseMove(e);
                  }}
                  onMouseLeave={() => {
                    setIsPointerOnMap(false);
                    setHoveredMapInfo(null);
                    dragRef.current = null;
                  }}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  className={`w-full h-auto select-none block ${mapZoom > ZOOM_MIN ? 'cursor-grab active:cursor-grabbing' : 'cursor-crosshair'}`}
                  style={{ touchAction: mapZoom > ZOOM_MIN ? 'none' : 'auto' }}
                >
                  <defs>
                    <pattern id="mapGrid" width="35" height="35" patternUnits="userSpaceOnUse">
                      <path
                        d="M 35 0 L 0 0 0 35"
                        fill="none"
                        stroke="#fef3c7"
                        strokeWidth="0.35"
                        strokeOpacity="0.22"
                      />
                    </pattern>
                    <linearGradient id="topVignette" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#090b10" stopOpacity="0.72" />
                      <stop offset="100%" stopColor="#090b10" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="bottomVignette" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#090b10" stopOpacity="0.0" />
                      <stop offset="100%" stopColor="#090b10" stopOpacity="0.78" />
                    </linearGradient>
                    <radialGradient id="sunlightGlow" cx="35%" cy="28%" r="70%">
                      <stop offset="0%" stopColor="#fde68a" stopOpacity="0.14" />
                      <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.04" />
                      <stop offset="100%" stopColor="#090b10" stopOpacity="0.22" />
                    </radialGradient>
                    <radialGradient id="sunsetDuskGlow" cx="25%" cy="20%" r="80%">
                      <stop offset="0%" stopColor="#fb923c" stopOpacity="0.28" />
                      <stop offset="55%" stopColor="#9a3412" stopOpacity="0.24" />
                      <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0.45" />
                    </radialGradient>
                    <radialGradient id="nightMoonGlow" cx="68%" cy="22%" r="85%">
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.16" />
                      <stop offset="45%" stopColor="#1e1b4b" stopOpacity="0.46" />
                      <stop offset="100%" stopColor="#020617" stopOpacity="0.68" />
                    </radialGradient>
                    <filter id="miniatureShadow" x="-30%" y="-30%" width="160%" height="160%">
                      <feDropShadow dx="0" dy="3.2" stdDeviation="2.2" floodColor="#000000" floodOpacity="0.82" />
                    </filter>
                    {/* Быстрые GPU-радиальные градиенты для живых погодных фронтов и вечных ледников (0% CPU feTurbulence / mask) */}
                    <radialGradient id="wfShadowRadGrad" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#020617" stopOpacity="0.52" />
                      <stop offset="56%" stopColor="#020617" stopOpacity="0.22" />
                      <stop offset="100%" stopColor="#020617" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id="wfStormCloudRadGrad" cx="46%" cy="42%" r="50%">
                      <stop offset="0%" stopColor="#334155" stopOpacity="0.56" />
                      <stop offset="52%" stopColor="#0f172a" stopOpacity="0.4" />
                      <stop offset="84%" stopColor="#0f172a" stopOpacity="0.12" />
                      <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id="wfSnowCloudRadGrad" cx="46%" cy="40%" r="50%">
                      <stop offset="0%" stopColor="#f8fafc" stopOpacity="0.46" />
                      <stop offset="54%" stopColor="#bae6fd" stopOpacity="0.24" />
                      <stop offset="100%" stopColor="#bae6fd" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id="wfMistCloudRadGrad" cx="48%" cy="46%" r="50%">
                      <stop offset="0%" stopColor="#f1f5f9" stopOpacity="0.38" />
                      <stop offset="56%" stopColor="#cbd5e1" stopOpacity="0.18" />
                      <stop offset="100%" stopColor="#94a3b8" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id="wfLightningGlowRadGrad" cx="50%" cy="46%" r="50%">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.58" />
                      <stop offset="42%" stopColor="#bae6fd" stopOpacity="0.24" />
                      <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                    </radialGradient>
                    <linearGradient id="eternalGlacierSouthGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0" />
                      <stop offset="48%" stopColor="#e0f2fe" stopOpacity="0.14" />
                      <stop offset="100%" stopColor="#f8fafc" stopOpacity="0.36" />
                    </linearGradient>
                    <linearGradient id="towerStoneGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#a8a29e" />
                      <stop offset="46%" stopColor="#57534e" />
                      <stop offset="100%" stopColor="#1c1917" />
                    </linearGradient>
                    <linearGradient id="stoneWallLitGrad" x1="0" y1="0" x2="0.8" y2="1">
                      <stop offset="0%" stopColor="#d6d3d1" />
                      <stop offset="55%" stopColor="#a8a29e" />
                      <stop offset="100%" stopColor="#57534e" />
                    </linearGradient>
                    <linearGradient id="stoneWallShadeGrad" x1="0" y1="0" x2="0.4" y2="1">
                      <stop offset="0%" stopColor="#57534e" />
                      <stop offset="55%" stopColor="#292524" />
                      <stop offset="100%" stopColor="#0c0a09" />
                    </linearGradient>
                    <radialGradient id="fortGlacisGrad" cx="45%" cy="40%" r="60%">
                      <stop offset="0%" stopColor="#3f6212" stopOpacity="0.95" />
                      <stop offset="58%" stopColor="#292524" stopOpacity="0.96" />
                      <stop offset="100%" stopColor="#090b10" stopOpacity="0.98" />
                    </radialGradient>
                    <linearGradient id="fortBastionWallGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#d6d3d1" />
                      <stop offset="48%" stopColor="#78716c" />
                      <stop offset="100%" stopColor="#292524" />
                    </linearGradient>
                    <linearGradient id="bronzeCannonGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#fef08a" />
                      <stop offset="45%" stopColor="#d97706" />
                      <stop offset="100%" stopColor="#78350f" />
                    </linearGradient>
                    <linearGradient id="citadelGoldGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#fef08a" />
                      <stop offset="50%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#92400e" />
                    </linearGradient>
                    {/* Сезонные градиенты рельефа (Total War / Manor Lords style): зимний снежный покров и осеннее золото буковых лесов */}
                    <linearGradient id="winterSnowCoverGrad" x1="0" y1="1" x2="0" y2="0">
                      <stop offset="0%" stopColor="#f0f9ff" stopOpacity="0.62" />
                      <stop offset="48%" stopColor="#e0f2fe" stopOpacity="0.34" />
                      <stop offset="85%" stopColor="#bae6fd" stopOpacity="0.14" />
                      <stop offset="100%" stopColor="#bae6fd" stopOpacity="0.04" />
                    </linearGradient>
                    <radialGradient id="autumnBeechForestGrad" cx="32%" cy="42%" r="42%">
                      <stop offset="0%" stopColor="#ea580c" stopOpacity="0.34" />
                      <stop offset="55%" stopColor="#d97706" stopOpacity="0.22" />
                      <stop offset="100%" stopColor="#78350f" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id="cordonFogShroudGrad" cx="50%" cy="48%" r="50%">
                      <stop offset="0%" stopColor="#090d16" stopOpacity="0.72" />
                      <stop offset="58%" stopColor="#0f172a" stopOpacity="0.46" />
                      <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
                    </radialGradient>
                    <marker
                      id="imperialStrikeArrow"
                      viewBox="0 0 10 10"
                      refX="7"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 1 L 10 5 L 0 9 z" fill="#ef4444" />
                    </marker>
                  </defs>

                  {/* ИГРОВОЕ ПОЛЕ: встроенный Data URI рельефа Восточного Кавказа (работает 100% автономно без внешних .jpg!) */}
                  <image
                    href={SRTM_SUMMER_RELIEF_DATA_URI}
                    x="0"
                    y="0"
                    width="700"
                    height="460"
                    preserveAspectRatio="none"
                    opacity={mapLayer === 'realistic_3d' ? '0.98' : '0.78'}
                  />

                  {/* Ледниковое сияние высокогорного Главного Кавказского и Богосского хребтов на южных пиках (> 3500 м) без второй полноэкранной текстуры и CPU-маски */}
                  {effectiveSkyWeather !== 'snow_blizzard' && (
                    <rect
                      x="0"
                      y="332"
                      width="700"
                      height="128"
                      fill="url(#eternalGlacierSouthGrad)"
                      className="pointer-events-none"
                    />
                  )}

                  {/* СЕЗОННОЕ ПРЕОБРАЖЕНИЕ 2D-РЕЛЬЕФА КАВКАЗА: встроенный зимний покров + реальные SRTM-русла 7 рек */}
                  {effectiveSkyWeather === 'snow_blizzard' && (
                    <g className="pointer-events-none">
                      <image
                        href={SRTM_WINTER_RELIEF_DATA_URI}
                        x="0"
                        y="0"
                        width="700"
                        height="460"
                        preserveAspectRatio="none"
                        opacity="0.9"
                      />
                      {DAGESTAN_SRTM_RIVER_DEFS.map((rv) => {
                        const dPath = rv.pts
                          .map(([rx, ry], idx) => `${idx === 0 ? 'M' : 'L'} ${rx.toFixed(1)},${ry.toFixed(1)}`)
                          .join(' ');
                        return (
                          <g key={`winter-rv-${rv.id}`}>
                            <path
                              d={dPath}
                              fill="none"
                              stroke="#e0f2fe"
                              strokeWidth="1.8"
                              strokeOpacity="0.65"
                            />
                            <path
                              d={dPath}
                              fill="none"
                              stroke="#ffffff"
                              strokeWidth="0.8"
                              strokeOpacity="0.85"
                            />
                          </g>
                        );
                      })}
                    </g>
                  )}
                  {effectiveSkyWeather === 'rain_clouds' && (
                    <g className="pointer-events-none">
                      {/* Осенний золотисто-багряный покров вековых буковых лесов Большой Чечни и Ичкерии */}
                      <ellipse cx="215" cy="185" rx="175" ry="95" fill="url(#autumnBeechForestGrad)" />
                      <ellipse cx="330" cy="245" rx="120" ry="65" fill="url(#autumnBeechForestGrad)" />
                      {/* Осенний туман в ущельях Аргуна и Койсу */}
                      <ellipse cx="265" cy="220" rx="115" ry="34" fill="url(#wfMistCloudRadGrad)" />
                      <ellipse cx="425" cy="265" rx="102" ry="30" fill="url(#wfMistCloudRadGrad)" />
                    </g>
                  )}

                  {/* Атмосферное солнечное/закатное/ночное освещение горных хребтов и кинематографическое виньетирование */}
                  <rect
                    width="700"
                    height="460"
                    fill={
                      dioramaTimeOfDay === 'night'
                        ? 'url(#nightMoonGlow)'
                        : dioramaTimeOfDay === 'sunset'
                        ? 'url(#sunsetDuskGlow)'
                        : 'url(#sunlightGlow)'
                    }
                    className="pointer-events-none"
                  />
                  {showSchematicLabels && <rect width="700" height="460" fill="url(#mapGrid)" />}
                  <rect x="0" y="0" width="700" height="48" fill="url(#topVignette)" />
                  <rect x="0" y="395" width="700" height="65" fill="url(#bottomVignette)" />

                  {/* Топографические изолинии высот (показываются только в режиме Схемы) */}
                  {showSchematicLabels && (
                    <>
                      <path
                        d="M 25,165 Q 190,125 340,160 T 665,180"
                        fill="none"
                        stroke="#fde68a"
                        strokeWidth="0.8"
                        strokeDasharray="4,4"
                        opacity="0.42"
                      />
                      <path
                        d="M 55,255 Q 260,205 460,240 T 675,275"
                        fill="none"
                        stroke="#fcd34d"
                        strokeWidth="0.9"
                        strokeDasharray="6,4"
                        opacity="0.48"
                      />
                      <path
                        d="M 80,335 Q 310,305 520,330 T 680,355"
                        fill="none"
                        stroke="#e0f2fe"
                        strokeWidth="1.1"
                        strokeDasharray="3,3"
                        opacity="0.55"
                      />
                    </>
                  )}

                  {/* Сунженская и Кумыкская кордонные линии Российской империи */}
                  <path
                    d="M 20,42 Q 240,28 465,52 L 680,68"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth={showSchematicLabels ? '2.5' : '1.6'}
                    strokeDasharray="7,4"
                    opacity={showSchematicLabels ? '0.88' : '0.55'}
                  />
                  {showSchematicLabels && (
                    <text x="410" y="13" textAnchor="middle" fontSize="8.5" fontWeight="bold" fill="#fca5a5" opacity="0.9">
                      {t(
                        '⚔ СУНЖЕНСКАЯ И КУМЫКСКАЯ КОРДОННЫЕ ЛИНИИ КАВКАЗСКОГО КОРПУСА',
                        '⚔ SUNZHA & KUMYK IMPERIAL CORDON LINE'
                      )}
                    </text>
                  )}

                  {/* Подписи ключевых географических зон рельефа (только в режиме Схемы, чтобы не засорять 3D-ландшафт) */}
                  {showSchematicLabels && (
                    <>
                      <text x="115" y="84" fontSize="8.5" fontStyle="italic" fill="#d9f99d" opacity="0.85">
                        {t('Чеченская равнина и р. Сунжа (180 м)', 'Chechen Plain & Sunzha River (180m)')}
                      </text>
                      <text x="110" y="238" fontSize="8.5" fontStyle="italic" fill="#86efac" opacity="0.88">
                        {t('Вековые буковые леса Ичкерии (950–1600 м)', 'Ichkeria Beech Forests (950–1600m)')}
                      </text>
                      <text x="545" y="162" textAnchor="middle" fontSize="8.5" fontStyle="italic" fill="#fde68a" opacity="0.88">
                        {t('Известняковые плато и каньоны Койсу (1850–2400 м)', 'Limestone Plateaus & Koisu Canyons (1850–2400m)')}
                      </text>
                    </>
                  )}
                  <text x="355" y="452" textAnchor="middle" fontSize="8.5" fontWeight="bold" fill="#e0f2fe" opacity="0.78">
                    {t(
                      '▲ ГЛАВНЫЙ КАВКАЗСКИЙ И БОГОССКИЙ СНЕГОВОЙ ХРЕБЕТ (Тебулосмта 4493 м • Диклосмта 4285 м • Аддала 4151 м)',
                      '▲ MAIN CAUCASIAN & BOGOS GLACIATED RANGE (Mt. Tebulosmta 4493m • Mt. Diklosmta 4285m • Mt. Addala 4151m)'
                    )}
                  </text>

                  {/* Вектор готовящегося удара Отдельного Кавказского корпуса (ИИ противника) */}
                  {(() => {
                    const activeGen = IMPERIAL_GENERALS[imperialAi.generalIdx];
                    const targetN = naibates.find((n) => n.id === imperialAi.targetNaibateId);
                    if (!activeGen || !targetN) return null;
                    return (
                      <g>
                        <circle
                          cx={activeGen.baseOrigin.x}
                          cy={activeGen.baseOrigin.y}
                          r="6.5"
                          fill="#991b1b"
                          stroke="#fca5a5"
                          strokeWidth="1.5"
                        />
                        {showSchematicLabels && (
                          <text
                            x={activeGen.baseOrigin.x}
                            y={activeGen.baseOrigin.y + 15}
                            textAnchor="middle"
                            fontSize="8.5"
                            fontWeight="bold"
                            fill="#fecaca"
                          >
                            {activeGen.baseOrigin.name}
                          </text>
                        )}
                        <line
                          x1={activeGen.baseOrigin.x}
                          y1={activeGen.baseOrigin.y}
                          x2={targetN.coords.x}
                          y2={targetN.coords.y - 18}
                          stroke="#ef4444"
                          strokeWidth="2.2"
                          strokeDasharray="6,4"
                          strokeOpacity="0.72"
                          markerEnd="url(#imperialStrikeArrow)"
                        />
                      </g>
                    );
                  })()}

                  {/* УРОВЕНЬ I СЕМАНТИЧЕСКОГО ЗУМА (Victoria 3 / Total War): ТЕРРИТОРИАЛЬНЫЕ РУБЕЖИ НАИБСТВ И АРТЕРИИ СНАБЖЕНИЯ ИЗ ДАРГО-ВЕДЕНО */}
                  {(strategicOverviewOpacity > 0.02 || mapLayer === 'political' || showSchematicLabels) && (
                    <g
                      opacity={mapLayer === 'political' ? 0.96 : Math.max(strategicOverviewOpacity, showSchematicLabels ? 0.85 : 0)}
                      className="pointer-events-none"
                    >
                      {naibates.map((n, nIdx) => {
                        const isSelDom = selectedNaibateId === n.id;
                        const domColor = n.underSiege
                          ? '#ef4444'
                          : n.gunpowder < 55 || n.imperialPressure >= 68
                          ? '#f59e0b'
                          : '#10b981';
                        const cx = n.coords.x;
                        const cy = n.coords.y;
                        const rx = 38 + (nIdx % 3) * 5;
                        const ry = 25 + ((nIdx + 1) % 3) * 3;
                        // Органический восьмиугольный горный контур рубежа наибства (без пересечения чужих башен)
                        const pts = [
                          [cx - rx * 0.92, cy - ry * 0.22],
                          [cx - rx * 0.52, cy - ry * 0.88],
                          [cx + rx * 0.44, cy - ry * 0.92],
                          [cx + rx * 0.94, cy - ry * 0.28],
                          [cx + rx * 0.86, cy + ry * 0.56],
                          [cx + rx * 0.34, cy + ry * 0.94],
                          [cx - rx * 0.48, cy + ry * 0.88],
                          [cx - rx * 0.94, cy + ry * 0.42]
                        ]
                          .map(([px, py]) => `${Math.round(px)},${Math.round(py)}`)
                          .join(' ');
                        const midX = Math.round((225 + cx) / 2 + (cy - 195) * 0.12);
                        const midY = Math.round((195 + cy) / 2 - (cx - 225) * 0.08);

                        return (
                          <g key={`dom-${n.id}`}>
                            <polygon
                              points={pts}
                              fill={domColor}
                              fillOpacity={isSelDom ? '0.16' : '0.065'}
                              stroke={isSelDom ? '#fde047' : domColor}
                              strokeWidth={isSelDom ? '1.35' : '0.85'}
                              strokeOpacity={isSelDom ? '0.82' : '0.44'}
                              strokeDasharray={n.underSiege ? '3,2.5' : '6,3.5'}
                            />
                            {/* Цветовая артерия снабжения порохом из столицы Дарго-Ведено (225, 195) */}
                            {n.id !== 'vedeno' && (
                              <path
                                d={`M 225,195 Q ${midX},${midY} ${cx},${cy}`}
                                fill="none"
                                stroke={isSelDom ? '#fde047' : domColor}
                                strokeWidth={isSelDom ? '2.3' : '1.25'}
                                strokeOpacity={isSelDom ? '0.88' : '0.46'}
                                strokeDasharray={isSelDom ? '5,3' : '3.5,3.5'}
                              />
                            )}
                          </g>
                        );
                      })}
                    </g>
                  )}

                  {/* УРОВЕНЬ III СЕМАНТИЧЕСКОГО ЗУМА (×1.85..2.6): ТАКТИЧЕСКИЕ СЕКТОРА ОБСТРЕЛА ГОРНЫХ БАТАРЕЙ И ВЫСОТНЫЕ КОЛЬЦА */}
                  {tacticalCloseUpOpacity > 0.02 && (
                    <g opacity={tacticalCloseUpOpacity} className="pointer-events-none">
                      {(liveMountainBatteries || []).map((bat) => (
                        <g key={`tac-bat-arc-${bat.id}`} transform={`translate(${bat.x}, ${bat.y})`}>
                          <circle
                            r={Math.round((bat.range || 95) * 0.48)}
                            fill="#f59e0b"
                            fillOpacity="0.045"
                            stroke="#fbbf24"
                            strokeWidth="0.9"
                            strokeDasharray="4,3"
                            strokeOpacity="0.58"
                          />
                        </g>
                      ))}
                      {naibates.map((n) => (
                        <ellipse
                          key={`tac-elev-${n.id}`}
                          cx={n.coords.x}
                          cy={n.coords.y + 4}
                          rx="26"
                          ry="14"
                          fill="none"
                          stroke="#fde68a"
                          strokeWidth="0.65"
                          strokeDasharray="2.5,2.5"
                          strokeOpacity="0.38"
                        />
                      ))}
                    </g>
                  )}

                  {/* РЕАЛЬНЫЙ ТУМАН ВОЙНЫ НА СЕВЕРНОМ КОРДОНЕ (рассеивается сигнальными кострами, кунаками и конными сотнями, 0 CPU-фильтров) */}
                  {!showSchematicLabels && cordonFogSectors.length > 0 && (
                    <g className="pointer-events-none">
                      {cordonFogSectors.map((sec) => (
                        <g key={sec.id} transform={`translate(${sec.x}, ${sec.y})`}>
                          <ellipse rx={sec.rx} ry={sec.ry} fill="url(#cordonFogShroudGrad)" />
                          <ellipse
                            cx={-sec.rx * 0.22}
                            cy={-sec.ry * 0.12}
                            rx={sec.rx * 0.68}
                            ry={sec.ry * 0.62}
                            fill="url(#wfStormCloudRadGrad)"
                          />
                          {strategicOverviewOpacity > 0.25 && (
                            <text
                              x="0"
                              y="2"
                              textAnchor="middle"
                              fontSize="6.3"
                              fontStyle="italic"
                              fill="#94a3b8"
                              opacity="0.72"
                            >
                              {t(`? Туман кордона (${sec.labelRu})`, `? Fog of War (${sec.labelEn})`)}
                            </text>
                          )}
                        </g>
                      ))}
                    </g>
                  )}

                  {/* Горные тропы от столицы Дарго-Ведено (225, 195): на оперативном зуме подсвечиваем маршрут к выбранному наибству */}
                  {naibates.map((n) => {
                    const isSelRoad = selectedNaibateId === n.id;
                    if (strategicOverviewOpacity > 0.55) return null;
                    if (!showSchematicLabels && !isSelRoad) return null;
                    const midX = (225 + n.coords.x) / 2 + (n.coords.y - 195) * 0.12;
                    const midY = (195 + n.coords.y) / 2 - (n.coords.x - 225) * 0.08;
                    return (
                      <path
                        key={`road-${n.id}`}
                        d={`M 225,195 Q ${midX},${midY} ${n.coords.x},${n.coords.y}`}
                        fill="none"
                        stroke={isSelRoad ? '#fbbf24' : '#e7e5e4'}
                        strokeOpacity={isSelRoad ? '0.82' : '0.28'}
                        strokeWidth={isSelRoad ? '2.2' : '1.1'}
                        strokeDasharray="4,4"
                      />
                    );
                  })}

                  {/* СТОЛИЦА ИМАМАТА: ДАРГО-ВЕДЕНО (МНОГОЯРУСНАЯ 3D ГОРНАЯ ЦИТАДЕЛЬ, ЛИТЕЙНЫЙ ДВОР, БАСТИОНЫ И ДИВАН-ХАНА) */}
                  <g
                    transform={`translate(225, 195)${pieceTf}`}
                    onMouseEnter={() =>
                      setHoveredMapInfo({
                        icon: '★',
                        titleRu: 'Столица Имамата Дарго-Ведено (Ставка Шамиля и Диван-Хана)',
                        titleEn: 'Imamate Capital Dargo-Vedeno (Shamil’s HQ & Divan-Khana)',
                        detailRu: `Казна: ${resources.gunpowder} пуд. пороха • ${resources.silver} руб. серебра • Зерно: ${resources.provisions} мер`,
                        detailEn: `Treasury: ${resources.gunpowder}p powder • ${resources.silver} rub. silver • Grain: ${resources.provisions}`,
                        actionRu: 'Кликните, чтобы открыть Арсенал Ведено прямо на столе и направить отряд в столицу',
                        actionEn: 'Click to open Vedeno Arsenal on the table & march unit to capital'
                      })
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      if (setTableQuickDrawer) {
                        setTableQuickDrawer((prev) => (prev === 'arsenal' ? null : 'arsenal'));
                      }
                      handleCommandUnitMoveToPoint(
                        selectedUnitId,
                        225,
                        195,
                        'Столица Дарго-Ведено (Ставка Шамиля)',
                        'Capital Dargo-Vedeno (Shamil’s HQ)'
                      );
                    }}
                    className="cursor-pointer"
                  >
                    <g className="pointer-events-none">
                      {/* Контактная тень цитадели на рельефе без тяжёлого SVG-фильтра */}
                      <ellipse cx="0" cy="10.4" rx="25" ry="10.8" fill="#000000" fillOpacity="0.48" />
                      {/* Тёплый ореол огней столицы в сумерках и ночью */}
                      {dioramaTimeOfDay !== 'day' && (
                        <circle
                          cx="0"
                          cy="-2"
                          r="26"
                          fill="#f59e0b"
                          fillOpacity={dioramaTimeOfDay === 'night' ? '0.28' : '0.16'}
                        />
                      )}

                      {/* 1. Скальное известняковое плато Ведено с 3D-гранями обрыва и засеками */}
                      <ellipse cx="0" cy="8.5" rx="22.5" ry="9.8" fill="#090b10" stroke="#f59e0b" strokeWidth="1.9" />
                      {/* Левая освещённая скальная грань и правая теневая грань ущелья */}
                      <polygon points="-20,7.8 -16,1.8 0,3.6 0,10.2" fill="url(#stoneWallLitGrad)" stroke="#292524" strokeWidth="0.6" />
                      <polygon points="0,3.6 16,1.8 20,7.8 0,10.2" fill="url(#stoneWallShadeGrad)" stroke="#1c1917" strokeWidth="0.6" />

                      {/* 2. Левое крыло: пушечно-литейный двор устаза Джабраила с горном и клубами дыма */}
                      <polygon points="-16.5,5.6 -15.2,-6.0 -8.8,-6.0 -8.8,5.6" fill="url(#stoneWallLitGrad)" stroke="#292524" strokeWidth="0.65" />
                      <polygon points="-8.8,5.6 -8.8,-6.0 -5.2,-4.6 -5.2,5.6" fill="url(#stoneWallShadeGrad)" stroke="#1c1917" strokeWidth="0.65" />
                      <polygon points="-16.2,-6.0 -10.5,-9.8 -4.8,-4.6 -8.8,-6.0" fill="#451a03" stroke="#fbbf24" strokeWidth="0.65" />
                      <rect x="-13.2" y="-13.4" width="2.5" height="5.2" fill="#44403c" stroke="#1c1917" strokeWidth="0.55" />
                      {/* Отсвет плавильной печи в арке литейни */}
                      <path d="M -13.4,4.8 L -13.4,0.8 Q -12.0,-0.6 -10.6,0.8 L -10.6,4.8 Z" fill="#ea580c" fillOpacity="0.88" />
                      {/* Многослойный дым литейного горна Ведено */}
                      <circle cx="-11.6" cy="-16.2" r="2.5" fill="#d6d3d1" fillOpacity="0.46" />
                      <circle cx="-10.1" cy="-20.2" r="3.4" fill="#e7e5e4" fillOpacity="0.28" />

                      {/* 3. Правое крыло: высокая кавказская боевая башня казны Байт-уль-Мал с машикулями */}
                      <polygon points="5.4,5.6 6.4,-10.8 10.6,-10.8 10.6,5.6" fill="url(#stoneWallLitGrad)" stroke="#292524" strokeWidth="0.65" />
                      <polygon points="10.6,5.6 10.6,-10.8 14.8,-9.4 15.8,5.6" fill="url(#stoneWallShadeGrad)" stroke="#1c1917" strokeWidth="0.65" />
                      <rect x="5.8" y="-12.2" width="9.4" height="1.8" rx="0.4" fill="#78716c" stroke="#fbbf24" strokeWidth="0.5" />
                      <polygon points="5.5,-12.2 10.5,-16.8 15.5,-12.2" fill="#064e3b" stroke="#fde047" strokeWidth="0.75" />
                      <rect x="8.2" y="-7.6" width="1.4" height="2.8" rx="0.5" fill="#fef08a" />

                      {/* 4. Центральный дворец Совета Диван-Ханы с резной дубовой галереей и купольным шатром */}
                      <polygon points="-8.4,6.4 -7.4,-9.2 0,-9.8 0,6.8" fill="url(#stoneWallLitGrad)" stroke="#fbbf24" strokeWidth="0.85" />
                      <polygon points="0,6.8 0,-9.8 7.4,-9.2 8.4,6.4" fill="url(#stoneWallShadeGrad)" stroke="#d97706" strokeWidth="0.85" />
                      {/* Верхний золочёный ярус резиденции Имама */}
                      <polygon points="-5.8,-3.5 -4.9,-17.2 0,-17.8 0,-3.2" fill="url(#citadelGoldGrad)" stroke="#fef08a" strokeWidth="0.85" />
                      <polygon points="0,-3.2 0,-17.8 4.9,-17.2 5.8,-3.5" fill="#b45309" stroke="#fde047" strokeWidth="0.75" />
                      {/* Резная деревянная арочная галерея (балкон) Совета наибов и улемов */}
                      <rect x="-6.6" y="-8.4" width="13.2" height="2.6" rx="0.4" fill="#451a03" stroke="#fde047" strokeWidth="0.6" />
                      {[-4.4, -1.5, 1.5, 4.4].map((colX, idx) => (
                        <line key={`div-col-${idx}`} x1={colX} y1="-8.4" x2={colX} y2="-5.8" stroke="#fde68a" strokeWidth="0.55" />
                      ))}
                      {/* Светящиеся стрельчатые окна зала совета */}
                      <rect x="-3.6" y="-14.4" width="1.9" height="3.5" rx="0.8" fill="#fef9c3" />
                      <rect x="1.7" y="-14.4" width="1.9" height="3.5" rx="0.8" fill="#fde047" />

                      {/* 5. Нижняя зубчатая крепостная стена, кованые ворота с факелами и бастионные единороги */}
                      <path
                        d="M -15.5,7.2 L -15.0,2.4 L -11.5,2.4 L -11.5,3.5 L -8.5,3.5 L -8.5,2.4 L -4.2,2.4 L 4.2,2.4 L 8.5,2.4 L 8.5,3.5 L 11.5,3.5 L 11.5,2.4 L 15.0,2.4 L 15.5,7.2 Z"
                        fill="#3f3f46"
                        stroke="#18181b"
                        strokeWidth="0.7"
                      />
                      <path d="M -2.9,7.4 L -2.9,2.1 Q 0,-0.4 2.9,2.1 L 2.9,7.4 Z" fill="#090b10" stroke="#fbbf24" strokeWidth="0.85" />
                      <circle cx="-4.0" cy="3.4" r="0.9" fill="#fb923c" />
                      <circle cx="4.0" cy="3.4" r="0.9" fill="#fb923c" />
                      {/* Два бронзовых горных единорога на бастионах столицы */}
                      <line x1="-13.2" y1="4.4" x2="-18.6" y2="2.2" stroke="url(#bronzeCannonGrad)" strokeWidth="1.8" strokeLinecap="round" />
                      <line x1="13.2" y1="4.4" x2="18.6" y2="2.2" stroke="url(#bronzeCannonGrad)" strokeWidth="1.8" strokeLinecap="round" />

                      {/* 6. Многогранный изумрудный шатёр с полумесяцем и рельефным знаменем Шамиля */}
                      <polygon points="-7.6,-17.2 0,-24.6 0,-17.6" fill="#059669" stroke="#fde047" strokeWidth="0.9" />
                      <polygon points="0,-17.6 0,-24.6 7.6,-17.2" fill="#064e3b" stroke="#fbbf24" strokeWidth="0.9" />
                      <line x1="0" y1="-24.6" x2="0" y2="-36.2" stroke="#fde047" strokeWidth="1.5" />
                      <circle cx="0" cy="-37.0" r="1.15" fill="#fef08a" />
                      <path
                        d="M 0,-35.8 Q 6.5,-37.6 13.8,-33.2 L 13.0,-27.6 Q 6.4,-30.2 0,-28.5 Z"
                        fill="#059669"
                        stroke="#fde047"
                        strokeWidth="0.8"
                      />
                      <circle cx="4.6" cy="-32.2" r="1.35" fill="#fef08a" />
                      <circle cx="5.2" cy="-32.2" r="1.05" fill="#059669" />

                      <rect x="-46" y="11" width="92" height="12" rx="6" fill="#090b10" fillOpacity="0.9" stroke="#fbbf24" strokeWidth="1.1" />
                      <text x="0" y="19.5" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#fde68a">
                        {t('★ ДАРГО-ВЕДЕНО', '★ DARGO-VEDENO')}
                      </text>
                    </g>
                  </g>

                  {/* УЗЛЫ ВСЕХ 10 НАИБСТВ ИМАМАТА: СКУЛЬПТУРНЫЕ 3D КАВКАЗСКИЕ КРЕПОСТИ-АУЛЫ С ТЕРРАСАМИ САКЛЕЙ, БОЕВЫМИ БАШНЯМИ И ГАРНИЗОНАМИ */}
                  {naibates.map((n) => {
                    const isSelected = n.id === selectedNaibateId;
                    const ringColor = n.underSiege
                      ? '#ef4444'
                      : n.imperialPressure > 65
                      ? '#f97316'
                      : '#10b981';
                    const loyPct = Math.max(15, Math.min(100, n.loyalty || 80));
                    const domForce = getDominantForceForNaibate(n);

                    return (
                      <g
                        key={n.id}
                        transform={`translate(${n.coords.x}, ${n.coords.y})${pieceTf}`}
                        onMouseEnter={() =>
                          setHoveredMapInfo({
                            icon: n.estranged ? '⚠️' : n.underSiege ? '🔥' : '🏰',
                            titleRu: `${n.name} — Наиб ${n.naibName} (${domForce.badgeRu})${n.estranged ? ' • РАСКОЛ' : ''}`,
                            titleEn: `${n.nameEn || n.name} — Naib ${n.naibNameEn || n.naibName} (${domForce.badgeEn})${n.estranged ? ' • SCHISM' : ''}`,
                            detailRu: `Преобладают: ${domForce.badgeRu} • Гарнизон: ${n.sabers} саб. • Порох: ${n.gunpowder} пуд. • Лояльность: ${n.loyalty}%${n.underSiege ? ` • Осада (${n.siegeTurns || 1} х.)` : ''}`,
                            detailEn: `Dominant: ${domForce.badgeEn} • Garrison: ${n.sabers} sab. • Powder: ${n.gunpowder}p • Loyalty: ${n.loyalty}%${n.underSiege ? ` • Siege (${n.siegeTurns || 1}t)` : ''}`,
                            actionRu: n.estranged
                              ? 'Брожение в наибстве! Отправьте чапара с порохом/серебром или решите спор через пакет гонца'
                              : 'Кликните для выбора наибства и открытия колеса указов',
                            actionEn: n.estranged
                              ? 'Naibate unrest! Send an envoy with powder/silver or resolve via courier packet'
                              : 'Click to select Naibate and open radial command wheel'
                          })
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedNaibateId(n.id);
                          setRadialWheelTarget({
                            x: n.coords.x,
                            y: n.coords.y,
                            naibateId: n.id,
                            titleRu: `${n.name} (${n.naibName})`,
                            titleEn: `${n.nameEn || n.name} (${n.naibNameEn || n.naibName})`
                          });
                          playHistoricalSound('paper', soundEnabled);
                        }}
                        className="cursor-pointer"
                      >
                        {/* СПРИНТ 36 (M36): ТЕПЛЫЙ СВЕТ НОЧНЫХ КОСТРОВ И ФАКЕЛОВ В ГОРНЫХ АУЛАХ НА ЗАКАТЕ И НОЧЬЮ */}
                        {dioramaTimeOfDay !== 'day' && (
                          <circle
                            cx="0"
                            cy="2"
                            r="20"
                            fill="#f59e0b"
                            fillOpacity={dioramaTimeOfDay === 'night' ? '0.26' : '0.16'}
                            className="pointer-events-none"
                          />
                        )}
                        {isSelected && (
                          <g className="pointer-events-none">
                            <ellipse
                              cx="0"
                              cy="4"
                              rx="22.5"
                              ry="11.2"
                              fill="#fbbf24"
                              fillOpacity="0.18"
                              stroke="#fbbf24"
                              strokeWidth="2"
                              strokeDasharray="4,2"
                            />
                          </g>
                        )}
                        {/* 3D каменный пьедестал аула (первый :scope > ellipse в точности cx="0" cy="6" для QA-проекции клика) */}
                        <ellipse
                          cx="0"
                          cy="6"
                          rx="16"
                          ry="7.2"
                          fill="#1c1917"
                          stroke={ringColor}
                          strokeWidth={isSelected ? '2.6' : '1.8'}
                        />
                        {/* Главная кавказская боевая башня аула (:scope > polygon[fill="url(#towerStoneGrad)"] сохраняется для QA) */}
                        <polygon
                          points="-6.6,6 -5.0,-13.2 5.0,-13.2 6.6,6"
                          fill="url(#towerStoneGrad)"
                          stroke={isSelected ? '#fde047' : '#d6d3d1'}
                          strokeWidth="1.05"
                        />

                        {/* Скульптурная 3D-архитектура кавказского аула-крепости (террасы скалы, сакли с балками, машикули, ворота) */}
                        <g className="pointer-events-none">
                          {/* Мягкая контактная тень под крепостью без SVG-фильтра */}
                          <ellipse cx="0" cy="8.2" rx="18.2" ry="8.0" fill="#000000" fillOpacity="0.38" />
                          {/* Скальный уступ под аулом с освещённой и теневой гранями */}
                          <polygon points="-14.8,6.4 -13.4,3.4 0,4.8 0,8.2" fill="#57534e" />
                          <polygon points="0,4.8 13.4,3.4 14.8,6.4 0,8.2" fill="#292524" />

                          {/* 3D светотень центральной сужающейся кверху кавказской боевой башни */}
                          <polygon points="-6.4,5.8 -4.9,-13.0 0,-13.2 0,6.0" fill="url(#stoneWallLitGrad)" fillOpacity="0.58" />
                          <polygon points="0,6.0 0,-13.2 4.9,-13.0 6.4,5.8" fill="#090b10" fillOpacity="0.38" />

                          {/* Левый двухъярусный каскад каменных горских саклей с выступающими брёвнами перекрытий */}
                          <polygon points="-14.2,5.4 -13.4,-3.2 -9.2,-3.2 -9.2,5.4" fill="url(#stoneWallLitGrad)" stroke="#292524" strokeWidth="0.6" />
                          <polygon points="-9.2,5.4 -9.2,-3.2 -5.8,-2.2 -5.8,5.4" fill="url(#stoneWallShadeGrad)" stroke="#1c1917" strokeWidth="0.6" />
                          <line x1="-14.0" y1="-3.2" x2="-5.6" y2="-2.2" stroke="#92400e" strokeWidth="1.25" />
                          {/* Выступающие торцы кровельных балок сакли */}
                          <circle cx="-12.8" cy="-2.8" r="0.4" fill="#fde68a" />
                          <circle cx="-11.2" cy="-2.7" r="0.4" fill="#fde68a" />
                          <circle cx="-9.8" cy="-2.6" r="0.4" fill="#fde68a" />
                          <rect x="-12.4" y="-1.0" width="1.7" height="2.2" rx="0.4" fill="#fde047" fillOpacity="0.92" />
                          <rect x="-8.4" y="-0.4" width="1.4" height="2.0" rx="0.35" fill="#fb923c" fillOpacity="0.88" />
                          {/* Мирный сизый дымок очага над саклей */}
                          {!n.underSiege && (
                            <>
                              <circle cx="-10.8" cy="-5.8" r="1.6" fill="#e7e5e4" fillOpacity="0.38" />
                              <circle cx="-9.6" cy="-8.6" r="2.2" fill="#e7e5e4" fillOpacity="0.22" />
                            </>
                          )}

                          {/* Правый каскад террасных саклей с деревянным навесом-галереей */}
                          <polygon points="5.6,5.4 5.6,-5.2 9.8,-5.2 9.8,5.4" fill="url(#stoneWallLitGrad)" stroke="#292524" strokeWidth="0.6" />
                          <polygon points="9.8,5.4 9.8,-5.2 13.6,-4.0 14.2,5.4" fill="url(#stoneWallShadeGrad)" stroke="#1c1917" strokeWidth="0.6" />
                          <line x1="5.4" y1="-5.2" x2="13.8" y2="-4.0" stroke="#78350f" strokeWidth="1.25" />
                          <rect x="6.8" y="-3.2" width="1.8" height="2.3" rx="0.4" fill="#fde047" fillOpacity="0.92" />
                          <rect x="10.8" y="-1.6" width="1.5" height="2.1" rx="0.4" fill="#fb923c" fillOpacity="0.86" />

                          {/* Нижняя зубчатая крепостная стена с машикулями, бойницами и окованными воротами */}
                          <path
                            d="M -13.2,6.3 L -12.6,2.0 L -9.6,2.0 L -9.6,3.1 L -6.8,3.1 L -6.8,2.0 L 6.8,2.0 L 6.8,3.1 L 9.6,3.1 L 9.6,2.0 L 12.6,2.0 L 13.2,6.3 Z"
                            fill="#3f3f46"
                            stroke="#18181b"
                            strokeWidth="0.68"
                          />
                          <path d="M -2.4,6.4 L -2.4,2.7 Q 0,0.9 2.4,2.7 L 2.4,6.4 Z" fill="#090b10" stroke="#d97706" strokeWidth="0.72" />

                          {/* Ряды тесаного камня, навесные машикули на кронштейнах и бойницы боевой башни */}
                          <line x1="-5.1" y1="-8.8" x2="5.1" y2="-8.8" stroke="#1c1917" strokeWidth="0.55" strokeOpacity="0.75" />
                          <line x1="-5.5" y1="-4.6" x2="5.5" y2="-4.6" stroke="#1c1917" strokeWidth="0.55" strokeOpacity="0.75" />
                          <line x1="-5.9" y1="-0.4" x2="5.9" y2="-0.4" stroke="#1c1917" strokeWidth="0.55" strokeOpacity="0.75" />
                          {/* Выступающий пояс машикулей (навесных бойниц) */}
                          <rect x="-6.5" y="-14.4" width="13.0" height="1.9" rx="0.4" fill="#78716c" stroke="#1c1917" strokeWidth="0.6" />
                          {[-4.5, -1.5, 1.5, 4.5].map((kx, idx) => (
                            <rect key={`corbel-${idx}`} x={kx - 0.5} y="-12.6" width="1.0" height="1.2" fill="#1c1917" />
                          ))}
                          {/* Узкие стрелковые бойницы башни */}
                          <rect x="-0.9" y="-11.0" width="1.8" height="3.6" rx="0.7" fill="#090b10" />
                          <rect x="-3.5" y="-6.8" width="1.2" height="2.5" rx="0.4" fill="#090b10" />
                          <rect x="2.3" y="-6.8" width="1.2" height="2.5" rx="0.4" fill="#090b10" />

                          {/* Традиционная кавказская ступенчатая сланцевая пирамидальная кровля и знамя наиба */}
                          <polygon
                            points="-7.4,-14.0 0,-19.8 0,-14.0"
                            fill={n.underSiege ? '#b91c1c' : '#44403c'}
                            stroke={ringColor}
                            strokeWidth="0.85"
                          />
                          <polygon
                            points="0,-14.0 0,-19.8 7.4,-14.0"
                            fill={n.underSiege ? '#7f1d1d' : '#1c1917'}
                            stroke={ringColor}
                            strokeWidth="0.85"
                          />
                          <line x1="-4.6" y1="-16.0" x2="4.6" y2="-16.0" stroke="#a8a29e" strokeWidth="0.5" strokeOpacity="0.65" />
                          <line x1="-2.5" y1="-17.7" x2="2.5" y2="-17.7" stroke="#a8a29e" strokeWidth="0.5" strokeOpacity="0.65" />
                          <line x1="0" y1="-19.8" x2="0" y2="-27.2" stroke="#fde047" strokeWidth="1.05" />
                          <circle cx="0" cy="-27.7" r="0.7" fill="#fef08a" />
                          <path
                            d="M 0,-26.8 Q 3.8,-27.9 7.8,-25.4 L 6.2,-23.8 L 7.5,-22.2 Q 3.6,-23.2 0,-22.4 Z"
                            fill={n.underSiege ? '#dc2626' : '#059669'}
                            stroke="#fef08a"
                            strokeWidth="0.55"
                          />
                          <circle cx="2.5" cy="-24.6" r="0.72" fill="#fef08a" />
                        </g>

                        {/* Зимний снежный наст на плоских крышах саклей и ступенчатой кровле башни */}
                        {!n.underSiege && effectiveSkyWeather === 'snow_blizzard' && (
                          <g className="pointer-events-none">
                            <polygon points="-7.0,-14.0 0,-19.8 7.0,-14.0 3.8,-13.2 -3.8,-13.2" fill="#f0f9ff" fillOpacity="0.92" />
                            <line x1="-13.8" y1="-3.2" x2="-5.8" y2="-2.2" stroke="#f8fafc" strokeWidth="1.6" strokeLinecap="round" />
                            <line x1="5.6" y1="-5.2" x2="13.6" y2="-4.0" stroke="#f8fafc" strokeWidth="1.6" strokeLinecap="round" />
                            <path d="M -13.5,6.6 Q 0,9.6 13.5,6.6" fill="none" stroke="#e0f2fe" strokeWidth="1.8" strokeOpacity="0.78" />
                          </g>
                        )}
                        {n.underSiege && (
                          <g className="pointer-events-none">
                            {/* Кольцо осадных сап, плетёных туров и рогаток вокруг осаждённого аула */}
                            <ellipse
                              cx="0"
                              cy="6"
                              rx="20.2"
                              ry="9.5"
                              fill="none"
                              stroke="#ef4444"
                              strokeWidth="1.25"
                              strokeDasharray="3.2,2.4"
                              strokeOpacity="0.92"
                            />
                            {/* Русские осадные туры и рогатки по периметру блокады */}
                            <line x1="-18.6" y1="8.8" x2="-15.4" y2="5.6" stroke="#fca5a5" strokeWidth="1.0" />
                            <line x1="-18.6" y1="5.8" x2="-15.4" y2="8.8" stroke="#fca5a5" strokeWidth="1.0" />
                            <line x1="-2.2" y1="16.2" x2="1.6" y2="13.2" stroke="#fca5a5" strokeWidth="1.0" />
                            <line x1="-2.2" y1="13.2" x2="1.6" y2="16.2" stroke="#fca5a5" strokeWidth="1.0" />
                            <line x1="14.6" y1="8.8" x2="17.8" y2="5.8" stroke="#fca5a5" strokeWidth="1.0" />
                            <line x1="14.6" y1="5.8" x2="17.8" y2="8.8" stroke="#fca5a5" strokeWidth="1.0" />
                            {/* Тёмные клубы порохового дыма над осаждёнными саклями (без CPU-фильтра) */}
                            <circle cx="-8.2" cy="-19.5" r="3.4" fill="#1c1917" fillOpacity="0.54" />
                            <circle cx="-5.6" cy="-23.8" r="4.2" fill="#44403c" fillOpacity="0.38" />
                            {/* Проломы в каменной кладке от осадных батарей и тлеющие угли */}
                            <polyline
                              points="-3.5,-9.8 -0.4,-5.2 -3.1,-1.0 1.6,3.6"
                              fill="none"
                              stroke="#090b10"
                              strokeWidth="1.35"
                            />
                            <circle cx="-1.5" cy="-2.5" r="2.1" fill="#ef4444" fillOpacity="0.9" />
                            <circle cx="8.8" cy="-1.4" r="1.9" fill="#f97316" fillOpacity="0.9" />
                          </g>
                        )}
                        {n.estranged && (
                          <g className="pointer-events-none">
                            <rect
                              x="-23"
                              y="-38"
                              width="46"
                              height="9"
                              rx="3"
                              fill="#450a0a"
                              fillOpacity="0.94"
                              stroke="#fbbf24"
                              strokeWidth="0.9"
                            />
                            <text
                              x="0"
                              y="-31.4"
                              textAnchor="middle"
                              fontSize="5.6"
                              fontWeight="bold"
                              fill="#fde68a"
                            >
                              {t('⚠ РАСКОЛ', '⚠ SCHISM')}
                            </text>
                          </g>
                        )}
                        {n.snowbound && !n.estranged && (
                          <g className="pointer-events-none">
                            <rect
                              x="-24"
                              y="-38"
                              width="48"
                              height="9"
                              rx="3"
                              fill="#082f49"
                              fillOpacity="0.94"
                              stroke="#7dd3fc"
                              strokeWidth="0.85"
                            />
                            <text
                              x="0"
                              y="-31.4"
                              textAnchor="middle"
                              fontSize="5.4"
                              fontWeight="bold"
                              fill="#e0f2fe"
                            >
                              {t('❄ ЗАНОСЫ', '❄ SNOWBOUND')}
                            </text>
                          </g>
                        )}
                        {/* 3D-фигура преобладающего рода войск гарнизона наибства рядом с крепостью */}
                        <g transform="translate(18.8, 2.5)" className="pointer-events-none">
                          <ellipse
                            cx="0"
                            cy="3.8"
                            rx="9.5"
                            ry="4.2"
                            fill="#090b10"
                            stroke={domForce.color}
                            strokeWidth="1.2"
                          />
                          {renderForceFigurine(
                            domForce.type,
                            domForce.color,
                            '#fde047',
                            0.84,
                            false,
                            Boolean(n.underSiege && animatedBattleVfx),
                            0,
                            n.id
                          )}
                        </g>
                        {/* СПРИНТ 35 (M35): ПЛАМЯ И ПОРОХОВОЙ ДЫМ ОСАДЫ НАД КРЕПОСТЬЮ-АУЛОМ (GPU-масштабирование вместо пересчёта d) */}
                        {n.underSiege && animatedBattleVfx && (
                          <g className="pointer-events-none">
                            <circle cx="0" cy="-16" r="12" fill="#ef4444" fillOpacity="0.26">
                              <animate attributeName="opacity" values="0.95;0.35;0.95" dur="1.15s" repeatCount="indefinite" />
                            </circle>
                            <circle cx="-3.8" cy="-24" r="6.2" fill="#292524" fillOpacity="0.58" />
                            <circle cx="4.2" cy="-27" r="5.0" fill="#57534e" fillOpacity="0.46" />
                            <g transform="translate(0, -13.5)">
                              <g>
                                <animateTransform
                                  attributeName="transform"
                                  type="scale"
                                  values="1,1; 0.94,1.14; 1,1"
                                  dur="0.65s"
                                  repeatCount="indefinite"
                                />
                                <path d="M -5.0,0 L -1.8,-9.7 L 0.8,-2.1 L 3.6,-8.9 L 5.2,0 Z" fill="#f97316" fillOpacity="0.94" />
                                <polygon points="-2.6,0 0,-6.7 2.6,0" fill="#fef08a" fillOpacity="0.96" />
                              </g>
                            </g>
                            <polygon points="6.6,-5.0 8.8,-12.2 11.2,-5.0" fill="#f97316" fillOpacity="0.9" />
                          </g>
                        )}
                        {/* Мини-полоска прочности/лояльности башни прямо на пьедестале */}
                        <rect x="-12" y="8" width="24" height="2.8" rx="1.2" fill="#090b10" />
                        <rect
                          x="-12"
                          y="8"
                          width={Math.round((24 * loyPct) / 100)}
                          height="2.8"
                          rx="1.2"
                          fill={ringColor}
                        />
                        {/* Компактная игровая лента с названием аула */}
                        <rect
                          x="-38"
                          y="12.5"
                          width="76"
                          height={showSchematicLabels ? '22' : '11.5'}
                          rx="4"
                          fill="#090b10"
                          fillOpacity="0.86"
                          stroke={isSelected ? '#fbbf24' : ringColor}
                          strokeWidth={isSelected ? '1.2' : '0.8'}
                        />
                        <text
                          x="0"
                          y="20.5"
                          textAnchor="middle"
                          fontSize="7.5"
                          fontWeight="bold"
                          fill={isSelected ? '#fbbf24' : '#f5f5f4'}
                        >
                          {t(n.name, n.nameEn || n.name)}
                        </text>
                        {showSchematicLabels && (
                          <text x="0" y="30.5" textAnchor="middle" fontSize="6.6" fill="#fde68a">
                            {t(domForce.badgeRu, domForce.badgeEn)} •{' '}
                            {mapLayer === 'political'
                              ? `${n.imperialPressure}%`
                              : `${n.gunpowder}${t('п', 'p')}`}
                          </text>
                        )}
                      </g>
                    );
                  })}

                  {/* СПРИНТ 25 (M25): ЖИВЫЕ ОБЪЁМНЫЕ АТМОСФЕРНЫЕ ПОГОДНЫЕ ФРОНТЫ НА 3D-РЕЛЬЕФЕ (0% CPU feTurbulence) */}
                  {weatherOverlayEnabled &&
                    liveWeatherFronts.map((wf, wfIdx) => {
                      const isBlizzardWf = wf.type === 'blizzard' || wf.id?.includes('snow') || wf.id?.includes('blizzard') || wf.icon === '❄️';
                      const isStormWf = wf.type === 'storm' || wf.id?.includes('rain') || wf.id?.includes('storm') || wf.icon === '🌧️' || wf.icon === '⛈️';
                      const driftDur = `${22 + wfIdx * 5}s`;
                      const wfCloudGrad = isStormWf
                        ? 'url(#wfStormCloudRadGrad)'
                        : isBlizzardWf
                        ? 'url(#wfSnowCloudRadGrad)'
                        : 'url(#wfMistCloudRadGrad)';
                      // При снижении камеры под облака (зум > 1.15) фронты мягко расступаются, открывая рельеф и цитадели
                      const wfZoomFade = Math.max(0.18, 1 - Math.max(0, mapZoom - 1.15) * 0.72);
                      return (
                        <g key={wf.id} transform={`translate(${wf.x}, ${wf.y})`} opacity={wfZoomFade} className="pointer-events-none">
                          <g>
                            {/* Плавный живой дрейф погодного фронта над ущельями без перерисовки React-состояния */}
                            <animateTransform
                              attributeName="transform"
                              type="translate"
                              values="-12,-3; 14,4; -12,-3"
                              dur={driftDur}
                              repeatCount="indefinite"
                            />

                            {/* Глубокая мягкая радиальная тень облачно-грозового фронта на склонах гор */}
                            <g transform="translate(14, 20)" opacity={isStormWf ? '0.68' : '0.42'}>
                              <ellipse rx={wf.rx * 1.12} ry={wf.ry * 0.96} fill="url(#wfShadowRadGrad)" />
                            </g>

                            {/* Многоярусная клубящаяся облачно-туманная шапка на радиальных градиентах */}
                            <g>
                              <ellipse cx="0" cy={wf.ry * 0.1} rx={wf.rx * 1.08} ry={wf.ry * 0.94} fill={wfCloudGrad} />
                              <ellipse cx={-wf.rx * 0.36} cy={wf.ry * 0.12} rx={wf.rx * 0.76} ry={wf.ry * 0.68} fill={wfCloudGrad} />
                              <ellipse cx={wf.rx * 0.34} cy={-wf.ry * 0.12} rx={wf.rx * 0.72} ry={wf.ry * 0.64} fill={wfCloudGrad} />
                              <ellipse
                                cx={-wf.rx * 0.14}
                                cy={-wf.ry * 0.18}
                                rx={wf.rx * 0.56}
                                ry={wf.ry * 0.48}
                                fill="url(#wfMistCloudRadGrad)"
                              />
                            </g>

                            {/* Снежная позёмка / горная гроза внутри фронта с 1 общим GPU-таймером вместо 16 */}
                            {isBlizzardWf && (
                              <g opacity="0.82">
                                <path
                                  d={`M ${-wf.rx * 0.56},${-wf.ry * 0.16} Q 0,${-wf.ry * 0.42} ${wf.rx * 0.56},${-wf.ry * 0.08} M ${-wf.rx * 0.46},${wf.ry * 0.18} Q 0,${wf.ry * 0.4} ${wf.rx * 0.5},${wf.ry * 0.1}`}
                                  fill="none"
                                  stroke="#f0f9ff"
                                  strokeWidth="0.65"
                                  strokeOpacity="0.58"
                                  strokeDasharray="6,5"
                                />
                                {[-0.42, -0.24, -0.06, 0.12, 0.28, 0.44].map((kx, sIdx) => (
                                  <circle
                                    key={`wf-snow-${sIdx}`}
                                    cx={wf.rx * kx}
                                    cy={wf.ry * (sIdx % 2 === 0 ? -0.2 : 0.12)}
                                    r={0.55 + (sIdx % 3) * 0.16}
                                    fill="#ffffff"
                                    fillOpacity="0.88"
                                  />
                                ))}
                              </g>
                            )}

                            {isStormWf && (
                              <g>
                                <g stroke="#e0f2fe" strokeWidth="0.42" strokeLinecap="round" opacity="0.64">
                                  {[-0.48, -0.35, -0.22, -0.09, 0.04, 0.17, 0.3, 0.43].map((kx, rIdx) => (
                                    <line
                                      key={`wf-rain-${rIdx}`}
                                      x1={wf.rx * kx}
                                      y1={wf.ry * (-0.14 + (rIdx % 3) * 0.08)}
                                      x2={wf.rx * kx - 6.5}
                                      y2={wf.ry * (0.34 + (rIdx % 3) * 0.08)}
                                    />
                                  ))}
                                </g>
                                {/* Внутриоблачная зарница и ветвистый ступенчатый разряд молнии внутри грозового фронта */}
                                <g>
                                  <animate
                                    attributeName="opacity"
                                    values="0; 0; 0.96; 0.15; 0.88; 0; 0; 0"
                                    keyTimes="0; 0.32; 0.345; 0.37; 0.395; 0.44; 0.7; 1"
                                    dur="4.8s"
                                    repeatCount="indefinite"
                                  />
                                  <ellipse
                                    cx="0"
                                    cy="0"
                                    rx={wf.rx * 0.68}
                                    ry={wf.ry * 0.52}
                                    fill="url(#wfLightningGlowRadGrad)"
                                  />
                                  <polyline
                                    points="-2,-14 -8,-3 1,2 -9,16 -3,21 -12,34"
                                    fill="none"
                                    stroke="#38bdf8"
                                    strokeWidth="2.4"
                                    strokeOpacity="0.52"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                  <polyline
                                    points="-2,-14 -8,-3 1,2 -9,16 -3,21 -12,34"
                                    fill="none"
                                    stroke="#ffffff"
                                    strokeWidth="0.95"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                  <polyline
                                    points="-8,-3 -18,7 -15,12 -22,20"
                                    fill="none"
                                    stroke="#bae6fd"
                                    strokeWidth="0.65"
                                    strokeLinecap="round"
                                  />
                                  <polyline
                                    points="-9,16 2,24 0,29 6,35"
                                    fill="none"
                                    stroke="#e0f2fe"
                                    strokeWidth="0.55"
                                    strokeLinecap="round"
                                  />
                                </g>
                              </g>
                            )}

                            {/* Тактический контур и сводка показываются только в режиме Схемы */}
                            {showSchematicLabels && (
                              <>
                                <ellipse
                                  rx={wf.rx}
                                  ry={wf.ry}
                                  fill="none"
                                  stroke={wf.strokeColor}
                                  strokeWidth="1.2"
                                  strokeDasharray="6,4"
                                  strokeOpacity="0.62"
                                />
                                <rect
                                  x="-66"
                                  y="-9"
                                  width="132"
                                  height="16"
                                  rx="4"
                                  fill="#090b10"
                                  fillOpacity="0.78"
                                  stroke={wf.strokeColor}
                                  strokeWidth="0.9"
                                  strokeOpacity="0.8"
                                />
                                <text
                                  x="0"
                                  y="2"
                                  textAnchor="middle"
                                  fontSize="7.8"
                                  fontWeight="bold"
                                  fill="#f8fafc"
                                >
                                  {wf.icon} {t(wf.badgeRu, wf.badgeEn)} (×{wf.speedMult} • +{wf.ambushBonusPct}%)
                                </text>
                              </>
                            )}
                          </g>
                        </g>
                      );
                    })}

                  {/* СПРИНТ 26 (M26): ИНЖЕНЕРНЫЕ УКРЕПЛЕНИЯ НА ГОРНЫХ ПЕРЕВАЛАХ (3D КАМЕННЫЕ ЗАВАЛЫ И РЕДУТЫ) */}
                  {showDefenseMapLayer &&
                    liveMapFortifications.map((fort) => {
                    const bp =
                      FORTIFICATION_BLUEPRINTS.find((b) => b.id === fort.type) ||
                      FORTIFICATION_BLUEPRINTS[0];
                    return (
                      <g
                        key={fort.id}
                        transform={`translate(${fort.x}, ${fort.y})${pieceTf}`}
                        onMouseEnter={() =>
                          setHoveredMapInfo({
                            icon: bp.icon,
                            titleRu: `${bp.badgeRu} — ${fort.passNameRu}`,
                            titleEn: `${bp.badgeEn} — ${fort.passNameEn}`,
                            detailRu: `Торможение царских колонн ×${bp.enemySpeedMult} • Урон залпа: -${bp.salvoDamageBayonets} штыков`,
                            detailEn: `Enemy speed ×${bp.enemySpeedMult} • Salvo damage: -${bp.salvoDamageBayonets} bayonets`,
                            actionRu: 'Кликните для выдвижения отряда к укреплению',
                            actionEn: 'Click to move selected unit to fortification'
                          })
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCommandUnitMoveToPoint(
                            selectedUnitId,
                            fort.x,
                            fort.y,
                            `${bp.badgeRu}: ${fort.passNameRu}`,
                            `${bp.badgeEn}: ${fort.passNameEn}`
                          );
                        }}
                        className="cursor-pointer"
                      >
                        {showSchematicLabels && (
                          <circle
                            r={bp.radius / pieceScale}
                            fill={bp.fillColor}
                            fillOpacity="0.16"
                            stroke={bp.strokeColor}
                            strokeWidth="1.4"
                            strokeDasharray="4,3"
                            strokeOpacity="0.82"
                          />
                        )}
                        {renderAuxiliaryMiniature('fortification', bp.strokeColor, true)}
                        {showSchematicLabels && (
                          <>
                            <rect
                              x="-58"
                              y="11"
                              width="116"
                              height="13"
                              rx="3.5"
                              fill="#090b10"
                              fillOpacity="0.88"
                              stroke={bp.strokeColor}
                              strokeWidth="0.9"
                            />
                            <text
                              x="0"
                              y="19.8"
                              textAnchor="middle"
                              fontSize="7"
                              fontWeight="bold"
                              fill="#f8fafc"
                            >
                              {t(bp.badgeRu, bp.badgeEn)} (×{bp.enemySpeedMult} • -{bp.salvoDamageBayonets}
                              {t('шт', 'b')})
                            </text>
                          </>
                        )}
                      </g>
                    );
                  })}

                  {/* Предпросмотр радиуса постройки укрепления при включённом режиме fortBuildMode */}
                  {fortBuildMode &&
                    (() => {
                      const activeBp =
                        FORTIFICATION_BLUEPRINTS.find((b) => b.id === selectedFortBlueprintId) ||
                        FORTIFICATION_BLUEPRINTS[0];
                      return (
                        <g
                          transform={`translate(${terrainProbe.x}, ${terrainProbe.y})`}
                          className="pointer-events-none"
                        >
                          <circle
                            r={activeBp.radius}
                            fill={activeBp.fillColor}
                            fillOpacity="0.28"
                            stroke="#fde047"
                            strokeWidth="2"
                            strokeDasharray="5,3"
                          />
                          <circle r="5" fill="#fde047" />
                          <rect
                            x="-74"
                            y="-26"
                            width="148"
                            height="15"
                            rx="4"
                            fill="#090b10"
                            fillOpacity="0.92"
                            stroke="#fde047"
                            strokeWidth="1.1"
                          />
                          <text
                            x="0"
                            y="-16"
                            textAnchor="middle"
                            fontSize="7.8"
                            fontWeight="bold"
                            fill="#fef08a"
                          >
                            {activeBp.icon}{' '}
                            {t(
                              `Кликните: Возвести «${activeBp.badgeRu}»`,
                              `Click: Build “${activeBp.badgeEn}”`
                            )}
                          </text>
                        </g>
                      );
                    })()}

                  {/* СПРИНТ 31 (M31): ПОДЗЕМНЫЕ МИННЫЕ ГАЛЕРЕИ И ПОРОХОВЫЕ КАМУФЛЕТЫ НА ПОДХОДАХ К КРЕПОСТЯМ-АУЛАМ */}
                  {showDefenseMapLayer &&
                    sapperMines.map((mine) => {
                    const isArmed = mine.status === 'armed';
                    const mineStroke = isArmed ? '#f43f5e' : '#78716c';
                    return (
                      <g
                        key={mine.id}
                        transform={`translate(${mine.x}, ${mine.y})${pieceTf}`}
                        onMouseEnter={() =>
                          setHoveredMapInfo({
                            icon: isArmed ? '🧨' : '🕳️',
                            titleRu: mine.nameRu,
                            titleEn: mine.nameEn,
                            detailRu: isArmed
                              ? `Взведён • Взрыв -${mine.blastDamageBayonets} штыков • Трофеи +${mine.capturedPowder}п пороха`
                              : 'Камуфлет разряжен после подрыва',
                            detailEn: isArmed
                              ? `Armed • Blast -${mine.blastDamageBayonets} bayonets • Spoils +${mine.capturedPowder}p powder`
                              : 'Camouflet depleted after blast',
                            actionRu: isArmed ? 'Кликните для немедленного подрыва горна' : 'Кликните для перезарядки порохом',
                            actionEn: isArmed ? 'Click to detonate camouflet' : 'Click to reload with powder'
                          })
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isArmed) {
                            handleDetonateAllSapperMines();
                          } else {
                            handleArmSapperMine(mine.id);
                          }
                        }}
                        className="cursor-pointer"
                      >
                        {showSchematicLabels && (
                          <circle
                            r={mine.radius / pieceScale}
                            fill={isArmed ? '#e11d48' : '#44403c'}
                            fillOpacity={isArmed ? '0.11' : '0.05'}
                            stroke={mineStroke}
                            strokeWidth="1.3"
                            strokeDasharray="3,3"
                          />
                        )}
                        {renderAuxiliaryMiniature('mine', mineStroke, isArmed)}
                        {showSchematicLabels && (
                          <>
                            <rect
                              x="-56"
                              y="10"
                              width="112"
                              height="12.5"
                              rx="3"
                              fill="#090b10"
                              fillOpacity="0.9"
                              stroke={mineStroke}
                              strokeWidth="0.9"
                            />
                            <text
                              x="0"
                              y="18.5"
                              textAnchor="middle"
                              fontSize="6.7"
                              fontWeight="bold"
                              fill={isArmed ? '#fecdd3' : '#a8a29e'}
                            >
                              {isArmed ? '🧨 ' : '🕳️ '}
                              {t(mine.badgeRu, mine.badgeEn)} {isArmed ? `(-${mine.blastDamageBayonets})` : t('(Перезар.)', '(Reload)')}
                            </text>
                          </>
                        )}
                      </g>
                    );
                  })}

                  {/* СПРИНТ 31 (M31): ЖИВЫЕ ДИПЛОМАТИЧЕСКИЕ МИССИИ ЧЕРКЕСИИ И ТРАПЕЗУНДА (60 FPS) */}
                  {showIntelDiplomacyMapLayer &&
                    liveDiplomaticMissions.map((ms) => {
                    const msTerr = sampleStrategicTerrain(ms.x, ms.y);
                    const msStroke = ms.escorted ? '#34d399' : '#2dd4bf';
                    const routeStr = (ms.waypoints || []).map((p) => `${p.x},${p.y}`).join(' ');
                    return (
                      <g key={ms.id}>
                        {showSchematicLabels && (
                          <polyline
                            points={routeStr}
                            fill="none"
                            stroke={msStroke}
                            strokeWidth="1.4"
                            strokeDasharray="4,3"
                            strokeOpacity="0.45"
                          />
                        )}
                        <g
                          transform={`translate(${ms.x}, ${ms.y})${pieceTf}`}
                          onMouseEnter={() =>
                            setHoveredMapInfo({
                              icon: ms.icon,
                              titleRu: ms.nameRu,
                              titleEn: ms.nameEn,
                              detailRu: `Дары: +${ms.giftPowder}п пороха, +${ms.giftSilver}₽, +${ms.giftSupport}% Порты • Высота ${msTerr.elevationMeters}м`,
                              detailEn: `Gifts: +${ms.giftPowder}p powder, +${ms.giftSilver} rub., +${ms.giftSupport}% Porte • Alt ${msTerr.elevationMeters}m`,
                              actionRu: 'Кликните для выделения почётного конвоя мюридов (+25% даров)',
                              actionEn: 'Click to assign honor escort (+25% gifts)'
                            })
                          }
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEscortDiplomaticMission(ms.id);
                          }}
                          className="cursor-pointer"
                        >
                          {ms.escorted && (
                            <circle
                              r="11"
                              fill="#10b981"
                              fillOpacity="0.22"
                              stroke="#34d399"
                              strokeWidth="1.3"
                            />
                          )}
                          {renderAuxiliaryMiniature('envoy', msStroke, ms.escorted)}
                          {showSchematicLabels && (
                            <>
                              <rect
                                x="-58"
                                y="-23"
                                width="116"
                                height="13"
                                rx="3.5"
                                fill="#041e1e"
                                fillOpacity="0.92"
                                stroke={msStroke}
                                strokeWidth="0.9"
                              />
                              <text x="0" y="-14" textAnchor="middle" fontSize="6.9" fontWeight="bold" fill="#99f6e4">
                                {ms.escorted ? '🛡️ ' : `${ms.icon} `}
                                {t(ms.badgeRu, ms.badgeEn)} • {msTerr.elevationMeters}{t('м', 'm')}
                              </text>
                            </>
                          )}
                        </g>
                      </g>
                    );
                  })}

                  {/* СПРИНТ 32 (M32): ПОЛЕВЫЕ ГОСПИТАЛИ И ЛАЗАРЕТЫ ХАКИМОВ И ДЖАРРАХОВ НА 3D-КАРТЕ (60 FPS) */}
                  {showMedicineMuhajirMapLayer &&
                    fieldHospitals.map((hosp) => {
                    const hospStroke = hosp.upgraded ? '#34d399' : '#38bdf8';
                    return (
                      <g
                        key={hosp.id}
                        transform={`translate(${hosp.x}, ${hosp.y})${pieceTf}`}
                        onMouseEnter={() =>
                          setHoveredMapInfo({
                            icon: '🏥',
                            titleRu: hosp.nameRu,
                            titleEn: hosp.nameEn,
                            detailRu: `Возврат раненых в строй: ${Math.round(hosp.recoveryRate * 100)}% (+${hosp.healSabersPerPulse} сабель)`,
                            detailEn: `Wounded recovery rate: ${Math.round(hosp.recoveryRate * 100)}% (+${hosp.healSabersPerPulse} sabers)`,
                            actionRu: 'Кликните для оснащения лазарета трофейным эфиром Пирогова',
                            actionEn: 'Click to equip lazaret with captured Pirogov ether'
                          })
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpgradeFieldHospital(hosp.id);
                        }}
                        className="cursor-pointer"
                      >
                        {showSchematicLabels && (
                          <circle
                            r={hosp.radius / pieceScale}
                            fill={hosp.upgraded ? '#10b981' : '#0284c7'}
                            fillOpacity="0.08"
                            stroke={hospStroke}
                            strokeWidth="1.2"
                            strokeDasharray="3,3"
                          />
                        )}
                        {renderAuxiliaryMiniature('hospital', hospStroke, hosp.upgraded)}
                        {showSchematicLabels && (
                          <>
                            <rect
                              x="-56"
                              y="10"
                              width="112"
                              height="12.5"
                              rx="3"
                              fill="#041914"
                              fillOpacity="0.92"
                              stroke={hospStroke}
                              strokeWidth="0.9"
                            />
                            <text
                              x="0"
                              y="18.5"
                              textAnchor="middle"
                              fontSize="6.6"
                              fontWeight="bold"
                              fill="#a7f3d0"
                            >
                              🏥 {t(hosp.badgeRu, hosp.badgeEn)} ({Math.round(hosp.recoveryRate * 100)}%)
                            </text>
                          </>
                        )}
                      </g>
                    );
                  })}

                  {/* СПРИНТ 32 (M32): ЖИВЫЕ ПАРЛАМЕНТЁРСКИЕ КОНВОИ ОБМЕНА ПЛЕННЫХ И АМАНАТОВ НА МИЧИКЕ И У ЯРЫКСУ (60 FPS) */}
                  {showMedicineMuhajirMapLayer &&
                    livePrisonerConvoys.map((cv) => {
                    const cvTerr = sampleStrategicTerrain(cv.x, cv.y);
                    const cvStroke = cv.escorted ? '#fbbf24' : '#f8fafc';
                    const routeStr = (cv.waypoints || []).map((p) => `${p.x},${p.y}`).join(' ');
                    return (
                      <g key={cv.id}>
                        {showSchematicLabels && (
                          <polyline
                            points={routeStr}
                            fill="none"
                            stroke={cvStroke}
                            strokeWidth="1.3"
                            strokeDasharray="4,3"
                            strokeOpacity="0.48"
                          />
                        )}
                        <g
                          transform={`translate(${cv.x}, ${cv.y})${pieceTf}`}
                          onMouseEnter={() =>
                            setHoveredMapInfo({
                              icon: cv.icon,
                              titleRu: cv.nameRu,
                              titleEn: cv.nameEn,
                              detailRu: `Выкуп: +${cv.ransomSilver}₽ серебра, +${cv.ransomPowder}п пороха • Высота ${cvTerr.elevationMeters}м`,
                              detailEn: `Ransom: +${cv.ransomSilver} rub., +${cv.ransomPowder}p powder • Alt ${cvTerr.elevationMeters}m`,
                              actionRu: 'Кликните для сопровождения конвоя к броду размена на Мичике',
                              actionEn: 'Click to escort prisoner exchange convoy to Michik ford'
                            })
                          }
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDispatchPrisonerExchange(cv.id);
                          }}
                          className="cursor-pointer"
                        >
                          {cv.escorted && (
                            <circle
                              r="11"
                              fill="#f59e0b"
                              fillOpacity="0.2"
                              stroke="#fbbf24"
                              strokeWidth="1.3"
                            />
                          )}
                          {renderAuxiliaryMiniature('caravan', cvStroke, cv.escorted)}
                          {showSchematicLabels && (
                            <>
                              <rect
                                x="-58"
                                y="-23"
                                width="116"
                                height="13"
                                rx="3.5"
                                fill="#0f172a"
                                fillOpacity="0.92"
                                stroke={cvStroke}
                                strokeWidth="0.9"
                              />
                              <text x="0" y="-14" textAnchor="middle" fontSize="6.8" fontWeight="bold" fill="#fef3c7">
                                {cv.escorted ? '🛡️ ' : `${cv.icon} `}
                                {t(cv.badgeRu, cv.badgeEn)} • +{cv.ransomSilver}₽ ({cvTerr.elevationMeters}{t('м', 'm')})
                              </text>
                            </>
                          )}
                        </g>
                      </g>
                    );
                  })}

                  {/* СПРИНТ 33 (M33): ПОРОХОВЫЕ МЕЛЬНИЦЫ, СЕЛИТРЕННЫЕ ПЕЩЕРЫ, СЕРНЫЕ КОПИ И КУЗНИЦЫ УНЦУКУЛЯ НА 3D-КАРТЕ */}
                  {showEconomyMapLayer &&
                    powderMills.map((mill) => {
                    const millStroke = mill.overdrive ? '#f59e0b' : '#a8a29e';
                    return (
                      <g
                        key={mill.id}
                        transform={`translate(${mill.x}, ${mill.y})${pieceTf}`}
                        onMouseEnter={() =>
                          setHoveredMapInfo({
                            icon: mill.icon,
                            titleRu: mill.nameRu,
                            titleEn: mill.nameEn,
                            detailRu: `Выработка: +${mill.yieldPowder} пуд. пороха и +${mill.yieldSilver}₽ серебра за цикл`,
                            detailEn: `Output: +${mill.yieldPowder}p powder and +${mill.yieldSilver} rub. silver per cycle`,
                            actionRu: 'Кликните для форсирования выработки пороховой мельницы (+35%)',
                            actionEn: 'Click to overdrive powder mill production (+35%)'
                          })
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBoostPowderMill(mill.id);
                        }}
                        className="cursor-pointer"
                      >
                        {showSchematicLabels && (
                          <circle
                            r={mill.radius / pieceScale}
                            fill={mill.overdrive ? '#d97706' : '#57534e'}
                            fillOpacity="0.09"
                            stroke={millStroke}
                            strokeWidth="1.2"
                            strokeDasharray="3,3"
                          />
                        )}
                        {renderAuxiliaryMiniature('mill', millStroke, mill.overdrive)}
                        {showSchematicLabels && (
                          <>
                            <rect
                              x="-56"
                              y="10"
                              width="112"
                              height="12.5"
                              rx="3"
                              fill="#120a04"
                              fillOpacity="0.92"
                              stroke={millStroke}
                              strokeWidth="0.9"
                            />
                            <text
                              x="0"
                              y="18.5"
                              textAnchor="middle"
                              fontSize="6.6"
                              fontWeight="bold"
                              fill="#fde68a"
                            >
                              {mill.icon} {t(mill.badgeRu, mill.badgeEn)} (+{mill.yieldPowder}{t('п', 'p')})
                            </text>
                          </>
                        )}
                      </g>
                    );
                  })}

                  {/* СПРИНТ 33 (M33): ТАЙНЫЕ ЯЧЕЙКИ КУНАКОВ-ЛАЗУТЧИКОВ И МАРШРУТЫ ЦАРСКИХ ФЕЛЬДЪЕГЕРЕЙ НА ЛИНИИ (60 FPS) */}
                  {showIntelDiplomacyMapLayer &&
                    kunakSpyRings.map((spy) => (
                    <g
                      key={spy.id}
                      transform={`translate(${spy.x}, ${spy.y})${pieceTf}`}
                      onMouseEnter={() =>
                        setHoveredMapInfo({
                          icon: '🕵️',
                          titleRu: spy.nameRu,
                          titleEn: spy.nameEn,
                          detailRu: 'Тайная сеть кунаков и лазутчиков Имамата при штабах Кавказской линии',
                          detailEn: 'Secret Imamate Kunak spy ring embedded along the Caucasian Line',
                          actionRu: 'Кликните для активации агентурной сети и перехвата депеш',
                          actionEn: 'Click to activate spy network and intercept dispatches'
                        })
                      }
                      onClick={(e) => {
                        e.stopPropagation();
                        handleActivateKunakSpyNetwork();
                      }}
                      className="cursor-pointer"
                    >
                      {renderAuxiliaryMiniature('envoy', '#818cf8', false)}
                    </g>
                  ))}

                  {showIntelDiplomacyMapLayer &&
                    liveImperialCouriers.map((cr) => {
                    const routeStr = (cr.waypoints || []).map((p) => `${p.x},${p.y}`).join(' ');
                    return (
                      <g key={cr.id}>
                        {showSchematicLabels && (
                          <polyline
                            points={routeStr}
                            fill="none"
                            stroke="#818cf8"
                            strokeWidth="1.2"
                            strokeDasharray="3,3"
                            strokeOpacity="0.45"
                          />
                        )}
                        <g
                          transform={`translate(${cr.x}, ${cr.y})${pieceTf}`}
                          onMouseEnter={() =>
                            setHoveredMapInfo({
                              icon: cr.icon,
                              titleRu: cr.nameRu,
                              titleEn: cr.nameEn,
                              detailRu: `Казённая сумка: +${cr.lootSilver}₽ серебра, +${cr.lootPowder}п пороха, -${cr.intelPressureDrop}% натиска РИ`,
                              detailEn: `Dispatch bag: +${cr.lootSilver} rub., +${cr.lootPowder}p powder, -${cr.intelPressureDrop}% pressure`,
                              actionRu: 'Кликните для перехвата царского фельдъегеря на тракте',
                              actionEn: 'Click to intercept Imperial courier on the road'
                            })
                          }
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInterceptImperialCourier(cr.id);
                          }}
                          className="cursor-pointer"
                        >
                          {renderAuxiliaryMiniature('envoy', '#a5b4fc', false)}
                          {showSchematicLabels && (
                            <>
                              <rect
                                x="-58"
                                y="-22"
                                width="116"
                                height="12.5"
                                rx="3.5"
                                fill="#0f172a"
                                fillOpacity="0.92"
                                stroke="#818cf8"
                                strokeWidth="0.9"
                              />
                              <text x="0" y="-13.5" textAnchor="middle" fontSize="6.7" fontWeight="bold" fill="#e0e7ff">
                                {cr.icon} {t(cr.badgeRu, cr.badgeEn)} (+{cr.lootSilver}₽)
                              </text>
                            </>
                          )}
                        </g>
                      </g>
                    );
                  })}

                  {/* СПРИНТ 34 (M34): 3D-ПОВАЛЕННЫЕ ВЕКОВЫЕ БУКИ И ЛЕСНЫЕ ЗАСЕКИ ИЧКЕРИИ И ЧЕЧНИ (MANOR LORDS / TOTAL WAR STYLE) */}
                  {forestClearings.map((fc) => {
                    const isProt = fc.status === 'protected';
                    const fcStroke = isProt ? '#22c55e' : '#eab308';
                    const canopyFill =
                      effectiveSkyWeather === 'snow_blizzard'
                        ? '#e0f2fe'
                        : effectiveSkyWeather === 'rain_clouds'
                        ? '#ea580c'
                        : '#15803d';
                    return (
                      <g
                        key={fc.id}
                        transform={`translate(${fc.x}, ${fc.y})${pieceTf}`}
                        onMouseEnter={() =>
                          setHoveredMapInfo({
                            icon: '🌲',
                            titleRu: fc.nameRu,
                            titleEn: fc.nameEn,
                            detailRu: `Лесная засека из вековых буков (${fc.canopyIntactPct}%) • Торможение колонн РИ ×${fc.enemySlowdownMult} • Засада +${fc.ambushBonusPct}%`,
                            detailEn: `Fallen beech abatis (${fc.canopyIntactPct}%) • Slows enemy ×${fc.enemySlowdownMult} • Ambush +${fc.ambushBonusPct}%`,
                            actionRu: 'Кликните для завала просеки вековыми буками и засады стрелков',
                            actionEn: 'Click to fortify beech forest clearing with marksmen'
                          })
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDefendForestClearing(fc.id);
                        }}
                        className="cursor-pointer"
                      >
                        {showSchematicLabels && (
                          <circle
                            r={fc.radius / pieceScale}
                            fill={isProt ? '#15803d' : '#a16207'}
                            fillOpacity="0.11"
                            stroke={fcStroke}
                            strokeWidth="1.3"
                            strokeDasharray="4,3"
                          />
                        )}
                        {/* 3D скульптурная миниатюра засеки из поваленных буковых стволов и переплетённых крон */}
                        <ellipse cx="0" cy="3.5" rx="10.5" ry="4.5" fill="#1c1917" fillOpacity="0.82" stroke={fcStroke} strokeWidth="1.1" />
                        {/* Скрещенные поваленные стволы вековых буков */}
                        <line x1="-8.5" y1="3.5" x2="7.5" y2="-2.5" stroke="#78350f" strokeWidth="2.6" strokeLinecap="round" />
                        <line x1="-7.5" y1="-2" x2="8.5" y2="3.8" stroke="#92400e" strokeWidth="2.4" strokeLinecap="round" />
                        {/* Заострённые ветви засеки и крона по сезону (зелёная / багряная осенняя / снежная) */}
                        <circle cx="-4.5" cy="-2.2" r="3.6" fill={canopyFill} stroke="#052e16" strokeWidth="0.7" />
                        <circle cx="4.2" cy="-2.5" r="3.4" fill={canopyFill} stroke="#052e16" strokeWidth="0.7" />
                        <polygon points="0,-7.5 -4,-1.5 4,-1.5" fill={canopyFill} stroke={fcStroke} strokeWidth="0.8" />
                        {showArtilleryForestMapLayer && (
                          <>
                            <rect
                              x="-56"
                              y="10"
                              width="112"
                              height="12.5"
                              rx="3"
                              fill="#03170b"
                              fillOpacity="0.92"
                              stroke={fcStroke}
                              strokeWidth="0.9"
                            />
                            <text
                              x="0"
                              y="18.5"
                              textAnchor="middle"
                              fontSize="6.6"
                              fontWeight="bold"
                              fill="#bbf7d0"
                            >
                              🌲 {t(fc.badgeRu, fc.badgeEn)} ({fc.canopyIntactPct}%)
                            </text>
                          </>
                        )}
                      </g>
                    );
                  })}

                  {/* СПРИНТ 34 (M34): ЖИВЫЕ ПЕРЕСЕЛЕНЧЕСКИЕ ОБОЗЫ ГОРЦЕВ-МУХАДЖИРОВ В НАГОРНЫЙ ДАГЕСТАН И ШАТОЙ (60 FPS) */}
                  {showMedicineMuhajirMapLayer &&
                    liveMuhajirCaravans.map((mc) => {
                    const mcTerr = sampleStrategicTerrain(mc.x, mc.y);
                    const mcStroke = mc.escorted ? '#34d399' : '#fdba74';
                    const routeStr = (mc.waypoints || []).map((p) => `${p.x},${p.y}`).join(' ');
                    return (
                      <g key={mc.id}>
                        {showSchematicLabels && (
                          <polyline
                            points={routeStr}
                            fill="none"
                            stroke={mcStroke}
                            strokeWidth="1.3"
                            strokeDasharray="3,3"
                            strokeOpacity="0.46"
                          />
                        )}
                        <g
                          transform={`translate(${mc.x}, ${mc.y})${pieceTf}`}
                          onMouseEnter={() =>
                            setHoveredMapInfo({
                              icon: mc.icon,
                              titleRu: mc.nameRu,
                              titleEn: mc.nameEn,
                              detailRu: `Пополнение гарнизонов: +${mc.militiaJoined} мюридов • Запасы: +${mc.savedGrain} зерна • Высота ${mcTerr.elevationMeters}м`,
                              detailEn: `Reinforcements: +${mc.militiaJoined} murids • Provisions: +${mc.savedGrain} grain • Alt ${mcTerr.elevationMeters}m`,
                              actionRu: 'Кликните для прикрытия переселенческого обоза конным арьергардом',
                              actionEn: 'Click to escort Muhajir refugee caravan with cavalry'
                            })
                          }
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEscortMuhajirCaravan(mc.id);
                          }}
                          className="cursor-pointer"
                        >
                          {mc.escorted && (
                            <circle
                              r="11"
                              fill="#10b981"
                              fillOpacity="0.2"
                              stroke="#34d399"
                              strokeWidth="1.3"
                            />
                          )}
                          {renderAuxiliaryMiniature('caravan', mcStroke, mc.escorted)}
                          {showSchematicLabels && (
                            <>
                              <rect
                                x="-58"
                                y="-23"
                                width="116"
                                height="13"
                                rx="3.5"
                                fill="#1c0a04"
                                fillOpacity="0.92"
                                stroke={mcStroke}
                                strokeWidth="0.9"
                              />
                              <text x="0" y="-14" textAnchor="middle" fontSize="6.8" fontWeight="bold" fill="#ffedd5">
                                {mc.escorted ? '🛡️ ' : `${mc.icon} `}
                                {t(mc.badgeRu, mc.badgeEn)} (+{mc.militiaJoined} {t('мюр.', 'mur.')} • {mcTerr.elevationMeters}{t('м', 'm')})
                              </text>
                            </>
                          )}
                        </g>
                      </g>
                    );
                  })}

                  {/* СПРИНТ 30 (M30): СЕЗОННЫЙ ПЕРЕГОН ОТАР МЕЖДУ ЗИМНИМИ КУТАНАМИ И АЛЬПИЙСКИМИ ДЖАЙЛЯУ (60 FPS) */}
                  {showEconomyMapLayer &&
                    liveTranshumanceFlocks.map((fl) => {
                    const flTerr = sampleStrategicTerrain(fl.x, fl.y);
                    const flStroke = fl.guarded ? '#34d399' : '#e2e8f0';
                    const routeStr = (fl.waypoints || []).map((p) => `${p.x},${p.y}`).join(' ');
                    return (
                      <g key={fl.id}>
                        {showSchematicLabels && (
                          <polyline
                            points={routeStr}
                            fill="none"
                            stroke={flStroke}
                            strokeWidth="1.2"
                            strokeDasharray="2,3"
                            strokeOpacity="0.4"
                          />
                        )}
                        <g
                          transform={`translate(${fl.x}, ${fl.y})${pieceTf}`}
                          onMouseEnter={() =>
                            setHoveredMapInfo({
                              icon: fl.icon,
                              titleRu: fl.nameRu,
                              titleEn: fl.nameEn,
                              detailRu: `Доход перегона: +${fl.yieldProvisions} провианта и +${fl.yieldSilver}₽ серебра • Высота ${flTerr.elevationMeters}м`,
                              detailEn: `Transhumance yield: +${fl.yieldProvisions} provisions, +${fl.yieldSilver} rub. • Alt ${flTerr.elevationMeters}m`,
                              actionRu: 'Кликните для выделения конного охранения отарам на джайляу',
                              actionEn: 'Click to guard transhumance flock on alpine pastures'
                            })
                          }
                          onClick={(e) => {
                            e.stopPropagation();
                            handleProtectTranshumanceFlock(fl.id);
                          }}
                          className="cursor-pointer"
                        >
                          {fl.guarded && (
                            <circle
                              r="10.5"
                              fill="#10b981"
                              fillOpacity="0.2"
                              stroke="#34d399"
                              strokeWidth="1.2"
                            />
                          )}
                          {renderAuxiliaryMiniature('flock', flStroke, fl.guarded)}
                          {showSchematicLabels && (
                            <>
                              <rect
                                x="-54"
                                y="-22"
                                width="108"
                                height="12.5"
                                rx="3"
                                fill="#090d16"
                                fillOpacity="0.88"
                                stroke={flStroke}
                                strokeWidth="0.85"
                              />
                              <text
                                x="0"
                                y="-13.2"
                                textAnchor="middle"
                                fontSize="6.7"
                                fontWeight="bold"
                                fill={fl.guarded ? '#a7f3d0' : '#f1f5f9'}
                              >
                                {fl.guarded ? '🛡️ ' : '🐑 '}
                                {t(fl.badgeRu, fl.badgeEn)} • {flTerr.elevationMeters}{t('м', 'm')}
                              </text>
                            </>
                          )}
                        </g>
                      </g>
                    );
                  })}

                  {/* СПРИНТ 30 (M30): ПЕРЕДВИЖНЫЕ ГОРНЫЕ БАТАРЕИ ЕДИНОРОГОВ ЯХЬИ АЛЬ-МИЛЬКИ И ХАДЖИ-ЮСУФА (60 FPS) */}
                  {liveMountainBatteries.map((bat) => {
                    const batTerr = sampleStrategicTerrain(bat.x, bat.y);
                    const routeStr = (bat.waypoints || []).map((p) => `${p.x},${p.y}`).join(' ');
                    return (
                      <g key={bat.id}>
                        {showSchematicLabels && (
                          <polyline
                            points={routeStr}
                            fill="none"
                            stroke="#f59e0b"
                            strokeWidth="1.3"
                            strokeDasharray="4,3"
                            strokeOpacity="0.45"
                          />
                        )}
                        <g
                          transform={`translate(${bat.x}, ${bat.y})${pieceTf}`}
                          onMouseEnter={() =>
                            setHoveredMapInfo({
                              icon: bat.icon,
                              titleRu: bat.nameRu,
                              titleEn: bat.nameEn,
                              detailRu: `Урон залпа: -${bat.salvoDamage} штыков • Дальность: ${bat.range} верст • Высота гребня ${batTerr.elevationMeters}м`,
                              detailEn: `Salvo damage: -${bat.salvoDamage} bayonets • Range: ${bat.range}px • Ridge alt ${batTerr.elevationMeters}m`,
                              actionRu: 'Кликните для переброски горной батареи на господствующий гребень',
                              actionEn: 'Click to redeploy mountain battery to commanding ridge'
                            })
                          }
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeployBatteryToRidge(bat.id);
                          }}
                          className="cursor-pointer"
                        >
                          {showSchematicLabels && (
                            <circle
                              r={bat.range / pieceScale}
                              fill="#f59e0b"
                              fillOpacity="0.06"
                              stroke="#fbbf24"
                              strokeWidth="1.2"
                              strokeDasharray="5,4"
                              strokeOpacity="0.65"
                            />
                          )}
                          {/* 3D подставка горного орудия */}
                          <ellipse cx="0" cy="4.2" rx="10.5" ry="5" fill="#180526" stroke="#fbbf24" strokeWidth="1.6" />
                          {renderForceFigurine(
                            'artillery',
                            '#a855f7',
                            '#fbbf24',
                            0.96,
                            bat.status === 'moving',
                            Boolean(animatedBattleVfx && liveCannonSmokePlumes.length > 0)
                          )}
                          {showSchematicLabels && (
                            <>
                              <rect
                                x="-58"
                                y="-24"
                                width="116"
                                height="13.5"
                                rx="3.5"
                                fill="#180526"
                                fillOpacity="0.92"
                                stroke="#fbbf24"
                                strokeWidth="0.95"
                              />
                              <text x="0" y="-14.8" textAnchor="middle" fontSize="6.9" fontWeight="bold" fill="#fef08a">
                                💣 {t(bat.badgeRu, bat.badgeEn)} ({batTerr.elevationMeters}{t('м', 'm')})
                              </text>
                            </>
                          )}
                        </g>
                      </g>
                    );
                  })}

                  {/* СПРИНТ 29 (M29): ИНТЕРАКТИВНЫЕ ГОРНЫЕ МОСТЫ И ПЕРЕПРАВЫ ЧЕРЕЗ АРГУН, КОЙСУ, СУЛАК И СУНЖУ */}
                  {showDefenseMapLayer &&
                    riverBridges.map((br) => {
                    const isBlown = br.status === 'dismantled';
                    const brStroke = isBlown ? '#f97316' : '#38bdf8';
                    return (
                      <g
                        key={br.id}
                        transform={`translate(${br.x}, ${br.y})${pieceTf}`}
                        onMouseEnter={() =>
                          setHoveredMapInfo({
                            icon: isBlown ? '💥' : '🌉',
                            titleRu: `${br.nameRu} (${br.riverNameRu})`,
                            titleEn: `${br.nameEn} (${br.riverNameEn})`,
                            detailRu: isBlown
                              ? 'Мост разобран сапёрами — царские колонны вынуждены идти в обход по скалам (×0.38 скорости)'
                              : 'Мост наведён — ускоряет марш конницы мюридов и караванов (+25%)',
                            detailEn: isBlown
                              ? 'Bridge dismantled — Imperial columns forced onto steep cliff detour (×0.38 speed)'
                              : 'Bridge intact — accelerates Murid cavalry and caravans (+25%)',
                            actionRu: isBlown ? 'Кликните, чтобы заново навести мост' : 'Кликните, чтобы разобрать мост перед врагом',
                            actionEn: isBlown ? 'Click to rebuild river bridge' : 'Click to dismantle bridge ahead of enemy'
                          })
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleRiverBridge(br.id);
                        }}
                        className="cursor-pointer"
                      >
                        {showSchematicLabels && (
                          <circle
                            r={br.radius / pieceScale}
                            fill={brStroke}
                            fillOpacity="0.1"
                            stroke={brStroke}
                            strokeWidth="1.2"
                            strokeDasharray="4,3"
                          />
                        )}
                        {renderAuxiliaryMiniature('bridge', brStroke, isBlown)}
                        {showSchematicLabels && (
                          <>
                            <rect
                              x="-56"
                              y="-22"
                              width="112"
                              height="13"
                              rx="3"
                              fill="#090b10"
                              fillOpacity="0.9"
                              stroke={brStroke}
                              strokeWidth="0.9"
                            />
                            <text
                              x="0"
                              y="-13.2"
                              textAnchor="middle"
                              fontSize="6.7"
                              fontWeight="bold"
                              fill={isBlown ? '#fed7aa' : '#bae6fd'}
                            >
                              {isBlown ? '💥 ' : '🌉 '}
                              {t(br.badgeRu, br.badgeEn)} {isBlown ? t('(РАЗОБРАН)', '(BLOWN)') : '(+25%)'}
                            </text>
                          </>
                        )}
                      </g>
                    );
                  })}

                  {/* СПРИНТ 29 (M29): ЖИВЫЕ КОННЫЕ РАЗЪЕЗДЫ МУХТАСИБОВ И КАДИЕВ МЕЖДУ АУЛАМИ (60 FPS) */}
                  {showIntelDiplomacyMapLayer &&
                    liveMuhtasibPatrols.map((pat) => {
                    const patTerr = sampleStrategicTerrain(pat.x, pat.y);
                    const patStroke = pat.boosted ? '#facc15' : '#a78bfa';
                    const routeStr = (pat.waypoints || []).map((p) => `${p.x},${p.y}`).join(' ');
                    return (
                      <g key={pat.id}>
                        {showSchematicLabels && (
                          <polyline
                            points={routeStr}
                            fill="none"
                            stroke={patStroke}
                            strokeWidth="1.3"
                            strokeDasharray="3,3"
                            strokeOpacity="0.4"
                          />
                        )}
                        <g
                          transform={`translate(${pat.x}, ${pat.y})${pieceTf}`}
                          onMouseEnter={() =>
                            setHoveredMapInfo({
                              icon: pat.icon,
                              titleRu: pat.nameRu,
                              titleEn: pat.nameEn,
                              detailRu: `Инспекция Низама → ${pat.targetNameRu} (+5% лояльности, -6% натиска РИ) • Высота ${patTerr.elevationMeters}м`,
                              detailEn: `Nizam inspection → ${pat.targetNameEn} (+5% loyalty, -6% pressure) • Alt ${patTerr.elevationMeters}m`,
                              actionRu: 'Кликните для отправки ревизии мухтасиба в выбранное наибство',
                              actionEn: 'Click to dispatch Muhtasib inspection to selected Naibate'
                            })
                          }
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDispatchMuhtasibToNaibate(selectedNaibateId);
                          }}
                          className="cursor-pointer"
                        >
                          {renderAuxiliaryMiniature('envoy', patStroke, pat.boosted)}
                          {showSchematicLabels && (
                            <>
                              <rect
                                x="-54"
                                y="-23"
                                width="108"
                                height="13"
                                rx="3"
                                fill="#0f0e1a"
                                fillOpacity="0.9"
                                stroke={patStroke}
                                strokeWidth="0.9"
                              />
                              <text x="0" y="-14" textAnchor="middle" fontSize="6.9" fontWeight="bold" fill="#ddd6fe">
                                {pat.icon} {t(pat.badgeRu, pat.badgeEn)} • {patTerr.elevationMeters}{t('м', 'm')}
                              </text>
                            </>
                          )}
                        </g>
                      </g>
                    );
                  })}

                  {/* СПРИНТ 28 (M28): СИГНАЛЬНЫЕ БАШНИ И СТОРОЖЕВЫЕ КОСТРЫ НА ГОРНЫХ ХРЕБТАХ (+30% СКОРОСТИ И ПЕЛЕНГ КОЛОНН РИ) */}
                  {signalBeacons.map((b) => (
                    <g
                      key={b.id}
                      transform={`translate(${b.x}, ${b.y})${pieceTf}`}
                      onMouseEnter={() =>
                        setHoveredMapInfo({
                          icon: b.isLit ? '🔥' : '🗼',
                          titleRu: b.nameRu,
                          titleEn: b.nameEn,
                          detailRu: b.isLit
                            ? 'Сигнальный костёр горит — ускоряет марш конницы в радиусе хребта на +30%'
                            : 'Сигнальная башня погашена — кликните, чтобы зажечь сторожевой огонь',
                          detailEn: b.isLit
                            ? 'Signal fire lit — boosts friendly cavalry march speed by +30%'
                            : 'Signal tower unlit — click to ignite watchfire',
                          actionRu: 'Кликните для включения/выключения сигнальной башни',
                          actionEn: 'Click to toggle mountain signal beacon'
                        })
                      }
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleSignalBeacon(b.id);
                      }}
                      className="cursor-pointer"
                    >
                      {showSchematicLabels && b.isLit && (
                        <circle
                          r={b.radius / pieceScale}
                          fill="#f59e0b"
                          fillOpacity="0.06"
                          stroke="#fbbf24"
                          strokeWidth="1.2"
                          strokeDasharray="6,4"
                          strokeOpacity="0.55"
                        />
                      )}
                      {b.isLit && animatedBattleVfx && (
                        <circle cx="0" cy="-6" r="12" fill="#f59e0b" fillOpacity="0.24" className="pointer-events-none" />
                      )}
                      {renderAuxiliaryMiniature('beacon', b.isLit ? '#fbbf24' : '#78716c', b.isLit)}
                      {showSchematicLabels && (
                        <>
                          <rect
                            x="-52"
                            y="10"
                            width="104"
                            height="12.5"
                            rx="3"
                            fill="#090b10"
                            fillOpacity="0.88"
                            stroke={b.isLit ? '#fbbf24' : '#57534e'}
                            strokeWidth="0.9"
                          />
                          <text
                            x="0"
                            y="18.5"
                            textAnchor="middle"
                            fontSize="6.8"
                            fontWeight="bold"
                            fill={b.isLit ? '#fde68a' : '#a8a29e'}
                          >
                            {b.isLit ? '🔥 ' : '○ '}
                            {t(b.badgeRu, b.badgeEn)} {b.isLit ? '(+30%)' : t('(Погашен)', '(Off)')}
                          </text>
                        </>
                      )}
                    </g>
                  ))}

                  {/* СПРИНТ 28 (M28): ЦЕЛИ ГЛУБОКИХ КОННЫХ РЕЙДОВ ЗА ЛИНИЕЙ ТЕРЕКА И СУНЖИ (ОТВЛЕЧЕНИЕ ЦАРСКИХ КОЛОНН) */}
                  {showIntelDiplomacyMapLayer &&
                    deepRaidTargets.map((rt) => (
                    <g
                      key={rt.id}
                      transform={`translate(${rt.x}, ${rt.y})${pieceTf}`}
                      onMouseEnter={() =>
                        setHoveredMapInfo({
                          icon: '🎯',
                          titleRu: rt.nameRu,
                          titleEn: rt.nameEn,
                          detailRu: `Трофеи рейда: +${rt.lootPowder}п пороха, +${rt.lootSilver}₽ • Отвлекает колонну: ${rt.divertsColumnBadgeRu}`,
                          detailEn: `Raid spoils: +${rt.lootPowder}p powder, +${rt.lootSilver} rub. • Diverts: ${rt.divertsColumnBadgeEn}`,
                          actionRu: 'Кликните для стремительного конного рейда за линию Терека',
                          actionEn: 'Click to launch deep cavalry raid beyond the Terek line'
                        })
                      }
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLaunchDeepCavalryRaid(rt.id);
                      }}
                      className="cursor-pointer"
                    >
                      {renderAuxiliaryMiniature('envoy', '#fde047', true)}
                      {showSchematicLabels && (
                        <>
                          <rect
                            x="-64"
                            y="-23"
                            width="128"
                            height="13"
                            rx="3.5"
                            fill="#1c1105"
                            fillOpacity="0.92"
                            stroke="#fbbf24"
                            strokeWidth="0.95"
                          />
                          <text x="0" y="-14" textAnchor="middle" fontSize="6.9" fontWeight="bold" fill="#fef08a">
                            🎯 {t(rt.badgeRu, rt.badgeEn)} (+{rt.lootPowder}{t('п', 'p')})
                          </text>
                        </>
                      )}
                    </g>
                  ))}

                  {/* СПРИНТ 27 (M27): СЕВЕРНЫЕ КОРДОННЫЕ КРЕПОСТИ РОССИЙСКОЙ ИМПЕРИИ (СКУЛЬПТУРНЫЕ 3D ЗВЁЗДЧАТЫЕ ВОБАНОВСКИЕ КРЕПОСТИ ГРОЗНАЯ, ВНЕЗАПНАЯ, ТЕМИР-ХАН-ШУРА) */}
                  {cordonFortresses.map((fort) => {
                    const isDamaged = (fort.breachedCount || 0) > 0 || fort.integrity < 100;
                    const fortStroke = isDamaged ? '#f97316' : '#f43f5e';
                    const hpPct = Math.max(15, Math.min(100, fort.integrity || 100));
                    return (
                      <g
                        key={fort.id}
                        transform={`translate(${fort.x}, ${fort.y})${pieceTf}`}
                        onMouseEnter={() =>
                          setHoveredMapInfo({
                            icon: '🏰',
                            titleRu: fort.nameRu,
                            titleEn: fort.nameEn,
                            detailRu: `Гарнизон: ${fort.garrisonBayonets} штыков • Прочность бастионов: ${hpPct}% • Трофеи: +${fort.lootPowder}п пороха, +${fort.lootSilver}₽`,
                            detailEn: `Garrison: ${fort.garrisonBayonets} bayonets • Bastion integrity: ${hpPct}% • Spoils: +${fort.lootPowder}p powder, +${fort.lootSilver} rub.`,
                            actionRu: 'Кликните для генерального штурма кордонной крепости силами 5 отрядов',
                            actionEn: 'Click to launch general assault on Cordon Fortress with all 5 units'
                          })
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLaunchGeneralCordonAssault(fort.id);
                        }}
                        className="cursor-pointer"
                      >
                        <g className="pointer-events-none">
                          {showSchematicLabels && (
                            <circle
                              r="23"
                              fill={fortStroke}
                              fillOpacity="0.14"
                              stroke={fortStroke}
                              strokeWidth="1.4"
                              strokeDasharray="4,3"
                            />
                          )}

                          {/* 1. Наклонный земляной гласис и глубокий крепостной ров Вобановской крепости */}
                          <ellipse cx="0" cy="3.2" rx="21.5" ry="13.5" fill="url(#fortGlacisGrad)" stroke="#57534e" strokeWidth="1.0" />
                          <polygon
                            points="0,-13.8 5.8,-7.2 16.5,-8.6 10.2,-0.8 17.5,7.2 6.4,6.8 0,13.6 -6.4,6.8 -17.5,7.2 -10.2,-0.8 -16.5,-8.6 -5.8,-7.2"
                            fill="#090d16"
                            stroke="#334155"
                            strokeWidth="0.7"
                          />

                          {/* 2. Экструдированные 3D-эскарпы (каменные наклонные стены бастионов с освещёнными и теневыми гранями) */}
                          <polygon
                            points="-16.2,6.2 -9.4,-0.8 -15.2,-7.6 -5.2,-6.2 0,12.4 -5.8,6.0"
                            fill="url(#stoneWallLitGrad)"
                            stroke="#1c1917"
                            strokeWidth="0.55"
                          />
                          <polygon
                            points="0,12.4 5.8,6.0 16.2,6.2 9.4,-0.8 15.2,-7.6 5.2,-6.2"
                            fill="url(#stoneWallShadeGrad)"
                            stroke="#090b10"
                            strokeWidth="0.55"
                          />
                          {/* Передние грани южного равелина и боковых полубастионов */}
                          <polygon points="-15.8,4.0 -5.6,3.6 -5.8,6.6 -16.2,6.6" fill="#78716c" stroke="#1c1917" strokeWidth="0.5" />
                          <polygon points="-5.6,3.6 0,9.8 0,12.8 -5.8,6.6" fill="#a8a29e" stroke="#1c1917" strokeWidth="0.5" />
                          <polygon points="0,9.8 5.6,3.6 5.8,6.6 0,12.8" fill="#44403c" stroke="#1c1917" strokeWidth="0.5" />
                          <polygon points="5.6,3.6 15.8,4.0 16.2,6.6 5.8,6.6" fill="#292524" stroke="#090b10" strokeWidth="0.5" />

                          {/* 3. Верхний звёздчатый вал с дерновым бруствером и белокаменным кордонным поясом */}
                          <polygon
                            points="0,-13.2 5.2,-6.4 15.0,-7.8 9.0,-1.0 15.8,4.2 5.6,3.8 0,9.8 -5.6,3.8 -15.8,4.2 -9.0,-1.0 -15.0,-7.8 -5.2,-6.4"
                            fill="url(#fortBastionWallGrad)"
                            stroke={fortStroke}
                            strokeWidth="1.2"
                          />
                          <polygon
                            points="0,-10.2 4.0,-5.0 11.2,-6.0 6.8,-0.8 11.6,3.0 4.2,2.8 0,7.2 -4.2,2.8 -11.6,3.0 -6.8,-0.8 -11.2,-6.0 -4.0,-5.0"
                            fill="#365314"
                            stroke="#d6d3d1"
                            strokeWidth="0.7"
                          />
                          {/* Мощёный внутренний плац крепости */}
                          <ellipse cx="0" cy="-0.8" rx="7.6" ry="4.8" fill="#292524" stroke="#78716c" strokeWidth="0.5" />

                          {/* 4. Изометрические белокаменные казармы, комендантский дом и пороховой погреб внутри цитадели */}
                          {/* Левая казарма с красной железной вальмовой крышей */}
                          <polygon points="-6.4,-0.2 -6.4,-4.4 -1.6,-4.4 -1.6,-0.2" fill="#f5f5f4" stroke="#44403c" strokeWidth="0.45" />
                          <polygon points="-1.6,-0.2 -1.6,-4.4 -0.3,-3.6 -0.3,0.4" fill="#a8a29e" stroke="#44403c" strokeWidth="0.45" />
                          <polygon points="-6.8,-4.4 -3.8,-6.8 -0.1,-3.6 -1.6,-4.4" fill="#991b1b" stroke="#fca5a5" strokeWidth="0.42" />
                          <rect x="-5.2" y="-3.0" width="1.0" height="1.5" fill="#fde047" />
                          <rect x="-3.4" y="-3.0" width="1.0" height="1.5" fill="#fde047" />

                          {/* Правый комендантский дом с тёмно-зелёной железной крышей */}
                          <polygon points="0.8,0.6 0.8,-3.4 5.4,-3.4 5.4,0.6" fill="#f5f5f4" stroke="#44403c" strokeWidth="0.45" />
                          <polygon points="5.4,0.6 5.4,-3.4 6.6,-2.6 6.6,1.2" fill="#a8a29e" stroke="#44403c" strokeWidth="0.45" />
                          <polygon points="0.4,-3.4 3.4,-5.8 6.8,-2.6 5.4,-3.4" fill="#14532d" stroke="#86efac" strokeWidth="0.42" />
                          <rect x="2.0" y="-2.1" width="1.0" height="1.4" fill="#fde047" />
                          <rect x="3.8" y="-2.1" width="1.0" height="1.4" fill="#fb923c" />

                          {/* 5. Четыре крепостных бронзовых орудия в амбразурах угловых бастионов */}
                          <line x1="-6.8" y1="3.8" x2="-10.8" y2="7.6" stroke="url(#bronzeCannonGrad)" strokeWidth="1.65" strokeLinecap="round" />
                          <line x1="6.8" y1="3.8" x2="10.8" y2="7.6" stroke="url(#bronzeCannonGrad)" strokeWidth="1.65" strokeLinecap="round" />
                          <line x1="-9.2" y1="-4.8" x2="-13.4" y2="-7.2" stroke="url(#bronzeCannonGrad)" strokeWidth="1.35" strokeLinecap="round" />
                          <line x1="9.2" y1="-4.8" x2="13.4" y2="-7.2" stroke="url(#bronzeCannonGrad)" strokeWidth="1.35" strokeLinecap="round" />

                          {/* 6. Высокая мачта и трёхцветный штандарт Российской империи (чёрно-жёлто-белый) с двуглавым орлом */}
                          <line x1="0" y1="-1.5" x2="0" y2="-18.2" stroke="#fde047" strokeWidth="1.15" />
                          <circle cx="0" cy="-18.8" r="0.85" fill="#fbbf24" />
                          <g>
                            <rect x="0.4" y="-17.8" width="9.2" height="1.8" fill="#090b10" />
                            <rect x="0.4" y="-16.0" width="9.2" height="1.8" fill="#fbbf24" />
                            <rect x="0.4" y="-14.2" width="9.2" height="1.8" fill="#f8fafc" />
                            <rect x="0.4" y="-17.8" width="9.2" height="5.4" fill="none" stroke="#fde047" strokeWidth="0.4" />
                          </g>

                          {/* 7. Пожар, бреши и клубы дыма при повреждении бастионов штурмом */}
                          {isDamaged && (
                            <g>
                              <polygon points="-4.2,2.2 -1.4,-8.2 1.2,-2.6 3.8,-8.8 4.8,2.2" fill="#f97316" fillOpacity="0.92" />
                              <polygon points="-2.0,2.2 0,-5.8 2.0,2.2" fill="#fef08a" />
                              <circle cx="-2.0" cy="-12.5" r="4.2" fill="#44403c" fillOpacity="0.56" />
                            </g>
                          )}

                          {/* Полоса гарнизона крепости */}
                          <rect x="-20" y="13.5" width="40" height="3.2" rx="1.5" fill="#1c1917" stroke="#44403c" strokeWidth="0.6" />
                          <rect
                            x="-20"
                            y="13.5"
                            width={Math.max(5, Math.round((40 * hpPct) / 100))}
                            height="3.2"
                            rx="1.5"
                            fill={isDamaged ? '#fb923c' : '#f43f5e'}
                          />
                          {/* Компактная плашка крепости */}
                          <rect
                            x="-44"
                            y="-29.5"
                            width="88"
                            height="11.5"
                            rx="3.5"
                            fill="#1f050a"
                            fillOpacity="0.92"
                            stroke={fortStroke}
                            strokeWidth="0.9"
                          />
                          <text x="0" y="-21.5" textAnchor="middle" fontSize="6.9" fontWeight="bold" fill="#fecdd3">
                            {t(fort.badgeRu, fort.badgeEn)} ({fort.garrisonBayonets})
                          </text>
                        </g>
                      </g>
                    );
                  })}

                  {/* СПРИНТ 27 (M27): ЖИВЫЕ ВЬЮЧНЫЕ КАРАВАНЫ СНАБЖЕНИЯ БАЙТ-УЛЬ-МАЛ НА ГОРНЫХ ТРОПАХ (60 FPS) */}
                  {showEconomyMapLayer &&
                    liveSupplyCaravans.map((car) => {
                    const carTerr = sampleStrategicTerrain(car.x, car.y);
                    const isEsc = Boolean(car.escorted || car.isEscorted);
                    const carStroke = isEsc ? '#34d399' : '#facc15';
                    const routeStr = (car.waypoints || []).map((p) => `${p.x},${p.y}`).join(' ');
                    return (
                      <g key={car.id}>
                        {showSchematicLabels && (
                          <polyline
                            points={routeStr}
                            fill="none"
                            stroke={carStroke}
                            strokeWidth="1.3"
                            strokeDasharray="3,3"
                            strokeOpacity="0.45"
                          />
                        )}
                        <g
                          transform={`translate(${car.x}, ${car.y})${pieceTf}`}
                          onMouseEnter={() =>
                            setHoveredMapInfo({
                              icon: car.icon,
                              titleRu: car.nameRu,
                              titleEn: car.nameEn,
                              detailRu: `Груз Байт-уль-Мал: +${car.cargoPowder}п пороха, +${car.cargoProvisions || car.cargoGrain} пров., +${car.cargoSilver}₽ • Высота ${carTerr.elevationMeters}м`,
                              detailEn: `Bayt al-Mal cargo: +${car.cargoPowder}p powder, +${car.cargoProvisions || car.cargoGrain} prov., +${car.cargoSilver} rub. • Alt ${carTerr.elevationMeters}m`,
                              actionRu: 'Кликните для выделения конного прикрытия каравану снабжения',
                              actionEn: 'Click to escort Bayt al-Mal supply caravan'
                            })
                          }
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEscortSupplyCaravan(car.id);
                          }}
                          className="cursor-pointer"
                        >
                          {isEsc && (
                            <circle
                              r="11.5"
                              fill="#10b981"
                              fillOpacity="0.22"
                              stroke="#34d399"
                              strokeWidth="1.4"
                            />
                          )}
                          {renderAuxiliaryMiniature('caravan', carStroke, isEsc)}
                          {showSchematicLabels && (
                            <>
                              <rect
                                x="-56"
                                y="-24"
                                width="112"
                                height="13.5"
                                rx="3.5"
                                fill="#090d16"
                                fillOpacity="0.9"
                                stroke={carStroke}
                                strokeWidth="0.95"
                              />
                              <text
                                x="0"
                                y="-14.8"
                                textAnchor="middle"
                                fontSize="7.1"
                                fontWeight="bold"
                                fill={isEsc ? '#a7f3d0' : '#fef08a'}
                              >
                                {isEsc ? '🛡️ ' : ''}
                                {t(car.badgeRu, car.badgeEn)} • {carTerr.elevationMeters}{t('м', 'm')}
                              </text>
                            </>
                          )}
                        </g>
                      </g>
                    );
                  })}

                  {/* ВОЛНА IV (Шаг 4): ПАМЯТНЫЕ ЗНАКИ СЛАВЫ И ПОЛЕЙ СРАЖЕНИЙ НА 3D-СТОЛЕ КАВКАЗА */}
                  {battleMemorials.slice(0, 8).map((mem) => (
                    <g
                      key={mem.id}
                      transform={`translate(${mem.x}, ${mem.y})${pieceTf}`}
                      onMouseEnter={() =>
                        setHoveredMapInfo({
                          icon: '⚔️',
                          titleRu: `Памятное поле боя (Ход #${mem.turn}): ${mem.titleRu}`,
                          titleEn: `Memorial Battlefield (Turn #${mem.turn}): ${mem.titleEn}`,
                          detailRu: `${mem.commanderRu} • Разгромлено: -${mem.enemyLoss} шт. РИ • ${mem.spoilsRu}`,
                          detailEn: `${mem.commanderEn} • Enemy losses: -${mem.enemyLoss} bay. • ${mem.spoilsEn}`,
                          actionRu: 'Занесено в летопись Мухаммед-Тахира аль-Карахи (вкладка «Летопись»)',
                          actionEn: 'Inscribed in al-Qarakhi’s Campaign Chronicle (“Chronicle” tab)'
                        })
                      }
                      onClick={(e) => {
                        e.stopPropagation();
                        if (mem.naibateId) setSelectedNaibateId(mem.naibateId);
                      }}
                      className="cursor-pointer"
                    >
                      <circle
                        cx="0"
                        cy="0"
                        r="6.2"
                        fill="#1f160d"
                        fillOpacity="0.92"
                        stroke="#fbbf24"
                        strokeWidth="1.15"
                      />
                      <circle cx="0" cy="0" r="4.4" fill="none" stroke="#f59e0b" strokeWidth="0.55" strokeDasharray="1.5,1.2" />
                      <path
                        d="M -2.6,2.4 L 2.6,-2.4 M -2.6,-2.4 L 2.6,2.4"
                        stroke="#fde68a"
                        strokeWidth="1.25"
                        strokeLinecap="round"
                      />
                      {showSchematicLabels && (
                        <g transform="translate(0, -10.2)" className="pointer-events-none">
                          <rect
                            x="-36"
                            y="-5.2"
                            width="72"
                            height="9.4"
                            rx="2.6"
                            fill="#1c140c"
                            fillOpacity="0.92"
                            stroke="#fbbf24"
                            strokeWidth="0.7"
                          />
                          <text x="0" y="1.4" textAnchor="middle" fontSize="5.2" fontWeight="bold" fill="#fde68a">
                            ⚔ {t(mem.titleRu, mem.titleEn).slice(0, 22)}
                          </text>
                        </g>
                      )}
                    </g>
                  ))}

                  {/* СПРИНТ 25 (M25): 3D БАТАЛЬОННЫЕ КОЛОННЫ РИ + ТУМАН РАЗВЕДКИ И ПЕРЕРЕЗАЕМЫЕ ЛИНИИ СНАБЖЕНИЯ */}
                  {liveImperialColumns.map((col) => {
                    const colTerr = sampleStrategicTerrain(col.x, col.y);
                    const isFogHidden = Boolean(col.fogHidden && !showSchematicLabels);
                    const isRetreating = col.status === 'retreating';
                    const isSupplyCut = Boolean(col.supplyCut);
                    const colStroke = isFogHidden ? '#64748b' : isRetreating ? '#fb923c' : '#ef4444';
                    const trailStr = (col.trail || []).map((p) => `${p.x},${p.y}`).join(' ');
                    const fullPathStr = (col.waypoints || []).map((p) => `${p.x},${p.y}`).join(' ');
                    const colHpPct = Math.max(15, Math.min(100, Math.round((col.bayonets / 1450) * 100)));
                    const topCollides = overlapsStationaryLabel(col.x, col.y - 14.2 * pieceScale, 37 * pieceScale, 6.5 * pieceScale);
                    const botCollides = overlapsStationaryLabel(col.x, col.y + 18.2 * pieceScale, 37 * pieceScale, 6.5 * pieceScale);
                    const colRectY = topCollides && !botCollides ? 12.5 : -20;
                    const colTextY = topCollides && !botCollides ? 20.5 : -12;
                    const showColLabel = showSchematicLabels || !(topCollides && botCollides);
                    const origX = col.originX ?? 260;
                    const origY = col.originY ?? 48;
                    const convoyRatio = isSupplyCut
                      ? 0.5
                      : Math.max(0.18, Math.min(0.92, col.convoyProgress ?? 0.45));
                    const supMidX = Math.round(origX + (col.x - origX) * convoyRatio);
                    const supMidY = Math.round(origY + (col.y - origY) * convoyRatio);

                    return (
                      <g key={col.id} opacity={isFogHidden ? '0.78' : '1'}>
                        {/* Тыловая линия снабжения (сухарный и зарядный обоз от кордонной крепости до колонны РИ) */}
                        {(!isFogHidden || isSupplyCut) && (
                          <line
                            x1={origX}
                            y1={origY}
                            x2={col.x}
                            y2={col.y}
                            stroke={isSupplyCut ? '#ef4444' : '#f59e0b'}
                            strokeWidth={isSupplyCut ? '1.8' : '2.1'}
                            strokeDasharray={isSupplyCut ? '2.5,4.5' : '6,4'}
                            strokeOpacity={isSupplyCut ? '0.86' : '0.82'}
                            className="pointer-events-none"
                          />
                        )}
                        {handleSeverColumnSupplyLine && (!isFogHidden || isSupplyCut) && (
                          <g
                            transform={`translate(${supMidX}, ${supMidY})${pieceTf}`}
                            onMouseEnter={() =>
                              setHoveredMapInfo({
                                icon: isSupplyCut ? '✂️' : '🥖',
                                titleRu: isSupplyCut
                                  ? `Обоз отрезан: ${col.nameRu}`
                                  : `Тыловая линия снабжения (Сухарный обоз): ${col.nameRu}`,
                                titleEn: isSupplyCut
                                  ? `Supply Line Cut: ${col.nameEn}`
                                  : `Rear Supply Line (Biscuit & Caisson Train): ${col.nameEn}`,
                                detailRu: isSupplyCut
                                  ? 'Коммуникация с кордоном перерезана конницей мюридов (-14% штыков/ход от голода, -25% натиска)'
                                  : 'Наведите конную сотню на линию обоза или кликните, чтобы перерезать снабжение колонны РИ',
                                detailEn: isSupplyCut
                                  ? 'Supply line severed by Murid cavalry (-14% bayonets/turn attrition, -25% combat strength)'
                                  : 'March a cavalry hundred across this line or click to sever the column supply train',
                                actionRu: 'Кликните, чтобы перерезать обоз колонны (-320 шт., +22п пороха, +60₽)',
                                actionEn: 'Click to sever column supply line (-320 bayonets, +22p powder, +60 rub.)'
                              })
                            }
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSeverColumnSupplyLine(col.id);
                            }}
                            className="cursor-pointer"
                          >
                            <ellipse
                              cx="0"
                              cy="1.5"
                              rx="7.2"
                              ry="3.8"
                              fill={isSupplyCut ? '#450a0a' : '#291507'}
                              stroke={isSupplyCut ? '#f87171' : '#fbbf24'}
                              strokeWidth="1.2"
                            />
                            {isSupplyCut ? (
                              <g stroke="#fca5a5" strokeWidth="1.3" strokeLinecap="round">
                                <line x1="-3.0" y1="-2.2" x2="3.0" y2="2.5" />
                                <line x1="3.0" y1="-2.2" x2="-3.0" y2="2.5" />
                              </g>
                            ) : (
                              <g className="pointer-events-none">
                                {/* 3D фургон сухарного и зарядного обоза колонны РИ */}
                                <path d="M -3.8,0.6 L 3.6,0.6 L 3.1,-2.2 L -3.3,-2.2 Z" fill="#78350f" stroke="#fde047" strokeWidth="0.45" />
                                <path d="M -3.1,-2.2 Q 0,-4.4 3.0,-2.2 Z" fill="#fef3c7" stroke="#b45309" strokeWidth="0.45" />
                                <circle cx="-2.1" cy="1.3" r="1.45" fill="#1c1917" stroke="#fbbf24" strokeWidth="0.55" />
                                <circle cx="2.1" cy="1.3" r="1.45" fill="#1c1917" stroke="#fbbf24" strokeWidth="0.55" />
                              </g>
                            )}
                            {(isSupplyCut || showSchematicLabels || col.status === 'advancing') && (
                              <g transform="translate(0, -11)" className="pointer-events-none">
                                <rect
                                  x="-42"
                                  y="-6"
                                  width="84"
                                  height="10.8"
                                  rx="3"
                                  fill={isSupplyCut ? '#450a0a' : '#090b10'}
                                  fillOpacity="0.92"
                                  stroke={isSupplyCut ? '#f87171' : '#fbbf24'}
                                  strokeWidth="0.85"
                                />
                                <text
                                  x="0"
                                  y="1.7"
                                  textAnchor="middle"
                                  fontSize="5.9"
                                  fontWeight="bold"
                                  fill={isSupplyCut ? '#fecaca' : '#fde68a'}
                                >
                                  {isSupplyCut
                                    ? t('✂ ОБОЗ ОТРЕЗАН (-14%/х)', '✂ SUPPLY CUT (-14%/t)')
                                    : t(
                                        `🥖 Обоз РИ ${Math.round(convoyRatio * 100)}%`,
                                        `🥖 Convoy ${Math.round(convoyRatio * 100)}%`
                                      )}
                                </text>
                              </g>
                            )}
                          </g>
                        )}
                        {showSchematicLabels && (
                          <polyline
                            points={fullPathStr}
                            fill="none"
                            stroke={colStroke}
                            strokeWidth="1.4"
                            strokeDasharray="4,4"
                            strokeOpacity="0.45"
                          />
                        )}
                        {!isFogHidden && col.trail && col.trail.length > 1 && (
                          <g className="pointer-events-none">
                            {/* Походная колея обозов и артиллерийских лафетов (зимой — глубокая борозда в снегу) */}
                            <polyline
                              points={trailStr}
                              fill="none"
                              stroke={effectiveSkyWeather === 'snow_blizzard' ? '#e0f2fe' : '#1c1917'}
                              strokeWidth="3.8"
                              strokeOpacity="0.45"
                              strokeLinecap="round"
                            />
                            <polyline
                              points={trailStr}
                              fill="none"
                              stroke={colStroke}
                              strokeWidth="1.8"
                              strokeDasharray="2.5,3"
                              strokeOpacity="0.72"
                            />
                            {/* Цепочка походных факелов и бивачных огней вдоль тропы колонны ночью и на закате */}
                            {dioramaTimeOfDay !== 'day' &&
                              col.trail
                                .filter((_, idx) => idx % 3 === 0)
                                .map((pt, idx) => (
                                  <circle
                                    key={`col-torch-${col.id}-${idx}`}
                                    cx={pt.x}
                                    cy={pt.y}
                                    r="2.2"
                                    fill="#fb923c"
                                    fillOpacity="0.85"
                                  />
                                ))}
                          </g>
                        )}

                        <g
                          transform={`translate(${col.x}, ${col.y})${pieceTf}`}
                          onMouseEnter={() =>
                            setHoveredMapInfo(
                              isFogHidden
                                ? {
                                    icon: '🔭',
                                    titleRu: 'Неразведанная колонна Кавказского корпуса (~2–4 тыс. шт.)',
                                    titleEn: 'Unscouted Imperial Column (~2–4k bayonets)',
                                    detailRu:
                                      'Скрыта туманом кордона. Зажгите сигнальную башню на хребте, активируйте кунаков или вышлите конный разъезд',
                                    detailEn:
                                      'Hidden in cordon fog. Light a mountain signal beacon, activate kunak spies, or ride a scout hundred closer',
                                    actionRu: 'Кликните, чтобы направить выбранный отряд на разведку и перехват',
                                    actionEn: 'Click to dispatch selected unit to scout & intercept'
                                  }
                                : {
                                    icon: '⚔️',
                                    titleRu: col.nameRu,
                                    titleEn: col.nameEn,
                                    detailRu: `Численность: ${col.bayonets} штыков${
                                      isSupplyCut ? ' (ОБОЗ ОТРЕЗАН: голод -14%/ход)' : ''
                                    } • Высота: ${colTerr.elevationMeters}м (${colTerr.slopeDeg}°)`,
                                    detailEn: `Strength: ${col.bayonets} bayonets${
                                      isSupplyCut ? ' (SUPPLY CUT: -14%/turn)' : ''
                                    } • Alt: ${colTerr.elevationMeters}m (${colTerr.slopeDeg}°)`,
                                    actionRu: 'Кликните для перехвата колонны выбранным отрядом мюридов!',
                                    actionEn: 'Click to intercept column with selected Murid unit!'
                                  }
                            )
                          }
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInterceptImperialColumn(col.id);
                          }}
                          className="cursor-pointer"
                        >
                          {isFogHidden ? (
                            <>
                              {/* Силуэт неразведанной колонны в тумане кордона */}
                              <ellipse
                                cx="0"
                                cy="4.5"
                                rx="15"
                                ry="6.8"
                                fill="#0f172a"
                                fillOpacity="0.88"
                                stroke="#94a3b8"
                                strokeWidth="1.3"
                                strokeDasharray="3,2"
                              />
                              <circle cx="0" cy="-3.5" r="7.5" fill="#1e293b" stroke="#cbd5e1" strokeWidth="1.1" />
                              <text x="0" y="-0.6" textAnchor="middle" fontSize="9.2" fontWeight="bold" fill="#fde68a">
                                ?
                              </text>
                              {showColLabel && (
                                <>
                                  <rect
                                    x="-41"
                                    y={colRectY}
                                    width="82"
                                    height="11.5"
                                    rx="3.5"
                                    fill="#0f172a"
                                    fillOpacity="0.92"
                                    stroke="#64748b"
                                    strokeWidth="0.9"
                                  />
                                  <text
                                    x="0"
                                    y={colTextY}
                                    textAnchor="middle"
                                    fontSize="6.4"
                                    fontWeight="bold"
                                    fill="#cbd5e1"
                                  >
                                    {t('? Колонна РИ (~2–4 тыс.)', '? Column (~2–4k bay.)')}
                                  </text>
                                </>
                              )}
                            </>
                          ) : (
                            <>
                              {/* 3D скульптурная подставка генерала и батальонной колонны Кавказского корпуса РИ */}
                              <ellipse cx="0" cy="6.1" rx="14.6" ry="6.5" fill="#120305" stroke="#7f1d1d" strokeWidth="1.0" />
                              <ellipse cx="0" cy="4.8" rx="13.8" ry="6.0" fill="#2a0808" stroke={colStroke} strokeWidth="1.6" />
                              <g transform={`rotate(${col.headingDeg || 90})`}>
                                <line x1="0" y1="0" x2="15" y2="0" stroke={colStroke} strokeWidth="2.2" />
                                <polygon points="18,0 11,-3.8 11,3.8" fill={colStroke} />
                              </g>
                              {/* 3D фигура царского генерала на коне во главе батальонной колонны со штыками и орудием */}
                              {renderForceFigurine(
                                col.bayonets >= 1150 || col.id?.includes('argutinsky') || col.id?.includes('vorontsov')
                                  ? 'infantry_artillery'
                                  : 'imperial_infantry',
                                colStroke,
                                '#fecaca',
                                1.18,
                                col.status === 'moving' && (col.turnMarchBudget || 0) > 0,
                                Boolean(animatedBattleVfx && liveSkirmishBursts.length > 0),
                                col.headingDeg || 90,
                                col.id
                              )}
                              {/* Полоска штыков колонны */}
                              <rect x="-14" y="8" width="28" height="3" rx="1.2" fill="#090b10" />
                              <rect
                                x="-14"
                                y="8"
                                width={Math.round((28 * colHpPct) / 100)}
                                height="3"
                                rx="1.2"
                                fill={colStroke}
                              />
                              {/* Компактный игровой шильдик батальона */}
                              {showColLabel && (
                                <>
                                  <rect
                                    x="-38"
                                    y={colRectY}
                                    width="76"
                                    height="11.5"
                                    rx="3.5"
                                    fill="#2a0808"
                                    fillOpacity="0.92"
                                    stroke={isSupplyCut ? '#f87171' : colStroke}
                                    strokeWidth="0.9"
                                  />
                                  <text
                                    x="0"
                                    y={colTextY}
                                    textAnchor="middle"
                                    fontSize="6.7"
                                    fontWeight="bold"
                                    fill="#fecaca"
                                  >
                                    {isSupplyCut ? '✂ ' : isRetreating ? '↩ ' : ''}
                                    {t(col.badgeRu, col.badgeEn)} ({col.bayonets})
                                  </text>
                                </>
                              )}
                            </>
                          )}
                        </g>
                      </g>
                    );
                  })}

                  {/* СПРИНТ 24 (M24): 3D ФИГУРКИ ОТРЯДОВ ИМАМАТА С ОЧКАМИ ДВИЖЕНИЯ (MP) И БИВАКОМ */}
                  {liveFieldUnits.map((unit, uIdx) => {
                    const isUnitSel = unit.id === selectedUnitId;
                    const unitTerrain = sampleStrategicTerrain(unit.x, unit.y);
                    const unitDomForce = getDominantForceForUnit(unit);
                    const unitMaxMp = unit.maxMp || 150;
                    const unitMp = Math.max(0, Math.round(unit.mp ?? unitMaxMp));
                    const unitMpPct = Math.max(0, Math.min(100, Math.round((unitMp / unitMaxMp) * 100)));
                    const isCamped = unit.status === 'camped';
                    const remainingWps =
                      (unit.status === 'moving' || isCamped) && unit.waypoints && unit.waypoints.length > 0
                        ? [{ x: unit.x, y: unit.y }, ...unit.waypoints.slice(unit.waypointIdx)]
                        : [];
                    const remainingPointsStr = remainingWps.map((p) => `${p.x},${p.y}`).join(' ');
                    const trailPointsStr = (unit.trail || []).map((p) => `${p.x},${p.y}`).join(' ');
                    const overlapsOtherUnits = (lx, ly) =>
                      liveFieldUnits
                        .slice(0, uIdx)
                        .some(
                          (other) =>
                            Math.abs(lx - other.x) < 68 * pieceScale &&
                            Math.abs(ly - (other.y + 15.2 * pieceScale)) < 13 * pieceScale
                        ) ||
                      (liveImperialColumns || []).some(
                        (col) =>
                          Math.abs(lx - col.x) < 72 * pieceScale &&
                          (Math.abs(ly - (col.y - 14.2 * pieceScale)) < 14 * pieceScale ||
                            Math.abs(ly - (col.y + 18.2 * pieceScale)) < 14 * pieceScale)
                      );
                    const botCollides =
                      overlapsStationaryLabel(unit.x, unit.y + 15.2 * pieceScale, 35 * pieceScale, 6.5 * pieceScale) ||
                      overlapsOtherUnits(unit.x, unit.y + 15.2 * pieceScale);
                    const topCollides =
                      overlapsStationaryLabel(
                        unit.x,
                        unit.y - 18.2 * pieceScale,
                        35 * pieceScale,
                        6.5 * pieceScale
                      ) || overlapsOtherUnits(unit.x, unit.y - 18.2 * pieceScale);
                    const unitRectY = botCollides && !topCollides ? -24 : 9.5;
                    const unitTextY = botCollides && !topCollides ? -16.2 : 17.3;
                    const showUnitLabel = isUnitSel || showSchematicLabels || !(botCollides && topCollides);
                    const vetStarsCount = Math.max(0, Math.min(3, unit.vetXp || 0));
                    const vetStarsStr = vetStarsCount > 0 ? '★'.repeat(vetStarsCount) : '';
                    const unitGuns = unit.capturedGuns || 0;
                    const unitGearBadge = (unit.gear || [])
                      .map((gid) => SQUADRON_GEAR_CATALOG[gid]?.icon || '')
                      .join('');
                    const unitMedalBadge = (unit.medals || []).length > 0 ? '🥈' : '';
                    const vetTrophyTag = [
                      vetStarsStr,
                      unitGuns > 0 ? `+${unitGuns}💣` : '',
                      unitMedalBadge,
                      unitGearBadge
                    ]
                      .filter(Boolean)
                      .join(' ');
                    const battleCryRu =
                      unit.id === 'unit_hadji_murat'
                        ? '«Шашки наголо!»'
                        : unit.id === 'unit_baysungur'
                        ? '«Держать засеки!»'
                        : unit.id === 'unit_talkhig_artillery'
                        ? '«Наводка по колонне!»'
                        : '«За свободу гор!»';
                    const battleCryEn =
                      unit.id === 'unit_hadji_murat'
                        ? '“Sabers drawn!”'
                        : unit.id === 'unit_baysungur'
                        ? '“Hold the abatis!”'
                        : unit.id === 'unit_talkhig_artillery'
                        ? '“Zero on the column!”'
                        : '“For the Highlands!”';

                    return (
                      <g key={unit.id}>
                        {/* Ореол радиуса дневного перехода выбранного отряда при наведении на карту */}
                        {isUnitSel && isPointerOnMap && !fortBuildMode && !radialWheelTarget && unitMp > 8 && (
                          <ellipse
                            cx={unit.x}
                            cy={unit.y}
                            rx={Math.round(unitMp * 0.72)}
                            ry={Math.round(unitMp * 0.56)}
                            fill={unit.color}
                            fillOpacity="0.045"
                            stroke={unit.color}
                            strokeWidth="1.0"
                            strokeDasharray="4,3"
                            strokeOpacity="0.48"
                            className="pointer-events-none"
                          />
                        )}

                        {/* Пройденный след отряда по рельефу */}
                        {unit.trail && unit.trail.length > 1 && (
                          <g className="pointer-events-none">
                            <polyline
                              points={trailPointsStr}
                              fill="none"
                              stroke={effectiveSkyWeather === 'snow_blizzard' ? '#f0f9ff' : '#292524'}
                              strokeWidth="3.4"
                              strokeOpacity="0.42"
                              strokeLinecap="round"
                            />
                            <polyline
                              points={trailPointsStr}
                              fill="none"
                              stroke={unit.color}
                              strokeWidth="1.9"
                              strokeDasharray="2,3"
                              strokeOpacity="0.78"
                            />
                            {dioramaTimeOfDay !== 'day' &&
                              unit.trail
                                .filter((_, idx) => idx % 3 === 0)
                                .map((pt, idx) => (
                                  <circle
                                    key={`unit-torch-${unit.id}-${idx}`}
                                    cx={pt.x}
                                    cy={pt.y}
                                    r="2"
                                    fill="#fde047"
                                    fillOpacity="0.85"
                                  />
                                ))}
                          </g>
                        )}

                        {/* Плановый маршрут обхода скал (включая бивачный остаток пути на следующий ход) */}
                        {remainingWps.length > 1 &&
                          (isUnitSel || showSchematicLabels || unit.status === 'moving' || isCamped) && (
                            <>
                              <polyline
                                points={remainingPointsStr}
                                fill="none"
                                stroke={isCamped ? '#f59e0b' : unit.color}
                                strokeWidth={isUnitSel ? '2.5' : '1.6'}
                                strokeDasharray={isCamped ? '3,4' : '5,3'}
                                strokeOpacity={isUnitSel ? '0.95' : '0.68'}
                              />
                              <g transform={`translate(${unit.targetX}, ${unit.targetY})${pieceTf}`}>
                                <circle
                                  r="7.5"
                                  fill="none"
                                  stroke={isCamped ? '#f59e0b' : unit.color}
                                  strokeWidth="1.5"
                                  strokeDasharray="3,2"
                                />
                                <circle r="2.8" fill={isCamped ? '#f59e0b' : unit.color} />
                              </g>
                            </>
                          )}

                        {/* 3D фигурка отряда Имамата на пьедестале со знаменем */}
                        <g
                          transform={`translate(${unit.x}, ${unit.y})${pieceTf}`}
                          onMouseEnter={() =>
                            setHoveredMapInfo({
                              icon:
                                unitDomForce.type === 'artillery'
                                  ? '💣'
                                  : unitDomForce.type === 'infantry'
                                  ? '💂'
                                  : '🐎',
                              titleRu: `${unit.nameRu} (${unitDomForce.badgeRu})${vetTrophyTag ? ` • ${vetTrophyTag}` : ''}`,
                              titleEn: `${unit.nameEn} (${unitDomForce.badgeEn})${vetTrophyTag ? ` • ${vetTrophyTag}` : ''}`,
                              detailRu: `Очки марша: ${unitMp}/${unitMaxMp} ОД • Дисциплина P: ${
                                unit.obediencePct ?? 90
                              }% • Высота: ${unitTerrain.elevationMeters}м${
                                vetStarsCount > 0 || unitGuns > 0
                                  ? ` • Бонус боя: +${vetStarsCount * 5 + unitGuns * 4}%`
                                  : ''
                              }`,
                              detailEn: `March Points: ${unitMp}/${unitMaxMp} MP • Obedience P: ${
                                unit.obediencePct ?? 90
                              }% • Alt: ${unitTerrain.elevationMeters}m${
                                vetStarsCount > 0 || unitGuns > 0
                                  ? ` • Combat bonus: +${vetStarsCount * 5 + unitGuns * 4}%`
                                  : ''
                              }`,
                              actionRu: isCamped
                                ? 'На привале (0 ОД) — нажмите «ЗАВЕРШИТЬ ХОД» для продолжения марша'
                                : 'Кликните для выбора отряда, затем наведите и укажите цель на 3D-карте',
                              actionEn: isCamped
                                ? 'Camped (0 MP) — click “END TURN” to replenish MP and continue march'
                                : 'Click to select unit, then hover & click destination on 3D map'
                            })
                          }
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUnitId(unit.id);
                            playHistoricalSound('paper', soundEnabled);
                          }}
                          className="cursor-pointer"
                        >
                          {dioramaTimeOfDay !== 'day' && (
                            <circle
                              cx="0"
                              cy="2"
                              r="19"
                              fill="#fbbf24"
                              fillOpacity={dioramaTimeOfDay === 'night' ? '0.25' : '0.15'}
                              className="pointer-events-none"
                            />
                          )}
                          {isUnitSel && (
                            <ellipse
                              cx="0"
                              cy="4"
                              rx="18"
                              ry="9"
                              fill={unit.color}
                              fillOpacity="0.25"
                              stroke="#ffffff"
                              strokeWidth="1.6"
                              strokeDasharray="3,2"
                            />
                          )}
                          {/* Вектор направления движения */}
                          <g transform={`rotate(${unit.headingDeg || 0})`}>
                            <line
                              x1="0"
                              y1="0"
                              x2="17"
                              y2="0"
                              stroke={unit.color}
                              strokeWidth="2.4"
                            />
                            <polygon points="20,0 12.5,-4 12.5,4" fill={unit.color} />
                          </g>

                          {/* 3D чеканная настольная подставка полководца Имамата */}
                          <ellipse cx="0" cy="5.8" rx="13.6" ry="6.2" fill="#040609" stroke="#78350f" strokeWidth="1.0" />
                          <ellipse
                            cx="0"
                            cy="4.5"
                            rx="12.8"
                            ry="5.8"
                            fill="#090b10"
                            stroke={isCamped ? '#f59e0b' : unit.color}
                            strokeWidth={isUnitSel ? '2.6' : '1.8'}
                          />
                          {renderForceFigurine(
                            unitDomForce.type,
                            unit.color,
                            '#fde047',
                            1.24,
                            unit.status === 'moving',
                            Boolean(unitDomForce.type === 'artillery' && animatedBattleVfx && liveCannonSmokePlumes.length > 0),
                            unit.headingDeg || 0,
                            unit.id
                          )}

                          {/* Мини-шкала Очков Движения (ОД) на пьедестале фигурки */}
                          <rect x="-12" y="7.2" width="24" height="2.4" rx="1.1" fill="#090b10" />
                          <rect
                            x="-12"
                            y="7.2"
                            width={Math.round((24 * unitMpPct) / 100)}
                            height="2.4"
                            rx="1.1"
                            fill={unitMpPct > 35 ? '#34d399' : '#f59e0b'}
                          />

                          {/* ВОЛНА III: Золотые звёзды ветеранства, трофейные горные единороги и боевой клич полководца */}
                          {vetTrophyTag && (
                            <g className="pointer-events-none">
                              <rect
                                x="-17"
                                y={unitRectY < 0 ? -36.5 : -29.5}
                                width="34"
                                height="8.5"
                                rx="3"
                                fill="#1c1917"
                                fillOpacity="0.94"
                                stroke="#fbbf24"
                                strokeWidth="0.85"
                              />
                              <text
                                x="0"
                                y={unitRectY < 0 ? -30.3 : -23.3}
                                textAnchor="middle"
                                fontSize="5.6"
                                fontWeight="bold"
                                fill="#fde047"
                              >
                                {vetTrophyTag}
                              </text>
                            </g>
                          )}

                          {isUnitSel && (unit.status === 'moving' || vetStarsCount >= 2) && !topCollides && (
                            <g className="pointer-events-none">
                              <rect
                                x="-34"
                                y={vetTrophyTag ? -41.5 : -33.5}
                                width="68"
                                height="9.2"
                                rx="3.2"
                                fill="#064e3b"
                                fillOpacity="0.94"
                                stroke="#fde047"
                                strokeWidth="0.85"
                              />
                              <text
                                x="0"
                                y={vetTrophyTag ? -35.0 : -27.0}
                                textAnchor="middle"
                                fontSize="5.6"
                                fontWeight="bold"
                                fill="#fef3c7"
                              >
                                {t(battleCryRu, battleCryEn)}
                              </text>
                            </g>
                          )}

                          {/* Компактный игровой шильдик отряда */}
                          {showUnitLabel && (
                            <>
                              <rect
                                x={vetStarsCount > 0 ? '-41' : '-36'}
                                y={unitRectY}
                                width={vetStarsCount > 0 ? '82' : '72'}
                                height="11.5"
                                rx="4"
                                fill="#090b10"
                                fillOpacity="0.92"
                                stroke={isCamped ? '#f59e0b' : isUnitSel ? '#ffffff' : unit.color}
                                strokeWidth={isUnitSel ? '1.2' : '0.9'}
                              />
                              <text
                                x="0"
                                y={unitTextY}
                                textAnchor="middle"
                                fontSize="6.7"
                                fontWeight="bold"
                                fill={isCamped ? '#fde68a' : '#ffffff'}
                              >
                                {isCamped ? '⛺ ' : ''}
                                {vetStarsStr ? `${vetStarsStr} ` : ''}
                                {t(unit.badgeRu, unit.badgeEn)} ({unitMp})
                              </text>
                            </>
                          )}
                        </g>
                      </g>
                    );
                  })}

                  {/* УПРЕЖДАЮЩИЙ ПРЕДПРОСМОТР МАРШРУТА И ОЧКОВ ДВИЖЕНИЯ (Total War / Unity of Command II style) */}
                  {hoveredRoutePreview && (
                    <g className="pointer-events-none">
                      {/* Отрезок маршрута, проходимый в ТЕКУЩИЙ ход (изумрудно-золотой) */}
                      <polyline
                        points={hoveredRoutePreview.thisTurnStr}
                        fill="none"
                        stroke="#34d399"
                        strokeWidth="2.3"
                        strokeDasharray="4,2.5"
                        strokeOpacity="0.92"
                      />
                      {/* Продолжение маршрута на СЛЕДУЮЩИЙ ход, если ОД не хватает (янтарный пунктир) */}
                      {hoveredRoutePreview.nextTurnStr && (
                        <polyline
                          points={hoveredRoutePreview.nextTurnStr}
                          fill="none"
                          stroke="#f59e0b"
                          strokeWidth="1.9"
                          strokeDasharray="2.5,3.5"
                          strokeOpacity="0.88"
                        />
                      )}
                      {hoveredRoutePreview.splitPt && (
                        <g transform={`translate(${hoveredRoutePreview.splitPt.x}, ${hoveredRoutePreview.splitPt.y})${pieceTf}`}>
                          <circle r="4.2" fill="#451a03" stroke="#fbbf24" strokeWidth="1.1" />
                        </g>
                      )}
                      {/* Плавающая латунная бирка прогноза у курсора */}
                      <g
                        transform={`translate(${Math.max(
                          vbX + 54 * pieceScale,
                          Math.min(vbX + vbW - 54 * pieceScale, hoveredRoutePreview.tx)
                        )}, ${Math.max(vbY + 20 * pieceScale, hoveredRoutePreview.ty - 15 * pieceScale)})${pieceTf}`}
                      >
                        <rect
                          x="-50"
                          y="-12"
                          width="100"
                          height="13.5"
                          rx="3.5"
                          fill="#0c0a08"
                          fillOpacity="0.94"
                          stroke={hoveredRoutePreview.turnsNeeded === 1 ? '#34d399' : '#f59e0b'}
                          strokeWidth="1.0"
                        />
                        <text
                          x="0"
                          y="-3"
                          textAnchor="middle"
                          fontSize="6.4"
                          fontWeight="bold"
                          fill={hoveredRoutePreview.turnsNeeded === 1 ? '#a7f3d0' : '#fde68a'}
                        >
                          {hoveredRoutePreview.turnsNeeded === 1
                            ? t(
                                `-${hoveredRoutePreview.mpCost} ОД • В этот ход${
                                  hoveredRoutePreview.destAmbushBonus > 0
                                    ? ` (+${hoveredRoutePreview.destAmbushBonus}%)`
                                    : ''
                                }`,
                                `-${hoveredRoutePreview.mpCost} MP • This turn`
                              )
                            : t(
                                `-${hoveredRoutePreview.mpCost} ОД • ${hoveredRoutePreview.turnsNeeded} хода (⛺)`,
                                `-${hoveredRoutePreview.mpCost} MP • ${hoveredRoutePreview.turnsNeeded} turns`
                              )}
                        </text>
                      </g>
                    </g>
                  )}

                  {/* Пошаговые маркеры активных конных гонцов */}
                  {activeEnvoys.map((env) => {
                    const progress = (env.totalTurns - env.turnsLeft + 0.5) / env.totalTurns;
                    const cx = 225 + (env.targetCoords.x - 225) * progress;
                    const cy = 195 + (env.targetCoords.y - 195) * progress;
                    return (
                      <g key={env.id} transform={`translate(${cx}, ${cy})${pieceTf}`}>
                        {renderAuxiliaryMiniature('envoy', '#f59e0b', true)}
                        <text x="0" y="-14" textAnchor="middle" fontSize="7.2" fontWeight="bold" fill="#fde68a">
                          +{env.powder}{t('п', 'p')}
                        </text>
                      </g>
                    );
                  })}

                  {/* СПРИНТ 35 (M35): АНИМИРОВАННЫЕ ЗАЛПЫ ГОРНЫХ ОРУДИЙ, ПАРАБОЛИЧЕСКИЕ ТРАССЫ ЯДЕР И КЛУБЫ ПОРОХОВОГО ДЫМА */}
                  {animatedBattleVfx &&
                    liveCannonSmokePlumes.map((plume) => {
                      const midX = Math.round((plume.fromX + plume.toX) / 2);
                      const midY = Math.round(Math.min(plume.fromY, plume.toY) - 28);
                      const arcPath = `M ${plume.fromX} ${plume.fromY} Q ${midX} ${midY} ${plume.toX} ${plume.toY}`;
                      return (
                        <g key={plume.id} className="pointer-events-none">
                          {/* Параболическая огненная дуга полёта пудовой гранаты */}
                          <path
                            d={arcPath}
                            fill="none"
                            stroke="#fbbf24"
                            strokeWidth="2"
                            strokeDasharray="6,5"
                            strokeOpacity="0.88"
                          >
                            <animate
                              attributeName="stroke-dashoffset"
                              from="22"
                              to="0"
                              dur="0.85s"
                              repeatCount="indefinite"
                            />
                          </path>
                          {/* Клубы порохового дыма и дульная вспышка у батареи */}
                          <g transform={`translate(${plume.fromX}, ${plume.fromY})${pieceTf}`}>
                            <circle r="9" fill="#d6d3d1" fillOpacity="0.42">
                              <animate attributeName="r" values="6;15;6" dur="1.7s" repeatCount="indefinite" />
                              <animate attributeName="fill-opacity" values="0.5;0.12;0.5" dur="1.7s" repeatCount="indefinite" />
                            </circle>
                            <circle r="4.5" fill="#f97316" fillOpacity="0.85" />
                          </g>
                          {/* Разрыв гранаты над вражеской колонной */}
                          <g transform={`translate(${plume.toX}, ${plume.toY})${pieceTf}`}>
                            <circle r="12" fill="#ef4444" fillOpacity="0.3" stroke="#fde047" strokeWidth="1.4">
                              <animate attributeName="r" values="7;19;7" dur="1.25s" repeatCount="indefinite" />
                              <animate attributeName="stroke-opacity" values="0.95;0.2;0.95" dur="1.25s" repeatCount="indefinite" />
                            </circle>
                          </g>
                        </g>
                      );
                    })}

                  {/* СПРИНТ 25 (M25): ЖИВЫЕ МАРКЕРЫ БОЕВЫХ СХВАТОК НА ГОРНЫХ ПЕРЕВАЛАХ (СКРЕЩЕННЫЕ ШАШКИ, ВСПЫШКИ ЗАЛПОВ И ПОРОХОВОЙ ДЫМ) */}
                  {liveSkirmishBursts.map((burst) => (
                    <g key={burst.id} transform={`translate(${burst.x}, ${burst.y})${pieceTf}`} className="pointer-events-none">
                      {/* Клубы порохового дыма схватки */}
                      <circle r="14" fill="#d6d3d1" fillOpacity="0.32">
                        {animatedBattleVfx && (
                          <animate attributeName="r" values="10;18;10" dur="1.25s" repeatCount="indefinite" />
                        )}
                      </circle>
                      {/* Огненная вспышка залпа */}
                      <polygon
                        points="0,-11 3,-3.5 11,-3.5 4.5,1.5 7,9.5 0,4.5 -7,9.5 -4.5,1.5 -11,-3.5 -3,-3.5"
                        fill="#f97316"
                        fillOpacity="0.88"
                        stroke="#fef08a"
                        strokeWidth="0.9"
                      >
                        {animatedBattleVfx && (
                          <animateTransform
                            attributeName="transform"
                            type="scale"
                            values="0.88;1.15;0.88"
                            dur="0.85s"
                            repeatCount="indefinite"
                          />
                        )}
                      </polygon>
                      {/* Скрещенные стальные кавказские шашки */}
                      <line x1="-7.5" y1="6.5" x2="7.5" y2="-7.5" stroke="#f8fafc" strokeWidth="1.8" strokeLinecap="round" />
                      <line x1="7.5" y1="6.5" x2="-7.5" y2="-7.5" stroke="#f8fafc" strokeWidth="1.8" strokeLinecap="round" />
                      <circle cx="-5.5" cy="4.5" r="1.3" fill="#fbbf24" />
                      <circle cx="5.5" cy="4.5" r="1.3" fill="#fbbf24" />
                    </g>
                  ))}

                  {/* СПРИНТ 37 (M37): ЕДИНАЯ ПООЧЕРЁДНАЯ ВСПЛЫВАЮЩАЯ БОЕВАЯ СВОДКА НА КАРТЕ (СМЕНЯЮТ ДРУГ ДРУГА ПО ОДНОЙ БЕЗ НАЛОЖЕНИЙ) */}
                  {(() => {
                    const activeCombatBanners = [
                      ...liveSkirmishBursts.map((b) => ({
                        id: `burst-${b.id}`,
                        x: b.x,
                        y: b.y,
                        text: t(b.titleRu, b.titleEn),
                        stroke: '#fbbf24',
                        textColor: '#fde68a'
                      })),
                      ...(animatedBattleVfx
                        ? floatingCombatPopups.map((p) => ({
                            id: `pop-${p.id}`,
                            x: p.x,
                            y: p.y,
                            text: t(p.textRu, p.textEn),
                            stroke: p.color || '#fbbf24',
                            textColor: p.color || '#fde68a'
                          }))
                        : [])
                    ];
                    if (activeCombatBanners.length === 0) return null;
                    const activeBanner = activeCombatBanners[bannerCycleTick % activeCombatBanners.length];
                    const boxW = Math.round(Math.max(132, Math.min(228, activeBanner.text.length * 4.5 + 22)));
                    const halfBoxW = (boxW / 2) * pieceScale;
                    const marginX = halfBoxW + 6;
                    const bx = Math.max(vbX + marginX, Math.min(vbX + vbW - marginX, activeBanner.x));
                    const overlapsAnyMapLabel = (lx, ly, hw, hh) =>
                      overlapsStationaryLabel(lx, ly, hw, hh) ||
                      (liveImperialColumns || []).some(
                        (col) =>
                          Math.abs(lx - col.x) < hw + 38 * pieceScale &&
                          (Math.abs(ly - (col.y - 14.2 * pieceScale)) < hh + 9 * pieceScale ||
                            Math.abs(ly - (col.y + 18.2 * pieceScale)) < hh + 9 * pieceScale ||
                            Math.abs(ly - col.y) < hh + 12 * pieceScale)
                      ) ||
                      (liveFieldUnits || []).some(
                        (u) =>
                          Math.abs(lx - u.x) < hw + 36 * pieceScale &&
                          (Math.abs(ly - (u.y + 15.2 * pieceScale)) < hh + 8 * pieceScale ||
                            Math.abs(ly - (u.y - 18.2 * pieceScale)) < hh + 8 * pieceScale)
                      );
                    const candidateOffsets = [-38, 28, -54, 42, -25];
                    let by = activeBanner.y - 38 * pieceScale;
                    for (const off of candidateOffsets) {
                      const cy = activeBanner.y + off * pieceScale;
                      if (
                        cy > vbY + 18 &&
                        cy < vbY + vbH - 18 &&
                        !overlapsAnyMapLabel(bx, cy, halfBoxW, 8 * pieceScale)
                      ) {
                        by = cy;
                        break;
                      }
                    }
                    by = Math.max(vbY + 16, Math.min(vbY + vbH - 16, by));

                    return (
                      <g
                        key={activeBanner.id}
                        data-combat-popup-banner="true"
                        transform={`translate(${bx}, ${by})${pieceTf}`}
                        className="pointer-events-none"
                      >
                        <rect
                          x={-boxW / 2}
                          y="-7.5"
                          width={boxW}
                          height="15"
                          rx="5"
                          fill="#090b10"
                          fillOpacity="0.94"
                          stroke={activeBanner.stroke}
                          strokeWidth="1.2"
                        />
                        <text
                          x="0"
                          y="2.4"
                          textAnchor="middle"
                          fontSize="7.2"
                          fontWeight="bold"
                          fill={activeBanner.textColor}
                        >
                          {activeBanner.text}
                        </text>
                      </g>
                    );
                  })()}

                  {/* СПРИНТ 36 (M36): ИНТЕРАКТИВНОЕ КОЛЕСО БЫСТРЫХ ПРИКАЗОВ (RADIAL TACTICAL COMMAND WHEEL) ПРЯМО НА 3D-ДИОРАМЕ */}
                  {radialWheelTarget &&
                    (() => {
                      const wx = Math.max(vbX + wheelMarginX, Math.min(vbX + vbW - wheelMarginX, radialWheelTarget.x));
                      const wy = Math.max(vbY + wheelMarginY, Math.min(vbY + vbH - wheelMarginY, radialWheelTarget.y));
                      return (
                        <g transform={`translate(${wx}, ${wy})${pieceTf}`}>
                          {/* Золотое тактическое кольцо приказов */}
                          <circle
                            r="42"
                            fill="#090c12"
                            fillOpacity="0.65"
                            stroke="#fbbf24"
                            strokeWidth="1.8"
                            strokeDasharray="6,3"
                          />
                          {/* Север (12 часов): Выслать выбранный конный отряд */}
                          <g
                            transform="translate(0, -42)"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExecuteRadialCommand('march_unit');
                            }}
                            className="cursor-pointer"
                          >
                            <rect
                              x="-42"
                              y="-11"
                              width="84"
                              height="20"
                              rx="6"
                              fill="#064e3b"
                              stroke="#34d399"
                              strokeWidth="1.4"
                            />
                            <text x="0" y="2.5" textAnchor="middle" fontSize="7.5" fontWeight="bold" fill="#ecfdf5">
                              🐎 {t('В поход сюда', 'March Unit')}
                            </text>
                          </g>
                          {/* Восток (3 часа): Снарядить гонца с порохом */}
                          <g
                            transform="translate(56, 0)"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExecuteRadialCommand('send_envoy');
                            }}
                            className="cursor-pointer"
                          >
                            <rect
                              x="-38"
                              y="-11"
                              width="76"
                              height="20"
                              rx="6"
                              fill="#451a03"
                              stroke="#fbbf24"
                              strokeWidth="1.4"
                            />
                            <text x="0" y="2.5" textAnchor="middle" fontSize="7.5" fontWeight="bold" fill="#fef3c7">
                              🛢️ {t(`Гонец (${attachedPowder}п)`, `Envoy (${attachedPowder}p)`)}
                            </text>
                          </g>
                          {/* Юг (6 часов): Выйти на 3D Тактическую диораму боя */}
                          <g
                            transform="translate(0, 42)"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExecuteRadialCommand('tactical_battle');
                            }}
                            className="cursor-pointer"
                          >
                            <rect
                              x="-44"
                              y="-9"
                              width="88"
                              height="20"
                              rx="6"
                              fill="#7f1d1d"
                              stroke="#f87171"
                              strokeWidth="1.4"
                            />
                            <text x="0" y="4.5" textAnchor="middle" fontSize="7.5" fontWeight="bold" fill="#fef2f2">
                              ⚔️ {t('Диорама боя', 'Enter Battle')}
                            </text>
                          </g>
                          {/* Запад (9 часов): Дать залп батарей */}
                          <g
                            transform="translate(-56, 0)"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExecuteRadialCommand('fire_salvo');
                            }}
                            className="cursor-pointer"
                          >
                            <rect
                              x="-38"
                              y="-11"
                              width="76"
                              height="20"
                              rx="6"
                              fill="#31102f"
                              stroke="#f472b6"
                              strokeWidth="1.4"
                            />
                            <text x="0" y="2.5" textAnchor="middle" fontSize="7.5" fontWeight="bold" fill="#fce7f3">
                              🔥 {t('Залп батарей', 'Fire Salvo')}
                            </text>
                          </g>
                          {/* Центр: Закрыть колесо приказов */}
                          <g
                            onClick={(e) => {
                              e.stopPropagation();
                              setRadialWheelTarget(null);
                            }}
                            className="cursor-pointer"
                          >
                            <circle r="11" fill="#1c1917" stroke="#fbbf24" strokeWidth="1.5" />
                            <text x="0" y="3.5" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#fde68a">
                              ✕
                            </text>
                          </g>
                        </g>
                      );
                    })()}
                </svg>

                {/* ВЫДЕЛЕННЫЙ АППАРАТНЫЙ GPU-СЛОЙ ВЫСОТНОГО НЕБА (беркуты, облака, гроза, ливень и снег рисуются отдельно, 0 перерисовок рельефа и крепостей!) */}
                {altitudeSkyFactor > 0.02 && (
                  <svg
                    viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
                    className="absolute inset-0 w-full h-full pointer-events-none select-none block"
                    style={{ willChange: 'transform' }}
                    aria-hidden="true"
                  >
                    <AltitudeSkyLayer visibility={altitudeSkyFactor} weather={effectiveSkyWeather} />
                  </svg>
                )}

                {/* МИНИ-КАРТА ТЕАТРА ВОЙНЫ (TOTAL WAR): рамка камеры, отряды, колонны РИ, крепости, осаждённые аулы */}
                <Minimap
                  mapW={MAP_W}
                  mapH={MAP_H}
                  view={{ x: vbX, y: vbY, w: vbW, h: vbH }}
                  zoom={mapZoom}
                  units={liveFieldUnits}
                  enemies={liveImperialColumns || []}
                  forts={cordonFortresses || []}
                  naibates={naibates}
                  selectedUnitId={selectedUnitId}
                  onJump={handleMinimapJump}
                  onZoom={handleAdjustZoom}
                  onReset={handleResetCamera}
                  t={t}
                  className="top-2 right-2 hidden sm:block"
                />
                </>
                )}
                </div>

                {/* НИЖНЯЯ ПОЛОСА КАРТОЧЕК ОТРЯДОВ (TOTAL WAR): портреты командиров, статус, ход маршрута; клик — облёт камеры */}
                <UnitCardBar
                  units={liveFieldUnits}
                  enemies={liveImperialColumns || []}
                  selectedUnitId={selectedUnitId}
                  onPickUnit={handlePickUnitCard}
                  onPickEnemy={handlePickEnemyCard}
                  t={t}
                />

                {/* СПРИНТ 35 (M35): ПОЛУПРОЗРАЧНЫЕ КОМАНДНЫЕ ВИДЖЕТЫ СТОЛА ПОЛКОВОДЦА В ПОЛНОЭКРАННОМ РЕЖИМЕ (FULL-SCREEN TABLE HUD) */}
                {fullScreenTableMode && (
                  <>
                    {/* Левый нижний виджет: Казна Байт-уль-Мал, Стресс Шамиля и Завершение хода */}
                    <div className="absolute bottom-10 left-3 z-20 bg-[#090c12]/90 backdrop-blur-md border border-amber-500/45 rounded-xl p-2 shadow-2xl space-y-1.5 max-w-[260px] text-[10.5px]">
                      <div className="flex items-center justify-between gap-3 border-b border-stone-800 pb-1">
                        <span className="font-serif font-bold text-amber-300 uppercase">
                          🦅 {t('Ставка Имама (Байт-уль-Мал)', 'Imam’s HQ (Bayt al-Mal)')}
                        </span>
                        <span className="font-mono text-[10px] text-emerald-300 font-bold">
                          {t('Ход', 'Turn')} #{turn}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 font-mono text-[10.5px]">
                        <span className="px-2 py-0.5 rounded bg-orange-500/15 border border-orange-500/30 text-orange-300 font-bold">
                          🛢️ {t('Порох', 'Powder')}: {resources.gunpowder}п
                        </span>
                        <span className="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold">
                          🪙 {t('Серебро', 'Silver')}: {resources.silver}₽
                        </span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold">
                          🌾 {t('Зерно', 'Grain')}: {resources.provisions}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-rose-500/15 border border-rose-500/30 text-rose-300 font-bold">
                          🧠 {t('Стресс', 'Strain')}: {leaderStressData.totalStress}%
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={handleNextTurn}
                          className="flex-1 py-1.5 px-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-mono text-[10.5px] font-extrabold uppercase cursor-pointer shadow"
                        >
                          ⏳ {t('Завершить ход', 'End Turn')}
                        </button>
                        <button
                          onClick={handleTriggerArtillerySmokeVfx}
                          className="py-1.5 px-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-mono text-[10.5px] font-extrabold cursor-pointer shadow"
                        >
                          🔥 {t('Залп', 'Salvo')}
                        </button>
                      </div>
                    </div>

                    {/* Правый нижний виджет: Выбранное наибство, быстрый гонец и вход в тактический бой */}
                    <div className="absolute bottom-10 right-3 z-20 bg-[#090c12]/90 backdrop-blur-md border border-emerald-500/45 rounded-xl p-2 shadow-2xl space-y-1.5 max-w-[260px] text-[10.5px]">
                      <div className="flex items-center justify-between gap-2 border-b border-stone-800 pb-1">
                        <span className="font-serif font-bold text-stone-100 truncate">
                          🏰 {t(selectedNaibate.name, selectedNaibate.nameEn || selectedNaibate.name)} —{' '}
                          <span className="text-amber-300">
                            {t(selectedNaibate.naibName, selectedNaibate.naibNameEn || selectedNaibate.naibName)}
                          </span>
                        </span>
                      </div>
                      <div className="flex items-center justify-between font-mono text-[10.5px] text-stone-300">
                        <span>
                          🛡️ {selectedNaibate.garrison} {t('шт.', 'gar.')}
                        </span>
                        <span className="text-orange-300 font-bold">
                          🛢️ {selectedNaibate.gunpowder}п
                        </span>
                        <span className="text-emerald-300 font-bold">
                          P(exec): {orderExecutionCalc.chance}%
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={handleSendEnvoy}
                          className="flex-1 py-1.5 px-2 rounded-lg bg-amber-500/25 hover:bg-amber-500/35 border border-amber-400/60 text-amber-200 font-mono text-[10px] font-bold cursor-pointer"
                        >
                          🐎 {t(`Гонец (${attachedPowder}п)`, `Courier (${attachedPowder}p)`)}
                        </button>
                        <button
                          onClick={() => handleEnterTacticalDiorama(selectedNaibate)}
                          className="py-1.5 px-2 rounded-lg bg-emerald-500/25 hover:bg-emerald-500/35 border border-emerald-400/60 text-emerald-200 font-mono text-[10px] font-bold cursor-pointer"
                        >
                          ⚔️ {t('В бой', 'Battle')}
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* СПРИНТ 37 (M37): МИНИ-РАДАР УГРОЗ И БЫСТРОГО ПЕРЕКЛЮЧЕНИЯ КАМЕРЫ ПО ГОРЯЧИМ ТОЧКАМ ТВД (THREAT RADAR BAR) */}
                {showThreatRadarOverlay && (
                  <div className="bg-[#10131c]/95 border-t border-rose-500/35 px-3.5 py-1.5 flex flex-wrap items-center justify-between gap-2 text-[10.5px] font-mono">
                    <div className="flex items-center gap-1.5 text-rose-300 font-bold">
                      <span>📡 {t('РАДАР УГРОЗ ТВД (1-КЛИК ФОКУС):', 'THEATER THREAT RADAR (1-CLICK FOCUS):')}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        onClick={() => handleFocusThreatHotspot('siege')}
                        className="px-2 py-0.5 rounded bg-red-500/20 hover:bg-red-500/35 border border-red-400/50 text-red-200 font-bold cursor-pointer transition"
                      >
                        🚨 {t('Осада аула', 'Besieged Aul')} ({naibates.filter((n) => n.underSiege).length})
                      </button>
                      <button
                        onClick={() => handleFocusThreatHotspot('column')}
                        className="px-2 py-0.5 rounded bg-orange-500/20 hover:bg-orange-500/35 border border-orange-400/50 text-orange-200 font-bold cursor-pointer transition"
                      >
                        ⚔️ {t('Перехват главной колонны РИ', 'Intercept Lead Column')}
                      </button>
                      <button
                        onClick={() => handleFocusThreatHotspot('convoy')}
                        className="px-2 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/35 border border-emerald-400/50 text-emerald-200 font-bold cursor-pointer transition"
                      >
                        🐪 {t('Прикрыть караван селитры', 'Escort Saltpeter Caravan')}
                      </button>
                      <button
                        onClick={() => handleFocusThreatHotspot('mine')}
                        className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/35 border border-amber-400/50 text-amber-200 font-bold cursor-pointer transition"
                      >
                        💣 {t('Залп батарей (-85 шт.)', 'Battery Salvo (-85 Bay.)')}
                      </button>
                    </div>
                  </div>
                )}

                {/* КОМПАКТНАЯ ОДНОСТРОЧНАЯ ПАНЕЛЬ ИНСПЕКТОРА И РЕЛЬЕФА ВНИЗУ 3D-СТОЛА */}
                {(() => {
                  const probeWeather = sampleWeatherAtPoint(
                    terrainProbe.x,
                    terrainProbe.y,
                    liveWeatherFronts,
                    weatherOverlayEnabled
                  );
                  const combinedSpeedMult = Math.round(terrainProbe.speedMult * probeWeather.speedMult * 100) / 100;
                  return (
                    <div className="bg-[#090c12]/95 border-t border-amber-500/30 px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 text-[10.5px]">
                      {hoveredMapInfo ? (
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-sm shrink-0">{hoveredMapInfo.icon}</span>
                          <span className="font-bold text-amber-300 truncate">
                            {t(hoveredMapInfo.titleRu, hoveredMapInfo.titleEn)}
                          </span>
                          <span className="text-stone-400 truncate hidden sm:inline">
                            • {t(hoveredMapInfo.detailRu, hoveredMapInfo.detailEn)}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-400/50 text-amber-200 font-mono text-[10px] font-bold shrink-0">
                            🖱️ {t(hoveredMapInfo.actionRu, hoveredMapInfo.actionEn)}
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span
                            className="px-1.5 py-0.5 rounded font-mono text-[9.5px] font-extrabold text-stone-950"
                            style={{ backgroundColor: selectedFieldUnit.color }}
                          >
                            {t(selectedFieldUnit.badgeRu, selectedFieldUnit.badgeEn)}
                          </span>
                          <span className="font-bold text-stone-100">
                            {t(selectedFieldUnit.nameRu, selectedFieldUnit.nameEn)}
                          </span>
                          <span className="text-stone-400 font-mono text-[10px]">
                            → {t(selectedFieldUnit.targetLabelRu, selectedFieldUnit.targetLabelEn)}
                          </span>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-1.5 font-mono text-[10px]">
                        <span className="px-1.5 py-0.5 rounded bg-sky-500/15 border border-sky-500/35 text-sky-300 font-bold">
                          ⛰️ {terrainProbe.elevationMeters}{t('м', 'm')} • {terrainProbe.slopeDeg}°
                        </span>
                        <span className="text-stone-300 hidden md:inline">
                          🌲 {t(terrainProbe.biomeRu, terrainProbe.biomeEn)}
                        </span>
                        <span className="text-emerald-300 font-bold">
                          🐎 ×{combinedSpeedMult}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-red-500/15 border border-red-500/35 text-red-300 font-bold">
                          ⚔️ {totalMapInterceptions}
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>
              </div>

              {/* ЕДИНАЯ ПАЛАТА ДИВАН-ХАНЫ И ПОЛЕВОЙ ШТАБ ПОЛКОВОДЦА (ОБЪЕДИНЁННАЯ ПАНЕЛЬ ПОД 3D-СТОЛОМ) */}
              <div className="hud-walnut-bezel bg-gradient-to-r from-[#14110e] via-[#191512] to-[#11151e] border border-amber-500/45 rounded-xl p-2.5 shadow-2xl space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-amber-500/15 border border-amber-400/50 text-amber-200 font-serif text-[11px] font-bold tracking-wide">
                      <WaxSealIcon className="w-3.5 h-3.5 text-amber-300" />
                      <span>{t('Палата Диван-ханы и Штаб', 'Divan Chamber & Field HQ')}</span>
                    </span>
                    {turnActionQuota && (
                      <span className="hud-num text-[11px] font-semibold text-emerald-300 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded">
                        {t(
                          `Печати: ${turnActionQuota.sealsRemaining}/${turnActionQuota.maxSeals}`,
                          `Seals: ${turnActionQuota.sealsRemaining}/${turnActionQuota.maxSeals}`
                        )}
                      </span>
                    )}
                    <span className="hidden xl:inline-flex items-center gap-1.5 text-[11px] text-stone-300 border-l border-stone-700/80 pl-2">
                      <span className="text-amber-300 font-semibold">
                        {t(selectedFieldUnit.nameRu, selectedFieldUnit.nameEn)}
                      </span>
                      <span className="hud-num text-[10.5px] text-emerald-300">
                        ({t('ОД', 'MP')}: {Math.round(selectedFieldUnit.mp ?? 80)}/{selectedFieldUnit.maxMp || 80})
                      </span>
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                    <button
                      onClick={() =>
                        setTableQuickDrawer &&
                        setTableQuickDrawer(tableQuickDrawer === 'arsenal' ? null : 'arsenal')
                      }
                      className={`px-2 py-1 rounded-lg border font-semibold cursor-pointer transition ${
                        tableQuickDrawer === 'arsenal'
                          ? 'bg-amber-400 text-stone-950 border-amber-200 shadow font-bold'
                          : 'bg-stone-900/90 hover:bg-stone-800 text-amber-200 border-amber-500/35'
                      }`}
                    >
                      ⚙️ {t('Арсенал Ведено', 'Vedeno Arsenal')}
                    </button>
                    <button
                      onClick={() =>
                        setTableQuickDrawer &&
                        setTableQuickDrawer(tableQuickDrawer === 'diplomacy' ? null : 'diplomacy')
                      }
                      className={`px-2 py-1 rounded-lg border font-semibold cursor-pointer transition ${
                        tableQuickDrawer === 'diplomacy'
                          ? 'bg-emerald-400 text-stone-950 border-emerald-200 shadow font-bold'
                          : 'bg-stone-900/90 hover:bg-stone-800 text-emerald-200 border-emerald-500/35'
                      }`}
                    >
                      🌙 {t('Стамбул и Ордена', 'Istanbul & Orders')}
                    </button>
                    <button
                      onClick={() =>
                        setTableQuickDrawer &&
                        setTableQuickDrawer(tableQuickDrawer === 'scrolls' ? null : 'scrolls')
                      }
                      className={`px-2 py-1 rounded-lg border font-semibold cursor-pointer transition ${
                        tableQuickDrawer === 'scrolls'
                          ? 'bg-sky-400 text-stone-950 border-sky-200 shadow font-bold'
                          : 'bg-stone-900/90 hover:bg-stone-800 text-sky-200 border-sky-500/35'
                      }`}
                    >
                      📜 {t('Свитки сезона', 'Season Scrolls')}
                    </button>
                    <button
                      onClick={() =>
                        setTableQuickDrawer &&
                        setTableQuickDrawer(tableQuickDrawer === 'rivalries' ? null : 'rivalries')
                      }
                      className={`px-2 py-1 rounded-lg border font-semibold cursor-pointer transition ${
                        tableQuickDrawer === 'rivalries'
                          ? 'bg-rose-400 text-stone-950 border-rose-200 shadow font-bold'
                          : 'bg-stone-900/90 hover:bg-stone-800 text-rose-200 border-rose-500/35'
                      }`}
                    >
                      ⚖️ {t('Споры наибов', 'Naib Rivalries')} <span className="hud-num">({naibRivalries.filter((r) => !r.resolved).length})</span>
                    </button>

                    <span className="hidden sm:inline-block w-px h-4 bg-stone-700/80 mx-0.5" />

                    {handleSeverColumnSupplyLine && (
                      <button
                        onClick={() => handleSeverColumnSupplyLine()}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-orange-500/20 hover:bg-orange-500/35 border border-orange-400/60 text-orange-200 font-bold cursor-pointer transition"
                        title={t(
                          'Нанести конный удар по растянутому сухарному обозу царской колонны на 3D-карте',
                          'Strike the stretched rear supply line of an advancing Imperial column on the 3D map'
                        )}
                      >
                        <SeveredConvoyIcon className="w-3.5 h-3.5 text-orange-300" />
                        <span>{t('Обоз РИ (+22п)', 'Cut Supply (+22p)')}</span>
                      </button>
                    )}
                    <button
                      onClick={() =>
                        handleCommandUnitMoveToPoint(
                          selectedUnitId,
                          selectedNaibate.coords.x,
                          selectedNaibate.coords.y,
                          `${selectedNaibate.name} (${selectedNaibate.naibName})`,
                          `${selectedNaibate.nameEn || selectedNaibate.name} (${selectedNaibate.naibNameEn || selectedNaibate.naibName})`
                        )
                      }
                      className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold cursor-pointer shadow"
                    >
                      🎯 {t(`В «${selectedNaibate.name}»`, `To “${selectedNaibate.nameEn || selectedNaibate.name}”`)}
                    </button>
                    <button
                      onClick={() => handleInterceptImperialColumn(null)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold cursor-pointer shadow"
                    >
                      <ShashkaSabersIcon className="w-3.5 h-3.5 text-amber-200" />
                      <span>{t('На перехват РИ', 'Intercept')}</span>
                    </button>
                    {handleOpenBattlePrelude && (
                      <button
                        onClick={() => handleOpenBattlePrelude(null)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-600/25 hover:bg-amber-500/35 border border-amber-400/65 text-amber-200 font-bold cursor-pointer transition"
                        title={t(
                          'Созвать Предбоевой совет против ближайшей наступающей колонны РИ (выбор: личный бой, авторасчёт или отход)',
                          'Open Pre-Battle Council against the nearest advancing Imperial column'
                        )}
                      >
                        <WaxSealIcon className="w-3.5 h-3.5 text-amber-300" />
                        <span>{t('Совет боя', 'Battle Council')}</span>
                      </button>
                    )}
                    {handleSummonDivanPacket && (
                      <button
                        onClick={handleSummonDivanPacket}
                        className="relative inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-950/85 hover:bg-rose-900/90 border border-rose-400/65 text-amber-100 font-bold cursor-pointer transition"
                        title={t(
                          'Вскрыть срочный сургучный пакет гонца в Диван-хане (живые дилеммы осаждённых аулов, Хаджи-Мурата, пленных офицеров и фелюг)',
                          'Unseal an urgent courier dispatch in the Divan-Khana'
                        )}
                      >
                        <span>📜</span>
                        <span>{t('Пакет гонца', 'Courier Packet')}</span>
                        {activeDivanPacket && (
                          <span className="inline-block w-2 h-2 rounded-full bg-amber-300 animate-pulse" />
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => setShowCommandDeckDetails((prev) => !prev)}
                      className={`px-2 py-1 rounded-lg font-semibold cursor-pointer border transition ${
                        showCommandDeckDetails
                          ? 'bg-sky-500/20 border-sky-400 text-sky-200'
                          : 'bg-stone-900/90 border-stone-700 text-stone-300 hover:text-white'
                      }`}
                    >
                      {t('Штаб ТВД', 'Theater Deck')} {showCommandDeckDetails ? '▴' : '▾'}
                    </button>
                  </div>
                </div>

                {/* ВОЛНА III: СУРГУЧНЫЙ ПАКЕТ ГОНЦА В ДИВАН-ХАНЕ (ЖИВЫЕ СЕЗОННЫЕ ДИЛЕММЫ И РЕШЕНИЯ ШАМИЛЯ) */}
                {activeDivanPacket && handleResolveDivanPacket && (
                  <div className="relative hud-walnut-bezel bg-gradient-to-r from-[#26110e] via-[#1b1410] to-[#131915] border-2 border-amber-500/75 rounded-xl p-3 shadow-2xl space-y-2.5">
                    <span className="hud-brass-corner tl" />
                    <span className="hud-brass-corner tr" />
                    <span className="hud-brass-corner bl" />
                    <span className="hud-brass-corner br" />
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <PortraitMedallion
                          src={findPortrait(activeDivanPacket.portraitHint, activeDivanPacket.senderRu)}
                          name={activeDivanPacket.portraitHint || activeDivanPacket.senderRu}
                          color="#f59e0b"
                          size={44}
                          selected
                        />
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-serif uppercase tracking-wider">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-900/80 border border-rose-400/60 text-rose-100 font-extrabold">
                              <WaxSealIcon className="w-3 h-3 text-amber-300" />
                              <span>{t('СУРГУЧНЫЙ ПАКЕТ ДИВАН-ХАНЫ', 'DIVAN-KHANA WAX-SEALED DISPATCH')}</span>
                            </span>
                            <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-400/50 text-amber-200 font-bold">
                              {t(activeDivanPacket.urgencyRu, activeDivanPacket.urgencyEn)}
                            </span>
                            <span className="text-stone-300 font-semibold truncate">
                              • {t(activeDivanPacket.senderRu, activeDivanPacket.senderEn)}
                            </span>
                          </div>
                          <div className="text-xs sm:text-sm font-serif font-extrabold text-amber-100">
                            {t(activeDivanPacket.titleRu, activeDivanPacket.titleEn)}
                          </div>
                          <p className="text-[11.5px] text-stone-200/95 leading-snug max-w-4xl">
                            {t(activeDivanPacket.descRu, activeDivanPacket.descEn)}
                          </p>
                        </div>
                      </div>
                      {setActiveDivanPacket && (
                        <button
                          onClick={() => setActiveDivanPacket(null)}
                          aria-label={t('Отложить пакет гонца', 'Defer courier packet')}
                          className="px-2 py-1 rounded bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 text-xs cursor-pointer shrink-0"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1.5 border-t border-amber-500/25">
                      {(activeDivanPacket.choices || []).map((ch, idx) => (
                        <button
                          key={ch.id}
                          onClick={() => handleResolveDivanPacket(activeDivanPacket, ch)}
                          className={`text-left px-3 py-2 rounded-lg border transition cursor-pointer flex items-start gap-2 ${
                            idx === 0
                              ? 'bg-gradient-to-b from-amber-500/25 to-amber-900/40 hover:from-amber-500/35 hover:to-amber-800/50 border-amber-400/75 text-amber-100'
                              : idx === 1
                              ? 'bg-emerald-950/75 hover:bg-emerald-900/80 border-emerald-500/55 text-emerald-100'
                              : 'bg-stone-900/95 hover:bg-stone-800 border-stone-600/80 text-stone-100'
                          }`}
                        >
                          <WaxSealIcon className="w-3.5 h-3.5 text-amber-300 shrink-0 mt-0.5" />
                          <span className="text-[11px] font-serif font-bold leading-snug">
                            {t(ch.labelRu, ch.labelEn)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Выдвижной ящик 1: Литейный Арсенал Ведено и диверсия в тылу */}
                {tableQuickDrawer === 'arsenal' && (
                  <div className="bg-stone-950/90 border border-amber-500/40 rounded-xl p-3 space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-800 pb-2">
                      <div>
                        <span className="text-xs font-serif font-bold text-amber-300">
                          ⚙️ {t('Литейный двор устаза Джабраила и инженера Хаджи-Юсуфа в Ведено', 'Vedeno Foundry of Ustaz Jabrail & Chief Engineer Hajji Yusuf')}
                        </span>
                        <p className="text-[11px] text-stone-400">
                          {t(
                            'Отливайте горные единороги, стройте селитренные варницы или отправьте лазутчиков на склады врага прямо со стола карты.',
                            'Cast mountain unicorns, build saltpeter works, or dispatch scouts against enemy supply depots directly from the map table.'
                          )}
                        </p>
                      </div>
                      {handleDisruptImperialColumn && (
                        <button
                          onClick={handleDisruptImperialColumn}
                          className="px-3 py-1.5 rounded-lg bg-rose-600/25 hover:bg-rose-600/40 border border-rose-500/50 text-rose-200 font-mono text-[11px] font-bold cursor-pointer"
                        >
                          🔥 {t('Диверсия на складах РИ (-18п, -80₽ → -950 шт.)', 'Sabotage Imperial Depots (-18p, -80r → -950 bay.)')}
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
                      {arsenalItems.map((item) => (
                        <div
                          key={item.id}
                          className="bg-stone-900/90 border border-stone-800 rounded-lg p-2.5 flex flex-col justify-between gap-2"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs font-bold text-stone-100">
                                {t(item.name, item.nameEn || item.name)}
                              </span>
                              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold">
                                ×{item.completedCount}
                              </span>
                            </div>
                            <p className="text-[10.5px] text-emerald-300 mt-1">
                              {t(item.effectSummary, item.effectSummaryEn || item.effectSummary)}
                            </p>
                          </div>
                          <button
                            onClick={() => handleCraftArsenalItem && handleCraftArsenalItem(item)}
                            className="w-full py-1 px-2 rounded bg-amber-500 hover:bg-amber-400 text-stone-950 font-mono text-[10.5px] font-extrabold cursor-pointer"
                          >
                            🔨 {t(`Заказать (${item.costSilver}₽ / ${item.costPowder}п)`, `Commission (${item.costSilver}r / ${item.costPowder}p)`)}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Выдвижной ящик 2: Дипломатия со Стамбулом и Серебряные ордена для выбранного наиба */}
                {tableQuickDrawer === 'diplomacy' && (
                  <div className="bg-stone-950/90 border border-emerald-500/40 rounded-xl p-3 space-y-3">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <div className="text-xs font-serif font-bold text-emerald-300">
                          🌙 {t('Черноморские фелюги и посольства в Стамбул / Трапезунд', 'Black Sea Feluccas & Envoys to Istanbul / Trabzon')}
                        </div>
                        <div className="space-y-1.5">
                          {OTTOMAN_OPTIONS.map((opt) => (
                            <div
                              key={opt.id}
                              className="bg-stone-900/90 border border-stone-800 rounded-lg p-2 flex items-center justify-between gap-2"
                            >
                              <div className="min-w-0">
                                <div className="text-[11.5px] font-bold text-stone-100 truncate">
                                  {t(opt.title, opt.titleEn || opt.title)}
                                </div>
                                <div className="text-[10px] font-mono text-emerald-300">
                                  +{opt.rewardPowder}п {t('пороха', 'powder')} • +{opt.rewardSupport}% {t('Порты', 'Porte')}
                                </div>
                              </div>
                              <button
                                onClick={() => handleOttomanDiplomacy && handleOttomanDiplomacy(opt)}
                                className="px-2.5 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-mono text-[10.5px] font-extrabold shrink-0 cursor-pointer"
                              >
                                {opt.costSilver}₽ →
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-xs font-serif font-bold text-amber-300">
                          🏅 {t(
                            `Жаловать серебряный орден выбранному наибу: ${selectedNaibate?.naibName || ''}`,
                            `Award Silver Medal to Selected Naib: ${selectedNaibate?.naibNameEn || selectedNaibate?.naibName || ''}`
                          )}
                        </div>
                        <div className="space-y-1.5">
                          {SHAMIL_ORDERS.map((ord) => (
                            <div
                              key={ord.id}
                              className="bg-stone-900/90 border border-stone-800 hover:border-amber-500/50 rounded-lg p-2 flex items-center justify-between gap-2 transition"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <ShamilOrderMedallion
                                  orderId={ord.id}
                                  size={36}
                                  showVelvet
                                  title={t(ord.name, ord.nameEn || ord.name)}
                                />
                                <div className="min-w-0">
                                  <div className="text-[11.5px] font-bold text-amber-200 truncate">
                                    {t(ord.name, ord.nameEn || ord.name)}
                                  </div>
                                  <div className="text-[10px] font-mono text-stone-300">
                                    {t('Иман', 'Iman')} +{ord.imanBonus} • {t('Гордыня', 'Pride')} -{ord.prideReduction}
                                  </div>
                                </div>
                              </div>
                              <button
                                onClick={() => handleAwardOrder && handleAwardOrder(ord)}
                                className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-stone-950 font-mono text-[10.5px] font-extrabold shrink-0 cursor-pointer"
                              >
                                {ord.silverCost}₽ →
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Выдвижной ящик 3: Сургучные свитки сезона (Утверждение Низамов и Развилок прямо со стола) */}
                {tableQuickDrawer === 'scrolls' && (
                  <div className="bg-stone-950/90 border border-sky-500/40 rounded-xl p-3 grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <div className="text-xs font-serif font-bold text-sky-300">
                        📜 {t('Непринятые государственные уставы (Кодекс Низамов)', 'Pending State Statutes (Nizam Code)')}
                      </div>
                      {nizams
                        .filter((n) => !n.enacted && (n.unlockTurn || 1) <= turn)
                        .sort((a, b) => (a.unlockTurn || 1) - (b.unlockTurn || 1))
                        .slice(0, 3)
                        .map((niz) => (
                        <div
                          key={niz.id}
                          className="bg-stone-900/90 border border-stone-800 rounded-lg p-2 flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <div className="text-[11.5px] font-bold text-stone-100 truncate">
                              {t(niz.title, niz.titleEn || niz.title)}
                            </div>
                            <div className="text-[10px] text-emerald-300 truncate">
                              {t(niz.effectsSummary, niz.effectsSummaryEn || niz.effectsSummary)}
                            </div>
                          </div>
                          <button
                            onClick={() => handleEnactNizam && handleEnactNizam(niz)}
                            className="px-2.5 py-1 rounded bg-sky-400 hover:bg-sky-300 text-stone-950 font-mono text-[10px] font-extrabold shrink-0 cursor-pointer"
                          >
                            🔏 {niz.costSilver}₽
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <div className="text-xs font-serif font-bold text-amber-300">
                        🔥 {t('Открытые исторические развилки текущего сезона', 'Unlocked Historical Crossroads This Season')}
                      </div>
                      {crises
                        .filter((c) => !c.resolved && (c.unlockTurn || 1) <= turn)
                        .slice(0, 2)
                        .map((cr) => (
                          <div
                            key={cr.id}
                            className="bg-stone-900/90 border border-amber-500/30 rounded-lg p-2 space-y-1.5"
                          >
                            <div className="text-[11.5px] font-bold text-amber-200">
                              {t(cr.year, cr.yearEn || cr.year)}: {t(cr.title, cr.titleEn || cr.title)}
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {(cr.options || []).map((opt) => (
                                <button
                                  key={opt.id}
                                  onClick={() =>
                                    handleResolveHistoricalCrisis && handleResolveHistoricalCrisis(cr, opt)
                                  }
                                  className="px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/35 border border-amber-400/50 text-amber-100 font-mono text-[10px] font-bold cursor-pointer"
                                >
                                  ✒️ {t(opt.label, opt.labelEn || opt.label)}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Выдвижной ящик 4: Живые интриги и споры между самими наибами */}
                {tableQuickDrawer === 'rivalries' && (
                  <div className="bg-stone-950/90 border border-rose-500/40 rounded-xl p-3 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-serif font-bold text-rose-300">
                        ⚖️ {t('Живые споры и соперничество между наибами за столом Диван-ханы', 'Live Inter-Naib Rivalries & Factional Disputes at the Divan-Khana')}
                      </span>
                      <button
                        onClick={() => setActiveTab('nizams')}
                        className="text-[10.5px] font-mono text-amber-300 hover:underline cursor-pointer"
                      >
                        {t('Открыть полный зал Суда и Низамов →', 'Open Full Court & Nizams Hall →')}
                      </button>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5">
                      {naibRivalries.map((riv) => {
                        const isRivalryLocked = !riv.resolved && (riv.unlockTurn || 1) > turn;
                        return (
                        <div
                          key={riv.id}
                          className={`rounded-lg border p-2.5 space-y-2 ${
                            riv.resolved
                              ? 'bg-emerald-950/20 border-emerald-500/40'
                              : isRivalryLocked
                                ? 'bg-stone-950/60 border-stone-800 opacity-75'
                                : 'bg-stone-900/90 border-rose-500/35'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              {findPortrait(riv.naibAPortrait) && (
                                <img
                                  src={findPortrait(riv.naibAPortrait)}
                                  alt={riv.naibAPortrait}
                                  className="w-7 h-7 rounded-full object-cover object-top border border-amber-400"
                                />
                              )}
                              <span className="text-xs font-bold text-rose-400">⚡</span>
                              {findPortrait(riv.naibBPortrait) && (
                                <img
                                  src={findPortrait(riv.naibBPortrait)}
                                  alt={riv.naibBPortrait}
                                  className="w-7 h-7 rounded-full object-cover object-top border border-sky-400"
                                />
                              )}
                            </div>
                            <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-200 font-mono text-[10px] font-bold">
                              {isRivalryLocked
                                ? `🔒 ${t(`Ход #${riv.unlockTurn}`, `Turn #${riv.unlockTurn}`)}`
                                : `${t('Накал:', 'Tension:')} ${riv.tension}%`}
                            </span>
                          </div>
                          <div className="text-[11.5px] font-bold text-stone-100">
                            {t(riv.titleRu, riv.titleEn)}
                          </div>
                          <p className="text-[10.5px] text-stone-300 italic leading-snug">
                            {t(riv.quoteRu, riv.quoteEn)}
                          </p>
                          {riv.resolved ? (
                            <div className="text-[10.5px] font-mono text-emerald-300 font-bold">
                              ✓ {t(riv.chosenLabelRu, riv.chosenLabelEn)}
                            </div>
                          ) : isRivalryLocked ? (
                            <div className="text-[10px] font-mono text-stone-400">
                              🔒 {t(`Откроется на Ходу #${riv.unlockTurn} (${riv.actBadgeRu})`, `Unlocks on Turn #${riv.unlockTurn} (${riv.actBadgeEn})`)}
                            </div>
                          ) : (
                            <div className="space-y-1">
                              {riv.options.map((opt) => (
                                <button
                                  key={opt.id}
                                  onClick={() =>
                                    handleMediateNaibRivalry && handleMediateNaibRivalry(riv.id, opt)
                                  }
                                  className="w-full text-left px-2 py-1 rounded bg-stone-950 hover:bg-amber-500/20 border border-stone-700 hover:border-amber-400/50 text-[10px] font-mono text-amber-200 cursor-pointer transition"
                                >
                                  ⚖️ {t(opt.labelRu, opt.labelEn)}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                      })}
                    </div>
                  </div>
                )}

                {showCommandDeckDetails && (
                  <>
                <div className="flex flex-wrap items-center justify-between gap-1.5 bg-[#080b10] p-1.5 rounded-xl border border-stone-800">
                  <div className="flex flex-wrap items-center gap-1">
                  {[
                    { id: 'units', icon: '⚔️', ru: 'Армия и Перехват', en: 'Army & Intercept' },
                    { id: 'defense', icon: '🏰', ru: 'Рубежи и Мосты', en: 'Fortifications & Bridges' },
                    { id: 'artillery_forest', icon: '💣', ru: 'Батареи и Леса', en: 'Artillery & Forests' },
                    { id: 'economy', icon: '🐪', ru: 'Караваны и ВПК', en: 'Caravans & Industry' },
                    { id: 'medicine_muhajir', icon: '🏥', ru: 'Лазареты и Обозы', en: 'Lazarets & Muhajirs' },
                    { id: 'intel_diplomacy', icon: '🕵️', ru: 'Разведка и Миссии', en: 'Intel & Diplomacy' },
                    { id: 'all', icon: '📋', ru: 'Все сводки', en: 'All Panels' }
                  ].map((tab) => {
                    const isTabActive = commandDockTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setCommandDockTab(tab.id)}
                        className={`px-2 py-1 rounded-lg font-mono text-[10px] font-bold transition cursor-pointer flex items-center gap-1 ${
                          isTabActive
                            ? 'bg-amber-500 text-stone-950 font-extrabold shadow-md'
                            : 'bg-[#121620] text-stone-300 hover:bg-stone-800 hover:text-white border border-stone-800'
                        }`}
                      >
                        <span>{tab.icon}</span>
                        <span>{t(tab.ru, tab.en)}</span>
                      </button>
                    );
                  })}
                  </div>
                  <div className="flex items-center gap-1">
                    {[
                      { mult: 0.8, label: '0.8×' },
                      { mult: 1.25, label: '1.25×' },
                      { mult: 2.2, label: '2.2×' }
                    ].map((sp) => (
                      <button
                        key={sp.label}
                        onClick={() => setTerrainSimSpeed(sp.mult)}
                        className={`px-2 py-0.5 rounded font-mono text-[10px] cursor-pointer border ${
                          terrainSimSpeed === sp.mult
                            ? 'bg-sky-500 text-stone-950 font-bold border-sky-400'
                            : 'bg-stone-900 text-stone-400 border-stone-700 hover:text-stone-200'
                        }`}
                      >
                        {sp.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ВКЛАДКА 1 (units): ПОЛЕВЫЕ ОТРЯДЫ ИМАМАТА, БЫСТРЫЕ ПРИКАЗЫ И НАСТУПАЮЩИЕ КОЛОННЫ РИ */}
                <div className={commandDockTab === 'units' || commandDockTab === 'all' ? 'space-y-2.5' : 'hidden'}>
                  {/* Карточки выбора 5 полевых отрядов Имамата */}
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                    {liveFieldUnits.map((u) => {
                      const isSel = u.id === selectedUnitId;
                      const uTerr = sampleStrategicTerrain(u.x, u.y);
                      const curMp = Math.round(u.mp ?? 80);
                      const maxMp = u.maxMp || 80;
                      return (
                        <button
                          key={u.id}
                          onClick={() => {
                            setSelectedUnitId(u.id);
                            playHistoricalSound('paper', soundEnabled);
                          }}
                          className={`text-left p-2 rounded-lg border transition cursor-pointer ${
                            isSel
                              ? 'bg-sky-500/15 border-amber-400 shadow-md'
                              : 'bg-[#141822] border-stone-800 hover:border-stone-700'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span
                              className="font-mono text-[10px] font-extrabold px-1.5 py-0.5 rounded text-stone-950"
                              style={{ backgroundColor: u.color }}
                            >
                              {t(u.badgeRu, u.badgeEn)}
                            </span>
                            <span
                              className={`font-mono text-[9px] font-bold ${
                                u.status === 'moving'
                                  ? 'text-emerald-300'
                                  : u.status === 'camped'
                                  ? 'text-orange-300'
                                  : u.status === 'arrived'
                                  ? 'text-amber-300'
                                  : 'text-stone-400'
                              }`}
                            >
                              {u.status === 'moving'
                                ? t('▶ В ПУТИ', '▶ MOVING')
                                : u.status === 'camped'
                                ? t('⛺ ПРИВАЛ', '⛺ CAMPED')
                                : u.status === 'arrived'
                                ? t('✓ ПРИБЫЛ', '✓ ARRIVED')
                                : t('⏸ ГОТОВ', '⏸ READY')}
                            </span>
                          </div>
                          <div className="text-[11px] font-bold text-stone-100 mt-1 truncate">
                            {t(u.nameRu, u.nameEn)}
                          </div>
                          <div className="hud-num text-[10px] text-emerald-300 mt-0.5 flex items-center justify-between">
                            <span>{t('ОД', 'MP')}: {curMp}/{maxMp}</span>
                            {typeof u.naibExecProb === 'number' && (
                              <span className="text-amber-300">P: {u.naibExecProb}%</span>
                            )}
                          </div>
                          <div className="font-mono text-[9.5px] text-sky-300/90">
                            ⛰️ {uTerr.elevationMeters}{t('м', 'm')} • {uTerr.slopeDeg}° • ×{uTerr.speedMult}
                          </div>
                          <div className="font-mono text-[9.5px] text-stone-400 truncate">
                            → {t(u.targetLabelRu, u.targetLabelEn)}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Кнопки быстрых команд к действию, перехвата колонн РИ и управления погодой */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      onClick={() =>
                        handleCommandUnitMoveToPoint(
                          selectedUnitId,
                          selectedNaibate.coords.x,
                          selectedNaibate.coords.y,
                          `${selectedNaibate.name} (${selectedNaibate.naibName})`,
                          `${selectedNaibate.nameEn || selectedNaibate.name} (${selectedNaibate.naibNameEn || selectedNaibate.naibName})`
                        )
                      }
                      className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-mono text-xs font-extrabold cursor-pointer shadow"
                    >
                      🎯 {t(
                        `Приказ: Выдвинуть в «${selectedNaibate.name}»`,
                        `Order: Move to “${selectedNaibate.nameEn || selectedNaibate.name}”`
                      )}
                    </button>
                    <button
                      onClick={() => handleInterceptImperialColumn(null)}
                      className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-extrabold cursor-pointer shadow"
                    >
                      ⚔️ {t('На перехват колонны РИ', 'Intercept Imperial Column')}
                    </button>
                    <button
                      onClick={() =>
                        handleCommandUnitMoveToPoint(
                          selectedUnitId,
                          225,
                          195,
                          'Столица Дарго-Ведено (Ставка Шамиля)',
                          'Capital Dargo-Vedeno (Shamil’s HQ)'
                        )
                      }
                      className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 border border-stone-600 text-stone-100 font-mono text-xs font-bold cursor-pointer"
                    >
                      ★ {t('Вернуть в Дарго-Ведено', 'Return to Dargo-Vedeno')}
                    </button>
                    <button
                      onClick={handleDispatchAllUnitsDemo}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-200 font-mono text-xs font-bold cursor-pointer"
                    >
                      🐎 {t('Общий манёвр 5 отрядов', 'Maneuver All 5 Units')}
                    </button>
                    <button
                      onClick={() => handleEnterTacticalEncounter(activeTacticalEncounter, 'auto')}
                      className="px-3 py-1.5 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/60 text-amber-200 font-mono text-xs font-extrabold cursor-pointer"
                    >
                      🔍 {t('Возглавить бой в ущелье (Zoom-In)', 'Enter Gorge Battle (Zoom-In)')}
                    </button>
                    <button
                      onClick={() => setWeatherOverlayEnabled((prev) => !prev)}
                      className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold cursor-pointer border ${
                        weatherOverlayEnabled
                          ? 'bg-indigo-500/25 border-indigo-400 text-indigo-200'
                          : 'bg-stone-900 border-stone-700 text-stone-400'
                      }`}
                    >
                      🌦️ {t(
                        `Погодные фронты: ${weatherOverlayEnabled ? 'ВКЛ' : 'ВЫКЛ'}`,
                        `Weather Systems: ${weatherOverlayEnabled ? 'ON' : 'OFF'}`
                      )}
                    </button>
                  </div>

                  {/* СПРИНТ 25 (M25): ЖИВОЙ РАДАР ДВИЖУЩИХСЯ КОЛОНН РИ И ПОГОДНЫХ СИСТЕМ НА ПЕРЕВАЛАХ */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                    {liveImperialColumns.map((col) => {
                      const colTerr = sampleStrategicTerrain(col.x, col.y);
                      const colWea = sampleWeatherAtPoint(col.x, col.y, liveWeatherFronts, weatherOverlayEnabled);
                      const isRetreating = col.status === 'retreating';
                      const isFogged = Boolean(col.fogHidden);
                      return (
                        <button
                          key={col.id}
                          onClick={() => handleInterceptImperialColumn(col.id)}
                          className={`text-left p-2 rounded-lg border transition cursor-pointer ${
                            isFogged
                              ? 'bg-stone-900/80 border-stone-700/80 hover:border-stone-500'
                              : isRetreating
                              ? 'bg-orange-950/35 border-orange-500/40 hover:border-orange-400'
                              : 'bg-red-950/35 border-red-500/40 hover:border-red-400'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-mono text-[10px] font-extrabold text-red-300">
                              {isFogged
                                ? t('🌫️ В ТУМАНЕ ВОЙНЫ', '🌫️ IN FOG OF WAR')
                                : isRetreating
                                ? t('↩ ОТСТУПАЕТ К КОРДОНУ', '↩ RETREATING')
                                : t('⚔️ НАСТУПАЕТ ПО РЕЛЬЕФУ', '⚔️ ADVANCING')}
                            </span>
                            <span className="hud-num text-[10px] text-amber-300 font-bold">
                              {isFogged
                                ? t('~2–4 тыс. шт.', '~2–4k bay.')
                                : `${col.bayonets} ${t('шт.', 'bay.')}`}
                            </span>
                          </div>
                          <div className="text-[11px] font-bold text-stone-100 mt-0.5 truncate flex items-center justify-between gap-1">
                            <span className="truncate">
                              {isFogged ? t('? Неразведанная колонна РИ', '? Unscouted Imperial Column') : t(col.nameRu, col.nameEn)}
                            </span>
                            {col.supplyCut && (
                              <span className="shrink-0 px-1 py-0.5 rounded bg-orange-500/20 text-orange-300 font-mono text-[9px] font-bold">
                                ✂ {t('Обоз', 'Cut')}
                              </span>
                            )}
                          </div>
                          <div className="font-mono text-[10px] text-stone-300 mt-0.5 flex items-center justify-between">
                            <span>
                              ⛰️ {colTerr.elevationMeters}{t('м', 'm')} • {colTerr.slopeDeg}°
                            </span>
                            <span className="text-indigo-300">
                              {colWea.icon} {t(colWea.badgeRu, colWea.badgeEn)}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ВКЛАДКА 2 (defense): ИНЖЕНЕРНЫЕ РУБЕЖИ НА ПЕРЕВАЛАХ (M26), ГОРНЫЕ МОСТЫ (M29) И МИННЫЕ КАМУФЛЕТЫ (M31) */}
                <div className={commandDockTab === 'defense' || commandDockTab === 'all' ? 'space-y-2.5' : 'hidden'}>
                  <div className="bg-[#111622] border border-emerald-500/35 rounded-lg p-2.5 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[10px] font-mono uppercase text-emerald-300 font-bold">
                        🧱 {t(
                          `Инженерные рубежи на перевалах (${liveMapFortifications.length} укр. активно — тормозят колонны РИ в 3–4 раза)`,
                          `Pass Fortifications (${liveMapFortifications.length} active — slow Imperial columns 3–4x)`
                        )}
                      </span>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          onClick={() => setFortBuildMode((prev) => !prev)}
                          className={`px-2.5 py-1 rounded font-mono text-[10px] font-extrabold cursor-pointer border ${
                            fortBuildMode
                              ? 'bg-amber-400 text-stone-950 border-amber-300 shadow'
                              : 'bg-stone-800 hover:bg-stone-700 text-amber-200 border-amber-500/40'
                          }`}
                        >
                          📍 {fortBuildMode
                            ? t('КЛИКНИТЕ НА 3D-КАРТУ ДЛЯ ПОСТРОЙКИ!', 'CLICK 3D MAP TO PLACE!')
                            : t('Разместить кликом на 3D-карте', 'Place by Clicking 3D Map')}
                        </button>
                        <button
                          onClick={() => handleBuildFortificationAheadOfColumn(null)}
                          className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[10px] font-extrabold cursor-pointer shadow"
                        >
                          ⚡ {t('Укрепить перевал перед колонной РИ', 'Fortify Pass Ahead of Column')}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {FORTIFICATION_BLUEPRINTS.map((bp) => {
                        const isBpSel = selectedFortBlueprintId === bp.id;
                        return (
                          <button
                            key={bp.id}
                            onClick={() => setSelectedFortBlueprintId(bp.id)}
                            className={`text-left p-2 rounded-lg border transition cursor-pointer ${
                              isBpSel
                                ? 'bg-emerald-950/50 border-emerald-400 shadow'
                                : 'bg-[#0b0e15] border-stone-800 hover:border-stone-700'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-bold text-[11px] text-stone-100">
                                {bp.icon} {t(bp.badgeRu, bp.badgeEn)}
                              </span>
                              <span className="font-mono text-[10px] text-amber-300 font-bold">
                                {bp.costPowder}{t('п', 'p')} • {bp.costSilver}{t('р', 'r')}
                              </span>
                            </div>
                            <div className="font-mono text-[9.5px] text-emerald-300 mt-0.5">
                              {t(
                                `Торможение РИ ×${bp.enemySpeedMult} • Урон -${bp.salvoDamageBayonets} шт.`,
                                `Slows Enemy ×${bp.enemySpeedMult} • -${bp.salvoDamageBayonets} bay./salvo`
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* ВКЛАДКА 4 (economy): КАРАВАНЫ СНАБЖЕНИЯ БАЙТ-УЛЬ-МАЛ И ШТУРМ КОРДОННЫХ КРЕПОСТЕЙ РИ (M27) */}
                <div className={commandDockTab === 'economy' || commandDockTab === 'defense' || commandDockTab === 'all' ? 'bg-[#111520] border border-amber-500/35 rounded-lg p-2.5 space-y-2' : 'hidden'}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[10px] font-mono uppercase text-amber-300 font-bold">
                      🐪 {t(
                        `Живые караваны Байт-уль-Мал (${totalCaravansDelivered} дост.) & Кордонные крепости РИ (${totalFortressesStormed} штурмов)`,
                        `Live Bayt al-Mal Caravans (${totalCaravansDelivered} delivered) & Cordon Fortresses (${totalFortressesStormed} stormed)`
                      )}
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        onClick={() => handleEscortSupplyCaravan(null)}
                        className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[10px] font-extrabold cursor-pointer shadow"
                      >
                        🛡️ {t('Прикрыть караван снабжения', 'Escort Supply Caravan')}
                      </button>
                      <button
                        onClick={() => handleLaunchGeneralCordonAssault(null)}
                        className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-mono text-[10px] font-extrabold cursor-pointer shadow"
                      >
                        🔥 {t('Генеральный штурм крепости (Все 5 отрядов)', 'General Fortress Assault (All 5 Units)')}
                      </button>
                    </div>
                  </div>

                  {/* Карточки 3 вьючных караванов снабжения */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {liveSupplyCaravans.map((car) => {
                      const carTerr = sampleStrategicTerrain(car.x, car.y);
                      const isEsc = Boolean(car.escorted || car.isEscorted);
                      return (
                        <button
                          key={car.id}
                          onClick={() => handleEscortSupplyCaravan(car.id)}
                          className={`text-left p-2 rounded-lg border transition cursor-pointer ${
                            isEsc
                              ? 'bg-emerald-950/45 border-emerald-400/70'
                              : 'bg-[#0b0e15] border-stone-800 hover:border-amber-400/50'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-[11px] text-stone-100 truncate">
                              {car.icon} {t(car.badgeRu, car.badgeEn)}
                            </span>
                            <span
                              className={`font-mono text-[9.5px] font-bold ${
                                isEsc ? 'text-emerald-300' : 'text-amber-300'
                              }`}
                            >
                              {isEsc
                                ? t('🛡️ ПОД ОХРАНОЙ', '🛡️ ESCORTED')
                                : car.status === 'returning'
                                ? t('↩ В НАИБСТВО', '↩ RETURNING')
                                : t('▶ В ВЕДЕНО', '▶ TO VEDENO')}
                            </span>
                          </div>
                          <div className="font-mono text-[9.5px] text-stone-300 mt-0.5 flex items-center justify-between">
                            <span>
                              +{car.cargoPowder}{t('п', 'p')} • +{car.cargoProvisions || car.cargoGrain}{t('з', 'g')} • +{car.cargoSilver}{t('р', 'r')}
                            </span>
                            <span className="text-sky-300">
                              ⛰️ {carTerr.elevationMeters}{t('м', 'm')}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Карточки 3 северных кордонных крепостей Российской Империи */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-0.5">
                    {cordonFortresses.map((fort) => (
                      <button
                        key={fort.id}
                        onClick={() => handleLaunchGeneralCordonAssault(fort.id)}
                        className="text-left p-2 rounded-lg border bg-rose-950/30 border-rose-500/40 hover:border-rose-400 transition cursor-pointer"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-[11px] text-rose-100 truncate">
                            🏰 {t(fort.nameRu, fort.nameEn)}
                          </span>
                          <span className="font-mono text-[9.5px] text-amber-300 font-bold">
                            {fort.garrisonBayonets} {t('шт.', 'bay.')}
                          </span>
                        </div>
                        <div className="font-mono text-[9.5px] text-rose-200/90 mt-0.5 flex items-center justify-between">
                          <span>
                            {t(
                              `Трофеи: +${fort.lootPowder}п пороха, +${fort.lootSilver}р`,
                              `Spoils: +${fort.lootPowder}p powder, +${fort.lootSilver}r`
                            )}
                          </span>
                          <span className="text-emerald-300 font-bold">
                            {t('ШТУРМ →', 'STORM →')}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* ВКЛАДКА 3 (artillery_forest): СИГНАЛЬНЫЕ БАШНИ И ГЛУБОКИЕ КОННЫЕ РЕЙДЫ ЗА ТЕРЕК (M28) */}
                <div className={commandDockTab === 'artillery_forest' || commandDockTab === 'all' ? 'bg-[#12141c] border border-orange-500/40 rounded-lg p-2.5 space-y-2' : 'hidden'}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[10px] font-mono uppercase text-orange-300 font-bold">
                      🔥 {t(
                        `Сигнальные костры хребтов (${signalBeacons.filter((b) => b.isLit).length}/4 горят: +30% марша) & Рейды за Терек (${totalDeepRaidsCompleted})`,
                        `Mountain Signal Beacons (${signalBeacons.filter((b) => b.isLit).length}/4 lit: +30% march) & Deep Terek Raids (${totalDeepRaidsCompleted})`
                      )}
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        onClick={handleIgniteAllSignalBeacons}
                        className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-stone-950 font-mono text-[10px] font-extrabold cursor-pointer shadow"
                      >
                        🔥 {t('Зажечь все 4 сигнальные башни (+30%)', 'Ignite All 4 Signal Beacons (+30%)')}
                      </button>
                      <button
                        onClick={() => handleLaunchDeepCavalryRaid(null)}
                        className="px-2.5 py-1 rounded bg-orange-600 hover:bg-orange-500 text-white font-mono text-[10px] font-extrabold cursor-pointer shadow"
                      >
                        🐎 {t('Рейд Хаджи-Мурата за Терек (Отвлечь РИ)', 'Hadji Murad Deep Raid Beyond Terek')}
                      </button>
                    </div>
                  </div>

                  {/* Карточки 4 сигнальных башен на горных хребтах */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {signalBeacons.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => handleToggleSignalBeacon(b.id)}
                        className={`text-left p-2 rounded-lg border transition cursor-pointer ${
                          b.isLit
                            ? 'bg-amber-950/45 border-amber-400/75 shadow'
                            : 'bg-[#0b0e15] border-stone-800 hover:border-stone-700'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-[10.5px] text-stone-100 truncate">
                            {b.isLit ? '🔥' : '🗼'} {t(b.badgeRu, b.badgeEn)}
                          </span>
                          <span
                            className={`font-mono text-[9px] font-bold ${
                              b.isLit ? 'text-amber-300' : 'text-stone-500'
                            }`}
                          >
                            {b.isLit ? t('+30% МАРШ', '+30% SPEED') : t('ПОГАШЕН', 'UNLIT')}
                          </span>
                        </div>
                        <div className="font-mono text-[9px] text-stone-400 mt-0.5 truncate">
                          {t(b.nameRu, b.nameEn)}
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Карточки 3 глубоких конных рейдов по тылам Кавказской линии */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-0.5">
                    {deepRaidTargets.map((rt) => (
                      <button
                        key={rt.id}
                        onClick={() => handleLaunchDeepCavalryRaid(rt.id)}
                        className="text-left p-2 rounded-lg border bg-amber-950/25 border-orange-500/40 hover:border-amber-400 transition cursor-pointer"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-[11px] text-amber-100 truncate">
                            🐎 {t(rt.badgeRu, rt.badgeEn)}
                          </span>
                          <span className="font-mono text-[9.5px] text-emerald-300 font-bold">
                            +{rt.lootPowder}{t('п', 'p')} • +{rt.lootSilver}{t('р', 'r')}
                          </span>
                        </div>
                        <div className="font-mono text-[9.5px] text-orange-200/90 mt-0.5 flex items-center justify-between">
                          <span className="truncate">
                            {t(
                              `Отвлекает: ${rt.divertsColumnBadgeRu}`,
                              `Diverts: ${rt.divertsColumnBadgeEn}`
                            )}
                          </span>
                          <span className="text-amber-300 font-bold shrink-0 ml-1">
                            {t('В РЕЙД →', 'RAID →')}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* СПРИНТ 29 (M29): ИНТЕРАКТИВНЫЕ ГОРНЫЕ МОСТЫ И ПЕРЕПРАВЫ + КОННЫЕ РАЗЪЕЗДЫ МУХТАСИБОВ И КАДИЕВ */}
                <div className={commandDockTab === 'defense' || commandDockTab === 'intel_diplomacy' || commandDockTab === 'all' ? 'bg-[#101420] border border-sky-500/35 rounded-lg p-2.5 space-y-2' : 'hidden'}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[10px] font-mono uppercase text-sky-300 font-bold">
                      🌉 {t(
                        `Горные мосты (${riverBridges.filter((b) => b.status === 'dismantled').length}/4 разобрано) & Разъезды мухтасибов (${totalMuhtasibInspections} ревизий)`,
                        `Mountain Bridges (${riverBridges.filter((b) => b.status === 'dismantled').length}/4 dismantled) & Muhtasib Patrols (${totalMuhtasibInspections} inspections)`
                      )}
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        onClick={handleBlowBridgesAheadOfColumns}
                        className="px-2.5 py-1 rounded bg-orange-600 hover:bg-orange-500 text-white font-mono text-[10px] font-extrabold cursor-pointer shadow"
                      >
                        💥 {t('Разобрать все 4 моста перед колоннами РИ', 'Dismantle All 4 Bridges Ahead of Columns')}
                      </button>
                      <button
                        onClick={() => handleDispatchMuhtasibToNaibate(selectedNaibateId)}
                        className="px-2.5 py-1 rounded bg-violet-600 hover:bg-violet-500 text-white font-mono text-[10px] font-extrabold cursor-pointer shadow"
                      >
                        ⚖️ {t(
                          `Направить мухтасиба в «${selectedNaibate.name}» (+5% лоял.)`,
                          `Send Muhtasib to “${selectedNaibate.nameEn || selectedNaibate.name}” (+5% loy.)`
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Карточки 4 горных мостов через Аргун, Койсу, Сулак и Сунжу */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {riverBridges.map((br) => {
                      const isBlown = br.status === 'dismantled';
                      return (
                        <button
                          key={br.id}
                          onClick={() => handleToggleRiverBridge(br.id)}
                          className={`text-left p-2 rounded-lg border transition cursor-pointer ${
                            isBlown
                              ? 'bg-orange-950/45 border-orange-400/75 shadow'
                              : 'bg-[#0b0e15] border-sky-500/40 hover:border-sky-400'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-[10.5px] text-stone-100 truncate">
                              {isBlown ? '💥' : '🌉'} {t(br.badgeRu, br.badgeEn)}
                            </span>
                            <span
                              className={`font-mono text-[9px] font-bold ${
                                isBlown ? 'text-orange-300' : 'text-sky-300'
                              }`}
                            >
                              {isBlown ? t('РАЗОБРАН', 'BLOWN') : t('+25% СВОИМ', '+25% ALLY')}
                            </span>
                          </div>
                          <div className="font-mono text-[9px] text-stone-400 mt-0.5 truncate">
                            {isBlown
                              ? t('Колонны РИ → в обход по скалам!', 'Enemy columns → forced detour!')
                              : t(br.riverNameRu, br.riverNameEn)}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Карточки 3 живых конных разъездов мухтасибов и кадиев */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-0.5">
                    {liveMuhtasibPatrols.map((pat) => {
                      const patTerr = sampleStrategicTerrain(pat.x, pat.y);
                      return (
                        <button
                          key={pat.id}
                          onClick={() => handleDispatchMuhtasibToNaibate(selectedNaibateId)}
                          className="text-left p-2 rounded-lg border bg-violet-950/25 border-violet-500/40 hover:border-violet-400 transition cursor-pointer"
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-[11px] text-violet-100 truncate">
                              {pat.icon} {t(pat.badgeRu, pat.badgeEn)}
                            </span>
                            <span className="font-mono text-[9.5px] text-emerald-300 font-bold">
                              +5% {t('лоял.', 'loy.')} • -6% {t('нат.', 'press.')}
                            </span>
                          </div>
                          <div className="font-mono text-[9.5px] text-violet-200/90 mt-0.5 flex items-center justify-between">
                            <span className="truncate">
                              → {t(pat.targetNameRu, pat.targetNameEn)}
                            </span>
                            <span className="text-sky-300 shrink-0 ml-1">
                              ⛰️ {patTerr.elevationMeters}{t('м', 'm')}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* СПРИНТ 30 (M30): ПЕРЕДВИЖНЫЕ ГОРНЫЕ БАТАРЕИ ЯХЬИ АЛЬ-МИЛЬКИ & СЕЗОННЫЙ ПЕРЕГОН ОТАР НА ДЖАЙЛЯУ */}
                <div className={commandDockTab === 'artillery_forest' || commandDockTab === 'economy' || commandDockTab === 'all' ? 'bg-[#12101e] border border-fuchsia-500/35 rounded-lg p-2.5 space-y-2' : 'hidden'}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[10px] font-mono uppercase text-fuchsia-300 font-bold">
                      💣 {t(
                        `Горные батареи Ведено (${totalBatterySalvos} залпов) & Сезонный перегон отар (${totalFlockMigrations} рейсов на джайляу)`,
                        `Vedeno Mountain Batteries (${totalBatterySalvos} salvos) & Transhumance Flocks (${totalFlockMigrations} pasture runs)`
                      )}
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        onClick={() => handleDeployBatteryToRidge(null)}
                        className="px-2.5 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white font-mono text-[10px] font-extrabold cursor-pointer shadow"
                      >
                        ⛰️ {t('Выдвинуть батареи на гребень перед РИ', 'Deploy Batteries to Ridge Ahead of Enemy')}
                      </button>
                      <button
                        onClick={handleConcentrateArtilleryFire}
                        className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-stone-950 font-mono text-[10px] font-extrabold cursor-pointer shadow"
                      >
                        💣 {t('Сосредоточенный залп батарей (-210 шт.)', 'Concentrated Battery Barrage (-210 bay.)')}
                      </button>
                      <button
                        onClick={() => handleProtectTranshumanceFlock(null)}
                        className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[10px] font-extrabold cursor-pointer shadow"
                      >
                        🐑 {t('Прикрыть перегон отар на джайляу', 'Guard Dzhaylyau Flock Migration')}
                      </button>
                    </div>
                  </div>

                  {/* Карточки 2 передвижных горных батарей Яхьи аль-Мильки и Хаджи-Юсуфа */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {liveMountainBatteries.map((bat) => {
                      const batTerr = sampleStrategicTerrain(bat.x, bat.y);
                      return (
                        <button
                          key={bat.id}
                          onClick={() => handleDeployBatteryToRidge(bat.id)}
                          className="text-left p-2 rounded-lg border bg-purple-950/30 border-purple-500/40 hover:border-amber-400 transition cursor-pointer"
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-[11px] text-amber-200 truncate">
                              {bat.icon} {t(bat.nameRu, bat.nameEn)}
                            </span>
                            <span className="font-mono text-[9.5px] text-amber-300 font-bold shrink-0">
                              -{bat.salvoDamage} {t('шт./залп', 'bay./salvo')}
                            </span>
                          </div>
                          <div className="font-mono text-[9.5px] text-purple-200/90 mt-0.5 flex items-center justify-between">
                            <span>
                              {t(`Дальность: ${bat.range} верст`, `Range: ${bat.range} px`)} • ⛰️ {batTerr.elevationMeters}{t('м', 'm')}
                            </span>
                            <span className="text-emerald-300 font-bold">
                              {bat.status === 'moving'
                                ? t('▶ СМЕНА ПОЗИЦИИ', '▶ REDEPLOYING')
                                : t('✓ НА ГРЕБНЕ', '✓ ON RIDGE')}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Карточки 3 сезонных отар на альпийских пастбищах-джайляу */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-0.5">
                    {liveTranshumanceFlocks.map((fl) => {
                      const flTerr = sampleStrategicTerrain(fl.x, fl.y);
                      return (
                        <button
                          key={fl.id}
                          onClick={() => handleProtectTranshumanceFlock(fl.id)}
                          className={`text-left p-2 rounded-lg border transition cursor-pointer ${
                            fl.guarded
                              ? 'bg-emerald-950/45 border-emerald-400/70'
                              : 'bg-[#0b0e15] border-stone-800 hover:border-emerald-400/50'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-[10.5px] text-stone-100 truncate">
                              {fl.icon} {t(fl.badgeRu, fl.badgeEn)}
                            </span>
                            <span
                              className={`font-mono text-[9px] font-bold ${
                                fl.guarded ? 'text-emerald-300' : 'text-sky-300'
                              }`}
                            >
                              {fl.guarded
                                ? t('🛡️ ПОД ОХРАНОЙ', '🛡️ GUARDED')
                                : fl.direction === 'to_dzhaylyau'
                                ? t('▲ НА ДЖАЙЛЯУ', '▲ TO ALPINE')
                                : t('▼ НА КУТАНЫ', '▼ TO LOWLAND')}
                            </span>
                          </div>
                          <div className="font-mono text-[9.5px] text-stone-300 mt-0.5 flex items-center justify-between">
                            <span>
                              +{fl.yieldProvisions}{t(' пров.', ' prov.')} • +{fl.yieldSilver}{t('р', 'r')}
                            </span>
                            <span className="text-sky-300">
                              ⛰️ {flTerr.elevationMeters}{t('м', 'm')}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* СПРИНТ 31 (M31): ПОДЗЕМНЫЕ МИННЫЕ ГАЛЕРЕИ (КАМУФЛЕТЫ) & ДИПЛОМАТИЧЕСКИЕ МИССИИ ЧЕРКЕСИИ И ТРАПЕЗУНДА */}
                <div className={commandDockTab === 'defense' || commandDockTab === 'intel_diplomacy' || commandDockTab === 'all' ? 'bg-[#11151d] border border-teal-500/35 rounded-lg p-2.5 space-y-2' : 'hidden'}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[10px] font-mono uppercase text-teal-300 font-bold">
                      🧨 {t(
                        `Контрминные горны (${sapperMines.filter((m) => m.status === 'armed').length}/4 взведено, ${totalMinesDetonatedOnMap} взрывов) & Посольства (${totalDiplomaticMissionsArrived} приб.)`,
                        `Sapper Camouflets (${sapperMines.filter((m) => m.status === 'armed').length}/4 armed, ${totalMinesDetonatedOnMap} blasts) & Embassies (${totalDiplomaticMissionsArrived} arrived)`
                      )}
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        onClick={handleDetonateAllSapperMines}
                        className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-mono text-[10px] font-extrabold cursor-pointer shadow"
                      >
                        🧨 {t('Взорвать камуфлеты под колоннами РИ (-380 шт.)', 'Detonate Camouflets Beneath Enemy (-380 bay.)')}
                      </button>
                      <button
                        onClick={() => handleEscortDiplomaticMission(null)}
                        className="px-2.5 py-1 rounded bg-teal-600 hover:bg-teal-500 text-white font-mono text-[10px] font-extrabold cursor-pointer shadow"
                      >
                        🌙 {t('Почётный конвой к миссии Черкесии/Трапезунда', 'Honor Escort for Diplomatic Mission')}
                      </button>
                    </div>
                  </div>

                  {/* Карточки 4 подземных пороховых камуфлетов */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {sapperMines.map((mine) => {
                      const isArmed = mine.status === 'armed';
                      return (
                        <button
                          key={mine.id}
                          onClick={() =>
                            isArmed ? handleDetonateAllSapperMines() : handleArmSapperMine(mine.id)
                          }
                          className={`text-left p-2 rounded-lg border transition cursor-pointer ${
                            isArmed
                              ? 'bg-rose-950/40 border-rose-500/65 hover:border-rose-400'
                              : 'bg-[#0b0e15] border-stone-800 hover:border-stone-700'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-[10.5px] text-stone-100 truncate">
                              {isArmed ? '🧨' : '🕳️'} {t(mine.badgeRu, mine.badgeEn)}
                            </span>
                            <span
                              className={`font-mono text-[9px] font-bold ${
                                isArmed ? 'text-rose-300' : 'text-stone-400'
                              }`}
                            >
                              {isArmed ? `-${mine.blastDamageBayonets} ${t('шт.', 'bay.')}` : t('ЗАРЯДИТЬ', 'RE-ARM')}
                            </span>
                          </div>
                          <div className="font-mono text-[9px] text-stone-400 mt-0.5 truncate">
                            {t(`Трофеи: +${mine.capturedPowder}п пороха`, `Spoils: +${mine.capturedPowder}p powder`)}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Карточки 2 живых дипломатических миссий Черкесии и Трапезунда */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                    {liveDiplomaticMissions.map((ms) => {
                      const msTerr = sampleStrategicTerrain(ms.x, ms.y);
                      return (
                        <button
                          key={ms.id}
                          onClick={() => handleEscortDiplomaticMission(ms.id)}
                          className={`text-left p-2 rounded-lg border transition cursor-pointer ${
                            ms.escorted
                              ? 'bg-emerald-950/45 border-emerald-400/75'
                              : 'bg-teal-950/25 border-teal-500/40 hover:border-teal-400'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-[11px] text-teal-100 truncate">
                              {ms.icon} {t(ms.nameRu, ms.nameEn)}
                            </span>
                            <span className="font-mono text-[9.5px] text-amber-300 font-bold shrink-0">
                              +{ms.giftPowder}{t('п', 'p')} • +{ms.giftSupport}% {t('Порта', 'Porte')}
                            </span>
                          </div>
                          <div className="font-mono text-[9.5px] text-teal-200/90 mt-0.5 flex items-center justify-between">
                            <span>
                              {ms.escorted
                                ? t('🛡️ ПОД ОХРАНОЙ (+25% даров)', '🛡️ ESCORTED (+25% gifts)')
                                : ms.status === 'inbound'
                                ? t('▶ ИДЁТ В ДАРГО-ВЕДЕНО', '▶ TO DARGO-VEDENO')
                                : t('↩ НА ПЕРЕВАЛ', '↩ RETURNING')}
                            </span>
                            <span className="text-sky-300">
                              ⛰️ {msTerr.elevationMeters}{t('м', 'm')}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* СПРИНТ 32 (M32): ПОЛЕВЫЕ ГОСПИТАЛИ ХАКИМОВ И ДЖАРРАХОВ (ТРОФЕЙНЫЙ ЭФИР 1847 Г.) & ОБМЕНЫ ПЛЕННЫХ И АМАНАТОВ НА МИЧИКЕ */}
                <div className={commandDockTab === 'medicine_muhajir' || commandDockTab === 'all' ? 'bg-[#11151d] border border-emerald-500/35 rounded-lg p-2.5 space-y-2' : 'hidden'}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[10px] font-mono uppercase text-emerald-300 font-bold">
                      🏥 {t(
                        `Полевые лазареты хакимов (возвращено +${totalWoundedRecoveredOnMap} сабель) & Размены на р. Мичик (${totalPrisonerExchangesCompleted} обменов)`,
                        `Field Hakim Lazarets (+${totalWoundedRecoveredOnMap} sabers healed) & Michik Prisoner Exchanges (${totalPrisonerExchangesCompleted} completed)`
                      )}
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        onClick={handleEvacuateWoundedToHospitals}
                        className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[10px] font-extrabold cursor-pointer shadow"
                      >
                        🏥 {t('Эвакуировать раненых в лазареты (+65 сабель, -5% стресса)', 'Evacuate Wounded to Lazarets (+65 sabers, -5% stress)')}
                      </button>
                      <button
                        onClick={handleExecuteMichikGrandExchange}
                        className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white font-mono text-[10px] font-extrabold cursor-pointer shadow"
                      >
                        🏳️ {t('Большой размен на р. Мичик (+180₽, +35п пороха, -6% стресса)', 'Grand Michik Exchange (+180 rub., +35p powder, -6% stress)')}
                      </button>
                    </div>
                  </div>

                  {/* Карточки 4 горных госпиталей и лазаретов джаррахов */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {fieldHospitals.map((hosp) => (
                      <button
                        key={hosp.id}
                        onClick={() => handleUpgradeFieldHospital(hosp.id)}
                        className={`text-left p-2 rounded-lg border transition cursor-pointer ${
                          hosp.upgraded
                            ? 'bg-emerald-950/40 border-emerald-500/65 hover:border-emerald-400'
                            : 'bg-[#0b0e15] border-sky-500/40 hover:border-sky-400'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-[10.5px] text-stone-100 truncate">
                            🏥 {t(hosp.badgeRu, hosp.badgeEn)}
                          </span>
                          <span className="font-mono text-[9px] font-bold text-emerald-300">
                            {Math.round(hosp.recoveryRate * 100)}% {t('возвр.', 'rec.')}
                          </span>
                        </div>
                        <div className="font-mono text-[9px] text-stone-400 mt-0.5 truncate">
                          {hosp.upgraded
                            ? t(`Эфир Пирогова • +${hosp.healSabersPerPulse} саб.`, `Pirogov Ether • +${hosp.healSabersPerPulse} sab.`)
                            : t('Оснастить лазарет (до 55%)', 'Upgrade Lazaret (to 55%)')}
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Карточки 2 парламентёрских конвоев обмена пленных офицеров и аманатов */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                    {livePrisonerConvoys.map((cv) => {
                      const cvTerr = sampleStrategicTerrain(cv.x, cv.y);
                      return (
                        <button
                          key={cv.id}
                          onClick={() => handleDispatchPrisonerExchange(cv.id)}
                          className={`text-left p-2 rounded-lg border transition cursor-pointer ${
                            cv.escorted
                              ? 'bg-amber-950/45 border-amber-400/75'
                              : 'bg-slate-900/60 border-stone-600/50 hover:border-amber-400/60'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-[11px] text-amber-100 truncate">
                              {cv.icon} {t(cv.nameRu, cv.nameEn)}
                            </span>
                            <span className="font-mono text-[9.5px] text-emerald-300 font-bold shrink-0">
                              +{cv.ransomSilver}₽ • +{cv.ransomPowder}{t('п', 'p')}
                            </span>
                          </div>
                          <div className="font-mono text-[9.5px] text-stone-300 mt-0.5 flex items-center justify-between">
                            <span>
                              {cv.escorted
                                ? t('🛡️ КОНВОЙ (+25% выкупа)', '🛡️ ESCORTED (+25% ransom)')
                                : cv.status === 'to_crossing'
                                ? t('▶ К БРОДУ РАЗМЕНА', '▶ TO TRUCE FORD')
                                : t('↩ ВОЗВРАТ С АМАНАТАМИ', '↩ RETURNING WITH AMANATS')}
                            </span>
                            <span className="text-sky-300">
                              ⛰️ {cvTerr.elevationMeters}{t('м', 'm')}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* СПРИНТ 33 (M33): ПОРОХОВЫЕ МЕЛЬНИЦЫ, СЕЛИТРЕННЫЕ ПЕЩЕРЫ, СЕРНЫЕ КОПИ & СЕТЬ ТАЙНЫХ КУНАКОВ-ЛАЗУТЧИКОВ */}
                <div className={commandDockTab === 'economy' || commandDockTab === 'intel_diplomacy' || commandDockTab === 'all' ? 'bg-[#11151d] border border-amber-500/35 rounded-lg p-2.5 space-y-2' : 'hidden'}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[10px] font-mono uppercase text-amber-300 font-bold">
                      ⚙️ {t(
                        `Военная промышленность Имамата (${totalMillBatchesProduced} партий пороха) & Тайные кунаки (${totalCouriersIntercepted} перехватов депеш)`,
                        `Imamate Military Industry (${totalMillBatchesProduced} powder batches) & Kunak Spy Rings (${totalCouriersIntercepted} courier intercepts)`
                      )}
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        onClick={handleOverdriveAllPowderMills}
                        className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white font-mono text-[10px] font-extrabold cursor-pointer shadow"
                      >
                        ⚙️ {t('Форсировать 4 мельницы и кузницы (+65п пороха, +120₽)', 'Overdrive All 4 Mills & Armories (+65p powder, +120 rub.)')}
                      </button>
                      <button
                        onClick={handleActivateKunakSpyNetwork}
                        className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-[10px] font-extrabold cursor-pointer shadow"
                      >
                        🕵️ {t('Сеть кунаков: перехват депеш (-12% натиска РИ, +160₽)', 'Kunak Spy Network: Intercept Dispatches (-12% pressure, +160 rub.)')}
                      </button>
                    </div>
                  </div>

                  {/* Карточки 4 центров горного ВПК (Ведено, Гуниб, Чирката, Унцукуль) */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {powderMills.map((mill) => (
                      <button
                        key={mill.id}
                        onClick={() => handleBoostPowderMill(mill.id)}
                        className={`text-left p-2 rounded-lg border transition cursor-pointer ${
                          mill.overdrive
                            ? 'bg-amber-950/40 border-amber-500/65 hover:border-amber-400'
                            : 'bg-[#0b0e15] border-stone-700 hover:border-amber-400/50'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-[10.5px] text-stone-100 truncate">
                            {mill.icon} {t(mill.badgeRu, mill.badgeEn)}
                          </span>
                          <span className="font-mono text-[9px] font-bold text-amber-300">
                            +{mill.yieldPowder}{t('п', 'p')} / +{mill.yieldSilver}₽
                          </span>
                        </div>
                        <div className="font-mono text-[9px] text-stone-400 mt-0.5 truncate">
                          {mill.overdrive
                            ? t('🔥 ФОРСИРОВАННЫЙ РЕЖИМ (+35%)', '🔥 OVERDRIVE (+35%)')
                            : t('Нажмите для форсажа выработки', 'Click to boost output')}
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Карточки 2 живых царских фельдъегерей и курьеров Кавказского корпуса */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                    {liveImperialCouriers.map((cr) => {
                      const crTerr = sampleStrategicTerrain(cr.x, cr.y);
                      return (
                        <button
                          key={cr.id}
                          onClick={() => handleInterceptImperialCourier(cr.id)}
                          className="text-left p-2 rounded-lg border bg-indigo-950/35 border-indigo-500/45 hover:border-indigo-400 transition cursor-pointer"
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-[11px] text-indigo-100 truncate">
                              {cr.icon} {t(cr.nameRu, cr.nameEn)}
                            </span>
                            <span className="font-mono text-[9.5px] text-amber-300 font-bold shrink-0">
                              +{cr.lootSilver}₽ • -{cr.intelPressureDrop}% {t('нат.', 'press.')}
                            </span>
                          </div>
                          <div className="font-mono text-[9.5px] text-indigo-200/90 mt-0.5 flex items-center justify-between">
                            <span>
                              {t('📯 ПЕРЕХВАТИТЬ КУРЬЕРА НА ЛИНИИ →', '📯 INTERCEPT COURIER ON LINE →')}
                            </span>
                            <span className="text-sky-300">
                              ⛰️ {crTerr.elevationMeters}{t('м', 'm')}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* СПРИНТ 34 (M34): ВЕКОВЫЕ БУКОВЫЕ ЛЕСА ИЧКЕРИИ И ЧЕЧНИ (ЗАСАДЫ СТРЕЛКОВ ТАЛГИКА) & ОБОЗЫ МУХАДЖИРОВ */}
                <div className={commandDockTab === 'artillery_forest' || commandDockTab === 'medicine_muhajir' || commandDockTab === 'all' ? 'bg-[#11151d] border border-green-500/35 rounded-lg p-2.5 space-y-2' : 'hidden'}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[10px] font-mono uppercase text-green-300 font-bold">
                      🌲 {t(
                        `Лесные засеки Ичкерии и Чечни (${totalForestAmbushesTriggered} засад) & Обозы мухаджиров (${totalMuhajirCaravansSaved} спасено в горах)`,
                        `Ichkeria & Chechnya Beech Forests (${totalForestAmbushesTriggered} ambushes) & Muhajir Caravans (${totalMuhajirCaravansSaved} saved)`
                      )}
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        onClick={handleLaunchGeneralForestAmbush}
                        className="px-2.5 py-1 rounded bg-green-600 hover:bg-green-500 text-white font-mono text-[10px] font-extrabold cursor-pointer shadow"
                      >
                        🌲 {t('Засада стрелков во всех 4 лесах (-290 шт. РИ, +28п)', 'Forest Ambush Across All 4 Woods (-290 bay., +28p)')}
                      </button>
                      <button
                        onClick={handleOrganizeMuhajirRelief}
                        className="px-2.5 py-1 rounded bg-orange-600 hover:bg-orange-500 text-white font-mono text-[10px] font-extrabold cursor-pointer shadow"
                      >
                        🛞 {t('Принять обозы мухаджиров (+95 мюр., +120 зерна, -6% стресса)', 'Settle Muhajir Caravans (+95 mur., +120 grain, -6% stress)')}
                      </button>
                    </div>
                  </div>

                  {/* Карточки 4 лесных массивов (Гойты, Шали, Белгатой, Качкалык) */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {forestClearings.map((fc) => {
                      const isProt = fc.status === 'protected';
                      return (
                        <button
                          key={fc.id}
                          onClick={() => handleDefendForestClearing(fc.id)}
                          className={`text-left p-2 rounded-lg border transition cursor-pointer ${
                            isProt
                              ? 'bg-green-950/40 border-green-500/65 hover:border-green-400'
                              : 'bg-amber-950/30 border-amber-500/50 hover:border-amber-400'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-[10.5px] text-stone-100 truncate">
                              🌲 {t(fc.badgeRu, fc.badgeEn)}
                            </span>
                            <span className="font-mono text-[9px] font-bold text-green-300">
                              {fc.canopyIntactPct}% {t('лес', 'canopy')}
                            </span>
                          </div>
                          <div className="font-mono text-[9px] text-stone-400 mt-0.5 truncate">
                            {t(`Засада +${fc.ambushBonusPct}% • Торм. ×${fc.enemySlowdownMult}`, `Ambush +${fc.ambushBonusPct}% • Slow ×${fc.enemySlowdownMult}`)}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Карточки 2 переселенческих обозов горцев-мухаджиров */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                    {liveMuhajirCaravans.map((mc) => {
                      const mcTerr = sampleStrategicTerrain(mc.x, mc.y);
                      return (
                        <button
                          key={mc.id}
                          onClick={() => handleEscortMuhajirCaravan(mc.id)}
                          className={`text-left p-2 rounded-lg border transition cursor-pointer ${
                            mc.escorted
                              ? 'bg-emerald-950/45 border-emerald-400/75'
                              : 'bg-orange-950/25 border-orange-500/45 hover:border-orange-400'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-[11px] text-orange-100 truncate">
                              {mc.icon} {t(mc.nameRu, mc.nameEn)}
                            </span>
                            <span className="font-mono text-[9.5px] text-emerald-300 font-bold shrink-0">
                              +{mc.militiaJoined} {t('мюр.', 'mur.')} • +{mc.savedGrain}{t('з', 'g')}
                            </span>
                          </div>
                          <div className="font-mono text-[9.5px] text-orange-200/90 mt-0.5 flex items-center justify-between">
                            <span>
                              {mc.escorted
                                ? t('🛡️ ПОД ОХРАНОЙ (+25% пополнения)', '🛡️ ESCORTED (+25% militia)')
                                : mc.status === 'evacuating'
                                ? t('▶ ОТХОД В ГОРНЫЕ КРЕПОСТИ', '▶ EVACUATING TO MOUNTAINS')
                                : t('↩ АРБЫ ЗА НОВЫМИ СЕМЬЯМИ', '↩ CARTS RETURNING')}
                            </span>
                            <span className="text-sky-300">
                              ⛰️ {mcTerr.elevationMeters}{t('м', 'm')}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Кнопка открытия/скрытия подробного штабного журнала, гонцов в пути и доктрин ИИ (по умолчанию свёрнуто, чтобы не перегружать экран под 3D-столом) */}
                <div className="pt-1 flex items-center justify-between gap-2 border-t border-stone-800/80">
                  <span className="text-[10.5px] font-mono text-stone-400">
                    🐎 {t(`Гонцов в пути: ${activeEnvoys.length}`, `Envoys in transit: ${activeEnvoys.length}`)} • 🎯{' '}
                    {t(
                      `Удар корпуса РИ через ${imperialAi.turnsUntilStrike} ход(а)`,
                      `Imperial strike in ${imperialAi.turnsUntilStrike} turn(s)`
                    )}
                  </span>
                  <button
                    onClick={() => setShowStaffDrawer((prev) => !prev)}
                    className="px-2.5 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 border border-amber-500/40 text-amber-200 font-mono text-[10.5px] font-bold cursor-pointer transition"
                  >
                    {showStaffDrawer
                      ? t('▲ Свернуть журнал штаба и доктрины ИИ', '▲ Collapse Staff Log & AI Doctrines')
                      : t('📜 Развернуть журнал штаба, гонцов и 4 доктрины ИИ ▼', '📜 Expand Staff Log, Envoys & 4 AI Doctrines ▼')}
                  </button>
                </div>

                {showStaffDrawer && (
                  <div className="bg-[#090c11] border border-stone-800 rounded-lg p-2.5 space-y-1 max-h-24 overflow-y-auto">
                    {unitMovementLog.map((entry) => (
                      <div key={entry.id} className="text-[11px] flex items-start gap-2 font-mono">
                        <span className="text-sky-400 shrink-0">[{entry.time}]</span>
                        <span className="text-stone-300 font-sans">
                          {t(entry.textRu, entry.textEn)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                  </>
                )}
              </div>

              {/* Сворачиваемые блоки активных конных гонцов и разведки 4 доктрин ИИ */}
              {showStaffDrawer && (
              <>
              {/* Список активных конных гонцов в пути */}
              <div className="bg-[#0e1116] border border-stone-800 rounded-lg p-3">
                <div className="text-xs font-bold text-amber-300 mb-2 flex items-center justify-between">
                  <span>
                    {t(
                      `Активные конные гонцы и караваны с порохом в пути (${activeEnvoys.length}):`,
                      `Active Mounted Couriers & Gunpowder Convoys in Transit (${activeEnvoys.length}):`
                    )}
                  </span>
                  <span className="text-[11px] font-normal text-stone-400">
                    {t('Прибывают при нажатии «ЗАВЕРШИТЬ ХОД»', 'Arrive upon clicking END TURN')}
                  </span>
                </div>
                {activeEnvoys.length === 0 ? (
                  <p className="text-xs text-stone-500 italic">
                    {t(
                      'Сейчас на горных тропах нет гонцов. Сформируйте приказ в правой панели и отправьте мюрида.',
                      'No couriers currently on mountain trails. Configure an order on the right panel and dispatch a murid.'
                    )}
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {activeEnvoys.map((env) => (
                      <div
                        key={env.id}
                        className="bg-[#161a22] border border-amber-500/30 rounded p-2 text-[11px] flex items-center justify-between"
                      >
                        <div>
                          <div className="font-bold text-stone-200">
                            → {env.targetName} ({env.naibName})
                          </div>
                          <div className="text-stone-400 truncate max-w-[230px]">{env.orderTitle}</div>
                          <div className="text-amber-300 font-mono mt-0.5">
                            {t('Груз', 'Cargo')}: {env.powder} {t('пуд. пороха', 'poods')}, {env.silver}{' '}
                            {t('руб.', 'rub.')} | P: {env.execChance}%
                          </div>
                        </div>
                        <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-300 font-mono font-bold">
                          {env.turnsLeft} {t('ход.', 't.')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Сводка разведки лазутчиков о готовящемся ударе царского генерала (4 исторические доктрины ИИ) */}
              {(() => {
                const activeGen = IMPERIAL_GENERALS[imperialAi.generalIdx] || IMPERIAL_GENERALS[0];
                const targetN = naibates.find((n) => n.id === imperialAi.targetNaibateId);
                return (
                  <div className="bg-[#1a1214] border border-red-500/40 rounded-lg p-3 space-y-2.5 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="text-[10px] font-mono uppercase text-red-400 font-bold flex items-center gap-1.5">
                          <Target className="w-3.5 h-3.5" />
                          <span>
                            {t(
                              'Разведка лазутчиков: Доктрина Отдельного Кавказского корпуса (4 профиля ИИ)',
                              'Scout Intelligence: Separate Caucasian Corps AI Doctrine (4 Commanders)'
                            )}
                          </span>
                        </div>
                        <div className="font-bold text-stone-100 mt-0.5">
                          {t(activeGen.name, activeGen.nameEn)} — {t(activeGen.doctrineName, activeGen.doctrineNameEn)}
                        </div>
                        <div className="text-stone-400 text-[11px]">
                          {t('Цель колонны', 'Target Column')} ({imperialAi.columnStrength}{' '}
                          {t('штыков', 'bayonets')}): «{t(targetN?.name, targetN?.nameEn || targetN?.name)}»{' '}
                          {t('через', 'in')}{' '}
                          <strong className="text-red-300 font-mono">
                            {imperialAi.turnsUntilStrike} {t('ход(а)', 'turn(s)')}
                          </strong>
                          .
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveTab('arsenal')}
                        className="px-3 py-1.5 rounded bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-200 font-bold text-[11px] cursor-pointer transition"
                      >
                        {t('Контрмеры и Арсенал →', 'Countermeasures & Arsenal →')}
                      </button>
                    </div>

                    <div className="p-2 rounded bg-[#0e0a0c] border border-red-500/30 font-mono text-[10px] text-rose-300">
                      ⚙️ {t(activeGen.doctrineModifiers.formulaRu, activeGen.doctrineModifiers.formulaEn)}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1 border-t border-red-950/80">
                      <div className="flex flex-wrap gap-1">
                        {IMPERIAL_GENERALS.map((gen, idx) => (
                          <button
                            key={gen.id}
                            onClick={() =>
                              setImperialAi((prev) => ({
                                ...prev,
                                generalIdx: idx,
                                targetNaibateId: gen.preferredTargets[0],
                                aiDoctrineLocked: true
                              }))
                            }
                            className={`px-2 py-1 rounded font-mono text-[10px] border cursor-pointer transition ${
                              imperialAi.generalIdx === idx
                                ? 'bg-red-500/25 border-red-400 text-red-200 font-bold'
                                : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                            }`}
                          >
                            {t(gen.shortLabelRu, gen.shortLabelEn)}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() =>
                          setImperialAi((prev) => ({
                            ...prev,
                            aiDoctrineLocked: !prev.aiDoctrineLocked
                          }))
                        }
                        className="px-2 py-1 rounded bg-stone-900 border border-stone-700 text-[10px] font-mono text-stone-300 cursor-pointer"
                      >
                        {imperialAi.aiDoctrineLocked
                          ? t('🔒 Доктрина закреплена', '🔒 Doctrine Locked')
                          : t('🔄 Ротация генералов', '🔄 Auto-Rotate Generals')}
                      </button>
                    </div>
                  </div>
                );
              })()}
              </>
              )}
            </div>

            {/* Правая колонка (4 из 12): Компактный пульт наиба и отправка гонца */}
            <div className="lg:col-span-4 bg-[#13161b] border border-stone-800 rounded-xl p-3 shadow-2xl space-y-2.5 self-start">
              {(() => {
                const naibPortraitMap = {
                  khunzakh: 'Portrait_Hadji_Murat_Khunzakh_1851.jpg',
                  benoy: 'Portrait_Baysungur_Benoy_1845.jpg',
                  gergebil: 'Portrait_Hadji_Yusuf_Safarov_1845.jpg',
                  vedeno: 'Portrait_Imam_Shamil_Vedeno_1845.jpg',
                  chokh: 'Portrait_Muhammad_Hajji_Sogratl_1877.jpg',
                  shali: 'Portrait_Talkhig_Shali_1845.jpg',
                  karata: 'Portrait_Ghazi_Muhammad_Karata_1845.jpg',
                  teletl: 'Portrait_Kibit_Magoma_Teletl_1845.jpg',
                  gunib: 'Portrait_Pirogov_Salty_1847.jpg',
                  irib: 'Portrait_Daniyal_Bek_Irib_1845.jpg'
                };
                const portraitSrc = naibPortraitMap[selectedNaibate.id] || 'Portrait_Hadji_Murat_Khunzakh_1851.jpg';
                const naibMem = getNaibLoyaltyMemory(selectedNaibate);
                return (
                  <div className="space-y-2 border-b border-stone-800 pb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="relative w-16 h-20 rounded-xl overflow-hidden border-2 border-amber-500/50 bg-[#0c0e12] shadow-lg shrink-0">
                        <img
                          src={resolveMediaAsset(portraitSrc)}
                          alt={selectedNaibate.naibName}
                          className="w-full h-full object-cover object-top"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent px-1 py-0.5 text-[8.5px] font-mono text-amber-300 font-bold text-center truncate">
                          {t(selectedNaibate.name, selectedNaibate.nameEn || selectedNaibate.name)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1.5">
                          <div className="min-w-0">
                            <span className="text-[9.5px] font-mono uppercase text-amber-400 block truncate">
                              {t(selectedNaibate.region, selectedNaibate.regionEn || selectedNaibate.region)}
                            </span>
                            <h2 className="text-sm sm:text-base font-bold font-serif text-stone-100 leading-tight truncate">
                              {t(selectedNaibate.naibName, selectedNaibate.naibNameEn || selectedNaibate.naibName)}
                            </h2>
                            <p className="text-[10.5px] text-stone-400 truncate">
                              {t(selectedNaibate.naibTitle, selectedNaibate.naibTitleEn || selectedNaibate.naibTitle)}
                            </p>
                          </div>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9.5px] font-mono font-bold shrink-0 ${
                              selectedNaibate.underSiege
                                ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                                : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            }`}
                          >
                            {selectedNaibate.underSiege ? t('В ОСАДЕ', 'BESIEGED') : t('УДЕРЖИВАЕТСЯ', 'HELD')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div
                      className={`rounded-lg border px-2 py-1 text-[10px] flex items-center justify-between gap-2 ${naibMem.toneClass}`}
                      title={t(naibMem.reasonRu, naibMem.reasonEn)}
                    >
                      <span className="font-serif font-bold shrink-0">
                        {naibMem.icon} {t(naibMem.badgeRu, naibMem.badgeEn)}
                      </span>
                      <span className="truncate opacity-90 text-[9.5px]">
                        {t(naibMem.reasonRu, naibMem.reasonEn)}
                      </span>
                    </div>
                    {(() => {
                      const heroArc = HERO_STORY_ARCS.find((a) => a.naibateId === selectedNaibate.id);
                      if (!heroArc) return null;
                      const st = heroArcsState?.[heroArc.id] || { stage: 0, completed: false };
                      const isTragic = st.completed && st.outcome === 'tragic_departure';
                      return (
                        <button
                          type="button"
                          onClick={() => handleOpenHeroArcModal && handleOpenHeroArcModal(heroArc.id)}
                          className={`w-full rounded-lg border px-2.5 py-1.5 text-[10.5px] font-serif font-bold flex items-center justify-between gap-2 cursor-pointer transition ${
                            st.completed
                              ? isTragic
                                ? 'bg-rose-500/20 hover:bg-rose-500/30 border-rose-400/65 text-rose-200'
                                : 'bg-amber-500/20 hover:bg-amber-500/30 border-amber-400/70 text-amber-200'
                              : 'bg-emerald-950/90 hover:bg-emerald-900 border-emerald-400/65 text-emerald-200 shadow'
                          }`}
                        >
                          <span className="truncate">
                            {st.completed
                              ? isTragic
                                ? `📜 ${t('Исторический разлом 1851 г.', '1851 Historical Rift')}`
                                : `👑 ${t('Судьба свершилась (Легенда 3D)', 'Destiny Fulfilled (3D Legend)')}`
                              : `⚔️ ${t(`Личный квест героя: Глава ${(st.stage || 0) + 1}/3`, `Personal Quest: Act ${(st.stage || 0) + 1}/3`)}`}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-black/50 text-amber-300 font-mono text-[9.5px] shrink-0">
                            {st.completed ? t('Итог ▸', 'Summary ▸') : t('Решить ▸', 'Decide ▸')}
                          </span>
                        </button>
                      );
                    })()}
                  </div>
                );
              })()}

              {/* Военно-экономические показатели наибства */}
              <div className="grid grid-cols-4 gap-1.5 text-center text-[11px]">
                <div className="bg-[#171b22] p-1.5 rounded border border-stone-800">
                  <span className="text-[9.5px] text-stone-400 flex items-center justify-center gap-1">
                    <Shield className="w-2.5 h-2.5 text-stone-400" /> {t('Гарнизон', 'Garrison')}
                  </span>
                  <span className="font-mono font-bold text-stone-100">{selectedNaibate.garrison}</span>
                </div>
                <div className="bg-[#171b22] p-1.5 rounded border border-stone-800">
                  <span className="text-[9.5px] text-stone-400 flex items-center justify-center gap-1">
                    <Users className="w-2.5 h-2.5 text-amber-400" /> {t('Муртазеки', 'Murtazeks')}
                  </span>
                  <span className="font-mono font-bold text-amber-300">{selectedNaibate.murtazeks}</span>
                </div>
                <div className="bg-[#171b22] p-1.5 rounded border border-stone-800">
                  <span className="text-[9.5px] text-stone-400 flex items-center justify-center gap-1">
                    <Crosshair className="w-2.5 h-2.5 text-orange-400" /> {t('Порох', 'Powder')}
                  </span>
                  <span className="font-mono font-bold text-orange-300">
                    {selectedNaibate.gunpowder}{t('п', 'p')}
                  </span>
                </div>
                <div className="bg-[#171b22] p-1.5 rounded border border-stone-800">
                  <span className="text-[9.5px] text-stone-400 flex items-center justify-center gap-1">
                    <MapPin className="w-2.5 h-2.5 text-emerald-400" /> {t('Террасы', 'Terraces')}
                  </span>
                  <span className="font-mono font-bold text-emerald-300">
                    {selectedNaibate.terraceYield}%
                  </span>
                </div>
              </div>

              {/* Форма снаряжения конного гонца с сургучной печатью Шамиля */}
              <div className="bg-[#171b22] border border-amber-500/30 rounded-xl p-2.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-300 uppercase flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5" />
                    <span>
                      {t(
                        `Снарядить гонца (${selectedNaibate.travelTurns} ход.)`,
                        `Equip Courier (${selectedNaibate.travelTurns}t)`
                      )}
                    </span>
                  </span>
                  <span className="text-[11px] font-mono font-bold text-emerald-300">
                    P(exec) = {orderExecutionCalc.chance}%
                  </span>
                </div>

                <div className="space-y-1">
                  {NAIB_ORDER_TYPES.map((ord) => (
                    <label
                      key={ord.id}
                      onClick={() => setSelectedOrderType(ord.id)}
                      className={`block p-1.5 rounded-lg border text-[11px] cursor-pointer transition ${
                        selectedOrderType === ord.id
                          ? 'bg-amber-500/15 border-amber-500/60 text-stone-100'
                          : 'bg-[#0e1116] border-stone-800 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      <div className="font-bold text-amber-300 leading-tight">{t(ord.title, ord.titleEn || ord.title)}</div>
                      {selectedOrderType === ord.id && (
                        <div className="text-[10px] text-stone-300 mt-0.5 leading-snug">{t(ord.desc, ord.descEn || ord.desc)}</div>
                      )}
                    </label>
                  ))}
                </div>

                <div className="space-y-1.5 text-[11px]">
                  <div>
                    <div className="flex items-center justify-between text-stone-400 mb-1">
                      <span>
                        {t('Пороховой обоз:', 'Powder Convoy:')}{' '}
                        <strong className="text-orange-300">
                          {attachedPowder} {t('пуд.', 'poods')}
                        </strong>
                      </span>
                      <span className="font-mono text-[9.5px] text-amber-300">
                        {attachedPowder >= 45
                          ? t('Арт. обоз (+16% риск)', 'Heavy Train (+16% risk)')
                          : attachedPowder >= 30
                          ? t('Караван (+8% риск)', 'Caravan (+8% risk)')
                          : attachedPowder >= 15
                          ? t('Вьюк (+0% риск)', 'Light Pack (+0% risk)')
                          : t('Налегке (0 пуд.)', 'Courier (0p)')}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-1 mb-1 font-mono text-[10px]">
                      {[
                        { p: 0, label: t('0п', '0p'), pen: '+0%' },
                        { p: 15, label: t('15п', '15p'), pen: '+0%' },
                        { p: 30, label: t('30п', '30p'), pen: '+8%' },
                        { p: 45, label: t('45п', '45p'), pen: '+16%' }
                      ].map((tier) => (
                        <button
                          key={tier.p}
                          type="button"
                          onClick={() => setAttachedPowder(tier.p)}
                          className={`py-0.5 px-1 rounded border text-center cursor-pointer transition ${
                            attachedPowder === tier.p
                              ? 'bg-orange-500/25 border-orange-400 text-orange-200 font-bold'
                              : 'bg-[#0e1116] border-stone-800 text-stone-400 hover:text-stone-200'
                          }`}
                        >
                          {tier.label} ({tier.pen})
                        </button>
                      ))}
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="45"
                      step="5"
                      value={attachedPowder}
                      onChange={(e) => setAttachedPowder(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer h-1.5"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-400 mb-0.5">
                      {t('Субсидия серебром:', 'Silver Subsidy:')}{' '}
                      <strong className="text-amber-300">
                        {attachedSilver} {t('руб.', 'rub.')}
                      </strong>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="120"
                      step="10"
                      value={attachedSilver}
                      onChange={(e) => setAttachedSilver(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer h-1.5"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] bg-[#0c0e12] p-1.5 rounded border border-stone-800 font-mono">
                  <button
                    onClick={() => setRouteMode('mountain_path')}
                    className={`px-2 py-0.5 rounded cursor-pointer ${
                      routeMode === 'mountain_path'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'text-stone-400'
                    }`}
                  >
                    {t('Горная тропа', 'Ridge Trail')} ({orderExecutionCalc.interceptRisk}%)
                  </button>
                  <button
                    onClick={() => setRouteMode('fast_road')}
                    className={`px-2 py-0.5 rounded cursor-pointer ${
                      routeMode === 'fast_road'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'text-stone-400'
                    }`}
                  >
                    {t('Быстрый тракт (-1 ход)', 'Fast Road (-1t)')}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                  <button
                    onClick={handleSendEnvoy}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold py-2 px-2 rounded-lg text-[10.5px] uppercase tracking-wider shadow-md cursor-pointer transition"
                  >
                    {t(`Отправить гонца (${attachedPowder}п)`, `Dispatch Courier (${attachedPowder}p)`)}
                  </button>
                  <button
                    onClick={() => handleEnterTacticalDiorama(selectedNaibate)}
                    className="w-full bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-300 font-bold py-2 px-2 rounded-lg text-[10.5px] uppercase tracking-wider shadow-md cursor-pointer transition flex items-center justify-center gap-1"
                  >
                    <Swords className="w-3.5 h-3.5" />
                    <span>{t('Диорама боя', 'Siege Diorama')}</span>
                  </button>
                </div>
              </div>

              {/* Раскрываемое досье: биография, награды, 4 черты характера и математическая декомпозиция P(exec) */}
              <button
                type="button"
                onClick={() => setShowNaibDetailsDrawer((prev) => !prev)}
                className="w-full py-1.5 px-2.5 rounded-lg bg-[#0e1116] hover:bg-stone-900 border border-stone-800 text-[10.5px] font-mono text-stone-300 flex items-center justify-between cursor-pointer transition"
              >
                <span>📊 {t('Досье наиба, черты характера и расчёт P(exec)', 'Naib Dossier, Traits & P(exec) Breakdown')}</span>
                <span className="text-amber-400 font-bold">{showNaibDetailsDrawer ? '▴' : '▾'}</span>
              </button>

              {showNaibDetailsDrawer && (
                <div className="space-y-2.5 pt-0.5">
                  <p className="text-[11px] text-stone-300 leading-snug bg-[#0e1116] p-2 rounded-lg border border-stone-800/90">
                    {t(selectedNaibate.bio, selectedNaibate.bioEn || selectedNaibate.bio)}
                  </p>

                  {/* Вручённые наибу серебряные ордена Шамиля */}
                  <div className="bg-[#0e1116] border border-stone-800 rounded-lg px-2.5 py-1.5 flex flex-wrap items-center justify-between gap-1.5 text-xs">
                    <span className="text-stone-400 flex items-center gap-1 text-[11px]">
                      <Award className="w-3.5 h-3.5 text-amber-400" />
                      <span>{t('Награды наиба:', 'Naib Decorations:')}</span>
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {selectedNaibate.ordersAwarded.length === 0 ? (
                        <span className="text-[10.5px] text-stone-500 italic">
                          {t('Нет пожалованных знаков', 'No decorations awarded')}
                        </span>
                      ) : (
                        selectedNaibate.ordersAwarded.map((ordName, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/40 text-amber-300 font-mono text-[9.5px] font-bold"
                          >
                            <ShamilOrderMedallion orderId={inferOrderIdFromName(ordName)} size={16} />
                            <span>{ordName}</span>
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  {/* 4 психологические черты наиба */}
                  <div className="bg-[#0e1116] border border-stone-800 rounded-lg p-2.5 space-y-1.5">
                    <div className="text-[10.5px] font-bold text-amber-300 uppercase font-mono">
                      {t('Психологический профиль наиба:', 'Naib Psychological Profile:')}
                    </div>

                    {[
                      {
                        label: t('Иман (Преданность Газавату)', 'Iman (Devotion to Ghazawat)'),
                        val: orderExecutionCalc.effectiveIman,
                        color: 'bg-emerald-500'
                      },
                      {
                        label: t('Смелость (Военный натиск)', 'Courage (Military Audacity)'),
                        val: selectedNaibate.traits.courage,
                        color: 'bg-sky-500'
                      },
                      {
                        label: t('Алчность (Требование серебра)', 'Greed (Demand for Silver)'),
                        val: selectedNaibate.traits.greed,
                        color: 'bg-amber-500'
                      },
                      {
                        label: t('Гордыня (Своенравие и амбиции)', 'Pride (Autonomy & Ambition)'),
                        val: selectedNaibate.traits.pride,
                        color: 'bg-red-500'
                      }
                    ].map((bar) => (
                      <div key={bar.label} className="text-[11px]">
                        <div className="flex justify-between mb-0.5">
                          <span className="text-stone-300">{bar.label}</span>
                          <span className="font-mono font-bold">{bar.val}/100</span>
                        </div>
                        <div className="w-full h-1.5 bg-stone-800 rounded-full overflow-hidden">
                          <div className={`h-full ${bar.color}`} style={{ width: `${bar.val}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Визуальная плашка: Декомпозиция расчёта Диван-ханы (FOrderProbabilityBreakdown) */}
                  <div className="bg-[#0c0e12] border border-amber-500/35 rounded-lg p-2.5 space-y-1.5 text-[10.5px] font-mono">
                    <div className="flex items-center justify-between border-b border-stone-800 pb-1">
                      <span className="text-amber-300 font-bold uppercase tracking-wide">
                        {t('Расчёт Диван-ханы (FOrderProbabilityBreakdown)', 'Divan-Khana Breakdown (FOrderProbabilityBreakdown)')}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-bold">
                        {orderExecutionCalc.chance}%
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                      <div className="flex justify-between text-emerald-300">
                        <span>+ {t('Иман', 'Iman')}:</span>
                        <span className="font-bold">+{orderExecutionCalc.baseImanContribution}%</span>
                      </div>
                      <div className="flex justify-between text-rose-400">
                        <span>− {t('Алчность', 'Greed')}:</span>
                        <span className="font-bold">−{orderExecutionCalc.greedPenalty}%</span>
                      </div>
                      <div className="flex justify-between text-sky-300">
                        <span>+ {t('Смелость', 'Courage')}:</span>
                        <span className="font-bold">+{orderExecutionCalc.baseCourageContribution}%</span>
                      </div>
                      <div className="flex justify-between text-rose-400">
                        <span>− {t('Гордыня', 'Pride')}:</span>
                        <span className="font-bold">−{orderExecutionCalc.pridePenalty}%</span>
                      </div>
                      <div className="flex justify-between text-amber-300">
                        <span>+ {t('Караван', 'Convoy')}:</span>
                        <span className="font-bold">+{orderExecutionCalc.supplyBonus}%</span>
                      </div>
                      <div className="flex justify-between text-rose-400">
                        <span>− {t('Стресс', 'Strain')}:</span>
                        <span className="font-bold">−{orderExecutionCalc.stressPenalty}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* МОДАЛЬНОЕ ОКНО ЛИЧНОЙ СЮЖЕТНОЙ ЦЕПОЧКИ ГЕРОЯ (ХАДЖИ-МУРАТ / САФАРОВ / БАЙСУНГУР — АКТЫ I–III) */}
          {activeHeroArcModal &&
            (() => {
              const arc = HERO_STORY_ARCS.find((a) => a.id === activeHeroArcModal.heroId);
              if (!arc) return null;
              const st = heroArcsState?.[arc.id] || { stage: 0, completed: false, choiceHistory: [] };
              const stageIdx = Math.min(arc.chapters.length - 1, st.stage || 0);
              const curChap = arc.chapters[stageIdx];
              const linkedNaib = naibates.find((n) => n.id === arc.naibateId);
              const linkedUnit = liveFieldUnits.find((u) => u.id === arc.unitId);
              const naibMem = linkedNaib ? getNaibLoyaltyMemory(linkedNaib) : null;
              const unlockedRelicObj = IMAMAT_RELICS_CATALOG.find((r) => r.id === arc.relicRewardId);

              return (
                <div
                  className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 overflow-y-auto"
                  onClick={() => setActiveHeroArcModal && setActiveHeroArcModal(null)}
                >
                  <div
                    className="relative max-w-3xl w-full rounded-2xl border-2 border-amber-500/70 bg-[#120f0c] text-stone-100 shadow-2xl overflow-hidden my-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Художественная шапка главы с исторической картиной и портретом героя */}
                    <div className="relative h-44 sm:h-48 w-full overflow-hidden border-b border-amber-500/40">
                      <img
                        src={resolveMediaAsset(curChap.sceneArt)}
                        alt={curChap.titleRu}
                        className="w-full h-full object-cover object-center opacity-65"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#120f0c] via-[#120f0c]/55 to-black/35" />

                      <button
                        type="button"
                        onClick={() => setActiveHeroArcModal && setActiveHeroArcModal(null)}
                        className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-black/75 hover:bg-stone-900 border border-amber-500/50 text-amber-200 text-xs font-bold cursor-pointer"
                      >
                        ✕ {t('Закрыть', 'Close')}
                      </button>

                      <div className="absolute bottom-3 inset-x-4 flex items-end gap-3">
                        <img
                          src={resolveMediaAsset(arc.portraitUrl)}
                          alt={arc.heroNameRu}
                          className="w-16 h-20 sm:w-20 sm:h-24 rounded-xl object-cover object-top border-2 border-amber-400 shadow-xl shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5 mb-1">
                            {arc.chapters.map((ch, idx) => {
                              const done = st.completed || (st.stage || 0) > idx;
                              const active = !st.completed && (st.stage || 0) === idx;
                              return (
                                <span
                                  key={ch.stage}
                                  className={`px-2 py-0.5 rounded text-[9.5px] font-mono font-bold ${
                                    done
                                      ? 'bg-emerald-500 text-stone-950'
                                      : active
                                      ? 'bg-amber-400 text-stone-950 shadow'
                                      : 'bg-black/70 text-stone-400 border border-stone-700'
                                  }`}
                                >
                                  {t(`Глава ${idx + 1}`, `Act ${idx + 1}`)} {done ? '✓' : ''}
                                </span>
                              );
                            })}
                            {naibMem && (
                              <span className={`px-2 py-0.5 rounded text-[9.5px] border font-bold ${naibMem.toneClass}`}>
                                {naibMem.icon} {t(naibMem.badgeRu, naibMem.badgeEn)}
                              </span>
                            )}
                          </div>
                          <h3 className="text-base sm:text-lg font-serif font-extrabold text-amber-100 leading-tight truncate">
                            {st.completed ? (st.outcome === 'tragic_departure' ? '📜 ' : '👑 ') : ''}
                            {t(arc.heroNameRu, arc.heroNameEn)}
                          </h3>
                          <p className="text-[11px] text-amber-300/90 font-mono truncate">
                            {t(curChap.actLabelRu, curChap.actLabelEn)} • {t(curChap.locationRu, curChap.locationEn)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Основное содержание: дилемма Диван-ханы и указы с сургучной печатью */}
                    <div className="p-4 space-y-3 max-h-[68vh] overflow-y-auto">
                      {!st.completed ? (
                        <>
                          <div className="bg-[#191510] border border-amber-500/35 rounded-xl p-3 space-y-1.5">
                            <div className="text-xs sm:text-sm font-serif font-extrabold text-amber-200">
                              📜 {t(curChap.titleRu, curChap.titleEn)}
                            </div>
                            <p className="text-xs sm:text-[13px] text-stone-200 leading-relaxed font-serif">
                              {t(curChap.dilemmaRu, curChap.dilemmaEn)}
                            </p>
                          </div>

                          <div className="space-y-2">
                            <div className="text-[10.5px] uppercase tracking-wider font-mono text-emerald-300 font-bold">
                              {t('Выберите волю Имама (скрепить указом Диван-ханы):', 'Choose the Imam’s Decree (seal in the Divan-Khana):')}
                            </div>
                            {curChap.choices.map((ch) => {
                              const eff = ch.effects || {};
                              const needSilver = eff.silverDelta < 0 ? -eff.silverDelta : 0;
                              const needPowder = eff.powderDelta < 0 ? -eff.powderDelta : 0;
                              const needProv = eff.provisionsDelta < 0 ? -eff.provisionsDelta : 0;
                              const shortSilver = (resources?.silver ?? 0) < needSilver;
                              const shortPowder = (resources?.gunpowder ?? 0) < needPowder;
                              const shortProv = (resources?.provisions ?? 0) < needProv;
                              const canAfford = !shortSilver && !shortPowder && !shortProv;
                              return (
                                <button
                                  key={ch.id}
                                  type="button"
                                  disabled={!canAfford}
                                  onClick={() =>
                                    canAfford &&
                                    handleResolveHeroArcChoice &&
                                    handleResolveHeroArcChoice(arc.id, stageIdx, ch)
                                  }
                                  className={`w-full text-left rounded-xl border p-3 transition shadow ${
                                    canAfford
                                      ? 'border-amber-500/40 hover:border-emerald-400 bg-[#17130f] hover:bg-[#1d1912] cursor-pointer group'
                                      : 'border-stone-800 bg-[#13100d]/70 opacity-65 cursor-not-allowed'
                                  }`}
                                >
                                  <div className="flex items-start gap-2.5">
                                    <span className="mt-0.5 text-amber-400 group-hover:text-emerald-300 shrink-0">
                                      <WaxSealIcon className="w-4 h-4" />
                                    </span>
                                    <div className="flex-1 space-y-1">
                                      <div className="font-serif font-extrabold text-xs sm:text-[13px] text-amber-100 group-hover:text-white">
                                        {t(ch.labelRu, ch.labelEn)}
                                      </div>
                                      <div className="text-[10.5px] font-mono text-emerald-300/95">
                                        ⚡ {t(ch.previewRu, ch.previewEn)}
                                      </div>
                                      {!canAfford && (
                                        <div className="text-[10px] font-mono text-rose-400 font-bold">
                                          ⚠️{' '}
                                          {shortSilver
                                            ? t(`Не хватает серебра (${resources?.silver ?? 0}/${needSilver} руб.)`, `Insufficient silver (${resources?.silver ?? 0}/${needSilver} rub.)`)
                                            : shortPowder
                                            ? t(`Не хватает пороха (${resources?.gunpowder ?? 0}/${needPowder} пуд.)`, `Insufficient powder (${resources?.gunpowder ?? 0}/${needPowder} p.)`)
                                            : t(`Не хватает провианта (${resources?.provisions ?? 0}/${needProv} мер)`, `Insufficient provisions (${resources?.provisions ?? 0}/${needProv})`)}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </>
                      ) : (
                        <div className="space-y-3">
                          <div
                            className={`rounded-xl p-3.5 space-y-2 border ${
                              st.outcome === 'tragic_departure'
                                ? 'bg-gradient-to-r from-[#231214] to-[#161210] border-rose-400/65'
                                : 'bg-gradient-to-r from-[#211a0c] to-[#111c16] border-amber-400/70'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span
                                className={`font-serif font-extrabold text-sm ${
                                  st.outcome === 'tragic_departure' ? 'text-rose-200' : 'text-amber-200'
                                }`}
                              >
                                {st.outcome === 'tragic_departure'
                                  ? `📜 ${t('Исторический разлом 1851 года зафиксирован', '1851 Historical Rift Recorded')}`
                                  : `👑 ${t('Трёхактная судьба героя свершилась!', 'Three-Act Hero Destiny Fulfilled!')}`}
                              </span>
                              {linkedUnit && (
                                <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-400/50 text-emerald-200 text-[10.5px] font-mono font-bold">
                                  ⚔️ {linkedUnit.sabers} • {'★'.repeat(Math.min(3, linkedUnit.vetXp || 1))}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-stone-200 leading-relaxed">
                              {st.outcome === 'tragic_departure'
                                ? t(
                                    'Вследствие жёсткого приговора Диван-ханы в ноябре 1851 года произошёл исторический разрыв Хаджи-Мурата с Ведено, воспетый Л. Н. Толстым. Конный отряд Хунзаха реорганизован под командованием муртазеков Имама, а знамя хунзахских всадников сохранено в сокровищнице.',
                                    'Following the stern verdict of the Divan-Khana in November 1851, Hadji Murad’s historical rift with Vedeno unfolded as chronicled by Leo Tolstoy. The Khunzakh squadron has been reorganized under the Imam’s Murtazeks, and the Khunzakh banner remains in the treasury.'
                                  )
                                : t(arc.summaryRu, arc.summaryEn)}
                            </p>
                            {unlockedRelicObj && (
                              <div className="text-[11px] text-amber-300 font-semibold pt-1 border-t border-amber-500/25">
                                🏛️ {t('Открытая реликвия:', 'Unlocked Relic:')} {unlockedRelicObj.icon}{' '}
                                {t(unlockedRelicObj.titleRu, unlockedRelicObj.titleEn)} —{' '}
                                <span className="text-emerald-300">
                                  {t(unlockedRelicObj.bonusSummaryRu, unlockedRelicObj.bonusSummaryEn)}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="space-y-1.5">
                            <div className="text-[10.5px] uppercase font-mono text-stone-400 font-bold">
                              {t('Скреплённые главы в Хронике аль-Карахи:', 'Sealed Acts in al-Qarakhi’s Chronicle:')}
                            </div>
                            {arc.chapters.map((ch, i) => {
                              const pickedId = st.choiceHistory?.[i];
                              const picked = ch.choices.find((c) => c.id === pickedId) || ch.choices[0];
                              return (
                                <div
                                  key={ch.stage}
                                  className="rounded-lg bg-[#161310] border border-stone-800 px-3 py-2 text-[11px]"
                                >
                                  <div className="font-serif font-bold text-amber-300">
                                    ✓ {t(ch.actLabelRu, ch.actLabelEn)} — {t(ch.titleRu, ch.titleEn)}
                                  </div>
                                  <div className="text-stone-300 mt-0.5">
                                    {t(picked.chronicleRu, picked.chronicleEn)}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                if (setSelectedNaibateId) setSelectedNaibateId(arc.naibateId);
                                if (setSelectedUnitId) setSelectedUnitId(arc.unitId);
                                if (setReal3DTableMode) setReal3DTableMode(true);
                                if (setActiveHeroArcModal) setActiveHeroArcModal(null);
                              }}
                              className={`px-3 py-1.5 rounded-lg font-serif font-extrabold text-xs cursor-pointer shadow ${
                                st.outcome === 'tragic_departure'
                                  ? 'bg-rose-500/25 hover:bg-rose-500/35 border border-rose-400/65 text-rose-100'
                                  : 'bg-gradient-to-r from-amber-400 to-emerald-400 text-stone-950'
                              }`}
                            >
                              {st.outcome === 'tragic_departure'
                                ? `🗺️ ${t('Показать Хунзах и муртазеков на 3D-Столе', 'Inspect Khunzakh & Murtazeks on 3D Table')}`
                                : `🏔️ ${t('Осмотреть золотой 3D-венец на столе WebGL', 'Inspect Golden 3D Crown on WebGL Table')}`}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* МОДАЛЬНОЕ ОКНО МНОГОФАЗНОЙ ИСТОРИЧЕСКОЙ ОПЕРАЦИИ-ЭПИЗОДА (4 СТУПЕНИ • 1839–1859) */}
            {activeEpisodeModal && activeEpisodeObj && (
              <div
                className="fixed inset-0 z-[86] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5"
                role="dialog"
                aria-modal="true"
                onClick={() => setActiveEpisodeModal && setActiveEpisodeModal(false)}
              >
                <div
                  className="relative hud-walnut-bezel bg-[#130f0b] border-2 border-amber-400/75 rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl hud-fade-up"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="hud-brass-corner tl" />
                  <span className="hud-brass-corner tr" />
                  <span className="hud-brass-corner bl" />
                  <span className="hud-brass-corner br" />

                  {/* Верхняя шапка с иллюстрацией текущей оперативной фазы и переключателем 5 Эпизодов */}
                  <div className="relative h-44 sm:h-52 overflow-hidden border-b border-amber-500/35 bg-stone-950">
                    {activeEpPhase?.art === 'Orders_Shamil_Kubachi_Showcase_1845.jpg' ? (
                      <div className="w-full h-full flex items-center justify-center bg-[#3f0c12]">
                        <ShamilOrdersMuseumShowcase compact interactive={false} t={t} className="border-0 rounded-none" />
                      </div>
                    ) : (
                      <img
                        src={resolveMediaAsset(activeEpPhase?.art || 'KeyArt_DivanKhana_Council_Vedeno_1845.jpg')}
                        alt={t(activeEpisodeObj.titleRu, activeEpisodeObj.titleEn)}
                        className="w-full h-full object-cover opacity-65"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#130f0b] via-[#130f0b]/60 to-black/35" />

                    <div className="absolute top-2.5 left-3 right-3 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1">
                        {HISTORICAL_EPISODES.map((ep) => {
                          const epDone = episodesState?.[ep.id]?.completed;
                          const isCurrentEp = ep.id === activeEpisodeObj.id;
                          return (
                            <button
                              key={ep.id}
                              type="button"
                              onClick={() => setActiveEpisodeId && setActiveEpisodeId(ep.id)}
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-serif font-bold border cursor-pointer transition ${
                                isCurrentEp
                                  ? 'bg-amber-400 text-stone-950 border-amber-200 shadow'
                                  : epDone
                                  ? 'bg-emerald-950/85 text-emerald-200 border-emerald-400/60 hover:bg-emerald-900'
                                  : 'bg-black/75 text-stone-300 border-stone-700 hover:text-amber-200'
                              }`}
                            >
                              {t(`Эпизод ${ep.episodeNumber}`, `Episode ${ep.episodeNumber}`)}
                              {epDone ? ' ✓' : ''}
                            </button>
                          );
                        })}
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveEpisodeModal && setActiveEpisodeModal(false)}
                        className="px-2.5 py-1 rounded-lg bg-black/75 hover:bg-stone-900 border border-amber-500/45 text-amber-200 text-xs font-bold cursor-pointer"
                      >
                        ✕ {t('Закрыть', 'Close')}
                      </button>
                    </div>

                    <div className="absolute bottom-3 left-4 right-4 space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded bg-amber-500/25 border border-amber-400/60 text-amber-200 text-[10px] font-mono font-bold">
                          {t(activeEpisodeObj.yearsLabelRu, activeEpisodeObj.yearsLabelEn)}
                        </span>
                        {activeEpisodeObj.phases.map((ph, idx) => {
                          const done = activeEpProgress.completed || (activeEpProgress.phaseIdx || 0) > idx;
                          const cur = !activeEpProgress.completed && (activeEpProgress.phaseIdx || 0) === idx;
                          return (
                            <span
                              key={ph.id}
                              className={`px-2 py-0.5 rounded text-[9.5px] font-mono font-bold ${
                                done
                                  ? 'bg-emerald-500 text-stone-950'
                                  : cur
                                  ? 'bg-amber-400 text-stone-950 shadow'
                                  : 'bg-black/75 text-stone-400 border border-stone-700'
                              }`}
                            >
                              {t(`Фаза ${idx + 1}/4`, `Phase ${idx + 1}/4`)}
                              {done ? ' ✓' : ''}
                            </span>
                          );
                        })}
                        <span className="px-2 py-0.5 rounded bg-emerald-950/90 border border-emerald-400/50 text-emerald-200 text-[9.5px] font-mono font-bold">
                          ★ {t('Столица:', 'Capital:')} {t(capitalLabelRu, capitalLabelEn)}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-serif font-extrabold text-amber-100 leading-tight">
                        {t(activeEpisodeObj.titleRu, activeEpisodeObj.titleEn)}
                      </h3>
                      <p className="text-[11px] text-amber-300/90 font-serif">
                        {t(activeEpisodeObj.subtitleRu, activeEpisodeObj.subtitleEn)}
                      </p>
                    </div>
                  </div>

                  {/* Тело оперативного совета */}
                  <div className="p-4 space-y-3 max-h-[65vh] overflow-y-auto">
                    {!activeEpProgress.completed && activeEpPhase ? (
                      <>
                        <div className="bg-[#191510] border border-amber-500/35 rounded-xl p-3.5 space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-xs sm:text-sm font-serif font-extrabold text-amber-200">
                              ⚔️ {t(activeEpPhase.titleRu, activeEpPhase.titleEn)}
                            </span>
                            <span className="text-[10.5px] font-mono text-amber-400 font-bold">
                              {t(activeEpPhase.dateRu, activeEpPhase.dateEn)}
                            </span>
                          </div>
                          <p className="text-xs sm:text-[13px] text-stone-200 leading-relaxed font-serif">
                            {t(activeEpPhase.contextRu, activeEpPhase.contextEn)}
                          </p>
                          {activeEpPhase.quoteRu && (
                            <blockquote className="border-l-2 border-amber-400/80 pl-3 py-1 bg-black/35 rounded-r-lg text-[11.5px] italic text-amber-100/95 font-serif">
                              <div>{t(activeEpPhase.quoteRu, activeEpPhase.quoteEn)}</div>
                              <div className="not-italic text-[10px] font-mono text-emerald-300 mt-1">
                                — {t(activeEpPhase.speakerRu, activeEpPhase.speakerEn)}
                              </div>
                            </blockquote>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2 text-[10.5px] uppercase tracking-wider font-mono text-emerald-300 font-bold">
                            <span>
                              {t(
                                'Примите оперативное решение (перестраивает ТВД и хронику):',
                                'Issue Operational Order (updates 3D Theater & Chronicle):'
                              )}
                            </span>
                            {activeEpPhase.focusNaibateId && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (setSelectedNaibateId) setSelectedNaibateId(activeEpPhase.focusNaibateId);
                                  const focusN = naibates.find((n) => n.id === activeEpPhase.focusNaibateId);
                                  if (focusN && handleEnterTacticalDiorama) {
                                    setActiveEpisodeModal(false);
                                    handleEnterTacticalDiorama(focusN);
                                  }
                                }}
                                className="px-2 py-0.5 rounded bg-sky-950/90 hover:bg-sky-900 border border-sky-400/50 text-sky-200 text-[10px] cursor-pointer"
                              >
                                🏔️ {t('Разыграть тактический 3D-бой в ущелье', 'Fight 3D Gorge Battle')}
                              </button>
                            )}
                          </div>

                          {activeEpPhase.choices.map((ch) => {
                            const needSilver = ch.silverDelta < 0 ? -ch.silverDelta : 0;
                            const needPowder = ch.powderDelta < 0 ? -ch.powderDelta : 0;
                            const needProv = ch.provisionsDelta < 0 ? -ch.provisionsDelta : 0;
                            const canAfford =
                              (resources?.silver ?? 0) >= needSilver &&
                              (resources?.gunpowder ?? 0) >= needPowder &&
                              (resources?.provisions ?? 0) >= needProv;
                            return (
                              <button
                                key={ch.id}
                                type="button"
                                disabled={!canAfford}
                                onClick={() =>
                                  canAfford &&
                                  handleResolveEpisodePhase &&
                                  handleResolveEpisodePhase(activeEpisodeObj.id, ch)
                                }
                                className={`w-full text-left rounded-xl border p-3 transition shadow ${
                                  canAfford
                                    ? 'border-amber-500/45 hover:border-emerald-400 bg-[#17130f] hover:bg-[#1e1912] cursor-pointer group'
                                    : 'border-stone-800 bg-[#13100d]/70 opacity-65 cursor-not-allowed'
                                }`}
                              >
                                <div className="flex items-start gap-2.5">
                                  <span className="mt-0.5 text-amber-400 group-hover:text-emerald-300 shrink-0">
                                    <WaxSealIcon className="w-4 h-4" />
                                  </span>
                                  <div className="flex-1 space-y-1">
                                    <div className="font-serif font-extrabold text-xs sm:text-[13px] text-amber-100 group-hover:text-white">
                                      {t(ch.labelRu, ch.labelEn)}
                                    </div>
                                    <div className="text-[10.5px] font-mono text-emerald-300/95">
                                      ⚡ {t(ch.effectRu, ch.effectEn)}
                                    </div>
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </>
                    ) : (
                      <div className="space-y-3">
                        <div className="rounded-xl p-3.5 space-y-2 border bg-gradient-to-r from-[#211a0c] to-[#101e17] border-amber-400/70">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-serif font-extrabold text-sm text-amber-200">
                              🏆 {t('Все 4 фазы исторической операции успешно завершены!', 'All 4 Phases of the Historical Operation Completed!')}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-400/55 text-emerald-200 text-[10.5px] font-mono font-bold">
                              +25 {t('пуд. пороха', 'p. powder')} • +80 {t('руб.', 'rub.')}
                            </span>
                          </div>
                          <div className="space-y-1.5 pt-1">
                            {(activeEpProgress.history || []).map((rec, i) => (
                              <div
                                key={`${rec.phaseId}-${i}`}
                                className="rounded-lg bg-black/45 border border-stone-800 px-3 py-2 text-[11px]"
                              >
                                <div className="font-serif font-bold text-amber-300">
                                  ✓ {t(`Фаза ${i + 1}/4:`, `Phase ${i + 1}/4:`)} {t(rec.labelRu, rec.labelEn)}
                                </div>
                                <div className="text-stone-300 mt-0.5">
                                  {t(rec.chronicleRu, rec.chronicleEn)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-end gap-2">
                          {activeEpisodeObj.nextChainEpisodeId && (
                            <button
                              type="button"
                              onClick={() =>
                                setActiveEpisodeId &&
                                setActiveEpisodeId(activeEpisodeObj.nextChainEpisodeId)
                              }
                              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-400 to-amber-400 text-stone-950 font-serif font-extrabold text-xs cursor-pointer shadow"
                            >
                              ▶ {t('Перейти к следующему Эпизоду кампании', 'Advance to Next Campaign Episode')}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setActiveEpisodeModal && setActiveEpisodeModal(false)}
                            className="px-3.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 border border-amber-500/45 text-amber-200 font-serif font-bold text-xs cursor-pointer"
                          >
                            🏔️ {t('Вернуться к 3D-Столу Кавказа', 'Return to 3D Caucasus Table')}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
  );
}

export default memo(MapTab);
