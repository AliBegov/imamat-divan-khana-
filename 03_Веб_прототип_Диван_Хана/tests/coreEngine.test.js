import test from 'node:test';
import assert from 'node:assert/strict';

import {
  CAMPAIGN_SCENARIOS,
  IMPERIAL_GENERALS,
  INITIAL_NAIBATES,
  INITIAL_NIZAMS,
  SEASON_CLIMATE_MODIFIERS
} from '../src/data/campaignData.js';
import { getInitialEpisodeIdForScenario } from '../src/data/historicalEpisodes.js';
import {
  INITIAL_IMPERIAL_COLUMNS,
  INITIAL_LIVE_FIELD_UNITS,
  INITIAL_RIVER_BRIDGES
} from '../src/data/theaterEntities.js';
import { SEASONS, SEASONS_EN } from '../src/data/appContent.js';
import {
  computeBaseTurnEconomy,
  computeCampaignAudit,
  computeLeaderStress,
  computeNextNaibatesState,
  computeNizamModifiers,
  computeOrderExecutionBreakdown,
  createFreshTurnActionQuota,
  cycleSeasonPhase,
  evaluateCampaignClimax,
  getSeasonMixValue,
  refreshFieldUnitsForNewTurn,
  resolveEnvoysForTurn,
  resolveSeasonPhaseForTurn
} from '../src/game/turnEngine.js';
import {
  rankVulnerableNaibates,
  resolveImperialAiDirective,
  selectEpochGeneralIdx,
  selectTurnHotspotFocus,
  stepImperialColumnsForTurn
} from '../src/game/aiGenerals.js';
import {
  SAVE_FILE_FORMAT,
  SAVE_SCHEMA_VERSION,
  buildCampaignSavePayload,
  buildImamatSaveFilename,
  getLatestSaveSummary,
  hasAnySavedCampaign,
  listSaveSlotsMeta,
  readSaveSlot,
  serializeImamatSaveFile,
  validateAndMigrateSavePayload,
  writeSaveSlot
} from '../src/game/saveSystem.js';
import {
  TACTICAL_STANCES,
  computeAutoResolveForecast,
  computeNextStealthAfterAction,
  computeTacticalModifiers,
  getTacticalStanceById,
  resolveConvoyStrikeOutcome
} from '../src/game/tacticalBattleEngine.js';
import {
  NORTHERN_FOG_PASSES,
  activateSingleKunakRing,
  buildReadableAiIntentVectors,
  buildReconSources,
  computeFogPassSectors,
  evaluatePointVisibility
} from '../src/game/reconIntelEngine.js';
import {
  FELT_SHAME_BADGE,
  HISTORICAL_DILEMMAS_32,
  KUBACHI_25_ORDERS_CATALOG,
  applyOrderAwardToNaibate,
  computeNaibPoliticalProfile,
  pickNextHistoricalDilemma,
  resolveDueDelayedConsequences,
  runScenarioMonteCarloSuite,
  scheduleDelayedConsequence
} from '../src/game/naibPoliticsEngine.js';
import {
  ADAPTIVE_MUSIC_LAYERS,
  AUDIO_MIXER_STORAGE_KEY,
  DEFAULT_AUDIO_MIXER_CONFIG,
  FOLEY_SOUNDBOARD_CATALOG,
  computeBusGains,
  loadAudioMixerConfig,
  normalizeAudioMixerConfig,
  resolveAdaptiveMusicState,
  resolveTactileCueForAction,
  saveAudioMixerConfig
} from '../src/game/adaptiveAudioEngine.js';

function createMemoryStorage() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k)
  };
}

// ============================================================================
// SUITE 1: turnEngine.js — Nizams, Stress, Audit, Economy & Climax
// ============================================================================

test('1. computeNizamModifiers aggregates enacted nizams and caps greed/pride reduction at 70%', () => {
  const mocked = [
    {
      enacted: true,
      modifiers: {
        stressReduction: 5,
        globalImanBonus: 4,
        greedPenaltyReduction: 45,
        pridePenaltyReduction: 40,
        powderPerTurnBonus: 6,
        provisionsPerTurnBonus: 20,
        silverPerTurnBonus: 15
      }
    },
    {
      enacted: true,
      modifiers: {
        stressReduction: 7,
        globalImanBonus: 3,
        greedPenaltyReduction: 40,
        pridePenaltyReduction: 50,
        powderPerTurnBonus: 4,
        provisionsPerTurnBonus: 10,
        silverPerTurnBonus: 25
      }
    }
  ];
  const mods = computeNizamModifiers(mocked);
  assert.equal(mods.stressReduction, 12);
  assert.equal(mods.globalImanBonus, 7);
  assert.equal(mods.greedPenaltyReduction, 70);
  assert.equal(mods.pridePenaltyReduction, 70);
  assert.equal(mods.powderPerTurnBonus, 10);
  assert.equal(mods.provisionsPerTurnBonus, 30);
  assert.equal(mods.silverPerTurnBonus, 40);
});

test('2. computeNizamModifiers ignores non-enacted nizams', () => {
  const noneEnacted = INITIAL_NIZAMS.map((n) => ({ ...n, enacted: false }));
  const mods = computeNizamModifiers(noneEnacted);
  assert.equal(mods.stressReduction, 0);
  assert.equal(mods.powderPerTurnBonus, 0);
});

test('3. computeLeaderStress flags isZulmat at >= 80 and clamps to [12, 98]', () => {
  const crisisNaibates = INITIAL_NAIBATES.map((n) => ({
    ...n,
    imperialPressure: 95,
    gunpowder: 10,
    traits: { ...n.traits, pride: 92, iman: 45 }
  }));
  const high = computeLeaderStress({
    naibates: crisisNaibates,
    ottomanSupport: 0,
    stressReduction: 0,
    zulmatClearedCount: 0
  });
  assert.equal(high.totalStress, 98);
  assert.equal(high.isZulmat, true);

  const calmNaibates = INITIAL_NAIBATES.map((n) => ({
    ...n,
    imperialPressure: 15,
    gunpowder: 80,
    traits: { ...n.traits, pride: 30, iman: 90 }
  }));
  const low = computeLeaderStress({
    naibates: calmNaibates,
    ottomanSupport: 100,
    stressReduction: 20,
    zulmatClearedCount: 3
  });
  assert.equal(low.totalStress, 12);
  assert.equal(low.isZulmat, false);
});

test('4. computeLeaderStress drops with Ottoman support, Nizams and Khalwat clearances', () => {
  const base = computeLeaderStress({
    naibates: INITIAL_NAIBATES,
    ottomanSupport: 0,
    stressReduction: 0,
    zulmatClearedCount: 0
  });
  const mitigated = computeLeaderStress({
    naibates: INITIAL_NAIBATES,
    ottomanSupport: 50,
    stressReduction: 12,
    zulmatClearedCount: 1
  });
  assert.ok(mitigated.totalStress < base.totalStress);
});

test('5. computeCampaignAudit returns accurate garrison, sieges, iman and bounded victoryScore', () => {
  const audit = computeCampaignAudit({
    naibates: INITIAL_NAIBATES,
    nizams: INITIAL_NIZAMS,
    globalImanBonus: 5,
    totalStress: 35
  });
  const expectedGarrison = INITIAL_NAIBATES.reduce((s, n) => s + n.garrison + n.murtazeks, 0);
  assert.equal(audit.totalGarrison, expectedGarrison);
  assert.equal(audit.besiegedCount, INITIAL_NAIBATES.filter((n) => n.underSiege).length);
  assert.ok(audit.victoryScore >= 10 && audit.victoryScore <= 100);
});

test('6. computeBaseTurnEconomy applies winter climate flag and seasonal mods', () => {
  const summer = computeBaseTurnEconomy({
    nextTurnNum: 2,
    nizamModifiers: computeNizamModifiers(INITIAL_NIZAMS),
    seasonClimate: SEASON_CLIMATE_MODIFIERS[0],
    naibates: INITIAL_NAIBATES
  });
  const winter = computeBaseTurnEconomy({
    nextTurnNum: 4,
    nizamModifiers: computeNizamModifiers(INITIAL_NIZAMS),
    seasonClimate: { powderMod: -4, provisionsMod: -40, imperialPressureMod: -6 },
    naibates: INITIAL_NAIBATES
  });
  assert.equal(summer.isWinterClimate, false);
  assert.equal(winter.isWinterClimate, true);
  assert.ok(winter.provisionsDelta < summer.provisionsDelta);
});

test('7. computeBaseTurnEconomy activates late-war upkeep and Shali forest-clearing drain on turns 7-12', () => {
  const early = computeBaseTurnEconomy({
    nextTurnNum: 3,
    nizamModifiers: computeNizamModifiers([]),
    seasonClimate: { powderMod: 0, provisionsMod: 0, imperialPressureMod: 0 },
    naibates: INITIAL_NAIBATES
  });
  const late = computeBaseTurnEconomy({
    nextTurnNum: 10,
    nizamModifiers: computeNizamModifiers([]),
    seasonClimate: { powderMod: 0, provisionsMod: 0, imperialPressureMod: 0 },
    naibates: INITIAL_NAIBATES
  });
  assert.equal(early.lateWarSilverUpkeep, 0);
  assert.equal(early.clearingGrainPenalty, 0);
  assert.ok(late.lateWarSilverUpkeep > 0);
  assert.ok(late.lateWarPowderUpkeep > 0);
  assert.ok(late.clearingGrainPenalty > 0);
  assert.ok(late.silverDelta < early.silverDelta);
});

test('8. evaluateCampaignClimax checks turn >= 5 threshold, triumph and Upper Gunib last stand', () => {
  assert.equal(
    evaluateCampaignClimax({
      nextTurnNum: 4,
      nextSiegesCount: 9,
      nextAuthTotal: 15,
      victoryScore: 20
    }),
    null
  );
  const lastStand = evaluateCampaignClimax({
    nextTurnNum: 6,
    nextSiegesCount: 8,
    nextAuthTotal: 40,
    victoryScore: 30
  });
  assert.equal(lastStand?.outcome, 'last_stand');
  const triumph = evaluateCampaignClimax({
    nextTurnNum: 7,
    nextSiegesCount: 1,
    nextAuthTotal: 88,
    victoryScore: 84
  });
  assert.equal(triumph?.outcome, 'triumph');
});

// ============================================================================
// SUITE 2: turnEngine.js — P_exec, Field Units, Envoys & Naibates Step
// ============================================================================

test('9. computeOrderExecutionBreakdown penalizes low silver greed and rewards generous subsidy', () => {
  const greedyNaib = {
    imperialPressure: 50,
    travelTurns: 2,
    traits: { iman: 65, courage: 70, greed: 80, pride: 50 }
  };
  const lowSilver = computeOrderExecutionBreakdown({
    naibate: greedyNaib,
    attachedSilver: 0,
    attachedPowder: 15
  });
  const highSilver = computeOrderExecutionBreakdown({
    naibate: greedyNaib,
    attachedSilver: 60,
    attachedPowder: 15
  });
  assert.ok(lowSilver.greedPenalty > highSilver.greedPenalty);
  assert.ok(highSilver.chance > lowSilver.chance);
});

test('10. computeOrderExecutionBreakdown applies -8 stress penalty above 75% stress and relic/memory bonuses', () => {
  const naib = INITIAL_NAIBATES[0];
  const calm = computeOrderExecutionBreakdown({
    naibate: naib,
    totalStress: 40,
    attachedSilver: 30,
    attachedPowder: 15,
    relicObedienceBonus: 5,
    naibMemory: { obedienceMod: 6 }
  });
  const stressed = computeOrderExecutionBreakdown({
    naibate: naib,
    totalStress: 82,
    attachedSilver: 30,
    attachedPowder: 15,
    relicObedienceBonus: 0,
    naibMemory: { obedienceMod: -4 }
  });
  assert.equal(calm.stressPenalty, 0);
  assert.equal(stressed.stressPenalty, 8);
  assert.ok(calm.chance > stressed.chance);
});

test('11. computeOrderExecutionBreakdown scales convoy intercept risk on fast_road and heavy powder loads', () => {
  const naib = { imperialPressure: 70, travelTurns: 3, traits: { iman: 70, courage: 70, greed: 30, pride: 30 } };
  const lightTrail = computeOrderExecutionBreakdown({
    naibate: naib,
    attachedPowder: 15,
    routeMode: 'mountain_trail'
  });
  const heavyRoad = computeOrderExecutionBreakdown({
    naibate: naib,
    attachedPowder: 45,
    routeMode: 'fast_road',
    generalMod: { interceptRiskBonus: 8 }
  });
  assert.equal(lightTrail.convoyInterceptPenalty, 0);
  assert.equal(heavyRoad.convoyInterceptPenalty, 16);
  assert.equal(heavyRoad.estimatedTravelTurns, 2);
  assert.ok(heavyRoad.interceptRisk > lightTrail.interceptRisk);
});

test('12. refreshFieldUnitsForNewTurn restores MP, heals +38 near friendly base vs +12 afar, wakes camped units', () => {
  const friendlyAul = { id: 'vedeno', underSiege: false, coords: { x: 225, y: 195 } };
  const units = [
    { id: 'u_near', x: 230, y: 198, mp: 10, maxMp: 150, sabers: 400, maxSabers: 500, status: 'idle' },
    { id: 'u_far', x: 600, y: 400, mp: 0, maxMp: 140, sabers: 400, maxSabers: 500, status: 'idle' },
    {
      id: 'u_camp',
      x: 300,
      y: 250,
      targetX: 380,
      targetY: 260,
      waypoints: [{ x: 340, y: 255 }, { x: 380, y: 260 }],
      mp: 0,
      maxMp: 120,
      sabers: 300,
      maxSabers: 300,
      status: 'camped'
    }
  ];
  const next = refreshFieldUnitsForNewTurn({ units, naibates: [friendlyAul] });
  assert.equal(next[0].mp, 150);
  assert.equal(next[0].sabers, 438);
  assert.equal(next[1].mp, 140);
  assert.equal(next[1].sabers, 412);
  assert.equal(next[2].status, 'moving');
  assert.equal(next[2].mp, 120);
});

test('13. resolveEnvoysForTurn decrements turnsLeft for multi-turn envoys without premature resolution', () => {
  const res = resolveEnvoysForTurn({
    activeEnvoys: [
      { id: 'e1', turnsLeft: 2, targetId: 'gergebil', targetName: 'Гергебиль', naibName: 'Идрис', orderTitle: 'Укрепить', orderType: 'fortify', powder: 30, interceptRisk: 50, execChance: 80 }
    ],
    nextTurnNum: 2,
    rng: () => 0.01
  });
  assert.equal(res.remainingEnvoys.length, 1);
  assert.equal(res.remainingEnvoys[0].turnsLeft, 1);
  assert.equal(res.logs.length, 0);
});

test('14. resolveEnvoysForTurn intercepts envoy when rng roll is below interceptRisk', () => {
  const res = resolveEnvoysForTurn({
    activeEnvoys: [
      { id: 'e2', turnsLeft: 1, targetId: 'gergebil', targetName: 'Гергебиль', naibName: 'Идрис', orderTitle: 'Укрепить', orderType: 'fortify', powder: 30, interceptRisk: 35, execChance: 90 }
    ],
    nextTurnNum: 3,
    rng: () => 0.1
  });
  assert.equal(res.turnInterceptedCount, 1);
  assert.equal(res.turnObeyedCount, 0);
  assert.equal(res.remainingEnvoys.length, 0);
  assert.equal(res.logs.length, 1);
});

test('15. resolveEnvoysForTurn applies fortify siege break and zakat treasury/provisions yields faithfully', () => {
  const rolls = [0.95, 0.2, 0.95, 0.2];
  let idx = 0;
  const res = resolveEnvoysForTurn({
    activeEnvoys: [
      { id: 'e_fort', turnsLeft: 1, targetId: 'salty', targetName: 'Салты', naibName: 'Юсуф', orderTitle: 'Завалы', orderType: 'fortify', powder: 30, interceptRisk: 10, execChance: 85 },
      { id: 'e_zak', turnsLeft: 1, targetId: 'vedeno', targetName: 'Ведено', naibName: 'Шамиль', orderTitle: 'Закят', orderType: 'zakat', powder: 0, interceptRisk: 10, execChance: 85 }
    ],
    nextTurnNum: 4,
    rng: () => rolls[idx++]
  });
  assert.equal(res.turnObeyedCount, 2);
  assert.equal(res.updatedNaibatesMap.salty.clearSiege, true);
  assert.equal(res.updatedNaibatesMap.salty.imperialPressureDelta, -24);
  assert.equal(res.silverBonus, 135);
  assert.equal(res.provisionsBonus, 160);
  assert.equal(res.powderBonus, 10);
});

test('16. resolveEnvoysForTurn penalizes Imam authority by -3 when naib refuses order', () => {
  const rolls = [0.99, 0.99];
  let idx = 0;
  const res = resolveEnvoysForTurn({
    activeEnvoys: [
      { id: 'e_ref', turnsLeft: 1, targetId: 'khunzakh', targetName: 'Хунзах', naibName: 'Хаджи-Мурат', orderTitle: 'Набег', orderType: 'raid', powder: 15, interceptRisk: 10, execChance: 55 }
    ],
    nextTurnNum: 5,
    rng: () => rolls[idx++]
  });
  assert.equal(res.turnRefusedCount, 1);
  assert.equal(res.authorityDelta, -3);
  assert.equal(res.updatedNaibatesMap.khunzakh.powderDelta, 15);
});

test('17. computeNextNaibatesState handles winter snowbound pass, lit beacon relief, emergency powder and schism', () => {
  const testNaibs = [
    {
      id: 'khunzakh',
      name: 'Авария и Хунзах',
      naibName: 'Хаджи-Мурат',
      coords: { x: 220, y: 240 },
      imperialPressure: 86,
      underSiege: true,
      siegeTurns: 2,
      gunpowder: 12,
      provisions: 200,
      terraceYield: 50,
      pastureAccess: true,
      garrison: 1200,
      murtazeks: 400,
      traits: { iman: 70, courage: 90, greed: 30, pride: 82 }
    },
    {
      id: 'gunib',
      name: 'Гуниб',
      naibName: 'Наиб Гуниба',
      coords: { x: 460, y: 290 },
      imperialPressure: 40,
      underSiege: false,
      siegeTurns: 0,
      gunpowder: 50,
      provisions: 200,
      terraceYield: 50,
      pastureAccess: true,
      garrison: 900,
      murtazeks: 250,
      traits: { iman: 85, courage: 85, greed: 20, pride: 45 }
    }
  ];
  const res = computeNextNaibatesState({
    naibates: testNaibs,
    isWinterClimate: true,
    signalBeacons: [{ id: 'b1', x: 465, y: 295, isLit: true }],
    availableCentralPowder: 100,
    nextTurnNum: 5,
    rng: () => 0.5
  });
  const khunzakh = res.nextNaibates.find((n) => n.id === 'khunzakh');
  const gunib = res.nextNaibates.find((n) => n.id === 'gunib');
  assert.equal(khunzakh.snowbound, true);
  assert.equal(gunib.snowbound, false);
  assert.equal(res.emergencyPowderSupport, 2);
  assert.equal(khunzakh.estranged, true);
  assert.equal(khunzakh.murtazeks, 320);
  assert.equal(res.authorityDelta, -3);
});

// ============================================================================
// SUITE 3: aiGenerals.js — Operational AI & Imperial Columns
// ============================================================================

test('18. selectEpochGeneralIdx advances commanders across eras and respects lock/1839 scenario', () => {
  assert.equal(selectEpochGeneralIdx({ activeScenarioId: 'camp_1839', nextTurnNum: 2 }), 1);
  assert.equal(selectEpochGeneralIdx({ activeScenarioId: 'camp_1845', nextTurnNum: 3 }), 0);
  assert.equal(selectEpochGeneralIdx({ activeScenarioId: 'camp_1845', nextTurnNum: 6 }), 2);
  assert.equal(selectEpochGeneralIdx({ activeScenarioId: 'camp_1845', nextTurnNum: 10 }), 3);
  assert.equal(
    selectEpochGeneralIdx({ activeScenarioId: 'camp_1845', nextTurnNum: 10, currentGeneralIdx: 1, aiDoctrineLocked: true }),
    1
  );
});

test('19. rankVulnerableNaibates prioritizes preferred high-pressure weak targets and excludes struck region', () => {
  const gen = IMPERIAL_GENERALS[0];
  const ranked = rankVulnerableNaibates({
    naibates: INITIAL_NAIBATES,
    general: gen,
    excludeNaibateId: INITIAL_NAIBATES[0].id
  });
  assert.equal(ranked.some((n) => n.id === INITIAL_NAIBATES[0].id), false);
  assert.equal(ranked.length, INITIAL_NAIBATES.length - 1);
});

test('20. selectTurnHotspotFocus prioritizes besieged naibate, falls back to visible active column', () => {
  const besiegedFocus = selectTurnHotspotFocus({
    naibates: [{ id: 'salty', name: 'Салты', underSiege: true, coords: { x: 430, y: 260 } }],
    liveImperialColumns: [{ id: 'c1', x: 200, y: 120, fogHidden: false, status: 'advancing' }],
    nextTurnNum: 3
  });
  assert.equal(besiegedFocus.mx, 430);
  assert.equal(besiegedFocus.my, 260);

  const colFocus = selectTurnHotspotFocus({
    naibates: [{ id: 'salty', name: 'Салты', underSiege: false, coords: { x: 430, y: 260 } }],
    liveImperialColumns: [
      { id: 'c_fog', x: 100, y: 100, fogHidden: true, status: 'advancing' },
      { id: 'c_vis', x: 215, y: 135, nameRu: 'Воронцов', nameEn: 'Vorontsov', fogHidden: false, status: 'advancing' }
    ],
    nextTurnNum: 4
  });
  assert.equal(colFocus.mx, 215);
  assert.equal(colFocus.my, 135);
});

test('21. stepImperialColumnsForTurn inflicts -14% supply-cut attrition and forces retreat at <= 1150 bayonets', () => {
  const col = {
    ...INITIAL_IMPERIAL_COLUMNS[0],
    x: 260,
    y: 160,
    originX: 260,
    originY: 48,
    bayonets: 1250,
    supplyCut: true,
    status: 'advancing'
  };
  const blockingUnit = { id: 'unit_hadji_murat', x: 260, y: 105, sabers: 680 };
  const step = stepImperialColumnsForTurn({
    columns: [col],
    naibates: INITIAL_NAIBATES,
    liveUnits: [blockingUnit],
    isWinterClimate: false,
    difficultyWeight: 1.0,
    nextTurnNum: 4,
    computePath: (x1, y1, x2, y2) => [{ x: x1, y: y1 }, { x: x2, y: y2 }]
  });
  assert.equal(step.nextColumns[0].bayonets, 1075);
  assert.equal(step.nextColumns[0].status, 'retreating');
});

test('22. stepImperialColumnsForTurn detects friendly cavalry corridor blockade automatically', () => {
  const col = {
    ...INITIAL_IMPERIAL_COLUMNS[0],
    x: 300,
    y: 200,
    originX: 300,
    originY: 50,
    bayonets: 2500,
    supplyCut: false,
    status: 'advancing'
  };
  const blocker = { id: 'unit_baysungur', x: 305, y: 125, sabers: 500 };
  const step = stepImperialColumnsForTurn({
    columns: [col],
    naibates: INITIAL_NAIBATES,
    liveUnits: [blocker],
    isWinterClimate: false,
    difficultyWeight: 1.0,
    nextTurnNum: 3
  });
  assert.equal(step.nextColumns[0].supplyCut, true);
  assert.ok(step.nextColumns[0].bayonets < 2500);
});

test('23. stepImperialColumnsForTurn reopens supply road via Cossack escort when unblocked strong column in summer', () => {
  const col = {
    ...INITIAL_IMPERIAL_COLUMNS[0],
    x: 300,
    y: 200,
    originX: 300,
    originY: 50,
    bayonets: 2200,
    supplyCut: true,
    status: 'advancing'
  };
  const step = stepImperialColumnsForTurn({
    columns: [col],
    naibates: INITIAL_NAIBATES,
    liveUnits: [],
    isWinterClimate: false,
    difficultyWeight: 1.0,
    nextTurnNum: 3
  });
  assert.equal(step.nextColumns[0].supplyCut, false);
  assert.equal(step.logs.length, 1);
});

test('24. stepImperialColumnsForTurn reinforces advancing column by +220 on convoy arrival and replenishes retreating column at fort', () => {
  const advancing = {
    ...INITIAL_IMPERIAL_COLUMNS[0],
    id: 'c_adv',
    x: 300,
    y: 180,
    originX: 300,
    originY: 50,
    bayonets: 2000,
    maxBayonets: 4000,
    convoyProgress: 0.78,
    supplyCut: false,
    status: 'advancing'
  };
  const retreatingAtFort = {
    ...INITIAL_IMPERIAL_COLUMNS[0],
    id: 'c_ret',
    x: 305,
    y: 55,
    originX: 300,
    originY: 50,
    bayonets: 1100,
    maxBayonets: 4000,
    status: 'retreating'
  };
  const step = stepImperialColumnsForTurn({
    columns: [advancing, retreatingAtFort],
    naibates: INITIAL_NAIBATES,
    liveUnits: [],
    isWinterClimate: false,
    difficultyWeight: 1.0,
    nextTurnNum: 5,
    computePath: (x1, y1, x2, y2) => [{ x: x1, y: y1 }, { x: x2, y: y2 }]
  });
  assert.equal(step.nextColumns[0].bayonets, 2220);
  assert.equal(step.nextColumns[0].convoyProgress, 0.24);
  assert.equal(step.nextColumns[1].status, 'advancing');
  assert.equal(step.nextColumns[1].bayonets, 1420);
});

test('25. resolveImperialAiDirective counts down and executes strike with winter 3-turn cooldown', () => {
  const countdown = resolveImperialAiDirective({
    imperialAi: { generalIdx: 0, targetNaibateId: 'vedeno', turnsUntilStrike: 2, columnStrength: 3600 },
    naibates: INITIAL_NAIBATES,
    imperialGenerals: IMPERIAL_GENERALS,
    nextTurnNum: 2,
    isWinterClimate: false
  });
  assert.equal(countdown.aiStrikeTargetId, null);
  assert.equal(countdown.nextImperialAi.turnsUntilStrike, 1);

  const strike = resolveImperialAiDirective({
    imperialAi: { generalIdx: 0, targetNaibateId: 'vedeno', turnsUntilStrike: 1, columnStrength: 3600 },
    naibates: INITIAL_NAIBATES,
    imperialGenerals: IMPERIAL_GENERALS,
    nextTurnNum: 5,
    isWinterClimate: true
  });
  assert.equal(strike.aiStrikeTargetId, 'vedeno');
  assert.equal(strike.nextImperialAi.turnsUntilStrike, 3);
  assert.notEqual(strike.nextImperialAi.targetNaibateId, 'vedeno');
  assert.equal(strike.logs.length, 1);
});

// ============================================================================
// SUITE 4: saveSystem.js — Slots, Autosave, Migration & .imamat-save I/O
// ============================================================================

test('26. buildCampaignSavePayload emits canonical v2 schema and caps chronicle to 50 entries', () => {
  const bigChronicle = Array.from({ length: 80 }, (_, i) => ({ id: `c-${i}`, turn: i + 1 }));
  const payload = buildCampaignSavePayload(
    {
      turn: 6,
      activeScenarioId: 'camp_1845',
      resources: { gunpowder: 210, provisions: 1300, silver: 700, authority: 82, ottomanSupport: 30 },
      naibates: INITIAL_NAIBATES,
      nizams: INITIAL_NIZAMS,
      chronicle: bigChronicle
    },
    { seasons: SEASONS, seasonsEn: SEASONS_EN, now: new Date('2026-11-26T18:00:00Z') }
  );
  assert.equal(payload.schemaVersion, SAVE_SCHEMA_VERSION);
  assert.equal(payload.format, SAVE_FILE_FORMAT);
  assert.equal(payload.turn, 6);
  assert.equal(payload.chronicle.length, 50);
  assert.ok(payload.seasonShortRu.length > 0);
  assert.ok(payload.seasonShortEn.length > 0);
});

test('27. writeSaveSlot, readSaveSlot, listSaveSlotsMeta and getLatestSaveSummary round-trip cleanly', () => {
  const storage = createMemoryStorage();
  const payload = buildCampaignSavePayload(
    {
      turn: 9,
      activeScenarioId: 'camp_1845',
      resources: { gunpowder: 180, provisions: 990, silver: 540, authority: 78, ottomanSupport: 25 },
      naibates: INITIAL_NAIBATES,
      nizams: INITIAL_NIZAMS
    },
    { seasons: SEASONS, seasonsEn: SEASONS_EN }
  );
  const w = writeSaveSlot(2, payload, { storage, updateLatest: true });
  assert.equal(w.ok, true);
  assert.ok(readSaveSlot(2, { storage }));
  const meta = listSaveSlotsMeta('ru', { storage });
  const slot2 = meta.find((s) => s.id === 2);
  assert.equal(slot2.exists, true);
  assert.equal(slot2.turn, 9);
  assert.equal(hasAnySavedCampaign(meta, { storage }), true);
  assert.equal(getLatestSaveSummary('en', { storage }), 'Turn #9');
});

test('28. serializeImamatSaveFile + validateAndMigrateSavePayload perform lossless round-trip', () => {
  const payload = buildCampaignSavePayload(
    {
      turn: 11,
      activeScenarioId: 'camp_1845',
      resources: { gunpowder: 245, provisions: 1510, silver: 890, authority: 91, ottomanSupport: 44 },
      naibates: INITIAL_NAIBATES,
      nizams: INITIAL_NIZAMS,
      liveFieldUnits: INITIAL_LIVE_FIELD_UNITS,
      liveImperialColumns: INITIAL_IMPERIAL_COLUMNS,
      imperialAi: { generalIdx: 2, targetNaibateId: 'salty', turnsUntilStrike: 2, columnStrength: 4100 }
    },
    { seasons: SEASONS, seasonsEn: SEASONS_EN }
  );
  const fileText = serializeImamatSaveFile(payload);
  const parsed = validateAndMigrateSavePayload(fileText, {
    initialRiverBridges: INITIAL_RIVER_BRIDGES
  });
  assert.equal(parsed.ok, true);
  assert.equal(parsed.data.turn, 11);
  assert.equal(parsed.data.resources.gunpowder, 245);
  assert.equal(parsed.data.imperialAi.targetNaibateId, 'salty');
  assert.equal(parsed.data.liveFieldUnits.length, INITIAL_LIVE_FIELD_UNITS.length);
});

test('29. validateAndMigrateSavePayload upgrades legacy v1 UE5 JSON saves into v2 schema', () => {
  const legacyV1 = {
    schemaVersion: 'UImamatSaveGame_UE5_5_v1',
    currentTurn: 7,
    centralGunpowderPoods: 165,
    centralProvisionsMeasures: 1120,
    baitAlMalSilverRubles: 490,
    shamilAuthorityPercent: 77,
    ottomanSupportPercent: 34,
    completedKhalwatSessions: 2,
    imperialAI: { generalIdx: 1, targetNaibateId: 'gergebil', turnsUntilStrike: 1 },
    savedNaibates: INITIAL_NAIBATES,
    savedNizams: INITIAL_NIZAMS,
    savedActiveEnvoys: []
  };
  const res = validateAndMigrateSavePayload(JSON.stringify(legacyV1));
  assert.equal(res.ok, true);
  assert.equal(res.migratedFrom, 'UImamatSaveGame_UE5_5_v1');
  assert.equal(res.data.schemaVersion, SAVE_SCHEMA_VERSION);
  assert.equal(res.data.turn, 7);
  assert.equal(res.data.resources.gunpowder, 165);
  assert.equal(res.data.zulmatClearedCount, 2);
  assert.equal(res.data.imperialAi.targetNaibateId, 'gergebil');
});

test('30. validateAndMigrateSavePayload migrates riverBridges to canonical SRTM coords while keeping blown status', () => {
  const bridge = INITIAL_RIVER_BRIDGES[0];
  const oldSave = {
    turn: 4,
    resources: { gunpowder: 195, provisions: 1200, silver: 600, authority: 80 },
    naibates: INITIAL_NAIBATES,
    riverBridges: [{ id: bridge.id, x: 1, y: 1, status: 'blown' }]
  };
  const res = validateAndMigrateSavePayload(oldSave, {
    initialRiverBridges: INITIAL_RIVER_BRIDGES
  });
  assert.equal(res.ok, true);
  assert.equal(res.data.riverBridges[0].x, bridge.x);
  assert.equal(res.data.riverBridges[0].y, bridge.y);
  assert.equal(res.data.riverBridges[0].status, 'blown');
});

test('31. validateAndMigrateSavePayload safely rejects corrupt JSON and incomplete payloads', () => {
  assert.equal(validateAndMigrateSavePayload('{broken json').ok, false);
  assert.equal(validateAndMigrateSavePayload('[]').ok, false);
  assert.equal(validateAndMigrateSavePayload({ turn: 0, resources: {}, naibates: INITIAL_NAIBATES }).ok, false);
  assert.equal(validateAndMigrateSavePayload({ turn: 2, naibates: INITIAL_NAIBATES }).ok, false);
  assert.equal(validateAndMigrateSavePayload({ turn: 2, resources: {}, naibates: [] }).ok, false);
});

test('32. buildImamatSaveFilename and createFreshTurnActionQuota return canonical defaults', () => {
  assert.equal(
    buildImamatSaveFilename({ activeScenarioId: 'camp_1845', turn: 7 }),
    'Imamat_camp_1845_Turn7.imamat-save'
  );
  const quota = createFreshTurnActionQuota();
  assert.equal(quota.sealsRemaining, 3);
  assert.equal(quota.maxSeals, 3);
  assert.equal(quota.envoysSent, 0);
});

test('33. cycleSeasonPhase cycles cleanly across all 4 Caucasus seasons (spring->summer->autumn->winter->spring)', () => {
  assert.equal(cycleSeasonPhase('spring'), 'summer');
  assert.equal(cycleSeasonPhase('summer'), 'autumn');
  assert.equal(cycleSeasonPhase('autumn'), 'winter');
  assert.equal(cycleSeasonPhase('winter'), 'spring');
  assert.equal(cycleSeasonPhase('unknown'), 'summer');
});

test('34. resolveSeasonPhaseForTurn maps campaign months to all 4 seasons and respects blizzard override', () => {
  assert.equal(resolveSeasonPhaseForTurn(0, 'eagles_clouds'), 'summer');
  assert.equal(resolveSeasonPhaseForTurn(2, 'eagles_clouds'), 'autumn');
  assert.equal(resolveSeasonPhaseForTurn(4, 'eagles_clouds'), 'winter');
  assert.equal(resolveSeasonPhaseForTurn(6, 'eagles_clouds'), 'spring');
  assert.equal(resolveSeasonPhaseForTurn(0, 'snow_blizzard'), 'winter');
});

test('35. getSeasonMixValue returns canonical WebGL2 shader mix values for all 4 seasons', () => {
  assert.equal(getSeasonMixValue('spring'), -1.0);
  assert.equal(getSeasonMixValue('summer'), 0.0);
  assert.equal(getSeasonMixValue('autumn'), 1.0);
  assert.equal(getSeasonMixValue('winter'), 2.0);
});

test('36. TACTICAL_STANCES exposes all 4 deployment postures and falls back safely', () => {
  assert.equal(TACTICAL_STANCES.length, 4);
  assert.equal(getTacticalStanceById('canopy_stealth').stealthBase, 100);
  assert.equal(getTacticalStanceById('flank_baggage').spoilsMult, 1.55);
  assert.equal(getTacticalStanceById('nonexistent').id, 'high_ridge');
});

test('37. computeTacticalModifiers rewards high-ground elevation and hidden forest stealth', () => {
  const hiddenRidge = computeTacticalModifiers({
    stanceId: 'canopy_stealth',
    stealthPct: 90,
    elevationMeters: 1680,
    gazyrCharges: 15,
    garrisonMorale: 88,
    enemyMorale: 68,
    supplyCut: true
  });
  const exposedLow = computeTacticalModifiers({
    stanceId: 'flank_baggage',
    stealthPct: 15,
    elevationMeters: 1050,
    gazyrCharges: 15,
    garrisonMorale: 70,
    enemyMorale: 85,
    supplyCut: false
  });
  assert.equal(hiddenRidge.isAmbushHidden, true);
  assert.equal(exposedLow.isAmbushHidden, false);
  assert.ok(hiddenRidge.fireEffectiveness > exposedLow.fireEffectiveness + 0.35);
  assert.ok(hiddenRidge.casualtyMultiplier < exposedLow.casualtyMultiplier * 0.6);
});

test('38. computeTacticalModifiers triggers forced shashka melee bonus when 18 gazyrs reach 0', () => {
  const depleted = computeTacticalModifiers({
    stanceId: 'high_ridge',
    stealthPct: 30,
    gazyrCharges: 0,
    maxGazyrCharges: 18
  });
  const loaded = computeTacticalModifiers({
    stanceId: 'high_ridge',
    stealthPct: 30,
    gazyrCharges: 18,
    maxGazyrCharges: 18
  });
  assert.equal(depleted.forcedMelee, true);
  assert.equal(loaded.forcedMelee, false);
  assert.ok(depleted.meleeShockEffectiveness > loaded.meleeShockEffectiveness);
});

test('39. computeNextStealthAfterAction degrades stealth on gunfire and restores concealment on abatis felling', () => {
  const afterVolley = computeNextStealthAfterAction(90, 'crossfire', 'canopy_stealth');
  assert.ok(afterVolley < 90);
  const afterAbatis = computeNextStealthAfterAction(afterVolley, 'fell_beeches', 'canopy_stealth');
  assert.ok(afterAbatis > afterVolley);
  const clampedHigh = computeNextStealthAfterAction(95, 'fell_beeches', 'canopy_stealth');
  assert.equal(clampedHigh, 100);
});

test('40. resolveConvoyStrikeOutcome boosts powder/silver spoils when convoy is trapped behind barricades', () => {
  const modsFlank = computeTacticalModifiers({ stanceId: 'flank_baggage', stealthPct: 80 });
  const trapped = resolveConvoyStrikeOutcome({
    echelon: { strength: 700, cohesion: 45 },
    barricades: 3,
    modifiers: modsFlank,
    battleDoctrine: 'lava_charge'
  });
  const openRoad = resolveConvoyStrikeOutcome({
    echelon: { strength: 700, cohesion: 85 },
    barricades: 0,
    modifiers: computeTacticalModifiers({ stanceId: 'high_ridge', stealthPct: 20 }),
    battleDoctrine: 'ridge_snipers'
  });
  assert.equal(trapped.seversSupplyLine, true);
  assert.ok(trapped.powderCaptured > openRoad.powderCaptured * 1.5);
  assert.ok(trapped.silverCaptured > openRoad.silverCaptured * 1.4);
  assert.ok(trapped.cohesionDrop > openRoad.cohesionDrop);
});

test('41. computeAutoResolveForecast predicts higher win odds & lower losses with stealth, elevation & supply cut', () => {
  const strongPlan = computeAutoResolveForecast({
    tacticalMode: 'forest_spline',
    stanceId: 'canopy_stealth',
    stealthPct: 95,
    elevationMeters: 1650,
    gazyrCharges: 18,
    garrisonMorale: 90,
    russianMorale: 62,
    fortification: 4,
    supplyCut: true,
    splineSegments: [{ barricades: 3 }, { barricades: 2 }],
    splineEchelons: [{ cohesion: 48 }, { cohesion: 52 }]
  });
  const weakPlan = computeAutoResolveForecast({
    tacticalMode: 'forest_spline',
    stanceId: 'flank_baggage',
    stealthPct: 10,
    elevationMeters: 1050,
    gazyrCharges: 2,
    garrisonMorale: 58,
    russianMorale: 92,
    fortification: 1,
    supplyCut: false,
    splineSegments: [{ barricades: 0 }, { barricades: 0 }],
    splineEchelons: [{ cohesion: 90 }, { cohesion: 92 }]
  });
  assert.ok(strongPlan.winOdds >= 72);
  assert.equal(strongPlan.isDecisiveVictory, true);
  assert.ok(strongPlan.winOdds > weakPlan.winOdds + 25);
  assert.ok(strongPlan.totalGarrisonCasualties < weakPlan.totalGarrisonCasualties);
});

test('42. computeAutoResolveForecast propagates convoy supply severance on flank_baggage stance', () => {
  const res = computeAutoResolveForecast({
    tacticalMode: 'milyutin_siege',
    stanceId: 'flank_baggage',
    stealthPct: 65,
    gazyrCharges: 12,
    garrisonMorale: 82,
    russianMorale: 76
  });
  assert.equal(res.seversSupplyLine, true);
  assert.ok(res.totalCapturedPowder > 0);
  assert.ok(res.totalCapturedSilver > 0);
  assert.equal(res.remainingGazyrs, 12 - res.gazyrsSpent);
});

test('43. buildReconSources aggregates naibates, cavalry, lit beacons and active kunak rings only', () => {
  const sources = buildReconSources({
    naibates: [INITIAL_NAIBATES[0]],
    liveFieldUnits: [INITIAL_LIVE_FIELD_UNITS[0]],
    signalBeacons: [
      { id: 'b1', x: 300, y: 120, isLit: true, badgeRu: 'Маяк 1' },
      { id: 'b2', x: 400, y: 120, isLit: false, badgeRu: 'Маяк 2' }
    ],
    kunakSpyRings: [
      { id: 'k1', x: 364, y: 96, active: true, badgeRu: 'Кунаки 1' },
      { id: 'k2', x: 526, y: 136, active: false, badgeRu: 'Кунаки 2' }
    ]
  });
  assert.ok(sources.some((s) => s.kind === 'beacon' && s.id === 'b1'));
  assert.equal(sources.some((s) => s.id === 'b2'), false);
  assert.ok(sources.some((s) => s.kind === 'kunak' && s.id === 'k1'));
  assert.equal(sources.some((s) => s.id === 'k2'), false);
});

test('44. evaluatePointVisibility reveals points inside scout radius and shrouds northern passes beyond range', () => {
  const sources = [{ x: 225, y: 195, r: 86, kind: 'capital' }];
  const near = evaluatePointVisibility(230, 190, sources);
  const farPass = evaluatePointVisibility(545, 94, sources);
  assert.equal(near.revealed, true);
  assert.ok(near.clarity > 0.8);
  assert.equal(farPass.revealed, false);
  assert.equal(farPass.fogOpacity, 1.0);
});

test('45. computeFogPassSectors detects hidden enemy column movement behind shrouded passes', () => {
  const sources = [{ x: 132, y: 66, r: 90, kind: 'kunak' }];
  const cols = [
    { id: 'col_vorontsov', x: 356, y: 96, fogHidden: true, status: 'advancing' },
    { id: 'col_freitag', x: 124, y: 68, fogHidden: false, status: 'advancing' }
  ];
  const passes = computeFogPassSectors(sources, cols);
  assert.equal(passes.length, NORTHERN_FOG_PASSES.length);
  const grozPass = passes.find((p) => p.id === 'pass_sunzha_groznaya');
  const vnezPass = passes.find((p) => p.id === 'pass_vnezapnaya_andi');
  assert.equal(grozPass.revealed, true);
  assert.equal(vnezPass.revealed, false);
  assert.equal(vnezPass.hasHiddenThreat, true);
});

test('46. buildReadableAiIntentVectors produces primary general directive and scouted column thrust arrows', () => {
  const kunaks = [
    { id: 'spy_groznaya_ring', x: 196, y: 94, active: true },
    { id: 'spy_vnezapnaya_ring', x: 364, y: 96, active: false }
  ];
  const sources = buildReconSources({
    naibates: INITIAL_NAIBATES,
    liveFieldUnits: INITIAL_LIVE_FIELD_UNITS,
    kunakSpyRings: kunaks
  });
  const cols = INITIAL_IMPERIAL_COLUMNS.map((c) => ({
    ...c,
    fogHidden: !evaluatePointVisibility(c.x, c.y, sources).revealed
  }));
  const intel = buildReadableAiIntentVectors({
    imperialAi: {
      generalIdx: 0,
      targetNaibateId: 'karata',
      turnsUntilStrike: 2,
      columnStrength: 4200,
      scouted: true
    },
    imperialGenerals: IMPERIAL_GENERALS,
    liveImperialColumns: cols,
    naibates: INITIAL_NAIBATES,
    reconSources: sources,
    kunakSpyRings: kunaks
  });
  const primary = intel.vectors.find((v) => v.isPrimaryDirective);
  assert.ok(primary);
  assert.equal(primary.generalId, 'vorontsov');
  assert.equal(primary.targetNaibateId, 'karata');
  assert.equal(primary.turnsUntilStrike, 2);
  assert.ok(intel.vectors.length >= 2);
  assert.ok(intel.hiddenColumnsCount >= 1);
  assert.ok(intel.coveragePct >= 12 && intel.coveragePct <= 100);
});

test('47. buildReadableAiIntentVectors lifts fog and increases coverage when kunak spy rings activate', () => {
  const dormantKunaks = [
    { id: 'k1', x: 196, y: 94, active: false },
    { id: 'k2', x: 364, y: 96, active: false },
    { id: 'k3', x: 526, y: 136, active: false }
  ];
  const activeKunaks = dormantKunaks.map((k) => ({ ...k, active: true }));
  const srcBefore = buildReconSources({ naibates: INITIAL_NAIBATES, kunakSpyRings: dormantKunaks });
  const srcAfter = buildReconSources({ naibates: INITIAL_NAIBATES, kunakSpyRings: activeKunaks });
  const colsBefore = INITIAL_IMPERIAL_COLUMNS.map((c) => ({
    ...c,
    fogHidden: !evaluatePointVisibility(c.x, c.y, srcBefore).revealed
  }));
  const colsAfter = INITIAL_IMPERIAL_COLUMNS.map((c) => ({
    ...c,
    fogHidden: !evaluatePointVisibility(c.x, c.y, srcAfter).revealed
  }));
  const before = buildReadableAiIntentVectors({
    imperialAi: { generalIdx: 0, targetNaibateId: 'karata', turnsUntilStrike: 1, scouted: false },
    imperialGenerals: IMPERIAL_GENERALS,
    liveImperialColumns: colsBefore,
    naibates: INITIAL_NAIBATES,
    reconSources: srcBefore,
    kunakSpyRings: dormantKunaks
  });
  const after = buildReadableAiIntentVectors({
    imperialAi: { generalIdx: 0, targetNaibateId: 'karata', turnsUntilStrike: 1, scouted: false },
    imperialGenerals: IMPERIAL_GENERALS,
    liveImperialColumns: colsAfter,
    naibates: INITIAL_NAIBATES,
    reconSources: srcAfter,
    kunakSpyRings: activeKunaks
  });
  assert.ok(after.coveragePct > before.coveragePct);
  assert.ok(after.revealedColumnsCount > before.revealedColumnsCount);
  assert.equal(after.hiddenColumnsCount, 0);
});

test('48. activateSingleKunakRing enforces silver cost and activates dormant spy ring cleanly', () => {
  const rings = [
    { id: 'r1', active: false, badgeRu: 'Кунаки' },
    { id: 'r2', active: true, badgeRu: 'Грозная' }
  ];
  const lowSilver = activateSingleKunakRing({ kunakSpyRings: rings, ringId: 'r1', silver: 20, costSilver: 45 });
  assert.equal(lowSilver.ok, false);
  assert.equal(lowSilver.reason, 'insufficient_silver');

  const already = activateSingleKunakRing({ kunakSpyRings: rings, ringId: 'r2', silver: 200, costSilver: 45 });
  assert.equal(already.ok, false);
  assert.equal(already.reason, 'already_active');

  const ok = activateSingleKunakRing({ kunakSpyRings: rings, ringId: 'r1', silver: 200, costSilver: 45 });
  assert.equal(ok.ok, true);
  assert.equal(ok.spentSilver, 45);
  assert.equal(ok.nextRings.find((r) => r.id === 'r1').active, true);
});

test('49. buildReadableAiIntentVectors marks imminent strike urgency when turnsUntilStrike <= 1', () => {
  const intel = buildReadableAiIntentVectors({
    imperialAi: { generalIdx: 2, targetNaibateId: 'shali', turnsUntilStrike: 1, columnStrength: 4500, scouted: true },
    imperialGenerals: IMPERIAL_GENERALS,
    liveImperialColumns: [],
    naibates: INITIAL_NAIBATES,
    reconSources: [{ x: 115, y: 40, r: 100, kind: 'kunak' }],
    kunakSpyRings: []
  });
  const primary = intel.vectors[0];
  assert.equal(primary.urgency, 'imminent');
  assert.equal(primary.generalId, 'freytag');
  assert.equal(primary.intelState, 'confirmed');
});

// ============================================================================
// СПРИНТ 7 (ФАЗА 3 / GATE 3): ПОЛИТИКА НАИБОВ, 25 ОРДЕНОВ, 32 ДИЛЕММЫ И 3 СЦЕНАРИЯ
// ============================================================================
test('50. KUBACHI_25_ORDERS_CATALOG contains all 25 unique museum orders plus disciplinary Felt Badge', () => {
  assert.equal(KUBACHI_25_ORDERS_CATALOG.length, 25);
  const uniqueIds = new Set(KUBACHI_25_ORDERS_CATALOG.map((o) => o.id));
  assert.equal(uniqueIds.size, 25);
  for (let tier = 1; tier <= 4; tier += 1) {
    assert.ok(KUBACHI_25_ORDERS_CATALOG.filter((o) => o.tier === tier).length >= 5);
  }
  assert.ok(KUBACHI_25_ORDERS_CATALOG.every((o) => o.silverCost > 0 && o.imanBonus > 0 && o.gloryBonus > 0));
  assert.equal(FELT_SHAME_BADGE.isDisciplinary, true);
  assert.equal(FELT_SHAME_BADGE.silverCost, 0);
  assert.ok(FELT_SHAME_BADGE.ambitionDelta < 0);
});

test('51. computeNaibPoliticalProfile derives Loyalty, Ambition, Glory, and schismRisk from traits and rivalries', () => {
  const loyalNaib = {
    id: 'vedeno',
    garrison: 900,
    murtazeks: 120,
    trustScore: 2,
    ordersAwarded: ['Большая фестончатая звезда Мудира', 'Серебряный полумесяц «Хиляль»'],
    traits: { iman: 92, courage: 88, pride: 30 }
  };
  const proudRival = {
    id: 'khunzakh',
    garrison: 1400,
    murtazeks: 220,
    trustScore: -2,
    estranged: true,
    ordersAwarded: [],
    traits: { iman: 48, courage: 92, pride: 90 }
  };
  const rivalries = [{ naibAId: 'khunzakh', naibBId: 'teletl', tension: 80, resolved: false }];

  const pLoyal = computeNaibPoliticalProfile(loyalNaib, rivalries);
  const pRival = computeNaibPoliticalProfile(proudRival, rivalries);

  assert.ok(pLoyal.loyalty >= 80);
  assert.ok(pLoyal.glory >= 70);
  assert.equal(pLoyal.stanceId, 'proud_champion');
  assert.ok(pLoyal.orderExecutionMod > 0);

  assert.ok(pRival.ambition >= 80);
  assert.ok(pRival.schismRisk >= 55);
  assert.equal(pRival.stanceId, 'schism_risk');
  assert.ok(pRival.orderExecutionMod < 0);
});

test('52. applyOrderAwardToNaibate applies direct gameplay impact for Kubachi orders and Felt Shame Badge', () => {
  const baseNaib = {
    ...INITIAL_NAIBATES[0],
    trustScore: 0,
    ordersAwarded: [],
    imperialPressure: 62,
    traits: { iman: 74, courage: 85, pride: 72 }
  };
  const mudirStar = KUBACHI_25_ORDERS_CATALOG.find((o) => o.id === 'order_mudir');
  const resAward = applyOrderAwardToNaibate(baseNaib, mudirStar);
  assert.equal(resAward.isDisciplinary, false);
  assert.ok(resAward.nextNaibate.traits.iman > baseNaib.traits.iman);
  assert.ok(resAward.nextNaibate.traits.pride < baseNaib.traits.pride);
  assert.ok(resAward.nextNaibate.garrison > baseNaib.garrison);
  assert.ok(resAward.nextNaibate.gunpowder > baseNaib.gunpowder);
  assert.ok(resAward.nextNaibate.imperialPressure < baseNaib.imperialPressure);
  assert.equal(resAward.squadronVetDelta, 2);

  const profBefore = computeNaibPoliticalProfile(baseNaib);
  const profAfter = computeNaibPoliticalProfile(resAward.nextNaibate);
  assert.ok(profAfter.loyalty > profBefore.loyalty);
  assert.ok(profAfter.glory > profBefore.glory);

  const resFelt = applyOrderAwardToNaibate(baseNaib, FELT_SHAME_BADGE);
  assert.equal(resFelt.isDisciplinary, true);
  assert.ok(resFelt.nextNaibate.traits.pride < baseNaib.traits.pride);
  assert.ok(resFelt.nextNaibate.politicsDeltas.ambition < 0);
  assert.ok(resFelt.authorityDelta > 0);
});

test('53. HISTORICAL_DILEMMAS_32 has 32 unique bilingual dilemmas where every choice schedules a 2-4 turn delayed echo', () => {
  assert.equal(HISTORICAL_DILEMMAS_32.length, 32);
  const ids = new Set(HISTORICAL_DILEMMAS_32.map((d) => d.id));
  assert.equal(ids.size, 32);
  HISTORICAL_DILEMMAS_32.forEach((d) => {
    assert.ok(d.titleRu && d.titleEn);
    assert.ok(Array.isArray(d.choices) && d.choices.length >= 2);
    d.choices.forEach((ch) => {
      assert.ok(ch.delayedEffect, `Choice ${ch.id} in ${d.id} must have delayedEffect`);
      assert.ok(ch.delayedEffect.delayTurns >= 2 && ch.delayedEffect.delayTurns <= 4);
      assert.ok(ch.delayPreviewRu && ch.delayPreviewEn);
    });
  });
});

test('54. scheduleDelayedConsequence and resolveDueDelayedConsequences fire exactly on dueTurn and update state', () => {
  const dilemma = HISTORICAL_DILEMMAS_32[0]; // delayTurns = 2 on choices[0]
  const choice = dilemma.choices[0];
  let queue = scheduleDelayedConsequence([], { turn: 3, packet: dilemma, choice });
  assert.equal(queue.length, 1);
  assert.equal(queue[0].dueTurn, 5);

  // Turn 4: not due yet
  const early = resolveDueDelayedConsequences({
    queue,
    nextTurn: 4,
    naibates: INITIAL_NAIBATES,
    resources: { gunpowder: 150, provisions: 1000, silver: 500, authority: 80, ottomanSupport: 40 }
  });
  assert.equal(early.firedEffects.length, 0);
  assert.equal(early.remainingQueue.length, 1);

  // Turn 5: fires cleanly
  const fired = resolveDueDelayedConsequences({
    queue,
    nextTurn: 5,
    naibates: INITIAL_NAIBATES,
    resources: { gunpowder: 150, provisions: 1000, silver: 500, authority: 80, ottomanSupport: 40 }
  });
  assert.equal(fired.firedEffects.length, 1);
  assert.equal(fired.remainingQueue.length, 0);
  assert.equal(fired.logs.length, 1);
  const vedenoBefore = INITIAL_NAIBATES.find((n) => n.id === 'vedeno');
  const vedenoAfter = fired.nextNaibates.find((n) => n.id === 'vedeno');
  assert.equal(vedenoAfter.garrison, vedenoBefore.garrison + 140);
  assert.equal(fired.nextResources.authority, 83);
});

test('55. pickNextHistoricalDilemma prioritizes scenario-tagged dilemmas and avoids repeating resolved IDs', () => {
  const first = pickNextHistoricalDilemma({
    naibates: INITIAL_NAIBATES,
    resources: { gunpowder: 165, provisions: 1080, silver: 520, authority: 84, ottomanSupport: 42 },
    turn: 1,
    resolvedIds: [],
    activeScenarioId: 'camp_1847'
  });
  assert.ok(first.scenarios.includes('camp_1847'));

  const second = pickNextHistoricalDilemma({
    naibates: INITIAL_NAIBATES,
    resources: { gunpowder: 165, provisions: 1080, silver: 520, authority: 84, ottomanSupport: 42 },
    turn: 2,
    resolvedIds: [first.id],
    activeScenarioId: 'camp_1847'
  });
  assert.notEqual(second.id, first.id);
});

test('56. CAMPAIGN_SCENARIOS exposes all 3 flagship scenarios (1845 Dargo, 1839 Akhulgo, 1847-1849 Siege War)', () => {
  const flagships = CAMPAIGN_SCENARIOS.filter((s) => s.flagship).map((s) => s.id);
  assert.deepEqual(flagships.sort(), ['camp_1839', 'camp_1845', 'camp_1847']);
  const siege47 = CAMPAIGN_SCENARIOS.find((s) => s.id === 'camp_1847');
  assert.equal(siege47.generalIdx, 1);
  assert.equal(selectEpochGeneralIdx({ activeScenarioId: 'camp_1847', nextTurnNum: 3 }), 1);
  assert.equal(getInitialEpisodeIdForScenario('camp_1847'), 'ep_1847_siege_war');
});

test('57. saveSystem persists delayedConsequences and resolvedPacketIds through export and migration', () => {
  const sampleQueue = [{ id: 'echo-1', dueTurn: 6, effect: { titleRu: 'Тест', powderDelta: 15 } }];
  const payload = buildCampaignSavePayload({
    turn: 4,
    activeScenarioId: 'camp_1847',
    resources: { gunpowder: 165, provisions: 1080, silver: 520, authority: 84, ottomanSupport: 42 },
    naibates: INITIAL_NAIBATES,
    delayedConsequences: sampleQueue,
    resolvedPacketIds: ['dil_01_kubachi_silver']
  });
  const checked = validateAndMigrateSavePayload(JSON.stringify(payload));
  assert.equal(checked.ok, true);
  assert.equal(checked.data.activeScenarioId, 'camp_1847');
  assert.equal(checked.data.delayedConsequences.length, 1);
  assert.equal(checked.data.delayedConsequences[0].dueTurn, 6);
  assert.deepEqual(checked.data.resolvedPacketIds, ['dil_01_kubachi_silver']);
});

test('58. runScenarioMonteCarloSuite produces balanced difficulty curves and diversity across 3 flagship scenarios', () => {
  const mc = runScenarioMonteCarloSuite({
    scenarios: CAMPAIGN_SCENARIOS,
    initialNaibates: INITIAL_NAIBATES,
    runsPerScenario: 300,
    maxTurns: 12,
    seed: 18450706
  });
  assert.equal(mc.scenariosTested, 3);
  assert.equal(mc.uniqueOrdersUsed, 25);
  assert.ok(mc.uniqueDilemmasTriggered >= 24);
  assert.equal(mc.difficultyOrderingOk, true);
  assert.equal(mc.varianceOk, true);
});

// ============================================================================
// СПРИНТ 8 (ФАЗА 4 / GATE 4): 3-СЛОЙНЫЙ АДАПТИВНЫЙ ЗВУК, ФОЛИ И GAME FEEL
// ============================================================================
test('59. ADAPTIVE_MUSIC_LAYERS exposes all 3 Caucasian score layers (Council, March, Battle) with ascending BPM', () => {
  assert.equal(ADAPTIVE_MUSIC_LAYERS.length, 3);
  assert.deepEqual(
    ADAPTIVE_MUSIC_LAYERS.map((l) => l.id),
    ['council', 'march', 'battle']
  );
  assert.ok(ADAPTIVE_MUSIC_LAYERS[0].bpm < ADAPTIVE_MUSIC_LAYERS[1].bpm);
  assert.ok(ADAPTIVE_MUSIC_LAYERS[1].bpm < ADAPTIVE_MUSIC_LAYERS[2].bpm);
});

test('60. resolveAdaptiveMusicState transitions cleanly from Council to March to Battle based on live tension', () => {
  const council = resolveAdaptiveMusicState({ activeTab: 'diplomacy', siegesCount: 0 });
  assert.equal(council.layer, 'council');
  assert.equal(council.stemWeights.council, 1.0);
  assert.equal(council.stemWeights.march, 0);
  assert.equal(council.stemWeights.battle, 0);

  const march = resolveAdaptiveMusicState({ activeTab: 'map', activeEnvoysCount: 1, siegesCount: 0 });
  assert.equal(march.layer, 'march');
  assert.equal(march.stemWeights.march, 1.0);
  assert.ok(march.stemWeights.council > 0);

  const battle = resolveAdaptiveMusicState({ activeTab: 'siege', hasTacticalEncounter: true });
  assert.equal(battle.layer, 'battle');
  assert.equal(battle.stemWeights.battle, 1.0);
  assert.ok(battle.stemWeights.march > 0);
});

test('61. resolveAdaptiveMusicState honors manual mixer layer override cleanly', () => {
  const forced = resolveAdaptiveMusicState({ activeTab: 'diplomacy', overrideLayer: 'battle' });
  assert.equal(forced.layer, 'battle');
  assert.equal(forced.isOverridden, true);
  assert.equal(forced.stemWeights.battle, 1.0);
});

test('62. computeBusGains enforces mute, musicEnabled toggle, and independent 4-bus scaling', () => {
  const muted = computeBusGains(DEFAULT_AUDIO_MIXER_CONFIG, false);
  assert.deepEqual(muted, { master: 0, music: 0, sfx: 0, ambient: 0 });

  const noMusic = computeBusGains({ ...DEFAULT_AUDIO_MIXER_CONFIG, musicEnabled: false }, true);
  assert.equal(noMusic.music, 0);
  assert.ok(noMusic.sfx > 0);
  assert.ok(noMusic.ambient > 0);

  const full = computeBusGains({ masterVolume: 1.0, musicVolume: 0.6, sfxVolume: 0.8, ambientVolume: 0.5, musicEnabled: true }, true);
  assert.equal(full.music, 0.6);
  assert.equal(full.sfx, 0.8);
  assert.equal(full.ambient, 0.5);
});

test('63. loadAudioMixerConfig and saveAudioMixerConfig persist and normalize values safely', () => {
  const storage = createMemoryStorage();
  const saved = saveAudioMixerConfig(
    { masterVolume: 9.9, musicVolume: -2, sfxVolume: 1.1, musicLayerOverride: 'march', hapticsEnabled: false },
    storage
  );
  assert.equal(saved.masterVolume, 1.5);
  assert.equal(saved.musicVolume, 0);
  assert.equal(saved.sfxVolume, 1.1);
  assert.equal(saved.musicLayerOverride, 'march');
  assert.equal(saved.hapticsEnabled, false);

  const loaded = loadAudioMixerConfig(storage);
  assert.deepEqual(loaded, saved);
  assert.ok(storage.getItem(AUDIO_MIXER_STORAGE_KEY));

  const badOverride = normalizeAudioMixerConfig({ musicLayerOverride: 'invalid' });
  assert.equal(badOverride.musicLayerOverride, 'auto');
});

test('64. FOLEY_SOUNDBOARD_CATALOG covers all signature historical Caucasus foley cues', () => {
  const ids = new Set(FOLEY_SOUNDBOARD_CATALOG.map((f) => f.id));
  assert.ok(FOLEY_SOUNDBOARD_CATALOG.length >= 14);
  ['seal', 'silver_chime', 'gallop', 'cannon', 'cannon_echo', 'rifle', 'blade', 'horn', 'basin_ping', 'ui_tick'].forEach(
    (reqId) => assert.ok(ids.has(reqId), `Missing foley id ${reqId}`)
  );
});

test('65. resolveTactileCueForAction maps strategic actions to instant sound and visual micro-feedback', () => {
  const cannon = resolveTactileCueForAction('cannon_salvo');
  assert.equal(cannon.soundId, 'cannon');
  assert.equal(cannon.shakeClass, 'hud-map-shake-heavy');

  const award = resolveTactileCueForAction('order_award');
  assert.equal(award.soundId, 'silver_chime');
  assert.equal(award.flashClass, 'hud-silver-flash');

  const seal = resolveTactileCueForAction('seal_decree');
  assert.equal(seal.soundId, 'seal');
  assert.equal(seal.flashClass, 'hud-seal-stamp');
});

test('66. Adaptive music & tactile resolution executes well under Gate 4 50ms latency budget', () => {
  const t0 = performance.now();
  for (let i = 0; i < 200; i += 1) {
    resolveAdaptiveMusicState({ activeTab: i % 2 === 0 ? 'map' : 'siege', siegesCount: i % 3 });
    resolveTactileCueForAction(i % 2 === 0 ? 'order_award' : 'cannon_salvo');
  }
  const avgMs = (performance.now() - t0) / 200;
  assert.ok(avgMs < 1.0, `Expected <1ms per decision, got ${avgMs}`);
});
