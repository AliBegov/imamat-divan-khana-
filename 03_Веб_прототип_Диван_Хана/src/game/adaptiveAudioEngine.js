// ============================================================================
// АДАПТИВНЫЙ 3-СЛОЙНЫЙ АУДИО-ДВИЖОК И ТАКТИЛЬНЫЙ ОТКЛИК (Спринт 8 — Фаза 4 / Gate 4)
// Совет (Council) -> Марш (March) -> Бой (Battle) + 4-шинный микшер + persistence.
// Чистый ES-модуль без WebAudio/DOM зависимостей: полностью тестируется в Node.
// ============================================================================

export const AUDIO_MIXER_STORAGE_KEY = 'imamat_audio_mixer_v4';

export const DEFAULT_AUDIO_MIXER_CONFIG = {
  masterVolume: 0.85,
  musicVolume: 0.7,
  sfxVolume: 0.9,
  ambientVolume: 0.75,
  musicEnabled: true,
  hapticsEnabled: true,
  musicLayerOverride: 'auto', // 'auto' | 'council' | 'march' | 'battle'
  windLayerEnabled: false,
  copperBasinSonarEnabled: false,
  hearthWatermillEnabled: false
};

export const ADAPTIVE_MUSIC_LAYERS = [
  {
    id: 'council',
    nameRu: 'Совет Диван-ханы',
    nameEn: 'Divan-Khana Council',
    shortRu: 'Совет',
    shortEn: 'Council',
    icon: '🕯️',
    bpm: 64,
    scaleRu: 'Ре-дорийский • Бурдон и пандур',
    scaleEn: 'D-Dorian • Mountain Drone & Pandur',
    descRu: 'Спокойный тёплый бурдон квинты и редкие переборы горского пандура для долгих стратегических сессий.',
    descEn: 'Warm fifth drone and sparse highland pandur plucks tailored for comfortable long strategy sessions.'
  },
  {
    id: 'march',
    nameRu: 'Горный марш и разведка',
    nameEn: 'Highland March & Recon',
    shortRu: 'Марш',
    shortEn: 'March',
    icon: '🥁',
    bpm: 92,
    scaleRu: 'Доли 6/8 • Ритм переходов и дозоров',
    scaleEn: '6/8 Doli Drum • March & Patrol Pulse',
    descRu: 'Присоединяется мерный ритм кавказского барабана-доли и походный бас при движении сотен, гонцов и приближении колонн РИ.',
    descEn: 'Adds steady Caucasian doli drum cadence and marching bass when squadrons, couriers, or Imperial columns advance.'
  },
  {
    id: 'battle',
    nameRu: 'Штурм и осада ущелья',
    nameEn: 'Gorge Assault & Siege',
    shortRu: 'Бой',
    shortEn: 'Battle',
    icon: '⚔️',
    bpm: 118,
    scaleRu: 'Боевой набат • Рог, ударные и накал',
    scaleEn: 'War Drums • Highland Horn & Combat Tension',
    descRu: 'Напряжённый боевой ритм, двойные удары доли и квинтовые переклички горного рога в сражениях и при острых осадах.',
    descEn: 'Driving war percussion, double-time doli drums, and highland horn fifths during tactical battles and active sieges.'
  }
];

export const FOLEY_SOUNDBOARD_CATALOG = [
  { id: 'seal', category: 'council', labelRu: '🖋️ Печать Имама Шамиля', labelEn: '🖋️ Imam Shamil’s Wax Seal' },
  { id: 'silver_chime', category: 'council', labelRu: '🎖️ Звон кубачинского серебра', labelEn: '🎖️ Kubachi Silver Medal Chime' },
  { id: 'paper', category: 'council', labelRu: '📜 Шелест сургучной грамоты', labelEn: '📜 Parchment Decree Rustle' },
  { id: 'ui_tick', category: 'council', labelRu: '🪵 Щелчок орехового стола', labelEn: '🪵 Walnut Table Tactile Tick' },
  { id: 'gallop', category: 'march', labelRu: '🐎 Копыта горской конницы', labelEn: '🐎 Highland Cavalry Hooves' },
  { id: 'horn', category: 'march', labelRu: '📯 Рог сбора сотен', labelEn: '📯 Cavalry Rally Horn' },
  { id: 'felling_axes', category: 'march', labelRu: '🪓 Топоры буковой засеки', labelEn: '🪓 Beech Abatis Axes' },
  { id: 'eagle_cry', category: 'march', labelRu: '🦅 Клёкот беркута в скалах', labelEn: '🦅 Golden Eagle Cry' },
  { id: 'cannon', category: 'battle', labelRu: '💣 Единорог с горным эхом', labelEn: '💣 Unicorn Salvo & Mountain Echo' },
  { id: 'cannon_echo', category: 'battle', labelRu: '🏔️ 3D-залп теснины (HRTF)', labelEn: '🏔️ 3D Gorge Salvo (HRTF)' },
  { id: 'rifle', category: 'battle', labelRu: '🎯 Кремнёвка мюрида', labelEn: '🎯 Murid Flintlock Rifle' },
  { id: 'rifle_ricochet', category: 'battle', labelRu: '💥 Штуцер и рикошет о скалу', labelEn: '💥 Rifle & Rock Ricochet' },
  { id: 'blade', category: 'battle', labelRu: '⚔️ Клинок шашки и кинжала', labelEn: '⚔️ Shashka & Kindjal Steel' },
  { id: 'basin_ping', category: 'ambient', labelRu: '🥣 Медный таз Чоха (пеленг)', labelEn: '🥣 Chokh Copper Basin Ping' },
  { id: 'watermill_stamp', category: 'ambient', labelRu: '⚙️ Пороховая толчея Ведено', labelEn: '⚙️ Vedeno Powder Watermill' },
  { id: 'wind_gust', category: 'ambient', labelRu: '🌬️ Порыв ветра Ахк-Таш', labelEn: '🌬️ Ahk-Tash Gorge Wind' }
];

export function clampVolume(v, min = 0, max = 1.5, fallback = 0.85) {
  const num = Number(v);
  if (!Number.isFinite(num)) return fallback;
  return Math.max(min, Math.min(max, Math.round(num * 100) / 100));
}

export function normalizeAudioMixerConfig(raw = {}) {
  const src = raw && typeof raw === 'object' ? raw : {};
  const override = ['auto', 'council', 'march', 'battle'].includes(src.musicLayerOverride)
    ? src.musicLayerOverride
    : DEFAULT_AUDIO_MIXER_CONFIG.musicLayerOverride;
  return {
    masterVolume: clampVolume(src.masterVolume, 0, 1.5, DEFAULT_AUDIO_MIXER_CONFIG.masterVolume),
    musicVolume: clampVolume(src.musicVolume, 0, 1.2, DEFAULT_AUDIO_MIXER_CONFIG.musicVolume),
    sfxVolume: clampVolume(src.sfxVolume, 0, 1.3, DEFAULT_AUDIO_MIXER_CONFIG.sfxVolume),
    ambientVolume: clampVolume(src.ambientVolume, 0, 1.2, DEFAULT_AUDIO_MIXER_CONFIG.ambientVolume),
    musicEnabled:
      typeof src.musicEnabled === 'boolean' ? src.musicEnabled : DEFAULT_AUDIO_MIXER_CONFIG.musicEnabled,
    hapticsEnabled:
      typeof src.hapticsEnabled === 'boolean'
        ? src.hapticsEnabled
        : DEFAULT_AUDIO_MIXER_CONFIG.hapticsEnabled,
    musicLayerOverride: override,
    windLayerEnabled: Boolean(src.windLayerEnabled),
    copperBasinSonarEnabled: Boolean(src.copperBasinSonarEnabled),
    hearthWatermillEnabled: Boolean(src.hearthWatermillEnabled)
  };
}

export function loadAudioMixerConfig(storage = null) {
  const store =
    storage || (typeof globalThis !== 'undefined' && globalThis.localStorage ? globalThis.localStorage : null);
  if (!store) return { ...DEFAULT_AUDIO_MIXER_CONFIG };
  try {
    const raw = store.getItem(AUDIO_MIXER_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_AUDIO_MIXER_CONFIG };
    return normalizeAudioMixerConfig(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_AUDIO_MIXER_CONFIG };
  }
}

export function saveAudioMixerConfig(config, storage = null) {
  const normalized = normalizeAudioMixerConfig(config);
  const store =
    storage || (typeof globalThis !== 'undefined' && globalThis.localStorage ? globalThis.localStorage : null);
  if (!store) return normalized;
  try {
    store.setItem(AUDIO_MIXER_STORAGE_KEY, JSON.stringify(normalized));
  } catch {
    // Безопасный fallback при недоступном localStorage
  }
  return normalized;
}

/**
 * Вычисляет итоговые коэффициенты усиления 3 шин (music / sfx / ambient) с учётом мастер-громкости и mute.
 */
export function computeBusGains(config = DEFAULT_AUDIO_MIXER_CONFIG, soundEnabled = true) {
  const cfg = normalizeAudioMixerConfig(config);
  if (!soundEnabled || cfg.masterVolume <= 0) {
    return { master: 0, music: 0, sfx: 0, ambient: 0 };
  }
  return {
    master: cfg.masterVolume,
    music: cfg.musicEnabled ? Number((cfg.masterVolume * cfg.musicVolume).toFixed(3)) : 0,
    sfx: Number((cfg.masterVolume * cfg.sfxVolume).toFixed(3)),
    ambient: Number((cfg.masterVolume * cfg.ambientVolume).toFixed(3))
  };
}

/**
 * Определяет активный слой адаптивной музыки (Совет -> Марш -> Бой) и плавные веса всех 3 стемов.
 */
export function resolveAdaptiveMusicState({
  activeTab = 'map',
  hasTacticalEncounter = false,
  siegesCount = 0,
  activeEnvoysCount = 0,
  movingUnitsCount = 0,
  imminentStrikeTurns = 3,
  recentBattlePulse = false,
  overrideLayer = 'auto'
} = {}) {
  let layer = 'council';

  if (overrideLayer === 'council' || overrideLayer === 'march' || overrideLayer === 'battle') {
    layer = overrideLayer;
  } else if (
    hasTacticalEncounter ||
    activeTab === 'siege' ||
    activeTab === '3d_tactical' ||
    recentBattlePulse ||
    (activeTab === 'map' && siegesCount >= 2)
  ) {
    layer = 'battle';
  } else if (
    activeTab === 'map' &&
    (activeEnvoysCount > 0 || movingUnitsCount > 0 || imminentStrikeTurns <= 1 || siegesCount === 1)
  ) {
    layer = 'march';
  } else {
    layer = 'council';
  }

  // Плавное наложение стемов: Совет (бурдон) всегда держит гармоническую опору, Марш и Бой надстраиваются сверху
  const stemWeights =
    layer === 'battle'
      ? { council: 0.45, march: 0.85, battle: 1.0 }
      : layer === 'march'
        ? { council: 0.72, march: 1.0, battle: 0.0 }
        : { council: 1.0, march: 0.0, battle: 0.0 };

  const meta = ADAPTIVE_MUSIC_LAYERS.find((l) => l.id === layer) || ADAPTIVE_MUSIC_LAYERS[0];

  return {
    layer,
    bpm: meta.bpm,
    stemWeights,
    meta,
    isOverridden: overrideLayer !== 'auto'
  };
}

/**
 * Подбирает тип тактильного микро-отклика карты и звук для игрового события (< 50 мс реакция).
 */
export function resolveTactileCueForAction(actionType = 'map_click') {
  switch (actionType) {
    case 'cannon_salvo':
    case 'explosion':
      return {
        soundId: 'cannon',
        shakeClass: 'hud-map-shake-heavy',
        flashClass: 'hud-ember-flash',
        rippleColor: '#f97316',
        durationMs: 280
      };
    case 'order_award':
      return {
        soundId: 'silver_chime',
        shakeClass: '',
        flashClass: 'hud-silver-flash',
        rippleColor: '#fbbf24',
        durationMs: 420
      };
    case 'felt_shame':
      return {
        soundId: 'felt_thud',
        shakeClass: 'hud-map-shake-light',
        flashClass: '',
        rippleColor: '#f43f5e',
        durationMs: 260
      };
    case 'seal_decree':
    case 'envoy_dispatch':
      return {
        soundId: 'seal',
        shakeClass: 'hud-map-shake-light',
        flashClass: 'hud-seal-stamp',
        rippleColor: '#f59e0b',
        durationMs: 220
      };
    case 'cavalry_march':
      return {
        soundId: 'gallop',
        shakeClass: '',
        flashClass: '',
        rippleColor: '#34d399',
        durationMs: 260
      };
    case 'rifle_volley':
      return {
        soundId: 'rifle',
        shakeClass: 'hud-map-shake-light',
        flashClass: '',
        rippleColor: '#fb923c',
        durationMs: 180
      };
    default:
      return {
        soundId: 'ui_tick',
        shakeClass: '',
        flashClass: '',
        rippleColor: '#fcd34d',
        durationMs: 180
      };
  }
}
