// Окно «TrailerPrevizModal» — вынесено из App.jsx; все значения состояния и обработчики приходят через props
import { STEAM_TRAILER_STORYBOARD_SHOTS } from '../../data/appContent.js';
import { playHistoricalSound } from '../../game/audio.js';

export default function TrailerPrevizModal({
  handleExportSteamAnnouncementMd,
  handleExportTrailerEdl,
  handleExportTrailerSrt,
  setActiveTab,
  setShowTrailerPrevizModal,
  setTrailerAutoPlaying,
  setTrailerShotIdx,
  soundEnabled,
  t,
  trailerAutoPlaying,
  trailerShotIdx
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          {(() => {
            const shot = STEAM_TRAILER_STORYBOARD_SHOTS[trailerShotIdx] || STEAM_TRAILER_STORYBOARD_SHOTS[0];
            return (
              <div className="bg-[#121620] border border-fuchsia-500/50 rounded-2xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                <div className="p-4 border-b border-stone-800 flex flex-wrap items-center justify-between gap-2 bg-[#171c28]">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-fuchsia-300 block">
                      Steam Store 60s Gameplay Trailer Previz • UE5.5 LevelSequence + UE5_Level_Actors_Spawn_Manifest.json
                    </span>
                    <h2 className="text-base sm:text-lg font-bold font-serif text-stone-100">
                      🎬 {t('Интерактивный превиз и раскадровка 60-секундного трейлера Steam', 'Interactive 60-Second Steam Gameplay Trailer Storyboard & Previz')}
                    </h2>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleExportTrailerSrt('ru')}
                      className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-200 font-mono text-[11px] font-bold cursor-pointer"
                      title={t('Скачать русские субтитры трейлера в формате SubRip (.srt)', 'Download Russian trailer subtitles in SubRip (.srt) format')}
                    >
                      📝 SRT (RU)
                    </button>
                    <button
                      onClick={() => handleExportTrailerSrt('en')}
                      className="px-2.5 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/50 text-sky-200 font-mono text-[11px] font-bold cursor-pointer"
                      title={t('Скачать английские субтитры трейлера в формате SubRip (.srt)', 'Download English trailer subtitles in SubRip (.srt) format')}
                    >
                      📝 SRT (EN)
                    </button>
                    <button
                      onClick={handleExportTrailerEdl}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-200 font-mono text-[11px] font-bold cursor-pointer"
                      title={t('Скачать монтажный лист CMX3600 (.edl) для DaVinci Resolve и Premiere Pro', 'Download CMX3600 Edit Decision List (.edl) for DaVinci Resolve & Premiere Pro')}
                    >
                      🎞️ CMX3600 (.edl)
                    </button>
                    <button
                      onClick={handleExportSteamAnnouncementMd}
                      className="px-2.5 py-1.5 rounded-lg bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/50 text-violet-200 font-mono text-[11px] font-bold cursor-pointer"
                      title={t('Скачать двуязычный пресс-релиз и анонс для сообщества Steam (Markdown + BBCode RU/EN)', 'Download bilingual Steam Community Announcement & Press Release (Markdown + BBCode RU/EN)')}
                    >
                      📰 {t('Анонс Steam (.md)', 'Steam News (.md)')}
                    </button>
                    <button
                      onClick={() => {
                        const nextPlay = !trailerAutoPlaying;
                        setTrailerAutoPlaying(nextPlay);
                        if (nextPlay) playHistoricalSound(shot.soundCue, soundEnabled);
                      }}
                      className={`px-3 py-1.5 rounded-lg font-mono text-xs font-extrabold cursor-pointer transition ${
                        trailerAutoPlaying
                          ? 'bg-rose-500 text-stone-950'
                          : 'bg-fuchsia-500 hover:bg-fuchsia-400 text-stone-950'
                      }`}
                    >
                      {trailerAutoPlaying
                        ? `⏸ ${t('Пауза авто-превиза', 'Pause Previz')}`
                        : `▶ ${t('Запустить авто-превиз (6 кадров)', 'Auto-Play 6-Shot Previz')}`}
                    </button>
                    <button
                      onClick={() => {
                        setTrailerAutoPlaying(false);
                        setShowTrailerPrevizModal(false);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 font-mono text-xs font-bold cursor-pointer"
                    >
                      {t('Закрыть ✕', 'Close ✕')}
                    </button>
                  </div>
                </div>

                <div className="p-4 overflow-y-auto space-y-4">
                  {/* Кинематографический видоискатель UE5 CineCameraActor (2.39:1 Anamorphic Scope) */}
                  <div className="p-3 rounded-xl bg-[#07090e] border border-stone-800 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
                      <span className="text-fuchsia-300 font-bold">
                        🎥 REC • {shot.timecode} • {shot.cameraLens}
                      </span>
                      <span className="text-emerald-300">{shot.ue5ActorRef}</span>
                    </div>

                    <svg viewBox="0 0 800 250" className="w-full h-auto rounded-lg border border-stone-800 bg-[#080b11] select-none">
                      <defs>
                        <linearGradient id="trailerSky" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#0b101b" />
                          <stop offset="100%" stopColor="#192132" />
                        </linearGradient>
                      </defs>
                      <rect x="0" y="0" width="800" height="250" fill="url(#trailerSky)" />
                      <line x1="266" y1="0" x2="266" y2="250" stroke="#ffffff" strokeOpacity="0.08" strokeDasharray="4,4" />
                      <line x1="533" y1="0" x2="533" y2="250" stroke="#ffffff" strokeOpacity="0.08" strokeDasharray="4,4" />
                      <line x1="0" y1="83" x2="800" y2="83" stroke="#ffffff" strokeOpacity="0.08" strokeDasharray="4,4" />
                      <line x1="0" y1="166" x2="800" y2="166" stroke="#ffffff" strokeOpacity="0.08" strokeDasharray="4,4" />

                      <polygon
                        points="0,210 95,140 190,168 310,92 430,148 545,86 670,136 800,104 800,250 0,250"
                        fill="#111827"
                        stroke="#f59e0b"
                        strokeWidth="1.5"
                        strokeOpacity="0.45"
                      />

                      {shot.shotIdx === 0 && (
                        <g>
                          <rect x="250" y="70" width="300" height="115" rx="8" fill="#1c1917" stroke="#f59e0b" strokeWidth="2" />
                          <circle cx="290" cy="95" r="14" fill="#fbbf24" fillOpacity="0.35" />
                          <circle cx="290" cy="95" r="5" fill="#fef08a" />
                          <text x="400" y="130" textAnchor="middle" fill="#fcd34d" fontSize="14" fontFamily="serif" fontWeight="bold">
                            КАРТА ИМАМАТА В ДИВАН-ХАНЕ (1845)
                          </text>
                        </g>
                      )}
                      {shot.shotIdx === 1 && (
                        <g>
                          <polygon points="378,56 422,56 446,80 446,124 422,148 378,148 354,124 354,80" fill="#1c1917" stroke="#f59e0b" strokeWidth="3" />
                          <text x="400" y="106" textAnchor="middle" fill="#fcd34d" fontSize="13" fontWeight="bold">عَبْدُهُ شَامِيل</text>
                          <path d="M 180 155 Q 300 95 450 140 T 660 110" fill="none" stroke="#34d399" strokeWidth="2.5" strokeDasharray="5,4" />
                        </g>
                      )}
                      {shot.shotIdx === 2 && (
                        <g>
                          <line x1="400" y1="30" x2="400" y2="210" stroke="#f43f5e" strokeWidth="2.5" strokeDasharray="4,3" />
                          <circle cx="460" cy="145" r="28" fill="none" stroke="#38bdf8" strokeWidth="2" />
                          <circle cx="460" cy="145" r="16" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3,2" />
                          <text x="400" y="52" textAnchor="middle" fill="#fda4af" fontSize="11" fontFamily="monospace">
                            РАЗРЕЗ СКАЛЫ МИЛЮТИНА + МЕДНЫЙ ТАЗ САФАРОВА
                          </text>
                        </g>
                      )}
                      {shot.shotIdx === 3 && (
                        <g>
                          {Array.from({ length: 18 }).map((_, gi) => (
                            <rect
                              key={gi}
                              x={220 + gi * 20}
                              y={85}
                              width="12"
                              height="52"
                              rx="3"
                              fill={gi >= 15 ? '#f59e0b' : '#10b981'}
                              stroke="#090c12"
                            />
                          ))}
                          <text x="400" y="72" textAnchor="middle" fill="#6ee7b7" fontSize="11" fontFamily="monospace">
                            18 НАГРУДНЫХ ГАЗЫРЕЙ • ЗОЛОТОЙ РЕЗЕРВ (16–18)
                          </text>
                        </g>
                      )}
                      {shot.shotIdx === 4 && (
                        <g>
                          <rect x="210" y="64" width="380" height="115" rx="8" fill="#0f172a" stroke="#818cf8" strokeWidth="2" />
                          <text x="400" y="102" textAnchor="middle" fill="#c7d2fe" fontSize="13" fontFamily="monospace" fontWeight="bold">
                            МАТРИЦА 20 000 ПАРТИЙ МОНТЕ-КАРЛО: 100% / 98.4%
                          </text>
                          <text x="400" y="132" textAnchor="middle" fill="#fcd34d" fontSize="12" fontFamily="serif">
                            Кодекс Низамов Шамиля против просек Барятинского
                          </text>
                        </g>
                      )}
                      {shot.shotIdx === 5 && (
                        <g>
                          <rect x="190" y="62" width="420" height="118" rx="10" fill="#131824" stroke="#f59e0b" strokeWidth="2.5" />
                          <text x="400" y="108" textAnchor="middle" fill="#fcd34d" fontSize="20" fontFamily="serif" fontWeight="bold">
                            ИМАМАТ: ДИВАН-ХАНА (1834–1859)
                          </text>
                          <text x="400" y="138" textAnchor="middle" fill="#34d399" fontSize="12" fontFamily="monospace" fontWeight="bold">
                            WISHLIST ON STEAM • PLAY VERTICAL SLICE 1.6 DEMO NOW
                          </text>
                        </g>
                      )}

                      <rect x="30" y="196" width="740" height="42" rx="6" fill="#000000" fillOpacity="0.78" stroke="#374151" />
                      <text x="400" y="221" textAnchor="middle" fill="#f5f5f4" fontSize="12" fontFamily="serif">
                        {t(shot.voiceoverRu, shot.voiceoverEn)}
                      </text>
                    </svg>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1">
                      <span className="font-mono text-amber-300">
                        🔊 {t('Акустическая дорожка:', 'Audio Track Cue:')} {t(shot.audioLayerRu, shot.audioLayerEn)}
                      </span>
                      <button
                        onClick={() => {
                          setTrailerAutoPlaying(false);
                          setActiveTab(shot.targetTab);
                          setShowTrailerPrevizModal(false);
                        }}
                        className="px-3 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-mono text-xs font-extrabold cursor-pointer"
                      >
                        🕹️ {t('Перейти к этой сцене в игре →', 'Jump to Live In-Game Scene →')}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {STEAM_TRAILER_STORYBOARD_SHOTS.map((s, idx) => (
                      <button
                        key={s.shotIdx}
                        onClick={() => {
                          setTrailerShotIdx(idx);
                          playHistoricalSound(s.soundCue, soundEnabled);
                        }}
                        className={`text-left p-3 rounded-xl border transition cursor-pointer ${
                          idx === trailerShotIdx
                            ? 'bg-fuchsia-950/35 border-fuchsia-400 shadow-lg'
                            : 'bg-stone-900/80 border-stone-800 hover:border-stone-700'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                          <span className="text-fuchsia-300 font-bold">{s.timecode}</span>
                          <span className="text-stone-400">{s.cameraLens.split('•')[0]}</span>
                        </div>
                        <div className="text-xs font-serif font-bold text-stone-100">{t(s.titleRu, s.titleEn)}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
  );
}
