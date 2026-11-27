// Окно «PlaytestFeedbackModal» — Встроенный репорт багов и идей для «слепых» плейтестов (Спринт 9 — Фаза 5)
import { useMemo, useState } from 'react';
import {
  FEEDBACK_CATEGORIES,
  FEEDBACK_SEVERITIES,
  PLAYTEST_BUILD_TAG,
  buildGitHubIssuePrefillUrl,
  buildPlaytestBugReportSnapshot,
  formatPlaytestReportMarkdown
} from '../../game/playtestFeedbackEngine.js';
import { Bug, CheckCircle2, ClipboardCopy, Download, ExternalLink, MessageSquarePlus, Star, X } from 'lucide-react';

export default function PlaytestFeedbackModal({
  activeScenarioId,
  activeTab,
  delayedConsequences = [],
  first5TurnsFunnel,
  lang,
  lastActionLatencyMs,
  localFeedbackReports = [],
  naibates = [],
  onSaveFeedbackReport,
  recentRuntimeErrors = [],
  resolvedPacketIds = [],
  resources = {},
  setShowPlaytestFeedbackModal,
  t,
  turn = 1
}) {
  const [category, setCategory] = useState('bug');
  const [severity, setSeverity] = useState('minor');
  const [summary, setSummary] = useState('');
  const [details, setDetails] = useState('');
  const [ratingClarity, setRatingClarity] = useState(5);
  const [ratingFun, setRatingFun] = useState(5);
  const [statusNote, setStatusNote] = useState('');

  const draftSnapshot = useMemo(
    () =>
      buildPlaytestBugReportSnapshot({
        category,
        severity,
        summary,
        details,
        ratingClarity,
        ratingFun,
        lang,
        activeTab,
        activeScenarioId,
        turn,
        resources,
        naibates,
        delayedConsequences,
        resolvedPacketIds,
        funnel: first5TurnsFunnel,
        lastActionLatencyMs,
        recentErrors: recentRuntimeErrors,
        viewport:
          typeof window !== 'undefined'
            ? { width: window.innerWidth, height: window.innerHeight, dpr: window.devicePixelRatio || 1 }
            : null
      }),
    [
      category,
      severity,
      summary,
      details,
      ratingClarity,
      ratingFun,
      lang,
      activeTab,
      activeScenarioId,
      turn,
      resources,
      naibates,
      delayedConsequences,
      resolvedPacketIds,
      first5TurnsFunnel,
      lastActionLatencyMs,
      recentRuntimeErrors
    ]
  );

  const commitLocalReport = (msgRu, msgEn) => {
    if (onSaveFeedbackReport) onSaveFeedbackReport(draftSnapshot);
    setStatusNote(t(msgRu, msgEn));
  };

  const handleOpenGitHubIssue = () => {
    commitLocalReport(
      'Отчёт сохранён локально и подготовлен для отправки в GitHub Issues!',
      'Report saved locally and opened as a pre-filled GitHub Issue!'
    );
    const url = buildGitHubIssuePrefillUrl(draftSnapshot);
    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleCopyMarkdown = async () => {
    const md = formatPlaytestReportMarkdown(draftSnapshot);
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(md);
      }
      commitLocalReport(
        'Готовый Markdown-отчёт скопирован в буфер — вставьте в Telegram / Discord!',
        'Formatted Markdown report copied to clipboard — paste into Telegram / Discord!'
      );
    } catch {
      commitLocalReport(
        'Отчёт сохранён локально в журнале плейтеста.',
        'Report saved to your local playtest journal.'
      );
    }
  };

  const handleDownloadJson = () => {
    commitLocalReport(
      'JSON-пакет плейтеста с телеметрией сохранён на диск!',
      'Playtest JSON package with telemetry downloaded!'
    );
    const blob = new Blob([JSON.stringify(draftSnapshot, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Imamat_Playtest_Report_Turn${turn}_${draftSnapshot.category}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/84 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={() => setShowPlaytestFeedbackModal(false)}
    >
      <div
        className="bg-[#141210] border border-amber-500/55 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-amber-500/25 flex flex-wrap items-center justify-between gap-2 bg-[#1c1610]">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 block">
              {t(
                `СЛЕПОЙ ПЛЕЙТЕСТ • ВОЛНЫ 1–2 • СБОРКА ${PLAYTEST_BUILD_TAG}`,
                `BLIND PLAYTEST • WAVES 1–2 • BUILD ${PLAYTEST_BUILD_TAG}`
              )}
            </span>
            <h2 className="text-base sm:text-lg font-bold font-serif text-amber-100 flex items-center gap-2">
              <MessageSquarePlus className="w-5 h-5 text-amber-400 shrink-0" />
              <span>{t('Сообщить о баге или предложить идею', 'Report a Bug or Share an Idea')}</span>
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setShowPlaytestFeedbackModal(false)}
            className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto space-y-4 text-xs">
          {/* Живая воронка первых 5 ходов и автоснимок состояния партии */}
          <div className="rounded-xl bg-[#0d1015] border border-stone-800 p-3 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px]">
              <span className="text-amber-300 font-bold">
                🧭 {t('Воронка первых 5 ходов:', 'First-5-Turns Funnel:')}{' '}
                {first5TurnsFunnel?.completedCount ?? 0}/{first5TurnsFunnel?.totalCount ?? 5} ({first5TurnsFunnel?.progressPct ?? 0}%)
              </span>
              <span className="text-stone-400">
                {t('Сценарий:', 'Scenario:')} <b className="text-stone-200">{activeScenarioId}</b> • {t('Ход', 'Turn')}{' '}
                <b className="text-amber-200">{turn}</b> • JS-{t('ошибок', 'errors')}:{' '}
                <b className={recentRuntimeErrors.length === 0 ? 'text-emerald-300' : 'text-rose-400'}>
                  {recentRuntimeErrors.length}
                </b>
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
              {(first5TurnsFunnel?.steps || []).map((st, idx) => (
                <div
                  key={st.id}
                  className={`px-2 py-1 rounded-lg border font-mono text-[10px] flex items-center gap-1 ${
                    st.done
                      ? 'bg-emerald-950/60 border-emerald-500/45 text-emerald-200'
                      : 'bg-stone-900/90 border-stone-800 text-stone-400'
                  }`}
                >
                  <span>{st.done ? '✓' : `${idx + 1}.`}</span>
                  <span className="truncate">{t(st.shortRu, st.shortEn)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Выбор категории и критичности */}
          <div className="space-y-2">
            <div className="font-mono text-[10.5px] uppercase text-stone-400 font-bold">
              {t('1. Тип наблюдения', '1. Report Category')}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {FEEDBACK_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`px-2.5 py-2 rounded-xl border font-serif font-bold text-xs cursor-pointer transition text-left ${
                    category === cat.id
                      ? 'bg-amber-500/25 border-amber-400 text-amber-100 shadow'
                      : 'bg-stone-900/80 border-stone-800 text-stone-300 hover:border-amber-500/50'
                  }`}
                >
                  {cat.icon} {t(cat.labelRu, cat.labelEn)}
                </button>
              ))}
            </div>

            {category === 'bug' && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] font-mono text-stone-400">{t('Важность:', 'Severity:')}</span>
                {FEEDBACK_SEVERITIES.map((sev) => (
                  <button
                    key={sev.id}
                    type="button"
                    onClick={() => setSeverity(sev.id)}
                    className={`px-2.5 py-1 rounded-lg border font-mono text-[10.5px] cursor-pointer ${
                      severity === sev.id
                        ? sev.id === 'blocker'
                          ? 'bg-rose-600 text-white border-rose-400 font-bold'
                          : 'bg-amber-500 text-stone-950 border-amber-300 font-bold'
                        : 'bg-stone-900 border-stone-700 text-stone-300'
                    }`}
                  >
                    {t(sev.labelRu, sev.labelEn)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Оценка первых 5 минут (Gate 5 KPI) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                labelRu: 'Понятность первых 5 минут',
                labelEn: 'First 5 Minutes Clarity',
                val: ratingClarity,
                setVal: setRatingClarity
              },
              {
                labelRu: 'Увлекательность и атмосфера',
                labelEn: 'Fun & Atmosphere',
                val: ratingFun,
                setVal: setRatingFun
              }
            ].map((row) => (
              <div
                key={row.labelEn}
                className="rounded-xl bg-stone-900/90 border border-stone-800 px-3 py-2 flex items-center justify-between gap-2"
              >
                <span className="font-serif text-stone-200 font-bold text-[11.5px]">
                  {t(row.labelRu, row.labelEn)}
                </span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => row.setVal(n)}
                      aria-label={`${row.labelEn} ${n}/5`}
                      className="p-0.5 cursor-pointer"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          n <= row.val ? 'fill-amber-400 text-amber-400' : 'text-stone-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Текст отзыва */}
          <div className="space-y-2">
            <input
              type="text"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder={t(
                'Короткий заголовок (например: «Не сразу понял, как снять осаду с Гергебиля»)',
                'Short headline (e.g. “Took a moment to spot how to lift the siege of Gergebil”)'
              )}
              className="w-full px-3 py-2 rounded-xl bg-[#0b0d11] border border-stone-700 focus:border-amber-400 text-stone-100 text-xs focus:outline-none"
            />
            <textarea
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder={t(
                'Что произошло или что хотелось бы улучшить? Авто-снимок сценария, хода, ресурсов и ошибок прикрепится автоматически.',
                'What happened or what would feel better? Scenario, turn, resources, funnel & error logs attach automatically.'
              )}
              className="w-full px-3 py-2 rounded-xl bg-[#0b0d11] border border-stone-700 focus:border-amber-400 text-stone-100 text-xs focus:outline-none resize-none"
            />
          </div>

          {/* 3 способа мгновенной отправки (работают без бэкенда прямо с GitHub Pages) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={handleOpenGitHubIssue}
              className="px-3 py-2.5 rounded-xl bg-gradient-to-b from-amber-400 to-amber-600 hover:brightness-110 text-stone-950 font-serif font-extrabold flex items-center justify-center gap-1.5 cursor-pointer shadow"
            >
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              <span>{t('Отправить в GitHub Issue', 'Submit via GitHub Issue')}</span>
            </button>
            <button
              type="button"
              onClick={handleCopyMarkdown}
              className="px-3 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/35 border border-emerald-400/60 text-emerald-200 font-serif font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ClipboardCopy className="w-3.5 h-3.5 shrink-0" />
              <span>{t('Копировать для чата', 'Copy for Telegram / Chat')}</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadJson}
              className="px-3 py-2.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/30 border border-sky-400/50 text-sky-200 font-serif font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 shrink-0" />
              <span>{t('Скачать .json пакет', 'Download .json Bundle')}</span>
            </button>
          </div>

          {statusNote && (
            <div className="rounded-xl bg-emerald-950/70 border border-emerald-500/50 px-3 py-2 text-emerald-200 font-mono text-[11px] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{statusNote}</span>
            </div>
          )}

          {/* Журнал локальных заметок сессии */}
          {localFeedbackReports.length > 0 && (
            <div className="rounded-xl bg-stone-950/80 border border-stone-800 p-3 space-y-1.5">
              <div className="text-[10.5px] font-mono uppercase text-stone-400 font-bold flex items-center gap-1.5">
                <Bug className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  {t(
                    `Сохранённые заметки этого плейтеста (${localFeedbackReports.length})`,
                    `Saved Playtest Notes (${localFeedbackReports.length})`
                  )}
                </span>
              </div>
              <div className="space-y-1 max-h-28 overflow-y-auto">
                {localFeedbackReports.slice(0, 5).map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between gap-2 text-[11px] font-mono text-stone-300 bg-stone-900/70 rounded-lg px-2.5 py-1"
                  >
                    <span className="truncate">
                      [{r.category}] {r.summary}
                    </span>
                    <span className="text-amber-300 shrink-0">
                      {t('Ход', 'T')} {r.context?.turn ?? 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
