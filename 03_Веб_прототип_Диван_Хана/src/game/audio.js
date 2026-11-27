// ============================================================================
// ПРОЦЕДУРНЫЙ АУДИО-ДВИЖОК 4.0 (WEB AUDIO API — ЕДИНЫЙ AUDIOCONTEXT БЕЗ УТЕЧЕК)
// 3-слойная адаптивная музыка (Совет -> Марш -> Бой) + аутентичные фоли Кавказа XIX века
// ============================================================================
import {
  DEFAULT_AUDIO_MIXER_CONFIG,
  computeBusGains,
  normalizeAudioMixerConfig,
  resolveAdaptiveMusicState
} from './adaptiveAudioEngine.js';

let sharedCtx = null;
let sharedMasterOut = null;
let ambientRig = null;
let adaptiveMusicRig = null;
let unlockBound = false;
let currentMixerConfig = { ...DEFAULT_AUDIO_MIXER_CONFIG };
let currentSoundEnabled = true;
let lastAmbientState = {
  enabled: false,
  activeTab: 'map',
  hasStorm: false,
  masterVolume: 0.85,
  ambientVolume: 0.75
};
let lastMusicState = {
  enabled: false,
  layer: 'council',
  stemWeights: { council: 1, march: 0, battle: 0 },
  musicGain: 0.55
};

export const setGlobalAudioMixerState = (config = DEFAULT_AUDIO_MIXER_CONFIG, soundEnabled = true) => {
  currentMixerConfig = normalizeAudioMixerConfig(config);
  currentSoundEnabled = Boolean(soundEnabled);
};

function getSharedAudioBus() {
  if (typeof window === 'undefined') return null;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;

  if (!sharedCtx || sharedCtx.state === 'closed') {
    sharedCtx = new AudioCtx();
    const compressor = sharedCtx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-15, sharedCtx.currentTime);
    compressor.knee.setValueAtTime(18, sharedCtx.currentTime);
    compressor.ratio.setValueAtTime(4, sharedCtx.currentTime);
    compressor.attack.setValueAtTime(0.004, sharedCtx.currentTime);
    compressor.release.setValueAtTime(0.22, sharedCtx.currentTime);
    compressor.connect(sharedCtx.destination);
    sharedMasterOut = compressor;
  }

  if (sharedCtx.state === 'suspended') {
    sharedCtx.resume().catch(() => {});
  }

  return { ctx: sharedCtx, out: sharedMasterOut };
}

function bindGestureUnlockOnce() {
  if (unlockBound || typeof window === 'undefined') return;
  unlockBound = true;
  const unlock = () => {
    window.setTimeout(() => {
      try {
        const bus = getSharedAudioBus();
        if (!bus) return;
        if (lastAmbientState.enabled) syncCaucasianAmbient(lastAmbientState);
        if (lastMusicState.enabled) applyAdaptiveMusicGains();
      } catch {
        // Игнорируем ограничения автозапуска
      }
    }, 0);
    window.removeEventListener('pointerdown', unlock);
    window.removeEventListener('click', unlock);
    window.removeEventListener('keydown', unlock);
  };
  window.addEventListener('pointerdown', unlock, { passive: true });
  window.addEventListener('click', unlock, { passive: true });
  window.addEventListener('keydown', unlock, { passive: true });
}

function ensureAmbientRig(ctx, out) {
  if (ambientRig && ambientRig.ctx === ctx) return ambientRig;

  // 4-секундный бесшовный буфер тёплого розово-коричневого шума (ветер ущелья Ахк-Таш / река Койсу / очаг)
  const durationSec = 4.0;
  const len = Math.floor(ctx.sampleRate * durationSec);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  let brown = 0;
  for (let i = 0; i < len; i++) {
    const white = Math.random() * 2 - 1;
    brown = (brown + 0.025 * white) / 1.025;
    // Плавная кросс-огибающая на краях буфера для бесшовного цикла
    const edge = Math.min(1, i / 1200, (len - 1 - i) / 1200);
    data[i] = brown * 2.8 * edge;
  }

  const noiseSrc = ctx.createBufferSource();
  noiseSrc.buffer = buf;
  noiseSrc.loop = true;

  // Канал А: Высокогорный ветер с медленной модуляцией LFO (0.09 Гц)
  const windFilter = ctx.createBiquadFilter();
  windFilter.type = 'bandpass';
  windFilter.frequency.setValueAtTime(270, ctx.currentTime);
  windFilter.Q.setValueAtTime(2.6, ctx.currentTime);

  const windLfo = ctx.createOscillator();
  windLfo.type = 'sine';
  windLfo.frequency.setValueAtTime(0.09, ctx.currentTime);
  const windLfoGain = ctx.createGain();
  windLfoGain.gain.setValueAtTime(75, ctx.currentTime);
  windLfo.connect(windLfoGain);
  windLfoGain.connect(windFilter.frequency);

  const windGain = ctx.createGain();
  windGain.gain.setValueAtTime(0.0001, ctx.currentTime);

  // Канал Б: Глубокий гул горной реки / тёплый фон каменных палат Диван-ханы
  const bedFilter = ctx.createBiquadFilter();
  bedFilter.type = 'lowpass';
  bedFilter.frequency.setValueAtTime(340, ctx.currentTime);

  const bedGain = ctx.createGain();
  bedGain.gain.setValueAtTime(0.0001, ctx.currentTime);

  noiseSrc.connect(windFilter);
  windFilter.connect(windGain);
  windGain.connect(out);

  noiseSrc.connect(bedFilter);
  bedFilter.connect(bedGain);
  bedGain.connect(out);

  noiseSrc.start();
  windLfo.start();

  ambientRig = {
    ctx,
    noiseSrc,
    windFilter,
    windGain,
    bedFilter,
    bedGain
  };
  return ambientRig;
}

// ============================================================================
// 3-СЛОЙНАЯ АДАПТИВНАЯ МУЗЫКА КАВКАЗА (СОВЕТ -> МАРШ -> БОЙ)
// Тёплое нераздражающее звучание в ре-дорийском ладу для долгих партий (Zero-Asset DSP)
// ============================================================================
const DORIAN_PANDUR_HZ = [293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25, 587.33]; // D4..D5
const COUNCIL_MELODY_IDX = [0, 4, 2, 1, 0, 5, 4, 2, 0, 3, 2, 1, 4, 2, 0, -1];
const MARCH_BASS_HZ = [73.42, 73.42, 65.41, 73.42, 87.31, 82.41, 65.41, 55.0]; // D2, C2, F2, E2, A1
const BATTLE_HORN_HZ = [146.83, 174.61, 164.81, 196.0, 220.0, 174.61, 146.83, 130.81]; // D3..A3

function schedulePandurPluck(ctx, dest, freq, time, vel = 0.08) {
  const osc = ctx.createOscillator();
  const harm = ctx.createOscillator();
  const filt = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  harm.type = 'sine';
  osc.frequency.setValueAtTime(freq, time);
  harm.frequency.setValueAtTime(freq * 2.0, time);
  filt.type = 'lowpass';
  filt.frequency.setValueAtTime(1450, time);
  filt.frequency.exponentialRampToValueAtTime(420, time + 0.65);

  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.linearRampToValueAtTime(vel, time + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0008, time + 0.78);

  const hGain = ctx.createGain();
  hGain.gain.setValueAtTime(0.24, time);

  osc.connect(filt);
  harm.connect(hGain);
  hGain.connect(filt);
  filt.connect(gain);
  gain.connect(dest);

  osc.start(time);
  harm.start(time);
  osc.stop(time + 0.82);
  harm.stop(time + 0.82);
}

function scheduleDoliHit(ctx, dest, time, isAccent = true, vel = 0.14) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(isAccent ? 108 : 168, time);
  osc.frequency.exponentialRampToValueAtTime(isAccent ? 46 : 78, time + 0.11);
  gain.gain.setValueAtTime(vel, time);
  gain.gain.exponentialRampToValueAtTime(0.0008, time + 0.14);
  osc.connect(gain);
  gain.connect(dest);
  osc.start(time);
  osc.stop(time + 0.15);
}

function scheduleBattleHornNote(ctx, dest, freq, time, dur = 0.72, vel = 0.055) {
  const osc = ctx.createOscillator();
  const fifth = ctx.createOscillator();
  const lp = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  fifth.type = 'triangle';
  osc.frequency.setValueAtTime(freq, time);
  fifth.frequency.setValueAtTime(freq * 1.498, time);
  lp.type = 'lowpass';
  lp.frequency.setValueAtTime(520, time);
  lp.frequency.linearRampToValueAtTime(760, time + dur * 0.4);
  lp.frequency.linearRampToValueAtTime(380, time + dur);
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.linearRampToValueAtTime(vel, time + 0.09);
  gain.gain.exponentialRampToValueAtTime(0.0008, time + dur);

  osc.connect(lp);
  fifth.connect(lp);
  lp.connect(gain);
  gain.connect(dest);
  osc.start(time);
  fifth.start(time);
  osc.stop(time + dur + 0.04);
  fifth.stop(time + dur + 0.04);
}

function ensureAdaptiveMusicRig(ctx, out) {
  if (adaptiveMusicRig && adaptiveMusicRig.ctx === ctx) return adaptiveMusicRig;

  const musicBus = ctx.createGain();
  musicBus.gain.setValueAtTime(0.0001, ctx.currentTime);
  const warmthLp = ctx.createBiquadFilter();
  warmthLp.type = 'lowpass';
  warmthLp.frequency.setValueAtTime(2400, ctx.currentTime);
  musicBus.connect(warmthLp);
  warmthLp.connect(out);

  const councilGain = ctx.createGain();
  councilGain.gain.setValueAtTime(0.0001, ctx.currentTime);
  councilGain.connect(musicBus);

  const marchGain = ctx.createGain();
  marchGain.gain.setValueAtTime(0.0001, ctx.currentTime);
  marchGain.connect(musicBus);

  const battleGain = ctx.createGain();
  battleGain.gain.setValueAtTime(0.0001, ctx.currentTime);
  battleGain.connect(musicBus);

  // Слой 1 (Совет): мягкий непрерывный квинтовый бурдон D2 + A2 с медленным дыханием LFO
  const droneRoot = ctx.createOscillator();
  const droneFifth = ctx.createOscillator();
  const droneLp = ctx.createBiquadFilter();
  const droneGain = ctx.createGain();
  const breathLfo = ctx.createOscillator();
  const breathDepth = ctx.createGain();

  droneRoot.type = 'sine';
  droneFifth.type = 'triangle';
  droneRoot.frequency.setValueAtTime(73.42, ctx.currentTime); // D2
  droneFifth.frequency.setValueAtTime(110.0, ctx.currentTime); // A2
  droneLp.type = 'lowpass';
  droneLp.frequency.setValueAtTime(280, ctx.currentTime);
  droneGain.gain.setValueAtTime(0.048, ctx.currentTime);

  breathLfo.type = 'sine';
  breathLfo.frequency.setValueAtTime(0.11, ctx.currentTime);
  breathDepth.gain.setValueAtTime(0.012, ctx.currentTime);
  breathLfo.connect(breathDepth);
  breathDepth.connect(droneGain.gain);

  droneRoot.connect(droneLp);
  droneFifth.connect(droneLp);
  droneLp.connect(droneGain);
  droneGain.connect(councilGain);

  droneRoot.start();
  droneFifth.start();
  breathLfo.start();

  let stepIdx = 0;
  const intervalId = window.setInterval(() => {
    if (!sharedCtx || sharedCtx.state !== 'running' || !lastMusicState.enabled) return;
    const now = sharedCtx.currentTime + 0.02;
    const weights = lastMusicState.stemWeights || { council: 1, march: 0, battle: 0 };

    // Слой 1: переборы горского пандура каждые 2 шага (комфортно для длинных сессий)
    if (weights.council > 0.05 && stepIdx % 2 === 0) {
      const noteIdx = COUNCIL_MELODY_IDX[(stepIdx / 2) % COUNCIL_MELODY_IDX.length];
      if (noteIdx >= 0) {
        schedulePandurPluck(sharedCtx, councilGain, DORIAN_PANDUR_HZ[noteIdx], now, 0.055);
      }
    }

    // Слой 2 (Марш): ритмичный доли (6/8 / марш) и походный бас
    if (weights.march > 0.05) {
      const beat = stepIdx % 4;
      if (beat === 0) {
        scheduleDoliHit(sharedCtx, marchGain, now, true, 0.13);
        const bassHz = MARCH_BASS_HZ[Math.floor(stepIdx / 4) % MARCH_BASS_HZ.length];
        schedulePandurPluck(sharedCtx, marchGain, bassHz * 2, now, 0.042);
      } else if (beat === 2) {
        scheduleDoliHit(sharedCtx, marchGain, now, false, 0.08);
      } else if (beat === 3) {
        scheduleDoliHit(sharedCtx, marchGain, now, false, 0.055);
      }
    }

    // Слой 3 (Бой): двойные боевые удары доли + квинтовый рог каждые 4 шага
    if (weights.battle > 0.05) {
      scheduleDoliHit(sharedCtx, battleGain, now, stepIdx % 2 === 0, stepIdx % 2 === 0 ? 0.14 : 0.09);
      if (stepIdx % 4 === 0) {
        const hFreq = BATTLE_HORN_HZ[Math.floor(stepIdx / 4) % BATTLE_HORN_HZ.length];
        scheduleBattleHornNote(sharedCtx, battleGain, hFreq, now, 0.72, 0.048);
      }
    }

    stepIdx = (stepIdx + 1) % 64;
  }, 340);

  adaptiveMusicRig = {
    ctx,
    musicBus,
    councilGain,
    marchGain,
    battleGain,
    intervalId
  };
  return adaptiveMusicRig;
}

function applyAdaptiveMusicGains() {
  if (!sharedCtx || sharedCtx.state !== 'running') return;
  const bus = getSharedAudioBus();
  if (!bus || bus.ctx.state !== 'running') return;
  const rig = ensureAdaptiveMusicRig(bus.ctx, bus.out);
  const now = bus.ctx.currentTime;
  const targetMaster = lastMusicState.enabled ? Math.max(0.0001, lastMusicState.musicGain * 0.75) : 0.0001;
  const w = lastMusicState.stemWeights || { council: 1, march: 0, battle: 0 };
  rig.musicBus.gain.setTargetAtTime(targetMaster, now, 0.45);
  rig.councilGain.gain.setTargetAtTime(Math.max(0.0001, w.council), now, 0.75);
  rig.marchGain.gain.setTargetAtTime(Math.max(0.0001, w.march), now, 0.75);
  rig.battleGain.gain.setTargetAtTime(Math.max(0.0001, w.battle), now, 0.65);
}

/**
 * Синхронизирует 3-слойную адаптивную музыку (Совет -> Марш -> Бой) с живым состоянием кампании.
 */
export const syncAdaptiveMusicScore = ({
  enabled = true,
  mixerConfig = DEFAULT_AUDIO_MIXER_CONFIG,
  activeTab = 'map',
  hasTacticalEncounter = false,
  siegesCount = 0,
  activeEnvoysCount = 0,
  movingUnitsCount = 0,
  imminentStrikeTurns = 3,
  recentBattlePulse = false
} = {}) => {
  const cfg = normalizeAudioMixerConfig(mixerConfig);
  const gains = computeBusGains(cfg, enabled);
  const resolved = resolveAdaptiveMusicState({
    activeTab,
    hasTacticalEncounter,
    siegesCount,
    activeEnvoysCount,
    movingUnitsCount,
    imminentStrikeTurns,
    recentBattlePulse,
    overrideLayer: cfg.musicLayerOverride
  });

  lastMusicState = {
    enabled: Boolean(enabled && cfg.musicEnabled && gains.music > 0.001),
    layer: resolved.layer,
    stemWeights: resolved.stemWeights,
    musicGain: gains.music
  };

  bindGestureUnlockOnce();
  if (typeof window === 'undefined' || !sharedCtx) return resolved;

  try {
    if (sharedCtx.state === 'running') {
      applyAdaptiveMusicGains();
    }
  } catch {
    // Безопасный выход при ограничениях автозапуска
  }
  return resolved;
};

// Автономный диегетический эмбиент Кавказа (меняет акустику между 3D-Столом/Ущельем и палатами Совета)
export const syncCaucasianAmbient = ({
  enabled = true,
  activeTab = 'map',
  hasStorm = false,
  masterVolume = 0.85,
  ambientVolume = 0.75
} = {}) => {
  lastAmbientState = { enabled, activeTab, hasStorm, masterVolume, ambientVolume };
  bindGestureUnlockOnce();
  if (typeof window === 'undefined') return;

  try {
    if (!enabled) {
      if (ambientRig && sharedCtx && sharedCtx.state === 'running') {
        const now = sharedCtx.currentTime;
        ambientRig.windGain.gain.setTargetAtTime(0.0001, now, 0.25);
        ambientRig.bedGain.gain.setTargetAtTime(0.0001, now, 0.25);
      }
      return;
    }

    // Не создаём контекст до первого жеста пользователя, если его ещё нет
    if (!sharedCtx) return;
    const bus = getSharedAudioBus();
    if (!bus || bus.ctx.state !== 'running') return;

    const rig = ensureAmbientRig(bus.ctx, bus.out);
    const now = bus.ctx.currentTime;
    const isOutdoorTheater =
      activeTab === 'map' || activeTab === 'siege' || activeTab === '3d_tactical';
    const vol = Math.max(0.0, Math.min(1.5, masterVolume * ambientVolume));

    const targetWind = isOutdoorTheater
      ? (hasStorm ? 0.042 : 0.024) * vol
      : 0.008 * vol;
    const targetBed = isOutdoorTheater
      ? (hasStorm ? 0.032 : 0.018) * vol
      : 0.014 * vol;
    const targetFreq = isOutdoorTheater ? (hasStorm ? 340 : 265) : 185;

    rig.windFilter.frequency.setTargetAtTime(targetFreq, now, 0.6);
    rig.windGain.gain.setTargetAtTime(Math.max(0.0001, targetWind), now, 0.45);
    rig.bedGain.gain.setTargetAtTime(Math.max(0.0001, targetBed), now, 0.45);
  } catch {
    // Безопасное игнорирование ограничений автозапуска браузера
  }
};

export const playHistoricalSound = (type, enabled = true, extraParams = {}) => {
  if (!enabled || !currentSoundEnabled || typeof window === 'undefined') return;
  try {
    const bus = getSharedAudioBus();
    if (!bus) return;
    const { ctx, out } = bus;
    const now = ctx.currentTime;
    const busGains = computeBusGains(currentMixerConfig, true);
    const isAmbientShot = type === 'wind_gust' || type === 'basin_ping' || type === 'watermill_stamp';
    const baseBusVol = isAmbientShot ? busGains.ambient : busGains.sfx;
    const masterVol =
      typeof extraParams.volume === 'number'
        ? Math.max(0, Math.min(1.6, extraParams.volume * (isAmbientShot ? currentMixerConfig.ambientVolume : currentMixerConfig.sfxVolume)))
        : baseBusVol;
    if (masterVol <= 0.001) return;

    // Если эмбиент или 3-слойная музыка ожидали первого клика — пробуждаем асинхронно, не блокируя <50мс отклик клика!
    if ((lastAmbientState.enabled && !ambientRig) || (lastMusicState.enabled && !adaptiveMusicRig)) {
      window.setTimeout(() => {
        if (lastAmbientState.enabled && !ambientRig && ctx.state === 'running') {
          syncCaucasianAmbient(lastAmbientState);
        }
        if (lastMusicState.enabled && !adaptiveMusicRig && ctx.state === 'running') {
          applyAdaptiveMusicGains();
        }
      }, 16);
    }

    if (type === 'gallop' || type === 'cavalry') {
      // Аутентичные копыта горской конницы по каменистой тропе (2 сдвинутых всадника + цокот подков)
      const hoofOffsets = [0, 0.095, 0.195, 0.36, 0.455, 0.56, 0.045, 0.255, 0.505];
      hoofOffsets.forEach((offset, idx) => {
        const isLead = idx < 6;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(isLead ? 148 + (idx % 3) * 14 : 118, now + offset);
        osc.frequency.exponentialRampToValueAtTime(42, now + offset + 0.065);
        gain.gain.setValueAtTime((isLead ? 0.17 : 0.09) * masterVol, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.075);
        osc.connect(gain);
        gain.connect(out);
        osc.start(now + offset);
        osc.stop(now + offset + 0.08);

        // Короткий цокот железной подковы о известняк
        const clackLen = Math.floor(ctx.sampleRate * 0.022);
        const cBuf = ctx.createBuffer(1, clackLen, ctx.sampleRate);
        const cCh = cBuf.getChannelData(0);
        for (let i = 0; i < clackLen; i++) {
          cCh[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.007));
        }
        const cSrc = ctx.createBufferSource();
        cSrc.buffer = cBuf;
        const cBp = ctx.createBiquadFilter();
        cBp.type = 'bandpass';
        cBp.frequency.setValueAtTime(2250 + (idx % 3) * 280, now + offset);
        cBp.Q.setValueAtTime(3.0, now + offset);
        const cGain = ctx.createGain();
        cGain.gain.setValueAtTime((isLead ? 0.11 : 0.06) * masterVol, now + offset);
        cSrc.connect(cBp);
        cBp.connect(cGain);
        cGain.connect(out);
        cSrc.start(now + offset);
      });
    } else if (type === 'seal') {
      // Аутентичная сургучная печать Имама Шамиля: шуршание воска + тяжёлый латунный штамп + отрыв печати
      const waxLen = Math.floor(ctx.sampleRate * 0.09);
      const waxBuf = ctx.createBuffer(1, waxLen, ctx.sampleRate);
      const wCh = waxBuf.getChannelData(0);
      for (let i = 0; i < waxLen; i++) {
        wCh[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.03));
      }
      const wSrc = ctx.createBufferSource();
      wSrc.buffer = waxBuf;
      const wBp = ctx.createBiquadFilter();
      wBp.type = 'bandpass';
      wBp.frequency.setValueAtTime(980, now);
      wBp.Q.setValueAtTime(1.8, now);
      const wGain = ctx.createGain();
      wGain.gain.setValueAtTime(0.16 * masterVol, now);
      wSrc.connect(wBp);
      wBp.connect(wGain);
      wGain.connect(out);
      wSrc.start(now);

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(118, now + 0.015);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.22);
      gain.gain.setValueAtTime(0.36 * masterVol, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(out);
      osc.start(now + 0.015);
      osc.stop(now + 0.26);

      const ring = ctx.createOscillator();
      const rGain = ctx.createGain();
      ring.type = 'triangle';
      ring.frequency.setValueAtTime(760, now + 0.04);
      ring.frequency.exponentialRampToValueAtTime(520, now + 0.14);
      rGain.gain.setValueAtTime(0.065 * masterVol, now + 0.04);
      rGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      ring.connect(rGain);
      rGain.connect(out);
      ring.start(now + 0.04);
      ring.stop(now + 0.16);
    } else if (type === 'silver_chime') {
      // Звон чеканного кубачинского серебра ордена Шамиля (4 чистых серебряных обертона + мягкий отзвук)
      const silverPartials = [
        [1865, 0.13, 0.85],
        [2970, 0.085, 0.68],
        [4420, 0.05, 0.48],
        [6180, 0.028, 0.32]
      ];
      silverPartials.forEach(([freq, amp, dur], idx) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.012);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.996, now + dur);
        g.gain.setValueAtTime(0.0001, now + idx * 0.012);
        g.gain.linearRampToValueAtTime(amp * masterVol, now + idx * 0.012 + 0.006);
        g.gain.exponentialRampToValueAtTime(0.0006, now + idx * 0.012 + dur);
        osc.connect(g);
        g.connect(out);
        osc.start(now + idx * 0.012);
        osc.stop(now + idx * 0.012 + dur + 0.02);
      });
    } else if (type === 'felt_thud') {
      // Глухой хлопок грубого горского войлока (дисциплинарный знак позора Низама)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(84, now);
      osc.frequency.exponentialRampToValueAtTime(36, now + 0.14);
      gain.gain.setValueAtTime(0.26 * masterVol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
      osc.connect(gain);
      gain.connect(out);
      osc.start(now);
      osc.stop(now + 0.17);
    } else if (type === 'ui_tick') {
      // Ультра-быстрый тактильный щелчок орехового стола / латунного тумблера (< 1 мс атака)
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1120, now);
      osc.frequency.exponentialRampToValueAtTime(420, now + 0.024);
      g.gain.setValueAtTime(0.065 * masterVol, now);
      g.gain.exponentialRampToValueAtTime(0.0008, now + 0.028);
      osc.connect(g);
      g.connect(out);
      osc.start(now);
      osc.stop(now + 0.03);
    } else if (type === 'rifle') {
      // Кремнёвый штуцер мюрида: искра замка + резкий щелчок + горный отзвук
      const sLen = Math.floor(ctx.sampleRate * 0.22);
      const sBuf = ctx.createBuffer(1, sLen, ctx.sampleRate);
      const sData = sBuf.getChannelData(0);
      for (let i = 0; i < sLen; i++) {
        sData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.042));
      }
      const sSrc = ctx.createBufferSource();
      sSrc.buffer = sBuf;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(1420, now);
      bp.Q.setValueAtTime(1.3, now);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.24 * masterVol, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.21);
      sSrc.connect(bp);
      bp.connect(g);
      g.connect(out);
      sSrc.start(now);
    } else if (type === 'paper') {
      // Шелест плотной архивной бумаги и карт Генерального штаба XIX века
      const bufLen = Math.floor(ctx.sampleRate * 0.14);
      const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
      const ch = buf.getChannelData(0);
      for (let i = 0; i < bufLen; i++) {
        ch[i] = (Math.random() * 2 - 1) * Math.sin((Math.PI * i) / bufLen) * Math.exp(-i / (ctx.sampleRate * 0.09));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buf;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(1650, now);
      bp.Q.setValueAtTime(1.9, now);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.14 * masterVol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      noise.connect(bp);
      bp.connect(gain);
      gain.connect(out);
      noise.start(now);
    } else if (type === 'cannon') {
      // Залп горного единорога с 3-кратным эхом кавказских скал (0.0с / 0.26с / 0.56с)
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(92, now);
      subOsc.frequency.exponentialRampToValueAtTime(28, now + 0.32);
      subGain.gain.setValueAtTime(0.36 * masterVol, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.36);
      subOsc.connect(subGain);
      subGain.connect(out);
      subOsc.start(now);
      subOsc.stop(now + 0.38);

      [
        [0, 0.44, 280, 0.52],
        [0.26, 0.18, 195, 0.46],
        [0.56, 0.09, 145, 0.42]
      ].forEach(([delay, amp, cutoff, dur]) => {
        const bufferSize = Math.floor(ctx.sampleRate * dur);
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * (dur * 0.32)));
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(cutoff, now + delay);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(amp * masterVol, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.005, now + delay + dur);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(out);
        noise.start(now + delay);
      });
    } else if (type === 'thunder') {
      // Далёкий раскат грозы над Главным Кавказским хребтом
      const bufLen = Math.floor(ctx.sampleRate * 1.15);
      const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
      const ch = buf.getChannelData(0);
      for (let i = 0; i < bufLen; i++) {
        ch[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.42));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buf;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(135, now);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.26 * masterVol, now);
      gain.gain.exponentialRampToValueAtTime(0.002, now + 1.12);
      noise.connect(lp);
      lp.connect(gain);
      gain.connect(out);
      noise.start(now);
    } else if (type === 'blade') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(920, now);
      osc.frequency.exponentialRampToValueAtTime(2400, now + 0.08);
      osc.frequency.exponentialRampToValueAtTime(680, now + 0.28);
      gain.gain.setValueAtTime(0.15 * masterVol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(out);
      osc.start(now);
      osc.stop(now + 0.31);
    } else if (type === 'horn') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(196, now);
      osc.frequency.setValueAtTime(246.94, now + 0.18);
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, now);
      gain.gain.setValueAtTime(0.16 * masterVol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(out);
      osc.start(now);
      osc.stop(now + 0.56);
    } else if (type === 'basin_ping') {
      // Акустический пеленг медного таза Хаджи-Юсуфа Сафарова:
      // Частота и звон зависят от дистанции русского минного подкопа D_mine (в саженях)
      const mineDist = Math.max(1.5, Math.min(16.0, extraParams.mineDistance || 8.0));
      const baseFreq = 520 + 480 / mineDist;
      const thudOsc = ctx.createOscillator();
      const thudGain = ctx.createGain();
      thudOsc.type = 'sine';
      thudOsc.frequency.setValueAtTime(72, now);
      thudOsc.frequency.exponentialRampToValueAtTime(34, now + 0.09);
      thudGain.gain.setValueAtTime(0.22 * masterVol, now);
      thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
      thudOsc.connect(thudGain);
      thudGain.connect(out);
      thudOsc.start(now);
      thudOsc.stop(now + 0.12);

      [1.0, 2.76].forEach((harm, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq * harm, now + 0.08);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * harm * 0.985, now + 0.52);
        gain.gain.setValueAtTime((idx === 0 ? 0.16 : 0.07) * masterVol, now + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
        osc.connect(gain);
        gain.connect(out);
        osc.start(now + 0.08);
        osc.stop(now + 0.56);
      });
    } else if (type === 'watermill_stamp') {
      const stampOsc = ctx.createOscillator();
      const stampGain = ctx.createGain();
      stampOsc.type = 'triangle';
      stampOsc.frequency.setValueAtTime(112, now);
      stampOsc.frequency.exponentialRampToValueAtTime(42, now + 0.14);
      stampGain.gain.setValueAtTime(0.2 * masterVol, now);
      stampGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
      stampOsc.connect(stampGain);
      stampGain.connect(out);
      stampOsc.start(now);
      stampOsc.stop(now + 0.17);

      const bufLen = Math.floor(ctx.sampleRate * 0.22);
      const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
      const ch = buf.getChannelData(0);
      for (let i = 0; i < bufLen; i++) {
        ch[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.07));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buf;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(1150, now + 0.04);
      bp.Q.setValueAtTime(3.2, now + 0.04);
      const nGain = ctx.createGain();
      nGain.gain.setValueAtTime(0.11 * masterVol, now + 0.04);
      nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      noise.connect(bp);
      bp.connect(nGain);
      nGain.connect(out);
      noise.start(now + 0.04);
    } else if (type === 'wind_gust') {
      const bufLen = Math.floor(ctx.sampleRate * 0.85);
      const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
      const ch = buf.getChannelData(0);
      for (let i = 0; i < bufLen; i++) {
        const env = Math.sin((Math.PI * i) / bufLen);
        ch[i] = (Math.random() * 2 - 1) * env;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buf;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(280, now);
      bp.frequency.linearRampToValueAtTime(490, now + 0.42);
      bp.frequency.linearRampToValueAtTime(240, now + 0.84);
      bp.Q.setValueAtTime(4.0, now);
      const wGain = ctx.createGain();
      wGain.gain.setValueAtTime(0.18 * masterVol, now);
      wGain.gain.exponentialRampToValueAtTime(0.005, now + 0.84);
      noise.connect(bp);
      bp.connect(wGain);
      wGain.connect(out);
      noise.start(now);
    } else if (type === 'cannon_echo') {
      playSpatialBattleSound(
        'cannon_3d',
        { x: 6.5, y: 2.2, z: 0.4 },
        { enabled: true, environment: 'gorge', volume: masterVol, forceUnlock: true }
      );
    } else if (type === 'rifle_ricochet') {
      playSpatialBattleSound(
        'rifle_murid_3d',
        { x: -4.2, y: 2.8, z: -0.6 },
        { enabled: true, environment: 'gorge', volume: masterVol, forceUnlock: true }
      );
      playSpatialBattleSound(
        'ricochet_3d',
        { x: 2.4, y: 1.9, z: 0.5 },
        { enabled: true, environment: 'gorge', volume: masterVol, forceUnlock: true, bypassCooldown: true }
      );
    } else if (type === 'felling_axes') {
      playSpatialBattleSound(
        'felling_axes_3d',
        { x: -1.2, y: 1.5, z: 0.0 },
        { enabled: true, environment: 'forest', volume: masterVol, forceUnlock: true }
      );
    } else if (type === 'eagle_cry') {
      playSpatialBattleSound(
        'eagle_cry_3d',
        { x: -2.0, y: 9.5, z: -3.0 },
        { enabled: true, environment: 'gorge', volume: masterVol, forceUnlock: true, bypassCooldown: true }
      );
    }
  } catch {
    // Игнорируем ограничения автозапуска аудио в браузере
  }
};

// ============================================================================
// ПРОСТРАНСТВЕННАЯ 3D-АКУСТИКА ГОРНОГО БОЯ (HRTF PANNER + ЭХО СКАЛ И РЕКИ КОЙСУ)
// ============================================================================
let spatialRig = null;
let lastSpatialSyncMs = 0;
let activeSpatialVoices = 0;
const lastSpatialShotAt = new Map();

function buildImpulseResponse(ctx, durationSec, taps, lpCutoffStart, decayRate) {
  const len = Math.floor(ctx.sampleRate * durationSec);
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  const chL = buf.getChannelData(0);
  const chR = buf.getChannelData(1);

  let lpL = 0;
  let lpR = 0;
  const alphaBase = Math.min(0.85, (2 * Math.PI * lpCutoffStart) / ctx.sampleRate);

  for (let i = 0; i < len; i++) {
    const t = i / durationSec / ctx.sampleRate;
    const env = Math.pow(1 - t, decayRate);
    const damp = alphaBase * (1 - t * 0.65);
    lpL += damp * ((Math.random() * 2 - 1) * env * 0.34 - lpL);
    lpR += damp * ((Math.random() * 2 - 1) * env * 0.34 - lpR);
    chL[i] = lpL;
    chR[i] = lpR;
  }

  // Дискретные ранние отражения от известняковых стен каньона / стволов вековых буков
  taps.forEach(([delaySec, ampL, ampR]) => {
    const startIdx = Math.floor(delaySec * ctx.sampleRate);
    const burstSamples = Math.floor(0.038 * ctx.sampleRate);
    for (let k = 0; k < burstSamples && startIdx + k < len; k++) {
      const w = Math.sin((Math.PI * k) / burstSamples) * Math.exp(-k / (burstSamples * 0.45));
      const n = (Math.random() * 2 - 1) * w;
      chL[startIdx + k] += n * ampL;
      chR[startIdx + k] += n * ampR;
    }
  });

  return buf;
}

function ensureSpatialBattleRig(ctx, out) {
  if (spatialRig && spatialRig.ctx === ctx) return spatialRig;

  // 1. Импульсный отклик известняковой теснины Дагестана (1.65 с, 4 эхо-отскока от скал)
  const canyonConvolver = ctx.createConvolver();
  canyonConvolver.buffer = buildImpulseResponse(
    ctx,
    1.65,
    [
      [0.108, 0.62, 0.24],
      [0.232, 0.22, 0.54],
      [0.385, 0.38, 0.19],
      [0.565, 0.16, 0.29]
    ],
    1450,
    2.55
  );
  const canyonWetGain = ctx.createGain();
  canyonWetGain.gain.setValueAtTime(0.52, ctx.currentTime);
  canyonConvolver.connect(canyonWetGain);
  canyonWetGain.connect(out);

  // 2. Импульсный отклик букового леса Ичкерии (0.85 с, плотное рассеяние в кронах)
  const forestConvolver = ctx.createConvolver();
  forestConvolver.buffer = buildImpulseResponse(
    ctx,
    0.85,
    [
      [0.055, 0.44, 0.32],
      [0.135, 0.28, 0.42],
      [0.245, 0.21, 0.18]
    ],
    1850,
    3.2
  );
  const forestWetGain = ctx.createGain();
  forestWetGain.gain.setValueAtTime(0.38, ctx.currentTime);
  forestConvolver.connect(forestWetGain);
  forestWetGain.connect(out);

  // 3. Бесшовный 3D-источник горной реки Койсу / лесного ручья Ичкерии (3.2 с)
  const wLen = Math.floor(ctx.sampleRate * 3.2);
  const wBuf = ctx.createBuffer(1, wLen, ctx.sampleRate);
  const wData = wBuf.getChannelData(0);
  let lowState = 0;
  for (let i = 0; i < wLen; i++) {
    const white = Math.random() * 2 - 1;
    lowState = (lowState + 0.065 * white) / 1.065;
    const edge = Math.min(1, i / 1600, (wLen - 1 - i) / 1600);
    const rapids = white * 0.26 * (0.72 + 0.28 * Math.sin((i / wLen) * Math.PI * 6));
    wData[i] = (lowState * 1.85 + rapids) * edge;
  }

  const riverSrc = ctx.createBufferSource();
  riverSrc.buffer = wBuf;
  riverSrc.loop = true;

  const riverFilter = ctx.createBiquadFilter();
  riverFilter.type = 'bandpass';
  riverFilter.frequency.setValueAtTime(620, ctx.currentTime);
  riverFilter.Q.setValueAtTime(0.85, ctx.currentTime);

  const riverPanner = ctx.createPanner();
  riverPanner.panningModel = 'HRTF';
  riverPanner.distanceModel = 'inverse';
  riverPanner.refDistance = 3.4;
  riverPanner.maxDistance = 52;
  riverPanner.rolloffFactor = 1.22;

  const riverGain = ctx.createGain();
  riverGain.gain.setValueAtTime(0.0001, ctx.currentTime);

  riverSrc.connect(riverFilter);
  riverFilter.connect(riverPanner);
  riverPanner.connect(riverGain);
  riverGain.connect(out);

  // 4. Атмосферный слой горного ливня / метели
  const precipSrc = ctx.createBufferSource();
  precipSrc.buffer = wBuf;
  precipSrc.loop = true;
  precipSrc.playbackRate.setValueAtTime(1.32, ctx.currentTime);

  const precipFilter = ctx.createBiquadFilter();
  precipFilter.type = 'bandpass';
  precipFilter.frequency.setValueAtTime(1750, ctx.currentTime);
  precipFilter.Q.setValueAtTime(0.95, ctx.currentTime);

  const precipGain = ctx.createGain();
  precipGain.gain.setValueAtTime(0.0001, ctx.currentTime);

  precipSrc.connect(precipFilter);
  precipFilter.connect(precipGain);
  precipGain.connect(out);

  riverSrc.start();
  precipSrc.start();

  spatialRig = {
    ctx,
    canyonConvolver,
    forestConvolver,
    riverFilter,
    riverPanner,
    riverGain,
    precipFilter,
    precipGain
  };
  return spatialRig;
}

function setNodePos3D(node, x, y, z, now) {
  if (node.positionX) {
    node.positionX.setTargetAtTime(x, now, 0.05);
    node.positionY.setTargetAtTime(y, now, 0.05);
    node.positionZ.setTargetAtTime(z, now, 0.05);
  } else if (node.setPosition) {
    node.setPosition(x, y, z);
  }
}

export const unlockSpatialBattleAudio = (enabled = true) => {
  if (!enabled || typeof window === 'undefined') return;
  try {
    const bus = getSharedAudioBus();
    if (bus && bus.ctx.state === 'running') {
      ensureSpatialBattleRig(bus.ctx, bus.out);
    }
  } catch {
    // Безопасное игнорирование политики автозапуска
  }
};

export const suspendSpatialBattleAudio = () => {
  if (!spatialRig || !sharedCtx || sharedCtx.state !== 'running') return;
  try {
    const now = sharedCtx.currentTime;
    spatialRig.riverGain.gain.setTargetAtTime(0.0001, now, 0.18);
    spatialRig.precipGain.gain.setTargetAtTime(0.0001, now, 0.18);
  } catch {
    // Игнорируем закрытый контекст
  }
};

/**
 * Синхронизирует 3D-слушателя WebAudio с камерой Three.js и позиционирует шум горной реки / осадков.
 */
export const updateSpatialBattleScape = ({
  enabled = true,
  mode = 'gorge',
  camera = null,
  riverPoint = null,
  weatherMode = 'clear',
  masterVolume = 0.85
} = {}) => {
  if (typeof window === 'undefined') return;
  const nowPerf = performance.now();
  if (nowPerf - lastSpatialSyncMs < 48) return;
  lastSpatialSyncMs = nowPerf;

  if (!enabled) {
    suspendSpatialBattleAudio();
    return;
  }
  if (!sharedCtx || sharedCtx.state !== 'running') return;

  try {
    const bus = getSharedAudioBus();
    if (!bus || bus.ctx.state !== 'running') return;
    const rig = ensureSpatialBattleRig(bus.ctx, bus.out);
    const now = bus.ctx.currentTime;
    const vol = Math.max(0.1, Math.min(1.5, masterVolume));

    if (camera && camera.position) {
      const listener = bus.ctx.listener;
      const cx = camera.position.x || 0;
      const cy = camera.position.y || 0;
      const cz = camera.position.z || 0;
      setNodePos3D(listener, cx, cy, cz, now);

      if (camera.matrixWorld && camera.matrixWorld.elements) {
        const e = camera.matrixWorld.elements;
        // В Three.js камера смотрит вдоль локальной оси -Z, вектор вверх +Y
        const fx = -e[8];
        const fy = -e[9];
        const fz = -e[10];
        const ux = e[4];
        const uy = e[5];
        const uz = e[6];
        if (listener.forwardX) {
          listener.forwardX.setTargetAtTime(fx, now, 0.05);
          listener.forwardY.setTargetAtTime(fy, now, 0.05);
          listener.forwardZ.setTargetAtTime(fz, now, 0.05);
          listener.upX.setTargetAtTime(ux, now, 0.05);
          listener.upY.setTargetAtTime(uy, now, 0.05);
          listener.upZ.setTargetAtTime(uz, now, 0.05);
        } else if (listener.setOrientation) {
          listener.setOrientation(fx, fy, fz, ux, uy, uz);
        }
      }
    }

    if (riverPoint) {
      setNodePos3D(rig.riverPanner, riverPoint.x || 0, riverPoint.y || 1.1, riverPoint.z || 0, now);
      const baseRiverGain =
        mode === 'gorge' ? 0.22 : mode === 'forest' ? 0.14 : 0.085;
      const riverFreq = mode === 'gorge' ? 560 : 790;
      rig.riverFilter.frequency.setTargetAtTime(riverFreq, now, 0.25);
      rig.riverGain.gain.setTargetAtTime(baseRiverGain * vol, now, 0.18);
    } else {
      rig.riverGain.gain.setTargetAtTime(0.0001, now, 0.2);
    }

    if (weatherMode === 'rain') {
      rig.precipFilter.frequency.setTargetAtTime(1920, now, 0.3);
      rig.precipGain.gain.setTargetAtTime(0.055 * vol, now, 0.25);
    } else if (weatherMode === 'snow') {
      rig.precipFilter.frequency.setTargetAtTime(420, now, 0.3);
      rig.precipGain.gain.setTargetAtTime(0.032 * vol, now, 0.25);
    } else {
      rig.precipGain.gain.setTargetAtTime(0.0001, now, 0.25);
    }
  } catch {
    // Безопасный выход при недоступном аудиоконтексте
  }
};

/**
 * Воспроизводит позиционированный в 3D-пространстве боевой звук с HRTF-панорамой и эхом скал/леса.
 */
export const playSpatialBattleSound = (
  type,
  worldPos = { x: 0, y: 1.5, z: 0 },
  {
    enabled = true,
    environment = 'gorge',
    volume = 1.0,
    forceUnlock = false,
    bypassCooldown = false
  } = {}
) => {
  if (!enabled || typeof window === 'undefined') return;
  if (!forceUnlock && (!sharedCtx || sharedCtx.state !== 'running')) return;
  if (activeSpatialVoices >= 10) return;

  const nowMs = performance.now();
  const minGap =
    type === 'eagle_cry_3d'
      ? 4800
      : type === 'ricochet_3d'
      ? 260
      : type.startsWith('rifle_')
      ? 105
      : 115;
  if (!bypassCooldown) {
    const prevMs = lastSpatialShotAt.get(type) || 0;
    if (nowMs - prevMs < minGap) return;
  }
  lastSpatialShotAt.set(type, nowMs);

  try {
    const bus = getSharedAudioBus();
    if (!bus || bus.ctx.state !== 'running') return;
    const { ctx, out } = bus;
    const rig = ensureSpatialBattleRig(ctx, out);
    const now = ctx.currentTime;
    const vol = Math.max(0.08, Math.min(1.5, volume));

    const panner = ctx.createPanner();
    panner.panningModel = 'HRTF';
    panner.distanceModel = 'inverse';
    panner.refDistance = environment === 'strategic' ? 14.0 : 6.2;
    panner.maxDistance = environment === 'strategic' ? 140.0 : 68.0;
    panner.rolloffFactor = environment === 'strategic' ? 0.65 : 0.82;
    if (panner.positionX) {
      panner.positionX.setValueAtTime(worldPos.x || 0, now);
      panner.positionY.setValueAtTime(worldPos.y || 0, now);
      panner.positionZ.setValueAtTime(worldPos.z || 0, now);
    } else if (panner.setPosition) {
      panner.setPosition(worldPos.x || 0, worldPos.y || 0, worldPos.z || 0);
    }

    const dryGain = ctx.createGain();
    const wetSend = ctx.createGain();
    const convolver = environment === 'forest' ? rig.forestConvolver : rig.canyonConvolver;

    panner.connect(dryGain);
    dryGain.connect(out);
    panner.connect(wetSend);
    wetSend.connect(convolver);

    activeSpatialVoices++;
    let cleaned = false;
    const releaseVoice = (delaySec) => {
      window.setTimeout(() => {
        if (cleaned) return;
        cleaned = true;
        activeSpatialVoices = Math.max(0, activeSpatialVoices - 1);
        try {
          panner.disconnect();
          dryGain.disconnect();
          wetSend.disconnect();
        } catch {
          // Узел уже отключён
        }
      }, Math.ceil(delaySec * 1000) + 80);
    };

    if (type === 'cannon_3d' || type === 'mortar_3d') {
      const isMortar = type === 'mortar_3d';
      dryGain.gain.setValueAtTime(0.52 * vol, now);
      wetSend.gain.setValueAtTime(0.68 * vol, now);

      // 1. Низкочастотный удар порохового заряда
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(isMortar ? 78 : 96, now);
      subOsc.frequency.exponentialRampToValueAtTime(isMortar ? 28 : 34, now + 0.34);
      subGain.gain.setValueAtTime(0.65, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
      subOsc.connect(subGain);
      subGain.connect(panner);
      subOsc.start(now);
      subOsc.stop(now + 0.4);

      // 2. Хлопок дульной волны и звон бронзового ствола единорога
      const dur = isMortar ? 0.68 : 0.56;
      const bLen = Math.floor(ctx.sampleRate * dur);
      const bBuf = ctx.createBuffer(1, bLen, ctx.sampleRate);
      const bData = bBuf.getChannelData(0);
      for (let i = 0; i < bLen; i++) {
        bData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * (isMortar ? 0.2 : 0.15)));
      }
      const nSrc = ctx.createBufferSource();
      nSrc.buffer = bBuf;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(isMortar ? 380 : 540, now);
      lp.frequency.exponentialRampToValueAtTime(145, now + dur);
      nSrc.connect(lp);
      lp.connect(panner);
      nSrc.start(now);

      const ringOsc = ctx.createOscillator();
      const ringGain = ctx.createGain();
      ringOsc.type = 'triangle';
      ringOsc.frequency.setValueAtTime(isMortar ? 265 : 342, now);
      ringOsc.frequency.exponentialRampToValueAtTime(190, now + 0.24);
      ringGain.gain.setValueAtTime(0.14, now);
      ringGain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
      ringOsc.connect(ringGain);
      ringGain.connect(panner);
      ringOsc.start(now);
      ringOsc.stop(now + 0.28);

      releaseVoice(0.75);
    } else if (type === 'explosion_3d' || type === 'camouflet_3d') {
      const isCamouflet = type === 'camouflet_3d';
      dryGain.gain.setValueAtTime(0.56 * vol, now);
      wetSend.gain.setValueAtTime(0.72 * vol, now);

      const rumbleOsc = ctx.createOscillator();
      const rumbleGain = ctx.createGain();
      rumbleOsc.type = 'sine';
      rumbleOsc.frequency.setValueAtTime(isCamouflet ? 62 : 84, now);
      rumbleOsc.frequency.exponentialRampToValueAtTime(22, now + 0.55);
      rumbleGain.gain.setValueAtTime(0.72, now);
      rumbleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.58);
      rumbleOsc.connect(rumbleGain);
      rumbleGain.connect(panner);
      rumbleOsc.start(now);
      rumbleOsc.stop(now + 0.6);

      // Разрыв бомбы + осыпь каменного щебня по склону
      const eLen = Math.floor(ctx.sampleRate * 0.82);
      const eBuf = ctx.createBuffer(1, eLen, ctx.sampleRate);
      const eData = eBuf.getChannelData(0);
      for (let i = 0; i < eLen; i++) {
        const t = i / ctx.sampleRate;
        const main = Math.exp(-t / 0.19);
        const debris = t > 0.08 ? Math.exp(-(t - 0.08) / 0.28) * 0.35 * (Math.sin(t * 95) > 0.2 ? 1 : 0.2) : 0;
        eData[i] = (Math.random() * 2 - 1) * (main + debris);
      }
      const eSrc = ctx.createBufferSource();
      eSrc.buffer = eBuf;
      const eFilter = ctx.createBiquadFilter();
      eFilter.type = 'lowpass';
      eFilter.frequency.setValueAtTime(isCamouflet ? 320 : 780, now);
      eFilter.frequency.exponentialRampToValueAtTime(160, now + 0.8);
      eSrc.connect(eFilter);
      eFilter.connect(panner);
      eSrc.start(now);

      releaseVoice(0.88);
    } else if (type === 'rifle_murid_3d' || type === 'rifle_imperial_3d') {
      const isMurid = type === 'rifle_murid_3d';
      dryGain.gain.setValueAtTime(0.24 * vol, now);
      wetSend.gain.setValueAtTime(0.38 * vol, now);

      const sLen = Math.floor(ctx.sampleRate * 0.19);
      const sBuf = ctx.createBuffer(1, sLen, ctx.sampleRate);
      const sData = sBuf.getChannelData(0);
      for (let i = 0; i < sLen; i++) {
        sData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.036));
      }
      const sSrc = ctx.createBufferSource();
      sSrc.buffer = sBuf;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(isMurid ? 1380 : 860, now);
      bp.Q.setValueAtTime(1.4, now);
      sSrc.connect(bp);
      bp.connect(panner);
      sSrc.start(now);

      const snapOsc = ctx.createOscillator();
      const snapGain = ctx.createGain();
      snapOsc.type = 'triangle';
      snapOsc.frequency.setValueAtTime(isMurid ? 310 : 210, now);
      snapOsc.frequency.exponentialRampToValueAtTime(68, now + 0.055);
      snapGain.gain.setValueAtTime(0.26, now);
      snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      snapOsc.connect(snapGain);
      snapGain.connect(panner);
      snapOsc.start(now);
      snapOsc.stop(now + 0.065);

      releaseVoice(0.24);
    } else if (type === 'ricochet_3d') {
      dryGain.gain.setValueAtTime(0.14 * vol, now);
      wetSend.gain.setValueAtTime(0.28 * vol, now);

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(2480, now + 0.03);
      osc.frequency.exponentialRampToValueAtTime(640, now + 0.24);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.32, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(panner);
      osc.start(now + 0.03);
      osc.stop(now + 0.26);

      releaseVoice(0.3);
    } else if (type === 'felling_axes_3d') {
      dryGain.gain.setValueAtTime(0.38 * vol, now);
      wetSend.gain.setValueAtTime(0.34 * vol, now);

      // 3 тяжёлых удара топоров горцев и треск падающего бука в засеку
      [0.0, 0.22, 0.44].forEach((off) => {
        const chopOsc = ctx.createOscillator();
        const chopGain = ctx.createGain();
        chopOsc.type = 'triangle';
        chopOsc.frequency.setValueAtTime(168, now + off);
        chopOsc.frequency.exponentialRampToValueAtTime(58, now + off + 0.09);
        chopGain.gain.setValueAtTime(0.45, now + off);
        chopGain.gain.exponentialRampToValueAtTime(0.001, now + off + 0.1);
        chopOsc.connect(chopGain);
        chopGain.connect(panner);
        chopOsc.start(now + off);
        chopOsc.stop(now + off + 0.11);
      });

      const cLen = Math.floor(ctx.sampleRate * 0.55);
      const cBuf = ctx.createBuffer(1, cLen, ctx.sampleRate);
      const cData = cBuf.getChannelData(0);
      for (let i = 0; i < cLen; i++) {
        cData[i] = (Math.random() * 2 - 1) * Math.sin((Math.PI * i) / cLen) * Math.exp(-i / (ctx.sampleRate * 0.28));
      }
      const crashSrc = ctx.createBufferSource();
      crashSrc.buffer = cBuf;
      const crashBp = ctx.createBiquadFilter();
      crashBp.type = 'lowpass';
      crashBp.frequency.setValueAtTime(640, now + 0.52);
      crashSrc.connect(crashBp);
      crashBp.connect(panner);
      crashSrc.start(now + 0.52);

      releaseVoice(1.12);
    } else if (type === 'dagger_charge_3d') {
      dryGain.gain.setValueAtTime(0.36 * vol, now);
      wetSend.gain.setValueAtTime(0.46 * vol, now);

      // Боевой рог наиба + звон выхваченных кинжалов-кама
      const hornOsc = ctx.createOscillator();
      const hornFilter = ctx.createBiquadFilter();
      const hornGain = ctx.createGain();
      hornOsc.type = 'sawtooth';
      hornOsc.frequency.setValueAtTime(196, now);
      hornOsc.frequency.setValueAtTime(293.66, now + 0.16);
      hornFilter.type = 'lowpass';
      hornFilter.frequency.setValueAtTime(680, now);
      hornGain.gain.setValueAtTime(0.36, now);
      hornGain.gain.exponentialRampToValueAtTime(0.001, now + 0.58);
      hornOsc.connect(hornFilter);
      hornFilter.connect(hornGain);
      hornGain.connect(panner);
      hornOsc.start(now);
      hornOsc.stop(now + 0.6);

      const bladeOsc = ctx.createOscillator();
      const bladeGain = ctx.createGain();
      bladeOsc.type = 'sawtooth';
      bladeOsc.frequency.setValueAtTime(980, now + 0.08);
      bladeOsc.frequency.exponentialRampToValueAtTime(2650, now + 0.18);
      bladeOsc.frequency.exponentialRampToValueAtTime(760, now + 0.38);
      bladeGain.gain.setValueAtTime(0.24, now + 0.08);
      bladeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      bladeOsc.connect(bladeGain);
      bladeGain.connect(panner);
      bladeOsc.start(now + 0.08);
      bladeOsc.stop(now + 0.42);

      releaseVoice(0.66);
    } else if (type === 'eagle_cry_3d') {
      dryGain.gain.setValueAtTime(0.11 * vol, now);
      wetSend.gain.setValueAtTime(0.34 * vol, now);

      [0.0, 0.24].forEach((off, idx) => {
        const osc = ctx.createOscillator();
        const bp = ctx.createBiquadFilter();
        const g = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(idx === 0 ? 2280 : 2120, now + off);
        osc.frequency.exponentialRampToValueAtTime(1580, now + off + 0.2);
        bp.type = 'bandpass';
        bp.frequency.setValueAtTime(1950, now + off);
        bp.Q.setValueAtTime(5.5, now + off);
        g.gain.setValueAtTime(0.001, now + off);
        g.gain.linearRampToValueAtTime(0.32, now + off + 0.03);
        g.gain.exponentialRampToValueAtTime(0.001, now + off + 0.22);
        osc.connect(bp);
        bp.connect(g);
        g.connect(panner);
        osc.start(now + off);
        osc.stop(now + off + 0.23);
      });

      releaseVoice(0.55);
    } else {
      releaseVoice(0.1);
    }
  } catch {
    // Безопасное игнорирование ошибок WebAudio
  }
};
