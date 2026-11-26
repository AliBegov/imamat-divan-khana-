// Окно «AudioMixerModal» — вынесено из App.jsx; все значения состояния и обработчики приходят через props
import { playHistoricalSound } from '../../game/audio.js';

export default function AudioMixerModal({
  audioMixerConfig,
  setAudioMixerConfig,
  setShowAudioMixerModal,
  setSoundEnabled,
  siegeState,
  soundEnabled,
  t
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#131720] border border-cyan-500/50 rounded-2xl max-w-3xl w-full max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-stone-800 flex flex-wrap items-center justify-between gap-2 bg-[#171c26]">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 block">
                  {t(
                    'Акустическая картина горного Дагестана и Ичкерии • 1845 г.',
                    'Acoustic Soundscape of Mountain Dagestan & Ichkeria • 1845'
                  )}
                </span>
                <h2 className="text-base sm:text-lg font-bold font-serif text-stone-100">
                  🎛️ {t('Пульт атмосферного звука Диван-ханы', 'Divan-Khana Diegetic Audio Mixer')}
                </h2>
              </div>
              <button
                onClick={() => setShowAudioMixerModal(false)}
                className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 font-mono text-xs font-bold cursor-pointer"
              >
                {t('Закрыть ✕', 'Close ✕')}
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-4">
              {/* Мастер-громкость и статус */}
              <div className="p-3.5 rounded-xl bg-stone-900/90 border border-stone-800 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-stone-200 block">
                    {t('Мастер-шина процедурного синтезатора (Master Gain)', 'Procedural Synthesizer Master Bus (Master Gain)')}
                  </span>
                  <span className="text-[11px] text-stone-400">
                    {t(
                      'Генерация звука в реальном времени без внешних MP3/WAV-файлов (Zero-Asset DSP)',
                      'Real-time sound synthesis with zero external MP3/WAV assets (Zero-Asset DSP)'
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSoundEnabled((s) => !s)}
                    className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold border cursor-pointer transition ${
                      soundEnabled
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                        : 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                    }`}
                  >
                    {soundEnabled ? t('🔊 ЗВУК ВКЛЮЧЕН', '🔊 AUDIO ON') : t('🔇 ЗВУК ВЫКЛЮЧЕН', '🔇 AUDIO MUTED')}
                  </button>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0.1"
                      max="1.5"
                      step="0.05"
                      value={audioMixerConfig.masterVolume}
                      onChange={(e) =>
                        setAudioMixerConfig((prev) => ({
                          ...prev,
                          masterVolume: parseFloat(e.target.value)
                        }))
                      }
                      className="w-28 accent-cyan-400 cursor-pointer"
                    />
                    <span className="font-mono text-xs text-cyan-300 w-12 text-right">
                      {Math.round(audioMixerConfig.masterVolume * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* 3 фоновых диегетических слоя */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-mono uppercase tracking-wider text-stone-400">
                  {t('3 автономных диегетических фоновых слоя (Ambient Loops)', '3 Autonomous Diegetic Ambient Layers')}
                </h3>

                {/* Слой 1: Горный ветер ущелья Ахк-Таш */}
                <div className="p-3.5 rounded-xl bg-stone-900/90 border border-stone-800 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-cyan-300">
                        🌬️ {t('1. Горный ветер ущелья Ахк-Таш и буковый лес Ичкерии', '1. Ahk-Tash Gorge Wind & Ichkeria Beech Forest')}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-stone-800 font-mono text-[10px] text-stone-300">
                        Bandpass Pink/White Noise • 240→490 Hz
                      </span>
                    </div>
                    <p className="text-xs text-stone-400 mt-1">
                      {t(
                        'Периодические порывы горного ветра через полосовой резонансный фильтр (Q = 4.2) каждые 5.2 с.',
                        'Periodic mountain wind gusts sculpted through a resonant bandpass filter (Q = 4.2) every 5.2 s.'
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setAudioMixerConfig((prev) => ({
                        ...prev,
                        windLayerEnabled: !prev.windLayerEnabled
                      }))
                    }
                    className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold border cursor-pointer shrink-0 ${
                      audioMixerConfig.windLayerEnabled
                        ? 'bg-cyan-500 text-stone-950 border-cyan-400'
                        : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700'
                    }`}
                  >
                    {audioMixerConfig.windLayerEnabled ? t('ВКЛ (Активен)', 'ON (Active)') : t('ВЫКЛ', 'OFF')}
                  </button>
                </div>

                {/* Слой 2: Акустический пеленг медного таза Юсуфа Сафарова */}
                <div className="p-3.5 rounded-xl bg-stone-900/90 border border-stone-800 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-amber-300">
                        🥣 {t('2. Акустический пеленг медного таза с водой (инженер Юсуф Сафаров)', '2. Copper Water Basin Acoustic Sonar (Engineer Yusuf Safarov)')}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 font-mono text-[10px] text-amber-300">
                        D_mine = {(siegeState.russianMineDistance || 9.5).toFixed(1)} {t('м', 'm')} | Δt ={' '}
                        {Math.max(0.8, Math.min(3.2, 0.55 + (siegeState.russianMineDistance || 9.5) * 0.16)).toFixed(2)}s
                      </span>
                    </div>
                    <p className="text-xs text-stone-400 mt-1">
                      {t(
                        'Исторический минный пеленгатор осады Чоха (1849): медный таз с водой на полу контрминной галереи улавливает удары кирок русских сапёров. Частота резонанса f = 520 + 480 / D_mine Гц и темп импульсов ускоряются по мере приближения подкопа.',
                        'Historical counter-mine detector from the Siege of Chokh (1849): a copper water basin on the gallery floor picks up Russian sapper pickaxes. Resonance frequency f = 520 + 480 / D_mine Hz and pulse rate accelerate as the sap approaches.'
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setAudioMixerConfig((prev) => ({
                        ...prev,
                        copperBasinSonarEnabled: !prev.copperBasinSonarEnabled
                      }))
                    }
                    className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold border cursor-pointer shrink-0 ${
                      audioMixerConfig.copperBasinSonarEnabled
                        ? 'bg-amber-500 text-stone-950 border-amber-400'
                        : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700'
                    }`}
                  >
                    {audioMixerConfig.copperBasinSonarEnabled ? t('ВКЛ (Пеленг)', 'ON (Sonar)') : t('ВЫКЛ', 'OFF')}
                  </button>
                </div>

                {/* Слой 3: Очаг Диван-ханы и водяная пороховая мельница Ведено */}
                <div className="p-3.5 rounded-xl bg-stone-900/90 border border-stone-800 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-emerald-300">
                        ⚙️ {t('3. Очаг Диван-ханы и водяная пороховая мельница Ведено', '3. Divan-Khana Hearth & Vedeno Water-Powered Powder Mill')}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 font-mono text-[10px] text-emerald-300">
                        95→42 Hz Stamp + 1450 Hz Ember Crackle
                      </span>
                    </div>
                    <p className="text-xs text-stone-400 mt-1">
                      {t(
                        'Аутентичный индустриально-бытовой фон столицы Имамата: мерный глухой стук дубовых пестов водяной пороховой толчеи на реке Ахк-Таш и потрескивание углей в очаге при работе над картами.',
                        'Authentic material-culture soundscape of the Imamate’s capital: rhythmic heavy wooden stamp-mill thuds from the Ahk-Tash powder works and warm hearth ember crackles inside the Divan-Khana.'
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setAudioMixerConfig((prev) => ({
                        ...prev,
                        hearthWatermillEnabled: !prev.hearthWatermillEnabled
                      }))
                    }
                    className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold border cursor-pointer shrink-0 ${
                      audioMixerConfig.hearthWatermillEnabled
                        ? 'bg-emerald-500 text-stone-950 border-emerald-400'
                        : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700'
                    }`}
                  >
                    {audioMixerConfig.hearthWatermillEnabled ? t('ВКЛ (Активен)', 'ON (Active)') : t('ВЫКЛ', 'OFF')}
                  </button>
                </div>
              </div>

              {/* Тестовая дека одиночных звуковых сэмплов (One-Shot Soundboard) */}
              <div className="p-3.5 rounded-xl bg-[#0d1016] border border-stone-800 space-y-2.5">
                <span className="text-xs font-mono uppercase tracking-wider text-stone-400 block">
                  {t('Тестовая дека одиночных процедурных эффектов (One-Shot DSP Audition)', 'One-Shot Procedural SFX Audition Deck')}
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'seal', labelRu: '🖋️ Сургучная печать', labelEn: '🖋️ Wax Seal Stamp' },
                    { id: 'cannon', labelRu: '💣 Единорог / Камуфлет', labelEn: '💣 Cannon / Camouflet' },
                    { id: 'cannon_echo', labelRu: '🏔️ Залп с эхом теснины (3D)', labelEn: '🏔️ Gorge Echo Salvo (3D)' },
                    { id: 'rifle_ricochet', labelRu: '🎯 Штуцер и рикошет о скалу', labelEn: '🎯 Rifle & Rock Ricochet' },
                    { id: 'blade', labelRu: '⚔️ Звон шашки и кинжала', labelEn: '⚔️ Shashka & Kindjal' },
                    { id: 'horn', labelRu: '📯 Рог сбора сотен', labelEn: '📯 Cavalry Rally Horn' },
                    { id: 'gallop', labelRu: '🐎 Конный гонец из Ведено', labelEn: '🐎 Vedeno Courier Hooves' },
                    { id: 'felling_axes', labelRu: '🪓 Топоры буковой засеки', labelEn: '🪓 Beech Abatis Axes' },
                    { id: 'eagle_cry', labelRu: '🦅 Клёкот беркута в скалах', labelEn: '🦅 Golden Eagle Cry' },
                    { id: 'basin_ping', labelRu: '🥣 Импульс медного таза', labelEn: '🥣 Copper Basin Ping' },
                    { id: 'watermill_stamp', labelRu: '⚙️ Пороховая толчея и очаг', labelEn: '⚙️ Powder Mill & Hearth' },
                    { id: 'wind_gust', labelRu: '🌬️ Порыв ветра Ахк-Таш', labelEn: '🌬️ Ahk-Tash Wind Gust' }
                  ].map((sfx) => (
                    <button
                      key={sfx.id}
                      onClick={() =>
                        playHistoricalSound(sfx.id, true, {
                          volume: audioMixerConfig.masterVolume,
                          mineDistance: siegeState.russianMineDistance || 9.5
                        })
                      }
                      className="px-2.5 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-200 font-mono text-[11px] text-left transition cursor-pointer"
                    >
                      {t(sfx.labelRu, sfx.labelEn)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
  );
}
