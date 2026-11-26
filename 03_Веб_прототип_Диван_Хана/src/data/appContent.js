// ============================================================================
// Статический контент интерфейса: сезоны, Ironman-испытания, раскадровка трейлера, музей, депеши, майлстоуны
// Вынесено из компонента App (не зависит от состояния игры)
// ============================================================================

export const SEASONS = [
    'Июнь 1845 г. (Джумада ас-сани 1261 г. х. — Поход Воронцова на Дарго)',
    'Апрель 1846 г. (Раби ас-сани 1262 г. х. — Прорыв в Кабарду)',
    'Июль 1847 г. (Шаабан 1263 г. х. — Осада аула Салты и полевой лазарет)',
    'Август 1849 г. (Шавваль 1265 г. х. — Артиллерийская осада Чоха)',
    'Октябрь 1850 г. (Зу-ль-хиджа 1266 г. х. — Просеки через Шалинский лес)',
    'Ноябрь 1851 г. (Мухаррам 1268 г. х. — Совет наибов в Андии и Хаджи-Мурат)',
    'Март 1855 г. (Джумада ас-сани 1271 г. х. — Великий размен на реке Мичик)',
    'Сентябрь 1855 г. (Мухаррам 1272 г. х. — Анатолийский фронт и депеши Порты)',
    'Апрель 1856 г. (Шаабан 1272 г. х. — Назначение кн. Барятинского на Кавказ)',
    'Август 1856 г. (Зу-ль-хиджа 1272 г. х. — Съезд мудиров в Ведено)',
    'Январь 1857 г. (Джумада аль-уля 1273 г. х. — Зимний прорыв Евдокимова в Чечне)',
    'Июль 1857 г. (Зу-ль-каада 1273 г. х. — Оборона Старого Буртуная и Салатавии)',
    'Ноябрь 1857 г. (Раби ас-сани 1274 г. х. — Укрепление Аргунского ущелья)',
    'Апрель 1858 г. (Шаабан 1274 г. х. — Оборона теснины Шаро-Аргун)',
    'Август 1858 г. (Мухаррам 1275 г. х. — Контррейд на Назрань и линии тыла)',
    'Январь 1859 г. (Джумада ас-сани 1275 г. х. — Зимняя осада столицы Ведено)',
    'Апрель 1859 г. (Рамадан 1275 г. х. — Перенос ставки Дивана в горы Аварии)',
    'Июнь 1859 г. (Зу-ль-каада 1275 г. х. — Рубеж у бастиона Ириб и Каратинского моста)',
    'Июль 1859 г. (Зу-ль-хиджа 1275 г. х. — Переход через Койсу к плато Гуниб)',
    'Август 1859 г. (Мухаррам 1276 г. х. — Оборона Верхнего Гуниба и Вердикт Истории)'
  ];

export const SEASONS_EN = [
    'June 1845 (Jumada al-Thani 1261 AH — Vorontsov’s Dargo Expedition)',
    'April 1846 (Rabi’ al-Thani 1262 AH — Breakthrough into Kabarda)',
    'July 1847 (Sha’ban 1263 AH — Siege of Salty & Field Lazaret)',
    'August 1849 (Shawwal 1265 AH — Artillery Siege of Chokh)',
    'October 1850 (Dhu al-Hijjah 1266 AH — Shali Forest Clearings)',
    'November 1851 (Muharram 1268 AH — Council in Andia & Hadji Murad)',
    'March 1855 (Jumada al-Thani 1271 AH — The Great Exchange on the Michik River)',
    'September 1855 (Muharram 1272 AH — Anatolian Front & Sublime Porte Dispatches)',
    'April 1856 (Sha’ban 1272 AH — Prince Baryatinsky Appointed to the Caucasus)',
    'August 1856 (Dhu al-Hijjah 1272 AH — Congress of Mudirs in Vedeno)',
    'January 1857 (Jumada al-Ula 1273 AH — Evdokimov’s Winter Offensive in Chechnya)',
    'July 1857 (Dhu al-Qa’dah 1273 AH — Defense of Old Burtunay & Salatavia)',
    'November 1857 (Rabi’ al-Thani 1274 AH — Fortifying the Argun Gorge)',
    'April 1858 (Sha’ban 1274 AH — Defense of the Sharo-Argun Defile)',
    'August 1858 (Muharram 1275 AH — Nazran Raid & Rear Disruption)',
    'January 1859 (Jumada al-Thani 1275 AH — Winter Siege of Capital Vedeno)',
    'April 1859 (Ramadan 1275 AH — Relocating the Divan to Avaria Highlands)',
    'June 1859 (Dhu al-Qa’dah 1275 AH — Stand at Irib Bastion & Karata Bridge)',
    'July 1859 (Dhu al-Hijjah 1275 AH — Crossing the Koisu to Gunib Plateau)',
    'August 1859 (Muharram 1276 AH — Defense of Upper Gunib & Verdict of History)'
  ];

// ============================================================================
// СПРИНТ 15 (M15): 3 ХАРДКОРНЫХ ИСПЫТАНИЯ IRONMAN И ГРАМОТА С ПЕЧАТЬЮ ШАМИЛЯ
// ============================================================================
export const HISTORICAL_IRONMAN_CHALLENGES = [
    {
      id: 'ironman_1839_akhulgo',
      badgeRu: 'ИСПЫТАНИЕ I • 1839',
      badgeEn: 'IRONMAN I • 1839',
      titleRu: '80 дней Ахульго: Таран Граббе',
      titleEn: '80 Days of Akhulgo: Grabbe’s Siege Ram',
      descRu: 'Критический дефицит пороха (85 пудов), осада Аварского Койсу и закреплённая доктрина осадного тарана ген. П. Х. Граббе (-14 пуд./удар).',
      descEn: 'Severe powder shortage (85 poods), Avar Koysu under siege, and locked Siege Ram doctrine of Gen. P. Kh. Grabbe (-14 poods/strike).',
      generalIdx: 0,
      resources: { gunpowder: 85, provisions: 890, silver: 340, authority: 88, ottomanSupport: 30 },
      besiegedIds: ['khunzakh', 'gergebil'],
      pressureBoost: 14,
      powderAdjust: -14
    },
    {
      id: 'ironman_1845_dargo_trap',
      badgeRu: 'ИСПЫТАНИЕ II • 1845',
      badgeEn: 'IRONMAN II • 1845',
      titleRu: 'Сухарная ловушка Воронцова в Ичкерии',
      titleEn: 'Vorontsov’s Biscuit Trap in Ichkeria',
      descRu: 'Склады Дарго сожжены (590 мер зерна, 135 пудов пороха). Колонна фельдмаршала М. С. Воронцова рвётся к Беною и Ведено (+11% к удару).',
      descEn: 'Dargo stores burned (590 grain measures, 135 poods powder). Field Marshal Vorontsov’s column thrusts into Benoy and Vedeno (+11% strike).',
      generalIdx: 2,
      resources: { gunpowder: 135, provisions: 590, silver: 510, authority: 86, ottomanSupport: 45 },
      besiegedIds: ['benoy', 'vedeno'],
      pressureBoost: 10,
      powderAdjust: -6
    },
    {
      id: 'ironman_1857_gunib_ring',
      badgeRu: 'ИСПЫТАНИЕ III • 1857–1859',
      badgeEn: 'IRONMAN III • 1857–1859',
      titleRu: 'Кольцо Барятинского и последний оплот Гуниба',
      titleEn: 'Baryatinsky’s Ring & Last Bastion of Gunib',
      descRu: 'Вековые леса Чечни вырублены (-90 мер зерна/ход, +9% перехват гонцов). Шали, Ведено и Беной в кольце блокады; опора только на селитру Гуниба.',
      descEn: 'Chechen beech forests cleared (-90 provisions/turn, +9% envoy interception). Shali, Vedeno & Benoy besieged; only Gunib’s saltpeter holds.',
      generalIdx: 3,
      resources: { gunpowder: 110, provisions: 610, silver: 420, authority: 82, ottomanSupport: 25 },
      besiegedIds: ['shali', 'vedeno', 'benoy'],
      pressureBoost: 18,
      powderAdjust: -12
    }
  ];

// ============================================================================
// СПРИНТ 16 (M16): 60-СЕКУНДНЫЙ РАСКАДРОВЩИК И ПРЕВИЗ ТРЕЙЛЕРА STEAM (UE5 SEQUENCER)
// ============================================================================
export const STEAM_TRAILER_STORYBOARD_SHOTS = [
    {
      shotIdx: 0,
      timecode: '00:00 – 00:10',
      titleRu: 'Кадр 1: Очаг Диван-ханы в Ведено и пергаментная карта Кавказа',
      titleEn: 'Shot 1: Divan-Khana Hearth in Vedeno & Candlelit Caucasus Map',
      cameraLens: '35mm Prime • f/2.0 • Dolly-In',
      ue5ActorRef: 'ADivanKhanaTablePawn (Z = -13182.9 cm, Pitch = -14°)',
      audioLayerRu: 'Слой 3: Потрескивание углей очага и водяная пороховая мельница Ведено',
      audioLayerEn: 'Layer 3: Hearth Ember Crackle & Vedeno Watermill Wooden Pestles',
      voiceoverRu: '«У тебя нет всевидящего ока. Только карта при свечах, 195 пудов пороха и десять гордых наибов в горах...»',
      voiceoverEn: '“You have no omniscient eye. Only a candlelit map, 195 poods of gunpowder, and ten proud Naibs across the mountains...”',
      targetTab: 'map',
      soundCue: 'seal'
    },
    {
      shotIdx: 1,
      timecode: '00:10 – 00:20',
      titleRu: 'Кадр 2: Оттиск восьмиугольного перстня Шамиля и выезд чапара',
      titleEn: 'Shot 2: Shamil’s Octagonal Signet Stamp & Mounted Chapar Dispatch',
      cameraLens: '50mm Macro • f/2.4 • Low-Angle Pan',
      ue5ActorRef: 'Socket_ShamilRing_Octagonal -> UImamatStrategicSubsystem::SendEnvoyWithOrder',
      audioLayerRu: 'Слой 1: Удар серебряной печати и горный ветер ущелья Ахк-Таш (240→490 Гц)',
      audioLayerEn: 'Layer 1: Silver Signet Thud & Ahk-Tash Gorge Wind (240→490 Hz)',
      voiceoverRu: '«Каждый указ скачет через казачьи кордоны Фрейтага. Дойдёт ли караван с селитрой до осаждённого Гергебиля?»',
      voiceoverEn: '“Every decree rides through Freitag’s Cossack cordons. Will the saltpeter caravan reach besieged Gergebil in time?”',
      targetTab: 'map',
      soundCue: 'envoy'
    },
    {
      shotIdx: 2,
      timecode: '00:20 – 00:32',
      titleRu: 'Кадр 3: 3D-разрез скалы Милютина и медный таз Хаджи-Юсуфа Сафарова',
      titleEn: 'Shot 3: Milyutin 3D Rock Cutaway & Safarov’s Copper Basin Sonar',
      cameraLens: '28mm Anamorphic • f/2.8 • Cross-Section Orbit',
      ue5ActorRef: 'ATacticalSiegeManager + MF_MilyutinCutawaySection.hlsl (Salti Z = +43118.7 cm)',
      audioLayerRu: 'Слой 2: Акустический резонанс медного таза с водой над минной галереей сапёров',
      audioLayerEn: 'Layer 2: Acoustic Copper Water-Basin Sonar over Russian Sapper Mine Gallery',
      voiceoverRu: '«Когда сапёры Граббе роют подкоп под бастион, слушай дрожь воды в медном тазу Сафарова — и бей встречным камуфлетом!»',
      voiceoverEn: '“When Grabbe’s sappers tunnel beneath the bastion, watch the ripples in Safarov’s copper basin—and detonate the counter-mine!”',
      targetTab: '3d_tactical',
      soundCue: 'cannon'
    },
    {
      shotIdx: 3,
      timecode: '00:32 – 00:44',
      titleRu: 'Кадр 4: Буковая засека в Ичкерии и кинжальный залп 18 газырей',
      titleEn: 'Shot 4: Ichkeria Beech Abatis Ambush & 18-Gazyr Point-Blank Volley',
      cameraLens: '24mm Wide • f/2.8 • Tracking Spline Shot',
      ue5ActorRef: 'AForestSplineAmbushController (12 Spline Points) + UGazyrAmmunitionComponent',
      audioLayerRu: 'Залп штуцеров из-за поваленных буков и звон шашек Гурды и Базалая',
      audioLayerEn: 'Rifle Volley from Felled Beech Abatis & Clash of Gurda and Bazalai Shashkas',
      voiceoverRu: '«Восемнадцать нагрудных газырей на черкеске. Три последних — неприкосновенный запас перед шашечной атакой в упор!»',
      voiceoverEn: '“Eighteen wooden gazyrs on the chest. The final three are your sacred reserve before a point-blank shashka charge!”',
      targetTab: 'siege',
      soundCue: 'cannon'
    },
    {
      shotIdx: 4,
      timecode: '00:44 – 00:52',
      titleRu: 'Кадр 5: Кодекс Низамов, суд над Хаджи-Муратом и матрица 20 000 партий',
      titleEn: 'Shot 5: Shamil’s Nizam Code, Trial of Hadji Murad & 20,000-Run Balance Matrix',
      cameraLens: '40mm Prime • f/2.2 • Crane Up',
      ue5ActorRef: 'DT_ShamilNizams + DT_CourtCases_1845 + MonteCarlo_16000_DoctrineMatrix_Report',
      audioLayerRu: 'Шелест арабских хроник Мухаммед-Тахира аль-Карахи и печать кадия',
      audioLayerEn: 'Parchment Rustle of al-Qarakhi’s Chronicle & Qadi’s Verdict Seal',
      voiceoverRu: '«Укроти гордыню наибов законом Низама и не дай кольцу Барятинского сломить дух Имамата в тьму Зульмата.»',
      voiceoverEn: '“Curb Naib pride through the Code of Nizams and prevent Baryatinsky’s ring from plunging the Imamate into Zulmat.”',
      targetTab: 'nizams',
      soundCue: 'seal'
    },
    {
      shotIdx: 5,
      timecode: '00:52 – 01:00',
      titleRu: 'Кадр 6: Цитадель Верхнего Гуниба — ИМАМАТ: ДИВАН-ХАНА в Steam',
      titleEn: 'Shot 6: Upper Gunib Citadel Reveal — IMAMAT: DIVAN-KHANA on Steam',
      cameraLens: '18mm Ultra-Wide • f/4.0 • Aerial Pull-Back',
      ue5ActorRef: 'T_Heightmap_Ahulgo_1839.r16 + T_Heightmap_Salti_1847.r16 (2017×2017 SRTM)',
      audioLayerRu: 'Полный трёхслойный аккорд горного ветра, водяной мельницы Ведено и медного гонга',
      audioLayerEn: 'Full 3-Layer Acoustic Crescendo: Gorge Wind, Vedeno Mill & Bronze Gong',
      voiceoverRu: '«ИМАМАТ: ДИВАН-ХАНА (1834–1859). Добавьте в список желаемого в Steam и испытайте демоверсию прямо сейчас!»',
      voiceoverEn: '“IMAMAT: DIVAN-KHANA (1834–1859). Wishlist on Steam and play the Vertical Slice demo today!”',
      targetTab: '3d_tactical',
      soundCue: 'seal'
    }
  ];

// ============================================================================
// СПРИНТ 17 (M17): ИНТЕРАКТИВНЫЙ АРХИВ-МУЗЕЙ КАВКАЗСКОЙ ВОЙНЫ (ГЛАВЫ 03, 04, 19, 26–30)
// ============================================================================
export const HISTORICAL_MUSEUM_EXHIBITS = [
    // 1. ПОРТРЕТНАЯ ГАЛЕРЕЯ (PORTRAITS & DAGUERREOTYPES — Гл. 26, 27, 29, 30)
    {
      id: 'ex_shamil_denier',
      gallery: 'portraits',
      imageUrl: 'Portrait_Imam_Shamil_Vedeno_1845.jpg',
      titleRu: 'Имам Шамиль и Совет Диван-ханы в Дарго-Ведено (1845–1859 гг.)',
      titleEn: 'Imam Shamil & the State Council of Divan-Khana in Dargo-Vedeno (1845–1859)',
      subtitleRu: 'Третий имам Дагестана и Чечни (1834–1859), Сердар-ы Экрем',
      subtitleEn: 'Third Imam of Dagestan & Chechnya (1834–1859), Serdar-ı Ekrem',
      archiveRef: 'Глава 26 и 30 • ГАРФ / Эрмитаж • Литография В. Ф. Тимма (1859)',
      descRu:
        'Канонический прижизненный фотопортрет 62-летнего Шамиля в ателье Андрея Деньера на Невском проспекте. На груди тёмной суконной черкески — 18 газырей с чернёными серебряными колпачками, на голове — белая кисейная чалма имама поверх папахи.',
      descEn:
        'Canonical life photograph of the 62-year-old Imam taken at Andrei Denier’s studio on Nevsky Prospekt. Across his austere dark wool cherkesska sit 18 silver-capped gazyrs; a white muslin turban crowns his black papakha.',
      gameplayLinkTab: 'map',
      gameplayLinkLabelRu: 'Перейти к Командному столу Шамиля в Ведено →',
      gameplayLinkLabelEn: 'Jump to Shamil’s Command Table in Vedeno →',
      accentColor: '#f59e0b',
      svgBadgeText: 'IMAM SHAMIL • 1859'
    },
    {
      id: 'ex_hadji_murat_gagarin',
      gallery: 'portraits',
      imageUrl: 'Portrait_Hadji_Murat_Khunzakh_1851.jpg',
      titleRu: 'Наиб Хаджи-Мурат Хунзахский (Акварель кн. Г. Г. Гагарина, Тифлис, 1851 г.)',
      titleEn: 'Naib Hadji Murad of Khunzakh (Watercolor by Prince G. G. Gagarin, Tiflis, 1851)',
      subtitleRu: 'Предводитель аварской конницы и герой повести Л. Н. Толстого',
      subtitleEn: 'Commander of Avar Cavalry & Subject of Leo Tolstoy’s Novella',
      archiveRef: 'Глава 16 и 27 • Русский музей (СПб) • Зарисовка с натуры 1851 г.',
      descRu:
        'Портрет написан князем Григорием Гагариным в Тифлисе за четыре месяца до трагического прорыва и гибели Хаджи-Мурата под Нухой (23 апреля 1852 г.). В игре отражён экстремальным сочетанием Смелости (99%) и Гордыни (94%).',
      descEn:
        'Painted from life by Prince Grigory Gagarin in Tiflis four months before Hadji Murad’s final breakout and death near Nukha (April 23, 1852). Represented in-game by 99% Courage and 94% Pride.',
      gameplayLinkTab: 'map',
      gameplayLinkLabelRu: 'Открыть Хунзахское наибство на карте →',
      gameplayLinkLabelEn: 'Inspect Khunzakh Naibate on Map →',
      accentColor: '#ef4444',
      svgBadgeText: 'HADJI MURAD • 1851'
    },
    {
      id: 'ex_baysungur_benoy_1845',
      gallery: 'portraits',
      imageUrl: 'Portrait_Baysungur_Benoy_1845.jpg',
      titleRu: 'Наиб Байсунгур Беноевский: Железный страж Ичкерии (Дарго 1845 — Гуниб 1859)',
      titleEn: 'Naib Baysungur of Benoy: Iron Guardian of Ichkeria (Dargo 1845 — Gunib 1859)',
      subtitleRu: 'Несгибаемый чеченский наиб, привязываемый мюридами к седлу боевого коня',
      subtitleEn: 'Indomitable Chechen Naib Strapped to His Warhorse Saddle by Murids Before Battle',
      archiveRef: 'Глава 13, 21 и 26 • Хроники Даргинского похода (1845) и обороны Гуниба (1859)',
      descRu:
        'Потеряв в боях глаз, руку и ногу, наиб Беноя Байсунгур продолжал водить чеченские сотни в шашечные атаки, привязанный ремнями к седлу. В игре обладает максимальными показателями Имана (97%) и Смелости (100%) при полном отсутствии Алчности (8%).',
      descEn:
        'Having lost an eye, an arm, and a leg in combat, Naib Baysungur of Benoy continued to lead Chechen cavalry charges strapped to his saddle. In-game he holds peak Iman (97%) and Courage (100%) with virtually zero Greed (8%).',
      gameplayLinkTab: 'archive_ballistics',
      gameplayLinkLabelRu: 'Открыть досье и боевой перк Байсунгура →',
      gameplayLinkLabelEn: 'Open Baysungur’s Dossier & Combat Perk →',
      accentColor: '#10b981',
      svgBadgeText: 'BAYSUNGUR OF BENOY • 1845'
    },
    {
      id: 'ex_pirogov_salty_1847',
      gallery: 'portraits',
      imageUrl: 'Portrait_Pirogov_Salty_1847.jpg',
      titleRu: 'Хирург Н. И. Пирогов под Салтами (Август 1847 г.): Первая в мире полевая эфирная анестезия',
      titleEn: 'Surgeon N. I. Pirogov at the Siege of Salty (Aug 1847): World’s First Field Ether Anesthesia',
      subtitleRu: 'Гуманизм на поле брани: спасение раненых солдат и пленных горцев под скалами Андалала',
      subtitleEn: 'Humanitarianism on the Battlefield: Saving Wounded Soldiers & Highlanders Beneath Andalal',
      archiveRef: 'Глава 15 и 29 • «Отчёт о путешествии по Кавказу» Н. И. Пирогова (1849) • Музей в с. Салта',
      descRu:
        'В августе 1847 года под стенами осаждённого аула Салты великий хирург Николай Иванович Пирогов впервые в истории военной медицины провёл 100 операций под эфирным наркозом прямо в полевом перевязочном пункте, оказывая помощь как русским солдатам, так и раненым мюридам.',
      descEn:
        'In August 1847 beneath besieged Aul Salty, pioneering surgeon Nikolai Pirogov performed the first 100 battlefield operations under ether anesthesia in medical history, treating both Russian soldiers and wounded murids.',
      gameplayLinkTab: 'crises',
      gameplayLinkLabelRu: 'Перейти к развилке перемирия с лазаретом Пирогова (1847) →',
      gameplayLinkLabelEn: 'Open the 1847 Pirogov Field Hospital Truce Crisis →',
      accentColor: '#38bdf8',
      svgBadgeText: 'PIROGOV • SALTY 1847'
    },
    {
      id: 'ex_sogratl_1877_imam',
      gallery: 'portraits',
      imageUrl: 'Portrait_Muhammad_Hajji_Sogratl_1877.jpg',
      titleRu: '4-й имам Мухаммад-Хаджи Согратлинский, шейх Абдурахман-Хаджи и Алибек-Хаджи Алдамов (1877 г.)',
      titleEn: '4th Imam Muhammad-Hajji of Sogratl, Sheikh Abdurahman-Hajji & Alibek-Hajji Aldamov (1877)',
      subtitleRu: 'Трагический эпилог «Малого газавата» 1877 года в Чечне и Дагестане',
      subtitleEn: 'Tragic Epilogue of the 1877 “Lesser Ghazawat” Uprising in Chechnya & Dagestan',
      archiveRef: 'Глава 25 • Хроника Гасана Алкадари «Асари-Дагестан» и рукописи Согратля (1877)',
      descRu:
        'Во время Русско-турецкой войны 1877–1878 гг. восстание охватило Ичкерию и Дагестан. Несмотря на предостережение 85-летнего учёного шейха Абдурахмана-Хаджи ас-Сугури о девятикратном перевесе казённой нарезной артиллерии, его сын Мухаммад-Хаджи разделил судьбу своего народа до конца при обороне Согратля.',
      descEn:
        'During the Russo-Turkish War of 1877–1878, revolt swept Ichkeria and Dagestan. Despite 85-year-old scholar Sheikh Abdurahman-Hajji’s warning regarding the 9-fold superiority of breech-loading rifled artillery, his son Muhammad-Hajji stood with his people until the fall of Sogratl.',
      gameplayLinkTab: 'sim_epilogue',
      gameplayLinkLabelRu: 'Открыть главу «Малого газавата» 1877 года в Эпилоге →',
      gameplayLinkLabelEn: 'Open the 1877 “Lesser Ghazawat” Chapter in Epilogue →',
      accentColor: '#f59e0b',
      svgBadgeText: 'SOGRATL • 1877 EPILOGUE'
    },
    {
      id: 'ex_safarov_engineer',
      gallery: 'portraits',
      imageUrl: 'Portrait_Hadji_Yusuf_Safarov_1845.jpg',
      titleRu: 'Полковник Хаджи-Юсуф Сафаров (Юсуф-бек) — Главный инженер Имамата',
      titleEn: 'Col. Hajji Yusuf Safarov (Yusuf-Bek) — Chief Siege Engineer of the Imamate',
      subtitleRu: 'Выпускник инженерной школы Ибрагим-паши в Каире, строитель бастионов Гергебиля и Чоха',
      subtitleEn: 'Graduate of Ibrahim Pasha’s Cairo Military School, Builder of Gergebil & Chokh',
      archiveRef: 'Глава 15 и 19 • РГВИА Ф. 846 (ВУА) • Чертежи полковника Д. А. Милютина',
      descRu:
        'Чеченец из аула Алды, служивший офицером в Египте и вернувшийся к Шамилю в 1840 г. Внедрил зигзагообразные траншеи, 3-слойные дубовые блиндажи и акустический пеленг сапёрных подкопов медным тазом с водой.',
      descEn:
        'Chechen officer trained in Egypt who joined Shamil in 1840. Introduced angled traverses, 3-layer oak blindages, and acoustic detection of enemy sapper tunnels using a water-filled copper basin.',
      gameplayLinkTab: 'siege',
      gameplayLinkLabelRu: 'Испытать медный таз Сафарова в осаде →',
      gameplayLinkLabelEn: 'Test Safarov’s Copper Basin in Siege →',
      accentColor: '#38bdf8',
      svgBadgeText: 'SAFAROV • 1847'
    },
    {
      id: 'ex_michik_1855_jamaluddin',
      gallery: 'portraits',
      imageUrl: 'KeyArt_Michik_1855_Jamaluddin_Exchange.jpg',
      titleRu: 'Размен на реке Мичик 10 марта 1855 г.: Возвращение поручика Джамалуддина',
      titleEn: 'Prisoner Exchange on the Michik River (March 10, 1855): Return of Lt. Jamaluddin',
      subtitleRu: 'Батальное полотно (16:9 Key Art): встреча конницы Имамата и офицеров Кавказского корпуса',
      subtitleEn: 'Historical Key Art (16:9): Imam Shamil’s Horsemen Meeting Caucasian Corps Officers',
      archiveRef: 'Глава 18 и 29 • АКАК, т. XI • Мемуары Е. А. Вердеревского и А. Руновского',
      descRu:
        'На каменистом броде пограничной реки Мичик у Куринского укрепления 10 (22) марта 1855 г. состоялся исторический размен: семьи княгинь Чавчавадзе и Орбелиани были возвращены в обмен на старшего сына Шамиля — поручика российского уланского полка Джамалуддина, выданного аманатом при штурме Ахульго в 1839 г.',
      descEn:
        'At the stony ford of the Michik River near Fort Kurinskoye on March 10 (22), 1855, Princesses Chavchavadze and Orbeliani were exchanged for Shamil’s elder son, Lieutenant Jamaluddin of the Russian Imperial Ulans—who had been surrendered as a hostage at Akhulgo in 1839.',
      gameplayLinkTab: 'crises',
      gameplayLinkLabelRu: 'Перейти к развилке обмена на р. Мичик (1855) →',
      gameplayLinkLabelEn: 'Open the 1855 Michik River Exchange Crisis →',
      accentColor: '#a3e635',
      svgBadgeText: 'MICHIK RIVER • MARCH 1855'
    },
    {
      id: 'ex_ghazi_muhammad_karata',
      gallery: 'portraits',
      imageUrl: 'Portrait_Ghazi_Muhammad_Karata_1845.jpg',
      titleRu: 'Гази-Мухаммад (Кази-Магома), сын Имама Шамиля и наиб Карата',
      titleEn: 'Ghazi-Muhammad (Kazi-Magoma), Son of Imam Shamil & Naib of Karata',
      subtitleRu: 'Преемник престола Имамата, предводитель конного похода на Цинандали (1854)',
      subtitleEn: 'Designated Heir of the Imamate & Commander of the 1854 Tsinandali Raid',
      archiveRef: 'Глава 18 и 26 • Прижизненный фотопортрет из альбома Кавказского наместничества',
      descRu:
        'Средний сын Шамиля, назначенный наибом стратегического общества Карата в 1850 г. и провозглашённый наследником Имамата на съезде в Анди. В 1854 г. совершил стремительный рейд за Алазань, захватив усадьбу князя Д. И. Чавчавадзе для выкупа своего старшего брата Джамалуддина.',
      descEn:
        'Shamil’s second son, appointed Naib of strategic Karata in 1850 and proclaimed heir at the Council of Andia. In 1854 he led the lightning cavalry raid across the Alazani to secure the release of his elder brother Jamaluddin.',
      gameplayLinkTab: 'map',
      gameplayLinkLabelRu: 'Открыть Каратинское наибство на карте →',
      gameplayLinkLabelEn: 'Inspect Karata Naibate on Map →',
      accentColor: '#f59e0b',
      svgBadgeText: 'GHAZI-MUHAMMAD • KARATA'
    },
    {
      id: 'ex_kibit_magoma_teletl',
      gallery: 'portraits',
      imageUrl: 'Portrait_Kibit_Magoma_Teletl_1845.jpg',
      titleRu: 'Мудир Кибит-Магома Телетлинский (Кади Магома из Телетля)',
      titleEn: 'Mudir Kibit-Magoma of Teletl (Qadi Muhammad of Teletl)',
      subtitleRu: 'Влиятельнейший кадий и мудир Нагорного Дагестана, хранитель неприступного Телетля',
      subtitleEn: 'Preeminent Qadi & Mudir of Highland Dagestan, Guardian of Fortress Teletl',
      archiveRef: 'Глава 05 и 26 • Хроника Мухаммед-Тахира аль-Карахи • Фотография 1860-х гг.',
      descRu:
        'Алим и полководец из аула Телетль, самостоятельно правивший обширным округом в среднем Дагестане до объединения с Шамилем. На груди черкески — серебряный орден мудира кубачинской работы с чернью и арабской вязью.',
      descEn:
        'Scholar and commander of Aul Teletl who governed a vast district in central Dagestan. On his cherkesska sits an authentic Kubachi silver-niello Mudir medallion inscribed in Arabic.',
      gameplayLinkTab: 'map',
      gameplayLinkLabelRu: 'Открыть округ Телетля и Андалала →',
      gameplayLinkLabelEn: 'Inspect Teletl & Andalal District →',
      accentColor: '#eab308',
      svgBadgeText: 'KIBIT-MAGOMA • TELETL'
    },
    {
      id: 'ex_talkhig_shali_mudir',
      gallery: 'portraits',
      imageUrl: 'Portrait_Talkhig_Shali_1845.jpg',
      titleRu: 'Мудир Талхиг Шалинский — командующий артиллерией и конницей Малой Чечни',
      titleEn: 'Mudir Talkhig of Shali — Commander of Lesser Chechnya Cavalry & Artillery',
      subtitleRu: 'Мастер маневренной обороны предгорных просек и лесных завалов на Гойте и Аргуне',
      subtitleEn: 'Master of Mobile Abatis Defense Along the Goita & Argun Forest Clearings',
      archiveRef: 'Глава 05, 17 и 26 • Прижизненный фотопортрет мудира Талхига (Шали / Ведено)',
      descRu:
        'Один из самых дальновидных чеченских мудиров Шамиля, организовавший систему конных пикетов, сигнальных башен и подвижных орудийных батарей против зимних вырубок генерала Барятинского.',
      descEn:
        'One of Shamil’s most farsighted Chechen mudirs, who organized mobile horse artillery batteries and watchtower cordons against General Baryatinsky’s winter forest clearings.',
      gameplayLinkTab: 'crises',
      gameplayLinkLabelRu: 'Перейти к обороне Шалинской просеки (1850) →',
      gameplayLinkLabelEn: 'Open Defense of the Shali Clearing (1850) →',
      accentColor: '#22c55e',
      svgBadgeText: 'MUDIR TALKHIG • SHALI'
    },
    {
      id: 'ex_daniyal_bek_elisu',
      gallery: 'portraits',
      imageUrl: 'Portrait_Daniyal_Bek_Irib_1845.jpg',
      titleRu: 'Султан Даниял-бек Илисуйский — мудир Ириба и Южного Дагестана',
      titleEn: 'Sultan Daniyal-Bek of Elisu — Mudir of Irib & Southern Dagestan',
      subtitleRu: 'Владетельный султан Илису и генерал-майор, перешедший под знамёна Имамата в 1844 г.',
      subtitleEn: 'Ruling Sultan of Elisu & Major General Who Joined the Imamate in 1844',
      archiveRef: 'Глава 05, 16 и 26 • АКАК, т. IX–X • Прижизненный портрет из тифлисского собрания',
      descRu:
        'Бывший владетель Илисуйского султаната, привнесший в Диван-хану опыт регулярного штабного управления и дипломатические связи с Закавказьем и Османской Портой. Тесть Гази-Мухаммада.',
      descEn:
        'Former ruler of the Elisu Sultanate who brought regular staff administration and Transcaucasian diplomatic networks to the Divan-Khana; father-in-law of Ghazi-Muhammad.',
      gameplayLinkTab: 'map',
      gameplayLinkLabelRu: 'Открыть Южный Дагестан и Ириб на карте →',
      gameplayLinkLabelEn: 'Inspect Irib & Southern Dagestan on Map →',
      accentColor: '#c084fc',
      svgBadgeText: 'DANIYAL-BEK • ELISU & IRIB'
    },
    {
      id: 'ex_muhammad_amin_circassia',
      gallery: 'portraits',
      imageUrl: 'Portrait_Ismail_Chapar_1845.jpg',
      titleRu: 'Наиб Мухаммад-Амин (Асиялов) и гонец-чапар Исмаил (Черкесия / Ведено)',
      titleEn: 'Naib Muhammad-Amin (Asiyalov) — Shamil’s Viceroy in Circassia & the Black Sea Coast',
      subtitleRu: 'Создатель Меджлиса и судов Махкама среди адыгских обществ Западного Кавказа (1848–1859)',
      subtitleEn: 'Founder of the Circassian Majlis & Mahkama Courts on the Western Caucasus Coast (1848–1859)',
      archiveRef: 'Глава 05 и 23 • Османский архив BOA • Гравюра и портрет 1850-х гг.',
      descRu:
        'Уроженец аула Гонода, направленный Шамилем в 1848 г. к черкесским племенам за Кубанью. Учредил укреплённые мухаafизские посты, собирал ополчение шапсугов и абадзехов и координировал приём турецких фелук с порохом.',
      descEn:
        'Native of Aul Gonoda dispatched by Shamil in 1848 to the Circassian tribes beyond the Kuban. Established Mahkama courts and coordinated Black Sea gunpowder feluccas from Trabzon.',
      gameplayLinkTab: 'diplomacy',
      gameplayLinkLabelRu: 'Открыть дипломатию с Портой и Трапезундом →',
      gameplayLinkLabelEn: 'Open Sublime Porte & Trabzon Diplomacy →',
      accentColor: '#38bdf8',
      svgBadgeText: 'MUHAMMAD-AMIN • CIRCASSIA'
    },
    {
      id: 'ex_prince_vorontsov_1845',
      gallery: 'portraits',
      imageUrl: 'Portrait_Vorontsov_1845.jpg',
      titleRu: 'Князь Михаил Семёнович Воронцов — Наместник Кавказский и Главнокомандующий (1844–1854)',
      titleEn: 'Prince Mikhail Semyonovich Vorontsov — Viceroy of the Caucasus & Commander-in-Chief (1844–1854)',
      subtitleRu: 'Главный стратегический оппонент Шамиля в Даргинском походе (1845) и осадах Гергебиля и Салты (1847)',
      subtitleEn: 'Shamil’s Principal Strategic Adversary in the Dargo Expedition (1845) and Sieges of 1847',
      archiveRef: 'Глава 13, 15 и 17 • Архив князя Воронцова (АКВ) • Парадный портрет Ф. Крюгера',
      descRu:
        'Фельдмаршал и светлейший князь, возглавивший в 1845 г. поход на Дарго, а после тяжелейших потерь в Ичкерийском лесу перешедший к планомерной осаде горных твердынь и прорубке широких лесных просек.',
      descEn:
        'Field Marshal and Viceroy who led the 1845 expedition to Dargo and subsequently shifted Imperial strategy toward methodical siege warfare and systematic forest clearing.',
      gameplayLinkTab: 'crises',
      gameplayLinkLabelRu: 'Перейти к развилке Сухарной экспедиции в Дарго (1845) →',
      gameplayLinkLabelEn: 'Open the 1845 Dargo Biscuit Expedition Crisis →',
      accentColor: '#f43f5e',
      svgBadgeText: 'PRINCE VORONTSOV • 1845'
    },
    // 2. ОРУЖЕЙНАЯ ПАЛАТА И ОРДЕНА ИМАМАТА (ARMORY, METALLURGY & ORDERS — Гл. 02, 03, 04)
    {
      id: 'ex_bazalai_gurda',
      gallery: 'armory_orders',
      imageUrl: 'Armory_Bazalai_Dagger_Gazyr_Showcase_1845.jpg',
      titleRu: 'Булатный кинжал старого Базалая (Казанище) и шашка «Гурда»',
      titleEn: 'Damascus Kama Dagger of Old Bazalai (Kazanishche) & “Gurda” Shashka',
      subtitleRu: 'Эталон кавказской металлургии XIX века и холодного оружия мюридов',
      subtitleEn: 'Pinnacle of 19th-Century Caucasian Metallurgy & Close-Combat Steel',
      archiveRef: 'Глава 03 • Государственный исторический музей (ГИМ) • Кавказский арсенал',
      descRu:
        'Клинки кузнецов династии Базалая из Казанища и Чиркея ковались из многослойной сварочной стали с глубокими асимметричными долами, пробивавшими сукно и кольчугу. При исчерпании 18 газырей дают +35% к натиску в рукопашной.',
      descEn:
        'Blades forged by the Bazalai dynasty of Kazanishche and Chirkey used pattern-welded Damascus steel with deep fullers capable of piercing mail. Grants +35% shock in melee when 18 gazyrs are depleted.',
      gameplayLinkTab: 'arsenal',
      gameplayLinkLabelRu: 'Открыть литейный двор и кузницы в Арсенале Ведено →',
      gameplayLinkLabelEn: 'Open Foundry & Smithies in Vedeno Arsenal →',
      accentColor: '#10b981',
      svgBadgeText: 'BAZALAI & GURDA STEEL'
    },
    {
      id: 'ex_shamil_silver_orders',
      gallery: 'armory_orders',
      imageUrl: 'Orders_Shamil_Kubachi_Showcase_1845.jpg',
      titleRu: 'Подлинные ордена и знаки отличия в Имамате Шамиля (XIX век)',
      titleEn: 'Authentic Orders & Insignia of Shamil’s Imamate (19th Century)',
      subtitleRu: 'Серебро, медь, позолота, гравировка и чеканка • Нац. музей РД им. А. Тахо-Годи',
      subtitleEn: 'Silver, copper, gilding, engraving & chasing • National Museum of Dagestan',
      archiveRef: 'Глава 02 и 06 • Национальный музей Республики Дагестан им. А. Тахо-Годи (фото: Ashab, CC BY-SA 4.0)',
      descRu:
        'Витрина из 25 подлинных наградных знаков Имамата: выпуклые позолоченные медальоны с умбонами, крупные восьмилепестковые фестончатые звёзды мудиров, круглый знак с выгравированной шашкой, прорезные розетки, серебряный полумесяц «хиляль» и чеканные диски-медали с арабской вязью для нашивки на черкеску.',
      descEn:
        'A museum display of 25 authentic Imamate decorations: domed gilt medallions with filigree bosses, grand 8-lobed scalloped Mudir stars, round shashka-engraved discs, pierced rosettes, a silver “hilal” crescent badge, and chased Arabic-inscribed plates sewn onto the Circassian coat.',
      gameplayLinkTab: 'diplomacy',
      gameplayLinkLabelRu: 'Наградить наибов подлинными орденами →',
      gameplayLinkLabelEn: 'Award Authentic Orders to Naibs →',
      accentColor: '#fbbf24',
      svgBadgeText: 'TAKHO-GODI MUSEUM • 25 ORDERS'
    },
    {
      id: 'ex_vedeno_unicorn_cannon',
      gallery: 'armory_orders',
      imageUrl: 'KeyArt_Vedeno_Foundry_and_PowderMill_1846.jpg',
      titleRu: 'Горный медный единорог литья устаза Джабраила (Ведено, 1846–1858 гг.)',
      titleEn: 'Mountain Bronze Unicorn Cannon Cast by Ustaz Jabrail (Vedeno, 1846–1858)',
      subtitleRu: 'Собственная артиллерия Имамата и двухъярусные селитренные варницы Гуниба',
      subtitleEn: 'Indigenous Imamate Artillery & Two-Tiered Saltpeter Works of Gunib',
      archiveRef: 'Глава 03 и 04 • Военно-исторический музей артиллерии (СПб)',
      descRu:
        'В столице Дарго-Ведено под руководством устаза Джабраила и беглых мастеровых переплавляли трофейную медь и чугунные ядра в лёгкие горные орудия, снабжаемые порохом с водяных мельниц реки Ахк-Таш.',
      descEn:
        'At the Dargo-Vedeno foundry, Ustaz Jabrail smelted captured bronze and iron into lightweight mountain guns supplied with black powder from water-powered stamp mills along the Ahk-Tash River.',
      gameplayLinkTab: 'arsenal',
      gameplayLinkLabelRu: 'Отлить горные орудия в Арсенале Ведено →',
      gameplayLinkLabelEn: 'Cast Mountain Guns in Vedeno Arsenal →',
      accentColor: '#f97316',
      svgBadgeText: 'VEDENO FOUNDRY • 1848'
    },
    // 3. ВОЕННО-ТОПОГРАФИЧЕСКИЕ ПЛАНЫ ОСАД (TOPOGRAPHICAL SIEGE MAPS — Гл. 11, 13, 15, 28)
    {
      id: 'ex_map_akhulgo_1839',
      gallery: 'topographic_maps',
      imageUrl: 'Diorama_Siege_TopDown_Salty_1847.jpg',
      titleRu: 'Военно-топографический план осады Старого и Нового Ахульго (Июнь–Август 1839 г.)',
      titleEn: 'Military-Topographical Plan of the Siege of Old & New Akhulgo (June–Aug 1839)',
      subtitleRu: 'По съёмке Генерального штаба кап. Д. А. Милютина (РГВИА Ф. 846, Оп. 16)',
      subtitleEn: 'Surveyed by General Staff Capt. D. A. Milyutin (RGVIA Fond 846, Op. 16)',
      archiveRef: 'Глава 11 и 28 • Карта `tactical_ahulgo_citadel_hm16.r16` (2017×2017 SRTM)',
      descRu:
        'Двойной скальный полуостров в излучине Андийского Койсу и ущелье реки Ашильта. Сурхаева башня на господствующей вершине выдержала огонь 42 орудий генерала П. Х. Граббе благодаря мёртвой зоне обрыва (47°).',
      descEn:
        'Twin cliff peninsula encircled by the Andi Koisu river bend and Ashilta gorge. Surkhay’s Tower atop the dominant crag withstood 42 guns of Gen. Grabbe thanks to the 47° cliff dead zone.',
      gameplayLinkTab: '3d_tactical',
      terrainId3D: 'akhulgo_1839',
      gameplayLinkLabelRu: 'Загрузить 3D-разрез скалы Ахульго (1839) →',
      gameplayLinkLabelEn: 'Load 3D Cutaway of Mount Akhulgo (1839) →',
      accentColor: '#a855f7',
      svgBadgeText: 'AKHULGO 1839 • RGVIA MAP'
    },
    {
      id: 'ex_map_salty_gergebil_1847',
      gallery: 'topographic_maps',
      imageUrl: 'Diorama_Siege_Cutaway_Blindage_1847.jpg',
      titleRu: 'Инженерный чертёж подземных блиндажей и минных галерей Салты и Чоха (1847–1849 гг.)',
      titleEn: 'Engineering Blueprint of Subterranean Blindages & Sap Galleries at Salty & Chokh (1847–1849)',
      subtitleRu: 'Классическая подземная и контрминная оборона Хаджи-Юсуфа Сафарова против кн. Воронцова',
      subtitleEn: 'Hajji Yusuf Safarov’s Subterranean & Counter-Mine Defense Against Prince Vorontsov',
      archiveRef: 'Глава 15 и 28 • Карта `tactical_salti_siege_hm16.r16` (2017×2017 SRTM)',
      descRu:
        'Показывает расположение русских осадных параллелей, сапёрных подкопов под южную башню и встречных контрминных рукавов горцев с акустическим постом медного таза.',
      descEn:
        'Illustrates the layout of Russian siege parallels, sapper mine tunnels beneath the southern tower, and highland counter-mine galleries guided by copper-basin acoustic sonar.',
      gameplayLinkTab: '3d_tactical',
      terrainId3D: 'salty_1847',
      gameplayLinkLabelRu: 'Загрузить 3D-разрез осады Салты (1847) →',
      gameplayLinkLabelEn: 'Load 3D Cutaway of Salty Siege (1847) →',
      accentColor: '#ec4899',
      svgBadgeText: 'SALTY & CHOKH • 1847–1849'
    },
    {
      id: 'ex_map_dargo_spline_1845',
      gallery: 'topographic_maps',
      imageUrl: 'Diorama_Ichkeria_Forest_Ambush_1845.jpg',
      titleRu: 'Маршрутная карта «Сухарной экспедиции» с хребта Речель к Дарго (10–11 июля 1845 г.)',
      titleEn: 'Route Map of the “Biscuit Expedition” from Rechel Ridge to Dargo (July 10–11, 1845)',
      subtitleRu: '12 контрольных точек сплайна AForestSplineAmbushController в вековом буковом лесу',
      subtitleEn: '12 Spline Control Points of AForestSplineAmbushController in Ancient Beech Forest',
      archiveRef: 'Глава 13 и 28 • Карта `tactical_dargo_ichkeria_hm16.r16` (2017×2017 SRTM)',
      descRu:
        'Схема пятиверстового лесного коридора в Ичкерии, где чеченские и андийские мюриды перерезали растянутую колонну генералов Клугенау, Викторова и Пассека завалами из подрубленных буков.',
      descEn:
        'Diagram of the 5-verst Ichkeria forest defile where Chechen and Andi murids severed the overextended column of Generals Klugenau, Viktorov, and Passek with felled beech abatis.',
      gameplayLinkTab: '3d_tactical',
      terrainId3D: 'dargo_1845',
      gameplayLinkLabelRu: 'Загрузить 3D-полигон хребта Речель и Дарго (1845) →',
      gameplayLinkLabelEn: 'Load 3D Arena of Rechel Ridge & Dargo (1845) →',
      accentColor: '#22c55e',
      svgBadgeText: 'DARGO SPLINE • 1845'
    },
    // 4. СВОД ПЕРВОИСТОЧНИКОВ (PRIMARY SOURCES & 30-CHAPTER CODEX — Гл. 01, 10, 22, 23, 25)
    {
      id: 'ex_source_al_karakhi',
      gallery: 'primary_sources',
      imageUrl: 'Archive_Arabic_Chronicle_AlQarakhi_1845.jpg',
      titleRu: 'Подлинное письмо Имама Шамиля № 68 (ИИАЭ ДФИЦ РАН) и хроника аль-Карахи «Блеск дагестанских шашек»',
      titleEn: 'Authentic Letter of Imam Shamil No. 68 (IIAE RAN) & Chronicle of al-Qarakhi “The Shining of Dagestani Sabers”',
      subtitleRu: '«من أمير المؤمنين شمويل إلى الإخوان الأحبة الحاج علي العسكري وعلي محمد والحاج نصر الله...» (8 джумада ал-ахира 1268 г. х.)',
      subtitleEn: '“From Commander of the Faithful Shamil (Shamwil) to the Beloved Brethren Hajji Ali al-Askari, Ali Muhammad & Hajji Nasrullah...” (1268 AH)',
      archiveRef: 'Глава 01, 10, 25 и 31 • Рукописный фонд ИИАЭ ДФИЦ РАН (Х. А. Омаров, «100 писем Шамиля», № 68)',
      descRu:
        'На левой странице кодекса воспроизведён буква в букву подлинник письма Шамиля № 68 из Рукописного фонда ИИАЭ ДФИЦ РАН (изд. Х. А. Омарова, 1997): «بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ. مِنْ أَمِيرِ الْمُؤْمِنِينَ شَمْوِيلَ إِلَى الْإِخْوَانِ الْأَحِبَّةِ الْحَاجِّ عَلِيٍّ الْعَسْكَرِيِّ وَعَلِيٍّ مُحَمَّدٍ وَالْحَاجِّ نَصْرِ اللَّهِ سَلَامٌ عَلَيْكُمْ أَمَّا بَعْدُ: فَقَدْ أَتَانَا خِيَارُ جُرْكِي سَائِلِينَ مِنَّا أَمْرًا أَهَمَّ مِنْ بِنَاءِ قَرْيَتِهِمْ فِي جَبَلٍ مِنْ جِبَالِهِمْ وَإِنِّي فِي تَرَدُّدٍ وَوَسْوَسَةٍ عَظِيمَةٍ فِي حَقِّهِ فَنَأْمُرُكُمْ أَنْ تَسْتَخِيرُوا مِنْ صَمِيمِ الْفُؤَادِ فِي حَقِّهِ بِالْإِحْكَامِ وَالِاحْتِيَاطِ وَالِاجْتِهَادِ فَإِنَّهُ تَأْسِيسُ أَمْرٍ عَظِيمٍ هَذَا وَالسَّلَامُ. يَوْمُ الْإِثْنَيْنِ ٨ جُمَادَى الْآخِرَةِ سَنَةَ ١٢٦٨ هـ». На правой странице — титул хроники аль-Карахи и подлинная печать «عَبْدُهُ شَمْوِيلُ ١٢٦٦ هـ».',
      descEn:
        'The left page reproduces verbatim Imam Shamil’s authentic archival Letter No. 68 from the IIAE DFIC RAN Manuscript Fund (ed. Kh. A. Omarov, “100 Letters of Shamil”, 1997) addressed to Hajji Ali al-Askari, Ali Muhammad, and Hajji Nasrullah regarding the founding of the Chirkey mountain settlement (8 Jumada al-Akhira 1268 AH / March 30, 1852). The right page displays al-Qarakhi’s chronicle title and Shamil’s signet seal (“His servant Shamwil, 1266 AH”).',
      gameplayLinkTab: 'chronicle',
      gameplayLinkLabelRu: 'Открыть летопись Мухаммед-Тахира аль-Карахи →',
      gameplayLinkLabelEn: 'Open Chronicle of Muhammad-Tahir al-Qarakhi →',
      accentColor: '#eab308',
      svgBadgeText: 'SHAMIL LETTER №68 • 1268 AH'
    },
    {
      id: 'ex_source_donogo_rgvia',
      gallery: 'primary_sources',
      imageUrl: 'Diplomacy_Trabzon_Felucca_Smuggling_1846.jpg',
      titleRu: 'Труды проф. Х. М. Доного, Акты Кавказской археографической комиссии (АКАК) и Османский архив BOA',
      titleEn: 'Works of Prof. Kh. M. Donogo, Acts of the Caucasian Archaeographic Commission (AKAK) & Ottoman BOA',
      subtitleRu: 'Синтез трёх архивных традиций в 31 главе папки 01_Исторический_архив/ (2.23 МБ)',
      subtitleEn: 'Synthesis of Three Archival Traditions Across 31 Chapters in 01_Исторический_архив/ (2.23 MB)',
      archiveRef: 'Главы 00–30 • РГВИА (Москва), ЦГИА Грузии (Тбилиси), BOA (Стамбул, фонды İ.DH и A.MKT)',
      descRu:
        'Каждая механика игры — от весов алчности наибов и 18 газырей до калужских дневников полковника А. И. Руновского и приёма Шамиля султаном Абдул-Азизом в Долмабахче (1869) — опирается на перекрёстную проверку трёх групп документов.',
      descEn:
        'Every game mechanic—from Naib greed weights and 18 gazyrs to Col. Runovsky’s Kaluga diaries and Sultan Abdülaziz’s 1869 reception at Dolmabahçe—is cross-verified across all three archival corpora.',
      gameplayLinkTab: 'sim_epilogue',
      gameplayLinkLabelRu: 'Перейти к Эпилогу 1859–1877 гг. и Валидатору →',
      gameplayLinkLabelEn: 'Jump to 1859–1877 Epilogue & Validator →',
      accentColor: '#6366f1',
      svgBadgeText: '31 CHAPTERS • 2.23 MB ARCHIVE'
    }
  ];

// ============================================================================
// СПРИНТ 19 (M19): СИМУЛЯТОР ДИПЛОМАТИЧЕСКИХ ДЕПЕШ И ПЕРЕГОВОРОВ (ГЛАВЫ 01, 09, 14, 17, 23 • BOA & РГВИА)
// ============================================================================
export const DIPLOMATIC_DISPATCHES_ARCHIVE = [
    {
      id: 'disp_sultan_abdulmejid_1853',
      year: '1853',
      imageUrl: 'Diplomacy_Trabzon_Felucca_Smuggling_1846.jpg',
      actors: [
        { key: 'Шамиль', nameRu: 'Имам Шамиль', nameEn: 'Imam Shamil', color: '#f59e0b' },
        { key: 'Мухаммад-Амин', nameRu: 'Наиб Мухаммад-Амин', nameEn: 'Naib Muhammad-Amin', color: '#38bdf8' }
      ],
      recipientRu: 'Султан Абдул-Меджид I и сераскир Риза-паша (Стамбул, Высокая Порта)',
      recipientEn: 'Sultan Abdülmejid I & Serasker Riza Pasha (Istanbul, Sublime Porte)',
      routeRu: 'Морской маршрут: Ведено → Шапсугия → фелука контрабандистов в Трапезунд → Стамбул',
      routeEn: 'Maritime Route: Vedeno → Circassian Coast → Trebizond Smuggler Felucca → Istanbul',
      archiveCipher: 'Османский архив BOA (Стамбул), фонд İ.DH. 284/17852 • Глава 01 и 23',
      arabicHeader: 'إلى حضرة السلطان عبد المجيد خان الغازي',
      excerptRu:
        '«От эмира правоверных Шамиля в столицу Халифата. Двадцать лет наши наибы держат оборону на скалах Дагестана и в буковых лесах Ичкерии. Мы просим Высокую Порту прислать через Трапезунд штуцерный порох, английские капсюли и подтвердить фирман Сердар-ы Экрема...»',
      excerptEn:
        '“From the Commander of the Faithful Shamil to the seat of the Caliphate. For twenty years our Naibs have held the crags of Dagestan and the beech forests of Ichkeria. We petition the Sublime Porte to dispatch rifled powder and percussion caps via Trebizond and ratify the Firman of Serdar-ı Ekrem...”',
      baseFeasibility: 48,
      blockadeSeverity: 42,
      preferredTone: 'protocol',
      rewards: {
        gunpowder: 45,
        silver: 60,
        provisions: 0,
        authority: 6,
        ottomanSupport: 14,
        stressDelta: -6,
        pressureRelief: 0
      },
      effectSummaryRu: '+45 пуд. пороха из Трапезунда, +60 руб. серебром, +14% поддержка Порты, +6 Авторитет',
      effectSummaryEn: '+45 poods Trebizond powder, +60 silver rub., +14% Porte Support, +6 Authority'
    },
    {
      id: 'disp_michik_jamaluddin_1855',
      year: '1855',
      imageUrl: 'KeyArt_Michik_1855_Jamaluddin_Exchange.jpg',
      actors: [
        { key: 'Шамиль', nameRu: 'Имам Шамиль', nameEn: 'Imam Shamil', color: '#f59e0b' },
        { key: 'Гази-Мухаммад', nameRu: 'Гази-Мухаммад', nameEn: 'Ghazi-Muhammad', color: '#a3e635' }
      ],
      recipientRu: 'Генерал-адъютант барон Л. П. Николаи и князь Д. И. Чавчавадзе (р. Мичик у кр. Куринской)',
      recipientEn: 'Adjutant General Baron L. P. Nicolay & Prince D. I. Chavchavadze (Michik River, Kurin Fort)',
      routeRu: 'Сухопутный парламентёрский коридор: Ведено → Майртуп → берег реки Мичик (10 марта 1855 г.)',
      routeEn: 'Overland Parley Corridor: Vedeno → Mayrtup → Michik River Crossing (March 10, 1855)',
      archiveCipher: 'РГВИА, ф. 846 (ВУА), д. 6588 • Мемуары А. Л. Зиссермана и А. И. Руновского • Глава 17',
      arabicHeader: 'معاهدة الفداء على نهر ميتشيك — عودة جمال الدين',
      excerptRu:
        '«Условия обмена на реке Мичик 10 (22) марта 1855 года: возвращение старшего сына имама поручика Джемалуддина (взятого аманатом при штурме Ахульго в 1839 г.), 16 пленных мюридов и 40 000 рублей серебром в обмен на княгинь А. И. Чавчавадзе и В. И. Орбелиани...»',
      excerptEn:
        '“Terms of the Michik River Exchange on March 10 (22), 1855: restoration of the Imam’s eldest son Lt. Jamaluddin (taken hostage at Akhulgo in 1839), 16 captive murids, and 40,000 silver rubles in exchange for Princesses Anna Chavchavadze and Varvara Orbeliani...”',
      baseFeasibility: 64,
      blockadeSeverity: 18,
      preferredTone: 'conciliatory',
      rewards: {
        gunpowder: 15,
        silver: 120,
        provisions: 80,
        authority: 8,
        ottomanSupport: 4,
        stressDelta: -14,
        pressureRelief: 6
      },
      effectSummaryRu: '+120 руб. серебром в Байт аль-маль, -14% Нагрузка Имама (возвращение сына), +8 Авторитет',
      effectSummaryEn: '+120 silver rub. to Bayt al-Mal, -14% Imam Strain (son’s return), +8 Authority'
    },
    {
      id: 'disp_anatolian_muhajir_1854',
      year: '1854',
      imageUrl: 'Archive_Arabic_Chronicle_AlQarakhi_1845.jpg',
      actors: [
        { key: 'Даниял-бек', nameRu: 'Султан Даниял-бек', nameEn: 'Sultan Daniyal-Bek', color: '#c084fc' },
        { key: 'Гази-Мухаммад', nameRu: 'Наиб Гази-Мухаммад', nameEn: 'Naib Ghazi-Muhammad', color: '#f59e0b' }
      ],
      recipientRu: 'Мушир Анатолийской армии Абди-паша и наиб Западного Кавказа Мухаммад-Амин (Карс / Эрзурум)',
      recipientEn: 'Anatolian Mushir Abdi Pasha & Western Caucasus Naib Muhammad-Amin (Kars / Erzurum)',
      routeRu: 'Тайная горная тропа: Ведено → Закаталы → Ахалцихский хребет → Карс',
      routeEn: 'Clandestine Ridge Path: Vedeno → Zaqatala → Akhaltsikhe Range → Kars',
      archiveCipher: 'Османский архив BOA, фонд A.MKT.UM • АКАК, т. XI • Глава 01 и 17',
      arabicHeader: 'رسالة إلى مشير جيش الأناضول في قارص',
      excerptRu:
        '«Конница Гази-Мухаммада спустилась с Главного хребта в Алазанскую долину, оттянув полки князя Андроникова. Требуем немедленного выдвижения анатолийских таборов к Ахалциху и высылки каравана селитры и свинца...»',
      excerptEn:
        '“Ghazi-Muhammad’s cavalry has descended the Main Range into the Alazani Valley, drawing off Prince Andronikov’s regiments. We demand an immediate advance of Anatolian battalions toward Akhaltsikhe and a caravan of nitre and lead...”',
      baseFeasibility: 44,
      blockadeSeverity: 38,
      preferredTone: 'ultimatum',
      rewards: {
        gunpowder: 50,
        silver: 30,
        provisions: 60,
        authority: 5,
        ottomanSupport: 10,
        stressDelta: -4,
        pressureRelief: 8
      },
      effectSummaryRu: '+50 пуд. селитры и пороха, -8% натиск генералов РИ на флангах, +10% поддержка Порты',
      effectSummaryEn: '+50 poods nitre & powder, -8% Imperial pressure on flanks, +10% Porte Support'
    },
    {
      id: 'disp_kabarda_manifesto_1846',
      year: '1846',
      imageUrl: 'Crisis_Kabarda_Tatartup_1846.jpg',
      actors: [
        { key: 'Шамиль', nameRu: 'Имам Шамиль', nameEn: 'Imam Shamil', color: '#f59e0b' },
        { key: 'Хаджи-Мурат', nameRu: 'Наиб Хаджи-Мурат', nameEn: 'Naib Hadji Murad', color: '#ef4444' }
      ],
      recipientRu: 'Князья, уорки и уздени Большой и Малой Кабарды и обществ за Тереком (Нальчик / Сунжа)',
      recipientEn: 'Princes, Workhs & Uzdens of Greater & Lesser Kabarda Beyond the Terek (Nalchik / Sunzha)',
      routeRu: 'Конный прорыв муртазеков: Дарго-Ведено → Гехи → переправа через Терек у минарета Татартуп',
      routeEn: 'Murtazek Cavalry Breakthrough: Dargo-Vedeno → Gekhi → Terek Crossing at Tatartup Minaret',
      archiveCipher: 'РГВИА, ф. ВУА, д. 6492 • Хроника аль-Карахи (Гл. «Поход в Кабарду») • Глава 14',
      arabicHeader: 'منشور الإمام شامل إلى أمراء وعلماء قباردا',
      excerptRu:
        '«С восьмиугольной печатью Шамиля: мы перешли Сунжу и Терек с сотнями муртазеков и орудиями Хаджи-Юсуфа. Разрушайте кордонные посты Военно-Грузинской дороги и соединяйтесь со знамёнами Диван-ханы...»',
      excerptEn:
        '“Bearing the Octagonal Signet of Shamil: we have crossed the Sunzha and Terek with Murtazek squadrons and Hajji-Yusuf’s cannon. Sever the Georgian Military Road cordons and rally to the banners of the Divan-Khana...”',
      baseFeasibility: 52,
      blockadeSeverity: 34,
      preferredTone: 'ultimatum',
      rewards: {
        gunpowder: 20,
        silver: 50,
        provisions: 140,
        authority: 9,
        ottomanSupport: 4,
        stressDelta: -5,
        pressureRelief: 12
      },
      effectSummaryRu: '-12% натиск РИ во всех наибствах, +140 четвертей провианта, +9 Авторитет Низама',
      effectSummaryEn: '-12% Imperial pressure across all Naibates, +140 quarters provisions, +9 Nizam Authority'
    },
    {
      id: 'disp_vorontsov_parley_1845',
      year: '1845',
      imageUrl: 'Diorama_Ichkeria_Forest_Ambush_1845.jpg',
      actors: [
        { key: 'Байсунгур', nameRu: 'Наиб Байсунгур', nameEn: 'Naib Baysungur', color: '#10b981' },
        { key: 'Воронцов', nameRu: 'Князь М. С. Воронцов', nameEn: 'Prince M. S. Vorontsov', color: '#f43f5e' }
      ],
      recipientRu: 'Главнокомандующий князь М. С. Воронцов и ген. В. О. Бебутов (лагерь в Ичкерии / Анди)',
      recipientEn: 'Commander-in-Chief Prince M. S. Vorontsov & Gen. V. O. Bebutov (Ichkeria / Andi Camp)',
      routeRu: 'Парламентёр с белым значком через буковые засеки Ичкерийского леса',
      routeEn: 'Truce Envoy Across the Beech Abatis of the Ichkeria Forest',
      archiveCipher: 'АКАК, т. X • Дневник ген. Г. И. Филипсона • Глава 13',
      arabicHeader: 'مذكرة ديوان خانة بشأن تبادل الأسرى في دارغو',
      excerptRu:
        '«Диван-хана предлагает трёхдневное перемирие для выноса раненых на перевалах Анди и обмена пленных офицеров Куринского полка на задержанных караванщиков с солью и серой...»',
      excerptEn:
        '“The Divan-Khana proposes a three-day truce on the Andi passes to recover the wounded and exchange captured officers of the Kurinsky Regiment for detained salt and sulfur caravan drivers...”',
      baseFeasibility: 68,
      blockadeSeverity: 15,
      preferredTone: 'protocol',
      rewards: {
        gunpowder: 30,
        silver: 45,
        provisions: 120,
        authority: 4,
        ottomanSupport: 0,
        stressDelta: -8,
        pressureRelief: 7
      },
      effectSummaryRu: '+30 пуд. пороха, +120 четв. провианта, -8% Нагрузка Имама, -7% натиск РИ',
      effectSummaryEn: '+30 poods powder, +120 quarters provisions, -8% Imam Strain, -7% Imperial pressure'
    }
  ];

// ============================================================================
// СПРИНТ 20 (M20): ЕДИНЫЙ КОМАНДНЫЙ ЦЕНТР ЗОЛОТОГО РЕЛИЗА v2.0 (MILESTONES M1–M20)
// ============================================================================
export const MILESTONES_M1_M20_SUMMARY = [
    { code: 'M1', cat: 'Archive', ru: 'Выгрузка 60 шагов исследования, 30 тематических глав + сводная энциклопедия (2.23 МБ)', en: '60-turn research extraction, 30 thematic chapters + master encyclopedia (2.23 MB)' },
    { code: 'M2', cat: 'Math/GDD', ru: 'Логистическая модель повиновения наибов P_exec, безгексовая 3D-топография и 12 GDD', en: 'Logistic Naib obedience model P_exec, hexless 3D topography & 12 GDD documents' },
    { code: 'M3', cat: 'Strategy', ru: 'Расширение карты до 10 наибств (DT_Naibates_1845) и декомпозиция FOrderProbabilityBreakdown', en: '10-Naibate strategic map (DT_Naibates_1845) & FOrderProbabilityBreakdown HUD' },
    { code: 'M4', cat: 'Bridge', ru: 'Двусторонний мост Стратегия ↔ Тактика (FTacticalBattleResult), онбординг 3 ходов и Словарь', en: 'Bidirectional Strategy ↔ Tactics bridge (FTacticalBattleResult), 3-turn onboarding & Glossary' },
    { code: 'M5', cat: 'Tactics', ru: 'Патронташ на 18 нагрудных газырей (UGazyrAmmunitionComponent), разрез Милютина и таз Сафарова', en: '18-gazyr chest bandolier (UGazyrAmmunitionComponent), Milyutin cutaway & Safarov copper basin' },
    { code: 'M6', cat: 'SRTM/MC', ru: '4 эшелона пороховых караванов (0/15/30/45 пуд.), 20 карт высот SRTM (2017×2017) и Монте-Карло', en: '4 gunpowder caravan tiers (0/15/30/45 poods), 20 SRTM heightmaps (2017×2017) & Monte Carlo' },
    { code: 'M7', cat: 'UE5.5 C++', ru: 'Проект Unreal Engine 5.5 (ImamatWargame.uproject), ADivanKhanaTablePawn и UImamatSaveGame', en: 'Unreal Engine 5.5 project (ImamatWargame.uproject), ADivanKhanaTablePawn & UImamatSaveGame' },
    { code: 'M8', cat: 'Pitch/ROI', ru: 'Страница магазина Steam (RU/EN), 20 тегов, телеметрия плейтеста и финансовая модель ($240k)', en: 'Steam Store Page (RU/EN), 20-tag matrix, playtest telemetry & $240k ROI financial model' },
    { code: 'M9', cat: 'Steamworks', ru: '12 достижений Steamworks (DT_SteamAchievements), VDF-манифесты и когортный отчёт (PASS 5/5)', en: '12 Steamworks achievements (DT_SteamAchievements), VDF configs & cohort KPI audit (PASS 5/5)' },
    { code: 'M10', cat: 'L10n/QA', ru: 'Двуязычная таблица локализации DT_ImamatLocalization_RU_EN и сертификат целостности PASS 7/7', en: 'Bilingual localization table DT_ImamatLocalization_RU_EN & master integrity certificate PASS 7/7' },
    { code: 'M11', cat: 'Bilingual', ru: '100% двуязычное покрытие всех 11 из 11 вкладок (RU / EN) и 60-сек Авто-тур для издателя', en: '100% bilingual coverage across all 11/11 tabs (RU / EN) & 60s Executive Publisher Auto-Tour' },
    { code: 'M12', cat: 'Audio/Mod', ru: 'Диегетический пульт WebAudio 2.0, Конструктор модов (Mod Builder) и интерактивный HTML Pitch Deck', en: 'Diegetic WebAudio 2.0 Mixer, Custom Scenario Mod Builder & Interactive HTML Pitch Deck' },
    { code: 'M13', cat: 'Replay/AI', ru: 'Хронограф аль-Карахи (SVG-реплей + экспорт AAR), 4 ИИ-доктрины генералов и 3 мода Workshop', en: 'Al-Qarakhi Chronograph (SVG replay + AAR export), 4 Imperial AI Doctrines & 3 Workshop Mods' },
    { code: 'M14', cat: '20k MC', ru: 'Матрица 20 000 кампаний Монте-Карло (4×4 Doctrine Matrix), Полевой устав и оверлей Эталон МК', en: '20,000-campaign Monte Carlo matrix (4×4 Doctrine Matrix), Field Manual & MC Benchmark overlay' },
    { code: 'M15', cat: 'Ironman', ru: '3 исторических испытания Ironman (1839/1845/1857) и Грамота с восьмиугольной печатью Шамиля (.html)', en: '3 Historical Ironman Challenges (1839/1845/1857) & Octagonal Shamil Signet Diploma (.html)' },
    { code: 'M16', cat: 'Trailer', ru: 'Интерактивный превиз 60-сек трейлера Steam, 3D-манифест спавна акторов UE5.5 и паспорт релиза', en: 'Interactive 60s Steam trailer previz, UE5.5 3D actor spawn manifest & Master Release Manifest' },
    { code: 'M17', cat: 'Museum/EDL', ru: 'Авто-спавнер 44 акторов и 6 камер в UE5.5, экспорт .SRT/.EDL и Архив-Музей (4 зала, 11 экспонатов)', en: 'UE5.5 44-actor/6-camera auto-spawner, .SRT/.EDL export & Historical Museum (4 halls, 11 exhibits)' },
    { code: 'M18', cat: '4K MRQ', ru: 'Пресет 4K-рендера MRQ_ImamatTrailer_4K_Preset.json (32x AA, EXR + ProRes) и генератор Анонс Steam (.md)', en: '4K MRQ preset MRQ_ImamatTrailer_4K_Preset.json (32x AA, EXR + ProRes) & Steam News generator (.md)' },
    { code: 'M19', cat: 'Diplomacy', ru: 'Канцелярия депеш (Стамбул BOA / Мичик 1855), мастер-таблица ST_ImamatMaster_RU_EN (74 строки) и слайд 13', en: 'Diplomatic Chancellery (Istanbul BOA / Michik 1855), 74-row ST_ImamatMaster_RU_EN & Next Fest Slide 13' },
    { code: 'M20', cat: 'Gold v2.0', ru: 'Командный центр релиза v2.0 (Release Hub), гайд для стримеров/кураторов Steam и печать Gold Master v2.0', en: 'Unified Release Hub v2.0, Streamer/Curator Outreach Kit & Gold Master v2.0 Certification (PASS 7/7)' },
    { code: 'M21', cat: 'Key Art', ru: '5 батальных полотен 16:9 (Диван-хана, Салты 1847, Дарго 1845, Арсенал Ведено, Размен на р. Мичик 1855)', en: '5 Historical Key Art 16:9 Paintings (Divan-Khana, Salty 1847, Dargo 1845, Vedeno Foundry, Michik 1855)' },
    { code: 'M22', cat: 'Desktop', ru: 'Нативное приложение macOS (.app arm64 + AppIcon.icns) и Windows Desktop Launcher с офлайн-сохранениями', en: 'Native macOS (.app arm64 + AppIcon.icns) & Windows Desktop Application Bundle with offline saves' },
    { code: 'M23', cat: 'Portraits', ru: '4 исторических портрета (Хаджи-Мурат 1851, Байсунгур Беноевский 1845, Н. И. Пирогов 1847, Согратль 1877)', en: '4 Historical Portraits (Hadji Murad 1851, Baysungur of Benoy 1845, Surgeon Pirogov 1847, Sogratl 1877)' },
    { code: 'M24', cat: '3D Terrain', ru: 'Реалистичная 3D физическая карта рельефа Кавказа (SRTM) и 60 FPS движок движения отрядов по ландшафту', en: 'Realistic 3D SRTM Physical Relief Map of the Caucasus & 60 FPS Real-Time Terrain Unit Movement Engine' }
  ];
