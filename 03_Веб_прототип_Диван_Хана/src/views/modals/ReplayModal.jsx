// Окно «ReplayModal» — вынесено из App.jsx; все значения состояния и обработчики приходят через props

export default function ReplayModal({
  campaignHistoryLog,
  getCommanderSealSummary,
  handleAutoSimulate20TurnsReplay,
  handleExportCommanderSealHtml,
  handleExportReplayJson,
  handleExportReplayMarkdown,
  replaySelectedTurnIdx,
  setReplaySelectedTurnIdx,
  setShowReplayBenchmarkOverlay,
  setShowReplayModal,
  showReplayBenchmarkOverlay,
  t
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          {(() => {
            const safeIdx = Math.min(replaySelectedTurnIdx, campaignHistoryLog.length - 1);
            const snap = campaignHistoryLog[safeIdx] || campaignHistoryLog[0];
            const W = 760;
            const H = 210;
            const padL = 44;
            const padR = 20;
            const padT = 18;
            const padB = 28;
            const plotW = W - padL - padR;
            const plotH = H - padT - padB;
            const maxTurns = Math.max(2, campaignHistoryLog.length);
            const toX = (i) => padL + (i / (maxTurns - 1)) * plotW;
            const toYPct = (v) => padT + plotH - (Math.min(100, Math.max(0, v)) / 100) * plotH;
            const toYPowder = (v) => padT + plotH - (Math.min(900, Math.max(0, v)) / 900) * plotH;

            const makeSvgPath = (arr, yFn) =>
              arr.map((v, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(1)},${yFn(v).toFixed(1)}`).join(' ');

            const scoreSeries = campaignHistoryLog.map((h) => h.victoryScore);
            const stressSeries = campaignHistoryLog.map((h) => h.totalStress);
            const totalPowderSeries = campaignHistoryLog.map((h) => h.vedenoPowder + h.regionalPowder);

            // Эталонная траектория Мастер-стратегии Монте-Карло (4_Divan_Khana_Master_Strategy, 1 000 партий)
            const getMcBenchmarkAtTurn = (turnNum) => {
              const tNorm = Math.min(20, Math.max(1, turnNum));
              const ratio = (tNorm - 1) / 19;
              const mcResilience = Math.round(76 + ratio * 22); // 76% -> 98%
              const mcStress = Math.round(29 - ratio * 16.7);   // 29% -> 12.3%
              const mcPowder = Math.round(690 + ratio * 227);   // 690 п. -> 917 п.
              return { mcResilience, mcStress, mcPowder };
            };

            const mcScoreSeries = campaignHistoryLog.map((h) => getMcBenchmarkAtTurn(h.turn).mcResilience);
            const mcStressSeries = campaignHistoryLog.map((h) => getMcBenchmarkAtTurn(h.turn).mcStress);
            const mcPowderSeries = campaignHistoryLog.map((h) => getMcBenchmarkAtTurn(h.turn).mcPowder);
            const snapMc = getMcBenchmarkAtTurn(snap.turn);
            const deltaResilience = snap.victoryScore - snapMc.mcResilience;
            const deltaStress = snap.totalStress - snapMc.mcStress;
            const deltaPowder = snap.vedenoPowder + snap.regionalPowder - snapMc.mcPowder;

            return (
              <div className="bg-[#131720] border border-rose-500/50 rounded-2xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                <div className="p-4 border-b border-stone-800 flex flex-wrap items-center justify-between gap-2 bg-[#171c26]">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-rose-300 block">
                      Post-Campaign Replay & After-Action Report (AAR) • Записано ходов: {campaignHistoryLog.length}
                    </span>
                    <h2 className="text-base sm:text-lg font-bold font-serif text-stone-100">
                      📈 {t('Хронограф Мухаммада Тахира аль-Карахи (Реплей партии)', 'Al-Qarakhi Campaign Replay Chronograph & AAR')}
                    </h2>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setShowReplayBenchmarkOverlay((v) => !v)}
                      className={`px-3 py-1.5 rounded-lg border font-mono text-xs font-bold cursor-pointer transition ${
                        showReplayBenchmarkOverlay
                          ? 'bg-indigo-500/25 border-indigo-400 text-indigo-200'
                          : 'bg-stone-900 border-stone-700 text-stone-400'
                      }`}
                    >
                      🎯 {showReplayBenchmarkOverlay ? t('Эталон МК: ВКЛ', 'MC Benchmark: ON') : t('Эталон МК: ВЫКЛ', 'MC Benchmark: OFF')}
                    </button>
                    <button
                      onClick={handleAutoSimulate20TurnsReplay}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-mono text-xs font-bold cursor-pointer"
                    >
                      ⚡ {t('Симулировать 20 ходов', 'Auto-Sim 20 Turns')}
                    </button>
                    <button
                      onClick={handleExportReplayMarkdown}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-200 font-mono text-xs font-bold cursor-pointer"
                    >
                      ⬇️ {t('Экспорт AAR (.md)', 'Export AAR (.md)')}
                    </button>
                    <button
                      onClick={handleExportReplayJson}
                      className="px-3 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-200 font-mono text-xs font-bold cursor-pointer"
                    >
                      ⬇️ JSON
                    </button>
                    <button
                      onClick={() => setShowReplayModal(false)}
                      className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 font-mono text-xs font-bold cursor-pointer"
                    >
                      {t('Закрыть ✕', 'Close ✕')}
                    </button>
                  </div>
                </div>

                <div className="p-4 overflow-y-auto space-y-4">
                  {/* Многослойный векторный SVG-график истории ходов */}
                  <div className="p-3.5 rounded-xl bg-[#090c12] border border-stone-800">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2 text-[11px] font-mono">
                      <span className="text-stone-300 font-bold">
                        {t(
                          'Динамика ключевых метрик Имамата по ходам кампании:',
                          'Turn-by-Turn Imamate Strategic Telemetry Curves:'
                        )}
                      </span>
                      <div className="flex flex-wrap gap-3">
                        <span className="text-emerald-400">● {t('Устойчивость (%)', 'Resilience (%)')}</span>
                        <span className="text-rose-400">● {t('Нагрузка Имама (%)', 'Imam Strain (%)')}</span>
                        <span className="text-amber-300">● {t('Суммарный порох (пуд.)', 'Total Powder (poods)')}</span>
                        {showReplayBenchmarkOverlay && (
                          <span className="text-indigo-300">┄ {t('Пунктир: Оптимум Монте-Карло (1 000 игр)', 'Dashed: Monte Carlo Optimum (1,000 runs)')}</span>
                        )}
                      </div>
                    </div>
                    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none">
                      {[0, 25, 50, 75, 100].map((pct) => {
                        const y = toYPct(pct);
                        return (
                          <g key={pct}>
                            <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#1f2937" strokeWidth="1" />
                            <text x={padL - 6} y={y + 3} textAnchor="end" fontSize="9" fill="#9ca3af" fontFamily="monospace">
                              {pct}%
                            </text>
                          </g>
                        );
                      })}
                      {/* Порог Зульмата 80% */}
                      <line
                        x1={padL}
                        y1={toYPct(80)}
                        x2={W - padR}
                        y2={toYPct(80)}
                        stroke="#ef4444"
                        strokeWidth="1"
                        strokeDasharray="2,3"
                        opacity="0.55"
                      />
                      {campaignHistoryLog.length > 1 && showReplayBenchmarkOverlay && (
                        <>
                          <path
                            d={makeSvgPath(mcScoreSeries, toYPct)}
                            fill="none"
                            stroke="#34d399"
                            strokeWidth="1.5"
                            strokeDasharray="3,3"
                            opacity="0.55"
                          />
                          <path
                            d={makeSvgPath(mcStressSeries, toYPct)}
                            fill="none"
                            stroke="#fb7185"
                            strokeWidth="1.5"
                            strokeDasharray="3,3"
                            opacity="0.55"
                          />
                          <path
                            d={makeSvgPath(mcPowderSeries, toYPowder)}
                            fill="none"
                            stroke="#818cf8"
                            strokeWidth="1.5"
                            strokeDasharray="3,3"
                            opacity="0.65"
                          />
                        </>
                      )}
                      {campaignHistoryLog.length > 1 && (
                        <>
                          <path d={makeSvgPath(scoreSeries, toYPct)} fill="none" stroke="#10b981" strokeWidth="2.8" />
                          <path d={makeSvgPath(stressSeries, toYPct)} fill="none" stroke="#f43f5e" strokeWidth="2.4" />
                          <path
                            d={makeSvgPath(totalPowderSeries, toYPowder)}
                            fill="none"
                            stroke="#f59e0b"
                            strokeWidth="2.2"
                            strokeDasharray="5,3"
                          />
                        </>
                      )}
                      {campaignHistoryLog.map((h, i) => {
                        const cx = toX(i);
                        const isSel = i === safeIdx;
                        return (
                          <g key={h.turn} onClick={() => setReplaySelectedTurnIdx(i)} className="cursor-pointer">
                            {isSel && (
                              <line x1={cx} y1={padT} x2={cx} y2={H - padB} stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="3,2" />
                            )}
                            <circle cx={cx} cy={toYPct(h.victoryScore)} r={isSel ? 5 : 3} fill="#10b981" />
                            <circle cx={cx} cy={toYPct(h.totalStress)} r={isSel ? 5 : 3} fill="#f43f5e" />
                            <text x={cx} y={H - 8} textAnchor="middle" fontSize="9" fill={isSel ? '#fbbf24' : '#9ca3af'} fontFamily="monospace">
                              {h.turn}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>

                  {/* Ползунок выбора хода (Turn Scrubber) и карточка выбранного хода */}
                  <div className="p-3.5 rounded-xl bg-stone-900/90 border border-stone-800 space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-amber-300 font-bold">
                        {t('Покадровый скраббер летописи:', 'Turn-by-Turn Replay Scrubber:')} {t('Ход', 'Turn')} {snap.turn} / {campaignHistoryLog.length}
                      </span>
                      <span className="text-stone-400">{t(snap.seasonRu, snap.seasonEn)}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={Math.max(0, campaignHistoryLog.length - 1)}
                      value={safeIdx}
                      onChange={(e) => setReplaySelectedTurnIdx(parseInt(e.target.value, 10))}
                      className="w-full accent-rose-400 cursor-pointer"
                    />

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs font-mono">
                      <div className="p-2.5 rounded-lg bg-[#0c0f14] border border-stone-800">
                        <span className="text-[10px] text-stone-400 block">{t('Порох (Ведено + Округа)', 'Powder (Vedeno + Regions)')}</span>
                        <span className="text-sm font-bold text-amber-300">
                          {snap.vedenoPowder} + {snap.regionalPowder} {t('п.', 'p.')}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-[#0c0f14] border border-stone-800">
                        <span className="text-[10px] text-stone-400 block">{t('Казна / Провиант', 'Silver / Provisions')}</span>
                        <span className="text-sm font-bold text-sky-300">
                          {snap.silver}р. / {snap.provisions}м.
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-[#0c0f14] border border-stone-800">
                        <span className="text-[10px] text-stone-400 block">{t('Войско Имамата', 'Imamate Forces')}</span>
                        <span className="text-sm font-bold text-emerald-300">{snap.totalGarrison}</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-[#0c0f14] border border-stone-800">
                        <span className="text-[10px] text-stone-400 block">{t('Нагрузка / Осады', 'Strain / Sieges')}</span>
                        <span className="text-sm font-bold text-rose-300">
                          {snap.totalStress}% ({snap.siegesCount} {t('осад', 'sieges')})
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-[#0c0f14] border border-stone-800">
                        <span className="text-[10px] text-stone-400 block">{t('Индекс устойчивости', 'Resilience Score')}</span>
                        <span className="text-sm font-bold text-emerald-400">{snap.victoryScore}%</span>
                      </div>
                    </div>

                    {showReplayBenchmarkOverlay && (
                      <div className="p-2.5 rounded-lg bg-indigo-950/30 border border-indigo-500/40 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
                        <span className="text-indigo-200 font-bold">
                          🎯 {t('Отклонение от эталона Мастер-стратегии Монте-Карло на ходу', 'Delta vs. Monte Carlo Master Benchmark on Turn')} #{snap.turn}:
                        </span>
                        <div className="flex flex-wrap gap-3">
                          <span className={deltaResilience >= 0 ? 'text-emerald-300 font-bold' : 'text-amber-300 font-bold'}>
                            {t('Δ Устойчивость:', 'Δ Resilience:')} {deltaResilience >= 0 ? `+${deltaResilience}%` : `${deltaResilience}%`} ({t('эталон', 'opt')} {snapMc.mcResilience}%)
                          </span>
                          <span className={deltaStress <= 0 ? 'text-emerald-300 font-bold' : 'text-rose-300 font-bold'}>
                            {t('Δ Стресс:', 'Δ Strain:')} {deltaStress >= 0 ? `+${deltaStress}%` : `${deltaStress}%`} ({t('эталон', 'opt')} {snapMc.mcStress}%)
                          </span>
                          <span className={deltaPowder >= 0 ? 'text-emerald-300 font-bold' : 'text-amber-300 font-bold'}>
                            {t('Δ Порох:', 'Δ Powder:')} {deltaPowder >= 0 ? `+${deltaPowder}` : `${deltaPowder}`} {t('п.', 'p.')} ({t('эталон', 'opt')} {snapMc.mcPowder} {t('п.', 'p.')})
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="p-3 rounded-lg bg-[#0c0f14] border border-amber-500/30 text-xs">
                      <div className="text-[10px] font-mono text-amber-400 uppercase mb-0.5">
                        {t('Командующий РИ на этом ходу:', 'Active Imperial Commander:')} {t(snap.generalNameRu, snap.generalNameEn)}
                      </div>
                      <div className="text-stone-200 font-serif font-bold">
                        📜 {t(snap.eventRu, snap.eventEn)}
                      </div>
                    </div>

                    {/* ГРАМОТА ДИВАН-ХАНЫ С ВОСЬМИУГОЛЬНОЙ ПЕЧАТЬЮ ИМАМА ШАМИЛЯ (M15) */}
                    {(() => {
                      const sealInfo = getCommanderSealSummary();
                      return (
                        <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#141822] via-[#191d28] to-[#141822] border border-amber-500/50 flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <svg width="58" height="58" viewBox="0 0 120 120" className="shrink-0">
                              <polygon points="38,6 82,6 114,38 114,82 82,114 38,114 6,82 6,38" fill="#1c1917" stroke="#f59e0b" strokeWidth="4" />
                              <polygon points="42,13 78,13 107,42 107,78 78,107 42,107 13,78 13,42" fill="none" stroke="#fcd34d" strokeWidth="1.5" strokeDasharray="3,2" />
                              <text x="60" y="48" textAnchor="middle" fill="#fcd34d" fontSize="14" fontWeight="bold">عَبْدُهُ شَامِيل</text>
                              <text x="60" y="68" textAnchor="middle" fill="#e7e5e4" fontSize="9" fontFamily="monospace">SHAMIL SEAL</text>
                              <text x="60" y="84" textAnchor="middle" fill="#34d399" fontSize="9" fontFamily="monospace">1255 AH</text>
                            </svg>
                            <div className="space-y-0.5">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold">
                                  {sealInfo.sealHash}
                                </span>
                                <span className="text-[11px] font-mono text-emerald-300 font-bold">
                                  ★ {t(sealInfo.medalRu, sealInfo.medalEn)}
                                </span>
                              </div>
                              <div className="text-sm font-serif font-bold text-stone-100">
                                🏆 {t('Ранг Диван-ханы:', 'Divan-Khana Rank:')} {t(sealInfo.rankRu, sealInfo.rankEn)}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={handleExportCommanderSealHtml}
                            className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-mono text-xs font-extrabold cursor-pointer shadow-lg"
                          >
                            🏆 {t('Скачать Грамоту с печатью (.html)', 'Export Seal Certificate (.html)')}
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
  );
}
