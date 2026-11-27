// Окно «AudioMixerModal» — Пульт адаптивного 3-слойного звука 4.0 (Спринт 8 — Фаза 4 / Gate 4)
// 3-слойная адаптивная музыка (Совет -> Марш -> Бой) + 4 шины микшера + 16 фоли + тактильный отклик
import { useState } from 'react';
import {
  ADAPTIVE_MUSIC_LAYERS,
  DEFAULT_AUDIO_MIXER_CONFIG,
  FOLEY_SOUNDBOARD_CATALOG,
  computeBusGains
} from '../../game/adaptiveAudioEngine.js';
import { playHistoricalSound } from '../../game/audio.js';

export default function AudioMixerModal({
  adaptiveMusicState = null,
  audioMixerConfig,
  lastActionLatencyMs = null,
  setAudioMixerConfig,
  setShowAudioMixerModal,
  setSoundEnabled,
  siegeState,
  soundEnabled,
  t
}) {
  const [lastAuditionedId, setLastAuditionedId] = useState(null);
  const [auditionLatencyMs, setAuditionLatencyMs] = useState(null);

  const gains = computeBusGains(audioMixerConfig, soundEnabled);
  const activeLayerId = adaptiveMusicState?.layer || 'council';
  const stemWeights = adaptiveMusicState?.stemWeights || { council: 1, march: 0, battle: 0 };
  const overrideLayer = audioMixerConfig.musicLayerOverride || 'auto';

  const handleAuditionFoley = (sfxId) => {
    const t0 = typeof performance !== 'undefined' ? performance.now() : Date.now();
    playHistoricalSound(sfxId, true, {
      volume: audioMixerConfig.masterVolume,
      mineDistance: siegeState.russianMineDistance || 9.5
    });
    const elapsed = Math.max(0.1, Number(((typeof performance !== 'undefined' ? performance.now() : Date.now()) - t0).toFixed(1)));
    setLastAuditionedId(sfxId);
    setAuditionLatencyMs(elapsed);
  };

  const displayLatency = auditionLatencyMs ?? lastActionLatencyMs;

  return (
    <div className="fixed inset-0 z-50 bg-black/82 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#131720] border border-cyan-500/50 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-stone-800 flex flex-wrap items-center justify-between gap-2 bg-[#171c26]">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 block">
              {t(
                'АДАПТИВНЫЙ ЗВУК 4.0 • СОВЕТ → МАРШ → БОЙ • ZERO-ASSET WEB AUDIO DSP',
                'ADAPTIVE AUDIO 4.0 • COUNCIL → MARCH → BATTLE • ZERO-ASSET WEB AUDIO DSP'
              )}
            </span>
            <h2 className="text-base sm:text-lg font-bold font-serif text-stone-100">
              🎛️ {t('Пульт адаптивного звука и тактильного отклика Диван-ханы', 'Divan-Khana Adaptive Audio & Game Feel Mixer')}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/45 text-emerald-300 font-mono text-[11px] font-bold">
              ⚡ {t('Отклик:', 'Response:')} {displayLatency != null ? `${displayLatency} мс` : '< 5 мс'}
            </span>
            <button
              onClick={() => setShowAudioMixerModal(false)}
              className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 font-mono text-xs font-bold cursor-pointer"
            >
              {t('Закрыть ✕', 'Close ✕')}
            </button>
          </div>
        </div>

        <div className="p-4 overflow-y-auto space-y-4">
          {/* 4-шинная консоль громкости + тактильный отклик + сброс */}
          <div className="p-3.5 rounded-xl bg-stone-900/90 border border-stone-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-stone-200 block">
                  {t('4-шинный микшер комфорта (для длительных партий)', '4-Bus Session Comfort Mixer')}
                </span>
                <span className="text-[11px] text-stone-400">
                  {t(
                    'Настройки сохраняются автоматически • Мягкий компрессор и тёплый фильтр защищают слух',
                    'Settings auto-persist • Soft dynamics compressor & warm low-pass protect ears on long runs'
                  )}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setSoundEnabled((s) => !s)}
                  className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold border cursor-pointer transition ${
                    soundEnabled
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                      : 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                  }`}
                >
                  {soundEnabled ? t('🔊 ЗВУК ВКЛ', '🔊 AUDIO ON') : t('🔇 БЕЗ ЗВУКА', '🔇 MUTED')}
                </button>
                <button
                  onClick={() =>
                    setAudioMixerConfig((prev) => ({
                      ...prev,
                      hapticsEnabled: !prev.hapticsEnabled
                    }))
                  }
                  className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold border cursor-pointer transition ${
                    audioMixerConfig.hapticsEnabled
                      ? 'bg-amber-500/20 border-amber-400/60 text-amber-200'
                      : 'bg-stone-800 border-stone-700 text-stone-400'
                  }`}
                >
                  {audioMixerConfig.hapticsEnabled
                    ? t('✨ Тактильный отклик ВКЛ', '✨ Tactile Feel ON')
                    : t('✨ Тактильный отклик ВЫКЛ', '✨ Tactile Feel OFF')}
                </button>
                <button
                  onClick={() => setAudioMixerConfig({ ...DEFAULT_AUDIO_MIXER_CONFIG })}
                  className="px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-300 font-mono text-[11px] cursor-pointer"
                >
                  ↺ {t('Сброс', 'Reset')}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
              {[
                {
                  key: 'masterVolume',
                  labelRu: 'Мастер-шина',
                  labelEn: 'Master Bus',
                  max: 1.5,
                  val: audioMixerConfig.masterVolume,
                  accent: 'accent-cyan-400',
                  textClass: 'text-cyan-300'
                },
                {
                  key: 'musicVolume',
                  labelRu: 'Музыка (3 слоя)',
                  labelEn: 'Adaptive Score',
                  max: 1.2,
                  val: audioMixerConfig.musicVolume ?? 0.7,
                  accent: 'accent-amber-400',
                  textClass: 'text-amber-300'
                },
                {
                  key: 'sfxVolume',
                  labelRu: 'Фоли и эффекты',
                  labelEn: 'Historical Foley',
                  max: 1.3,
                  val: audioMixerConfig.sfxVolume ?? 0.9,
                  accent: 'accent-emerald-400',
                  textClass: 'text-emerald-300'
                },
                {
                  key: 'ambientVolume',
                  labelRu: 'Атмосфера гор',
                  labelEn: 'Mountain Ambient',
                  max: 1.2,
                  val: audioMixerConfig.ambientVolume ?? 0.75,
                  accent: 'accent-sky-400',
                  textClass: 'text-sky-300'
                }
              ].map((bus) => (
                <div key={bus.key} className="bg-stone-950/90 border border-stone-800 rounded-lg px-3 py-2 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-stone-300 font-bold">{t(bus.labelRu, bus.labelEn)}</span>
                    <span className={`font-bold ${bus.textClass}`}>{Math.round(bus.val * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={bus.max}
                    step="0.05"
                    value={bus.val}
                    onChange={(e) =>
                      setAudioMixerConfig((prev) => ({
                        ...prev,
                        [bus.key]: parseFloat(e.target.value)
                      }))
                    }
                    className={`w-full ${bus.accent} cursor-pointer`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 3-СЛОЙНАЯ АДАПТИВНАЯ МУЗЫКА: СОВЕТ -> МАРШ -> БОЙ */}
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-[#1b1610] via-[#13151d] to-[#111722] border border-amber-500/40 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/20 pb-2.5">
              <div>
                <h3 className="text-sm font-serif font-bold text-amber-300 flex items-center gap-2">
                  <span>🎼 {t('3-слойная адаптивная партитура (Совет → Марш → Бой)', '3-Layer Adaptive Score (Council → March → Battle)')}</span>
                </h3>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  {t(
                    'Плавно сводит 3 музыкальных стема в ре-дорийском ладу под ситуацию на 3D-карте (без резких стыков).',
                    'Crossfades 3 harmonic stems in D-Dorian seamlessly based on live campaign tension.'
                  )}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() =>
                    setAudioMixerConfig((prev) => ({
                      ...prev,
                      musicEnabled: !prev.musicEnabled
                    }))
                  }
                  className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold border cursor-pointer ${
                    audioMixerConfig.musicEnabled
                      ? 'bg-amber-500 text-stone-950 border-amber-300'
                      : 'bg-stone-800 text-stone-300 border-stone-700'
                  }`}
                >
                  {audioMixerConfig.musicEnabled ? t('Музыка ВКЛ', 'Music ON') : t('Музыка ВЫКЛ', 'Music OFF')}
                </button>
                {[
                  { id: 'auto', ru: 'Авто', en: 'Auto' },
                  { id: 'council', ru: '🕯️ Совет', en: '🕯️ Council' },
                  { id: 'march', ru: '🥁 Марш', en: '🥁 March' },
                  { id: 'battle', ru: '⚔️ Бой', en: '⚔️ Battle' }
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() =>
                      setAudioMixerConfig((prev) => ({
                        ...prev,
                        musicLayerOverride: mode.id
                      }))
                    }
                    className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold border cursor-pointer transition ${
                      overrideLayer === mode.id
                        ? 'bg-cyan-500 text-stone-950 border-cyan-300 shadow'
                        : 'bg-stone-900 text-stone-300 border-stone-700 hover:border-amber-400/60'
                    }`}
                  >
                    {t(mode.ru, mode.en)}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {ADAPTIVE_MUSIC_LAYERS.map((layer) => {
                const isActive = activeLayerId === layer.id;
                const weight = Math.round((stemWeights[layer.id] || 0) * 100);
                return (
                  <div
                    key={layer.id}
                    className={`rounded-xl p-3 border space-y-2 transition ${
                      isActive
                        ? 'bg-amber-950/35 border-amber-400/75 shadow-[0_0_16px_rgba(251,191,36,0.16)]'
                        : 'bg-stone-950/75 border-stone-800'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-serif font-bold text-amber-200">
                        {layer.icon} {t(layer.nameRu, layer.nameEn)}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-bold ${
                          isActive
                            ? 'bg-amber-400 text-stone-950'
                            : weight > 0
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-stone-800 text-stone-400'
                        }`}
                      >
                        {isActive ? t('АКТИВЕН', 'LIVE') : `${weight}%`}
                      </span>
                    </div>
                    <div className="text-[10px] font-mono text-cyan-300/90">
                      {t(layer.scaleRu, layer.scaleEn)} • {layer.bpm} BPM
                    </div>
                    <div className="h-1.5 rounded-full bg-stone-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-300"
                        style={{ width: `${audioMixerConfig.musicEnabled && gains.music > 0 ? weight : 0}%` }}
                      />
                    </div>
                    <p className="text-[10.5px] text-stone-400 leading-snug">
                      {t(layer.descRu, layer.descEn)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3 диегетических фоновых слоя окружения */}
          <div className="space-y-2">
            <h3 className="text-xs font-mono uppercase tracking-wider text-stone-400">
              {t('3 автономных диегетических слоя окружения (Ambient Loops)', '3 Diegetic Mountain Environment Layers')}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {/* Слой 1: Ветер */}
              <div className="p-3 rounded-xl bg-stone-900/90 border border-stone-800 flex flex-col justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-cyan-300 block">
                    🌬️ {t('Ветер ущелья Ахк-Таш', 'Ahk-Tash Gorge Wind')}
                  </span>
                  <p className="text-[11px] text-stone-400 mt-1">
                    {t('Резонансный горный ветер 240→490 Гц.', 'Resonant mountain wind gusts 240→490 Hz.')}
                  </p>
                </div>
                <button
                  onClick={() =>
                    setAudioMixerConfig((prev) => ({
                      ...prev,
                      windLayerEnabled: !prev.windLayerEnabled
                    }))
                  }
                  className={`w-full py-1.5 rounded-lg font-mono text-xs font-bold border cursor-pointer ${
                    audioMixerConfig.windLayerEnabled
                      ? 'bg-cyan-500 text-stone-950 border-cyan-400'
                      : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700'
                  }`}
                >
                  {audioMixerConfig.windLayerEnabled ? t('ВКЛ (Активен)', 'ON (Active)') : t('ВЫКЛ', 'OFF')}
                </button>
              </div>

              {/* Слой 2: Медный таз */}
              <div className="p-3 rounded-xl bg-stone-900/90 border border-stone-800 flex flex-col justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-amber-300 block">
                    🥣 {t('Медный таз Сафарова', 'Safarov Copper Basin')}
                  </span>
                  <p className="text-[11px] text-stone-400 mt-1">
                    D_mine = {(siegeState.russianMineDistance || 9.5).toFixed(1)} {t('м', 'm')} • {t('пеленг подкопа Чоха', 'Chokh sapper sonar')}
                  </p>
                </div>
                <button
                  onClick={() =>
                    setAudioMixerConfig((prev) => ({
                      ...prev,
                      copperBasinSonarEnabled: !prev.copperBasinSonarEnabled
                    }))
                  }
                  className={`w-full py-1.5 rounded-lg font-mono text-xs font-bold border cursor-pointer ${
                    audioMixerConfig.copperBasinSonarEnabled
                      ? 'bg-amber-500 text-stone-950 border-amber-400'
                      : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700'
                  }`}
                >
                  {audioMixerConfig.copperBasinSonarEnabled ? t('ВКЛ (Пеленг)', 'ON (Sonar)') : t('ВЫКЛ', 'OFF')}
                </button>
              </div>

              {/* Слой 3: Очаг и мельница */}
              <div className="p-3 rounded-xl bg-stone-900/90 border border-stone-800 flex flex-col justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-emerald-300 block">
                    ⚙️ {t('Очаг и толчея Ведено', 'Vedeno Hearth & Mill')}
                  </span>
                  <p className="text-[11px] text-stone-400 mt-1">
                    {t('Дубовые песты пороховой мельницы и очаг.', 'Oak powder stamp mill & warm hearth.')}
                  </p>
                </div>
                <button
                  onClick={() =>
                    setAudioMixerConfig((prev) => ({
                      ...prev,
                      hearthWatermillEnabled: !prev.hearthWatermillEnabled
                    }))
                  }
                  className={`w-full py-1.5 rounded-lg font-mono text-xs font-bold border cursor-pointer ${
                    audioMixerConfig.hearthWatermillEnabled
                      ? 'bg-emerald-500 text-stone-950 border-emerald-400'
                      : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700'
                  }`}
                >
                  {audioMixerConfig.hearthWatermillEnabled ? t('ВКЛ (Активен)', 'ON (Active)') : t('ВЫКЛ', 'OFF')}
                </button>
              </div>
            </div>
          </div>

          {/* Аутентичная дека 16 исторических фоли (One-Shot Audition Deck) */}
          <div className="p-3.5 rounded-xl bg-[#0d1016] border border-stone-800 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-stone-400">
                {t('Дека 16 аутентичных фоли Кавказа (One-Shot DSP Audition)', '16 Authentic Caucasus Foley Audition Deck')}
              </span>
              {lastAuditionedId && (
                <span className="text-[10.5px] font-mono text-emerald-300">
                  ✓ {lastAuditionedId} ({auditionLatencyMs} мс)
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {FOLEY_SOUNDBOARD_CATALOG.map((sfx) => {
                const isHot = lastAuditionedId === sfx.id;
                return (
                  <button
                    key={sfx.id}
                    onClick={() => handleAuditionFoley(sfx.id)}
                    className={`px-2.5 py-2 rounded-lg border font-mono text-[11px] text-left transition cursor-pointer ${
                      isHot
                        ? 'bg-amber-500/20 border-amber-400 text-amber-100'
                        : 'bg-stone-900 hover:bg-stone-800 border-stone-700 text-stone-200'
                    }`}
                  >
                    {t(sfx.labelRu, sfx.labelEn)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
