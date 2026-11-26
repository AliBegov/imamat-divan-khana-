// Вкладка «NizamsTab» — Кодекс Низамов Шамиля и Суд Диван-ханы (оформление в стиле CK3 / Victoria 3)
import { useState } from 'react';
import { resolveMediaAsset } from '../../data/embeddedMediaAssets.js';
import { Scale, CheckCircle2, ScrollText, Gavel, ShieldCheck } from 'lucide-react';
import { PortraitMedallion, RichText, TabHeroBanner, findPortrait } from '../hud/GameHUD.jsx';
import { ShashkaSabersIcon, WaxSealIcon } from '../hud/PeriodIcons.jsx';

// Восьмиугольный оттиск подлинной перстневой печати Имама Шамиля (ИИАЭ ДФИЦ РАН: «عبده شمويل ١٢٦٦»)
function ShamilOctagonalSealBadge({ enacted, size = 54 }) {
  return (
    <div
      className={`relative shrink-0 inline-flex flex-col items-center justify-center select-none transition-all duration-300 ${
        enacted
          ? 'text-amber-100 opacity-100 drop-shadow-[0_2px_8px_rgba(16,185,129,0.35)] -rotate-3'
          : 'text-stone-500 opacity-45 rotate-0'
      }`}
      style={{ width: size, height: size }}
      title={
        enacted
          ? 'Оттиск перстневой печати Имама Шамиля: أَمِيرُ الْمُؤْمِنِينَ عَبْدُهُ شَمْوِيلُ ١٢٦٦ هـ'
          : 'Ожидает скрепления перстневой печатью Имама Шамиля'
      }
    >
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <polygon
          points="30,4 70,4 96,30 96,70 70,96 30,96 4,70 4,30"
          fill={enacted ? 'rgba(20, 14, 9, 0.92)' : 'rgba(20, 16, 12, 0.45)'}
          stroke={enacted ? '#10b981' : '#78716c'}
          strokeWidth="3.2"
        />
        <polygon
          points="33,10 67,10 90,33 90,67 67,90 33,90 10,67 10,33"
          fill="none"
          stroke={enacted ? '#f59e0b' : '#57534e'}
          strokeWidth="1.3"
          strokeDasharray={enacted ? 'none' : '3 2'}
        />
        <text
          x="50"
          y="33"
          textAnchor="middle"
          fill={enacted ? '#fcd34d' : '#a8a29e'}
          fontSize="10.5"
          fontFamily="serif"
          fontWeight="bold"
        >
          أَمِيرُ الْمُؤْمِنِينَ
        </text>
        <text
          x="50"
          y="55"
          textAnchor="middle"
          fill={enacted ? '#ffffff' : '#d6d3d1'}
          fontSize="14.5"
          fontFamily="serif"
          fontWeight="bold"
        >
          عَبْدُهُ شَمْوِيلُ
        </text>
        <text
          x="50"
          y="74"
          textAnchor="middle"
          fill={enacted ? '#6ee7b7' : '#a8a29e'}
          fontSize="10"
          fontFamily="serif"
          fontWeight="bold"
        >
          سَنَةَ ١٢٦٦ هـ
        </text>
      </svg>
    </div>
  );
}

const PILLAR_ARABIC_HEADERS = {
  judicial: {
    ar: 'بَابُ الْقَضَاءِ وَالْحِسْبَةِ وَإِقَامَةِ الشَّرِيعَةِ الْغَرَّاءِ',
    banner: 'Archive_Arabic_Chronicle_AlQarakhi_1845.jpg'
  },
  military: {
    ar: 'بَابُ الْجُنْدِ وَالْمُرْتَزِقَةِ وَإِعْدَادِ الْعُدَّةِ وَالْبَارُودِ',
    banner: 'Armory_Bazalai_Dagger_Gazyr_Showcase_1845.jpg'
  },
  tax: {
    ar: 'بَابُ بَيْتِ الْمَالِ وَالزَّكَاةِ وَالْخُمْسِ وَعِمَارَةِ الْأَرْضِ',
    banner: 'KeyArt_DivanKhana_Council_Vedeno_1845.jpg'
  },
  family: {
    ar: 'بَابُ النِّكَاحِ وَتَيْسِيرِ الْمُهُورِ وَتَرْكِ الْعَادَاتِ الْجَاهِلِيَّةِ',
    banner: 'Scene_Tariqa_Zikr_Council_Sogratl_1845.jpg'
  }
};

export default function NizamsTab({
  courtCases,
  filteredNizams,
  handleEnactNizam,
  handleMediateNaibRivalry,
  handleResolveCourtCase,
  naibRivalries = [],
  selectedPillar,
  setSelectedPillar,
  t,
  turn = 1,
  turnActionQuota
}) {
  const [nizamSection, setNizamSection] = useState('nizams');
  const [showManuscriptPreamble, setShowManuscriptPreamble] = useState(false);
  const enactedCount = filteredNizams.filter((n) => n.enacted).length;
  const openCasesCount = courtCases.filter((c) => !c.resolved).length;
  const unlockedOpenCasesCount = courtCases.filter((c) => !c.resolved && (c.unlockTurn || 1) <= turn).length;
  const openRivalriesCount = naibRivalries.filter((r) => !r.resolved && (r.unlockTurn || 1) <= turn).length;
  const nizamTurnLimitReached =
    turnActionQuota &&
    (turnActionQuota.nizamsEnacted >= turnActionQuota.maxNizamsPerTurn ||
      turnActionQuota.sealsRemaining <= 0);
  const courtTurnLimitReached =
    turnActionQuota &&
    (turnActionQuota.courtCasesResolved >= turnActionQuota.maxCourtCasesPerTurn ||
      turnActionQuota.sealsRemaining <= 0);

  return (
    <div className="space-y-4">
      <TabHeroBanner
        artSrc="KeyArt_DivanKhana_Council_Vedeno_1845.jpg"
        portraitKey="Шамиль"
        portraitName={t('Имам Шамиль', 'Imam Shamil')}
        portraitTitle={t('Законодатель Диван-ханы и глава Имамата', 'Lawgiver of the Divan-Khana & Head of the Imamate')}
        portraitColor="#f59e0b"
        tag={t('ГОСУДАРСТВЕННЫЙ СОВЕТ ВЕДЕНО • КОДЕКС НИЗАМОВ', 'STATE COUNCIL OF VEDENO • CODE OF NIZAMS')}
        title={t(
          'Кодекс государственных постановлений («Низам Шамиля»)',
          'Code of State Decrees (“Shamil’s Nizam”)'
        )}
        desc={t(
          'Законодательные реформы [[divan|Диван-ханы]], заменившие родовые [[adat|адаты]] единым государственным правом [[sharia|шариата]]: учредили гвардию [[murtazek|муртазеков]], казну [[baytalmal|Байт аль-маль]] и надзор [[muhtasib|мухтасибов]].',
          'Legislative reforms of the [[divan|Divan-Khana]] that replaced clan [[adat|Adat]] customs with unified [[sharia|Sharia]] state law: establishing the [[murtazek|Murtazek]] guard, the [[baytalmal|Bayt al-Mal]] treasury, and [[muhtasib|Muhtasib]] inspectors.'
        )}
        rightSlot={
          <div className="flex flex-wrap items-center gap-2 hud-num text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold">
              <WaxSealIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t('Утверждено:', 'Enacted:')} {enactedCount} / {filteredNizams.length}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-950/80 border border-amber-500/40 text-amber-300 font-bold">
              <ShashkaSabersIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('Ждут суда:', 'Pending appeals:')} {openCasesCount}</span>
            </span>
            {turnActionQuota && (
              <span
                className={`px-3 py-1.5 rounded-lg border font-bold ${
                  nizamTurnLimitReached
                    ? 'bg-stone-900/90 border-stone-600 text-stone-400'
                    : 'bg-sky-950/80 border-sky-500/40 text-sky-300'
                }`}
              >
                {t('Низам за ход:', 'Nizam this turn:')} {turnActionQuota.nizamsEnacted}/{turnActionQuota.maxNizamsPerTurn} • {t('Суд:', 'Court:')} {turnActionQuota.courtCasesResolved}/{turnActionQuota.maxCourtCasesPerTurn}
              </span>
            )}
          </div>
        }
      />

      {/* КОМПАКТНЫЙ ПЕРЕКЛЮЧАТЕЛЬ 3 ПАЛАТ ДИВАН-ХАНЫ (НИЗАМЫ / ВЕРХОВНЫЙ СУД / СПОРЫ НАИБОВ) */}
      <div className="relative hud-walnut-bezel bg-[#13100d] border border-amber-500/45 rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-2 shadow-lg">
        <span className="hud-brass-corner tl" />
        <span className="hud-brass-corner tr" />
        <span className="hud-brass-corner bl" />
        <span className="hud-brass-corner br" />
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-serif">
          {[
            {
              id: 'nizams',
              labelRu: `📜 Кодекс 12 Низамов (${enactedCount}/${filteredNizams.length})`,
              labelEn: `📜 Code of 12 Nizams (${enactedCount}/${filteredNizams.length})`
            },
            {
              id: 'court',
              labelRu: `⚖️ Верховный Шариатский Суд (${unlockedOpenCasesCount > 0 ? `${unlockedOpenCasesCount} к разбору` : `${openCasesCount} дел`})`,
              labelEn: `⚖️ Supreme Sharia Court (${unlockedOpenCasesCount > 0 ? `${unlockedOpenCasesCount} open now` : `${openCasesCount} cases`})`
            },
            {
              id: 'rivalries',
              labelRu: `⚡ Споры и Фракции Наибов (${openRivalriesCount}/${naibRivalries.length})`,
              labelEn: `⚡ Naib Rivalries & Factions (${openRivalriesCount}/${naibRivalries.length})`
            }
          ].map((sec) => (
            <button
              key={sec.id}
              onClick={() => setNizamSection(sec.id)}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer border ${
                nizamSection === sec.id
                  ? 'bg-gradient-to-b from-amber-400 to-amber-600 text-stone-950 border-amber-300 shadow'
                  : 'bg-[#191510] text-stone-300 hover:text-amber-200 border-stone-800'
              }`}
            >
              {t(sec.labelRu, sec.labelEn)}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowManuscriptPreamble((prev) => !prev)}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold border transition cursor-pointer ${
            showManuscriptPreamble
              ? 'bg-emerald-950/80 border-emerald-400 text-emerald-200'
              : 'bg-[#17130e] border-amber-500/35 text-amber-200 hover:border-amber-400'
          }`}
        >
          {showManuscriptPreamble
            ? t('📜 Скрыть манускрипт (١٢٦٨ هـ) ▴', '📜 Hide Manuscript (1268 AH) ▴')
            : t('📜 Архивная преамбула (١٢٦٨ هـ) ▾', '📜 Archival Preamble (1268 AH) ▾')}
        </button>
      </div>

      {/* СВОРАЧИВАЕМАЯ ВИТРИНА ПОДЛИННОГО АРАБСКОГО КОДЕКСА И ПЕРСТНЕВОЙ ПЕЧАТИ ШАМИЛЯ */}
      {showManuscriptPreamble && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 bg-[#120f0b]/90 border border-amber-500/30 rounded-xl p-3.5 items-center">
          <div className="lg:col-span-5 relative h-36 sm:h-40 rounded-lg overflow-hidden border border-amber-500/40 bg-black">
            <img
              src={resolveMediaAsset('Archive_Arabic_Chronicle_AlQarakhi_1845.jpg')}
              alt="Archival Manuscript of Imam Shamil's Nizam & Letter No. 68 (IIAE RAN)"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/25 flex items-end p-2.5">
              <span className="text-[10px] font-mono text-amber-200 font-bold">
                📜 {t('Эталонный манускрипт Диван-ханы (ИИАЭ ДФИЦ РАН, № 68)', 'Canonical Divan-Khana Manuscript (IIAE RAN, No. 68)')}
              </span>
            </div>
          </div>
          <div className="lg:col-span-7 space-y-2 px-1">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                {t('АРХИВНАЯ ПРЕАМБУЛА НИЗАМА ИМАМА ШАМИЛЯ (١٢٦٨ هـ)', 'ARCHIVAL PREAMBLE OF IMAM SHAMIL’S NIZAM (1268 AH)')}
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-[10px] font-mono text-emerald-300">
                ﴿ عَبْدُهُ شَمْوِيلُ ١٢٦٦ ﴾
              </span>
            </div>
            <p
              dir="rtl"
              className="text-sm sm:text-base font-serif text-amber-100 bg-black/45 border border-amber-500/25 rounded-lg px-3.5 py-2 leading-relaxed text-right"
            >
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ۝ مِنْ أَمِيرِ الْمُؤْمِنِينَ شَمْوِيلَ إِلَى الْإِخْوَانِ الْأَحِبَّةِ... فَإِنِّي أُوصِيكُمْ بِتَقْوَى اللَّهِ الْعَظِيمِ فِي السِّرِّ وَالْعَلَانِيَةِ وَإِقَامَةِ الشَّرِيعَةِ الْغَرَّاءِ وَتَرْكِ الْعَادَاتِ الْجَاهِلِيَّةِ وَالِاعْتِصَامِ بِحَبْلِ اللَّهِ جَمِيعًا
            </p>
            <p className="text-xs text-stone-300 italic leading-relaxed">
              {t(
                '«От повелителя правоверных Шамуиля... Заповедую вам богобоязненность пред Великим Аллахом тайно и явно, утверждение пресветлого Шариата, оставление адатов времён невежества и единение вокруг верви Аллаха без раскола...»',
                '“From the Commander of the Faithful Shamil... I enjoin upon you fear of Almighty Allah in secret and in public, upholding the luminous Sharia, abandoning the customs of ignorance, and holding fast together to the rope of Allah...”'
              )}
            </p>
          </div>
        </div>
      )}

      {nizamSection === 'nizams' && (
      <div className="hud-panel rounded-xl p-4 sm:p-5 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-500/25 pb-3.5">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-xs sm:text-sm font-serif font-bold text-amber-300 uppercase tracking-wide">
              {t('Четыре столпа государственного уложения', 'Four Pillars of the State Code')}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {[
              { id: 'all', label: t('Все 4 столпа', 'All 4 Pillars') },
              { id: 'judicial', label: t('Суд и Мухтасибы', 'Courts & Muhtasibs') },
              { id: 'military', label: t('Муртазеки и Порох', 'Murtazeks & Powder') },
              { id: 'tax', label: t('Байт аль-маль и Террасы', 'Bayt al-Mal & Terraces') },
              { id: 'family', label: t('Семья и Калым', 'Family & Bride-Price') }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedPillar(tab.id)}
                className={`px-3 py-1.5 rounded-lg font-semibold cursor-pointer transition ${
                  selectedPillar === tab.id
                    ? 'bg-gradient-to-b from-amber-400 to-amber-600 text-stone-950 shadow'
                    : 'bg-[#17130e] text-stone-300 hover:text-amber-200 border border-amber-700/35'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-2">
          {[...filteredNizams]
            .sort((a, b) => (a.unlockTurn || 1) - (b.unlockTurn || 1))
            .map((niz) => {
            const pMeta = PILLAR_ARABIC_HEADERS[niz.pillar] || PILLAR_ARABIC_HEADERS.judicial;
            const reqTurn = niz.unlockTurn || 1;
            const isLockedByTurn = !niz.enacted && turn < reqTurn;
            return (
              <div
                key={niz.id}
                className={`rounded-xl overflow-hidden border flex flex-col justify-between transition ${
                  niz.enacted
                    ? 'bg-gradient-to-b from-[#15231d] to-[#0f1714] border-emerald-500/50 shadow-[inset_0_1px_0_rgba(52,211,153,0.18)]'
                    : isLockedByTurn
                      ? 'bg-[#12100d]/85 border-stone-800 opacity-75'
                      : 'bg-gradient-to-b from-[#1e1812] to-[#130f0b] border-amber-700/40 hover:border-amber-400/70'
                }`}
              >
                <div>
                  {/* Художественная шапка столпа Низама с арабской рубрикой */}
                  <div className="relative h-14 w-full overflow-hidden bg-black border-b border-amber-500/25">
                    <img
                      src={resolveMediaAsset(pMeta.banner)}
                      alt={t(niz.pillarName, niz.pillarNameEn || niz.pillarName)}
                      className="w-full h-full object-cover object-center opacity-65"
                      onError={(e) => {
                        e.currentTarget.src = resolveMediaAsset('KeyArt_DivanKhana_Council_Vedeno_1845.jpg');
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#16120d] via-black/45 to-black/30" />
                    <div className="absolute top-1.5 inset-x-3 flex items-center justify-between gap-2 text-[10px] font-mono">
                      <span className="px-2 py-0.5 rounded bg-black/75 border border-amber-500/40 text-amber-300 uppercase font-bold truncate">
                        {t(niz.pillarName, niz.pillarNameEn || niz.pillarName)}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded shrink-0 font-bold border ${
                          isLockedByTurn
                            ? 'bg-stone-900/90 border-stone-700 text-stone-400'
                            : 'bg-black/80 border-amber-500/35 text-amber-200'
                        }`}
                      >
                        {isLockedByTurn
                          ? `🔒 ${t(`Ход ${reqTurn}+`, `Turn ${reqTurn}+`)}`
                          : t(niz.tierBadgeRu || niz.year, niz.tierBadgeEn || niz.yearEn || niz.year)}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-xs sm:text-sm font-bold font-serif text-amber-100 flex items-start gap-1.5 leading-snug">
                        <ScrollText className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <span>{t(niz.title, niz.titleEn || niz.title)}</span>
                      </h3>
                      <ShamilOctagonalSealBadge enacted={niz.enacted} size={42} />
                    </div>

                    <p className="text-[11px] text-stone-300 mt-1.5 leading-snug line-clamp-3">
                      {t(niz.historicalText, niz.historicalTextEn || niz.historicalText)}
                    </p>

                    <div className="mt-2 p-2 rounded-lg bg-[#0c0e12]/90 border border-amber-500/25 text-[10.5px] font-mono text-emerald-300">
                      ✦ {t(niz.effectsSummary, niz.effectsSummaryEn || niz.effectsSummary)}
                    </div>

                    <div className="mt-2 pt-1.5 border-t border-stone-800/80 flex flex-wrap items-center gap-1">
                      {niz.naibReactions.map((r, idx) => {
                        const isPositive = String(r.deltaRu || r.delta).includes('+');
                        return (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 text-[10px] bg-black/35 px-1.5 py-0.5 rounded border border-stone-800/70"
                          >
                            <strong className="text-stone-300 truncate max-w-[90px]">
                              {t(r.naibRu || r.naib, r.naibEn || r.naib)}:
                            </strong>
                            <span className={`font-mono font-bold ${isPositive ? 'text-emerald-300' : 'text-amber-300'}`}>
                              {t(r.deltaRu || r.delta, r.deltaEn || r.delta)}
                            </span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="px-3 pb-3 pt-2 mt-1 border-t border-amber-500/20 flex items-center justify-between gap-2">
                  {niz.enacted ? (
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{t('Утверждён печатью Имама (١٢٦٦ هـ)', 'Sealed by the Imam (1266 AH)')}</span>
                    </span>
                  ) : (
                    <>
                      <span className="text-[11px] font-mono text-amber-200/90">
                        {t(
                          `Цена: ${niz.costAuthority}% авт. / ${niz.costSilver} руб.`,
                          `Cost: ${niz.costAuthority}% Auth. / ${niz.costSilver} rub.`
                        )}
                      </span>
                      <button
                        onClick={() => handleEnactNizam(niz)}
                        className={`px-3 py-1 rounded-lg font-bold text-xs cursor-pointer transition shadow ${
                          isLockedByTurn || nizamTurnLimitReached
                            ? 'bg-stone-800 text-stone-400 border border-stone-600'
                            : 'bg-gradient-to-b from-amber-400 to-amber-600 hover:brightness-110 text-stone-950'
                        }`}
                      >
                        {isLockedByTurn
                          ? t(`🔒 Ступень с Хода ${reqTurn}`, `🔒 Unlocks Turn ${reqTurn}`)
                          : nizamTurnLimitReached
                            ? t('⏳ Лимит хода (1/1)', '⏳ Turn Limit (1/1)')
                            : t('Принять Низам', 'Enact Nizam')}
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      )}

      {/* Улучшение №2: Живые интриги и соперничество между самими наибами (Фракции Диван-ханы) */}
      {nizamSection === 'rivalries' && naibRivalries && naibRivalries.length > 0 && (
        <div className="hud-panel rounded-xl p-4 sm:p-5 shadow-2xl space-y-4 border border-amber-500/35">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/25 pb-3">
            <div>
              <h3 className="text-sm sm:text-base font-bold font-serif text-amber-300 uppercase flex items-center gap-2">
                <span>⚡ {t('Междоусобное соперничество наибов и фракции Диван-ханы', 'Inter-Naib Rivalries & Factions in the Divan-Khana')}</span>
              </h3>
              <p className="text-xs text-stone-400 mt-0.5">
                {t(
                  'Успех одного полководца или вручение ему Серебряного ордена задевает гордыню его соперника. Арбитраж Шамиля гасит раскол в совете.',
                  'Rewarding one commander stirs his rival’s pride. Shamil’s arbitration prevents factional splits in the council.'
                )}
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs font-mono">
              {t(
                `Урегулировано споров: ${naibRivalries.filter((r) => r.resolved).length} / ${naibRivalries.length}`,
                `Disputes arbitrated: ${naibRivalries.filter((r) => r.resolved).length} / ${naibRivalries.length}`
              )}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
            {naibRivalries.map((riv) => {
              const isRivalryLocked = !riv.resolved && (riv.unlockTurn || 1) > turn;
              return (
              <div
                key={riv.id}
                className={`rounded-xl p-4 border flex flex-col justify-between transition ${
                  riv.resolved
                    ? 'bg-emerald-950/20 border-emerald-500/45'
                    : isRivalryLocked
                      ? 'bg-stone-950/70 border-stone-800 opacity-75'
                      : 'bg-gradient-to-b from-[#1e1710] to-[#120e0a] border-amber-500/35'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="flex items-center -space-x-2 shrink-0">
                        <PortraitMedallion
                          src={findPortrait(riv.naibAPortrait)}
                          name={riv.naibAPortrait}
                          color="#ef4444"
                          size={34}
                        />
                        <PortraitMedallion
                          src={findPortrait(riv.naibBPortrait)}
                          name={riv.naibBPortrait}
                          color="#38bdf8"
                          size={34}
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] font-mono text-amber-400 truncate">
                          {t(riv.naibANameRu, riv.naibANameEn)} ⚡ {t(riv.naibBNameRu, riv.naibBNameEn)}
                        </div>
                        <h4 className="text-xs font-bold font-serif text-amber-200 leading-tight">
                          {t(riv.titleRu, riv.titleEn)}
                        </h4>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded font-mono text-[9.5px] font-bold shrink-0 border ${
                        riv.resolved
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                          : isRivalryLocked
                            ? 'bg-stone-900 border-stone-700 text-stone-400'
                            : 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                      }`}
                    >
                      {riv.resolved
                        ? t('✓ Урегулировано', '✓ Resolved')
                        : isRivalryLocked
                          ? t(`🔒 Ход #${riv.unlockTurn}`, `🔒 Turn #${riv.unlockTurn}`)
                          : t(riv.actBadgeRu || 'Открыто', riv.actBadgeEn || 'Unlocked')}
                    </span>
                  </div>

                  {/* Шкала накала трений между наибами */}
                  <div className="bg-black/45 rounded-lg p-2 border border-amber-500/20 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-stone-400">
                        {t('Накал соперничества:', 'Rivalry Tension:')}
                      </span>
                      <span
                        className={`font-bold ${
                          riv.tension >= 70
                            ? 'text-red-400'
                            : riv.tension >= 45
                              ? 'text-amber-300'
                              : 'text-emerald-300'
                        }`}
                      >
                        {riv.tension}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-stone-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          riv.tension >= 70
                            ? 'bg-red-500'
                            : riv.tension >= 45
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(5, riv.tension))}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-red-950/25 border-l-2 border-red-400/70 pl-2.5 py-1.5 text-[11px] italic text-stone-200 rounded-r leading-snug">
                    {t(riv.quoteRu, riv.quoteEn)}
                  </div>

                  <div className="text-[10px] font-mono text-amber-300/90 bg-amber-950/30 border border-amber-500/25 rounded p-2">
                    ⚠️ {t(riv.riskDescRu, riv.riskDescEn)}
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-amber-500/20 space-y-1.5">
                  {isRivalryLocked && (
                    <div className="px-2.5 py-1.5 rounded bg-stone-900/90 border border-stone-700 text-[10.5px] font-mono text-stone-400">
                      🔒 {t(`Откроется последовательно на Ходу #${riv.unlockTurn} (${riv.actBadgeRu})`, `Unlocks sequentially on Turn #${riv.unlockTurn} (${riv.actBadgeEn})`)}
                    </div>
                  )}
                  {riv.options.map((opt) => {
                    const isChosen = riv.resolvedOptionId === opt.id;
                    return (
                      <button
                        key={opt.id}
                        disabled={Boolean(riv.resolved || isRivalryLocked)}
                        onClick={() => handleMediateNaibRivalry && handleMediateNaibRivalry(riv.id, opt)}
                        className={`w-full text-left px-2.5 py-2 rounded-lg text-[11px] border transition ${
                          isChosen
                            ? 'bg-emerald-900/50 border-emerald-400 text-emerald-100 font-bold'
                            : riv.resolved || isRivalryLocked
                              ? 'bg-stone-900/40 border-stone-800 text-stone-500 cursor-not-allowed'
                              : 'bg-amber-950/35 hover:bg-amber-900/50 border-amber-500/35 text-amber-100 cursor-pointer'
                        }`}
                      >
                        <div className="font-bold">
                          {isChosen ? '✓ ' : isRivalryLocked ? '🔒 ' : '⚖️ '}
                          {t(opt.labelRu, opt.labelEn)}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
            })}
          </div>
        </div>
      )}

      {/* Судебные казусы Диван-ханы */}
      {nizamSection === 'court' && (
      <div className="hud-panel rounded-xl p-4 sm:p-5 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/25 pb-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold font-serif text-amber-300 uppercase flex items-center gap-2">
              <Gavel className="w-4 h-4 text-amber-400" />
              <span>
                {t(
                  'Судебные разбирательства в Диван-хане (апелляции наибов и джамаатов)',
                  'Sharia vs. Adat Court Cases in the Divan-Khana (Naib & Jamaat Appeals)'
                )}
              </span>
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              <RichText
                text={t(
                  'Тяжбы между нормами [[sharia|шариата]], старинным [[adat|адатом]] и военной необходимостью [[naibate|наибств]].',
                  'Disputes between [[sharia|Sharia]] law, ancestral [[adat|Adat]] custom, and military necessity across the [[naibate|naibates]].'
                )}
              />
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <PortraitMedallion src={findPortrait('Шамиль')} name="Имам Шамиль" color="#f59e0b" size={34} />
            <PortraitMedallion src={findPortrait('Согратль')} name="Алимы Согратля" color="#10b981" size={34} />
            <PortraitMedallion src={findPortrait('Кибит')} name="Мудир Кибит-Магома" color="#38bdf8" size={34} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...courtCases]
            .sort((a, b) => (a.unlockTurn || 1) - (b.unlockTurn || 1))
            .map((cc, idx) => {
            const isCaseLocked = !cc.resolved && (cc.unlockTurn || 1) > turn;
            const casePortrait =
              findPortrait(cc.title, cc.description, cc.options?.[0]?.targetNaibId) || findPortrait('Согратль');
            const caseBanners = [
              'Crisis_Hadji_Murat_Council_1851.jpg',
              'Archive_Arabic_Chronicle_AlQarakhi_1845.jpg',
              'Armory_Bazalai_Dagger_Gazyr_Showcase_1845.jpg',
              'Diplomacy_Trabzon_Felucca_Smuggling_1846.jpg',
              'Scene_Tariqa_Zikr_Council_Sogratl_1845.jpg',
              'KeyArt_DivanKhana_Council_Vedeno_1845.jpg'
            ];
            const caseArt = caseBanners[idx % caseBanners.length];
            return (
              <div
                key={cc.id}
                className={`rounded-xl overflow-hidden border transition flex flex-col justify-between ${
                  cc.resolved
                    ? 'bg-gradient-to-b from-[#15231d] to-[#0f1714] border-emerald-500/45'
                    : isCaseLocked
                      ? 'bg-stone-950/70 border-stone-800 opacity-75'
                      : 'bg-gradient-to-b from-[#1d1711] to-[#120e0a] border-amber-700/40 hover:border-amber-400/70'
                }`}
              >
                <div>
                  <div className="relative h-20 w-full overflow-hidden bg-black border-b border-amber-500/25">
                    <img
                      src={resolveMediaAsset(caseArt)}
                      alt={t(cc.title, cc.titleEn || cc.title)}
                      className="w-full h-full object-cover object-center opacity-75"
                      onError={(e) => {
                        e.currentTarget.src = resolveMediaAsset('Crisis_Hadji_Murat_Council_1851.jpg');
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a140e] via-black/40 to-transparent" />
                    <div className="absolute top-2 inset-x-3 flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded bg-black/75 border border-amber-500/40 text-[10px] font-mono text-amber-300 font-bold">
                        {isCaseLocked
                          ? `🔒 ${t(`Откроется на Ходу #${cc.unlockTurn}`, `Unlocks on Turn #${cc.unlockTurn}`)}`
                          : `⚖️ ${t(`Судебный казус #${idx + 1}`, `Court Appeal #${idx + 1}`)}`}
                      </span>
                      {cc.triggerConditionDesc && (
                        <span className="px-2 py-0.5 rounded bg-black/75 border border-amber-500/35 text-amber-200 font-mono text-[10px] truncate">
                          {t(cc.triggerConditionDesc, cc.triggerConditionDescEn || cc.triggerConditionDesc)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-3.5 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <PortraitMedallion
                          src={casePortrait}
                          name={cc.title}
                          color={cc.resolved ? '#10b981' : '#f59e0b'}
                          size={38}
                        />
                        <h4 className="text-sm font-bold text-amber-100 font-serif leading-snug">
                          {t(cc.title, cc.titleEn || cc.title)}
                        </h4>
                      </div>
                      {cc.resolved && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 font-mono text-[10px] font-bold flex items-center gap-1 shrink-0">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>حُكْمٌ</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-300 leading-relaxed">
                      {t(cc.description, cc.descriptionEn || cc.description)}
                    </p>
                    {cc.dialogueQuoteRu && (
                      <div className="p-2 rounded-lg bg-amber-950/35 border-l-2 border-amber-400 text-[11px] font-serif italic text-amber-100/95 leading-snug">
                        💬 {t(cc.dialogueQuoteRu, cc.dialogueQuoteEn || cc.dialogueQuoteRu)}
                      </div>
                    )}
                    {cc.resolved ? (
                      <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>
                          {t('Решение вынесено:', 'Verdict Issued:')} <strong>{cc.chosenResolution}</strong>
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {isCaseLocked && (
                          <div className="px-2.5 py-1.5 rounded bg-stone-900/90 border border-stone-700 text-[11px] font-mono text-stone-400">
                            🔒 {t(`Хронологическая очередь: это дело поступит в Диван-хану на Ходу #${cc.unlockTurn} (сейчас Ход #${turn}).`, `Chronological queue: this appeal reaches the Divan-Khana on Turn #${cc.unlockTurn} (currently Turn #${turn}).`)}
                          </div>
                        )}
                        {!isCaseLocked && courtTurnLimitReached && (
                          <div className="px-2.5 py-1.5 rounded bg-stone-900/90 border border-stone-600 text-[11px] font-mono text-stone-300">
                            ⏳ {t('Лимит суда на этот ход исчерпан (1/1). Слушание остальных дел — на следующем ходу.', 'Court limit for this turn reached (1/1). Next hearings on the following turn.')}
                          </div>
                        )}
                        {cc.options.map((opt) => (
                          <button
                            key={opt.id}
                            disabled={isCaseLocked}
                            onClick={() => handleResolveCourtCase(cc, opt)}
                            className={`w-full text-left p-2 rounded-lg border text-xs transition ${
                              isCaseLocked
                                ? 'bg-stone-950/50 border-stone-800 text-stone-500 cursor-not-allowed'
                                : courtTurnLimitReached
                                  ? 'bg-stone-900/60 border-stone-700 text-stone-400 cursor-pointer'
                                  : 'bg-[#0e1116]/90 hover:bg-amber-500/15 border-amber-700/35 hover:border-amber-400 text-stone-200 cursor-pointer'
                            }`}
                          >
                            {isCaseLocked ? '🔒 ' : '• '}
                            {t(opt.label, opt.labelEn || opt.label)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      )}
    </div>
  );
}
