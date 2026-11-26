// Окно «ReleaseHubModal» — вынесено из App.jsx; все значения состояния и обработчики приходят через props
import { MILESTONES_M1_M20_SUMMARY } from '../../data/appContent.js';

export default function ReleaseHubModal({
  handleExportCommanderSealHtml,
  handleExportSteamAnnouncementMd,
  handleTogglePitchTour,
  setShowAchievementsModal,
  setShowAudioMixerModal,
  setShowDispatchesModal,
  setShowFieldManualModal,
  setShowModBuilderModal,
  setShowMuseumCodexModal,
  setShowReleaseHubModal,
  setShowReplayModal,
  setShowTrailerPrevizModal,
  t
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-[#12151c] border-2 border-yellow-500/60 rounded-2xl max-w-6xl w-full p-5 sm:p-6 shadow-2xl space-y-5 my-auto">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-800 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-yellow-300 block">
                  GOLD MASTER RELEASE v2.0 • MILESTONES M1–M20 COMPLETE • INTEGRITY CERTIFICATE: PASS (7/7)
                </span>
                <h2 className="text-base sm:text-xl font-bold font-serif text-stone-100">
                  🦅 {t('Единый командный центр релиза «ИМАМАТ: ДИВАН-ХАНА» (Vertical Slice v2.0)', 'Unified Gold Master Release Command Hub “IMAMAT: DIVAN-KHANA” (v2.0)')}
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleExportCommanderSealHtml}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-mono text-xs font-extrabold cursor-pointer"
                >
                  🏆 {t('Скачать Грамоту Шамиля (.html)', 'Export Shamil Diploma (.html)')}
                </button>
                <button
                  onClick={() => setShowReleaseHubModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 font-mono text-xs cursor-pointer"
                >
                  ✕ {t('Закрыть', 'Close')}
                </button>
              </div>
            </div>

            {/* Сводные метрики Due Diligence */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {[
                { val: '31 гл. (2.23 МБ)', labelRu: 'Исторический архив', labelEn: 'Archival Volumes' },
                { val: '20 000 партий', labelRu: 'Матрица Монте-Карло', labelEn: 'Monte Carlo Runs' },
                { val: '20 карт SRTM', labelRu: 'Рельеф 2017×2017 .r16', labelEn: '2017×2017 SRTM Maps' },
                { val: '74 строки RU/EN', labelRu: 'Таблица ST_ImamatMaster', labelEn: 'UE5 String Table' },
                { val: '44 актора + 4K MRQ', labelRu: 'Спавнер и рендер UE5.5', labelEn: 'UE5.5 Actors & 4K MRQ' },
                { val: 'PASS (7/7)', labelRu: 'Сертификат целостности', labelEn: 'Integrity Certificate' }
              ].map((m, idx) => (
                <div key={idx} className="bg-[#171b24] border border-yellow-500/30 rounded-xl p-3 text-center">
                  <div className="font-mono font-extrabold text-sm sm:text-base text-yellow-300">{m.val}</div>
                  <div className="text-[11px] text-stone-400 mt-0.5">{t(m.labelRu, m.labelEn)}</div>
                </div>
              ))}
            </div>

            {/* Быстрый запуск 10 ключевых подсистем Vertical Slice v2.0 */}
            <div className="bg-[#0c0e12] border border-stone-800 rounded-xl p-4 space-y-2.5">
              <div className="text-xs font-mono uppercase text-amber-300">
                ⚡ {t('Пульт мгновенного запуска 10 ключевых модулей Vertical Slice v2.0:', '1-Click Quick Launcher for All 10 Vertical Slice v2.0 Modules:')}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { labelRu: '▶ Авто-тур (60с)', labelEn: '▶ Pitch Tour (60s)', act: () => { setShowReleaseHubModal(false); handleTogglePitchTour(); } },
                  { labelRu: '🎬 Трейлер + SRT/EDL', labelEn: '🎬 Trailer + SRT/EDL', act: () => { setShowReleaseHubModal(false); setShowTrailerPrevizModal(true); } },
                  { labelRu: '🏛️ Архив-Музей (11)', labelEn: '🏛️ Museum Codex (11)', act: () => { setShowReleaseHubModal(false); setShowMuseumCodexModal(true); } },
                  { labelRu: '📜 Депеши (BOA/РГВИА)', labelEn: '📜 Dispatches (BOA)', act: () => { setShowReleaseHubModal(false); setShowDispatchesModal(true); } },
                  { labelRu: '📘 Устав + 3 Ironman', labelEn: '📘 Manual + Ironman', act: () => { setShowReleaseHubModal(false); setShowFieldManualModal(true); } },
                  { labelRu: '📈 Хронограф + AAR', labelEn: '📈 Replay + AAR', act: () => { setShowReleaseHubModal(false); setShowReplayModal(true); } },
                  { labelRu: '🎛️ Пульт Звука 2.0', labelEn: '🎛️ WebAudio 2.0', act: () => { setShowReleaseHubModal(false); setShowAudioMixerModal(true); } },
                  { labelRu: '🛠️ Конструктор модов', labelEn: '🛠️ Mod Builder', act: () => { setShowReleaseHubModal(false); setShowModBuilderModal(true); } },
                  { labelRu: '🏆 12 Достижений Steam', labelEn: '🏆 12 Achievements', act: () => { setShowReleaseHubModal(false); setShowAchievementsModal(true); } },
                  { labelRu: '📰 Анонс Steam (.md)', labelEn: '📰 Steam News (.md)', act: () => { handleExportSteamAnnouncementMd(); } }
                ].map((btn, i) => (
                  <button
                    key={i}
                    onClick={btn.act}
                    className="px-2.5 py-2 rounded-lg bg-[#171b24] hover:bg-amber-500/20 border border-stone-700 hover:border-amber-400 text-stone-200 font-mono text-xs font-bold transition cursor-pointer text-left"
                  >
                    {t(btn.labelRu, btn.labelEn)}
                  </button>
                ))}
              </div>
            </div>

            {/* Матрица всех 20 закрытых майлстоунов M1–M20 */}
            <div className="space-y-2">
              <div className="text-xs font-mono uppercase text-stone-400">
                🏆 {t('Полный реестр закрытых майлстоунов разработки (Milestones M1–M20 — 100% Verified):', 'Complete Verified Engineering & Producer Milestone Registry (M1–M20):')}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                {MILESTONES_M1_M20_SUMMARY.map((ms) => (
                  <div
                    key={ms.code}
                    className="bg-[#161a23] border border-stone-800 rounded-lg px-3 py-2 flex items-start justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-extrabold text-xs text-yellow-300">{ms.code}</span>
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-stone-900 text-stone-400">
                          {ms.cat}
                        </span>
                      </div>
                      <p className="text-xs text-stone-200 mt-1">{t(ms.ru, ms.en)}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-[10px] font-bold shrink-0">
                      PASS
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
  );
}
