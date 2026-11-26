// Окно «ModBuilderModal» — вынесено из App.jsx; все значения состояния и обработчики приходят через props
import { IMPERIAL_GENERALS } from '../../data/campaignData.js';

export default function ModBuilderModal({
  activeModNaibate,
  handleApplyCustomModScenario,
  handleApplyModPreset,
  handleExportCustomModJson,
  handleImportCustomModJson,
  handleUpdateModNaibate,
  modDraft,
  modImportJsonText,
  modSelectedNaibateId,
  setModDraft,
  setModImportJsonText,
  setModSelectedNaibateId,
  setShowModBuilderModal,
  t
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#131720] border border-orange-500/50 rounded-2xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-stone-800 flex flex-wrap items-center justify-between gap-2 bg-[#171c26]">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-orange-400 block">
                  Steam Workshop & UE5 DataTable Modding • Схема: DT_Naibates_1845.json
                </span>
                <h2 className="text-base sm:text-lg font-bold font-serif text-stone-100">
                  🛠️ {t('Конструктор исторических сценариев и модов (Mod Builder)', 'Custom Historical Scenario & Modding JSON Builder')}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleApplyCustomModScenario}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-mono text-xs font-bold cursor-pointer"
                >
                  ▶ {t('Применить сценарий в игру', 'Apply Scenario to Live Game')}
                </button>
                <button
                  onClick={handleExportCustomModJson}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 font-mono text-xs font-bold cursor-pointer"
                >
                  ⬇️ {t('Экспорт JSON', 'Export Mod JSON')}
                </button>
                <button
                  onClick={() => setShowModBuilderModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 font-mono text-xs font-bold cursor-pointer"
                >
                  {t('Закрыть ✕', 'Close ✕')}
                </button>
              </div>
            </div>

            <div className="p-4 overflow-y-auto space-y-4">
              {/* Быстрые исторические пресеты (4 эпохи) */}
              <div className="p-3 rounded-xl bg-stone-900/90 border border-stone-800 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-mono text-stone-300">
                  {t('4 эталонных пресета Steam Workshop:', '4 Reference Steam Workshop Presets:')}
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleApplyModPreset('akhulgo_1839')}
                    className="px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 border border-stone-700 text-sky-300 font-mono text-[11px] cursor-pointer"
                  >
                    🏔️ {t('1839: Ахульго (Ген. Граббе)', '1839: Akhulgo (Gen. Grabbe)')}
                  </button>
                  <button
                    onClick={() => handleApplyModPreset('golden_age_1843')}
                    className="px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 border border-stone-700 text-emerald-300 font-mono text-[11px] cursor-pointer"
                  >
                    ⚔️ {t('1843: Золотой век (Ген. Фрейтаг)', '1843: Golden Age (Gen. Freytag)')}
                  </button>
                  <button
                    onClick={() => handleApplyModPreset('historical_1845')}
                    className="px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 border border-stone-700 text-amber-300 font-mono text-[11px] cursor-pointer"
                  >
                    📜 {t('1845: Дарго (Кн. Воронцов)', '1845: Dargo (Prince Vorontsov)')}
                  </button>
                  <button
                    onClick={() => handleApplyModPreset('baryatinsky_1857')}
                    className="px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 border border-stone-700 text-rose-300 font-mono text-[11px] cursor-pointer"
                  >
                    🔥 {t('1857: Просеки (Кн. Барятинский)', '1857: Clearings (Prince Baryatinsky)')}
                  </button>
                </div>
              </div>

              {/* Метаданные сценария и стартовые ресурсы Байт-уль-Мала */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-5 p-3.5 rounded-xl bg-stone-900/90 border border-stone-800 space-y-3">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-orange-300">
                    {t('1. Параметры кампании и казны Байт аль-маль', '1. Campaign Metadata & Bayt al-Mal Treasury')}
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div>
                      <label className="text-stone-400 block mb-1">{t('Название сценария (RU / EN):', 'Scenario Title (RU / EN):')}</label>
                      <input
                        type="text"
                        value={modDraft.titleRu}
                        onChange={(e) => setModDraft((p) => ({ ...p, titleRu: e.target.value, titleEn: e.target.value }))}
                        className="w-full px-2.5 py-1.5 rounded bg-[#0c0f14] border border-stone-700 text-stone-200 font-mono text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-stone-400 block mb-1">{t('Хронологическая метка:', 'Epoch Label:')}</label>
                        <input
                          type="text"
                          value={modDraft.yearLabel}
                          onChange={(e) => setModDraft((p) => ({ ...p, yearLabel: e.target.value, yearLabelEn: e.target.value }))}
                          className="w-full px-2.5 py-1.5 rounded bg-[#0c0f14] border border-stone-700 text-amber-300 font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-stone-400 block mb-1">{t('Командующий РИ (4 доктрины):', 'Imperial Commander (4 Doctrines):')}</label>
                        <select
                          value={modDraft.generalIdx}
                          onChange={(e) => setModDraft((p) => ({ ...p, generalIdx: parseInt(e.target.value, 10) || 0 }))}
                          className="w-full px-2 py-1.5 rounded bg-[#0c0f14] border border-stone-700 text-stone-200 font-mono text-xs"
                        >
                          {IMPERIAL_GENERALS.map((gen, gIdx) => (
                            <option key={gen.id} value={gIdx}>
                              {t(gen.shortLabelRu, gen.shortLabelEn)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Ползунки стартовых ресурсов */}
                    {[
                      { key: 'gunpowder', labelRu: 'Арсенал Ведено: Порох (пудов)', labelEn: 'Vedeno Central Powder (Poods)', min: 30, max: 500, step: 5 },
                      { key: 'provisions', labelRu: 'Закрома террас: Зерно (мер)', labelEn: 'Terrace Provisions (Measures)', min: 200, max: 3000, step: 50 },
                      { key: 'silver', labelRu: 'Казна Байт аль-маль (руб. серебром)', labelEn: 'Bayt al-Mal Silver (Rubles)', min: 100, max: 2500, step: 25 },
                      { key: 'authority', labelRu: 'Авторитет Диван-ханы (%)', labelEn: 'Divan-Khana Authority (%)', min: 30, max: 100, step: 2 },
                      { key: 'ottomanSupport', labelRu: 'Дипломатия Стамбула (%)', labelEn: 'Sublime Porte Support (%)', min: 5, max: 100, step: 5 }
                    ].map((res) => (
                      <div key={res.key} className="pt-1">
                        <div className="flex justify-between text-[11px] font-mono">
                          <span className="text-stone-300">{t(res.labelRu, res.labelEn)}</span>
                          <span className="text-amber-300 font-bold">{modDraft.resources[res.key]}</span>
                        </div>
                        <input
                          type="range"
                          min={res.min}
                          max={res.max}
                          step={res.step}
                          value={modDraft.resources[res.key]}
                          onChange={(e) =>
                            setModDraft((p) => ({
                              ...p,
                              resources: {
                                ...p.resources,
                                [res.key]: parseInt(e.target.value, 10)
                              }
                            }))
                          }
                          className="w-full accent-orange-400 cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Редактор 10 наибств (DT_Naibates_1845) */}
                <div className="lg:col-span-7 p-3.5 rounded-xl bg-stone-900/90 border border-stone-800 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-xs font-mono uppercase tracking-wider text-emerald-300">
                      {t('2. Редактор 10 наибств (DT_Naibates_1845)', '2. 10 Naibates Inspector & Editor (DT_Naibates_1845)')}
                    </h3>
                    <select
                      value={modSelectedNaibateId}
                      onChange={(e) => setModSelectedNaibateId(e.target.value)}
                      className="px-2.5 py-1.5 rounded bg-[#0c0f14] border border-emerald-500/40 text-emerald-200 font-mono text-xs"
                    >
                      {modDraft.naibates.map((n) => (
                        <option key={n.id} value={n.id}>
                          {t(n.name, n.nameEn || n.name)} — {t(n.naibName, n.naibNameEn || n.naibName)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {activeModNaibate && (
                    <div className="space-y-3 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-stone-400 block mb-1">{t('Имя наиба (RU / EN):', 'Naib Commander Name:')}</label>
                          <input
                            type="text"
                            value={activeModNaibate.naibName}
                            onChange={(e) =>
                              handleUpdateModNaibate(activeModNaibate.id, {
                                naibName: e.target.value,
                                naibNameEn: e.target.value
                              })
                            }
                            className="w-full px-2.5 py-1.5 rounded bg-[#0c0f14] border border-stone-700 text-stone-200 font-mono text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-stone-400 block mb-1">
                            {t('Психология: Иман / Смелость / Гордыня', 'Psychology: Iman / Courage / Pride')}
                          </label>
                          <div className="grid grid-cols-3 gap-1.5">
                            {[
                              { k: 'iman', label: 'Iman' },
                              { k: 'courage', label: 'Courage' },
                              { k: 'pride', label: 'Pride' }
                            ].map((tr) => (
                              <div key={tr.k} className="bg-[#0c0f14] border border-stone-800 rounded px-2 py-1">
                                <span className="text-[10px] text-stone-400 block">{tr.label}: {activeModNaibate.traits[tr.k]}</span>
                                <input
                                  type="range"
                                  min="10"
                                  max="100"
                                  value={activeModNaibate.traits[tr.k]}
                                  onChange={(e) =>
                                    handleUpdateModNaibate(activeModNaibate.id, {
                                      traits: { [tr.k]: parseInt(e.target.value, 10) }
                                    })
                                  }
                                  className="w-full accent-amber-400 cursor-pointer"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        {[
                          { key: 'garrison', labelRu: 'Пеший гарнизон (штыков)', labelEn: 'Infantry Garrison', min: 300, max: 3500, step: 50 },
                          { key: 'murtazeks', labelRu: 'Конные муртазеки (сабель)', labelEn: 'Murtazek Cavalry (Sabres)', min: 100, max: 1500, step: 25 },
                          { key: 'gunpowder', labelRu: 'Пороховой погреб (пудов)', labelEn: 'Local Powder Stock (Poods)', min: 5, max: 180, step: 5 },
                          { key: 'provisions', labelRu: 'Провиант аула (мер)', labelEn: 'Local Provisions (Measures)', min: 100, max: 1200, step: 25 },
                          { key: 'terraceYield', labelRu: 'Урожайность террас (%)', labelEn: 'Terrace Yield (%)', min: 20, max: 100, step: 5 },
                          { key: 'imperialPressure', labelRu: 'Натиск войск РИ (%)', labelEn: 'Imperial Pressure (%)', min: 10, max: 96, step: 2 }
                        ].map((attr) => (
                          <div key={attr.key} className="p-2.5 rounded-lg bg-[#0c0f14] border border-stone-800">
                            <div className="flex justify-between text-[11px] font-mono mb-1">
                              <span className="text-stone-300">{t(attr.labelRu, attr.labelEn)}</span>
                              <span className="text-emerald-300 font-bold">{activeModNaibate[attr.key]}</span>
                            </div>
                            <input
                              type="range"
                              min={attr.min}
                              max={attr.max}
                              step={attr.step || 1}
                              value={activeModNaibate[attr.key]}
                              onChange={(e) =>
                                handleUpdateModNaibate(activeModNaibate.id, {
                                  [attr.key]: parseInt(e.target.value, 10)
                                })
                              }
                              className="w-full accent-emerald-400 cursor-pointer"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Импорт пользовательского JSON-мода */}
              <div className="p-3.5 rounded-xl bg-[#0c0f14] border border-stone-800 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-mono text-stone-300">
                    {t(
                      'Импорт стороннего JSON-мода (вставьте содержимое из 05_Steam_Release_and_Playtest_Kit/Workshop_Mods/ или DT_Naibates_1845.json):',
                      'Import Custom JSON Mod (paste payload from 05_Steam_Release_and_Playtest_Kit/Workshop_Mods/ or DT_Naibates_1845.json):'
                    )}
                  </span>
                  <button
                    onClick={handleImportCustomModJson}
                    className="px-3 py-1 rounded bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300 font-mono text-xs font-bold cursor-pointer"
                  >
                    📂 {t('Загрузить JSON в конструктор', 'Load JSON into Builder')}
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={modImportJsonText}
                  onChange={(e) => setModImportJsonText(e.target.value)}
                  placeholder='{"schemaVersion": "ImamatCustomScenarioMod_UE5_5_v1", "modId": "Mod_1839_Akhulgo_Siege", ...}'
                  className="w-full p-2.5 rounded-lg bg-[#07090c] border border-stone-800 text-emerald-300 font-mono text-[11px]"
                />
              </div>
            </div>
          </div>
        </div>
  );
}
