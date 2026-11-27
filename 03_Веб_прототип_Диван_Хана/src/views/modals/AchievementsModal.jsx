// Окно «AchievementsModal» — 12 исторических достижений + живой мост Steamworks (Спринт 11)

export default function AchievementsModal({
  handleOpenSteamOverlay,
  setShowAchievementsModal,
  steamAchievementsStatus,
  steamAppId = 3481840,
  steamCloudQuotaBytes = 104857600,
  steamCloudStatus = { slots: {}, totalBytes: 0, lastSyncIso: null },
  steamRichPresence = null,
  steamRuntimeStatus = null,
  t,
  unlockedAchievementsCount
}) {
  const cloudSlotsCount = Object.keys(steamCloudStatus?.slots || {}).length;
  const cloudKb = ((steamCloudStatus?.totalBytes || 0) / 1024).toFixed(1);
  const quotaMb = Math.round(steamCloudQuotaBytes / (1024 * 1024));

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#131720] border border-amber-500/50 rounded-2xl max-w-4xl w-full max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-stone-800 flex flex-wrap items-center justify-between gap-2 bg-[#171c26]">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 block">
              {t(
                `Наградная летопись Диван-ханы • Steamworks AppID ${steamAppId} • Открыто: ${unlockedAchievementsCount}/12`,
                `Divan-Khana Roll of Honour • Steamworks AppID ${steamAppId} • Unlocked: ${unlockedAchievementsCount}/12`
              )}
            </span>
            <h2 className="text-base sm:text-lg font-bold font-serif text-stone-100">
              🏆 {t('Исторические достижения Steamworks и подвиги кампании', 'Historical Steamworks Achievements & Campaign Deeds')} ({unlockedAchievementsCount}/12)
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {handleOpenSteamOverlay && (
              <button
                type="button"
                onClick={() => handleOpenSteamOverlay('Achievements')}
                className="px-3 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/35 border border-sky-400/50 text-sky-200 font-mono text-xs font-bold cursor-pointer transition"
              >
                🎮 {t('Steam Overlay (Shift+Tab)', 'Steam Overlay (Shift+Tab)')}
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowAchievementsModal(false)}
              className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 font-mono text-xs font-bold cursor-pointer"
            >
              {t('Закрыть ✕', 'Close ✕')}
            </button>
          </div>
        </div>

        {/* СПРИНТ 11 (Фаза 6): Живая панель статуса Steamworks SDK, Cloud Saves и Rich Presence */}
        <div className="px-4 py-2.5 bg-[#0e121a] border-b border-stone-800/90 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-mono">
          <div className="bg-[#151a24] border border-sky-500/30 rounded-lg px-2.5 py-1.5">
            <div className="text-[9.5px] uppercase text-sky-400">
              {t('Среда Steamworks', 'Steamworks Runtime')}
            </div>
            <div className="text-stone-200 font-bold truncate mt-0.5">
              {steamRuntimeStatus
                ? t(steamRuntimeStatus.labelRu, steamRuntimeStatus.labelEn)
                : t('Офлайн-буфер Steamworks', 'Offline Steamworks Buffer')}
            </div>
          </div>
          <div className="bg-[#151a24] border border-emerald-500/30 rounded-lg px-2.5 py-1.5">
            <div className="text-[9.5px] uppercase text-emerald-400">
              {t('Steam Cloud Saves (.imamat-save)', 'Steam Cloud Saves (.imamat-save)')}
            </div>
            <div className="text-stone-200 font-bold truncate mt-0.5">
              {t(
                `Слотов: ${cloudSlotsCount} • ${cloudKb} КБ / ${quotaMb} МБ`,
                `Slots: ${cloudSlotsCount} • ${cloudKb} KB / ${quotaMb} MB`
              )}
            </div>
          </div>
          <div className="bg-[#151a24] border border-amber-500/30 rounded-lg px-2.5 py-1.5">
            <div className="text-[9.5px] uppercase text-amber-400">
              {t('Steam Rich Presence', 'Steam Rich Presence')}
            </div>
            <div className="text-stone-200 font-bold truncate mt-0.5" title={steamRichPresence ? t(steamRichPresence.ru, steamRichPresence.en) : ''}>
              {steamRichPresence
                ? t(steamRichPresence.ru, steamRichPresence.en)
                : t('Дарго 1845 • Диван-хана', 'Dargo 1845 • Divan-Khana')}
            </div>
          </div>
        </div>

        <div className="p-4 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-3">
          {steamAchievementsStatus.map((ach) => (
            <div
              key={ach.id}
              className={`p-3.5 rounded-xl border transition flex flex-col justify-between ${
                ach.unlocked
                  ? 'bg-emerald-950/25 border-emerald-500/50'
                  : 'bg-stone-900/90 border-stone-800 opacity-85'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-stone-800 text-amber-300">
                    {ach.id}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                      ach.unlocked
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-stone-800 text-stone-400'
                    }`}
                  >
                    {ach.unlocked ? t('✓ РАЗБЛОКИРОВАНО', '✓ UNLOCKED') : t('В ПРОЦЕССЕ', 'LOCKED')}
                  </span>
                </div>
                <h3 className="text-sm font-bold font-serif text-amber-200 mb-1">
                  {t(ach.titleRu, ach.titleEn)}
                </h3>
                <p className="text-xs text-stone-300 leading-relaxed mb-2">
                  {t(ach.descRu, ach.descEn)}
                </p>
              </div>
              <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between text-[10px] font-mono text-stone-400">
                <span className="truncate max-w-[260px]" title={t(ach.sourceRu, ach.sourceEn)}>
                  📜 {t(ach.sourceRu, ach.sourceEn)}
                </span>
                <span className="text-sky-300 font-bold">Steam: {ach.globalRatePct}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
