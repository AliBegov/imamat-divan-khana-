# 🦅 ПАСПОРТ ЗОЛОТОГО РЕЛИЗА «ИМАМАТ: ДИВАН-ХАНА» / MASTER RELEASE MANIFEST (MILESTONES M1–M20 • GOLD MASTER v2.0)

* **Кодовое имя и статус поставки:** `IMAMAT: DIVAN-KHANA — Gold Master Release v2.0 (Milestones M1–M20 Complete)`
* **Статус автоматического сертификата целостности:** `PASS (7/7)` ([Vertical_Slice_Integrity_Certificate.json](file:///Users/alibegov/Downloads/Кавказская%20война/05_Steam_Release_and_Playtest_Kit/Vertical_Slice_Integrity_Certificate.json))
* **Математическая верификация баланса:** `20 000 кампаний Монте-Карло` (`400 000` ходов: `4 000` базовых + `16 000` в матрице `4 стратегии × 4 ИИ-доктрины генералов`)
* **Целевые издатели и платформы:** *Hooded Horse*, *Slitherine*, *MicroProse*, *Paradox Arc* • **Steam (PC Windows DX12 SM6, macOS Metal SM6, Steam Deck Verified Input)**

---

## ⚡ 1. Быстрый старт в 1 клик (Для издателей, плейтестеров и инженеров)

### Вариант А: Мгновенный запуск без установки (Автономные HTML-пакеты)
1. **Издательский интерактивный питч-дек (13 слайдов RU/EN + ROI-калькулятор + воронка Steam Next Fest + матрица 20 000 партий):**
   * Откройте в любом браузере: [Imamat_Publisher_Pitch_Deck_Interactive.html](file:///Users/alibegov/Downloads/Кавказская%20война/05_Steam_Release_and_Playtest_Kit/Imamat_Publisher_Pitch_Deck_Interactive.html)
2. **Автономный однофайловый билд игры (Gold Master v2.0):**
   * Откройте двойным кликом: [Imamat_DivanKhana_Standalone_Playtest.html](file:///Users/alibegov/Downloads/Кавказская%20война/05_Steam_Release_and_Playtest_Kit/Imamat_DivanKhana_Standalone_Playtest.html)

### Вариант Б: Полный мастер-пайплайн CI/CD и Dev-сервер
```bash
# 1. Запуск 6-этапного релизного конвейера (20 000 симуляций, сборка Vite, VDF, моды, SRTM-акторы, 4K MRQ, 74 строки локализации и аудит PASS 7/7):
bash "04_UE5_ImamatWargame/Tools/build_and_verify_release.sh"

# 2. Запуск интерактивного веб-прототипа в режиме разработки (http://127.0.0.1:5173/):
cd "03_Веб_прототип_Диван_Хана" && npm run dev
```

---

## 🏆 2. Сводная матрица всех 20 закрытых майлстоунов (Milestones M1–M20)

| Майлстоун | Ключевая инженерно-продюсерская поставка | Главный артефакт верификации | Статус |
| :--- | :--- | :--- | :---: |
| **M1** | Выгрузка 60 шагов исследования, 30 тематических глав + сводная книга-энциклопедия (`2.23 МБ`) | [00_Полный_исторический_свод_Шамиль.md](file:///Users/alibegov/Downloads/Кавказская%20война/01_Исторический_архив/00_Полный_исторический_свод_Шамиль.md) | **PASS** |
| **M2** | Математическая модель повиновения наибов $P_{\text{exec}}$, безгексовая топография боя и 12 GDD документов | [04_Математические_модели_ордена_ландшафт_и_нагрузка.md](file:///Users/alibegov/Downloads/Кавказская%20война/02_Геймдизайн_и_концепт/04_Математические_модели_ордена_ландшафт_и_нагрузка.md) | **PASS** |
| **M3** | Расширение карты до 10 наибств (`DT_Naibates_1845.json`), плашка декомпозиции `FOrderProbabilityBreakdown` | [DT_Naibates_1845.json](file:///Users/alibegov/Downloads/Кавказская%20война/04_UE5_ImamatWargame/Content/DataTables/DT_Naibates_1845.json) | **PASS** |
| **M4** | Двусторонний мост `Стратегия ↔ Тактика` (`FTacticalBattleResult`), онбординг 3 ходов и Толковый словарь Имамата | [DT_ImamatGlossary.json](file:///Users/alibegov/Downloads/Кавказская%20война/04_UE5_ImamatWargame/Content/DataTables/DT_ImamatGlossary.json) | **PASS** |
| **M5** | Патронташ на 18 нагрудных газырей (`UGazyrAmmunitionComponent`), 3D-разрез скалы Милютина и пеленг медного таза Сафарова | [MF_MilyutinCutawaySection.hlsl](file:///Users/alibegov/Downloads/Кавказская%20война/04_UE5_ImamatWargame/Shaders/MF_MilyutinCutawaySection.hlsl) | **PASS** |
| **M6** | 4 эшелона пороховых караванов (`0/15/30/45` пуд.), 20 карт высот SRTM (`2017×2017` `.r16`/`.png`) и валидатор Монте-Карло | [UE5_Landscape_Import_Manifest.json](file:///Users/alibegov/Downloads/Кавказская%20война/04_UE5_ImamatWargame/Content/Heightmaps/UE5_Landscape_Import_Manifest.json) | **PASS** |
| **M7** | Полный проект Unreal Engine 5.5 (`ImamatWargame.uproject`), пешка `ADivanKhanaTablePawn` и сериализация `UImamatSaveGame` | [ImamatWargame.uproject](file:///Users/alibegov/Downloads/Кавказская%20война/04_UE5_ImamatWargame/ImamatWargame.uproject) | **PASS** |
| **M8** | Страница магазина Steam (RU/EN), матрица 20 тегов, телеметрия плейтеста и финансовый питч-дек (`\$240,000` бюджет) | [04_Publisher_Pitch_Deck_and_Budget_ROI.md](file:///Users/alibegov/Downloads/Кавказская%20война/05_Steam_Release_and_Playtest_Kit/04_Publisher_Pitch_Deck_and_Budget_ROI.md) | **PASS** |
| **M9** | 12 достижений Steamworks (`DT_SteamAchievements.json`), генератор `Steamworks_Partner_Config/*.vdf` и когортный KPI-отчёт (`PASS 5/5`) | [Playtest_Cohort_KPI_Report.json](file:///Users/alibegov/Downloads/Кавказская%20война/05_Steam_Release_and_Playtest_Kit/Playtest_Cohort_KPI_Report.json) | **PASS** |
| **M10** | Полная локализация ключевых систем `RU / EN` (`DT_ImamatLocalization_RU_EN.json`) и мастер-сертификат целостности (`PASS 7/7`) | [DT_ImamatLocalization_RU_EN.json](file:///Users/alibegov/Downloads/Кавказская%20война/04_UE5_ImamatWargame/Content/DataTables/DT_ImamatLocalization_RU_EN.json) | **PASS** |
| **M11** | 100% двуязычное покрытие всех 11 из 11 вкладок (`🌐 RU / EN`) и режим `▶ Авто-тур / Pitch Tour` для издателей | [src/App.jsx](file:///Users/alibegov/Downloads/Кавказская%20война/03_Веб_прототип_Диван_Хана/src/App.jsx) | **PASS** |
| **M12** | Пульт диегетического звука `WebAudio 2.0` (`🎛️ Звук 2.0`), Конструктор модов (`🛠️ Моддинг`) и интерактивный HTML Pitch Deck | [Imamat_Publisher_Pitch_Deck_Interactive.html](file:///Users/alibegov/Downloads/Кавказская%20война/05_Steam_Release_and_Playtest_Kit/Imamat_Publisher_Pitch_Deck_Interactive.html) | **PASS** |
| **M13** | Пост-кампанийный `📈 Хронограф / Replay` (SVG-график + экспорт AAR), 4 ИИ-доктрины генералов РИ и 3 мода `Workshop_Mods/*.json` | [generate_workshop_mods.py](file:///Users/alibegov/Downloads/Кавказская%20война/04_UE5_ImamatWargame/Tools/generate_workshop_mods.py) | **PASS** |
| **M14** | Матрица `20 000` кампаний Монте-Карло (`4×4 Doctrine Matrix`), `📘 Полевой устав Диван-ханы` и оверлей `🎯 Эталон МК` | [06_Tacticians_Field_Manual_RU_EN.md](file:///Users/alibegov/Downloads/Кавказская%20война/05_Steam_Release_and_Playtest_Kit/06_Tacticians_Field_Manual_RU_EN.md) | **PASS** |
| **M15** | 3 испытания Ironman (`1839 Ахульго`, `1845 Дарго`, `1857 Гуниб`) и экспорт именной Грамоты с восьмиугольной печатью Шамиля (`.html`) | [MonteCarlo_16000_DoctrineMatrix_Report.json](file:///Users/alibegov/Downloads/Кавказская%20война/04_UE5_ImamatWargame/Content/DataTables/MonteCarlo_16000_DoctrineMatrix_Report.json) | **PASS** |
| **M16** | Интерактивный превиз 60-сек трейлера Steam (`🎬 Трейлер`), манифест спавна 3D-акторов UE5.5 на рельефе SRTM и паспорт релиза | [UE5_Level_Actors_Spawn_Manifest.json](file:///Users/alibegov/Downloads/Кавказская%20война/04_UE5_ImamatWargame/Content/Heightmaps/UE5_Level_Actors_Spawn_Manifest.json) | **PASS** |
| **M17** | Авто-спавнер 44 акторов и 6 камер в `ue5_editor_auto_setup.py`, пакет пост-продакшна трейлера (`.srt`/`.edl`) и 4 зала `🏛️ Музей` (`11` экспонатов) | [generate_trailer_postprod_assets.py](file:///Users/alibegov/Downloads/Кавказская%20война/04_UE5_ImamatWargame/Tools/generate_trailer_postprod_assets.py) | **PASS** |
| **M18** | Пресет 4K-рендера `MRQ_ImamatTrailer_4K_Preset.json` (32x AA, EXR + ProRes 422 HQ), генератор `📰 Анонс Steam (.md)` и синхронизация релиза M1–M18 | [MRQ_ImamatTrailer_4K_Preset.json](file:///Users/alibegov/Downloads/Кавказская%20война/04_UE5_ImamatWargame/Config/MRQ_ImamatTrailer_4K_Preset.json) | **PASS** |
| **M19** | Симулятор дипломатии `📜 Депеши` (Стамбул BOA, Мичик 1855, Трапезунд), таблица `ST_ImamatMaster_RU_EN.csv` (`74` строки) и 13-й слайд `Steam Next Fest Funnel` | [ST_ImamatMaster_RU_EN.json](file:///Users/alibegov/Downloads/Кавказская%20война/04_UE5_ImamatWargame/Content/DataTables/ST_ImamatMaster_RU_EN.json) | **PASS** |
| **M20** | Единый командный центр релиза `🦅 Релиз v2.0` (`showReleaseHubModal`), гайд для стримеров и кураторов Steam (`07_Creator_and_Curator_Outreach_Kit_RU_EN.md`) и статус **Gold Master v2.0** | [07_Creator_and_Curator_Outreach_Kit_RU_EN.md](file:///Users/alibegov/Downloads/Кавказская%20война/05_Steam_Release_and_Playtest_Kit/07_Creator_and_Curator_Outreach_Kit_RU_EN.md) | **PASS** |

---

## 📊 3. Ключевые количественные показатели проекта (Due Diligence Metrics — Gold Master v2.0)

* **Объём исторического архива (`01_Исторический_архив/`):** `31` Markdown-файл (`2 229 008` байт верифицированного текста с шифрами РГВИА, АКАК и Османского архива BOA).
* **Объём проектной документации (`02_Геймдизайн_и_концепт/`):** `12` документов GDD и математических спецификаций (`195 865` байт).
* **Исходный код веб-прототипа (`03_Веб_прототип_Диван_Хана/src/App.jsx`):** `13 363` строки чистого `React 18` + `Tailwind CSS 4` кода (`11/11` двуязычных вкладок + `11` модальных инструментов, включая `🦅 Релиз v2.0`, `📜 Депеши`, `🏛️ Музей`, `🎬 Трейлер` и экспорт `📰 Анонс Steam .md`).
* **Инженерный пакет Unreal Engine 5.5 (`04_UE5_ImamatWargame/`):**
  * `17` исходных файлов C++20/CS + `2` шейдера HLSL/USH;
  * `15` таблиц `DataTables` / `StringTables` (`.json`/`.csv`, включая мастер-таблицу локализации [ST_ImamatMaster_RU_EN.csv](file:///Users/alibegov/Downloads/Кавказская%20война/04_UE5_ImamatWargame/Content/DataTables/ST_ImamatMaster_RU_EN.csv) на `74` строки);
  * `20` 16-битных файлов реального рельефа NASA SRTM (`2017×2017` `.r16` и `.png`) + координатный манифест спавна 3D-акторов и 48 точек сплайнов засад [UE5_Level_Actors_Spawn_Manifest.json](file:///Users/alibegov/Downloads/Кавказская%20война/04_UE5_ImamatWargame/Content/Heightmaps/UE5_Level_Actors_Spawn_Manifest.json) (`67 518` байт) + 4K пресет Movie Render Queue [MRQ_ImamatTrailer_4K_Preset.json](file:///Users/alibegov/Downloads/Кавказская%20война/04_UE5_ImamatWargame/Config/MRQ_ImamatTrailer_4K_Preset.json).
* **Пакет релиза в Steam и питчинга издателям (`05_Steam_Release_and_Playtest_Kit/`):**
  * `7` издательских, магазинных и стримерских документов (включая Полевой устав в стиле *MicroProse/Slitherine* и гайд для стримеров/кураторов Steam [07_Creator_and_Curator_Outreach_Kit_RU_EN.md](file:///Users/alibegov/Downloads/Кавказская%20война/05_Steam_Release_and_Playtest_Kit/07_Creator_and_Curator_Outreach_Kit_RU_EN.md));
  * `13`-слайдовая интерактивная презентация [Imamat_Publisher_Pitch_Deck_Interactive.html](file:///Users/alibegov/Downloads/Кавказская%20война/05_Steam_Release_and_Playtest_Kit/Imamat_Publisher_Pitch_Deck_Interactive.html) (с ROI-калькулятором и симулятором воронки вишлистов **Steam Next Fest**);
  * `4` файла пост-продакшна 60-секундного трейлера в [`Trailer_PostProduction/`](file:///Users/alibegov/Downloads/Кавказская%20война/05_Steam_Release_and_Playtest_Kit/Trailer_PostProduction) (`Imamat_Steam_Trailer_60s_RU.srt`, `Imamat_Steam_Trailer_60s_EN.srt`, `Imamat_Steam_Trailer_60s_CMX3600.edl`, `Imamat_Steam_Trailer_60s_Timeline.json`);
  * `3` эталонных исторических мода в `Workshop_Mods/`;
  * `3` конфигурационных манифеста в `Steamworks_Partner_Config/`;
  * Готовые релизные архивы [Imamat_DivanKhana_Web_Playtest_v1.0.zip](file:///Users/alibegov/Downloads/Кавказская%20война/05_Steam_Release_and_Playtest_Kit/Imamat_DivanKhana_Web_Playtest_v1.0.zip) и [Imamat_DivanKhana_Web_Playtest_v0.5.zip](file:///Users/alibegov/Downloads/Кавказская%20война/05_Steam_Release_and_Playtest_Kit/Imamat_DivanKhana_Web_Playtest_v0.5.zip).
