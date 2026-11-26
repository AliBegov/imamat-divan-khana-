// ============================================================================
// НАПРАВЛЕНИЕ 2: СЮЖЕТНЫЕ ЦЕПОЧКИ РЕШЕНИЙ И ЛИЧНЫЕ КВЕСТЫ КЛЮЧЕВЫХ ГЕРОЕВ (АКТЫ I–III)
// 1. Наиб Хаджи-Мурат Хунзахский (1845–1851): честь узденей, плен семьи и совет в Ведено
// 2. Главный инженер Хаджи-Юсуф Сафаров (1846–1848): пороховые мельницы, блиндажи и медный таз
// 3. Наиб Байсунгур Беноевский (1845–1859): буковые засеки Речель, ремни у седла и стража Гуниба
// ============================================================================

export const HERO_STORY_ARCS = [
  {
    id: 'hadji_murat',
    heroNameRu: 'Наиб Хаджи-Мурат Хунзахский',
    heroNameEn: 'Naib Hadji Murad of Khunzakh',
    epithetRu: 'Белый всадник Аварии • 1845–1851 гг.',
    epithetEn: 'The White Rider of Avaria • 1845–1851',
    naibateId: 'khunzakh',
    unitId: 'unit_hadji_murat',
    portraitUrl: 'Portrait_Hadji_Murat_Khunzakh_1851.jpg',
    accentColor: 'rose',
    relicRewardId: 'relic_hadji_murat_burka',
    summaryRu:
      'Трёхактная драма лучшего кавалериста Кавказа: спор о трофейном хумсе Дженгутая, спасение плененной семьи и судьбоносный совет Диван-ханы.',
    summaryEn:
      'Three-act drama of the Caucasus’s finest cavalry commander: the Jengutai trophy dispute, his captive family, and the fateful Council at Vedeno.',
    chapters: [
      {
        stage: 0,
        actLabelRu: 'Глава I • Осень 1846 г.',
        actLabelEn: 'Act I • Autumn 1846',
        locationRu: 'Хунзахское плато и предгорья Дженгутая',
        locationEn: 'Khunzakh Plateau & Jengutai Foothills',
        titleRu: 'Трофейные табуны Дженгутая и спор о доле хумса',
        titleEn: 'Trophy Herds of Jengutai & the Khums Dispute',
        sceneArt: 'Crisis_Kabarda_Tatartup_1846.jpg',
        dilemmaRu:
          'Вернувшись из молниеносного ночного рейда под самые стены Темир-Хан-Шуры и Дженгутая, конная сотня Хаджи-Мурата пригнала богатые табуны. Прежде чем мухтасибы Диван-ханы описали добычу, наиб раздал лучшую долю вдовам павших нукеров и израненным аварским всадникам. Казначей и соперники требуют строгого взыскания пятой доли (хумса) в Байт аль-маль; Хаджи-Мурат положил руку на рукоять базалаевского кинжала и ждёт слова Имама.',
        dilemmaEn:
          'Returning from a lightning night raid beneath Temir-Khan-Shura and Jengutai, Hadji Murad’s riders drove back rich horse herds. Before the Muhtasibs could inventory the spoils, he distributed shares to fallen riders’ widows and wounded Avar horsemen. Rivals demand strict collection of the fifth share (Khums) into Bayt al-Mal; Hadji Murad awaits the Imam’s judgment.',
        choices: [
          {
            id: 'hm_c1_honor',
            labelRu: 'Утвердить раздачу раненым узденям и покрыть долю казны из резерва Имама',
            labelEn: 'Uphold the gift to wounded riders & cover the treasury share from the Imam’s reserve',
            previewRu: '−75 руб. серебра • Доверие Хунзаха +1 • Сотня Хаджи-Мурата +60 сабель и +15 ОХ • +4 Авторитета',
            previewEn: '−75 silver • Khunzakh Trust +1 • Hadji Murad’s Hundred +60 sabers & +15 MP • +4 Authority',
            effects: {
              silverDelta: -75,
              authorityDelta: 4,
              trustDelta: 1,
              memoryRu: 'Имам защитил честь аварской сотни и вдов нукеров в споре о добыче Дженгутая.',
              memoryEn: 'The Imam defended the honor of the Avar hundred in the Jengutai spoils dispute.',
              unitSabersDelta: 60,
              unitMpDelta: 15
            },
            chronicleRu:
              'В споре о трофеях Дженгутая Имам утвердил щедрость Хаджи-Мурата к семьям павших нукеров, укрепив верность всадников Хунзаха.',
            chronicleEn:
              'In the Jengutai spoils dispute, the Imam upheld Hadji Murad’s generosity to fallen riders’ families, strengthening Khunzakh’s loyalty.'
          },
          {
            id: 'hm_c1_strict',
            labelRu: 'Взыскать строгий хумс по Кодексу Низамов в государственную казну Ведено',
            labelEn: 'Enforce strict Khums collection into the Vedeno State Treasury under the Nizam',
            previewRu: '+150 руб. серебра • +20 пуд. пороха • Доверие Хунзаха −1 (уязвлённая гордость наиба)',
            previewEn: '+150 silver • +20 poods powder • Khunzakh Trust −1 (wounded pride)',
            effects: {
              silverDelta: 150,
              powderDelta: 20,
              authorityDelta: 2,
              trustDelta: -1,
              memoryRu: 'Мухтасибы взыскали хумс с табунов Дженгутая вопреки слову Хаджи-Мурата.',
              memoryEn: 'Muhtasibs levied strict Khums on the Jengutai herds over Hadji Murad’s objection.'
            },
            chronicleRu:
              'По слову Низама пятая доля дженгутайских трофеев перечислена в Байт аль-маль, однако Хаджи-Мурат затаил обиду на ревизоров.',
            chronicleEn:
              'Under the Nizam Code, the fifth share of Jengutai spoils entered Bayt al-Mal, leaving Hadji Murad stung by the audit.'
          },
          {
            id: 'hm_c1_raid',
            labelRu: 'Зачесть долю новым дерзким налётом на казённый обоз у Темир-Хан-Шуры',
            labelEn: 'Offset the share by commissioning a daring raid on a Temir-Khan-Shura convoy',
            previewRu: '−20 пуд. пороха • +95 руб. трофеев • Сотня Хаджи-Мурата +1★ ветеранства',
            previewEn: '−20 poods powder • +95 trophy silver • Hadji Murad’s Hundred +1★ veterancy',
            effects: {
              powderDelta: -20,
              silverDelta: 95,
              unitVetDelta: 1,
              imperialColumnDamage: 180,
              memoryRu: 'Имам направил кипучую отвагу Хаджи-Мурата на перехват шуринских обозов.',
              memoryEn: 'The Imam channeled Hadji Murad’s daring into raiding Shura supply convoys.'
            },
            chronicleRu:
              'Вместо тяжбы о табунах Хаджи-Мурат с благословения Диван-ханы разгромил казённый транспорт на шуринской дороге.',
            chronicleEn:
              'Instead of a treasury dispute, Hadji Murad routed an Imperial supply train on the Shura road under Divan-Khana mandate.'
          }
        ]
      },
      {
        stage: 1,
        actLabelRu: 'Глава II • Зима 1850 г.',
        actLabelEn: 'Act II • Winter 1850',
        locationRu: 'Аул Цельмес и линия крепости Воздвиженской',
        locationEn: 'Aul Tselmes & Fort Vozdvizhenskaya Cordon',
        titleRu: 'Заложники на кордоне: пленение семьи Хаджи-Мурата',
        titleEn: 'Hostages on the Cordon: Hadji Murad’s Captive Family',
        sceneArt: 'KeyArt_Michik_1855_Jamaluddin_Exchange.jpg',
        dilemmaRu:
          'Тревожная весть из Аварии: семья Хаджи-Мурата — престарелая мать Патимат, супруга Сану и любимый малолетний сын Юсуф — оказались под властью царских приставов. Лазутчики кунаков докладывают, что эмиссары князя Воронцова тайно обещают наибу возвращение сына, если он сложит оружие. Хаджи-Мурат не спит ночами и просит Диван-хану помочь вызволить близких через обмен пленных офицеров.',
        dilemmaEn:
          'Grave tidings: Hadji Murad’s family—his mother Patimat, wife Sanu, and young son Yusuf—are held under Tsarist supervision. Kunak scouts warn that Viceroy Vorontsov’s emissaries secretly offer his son’s release if he abandons the Imamate. Sleepless, Hadji Murad petitions the Divan-Khana to ransom and exchange officers for his kin.',
        choices: [
          {
            id: 'hm_c2_ransom',
            labelRu: 'Открыть казну и снарядить почётный обмен пленных ради спасения семьи наиба',
            labelEn: 'Open the treasury & mount an honorable prisoner exchange to free the Naib’s family',
            previewRu: '−130 руб. серебра • −60 провианта • Доверие Хунзаха +2 • +6 Авторитета',
            previewEn: '−130 silver • −60 provisions • Khunzakh Trust +2 • +6 Authority',
            effects: {
              silverDelta: -130,
              provisionsDelta: -60,
              authorityDelta: 6,
              trustDelta: 2,
              memoryRu: 'Диван-хана не пожалела серебра и пленных, чтобы вызволить семью Хаджи-Мурата!',
              memoryEn: 'The Divan-Khana spared neither silver nor captives to free Hadji Murad’s family!'
            },
            chronicleRu:
              'По указу Шамиля через кунаков на Мичике проведён выкуп и обмен заложников: семья Хаджи-Мурата спасена, а его верность стала гранитной.',
            chronicleEn:
              'By Shamil’s decree, Kunak intermediaries secured the release of Hadji Murad’s family, forging unbreakable loyalty.'
          },
          {
            id: 'hm_c2_raid_cordon',
            labelRu: 'Бросить аварские и чеченские сотни в ночной рейд для захвата заложников-чиновников',
            labelEn: 'Launch a night cavalry raid across the cordon to seize high-ranking hostages for swap',
            previewRu: '−30 пуд. пороха • Натиск РИ в Хунзахе −12% • Сотня +50 сабель и +15 макс. ОХ • Доверие +1',
            previewEn: '−30 poods powder • Khunzakh Imperial Pressure −12% • +50 sabers & +15 max MP • Trust +1',
            effects: {
              powderDelta: -30,
              pressureDelta: -12,
              trustDelta: 1,
              unitSabersDelta: 50,
              unitMaxMpDelta: 15,
              memoryRu: 'Конные сотни пошли в ночной прорыв за Терек плечом к плечу с Хаджи-Муратом.',
              memoryEn: 'Cavalry hundreds rode across the cordon shoulder to shoulder with Hadji Murad.'
            },
            chronicleRu:
              'Стремительный ночной прорыв конницы Хаджи-Мурата за кордон принёс знатных пленных для равного обмена.',
            chronicleEn:
              'A daring night cavalry raid across the cordon captured high-ranking prisoners to force a family exchange.'
          },
          {
            id: 'hm_c2_forbid',
            labelRu: 'Запретить частные сношения с кордоном и приставить стражу муртазеков',
            labelEn: 'Forbid private parleys with the cordon & post Murtazek guards over Tselmes',
            previewRu: '+45 руб. экономии • Доверие Хунзаха −2 (тяжёлая сердечная рана и подозрительность)',
            previewEn: '+45 silver saved • Khunzakh Trust −2 (deep resentment & suspicion)',
            effects: {
              silverDelta: 45,
              trustDelta: -2,
              memoryRu: 'Запрет на выкуп семьи и надзор муртазеков оставили горькую рану в сердце Хаджи-Мурата.',
              memoryEn: 'Forbidding family ransom talks and posting guards deeply alienated Hadji Murad.'
            },
            chronicleRu:
              'Суровый запрет на переговоры о выкупе семьи посеял тревогу и отчуждение между Цельмесом и Ведено.',
            chronicleEn:
              'A stern ban on family ransom talks sowed deep estrangement between Tselmes and Vedeno.'
          }
        ]
      },
      {
        stage: 2,
        actLabelRu: 'Глава III • Осень 1851 г. (Развязка)',
        actLabelEn: 'Act III • Autumn 1851 (Climax)',
        locationRu: 'Совет наибов в столице Дарго-Ведено',
        locationEn: 'Council of Naibs at Capital Dargo-Vedeno',
        titleRu: 'Суд Диван-ханы: Кровное братство или исторический разлом',
        titleEn: 'Judgment of the Divan-Khana: Sworn Brotherhood or Tragic Rift',
        sceneArt: 'Crisis_Hadji_Murat_Council_1851.jpg',
        dilemmaRu:
          'После тяжёлого рейда в Кайтаг и Табасаран недруги открыто обвиняют Хаджи-Мурата на совете в Ведено в измене и сговоре с русским командованием. В истории именно этот разрыв толкнул прославленного наиба к трагическому ночному уходу за Терек и гибели в 1852 году, обессмерченной повестью Льва Толстого. Сейчас в зале Диван-ханы тишина: слово Имама решит судьбу Белого всадника Аварии!',
        dilemmaEn:
          'Following the arduous Kaitag-Tabasaran raid, rivals openly accuse Hadji Murad before the Vedeno council of secret treason. Historically, this rift drove the famed Naib to his tragic 1851 flight and 1852 death immortalized by Leo Tolstoy. Silence falls over the Divan-Khana: the Imam’s decree will seal the fate of the White Rider of Avaria!',
        choices: [
          {
            id: 'hm_c3_brotherhood',
            outcome: 'sworn_brotherhood',
            labelRu: 'Кровное братство: отвергнуть наветы, вручить Белую бурку авангарда и клятву кунака!',
            labelEn: 'Sworn Brotherhood: reject slander, bestow the Vanguard White Burka & Kunak oath!',
            previewRu:
              '👑 ЛЕГЕНДА 3D • −85 руб. • Доверие Хунзаха +3 (Макс.) • Сотня +160 сабель, ★★★ и +25 ОХ • 🏛️ Реликвии Хаджи-Мурата и аль-Карахи!',
            previewEn:
              '👑 3D LEGEND • −85 silver • Khunzakh Trust +3 (Max) • Hundred +160 sabers, ★★★ & +25 MP • 🏛️ Unlocks Relics!',
            effects: {
              silverDelta: -85,
              authorityDelta: 10,
              setTrustExact: 3,
              memoryRu: 'Кровный кунак Диван-ханы: Имам отверг наветы и доверил Хаджи-Мурату конный авангард гор!',
              memoryEn: 'Sworn Kunak of the Divan-Khana: the Imam rejected slander and entrusted him with the highland vanguard!',
              unitSabersDelta: 160,
              unitVetDelta: 3,
              unitMaxMpDelta: 25,
              unitMedalRu: 'Орден «Кровный клинок Аварии»',
              grantLegendaryHero: true,
              unlockRelics: ['relic_hadji_murat_burka', 'relic_alqarakhi_chronicle_inkwell']
            },
            chronicleRu:
              'Триумф единства в Ведено! Имам Шамиль отверг наветы завистников и обнял Хаджи-Мурата перед лицом всех наибов: аварская гвардия принесла нерушимую присягу.',
            chronicleEn:
              'Triumph of unity at Vedeno! Imam Shamil dismissed the slanderers and embraced Hadji Murad before all Naibs: the Avar cavalry swore an unbreakable oath.'
          },
          {
            id: 'hm_c3_council_peace',
            outcome: 'reconciled_nizam',
            labelRu: 'Третейский суд алимов Согратля: примирить соперников под общей присягой Низаму',
            labelEn: 'Arbitration of Sogratl Scholars: reconcile the rivals under solemn oath to the Nizam',
            previewRu:
              '👑 ЛЕГЕНДА 3D • −40 руб. • Гарнизон Хунзаха +180 • Сотня +95 сабель • Доверие +2 • 🏛️ Реликвия бурки',
            previewEn:
              '👑 3D LEGEND • −40 silver • Khunzakh Garrison +180 • Hundred +95 sabers • Trust +2 • 🏛️ Unlocks Burka Relic',
            effects: {
              silverDelta: -40,
              authorityDelta: 6,
              trustDelta: 2,
              garrisonDelta: 180,
              unitSabersDelta: 95,
              unitVetDelta: 1,
              grantLegendaryHero: true,
              unlockRelics: ['relic_hadji_murat_burka'],
              memoryRu: 'Совет учёных Согратля примирил Хаджи-Мурата с наибами под знаменем общего долга.',
              memoryEn: 'The Scholars of Sogratl reconciled Hadji Murad with fellow Naibs under solemn oath.'
            },
            chronicleRu:
              'Мудрым посредничеством учёных Согратля распря между наибами улажена; Хаджи-Мурат сохранил хунзахское знамя и вывел сотню на защиту перевалов.',
            chronicleEn:
              'Through the mediation of Sogratl scholars, the rift among Naibs was healed and Hadji Murad rode forth to guard the passes.'
          },
          {
            id: 'hm_c3_historical_rift',
            outcome: 'tragic_departure',
            labelRu: 'Суровый приговор: лишить наибства (историческая драма ухода за Терек 1851 г.)',
            labelEn: 'Stern Verdict: strip the Naibate (historical tragedy of the 1851 departure)',
            previewRu:
              '+120 руб. в казну • +25 пуд. пороха • Смена командира аварской сотни (+80 муртазеков Ведено) • 🏛️ Запись в хронике',
            previewEn:
              '+120 silver • +25 poods powder • Reorganize Avar squadron under Vedeno Murtazeks (+80) • 🏛️ Chronicle entry',
            effects: {
              silverDelta: 120,
              powderDelta: 25,
              authorityDelta: -3,
              setTrustExact: 0,
              unitSabersDelta: 80,
              renameCommanderRu: 'Наиб Хунзахского гарнизона (Муртазеки)',
              renameCommanderEn: 'Khunzakh Garrison Naib (Murtazeks)',
              unlockRelics: ['relic_hadji_murat_burka'],
              memoryRu: 'После драматического отъезда Хаджи-Мурата в 1851 г. Хунзах удерживают муртазеки Диван-ханы.',
              memoryEn: 'Following Hadji Murad’s dramatic 1851 departure, Vedeno Murtazeks hold Khunzakh.'
            },
            chronicleRu:
              'Роковая страница 1851 года: лишённый наибства на совете, Хаджи-Мурат с горсткой нукеров ушёл в осеннюю мглу за Терек, а Хунзах принял новый гарнизон муртазеков.',
            chronicleEn:
              'Fateful page of 1851: stripped of his Naibate, Hadji Murad rode into the autumn mist with a handful of followers while Murtazeks garrisoned Khunzakh.'
          }
        ]
      }
    ]
  },
  {
    id: 'hadji_yusuf',
    heroNameRu: 'Инженер Хаджи-Юсуф Сафаров',
    heroNameEn: 'Chief Engineer Hajji Yusuf Safarov',
    epithetRu: 'Зодчий подземных твердынь • 1846–1848 гг.',
    epithetEn: 'Architect of Subterranean Fortresses • 1846–1848',
    naibateId: 'gergebil',
    unitId: 'unit_powder_caravan',
    portraitUrl: 'Portrait_Hadji_Yusuf_Safarov_1845.jpg',
    accentColor: 'amber',
    relicRewardId: 'relic_safarov_copper_basin',
    summaryRu:
      'Инженерная эпопея выпускника каирской школы Мухаммеда-Али: водяные пороховые мельницы, 4-слойные дубовые блиндажи и медный сейсмоскоп Салтов.',
    summaryEn:
      'Engineering epic of the Cairo-trained master: water-driven powder mills, 4-layer oak blindages, and the copper seismoscope of Salty.',
    chapters: [
      {
        stage: 0,
        actLabelRu: 'Глава I • Весна 1846 г.',
        actLabelEn: 'Act I • Spring 1846',
        locationRu: 'Пушечный двор Ведено и ущелья Андалала',
        locationEn: 'Vedeno Cannon Yard & Andalal Gorges',
        titleRu: 'Водяные пороховые мельницы и стандарт зернения селитры',
        titleEn: 'Water-Driven Powder Mills & Saltpeter Granulation Standard',
        sceneArt: 'KeyArt_Vedeno_Foundry_and_PowderMill_1846.jpg',
        dilemmaRu:
          'Чеченец из Алды, прошедший службу полковником инженерных войск паши Мухаммеда-Али в Египте, Хаджи-Юсуф Сафаров раскладывает на столе Диван-ханы циркуль и чертежи водяных толчейных мельниц. Кустарный порох горских аулов даёт разную дальность боя для трофейных единорогов; Сафаров просит серебро на постройку казённых варниц и каменных погребов.',
        dilemmaEn:
          'Trained as an engineering colonel in Muhammad Ali Pasha’s Egypt, Hajji Yusuf Safarov unrolls blueprints for water-driven stamp mills before the Divan-Khana. Home-ground village powder yields uneven range for captured unicorns; Safarov requests silver to build standardized saltpeter works and vaulted magazines.',
        choices: [
          {
            id: 'hy_c1_mills',
            labelRu: 'Ассигновать серебро Байт аль-маль на водяные толчеи и чугунные ступы Сафарова',
            labelEn: 'Allocate Bayt al-Mal silver for Safarov’s water-driven stamp mills & cast-iron mortars',
            previewRu: '−105 руб. серебра • +48 пуд. отборного пороха • Доверие Гергебиля +1 • Караван +60 сабель и +15 ОХ',
            previewEn: '−105 silver • +48 poods fine powder • Gergebil Trust +1 • Convoy +60 sabers & +15 MP',
            effects: {
              silverDelta: -105,
              powderDelta: 48,
              trustDelta: 1,
              unitSabersDelta: 60,
              unitMpDelta: 15,
              memoryRu: 'Диван-хана поддержала проект водяных пороховых мельниц инженера Сафарова.',
              memoryEn: 'The Divan-Khana funded Engineer Safarov’s water-driven powder mills.'
            },
            chronicleRu:
              'По чертежам Хаджи-Юсуфа Сафарова на горных ручьях запущены водяные пороховые мельницы, давшие артиллерии Имамата крупнозернистый боевой порох.',
            chronicleEn:
              'Built to Hajji Yusuf Safarov’s blueprints, water-driven mills began producing standardized coarse artillery powder.'
          },
          {
            id: 'hy_c1_artisans',
            labelRu: 'Созвать сельских селитроваров Андалала на общественные работы с пайком зерна',
            labelEn: 'Convene Andalal village saltpeter boilers with public grain rations',
            previewRu: '−85 провианта • +32 пуд. пороха • +4 Авторитета • Доверие Гергебиля +1',
            previewEn: '−85 provisions • +32 poods powder • +4 Authority • Gergebil Trust +1',
            effects: {
              provisionsDelta: -85,
              powderDelta: 32,
              authorityDelta: 4,
              trustDelta: 1,
              memoryRu: 'Артели селитроваров Андалала получили паёк зерна по ходатайству Сафарова.',
              memoryEn: 'Andalal saltpeter guilds received grain rations at Safarov’s request.'
            },
            chronicleRu:
              'Мастера Гуниба, Гергебиля и Согратля объединили выварку селитры под началом инженера Хаджи-Юсуфа.',
            chronicleEn:
              'Artisans of Gunib, Gergebil, and Sogratl united saltpeter production under Chief Engineer Hajji Yusuf.'
          }
        ]
      },
      {
        stage: 1,
        actLabelRu: 'Глава II • Лето 1847 г.',
        actLabelEn: 'Act II • Summer 1847',
        locationRu: 'Бастионы Гергебиля и Салтинской теснины',
        locationEn: 'Bastions of Gergebil & Saltinka Gorge',
        titleRu: 'Тайна медного таза с водой и четырёхслойные дубовые блиндажи',
        titleEn: 'Secret of the Copper Water Basin & Four-Layer Oak Blindages',
        sceneArt: 'KeyArt_Salty_Siege_CopperBasin_1847.jpg',
        dilemmaRu:
          'Осадные батареи князя Воронцова засыпают аулы бомбами, а сапёрные роты глухо бьют кирками в известняковой толще под башнями. Сафаров предлагает гениальный приём подземной обороны: перекрыть траншеи дубовыми брёвнами с землёй в 4 наката, а в сухих погребах поставить широкие медные тазы с водой — дрожь зеркала воды безошибочно выдаст азимут русского минного подкопа!',
        dilemmaEn:
          'Viceroy Vorontsov’s siege batteries rain mortar shells while Imperial sappers tunnel beneath the limestone towers. Safarov proposes roofed 4-layer oak-and-earth blindages and wide copper water basins placed on bedrock floors—the slightest water ripple betrays the exact azimuth of enemy mine galleries!',
        choices: [
          {
            id: 'hy_c2_blindages',
            labelRu: 'Возвести 4-слойные дубовые блиндажи и сеть слуховых колодцев с медными тазами',
            labelEn: 'Construct 4-layer oak blindages & listening shafts with copper seismoscope basins',
            previewRu:
              '−80 руб. • −25 пуд. пороха • +1 слой блиндажей в осадах (4 наката!) • Натиск в Гергебиле −14% • Доверие +2',
            previewEn:
              '−80 silver • −25 poods powder • +1 Siege Blindage Layer (4 tiers!) • Gergebil Pressure −14% • Trust +2',
            effects: {
              silverDelta: -80,
              powderDelta: -25,
              blindageBoost: 1,
              pressureDelta: -14,
              trustDelta: 2,
              memoryRu: 'Подземные блиндажи и медные сейсмоскопы Сафарова уберегли гарнизоны от мортирного огня!',
              memoryEn: 'Safarov’s subterranean blindages and copper seismoscopes shielded garrisons from mortars!'
            },
            chronicleRu:
              'Под руководством инженера Д. А. Милютина русские штабисты с изумлением зарисовали дубовые блиндажи и систему медных сейсмоскопов Сафарова в Салтах.',
            chronicleEn:
              'Col. Dmitry Milyutin sketched with astonishment Safarov’s multi-layered oak blindages and copper water seismoscopes at Salty.'
          },
          {
            id: 'hy_c2_lunettes',
            labelRu: 'Выдвинуть фланкирующие каменные люнеты и крытые ходы к воде в ущелье',
            labelEn: 'Push forward flanking stone lunettes & covered timber galleries to the river',
            previewRu: '−65 провианта • Гарнизон Гергебиля +220 стрелков • Инженерный караван +1★ • Доверие +1',
            previewEn: '−65 provisions • Gergebil Garrison +220 rifles • Engineering Convoy +1★ • Trust +1',
            effects: {
              provisionsDelta: -65,
              garrisonDelta: 220,
              unitVetDelta: 1,
              trustDelta: 1,
              memoryRu: 'Крытые бревенчатые галереи к воде спасли защитников бастиона от жажды под огнём.',
              memoryEn: 'Covered timber water galleries spared the bastion defenders from thirst under fire.'
            },
            chronicleRu:
              'Крытые бревенчатые ходы Сафарова обеспечили бесперебойный доступ гарнизона к речной воде под прицельным огнём.',
            chronicleEn:
              'Safarov’s covered timber galleries secured uninterrupted access to river water under enemy fire.'
          }
        ]
      },
      {
        stage: 2,
        actLabelRu: 'Глава III • 1848 г. (Развязка)',
        actLabelEn: 'Act III • 1848 (Climax)',
        locationRu: 'Подземная контр-минная галерея Андалала',
        locationEn: 'Subterranean Counter-Mine Gallery of Andalal',
        titleRu: 'Генеральный камуфлет и триумф инженерной школы Имамата',
        titleEn: 'The Grand Camouflet & Triumph of the Imamate Engineering Corps',
        sceneArt: 'Diorama_Siege_Cutaway_Blindage_1847.jpg',
        dilemmaRu:
          'Концентрические круги на воде в медном тазу возвестили решающий миг: главная сапёрная галерея осаждающих подошла на четыре сажени к угловой башне! Хаджи-Юсуф Сафаров лично уложил просмолённый пороховой рукав подземного камуфлета и вывел гарнизон из опасного сектора. Осталось высечь искру и закрепить статус Инженерного корпуса Имамата!',
        dilemmaEn:
          'Concentric ripples in the copper basin signal the decisive moment: the besiegers’ main sapper tunnel lies four sazhens from the corner tower! Hajji Yusuf Safarov has laid the tarred powder hose for a subterranean camouflet. One spark will collapse the enemy mine and immortalize the Imamate Engineering Corps!',
        choices: [
          {
            id: 'hy_c3_camouflet',
            outcome: 'master_engineer',
            labelRu: 'Подорвать генеральный камуфлет и провозгласить Инженерный низам Хаджи-Юсуфа!',
            labelEn: 'Detonate the Grand Camouflet & proclaim Hajji Yusuf’s Engineering Nizam!',
            previewRu:
              '👑 ЛЕГЕНДА 3D • +55 пуд. пороха • Доверие Гергебиля +3 • Инженерный парк +140 бойцов, ★★★ и +1 орудие • 🏛️ Реликвия Медного сейсмоскопа!',
            previewEn:
              '👑 3D LEGEND • +55 poods powder • Gergebil Trust +3 • Engineering Park +140 guards, ★★★ & +1 gun • 🏛️ Unlocks Copper Seismoscope Relic!',
            effects: {
              powderDelta: 55,
              authorityDelta: 8,
              setTrustExact: 3,
              blindageBoost: 1,
              unitSabersDelta: 140,
              unitVetDelta: 3,
              unitGunsDelta: 1,
              unitMaxMpDelta: 25,
              unitMedalRu: 'Знак «Главный инженер Имамата»',
              grantLegendaryHero: true,
              unlockRelics: ['relic_safarov_copper_basin'],
              memoryRu: 'Кровный соратник: подземный камуфлет Сафарова обрушил осадную галерею и прославил Андалал!',
              memoryEn: 'Sworn Master Engineer: Safarov’s grand camouflet collapsed the siege tunnel!'
            },
            chronicleRu:
              'Глухой подземный удар встряхнул скалы Андалала: камуфлет Хаджи-Юсуфа Сафарова похоронил подкоп осаждающих, а его «Карта владений Шамиля» и крепостные чертежи вошли в историю фортификации.',
            chronicleEn:
              'A deep subterranean blast shook Andalal: Hajji Yusuf Safarov’s camouflet collapsed the besiegers’ mine gallery, cementing his place in fortification history.'
          },
          {
            id: 'hy_c3_foundry_union',
            outcome: 'arsenal_bastion',
            labelRu: 'Обрушить подкоп и объединить сапёров Сафарова с пушечным двором устаза Джабраила',
            labelEn: 'Collapse the tunnel & unite Safarov’s sappers with Master Jabrail’s Vedeno Foundry',
            previewRu:
              '👑 ЛЕГЕНДА 3D • +35 пуд. пороха • +90 руб. • Караван +100 сабель • 🏛️ Открывает 2 реликвии (Сейсмоскоп + Квадрант Джабраила)!',
            previewEn:
              '👑 3D LEGEND • +35 poods powder • +90 silver • Convoy +100 sabers • 🏛️ Unlocks 2 Relics (Seismoscope + Quadrant)!',
            effects: {
              powderDelta: 35,
              silverDelta: 90,
              authorityDelta: 6,
              setTrustExact: 3,
              unitSabersDelta: 100,
              unitVetDelta: 2,
              grantLegendaryHero: true,
              unlockRelics: ['relic_safarov_copper_basin', 'relic_jabrail_unicorn_sight'],
              memoryRu: 'Союз инженера Сафарова и литейщика Джабраила превратил Ведено и Гергебиль в единый арсенал.',
              memoryEn: 'The union of Safarov and Foundry Master Jabrail forged a unified highland arsenal.'
            },
            chronicleRu:
              'Соединив минное искусство Сафарова и литьё устаза Джабраила, Диван-хана обеспечила батареи гор точными квадрантами и запасом пороха.',
            chronicleEn:
              'Uniting Safarov’s mine craft with Master Jabrail’s foundry equipped the highland batteries with precision quadrants and powder reserves.'
          }
        ]
      }
    ]
  },
  {
    id: 'baysungur',
    heroNameRu: 'Наиб Байсунгур Беноевский',
    heroNameEn: 'Naib Baysungur of Benoy',
    epithetRu: 'Каменный волк Ичкерии • 1845–1859 гг.',
    epithetEn: 'The Stone Wolf of Ichkeria • 1845–1859',
    naibateId: 'benoy',
    unitId: 'unit_baysungur',
    portraitUrl: 'Portrait_Baysungur_Benoy_1845.jpg',
    accentColor: 'emerald',
    relicRewardId: 'relic_baysungur_banner',
    summaryRu:
      'Путь несгибаемой верности от буковых засек «Сухарной экспедиции» 1845 года и потери руки под ядром до клятвы железного арьергарда на Верхнем Гунибе.',
    summaryEn:
      'Unbreakable path of loyalty from the 1845 beech-forest abatis of Dargo and losing an arm to cannon shot, to the final iron guard on Upper Gunib.',
    chapters: [
      {
        stage: 0,
        actLabelRu: 'Глава I • Июль 1845 г.',
        actLabelEn: 'Act I • July 1845',
        locationRu: 'Буковые леса хребта Речель (Даргинский поход)',
        locationEn: 'Ancient Beech Forests of Rechel Ridge (Dargo)',
        titleRu: 'Засеки «Сухарной экспедиции» и лесной капкан Воронцова',
        titleEn: 'Abatis of the “Biscuit Expedition” & Vorontsov’s Forest Trap',
        sceneArt: 'KeyArt_Dargo_BeechForest_Ambush_1845.jpg',
        dilemmaRu:
          'Армия наместника графа Воронцова вошла в оставленное Дарго, но оказалась отрезана от баз без сухарей и снарядов. Высланная за провиантом колонна генералов Клюгенау, Пассека и Викторова растянулась на пять вёрст по скользкой глине букового хребта Речель. Наиб Байсунгур Беноевский ждёт сигнала свалить подрубленные вековые буки и рассечь колонну надвое!',
        dilemmaEn:
          'Viceroy Vorontsov’s corps stands stranded in burned Dargo without rations. The relief column under Generals Klugenau, Passek, and Viktorov stretches five versts along muddy beech trails on Rechel Ridge. Naib Baysungur of Benoy awaits your signal to topple giant beech trees across the column!',
        choices: [
          {
            id: 'bb_c1_abatis',
            labelRu: 'Обрушить буковые засеки и отсечь вьючные обозы от авангарда колонны',
            labelEn: 'Drop the beech abatis & sever the pack supply train from the column vanguard',
            previewRu:
              '−20 пуд. пороха • +120 провианта • +85 руб. • Доверие Беноя +1 • Отряд Байсунгура +90 бойцов и +1★',
            previewEn:
              '−20 poods powder • +120 provisions • +85 silver • Benoy Trust +1 • Baysungur’s Rifles +90 men & +1★',
            effects: {
              powderDelta: -20,
              provisionsDelta: 120,
              silverDelta: 85,
              trustDelta: 1,
              unitSabersDelta: 90,
              unitVetDelta: 1,
              imperialColumnDamage: 240,
              memoryRu: 'В буковых засеках Речель Беноевская сотня захватила обозы «Сухарной экспедиции»!',
              memoryEn: 'In the Rechel beech abatis, the Benoy hundred captured the Biscuit Expedition’s supply train!'
            },
            chronicleRu:
              'На хребте Речель засеки Байсунгура Беноевского превратили «Сухарную экспедицию» в тяжелейшее поражение экспедиционного корпуса.',
            chronicleEn:
              'Along Rechel Ridge, Baysungur’s beech abatis turned the “Biscuit Expedition” into a devastating rout for the expeditionary corps.'
          },
          {
            id: 'bb_c1_guns',
            labelRu: 'Бросить отборных шашечников Беноя на захват горных орудий колонны',
            labelEn: 'Hurl Benoy shock swordsmen directly at the column’s mountain artillery',
            previewRu: '−30 пуд. пороха • Отряд Байсунгура захватывает +1 горное орудие • +6 Авторитета • Доверие +1',
            previewEn: '−30 poods powder • Baysungur’s Rifles capture +1 mountain cannon • +6 Authority • Trust +1',
            effects: {
              powderDelta: -30,
              authorityDelta: 6,
              trustDelta: 1,
              unitGunsDelta: 1,
              imperialColumnDamage: 190,
              memoryRu: 'Ичкерийцы с шашками наголо взяли горное орудие на лесном гребне Дарго.',
              memoryEn: 'Ichkerian fighters stormed and captured a mountain gun on the Dargo forest crest.'
            },
            chronicleRu:
              'Под проливным дождём в лесу Дарго воины Байсунгура в рукопашной схватке отбили полевое орудие и зарядные ящики.',
            chronicleEn:
              'Under pouring rain in Dargo forest, Baysungur’s warriors captured a field piece and caissons in hand-to-hand combat.'
          }
        ]
      },
      {
        stage: 1,
        actLabelRu: 'Глава II • 1847 г.',
        actLabelEn: 'Act II • 1847',
        locationRu: 'Перевязочный пункт под скалами Гергебиля и Беной',
        locationEn: 'Field Dressing Post below Gergebil & Benoy',
        titleRu: 'Чугунное ядро и сыромятные ремни у черкесского седла',
        titleEn: 'Cannonball Wound & Rawhide Straps at the Circassian Saddle',
        sceneArt: 'Diorama_Ichkeria_Forest_Ambush_1845.jpg',
        dilemmaRu:
          'Под ураганным артиллерийским огнём осколок ядра раздробил Байсунгуру руку — ещё раньше в боях он потерял глаз и ногу пробило пулей. Но едва лекари перевязали рану, железный наиб Беноя потребовал пристегнуть его сыромятными ремнями к высокому черкесскому седлу: «Если сотня не увидит меня впереди, дрогнет весь фланг!»',
        dilemmaEn:
          'Under fierce bombardment, a cannon shot shattered Baysungur’s arm—having already lost an eye in earlier battles. Scarcely bandaged, the iron Naib of Benoy demanded to be strapped with rawhide thongs to his high Circassian saddle: “If my hundred does not see me in front, the flank will waver!”',
        choices: [
          {
            id: 'bb_c2_saddle_oath',
            labelRu: 'Вручить серебряный орден «Лев Газавата» и благословить Байсунгура вести авангард в седле!',
            labelEn: 'Award the Silver Order “Lion of Ghazawat” & bless Baysungur to lead strapped to his saddle!',
            previewRu: '−65 руб. серебра • +9 Авторитета • Доверие Беноя +2 • Медаль «Лев Ичкерии» и +20 макс. ОХ',
            previewEn: '−65 silver • +9 Authority • Benoy Trust +2 • Medal “Lion of Ichkeria” & +20 max MP',
            effects: {
              silverDelta: -65,
              authorityDelta: 9,
              trustDelta: 2,
              unitMaxMpDelta: 20,
              unitMedalRu: 'Серебряный орден «Лев Ичкерии»',
              memoryRu: 'Прикованный ремнями к седлу, Байсунгур принял серебряный орден из рук самого Имама!',
              memoryEn: 'Strapped to his saddle, Baysungur received the Silver Order from the Imam’s own hand!'
            },
            chronicleRu:
              'Легенда гор ожила наяву: привязанный ремнями к седлу однорукий Байсунгур повёл Беноевскую сотню в атаку, обратив наступавших в бегство.',
            chronicleEn:
              'A living legend of the mountains: strapped to his saddle, one-armed Baysungur led the Benoy hundred into a victorious charge.'
          },
          {
            id: 'bb_c2_reinforce_benoy',
            labelRu: 'Послать лучших лекарей и пополнить аулы Беноя свежим ополчением и зерном',
            labelEn: 'Dispatch master surgeons & reinforce the auls of Benoy with fresh militia and grain',
            previewRu: '−80 провианта • Гарнизон Беноя +240 бойцов • Отряд Байсунгура +110 стрелков • Доверие +2',
            previewEn: '−80 provisions • Benoy Garrison +240 • Baysungur’s Rifles +110 men • Trust +2',
            effects: {
              provisionsDelta: -80,
              garrisonDelta: 240,
              unitSabersDelta: 110,
              trustDelta: 2,
              memoryRu: 'Диван-хана укрепила семьи Беноя хлебом и прислала искусных лекарей раненому наибу.',
              memoryEn: 'The Divan-Khana provisioned Benoy’s families and sent master surgeons to the wounded Naib.'
            },
            chronicleRu:
              'Опираясь на заботу Диван-ханы об аулах Ичкерии, оправившийся от ран Байсунгур собрал под зелёное знамя новые сотни стрелков.',
            chronicleEn:
              'Backed by Divan-Khana relief for Ichkeria’s auls, the recovered Baysungur rallied fresh rifle hundreds beneath his banner.'
          }
        ]
      },
      {
        stage: 2,
        actLabelRu: 'Глава III • Рубеж 1859 г. (Развязка)',
        actLabelEn: 'Act III • Bastion of 1859 (Climax)',
        locationRu: 'От перевалов Ичкерии до скальных ворот Верхнего Гуниба',
        locationEn: 'From Ichkeria Passes to the Cliff Gates of Upper Gunib',
        titleRu: 'Клятва Беноевской сотни: Несокрушимый щит Имамата',
        titleEn: 'Oath of the Benoy Hundred: Unbreakable Shield of the Imamate',
        sceneArt: 'Crisis_Chokh_Siege_1849.jpg',
        dilemmaRu:
          'Систематические просеки генерала Евдокимова обнажили предгорья, и многие старшины утомлены многолетней войной. В этот грозный час седой Байсунгур Беноевский въезжает во двор Диван-ханы во главе своих закалённых ветеранов: «Имам! Доверь Беноевской сотне самый трудный перевал — мы встанем стеной и пробьём любое кольцо!»',
        dilemmaEn:
          'General Evdokimov’s systematic forest clearings press upon the foothills, and war-weariness tests the realm. Gray-bearded Baysungur of Benoy rides into the Divan-Khana courtyard at the head of his scarred veterans: “Imam! Entrust the hardest pass to the Benoy hundred—we shall stand like limestone and cleave any encirclement!”',
        choices: [
          {
            id: 'bb_c3_iron_guard',
            outcome: 'iron_wolf_vanguard',
            labelRu: 'Вручить Зелёное знамя гвардии и поставить Байсунгура несокрушимым щитом перевалов!',
            labelEn: 'Bestow the Green Guard Banner & appoint Baysungur Unbreakable Shield of the Passes!',
            previewRu:
              '👑 ЛЕГЕНДА 3D • +10 Авторитета • Доверие Беноя +3 (Макс.) • Отряд +180 бойцов (1020+), ★★★ и +1 орудие • Натиск РИ −15% • 🏛️ Реликвия Знамени Байсунгура!',
            previewEn:
              '👑 3D LEGEND • +10 Authority • Benoy Trust +3 (Max) • Unit +180 men (1020+), ★★★ & +1 gun • Pressure −15% • 🏛️ Unlocks Baysungur’s Banner!',
            effects: {
              authorityDelta: 10,
              setTrustExact: 3,
              pressureDelta: -15,
              unitSabersDelta: 180,
              unitVetDelta: 3,
              unitGunsDelta: 1,
              unitMedalRu: 'Гвардия «Каменный волк Беноя»',
              grantLegendaryHero: true,
              unlockRelics: ['relic_baysungur_banner'],
              memoryRu: 'Несокрушимый кунак до последнего камня Гуниба: Беноевская гвардия держит перевалы!',
              memoryEn: 'Unbreakable Kunak to the last stone of Gunib: the Benoy Guard holds the mountain passes!'
            },
            chronicleRu:
              'Под развёрнутым Зелёным знаменем Беноя тысячная гвардия Байсунгура заняла ключевые теснины, став живой твердыней Имамата.',
            chronicleEn:
              'Beneath the unfurled Green Banner of Benoy, Baysungur’s thousand-strong guard occupied the key gorges as a living fortress.'
          },
          {
            id: 'bb_c3_counterstrike',
            outcome: 'ichkeria_counterstrike',
            labelRu: 'Бросить объединённые сотни Байсунгура во встречный удар по всем колоннам РИ!',
            labelEn: 'Hurl Baysungur’s united hundreds into a sweeping counterstrike against all Imperial columns!',
            previewRu:
              '👑 ЛЕГЕНДА 3D • −30 пуд. пороха • +115 руб. трофеев • Урон −280 штыков ВСЕМ колоннам РИ • Отряд +140 бойцов • 🏛️ Реликвия Знамени!',
            previewEn:
              '👑 3D LEGEND • −30 poods powder • +115 trophy silver • −280 bayonets to ALL Imperial columns • +140 men • 🏛️ Unlocks Banner Relic!',
            effects: {
              powderDelta: -30,
              silverDelta: 115,
              authorityDelta: 8,
              setTrustExact: 3,
              unitSabersDelta: 140,
              unitVetDelta: 2,
              imperialColumnDamage: 280,
              grantLegendaryHero: true,
              unlockRelics: ['relic_baysungur_banner'],
              memoryRu: 'Встречный контрудар Байсунгура потряс все экспедиционные колонны от Сунжи до Койсу!',
              memoryEn: 'Baysungur’s sweeping counterstrike shook every expeditionary column from the Sunzha to the Koisu!'
            },
            chronicleRu:
              'Громовой контрудар Беноевской сотни из лесных просек смял передовые батальоны колонн и отбросил их за речные переправы.',
            chronicleEn:
              'A thunderous counterstrike from the forest defiles by the Benoy hundred staggered the advancing columns and drove them back.'
          }
        ]
      }
    ]
  }
];

export function createInitialHeroArcsState() {
  return {
    hadji_murat: { stage: 0, completed: false, outcome: null, choiceHistory: [] },
    hadji_yusuf: { stage: 0, completed: false, outcome: null, choiceHistory: [] },
    baysungur: { stage: 0, completed: false, outcome: null, choiceHistory: [] }
  };
}
