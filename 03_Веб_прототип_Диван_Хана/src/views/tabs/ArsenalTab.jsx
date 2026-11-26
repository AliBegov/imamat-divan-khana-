// Вкладка «ArsenalTab» — Литейный двор устаза Джабраила, Пороховые мельницы и Разведка против Кавказского корпуса
import { Hammer, Target, Flame, ShieldAlert } from 'lucide-react';
import { IMPERIAL_GENERALS } from '../../data/campaignData.js';
import { resolveMediaAsset } from '../../data/embeddedMediaAssets.js';
import { PortraitMedallion, TabHeroBanner, findPortrait } from '../hud/GameHUD.jsx';
import { ImperialEagleIcon, PowderFlaskIcon, ShashkaSabersIcon, UnicornCannonIcon } from '../hud/PeriodIcons.jsx';

export default function ArsenalTab({
  arsenalItems,
  handleCraftArsenalItem,
  handleDisruptImperialColumn,
  imperialAi,
  naibates,
  t
}) {
  const totalBatches = arsenalItems.reduce((acc, it) => acc + (it.completedCount || 0), 0);
  const activeGen = IMPERIAL_GENERALS[imperialAi.generalIdx];
  const targetN = naibates.find((n) => n.id === imperialAi.targetNaibateId);
  const targetNaibPortrait = targetN ? findPortrait(targetN.naibName, targetN.id) : null;
  const itemIcons = {
    vedeno_foundry: '💣',
    salpeter_barns: '🧨',
    silver_gazyrs: '🎖️',
    bazalai_daggers: '🗡️'
  };
  const itemPortraits = {
    vedeno_foundry: { key: 'Талгик', name: 'Мудир Талгик и Устаз Джабраил' },
    salpeter_barns: { key: 'Хаджи-Юсуф', name: 'Инженер Хаджи-Юсуф Сафаров' },
    silver_gazyrs: { key: 'Хаджи-Мурат', name: 'Гвардия Муртазеков (18 газырей)' },
    bazalai_daggers: { key: 'Байсунгур', name: 'Клинки Базалая и шашки «Гурда»' }
  };
  const unitPerkMap = {
    vedeno_foundry: {
      ru: '🎯 В строй на 3D-Стол: Батарея Талгика получает +1 медный единорог (💣 +6% к бою)',
      en: '🎯 3D Table Squadron Gear: Talkhig’s Battery gains +1 bronze unicorn (💣 +6% combat)'
    },
    salpeter_barns: {
      ru: '🎯 В строй на 3D-Стол: Сотня Байсунгура получает штуцерный порох (🧨 +3 газыря в бою, +4% к бою)',
      en: '🎯 3D Table Squadron Gear: Baysungur’s Rifles gain rifle powder (🧨 +3 gazyrs, +4% combat)'
    },
    silver_gazyrs: {
      ru: '🎯 В строй на 3D-Стол: Выбранная сотня получает андийские бурки (🧥 +25 ОХ марша, иммунитет к бурану)',
      en: '🎯 3D Table Squadron Gear: Selected squadron gains Andi burkas (🧥 +25 MP, blizzard immunity)'
    },
    bazalai_daggers: {
      ru: '🎯 В строй на 3D-Стол: Сотня Хаджи-Мурата получает шашки «Гурда» (🗡️ +45 сабель, +5% к бою)',
      en: '🎯 3D Table Squadron Gear: Hadji Murad’s Hundred gains Gurda blades (🗡️ +45 sabers, +5% combat)'
    }
  };
  const itemArtworks = {
    vedeno_foundry: {
      src: 'KeyArt_Vedeno_Foundry_and_PowderMill_1846.jpg',
      pos: '25% 50%',
      captionRu: 'Меднолитейные горны устаза Джабраила в Дарго-Ведено',
      captionEn: 'Ustaz Jabrail’s bronze cannon furnaces in Dargo-Vedeno'
    },
    salpeter_barns: {
      src: 'KeyArt_Vedeno_Foundry_and_PowderMill_1846.jpg',
      pos: '78% 55%',
      captionRu: 'Водяная пороховая мельница и селитряные варницы Гуниба и Ведено',
      captionEn: 'Water-powered powder mill & saltpetre vats of Gunib and Vedeno'
    },
    silver_gazyrs: {
      src: 'Armory_Bazalai_Dagger_Gazyr_Showcase_1845.jpg',
      pos: '70% 82%',
      captionRu: 'Деревянные газыри с серебряными колпачками (чернь Кубачи) и роговая пороховница',
      captionEn: 'Wooden gazyrs with Kubachi nielloed silver caps & horn powder flask'
    },
    bazalai_daggers: {
      src: 'Armory_Bazalai_Dagger_Gazyr_Showcase_1845.jpg',
      pos: '45% 38%',
      captionRu: 'Кавказская шашка «Гурда» без гарды и кинжал «Кама» булатной ковки Базалая',
      captionEn: 'Guardless Caucasian “Gurda” Shashka & double-fullered “Bazalai” Kama dagger'
    }
  };

  return (
    <div className="space-y-5">
      <TabHeroBanner
        artSrc="KeyArt_Vedeno_Foundry_and_PowderMill_1846.jpg"
        portraitKey="Хаджи-Юсуф Сафаров"
        portraitName={t('Инженер Хаджи-Юсуф Сафаров и Мудир Талгик', 'Engineer Hadji-Yusuf Safarov & Mudir Talkhig')}
        portraitTitle={t('Главный инженер укреплений и командующий артиллерией Имамата', 'Chief Fortifications Engineer & Commander of Imamate Artillery')}
        portraitColor="#10b981"
        tag={t('АРСЕНАЛ ДАРГО-ВЕДЕНО • ЛИТЕЙНЫЙ ДВОР И РАЗВЕДКА', 'DARGO-VEDENO ARSENAL • FOUNDRY & INTELLIGENCE')}
        title={t(
          'Литейный двор устаза Джабраила, Пороховые мельницы и Разведка ТВД',
          'Ustaz Jabrail’s Cannon Foundry, Powder Mills & Theatre Intelligence'
        )}
        desc={t(
          'Материальная база войны: отливка медных [[unicorn|горных единорогов]], выварка селитры для [[powder|пороха]], пошив черкесок на 18 [[gazyr|газырей]] для [[murtazek|муртазеков]] и диверсии против колонн [[cordon|кордонной линии]].',
          'Material foundation of war: casting bronze [[unicorn|mountain unicorns]], boiling saltpetre for [[powder|powder]], tailoring 18-[[gazyr|gazyr]] coats for [[murtazek|murtazeks]], and sabotaging columns from the [[cordon|cordon line]].'
        )}
        rightSlot={
          <div className="flex flex-wrap items-center gap-2 hud-num text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold">
              <UnicornCannonIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t('Выпущено партий:', 'Batches completed:')} {totalBatches}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/80 border border-rose-500/40 text-rose-300 font-bold">
              <ImperialEagleIcon className="w-3.5 h-3.5 text-rose-400" />
              <span>{imperialAi.columnStrength} {t('штыков на марше', 'bayonets marching')}</span>
            </span>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Левая колонка: Арсенал Ведено */}
        <div className="relative lg:col-span-7 hud-panel hud-walnut-bezel rounded-xl p-5 shadow-2xl space-y-4">
          <span className="hud-brass-corner tl" />
          <span className="hud-brass-corner tr" />
          <span className="hud-brass-corner bl" />
          <span className="hud-brass-corner br" />
          <div className="border-b border-amber-500/25 pb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-base sm:text-lg font-bold font-serif text-amber-300 uppercase flex items-center gap-2">
                <Hammer className="w-5 h-5 text-amber-400 shrink-0" />
                <span>
                  {t(
                    'Литейный двор устаза Джабраила и Пороховые мельницы Имамата',
                    'Ustaz Jabrail’s Foundry & Gunpowder Mills of the Imamate'
                  )}
                </span>
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                {t(
                  'Материальная база войны: отливка пушек в Ведено, выварка селитры в деревянных чанах, пошив черкесок с газырями и ковка кинжалов «Базалай»',
                  'Material foundation of war: casting bronze guns in Vedeno, boiling saltpeter in timber vats, tailoring 18-gazyr cherkesskas, and forging Bazalai daggers'
                )}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <PortraitMedallion src={findPortrait('Талгик')} name="Талгик" color="#38bdf8" size={34} />
              <PortraitMedallion src={findPortrait('Юсуф')} name="Хаджи-Юсуф" color="#10b981" size={34} />
            </div>
          </div>

          {/* Двойная музейная витрина: Литейный двор + Оружейная палата (Шашка «Гурда», Кинжал «Кама», 18 газырей) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative rounded-xl overflow-hidden border border-amber-500/40 bg-black shadow-lg h-32">
              <img
                src={resolveMediaAsset('KeyArt_Vedeno_Foundry_and_PowderMill_1846.jpg')}
                alt="Vedeno Artillery Foundry and Water-Powered Gunpowder Mill (1846)"
                className="w-full h-full object-cover object-center opacity-85"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent flex items-end p-2.5">
                <span className="text-[10.5px] font-mono text-amber-200 flex items-center gap-1.5 leading-snug">
                  <Flame className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                  <span>
                    {t(
                      'Пушечно-литейный двор устаза Джабраила и пороховая мельница в Ведено (1846 г.)',
                      'Ustaz Jabrail’s Bronze Cannon Foundry & Powder Mill in Vedeno (1846)'
                    )}
                  </span>
                </span>
              </div>
            </div>

            <div className="relative rounded-xl overflow-hidden border border-amber-500/40 bg-black shadow-lg h-32">
              <img
                src={resolveMediaAsset('Armory_Bazalai_Dagger_Gazyr_Showcase_1845.jpg')}
                alt="Guardless Caucasian Shashka Gurda, Kama Dagger Bazalai & 18 Gazyrs"
                className="w-full h-full object-cover object-center opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex items-end p-2.5">
                <span className="text-[10.5px] font-mono text-amber-200 leading-snug">
                  🗡️{' '}
                  {t(
                    'Эталон кавказского оружия: шашка «Гурда» без гарды, кинжал «Кама» Базалая и газыри',
                    'Caucasian Arms Standard: guardless “Gurda” Shashka, “Bazalai” Kama & gazyrs'
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {arsenalItems.map((item) => {
              const pInfo = itemPortraits[item.id] || { key: 'Шамиль', name: item.name };
              const artInfo = itemArtworks[item.id] || itemArtworks.vedeno_foundry;
              return (
                <div
                  key={item.id}
                  className="bg-gradient-to-b from-[#1e1812] to-[#130f0b] border border-amber-700/40 hover:border-amber-400/70 rounded-xl overflow-hidden flex flex-col justify-between transition shadow-lg group"
                >
                  <div>
                    {/* Визуальная иллюстрация каждого цеха Арсенала */}
                    <div className="relative h-28 w-full overflow-hidden bg-black border-b border-amber-500/30">
                      <img
                        src={resolveMediaAsset(artInfo.src)}
                        alt={t(item.name, item.nameEn || item.name)}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        style={{ objectPosition: artInfo.pos }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1c1610] via-black/30 to-black/20" />
                      <div className="absolute top-2 inset-x-2.5 flex items-center justify-between text-[10px] font-mono">
                        <span className="px-2 py-0.5 rounded bg-black/80 border border-amber-500/40 text-amber-300 uppercase font-bold truncate">
                          {itemIcons[item.id] || '⚒️'} {t(item.category, item.categoryEn || item.category)}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-emerald-950/90 text-emerald-300 border border-emerald-500/45 shrink-0 font-bold">
                          {t('Партий:', 'Batches:')} {item.completedCount}
                        </span>
                      </div>
                      <div className="absolute bottom-1.5 inset-x-2.5 text-[10px] font-mono text-amber-100/90 truncate">
                        {t(artInfo.captionRu, artInfo.captionEn)}
                      </div>
                    </div>

                    <div className="p-4 pb-2">
                      <div className="flex items-start gap-2.5">
                        <PortraitMedallion
                          src={findPortrait(pInfo.key)}
                          name={pInfo.name}
                          color="#f59e0b"
                          size={38}
                        />
                        <h3 className="text-sm font-bold font-serif text-amber-100 leading-snug">
                          {t(item.name, item.nameEn || item.name)}
                        </h3>
                      </div>
                      <p className="text-xs text-stone-300 mt-2 leading-relaxed">
                        {t(item.historicalSpec, item.historicalSpecEn || item.historicalSpec)}
                      </p>
                      <div className="mt-3 p-2.5 rounded-lg bg-[#0c0e12]/90 border border-amber-500/25 text-[11px] font-mono text-emerald-300 space-y-1">
                        <div>✦ {t(item.effectSummary, item.effectSummaryEn || item.effectSummary)}</div>
                        {unitPerkMap[item.id] && (
                          <div className="text-amber-200 font-sans font-semibold pt-1 border-t border-amber-500/15">
                            {t(unitPerkMap[item.id].ru, unitPerkMap[item.id].en)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="px-4 pb-4 pt-3 mt-2 border-t border-amber-500/20 flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-[11px] hud-num text-amber-200/90">
                      <PowderFlaskIcon className="w-3.5 h-3.5 text-amber-400" />
                      <span>
                        {t(
                          `Затраты: ${item.costSilver} руб. / ${item.costPowder} пуд.`,
                          `Cost: ${item.costSilver} rub. / ${item.costPowder} poods`
                        )}
                      </span>
                    </span>
                    <button
                      onClick={() => handleCraftArsenalItem(item)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-b from-amber-400 to-amber-600 hover:brightness-110 text-stone-950 font-serif font-bold text-xs cursor-pointer transition shadow"
                    >
                      <ShashkaSabersIcon className="w-3.5 h-3.5 text-stone-950" />
                      <span>{t('Снарядить партию', 'Commission Batch')}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Правая колонка: Досье генералов Отдельного Кавказского корпуса */}
        <div className="relative lg:col-span-5 hud-panel hud-walnut-bezel rounded-xl p-5 shadow-2xl space-y-4">
          <span className="hud-brass-corner tl" />
          <span className="hud-brass-corner tr" />
          <span className="hud-brass-corner bl" />
          <span className="hud-brass-corner br" />
          <div className="border-b border-amber-500/25 pb-3">
            <h2 className="text-base sm:text-lg font-bold font-serif text-rose-300 uppercase flex items-center gap-2">
              <Target className="w-5 h-5 text-rose-400 shrink-0" />
              <span>
                {t(
                  'Досье командующих Отдельным Кавказским корпусом',
                  'Dossiers of the Separate Caucasian Corps Commanders'
                )}
              </span>
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              {t(
                'Сводки лазутчиков о доктринах царских генералов и диверсии на линиях снабжения',
                'Scout intelligence on Imperial general doctrines and supply-line sabotage operations'
              )}
            </p>
          </div>

          <div className="bg-gradient-to-b from-[#261215] to-[#160b0d] border border-rose-500/50 rounded-xl overflow-hidden shadow-inner">
            <div className="relative h-44 w-full overflow-hidden bg-[#12080a] border-b border-rose-500/35 flex items-center justify-center">
              <img
                src={resolveMediaAsset(
                  imperialAi.generalIdx === 3
                    ? 'Portrait_Prince_Baryatinsky_1859.jpg'
                    : imperialAi.generalIdx === 2
                    ? 'Portrait_Vorontsov_1845.jpg'
                    : imperialAi.generalIdx === 1
                    ? 'Portrait_General_Freytag_1845.jpg'
                    : 'Portrait_General_Argutinsky_1847.jpg'
                )}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover object-center blur-xl opacity-35 scale-110 pointer-events-none"
              />
              <img
                src={resolveMediaAsset(
                  imperialAi.generalIdx === 3
                    ? 'Portrait_Prince_Baryatinsky_1859.jpg'
                    : imperialAi.generalIdx === 2
                    ? 'Portrait_Vorontsov_1845.jpg'
                    : imperialAi.generalIdx === 1
                    ? 'Portrait_General_Freytag_1845.jpg'
                    : 'Portrait_General_Argutinsky_1847.jpg'
                )}
                alt={t(activeGen.doctrineName, activeGen.doctrineNameEn || activeGen.doctrineName)}
                className="relative z-10 h-full w-auto max-w-full object-contain opacity-95 drop-shadow-2xl"
              />
              <div className="absolute inset-0 z-[15] bg-gradient-to-t from-[#261215] via-transparent to-black/35 pointer-events-none" />
              <div className="absolute top-2.5 inset-x-3 z-20 flex items-center justify-between text-xs font-mono">
                <span className="px-2 py-0.5 rounded bg-black/75 border border-rose-500/40 text-rose-300 font-bold uppercase flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  <span>{t('Текущая угроза на карте:', 'Active Map Threat:')}</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-950/90 border border-rose-400/60 text-rose-200 font-bold">
                  {t(
                    `Удар через ${imperialAi.turnsUntilStrike} ход(а)`,
                    `Strike in ${imperialAi.turnsUntilStrike} turn(s)`
                  )}
                </span>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <PortraitMedallion
                  src={findPortrait(activeGen.name)}
                  name={activeGen.name}
                  color="#f43f5e"
                  size={48}
                  selected
                />
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-bold font-serif text-stone-100 leading-snug">
                    {t(activeGen.name, activeGen.nameEn || activeGen.name)}
                  </h3>
                  <div className="text-xs text-amber-300 font-mono truncate">
                    {t(activeGen.doctrineName, activeGen.doctrineNameEn || activeGen.doctrineName)}
                  </div>
                </div>
              </div>

              <p className="text-xs text-stone-300 leading-relaxed">
                {t(activeGen.desc, activeGen.descEn || activeGen.desc)}
              </p>

              <div className="p-2.5 rounded-lg bg-[#0e1116]/90 border border-rose-500/30 text-xs font-mono flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 min-w-0">
                  {targetN && (
                    <PortraitMedallion src={targetNaibPortrait} name={targetN.naibName} color="#ef4444" size={26} />
                  )}
                  <span className="truncate">
                    {t('Направление удара:', 'Target Sector:')}{' '}
                    <strong className="text-amber-200">
                      {targetN ? t(targetN.name, targetN.nameEn || targetN.name) : ''}
                    </strong>
                  </span>
                </span>
                <span className="text-rose-300 font-bold shrink-0">
                  {imperialAi.columnStrength} {t('штыков', 'bayonets')}
                </span>
              </div>

              <button
                onClick={handleDisruptImperialColumn}
                className="w-full bg-gradient-to-b from-rose-500 to-rose-700 hover:brightness-110 text-stone-950 font-extrabold py-2 rounded-lg text-xs uppercase tracking-wider cursor-pointer transition shadow"
              >
                {t(
                  'Взорвать мосты и фураж на пути колонны (-18 пуд. пороха, -80 руб.)',
                  'Demolish Bridges & Forage Along Column Route (-18 poods powder, -80 rub.)'
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <div className="text-xs font-mono font-bold text-amber-300/90 uppercase">
              {t(
                'Все командующие корпусом (Смена доктрин ИИ):',
                'All Corps Commanders (AI Doctrine Rotation):'
              )}
            </div>
            {IMPERIAL_GENERALS.map((gen, idx) => {
              const active = idx === imperialAi.generalIdx;
              return (
                <div
                  key={gen.id}
                  className={`p-3 rounded-xl border text-xs transition ${
                    active
                      ? 'bg-gradient-to-r from-[#281417] to-[#181012] border-rose-500/60 text-stone-100 shadow'
                      : 'bg-[#15120e] border-stone-800 text-stone-400'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 font-bold font-serif text-stone-100 min-w-0">
                      <PortraitMedallion
                        src={findPortrait(gen.name)}
                        name={gen.name}
                        color={active ? '#f43f5e' : '#78716c'}
                        size={32}
                        dim={!active}
                      />
                      <span className="truncate">{t(gen.name, gen.nameEn || gen.name)}</span>
                    </span>
                    {active && (
                      <span className="px-2 py-0.5 rounded bg-rose-500/20 border border-rose-400/40 text-rose-300 font-mono text-[10px] font-bold shrink-0">
                        {t('КОМАНДУЕТ', 'ACTIVE')}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-amber-300/90 font-mono mt-1">
                    {t(gen.doctrineName, gen.doctrineNameEn || gen.doctrineName)}
                  </div>
                  {gen.doctrineModifiers && (
                    <div className="text-[10.5px] text-stone-400 font-mono mt-1">
                      {t(gen.doctrineModifiers.formulaRu, gen.doctrineModifiers.formulaEn)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
