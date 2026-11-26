// Окно «TelemetryModal» — вынесено из App.jsx; все значения состояния и обработчики приходят через props

export default function TelemetryModal({
  buildPlaytestTelemetryPayload,
  handleDownloadPlaytestTelemetryJson,
  setShowTelemetryModal
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
                      Steam Playtest Telemetry • Версия схемы: {telemetryData.buildVersion}
                    </span>
                    <h2 className="text-base sm:text-lg font-bold font-serif text-stone-100">
                      📊 Живая телеметрия сессии плейтестера (`ImamatPlaytestSessionTelemetry`)
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleDownloadPlaytestTelemetryJson}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-mono text-xs font-bold cursor-pointer"
                    >
                      ⬇️ Скачать Telemetry JSON
                    </button>
                    <button
                      onClick={() => setShowTelemetryModal(false)}
                      className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 font-mono text-xs font-bold cursor-pointer"
                    >
                      Закрыть ✕
                    </button>
                  </div>
                </div>

                <div className="p-4 overflow-y-auto space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                    <div className="p-3 rounded-xl bg-stone-900 border border-stone-800">
                      <span className="text-[10px] text-stone-400 block">Гонцов отправлено</span>
                      <span className="text-lg font-bold text-amber-300">
                        {telemetryData.ordersSummary.totalEnvoysDispatched}
                      </span>
                      <span className="text-[10px] text-stone-400 block mt-0.5">
                        30п: {telemetryData.ordersSummary.convoysByTier.tier30_Reinforced} | 45п:{' '}
                        {telemetryData.ordersSummary.convoysByTier.tier45_HeavyTrain}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-stone-900 border border-stone-800">
                      <span className="text-[10px] text-stone-400 block">Повиновение / Перехват</span>
                      <span className="text-lg font-bold text-emerald-300">
                        {telemetryData.ordersSummary.naibOrdersObeyedCount} исп.
                      </span>
                      <span className="text-[10px] text-rose-300 block mt-0.5">
                        Отказ: {telemetryData.ordersSummary.naibOrdersRefusedCount} | Перехват:{' '}
                        {telemetryData.ordersSummary.envoysInterceptedCount}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-stone-900 border border-stone-800">
                      <span className="text-[10px] text-stone-400 block">Тактика и 18 газырей</span>
                      <span className="text-lg font-bold text-sky-300">
                        {telemetryData.tacticalBattlesSummary.dioramasEntered} боёв
                      </span>
                      <span className="text-[10px] text-orange-300 block mt-0.5">
                        Камуфлетов: {telemetryData.tacticalBattlesSummary.camoufletsDetonated} | Штыковая (0/18):{' '}
                        {telemetryData.tacticalBattlesSummary.gazyrDepletionMeleeTriggered}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-stone-900 border border-stone-800">
                      <span className="text-[10px] text-stone-400 block">Развилки и Суды (M5)</span>
                      <span className="text-lg font-bold text-purple-300">
                        {telemetryData.crisesAndCourtSummary.historicalCrisesResolved +
                          telemetryData.crisesAndCourtSummary.shariaCourtCasesResolved}
                        /12
                      </span>
                      <span className="text-[10px] text-stone-400 block mt-0.5">
                        Кризисы: {telemetryData.crisesAndCourtSummary.historicalCrisesResolved}/6 | Суды:{' '}
                        {telemetryData.crisesAndCourtSummary.shariaCourtCasesResolved}/6
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
