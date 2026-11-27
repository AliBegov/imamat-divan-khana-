# Steam Storefront Package (RU / EN) — «Имамат: Диван-хана и Горная Война (1834–1859)»

> **AppID Classification:** Historical Grand Strategy / Tactical 3D Wargame (Singleplayer, RU / EN)  
> **Runtime Engine:** Three.js WebGL2 PBR + Blender 4.2 Sculpted 3D Assets + NASA SRTM Relief (Native macOS arm64 / Windows x64 / Steam Deck Verified `1280×800` → 4K UHD)  
> **Release Pipeline:** Steam «Coming Soon» Storefront (Sprint 11) → Steam Next Fest Playable Demo (Sprint 12) → Commercial v1.0 Release

---

## 🇷🇺 ВЕРСИЯ ДЛЯ РУССКОЯЗЫЧНОЙ СТРАНИЦЫ STEAM

### Краткое описание (Short Description — до 300 символов)
Асимметричная историческая гранд-стратегия и тактический 3D-варгейм о государстве Имама Шамиля (1834–1859). Управляйте Кавказом через командный стол Диван-ханы, не имея прямого контроля над наибами, куйте селитру и отбивайте осады в геодезическом 3D-разрезе горных цитаделей.

### Об этой игре (About This Game — Полное описание)

#### **ВЫ НЕ ДВИГАЕТЕ ПОЛКИ МЫШЬЮ — ВЫ УПРАВЛЯЕТЕ ЧЕРЕЗ ВОЛЮ, ЗАКОН И ПОРОХ**
Лето 1845 года. Многотысячные колонны графа М. С. Воронцова входят в вековые буковые леса Ичкерии, а осадные батареи полковника Д. А. Милютина ведут минные сапы под бастионы Салты и Гергебиля. В **«Имамат: Диван-хана и Горная Война»** вы возглавляете государственный совет (*Диван-хану*) в столице Дарго-Ведено.

В отличие от классических стратегий, здесь **нет мгновенной связи и стопроцентного подчинения**. Каждый ваш указ — это свиток со свинцовой печатью, который конный гонец везёт через заснеженные перевалы, рискуя попасть в казачий секрет. И даже когда свиток доставлен, своевольный наиб — от бесстрашного Хаджи-Мурата до расчётливого Даниял-бека Илисуйского — взвесит ваш приказ через собственную **Матрицу Имана, Смелости, Алчности и Гордыни**.

---

#### **КЛЮЧЕВЫЕ ОСОБЕННОСТИ (KEY FEATURES)**

* **Диегетический командный стол Диван-ханы (`ADivanKhanaTablePawn`):**
  Управляйте 10 историческими наибствами Кавказа (Хунзах, Ичкерия, Гергебиль, Салты, Ириб, Андия, Карата, Дарго-Ведено, Гуниб и Чох) над топографической картой Генштаба 1845 года при свете масляного светильника *чираг*, пламя которого дрожит, когда государственный стресс приближается к порогу духовного кризиса (**«Зульмат»**).
* **Прозрачная математика неповиновения (`FOrderProbabilityBreakdown`):**
  Никакого скрытого рандома. Перед отправкой каждого гонца вы видите полную декомпозицию шанса подчинения:
  $$P(\text{Obey}) = \text{Clamp}\big(\text{Base} + 0.45\cdot\text{Iman} + 0.25\cdot\text{Courage} + \text{SupplyBonus} - \text{GreedPenalty} - \text{PridePenalty} - \text{StressPenalty},\; 5\%,\; 98\%\big)$$
* **Пороховая экономика и Кодекс Низамов Шамиля:**
  Кавказская война — это война логистики. Стройте селитренные варницы инженера Хаджи-Юсуфа Сафарова, отливайте горные единороги в Ведено, вводите тайную ревизию *мухтасибов* и балансируйте между древним родовым обычаем (*Адатом*) и строгим государственным законом (*Низамом*).
* **Тактический 3D-разрез скалы по чертежам Д. А. Милютина:**
  Переходите с карты кампании прямо в 3D-диораму осады горного аула (Ахульго, Салты, Гергебиль) с интерактивным секущим разрезом скалы (`MF_MountainVerticalFog_Imamat.ush`):
  * Используйте **мёртвые зоны настильного огня** (углы обрыва $65^\circ\text{--}75^\circ$), о которые разбиваются ядра полевых орудий.
  * Возводите 3-слойные бревенчатые блиндажи против навесных пудовых мортир.
  * Слушайте вибрацию воды в **медном тазу Сафарова**, чтобы засечь подземную русскую сапу и подорвать встречный горн (**камуфлет**) под галереей сапёров!
* **Инвариант «18 нагрудных газырей» (`UGazyrAmmunitionComponent`) и Лесной сплайн Дарго:**
  В бою на груди каждого горца ровно **18 газырей** с отмеренным зарядом крупнозернистого пороха. Когда расстрелян последний 18-й заряд, дистанционный бой прекращается — отряд автоматически обнажает шашки и кинжалы *базалай* для отчаянной рукопашной схватки (+35% к ударному натиску) в буковых завалах «Сухарной экспедиции».

---

## 🇬🇧 ENGLISH STEAM STOREFRONT COPY

### Short Description (Under 300 characters)
An asymmetric historical grand strategy & 3D tactical siege wargame set in Imam Shamil’s Caucasian Imamate (1834–1859). Rule from the candlelit Divan-Khana war table without direct unit control, balance gunpowder logistics and Sharia Nizams, and fight in cross-section cliffside sieges.

### About This Game

#### **YOU DO NOT CLICK TO MOVE REGIMENTS — YOU RULE THROUGH LAW, COURIERS, AND BLACK POWDER**
Summer, 1845. Prince Vorontsov’s Imperial expeditionary columns march into the ancient beech forests of Ichkeria while Colonel Dmitry Milyutin’s siege engineers drive underground sap galleries beneath the cliffside bastions of Salti and Gergebil. In **Imamat: Divan-Khana & Mountain Warfare**, you preside over the State Council (*Divan-Khana*) in Dargo-Vedeno.

There is no instant radio command and no guaranteed obedience. Every order you issue is a wax-sealed parchment carried by a lone horseman across snowbound passes patrolled by Cossack pickets. Even when the courier arrives, your regional governors (*Naibs*)—from the daring Hadji Murad to the calculating Sultan Daniyal-bek—weigh your decree against their own **Psychological Matrix of Iman (Faith), Courage, Greed, and Clan Pride**.

---

#### **CORE PILLARS & FEATURES**

* **Diegetic Divan-Khana War Table (`ADivanKhanaTablePawn`):**
  Govern 10 historical Naibates of Dagestan and Chechnya over an authentic 1845 General Staff relief map. Watch the brass oil lamp (*Chirag*) flicker as your administrative burden rises toward **Zulmat**—a state of spiritual paralysis where the fog of war blinds your council until you retreat into ascetic *Khalwat*.
* **Deterministic Obedience Breakdown (`FOrderProbabilityBreakdown`):**
  Every courier dispatch displays a transparent mathematical breakdown of Naib compliance, convoy interception risk across 3 caravan tiers (`15`, `30`, or `45` poods of black powder), and silver subsidy offsets.
* **Vertical Cutaway Siege Warfare (Milyutin Cross-Section):**
  Slice directly through 16-bit SRTM mountain fortresses in real time (`MF_MountainVerticalFog_Imamat.ush`):
  * Exploit **flat-trajectory dead zones** on $70^\circ$ limestone cliffs while absorbing high-angle mortar shells with 3-layer timber blindages.
  * Track enemy sapper picks using **Safarov’s copper water basin** and detonate underground **camouflet** counter-mines to collapse Imperial tunnels before they breach your watchtowers.
* **The 18-Gazyr Tactical Invariant & Dargo Forest Ambush:**
  Every warrior carries exactly **18 measured breast-pocket cartridges (*Gazyrs*)**. Once the 18th cartridge is spent, ranged fire ceases—forcing an immediate, lethal *Kindjal* and *Shashka* melee charge (+35% shock impact) against stretched artillery trains in the beech forests of Dargo.

---

## 💻 СИСТЕМНЫЕ ТРЕБОВАНИЯ (SYSTEM REQUIREMENTS — DESKTOP WEBGL2 EDITION)

| Параметр | Минимальные (Minimum — Steam Deck `1280×800` / 1080p @ 60 FPS) | Рекомендуемые (Recommended — 1440p / 4K Retina @ 60 FPS) |
| :--- | :--- | :--- |
| **ОС (Windows)** | Windows 10 / 11 (64-bit) | Windows 11 (64-bit) |
| **ОС (macOS)** | macOS Monterey 12.0+ (Apple Silicon M1 / Intel) | macOS Sonoma / Sequoia (Apple Silicon M2 / M3 / M4) |
| **Steam Deck / Linux** | SteamOS 3.5+ (`1280×800` Verified HUD, 0px overflow) | SteamOS 3.5+ / Ubuntu 22.04+ |
| **Процессор (CPU)** | Dual-Core 2.4 GHz (Intel i3 / Ryzen 3 / Apple M1) | Quad-Core 3.0 GHz+ (Intel i5 / Ryzen 5 / Apple M2+) |
| **Оперативная память** | 4 GB RAM | 8 GB RAM |
| **Видеокарта (GPU)** | Любая видеокарта с поддержкой WebGL2 / Metal / DX11 | NVIDIA GTX 1060 / AMD RX 580 / Apple Silicon GPU |
| **Место на диске** | 250 MB свободного места | 500 MB SSD |
| **Steamworks** | Steam Cloud Saves (100 MB), 12 Achievements, Rich Presence, Steam Overlay | Steam Cloud Saves, Achievements, Steam Input (Deck) |
