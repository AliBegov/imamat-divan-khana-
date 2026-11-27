// ============================================================================
// ЧИСТЫЙ ТАКТИЧЕСКИЙ ДВИЖОК 3D-СРАЖЕНИЙ (Спринт 5 — Фаза 2 / Quality Gate 2)
// Нулевая зависимость от React/DOM/Three.js: 100% детерминируемые расчёты
// расстановки, высоты, скрытности в лесу, 18 газырей, удара по обозу, морали
// и Автобоя с реальным влиянием на исход стратегической кампании.
// ============================================================================

export const TACTICAL_STANCES = [
  {
    id: 'high_ridge',
    icon: '⛰️',
    ru: 'Господствующая высота',
    en: 'High Ground Ridge',
    shortRu: 'Высота (+25% залп)',
    shortEn: 'High Ground (+25% fire)',
    descRu: 'Стрелки занимают верхний скальный гребень: +25% точности и урона натиску, -15% потерь, но слабее скрытность.',
    descEn: 'Marksmen hold the upper rocky crest: +25% accuracy and pressure drop, -15% casualties, lower concealment.',
    elevationBonus: 0.25,
    stealthBase: 45,
    casualtyMult: 0.85,
    spoilsMult: 1.0,
    moraleShockBonus: 4
  },
  {
    id: 'canopy_stealth',
    icon: '🌿',
    ru: 'Скрытая засада в чаще',
    en: 'Forest Canopy Stealth',
    shortRu: 'Скрытность (+45% шок)',
    shortEn: 'Stealth (+45% shock)',
    descRu: 'Мюриды таятся в вековых буках (100% скрытность): внезапный залп или атака наносит +45% шока морали при -40% потерь.',
    descEn: 'Murids conceal in ancient beeches (100% stealth): ambush volley or strike deals +45% morale shock with -40% casualties.',
    elevationBonus: 0.1,
    stealthBase: 100,
    casualtyMult: 0.72,
    spoilsMult: 1.1,
    moraleShockBonus: 8
  },
  {
    id: 'flank_baggage',
    icon: '🥖',
    ru: 'Фланговый удар по обозу',
    en: 'Convoy Flank Strike',
    shortRu: 'Обоз (+55% трофеи)',
    shortEn: 'Convoy (+55% spoils)',
    descRu: 'Конно-кинжальный охват сухарных фургонов: +55% трофеев пороха и серебра, перерезает снабжение колонны на 3D-карте.',
    descEn: 'Flanking kindjal sweep on biscuit wagons: +55% powder & silver spoils and severs column supply on the 3D map.',
    elevationBonus: 0.05,
    stealthBase: 65,
    casualtyMult: 1.05,
    spoilsMult: 1.55,
    moraleShockBonus: 6
  },
  {
    id: 'blindage_bastion',
    icon: '🛡️',
    ru: 'Глубокие блиндажи',
    en: 'Fortified Blindages',
    shortRu: 'Блиндажи (-35% потерь)',
    shortEn: 'Bastion (-35% losses)',
    descRu: 'Укрытие за 4-слойными дубовыми накатами и контр-минами: -35% потерь, +12% стойкость духа, усиленный камуфлет.',
    descEn: 'Shelter beneath 4-layer oak blindages and counter-mines: -35% casualties, +12% morale resilience, stronger camouflet.',
    elevationBonus: 0.15,
    stealthBase: 55,
    casualtyMult: 0.65,
    spoilsMult: 0.9,
    moraleShockBonus: 3
  }
];

export function getTacticalStanceById(stanceId) {
  return TACTICAL_STANCES.find((s) => s.id === stanceId) || TACTICAL_STANCES[0];
}

/**
 * Вычисляет суммарные тактические модификаторы поля боя из расстановки,
 * высоты, лесной скрытности, остатка 18 газырей и морали сторон.
 */
export function computeTacticalModifiers({
  stanceId = 'high_ridge',
  stealthPct = 75,
  elevationMeters = 1480,
  sectorElevationLabel = '',
  gazyrCharges = 18,
  maxGazyrCharges = 18,
  garrisonMorale = 84,
  enemyMorale = 78,
  supplyCut = false,
  isNight = false,
  isCounterStrike = false,
  fortification = 3
} = {}) {
  const stance = getTacticalStanceById(stanceId);

  // Превышение высоты над рекой/долиной (850м база)
  const parsedSecMeters = Number(String(sectorElevationLabel || '').replace(/[^0-9]/g, '')) || 0;
  const effectiveElev = Math.max(elevationMeters || 1200, parsedSecMeters);
  const terrainElevAdvantage = Math.max(0, Math.min(0.28, ((effectiveElev - 1050) / 900) * 0.22));
  const totalElevationBonus = +(stance.elevationBonus + terrainElevAdvantage).toFixed(2);

  // Эффективная скрытность в лесу / ночью (макс. 100%)
  const clampedStealth = Math.max(0, Math.min(100, Math.round(stealthPct + (isNight ? 18 : 0))));
  const isAmbushHidden = clampedStealth >= 60;
  const ambushShockMult = isAmbushHidden ? 1.45 : clampedStealth >= 30 ? 1.15 : 1.0;

  // Патронташ 18 газырей и переход «В шашки!» при истощении
  const gazyrs = Math.max(0, Math.min(maxGazyrCharges || 18, gazyrCharges));
  const forcedMelee = gazyrs === 0;
  const lowAmmoWarning = gazyrs > 0 && gazyrs <= 3;

  // Бонус морального превосходства и отрезанного обоза
  const moraleDiff = (garrisonMorale ?? 80) - (enemyMorale ?? 75);
  const moraleBonus = Math.max(-0.15, Math.min(0.22, moraleDiff * 0.0045));
  const supplyPenaltyOnEnemy = supplyCut ? 0.25 : 0;
  const fortDefenseFactor = Math.max(0.75, 1.0 - (Math.max(1, fortification || 3) - 1) * 0.05);

  const fireEffectiveness = +(
    1.0 +
    totalElevationBonus +
    moraleBonus +
    supplyPenaltyOnEnemy +
    (isAmbushHidden ? 0.22 : 0)
  ).toFixed(2);

  const meleeShockEffectiveness = +(
    1.0 +
    (forcedMelee ? 0.25 : 0) +
    (isAmbushHidden ? 0.3 : 0) +
    moraleBonus +
    (stance.id === 'flank_baggage' ? 0.2 : 0)
  ).toFixed(2);

  const casualtyMultiplier = +(
    stance.casualtyMult *
    fortDefenseFactor *
    (isAmbushHidden ? 0.6 : 1.0) *
    (isCounterStrike ? 0.5 : 1.0) *
    (supplyCut ? 0.85 : 1.0)
  ).toFixed(2);

  return {
    stance,
    effectiveElevationMeters: effectiveElev,
    totalElevationBonus,
    effectiveStealthPct: clampedStealth,
    isAmbushHidden,
    ambushShockMult,
    gazyrs,
    forcedMelee,
    lowAmmoWarning,
    moraleDiff,
    supplyCut: Boolean(supplyCut),
    fireEffectiveness,
    meleeShockEffectiveness,
    casualtyMultiplier,
    spoilsMultiplier: stance.spoilsMult,
    moraleShockBonus: stance.moraleShockBonus + (isAmbushHidden ? 5 : 0)
  };
}

/**
 * Обновляет уровень скрытности мюридов после конкретного тактического приказа.
 */
export function computeNextStealthAfterAction(currentStealth = 75, actionType = 'crossfire', stanceId = 'canopy_stealth') {
  const cur = Math.max(0, Math.min(100, currentStealth));
  if (actionType === 'fell_beeches' || actionType === 'repair_blindage') {
    // Рубка засек и отход в чащу восстанавливают маскировку в буковом лесу
    return Math.min(100, cur + (stanceId === 'canopy_stealth' ? 24 : 15));
  }
  if (actionType === 'crossfire' || actionType === 'sharpshooters') {
    // Пороховой дым демаскирует стрелков на склоне
    return Math.max(10, cur - (stanceId === 'canopy_stealth' ? 26 : 36));
  }
  if (actionType === 'convoy_strike' || actionType === 'dagger_charge' || actionType === 'night_sortie') {
    // Открытая атака срывает скрытность, но после налёта можно снова уйти в лес
    return Math.max(5, cur - 42);
  }
  if (actionType === 'camouflet') {
    return Math.max(20, cur - 15);
  }
  return cur;
}

/**
 * Расчёт удара по сухарному и пороховому обозу колонны РИ (Спринт 5).
 */
export function resolveConvoyStrikeOutcome({
  echelon = null,
  barricades = 0,
  modifiers,
  battleDoctrine = 'lava_charge'
} = {}) {
  const mods = modifiers || computeTacticalModifiers({});
  const doctrineSpoils = battleDoctrine === 'lava_charge' ? 1.25 : 1.0;
  const trappedBonus = barricades >= 2 ? 1.28 : barricades >= 1 ? 1.12 : 1.0;
  const lowCohesionBonus = echelon && echelon.cohesion <= 55 ? 1.2 : 1.0;

  const powderCaptured = Math.round(
    22 * mods.spoilsMultiplier * doctrineSpoils * trappedBonus * lowCohesionBonus
  );
  const silverCaptured = Math.round(
    85 * mods.spoilsMultiplier * doctrineSpoils * trappedBonus
  );
  const enemyStrengthLoss = Math.round(
    185 * mods.meleeShockEffectiveness * trappedBonus
  );
  const cohesionDrop = Math.min(
    38,
    Math.round(22 * mods.ambushShockMult * (barricades >= 1 ? 1.18 : 1.0))
  );
  const pressureDrop = Math.round(
    16 * mods.meleeShockEffectiveness * (barricades >= 2 ? 1.15 : 1.0)
  );
  const garrisonCasualties = Math.max(
    5,
    Math.round(16 * mods.casualtyMultiplier * (barricades >= 2 ? 0.8 : 1.0))
  );
  const enemyMoraleDrop = Math.round(14 * mods.ambushShockMult);

  return {
    powderCaptured,
    silverCaptured,
    enemyStrengthLoss,
    cohesionDrop,
    pressureDrop,
    garrisonCasualties,
    enemyMoraleDrop,
    seversSupplyLine: true
  };
}

/**
 * Прогноз и детерминированное разрешение «Автобоя» (Total War Auto-Resolve)
 * на базе всех тактических факторов игрока: расстановки, высоты, скрытности,
 * остатка 18 газырей, морали, фортификации и снабжения.
 */
export function computeAutoResolveForecast({
  tacticalMode = 'milyutin_siege',
  stanceId = 'high_ridge',
  stealthPct = 75,
  elevationMeters = 1480,
  gazyrCharges = 18,
  maxGazyrCharges = 18,
  garrisonMorale = 84,
  russianMorale = 78,
  fortification = 3,
  supplyCut = false,
  pressureDropAccum = 0,
  capturedPowderPoods = 0,
  capturedSilverRubles = 0,
  garrisonCasualties = 0,
  splineSegments = [],
  splineEchelons = [],
  battleDoctrine = 'lava_charge',
  isCounterStrike = false,
  isNight = false
} = {}) {
  const mods = computeTacticalModifiers({
    stanceId,
    stealthPct,
    elevationMeters,
    gazyrCharges,
    maxGazyrCharges,
    garrisonMorale,
    enemyMorale: russianMorale,
    supplyCut,
    isNight,
    isCounterStrike,
    fortification
  });

  const totalBarricades = (splineSegments || []).reduce((s, seg) => s + (seg.barricades || 0), 0);
  const avgCohesion =
    splineEchelons && splineEchelons.length > 0
      ? splineEchelons.reduce((s, e) => s + e.cohesion, 0) / splineEchelons.length
      : 72;

  // Интегральный индекс боевого превосходства Имамата (0..100)
  let winOdds = 52;
  winOdds += Math.round((mods.fireEffectiveness - 1.0) * 34);
  winOdds += Math.round((mods.meleeShockEffectiveness - 1.0) * 18);
  winOdds += Math.round((garrisonMorale - russianMorale) * 0.45);
  winOdds += Math.round((fortification - 2) * 4);
  winOdds += Math.round(pressureDropAccum * 0.9);
  if (supplyCut) winOdds += 11;
  if (isCounterStrike) winOdds += 9;
  if (mods.isAmbushHidden) winOdds += 8;
  if (tacticalMode === 'forest_spline') {
    winOdds += Math.min(14, totalBarricades * 3);
    winOdds += Math.round((75 - avgCohesion) * 0.35);
  }
  if (gazyrCharges <= 3) winOdds -= 6;
  if (battleDoctrine === 'safarov_mine' && tacticalMode === 'milyutin_siege') winOdds += 5;
  if (battleDoctrine === 'ridge_snipers' && tacticalMode === 'forest_spline') winOdds += 5;

  winOdds = Math.max(18, Math.min(96, winOdds));

  const isDecisiveVictory = winOdds >= 72;
  const isVictory = winOdds >= 50;

  const addedPressureDrop = isDecisiveVictory
    ? Math.round(24 + mods.moraleShockBonus * 0.8)
    : isVictory
    ? Math.round(18 + mods.moraleShockBonus * 0.5)
    : Math.round(10 + mods.moraleShockBonus * 0.3);

  const totalPressureDrop = Math.min(48, Math.max(pressureDropAccum + addedPressureDrop, isVictory ? 22 : 10));

  const addedPowder = Math.round(
    (isDecisiveVictory ? 24 : isVictory ? 16 : 6) * mods.spoilsMultiplier
  );
  const addedSilver = Math.round(
    (isDecisiveVictory ? 95 : isVictory ? 60 : 20) * mods.spoilsMultiplier
  );
  const addedCasualties = Math.max(
    8,
    Math.round((isDecisiveVictory ? 24 : isVictory ? 38 : 68) * mods.casualtyMultiplier)
  );
  const estimatedEnemyLoss = Math.round(
    (isDecisiveVictory ? 780 : isVictory ? 560 : 290) *
      Math.max(0.85, (mods.fireEffectiveness + mods.meleeShockEffectiveness) * 0.5)
  );
  const gazyrsSpent = Math.min(gazyrCharges, isDecisiveVictory ? 6 : 9);

  const verdictRu = isDecisiveVictory
    ? 'Сокрушительная победа'
    : isVictory
    ? 'Уверенная победа'
    : 'Тяжёлый арьергардный бой';
  const verdictEn = isDecisiveVictory
    ? 'Decisive Victory'
    : isVictory
    ? 'Clear Victory'
    : 'Costly Rearguard';

  return {
    winOdds,
    isVictory,
    isDecisiveVictory,
    verdictRu,
    verdictEn,
    totalPressureDrop,
    addedPressureDrop,
    totalCapturedPowder: capturedPowderPoods + addedPowder,
    addedPowder,
    totalCapturedSilver: capturedSilverRubles + addedSilver,
    addedSilver,
    totalGarrisonCasualties: garrisonCasualties + addedCasualties,
    addedCasualties,
    estimatedEnemyLoss,
    gazyrsSpent,
    remainingGazyrs: Math.max(0, gazyrCharges - gazyrsSpent),
    seversSupplyLine: Boolean(supplyCut || stanceId === 'flank_baggage' || isDecisiveVictory),
    modifiers: mods
  };
}
