// ============================================================================
// Каноничные данные кампании 1845: наибства, низамы, суды, кризисы, генералы, словарь, эпилог
// Вынесено из App.jsx (модульная структура веб-прототипа «Имамат: Диван-Хана»)
// ============================================================================


// ============================================================================
// ТОПОГРАФИЧЕСКИЕ 3D-ПОЛИГОНЫ КАВКАЗА (ЭТАП 2: 3D VERTICAL SLICE)
// ============================================================================
export const TACTICAL_3D_TERRAINS = [
  {
    id: 'salty_1847',
    title: 'Аул Салты и Салтинская теснина (1847 г.)',
    titleEn: 'Aul Salty & Saltinka Gorge (1847)',
    subtitle: 'Трёхъярусный бастион Андалала: подземные блиндажи Хаджи-Юсуфа Сафарова и минная война',
    subtitleEn: 'Three-tiered bastion of Andalal: Hajji Yusuf Safarov’s subterranean log blindages and counter-mine warfare',
    cliffSteepness: 1.35,
    gorgeDepth: 1.15,
    terraceSteps: 3,
    elevationMeters: '1290 м над ур. м.',
    elevationMetersEn: '1,290 m ASL',
    deadZoneAngleDeg: 39
  },
  {
    id: 'akhulgo_1839',
    title: 'Скала Ахульго и Сурхаева башня (1839 г.)',
    titleEn: 'Mount Akhulgo & Surkhay’s Tower (1839)',
    subtitle: 'Двойной скальный полуостров в излучине Андийского Койсу и крытый бревенчатый ход к воде',
    subtitleEn: 'Twin cliff peninsula in the Andi Koisu river bend with a covered timber gallery to the water',
    cliffSteepness: 1.68,
    gorgeDepth: 1.45,
    terraceSteps: 4,
    elevationMeters: '620 м (обрыв 430 м)',
    elevationMetersEn: '620 m (430 m drop)',
    deadZoneAngleDeg: 47
  },
  {
    id: 'gunib_1859',
    title: 'Плато Верхний Гуниб и гора Маяк (1859 г.)',
    titleEn: 'Upper Gunib Plateau & Mount Mayak (1859)',
    subtitle: 'Природная цитадель с отвесными известняковыми стенами (78°–88°) и каменными завалами',
    subtitleEn: 'Natural limestone citadel with sheer precipices (78°–88°) and stone breastworks',
    cliffSteepness: 1.82,
    gorgeDepth: 1.3,
    terraceSteps: 4,
    elevationMeters: '1520–2352 м над ур. м.',
    elevationMetersEn: '1,520–2,352 m ASL',
    deadZoneAngleDeg: 52
  },
  {
    id: 'dargo_1845',
    title: 'Хребет Речель и лесной коридор Дарго (1845 г.)',
    titleEn: 'Rechel Ridge & Dargo Forest Defile (1845)',
    subtitle: 'Сплайновая дорога «Сухарной экспедиции» в буковом лесу с поваленными засеками',
    subtitleEn: 'Spline trail of the “Biscuit Expedition” through ancient beech forest blocked by felled abatis',
    cliffSteepness: 0.95,
    gorgeDepth: 0.85,
    terraceSteps: 2,
    elevationMeters: '1180–2100 м над ур. м.',
    elevationMetersEn: '1,180–2,100 m ASL',
    deadZoneAngleDeg: 28
  }
];

// ============================================================================
// ИСТОРИЧЕСКИЕ СЦЕНАРИИ КАМПАНИЙ (1839, 1843, 1845, 1847–1849, 1859 ГГ.)
// 3 флагманские отполированные кампании: 1845 Дарго, 1839 Ахульго, 1847–1849 Война осад
// ============================================================================
export const CAMPAIGN_SCENARIOS = [
  {
    id: 'camp_1839',
    flagship: true,
    yearLabel: '1839 г. — Эпопея Ахульго',
    yearLabelEn: '1839 — The Epic of Akhulgo',
    subtitle: '80-дневная оборона скалы Ахульго и Сурхаевой башни против корпуса ген. П. Х. Граббе',
    subtitleEn: '80-day defense of Mount Akhulgo and Surkhay’s Tower against Gen. P. Kh. Grabbe’s siege corps',
    sceneArt: 'Diorama_Siege_TopDown_Salty_1847.jpg',
    actors: ['Имам Шамиль', 'Байсунгур Беноевский', 'Ген. Граббе'],
    initialResources: { gunpowder: 125, provisions: 740, silver: 340, authority: 78, ottomanSupport: 25 },
    pressureModifier: 11,
    generalIdx: 1,
    goalDesc: 'Удержать скальные бастионы Койсубу, сбить натиск осадных батарей и вывести ядро мюридов в Чечню.',
    goalDescEn: 'Hold the Koisubu cliff bastions, repel the siege batteries, and lead the murid core into Chechnya.'
  },
  {
    id: 'camp_1843',
    yearLabel: '1843 г. — Сверкающий Газават',
    yearLabelEn: '1843 — The Shining Ghazawat',
    subtitle: 'Осенний блицкриг Шамиля, Хаджи-Мурата и Кибит-Магомы: штурм 12 крепостей в Аварии за 75 дней',
    subtitleEn: 'Autumn blitzkrieg of Shamil, Hadji Murad, and Kibit-Magoma: storming 12 Imperial forts in Avaria in 75 days',
    sceneArt: 'Crisis_Kabarda_Tatartup_1846.jpg',
    actors: ['Имам Шамиль', 'Хаджи-Мурат', 'Кибит-Магома'],
    initialResources: { gunpowder: 260, provisions: 1650, silver: 890, authority: 94, ottomanSupport: 55 },
    pressureModifier: -12,
    generalIdx: 2,
    goalDesc: 'Освободить Хунзахское плато, Гергебиль и Гоцатль, захватив артиллерийские парки царских гарнизонов.',
    goalDescEn: 'Liberate the Khunzakh plateau, Gergebil, and Gotsatl while capturing the artillery parks of Tsarist garrisons.'
  },
  {
    id: 'camp_1845',
    flagship: true,
    yearLabel: '1845 г. — Даргинский поход',
    yearLabelEn: '1845 — The Dargo Expedition',
    subtitle: 'Прорыв 20-тысячной армии наместника графа М. С. Воронцова в Ичкерию и «Сухарная экспедиция»',
    subtitleEn: 'Viceroy Count M. S. Vorontsov’s 20,000-strong advance into Ichkeria and the “Biscuit Expedition” ambush',
    sceneArt: 'KeyArt_Dargo_BeechForest_Ambush_1845.jpg',
    actors: ['Имам Шамиль', 'Байсунгур Беноевский', 'Кн. Воронцов'],
    initialResources: { gunpowder: 195, provisions: 1420, silver: 680, authority: 86, ottomanSupport: 48 },
    pressureModifier: 0,
    generalIdx: 0,
    goalDesc: 'Заманить колонну Воронцова в лесной мешок Дарго, перерезать подвоз сухарей на хребте Речель и перенести столицу в Ведено.',
    goalDescEn: 'Lure Vorontsov’s column into the Dargo forest trap, sever the Rechel ridge supply line, and establish the new capital at Vedeno.'
  },
  {
    id: 'camp_1847',
    flagship: true,
    yearLabel: '1847–1849 гг. — Война осад: Салты и Чох',
    yearLabelEn: '1847–1849 — War of Sieges: Salty & Chokh',
    subtitle: 'Минная и артиллерийская война в Центральном Дагестане: оборона Гергебиля, Салтов и неприступного Чоха против кн. Аргутинского',
    subtitleEn: 'Subterranean mining and artillery sieges in Central Dagestan: defense of Gergebil, Salty, and unbroken Chokh against Prince Argutinsky',
    sceneArt: 'Crisis_Chokh_Siege_1849.jpg',
    actors: ['Имам Шамиль', 'Хаджи-Юсуф', 'Кн. Аргутинский'],
    initialResources: { gunpowder: 165, provisions: 1080, silver: 520, authority: 84, ottomanSupport: 42 },
    pressureModifier: 8,
    generalIdx: 1,
    goalDesc: 'Выдержать осадный таран и подкопы под Гергебилем, Салтами и Чохом, сохранив пороховые мельницы и верность аварских наибов.',
    goalDescEn: 'Withstand siege artillery and sapper mines at Gergebil, Salty, and Chokh while safeguarding powder mills and Avar Naib loyalty.'
  },
  {
    id: 'camp_1859',
    yearLabel: '1859 г. — Последний оплот: Гуниб',
    yearLabelEn: '1859 — The Last Bastion: Gunib',
    subtitle: 'Сжатие кольца 200-тысячной армии фельдмаршала А. И. Барятинского и ген. Н. И. Евдокимова',
    subtitleEn: 'Closing ring of Field Marshal A. I. Baryatinsky and Gen. N. I. Evdokimov’s 200,000-man Caucasus army',
    sceneArt: 'Crisis_Chokh_Siege_1849.jpg',
    actors: ['Имам Шамиль', 'Гази-Мухаммад', 'Кн. Барятинский'],
    initialResources: { gunpowder: 95, provisions: 540, silver: 240, authority: 72, ottomanSupport: 20 },
    pressureModifier: 22,
    generalIdx: 3,
    goalDesc: 'Отразить штурмы сходящихся колонн в условиях вырубки чеченских просек и сохранить достоинство Имамата на Гунибе.',
    goalDescEn: 'Withstand converging columns amidst systematic forest clearings and uphold the honor of the Imamate on Upper Gunib.'
  }
];

// ============================================================================
// СОВЕТ УЧЁНЫХ-АЛИМОВ И ПРЕОДОЛЕНИЕ ГОСУДАРСТВЕННОЙ ПЕРЕГРУЗКИ («ЗУЛЬМАТА»)
// ============================================================================
export const TARIKAT_PRACTICES = [
  {
    id: 'practice_khalwat',
    mentor: 'Джамалуддин аль-Газикумухи (Казикумухский)',
    mentorEn: 'Jamaluddin al-Ghazi-Gumuqi of Kazikumukh',
    title: 'Трёхдневное уединение и совет со старейшинами',
    titleEn: 'Three-Day Solitude & Counsel with Elders',
    desc: 'Как описывал пристав А. И. Руновский, в минуты крайнего перенапряжения на Шамиля находил «зульмат» (тяжёлое переутомление от бремени власти). Уединение и мудрый совет тестя и учёного Джамалуддина возвращают Имаму ясность воли.',
    descEn: 'As documented by Col. A. I. Runovsky, moments of extreme military strain triggered “Zulmat” (severe command exhaustion). Solitary reflection and the wise counsel of Jamaluddin restore the Imam’s clarity of will.',
    costSilver: 0,
    costAuthority: 5,
    stressDrop: 24,
    imanBoost: 6,
    authorityGain: 12
  },
  {
    id: 'practice_sogratl_fatwa',
    mentor: 'Абдурахман-Хаджи ас-Сугури и учёные Согратля',
    mentorEn: 'Abdurahman-Hajji as-Sughuri & Scholars of Sogratl',
    title: 'Соборное послание учёных Согратля ко всем джамаатам гор',
    titleEn: 'Conciliar Epistle of the Sogratl Scholars to All Mountain Jamaats',
    desc: 'Учёные-алимы Андалала рассылают по обществам Дагестана и Чечни правовое увещевание о недопустимости утайки пороха и неповиновения наибам в час испытания.',
    descEn: 'The scholars of Andalal circulate a legal epistle across the communities of Dagestan and Chechnya condemning powder hoarding and disobedience to Naibs in the hour of trial.',
    costSilver: 90,
    costAuthority: 0,
    stressDrop: 15,
    imanBoost: 10,
    authorityGain: 8
  },
  {
    id: 'practice_loud_zikr',
    mentor: 'Кадии и старейшины Ичкерии',
    mentorEn: 'Qadis & Elders of Ichkeria',
    title: 'Общий сход и присяга сотен перед выступлением в поход',
    titleEn: 'General Assembly & Oath of the Squadrons Before Marching to Battle',
    desc: 'Воодушевление конных сотен муртазеков и пеших ополченцев перед решительным боем в лесных засеках: страх отступает, а натиск царских колонн захлёбывается.',
    descEn: 'Rallying of Murtazek cavalry squadrons and militia ahead of decisive forest-abatis combat: fear recedes and Imperial columns falter.',
    costSilver: 60,
    costAuthority: 0,
    stressDrop: 12,
    imanBoost: 8,
    authorityGain: 6
  }
];

// ============================================================================
// ТЕХНИЧЕСКИЙ РЕЕСТР 3D-АССЕТОВ И ГЕОДАННЫХ ДЛЯ UNREAL ENGINE 5 (ЭТАП 2)
// ============================================================================
export const UE5_ASSET_PIPELINE = [
  {
    code: 'DEM_SRTM_DAG_01',
    category: 'Ландшафт и Геодезия (World Partition)',
    categoryEn: 'Landscape & Geodesy (World Partition)',
    title: 'Спутниковые карты высот NASA SRTM (Ахульго, Гуниб, Хунзах, Салты)',
    titleEn: 'NASA SRTM 16-bit Heightmaps (Akhulgo, Gunib, Khunzakh, Salty)',
    polybudget: 'Nanite Landscape (16K Heightmap, точность до 5 м)',
    polybudgetEn: 'Nanite Landscape (2017×2017 .r16, 5m precision)',
    shaderSpec: 'Процедурный материал крутизны склона: известняк (>60°), искусственные террасы пашен (25°–55°), альпийские луга Джайляу',
    shaderSpecEn: 'Procedural slope material: sheer limestone (>60°), cultivated terraces (25°–55°), alpine Jailau pastures',
    readyPercent: 100
  },
  {
    code: 'CHAR_METAHUMAN_01',
    category: 'Персонажи (MetaHuman + Marvelous Designer)',
    categoryEn: 'Characters (MetaHuman + Marvelous Designer)',
    title: 'Имам Шамиль, Хаджи-Мурат, Байсунгур, кн. Воронцов и кн. Барятинский',
    titleEn: 'Imam Shamil, Hadji Murad, Baysungur, Prince Vorontsov & Baryatinsky',
    polybudget: 'LOD0: 85 000 tris (Groom-борода, физика сукна черкески и бурки)',
    polybudgetEn: 'LOD0: 85,000 tris (Groom beard, Chaos cloth cherkesska & burka)',
    shaderSpec: 'Фотограмметрия по портретам А. И. Деньера (1859) и рисункам кн. Г. Г. Гагарина (1851); 18 нагрудных газырей с серебряной чернью',
    shaderSpecEn: 'Photogrammetry from A. Denier (1859) & Prince G. Gagarin (1851) portraits; 18 silver-niello chest gazyrs',
    readyPercent: 92
  },
  {
    code: 'SIEGE_CHAOS_02',
    category: 'Инженерия и Разрушаемость (Chaos Destruction)',
    categoryEn: 'Siege Engineering & Destruction (Chaos)',
    title: 'Многоярусные каменные сакли Чоха и подземные блиндажи в 3–4 наката',
    titleEn: 'Multi-Tiered Stone Saklyas of Chokh & 3–4 Layer Log Blindages',
    polybudget: 'Geometry Collection (динамическое обрушение стен в уличные завалы)',
    polybudgetEn: 'Geometry Collection (dynamic wall collapse into street barricades)',
    shaderSpec: 'Визуализация минных галерей в разрезе скалы и водной ряби в медном тазу Хаджи-Юсуфа Сафарова',
    shaderSpecEn: 'Subterranean sap galleries in Milyutin cliff cutaway & ripple shader in Hajji Yusuf’s copper basin',
    readyPercent: 88
  },
  {
    code: 'WEAP_BALLISTICS_03',
    category: 'Вооружение и Награды (Niagara VFX)',
    categoryEn: 'Weaponry & Decorations (Niagara VFX)',
    title: 'Штуцера, кинжалы «Базалай», горные единороги и серебряные ордена Шамиля',
    titleEn: 'Stutzers, Bazalai Daggers, Mountain Unicorns & Shamil’s Silver Medals',
    polybudget: 'PBR 4K (серебро, глубокая кубачинская чернь, позолота, дамасская сталь)',
    polybudgetEn: 'PBR 4K (silver, deep Kubachi niello, gilding, Damascus steel)',
    shaderSpec: 'Честная параболическая баллистика ядер и пудовых мортирных бомб с объёмным пороховым дымом (Volumetric Fog)',
    shaderSpecEn: 'True parabolic ballistics for cannonballs and 1-pood mortar shells with volumetric black-powder smoke',
    readyPercent: 95
  }
];

// ============================================================================
// КЛИМАТИЧЕСКАЯ МАТРИЦА ВРЕМЁН ГОДА И ВЕРТИКАЛЬНОЙ КОЧЁВКИ (ДЖАЙЛЯУ / КУТАНЫ)
// ============================================================================
export const SEASON_CLIMATE_MODIFIERS = [
  {
    title: 'Июнь 1845 г. (Джумада ас-сани 1261 г. х.)',
    titleEn: 'June 1845 (Jumada al-Thani 1261 AH)',
    seasonType: 'Летнее открытие перевалов',
    seasonTypeEn: 'Summer Opening of High Passes',
    weatherDesc: 'Снега на Андийском хребте тают: отары поднимаются на альпийские луга Джайляу, но царские колонны получают доступ к перевалам.',
    weatherDescEn: 'Snows melt on the Andi ridge: flocks ascend to alpine Jailau pastures, while Imperial columns gain access to mountain passes.',
    provisionsMod: 35,
    powderMod: 5,
    imperialPressureMod: 4
  },
  {
    title: 'Июль 1845 г. (Раджаб 1261 г. х.)',
    titleEn: 'July 1845 (Rajab 1261 AH)',
    seasonType: 'Разгар летней кампании и грозы в горах',
    seasonTypeEn: 'Peak Summer Campaign & Mountain Storms',
    weatherDesc: 'Ливни в буковых лесах Ичкерии размывают глинистые спуски с хребта Речель, сковывая обозы и артиллерийские упряжки.',
    weatherDescEn: 'Downpours in Ichkeria’s beech forests turn Rechel ridge clay trails into mud, bogging down supply trains and gun carriages.',
    provisionsMod: 45,
    powderMod: 0,
    imperialPressureMod: 3
  },
  {
    title: 'Август 1845 г. (Шаабан 1261 г. х.)',
    titleEn: 'August 1845 (Sha’ban 1261 AH)',
    seasonType: 'Жатва на горных террасах',
    seasonTypeEn: 'Harvest on Mountain Terraces',
    weatherDesc: 'Сбор кукурузы, полбы и фруктов в садах Андалала и долинах Койсу. Максимальное пополнение провианта Байт аль-маль.',
    weatherDescEn: 'Harvesting maize, spelt, and orchards across Andalal and the Koisu valleys. Peak replenishment of Bayt al-Mal provisions.',
    provisionsMod: 85,
    powderMod: 8,
    imperialPressureMod: 2
  },
  {
    title: 'Сентябрь 1845 г. (Рамадан 1261 г. х.)',
    titleEn: 'September 1845 (Ramadan 1261 AH)',
    seasonType: 'Осенний сгон отар и время набегов',
    seasonTypeEn: 'Autumn Flock Descent & Cavalry Raid Season',
    weatherDesc: 'Отары спускаются с высокогорий; конные сотни муртазеков выходят в глубокие осенние рейды на плоскость.',
    weatherDescEn: 'Flocks descend from high ridges; Murtazek cavalry squadrons launch deep autumn raids across the lowland cordon.',
    provisionsMod: 50,
    powderMod: 12,
    imperialPressureMod: -2
  },
  {
    title: 'Октябрь 1845 г. (Шавваль 1261 г. х.)',
    titleEn: 'October 1845 (Shawwal 1261 AH)',
    seasonType: 'Осенняя распутица и ранние снега',
    seasonTypeEn: 'Autumn Mud & Early Mountain Snows',
    weatherDesc: 'Туманы в теснинах и первый снег на перевалах Буцрах и Хунзах: продвижение тяжёлых осадных парков Империи замедляется.',
    weatherDescEn: 'Dense gorge fog and early snow on the Butsrakh and Khunzakh passes slow the advance of heavy Imperial siege trains.',
    provisionsMod: 15,
    powderMod: 4,
    imperialPressureMod: -4
  },
  {
    title: 'Ноябрь 1845 г. (Зу-ль-каада 1261 г. х.)',
    titleEn: 'November 1845 (Dhu al-Qa’dah 1261 AH)',
    seasonType: 'Зимняя блокада зимних пастбищ (Кутанов)',
    seasonTypeEn: 'Winter Blockade of Lowland Pastures (Kutans)',
    weatherDesc: 'Морозы сковывают высокогорья. Округа без доступа к зимним кутанам на плоскости несут повышенный расход зерна.',
    weatherDescEn: 'Frost locks the highlands. Districts cut off from lowland winter Kutan pastures suffer elevated grain consumption.',
    provisionsMod: -25,
    powderMod: 6,
    imperialPressureMod: -5
  }
];

// ============================================================================
// ИСТОРИЧЕСКИЙ ЭПИЛОГ (1859–1877 ГГ.): КАЛУГА, СТАМБУЛ И «МАЛЫЙ ГАЗАВАТ»
// ============================================================================
export const EPILOGUE_CHAPTERS = [
  {
    id: 'epilogue_kaluga_1859',
    period: '1859–1868 гг. • Чугуев — Санкт-Петербург — Калуга',
    periodEn: '1859–1868 • Chuguev — St. Petersburg — Kaluga',
    title: 'Почётный плен в Калуге и беседы с приставом А. И. Руновским',
    titleEn: 'Honorable Captivity in Kaluga & Conversations with Col. A. I. Runovsky',
    location: 'Трёхэтажный особняк Н. М. Суходольской в Калуге',
    locationEn: 'Sukhodolskaya Mansion in Kaluga',
    historicalNarrative:
      'После встречи с императором Александром II в Чугуеве (15 сентября 1859 г.), где государь обнял Шамиля и оставил ему дедовскую шашку, семья имама поселилась в Калуге. За вечерним самоваром и изучением музыкальной шкатулки Шамиль диктует приставу полковнику А. И. Руновскому и своему зятю Абдурахману из Газикумуха историю Низамов и обороны Ахульго, а 26 августа 1866 года в Белом зале Калужского дворянского собрания приносит торжественную присягу о мире между горцами и Россией.',
    historicalNarrativeEn:
      'Following his meeting with Emperor Alexander II in Chuguev (September 15, 1859), where the Tsar embraced Shamil and permitted him to keep his ancestral shashka, the Imam’s family settled in Kaluga. Over evening tea, Shamil dictated the history of the Nizams and the defense of Akhulgo to Colonel A. I. Runovsky and his son-in-law Abdurahman of Gazikumukh, and on August 26, 1866 took a solemn oath of peace between the mountaineers and Russia.',
    decisions: [
      {
        id: 'kaluga_chronicle',
        label: 'Поручить зятю Абдурахману и А. И. Руновскому составить полную летопись Имамата для потомков',
        labelEn: 'Commission son-in-law Abdurahman and Col. Runovsky to compile the complete chronicle of the Imamate',
        outcome: 'Созданы «Книга воспоминаний» и «Дневник полковника Руновского» (XII том АКАК). Историческая память сохранена на века (+12% Авторитет в веках).',
        outcomeEn: 'Produced the “Book of Memories” and “Colonel Runovsky’s Diary” (AKAK Vol. XII). Historical memory preserved for posterity (+12% Legacy Authority).'
      },
      {
        id: 'kaluga_przeclawski',
        label: 'Направить письмо фельдмаршалу кн. А. И. Барятинскому и Д. А. Милютину против произвола пристава Пржецлавского',
        labelEn: 'Appeal to Field Marshal Prince Baryatinsky and War Minister D. A. Milyutin against Bailiff Przeclawski’s abuses',
        outcome: 'Военное министерство отстраняет Пржецлавского (1866 г.), а в 1869 г. Александр II разрешает Шамилю выезд в священный Хадж и возводит род имама в потомственное дворянство.',
        outcomeEn: 'The War Ministry dismisses Przeclawski (1866), and in 1869 Alexander II grants Shamil permission to depart for the holy Hajj and elevates his family to hereditary nobility.'
      }
    ]
  },
  {
    id: 'epilogue_istanbul_1869',
    period: '19 мая 1869 — 4 февраля 1871 г. • Стамбул — Суэцкий канал — Мекка и Медина',
    periodEn: 'May 19, 1869 — February 4, 1871 • Istanbul — Suez Canal — Mecca & Medina',
    title: 'Триумф в Стамбуле (Дворец Долмабахче и особняк в Коска) и уход в вечность в Медине',
    titleEn: 'Triumph in Istanbul (Dolmabahçe Palace & Koska Mansion) and Passing in Medina',
    location: 'Дворец Долмабахче, конак Зариф-паши в квартале Коска и кладбище Джаннат аль-Баки',
    locationEn: 'Dolmabahçe Palace, Zarif Pasha Mansion in Koska & Jannat al-Baqi in Medina',
    historicalNarrative:
      'Прибытие 72-летнего Шамиля в Стамбул вызывает небывалый восторг: на пристани Топхане тысячи людей целуют полы его черкески, а в квартале Коска ему отводят дворец Зариф-паши. 15 августа 1869 года во дворце Долмабахче султан Абдул-Азиз выходит навстречу старцу, целует его руку и произносит: «Если бы из гроба встал мой отец султан Махмуд II, я не радовался бы больше!». Примирив султана с египетским хедивом Исмаилом на открытии Суэцкого канала, Шамиль совершает хадж на крыше Каабы и 4 февраля 1871 года мирно уходит из жизни в Медине.',
    historicalNarrativeEn:
      'The 72-year-old Imam’s arrival in Istanbul sparked extraordinary acclaim: crowds at Tophane pier kissed the hem of his cherkesska. On August 15, 1869 at Dolmabahçe Palace, Sultan Abdülaziz stepped forward to kiss Shamil’s hand, declaring: “Had my father Sultan Mahmud II risen from the grave, I could not rejoice more!” After reconciling the Sultan with Khedive Ismail at the Suez Canal opening, Shamil prayed atop the Kaaba in Mecca and passed away peacefully in Medina on February 4, 1871.',
    decisions: [
      {
        id: 'istanbul_muhajirs',
        label: 'Обратиться к кавказским мухаджирам в особняке Коска с заполнением завета беречь родные горы',
        labelEn: 'Address the Caucasian Muhajir diaspora at the Koska mansion with a testament to cherish their native mountains',
        outcome: 'Шамиль предостерегает горцев от необдуманного переселения на чужбину и посещает могилу своего наставника и тестя Джамалуддина Казикумухского на кладбище Караджаахмет в Ускюдаре.',
        outcomeEn: 'Shamil cautions mountaineers against reckless emigration and visits the grave of his mentor and father-in-law Jamaluddin of Gazikumukh at Karacaahmet Cemetery in Üsküdar.'
      },
      {
        id: 'istanbul_dolmabahce',
        label: 'Сказать султану Абдул-Азизу во дворце Долмабахче прямую правду о годах войны в горах',
        labelEn: 'Speak the candid truth to Sultan Abdülaziz at Dolmabahçe Palace regarding the decades of solitary struggle',
        outcome: 'Честный ответ имама о том, что четверть века горцы сражались в одиночку, входит во все хроники Османского архива (BOA) и стамбульские газеты «Terakki» и «Basiret».',
        outcomeEn: 'The Imam’s frank words—that for a quarter century the mountaineers fought alone without promised armies—are recorded in the Ottoman Archives (BOA) and Istanbul press (“Terakki”, “Basiret”).'
      }
    ]
  },
  {
    id: 'epilogue_1877_ghazawat',
    imageUrl: 'Portrait_Muhammad_Hajji_Sogratl_1877.jpg',
    period: 'Апрель — 3 ноября 1877 г. • Зандак — Ведено — Цудахар — Согратль',
    periodEn: 'April — November 3, 1877 • Zandak — Vedeno — Tsudakhar — Sogratl',
    title: '«Малый газават» 1877 года: 4-й имам Мухаммад-Хаджи Согратлинский и Алибек-Хаджи Алдамов',
    titleEn: 'The “Lesser Ghazawat” of 1877: 4th Imam Muhammad-Hajji of Sogratl & Alibek-Hajji Aldamov',
    location: 'Аул Согратль, поле Анада близ Гуниба и крепость Грозная',
    locationEn: 'Aul Sogratl, Anada Field near Gunib & Fort Groznaya',
    historicalNarrative:
      'Спустя 6 лет после кончины Шамиля, в разгар Русско-турецкой войны 1877–1878 гг., когда сын Шамиля мушир Гази-Мухаммад-паша ведёт кавказскую конницу под Карсом и Баязетом, в Чечне (имам Алибек-Хаджи Алдамов и 68-летний наиб Ума Дуев) и Дагестане вспыхивает восстание 500 аулов. 85-летний шейх Абдурахман-Хаджи Согратлинский предупреждает, что без подхода регулярной армии восстание обречено, но под давлением народа его сын Мухаммад-Хаджи становится 4-м имамом Дагестана и принимает мученическую смерть после штурма Согратля (1–3 ноября 1877 г.).',
    historicalNarrativeEn:
      'Six years after Shamil’s death, during the Russo-Turkish War of 1877–1878 while Shamil’s son Mushir Ghazi-Muhammad Pasha led Caucasian cavalry at Kars and Bayazet, an uprising of 500 villages erupted across Chechnya (Imam Alibek-Hajji Aldamov & 68-year-old Naib Uma Duev) and Dagestan. The 85-year-old Sheikh Abdurahman-Hajji of Sogratl warned that without regular artillery the revolt was doomed, yet his son Muhammad-Hajji accepted the mantle of 4th Imam and met martyrdom after the siege of Sogratl (Nov 1–3, 1877).',
    decisions: [
      {
        id: 'sogratl_warning',
        label: 'Изучить пророческое предостережение шейха Абдурахмана-Хаджи ас-Сугури и хронику Гасана Алкадари',
        labelEn: 'Study the prophetic warning of Sheikh Abdurahman-Hajji as-Sughuri and Hasan Alkadari’s chronicle',
        outcome: 'Математическая модель подтверждает расчёт шейха Абдурахмана: при отсутствии пороховых заводов и 9-кратном перевесе нарезной артиллерии кн. Л. И. Меликова открытая оборона аулов ведёт к трагедии Цудахара и Согратля.',
        outcomeEn: 'Mathematical simulation confirms Sheikh Abdurahman’s calculation: without powder mills and facing a 9-fold superiority in breech-loading rifled artillery under Prince Melikov, static siege defense leads inevitably to the tragedy of Tsudakhar and Sogratl.'
      },
      {
        id: 'sogratl_memory',
        label: 'Увековечить память героев 1877 года на поле Саланиб (Анада) и в Грозной',
        labelEn: 'Commemorate the fallen of 1877 at Salanib (Anada Field) and Fort Groznaya',
        outcome: 'В летопись игры занесены имена 4-го имама Мухаммад-Хаджи, его брата учёного Абдуллы-Хаджи, Ника-кади Цудахарского, Алибека-Хаджи Алдамова и Умы-Хаджи Дуева.',
        outcomeEn: 'The chronicle permanently inscribes the names of 4th Imam Muhammad-Hajji, his scholar brother Abdullah-Hajji, Nika-Qadi of Tsudakhar, Alibek-Hajji Aldamov, and Uma-Hajji Duev.'
      }
    ]
  }
];

// ============================================================================
// АРХИВ ИСТОРИЧЕСКИХ ЛИЧНОСТЕЙ, ИГРОВЫХ ПЕРКОВ И ИИ-ПРОМПТОВ (METAHUMAN / FLUX)
// ============================================================================
export const HISTORICAL_FIGURES_ARCHIVE = [
  {
    id: 'shamil_1859',
    imageUrl: 'Portrait_Imam_Shamil_Vedeno_1845.jpg',
    name: 'Имам Шамиль (Сердар-ы Экрем)',
    nameEn: 'Imam Shamil (Serdar-ı Ekrem)',
    side: 'Северо-Кавказский Имамат',
    sideEn: 'Caucasian Imamate',
    role: 'Верховный правитель, законодатель Низама и полководец',
    roleEn: 'Supreme Ruler, Lawgiver of the Nizam & Commander-in-Chief',
    archivalSource: 'Фотопортрет А. И. Деньера (СПб, октябрь 1859 г.) и литография В. Ф. Тимма',
    archivalSourceEn: 'Photograph by A. I. Denier (St. Petersburg, Oct 1859) & lithography by V. F. Timm',
    distinctiveFeatures: 'Высокий рост (188 см), рыжевато-седая борода, полуприкрытые сосредоточенные глаза, белая чалма поверх чёрной папахи, суконная черкеска без лишней роскоши.',
    distinctiveFeaturesEn: 'Tall stature (188 cm), henna-tinted graying beard, focused half-hooded eyes, white muslin turban wrapped over black papakha, austere wool cherkesska.',
    perkTitle: '«Оперативная маскировка и печать Диван-ханы»',
    perkTitleEn: '“Operational Deception & Seal of the Divan-Khana”',
    perkSummary: 'Авторитет +8%, Стресс правителя -10%, перехват гонцов снижен',
    perkSummaryEn: 'Authority +8%, Leader Strain -10%, reduced envoy interception risk',
    aiPrompt:
      'Ultra-detailed 8k historical portrait of Imam Shamil (1845), tall Caucasian mountain leader, full henna-tinted graying beard, piercing calm eyes, wearing black sheepskin papakha wrapped in white muslin turban, dark wool cherkesska with 18 silver-capped gazyrs, holding an ornate silver-niello shashka hilt, chiaroscuro lighting, Franz Roubaud and Roger Deakins aesthetic --ar 16:9 --style raw',
    bonus: { authority: 8, powder: 10, silver: 0, imanAll: 5 }
  },
  {
    id: 'hadji_murat_1851',
    imageUrl: 'Portrait_Hadji_Murat_Khunzakh_1851.jpg',
    name: 'Хаджи-Мурат Хунзахский',
    nameEn: 'Hadji Murad of Khunzakh',
    side: 'Северо-Кавказский Имамат',
    sideEn: 'Caucasian Imamate',
    role: 'Легендарный наиб Аварии и мастер глубоких кавалерийских рейдов',
    roleEn: 'Legendary Naib of Avaria & Master of Deep Cavalry Raids',
    archivalSource: 'Прижизненный акварельный портрет кн. Г. Г. Гагарина (Тифлис, декабрь 1851 г.)',
    archivalSourceEn: 'Life watercolor portrait by Prince G. G. Gagarin (Tiflis, Dec 1851)',
    distinctiveFeatures: 'Широко расставленные горящие чёрные глаза, коротко остриженная голова, лёгкая хромота после прыжка со скалы в Хунзахе, белая черкеска с кубачинским оружием.',
    distinctiveFeaturesEn: 'Wide-set burning dark eyes, closely cropped head, slight limp from leaping off the Khunzakh cliff, white cherkesska with Kubachi weapons.',
    perkTitle: '«Ночной рейд сквозь кордонную линию»',
    perkTitleEn: '“Night Cavalry Raid Across the Cordon Line”',
    perkSummary: '+25 пуд. трофейного пороха, +90 руб. серебром, смелость Хунзаха максимальна',
    perkSummaryEn: '+25 poods captured gunpowder, +90 silver rubles, maximum Courage in Khunzakh',
    aiPrompt:
      'Photorealistic 3D MetaHuman character portrait of Naib Hadji-Murat of Khunzakh based on Prince Grigory Gagarin 1851 sketch, intense dark eyes, aquiline nose, trimmed dark beard, white wool Circassian coat with gold-inlaid silver gazyrs and Bazalai kama dagger, mountain mist background, Unreal Engine 5.5 Subsurface Scattering --ar 16:9 --style raw',
    bonus: { authority: 4, powder: 25, silver: 90, imanAll: 3 }
  },
  {
    id: 'baysungur_benoy',
    imageUrl: 'Portrait_Baysungur_Benoy_1845.jpg',
    name: 'Байсунгур Беноевский',
    nameEn: 'Baysungur of Benoy',
    side: 'Северо-Кавказский Имамат',
    sideEn: 'Caucasian Imamate',
    role: 'Наиб Беноя и символ несгибаемой стойкости Ичкерии',
    roleEn: 'Naib of Benoy & Symbol of Unyielding Ichkerian Fortitude',
    archivalSource: 'Военно-исторические описания штурма Ахульго (1839), Дарго (1845) и Гуниба (1859)',
    archivalSourceEn: 'Military-historical chronicles of Ahulgo (1839), Dargo (1845), and Gunib (1859)',
    distinctiveFeatures: 'Одноглазый, однорукий и одноногий ветеран, которого мюриды ремнями привязывали к седлу боевого коня перед рубкой.',
    distinctiveFeaturesEn: 'One-eyed, one-armed, one-legged veteran strapped to his warhorse saddle by murids before leading shashka charges.',
    perkTitle: '«Привязанный к седлу: Прорыв кольца»',
    perkTitleEn: '“Strapped to the Saddle: Breaking the Siege Ring”',
    perkSummary: 'Иман всех наибов +7, +140 муртазеков в гарнизоны, мораль в осаде не падает',
    perkSummaryEn: 'All Naibs Iman +7, +140 Murtazeks to garrisons, unbreakable siege morale',
    aiPrompt:
      'Cinematic historical warrior Naib Baysungur of Benoy in 1845 Dargo forest battle, battle-scarred veteran with eye patch, strapped to horse saddle, drawing a gleaming Gurda shashka with his single hand, surrounded by beech trees and gunpowder smoke, dramatic volumetric lighting, 8k photorealistic --ar 16:9 --style raw',
    bonus: { authority: 6, powder: 15, silver: 0, imanAll: 7 }
  },
  {
    id: 'safarov_engineer',
    imageUrl: 'Portrait_Hadji_Yusuf_Safarov_1845.jpg',
    name: 'Хаджи-Юсуф Сафаров и Идрис Гергебильский',
    nameEn: 'Col. Hajji Yusuf Safarov & Idris of Gergebil',
    side: 'Северо-Кавказский Имамат',
    sideEn: 'Caucasian Imamate',
    role: 'Главные военные инженеры-фортификаторы и мастера порохового дела',
    roleEn: 'Chief Military Fortification Engineers & Saltpeter Masters',
    archivalSource: 'Инженерные журналы осад Гергебиля, Салтов и Чоха (атлас Д. А. Милютина)',
    archivalSourceEn: 'Siege engineering journals of Gergebil, Salty & Chokh (Col. D. A. Milyutin’s Atlas)',
    distinctiveFeatures: 'Выпускник инженерной школы Ибрагим-паши в Каире; восточный офицерский чекмень, циркуль, чертежи блиндажей в 4 наката и медный таз для прослушки сап.',
    distinctiveFeaturesEn: 'Graduate of Ibrahim Pasha’s engineering school in Cairo; officer coat, dividers, 4-layer blindage blueprints, and acoustic copper water basin.',
    perkTitle: '«Египетская школа фортификации и селитренные чаны»',
    perkTitleEn: '“Egyptian Fortification School & Saltpeter Vats”',
    perkSummary: '+45 пуд. отборного пороха, снижение натиска артиллерии врага во всех округах',
    perkSummaryEn: '+45 poods refined gunpowder, reduces enemy artillery pressure across all Naibates',
    aiPrompt:
      'Historical portrait of Colonel Hadji-Yusuf Safarov, chief military engineer of Imam Shamil, examining a topographic parchment map of Salty fortress inside a timber underground bunker, copper water basin on stone floor detecting sapper vibrations, warm oil lamp chiaroscuro, 8k --ar 16:9 --style raw',
    bonus: { authority: 5, powder: 45, silver: 40, imanAll: 4 }
  },
  {
    id: 'pirogov_surgeon',
    imageUrl: 'Portrait_Pirogov_Salty_1847.jpg',
    name: 'Николай Иванович Пирогов (Осада Салтов, 1847)',
    nameEn: 'Nikolai Ivanovich Pirogov (Siege of Salty, 1847)',
    side: 'Не-боевые исторические лица и Гуманизм',
    sideEn: 'Non-Combat Historical Figures & Medical Humanitarianism',
    role: 'Великий хирург, впервые в мировой истории применивший эфирный наркоз в полевых условиях под Салтами',
    roleEn: 'Pioneering surgeon who performed the world’s first field ether anesthesia at the Siege of Salty',
    archivalSource: '«Отчёт о путешествии по Кавказу» Н. И. Пирогова (1849) и музей в с. Салта',
    archivalSourceEn: 'N. I. Pirogov’s “Report on a Medical Journey to the Caucasus” (1849) & Salty Museum',
    distinctiveFeatures: 'Полевой кожаный фартук поверх мундира медика, аппарат для вдыхания паров серного эфира, палатка перевязочного пункта под скалами Андалала.',
    distinctiveFeaturesEn: 'Field leather apron over medical coat, glass ether vapor inhaler, dressing tent beneath the cliffs of Andalal.',
    perkTitle: '«Полевой эфирный наркоз и спасение раненых»',
    perkTitleEn: '“Field Ether Anesthesia & Saving the Wounded”',
    perkSummary: 'Снижает безвозвратные потери гарнизонов, +140 мер провианта и +7% Авторитета',
    perkSummaryEn: 'Reduces permanent garrison casualties, +140 measures of provisions & +7% Authority',
    aiPrompt:
      'Historical scene 1847 Siege of Salty in Dagestan: Russian surgeon Nikolai Pirogov performing the first field ether anesthesia in a canvas medical tent with mountain peaks in background, historical surgical instruments and glass ether inhaler, realistic oil painting aesthetic by Franz Roubaud, 8k --ar 16:9 --style raw',
    bonus: { authority: 7, powder: 0, silver: 60, imanAll: 5 }
  },
  {
    id: 'runovsky_tsinandali',
    imageUrl: 'KeyArt_Michik_1855_Jamaluddin_Exchange.jpg',
    name: 'Полковник А. И. Руновский, кн. А. Чавчавадзе и мадам Дрансе',
    nameEn: 'Col. A. I. Runovsky, Princess A. Chavchavadze & Mme. Drancey',
    side: 'Дипломатия, Размен на Мичике и Хроники',
    sideEn: 'Diplomacy, Michik River Exchange & Historical Chronicles',
    role: 'Свидетели внутреннего мира Имамата в Ведено (1854–1855) и Калуге (1859–1862)',
    roleEn: 'Witnesses to the inner life of the Imamate in Vedeno (1854–1855) and Kaluga (1859–1862)',
    archivalSource: '«Дневник полковника Руновского» (АКАК, т. XII) и мемуары А. Дрансе «Пленницы у Шамиля»',
    archivalSourceEn: '“Diary of Col. Runovsky” (AKAK Vol. XII) & Mme. Drancey’s memoirs “Captives of Shamil”',
    distinctiveFeatures: 'Дипломатический размен на берегу реки Мичик (10 марта 1855 г.) с участием старшего сына имама — поручика Джемалуддина.',
    distinctiveFeaturesEn: 'Historic prisoner exchange on the Michik River bank (March 10, 1855) returning Shamil’s eldest son Lt. Jamaluddin.',
    perkTitle: '«Дипломатический мост и правдивая летопись»',
    perkTitleEn: '“Diplomatic Bridge & Authentic Chronicle”',
    perkSummary: '+160 руб. серебром в казну Байт аль-маль, +9% Авторитета и снижение стресса Имама',
    perkSummaryEn: '+160 silver rubles to Bayt al-Mal, +9% Authority & reduced Leader Strain',
    aiPrompt:
      'Historical diplomatic prisoner exchange on the Michik River bank in March 1855: Imam Shamil mounted riders in Circassian coats meeting Imperial officers, return of Lieutenant Jamaluddin in Russian ulan uniform, dramatic overcast Caucasus landscape, 8k cinematic realism --ar 16:9 --style raw',
    bonus: { authority: 9, powder: 10, silver: 160, imanAll: 4 }
  }
];

// ============================================================================
// ДОКТРИНЫ КОМАНДУЮЩИХ ОТДЕЛЬНЫМ КАВКАЗСКИМ КОРПУСОМ (ИИ ПРОТИВНИКА)
// ============================================================================
export const IMPERIAL_GENERALS = [
  {
    id: 'vorontsov',
    shortLabelRu: '1845: Кн. М. С. Воронцов',
    shortLabelEn: '1845: Prince M. S. Vorontsov',
    name: 'Генерал-фельдмаршал князь М. С. Воронцов',
    nameEn: 'Field Marshal Prince Mikhail S. Vorontsov',
    role: 'Наместник Кавказский и Главнокомандующий (Даргинский поход 1845)',
    roleEn: 'Viceroy of the Caucasus & Commander-in-Chief (Dargo Expedition 1845)',
    baseOrigin: { x: 155, y: 45, name: 'Кр. Внезапная', nameEn: 'Fort Vnezapnaya' },
    preferredTargets: ['vedeno', 'karata', 'benoy', 'khunzakh'],
    doctrineName: '«Экспедиция в сердце гор»',
    doctrineNameEn: '“Expedition into the Heart of the Mountains”',
    desc: 'Стягивает 20-тысячный корпус для глубокого прорыва к столице Имамата, невзирая на растянутые лесные коммуникации.',
    descEn: 'Masses a 20,000-strong corps for a deep thrust toward the Imamate capital, regardless of overextended forest supply lines.',
    doctrineModifiers: {
      strikePressureBonus: 18,
      strikePowderDrain: -10,
      interceptRiskBonus: 0,
      provisionsModPerTurn: 0,
      formulaRu: 'Удар колонны: +18% Натиск, -10 пуд. пороха гарнизона | Перехват гонцов: +0%',
      formulaEn: 'Column Strike: +18% Pressure, -10 poods garrison powder | Courier Interception: +0%'
    }
  },
  {
    id: 'argutinsky',
    shortLabelRu: '1839/49: Граббе и Аргутинский',
    shortLabelEn: '1839/49: Grabbe & Argutinsky',
    name: 'Генерал-адъютанты П. Х. Граббе и кн. М. З. Аргутинский-Долгоруков',
    nameEn: 'Gen.-Adjutants P. Kh. Grabbe & Prince M. Z. Argutinsky-Dolgorukov',
    role: 'Командующие осадными корпусами (Ахульго 1839 / Салты 1847 / Чох 1849)',
    roleEn: 'Siege Corps Commanders (Akhulgo 1839 / Salty 1847 / Chokh 1849)',
    baseOrigin: { x: 545, y: 65, name: 'Темир-Хан-Шура', nameEn: 'Temir-Khan-Shura' },
    preferredTargets: ['gergebil', 'chokh', 'gunib', 'teletl', 'irib'],
    doctrineName: '«Осадный таран скальных замков и минная война»',
    doctrineNameEn: '“Rock Fortress Siege Ram & Subterranean Mining”',
    desc: 'Концентрирует пудовые мортиры, горные единороги и сапёрные батальоны для методичного разрушения каменных аулов Дагестана.',
    descEn: 'Concentrates pood mortars, mountain unicorns, and sapper battalions for methodical siege demolition of Dagestan’s stone auls.',
    doctrineModifiers: {
      strikePressureBonus: 22,
      strikePowderDrain: -14,
      interceptRiskBonus: -3,
      provisionsModPerTurn: -15,
      formulaRu: 'Осадный таран: +22% Натиск, -14 пуд. пороха, -15 мер зерна (речная блокада) | Перехват: -3%',
      formulaEn: 'Siege Ram: +22% Pressure, -14 poods powder, -15 provisions (river blockade) | Interception: -3%'
    }
  },
  {
    id: 'freytag',
    shortLabelRu: '1844: Ген. Р. К. Фрейтаг',
    shortLabelEn: '1844: Gen. R. K. Freytag',
    name: 'Генерал-лейтенант Р. К. Фрейтаг',
    nameEn: 'Lieutenant General Robert K. Freytag',
    role: 'Начальник Левого фланга Кавказской линии (Чечня 1844–1845)',
    roleEn: 'Chief of the Left Flank of the Caucasian Line (Chechnya 1844–1845)',
    baseOrigin: { x: 115, y: 40, name: 'Кр. Грозная', nameEn: 'Fort Groznaya' },
    preferredTargets: ['shali', 'vedeno', 'benoy'],
    doctrineName: '«Летучие колонны и перехват гонцов»',
    doctrineNameEn: '“Flying Columns & Envoy Interception”',
    desc: 'Совершает стремительные ночные марши по предгорьям Чечни, перехватывая караваны с порохом и выручая окружённые гарнизоны.',
    descEn: 'Executes rapid night forced marches across the Chechen foothills, intercepting powder convoys and relieving surrounded columns.',
    doctrineModifiers: {
      strikePressureBonus: 15,
      strikePowderDrain: -8,
      interceptRiskBonus: 12,
      provisionsModPerTurn: -10,
      formulaRu: 'Летучие колонны: +12% к риску перехвата гонцов и караванов, +15% Натиск в Чечне',
      formulaEn: 'Flying Columns: +12% Courier & Convoy Interception Risk, +15% Pressure in Chechnya'
    }
  },
  {
    id: 'evdokimov',
    shortLabelRu: '1857: Барятинский и Евдокимов',
    shortLabelEn: '1857: Baryatinsky & Evdokimov',
    name: 'Фельдмаршал кн. А. И. Барятинский и ген. Н. И. Евдокимов («Уч-Гёз»)',
    nameEn: 'Field Marshal Prince A. I. Baryatinsky & Gen. N. I. Evdokimov (“Uch-Goz”)',
    role: 'Главнокомандующий Кавказской армией и стратег вырубки просек (1856–1859)',
    roleEn: 'Commander-in-Chief & Strategist of Systemic Forest Clearings (1856–1859)',
    baseOrigin: { x: 185, y: 50, name: 'Кр. Воздвиженская', nameEn: 'Fort Vozdvizhenskaya' },
    preferredTargets: ['vedeno', 'shali', 'benoy', 'gunib'],
    doctrineName: '«Система широких просек и блокады Джайляу»',
    doctrineNameEn: '“System of Forest Clearings & Lowland Pasture Blockade”',
    desc: 'Прорубает широкие просеки в вековых лесах Ичкерии и отрезает горские отары от зимних пастбищ на плоскости.',
    descEn: 'Cuts wide artillery clearings through Ichkeria’s ancient beech forests and severs highland flocks from winter lowland pastures.',
    doctrineModifiers: {
      strikePressureBonus: 20,
      strikePowderDrain: -12,
      interceptRiskBonus: 8,
      provisionsModPerTurn: -35,
      formulaRu: 'Рубка просек и блокада: -35 мер зерна/ход (отрез от Джайляу), +8% перехват, +20% Натиск',
      formulaEn: 'Clearings & Blockade: -35 provisions/turn (pastures severed), +8% Interception, +20% Pressure'
    }
  }
];

// ============================================================================
// ПРОЕКТЫ АРСЕНАЛА ВЕДЕНО, ЛИТЕЙНОГО ДВОРА И СНАРЯЖЕНИЯ МУРТАЗЕКОВ
// ============================================================================
export const INITIAL_ARSENAL_ITEMS = [
  {
    id: 'vedeno_foundry',
    category: 'Армейская артиллерия (Устаз Джабраил)',
    categoryEn: 'Imamate Artillery (Ustaz Jabrail)',
    name: 'Отлив медных горных единорогов в Дарго-Ведено',
    nameEn: 'Casting Bronze Mountain Unicorns in Dargo-Vedeno',
    historicalSpec: 'Переплавка трофейного чугуна и меди в собственные лёгкие орудия с гравировкой Имамата',
    historicalSpecEn: 'Smelting captured cast iron and copper into lightweight mountain guns engraved with Imamate seals',
    costSilver: 190,
    costPowder: 15,
    completedCount: 1,
    effectSummary: 'Снижает натиск врага во всех округах на -8% | +25 пуд. пороха и ядер в арсенал',
    effectSummaryEn: 'Reduces Imperial pressure across all Naibates by -8% | +25 poods of powder & shells'
  },
  {
    id: 'salpeter_barns',
    category: 'Пороховая логистика (Хаджи-Юсуф Сафаров)',
    categoryEn: 'Gunpowder Logistics (Hajji Yusuf Safarov)',
    name: 'Двухъярусные селитренные варницы в Гунибе и Телетле',
    nameEn: 'Two-Tiered Saltpeter Works in Gunib & Teletl',
    historicalSpec: 'Выварка чистой калиевой селитры из овечьего чернозёма и древесной золы в деревянных чанах',
    historicalSpecEn: 'Boiling refined potassium nitrate from sheep-soil humus and wood ash in timber vats',
    costSilver: 140,
    costPowder: 0,
    completedCount: 1,
    effectSummary: 'Мгновенная выработка +55 пудов боевого ружейного и пушечного пороха',
    effectSummaryEn: 'Immediate production of +55 poods of refined musket and cannon gunpowder'
  },
  {
    id: 'silver_gazyrs',
    category: 'Снаряжение и форма (Черкески и газыри)',
    categoryEn: 'Uniforms & Accoutrements (Circassian Coats & Gazyrs)',
    name: 'Нагрудные газырницы на 18 патронов с серебряными колпачками',
    nameEn: '18-Cartridge Chest Bandoliers with Silver-Niello Caps',
    historicalSpec: 'Суконные черкески с герметичными деревянными и камышовыми трубочками для готовых мерок пороха',
    historicalSpecEn: 'Wool cherkesskas fitted with moisture-sealed wooden tubes holding pre-measured powder charges',
    costSilver: 130,
    costPowder: 20,
    completedCount: 2,
    effectSummary: 'Повышает скорострельность сотен: Смелость всех наибов +5, Иман +4',
    effectSummaryEn: 'Boosts cavalry volley rate: All Naibs Courage +5, Iman +4'
  },
  {
    id: 'bazalai_daggers',
    category: 'Холодное оружие (Кузнецы Чиркея и Казанища)',
    categoryEn: 'Bladed Weapons (Bladesmiths of Chirkey & Kazanishche)',
    name: 'Кинжалы «кама» булатной стали старого Базалая и шашки «Гурда»',
    nameEn: 'Damascus Kama Daggers of Old Bazalai & “Gurda” Shashkas',
    historicalSpec: 'Широкие обоюдоострые клинки с глубокими долами, пробивающие кольчугу и сукно в рукопашной',
    historicalSpecEn: 'Broad double-edged blades with deep fullers forged to pierce mail and heavy wool in close combat',
    costSilver: 160,
    costPowder: 10,
    completedCount: 1,
    effectSummary: 'Усиливает ночные вылазки и лесные засады: +120 отборных муртазеков в округах',
    effectSummaryEn: 'Amplifies night sorties and forest ambushes: +120 elite Murtazeks across Naibates'
  }
];

// ============================================================================
// ИСТОРИЧЕСКАЯ БАЗА ДАННЫХ НАИБСТВ И НАИБОВ ИМАМАТА (1845 ГОД)
// ============================================================================
export const INITIAL_NAIBATES = [
  {
    id: 'khunzakh',
    name: 'Авария и Хунзах',
    nameEn: 'Avaria & Khunzakh',
    region: 'Нагорный Дагестан (Хунзахское плато)',
    regionEn: 'Highland Dagestan (Khunzakh Plateau)',
    naibName: 'Хаджи-Мурат Хунзахский',
    naibNameEn: 'Hadji Murad of Khunzakh',
    naibTitle: 'Наиб Аварский, предводитель конных рейдов',
    naibTitleEn: 'Naib of Avaria, Commander of Cavalry Raids',
    coords: { x: 410, y: 245 },
    travelTurns: 2,
    slope: 72,
    terraceYield: 65,
    pastureAccess: true,
    garrison: 1450,
    murtazeks: 480,
    gunpowder: 42,
    provisions: 380,
    imperialPressure: 58,
    underSiege: false,
    ordersAwarded: ['Лев Газавата'],
    bio: 'Отчаянный кавалерийский вождь из Хунзаха. Способен за одну ночь пройти сквозь кордоны до Дженгутая и Шуры, но крайне самолюбив и враждует с Даниял-беком.',
    bioEn: 'Audacious cavalry leader of Khunzakh. Capable of piercing Imperial cordons to Dzhengutay and Temir-Khan-Shura in a single night, yet fiercely proud and rival to Daniyal-Bek.',
    traits: {
      iman: 74,
      courage: 99,
      greed: 46,
      pride: 94
    }
  },
  {
    id: 'benoy',
    name: 'Ичкерия и Беной',
    nameEn: 'Ichkeria & Benoy',
    region: 'Горная лесистая Чечня (Даргинский округ)',
    regionEn: 'Forested Highland Chechnya (Dargo District)',
    naibName: 'Байсунгур Беноевский',
    naibNameEn: 'Baysungur of Benoy',
    naibTitle: 'Наиб Беноя, железный страж Ичкерии',
    naibTitleEn: 'Naib of Benoy, Iron Guardian of Ichkeria',
    coords: { x: 255, y: 155 },
    travelTurns: 1,
    slope: 58,
    terraceYield: 78,
    pastureAccess: true,
    garrison: 1200,
    murtazeks: 390,
    gunpowder: 36,
    provisions: 440,
    imperialPressure: 67,
    underSiege: false,
    ordersAwarded: ['Звезда Шамиля I ст.'],
    bio: 'Несгибаемый воин из Беноя, потерявший в боях глаз, руку и ногу, но привязываемый мюридами к седлу. Никогда не отступает без приказа Имама.',
    bioEn: 'Unyielding warrior of Benoy who lost an eye, an arm, and a leg in battle, strapped to his saddle by murids to lead charges. Never retreats without the Imam’s command.',
    traits: {
      iman: 97,
      courage: 100,
      greed: 8,
      pride: 45
    }
  },
  {
    id: 'shali',
    name: 'Большая Чечня (Шали)',
    nameEn: 'Greater Chechnya (Shali)',
    region: 'Предгорная Чеченская равнина и лесные засеки',
    regionEn: 'Chechen Foothill Plains & Forest Abatis',
    naibName: 'Талгик Шалинский',
    naibNameEn: 'Talkhig of Shali',
    naibTitle: 'Наиб Шали и начальник конной артиллерии',
    naibTitleEn: 'Naib of Shali & Chief of Horse Artillery',
    coords: { x: 145, y: 125 },
    travelTurns: 1,
    slope: 34,
    terraceYield: 95,
    pastureAccess: false,
    garrison: 1650,
    murtazeks: 520,
    gunpowder: 30,
    provisions: 590,
    imperialPressure: 79,
    underSiege: true,
    ordersAwarded: [],
    bio: 'Держит житницу Имамата под ударами отрядов генерала Фрейтага. Отрезан кордонной линией от зимних пастбищ и остро нуждается в порохе.',
    bioEn: 'Defends the granary of the Imamate against General Freytag’s columns. Cut off from winter pastures by the Sunzha cordon line and in urgent need of black powder.',
    traits: {
      iman: 80,
      courage: 86,
      greed: 38,
      pride: 52
    }
  },
  {
    id: 'karata',
    name: 'Карата и Андия',
    nameEn: 'Karata & Andia',
    region: 'Западный Дагестан (Андийский хребет)',
    regionEn: 'Western Dagestan (Andi Ridge)',
    naibName: 'Гази-Мухаммад (сын Шамиля)',
    naibNameEn: 'Ghazi-Muhammad (Shamil’s Son)',
    naibTitle: 'Наиб Карата и наследник Имамата',
    naibTitleEn: 'Naib of Karata & Designated Heir of the Imamate',
    coords: { x: 325, y: 225 },
    travelTurns: 1,
    slope: 76,
    terraceYield: 55,
    pastureAccess: true,
    garrison: 1550,
    murtazeks: 510,
    gunpowder: 54,
    provisions: 410,
    imperialPressure: 52,
    underSiege: false,
    ordersAwarded: ['Шашка Чести'],
    bio: 'Старший действующий сын Имама, прикрывающий перевалы Буцрах и Речель на пути из Чечни в долину Андийского Койсу.',
    bioEn: 'Eldest active son of the Imam, guarding the high mountain passes of Butsrakh and Rechel linking Chechnya to the Andi Koysu valley.',
    traits: {
      iman: 94,
      courage: 90,
      greed: 12,
      pride: 64
    }
  },
  {
    id: 'gergebil',
    name: 'Гергебиль и Салты',
    nameEn: 'Gergebil & Salty',
    region: 'Андалал и долина Кара-Койсу',
    regionEn: 'Andalal & Kara-Koysu Valley',
    naibName: 'Идрис Гергебильский и Хаджи-Юсуф',
    naibNameEn: 'Idris of Gergebil & Hajji Yusuf',
    naibTitle: 'Наиб-фортификатор и главный инженер',
    naibTitleEn: 'Fortification Naib & Chief Military Engineer',
    coords: { x: 495, y: 215 },
    travelTurns: 2,
    slope: 81,
    terraceYield: 72,
    pastureAccess: true,
    garrison: 1380,
    murtazeks: 410,
    gunpowder: 48,
    provisions: 360,
    imperialPressure: 74,
    underSiege: true,
    ordersAwarded: ['Печать Мудира'],
    bio: 'Ключевой бастион садов и подземных блиндажей, запирающий вход в Нагорный Дагестан со стороны Темир-Хан-Шуры и Дженгутая.',
    bioEn: 'Key bastion of terraced orchards and 3-layer timber blindages locking the southern gates to Highland Dagestan from Temir-Khan-Shura.',
    traits: {
      iman: 91,
      courage: 93,
      greed: 18,
      pride: 40
    }
  },
  {
    id: 'teletl',
    name: 'Гидатль и Телетль',
    nameEn: 'Gidatl & Teletl',
    region: 'Средний Дагестан (хребет Турчидаг)',
    regionEn: 'Central Dagestan (Turchidag Ridge)',
    naibName: 'Кибит-Магома Телетлинский',
    naibNameEn: 'Kibit-Magoma of Teletl',
    naibTitle: 'Мудир Телетля, хранитель пороховых мельниц',
    naibTitleEn: 'Mudir of Teletl, Keeper of Powder Mills',
    coords: { x: 425, y: 330 },
    travelTurns: 2,
    slope: 79,
    terraceYield: 60,
    pastureAccess: true,
    garrison: 1700,
    murtazeks: 560,
    gunpowder: 68,
    provisions: 470,
    imperialPressure: 44,
    underSiege: false,
    ordersAwarded: ['Печать Мудира'],
    bio: 'Авторитетный алим и расчетливый правитель Телетля. Располагает лучшими селитренными варницами и собственным арсеналом.',
    bioEn: 'Influential scholar and calculating ruler of Teletl. Commands rich saltpeter caves and an autonomous artillery arsenal.',
    traits: {
      iman: 88,
      courage: 82,
      greed: 55,
      pride: 78
    }
  },
  {
    id: 'irib',
    name: 'Южный Дагестан (Ириб)',
    nameEn: 'Southern Dagestan (Irib)',
    region: 'Тленсерух, Казикумух и Самурский рубеж',
    regionEn: 'Tlenserukh, Gazikumukh & Samur Frontier',
    naibName: 'Султан Даниял-бек Илисуйский',
    naibNameEn: 'Sultan Daniyal-Bek of Elisu',
    naibTitle: 'Мудир Южного Дагестана (бывш. ген.-майор)',
    naibTitleEn: 'Mudir of Southern Dagestan (Ex-Major General)',
    coords: { x: 545, y: 355 },
    travelTurns: 3,
    slope: 84,
    terraceYield: 58,
    pastureAccess: false,
    garrison: 1850,
    murtazeks: 600,
    gunpowder: 45,
    provisions: 430,
    imperialPressure: 63,
    underSiege: false,
    ordersAwarded: ['Знамя Мудира'],
    bio: 'Владетельный султан Илису и сват Шамиля. Опытный стратег европейской школы, но привык к ханскому почету и субсидиям из казны.',
    bioEn: 'Hereditary Sultan of Elisu and father-in-law to Shamil’s son. Seasoned European-style strategist, yet accustomed to princely honors and silver subsidies.',
    traits: {
      iman: 68,
      courage: 79,
      greed: 64,
      pride: 92
    }
  },
  {
    id: 'vedeno',
    name: 'Дарго-Ведено (Столица)',
    nameEn: 'Dargo-Vedeno (Capital)',
    region: 'Столичный округ Имамата и Арсенал (Малая Чечня)',
    regionEn: 'Capital District & Cannon Foundry (Ichkeria)',
    naibName: 'Дуба Вашендароевский и устаз Джабраил',
    naibNameEn: 'Duba of Vashendaroy & Master Jabrail',
    naibTitle: 'Наиб Малой Чечни и начальник пушечного двора Ведено',
    naibTitleEn: 'Naib of Lesser Chechnya & Master of the Vedeno Foundry',
    coords: { x: 215, y: 245 },
    travelTurns: 1,
    slope: 62,
    terraceYield: 74,
    pastureAccess: true,
    garrison: 1600,
    murtazeks: 540,
    gunpowder: 62,
    provisions: 510,
    imperialPressure: 64,
    underSiege: false,
    ordersAwarded: ['Звезда Шамиля I ст.', 'Лев Газавата'],
    bio: 'Сердце государственного управления, пороховых мельниц и литейного двора Имамата. Наиб Дуба Вашендароевский прикрывает Аргунское ущелье и подступы к резиденции Диван-ханы.',
    bioEn: 'Heart of state governance, water-powered powder mills, and the cannon foundry. Naib Duba guards the Argun gorge approaches to the Divan-Khana.',
    traits: {
      iman: 93,
      courage: 92,
      greed: 16,
      pride: 48
    }
  },
  {
    id: 'gunib',
    name: 'Гуниб и Койсубу',
    nameEn: 'Gunib & Koysubu',
    region: 'Андалалское плато и природная цитадель Верхний Гуниб',
    regionEn: 'Andalal Plateau & Natural Citadel of Upper Gunib',
    naibName: 'Абдурахман Каратинский и Хаджияв',
    naibNameEn: 'Abdurahman of Karata & Hajjiyav',
    naibTitle: 'Комендант Верхнего Гуниба и хранитель казны Имамата',
    naibTitleEn: 'Commandant of Upper Gunib & Keeper of the State Treasury',
    coords: { x: 495, y: 285 },
    travelTurns: 2,
    slope: 88,
    terraceYield: 64,
    pastureAccess: true,
    garrison: 1350,
    murtazeks: 420,
    gunpowder: 60,
    provisions: 490,
    imperialPressure: 48,
    underSiege: false,
    ordersAwarded: ['Печать Мудира'],
    bio: 'Неприступная горная крепость с отвесными известняковыми обрывами (до 88°), альпийскими лугами на плато, берёзовой рощей и главными селитренными пещерами Дагестана.',
    bioEn: 'Impregnable mountain plateau bordered by sheer 88° limestone cliffs, alpine meadows, birch groves, and the richest saltpeter caves in Dagestan.',
    traits: {
      iman: 95,
      courage: 91,
      greed: 10,
      pride: 36
    }
  },
  {
    id: 'chokh',
    name: 'Чох и Согратль',
    nameEn: 'Chokh & Sogratl',
    region: 'Верхний Андалал и ущелье Кара-Койсу',
    regionEn: 'Upper Andalal & Kara-Koysu Gorge',
    naibName: 'Инквачилав Чохский и Мухаммад-Амин',
    naibNameEn: 'Inkvachilav of Chokh & Muhammad-Amin',
    naibTitle: 'Наиб Чоха и защитник многоярусных каменных бастионов',
    naibTitleEn: 'Naib of Chokh & Defender of Multi-Tiered Stone Bastions',
    coords: { x: 585, y: 255 },
    travelTurns: 3,
    slope: 83,
    terraceYield: 68,
    pastureAccess: true,
    garrison: 1520,
    murtazeks: 460,
    gunpowder: 50,
    provisions: 420,
    imperialPressure: 69,
    underSiege: false,
    ordersAwarded: ['Шашка Чести'],
    bio: 'Духовный оплот учёных-алимов Согратля и неприступная многоярусная крепость Чох, выдержавшая многодневную бомбардировку осадных батарей князя Аргутинского-Долгорукова.',
    bioEn: 'Spiritual stronghold of Sogratl scholars and the multi-tiered stone fortress of Chokh that withstood Prince Argutinsky-Dolgorukov’s heavy siege batteries.',
    traits: {
      iman: 92,
      courage: 94,
      greed: 22,
      pride: 58
    }
  }
];

export const NAIB_ORDER_TYPES = [
  {
    id: 'raid',
    title: 'Ночной набег на царский обоз и кордон',
    titleEn: 'Night Cavalry Raid on Imperial Supply Train & Cordon',
    desc: 'Скрытный удар конницы муртазеков по линиям снабжения врага (-14% натиска, трофейный порох и сухари).',
    descEn: 'Stealth Murtazek cavalry strike against enemy supply lines (-14% Imperial pressure, captured powder & rations).'
  },
  {
    id: 'fortify',
    title: 'Возвести бревенчатые блиндажи и завалы',
    titleEn: 'Construct 3-Layer Timber Blindages & Counter-Mines',
    desc: 'Рытьё подземных казематов в 3 наката и контрминных галерей (-20% натиска врага, снятие осады).',
    descEn: 'Excavate 3-layer timber casemates and counter-mine galleries (-20% Imperial pressure, lifts active siege).'
  },
  {
    id: 'zakat',
    title: 'Собрать зейкат, селитру и провиант с террас',
    titleEn: 'Collect Zakat Tithe, Saltpeter & Terrace Rations',
    desc: 'Мобилизация общин для выварки пороха и пополнения центральной казны Байт аль-маль в Ведено.',
    descEn: 'Mobilize mountain communities to boil saltpeter and replenish the central Bayt al-Mal treasury in Vedeno.'
  },
  {
    id: 'mobilize',
    title: 'Созвать ополчение муртазеков (1 с 10 дворов)',
    titleEn: 'Levy Murtazek Cavalry (1 Rider per 10 Households)',
    desc: 'Пополнение конных сотен и гарнизона округа перед генеральным наступлением Кавказского корпуса.',
    descEn: 'Reinforce mounted hundreds and district garrison ahead of the Separate Caucasian Corps offensive.'
  }
];

// ============================================================================
// КОДЕКС НИЗАМОВ ИМАМА ШАМИЛЯ (12 ЗАКОНОВ ПО 4 СТОЛПАМ РЕФОРМ)
// ============================================================================
export const INITIAL_NIZAMS = [
  {
    id: 'nizam_kanly',
    unlockTurn: 1,
    tierBadgeRu: 'Ступень I • Базовый закон (1841)',
    tierBadgeEn: 'Tier I • Foundational Law (1841)',
    pillar: 'judicial',
    pillarName: 'Судебная реформа',
    pillarNameEn: 'Judicial Reform',
    title: 'Низам о полном запрете кровной мести («Канлы»)',
    titleEn: 'Nizam Abolishing Clan Blood Feuds ("Kanly")',
    year: '1841 г., Диван-хана в Дарго',
    yearEn: '1841, Divan-Khana in Dargo',
    historicalText:
      'Всякое кровомщение между родами по горскому адату приравнивается к измене газавату и судится исключительно по шариату кадиями Имамата.',
    historicalTextEn:
      'Any clan blood vengeance under customary Adat is equated to treason against the Ghazawat and tried strictly under Sharia by Imamate Qadis.',
    costAuthority: 12,
    costSilver: 60,
    enacted: true,
    effectsSummary: 'Стресс лидера -8% | Иман всех наибов +6 | Гарнизоны +80 воинов',
    effectsSummaryEn: 'Leader Strain -8% | All Naibs Iman +6 | Garrisons +80 fighters',
    modifiers: {
      stressReduction: 8,
      globalImanBonus: 6,
      greedPenaltyReduction: 0,
      pridePenaltyReduction: 5,
      powderPerTurnBonus: 0,
      provisionsPerTurnBonus: 20,
      silverPerTurnBonus: 0
    },
    naibReactions: [
      {
        naib: 'Байсунгур / Baysungur',
        naibRu: 'Байсунгур Беноевский',
        naibEn: 'Baysungur of Benoy',
        delta: '+10 Iman (Clan feuds halted in Chechnya)',
        deltaRu: '+10 Иман (Прекращена родовая вражда в Чечне)',
        deltaEn: '+10 Iman (Clan feuds halted in Chechnya)'
      },
      {
        naib: 'Хаджи-Мурат / Hadji Murad',
        naibRu: 'Хаджи-Мурат Хунзахский',
        naibEn: 'Hadji Murad of Khunzakh',
        delta: '-4 Pride (Ancient Khunzakh Adat curbed)',
        deltaRu: '-4 Гордыня (Ограничен древний адат Хунзаха)',
        deltaEn: '-4 Pride (Ancient Khunzakh Adat curbed)'
      }
    ]
  },
  {
    id: 'nizam_muhtasibs',
    unlockTurn: 1,
    tierBadgeRu: 'Ступень I • Ход 1 (Ревизия казны)',
    tierBadgeEn: 'Tier I • Turn 1 (Treasury Audit)',
    pillar: 'judicial',
    pillarName: 'Судебная реформа',
    pillarNameEn: 'Judicial Reform',
    title: 'Учреждение института тайных ревизоров (Мухтасибов)',
    titleEn: 'Establishment of Secret State Inspectors (Muhtasibs)',
    year: '1842 г., Дарго-Ведено',
    yearEn: '1842, Dargo-Vedeno',
    historicalText:
      'Тайные контролёры Имама инспектируют казну наибств, пресекая утайку пятой доли добычи (хумса) и притеснение узденей.',
    historicalTextEn:
      'Secret inspectors of the Imam audit Naibate treasuries, preventing embezzlement of the fifth war-booty share (Khums) and abuse of free mountaineers.',
    costAuthority: 15,
    costSilver: 90,
    enacted: false,
    effectsSummary: 'Штраф от Алчности наибов снижен на -35% | +45 руб. серебром в ход',
    effectsSummaryEn: 'Naib Greed Penalty reduced by -35% | +45 silver rubles per turn',
    modifiers: {
      stressReduction: 6,
      globalImanBonus: 4,
      greedPenaltyReduction: 35,
      pridePenaltyReduction: 0,
      powderPerTurnBonus: 0,
      provisionsPerTurnBonus: 0,
      silverPerTurnBonus: 45
    },
    naibReactions: [
      {
        naib: 'Кибит-Магома / Kibit-Magoma',
        naibRu: 'Мудир Кибит-Магома',
        naibEn: 'Mudir Kibit-Magoma',
        delta: '+8 Treasury Discipline',
        deltaRu: '+8 Дисциплина казны',
        deltaEn: '+8 Treasury Discipline'
      },
      {
        naib: 'Даниял-бек / Daniyal-Bek',
        naibRu: 'Султан Даниял-бек',
        naibEn: 'Sultan Daniyal-Bek',
        delta: 'Resents audits of his princely treasury',
        deltaRu: 'Недоволен ревизией султанской казны',
        deltaEn: 'Resents audits of his princely treasury'
      }
    ]
  },
  {
    id: 'nizam_supreme_court',
    unlockTurn: 2,
    tierBadgeRu: 'Ступень II • Ход 2 (Верховный суд)',
    tierBadgeEn: 'Tier II • Turn 2 (Supreme Court)',
    pillar: 'judicial',
    pillarName: 'Судебная реформа',
    pillarNameEn: 'Judicial Reform',
    title: 'Исключительное право Диван-ханы на смертный приговор',
    titleEn: 'Exclusive Right of the Divan-Khana over Capital Punishment',
    year: '1843 г., Диван-хана',
    yearEn: '1843, Divan-Khana',
    historicalText:
      'Ни один наиб не вправе казнить мусульманина без утверждения приговора самим Имамом и Государственным советом в Ведено.',
    historicalTextEn:
      'No Naib may execute a citizen without explicit ratification of the verdict by the Imam and the State Council in Vedeno.',
    costAuthority: 14,
    costSilver: 50,
    enacted: false,
    effectsSummary: 'Штраф от Гордыни наибов снижен на -30% | Авторитет Шамиля +10',
    effectsSummaryEn: 'Naib Pride Penalty reduced by -30% | Shamil’s Authority +10',
    modifiers: {
      stressReduction: 5,
      globalImanBonus: 5,
      greedPenaltyReduction: 10,
      pridePenaltyReduction: 30,
      powderPerTurnBonus: 0,
      provisionsPerTurnBonus: 0,
      silverPerTurnBonus: 20
    },
    naibReactions: [
      {
        naib: 'Хаджи-Мурат / Hadji Murad',
        naibRu: 'Хаджи-Мурат Хунзахский',
        naibEn: 'Hadji Murad of Khunzakh',
        delta: 'Curbs arbitrary rule in Avaria',
        deltaRu: 'Ограничивает самоуправство в Аварии',
        deltaEn: 'Curbs arbitrary rule in Avaria'
      },
      {
        naib: 'Идрис / Idris of Gergebil',
        naibRu: 'Идрис Гергебильский',
        naibEn: 'Idris of Gergebil',
        delta: '+9 Trust of Andalal communities',
        deltaRu: '+9 Доверие общин Андалала',
        deltaEn: '+9 Trust of Andalal communities'
      }
    ]
  },
  {
    id: 'nizam_murtazeks',
    unlockTurn: 1,
    tierBadgeRu: 'Ступень I • Базовый закон (1841)',
    tierBadgeEn: 'Tier I • Foundational Law (1841)',
    pillar: 'military',
    pillarName: 'Военная реформа',
    pillarNameEn: 'Military Reform',
    title: 'Воинский устав регулярной гвардии Муртазеков (1 с 10 дворов)',
    titleEn: 'Military Statute of the Standing Murtazek Guard (1 per 10 Households)',
    year: '1841 г., Дарго',
    yearEn: '1841, Dargo',
    historicalText:
      'Каждые десять дымов содержат и снаряжают одного конного муртазека, готового выступить по первому зову Имама в любую точку гор.',
    historicalTextEn:
      'Every ten households equip and maintain one standing Murtazek cavalryman ready to ride at the Imam’s first call.',
    costAuthority: 10,
    costSilver: 80,
    enacted: true,
    effectsSummary: '+15% к шансу исполнения боевых приказов | Резерв муртазеков +120',
    effectsSummaryEn: '+15% combat order obedience | +120 Murtazek cavalry reserve',
    modifiers: {
      stressReduction: 5,
      globalImanBonus: 5,
      greedPenaltyReduction: 0,
      pridePenaltyReduction: 10,
      powderPerTurnBonus: 6,
      provisionsPerTurnBonus: 0,
      silverPerTurnBonus: 0
    },
    naibReactions: [
      {
        naib: 'Гази-Мухаммад / Ghazi-Muhammad',
        naibRu: 'Гази-Мухаммад (Карата)',
        naibEn: 'Ghazi-Muhammad (Karata)',
        delta: '+12 Readiness of Karata squadrons',
        deltaRu: '+12 Боеготовность сотен Караты',
        deltaEn: '+12 Readiness of Karata squadrons'
      },
      {
        naib: 'Талгик / Talkhig of Shali',
        naibRu: 'Талхиг Шалинский',
        naibEn: 'Talkhig of Shali',
        delta: '+10 Stronger cordons in Greater Chechnya',
        deltaRu: '+10 Заслоны в Большой Чечне',
        deltaEn: '+10 Stronger cordons in Greater Chechnya'
      }
    ]
  },
  {
    id: 'nizam_powder_mills',
    unlockTurn: 1,
    tierBadgeRu: 'Ступень I • Ход 1 (Порох и свинец)',
    tierBadgeEn: 'Tier I • Turn 1 (Powder & Lead)',
    pillar: 'military',
    pillarName: 'Военная реформа',
    pillarNameEn: 'Military Reform',
    title: 'Низам о казённых пороховых мельницах и сборе свинца',
    titleEn: 'Nizam on State Gunpowder Mills, Saltpeter & Lead Collection',
    year: '1844 г., Ведено — Гуниб — Унцукуль',
    yearEn: '1844, Vedeno — Gunib — Untsukul',
    historicalText:
      'Освобождение мастеров-пороховщиков от податей; обязательный сбор стреляных русских пуль и ядер с полей сражений за серебряную плату.',
    historicalTextEn:
      'Tax exemption for powder-makers and mandatory battlefield recovery of spent Russian lead bullets and cannonballs for silver pay.',
    costAuthority: 12,
    costSilver: 120,
    enacted: false,
    effectsSummary: '+30 пудов пороха каждый ход в арсенал Ведено',
    effectsSummaryEn: '+30 poods of gunpowder every turn into the Vedeno Arsenal',
    modifiers: {
      stressReduction: 7,
      globalImanBonus: 3,
      greedPenaltyReduction: 0,
      pridePenaltyReduction: 0,
      powderPerTurnBonus: 30,
      provisionsPerTurnBonus: 0,
      silverPerTurnBonus: 0
    },
    naibReactions: [
      {
        naib: 'Хаджи-Юсуф / Hajji Yusuf',
        naibRu: 'Инженер Хаджи-Юсуф',
        naibEn: 'Engineer Hajji Yusuf',
        delta: '+15 Sustains counter-mine warfare in Salty & Gergebil',
        deltaRu: '+15 Порох для контр-мин Салты и Гергебиля',
        deltaEn: '+15 Sustains counter-mine warfare in Salty & Gergebil'
      },
      {
        naib: 'Кибит-Магома / Kibit-Magoma',
        naibRu: 'Мудир Кибит-Магома',
        naibEn: 'Mudir Kibit-Magoma',
        delta: '+10 Expands saltpeter works in Teletl',
        deltaRu: '+10 Расширение варниц селитры в Телетле',
        deltaEn: '+10 Expands saltpeter works in Teletl'
      }
    ]
  },
  {
    id: 'nizam_orders_statute',
    unlockTurn: 2,
    tierBadgeRu: 'Ступень II • Ход 2 (Ордена храбрости)',
    tierBadgeEn: 'Tier II • Turn 2 (Medals of Valor)',
    pillar: 'military',
    pillarName: 'Военная реформа',
    pillarNameEn: 'Military Reform',
    title: 'Статут о серебряных орденах храбрости и позорных войлочных эполетах',
    titleEn: 'Statute on Nielloed Silver Medals of Valor & Felt Marks of Cowardice',
    year: '1842 г., Дарго',
    yearEn: '1842, Dargo',
    historicalText:
      'Введение гравированных серебряных знаков с чернью для героев и нашивание куска грязного войлока на спину струсившим в бою.',
    historicalTextEn:
      'Institutes engraved niello-silver medals for heroes while sewing rough felt patches onto the backs of those who flee in battle.',
    costAuthority: 11,
    costSilver: 85,
    enacted: false,
    effectsSummary: 'Смелость всех наибов +7 | Снижает риск отступления при осадах',
    effectsSummaryEn: 'All Naibs Courage +7 | Reduces retreat risk during sieges',
    modifiers: {
      stressReduction: 4,
      globalImanBonus: 7,
      greedPenaltyReduction: 0,
      pridePenaltyReduction: 15,
      powderPerTurnBonus: 0,
      provisionsPerTurnBonus: 0,
      silverPerTurnBonus: 0
    },
    naibReactions: [
      {
        naib: 'Байсунгур / Baysungur',
        naibRu: 'Байсунгур Беноевский',
        naibEn: 'Baysungur of Benoy',
        delta: '+14 Inspires the defenders of Benoy',
        deltaRu: '+14 Воодушевляет защитников Беноя',
        deltaEn: '+14 Inspires the defenders of Benoy'
      },
      {
        naib: 'Хаджи-Мурат / Hadji Murad',
        naibRu: 'Хаджи-Мурат Хунзахский',
        naibEn: 'Hadji Murad of Khunzakh',
        delta: '+8 Glory of the vanguard horsemen',
        deltaRu: '+8 Слава конного авангарда',
        deltaEn: '+8 Glory of the vanguard horsemen'
      }
    ]
  },
  {
    id: 'nizam_bait_al_mal',
    unlockTurn: 1,
    tierBadgeRu: 'Ступень I • Базовый закон (1841)',
    tierBadgeEn: 'Tier I • Foundational Law (1841)',
    pillar: 'tax',
    pillarName: 'Налоговая реформа',
    pillarNameEn: 'Fiscal Reform',
    title: 'Устав государственной казны Байт аль-маль и доли Хумс (1/5)',
    titleEn: 'Charter of the Bayt al-Mal State Treasury & the 1/5 Khums Share',
    year: '1841 г., Дарго',
    yearEn: '1841, Dargo',
    historicalText:
      'Строгое разделение казны на фонд сирот, фонд вооружения и фонд выкупа пленных; передача 20% военной добычи в казну Имамата.',
    historicalTextEn:
      'Strict division of the state treasury into orphan relief, weaponry, and captive ransom funds; 20% of war booty goes to Bayt al-Mal.',
    costAuthority: 10,
    costSilver: 50,
    enacted: true,
    effectsSummary: '+60 руб. серебром и +35 мер провианта каждый ход',
    effectsSummaryEn: '+60 silver rubles and +35 measures of provisions per turn',
    modifiers: {
      stressReduction: 5,
      globalImanBonus: 4,
      greedPenaltyReduction: 15,
      pridePenaltyReduction: 0,
      powderPerTurnBonus: 0,
      provisionsPerTurnBonus: 35,
      silverPerTurnBonus: 60
    },
    naibReactions: [
      {
        naib: 'Хаджияв / Treasurer Hajjiyav',
        naibRu: 'Казначей Хаджияв',
        naibEn: 'Treasurer Hajjiyav',
        delta: '+10 Full accounting of silver & gold coins',
        deltaRu: '+10 Строгий учёт серебряной и золотой монеты',
        deltaEn: '+10 Full accounting of silver & gold coins'
      }
    ]
  },
  {
    id: 'nizam_terraces_pastures',
    unlockTurn: 3,
    tierBadgeRu: 'Ступень III • Ход 3 (Террасы и Джайляу)',
    tierBadgeEn: 'Tier III • Turn 3 (Terraces & Pastures)',
    pillar: 'tax',
    pillarName: 'Налоговая реформа',
    pillarNameEn: 'Fiscal Reform',
    title: 'Кодекс об охране террасных пашен, арыков и кочёвок Джайляу',
    titleEn: 'Code on Protecting Mountain Terraces, Aqueducts & Alpine Pastures',
    year: '1844 г., Ведено',
    yearEn: '1844, Vedeno',
    historicalText:
      'Трудовая повинность общин по восстановлению каменных подпорных стен террас и вооружённая охрана перегона отар на альпийские луга.',
    historicalTextEn:
      'Communal duty to repair stone terrace retaining walls and armed escorts for seasonal sheep drives to alpine pastures.',
    costAuthority: 13,
    costSilver: 95,
    enacted: false,
    effectsSummary: '+90 мер зерна и сухарей каждый ход | Снижает урон от блокады равнины',
    effectsSummaryEn: '+90 measures of grain per turn | Mitigates lowland cordon blockade',
    modifiers: {
      stressReduction: 6,
      globalImanBonus: 5,
      greedPenaltyReduction: 0,
      pridePenaltyReduction: 0,
      powderPerTurnBonus: 0,
      provisionsPerTurnBonus: 90,
      silverPerTurnBonus: 25
    },
    naibReactions: [
      {
        naib: 'Талгик / Talkhig of Shali',
        naibRu: 'Талхиг Шалинский',
        naibEn: 'Talkhig of Shali',
        delta: '+12 Protects harvest in Chechen foothills',
        deltaRu: '+12 Защита урожая предгорий Чечни',
        deltaEn: '+12 Protects harvest in Chechen foothills'
      },
      {
        naib: 'Идрис / Idris of Gergebil',
        naibRu: 'Идрис Гергебильский',
        naibEn: 'Idris of Gergebil',
        delta: '+10 Preserves Koysu valley orchards',
        deltaRu: '+10 Сбережение садов долины Койсу',
        deltaEn: '+10 Preserves Koysu valley orchards'
      }
    ]
  },
  {
    id: 'nizam_khan_lands',
    unlockTurn: 2,
    tierBadgeRu: 'Ступень II • Ход 2 (Вакуфные земли)',
    tierBadgeEn: 'Tier II • Turn 2 (Waqf Estates)',
    pillar: 'tax',
    pillarName: 'Налоговая реформа',
    pillarNameEn: 'Fiscal Reform',
    title: 'Низам о секвестре пастбищ и мельниц беглых ханов и беков',
    titleEn: 'Nizam Sequestering Pastures & Mills of Defected Khans and Beks',
    year: '1843 г., Хунзах — Казикумух',
    yearEn: '1843, Khunzakh — Gazikumukh',
    historicalText:
      'Обращение земель, табунов и кутанов перешедших на сторону царя беков в неотчуждаемую вакуфную собственность войска Имамата.',
    historicalTextEn:
      'Converts estates, horse herds, and winter pastures of princes who defected to the Tsar into inalienable Waqf property of the Imamate army.',
    costAuthority: 14,
    costSilver: 70,
    enacted: false,
    effectsSummary: '+75 руб. серебром и +50 мер провианта каждый ход',
    effectsSummaryEn: '+75 silver rubles and +50 measures of provisions per turn',
    modifiers: {
      stressReduction: 4,
      globalImanBonus: 6,
      greedPenaltyReduction: 10,
      pridePenaltyReduction: 0,
      powderPerTurnBonus: 5,
      provisionsPerTurnBonus: 50,
      silverPerTurnBonus: 75
    },
    naibReactions: [
      {
        naib: 'Вольные уздени / Free Mountaineers',
        naibRu: 'Вольные уздени гор',
        naibEn: 'Free Mountaineers',
        delta: '+15 Popular support across the mountains',
        deltaRu: '+15 Поддержка узденей по всем горам',
        deltaEn: '+15 Popular support across the mountains'
      },
      {
        naib: 'Даниял-бек / Daniyal-Bek',
        naibRu: 'Султан Даниял-бек',
        naibEn: 'Sultan Daniyal-Bek',
        delta: 'Unease among former feudal nobility',
        deltaRu: 'Настороженность прежней бекской знати',
        deltaEn: 'Unease among former feudal nobility'
      }
    ]
  },
  {
    id: 'nizam_kalym_limit',
    unlockTurn: 3,
    tierBadgeRu: 'Ступень III • Ход 3 (Брачный устав)',
    tierBadgeEn: 'Tier III • Turn 3 (Matrimonial Code)',
    pillar: 'family',
    pillarName: 'Семейная реформа',
    pillarNameEn: 'Family & Social Reform',
    title: 'Брачный Низам об ограничении калыма до 20 рублей серебром',
    titleEn: 'Matrimonial Nizam Capping Bride-Price (Kalym) at 20 Silver Rubles',
    year: '1842 г., Дарго-Ведено',
    yearEn: '1842, Dargo-Vedeno',
    historicalText:
      'Запрет разорительного адата непомерного выкупа за невесту, мешавшего бедным воинам-мюридам создавать семьи во время войны.',
    historicalTextEn:
      'Abolishes ruinous customary bride-prices that prevented poor murid fighters from marrying during wartime.',
    costAuthority: 11,
    costSilver: 45,
    enacted: false,
    effectsSummary: 'Иман всех округов +8 | Приток добровольцев в сотни муртазеков',
    effectsSummaryEn: 'All Districts Iman +8 | Surge of volunteers into Murtazek squadrons',
    modifiers: {
      stressReduction: 6,
      globalImanBonus: 8,
      greedPenaltyReduction: 10,
      pridePenaltyReduction: 10,
      powderPerTurnBonus: 0,
      provisionsPerTurnBonus: 30,
      silverPerTurnBonus: 0
    },
    naibReactions: [
      {
        naib: 'Молодые мюриды / Young Murids',
        naibRu: 'Молодые воины-мюриды',
        naibEn: 'Young Murid Fighters',
        delta: '+18 Devotion to Imam Shamil',
        deltaRu: '+18 Преданность Имаму Шамилю',
        deltaEn: '+18 Devotion to Imam Shamil'
      }
    ]
  },
  {
    id: 'nizam_shahid_widows',
    unlockTurn: 4,
    tierBadgeRu: 'Ступень IV • Ход 4 (Сироты шахидов)',
    tierBadgeEn: 'Tier IV • Turn 4 (Families of the Fallen)',
    pillar: 'family',
    pillarName: 'Семейная реформа',
    pillarNameEn: 'Family & Social Reform',
    title: 'Кодекс о государственном призрении вдов и сирот шахидов',
    titleEn: 'Code on State Support for Widows and Orphans of Fallen Fighters',
    year: '1843 г., Дарго',
    yearEn: '1843, Dargo',
    historicalText:
      'Пожизненное содержание семей павших воинов из казны Байт аль-маль и обязанность общин обрабатывать их террасные наделы в первую очередь.',
    historicalTextEn:
      'Lifelong pensions from Bayt al-Mal for families of fallen warriors and communal priority in tilling their mountain terraces.',
    costAuthority: 12,
    costSilver: 80,
    enacted: false,
    effectsSummary: 'Стресс лидера -9% | Несокрушимая стойкость гарнизонов в осаде',
    effectsSummaryEn: 'Leader Strain -9% | Unbreakable garrison morale under siege',
    modifiers: {
      stressReduction: 9,
      globalImanBonus: 9,
      greedPenaltyReduction: 0,
      pridePenaltyReduction: 15,
      powderPerTurnBonus: 0,
      provisionsPerTurnBonus: 20,
      silverPerTurnBonus: 0
    },
    naibReactions: [
      {
        naib: 'Байсунгур и Гази-Мухаммад / Baysungur & Ghazi-Muhammad',
        naibRu: 'Байсунгур и Гази-Мухаммад',
        naibEn: 'Baysungur & Ghazi-Muhammad',
        delta: '+12 Confidence of every fighter for his family',
        deltaRu: '+12 Уверенность каждого воина за свою семью',
        deltaEn: '+12 Confidence of every fighter for his family'
      }
    ]
  },
  {
    id: 'nizam_tobacco_austerity',
    unlockTurn: 1,
    tierBadgeRu: 'Ступень I • Ход 1 (Дисциплина и порох)',
    tierBadgeEn: 'Tier I • Turn 1 (Austerity & Powder)',
    pillar: 'family',
    pillarName: 'Семейная реформа',
    pillarNameEn: 'Family & Social Reform',
    title: 'Государственный запрет табака, бузы и расточительных пиршеств',
    titleEn: 'State Prohibition of Tobacco, Intoxicants & Lavish Feasts',
    year: '1841 г., Дарго',
    yearEn: '1841, Dargo',
    historicalText:
      'Строжайший запрет курения трубок и разорительных поминальных тризн; сбережённые средства общин направляются на закупку свинца и пороха.',
    historicalTextEn:
      'Strict ban on pipe-smoking and costly banquets; saved communal funds are redirected toward purchasing lead and saltpeter.',
    costAuthority: 9,
    costSilver: 35,
    enacted: false,
    effectsSummary: 'Иман всех наибов +5 | +10 пуд. пороха и +35 руб. серебром в ход',
    effectsSummaryEn: 'All Naibs Iman +5 | +10 poods of powder & +35 silver rubles per turn',
    modifiers: {
      stressReduction: 5,
      globalImanBonus: 5,
      greedPenaltyReduction: 12,
      pridePenaltyReduction: 8,
      powderPerTurnBonus: 10,
      provisionsPerTurnBonus: 15,
      silverPerTurnBonus: 35
    },
    naibReactions: [
      {
        naib: 'Учёные-алимы Дивана / Divan Scholars',
        naibRu: 'Учёные-алимы Дивана',
        naibEn: 'Divan Scholars',
        delta: '+14 Укрепляет государственную дисциплину',
        deltaRu: '+14 Укрепляет государственную дисциплину',
        deltaEn: '+14 Strengthens state discipline'
      }
    ]
  }
];

export const INITIAL_COURT_CASES = [
  {
    id: 'case_booty_khunzakh',
    unlockTurn: 1,
    title: '1. Спор Хаджи-Мурата и мудира Кибит-Магомы за трофейные пушки Аварии',
    titleEn: '1. Clash of Hadji Murad & Mudir Kibit-Magoma Over Captured Avaria Cannons',
    triggerConditionDesc: 'Акт I (Ход 1 • 1845) • Военный трибунал Диван-ханы',
    triggerConditionDescEn: 'Act I (Turn 1 • 1845) • Divan-Khana Military Tribunal',
    description:
      'После разгрома царских гарнизонов в Хунзахе и Гоцатле захвачены четыре медных горных единорога и зарядные ящики. Хаджи-Мурат требует отдать пушки его конным сотням для рейдов на Дженгутай, а мудир Кибит-Магома настаивает на установке орудий на скальных бастионах Телетля.',
    descriptionEn:
      'After routing Tsarist garrisons in Khunzakh and Gotsatl, four bronze mountain unicorns and caissons were captured. Hadji Murad demands the guns for his flying cavalry raids on Dzhengutay, while Mudir Kibit-Magoma insists on mounting them atop Teletl’s cliff bastions.',
    dialogueQuoteRu:
      'Хаджи-Мурат: «Пушка в каменной башне ждёт врага, а пушка на вьюках моей конницы бьёт врага в его собственном лагере!»',
    dialogueQuoteEn:
      'Hadji Murad: “A cannon in a stone tower waits for the enemy; a cannon on my cavalry’s pack-mules strikes the enemy in his own camp!”',
    resolved: false,
    chosenResolution: null,
    options: [
      {
        id: 'strict_sharia',
        label: 'Передать орудия и снарядную казну в бастионы Телетля и Байт аль-маль (+140 руб., Авторитет +6, Гордыня Хаджи-Мурата +6)',
        labelEn: 'Assign the guns and shell treasury to Teletl bastions & Bayt al-Mal (+140 silver rub., Authority +6, Hadji Murad Pride +6)',
        silverDelta: 140,
        authorityDelta: 6,
        targetNaibId: 'khunzakh',
        imanDelta: -2,
        prideDelta: 6
      },
      {
        id: 'compensate_horses',
        label: 'Вручить горные единороги летучему корпусу Хаджи-Мурата (Иман Хаджи-Мурата +10, Гордыня -8, Авторитет +4)',
        labelEn: 'Entrust the mountain unicorns to Hadji Murad’s flying cavalry corps (Hadji Murad Iman +10, Pride -8, Authority +4)',
        silverDelta: 0,
        authorityDelta: 4,
        targetNaibId: 'khunzakh',
        imanDelta: 10,
        prideDelta: -8
      }
    ]
  },
  {
    id: 'case_pasture_dispute',
    unlockTurn: 2,
    title: '2. Тайный парламентёр от генерала Ф. К. Клюки фон Клюгенау в Хунзахе',
    titleEn: '2. Secret Envoy from General F. K. Kluki von Klugenau in Khunzakh',
    triggerConditionDesc: 'Акт II (Ход 2 • 1846) • Дипломатическая интрига Северного Дагестана',
    triggerConditionDescEn: 'Act II (Turn 2 • 1846) • Northern Dagestan Diplomatic Intrigue',
    description:
      'Командующий войсками в Северном Дагестане генерал Клюки фон Клюгенау прислал через кунаков тайное письмо: он предлагает не сжигать озимые посевы на плоскости и пропустить караваны с солью и зерном в обмен на отказ горцев от удара по Темир-Хан-Шуре.',
    descriptionEn:
      'General Kluki von Klugenau, commanding Russian forces in Northern Dagestan, sent a secret letter via kunaks: he offers to spare lowland winter crops and pass salt and grain caravans if the mountaineers halt raids on Temir-Khan-Shura.',
    dialogueQuoteRu:
      'Байсунгур Беноевский: «Лиса предлагает волку соль лишь тогда, когда у охотника отсырел порох в ружье!»',
    dialogueQuoteEn:
      'Baysungur of Benoy: “The fox offers salt to the wolf only when the hunter’s gunpowder has gone damp!”',
    resolved: false,
    chosenResolution: null,
    options: [
      {
        id: 'shared_djailau',
        label: 'Негласно принять обмен солью и зерном, выиграв время для укреплений (+110 мер провианта, Авторитет +8)',
        labelEn: 'Tacitly accept the salt & grain exchange to buy time for fortifications (+110 provisions, Authority +8)',
        silverDelta: -40,
        authorityDelta: 8,
        provisionsDelta: 110,
        targetNaibId: 'benoy',
        imanDelta: 8,
        prideDelta: -4
      },
      {
        id: 'tax_herd',
        label: 'Публично зачитать письмо перед наибами и обложить торговцев военным сбором (+90 руб. серебром)',
        labelEn: 'Read the letter publicly before the Naibs and levy a war customs tithe (+90 silver rub.)',
        silverDelta: 90,
        authorityDelta: 3,
        provisionsDelta: 30,
        targetNaibId: 'karata',
        imanDelta: 5,
        prideDelta: 0
      }
    ]
  },
  {
    id: 'case_artillery_deserters_vedeno',
    unlockTurn: 3,
    title: '3. Допрос беглых бомбардиров Апшеронского полка с картой минных подкопов',
    titleEn: '3. Interrogation of Defected Apsheron Bombardiers Bearing Sapper Mine Maps',
    triggerConditionDesc: 'Акт III (Ход 3 • 1847) • Литейный двор Ведено и инженерная разведка',
    triggerConditionDescEn: 'Act III (Turn 3 • 1847) • Vedeno Foundry & Sapper Intelligence',
    description:
      'Накануне осад Салты и Гергебиля в Ведено перешли трое русских артиллеристов и минный унтер-офицер с планами подкопов. Охрана подозревает, что один из них подослан штабом Воронцова, чтобы взорвать пороховую мельницу в Ведено.',
    descriptionEn:
      'On the eve of the Salty and Gergebil sieges, three Russian artillerymen and a sapper NCO crossed over to Vedeno carrying plans of mine galleries. Guards suspect one was planted by Vorontsov’s staff to blow up Vedeno’s powder mill.',
    dialogueQuoteRu:
      'Устаз Джабраил (литейщик): «Они знают точный состав ударных трубок и литья медных мортир. Дай их мне в мастерскую под строгий караул!»',
    dialogueQuoteEn:
      'Ustaz Jabrail (Master Founder): “They know the exact formula of percussion fuzes and bronze mortar casting. Give them to my foundry under guard!”',
    resolved: false,
    chosenResolution: null,
    options: [
      {
        id: 'enlist_vedeno_arsenal',
        label: 'Довериться инженерам: зачислить мастеров в пушечную слободу Ведено с жалованием (-45 руб., Авторитет +6, Иман Ведено +8)',
        labelEn: 'Trust the engineers: enlist the specialists into the Vedeno cannon foundry with pay (-45 rub., Authority +6, Iman +8)',
        silverDelta: -45,
        authorityDelta: 6,
        provisionsDelta: 50,
        targetNaibId: 'vedeno',
        imanDelta: 8,
        prideDelta: -6
      },
      {
        id: 'exchange_for_captives',
        label: 'Забрать чертежи, а самих перебежчиков обменять на Лабинской линии на свинец и пленных (+115 руб. серебром, Авторитет +4)',
        labelEn: 'Keep the blueprints and exchange the defectors across the cordon line for lead and captives (+115 silver rub., Authority +4)',
        silverDelta: 115,
        authorityDelta: 4,
        provisionsDelta: 0,
        targetNaibId: 'vedeno',
        imanDelta: 4,
        prideDelta: 0
      }
    ]
  },
  {
    id: 'case_kanly_chokh',
    unlockTurn: 4,
    title: '4. Кровная месть (Канлы) двух командиров бастиона Чох за час до штурма',
    titleEn: '4. Blood Feud (Kanly) Between Two Chokh Bastion Commanders One Hour Before Assault',
    triggerConditionDesc: 'Акт III (Ход 4 • 1849) • Трибунал на передовой под огнём 48 орудий',
    triggerConditionDescEn: 'Act III (Turn 4 • 1849) • Frontline Tribunal Under 48 Siege Guns',
    description:
      'Батареи князя Аргутинского уже ведут пристрелку по стенам Чоха, но прямо в подземном блиндаже двое лучших сотников обнажили кинжалы из-за старой родовой мести (Канлы). Если прольётся кровь — дрогнет весь правый фланг обороны.',
    descriptionEn:
      'Prince Argutinsky’s batteries are already ranging Chokh’s walls, yet right inside the subterranean blindage two elite squadron commanders drew daggers over an old clan blood feud (Kanly). If blood is spilled, the entire right flank will collapse.',
    dialogueQuoteRu:
      'Инженер Хаджи-Юсуф Сафаров: «Через час русские взорвут минный горн под башней! Разними их, Имам, или нас похоронит под одними камнями!»',
    dialogueQuoteEn:
      'Engineer Hajji Yusuf Safarov: “In an hour the Russians will detonate the mine beneath the tower! Part them, Imam, or we shall all be buried under the same stones!”',
    resolved: false,
    chosenResolution: null,
    options: [
      {
        id: 'kanly_sharia_diya',
        label: 'Лично встать между клинками, запретить Канлы под страхом казни и выплатить виру из казны (-60 руб., Авторитет +9)',
        labelEn: 'Step between the blades, outlaw blood feud on pain of death, and pay Diya from the treasury (-60 rub., Authority +9)',
        silverDelta: -60,
        authorityDelta: 9,
        provisionsDelta: 40,
        targetNaibId: 'chokh',
        imanDelta: 11,
        prideDelta: -10
      },
      {
        id: 'kanly_frontline_penance',
        label: 'Поставить обоих кровников плечом к плечу в передовой пролом под штыковую атаку (Иман Чоха +6, Авторитет +5)',
        labelEn: 'Place both feuding commanders shoulder-to-shoulder in the forward breach (Chokh Iman +6, Authority +5)',
        silverDelta: 0,
        authorityDelta: 5,
        provisionsDelta: 0,
        targetNaibId: 'chokh',
        imanDelta: 6,
        prideDelta: -4
      }
    ]
  },
  {
    id: 'case_muhtasib_irib',
    unlockTurn: 5,
    title: '5. Тайный донос мухтасиба о двойной игре султана Даниял-бека Илисуйского',
    titleEn: '5. Secret Muhtasib Dossier on Sultan Daniyal-Bek of Elisu’s Double Game',
    triggerConditionDesc: 'Акт III–IV (Ход 5 • 1850) • Контрразведка и интриги знати',
    triggerConditionDescEn: 'Act III–IV (Turn 5 • 1850) • Counter-Intelligence & Noble Intrigue',
    description:
      'Тайный ревизор-мухтасиб перехватил гонца из Тифлиса к бывшему царскому генералу султану Даниял-беку Илисуйскому, а в подвалах крепости Ириб обнаружил утаённый сундук серебра и 300 мер зерна, не заявленных казначею Хаджияву.',
    descriptionEn:
      'A secret Muhtasib inspector intercepted a courier from Tiflis to former Tsarist general Sultan Daniyal-Bek of Elisu, and uncovered a concealed chest of silver and 300 measures of grain in Irib fortress.',
    dialogueQuoteRu:
      'Даниял-бек Илисуйский: «Я привёл тебе весь Южный Дагестан, Шамиль! Неужели ты станешь обыскивать султана Илису, как простого пастуха?!»',
    dialogueQuoteEn:
      'Daniyal-Bek of Elisu: “I brought all of Southern Dagestan to your banner, Shamil! Would you search the Sultan of Elisu like a common shepherd?!”',
    resolved: false,
    chosenResolution: null,
    options: [
      {
        id: 'confiscate_treasury_irib',
        label: 'Публично изъять серебро в казну Байт аль-маль: перед Низамом султан равен узденю (+180 руб., +120 зерна, Гордыня +12)',
        labelEn: 'Publicly seize the silver for Bayt al-Mal: before the Nizam a sultan equals a freeman (+180 silver rub., +120 grain)',
        silverDelta: 180,
        authorityDelta: 7,
        provisionsDelta: 120,
        targetNaibId: 'irib',
        imanDelta: -4,
        prideDelta: 12
      },
      {
        id: 'invest_in_irib_forts',
        label: 'Сжечь перехваченное письмо на глазах Даниял-бека и велеть ему купить порох для гарнизонов (Иман +9, Гордыня -9)',
        labelEn: 'Burn the intercepted letter before Daniyal-Bek’s eyes and order him to buy powder for the forts (Iman +9, Pride -9)',
        silverDelta: 50,
        authorityDelta: 5,
        provisionsDelta: 60,
        targetNaibId: 'irib',
        imanDelta: 9,
        prideDelta: -9
      }
    ]
  },
  {
    id: 'case_widow_kalym_andi',
    unlockTurn: 6,
    title: '6. Дело о семье Хаджи-Мурата в ауле Харачи: казнить или помиловать заложников',
    titleEn: '6. The Family of Hadji Murad Held at Kharachi: Fate of the Hostages',
    triggerConditionDesc: 'Акт IV (Ход 6 • 1851) • Кульминационная драма чести и милосердия',
    triggerConditionDescEn: 'Act IV (Turn 6 • 1851) • Climactic Drama of Honor & Mercy',
    description:
      'После обострения вражды с Хаджи-Муратом его жена Патимат, престарелая мать и маленький сын Юсуф оказались под стражей в ауле Харачи. Враги наиба требуют суровой расправы для устрашения, но лучшие воины Аварии и Андии ждут от Имама благородства.',
    descriptionEn:
      'Following the rift with Hadji Murad, his wife Patimat, elderly mother, and young son Yusuf are held under guard in Kharachi. Rivals demand harsh reprisal as a warning, while Avaria’s finest warriors look to the Imam for chivalry.',
    dialogueQuoteRu:
      'Гази-Мухаммад (сын Шамиля): «Отец, мы воюем с царскими генералами, а не с женщинами и детьми. Верни свободу его семье — и Хаджи-Мурат никогда не поднимет шашку против гор!»',
    dialogueQuoteEn:
      'Ghazi-Muhammad (Shamil’s son): “Father, we wage war against Tsarist generals, not women and children. Free his family—and Hadji Murad will never draw his shashka against the mountains!”',
    resolved: false,
    chosenResolution: null,
    options: [
      {
        id: 'enforce_20_ruble_nizam',
        label: 'Даровать семье Хаджи-Мурата почётную неприкосновенность и содержание из казны (-50 руб., Авторитет +10, Иман Андии +12)',
        labelEn: 'Grant Hadji Murad’s family honorable immunity and treasury upkeep (-50 rub., Authority +10, Andi Iman +12)',
        silverDelta: -50,
        authorityDelta: 10,
        provisionsDelta: 90,
        targetNaibId: 'karata',
        imanDelta: 12,
        prideDelta: -8
      },
      {
        id: 'compromise_elder_waqf',
        label: 'Оставить семью под поручительством старейшин Хунзаха и взыскать залог верности (+80 руб. серебром, Авторитет +4)',
        labelEn: 'Place the family under the surety of Khunzakh elders and levy a fidelity bond (+80 silver rub., Authority +4)',
        silverDelta: 80,
        authorityDelta: 4,
        provisionsDelta: 40,
        targetNaibId: 'karata',
        imanDelta: 5,
        prideDelta: -2
      }
    ]
  },
  {
    id: 'case_murtazek_levy_fatigue',
    unlockTurn: 8,
    title: '7. Челобитная горных джамаатов об усталости от содержания конных десятков муртазеков',
    titleEn: '7. Petition of Highland Jamaats Over the Burden of Maintaining Murtazek Squadrons',
    triggerConditionDesc: 'Акт IV (Ход 8 • 1853) • Военная экономика затяжной войны',
    triggerConditionDescEn: 'Act IV (Turn 8 • 1853) • War Economy of a Protracted Conflict',
    description:
      'По военному Низаму каждые девять дворов обязаны полностью снаряжать, кормить и обрабатывать пашню десятого — конного муртазека. После восьми лет непрерывных походов обедневшие общества Гидатля просят временно снизить норму набора до одного всадника с пятнадцати дымов.',
    descriptionEn:
      'Under the Military Nizam, every nine households must equip and till the land of the tenth—a mounted Murtazek. After eight years of relentless campaigns, impoverished Gidatl communities petition to ease the levy to one horseman per fifteen hearths.',
    dialogueQuoteRu:
      'Кадий Гидатля: «Имам, вдовы сами пашут каменистые террасы! Дай аулам год передышки — или поля останутся незасеянными!»',
    dialogueQuoteEn:
      'Qadi of Gidatl: “Imam, widows plow the stony terraces themselves! Grant the auls a year’s relief or the fields will lie fallow!”',
    resolved: false,
    chosenResolution: null,
    options: [
      {
        id: 'levy_subsidize_from_bayt_al_mal',
        label: 'Оплатить снаряжение муртазеков из центральной казны Байт аль-маль и выдать семенное зерно (-95 руб., +140 зерна, Авторитет +9)',
        labelEn: 'Subsidize Murtazek gear from the central Bayt al-Mal treasury and distribute seed grain (-95 rub., +140 grain, Authority +9)',
        silverDelta: -95,
        authorityDelta: 9,
        provisionsDelta: 140,
        targetNaibId: 'teletl',
        imanDelta: 11,
        prideDelta: -7
      },
      {
        id: 'levy_strict_wartime_nizam',
        label: 'Оставить Низам незыблемым на время Восточной войны, заменив конную повинность бедных аулов поставкой селитры (+90 руб., Гордыня +6)',
        labelEn: 'Keep the wartime Nizam intact while commuting poor auls’ cavalry duty to saltpeter deliveries (+90 rub., Pride +6)',
        silverDelta: 90,
        authorityDelta: 4,
        provisionsDelta: 50,
        targetNaibId: 'teletl',
        imanDelta: 2,
        prideDelta: 6
      }
    ]
  },
  {
    id: 'case_salt_barter_groznaya',
    unlockTurn: 10,
    title: '8. Дело о тайном меновом торге солью и лекарствами на меновом дворе у крепости Грозной',
    titleEn: '8. Secret Salt & Medicine Barter at the Fort Groznaya Trading Post',
    triggerConditionDesc: 'Акт IV (Ход 10 • 1854) • Солевая блокада и контрразведка на Сунже',
    triggerConditionDescEn: 'Act IV (Turn 10 • 1854) • Salt Blockade & Sunzha Counter-Intelligence',
    description:
      'Разъезд мухтасибов задержал караван жителей Малой Чечни, тайно выменявших на русском меновом дворе бурки и лес на каменную соль и хинин от болотной лихорадки. Строгий запрет карает сношения с крепостями, но в аулах жестокий дефицит соли.',
    descriptionEn:
      'A Muhtasib patrol detained a caravan from Lesser Chechnya that secretly bartered burkas and timber at a Russian trading post for rock salt and quinine against marsh fever.',
    dialogueQuoteRu:
      'Наиб Талхиг Шалинский: «Без соли гибнет скот, а без хинина лихорадка косит целые сотни на Сунже. Узаконь торг под надзором кунаков — и мы заодно узнаем каждый шаг гарнизона Грозной!»',
    dialogueQuoteEn:
      'Naib Talkhig of Shali: “Without salt the cattle perish, and without quinine fever fells whole squadrons. Regulate the trade through trusted Kunaks and we shall spy on Groznaya’s garrison too!”',
    resolved: false,
    chosenResolution: null,
    options: [
      {
        id: 'salt_regulated_kunak_customs',
        label: 'Разрешить лицензированный вывоз бурок в обмен на соль, хинин и свинец через проверенных кунаков (+110 руб., +120 провианта, Авторитет +7)',
        labelEn: 'Authorize licensed barter for salt, quinine, and lead through vetted Kunak agents (+110 rub., +120 provisions, Authority +7)',
        silverDelta: 110,
        authorityDelta: 7,
        provisionsDelta: 120,
        targetNaibId: 'shali',
        imanDelta: 7,
        prideDelta: -4
      },
      {
        id: 'salt_confiscate_for_hospitals',
        label: 'Конфисковать товар в пользу полевых госпиталей и запретить самовольные выезды за кордон (+40 руб., Авторитет +6, Иман +9)',
        labelEn: 'Confiscate the cargo for field hospitals and forbid unauthorized crossings of the cordon (+40 rub., Authority +6, Iman +9)',
        silverDelta: 40,
        authorityDelta: 6,
        provisionsDelta: 80,
        targetNaibId: 'shali',
        imanDelta: 9,
        prideDelta: 3
      }
    ]
  },
  {
    id: 'case_muhajir_waqf_terraces',
    unlockTurn: 12,
    title: '9. Земельная тяжба между коренными узденями Нагорного Дагестана и переселенцами-мухаджирами из Чечни',
    titleEn: '9. Land Dispute Between Native Dagestani Freemen and Chechen Muhajir Refugees',
    triggerConditionDesc: 'Акт V (Ход 12 • 1856) • Братство народов перед лицом «войны топором»',
    triggerConditionDescEn: 'Act V (Turn 12 • 1856) • Brotherhood Facing the “War by the Axe”',
    description:
      'Сотни чеченских семей (мухаджиров), чьи аулы были сожжены при рубке просек на плоскости, поднялись в горы Андии и Гуниба. Местные старшины ссылаются на древний адат неприкосновенности родовых пастбищ и отказываются уступать террасы.',
    descriptionEn:
      'Hundreds of Chechen muhajir families whose lowland villages were burned along the cleared avenues have climbed into Andia and Gunib. Local elders invoke ancient Adat custom to withhold clan pastures.',
    dialogueQuoteRu:
      'Байсунгур Беноевский: «Когда горело Ахульго — чеченцы разделили с дагестанцами последний чурек! Неужели сегодня для семей моих воинов не найдётся клочка травы в горах?!»',
    dialogueQuoteEn:
      'Baysungur of Benoy: “When Akhulgo burned, Chechens shared their last loaf of bread with Dagestan! Shall my warriors’ families now be denied a patch of pasture in the mountains?!”',
    resolved: false,
    chosenResolution: null,
    options: [
      {
        id: 'waqf_brotherhood_decree',
        label: 'Передать мухаджирам мечетские вакуфные земли и выкупить часть пастбищ за серебро казны (-85 руб., +160 провианта, Авторитет +11)',
        labelEn: 'Allocate mosque Waqf lands to the Muhajirs and purchase pastures with treasury silver (-85 rub., +160 provisions, Authority +11)',
        silverDelta: -85,
        authorityDelta: 11,
        provisionsDelta: 160,
        targetNaibId: 'gunib',
        imanDelta: 14,
        prideDelta: -9
      },
      {
        id: 'waqf_enlist_fortress_builders',
        label: 'Разместить семьи в казённых укреплениях Ведено и Гуниба с полным пайком за службу на валах (-40 руб., +90 провианта, Авторитет +7)',
        labelEn: 'Quarter the families inside state forts at Vedeno and Gunib with full rations for fortification service (-40 rub., +90 provisions, Authority +7)',
        silverDelta: -40,
        authorityDelta: 7,
        provisionsDelta: 90,
        targetNaibId: 'vedeno',
        imanDelta: 8,
        prideDelta: -5
      }
    ]
  },
  {
    id: 'case_baryatinsky_proclamation_elder',
    unlockTurn: 14,
    title: '10. Трибунал Диван-ханы: старшина пограничного аула и печатные прокламации князя Барятинского',
    titleEn: '10. Divan-Khana Tribunal: A Border Elder & Prince Baryatinsky’s Printed Proclamations',
    triggerConditionDesc: 'Акт V (Ход 14 • 1858) • Испытание верности на закате эпохи',
    triggerConditionDescEn: 'Act V (Turn 14 • 1858) • Trial of Loyalty in the Twilight of the War',
    description:
      'Штаб князя Барятинского рассылает по аулам печатные прокламации на арабском языке, обещая сохранение шариатских судов, освобождение от податей и щедрые пенсии каждому обществу, сложившему оружие. У старшины передового аула найдено охранное свидетельство.',
    descriptionEn:
      'Prince Baryatinsky’s staff circulates Arabic proclamations promising Sharia courts, tax exemptions, and pensions to any community laying down arms. A safe-conduct pass is found on a frontier elder.',
    dialogueQuoteRu:
      'Мухаммад Тахир аль-Карахи: «Казнь оттолкнёт колеблющиеся аулы, а безнаказанность откроет ворота ущелий без единого выстрела. Каков твой приговор, Имам?»',
    dialogueQuoteEn:
      'Muhammad Tahir al-Qarakhi: “Harsh execution may alienate wavering villages, yet impunity will open the gorge gates without a shot. What is your judgment, Imam?”',
    resolved: false,
    chosenResolution: null,
    options: [
      {
        id: 'baryatinsky_public_oath_renewal',
        label: 'Созвать всенародный сход в мечети: сжечь прокламацию, простить старшину под клятву на Коране и снизить закят (-55 руб., Авторитет +10)',
        labelEn: 'Convene a public mosque assembly: burn the proclamation, pardon the elder upon a Quranic oath, and ease Zakat (-55 rub., Authority +10)',
        silverDelta: -55,
        authorityDelta: 10,
        provisionsDelta: 70,
        targetNaibId: 'chokh',
        imanDelta: 12,
        prideDelta: -8
      },
      {
        id: 'baryatinsky_replace_with_murid_commandant',
        label: 'Отстранить старшину, выслать его в глубокий тыл и поставить во главе аула сотню верных мухаджиров (+65 руб., Авторитет +6)',
        labelEn: 'Remove the elder to the interior and garrison the village with loyal Muhajir fighters (+65 rub., Authority +6)',
        silverDelta: 65,
        authorityDelta: 6,
        provisionsDelta: 40,
        targetNaibId: 'chokh',
        imanDelta: 5,
        prideDelta: 4
      }
    ]
  }
];

export const SHAMIL_ORDERS = [
  {
    id: 'order_lion',
    name: 'Круглый прорезной знак храбрости',
    nameEn: 'Pierced Silver Order of Valor',
    arabicMotto: '«Кто думает о последствиях — тот не храбрец»',
    arabicMottoEn: '“He who ponders the consequences is no brave man”',
    shape:
      'Подлинный знак XIX в. (Нац. музей РД им. А. Тахо-Годи): серебро, гравировка, чернь, пять прорезных лепестков, выпуклый умбон и изогнутая сабля вдоль обода',
    shapeEn:
      'Authentic 19th-c. badge (National Museum of Dagestan): silver, engraving, niello, five pierced heart-petals, domed central boss, and engraved saber along the rim',
    silverCost: 95,
    imanBonus: 12,
    prideReduction: 14,
    centerX: 54.8,
    centerY: 60.3,
    zoomPct: 860
  },
  {
    id: 'order_crescent',
    name: 'Серебряный полумесяц «Хиляль»',
    nameEn: 'Silver Crescent of Valor “Hilal”',
    arabicMotto: '«Помощь от Аллаха и близкая победа»',
    arabicMottoEn: '“Victory from Allah and an imminent triumph”',
    shape:
      'Серебряный знак-полумесяц XIX в. (Нац. музей РД им. А. Тахо-Годи): ковка, чеканка, гравированная арабская надпись на лицевой пластине',
    shapeEn:
      'Authentic 19th-c. silver crescent badge (National Museum of Dagestan): forged and chased silver plate with continuous engraved Arabic calligraphy',
    silverCost: 110,
    imanBonus: 13,
    prideReduction: 16,
    centerX: 42.6,
    centerY: 59.0,
    zoomPct: 790
  },
  {
    id: 'order_sword',
    name: 'Медальон с розеткой и шашкой',
    nameEn: 'Circular Medallion with Rosette & Shashka',
    arabicMotto: '«Слава и доблесть воину, не отступающему в бою»',
    arabicMottoEn: '“Glory and valor to the warrior who never yields in battle”',
    shape:
      'Круглый серебряный орден XIX в. (Нац. музей РД им. А. Тахо-Годи): гравированная восьмилепестковая розетка в центре, силуэт шашки справа и арабский картуш внизу',
    shapeEn:
      'Authentic 19th-c. circular silver medallion (National Museum of Dagestan): engraved eight-petal central rosette, shashka saber motif at right, and Arabic cartouche',
    silverCost: 120,
    imanBonus: 15,
    prideReduction: 18,
    centerX: 11.55,
    centerY: 40.4,
    zoomPct: 850
  },
  {
    id: 'order_mudir',
    name: 'Большая фестончатая звезда Мудира',
    nameEn: 'Grand Scalloped Star of the Mudir',
    arabicMotto: '«Повиновение Имаму — залог победы правоверных»',
    arabicMottoEn: '“Obedience to the Imam is the pledge of victory for the faithful”',
    shape:
      'Высший позолоченный знак мудира XIX в. (Нац. музей РД им. А. Тахо-Годи): серебро, медь, позолота, восемь фестончатых лепестков с шариками-умбонами и арабской вязью',
    shapeEn:
      'Supreme 19th-c. gilt Mudir star (National Museum of Dagestan): silver, copper, gilding, eight scalloped lobes with embossed bosses and engraved Arabic cartouches',
    silverCost: 150,
    imanBonus: 18,
    prideReduction: 22,
    centerX: 49.15,
    centerY: 34.7,
    zoomPct: 600
  }
];

export const OTTOMAN_OPTIONS = [
  {
    id: 'porte_envoys',
    title: 'Посольство Хаджи-Исмаила в Стамбул (Дворец Долмабахче)',
    titleEn: 'Embassy of Hajji Ismail to Istanbul (Dolmabahçe Palace)',
    desc: 'Запрос султану Абдул-Меджиду I о признании титула Сердар-ы Экрем, присылке золотых червонцев и военного союза.',
    descEn: 'Petition to Sultan Abdülmecid I recognizing the title of Serdar-ı Ekrem, requesting gold ducats and military alliance.',
    costSilver: 110,
    rewardPowder: 25,
    rewardSilver: 260,
    rewardSupport: 14
  },
  {
    id: 'trabzon_smugglers',
    title: 'Караван фелюг из Трабзона и Синопа (Контрабанда пороха и свинца)',
    titleEn: 'Felucca Flotilla from Trabzon & Sinop (Powder & Lead Smuggling)',
    desc: 'Тайная закупка английского ружейного пороха, кремней и штуцеров через черкесские берега в обход крейсеров Черноморского флота.',
    descEn: 'Covert procurement of English rifle powder, flints, and Brunswick stutzers via the Circassian coast, evading Black Sea Fleet cruisers.',
    costSilver: 165,
    rewardPowder: 75,
    rewardSilver: 0,
    rewardSupport: 8
  },
  {
    id: 'cairo_engineers',
    title: 'Переписка с Ибрагим-пашой Египетским и инженерами Низама',
    titleEn: 'Correspondence with Ibrahim Pasha of Egypt & Nizam Engineers',
    desc: 'Привлечение арабских и черкесских артиллерийских офицеров (школа Хаджи-Юсуфа Сафарова) для минной обороны аулов.',
    descEn: 'Recruiting Arab and Circassian artillery and sapper officers (school of Col. Hajji Yusuf Safarov) for subterranean siege defense.',
    costSilver: 130,
    rewardPowder: 40,
    rewardSilver: 80,
    rewardSupport: 11
  }
];

// ============================================================================
// ДАННЫЕ РЕЖИМА Б: СПЛАЙНОВЫЙ КОРИДОР ЛЕСНОЙ ЗАСАДЫ («СУХАРНАЯ ЭКСПЕДИЦИЯ» 1845 Г.)
// ============================================================================
export const INITIAL_SPLINE_SEGMENTS = [
  {
    id: 'seg_rechel',
    name: '1. Крутой спуск с хребта Речель (Ретло)',
    elevation: '2100 м',
    widthDesc: 'Узкий глинистый карниз (в 2 вьюка)',
    barricades: 1,
    ambushSquads: 2,
    coords: { x: 75, y: 78 }
  },
  {
    id: 'seg_beech_gorge',
    name: '2. Первая буковая теснина («Ворота смерти»)',
    elevation: '1850 м',
    widthDesc: 'Глубокая лесная промоина под вековыми буками',
    barricades: 2,
    ambushSquads: 3,
    coords: { x: 205, y: 158 }
  },
  {
    id: 'seg_ravine_1',
    name: '3. Поперечная балка у кургана (Место гибели ген. Пассека)',
    elevation: '1620 м',
    widthDesc: 'Расселина с завалами из срубленных стволов',
    barricades: 2,
    ambushSquads: 3,
    coords: { x: 345, y: 122 }
  },
  {
    id: 'seg_mud_slope',
    name: '4. Размытый косогор над речкой Аксай',
    elevation: '1440 м',
    widthDesc: 'Скользкая глиняная тропа над обрывом',
    barricades: 1,
    ambushSquads: 2,
    coords: { x: 475, y: 192 }
  },
  {
    id: 'seg_kozhalk',
    name: '5. Лесной перешеек под горой Кожалк-Дук',
    elevation: '1290 м',
    widthDesc: 'Простреливаемая с двух сторон поляна',
    barricades: 1,
    ambushSquads: 2,
    coords: { x: 605, y: 145 }
  },
  {
    id: 'seg_dargo_out',
    name: '6. Выход к пепелищу лагеря Дарго',
    elevation: '1150 м',
    widthDesc: 'Разбитая артиллерийская дорога у реки',
    barricades: 0,
    ambushSquads: 1,
    coords: { x: 735, y: 185 }
  }
];

export const INITIAL_SPLINE_ECHELONS = [
  {
    id: 'ech_vanguard',
    name: 'Авангард ген.-майора В. М. Викторова (Кабардинский и Навагинский полки)',
    segmentIdx: 1,
    strength: 1150,
    cohesion: 74,
    guns: 2
  },
  {
    id: 'ech_artillery',
    name: 'Горная артиллерийская батарея и зарядные ящики',
    segmentIdx: 2,
    strength: 420,
    cohesion: 62,
    guns: 4
  },
  {
    id: 'ech_supply',
    name: 'Главный вьючный обоз с сухарями и порохом (600 мулов и повозок)',
    segmentIdx: 3,
    strength: 680,
    cohesion: 48,
    guns: 0
  },
  {
    id: 'ech_rearguard',
    name: 'Арьергард ген.-майора Д. И. Пассека (Люблинский егерский полк)',
    segmentIdx: 4,
    strength: 980,
    cohesion: 66,
    guns: 2
  }
];

// ============================================================================
// ПЯТЬ АКТОВ КАВКАЗСКОЙ ДРАМЫ (1839–1859 ГГ.): СЮЖЕТНАЯ АРХИТЕКТУРА КАМПАНИИ
// ============================================================================
export const DRAMATIC_CAMPAIGN_ACTS = [
  {
    id: 'act_1_akhulgo_avaria',
    actNumber: 1,
    years: '1839–1843 гг.',
    yearsEn: '1839–1843',
    title: 'Акт I. Клятва на скале Ахульго и Гроза над Аварией',
    titleEn: 'Act I. Oath on Akhulgo Cliff & Thunder Over Avaria',
    subtitle: 'От выдачи 8-летнего сына Джемалуддина в аманаты — к разгрому 12 царских крепостей за 75 дней',
    subtitleEn: 'From surrendering 8-year-old son Jamaluddin as a hostage to storming 12 Imperial forts in 75 days',
    antagonist: 'Ген.-адъютант П. Х. Граббе',
    antagonistEn: 'Gen.-Adjutant P. Kh. Grabbe',
    protagonistAlly: 'Хаджи-Мурат Хунзахский и Кибит-Магома',
    protagonistAllyEn: 'Hadji Murad of Khunzakh & Kibit-Magoma',
    sceneArt: 'Diorama_Siege_TopDown_Salty_1847.jpg',
    stakesRu: 'Выжить после падения Ахульго, объединить Чечню и Аварию и вернуть горные плато под знамя Диван-ханы.',
    stakesEn: 'Survive the fall of Akhulgo, unite Chechnya and Avaria, and reclaim the mountain plateaus under the Divan-Khana banner.',
    keyQuoteSpeakerRu: 'Имам Шамиль (ночной прорыв с Ахульго, август 1839 г.)',
    keyQuoteSpeakerEn: 'Imam Shamil (night breakout from Akhulgo, August 1839)',
    keyQuoteRu: '«Сегодня у меня осталась лишь эта шашка и семеро раненых товарищей. Но клянусь Богом: из этого пепла поднимется государство, о которое разобьются корпуса!»',
    keyQuoteEn: '“Tonight I have only this shashka and seven wounded comrades. Yet I swear by God: from these ashes shall rise a state against which whole army corps will shatter!”',
    linkedScenarioId: 'camp_1843'
  },
  {
    id: 'act_2_dargo_fire',
    actNumber: 2,
    years: 'Лето 1845 г.',
    yearsEn: 'Summer 1845',
    title: 'Акт II. Пепел Дарго и Капкан для Наместника',
    titleEn: 'Act II. Ashes of Dargo & The Viceroy’s Trap',
    subtitle: 'Сожжение собственной столицы перед 20-тысячной армией кн. М. С. Воронцова и разгром «Сухарной экспедиции»',
    subtitleEn: 'Burning the Imamate’s own capital before Count Vorontsov’s 20,000-man army and routing the “Biscuit Expedition”',
    antagonist: 'Светлейший князь М. С. Воронцов',
    antagonistEn: 'Prince M. S. Vorontsov',
    protagonistAlly: 'Байсунгур Беноевский и Талгик Шалинский',
    protagonistAllyEn: 'Baysungur of Benoy & Talkhig of Shali',
    sceneArt: 'KeyArt_Dargo_BeechForest_Ambush_1845.jpg',
    stakesRu: 'Заманить 20-тысячный корпус Воронцова в буковую западню Ичкерии, сбить спесь с Петербурга и заложить новую столицу в Ведено.',
    stakesEn: 'Lure Vorontsov’s 20,000-strong corps into the beech forest trap of Ichkeria and found the new capital at Vedeno.',
    keyQuoteSpeakerRu: 'Байсунгур Беноевский (над горящим Дарго, 6 июля 1845 г.)',
    keyQuoteSpeakerEn: 'Baysungur of Benoy (above burning Dargo, July 6, 1845)',
    keyQuoteRu: '«Пусть светлейший князь греется у углей наших саклей! Дорогу назад через хребет Речель он будет покупать кровью за каждый сухарь!»',
    keyQuoteEn: '“Let His Serene Highness warm himself by the embers of our homes! He shall buy his road back across Rechel Ridge with blood for every biscuit!”',
    linkedScenarioId: 'camp_1845'
  },
  {
    id: 'act_3_terek_and_mines',
    actNumber: 3,
    years: '1846–1849 гг.',
    yearsEn: '1846–1849',
    title: 'Акт III. Бросок за Терек и Подземные Крепости',
    titleEn: 'Act III. Thrust Beyond the Terek & Subterranean Fortresses',
    subtitle: 'Прорыв 14 000 всадников в Кабарду, встреча с хирургом Н. И. Пироговым под Салтами и 22 000 ядер под Чохом',
    subtitleEn: '14,000 horsemen crossing into Kabarda, Surgeon Pirogov’s truce at Salty, and 22,000 shells at Chokh',
    antagonist: 'Князь М. З. Аргутинский-Долгоруков и ген. Р. К. Фрейтаг',
    antagonistEn: 'Prince M. Z. Argutinsky-Dolgorukov & Gen. R. K. Freytag',
    protagonistAlly: 'Инженер Хаджи-Юсуф Сафаров и Мухаммад-Амин',
    protagonistAllyEn: 'Engineer Hajji Yusuf Safarov & Muhammad-Amin',
    sceneArt: 'Crisis_Chokh_Siege_1849.jpg',
    stakesRu: 'Выдержать удар тяжёлой осадной артиллерии и сапёрных подкопов с помощью подземных блиндажей и контрминной войны.',
    stakesEn: 'Withstand heavy siege artillery and sapper mines through multi-tiered log blindages and counter-mine warfare.',
    keyQuoteSpeakerRu: 'Инженер Хаджи-Юсуф Сафаров (в подземной галерее Салтов, 1847 г.)',
    keyQuoteSpeakerEn: 'Engineer Hajji Yusuf Safarov (in Salty’s counter-mine gallery, 1847)',
    keyQuoteRu: '«Смотрите на воду в медном тазу: пока она дрожит — русские сапёры роют под нами. Заложите двадцать пудов пороха — мы встретим их под землёй!»',
    keyQuoteEn: '“Watch the water in the copper basin: while it trembles, Russian sappers dig beneath us. Lay twenty poods of powder—we shall meet them underground!”',
    linkedScenarioId: 'camp_1845'
  },
  {
    id: 'act_4_hadji_murad_and_son',
    actNumber: 4,
    years: '1850–1855 гг.',
    yearsEn: '1850–1855',
    title: 'Акт IV. Крылатый Барс и Сын в чужом мундире',
    titleEn: 'Act IV. The Winged Leopard & The Son in a Foreign Uniform',
    subtitle: '«Война топором» ген. Евдокимова, суд над Хаджи-Муратом в Андии и возвращение поручика Джемалуддина на реке Мичик',
    subtitleEn: 'Gen. Evdokimov’s “War by the Axe”, the trial of Hadji Murad in Andia, and Lt. Jamaluddin’s return on the Michik River',
    antagonist: 'Ген. Н. И. Евдокимов и интриги внутри Диван-ханы',
    antagonistEn: 'Gen. N. I. Evdokimov & Internal Divan Intrigue',
    protagonistAlly: 'Хаджи-Мурат Хунзахский и поручик Джемалуддин',
    protagonistAllyEn: 'Hadji Murad of Khunzakh & Lt. Jamaluddin',
    sceneArt: 'KeyArt_Michik_1855_Jamaluddin_Exchange.jpg',
    stakesRu: 'Предотвратить раскол между лучшими полководцами гор и решить судьбу старшего сына Имама, вернувшегося из Петербурга после 16 лет разлуки.',
    stakesEn: 'Prevent a fatal rift among the mountains’ finest commanders and decide the fate of the Imam’s eldest son after 16 years in St. Petersburg.',
    keyQuoteSpeakerRu: 'Поручик Джемалуддин Шамиль (после обмена на реке Мичик, 10 марта 1855 г.)',
    keyQuoteSpeakerEn: 'Lt. Jamaluddin Shamil (after the Michik River exchange, March 10, 1855)',
    keyQuoteRu: '«Отец, я молился об этом дне шестнадцать лет. Но в России я видел стальные заводы и стотысячные полки со штуцерами. Выслушай меня наедине…»',
    keyQuoteEn: '“Father, I prayed for this day for sixteen years. Yet in Russia I saw steel foundries and hundred-thousand-man regiments with rifled stutzers. Hear me in private…”',
    linkedScenarioId: 'camp_1845'
  },
  {
    id: 'act_5_gunib_finale',
    actNumber: 5,
    years: '1859 г.',
    yearsEn: '1859',
    title: 'Акт V. Последний оплот: 400 мюридов на Верхнем Гунибе',
    titleEn: 'Act V. The Last Bastion: 400 Murids on Upper Gunib',
    subtitle: '200-тысячная армия фельдмаршала А. И. Барятинского вокруг заоблачной скалы Гуниб и финальный выбор перед лицом Истории',
    subtitleEn: 'Field Marshal Baryatinsky’s 200,000-man army encircling cloud-piercing Gunib and the final choice before History',
    antagonist: 'Генерал-фельдмаршал князь А. И. Барятинский',
    antagonistEn: 'Field Marshal Prince A. I. Baryatinsky',
    protagonistAlly: 'Байсунгур Беноевский и Гази-Мухаммад',
    protagonistAllyEn: 'Baysungur of Benoy & Ghazi-Muhammad',
    sceneArt: 'Epilogue_Kaluga_And_Medina_1859_1871.jpg',
    stakesRu: 'Спасти будущее горского народа в час, когда кольцо 40 батальонов сомкнулось вокруг последней цитадели Дагестана.',
    stakesEn: 'Preserve the future and honor of the mountaineer people as 40 Imperial battalions close around Dagestan’s final citadel.',
    keyQuoteSpeakerRu: 'Имам Шамиль (в берёзовой роще Верхнего Гуниба, 25 августа 1859 г.)',
    keyQuoteSpeakerEn: 'Imam Shamil (in the birch grove of Upper Gunib, August 25, 1859)',
    keyQuoteRu: '«Двадцать пять лет мы стояли против величайшей империи мира. Моя борода побелела в пороховом дыму — теперь мой долг не дать погибнуть вашим детям»',
    keyQuoteEn: '“For twenty-five years we stood alone against the mightiest empire on earth. My beard turned white in powder smoke—now my duty is to save your children from slaughter.”',
    linkedScenarioId: 'camp_1859'
  }
];

// ============================================================================
// КЛЮЧЕВЫЕ ИСТОРИЧЕСКИЕ РАЗВИЛКИ И КРИЗИСЫ КАВКАЗСКОЙ ВОЙНЫ (1845–1855 ГГ.)
// ============================================================================
export const INITIAL_HISTORICAL_CRISES = [
  {
    id: 'crisis_dargo_fire_1845',
    unlockTurn: 1,
    actNumber: 2,
    actBadgeRu: 'АКТ II • ХОД 1: ПОХОД НА ДАРГО И ПЕРЕНОС СТОЛИЦЫ',
    actBadgeEn: 'ACT II • TURN 1: THE DARGO EXPEDITION & NEW CAPITAL',
    year: 'Июль 1845 г. (1261 г. х.)',
    yearEn: 'July 1845 (1261 AH)',
    title: 'Пепел Дарго и «Сухарная экспедиция» на хребте Речель',
    titleEn: 'The Ashes of Dargo & the “Biscuit Expedition” on Rechel Ridge',
    sceneArt: 'KeyArt_Dargo_BeechForest_Ambush_1845.jpg',
    sceneCaption: 'Засада чеченских и дагестанских наибов в вековом буковом лесу Ичкерии против «Сухарной оказии» ген. Пассека (июль 1845 г.)',
    sceneCaptionEn: 'Ambush by Chechen and Dagestani Naibs in the ancient beech forest of Ichkeria against Gen. Passek’s “Biscuit Convoy” (July 1845)',
    actors: ['Имам Шамиль', 'Байсунгур Беноевский', 'Кн. Воронцов'],
    historicalContext:
      '20-тысячный корпус главнокомандующего графа М. С. Воронцова с боями спустился с Андийского хребта в долину Аксая к столице Дарго. По приказу Имама дома Дарго преданы огню, а продовольственный обоз генерала Пассека растянулся по узкой лесной тропе хребта Речель.',
    historicalContextEn:
      'Viceroy Count M. S. Vorontsov’s 20,000-man corps fought its way down the Andi ridge into the Aksay valley toward the capital Dargo. By the Imam’s order Dargo is put to the torch while Gen. Passek’s biscuit convoy stretches along the narrow forest trail of Rechel Ridge.',
    dramaticDialogues: [
      {
        speaker: 'Байсунгур Беноевский',
        speakerEn: 'Baysungur of Benoy',
        role: 'Наиб Беноя и Ичкерии',
        roleEn: 'Naib of Benoy & Ichkeria',
        line: '«Воронцов вошёл в пепелище Дарго, но его солдаты уже пять дней без сухарей! Повалим вековые буки поперёк тропы Речель — ни одна арба с провиантом не дойдёт до его лагеря!»',
        lineEn: '“Vorontsov entered the ashes of Dargo, yet his soldiers have gone five days without biscuits! Let us fell ancient beeches across the Rechel trail—not a single supply wagon shall reach his camp!”'
      },
      {
        speaker: 'Шуайб-Мулла Цонтороевский',
        speakerEn: 'Shuaib-Mullah of Tsontoroy',
        role: 'Командующий лесными засеками Мичика и Ичкерии',
        roleEn: 'Commander of the Michik & Ichkeria Forest Abatis',
        line: '«Пусть их пушки стреляют по пустым скалам, а наши стрелки будут бить с крон деревьев по упряжкам и офицерам. И пока Воронцов ищет выход к Герзель-аулу — заложим новую столицу в неприступном Ведено!»',
        lineEn: '“Let their cannons shell empty cliffs while our marksmen fire from the treetops at the teams and officers. And while Vorontsov seeks an escape toward Gerzel-Aul, let us found our new capital at fortress Vedeno!”'
      }
    ],
    fateConsequenceRu: 'Открывает кампанию 1845 года: определяет трофейный арсенал Ичкерии и перенос столицы Диван-ханы в Ведено.',
    fateConsequenceEn: 'Opens the 1845 campaign: determines Ichkeria’s captured arsenal and the transfer of the Divan-Khana capital to Vedeno.',
    resolved: false,
    chosenOption: null,
    chosenOptionEn: null,
    options: [
      {
        id: 'dargo_biscuit_ambush',
        label: 'Сомкнуть лесные засеки на хребте Речель и разгромить «Сухарную оказию» генерала Пассека',
        labelEn: 'Seal the forest abatis on Rechel Ridge and rout Gen. Passek’s “Biscuit Convoy”',
        effectSummary: 'Трофейный порох +45 пуд. | Провиант +180 мер | Натиск Воронцова -18% | +35 муртазеков в Беное',
        effectSummaryEn: 'Captured Powder +45 poods | Provisions +180 meas. | Vorontsov’s Pressure -18% | +35 Murtazeks in Benoy',
        powderDelta: 45,
        silverDelta: 120,
        provisionsDelta: 180,
        authorityDelta: 12,
        targetNaibId: 'benoy',
        imanDelta: 14,
        prideDelta: -8,
        murtazeksBonus: 35,
        pressureDelta: -18
      },
      {
        id: 'dargo_vedeno_foundation',
        label: 'Вывезти казну и архивы Диван-ханы в Дарго-Ведено и возвести вокруг новой столицы тройной пояс редутов',
        labelEn: 'Evacuate the treasury and Divan-Khana archives to Dargo-Vedeno and erect a triple ring of redoubts',
        effectSummary: 'Казна +160 руб. | Провиант +240 мер | Авторитет +10% | Натиск на Ведено и Беной -14%',
        effectSummaryEn: 'Treasury +160 rub. | Provisions +240 meas. | Authority +10% | Vedeno & Benoy Pressure -14%',
        powderDelta: 15,
        silverDelta: 160,
        provisionsDelta: 240,
        authorityDelta: 10,
        targetNaibId: 'vedeno',
        imanDelta: 12,
        prideDelta: -6,
        murtazeksBonus: 25,
        pressureDelta: -14
      }
    ]
  },
  {
    id: 'crisis_kabarda_1846',
    unlockTurn: 2,
    actNumber: 3,
    actBadgeRu: 'АКТ III • ХОД 2: ДЕРЗКИЙ ПРОРЫВ ЗА ТЕРЕК',
    actBadgeEn: 'ACT III • TURN 2: DARING THRUST BEYOND THE TEREK',
    year: 'Апрель 1846 г. (1262 г. х.)',
    yearEn: 'April 1846 (1262 AH)',
    title: 'Кабардинский прорыв: Форсирование Терека у Татартупского минарета',
    titleEn: 'The Kabardian Breakthrough: Crossing the Terek at the Tatartup Minaret',
    sceneArt: 'Crisis_Kabarda_Tatartup_1846.jpg',
    sceneCaption: 'Переправа конницы муртазеков и горных орудий Шамиля через Терек у Татартупского минарета (апрель 1846 г.)',
    sceneCaptionEn: 'Shamil’s Murtazek cavalry and mountain guns crossing the Terek at the Tatartup Minaret (April 1846)',
    actors: ['Имам Шамиль', 'Мухаммад-Амин', 'Ген. Фрейтаг'],
    historicalContext:
      '14-тысячная армия Имамата с 8 пушками скрытно подошла к Военно-Грузинской дороге с целью поднять Большую Кабарду и соединиться с черкесами и наибом Мухаммад-Амином. Однако генерал Р. К. Фрейтаг уже идёт форсированным маршем по вашим следам.',
    historicalContextEn:
      'The 14,000-strong Imamate army with 8 cannons secretly reached the Georgian Military Road aiming to rally Greater Kabarda and link up with the Circassians and Naib Muhammad-Amin. However, Gen. R. K. Freytag is already pursuing on a forced march.',
    dramaticDialogues: [
      {
        speaker: 'Хаджи-Мурат',
        speakerEn: 'Hadji Murad',
        role: 'Командир авангарда конницы',
        roleEn: 'Cavalry Vanguard Commander',
        line: '«Мои всадники уже переплыли Терек! Дай мне три тысячи сабель — я возьму Нальчик прежде, чем Фрейтаг успеетперековать обозных коней!»',
        lineEn: '“My horsemen have already swum the Terek! Give me three thousand sabers—I will take Nalchik before Freytag can shoe his wagon horses!”'
      },
      {
        speaker: 'Ген. Фрейтаг',
        speakerEn: 'Gen. Freytag',
        role: 'Депеша, перехваченная у казачьего курьера',
        roleEn: 'Intercepted Cossack Dispatch',
        line: '«Занять все броды через Терек и Сунжу! Если Шамиль задержится у Баксана ещё на двое суток — мы запрём его конницу в каменном мешке без единого заряда!»',
        lineEn: '“Seize every ford across the Terek and Sunzha! If Shamil lingers near Baksan two days longer, we shall lock his cavalry in a stone trap without a single cartridge!”'
      }
    ],
    fateConsequenceRu: 'Влияет на судьбу Западного фронта (Мухаммад-Амин) и мобильность конного резерва Аварии.',
    fateConsequenceEn: 'Shapes the fate of the Western Front (Muhammad-Amin) and Avaria’s cavalry reserve mobility.',
    resolved: false,
    chosenOption: null,
    chosenOptionEn: null,
    options: [
      {
        id: 'kabarda_deep_march',
        label: 'Двинуться вглубь Кабарды к Баксану и ждать восстания адыгских князей',
        labelEn: 'Advance deep into Kabarda toward Baksan and await the Circassian princes’ uprising',
        effectSummary: 'Муртазеки в округах +160 | Порох -30 пуд. | Натиск врага +10%',
        effectSummaryEn: 'District Murtazeks +160 | Gunpowder -30 poods | Imperial Pressure +10%',
        powderDelta: -30,
        silverDelta: 80,
        provisionsDelta: 90,
        authorityDelta: 7,
        targetNaibId: 'khunzakh',
        imanDelta: 8,
        prideDelta: -5,
        murtazeksBonus: 40,
        pressureDelta: 10
      },
      {
        id: 'kabarda_tactical_withdrawal',
        label: 'Совершить искусный маневр отхода с дружиной князя Магомет-Мирзы Анзорова',
        labelEn: 'Execute a masterly withdrawal maneuver alongside Prince Magomet-Mirza Anzorov’s retinue',
        effectSummary: 'Авторитет +10% | Иман всех наибов +5 | Натиск Фрейтага -12%',
        effectSummaryEn: 'Authority +10% | All Naibs Iman +5 | Freytag’s Pressure -12%',
        powderDelta: -10,
        silverDelta: 120,
        provisionsDelta: 150,
        authorityDelta: 10,
        targetNaibId: 'shali',
        imanDelta: 10,
        prideDelta: -6,
        murtazeksBonus: 25,
        pressureDelta: -12
      }
    ]
  },
  {
    id: 'crisis_salty_pirogov_1847',
    unlockTurn: 3,
    actNumber: 3,
    actBadgeRu: 'АКТ III • ХОД 3: ЧЕСТЬ И МИЛОСЕРДИЕ ПОД ОГНЁМ',
    actBadgeEn: 'ACT III • TURN 3: HONOR & MERCY UNDER SIEGE FIRE',
    year: 'Август 1847 г. (1263 г. х.)',
    yearEn: 'August 1847 (1263 AH)',
    title: 'Осада Салтов: Полевой лазарет хирурга Н. И. Пирогова и перемирие о павших',
    titleEn: 'Siege of Salty: Surgeon N. I. Pirogov’s Field Hospital & Truce for the Fallen',
    sceneArt: 'KeyArt_Salty_Siege_CopperBasin_1847.jpg',
    sceneCaption: 'Осада аула Салты: подземные блиндажи Сафарова и полевой лазарет Н. И. Пирогова (август 1847 г.)',
    sceneCaptionEn: 'Siege of Salty: Safarov’s subterranean blindages and Surgeon N. I. Pirogov’s field hospital (August 1847)',
    actors: ['Пирогов', 'Хаджи-Юсуф Сафаров', 'Кн. Воронцов'],
    historicalContext:
      'Под стенами Салтов русский хирург Николай Пирогов впервые в истории применяет эфирный наркоз, спасая раненых солдат и пленных мюридов. Князь Воронцов присылает парламентёра с предложением о 6-часовом перемирии для выноса тел павших с обеих сторон.',
    historicalContextEn:
      'Beneath the walls of Salty, Russian surgeon Nikolai Pirogov pioneers field ether anesthesia, saving wounded soldiers and captured murids alike. Prince Vorontsov sends a parlementaire proposing a 6-hour truce to recover the fallen on both sides.',
    dramaticDialogues: [
      {
        speaker: 'Пирогов',
        speakerEn: 'Surgeon Pirogov',
        role: 'Передано через отпущенного из лазарета раненого мюрида',
        roleEn: 'Conveyed via a Wounded Murid Released from the Field Hospital',
        line: '«Перед операционным столом и перед смертью нет ни русских, ни горцев — есть страждущие люди. Я перевязал ваших раненых так же, как своих гренадер»',
        lineEn: '“Before the operating table and before death there are neither Russians nor mountaineers—only suffering men. I bound your wounded just as I did my own grenadiers.”'
      },
      {
        speaker: 'Хаджи-Юсуф Сафаров',
        speakerEn: 'Hajji Yusuf Safarov',
        role: 'Главный инженер обороны Салтов',
        roleEn: 'Chief Defense Engineer of Salty',
        line: '«Имам, если мы дадим 6 часов тишины — мы похороним шахидов с честью. А если используем ночь для ремонта подземных накатов — выдержим ещё три штурма!»',
        lineEn: '“Imam, if we grant six hours of truce we shall bury our fallen with honor; if we use the quiet to reinforce the subterranean log roofs, we shall withstand three more assaults!”'
      }
    ],
    fateConsequenceRu: 'Определяет рыцарскую репутацию Шамиля и стойкость подземных гарнизонов Андалала.',
    fateConsequenceEn: 'Determines Shamil’s chivalrous renown and the endurance of Andalal’s subterranean garrisons.',
    resolved: false,
    chosenOption: null,
    chosenOptionEn: null,
    options: [
      {
        id: 'salty_chivalrous_truce',
        label: 'Дать рыцарское согласие на вынос павших и передать дар лазарету Пирогова',
        labelEn: 'Grant chivalrous consent to recover the fallen and send a gift to Pirogov’s field hospital',
        effectSummary: 'Авторитет Шамиля +12% | Иман Гергебиля и Салтов +10 | Снижение стресса',
        effectSummaryEn: 'Shamil’s Authority +12% | Gergebil & Salty Iman +10 | Reduced Leader Strain',
        powderDelta: 0,
        silverDelta: -30,
        provisionsDelta: 60,
        authorityDelta: 12,
        targetNaibId: 'gergebil',
        imanDelta: 10,
        prideDelta: -8,
        murtazeksBonus: 0,
        pressureDelta: -8
      },
      {
        id: 'salty_fortify_pause',
        label: 'Использовать часы затишья для скрытной починки подземных блиндажей и колодца',
        labelEn: 'Use the hours of quiet to covertly reinforce underground log blindages and the water spring',
        effectSummary: 'Порох +20 пуд. | Натиск на Гергебиль и Салты -18% | Провиант +80 мер',
        effectSummaryEn: 'Gunpowder +20 poods | Gergebil & Salty Pressure -18% | Provisions +80 meas.',
        powderDelta: 20,
        silverDelta: 0,
        provisionsDelta: 80,
        authorityDelta: 4,
        targetNaibId: 'gergebil',
        imanDelta: 6,
        prideDelta: 0,
        murtazeksBonus: 15,
        pressureDelta: -18
      }
    ]
  },
  {
    id: 'crisis_chokh_siege_1849',
    unlockTurn: 4,
    actNumber: 3,
    actBadgeRu: 'АКТ III • ХОД 4: 22 000 ЯДЕР НАД ПРОПАСТЬЮ',
    actBadgeEn: 'ACT III • TURN 4: 22,000 SHELLS ABOVE THE ABYSS',
    year: 'Июль — Август 1849 г. (1265 г. х.)',
    yearEn: 'July — August 1849 (1265 AH)',
    title: 'Героическая оборона бастиона Чох: 22 тысячи ядер генерала Аргутинского',
    titleEn: 'Heroic Defense of the Chokh Bastion: 22,000 Shells of Gen. Argutinsky',
    sceneArt: 'Crisis_Chokh_Siege_1849.jpg',
    sceneCaption: 'Героическая оборона многоярусного бастиона Чох под огнём 48 осадных орудий с Турчидага (август 1849 г.)',
    sceneCaptionEn: 'Heroic defense of the multi-tiered Chokh bastion under fire from 48 siege guns on Mount Turchidag (August 1849)',
    actors: ['Хаджи-Юсуф Сафаров', 'Кибит-Магома', 'Хаджи-Мурат'],
    historicalContext:
      'Князь М. З. Аргутинский-Долгоруков подтянул к аулу Чох 48 осадных орудий и заложил глубокие минные галереи. Инженер Хаджи-Юсуф Сафаров и наиб Муса Балаханский просят экстренно прислать порох для контрминных камуфлетов или ударить конницей Хаджи-Мурата по тылам осадного лагеря на Турчидаге.',
    historicalContextEn:
      'Prince M. Z. Argutinsky-Dolgorukov deployed 48 siege guns before Chokh and drove deep mine galleries. Engineer Hajji Yusuf Safarov and Naib Musa of Balakhani request urgent gunpowder for counter-mine camouflets or a night cavalry strike by Hadji Murad against the Turchidag siege camp.',
    dramaticDialogues: [
      {
        speaker: 'Кибит-Магома',
        speakerEn: 'Kibit-Magoma',
        role: 'Мудир Телетля и Андалала',
        roleEn: 'Mudir of Teletl & Andalal',
        line: '«От грохота 48 батарей Аргутинского в горах обваливаются скалы! Если Чох падёт — дорога на Гуниб и Согратль будет открыта!»',
        lineEn: '“From the thunder of Argutinsky’s 48 batteries the very cliffs are crumbling! If Chokh falls, the road to Gunib and Sogratl lies wide open!”'
      },
      {
        speaker: 'Хаджи-Мурат',
        speakerEn: 'Hadji Murad',
        role: 'Командир летучей конницы',
        roleEn: 'Flying Cavalry Commander',
        line: '«Не прячьте весь порох под землю! Дайте мне две сотни отборных всадников в бурку и туман — сегодня ночью мы перережем прислугу у мортир Аргутинского прямо на Турчидаге!»',
        lineEn: '“Do not bury all our powder underground! Give me two hundred riders in burkas under the mountain fog—tonight we shall slash the crews at Argutinsky’s mortars atop Turchidag!”'
      }
    ],
    fateConsequenceRu: 'Решает судьбу цитадели Чох и прикрывает подступы к плато Верхний Гуниб.',
    fateConsequenceEn: 'Decides the survival of the Chokh citadel and shields the approaches to Upper Gunib.',
    resolved: false,
    chosenOption: null,
    chosenOptionEn: null,
    options: [
      {
        id: 'chokh_countermine_fortress',
        label: 'Перебросить 35 пудов пороха в подземные галереи Чоха и возвести 4-й ярус бревенчатых блиндажей',
        labelEn: 'Dispatch 35 poods of powder to Chokh’s counter-mine galleries and raise a 4th tier of log blindages',
        effectSummary: 'Порох -35 пуд. | Натиск на Чох и Гуниб -22% | Авторитет +12% | Иман Чоха +14',
        effectSummaryEn: 'Gunpowder -35 poods | Chokh & Gunib Pressure -22% | Authority +12% | Chokh Iman +14',
        powderDelta: -35,
        silverDelta: -40,
        provisionsDelta: 60,
        authorityDelta: 12,
        targetNaibId: 'chokh',
        imanDelta: 14,
        prideDelta: -10,
        murtazeksBonus: 30,
        pressureDelta: -22
      },
      {
        id: 'chokh_turchidag_cavalry_raid',
        label: 'Бросить конные сотни Хаджи-Мурата и Кибит-Магомы в ночной рейд на артиллерийские парки Турчидага',
        labelEn: 'Launch Hadji Murad and Kibit-Magoma’s cavalry squadrons into a night raid on the Turchidag artillery parks',
        effectSummary: 'Трофейный порох +40 пуд. | Казна +160 руб. | Натиск -14% | Муртазеки +35',
        effectSummaryEn: 'Captured Powder +40 poods | Treasury +160 rub. | Pressure -14% | Murtazeks +35',
        powderDelta: 40,
        silverDelta: 160,
        provisionsDelta: 80,
        authorityDelta: 9,
        targetNaibId: 'gunib',
        imanDelta: 10,
        prideDelta: -6,
        murtazeksBonus: 35,
        pressureDelta: -14
      }
    ]
  },
  {
    id: 'crisis_shali_forest_clearing_1850',
    unlockTurn: 5,
    actNumber: 4,
    actBadgeRu: 'АКТ IV • ХОД 5: «ВОЙНА ТОПОРОМ» В ЧЕЧНЕ',
    actBadgeEn: 'ACT IV • TURN 5: “WAR BY THE AXE” IN CHECHNYA',
    year: 'Зима 1850 г. (1266 г. х.)',
    yearEn: 'Winter 1850 (1266 AH)',
    title: '«Война топором»: Вырубка Шалинской просеки генералом Н. И. Евдокимовым',
    titleEn: '“War by the Axe”: Gen. N. I. Evdokimov’s Clearing of the Shali Forest Defile',
    sceneArt: 'Crisis_Shali_Forest_Clearing_1850.jpg',
    sceneCaption: '«Война топором» на Шалинской просеке: заснеженные бревенчатые завалы и батареи наиба Талгика (зима 1850 г.)',
    sceneCaptionEn: '“War by the Axe” on the Shali clearing: snowbound log abatis and Naib Talkhig’s batteries (Winter 1850)',
    actors: ['Талгик Шалинский', 'Байсунгур Беноевский', 'Ген. Евдокимов'],
    historicalContext:
      'Войска Левого фланга под прикрытием картечи рубят просеку шириной в две ружейные дистанции через вековой буковый лес от крепости Воздвиженской к Шали и Ведено, угрожая отрезать Имамат от чеченских житниц.',
    historicalContextEn:
      'Left Flank troops under canister cover are felling a clearing two musket-shots wide through the ancient beech forest from Fort Vozdvizhenskaya toward Shali and Vedeno, threatening to sever the Imamate from its Chechen granaries.',
    dramaticDialogues: [
      {
        speaker: 'Талгик Шалинский',
        speakerEn: 'Talkhig of Shali',
        role: 'Наиб Большой Чечни и начальник артиллерии',
        roleEn: 'Naib of Greater Chechnya & Artillery Chief',
        line: '«Евдокимов больше не лезет в узкие лесные тропы, как Воронцов! Он рубит лес на версту вширь под прикрытием двадцати пушек. Без глубоких окопов и редутов мы потеряем поля Шали!»',
        lineEn: '“Evdokimov no longer marches into narrow forest trails like Vorontsov! He fells the trees a verst wide under twenty cannons. Without deep trenches and redoubts we will lose the fields of Shali!”'
      },
      {
        speaker: 'Байсунгур Беноевский',
        speakerEn: 'Baysungur of Benoy',
        role: 'Наиб Беноя',
        roleEn: 'Naib of Benoy',
        line: '«Пока солдат рубит дерево топором — его ружьё стоит в козлах! Ударим в метель с обоих флангов и сожжём их костры!»',
        lineEn: '“While a soldier swings an axe at a tree, his musket stands stacked! Let us strike through the blizzard from both flanks and burn their campfires!”'
      }
    ],
    fateConsequenceRu: 'Определяет сохранность хлебной житницы Большой Чечни и оборону подступов к Ведено.',
    fateConsequenceEn: 'Determines the survival of Greater Chechnya’s granaries and the outer defenses of Vedeno.',
    resolved: false,
    chosenOption: null,
    chosenOptionEn: null,
    options: [
      {
        id: 'shali_trench_defense',
        label: 'Вырыть систему крытых бревенчатых завалов с подземными ходами вдоль реки Аргун по проекту Талгика',
        labelEn: 'Construct Naib Talkhig’s network of covered timber abatis and subterranean trenches along the Argun River',
        effectSummary: 'Порох -25 пуд. | Провиант +220 мер | Натиск на Ведено и Беной -16% | Авторитет +10%',
        effectSummaryEn: 'Gunpowder -25 poods | Provisions +220 meas. | Vedeno & Benoy Pressure -16% | Authority +10%',
        powderDelta: -25,
        silverDelta: -50,
        provisionsDelta: 220,
        authorityDelta: 10,
        targetNaibId: 'vedeno',
        imanDelta: 12,
        prideDelta: -8,
        murtazeksBonus: 25,
        pressureDelta: -16
      },
      {
        id: 'shali_artillery_ambush',
        label: 'Выдвинуть конную артиллерию Ведено на фланги рубщиков леса и сжечь заготовленные поленницы',
        labelEn: 'Deploy Vedeno’s horse artillery against the woodcutters’ flanks and burn the stacked timber cordons',
        effectSummary: 'Порох +20 пуд. | Серебро +110 руб. | Натиск -12% | +40 муртазеков в Ичкерии',
        effectSummaryEn: 'Gunpowder +20 poods | Silver +110 rub. | Pressure -12% | +40 Murtazeks in Ichkeria',
        powderDelta: 20,
        silverDelta: 110,
        provisionsDelta: 120,
        authorityDelta: 8,
        targetNaibId: 'benoy',
        imanDelta: 10,
        prideDelta: -5,
        murtazeksBonus: 40,
        pressureDelta: -12
      }
    ]
  },
  {
    id: 'crisis_hadji_murat_1851',
    unlockTurn: 6,
    actNumber: 4,
    actBadgeRu: 'АКТ IV • ХОД 6: СУД НАД «КРЫЛАТЫМ БАРСОМ АВАРИИ»',
    actBadgeEn: 'ACT IV • TURN 6: TRIAL OF THE “WINGED LEOPARD OF AVARIA”',
    year: 'Ноябрь 1851 г. (1268 г. х.)',
    yearEn: 'November 1851 (1268 AH)',
    title: 'Дело Хаджи-Мурата: Конфликт с Даниял-беком после Кайтагского рейда',
    titleEn: 'The Hadji Murad Affair: Clash with Sultan Daniyal-Bek After the Kaitag Raid',
    sceneArt: 'Crisis_Hadji_Murat_Council_1851.jpg',
    sceneCaption: 'Съезд наибов в Андии: противостояние Хаджи-Мурата Хунзахского и Даниял-бека перед Имамом (ноябрь 1851 г.)',
    sceneCaptionEn: 'Council of Naibs in Andia: confrontation between Hadji Murad of Khunzakh and Daniyal-Bek before the Imam (November 1851)',
    actors: ['Хаджи-Мурат', 'Даниял-бек', 'Имам Шамиль'],
    historicalContext:
      'Мудир Даниял-бек Илисуйский и недруги обвинили Хаджи-Мурата в измене после неудачного набега на Буйнак и Табасаран. На совете в Андии решается судьба легендарного наиба Аварии: лишить ли его наибского знамени или примирить соратников?',
    historicalContextEn:
      'Mudir Daniyal-Bek of Elisu and rivals accused Hadji Murad of treason following an unsuccessful raid on Buynak and Tabasaran. At the Council in Andia, the fate of Avaria’s legendary Naib hangs in the balance: strip his banner or reconcile the commanders?',
    dramaticDialogues: [
      {
        speaker: 'Даниял-бек',
        speakerEn: 'Daniyal-Bek',
        role: 'Султан Илисуйский, мудир Южного Дагестана',
        roleEn: 'Sultan of Elisu, Mudir of Southern Dagestan',
        line: '«Хаджи-Мурат мнит себя вторым государем в Хунзахе! В Табасаране он отступил без приказа, а в Аварии народ слушает его слово прежде слова Диван-ханы!»',
        lineEn: '“Hadji Murad fancies himself a second sovereign in Khunzakh! In Tabasaran he withdrew without orders, and in Avaria men heed his word before the Divan-Khana!”'
      },
      {
        speaker: 'Хаджи-Мурат',
        speakerEn: 'Hadji Murad',
        role: 'Наиб Хунзаха и Аварии',
        roleEn: 'Naib of Khunzakh & Avaria',
        line: '«Когда Даниял-бек ещё носил царские эполеты в Тифлисе, моя шашка уже рубила врагов Имамата в Хунзахе! Отними у меня знамя сегодня, Шамиль — и завтра русские генералы будут пить за твоё ослепление!»',
        lineEn: '“When Daniyal-Bek still wore Tsarist epaulettes in Tiflis, my shashka was already striking the Imamate’s foes in Khunzakh! Strip my banner today, Shamil, and tomorrow Russian generals will toast your blindness!”'
      }
    ],
    fateConsequenceRu: 'КЛЮЧЕВАЯ РАЗВИЛКА СУДЬБЫ: определяет, останется ли Хаджи-Мурат верным полководцем Имамата до Гуниба или уйдёт в трагический побег.',
    fateConsequenceEn: 'KEY FATE CROSSROADS: determines whether Hadji Murad remains a loyal commander until Gunib or flees into tragic exile.',
    resolved: false,
    chosenOption: null,
    chosenOptionEn: null,
    options: [
      {
        id: 'hm_reconcile_honor',
        label: 'Отвергнуть наветы, сохранить за Хаджи-Муратом Хунзах и вручить почётную шашку',
        labelEn: 'Reject the slanders, confirm Hadji Murad over Khunzakh, and present a Shashka of Honor',
        effectSummary: 'Хаджи-Мурат остаётся верен Имамату (Иман +22, Гордыня -25) | +150 муртазеков в Хунзахе',
        effectSummaryEn: 'Hadji Murad remains loyal to the Imamate (Iman +22, Pride -25) | +150 Murtazeks in Khunzakh',
        powderDelta: 15,
        silverDelta: -80,
        provisionsDelta: 0,
        authorityDelta: 9,
        targetNaibId: 'khunzakh',
        imanDelta: 22,
        prideDelta: -25,
        murtazeksBonus: 30,
        pressureDelta: -10
      },
      {
        id: 'hm_dismiss_strict',
        label: 'Сместить Хаджи-Мурата с наибства ради строгого равенства перед Низамом',
        labelEn: 'Dismiss Hadji Murad from his Naibate to enforce strict equality before the Nizam Code',
        effectSummary: 'Казна +220 руб. серебром | Опасность ухода Хаджи-Мурата и рост натиска в Аварии',
        effectSummaryEn: 'Treasury +220 silver rub. | Risk of Hadji Murad’s defection & +12% pressure in Avaria',
        powderDelta: 0,
        silverDelta: 220,
        provisionsDelta: 50,
        authorityDelta: 5,
        targetNaibId: 'irib',
        imanDelta: 12,
        prideDelta: -10,
        murtazeksBonus: 0,
        pressureDelta: 12
      }
    ]
  },
  {
    id: 'crisis_michik_exchange_1855',
    unlockTurn: 7,
    actNumber: 4,
    actBadgeRu: 'АКТ IV • ХОД 7: КУЛЬМИНАЦИЯ СЕРДЦА — ОБМЕН НА РЕКЕ МИЧИК',
    actBadgeEn: 'ACT IV • TURN 7: CLIMAX OF THE HEART — THE MICHIK RIVER EXCHANGE',
    year: '10 марта 1855 г. (1271 г. х.)',
    yearEn: 'March 10, 1855 (1271 AH)',
    title: 'Размен на реке Мичик: Возвращение сына Имама поручика Джемалуддина',
    titleEn: 'Exchange on the Michik River: Return of the Imam’s Son Lt. Jamaluddin',
    sceneArt: 'KeyArt_Michik_1855_Jamaluddin_Exchange.jpg',
    sceneCaption: 'Исторический размен на реке Мичик: возвращение поручика Джемалуддина отцу (10 марта 1855 г.)',
    sceneCaptionEn: 'Historic exchange on the Michik River: Lt. Jamaluddin returned to his father (March 10, 1855)',
    actors: ['Имам Шамиль', 'Гази-Мухаммад', 'Кн. Воронцов'],
    historicalContext:
      'После дерзкого рейда конницы Гази-Мухаммада на усадьбу Цинандали в Ведено доставлены княгини Анна Чавчавадзе и Варвара Орбелиани. На берегу реки Мичик близ Куринского укрепления решается исторический обмен пленниц на старшего сына Шамиля — Джемалуддина, взятого в аманаты на Ахульго 16 лет назад.',
    historicalContextEn:
      'Following Ghazi-Muhammad’s daring cavalry raid on the Tsinandali estate, Princesses Anna Chavchavadze and Varvara Orbeliani were brought to Vedeno. On the Michik River bank near Fort Kurinskoye, a historic exchange is negotiated for Shamil’s eldest son Jamaluddin, given as a hostage at Akhulgo 16 years prior.',
    dramaticDialogues: [
      {
        speaker: 'Гази-Мухаммад',
        speakerEn: 'Ghazi-Muhammad',
        role: 'Второй сын Шамиля, наиб Карата',
        roleEn: 'Second Son of Shamil, Naib of Karata',
        line: '«Отец, вот он переходит реку Мичик в русском уланском мундире! Мы сняли с него эполеты и надели черкеску, но в глазах брата Джемалуддина — печаль человека, разрываемого между двумя мирами…»',
        lineEn: '“Father, look—he crosses the Michik in a Russian Uhlan uniform! We replaced his epaulettes with a cherkesska, yet in brother Jamaluddin’s eyes burns the sorrow of a man torn between two worlds…”'
      },
      {
        speaker: 'Имам Шамиль',
        speakerEn: 'Imam Shamil',
        role: 'Отец и правитель Имамата',
        roleEn: 'Father & Sovereign of the Imamate',
        line: '«Я отдал его ребёнком под ядрами Ахульго, чтобы спасти тех, кто стоял со мной на скале. Сегодня Всевышний вернул мне сына — или испытания для моего сердца только начинаются?»',
        lineEn: '“I gave him up as a child beneath the shells of Akhulgo to save those who stood with me on the cliff. Today the Almighty returns my son—or does the trial of my heart only now begin?”'
      }
    ],
    fateConsequenceRu: 'КЛЮЧЕВАЯ РАЗВИЛКА СУДЬБЫ: определяет судьбу старшего сына Имама — Джемалуддина — и резервы казны перед финалом 1859 года.',
    fateConsequenceEn: 'KEY FATE CROSSROADS: decides the fate of the Imam’s eldest son Jamaluddin and the state’s reserves before the 1859 finale.',
    resolved: false,
    chosenOption: null,
    chosenOptionEn: null,
    options: [
      {
        id: 'michik_historic_exchange',
        label: 'Совершить размен на реке Мичик: обнять сына Джемалуддина и принять 40 000 руб. серебром',
        labelEn: 'Complete the Michik River exchange: embrace son Jamaluddin and accept 40,000 silver rubles',
        effectSummary: 'Казна Байт аль-маль +400 руб. | Авторитет +15% | Иман Гази-Мухаммада +12',
        effectSummaryEn: 'Bayt al-Mal Treasury +400 rub. | Authority +15% | Ghazi-Muhammad Iman +12',
        powderDelta: 35,
        silverDelta: 400,
        provisionsDelta: 180,
        authorityDelta: 15,
        targetNaibId: 'karata',
        imanDelta: 12,
        prideDelta: -15,
        murtazeksBonus: 20,
        pressureDelta: -10
      },
      {
        id: 'michik_military_ransom',
        label: 'Потребовать взамен освобождения 150 пленных мюридов и пропуска караванов со свинцом',
        labelEn: 'Demand the release of 150 captive murids and safe passage for lead & saltpeter caravans',
        effectSummary: 'Порох +85 пуд. | Гарнизоны всех наибств усилены ветеранами Ахульго и Дарго',
        effectSummaryEn: 'Gunpowder +85 poods | All Naibate garrisons reinforced by veterans of Akhulgo & Dargo',
        powderDelta: 85,
        silverDelta: 180,
        provisionsDelta: 100,
        authorityDelta: 11,
        targetNaibId: 'benoy',
        imanDelta: 14,
        prideDelta: -10,
        murtazeksBonus: 45,
        pressureDelta: -14
      }
    ]
  },
  {
    id: 'crisis_zakatala_1853',
    unlockTurn: 8,
    actNumber: 4,
    actBadgeRu: 'АКТ IV • ХОД 8: ЗАКАТАЛЬСКИЙ ПОХОД И ВОСТОЧНАЯ ВОЙНА',
    actBadgeEn: 'ACT IV • TURN 8: THE ZAKATALA CAMPAIGN & CRIMEAN WAR',
    year: 'Сентябрь 1853 г. (1269 г. х.)',
    yearEn: 'September 1853 (1269 AH)',
    title: 'Поход к Лезгинской линии: Осада Месельдегера с 10-тысячной армией и горными пушками',
    titleEn: 'March on the Lezgian Line: Siege of Meseldeger with 10,000 Troops & Mountain Guns',
    sceneArt: 'KeyArt_Vedeno_Foundry_and_PowderMill_1846.jpg',
    sceneCaption: 'Выдвижение артиллерии и конных сотен Имамата через Главный хребет к Закаталам (осень 1853 г.)',
    sceneCaptionEn: 'Imamate artillery and mounted squadrons crossing the Main Ridge toward Zakatala (autumn 1853)',
    actors: ['Имам Шамиль', 'Даниял-бек', 'Кн. Аргутинский'],
    historicalContext:
      'В канун разрыва России с Османской империей 10-тысячная армия Шамиля спустилась к Джаро-Белоканскому округу и осадила бастион Месельдегер, чтобы перерезать путь на Тифлис. Но князь Аргутинский-Долгоруков совершил стремительный зимний переход через снежный хребет в ваш тыл.',
    historicalContextEn:
      'On the eve of the Crimean War, Shamil’s 10,000-man army descended on the Lezgian Line to besiege Fort Meseldeger, while Prince Argutinsky-Dolgorukov executed a daring march across the snow-covered ridge toward your flank.',
    dramaticDialogues: [
      {
        speaker: 'Даниял-бек',
        speakerEn: 'Daniyal-Bek',
        role: 'Султан Илисуйский, мудир Южного фронта',
        roleEn: 'Sultan of Elisu, Mudir of the Southern Front',
        line: '«Джарские общества готовы восстать! Ещё два дня канонады по Месельдегеру — и дорога на Алазань и Тифлис открыта!»',
        lineEn: '“The Jar communities stand ready to rise! Two more days shelling Meseldeger and the road to the Alazani and Tiflis lies open!”'
      },
      {
        speaker: 'Гази-Мухаммад',
        speakerEn: 'Ghazi-Muhammad',
        role: 'Командир арьергарда перевалов',
        roleEn: 'Commander of the Mountain Pass Rearguard',
        line: '«Лазутчики доносят: Аргутинский уже поднимается на снежный перевал! Если мы увязнем у каменных стен редута, мы потеряем всю осадную артиллерию!»',
        lineEn: '“Scouts report Argutinsky climbing the snow pass behind us! If we bog down before the redoubt walls, we risk losing our entire artillery train!”'
      }
    ],
    fateConsequenceRu: 'Определяет сохранность пушечного парка Имамата и устойчивость Южного Дагестана.',
    fateConsequenceEn: 'Determines the preservation of the Imamate’s cannon park and stability in Southern Dagestan.',
    resolved: false,
    chosenOption: null,
    chosenOptionEn: null,
    options: [
      {
        id: 'zakatala_save_artillery_maneuver',
        label: 'Снять осаду Месельдегера вовремя, вывести все орудия через перевал и ударить конницей по обозам в Кахетии',
        labelEn: 'Lift the siege in good order, save every cannon across the pass, and raid supply depots in Kakheti',
        effectSummary: 'Порох +35 пуд. | Серебро +150 руб. | Натиск Аргутинского -14% | Авторитет +8%',
        effectSummaryEn: 'Powder +35 poods | Silver +150 rub. | Argutinsky’s Pressure -14% | Authority +8%',
        powderDelta: 35,
        silverDelta: 150,
        provisionsDelta: 130,
        authorityDelta: 8,
        targetNaibId: 'irib',
        imanDelta: 9,
        prideDelta: -6,
        murtazeksBonus: 30,
        pressureDelta: -14
      },
      {
        id: 'zakatala_all_out_storm',
        label: 'Бросить мюридов на решительный ночной штурм Месельдегера до подхода колонны Аргутинского',
        labelEn: 'Launch a decisive night assault on Fort Meseldeger before Argutinsky’s column arrives',
        effectSummary: 'Порох -25 пуд. | Серебро +240 руб. | Муртазеки +45 | Рост натиска +8%',
        effectSummaryEn: 'Powder -25 poods | Silver +240 rub. | Murtazeks +45 | Pressure +8%',
        powderDelta: -25,
        silverDelta: 240,
        provisionsDelta: 90,
        authorityDelta: 10,
        targetNaibId: 'irib',
        imanDelta: 11,
        prideDelta: -4,
        murtazeksBonus: 45,
        pressureDelta: 8
      }
    ]
  },
  {
    id: 'crisis_sultan_firman_1854',
    unlockTurn: 9,
    actNumber: 4,
    actBadgeRu: 'АКТ IV • ХОД 9: ДИПЛОМАТИЯ ЧЁРНОГО МОРЯ И ПОРТЫ',
    actBadgeEn: 'ACT IV • TURN 9: BLACK SEA & OTTOMAN DIPLOMACY',
    year: 'Лето 1854 г. (1270 г. х.)',
    yearEn: 'Summer 1854 (1270 AH)',
    title: 'Фирман султана Абдул-Меджида: Обещания союзных эскадр и спор с Омер-пашой',
    titleEn: 'Sultan Abdulmejid’s Firman: Allied Fleet Promises & Strategic Dispute with Omer Pasha',
    sceneArt: 'Diplomacy_Trabzon_Felucca_Smuggling_1846.jpg',
    sceneCaption: 'Разгрузка контрабандной турецкой фелюги со свинцом и депешами для Диван-ханы (1854 г.)',
    sceneCaptionEn: 'Unloading a contraband Turkish felucca carrying lead and dispatches for the Divan-Khana (1854)',
    actors: ['Имам Шамиль', 'Мухаммад-Амин', 'Омер-паша'],
    historicalContext:
      'Гонец из Анатолии доставил в Ведено фирман султана с титулом Генералиссимуса черкесской и грузинской армий, требуя немедленно вести горцев на соединение к Тифлису — без присылки обещанных нарезных штуцеров и осадных пушек.',
    historicalContextEn:
      'A courier from Anatolia delivers a Sultanic firman naming Shamil Generalissimo and urging an immediate march on Tiflis—yet without sending the promised rifled carbines or siege artillery.',
    dramaticDialogues: [
      {
        speaker: 'Мухаммад-Амин',
        speakerEn: 'Muhammad-Amin',
        role: 'Послание наиба Черкесии из Сухум-Кале',
        roleEn: 'Dispatch of the Naib of Circassia from Sukhum-Kale',
        line: '«Паши раздают пышные грамоты и ордена, Имам, но англичане и французы ушли под Севастополь, оставив Кавказ воевать собственным порохом!»',
        lineEn: '“The pashas hand out ornate scrolls and medals, Imam, yet the British and French sailed for Sevastopol, leaving the Caucasus to fight with its own powder!”'
      },
      {
        speaker: 'Кибит-Магома',
        speakerEn: 'Kibit-Magoma',
        role: 'Мудир Телетля, хранитель селитренных варниц',
        roleEn: 'Mudir of Teletl, Master of Saltpeter Works',
        line: '«Надежда на заморских союзников — мираж. Вложим золото в наши пороховые мельницы в Ведено, Гунибе и Телетле!»',
        lineEn: '“Reliance on distant fleets is a mirage. Let us invest silver into our own powder mills at Vedeno, Gunib, and Teletl!”'
      }
    ],
    fateConsequenceRu: 'Определяет независимость военной промышленности Имамата перед решающим этапом войны.',
    fateConsequenceEn: 'Shapes the self-reliance of the Imamate’s military workshops ahead of the final phase of the war.',
    resolved: false,
    chosenOption: null,
    chosenOptionEn: null,
    options: [
      {
        id: 'firman_self_reliant_arsenals',
        label: 'Вежливо принять грамоту, но не уводить армию на равнину — удвоить выработку собственных пороховых мельниц!',
        labelEn: 'Accept the firman courteously while keeping the army in the mountains and doubling domestic powder mills!',
        effectSummary: 'Порох +70 пуд. | Провиант +140 мер | Натиск в Телетле и Ведено -15%',
        effectSummaryEn: 'Gunpowder +70 poods | Provisions +140 meas. | Teletl & Vedeno Pressure -15%',
        powderDelta: 70,
        silverDelta: -40,
        provisionsDelta: 140,
        authorityDelta: 10,
        targetNaibId: 'teletl',
        imanDelta: 11,
        prideDelta: -8,
        murtazeksBonus: 25,
        pressureDelta: -15
      },
      {
        id: 'firman_southern_cavalry_demonstration',
        label: 'Провести конную демонстрацию в Алазанской долине в обмен на караван свинца и субсидию Порты',
        labelEn: 'Stage a mounted demonstration in the Alazani valley in exchange for Ottoman silver and lead',
        effectSummary: 'Казна +260 руб. | Порох +30 пуд. | +35 муртазеков',
        effectSummaryEn: 'Treasury +260 rub. | Gunpowder +30 poods | +35 Murtazeks',
        powderDelta: 30,
        silverDelta: 260,
        provisionsDelta: 80,
        authorityDelta: 7,
        targetNaibId: 'irib',
        imanDelta: 6,
        prideDelta: -3,
        murtazeksBonus: 35,
        pressureDelta: -6
      }
    ]
  },
  {
    id: 'crisis_jamaluddin_karata_1856',
    unlockTurn: 11,
    actNumber: 5,
    actBadgeRu: 'АКТ V • ХОД 11: ЛИЧНАЯ ТРАГЕДИЯ В КАРАТА',
    actBadgeEn: 'ACT V • TURN 11: PERSONAL TRAGEDY IN HIGHLAND KARATA',
    year: 'Осень 1856 — Весна 1858 г. (1273 г. х.)',
    yearEn: 'Autumn 1856 — Spring 1858 (1273 AH)',
    title: 'Угасание Джемалуддина в Карата: Сын между двумя мирами и русский военный врач',
    titleEn: 'Fading of Jamaluddin in Karata: A Son Between Two Worlds & the Russian Physician',
    sceneArt: 'KeyArt_Michik_1855_Jamaluddin_Exchange.jpg',
    sceneCaption: 'Высокогорный аул Карата: прощальные беседы Имама Шамиля со старшим сыном Джемалуддином',
    sceneCaptionEn: 'Highland Karata: Imam Shamil’s farewell conversations with his eldest son Jamaluddin',
    actors: ['Имам Шамиль', 'Гази-Мухаммад', 'Пирогов'],
    historicalContext:
      'Вернувшийся из Петербурга Джемалуддин всей душой любил отца, но тяжело тосковал по невесте Елизавете Олениной и мечтал о примирении России и Кавказа. В суровом климате высокогорной Карата у него открылась скоротечная чахотка.',
    historicalContextEn:
      'Returned from St. Petersburg, Jamaluddin deeply loved his father yet pined for his betrothed Elizaveta Olenina and dreamed of peace between Russia and the Caucasus. In highland Karata tuberculosis overtook him.',
    dramaticDialogues: [
      {
        speaker: 'Гази-Мухаммад',
        speakerEn: 'Ghazi-Muhammad',
        role: 'Брат Джемалуддина, наиб Карата',
        roleEn: 'Jamaluddin’s Brother, Naib of Karata',
        line: '«Отец, горские лекари бессильны перед грудной болезнью брата. Генерал барон Николаи готов под твоё честное слово прислать из Хасав-Юрта лучшего полкового доктора Пиотровского с лекарствами!»',
        lineEn: '“Father, highland healers cannot halt our brother’s consumption. Baron Nicolai offers under your word of honor to send Staff Physician Piotrovsky with medicines from Khasav-Yurt!”'
      },
      {
        speaker: 'Имам Шамиль',
        speakerEn: 'Imam Shamil',
        role: 'Отец у постели старшего сына',
        roleEn: 'Father Beside His Firstborn’s Bed',
        line: '«Пусть русский доктор едет с почётным конвоем мюридов — ни один волос не упадёт с его головы. И запишите для Диван-ханы все чертежи редутов, которые оставил мой мудрый мальчик…»',
        lineEn: '“Let the Russian doctor ride under an honor guard of murids—not a hair on his head shall be touched. And preserve for the Divan-Khana every engineering note my wise son has drawn…”'
      }
    ],
    fateConsequenceRu: 'Глубокая человеческая страница хроники: укрепляет духовное единство гор и инженерную оборону.',
    fateConsequenceEn: 'A poignant human chapter of the chronicle: deepens moral unity and strengthens highland fortifications.',
    resolved: false,
    chosenOption: null,
    chosenOptionEn: null,
    options: [
      {
        id: 'jamaluddin_doctor_honor_guard',
        label: 'Принять русского военного врача в Карата с рыцарским почётом и облегчить страдания сына',
        labelEn: 'Receive the Russian military physician in Karata under an honor guard to comfort Jamaluddin',
        effectSummary: 'Авторитет Имама +14% | Иман Карата и Андии +15 | Снижение стресса «Зульмат»',
        effectSummaryEn: 'Imam’s Moral Authority +14% | Karata & Andi Iman +15 | Reduced Leader Strain',
        powderDelta: 15,
        silverDelta: -35,
        provisionsDelta: 110,
        authorityDelta: 14,
        targetNaibId: 'karata',
        imanDelta: 15,
        prideDelta: -12,
        murtazeksBonus: 20,
        pressureDelta: -12
      },
      {
        id: 'jamaluddin_fortification_legacy',
        label: 'Воплотить заветы Джемалуддина о глубоких горных арсеналах и бережном сбережении людей',
        labelEn: 'Fulfill Jamaluddin’s counsel on deep mountain arsenals and sparing mountaineer lives',
        effectSummary: 'Порох +55 пуд. | Провиант +190 мер | Натиск на Гуниб и Карата -16%',
        effectSummaryEn: 'Gunpowder +55 poods | Provisions +190 meas. | Gunib & Karata Pressure -16%',
        powderDelta: 55,
        silverDelta: 60,
        provisionsDelta: 190,
        authorityDelta: 10,
        targetNaibId: 'gunib',
        imanDelta: 10,
        prideDelta: -8,
        murtazeksBonus: 30,
        pressureDelta: -16
      }
    ]
  },
  {
    id: 'crisis_paris_baryatinsky_1856',
    unlockTurn: 12,
    actNumber: 5,
    actBadgeRu: 'АКТ V • ХОД 12: ПАРИЖСКИЙ МИР И 200 000 ШТЫКОВ БАРЯТИНСКОГО',
    actBadgeEn: 'ACT V • TURN 12: TREATY OF PARIS & BARYATINSKY’S 200,000-MAN ARMY',
    year: 'Осень 1856 — 1857 г. (1273 г. х.)',
    yearEn: 'Autumn 1856 — 1857 (1273 AH)',
    title: 'Назначение князя А. И. Барятинского и перевооружение Кавказской армии нарезными штуцерами',
    titleEn: 'Appointment of Prince A. I. Baryatinsky & Rifled Rearmament of the Caucasus Army',
    sceneArt: 'Crisis_Shali_Forest_Clearing_1850.jpg',
    sceneCaption: 'Концентрическое наступление пяти корпусов Кавказской армии под началом А. И. Барятинского и Д. А. Милютина',
    sceneCaptionEn: 'Concentric advance of five Caucasus Army corps under Prince Baryatinsky and D. A. Milyutin',
    actors: ['Кн. Барятинский', 'Хаджи-Юсуф Сафаров', 'Талхиг Шалинский'],
    historicalContext:
      'Окончание Крымской войны позволило Александру II бросить на Восточный Кавказ небывалую силу — до 200 тысяч солдат с дальнобойными нарезными винтовками Минье, бьющими на 1 200 шагов. Начальник штаба Д. А. Милютин разработал план методического сжатия Имамата с трёх сторон.',
    historicalContextEn:
      'With the Crimean War ended, Emperor Alexander II concentrates nearly 200,000 soldiers armed with long-range Minié rifles under Viceroy Baryatinsky and Chief of Staff D. A. Milyutin.',
    dramaticDialogues: [
      {
        speaker: 'Хаджи-Юсуф Сафаров',
        speakerEn: 'Hajji Yusuf Safarov',
        role: 'Главный военный инженер Имамата',
        roleEn: 'Chief Military Engineer of the Imamate',
        line: '«Открытые каменные башни больше не держат удар нарезных батарей! Нужно зарываться в землю — строить зигзагообразные траншеи, земляные траверсы и скальные казематы на перевалах!»',
        lineEn: '“Exposed stone towers can no longer withstand rifled batteries! We must dig deep—zigzag trenches, earthen traverses, and rock casemates across every pass!”'
      },
      {
        speaker: 'Талхиг Шалинский',
        speakerEn: 'Talkhig of Shali',
        role: 'Командующий артиллерией Чечни',
        roleEn: 'Commander of Chechnya’s Artillery',
        line: '«Дайте моим стрелкам трофейные штуцера и лучший порох Телетля — в горных теснинах Аргуна их колонны всё равно пойдут по одному!»',
        lineEn: '“Equip my marksmen with captured rifled carbines and Teletl’s finest powder—in the Argun defiles their columns must still march single-file!”'
      }
    ],
    fateConsequenceRu: 'Перестраивает оборону Имамата под эпоху нарезного оружия (1857–1859 гг.).',
    fateConsequenceEn: 'Adapts the Imamate’s defense doctrine to the era of rifled weaponry (1857–1859).',
    resolved: false,
    chosenOption: null,
    chosenOptionEn: null,
    options: [
      {
        id: 'baryatinsky_earthwork_reform',
        label: 'Принять инженерную реформу Сафарова: заменить высокие башни приземистыми земляными бастионами и казематами',
        labelEn: 'Adopt Safarov’s engineering reform: replace tall stone towers with low earthen bastions and rock casemates',
        effectSummary: 'Серебро -90 руб. | Натиск по всей Чечне и Дагестану -18% | Авторитет +10%',
        effectSummaryEn: 'Silver -90 rub. | Pressure in Chechnya & Dagestan -18% | Authority +10%',
        powderDelta: 25,
        silverDelta: -90,
        provisionsDelta: 120,
        authorityDelta: 10,
        targetNaibId: 'shali',
        imanDelta: 12,
        prideDelta: -8,
        murtazeksBonus: 35,
        pressureDelta: -18
      },
      {
        id: 'baryatinsky_sharpshooter_corps',
        label: 'Свести все нарезные штуцера в отборные летучие сотни снайперов на Аргуне и Хулхулау',
        labelEn: 'Concentrate all rifled carbines into elite flying sharpshooter squadrons on the Argun and Khulkhulau',
        effectSummary: 'Порох +45 пуд. | Муртазеки +60 | Натиск на Беной -15%',
        effectSummaryEn: 'Gunpowder +45 poods | Murtazeks +60 | Benoy Pressure -15%',
        powderDelta: 45,
        silverDelta: -40,
        provisionsDelta: 80,
        authorityDelta: 9,
        targetNaibId: 'benoy',
        imanDelta: 10,
        prideDelta: -5,
        murtazeksBonus: 60,
        pressureDelta: -15
      }
    ]
  },
  {
    id: 'crisis_vedeno_siege_1859',
    unlockTurn: 14,
    actNumber: 5,
    actBadgeRu: 'АКТ V • ХОД 14: ОСАДА СТОЛИЦЫ ДАРГО-ВЕДЕНО',
    actBadgeEn: 'ACT V • TURN 14: WINTER SIEGE OF CAPITAL DARGO-VEDENO',
    year: 'Февраль — Март 1859 г. (1275 г. х.)',
    yearEn: 'February — March 1859 (1275 AH)',
    title: 'Огненное кольцо вокруг Ведено: Эвакуация Диван-ханы во Внутренний Дагестан',
    titleEn: 'Ring of Fire Around Vedeno: Evacuating the Divan-Khana to Inner Dagestan',
    sceneArt: 'Archive_Arabic_Chronicle_AlQarakhi_1845.jpg',
    sceneCaption: 'Зимняя оборона редутов Дарго-Ведено гарнизоном Гази-Мухаммада и спасение государственного архива (март 1859 г.)',
    sceneCaptionEn: 'Winter defense of Dargo-Vedeno’s redoubts under Ghazi-Muhammad and evacuation of the state archive (March 1859)',
    actors: ['Гази-Мухаммад', 'Байсунгур Беноевский', 'Кн. Барятинский'],
    historicalContext:
      'Пройдя по прорубленным в снегу просекам, корпус генерала Евдокимова обложил столицу Дарго-Ведено плотным кольцом нарезных батарей. Сын Имама Гази-Мухаммад с 3 500 мюридами два месяца отбивает штурмы, давая время вывезти семьи, казну и летопись аль-Карахи через Андийский хребет.',
    historicalContextEn:
      'Advancing along snow-cleared avenues, General Evdokimov’s corps invests the capital Dargo-Vedeno with rifled batteries while Ghazi-Muhammad and 3,500 murids hold the redoubts for two months to evacuate families and state archives.',
    dramaticDialogues: [
      {
        speaker: 'Гази-Мухаммад',
        speakerEn: 'Ghazi-Muhammad',
        role: 'Комендант осаждённого Ведено',
        roleEn: 'Commandant of Besieged Vedeno',
        line: '«Погреба и бревенчатые стены Ведено разбиты в щепы, отец, но все рукописи Диван-ханы, печать и раненые уже переправлены через Харачой! Прикажи: стоять до последнего человека или прорваться на соединение с тобой?»',
        lineEn: '“Vedeno’s log ramparts are splintered, Father, yet every manuscript of the Divan-Khana, the state seal, and the wounded are safely across Kharachoy Pass! Command us: stand to the last man or cut our way out to join you?”'
      },
      {
        speaker: 'Байсунгур Беноевский',
        speakerEn: 'Baysungur of Benoy',
        role: 'Командир арьергарда Ичкерии',
        roleEn: 'Commander of Ichkeria’s Rearguard',
        quote: '',
        line: '«Стены строят руки людей, но людей не вернёшь! Выводи гарнизон ночью по лесным оврагам — эти три тысячи храбрецов ещё понадобятся нам на скалах Дагестана!»',
        lineEn: '“Walls are built by men’s hands, yet fallen men cannot be rebuilt! Lead the garrison out by night through the forest ravines—those brave souls are needed on Dagestan’s cliffs!”'
      }
    ],
    fateConsequenceRu: 'Сохраняет живую силу гвардии и казну при переносе борьбы в Нагорный Дагестан.',
    fateConsequenceEn: 'Preserves the veteran guard and treasury as the struggle shifts into Highland Dagestan.',
    resolved: false,
    chosenOption: null,
    chosenOptionEn: null,
    options: [
      {
        id: 'vedeno_orderly_night_withdrawal',
        label: 'Вывести гарнизон Гази-Мухаммада ночным манёвром через Харачой на укрепление Килитль и Гуниб',
        labelEn: 'Withdraw Ghazi-Muhammad’s garrison by night across Kharachoy Pass to fortify Inner Dagestan and Gunib',
        effectSummary: 'Спасена гвардия (+50 муртазеков в Гунибе) | Порох +40 пуд. | Авторитет +11%',
        effectSummaryEn: 'Guard Preserved (+50 Murtazeks in Gunib) | Powder +40 poods | Authority +11%',
        powderDelta: 40,
        silverDelta: 120,
        provisionsDelta: 150,
        authorityDelta: 11,
        targetNaibId: 'gunib',
        imanDelta: 12,
        prideDelta: -8,
        murtazeksBonus: 50,
        pressureDelta: -18
      },
      {
        id: 'vedeno_mine_redoubts_ambush',
        label: 'Заминировать передовые редуты Ведено фугасами Сафарова перед отходом гарнизона',
        labelEn: 'Mine Vedeno’s forward redoubts with Safarov’s fougasses before withdrawing the garrison',
        effectSummary: 'Порох -20 пуд. | Натиск Евдокимова на Ведено и Беной -22% | Иман +14',
        effectSummaryEn: 'Powder -20 poods | Evdokimov’s Pressure on Vedeno & Benoy -22% | Iman +14',
        powderDelta: -20,
        silverDelta: 80,
        provisionsDelta: 110,
        authorityDelta: 12,
        targetNaibId: 'vedeno',
        imanDelta: 14,
        prideDelta: -6,
        murtazeksBonus: 35,
        pressureDelta: -22
      }
    ]
  },
  {
    id: 'crisis_gunib_council_1859',
    unlockTurn: 15,
    actNumber: 5,
    actBadgeRu: 'АКТ V • ХОД 15: ЗАОБЛАЧНАЯ ТВЕРДЫНЯ ВЕРХНИЙ ГУНИБ',
    actBadgeEn: 'ACT V • TURN 15: THE CLOUD CITADEL OF UPPER GUNIB',
    year: 'Август 1859 г. (1276 г. х.)',
    yearEn: 'August 1859 (1276 AH)',
    title: 'Совет последних верных на горе Гуниб: Честь меча и спасение будущего народа',
    titleEn: 'Council of the Faithful on Mount Gunib: Honor of the Sword & Survival of the People',
    sceneArt: 'Epilogue_Kaluga_And_Medina_1859_1871.jpg',
    sceneCaption: 'Верхний Гуниб в августе 1859 года: последний совет Имама Шамиля, сыновей и Байсунгура Беноевского',
    sceneCaptionEn: 'Upper Gunib in August 1859: the final council of Imam Shamil, his sons, and Baysungur of Benoy',
    actors: ['Имам Шамиль', 'Байсунгур Беноевский', 'Кн. Барятинский'],
    historicalContext:
      'Август 1859 года. На неприступном плато Верхнего Гуниба собрались последние 400 мюридов, готовых пасть рядом со своим Имамом. Парламентёры фельдмаршала Барятинского гарантируют неприкосновенность религии, шариатского суда, имущества и семей горцев в случае прекращения боя.',
    historicalContextEn:
      'August 1859. Atop the cloud-wreathed plateau of Upper Gunib stand the last 400 devoted murids. Envoys from Field Marshal Baryatinsky guarantee freedom of faith, Sharia courts, and safety for all families if fighting ceases.',
    dramaticDialogues: [
      {
        speaker: 'Байсунгур Беноевский',
        speakerEn: 'Baysungur of Benoy',
        role: 'Непреклонный наиб Беноя',
        roleEn: 'Indomitable Naib of Benoy',
        line: '«Шамиль, двадцать пять лет я шёл за тобой без единого сомнения! Скажи одно слово — и наши шашки прорубят дорогу сквозь Апшеронский полк обратно в леса Чечни!»',
        lineEn: '“Shamil, for twenty-five years I have followed you without a flicker of doubt! Speak one word and our shashkas will carve a road through the Apsheron Regiment back to Chechnya’s woods!”'
      },
      {
        speaker: 'Имам Шамиль',
        speakerEn: 'Imam Shamil',
        role: 'Третий Имам Дагестана и Чечни',
        roleEn: 'Third Imam of Dagestan & Chechnya',
        line: '«Умереть с шашкой в руке легко для воина, Байсунгур. Труднее перешагнуть через собственную гордость, когда за твоей спиной в саклях Гуниба стоят беззащитные матери и дети Кавказа…»',
        lineEn: '“To die shashka in hand is easy for a warrior, Baysungur. Harder by far is stepping over one’s own pride when behind us in Gunib’s stone houses stand the mothers and children of the Caucasus…”'
      }
    ],
    fateConsequenceRu: 'Увенчивает 25-летнюю эпопею Кавказского Имамата перед финальным подведением итогов кампании.',
    fateConsequenceEn: 'Crowns the 25-year epic of the Caucasian Imamate ahead of the campaign’s final reckoning.',
    resolved: false,
    chosenOption: null,
    chosenOptionEn: null,
    options: [
      {
        id: 'gunib_dignified_peace_for_people',
        label: 'Принять почётный мир в берёзовой роще ради сохранения народа, веры и бессмертной памяти Имамата',
        labelEn: 'Accept honorable peace in the birch grove to preserve the people, their faith, and the immortal memory of the Imamate',
        effectSummary: 'Авторитет Имама +16% | Иман Гуниба и Чоха +15 | Натиск -25%',
        effectSummaryEn: 'Imam’s Authority +16% | Gunib & Chokh Iman +15 | Pressure -25%',
        powderDelta: 0,
        silverDelta: 180,
        provisionsDelta: 220,
        authorityDelta: 16,
        targetNaibId: 'gunib',
        imanDelta: 15,
        prideDelta: -15,
        murtazeksBonus: 20,
        pressureDelta: -25
      },
      {
        id: 'gunib_defiant_bastion_defense',
        label: 'Укрепить скальные ворота Верхнего Гуниба и стоять на плато до последнего заряда в пороховницах!',
        labelEn: 'Barricade the rock gates of Upper Gunib and hold the plateau to the last charge of powder!',
        effectSummary: 'Порох +45 пуд. | Муртазеки Гуниба +75 | Иман +18',
        effectSummaryEn: 'Gunpowder +45 poods | Gunib Murtazeks +75 | Iman +18',
        powderDelta: 45,
        silverDelta: 60,
        provisionsDelta: 120,
        authorityDelta: 14,
        targetNaibId: 'gunib',
        imanDelta: 18,
        prideDelta: -10,
        murtazeksBonus: 75,
        pressureDelta: -20
      }
    ]
  }
];

// ============================================================================
// ТОЛКОВЫЙ ИСТОРИКО-МАТЕМАТИЧЕСКИЙ СЛОВАРЬ ИМАМАТА (DT_ImamatGlossary)
// ============================================================================
export const IMAMAT_GLOSSARY_TERMS = [
  {
    id: 'nizam',
    termRu: 'Низам (Кодекс законов Шамиля)',
    termEn: 'Nizam (Shamil’s Code of State Laws)',
    arabicScript: 'نظام شامل',
    category: 'Государство и Шариат',
    categoryEn: 'State & Sharia Law',
    historicalDesc:
      'Свод военно-административных, судебных и налоговых постановлений Имама Шамиля (1840–1859 гг.), заменивший родовой обычай (Адат) единым государственным правом.',
    historicalDescEn:
      'The military-administrative, judicial, and fiscal code of Imam Shamil (1840–1859) that replaced clan customary law (Adat) with unified state sovereignty.',
    gameplayFormula:
      'Срезает штрафы Алчности (GreedPenaltyReduction) и Гордыни (PridePenaltyReduction) до -70%, снижает Стресс лидера и даёт прирост Пороха/Казны за ход.',
    gameplayFormulaEn:
      'Cuts Naib Greed (GreedPenaltyReduction) and Pride (PridePenaltyReduction) penalties up to -70%, lowers Leader Stress, and grants per-turn Gunpowder/Treasury yields.'
  },
  {
    id: 'divan_khana',
    termRu: 'Диван-хана (Государственный совет)',
    termEn: 'Divan-Khana (Supreme State Council)',
    arabicScript: 'ديوان خانة',
    category: 'Государство и Шариат',
    categoryEn: 'State & Sharia Law',
    historicalDesc:
      'Высший совещательный, судебный и распорядительный совет Имамата в Дарго и Ведено, где секретарь Мухаммед-Тахир аль-Карахи скреплял печатью приказы наибам.',
    historicalDescEn:
      'The supreme deliberative, judicial, and executive council of the Imamate in Dargo and Vedeno, where secretary Muhammad-Tahir al-Qarakhi sealed dispatches to Naibs.',
    gameplayFormula:
      'Командный стол ADivanKhanaTablePawn. P(Obey) = Clamp(Base + 0.45*Iman + 0.25*Courage + SupplyBonus - GreedPenalty - PridePenalty - StressPenalty, 5%, 98%).',
    gameplayFormulaEn:
      'Command table ADivanKhanaTablePawn. P(Obey) = Clamp(Base + 0.45*Iman + 0.25*Courage + SupplyBonus - GreedPenalty - PridePenalty - StressPenalty, 5%, 98%).'
  },
  {
    id: 'muhtasib',
    termRu: 'Мухтасиб (Тайный ревизор Имама)',
    termEn: 'Muhtasib (Secret State Inspector)',
    arabicScript: 'محتسب',
    category: 'Разведка и Надзор',
    categoryEn: 'Intelligence & Oversight',
    historicalDesc:
      'Должностное лицо духовной и финансовой инспекции в Имамате, негласно проверяющее честность наибов при сборе зейката и разделе военных трофеев.',
    historicalDescEn:
      'Secret spiritual and fiscal inspector of the Imamate tasked with auditing Naib honesty during Zakat tax collection and division of war spoils.',
    gameplayFormula:
      'Низам о мухтасибах уменьшает GreedPenalty наибов на -30%, позволяя собирать зейкат без дорогих серебряных субсидий.',
    gameplayFormulaEn:
      'The Muhtasib Nizam reduces Naib GreedPenalty by -30%, enabling reliable Zakat collection without expensive silver subsidies.'
  },
  {
    id: 'murtazek',
    termRu: 'Муртазеки (Регулярная конная гвардия)',
    termEn: 'Murtazeks (Standing Cavalry Guard)',
    arabicScript: 'مرتزقة',
    category: 'Военное устройство',
    categoryEn: 'Military Organization',
    historicalDesc:
      'Отборные конные воины постоянной готовности (1 всадник с каждых 10 дворов общины), находившиеся на полном обеспечении джамаата.',
    historicalDescEn:
      'Elite standing cavalrymen (1 mounted warrior levied per 10 households), fully provisioned and maintained by their local Jamaat community.',
    gameplayFormula:
      'Удерживают оборону наибства при высоком натиске, усиливают кинжальный удар во фланг на сплайне и снижают потери гарнизона.',
    gameplayFormulaEn:
      'Hold Naibate defenses under high Imperial pressure, amplify flank dagger charges on forest splines, and reduce garrison casualties.'
  },
  {
    id: 'bayt_al_mal',
    termRu: 'Байт аль-маль (Государственная казна)',
    termEn: 'Bayt al-Mal (State Treasury)',
    arabicScript: 'بيت المال',
    category: 'Экономика и Логистика',
    categoryEn: 'Economy & Logistics',
    historicalDesc:
      'Центральное казначейство Имамата под началом Хаджиява из Орота, распределявшее порох, свинец, серебро и зерно между осаждёнными аулами.',
    historicalDescEn:
      'Central state treasury of the Imamate led by Hajjiyav of Orot, allocating gunpowder, lead, silver, and grain across besieged mountain auls.',
    gameplayFormula:
      'Управляет GunpowderPoods, SilverRubles и ProvisionsMeasures. Снаряжает 3-уровневые пороховые караваны (15 / 30 / 45 пудов).',
    gameplayFormulaEn:
      'Governs GunpowderPoods, SilverRubles, and ProvisionsMeasures. Dispatches 3-tier gunpowder pack-trains (15 / 30 / 45 poods).'
  },
  {
    id: 'zakat_khums',
    termRu: 'Зейкат и Хумс (Налог и Пятина)',
    termEn: 'Zakat & Khums (Tithe & Fifth of Spoils)',
    arabicScript: 'زكاة وخمس',
    category: 'Экономика и Логистика',
    categoryEn: 'Economy & Logistics',
    historicalDesc:
      'Обязательный шариатский сбор с урожая, отар и серебра в пользу казны (зейкат) и пятая доля военной добычи (хумс), принадлежащая государству.',
    historicalDescEn:
      'Mandatory Sharia tithe on harvests, flocks, and silver for the public treasury (Zakat), plus the one-fifth sovereign share of war spoils (Khums).',
    gameplayFormula:
      'Приказ CollectZakat пополняет казну Ведено, но имеет повышенный весовой коэффициент алчности наиба (GreedWeight = 0.55).',
    gameplayFormulaEn:
      'The CollectZakat order replenishes Vedeno’s treasury but carries an elevated Naib greed weight (GreedWeight = 0.55).'
  },
  {
    id: 'gazyrs_18',
    termRu: 'Газыри (18 нагрудных зарядов)',
    termEn: 'Gazyrs (18 Measured Chest Cartridges)',
    arabicScript: 'غازير',
    category: 'Тактика и Баллистика',
    categoryEn: 'Tactics & Ballistics',
    historicalDesc:
      'Деревянные или серебряные пеналы на груди черкески с заранее отмеренной меркой пороха и пулей в промасленном кожаном пластыре для быстрой стрельбы с коня или скалы.',
    historicalDescEn:
      'Wooden or silver-capped tubes sewn onto the Circassian coat chest holding pre-measured powder charges and patched lead balls for rapid reloading.',
    gameplayFormula:
      'UGazyrAmmunitionComponent: строго 18 выстрелов на бой (1 заряд = 1 выстрел). При 0/18 включается режим bForcedIntoDaggerMelee (+35% к натиску шашек).',
    gameplayFormulaEn:
      'UGazyrAmmunitionComponent: strictly 18 shots per battle (1 tube = 1 shot). At 0/18, triggers bForcedIntoDaggerMelee (+35% Shashka & Kindjal melee shock).'
  },
  {
    id: 'camouflet_basin',
    termRu: 'Камуфлет и Медный таз Сафарова',
    termEn: 'Camouflet Mine & Safarov’s Copper Basin',
    arabicScript: 'كموفليت',
    category: 'Инженерия и Осады',
    categoryEn: 'Engineering & Sieges',
    historicalDesc:
      'Метод подземной контрминной борьбы при осадах Салты (1847) и Гергебиля (1848): медный таз с водой и восковыми шариками на дне выдавал направление кирок русских сапёров.',
    historicalDescEn:
      'Subterranean counter-mining technique at Salty (1847) and Gergebil (1848): a water-filled copper basin with wax beads detected the bearing of Russian sapper picks.',
    gameplayFormula:
      'Позволяет взорвать подземный горн (камуфлет) без воронки на поверхности: обрушивает свод сапы (-6 пудов пороха, -14% имперского натиска).',
    gameplayFormulaEn:
      'Detonates a subterranean camouflet charge without breaking the surface, collapsing the enemy sap gallery (-6 poods powder, -14% Imperial pressure).'
  },
  {
    id: 'milyutin_dead_zone',
    termRu: 'Мёртвая зона настильного огня (Разрез Милютина)',
    termEn: 'Direct-Fire Dead Zone (Milyutin Cross-Section)',
    arabicScript: 'منطقة ميتة',
    category: 'Тактика и Баллистика',
    categoryEn: 'Tactics & Ballistics',
    historicalDesc:
      'Геометрический парадокс горных аулов Дагестана, описанный полковником Д. А. Милютиным: при крутизне обрыва 65–75° настильные пушки бьют в скальный цоколь, не доставая сакли на плато.',
    historicalDescEn:
      'Geometric paradox of Dagestani cliff auls documented by Col. D. A. Milyutin: on 65–75° precipices, flat-trajectory cannons strike the rock base without reaching plateau saklyas.',
    gameplayFormula:
      'В 3D-разрезе и шейдере MF_MountainVerticalFog_Imamat.ush настильные ядра (15°) блокируются утёсом, а навесные бомбы (58°) гасятся 3-слойными блиндажами.',
    gameplayFormulaEn:
      'In the 3D cross-section and MF_MountainVerticalFog_Imamat.ush shader, 15° cannonballs hit the cliff face while 58° mortar shells are absorbed by 3-layer log blindages.'
  },
  {
    id: 'zulmat_khalwat',
    termRu: 'Зульмат и Халват (Смута и Уединение)',
    termEn: 'Zulmat & Khalwat (Turmoil & Spiritual Retreat)',
    arabicScript: 'ظلمات وخلوة',
    category: 'Психология Лидера',
    categoryEn: 'Leader Psychology',
    historicalDesc:
      'Кризис управления и тяжелейшее напряжение воли Имама при тяжёлых потерях и изменах («Зульмат»), преодолевавшиеся уединением («Халват») и советом с учёными-алимами.',
    historicalDescEn:
      'Crisis of command and severe strain of will during heavy casualties or betrayals (Zulmat), overcome through solitary reflection (Khalwat) and consultation with scholars (Alims).',
    gameplayFormula:
      'При LeaderStress >= 85% наступает bIsInZulmat: приказы Диван-ханы парализованы, а параметры наибов скрыты туманом до созыва Совета учёных Диван-ханы.',
    gameplayFormulaEn:
      'At LeaderStress >= 85%, triggers bIsInZulmat: Divan-Khana orders are paralyzed and Naib traits are veiled in fog until the Divan-Khana Council of Scholars is convened.'
  },
  {
    id: 'jailau_kutans',
    termRu: 'Джайляу и Кутаны (Вертикальная экономика)',
    termEn: 'Jailau & Kutans (Vertical Transhumance)',
    arabicScript: 'جايلاو وقوتان',
    category: 'Экономика и Логистика',
    categoryEn: 'Economy & Logistics',
    historicalDesc:
      'Сезонный перегон скота между летними альпийскими пастбищами в горах (джайляу) и зимними равнинными пастбищами (кутаны) в предгорьях.',
    historicalDescEn:
      'Seasonal transhumance driving flocks between summer alpine pastures (Jailau) in the high ridges and winter lowland pastures (Kutans) in the foothills.',
    gameplayFormula:
      'Зимняя блокада равнинных кутанов урезает провиант, а заснеженные перевалы добавляют +1 ход пути гонцам и +12% к риску перехвата.',
    gameplayFormulaEn:
      'Winter blockade of lowland Kutans cuts provisions, while snowbound passes add +1 turn to envoy travel time and +12% interception risk.'
  },
  {
    id: 'kanly_adat',
    termRu: 'Канлы и Адат (Кровная месть и Обычай)',
    termEn: 'Kanly & Adat (Blood Feud & Clan Custom)',
    arabicScript: 'كانلي وعادات',
    category: 'Государство и Шариат',
    categoryEn: 'State & Sharia Law',
    historicalDesc:
      'Древний неписаный горский обычай (адат) и родовая вражда (канлы), десятилетиями уносившая жизни бойцов внутри соседних аулов.',
    historicalDescEn:
      'Ancient unwritten highland custom (Adat) and hereditary blood feuds (Kanly) that drained warrior lives across neighboring villages for generations.',
    gameplayFormula:
      'Судебный Низам против кровной мести пресекает внутренние потери гарнизонов и снижает модификатор гордыни наибов.',
    gameplayFormulaEn:
      'The Judicial Nizam outlawing blood feuds halts internal garrison attrition and reduces the Naib Pride penalty.'
  }
];

// ============================================================================
// СПРИНТ 26 (M26): ИНЖЕНЕРНЫЕ УКРЕПЛЕНИЯ НА 3D-КАРТЕ РЕЛЬЕФА (ЗАСЕКИ, КАМЕННЫЕ ЗАВАЛЫ, БАШНИ)
// ============================================================================
export const FORTIFICATION_BLUEPRINTS = [
  {
    id: 'abatis',
    icon: '🌲',
    badgeRu: 'Лесная засека',
    badgeEn: 'Beech Abatis',
    titleRu: 'Буковая засека и волчьи ямы (Талгик)',
    titleEn: 'Beech Forest Abatis & Wolf Pits (Talkhig)',
    descRu: 'Поваленные вековые буки крест-накрест: замедляет колонны РИ в 3 раза (×0.32) и наносит урон стрелками из укрытий.',
    descEn: 'Felled ancient beech trunks laid crosswise: slows Imperial columns 3x (×0.32) and inflicts rifle attrition.',
    costPowder: 5,
    costSilver: 25,
    radius: 34,
    enemySpeedMult: 0.32,
    friendlySpeedMult: 1.08,
    salvoDamageBayonets: 65,
    ambushBonusPct: 25,
    fillColor: '#059669',
    strokeColor: '#34d399'
  },
  {
    id: 'stone_barricade',
    icon: '🪨',
    badgeRu: 'Каменный завал',
    badgeEn: 'Stone Breastwork',
    titleRu: 'Каменный завал и контрминная сапа (Сафаров)',
    titleEn: 'Stone Breastwork & Rockfall Gallery (Safarov)',
    descRu: 'Сухая кладка и камнеметные ловушки в теснине: тормозит колонны РИ в 4 раза (×0.25) и обрушивает скальные глыбы.',
    descEn: 'Dry-stone breastwork and rockfall chutes in defiles: slows Imperial columns 4x (×0.25) with heavy boulder damage.',
    costPowder: 10,
    costSilver: 45,
    radius: 36,
    enemySpeedMult: 0.25,
    friendlySpeedMult: 1.1,
    salvoDamageBayonets: 95,
    ambushBonusPct: 35,
    fillColor: '#d97706',
    strokeColor: '#fbbf24'
  },
  {
    id: 'watchtower_gun',
    icon: '🗼',
    badgeRu: 'Башня с орудием',
    badgeEn: 'Unicorn Watchtower',
    titleRu: 'Сторожевая башня с горным единорогом (Ведено)',
    titleEn: 'Mountain Unicorn Watchtower (Vedeno)',
    descRu: 'Каменная башня с медным орудием: бьёт картечью по колоннам РИ (×0.34 скорость) и ускоряет отряды Имамата (×1.24).',
    descEn: 'Stone watchtower armed with a bronze unicorn gun: fires canister at enemy columns (×0.34) and speeds up friendly units (×1.24).',
    costPowder: 15,
    costSilver: 70,
    radius: 42,
    enemySpeedMult: 0.34,
    friendlySpeedMult: 1.24,
    salvoDamageBayonets: 125,
    ambushBonusPct: 45,
    fillColor: '#0284c7',
    strokeColor: '#38bdf8'
  }
];

// ============================================================================
// СПРИНТ 38 (M38): МЕЖЛИЧНОСТНОЕ СОПЕРНИЧЕСТВО И ФРАКЦИИ НАИБОВ В ДИВАН-ХАНЕ
// ============================================================================
export const NAIB_RIVALRY_TRIANGLES = [
  {
    id: 'rivalry_khunzakh_teletl',
    unlockTurn: 1,
    actBadgeRu: 'Акт I • Ход 1 (1845)',
    actBadgeEn: 'Act I • Turn 1 (1845)',
    titleRu: 'Спор о Конном авангарде и ревизии казны Аварии',
    titleEn: 'Clash Over the Cavalry Vanguard & Avaria Treasury Audit',
    naibANameRu: 'Хаджи-Мурат Хунзахский',
    naibANameEn: 'Hadji Murad of Khunzakh',
    naibAPortrait: 'Хаджи-Мурат',
    naibAId: 'khunzakh',
    naibBNameRu: 'Мудир Кибит-Магома Телетлинский',
    naibBNameEn: 'Mudir Kibit-Magoma of Teletl',
    naibBPortrait: 'Кибит-Магома',
    naibBId: 'gidatl',
    tension: 58,
    resolved: false,
    chosenSide: null,
    quoteRu:
      'Хаджи-Мурат: «Пока писцы Телетля считают каждую серебряную монету, мои всадники платят кровью у стен Дженгутая!» — Кибит-Магома: «Кто ставит свою славу выше устава Байт аль-маль, тот сеет смуту!»',
    quoteEn:
      'Hadji Murad: “While Teletl scribes count every silver coin, my horsemen pay in blood at Dzhengutay!” — Kibit-Magoma: “He who places personal glory above the Bayt al-Mal statute sows discord!”',
    riskDescRu:
      'При накале >75% Хаджи-Мурат удерживает трофеи рейдов (+12 Гордыни), а Кибит-Магома задерживает переброску пороха через Гидатль.',
    riskDescEn:
      'Above 75% tension, Hadji Murad withholds raid spoils (+12 Pride) while Kibit-Magoma delays powder transit across Gidatl.',
    options: [
      {
        id: 'back_hadji_murad',
        labelRu: 'Вручить Хаджи-Мурату знамя конного авангарда (+120 муртазеков, Иман Хунзаха +8, Гордыня -10, Накал -35%)',
        labelEn: 'Grant Hadji Murad the Cavalry Vanguard Banner (+120 Murtazeks, Khunzakh Iman +8, Pride -10, Tension -35%)',
        silverDelta: -40,
        powderDelta: 15,
        authorityDelta: 4,
        tensionDelta: -35,
        targetNaibAIman: 8,
        targetNaibAPride: -10,
        targetNaibBIman: -2,
        murtazeksBonus: 120
      },
      {
        id: 'back_kibit_magoma',
        labelRu: 'Утвердить строгую ревизию Кибит-Магомы (+160 руб. в Байт аль-маль, Авторитет +7, Накал -25%)',
        labelEn: 'Enforce Kibit-Magoma’s Strict Treasury Audit (+160 silver rub. to Bayt al-Mal, Authority +7, Tension -25%)',
        silverDelta: 160,
        powderDelta: 0,
        authorityDelta: 7,
        tensionDelta: -25,
        targetNaibAIman: -3,
        targetNaibAPride: 6,
        targetNaibBIman: 9,
        murtazeksBonus: 0
      },
      {
        id: 'joint_council_oath',
        labelRu: 'Скрепить совместный поход на кр. Внезапную (-50 руб., +25 пуд. пороха, оба наиба +6 Иман, Накал -45%)',
        labelEn: 'Seal a Joint Expedition Against Fort Vnezapnaya (-50 rub., +25 poods powder, both Naibs +6 Iman, Tension -45%)',
        silverDelta: -50,
        powderDelta: 25,
        authorityDelta: 6,
        tensionDelta: -45,
        targetNaibAIman: 6,
        targetNaibAPride: -6,
        targetNaibBIman: 6,
        murtazeksBonus: 60
      }
    ]
  },
  {
    id: 'rivalry_talkhig_baysungur',
    unlockTurn: 2,
    actBadgeRu: 'Акт II • Ход 2 (1846)',
    actBadgeEn: 'Act II • Turn 2 (1846)',
    titleRu: 'Спор о распределении пороха между равниной Шали и лесами Беноя',
    titleEn: 'Dispute Over Powder Allocation Between Shali Plains & Benoy Forests',
    naibANameRu: 'Мудир Талгик Шалинский',
    naibANameEn: 'Mudir Talkhig of Shali',
    naibAPortrait: 'Талгик',
    naibAId: 'chechnya',
    naibBNameRu: 'Наиб Байсунгур Беноевский',
    naibBNameEn: 'Naib Baysungur of Benoy',
    naibBPortrait: 'Байсунгур',
    naibBId: 'benoy',
    tension: 38,
    resolved: false,
    chosenSide: null,
    quoteRu:
      'Талгик: «Шалинские окопы держат главный удар просек Фрейтага — нам нужны все медные единороги!» — Байсунгур: «Замани их в буковую чащу Беноя, и мы возьмём их пушки голыми шашками!»',
    quoteEn:
      'Talkhig: “The Shali trenches absorb Freytag’s main clearing assault — we need every bronze unicorn gun!” — Baysungur: “Lure them into the Benoy beech forest and we’ll take their cannons with bare shashkas!”',
    riskDescRu:
      'Согласование обороны Большой Чечни и Ичкерии даёт +180 мер зерна с сохранённых нив и снижает натиск с Грозной.',
    riskDescEn:
      'Coordinating Greater Chechnya and Ichkeria defense yields +180 grain measures from protected fields and reduces pressure from Groznaya.',
    options: [
      {
        id: 'combined_argun_trap',
        labelRu: 'Создать единый рубеж «Окопы Шали + Засеки Беноя» (+20 пуд. пороха, +160 зерна, оба наиба +8 Иман)',
        labelEn: 'Establish Unified “Shali Trenches + Benoy Abatis” Line (+20 poods powder, +160 grain, both Naibs +8 Iman)',
        silverDelta: -45,
        powderDelta: 20,
        authorityDelta: 7,
        tensionDelta: -35,
        targetNaibAIman: 8,
        targetNaibAPride: -5,
        targetNaibBIman: 8,
        murtazeksBonus: 90
      }
    ]
  },
  {
    id: 'rivalry_daniyal_safarov',
    unlockTurn: 3,
    actBadgeRu: 'Акт III • Ход 3 (1847)',
    actBadgeEn: 'Act III • Turn 3 (1847)',
    titleRu: 'Спор о привилегиях Илису и бастионах Южного фронта',
    titleEn: 'Dispute Over Elisu Princely Privileges & Southern Bastions',
    naibANameRu: 'Султан Даниял-бек Илисуйский',
    naibANameEn: 'Sultan Daniyal-Bek of Elisu',
    naibAPortrait: 'Даниял-бек',
    naibAId: 'irib',
    naibBNameRu: 'Инженер Хаджи-Юсуф Сафаров',
    naibBNameEn: 'Engineer Hajji Yusuf Safarov',
    naibBPortrait: 'Юсуф-хаджи',
    naibBId: 'gergebil',
    tension: 52,
    resolved: false,
    chosenSide: null,
    quoteRu:
      'Даниял-бек: «Мои дружины из Илису привыкли сражаться под знаменем султанов, а не копать землю лопатами!» — Сафаров: «Против пудовых мортир Аргутинского спасает только трёхслойный дубовый блиндаж и точный циркуль!»',
    quoteEn:
      'Daniyal-Bek: “My Elisu retinues fight beneath a Sultan’s banner, not with sappers’ spades!” — Safarov: “Against Argutinsky’s pood mortars, only 3-layer oak blindages and geometry save lives!”',
    riskDescRu:
      'Без арбитража Имама Южный Дагестан (Ириб) уязвим перед обходными колоннами кн. Аргутинского-Долгорукова.',
    riskDescEn:
      'Without the Imam’s arbitration, Southern Dagestan (Irib) remains vulnerable to Prince Argutinsky-Dolgorukov’s flanking columns.',
    options: [
      {
        id: 'fortify_irib_samur',
        labelRu: 'Направить сапёров Сафарова укрепить Ириб и Самур (-10п пороха, Натиск РИ в Ирибе -20%, Накал -40%)',
        labelEn: 'Send Safarov’s Sappers to Fortify Irib & Samur (-10p powder, Imperial pressure in Irib -20%, Tension -40%)',
        silverDelta: -30,
        powderDelta: -10,
        authorityDelta: 6,
        tensionDelta: -40,
        targetNaibAIman: 8,
        targetNaibAPride: -8,
        targetNaibBIman: 8,
        murtazeksBonus: 50
      },
      {
        id: 'grant_mudir_title',
        labelRu: 'Подтвердить титул мудира за Даниял-беком и выдать субсидию (-65 руб., Иман Ириба +10, Гордыня -12)',
        labelEn: 'Confirm Daniyal-Bek’s Mudir Title & Stipend (-65 rub., Irib Iman +10, Pride -12)',
        silverDelta: -65,
        powderDelta: 12,
        authorityDelta: 4,
        tensionDelta: -30,
        targetNaibAIman: 10,
        targetNaibAPride: -12,
        targetNaibBIman: 2,
        murtazeksBonus: 80
      }
    ]
  }
];

// ============================================================================
// СПРИНТ 38 (M38): ДОКТРИНЫ ИИ-ПОЛКОВОДЦА ШАМИЛЯ В РЕЖИМЕ НАБЛЮДАТЕЛЯ
// ============================================================================
export const AI_SHAMIL_DOCTRINES = [
  {
    id: 'historical',
    badgeRu: '⚖️ Исторический баланс Дивана',
    badgeEn: '⚖️ Historical Divan Balance',
    descRu: 'Равномерное сочетание Низамов, обороны аулов и дипломатии',
    descEn: 'Balanced combination of Nizams, aul defense, and diplomacy',
    powderBonus: 10,
    silverBonus: 25,
    pressureReliefBonus: 4
  },
  {
    id: 'hadji_murad_raids',
    badgeRu: '🐎 Конные рейды Хаджи-Мурата',
    badgeEn: '🐎 Hadji Murad Cavalry Raids',
    descRu: 'Глубокие удары по тылам и перерезание обозов РИ за Тереком',
    descEn: 'Deep rear strikes and severing Imperial supply trains beyond the Terek',
    powderBonus: 22,
    silverBonus: 65,
    pressureReliefBonus: 9
  },
  {
    id: 'safarov_engineering',
    badgeRu: '🏰 Инженерный щит Сафарова',
    badgeEn: '🏰 Safarov Engineering Shield',
    descRu: 'Ставка на литейный двор Ведено, горные батареи и 3-слойные блиндажи',
    descEn: 'Focus on Vedeno foundry, mountain batteries, and 3-layer log blindages',
    powderBonus: 30,
    silverBonus: 15,
    pressureReliefBonus: 11
  },
  {
    id: 'ottoman_diplomacy',
    badgeRu: '🌙 Союз с Портой и Британией',
    badgeEn: '🌙 Ottoman & British Alliance',
    descRu: 'Прорыв морской блокады фелуками из Трабзона и дипломатия 1854 г.',
    descEn: 'Running the blockade with Trabzon feluccas and Crimean War diplomacy',
    powderBonus: 26,
    silverBonus: 80,
    pressureReliefBonus: 7
  }
];

// ============================================================================
// ВОЛНА III: ЖИВЫЕ СЕЗОННЫЕ ПАКЕТЫ ГОНЦОВ И ДИЛЕММЫ ДИВАН-ХАНЫ (РЕАКТИВНЫЕ СОБЫТИЯ)
// ============================================================================
export const DYNAMIC_DIVAN_PACKETS = [
  {
    id: 'pkt_besieged_aul_appeal',
    triggerType: 'besieged',
    senderRu: 'Окровавленный чапар из осаждённого аула',
    senderEn: 'Blood-Stained Courier from Besieged Aul',
    portraitHint: 'Байсунгур',
    urgencyRu: 'КРИТИЧЕСКАЯ ОСАДА',
    urgencyEn: 'CRITICAL SIEGE',
    titleRu: 'Пороховые погреба на исходе: гарнизон просит ночного прорыва!',
    titleEn: 'Powder Cellars Depleted: Garrison Begs for Night Relief!',
    descRu:
      'Русские сапёры ведут траншеи к водозабору аула. Наиб клянётся стоять до последнего патрона в газырях, но без срочного вьюка пороха из Ведено башни не выдержат штурма.',
    descEn:
      'Imperial sappers are pushing trenches toward the water spring. The Naib vows to fight to the last gazyr cartridge, but without an urgent powder pack from Vedeno the towers will fall.',
    choices: [
      {
        id: 'relief_pack',
        labelRu: 'Ночной прорыв с 26 пудами пороха (-26п пороха → снятие осады, +5% Авт.)',
        labelEn: 'Night Breakthrough with 26 Poods (-26p powder → lift siege, +5% Auth.)',
        powderDelta: -26,
        silverDelta: 0,
        provisionsDelta: 0,
        authorityDelta: 5,
        liftSiege: true,
        pressureDelta: -22,
        imanDelta: 6,
        prideDelta: -5
      },
      {
        id: 'hold_blindages',
        labelRu: 'Приказать биться кинжалами в блиндажах (+140 гарнизон, +10п на месте, Гордыня +7)',
        labelEn: 'Order Kindjal Defense in Blindages (+140 garrison, +10p local, Pride +7)',
        powderDelta: 0,
        localPowderDelta: 10,
        garrisonDelta: 140,
        authorityDelta: -2,
        pressureDelta: -8,
        imanDelta: 3,
        prideDelta: 7
      },
      {
        id: 'evac_families',
        labelRu: 'Вывести семьи в скалы Андии и ударить во фланг (-85 пров. → Натиск РИ -15%)',
        labelEn: 'Evacuate Families to Andi Cliffs & Flank (-85 prov. → Pressure -15%)',
        provisionsDelta: -85,
        authorityDelta: 3,
        pressureDelta: -15,
        imanDelta: 5,
        prideDelta: 0
      }
    ]
  },
  {
    id: 'pkt_hadji_murad_pride',
    triggerType: 'high_pride',
    senderRu: 'Наиб Хаджи-Мурат Хунзахский (Авария)',
    senderEn: 'Naib Hadji Murad of Khunzakh (Avaria)',
    portraitHint: 'Хаджи-Мурат',
    urgencyRu: 'СПОР О ЧЕСТИ И ХУМСЕ',
    urgencyEn: 'DISPUTE OF HONOR & KHUMS',
    titleRu: 'Спор о трофейных табунах после набега под Темир-Хан-Шурой',
    titleEn: 'Dispute Over Captured Warhorses After the Temir-Khan-Shura Raid',
    descRu:
      'Конница Хаджи-Мурата угнала офицерских коней с кордона, но мухтасибы требуют сдать всю добычу в казну Байт аль-маль. Уязвлённый наиб ждёт слова Шамиля.',
    descEn:
      'Hadji Murad’s riders seized officer mounts from the cordon, but Muhtasibs demand all spoils for Bayt al-Mal. The proud Naib awaits Shamil’s personal ruling.',
    choices: [
      {
        id: 'honor_share',
        labelRu: 'Пожаловать скакунов сотне Хаджи-Мурата (-55₽ → Гордыня -14, +75 сабель в сотню)',
        labelEn: 'Grant Mounts to Hadji Murad’s Squadron (-55₽ → Pride -14, +75 sabers)',
        silverDelta: -55,
        authorityDelta: 2,
        targetNaibId: 'khunzakh',
        imanDelta: 6,
        prideDelta: -14,
        unitIdBonus: 'unit_hadji_murat',
        unitSabersDelta: 75
      },
      {
        id: 'strict_nizam',
        labelRu: 'Взыскать пятую долю Хумса по Низаму (+110₽ в казну, Авт. +5%, Гордыня +11)',
        labelEn: 'Enforce Strict Khums Nizam (+110₽ treasury, Auth. +5%, Pride +11)',
        silverDelta: 110,
        authorityDelta: 5,
        targetNaibId: 'khunzakh',
        imanDelta: -3,
        prideDelta: 11
      },
      {
        id: 'joint_raid',
        labelRu: 'Послать в новый рейд на обозы РИ (-14п пороха → урон колонне РИ -260 шт., Гордыня -8)',
        labelEn: 'Dispatch on Fresh Convoy Raid (-14p powder → Imperial column -260 bay., Pride -8)',
        powderDelta: -14,
        silverDelta: 45,
        targetNaibId: 'khunzakh',
        prideDelta: -8,
        damageEnemyBayonets: 260
      }
    ]
  },
  {
    id: 'pkt_captured_staff_captain',
    triggerType: 'recon',
    senderRu: 'Кунацкая разведка Сунженской линии',
    senderEn: 'Sunzha Line Kunak Intelligence',
    portraitHint: 'Талгик',
    urgencyRu: 'СЕКРЕТНЫЙ ПОРТФЕЛЬ РИ',
    urgencyEn: 'CAPTURED STAFF PORTFOLIO',
    titleRu: 'Перехвачен квартирьер Генерального штаба с маршрутами колонн!',
    titleEn: 'Captured Imperial Quartermaster Carrying Column March Tables!',
    descRu:
      'В буковом лесу у Валерика мюриды взяли в плен штабного офицера с кожаной сумкой карт и ведомостями сухарных парков Отдельного Кавказского корпуса.',
    descEn:
      'In the Valerik beech woods, murids captured a staff officer carrying leather map cases and biscuit-convoy schedules of the Separate Caucasian Corps.',
    choices: [
      {
        id: 'decode_maps',
        labelRu: 'Раскрыть карты кордона (открыть сектор Тумана войны + разведка удара РИ, +12п пороха)',
        labelEn: 'Decode Cordon Maps (reveal Fog sector + scout Imperial strike, +12p powder)',
        powderDelta: 12,
        revealFogRing: true,
        authorityDelta: 3
      },
      {
        id: 'michik_ransom',
        labelRu: 'Обменять офицера на Мичике (+65 сабель в отряд, +60₽ серебром, Авт. +4%)',
        labelEn: 'Exchange Officer on the Michik (+65 sabers to unit, +60₽ silver, Auth. +4%)',
        silverDelta: 60,
        authorityDelta: 4,
        unitIdBonus: 'unit_baysungur',
        unitSabersDelta: 65
      },
      {
        id: 'artillery_advisor',
        labelRu: 'Передать таблицы стрельбы батарее Талгика (+24п пороха и ветеранство артиллерии)',
        labelEn: 'Hand Firing Tables to Talkhig’s Battery (+24p powder & artillery veterancy)',
        powderDelta: 24,
        unitIdBonus: 'unit_talkhig_artillery',
        unitVetXpDelta: 1
      }
    ]
  },
  {
    id: 'pkt_ichkeria_winter_famine',
    triggerType: 'provisions',
    senderRu: 'Старейшины джамаатов Большой Чечни (Шали)',
    senderEn: 'Jamaat Elders of Greater Chechnya (Shali)',
    portraitHint: 'Талгик',
    urgencyRu: 'ПРОДОВОЛЬСТВЕННЫЙ КРИЗИС',
    urgencyEn: 'PROVISION CRISIS',
    titleRu: 'Ранние заморозки и порубка садов грозят голодом семьям мюридов',
    titleEn: 'Early Frost & Cleared Orchards Threaten Murid Families with Hunger',
    descRu:
      'Экспедиционные отряды вытоптали кукурузные поля на плоскости. Старейшины Шали и Беноя просят открыть неприкосновенные зерновые ямы казны.',
    descEn:
      'Expeditionary columns trampled lowland maize fields. Elders of Shali and Benoy petition to open the state’s emergency grain pits.',
    choices: [
      {
        id: 'open_granaries',
        labelRu: 'Открыть зерновые ямы Байт аль-маль (-150 пров., -45₽ → Авт. +6%, Иман наибов +6)',
        labelEn: 'Open Bayt al-Mal Grain Pits (-150 prov., -45₽ → Auth. +6%, Naib Iman +6)',
        provisionsDelta: -150,
        silverDelta: -45,
        authorityDelta: 6,
        allImanDelta: 6
      },
      {
        id: 'barter_avar_flocks',
        labelRu: 'Закупить отары в Андалале за серебро (-95₽ → +240 мер провианта)',
        labelEn: 'Purchase Andalal Flocks with Silver (-95₽ → +240 provisions)',
        silverDelta: -95,
        provisionsDelta: 240,
        authorityDelta: 2
      },
      {
        id: 'cordon_forage_raid',
        labelRu: 'Отбить казачьи фуражные обозы (-15п пороха → +195 пров. и +50₽)',
        labelEn: 'Capture Cossack Forage Trains (-15p powder → +195 prov. & +50₽)',
        powderDelta: -15,
        provisionsDelta: 195,
        silverDelta: 50,
        damageEnemyBayonets: 180
      }
    ]
  },
  {
    id: 'pkt_trabzon_felucca',
    triggerType: 'ottoman',
    senderRu: 'Тайный агент Хаджи-Исмаил (Трабзон — Суджук-Кале)',
    senderEn: 'Secret Envoy Hajji Ismail (Trabzon — Sudzhuk-Kale)',
    portraitHint: 'Шамиль',
    urgencyRu: 'МОРСКАЯ КОНТРАБАНДА',
    urgencyEn: 'BLACK SEA RUNNER',
    titleRu: 'Анатолийская фелюга прошла мимо русского крейсерства со свинцом и селитрой',
    titleEn: 'Anatolian Felucca Slipped Past Imperial Cruisers with Lead & Saltpetre',
    descRu:
      'Через черкесских кунаков к перевалам доставлены бочонки английского ружейного пороха и нарезные штуцеры. Шкипер ждёт расчёта серебром.',
    descEn:
      'Through Circassian kunaks, kegs of English rifle powder and precision carbines have reached the passes. The captain awaits silver payment.',
    choices: [
      {
        id: 'buy_full_cargo',
        labelRu: 'Выкупить весь груз пороха и штуцеров (-110₽ → +44п пороха, Порта +8%)',
        labelEn: 'Buy Full Cargo of Powder & Rifles (-110₽ → +44p powder, Porte +8%)',
        silverDelta: -110,
        powderDelta: 44,
        ottomanDelta: 8,
        authorityDelta: 3
      },
      {
        id: 'hire_gunners',
        labelRu: 'Нанять османских литейщиков в Ведено (-70₽ → +24п пороха и ветеранство сотен)',
        labelEn: 'Hire Ottoman Foundrymen for Vedeno (-70₽ → +24p powder & unit veterancy)',
        silverDelta: -70,
        powderDelta: 24,
        ottomanDelta: 5,
        unitIdBonus: 'unit_chapar_vedeno',
        unitVetXpDelta: 1
      },
      {
        id: 'levy_customs',
        labelRu: 'Взять таможенную пошлину с купцов (+75₽ в казну и +12п пороха)',
        labelEn: 'Collect State Customs Duty (+75₽ silver & +12p powder)',
        silverDelta: 75,
        powderDelta: 12
      }
    ]
  },
  {
    id: 'pkt_saltpetre_breakthrough',
    triggerType: 'general',
    senderRu: 'Главный инженер Хаджи-Юсуф Сафаров (Ведено — Гуниб)',
    senderEn: 'Chief Engineer Hajji Yusuf Safarov (Vedeno — Gunib)',
    portraitHint: 'Юсуф',
    urgencyRu: 'АРСЕНАЛ И ИНЖЕНЕРИЯ',
    urgencyEn: 'FOUNDRY & ENGINEERING',
    titleRu: 'Открыта жила чистой горной селитры и отлит новый медный единорог!',
    titleEn: 'Rich Mountain Saltpetre Vein Discovered & New Bronze Unicorn Cast!',
    descRu:
      'Мастера пороховой толчеи на реке Ахк-Таш доложили об удвоении выварки селитры, а устаз Джабраил завершил сверловку лёгкого горного орудия.',
    descEn:
      'Masters of the Ahk-Tash water-mill report doubled saltpetre output while Ustaz Jabrail has finished boring a light mountain unicorn.',
    choices: [
      {
        id: 'stock_vedeno',
        labelRu: 'Направить выработку в центральный арсенал Ведено (-40₽ → +38п пороха)',
        labelEn: 'Stock Central Vedeno Arsenal (-40₽ → +38p powder)',
        silverDelta: -40,
        powderDelta: 38,
        authorityDelta: 3
      },
      {
        id: 'arm_battery',
        labelRu: 'Передать орудие в конно-горную батарею (+18п пороха, +70 расчёта и ★ ранг батарее)',
        labelEn: 'Assign Gun to Horse-Mountain Battery (+18p powder, +70 crew & ★ rank)',
        powderDelta: 18,
        unitIdBonus: 'unit_talkhig_artillery',
        unitSabersDelta: 70,
        unitVetXpDelta: 1
      },
      {
        id: 'fortify_frontline',
        labelRu: 'Разослать минные заряды на передовые рубежи (Натиск РИ во всех округах -8%)',
        labelEn: 'Distribute Counter-Mine Charges to Frontline (All Naibates pressure -8%)',
        powderDelta: -10,
        allPressureDelta: -8,
        allImanDelta: 4
      }
    ]
  }
];
