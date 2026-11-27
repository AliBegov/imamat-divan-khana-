// ============================================================================
// ЧИСТЫЙ ДВИЖОК РАЗВЕДКИ, ТУМАНА ВОЙНЫ И ЧИТАЕМОГО ИИ (Спринт 6 — Фаза 3)
// Нулевая зависимость от React/DOM/Three.js: детерминируемые расчёты видимости
// за горными перевалами, сети кунаков, маяков и векторов намерений генералов РИ.
// ============================================================================

export const NORTHERN_FOG_PASSES = [
  {
    id: 'pass_sunzha_groznaya',
    nameRu: 'Сунженский кордон (Грозная)',
    nameEn: 'Sunzha Cordon (Groznaya)',
    x: 132,
    y: 66,
    radius: 76
  },
  {
    id: 'pass_kachkalyk_ridge',
    nameRu: 'Хребет Качкалык',
    nameEn: 'Kachkalyk Ridge',
    x: 248,
    y: 82,
    radius: 74
  },
  {
    id: 'pass_vnezapnaya_andi',
    nameRu: 'Подступы кр. Внезапной',
    nameEn: 'Fort Vnezapnaya Approaches',
    x: 362,
    y: 86,
    radius: 82
  },
  {
    id: 'pass_salatau_plateau',
    nameRu: 'Перевал Салатау',
    nameEn: 'Salatau Mountain Pass',
    x: 452,
    y: 102,
    radius: 78
  },
  {
    id: 'pass_sulak_shura',
    nameRu: 'Сулакский тракт (Шура)',
    nameEn: 'Sulak Road (Temir-Khan-Shura)',
    x: 545,
    y: 94,
    radius: 84
  },
  {
    id: 'pass_caspian_flank',
    nameRu: 'Прикаспийский фланг',
    nameEn: 'Caspian Foothills Flank',
    x: 615,
    y: 148,
    radius: 76
  }
];

/**
 * Собирает единый список всех источников разведки Имамата на карте:
 * столица, наибства, конные сотни, мухтасибы, зажжённые маяки и активные сети кунаков.
 */
export function buildReconSources({
  naibates = [],
  liveFieldUnits = [],
  liveMuhtasibPatrols = [],
  signalBeacons = [],
  kunakSpyRings = []
} = {}) {
  const sources = [
    { x: 225, y: 195, r: 86, kind: 'capital', labelRu: 'Дарго-Ведено', labelEn: 'Dargo-Vedeno' }
  ];

  (naibates || []).forEach((n) => {
    if (n?.coords) {
      sources.push({
        x: n.coords.x,
        y: n.coords.y,
        r: 66,
        kind: 'naibate',
        id: n.id,
        labelRu: n.name,
        labelEn: n.nameEn || n.name
      });
    }
  });

  (liveFieldUnits || []).forEach((u) => {
    if (Number.isFinite(u?.x) && Number.isFinite(u?.y)) {
      sources.push({
        x: u.x,
        y: u.y,
        r: u.id === 'unit_chapar_vedeno' ? 92 : 76,
        kind: 'cavalry',
        id: u.id,
        labelRu: u.badgeRu || u.nameRu || 'Разъезд',
        labelEn: u.badgeEn || u.nameEn || 'Scout'
      });
    }
  });

  (liveMuhtasibPatrols || []).forEach((p) => {
    if (Number.isFinite(p?.x) && Number.isFinite(p?.y)) {
      sources.push({
        x: p.x,
        y: p.y,
        r: 62,
        kind: 'patrol',
        id: p.id,
        labelRu: p.badgeRu || 'Дозор',
        labelEn: p.badgeEn || 'Patrol'
      });
    }
  });

  (signalBeacons || []).forEach((b) => {
    if (b?.isLit && Number.isFinite(b.x) && Number.isFinite(b.y)) {
      sources.push({
        x: b.x,
        y: b.y,
        r: 108,
        kind: 'beacon',
        id: b.id,
        labelRu: b.badgeRu || 'Маяк',
        labelEn: b.badgeEn || 'Beacon'
      });
    }
  });

  (kunakSpyRings || []).forEach((s) => {
    if (s?.active && Number.isFinite(s.x) && Number.isFinite(s.y)) {
      sources.push({
        x: s.x,
        y: s.y,
        r: 104,
        kind: 'kunak',
        id: s.id,
        labelRu: s.badgeRu || 'Кунаки',
        labelEn: s.badgeEn || 'Kunaks'
      });
    }
  });

  return sources;
}

/**
 * Оценивает видимость произвольной точки карты относительно источников разведки.
 */
export function evaluatePointVisibility(x, y, reconSources = []) {
  let bestRatio = 0;
  let nearestSource = null;

  for (let i = 0; i < reconSources.length; i++) {
    const src = reconSources[i];
    if (!src || !Number.isFinite(src.x) || !Number.isFinite(src.y) || !src.r) continue;
    const dist = Math.hypot(x - src.x, y - src.y);
    if (dist <= src.r) {
      const clarity = Math.max(0.15, Math.min(1.0, 1.0 - (dist / src.r) * 0.72));
      if (clarity > bestRatio) {
        bestRatio = clarity;
        nearestSource = src;
      }
    }
  }

  return {
    revealed: bestRatio > 0,
    clarity: +bestRatio.toFixed(2),
    fogOpacity: +(1.0 - bestRatio).toFixed(2),
    source: nearestSource
  };
}

/**
 * Вычисляет плотность тумана войны над 6 северными горными перевалами Кавказа
 * и отмечает, слышны ли там скрытые марши колонн противника.
 */
export function computeFogPassSectors(reconSources = [], liveImperialColumns = []) {
  return NORTHERN_FOG_PASSES.map((pass) => {
    const vis = evaluatePointVisibility(pass.x, pass.y, reconSources);
    const hiddenNearby = (liveImperialColumns || []).some(
      (col) =>
        col &&
        col.fogHidden &&
        col.status !== 'destroyed' &&
        Math.hypot((col.x ?? 0) - pass.x, (col.y ?? 0) - pass.y) <= pass.radius * 1.15
    );
    return {
      ...pass,
      revealed: vis.revealed,
      clarity: vis.clarity,
      fogOpacity: vis.revealed ? Math.max(0, +(0.18 * (1 - vis.clarity)).toFixed(2)) : 0.88,
      hasHiddenThreat: hiddenNearby
    };
  });
}

/**
 * Вычисляет процент покрытия разведкой северных перевалов и активных угроз (0..100%).
 */
export function computeReconCoveragePct({
  fogPassSectors = [],
  liveImperialColumns = [],
  kunakSpyRings = []
} = {}) {
  const passRatio =
    fogPassSectors.length > 0
      ? fogPassSectors.filter((p) => p.revealed).length / fogPassSectors.length
      : 0.5;
  const colRatio =
    liveImperialColumns.length > 0
      ? liveImperialColumns.filter((c) => !c.fogHidden).length / liveImperialColumns.length
      : 1.0;
  const kunakRatio =
    kunakSpyRings.length > 0
      ? kunakSpyRings.filter((k) => k.active).length / kunakSpyRings.length
      : 0.5;

  return Math.max(
    12,
    Math.min(100, Math.round(passRatio * 45 + colRatio * 35 + kunakRatio * 20))
  );
}

/**
 * Строит читаемые векторы намерений генералов РИ (Воронцов, Фрейтаг, Аргутинский, Барятинский)
 * и всех разведанных экспедиционных колонн для 3D-стрелок и штаба разведки.
 */
export function buildReadableAiIntentVectors({
  imperialAi = null,
  imperialGenerals = [],
  liveImperialColumns = [],
  naibates = [],
  reconSources = [],
  kunakSpyRings = []
} = {}) {
  const vectors = [];
  const activeGen =
    imperialGenerals[imperialAi?.generalIdx || 0] || imperialGenerals[0] || null;
  const primaryTarget =
    (naibates || []).find((n) => n.id === imperialAi?.targetNaibateId) || null;

  const activeKunaksCount = (kunakSpyRings || []).filter((k) => k?.active).length;
  const hiddenColumns = (liveImperialColumns || []).filter(
    (c) => c && c.fogHidden && c.status !== 'destroyed'
  );
  const revealedColumns = (liveImperialColumns || []).filter(
    (c) => c && !c.fogHidden && c.status !== 'destroyed'
  );

  // 1. Главная стратегическая директива командующего Кавказским корпусом
  if (activeGen && primaryTarget?.coords) {
    const matchingCol = revealedColumns.find(
      (c) => c.targetNaibateId === primaryTarget.id && c.status === 'advancing'
    );
    const originX = matchingCol ? matchingCol.x : activeGen.baseOrigin?.x ?? 355;
    const originY = matchingCol ? matchingCol.y : activeGen.baseOrigin?.y ?? 48;
    const originVis = evaluatePointVisibility(originX, originY, reconSources);
    const intelConfirmed = Boolean(
      imperialAi?.scouted || originVis.revealed || activeKunaksCount >= 2 || matchingCol
    );
    const turnsLeft = Math.max(1, imperialAi?.turnsUntilStrike || 1);

    vectors.push({
      id: `intent-primary-${activeGen.id}-${primaryTarget.id}`,
      isPrimaryDirective: true,
      generalId: activeGen.id,
      generalNameRu: activeGen.shortLabelRu || activeGen.name,
      generalNameEn: activeGen.shortLabelEn || activeGen.nameEn || activeGen.name,
      doctrineRu: activeGen.doctrineName || '',
      doctrineEn: activeGen.doctrineNameEn || activeGen.doctrineName || '',
      fromX: originX,
      fromY: originY,
      toX: primaryTarget.coords.x,
      toY: primaryTarget.coords.y,
      targetNaibateId: primaryTarget.id,
      targetNameRu: primaryTarget.name,
      targetNameEn: primaryTarget.nameEn || primaryTarget.name,
      bayonets: imperialAi?.columnStrength || matchingCol?.bayonets || 3800,
      turnsUntilStrike: turnsLeft,
      intelState: intelConfirmed ? 'confirmed' : 'rumored',
      supplyCut: Boolean(matchingCol?.supplyCut),
      urgency: turnsLeft <= 1 ? 'imminent' : 'planned'
    });
  }

  // 2. Оперативные стрелки всех разведанных наступающих колонн РИ
  revealedColumns.forEach((col) => {
    if (col.status !== 'advancing') return;
    const targetNb = (naibates || []).find((n) => n.id === col.targetNaibateId);
    const toX = targetNb?.coords?.x ?? col.targetX;
    const toY = targetNb?.coords?.y ?? col.targetY;
    if (!Number.isFinite(toX) || !Number.isFinite(toY)) return;

    const dist = Math.hypot(toX - col.x, toY - col.y);
    if (dist < 14) return;

    const speedPerTurn = col.supplyCut ? 24 : 50;
    const etaTurns = Math.max(1, Math.min(5, Math.ceil(dist / speedPerTurn)));

    // Не дублируем идентичную стрелку, если она уже покрыта главной директивой из той же точки
    const alreadyPrimary = vectors.some(
      (v) =>
        v.isPrimaryDirective &&
        v.targetNaibateId === col.targetNaibateId &&
        Math.hypot(v.fromX - col.x, v.fromY - col.y) < 18
    );
    if (alreadyPrimary) return;

    vectors.push({
      id: `intent-col-${col.id}`,
      isPrimaryDirective: false,
      columnId: col.id,
      generalNameRu: col.badgeRu || col.nameRu,
      generalNameEn: col.badgeEn || col.nameEn || col.nameRu,
      doctrineRu: col.supplyCut ? 'Обоз отрезан' : 'Наступление колонны',
      doctrineEn: col.supplyCut ? 'Supply Severed' : 'Column Advance',
      fromX: col.x,
      fromY: col.y,
      toX,
      toY,
      targetNaibateId: col.targetNaibateId,
      targetNameRu: targetNb?.name || col.targetLabelRu || '',
      targetNameEn: targetNb?.nameEn || col.targetLabelEn || col.targetLabelRu || '',
      bayonets: col.bayonets || 2400,
      turnsUntilStrike: etaTurns,
      intelState: 'confirmed',
      supplyCut: Boolean(col.supplyCut),
      urgency: etaTurns <= 1 ? 'imminent' : 'advancing'
    });
  });

  const fogPassSectors = computeFogPassSectors(reconSources, liveImperialColumns);
  const coveragePct = computeReconCoveragePct({
    fogPassSectors,
    liveImperialColumns,
    kunakSpyRings
  });

  return {
    vectors,
    fogPassSectors,
    coveragePct,
    revealedColumnsCount: revealedColumns.length,
    hiddenColumnsCount: hiddenColumns.length,
    activeKunaksCount,
    totalKunaksCount: (kunakSpyRings || []).length,
    activeGeneral: activeGen,
    primaryTarget
  };
}

/**
 * Активирует отдельную спящую сеть кунаков на 3D-карте (с проверкой казны).
 */
export function activateSingleKunakRing({
  kunakSpyRings = [],
  ringId,
  silver = 0,
  costSilver = 45
} = {}) {
  const target = (kunakSpyRings || []).find((r) => r.id === ringId);
  if (!target) return { ok: false, reason: 'not_found', nextRings: kunakSpyRings, spentSilver: 0 };
  if (target.active) return { ok: false, reason: 'already_active', nextRings: kunakSpyRings, spentSilver: 0 };
  if (silver < costSilver) {
    return { ok: false, reason: 'insufficient_silver', nextRings: kunakSpyRings, spentSilver: 0 };
  }
  const nextRings = kunakSpyRings.map((r) => (r.id === ringId ? { ...r, active: true } : r));
  return {
    ok: true,
    reason: 'activated',
    ring: { ...target, active: true },
    nextRings,
    spentSilver: costSilver
  };
}
