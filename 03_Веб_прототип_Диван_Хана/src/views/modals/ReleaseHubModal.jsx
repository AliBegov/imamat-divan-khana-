// Окно «ReleaseHubModal» — Единый командный центр релиза и Steam-упаковки (Спринт 11 / Фаза 6)
import { MILESTONES_M1_M20_SUMMARY } from '../../data/appContent.js';

export default function ReleaseHubModal({
  handleExportCommanderSealHtml,
  handleExportSteamAnnouncementMd,
  handleOpenSteamOverlay,
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
  steamCloudStatus = { slots: {}, totalBytes: 0 },
  steamRichPresence = null,
  steamRuntimeStatus = null,
  t,
  unlockedAchievementsCount = 0
}) {
  const cloudSlotsCount = Object.keys(steamCloudStatus?.slots || {}).length;
  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#12151c] border-2 border-yellow-500/60 rounded-2xl max-w-6xl w-full p-5 sm:p-6 shadow-2xl space-y-5 my-auto">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-800 pb-3">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-yellow-300 block">
              GOLD MASTER v1.0 RELEASE • ALL 6 PHASES & 12 SPRINTS COMPLETE • QUALITY GATES 1–6: PASS (7/7)
            </span>
            <h2 className="text-base sm:text-xl font-bold font-serif text-stone-100">
              🦅 {t('Командный центр коммерческого релиза v1.0 и Steam Next Fest «ИМАМАТ: ДИВАН-ХАНА»', 'v1.0 Gold Master & Steam Next Fest Command Hub “IMAMAT: DIVAN-KHANA”')}
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {handleOpenSteamOverlay && (
              <button
                type="button"
                onClick={() => handleOpenSteamOverlay('Store')}
                className="px-3 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/35 border border-sky-400/50 text-sky-200 font-mono text-xs font-bold cursor-pointer"
              >
                🎮 {t('Steam Overlay', 'Steam Overlay')}
              </button>
            )}
            <button
              type="button"
              onClick={handleExportCommanderSealHtml}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-mono text-xs font-extrabold cursor-pointer"
            >
              🏆 {t('Скачать Грамоту Шамиля (.html)', 'Export Shamil Diploma (.html)')}
            </button>
            <button
              type="button"
              onClick={() => setShowReleaseHubModal(false)}
              className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 font-mono text-xs cursor-pointer"
            >
              ✕ {t('Закрыть', 'Close')}
            </button>
          </div>
        </div>

        {/* СПРИНТ 11: Статус Steamworks Desktop Package (macOS / Windows / Cloud / Capsules / Trailer) */}
        <div className="bg-[#0e131c] border border-sky-500/40 rounded-xl p-3.5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs font-mono">
          <div className="bg-[#141a26] border border-stone-800 rounded-lg p-2.5">
            <div className="text-[10px] uppercase text-sky-400">{t('Сборка macOS & Windows', 'macOS & Windows Builds')}</div>
            <div className="text-emerald-300 font-bold mt-0.5">macOS .app + Win Portable</div>
            <div className="text-[10px] text-stone-400 mt-0.5">Electron IPC + SteamPipe VDF</div>
          </div>
          <div className="bg-[#141a26] border border-stone-800 rounded-lg p-2.5">
            <div className="text-[10px] uppercase text-emerald-400">{t('Steam Cloud & Достижения', 'Steam Cloud & Achievements')}</div>
            <div className="text-stone-100 font-bold mt-0.5">
              {t(`${unlockedAchievementsCount}/12 наград • ${cloudSlotsCount} слот.`, `${unlockedAchievementsCount}/12 earned • ${cloudSlotsCount} slots`)}
            </div>
            <div className="text-[10px] text-stone-400 mt-0.5 truncate">
              {steamRuntimeStatus ? t(steamRuntimeStatus.labelRu, steamRuntimeStatus.labelEn) : 'Steamworks Bridge'}
            </div>
          </div>
          <div className="bg-[#141a26] border border-stone-800 rounded-lg p-2.5">
            <div className="text-[10px] uppercase text-amber-400">{t('Steam Next Fest Demo → v1.0', 'Steam Next Fest Demo → v1.0')}</div>
            <div className="text-amber-200 font-bold mt-0.5">Dargo 1845 (8T) + 7 Capsules</div>
            <div className="text-[10px] text-stone-400 mt-0.5">Save Carry-Over • Gate 6 PASS</div>
          </div>
          <div className="bg-[#141a26] border border-stone-800 rounded-lg p-2.5">
            <div className="text-[10px] uppercase text-purple-300">Rich Presence</div>
            <div className="text-stone-100 font-bold mt-0.5 truncate">
              {steamRichPresence ? t(steamRichPresence.ru, steamRichPresence.en) : t('Дарго 1845 • Ход 1', 'Dargo 1845 • Turn 1')}
            </div>
            <div className="text-[10px] text-stone-400 mt-0.5">AppID 3481840 • RU / EN</div>
          </div>
        </div>

        {/* Сводные метрики Due Diligence */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {[
            { valRu: '32 гл. (2.23 МБ)', valEn: '32 ch. (2.23 MB)', labelRu: 'Исторический архив', labelEn: 'Archival Volumes' },
            { valRu: '20 001 партия', valEn: '20,001 runs', labelRu: 'Матрица Монте-Карло', labelEn: 'Monte Carlo Suite' },
            { valRu: '25 орденов / 32 дил.', valEn: '25 Orders / 32 Dil.', labelRu: 'Политика наибов', labelEn: 'Naib Politics' },
            { valRu: '1280×800 → 4K', valEn: '1280×800 → 4K', labelRu: 'Steam Deck + UHD', labelEn: 'Steam Deck + UHD' },
            { valRu: '96/96 тестов', valEn: '96/96 tests', labelRu: 'Автотесты ядра', labelEn: 'Core Unit Tests' },
            { valRu: 'GATE 6 PASS', valEn: 'GATE 6 PASS', labelRu: 'Релиз v1.0 готов', labelEn: 'v1.0 Launch Ready' }
          ].map((m, idx) => (
            <div key={idx} className="bg-[#171b24] border border-yellow-500/30 rounded-xl p-3 text-center">
              <div className="font-mono font-extrabold text-sm sm:text-base text-yellow-300">{t(m.valRu, m.valEn)}</div>
              <div className="text-[11px] text-stone-400 mt-0.5">{t(m.labelRu, m.labelEn)}</div>
            </div>
          ))}
        </div>

        {/* Быстрый запуск 10 ключевых подсистем Vertical Slice v2.0 */}
        <div className="bg-[#0c0e12] border border-stone-800 rounded-xl p-4 space-y-2.5">
          <div className="text-xs font-mono uppercase text-amber-300">
            ⚡ {t('Пульт мгновенного запуска 10 ключевых модулей:', '1-Click Quick Launcher for All 10 Core Release Modules:')}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { labelRu: '▶ Авто-тур (60с)', labelEn: '▶ Pitch Tour (60s)', act: () => { setShowReleaseHubModal(false); handleTogglePitchTour(); } },
              { labelRu: '🎬 Трейлер + SRT/EDL', labelEn: '🎬 Trailer + SRT/EDL', act: () => { setShowReleaseHubModal(false); setShowTrailerPrevizModal(true); } },
              { labelRu: '🏛️ Архив-Музей (11)', labelEn: '🏛️ Museum Codex (11)', act: () => { setShowReleaseHubModal(false); setShowMuseumCodexModal(true); } },
              { labelRu: '📜 Депеши (BOA/РГВИА)', labelEn: '📜 Dispatches (BOA)', act: () => { setShowReleaseHubModal(false); setShowDispatchesModal(true); } },
              { labelRu: '📘 Устав + 3 Ironman', labelEn: '📘 Manual + Ironman', act: () => { setShowReleaseHubModal(false); setShowFieldManualModal(true); } },
              { labelRu: '📈 Хронограф + AAR', labelEn: '📈 Replay + AAR', act: () => { setShowReleaseHubModal(false); setShowReplayModal(true); } },
              { labelRu: '🎛️ Пульт Звука 4.0', labelEn: '🎛️ Adaptive Audio 4.0', act: () => { setShowReleaseHubModal(false); setShowAudioMixerModal(true); } },
              { labelRu: '🛠️ Конструктор модов', labelEn: '🛠️ Mod Builder', act: () => { setShowReleaseHubModal(false); setShowModBuilderModal(true); } },
              { labelRu: '🏆 12 Достижений Steam', labelEn: '🏆 12 Achievements', act: () => { setShowReleaseHubModal(false); setShowAchievementsModal(true); } },
              { labelRu: '📰 Анонс Steam (.md)', labelEn: '📰 Steam News (.md)', act: () => { handleExportSteamAnnouncementMd(); } }
            ].map((btn, i) => (
              <button
                key={i}
                type="button"
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
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
