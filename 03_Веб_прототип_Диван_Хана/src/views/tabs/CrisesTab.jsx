// Вкладка «CrisesTab» — Пять Актов Кавказской Драмы (1839–1859), Диалоги Диван-ханы, Судьбы Героев и нагрузка «Зульмат»
import { useState } from 'react';
import { Crown, CheckCircle2, Flame, Swords, Sparkles, MessageSquareQuote } from 'lucide-react';
import { PortraitMedallion, RichText, TabHeroBanner, findPortrait } from '../hud/GameHUD.jsx';
import { ShashkaSabersIcon, WaxSealIcon } from '../hud/PeriodIcons.jsx';
import { DRAMATIC_CAMPAIGN_ACTS } from '../../data/campaignData.js';
import { resolveMediaAsset } from '../../data/embeddedMediaAssets.js';
import { HISTORICAL_EPISODES } from '../../data/historicalEpisodes.js';

export default function CrisesTab({
  activeEpisodeId = 'ep_1845_dargo',
  copyTextSafe,
  crises,
  episodesState = {},
  handleResolveEpisodePhase,
  handleResolveHistoricalCrisis,
  leaderStressData,
  nizamModifiers,
  resources,
  setActiveEpisodeId,
  setActiveEpisodeModal,
  setActiveTab,
  setUeExportFormat,
  studioMode,
  t,
  turn = 1,
  turnActionQuota,
  ueExportFormat,
  unrealEngineExportCode
}) {
  const [selectedActNum, setSelectedActNum] = useState(2);
  const [actFilter, setActFilter] = useState('all');
  const [crisesSubTab, setCrisesSubTab] = useState('council');
  const [selectedCrisisId, setSelectedCrisisId] = useState(null);
  const resolvedCount = crises.filter((c) => c.resolved).length;
  const crisisTurnLimitReached =
    turnActionQuota &&
    (turnActionQuota.crisesResolved >= turnActionQuota.maxCrisesPerTurn ||
      turnActionQuota.sealsRemaining <= 0);
  const activeAct =
    DRAMATIC_CAMPAIGN_ACTS.find((a) => a.actNumber === selectedActNum) || DRAMATIC_CAMPAIGN_ACTS[1];

  const sortedCrises = [...crises].sort((a, b) => (a.unlockTurn || 1) - (b.unlockTurn || 1));
  const filteredCrises =
    actFilter === 'all'
      ? sortedCrises
      : sortedCrises.filter((c) => Number(c.actNumber || 3) === Number(actFilter));

  const defaultActiveCrisis =
    filteredCrises.find((c) => !c.resolved && (c.unlockTurn || 1) <= turn) ||
    filteredCrises.find((c) => !c.resolved) ||
    filteredCrises[0] ||
    crises[0];
  const activeCrisis =
    filteredCrises.find((c) => c.id === selectedCrisisId) || defaultActiveCrisis;

  // Динамическое определение судеб ключевых героев на основе принятых решений игрока
  const hmCrisis = crises.find((c) => c.id === 'crisis_hadji_murat_1851');
  const michikCrisis = crises.find((c) => c.id === 'crisis_michik_exchange_1855');
  const chokhCrisis = crises.find((c) => c.id === 'crisis_chokh_siege_1849');
  const shaliCrisis = crises.find((c) => c.id === 'crisis_shali_forest_clearing_1850');

  const characterFates = [
    {
      id: 'fate_hadji_murat',
      nameRu: 'Хаджи-Мурат Хунзахский',
      nameEn: 'Hadji Murad of Khunzakh',
      roleRu: '«Крылатый барс Аварии» • Командир конницы',
      roleEn: '“Winged Leopard of Avaria” • Cavalry Commander',
      portraitKey: 'Хаджи-Мурат',
      statusRu: !hmCrisis?.resolved
        ? 'На распутье: назревает конфликт с султаном Даниял-беком (Акт IV, 1851 г.)'
        : hmCrisis.chosenOption?.includes('Отвергнуть') || hmCrisis.chosenOption?.includes('Reject')
        ? 'Верен знамени Имамата: остался правой рукой Шамиля до самого Гуниба!'
        : 'Трагический разрыв: лишён наибства и ушёл в смертельный побег (как у Л. Н. Толстого)',
      statusEn: !hmCrisis?.resolved
        ? 'At a crossroads: conflict brewing with Sultan Daniyal-Bek (Act IV, 1851)'
        : hmCrisis.chosenOption?.includes('Отвергнуть') || hmCrisis.chosenOption?.includes('Reject')
        ? 'Loyal to the Imamate: remains Shamil’s right hand all the way to Gunib!'
        : 'Tragic rupture: stripped of his Naibate and driven into fatal exile',
      tone: !hmCrisis?.resolved
        ? 'amber'
        : hmCrisis.chosenOption?.includes('Отвергнуть') || hmCrisis.chosenOption?.includes('Reject')
        ? 'emerald'
        : 'rose'
    },
    {
      id: 'fate_jamaluddin',
      nameRu: 'Поручик Джемалуддин Шамиль',
      nameEn: 'Lt. Jamaluddin Shamil',
      roleRu: 'Старший сын Имама • Аманат Ахульго (1839–1855)',
      roleEn: 'Eldest Son of the Imam • Hostage of Akhulgo (1839–1855)',
      portraitKey: 'Шамиль',
      statusRu: !michikCrisis?.resolved
        ? 'В Петербурге: ждёт исторического размена на княгинь Чавчавадзе на реке Мичик (1855 г.)'
        : michikCrisis.chosenOption?.includes('обнять сына') || michikCrisis.chosenOption?.includes('embrace son')
        ? 'Вернулся в родные горы: обнял отца на Мичике и стал советником в Карата'
        : 'Военный выкуп: на Мичике освобождены 150 ветеранов Ахульго и караваны со свинцом',
      statusEn: !michikCrisis?.resolved
        ? 'In St. Petersburg: awaiting the historic Michik River prisoner exchange (1855)'
        : michikCrisis.chosenOption?.includes('обнять сына') || michikCrisis.chosenOption?.includes('embrace son')
        ? 'Returned to his native mountains: embraced his father on the Michik River'
        : 'Military ransom: 150 veterans and lead caravans secured at the Michik crossing',
      tone: !michikCrisis?.resolved ? 'amber' : 'emerald'
    },
    {
      id: 'fate_baysungur',
      nameRu: 'Байсунгур Беноевский',
      nameEn: 'Baysungur of Benoy',
      roleRu: 'Несокрушимый наиб Ичкерии • Щит Дарго и Гуниба',
      roleEn: 'Indomitable Naib of Ichkeria • Shield of Dargo & Gunib',
      portraitKey: 'Байсунгур',
      statusRu: !shaliCrisis?.resolved
        ? 'Держит буковые засеки Беноя и готовит отпор «войне топором» ген. Евдокимова'
        : 'Укрепил рубежи Ичкерии и готов идти с Имамом до последнего боя на Верхнем Гунибе',
      statusEn: !shaliCrisis?.resolved
        ? 'Holding the beech abatis of Benoy against Gen. Evdokimov’s “War by the Axe”'
        : 'Fortified the Ichkerian lines and stands ready for the final stand on Upper Gunib',
      tone: 'emerald'
    },
    {
      id: 'fate_safarov',
      nameRu: 'Хаджи-Юсуф Сафаров',
      nameEn: 'Col. Hajji Yusuf Safarov',
      roleRu: 'Главный инженер и строитель подземных крепостей',
      roleEn: 'Chief Engineer & Builder of Subterranean Fortresses',
      portraitKey: 'Хаджи-Юсуф Сафаров',
      statusRu: !chokhCrisis?.resolved
        ? 'Возводит 4-ярусные блиндажи и контрминные галереи в Гергебиле, Салтах и Чохе'
        : 'Бастион Чох выстоял под 22 000 ядер кн. Аргутинского благодаря инженерной науке Сафарова!',
      statusEn: !chokhCrisis?.resolved
        ? 'Constructing 4-tier log blindages and counter-mines at Gergebil, Salty & Chokh'
        : 'Chokh bastion withstood 22,000 shells of Prince Argutinsky through Safarov’s engineering!',
      tone: 'emerald'
    }
  ];

  return (
    <div className="space-y-5">
      <TabHeroBanner
        artSrc="KeyArt_Michik_1855_Jamaluddin_Exchange.jpg"
        portraitKey="Шамиль"
        portraitName={t('Имам Шамиль и Совет Диван-ханы', 'Imam Shamil & the Divan-Khana Council')}
        portraitTitle={t('Судьбоносные решения 1846–1855 гг. • Река Мичик (10 марта 1855 г.)', 'Fateful Crossroads 1846–1855 • Michik River (March 10, 1855)')}
        portraitColor="#f59e0b"
        tag={t('ПЯТЬ АКТОВ КАВКАЗСКОЙ ДРАМЫ • 1839–1859 ГГ.', 'FIVE ACTS OF THE CAUCASIAN DRAMA • 1839–1859')}
        title={t(
          'Драма Диван-ханы: Судьбы героев, споры наибов и развилки истории',
          'Drama of the Divan-Khana: Hero Fates, Naib Clashes & Crossroads of History'
        )}
        desc={t(
          'Каждое решение [[divan|Диван-ханы]] — от прорыва в Кабарду (1846) и обороны [[siege|осаждённого]] Салты (1847) до суда над Хаджи-Муратом (1851) и возвращения сына Джемалуддина на Мичике (1855) — меняет судьбы соратников и [[authority|авторитет]] Имама.',
          'Every decision of the [[divan|Divan-Khana]] — from the Kabarda thrust (1846) and defence of [[siege|besieged]] Salty (1847) to Hadji Murad’s trial (1851) and son Jamaluddin’s return on the Michik (1855) — reshapes companion fates and the Imam’s [[authority|authority]].'
        )}
        rightSlot={
          <div className="flex flex-wrap items-center gap-2 hud-num text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-950/80 border border-amber-500/40 text-amber-300 font-bold">
              <WaxSealIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('Решено развилок:', 'Crossroads resolved:')} {resolvedCount} / {crises.length}</span>
            </span>
            {turnActionQuota && (
              <span
                className={`px-3 py-1.5 rounded-lg border font-bold ${
                  crisisTurnLimitReached
                    ? 'bg-stone-900/90 border-stone-600 text-stone-400'
                    : 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                }`}
              >
                {t('Лимит на этот ход:', 'Turn limit:')} {turnActionQuota.crisesResolved}/{turnActionQuota.maxCrisesPerTurn}
              </span>
            )}
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-bold ${
                leaderStressData.totalStress > 70
                  ? 'bg-rose-950/80 border-rose-500/50 text-rose-300'
                  : 'bg-stone-900/90 border-amber-500/35 text-amber-200'
              }`}
            >
              <ShashkaSabersIcon className="w-3.5 h-3.5" />
              <span>{t('Нагрузка:', 'Strain:')} {leaderStressData.totalStress}%</span>
            </span>
          </div>
        }
      />

      {/* КОМПАКТНЫЙ ПЕРЕКЛЮЧАТЕЛЬ РЕЖИМОВ ВКЛАДКИ 7 (СОВЕТ РАЗВИЛОК / 5 АКТОВ И СУДЬБЫ / НАГРУЗКА ЗУЛЬМАТ) */}
      <div className="relative hud-walnut-bezel bg-[#13100d] border border-amber-500/45 rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-2 shadow-lg">
        <span className="hud-brass-corner tl" />
        <span className="hud-brass-corner tr" />
        <span className="hud-brass-corner bl" />
        <span className="hud-brass-corner br" />
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-serif">
          {[
            {
              id: 'council',
              labelRu: `⚖️ Зал Совета и Развилки (${resolvedCount}/${crises.length})`,
              labelEn: `⚖️ Council Hall & Crossroads (${resolvedCount}/${crises.length})`
            },
            {
              id: 'episodes',
              labelRu: '📜 5 Эпизодов-Операций (20 глав)',
              labelEn: '📜 5 Operational Episodes (20 Phases)'
            },
            {
              id: 'acts',
              labelRu: '🎭 Пять Актов Драмы и Судьбы Героев (4)',
              labelEn: '🎭 Five Acts of Drama & Hero Fates (4)'
            },
            {
              id: 'zulmat',
              labelRu: `🥀 Бремя Власти и «Зульмат» (${leaderStressData.totalStress}%)`,
              labelEn: `🥀 Burden of Command & “Zulmat” (${leaderStressData.totalStress}%)`
            }
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setCrisesSubTab(mode.id)}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer border ${
                crisesSubTab === mode.id
                  ? 'bg-gradient-to-b from-amber-400 to-amber-600 text-stone-950 border-amber-300 shadow'
                  : 'bg-[#191510] text-stone-300 hover:text-amber-200 border-stone-800'
              }`}
            >
              {t(mode.labelRu, mode.labelEn)}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-1 font-mono text-[11px]">
          {[
            { key: 'all', labelRu: `Все (${crises.length})`, labelEn: `All (${crises.length})` },
            { key: '2', labelRu: 'Акт II: 1845', labelEn: 'Act II: 1845' },
            { key: '3', labelRu: 'Акт III: 1846–49', labelEn: 'Act III: 1846–49' },
            { key: '4', labelRu: 'Акт IV: 1850–55', labelEn: 'Act IV: 1850–55' },
            { key: '5', labelRu: 'Акт V: 1856–59', labelEn: 'Act V: 1856–59' }
          ].map((flt) => (
            <button
              key={flt.key}
              onClick={() => {
                setActFilter(flt.key);
                setCrisesSubTab('council');
              }}
              className={`px-2.5 py-1 rounded border cursor-pointer transition ${
                actFilter === flt.key
                  ? 'bg-amber-500/25 border-amber-400 text-amber-200 font-bold'
                  : 'bg-[#14110d] border-stone-800 text-stone-400 hover:text-stone-200'
              }`}
            >
              {t(flt.labelRu, flt.labelEn)}
            </button>
          ))}
        </div>
      </div>

      {/* РЕЖИМ: 5 МНОГОФАЗНЫХ ИСТОРИЧЕСКИХ ЭПИЗОДОВ-ОПЕРАЦИЙ (20 ФАЗ • 1839–1859) */}
      {crisesSubTab === 'episodes' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5">
            {HISTORICAL_EPISODES.map((ep) => {
              const st = episodesState?.[ep.id] || { phaseIdx: 0, completed: false, history: [] };
              const isSelected = ep.id === activeEpisodeId;
              return (
                <button
                  key={ep.id}
                  type="button"
                  onClick={() => setActiveEpisodeId && setActiveEpisodeId(ep.id)}
                  className={`text-left rounded-xl p-3 border transition cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-400 shadow-lg'
                      : st.completed
                      ? 'bg-emerald-950/35 border-emerald-500/45 hover:border-emerald-400'
                      : 'bg-[#15110d] border-stone-800 hover:border-amber-500/45'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 text-[10px] font-mono">
                    <span className="text-amber-300 font-bold">
                      {t(`Эпизод ${ep.episodeNumber}`, `Episode ${ep.episodeNumber}`)}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded font-bold ${
                        st.completed
                          ? 'bg-emerald-500 text-stone-950'
                          : 'bg-stone-900 text-amber-200 border border-stone-700'
                      }`}
                    >
                      {st.completed ? '4/4 ✓' : `${(st.phaseIdx || 0) + 1}/4`}
                    </span>
                  </div>
                  <div className="font-serif font-extrabold text-xs text-amber-100 mt-1 line-clamp-2">
                    {t(ep.titleRu, ep.titleEn)}
                  </div>
                  <div className="text-[10px] text-stone-400 font-mono mt-1">
                    {t(ep.yearsLabelRu, ep.yearsLabelEn)}
                  </div>
                </button>
              );
            })}
          </div>

          {(() => {
            const ep =
              HISTORICAL_EPISODES.find((item) => item.id === activeEpisodeId) ||
              HISTORICAL_EPISODES[2];
            const st = episodesState?.[ep.id] || { phaseIdx: 0, completed: false, history: [] };
            const curIdx = Math.min(ep.phases.length - 1, st.phaseIdx || 0);
            const curPhase = ep.phases[curIdx] || ep.phases[0];
            return (
              <div className="hud-panel rounded-xl p-4 sm:p-5 border border-amber-500/40 space-y-4 shadow-2xl">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-500/25 pb-3">
                  <div>
                    <div className="text-[10.5px] font-mono text-amber-400 uppercase font-bold">
                      {t(ep.yearsLabelRu, ep.yearsLabelEn)} • ★ {t('Столица ТВД:', 'Theater Capital:')}{' '}
                      {t(ep.capitalLabelRu, ep.capitalLabelEn)}
                    </div>
                    <h3 className="text-base sm:text-lg font-serif font-extrabold text-amber-100 mt-0.5">
                      {t(ep.titleRu, ep.titleEn)}
                    </h3>
                    <p className="text-xs text-stone-300 mt-0.5">
                      {t(ep.subtitleRu, ep.subtitleEn)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (setActiveTab) setActiveTab('map');
                      if (setActiveEpisodeModal) setActiveEpisodeModal(true);
                    }}
                    className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-amber-400 to-emerald-400 text-stone-950 font-serif font-extrabold text-xs cursor-pointer shadow"
                  >
                    🏔️ {t('Открыть на 3D-Столе Кавказа', 'Open on 3D Caucasus Table')}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5">
                  {ep.phases.map((ph, idx) => {
                    const done = st.completed || (st.phaseIdx || 0) > idx;
                    const active = !st.completed && (st.phaseIdx || 0) === idx;
                    return (
                      <div
                        key={ph.id}
                        className={`rounded-xl p-3 border space-y-1.5 ${
                          done
                            ? 'bg-emerald-950/30 border-emerald-500/45'
                            : active
                            ? 'bg-amber-950/35 border-amber-400/75 ring-1 ring-amber-400/40'
                            : 'bg-[#14110d] border-stone-800 opacity-75'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-mono font-bold">
                          <span className={done ? 'text-emerald-300' : active ? 'text-amber-300' : 'text-stone-500'}>
                            {t(`Фаза ${idx + 1}/4`, `Phase ${idx + 1}/4`)} {done ? '✓' : active ? '●' : '🔒'}
                          </span>
                          <span className="text-stone-400 truncate max-w-[110px]">
                            {t(ph.dateRu, ph.dateEn)}
                          </span>
                        </div>
                        <div className="font-serif font-bold text-xs text-amber-100 leading-snug">
                          {t(ph.titleRu, ph.titleEn)}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {!st.completed && curPhase && (
                  <div className="bg-[#17130f] border border-amber-500/35 rounded-xl p-4 space-y-3">
                    <div className="text-sm font-serif font-extrabold text-amber-200">
                      ⚔️ {t(curPhase.titleRu, curPhase.titleEn)}
                    </div>
                    <p className="text-xs sm:text-sm text-stone-200 leading-relaxed font-serif">
                      {t(curPhase.contextRu, curPhase.contextEn)}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {curPhase.choices.map((ch) => (
                        <button
                          key={ch.id}
                          type="button"
                          onClick={() =>
                            handleResolveEpisodePhase && handleResolveEpisodePhase(ep.id, ch)
                          }
                          className="text-left rounded-xl border border-amber-500/45 hover:border-emerald-400 bg-[#120f0c] hover:bg-[#1a1610] p-3 transition cursor-pointer space-y-1"
                        >
                          <div className="font-serif font-extrabold text-xs text-amber-100">
                            {t(ch.labelRu, ch.labelEn)}
                          </div>
                          <div className="text-[10.5px] font-mono text-emerald-300">
                            ⚡ {t(ch.effectRu, ch.effectEn)}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* РЕЖИМ 2: СЮЖЕТНАЯ СЦЕНА — ПЯТЬ АКТОВ КАВКАЗСКОЙ ДРАМЫ И СУДЬБЫ ГЕРОЕВ */}
      {crisesSubTab === 'acts' && (
        <div className="space-y-4">
          <div className="hud-panel rounded-xl p-4 sm:p-5 shadow-2xl space-y-4 border border-amber-500/35">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-500/20 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-amber-400 font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t('ДРАМАТУРГИЧЕСКАЯ ШКАЛА КАМПАНИИ (1839–1859)', 'DRAMATIC CAMPAIGN TIMELINE (1839–1859)')}</span>
                </span>
                <h2 className="text-sm sm:text-base font-bold font-serif text-amber-100 uppercase mt-0.5">
                  {t('Пять Актов Кавказской Войны: от скалы Ахульго до Верхнего Гуниба', 'Five Acts of the Caucasian War: From Akhulgo Cliff to Upper Gunib')}
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {DRAMATIC_CAMPAIGN_ACTS.map((act) => (
                  <button
                    key={act.id}
                    onClick={() => setSelectedActNum(act.actNumber)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer border ${
                      selectedActNum === act.actNumber
                        ? 'bg-amber-500 text-stone-950 border-amber-300 shadow-lg'
                        : 'bg-[#17130e] text-stone-300 hover:text-amber-200 border-stone-700'
                    }`}
                  >
                    {t(`Акт ${act.actNumber} (${act.years})`, `Act ${act.actNumber} (${act.yearsEn})`)}
                  </button>
                ))}
              </div>
            </div>

            {activeAct && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch bg-gradient-to-r from-[#18130e] via-[#130f0b] to-[#18130e] rounded-xl border border-amber-500/30 overflow-hidden">
                <div className="lg:col-span-5 relative min-h-[190px] bg-black">
                  <img
                    src={resolveMediaAsset(activeAct.sceneArt)}
                    alt={t(activeAct.title, activeAct.titleEn)}
                    className="w-full h-full object-cover object-center opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-between p-3.5">
                    <span className="self-start px-2.5 py-0.5 rounded bg-amber-500/90 text-stone-950 font-mono font-extrabold text-[10.5px] uppercase">
                      {t(activeAct.years, activeAct.yearsEn)}
                    </span>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <PortraitMedallion
                          src={findPortrait(activeAct.protagonistAlly)}
                          name={activeAct.protagonistAlly}
                          color="#10b981"
                          size={36}
                        />
                        <span className="text-[11px] font-mono text-emerald-300 font-bold">⚔️ VS</span>
                        <PortraitMedallion
                          src={findPortrait(activeAct.antagonist)}
                          name={activeAct.antagonist}
                          color="#ef4444"
                          size={36}
                        />
                      </div>
                      <span className="text-[10.5px] font-mono text-amber-200 bg-black/75 px-2 py-0.5 rounded border border-amber-500/30">
                        {t(activeAct.antagonist, activeAct.antagonistEn)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-7 p-4 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <h3 className="text-base sm:text-lg font-bold font-serif text-amber-200">
                      {t(activeAct.title, activeAct.titleEn)}
                    </h3>
                    <p className="text-xs text-stone-300 leading-relaxed">
                      {t(activeAct.subtitle, activeAct.subtitleEn)}
                    </p>
                    <div className="p-3 rounded-lg bg-amber-950/35 border-l-2 border-amber-400 space-y-1 mt-2">
                      <div className="text-[10.5px] font-mono text-amber-300 font-bold">
                        💬 {t(activeAct.keyQuoteSpeakerRu, activeAct.keyQuoteSpeakerEn)}
                      </div>
                      <p className="text-xs font-serif italic text-amber-100 leading-relaxed">
                        {t(activeAct.keyQuoteRu, activeAct.keyQuoteEn)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-800 text-xs">
                    <span className="text-emerald-300 font-mono text-[11px]">
                      🎯 <strong>{t('Ставка акта:', 'Act Stakes:')}</strong> {t(activeAct.stakesRu, activeAct.stakesEn)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="hud-panel rounded-xl p-4 sm:p-5 shadow-2xl space-y-3 border border-amber-500/35">
            <div className="border-b border-amber-500/25 pb-2.5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Swords className="w-4 h-4 text-amber-400 shrink-0" />
                <h2 className="text-sm sm:text-base font-bold font-serif text-amber-300 uppercase">
                  {t('Судьбы ключевых героев кампании', 'Fates of Key Campaign Heroes')}
                </h2>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/35 text-amber-200 font-bold">
                {t('Живая память решений', 'Living Choice Consequence')}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {characterFates.map((cf) => (
                <div
                  key={cf.id}
                  className={`p-3 rounded-xl border flex items-start gap-3 ${
                    cf.tone === 'emerald'
                      ? 'bg-emerald-950/35 border-emerald-500/40'
                      : cf.tone === 'rose'
                      ? 'bg-rose-950/40 border-rose-500/45'
                      : 'bg-[#14110d] border-amber-500/30'
                  }`}
                >
                  <PortraitMedallion
                    src={findPortrait(cf.portraitKey)}
                    name={cf.nameRu}
                    color={cf.tone === 'emerald' ? '#10b981' : cf.tone === 'rose' ? '#f43f5e' : '#f59e0b'}
                    size={40}
                  />
                  <div className="min-w-0 flex-1 text-xs">
                    <div className="font-bold font-serif text-amber-100">
                      {t(cf.nameRu, cf.nameEn)}
                    </div>
                    <div className="text-[10.5px] font-mono text-stone-400">
                      {t(cf.roleRu, cf.roleEn)}
                    </div>
                    <div
                      className={`mt-1 text-[11.5px] font-medium leading-snug ${
                        cf.tone === 'emerald'
                          ? 'text-emerald-300'
                          : cf.tone === 'rose'
                          ? 'text-rose-300'
                          : 'text-amber-200'
                      }`}
                    >
                      • {t(cf.statusRu, cf.statusEn)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* РЕЖИМ 1 (ПО УМОЛЧАНИЮ): MASTER-DETAIL ЗАЛ СОВЕТА ДИВАН-ХАНЫ (СПИСОК 7 РАЗВИЛОК СЛЕВА + АКТИВНАЯ СЦЕНА СПРАВА БЕЗ СКРОЛЛА) */}
      {crisesSubTab === 'council' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Левая колонка (4 из 12): Хронологический реестр 7 исторических развилок */}
          <div className="lg:col-span-4 hud-panel rounded-xl p-3.5 shadow-2xl space-y-2.5 border border-amber-500/35">
            <div className="border-b border-amber-500/25 pb-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-amber-400 shrink-0" />
                <h2 className="text-xs sm:text-sm font-bold font-serif text-amber-300 uppercase">
                  {t('Реестр 7 развилок (1845–1855)', '7 Crossroads Registry (1845–1855)')}
                </h2>
              </div>
              <span className="text-[10px] font-mono text-stone-400">
                {t(`Ход #${turn}`, `Turn #${turn}`)}
              </span>
            </div>

            <div className="space-y-1.5">
              {filteredCrises.map((c) => {
                const reqTurn = c.unlockTurn || 1;
                const isLocked = !c.resolved && turn < reqTurn;
                const isSelected = activeCrisis && activeCrisis.id === c.id;
                const cPortrait = findPortrait(c.title, c.historicalContext) || findPortrait('Шамиль');
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCrisisId(c.id)}
                    className={`w-full text-left p-2.5 rounded-xl border transition cursor-pointer flex items-start gap-2.5 ${
                      isSelected
                        ? 'bg-gradient-to-r from-amber-500/25 via-amber-950/60 to-[#14110d] border-amber-400 shadow-lg'
                        : c.resolved
                        ? 'bg-emerald-950/25 border-emerald-500/40 hover:border-emerald-400'
                        : isLocked
                        ? 'bg-[#12100d]/85 border-stone-800/90 opacity-75 hover:opacity-100'
                        : 'bg-[#17130e] border-amber-500/35 hover:border-amber-400'
                    }`}
                  >
                    <PortraitMedallion
                      src={cPortrait}
                      name={c.title}
                      color={c.resolved ? '#10b981' : isLocked ? '#78716c' : '#f59e0b'}
                      size={36}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1 text-[10px] font-mono">
                        <span className="text-amber-300 font-bold truncate">
                          {t(c.year, c.yearEn || c.year)}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded font-bold shrink-0 ${
                            c.resolved
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : isLocked
                              ? 'bg-stone-900 text-stone-400 border border-stone-700'
                              : 'bg-amber-500 text-stone-950 font-extrabold'
                          }`}
                        >
                          {c.resolved
                            ? t('✓ РЕШЕНО', '✓ SEALED')
                            : isLocked
                            ? t(`🔒 ХОД #${reqTurn}`, `🔒 TURN #${reqTurn}`)
                            : t('🔥 РЕШИТЬ', '🔥 OPEN')}
                        </span>
                      </div>
                      <div className="text-xs font-bold font-serif text-stone-100 mt-0.5 line-clamp-2 leading-snug">
                        {t(c.title, c.titleEn || c.title)}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Правая колонка (8 из 12): Активная историческая развилка крупным планом */}
          <div className="lg:col-span-8">
            {activeCrisis && (() => {
              const crisis = activeCrisis;
              const fallbackMeta = {
                crisis_dargo_fire_1845: {
                  sceneArt: 'KeyArt_Dargo_BeechForest_Ambush_1845.jpg',
                  sceneCaption: 'Засада чеченских и дагестанских наибов в вековом буковом лесу Ичкерии против «Сухарной оказии» ген. Пассека (июль 1845 г.)',
                  sceneCaptionEn: 'Ambush by Chechen and Dagestani Naibs in the ancient beech forest of Ichkeria against Gen. Passek’s “Biscuit Convoy” (July 1845)',
                  actors: ['Имам Шамиль', 'Байсунгур Беноевский', 'Кн. Воронцов']
                },
                crisis_kabarda_1846: {
                  sceneArt: 'Crisis_Kabarda_Tatartup_1846.jpg',
                  sceneCaption: 'Переправа конницы муртазеков и горных орудий Шамиля через Терек у Татартупского минарета (апрель 1846 г.)',
                  sceneCaptionEn: 'Shamil’s Murtazek cavalry and mountain guns crossing the Terek at the Tatartup Minaret (April 1846)',
                  actors: ['Имам Шамиль', 'Мухаммад-Амин', 'Ген. Фрейтаг']
                },
                crisis_salty_pirogov_1847: {
                  sceneArt: 'KeyArt_Salty_Siege_CopperBasin_1847.jpg',
                  sceneCaption: 'Осада аула Салты: подземные блиндажи Сафарова и полевой лазарет Н. И. Пирогова (август 1847 г.)',
                  sceneCaptionEn: 'Siege of Salty: Safarov’s subterranean blindages and Surgeon N. I. Pirogov’s field hospital (August 1847)',
                  actors: ['Пирогов', 'Хаджи-Юсуф Сафаров', 'Кн. Воронцов']
                },
                crisis_hadji_murat_1851: {
                  sceneArt: 'Crisis_Hadji_Murat_Council_1851.jpg',
                  sceneCaption: 'Съезд наибов в Андии: противостояние Хаджи-Мурата Хунзахского и Даниял-бека перед Имамом (ноябрь 1851 г.)',
                  sceneCaptionEn: 'Council of Naibs in Andia: confrontation between Hadji Murad of Khunzakh and Daniyal-Bek before the Imam (November 1851)',
                  actors: ['Хаджи-Мурат', 'Даниял-бек', 'Имам Шамиль']
                },
                crisis_michik_exchange_1855: {
                  sceneArt: 'KeyArt_Michik_1855_Jamaluddin_Exchange.jpg',
                  sceneCaption: 'Исторический размен на реке Мичик: возвращение поручика Джемалуддина отцу (10 марта 1855 г.)',
                  sceneCaptionEn: 'Historic exchange on the Michik River: Lt. Jamaluddin returned to his father (March 10, 1855)',
                  actors: ['Имам Шамиль', 'Гази-Мухаммад', 'Кн. Воронцов']
                },
                crisis_chokh_siege_1849: {
                  sceneArt: 'Crisis_Chokh_Siege_1849.jpg',
                  sceneCaption: 'Героическая оборона многоярусного бастиона Чох под огнём 48 осадных орудий с Турчидага (август 1849 г.)',
                  sceneCaptionEn: 'Heroic defense of the multi-tiered Chokh bastion under fire from 48 siege guns on Mount Turchidag (August 1849)',
                  actors: ['Хаджи-Юсуф Сафаров', 'Кибит-Магома', 'Хаджи-Мурат']
                },
                crisis_shali_forest_clearing_1850: {
                  sceneArt: 'Crisis_Shali_Forest_Clearing_1850.jpg',
                  sceneCaption: '«Война топором» на Шалинской просеке: заснеженные бревенчатые завалы и батареи наиба Талгика (зима 1850 г.)',
                  sceneCaptionEn: '“War by the Axe” on the Shali clearing: snowbound log abatis and Naib Talkhig’s batteries (Winter 1850)',
                  actors: ['Талгик Шалинский', 'Байсунгур Беноевский', 'Ген. Евдокимов']
                }
              }[crisis.id] || {};

              const sceneArt = crisis.sceneArt || fallbackMeta.sceneArt;
              const sceneCaption = crisis.sceneCaption || fallbackMeta.sceneCaption;
              const sceneCaptionEn = crisis.sceneCaptionEn || fallbackMeta.sceneCaptionEn;
              const actors = crisis.actors || fallbackMeta.actors || [];
              const cPortrait =
                findPortrait(crisis.title, crisis.historicalContext) || findPortrait('Шамиль');

              return (
                <div
                  key={crisis.id}
                  className={`rounded-xl overflow-hidden border transition shadow-2xl ${
                    crisis.resolved
                      ? 'bg-gradient-to-b from-[#15231d] to-[#0f1714] border-emerald-500/45'
                      : 'bg-gradient-to-b from-[#1e1812] to-[#130f0b] border-amber-500/50'
                  }`}
                >
                  {sceneArt && (
                    <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-black border-b border-amber-500/25">
                      <img
                        src={resolveMediaAsset(sceneArt)}
                        alt={t(crisis.title, crisis.titleEn || crisis.title)}
                        className="w-full h-full object-cover object-center"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#120f0b] via-black/35 to-black/30" />

                      <div className="absolute top-2.5 inset-x-3 flex items-center justify-between gap-2 text-[11px] font-mono">
                        <span className="px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-sm border border-amber-500/40 text-amber-300 font-bold uppercase shadow">
                          📅 {t(crisis.year, crisis.yearEn || crisis.year)}
                        </span>
                        <span
                          className={`px-2.5 py-1 rounded-md font-bold backdrop-blur-sm shadow ${
                            crisis.resolved
                              ? 'bg-emerald-950/85 border border-emerald-400/50 text-emerald-300'
                              : 'bg-amber-950/85 border border-amber-400/50 text-amber-300'
                          }`}
                        >
                          {crisis.resolved
                            ? t('ИСТОРИЧЕСКИЙ ВЫБОР СДЕЛАН', 'HISTORICAL DECISION SEALED')
                            : t('ТРЕБУЕТСЯ РЕШЕНИЕ ИМАМА', 'AWAITING IMAM’S DECREE')}
                        </span>
                      </div>

                      <div className="absolute bottom-2.5 inset-x-3 flex items-end justify-between gap-3">
                        <p className="text-[11px] font-mono text-amber-100/90 drop-shadow leading-snug line-clamp-2">
                          {t(sceneCaption || crisis.title, sceneCaptionEn || sceneCaption || crisis.title)}
                        </p>
                        {actors.length > 0 && (
                          <div className="flex items-center -space-x-2 shrink-0">
                            {actors.map((actorName, i) => (
                              <span key={i} title={actorName} className="inline-block ring-2 ring-black/80 rounded-full">
                                <PortraitMedallion
                                  src={findPortrait(actorName)}
                                  name={actorName}
                                  color={crisis.resolved ? '#10b981' : '#f59e0b'}
                                  size={32}
                                />
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <PortraitMedallion src={cPortrait} name={crisis.title} color={crisis.resolved ? '#10b981' : '#f59e0b'} size={44} />
                      <div className="min-w-0 flex-1">
                        {crisis.actBadgeRu && (
                          <div className="text-[10px] font-mono font-bold text-amber-400 uppercase mb-0.5">
                            ⚔️ {t(crisis.actBadgeRu, crisis.actBadgeEn || crisis.actBadgeRu)}
                          </div>
                        )}
                        <h3 className="text-sm sm:text-base font-bold font-serif text-amber-100 leading-snug">
                          {t(crisis.title, crisis.titleEn || crisis.title)}
                        </h3>
                        <p className="text-xs text-stone-300 leading-relaxed mt-1">
                          {t(crisis.historicalContext, crisis.historicalContextEn || crisis.historicalContext)}
                        </p>
                      </div>
                    </div>

                    {Array.isArray(crisis.dramaticDialogues) && crisis.dramaticDialogues.length > 0 && (
                      <div className="rounded-xl bg-[#0b0e12]/95 border border-amber-500/25 p-3 space-y-2">
                        <div className="text-[10px] font-mono uppercase text-amber-300 font-bold flex items-center gap-1.5">
                          <MessageSquareQuote className="w-3.5 h-3.5 text-amber-400" />
                          <span>{t('ГОЛОСА ДИВАН-ХАНЫ ПЕРЕД РЕШЕНИЕМ:', 'VOICES OF THE DIVAN-KHANA BEFORE THE DECREE:')}</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {crisis.dramaticDialogues.map((dlg, dIdx) => (
                            <div
                              key={dIdx}
                              className="flex items-start gap-2.5 p-2 rounded-lg bg-[#14110d] border border-stone-800/90"
                            >
                              <PortraitMedallion
                                src={findPortrait(dlg.speaker)}
                                name={dlg.speaker}
                                color={dIdx === 0 ? '#f59e0b' : '#38bdf8'}
                                size={30}
                              />
                              <div className="min-w-0 flex-1 text-xs">
                                <div className="flex flex-wrap items-center gap-1">
                                  <span className="font-bold text-amber-200 font-serif">
                                    {t(dlg.speaker, dlg.speakerEn || dlg.speaker)}
                                  </span>
                                  <span className="text-[9.5px] font-mono text-stone-400">
                                    • {t(dlg.role, dlg.roleEn || dlg.role)}
                                  </span>
                                </div>
                                <p className="text-stone-200 italic font-serif mt-0.5 leading-snug text-[11.5px]">
                                  {t(dlg.line, dlg.lineEn || dlg.line)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {crisis.fateConsequenceRu && (
                      <div className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[11px] font-mono text-amber-200">
                        ⚖️ {t(crisis.fateConsequenceRu, crisis.fateConsequenceEn || crisis.fateConsequenceRu)}
                      </div>
                    )}

                    {crisis.resolved ? (
                      <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>
                          {t('Воля Имама:', 'Imam’s Decree:')}{' '}
                          <strong>{t(crisis.chosenOption, crisis.chosenOptionEn || crisis.chosenOption)}</strong>
                        </span>
                      </div>
                    ) : turn < (crisis.unlockTurn || 1) ? (
                      <div className="p-3 rounded-lg bg-stone-900/95 border border-amber-500/35 text-xs text-amber-200 flex items-center justify-between gap-3">
                        <div className="space-y-0.5">
                          <div className="font-mono font-bold text-amber-300">
                            ⏳ {t(`ИСТОРИЧЕСКИЙ СРОК ЕЩЁ НЕ НАСТУПИЛ: ОТКРОЕТСЯ НА ХОДУ #${crisis.unlockTurn}`, `HISTORICAL DATE NOT YET REACHED: UNLOCKS ON TURN #${crisis.unlockTurn}`)}
                          </div>
                          <div className="text-[11px] text-stone-400">
                            {t(
                              `Сейчас идёт Ход #${turn}. Завершите текущие сезоны кампании (Enter), чтобы дойти до событий «${crisis.year}».`,
                              `Currently Turn #${turn}. Advance the campaign turns (Enter) to reach the events of “${crisis.yearEn || crisis.year}”.`
                            )}
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded bg-amber-500/20 border border-amber-500/40 font-mono font-bold text-amber-300 shrink-0">
                          {t(`Ход ${turn}/${crisis.unlockTurn}`, `Turn ${turn}/${crisis.unlockTurn}`)}
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-2 pt-1">
                        {crisisTurnLimitReached && (
                          <div className="px-3 py-1.5 rounded-lg bg-stone-900/90 border border-stone-600 text-[11px] font-mono text-stone-300">
                            ⏳ {t('Лимит развилок на этот ход исчерпан (1/1). Завершите ход (Enter), чтобы принять следующее решение.', 'Crossroads limit for this turn reached (1/1). End turn (Enter) to make the next decision.')}
                          </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                          {crisis.options.map((opt) => (
                            <button
                              key={opt.id}
                              onClick={() => handleResolveHistoricalCrisis(crisis, opt)}
                              className={`w-full text-left p-3 rounded-lg border transition cursor-pointer flex flex-col justify-between ${
                                crisisTurnLimitReached
                                  ? 'bg-stone-900/60 border-stone-700 text-stone-400'
                                  : 'bg-[#0d1015]/95 hover:bg-amber-500/15 border-amber-500/45 hover:border-amber-300 shadow-md'
                              }`}
                            >
                              <div className="text-xs font-bold text-amber-300">
                                • {t(opt.label, opt.labelEn || opt.label)}
                              </div>
                              <div className="text-[11px] font-mono text-emerald-300 mt-1.5">
                                ✦ {t(opt.effectSummary, opt.effectSummaryEn || opt.effectSummary)}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* РЕЖИМ 3: ДУШЕВНОЕ РАВНОВЕСИЕ ИМАМА, ФАКТОРЫ «ЗУЛЬМАТ» И ВЫГРУЗКА UE5 */}
      {(crisesSubTab === 'zulmat' || studioMode) && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          <div className="lg:col-span-7 hud-panel rounded-xl p-5 shadow-2xl space-y-4">
            <div className="border-b border-amber-500/25 pb-3 flex items-center gap-3">
              <PortraitMedallion
                src={findPortrait('Шамиль')}
                name="Имам Шамиль"
                color={leaderStressData.totalStress > 70 ? '#ef4444' : '#f59e0b'}
                size={44}
                selected
              />
              <div className="min-w-0">
                <h2 className="text-base font-bold font-serif text-amber-300 uppercase leading-snug">
                  {t(
                    'Бремя власти Имама и факторы недуга «Зульмат»',
                    'Burden of Command & Factors of “Zulmat” Strain'
                  )}
                </h2>
                <p className="text-xs text-stone-400 mt-0.5">
                  <RichText
                    text={t(
                      'Как натиск колонн, нехватка [[powder|пороха]] и гордыня [[naib|наибов]] вызывают [[zulmat|«Зульмат»]].',
                      'How column pressure, [[powder|powder]] shortages, and [[naib|naib]] pride trigger [[zulmat|“Zulmat”]].'
                    )}
                  />
                </p>
              </div>
            </div>

            <div className="bg-[#0e1116]/90 border border-amber-500/25 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-stone-300 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t('Порог перегрузки Дивана (70%)', 'Divan Overload Threshold (70%)')}</span>
                </span>
                <span className={`font-extrabold ${leaderStressData.totalStress > 70 ? 'text-rose-400' : 'text-amber-300'}`}>
                  {leaderStressData.totalStress}%
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-stone-800 overflow-hidden relative">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    leaderStressData.totalStress > 70
                      ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600'
                      : 'bg-gradient-to-r from-emerald-500 via-amber-400 to-amber-500'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(0, leaderStressData.totalStress))}%` }}
                />
              </div>
            </div>

            <div className="bg-[#0e1116]/95 border border-amber-500/25 rounded-xl p-3.5 space-y-2 text-xs font-mono">
              <div className="text-amber-300 font-bold uppercase">
                {t(
                  'Составляющие военной и духовной нагрузки Имама:',
                  'Military & Spiritual Strain Breakdown:'
                )}
              </div>
              <div className="flex justify-between text-stone-300">
                <span>
                  {t(
                    `Средний натиск войск Империи (${leaderStressData.avgPressure}% × 0.55):`,
                    `Avg. Imperial Corps Pressure (${leaderStressData.avgPressure}% × 0.55):`
                  )}
                </span>
                <span className="text-red-300 font-bold">+{Math.round(leaderStressData.avgPressure * 0.55)}%</span>
              </div>
              <div className="flex justify-between text-stone-300">
                <span>
                  {t(
                    `Округа с дефицитом пороха (${leaderStressData.lowPowderCount} × 7.5):`,
                    `Powder-starved districts (${leaderStressData.lowPowderCount} × 7.5):`
                  )}
                </span>
                <span className="text-red-300 font-bold">+{Math.round(leaderStressData.lowPowderCount * 7.5)}%</span>
              </div>
              <div className="flex justify-between text-stone-300">
                <span>
                  {t(
                    `Своенравные наибы (${leaderStressData.highPrideCount} × 8.0):`,
                    `Defiant high-pride Naibs (${leaderStressData.highPrideCount} × 8.0):`
                  )}
                </span>
                <span className="text-red-300 font-bold">+{leaderStressData.highPrideCount * 8}%</span>
              </div>
              <div className="flex justify-between text-stone-300">
                <span>
                  {t(
                    `Дипломатическая разрядка Порты (-${resources.ottomanSupport}% × 0.22):`,
                    `Sublime Porte diplomatic relief (-${resources.ottomanSupport}% × 0.22):`
                  )}
                </span>
                <span className="text-emerald-300 font-bold">-{Math.round(resources.ottomanSupport * 0.22)}%</span>
              </div>
              <div className="flex justify-between text-stone-300 border-b border-stone-800 pb-1.5">
                <span>
                  {t(
                    'Стабилизация от принятых Низамов Шамиля:',
                    'Stabilization from Enacted Nizam Laws:'
                  )}
                </span>
                <span className="text-emerald-300 font-bold">-{nizamModifiers.stressReduction}%</span>
              </div>
              <div className="flex justify-between font-bold text-sm pt-1">
                <span className="text-stone-100">
                  {t('ИТОГОВОЕ НАПРЯЖЕНИЕ ПРАВИТЕЛЯ:', 'TOTAL LEADER STRAIN:')}
                </span>
                <span className="text-amber-400">{leaderStressData.totalStress}%</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 hud-panel rounded-xl p-5 shadow-2xl space-y-3 border border-amber-500/35">
            <div className="border-b border-amber-500/25 pb-2.5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Swords className="w-4 h-4 text-amber-400 shrink-0" />
                <h2 className="text-sm font-bold font-serif text-amber-300 uppercase">
                  {t('Судьбы героев кампании', 'Campaign Hero Fates')}
                </h2>
              </div>
            </div>
            <div className="space-y-2">
              {characterFates.map((cf) => (
                <div
                  key={cf.id}
                  className="p-2.5 rounded-lg border bg-[#14110d] border-amber-500/25 flex items-start gap-2.5"
                >
                  <PortraitMedallion
                    src={findPortrait(cf.portraitKey)}
                    name={cf.nameRu}
                    color={cf.tone === 'emerald' ? '#10b981' : cf.tone === 'rose' ? '#f43f5e' : '#f59e0b'}
                    size={34}
                  />
                  <div className="min-w-0 flex-1 text-xs">
                    <div className="font-bold font-serif text-amber-100">{t(cf.nameRu, cf.nameEn)}</div>
                    <div className="text-[11px] text-stone-300 mt-0.5 leading-snug">
                      • {t(cf.statusRu, cf.statusEn)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {studioMode && (
              <>
                <div className="flex items-center justify-between gap-2 text-xs pt-2 border-t border-amber-500/20">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setUeExportFormat('json')}
                      className={`px-3 py-1.5 rounded-lg font-mono font-bold cursor-pointer transition ${
                        ueExportFormat === 'json'
                          ? 'bg-amber-500 text-stone-950'
                          : 'bg-[#171b22] text-stone-400 border border-stone-800'
                      }`}
                    >
                      UE5 JSON DataTable
                    </button>
                    <button
                      onClick={() => setUeExportFormat('cpp')}
                      className={`px-3 py-1.5 rounded-lg font-mono font-bold cursor-pointer transition ${
                        ueExportFormat === 'cpp'
                          ? 'bg-amber-500 text-stone-950'
                          : 'bg-[#171b22] text-stone-400 border border-stone-800'
                      }`}
                    >
                      C++ USTRUCT (.h)
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      copyTextSafe(
                        unrealEngineExportCode,
                        t(
                          'Слепок архитектуры скопирован в буфер обмена для Unreal Engine 5!',
                          'Architecture snapshot copied to clipboard for Unreal Engine 5!'
                        )
                      );
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold cursor-pointer transition"
                  >
                    {t('Копировать код', 'Copy Code')}
                  </button>
                </div>

                <pre className="bg-[#090b0e] border border-stone-800 rounded-xl p-3 text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-80 leading-relaxed">
                  {unrealEngineExportCode}
                </pre>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
