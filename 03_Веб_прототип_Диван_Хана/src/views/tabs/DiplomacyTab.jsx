// Вкладка «DiplomacyTab» — Блистательная Порта, Политика наибов (Верность/Амбиции/Слава)
// и Наградная палата всех 25 подлинных кубачинских орденов Шамиля (Спринт 7 — Фаза 3 / Gate 3)
import { useMemo, useState } from 'react';
import { OTTOMAN_OPTIONS } from '../../data/campaignData.js';
import { resolveMediaAsset } from '../../data/embeddedMediaAssets.js';
import {
  FELT_SHAME_BADGE,
  HISTORICAL_DILEMMAS_32,
  KUBACHI_25_ORDERS_CATALOG,
  ORDER_TIER_META,
  computeNaibPoliticalProfile
} from '../../game/naibPoliticsEngine.js';
import { Award, Clock, Compass, Crown, Maximize2, ScrollText, ShieldAlert, X } from 'lucide-react';
import { PortraitMedallion, TabHeroBanner, findPortrait } from '../hud/GameHUD.jsx';
import { CompassRoseIcon, PowderFlaskIcon, WaxSealIcon } from '../hud/PeriodIcons.jsx';
import {
  ShamilOrderMedallion,
  ShamilOrdersMuseumShowcase,
  inferOrderIdFromName
} from '../shared/ShamilOrdersSvg.jsx';

export default function DiplomacyTab({
  delayedConsequences = [],
  handleAwardOrder,
  handleOttomanDiplomacy,
  handleSummonDivanPacket,
  naibRivalries = [],
  naibates = [],
  resolvedPacketIds = [],
  resources,
  selectedNaibate,
  setActiveTab,
  setSelectedNaibateId,
  t,
  turn = 1
}) {
  const [showOrdersLightbox, setShowOrdersLightbox] = useState(false);
  const [selectedOrderTier, setSelectedOrderTier] = useState('all');
  const naibPortrait = findPortrait(selectedNaibate?.naibName, selectedNaibate?.id);

  const politicalProfile = useMemo(
    () => computeNaibPoliticalProfile(selectedNaibate, naibRivalries),
    [selectedNaibate, naibRivalries]
  );

  const visibleOrders = useMemo(() => {
    if (selectedOrderTier === 'felt') return [FELT_SHAME_BADGE];
    if (selectedOrderTier === 'all') return KUBACHI_25_ORDERS_CATALOG;
    return KUBACHI_25_ORDERS_CATALOG.filter((o) => o.tier === Number(selectedOrderTier));
  }, [selectedOrderTier]);

  const awardedIdSet = useMemo(() => {
    const s = new Set(selectedNaibate?.ordersAwardedIds || []);
    (selectedNaibate?.ordersAwarded || []).forEach((n) => s.add(inferOrderIdFromName(n)));
    return s;
  }, [selectedNaibate]);

  const stanceToneClass =
    politicalProfile.stanceTone === 'emerald'
      ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-200'
      : politicalProfile.stanceTone === 'sky'
        ? 'bg-sky-500/20 border-sky-400/50 text-sky-200'
        : politicalProfile.stanceTone === 'rose'
          ? 'bg-rose-500/25 border-rose-400/60 text-rose-200'
          : 'bg-amber-500/20 border-amber-400/55 text-amber-200';

  return (
    <div className="space-y-5">
      <TabHeroBanner
        artSrc="Diplomacy_Trabzon_Felucca_Smuggling_1846.jpg"
        portraitKey={selectedNaibate?.naibName || 'Шамиль'}
        portraitName={t(selectedNaibate.naibName, selectedNaibate.naibNameEn || selectedNaibate.naibName)}
        portraitTitle={t(selectedNaibate.naibTitle, selectedNaibate.naibTitleEn || selectedNaibate.naibTitle)}
        portraitColor="#f59e0b"
        tag={t(
          'ДИПЛОМАТИЯ • ПОЛИТИКА НАИБОВ И 25 КУБАЧИНСКИХ ОРДЕНОВ ШАМИЛЯ',
          'DIPLOMACY • NAIB POLITICS & 25 KUBACHI ORDERS OF SHAMIL'
        )}
        title={t(
          'Тайные миссии к Блистательной Порте, Политика наибов и 25 орденов Шамиля',
          'Sublime Porte Missions, Naib Politics & All 25 Silver-Niello Orders of Shamil'
        )}
        desc={t(
          'Балансируйте [[naib|Верность, Амбиции и Славу]] десяти наибов, жалуйте любой из 25 подлинных кубачинских орденов (или войлочный знак позора) и ведите тайную переписку с [[porte|Блистательной Портой]].',
          'Balance [[naib|Loyalty, Ambition & Glory]] across ten Naibs, bestow any of the 25 authentic Kubachi orders (or the disciplinary Felt Badge), and run covert missions to the [[porte|Sublime Porte]].'
        )}
        rightSlot={
          <div className="flex flex-wrap items-center gap-2 hud-num text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-300 font-bold">
              <CompassRoseIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('Порта:', 'Porte:')} {resources.ottomanSupport}%</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900/90 border border-amber-500/30 text-amber-200 font-bold">
              <WaxSealIcon className="w-3.5 h-3.5 text-amber-300" />
              <span>{resources.silver} {t('руб.', 'rub.')}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 font-bold">
              <Award className="w-3.5 h-3.5 text-emerald-300" />
              <span>{t('25 орденов', '25 Orders')}</span>
            </span>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Левая панель: Блистательная Порта + Очередь отложенных последствий 32 дилемм */}
        <div className="relative lg:col-span-5 hud-panel hud-walnut-bezel rounded-xl p-5 shadow-2xl space-y-4">
          <span className="hud-brass-corner tl" />
          <span className="hud-brass-corner tr" />
          <span className="hud-brass-corner bl" />
          <span className="hud-brass-corner br" />
          <div className="border-b border-amber-500/25 pb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold font-serif text-amber-300 uppercase flex items-center gap-2">
                <Compass className="w-5 h-5 text-amber-400 shrink-0" />
                <span>
                  {t(
                    'Тайная дипломатия с Блистательной Портой',
                    'Secret Diplomacy with the Sublime Porte'
                  )}
                </span>
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                {t(
                  'Переписка с султаном Абдул-Меджидом I и доставка пороха через Трабзон',
                  'Correspondence with Sultan Abdülmecid I & powder smuggling via Trabzon'
                )}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <PortraitMedallion src={findPortrait('Мухаммад-Амин')} name="Наиб Мухаммад-Амин" color="#f59e0b" size={34} />
              <PortraitMedallion src={findPortrait('Хаджи-Юсуф')} name="Инженер Хаджи-Юсуф" color="#10b981" size={34} />
            </div>
          </div>

          {/* Живая сцена ночной выгрузки пороха с турецких фелюг */}
          <div className="relative rounded-xl overflow-hidden border border-amber-500/40 bg-black shadow-lg h-32 sm:h-36">
            <img
              src={resolveMediaAsset('Diplomacy_Trabzon_Felucca_Smuggling_1846.jpg')}
              alt="Night Felucca Gunpowder Smuggling from Trabzon (1846)"
              className="w-full h-full object-cover object-center opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex items-end p-3">
              <span className="text-[11px] font-mono text-amber-200 leading-snug">
                ⛵ {t(
                  'Ночная выгрузка английского пороха и свинца с трабзонских фелюг (1846 г.)',
                  'Night unloading of English powder & lead from Trabzon feluccas (1846)'
                )}
              </span>
            </div>
          </div>

          {/* Шкала влияния в Стамбуле */}
          <div className="bg-[#0e1116]/90 border border-amber-500/25 rounded-xl p-3 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-stone-300">{t('Благосклонность двора султана', 'Favour of the Sultan’s Court')}</span>
              <span className="text-amber-300 font-bold">{resources.ottomanSupport}%</span>
            </div>
            <div className="h-2 rounded-full bg-stone-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-600 via-amber-400 to-emerald-400 transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, resources.ottomanSupport))}%` }}
              />
            </div>
          </div>

          <div className="space-y-2.5">
            {OTTOMAN_OPTIONS.map((opt) => {
              const envoyKey =
                opt.id === 'cairo_engineers'
                  ? 'Хаджи-Юсуф'
                  : opt.id === 'trabzon_smugglers'
                    ? 'Мухаммад-Амин'
                    : 'Шамиль';
              return (
                <div
                  key={opt.id}
                  className="bg-gradient-to-b from-[#1e1812] to-[#130f0b] border border-amber-700/40 hover:border-amber-400/70 rounded-xl p-3.5 space-y-2 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <PortraitMedallion src={findPortrait(envoyKey)} name={opt.title} color="#f59e0b" size={34} />
                      <h3 className="text-xs sm:text-sm font-bold text-amber-100 font-serif leading-snug">
                        {t(opt.title, opt.titleEn || opt.title)}
                      </h3>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/35 text-amber-300 font-mono text-[10px] shrink-0">
                      -{opt.costSilver} {t('руб.', 'rub.')}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-300 leading-relaxed">
                    {t(opt.desc, opt.descEn || opt.desc)}
                  </p>
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-amber-500/20 text-[11px] hud-num">
                    <span className="inline-flex items-center gap-1.5 text-emerald-300 font-bold">
                      <PowderFlaskIcon className="w-3.5 h-3.5 text-emerald-400" />
                      <span>
                        {t(
                          `+${opt.rewardPowder} пуд. пороха, +${opt.rewardSilver} руб.`,
                          `+${opt.rewardPowder} poods powder, +${opt.rewardSilver} rub.`
                        )}
                      </span>
                    </span>
                    <button
                      onClick={() => handleOttomanDiplomacy(opt)}
                      className="px-3 py-1 rounded-lg bg-gradient-to-b from-amber-400 to-amber-600 hover:brightness-110 text-stone-950 font-serif font-bold cursor-pointer transition shadow"
                    >
                      {t(`Миссия (${opt.costSilver}₽)`, `Dispatch (${opt.costSilver}r)`)}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* СПРИНТ 7: Канцелярия 32 исторических дилемм и очередь отголосков (2–4 хода) */}
          <div className="bg-[#0e1116]/95 border border-amber-500/35 rounded-xl p-3.5 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/20 pb-2">
              <div className="flex items-center gap-2 text-xs font-serif font-bold text-amber-300">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  {t(
                    'Отголоски 32 дилемм Диван-ханы (2–4 хода)',
                    'Delayed Consequences of 32 Dilemmas (2–4 Turns)'
                  )}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/35 text-[10px] font-mono text-amber-200">
                {resolvedPacketIds.length} / {HISTORICAL_DILEMMAS_32.length}
              </span>
            </div>
            {delayedConsequences.length === 0 ? (
              <p className="text-[11px] text-stone-400 leading-relaxed">
                {t(
                  'Каждый выбор в сургучном пакете Диван-ханы запускает историческое последствие через 2–4 сезона (прибытие караванов, взрыв контрмин, обида или верность наибов).',
                  'Every ruling in a Divan-Khana wax-sealed packet triggers a historical echo 2–4 turns later (caravans, counter-mines, Naib grudges or devotion).'
                )}
              </p>
            ) : (
              <div className="space-y-1.5">
                {delayedConsequences.map((dc) => (
                  <div
                    key={dc.id}
                    className="rounded-lg bg-amber-950/35 border border-amber-500/30 px-2.5 py-2 text-[11px] space-y-0.5"
                  >
                    <div className="flex items-center justify-between gap-2 font-mono text-[10px] text-amber-300 font-bold">
                      <span>⏳ {t(`Сработает на ходе #${dc.dueTurn}`, `Fires on Turn #${dc.dueTurn}`)}</span>
                      <span>
                        {t(
                          `через ${Math.max(1, dc.dueTurn - turn)} ход.`,
                          `in ${Math.max(1, dc.dueTurn - turn)} turn(s)`
                        )}
                      </span>
                    </div>
                    <div className="font-serif font-bold text-stone-100 leading-snug">
                      {t(dc.effect?.titleRu || dc.sourceTitleRu, dc.effect?.titleEn || dc.sourceTitleEn)}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {handleSummonDivanPacket && (
              <button
                type="button"
                onClick={() => {
                  handleSummonDivanPacket();
                  if (setActiveTab) setActiveTab('map');
                }}
                className="w-full py-2 px-3 rounded-lg bg-amber-500/15 hover:bg-amber-500/30 border border-amber-400/55 text-amber-200 font-serif font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition"
              >
                <ScrollText className="w-3.5 h-3.5" />
                <span>{t('Открыть свежую дилемму Диван-ханы на карте', 'Summon Next Historical Dilemma on Map')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Правая панель: Политика наибов (Верность / Амбиции / Слава) + Все 25 кубачинских орденов */}
        <div className="relative lg:col-span-7 hud-panel hud-walnut-bezel rounded-xl p-5 shadow-2xl space-y-4">
          <span className="hud-brass-corner tl" />
          <span className="hud-brass-corner tr" />
          <span className="hud-brass-corner bl" />
          <span className="hud-brass-corner br" />
          <div className="border-b border-amber-500/25 pb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold font-serif text-amber-300 uppercase flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400 shrink-0" />
                <span>
                  {t(
                    'Политика наибов и 25 кубачинских орденов Шамиля',
                    'Naib Politics & 25 Kubachi Orders of Shamil'
                  )}
                </span>
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                {t(
                  'Каждый из 25 знаков наградной системы напрямую влияет на Верность, Амбиции, Славу и боеспособность округа',
                  'All 25 authentic medals directly shape Naib Loyalty, Ambition, Glory, garrison & front pressure'
                )}
              </p>
            </div>
            {naibates.length > 0 && setSelectedNaibateId && (
              <select
                aria-label={t('Выбрать наиба-получателя', 'Select recipient Naib')}
                value={selectedNaibate.id}
                onChange={(e) => setSelectedNaibateId(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-[#0e1116] border border-amber-500/50 text-amber-200 font-serif text-xs font-bold cursor-pointer focus:outline-none focus:border-amber-400"
              >
                {naibates.map((n) => {
                  const prof = computeNaibPoliticalProfile(n, naibRivalries);
                  return (
                    <option key={n.id} value={n.id}>
                      {t(n.naibName, n.naibNameEn || n.naibName)} ({t(n.name, n.nameEn || n.name)}) — {t('Верн.', 'Loy.')} {prof.loyalty}%
                    </option>
                  );
                })}
              </select>
            )}
          </div>

          {/* Панель политики выбранного наиба: Верность / Амбиции / Слава */}
          <div className="bg-[#0e1116]/95 border border-amber-500/35 rounded-xl p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <PortraitMedallion src={naibPortrait} name={selectedNaibate.naibName} color="#f59e0b" size={50} selected />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-mono uppercase text-amber-400">
                      {t(selectedNaibate.name, selectedNaibate.nameEn || selectedNaibate.name)}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full border text-[10px] font-mono font-bold ${stanceToneClass}`}>
                      <Crown className="w-3 h-3 inline mr-1 -mt-0.5" />
                      {t(politicalProfile.stanceRu, politicalProfile.stanceEn)}
                    </span>
                  </div>
                  <div className="text-sm font-serif font-bold text-stone-100 truncate mt-0.5">
                    {t(selectedNaibate.naibName, selectedNaibate.naibNameEn || selectedNaibate.naibName)}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-[10px] font-mono">
                    <span className="text-emerald-300">
                      {t('Исполнение приказов:', 'Order Obed.:')}{' '}
                      <b>{politicalProfile.orderExecutionMod >= 0 ? `+${politicalProfile.orderExecutionMod}%` : `${politicalProfile.orderExecutionMod}%`}</b>
                    </span>
                    <span className="text-sky-300">
                      {t('Боевой бонус Славы:', 'Glory Combat:')}{' '}
                      <b>+{politicalProfile.combatBonusPct}%</b>
                    </span>
                    <span className={politicalProfile.schismRisk >= 35 ? 'text-rose-300 font-bold' : 'text-stone-400'}>
                      {t('Риск откола:', 'Schism Risk:')}{' '}
                      <b>{politicalProfile.schismRisk}%</b>
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right font-mono text-[10px] text-stone-400 space-y-0.5">
                <div>{t('Иман', 'Iman')}: <b className="text-emerald-300">{selectedNaibate.traits?.iman ?? 75}</b> • {t('Гордыня', 'Pride')}: <b className="text-rose-300">{selectedNaibate.traits?.pride ?? 45}</b></div>
                <div>{t('Гарнизон', 'Garrison')}: <b className="text-amber-200">{selectedNaibate.garrison}</b> • {t('Порох', 'Powder')}: <b className="text-amber-300">{selectedNaibate.gunpowder}</b></div>
              </div>
            </div>

            {/* Три политические шкалы: Верность / Амбиции / Слава */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              {[
                {
                  key: 'loyalty',
                  labelRu: 'Верность',
                  labelEn: 'Loyalty',
                  val: politicalProfile.loyalty,
                  barClass: 'from-emerald-600 to-emerald-400',
                  txtClass: 'text-emerald-300'
                },
                {
                  key: 'ambition',
                  labelRu: 'Амбиции',
                  labelEn: 'Ambition',
                  val: politicalProfile.ambition,
                  barClass: politicalProfile.ambition >= 70 ? 'from-rose-600 to-amber-500' : 'from-amber-600 to-amber-400',
                  txtClass: politicalProfile.ambition >= 70 ? 'text-rose-300' : 'text-amber-300'
                },
                {
                  key: 'glory',
                  labelRu: 'Слава',
                  labelEn: 'Glory',
                  val: politicalProfile.glory,
                  barClass: 'from-sky-600 to-cyan-300',
                  txtClass: 'text-sky-300'
                }
              ].map((axis) => (
                <div key={axis.key} className="bg-stone-950/90 border border-stone-800 rounded-lg px-2.5 py-2 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-stone-300 font-bold">{t(axis.labelRu, axis.labelEn)}</span>
                    <span className={`font-bold ${axis.txtClass}`}>{axis.val}/100</span>
                  </div>
                  <div className="h-2 rounded-full bg-stone-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${axis.barClass} transition-all duration-300`}
                      style={{ width: `${axis.val}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {politicalProfile.activeRivalries.length > 0 && (
              <div className="flex items-center gap-2 text-[11px] font-mono text-amber-200/95 bg-rose-950/40 border border-rose-500/35 rounded-lg px-2.5 py-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>
                  {t(
                    `Острое соперничество наибов (${politicalProfile.activeRivalries[0].tension}%): награждение одного усилит ревность соперника.`,
                    `Active Naib rivalry (${politicalProfile.activeRivalries[0].tension}%): honoring this Naib stirs his rival’s envy.`
                  )}
                </span>
              </div>
            )}

            {(selectedNaibate.ordersAwarded || []).length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1 border-t border-amber-500/15">
                {selectedNaibate.ordersAwarded.map((oName, idx) => {
                  const inferredId = inferOrderIdFromName(oName);
                  const legacyAwardEnMap = {
                    'Лев Газавата': 'Lion of the Gazavat',
                    'Звезда Шамиля I ст.': 'Star of Shamil (1st Class)',
                    'Шашка Чести': 'Shashka of Honor',
                    'Печать Мудира': 'Seal of the Mudir',
                    'Знамя Мудира': 'Banner of the Mudir'
                  };
                  const catalogMatch =
                    KUBACHI_25_ORDERS_CATALOG.find((o) => o.id === inferredId) ||
                    (inferredId === FELT_SHAME_BADGE.id ? FELT_SHAME_BADGE : null);
                  const localizedAwardName = t(
                    oName,
                    legacyAwardEnMap[oName] || catalogMatch?.nameEn || oName
                  );
                  return (
                    <span
                      key={`${oName}-${idx}`}
                      className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-200 font-mono text-[10px] font-bold flex items-center gap-1.5"
                    >
                      <ShamilOrderMedallion orderId={inferredId} size={18} />
                      {localizedAwardName}
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* Интерактивная музейная витрина 25 подлинных орденов Шамиля (открывает Lightbox с пожалованием в 1 клик) */}
          <button
            type="button"
            onClick={() => setShowOrdersLightbox(true)}
            className="w-full text-left group relative rounded-xl overflow-hidden border border-amber-500/45 hover:border-amber-400 bg-[#1a120d] shadow-lg cursor-pointer transition"
          >
            <div className="flex items-center justify-between gap-2 px-3 py-1.5 bg-gradient-to-r from-[#1d140e] via-[#271a11] to-[#1d140e] border-b border-amber-500/30">
              <span className="text-[10.5px] font-serif font-bold text-amber-200 truncate">
                🏛️ {t('Витрина всех 25 подлинных орденов Шамиля (кликабельный Lightbox)', 'Museum Showcase of All 25 Orders of Shamil (Clickable Lightbox)')}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-400/50 text-[10.5px] font-mono text-amber-200 group-hover:bg-amber-500 group-hover:text-stone-950 transition shrink-0">
                <Maximize2 className="w-3 h-3" />
                {t('Витрина 25 знаков', 'Inspect 25 Orders')}
              </span>
            </div>
            <ShamilOrdersMuseumShowcase compact interactive={false} t={t} className="border-0 rounded-none" />
          </button>

          {/* Полноэкранный интерактивный HTML/SVG Lightbox витрины 25 орденов с 1-клик пожалованием */}
          {showOrdersLightbox && (
            <div
              className="fixed inset-0 z-50 bg-black/88 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setShowOrdersLightbox(false)}
            >
              <div
                className="max-w-5xl w-full max-h-[92vh] overflow-y-auto bg-[#15110d] border border-amber-500/50 rounded-2xl shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-amber-500/25 bg-[#1b1510]">
                  <div className="text-sm font-serif font-bold text-amber-300">
                    🎖️ {t(
                      `25 кубачинских орденов Шамиля — Награждение наиба: ${selectedNaibate.naibName}`,
                      `25 Kubachi Orders of Shamil — Bestow on: ${selectedNaibate.naibNameEn || selectedNaibate.naibName}`
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowOrdersLightbox(false)}
                    className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="bg-[#380b10] p-3">
                  <ShamilOrdersMuseumShowcase
                    interactive
                    t={t}
                    onAwardOrder={(ordItem) => {
                      handleAwardOrder(ordItem);
                      setShowOrdersLightbox(false);
                    }}
                    recipientName={t(selectedNaibate.naibName, selectedNaibate.naibNameEn || selectedNaibate.naibName)}
                    availableSilver={resources.silver}
                    awardedOrderIds={[...awardedIdSet]}
                  />
                </div>
                <div className="p-4 text-xs text-stone-300 space-y-1.5 bg-[#120e0b]">
                  <p className="text-amber-200 font-semibold">
                    {t(
                      'Нажмите на любой из 25 кубачинских знаков на бархате, чтобы увидеть его игровой эффект и пожаловать выбранному наибу прямо из витрины.',
                      'Click any of the 25 Kubachi insignia on crimson velvet to inspect its gameplay bonuses and bestow it directly upon the selected Naib.'
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Фильтр по 4 рядам музейной коллекции (25 орденов) + Войлочный знак позора */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedOrderTier('all')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold border cursor-pointer transition ${
                selectedOrderTier === 'all'
                  ? 'bg-amber-500 text-stone-950 border-amber-300 shadow'
                  : 'bg-stone-900/90 text-stone-300 border-stone-700 hover:border-amber-500/60'
              }`}
            >
              {t('Все 25 орденов', 'All 25 Orders')}
            </button>
            {ORDER_TIER_META.map((tm) => (
              <button
                key={tm.tier}
                type="button"
                onClick={() => setSelectedOrderTier(String(tm.tier))}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold border cursor-pointer transition ${
                  selectedOrderTier === String(tm.tier)
                    ? 'bg-amber-500 text-stone-950 border-amber-300 shadow'
                    : 'bg-stone-900/90 text-stone-300 border-stone-700 hover:border-amber-500/60'
                }`}
              >
                {t(tm.shortRu, tm.shortEn)}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setSelectedOrderTier('felt')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold border cursor-pointer transition ${
                selectedOrderTier === 'felt'
                  ? 'bg-rose-600 text-white border-rose-300 shadow'
                  : 'bg-rose-950/60 text-rose-200 border-rose-700/60 hover:border-rose-400'
              }`}
            >
              ⚠ {t('Войлочный знак (Низам)', 'Felt Shame Badge')}
            </button>
          </div>

          {/* Сетка награждаемых орденов (все 25 знаков + дисциплинарный войлок) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[540px] overflow-y-auto pr-1">
            {visibleOrders.map((ord) => {
              const alreadyHeld = awardedIdSet.has(ord.id);
              const canAfford = resources.silver >= (ord.silverCost ?? 0);
              return (
                <div
                  key={ord.id}
                  className={`rounded-xl p-3.5 space-y-2 border transition flex flex-col justify-between ${
                    ord.isDisciplinary
                      ? 'bg-gradient-to-b from-[#2a1214] to-[#160b0c] border-rose-700/60 hover:border-rose-400'
                      : 'bg-gradient-to-b from-[#1e1812] to-[#130f0b] border-amber-700/40 hover:border-amber-400/75'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <ShamilOrderMedallion
                          orderId={ord.id}
                          size={50}
                          showVelvet
                          title={t(ord.name, ord.nameEn || ord.name)}
                        />
                        <div className="min-w-0">
                          <div className="text-[10px] font-mono text-amber-400/90 flex items-center gap-1.5">
                            <span>{ord.isDisciplinary ? t('НИЗАМ • ПОРИЦАНИЕ', 'NIZAM • CENSURE') : `№${ord.num} • ${t(`Ряд ${ord.tier}`, `Row ${ord.tier}`)}`}</span>
                            {alreadyHeld && (
                              <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                                ✓ {t('Вручён', 'Held')}
                              </span>
                            )}
                          </div>
                          <h3 className="text-xs sm:text-[13px] font-bold font-serif text-amber-200 leading-snug">
                            {t(ord.name, ord.nameEn || ord.name)}
                          </h3>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono text-amber-300 font-bold shrink-0">
                        {ord.silverCost > 0 ? t(`${ord.silverCost}₽`, `${ord.silverCost} rub.`) : t('0₽', '0 rub.')}
                      </span>
                    </div>
                    <p className="text-[10.5px] italic text-amber-100/85 leading-snug">
                      {t(ord.arabicMotto, ord.arabicMottoEn || ord.arabicMotto)}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-amber-500/20 flex flex-wrap items-center justify-between gap-2 text-[10.5px]">
                    <span className={`font-mono font-bold ${ord.isDisciplinary ? 'text-rose-300' : 'text-emerald-300'}`}>
                      {t(ord.perkRu, ord.perkEn)}
                    </span>
                    <button
                      type="button"
                      disabled={!canAfford}
                      onClick={() => handleAwardOrder(ord)}
                      className={`px-2.5 py-1 rounded-lg border font-serif font-bold transition shrink-0 ${
                        !canAfford
                          ? 'bg-stone-900/60 border-stone-700 text-stone-500 cursor-not-allowed'
                          : ord.isDisciplinary
                            ? 'bg-rose-600/25 hover:bg-rose-600/45 border-rose-400/70 text-rose-100 cursor-pointer'
                            : 'bg-amber-500/20 hover:bg-amber-500/35 border-amber-400/65 text-amber-100 cursor-pointer'
                      }`}
                    >
                      {ord.isDisciplinary
                        ? t('Назначить войлок', 'Issue Felt Patch')
                        : t('Жаловать наибу', 'Bestow on Naib')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
