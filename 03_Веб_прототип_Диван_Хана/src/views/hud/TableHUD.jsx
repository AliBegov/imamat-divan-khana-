// HUD 3D-СТОЛА В ДУХЕ TOTAL WAR / UNITY OF COMMAND II
//  • Мини-карта театра войны с рамкой камеры и туманом разведки;
//  • Нижняя полоса карточек отрядов с портретами командиров и шкалой очков хода (ОД / верст);
//  • Карточки неприятельских колонн с разведданными (туман войны) и статусом линии снабжения.
import React, { useRef, useState } from 'react';
import { resolveMediaAsset } from '../../data/embeddedMediaAssets.js';
import { SQUADRON_GEAR_CATALOG } from '../../data/theaterEntities.js';
import { PortraitMedallion, findPortrait, useHoverIntent } from './GameHUD.jsx';
import {
  CompassRoseIcon,
  ImperialEagleIcon,
  SeveredConvoyIcon,
  ShashkaSabersIcon,
  WatchtowerIcon,
  WaxSealIcon
} from './PeriodIcons.jsx';

const MINI_W = 152;

export function Minimap({
  mapW,
  mapH,
  view,
  zoom,
  units = [],
  enemies = [],
  forts = [],
  naibates = [],
  selectedUnitId,
  onJump,
  onZoom,
  onReset,
  t,
  className = ''
}) {
  const svgRef = useRef(null);
  const draggingRef = useRef(false);
  const [collapsed, setCollapsed] = useState(false);
  const miniH = Math.round((MINI_W * mapH) / mapW);

  const toMap = (e) => {
    const r = svgRef.current.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(mapW, ((e.clientX - r.left) / r.width) * mapW)),
      y: Math.max(0, Math.min(mapH, ((e.clientY - r.top) / r.height) * mapH))
    };
  };
  const onDown = (e) => {
    e.stopPropagation();
    draggingRef.current = true;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const p = toMap(e);
    onJump(p.x, p.y, false);
  };
  const onMove = (e) => {
    if (!draggingRef.current) return;
    const p = toMap(e);
    onJump(p.x, p.y, true);
  };
  const onUp = () => {
    draggingRef.current = false;
  };

  return (
    <div
      className={`hud-minimap absolute z-20 select-none ${className}`}
      onClick={(e) => e.stopPropagation()}
      role="group"
      aria-label={t('Мини-карта театра войны', 'Theatre minimap')}
    >
      <div className="flex items-center justify-between gap-1 px-1.5 pt-1 pb-0.5 text-[9.5px] hud-num">
        <span className="text-amber-300 font-bold tracking-wider flex items-center gap-1">
          <CompassRoseIcon className="w-3 h-3" />
          <span>{t('ТЕАТР', 'MAP')}</span>
        </span>
        <span className="flex items-center gap-0.5">
          <span className="text-stone-400 mr-0.5">×{zoom.toFixed(1)}</span>
          <button
            onClick={() => onZoom(-0.3)}
            aria-label={t('Отдалить камеру', 'Zoom camera out')}
            className="hud-mini-btn"
          >
            −
          </button>
          <button
            onClick={() => onZoom(0.3)}
            aria-label={t('Приблизить камеру', 'Zoom camera in')}
            className="hud-mini-btn"
          >
            +
          </button>
          <button onClick={onReset} aria-label={t('Весь театр', 'Whole theatre')} className="hud-mini-btn">
            ⌂
          </button>
          <button
            onClick={() => setCollapsed((v) => !v)}
            aria-label={t('Свернуть мини-карту', 'Toggle minimap')}
            className="hud-mini-btn"
            title={t('Свернуть / развернуть мини-карту', 'Collapse / expand minimap')}
          >
            {collapsed ? '▾' : '▴'}
          </button>
        </span>
      </div>
      {!collapsed && (
        <svg
          ref={svgRef}
          viewBox={`0 0 ${mapW} ${mapH}`}
          width={MINI_W}
          height={miniH}
          className="block cursor-pointer rounded-b-md"
          style={{ touchAction: 'none' }}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
        >
          <image
            href={resolveMediaAsset('Caucasus_SRTM_Realistic_Relief_1845.jpg')}
            x="0"
            y="0"
            width={mapW}
            height={mapH}
            preserveAspectRatio="none"
          />
          <rect x="0" y="0" width={mapW} height={mapH} fill="#0b0d12" opacity="0.28" />
          {/* затемнение вне кадра камеры */}
          <path
            fillRule="evenodd"
            fill="#05070a"
            opacity="0.5"
            d={`M0 0H${mapW}V${mapH}H0Z M${view.x} ${view.y}h${view.w}v${view.h}h${-view.w}Z`}
          />
          {naibates.map((n) => (
            <g key={n.id} transform={`translate(${n.coords.x} ${n.coords.y})`}>
              {n.underSiege && <circle r="16" fill="none" stroke="#ef4444" strokeWidth="4" className="hud-mini-ping" />}
              <rect
                x="-6"
                y="-6"
                width="12"
                height="12"
                transform="rotate(45)"
                fill={n.underSiege ? '#ef4444' : '#f59e0b'}
                stroke="#1c1917"
                strokeWidth="2.5"
              />
            </g>
          ))}
          {forts.map((f) => (
            <rect key={f.id} x={f.x - 7} y={f.y - 7} width="14" height="14" fill="#7f1d1d" stroke="#fecaca" strokeWidth="2.5" />
          ))}
          {enemies.map((c) => (
            <path
              key={c.id}
              d="M0 -11 L10 8 L-10 8 Z"
              transform={`translate(${c.x} ${c.y})`}
              fill={c.fogHidden ? '#64748b' : '#dc2626'}
              stroke={c.supplyCut ? '#fbbf24' : '#fee2e2'}
              strokeWidth="2.5"
              opacity={c.status === 'routed' || c.status === 'destroyed' ? 0.3 : c.fogHidden ? 0.45 : 1}
            />
          ))}
          {units.map((u) => (
            <g key={u.id} transform={`translate(${u.x} ${u.y})`}>
              {u.id === selectedUnitId && <circle r="15" fill="none" stroke="#fff" strokeWidth="3" />}
              <circle r="8.5" fill={u.color} stroke="#0c0a09" strokeWidth="3" />
            </g>
          ))}
          {/* рамка камеры */}
          <rect
            x={view.x}
            y={view.y}
            width={view.w}
            height={view.h}
            fill="none"
            stroke="#fef3c7"
            strokeWidth="4"
            vectorEffect="non-scaling-stroke"
            style={{ strokeWidth: 1.5 }}
          />
        </svg>
      )}
    </div>
  );
}

const STATUS = {
  moving: { ru: '▶ В марше', en: '▶ Marching', cls: 'text-emerald-300' },
  camped: { ru: '⛺ Привал', en: '⛺ Camped', cls: 'text-amber-400' },
  arrived: { ru: '✓ На рубеже', en: '✓ In Position', cls: 'text-amber-300' }
};

function UnitCard({ u, idx = 0, selected, onPick, t }) {
  const hover = useHoverIntent(180);
  const portrait = findPortrait(u.commanderRu, u.id);
  const st = STATUS[u.status] || { ru: '⏸ В седле', en: '⏸ Ready', cls: 'text-stone-300' };
  const maxMp = u.maxMp || 150;
  const curMp = Math.max(0, Math.round(u.mp ?? maxMp));
  const mpRatio = Math.max(0, Math.min(1, curMp / maxMp));
  const curSabers = u.sabers ?? 400;
  const maxSabers = u.maxSabers ?? 400;
  const vetStars = Math.min(3, Math.max(0, Math.floor(u.vetXp ?? 0)));
  const starsText = vetStars > 0 ? '★'.repeat(vetStars) : '';
  const capturedGuns = u.capturedGuns || 0;
  const gearList = (u.gear || []).map((gid) => SQUADRON_GEAR_CATALOG[gid]).filter(Boolean);
  const gearIcons = gearList.map((g) => g.icon).join('');
  const medalsCount = (u.medals || []).length;
  const rankTitleRu =
    vetStars >= 3
      ? '★★★ Гвардия Имама (+15% к бою)'
      : vetStars === 2
        ? '★★ Отборная сотня (+10% к бою)'
        : vetStars === 1
          ? '★ Закалённые уздени (+5% к бою)'
          : 'Ополчение джамаата';
  const rankTitleEn =
    vetStars >= 3
      ? '★★★ Imam’s Guard (+15% combat)'
      : vetStars === 2
        ? '★★ Elite Squadron (+10% combat)'
        : vetStars === 1
          ? '★ Veteran Uzdens (+5% combat)'
          : 'Jamaat Militia';
  const tipPos = idx === 0 ? 'left-0' : idx >= 4 ? 'right-0' : 'left-1/2 -translate-x-1/2';

  return (
    <div className="relative flex-[1.18_1_0%] min-w-0" onMouseEnter={hover.show} onMouseLeave={hover.hide}>
      <button
        onClick={() => onPick(u)}
        onFocus={hover.show}
        onBlur={hover.hide}
        aria-pressed={selected}
        aria-label={`${t(u.nameRu, u.nameEn)} — ${t(u.commanderRu, u.commanderEn)}`}
        className={`hud-unit-card w-full ${selected ? 'hud-unit-card-selected' : ''}`}
        style={{ '--unit-color': u.color }}
      >
        <PortraitMedallion src={portrait} name={u.commanderRu} color={u.color} size={30} selected={selected} />
        <span className="min-w-0 flex-1 text-left">
          <span className="flex items-center justify-between gap-1">
            <span className="font-serif text-[9px] font-extrabold tracking-tight truncate" style={{ color: u.color }}>
              {starsText && <span className="text-amber-300 mr-0.5">{starsText}</span>}
              {t(u.badgeRu, u.badgeEn)}
            </span>
            <span className="hud-num text-[8.5px] text-amber-200/90 font-bold shrink-0">
              {curMp}/{maxMp}
            </span>
          </span>
          <span className="flex items-center justify-between gap-1">
            <span className={`hud-num text-[8.5px] font-semibold truncate ${st.cls}`}>{t(st.ru, st.en)}</span>
            <span className="hud-num text-[8px] text-stone-300 shrink-0">
              {curSabers}⚔{capturedGuns > 0 ? ` • ${capturedGuns}💣` : ''}
              {gearIcons ? ` • ${gearIcons}` : ''}
              {medalsCount > 0 ? '🥈' : ''}
            </span>
          </span>
          <span className="block h-[3px] mt-0.5 rounded bg-stone-800 overflow-hidden" title={t('Запас хода на текущий месяц', 'Movement points remaining this turn')}>
            <span
              className="block h-full rounded transition-all duration-200"
              style={{
                width: `${Math.round(mpRatio * 100)}%`,
                background: curMp <= 12 ? '#f59e0b' : u.color
              }}
            />
          </span>
        </span>
      </button>
      {hover.open && (
        <div
          className={`hud-tooltip absolute bottom-full ${tipPos} mb-2.5 w-[275px] z-[65] pointer-events-auto`}
          onMouseEnter={hover.show}
          onMouseLeave={hover.hide}
        >
          <div className="flex items-center gap-2.5 border-b border-amber-500/30 pb-1.5 mb-1.5">
            <PortraitMedallion src={portrait} name={u.commanderRu} color={u.color} size={50} />
            <div className="min-w-0">
              <div className="text-[12px] font-serif font-bold text-amber-300 leading-tight">{t(u.nameRu, u.nameEn)}</div>
              <div className="text-[10.5px] text-stone-300">{t(u.commanderRu, u.commanderEn)}</div>
              <div className="text-[9.5px] font-serif text-amber-200/90 mt-0.5">{t(rankTitleRu, rankTitleEn)}</div>
            </div>
          </div>
          <div className="text-[10.5px] text-stone-300 leading-snug flex items-start gap-1.5">
            <WaxSealIcon className="w-3.5 h-3.5 mt-0.5" />
            <span>{t(u.orderTitleRu, u.orderTitleEn)}</span>
          </div>
          <div className="text-[10.5px] text-stone-400 mt-1 flex items-center gap-1.5">
            <CompassRoseIcon className="w-3.5 h-3.5" />
            <span className="truncate">{t(u.targetLabelRu, u.targetLabelEn)}</span>
          </div>
          <div className="flex justify-between items-center text-[10px] hud-num mt-1.5 pt-1 border-t border-stone-800">
            <span className="text-emerald-300 font-bold">
              {t('Сабель в строю:', 'Sabers ready:')} {curSabers}/{maxSabers}
            </span>
            <span className="text-amber-300 font-bold">
              {t('ОХ:', 'MP:')} {curMp}/{maxMp}
            </span>
          </div>
          {capturedGuns > 0 && (
            <div className="flex justify-between items-center text-[10px] hud-num mt-0.5 text-amber-200">
              <span>{t('Трофейные единороги:', 'Captured unicorns:')}</span>
              <span className="font-bold">+{capturedGuns} 💣 (+{capturedGuns * 4}% {t('огня', 'fire')})</span>
            </div>
          )}
          {gearList.length > 0 && (
            <div className="mt-1 pt-1 border-t border-stone-800/80 space-y-0.5 text-[9.5px]">
              {gearList.map((g) => (
                <div key={g.id} className="flex items-center justify-between text-emerald-200">
                  <span className="font-semibold">
                    {g.icon} {t(g.shortRu, g.shortEn)}
                  </span>
                  <span className="text-[9px] text-amber-200/90 truncate ml-1">{t(g.bonusRu, g.bonusEn)}</span>
                </div>
              ))}
            </div>
          )}
          {medalsCount > 0 && (
            <div className="flex justify-between items-center text-[9.5px] hud-num mt-0.5 text-amber-300">
              <span>🥈 {t('Серебряный орден Имамата:', 'Silver-Niello Order:')}</span>
              <span className="font-bold truncate ml-1">{u.medals[u.medals.length - 1]}</span>
            </div>
          )}
          {typeof u.obediencePct === 'number' && (
            <div className="flex justify-between items-center text-[10px] hud-num mt-0.5">
              <span className="text-stone-400">{t('Дисциплина наиба:', 'Naib obedience:')}</span>
              <span className={u.obediencePct >= 75 ? 'text-emerald-300 font-bold' : 'text-amber-300 font-bold'}>
                P(exec) {u.obediencePct}%
              </span>
            </div>
          )}
          <div className="text-[9.5px] text-sky-300 hud-num mt-1.5">
            {t('Клик — выбрать отряд и навести камеру', 'Click — select unit & focus camera')}
          </div>
        </div>
      )}
    </div>
  );
}

function EnemyCard({ c, onPick, t }) {
  const hover = useHoverIntent(180);
  const isFogged = Boolean(c.fogHidden);
  const ratio = isFogged ? 0.65 : c.maxBayonets ? Math.max(0, Math.min(1, c.bayonets / c.maxBayonets)) : 1;
  const shortRu = isFogged
    ? '? Колонна РИ'
    : c.badgeRu.replace(/^КОЛОННА\s+|^ОТРЯД\s+/i, '');
  const shortEn = isFogged
    ? '? Imperial Force'
    : c.badgeEn.replace(/\s+COLUMN$|\s+FORCE$/i, '');

  return (
    <div className="relative flex-[0.95_1_0%] min-w-0" onMouseEnter={hover.show} onMouseLeave={hover.hide}>
      <button
        onClick={() => onPick(c)}
        onFocus={hover.show}
        onBlur={hover.hide}
        aria-label={isFogged ? t('Неразведанная колонна РИ', 'Unscouted Imperial column') : t(c.nameRu, c.nameEn)}
        className={`hud-enemy-card w-full ${c.supplyCut ? 'ring-1 ring-amber-400/70' : ''}`}
      >
        <span
          className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ${
            c.supplyCut
              ? 'bg-amber-950/90 border-amber-400 text-amber-300'
              : isFogged
              ? 'bg-slate-900/90 border-slate-600 text-slate-400'
              : 'bg-rose-950/90 border-rose-500/70 text-rose-200'
          }`}
          aria-hidden="true"
        >
          {c.supplyCut ? <SeveredConvoyIcon className="w-3.5 h-3.5" /> : <ImperialEagleIcon className="w-3.5 h-3.5" />}
        </span>
        <span className="min-w-0 flex-1 text-left">
          <span className="block font-serif text-[9px] font-extrabold text-rose-200 truncate">
            {t(shortRu, shortEn)}
          </span>
          <span className="block hud-num text-[8.5px] text-stone-300 truncate">
            {isFogged
              ? t('В тумане (~2–4 тыс.)', 'In fog (~2–4k)')
              : c.supplyCut
              ? `${c.bayonets} ${t('шт. • ОБОЗ ✂', 'bay. • CUT ✂')}`
              : `${c.bayonets} ${t('шт.', 'bay.')}`}
          </span>
          <span className="block h-[3px] mt-0.5 rounded bg-stone-800 overflow-hidden">
            <span
              className={`block h-full rounded ${isFogged ? 'bg-slate-500' : c.supplyCut ? 'bg-amber-400' : 'bg-rose-500'}`}
              style={{ width: `${Math.round(ratio * 100)}%` }}
            />
          </span>
        </span>
      </button>
      {hover.open && (
        <div
          className="hud-tooltip absolute bottom-full right-0 mb-2.5 w-[265px] z-[65] pointer-events-auto"
          onMouseEnter={hover.show}
          onMouseLeave={hover.hide}
        >
          <div className="text-[12px] font-serif font-bold text-rose-300 leading-tight mb-1">
            {isFogged ? t('Разъезды доносят о движении колонны РИ', 'Scouts report an Imperial column') : t(c.nameRu, c.nameEn)}
          </div>
          <div className="text-[10.5px] text-stone-300 flex items-center gap-1.5">
            <WatchtowerIcon className="w-3.5 h-3.5 text-rose-300" />
            <span>
              {t(c.originNameRu, c.originNameEn)} →{' '}
              {isFogged ? t('Направление скрыто туманом', 'Target obscured by fog') : t(c.targetLabelRu, c.targetLabelEn)}
            </span>
          </div>
          <div className="text-[10px] hud-num text-stone-300 mt-1">
            {isFogged
              ? t('Зажгите сигнальный костёр или пошлите чапара для точной разведки штыков.', 'Light a signal beacon or move a scout closer to reveal exact bayonet strength.')
              : `${t('Штыков в строю', 'Bayonets')}: ${c.bayonets} / ${c.maxBayonets}`}
          </div>
          {c.supplyCut && (
            <div className="mt-1.5 px-2 py-1 rounded bg-amber-500/15 border border-amber-400/50 text-[10px] text-amber-200 font-semibold">
              {t('Линия снабжения с крепостью перерезана! Колонна теряет -14% штыков за ход и -25% натиска в бою.', 'Supply line severed! Column suffers -14% attrition per turn and -25% combat power.')}
            </div>
          )}
          <div className="text-[9.5px] text-sky-300 hud-num mt-1.5">
            {t('Клик — навести камеру на рубеж', 'Click — focus camera')}
          </div>
        </div>
      )}
    </div>
  );
}

export function UnitCardBar({ units, enemies, selectedUnitId, onPickUnit, onPickEnemy, t }) {
  return (
    <div
      className="hud-unit-bar relative z-20 grid grid-cols-2 sm:flex sm:items-stretch gap-1.5 px-2.5 py-1.5"
      role="toolbar"
      aria-label={t('Отряды на столе', 'Units on the table')}
    >
      <span className="hidden xl:flex flex-col justify-center pr-1 text-[8.5px] font-serif font-bold text-amber-300/90 uppercase leading-tight shrink-0">
        <span className="flex items-center gap-1">
          <ShashkaSabersIcon className="w-3 h-3 text-amber-400" />
          <span>{t('Сотни', 'Forces')}</span>
        </span>
        <span className="text-stone-400">{t('Имамата', 'Imamate')}</span>
      </span>
      {units.map((u, idx) => (
        <UnitCard key={u.id} u={u} idx={idx} selected={u.id === selectedUnitId} onPick={onPickUnit} t={t} />
      ))}
      {enemies.length > 0 && (
        <>
          <span className="hidden sm:block w-px self-stretch bg-amber-700/40 mx-0.5 shrink-0" />
          <span className="hidden xl:flex flex-col justify-center pr-1 text-[8.5px] font-serif font-bold text-rose-300/90 uppercase leading-tight shrink-0">
            <span className="flex items-center gap-1">
              <ImperialEagleIcon className="w-3 h-3 text-rose-400" />
              <span>{t('Корпус', 'Corps')}</span>
            </span>
            <span className="text-stone-400">{t('Империи', 'Empire')}</span>
          </span>
          {enemies.map((c) => (
            <EnemyCard key={c.id} c={c} onPick={onPickEnemy} t={t} />
          ))}
        </>
      )}
    </div>
  );
}
