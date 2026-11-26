// Окно «MuseumCodexModal» — вынесено из App.jsx; все значения состояния и обработчики приходят через props
import { HISTORICAL_MUSEUM_EXHIBITS } from '../../data/appContent.js';
import { resolveMediaAsset } from '../../data/embeddedMediaAssets.js';
import { playHistoricalSound } from '../../game/audio.js';
import { ShamilOrderMedallion, ShamilOrdersMuseumShowcase } from '../shared/ShamilOrdersSvg.jsx';

export default function MuseumCodexModal({
  museumActiveGallery,
  museumSelectedExhibitId,
  setActiveTab,
  setMuseumActiveGallery,
  setMuseumSelectedExhibitId,
  setSelected3DTerrainId,
  setShowMuseumCodexModal,
  soundEnabled,
  t
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          {(() => {
            const galleryItems = HISTORICAL_MUSEUM_EXHIBITS.filter(
              (item) => item.gallery === museumActiveGallery
            );
            const activeExhibit =
              galleryItems.find((item) => item.id === museumSelectedExhibitId) ||
              galleryItems[0] ||
              HISTORICAL_MUSEUM_EXHIBITS[0];

            return (
              <div className="bg-[#11161f] border border-teal-500/50 rounded-2xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                <div className="p-4 border-b border-stone-800 flex flex-wrap items-center justify-between gap-2 bg-[#151c27]">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-teal-300 block">
                      {t(
                        'Историко-архивный музей Диван-ханы • 31 глава (2.23 МБ) • РГВИА / АКАК / BOA Стамбул',
                        'Divan-Khana Historical Archive Museum • 31 Chapters (2.23 MB) • RGVIA / AKAK / BOA Istanbul'
                      )}
                    </span>
                    <h2 className="text-base sm:text-lg font-bold font-serif text-stone-100">
                      🏛️ {t('Архив-Музей: Портреты, Булат Базалая, Серебряные Ордена и Топография Осад', 'Archive Museum: Portraits, Bazalai Steel, Silver Orders & Siege Topography')}
                    </h2>
                  </div>
                  <button
                    onClick={() => setShowMuseumCodexModal(false)}
                    className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 font-mono text-xs font-bold cursor-pointer"
                  >
                    {t('Закрыть ✕', 'Close ✕')}
                  </button>
                </div>

                {/* Навигация по 4 залам музея */}
                <div className="px-4 py-2.5 bg-[#0d1118] border-b border-stone-800 flex flex-wrap items-center gap-2">
                  {[
                    { id: 'portraits', labelRu: '🖼️ Зал 1: Портреты и Дагерротипы', labelEn: '🖼️ Hall 1: Portraits & Daguerreotypes' },
                    { id: 'armory_orders', labelRu: '⚔️ Зал 2: Оружейная палата и Ордена', labelEn: '⚔️ Hall 2: Armory, Blades & Silver Orders' },
                    { id: 'topographic_maps', labelRu: '🗺️ Зал 3: Военно-топографические планы осад', labelEn: '🗺️ Hall 3: Topographical Siege Maps' },
                    { id: 'primary_sources', labelRu: '📜 Зал 4: Арабские хроники и фонды архивов', labelEn: '📜 Hall 4: Primary Chronicles & Archival Fonds' }
                  ].map((hall) => (
                    <button
                      key={hall.id}
                      onClick={() => {
                        setMuseumActiveGallery(hall.id);
                        const firstInHall = HISTORICAL_MUSEUM_EXHIBITS.find((e) => e.gallery === hall.id);
                        if (firstInHall) setMuseumSelectedExhibitId(firstInHall.id);
                        playHistoricalSound('seal', soundEnabled);
                      }}
                      className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition cursor-pointer ${
                        museumActiveGallery === hall.id
                          ? 'bg-teal-500 text-stone-950 shadow-md'
                          : 'bg-stone-900 text-stone-300 hover:bg-stone-800 border border-stone-800'
                      }`}
                    >
                      {t(hall.labelRu, hall.labelEn)}
                    </button>
                  ))}
                </div>

                <div className="p-4 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-4">
                  {/* Список экспонатов выбранного зала (5 колонок) */}
                  <div className="lg:col-span-5 space-y-2.5 max-h-[68vh] overflow-y-auto pr-1">
                    {galleryItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setMuseumSelectedExhibitId(item.id);
                          playHistoricalSound('seal', soundEnabled);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                          activeExhibit.id === item.id
                            ? 'bg-teal-950/35 border-teal-400 shadow-lg'
                            : 'bg-stone-900/80 border-stone-800 hover:border-stone-700'
                        }`}
                      >
                        {item.id === 'ex_shamil_silver_orders' || item.imageUrl === 'Orders_Shamil_Kubachi_Showcase_1845.jpg' ? (
                          <ShamilOrderMedallion orderId="order_mudir" size={56} showVelvet className="rounded-lg!" />
                        ) : item.imageUrl ? (
                          <img
                            src={resolveMediaAsset(item.imageUrl)}
                            alt={item.titleEn}
                            className="w-14 h-14 rounded-lg object-cover object-top border border-amber-500/35 shrink-0 bg-black"
                          />
                        ) : null}
                        <div className="min-w-0 flex-1">
                          <div className="text-[10px] font-mono text-teal-300 mb-0.5 truncate">{item.archiveRef}</div>
                          <div className="text-xs font-serif font-bold text-stone-100 line-clamp-2">
                            {t(item.titleRu, item.titleEn)}
                          </div>
                          <div className="text-[11px] text-stone-400 mt-0.5 line-clamp-1">
                            {t(item.subtitleRu, item.subtitleEn)}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Детальная витрина экспоната с фотореалистичной иллюстрацией (7 колонок) */}
                  <div className="lg:col-span-7 bg-[#0b0e14] border border-stone-800 rounded-xl p-4 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="px-2.5 py-0.5 rounded bg-teal-500/15 border border-teal-500/40 text-teal-300 font-mono text-[10px] font-bold">
                          {activeExhibit.archiveRef}
                        </span>
                        <span className="font-mono text-[11px] text-amber-300 font-bold">
                          {activeExhibit.svgBadgeText}
                        </span>
                      </div>

                      <h3 className="text-base sm:text-lg font-serif font-bold text-amber-300">
                        {t(activeExhibit.titleRu, activeExhibit.titleEn)}
                      </h3>
                      <p className="text-xs font-mono text-stone-400">
                        {t(activeExhibit.subtitleRu, activeExhibit.subtitleEn)}
                      </p>

                      {/* Чистая HTML/SVG витрина 25 орденов Имамата или фотореалистичная витрина экспоната */}
                      {activeExhibit.id === 'ex_shamil_silver_orders' ||
                      activeExhibit.imageUrl === 'Orders_Shamil_Kubachi_Showcase_1845.jpg' ? (
                        <div className="relative rounded-xl overflow-hidden border-2 border-amber-500/45 bg-[#2e080c] shadow-2xl">
                          <ShamilOrdersMuseumShowcase interactive t={t} className="border-0 rounded-none" />
                          <div className="bg-gradient-to-r from-[#17120c] via-[#1f1810] to-[#17120c] border-t border-amber-500/35 px-3.5 py-2 flex flex-wrap items-center justify-between gap-2">
                            <span className="text-[11px] font-serif font-bold text-amber-200">
                              🏛️ {activeExhibit.svgBadgeText}
                            </span>
                            <span className="text-[10px] font-mono text-teal-300">
                              {t('Интерактивная HTML/SVG реконструкция • 25 подлинных знаков', 'Interactive HTML/SVG Reconstruction • 25 Authentic Insignia')}
                            </span>
                          </div>
                        </div>
                      ) : activeExhibit.imageUrl ? (
                        <div className="relative rounded-xl overflow-hidden border-2 border-amber-500/45 bg-[#07090e] shadow-2xl">
                          <img
                            src={resolveMediaAsset(activeExhibit.imageUrl)}
                            alt={activeExhibit.titleEn}
                            className={`w-full ${
                              activeExhibit.gallery === 'portraits' && !activeExhibit.imageUrl.startsWith('KeyArt_')
                                ? 'h-72 sm:h-80 object-contain bg-gradient-to-b from-[#14110e] via-[#0c0a08] to-[#07090e]'
                                : 'h-64 sm:h-72 object-cover object-center'
                            }`}
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          <div className="bg-gradient-to-r from-[#17120c] via-[#1f1810] to-[#17120c] border-t border-amber-500/35 px-3.5 py-2 flex flex-wrap items-center justify-between gap-2">
                            <span className="text-[11px] font-serif font-bold text-amber-200">
                              🏛️ {activeExhibit.svgBadgeText}
                            </span>
                            <span className="text-[10px] font-mono text-teal-300">
                              {t('Фондовая реконструкция 8K • Исторический архив Диван-ханы', '8K Archival Reconstruction • Divan-Khana Museum Collection')}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <svg viewBox="0 0 600 185" className="w-full h-auto rounded-lg border border-stone-800 bg-[#07090e]">
                          <rect x="0" y="0" width="600" height="185" fill="#080b12" />
                          <rect x="12" y="12" width="576" height="161" rx="8" fill="none" stroke={activeExhibit.accentColor} strokeOpacity="0.45" strokeWidth="1.5" />
                          <text x="300" y="95" textAnchor="middle" fill="#fcd34d" fontSize="14" fontFamily="serif" fontWeight="bold">
                            {activeExhibit.svgBadgeText}
                          </text>
                        </svg>
                      )}

                      <p className="text-xs text-stone-200 leading-relaxed">
                        {t(activeExhibit.descRu, activeExhibit.descEn)}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-stone-800 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[11px] font-mono text-stone-400">
                        📂 {t('Папка первоисточников: 01_Исторический_архив/', 'Source Directory: 01_Исторический_архив/')}
                      </span>
                      <button
                        onClick={() => {
                          if (activeExhibit.terrainId3D) {
                            setSelected3DTerrainId(activeExhibit.terrainId3D);
                          }
                          setActiveTab(activeExhibit.gameplayLinkTab || 'map');
                          setShowMuseumCodexModal(false);
                          playHistoricalSound('horn', soundEnabled);
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-stone-950 font-mono text-xs font-extrabold cursor-pointer transition"
                      >
                        🕹️ {t(activeExhibit.gameplayLinkLabelRu, activeExhibit.gameplayLinkLabelEn)}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
  );
}
