// Окно «AchievementsModal» — вынесено из App.jsx; все значения состояния и обработчики приходят через props

export default function AchievementsModal({
  setShowAchievementsModal,
  steamAchievementsStatus,
  t,
  unlockedAchievementsCount
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#131720] border border-amber-500/50 rounded-2xl max-w-4xl w-full max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-stone-800 flex flex-wrap items-center justify-between gap-2 bg-[#171c26]">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 block">
                  {t(
                    `Наградная летопись Диван-ханы • Открыто деяний: ${unlockedAchievementsCount}/12`,
                    `Divan-Khana Roll of Honour • Deeds Unlocked: ${unlockedAchievementsCount}/12`
                  )}
                </span>
                <h2 className="text-base sm:text-lg font-bold font-serif text-stone-100">
                  🏆 {t('Исторические достижения и подвиги кампании', 'Historical Campaign Achievements & Deeds')} ({unlockedAchievementsCount}/12)
                </h2>
              </div>
              <button
                onClick={() => setShowAchievementsModal(false)}
                className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 font-mono text-xs font-bold cursor-pointer"
              >
                {t('Закрыть ✕', 'Close ✕')}
              </button>
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
