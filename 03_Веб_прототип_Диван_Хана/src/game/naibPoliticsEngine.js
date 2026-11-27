// ============================================================================
// ПОЛИТИКА НАИБОВ, 25 КУБАЧИНСКИХ ОРДЕНОВ ШАМИЛЯ И 32 ИСТОРИЧЕСКИЕ ДИЛЕММЫ
// С ОТЛОЖЕННЫМИ ПОСЛЕДСТВИЯМИ (Спринт 7 — Фаза 3 / Quality Gate 3)
// Чистый ES-модуль без React/DOM: используется в UI, тестах и Монте-Карло.
// ============================================================================

export const ORDER_TIER_META = [
  {
    tier: 1,
    labelRu: 'I. Выпуклые медальоны с позолотой',
    labelEn: 'I. Domed Gilt Medallions',
    shortRu: 'I. Медальоны (6)',
    shortEn: 'I. Medallions (6)'
  },
  {
    tier: 2,
    labelRu: 'II. Большие звёзды мудиров и шашка',
    labelEn: 'II. Grand Mudir Stars & Shashka',
    shortRu: 'II. Звёзды (5)',
    shortEn: 'II. Stars (5)'
  },
  {
    tier: 3,
    labelRu: 'III. Знаки храбрости и полумесяц «Хиляль»',
    labelEn: 'III. Valor Badges & Silver Crescent',
    shortRu: 'III. Храбрость (8)',
    shortEn: 'III. Valor (8)'
  },
  {
    tier: 4,
    labelRu: 'IV. Чеканные диски с печатью Имама',
    labelEn: 'IV. Imamate Seal Discs',
    shortRu: 'IV. Печать (6)',
    shortEn: 'IV. Seals (6)'
  }
];

// Все 25 подлинных кубачинских и гоцатлинских орденов Имамата Шамиля (соответствуют 1-в-1 ShamilOrdersSvg.jsx)
export const KUBACHI_25_ORDERS_CATALOG = [
  // ---- РЯД 1 (№1–6): Выпуклые знаки с умбонами и позолотой ----
  {
    id: 'case_1',
    num: 1,
    tier: 1,
    name: 'Фестончатый знак с ажурным куполом',
    nameEn: 'Scalloped Filigree-Dome Order',
    metalRu: 'Серебро, позолота, ажурная резьба',
    metalEn: 'Silver, gilding, pierced filigree',
    arabicMotto: '«Твёрдость в слове хранит крепость лучше камня»',
    arabicMottoEn: '“Steadfast word guards a fortress better than stone”',
    shape: '1-й ряд • Выпуклый купол со сквозной кубачинской резьбой',
    shapeEn: 'Row 1 • Domed filigree medallion with scalloped rim',
    silverCost: 55,
    imanBonus: 7,
    prideReduction: 6,
    loyaltyBonus: 8,
    ambitionDelta: -3,
    gloryBonus: 7,
    authorityDelta: 2,
    garrisonDelta: 40,
    localPowderDelta: 0,
    pressureReduction: 3,
    squadronVetDelta: 1,
    perkRu: 'Верность +8 | Гарнизон +40 | Натиск -3%',
    perkEn: 'Loyalty +8 | Garrison +40 | Pressure -3%'
  },
  {
    id: 'case_2',
    num: 2,
    tier: 1,
    name: 'Знак со звёздчатым золочёным умбоном',
    nameEn: 'Gilt Star-Boss Medallion',
    metalRu: 'Серебро, позолота, чеканка',
    metalEn: 'Silver, gilding, repoussé',
    arabicMotto: '«Путеводная звезда ведущего сотню в ночи»',
    arabicMottoEn: '“Guiding star of him who leads a hundred by night”',
    silverCost: 65,
    imanBonus: 8,
    prideReduction: 5,
    loyaltyBonus: 7,
    ambitionDelta: -1,
    gloryBonus: 10,
    authorityDelta: 2,
    garrisonDelta: 0,
    localPowderDelta: 8,
    pressureReduction: 4,
    squadronVetDelta: 1,
    perkRu: 'Слава +10 | Порох округа +8 | Натиск -4%',
    perkEn: 'Glory +10 | Local Powder +8 | Pressure -4%'
  },
  {
    id: 'case_3',
    num: 3,
    tier: 1,
    name: 'Круглый знак с чернёной розеткой',
    nameEn: 'Niello Rosette Silver Order',
    metalRu: 'Серебро, чернь, гравировка',
    metalEn: 'Silver, niello, engraving',
    arabicMotto: '«Честь верного наиба чище горного серебра»',
    arabicMottoEn: '“A loyal Naib’s honor is purer than mountain silver”',
    silverCost: 50,
    imanBonus: 9,
    prideReduction: 8,
    loyaltyBonus: 11,
    ambitionDelta: -6,
    gloryBonus: 6,
    authorityDelta: 2,
    garrisonDelta: 0,
    localPowderDelta: 0,
    pressureReduction: 2,
    squadronVetDelta: 1,
    perkRu: 'Верность +11 | Амбиции -6 | Гордыня -8',
    perkEn: 'Loyalty +11 | Ambition -6 | Pride -8'
  },
  {
    id: 'case_4',
    num: 4,
    tier: 1,
    name: 'Прорезной 8-лучевой знак отваги',
    nameEn: '8-Petal Pierced Valor Disc',
    metalRu: 'Серебро, прорезная чеканка',
    metalEn: 'Silver, pierced chasing',
    arabicMotto: '«Восемь сторон света не сломят идущего прямо»',
    arabicMottoEn: '“Eight winds cannot bend the straight warrior”',
    silverCost: 60,
    imanBonus: 7,
    prideReduction: 4,
    loyaltyBonus: 6,
    ambitionDelta: 1,
    gloryBonus: 12,
    authorityDelta: 2,
    garrisonDelta: 75,
    localPowderDelta: 0,
    pressureReduction: 5,
    squadronVetDelta: 1,
    perkRu: 'Слава +12 | Гарнизон +75 | Натиск -5%',
    perkEn: 'Glory +12 | Garrison +75 | Pressure -5%'
  },
  {
    id: 'case_5',
    num: 5,
    tier: 1,
    name: 'Позолоченный орден с ребристым куполом',
    nameEn: 'Fluted-Sunburst Gilt Order',
    metalRu: 'Серебро, медь, ртутная позолота',
    metalEn: 'Silver, copper, mercury gilding',
    arabicMotto: '«Свет веры рассеивает мглу ущелий»',
    arabicMottoEn: '“Light of faith scatters the gloom of the gorges”',
    silverCost: 75,
    imanBonus: 10,
    prideReduction: 7,
    loyaltyBonus: 10,
    ambitionDelta: -4,
    gloryBonus: 11,
    authorityDelta: 3,
    garrisonDelta: 50,
    localPowderDelta: 6,
    pressureReduction: 4,
    squadronVetDelta: 1,
    perkRu: 'Верность +10 | Иман +10 | Авторитет +3%',
    perkEn: 'Loyalty +10 | Iman +10 | Authority +3%'
  },
  {
    id: 'case_6',
    num: 6,
    tier: 1,
    name: 'Высший золочёный знак с короной-куполом',
    nameEn: 'Gilt Openwork-Crown Order',
    metalRu: 'Серебро, густая позолота, скань',
    metalEn: 'Silver, heavy gilding, filigree',
    arabicMotto: '«Венец доблести на челе защитника гор»',
    arabicMottoEn: '“Crown of valor upon the defender of the peaks”',
    silverCost: 110,
    imanBonus: 13,
    prideReduction: 9,
    loyaltyBonus: 14,
    ambitionDelta: -5,
    gloryBonus: 15,
    authorityDelta: 4,
    garrisonDelta: 90,
    localPowderDelta: 10,
    pressureReduction: 6,
    squadronVetDelta: 1,
    perkRu: 'Верность +14 | Слава +15 | Авторитет +4%',
    perkEn: 'Loyalty +14 | Glory +15 | Authority +4%'
  },

  // ---- РЯД 2 (№7–11): Большие звёзды мудиров и знак с шашкой ----
  {
    id: 'order_sword',
    num: 7,
    tier: 2,
    name: 'Медальон с розеткой и шашкой',
    nameEn: 'Medallion with Rosette & Shashka',
    metalRu: 'Серебро, чернь, гравированная шашка',
    metalEn: 'Silver, niello, engraved shashka',
    arabicMotto: '«Слава не отступающему в бою — шашка храброго»',
    arabicMottoEn: '“Glory to the steadfast — shashka of the brave”',
    shape: '2-й ряд • Круглый знак с гравированной кавказской шашкой',
    shapeEn: 'Row 2 • Silver medallion chased with a Caucasian shashka',
    silverCost: 90,
    imanBonus: 10,
    prideReduction: 8,
    loyaltyBonus: 9,
    ambitionDelta: 2,
    gloryBonus: 16,
    authorityDelta: 3,
    garrisonDelta: 100,
    localPowderDelta: 0,
    pressureReduction: 7,
    squadronVetDelta: 1,
    perkRu: 'Слава +16 | Гарнизон +100 | Натиск -7%',
    perkEn: 'Glory +16 | Garrison +100 | Pressure -7%'
  },
  {
    id: 'case_8',
    num: 8,
    tier: 2,
    name: 'Большая 8-лепестковая серебряная звезда мудира',
    nameEn: 'Grand 8-Lobed Silver Mudir Star',
    metalRu: 'Серебро, прорезные арки, чернь',
    metalEn: 'Silver, pierced arches, niello',
    arabicMotto: '«Старшему над наибами — щит и опора Имамата»',
    arabicMottoEn: '“To the senior over Naibs — shield & pillar of the Imamate”',
    shape: '2-й ряд • Большая 8-лепестковая звезда окружного мудира',
    shapeEn: 'Row 2 • Grand 8-lobed regional Mudir star',
    silverCost: 130,
    imanBonus: 14,
    prideReduction: 12,
    loyaltyBonus: 15,
    ambitionDelta: -4,
    gloryBonus: 18,
    authorityDelta: 4,
    garrisonDelta: 120,
    localPowderDelta: 12,
    pressureReduction: 7,
    squadronVetDelta: 2,
    perkRu: 'Верность +15 | Сотня +2★ | Гарнизон +120',
    perkEn: 'Loyalty +15 | Squadron +2★ | Garrison +120'
  },
  {
    id: 'order_mudir',
    num: 9,
    tier: 2,
    name: 'Большая фестончатая звезда Мудира',
    nameEn: 'Grand Scalloped Star of the Mudir',
    metalRu: 'Серебро, позолота, 14 шариков-умбонов',
    metalEn: 'Silver, gilding, 14 silver pearl bosses',
    arabicMotto: '«Повиновение Имаму — залог победы, да возвысит Аллах его знамя»',
    arabicMottoEn: '“Obedience to the Imam is the pledge of victory”',
    shape: '2-й ряд • Высшая звезда командующего фронтом (14 жемчужин)',
    shapeEn: 'Row 2 • Supreme front-commander star (14 pearl bosses)',
    silverCost: 155,
    imanBonus: 18,
    prideReduction: 16,
    loyaltyBonus: 18,
    ambitionDelta: -8,
    gloryBonus: 22,
    authorityDelta: 6,
    garrisonDelta: 150,
    localPowderDelta: 15,
    pressureReduction: 10,
    squadronVetDelta: 2,
    perkRu: 'Высшая награда: Верность +18 | Слава +22 | Авторитет +6%',
    perkEn: 'Supreme Award: Loyalty +18 | Glory +22 | Authority +6%'
  },
  {
    id: 'case_10',
    num: 10,
    tier: 2,
    name: 'Звезда мудира с крестовыми арабскими картушами',
    nameEn: 'Mudir Star with 4 Arabic Cartouches',
    metalRu: 'Серебро, чернь, арабская вязь',
    metalEn: 'Silver, niello, Arabic calligraphy',
    arabicMotto: '«Четыре столпа правления: шариат, меч, казна и верность»',
    arabicMottoEn: '“Four pillars of rule: law, sword, treasury, and loyalty”',
    shape: '2-й ряд • Звезда с 4 картушами арабской каллиграфии',
    shapeEn: 'Row 2 • Star inscribed with 4 Arabic calligraphic cartouches',
    silverCost: 135,
    imanBonus: 15,
    prideReduction: 14,
    loyaltyBonus: 16,
    ambitionDelta: -9,
    gloryBonus: 16,
    authorityDelta: 5,
    garrisonDelta: 80,
    localPowderDelta: 10,
    pressureReduction: 6,
    squadronVetDelta: 1,
    perkRu: 'Верность +16 | Амбиции -9 | Авторитет +5%',
    perkEn: 'Loyalty +16 | Ambition -9 | Authority +5%'
  },
  {
    id: 'case_11',
    num: 11,
    tier: 2,
    name: 'Выпуклая 6-лепестковая прорезная розетка',
    nameEn: 'Domed 6-Petal Pierced Rosette',
    metalRu: 'Серебро, прорезная резьба, умбон',
    metalEn: 'Silver, pierced chasing, central boss',
    arabicMotto: '«Искусство мастера и клинок воина служат одному делу»',
    arabicMottoEn: '“Craftsman’s chisel and warrior’s blade serve one cause”',
    shape: '2-й ряд • Шестилепестковая кубачинская розетка',
    shapeEn: 'Row 2 • Six-petal Kubachi pierced silver rosette',
    silverCost: 70,
    imanBonus: 8,
    prideReduction: 7,
    loyaltyBonus: 9,
    ambitionDelta: -4,
    gloryBonus: 10,
    authorityDelta: 2,
    garrisonDelta: 45,
    localPowderDelta: 12,
    pressureReduction: 4,
    squadronVetDelta: 1,
    perkRu: 'Порох округа +12 | Верность +9 | Гарнизон +45',
    perkEn: 'Local Powder +12 | Loyalty +9 | Garrison +45'
  },

  // ---- РЯД 3 (№12–19): Знаки храбрости и полумесяц «Хиляль» ----
  {
    id: 'case_12',
    num: 12,
    tier: 3,
    name: 'Прорезной 5-лепестковый знак смельчака',
    nameEn: '5-Petal Pierced Bravery Badge',
    metalRu: 'Серебро, прорезная резьба',
    metalEn: 'Silver, pierced work',
    arabicMotto: '«Первому, кто взошёл на завал под картечью»',
    arabicMottoEn: '“To the first who mounted the abatis under canister”',
    silverCost: 40,
    imanBonus: 5,
    prideReduction: 4,
    loyaltyBonus: 6,
    ambitionDelta: 1,
    gloryBonus: 9,
    authorityDelta: 1,
    garrisonDelta: 55,
    localPowderDelta: 0,
    pressureReduction: 4,
    squadronVetDelta: 1,
    perkRu: 'Доступная чеканка | Слава +9 | Гарнизон +55',
    perkEn: 'Low Mint Cost | Glory +9 | Garrison +55'
  },
  {
    id: 'case_13',
    num: 13,
    tier: 3,
    name: 'Выпуклый знак со звездой и вязью',
    nameEn: 'Star-Boss Calligraphic Medal',
    metalRu: 'Серебро, чернь, ковка',
    metalEn: 'Silver, niello, forged',
    arabicMotto: '«Стойкость под огнём дороже золота»',
    arabicMottoEn: '“Steadfastness under fire outweighs gold”',
    silverCost: 48,
    imanBonus: 7,
    prideReduction: 6,
    loyaltyBonus: 8,
    ambitionDelta: -3,
    gloryBonus: 8,
    authorityDelta: 2,
    garrisonDelta: 30,
    localPowderDelta: 6,
    pressureReduction: 3,
    squadronVetDelta: 1,
    perkRu: 'Верность +8 | Порох +6 | Иман +7',
    perkEn: 'Loyalty +8 | Powder +6 | Iman +7'
  },
  {
    id: 'case_14',
    num: 14,
    tier: 3,
    name: 'Двухкольцевой знак с арабским девизом',
    nameEn: 'Double-Ring Arabic Motto Medal',
    metalRu: 'Серебро, гравировка, умбон',
    metalEn: 'Silver, engraving, boss',
    arabicMotto: '«Единство джамаата сильнее пушек»',
    arabicMottoEn: '“Unity of the jamaat is stronger than cannon”',
    silverCost: 52,
    imanBonus: 8,
    prideReduction: 9,
    loyaltyBonus: 10,
    ambitionDelta: -7,
    gloryBonus: 6,
    authorityDelta: 2,
    garrisonDelta: 40,
    localPowderDelta: 0,
    pressureReduction: 3,
    squadronVetDelta: 1,
    perkRu: 'Амбиции -7 | Гордыня -9 | Верность +10',
    perkEn: 'Ambition -7 | Pride -9 | Loyalty +10'
  },
  {
    id: 'order_crescent',
    num: 15,
    tier: 3,
    name: 'Серебряный полумесяц «Хиляль»',
    nameEn: 'Silver Crescent “Hilal”',
    metalRu: 'Кованое серебро, арабская гравировка',
    metalEn: 'Forged silver, Arabic engraving',
    arabicMotto: '«Помощь от Аллаха и близкая победа» (Коран 61:13)',
    arabicMottoEn: '“Victory from Allah and an imminent conquest” (61:13)',
    shape: '3-й ряд • Кованый серебряный полумесяц ночных рейдов',
    shapeEn: 'Row 3 • Forged silver crescent of nocturnal raids',
    silverCost: 85,
    imanBonus: 11,
    prideReduction: 7,
    loyaltyBonus: 11,
    ambitionDelta: -2,
    gloryBonus: 15,
    authorityDelta: 3,
    garrisonDelta: 70,
    localPowderDelta: 8,
    pressureReduction: 6,
    squadronVetDelta: 1,
    perkRu: 'Ночной рейд: Слава +15 | Натиск -6% | Порох +8',
    perkEn: 'Night Raid: Glory +15 | Pressure -6% | Powder +8'
  },
  {
    id: 'order_lion',
    num: 16,
    tier: 3,
    name: 'Круглый прорезной знак храбрости',
    nameEn: 'Pierced Silver Order of Valor',
    metalRu: 'Серебро, 5 сердцевидных прорезей, сабля',
    metalEn: 'Silver, 5 heart-cutouts, saber',
    arabicMotto: '«Кто думает о последствиях — не храбрец»',
    arabicMottoEn: '“He who ponders consequences is no brave man”',
    shape: '3-й ряд • Знаменитый орден храбрости мюридов (5 прорезей)',
    shapeEn: 'Row 3 • Celebrated Murid Order of Valor (5 cutouts)',
    silverCost: 80,
    imanBonus: 10,
    prideReduction: 6,
    loyaltyBonus: 10,
    ambitionDelta: 1,
    gloryBonus: 17,
    authorityDelta: 3,
    garrisonDelta: 95,
    localPowderDelta: 0,
    pressureReduction: 7,
    squadronVetDelta: 1,
    perkRu: 'Слава +17 | Гарнизон +95 | Натиск -7%',
    perkEn: 'Glory +17 | Garrison +95 | Pressure -7%'
  },
  {
    id: 'case_17',
    num: 17,
    tier: 3,
    name: 'Лучевой знак храбрости с коническим умбоном',
    nameEn: 'Six-Ray Star-Punched Valor Disc',
    metalRu: 'Серебро, чернь, штамп',
    metalEn: 'Silver, niello, chased',
    arabicMotto: '«За оборону ущелья и спасение знамени»',
    arabicMottoEn: '“For defending the gorge and saving the banner”',
    silverCost: 58,
    imanBonus: 7,
    prideReduction: 5,
    loyaltyBonus: 8,
    ambitionDelta: -2,
    gloryBonus: 11,
    authorityDelta: 2,
    garrisonDelta: 65,
    localPowderDelta: 4,
    pressureReduction: 5,
    squadronVetDelta: 1,
    perkRu: 'Оборона ущелья: Гарнизон +65 | Натиск -5%',
    perkEn: 'Gorge Defense: Garrison +65 | Pressure -5%'
  },
  {
    id: 'case_18',
    num: 18,
    tier: 3,
    name: 'Серебряно-золотистый медальон наиба',
    nameEn: 'Silver-Gilt Naib Medallion',
    metalRu: 'Серебро, лёгкая позолота, чернь',
    metalEn: 'Silver, light gilding, niello',
    arabicMotto: '«Справедливому правителю округа и хранителю закята»',
    arabicMottoEn: '“To the just district governor and keeper of zakat”',
    silverCost: 68,
    imanBonus: 9,
    prideReduction: 10,
    loyaltyBonus: 12,
    ambitionDelta: -7,
    gloryBonus: 8,
    authorityDelta: 3,
    garrisonDelta: 30,
    localPowderDelta: 6,
    pressureReduction: 3,
    squadronVetDelta: 1,
    perkRu: 'Верность +12 | Гордыня -10 | Авторитет +3%',
    perkEn: 'Loyalty +12 | Pride -10 | Authority +3%'
  },
  {
    id: 'case_19',
    num: 19,
    tier: 3,
    name: 'Прорезной 5-лепестковый веерный знак',
    nameEn: '5-Fan Pierced Valor Badge',
    metalRu: 'Серебро, бронзовая патина, гравировка',
    metalEn: 'Silver, bronze patina, engraving',
    arabicMotto: '«За дерзкий набег за кордонную линию»',
    arabicMottoEn: '“For a daring raid beyond the cordon line”',
    silverCost: 45,
    imanBonus: 6,
    prideReduction: 4,
    loyaltyBonus: 6,
    ambitionDelta: 2,
    gloryBonus: 11,
    authorityDelta: 2,
    garrisonDelta: 60,
    localPowderDelta: 5,
    pressureReduction: 4,
    squadronVetDelta: 1,
    perkRu: 'Рейд: Слава +11 | Порох +5 | Гарнизон +60',
    perkEn: 'Raid: Glory +11 | Powder +5 | Garrison +60'
  },

  // ---- РЯД 4 (№20–25): Чеканные диски-медали с печатью Имама Шамиля ----
  {
    id: 'case_20',
    num: 20,
    tier: 4,
    name: 'Большой серебряный диск с печатью Имама (I)',
    nameEn: 'Large Silver Imamate Seal Disc (I)',
    metalRu: 'Серебро, круговая вязь и тугра',
    metalEn: 'Silver, ring script & seal',
    arabicMotto: '«Сей знак храбрости от Амира правоверных Имама Шамиля»',
    arabicMottoEn: '“This badge of bravery from the Commander of the Faithful Imam Shamil”',
    shape: '4-й ряд • Круглый чеканный диск с личной печатью Имама',
    shapeEn: 'Row 4 • Large chased disc bearing Shamil’s personal seal',
    silverCost: 95,
    imanBonus: 12,
    prideReduction: 11,
    loyaltyBonus: 14,
    ambitionDelta: -7,
    gloryBonus: 12,
    authorityDelta: 4,
    garrisonDelta: 50,
    localPowderDelta: 8,
    pressureReduction: 5,
    squadronVetDelta: 1,
    perkRu: 'Печать Имама: Верность +14 | Авторитет +4%',
    perkEn: 'Imam Seal: Loyalty +14 | Authority +4%'
  },
  {
    id: 'case_21',
    num: 21,
    tier: 4,
    name: 'Большой серебряный диск с печатью Имама (II)',
    nameEn: 'Large Silver Imamate Seal Disc (II)',
    metalRu: 'Серебро, глубокая гравировка',
    metalEn: 'Silver, deep engraving',
    arabicMotto: '«За оборону Ахульго, Салтов и Чоха до последнего патрона»',
    arabicMottoEn: '“For holding Akhulgo, Salty, and Chokh to the last cartridge”',
    shape: '4-й ряд • Осадная медаль Имамата для защитников каменных аулов',
    shapeEn: 'Row 4 • Imamate siege medal for defenders of stone auls',
    silverCost: 100,
    imanBonus: 11,
    prideReduction: 9,
    loyaltyBonus: 12,
    ambitionDelta: -5,
    gloryBonus: 14,
    authorityDelta: 3,
    garrisonDelta: 110,
    localPowderDelta: 14,
    pressureReduction: 8,
    squadronVetDelta: 1,
    perkRu: 'Осадный щит: Гарнизон +110 | Порох +14 | Натиск -8%',
    perkEn: 'Siege Shield: Garrison +110 | Powder +14 | Pressure -8%'
  },
  {
    id: 'case_22',
    num: 22,
    tier: 4,
    name: 'Чеканная медаль казны Байт аль-маль (III)',
    nameEn: 'Bayt al-Mal Chased Medal (III)',
    metalRu: 'Серебро, двойной кант, тугра',
    metalEn: 'Silver, double rim, tugra',
    arabicMotto: '«За честный сбор хараджа и сбережение пороховых мельниц»',
    arabicMottoEn: '“For honest kharaj collection and safeguarding powder mills”',
    shape: '4-й ряд • Знак казначеев и устроителей тыла',
    shapeEn: 'Row 4 • Decoration for treasurers & logistics stewards',
    silverCost: 65,
    imanBonus: 8,
    prideReduction: 10,
    loyaltyBonus: 11,
    ambitionDelta: -6,
    gloryBonus: 7,
    authorityDelta: 3,
    garrisonDelta: 25,
    localPowderDelta: 18,
    pressureReduction: 3,
    squadronVetDelta: 1,
    perkRu: 'Арсенал: Порох округа +18 | Верность +11',
    perkEn: 'Arsenal: Local Powder +18 | Loyalty +11'
  },
  {
    id: 'case_23',
    num: 23,
    tier: 4,
    name: 'Позолоченная медаль Имамата (IV)',
    nameEn: 'Gilded Imamate Medal (IV)',
    metalRu: 'Серебро, позолота, арабский девиз',
    metalEn: 'Silver, gilding, Arabic motto',
    arabicMotto: '«Султану гор и соратнику в Совете Диван-ханы»',
    arabicMottoEn: '“To a counselor of the Divan-Khana & pillar of the peaks”',
    shape: '4-й ряд • Позолоченный диск членов Диван-ханы',
    shapeEn: 'Row 4 • Gilded medallion of Divan-Khana councilors',
    silverCost: 120,
    imanBonus: 14,
    prideReduction: 13,
    loyaltyBonus: 16,
    ambitionDelta: -8,
    gloryBonus: 14,
    authorityDelta: 5,
    garrisonDelta: 75,
    localPowderDelta: 10,
    pressureReduction: 6,
    squadronVetDelta: 1,
    perkRu: 'Диван-хана: Верность +16 | Амбиции -8 | Авторитет +5%',
    perkEn: 'Divan-Khana: Loyalty +16 | Ambition -8 | Authority +5%'
  },
  {
    id: 'case_24',
    num: 24,
    tier: 4,
    name: 'Медно-золочёная наградная бляха (V)',
    nameEn: 'Copper-Gilt Decoration Plate (V)',
    metalRu: 'Медь, позолота, чеканка',
    metalEn: 'Copper, gilding, chasing',
    arabicMotto: '«За расторопность сотника и верность караульной службе»',
    arabicMottoEn: '“For swift centurion command and vigilant watch duty”',
    shape: '4-й ряд • Нагрудная медно-золочёная бляха полевых командиров',
    shapeEn: 'Row 4 • Copper-gilt breastplate of field officers',
    silverCost: 35,
    imanBonus: 6,
    prideReduction: 6,
    loyaltyBonus: 8,
    ambitionDelta: -4,
    gloryBonus: 7,
    authorityDelta: 2,
    garrisonDelta: 50,
    localPowderDelta: 5,
    pressureReduction: 3,
    squadronVetDelta: 1,
    perkRu: 'Быстрая чеканка (35₽) | Гарнизон +50 | Порох +5',
    perkEn: 'Quick Mint (35 rub.) | Garrison +50 | Powder +5'
  },
  {
    id: 'case_25',
    num: 25,
    tier: 4,
    name: 'Почётный знак старшего наиба (VI)',
    nameEn: 'Senior Naib Honour Plate (VI)',
    metalRu: 'Медь, патина, печать Шамиля',
    metalEn: 'Copper, patina, Shamil seal',
    arabicMotto: '«Старшему наибу за долголетнюю службу и мир в джамаатах»',
    arabicMottoEn: '“To the Senior Naib for steadfast rule and peace among jamaats”',
    shape: '4-й ряд • Старинный почётный знак с тугрой Шамиля',
    shapeEn: 'Row 4 • Antique honor plate with Shamil’s seal',
    silverCost: 72,
    imanBonus: 11,
    prideReduction: 12,
    loyaltyBonus: 13,
    ambitionDelta: -9,
    gloryBonus: 9,
    authorityDelta: 3,
    garrisonDelta: 60,
    localPowderDelta: 6,
    pressureReduction: 4,
    squadronVetDelta: 1,
    perkRu: 'Смирение: Амбиции -9 | Гордыня -12 | Верность +13',
    perkEn: 'Humility: Ambition -9 | Pride -12 | Loyalty +13'
  }
];

// Исторический дисциплинарный знак Шамиля: войлочный лоскут позора (пришивался на спину бежавшему с поля боя)
export const FELT_SHAME_BADGE = {
  id: 'felt_shame_badge',
  num: 0,
  tier: 0,
  isDisciplinary: true,
  name: 'Войлочный знак позора трусу',
  nameEn: 'Felt Badge of Shame (Coward’s Patch)',
  metalRu: 'Грубый горский войлок, суровая нить',
  metalEn: 'Coarse mountain felt, hemp stitch',
  arabicMotto: '«Кто бежал от боя — носит войлок на спине, пока не смоет позор подвигом»',
  arabicMottoEn: '“He who fled battle wears felt on his back until valor washes it away”',
  shape: 'Дисциплинарный знак Низама Шамиля — пришивается на спину за ослушание',
  shapeEn: 'Disciplinary Nizam mark — stitched to the back for disobedience',
  silverCost: 0,
  imanBonus: -6,
  prideReduction: 18,
  loyaltyBonus: -5,
  ambitionDelta: -22,
  gloryBonus: -14,
  authorityDelta: 4,
  garrisonDelta: 0,
  localPowderDelta: 0,
  pressureReduction: 0,
  squadronVetDelta: 0,
  perkRu: '0₽ | Амбиции -22 | Гордыня -18 | Авторитет +4% (но Иман -6)',
  perkEn: '0 rub. | Ambition -22 | Pride -18 | Authority +4% (Iman -6)'
};

export function getOrderCatalogItemById(orderId) {
  if (orderId === FELT_SHAME_BADGE.id) return FELT_SHAME_BADGE;
  return KUBACHI_25_ORDERS_CATALOG.find((o) => o.id === orderId) || KUBACHI_25_ORDERS_CATALOG[0];
}

// ============================================================================
// ПОЛИТИКА НАИБОВ: ВЕРНОСТЬ / АМБИЦИИ / СЛАВА
// ============================================================================
export function computeNaibPoliticalProfile(naibate, naibRivalries = []) {
  if (!naibate) {
    return {
      loyalty: 70,
      ambition: 45,
      glory: 60,
      stanceId: 'pillar',
      stanceRu: 'Опора Имамата',
      stanceEn: 'Pillar of the Imamate',
      stanceTone: 'emerald',
      orderExecutionMod: 4,
      combatBonusPct: 6,
      schismRisk: 5,
      activeRivalries: []
    };
  }

  const iman = naibate.traits?.iman ?? 75;
  const courage = naibate.traits?.courage ?? 80;
  const pride = naibate.traits?.pride ?? 45;
  const trust = naibate.trustScore ?? 0;
  const ordersCount = Array.isArray(naibate.ordersAwarded) ? naibate.ordersAwarded.length : 0;
  const deltas = naibate.politicsDeltas || {};

  const activeRivalries = (naibRivalries || []).filter(
    (r) => !r.resolved && (r.naibAId === naibate.id || r.naibBId === naibate.id)
  );
  const maxRivalryTension = activeRivalries.reduce((m, r) => Math.max(m, r.tension || 0), 0);

  const loyaltyRaw =
    iman * 0.72 +
    trust * 7 +
    ordersCount * 4 -
    Math.max(0, pride - 62) * 0.45 -
    (naibate.estranged ? 22 : 0) -
    Math.round(maxRivalryTension * 0.12) +
    (deltas.loyalty || 0);
  const loyalty = Math.max(5, Math.min(100, Math.round(loyaltyRaw)));

  const troopWeight = Math.min(14, Math.round(((naibate.garrison || 0) + (naibate.murtazeks || 0)) / 180));
  const ambitionRaw =
    pride * 0.78 +
    troopWeight +
    Math.round(maxRivalryTension * 0.2) -
    Math.max(0, trust) * 3 +
    (naibate.estranged ? 14 : 0) +
    (deltas.ambition || 0);
  const ambition = Math.max(5, Math.min(100, Math.round(ambitionRaw)));

  const gloryRaw =
    courage * 0.62 +
    ordersCount * 9 +
    (naibate.underSiege ? 8 : 0) +
    Math.max(0, trust) * 4 +
    (deltas.glory || 0);
  const glory = Math.max(5, Math.min(100, Math.round(gloryRaw)));

  const schismRisk = Math.max(
    0,
    Math.min(
      95,
      Math.round(
        Math.max(0, ambition - loyalty + 15) * 0.95 +
          (naibate.estranged ? 28 : 0) +
          (maxRivalryTension >= 70 ? 12 : 0)
      )
    )
  );

  let stanceId = 'pillar';
  let stanceRu = 'Опора Имамата';
  let stanceEn = 'Pillar of the Imamate';
  let stanceTone = 'emerald';

  if (naibate.estranged || schismRisk >= 55 || loyalty < 42) {
    stanceId = 'schism_risk';
    stanceRu = 'Угроза откола';
    stanceEn = 'Schism Risk';
    stanceTone = 'rose';
  } else if (ambition >= 74 && loyalty < 68) {
    stanceId = 'ambitious_rival';
    stanceRu = 'Честолюбивый вождь';
    stanceEn = 'Ambitious Warlord';
    stanceTone = 'amber';
  } else if (glory >= 78 && loyalty >= 68) {
    stanceId = 'proud_champion';
    stanceRu = 'Прославленный витязь';
    stanceEn = 'Celebrated Champion';
    stanceTone = 'sky';
  } else if (loyalty < 58) {
    stanceId = 'wavering';
    stanceRu = 'Колеблющийся наиб';
    stanceEn = 'Wavering Naib';
    stanceTone = 'orange';
  }

  const orderExecutionMod = Math.max(
    -16,
    Math.min(14, Math.round((loyalty - 60) * 0.25 - Math.max(0, ambition - 65) * 0.22))
  );
  const combatBonusPct = Math.max(
    -5,
    Math.min(22, Math.round(glory * 0.16 + ordersCount * 2.5 - (naibate.estranged ? 8 : 0)))
  );

  return {
    loyalty,
    ambition,
    glory,
    stanceId,
    stanceRu,
    stanceEn,
    stanceTone,
    orderExecutionMod,
    combatBonusPct,
    schismRisk,
    activeRivalries
  };
}

export function applyOrderAwardToNaibate(naibate, orderItem) {
  const item = orderItem || KUBACHI_25_ORDERS_CATALOG[0];
  const isDisciplinary = Boolean(item.isDisciplinary);
  const prevDeltas = naibate.politicsDeltas || { loyalty: 0, ambition: 0, glory: 0 };

  const nextIman = Math.max(15, Math.min(100, (naibate.traits?.iman ?? 75) + (item.imanBonus || 0)));
  const nextPride = Math.max(10, Math.min(100, (naibate.traits?.pride ?? 45) - (item.prideReduction || 0)));
  const nextTrust = Math.max(
    -3,
    Math.min(3, (naibate.trustScore ?? 0) + (isDisciplinary ? -1 : 2))
  );
  const nextPressure = Math.max(
    12,
    Math.min(95, (naibate.imperialPressure ?? 50) - (item.pressureReduction || 0))
  );

  const nextNaibate = {
    ...naibate,
    ordersAwarded: isDisciplinary
      ? [...(naibate.ordersAwarded || []), item.name]
      : [...(naibate.ordersAwarded || []), item.name],
    ordersAwardedIds: [...(naibate.ordersAwardedIds || []), item.id],
    trustScore: nextTrust,
    estranged: isDisciplinary ? nextTrust <= -3 : false,
    garrison: Math.max(400, (naibate.garrison ?? 800) + (item.garrisonDelta || 0)),
    gunpowder: Math.max(6, (naibate.gunpowder ?? 20) + (item.localPowderDelta || 0)),
    imperialPressure: nextPressure,
    politicsDeltas: {
      loyalty: Math.max(-30, Math.min(35, (prevDeltas.loyalty || 0) + (item.loyaltyBonus || 0))),
      ambition: Math.max(-35, Math.min(35, (prevDeltas.ambition || 0) + (item.ambitionDelta || 0))),
      glory: Math.max(-25, Math.min(40, (prevDeltas.glory || 0) + (item.gloryBonus || 0)))
    },
    lastMemoryRu: isDisciplinary
      ? `Подвергнут порицанию: на спину пришит «${item.name}» по Низаму Шамиля`
      : `Удостоен кубачинского ордена «${item.name}» (№${item.num}) перед лицом Диван-ханы`,
    lastMemoryEn: isDisciplinary
      ? `Censured under Shamil’s Nizam with the “${item.nameEn || item.name}”`
      : `Bestowed Kubachi Order #${item.num} “${item.nameEn || item.name}” before the Divan-Khana`,
    traits: {
      ...naibate.traits,
      iman: nextIman,
      pride: nextPride
    }
  };

  return {
    nextNaibate,
    authorityDelta: item.authorityDelta ?? 3,
    silverCost: item.silverCost ?? 0,
    squadronVetDelta: item.squadronVetDelta ?? (isDisciplinary ? 0 : 1),
    rivalJealousyDelta: isDisciplinary ? -8 : item.tier === 2 ? 9 : 6,
    isDisciplinary
  };
}

// ============================================================================
// 32 КОРОТКИЕ ИСТОРИЧЕСКИЕ ДИЛЕММЫ С ОТЛОЖЕННЫМИ ПОСЛЕДСТВИЯМИ (2–4 ХОДА)
// ============================================================================
export const HISTORICAL_DILEMMAS_32 = [
  {
    id: 'dil_01_kubachi_silver',
    scenarios: ['all'],
    triggerType: 'politics',
    senderRu: 'Златокузнецы Кубачи и Гоцатля',
    senderEn: 'Silversmiths of Kubachi & Gotsatl',
    portraitHint: 'Хаджи-Юсуф',
    urgencyRu: 'АРСЕНАЛ И КАЗНА',
    urgencyEn: 'ARSENAL & MINT',
    titleRu: 'Серебро кубачинцев: ордена или кремнёвые замки?',
    titleEn: 'Kubachi Silver: Medals or Flintlock Locks?',
    descRu: 'Мастера привезли в Ведено 40 фунтов чистого серебра и стали. Они спрашивают: чеканить новые звёзды мудирам или перековать металл на пружины для винтовок?',
    descEn: 'Artisans brought 40 pounds of silver and steel to Vedeno: mint new Mudir stars or forge flintlock springs for mountain rifles?',
    choices: [
      {
        id: 'c1_mint_stars',
        labelRu: 'Отчеканить ордена и раздать отличившимся (-45₽, Авторитет +4%)',
        labelEn: 'Mint medals for valorous officers (-45 rub., Authority +4%)',
        silverDelta: -45,
        authorityDelta: 4,
        allImanDelta: 3,
        delayPreviewRu: '⏳ Через 2 хода: приток добровольцев в гарнизоны (+140 бойцов)',
        delayPreviewEn: '⏳ In 2 turns: surge of volunteers to garrisons (+140 fighters)',
        delayedEffect: {
          delayTurns: 2,
          titleRu: 'Отголосок кубачинской чеканки: приток мюридов',
          titleEn: 'Echo of Kubachi Minting: Murid Volunteers',
          textRu: 'Слава о щедрых серебряных знаках Шамиля привлекла молодых добровольцев в сотенные списки Ведено.',
          textEn: 'Word of Shamil’s silver orders drew young mountain volunteers into Vedeno’s ranks.',
          targetNaibId: 'vedeno',
          garrisonDelta: 140,
          authorityDelta: 3
        }
      },
      {
        id: 'c2_forge_flintlocks',
        labelRu: 'Перековать металл на оружейные замки (+18 пороха, Натиск -4%)',
        labelEn: 'Forge rifle locks & cartridges (+18 powder, Pressure -4%)',
        powderDelta: 18,
        allPressureDelta: -4,
        delayPreviewRu: '⏳ Через 3 хода: кубачинцы попросят льготу по хараджу (-40₽, +22 пороха)',
        delayPreviewEn: '⏳ In 3 turns: Kubachi guild requests tax relief (-40 rub., +22 powder)',
        delayedEffect: {
          delayTurns: 3,
          titleRu: 'Отголосок оружейного заказа Кубачи',
          titleEn: 'Echo of the Kubachi Rifle Order',
          textRu: 'Мастерские поставили вторую партию замков и пороховниц, запросив налоговую льготу из Байт аль-маль.',
          textEn: 'The workshops delivered a second batch of locks & flasks, claiming their promised guild stipend.',
          silverDelta: -40,
          powderDelta: 22
        }
      }
    ]
  },
  {
    id: 'dil_02_pirogov_salty',
    scenarios: ['camp_1847', 'all'],
    triggerType: 'siege_war',
    senderRu: 'Осадный лазарет у Салтов',
    senderEn: 'Siege Lazaretto near Salty',
    portraitHint: 'Пирогов',
    urgencyRu: 'ОСАДА САЛТОВ (1847)',
    urgencyEn: 'SALTY SIEGE (1847)',
    titleRu: 'Эфирные операции хирурга Н. И. Пирогова под Салтами',
    titleEn: 'Surgeon N. I. Pirogov’s Ether Operations at Salty',
    descRu: 'Перебежчик доставил склянки серного эфира и весть о новом способе безболезненных операций в русском лагере. Наши лекари просят перемирия для выноса раненых.',
    descEn: 'A deserter brought vials of surgical ether from the Russian camp. Mountain healers ask for a brief truce to evacuate wounded defenders.',
    choices: [
      {
        id: 'c1_truce_healers',
        labelRu: 'Объявить часовое перемирие и вынести раненых (+120 гарнизон Гергебиля)',
        labelEn: 'Grant a 1-hour truce to evacuate wounded (+120 Gergebil garrison)',
        targetNaibId: 'gergebil',
        garrisonDelta: 120,
        imanDelta: 5,
        delayPreviewRu: '⏳ Через 2 хода: лекари освоят перевязку (Гарнизон +110, Авторитет +4%)',
        delayPreviewEn: '⏳ In 2 turns: mountain healers adopt field triage (+110 garrison, Authority +4%)',
        delayedEffect: {
          delayTurns: 2,
          titleRu: 'Отголосок салтинского лазарета: спасены ветераны',
          titleEn: 'Echo of Salty Lazaretto: Veterans Saved',
          textRu: 'Десятки раненых мюридов вернулись в строй в Гергебиле и Чохе благодаря новому перевязочному уставу.',
          textEn: 'Dozens of wounded murids returned to the walls of Gergebil and Chokh.',
          targetNaibId: 'chokh',
          garrisonDelta: 110,
          authorityDelta: 4
        }
      },
      {
        id: 'c2_night_sapper_strike',
        labelRu: 'Не давать передышки — ночная вылазка на осадные батареи (-10 пороха, враг -280)',
        labelEn: 'Give no respite — night sortie on siege guns (-10 powder, enemy -280)',
        powderDelta: -10,
        damageEnemyBayonets: 280,
        targetNaibId: 'gergebil',
        pressureDelta: -8,
        delayPreviewRu: '⏳ Через 3 хода: осадный корпус удвоит обстрел (+9% Натиск, но Слава +10)',
        delayPreviewEn: '⏳ In 3 turns: siege corps doubles shelling (+9% Pressure, Glory +10)',
        delayedEffect: {
          delayTurns: 3,
          titleRu: 'Ответная канонада осадного корпуса',
          titleEn: 'Retaliatory Siege Bombardment',
          textRu: 'Подтянув свежие пудовые мортиры, осаждающие усилили обстрел каменных башен, но стойкость защитников прославилась по всему Дагестану.',
          textEn: 'Bringing up fresh mortars, the besiegers intensified fire, yet the defenders’ grit won fame across Dagestan.',
          targetNaibId: 'gergebil',
          pressureDelta: 9,
          gloryDelta: 10
        }
      }
    ]
  },
  {
    id: 'dil_03_hadji_murat_tribute',
    scenarios: ['all'],
    triggerType: 'high_ambition',
    senderRu: 'Наиб Хунзаха Хаджи-Мурат',
    senderEn: 'Naib of Khunzakh Hadji Murad',
    portraitHint: 'Хаджи-Мурат',
    urgencyRu: 'ПОЛИТИКА НАИБОВ',
    urgencyEn: 'NAIB POLITICS',
    titleRu: 'Трофейный табун Хаджи-Мурата',
    titleEn: 'Hadji Murad’s Captured Horse Herd',
    descRu: 'После лихого рейда к Темир-Хан-Шуре Хаджи-Мурат оставил лучшую часть коней своей сотне, не сдав пятую долю (хумс) в Байт аль-маль.',
    descEn: 'After a bold raid near Temir-Khan-Shura, Hadji Murad kept the finest horses for his squadron without yielding the treasury fifth (khums).',
    choices: [
      {
        id: 'c1_demand_khums',
        labelRu: 'Потребовать строгий хумс по Низаму (+95₽, Авторитет +5%, Гордыня +9)',
        labelEn: 'Enforce strict Nizam khums (+95 rub., Authority +5%, Pride +9)',
        silverDelta: 95,
        authorityDelta: 5,
        targetNaibId: 'khunzakh',
        prideDelta: 9,
        imanDelta: -3,
        delayPreviewRu: '⏳ Через 3 хода: Хаджи-Мурат оспорит приказ (Амбиции +10, но казна +60₽)',
        delayPreviewEn: '⏳ In 3 turns: Hadji Murad chafes under audit (Ambition +10, treasury +60 rub.)',
        delayedEffect: {
          delayTurns: 3,
          titleRu: 'Отголосок ревизии в Хунзахе',
          titleEn: 'Echo of the Khunzakh Audit',
          textRu: 'Другие наибы исправно внесли хумс (+60₽), но обида Хаджи-Мурата усилила его честолюбие.',
          textEn: 'Other Naibs promptly paid their khums (+60 rub.), yet Hadji Murad’s resentment deepened.',
          targetNaibId: 'khunzakh',
          silverDelta: 60,
          ambitionDelta: 10,
          loyaltyDelta: -6
        }
      },
      {
        id: 'c2_grant_horses',
        labelRu: 'Оставить коней сотне в награду за отвагу (Иман +8, Гордыня -6, Авторитет -3%)',
        labelEn: 'Leave the horses to his riders as reward (Iman +8, Pride -6, Auth -3%)',
        authorityDelta: -3,
        targetNaibId: 'khunzakh',
        imanDelta: 8,
        prideDelta: -6,
        delayPreviewRu: '⏳ Через 2 хода: конница Хунзаха совершит дерзкий перехват (Натиск -9%, Провиант +110)',
        delayPreviewEn: '⏳ In 2 turns: Khunzakh cavalry raids enemy supply (Pressure -9%, Prov +110)',
        delayedEffect: {
          delayTurns: 2,
          titleRu: 'Отголосок щедрости: лихой налёт хунзахцев',
          titleEn: 'Echo of Generosity: Khunzakh Raid',
          textRu: 'Свежие скакуны позволили мюридам Хаджи-Мурата захватить фуражный обоз без потерь.',
          textEn: 'Fresh mounts let Hadji Murad’s riders capture a forage convoy without losses.',
          targetNaibId: 'khunzakh',
          pressureDelta: -9,
          provisionsDelta: 110,
          gloryDelta: 8
        }
      }
    ]
  },
  {
    id: 'dil_04_chokh_countermine',
    scenarios: ['camp_1847', 'all'],
    triggerType: 'siege_war',
    senderRu: 'Инженер Хаджи-Юсуф Сафаров',
    senderEn: 'Chief Engineer Hajji Yusuf Safarov',
    portraitHint: 'Хаджи-Юсуф',
    urgencyRu: 'МИННАЯ ВОЙНА (1849)',
    urgencyEn: 'MINE WARFARE (1849)',
    titleRu: 'Подземные мины под стенами Чоха',
    titleEn: 'Subterranean Mines Beneath Chokh’s Walls',
    descRu: 'Караульные слышат глухой стук кирок под южной башней Чоха — сапёры Аргутинского ведут подкоп. Нужно либо заложить контрмину, либо пробить обводную траншею.',
    descEn: 'Sentries hear picks beneath Chokh’s south tower—Argutinsky’s sappers are tunneling. Lay a counter-mine or dig a cutoff trench?',
    choices: [
      {
        id: 'c1_countermine',
        labelRu: 'Заложить 18 пудов пороха в контрмину (-18 пороха, Натиск Чоха -12%)',
        labelEn: 'Pack 18 poods into a counter-mine (-18 powder, Chokh Pressure -12%)',
        powderDelta: -18,
        targetNaibId: 'chokh',
        pressureDelta: -12,
        delayPreviewRu: '⏳ Через 2 хода: обрушение галереи сорвёт штурм (Натиск -10%, Слава +12)',
        delayPreviewEn: '⏳ In 2 turns: collapsed tunnel halts assault (Pressure -10%, Glory +12)',
        delayedEffect: {
          delayTurns: 2,
          titleRu: 'Взрыв контрмины под Чохом!',
          titleEn: 'Counter-Mine Detonation at Chokh!',
          textRu: 'Подземная галерея осаждающих рухнула! Потрясённые сапёры отведены от стен Чоха.',
          textEn: 'The besiegers’ sapper gallery collapsed, forcing a withdrawal from Chokh’s walls.',
          targetNaibId: 'chokh',
          pressureDelta: -10,
          gloryDelta: 12,
          authorityDelta: 4
        }
      },
      {
        id: 'c2_inner_retrenchment',
        labelRu: 'Возвести вторую каменную линию внутри аула (-65₽, Гарнизон +90)',
        labelEn: 'Build an inner stone retrenchment (-65 rub., Garrison +90)',
        silverDelta: -65,
        targetNaibId: 'chokh',
        garrisonDelta: 90,
        delayPreviewRu: '⏳ Через 3 хода: внешняя башня падёт, но аул устоит (+6% Натиск, +14 пороха сбережено)',
        delayPreviewEn: '⏳ In 3 turns: outer wall falls, inner citadel holds (+6% Pressure, +14 powder saved)',
        delayedEffect: {
          delayTurns: 3,
          titleRu: 'Стойкость внутреннего пояса Чоха',
          titleEn: 'Chokh’s Inner Retrenchment Holds',
          textRu: 'Вражеская мина обрушила внешний угол, но мюриды встретили штурм за новой каменной стеной, сберегая порох.',
          textEn: 'The enemy mine breached the outer corner, yet defenders held the inner wall and conserved powder.',
          targetNaibId: 'chokh',
          pressureDelta: 6,
          powderDelta: 14,
          loyaltyDelta: 7
        }
      }
    ]
  },
  {
    id: 'dil_05_akhulgo_bridge',
    scenarios: ['camp_1839', 'all'],
    triggerType: 'besieged',
    senderRu: 'Гарнизон Сурхаевой башни',
    senderEn: 'Surkhay’s Tower Garrison',
    portraitHint: 'Байсунгур',
    urgencyRu: 'ОСАДА АХУЛЬГО (1839)',
    urgencyEn: 'AKHULGO SIEGE (1839)',
    titleRu: 'Переправа через Андийское Койсу под огнём',
    titleEn: 'Andi Koisu Crossing Under Fire',
    descRu: 'Понтоны ген. Граббе наведены у подножия скалы. Если сжечь мост ночью, мы потеряем собственный путь подвоза воды и провианта с правого берега.',
    descEn: 'Gen. Grabbe’s pontoons span the river below the cliff. Burning the bridge halts assault columns—but severs our own supply trail.',
    choices: [
      {
        id: 'c1_burn_bridge',
        labelRu: 'Сжечь переправу смоляными плотами (-90 провианта, Натиск -14%)',
        labelEn: 'Torch the bridge with pitch rafts (-90 prov., Pressure -14%)',
        provisionsDelta: -90,
        targetNaibId: 'karata',
        pressureDelta: -14,
        delayPreviewRu: '⏳ Через 2 хода: нехватка воды в ущелье (-110 пров., но Авторитет +6%)',
        delayPreviewEn: '⏳ In 2 turns: water shortage in gorge (-110 prov., Authority +6%)',
        delayedEffect: {
          delayTurns: 2,
          titleRu: 'Отголосок сожжённого моста на Койсу',
          titleEn: 'Echo of the Burned Koisu Bridge',
          textRu: 'Штурм сорван на две недели, однако осаждённым приходится спускать бурдюки к реке на верёвках под обстрелом.',
          textEn: 'The storming stalled for two weeks, though defenders must haul water up the cliffs by rope.',
          provisionsDelta: -110,
          authorityDelta: 6,
          targetNaibId: 'karata',
          gloryDelta: 10
        }
      },
      {
        id: 'c2_ambush_pontoons',
        labelRu: 'Оставить мост как ловушку для егерей (-12 пороха, враг -240)',
        labelEn: 'Leave the bridge as an ambush trap (-12 powder, enemy -240)',
        powderDelta: -12,
        damageEnemyBayonets: 240,
        delayPreviewRu: '⏳ Через 2 хода: ночной прорыв обоза принесёт зерно (+160 провианта, Натиск +5%)',
        delayPreviewEn: '⏳ In 2 turns: night mule train brings grain (+160 prov., Pressure +5%)',
        delayedEffect: {
          delayTurns: 2,
          titleRu: 'Ночной караван через уцелевший брод',
          titleEn: 'Night Caravan Across the Intact Ford',
          textRu: 'Горцы провели мулов с мукой по тайной тропе у переправы, хотя передовые роты врага закрепились ближе к скале.',
          textEn: 'Highlanders smuggled flour across the ford while enemy pickets edged closer.',
          provisionsDelta: 160,
          targetNaibId: 'karata',
          pressureDelta: 5
        }
      }
    ]
  },
  {
    id: 'dil_06_dargo_biscuit_trail',
    scenarios: ['camp_1845', 'all'],
    triggerType: 'general',
    senderRu: 'Дозор на хребте Речель',
    senderEn: 'Rechel Ridge Lookout',
    portraitHint: 'Байсунгур',
    urgencyRu: 'ДАРГО (1845)',
    urgencyEn: 'DARGO (1845)',
    titleRu: 'Сухарный транспорт кн. Воронцова в буковом лесу',
    titleEn: 'Vorontsov’s Biscuit Convoy in the Beech Forest',
    descRu: 'Три тысячи солдат с сухарными вьюками втянулись в узкую просеку у Дарго. Можно разграбить вьюки сейчас или поджечь валы, заперев всю колонну.',
    descEn: 'Three thousand troops with biscuit packs entered the narrow Dargo clearing. Loot the packs now or ignite felled abatis to trap the whole column?',
    choices: [
      {
        id: 'c1_seize_biscuits',
        labelRu: 'Захватить вьюки с сухарями и порохом (+180 пров., +14 пороха)',
        labelEn: 'Seize biscuit & ammunition packs (+180 prov., +14 powder)',
        provisionsDelta: 180,
        powderDelta: 14,
        targetNaibId: 'benoy',
        delayPreviewRu: '⏳ Через 2 хода: обозный прорыв окрылит Беной (Слава +10, Серебро +70₽)',
        delayPreviewEn: '⏳ In 2 turns: convoy raid emboldens Benoy (Glory +10, Silver +70 rub.)',
        delayedEffect: {
          delayTurns: 2,
          titleRu: 'Трофеи «Сухарной экспедиции» дошли до аулов',
          titleEn: 'Spoils of the Biscuit Expedition Reach the Auls',
          textRu: 'Трофейные ящики и офицерское снаряжение пополнили казну Байт аль-маль и прославили мюридов Ичкерии.',
          textEn: 'Captured chests and officer gear enriched Bayt al-Mal and glorified Ichkeria’s murids.',
          silverDelta: 70,
          targetNaibId: 'benoy',
          gloryDelta: 10
        }
      },
      {
        id: 'c2_seal_forest_trap',
        labelRu: 'Завалить обратный путь буками и запереть колонну (-10 пороха, Натиск -10%)',
        labelEn: 'Seal the retreat with felled beeches (-10 powder, Pressure -10%)',
        powderDelta: -10,
        allPressureDelta: -6,
        targetNaibId: 'vedeno',
        pressureDelta: -10,
        delayPreviewRu: '⏳ Через 3 хода: измотанная колонна бросит 2 горные пушки (+24 пороха, Авторитет +6%)',
        delayPreviewEn: '⏳ In 3 turns: exhausted column abandons 2 guns (+24 powder, Authority +6%)',
        delayedEffect: {
          delayTurns: 3,
          titleRu: 'Отголосок лесного мешка: брошенная артиллерия!',
          titleEn: 'Echo of the Forest Trap: Abandoned Guns!',
          textRu: 'При отступлении к Герзель-аулу арьергард бросил зарядные ящики и лафеты в овраге — всё досталось Ведено.',
          textEn: 'Retreating toward Gerzel-Aul, the rearguard abandoned limbers and powder chests in the ravine.',
          powderDelta: 24,
          authorityDelta: 6,
          allPressureDelta: -5
        }
      }
    ]
  },
  {
    id: 'dil_07_felt_shame_tribunal',
    scenarios: ['all'],
    triggerType: 'politics',
    senderRu: 'Верховный суд мухтасибов',
    senderEn: 'Supreme Muhtasib Tribunal',
    portraitHint: 'Шамиль',
    urgencyRu: 'НИЗАМ И ДИСЦИПЛИНА',
    urgencyEn: 'NIZAM & DISCIPLINE',
    titleRu: 'Сотня, дрогнувшая у кордонной речки',
    titleEn: 'The Squadron That Wavered at the Cordon',
    descRu: 'Пятнадцать всадников из округа Шали отошли без приказа при залпе конной батареи. Мухтасибы требуют пришить им на спину войлочные знаки позора.',
    descEn: 'Fifteen riders from Shali pulled back without orders under horse-artillery fire. Muhtasibs demand sewing the Felt Badge of Shame onto their backs.',
    choices: [
      {
        id: 'c1_sew_felt_badge',
        labelRu: 'Пришить войлочный знак позора по Низаму (Авторитет +5%, Гордыня Шали -12)',
        labelEn: 'Sew the Felt Badge of Shame per Nizam (Auth +5%, Shali Pride -12)',
        authorityDelta: 5,
        targetNaibId: 'shali',
        prideDelta: -12,
        imanDelta: -4,
        delayPreviewRu: '⏳ Через 2 хода: опозоренные всадники искупят вину в бою (Натиск -9%, Слава +9)',
        delayPreviewEn: '⏳ In 2 turns: shamed riders redeem themselves in battle (Pressure -9%, Glory +9)',
        delayedEffect: {
          delayTurns: 2,
          titleRu: 'Искупление войлочного знака под Шали!',
          titleEn: 'Redemption of the Felt Badge near Shali!',
          textRu: 'Желая снять позорный войлок со спины, пятнадцать всадников первыми ворвались на вражеский редут и вернули честь.',
          textEn: 'Burning to shed the felt patch, the fifteen riders led a night assault and reclaimed their honor.',
          targetNaibId: 'shali',
          pressureDelta: -9,
          gloryDelta: 9,
          imanDelta: 6
        }
      },
      {
        id: 'c2_mercy_oath',
        labelRu: 'Простить под клятвой на Коране и отправить в дозор (Иман +6, Авторитет -2%)',
        labelEn: 'Pardon on Quran oath & assign to picket duty (Iman +6, Auth -2%)',
        authorityDelta: -2,
        targetNaibId: 'shali',
        imanDelta: 6,
        delayPreviewRu: '⏳ Через 3 хода: благодарные дозорные раскроют обходную тропу (+15 пороха, Верность +8)',
        delayPreviewEn: '⏳ In 3 turns: grateful scouts uncover a flanking trail (+15 powder, Loyalty +8)',
        delayedEffect: {
          delayTurns: 3,
          titleRu: 'Благодарность прощённой сотни',
          titleEn: 'Gratitude of the Pardoned Squadron',
          textRu: 'Неся бессменный дозор в лесах Шали, всадники перехватили вьючный транспорт с порохом.',
          textEn: 'Keeping tireless watch in Shali’s woods, the riders intercepted a pack train of powder.',
          targetNaibId: 'shali',
          powderDelta: 15,
          loyaltyDelta: 8
        }
      }
    ]
  },
  {
    id: 'dil_08_trabzon_felucca',
    scenarios: ['all'],
    triggerType: 'ottoman',
    senderRu: 'Наиб Мухаммад-Амин (Черкесия)',
    senderEn: 'Naib Muhammad-Amin (Circassia)',
    portraitHint: 'Мухаммад-Амин',
    urgencyRu: 'МОРСКОЙ КАНАЛ ПОРТЫ',
    urgencyEn: 'PORTE MARITIME CHANNEL',
    titleRu: 'Фелюга из Трабзона в штормовой бухте',
    titleEn: 'Trabzon Felucca in a Storm-Swept Cove',
    descRu: 'Крейсеры блокируют берег, но турецкий шкипер готов прорваться сквозь туман с грузом английского пороха за двойной задаток.',
    descEn: 'Cruisers patrol the coast, yet a Turkish skipper offers to run the fog blockade with English rifle powder for double payment.',
    choices: [
      {
        id: 'c1_pay_double',
        labelRu: 'Выплатить двойной задаток (-90₽, Порта +6%)',
        labelEn: 'Pay double retainer (-90 rub., Porte +6%)',
        silverDelta: -90,
        ottomanDelta: 6,
        delayPreviewRu: '⏳ Через 3 хода: караван с берега доставит +38 пудов английского пороха',
        delayPreviewEn: '⏳ In 3 turns: coastal pack train delivers +38 poods English powder',
        delayedEffect: {
          delayTurns: 3,
          titleRu: 'Прибытие трабзонского пороха в Ведено!',
          titleEn: 'Trabzon Rifle Powder Arrives in Vedeno!',
          textRu: 'Вьючный караван через перевалы доставил бочонки мелкозернистого английского пороха прямо в арсенал.',
          textEn: 'Mule trains over the passes delivered kegs of fine English powder straight to the arsenal.',
          powderDelta: 38,
          authorityDelta: 3
        }
      },
      {
        id: 'c2_send_letters_only',
        labelRu: 'Ограничиться тайной депешей в Стамбул (-25₽, Порта +8%)',
        labelEn: 'Send coded dispatches to Istanbul only (-25 rub., Porte +8%)',
        silverDelta: -25,
        ottomanDelta: 8,
        delayPreviewRu: '⏳ Через 4 хода: отклик из Стамбула (+110₽ субсидии, Авторитет +4%)',
        delayPreviewEn: '⏳ In 4 turns: Istanbul court envoy sends +110 rub. subsidy & Authority +4%',
        delayedEffect: {
          delayTurns: 4,
          titleRu: 'Ответный фирман и казённая помощь из Стамбула',
          titleEn: 'Return Firman & Subsidies from Istanbul',
          textRu: 'Тайные сторонники при дворе султана переправили вексель на серебро и латунные капсюли.',
          textEn: 'Secret sympathizers at the Sultan’s court forwarded silver drafts and percussion caps.',
          silverDelta: 110,
          authorityDelta: 4
        }
      }
    ]
  },
  {
    id: 'dil_09_vedeno_sulfur_vein',
    scenarios: ['all'],
    triggerType: 'low_powder',
    senderRu: 'Устаз Джабраил (Ведено)',
    senderEn: 'Ustaz Jabrail (Vedeno)',
    portraitHint: 'Хаджи-Юсуф',
    urgencyRu: 'ПОРОХОВЫЕ МЕЛЬНИЦЫ',
    urgencyEn: 'POWDER MILLS',
    titleRu: 'Серные копи в горах Анди и риск взрыва',
    titleEn: 'Andi Sulfur Veins & Mill Explosion Risk',
    descRu: 'Пороховые мельницы Ведено работают без остановки. Устаз Джабраил может ускорить сушку на жаровнях ради срочного выпуска пороха, но искры опасны.',
    descEn: 'Vedeno’s powder mills run day and night. Ustaz Jabrail can speed drying over braziers for immediate powder, risking an ignition.',
    choices: [
      {
        id: 'c1_rush_braziers',
        labelRu: 'Форсировать сушку пороха (+28 пороха немедленно)',
        labelEn: 'Force rapid brazier drying (+28 powder immediately)',
        powderDelta: 28,
        delayPreviewRu: '⏳ Через 2 хода: риск пожара сушильни (-55₽ на ремонт, -8 пороха)',
        delayPreviewEn: '⏳ In 2 turns: drying-shed scorch (-55 rub. repairs, -8 powder)',
        delayedEffect: {
          delayTurns: 2,
          titleRu: 'Пожар на одной из сушилен Ведено',
          titleEn: 'Scorch Fire in a Vedeno Drying Shed',
          textRu: 'Искра воспламенила часть серной смеси — мастера спасли мельницу, но ремонт потребовал 55 руб.',
          textEn: 'A stray spark ignited sulfur trays; artisans saved the mill but repairs cost 55 rub.',
          silverDelta: -55,
          powderDelta: -8
        }
      },
      {
        id: 'c2_build_waterwheel',
        labelRu: 'Построить водяной привод и отвести ручей (-60₽)',
        labelEn: 'Build a safe waterwheel sluice (-60 rub.)',
        silverDelta: -60,
        delayPreviewRu: '⏳ Через 3 хода: безопасная мельница выдаст +36 пудов отборного пороха',
        delayPreviewEn: '⏳ In 3 turns: safe watermill yields +36 poods prime powder',
        delayedEffect: {
          delayTurns: 3,
          titleRu: 'Пуск новой водяной пороховой мельницы!',
          titleEn: 'New Water-Powered Powder Mill Online!',
          textRu: 'Безопасный водяной привод удвоил помол селитры — арсенал Ведено получил 36 пудов лучшего пороха.',
          textEn: 'The new waterwheel doubled saltpeter milling, adding 36 poods of prime powder.',
          powderDelta: 36,
          authorityDelta: 3
        }
      }
    ]
  },
  {
    id: 'dil_10_winter_flocks',
    scenarios: ['all'],
    triggerType: 'winter',
    senderRu: 'Старейшины Андалала и Гуниба',
    senderEn: 'Elders of Andalal & Gunib',
    portraitHint: 'Джамалуддин',
    urgencyRu: 'ЗИМНИЙ ПЕРЕВАЛ',
    urgencyEn: 'WINTER PASS',
    titleRu: 'Отары в снежном плену на летних пастбищах',
    titleEn: 'Snowbound Flocks on High Pastures',
    descRu: 'Ранний буран засыпал тропы к зимним кутанам. Чтобы спасти отары, нужны конные сотни — но их снятие оголит передовые посты на одну луну.',
    descEn: 'An early blizzard buried trails to winter pastures. Saving the flocks requires cavalry detachments, briefly thinning forward pickets.',
    choices: [
      {
        id: 'c1_rescue_flocks',
        labelRu: 'Послать сотни пробить тропу к отарам (Натиск Гуниба +5%, Иман +6)',
        labelEn: 'Send cavalry to break trail for flocks (Gunib Pressure +5%, Iman +6)',
        targetNaibId: 'gunib',
        pressureDelta: 5,
        imanDelta: 6,
        delayPreviewRu: '⏳ Через 2 хода: спасённые отары накормят армию (+240 провианта, Верность +8)',
        delayPreviewEn: '⏳ In 2 turns: rescued flocks feed the army (+240 prov., Loyalty +8)',
        delayedEffect: {
          delayTurns: 2,
          titleRu: 'Спасённые отары пригнали в зимние аулы!',
          titleEn: 'Rescued Flocks Reach Winter Auls!',
          textRu: 'Джамааты Андалала передали Имамату щедрую долю баранины и сыра (+240 провианта).',
          textEn: 'Andalal jamaats gifted ample mutton and cheese to the army stores (+240 provisions).',
          provisionsDelta: 240,
          targetNaibId: 'gunib',
          loyaltyDelta: 8
        }
      },
      {
        id: 'c2_hold_cordons',
        labelRu: 'Оставить сотни на кордоне, выдав аулам зерно (-110 пров., Натиск -6%)',
        labelEn: 'Keep pickets manned & issue grain relief (-110 prov., Pressure -6%)',
        provisionsDelta: -110,
        targetNaibId: 'gunib',
        pressureDelta: -6,
        delayPreviewRu: '⏳ Через 3 хода: крепкие караулы сорвут зимний набег (Натиск всех -4%, Авторитет +3%)',
        delayPreviewEn: '⏳ In 3 turns: intact pickets thwart a winter raid (All Pressure -4%, Auth +3%)',
        delayedEffect: {
          delayTurns: 3,
          titleRu: 'Зимний кордон выстоял без брешей',
          titleEn: 'Winter Cordon Held Firm',
          textRu: 'Непрерывная охрана перевалов сорвала скрытый рейд линейных казаков.',
          textEn: 'Unbroken pass guards foiled a covert winter Cossack probe.',
          allPressureDelta: -4,
          authorityDelta: 3
        }
      }
    ]
  },
  {
    id: 'dil_11_cossack_gunsmiths',
    scenarios: ['all'],
    triggerType: 'low_powder',
    senderRu: 'Начальник артиллерии Ведено',
    senderEn: 'Vedeno Artillery Chief',
    portraitHint: 'Хаджи-Юсуф',
    urgencyRu: 'ЛИТЕЙНЫЙ ДВОР',
    urgencyEn: 'CANNON FOUNDRY',
    titleRu: 'Беглые артиллеристы и колокольная бронза',
    titleEn: 'Defector Gunners & Bell Bronze',
    descRu: 'Трое опытных бомбардиров-перебежчиков предлагают отлить два горных единорога и обучить расчёты, если им пожалуют дома и жалованье в Ведено.',
    descEn: 'Three veteran defector bombardiers offer to cast two mountain unicorns and train crews in return for houses and stipends in Vedeno.',
    choices: [
      {
        id: 'c1_settle_gunners',
        labelRu: 'Даровать слободу и жалованье (-80₽, Авторитет -2%)',
        labelEn: 'Grant quarters and stipends (-80 rub., Authority -2%)',
        silverDelta: -80,
        authorityDelta: -2,
        delayPreviewRu: '⏳ Через 3 хода: отлиты 2 горные пушки (Гарнизон Ведено +130, Натиск всех -6%)',
        delayPreviewEn: '⏳ In 3 turns: 2 mountain guns cast (+130 Vedeno garrison, All Pressure -6%)',
        delayedEffect: {
          delayTurns: 3,
          titleRu: 'Первые залпы новой горной батареи Ведено!',
          titleEn: 'First Salvos of Vedeno’s New Mountain Battery!',
          textRu: 'Отлитые единороги успешно прошли пробы и прикрыли подступы к столице.',
          textEn: 'The newly cast unicorns passed firing trials and now guard the capital’s approaches.',
          targetNaibId: 'vedeno',
          garrisonDelta: 130,
          allPressureDelta: -6,
          authorityDelta: 5
        }
      },
      {
        id: 'c2_reject_foreigners',
        labelRu: 'Положиться только на горских кузнецов (Иман всех +4, +40₽)',
        labelEn: 'Rely solely on highland smiths (All Iman +4, +40 rub.)',
        allImanDelta: 4,
        silverDelta: 40,
        delayPreviewRu: '⏳ Через 2 хода: горские мастера наладят ремонт ружей (+16 пороха)',
        delayPreviewEn: '⏳ In 2 turns: highland smiths expand rifle repair (+16 powder)',
        delayedEffect: {
          delayTurns: 2,
          titleRu: 'Артель горских оружейников в Ведено',
          titleEn: 'Highland Gunsmith Guild in Vedeno',
          textRu: 'Местные мастера расширили ремонт трофейных штуцеров и ускорили набивку газырей.',
          textEn: 'Local smiths expanded repair of captured rifles and cartridge rolling.',
          powderDelta: 16
        }
      }
    ]
  },
  {
    id: 'dil_12_baysungur_khasavyurt',
    scenarios: ['camp_1845', 'camp_1847', 'all'],
    triggerType: 'general',
    senderRu: 'Байсунгур Беноевский',
    senderEn: 'Baysungur of Benoy',
    portraitHint: 'Байсунгур',
    urgencyRu: 'ДЕРЗКИЙ РЕЙД',
    urgencyEn: 'DARING RAID',
    titleRu: 'Ночной прорыв Байсунгура к Хасавюрту',
    titleEn: 'Baysungur’s Night Thrust Toward Khasavyurt',
    descRu: 'Байсунгур просит благословения на молниеносный набег на тыловые склады провианта за линией укреплений. Риск велик, но добыча спасёт Ичкерию.',
    descEn: 'Baysungur seeks blessing for a lightning raid on rear supply depots beyond the forts. High risk, yet the haul could feed Ichkeria.',
    choices: [
      {
        id: 'c1_bless_raid',
        labelRu: 'Благословить набег (-14 пороха, Слава Беноя +8)',
        labelEn: 'Bless the raid (-14 powder, Benoy Glory +8)',
        powderDelta: -14,
        targetNaibId: 'benoy',
        imanDelta: 5,
        delayPreviewRu: '⏳ Через 2 хода: возвращение с трофейным обозом (+210 пров., +95₽, Натиск +4%)',
        delayPreviewEn: '⏳ In 2 turns: raid returns with loot (+210 prov., +95 rub., Pressure +4%)',
        delayedEffect: {
          delayTurns: 2,
          titleRu: 'Триумфальное возвращение сотни Байсунгура!',
          titleEn: 'Triumphant Return of Baysungur’s Squadron!',
          textRu: 'Беноевцы пригнали обоз с мукой и казённым серебром; кордон ответил тревогой, но слава набега облетела горы.',
          textEn: 'Benoy riders brought back flour and silver; the cordon sounded alarms while the raid’s fame soared.',
          provisionsDelta: 210,
          silverDelta: 95,
          targetNaibId: 'benoy',
          pressureDelta: 4,
          gloryDelta: 12
        }
      },
      {
        id: 'c2_fortify_benoy',
        labelRu: 'Приказать укрепить лесные засеки Беноя (Натиск Беноя -8%, Гордыня +4)',
        labelEn: 'Order Benoy’s forest abatis reinforced (Pressure -8%, Pride +4)',
        targetNaibId: 'benoy',
        pressureDelta: -8,
        prideDelta: 4,
        delayPreviewRu: '⏳ Через 3 хода: неприступные завалы остановят карателей (Гарнизон +95)',
        delayPreviewEn: '⏳ In 3 turns: fortified abatis stop raiders (+95 garrison)',
        delayedEffect: {
          delayTurns: 3,
          titleRu: 'Буковые засеки Беноя выдержали разведку боем',
          titleEn: 'Benoy Beech Abatis Repel Reconnaissance-in-Force',
          textRu: 'Вражеский авангард увяз в двойных завалах и отошёл с потерями.',
          textEn: 'Enemy scouts bogged down in the double abatis and pulled back.',
          targetNaibId: 'benoy',
          garrisonDelta: 95,
          pressureDelta: -6
        }
      }
    ]
  },
  {
    id: 'dil_13_kalym_edict',
    scenarios: ['all'],
    triggerType: 'politics',
    senderRu: 'Учёные-алимы Согратля',
    senderEn: 'Scholars of Sogratl',
    portraitHint: 'Джамалуддин',
    urgencyRu: 'НИЗАМ О КАЛЫМЕ',
    urgencyEn: 'KALYMNIZAM',
    titleRu: 'Спор знатных тухумов об ограничении калыма',
    titleEn: 'Noble Clans Dispute the Kalym Cap',
    descRu: 'Указ Имама ограничил выкуп за невесту 20 рублями, чтобы бедные мюриды могли создавать семьи. Старейшины богатых аулов Телетля просят отсрочки.',
    descEn: 'The Imam’s edict capped bride-price at 20 rubles so poor murids could wed. Wealthy elders in Teletl petition for a suspension.',
    choices: [
      {
        id: 'c1_enforce_kalym_cap',
        labelRu: 'Не отступать от Низама — закон равен для всех (Авторитет +5%, Гордыня Телетля +7)',
        labelEn: 'Hold firm on the Nizam — one law for all (Auth +5%, Teletl Pride +7)',
        authorityDelta: 5,
        targetNaibId: 'teletl',
        prideDelta: 7,
        delayPreviewRu: '⏳ Через 3 хода: рост числа молодых семей и ополчения (+130 гарнизон Телетля, Иман +6)',
        delayPreviewEn: '⏳ In 3 turns: surge in young households & militia (+130 Teletl garrison, Iman +6)',
        delayedEffect: {
          delayTurns: 3,
          titleRu: 'Плоды Низама о калыме в Аварии',
          titleEn: 'Fruits of the Kalym Reform in Avaria',
          textRu: 'Десятки молодых горцев обрели семьи и с новым рвением встали в ополчение Имамата.',
          textEn: 'Dozens of young highlanders married and rallied eagerly to the Imamate banners.',
          targetNaibId: 'teletl',
          garrisonDelta: 130,
          imanDelta: 6
        }
      },
      {
        id: 'c2_compromise_elders',
        labelRu: 'Даровать отсрочку в обмен на взнос в казну (+85₽, Авторитет -3%)',
        labelEn: 'Grant deferral for a treasury contribution (+85 rub., Auth -3%)',
        silverDelta: 85,
        authorityDelta: -3,
        targetNaibId: 'teletl',
        prideDelta: -5,
        delayPreviewRu: '⏳ Через 2 хода: знать Телетля укрепит верность (Верность +9, Провиант +90)',
        delayPreviewEn: '⏳ In 2 turns: Teletl notables bolster loyalty (Loyalty +9, Prov +90)',
        delayedEffect: {
          delayTurns: 2,
          titleRu: 'Дары старейшин Телетля Диван-хане',
          titleEn: 'Teletl Elders’ Tribute to Divan-Khana',
          textRu: 'Удовлетворённые гибкостью Имама, старейшины прислали подводы с зерном.',
          textEn: 'Pleased by the Imam’s pragmatism, elders dispatched grain wagons.',
          targetNaibId: 'teletl',
          loyaltyDelta: 9,
          provisionsDelta: 90
        }
      }
    ]
  },
  {
    id: 'dil_14_widows_pension',
    scenarios: ['all'],
    triggerType: 'provisions',
    senderRu: 'Казначей Хаджияв',
    senderEn: 'Treasurer Hajjiyav',
    portraitHint: 'Шамиль',
    urgencyRu: 'БАЙТ АЛЬ-МАЛЬ',
    urgencyEn: 'BAYT AL-MAL',
    titleRu: 'Пайки семьям павших мюридов из Байт аль-маль',
    titleEn: 'Bayt al-Mal Rations for Fallen Murids’ Families',
    descRu: 'После летних боёв сотни вдов и сирот нуждаются в зерне из государственной казны. Выдача сократит военный запас, но укрепит дух всех сотен.',
    descEn: 'After summer fighting, hundreds of widows and orphans need grain from state stores. Issuing rations trims reserves but uplifts morale.',
    choices: [
      {
        id: 'c1_issue_pensions',
        labelRu: 'Выдать полные пайки семьям шахидов (-130 пров., -45₽, Авторитет +6%)',
        labelEn: 'Issue full family rations (-130 prov., -45 rub., Auth +6%)',
        provisionsDelta: -130,
        silverDelta: -45,
        authorityDelta: 6,
        allImanDelta: 5,
        delayPreviewRu: '⏳ Через 2 хода: нерушимая стойкость гарнизонов (Верность всех +7, Натиск -5%)',
        delayPreviewEn: '⏳ In 2 turns: unshakable morale across garrisons (Loyalty +7, Pressure -5%)',
        delayedEffect: {
          delayTurns: 2,
          titleRu: 'Благодарность аулов: Имамат своих не бросает',
          titleEn: 'Gratitude of the Auls: The Imamate Protects Its Own',
          textRu: 'Зная, что их семьи под защитой Байт аль-маль, мюриды держат оборону с удвоенным упорством.',
          textEn: 'Knowing their families are cared for by Bayt al-Mal, murids hold the heights with redoubled resolve.',
          allPressureDelta: -5,
          allImanDelta: 4,
          authorityDelta: 4
        }
      },
      {
        id: 'c2_local_zakat',
        labelRu: 'Переложить заботу на местный закят аулов (+40₽, Авторитет -3%)',
        labelEn: 'Shift care onto local aul zakat (+40 rub., Authority -3%)',
        silverDelta: 40,
        authorityDelta: -3,
        delayPreviewRu: '⏳ Через 3 хода: ропот в бедных округах (Иман -4, но сбережено +110 пров.)',
        delayPreviewEn: '⏳ In 3 turns: grumbling in poor districts (Iman -4, +110 prov. saved)',
        delayedEffect: {
          delayTurns: 3,
          titleRu: 'Экономия армейских амбаров ценой ропота',
          titleEn: 'Army Granaries Saved at a Cost in Morale',
          textRu: 'Запасы в Ведено сохранены (+110 пров.), но часть бедных джамаатов сетует на тяжесть поборов.',
          textEn: 'Vedeno stores stayed intact (+110 prov.), though poor villages murmur over local levies.',
          provisionsDelta: 110,
          allImanDelta: -4
        }
      }
    ]
  },
  {
    id: 'dil_15_salty_orchard_water',
    scenarios: ['camp_1847', 'all'],
    triggerType: 'siege_war',
    senderRu: 'Комендант Салтов Идрис',
    senderEn: 'Salty Commandant Idris',
    portraitHint: 'Кибит-Магома',
    urgencyRu: 'ОСАДА САЛТОВ (1847)',
    urgencyEn: 'SALTY SIEGE (1847)',
    titleRu: 'Салтинские сады и родник под мортирным огнём',
    titleEn: 'Salty Orchards & Spring Under Mortar Fire',
    descRu: 'Русские батареи пристреляли единственный родник в салтинском овраге. Можно вырыть крытый ход из саклей или совершить вылазку на передовую траншею.',
    descEn: 'Russian batteries zeroed in on Salty’s sole ravine spring. Dig a roofed trench from the saklyas or raid the forward parallel?',
    choices: [
      {
        id: 'c1_roofed_trench',
        labelRu: 'Проложить крытый каменный ход к воде (-55₽, Натиск Гергебиля -6%)',
        labelEn: 'Build a stone-roofed water gallery (-55 rub., Gergebil Pressure -6%)',
        silverDelta: -55,
        targetNaibId: 'gergebil',
        pressureDelta: -6,
        delayPreviewRu: '⏳ Через 2 хода: осада затянется в нашу пользу (+130 пров., Натиск -7%)',
        delayPreviewEn: '⏳ In 2 turns: prolonged siege favors defenders (+130 prov., Pressure -7%)',
        delayedEffect: {
          delayTurns: 2,
          titleRu: 'Салтинский родник спасён крытой галереей!',
          titleEn: 'Salty Spring Secured by Roofed Gallery!',
          textRu: 'Обеспеченный водой гарнизон отбил три штурма подряд; осаждающие теряют драгоценные недели осени.',
          textEn: 'Water secured, the garrison repelled three straight assaults as autumn storms closed in.',
          provisionsDelta: 130,
          targetNaibId: 'gergebil',
          pressureDelta: -7,
          gloryDelta: 9
        }
      },
      {
        id: 'c2_raid_parallel',
        labelRu: 'Ударить кинжалами по передовой траншее (-10 пороха, враг -260)',
        labelEn: 'Dagger raid on the forward trench (-10 powder, enemy -260)',
        powderDelta: -10,
        damageEnemyBayonets: 260,
        delayPreviewRu: '⏳ Через 3 хода: трофейные кирки и порох (+20 пороха, Гарнизон -55)',
        delayPreviewEn: '⏳ In 3 turns: captured tools & powder (+20 powder, Garrison -55)',
        delayedEffect: {
          delayTurns: 3,
          titleRu: 'Трофеи ночной рукопашной у Салтов',
          titleEn: 'Spoils of the Night Melee at Salty',
          textRu: 'Смелая вылазка стоила раненых, но горцы унесли бочонки осадного пороха прямо из вражеской траншеи.',
          textEn: 'The fierce clash cost casualties, yet defenders hauled siege powder kegs from the trench.',
          powderDelta: 20,
          targetNaibId: 'gergebil',
          garrisonDelta: -55,
          gloryDelta: 11
        }
      }
    ]
  },
  {
    id: 'dil_16_daniel_bek_ilisu',
    scenarios: ['camp_1847', 'camp_1845', 'all'],
    triggerType: 'politics',
    senderRu: 'Даниял-бек Елисуйский (Ириб)',
    senderEn: 'Daniyal-Bek of Ilisu (Irib)',
    portraitHint: 'Кибит-Магома',
    urgencyRu: 'ЮЖНЫЙ ФРОНТ',
    urgencyEn: 'SOUTHERN FRONT',
    titleRu: 'Посольство Даниял-бека к племенам Самура',
    titleEn: 'Daniyal-Bek’s Embassy to the Samur Tribes',
    descRu: 'Бывший султан Елису просит 75 рублей и почётное знамя для поднятия южных обществ против Лезгинской кордонной линии.',
    descEn: 'The former Sultan of Ilisu requests 75 rubles and an honor banner to rouse southern valleys against the Lezgin Cordon Line.',
    choices: [
      {
        id: 'c1_fund_samur_rising',
        labelRu: 'Выдать серебро и знамя Имамата (-75₽, Иман Ириба +7)',
        labelEn: 'Provide silver & Imamate banner (-75 rub., Irib Iman +7)',
        silverDelta: -75,
        targetNaibId: 'irib',
        imanDelta: 7,
        delayPreviewRu: '⏳ Через 3 хода: отвлечение сил РИ на юг (Натиск Ириба -14%, +120 гарнизон)',
        delayPreviewEn: '⏳ In 3 turns: diversion draws Imperial troops south (Irib Pressure -14%, +120 garrison)',
        delayedEffect: {
          delayTurns: 3,
          titleRu: 'Восстание на Самуре сковало южный корпус!',
          titleEn: 'Samur Rising Pins Down the Southern Corps!',
          textRu: 'Отряд Даниял-бека вынудил штаб перебросить батальоны к Ахтам, сняв натиск с Ириба и Чоха.',
          textEn: 'Daniyal-Bek’s push forced Imperial battalions toward Akhty, easing pressure on Irib and Chokh.',
          targetNaibId: 'irib',
          pressureDelta: -14,
          garrisonDelta: 120,
          authorityDelta: 4
        }
      },
      {
        id: 'c2_keep_irib_defensive',
        labelRu: 'Оставить Даниял-бека в обороне Ириба (+12 пороха Ирибу, Гордыня +5)',
        labelEn: 'Keep Daniyal-Bek guarding Irib (+12 Irib powder, Pride +5)',
        targetNaibId: 'irib',
        localPowderDelta: 12,
        prideDelta: 5,
        delayPreviewRu: '⏳ Через 2 хода: сбережён гарнизон и припасы (+100 провианта)',
        delayPreviewEn: '⏳ In 2 turns: conserved troops & mountain stores (+100 prov.)',
        delayedEffect: {
          delayTurns: 2,
          titleRu: 'Южные перевалы Ириба надёжно заперты',
          titleEn: 'Southern Passes of Irib Tightly Sealed',
          textRu: 'Спокойная оборона позволила собрать полный урожай с горных террас южного Дагестана.',
          textEn: 'Steady defense allowed full harvest from southern Dagestan’s terraced slopes.',
          provisionsDelta: 100
        }
      }
    ]
  },
  {
    id: 'dil_17_shirvan_saltpeter',
    scenarios: ['all'],
    triggerType: 'low_powder',
    senderRu: 'Купцы-кунаки из Дербента',
    senderEn: 'Kunak Merchants from Derbent',
    portraitHint: 'Мухаммад-Амин',
    urgencyRu: 'КОНТРАБАНДА СЕЛИТРЫ',
    urgencyEn: 'SALTPETER SMUGGLING',
    titleRu: 'Тайный обоз с селитрой и свинцом из Ширвана',
    titleEn: 'Clandestine Saltpeter & Lead Train from Shirvan',
    descRu: 'Купцы готовы провести через посты 30 вьюков отборной селитры и свинца, но просят либо золото вперёд, либо охранный конвой мюридов.',
    descEn: 'Merchants offer to run 30 packs of prime saltpeter and lead past checkpoints—asking either upfront silver or a murid escort.',
    choices: [
      {
        id: 'c1_pay_merchants',
        labelRu: 'Заплатить кунакам серебром (-70₽, +12 пороха сразу)',
        labelEn: 'Pay the kunak smugglers (-70 rub., +12 powder now)',
        silverDelta: -70,
        powderDelta: 12,
        delayPreviewRu: '⏳ Через 2 хода: прибудет вторая партия свинца (+24 пороха)',
        delayPreviewEn: '⏳ In 2 turns: second lead shipment arrives (+24 powder)',
        delayedEffect: {
          delayTurns: 2,
          titleRu: 'Вторая партия ширванской селитры в арсенале',
          titleEn: 'Second Shirvan Saltpeter Batch Delivered',
          textRu: 'Надёжные кунаки провели караван горными тропами без единого выстрела.',
          textEn: 'Trusted kunaks guided the pack train along ridge trails without a shot fired.',
          powderDelta: 24
        }
      },
      {
        id: 'c2_send_escort',
        labelRu: 'Выслать конную охрану без задатка (-30₽, Натиск Ириба +4%)',
        labelEn: 'Dispatch cavalry escort without upfront gold (-30 rub., Irib Pressure +4%)',
        silverDelta: -30,
        targetNaibId: 'irib',
        pressureDelta: 4,
        delayPreviewRu: '⏳ Через 3 хода: конвой отобьёт засаду и доставит +28 пороха и +50₽',
        delayPreviewEn: '⏳ In 3 turns: escort beats ambush, brings +28 powder & +50 rub.',
        delayedEffect: {
          delayTurns: 3,
          titleRu: 'Конвой с боем провёл обоз с селитрой!',
          titleEn: 'Escort Fights Through with the Saltpeter Train!',
          textRu: 'Горцы рассеяли кордонный разъезд, привезли селитру и трофейные патронные сумки.',
          textEn: 'Riders scattered a cordon patrol, bringing both saltpeter and captured cartridge boxes.',
          powderDelta: 28,
          silverDelta: 50,
          targetNaibId: 'irib',
          gloryDelta: 7
        }
      }
    ]
  },
  {
    id: 'dil_18_muhtasib_corruption',
    scenarios: ['all'],
    triggerType: 'politics',
    senderRu: 'Тайный донос из Карата',
    senderEn: 'Secret Petition from Karata',
    portraitHint: 'Шамиль',
    urgencyRu: 'РЕВИЗИЯ КАЗНЫ',
    urgencyEn: 'TREASURY AUDIT',
    titleRu: 'Жалоба джамаата на сборщика закята в Карате',
    titleEn: 'Jamaat Complaint Against Karata’s Tax Collector',
    descRu: 'Старейшины Караты обвиняют помощника наиба в поборах зерном сверх Низама. Гласный суд укрепит веру народа, но заденет честь самого наиба.',
    descEn: 'Karata elders accuse the Naib’s deputy of levying grain above Nizam limits. A public trial uplifts the people yet stings the Naib’s pride.',
    choices: [
      {
        id: 'c1_public_trial',
        labelRu: 'Провести гласный суд шариата (+100 пров., Авторитет +5%, Гордыня Караты +8)',
        labelEn: 'Hold a public Sharia trial (+100 prov., Auth +5%, Karata Pride +8)',
        provisionsDelta: 100,
        authorityDelta: 5,
        targetNaibId: 'karata',
        prideDelta: 8,
        delayPreviewRu: '⏳ Через 2 хода: рост добровольного хараджа (+95₽, Иман всех +3)',
        delayPreviewEn: '⏳ In 2 turns: voluntary kharaj rises (+95 rub., All Iman +3)',
        delayedEffect: {
          delayTurns: 2,
          titleRu: 'Справедливый суд укрепил казну Байт аль-маль',
          titleEn: 'Fair Justice Boosts Bayt al-Mal Revenues',
          textRu: 'Весть о наказании мздоимца побудила джамааты исправно внести харадж.',
          textEn: 'News of the corrupt deputy’s dismissal spurred communities to pay kharaj faithfully.',
          silverDelta: 95,
          allImanDelta: 3
        }
      },
      {
        id: 'c2_quiet_reprimand',
        labelRu: 'Уладить тихо письмом к наибу (Верность Караты +6, Авторитет -2%)',
        labelEn: 'Settle quietly by private letter to the Naib (Loyalty +6, Auth -2%)',
        authorityDelta: -2,
        targetNaibId: 'karata',
        imanDelta: 5,
        prideDelta: -5,
        delayPreviewRu: '⏳ Через 3 хода: наиб сам возместит зерно (+135 пров., Амбиции -6)',
        delayPreviewEn: '⏳ In 3 turns: Naib quietly restores grain (+135 prov., Ambition -6)',
        delayedEffect: {
          delayTurns: 3,
          titleRu: 'Наиб Караты возместил недостачу зерна',
          titleEn: 'Karata’s Naib Quietly Restores Grain Stores',
          textRu: 'Оценив деликатность Имама, наиб сменил писаря и прислал в Ведено лишние подводы зерна.',
          textEn: 'Grateful for the Imam’s tact, the Naib replaced his clerk and shipped extra grain.',
          targetNaibId: 'karata',
          provisionsDelta: 135,
          ambitionDelta: -6
        }
      }
    ]
  },
  {
    id: 'dil_19_signal_towers',
    scenarios: ['all'],
    triggerType: 'general',
    senderRu: 'Караульные башен Аргуна',
    senderEn: 'Argun Watchtower Sentries',
    portraitHint: 'Байсунгур',
    urgencyRu: 'СИГНАЛЬНАЯ СЕТЬ',
    urgencyEn: 'BEACON NETWORK',
    titleRu: 'Строительство каменных маяков на перевалах',
    titleEn: 'Stone Signal Beacons on High Passes',
    descRu: 'Старые кострища гаснут под ливнем. Возведение крытых каменных маяков раскроет движение колонн за три дня до подхода.',
    descEn: 'Open bonfires fail in rainstorms. Covered stone beacons would expose marching columns three days early.',
    choices: [
      {
        id: 'c1_build_beacons',
        labelRu: 'Выделить серебро на каменные маяки (-65₽, открыть разведсеть)',
        labelEn: 'Fund stone signal towers (-65 rub., reveal spy ring)',
        silverDelta: -65,
        revealFogRing: true,
        delayPreviewRu: '⏳ Через 2 хода: раннее оповещение собьёт натиск (Натиск всех -6%, Авторитет +3%)',
        delayPreviewEn: '⏳ In 2 turns: early warnings blunt offensives (All Pressure -6%, Auth +3%)',
        delayedEffect: {
          delayTurns: 2,
          titleRu: 'Огненная цепь маяков сорвала внезапный марш!',
          titleEn: 'Beacon Chain Foils a Surprise March!',
          textRu: 'Дымные сигналы с перевалов загодя подняли ополчение — вражеская колонна наткнулась на готовые завалы.',
          textEn: 'Smoke signals roused highland militias ahead of time, meeting the column at manned barricades.',
          allPressureDelta: -6,
          authorityDelta: 3
        }
      },
      {
        id: 'c2_mounted_relays',
        labelRu: 'Поставить конных гонцов-эстафетчиков (-70 пров.)',
        labelEn: 'Post mounted relay riders (-70 prov.)',
        provisionsDelta: -70,
        delayPreviewRu: '⏳ Через 2 хода: быстрая связь ускорит сборы (+80 гарнизон Ведено, +10 пороха)',
        delayPreviewEn: '⏳ In 2 turns: swift couriers speed levies (+80 Vedeno garrison, +10 powder)',
        delayedEffect: {
          delayTurns: 2,
          titleRu: 'Эстафета конных мюридов ускорила переброску',
          titleEn: 'Mounted Relay Accelerates Mobilization',
          textRu: 'Приказы Диван-ханы доходят до дальних ущелий за сутки, ускоряя сбор подкреплений.',
          textEn: 'Divan-Khana dispatches now reach remote gorges in a single day.',
          targetNaibId: 'vedeno',
          garrisonDelta: 80,
          powderDelta: 10
        }
      }
    ]
  },
  {
    id: 'dil_20_forest_clearings',
    scenarios: ['camp_1845', 'camp_1847', 'all'],
    triggerType: 'general',
    senderRu: 'Наиб Малой Чечни (Шали)',
    senderEn: 'Naib of Lesser Chechnya (Shali)',
    portraitHint: 'Байсунгур',
    urgencyRu: 'ПРОСЕКИ И ЗАВАЛЫ',
    urgencyEn: 'FOREST CLEARINGS',
    titleRu: 'Рубка широких просек у реки Валерик',
    titleEn: 'Wide Forest Clearings Along the Valerik',
    descRu: 'Сапёрные роты под прикрытием артиллерии вырубают вековой буковый лес, лишая мюридов укрытий. Нужно либо жечь лесосеки ночью, либо отвести аулы вглубь гор.',
    descEn: 'Sappers under cannon cover are felling ancient beech woods, stripping away ambush cover. Harass the woodcutters nightly or relocate lowland auls deeper into the mountains?',
    choices: [
      {
        id: 'c1_harass_sappers',
        labelRu: 'Послать снайперов-мюридов на лесосеки (-12 пороха, Натиск Шали -9%)',
        labelEn: 'Send murid sharpshooters against sappers (-12 powder, Shali Pressure -9%)',
        powderDelta: -12,
        targetNaibId: 'shali',
        pressureDelta: -9,
        delayPreviewRu: '⏳ Через 3 хода: рубка замедлится, трофейный инструмент (+85₽, Слава +8)',
        delayPreviewEn: '⏳ In 3 turns: felling slows & raiders capture gear (+85 rub., Glory +8)',
        delayedEffect: {
          delayTurns: 3,
          titleRu: 'Рубка просек у Валерика остановлена!',
          titleEn: 'Forest Felling Halted Along the Valerik!',
          textRu: 'Меткий огонь из крон буков вынудил отвести рабочие команды; Шали сохранил лесной щит.',
          textEn: 'Sharpshooter fire from the beech canopy forced work crews back, preserving Shali’s forest shield.',
          silverDelta: 85,
          targetNaibId: 'shali',
          gloryDelta: 8,
          pressureDelta: -5
        }
      },
      {
        id: 'c2_relocate_auls',
        labelRu: 'Переселить прикордонные аулы выше в горы (-90 пров., Гарнизон Шали +110)',
        labelEn: 'Relocate border auls higher into the mountains (-90 prov., Shali +110)',
        provisionsDelta: -90,
        targetNaibId: 'shali',
        garrisonDelta: 110,
        delayPreviewRu: '⏳ Через 3 хода: новые укреплённые аулы дадут стойкий тыл (Натиск -8%, Иман +5)',
        delayPreviewEn: '⏳ In 3 turns: fortified highland auls anchor the rear (Pressure -8%, Iman +5)',
        delayedEffect: {
          delayTurns: 3,
          titleRu: 'Горные переселенцы укрепили рубеж у Шали',
          titleEn: 'Relocated Families Fortify the Shali Ridge',
          textRu: 'Вне досягаемости равнинных пушек возникли новые крепкие заставы и амбары.',
          textEn: 'Beyond lowland artillery range, sturdy new highland outposts and granaries took root.',
          targetNaibId: 'shali',
          pressureDelta: -8,
          imanDelta: 5
        }
      }
    ]
  },
  {
    id: 'dil_21_gunib_terraces',
    scenarios: ['camp_1847', 'all'],
    triggerType: 'provisions',
    senderRu: 'Земледельцы Гуниба и Согратля',
    senderEn: 'Terrace Farmers of Gunib & Sogratl',
    portraitHint: 'Джамалуддин',
    urgencyRu: 'ГОРНЫЕ ТЕРРАСЫ',
    urgencyEn: 'MOUNTAIN TERRACES',
    titleRu: 'Оросительные каналы и зерновые террасы Гуниба',
    titleEn: 'Irrigation Channels & Grain Terraces of Gunib',
    descRu: 'Весенние сели размыли подпорные стены хлебных террас. Если бросить гарнизон на починку каналов сейчас, осенью Гуниб станет житницей Дагестана.',
    descEn: 'Spring mudslides damaged retaining walls of Gunib’s grain terraces. Detaching garrison labor now secures a rich autumn harvest.',
    choices: [
      {
        id: 'c1_repair_terraces',
        labelRu: 'Направить людей и серебро на починку террас (-55₽, Натиск Гуниба +4%)',
        labelEn: 'Assign labor & silver to rebuild terraces (-55 rub., Gunib Pressure +4%)',
        silverDelta: -55,
        targetNaibId: 'gunib',
        pressureDelta: 4,
        delayPreviewRu: '⏳ Через 3 хода: богатый урожай на плато (+280 провианта, Верность +8)',
        delayPreviewEn: '⏳ In 3 turns: bumper plateau harvest (+280 prov., Loyalty +8)',
        delayedEffect: {
          delayTurns: 3,
          titleRu: 'Богатый урожай с террас Верхнего Гуниба!',
          titleEn: 'Bumper Harvest from Upper Gunib’s Terraces!',
          textRu: 'Отремонтированные каналы принесли обильный сбор пшеницы и ячменя — амбары полны (+280 провианта).',
          textEn: 'Repaired stone channels delivered abundant wheat and barley (+280 provisions).',
          provisionsDelta: 280,
          targetNaibId: 'gunib',
          loyaltyDelta: 8
        }
      },
      {
        id: 'c2_buy_lowland_grain',
        labelRu: 'Закупить зерно через кунаков на равнине (-85₽, +140 пров. сразу)',
        labelEn: 'Buy lowland grain via kunaks (-85 rub., +140 prov. immediately)',
        silverDelta: -85,
        provisionsDelta: 140,
        delayPreviewRu: '⏳ Через 2 хода: торговый путь принесёт ещё +80 провианта',
        delayPreviewEn: '⏳ In 2 turns: trade trail delivers another +80 provisions',
        delayedEffect: {
          delayTurns: 2,
          titleRu: 'Повторный караван хлеба от кунаков',
          titleEn: 'Follow-Up Kunak Grain Caravan',
          textRu: 'Равнинные купцы доставили вторую партию муки и соли в горы.',
          textEn: 'Lowland merchants delivered a second batch of flour and salt to the mountains.',
          provisionsDelta: 80
        }
      }
    ]
  },
  {
    id: 'dil_22_akhulgo_hostage_parley',
    scenarios: ['camp_1839', 'all'],
    triggerType: 'besieged',
    senderRu: 'Парламентёр у скалы Ахульго',
    senderEn: 'Parley Envoy Below Mount Akhulgo',
    portraitHint: 'Шамиль',
    urgencyRu: 'АХУЛЬГО (1839)',
    urgencyEn: 'AKHULGO (1839)',
    titleRu: 'Требование аманатов на переговорах у Ахульго',
    titleEn: 'Demand for Hostages at Akhulgo Parley',
    descRu: 'Штаб ген. Граббе предлагает трёхдневное перемирие в обмен на присылку почётного аманата. Это даст время переправить раненых и набить патроны.',
    descEn: 'Gen. Grabbe’s HQ offers a three-day truce in exchange for a noble hostage—buying precious time to tend wounded and roll cartridges.',
    choices: [
      {
        id: 'c1_accept_truce',
        labelRu: 'Выиграть передышку для спасения людей (Натиск -12%, +110 пров., Авторитет -4%)',
        labelEn: 'Buy crucial respite to save defenders (Pressure -12%, +110 prov., Auth -4%)',
        provisionsDelta: 110,
        authorityDelta: -4,
        targetNaibId: 'karata',
        pressureDelta: -12,
        delayPreviewRu: '⏳ Через 3 хода: мюриды восстановят силы (+140 гарнизон, +16 пороха)',
        delayPreviewEn: '⏳ In 3 turns: murids regroup & replenish (+140 garrison, +16 powder)',
        delayedEffect: {
          delayTurns: 3,
          titleRu: 'Спасённое ядро мюридов перегруппировалось',
          titleEn: 'Saved Murid Core Regroups',
          textRu: 'Выигранные дни позволили вывести лучших командиров и пополнить подсумки.',
          textEn: 'The days won allowed veteran officers to regroup and refill cartridge pouches.',
          targetNaibId: 'karata',
          garrisonDelta: 140,
          powderDelta: 16
        }
      },
      {
        id: 'c2_refuse_parley',
        labelRu: 'Отвергнуть переговоры — стоять на скале! (Авторитет +7%, Иман всех +5)',
        labelEn: 'Reject parley — stand fast on the cliff! (Auth +7%, All Iman +5)',
        authorityDelta: 7,
        allImanDelta: 5,
        delayPreviewRu: '⏳ Через 2 хода: ожесточённый штурм (+8% Натиск, но Слава +14 и +90 добровольцев)',
        delayPreviewEn: '⏳ In 2 turns: fierce assault (+8% Pressure, Glory +14 & +90 volunteers)',
        delayedEffect: {
          delayTurns: 2,
          titleRu: 'Бессмертная стойкость защитников скалы',
          titleEn: 'Immortal Resolve of the Cliff Defenders',
          textRu: 'Враг бросил свежие батальоны на приступ, но весть о несгибаемости Шамиля подняла соседние общества.',
          textEn: 'Fresh battalions stormed the crags, yet Shamil’s defiance rallied neighboring valleys.',
          targetNaibId: 'karata',
          pressureDelta: 8,
          gloryDelta: 14,
          garrisonDelta: 90
        }
      }
    ]
  },
  {
    id: 'dil_23_murtazek_guard',
    scenarios: ['all'],
    triggerType: 'politics',
    senderRu: 'Командир муртазеков Ведено',
    senderEn: 'Vedeno Murtazek Guard Commander',
    portraitHint: 'Шамиль',
    urgencyRu: 'ГВАРДИЯ МУРТАЗЕКОВ',
    urgencyEn: 'MURTAZEK GUARD',
    titleRu: 'Набор отборной конной гвардии «муртазеков»',
    titleEn: 'Expanding the Elite Murtazek Guard',
    descRu: 'Каждый десятый двор выставляет лучшего всадника на содержание общества. Усиление гвардии укрепит власть Имама, но вызовет ревность у гордых наибов.',
    descEn: 'Every tenth household equips one elite rider. Expanding the Murtazeks strengthens central rule yet stirs envy among proud Naibs.',
    choices: [
      {
        id: 'c1_expand_murtazeks',
        labelRu: 'Увеличить корпус муртазеков (-80₽, Гарнизон Ведено +150, Авторитет +4%)',
        labelEn: 'Expand the Murtazek corps (-80 rub., Vedeno +150, Auth +4%)',
        silverDelta: -80,
        authorityDelta: 4,
        targetNaibId: 'vedeno',
        garrisonDelta: 150,
        delayPreviewRu: '⏳ Через 3 хода: гвардия подавит смуту и собьёт натиск (Натиск всех -5%, Амбиции Хунзаха +6)',
        delayPreviewEn: '⏳ In 3 turns: guard deters unrest & blunts pressure (All Pressure -5%, Khunzakh Ambition +6)',
        delayedEffect: {
          delayTurns: 3,
          titleRu: 'Отборные муртазеки навели образцовый порядок',
          titleEn: 'Elite Murtazeks Enforce Iron Order',
          textRu: 'Конная гвардия Имама стала грозным щитом Ведено, хотя часть независимых наибов насторожилась.',
          textEn: 'The Imam’s elite riders shielded Vedeno, though independent Naibs eyed their power warily.',
          allPressureDelta: -5,
          targetNaibId: 'khunzakh',
          ambitionDelta: 6
        }
      },
      {
        id: 'c2_keep_local_levies',
        labelRu: 'Оставить всадников под началом местных наибов (Иман всех +4, +45₽)',
        labelEn: 'Leave riders under local Naibs (All Iman +4, +45 rub.)',
        allImanDelta: 4,
        silverDelta: 45,
        delayPreviewRu: '⏳ Через 2 хода: наибы оценят доверие (Верность +8 в Беное и Хунзахе)',
        delayPreviewEn: '⏳ In 2 turns: Naibs reward trust (Loyalty +8 in Benoy & Khunzakh)',
        delayedEffect: {
          delayTurns: 2,
          titleRu: 'Наибы ответили на доверие верной службой',
          titleEn: 'Naibs Repay Trust with Steadfast Service',
          textRu: 'Сохранив своих лучших всадников, окружные командиры охотнее исполняют приказы Диван-ханы.',
          textEn: 'Keeping their finest riders, district commanders execute Divan-Khana orders with zeal.',
          targetNaibId: 'benoy',
          loyaltyDelta: 8,
          authorityDelta: 3
        }
      }
    ]
  },
  {
    id: 'dil_24_gergebil_orchards',
    scenarios: ['camp_1847', 'all'],
    triggerType: 'siege_war',
    senderRu: 'Наиб Гергебиля',
    senderEn: 'Naib of Gergebil',
    portraitHint: 'Кибит-Магома',
    urgencyRu: 'ГЕРГЕБИЛЬ (1847–1848)',
    urgencyEn: 'GERGEBIL (1847–1848)',
    titleRu: 'Абрикосовые сады Гергебиля на линии огня',
    titleEn: 'Gergebil’s Apricot Orchards in the Line of Fire',
    descRu: 'Многоярусные сады и каменные дувалы у подножия Гергебиля — идеальный лабиринт для стрелков, но бой в садах погубит плодоносящие деревья аула.',
    descEn: 'Terraced apricot orchards below Gergebil form a deadly sniper labyrinth, yet fighting among them risks destroying the aul’s livelihood.',
    choices: [
      {
        id: 'c1_turn_orchards_fortress',
        labelRu: 'Превратить дувалы садов в огневой лабиринт (-10 пороха, Натиск Гергебиля -12%)',
        labelEn: 'Turn orchard walls into a kill zone (-10 powder, Gergebil Pressure -12%)',
        powderDelta: -10,
        targetNaibId: 'gergebil',
        pressureDelta: -12,
        delayPreviewRu: '⏳ Через 2 хода: штурм захлебнётся в садах (Слава +11, Провиант -65)',
        delayPreviewEn: '⏳ In 2 turns: assault stalls in orchards (Glory +11, Prov -65)',
        delayedEffect: {
          delayTurns: 2,
          titleRu: 'Штурмовые колонны увязли в садах Гергебиля!',
          titleEn: 'Assault Columns Bog Down in Gergebil’s Orchards!',
          textRu: 'Каждая каменная ограда стала редутом — враг понёс тяжёлые потери, хоть часть садов пострадала от ядер.',
          textEn: 'Every stone wall became a redoubt, halting the storming at the cost of shelled trees.',
          targetNaibId: 'gergebil',
          gloryDelta: 11,
          provisionsDelta: -65,
          authorityDelta: 4
        }
      },
      {
        id: 'c2_defend_upper_crag',
        labelRu: 'Отвести стрелков на верхний утёс, сберечь сады (+120 пров., Иман +6)',
        labelEn: 'Pull sharpshooters to the upper crag, spare orchards (+120 prov., Iman +6)',
        provisionsDelta: 120,
        targetNaibId: 'gergebil',
        imanDelta: 6,
        delayPreviewRu: '⏳ Через 3 хода: спасённый урожай сушёных плодов (+140 пров., Натиск +5%)',
        delayPreviewEn: '⏳ In 3 turns: saved dried-fruit harvest (+140 prov., Pressure +5%)',
        delayedEffect: {
          delayTurns: 3,
          titleRu: 'Гергебильские запасы кураги спасли зимний паёк',
          titleEn: 'Gergebil Dried-Apricot Stores Bolster Winter Rations',
          textRu: 'Уцелевшие сады дали горы сушёных плодов для походов, но передовая батарея врага подошла ближе.',
          textEn: 'Spared orchards yielded campaign rations, though enemy guns crept closer.',
          provisionsDelta: 140,
          targetNaibId: 'gergebil',
          pressureDelta: 5
        }
      }
    ]
  },
  {
    id: 'dil_25_prisoner_exchange',
    scenarios: ['all'],
    triggerType: 'general',
    senderRu: 'Парламентёр с кордонной линии',
    senderEn: 'Cordon Truce Envoy',
    portraitHint: 'Джамалуддин',
    urgencyRu: 'ОБМЕН ПЛЕННЫМИ',
    urgencyEn: 'PRISONER EXCHANGE',
    titleRu: 'Размен пленных офицеров на горцев-ветеранов',
    titleEn: 'Exchange of Captured Officers for Veteran Murids',
    descRu: 'Комендант крепости Грозная предлагает обменять двоих пленных поручиков либо на выкуп серебром, либо на 45 раненых горцев из темницы.',
    descEn: 'Fort Groznaya’s commandant offers to ransom two captured lieutenants for silver or exchange them for 45 imprisoned highland veterans.',
    choices: [
      {
        id: 'c1_exchange_warriors',
        labelRu: 'Выменять наших воинов из плена (Авторитет +5%, Гарнизон Шали +100)',
        labelEn: 'Exchange for our captured warriors (Auth +5%, Shali +100)',
        authorityDelta: 5,
        targetNaibId: 'shali',
        garrisonDelta: 100,
        delayPreviewRu: '⏳ Через 2 хода: освобождённые ветераны поделятся разведкой (+12 пороха, Иман всех +4)',
        delayPreviewEn: '⏳ In 2 turns: freed veterans bring fort intel (+12 powder, All Iman +4)',
        delayedEffect: {
          delayTurns: 2,
          titleRu: 'Возвращённые из плена принесли сведения о складах',
          titleEn: 'Freed Veterans Bring Depot Intelligence',
          textRu: 'Освобождённые мюриды указали слабые места кордонной стражи и вдохновили весь край.',
          textEn: 'Returning veterans pinpointed cordon gaps and inspired morale across the valleys.',
          powderDelta: 12,
          allImanDelta: 4,
          allPressureDelta: -4
        }
      },
      {
        id: 'c2_take_silver_ransom',
        labelRu: 'Принять выкуп серебром в Байт аль-маль (+135₽, Авторитет -2%)',
        labelEn: 'Accept silver ransom for Bayt al-Mal (+135 rub., Auth -2%)',
        silverDelta: 135,
        authorityDelta: -2,
        delayPreviewRu: '⏳ Через 3 хода: серебро пойдёт на закупки пороха (+22 пороха)',
        delayPreviewEn: '⏳ In 3 turns: ransom silver buys powder (+22 powder)',
        delayedEffect: {
          delayTurns: 3,
          titleRu: 'Выкупное серебро обращено в боеприпасы',
          titleEn: 'Ransom Silver Converted into Munitions',
          textRu: 'Казначей Хаджияв закупил на выкупные рубли свинец, кремни и селитру.',
          textEn: 'Treasurer Hajjiyav converted the ransom rubles into lead, flints, and saltpeter.',
          powderDelta: 22
        }
      }
    ]
  },
  {
    id: 'dil_26_kibit_magoma_rivalry',
    scenarios: ['all'],
    triggerType: 'high_ambition',
    senderRu: 'Наиб Телетля Кибит-Магома',
    senderEn: 'Naib of Teletl Kibit-Magoma',
    portraitHint: 'Кибит-Магома',
    urgencyRu: 'СОПЕРНИЧЕСТВО НАИБОВ',
    urgencyEn: 'NAIB RIVALRY',
    titleRu: 'Спор Кибит-Магомы и Хаджи-Мурата о пастбищах',
    titleEn: 'Kibit-Magoma vs. Hadji Murad Pasture Dispute',
    descRu: 'Два могущественных аварских наиба не поделили летние луга на границе Хунзаха и Телетля. Всадники уже держатся за кинжалы.',
    descEn: 'Two mighty Avar Naibs clash over high summer pastures between Khunzakh and Teletl; riders already grip their daggers.',
    choices: [
      {
        id: 'c1_split_pastures_fairly',
        labelRu: 'Разделить луга пополам и скрепить клятвой (-45₽ на пир примирения, Авторитет +5%)',
        labelEn: 'Split pastures equally with reconciliation feast (-45 rub., Auth +5%)',
        silverDelta: -45,
        authorityDelta: 5,
        targetNaibId: 'teletl',
        prideDelta: -6,
        delayPreviewRu: '⏳ Через 2 хода: совместный поход двух наибов (Натиск Хунзаха -10%, Слава +9)',
        delayPreviewEn: '⏳ In 2 turns: joint sortie by both Naibs (Khunzakh Pressure -10%, Glory +9)',
        delayedEffect: {
          delayTurns: 2,
          titleRu: 'Примирённые наибы провели совместный удар!',
          titleEn: 'Reconciled Naibs Strike Together!',
          textRu: 'Сотни Хунзаха и Телетля ударили плечом к плечу, отбросив передовой отряд к равнине.',
          textEn: 'Khunzakh and Teletl squadrons struck side by side, driving back enemy vanguards.',
          targetNaibId: 'khunzakh',
          pressureDelta: -10,
          gloryDelta: 9,
          loyaltyDelta: 7
        }
      },
      {
        id: 'c2_favor_kibit',
        labelRu: 'Присудить пастбища старшему по летам Кибит-Магоме (+110 пров., Гордыня Хунзаха +9)',
        labelEn: 'Award pastures to senior Naib Kibit-Magoma (+110 prov., Khunzakh Pride +9)',
        provisionsDelta: 110,
        targetNaibId: 'khunzakh',
        prideDelta: 9,
        delayPreviewRu: '⏳ Через 3 хода: Телетль пришлёт порох (+18 пороха), но Амбиции Хунзаха вырастут (+9)',
        delayPreviewEn: '⏳ In 3 turns: Teletl sends +18 powder, but Khunzakh Ambition rises (+9)',
        delayedEffect: {
          delayTurns: 3,
          titleRu: 'Последствия спора за аварские луга',
          titleEn: 'Aftermath of the Avar Pasture Ruling',
          textRu: 'Кибит-Магома прислал в Ведено 18 пудов пороха, но Хаджи-Мурат затаил досаду.',
          textEn: 'Kibit-Magoma sent 18 poods of powder to Vedeno, yet Hadji Murad nursed quiet grievance.',
          powderDelta: 18,
          targetNaibId: 'khunzakh',
          ambitionDelta: 9
        }
      }
    ]
  },
  {
    id: 'dil_27_arabic_printing',
    scenarios: ['all'],
    triggerType: 'politics',
    senderRu: 'Канцелярия Диван-ханы (Ведено)',
    senderEn: 'Divan-Khana Chancellery (Vedeno)',
    portraitHint: 'Джамалуддин',
    urgencyRu: 'ПРОСВЕЩЕНИЕ И ПРАВО',
    urgencyEn: 'SCHOLARSHIP & LAW',
    titleRu: 'Переписчики Низамов и медресе в Ведено',
    titleEn: 'Nizam Scribes & Madrasa in Vedeno',
    descRu: 'Канцелярия предлагает обучить 30 писцов-каллиграфов, чтобы каждый наиб получил единый свод Низамов и шифрованную переписку.',
    descEn: 'The Chancellery proposes training 30 calligraphers so every Naib holds identical Nizam codes and cipher keys.',
    choices: [
      {
        id: 'c1_train_scribes',
        labelRu: 'Оплатить бумагу, чернила и школу писцов (-60₽, Авторитет +4%)',
        labelEn: 'Fund paper, ink, and scribe academy (-60 rub., Auth +4%)',
        silverDelta: -60,
        authorityDelta: 4,
        delayPreviewRu: '⏳ Через 3 хода: шифрованные грамоты укрепят управление (Иман всех +6, +70₽ налогов)',
        delayPreviewEn: '⏳ In 3 turns: ciphered decrees streamline governance (All Iman +6, +70 rub.)',
        delayedEffect: {
          delayTurns: 3,
          titleRu: 'Единые списки Низамов разосланы по 10 наибствам!',
          titleEn: 'Unified Nizam Codes Delivered to All 10 Naibates!',
          textRu: 'Точный учёт хараджа и шифрованные письма пресекли перехват тайн и принесли казне +70 руб.',
          textEn: 'Accurate ledgers and ciphered dispatches curbed leaks and added +70 rub. to the treasury.',
          allImanDelta: 6,
          silverDelta: 70,
          authorityDelta: 4
        }
      },
      {
        id: 'c2_save_treasury',
        labelRu: 'Сохранить серебро для пороха (+14 пороха)',
        labelEn: 'Conserve silver for gunpowder (+14 powder)',
        powderDelta: 14,
        delayPreviewRu: '⏳ Через 2 хода: спешные устные приказы вызовут путаницу (Авторитет -2%, но +50₽ сбережено)',
        delayPreviewEn: '⏳ In 2 turns: verbal orders cause minor friction (Auth -2%, +50 rub. saved)',
        delayedEffect: {
          delayTurns: 2,
          titleRu: 'Разночтения в устных приказах на местах',
          titleEn: 'Friction from Verbal District Orders',
          textRu: 'Без письменных списков пара наибов истолковали указ по-своему, хотя казна сберегла 50 руб.',
          textEn: 'Without written copies, two Naibs interpreted decrees loosely, though 50 rub. stayed in the vault.',
          authorityDelta: -2,
          silverDelta: 50
        }
      }
    ]
  },
  {
    id: 'dil_28_tobacco_austerity',
    scenarios: ['all'],
    triggerType: 'politics',
    senderRu: 'Мухтасибы Большой Чечни',
    senderEn: 'Muhtasibs of Greater Chechnya',
    portraitHint: 'Шамиль',
    urgencyRu: 'НИЗАМ О СТРОГОСТИ',
    urgencyEn: 'AUSTERITY NIZAM',
    titleRu: 'Запрет на табак и шёлковые излишества в походах',
    titleEn: 'Ban on Tobacco & Silk Luxuries on Campaign',
    descRu: 'Ревнители Низама требуют изъять у купцов контрабандный табак и направить все средства джамаатов только на свинец и коней.',
    descEn: 'Nizam zealots demand seizing smuggled tobacco from traders so all community wealth goes to lead and mounts.',
    choices: [
      {
        id: 'c1_strict_austerity',
        labelRu: 'Поддержать строгий Низам (Иман всех +5, Авторитет +4%, Серебро -30₽)',
        labelEn: 'Enforce strict austerity (All Iman +5, Auth +4%, Silver -30 rub.)',
        allImanDelta: 5,
        authorityDelta: 4,
        silverDelta: -30,
        delayPreviewRu: '⏳ Через 2 хода: дисциплина лагерей вырастет (+16 пороха, Натиск -4%)',
        delayPreviewEn: '⏳ In 2 turns: camp discipline sharpens (+16 powder, Pressure -4%)',
        delayedEffect: {
          delayTurns: 2,
          titleRu: 'Строгий порядок в походных станах Имамата',
          titleEn: 'Iron Discipline in Imamate Field Camps',
          textRu: 'Ночные дозоры больше не выдают себя огоньками трубок — скрытность горцев возросла.',
          textEn: 'Night pickets no longer betray themselves with pipe embers, boosting ambush stealth.',
          powderDelta: 16,
          allPressureDelta: -4
        }
      },
      {
        id: 'c2_tax_traders',
        labelRu: 'Обложить купцов высокой пошлиной вместо запрета (+115₽, Иман всех -2)',
        labelEn: 'Tax merchants heavily instead of banning (+115 rub., All Iman -2)',
        silverDelta: 115,
        allImanDelta: -2,
        delayPreviewRu: '⏳ Через 3 хода: купеческие караваны принесут ещё +85₽ в казну',
        delayPreviewEn: '⏳ In 3 turns: merchant caravans bring another +85 rub.',
        delayedEffect: {
          delayTurns: 3,
          titleRu: 'Пошлины горных ярмарок пополнили Байт аль-маль',
          titleEn: 'Highland Fair Customs Enrich Bayt al-Mal',
          textRu: 'Оживлённая меновая торговля на перевалах дала стабильный доход казне.',
          textEn: 'Brisk pass-market trade delivered steady customs revenue.',
          silverDelta: 85
        }
      }
    ]
  },
  {
    id: 'dil_29_dargo_capital_move',
    scenarios: ['camp_1845', 'all'],
    triggerType: 'general',
    senderRu: 'Совет старшин Ичкерии',
    senderEn: 'Council of Ichkeria Elders',
    portraitHint: 'Шамиль',
    urgencyRu: 'СТОЛИЦА ИМАМАТА',
    urgencyEn: 'IMAMATE CAPITAL',
    titleRu: 'Укрепление новой столицы в Дарго-Ведено',
    titleEn: 'Fortifying the New Capital at Dargo-Vedeno',
    descRu: 'После пожара Старого Дарго плотники готовы возвести в Ведено двойной частокол, литейный сарай и просторный двор Диван-ханы.',
    descEn: 'After Old Dargo burned, carpenters are ready to raise a double palisade, foundry shed, and grand Divan-Khana hall at Vedeno.',
    choices: [
      {
        id: 'c1_fortify_vedeno',
        labelRu: 'Возвести двойной вал и литейный двор (-85₽, Натиск Ведено -10%)',
        labelEn: 'Raise double ramparts & foundry (-85 rub., Vedeno Pressure -10%)',
        silverDelta: -85,
        targetNaibId: 'vedeno',
        pressureDelta: -10,
        delayPreviewRu: '⏳ Через 3 хода: неприступная столица даст +25 пороха и +120 гарнизона',
        delayPreviewEn: '⏳ In 3 turns: fortified capital yields +25 powder & +120 garrison',
        delayedEffect: {
          delayTurns: 3,
          titleRu: 'Дарго-Ведено стал неприступным сердцем гор!',
          titleEn: 'Dargo-Vedeno Stands as the Impregnable Mountain Capital!',
          textRu: 'Новые земляные бастионы и пороховые склады Ведено способны выдержать долгую блокаду.',
          textEn: 'Vedeno’s new earthen bastions and powder vaults can weather a prolonged blockade.',
          targetNaibId: 'vedeno',
          garrisonDelta: 120,
          powderDelta: 25,
          authorityDelta: 5
        }
      },
      {
        id: 'c2_disperse_depots',
        labelRu: 'Рассредоточить склады по пещерам Аварии (-35₽, Провиант +110)',
        labelEn: 'Disperse stores in Avaria’s mountain caves (-35 rub., Prov +110)',
        silverDelta: -35,
        provisionsDelta: 110,
        delayPreviewRu: '⏳ Через 2 хода: скрытые склады спасут порох при набегах (+18 пороха, Натиск -5%)',
        delayPreviewEn: '⏳ In 2 turns: hidden caves safeguard powder (+18 powder, Pressure -5%)',
        delayedEffect: {
          delayTurns: 2,
          titleRu: 'Тайные пещерные арсеналы наполнены',
          titleEn: 'Secret Cave Arsenals Stocked',
          textRu: 'Даже прорыв колонны к столице не лишит мюридов пороха и сухарей.',
          textEn: 'Even a column thrust toward the capital cannot deprive murids of powder or grain.',
          powderDelta: 18,
          allPressureDelta: -5
        }
      }
    ]
  },
  {
    id: 'dil_30_gunpowder_caravan_storm',
    scenarios: ['all'],
    triggerType: 'low_powder',
    senderRu: 'Начальник порохового обоза',
    senderEn: 'Powder Caravan Master',
    portraitHint: 'Хаджи-Юсуф',
    urgencyRu: 'ГОРНЫЙ ОБВАЛ',
    urgencyEn: 'MOUNTAIN ROCKSLIDE',
    titleRu: 'Пороховой караван под ливнем на Андийском перевале',
    titleEn: 'Powder Caravan Caught in Storm on Andi Pass',
    descRu: 'Проливной дождь грозит подмочить 25 пудов пороха на пути к осаждённым аулам. Можно укрыться в саклях пастухов (задержка) или накрыть вьюки бурками мюридов.',
    descEn: 'Torrential rain threatens to soak 25 poods of powder bound for besieged auls. Shelter in shepherd huts (delay) or drape the packs in murids’ own burkas?',
    choices: [
      {
        id: 'c1_burka_shield',
        labelRu: 'Накрыть бочонки бурками конвоя — идти без остановки (+16 пороха сразу, Провиант -60)',
        labelEn: 'Cover kegs with escort burkas — press on (+16 powder now, Prov -60)',
        powderDelta: 16,
        provisionsDelta: -60,
        delayPreviewRu: '⏳ Через 2 хода: вовремя доставленный порох спасёт фронт (Натиск всех -6%, Слава +7)',
        delayPreviewEn: '⏳ In 2 turns: timely powder saves the line (All Pressure -6%, Glory +7)',
        delayedEffect: {
          delayTurns: 2,
          titleRu: 'Сухой порох прибыл в разгар штурма!',
          titleEn: 'Dry Powder Arrives Mid-Assault!',
          textRu: 'Продрогшие, но верные всадники привезли сухие бочонки прямо к передовым завалам.',
          textEn: 'Drenched yet steadfast riders delivered dry powder kegs right to the front barricades.',
          allPressureDelta: -6,
          targetNaibId: 'karata',
          gloryDelta: 7
        }
      },
      {
        id: 'c2_shelter_wait',
        labelRu: 'Переждать грозу в каменных кошах (сберечь людей, +40 пров.)',
        labelEn: 'Wait out the storm in stone sheepfolds (+40 prov.)',
        provisionsDelta: 40,
        delayPreviewRu: '⏳ Через 2 хода: караван дойдёт целиком без порчи (+26 пороха)',
        delayPreviewEn: '⏳ In 2 turns: caravan arrives intact (+26 powder)',
        delayedEffect: {
          delayTurns: 2,
          titleRu: 'Пороховой караван прибыл в полной сохранности',
          titleEn: 'Powder Caravan Arrives Intact',
          textRu: 'Ни один фунт драгоценного пороха не отсырел; все 26 пудов поступили в арсенал.',
          textEn: 'Not a single pound was spoiled; all 26 poods entered the arsenal dry.',
          powderDelta: 26
        }
      }
    ]
  },
  {
    id: 'dil_31_chokh_artillery_duel',
    scenarios: ['camp_1847', 'all'],
    triggerType: 'siege_war',
    senderRu: 'Защитники Чохского редута',
    senderEn: 'Defenders of the Chokh Redoubt',
    portraitHint: 'Хаджи-Юсуф',
    urgencyRu: 'ОСАДА ЧОХА (1849)',
    urgencyEn: 'CHOKH SIEGE (1849)',
    titleRu: 'Батарея инженера Хаджи-Юсуфа на Чохском гребне',
    titleEn: 'Engineer Hajji Yusuf’s Battery on Chokh Ridge',
    descRu: 'Князь Аргутинский развернул 22 орудия перед Чохом. Хаджи-Юсуф предлагает замаскировать нашу единственную гаубицу в каменной амбразуре для контрбатарейного огня.',
    descEn: 'Prince Argutinsky deployed 22 guns before Chokh. Hajji Yusuf proposes masking our single howitzer inside a stone embrasure for counter-battery fire.',
    choices: [
      {
        id: 'c1_counterbattery_duel',
        labelRu: 'Открыть прицельный огонь по зарядным ящикам врага (-14 пороха, враг -300)',
        labelEn: 'Target enemy ammunition caissons (-14 powder, enemy -300)',
        powderDelta: -14,
        damageEnemyBayonets: 300,
        targetNaibId: 'chokh',
        pressureDelta: -10,
        delayPreviewRu: '⏳ Через 2 хода: взрыв вражеского парка заставит снять осаду (Натиск Чоха -12%, Авторитет +6%)',
        delayPreviewEn: '⏳ In 2 turns: enemy park explosion breaks siege (Chokh Pressure -12%, Auth +6%)',
        delayedEffect: {
          delayTurns: 2,
          titleRu: 'Чох выстоял! Осадный корпус отходит от стен!',
          titleEn: 'Chokh Stands Unbroken! Siege Corps Pulls Back!',
          textRu: 'Меткий огонь горской батареи и твёрдость башен принудили осаждающих свернуть лагерь под Чохом.',
          textEn: 'Accurate highland gunnery and rock-solid bastions forced the besiegers to break camp before Chokh.',
          targetNaibId: 'chokh',
          pressureDelta: -12,
          authorityDelta: 6,
          gloryDelta: 15
        }
      },
      {
        id: 'c2_preserve_shells',
        labelRu: 'Беречь ядра на момент решающего штурма (+14 пороха Чоху, Гарнизон +70)',
        labelEn: 'Save shells for the decisive storming (+14 Chokh powder, Garrison +70)',
        targetNaibId: 'chokh',
        localPowderDelta: 14,
        garrisonDelta: 70,
        delayPreviewRu: '⏳ Через 3 хода: картечный залп в упор отбросит приступ (Натиск -9%, Слава +10)',
        delayPreviewEn: '⏳ In 3 turns: point-blank canister repels stormers (Pressure -9%, Glory +10)',
        delayedEffect: {
          delayTurns: 3,
          titleRu: 'Картечный залп Чохской башни отразил штурм',
          titleEn: 'Chokh Tower Canister Repels the Storming',
          textRu: 'Сбережённые заряды картечи встретили штурмовые лестницы в упор и спасли аул.',
          textEn: 'Conserved canister charges met the scaling ladders point-blank and saved the aul.',
          targetNaibId: 'chokh',
          pressureDelta: -9,
          gloryDelta: 10
        }
      }
    ]
  },
  {
    id: 'dil_32_khalwat_council',
    scenarios: ['all'],
    triggerType: 'politics',
    senderRu: 'Устаз Джамалуддин Казикумухский',
    senderEn: 'Ustaz Jamaluddin of Kazikumukh',
    portraitHint: 'Джамалуддин',
    urgencyRu: 'СОВЕТ ДИВАН-ХАНЫ',
    urgencyEn: 'DIVAN-KHANA COUNCIL',
    titleRu: 'Великий съезд наибов и алимов в Ведено',
    titleEn: 'Grand Assembly of Naibs & Scholars in Vedeno',
    descRu: 'Устаз Джамалуддин советует собрать всех наибов в Диван-хане: огласить общую клятву верности и умерить распри перед решающей кампанией.',
    descEn: 'Ustaz Jamaluddin advises convening all Naibs in Divan-Khana to renew the oath of unity and cool rivalries before the decisive campaign.',
    choices: [
      {
        id: 'c1_convene_assembly',
        labelRu: 'Созвать Великий Диван и щедро угостить гостей (-75₽, -80 пров., Авторитет +7%)',
        labelEn: 'Convene the Grand Divan & host a feast (-75 rub., -80 prov., Auth +7%)',
        silverDelta: -75,
        provisionsDelta: -80,
        authorityDelta: 7,
        allImanDelta: 6,
        delayPreviewRu: '⏳ Через 2 хода: единая клятва снизит амбиции всех наибов (Верность +10, Натиск -5%)',
        delayPreviewEn: '⏳ In 2 turns: unified oath cools rivalries (Loyalty +10, Pressure -5%)',
        delayedEffect: {
          delayTurns: 2,
          titleRu: 'Плоды Великого съезда в Ведено',
          titleEn: 'Fruits of the Grand Vedeno Assembly',
          textRu: 'Сплочённые общей клятвой наибы выставили добавочные сотни и отказались от внутренних распрей.',
          textEn: 'Bound by a common oath, Naibs fielded extra squadrons and set aside internal feuds.',
          allImanDelta: 5,
          allPressureDelta: -5,
          targetNaibId: 'vedeno',
          loyaltyDelta: 10,
          ambitionDelta: -8
        }
      },
      {
        id: 'c2_written_epistle',
        labelRu: 'Разослать соборное послание гонцами (-20₽, Авторитет +3%)',
        labelEn: 'Circulate a conciliar epistle by courier (-20 rub., Auth +3%)',
        silverDelta: -20,
        authorityDelta: 3,
        delayPreviewRu: '⏳ Через 3 хода: послание укрепит тыл (+90 пров., Иман всех +3)',
        delayPreviewEn: '⏳ In 3 turns: epistle steadies the rear (+90 prov., All Iman +3)',
        delayedEffect: {
          delayTurns: 3,
          titleRu: 'Отклик джамаатов на послание Диван-ханы',
          titleEn: 'Jamaats Answer the Divan-Khana Epistle',
          textRu: 'Аулы прислали добровольные подводы с провиантом для гарнизонов передовой.',
          textEn: 'Mountain villages sent voluntary grain carts to frontline garrisons.',
          provisionsDelta: 90,
          allImanDelta: 3
        }
      }
    ]
  }
];

export function pickNextHistoricalDilemma({
  naibates = [],
  resources = {},
  turn = 1,
  resolvedIds = [],
  activeScenarioId = 'camp_1845',
  naibRivalries = [],
  isWinter = false
}) {
  const unresolved = HISTORICAL_DILEMMAS_32.filter((d) => !resolvedIds.includes(d.id));
  const pool = unresolved.length > 0 ? unresolved : HISTORICAL_DILEMMAS_32;

  const scenarioSpecific = pool.filter(
    (d) => Array.isArray(d.scenarios) && d.scenarios.includes(activeScenarioId) && !d.scenarios.includes('all')
  );
  const scenarioTagged = pool.filter(
    (d) => Array.isArray(d.scenarios) && d.scenarios.includes(activeScenarioId)
  );

  const pickByTurn = (arr) => (arr.length > 0 ? arr[Math.abs(turn) % arr.length] : null);

  // 1. Первоочередные дилеммы активного сценария (1839 Ахульго / 1845 Дарго / 1847–1849 Салты-Чох)
  if (scenarioSpecific.length > 0 && turn <= 4) {
    return scenarioSpecific[(turn - 1) % scenarioSpecific.length];
  }

  // 2. Реактивный подбор по состоянию наибов и ресурсов (с ротацией для максимального разнообразия партий)
  const besiegedNaib = naibates.find((n) => n.underSiege);
  if (besiegedNaib) {
    const p =
      pickByTurn(scenarioTagged.filter((d) => d.triggerType === 'siege_war' || d.triggerType === 'besieged')) ||
      pickByTurn(pool.filter((d) => d.triggerType === 'besieged' || d.triggerType === 'siege_war'));
    if (p) {
      return {
        ...p,
        contextNaibId: besiegedNaib.id,
        contextNaibNameRu: besiegedNaib.name,
        contextNaibNameEn: besiegedNaib.nameEn || besiegedNaib.name
      };
    }
  }

  const ambitiousNaib = naibates.find((n) => {
    const prof = computeNaibPoliticalProfile(n, naibRivalries);
    return prof.ambition >= 68 || prof.schismRisk >= 35;
  });
  if (ambitiousNaib) {
    const p = pickByTurn(pool.filter((d) => d.triggerType === 'high_ambition'));
    if (p) {
      return {
        ...p,
        contextNaibId: ambitiousNaib.id,
        contextNaibNameRu: ambitiousNaib.name,
        contextNaibNameEn: ambitiousNaib.nameEn || ambitiousNaib.name
      };
    }
  }

  if (isWinter) {
    const p = pickByTurn(pool.filter((d) => d.triggerType === 'winter'));
    if (p) return p;
  }

  if ((resources.gunpowder || 0) <= 150) {
    const p = pickByTurn(pool.filter((d) => d.triggerType === 'low_powder'));
    if (p) return p;
  }

  if ((resources.provisions || 0) <= 1050) {
    const p = pickByTurn(pool.filter((d) => d.triggerType === 'provisions'));
    if (p) return p;
  }

  if ((resources.ottomanSupport || 0) >= 40) {
    const p = pickByTurn(pool.filter((d) => d.triggerType === 'ottoman'));
    if (p) return p;
  }

  if (scenarioTagged.length > 0 && turn % 2 === 0) {
    return pickByTurn(scenarioTagged);
  }
  return pickByTurn(pool) || HISTORICAL_DILEMMAS_32[0];
}

// ============================================================================
// ОЧЕРЕДЬ ОТЛОЖЕННЫХ ПОСЛЕДСТВИЙ (2–4 ХОДА)
// ============================================================================
export function scheduleDelayedConsequence(queue = [], { turn = 1, packet, choice, contextNaibId = null }) {
  if (!choice?.delayedEffect) return Array.isArray(queue) ? queue : [];
  const eff = choice.delayedEffect;
  const delayTurns = Math.max(2, Math.min(4, Number(eff.delayTurns) || 2));
  const entry = {
    id: `echo-${packet?.id || 'pkt'}-${choice.id || 'c'}-${turn}`,
    sourcePacketId: packet?.id || '',
    sourceTitleRu: packet?.titleRu || '',
    sourceTitleEn: packet?.titleEn || packet?.titleRu || '',
    createdTurn: turn,
    dueTurn: turn + delayTurns,
    delayTurns,
    targetNaibId: eff.targetNaibId || choice.targetNaibId || contextNaibId || null,
    effect: { ...eff }
  };
  return [...(Array.isArray(queue) ? queue : []), entry];
}

export function resolveDueDelayedConsequences({
  queue = [],
  nextTurn = 2,
  naibates = [],
  resources = {}
}) {
  const safeQueue = Array.isArray(queue) ? queue : [];
  const due = safeQueue.filter((item) => (item.dueTurn || 0) <= nextTurn);
  const remainingQueue = safeQueue.filter((item) => (item.dueTurn || 0) > nextTurn);

  if (due.length === 0) {
    return {
      remainingQueue,
      firedEffects: [],
      nextNaibates: naibates,
      nextResources: resources,
      logs: []
    };
  }

  let nextResources = { ...resources };
  let nextNaibates = naibates.map((n) => ({
    ...n,
    traits: { ...(n.traits || {}) },
    politicsDeltas: { ...(n.politicsDeltas || {}) }
  }));
  const logs = [];

  due.forEach((entry) => {
    const eff = entry.effect || {};
    nextResources = {
      ...nextResources,
      gunpowder: Math.max(0, (nextResources.gunpowder || 0) + (eff.powderDelta || 0)),
      provisions: Math.max(0, (nextResources.provisions || 0) + (eff.provisionsDelta || 0)),
      silver: Math.max(0, (nextResources.silver || 0) + (eff.silverDelta || 0)),
      authority: Math.min(100, Math.max(15, (nextResources.authority || 80) + (eff.authorityDelta || 0))),
      ottomanSupport: Math.min(100, Math.max(0, (nextResources.ottomanSupport || 30) + (eff.ottomanDelta || 0)))
    };

    const targetId = entry.targetNaibId || eff.targetNaibId || null;
    if (
      targetId ||
      eff.allImanDelta ||
      eff.allPressureDelta
    ) {
      nextNaibates = nextNaibates.map((n) => {
        const isTarget = Boolean(targetId && n.id === targetId);
        if (!isTarget && !eff.allImanDelta && !eff.allPressureDelta) return n;
        const nextPressure = Math.max(
          12,
          Math.min(
            95,
            (n.imperialPressure || 50) +
              (isTarget ? eff.pressureDelta || 0 : 0) +
              (eff.allPressureDelta || 0)
          )
        );
        const prevDeltas = n.politicsDeltas || {};
        return {
          ...n,
          imperialPressure: nextPressure,
          underSiege: nextPressure >= 80 ? true : nextPressure < 68 ? false : n.underSiege,
          garrison: Math.max(400, (n.garrison || 800) + (isTarget ? eff.garrisonDelta || 0 : 0)),
          gunpowder: Math.max(6, (n.gunpowder || 20) + (isTarget ? eff.localPowderDelta || 0 : 0)),
          traits: {
            ...n.traits,
            iman: Math.min(
              100,
              Math.max(
                15,
                (n.traits?.iman ?? 75) +
                  (isTarget ? eff.imanDelta || 0 : 0) +
                  (eff.allImanDelta || 0)
              )
            ),
            pride: Math.min(
              100,
              Math.max(10, (n.traits?.pride ?? 45) + (isTarget ? eff.prideDelta || 0 : 0))
            )
          },
          politicsDeltas: isTarget
            ? {
                loyalty: Math.max(-30, Math.min(35, (prevDeltas.loyalty || 0) + (eff.loyaltyDelta || 0))),
                ambition: Math.max(-35, Math.min(35, (prevDeltas.ambition || 0) + (eff.ambitionDelta || 0))),
                glory: Math.max(-25, Math.min(40, (prevDeltas.glory || 0) + (eff.gloryDelta || 0)))
              }
            : prevDeltas
        };
      });
    }

    logs.push({
      id: `log-echo-${entry.id}-${nextTurn}`,
      turn: nextTurn,
      category: 'nizam',
      sender: 'Отголосок решения Диван-ханы',
      senderEn: 'Delayed Consequence of Divan-Khana',
      title: `⏳ ${eff.titleRu || 'Последствие прежнего указа'}`,
      titleEn: `⏳ ${eff.titleEn || eff.titleRu || 'Delayed Decree Consequence'}`,
      text: eff.textRu || 'Прежнее решение Имама принесло свои плоды.',
      textEn: eff.textEn || eff.textRu || 'A past ruling of the Imam has borne fruit.'
    });
  });

  return {
    remainingQueue,
    firedEffects: due,
    nextNaibates,
    nextResources,
    logs
  };
}

// ============================================================================
// QUALITY GATE 3: ДЕТЕРМИНИРОВАННЫЙ МОНТЕ-КАРЛО БАЛАНС 20 000 КАМПАНИЙ
// По 3 флагманским сценариям (1845 Дарго, 1839 Ахульго, 1847–1849 Салты/Чох)
// ============================================================================
function mulberry32(seed) {
  let a = seed >>> 0;
  return function nextRand() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function runScenarioMonteCarloSuite({
  scenarios = [],
  initialNaibates = [],
  runsPerScenario = 6667,
  maxTurns = 12,
  seed = 18450706
}) {
  const rand = mulberry32(seed);
  const flagshipIds = ['camp_1845', 'camp_1839', 'camp_1847'];
  const targetScenarios = flagshipIds
    .map((id) => scenarios.find((s) => s.id === id))
    .filter(Boolean);

  const doctrines = ['defensive', 'balanced', 'raider', 'diplomat'];
  const uniqueDilemmasTriggered = new Set();
  const uniqueOrdersUsed = new Set();

  const perScenario = targetScenarios.map((scen) => {
    let wins = 0;
    let collapses = 0;
    let schismEvents = 0;
    let totalOrders = 0;
    let totalDelayedFired = 0;
    const scores = [];

    // Сценарный профиль натиска: 1845 Дарго (20-тыс. корпус Воронцова), 1847–1849 Война осад (+8 старт), 1839 суровое Ахульго (+11 старт)
    const scenarioPressureStep =
      scen.id === 'camp_1845' ? 11.4 : scen.id === 'camp_1847' ? 9.6 : 10.2;

    for (let r = 0; r < runsPerScenario; r += 1) {
      const doctrine = doctrines[r % doctrines.length];
      let res = {
        gunpowder: scen.initialResources?.gunpowder ?? 195,
        provisions: scen.initialResources?.provisions ?? 1420,
        silver: scen.initialResources?.silver ?? 680,
        authority: scen.initialResources?.authority ?? 84,
        ottomanSupport: scen.initialResources?.ottomanSupport ?? 42
      };
      let naibs = initialNaibates.map((n) => {
        const p = Math.max(15, Math.min(88, (n.imperialPressure || 50) + (scen.pressureModifier || 0)));
        return {
          ...n,
          imperialPressure: p,
          underSiege: p >= 80,
          ordersAwarded: [...(n.ordersAwarded || [])],
          traits: { ...(n.traits || { iman: 75, courage: 80, pride: 45 }) },
          politicsDeltas: { loyalty: 0, ambition: 0, glory: 0 }
        };
      });

      const resolvedDilemmas = [];
      let delayedQueue = [];
      let collapsed = false;
      let runSchism = false;
      const runSkillJitter = (rand() - 0.5) * 7.5;

      for (let t = 1; t <= maxTurns; t += 1) {
        const isWinter = (t - 1) % 4 === 2;

        // 1. Экономический цикл сезона и гарнизонное содержание
        res.gunpowder += (doctrine === 'raider' ? 15 : 19) - (isWinter ? 5 : 0) + Math.round((rand() - 0.5) * 10);
        res.silver += (doctrine === 'diplomat' ? 58 : 48) + Math.round((rand() - 0.5) * 28);
        res.provisions += (isWinter ? -120 : 65) + Math.round((rand() - 0.5) * 90);
        if (res.provisions < 280) {
          res.authority = Math.max(15, res.authority - 3);
        }

        // 2. Пожалование одного из 25 кубачинских орденов (при достаточном серебре и политической нужде)
        const orderThreshold = doctrine === 'diplomat' ? 105 : doctrine === 'defensive' ? 135 : 165;
        if (res.silver >= orderThreshold && (t % 3 === 1 || (doctrine === 'diplomat' && t % 2 === 1))) {
          const ordIdx = Math.floor(rand() * KUBACHI_25_ORDERS_CATALOG.length);
          const ord = KUBACHI_25_ORDERS_CATALOG[ordIdx];
          if (res.silver >= ord.silverCost) {
            let targetIdx = 0;
            let bestPriority = -999;
            for (let i = 0; i < naibs.length; i += 1) {
              const prof = computeNaibPoliticalProfile(naibs[i]);
              const prio = prof.schismRisk + (naibs[i].underSiege ? 28 : 0) + rand() * 18;
              if (prio > bestPriority) {
                bestPriority = prio;
                targetIdx = i;
              }
            }
            const applied = applyOrderAwardToNaibate(naibs[targetIdx], ord);
            naibs[targetIdx] = applied.nextNaibate;
            res.silver -= applied.silverCost;
            res.authority = Math.min(100, res.authority + Math.min(3, applied.authorityDelta));
            totalOrders += 1;
            uniqueOrdersUsed.add(ord.id);
          }
        }

        // 3. Активный приказ Имама (Укрепить / Рейд) по самому угрожаемому наибству — исполнение зависит от политики наиба
        let hotIdx = 0;
        for (let i = 1; i < naibs.length; i += 1) {
          if (naibs[i].imperialPressure > naibs[hotIdx].imperialPressure) hotIdx = i;
        }
        const hotProf = computeNaibPoliticalProfile(naibs[hotIdx]);
        const execChance = Math.max(0.35, Math.min(0.95, 0.72 + hotProf.orderExecutionMod * 0.01));
        if (res.gunpowder >= 16 && rand() < execChance) {
          const relief = (doctrine === 'defensive' ? 13 : doctrine === 'balanced' ? 11 : 9) + Math.round(hotProf.combatBonusPct * 0.2);
          res.gunpowder -= 16;
          const nextP = Math.max(15, naibs[hotIdx].imperialPressure - relief);
          naibs[hotIdx] = {
            ...naibs[hotIdx],
            imperialPressure: nextP,
            underSiege: nextP >= 80
          };
        }

        // 4. Историческая дилемма из HISTORICAL_DILEMMAS_32 с отложенным эхом (2–4 хода)
        const dil = pickNextHistoricalDilemma({
          naibates: naibs,
          resources: res,
          turn: t + (r % 31),
          resolvedIds: resolvedDilemmas,
          activeScenarioId: scen.id,
          isWinter
        });
        if (dil && dil.choices?.length > 0) {
          resolvedDilemmas.push(dil.id);
          uniqueDilemmasTriggered.add(dil.id);
          const ch = dil.choices[rand() < 0.52 ? 0 : dil.choices.length - 1];
          res.gunpowder = Math.max(0, res.gunpowder + (ch.powderDelta || 0));
          res.silver = Math.max(0, res.silver + (ch.silverDelta || 0));
          res.provisions = Math.max(0, res.provisions + (ch.provisionsDelta || 0));
          res.authority = Math.min(100, Math.max(15, res.authority + (ch.authorityDelta || 0)));
          if (ch.allPressureDelta) {
            naibs = naibs.map((n) => ({
              ...n,
              imperialPressure: Math.max(12, Math.min(95, n.imperialPressure + ch.allPressureDelta))
            }));
          }
          delayedQueue = scheduleDelayedConsequence(delayedQueue, {
            turn: t,
            packet: dil,
            choice: ch,
            contextNaibId: dil.contextNaibId || naibs[t % naibs.length]?.id
          });
        }

        // 5. Срабатывание созревших отложенных последствий
        const echoRes = resolveDueDelayedConsequences({
          queue: delayedQueue,
          nextTurn: t,
          naibates: naibs,
          resources: res
        });
        delayedQueue = echoRes.remainingQueue;
        naibs = echoRes.nextNaibates;
        res = echoRes.nextResources;
        totalDelayedFired += echoRes.firedEffects.length;

        // 6. Двухколонный натиск Кавказского корпуса и горская оборона
        const strikeIdxA = Math.floor(rand() * naibs.length);
        const strikeIdxB = (strikeIdxA + 1 + Math.floor(rand() * (naibs.length - 1))) % naibs.length;
        const profA = computeNaibPoliticalProfile(naibs[strikeIdxA]);
        const doctrineDef =
          doctrine === 'defensive' ? 5.2 : doctrine === 'balanced' ? 4.4 : doctrine === 'raider' ? 3.8 : 3.5;
        const reliefFactor =
          doctrineDef +
          runSkillJitter +
          profA.combatBonusPct * 0.14 +
          (res.gunpowder >= 20 ? 2.4 : -5.5);

        const offensiveSurge = rand() < 0.25 ? 7.0 : 0;
        naibs = naibs.map((n, idx) => {
          const isMainStrike = idx === strikeIdxA || idx === strikeIdxB;
          const localSurge = isMainStrike
            ? scenarioPressureStep + offensiveSurge + (rand() * 11 - 3.0) - reliefFactor * 0.65
            : (rand() * 5.0 - 2.6);
          const nextP = Math.max(12, Math.min(95, Math.round(n.imperialPressure + localSurge)));
          const prideDrift = nextP >= 76 && rand() < 0.26 ? 4 : 0;
          return {
            ...n,
            imperialPressure: nextP,
            underSiege: nextP >= 80,
            traits: {
              ...n.traits,
              pride: Math.min(100, (n.traits?.pride ?? 45) + prideDrift)
            }
          };
        });

        // 7. Политический раскол / ослушание наиба при высоком риске откола
        const maxRisk = naibs.reduce((m, n) => Math.max(m, computeNaibPoliticalProfile(n).schismRisk), 0);
        if (maxRisk >= 44 && rand() < 0.2) {
          runSchism = true;
          res.authority = Math.max(15, res.authority - 6);
        }

        const sieges = naibs.filter((n) => n.underSiege).length;
        if (sieges >= 5) {
          res.authority = Math.max(15, res.authority - 7);
        }
        if (sieges >= 6 || res.authority <= 24 || (sieges >= 5 && res.gunpowder <= 8)) {
          collapsed = true;
          break;
        }
      }

      const finalSieges = naibs.filter((n) => n.underSiege).length;
      const avgLoyalty =
        naibs.reduce((s, n) => s + computeNaibPoliticalProfile(n).loyalty, 0) / Math.max(1, naibs.length);
      const score = Math.max(
        5,
        Math.min(
          100,
          Math.round(
            res.authority * 0.44 +
              avgLoyalty * 0.30 +
              Math.min(22, res.gunpowder * 0.08) -
              finalSieges * 10 -
              (collapsed ? 26 : 0)
          )
        )
      );
      scores.push(score);
      if (runSchism) schismEvents += 1;
      if (collapsed) {
        collapses += 1;
      } else if (score >= 56 && finalSieges <= 2) {
        wins += 1;
      }
    }

    const meanScore = scores.reduce((a, b) => a + b, 0) / Math.max(1, scores.length);
    const variance =
      scores.reduce((s, x) => s + (x - meanScore) ** 2, 0) / Math.max(1, scores.length);
    const scoreStdDev = Math.sqrt(variance);

    return {
      scenarioId: scen.id,
      yearLabel: scen.yearLabel,
      runs: runsPerScenario,
      winRatePct: Number(((wins / runsPerScenario) * 100).toFixed(2)),
      collapseRatePct: Number(((collapses / runsPerScenario) * 100).toFixed(2)),
      stalemateRatePct: Number(
        (((runsPerScenario - wins - collapses) / runsPerScenario) * 100).toFixed(2)
      ),
      meanScore: Number(meanScore.toFixed(2)),
      scoreStdDev: Number(scoreStdDev.toFixed(2)),
      avgOrdersAwarded: Number((totalOrders / runsPerScenario).toFixed(2)),
      avgDelayedEchoesFired: Number((totalDelayedFired / runsPerScenario).toFixed(2)),
      schismRatePct: Number(((schismEvents / runsPerScenario) * 100).toFixed(2))
    };
  });

  const totalRuns = perScenario.reduce((s, x) => s + x.runs, 0);
  const dargo = perScenario.find((s) => s.scenarioId === 'camp_1845');
  const siege1847 = perScenario.find((s) => s.scenarioId === 'camp_1847');
  const akhulgo = perScenario.find((s) => s.scenarioId === 'camp_1839');

  const difficultyOrderingOk = Boolean(
    dargo &&
      siege1847 &&
      akhulgo &&
      dargo.winRatePct > akhulgo.winRatePct &&
      dargo.winRatePct >= 45 &&
      dargo.winRatePct <= 88 &&
      siege1847.winRatePct >= 28 &&
      siege1847.winRatePct <= 82 &&
      akhulgo.winRatePct >= 15 &&
      akhulgo.winRatePct <= 72
  );
  const varianceOk = perScenario.every((s) => s.scoreStdDev >= 6.0);
  const diversityOk = uniqueDilemmasTriggered.size >= 24 && uniqueOrdersUsed.size === 25;

  return {
    totalRuns,
    scenariosTested: perScenario.length,
    perScenario,
    uniqueDilemmasTriggered: uniqueDilemmasTriggered.size,
    uniqueOrdersUsed: uniqueOrdersUsed.size,
    difficultyOrderingOk,
    varianceOk,
    diversityOk,
    gate3Pass: totalRuns >= 20000 && difficultyOrderingOk && varianceOk && diversityOk
  };
}
