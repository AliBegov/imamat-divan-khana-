// Вкладка «ArchiveBallisticsTab» — Галерея исторических лиц XIX века и Лаборатория 18 газырей и горной баллистики
import { HISTORICAL_FIGURES_ARCHIVE } from '../../data/campaignData.js';
import { resolveMediaAsset } from '../../data/embeddedMediaAssets.js';
import { PortraitMedallion, TabHeroBanner, findPortrait } from '../hud/GameHUD.jsx';
import { HighlandEagleIcon, PowderFlaskIcon, UnicornCannonIcon } from '../hud/PeriodIcons.jsx';

export default function ArchiveBallisticsTab({
  activatedFigurePerks,
  ballisticsConfig,
  ballisticsSimData,
  copyTextSafe,
  handleActivateFigurePerk,
  selectedFigureId,
  selectedHistoricalFigure,
  setActiveTab,
  setBallisticsConfig,
  setSelectedFigureId,
  studioMode,
  t
}) {
  const halfGazyrs = Math.floor((ballisticsConfig.gazyrCount || 18) / 2);

  return (
    <div className="space-y-5">
      <TabHeroBanner
        artSrc="Armory_Bazalai_Dagger_Gazyr_Showcase_1845.jpg"
        portraitKey={selectedHistoricalFigure?.name || 'Хаджи-Мурат'}
        portraitName={t(
          selectedHistoricalFigure?.name || 'Герои и Полководцы Кавказской войны',
          selectedHistoricalFigure?.nameEn || selectedHistoricalFigure?.name || 'Heroes & Commanders of the Caucasian War'
        )}
        portraitTitle={t(
          'Портретная галерея XIX века • Лаборатория 18 газырей, шашки «Гурда» и горной баллистики',
          '19th-Century Portrait Gallery • 18-Gazyr Bandolier, “Gurda” Shashka & Mountain Ballistics Lab'
        )}
        portraitColor="#f59e0b"
        tag={t('ЛИЧНОСТИ ЭПОХИ И ОРУЖЕЙНАЯ БАЛЛИСТИКА • 1839–1859', 'HISTORICAL FIGURES & WEAPONS BALLISTICS • 1839–1859')}
        title={t(
          'Портретная Галерея Кавказской войны и Баллистика 18 Нагрудных Газырей',
          'Portrait Gallery of the Caucasian War & 18-Gazyr Bandolier Ballistics'
        )}
        desc={t(
          'Реалистичные портреты по прижизненным дагерротипам и акварелям Г. Г. Гагарина, уникальные способности соратников и противников Имамата, а также математический расчёт стрельбы из 18 нагрудных газырей.',
          'Photorealistic portraits after period daguerreotypes and Prince G. G. Gagarin’s watercolors, unique campaign traits of companions and adversaries, and mathematical ballistics of the 18-gazyr bandolier.'
        )}
        rightSlot={
          <div className="flex flex-wrap items-center gap-2 hud-num text-xs">
            <button
              onClick={() => setActiveTab('verdict')}
              className="px-3 py-1.5 rounded-lg bg-[#171b22] hover:bg-stone-800 border border-amber-500/40 text-amber-200 font-serif font-bold cursor-pointer transition"
            >
              {t('← К Сценариям и Суду', '← Back to Scenarios')}
            </button>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/85 border border-emerald-500/40 text-emerald-300 font-bold">
              <HighlandEagleIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t('Активно перков:', 'Active Perks:')} {activatedFigurePerks.length}/{HISTORICAL_FIGURES_ARCHIVE.length}</span>
            </span>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Левая колонка (7 из 12): Галерея исторических лиц, первоисточников и промптов для MetaHuman / Flux */}
        <div className="relative lg:col-span-7 hud-panel hud-walnut-bezel rounded-xl p-5 shadow-2xl space-y-4">
          <span className="hud-brass-corner tl" />
          <span className="hud-brass-corner tr" />
          <span className="hud-brass-corner bl" />
          <span className="hud-brass-corner br" />
          <div className="border-b border-stone-800 pb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-mono uppercase text-amber-400">
                {studioMode
                  ? t(
                      'Public Domain Архив XIX века → MetaHuman & Flux Pipeline',
                      '19th-Century Public Domain Archive → MetaHuman & Flux Pipeline'
                    )
                  : t(
                      'Портретная галерея Диван-ханы • Исторические свидетельства XIX века',
                      'Divan-Khana Portrait Gallery • 19th-Century Historical Records'
                    )}
              </span>
              <h2 className="text-base font-bold font-serif text-stone-100 uppercase mt-0.5">
                {studioMode
                  ? t(
                      'Исторические личности Кавказской войны: Перки и ИИ-Промпты',
                      'Historical Figures of the Caucasian War: Perks & AI Prompts'
                    )
                  : t(
                      'Личности Кавказской войны: Биографии и Способности в кампании',
                      'Figures of the Caucasian War: Biographies & Campaign Traits'
                    )}
              </h2>
            </div>
          </div>

          {/* Переключатель карточек персонажей с портретами */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {HISTORICAL_FIGURES_ARCHIVE.map((fig) => {
              const isSel = fig.id === selectedFigureId;
              const isActivePerk = activatedFigurePerks.includes(fig.id);
              const pSrc = fig.imageUrl || findPortrait(fig.name);
              return (
                <button
                  key={fig.id}
                  onClick={() => setSelectedFigureId(fig.id)}
                  className={`p-2.5 rounded-lg border text-left text-xs transition cursor-pointer flex items-center gap-2.5 ${
                    isSel
                      ? 'bg-amber-500/20 border-amber-500 text-stone-100 shadow-md'
                      : 'bg-[#171b22] border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700'
                  }`}
                >
                  <PortraitMedallion
                    src={pSrc}
                    name={fig.name}
                    color={isActivePerk ? '#10b981' : isSel ? '#f59e0b' : '#78716c'}
                    size={34}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="font-bold font-serif text-stone-100 truncate">
                      {t(fig.name, fig.nameEn || fig.name)}
                    </div>
                    <div className="text-[10px] font-mono text-amber-400 mt-0.5 truncate">
                      {isActivePerk
                        ? t('★ Перк активен', '★ Perk Active')
                        : t(fig.side, fig.sideEn || fig.side)}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Детальное досье выбранной исторической фигуры */}
          <div className="bg-[#171b22] border border-stone-800 rounded-xl p-4 space-y-3">
            {(selectedHistoricalFigure.imageUrl || findPortrait(selectedHistoricalFigure.name)) && (
              <div className="relative rounded-xl overflow-hidden border border-amber-500/40 bg-[#0b0e14] shadow-xl h-64 sm:h-72 flex items-center justify-center">
                <img
                  src={resolveMediaAsset(selectedHistoricalFigure.imageUrl || findPortrait(selectedHistoricalFigure.name))}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full object-cover object-center blur-xl opacity-35 scale-110 pointer-events-none"
                />
                <img
                  src={resolveMediaAsset(selectedHistoricalFigure.imageUrl || findPortrait(selectedHistoricalFigure.name))}
                  alt={t(selectedHistoricalFigure.name, selectedHistoricalFigure.nameEn || selectedHistoricalFigure.name)}
                  className="relative z-10 h-full w-auto max-w-full object-contain drop-shadow-2xl"
                  onError={(e) => {
                    e.currentTarget.parentElement.style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/85 via-transparent to-transparent flex items-end p-3 pointer-events-none">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber-300 bg-black/75 px-2.5 py-1 rounded border border-amber-500/30">
                    {t(
                      selectedHistoricalFigure.archivalSource,
                      selectedHistoricalFigure.archivalSourceEn || selectedHistoricalFigure.archivalSource
                    )}
                  </span>
                </div>
              </div>
            )}
            <div className="flex flex-wrap items-start justify-between gap-2 border-b border-stone-800 pb-2.5">
              <div>
                <span className="text-[10px] font-mono uppercase text-amber-400">
                  {t(
                    selectedHistoricalFigure.side,
                    selectedHistoricalFigure.sideEn || selectedHistoricalFigure.side
                  )}
                </span>
                <h3 className="text-lg font-bold font-serif text-stone-100">
                  {t(
                    selectedHistoricalFigure.name,
                    selectedHistoricalFigure.nameEn || selectedHistoricalFigure.name
                  )}
                </h3>
                <p className="text-xs text-stone-400">
                  {t(
                    selectedHistoricalFigure.role,
                    selectedHistoricalFigure.roleEn || selectedHistoricalFigure.role
                  )}
                </p>
              </div>
              <button
                onClick={() => handleActivateFigurePerk(selectedHistoricalFigure)}
                disabled={activatedFigurePerks.includes(selectedHistoricalFigure.id)}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold uppercase cursor-pointer transition ${
                  activatedFigurePerks.includes(selectedHistoricalFigure.id)
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                    : 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-md'
                }`}
              >
                {activatedFigurePerks.includes(selectedHistoricalFigure.id)
                  ? t('✓ Способность в игре', '✓ Trait Active in Campaign')
                  : t('Задействовать в кампании', 'Activate in Campaign')}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-[#0e1116] p-3 rounded-lg border border-stone-800">
                <span className="text-[10px] font-mono uppercase text-stone-400 block mb-1">
                  {t(
                    'Архивный первоисточник портрета (Public Domain):',
                    'Archival Portrait Primary Source (Public Domain):'
                  )}
                </span>
                <span className="text-stone-200 font-medium">
                  {t(
                    selectedHistoricalFigure.archivalSource,
                    selectedHistoricalFigure.archivalSourceEn ||
                      selectedHistoricalFigure.archivalSource
                  )}
                </span>
              </div>
              <div className="bg-[#0e1116] p-3 rounded-lg border border-stone-800">
                <span className="text-[10px] font-mono uppercase text-stone-400 block mb-1">
                  {t(
                    'Исторический облик и снаряжение:',
                    'Historical Appearance & Attire:'
                  )}
                </span>
                <span className="text-stone-200">
                  {t(
                    selectedHistoricalFigure.distinctiveFeatures,
                    selectedHistoricalFigure.distinctiveFeaturesEn ||
                      selectedHistoricalFigure.distinctiveFeatures
                  )}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-xs">
              <div className="font-bold text-emerald-300">
                {t('Игровая механика:', 'Gameplay Mechanic:')}{' '}
                {t(
                  selectedHistoricalFigure.perkTitle,
                  selectedHistoricalFigure.perkTitleEn || selectedHistoricalFigure.perkTitle
                )}
              </div>
              <div className="text-stone-300 text-[11px] mt-0.5">
                {t(
                  selectedHistoricalFigure.perkSummary,
                  selectedHistoricalFigure.perkSummaryEn || selectedHistoricalFigure.perkSummary
                )}
              </div>
            </div>

            {studioMode && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-amber-300 uppercase text-[11px]">
                    {t(
                      'Готовый Промпт для генерации 3D-концепта / кадра тизера (Midjourney v6 / Flux):',
                      'Ready-to-Use 3D Concept / Teaser Frame Prompt (Midjourney v6 / Flux):'
                    )}
                  </span>
                  <button
                    onClick={() =>
                      copyTextSafe(
                        selectedHistoricalFigure.aiPrompt,
                        t(
                          `Промпт для «${selectedHistoricalFigure.name}» скопирован в буфер обмена!`,
                          `Prompt for “${selectedHistoricalFigure.nameEn || selectedHistoricalFigure.name}” copied to clipboard!`
                        )
                      )
                    }
                    className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 font-mono text-[11px] cursor-pointer"
                  >
                    {t('Копировать промпт', 'Copy Prompt')}
                  </button>
                </div>
                <pre className="bg-[#090b0e] border border-stone-800 rounded-lg p-3 text-[11px] font-mono text-stone-300 whitespace-pre-wrap leading-relaxed">
                  {selectedHistoricalFigure.aiPrompt}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Правая колонка (5 из 12): Математическая лаборатория 18 Нагрудных Газырей и Горной Баллистики */}
        <div className="relative lg:col-span-5 hud-panel hud-walnut-bezel rounded-xl p-5 shadow-2xl space-y-4">
          <span className="hud-brass-corner tl" />
          <span className="hud-brass-corner tr" />
          <span className="hud-brass-corner bl" />
          <span className="hud-brass-corner br" />
          <div className="border-b border-amber-500/25 pb-3">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-serif uppercase text-amber-400 font-bold">
              <PowderFlaskIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {t(
                  'Тактическая математика материальной культуры XIX века',
                  '19th-Century Material Culture Tactical Mathematics'
                )}
              </span>
            </span>
            <h2 className="text-base font-bold font-serif text-amber-100 uppercase mt-0.5 flex items-center gap-1.5">
              <UnicornCannonIcon className="w-4 h-4 text-amber-300 shrink-0" />
              {t(
                'Калькулятор 18 Газырей и Горной Баллистики',
                '18-Gazyr Bandolier & Mountain Ballistics Calculator'
              )}
            </h2>
            <p className="text-xs text-stone-400 mt-1">
              {t(
                'Точный расчёт времени огневого боя сотни муртазеков до перехода в кинжальную рубку и углов возвышения артиллерии против скальных аулов',
                'Exact calculation of sustained fire duration for a Murtazek company before transitioning to dagger melee, plus artillery elevation angles against cliff auls'
              )}
            </p>
          </div>

          {/* Музейная витрина оружия (Шашка «Гурда», Кинжал «Кама» Базалая, Газыри и Пороховница) */}
          <div className="relative rounded-xl overflow-hidden border border-amber-500/40 bg-black shadow-lg h-36">
            <img
              src={resolveMediaAsset('Armory_Bazalai_Dagger_Gazyr_Showcase_1845.jpg')}
              alt="Caucasian Shashka Gurda, Kama Dagger Bazalai, Wooden Gazyrs & Horn Powder Flask"
              className="w-full h-full object-cover object-center opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent flex items-end justify-between p-3">
              <span className="text-[10.5px] font-mono text-amber-200 font-bold">
                🗡️ {t('Шашка «Гурда» без гарды • Кинжал «Кама» Базалая • Газыри с чернью', 'Guardless “Gurda” Shashka • “Bazalai” Kama Dagger • Nielloed Gazyrs')}
              </span>
            </div>
          </div>

          {/* Интерактивная визуализация нагрудных газырей на черкеске */}
          <div className="bg-[#0e1116] border border-amber-500/30 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between text-[10px] font-mono text-amber-300">
              <span>{t('НАГРУДНЫЕ ГАЗЫРНИЦЫ ЧЕРКЕСКИ (ЛЕВАЯ / ПРАВАЯ ГРУДЬ)', 'CHERKESSKA CHEST GAZYR POCKETS (LEFT / RIGHT)')}</span>
              <span>
                {halfGazyrs} + {halfGazyrs} = {ballisticsConfig.gazyrCount} {t('выстрелов', 'shots')}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-1">
              {[0, 1].map((side) => (
                <div
                  key={side}
                  className="bg-[#17130e] border border-stone-800 rounded-lg p-2 flex items-center justify-center gap-1"
                >
                  {Array.from({ length: halfGazyrs }).map((_, gIdx) => (
                    <div
                      key={gIdx}
                      className="flex flex-col items-center"
                      title={t(`Газырь #${side * halfGazyrs + gIdx + 1} (1.5 золотника пороха)`, `Gazyr #${side * halfGazyrs + gIdx + 1} (1.5 zolotniks powder)`)}
                    >
                      {/* Серебряный колпачок с чернью */}
                      <div className="w-2.5 h-3 rounded-t-full bg-gradient-to-b from-stone-200 via-stone-400 to-stone-600 border border-amber-300/60 shadow-sm" />
                      {/* Деревянная трубочка газыря в суконном гнезде */}
                      <div className="w-2.5 h-6 bg-gradient-to-b from-amber-900 to-stone-900 border-x border-b border-amber-700/50 rounded-b-sm" />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#171b22] border border-stone-800 rounded-xl p-4 space-y-3 text-xs">
            <div>
              <label className="block text-stone-300 mb-1">
                {t('Тип стрелкового оружия отряда:', 'Detachment Small Arms Type:')}
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  {
                    id: 'crimean_miquelet',
                    label: t('Дагестанская винтовка', 'Dagestani Miquelet Rifle')
                  },
                  {
                    id: 'brunswick_stutzer',
                    label: t('Штуцер Брунсвика', 'Brunswick Rifled Stutzer')
                  },
                  {
                    id: 'smooth_musket',
                    label: t('Пехотное ружьё', 'Smoothbore Musket')
                  }
                ].map((w) => (
                  <button
                    key={w.id}
                    onClick={() =>
                      setBallisticsConfig((prev) => ({ ...prev, weaponType: w.id }))
                    }
                    className={`p-2 rounded border text-[11px] font-semibold cursor-pointer transition ${
                      ballisticsConfig.weaponType === w.id
                        ? 'bg-amber-500 text-stone-950 border-amber-400 font-bold'
                        : 'bg-[#0e1116] text-stone-400 border-stone-800'
                    }`}
                  >
                    {w.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="flex justify-between text-stone-300 mb-1">
                <span>
                  {t(
                    'Серебряных газырей на черкеске воина:',
                    'Silver Gazyrs on Warrior’s Chokha:'
                  )}
                </span>
                <strong className="font-mono text-amber-300">
                  {ballisticsConfig.gazyrCount} {t('шт.', 'pcs')} (
                  {ballisticsSimData.powderPerSalvoSolotniks}{' '}
                  {t('зол. пороха', 'zol. powder')})
                </strong>
              </label>
              <input
                type="range"
                min="12"
                max="24"
                step="2"
                value={ballisticsConfig.gazyrCount}
                onChange={(e) =>
                  setBallisticsConfig((prev) => ({
                    ...prev,
                    gazyrCount: Number(e.target.value)
                  }))
                }
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div>
              <label className="flex justify-between text-stone-300 mb-1">
                <span>{t('Дистанция стрельбы в шагах:', 'Firing Range in Paces:')}</span>
                <strong className="font-mono text-sky-300">
                  {ballisticsConfig.distanceSteps} {t('шагов', 'paces')}
                </strong>
              </label>
              <input
                type="range"
                min="80"
                max="500"
                step="20"
                value={ballisticsConfig.distanceSteps}
                onChange={(e) =>
                  setBallisticsConfig((prev) => ({
                    ...prev,
                    distanceSteps: Number(e.target.value)
                  }))
                }
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="flex justify-between text-stone-300 mb-1">
                  <span>{t('Угол орудия:', 'Gun Elevation:')}</span>
                  <strong className="font-mono text-emerald-300">
                    {ballisticsConfig.elevationDeg}°
                  </strong>
                </label>
                <input
                  type="range"
                  min="10"
                  max="65"
                  step="5"
                  value={ballisticsConfig.elevationDeg}
                  onChange={(e) =>
                    setBallisticsConfig((prev) => ({
                      ...prev,
                      elevationDeg: Number(e.target.value)
                    }))
                  }
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>
              <div>
                <label className="flex justify-between text-stone-300 mb-1">
                  <span>{t('Крутизна скалы:', 'Cliff Slope:')}</span>
                  <strong className="font-mono text-red-300">
                    {ballisticsConfig.slopeDeg}°
                  </strong>
                </label>
                <input
                  type="range"
                  min="30"
                  max="85"
                  step="5"
                  value={ballisticsConfig.slopeDeg}
                  onChange={(e) =>
                    setBallisticsConfig((prev) => ({
                      ...prev,
                      slopeDeg: Number(e.target.value)
                    }))
                  }
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Вывод результатов баллистической модели */}
          <div className="bg-[#0e1116] border border-stone-800 rounded-xl p-4 space-y-2.5 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-stone-400">
                {t('Цикл заряжания с шомпола:', 'Ramrod Reload Cycle:')}
              </span>
              <span className="text-stone-100 font-bold">
                {ballisticsSimData.reloadSeconds} {t('сек.', 'sec.')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400">
                {t('Лимит непрерывного огня по газырям:', 'Sustained Gazyr Fire Limit:')}
              </span>
              <span className="text-amber-300 font-bold">
                {ballisticsSimData.sustainedFireMinutes}{' '}
                {t('мин. (далее — кинжал кама)', 'min. (then — Kama dagger)')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400">
                {t('Проверка мёртвой зоны скалы:', 'Cliff Dead-Zone Check:')}
              </span>
              <span
                className={`font-bold ${
                  ballisticsSimData.inDeadZone ? 'text-red-400' : 'text-emerald-400'
                }`}
              >
                {ballisticsSimData.inDeadZone
                  ? t(
                      `В МЁРТВОЙ ЗОНЕ (нужен угол >${ballisticsSimData.deadZoneThreshold}°)`,
                      `IN DEAD ZONE (needs >${ballisticsSimData.deadZoneThreshold}° angle)`
                    )
                  : t('Навес перекрывает гребень скалы', 'Trajectory clears cliff crest')}
              </span>
            </div>
            <div className="flex justify-between border-t border-stone-800 pt-2 text-sm">
              <span className="text-stone-200 font-bold">
                {t('Итоговая меткость залпа:', 'Effective Salvo Accuracy:')}
              </span>
              <span className="text-emerald-400 font-extrabold">
                {ballisticsSimData.hitAccuracy}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
