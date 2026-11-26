# Steam Storefront Package (RU / EN) — «Имамат: Диван-хана и Горная Война (1834–1859)»

> **AppID Classification:** Historical Grand Strategy / Tactical Wargame (Singleplayer)  
> **Target Engine:** Unreal Engine 5.5 (Nanite / Lumen / Chaos Destruction / MassEntity) + Web Companion Demo  
> **Release Pipeline:** Steam Next Fest Demo (Vertical Slice) $\rightarrow$ Steam Playtest $\rightarrow$ Full Release (Windows DX12 SM6 & macOS Apple Silicon Metal SM6)

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

## 💻 СИСТЕМНЫЕ ТРЕБОВАНИЯ (SYSTEM REQUIREMENTS)

| Параметр | Минимальные (Minimum — 1080p @ 60 FPS) | Рекомендуемые (Recommended — 1440p/4K @ 60+ FPS, Nanite & Lumen) |
| :--- | :--- | :--- |
| **ОС (Windows)** | Windows 10 / 11 (64-bit, DirectX 12 Agility SDK, SM6) | Windows 11 (64-bit, DirectX 12 Ultimate, SM6) |
| **ОС (macOS)** | macOS Sonoma 14.5+ (Apple Silicon M1 / M2, Metal 3 SM6) | macOS Sequoia 15.0+ (Apple Silicon M3 Pro / Max, Metal 3 SM6) |
| **Процессор (CPU)** | Intel Core i5-10400F / AMD Ryzen 5 3600 / Apple M1 | Intel Core i7-12700K / AMD Ryzen 7 5800X3D / Apple M3 Pro |
| **Оперативная память** | 16 GB RAM | 32 GB RAM |
| **Видеокарта (GPU)** | NVIDIA RTX 2060 (6 GB) / AMD RX 6600 (8 GB) | NVIDIA RTX 3080 / RTX 4070 (12 GB) / AMD RX 7800 XT |
| **Место на диске** | 25 GB SSD (NVMe рекомендуется для стриминга 16-bit SRTM) | 25 GB NVMe SSD |
