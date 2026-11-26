// Вкладка «SimEpilogueTab» — вынесено из App.jsx; все значения состояния и обработчики приходят через props
import { EPILOGUE_CHAPTERS } from '../../data/campaignData.js';
import { resolveMediaAsset } from '../../data/embeddedMediaAssets.js';
import { PortraitMedallion, TabHeroBanner, findPortrait } from '../hud/GameHUD.jsx';
import { CompassRoseIcon, WaxSealIcon } from '../hud/PeriodIcons.jsx';

export default function SimEpilogueTab({
  campaignAudit,
  epilogueDecisionsMade,
  handleChooseEpilogueDecision,
  handleLoadCampaignState,
  handleRunMonteCarloSimulation,
  handleSaveCampaignState,
  leaderStressData,
  monteCarloReport,
  naibates,
  nizams,
  orderExecutionCalc,
  playtestTelemetry,
  resources,
  setActiveTab,
  setFieldManualSection,
  setShowFieldManualModal,
  setSimDifficultyWeight,
  setSimRunsCount,
  simDifficultyWeight,
  simRunsCount,
  studioMode,
  t,
  turn
}) {
  return (
    <div className="space-y-5">
      <TabHeroBanner
        artSrc="Epilogue_Kaluga_And_Medina_1859_1871.jpg"
        portraitKey="Шамиль"
        portraitName={t('Имам Шамиль, Гази-Мухаммад и Имам Магомед-Гаджи', 'Imam Shamil, Ghazi-Muhammad & Imam Muhammad-Hajji')}
        portraitTitle={t('Летопись Судьбы (1859–1877): Калуга, Стамбул, Медина и Согратль', 'Chronicle of Destiny (1859–1877): Kaluga, Istanbul, Medina & Sogratl')}
        portraitColor="#10b981"
        tag={t('ИСТОРИЧЕСКИЙ ЭПИЛОГ И АРХИВ • 1859–1877 ГГ.', 'HISTORICAL EPILOGUE & ARCHIVE • 1859–1877')}
        title={t(
          'Судьба Имама Шамиля: Почётный мир в Калуге, триумф в Стамбуле и восстание 1877 года',
          'Fate of Imam Shamil: Honorable Peace in Kaluga, Triumph in Istanbul & the 1877 Uprising'
        )}
        desc={t(
          'Заключительные главы эпопеи по дневникам пристава А. И. Руновского, хроникам Османского архива (BOA) и летописи Гасана Алкадари «Асари-Дагестан».',
          'Final chapters of the epic drawn from Col. A. I. Runovsky’s diaries, Ottoman Archive (BOA) chronicles, and Hasan Alkadari’s “Asari-Dagestan”.'
        )}
      />

            {/* Верхняя панель: Сохранение/Загрузка (UImamatSaveGame / FOrderProbabilityBreakdown) */}
            <div className="relative hud-panel hud-walnut-bezel rounded-xl p-5 shadow-2xl space-y-4">
              <span className="hud-brass-corner tl" />
              <span className="hud-brass-corner tr" />
              <span className="hud-brass-corner bl" />
              <span className="hud-brass-corner br" />
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-500/25 pb-3">
                <div>
                  <span className="inline-flex items-center gap-1.5 text-[10px] hud-num uppercase text-emerald-400 font-bold">
                    <CompassRoseIcon className="w-3.5 h-3.5 text-emerald-400" />
                    <span>
                      {studioMode
                        ? t(
                            'Статус разработки: Этап 1 (Headless & 2D Симулятор Диван-ханы) — 100% ЗАВЕРШЁН',
                            'Development Status: Stage 1 (Headless & 2D Divan-Khana Simulator) — 100% COMPLETED'
                          )
                        : t(
                            'Летопись Судьбы Имамата и Архив Сохранений Кампании',
                            'Chronicle of the Imamate’s Fate & Campaign Save Archive'
                          )}
                    </span>
                  </span>
                  <h2 className="text-base font-bold font-serif text-amber-100 uppercase mt-0.5 flex items-center gap-1.5">
                    <WaxSealIcon className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      {studioMode
                        ? t(
                            'Управление сохранениями кампании и Чек-лист готовности к Этапу 2 (Unreal Engine 5)',
                            'Campaign Save Management & Stage 2 (Unreal Engine 5) Readiness Checklist'
                          )
                        : t(
                            'Исторический Эпилог (1859–1877): Калуга, Стамбул и восстание в Согратле',
                            'Historical Epilogue (1859–1877): Kaluga, Istanbul & the Sogratl Uprising'
                          )}
                    </span>
                  </h2>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <button
                    onClick={() => setActiveTab('verdict')}
                    className="px-3 py-2 rounded-lg bg-[#171b22] hover:bg-stone-800 border border-stone-700 text-stone-300 font-mono cursor-pointer transition"
                  >
                    {t('← К Сценариям и Суду', '← Back to Scenarios')}
                  </button>
                  <button
                    onClick={handleSaveCampaignState}
                    className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold cursor-pointer transition"
                  >
                    {t('Сохранить партию', 'Save Campaign')}
                  </button>
                  <button
                    onClick={handleLoadCampaignState}
                    className="px-3.5 py-2 rounded-lg bg-[#171b22] hover:bg-stone-800 border border-amber-500/40 text-amber-300 font-bold cursor-pointer transition"
                  >
                    {t('Загрузить из архива', 'Load from Archive')}
                  </button>
                </div>
              </div>

              {studioMode && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  {[
                    {
                      module: t(
                        '1. Граф Кавказа и Психология Наибов',
                        '1. Caucasus Graph & Naib Psychology'
                      ),
                      detail: t(
                        '10 наибств, формула FOrderProbabilityBreakdown, 3 калибра караванов (15/30/45 пуд.)',
                        '10 Naibates, FOrderProbabilityBreakdown formula, 3 convoy tiers (15/30/45 poods)'
                      ),
                      status: t('ГОТОВО (100%)', 'READY (100%)')
                    },
                    {
                      module: t(
                        '2. Государственное право и Экономика',
                        '2. State Law & Bayt al-Mal Economy'
                      ),
                      detail: t(
                        '12 Низамов Шамиля, 12 развилок и судов, казна Байт аль-маль и 18 нагрудных газырей',
                        '12 Nizams of Shamil, 12 crises & courts, Bayt al-Mal treasury & 18 chest gazyrs'
                      ),
                      status: t('ГОТОВО (100%)', 'READY (100%)')
                    },
                    {
                      module: t(
                        '3. Безсеточная (Gridless) Тактика и SRTM',
                        '3. Gridless Tactical Siege & SRTM'
                      ),
                      detail: t(
                        '3D-разрез скалы Милютина + 20 карт высот SRTM 2017×2017 (.png/.r16)',
                        '3D Milyutin cliff cutaway + 20 NASA SRTM 2017×2017 heightmaps (.png/.r16)'
                      ),
                      status: t('ГОТОВО (100%)', 'READY (100%)')
                    },
                    {
                      module: t(
                        '4. Пакет UE 5.5, Телеметрия и Steam Kit',
                        '4. UE 5.5 Package, Telemetry & Steam Kit'
                      ),
                      detail: t(
                        'ImamatWargame.uproject, UImamatSaveGame, агрегатор KPI и Standalone HTML билд',
                        'ImamatWargame.uproject, UImamatSaveGame, KPI aggregator & Standalone HTML build'
                      ),
                      status: t('ГОТОВО (100%)', 'READY (100%)')
                    }
                  ].map((chk, idx) => (
                    <div
                      key={idx}
                      className="bg-[#171b22] border border-emerald-500/30 rounded-xl p-3 space-y-1"
                    >
                      <div className="flex items-center justify-between font-mono text-[10px] text-emerald-400 font-bold">
                        <span>✓ {chk.status}</span>
                      </div>
                      <div className="font-bold text-stone-100 font-serif">{chk.module}</div>
                      <p className="text-[11px] text-stone-400 leading-relaxed">{chk.detail}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Блок M6: Сопоставление живой сессии игрока с 4 000 партиями валидатора MonteCarlo_1000x20_Report.json (только в режиме Студии) */}
            {studioMode && (
            <div className="bg-[#13161b] border border-amber-500/40 rounded-xl p-5 shadow-2xl space-y-4">
              {(() => {
                const avgRegPowder = +(
                  naibates.reduce((s, n) => s + n.gunpowder, 0) / Math.max(1, naibates.length)
                ).toFixed(1);
                const enactedCount = nizams.filter((n) => n.enacted).length;
                const heavyConvoysSent =
                  playtestTelemetry.tier30_Reinforced + playtestTelemetry.tier45_HeavyTrain;
                const playerArchetype =
                  enactedCount >= 3 && heavyConvoysSent >= 1
                    ? t(
                        '4_Divan_Khana_Master_Strategy (Эталон Диван-ханы — 100% выживаемость)',
                        '4_Divan_Khana_Master_Strategy (Divan-Khana Gold Standard — 100% survival)'
                      )
                    : resources.gunpowder >= 160 && enactedCount >= 2
                    ? t(
                        '3_Military_Powder_And_Fortify (Военно-пороховой упор — 94.3% выживаемость)',
                        '3_Military_Powder_And_Fortify (Military & Powder Focus — 94.3% survival)'
                      )
                    : enactedCount <= 1 && playtestTelemetry.totalEnvoysDispatched > 0
                    ? t(
                        '2_Greedy_Zakat_No_Muhtasibs (Сбор зейката без реформ — риск Зульмата)',
                        '2_Greedy_Zakat_No_Muhtasibs (Zakat Extraction w/o Reforms — Zulmat Risk)'
                      )
                    : t(
                        '1_Passive_Adat_Baseline (Стартовый баланс до реформ Низама)',
                        '1_Passive_Adat_Baseline (Pre-Nizam Starting Baseline)'
                      );

                const benchmarks = [
                  {
                    id: '1_Passive_Adat_Baseline',
                    title: t(
                      '1. Пассивный Адат (Без Низамов и караванов)',
                      '1. Passive Adat Baseline (No Nizams or Convoys)'
                    ),
                    survival: '0.0%',
                    zulmat: '100.0%',
                    obey: '67.7%',
                    intercept: '9.8%',
                    vedenoPowder: t('485.0 п.', '485.0 p.'),
                    regPowder: t('9.3 п. (голод)', '9.3 p. (famine)'),
                    badgeColor: 'text-rose-400 border-rose-500/40 bg-rose-950/30'
                  },
                  {
                    id: '2_Greedy_Zakat_No_Muhtasibs',
                    title: t(
                      '2. Жёсткий Зейкат без тайных мухтасибов',
                      '2. Harsh Zakat Without Secret Muhtasibs'
                    ),
                    survival: '0.0%',
                    zulmat: '100.0%',
                    obey: '55.8%',
                    intercept: '29.9%',
                    vedenoPowder: t('292.9 п.', '292.9 p.'),
                    regPowder: t('28.5 п.', '28.5 p.'),
                    badgeColor: 'text-orange-300 border-orange-500/40 bg-orange-950/30'
                  },
                  {
                    id: '3_Military_Powder_And_Fortify',
                    title: t(
                      '3. Пороховые варницы + Караваны 30/45 пуд.',
                      '3. Saltpeter Works + 30/45-Pood Convoys'
                    ),
                    survival: '94.3%',
                    zulmat: '4.9%',
                    obey: '84.5%',
                    intercept: '23.7%',
                    vedenoPowder: t('185.7 п.', '185.7 p.'),
                    regPowder: t('54.2 п.', '54.2 p.'),
                    badgeColor: 'text-sky-300 border-sky-500/40 bg-sky-950/30'
                  },
                  {
                    id: '4_Divan_Khana_Master_Strategy',
                    title: t(
                      '4. Эталон Диван-ханы (Низамы + Мухтасибы + Халват)',
                      '4. Divan-Khana Master Strategy (Nizams + Muhtasibs + Khalwat)'
                    ),
                    survival: '100.0%',
                    zulmat: '0.0%',
                    obey: '86.4%',
                    intercept: '15.2%',
                    vedenoPowder: t('294.3 п.', '294.3 p.'),
                    regPowder: t('62.3 п.', '62.3 p.'),
                    badgeColor: 'text-emerald-300 border-emerald-500/40 bg-emerald-950/30'
                  }
                ];

                return (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-800 pb-3">
                      <div>
                        <span className="text-[10px] font-mono uppercase text-amber-400 block">
                          {t(
                            'Математический бенчмарк M6 • 4 000 кампаний × 20 ходов (`MonteCarlo_1000x20_Report.json`)',
                            'M6 Mathematical Benchmark • 4,000 Campaigns × 20 Turns (`MonteCarlo_1000x20_Report.json`)'
                          )}
                        </span>
                        <h3 className="text-base font-bold font-serif text-stone-100">
                          {t(
                            'Сравнение вашей текущей партии с 4 эталонными стратегиями ИИ',
                            'Live Session Comparison Against 4 Reference AI Strategies'
                          )}
                        </h3>
                      </div>
                      <div className="px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/40 text-xs font-mono text-amber-200">
                        {t('Ваш профиль:', 'Your Archetype:')} <strong>{playerArchetype}</strong>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs font-mono">
                        <thead>
                          <tr className="border-b border-stone-800 text-stone-400 text-[11px]">
                            <th className="py-2 pr-3">
                              {t('Стратегия (1 000 прогонов каждая)', 'Strategy (1,000 Runs Each)')}
                            </th>
                            <th className="py-2 px-2">{t('Выживаемость', 'Survival Rate')}</th>
                            <th className="py-2 px-2">{t('Риск Зульмата', 'Zulmat Risk')}</th>
                            <th className="py-2 px-2">{t('Повиновение', 'Obedience')}</th>
                            <th className="py-2 px-2">{t('Перехват', 'Interception')}</th>
                            <th className="py-2 px-2">{t('Арсенал Ведено', 'Vedeno Arsenal')}</th>
                            <th className="py-2 pl-2">{t('Ср. порох округов', 'Avg. Regional Powder')}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-800/70">
                          {benchmarks.map((b) => (
                            <tr key={b.id} className="hover:bg-stone-900/60">
                              <td className="py-2.5 pr-3 font-sans font-semibold text-stone-200">
                                {b.title}
                              </td>
                              <td className="py-2.5 px-2">
                                <span className={`px-2 py-0.5 rounded border text-[11px] font-bold ${b.badgeColor}`}>
                                  {b.survival}
                                </span>
                              </td>
                              <td className="py-2.5 px-2 text-stone-300">{b.zulmat}</td>
                              <td className="py-2.5 px-2 text-emerald-300">{b.obey}</td>
                              <td className="py-2.5 px-2 text-amber-300">{b.intercept}</td>
                              <td className="py-2.5 px-2 text-orange-300">{b.vedenoPowder}</td>
                              <td className="py-2.5 pl-2 text-sky-300">{b.regPowder}</td>
                            </tr>
                          ))}
                          {/* Живая строка текущего игрока */}
                          <tr className="bg-amber-500/10 border-t-2 border-amber-500/50 font-bold">
                            <td className="py-2.5 pr-3 font-sans text-amber-300">
                              ★{' '}
                              {t(
                                `ВАША ТЕКУЩАЯ ПАРТИЯ (Ход #${turn}, Низамов: ${enactedCount}/12)`,
                                `YOUR ACTIVE CAMPAIGN (Turn #${turn}, Nizams: ${enactedCount}/12)`
                              )}
                            </td>
                            <td className="py-2.5 px-2 text-emerald-300">
                              {campaignAudit.victoryScore}% {t('инд.', 'idx.')}
                            </td>
                            <td className="py-2.5 px-2 text-amber-300">
                              {t('Стресс', 'Strain')} {leaderStressData.totalStress}% (
                              {playtestTelemetry.zulmatTriggeredCount} {t('зул.', 'zul.')})
                            </td>
                            <td className="py-2.5 px-2 text-emerald-300">
                              {orderExecutionCalc.chance}% ({t('тек.', 'cur.')})
                            </td>
                            <td className="py-2.5 px-2 text-amber-300">
                              {orderExecutionCalc.interceptRisk}% ({t('тек.', 'cur.')})
                            </td>
                            <td className="py-2.5 px-2 text-orange-300">
                              {resources.gunpowder} {t('п.', 'p.')}
                            </td>
                            <td className="py-2.5 pl-2 text-sky-300">
                              {avgRegPowder} {t('п.', 'p.')}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Матрица 16 000 кампаний Монте-Карло: 4 Стратегии × 4 ИИ-Доктрины Генералов (M14) */}
                    <div className="mt-4 pt-3 border-t border-stone-800 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[11px] font-mono font-bold text-indigo-300 uppercase">
                          🔥 {t(
                            'Матрица 16 000 партий (`MonteCarlo_16000_DoctrineMatrix_Report.json`): 4 Стратегии × 4 Доктрины РИ',
                            '16,000-Campaign Matrix (`MonteCarlo_16000_DoctrineMatrix_Report.json`): 4 Strategies × 4 Imperial Doctrines'
                          )}
                        </span>
                        <button
                          onClick={() => {
                            setFieldManualSection('doctrines');
                            setShowFieldManualModal(true);
                          }}
                          className="px-2.5 py-1 rounded bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-200 font-mono text-[10px] font-bold cursor-pointer"
                        >
                          📘 {t('Открыть гид по контр-доктринам в Уставе', 'Open Counter-Doctrine Guide in Manual')}
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                        {[
                          {
                            docNameRu: '1. Граббе / Аргутинский (Таран)',
                            docNameEn: '1. Grabbe / Argutinsky (Siege Ram)',
                            milSurv: '38.3%',
                            masterSurv: '100.0%',
                            noteRu: 'Пороховой дренаж -14п./удар',
                            noteEn: 'Powder drain -14p/strike'
                          },
                          {
                            docNameRu: '2. Р. К. Фрейтаг (Кордоны)',
                            docNameEn: '2. R. K. Freitag (Flying Cordons)',
                            milSurv: '61.7%',
                            masterSurv: '100.0%',
                            noteRu: 'Перехват чапаров до 40.5%',
                            noteEn: 'Envoy intercept up to 40.5%'
                          },
                          {
                            docNameRu: '3. Кн. М. С. Воронцов (Клин)',
                            docNameEn: '3. Prince M. S. Vorontsov (Column)',
                            milSurv: '44.3%',
                            masterSurv: '100.0%',
                            noteRu: 'Натиск +11%, трофеи обозов +30м.',
                            noteEn: 'Strike +11%, wagon loot +30m.'
                          },
                          {
                            docNameRu: '4. Кн. А. И. Барятинский (Просеки)',
                            docNameEn: '4. Prince A. I. Baryatinsky (Forest Axe)',
                            milSurv: '1.4%',
                            masterSurv: '98.4%',
                            noteRu: 'Голод -90м./ход, Зульмат 54% без Низамов',
                            noteEn: 'Famine -90m/t, 54% Zulmat w/o Nizams'
                          }
                        ].map((d, idx) => (
                          <div key={idx} className="p-2.5 rounded-lg bg-[#0c0f14] border border-stone-800 space-y-1">
                            <div className="text-amber-300 font-bold truncate">{t(d.docNameRu, d.docNameEn)}</div>
                            <div className="flex justify-between text-[10px]">
                              <span className="text-stone-400">{t('Военная (№3):', 'Military (#3):')}</span>
                              <span className={idx === 3 ? 'text-rose-400 font-bold' : 'text-sky-300 font-bold'}>{d.milSurv}</span>
                            </div>
                            <div className="flex justify-between text-[10px]">
                              <span className="text-stone-400">{t('Мастер Дивана (№4):', 'Master Divan (#4):')}</span>
                              <span className="text-emerald-400 font-bold">{d.masterSurv}</span>
                            </div>
                            <div className="text-[10px] text-stone-400 font-sans pt-0.5 border-t border-stone-800/80">
                              {t(d.noteRu, d.noteEn)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
            )}

            {/* Средний блок: ИИ-Симулятор баланса Монте-Карло (в Студии) и Исторический эпилог (1859–1877) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {studioMode && (
              <div className="lg:col-span-5 bg-[#13161b] border border-stone-800 rounded-xl p-5 shadow-2xl space-y-4">
                <div className="border-b border-stone-800 pb-3">
                  <span className="text-[10px] font-mono uppercase text-amber-400">
                    {t(
                      'Автоматическое тестирование формул (Monte-Carlo AI Runner)',
                      'Automated Formula Verification (Monte-Carlo AI Runner)'
                    )}
                  </span>
                  <h3 className="text-base font-bold font-serif text-stone-100 uppercase mt-0.5">
                    {t(
                      'Калибровка математического баланса партий',
                      'Campaign Mathematical Balance Calibration'
                    )}
                  </h3>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="flex justify-between text-stone-300 mb-1">
                      <span>
                        {t('Количество виртуальных ИИ-кампаний:', 'Virtual AI Campaigns to Run:')}
                      </span>
                      <strong className="font-mono text-amber-300">
                        {simRunsCount} {t('прогонов', 'runs')}
                      </strong>
                    </label>
                    <input
                      type="range"
                      min="20"
                      max="500"
                      step="20"
                      value={simRunsCount}
                      onChange={(e) => setSimRunsCount(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="flex justify-between text-stone-300 mb-1">
                      <span>
                        {t(
                          'Коэффициент натиска Кавказского корпуса:',
                          'Separate Caucasian Corps Offensive Multiplier:'
                        )}
                      </span>
                      <strong className="font-mono text-red-300">×{simDifficultyWeight.toFixed(1)}</strong>
                    </label>
                    <input
                      type="range"
                      min="0.8"
                      max="1.6"
                      step="0.1"
                      value={simDifficultyWeight}
                      onChange={(e) => setSimDifficultyWeight(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>

                  <button
                    onClick={handleRunMonteCarloSimulation}
                    className="w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold uppercase tracking-wider cursor-pointer transition shadow-md"
                  >
                    {t(
                      `Запустить серию из ${simRunsCount} ИИ-партий`,
                      `Run Batch of ${simRunsCount} AI Campaigns`
                    )}
                  </button>
                </div>

                <div className="bg-[#0e1116] border border-stone-800 rounded-xl p-3.5 space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-stone-400">
                      {t('Выживаемость Имамата:', 'Imamate Survival Rate:')}
                    </span>
                    <span className="text-emerald-400 font-bold">{monteCarloReport.survivalRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">
                      {t('Средний стресс Шамиля к финалу:', 'Mean Final Shamil Strain:')}
                    </span>
                    <span className="text-amber-300 font-bold">{monteCarloReport.avgFinalStress}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">
                      {t('Частота порохового голода:', 'Powder Bottleneck Frequency:')}
                    </span>
                    <span className="text-red-300 font-bold">{monteCarloReport.powderBottleneckRate}%</span>
                  </div>
                  <div className="text-[11px] text-stone-300 border-t border-stone-800 pt-2">
                    <div>
                      • {t('Опора Имама:', 'Imam’s Pillar:')}{' '}
                      {t(
                        monteCarloReport.mostStalwartNaib,
                        monteCarloReport.mostStalwartNaibEn || monteCarloReport.mostStalwartNaib
                      )}
                    </div>
                    <div className="mt-1">
                      • {t('Зона риска:', 'Risk Zone:')}{' '}
                      {t(
                        monteCarloReport.mostRebelliousNaib,
                        monteCarloReport.mostRebelliousNaibEn || monteCarloReport.mostRebelliousNaib
                      )}
                    </div>
                  </div>
                  <p className="text-[11px] text-amber-300/90 pt-1">
                    {t(
                      monteCarloReport.recommendedBalanceNote,
                      monteCarloReport.recommendedBalanceNoteEn ||
                        monteCarloReport.recommendedBalanceNote
                    )}
                  </p>
                </div>
              </div>
              )}

              {/* Правая колонка: Исторический эпилог (1859–1877): Калуга, Стамбул и Согратль */}
              <div className={`${studioMode ? 'lg:col-span-7' : 'lg:col-span-12'} bg-[#13161b] border border-stone-800 rounded-xl p-5 shadow-2xl space-y-4`}>
                <div className="border-b border-stone-800 pb-3">
                  <span className="text-[10px] font-mono uppercase text-amber-400">
                    {t(
                      'Исторический эпилог эпопеи (1859–1877 гг.)',
                      'Historical Epilogue of the Epic (1859–1877)'
                    )}
                  </span>
                  <h3 className="text-base font-bold font-serif text-stone-100 uppercase mt-0.5">
                    {t(
                      'Судьба Имама Шамиля: Калуга, триумф в Стамбуле (1869) и «Малый газават» (1877)',
                      'Fate of Imam Shamil: Kaluga, Triumph in Istanbul (1869) & the “Lesser Ghazawat” (1877)'
                    )}
                  </h3>
                </div>

                <div className="space-y-4">
                  {EPILOGUE_CHAPTERS.map((chap) => {
                    const chosen = epilogueDecisionsMade[chap.id];
                    const chapterMeta = {
                      epilogue_kaluga_1859: {
                        banner: 'Epilogue_Kaluga_And_Medina_1859_1871.jpg',
                        actors: ['Имам Шамиль', 'Кн. Барятинский']
                      },
                      epilogue_istanbul_1869: {
                        banner: 'KeyArt_Michik_1855_Jamaluddin_Exchange.jpg',
                        actors: ['Имам Шамиль', 'Гази-Мухаммад']
                      },
                      epilogue_uprising_1877: {
                        banner: 'Epilogue_Sogratl_Uprising_1877.jpg',
                        actors: ['Согратль', 'Гази-Мухаммад']
                      }
                    }[chap.id] || { banner: chap.imageUrl, actors: ['Имам Шамиль'] };
                    const bannerSrc = chapterMeta.banner || chap.imageUrl;

                    return (
                      <div
                        key={chap.id}
                        className="bg-[#171b22] border border-stone-800 rounded-xl overflow-hidden shadow-lg"
                      >
                        {bannerSrc && (
                          <div className="relative isolate h-52 sm:h-56 w-full overflow-hidden bg-[#0c0e13] border-b border-amber-500/25 flex items-center justify-center">
                            <img
                              src={resolveMediaAsset(bannerSrc)}
                              alt=""
                              aria-hidden="true"
                              className="absolute inset-0 w-full h-full object-cover object-center blur-xl opacity-35 scale-110 pointer-events-none"
                            />
                            <img
                              src={resolveMediaAsset(bannerSrc)}
                              alt={t(chap.title, chap.titleEn || chap.title)}
                              className="relative z-10 h-full w-auto max-w-full object-contain opacity-95 drop-shadow-2xl"
                            />
                            <div className="absolute inset-0 z-20 bg-gradient-to-t from-[#171b22] via-black/20 to-black/30 pointer-events-none" />
                            <div className="absolute top-2.5 inset-x-3 z-30 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
                              <span className="px-2.5 py-1 rounded bg-black/75 border border-amber-500/40 text-amber-300 font-bold">
                                📅 {t(chap.period, chap.periodEn || chap.period)}
                              </span>
                              <span className="px-2.5 py-1 rounded bg-black/70 border border-stone-700 text-stone-300">
                                📍 {t(chap.location, chap.locationEn || chap.location)}
                              </span>
                            </div>
                            <div className="absolute bottom-2.5 inset-x-3 z-30 flex items-end justify-between gap-3">
                              <h4 className="text-sm sm:text-base font-bold font-serif text-amber-100 drop-shadow leading-snug">
                                {t(chap.title, chap.titleEn || chap.title)}
                              </h4>
                              <div className="flex items-center -space-x-2 shrink-0">
                                {chapterMeta.actors.map((act, i) => (
                                  <span key={i} title={act} className="inline-block ring-2 ring-black/80 rounded-full">
                                    <PortraitMedallion
                                      src={findPortrait(act)}
                                      name={act}
                                      color={chosen ? '#10b981' : '#f59e0b'}
                                      size={34}
                                    />
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                        <div className="p-4 space-y-2.5">
                          {!bannerSrc && (
                            <>
                              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-amber-400">
                                <span>{t(chap.period, chap.periodEn || chap.period)}</span>
                                <span className="text-stone-400">
                                  {t(chap.location, chap.locationEn || chap.location)}
                                </span>
                              </div>
                              <h4 className="text-sm font-bold font-serif text-stone-100">
                                {t(chap.title, chap.titleEn || chap.title)}
                              </h4>
                            </>
                          )}
                          <p className="text-xs text-stone-300 leading-relaxed">
                            {t(
                              chap.historicalNarrative,
                              chap.historicalNarrativeEn || chap.historicalNarrative
                            )}
                          </p>

                          {chosen ? (
                            <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-300 space-y-1">
                              <div className="font-bold">
                                ✓ {t(chosen.label, chosen.labelEn || chosen.label)}
                              </div>
                              <div className="text-[11px] text-stone-200">
                                {t(chosen.outcome, chosen.outcomeEn || chosen.outcome)}
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-1.5 pt-1">
                              {chap.decisions.map((dec) => (
                                <button
                                  key={dec.id}
                                  onClick={() => handleChooseEpilogueDecision(chap, dec)}
                                  className="w-full text-left p-2.5 rounded-lg bg-[#0e1116] hover:bg-amber-500/15 border border-stone-800 hover:border-amber-500/50 text-xs text-stone-200 cursor-pointer transition"
                                >
                                  • {t(dec.label, dec.labelEn || dec.label)}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
  );
}
