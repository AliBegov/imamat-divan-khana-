# ИМАМАТ: ДИВАН-ХАНА (THE IMAMAT: DIVAN-KHANA) — Издательский Press Kit, Executive One-Pager и шаблоны писем (Cold Outreach RU / EN)

Документ подготовлен для быстрой отправки скаутам и директорам по развитию бизнеса (**Business Development / Scouting**) профильных стратегических издательств (**Hooded Horse**, **Slitherine**, **MicroProse**, **Paradox Arc**), а также профильной прессе и кураторам фестивалей (Steam Next Fest, TactiCon, TurnBasedThursdayFest).

---

## 1. Паспорт проекта (Fact Sheet / Executive Summary)

| Параметр | Значение (RU) | Value (EN) |
| :--- | :--- | :--- |
| **Название проекта** | **ИМАМАТ: ДИВАН-ХАНА (1845)** | **THE IMAMAT: DIVAN-KHANA (1845)** |
| **Жанр** | Асимметричная историческая гранд-стратегия + 3D тактический осадный варгейм без гексов | Asymmetric Historical Grand Strategy + Gridless 3D Tactical Siege Wargame |
| **Игровые ориентиры (Comps)** | *Manor Lords* × *King of Dragon Pass / Suzerain* × *Total War: Pharaoh* | *Manor Lords* × *King of Dragon Pass / Suzerain* × *Total War: Pharaoh* |
| **Целевой движок и стек** | Unreal Engine 5.5 (`C++20`, `Lumen`, `Nanite`, `16-bit SRTM`, `HLSL`) + Playable Web Vertical Slice (`React 18 / Vite 6`) | Unreal Engine 5.5 (`C++20`, `Lumen`, `Nanite`, `16-bit SRTM`, `HLSL`) + Playable Web Vertical Slice (`React 18 / Vite 6`) |
| **Платформы** | PC (Steam: Windows 10/11 DX12 SM6 & macOS Apple Silicon Metal SM6), Steam Deck Verified | PC (Steam: Windows 10/11 DX12 SM6 & macOS Apple Silicon Metal SM6), Steam Deck Verified |
| **Языки на старте** | Русский, Английский (встроенный переключатель `🌐 RU / EN`), далее — Турецкий, Немецкий, Китайский (Упр.) | English, Russian (live `🌐 RU / EN` toggle), Post-Launch: Turkish, German, Simplified Chinese |
| **Ценовая категория (SRP)** | `$24.99` USD (Региональный паритет: СНГ `$11.99`, Турция/MENA `$12.49`, ЕС `€24.50`) | `$24.99` USD (Regional pricing: CIS `$11.99`, MENA/TR `$12.49`, EU `€24.50`) |
| **Производственный бюджет** | `$240,000` (12 месяцев Full Production до релиза 1.0, точка безубыточности — `23,188` копий) | `$240,000` (12 months Full Production to 1.0 Launch; Break-Even at `23,188` units) |
| **Статус готовности** | **Milestones M1–M8 Ready:** играбельный двуязычный билд (`466 КБ`), C++20 ядро UE5.5, 20 карт высот SRTM, отчёт Монте-Карло (`4,000` кампаний) и когортный KPI-отчёт (`PASS` 5/5) | **Milestones M1–M8 Ready:** Playable bilingual build (`466 KB`), UE5.5 C++20 core, 20 SRTM heightmaps, 4,000-run Monte Carlo validation & Cohort KPI report (`PASS` 5/5) |

---

## 2. Elevator Pitch (Формулировки для питча на 10, 30 и 60 секунд)

### Одно предложение (Logline — 10 сек)
* **RU:** Пошаговая историческая гранд-стратегия и безсеточный 3D-варгейм, где вы управляете горным государством Имама Шамиля через живых наибов со свободой воли, пороховые караваны и подземную минную войну.
* **EN:** An asymmetric historical grand strategy and gridless 3D siege wargame where you rule Imam Shamil’s mountain state through autonomous Naib governors, black-powder logistics, and subterranean counter-mine warfare.

### Абзац для питча (Short Pitch — 30 сек)
* **RU:** В **«ИМАМАТ: ДИВАН-ХАНА»** у игрока нет «всевидящего курсора». За дубовым столом в ставке Дарго-Ведено вы судите по Кодексу Низамов между Шариатом и горским Адатом, распределяете пуды дефицитной селитры и отправляете конных гонцов через заснеженные перевалы. Подчинится ли гордый наиб вашему приказу — решает прозрачная математическая формула `FOrderProbabilityBreakdown` (Иман и Смелость против Алчности, Гордыни и Стресса). А когда осада доходит до штурма Салты или Гергебиля, стол растворяется в реальном 16-битном рельефе Кавказа (NASA SRTM): вы считаете 18 нагрудных газырей в черкеске каждого мюрида и взрываете русские сапы подземными камуфлетами по звуку медного таза инженера Хаджи-Юсуфа Сафарова.
* **EN:** In **THE IMAMAT: DIVAN-KHANA**, you do not have an omniscient RTS cursor. Seated at Imam Shamil’s oak command table in Dargo-Vedeno, you adjudicate between Sharia Nizam reforms and ancient clan Adat, ration scarce poods of saltpeter, and dispatch mounted couriers across snowbound Caucasus passes. Whether a proud Naib obeys or rebels is governed by a transparent mathematical formula (`FOrderProbabilityBreakdown`: Iman and Courage vs. Greed, Pride, and Strain). When Imperial columns besiege Salty or Gergebil, the command table transitions into real 16-bit NASA SRTM terrain—where you track every fighter’s 18 chest gazyrs and detonate subterranean camouflet mines using Hajji Yusuf Safarov’s acoustic copper basin.

---

## 3. Доказанная математика и верифицированные KPI (De-Risked Production Metrics)

Проект выделяется среди инди-стратегий тем, что его баланс и технический пайплайн верифицированы до старта Full Production:

1. **Математическая валидация баланса (4 000 кампаний × 20 ходов в [`MonteCarlo_1000x20_Report.json`](file:///Users/alibegov/Downloads/Кавказская%20война/04_UE5_ImamatWargame/Content/DataTables/MonteCarlo_1000x20_Report.json)):**
   * Доказано, что без принятия селитренного Низама Хаджи-Юсуфа и отправки мухтасибов арсенал Ведено истощается к 8-му ходу (выживаемость падает с `99.9%` до `55.6%`, а частота восстаний «Зульмат» вырастает в 22 раза — с `0.07` до `1.54` за партию).
2. **Когортная телеметрия плейтеста (25 сессий, 511 отправленных гонцов, 85 тактических боёв в [`Playtest_Cohort_KPI_Report.json`](file:///Users/alibegov/Downloads/Кавказская%20война/05_Steam_Release_and_Playtest_Kit/Playtest_Cohort_KPI_Report.json)):**
   * **Onboarding 3-Step Completion:** `88.0%` (целевой порог $\ge 82\%$) — **PASS**.
   * **Turn-10 Campaign Survival Rate:** `76.0%` (целевой коридор $55\%\text{--}85\%$) — **PASS**.
   * **Heavy Convoy (`30p`/`45p`) Usage Share:** `47.0%` (целевой коридор $40\%\text{--}65\%$) — **PASS**.
   * **Average Zulmat Revolts per Session:** `1.16` (целевой коридор $0.50\text{--}1.50$) — **PASS**.
   * **Gazyr Depletion (`0/18`) Melee Transition Rate:** `55.3%` (целевой порог $\ge 50\%$) — **PASS**.
3. **Готовый инженерный фундамент Unreal Engine 5.5 ([`04_UE5_ImamatWargame/`](file:///Users/alibegov/Downloads/Кавказская%20война/04_UE5_ImamatWargame)):**
   * 11 сериализованных таблиц `DataTables` (`.json`/`.csv`), 20 карт высот и сплат-масок SRTM (`2017x2017` `.r16`/`.png`), HLSL-шейдер геодезического разреза скалы [`MF_MilyutinCutawaySection.hlsl`](file:///Users/alibegov/Downloads/Кавказская%20война/04_UE5_ImamatWargame/Shaders/MF_MilyutinCutawaySection.hlsl) и скрипт авто-сборки [`Tools/ue5_editor_auto_setup.py`](file:///Users/alibegov/Downloads/Кавказская%20война/04_UE5_ImamatWargame/Tools/ue5_editor_auto_setup.py).

---

## 4. Готовые шаблоны писем для издателей (Cold Outreach Email Templates)

### 4.1. Шаблон письма на английском языке (для Hooded Horse / Slitherine / MicroProse / Paradox Arc)

**Subject:** Pitch & Playable Vertical Slice: THE IMAMAT: DIVAN-KHANA — Asymmetric Grand Strategy & 3D Siege Wargame (UE5.5)

> Dear **[Name / Scouting Team at Hooded Horse / Slitherine / MicroProse]**,
>
> I am reaching out as the Project Lead of **THE IMAMAT: DIVAN-KHANA (1845)** — an asymmetric historical grand strategy and gridless 3D siege wargame set during the 19th-century Caucasus War, built on Unreal Engine 5.5 and backed by a fully playable, bilingual (`EN / RU`) Vertical Slice prototype.
>
> **Why it fits your portfolio:**
> Like *Manor Lords*, *Old World*, and *Fields of Glory*, *THE IMAMAT: DIVAN-KHANA* replaces abstract map-painting with authentic historical logistics and character agency:
> 1. **Indirect Command & Naib Agency (`FOrderProbabilityBreakdown`):** Players rule from Imam Shamil’s oak table in Dargo-Vedeno. Orders travel via physical mounted couriers carrying `15`, `30`, or `45` poods of scarce black powder. Every Naib governor autonomously decides whether to obey, delay, or defect based on a transparent mathematical balance of *Iman* and *Courage* vs. *Greed*, *Pride*, and *War Strain*.
> 2. **Gridless 3D Siege Topography & 18-Gazyr Tactical Ballistics:** Tactical battles take place on real 16-bit NASA SRTM heightmaps (`2017x2017`) of Ahulgo, Dargo, Salty, and Gergebil. Every fighter carries exactly 18 chest *gazyrs* (measured powder tubes); once depleted (`0/18`), units dynamically transition into high-velocity *Bazalai* dagger melee.
> 3. **Subterranean Counter-Mine Warfare (Milyutin Cliff Cutaway):** Using a custom HLSL planar-clipping shader inspired by Baron D. A. Milyutin’s 1839–1848 military engravings, players slice into mountain fortresses to detect Russian sap trenches with engineer Hajji Yusuf Safarov’s acoustic copper basin and detonate subterranean camouflet mines.
>
> **De-Risked Engineering & Validated Playtest KPIs:**
> * **Instant Zero-Install Playable Build (`466 KB` Standalone HTML attached):** Switch to English (`🌐 EN 🇬🇧`) in the top bar to test all 10 Naibates, the 3-step Secretary al-Qarakhi onboarding, the 3D cliff cutaway, and the 12 Steam Achievements right in your browser.
> * **4,000-Run Monte Carlo Balance Proof & 25-Session Cohort Telemetry:** Validated `88.0%` onboarding completion, `76.0%` Turn-10 survival rate, and `55.3%` Gazyr-to-melee transition rate.
> * **Production Scope:** `$240,000` over 12 months to 1.0 Steam Launch (Break-even at just `23,188` copies at `$24.99` SRP).
>
> **Attachments / Links Included:**
> 1. `Imamat_DivanKhana_Standalone_Playtest.html` (Double-click to play in any browser — toggle `🌐 EN 🇬🇧` in header)
> 2. `04_Publisher_Pitch_Deck_and_Budget_ROI.md` (12-slide deck structure, budget breakdown & 3-scenario ROI model)
> 3. UE5.5 C++20 Source, 11 DataTables & 16-bit SRTM Heightmap Package summary
>
> Would you have 20 minutes next week for a live walkthrough of the Vertical Slice and UE5.5 pipeline?
>
> Best regards,  
> **[Your Name / Studio Title]**  
> Project Lead — *THE IMAMAT: DIVAN-KHANA*

---

### 4.2. Шаблон письма на русском языке (для профильных фондов, инвесторов и русскоязычных медиа)

**Тема письма:** Питч и играбельный Vertical Slice: «ИМАМАТ: ДИВАН-ХАНА (1845)» — историческая гранд-стратегия и 3D-варгейм (UE 5.5)

> Здравствуйте, **[Имя / Команда издательства или фонда]**!
>
> Представляю вам проект **«ИМАМАТ: ДИВАН-ХАНА (1845)»** — асимметричную историческую гранд-стратегию и тактический 3D-варгейм без гексов об эпохе и государстве Имама Шамиля (1834–1859), разрабатываемый на Unreal Engine 5.5 на базе 30-томного архивного свода (хроника Мухаммед-Тахира аль-Карахи, фонды РГВИА и Османского архива BOA).
>
> **Ключевые продуктовые преимущества (USP):**
> 1. **Непрямое управление и формула воли наибов (`FOrderProbabilityBreakdown`):** Игрок управляет 10 наибствами Кавказа из-за командного стола в Дарго-Ведено, отправляя конных гонцов и пороховые обозы (`15`, `30` и `45` пудов). Повиновение каждого наиба рассчитывается по открытой формуле баланса Имана и Смелости против Алчности, Гордыни и Стресса.
> 2. **Безсеточная 3D-топография NASA SRTM и 18 нагрудных газырей (`UGazyrAmmunitionComponent`):** Никаких гексов и абстрактных полосок боезапаса — у каждого стрелка ровно 18 газырей в черкеске; при истощении пороха (`0/18`) отряд автоматически переходит в кинжальный прорыв сталью Базалая и Гурды.
> 3. **Геодезический разрез скалы барона Д. А. Милютина (`MF_MilyutinCutawaySection.hlsl`):** Уникальный тактический режим подземно-минной войны при осадах Салты, Гергебиля и Чоха с акустическим пеленгом сапёрных галерей через медный таз Хаджи-Юсуфа Сафарова.
>
> **Инженерная и финансовая готовность (Milestones M1–M8):**
> * Во вложении — автономный однофайловый билд **`Imamat_DivanKhana_Standalone_Playtest.html` (`466 КБ`)**, который запускается двойным кликом в любом браузере без установки, поддерживает живое переключение языка `🌐 RU / EN`, экспорт сейвов `UImamatSaveGame`, телеметрию и 12 исторических достижений Steam.
> * Математический баланс проверен 4 000 прогонами Монте-Карло (`MonteCarlo_1000x20_Report.json`) и когортой из 25 сессий плейтеста (`Playtest_Cohort_KPI_Report.json` — все 5 KPI в зелёной зоне `PASS`).
> * Бюджет Full Production на 12 месяцев составляет `$240,000` с точкой безубыточности на уровне `23,188` копий в Steam (`$24.99` SRP).
>
> Буду рад провести 20-минутную демонстрацию билда и обсудить формат партнёрства на следующей неделе.
>
> С уважением,  
> **[Ваше Имя / Студия]**  
> Руководитель проекта *«ИМАМАТ: ДИВАН-ХАНА»*

---

## 5. Чек-лист файлов в папке `05_Steam_Release_and_Playtest_Kit/` для отправки издателю

1. [`Imamat_DivanKhana_Standalone_Playtest.html`](file:///Users/alibegov/Downloads/Кавказская%20война/05_Steam_Release_and_Playtest_Kit/Imamat_DivanKhana_Standalone_Playtest.html) — автономный играбельный билд (`RU / EN`).
2. [`Imamat_DivanKhana_Web_Playtest_v0.5.zip`](file:///Users/alibegov/Downloads/Кавказская%20война/05_Steam_Release_and_Playtest_Kit/Imamat_DivanKhana_Web_Playtest_v0.5.zip) — архив демоверсии для заливки в облако / Itch.io.
3. [`04_Publisher_Pitch_Deck_and_Budget_ROI.md`](file:///Users/alibegov/Downloads/Кавказская%20война/05_Steam_Release_and_Playtest_Kit/04_Publisher_Pitch_Deck_and_Budget_ROI.md) — 12-слайдовый питч-дек, роадмап и финансовая модель ROI.
4. [`01_Steam_Store_Page_RU_EN.md`](file:///Users/alibegov/Downloads/Кавказская%20война/05_Steam_Release_and_Playtest_Kit/01_Steam_Store_Page_RU_EN.md) — двуязычный текст страницы магазина Steam.
5. [`02_Steam_Tag_Matrix_and_Trailer_Script.md`](file:///Users/alibegov/Downloads/Кавказская%20война/05_Steam_Release_and_Playtest_Kit/02_Steam_Tag_Matrix_and_Trailer_Script.md) — матрица 20 тегов Steamworks и посекундный сценарий трейлера.
6. [`03_Playtest_Telemetry_and_QA_Checklist.md`](file:///Users/alibegov/Downloads/Кавказская%20война/05_Steam_Release_and_Playtest_Kit/03_Playtest_Telemetry_and_QA_Checklist.md) и [`Playtest_Cohort_KPI_Report.json`](file:///Users/alibegov/Downloads/Кавказская%20война/05_Steam_Release_and_Playtest_Kit/Playtest_Cohort_KPI_Report.json) — телеметрия и отчёт валидации KPI.
