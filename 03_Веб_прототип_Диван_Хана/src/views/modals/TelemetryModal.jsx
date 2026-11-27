// Окно «TelemetryModal» — Двуязычная (RU/EN) телеметрия сессии плейтестера (Спринт 10 / Gate 5)
export default function TelemetryModal({
  buildPlaytestTelemetryPayload,
  handleDownloadPlaytestTelemetryJson,
  setShowTelemetryModal,
  t = (ru) => ru
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      {(() => {
        const telemetryData = buildPlaytestTelemetryPayload();
        return (
          <div className="bg-[#131720] border border-purple-500/50 rounded-2xl max-w-4xl w-full max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-stone-800 flex flex-wrap items-center justify-between gap-2 bg-[#171c26]">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-purple-300 block">
                  {t(
                    `Steam Playtest Telemetry • Версия схемы: ${telemetryData.buildVersion}`,
                    `Steam Playtest Telemetry • Schema Version: ${telemetryData.buildVersion}`
                  )}
                </span>
                <h2 className="text-base sm:text-lg font-bold font-serif text-stone-100">
                  📊 {t('Живая телеметрия сессии плейтестера', 'Live Playtest Session Telemetry')} (`ImamatPlaytestSessionTelemetry`)
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadPlaytestTelemetryJson}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-mono text-xs font-bold cursor-pointer"
                >
                  ⬇️ {t('Скачать Telemetry JSON', 'Download Telemetry JSON')}
                </button>
                <button
                  onClick={() => setShowTelemetryModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 font-mono text-xs font-bold cursor-pointer"
                >
                  {t('Закрыть ✕', 'Close ✕')}
                </button>
              </div>
            </div>

            <div className="p-4 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-stone-900 border border-stone-800">
                  <span className="text-[10px] text-stone-400 block">
                    {t('Гонцов отправлено', 'Envoys Dispatched')}
                  </span>
                  <span className="text-lg font-bold text-amber-300">
                    {telemetryData.ordersSummary.totalEnvoysDispatched}
                  </span>
                  <span className="text-[10px] text-stone-400 block mt-0.5">
                    {t('30п:', '30p:')} {telemetryData.ordersSummary.convoysByTier.tier30_Reinforced} |{' '}
                    {t('45п:', '45p:')} {telemetryData.ordersSummary.convoysByTier.tier45_HeavyTrain}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-stone-900 border border-stone-800">
                  <span className="text-[10px] text-stone-400 block">
                    {t('Повиновение / Перехват', 'Obedience / Intercepts')}
                  </span>
                  <span className="text-lg font-bold text-emerald-300">
                    {telemetryData.ordersSummary.naibOrdersObeyedCount} {t('исп.', 'obeyed')}
                  </span>
                  <span className="text-[10px] text-rose-300 block mt-0.5">
                    {t('Отказ:', 'Refused:')} {telemetryData.ordersSummary.naibOrdersRefusedCount} |{' '}
                    {t('Перехват:', 'Intercepted:')} {telemetryData.ordersSummary.envoysInterceptedCount}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-stone-900 border border-stone-800">
                  <span className="text-[10px] text-stone-400 block">
                    {t('Тактика и 18 газырей', 'Tactics & 18 Gazyrs')}
                  </span>
                  <span className="text-lg font-bold text-sky-300">
                    {telemetryData.tacticalBattlesSummary.dioramasEntered} {t('боёв', 'battles')}
                  </span>
                  <span className="text-[10px] text-orange-300 block mt-0.5">
                    {t('Камуфлетов:', 'Camouflets:')} {telemetryData.tacticalBattlesSummary.camoufletsDetonated} |{' '}
                    {t('Штыковая (0/18):', 'Melee (0/18):')}{' '}
                    {telemetryData.tacticalBattlesSummary.gazyrDepletionMeleeTriggered}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-stone-900 border border-stone-800">
                  <span className="text-[10px] text-stone-400 block">
                    {t('Развилки и Суды (M5)', 'Crises & Courts (M5)')}
                  </span>
                  <span className="text-lg font-bold text-purple-300">
                    {telemetryData.crisesAndCourtSummary.historicalCrisesResolved +
                      telemetryData.crisesAndCourtSummary.shariaCourtCasesResolved}
                    /12
                  </span>
                  <span className="text-[10px] text-stone-400 block mt-0.5">
                    {t('Кризисы:', 'Crises:')} {telemetryData.crisesAndCourtSummary.historicalCrisesResolved}/6 |{' '}
                    {t('Суды:', 'Courts:')} {telemetryData.crisesAndCourtSummary.shariaCourtCasesResolved}/6
                  </span>
                </div>
              </div>

              <pre className="bg-[#090b0e] border border-stone-800 rounded-xl p-3.5 text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-96 leading-relaxed">
                {JSON.stringify(telemetryData, null, 2)}
              </pre>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
