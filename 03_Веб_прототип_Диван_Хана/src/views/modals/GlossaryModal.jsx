// Окно «GlossaryModal» — вынесено из App.jsx; все значения состояния и обработчики приходят через props
import { IMAMAT_GLOSSARY_TERMS } from '../../data/campaignData.js';

export default function GlossaryModal({
  glossaryCategory,
  glossarySearch,
  setGlossaryCategory,
  setGlossarySearch,
  setShowGlossaryModal,
  t
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#131720] border border-amber-500/50 rounded-2xl max-w-4xl w-full max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-stone-800 flex flex-wrap items-center justify-between gap-2 bg-[#171c26]">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 block">
                  {t(
                    'Канцелярия Диван-ханы • Свод понятий, законов и воинского устава',
                    'Divan-Khana Chancellery • Compendium of Law, Economy & Mountain Warfare'
                  )}
                </span>
                <h2 className="text-base sm:text-lg font-bold font-serif text-stone-100">
                  {t(
                    '📖 Толковый словарь терминов и правил Имамата',
                    '📖 Historical Glossary & Game Mechanics of the Imamate'
                  )}
                </h2>
              </div>
              <button
                onClick={() => setShowGlossaryModal(false)}
                className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 font-mono text-xs font-bold cursor-pointer"
              >
                {t('Закрыть ✕', 'Close ✕')}
              </button>
            </div>

            <div className="p-3.5 border-b border-stone-800 bg-[#11141c] flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={glossarySearch}
                onChange={(e) => setGlossarySearch(e.target.value)}
                placeholder={t(
                  'Поиск по термину, механике или формуле (например: мухтасиб, газыри, камуфлет, зульмат)...',
                  'Search by term, mechanic, or formula (e.g., Muhtasib, Gazyrs, Camouflet, Zulmat)...'
                )}
                className="flex-1 min-w-[240px] bg-stone-900 border border-stone-700 rounded-lg px-3 py-1.5 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
              />
              {[
                { id: 'all', ru: 'Все категории', en: 'All Categories' },
                { id: 'Государство и Шариат', ru: 'Государство и Шариат', en: 'State & Sharia Law' },
                { id: 'Экономика и Логистика', ru: 'Экономика и Логистика', en: 'Economy & Logistics' },
                { id: 'Тактика и Баллистика', ru: 'Тактика и Баллистика', en: 'Tactics & Ballistics' },
                { id: 'Инженерия и Осады', ru: 'Инженерия и Осады', en: 'Engineering & Sieges' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setGlossaryCategory(cat.id)}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono transition cursor-pointer ${
                    glossaryCategory === cat.id
                      ? 'bg-amber-500 text-stone-950 font-bold'
                      : 'bg-stone-900 text-stone-400 border border-stone-800 hover:text-stone-200'
                  }`}
                >
                  {t(cat.ru, cat.en)}
                </button>
              ))}
            </div>

            <div className="p-4 overflow-y-auto space-y-3">
              {IMAMAT_GLOSSARY_TERMS.filter((item) => {
                const matchesCat = glossaryCategory === 'all' || item.category === glossaryCategory;
                const q = glossarySearch.trim().toLowerCase();
                const matchesSearch =
                  !q ||
                  item.termRu.toLowerCase().includes(q) ||
                  (item.termEn && item.termEn.toLowerCase().includes(q)) ||
                  item.historicalDesc.toLowerCase().includes(q) ||
                  (item.historicalDescEn && item.historicalDescEn.toLowerCase().includes(q)) ||
                  item.gameplayFormula.toLowerCase().includes(q) ||
                  (item.gameplayFormulaEn && item.gameplayFormulaEn.toLowerCase().includes(q));
                return matchesCat && matchesSearch;
              }).map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-stone-900/90 border border-stone-800 hover:border-amber-500/40 transition"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm font-bold font-serif text-amber-300">
                        {t(item.termRu, item.termEn || item.termRu)}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-stone-800 text-amber-200/90 font-serif text-xs">
                        {item.arabicScript}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-sky-500/15 border border-sky-500/30 text-sky-300 font-mono text-[10px]">
                      {t(item.category, item.categoryEn || item.category)}
                    </span>
                  </div>
                  <p className="text-xs text-stone-300 leading-relaxed mb-2">
                    <strong className="text-stone-100">{t('Исторический контекст:', 'Historical Context:')}</strong>{' '}
                    {t(item.historicalDesc, item.historicalDescEn || item.historicalDesc)}
                  </p>
                  <div className="p-2 rounded bg-[#0d1016] border border-emerald-500/30 font-mono text-[11px] text-emerald-300">
                    <span className="text-emerald-400 font-bold">
                      {t('Игровое правило и расчёт: ', 'Gameplay Rule & Formula: ')}
                    </span>
                    {t(item.gameplayFormula, item.gameplayFormulaEn || item.gameplayFormula)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
  );
}
