// ============================================================================
// ПЯТЬ МНОГОФАЗНЫХ ИСТОРИЧЕСКИХ ОПЕРАЦИЙ-ЭПИЗОДОВ КАВКАЗСКОЙ ВОЙНЫ (1839–1859)
// По материалам хроники Мухаммада Тахира аль-Карахи («Блеск дагестанских сабель»),
// инженерных мемуаров Д. А. Милютина и архива проекта (01_Исторический_архив).
// Каждый эпизод состоит из 4 последовательных оперативных фаз с перестройкой 3D-карты!
// ============================================================================

export const HISTORICAL_EPISODES = [
  // ==========================================================================
  // ЭПИЗОД I. «80 ДНЕЙ АХУЛЬГО» (ЛЕТО 1839 Г.)
  // ==========================================================================
  {
    id: 'ep_1839_akhulgo',
    scenarioId: 'camp_1839',
    episodeNumber: 'I',
    yearsLabelRu: 'Июнь — Август 1839 г.',
    yearsLabelEn: 'June — August 1839',
    titleRu: 'Эпизод I: «80 дней Ахульго» — Твердыня над Койсу',
    titleEn: 'Episode I: “80 Days of Akhulgo” — Citadel Above the Koisu',
    subtitleRu: 'Оборона двуглавой скалы в излучине Андийского Койсу против корпуса генерала П. Х. Граббе',
    subtitleEn: 'Defense of the twin-peaked cliff in the bend of the Andi Koisu against Gen. P. Kh. Grabbe’s corps',
    capitalNaibateId: 'karata',
    capitalLabelRu: 'Скала Ахульго',
    capitalLabelEn: 'Akhulgo Cliff',
    initialImperialHeldIds: [],
    nextChainEpisodeId: null,
    phases: [
      {
        id: 'akhulgo_p1_surkhay_tower',
        step: 1,
        dateRu: '29 июня — 4 июля 1839 г.',
        dateEn: 'June 29 — July 4, 1839',
        titleRu: 'Фаза 1/4: Сурхаева башня — сто мюридов Алибека Хунзахского',
        titleEn: 'Phase 1/4: Surkhay’s Tower — One Hundred Murids of Alibek',
        art: 'Diorama_Siege_Cutaway_Blindage_1847.jpg',
        focusNaibateId: 'karata',
        speakerRu: 'Алибек Хунзахский (комендант Сурхаевой башни)',
        speakerEn: 'Alibek of Khunzakh (Commander of Surkhay’s Tower)',
        quoteRu:
          '«Пока стоит каменный венец на вершине Шулатлул-Гох, ни одна батарея Граббе не прицелится прямо в сакли Старого и Нового Ахульго!»',
        quoteEn:
          '“So long as the stone tower stands atop Shulatlul-Gokh, not a single battery of Grabbe can fire directly into Old and New Akhulgo!”',
        contextRu:
          'Генерал Граббе выдвинул осадные орудия против передового ключа Ахульго — Сурхаевой башни на утёсе Шулатлул-Гох, где заперлись 100 отборных мюридов Алибека. Ночью можно усилить их свинцом либо совершить встречную кинжальную вылазку на русские ложементы.',
        contextEn:
          'General Grabbe has brought siege guns to bear against the forward key of Akhulgo—Surkhay’s Tower atop Shulatlul-Gokh, held by 100 elite murids under Alibek. By night you may reinforce the tower or launch a dagger sortie against the Russian trenches.',
        choices: [
          {
            id: 'akh_c1_night_sortie',
            labelRu: 'Ночная вылазка в ложементы Граббе: опрокинуть туры и захватить зарядные ящики',
            labelEn: 'Night dagger sortie into Grabbe’s trenches: overturn gabions and seize powder chests',
            effectRu: 'Порох +28 пуд. | Натиск на Койсубу -16% | Авторитет +7%',
            effectEn: 'Powder +28 poods | Koisubu Pressure -16% | Authority +7%',
            powderDelta: 28,
            silverDelta: 0,
            provisionsDelta: -25,
            authorityDelta: 7,
            targetNaibId: 'karata',
            pressureDelta: -16,
            garrisonDelta: -35,
            murtazeksDelta: 20,
            openTacticalTerrainId: 'akhulgo_1839',
            chronicleRu:
              'Под покровом грозовой ночи мюриды Алибека и Ахбердил-Мухаммада ворвались в передовые траншеи под Шулатлул-Гох, отбросив штурмовые колонны Граббе.',
            chronicleEn:
              'Under cover of a stormy night, the murids of Alibek and Akhberdil-Muhammad stormed the forward trenches beneath Shulatlul-Gokh, driving back Grabbe’s assault columns.'
          },
          {
            id: 'akh_c1_deep_blindages',
            labelRu: 'Беречь людей: вырубить в скале крытые ниши от навесных мортирных бомб',
            labelEn: 'Preserve the defenders: carve rock shelters against high-angle mortar bombs',
            effectRu: 'Порох -12 пуд. | Гарнизон +140 | Стойкость Карата и Ахульго (Иман +10)',
            effectEn: 'Powder -12 poods | Garrison +140 | Akhulgo Endurance (Iman +10)',
            powderDelta: -12,
            silverDelta: 0,
            provisionsDelta: 40,
            authorityDelta: 5,
            targetNaibId: 'karata',
            pressureDelta: -10,
            garrisonDelta: 140,
            murtazeksDelta: 0,
            imanDelta: 10,
            chronicleRu:
              'Скальные казематы уберегли защитников Ахульго от чугунных пудовых бомб русской артиллерии.',
            chronicleEn:
              'Rock-hewn casemates shielded the defenders of Akhulgo from heavy Russian mortar shells.'
          }
        ]
      },
      {
        id: 'akhulgo_p2_water_gallery',
        step: 2,
        dateRu: 'Июль 1839 г.',
        dateEn: 'July 1839',
        titleRu: 'Фаза 2/4: Бревенчатая галерея к реке Ашильта и жажда в казематах',
        titleEn: 'Phase 2/4: The Timber Water Gallery to the Ashilta River',
        art: 'KeyArt_Salty_Siege_CopperBasin_1847.jpg',
        focusNaibateId: 'karata',
        speakerRu: 'Сурхай Карата и женщины Ахульго',
        speakerEn: 'Surkhay of Karata & the Women of Akhulgo',
        quoteRu:
          '«Каждая фляга воды из мутного Койсу оплачена свинцом. Прикрой бревенчатый спуск стрелками — иначе дети в пещерах не доживут до рассвета!»',
        quoteEn:
          '“Every flask of water from the turbulent Koisu is paid for in lead. Cover the timber descent with marksmen, or the children in the caves will not survive till dawn!”',
        contextRu:
          'Корпус Граббе перехватил тропы к речке Ашильта, рассчитывая сломить Ахульго летним зноем и жаждой. Горцы спускаются за водой на верёвках по отвесному утёсу под перекрёстным ружейным огнём.',
        contextEn:
          'Grabbe’s corps has cut off the paths to the Ashilta stream, hoping summer heat and thirst will break Akhulgo. Defenders descend cliffs on ropes under crossfire to draw water.',
        choices: [
          {
            id: 'akh_c2_build_shielded_chute',
            labelRu: 'Срубить из брёвен крытый ход к воде и выставить лучших штуцерников Гуниба',
            labelEn: 'Construct a shielded log gallery to the river guarded by Gunib sharpshooters',
            effectRu: 'Серебро -45 руб. | Провиант и вода +160 мер | Натиск -14%',
            effectEn: 'Silver -45 rub. | Water & Provisions +160 meas. | Pressure -14%',
            powderDelta: -10,
            silverDelta: -45,
            provisionsDelta: 160,
            authorityDelta: 8,
            targetNaibId: 'gunib',
            pressureDelta: -14,
            garrisonDelta: 60,
            chronicleRu:
              'Под огнём штуцеров восстановлен ночной спуск к реке Койсу: осаждённые пещеры Ахульго получили воду.',
            chronicleEn:
              'Covered by sharpshooters, the night descent to the Koisu was restored, bringing water to Akhulgo’s caves.'
          },
          {
            id: 'akh_c2_andi_flank_diversion',
            labelRu: 'Поднять ополчение Андии и Гумбета ударом в тыл осадного лагеря Граббе',
            labelEn: 'Rally the militia of Andia and Gumbet to strike the rear of Grabbe’s siege camp',
            effectRu: 'Порох +22 пуд. | Муртазеки +45 | Авторитет +6%',
            effectEn: 'Powder +22 poods | Murtazeks +45 | Authority +6%',
            powderDelta: 22,
            silverDelta: 40,
            provisionsDelta: 75,
            authorityDelta: 6,
            targetNaibId: 'karata',
            pressureDelta: -12,
            murtazeksDelta: 45,
            chronicleRu:
              'Конные дружины Андии атаковали обозную линию у Сагритло, оттянув два батальона РИ от приступа.',
            chronicleEn:
              'Mounted militia from Andia struck the supply bridge near Sagritlo, drawing two Russian battalions away from the assault.'
          }
        ]
      },
      {
        id: 'akhulgo_p3_jamaluddin_hostage',
        step: 3,
        dateRu: '17 августа 1839 г.',
        dateEn: 'August 17, 1839',
        titleRu: 'Фаза 3/4: Трагический совет — выдача 8-летнего сына Джемалуддина в аманаты',
        titleEn: 'Phase 3/4: The Tragic Council — Delivering 8-Year-Old Son Jamaluddin as Hostage',
        art: 'KeyArt_Michik_1855_Jamaluddin_Exchange.jpg',
        focusNaibateId: 'karata',
        speakerRu: 'Юнус Чиркеевский (верный мюрид Имама)',
        speakerEn: 'Yunus of Chirkey (Faithful Murid of the Imam)',
        quoteRu:
          '«Стены разбиты минами, порох на исходе, в пещерах плачут израненные семьи. Граббе требует твоего первенца Джемалуддина за прекращение огня…»',
        quoteEn:
          '“The walls are shattered by mines, powder is nearly spent, and wounded families weep in the caves. Grabbe demands your firstborn Jamaluddin to halt the bombardment…”',
        contextRu:
          'После подрыва минных галерей русские колонны закрепились на Новом Ахульго. Генерал Граббе ставит ультиматум о переговорах под залог выдачи восьмилетнего сына Шамиля — Джемалуддина. Совет старейшин умоляет выиграть передышку для раненых.',
        contextEn:
          'After mine detonations Russian columns gained a foothold on New Akhulgo. General Grabbe demands Shamil’s eight-year-old son Jamaluddin as hostage for truce talks while elders plead for time to tend the wounded.',
        choices: [
          {
            id: 'akh_c3_historical_sacrifice',
            labelRu: 'Принести отцовскую жертву ради спасения семей на скале, но отвергнуть капитуляцию',
            labelEn: 'Make a father’s sacrifice to win respite for the families, yet refuse capitulation',
            effectRu: 'Авторитет Имама +14% | Иман всех наибов +10 | Передышка гарнизона (+90 провианта)',
            effectEn: 'Imam’s Authority +14% | All Naibs Iman +10 | Garrison Respite (+90 provisions)',
            powderDelta: 10,
            silverDelta: 0,
            provisionsDelta: 90,
            authorityDelta: 14,
            targetNaibId: 'karata',
            imanDelta: 10,
            pressureDelta: -8,
            chronicleRu:
              '17 августа 1839 г. восьмилетний Джемалуддин передан в лагерь Граббе; но когда от Имама потребовали сложить оружие и покинуть горы, переговоры оборвались — впереди прорыв и 16 лет ожидания до Мичика.',
            chronicleEn:
              'On August 17, 1839, eight-year-old Jamaluddin was delivered to Grabbe’s camp; when unconditional surrender was demanded, talks broke off—setting the stage for a 16-year wait until the Michik exchange.'
          },
          {
            id: 'akh_c3_defiant_stand',
            labelRu: 'Отвергнуть ультиматум Граббе с порога и раздать последние заряды мюридам',
            labelEn: 'Reject Grabbe’s ultimatum outright and distribute the last cartridges to the murids',
            effectRu: 'Порох -15 пуд. | Муртазеки +55 | Ожесточённый штурм (+8% натиск)',
            effectEn: 'Powder -15 poods | Murtazeks +55 | Fierce Assault (+8% pressure)',
            powderDelta: -15,
            silverDelta: 0,
            provisionsDelta: 0,
            authorityDelta: 9,
            targetNaibId: 'karata',
            murtazeksDelta: 55,
            pressureDelta: 8,
            chronicleRu:
              'Совет на скале Ахульго отверг условия Граббе; горцы приготовились пробиваться сквозь ночные пикеты с шашками в руках.',
            chronicleEn:
              'The council on Akhulgo cliff spurned Grabbe’s terms, preparing to cut through the night pickets saber in hand.'
          }
        ]
      },
      {
        id: 'akhulgo_p4_breakout_chechnya',
        step: 4,
        dateRu: 'Ночь на 22 августа 1839 г.',
        dateEn: 'Night of August 22, 1839',
        titleRu: 'Фаза 4/4: Прорыв сквозь тройной кордон в Ичкерию — Возрождение Имамата',
        titleEn: 'Phase 4/4: Breakout Through the Triple Cordon to Ichkeria — Rebirth of the Imamate',
        art: 'Diorama_Ichkeria_Forest_Ambush_1845.jpg',
        focusNaibateId: 'benoy',
        speakerRu: 'Байсунгур Беноевский и Ахбердил-Мухаммад',
        speakerEn: 'Baysungur of Benoy & Akhberdil-Muhammad',
        quoteRu:
          '«Граббе уже отправил в Петербург реляцию, будто война окончена. Пусть празднует взятие голых камней — в буковых лесах Беноя и Дарго тебя ждут тысячи чеченских сабель!»',
        quoteEn:
          '“Grabbe has already wired St. Petersburg that the war is won. Let him celebrate bare stones—in the beech forests of Benoy and Dargo thousands of Chechen sabers await your banner!”',
        contextRu:
          'Раненый Шамиль с горсткой сподвижников (Юнус Чиркеевский, Ахбердил-Мухаммад) в темноте спускается к реке Койсу, прорывается сквозь цепь часовых и уходит тропами в лесную Чечню, где общества Шубута и Ичкерии приносят ему присягу.',
        contextEn:
          'Wounded Shamil and a handful of companions slip down to the Koisu by night, break through the sentry cordon, and cross into forested Chechnya where the communities of Ichkeria swear allegiance.',
        choices: [
          {
            id: 'akh_c4_ichkeria_rebirth',
            labelRu: 'Принять присягу обществ Ичкерии и перенести ставку возрождённого Имамата в Дарго-Ведено!',
            labelEn: 'Accept Ichkeria’s oath of allegiance and raise the reborn Imamate’s capital in Dargo-Vedeno!',
            effectRu: 'Столица → Дарго-Ведено | Гарнизон Беноя и Ведено +320 | Серебро +160 руб. | Порох +45 пуд.',
            effectEn: 'Capital → Dargo-Vedeno | Benoy & Vedeno Garrison +320 | Silver +160 rub. | Powder +45 poods',
            powderDelta: 45,
            silverDelta: 160,
            provisionsDelta: 180,
            authorityDelta: 15,
            targetNaibId: 'benoy',
            pressureDelta: -20,
            garrisonDelta: 320,
            murtazeksDelta: 80,
            relocateCapitalTo: { id: 'vedeno', labelRu: 'Дарго-Ведено', labelEn: 'Dargo-Vedeno' },
            chronicleRu:
              'ЭПИЗОД I ЗАВЕРШЁН: Из пепла Ахульго в вековых лесах Чечни поднялось централизованное государство — Северо-Кавказский Имамат со столицей в Дарго!',
            chronicleEn:
              'EPISODE I COMPLETE: From the ashes of Akhulgo arose a centralized mountain state in forested Chechnya with its capital at Dargo!'
          },
          {
            id: 'akh_c4_guerilla_avaria_return',
            labelRu: 'Закрепиться в неприступной Карата и сразу развернуть партизанскую войну в Нагорном Дагестане',
            labelEn: 'Hold fast in highland Karata and ignite immediate guerrilla warfare across Dagestan',
            effectRu: 'Порох +55 пуд. | Муртазеки +110 | Натиск в Дагестане -18%',
            effectEn: 'Powder +55 poods | Murtazeks +110 | Dagestan Pressure -18%',
            powderDelta: 55,
            silverDelta: 110,
            provisionsDelta: 120,
            authorityDelta: 12,
            targetNaibId: 'karata',
            pressureDelta: -18,
            murtazeksDelta: 110,
            chronicleRu:
              'ЭПИЗОД I ЗАВЕРШЁН: Опираясь на общества Андии и Ичкерии, Имам Шамиль сохранил ядро армии в самых неприступных ущельях.',
            chronicleEn:
              'EPISODE I COMPLETE: Backed by Andia and Ichkeria, Imam Shamil preserved his core forces in the high gorges.'
          }
        ]
      }
    ]
  },

  // ==========================================================================
  // ЭПИЗОД II. «СВЕРКАЮЩИЙ ГАЗАВАТ» (ОСЕНЬ 1843 Г.) — НАСТУПАТЕЛЬНЫЙ РЕЖИМ
  // ==========================================================================
  {
    id: 'ep_1843_shining_ghazawat',
    scenarioId: 'camp_1843',
    episodeNumber: 'II',
    yearsLabelRu: 'Август — Ноябрь 1843 г.',
    yearsLabelEn: 'August — November 1843',
    titleRu: 'Эпизод II: «Сверкающий Газават» — Крушение царских крепостей в Аварии',
    titleEn: 'Episode II: “The Shining Ghazawat” — Fall of the Imperial Fortresses in Avaria',
    subtitleRu: 'Наступательная молниеносная кампания: взятие Унцукуля, Хунзаха, Гоцатля и Гергебиля (27 трофейных орудий!)',
    subtitleEn: 'Lightning offensive campaign: storming Untsukul, Khunzakh, Gotsatl & Gergebil (27 captured cannons!)',
    capitalNaibateId: 'vedeno',
    capitalLabelRu: 'Ставка Дарго',
    capitalLabelEn: 'Dargo HQ',
    initialImperialHeldIds: ['khunzakh', 'gergebil', 'chokh'],
    nextChainEpisodeId: null,
    phases: [
      {
        id: 'ghazawat_p1_untsukul',
        step: 1,
        dateRu: '28 августа — 2 сентября 1843 г.',
        dateEn: 'August 28 — September 2, 1843',
        titleRu: 'Фаза 1/4: Скрытный сбор у Дишни-Ведено и удар по Унцукулю',
        titleEn: 'Phase 1/4: Secret Concentration & the Storming of Untsukul',
        art: 'Crisis_Kabarda_Tatartup_1846.jpg',
        focusNaibateId: 'gergebil',
        speakerRu: 'Кибит-Магома Телетлинский (мудир Среднего Дагестана)',
        speakerEn: 'Kibit-Magoma of Teletl (Mudir of Central Dagestan)',
        quoteRu:
          '«Русские гарнизоны разбросаны на двенадцать мелких укреплений по всей Аварии. Сведём три конные колонны с разных перевалов в один день — и разобьём подмогу подполковника Веселовского на марше!»',
        quoteEn:
          '“Russian garrisons lie scattered across twelve isolated forts throughout Avaria. Let three mounted columns converge on a single day and crush Lt. Col. Veselovsky’s relief force on the march!”',
        contextRu:
          'Три конные колонны (Шамиль из Ичкерии, Кибит-Магома из Телетля и Хаджи-Мурат из Аварии) внезапно блокируют царское укрепление в Унцукуле. Отряд подполковника Веселовского с 2 горными единорогами спешит на выручку по узкому карнизу.',
        contextEn:
          'Three mounted columns (Shamil, Kibit-Magoma, and Hadji Murad) suddenly invest the Tsarist fort at Untsukul as Lt. Col. Veselovsky’s relief detachment hurries along a narrow cliff road.',
        choices: [
          {
            id: 'ghaz_c1_ambush_veselovsky',
            labelRu: 'Перехватить колонну Веселовского в теснине Цатаних и взять первые 2 единорога!',
            labelEn: 'Ambush Veselovsky’s relief column in the Tsatanikh defile and capture the first 2 unicorns!',
            effectRu: 'Трофейный порох +40 пуд. | Серебро +110 руб. | Натиск у Гергебиля -20%',
            effectEn: 'Captured Powder +40 poods | Silver +110 rub. | Gergebil Pressure -20%',
            powderDelta: 40,
            silverDelta: 110,
            provisionsDelta: 90,
            authorityDelta: 9,
            targetNaibId: 'gergebil',
            pressureDelta: -20,
            murtazeksDelta: 45,
            chronicleRu:
              'У Цатаниха отряд Веселовского разгромлен конным охватом наибов; Унцукульское укрепление пало, положив начало триумфу осени 1843 года.',
            chronicleEn:
              'Near Tsatanikh, Veselovsky’s relief force was crushed by converging Naib cavalry; Fort Untsukul fell, igniting the autumn 1843 offensive.'
          },
          {
            id: 'ghaz_c1_storm_fort_directly',
            labelRu: 'Повести подземную сапу прямо под бастион Унцукуля силами инженеров Телетля',
            labelEn: 'Drive a sapper mine directly beneath Untsukul’s bastion with Teletl engineers',
            effectRu: 'Порох +25 пуд. | Гарнизон Телетля +180 | Авторитет +7%',
            effectEn: 'Powder +25 poods | Teletl Garrison +180 | Authority +7%',
            powderDelta: 25,
            silverDelta: 80,
            provisionsDelta: 120,
            authorityDelta: 7,
            targetNaibId: 'teletl',
            pressureDelta: -16,
            garrisonDelta: 180,
            chronicleRu:
              'Гарнизон Унцукуля сложил оружие перед угрозой минного подрыва; склады провианта перешли в руки Диван-ханы.',
            chronicleEn:
              'Facing imminent mine detonation, Untsukul’s garrison surrendered its magazines to the Divan-Khana.'
          }
        ]
      },
      {
        id: 'ghazawat_p2_khunzakh_liberation',
        step: 2,
        dateRu: 'Сентябрь 1843 г.',
        dateEn: 'September 1843',
        titleRu: 'Фаза 2/4: Освобождение Хунзахского плато вместе с Хаджи-Муратом',
        titleEn: 'Phase 2/4: Liberation of the Khunzakh Plateau Alongside Hadji Murad',
        art: 'Orders_Shamil_Kubachi_Showcase_1845.jpg',
        focusNaibateId: 'khunzakh',
        speakerRu: 'Хаджи-Мурат Хунзахский («Крылатый барс Аварии»)',
        speakerEn: 'Hadji Murad of Khunzakh (“Winged Leopard of Avaria”)',
        quoteRu:
          '«Над водопадом Тобот снова взовьётся знамя Имамата! Вся Авария поднялась как один человек — русским комендантам в Хунзахе и Гоцатле больше не откуда ждать подмоги!»',
        quoteEn:
          '“Above the Tobot waterfall the banner of the Imamate shall fly once more! All Avaria has risen as one—Russian commandants in Khunzakh and Gotsatl have nowhere left to look for relief!”',
        contextRu:
          'Восстание охватывает всё Аварское плато. Пали укрепления Балахани, Моксох и Цатаних; впереди древняя столица аварских ханов — Хунзахская цитадель.',
        contextEn:
          'All of the Avar Plateau rises in arms. Forts Balakhani, Moksokh, and Tsatanikh have fallen; ahead stands the ancient citadel of Khunzakh.',
        choices: [
          {
            id: 'ghaz_c2_liberate_khunzakh',
            labelRu: 'Взять Хунзах и Гоцатль конным штурмом Хаджи-Мурата и перенести передовую ставку в Аварию!',
            labelEn: 'Storm Khunzakh and Gotsatl with Hadji Murad’s cavalry and raise the forward banner in Avaria!',
            effectRu: 'Освобождён Хунзах! | Ставка → Хунзах | Муртазеки +90 | Порох +35 пуд.',
            effectEn: 'Khunzakh Liberated! | HQ → Khunzakh | Murtazeks +90 | Powder +35 poods',
            powderDelta: 35,
            silverDelta: 150,
            provisionsDelta: 160,
            authorityDelta: 11,
            targetNaibId: 'khunzakh',
            pressureDelta: -25,
            garrisonDelta: 250,
            murtazeksDelta: 90,
            liberateNaibateId: 'khunzakh',
            relocateCapitalTo: { id: 'khunzakh', labelRu: 'Хунзах (Ставка 1843)', labelEn: 'Khunzakh (1843 HQ)' },
            chronicleRu:
              'Знамя Имамата поднято над Хунзахским плато! В руки горцев попали богатейшие цейхгаузы Аварского ханства.',
            chronicleEn:
              'The Imamate’s banner flies over Khunzakh Plateau! Rich Tsarist magazines across Avaria were seized.'
          },
          {
            id: 'ghaz_c2_blockade_passek_retreat',
            labelRu: 'Прижать отступающий отряд полковника Пассека к обрыву у Зирани и отбить артиллерийский парк',
            labelEn: 'Pin Col. Passek’s retreating detachment at Zirani and seize its artillery park',
            effectRu: 'Освобождён Хунзах! | Порох +55 пуд. | Серебро +120 руб.',
            effectEn: 'Khunzakh Liberated! | Powder +55 poods | Silver +120 rub.',
            powderDelta: 55,
            silverDelta: 120,
            provisionsDelta: 100,
            authorityDelta: 9,
            targetNaibId: 'khunzakh',
            pressureDelta: -22,
            liberateNaibateId: 'khunzakh',
            chronicleRu:
              'При поспешном отходе из Хунзаха колонна Пассека оставила горцам полевые орудия и зарядные фуры.',
            chronicleEn:
              'During its hasty retreat from Khunzakh, Passek’s column abandoned field guns and ammunition wagons.'
          }
        ]
      },
      {
        id: 'ghazawat_p3_gergebil_guns',
        step: 3,
        dateRu: '28 октября — 8 ноября 1843 г.',
        dateEn: 'October 28 — November 8, 1843',
        titleRu: 'Фаза 3/4: Осада царского укрепления Гергебиль — рождение артиллерии Шамиля',
        titleEn: 'Phase 3/4: Storming Imperial Fort Gergebil — Birth of Shamil’s Artillery Corps',
        art: 'KeyArt_Vedeno_Foundry_and_PowderMill_1846.jpg',
        focusNaibateId: 'gergebil',
        speakerRu: 'Талхиг Шалинский и Хаджи-Юсуф Сафаров',
        speakerEn: 'Talkhig of Shali & Hajji Yusuf Safarov',
        quoteRu:
          '«Впервые не мы сидим под русскими бомбами, а наши трофейные единороги бьют по блокгаузам Гергебиля! Отведём воду из ручья — и гарнизон сдаст орудия целыми!»',
        quoteEn:
          '“For the first time it is not we who sit under Russian shells, but our captured unicorns battering Fort Gergebil’s blockhouses! Divert their water stream and the guns are ours intact!”',
        contextRu:
          '10-дневная правильная осада русского укрепления у слияния рек Койсу в Гергебиле. Генерал Гурко подошёл к высотам, но не решился спуститься в ущелье на выручку обречённому блокгаузу.',
        contextEn:
          'A 10-day regular siege against the Russian fort at the Koisu confluence in Gergebil. General Gurko reached the heights above but dared not descend into the gorge.',
        choices: [
          {
            id: 'ghaz_c3_divert_water_capture_guns',
            labelRu: 'Отвести горный поток и взять Гергебиль с Чохом — сформировать дивизион из 27 трофейных пушек!',
            labelEn: 'Divert the mountain stream and capture Gergebil & Chokh — form a 27-gun artillery corps!',
            effectRu: 'Освобождены Гергебиль и Чох! | Порох +65 пуд. | Гарнизоны +280',
            effectEn: 'Gergebil & Chokh Liberated! | Powder +65 poods | Garrisons +280',
            powderDelta: 65,
            silverDelta: 140,
            provisionsDelta: 150,
            authorityDelta: 12,
            targetNaibId: 'gergebil',
            pressureDelta: -26,
            garrisonDelta: 280,
            liberateNaibateId: 'gergebil',
            alsoLiberateId: 'chokh',
            openTacticalTerrainId: 'salty_1847',
            chronicleRu:
              '8 ноября 1843 г. пал укреплённый Гергебиль! За 24 дня кампании взято 12 царских крепостей и 27 медных орудий — в Имамате родился собственный артиллерийский корпус!',
            chronicleEn:
              'On November 8, 1843, Fort Gergebil fell! Twelve Tsarist forts and 27 bronze cannons were captured, birthing the Imamate’s own artillery corps!'
          },
          {
            id: 'ghaz_c3_repulse_gurko_heights',
            labelRu: 'Ударить конницей по авангарду генерала Гурко на Акайтау и захватить обоз',
            labelEn: 'Strike General Gurko’s vanguard on the Akaitau heights with cavalry and seize his convoy',
            effectRu: 'Освобождены Гергебиль и Чох! | Серебро +210 руб. | Провиант +200 мер',
            effectEn: 'Gergebil & Chokh Liberated! | Silver +210 rub. | Provisions +200 meas.',
            powderDelta: 35,
            silverDelta: 210,
            provisionsDelta: 200,
            authorityDelta: 10,
            targetNaibId: 'chokh',
            pressureDelta: -22,
            liberateNaibateId: 'gergebil',
            alsoLiberateId: 'chokh',
            chronicleRu:
              'Отряд генерала Гурко отступил к Темир-Хан-Шуре, оставив весь Нагорный Дагестан под властью Диван-ханы.',
            chronicleEn:
              'General Gurko retreated toward Temir-Khan-Shura, leaving all Highland Dagestan under the Divan-Khana.'
          }
        ]
      },
      {
        id: 'ghazawat_p4_temir_khan_shura',
        step: 4,
        dateRu: 'Ноябрь — Декабрь 1843 г.',
        dateEn: 'November — December 1843',
        titleRu: 'Фаза 4/4: Осада Темир-Хан-Шуры и триумфальное учреждение Диван-ханы',
        titleEn: 'Phase 4/4: Blockade of Temir-Khan-Shura & Triumph of the Divan-Khana',
        art: 'KeyArt_DivanKhana_Council_Vedeno_1845.jpg',
        focusNaibateId: 'khunzakh',
        speakerRu: 'Имам Шамиль перед советом мудиров и наибов',
        speakerEn: 'Imam Shamil Before the Council of Mudirs & Naibs',
        quoteRu:
          '«Мечом мы очистили горы от двенадцати крепостей. Теперь укрепим державу законом Низамов, казной Байт аль-маль и литейными дворами — ибо царь Николай пришлёт против нас новую стотысячную армию!»',
        quoteEn:
          '“By the sword we cleared the mountains of twelve forts. Now let us cement the realm with the Nizam Code, the Bayt al-Mal treasury, and cannon foundries—for Tsar Nicholas will soon send a hundred-thousand-man army!”',
        contextRu:
          'Штаб Северного Дагестана в Темир-Хан-Шуре заперт в кольце осады, а шамхал Тарковский бежал на плоскость. Вся территория Имамата удвоилась — настало время закрепить победу государственным устройством.',
        contextEn:
          'Russian HQ at Temir-Khan-Shura is blockaded and the territory of the Imamate has doubled—now you must consolidate victory into lasting state institutions.',
        choices: [
          {
            id: 'ghaz_c4_found_divan_nizams',
            labelRu: 'Учредить постоянный Государственный совет Диван-хану, 4 мудирства и пушечные мастерские',
            labelEn: 'Establish the permanent Divan-Khana State Council, 4 Mudirates & cannon foundries',
            effectRu: 'Казна +260 руб. | Порох +50 пуд. | Авторитет +15% | Все наибы Иман +8',
            effectEn: 'Treasury +260 rub. | Powder +50 poods | Authority +15% | All Naibs Iman +8',
            powderDelta: 50,
            silverDelta: 260,
            provisionsDelta: 220,
            authorityDelta: 15,
            targetNaibId: 'vedeno',
            imanDelta: 8,
            pressureDelta: -18,
            relocateCapitalTo: { id: 'vedeno', labelRu: 'Дарго-Ведено', labelEn: 'Dargo-Vedeno' },
            chronicleRu:
              'ЭПИЗОД II ЗАВЕРШЁН ТРИУМФОМ: «Сверкающий Газават» 1843 года освободил всю Аварию и заложил стальной фундамент регулярной армии и Низамов Имамата!',
            chronicleEn:
              'EPISODE II COMPLETED IN TRIUMPH: The “Shining Ghazawat” of 1843 liberated all Avaria and forged the institutional backbone of the Imamate!'
          },
          {
            id: 'ghaz_c4_raid_caspian_kumyk',
            labelRu: 'Бросить конницу на Кумыкскую плоскость и к Дербенту для захвата царских складов',
            labelEn: 'Sweep the Kumyk Plain toward the Caspian to capture Imperial supply depots',
            effectRu: 'Серебро +340 руб. | Провиант +280 мер | Муртазеки +75',
            effectEn: 'Silver +340 rub. | Provisions +280 meas. | Murtazeks +75',
            powderDelta: 30,
            silverDelta: 340,
            provisionsDelta: 280,
            authorityDelta: 11,
            targetNaibId: 'irib',
            murtazeksDelta: 75,
            pressureDelta: -12,
            chronicleRu:
              'ЭПИЗОД II ЗАВЕРШЁН: Конные лавы прошли до берегов Каспия, наполнив казну Байт аль-маль перед большой войной 1845 года.',
            chronicleEn:
              'EPISODE II COMPLETE: Mounted squadrons swept down toward the Caspian shore, filling the Bayt al-Mal treasury ahead of 1845.'
          }
        ]
      }
    ]
  },

  // ==========================================================================
  // ЭПИЗОД III. «ДАРГИНСКАЯ ЗАПАДНЯ И СУХАРНАЯ ОКАЗИЯ» (ЛЕТО 1845 Г.)
  // ==========================================================================
  {
    id: 'ep_1845_dargo',
    scenarioId: 'camp_1845',
    episodeNumber: 'III',
    yearsLabelRu: 'Июнь — Август 1845 г. (Ходы 1–4)',
    yearsLabelEn: 'June — August 1845 (Turns 1–4)',
    titleRu: 'Эпизод III: «Даргинская западня» — Гибель колонны графа Воронцова в буковых лесах',
    titleEn: 'Episode III: “The Dargo Trap” — Vorontsov’s Ordeal in the Beech Forests',
    subtitleRu: 'От «снежного бунта» на перевале Кырк и сожжения старого Дарго до разгрома «Сухарной оказии» Пассека и закладки Ведено',
    subtitleEn: 'From the Kyrk snow pass and burning of old Dargo to routing Passek’s Biscuit Convoy and founding Vedeno',
    capitalNaibateId: 'vedeno',
    capitalLabelRu: 'Дарго-Ведено',
    capitalLabelEn: 'Dargo-Vedeno',
    initialImperialHeldIds: [],
    nextChainEpisodeId: 'ep_1853_crimean_michik',
    phases: [
      {
        id: 'dargo_p1_kyrk_pass',
        step: 1,
        dateRu: '14–21 июня 1845 г.',
        dateEn: 'June 14–21, 1845',
        titleRu: 'Фаза 1/4: Андийские ворота и «снежный бунт» на перевале Кырк',
        titleEn: 'Phase 1/4: The Andi Gates & Snowstorm on Kyrk Pass',
        art: 'Caucasus_SRTM_Winter_Snow_1845.jpg',
        focusNaibateId: 'karata',
        speakerRu: 'Гази-Мухаммад (наиб Карата и Андийского хребта)',
        speakerEn: 'Ghazi-Muhammad (Naib of Karata & Andi Ridge)',
        quoteRu:
          '«Двадцать тысяч солдат Воронцова застряли в июньской вьюге на перевале Кырк без дров и тёплых шинелей! Уведём отары, сожжём старые запасы в Андии — заманим наместника в лесной мешок Ичкерии!»',
        quoteEn:
          '“Twenty thousand of Vorontsov’s soldiers are freezing in a June blizzard atop Kyrk Pass without firewood! Drive off the flocks and lure the Viceroy deep into Ichkeria’s forest trap!”',
        contextRu:
          'По личному повелению Николая I наместник граф М. С. Воронцов двинул 20-тысячный корпус через высокогорный перевал Кырк к столице Дарго. Уже на перевале стужа и бескормица начали косить обозных лошадей РИ.',
        contextEn:
          'By Tsar Nicholas I’s personal command, Viceroy Vorontsov marches 20,000 troops across high Kyrk Pass toward Dargo as unseasonable blizzards decimate his pack horses.',
        choices: [
          {
            id: 'drg_c1_scorched_lure',
            labelRu: 'Исполнить скифский манёвр Шамиля: сдать перевал боем арьергарда и растянуть коммуникации Воронцова',
            labelEn: 'Execute Shamil’s Scythian maneuver: yield the pass slowly and stretch Vorontsov’s supply line',
            effectRu: 'Натиск в Андии -14% | Авторитет +8% | Подготовка засад (+30 пуд. пороха)',
            effectEn: 'Andi Pressure -14% | Authority +8% | Ambush Readiness (+30 poods powder)',
            powderDelta: 30,
            silverDelta: 50,
            provisionsDelta: 110,
            authorityDelta: 8,
            targetNaibId: 'karata',
            pressureDelta: -14,
            chronicleRu:
              'Шамиль намеренно втянул огромную армию Воронцова через Андийский хребет в лишённые дорог ущелья Ичкерии.',
            chronicleEn:
              'Shamil deliberately drew Vorontsov’s massive army across the Andi Ridge into the roadless gorges of Ichkeria.'
          },
          {
            id: 'drg_c1_butsrah_stand',
            labelRu: 'Дать жёсткий встречный бой на укреплённой позиции Буцрах силами андийских стрелков',
            labelEn: 'Fight a fierce delaying battle on the fortified Butsrakh ridge with Andi riflemen',
            effectRu: 'Порох -18 пуд. | Натиск врага -20% | Гарнизон Карата +150',
            effectEn: 'Powder -18 poods | Enemy Pressure -20% | Karata Garrison +150',
            powderDelta: -18,
            silverDelta: 80,
            provisionsDelta: 60,
            authorityDelta: 7,
            targetNaibId: 'karata',
            pressureDelta: -20,
            garrisonDelta: 150,
            chronicleRu:
              'Бой у скал Буцраха задержал авангард князя Барятинского и заставил корпус РИ сжечь недельный запас патронов.',
            chronicleEn:
              'The stand at Butsrakh delayed Prince Baryatinsky’s vanguard and forced the Imperial corps to burn a week’s ammunition.'
          }
        ]
      },
      {
        id: 'dargo_p2_burning_capital',
        step: 2,
        dateRu: '6–7 июля 1845 г.',
        dateEn: 'July 6–7, 1845',
        titleRu: 'Фаза 2/4: Пепел старого Дарго и прицел с горы над лагерем наместника',
        titleEn: 'Phase 2/4: Ashes of Old Dargo & Cannon Fire Over the Viceroy’s Camp',
        art: 'KeyArt_Dargo_BeechForest_Ambush_1845.jpg',
        focusNaibateId: 'benoy',
        speakerRu: 'Имам Шамиль (глядя на пылающие сакли Дарго)',
        speakerEn: 'Imam Shamil (Watching the Burning Houses of Dargo)',
        quoteRu:
          '«Воронцов шёл сюда, как Бонапарт в Москву, мечтая продиктовать нам мир в моей кунацкой. Пусть найдёт одни головешки — а ночью наши единороги с правого берега Аксая не дадут уснуть ни одному генералу!»',
        quoteEn:
          '“Vorontsov marched here like Bonaparte to Moscow, dreaming of dictating peace in my chamber. Let him find only glowing embers—while by night our cannons shell his camp across the Aksay!”',
        contextRu:
          'Вывезя семьи, архив и казну, мюриды предали столицу Дарго огню. Воронцов вошёл в пустое пепелище, окружённое густым буковым лесом, а продовольствие в его ранцевом запасе подошло к концу.',
        contextEn:
          'Having evacuated families, archives, and the treasury, the murids put old Dargo to the torch. Vorontsov occupies empty ashes ringed by beech forest with rations nearly exhausted.',
        choices: [
          {
            id: 'drg_c2_night_cannonade_aksay',
            labelRu: 'Выкатить трофейные орудия Талхига на высоты Аксая и каждую ночь обстреливать бивак Воронцова',
            labelEn: 'Haul Talkhig’s captured guns onto the Aksay heights to shell Vorontsov’s camp nightly',
            effectRu: 'Натиск на Беной и Ведено -18% | Авторитет +10% | Иман Беноя +12',
            effectEn: 'Benoy & Vedeno Pressure -18% | Authority +10% | Benoy Iman +12',
            powderDelta: -15,
            silverDelta: 90,
            provisionsDelta: 120,
            authorityDelta: 10,
            targetNaibId: 'benoy',
            imanDelta: 12,
            pressureDelta: -18,
            openTacticalTerrainId: 'dargo_1845',
            chronicleRu:
              'С высот правого берега Аксая горная артиллерия Имамата держала под огнём ставку графа Воронцова в сожжённом Дарго.',
            chronicleEn:
              'From the Aksay heights, Imamate mountain guns kept Count Vorontsov’s headquarters in burned Dargo under relentless fire.'
          },
          {
            id: 'drg_c2_fell_giant_beeches',
            labelRu: 'Повалить вековые буки в 12 ярусов завалов на всех обратных тропах из Дарго',
            labelEn: 'Fell giant beech trees into 12-tiered abatis across every exit trail from Dargo',
            effectRu: 'Порох +20 пуд. | Муртазеки в Беное +55 | Натиск -14%',
            effectEn: 'Powder +20 poods | Benoy Murtazeks +55 | Pressure -14%',
            powderDelta: 20,
            silverDelta: 60,
            provisionsDelta: 140,
            authorityDelta: 8,
            targetNaibId: 'benoy',
            murtazeksDelta: 55,
            pressureDelta: -14,
            chronicleRu:
              'Сотни Байсунгура и Суаиб-Муллы перегородили лесные дефиле Ичкерии неприступными засеками из столетних буков.',
            chronicleEn:
              'Squadrons under Baysungur and Shuaib-Mullah sealed Ichkeria’s forest defiles with massive beech abatis.'
          }
        ]
      },
      {
        id: 'dargo_p3_biscuit_expedition',
        step: 3,
        dateRu: '10–12 июля 1845 г.',
        dateEn: 'July 10–12, 1845',
        titleRu: 'Фаза 3/4: Разгром «Сухарной экспедиции» на хребте Речель — гибель генералов Пассека и Викторова',
        titleEn: 'Phase 3/4: Rout of the “Biscuit Expedition” on Rechel Ridge — Fall of Generals Passek & Viktorov',
        art: 'Diorama_Ichkeria_Forest_Ambush_1845.jpg',
        focusNaibateId: 'benoy',
        speakerRu: 'Байсунгур Беноевский (с обнажённой шашкой у лесного завала)',
        speakerEn: 'Baysungur of Benoy (Shashka Drawn at the Forest Abatis)',
        quoteRu:
          '«Колонна Клугенау и Пассека растянулась на пять вёрст в скользкой грязи под ливнем! Бейте в стыки батальонов — ни один куль сухарей не дойдёт до Дарго!»',
        quoteEn:
          '“Klugenau and Passek’s column is stretched five versts through rain-slicked mud! Strike the gaps between battalions—not a single sack of biscuits shall reach Dargo!”',
        contextRu:
          'Голодающий Воронцов отправил назад на хребет Речель колонну генералов Клугенау, Викторова и Пассека за провиантским транспортом. В густом тумане и буковом лесу чеченские и дагестанские наибы рассекли колонну на части.',
        contextEn:
          'Starving in Dargo, Vorontsov sent Generals Klugenau, Viktorov, and Passek back onto Rechel Ridge to bring up the supply train. In dense fog and beech woods the Naibs sliced the column apart.',
        choices: [
          {
            id: 'drg_c3_shatter_rechel_convoy',
            labelRu: 'Рассечь колонну на завалах Речеля: захватить 3 орудия, полковую казну и весь обоз!',
            labelEn: 'Shatter the column at the Rechel abatis: seize 3 cannons, the regimental chest & supply wagons!',
            effectRu: 'Порох +55 пуд. | Серебро +190 руб. | Провиант +220 мер | Авторитет +14%',
            effectEn: 'Powder +55 poods | Silver +190 rub. | Provisions +220 meas. | Authority +14%',
            powderDelta: 55,
            silverDelta: 190,
            provisionsDelta: 220,
            authorityDelta: 14,
            targetNaibId: 'benoy',
            pressureDelta: -24,
            murtazeksDelta: 50,
            chronicleRu:
              '11 июля 1845 г. «Сухарная экспедиция» потерпела сокрушительный разгром на хребте Речель: пали генералы Пассек и Викторов, потеряны орудия и весь провиантский обоз.',
            chronicleEn:
              'On July 11, 1845, the “Biscuit Expedition” was routed on Rechel Ridge: Generals Passek and Viktorov fell, losing cannons and the entire supply train.'
          },
          {
            id: 'drg_c3_capture_powder_caissons',
            labelRu: 'Сосредоточить удар на артиллерийских зарядных фурах и штуцерных командах РИ',
            labelEn: 'Focus the assault on Imperial artillery caissons and rifle detachments',
            effectRu: 'Порох +80 пуд. | Гарнизон Шали и Беноя +200 | Натиск -18%',
            effectEn: 'Powder +80 poods | Shali & Benoy Garrison +200 | Pressure -18%',
            powderDelta: 80,
            silverDelta: 95,
            provisionsDelta: 130,
            authorityDelta: 11,
            targetNaibId: 'shali',
            pressureDelta: -18,
            garrisonDelta: 200,
            chronicleRu:
              'Захваченные на Речеле артиллерийские ящики пополнили пороховые погреба Ведено и Шали на целый год вперёд.',
            chronicleEn:
              'Ammunition caissons captured on Rechel Ridge stocked the powder magazines of Vedeno and Shali for a full year.'
          }
        ]
      },
      {
        id: 'dargo_p4_gerzel_and_vedeno',
        step: 4,
        dateRu: '13–20 июля 1845 г.',
        dateEn: 'July 13–20, 1845',
        titleRu: 'Фаза 4/4: Преследование до Шамхал-Берды и возведение новой столицы в Ведено',
        titleEn: 'Phase 4/4: Pursuit to Gerzel-Aul & Founding the New Capital at Vedeno',
        art: 'KeyArt_DivanKhana_Council_Vedeno_1845.jpg',
        focusNaibateId: 'vedeno',
        speakerRu: 'Мухаммад Тахир аль-Карахи (летописец Диван-ханы)',
        speakerEn: 'Muhammad Tahir al-Qarakhi (Chronicler of the Divan-Khana)',
        quoteRu:
          '«Лишь подход дивизии Фрейтага к Герзель-аулу спас остатки корпуса Воронцова, потерявшего 4 тысячи солдат и трёх генералов. А в долине Хулхулау застучали топоры — строится неприступное Дарго-Ведено!»',
        quoteEn:
          '“Only Gen. Freytag’s relief march to Gerzel-Aul saved the remnants of Vorontsov’s corps after losing 4,000 men and three generals. Meanwhile in the Khulkhulau valley axes ring out—fortress Dargo-Vedeno rises!”',
        contextRu:
          'Бросив обозы и сжигая портфели штаба, колонна Воронцова пробивается по гребню к Герзель-аулу навстречу генералу Фрейтагу. Шамиль закладывает новую, укреплённую по всем правилам инженерии столицу — Дарго-Ведено.',
        contextEn:
          'Abandoning baggage and burning staff papers, Vorontsov retreats toward Gerzel-Aul to meet Freytag’s relief column while Shamil founds the fortified capital of Dargo-Vedeno.',
        choices: [
          {
            id: 'drg_c4_build_vedeno_citadel',
            labelRu: 'Воздвигнуть в Дарго-Ведено палату Диван-ханы, литейный двор и тройной ров с палисадом!',
            labelEn: 'Erect the Divan-Khana council hall, cannon foundry & triple palisade at Dargo-Vedeno!',
            effectRu: 'Столица Ведено укреплена (+300 гарнизон) | Казна +200 руб. | Переход к Эпизоду IV',
            effectEn: 'Vedeno Fortified (+300 garrison) | Treasury +200 rub. | Unlocks Episode IV',
            powderDelta: 35,
            silverDelta: 200,
            provisionsDelta: 200,
            authorityDelta: 12,
            targetNaibId: 'vedeno',
            pressureDelta: -20,
            garrisonDelta: 300,
            relocateCapitalTo: { id: 'vedeno', labelRu: 'Дарго-Ведено', labelEn: 'Dargo-Vedeno' },
            chronicleRu:
              'ЭПИЗОД III ЗАВЕРШЁН: Победа в Даргинском лесу прогремела на всю Европу, а в долине Хулхулау выросла новая столица Имамата — Дарго-Ведено!',
            chronicleEn:
              'EPISODE III COMPLETE: Victory in the Dargo forests echoed across Europe as the new fortified capital of Dargo-Vedeno rose in the Khulkhulau valley!'
          },
          {
            id: 'drg_c4_press_shamkhal_berdy',
            labelRu: 'Сомкнуть кольцо у аула Шамхал-Берды и отбить последние штабные вьюки перед подходом Фрейтага',
            labelEn: 'Tighten the ring at Shamkhal-Berdy to seize the last staff pack-trains before Freytag arrives',
            effectRu: 'Порох +50 пуд. | Серебро +240 руб. | Авторитет +10% | Переход к Эпизоду IV',
            effectEn: 'Powder +50 poods | Silver +240 rub. | Authority +10% | Unlocks Episode IV',
            powderDelta: 50,
            silverDelta: 240,
            provisionsDelta: 140,
            authorityDelta: 10,
            targetNaibId: 'shali',
            pressureDelta: -16,
            murtazeksDelta: 60,
            chronicleRu:
              'ЭПИЗОД III ЗАВЕРШЁН: На рубеже Аксая и Мичика арьергард Воронцова заплатил тяжёлую дань за выход на плоскость.',
            chronicleEn:
              'EPISODE III COMPLETE: Along the Aksay and Michik, Vorontsov’s rearguard paid a heavy price to reach the plains.'
          }
        ]
      }
    ]
  },

  // ==========================================================================
  // ЭПИЗОД III-Б. «ВОЙНА ОСАД: ГЕРГЕБИЛЬ, САЛТЫ И НЕПРИСТУПНЫЙ ЧОХ» (1847–1849 ГГ.)
  // ==========================================================================
  {
    id: 'ep_1847_siege_war',
    scenarioId: 'camp_1847',
    episodeNumber: 'III-Б',
    yearsLabelRu: '1847 — 1849 гг. (Ходы 1–12)',
    yearsLabelEn: '1847 — 1849 (Turns 1–12)',
    titleRu: 'Эпизод III-Б: «Война осад» — Гергебиль, Салты и неприступный Чох',
    titleEn: 'Episode III-B: “War of Sieges” — Gergebil, Salty & Unbroken Chokh',
    subtitleRu: 'Пудовые мортиры, подземная минная война кн. Аргутинского и гений инженера Хаджи-Юсуфа в Центральном Дагестане',
    subtitleEn: 'Pood mortars, Prince Argutinsky’s subterranean sapping, and Chief Engineer Hajji Yusuf’s bastions in Central Dagestan',
    capitalNaibateId: 'vedeno',
    capitalLabelRu: 'Дарго-Ведено',
    capitalLabelEn: 'Dargo-Vedeno',
    initialImperialHeldIds: [],
    nextChainEpisodeId: 'ep_1853_crimean_michik',
    phases: [
      {
        id: 'siege47_p1_salty_bastions',
        step: 1,
        dateRu: 'Июль — Сентябрь 1847 г.',
        dateEn: 'July — September 1847',
        titleRu: 'Фаза 1/2: 50-дневная оборона Салтов и гергебильских садов',
        titleEn: 'Phase 1/2: 50-Day Defense of Salty & Gergebil’s Terraced Orchards',
        art: 'Diorama_Siege_TopDown_Salty_1847.jpg',
        focusNaibateId: 'gergebil',
        speakerRu: 'Инженер Хаджи-Юсуф и наиб Гергебиля',
        speakerEn: 'Chief Engineer Hajji Yusuf & Naib of Gergebil',
        quoteRu:
          '«После урока Дарго Воронцов и Аргутинский больше не ходят вслепую в леса — они подкатывают 24 осадные пушки к каменным башням Салтов и бьют шрапнелью по садам. Но пока завалы держат воду и подходы, каждый день осени работает на Имамат!»',
        quoteEn:
          '“After Dargo, Vorontsov and Argutinsky no longer march blind into forests—they wheel 24 siege guns against Salty’s stone towers. Yet while our bastions hold water and slopes, every autumn day bleeds the besiegers!”',
        contextRu:
          'Лето 1847 года. Осадный корпус развернул траншеи и батареи у Салтов, где хирург Н. И. Пирогов впервые применяет эфирный наркоз. Выберите стратегию защиты Центрального Дагестана.',
        contextEn:
          'Summer 1847. The siege corps opened parallels before Salty, where surgeon N. I. Pirogov pioneers ether anesthesia. Choose Central Dagestan’s defense doctrine.',
        choices: [
          {
            id: 's47_c1_stone_casemates',
            labelRu: 'Перекрыть сакли брёвнами и каменными казематами, выматывая осаду до дождей',
            labelEn: 'Roof saklyas with timber casemates to bleed the siege until autumn rains',
            effectRu: 'Натиск Гергебиля -14% | Гарнизон +120 | Порох -12 пуд. | Авторитет +5%',
            effectEn: 'Gergebil Pressure -14% | Garrison +120 | Powder -12 poods | Authority +5%',
            powderDelta: -12,
            silverDelta: -40,
            provisionsDelta: 80,
            authorityDelta: 5,
            targetNaibId: 'gergebil',
            pressureDelta: -14,
            murtazeksDelta: 120,
            chronicleRu:
              'Салтинские каменные казематы выдержали тысячи ядер — осадная кампания 1847 года завязла в ущелье.',
            chronicleEn:
              'Salty’s stone casemates withstood thousands of shells, bogging down the 1847 siege campaign.'
          },
          {
            id: 's47_c2_counter_raid_gunib',
            labelRu: 'Ударить конницей Хаджи-Мурата по обозам на дороге из Темир-Хан-Шуры',
            labelEn: 'Unleash Hadji Murad’s riders against supply convoys from Temir-Khan-Shura',
            effectRu: 'Порох +20 пуд. | Серебро +90 руб. | Натиск Чоха -10% | Авторитет +4%',
            effectEn: 'Powder +20 poods | Silver +90 rub. | Chokh Pressure -10% | Authority +4%',
            powderDelta: 20,
            silverDelta: 90,
            provisionsDelta: 110,
            authorityDelta: 4,
            targetNaibId: 'chokh',
            pressureDelta: -10,
            chronicleRu:
              'Рейд горской конницы сорвал подвоз снарядов к осадным батареям Дагестана и пополнил арсеналы Имамата.',
            chronicleEn:
              'Highland cavalry cut off siege-shell convoys in Dagestan and replenished Imamate arsenals.'
          }
        ]
      },
      {
        id: 'siege47_p2_chokh_triumph',
        step: 2,
        dateRu: 'Июль — Август 1849 г.',
        dateEn: 'July — August 1849',
        titleRu: 'Фаза 2/2: Неприступный Чох (1849) — контрмины и бастион Хаджи-Юсуфа',
        titleEn: 'Phase 2/2: Unbroken Chokh (1849) — Counter-Mines & Hajji Yusuf’s Bastion',
        art: 'Crisis_Chokh_Siege_1849.jpg',
        focusNaibateId: 'chokh',
        speakerRu: 'Комендант Чохской крепости и инженер Хаджи-Юсуф',
        speakerEn: 'Chokh Fortress Commandant & Chief Engineer Hajji Yusuf',
        quoteRu:
          '«Двадцать две тысячи снарядов обрушил князь Аргутинский на Чох! Но наш круглый каменный редут с амбразурами и подземные слуховые галереи выстояли — Чох не сдастся!»',
        quoteEn:
          '“Prince Argutinsky rained 22,000 shells on Chokh! Yet our circular embrasured stone redoubt and listening tunnels held—Chokh shall never yield!”',
        contextRu:
          'Август 1849 года. Последний осадный штурм Чоха. Победа здесь остановит наступление на Дагестан на годы вперёд.',
        contextEn:
          'August 1849. The climactic siege of Chokh. Victory here halts Imperial advances in Dagestan for years.',
        choices: [
          {
            id: 's47_c3_chokh_bastion_victory',
            labelRu: 'Взорвать контрмину и встретить штурм залпом с Чохского редута!',
            labelEn: 'Detonate the counter-mine and meet the storm with Chokh Redoubt volleys!',
            effectRu: 'Триумф под Чохом! | Натиск Чоха -22% | Авторитет +10% | Муртазеки +100',
            effectEn: 'Triumph at Chokh! | Chokh Pressure -22% | Authority +10% | Murtazeks +100',
            powderDelta: -15,
            silverDelta: 120,
            provisionsDelta: 140,
            authorityDelta: 10,
            targetNaibId: 'chokh',
            pressureDelta: -22,
            murtazeksDelta: 100,
            chronicleRu:
              'ЭПИЗОД III-Б ЗАВЕРШЁН: Осада Чоха 1849 г. снята! Неприступный бастион инженера Хаджи-Юсуфа вошёл в историю военного искусства.',
            chronicleEn:
              'EPISODE III-B COMPLETE: The 1849 Siege of Chokh is broken! Engineer Hajji Yusuf’s redoubt entered military history.'
          }
        ]
      }
    ]
  },

  // ==========================================================================
  // ЭПИЗОД IV. «КРЫМСКИЙ ШАНС, ЦИНАНДАЛИ И РЕКА МИЧИК» (1853–1856 ГГ.)
  // ==========================================================================
  {
    id: 'ep_1853_crimean_michik',
    scenarioId: 'camp_1845',
    episodeNumber: 'IV',
    yearsLabelRu: '1853 — 1856 гг. (Ходы 5–10)',
    yearsLabelEn: '1853 — 1856 (Turns 5–10)',
    titleRu: 'Эпизод IV: «Крымский шанс и река Мичик» — Восточная война и возвращение сына',
    titleEn: 'Episode IV: “The Crimean Window & the Michik River” — Eastern War & Return of the Son',
    subtitleRu: 'Поход в Кахетию и рейд на Цинандали, связь с Омер-пашой и исторический размен поручика Джемалуддина',
    subtitleEn: 'The Kakheti campaign & Tsinandali raid, dispatches to Omer Pasha, and the historic exchange of Lt. Jamaluddin',
    capitalNaibateId: 'vedeno',
    capitalLabelRu: 'Дарго-Ведено',
    capitalLabelEn: 'Dargo-Vedeno',
    initialImperialHeldIds: [],
    nextChainEpisodeId: 'ep_1857_gunib',
    phases: [
      {
        id: 'crimea_p1_tsinandali_raid',
        step: 1,
        dateRu: 'Август 1853 — Июль 1854 г.',
        dateEn: 'August 1853 — July 1854',
        titleRu: 'Фаза 1/4: Прорыв Лезгинской линии и рейд конницы Гази-Мухаммада в Алазанскую долину',
        titleEn: 'Phase 1/4: Piercing the Lezgian Line & Ghazi-Muhammad’s Raid on Tsinandali',
        art: 'Diplomacy_Trabzon_Felucca_Smuggling_1846.jpg',
        focusNaibateId: 'irib',
        speakerRu: 'Гази-Мухаммад (командующий конным корпусом на Южном фронте)',
        speakerEn: 'Ghazi-Muhammad (Cavalry Commander on the Southern Front)',
        quoteRu:
          '«Главные русские дивизии оттянуты к Карсу и Дунаю! Спустимся с Главного хребта к Шилде и Цинандали — оттянем войска от Анатолии и добудем залог, за который Петербург наконец вернёт моего брата Джемалуддина!»',
        quoteEn:
          '“Main Russian divisions are drawn off toward Kars! Let us sweep down from the Main Ridge into the Alazani valley—diverting troops from Anatolia and winning the leverage to bring home my brother Jamaluddin!”',
        contextRu:
          'Началась Крымская (Восточная) война. 15-тысячная армия Имамата перевалила снежный Главный хребет в Кахетию; передовой отряд взял богатую усадьбу князя Давида Чавчавадзе в Цинандали.',
        contextEn:
          'With the outbreak of the Crimean War, a 15,000-man Imamate army crosses the Main Caucasian Ridge into Kakheti; its vanguard captures the princely estate of Tsinandali.',
        choices: [
          {
            id: 'crm_c1_tsinandali_hostage_leverage',
            labelRu: 'Обеспечить рыцарское почтение пленным княгиням в Ведено и начать переговоры о размене сына Имама',
            labelEn: 'Accord chivalrous protection to the captive princesses in Vedeno and open talks for Jamaluddin',
            effectRu: 'Авторитет +11% | Серебро +180 руб. | Натиск на Южном фронте -15%',
            effectEn: 'Authority +11% | Silver +180 rub. | Southern Front Pressure -15%',
            powderDelta: 25,
            silverDelta: 180,
            provisionsDelta: 150,
            authorityDelta: 11,
            targetNaibId: 'irib',
            pressureDelta: -15,
            chronicleRu:
              'Княгини Чавчавадзе и Орбелиани с почестями размещены в Ведено под охраной семьи Шамиля; Тифлис вступил в переговоры.',
            chronicleEn:
              'Princesses Chavchavadze and Orbeliani were quartered with full honor in Vedeno, compelling Tiflis to open exchange negotiations.'
          },
          {
            id: 'crm_c1_storm_shilda_forts',
            labelRu: 'Развить удар на укрепления Шилды и Кварели, захватывая пороховые склады Закавказья',
            labelEn: 'Press the offensive against the Shilda and Kvareli redoubts to seize Transcaucasian depots',
            effectRu: 'Порох +55 пуд. | Муртазеки +65 | Провиант +180 мер',
            effectEn: 'Powder +55 poods | Murtazeks +65 | Provisions +180 meas.',
            powderDelta: 55,
            silverDelta: 120,
            provisionsDelta: 180,
            authorityDelta: 8,
            targetNaibId: 'irib',
            murtazeksDelta: 65,
            pressureDelta: -10,
            chronicleRu:
              'Кахетинский поход сковал целый корпус генерала Реада, не позволив перебросить подкрепления под Карс.',
            chronicleEn:
              'The Kakheti campaign pinned down General Read’s corps, preventing reinforcements from marching to Kars.'
          }
        ]
      },
      {
        id: 'crimea_p2_allied_feluccas',
        step: 2,
        dateRu: 'Осень 1854 — Весна 1855 г.',
        dateEn: 'Autumn 1854 — Spring 1855',
        titleRu: 'Фаза 2/4: Депеши Мухаммад-Амина и фелюги с английскими штуцерами из Трапезунда',
        titleEn: 'Phase 2/4: Dispatches of Muhammad-Amin & Trabzon Feluccas with Rifled Carbines',
        art: 'Diplomacy_Trabzon_Felucca_Smuggling_1846.jpg',
        focusNaibateId: 'vedeno',
        speakerRu: 'Мухаммад-Амин (наиб Шамиля в Черкесии и Абхазии)',
        speakerEn: 'Muhammad-Amin (Shamil’s Naib in Circassia & Abkhazia)',
        quoteRu:
          '«Союзная эскадра вошла в Сухум-Кале, а Омер-паша высадился на побережье! Но паши спорят с англичанами и зовут нас идти к Кутаису, вместо того чтобы прислать нарезные штуцера и свинец прямо в Чечню!»',
        quoteEn:
          '“The allied fleet has entered Sukhum-Kale and Omer Pasha landed on the coast! Yet the pashas quarrel with the British instead of shipping rifled carbines and lead to Chechnya!”',
        contextRu:
          'Наиб Западного Кавказа Мухаммад-Амин передаёт предложения османского маршала Омер-паши. Вам решать: полагаться на ненадёжные обещания европейских штабов или ковать собственную военную промышленность в Ведено и Телетле.',
        contextEn:
          'Western Caucasus Naib Muhammad-Amin relays Ottoman Marshal Omer Pasha’s proposals: rely on distant allied promises or expand domestic arms production in Vedeno and Teletl.',
        choices: [
          {
            id: 'crm_c2_domestic_rifles_vedeno',
            labelRu: 'Опереться на собственные силы: перековать трофейный металл и наладить выделку нарезных стволов в Ведено и Кубачи',
            labelEn: 'Rely on domestic strength: expand rifled barrel workshops in Vedeno and Kubachi',
            effectRu: 'Порох +60 пуд. | Серебро -70 руб. | Иман Телетля и Ведено +10 | Авторитет +9%',
            effectEn: 'Powder +60 poods | Silver -70 rub. | Teletl & Vedeno Iman +10 | Authority +9%',
            powderDelta: 60,
            silverDelta: -70,
            provisionsDelta: 80,
            authorityDelta: 9,
            targetNaibId: 'teletl',
            imanDelta: 10,
            pressureDelta: -14,
            chronicleRu:
              'Не дожидаясь чужих эскадр, оружейники Дарго-Ведено и Телетля удвоили выпуск ударных замков и боевого пороха.',
            chronicleEn:
              'Without waiting on foreign fleets, armorers in Dargo-Vedeno and Teletl doubled production of percussion locks and battle powder.'
          },
          {
            id: 'crm_c2_smuggle_trabzon_lead',
            labelRu: 'Провести караван горских контрабандистов через горные тропы от черноморских фелюг',
            labelEn: 'Escort a highland pack-train of English lead and saltpeter from the Black Sea feluccas',
            effectRu: 'Порох +45 пуд. | Серебро +140 руб. | Поддержка Порты и Черкесии',
            effectEn: 'Powder +45 poods | Silver +140 rub. | Boosted Black Sea Supply Link',
            powderDelta: 45,
            silverDelta: 140,
            provisionsDelta: 60,
            authorityDelta: 6,
            targetNaibId: 'vedeno',
            pressureDelta: -10,
            chronicleRu:
              'Вьючный караван с турецкой селитрой и английским свинцом благополучно прорвался в склады Ведено.',
            chronicleEn:
              'A pack-train carrying Turkish saltpeter and English lead safely reached the magazines of Vedeno.'
          }
        ]
      },
      {
        id: 'crimea_p3_michik_crossing',
        step: 3,
        dateRu: '10 марта 1855 г.',
        dateEn: 'March 10, 1855',
        titleRu: 'Фаза 3/4: Переправа на реке Мичик — возвращение поручика Джемалуддина спустя 16 лет',
        titleEn: 'Phase 3/4: Crossing on the Michik River — Return of Lt. Jamaluddin After 16 Years',
        art: 'KeyArt_Michik_1855_Jamaluddin_Exchange.jpg',
        focusNaibateId: 'shali',
        speakerRu: 'Поручик Джемалуддин Шамиль (ступив на южный берег Мичика)',
        speakerEn: 'Lt. Jamaluddin Shamil (Stepping onto the South Bank of the Michik)',
        quoteRu:
          '«Шестнадцать лет назад меня увели мальчиком с дымящегося Ахульго. Я выучил науки Петербурга, отец, но сердце моё разрывается при виде грозных батальонов, идущих на твои маленькие аулы…»',
        quoteEn:
          '“Sixteen years ago I was led away as a boy from smoking Akhulgo. I learned the sciences of St. Petersburg, Father, and my heart aches seeing the vast battalions marching against your small auls…”',
        contextRu:
          'На мосту через пограничную реку Мичик близ крепости Куринской при тысячах конных мюридов и русских егерей свершился легендарный обмен: княгини возвращены князю Чавчавадзе, а Шамиль обнял старшего сына Джемалуддина и принял выкуп серебром.',
        contextEn:
          'At the Michik River crossing near Fort Kurinskoye before arrayed armies, the legendary exchange takes place: the princesses return home while Shamil embraces his eldest son Jamaluddin.',
        choices: [
          {
            id: 'crm_c3_embrace_son_and_silver',
            labelRu: 'Обнять сына Джемалуддина, переодеть его в черкеску наиба и принять 40 000 рублей серебром в Байт аль-маль',
            labelEn: 'Embrace son Jamaluddin, attire him in a Naib’s cherkesska, and place 40,000 silver rubles into Bayt al-Mal',
            effectRu: 'Казна +320 руб. | Авторитет +14% | Все наибы Иман +8',
            effectEn: 'Treasury +320 rub. | Authority +14% | All Naibs Iman +8',
            powderDelta: 30,
            silverDelta: 320,
            provisionsDelta: 150,
            authorityDelta: 14,
            targetNaibId: 'shali',
            imanDelta: 8,
            pressureDelta: -14,
            chronicleRu:
              '10 марта 1855 г. на реке Мичик свершился великий размен: вся Чечня и Дагестан праздновали возвращение первенца Имама.',
            chronicleEn:
              'On March 10, 1855, at the Michik crossing, all Chechnya and Dagestan celebrated the return of the Imam’s firstborn son.'
          },
          {
            id: 'crm_c3_veteran_captives_release',
            labelRu: 'Добиться одновременного освобождения 150 ветеранов Имамата из русских крепостей',
            labelEn: 'Secure the simultaneous release of 150 veteran murids from Imperial fortresses',
            effectRu: 'Гарнизоны Шали и Ведено +260 | Порох +45 пуд. | Авторитет +12%',
            effectEn: 'Shali & Vedeno Garrisons +260 | Powder +45 poods | Authority +12%',
            powderDelta: 45,
            silverDelta: 180,
            provisionsDelta: 100,
            authorityDelta: 12,
            targetNaibId: 'vedeno',
            garrisonDelta: 260,
            pressureDelta: -16,
            chronicleRu:
              'Вместе с Джемалуддином через реку Мичик вернулись закалённые узники кордонных казематов, вставшие в строй Ведено.',
            chronicleEn:
              'Alongside Jamaluddin, seasoned veterans returned across the Michik to reinforce the ranks of Vedeno.'
          }
        ]
      },
      {
        id: 'crimea_p4_jamaluddin_karata_fate',
        step: 4,
        dateRu: '1856 г.',
        dateEn: '1856',
        titleRu: 'Фаза 4/4: Судьба Джемалуддина в Карата и грозовая туча Парижского мира',
        titleEn: 'Phase 4/4: Jamaluddin’s Fate in Karata & the Gathering Storm After the Treaty of Paris',
        art: 'Archive_Arabic_Chronicle_AlQarakhi_1845.jpg',
        focusNaibateId: 'karata',
        speakerRu: 'Джемалуддин Шамиль (в высокогорном ауле Карата)',
        speakerEn: 'Jamaluddin Shamil (In Highland Karata)',
        quoteRu:
          '«Война в Крыму окончена, отец: теперь Барятинский и Евдокимов двинут на Кавказ двести тысяч штыков с нарезными штуцерами. Береги людей и укрепи последний каменный щит в горах!»',
        quoteEn:
          '“The war in Crimea is over, Father: now Baryatinsky and Evdokimov will hurl two hundred thousand riflemen against the Caucasus. Spare our people and fortify the inner mountain shield!”',
        contextRu:
          'Парижский мир 1856 года развязал руки Российской империи: новый наместник князь А. И. Барятинский сводит на Кавказе 200-тысячную армию. Здоровье тоскующего Джемалуддина в суровой Карата тает на глазах.',
        contextEn:
          'The 1856 Treaty of Paris frees Russia to concentrate 200,000 troops under Viceroy Prince A. I. Baryatinsky, even as Jamaluddin’s fragile health fades in highland Karata.',
        choices: [
          {
            id: 'crm_c4_heed_jamaluddin_engineering',
            labelRu: 'Прислушаться к инженерным советам сына: заложить глубокие склады пороха и зерна в Гунибе и Чохе',
            labelEn: 'Heed Jamaluddin’s engineering counsel: stock deep underground magazines in Gunib and Chokh',
            effectRu: 'Порох +50 пуд. | Провиант +240 мер | Гарнизон Гуниба +220 | Переход к Эпизоду V',
            effectEn: 'Powder +50 poods | Provisions +240 meas. | Gunib Garrison +220 | Unlocks Episode V',
            powderDelta: 50,
            silverDelta: 90,
            provisionsDelta: 240,
            authorityDelta: 10,
            targetNaibId: 'gunib',
            garrisonDelta: 220,
            pressureDelta: -15,
            chronicleRu:
              'ЭПИЗОД IV ЗАВЕРШЁН: Советы Джемалуддина помогли подготовить внутренние цитадели Дагестана к грядущему натиску армии Барятинского.',
            chronicleEn:
              'EPISODE IV COMPLETE: Jamaluddin’s counsel prepared Dagestan’s inner citadels for the coming onslaught of Baryatinsky’s army.'
          },
          {
            id: 'crm_c4_summon_pirogov_doctors',
            labelRu: 'Попросить русских военных врачей из Хасав-Юрта приехать в Карата для лечения угасающего сына',
            labelEn: 'Invite Russian military physicians from Khasav-Yurt under safe-conduct to treat Jamaluddin in Karata',
            effectRu: 'Авторитет и человечность Имама +14% | Иман Карата +12 | Переход к Эпизоду V',
            effectEn: 'Imam’s Moral Authority +14% | Karata Iman +12 | Unlocks Episode V',
            powderDelta: 20,
            silverDelta: -40,
            provisionsDelta: 120,
            authorityDelta: 14,
            targetNaibId: 'karata',
            imanDelta: 12,
            pressureDelta: -10,
            chronicleRu:
              'ЭПИЗОД IV ЗАВЕРШЁН: Под честное слово Шамиля русский военный врач прибыл в Карата — пронзительный жест взаимного уважения посреди большой войны.',
            chronicleEn:
              'EPISODE IV COMPLETE: Under Shamil’s word of honor, a Russian military physician travelled to Karata—a poignant moment of humanity amid war.'
          }
        ]
      }
    ]
  },

  // ==========================================================================
  // ЭПИЗОД V. «ВОЙНА ТОПОРОМ И ВЕРХНИЙ ГУНИБ» (1857–1859 ГГ.)
  // ==========================================================================
  {
    id: 'ep_1857_gunib',
    scenarioId: 'camp_1859',
    episodeNumber: 'V',
    yearsLabelRu: '1857 — Август 1859 г. (Финал эпопеи)',
    yearsLabelEn: '1857 — August 1859 (Grand Finale)',
    titleRu: 'Эпизод V: «Война топором и Верхний Гуниб» — Последний оплот в облаках',
    titleEn: 'Episode V: “War by the Axe & Upper Gunib” — The Last Stronghold in the Clouds',
    subtitleRu: 'Шалинская просека и Аргунское ущелье, падение редутов Ведено и последний совет на плато Верхний Гуниб',
    subtitleEn: 'The Shali forest clearings & Argun Gorge, the siege of Vedeno, and the fateful council atop Upper Gunib',
    capitalNaibateId: 'gunib',
    capitalLabelRu: 'Верхний Гуниб',
    capitalLabelEn: 'Upper Gunib',
    initialImperialHeldIds: [],
    nextChainEpisodeId: null,
    phases: [
      {
        id: 'gunib_p1_argun_and_shali',
        step: 1,
        dateRu: '1857 — Лето 1858 г.',
        dateEn: '1857 — Summer 1858',
        titleRu: 'Фаза 1/4: «Война топором» генерала Евдокимова в Шали и Аргунском ущелье',
        titleEn: 'Phase 1/4: General Evdokimov’s “War by the Axe” in Shali & the Argun Gorge',
        art: 'Crisis_Shali_Forest_Clearing_1850.jpg',
        focusNaibateId: 'shali',
        speakerRu: 'Талхиг Шалинский (командир обороны Большой Чечни)',
        speakerEn: 'Talkhig of Shali (Commander of Greater Chechnya’s Defense)',
        quoteRu:
          '«Евдокимов не лезет в чащу, как Воронцов: его полки вырубают просеки шириной в два ружейных выстрела и ставят башни на каждом выходе из Аргунского ущелья! Без хлеба Шали голод придёт в самые горы!»',
        quoteEn:
          '“Evdokimov refuses to enter the woods blind like Vorontsov: his regiments clear avenues two rifle-shots wide and build towers at every mouth of the Argun Gorge!”',
        contextRu:
          'Генерал Н. И. Евдокимов методично прорубает широкие просеки сквозь леса Чечни, отрезая житницу Имамата на равнине от горных округов.',
        contextEn:
          'General N. I. Evdokimov methodically fells wide clearings through Chechnya’s forests, severing the Imamate’s lowland granaries from the mountains.',
        choices: [
          {
            id: 'gnb_c1_counter_redoubts_shali',
            labelRu: 'Воздвигнуть земляные люнеты и контр-завалы у Шали и Воздвиженской, прикрывая вывоз зерна в горы',
            labelEn: 'Erect earthen lunettes at Shali to cover the evacuation of grain stores into the highlands',
            effectRu: 'Провиант +210 мер | Порох -20 пуд. | Натиск на Шали -16%',
            effectEn: 'Provisions +210 meas. | Powder -20 poods | Shali Pressure -16%',
            powderDelta: -20,
            silverDelta: 60,
            provisionsDelta: 210,
            authorityDelta: 8,
            targetNaibId: 'shali',
            pressureDelta: -16,
            garrisonDelta: 120,
            chronicleRu:
              'Артиллеристы Талхига удержали Шалинский окоп до тех пор, пока обозы с кукурузой и просом не ушли вверх по Аргуну и Хулхулау.',
            chronicleEn:
              'Talkhig’s gunners held the Shali earthworks until grain trains safely ascended into the highland valleys.'
          },
          {
            id: 'gnb_c1_nazran_diversion',
            labelRu: 'Совершить стремительный конный рейд к Назрани, чтобы оттянуть резервы Евдокимова от Аргуна',
            labelEn: 'Launch a rapid cavalry thrust toward Nazran to draw Evdokimov’s reserves away from the Argun',
            effectRu: 'Порох +30 пуд. | Муртазеки +55 | Авторитет +9%',
            effectEn: 'Powder +30 poods | Murtazeks +55 | Authority +9%',
            powderDelta: 30,
            silverDelta: 100,
            provisionsDelta: 90,
            authorityDelta: 9,
            targetNaibId: 'benoy',
            murtazeksDelta: 55,
            pressureDelta: -12,
            chronicleRu:
              'Дерзкий манёвр конницы к Владикавказскому тракту вынудил штаб Кавказской армии приостановить рубку просек на три недели.',
            chronicleEn:
              'A daring cavalry maneuver toward the Vladikavkaz road forced Imperial HQ to halt forest clearing for three weeks.'
          }
        ]
      },
      {
        id: 'gunib_p2_fall_of_vedeno',
        step: 2,
        dateRu: 'Февраль — 1 апреля 1859 г.',
        dateEn: 'February — April 1, 1859',
        titleRu: 'Фаза 2/4: Зимняя осада Дарго-Ведено и спасение хроники аль-Карахи',
        titleEn: 'Phase 2/4: Winter Siege of Dargo-Vedeno & Saving al-Qarakhi’s Chronicle',
        art: 'Archive_Arabic_Chronicle_AlQarakhi_1845.jpg',
        focusNaibateId: 'vedeno',
        speakerRu: 'Мухаммад Тахир аль-Карахи и Гази-Мухаммад',
        speakerEn: 'Muhammad Tahir al-Qarakhi & Ghazi-Muhammad',
        quoteRu:
          '«Нарезные орудия Евдокимова бьют по редутам Ведено с двух вёрст — наши гладкоствольные единороги не достают их батарей! Вывезем государственную печать и рукописи летописи на неприступный Гуниб!»',
        quoteEn:
          '“Evdokimov’s rifled guns shell Vedeno’s redoubts from two versts away—beyond the reach of our smoothbore unicorns! Let us carry the state seal and chronicle manuscripts to fortress Gunib!”',
        contextRu:
          'После двухмесячной зимней осады под огнём дальнобойной нарезной артиллерии укрепления Ведено разрушены. Наступает момент организованного отхода в каменную цитадель Внутреннего Дагестана — на гору Гуниб.',
        contextEn:
          'After a two-month winter siege under long-range rifled artillery, Vedeno’s earthworks crumble; the state apparatus must withdraw in order to the natural rock fortress of Gunib.',
        choices: [
          {
            id: 'gnb_c2_evacuate_to_gunib',
            labelRu: 'Организованно вывести гвардию муртазеков, казну и летопись аль-Карахи на плато Верхний Гуниб!',
            labelEn: 'Withdraw the Murtazek guard, treasury & al-Qarakhi’s chronicle in good order to Upper Gunib!',
            effectRu: 'Столица → Верхний Гуниб | Гарнизон Гуниба +350 | Порох +40 пуд. | Авторитет +10%',
            effectEn: 'Capital → Upper Gunib | Gunib Garrison +350 | Powder +40 poods | Authority +10%',
            powderDelta: 40,
            silverDelta: 120,
            provisionsDelta: 160,
            authorityDelta: 10,
            targetNaibId: 'gunib',
            pressureDelta: -18,
            garrisonDelta: 350,
            relocateCapitalTo: { id: 'gunib', labelRu: 'Верхний Гуниб', labelEn: 'Upper Gunib' },
            openTacticalTerrainId: 'gunib_1859',
            chronicleRu:
              '1 апреля 1859 г. гарнизон Гази-Мухаммада с боем покинул разрушенное Ведено; знамя Имамата и архив Диван-ханы подняты на заоблачное плато Верхнего Гуниба!',
            chronicleEn:
              'On April 1, 1859, Ghazi-Muhammad’s garrison withdrew fighting from ruined Vedeno, raising the Imamate’s banner and state archive atop Upper Gunib!'
          },
          {
            id: 'gnb_c2_rearguard_ichkeria',
            labelRu: 'Оставить летучие сотни Байсунгура в лесах Беноя для ударов по тылам Евдокимова',
            labelEn: 'Leave Baysungur’s flying squadrons in the Benoy woods to harry Evdokimov’s rear',
            effectRu: 'Столица → Верхний Гуниб | Муртазеки Беноя +85 | Натиск -14%',
            effectEn: 'Capital → Upper Gunib | Benoy Murtazeks +85 | Pressure -14%',
            powderDelta: 25,
            silverDelta: 80,
            provisionsDelta: 110,
            authorityDelta: 9,
            targetNaibId: 'benoy',
            murtazeksDelta: 85,
            pressureDelta: -14,
            relocateCapitalTo: { id: 'gunib', labelRu: 'Верхний Гуниб', labelEn: 'Upper Gunib' },
            chronicleRu:
              'Пока ставка переносилась на Гуниб, дружина Байсунгура в Беное сковала преследование царских колонн.',
            chronicleEn:
              'While headquarters shifted to Gunib, Baysungur’s Benoy detachment checked the pursuing Imperial columns.'
          }
        ]
      },
      {
        id: 'gunib_p3_four_hundred_murids',
        step: 3,
        dateRu: '10–23 августа 1859 г.',
        dateEn: 'August 10–23, 1859',
        titleRu: 'Фаза 3/4: Четыреста верных на заоблачном плато — оборона Гунибских ворот',
        titleEn: 'Phase 3/4: The Faithful Four Hundred — Defending the Gates of Upper Gunib',
        art: 'Crisis_Chokh_Siege_1849.jpg',
        focusNaibateId: 'gunib',
        speakerRu: 'Байсунгур Беноевский (одноглазый, однорукий и одноногий лев Ичкерии)',
        speakerEn: 'Baysungur of Benoy (The Indomitable Lion of Ichkeria)',
        quoteRu:
          '«Вокруг скалы стоят сорок батальонов фельдмаршала Барятинского, но на тропах у нас каменные завалы и верные сердца! Привяжите меня ремнями к седлу — пока мы держим ворота Гуниба, скала неприступна!»',
        quoteEn:
          '“Forty battalions of Field Marshal Baryatinsky ring the cliff, yet our stone breastworks and faithful hearts hold every path! Strap me to my saddle—so long as we guard Gunib’s gates, the plateau stands!”',
        contextRu:
          'На отвесном плато Верхнего Гуниба (2 000 м над уровнем моря) вокруг Шамиля собрались 400 самых преданных мюридов с семьями. Войска Апшеронского и Ширванского полков карабкаются по отвесным расщелинам.',
        contextEn:
          'Atop the sheer 2,000-meter plateau of Upper Gunib, 400 devoted murids and their families stand beside Shamil as Imperial regiments scale the crags with grappling hooks.',
        choices: [
          {
            id: 'gnb_c3_stone_avalanches',
            labelRu: 'Обрушить заготовленные каменные катки с карнизов Гуниба и контратаковать у главных ворот',
            labelEn: 'Unleash prepared stone avalanches from Gunib’s ledges and counter-attack at the main gate',
            effectRu: 'Натиск на Гуниб -20% | Иман Гуниба +15 | Авторитет +11%',
            effectEn: 'Gunib Pressure -20% | Gunib Iman +15 | Authority +11%',
            powderDelta: -15,
            silverDelta: 0,
            provisionsDelta: 60,
            authorityDelta: 11,
            targetNaibId: 'gunib',
            imanDelta: 15,
            pressureDelta: -20,
            openTacticalTerrainId: 'gunib_1859',
            chronicleRu:
              'Каменные обвалы и ружейный огонь защитников Верхнего Гуниба отбросили передовые штурмовые партии со склонов Кегерских высот.',
            chronicleEn:
              'Rock avalanches and disciplined volleys hurled the first assault parties back from Upper Gunib’s crags.'
          },
          {
            id: 'gnb_c3_fortify_inner_aul',
            labelRu: 'Сомкнуть оборону вокруг верхнего аула и мечети, сберегая каждый патрон в газырях',
            labelEn: 'Concentrate the defense around the upper aul and mosque, conserving every gazyr cartridge',
            effectRu: 'Порох +18 пуд. | Гарнизон Гуниба +140 | Стойкость защитников',
            effectEn: 'Powder +18 poods | Gunib Garrison +140 | Steadfast Defense',
            powderDelta: 18,
            silverDelta: 0,
            provisionsDelta: 80,
            authorityDelta: 8,
            targetNaibId: 'gunib',
            garrisonDelta: 140,
            pressureDelta: -12,
            chronicleRu:
              'Четыреста мюридов заняли круговую оборону среди каменных саклей и берёзовой рощи Верхнего Гуниба.',
            chronicleEn:
              'Four hundred murids formed an unbroken defensive perimeter amid the stone houses and birch grove of Upper Gunib.'
          }
        ]
      },
      {
        id: 'gunib_p4_birch_grove_choice',
        step: 4,
        dateRu: '25 августа 1859 г.',
        dateEn: 'August 25, 1859',
        titleRu: 'Фаза 4/4: Берёзовая роща на Гунибе — последний выбор Имама Шамиля',
        titleEn: 'Phase 4/4: The Birch Grove on Gunib — Imam Shamil’s Final Choice',
        art: 'Epilogue_Kaluga_And_Medina_1859_1871.jpg',
        focusNaibateId: 'gunib',
        speakerRu: 'Полковник Лазарев и Байсунгур Беноевский у мечети Гуниба',
        speakerEn: 'Col. Lazarev & Baysungur of Benoy Outside the Gunib Mosque',
        quoteRu:
          '«Князь Барятинский ждёт в берёзовой роще и даёт слово сохранить жизнь, веру и оружие твоим людям и семьям. Но Байсунгур с тридцатью беноевцами уже затянул подпруги, чтобы рубиться сквозь тройное кольцо в Чечню…»',
        quoteEn:
          '“Prince Baryatinsky waits in the birch grove, pledging safety, faith, and honor to your families. Yet Baysungur and thirty Benoy horsemen have tightened their girths to cut through the triple cordon toward Chechnya…”',
        contextRu:
          '25 августа 1859 года. Штурмовые батальоны поднялись на плато Верхнего Гуниба; в ауле остались десятки раненых мюридов, женщины и дети. История замерла перед вашим последним словом.',
        contextEn:
          'August 25, 1859. Assault battalions stand atop Upper Gunib plateau while wounded murids, women, and children shelter in the aul. History awaits your final command.',
        choices: [
          {
            id: 'gnb_c4_honorable_peace_birch_grove',
            labelRu: 'Выйти в берёзовую рощу к Барятинскому: остановить кровопролитие, спасти семьи и сохранить бессмертную честь гор!',
            labelEn: 'Walk out to the birch grove: halt the bloodshed, save the families, and preserve immortal honor!',
            effectRu: 'Почётный мир с сохранением чести и веры | Авторитет +18% | Иман всех наибов +12',
            effectEn: 'Honorable Peace Preserving Faith & Families | Authority +18% | All Naibs Iman +12',
            powderDelta: 0,
            silverDelta: 150,
            provisionsDelta: 200,
            authorityDelta: 18,
            targetNaibId: 'gunib',
            imanDelta: 12,
            pressureDelta: -30,
            chronicleRu:
              'ЭПИЗОД V ЗАВЕРШЁН: 25 августа 1859 г. в берёзовой роще Гуниба четвертьвековая эпопея Имама Шамиля увенчалась рыцарским признанием мужества горцев и спасением будущих поколений.',
            chronicleEn:
              'EPISODE V COMPLETE: On August 25, 1859, in the birch grove of Gunib, Imam Shamil’s quarter-century epic concluded with chivalrous respect and the preservation of his people.'
          },
          {
            id: 'gnb_c4_baysungur_breakout',
            labelRu: 'Благословить дерзкий прорыв Байсунгура с шашками наголо сквозь три цепи батальонов в леса Беноя!',
            labelEn: 'Bless Baysungur’s legendary saber breakout through three cordons back to the forests of Benoy!',
            effectRu: 'Легендарный прорыв в Ичкерию! | Муртазеки Беноя +120 | Порох +35 пуд. | Авторитет +15%',
            effectEn: 'Legendary Breakout to Ichkeria! | Benoy Murtazeks +120 | Powder +35 poods | Authority +15%',
            powderDelta: 35,
            silverDelta: 80,
            provisionsDelta: 120,
            authorityDelta: 15,
            targetNaibId: 'benoy',
            murtazeksDelta: 120,
            pressureDelta: -22,
            chronicleRu:
              'ЭПИЗОД V ЗАВЕРШЁН: Байсунгур Беноевский с горсткой храбрецов прорубился сквозь тройное кольцо на Гунибе и увёл отряд в родные леса Ичкерии, вписав своё имя в бессмертную легенду Кавказа!',
            chronicleEn:
              'EPISODE V COMPLETE: Baysungur of Benoy carved a path through three cordons atop Gunib and rode back to Ichkeria, etching his name into immortal legend!'
          }
        ]
      }
    ]
  }
];

export function getInitialEpisodeIdForScenario(scenarioId) {
  if (scenarioId === 'camp_1839') return 'ep_1839_akhulgo';
  if (scenarioId === 'camp_1843') return 'ep_1843_shining_ghazawat';
  if (scenarioId === 'camp_1847') return 'ep_1847_siege_war';
  if (scenarioId === 'camp_1859') return 'ep_1857_gunib';
  return 'ep_1845_dargo';
}

export function createInitialEpisodesState() {
  const map = {};
  HISTORICAL_EPISODES.forEach((ep) => {
    map[ep.id] = {
      phaseIdx: 0,
      completed: false,
      history: []
    };
  });
  return map;
}
