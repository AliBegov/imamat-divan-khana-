// ============================================================================
// ИНФРАСТРУКТУРА «СЛЕПЫХ» ПЛЕЙТЕСТОВ ВОЛН 1–2 (Спринт 9 — Фаза 5)
// Кнопка репорта багов/идей (GitHub Issue + Markdown + JSON) + воронка первых 5 ходов.
// Чистый ES-модуль без React/DOM: 100% покрыт юнит-тестами.
// ============================================================================

export const PLAYTEST_BUILD_TAG = '0.9.0-Playtest-Wave1-2';
export const PLAYTEST_REPO_SLUG = 'AliBegov/imamat-divan-khana-';
export const FEEDBACK_STORAGE_KEY = 'imamat_playtest_feedback_v1';
export const FUNNEL_STORAGE_KEY = 'imamat_playtest_funnel_v1';

export const FEEDBACK_CATEGORIES = [
  {
    id: 'bug',
    icon: '🐞',
    labelRu: 'Баг / ошибка',
    labelEn: 'Bug / Glitch',
    githubLabel: 'bug,playtest-wave1'
  },
  {
    id: 'ux_clarity',
    icon: '🧭',
    labelRu: 'Непонятно (0–5 мин)',
    labelEn: 'Unclear (First 5 Min)',
    githubLabel: 'ux,onboarding,playtest-wave1'
  },
  {
    id: 'balance',
    icon: '⚖️',
    labelRu: 'Баланс и сложность',
    labelEn: 'Balance & Pacing',
    githubLabel: 'balance,playtest-wave1'
  },
  {
    id: 'idea',
    icon: '💡',
    labelRu: 'Идея / улучшение',
    labelEn: 'Idea / Suggestion',
    githubLabel: 'enhancement,playtest-wave1'
  }
];

export const FEEDBACK_SEVERITIES = [
  { id: 'minor', labelRu: 'Мелочь / косметика', labelEn: 'Minor / Polish' },
  { id: 'major', labelRu: 'Мешает играть', labelEn: 'Major / Friction' },
  { id: 'blocker', labelRu: 'Критичный блокер', labelEn: 'Critical Blocker' }
];

export const FIRST_5_TURNS_MILESTONES = [
  {
    id: 'm1_first_recon',
    shortRu: 'Разведка',
    shortEn: 'Recon',
    hintRu: 'Поднимите разведку кунаков или осмотрите угрозу на 3D-карте.',
    hintEn: 'Reveal threats via Kunak scouts or inspect the 3D Caucasus map.'
  },
  {
    id: 'm2_first_order',
    shortRu: 'Первый приказ',
    shortEn: 'First Order',
    hintRu: 'Отправьте гонца наибу или перережьте обоз вражеской колонны.',
    hintEn: 'Dispatch an envoy to a Naib or cut an Imperial supply convoy.'
  },
  {
    id: 'm3_first_turn_end',
    shortRu: '1-й сезон (Ход 2)',
    shortEn: 'Turn 2 Reached',
    hintRu: 'Нажмите «Завершить ход» (Enter), чтобы увидеть ответ Кавказского корпуса.',
    hintEn: 'Press End Turn (Enter) to watch the Caucasus Corps respond.'
  },
  {
    id: 'm4_politics_or_dilemma',
    shortRu: 'Дилемма / Орден',
    shortEn: 'Dilemma / Order',
    hintRu: 'Решите сургучный пакет Диван-ханы, примите Низам или жалуйте орден.',
    hintEn: 'Resolve a Divan-Khana dilemma, enact a Nizam, or bestow an order.'
  },
  {
    id: 'm5_turn5_survived',
    shortRu: '5 ходов пройдено!',
    shortEn: '5 Turns Cleared!',
    hintRu: 'Доведите кампанию до 5-го хода и оцените впечатления в форме отзыва.',
    hintEn: 'Reach Turn 5 and share a 20-second blind playtest impression.'
  }
];

export function computeFirst5TurnsFunnel({
  turn = 1,
  reconActivated = false,
  envoysSentCount = 0,
  convoyCutOrBattleDone = false,
  resolvedDilemmasCount = 0,
  enactedNizamsCount = 1,
  ordersAwardedCount = 0,
  sessionStartMs = 0,
  nowMs = Date.now()
} = {}) {
  const m1 = Boolean(reconActivated || turn >= 2);
  const m2 = Boolean(envoysSentCount > 0 || convoyCutOrBattleDone || turn >= 2);
  const m3 = Boolean(turn >= 2);
  const m4 = Boolean(resolvedDilemmasCount > 0 || enactedNizamsCount > 1 || ordersAwardedCount > 0);
  const m5 = Boolean(turn >= 5);

  const flags = {
    m1_first_recon: m1,
    m2_first_order: m2,
    m3_first_turn_end: m3,
    m4_politics_or_dilemma: m4,
    m5_turn5_survived: m5
  };

  const steps = FIRST_5_TURNS_MILESTONES.map((m) => ({
    ...m,
    done: Boolean(flags[m.id])
  }));
  const completedCount = steps.filter((s) => s.done).length;
  const nextStep = steps.find((s) => !s.done) || null;
  const elapsedSec =
    sessionStartMs > 0 && nowMs >= sessionStartMs ? Math.round((nowMs - sessionStartMs) / 1000) : 0;

  return {
    steps,
    flags,
    completedCount,
    totalCount: steps.length,
    progressPct: Math.round((completedCount / steps.length) * 100),
    reachedTurn5: m5,
    allOnboardingDone: completedCount === steps.length,
    nextHintRu: nextStep
      ? nextStep.hintRu
      : 'Отлично! Вы прошли первые 5 ходов — нажмите «💬 Отзыв / Баг», чтобы поделиться впечатлением.',
    nextHintEn: nextStep
      ? nextStep.hintEn
      : 'Great job! You cleared the first 5 turns — click “💬 Feedback / Bug” to share your notes.',
    sessionDurationSec: elapsedSec,
    sessionDurationMin: Number((elapsedSec / 60).toFixed(1))
  };
}

export function buildPlaytestBugReportSnapshot({
  category = 'bug',
  severity = 'minor',
  summary = '',
  details = '',
  ratingClarity = 4,
  ratingFun = 4,
  lang = 'ru',
  activeTab = 'map',
  activeScenarioId = 'camp_1845',
  turn = 1,
  resources = {},
  naibates = [],
  delayedConsequences = [],
  resolvedPacketIds = [],
  funnel = null,
  lastActionLatencyMs = null,
  recentErrors = [],
  viewport = null,
  createdAtIso = new Date().toISOString()
} = {}) {
  const cat = FEEDBACK_CATEGORIES.find((c) => c.id === category) || FEEDBACK_CATEGORIES[0];
  const sev = FEEDBACK_SEVERITIES.find((s) => s.id === severity) || FEEDBACK_SEVERITIES[0];
  const siegesCount = (naibates || []).filter((n) => n.underSiege).length;
  const cleanSummary = String(summary || '').trim();
  const cleanDetails = String(details || '').trim();

  return {
    id: `fb-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`,
    buildVersion: PLAYTEST_BUILD_TAG,
    createdAtIso,
    category: cat.id,
    categoryLabelRu: cat.labelRu,
    categoryLabelEn: cat.labelEn,
    githubLabels: cat.githubLabel,
    severity: sev.id,
    summary:
      cleanSummary ||
      (lang === 'en' ? `${cat.labelEn} on Turn ${turn}` : `${cat.labelRu} на Ходе ${turn}`),
    details: cleanDetails,
    ratings: {
      first5MinClarity: Math.max(1, Math.min(5, Number(ratingClarity) || 4)),
      funAndImmersion: Math.max(1, Math.min(5, Number(ratingFun) || 4))
    },
    context: {
      lang,
      scenarioId: activeScenarioId,
      turn,
      activeTab,
      siegesCount,
      resources: {
        gunpowder: resources.gunpowder ?? 0,
        provisions: resources.provisions ?? 0,
        silver: resources.silver ?? 0,
        authority: resources.authority ?? 0,
        ottomanSupport: resources.ottomanSupport ?? 0
      },
      dilemmasResolved: Array.isArray(resolvedPacketIds) ? resolvedPacketIds.length : 0,
      delayedEchoesQueued: Array.isArray(delayedConsequences) ? delayedConsequences.length : 0,
      funnelCompleted: funnel ? `${funnel.completedCount}/${funnel.totalCount}` : '0/5',
      reachedTurn5: Boolean(funnel?.reachedTurn5),
      sessionDurationMin: funnel?.sessionDurationMin ?? 0,
      lastActionLatencyMs: lastActionLatencyMs ?? null,
      viewport: viewport || null,
      runtimeErrorsCount: Array.isArray(recentErrors) ? recentErrors.length : 0,
      recentErrors: Array.isArray(recentErrors) ? recentErrors.slice(-5) : []
    }
  };
}

export function formatPlaytestReportMarkdown(report) {
  if (!report) return '';
  const ctx = report.context || {};
  const res = ctx.resources || {};
  const errBlock =
    ctx.recentErrors && ctx.recentErrors.length > 0
      ? `\n### Runtime Errors (${ctx.runtimeErrorsCount})\n\`\`\`\n${ctx.recentErrors.join('\n')}\n\`\`\`\n`
      : '\n- Runtime JS Errors: `0`\n';

  return [
    `## [${report.category.toUpperCase()} | ${report.severity}] ${report.summary}`,
    '',
    report.details ? report.details : '_No extra details provided._',
    '',
    '### First-5-Min Ratings',
    `- Clarity (0–5 min): **${report.ratings?.first5MinClarity ?? 4}/5**`,
    `- Fun & Immersion: **${report.ratings?.funAndImmersion ?? 4}/5**`,
    '',
    '### Auto-Captured Playtest Snapshot',
    `- Build: \`${report.buildVersion}\` | Lang: \`${ctx.lang}\``,
    `- Scenario: \`${ctx.scenarioId}\` | Turn: **${ctx.turn}** | Tab: \`${ctx.activeTab}\` | Sieges: **${ctx.siegesCount}**`,
    `- Resources: Powder \`${res.gunpowder}\` | Provisions \`${res.provisions}\` | Silver \`${res.silver}\` | Auth \`${res.authority}%\``,
    `- Onboarding Funnel (5 Turns): **${ctx.funnelCompleted}** (Turn 5+: \`${ctx.reachedTurn5}\`) | Session: \`${ctx.sessionDurationMin} min\``,
    `- Dilemmas Resolved: \`${ctx.dilemmasResolved}\` | Pending Delayed Echoes: \`${ctx.delayedEchoesQueued}\` | UI Latency: \`${ctx.lastActionLatencyMs ?? '<5'} ms\``,
    ctx.viewport ? `- Viewport: \`${ctx.viewport.width}x${ctx.viewport.height}\` (DPR ${ctx.viewport.dpr || 1})` : '',
    errBlock
  ]
    .filter((line) => line !== undefined)
    .join('\n')
    .trim();
}

export function buildGitHubIssuePrefillUrl(report, repoSlug = PLAYTEST_REPO_SLUG) {
  const title = `[Playtest ${report?.category || 'feedback'}] ${report?.summary || 'Imamat Playtest Report'}`.slice(
    0,
    120
  );
  const body = formatPlaytestReportMarkdown(report).slice(0, 2600);
  const labels = report?.githubLabels || 'playtest-wave1';
  const params = new URLSearchParams({
    title,
    labels,
    body
  });
  return `https://github.com/${repoSlug}/issues/new?${params.toString()}`;
}

export function loadLocalFeedbackReports(storage = null) {
  const store =
    storage || (typeof globalThis !== 'undefined' && globalThis.localStorage ? globalThis.localStorage : null);
  if (!store) return [];
  try {
    const raw = store.getItem(FEEDBACK_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLocalFeedbackReport(report, storage = null) {
  const existing = loadLocalFeedbackReports(storage);
  const next = [report, ...existing].slice(0, 30);
  const store =
    storage || (typeof globalThis !== 'undefined' && globalThis.localStorage ? globalThis.localStorage : null);
  if (store) {
    try {
      store.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Безопасное игнорирование квоты localStorage
    }
  }
  return next;
}

export function evaluateWaveReadiness(reports = []) {
  const list = Array.isArray(reports) ? reports : [];
  const total = list.length;
  if (total === 0) {
    return {
      totalReports: 0,
      blockerCount: 0,
      turn5CompletionPct: 0,
      avgClarity: 0,
      avgFun: 0,
      avgSessionMin: 0
    };
  }
  const blockerCount = list.filter((r) => r.severity === 'blocker').length;
  const reached5 = list.filter((r) => r.context?.reachedTurn5).length;
  const avgClarity =
    list.reduce((s, r) => s + (r.ratings?.first5MinClarity ?? 4), 0) / total;
  const avgFun =
    list.reduce((s, r) => s + (r.ratings?.funAndImmersion ?? 4), 0) / total;
  const avgSessionMin =
    list.reduce((s, r) => s + (r.context?.sessionDurationMin ?? 0), 0) / total;

  return {
    totalReports: total,
    blockerCount,
    turn5CompletionPct: Number(((reached5 / total) * 100).toFixed(1)),
    avgClarity: Number(avgClarity.toFixed(2)),
    avgFun: Number(avgFun.toFixed(2)),
    avgSessionMin: Number(avgSessionMin.toFixed(1))
  };
}
