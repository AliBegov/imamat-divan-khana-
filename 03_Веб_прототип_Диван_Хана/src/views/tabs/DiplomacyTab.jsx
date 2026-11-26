// Вкладка «DiplomacyTab» — Тайная дипломатия с Блистательной Портой и Наградная палата Имамата (CK3 / Victoria 3 HUD)
import { useState } from 'react';
import { OTTOMAN_OPTIONS, SHAMIL_ORDERS } from '../../data/campaignData.js';
import { resolveMediaAsset } from '../../data/embeddedMediaAssets.js';
import { Award, Compass, Maximize2, X } from 'lucide-react';
import { PortraitMedallion, TabHeroBanner, findPortrait } from '../hud/GameHUD.jsx';
import { CompassRoseIcon, PowderFlaskIcon, WaxSealIcon } from '../hud/PeriodIcons.jsx';
import {
  ShamilOrderMedallion,
  ShamilOrdersMuseumShowcase,
  inferOrderIdFromName
} from '../shared/ShamilOrdersSvg.jsx';

export default function DiplomacyTab({
  handleAwardOrder,
  handleOttomanDiplomacy,
  resources,
  selectedNaibate,
  t
}) {
  const [showOrdersLightbox, setShowOrdersLightbox] = useState(false);
  const naibPortrait = findPortrait(selectedNaibate?.naibName, selectedNaibate?.id);

  return (
    <div className="space-y-5">
      <TabHeroBanner
        artSrc="Diplomacy_Trabzon_Felucca_Smuggling_1846.jpg"
        portraitKey={selectedNaibate?.naibName || 'Шамиль'}
        portraitName={t(selectedNaibate.naibName, selectedNaibate.naibNameEn || selectedNaibate.naibName)}
        portraitTitle={t(selectedNaibate.naibTitle, selectedNaibate.naibTitleEn || selectedNaibate.naibTitle)}
        portraitColor="#f59e0b"
        tag={t('ДИПЛОМАТИЧЕСКАЯ КАНЦЕЛЯРИЯ • СТАМБУЛ И НАГРАДНАЯ ПАЛАТА', 'DIPLOMATIC CHANCELLERY • ISTANBUL & HONOURS CHAMBER')}
        title={t(
          'Тайные миссии к Блистательной Порте и Серебряные ордена Шамиля',
          'Secret Missions to the Sublime Porte & Silver-Niello Orders of Shamil'
        )}
        desc={t(
          'Переписка [[divan|Диван-ханы]] с [[porte|Блистательной Портой]] снабжает горы [[powder|порохом]] через Трабзон, а серебряные знаки отличия из казны [[baytalmal|Байт аль-маль]] укрепляют верность [[naib|наибов]].',
          'Correspondence between the [[divan|Divan-Khana]] and the [[porte|Sublime Porte]] supplies the mountains with [[powder|powder]] via Trabzon, while silver-niello honours from the [[baytalmal|Bayt al-Mal]] fortify [[naib|naib]] loyalty.'
        )}
        rightSlot={
          <div className="flex flex-wrap items-center gap-2 hud-num text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-300 font-bold">
              <CompassRoseIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('Влияние в Порте:', 'Porte Influence:')} {resources.ottomanSupport}%</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900/90 border border-amber-500/30 text-amber-200 font-bold">
              <WaxSealIcon className="w-3.5 h-3.5 text-amber-300" />
              <span>{resources.silver} {t('руб.', 'rub.')}</span>
            </span>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Левая панель: Блистательная Порта */}
        <div className="relative lg:col-span-6 hud-panel hud-walnut-bezel rounded-xl p-5 shadow-2xl space-y-4">
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
                    'Тайная дипломатия с Блистательной Портой (Стамбул)',
                    'Secret Diplomacy with the Sublime Porte (Istanbul)'
                  )}
                </span>
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                {t(
                  'Переписка с султаном Абдул-Меджидом I и доставка пороха через Трабзон и Синоп',
                  'Correspondence with Sultan Abdülmecid I and gunpowder smuggling via Trabzon and Sinop'
                )}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <PortraitMedallion src={findPortrait('Мухаммад-Амин')} name="Наиб Мухаммад-Амин" color="#f59e0b" size={34} />
              <PortraitMedallion src={findPortrait('Хаджи-Юсуф')} name="Инженер Хаджи-Юсуф" color="#10b981" size={34} />
            </div>
          </div>

          {/* Живая сцена ночной выгрузки пороха с турецких фелюг */}
          <div className="relative rounded-xl overflow-hidden border border-amber-500/40 bg-black shadow-lg h-36 sm:h-40">
            <img
              src={resolveMediaAsset('Diplomacy_Trabzon_Felucca_Smuggling_1846.jpg')}
              alt="Night Felucca Gunpowder Smuggling from Trabzon (1846)"
              className="w-full h-full object-cover object-center opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex items-end p-3">
              <span className="text-[11px] font-mono text-amber-200 leading-snug">
                ⛵ {t(
                  'Ночная выгрузка английского пороха и свинца с трабзонских фелюг на черкесском берегу (1846 г.)',
                  'Night unloading of English rifle powder and lead from Trabzon feluccas on the Circassian coast (1846)'
                )}
              </span>
            </div>
          </div>

          {/* Шкала влияния в Стамбуле */}
          <div className="bg-[#0e1116]/90 border border-amber-500/25 rounded-xl p-3 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-stone-300">{t('Благосклонность двора султана Абдул-Меджида I', 'Favour of Sultan Abdülmecid I’s Court')}</span>
              <span className="text-amber-300 font-bold">{resources.ottomanSupport}%</span>
            </div>
            <div className="h-2 rounded-full bg-stone-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-600 via-amber-400 to-emerald-400 transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, resources.ottomanSupport))}%` }}
              />
            </div>
          </div>

          <div className="space-y-3">
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
                  className="bg-gradient-to-b from-[#1e1812] to-[#130f0b] border border-amber-700/40 hover:border-amber-400/70 rounded-xl p-4 space-y-2.5 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <PortraitMedallion src={findPortrait(envoyKey)} name={opt.title} color="#f59e0b" size={38} />
                      <h3 className="text-sm font-bold text-amber-100 font-serif leading-snug">
                        {t(opt.title, opt.titleEn || opt.title)}
                      </h3>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/35 text-amber-300 font-mono text-[10px] shrink-0">
                      -{opt.costSilver} {t('руб.', 'rub.')}
                    </span>
                  </div>
                  <p className="text-xs text-stone-300 leading-relaxed">
                    {t(opt.desc, opt.descEn || opt.desc)}
                  </p>
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-amber-500/20 text-xs hud-num">
                    <span className="inline-flex items-center gap-1.5 text-emerald-300 font-bold">
                      <PowderFlaskIcon className="w-3.5 h-3.5 text-emerald-400" />
                      <span>
                        {t(
                          `Награда: +${opt.rewardPowder} пуд. пороха, +${opt.rewardSilver} руб.`,
                          `Yield: +${opt.rewardPowder} poods powder, +${opt.rewardSilver} rub.`
                        )}
                      </span>
                    </span>
                    <button
                      onClick={() => handleOttomanDiplomacy(opt)}
                      className="px-3.5 py-1.5 rounded-lg bg-gradient-to-b from-amber-400 to-amber-600 hover:brightness-110 text-stone-950 font-serif font-bold cursor-pointer transition shadow"
                    >
                      {t(`Снарядить миссию (${opt.costSilver} руб.)`, `Dispatch Mission (${opt.costSilver} rub.)`)}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Правая панель: Серебряные ордена Шамиля */}
        <div className="relative lg:col-span-6 hud-panel hud-walnut-bezel rounded-xl p-5 shadow-2xl space-y-4">
          <span className="hud-brass-corner tl" />
          <span className="hud-brass-corner tr" />
          <span className="hud-brass-corner bl" />
          <span className="hud-brass-corner br" />
          <div className="border-b border-amber-500/25 pb-3">
            <h2 className="text-base font-bold font-serif text-amber-300 uppercase flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400 shrink-0" />
              <span>
                {t(
                  'Наградная палата Имамата: Серебряные ордена с чернью',
                  'Imamate Honours Chamber: Silver-Niello Orders of Shamil'
                )}
              </span>
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              {t(
                `Пожалование ордена выбранному наибу (${selectedNaibate.naibName}) повышает его Иман и смиряет Гордыню`,
                `Bestowing an order upon the selected Naib (${selectedNaibate.naibNameEn || selectedNaibate.naibName}) elevates his Iman and tempers Pride`
              )}
            </p>
          </div>

          {/* Чистая HTML/SVG витрина 25 подлинных орденов и знаков отличия в Имамате Шамиля (Нац. музей РД им. А. Тахо-Годи) */}
          <button
            type="button"
            onClick={() => setShowOrdersLightbox(true)}
            className="w-full text-left group relative rounded-xl overflow-hidden border border-amber-500/45 hover:border-amber-400 bg-[#1a120d] shadow-lg cursor-pointer transition"
          >
            <div className="flex items-center justify-between gap-2 px-3 py-1.5 bg-gradient-to-r from-[#1d140e] via-[#271a11] to-[#1d140e] border-b border-amber-500/30">
              <span className="text-[10.5px] font-serif font-bold text-amber-200 truncate">
                🏛️ {t('Витрина 25 подлинных орденов Шамиля (HTML/SVG)', 'Showcase of 25 Authentic Orders of Shamil (HTML/SVG)')}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-400/50 text-[10.5px] font-mono text-amber-200 group-hover:bg-amber-500 group-hover:text-stone-950 transition shrink-0">
                <Maximize2 className="w-3 h-3" />
                {t('Увеличить (25 знаков)', 'Inspect (25 Orders)')}
              </span>
            </div>
            <ShamilOrdersMuseumShowcase compact interactive={false} t={t} className="border-0 rounded-none" />
            <div className="bg-gradient-to-r from-[#17110c] via-[#1f1610] to-[#17110c] border-t border-amber-500/25 px-3 py-2">
              <span className="text-[10.5px] font-mono text-amber-200/90 leading-snug block">
                🎖️ {t(
                  'Подлинные ордена и знаки отличия в Имамате Шамиля. XIX в. Серебро, медь, позолота, чернь • Нац. музей РД им. А. Тахо-Годи',
                  'Authentic Orders & Insignia in Shamil’s Imamate. 19th c. Silver, copper, gilding, niello • National Museum of Dagestan'
                )}
              </span>
            </div>
          </button>

          {/* Полноэкранный интерактивный HTML/SVG Lightbox витрины 25 орденов */}
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
                      'Ордена и знаки отличия в Имамате Шамиля — интерактивная HTML/SVG витрина (Нац. музей РД им. А. Тахо-Годи)',
                      'Orders & Insignia in Shamil’s Imamate — Interactive HTML/SVG Showcase (National Museum of Dagestan)'
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
                  <ShamilOrdersMuseumShowcase interactive t={t} />
                </div>
                <div className="p-4 text-xs text-stone-300 space-y-1.5 bg-[#120e0b]">
                  <p className="text-amber-200 font-semibold">
                    {t(
                      'XIX век • Серебро, медь, позолота • Гравировка, чеканка, чернь • Наведите или нажмите на любой из 25 знаков',
                      '19th Century • Silver, copper, gilding • Engraving, chasing, niello • Hover or click any of the 25 insignia'
                    )}
                  </p>
                  <p className="text-stone-400 leading-relaxed">
                    {t(
                      '1-й ряд: выпуклые круглые знаки с ажурными умбонами и позолотой. 2-й ряд: круглый знак с гравированной шашкой, три большие 8-лепестковые фестончатые звезды мудиров и наибов и прорезная розетка. 3-й ряд: прорезные знаки храбрости, серебряный полумесяц «Хиляль» и звёздчатые медальоны. 4-й ряд: крупные чеканные круглые диски с арабскими девизами и печатью Шамиля.',
                      'Row 1: domed circular medallions with filigree bosses & gilding. Row 2: round shashka-engraved medal, three grand 8-lobed scalloped Mudir/Naib stars, and pierced rosette. Row 3: pierced valor discs, silver “Hilal” crescent, and star medallions. Row 4: large chased silver discs with Arabic inscriptions & Shamil’s seal.'
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Карточка выбранного наиба-получателя */}
          <div className="bg-[#0e1116]/90 border border-amber-500/30 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <PortraitMedallion src={naibPortrait} name={selectedNaibate.naibName} color="#f59e0b" size={46} selected />
              <div className="min-w-0">
                <div className="text-[10px] font-mono uppercase text-amber-400">
                  {t('Получатель награды •', 'Order Recipient •')} {t(selectedNaibate.name, selectedNaibate.nameEn || selectedNaibate.name)}
                </div>
                <div className="text-sm font-serif font-bold text-stone-100 truncate">
                  {t(selectedNaibate.naibName, selectedNaibate.naibNameEn || selectedNaibate.naibName)}
                </div>
                <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[10px] font-mono">
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/35 text-emerald-300">
                    {t('Иман', 'Iman')}: {selectedNaibate.traits?.iman ?? 75}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-sky-500/15 border border-sky-500/35 text-sky-300">
                    {t('Отвага', 'Courage')}: {selectedNaibate.traits?.courage ?? 85}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-rose-500/15 border border-rose-500/35 text-rose-300">
                    {t('Гордыня', 'Pride')}: {selectedNaibate.traits?.pride ?? 40}
                  </span>
                </div>
              </div>
            </div>
            {(selectedNaibate.ordersAwarded || []).length > 0 && (
              <div className="flex flex-wrap gap-1">
                {selectedNaibate.ordersAwarded.map((oName, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-200 font-mono text-[10px] font-bold flex items-center gap-1.5"
                  >
                    <ShamilOrderMedallion orderId={inferOrderIdFromName(oName)} size={18} />
                    {oName}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3">
            {SHAMIL_ORDERS.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-gradient-to-b from-[#1e1812] to-[#130f0b] border border-amber-700/40 hover:border-amber-400/70 rounded-xl p-4 space-y-2 transition"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-bold font-serif text-amber-300 flex items-center gap-3">
                      <ShamilOrderMedallion
                        orderId={ord.id}
                        size={60}
                        showVelvet
                        title={t(ord.name, ord.nameEn || ord.name)}
                      />
                      <span>{t(ord.name, ord.nameEn || ord.name)}</span>
                    </h3>
                    <span className="text-xs font-mono text-amber-200/90 shrink-0">
                      {t(`Чеканка: ${ord.silverCost} руб.`, `Minting: ${ord.silverCost} rub.`)}
                    </span>
                  </div>
                  <p className="text-xs italic text-amber-100/90 pl-16">
                    {t(ord.arabicMotto, ord.arabicMottoEn || ord.arabicMotto)}
                  </p>
                  <p className="text-[11px] text-stone-400 pl-16">
                    {t(ord.shape, ord.shapeEn || ord.shape)}
                  </p>
                  <div className="pt-2.5 border-t border-amber-500/20 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-mono text-emerald-300 font-bold">
                      {t(
                        `Иман +${ord.imanBonus} | Гордыня -${ord.prideReduction} | 🥈 Сотне: +1★ и +6% дисц.`,
                        `Iman +${ord.imanBonus} | Pride -${ord.prideReduction} | 🥈 Squadron: +1★ & +6% obed.`
                      )}
                    </span>
                    <button
                      onClick={() => handleAwardOrder(ord)}
                      className="px-3.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/35 border border-amber-400/60 text-amber-200 font-bold cursor-pointer transition"
                    >
                      {t(
                        `Жаловать наибу (${selectedNaibate.naibName})`,
                        `Bestow on Naib (${selectedNaibate.naibNameEn || selectedNaibate.naibName})`
                      )}
                    </button>
                  </div>
                </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
