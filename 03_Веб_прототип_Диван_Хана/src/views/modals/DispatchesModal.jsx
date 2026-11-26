// Окно «DispatchesModal» — вынесено из App.jsx; все значения состояния и обработчики приходят через props
import { DIPLOMATIC_DISPATCHES_ARCHIVE } from '../../data/appContent.js';
import { resolveMediaAsset } from '../../data/embeddedMediaAssets.js';
import { playHistoricalSound } from '../../game/audio.js';
import { PortraitMedallion, findPortrait } from '../hud/GameHUD.jsx';

export default function DispatchesModal({
  diplomaticTone,
  executedDispatchesIds,
  feluccaEscortLevel,
  getDispatchResolutionPreview,
  handleExecuteDiplomaticDispatch,
  handleExportDiplomaticDispatchMd,
  selectedDispatchId,
  setDiplomaticTone,
  setFeluccaEscortLevel,
  setSelectedDispatchId,
  setShowDispatchesModal,
  soundEnabled,
  t
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          {(() => {
            const activeDispatch =
              DIPLOMATIC_DISPATCHES_ARCHIVE.find((d) => d.id === selectedDispatchId) ||
              DIPLOMATIC_DISPATCHES_ARCHIVE[0];
            const preview = getDispatchResolutionPreview(
              activeDispatch,
              feluccaEscortLevel,
              diplomaticTone
            );
            const alreadySent = executedDispatchesIds.includes(activeDispatch.id);
            return (
              <div className="bg-[#12151c] border-2 border-lime-500/50 rounded-2xl max-w-6xl w-full p-5 sm:p-6 shadow-2xl space-y-4 my-auto">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-800 pb-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-lime-300 block">
                      Ottoman Archive BOA (Istanbul) • RGVIA (Moscow) • Michik River Treaty (1855)
                    </span>
                    <h2 className="text-base sm:text-lg font-bold font-serif text-stone-100">
                      📜 {t('Канцелярия внешних сношений Диван-ханы: Дипломатические депеши и трактаты (1845–1855)', 'Divan-Khana Foreign Chancellery: Diplomatic Dispatches, Firmans & Treaties (1845–1855)')}
                    </h2>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={handleExportDiplomaticDispatchMd}
                      className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-200 font-mono text-xs font-bold cursor-pointer"
                    >
                      ⬇️ {t('Скачать Фирман (.md)', 'Export Firman (.md)')}
                    </button>
                    <button
                      onClick={() => setShowDispatchesModal(false)}
                      className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 font-mono text-xs cursor-pointer"
                    >
                      ✕ {t('Закрыть', 'Close')}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  {/* Левая колонка: список 5 архивных дипломатических депеш */}
                  <div className="lg:col-span-5 space-y-2">
                    <div className="text-xs font-mono uppercase text-stone-400 mb-1">
                      {t('Реестр дипломатических миссий (5 архивных досье):', 'Diplomatic Mission Registry (5 Archival Dossiers):')}
                    </div>
                    {DIPLOMATIC_DISPATCHES_ARCHIVE.map((d) => {
                      const isSel = d.id === activeDispatch.id;
                      const isDone = executedDispatchesIds.includes(d.id);
                      return (
                        <button
                          key={d.id}
                          onClick={() => {
                            setSelectedDispatchId(d.id);
                            playHistoricalSound('paper', soundEnabled);
                          }}
                          className={`w-full text-left p-2.5 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                            isSel
                              ? 'bg-lime-500/15 border-lime-400 text-stone-100 shadow-md'
                              : 'bg-[#171b24] border-stone-800 text-stone-300 hover:border-stone-700'
                          }`}
                        >
                          {d.imageUrl && (
                            <img
                              src={resolveMediaAsset(d.imageUrl)}
                              alt={d.year}
                              className="w-16 h-16 rounded-lg object-cover border border-lime-500/30 shrink-0"
                            />
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-stone-900 text-lime-300 border border-lime-500/30">
                                {d.year} • {isDone ? t('ОТПРАВЛЕНО', 'DISPATCHED') : t('ГОТОВО К ПЕЧАТИ', 'READY TO SEAL')}
                              </span>
                              <span className="font-serif text-xs text-amber-300 truncate">{d.arabicHeader}</span>
                            </div>
                            <div className="font-serif font-bold text-xs sm:text-sm text-stone-100 mt-1 line-clamp-2">
                              {t(d.recipientRu, d.recipientEn)}
                            </div>
                            <div className="text-[10px] font-mono text-emerald-300 mt-0.5 truncate">
                              {t(d.effectSummaryRu, d.effectSummaryEn)}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Правая колонка: полный текст грамоты, настройка эскорта фелуки и математическая модель прорыва */}
                  <div className="lg:col-span-7 bg-[#0c0e12] border border-stone-800 rounded-xl p-4 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-800 pb-2">
                        <span className="text-[11px] font-mono text-amber-300">
                          🏛️ {activeDispatch.archiveCipher}
                        </span>
                        <span className="text-sm font-serif text-lime-300 font-bold">
                          {activeDispatch.arabicHeader}
                        </span>
                      </div>

                      {activeDispatch.imageUrl && (
                        <div className="relative rounded-xl overflow-hidden border border-lime-500/40 bg-black shadow-lg">
                          <img
                            src={resolveMediaAsset(activeDispatch.imageUrl)}
                            alt={activeDispatch.recipientEn}
                            className="w-full h-44 sm:h-52 object-cover object-center"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
                          {activeDispatch.actors && activeDispatch.actors.length > 0 && (
                            <div className="absolute bottom-2.5 left-3 right-3 flex flex-wrap items-center justify-between gap-2">
                              <div className="flex flex-wrap items-center gap-2">
                                {activeDispatch.actors.map((act) => (
                                  <div
                                    key={act.key}
                                    className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/75 border border-amber-500/35 backdrop-blur-sm"
                                  >
                                    <PortraitMedallion
                                      src={findPortrait(act.key)}
                                      name={t(act.nameRu, act.nameEn)}
                                      color={act.color}
                                      size={28}
                                    />
                                    <span className="text-[10px] font-serif font-bold text-amber-100">
                                      {t(act.nameRu, act.nameEn)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                              <span className="px-2 py-0.5 rounded bg-lime-950/90 border border-lime-400/50 text-[10px] font-mono font-bold text-lime-200">
                                {activeDispatch.year} • BOA / РГВИА
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      <h3 className="text-base font-serif font-bold text-stone-100">
                        {t(activeDispatch.recipientRu, activeDispatch.recipientEn)}
                      </h3>
                      <div className="text-xs font-mono text-sky-300">
                        🧭 {t(activeDispatch.routeRu, activeDispatch.routeEn)}
                      </div>

                      <div className="p-3.5 rounded-xl bg-[#161a24] border border-amber-500/30 font-serif text-xs sm:text-sm text-amber-100/95 italic leading-relaxed">
                        {t(activeDispatch.excerptRu, activeDispatch.excerptEn)}
                      </div>

                      {/* Выбор уровня морского/конного эскорта */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div className="bg-[#141821] border border-stone-800 rounded-lg p-3">
                          <label className="text-[11px] font-mono uppercase text-stone-400 block mb-1.5">
                            ⛵ {t('Эскорт фелуки / парламентёра:', 'Felucca / Envoy Escort Tier:')}
                          </label>
                          <div className="space-y-1.5">
                            {[
                              { lvl: 0, ru: 'Ночной гонец (0 руб., +0%)', en: 'Night Courier (0 rub., +0%)' },
                              { lvl: 1, ru: 'Вооружённая фелука (40 руб., +14%)', en: 'Armed Felucca (40 rub., +14%)' },
                              { lvl: 2, ru: 'Черкесская флотилия (85 руб., +26%)', en: 'Circassian Flotilla (85 rub., +26%)' }
                            ].map((opt) => (
                              <button
                                key={opt.lvl}
                                onClick={() => setFeluccaEscortLevel(opt.lvl)}
                                className={`w-full text-left px-2.5 py-1.5 rounded text-xs font-mono cursor-pointer border ${
                                  feluccaEscortLevel === opt.lvl
                                    ? 'bg-lime-500/20 border-lime-400 text-lime-200 font-bold'
                                    : 'bg-stone-900/70 border-stone-800 text-stone-400'
                                }`}
                              >
                                {t(opt.ru, opt.en)}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="bg-[#141821] border border-stone-800 rounded-lg p-3">
                          <label className="text-[11px] font-mono uppercase text-stone-400 block mb-1.5">
                            🖋️ {t('Дипломатический тон послания:', 'Diplomatic Protocol Tone:')}
                          </label>
                          <div className="space-y-1.5">
                            {[
                              { key: 'protocol', ru: 'Строгий адаб и посольский этикет', en: 'Strict Adab & Chancery Protocol' },
                              { key: 'ultimatum', ru: 'Военный ультиматум Сердар-ы Экрема', en: 'Serdar-ı Ekrem Military Demand' },
                              { key: 'conciliatory', ru: 'Взаимные уступки и выкуп пленных', en: 'Mutual Concession & Ransom Parley' }
                            ].map((tn) => (
                              <button
                                key={tn.key}
                                onClick={() => setDiplomaticTone(tn.key)}
                                className={`w-full text-left px-2.5 py-1.5 rounded text-xs font-mono cursor-pointer border ${
                                  diplomaticTone === tn.key
                                    ? 'bg-amber-500/20 border-amber-400 text-amber-200 font-bold'
                                    : 'bg-stone-900/70 border-stone-800 text-stone-400'
                                }`}
                              >
                                {t(tn.ru, tn.en)}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Математическая декомпозиция вероятности P_dip */}
                      <div className="bg-[#141821] border border-lime-500/30 rounded-lg p-3 font-mono text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-stone-300">
                            {t('Вероятность прорыва кордона / успеха переговоров P_dip:', 'Blockade Breakthrough / Treaty Acceptance P_dip:')}
                          </span>
                          <span className="text-base font-extrabold text-lime-300">{preview.chance}%</span>
                        </div>
                        <div className="text-[11px] text-stone-400">
                          Base({activeDispatch.baseFeasibility}%) + Porte({preview.ottomanFactor}%) + Auth({preview.authorityFactor}%) + Escort(+{preview.escortBonus}%) + Tone({preview.toneBonus >= 0 ? `+${preview.toneBonus}` : preview.toneBonus}%) - Blockade({preview.blockadePenalty}%)
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-stone-800 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-mono text-emerald-300">
                        🎁 {t(activeDispatch.effectSummaryRu, activeDispatch.effectSummaryEn)}
                      </span>
                      <button
                        onClick={handleExecuteDiplomaticDispatch}
                        disabled={alreadySent}
                        className={`px-4 py-2 rounded-lg font-mono text-xs font-extrabold transition cursor-pointer ${
                          alreadySent
                            ? 'bg-stone-800 text-stone-500 cursor-not-allowed'
                            : 'bg-lime-500 hover:bg-lime-400 text-stone-950 shadow-lg'
                        }`}
                      >
                        {alreadySent
                          ? t('✓ Депеша уже исполнена в кампании', '✓ Dispatch Already Executed')
                          : t(`🦅 Скрепить восьмиугольной печатью и отправить (${preview.silverCost} руб.)`, `🦅 Seal with Signet & Dispatch (${preview.silverCost} rub.)`)}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
  );
}
