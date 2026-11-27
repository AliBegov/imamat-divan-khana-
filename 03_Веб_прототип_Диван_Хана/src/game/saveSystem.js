// ============================================================================
// ВЕРСИОНИРОВАННАЯ СИСТЕМА СОХРАНЕНИЙ И ЭКСПОРТА .imamat-save (Спринт 2 / Gate 1)
// 3 слота + автосейв + миграция старых v1/UE5 сейвов + фундамент под Steam Cloud Saves.
// ============================================================================

export const SAVE_SCHEMA_VERSION = 'UImamatSaveGame_UE5_5_v2';
export const SAVE_FILE_FORMAT = 'imamat-save';
export const LEGACY_SAVE_KEY = 'imamat_stage1_save';

export const SAVE_SLOT_DEFS = [
  { id: 'autosave', key: 'imamat_save_autosave', isAuto: true },
  { id: 1, key: 'imamat_save_slot_1', isAuto: false },
  { id: 2, key: 'imamat_save_slot_2', isAuto: false },
  { id: 3, key: 'imamat_save_slot_3', isAuto: false }
];

function resolveStorage(storage) {
  if (storage) return storage;
  if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
    return globalThis.localStorage;
  }
  return null;
}

export function getSlotStorageKey(slotId) {
  if (slotId === 'autosave') return 'imamat_save_autosave';
  if (slotId === 1 || slotId === 2 || slotId === 3 || slotId === '1' || slotId === '2' || slotId === '3') {
    return `imamat_save_slot_${slotId}`;
  }
  return 'imamat_save_slot_1';
}

export function buildCampaignSavePayload(
  state,
  { seasons = [], seasonsEn = [], now = new Date() } = {}
) {
  const turn = Math.max(1, Number(state.turn) || 1);
  const seasonRuRaw = seasons.length > 0 ? String(seasons[(turn - 1) % seasons.length]) : '';
  const seasonEnRaw = seasonsEn.length > 0 ? String(seasonsEn[(turn - 1) % seasonsEn.length]) : '';
  const savedAt =
    typeof state.savedAt === 'string' && state.savedAt
      ? state.savedAt
      : now.toLocaleTimeString('ru-RU');

  return {
    format: SAVE_FILE_FORMAT,
    schemaVersion: SAVE_SCHEMA_VERSION,
    campaignSeed: state.campaignSeed ?? 18450706,
    turn,
    activeScenarioId: state.activeScenarioId || 'camp_1845',
    simDifficultyWeight: typeof state.simDifficultyWeight === 'number' ? state.simDifficultyWeight : 1.0,
    resources: state.resources,
    naibates: state.naibates,
    nizams: state.nizams,
    courtCases: state.courtCases,
    crises: state.crises,
    activeEnvoys: state.activeEnvoys || [],
    imperialAi: state.imperialAi,
    liveFieldUnits: state.liveFieldUnits || [],
    liveImperialColumns: state.liveImperialColumns || [],
    kunakSpyRings: state.kunakSpyRings || [],
    signalBeacons: state.signalBeacons || [],
    riverBridges: state.riverBridges || [],
    liveMapFortifications: state.liveMapFortifications || [],
    chronicle: Array.isArray(state.chronicle) ? state.chronicle.slice(0, 50) : [],
    zulmatClearedCount: state.zulmatClearedCount || 0,
    activatedFigurePerks: state.activatedFigurePerks || [],
    executedDispatchesIds: state.executedDispatchesIds || [],
    prologueRewardClaimed: Boolean(state.prologueRewardClaimed),
    heroArcsState: state.heroArcsState || {},
    episodesState: state.episodesState || {},
    activeEpisodeId: state.activeEpisodeId || 'ep_1845_dargo',
    capitalNaibateId: state.capitalNaibateId || 'vedeno',
    capitalLabelRu: state.capitalLabelRu || 'Дарго-Ведено',
    capitalLabelEn: state.capitalLabelEn || 'Dargo-Vedeno',
    imperialHeldIds: state.imperialHeldIds || [],
    campaignHistoryLog: state.campaignHistoryLog || [],
    tacticalBattleSession: state.tacticalBattleSession || null,
    delayedConsequences: Array.isArray(state.delayedConsequences) ? state.delayedConsequences : [],
    resolvedPacketIds: Array.isArray(state.resolvedPacketIds) ? state.resolvedPacketIds : [],
    seasonShortRu: seasonRuRaw ? seasonRuRaw.split(' (')[0] : state.seasonShortRu || '',
    seasonShortEn: seasonEnRaw ? seasonEnRaw.split(' (')[0] : state.seasonShortEn || '',
    savedAt,
    savedIso: now.toISOString()
  };
}

// Миграция и строгая валидация сохранений (поддержка v2, старого v1 / UE5 JSON, защита от битого файла)
export function validateAndMigrateSavePayload(
  rawOrObj,
  {
    initialRiverBridges = [],
    createInitialHeroArcsState = () => ({}),
    createInitialEpisodesState = () => ({})
  } = {}
) {
  let parsed;
  try {
    parsed = typeof rawOrObj === 'string' ? JSON.parse(rawOrObj) : rawOrObj;
  } catch {
    return {
      ok: false,
      errorCode: 'INVALID_JSON',
      errorRu: 'Файл сохранения повреждён (неверный формат JSON).',
      errorEn: 'Save file is corrupted (invalid JSON format).'
    };
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return {
      ok: false,
      errorCode: 'INVALID_STRUCTURE',
      errorRu: 'Некорректная структура файла сохранения.',
      errorEn: 'Invalid save file structure.'
    };
  }

  let migratedFrom = null;
  let data = { ...parsed };

  // Миграция формата v1 (UImamatSaveGame_UE5_5_v1) в единый v2
  if (
    data.schemaVersion === 'UImamatSaveGame_UE5_5_v1' ||
    (typeof data.currentTurn === 'number' && !data.turn)
  ) {
    migratedFrom = data.schemaVersion || 'v1';
    data = {
      ...data,
      format: SAVE_FILE_FORMAT,
      schemaVersion: SAVE_SCHEMA_VERSION,
      turn: data.currentTurn || 1,
      resources: data.resources || {
        gunpowder: data.centralGunpowderPoods ?? 195,
        provisions: data.centralProvisionsMeasures ?? 1420,
        silver: data.baitAlMalSilverRubles ?? 680,
        authority: data.shamilAuthorityPercent ?? 86,
        ottomanSupport: data.ottomanSupportPercent ?? 28
      },
      naibates: data.naibates || data.savedNaibates,
      nizams: data.nizams || data.savedNizams,
      activeEnvoys: data.activeEnvoys || data.savedActiveEnvoys || [],
      imperialAi: data.imperialAi || data.imperialAI,
      zulmatClearedCount: data.zulmatClearedCount ?? data.completedKhalwatSessions ?? 0
    };
  }

  const turnNum = Number(data.turn);
  if (!Number.isFinite(turnNum) || turnNum < 1) {
    return {
      ok: false,
      errorCode: 'MISSING_TURN',
      errorRu: 'В сохранении отсутствует корректный номер хода.',
      errorEn: 'Save file is missing a valid campaign turn number.'
    };
  }
  if (!data.resources || typeof data.resources !== 'object') {
    return {
      ok: false,
      errorCode: 'MISSING_RESOURCES',
      errorRu: 'В сохранении отсутствуют данные казны и арсеналов.',
      errorEn: 'Save file is missing treasury and arsenal resource data.'
    };
  }
  if (!Array.isArray(data.naibates) || data.naibates.length === 0) {
    return {
      ok: false,
      errorCode: 'MISSING_NAIBATES',
      errorRu: 'В сохранении отсутствует список наибств Имамата.',
      errorEn: 'Save file is missing the list of Imamate naibates.'
    };
  }

  // Миграция координат речных мостов на актуальные SRTM-русла с сохранением статуса подрыва/целостности
  if (Array.isArray(data.riverBridges) && initialRiverBridges.length > 0) {
    data.riverBridges = data.riverBridges.map((br) => {
      const canon = initialRiverBridges.find((ib) => ib.id === br.id);
      if (!canon) return br;
      return {
        ...canon,
        status: br.status || canon.status
      };
    });
  }

  if (data.heroArcsState && typeof data.heroArcsState === 'object') {
    data.heroArcsState = { ...createInitialHeroArcsState(), ...data.heroArcsState };
  }
  if (data.episodesState && typeof data.episodesState === 'object') {
    data.episodesState = { ...createInitialEpisodesState(), ...data.episodesState };
  }

  data.turn = Math.round(turnNum);
  data.schemaVersion = SAVE_SCHEMA_VERSION;
  data.format = SAVE_FILE_FORMAT;

  return {
    ok: true,
    data,
    migratedFrom
  };
}

export function writeSaveSlot(
  slotId,
  payload,
  { storage, updateLatest = true, onlyInitLatestIfMissing = false } = {}
) {
  const store = resolveStorage(storage);
  if (!store) return { ok: false, reason: 'NO_STORAGE' };
  try {
    const key = getSlotStorageKey(slotId);
    const serialized = JSON.stringify(payload);
    store.setItem(key, serialized);
    if (updateLatest) {
      if (!onlyInitLatestIfMissing || !store.getItem(LEGACY_SAVE_KEY)) {
        store.setItem(LEGACY_SAVE_KEY, serialized);
      }
    }
    return { ok: true, key, bytes: serialized.length };
  } catch {
    return { ok: false, reason: 'STORAGE_WRITE_FAILED' };
  }
}

export function readSaveSlot(slotId = null, { storage } = {}) {
  const store = resolveStorage(storage);
  if (!store) return null;
  try {
    if (slotId !== null && slotId !== undefined) {
      return store.getItem(getSlotStorageKey(slotId));
    }
    return (
      store.getItem(LEGACY_SAVE_KEY) ||
      store.getItem('imamat_save_autosave') ||
      store.getItem('imamat_save_slot_1')
    );
  } catch {
    return null;
  }
}

export function listSaveSlotsMeta(lang = 'ru', { storage } = {}) {
  const store = resolveStorage(storage);
  return SAVE_SLOT_DEFS.map((d) => {
    try {
      const raw = store ? store.getItem(d.key) : null;
      if (!raw) return { ...d, exists: false };
      const parsed = JSON.parse(raw);
      return {
        ...d,
        exists: true,
        turn: parsed.turn || 1,
        savedAt: parsed.savedAt || '',
        scenarioId: parsed.activeScenarioId || 'camp_1845',
        seasonShort: lang === 'en' ? parsed.seasonShortEn || '' : parsed.seasonShortRu || ''
      };
    } catch {
      return { ...d, exists: false };
    }
  });
}

export function hasAnySavedCampaign(slotsMeta = [], { storage } = {}) {
  const store = resolveStorage(storage);
  try {
    return Boolean(store && store.getItem(LEGACY_SAVE_KEY)) || slotsMeta.some((s) => s.exists);
  } catch {
    return false;
  }
}

export function getLatestSaveSummary(lang = 'ru', { storage } = {}) {
  const raw = readSaveSlot(null, { storage });
  if (!raw) return '';
  try {
    const p = JSON.parse(raw);
    return lang === 'en' ? `Turn #${p.turn || 1}` : `Ход #${p.turn || 1}`;
  } catch {
    return '';
  }
}

export function serializeImamatSaveFile(payload) {
  return JSON.stringify(payload, null, 2);
}

export function buildImamatSaveFilename(payload) {
  const scen = String(payload?.activeScenarioId || 'camp_1845').replace(/[^a-z0-9_]/gi, '');
  const turn = Math.max(1, Number(payload?.turn) || 1);
  return `Imamat_${scen}_Turn${turn}.${SAVE_FILE_FORMAT}`;
}
