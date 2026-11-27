// Вкладка «SiegeTab» — вынесено из App.jsx; все значения состояния и обработчики приходят через props
import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { resolveMediaAsset } from '../../data/embeddedMediaAssets.js';
import {
  PowderFlaskIcon,
  SeveredConvoyIcon,
  ShashkaSabersIcon,
  UnicornCannonIcon,
  WatchtowerIcon
} from '../hud/PeriodIcons.jsx';
import { playHistoricalSound } from '../../game/audio.js';
import { TACTICAL_STANCES } from '../../game/tacticalBattleEngine.js';
import GorgeCutaway3DViewport from './GorgeCutaway3DViewport.jsx';
import ForestAmbush3DViewport from './ForestAmbush3DViewport.jsx';

export default function SiegeTab({
  active3DTerrain,
  activeTacticalEncounter,
  activeTacticalNaibate,
  ambushLog,
  ambushStep,
  autoResolveForecast,
  cam3D,
  canvas3DRef,
  convoyStruckInBattle = false,
  deployedSector: propDeployedSector,
  deploymentStance = 'high_ridge',
  enemyAssaultVector = null,
  forestStealthPct = 75,
  handleApplyTacticalBattleResult,
  handleAutoResolveTacticalBattle,
  handleCanvasPointerDown,
  handleCanvasPointerMove,
  handleCanvasPointerUp,
  handleChangeDeploymentStance,
  handleEnterTacticalDiorama,
  handleLaunch3DProjectile,
  handleReloadGazyrs,
  handleResetSplineAmbush,
  handleSplineAmbushAction,
  handleTacticalAction,
  liveImperialColumns = [],
  mortarAngle3D = 58,
  naibates,
  selectedSiegeZone,
  selectedSplineIdx,
  setActiveTab,
  setCam3D,
  setDeployedSector: propSetDeployedSector,
  setMortarAngle3D,
  setSelectedSiegeZone,
  setSelectedSplineIdx,
  setTacticalMode,
  setTacticalPaused,
  setUnicornAngle3D,
  siegeInline3D = false,
  setSiegeInline3D,
  siegeState,
  soundEnabled = true,
  splineEchelons,
  splineSegments,
  stats3D,
  t,
  tacticalBattleSession,
  tacticalMode,
  tacticalModifiers,
  tacticalPaused = false,
  turnActionQuota,
  unicornAngle3D = 15
}) {
  const [localDeployedSector, setLocalDeployedSector] = useState('blindage');
  const [forest3DMode, setForest3DMode] = useState(true);
  const deployedSector = propDeployedSector || localDeployedSector;
  const setDeployedSector = propSetDeployedSector || setLocalDeployedSector;

  const isEnemySupplyCut = Boolean(
    convoyStruckInBattle ||
      activeTacticalEncounter?.supplyCut ||
      liveImperialColumns.some((c) => c.supplyCut)
  );

  const DEFENSIVE_SECTORS = [
    {
      id: 'citadel',
      ru: 'Верхний ярус и Башня',
      en: 'Upper Citadel & Tower',
      bonusRu: '+15% меткость штуцеров',
      bonusEn: '+15% rifle accuracy'
    },
    {
      id: 'blindage',
      ru: 'Блиндажи Хаджи-Юсуфа',
      en: 'Hajji Yusuf Blindages',
      bonusRu: '-25% урон от мортир',
      bonusEn: '-25% mortar damage'
    },
    {
      id: 'water_descent',
      ru: 'Крытый спуск к р. Койсу',
      en: 'Covered Water Descent',
      bonusRu: '+10% стойкость гарнизона',
      bonusEn: '+10% garrison morale'
    },
    {
      id: 'counter_mine',
      ru: 'Контр-минная галерея',
      en: 'Counter-Mine Gallery',
      bonusRu: '+20% мощь камуфлета',
      bonusEn: '+20% camouflet blast'
    }
  ];

  const activeSectorObj =
    DEFENSIVE_SECTORS.find((s) => s.id === deployedSector) || DEFENSIVE_SECTORS[1];

  const avgSplineCohesion =
    (splineEchelons || []).reduce((s, e) => s + e.cohesion, 0) / Math.max(1, (splineEchelons || []).length);
  const isBattleVictoryReady =
    (tacticalBattleSession.pressureDropAccum || 0) >= 18 ||
    (siegeState.russianMorale ?? 78) <= 48 ||
    avgSplineCohesion <= 52;
  const battleProgressPct = Math.min(
    100,
    Math.max(
      8,
      Math.round(
        Math.max(
          ((tacticalBattleSession.pressureDropAccum || 0) / 18) * 100,
          ((82 - (siegeState.russianMorale ?? 78)) / 34) * 100,
          ((72 - avgSplineCohesion) / 20) * 100
        )
      )
    )
  );
  const maxGazyrs = tacticalBattleSession.maxGazyrCharges || 18;
  const curGazyrs = tacticalBattleSession.gazyrCharges ?? 18;
  const activeDoctrineId = tacticalBattleSession.battleDoctrine || 'lava_charge';
  const doctrineLabelRu =
    activeDoctrineId === 'safarov_mine'
      ? '🧨 Минный горн Сафарова'
      : activeDoctrineId === 'ridge_snipers'
      ? '🎯 Штуцерные заслоны'
      : '🦅 Конно-кинжальная лава';
  const doctrineLabelEn =
    activeDoctrineId === 'safarov_mine'
      ? '🧨 Safarov Powder Mine'
      : activeDoctrineId === 'ridge_snipers'
      ? '🎯 Ridge Rifle Screens'
      : '🦅 Cavalry & Kindjal Shock';

  return (
    <div className="space-y-2.5">
            {/* Единая компактная панель полевой ставки боя, 18 нагрудных газырей и переключателя режимов */}
            <div className="hud-walnut-bezel bg-gradient-to-r from-[#15120e] via-[#1a1612] to-[#121620] border border-amber-500/45 rounded-xl p-2.5 shadow-2xl space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/20 pb-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-amber-500/15 border border-amber-400/50 text-[11px] font-serif text-amber-200 font-bold">
                    <ShashkaSabersIcon className="w-3.5 h-3.5 text-amber-300" />
                    <span>{t('Ставка боя:', 'Combat HQ:')}</span>
                  </span>
                  <select
                    value={tacticalBattleSession.naibateId}
                    onChange={(e) => {
                      const found = naibates.find((n) => n.id === e.target.value);
                      if (found) handleEnterTacticalDiorama(found);
                    }}
                    className="bg-[#0e0c0a] border border-amber-500/40 rounded-lg px-2.5 py-1 text-xs font-serif font-bold text-amber-200 cursor-pointer"
                  >
                    {naibates.map((n) => (
                      <option key={n.id} value={n.id}>
                        {t(n.name, n.nameEn || n.name)} — {t(n.naibName, n.naibNameEn || n.naibName)} ({t('Порох', 'Powder')}: {n.gunpowder}{t('п', 'p')} | {t('Натиск', 'Press.')}: {n.imperialPressure}%)
                      </option>
                    ))}
                  </select>

                  <div className="flex flex-wrap items-center gap-1 text-xs">
                    <button
                      onClick={() => {
                        setTacticalMode('milyutin_siege');
                        if (setSiegeInline3D) setSiegeInline3D(false);
                      }}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold cursor-pointer transition ${
                        tacticalMode === 'milyutin_siege' && !siegeInline3D
                          ? 'bg-amber-500 text-stone-950 shadow-md'
                          : 'bg-[#171411] text-stone-300 border border-stone-800 hover:border-amber-500/40'
                      }`}
                    >
                      <WatchtowerIcon className="w-3.5 h-3.5" />
                      <span>{t('Оборона скального аула', 'Rock Aul Siege')}</span>
                    </button>
                    {setSiegeInline3D && (
                      <button
                        onClick={() => {
                          setTacticalMode('milyutin_siege');
                          setSiegeInline3D((prev) => !prev);
                        }}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold cursor-pointer transition ${
                          tacticalMode === 'milyutin_siege' && siegeInline3D
                            ? 'bg-amber-400 text-stone-950 shadow-md'
                            : 'bg-[#171411] text-amber-200 border border-amber-500/40 hover:bg-amber-500/15'
                        }`}
                      >
                        <UnicornCannonIcon className="w-3.5 h-3.5" />
                        <span>{t('3D-Разрез внутри вкладки', 'Inline 3D Cutaway')}</span>
                      </button>
                    )}
                    <button
                      onClick={() => setTacticalMode('forest_spline')}
                      className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer transition ${
                        tacticalMode === 'forest_spline'
                          ? 'bg-emerald-500 text-stone-950 shadow-md'
                          : 'bg-[#171411] text-stone-300 border border-stone-800 hover:border-emerald-500/40'
                      }`}
                    >
                      {t('🌲 Лесная засада (Ичкерия)', '🌲 Forest Ambush')}
                    </button>
                    <button
                      onClick={() => setActiveTab('3d_tactical')}
                      className="px-2.5 py-1 rounded-lg font-bold cursor-pointer transition bg-sky-500/20 hover:bg-sky-500/30 text-sky-200 border border-sky-500/40"
                    >
                      {t('🔭 3D-Ущелье и Наводка Орудий', '🔭 3D Gorge & Artillery Aiming')}
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {setTacticalPaused && (
                    <button
                      type="button"
                      onClick={() => setTacticalPaused((p) => !p)}
                      className={`px-2.5 py-1 rounded-lg border text-[11px] font-serif font-bold cursor-pointer transition ${
                        tacticalPaused
                          ? 'bg-amber-400 border-amber-200 text-stone-950 shadow-md'
                          : 'bg-[#171411] hover:bg-stone-800 border-amber-500/45 text-amber-200'
                      }`}
                      title={t('Тактическая пауза боя (Space)', 'Tactical Battle Pause (Space)')}
                    >
                      {tacticalPaused ? t('▶ В бой (Space)', '▶ Resume (Space)') : t('⏸ Пауза (Space)', '⏸ Pause (Space)')}
                    </button>
                  )}
                  <button
                    onClick={handleReloadGazyrs}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-200 text-[11px] font-bold cursor-pointer transition"
                  >
                    <PowderFlaskIcon className="w-3.5 h-3.5 text-amber-300" />
                    <span>{t('Пополнить 18 газырей (-4п)', 'Reload 18 Gazyrs (-4p)')}</span>
                  </button>
                  {handleAutoResolveTacticalBattle && autoResolveForecast && (
                    <button
                      type="button"
                      onClick={handleAutoResolveTacticalBattle}
                      title={t(
                        `Автобой: ${autoResolveForecast.verdictRu} (${autoResolveForecast.winOdds}%) • Враг -${autoResolveForecast.estimatedEnemyLoss} шт. • Трофеи +${autoResolveForecast.addedPowder}п / +${autoResolveForecast.addedSilver}₽`,
                        `Auto-Resolve: ${autoResolveForecast.verdictEn} (${autoResolveForecast.winOdds}%) • Enemy -${autoResolveForecast.estimatedEnemyLoss} bay. • Spoils +${autoResolveForecast.addedPowder}p / +${autoResolveForecast.addedSilver}r`
                      )}
                      className="px-2.5 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/35 border border-sky-400/60 text-sky-200 font-serif font-bold text-[11px] cursor-pointer transition"
                    >
                      ⚡ {t(`Автобой (${autoResolveForecast.winOdds}%)`, `Auto-Resolve (${autoResolveForecast.winOdds}%)`)}
                    </button>
                  )}
                  <button
                    onClick={() => handleApplyTacticalBattleResult()}
                    className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-[11px] uppercase tracking-wide shadow-md cursor-pointer transition"
                  >
                    {t('★ Завершить бой и доложить в Диван', '★ Finish Battle & Report to Divan')}
                  </button>
                </div>
              </div>

              {/* СПРИНТ 5: РАССТАНОВКА ВОЙСК, ВЫСОТА, СКРЫТНОСТЬ В ЛЕСУ И ПРОГНОЗ АВТОБОЯ */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 items-center bg-[#0e0c0a]/95 border border-amber-500/30 rounded-lg px-2.5 py-1.5 text-[10.5px]">
                <div className="lg:col-span-7 flex flex-wrap items-center gap-1.5">
                  <span className="text-amber-300 font-serif font-bold shrink-0">
                    {t('Расстановка:', 'Deployment:')}
                  </span>
                  {TACTICAL_STANCES.map((st) => {
                    const active = deploymentStance === st.id;
                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => handleChangeDeploymentStance && handleChangeDeploymentStance(st.id)}
                        title={t(st.descRu, st.descEn)}
                        className={`px-2 py-0.5 rounded border cursor-pointer transition font-serif font-bold ${
                          active
                            ? 'bg-amber-500/25 border-amber-400 text-amber-100 shadow'
                            : 'bg-[#161310] border-stone-800 text-stone-300 hover:border-amber-500/45'
                        }`}
                      >
                        {st.icon} {t(st.shortRu, st.shortEn)}
                      </button>
                    );
                  })}
                </div>
                <div className="lg:col-span-5 flex flex-wrap items-center lg:justify-end gap-1.5 hud-num">
                  <span className="px-2 py-0.5 rounded bg-sky-950/75 border border-sky-500/40 text-sky-200 font-bold">
                    ⛰️ {t('Высота:', 'Elev:')} +{Math.round((tacticalModifiers?.totalElevationBonus || 0.2) * 100)}%
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded border font-bold ${
                      (tacticalModifiers?.effectiveStealthPct ?? forestStealthPct) >= 60
                        ? 'bg-emerald-950/80 border-emerald-400/60 text-emerald-200'
                        : 'bg-stone-900 border-stone-700 text-stone-300'
                    }`}
                  >
                    🌿 {t('Скрытность:', 'Stealth:')} {tacticalModifiers?.effectiveStealthPct ?? forestStealthPct}%
                  </span>
                  <span className="px-2 py-0.5 rounded bg-stone-900 border border-stone-700 text-amber-200 font-bold">
                    🛡️ {t('Потери', 'Loss')} ×{(tacticalModifiers?.casualtyMultiplier ?? 0.85).toFixed(2)}
                  </span>
                  {autoResolveForecast && (
                    <span className="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-400/45 text-amber-200 font-serif font-bold">
                      {t(autoResolveForecast.verdictRu, autoResolveForecast.verdictEn)}
                    </span>
                  )}
                </div>
              </div>

              {/* Сводка стратегических условий боя, перенесённых с 3D-карты Кавказа */}
              <div className="flex flex-wrap items-center justify-between gap-2 bg-[#0e0c0a]/90 border border-stone-800 rounded-lg px-2.5 py-1.5 text-[11px]">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-amber-300 font-serif font-bold">
                    {t('Условия ТВД:', 'Theater Modifiers:')}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-stone-900 border border-stone-700 text-stone-200 hud-num">
                    🏰 {t('Фортификация:', 'FortLvl:')} {activeTacticalNaibate.fortification || 3}/5
                  </span>
                  {activeTacticalEncounter && (
                    <span className="px-2 py-0.5 rounded bg-sky-950/60 border border-sky-500/35 text-sky-200 hud-num">
                      ⛰️ {activeTacticalEncounter.elevationMeters}{t('м', 'm')} • {activeTacticalEncounter.slopeDeg}° • {t(activeTacticalEncounter.weatherBadgeRu, activeTacticalEncounter.weatherBadgeEn)}
                    </span>
                  )}
                  {isEnemySupplyCut ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-orange-950/70 border border-orange-400/60 text-orange-200 font-bold">
                      <SeveredConvoyIcon className="w-3.5 h-3.5 text-orange-300" />
                      <span>{t('Обоз РИ отрезан (-25% натиска)', 'Supply Cut (-25% Enemy Assault)')}</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-stone-900 border border-stone-800 text-stone-400">
                      {t('Снабжение РИ со стороны кордона сохранено', 'Imperial Supply Lines Intact')}
                    </span>
                  )}
                </div>
                <div className="text-emerald-300 font-semibold">
                  🛡️ {t('Резерв муртазеков:', 'Murtazek Reserve:')}{' '}
                  <strong className="text-amber-200">{t(activeSectorObj.ru, activeSectorObj.en)}</strong>{' '}
                  <span className="text-emerald-400 hud-num">({t(activeSectorObj.bonusRu, activeSectorObj.bonusEn)})</span>
                </div>
              </div>

              {/* ШКАЛА ХОДА 3D-БИТВЫ, ПАТРОНТАШ 18 ГАЗЫРЕЙ ЧЕРКЕСКИ И ТЕКУЩИЕ ТРОФЕИ */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 items-center bg-[#0c0a08] border border-amber-500/30 rounded-lg px-2.5 py-1.5 text-[10.5px]">
                <div className="lg:col-span-5 space-y-1">
                  <div className="flex items-center justify-between font-serif font-bold">
                    <span className="text-amber-300">
                      ⚔️ {t('Ход 3D-сражения (Слом колонны РИ):', '3D Battle Momentum (Break Column):')}
                    </span>
                    <span className={`hud-num font-extrabold ${isBattleVictoryReady ? 'text-emerald-300' : 'text-amber-200'}`}>
                      {isBattleVictoryReady ? t('★ ПОБЕДА ДОСТИГНУТА (100%)', '★ VICTORY ACHIEVED (100%)') : `${battleProgressPct}%`}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-rose-950/90 border border-amber-500/35 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isBattleVictoryReady
                          ? 'bg-gradient-to-r from-emerald-500 via-emerald-300 to-amber-300'
                          : 'bg-gradient-to-r from-amber-600 via-amber-400 to-emerald-400'
                      }`}
                      style={{ width: `${isBattleVictoryReady ? 100 : battleProgressPct}%` }}
                    />
                  </div>
                </div>

                <div className="lg:col-span-4 flex flex-wrap items-center gap-1.5">
                  <span className="text-stone-300 font-serif font-bold shrink-0">
                    {t('Газыри:', 'Gazyrs:')} <strong className="hud-num text-amber-300">{curGazyrs}/{maxGazyrs}</strong>
                  </span>
                  <div className="flex items-center gap-[2px]" aria-hidden="true">
                    {Array.from({ length: maxGazyrs }).map((_, gIdx) => (
                      <span
                        key={gIdx}
                        className={`inline-block w-1.5 h-3.5 rounded-[1px] ${
                          gIdx < curGazyrs
                            ? 'bg-gradient-to-b from-amber-200 via-amber-400 to-amber-700 border border-amber-300/60'
                            : 'bg-stone-800/80 border border-stone-700/60'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-3 flex flex-wrap items-center lg:justify-end gap-1.5 hud-num">
                  <span className="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-400/45 text-amber-200 font-serif font-bold">
                    {t(doctrineLabelRu, doctrineLabelEn)}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950/85 border border-emerald-500/45 text-emerald-200 font-bold">
                    +{tacticalBattleSession.capturedPowderPoods || 0}{t('п', 'p')} • +{tacticalBattleSession.capturedSilverRubles || 0}₽
                  </span>
                </div>
              </div>

              {/* ЯРКИЙ ПРИЗЫВ К ЗАВЕРШЕНИЮ 3D-БИТВЫ И ПЕРЕНОСУ ТРОФЕЕВ НА СТРАТЕГИЧЕСКУЮ КАРТУ */}
              {isBattleVictoryReady && (
                <div className="flex flex-wrap items-center justify-between gap-2 bg-gradient-to-r from-emerald-950/95 via-[#13261c] to-[#241b0e] border-2 border-emerald-400/85 rounded-xl px-3 py-2 text-xs shadow-lg">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-400 text-stone-950 font-serif font-extrabold uppercase text-[10px]">
                      🏆 {t('Победа в ущелье!', 'Gorge Victory!')}
                    </span>
                    <span className="font-serif font-bold text-emerald-100">
                      {t(
                        `Натиск неприятеля сломлен! Колонна обратится в бегство, сотня получит ★ ранг и +1💣 трофейный единорог.`,
                        `Enemy momentum shattered! The Imperial column will rout, granting your squadron +1★ rank and +1💣 captured unicorn.`
                      )}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleApplyTacticalBattleResult()}
                    className="px-3.5 py-1.5 rounded-lg bg-gradient-to-b from-amber-300 via-amber-400 to-amber-600 hover:from-amber-200 hover:to-amber-500 text-stone-950 font-serif font-extrabold text-xs cursor-pointer shadow-md"
                  >
                    🏆 {t('Принять победу и вернуться на 3D-карту →', 'Claim Victory & Return to 3D Map →')}
                  </button>
                </div>
              )}

              {/* ВОЛНА IV (Шаг 1): ЖИВАЯ ТАКТИЧЕСКАЯ ДУЭЛЬ — НАПРАВЛЕНИЕ ГЛАВНОГО УДАРА РИ И КОНТРУДАР НАИБА */}
              {enemyAssaultVector && (
                <div
                  className={`flex flex-wrap items-center justify-between gap-2 rounded-lg px-3 py-1.5 text-[11px] border transition ${
                    deployedSector === enemyAssaultVector.counterSectorId
                      ? 'bg-emerald-950/75 border-emerald-400/70 text-emerald-100'
                      : 'bg-rose-950/70 border-amber-400/70 text-amber-100'
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-rose-900/90 border border-rose-400/60 text-rose-100 font-serif font-extrabold uppercase text-[10px]">
                      🎯 {t(`Удар РИ (День ${siegeState.day}):`, `Imperial Strike (Day ${siegeState.day}):`)}{' '}
                      {t(enemyAssaultVector.titleRu, enemyAssaultVector.titleEn)}
                    </span>
                    <span className="text-stone-200">
                      {t(enemyAssaultVector.descRu, enemyAssaultVector.descEn)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {deployedSector === enemyAssaultVector.counterSectorId ? (
                      <span className="px-2.5 py-0.5 rounded bg-emerald-500/25 border border-emerald-400 text-emerald-200 font-serif font-extrabold">
                        ✓ {t('КОНТРУДАР ГОТОВ (-50% потерь, +6% натиска)', 'COUNTER-STRIKE READY (-50% loss, +6% drop)')}
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          setDeployedSector(enemyAssaultVector.counterSectorId);
                          playHistoricalSound('paper', soundEnabled);
                        }}
                        className="px-2.5 py-0.5 rounded bg-amber-400 hover:bg-amber-300 text-stone-950 font-serif font-extrabold cursor-pointer shadow"
                      >
                        ⚡ {t(`Перебросить резерв: ${enemyAssaultVector.counterLabelRu}`, `Deploy Reserve: ${enemyAssaultVector.counterLabelEn}`)}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Компактная строка патронташа 18 нагрудных газырей (UGazyrAmmunitionComponent) и сводки трофеев */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 items-center">
                <div className="lg:col-span-7 bg-[#0c0e12] border border-stone-800 rounded-lg px-2.5 py-1.5 flex items-center justify-between gap-3">
                  <div className="shrink-0">
                    <div className="hud-num text-[11px] text-amber-300 font-bold">
                      {t(
                        `ГАЗЫРИ: ${tacticalBattleSession.gazyrCharges}/${tacticalBattleSession.maxGazyrCharges || 18}`,
                        `GAZYRS: ${tacticalBattleSession.gazyrCharges}/${tacticalBattleSession.maxGazyrCharges || 18}`
                      )}
                    </div>
                    <div className={`text-[9.5px] font-mono ${tacticalBattleSession.forcedMeleeMode ? 'text-red-400 font-bold' : 'text-emerald-300'}`}>
                      {tacticalBattleSession.forcedMeleeMode
                        ? t('⚔️ В ШАШКИ!', '⚔️ SHASHKA CHARGE!')
                        : t('Залп штуцеров', 'Rifled Volley')}
                    </div>
                  </div>
                  <div
                    className="flex-1 grid gap-1"
                    style={{ gridTemplateColumns: `repeat(${tacticalBattleSession.maxGazyrCharges || 18}, minmax(0, 1fr))` }}
                  >
                    {Array.from({ length: tacticalBattleSession.maxGazyrCharges || 18 }).map((_, gIdx) => {
                      const isLoaded = gIdx < tacticalBattleSession.gazyrCharges;
                      return (
                        <div
                          key={gIdx}
                          title={t(
                            `Газырь #${gIdx + 1}: ${isLoaded ? 'Заряжен' : 'Израсходован'}`,
                            `Gazyr #${gIdx + 1}: ${isLoaded ? 'Loaded' : 'Expended'}`
                          )}
                          className={`h-5 rounded-t border flex flex-col items-center justify-between p-0.5 transition-all ${
                            isLoaded
                              ? 'bg-gradient-to-b from-amber-300 via-amber-600 to-stone-900 border-amber-400'
                              : 'bg-stone-900/60 border-stone-800 opacity-35'
                          }`}
                        >
                          <div className={`w-full h-1 rounded-sm ${isLoaded ? 'bg-stone-200' : 'bg-stone-700'}`} />
                          <span className="text-[7px] hud-num text-stone-100">{gIdx + 1}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="lg:col-span-5 grid grid-cols-4 gap-1.5 text-center hud-num text-[11px]">
                  <div className="bg-[#0c0e12] border border-stone-800 rounded-lg px-2 py-1">
                    <span className="text-[9.5px] text-stone-400 block font-sans">{t('Порох округа', 'Sector Powder')}</span>
                    <span className="font-bold text-orange-300">
                      {Math.max(
                        4,
                        activeTacticalNaibate.gunpowder -
                          tacticalBattleSession.expendedPowderPoods +
                          tacticalBattleSession.capturedPowderPoods
                      )}{' '}
                      {t('пуд.', 'p')}
                    </span>
                  </div>
                  <div className="bg-[#0c0e12] border border-stone-800 rounded-lg px-2 py-1">
                    <span className="text-[9.5px] text-stone-400 block font-sans">{t('Трофеи пороха', 'Captured Powder')}</span>
                    <span className="font-bold text-emerald-300">
                      +{tacticalBattleSession.capturedPowderPoods} {t('пуд.', 'p')}
                    </span>
                  </div>
                  <div className="bg-[#0c0e12] border border-stone-800 rounded-lg px-2 py-1">
                    <span className="text-[9.5px] text-stone-400 block font-sans">{t('Трофеи казны', 'Captured Silver')}</span>
                    <span className="font-bold text-amber-300">
                      +{tacticalBattleSession.capturedSilverRubles} {t('руб.', 'r')}
                    </span>
                  </div>
                  <div className="bg-[#0c0e12] border border-stone-800 rounded-lg px-2 py-1">
                    <span className="text-[9.5px] text-stone-400 block font-sans">{t('Спад натиска', 'Pressure Drop')}</span>
                    <span className="font-bold text-sky-300">
                      -{tacticalBattleSession.pressureDropAccum}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* РЕЖИМ А: ДВУХЭКРАННЫЙ ЧЕРТЁЖ ОСАДЫ ПО МЕТОДУ Д. А. МИЛЮТИНА ИЛИ ВСТРОЕННЫЙ 3D-РАЗРЕЗ */}
            {tacticalMode === 'milyutin_siege' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-8 hud-walnut-bezel bg-[#14110e] border border-amber-500/35 rounded-xl p-3 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-amber-400">
                        {siegeInline3D
                          ? t(
                              `Интерактивный 3D-разрез ущелья и баллистики (День ${siegeState.day}-й)`,
                              `Interactive 3D Gorge & Ballistics Cutaway (Siege Day ${siegeState.day})`
                            )
                          : t(
                              `Инженерно-топографический чертёж в изогипсах (День ${siegeState.day}-й)`,
                              `Topographic Engineering Plan in Contours (Siege Day ${siegeState.day})`
                            )}
                      </span>
                      <h3 className="text-sm sm:text-base font-bold font-serif text-stone-100">
                        {siegeState.aulName}
                      </h3>
                    </div>
                    <div className="text-xs font-mono text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded">
                      {siegeState.basinVibration}
                    </div>
                  </div>

                  {siegeInline3D && canvas3DRef && cam3D && setCam3D ? (
                    <div className="space-y-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-1.5 text-xs">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <button
                            onClick={() =>
                              setCam3D((prev) => ({
                                ...prev,
                                yaw: -0.54,
                                pitch: 0.44,
                                zoom: 1.16,
                                cutawayRatio: 0.78,
                                autoRotate: false
                              }))
                            }
                            className="px-2.5 py-1 rounded bg-[#1c1814] hover:bg-stone-800 border border-stone-700 text-stone-200 cursor-pointer"
                          >
                            {t('Перспектива 3D', '3D Perspective')}
                          </button>
                          <button
                            onClick={() =>
                              setCam3D((prev) => ({
                                ...prev,
                                yaw: 0.0,
                                pitch: 0.18,
                                zoom: 1.18,
                                cutawayRatio: 0.55,
                                autoRotate: false
                              }))
                            }
                            className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/45 text-amber-200 font-bold cursor-pointer"
                          >
                            {t('Профиль Милютина (0°)', 'Milyutin Cutaway (0°)')}
                          </button>
                          <button
                            onClick={() =>
                              setCam3D((prev) => ({
                                ...prev,
                                yaw: -1.57,
                                pitch: 0.25,
                                zoom: 1.12,
                                autoRotate: false
                              }))
                            }
                            className="px-2.5 py-1 rounded bg-[#1c1814] hover:bg-stone-800 border border-stone-700 text-stone-200 cursor-pointer"
                          >
                            {t('От батарей РИ', 'Battery View')}
                          </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5">
                          {handleLaunch3DProjectile && (
                            <>
                              <button
                                onClick={() => handleLaunch3DProjectile('mortar_3d')}
                                className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold cursor-pointer"
                              >
                                💣 {t(`Мортира ${mortarAngle3D}°`, `Mortar ${mortarAngle3D}°`)}
                              </button>
                              <button
                                onClick={() => handleLaunch3DProjectile('unicorn_3d')}
                                className="px-2.5 py-1 rounded bg-red-600 hover:bg-red-500 text-white font-bold cursor-pointer"
                              >
                                💥 {t(`Единорог ${unicornAngle3D}°`, `Unicorn ${unicornAngle3D}°`)}
                              </button>
                              <button
                                onClick={() => handleLaunch3DProjectile('camouflet_3d')}
                                className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
                              >
                                🧨 {t('Камуфлет 3D', '3D Camouflet')}
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="relative rounded-xl overflow-hidden border border-amber-500/45 bg-[#0a1220] shadow-2xl">
                        <span className="hud-brass-corner tl" />
                        <span className="hud-brass-corner tr" />
                        <span className="hud-brass-corner bl" />
                        <span className="hud-brass-corner br" />
                        <GorgeCutaway3DViewport
                          cam3D={cam3D}
                          setCam3D={setCam3D}
                          selected3DTerrainId={active3DTerrain?.id || 'salty_1847'}
                          deadZoneAngleDeg={active3DTerrain?.deadZoneAngleDeg || 28}
                          mortarAngle3D={mortarAngle3D}
                          unicornAngle3D={unicornAngle3D}
                          siegeState={siegeState}
                          soundEnabled={soundEnabled}
                          stats3D={stats3D}
                          deployedSector={deployedSector}
                          tacticalPaused={tacticalPaused}
                          onTogglePause={setTacticalPaused ? () => setTacticalPaused((p) => !p) : undefined}
                          deploymentStance={deploymentStance}
                          stealthPct={forestStealthPct}
                          t={t}
                          fallbackCanvasRef={canvas3DRef}
                          onPointerDownFallback={handleCanvasPointerDown}
                          onPointerMoveFallback={handleCanvasPointerMove}
                          onPointerUpFallback={handleCanvasPointerUp}
                        />
                        {active3DTerrain && (
                          <div className="absolute top-2.5 left-2.5 bg-[#120f0c]/88 border border-amber-500/40 rounded-lg px-2.5 py-1.5 text-[11px] pointer-events-none">
                            <div className="font-serif font-bold text-amber-200">
                              {t(active3DTerrain.title, active3DTerrain.titleEn || active3DTerrain.title)}
                            </div>
                            <div className="text-[10px] text-stone-300 hud-num">
                              {t('Сапа РИ:', 'Sap:')} {siegeState.russianMineDistance} {t('саж.', 'sazh.')} • {t('Блиндаж:', 'Blindage:')} {siegeState.blindageLayers} {t('слоя', 'layers')}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#100d0b] border border-stone-800 rounded-xl p-2.5 text-xs">
                        <div>
                          <label className="flex justify-between text-stone-300 mb-1">
                            <span>{t('Плоскость разреза:', 'Cutaway Plane:')}</span>
                            <strong className="hud-num text-amber-300">
                              {Math.round(cam3D.cutawayRatio * 100)}%
                            </strong>
                          </label>
                          <input
                            type="range"
                            min="0.25"
                            max="1.0"
                            step="0.05"
                            value={cam3D.cutawayRatio}
                            onChange={(e) =>
                              setCam3D((prev) => ({
                                ...prev,
                                cutawayRatio: Number(e.target.value)
                              }))
                            }
                            className="w-full accent-amber-500 cursor-pointer"
                          />
                        </div>
                        {setMortarAngle3D && (
                          <div>
                            <label className="flex justify-between text-stone-300 mb-1">
                              <span>{t('Мортира (навес):', 'Mortar Angle:')}</span>
                              <strong className="hud-num text-amber-300">{mortarAngle3D}°</strong>
                            </label>
                            <input
                              type="range"
                              min="42"
                              max="72"
                              step="2"
                              value={mortarAngle3D}
                              onChange={(e) => setMortarAngle3D(Number(e.target.value))}
                              className="w-full accent-amber-500 cursor-pointer"
                            />
                          </div>
                        )}
                        {setUnicornAngle3D && (
                          <div>
                            <label className="flex justify-between text-stone-300 mb-1">
                              <span>{t('Единорог (настил):', 'Unicorn Angle:')}</span>
                              <strong className="hud-num text-red-300">{unicornAngle3D}°</strong>
                            </label>
                            <input
                              type="range"
                              min="6"
                              max="34"
                              step="2"
                              value={unicornAngle3D}
                              onChange={(e) => setUnicornAngle3D(Number(e.target.value))}
                              className="w-full accent-amber-500 cursor-pointer"
                            />
                          </div>
                        )}
                      </div>
                      {stats3D?.lastShotReport && (
                        <div className="bg-[#100d0b] border border-amber-500/25 rounded-lg px-3 py-1.5 text-[11px] text-amber-100">
                          {stats3D.lastShotReport}
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                  {/* Экран 1 (Верхний): Живая аэрофото-диорама осады аула сверху */}
                  <div className="rounded-xl overflow-hidden border border-amber-500/40 bg-[#0e0d0b] shadow-2xl relative">
                    <svg viewBox="0 0 760 285" className="w-full h-auto block select-none">
                      <defs>
                        <linearGradient id="siegeTopVignette" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#05070a" stopOpacity="0.48" />
                          <stop offset="22%" stopColor="#05070a" stopOpacity="0.08" />
                          <stop offset="82%" stopColor="#05070a" stopOpacity="0.12" />
                          <stop offset="100%" stopColor="#05070a" stopOpacity="0.62" />
                        </linearGradient>
                        <radialGradient id="cannonFlashGrad" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#fef08a" stopOpacity="0.95" />
                          <stop offset="45%" stopColor="#f97316" stopOpacity="0.75" />
                          <stop offset="100%" stopColor="#dc2626" stopOpacity="0" />
                        </radialGradient>
                        <radialGradient id="smokeCloudGrad" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#f5f5f4" stopOpacity="0.55" />
                          <stop offset="60%" stopColor="#d6d3d1" stopOpacity="0.28" />
                          <stop offset="100%" stopColor="#a8a29e" stopOpacity="0" />
                        </radialGradient>
                      </defs>

                      {/* Фотореалистичная 8K аэро-диорама осады дагестанского аула */}
                      <image
                        href={resolveMediaAsset('Diorama_Siege_TopDown_Salty_1847.jpg')}
                        x="0"
                        y="0"
                        width="760"
                        height="285"
                        preserveAspectRatio="xMidYMid slice"
                      />
                      <rect x="0" y="0" width="760" height="285" fill="url(#siegeTopVignette)" />

                      {/* Живое течение реки Койсу и крытый бревенчатый ход за водой (слева в каньоне) */}
                      <path
                        d="M 185,10 Q 158,85 132,165 Q 108,225 68,280"
                        fill="none"
                        stroke="#7dd3fc"
                        strokeWidth="3"
                        strokeDasharray="6,10"
                        opacity="0.65"
                      >
                        <animate attributeName="stroke-dashoffset" from="32" to="0" dur="1.8s" repeatCount="indefinite" />
                      </path>

                      {/* Подсветка крытого бревенчатого спуска за водой по обрыву */}
                      <g>
                        <path
                          d="M 116,84 L 96,125 L 78,172"
                          fill="none"
                          stroke="#fbbf24"
                          strokeWidth="2.8"
                          strokeDasharray="5,3"
                        />
                        <circle r="3" fill="#fef08a">
                          <animateMotion path="M 116,84 L 96,125 L 78,172 L 96,125 Z" dur="5.5s" repeatCount="indefinite" />
                        </circle>
                        <rect x="12" y="10" width="295" height="20" rx="5" fill="#090d14" fillOpacity="0.82" stroke="#38bdf8" strokeOpacity="0.55" strokeWidth="1" />
                        <text x="20" y="23" fontSize="9.5" fontWeight="bold" fill="#7dd3fc">
                          {t('Река Койсу (Крытый бревенчатый спуск за водой)', 'Koisu River (Covered Timber Water Descent)')}
                        </text>
                      </g>

                      {/* Мёртвая зона настильного огня за перегибом скалы */}
                      {selectedSiegeZone === 'direct_battery' && (
                        <path
                          d="M 165,68 Q 285,132 168,205 L 330,185 L 335,88 Z"
                          fill="#ef4444"
                          fillOpacity="0.26"
                          stroke="#f87171"
                          strokeWidth="1.8"
                          strokeDasharray="4,3"
                        />
                      )}

                      {/* Фортификационный узел аула: башня, каменные сакли и бревенчатый бастион */}
                      <g>
                        {/* Развевающееся знамя Имамата над боевой башней */}
                        <line x1="335" y1="36" x2="335" y2="54" stroke="#fde68a" strokeWidth="1.6" />
                        <path d="M 335,36 Q 346,39 354,35 L 353,45 Q 345,48 335,44 Z" fill="#065f46" stroke="#34d399" strokeWidth="0.9">
                          <animate
                            attributeName="d"
                            values="M 335,36 Q 346,39 354,35 L 353,45 Q 345,48 335,44 Z;M 335,36 Q 346,33 355,38 L 354,47 Q 345,43 335,44 Z;M 335,36 Q 346,39 354,35 L 353,45 Q 345,48 335,44 Z"
                            dur="2.2s"
                            repeatCount="indefinite"
                          />
                        </path>

                        {/* Вспышки штуцеров мюридов с бастиона и саклей */}
                        {[
                          { x: 242, y: 158, d: '1.3s' },
                          { x: 295, y: 138, d: '1.9s' },
                          { x: 342, y: 108, d: '1.6s' }
                        ].map((fl, i) => (
                          <g key={i} transform={`translate(${fl.x}, ${fl.y})`}>
                            <circle r="6" fill="url(#cannonFlashGrad)">
                              <animate attributeName="opacity" values="0;1;0;0" dur={fl.d} repeatCount="indefinite" />
                              <animate attributeName="r" values="2;8;3;2" dur={fl.d} repeatCount="indefinite" />
                            </circle>
                          </g>
                        ))}

                        {/* Плашка цитадели и блиндажей */}
                        <rect x="148" y="182" width="188" height="36" rx="6" fill="#0c0e12" fillOpacity="0.86" stroke="#fbbf24" strokeWidth="1.2" />
                        <text x="242" y="197" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#fde68a">
                          {t('Ярус III (85 саж.)', 'Tier III (85 sazhens)')}
                        </text>
                        <text x="242" y="210" textAnchor="middle" fontSize="8.5" fill="#e7e5e4">
                          {t(`Мечеть и Блиндажи (${siegeState.blindageLayers} наката)`, `Mosque & Blindages (${siegeState.blindageLayers} log layers)`)}
                        </text>
                      </g>

                      {/* Линия геодезического разреза А—Б */}
                      <line
                        x1="48"
                        y1="145"
                        x2="718"
                        y2="145"
                        stroke="#fbbf24"
                        strokeWidth="1.2"
                        strokeDasharray="7,5"
                        opacity="0.85"
                      />
                      <g>
                        <rect x="48" y="126" width="64" height="16" rx="4" fill="#0c0e12" fillOpacity="0.84" stroke="#f59e0b" strokeWidth="0.8" />
                        <text x="80" y="137" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#fbbf24">
                          {t('Профиль А', 'Profile A')}
                        </text>
                        <rect x="652" y="126" width="64" height="16" rx="4" fill="#0c0e12" fillOpacity="0.84" stroke="#f59e0b" strokeWidth="0.8" />
                        <text x="684" y="137" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#fbbf24">
                          {t('Профиль Б', 'Profile B')}
                        </text>
                      </g>

                      {/* Живая трасса русских сапёрных траншей и подземной минной галереи */}
                      {(() => {
                        const sapHeadX = Math.max(305, Math.min(485, 295 + siegeState.russianMineDistance * 14));
                        const sapHeadY = 148;
                        return (
                          <g>
                            {/* Зигзаг сапы по реальным траншеям на фото */}
                            <polyline
                              points={`545,142 495,122 458,162 415,134 ${sapHeadX},${sapHeadY}`}
                              fill="none"
                              stroke="#ef4444"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <polyline
                              points={`545,142 495,122 458,162 415,134 ${sapHeadX},${sapHeadY}`}
                              fill="none"
                              stroke="#fde047"
                              strokeWidth="1.2"
                              strokeDasharray="4,6"
                            >
                              <animate attributeName="stroke-dashoffset" from="20" to="0" dur="1.1s" repeatCount="indefinite" />
                            </polyline>

                            {/* Пульсирующий подземный минный горн на острие сапы */}
                            <circle cx={sapHeadX} cy={sapHeadY} r="5" fill="#ef4444" stroke="#fef08a" strokeWidth="1.5" />
                            <circle cx={sapHeadX} cy={sapHeadY} r="6" fill="none" stroke="#f87171" strokeWidth="1.5">
                              <animate attributeName="r" values="5;19;5" dur="1.7s" repeatCount="indefinite" />
                              <animate attributeName="opacity" values="0.95;0;0.95" dur="1.7s" repeatCount="indefinite" />
                            </circle>

                            <rect x="352" y="238" width="216" height="22" rx="6" fill="#0c0e12" fillOpacity="0.88" stroke="#ef4444" strokeWidth="1" />
                            <text x="460" y="252" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#fca5a5">
                              {t(
                                `Подземная сапа (${siegeState.russianMineDistance} саж. до стены)`,
                                `Sap & Mine Gallery (${siegeState.russianMineDistance} sazh. to wall)`
                              )}
                            </text>
                          </g>
                        );
                      })()}

                      {/* Батарея №1 (Пудовые мортиры — правый верхний редут с турами) */}
                      <g
                        transform="translate(648, 76)"
                        onClick={() => setSelectedSiegeZone('mortar_battery')}
                        className="cursor-pointer"
                       
                      >
                        <circle cx="-26" cy="2" r="24" fill="url(#smokeCloudGrad)">
                          <animate attributeName="r" values="16;32;16" dur="3.4s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.75;0.25;0.75" dur="3.4s" repeatCount="indefinite" />
                        </circle>
                        <circle cx="-18" cy="0" r="9" fill="url(#cannonFlashGrad)">
                          <animate attributeName="opacity" values="0;0.95;0;0;0" dur="2.8s" repeatCount="indefinite" />
                        </circle>
                        {selectedSiegeZone === 'mortar_battery' && (
                          <rect x="-56" y="-22" width="112" height="40" rx="8" fill="none" stroke="#fbbf24" strokeWidth="2" strokeDasharray="4,2" />
                        )}
                        <rect
                          x="-50"
                          y="-16"
                          width="100"
                          height="30"
                          rx="6"
                          fill={selectedSiegeZone === 'mortar_battery' ? '#991b1b' : '#450a0a'}
                          fillOpacity="0.9"
                          stroke="#fca5a5"
                          strokeWidth="1.4"
                        />
                        <text x="0" y="-2" textAnchor="middle" fontSize="9.5" fontWeight="bold" fill="#fef2f2">
                          {t('Мортиры №1', 'Mortars #1')}
                        </text>
                        <text x="0" y="9" textAnchor="middle" fontSize="7.5" fill="#fde68a">
                          {t('Навесной огонь 58°', 'Plunging 58° Arc')}
                        </text>
                      </g>

                      {/* Батарея №2 (Настильные единороги — правый нижний редут с орудиями) */}
                      <g
                        transform="translate(622, 206)"
                        onClick={() => setSelectedSiegeZone('direct_battery')}
                        className="cursor-pointer"
                       
                      >
                        <circle cx="-30" cy="-8" r="26" fill="url(#smokeCloudGrad)">
                          <animate attributeName="r" values="18;34;18" dur="2.9s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.7;0.22;0.7" dur="2.9s" repeatCount="indefinite" />
                        </circle>
                        <circle cx="-22" cy="-6" r="10" fill="url(#cannonFlashGrad)">
                          <animate attributeName="opacity" values="0;0;0.95;0;0" dur="2.5s" repeatCount="indefinite" />
                        </circle>
                        {selectedSiegeZone === 'direct_battery' && (
                          <rect x="-60" y="-22" width="120" height="40" rx="8" fill="none" stroke="#fbbf24" strokeWidth="2" strokeDasharray="4,2" />
                        )}
                        <rect
                          x="-54"
                          y="-16"
                          width="108"
                          height="30"
                          rx="6"
                          fill={selectedSiegeZone === 'direct_battery' ? '#991b1b' : '#450a0a'}
                          fillOpacity="0.9"
                          stroke="#fca5a5"
                          strokeWidth="1.4"
                        />
                        <text x="0" y="-2" textAnchor="middle" fontSize="9.5" fontWeight="bold" fill="#fef2f2">
                          {t('Единороги №2', 'Unicorns #2')}
                        </text>
                        <text x="0" y="9" textAnchor="middle" fontSize="7.5" fill="#fca5a5">
                          {t('Настильный прицел', 'Direct Flat-Fire')}
                        </text>
                      </g>
                    </svg>
                  </div>

                  {/* Экран 2 (Нижний): Живой геодезический разрез скалы, 4-слойных блиндажей, медного таза и подземных мин */}
                  <div className="rounded-xl overflow-hidden border border-amber-500/40 bg-[#100e0c] shadow-2xl">
                    <div className="px-3.5 py-2 bg-[#1c1917] border-b border-stone-800 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                      <span className="font-bold text-amber-300">
                        {t(
                          'ВЕРТИКАЛЬНЫЙ ПРОФИЛЬ СКАЛЫ И МИННЫХ ГАЛЕРЕЙ ПО ЛИНИИ А—Б',
                          'VERTICAL CLIFF & SUBTERRANEAN MINE GALLERY PROFILE ALONG LINE A—B'
                        )}
                      </span>
                      <span className="text-stone-300 font-mono">
                        {t('Стены', 'Walls')}: <strong className="text-amber-300">{siegeState.wallIntegrity}%</strong> |{' '}
                        {t('Накаты брёвен', 'Log Layers')}:{' '}
                        <strong className="text-emerald-300">{siegeState.blindageLayers}</strong> |{' '}
                        {t('Сапа', 'Sap')}: <strong className="text-red-300">{siegeState.russianMineDistance} {t('саж.', 'sazh.')}</strong>
                      </span>
                    </div>
                    <svg viewBox="0 0 760 285" className="w-full h-auto block select-none">
                      <defs>
                        <radialGradient id="lanternWarmGlow" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#fde047" stopOpacity="0.65" />
                          <stop offset="55%" stopColor="#f59e0b" stopOpacity="0.22" />
                          <stop offset="100%" stopColor="#78350f" stopOpacity="0" />
                        </radialGradient>
                        <radialGradient id="copperBasinGrad" cx="38%" cy="35%" r="65%">
                          <stop offset="0%" stopColor="#fdba74" />
                          <stop offset="45%" stopColor="#c2410c" />
                          <stop offset="85%" stopColor="#7c2d12" />
                          <stop offset="100%" stopColor="#431407" />
                        </radialGradient>
                        <radialGradient id="basinWaterGrad" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.55" />
                          <stop offset="70%" stopColor="#0369a1" stopOpacity="0.78" />
                          <stop offset="100%" stopColor="#082f49" stopOpacity="0.95" />
                        </radialGradient>
                      </defs>

                      {/* Фотореалистичный 8K разрез скалы, 4-слойного дубового блиндажа, медного таза и сапёрных галерей */}
                      <image
                        href={resolveMediaAsset('Diorama_Siege_Cutaway_Blindage_1847.jpg')}
                        x="0"
                        y="0"
                        width="760"
                        height="285"
                        preserveAspectRatio="xMidYMid slice"
                      />

                      {/* Живое свечение фонарей внутри дубового блиндажа и подземных минных галерей */}
                      <circle cx="316" cy="134" r="48" fill="url(#lanternWarmGlow)">
                        <animate attributeName="opacity" values="0.75;1;0.82;0.96;0.75" dur="2.4s" repeatCount="indefinite" />
                      </circle>
                      <circle cx="272" cy="236" r="36" fill="url(#lanternWarmGlow)">
                        <animate attributeName="opacity" values="0.65;0.95;0.72;0.65" dur="2.1s" repeatCount="indefinite" />
                      </circle>
                      <circle cx="622" cy="236" r="42" fill="url(#lanternWarmGlow)">
                        <animate attributeName="opacity" values="0.8;0.62;0.95;0.8" dur="1.9s" repeatCount="indefinite" />
                      </circle>

                      {/* Дополнительные динамические накаты дубовых брёвен при укреплении блиндажа игроком */}
                      {Array.from({ length: Math.max(0, siegeState.blindageLayers - 3) }).map((_, extraIdx) => {
                        const rowY = 66 - extraIdx * 8;
                        return (
                          <g key={extraIdx} opacity="0.92">
                            <rect x="218" y={rowY} width="190" height="7" rx="3.5" fill="#451a03" stroke="#92400e" strokeWidth="0.9" />
                            <circle cx="222" cy={rowY + 3.5} r="3.2" fill="#b45309" stroke="#78350f" strokeWidth="0.7" />
                            <circle cx="404" cy={rowY + 3.5} r="3.2" fill="#b45309" stroke="#78350f" strokeWidth="0.7" />
                          </g>
                        );
                      })}

                      {/* Плашка блиндажа и живая рябь в медном тазу Хаджи-Юсуфа на полу каземата */}
                      <g>
                        <rect x="236" y="46" width="156" height="20" rx="5" fill="#0c0e12" fillOpacity="0.88" stroke="#fbbf24" strokeWidth="1.2" />
                        <text x="314" y="59" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#fde68a">
                          {t(`Блиндаж (${siegeState.blindageLayers} наката)`, `Blindage (${siegeState.blindageLayers} layers)`)}
                        </text>

                        {/* Анимированные круги на воде внутри медного таза в самом блиндаже */}
                        <ellipse cx="316" cy="156" rx="14" ry="4.5" fill="none" stroke="#38bdf8" strokeWidth="1.1">
                          <animate attributeName="rx" values="3;15;3" dur={siegeState.russianMineDistance <= 4 ? '0.75s' : '1.6s'} repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.95;0.1;0.95" dur={siegeState.russianMineDistance <= 4 ? '0.75s' : '1.6s'} repeatCount="indefinite" />
                        </ellipse>
                      </g>

                      {/* Крупный интерактивный медальон-индикатор: МЕДНЫЙ ТАЗ С ВОДОЙ ХАДЖИ-ЮСУФА САФАРОВА (слева вверху) */}
                      {(() => {
                        const isDanger = siegeState.russianMineDistance <= 4;
                        const rippleDur = isDanger ? '0.65s' : siegeState.russianMineDistance <= 7 ? '1.1s' : '1.8s';
                        const rippleCol = isDanger ? '#f87171' : '#38bdf8';
                        return (
                          <g transform="translate(56, 58)">
                            <circle r="38" fill="url(#copperBasinGrad)" stroke="#fbbf24" strokeWidth="2" />
                            <circle r="31" fill="url(#basinWaterGrad)" stroke="#fdba74" strokeWidth="1" />
                            {[0, 1, 2].map((rIdx) => (
                              <circle
                                key={rIdx}
                                r={6 + rIdx * 8}
                                fill="none"
                                stroke={rippleCol}
                                strokeWidth={isDanger ? '1.6' : '1.1'}
                              >
                                <animate
                                  attributeName="r"
                                  values="3;29"
                                  dur={rippleDur}
                                  begin={`${rIdx * 0.32}s`}
                                  repeatCount="indefinite"
                                />
                                <animate
                                  attributeName="opacity"
                                  values="0.95;0"
                                  dur={rippleDur}
                                  begin={`${rIdx * 0.32}s`}
                                  repeatCount="indefinite"
                                />
                              </circle>
                            ))}
                            {/* Стрелка акустического пеленга на подкоп */}
                            <line x1="0" y1="0" x2="22" y2="14" stroke="#fde047" strokeWidth="1.8" strokeDasharray="3,2" />
                            <circle r="2.8" fill="#fef08a" />
                            <rect x="-48" y="42" width="96" height="18" rx="4" fill="#090d14" fillOpacity="0.9" stroke="#f59e0b" strokeWidth="0.9" />
                            <text x="0" y="54" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#fcd34d">
                              {t('Медный таз Сафарова', 'Safarov Copper Basin')}
                            </text>
                          </g>
                        );
                      })()}

                      {/* Подземное противостояние: Контрподкоп мюридов vs Минная галерея русских сапёров */}
                      {(() => {
                        const mineHeadX = Math.max(355, Math.min(545, 335 + siegeState.russianMineDistance * 16));
                        return (
                          <g>
                            {/* Линия контрминного горна Хаджи-Юсуфа (слева, с бочками пороха) */}
                            <line x1="255" y1="242" x2="342" y2="242" stroke="#10b981" strokeWidth="4" strokeLinecap="round" />
                            <circle cx="342" cy="242" r="5" fill="#10b981" stroke="#ecfdf5" strokeWidth="1.4" />

                            {/* Продвигающаяся минная галерея сапёров (справа налево) */}
                            <line
                              x1="665"
                              y1="242"
                              x2={mineHeadX}
                              y2="242"
                              stroke="#ef4444"
                              strokeWidth="4.5"
                              strokeDasharray="7,3"
                            />

                            {/* Искры от кирок сапёров и сейсмические волны сквозь известняк к медному тазу */}
                            <circle cx={mineHeadX} cy="242" r="5.5" fill="#fef08a" stroke="#ef4444" strokeWidth="1.8">
                              <animate attributeName="r" values="3;7;3" dur="0.55s" repeatCount="indefinite" />
                            </circle>
                            {[0, 1].map((wIdx) => (
                              <circle
                                key={wIdx}
                                cx={mineHeadX}
                                cy="242"
                                r="10"
                                fill="none"
                                stroke="#f87171"
                                strokeWidth="1.4"
                                strokeDasharray="3,3"
                              >
                                <animate
                                  attributeName="r"
                                  values="6;65"
                                  dur="1.8s"
                                  begin={`${wIdx * 0.9}s`}
                                  repeatCount="indefinite"
                                />
                                <animate
                                  attributeName="opacity"
                                  values="0.85;0"
                                  dur="1.8s"
                                  begin={`${wIdx * 0.9}s`}
                                  repeatCount="indefinite"
                                />
                              </circle>
                            ))}

                            {/* Акустический вектор от кирок сапёров к медному тазу в блиндаже */}
                            <line
                              x1={mineHeadX}
                              y1="238"
                              x2="316"
                              y2="160"
                              stroke="#fbbf24"
                              strokeWidth="1.3"
                              strokeDasharray="3,5"
                              opacity="0.7"
                            >
                              <animate attributeName="stroke-dashoffset" from="16" to="0" dur="0.9s" repeatCount="indefinite" />
                            </line>

                            <rect x="348" y="256" width="235" height="22" rx="6" fill="#090d14" fillOpacity="0.9" stroke="#ef4444" strokeWidth="1.1" />
                            <text x="465" y="270" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#fca5a5">
                              {t(
                                `Подземный минный горн сапёров (${siegeState.russianMineDistance} саж.)`,
                                `Sapper Subterranean Mine Chamber (${siegeState.russianMineDistance} sazh.)`
                              )}
                            </text>
                          </g>
                        );
                      })()}

                      {/* Живая баллистика: 1) Навесная пудовая бомба мортиры (58°) с горящим фитилём */}
                      <path
                        id="mortarArcPath"
                        d="M 578,108 Q 435,-12 318,74"
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="2"
                        strokeDasharray="5,4"
                      />
                      <circle r="4.5" fill="#fef08a" stroke="#ea580c" strokeWidth="1.8">
                        <animateMotion path="M 578,108 Q 435,-12 318,74" dur="2.4s" repeatCount="indefinite" />
                      </circle>
                      <circle cx="318" cy="74" r="10" fill="url(#cannonFlashGrad)">
                        <animate attributeName="opacity" values="0;0;0;1;0" dur="2.4s" repeatCount="indefinite" />
                        <animate attributeName="r" values="4;4;4;18;6" dur="2.4s" repeatCount="indefinite" />
                      </circle>
                      <g>
                        <rect x="335" y="8" width="232" height="19" rx="5" fill="#090d14" fillOpacity="0.84" stroke="#f59e0b" strokeWidth="0.9" />
                        <text x="451" y="21" textAnchor="middle" fontSize="8.5" fontWeight="bold" fill="#fcd34d">
                          {t('Навесная траектория бомбы мортиры (58°)', 'Plunging Mortar Bomb Trajectory (58°)')}
                        </text>
                      </g>

                      {/* Живая баллистика: 2) Настильное ядро единорога (упирается в контрэскарп скалы) */}
                      <line
                        x1="678"
                        y1="118"
                        x2="452"
                        y2="128"
                        stroke="#ef4444"
                        strokeWidth="2"
                        strokeDasharray="6,3"
                      />
                      <circle r="3.5" fill="#fca5a5" stroke="#dc2626" strokeWidth="1.2">
                        <animateMotion path="M 678,118 L 452,128" dur="1.35s" repeatCount="indefinite" />
                      </circle>
                      <circle cx="452" cy="128" r="8" fill="url(#cannonFlashGrad)">
                        <animate attributeName="opacity" values="0;0;1;0" dur="1.35s" repeatCount="indefinite" />
                      </circle>
                      <g>
                        <rect x="448" y="138" width="246" height="19" rx="5" fill="#090d14" fillOpacity="0.88" stroke="#ef4444" strokeWidth="0.9" />
                        <text x="571" y="151" textAnchor="middle" fontSize="8.5" fontWeight="bold" fill="#fca5a5">
                          {t('Настильное ядро (упирается в скальный обрыв)', 'Flat-Fire Cannonball (Blocked by Cliff Face)')}
                        </text>
                      </g>
                    </svg>
                  </div>
                    </>
                  )}
                </div>

                {/* Правая панель управления обороной аула */}
                <div className="lg:col-span-4 hud-walnut-bezel bg-[#14110e] border border-amber-500/35 rounded-xl p-3.5 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/20 pb-2">
                    <h3 className="text-sm font-bold font-serif text-amber-300 uppercase">
                      {t(
                        'Приказы коменданта гарнизона',
                        'Garrison Commandant Orders'
                      )}
                    </h3>
                    {turnActionQuota && (
                      <span className="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/40 text-[10.5px] hud-num font-bold text-amber-300">
                        ⚔️ {t('Манёвры:', 'Moves:')} {turnActionQuota.tacticalMovesUsed}/{turnActionQuota.maxTacticalMovesPerTurn}
                      </span>
                    )}
                  </div>

                  {/* Интерактивное распределение резерва муртазеков по секторам аула */}
                  <div className="bg-[#0e0c0a] border border-stone-800 rounded-lg p-2 space-y-1.5">
                    <div className="text-[10px] font-serif uppercase tracking-wider text-amber-300 font-bold">
                      🛡️ {t('Дислокация резерва муртазеков (клик для переброски):', 'Deploy Murtazek Reserve Sector:')}
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {DEFENSIVE_SECTORS.map((sec) => {
                        const isDep = deployedSector === sec.id;
                        const isTargeted = enemyAssaultVector?.counterSectorId === sec.id;
                        return (
                          <button
                            key={sec.id}
                            onClick={() => {
                              setDeployedSector(sec.id);
                              playHistoricalSound('paper', soundEnabled);
                            }}
                            className={`text-left px-2 py-1.5 rounded border text-[10.5px] cursor-pointer transition ${
                              isDep
                                ? 'bg-amber-500/20 border-amber-400 text-amber-100 shadow'
                                : isTargeted
                                ? 'bg-rose-950/60 border-rose-400/75 text-rose-100'
                                : 'bg-[#171411] border-stone-800 text-stone-300 hover:border-amber-500/40'
                            }`}
                          >
                            <div className="font-bold truncate flex items-center justify-between gap-1">
                              <span className="truncate">{t(sec.ru, sec.en)}</span>
                              {isTargeted && (
                                <span className="text-[9px] text-rose-300 shrink-0">🎯</span>
                              )}
                            </div>
                            <div className="text-[9.5px] text-emerald-300 hud-num">{t(sec.bonusRu, sec.bonusEn)}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-center">
                    <div className="bg-[#0e0c0a] p-2 rounded border border-stone-800">
                      <span className="text-[10px] text-stone-400 block">{t('Дух защитников', 'Defender Morale')}</span>
                      <span className="hud-num font-bold text-emerald-300">{siegeState.garrisonMorale}%</span>
                    </div>
                    <div className="bg-[#0e0c0a] p-2 rounded border border-stone-800">
                      <span className="text-[10px] text-stone-400 block">{t('Натиск осаждающих', 'Besieger Pressure')}</span>
                      <span className="hud-num font-bold text-red-300">
                        {isEnemySupplyCut ? Math.max(15, siegeState.russianMorale - 15) : siegeState.russianMorale}%
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => handleTacticalAction('camouflet')}
                      className="w-full text-left p-2.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/50 text-xs cursor-pointer transition"
                    >
                      <div className="font-bold text-amber-300">
                        {t('1. Взорвать встречный подземный камуфлет', '1. Detonate Subterranean Camouflet Counter-Mine')}
                      </div>
                      <div className="text-[11px] text-stone-300">
                        {t(
                          'Обрушить минную галерею сапёров по сигналу медного таза с водой',
                          'Collapse the sapper mine gallery guided by the water-filled copper basin'
                        )}
                      </div>
                    </button>

                    <button
                      onClick={() => handleTacticalAction('repair_blindage')}
                      className="w-full text-left p-2.5 rounded-lg bg-[#171b22] hover:bg-stone-800 border border-stone-700 text-xs cursor-pointer transition"
                    >
                      <div className="font-bold text-emerald-300">
                        {t('2. Укрепить бревенчатые накаты блиндажей', '2. Reinforce Timber Log Blindages')}
                      </div>
                      <div className="text-[11px] text-stone-400">
                        {t(
                          'Добавить слой дубовых брёвен и земли против навесных мортирных бомб',
                          'Add a layer of oak logs and earth against plunging mortar shells'
                        )}
                      </div>
                    </button>

                    <button
                      onClick={() => handleTacticalAction('sharpshooters')}
                      className="w-full text-left p-2.5 rounded-lg bg-[#171b22] hover:bg-stone-800 border border-stone-700 text-xs cursor-pointer transition"
                    >
                      <div className="font-bold text-sky-300">
                        {t('3. Залп штуцерников по прислуге батарей', '3. Rifled Musket Volley at Battery Crews')}
                      </div>
                      <div className="text-[11px] text-stone-400">
                        {t(
                          'Прицельный огонь с верхнего яруса саклей по амбразурам русских пушек',
                          'Aimed fire from upper-tier saklyas into Imperial gun embrasures'
                        )}
                      </div>
                    </button>

                    <button
                      onClick={() => handleTacticalAction('night_sortie')}
                      className="w-full text-left p-2.5 rounded-lg bg-[#171b22] hover:bg-stone-800 border border-stone-700 text-xs cursor-pointer transition"
                    >
                      <div className="font-bold text-red-300">
                        {t('4. Ночная вылазка с кинжалами в сапу', '4. Night Dagger Sortie into Sap Trenches')}
                      </div>
                      <div className="text-[11px] text-stone-400">
                        {t(
                          'Внезапный удар мюридов по передовым траншеям и заклёпка орудий',
                          'Surprise Murid raid into forward trenches to spike enemy guns'
                        )}
                      </div>
                    </button>

                    <button
                      onClick={() => handleTacticalAction('convoy_strike')}
                      className="w-full text-left p-2.5 rounded-lg bg-orange-950/45 hover:bg-orange-900/50 border border-orange-500/50 text-xs cursor-pointer transition"
                    >
                      <div className="font-bold text-orange-300">
                        🥖 {t('5. Удар по сухарному и пороховому обозу РИ', '5. Raid Imperial Biscuit & Powder Convoy')}
                      </div>
                      <div className="text-[11px] text-stone-300">
                        {t(
                          'Сжечь тыловые фургоны, захватить порох/казну и отрезать снабжение колонны на 3D-карте',
                          'Torch rear wagons, capture powder/silver, and sever column supply on the 3D map'
                        )}
                      </div>
                    </button>
                  </div>

                  <div className="bg-[#0b0d11] border border-stone-800 rounded-lg p-3 max-h-48 overflow-y-auto space-y-2 text-xs font-mono">
                    {siegeState.battleLog.map((entry, idx) => (
                      <div key={idx} className="text-stone-300 border-b border-stone-800/70 pb-1.5">
                        {entry}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* РЕЖИМ Б: СПЛАЙНОВЫЙ КОРИДОР ЛЕСНОЙ ЗАСАДЫ В ИЧКЕРИИ (ДАРГО 1845) */}
            {tacticalMode === 'forest_spline' && (
              <div className="bg-[#13161b] border border-stone-800 rounded-xl p-4 space-y-3">
                <div className="relative rounded-xl overflow-hidden border border-emerald-500/40 bg-black shadow-xl">
                  <img
                    src={resolveMediaAsset('KeyArt_Dargo_BeechForest_Ambush_1845.jpg')}
                    alt="1845 Ichkeria Beech Forest Ambush (Dargo Expedition)"
                    className="w-full h-20 object-cover object-center opacity-85"
                    onError={(e) => {
                      e.currentTarget.parentElement.style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent flex items-center px-3.5">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-emerald-300 block">
                        {t('ИЧКЕРИЙСКИЙ БУКОВЫЙ ЛЕС • ХРЕБЕТ РЕЧЕЛЬ И ДАРГО (ИЮЛЬ 1845 Г.)', 'ICHKERIA BEECH FOREST • RECHEL RIDGE & DARGO (JULY 1845)')}
                      </span>
                      <div className="text-xs sm:text-sm font-serif font-bold text-stone-100">
                        {t(
                          'Лесные засеки и перекрёстный огонь штуцеров по растянутой колонне «Сухарной экспедиции»',
                          'Felled Beech Abatis & Rifled Crossfire Against the Overextended “Biscuit Expedition” Column'
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-800 pb-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-emerald-400">
                      {forest3DMode
                        ? t(
                            `Интерактивный 3D-Лес Ичкерии • WebGL2 PBR (Шаг боя #${ambushStep})`,
                            `Interactive 3D Ichkeria Beech Forest • WebGL2 PBR (Combat Step #${ambushStep})`
                          )
                        : t(
                            `Сплайновый коридор в буковом лесу Ичкерии (Шаг боя #${ambushStep})`,
                            `Spline Defile in Ichkeria Beech Forest (Combat Step #${ambushStep})`
                          )}
                    </span>
                    <h3 className="text-base font-bold font-serif text-stone-100">
                      {t(
                        'Разгром «Сухарной экспедиции» на хребте Речель (10–11 июля 1845 г.)',
                        'Ambush of the “Biscuit Expedition” on the Rechel Ridge (July 10–11, 1845)'
                      )}
                    </h3>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setForest3DMode((v) => !v)}
                      className={`px-3 py-1.5 rounded text-xs font-bold cursor-pointer transition ${
                        forest3DMode
                          ? 'bg-emerald-500 text-stone-950 shadow'
                          : 'bg-[#171b22] text-emerald-200 border border-emerald-500/40 hover:bg-emerald-500/15'
                      }`}
                    >
                      {forest3DMode
                        ? t('🌲 3D-Лес (Активен) → 📐 2D-Схема', '🌲 3D Forest (Active) → 📐 2D Plan')
                        : t('🌲 Включить 3D-Лес WebGL', '🌲 Switch to 3D Forest WebGL')}
                    </button>
                    <button
                      onClick={handleResetSplineAmbush}
                      className="px-3 py-1.5 rounded bg-stone-800 hover:bg-stone-700 text-xs font-mono text-stone-300 flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>{t('Сбросить сценарий', 'Reset Scenario')}</span>
                    </button>
                  </div>
                </div>

                <div className="rounded-xl overflow-hidden border border-emerald-500/40 bg-[#0b120d] shadow-2xl relative">
                  {forest3DMode ? (
                    <ForestAmbush3DViewport
                      splineSegments={splineSegments}
                      splineEchelons={splineEchelons}
                      selectedSplineIdx={selectedSplineIdx}
                      setSelectedSplineIdx={setSelectedSplineIdx}
                      soundEnabled={soundEnabled}
                      stats3D={stats3D}
                      tacticalPaused={tacticalPaused}
                      onTogglePause={setTacticalPaused ? () => setTacticalPaused((p) => !p) : undefined}
                      deploymentStance={deploymentStance}
                      stealthPct={forestStealthPct}
                      t={t}
                    />
                  ) : (
                  <svg viewBox="0 0 800 285" className="w-full h-auto block select-none">
                    <defs>
                      <linearGradient id="forestVignette" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#040806" stopOpacity="0.48" />
                        <stop offset="25%" stopColor="#040806" stopOpacity="0.06" />
                        <stop offset="80%" stopColor="#040806" stopOpacity="0.1" />
                        <stop offset="100%" stopColor="#040806" stopOpacity="0.65" />
                      </linearGradient>
                      <radialGradient id="musketFlashGrad" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#fef08a" stopOpacity="0.95" />
                        <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.7" />
                        <stop offset="100%" stopColor="#dc2626" stopOpacity="0" />
                      </radialGradient>
                    </defs>

                    {/* Фотореалистичная 8K диорама лесной засады в буковом лесу Ичкерии (хребет Речель, 1845) */}
                    <image
                      href={resolveMediaAsset('Diorama_Ichkeria_Forest_Ambush_1845.jpg')}
                      x="0"
                      y="0"
                      width="800"
                      height="285"
                      preserveAspectRatio="xMidYMid slice"
                    />
                    <rect x="0" y="0" width="800" height="285" fill="url(#forestVignette)" />

                    {/* Стрелки перекрёстного штуцерного огня мюридов с лесного гребня по выбранному участку */}
                    {(() => {
                      const targetSeg = splineSegments[selectedSplineIdx] || splineSegments[0];
                      if (!targetSeg) return null;
                      const tx = targetSeg.coords.x;
                      const ty = targetSeg.coords.y + 16;
                      return (
                        <g>
                          {[
                            { sx: 515, sy: 62, dur: '1.1s' },
                            { sx: 615, sy: 84, dur: '1.4s' },
                            { sx: 690, sy: 108, dur: '1.25s' }
                          ].map((r, rIdx) => (
                            <g key={rIdx}>
                              <line
                                x1={r.sx}
                                y1={r.sy}
                                x2={tx}
                                y2={ty}
                                stroke="#fbbf24"
                                strokeWidth="1.3"
                                strokeDasharray="4,6"
                                opacity="0.72"
                              >
                                <animate attributeName="stroke-dashoffset" from="20" to="0" dur={r.dur} repeatCount="indefinite" />
                              </line>
                              <circle cx={r.sx} cy={r.sy} r="7" fill="url(#musketFlashGrad)">
                                <animate attributeName="opacity" values="0;1;0;0" dur={r.dur} repeatCount="indefinite" />
                              </circle>
                            </g>
                          ))}
                        </g>
                      );
                    })()}

                    {/* Сплайн лесной дороги от хребта Речель к Дарго */}
                    <path
                      d="M 75,94 Q 140,181 205,174 T 345,138 T 475,208 T 605,161 T 735,201"
                      fill="none"
                      stroke="#fde68a"
                      strokeWidth="2.2"
                      strokeDasharray="6,5"
                      opacity="0.65"
                    />

                    {splineSegments.map((seg, idx) => {
                      const isSel = idx === selectedSplineIdx;
                      const echelonHere = splineEchelons.find((e) => e.segmentIdx === idx);
                      const sy = seg.coords.y + 16;
                      return (
                        <g
                          key={seg.id}
                          transform={`translate(${seg.coords.x}, ${sy})`}
                          onClick={() => setSelectedSplineIdx(idx)}
                          className="cursor-pointer"
                         
                        >
                          {isSel && (
                            <circle r="31" fill="none" stroke="#34d399" strokeWidth="2.5" strokeDasharray="5,3">
                              <animate attributeName="r" values="28;33;28" dur="1.6s" repeatCount="indefinite" />
                            </circle>
                          )}

                          {/* Поваленные вековые буки (засеки) поперёк лесной дороги пропорционально числу завалов */}
                          {Array.from({ length: Math.min(4, seg.barricades) }).map((_, bIdx) => {
                            const angle = -24 + bIdx * 16;
                            const offsetY = -10 + bIdx * 6;
                            return (
                              <g key={bIdx} transform={`translate(0, ${offsetY}) rotate(${angle})`}>
                                <rect x="-24" y="-2.5" width="48" height="5" rx="2.2" fill="#451a03" stroke="#92400e" strokeWidth="0.9" />
                                <circle cx="-18" cy="-4" r="4.5" fill="#14532d" stroke="#22c55e" strokeWidth="0.6" />
                                <circle cx="15" cy="3.5" r="5" fill="#166534" stroke="#4ade80" strokeWidth="0.6" />
                              </g>
                            );
                          })}

                          {/* Миниатюра крытой сухарной повозки и штыков колонны, если эшелон находится на участке */}
                          {echelonHere && (
                            <g transform="translate(0, -4)">
                              {/* Пороховой дым вокруг заблокированного эшелона */}
                              <circle cx="0" cy="-6" r="22" fill="#f5f5f4" fillOpacity="0.22" />
                              {/* Сухарная повозка обоза Воронцова */}
                              <rect x="-14" y="-8" width="28" height="12" rx="2" fill="#57534e" stroke="#e7e5e4" strokeWidth="1" />
                              <path d="M -12,-8 Q 0,-18 12,-8 Z" fill="#d6d3d1" stroke="#78716c" strokeWidth="0.9" />
                              <circle cx="-9" cy="5" r="4" fill="#292524" stroke="#fbbf24" strokeWidth="1.1" />
                              <circle cx="9" cy="5" r="4" fill="#292524" stroke="#fbbf24" strokeWidth="1.1" />
                              {/* Штыки пехоты прикрытия */}
                              <line x1="-18" y1="2" x2="-15" y2="-14" stroke="#e2e8f0" strokeWidth="1.3" />
                              <line x1="16" y1="2" x2="19" y2="-14" stroke="#e2e8f0" strokeWidth="1.3" />
                            </g>
                          )}

                          {/* Центральный тактический медальон участка (капсула, чтобы «Завал: 2» помещался без выхода за края) */}
                          <rect
                            x="-27"
                            y="-11"
                            width="54"
                            height="22"
                            rx="11"
                            fill={echelonHere ? '#7f1d1d' : '#090d14'}
                            fillOpacity="0.92"
                            stroke={isSel ? '#34d399' : '#fbbf24'}
                            strokeWidth="2"
                          />
                          <text x="0" y="3.2" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#fff">
                            {t('Завал', 'Abatis')}: {seg.barricades}
                          </text>

                          {/* Верхний бейдж номера участка и высоты */}
                          <rect x="-48" y="-39" width="96" height="16" rx="4" fill="#090d14" fillOpacity="0.88" stroke={isSel ? '#34d399' : '#78716c'} strokeWidth="0.9" />
                          <text x="0" y="-28" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#f5f5f4">
                            {t('Уч.', 'Sec.')} #{idx + 1} ({seg.elevation})
                          </text>

                          {/* Нижний бейдж численности и сплочённости (Cohesion) эшелона */}
                          {echelonHere && (
                            <g transform="translate(0, 23)">
                              <rect x="-62" y="0" width="124" height="22" rx="5" fill="#450a0a" fillOpacity="0.92" stroke="#f87171" strokeWidth="1.1" />
                              <text x="0" y="13" textAnchor="middle" fontSize="8.5" fontWeight="bold" fill="#fef2f2">
                                {echelonHere.strength} {t('шт.', 'bay.')} ({t('Строй', 'Coh.')}: {echelonHere.cohesion}%)
                              </text>
                              {/* Полоска сплочённости строя */}
                              <rect x="-52" y="16.5" width="104" height="2.5" rx="1" fill="#1c1917" />
                              <rect
                                x="-52"
                                y="16.5"
                                width={Math.max(6, Math.round((echelonHere.cohesion / 100) * 104))}
                                height="2.5"
                                rx="1"
                                fill={echelonHere.cohesion > 55 ? '#34d399' : '#fbbf24'}
                              />
                            </g>
                          )}
                        </g>
                      );
                    })}
                  </svg>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  <button
                    onClick={() => handleSplineAmbushAction('fell_beeches')}
                    className="p-3 rounded-xl bg-[#171b22] hover:bg-emerald-500/15 border border-stone-800 hover:border-emerald-500/50 text-left text-xs cursor-pointer transition"
                  >
                    <div className="font-bold text-emerald-300">
                      {t('1. Рубить буковый завал поперёк тропы', '1. Fell Beech Abatis Across Trail')}
                    </div>
                    <div className="text-[11px] text-stone-400 mt-1">
                      {t(
                        `Разорвать колонну и усилить скрытность на участке #${selectedSplineIdx + 1}`,
                        `Sever the column and boost stealth at Sector #${selectedSplineIdx + 1}`
                      )}
                    </div>
                  </button>

                  <button
                    onClick={() => handleSplineAmbushAction('crossfire')}
                    className="p-3 rounded-xl bg-[#171b22] hover:bg-amber-500/15 border border-stone-800 hover:border-amber-500/50 text-left text-xs cursor-pointer transition"
                  >
                    <div className="font-bold text-amber-300">
                      {t('2. Перекрёстный залп штуцеров (-3 газ.)', '2. Crossfire Rifled Volley (-3 gaz.)')}
                    </div>
                    <div className="text-[11px] text-stone-400 mt-1">
                      {t(
                        'Огонь с высоты и из чащи (бонус внезапности при скрытности ≥60%)',
                        'Fire from height & canopy (ambush shock bonus at stealth ≥60%)'
                      )}
                    </div>
                  </button>

                  <button
                    onClick={() => handleSplineAmbushAction('dagger_charge')}
                    className="p-3 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/40 text-left text-xs cursor-pointer transition"
                  >
                    <div className="font-bold text-red-300">
                      {t('3. Кинжальная атака во фланг колонны', '3. Flank Dagger Charge into Column')}
                    </div>
                    <div className="text-[11px] text-stone-300 mt-1">
                      {t(
                        'Сломить строй и захватить орудия (бонус +25% при пустых газырях)',
                        'Break formation and seize guns (+25% bonus when gazyrs depleted)'
                      )}
                    </div>
                  </button>

                  <button
                    onClick={() => handleSplineAmbushAction('convoy_strike')}
                    className="p-3 rounded-xl bg-orange-950/50 hover:bg-orange-900/55 border border-orange-500/55 text-left text-xs cursor-pointer transition"
                  >
                    <div className="font-bold text-orange-300">
                      🥖 {t('4. Удар по сухарному и пороховому обозу', '4. Strike Biscuit & Powder Convoy')}
                    </div>
                    <div className="text-[11px] text-stone-200 mt-1">
                      {t(
                        'Разгромить фургоны у завала: макс. трофеи пороха/казны и отрез снабжения на 3D-карте',
                        'Smash wagons at the abatis: max powder/silver spoils & sever supply on the 3D map'
                      )}
                    </div>
                  </button>
                </div>

                <div className="bg-[#0b0d11] border border-stone-800 rounded-lg p-3 max-h-44 overflow-y-auto space-y-2 text-xs font-mono">
                  {ambushLog.map((entry, idx) => (
                    <div key={idx} className="text-stone-300 border-b border-stone-800/70 pb-1.5">
                      {entry}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
  );
}
