// ============================================================================
// ЧИСТЫЙ ДВИЖОК ХОДА И МАТЕМАТИКА ДИВАН-ХАНЫ (Спринт 2 — Фаза 1 / Gate 1)
// Нулевая зависимость от React/DOM: 100% детерминируемые формулы для игры и unit-тестов.
// Синхронизировано с C++ UImamatGameInstance / FOrderProbabilityBreakdown.
// ============================================================================

export function createFreshTurnActionQuota() {
  return {
    sealsRemaining: 3,
    maxSeals: 3,
    envoysSent: 0,
    maxEnvoysPerTurn: 2,
    nizamsEnacted: 0,
    maxNizamsPerTurn: 1,
    courtCasesResolved: 0,
    maxCourtCasesPerTurn: 1,
    stateOrdersUsed: 0,
    maxStateOrdersPerTurn: 1,
    tacticalMovesUsed: 0,
    maxTacticalMovesPerTurn: 4,
    crisesResolved: 0,
    maxCrisesPerTurn: 1
  };
}

// Суммарные модификаторы от принятых Низамов Шамиля
export function computeNizamModifiers(nizams = []) {
  return (nizams || [])
    .filter((n) => n && n.enacted)
    .reduce(
      (acc, n) => ({
        stressReduction: acc.stressReduction + (n.modifiers?.stressReduction || 0),
        globalImanBonus: acc.globalImanBonus + (n.modifiers?.globalImanBonus || 0),
        greedPenaltyReduction: Math.min(
          70,
          acc.greedPenaltyReduction + (n.modifiers?.greedPenaltyReduction || 0)
        ),
        pridePenaltyReduction: Math.min(
          70,
          acc.pridePenaltyReduction + (n.modifiers?.pridePenaltyReduction || 0)
        ),
        powderPerTurnBonus: acc.powderPerTurnBonus + (n.modifiers?.powderPerTurnBonus || 0),
        provisionsPerTurnBonus:
          acc.provisionsPerTurnBonus + (n.modifiers?.provisionsPerTurnBonus || 0),
        silverPerTurnBonus: acc.silverPerTurnBonus + (n.modifiers?.silverPerTurnBonus || 0)
      }),
      {
        stressReduction: 0,
        globalImanBonus: 0,
        greedPenaltyReduction: 0,
        pridePenaltyReduction: 0,
        powderPerTurnBonus: 0,
        provisionsPerTurnBonus: 0,
        silverPerTurnBonus: 0
      }
    );
}

// Математическая модель давления и нагрузки на Имама (включая флаг кризиса «Зульмат» >= 80%)
export function computeLeaderStress({
  naibates = [],
  ottomanSupport = 0,
  stressReduction = 0,
  zulmatClearedCount = 0
}) {
  const count = Math.max(1, naibates.length);
  const avgPressure =
    naibates.reduce((sum, n) => sum + (n.imperialPressure || 0), 0) / count;
  const lowPowderCount = naibates.filter((n) => (n.gunpowder ?? 0) < 35).length;
  const highPrideCount = naibates.filter(
    (n) => (n.traits?.pride ?? 0) > 80 && (n.traits?.iman ?? 100) < 75
  ).length;
  const rawStress =
    avgPressure * 0.55 +
    lowPowderCount * 7.5 +
    highPrideCount * 8 -
    ottomanSupport * 0.22 -
    stressReduction -
    zulmatClearedCount * 9;
  const totalStress = Math.max(12, Math.min(98, Math.round(rawStress)));
  return {
    totalStress,
    isZulmat: totalStress >= 80,
    avgPressure: Math.round(avgPressure),
    lowPowderCount,
    highPrideCount
  };
}

// Интегральный индекс военной устойчивости и прогресса кампании
export function computeCampaignAudit({
  naibates = [],
  nizams = [],
  globalImanBonus = 0,
  totalStress = 30
}) {
  const count = Math.max(1, naibates.length);
  const totalGarrison = naibates.reduce(
    (s, n) => s + (n.garrison || 0) + (n.murtazeks || 0),
    0
  );
  const besiegedCount = naibates.filter((n) => n.underSiege).length;
  const enactedNizamsCount = nizams.filter((n) => n.enacted).length;
  const avgIman = Math.round(
    naibates.reduce(
      (s, n) => s + Math.min(100, (n.traits?.iman || 0) + globalImanBonus),
      0
    ) / count
  );
  const victoryScore = Math.min(
    100,
    Math.max(
      10,
      Math.round(
        avgIman * 0.35 +
          (100 - totalStress) * 0.25 +
          enactedNizamsCount * 2.5 +
          (7 - besiegedCount) * 4
      )
    )
  );
  return {
    totalGarrison,
    besiegedCount,
    enactedNizamsCount,
    avgIman,
    victoryScore
  };
}

// Математическая формула вероятности честного исполнения приказа наибом (P_exec) — 1-в-1 с FOrderProbabilityBreakdown
export function computeOrderExecutionBreakdown({
  naibate,
  nizamModifiers,
  attachedSilver = 0,
  attachedPowder = 0,
  orderType = 'raid',
  routeMode = 'mountain_trail',
  totalStress = 30,
  generalMod = { interceptRiskBonus: 0 },
  relicObedienceBonus = 0,
  naibMemory = { obedienceMod: 0 }
}) {
  const traits = naibate?.traits || { iman: 60, courage: 60, greed: 30, pride: 40 };
  const mods = nizamModifiers || {
    globalImanBonus: 0,
    greedPenaltyReduction: 0,
    pridePenaltyReduction: 0
  };
  const effectiveIman = Math.min(100, traits.iman + (mods.globalImanBonus || 0));
  const baseImanContribution = +(effectiveIman * 0.52).toFixed(1);
  const baseCourageContribution = +(traits.courage * 0.34).toFixed(1);
  const basePositive = baseImanContribution + baseCourageContribution;
  const greedFactor =
    traits.greed *
    0.28 *
    (1 - (mods.greedPenaltyReduction || 0) / 100) *
    (attachedSilver < 30 ? 1.25 : 0.45);
  const prideFactor =
    traits.pride *
    0.22 *
    (1 - (mods.pridePenaltyReduction || 0) / 100) *
    (orderType === 'zakat' ? 1.2 : 0.75);
  const supplyBonus = Math.min(22, attachedPowder * 0.42 + attachedSilver * 0.12);
  const stressPenalty = totalStress > 75 ? 8 : 0;
  const memoryMod = naibMemory?.obedienceMod || 0;

  const chance = Math.round(
    Math.max(
      25,
      Math.min(
        98,
        basePositive +
          supplyBonus +
          memoryMod +
          relicObedienceBonus -
          greedFactor -
          prideFactor -
          stressPenalty
      )
    )
  );
  const convoyInterceptPenalty = attachedPowder >= 45 ? 16 : attachedPowder >= 30 ? 8 : 0;
  const imperialPressure = naibate?.imperialPressure || 0;
  const baseInterceptRisk =
    routeMode === 'fast_road'
      ? Math.min(45, Math.round(imperialPressure * 0.38))
      : Math.max(4, Math.round(imperialPressure * 0.12));
  const interceptRisk = Math.max(
    2,
    Math.min(
      routeMode === 'fast_road' ? 68 : 48,
      baseInterceptRisk + convoyInterceptPenalty + (generalMod?.interceptRiskBonus || 0)
    )
  );
  const travelTurns = naibate?.travelTurns || 2;
  const estimatedTravelTurns =
    routeMode === 'fast_road' ? Math.max(1, travelTurns - 1) : Math.max(1, travelTurns);

  return {
    chance,
    interceptRisk,
    convoyInterceptPenalty,
    effectiveIman,
    baseImanContribution,
    baseCourageContribution,
    greedPenalty: +greedFactor.toFixed(1),
    pridePenalty: +prideFactor.toFixed(1),
    supplyBonus: +supplyBonus.toFixed(1),
    stressPenalty,
    memoryMod,
    relicBonus: relicObedienceBonus,
    estimatedTravelTurns
  };
}

// Расчёт базовой экономики хода (сезоны, низамы, содержание войска и просеки на поздних ходах 7–16)
export function computeBaseTurnEconomy({
  nextTurnNum,
  nizamModifiers,
  seasonClimate,
  doctrineModifiers = { provisionsModPerTurn: 0 },
  naibates = []
}) {
  const mods = nizamModifiers || {
    powderPerTurnBonus: 0,
    provisionsPerTurnBonus: 0,
    silverPerTurnBonus: 0
  };
  const climate = seasonClimate || {
    powderMod: 0,
    provisionsMod: 0,
    imperialPressureMod: 0
  };
  let powderDelta = 8 + (mods.powderPerTurnBonus || 0) + (climate.powderMod || 0);
  let provisionsDelta =
    110 +
    (mods.provisionsPerTurnBonus || 0) +
    (climate.provisionsMod || 0) +
    (doctrineModifiers.provisionsModPerTurn || 0);
  let silverDelta = 52 + (mods.silverPerTurnBonus || 0);

  const totalMurtazeksUpkeepPool = naibates.reduce((s, n) => s + (n.murtazeks || 0), 0);
  const lateWarTurnOffset = Math.max(0, nextTurnNum - 6);
  let lateWarSilverUpkeep = 0;
  let lateWarPowderUpkeep = 0;
  let clearingGrainPenalty = 0;

  if (lateWarTurnOffset > 0) {
    lateWarSilverUpkeep = Math.min(
      88,
      Math.round(totalMurtazeksUpkeepPool * 0.011 + lateWarTurnOffset * 4.5)
    );
    lateWarPowderUpkeep = Math.min(18, 3 + Math.floor(lateWarTurnOffset * 1.4));
    clearingGrainPenalty = nextTurnNum >= 8 ? Math.min(95, 28 + (nextTurnNum - 7) * 7) : 0;
    powderDelta -= lateWarPowderUpkeep;
    provisionsDelta -= clearingGrainPenalty;
    silverDelta -= lateWarSilverUpkeep;
  }

  const isWinterClimate =
    (climate.imperialPressureMod || 0) < 0 || (climate.provisionsMod || 0) < -25;

  return {
    powderDelta,
    provisionsDelta,
    silverDelta,
    isWinterClimate,
    lateWarSilverUpkeep,
    lateWarPowderUpkeep,
    clearingGrainPenalty
  };
}

// Пошаговое восстановление очков марша (MP) и пополнение сабель у аулов и лазаретов
export function refreshFieldUnitsForNewTurn({
  units = [],
  naibates = [],
  fieldHospitals = [],
  sampleHospitalBonusAtPoint = () => ({ inHospitalZone: false })
}) {
  return units.map((u) => {
    const fullMp = u.maxMp || 150;
    const maxSab = u.maxSabers ?? 500;
    const curSab = u.sabers ?? maxSab;
    const nearFriendlyBase =
      naibates.some(
        (n) => !n.underSiege && n.coords && Math.hypot(n.coords.x - u.x, n.coords.y - u.y) <= 55
      ) || Boolean(sampleHospitalBonusAtPoint(u.x, u.y, fieldHospitals)?.inHospitalZone);
    const nextSabers =
      u.status === 'idle' && nearFriendlyBase
        ? Math.min(maxSab, curSab + 38)
        : Math.min(maxSab, curSab + 12);
    const hasPendingRoute =
      u.status === 'camped' &&
      Array.isArray(u.waypoints) &&
      u.waypoints.length > 0 &&
      Math.hypot((u.targetX ?? u.x) - u.x, (u.targetY ?? u.y) - u.y) > 5;
    return {
      ...u,
      mp: fullMp,
      sabers: nextSabers,
      hesitationMult: 1.0,
      status: hasPendingRoute ? 'moving' : u.status === 'camped' ? 'idle' : u.status
    };
  });
}

// Продвижение и разрешение конных гонцов (с поддержкой инъекции rng для unit-тестов)
export function resolveEnvoysForTurn({ activeEnvoys = [], nextTurnNum = 2, rng = Math.random }) {
  const remainingEnvoys = [];
  const updatedNaibatesMap = {};
  const resolvedRegionsThisTurn = new Set();
  const logs = [];
  let turnInterceptedCount = 0;
  let turnObeyedCount = 0;
  let turnRefusedCount = 0;
  let powderBonus = 0;
  let provisionsBonus = 0;
  let silverBonus = 0;
  let authorityDelta = 0;

  activeEnvoys.forEach((env) => {
    if (env.turnsLeft > 1) {
      remainingEnvoys.push({ ...env, turnsLeft: env.turnsLeft - 1 });
      return;
    }

    const intercepted = rng() * 100 < env.interceptRisk;
    if (intercepted) {
      turnInterceptedCount += 1;
      logs.push({
        id: `log-int-${env.id}`,
        turn: nextTurnNum,
        category: 'envoy',
        sender: 'Разведка кордонной линии',
        senderEn: 'Cordon Line Reconnaissance',
        title: `Гонец в округ «${env.targetName}» перехвачен казачьим разъездом!`,
        titleEn: `Envoy to “${env.targetName}” Intercepted by Cossack Patrol!`,
        text: `Мюрид, везший приказ «${env.orderTitle}» и ${env.powder} пуд. пороха наибу ${env.naibName}, попал в засаду пластунов на переправе.`,
        textEn: `The mounted murid carrying order “${env.orderTitle}” and ${env.powder} poods of powder to Naib ${env.naibName} was ambushed at the river crossing.`
      });
      return;
    }

    const executed = rng() * 100 < env.execChance;
    const mod = updatedNaibatesMap[env.targetId] || {
      powderDelta: 0,
      imperialPressureDelta: 0,
      garrisonDelta: 0,
      murtazeksDelta: 0,
      imanDelta: 0,
      prideDelta: 0,
      clearSiege: false
    };
    mod.powderDelta += env.powder || 0;

    if (executed) {
      turnObeyedCount += 1;
      resolvedRegionsThisTurn.add(env.targetId);
      if (env.orderType === 'raid') {
        mod.imperialPressureDelta -= 18;
        mod.imanDelta += 4;
        powderBonus += 12;
        silverBonus += 65;
      } else if (env.orderType === 'fortify') {
        mod.imperialPressureDelta -= 24;
        mod.clearSiege = true;
        mod.imanDelta += 5;
      } else if (env.orderType === 'zakat') {
        silverBonus += 135;
        provisionsBonus += 160;
        powderBonus += 10;
      } else if (env.orderType === 'mobilize') {
        mod.garrisonDelta += 220;
        mod.murtazeksDelta += 90;
        mod.imperialPressureDelta -= 12;
      }
      updatedNaibatesMap[env.targetId] = mod;
      logs.push({
        id: `log-ok-${env.id}`,
        turn: nextTurnNum,
        category: 'envoy',
        sender: `Ответное письмо наиба: ${env.naibName} (${env.targetName})`,
        senderEn: `Naib’s Reply Letter: ${env.naibName} (${env.targetName})`,
        title: `Приказ Имама «${env.orderTitle}» исполнен в точности!`,
        titleEn: `Imam’s Order “${env.orderTitle}” Executed Faithfully!`,
        text: `«Во имя Аллаха Милостивого! Твой гонец доставил печать и ${env.powder} пудов пороха. Сотни муртазеков исполнили повеление Диван-ханы!»`,
        textEn: `“In the Name of Allah, the Merciful! Your envoy delivered the seal and ${env.powder} poods of powder. Our Murtazek squadrons have fulfilled the Divan-Khana’s command!”`
      });
    } else {
      turnRefusedCount += 1;
      updatedNaibatesMap[env.targetId] = mod;
      authorityDelta -= 3;
      logs.push({
        id: `log-fail-${env.id}`,
        turn: nextTurnNum,
        category: 'envoy',
        sender: `Уклончивое донесение: ${env.naibName} (${env.targetName})`,
        senderEn: `Evasive Report: ${env.naibName} (${env.targetName})`,
        title: `Наиб ${env.naibName} уклонился от приказа «${env.orderTitle}»`,
        titleEn: `Naib ${env.naibName} Evaded Order “${env.orderTitle}”`,
        text: `Из-за высокой гордыни или нехватки жалования наиб оставил присланные ${env.powder} пуд. пороха в своём ауле, сославшись на непогоду на перевалах.`,
        textEn: `Due to high pride or insufficient stipends, the Naib retained the ${env.powder} poods of powder in his own aul, citing impassable mountain weather.`
      });
    }
  });

  return {
    remainingEnvoys,
    updatedNaibatesMap,
    resolvedRegionsThisTurn,
    logs,
    turnInterceptedCount,
    turnObeyedCount,
    turnRefusedCount,
    powderBonus,
    provisionsBonus,
    silverBonus,
    authorityDelta
  };
}

// Пересчёт состояния всех наибств на новый ход (осады, перевалы в снегу, раскол, пороховой резерв)
export function computeNextNaibatesState({
  naibates = [],
  updatedNaibatesMap = {},
  resolvedRegionsThisTurn = new Set(),
  aiStrikeTargetId = null,
  scaledStrikePressure = 18,
  aiPowderDrain = -10,
  seasonClimate = { imperialPressureMod: 0 },
  isWinterClimate = false,
  signalBeacons = [],
  activeRelicBonuses = {},
  availableCentralPowder = 200,
  nextTurnNum = 2,
  rng = Math.random
}) {
  let emergencyPowderSupport = 0;
  let authorityDelta = 0;
  const logs = [];

  const nextNaibates = naibates.map((n) => {
    const mod = updatedNaibatesMap[n.id] || {};
    const aiStrikeBonus = n.id === aiStrikeTargetId ? scaledStrikePressure : 0;
    const regionalAiPowderDrain = n.id === aiStrikeTargetId ? aiPowderDrain : 0;
    const isResolvedHere = resolvedRegionsThisTurn.has(n.id);
    const passiveDrift =
      !isResolvedHere && n.id !== aiStrikeTargetId
        ? rng() * 3.7 - 0.5 + (seasonClimate.imperialPressureMod || 0) * 0.45
        : 0;
    const nextPressure = Math.max(
      15,
      Math.min(
        96,
        Math.round(
          n.imperialPressure + passiveDrift + (mod.imperialPressureDelta || 0) + aiStrikeBonus
        )
      )
    );
    const nextUnderSiege = mod.clearSiege ? false : nextPressure >= 80;
    const powderBurn = nextUnderSiege ? 6 : 3;
    let nextPowder = Math.max(
      4,
      n.gunpowder - powderBurn + (mod.powderDelta || 0) + regionalAiPowderDrain
    );
    if (nextPowder < 24 && availableCentralPowder - emergencyPowderSupport >= 12) {
      nextPowder += 2;
      emergencyPowderSupport += 2;
    }
    const isHighlandPass = ['khunzakh', 'karata', 'gunib', 'gidatl'].includes(n.id);
    const hasLitBeaconNearPass = signalBeacons.some(
      (b) => b.isLit && n.coords && Math.hypot(b.x - n.coords.x, b.y - n.coords.y) <= 130
    );
    const isSnowboundPass = Boolean(isWinterClimate && isHighlandPass && !hasLitBeaconNearPass);
    const snowDriftDrain = isSnowboundPass
      ? Math.round(-25 * (activeRelicBonuses.winterAttritionMult ?? 1.0))
      : 0;
    const pastureBonus = n.pastureAccess ? 25 : -15;
    const nextProvisions = Math.max(
      80,
      n.provisions + Math.round(n.terraceYield * 0.4) + pastureBonus + snowDriftDrain - 20
    );

    const nextSiegeTurns = nextUnderSiege ? (n.siegeTurns || 0) + 1 : 0;
    const nextIman = Math.min(100, Math.max(20, n.traits.iman + (mod.imanDelta || 0)));
    const nextPride = Math.min(
      100,
      Math.max(
        10,
        n.traits.pride + (mod.prideDelta || 0) + (nextUnderSiege && !isResolvedHere ? 3 : 0)
      )
    );
    const isEstranged =
      !isResolvedHere &&
      ((nextUnderSiege && nextSiegeTurns >= 2 && nextPowder <= 14) ||
        (nextPride >= 84 && nextIman <= 48));

    let schismMurtazekPenalty = 0;
    if (isEstranged && nextTurnNum >= 4) {
      schismMurtazekPenalty = -80;
      authorityDelta -= 3;
      logs.push({
        id: `log-schism-${n.id}-${nextTurnNum}`,
        turn: nextTurnNum,
        category: 'envoy',
        sender: `Тревожная весть мухтасиба (${n.name})`,
        senderEn: `Urgent Muhtasib Warning (${n.nameEn || n.name})`,
        title: `⚠️ Раскол и брожение в наибстве «${n.name}» (${n.naibName})!`,
        titleEn: `⚠️ Schism & Unrest in “${n.nameEn || n.name}” (${n.naibNameEn || n.naibName})!`,
        text: `Оставшись без пороха в блокаде или при уязвлённой гордости (${nextPride}), часть сотен разошлась по аулам (-80 муртазеков). Срочно направьте гонца или разрешите сургучный пакет!`,
        textEn: `Left without powder under blockade or stung by wounded pride (${nextPride}), squadrons dispersed (-80 murtazeks). Dispatch an envoy or resolve the sealed packet urgently!`
      });
    }

    return {
      ...n,
      imperialPressure: nextPressure,
      underSiege: nextUnderSiege,
      siegeTurns: nextSiegeTurns,
      estranged: isEstranged,
      trustScore: isEstranged ? Math.max(-3, (n.trustScore ?? 0) - 1) : n.trustScore ?? 0,
      lastMemoryRu: isEstranged
        ? `Обижен отсутствием пороховой подмоги при осаде (${nextSiegeTurns} ход.)`
        : n.lastMemoryRu,
      lastMemoryEn: isEstranged
        ? `Resents lack of powder relief during siege (${nextSiegeTurns} turns)`
        : n.lastMemoryEn,
      snowbound: isSnowboundPass,
      gunpowder: nextPowder,
      provisions: nextProvisions,
      garrison: Math.max(400, n.garrison + (mod.garrisonDelta || 0)),
      murtazeks: Math.max(100, n.murtazeks + (mod.murtazeksDelta || 0) + schismMurtazekPenalty),
      traits: {
        ...n.traits,
        iman: nextIman,
        pride: nextPride
      }
    };
  });

  return {
    nextNaibates,
    emergencyPowderSupport,
    authorityDelta,
    logs
  };
}

// Проверка условий исторической кульминации (Триумф Имамата или Последний рубеж на Гунибе)
export function evaluateCampaignClimax({
  nextTurnNum,
  nextSiegesCount,
  nextAuthTotal,
  victoryScore,
  climaxDismissed = false,
  suppressed = false
}) {
  if (nextTurnNum < 5 || climaxDismissed || suppressed) return null;
  if (nextSiegesCount >= 8 || nextAuthTotal <= 20) {
    return {
      outcome: 'last_stand',
      turn: nextTurnNum,
      victoryScore,
      titleRu: 'Последний рубеж на скале Верхний Гуниб',
      titleEn: 'The Final Stand on Upper Gunib Plateau',
      summaryRu:
        'Кольцо двухсоттысячной Кавказской армии сомкнулось вокруг горных аулов. Подобно 25 августа 1859 года, перед Имамом встаёт выбор между безнадёжным боем последних сотен и почётным миром ради спасения семей горцев.',
      summaryEn:
        'The ring of the 200,000-strong Caucasus Army has closed around the highland auls. As on August 25, 1859, the Imam faces the fateful choice between a final stand and an honorable peace to spare the mountaineer families.'
    };
  }
  if (nextSiegesCount <= 1 && nextAuthTotal >= 85 && victoryScore >= 82) {
    return {
      outcome: 'triumph',
      turn: nextTurnNum,
      victoryScore,
      titleRu: 'Исторический Триумф Северо-Кавказского Имамата!',
      titleEn: 'Historical Triumph of the Caucasian Imamate!',
      summaryRu:
        'Экспедиционные колонны отброшены за Терек и Сулак с перерезанными обозами, арсеналы Ведено и Гуниба полны пороха, а единство наибов по Кодексу Низамов вынудило Петербург признать неприступность горной державы.',
      summaryEn:
        'Expeditionary columns have been driven back across the Terek and Sulak with severed supply lines, Vedeno’s arsenals stand full, and the unity of the Naibs under the Nizam Code has secured the survival of the highland state.'
    };
  }
  return null;
}

// ============================================================================
// 4-СЕЗОННЫЙ КАЛЕНДАРЬ КАВКАЗА (ВЕСНА / ЛЕТО / ОСЕНЬ / ЗИМА — СПРИНТ 4)
// ============================================================================
export const SEASON_CYCLE_ORDER = ['spring', 'summer', 'autumn', 'winter'];

export function resolveSeasonPhaseForTurn(monthIdx = 0, effectiveSkyWeather = 'eagles_clouds') {
  if (effectiveSkyWeather === 'snow_blizzard') return 'winter';
  const m = ((Math.floor(monthIdx) % 12) + 12) % 12;
  // Кампания 1845 начинается в начале лета (monthIdx 0..1 — лето, 2..3 — осень, 4..5 — зима, 6..7 — весна)
  if (m === 0 || m === 1 || m === 8 || m === 9) return 'summer';
  if (m === 2 || m === 3 || m === 10) return 'autumn';
  if (m === 4 || m === 5 || m === 11) return 'winter';
  return 'spring';
}

export function cycleSeasonPhase(currentPhase = 'summer') {
  const idx = SEASON_CYCLE_ORDER.indexOf(currentPhase);
  return SEASON_CYCLE_ORDER[(idx === -1 ? 1 : idx + 1) % SEASON_CYCLE_ORDER.length];
}

export function getSeasonMixValue(seasonPhase = 'summer') {
  if (seasonPhase === 'spring') return -1.0;
  if (seasonPhase === 'autumn') return 1.0;
  if (seasonPhase === 'winter') return 2.0;
  return 0.0;
}
