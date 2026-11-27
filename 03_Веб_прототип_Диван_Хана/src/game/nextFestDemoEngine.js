// ============================================================================
// ДВИЖОК ПУБЛИЧНОГО ДЕМО STEAM NEXT FEST И ВАЛИДАТОР QUALITY GATE 6 (v1.0)
// Спринт 12 (Фаза 6): Дарго 1845 (8 ходов + 1 лесная засада Ичкерии),
// перенос прогресса (.imamat-save carry-over) и финальный сертификат v1.0.
// ============================================================================

import { STEAM_PLAYTEST_APP_ID, STEAM_STORE_URL } from './steamworksBridge.js';

export const NEXT_FEST_DEMO_CONFIG = {
  demoAppId: STEAM_PLAYTEST_APP_ID,
  releaseVersion: '1.0.0',
  scenarioId: 'camp_1845',
  scenarioTitleRu: 'Дарго 1845: «Сухарная экспедиция»',
  scenarioTitleEn: 'Dargo 1845: “The Biscuit Expedition”',
  maxTurns: 8,
  includedAmbushId: 'dargo_1845_forest_ambush',
  includedAmbushTitleRu: 'Лесная засада на хребте Речель (Ичкерия)',
  includedAmbushTitleEn: 'Beech Forest Ambush on Rechel Ridge (Ichkeria)',
  wishlistTargetMin: 5000,
  wishlistTargetStretch: 10000,
  positiveRatingTargetPct: 85,
  storeUrl: STEAM_STORE_URL
};

export function detectNextFestDemoMode(searchString = '', steamAppId = null) {
  if (Number(steamAppId) === NEXT_FEST_DEMO_CONFIG.demoAppId) return true;
  const query = String(
    searchString || (typeof globalThis !== 'undefined' && globalThis.location ? globalThis.location.search : '')
  ).toLowerCase();
  return query.includes('demo=nextfest') || query.includes('mode=demo') || query.includes('nextfest=1');
}

export function evaluateNextFestDemoProgress({
  demoActive = false,
  turn = 1,
  ambushCompleted = false,
  envoysSentCount = 0,
  ordersAwardedCount = 0,
  resolvedDilemmasCount = 0,
  authority = 80,
  naibates = [],
  unlockedAchievementsCount = 0
} = {}) {
  const safeTurn = Math.max(1, Number(turn) || 1);
  const clampedTurn = Math.min(NEXT_FEST_DEMO_CONFIG.maxTurns, safeTurn);
  const turnsRemaining = Math.max(0, NEXT_FEST_DEMO_CONFIG.maxTurns - safeTurn + 1);
  const demoComplete = Boolean(demoActive && safeTurn > NEXT_FEST_DEMO_CONFIG.maxTurns);

  const besiegedCount = (naibates || []).filter((n) => n.underSiege).length;
  const totalGarrison = (naibates || []).reduce((acc, n) => acc + (n.garrison || 0) + (n.murtazeks || 0), 0);

  const milestones = [
    {
      id: 'demo_orders',
      done: envoysSentCount > 0 || safeTurn >= 2,
      labelRu: 'Отдать приказы наибам на 3D-карте',
      labelEn: 'Dispatch Naib orders on the 3D War Table'
    },
    {
      id: 'demo_ambush',
      done: Boolean(ambushCompleted),
      labelRu: 'Провести лесную засаду на хребте Речель (1/1)',
      labelEn: 'Fight the Beech Forest Ambush on Rechel Ridge (1/1)'
    },
    {
      id: 'demo_politics',
      done: ordersAwardedCount > 0 || resolvedDilemmasCount > 0,
      labelRu: 'Решить дилемму Диван-ханы или жаловать орден',
      labelEn: 'Resolve a Divan-Khana dilemma or bestow a Kubachi order'
    },
    {
      id: 'demo_turn8',
      done: safeTurn >= NEXT_FEST_DEMO_CONFIG.maxTurns,
      labelRu: 'Удержать Имамат до исхода 8-го хода Демо',
      labelEn: 'Hold the Imamate through Turn 8 of the Demo'
    }
  ];

  const completedMilestones = milestones.filter((m) => m.done).length;
  const scorePoints =
    Math.min(40, Math.round((Number(authority) || 0) * 0.4)) +
    (ambushCompleted ? 25 : 0) +
    Math.min(15, (ordersAwardedCount + resolvedDilemmasCount) * 5) +
    Math.min(20, Math.round((clampedTurn / NEXT_FEST_DEMO_CONFIG.maxTurns) * 20)) -
    Math.min(15, besiegedCount * 3);

  const finalScore = Math.max(10, Math.min(100, scorePoints));
  let commanderGrade = 'C';
  let rankTitleRu = 'Наиб передового заслона';
  let rankTitleEn = 'Vanguard Naib';
  if (finalScore >= 85) {
    commanderGrade = 'S';
    rankTitleRu = 'Мудир Даргинской победы';
    rankTitleEn = 'Mudir of the Dargo Victory';
  } else if (finalScore >= 68) {
    commanderGrade = 'A';
    rankTitleRu = 'Полководец Ичкерии';
    rankTitleEn = 'Commander of Ichkeria';
  } else if (finalScore >= 50) {
    commanderGrade = 'B';
    rankTitleRu = 'Хранитель горных перевалов';
    rankTitleEn = 'Warden of the Mountain Passes';
  }

  return {
    demoActive: Boolean(demoActive),
    currentTurn: safeTurn,
    clampedTurn,
    maxTurns: NEXT_FEST_DEMO_CONFIG.maxTurns,
    turnsRemaining,
    demoComplete,
    ambushCompleted: Boolean(ambushCompleted),
    milestones,
    completedMilestones,
    totalMilestones: milestones.length,
    progressPct: Math.round((completedMilestones / milestones.length) * 100),
    commanderGrade,
    finalScore,
    rankTitleRu,
    rankTitleEn,
    totalGarrison,
    besiegedCount,
    unlockedAchievementsCount: Number(unlockedAchievementsCount) || 0
  };
}

export function tagDemoSaveForFullVersionCarryOver(savePayload, now = new Date()) {
  if (!savePayload || typeof savePayload !== 'object') return null;
  const iso = now instanceof Date ? now.toISOString() : new Date(now).toISOString();
  return {
    ...savePayload,
    demoCarryOver: true,
    demoSource: 'steam_next_fest_dargo_1845_8turns',
    carryOverCompatibleWith: 'v1.0',
    carryOverExportedIso: iso
  };
}

export function evaluateGate6LaunchReadiness(metrics = {}) {
  const checks = [
    { id: 'unit_tests', labelRu: 'Модульные тесты ядра (≥96 PASS)', labelEn: 'Core unit test suite (≥96 PASS)', ok: (metrics.unitTestsPassed || 0) >= 96 && metrics.unitTestsPassed === metrics.unitTestsTotal },
    { id: 'eslint_clean', labelRu: 'ESLint 0 ошибок / 0 предупреждений', labelEn: 'ESLint 0 errors / 0 warnings', ok: (metrics.eslintErrors ?? 1) === 0 },
    { id: 'chrome_runtime', labelRu: '0 JS/WebGL2 ошибок в живом Chrome', labelEn: '0 JS/WebGL2 runtime errors in Chrome', ok: (metrics.chromeJsErrors ?? 1) === 0 },
    { id: 'l10n_zero_leaks', labelRu: '0 утечек кириллицы в EN-локализации', labelEn: '0 Cyrillic leaks in EN localization', ok: (metrics.enCyrillicLeaks ?? 1) === 0 },
    { id: 'resolution_matrix', labelRu: 'Матрица Steam Deck 1280×800 → 4K UHD', labelEn: 'Steam Deck 1280×800 → 4K UHD matrix', ok: Boolean(metrics.resolutionMatrixPass) },
    { id: 'steam_capsules', labelRu: '7 капсул Valve Store Review + 5×1080p', labelEn: '7 Valve Store Review capsules + 5×1080p', ok: Boolean(metrics.steamCapsulesValid) },
    { id: 'steam_vdfs', labelRu: '7 манифестов Steamworks VDF + Auto-Cloud', labelEn: '7 Steamworks VDFs + Auto-Cloud rules', ok: Boolean(metrics.steamVdfsReady) },
    { id: 'desktop_mac', labelRu: 'Подписанный нативный macOS .app (arm64)', labelEn: 'Signed native macOS .app (arm64)', ok: Boolean(metrics.desktopMacReady) },
    { id: 'desktop_win', labelRu: 'Портативный пакет Windows + Electron IPC', labelEn: 'Windows Portable + Electron Steamworks IPC', ok: Boolean(metrics.desktopWinReady) },
    { id: 'trailer_60s', labelRu: '60-сек геймплейный трейлер 1080p MP4', labelEn: '60s 1080p H.264/AAC gameplay trailer', ok: Boolean(metrics.trailer60sReady) },
    { id: 'nextfest_demo', labelRu: 'Steam Next Fest Playable Demo (8 ходов + засада)', labelEn: 'Steam Next Fest Playable Demo (8 turns + ambush)', ok: Boolean(metrics.nextFestDemoReady) },
    { id: 'creator_playbook', labelRu: 'Плейбук Next Fest, стримеры и v1.0 Launch Kit', labelEn: 'Next Fest Playbook, Creator Outreach & v1.0 Kit', ok: Boolean(metrics.creatorKitReady) }
  ];

  const passedCount = checks.filter((c) => c.ok).length;
  return {
    checks,
    passedCount,
    totalCount: checks.length,
    pass: passedCount === checks.length,
    verdict: passedCount === checks.length ? 'GATE_6_PASS_V1_LAUNCH_READY' : 'GATE_6_INCOMPLETE'
  };
}
