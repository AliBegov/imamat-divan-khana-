// Окно «NextFestDemoOutroModal» — Финальный экран Steam Next Fest Playable Demo (Дарго 1845, 8 ходов + 1 засада)
// Спринт 12 (Фаза 6 / Gate 6): оценка полководца, перенос сейва в v1.0 и Wishlist CTA.

import { NEXT_FEST_DEMO_CONFIG } from '../../game/nextFestDemoEngine.js';

export default function NextFestDemoOutroModal({
  demoProgress,
  handleContinueFullVersionFromDemo,
  handleExportDemoCarryOverSave,
  handleOpenFeedbackFromDemo,
  handleOpenSteamWishlist,
  setShowNextFestOutroModal,
  t
}) {
  if (!demoProgress) return null;

  return (
    <div className="fixed inset-0 z-[75] bg-black/88 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#12100d] border-2 border-amber-400/75 rounded-2xl max-w-3xl w-full p-5 sm:p-6 shadow-2xl space-y-4 my-auto">
        {/* Шапка итога Демо */}
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-amber-500/25 pb-3.5">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/50 text-[10px] font-mono font-bold uppercase tracking-wider text-amber-300">
              🎮 STEAM NEXT FEST PLAYABLE DEMO • DARGO 1845 (8 TURNS)
            </span>
            <h2 className="mt-2 text-lg sm:text-2xl font-serif font-bold text-amber-100">
              {t('Итог Даргинского похода — Демо завершено!', 'Dargo Campaign Report — Next Fest Demo Complete!')}
            </h2>
            <p className="text-xs text-stone-300 mt-1">
              {t(
                'Ваш прогресс полностью совместим с полной версией v1.0 (3 кампании 1839–1849, 25 кубачинских орденов, 32 дилеммы, все 4 сезона).',
                'Your progress carries directly into the full v1.0 release (3 flagship campaigns 1839–1849, 25 Kubachi orders, 32 dilemmas, all 4 seasons).'
              )}
            </p>
          </div>
          <div className="shrink-0 text-center bg-gradient-to-b from-amber-500/25 to-amber-950/50 border border-amber-400/60 rounded-xl px-4 py-2">
            <div className="text-[9.5px] font-mono uppercase text-amber-300">{t('Ранг', 'Grade')}</div>
            <div className="text-3xl font-serif font-extrabold text-amber-200 leading-none mt-0.5">
              {demoProgress.commanderGrade}
            </div>
            <div className="text-[10px] font-mono text-stone-300 mt-1">{demoProgress.finalScore}/100</div>
          </div>
        </div>

        {/* Сводка звания и показателей кампании */}
        <div className="bg-[#181410] border border-amber-500/30 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-[10px] font-mono uppercase text-amber-400">
              {t('Присвоенный титул Диван-ханы', 'Divan-Khana Title Awarded')}
            </div>
            <div className="text-base font-serif font-bold text-stone-100">
              🦅 {t(demoProgress.rankTitleRu, demoProgress.rankTitleEn)}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-mono">
            <span className="px-2.5 py-1 rounded bg-stone-900 border border-stone-700 text-amber-200">
              {t('Ходов:', 'Turns:')} {demoProgress.clampedTurn}/{demoProgress.maxTurns}
            </span>
            <span className="px-2.5 py-1 rounded bg-stone-900 border border-stone-700 text-emerald-300">
              {t('Засада:', 'Ambush:')} {demoProgress.ambushCompleted ? '✓ 1/1' : '0/1'}
            </span>
            <span className="px-2.5 py-1 rounded bg-stone-900 border border-stone-700 text-sky-300">
              🏆 {t('Достижений:', 'Achievements:')} {demoProgress.unlockedAchievementsCount}/12
            </span>
          </div>
        </div>

        {/* 4 вехи Next Fest Demo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {demoProgress.milestones.map((m) => (
            <div
              key={m.id}
              className={`rounded-lg px-3 py-2 border text-xs flex items-center justify-between gap-2 ${
                m.done
                  ? 'bg-emerald-950/35 border-emerald-500/50 text-emerald-200'
                  : 'bg-[#171411] border-stone-800 text-stone-400'
              }`}
            >
              <span>{t(m.labelRu, m.labelEn)}</span>
              <span className="font-mono font-bold shrink-0">{m.done ? '✓' : '•'}</span>
            </div>
          ))}
        </div>

        {/* Главные действия конверсии: Wishlist, перенос сейва в v1.0, фидбек и продолжение в полную v1.0 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          <button
            type="button"
            onClick={handleOpenSteamWishlist}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-b from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-stone-950 font-serif font-extrabold text-sm shadow-lg cursor-pointer transition"
          >
            ⭐ {t('Добавить в список желаемого Steam (Wishlist)', 'Add to Steam Wishlist')}
          </button>

          <button
            type="button"
            onClick={handleExportDemoCarryOverSave}
            className="px-4 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/35 border border-emerald-400/60 text-emerald-200 font-mono text-xs font-bold cursor-pointer transition"
          >
            💾 {t('Сохранить прогресс для v1.0 (.imamat-save)', 'Export Save Carry-Over for v1.0 (.imamat-save)')}
          </button>

          <button
            type="button"
            onClick={handleContinueFullVersionFromDemo}
            className="px-4 py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/35 border border-sky-400/55 text-sky-200 font-serif text-xs font-bold cursor-pointer transition"
          >
            🦅 {t('Продолжить в полной версии v1.0 (без лимита 8 ходов)', 'Continue in Full v1.0 Edition (Unlock All Turns)')}
          </button>

          <button
            type="button"
            onClick={handleOpenFeedbackFromDemo}
            className="px-4 py-2 rounded-xl bg-[#1a1612] hover:bg-stone-800 border border-stone-700 text-stone-200 font-mono text-xs font-bold cursor-pointer transition"
          >
            💬 {t('Оценить Демо / Сообщить об идее', 'Rate Demo / Send Feedback')}
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-800 text-[10.5px] font-mono text-stone-400">
          <span>
            Steam Demo AppID {NEXT_FEST_DEMO_CONFIG.demoAppId} • {t('Перенос сейвов v1.0 активен', 'v1.0 Save Carry-Over Ready')}
          </span>
          <button
            type="button"
            onClick={() => setShowNextFestOutroModal(false)}
            className="px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 cursor-pointer"
          >
            ✕ {t('Закрыть', 'Close')}
          </button>
        </div>
      </div>
    </div>
  );
}
