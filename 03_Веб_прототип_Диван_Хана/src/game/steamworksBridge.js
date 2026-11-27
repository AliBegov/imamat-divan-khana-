// ============================================================================
// МОСТ STEAMWORKS (CLOUD SAVES, 12 ДОСТИЖЕНИЙ, RICH PRESENCE И OVERLAY)
// Спринт 11 (Фаза 6): единый чистый адаптер для Electron + steamworks.js,
// нативного macOS .app (WKWebView) и Web/Steam Deck автономного клиента.
// ============================================================================

export const STEAM_APP_ID = 3481840;
export const STEAM_PLAYTEST_APP_ID = 3481850;
export const STEAM_STORE_URL = `https://store.steampowered.com/app/${STEAM_APP_ID}/`;
export const STEAM_CLOUD_QUOTA_BYTES = 100 * 1024 * 1024; // 100 MB Steam Auto-Cloud quota
export const STEAM_CLOUD_MAX_SLOT_BYTES = 2 * 1024 * 1024; // 2 MB safety cap per save slot
export const STEAM_ACHIEVEMENTS_CACHE_KEY = 'imamat_steam_achievements_sync_v1';
export const STEAM_CLOUD_MANIFEST_KEY = 'imamat_steam_cloud_manifest_v1';

// Официальные габариты графических капсул Valve Steamworks (спецификация 2024–2026)
export const STEAM_STORE_CAPSULE_SPECS = [
  { id: 'header_capsule', filename: 'header_capsule_920x430.png', width: 920, height: 430, required: true, role: 'Store Header Capsule' },
  { id: 'small_capsule', filename: 'small_capsule_462x174.png', width: 462, height: 174, required: true, role: 'Store Small Capsule' },
  { id: 'main_capsule', filename: 'main_capsule_1232x706.png', width: 1232, height: 706, required: true, role: 'Store Main Capsule' },
  { id: 'vertical_capsule', filename: 'vertical_capsule_748x896.png', width: 748, height: 896, required: true, role: 'Store Vertical Capsule' },
  { id: 'library_capsule', filename: 'library_capsule_600x900.png', width: 600, height: 900, required: true, role: 'Steam Library Portrait' },
  { id: 'library_hero', filename: 'library_hero_3840x1240.png', width: 3840, height: 1240, required: true, role: 'Steam Library Hero Banner' },
  { id: 'library_logo', filename: 'library_logo_1280x720.png', width: 1280, height: 720, required: true, role: 'Steam Library Transparent Logo' }
];

function resolveStorage(storage) {
  if (storage) return storage;
  if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
    return globalThis.localStorage;
  }
  return null;
}

function resolveBridge(bridge) {
  if (bridge !== undefined) return bridge;
  if (typeof globalThis !== 'undefined' && globalThis.imamatSteamBridge) {
    return globalThis.imamatSteamBridge;
  }
  return null;
}

function measureUtf8Bytes(str) {
  const s = String(str || '');
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(s).length;
  }
  return s.length * 2;
}

export function detectSteamRuntimeEnvironment(win = typeof globalThis !== 'undefined' ? globalThis : null) {
  const b = win?.imamatSteamBridge || null;
  if (b && b.mode === 'steamworks') {
    return {
      mode: 'steamworks_electron',
      connected: true,
      cloudEnabled: Boolean(b.cloudEnabled ?? true),
      overlayAvailable: Boolean(b.overlayAvailable ?? true),
      appId: Number(b.appId) || STEAM_APP_ID,
      personaName: b.personaName || 'Steam Commander',
      labelRu: 'Steamworks SDK (Клиент Steam)',
      labelEn: 'Steamworks SDK (Steam Client)'
    };
  }
  if (b && b.mode === 'desktop_cloud_mirror') {
    return {
      mode: 'desktop_cloud_mirror',
      connected: false,
      cloudEnabled: true,
      overlayAvailable: false,
      appId: Number(b.appId) || STEAM_APP_ID,
      personaName: b.personaName || 'Desktop Commander',
      labelRu: 'Десктоп Electron (Локальное зеркало Steam Cloud)',
      labelEn: 'Desktop Electron (Local Steam Cloud Mirror)'
    };
  }
  if (
    (b && b.mode === 'macos_native_app') ||
    Boolean(win?.webkit?.messageHandlers?.imamatSteamCloud)
  ) {
    return {
      mode: 'macos_native_app',
      connected: false,
      cloudEnabled: true,
      overlayAvailable: false,
      appId: STEAM_APP_ID,
      personaName: 'macOS Commander',
      labelRu: 'Нативный macOS .app (Локальный контейнер Cloud)',
      labelEn: 'Native macOS .app (Local Cloud Container)'
    };
  }
  return {
    mode: 'web_standalone',
    connected: false,
    cloudEnabled: false,
    overlayAvailable: false,
    appId: STEAM_APP_ID,
    personaName: 'Web Playtester',
    labelRu: 'Веб / Автономный HTML (Офлайн-буфер Steamworks)',
    labelEn: 'Web / Standalone HTML (Offline Steamworks Buffer)'
  };
}

export function buildSteamRichPresence({
  activeScenarioId = 'camp_1845',
  turn = 1,
  authority = 80,
  underSiegeCount = 0,
  activeTab = 'map',
  lang = 'ru'
} = {}) {
  const scenMap = {
    camp_1839: { ru: 'Ахульго 1839', en: 'Akhulgo 1839' },
    camp_1845: { ru: 'Дарго 1845', en: 'Dargo 1845' },
    camp_1847: { ru: 'Салты и Чох 1847', en: 'Salty & Chokh 1847' },
    camp_1843: { ru: 'Авария 1843', en: 'Avaria 1843' },
    camp_1857: { ru: 'Гуниб 1857', en: 'Gunib 1857' }
  };
  const sc = scenMap[activeScenarioId] || scenMap.camp_1845;
  const isBattle = activeTab === 'siege' || activeTab === '3d_tactical';
  const auth = Math.max(0, Math.min(100, Math.round(Number(authority) || 0)));
  const safeTurn = Math.max(1, Math.round(Number(turn) || 1));
  const sieges = Math.max(0, Math.round(Number(underSiegeCount) || 0));

  const ru = isBattle
    ? `${sc.ru} • Ход ${safeTurn} • Тактический 3D-бой`
    : `${sc.ru} • Ход ${safeTurn} • Авторитет ${auth}%${sieges > 0 ? ` • Осад: ${sieges}` : ''}`;
  const en = isBattle
    ? `${sc.en} • Turn ${safeTurn} • 3D Tactical Battle`
    : `${sc.en} • Turn ${safeTurn} • Authority ${auth}%${sieges > 0 ? ` • Sieges: ${sieges}` : ''}`;

  return {
    steamDisplayKey: isBattle ? '#Status_TacticalBattle' : '#Status_DivanKhana',
    ru,
    en,
    text: lang === 'en' ? en : ru
  };
}

export function loadSyncedAchievementsMap(storage = null) {
  const store = resolveStorage(storage);
  if (!store) return {};
  try {
    const raw = store.getItem(STEAM_ACHIEVEMENTS_CACHE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

export function syncAchievementsToSteam(
  achievementsList = [],
  { bridge = undefined, storage = null, now = new Date() } = {}
) {
  const activeBridge = resolveBridge(bridge);
  const store = resolveStorage(storage);
  const syncedMap = loadSyncedAchievementsMap(store);
  const newlyUnlocked = [];
  const iso = now instanceof Date ? now.toISOString() : new Date(now).toISOString();

  (achievementsList || []).forEach((ach) => {
    if (!ach || !ach.id || !ach.unlocked) return;
    if (syncedMap[ach.id]) return;

    let pushedViaNative = false;
    try {
      if (activeBridge && typeof activeBridge.unlockAchievement === 'function') {
        activeBridge.unlockAchievement(ach.id);
        pushedViaNative = true;
      }
    } catch {
      pushedViaNative = false;
    }

    syncedMap[ach.id] = {
      unlockedAtIso: iso,
      transport: pushedViaNative ? activeBridge?.mode || 'bridge' : 'local_buffer'
    };
    newlyUnlocked.push({
      id: ach.id,
      titleRu: ach.titleRu || ach.id,
      titleEn: ach.titleEn || ach.id,
      unlockedAtIso: iso
    });
  });

  if (store && newlyUnlocked.length > 0) {
    try {
      store.setItem(STEAM_ACHIEVEMENTS_CACHE_KEY, JSON.stringify(syncedMap));
    } catch {
      // ignore quota error
    }
  }

  return {
    newlyUnlocked,
    totalSynced: Object.keys(syncedMap).length,
    totalAchievements: (achievementsList || []).length,
    syncedMap
  };
}

export function loadSteamCloudManifest(storage = null) {
  const store = resolveStorage(storage);
  if (!store) return { slots: {}, totalBytes: 0, lastSyncIso: null };
  try {
    const raw = store.getItem(STEAM_CLOUD_MANIFEST_KEY);
    if (!raw) return { slots: {}, totalBytes: 0, lastSyncIso: null };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || !parsed.slots) {
      return { slots: {}, totalBytes: 0, lastSyncIso: null };
    }
    return parsed;
  } catch {
    return { slots: {}, totalBytes: 0, lastSyncIso: null };
  }
}

export function syncSaveToSteamCloud(
  slotKey,
  payload,
  { bridge = undefined, storage = null, now = new Date() } = {}
) {
  if (!slotKey || !payload || typeof payload !== 'object') {
    return { ok: false, reason: 'invalid_payload', bytes: 0 };
  }
  const activeBridge = resolveBridge(bridge);
  const store = resolveStorage(storage);
  const json = JSON.stringify(payload);
  const bytes = measureUtf8Bytes(json);

  if (bytes > STEAM_CLOUD_MAX_SLOT_BYTES) {
    return { ok: false, reason: 'slot_exceeds_limit', bytes };
  }

  const iso = now instanceof Date ? now.toISOString() : new Date(now).toISOString();
  const cloudFilename = `${String(slotKey).replace(/[^a-zA-Z0-9_-]/g, '_')}.imamat-save`;
  let transport = 'web_buffer';

  try {
    if (activeBridge && typeof activeBridge.writeCloudSave === 'function') {
      activeBridge.writeCloudSave(cloudFilename, json);
      transport = activeBridge.mode || 'steamworks';
    }
  } catch {
    transport = 'web_buffer';
  }

  const manifest = loadSteamCloudManifest(store);
  manifest.slots[slotKey] = {
    filename: cloudFilename,
    bytes,
    turn: Number(payload.turn) || 1,
    scenarioId: payload.activeScenarioId || 'camp_1845',
    savedIso: payload.savedIso || iso,
    syncedAtIso: iso,
    transport
  };
  manifest.totalBytes = Object.values(manifest.slots).reduce((acc, s) => acc + (s.bytes || 0), 0);
  manifest.lastSyncIso = iso;

  if (store) {
    try {
      store.setItem(STEAM_CLOUD_MANIFEST_KEY, JSON.stringify(manifest));
    } catch {
      // ignore storage quota errors
    }
  }

  return {
    ok: true,
    slotKey,
    filename: cloudFilename,
    bytes,
    totalBytes: manifest.totalBytes,
    quotaUsedPct: Number(((manifest.totalBytes / STEAM_CLOUD_QUOTA_BYTES) * 100).toFixed(4)),
    syncedAtIso: iso,
    transport,
    slotsCount: Object.keys(manifest.slots).length
  };
}

export function resolveCloudSaveConflict(localSave, cloudSave) {
  if (!localSave && !cloudSave) return { winner: 'none', reason: 'both_missing' };
  if (!localSave) return { winner: 'cloud', reason: 'local_missing', payload: cloudSave };
  if (!cloudSave) return { winner: 'local', reason: 'cloud_missing', payload: localSave };

  const localTs = Date.parse(localSave.savedIso || '') || 0;
  const cloudTs = Date.parse(cloudSave.savedIso || '') || 0;
  const localTurn = Number(localSave.turn) || 0;
  const cloudTurn = Number(cloudSave.turn) || 0;

  if (cloudTs !== localTs) {
    return cloudTs > localTs
      ? { winner: 'cloud', reason: 'newer_timestamp', payload: cloudSave }
      : { winner: 'local', reason: 'newer_timestamp', payload: localSave };
  }
  if (cloudTurn !== localTurn) {
    return cloudTurn > localTurn
      ? { winner: 'cloud', reason: 'higher_turn', payload: cloudSave }
      : { winner: 'local', reason: 'higher_turn', payload: localSave };
  }
  return { winner: 'equal', reason: 'identical_progress', payload: localSave };
}

export function triggerSteamOverlay(target = 'Achievements', { bridge = undefined } = {}) {
  const activeBridge = resolveBridge(bridge);
  if (activeBridge && typeof activeBridge.openSteamOverlay === 'function') {
    try {
      const ok = activeBridge.openSteamOverlay(target);
      if (ok !== false) {
        return {
          opened: true,
          target,
          hintRu: `Открыт Steam Overlay (${target})`,
          hintEn: `Steam Overlay opened (${target})`
        };
      }
    } catch {
      // fallback below
    }
  }
  return {
    opened: false,
    target,
    hintRu: 'Steam Overlay (Shift+Tab) активируется при запуске десктоп-версии через клиент Steam.',
    hintEn: 'Steam Overlay (Shift+Tab) activates when launching the desktop build through the Steam client.'
  };
}

export function validateSteamCapsuleManifest(measuredCapsules = []) {
  const byId = new Map((measuredCapsules || []).map((c) => [c.id, c]));
  const missing = [];
  const wrongDimensions = [];

  STEAM_STORE_CAPSULE_SPECS.forEach((spec) => {
    const found = byId.get(spec.id);
    if (!found) {
      if (spec.required) missing.push(spec.id);
      return;
    }
    if (found.width !== spec.width || found.height !== spec.height) {
      wrongDimensions.push(
        `${spec.id}: expected ${spec.width}x${spec.height}, got ${found.width}x${found.height}`
      );
    }
  });

  return {
    checkedCount: STEAM_STORE_CAPSULE_SPECS.length,
    missing,
    wrongDimensions,
    pass: missing.length === 0 && wrongDimensions.length === 0
  };
}
