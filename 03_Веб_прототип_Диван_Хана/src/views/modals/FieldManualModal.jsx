// Окно «FieldManualModal» — вынесено из App.jsx; все значения состояния и обработчики приходят через props
import { HISTORICAL_IRONMAN_CHALLENGES } from '../../data/appContent.js';
import { IMPERIAL_GENERALS } from '../../data/campaignData.js';

export default function FieldManualModal({
  activeIronmanChallengeId,
  fieldManualSection,
  handleLaunchIronmanChallenge,
  naibates,
  setFieldManualSection,
  setShowFieldManualModal,
  t
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#131720] border border-indigo-500/50 rounded-2xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-stone-800 flex flex-wrap items-center justify-between gap-2 bg-[#171c26]">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-300 block">
                  {t(
                    'Военно-историческое наставление Диван-ханы • Дарго — Ведено — Гуниб',
                    'Divan-Khana Military & Administrative Compendium • Dargo — Vedeno — Gunib'
                  )}
                </span>
                <h2 className="text-base sm:text-lg font-bold font-serif text-stone-100">
                  📘 {t('Полевой устав мудира и канонира Диван-ханы (1839–1859)', 'The Divan-Khana Tactician’s & Mudir’s Field Manual')}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFieldManualModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 font-mono text-xs font-bold cursor-pointer"
                >
                  {t('Закрыть ✕', 'Close ✕')}
                </button>
              </div>
            </div>

            {/* Панель быстрого запуска 3 хардкорных испытаний Ironman (M15) */}
            <div className="px-4 py-3 bg-[#0e121a] border-b border-stone-800 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] font-mono font-bold text-amber-300 uppercase">
                  ⚔️ {t('Испытания аль-Карахи (Historical Ironman Challenges — запуск в 1 клик с фиксацией ИИ-доктрины):', 'Al-Qarakhi Historical Ironman Challenges (1-Click Launch with Locked AI Doctrine):')}
                </span>
                {activeIronmanChallengeId && (
                  <span className="px-2 py-0.5 rounded bg-rose-500/20 border border-rose-500/40 text-rose-300 font-mono text-[10px] font-bold">
                    {t('Активно испытание:', 'Active Ironman:')} {activeIronmanChallengeId}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                {HISTORICAL_IRONMAN_CHALLENGES.map((ch) => (
                  <div
                    key={ch.id}
                    className={`p-2.5 rounded-xl border flex flex-col justify-between gap-2 ${
                      activeIronmanChallengeId === ch.id
                        ? 'bg-amber-500/15 border-amber-400'
                        : 'bg-[#131823] border-stone-800'
                    }`}
                  >
                    <div>
                      <div className="text-[10px] font-mono text-amber-400 font-bold">{t(ch.badgeRu, ch.badgeEn)}</div>
                      <div className="text-xs font-serif font-bold text-stone-100 mt-0.5">{t(ch.titleRu, ch.titleEn)}</div>
                      <p className="text-[11px] text-stone-400 mt-1 leading-snug">{t(ch.descRu, ch.descEn)}</p>
                    </div>
                    <button
                      onClick={() => handleLaunchIronmanChallenge(ch.id)}
                      className="w-full py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-mono text-[11px] font-extrabold cursor-pointer transition"
                    >
                      ⚔️ {t('Запустить испытание Ironman', 'Launch Ironman Challenge')}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-4 pt-3 border-b border-stone-800 flex flex-wrap gap-2 bg-[#11151d]">
              {[
                { id: 'doctrines', labelRu: '1. Матрица 16 000 партий и 4 Генерала', labelEn: '1. 16,000-Run Matrix & 4 AI Generals' },
                { id: 'command', labelRu: '2. Гонцы, Караваны и Формулы', labelEn: '2. Couriers, Convoys & Formulas' },
                { id: 'naibs', labelRu: '3. Оперативное досье 10 Наибов', labelEn: '3. Operational Dossier of 10 Naibs' },
                { id: 'siege', labelRu: '4. Минная война Сафарова и 18 Газырей', labelEn: '4. Safarov Mine Warfare & 18 Gazyrs' }
              ].map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => setFieldManualSection(sec.id)}
                  className={`px-3 py-1.5 rounded-t-lg font-mono text-xs font-bold cursor-pointer transition ${
                    fieldManualSection === sec.id
                      ? 'bg-indigo-500 text-stone-950'
                      : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-b-0 border-stone-800'
                  }`}
                >
                  {t(sec.labelRu, sec.labelEn)}
                </button>
              ))}
            </div>

            <div className="p-4 overflow-y-auto space-y-4 text-xs">
              {fieldManualSection === 'doctrines' && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-[#0c0f14] border border-indigo-500/30 space-y-2">
                    <div className="text-xs font-mono font-bold text-indigo-300 uppercase">
                      {t(
                        'Тепловая матрица выживаемости Имамата: 16 000 кампаний (4 стратегии × 4 ИИ-доктрины × 1 000 симуляций)',
                        'Imamate Survival Heatmap: 16,000 Campaigns (4 Player Strategies × 4 Imperial AI Doctrines × 1,000 Runs)'
                      )}
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse font-mono text-[11px]">
                        <thead>
                          <tr className="border-b border-stone-800 text-stone-400">
                            <th className="py-2 pr-3">{t('Стратегия \\ Доктрина РИ', 'Strategy \\ Imperial Doctrine')}</th>
                            <th className="py-2 px-2 text-rose-300">{t('1. Граббе (Таран)', '1. Grabbe (Siege Ram)')}</th>
                            <th className="py-2 px-2 text-amber-300">{t('2. Фрейтаг (Кордоны)', '2. Freitag (Cordons)')}</th>
                            <th className="py-2 px-2 text-sky-300">{t('3. Воронцов (Клин)', '3. Vorontsov (Column)')}</th>
                            <th className="py-2 px-2 text-purple-300">{t('4. Барятинский (Просеки)', '4. Baryatinsky (Forest Axe)')}</th>
                            <th className="py-2 pl-2 text-emerald-300">{t('Ротация (База)', 'Rotation (Base)')}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-800/70">
                          <tr>
                            <td className="py-2 pr-3 font-sans font-semibold text-stone-300">
                              {t('1. Пассивный Адат (без Низамов)', '1. Passive Adat Baseline')}
                            </td>
                            <td className="py-2 px-2 text-red-400">0.0% (8.4 осад)</td>
                            <td className="py-2 px-2 text-red-400">0.0% (7.5 осад)</td>
                            <td className="py-2 px-2 text-red-400">0.0% (8.2 осад)</td>
                            <td className="py-2 px-2 text-red-400">0.0% (9.4 осад)</td>
                            <td className="py-2 pl-2 text-red-400 font-bold">0.0%</td>
                          </tr>
                          <tr>
                            <td className="py-2 pr-3 font-sans font-semibold text-stone-300">
                              {t('2. Алчный закят (без мухтасибов)', '2. Greedy Zakat (No Muhtasibs)')}
                            </td>
                            <td className="py-2 px-2 text-red-400">0.0% (32% перехв.)</td>
                            <td className="py-2 px-2 text-red-400">0.0% (41% перехв.)</td>
                            <td className="py-2 px-2 text-red-400">0.0% (35% перехв.)</td>
                            <td className="py-2 px-2 text-red-400">0.0% (39% перехв.)</td>
                            <td className="py-2 pl-2 text-red-400 font-bold">0.0%</td>
                          </tr>
                          <tr>
                            <td className="py-2 pr-3 font-sans font-semibold text-sky-200">
                              {t('3. Опора на порох и блиндажи', '3. Military Powder & Blindages')}
                            </td>
                            <td className="py-2 px-2 text-amber-300 font-bold">38.3% (Зул. 28.7%)</td>
                            <td className="py-2 px-2 text-emerald-300 font-bold">61.7% (Зул. 18.1%)</td>
                            <td className="py-2 px-2 text-amber-300 font-bold">44.3% (Зул. 30.1%)</td>
                            <td className="py-2 px-2 text-rose-400 font-bold">1.4% (Зул. 54.0%)</td>
                            <td className="py-2 pl-2 text-sky-300 font-bold">88.5%</td>
                          </tr>
                          <tr className="bg-emerald-950/25">
                            <td className="py-2 pr-3 font-sans font-bold text-emerald-300">
                              ★ {t('4. Мастер-стратегия Диван-ханы', '4. Divan-Khana Master Strategy')}
                            </td>
                            <td className="py-2 px-2 text-emerald-400 font-bold">100.0% (0.7 осад)</td>
                            <td className="py-2 px-2 text-emerald-400 font-bold">100.0% (0.6 осад)</td>
                            <td className="py-2 px-2 text-emerald-400 font-bold">100.0% (0.6 осад)</td>
                            <td className="py-2 px-2 text-emerald-300 font-bold">98.4% (1.6 осад)</td>
                            <td className="py-2 pl-2 text-emerald-400 font-extrabold">100.0%</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {IMPERIAL_GENERALS.map((gen, idx) => (
                      <div key={gen.id} className="p-3 rounded-xl bg-stone-900/90 border border-stone-800 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-serif font-bold text-amber-300">{t(gen.name, gen.nameEn)}</span>
                          <span className="px-2 py-0.5 rounded bg-stone-950 border border-stone-700 font-mono text-[10px] text-rose-300">
                            {t(gen.doctrineModifiers.formulaRu, gen.doctrineModifiers.formulaEn)}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-300">{t(gen.desc, gen.descEn)}</p>
                        <div className="p-2 rounded bg-[#0c0f14] border border-emerald-500/30 text-[11px] text-emerald-300 font-mono">
                          ✓ {t('Контр-игра:', 'Counter-Play:')}{' '}
                          {idx === 0 && t('Принять Низам о пороховых мельницах на 1-м ходу и держать ≥50 пудов пороха в Гергебиле и Чохе.', 'Enact Powder Mills Nizam on Turn 1 and maintain ≥50 poods of powder in Gergebil and Chokh.')}
                          {idx === 1 && t('Отправлять только вьючных чапаров (15–30 пудов) тайными горными тропами, избегая просек.', 'Send only 15–30 pood pack couriers along secret mountain trails, avoiding cleared roads.')}
                          {idx === 2 && t('Заманить колонну в леса Беноя/Дарго и громить сухарные обозы в Тактической диораме (+30 мер/ход).', 'Draw the column into Benoy/Dargo beech forests and ambush supply wagons (+30 provisions/turn).')}
                          {idx === 3 && t('Обязательны Мухтасибы + Верховный суд + Халват при стрессе ≥62% и защита житницы в Шали.', 'Requires Muhtasibs + Supreme Court + Khalwat at Strain ≥62% and defending the Shali granary.')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {fieldManualSection === 'command' && (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-[#0c0f14] border border-stone-800 space-y-2">
                    <h4 className="font-serif font-bold text-amber-300 text-sm">
                      {t('Формула перехвата гонца и 4 эшелона пороховых караванов', 'Envoy Interception Formula & 4 Gunpowder Convoy Tiers')}
                    </h4>
                    <div className="p-2.5 rounded bg-stone-950 border border-amber-500/30 font-mono text-amber-200 text-xs">
                      P_intercept(i, c, g) = clamp( floor(RouteHours_i / 2) + R_convoy(c) + Δ_winter + Δ_defilade + Δ_general(g) + 20·I_siege, 2%, 85% )
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 pt-1 font-mono text-[11px]">
                      {[
                        { tier: '0 пуд. / 0p', bonus: '+0% P(exec)', risk: '+0% P(int)', useRu: 'Указы, вызов в Диван, сбор закята', useEn: 'Decrees, summons, Zakat collection' },
                        { tier: '15 пуд. / 15p', bonus: '+6% P(exec)', risk: '+0% P(int)', useRu: 'Скрытная подпитка через козьи тропы', useEn: 'Stealth resupply over mountain paths' },
                        { tier: '30 пуд. / 30p', bonus: '+12% P(exec)', risk: '+8% P(int)', useRu: 'Стандартное снабжение перед осадой', useEn: 'Standard pre-siege reinforcement' },
                        { tier: '45 пуд. / 45p', bonus: '+18% P(exec)', risk: '+16% P(int)', useRu: 'Экстренный прорыв порохового голода', useEn: 'Emergency artillery & siege relief' }
                      ].map((c) => (
                        <div key={c.tier} className="p-2.5 rounded-lg bg-stone-900 border border-stone-800 space-y-1">
                          <div className="text-amber-300 font-bold">{c.tier}</div>
                          <div className="text-emerald-400">{c.bonus}</div>
                          <div className="text-rose-400">{c.risk}</div>
                          <div className="text-stone-400 font-sans text-[10px]">{t(c.useRu, c.useEn)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {fieldManualSection === 'naibs' && (
                <div className="p-3.5 rounded-xl bg-[#0c0f14] border border-stone-800 overflow-x-auto">
                  <table className="w-full text-left border-collapse font-mono text-[11px]">
                    <thead>
                      <tr className="border-b border-stone-800 text-stone-400">
                        <th className="py-2 pr-2">{t('Наибство', 'Naibate')}</th>
                        <th className="py-2 px-2">{t('Наиб', 'Naib')}</th>
                        <th className="py-2 px-2 text-emerald-400">Iman</th>
                        <th className="py-2 px-2 text-amber-300">Courage</th>
                        <th className="py-2 px-2 text-rose-300">Greed</th>
                        <th className="py-2 px-2 text-purple-300">Pride</th>
                        <th className="py-2 pl-2">{t('Текущий порох / Натиск', 'Current Powder / Pressure')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-800/60">
                      {naibates.map((n) => (
                        <tr key={n.id} className="hover:bg-stone-900/50">
                          <td className="py-2 pr-2 font-sans font-bold text-stone-200">{t(n.name, n.nameEn || n.name)}</td>
                          <td className="py-2 px-2 font-sans text-amber-200">{t(n.naibName, n.naibNameEn || n.naibName)}</td>
                          <td className="py-2 px-2 text-emerald-400">{n.traits.iman}</td>
                          <td className="py-2 px-2 text-amber-300">{n.traits.courage}</td>
                          <td className="py-2 px-2 text-rose-300">{n.traits.greed}</td>
                          <td className="py-2 px-2 text-purple-300">{n.traits.pride}</td>
                          <td className="py-2 pl-2 text-sky-300">
                            {n.gunpowder} {t('п.', 'p.')} / {n.imperialPressure}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {fieldManualSection === 'siege' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-[#0c0f14] border border-stone-800 space-y-2">
                    <h4 className="font-serif font-bold text-amber-300 text-sm">
                      {t('Медный таз Хаджи-Юсуфа Сафарова (Акустический пеленг)', 'Hadji-Yusuf Safarov’s Copper Basin (Acoustic Counter-Mining)')}
                    </h4>
                    <div className="p-2 rounded bg-stone-950 border border-sky-500/30 font-mono text-sky-300 text-[11px]">
                      I(d) = I_0 / (1 + α·d²),  f_sonar(d) = 52 + max(0, 100 - d)·1.65 Hz
                    </div>
                    <p className="text-stone-300 leading-relaxed">
                      {t(
                        'Когда сапёры противника подходят на дистанцию d ∈ [12 м, 25 м], стоячие волны в медном тазу смыкаются, а в пульте Звук 2.0 раздаётся медный резонанс. Немедленно подрывайте контрмину для обрушения галереи.',
                        'When enemy sappers reach distance d ∈ [12 m, 25 m], standing ripples in the copper basin converge and the Audio 2.0 mixer emits a metallic ring. Detonate the counter-mine immediately to collapse their tunnel.'
                      )}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#0c0f14] border border-stone-800 space-y-2">
                    <h4 className="font-serif font-bold text-emerald-300 text-sm">
                      {t('Патронташ на 18 нагрудных газырей (UGazyrAmmunitionComponent)', '18-Gazyr Breast Bandolier (UGazyrAmmunitionComponent)')}
                    </h4>
                    <p className="text-stone-300 leading-relaxed">
                      {t(
                        'Каждый выстрел в Тактической диораме физически опустошает одну из 18 нагрудных деревянных трубочек черкески. Берегите неприкосновенный резерв (газыри 16–18) для кинжального залпа в упор перед шашечной контратакой.',
                        'Every volley in the Tactical Diorama physically depletes the 18 wooden cartridge tubes on the warrior’s chest. Preserve the golden reserve (gazyrs 16–18) for point-blank dagger fire before a shashka charge.'
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
  );
}
