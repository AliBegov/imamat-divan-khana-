// Вкладка «Tactical3DTab» — вынесено из App.jsx; все значения состояния и обработчики приходят через props
import { TACTICAL_3D_TERRAINS } from '../../data/campaignData.js';
import GorgeCutaway3DViewport from './GorgeCutaway3DViewport.jsx';
import {
  MountainPeakIcon,
  PowderFlaskIcon,
  UnicornCannonIcon
} from '../hud/PeriodIcons.jsx';

export default function Tactical3DTab({
  active3DTerrain,
  cam3D,
  canvas3DRef,
  handleCanvasPointerDown,
  handleCanvasPointerMove,
  handleCanvasPointerUp,
  handleLaunch3DProjectile,
  handleTacticalAction,
  mortarAngle3D,
  selected3DTerrainId,
  setActiveTab,
  setCam3D,
  setMortarAngle3D,
  setSelected3DTerrainId,
  setUnicornAngle3D,
  siegeState,
  soundEnabled = true,
  stats3D,
  t,
  unicornAngle3D
}) {
  return (
    <div className="space-y-3.5">
            {/* Верхняя панель выбора 3D-полигона NASA SRTM и ракурсов камеры */}
            <div className="hud-walnut-bezel bg-gradient-to-r from-[#15120e] via-[#1a1612] to-[#121620] border border-amber-500/45 rounded-xl p-3.5 shadow-2xl flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-serif uppercase tracking-wider text-amber-300 font-bold">
                  <MountainPeakIcon className="w-3.5 h-3.5 text-amber-300" />
                  <span>
                    {t(
                      '3D-Панорама Горного Ущелья • Инженерный профиль Д. А. Милютина',
                      '3D Mountain Gorge Panorama • Col. D. A. Milyutin Geodesic Cutaway'
                    )}
                  </span>
                </span>
                <h2 className="text-base font-bold font-serif text-stone-100 uppercase mt-0.5">
                  {t(active3DTerrain.title, active3DTerrain.titleEn || active3DTerrain.title)} (
                  <span className="hud-num text-amber-200">
                    {t(
                      active3DTerrain.elevationMeters,
                      active3DTerrain.elevationMetersEn || active3DTerrain.elevationMeters
                    )}
                  </span>
                  )
                </h2>
                <p className="text-xs text-stone-400">
                  {t(active3DTerrain.subtitle, active3DTerrain.subtitleEn || active3DTerrain.subtitle)}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <button
                  onClick={() => setActiveTab('siege')}
                  className="px-3 py-1.5 rounded-lg font-bold cursor-pointer transition bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-500/45 mr-1"
                >
                  {t('← К Полю Боя (Аул и Засада)', '← Back to Battlefield (Aul & Ambush)')}
                </button>
                {TACTICAL_3D_TERRAINS.map((ter) => (
                  <button
                    key={ter.id}
                    onClick={() => setSelected3DTerrainId(ter.id)}
                    className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition ${
                      selected3DTerrainId === ter.id
                        ? 'bg-amber-500 text-stone-950 shadow-md'
                        : 'bg-[#171411] text-stone-300 border border-stone-800 hover:border-amber-500/40'
                    }`}
                  >
                    {t(ter.title, ter.titleEn || ter.title).split(' (')[0]}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Левая колонка (8 из 12): Интерактивное 3D-окно рельефа и разреза скалы */}
              <div className="lg:col-span-8 hud-walnut-bezel bg-[#14110e] border border-amber-500/35 rounded-xl p-3.5 shadow-2xl space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      onClick={() =>
                        setCam3D((prev) => ({
                          ...prev,
                          yaw: -0.54,
                          pitch: 0.44,
                          zoom: 1.16,
                          cutawayRatio: 0.78,
                          autoRotate: false
                        }))
                      }
                      className="px-2.5 py-1 rounded bg-[#1a1612] hover:bg-stone-800 border border-stone-700 text-stone-200 cursor-pointer"
                    >
                      {t('Перспектива 3D', '3D Perspective')}
                    </button>
                    <button
                      onClick={() =>
                        setCam3D((prev) => ({
                          ...prev,
                          yaw: 0.0,
                          pitch: 0.18,
                          zoom: 1.18,
                          cutawayRatio: 0.55,
                          autoRotate: false
                        }))
                      }
                      className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold cursor-pointer"
                    >
                      {t('Профиль-Разрез Милютина (0°)', 'Milyutin Cutaway Profile (0°)')}
                    </button>
                    <button
                      onClick={() =>
                        setCam3D((prev) => ({
                          ...prev,
                          yaw: -1.57,
                          pitch: 0.25,
                          zoom: 1.12,
                          autoRotate: false
                        }))
                      }
                      className="px-2.5 py-1 rounded bg-[#1a1612] hover:bg-stone-800 border border-stone-700 text-stone-200 cursor-pointer"
                    >
                      {t('Вид от русских батарей', 'Imperial Battery View')}
                    </button>
                    <button
                      onClick={() =>
                        setCam3D((prev) => ({
                          ...prev,
                          yaw: 0.0,
                          pitch: 1.25,
                          zoom: 0.98,
                          autoRotate: false
                        }))
                      }
                      className="px-2.5 py-1 rounded bg-[#1a1612] hover:bg-stone-800 border border-stone-700 text-stone-200 cursor-pointer"
                    >
                      {t('Топо-план сверху (90°)', 'Top-Down Plan (90°)')}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setCam3D((prev) => ({ ...prev, autoRotate: !prev.autoRotate }))
                      }
                      className={`px-2.5 py-1 rounded font-mono text-[11px] cursor-pointer ${
                        cam3D.autoRotate
                          ? 'bg-emerald-500 text-stone-950 font-bold'
                          : 'bg-[#1a1612] text-stone-400 border border-stone-800'
                      }`}
                    >
                      {cam3D.autoRotate
                        ? t('Авто-облёт: ВКЛ', 'Auto-Orbit: ON')
                        : t('Авто-облёт', 'Auto-Orbit')}
                    </button>
                  </div>
                </div>

                {/* Интерактивный 3D-холст с поддержкой мыши, колёсика зума и сенсорного экрана */}
                <div className="relative rounded-xl overflow-hidden border border-amber-500/45 bg-[#0a1220] shadow-2xl">
                  <span className="hud-brass-corner tl" />
                  <span className="hud-brass-corner tr" />
                  <span className="hud-brass-corner bl" />
                  <span className="hud-brass-corner br" />
                  <GorgeCutaway3DViewport
                    cam3D={cam3D}
                    setCam3D={setCam3D}
                    selected3DTerrainId={selected3DTerrainId || active3DTerrain?.id || 'salty_1847'}
                    deadZoneAngleDeg={active3DTerrain?.deadZoneAngleDeg || 28}
                    mortarAngle3D={mortarAngle3D}
                    unicornAngle3D={unicornAngle3D}
                    siegeState={siegeState}
                    soundEnabled={soundEnabled}
                    stats3D={stats3D}
                    t={t}
                    fallbackCanvasRef={canvas3DRef}
                    onPointerDownFallback={handleCanvasPointerDown}
                    onPointerMoveFallback={handleCanvasPointerMove}
                    onPointerUpFallback={handleCanvasPointerUp}
                  />

                  {/* Наложенный поверх 3D-сцены индикатор сейсмического медного таза Хаджи-Юсуфа */}
                  <div className="absolute top-3 left-3 bg-[#120f0c]/90 border border-amber-500/45 rounded-lg px-3 py-2 text-[11px] max-w-xs pointer-events-none shadow-lg">
                    <div className="text-amber-300 font-serif font-bold">
                      {t('МЕДНЫЙ ТАЗ ХАДЖИ-ЮСУФА (СЕЙСМОСКОП):', 'HAJJI YUSUF’S COPPER BASIN (SEISMOSCOPE):')}
                    </div>
                    <div className="text-stone-300 mt-0.5">
                      {t('Дистанция русской сапы:', 'Russian Sap Distance:')}{' '}
                      <strong className="hud-num text-red-300">
                        {siegeState.russianMineDistance} {t('саж.', 'sazhens')}
                      </strong>
                    </div>
                    <div className="text-emerald-300 hud-num">
                      {t(
                        `Накаты блиндажей: ${siegeState.blindageLayers} слоя дубовых брёвен`,
                        `Blindage Roof: ${siegeState.blindageLayers} oak log layers`
                      )}
                    </div>
                  </div>

                  <div className="absolute bottom-3 right-3 bg-[#120f0c]/88 border border-amber-500/35 rounded px-2.5 py-1 text-[10px] font-serif text-amber-100/90 pointer-events-none">
                    {t(
                      'Зажмите ЛКМ / палец для вращения 3D-ущелья',
                      'Drag LMB / Touch to orbit 3D gorge'
                    )}
                  </div>
                </div>

                {/* Ползунки геодезического ножа Милютина (Cutaway) и масштаба камеры */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#0f0c0a] border border-stone-800 rounded-xl p-3 text-xs">
                  <div>
                    <label className="flex justify-between text-stone-300 mb-1">
                      <span>{t('Геодезический срез скалы:', 'Cliff Geodesic Cutaway:')}</span>
                      <strong className="hud-num text-amber-300">
                        {Math.round(cam3D.cutawayRatio * 100)}%
                      </strong>
                    </label>
                    <input
                      type="range"
                      min="0.25"
                      max="1.0"
                      step="0.05"
                      value={cam3D.cutawayRatio}
                      onChange={(e) =>
                        setCam3D((prev) => ({
                          ...prev,
                          cutawayRatio: Number(e.target.value)
                        }))
                      }
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="flex justify-between text-stone-300 mb-1">
                      <span>{t('Приближение камеры (Zoom):', 'Camera Zoom:')}</span>
                      <strong className="hud-num text-sky-300">
                        ×{cam3D.zoom.toFixed(2)}
                      </strong>
                    </label>
                    <input
                      type="range"
                      min="0.7"
                      max="1.65"
                      step="0.05"
                      value={cam3D.zoom}
                      onChange={(e) =>
                        setCam3D((prev) => ({
                          ...prev,
                          zoom: Number(e.target.value)
                        }))
                      }
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-3 sm:pt-0">
                    <label className="flex items-center gap-1.5 cursor-pointer text-stone-300">
                      <input
                        type="checkbox"
                        checked={cam3D.showDeadZoneCone}
                        onChange={(e) =>
                          setCam3D((prev) => ({
                            ...prev,
                            showDeadZoneCone: e.target.checked
                          }))
                        }
                        className="accent-amber-500"
                      />
                      <span>{t('Конус мёртвой зоны', 'Dead-Zone Cone')}</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer text-stone-300">
                      <input
                        type="checkbox"
                        checked={cam3D.showWireframeContours}
                        onChange={(e) =>
                          setCam3D((prev) => ({
                            ...prev,
                            showWireframeContours: e.target.checked
                          }))
                        }
                        className="accent-amber-500"
                      />
                      <span>{t('Сетка SRTM', 'SRTM Mesh')}</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Правая колонка (4 из 12): Пульт 3D-баллистики и подземной минной войны */}
              <div className="lg:col-span-4 hud-walnut-bezel bg-[#14110e] border border-amber-500/35 rounded-xl p-3.5 shadow-2xl space-y-3.5">
                <div className="border-b border-amber-500/20 pb-2.5">
                  <span className="inline-flex items-center gap-1.5 text-[10.5px] font-serif uppercase text-amber-300 font-bold">
                    <UnicornCannonIcon className="w-3.5 h-3.5 text-amber-300" />
                    <span>{t('Артиллерийская наводка и контрминные горны', 'Artillery Aiming & Subterranean Counter-Mines')}</span>
                  </span>
                  <h3 className="text-sm font-bold font-serif text-stone-100 uppercase mt-0.5">
                    {t('Осадные батареи vs Блиндажи и Камуфлеты', 'Siege Batteries vs. Blindages & Camouflets')}
                  </h3>
                </div>

                {/* Регуляторы углов возвышения мортир и единорогов */}
                <div className="bg-[#0f0c0a] border border-stone-800 rounded-xl p-3 space-y-3 text-xs">
                  <div>
                    <label className="flex justify-between text-stone-300 mb-1">
                      <span>{t('Угол пудовой мортиры (Навес):', 'Pood Mortar Angle (Plunging):')}</span>
                      <strong className="hud-num text-amber-300">{mortarAngle3D}°</strong>
                    </label>
                    <input
                      type="range"
                      min="42"
                      max="72"
                      step="2"
                      value={mortarAngle3D}
                      onChange={(e) => setMortarAngle3D(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="flex justify-between text-stone-300 mb-1">
                      <span>{t('Угол горного единорога (Настил):', 'Mountain Unicorn Angle (Flat):')}</span>
                      <strong className="hud-num text-red-300">
                        {unicornAngle3D}° ({t('порог скалы:', 'cliff threshold:')} {active3DTerrain.deadZoneAngleDeg}°)
                      </strong>
                    </label>
                    <input
                      type="range"
                      min="6"
                      max="34"
                      step="2"
                      value={unicornAngle3D}
                      onChange={(e) => setUnicornAngle3D(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Кнопки пуска 3D-снарядов и подрыва подземного камуфлета */}
                <div className="space-y-2 text-xs">
                  <button
                    onClick={() => handleLaunch3DProjectile('mortar_3d')}
                    className="w-full text-left p-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/50 cursor-pointer transition"
                  >
                    <div className="font-bold text-amber-300">
                      {t(
                        `1. Выстрел пудовой мортиры в 3D (${mortarAngle3D}°)`,
                        `1. Fire Pood Mortar in 3D (${mortarAngle3D}°)`
                      )}
                    </div>
                    <div className="text-[11px] text-stone-300 mt-0.5">
                      {t(
                        'Высокая навесная парабола через гребень скалы по бревенчатым накатам блиндажей',
                        'High plunging parabola over the cliff crest onto timber blindage roofs'
                      )}
                    </div>
                  </button>

                  <button
                    onClick={() => handleLaunch3DProjectile('unicorn_3d')}
                    className="w-full text-left p-3 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/40 cursor-pointer transition"
                  >
                    <div className="font-bold text-red-300">
                      {t(
                        `2. Настильный выстрел единорога (${unicornAngle3D}°)`,
                        `2. Fire Flat-Trajectory Unicorn (${unicornAngle3D}°)`
                      )}
                    </div>
                    <div className="text-[11px] text-stone-300 mt-0.5">
                      {t(
                        'Удар в известняковый обрыв (верхние сакли в мёртвой зоне)',
                        'Impact against the limestone precipice (upper saklyas in dead zone)'
                      )}
                    </div>
                  </button>

                  <button
                    onClick={() => handleLaunch3DProjectile('camouflet_3d')}
                    className="w-full text-left p-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 cursor-pointer transition"
                  >
                    <div className="font-bold text-emerald-300 inline-flex items-center gap-1.5">
                      <PowderFlaskIcon className="w-3.5 h-3.5 text-emerald-300" />
                      <span>
                        {t(
                          '3. Взорвать подземный камуфлет в разрезе скалы',
                          '3. Detonate Subterranean Camouflet in Cliff Cutaway'
                        )}
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-300 mt-0.5">
                      {t(
                        'По сигналу медного таза подорвать пороховой горн и отбросить русскую сапу назад',
                        'Guided by the copper basin, detonate a powder chamber to collapse the Russian sap'
                      )}
                    </div>
                  </button>

                  <button
                    onClick={() => handleTacticalAction('repair_blindage')}
                    className="w-full text-left p-2.5 rounded-xl bg-[#0f0c0a] hover:bg-stone-800 border border-stone-700 cursor-pointer transition"
                  >
                    <div className="font-bold text-sky-300">
                      {t(
                        '4. Нарастить дубовый накат блиндажа (до 4 слоёв)',
                        '4. Reinforce Oak Blindage Roof (up to 4 layers)'
                      )}
                    </div>
                  </button>
                </div>

                {/* Телеметрия 3D-испытаний */}
                <div className="bg-[#0f0c0a] border border-stone-800 rounded-xl p-3 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-stone-400">{t('Попаданий мортир по накатам:', 'Mortar Hits on Blindages:')}</span>
                    <span className="hud-num text-amber-300 font-bold">{stats3D.mortarHits}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">{t('Перехвачено скалой (Мёртвая зона):', 'Blocked by Cliff (Dead Zone):')}</span>
                    <span className="hud-num text-red-300 font-bold">{stats3D.deadZoneBlocked}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">{t('Подорвано подземных камуфлетов:', 'Subterranean Camouflets Detonated:')}</span>
                    <span className="hud-num text-emerald-300 font-bold">{stats3D.camoufletsDetonated}</span>
                  </div>
                  <div className="text-[11px] text-stone-200 border-t border-stone-800 pt-2 leading-relaxed">
                    {stats3D.lastShotReport}
                  </div>
                </div>
              </div>
            </div>
          </div>
  );
}
