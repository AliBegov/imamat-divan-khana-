// Вкладка «ChronicleTab» — Походная летопись Мухаммед-Тахира аль-Карахи (CK3 / Old World Chronicle style)
import { BookOpen, Scroll } from 'lucide-react';
import { PortraitMedallion, TabHeroBanner, findPortrait } from '../hud/GameHUD.jsx';
import { CompassRoseIcon, ShashkaSabersIcon, WaxSealIcon } from '../hud/PeriodIcons.jsx';

const CATEGORY_STYLE = {
  envoy: { Icon: CompassRoseIcon, ru: 'Гонец и Наибы', en: 'Envoy & Naibs', color: '#fbbf24' },
  nizam: { Icon: WaxSealIcon, ru: 'Низам и Суд', en: 'Nizam & Court', color: '#10b981' },
  battle: { Icon: ShashkaSabersIcon, ru: 'Поле боя', en: 'Battlefield', color: '#ef4444' },
  diplomacy: { Icon: CompassRoseIcon, ru: 'Стамбул', en: 'Sublime Porte', color: '#38bdf8' }
};

export default function ChronicleTab({
  battleMemorials = [],
  chronicleFilter,
  filteredChronicle,
  onFocusMemorialOnMap,
  setChronicleFilter,
  t
}) {
  return (
    <div className="space-y-5">
      <TabHeroBanner
        artSrc="Archive_Arabic_Chronicle_AlQarakhi_1845.jpg"
        portraitKey="Согратл"
        portraitName={t('Мухаммед-Тахир аль-Карахи', 'Muhammad-Tahir al-Qarakhi')}
        portraitTitle={t('Секретарь Диван-ханы и летописец Имама Шамиля', 'Secretary of the Divan-Khana & Chronicler of Imam Shamil')}
        portraitColor="#f59e0b"
        tag={t('КАНЦЕЛЯРИЯ ИМАМАТА • ПОХОДНАЯ ЛЕТОПИСЬ', 'IMAMATE CHANCELLERY • CAMPAIGN CHRONICLE')}
        title={t(
          '«Блеск дагестанских шашек в некоторых шамилевских битвах»',
          '“The Shining of Dagestani Sabers in Certain Battles of Shamil”'
        )}
        desc={t(
          'Подлинная хроника донесений [[naib|наибов]], указов [[divan|Диван-ханы]], утверждённых [[nizam|низамов]], сражений у [[cordon|кордонной линии]] и тайных посольств к [[porte|Блистательной Порте]].',
          'Authentic chronicle of [[naib|naib]] dispatches, [[divan|Divan-Khana]] decrees, enacted [[nizam|nizams]], battles along the [[cordon|cordon line]], and secret embassies to the [[porte|Sublime Porte]].'
        )}
        rightSlot={
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-950/80 border border-amber-500/40 text-amber-300 hud-num text-xs font-bold">
            <WaxSealIcon className="w-3.5 h-3.5 text-amber-400" />
            <span>{t('Записей в свитке:', 'Chronicle entries:')} {filteredChronicle.length}</span>
          </span>
        }
      />

      {battleMemorials.length > 0 && (
        <div className="relative hud-panel hud-walnut-bezel rounded-xl p-4 shadow-2xl space-y-3">
          <span className="hud-brass-corner tl" />
          <span className="hud-brass-corner tr" />
          <span className="hud-brass-corner bl" />
          <span className="hud-brass-corner br" />
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/25 pb-2">
            <div className="flex items-center gap-2">
              <ShashkaSabersIcon className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-xs sm:text-sm font-serif font-bold text-amber-300 uppercase">
                {t(
                  `Памятные поля сражений и разгромленные колонны (${battleMemorials.length})`,
                  `Memorial Battlefields & Routed Columns (${battleMemorials.length})`
                )}
              </span>
            </div>
            <span className="text-[11px] font-mono text-emerald-300">
              {t('Все знаки славы нанесены на 3D-Стол Кавказа', 'All victory markers are engraved on the 3D Caucasus Table')}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {battleMemorials.slice(0, 6).map((mem) => (
              <div
                key={mem.id}
                className="bg-gradient-to-b from-[#201912] to-[#130f0b] border border-amber-500/40 rounded-lg p-3 flex flex-col justify-between gap-2"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-1 text-[10px] hud-num">
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-400/50 text-amber-200 font-bold">
                      ⚔️ {t('Ход', 'Turn')} #{mem.turn} • {t(mem.seasonRu, mem.seasonEn)}
                    </span>
                    <span className="text-rose-300 font-bold">-{mem.enemyLoss} {t('шт. РИ', 'bay.')}</span>
                  </div>
                  <div className="text-xs font-serif font-extrabold text-amber-100">
                    {t(mem.titleRu, mem.titleEn)}
                  </div>
                  <div className="text-[11px] text-stone-300 truncate">
                    {t(mem.commanderRu, mem.commanderEn)}
                  </div>
                  <div className="text-[10.5px] font-mono text-emerald-300">
                    {t(mem.spoilsRu, mem.spoilsEn)}
                  </div>
                </div>
                {onFocusMemorialOnMap && (
                  <button
                    onClick={() => onFocusMemorialOnMap(mem)}
                    className="w-full px-2.5 py-1 rounded bg-amber-500/15 hover:bg-amber-500/30 border border-amber-400/55 text-amber-200 font-serif font-bold text-[10.5px] cursor-pointer transition"
                  >
                    🗺️ {t('Показать рубеж на 3D-Столе', 'Locate Battlefield on 3D Table')}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="relative hud-panel hud-walnut-bezel rounded-xl p-4 sm:p-5 shadow-2xl space-y-4">
        <span className="hud-brass-corner tl" />
        <span className="hud-brass-corner tr" />
        <span className="hud-brass-corner bl" />
        <span className="hud-brass-corner br" />
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/25 pb-3.5">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-xs sm:text-sm font-serif font-bold text-amber-300 uppercase">
              {t('Архивные свитки по рубрикам', 'Archival Scrolls by Category')}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {[
              { id: 'all', label: t('Все записи', 'All Entries') },
              { id: 'envoy', label: t('Гонцы и Наибы', 'Envoys & Naibs') },
              { id: 'nizam', label: t('Низамы и Арсенал', 'Nizams & Arsenal') },
              { id: 'battle', label: t('Бои и Разведка', 'Battles & Recon') },
              { id: 'diplomacy', label: t('Стамбул', 'Sublime Porte') }
            ].map((flt) => (
              <button
                key={flt.id}
                onClick={() => setChronicleFilter(flt.id)}
                className={`px-3 py-1.5 rounded-lg font-serif font-semibold cursor-pointer transition ${
                  chronicleFilter === flt.id
                    ? 'bg-gradient-to-b from-amber-400 to-amber-600 text-stone-950 font-bold shadow'
                    : 'bg-[#17130e] text-stone-300 hover:text-amber-200 border border-amber-700/35'
                }`}
              >
                {flt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
          {filteredChronicle.map((item) => {
            const cat = CATEGORY_STYLE[item.category] || { Icon: WaxSealIcon, ru: 'Летопись', en: 'Chronicle', color: '#d97706' };
            const CatIcon = cat.Icon || WaxSealIcon;
            const pSrc = findPortrait(item.sender, item.title) || findPortrait('Шамиль');
            return (
              <div
                key={item.id}
                className="bg-gradient-to-b from-[#1e1812] to-[#130f0b] border border-amber-700/40 hover:border-amber-400/60 rounded-xl p-4 flex items-start gap-3.5 transition"
              >
                <PortraitMedallion src={pSrc} name={item.sender} color={cat.color} size={42} />
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] hud-num">
                    <span className="text-amber-300 font-bold flex items-center gap-1.5">
                      <CatIcon className="w-3.5 h-3.5 shrink-0" color={cat.color} />
                      <span>{t(item.sender, item.senderEn || item.sender)}</span>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/35 text-amber-200 font-bold">
                      {t('Ход', 'Turn')} #{item.turn}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold font-serif text-amber-100 flex items-center gap-1.5">
                    <Scroll className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{t(item.title, item.titleEn || item.title)}</span>
                  </h4>
                  <p className="text-xs text-stone-300 leading-relaxed">
                    {t(item.text, item.textEn || item.text)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
