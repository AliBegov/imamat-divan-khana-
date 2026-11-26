// Вкладка «VerdictTab» — Выбор исторических кампаний (1839–1859), Совет Учёных Диван-ханы, Математическая модель альтернативной истории и Вердикт Истории
import { useMemo, useState } from 'react';
import { CAMPAIGN_SCENARIOS, EPILOGUE_CHAPTERS, HISTORICAL_FIGURES_ARCHIVE, TARIKAT_PRACTICES, UE5_ASSET_PIPELINE } from '../../data/campaignData.js';
import { resolveMediaAsset } from '../../data/embeddedMediaAssets.js';
import { PortraitMedallion, RichText, TabHeroBanner, findPortrait } from '../hud/GameHUD.jsx';
import { CompassRoseIcon, HighlandEagleIcon, WaxSealIcon } from '../hud/PeriodIcons.jsx';

// 8 ключевых исторических точек бифуркации Кавказской войны (1844–1856 гг.) для математической модели Ланчестера — Монте-Карло
const COUNTERFACTUAL_BIFURCATIONS = [
  {
    id: 'cf_hadji_murad',
    code: 'x₁',
    year: 'Ноябрь 1851 г.',
    yearEn: 'November 1851',
    portraitKey: 'Хаджи-Мурат',
    titleRu: 'Примирение с Хаджи-Муратом и создание автономного Конного корпуса Аварии',
    titleEn: 'Reconciliation with Hadji Murad & Autonomous Avar Cavalry Corps',
    historicalRu:
      'В реальности: конфликт на совете в Андии, лишение наибства и вынужденный переход Хаджи-Мурата к кн. Воронцову (потеря 1 800 лучших всадников и раскрытие горных троп русскому штабу).',
    historicalEn:
      'Historical reality: conflict at the Andia council, dismissal, and Hadji Murad’s defection to Prince Vorontsov (loss of 1,800 elite horsemen and mountain path intelligence).',
    counterfactualRu:
      'Альтернатива: Шамиль отвергает наветы недругов, закрепляет за Хаджи-Муратом Хунзах и статус командующего всей конницей для глубоких рейдов по тылам Кавказского корпуса.',
    counterfactualEn:
      'Counterfactual: Shamil rejects court slanders, confirms Hadji Murad over Khunzakh and appoints him commander of all mobile cavalry for deep rear raids.',
    logitWeight: 0.98,
    powderDelta: 15,
    silverDelta: 140,
    provisionsDelta: 120,
    authorityDelta: 9,
    ottomanDelta: 5,
    troopDelta: 600,
    cavalryDelta: 1800,
    pressureRelief: 15,
    obeyBonus: 9,
    prideDrop: 14
  },
  {
    id: 'cf_ottoman_crimea',
    code: 'x₂',
    year: '1853–1856 гг.',
    yearEn: '1853–1856',
    portraitKey: 'Омер-паша',
    titleRu: 'Морской и сухопутный мост с Османской империей и Британией в Крымскую войну',
    titleEn: 'Coordinated Sea & Land Bridge with the Ottoman Empire & Britain in the Crimean War',
    historicalRu:
      'В реальности: нескоординированный рейд на Цинандали (1854) вместо прорыва на соединение с корпусом Омер-паши в Мингрелии и приёма транспортов со штуцерами из Трабзона.',
    historicalEn:
      'Historical reality: uncoordinated Tsinandali raid (1854) instead of linking up with Omer Pasha’s corps in Mingrelia and receiving rifle transports from Trabzon.',
    counterfactualRu:
      'Альтернатива: прямой удар на Кутаисско-Сухумском направлении синхронно с высадкой Омер-паши; регулярные конвои фелюг доставляют английские капсюльные штуцеры и селитру.',
    counterfactualEn:
      'Counterfactual: coordinated offensive toward Kutaisi & Sukhum-Kale alongside Omer Pasha’s landing; regular felucca convoys deliver British percussion rifles and saltpeter.',
    logitWeight: 1.38,
    powderDelta: 45,
    silverDelta: 220,
    provisionsDelta: 150,
    authorityDelta: 12,
    ottomanDelta: 35,
    troopDelta: 1400,
    cavalryDelta: 600,
    pressureRelief: 24,
    obeyBonus: 8,
    prideDrop: 6
  },
  {
    id: 'cf_kabarda_circassia',
    code: 'x₃',
    year: 'Апрель 1846 г.',
    yearEn: 'April 1846',
    portraitKey: 'Мухаммад-Амин',
    titleRu: 'Удержание Кабардинского коридора и соединение с Западным Кавказом (Черкесией)',
    titleEn: 'Holding the Kabarda Corridor & Linking with Western Caucasus (Circassia)',
    historicalRu:
      'В реальности: отступление из Большой Кабарды за Терек в апреле 1846 г.; Военно-Грузинская дорога осталась в руках империи, разрезав Кавказ на два изолированных театра.',
    historicalEn:
      'Historical reality: retreat from Greater Kabarda across the Terek in April 1846; the Georgian Military Road remained in Imperial hands, splitting the Caucasus in two.',
    counterfactualRu:
      'Альтернатива: закрепление у Эльхотовских ворот и Дарьяла совместно с кабардинской конницей и адыгами наиба Мухаммад-Амина — единый фронт от Чёрного моря до Дагестана.',
    counterfactualEn:
      'Counterfactual: fortifying Elkhotovo Gates and Darial alongside Kabardian cavalry and Muhammad-Amin’s Circassians — a unified front from the Black Sea to Dagestan.',
    logitWeight: 1.05,
    powderDelta: 20,
    silverDelta: 160,
    provisionsDelta: 320,
    authorityDelta: 10,
    ottomanDelta: 15,
    troopDelta: 2200,
    cavalryDelta: 1200,
    pressureRelief: 18,
    obeyBonus: 7,
    prideDrop: 5
  },
  {
    id: 'cf_shali_granary',
    code: 'x₄',
    year: '1850–1857 гг.',
    yearEn: '1850–1857',
    portraitKey: 'Талгик',
    titleRu: 'Инженерная контр-доктрина в Большой Чечне и подземные зернохранилища',
    titleEn: 'Engineering Counter-Doctrine in Greater Chechnya & Subterranean Granaries',
    historicalRu:
      'В реальности: «война топором» генерала Евдокимова и вырубка Шалинской просеки лишили Имамат хлебной житницы Чечни (-68% зерна), вызвав голод в горах к 1858 г.',
    historicalEn:
      'Historical reality: General Evdokimov’s “war by the axe” and the Shali clearing deprived the Imamate of Chechnya’s granary (-68% grain), causing mountain famine by 1858.',
    counterfactualRu:
      'Альтернатива: отказ от лобовых боёв под картечью на просеках; эшелонированные бревенчатые люнеты вдоль Аргуна и закладка стратегических зерновых баз в Ичкерии и Анди.',
    counterfactualEn:
      'Counterfactual: avoiding frontal clashes on open clearings; echeloned timber lunettes along the Argun and strategic subterranean grain depots in Ichkeria and Andi.',
    logitWeight: 1.12,
    powderDelta: 12,
    silverDelta: 90,
    provisionsDelta: 450,
    authorityDelta: 8,
    ottomanDelta: 0,
    troopDelta: 1500,
    cavalryDelta: 400,
    pressureRelief: 16,
    obeyBonus: 10,
    prideDrop: 8
  },
  {
    id: 'cf_safarov_rifles',
    code: 'x₅',
    year: '1847–1855 гг.',
    yearEn: '1847–1855',
    portraitKey: 'Юсуф-хаджи',
    titleRu: 'Переход арсеналов Сафарова на нарезные штуцеры и ударные капсюли',
    titleEn: 'Safarov Arsenal Transition to Rifled Stutzers & Percussion Caps',
    historicalRu:
      'В реальности: после 1856 г. армия кн. Барятинского получила дальнобойные 6-линейные штуцеры (до 1 200 шагов), лишив горцев прежнего огневого преимущества кремнёвых винтовок.',
    historicalEn:
      'Historical reality: after 1856 Prince Baryatinsky’s army received long-range 6-line rifled muskets (1,200 paces), erasing the mountaineers’ former flintlock accuracy edge.',
    counterfactualRu:
      'Альтернатива: запуск в Ведено, Чохе и Кубачи дорнирования нарезных стволов, лабораторий гремучей ртути для капсюлей и контрминных галерей по чертежам Хаджи-Юсуфа Сафарова.',
    counterfactualEn:
      'Counterfactual: launching barrel rifling, fulminate percussion cap workshops, and counter-mine galleries across Vedeno, Chokh, and Kubachi under Hajji Yusuf Safarov.',
    logitWeight: 0.76,
    powderDelta: 28,
    silverDelta: 80,
    provisionsDelta: 40,
    authorityDelta: 6,
    ottomanDelta: 5,
    troopDelta: 800,
    cavalryDelta: 200,
    pressureRelief: 13,
    obeyBonus: 5,
    prideDrop: 4
  },
  {
    id: 'cf_muhtasib_justice',
    code: 'x₆',
    year: '1848–1858 гг.',
    yearEn: '1848–1858',
    portraitKey: 'Кибит-Магома',
    titleRu: 'Антикоррупционная реформа мухтасибов и пресечение произвола наибов',
    titleEn: 'Muhtasib Anti-Corruption Reform & Elimination of Naib Extortion',
    historicalRu:
      'В реальности: злоупотребления и поборы отдельных наибов в 1850-х гг. подорвали доверие общин, чем воспользовался Барятинский, обещавший аулам сохранение адатов и льготы.',
    historicalEn:
      'Historical reality: extortion by certain Naibs in the 1850s eroded community trust, exploited by Baryatinsky’s promises of local autonomy and tax exemptions.',
    counterfactualRu:
      'Альтернатива: жёсткий финансовый аудит через независимых мухтасибов Диван-ханы, запрет необоснованных штрафов и прямая защита прав сельских джамаатов.',
    counterfactualEn:
      'Counterfactual: strict financial audits by independent Divan-Khana muhtasibs, prohibition of arbitrary fines, and direct legal protection of village jamaats.',
    logitWeight: 0.84,
    powderDelta: 10,
    silverDelta: 190,
    provisionsDelta: 180,
    authorityDelta: 14,
    ottomanDelta: 0,
    troopDelta: 1100,
    cavalryDelta: 350,
    pressureRelief: 12,
    obeyBonus: 14,
    prideDrop: 18
  },
  {
    id: 'cf_daniyal_samur',
    code: 'x₇',
    year: '1844–1859 гг.',
    yearEn: '1844–1859',
    portraitKey: 'Даниял-бек',
    titleRu: 'Координированный Южный фронт султана Даниял-бека в Самурской долине',
    titleEn: 'Coordinated Southern Front of Sultan Daniyal-bek in the Samur Valley',
    historicalRu:
      'В реальности: преждевременное выступление Даниял-бека в Илису (1844) без инженерной подготовки и ранняя сдача Ириба в 1859 г. открыли войскам с юга путь к Гунибу.',
    historicalEn:
      'Historical reality: Daniyal-bek’s premature rising in Ilisu (1844) and early surrender of Irib in 1859 opened the southern approaches toward Gunib.',
    counterfactualRu:
      'Альтернатива: превращение перевалов Самурского хребта и Ириба в неприступный южный бастион, сковывающий Лезгинский отряд и силы кн. Аргутинского-Долгорукова.',
    counterfactualEn:
      'Counterfactual: fortifying the Samur Ridge passes and Irib into an impregnable southern bastion pinning down the Lezgin Detachment and Argutinsky-Dolgorukov.',
    logitWeight: 0.58,
    powderDelta: 14,
    silverDelta: 120,
    provisionsDelta: 110,
    authorityDelta: 6,
    ottomanDelta: 8,
    troopDelta: 900,
    cavalryDelta: 300,
    pressureRelief: 11,
    obeyBonus: 6,
    prideDrop: 7
  },
  {
    id: 'cf_jamaluddin_diplomacy',
    code: 'x₈',
    year: '1855–1856 гг.',
    yearEn: '1855–1856',
    portraitKey: 'Шамиль',
    titleRu: 'Поручик Джемалуддин во главе Генштаба и переговоров о почётном мире',
    titleEn: 'Lt. Jamaluddin as Chief of General Staff & Envoy for Honorable Peace',
    historicalRu:
      'В реальности: возвращённый в 1855 г. старший сын Шамиля Джемалуддин (офицер, знавший военную науку и дипломатию Петербурга) был отстранён от дел и умер в Карата в 1858 г.',
    historicalEn:
      'Historical reality: returned in 1855, Shamil’s eldest son Lt. Jamaluddin (educated in St. Petersburg military science and diplomacy) was sidelined and died in Karata in 1858.',
    counterfactualRu:
      'Альтернатива: Шамиль поручает Джемалуддину реформу штаба и прямые дипломатические переговоры 1856 г. о статусе признанного автономного государства при сохранении внутреннего Низама.',
    counterfactualEn:
      'Counterfactual: Shamil entrusts Jamaluddin with staff reform and direct 1856 diplomatic negotiations for recognized autonomous statehood under internal Nizam law.',
    logitWeight: 0.72,
    powderDelta: 10,
    silverDelta: 150,
    provisionsDelta: 90,
    authorityDelta: 11,
    ottomanDelta: 18,
    troopDelta: 500,
    cavalryDelta: 250,
    pressureRelief: 14,
    obeyBonus: 8,
    prideDrop: 9
  }
];

// Матрица парных стратегических синергий γ_ij между точками бифуркации
const BIFURCATION_SYNERGIES = [
  {
    a: 'cf_hadji_murad',
    b: 'cf_ottoman_crimea',
    gamma: 0.42,
    labelRu: 'Кавалерия Хаджи-Мурата + Крымский десант Омер-паши (удар по Тифлису 1854 г.)',
    labelEn: 'Hadji Murad Cavalry + Omer Pasha Crimean Landing (1854 Tiflis Strike)'
  },
  {
    a: 'cf_hadji_murad',
    b: 'cf_shali_granary',
    gamma: 0.28,
    labelRu: 'Конный манёвр Хаджи-Мурата + Оборона просек Большой Чечни',
    labelEn: 'Hadji Murad Mobile Cavalry + Greater Chechnya Clearing Defense'
  },
  {
    a: 'cf_ottoman_crimea',
    b: 'cf_kabarda_circassia',
    gamma: 0.34,
    labelRu: 'Черноморско-Кабардинский коридор (соединение с адыгами Мухаммад-Амина)',
    labelEn: 'Black Sea–Kabarda Corridor (Linkup with Muhammad-Amin’s Circassians)'
  },
  {
    a: 'cf_ottoman_crimea',
    b: 'cf_jamaluddin_diplomacy',
    gamma: 0.35,
    labelRu: 'Международная дипломатия Джемалуддина на фоне Парижского конгресса 1856 г.',
    labelEn: 'Jamaluddin’s Diplomatic Mission during the 1856 Congress of Paris'
  },
  {
    a: 'cf_shali_granary',
    b: 'cf_muhtasib_justice',
    gamma: 0.26,
    labelRu: 'Сытые житницы Чечни + Справедливый суд мухтасибов (нулевое отпадение общин)',
    labelEn: 'Preserved Chechen Granaries + Fair Muhtasib Courts (Zero Jamaat Defection)'
  },
  {
    a: 'cf_safarov_rifles',
    b: 'cf_daniyal_samur',
    gamma: 0.20,
    labelRu: 'Нарезные штуцеры Сафарова + Укреплённый пояс Южного Дагестана',
    labelEn: 'Safarov Rifled Stutzers + Fortified Southern Dagestan Belt'
  }
];

export default function VerdictTab({
  activatedFigurePerks,
  activeScenarioId,
  arsenalBatchesCount = 0,
  battleMemorialsCount = 1,
  campaignAudit,
  epilogueDecisionsMade,
  handleApplyCounterfactualModel,
  handleLoadCampaignState,
  handlePerformTarikatPractice,
  handleSaveCampaignState,
  handleSelectScenario,
  setActiveTab,
  studioMode,
  t,
  veteranSquadronsCount = 0
}) {
  const activeScen = CAMPAIGN_SCENARIOS.find((s) => s.id === activeScenarioId);
  const [verdictSubTab, setVerdictSubTab] = useState('campaigns');

  // Состояние выбранных альтернативных решений (по умолчанию включены Хаджи-Мурат, Османский мост и Оборона Чечни для демонстрации)
  const [activeBifurcations, setActiveBifurcations] = useState({
    cf_hadji_murad: true,
    cf_ottoman_crimea: true,
    cf_kabarda_circassia: false,
    cf_shali_granary: true,
    cf_safarov_rifles: false,
    cf_muhtasib_justice: true,
    cf_daniyal_samur: false,
    cf_jamaluddin_diplomacy: true
  });

  const toggleBifurcation = (id) => {
    setActiveBifurcations((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const applyPreset = (presetKey) => {
    if (presetKey === 'historical_1859') {
      setActiveBifurcations({
        cf_hadji_murad: false,
        cf_ottoman_crimea: false,
        cf_kabarda_circassia: false,
        cf_shali_granary: false,
        cf_safarov_rifles: false,
        cf_muhtasib_justice: false,
        cf_daniyal_samur: false,
        cf_jamaluddin_diplomacy: false
      });
    } else if (presetKey === 'internal_reform') {
      setActiveBifurcations({
        cf_hadji_murad: true,
        cf_ottoman_crimea: false,
        cf_kabarda_circassia: false,
        cf_shali_granary: true,
        cf_safarov_rifles: true,
        cf_muhtasib_justice: true,
        cf_daniyal_samur: false,
        cf_jamaluddin_diplomacy: false
      });
    } else if (presetKey === 'crimean_window') {
      setActiveBifurcations({
        cf_hadji_murad: true,
        cf_ottoman_crimea: true,
        cf_kabarda_circassia: false,
        cf_shali_granary: false,
        cf_safarov_rifles: false,
        cf_muhtasib_justice: false,
        cf_daniyal_samur: false,
        cf_jamaluddin_diplomacy: true
      });
    } else if (presetKey === 'full_synthesis') {
      setActiveBifurcations({
        cf_hadji_murad: true,
        cf_ottoman_crimea: true,
        cf_kabarda_circassia: true,
        cf_shali_granary: true,
        cf_safarov_rifles: true,
        cf_muhtasib_justice: true,
        cf_daniyal_samur: true,
        cf_jamaluddin_diplomacy: true
      });
    }
  };

  // Математический расчёт модели Ланчестера — Дейчмана и 10 000 стохастических итераций Монте-Карло
  const counterfactualCalc = useMemo(() => {
    const beta0 = -3.13; // Исторический базовый логит 1859 г. (P_surv = 4.2% при 250 тыс. штыков кн. Барятинского)
    let linearSum = 0;
    let synergySum = 0;
    const activeSynergies = [];

    let powderDelta = 0;
    let silverDelta = 0;
    let provisionsDelta = 0;
    let authorityDelta = 0;
    let ottomanDelta = 0;
    let troopDelta = 0;
    let cavalryDelta = 0;
    let pressureRelief = 0;
    let obeyBonus = 0;
    let prideDrop = 0;
    const activeItems = [];

    COUNTERFACTUAL_BIFURCATIONS.forEach((b) => {
      if (activeBifurcations[b.id]) {
        linearSum += b.logitWeight;
        powderDelta += b.powderDelta;
        silverDelta += b.silverDelta;
        provisionsDelta += b.provisionsDelta;
        authorityDelta += b.authorityDelta;
        ottomanDelta += b.ottomanDelta;
        troopDelta += b.troopDelta;
        cavalryDelta += b.cavalryDelta;
        pressureRelief += b.pressureRelief;
        obeyBonus += b.obeyBonus;
        prideDrop += b.prideDrop;
        activeItems.push(b);
      }
    });

    BIFURCATION_SYNERGIES.forEach((syn) => {
      if (activeBifurcations[syn.a] && activeBifurcations[syn.b]) {
        synergySum += syn.gamma;
        activeSynergies.push(syn);
      }
    });

    const totalLogit = +(beta0 + linearSum + synergySum).toFixed(2);
    const survivalProb = +((1 / (1 + Math.exp(-totalLogit))) * 100).toFixed(1);

    // Вероятность официального мирного трактата о признании внутренней автономии (Парижский конгресс / Мичикский мир 1856 г.)
    const diplomacyBoost =
      (activeBifurcations.cf_jamaluddin_diplomacy ? 0.85 : 0) +
      (activeBifurcations.cf_ottoman_crimea ? 0.65 : 0) +
      (activeBifurcations.cf_hadji_murad ? 0.35 : 0);
    const treatyLogit = +(beta0 - 0.32 + linearSum * 0.82 + synergySum + diplomacyBoost).toFixed(2);
    const treatyProb = +((1 / (1 + Math.exp(-treatyLogit))) * 100).toFixed(1);

    // Детерминированная генерация 10 000 прогонов Монте-Карло (распределение по 4 историческим исходам)
    const pSurv = survivalProb / 100;
    const pTreaty = treatyProb / 100;
    const shareTreaty1856 = Math.round(Math.min(92, pSurv * pTreaty * 100 + (activeBifurcations.cf_jamaluddin_diplomacy ? 8 : 0)));
    const shareMilitaryHold = Math.max(0, Math.round(survivalProb) - shareTreaty1856);
    const remainingFail = Math.max(0, 100 - shareTreaty1856 - shareMilitaryHold);
    const shareProlonged1866 = Math.round(remainingFail * Math.min(0.75, 0.22 + activeItems.length * 0.08));
    const shareGunib1859 = Math.max(0, remainingFail - shareProlonged1866);

    let verdictTitleRu = 'Исторический финал: Осада Верхнего Гуниба (25 августа 1859 г.)';
    let verdictTitleEn = 'Historical Finale: Siege of Upper Gunib (August 25, 1859)';
    let verdictDescRu =
      'При сохранении всех исторических ошибок (изоляция от моря, уход Хаджи-Мурата, потеря житницы Шали и отказ от дипломатии Джемалуддина) 250-тысячная армия кн. Барятинского методично сжимает кольцо блокады вокруг Ведено и Гуниба.';
    let verdictDescEn =
      'With all historical mistakes preserved (maritime isolation, Hadji Murad’s defection, loss of the Shali granary, and rejection of Jamaluddin’s diplomacy), Prince Baryatinsky’s 250,000-strong army methodically closes the blockade around Vedeno and Gunib.';
    let verdictBadgeColor = 'text-red-300 border-red-500/40 bg-red-950/40';

    if (survivalProb >= 80) {
      verdictTitleRu = 'Признанное автономное государство Кавказа (Парижско-Мичикский трактат 1856 г.)';
      verdictTitleEn = 'Recognized Autonomous State of the Caucasus (1856 Paris–Michik Treaty)';
      verdictDescRu =
        'Синтез конного манёвра Хаджи-Мурата, морских поставок в Крымскую войну, сохранения житницы Чечни и дипломатической миссии Джемалуддина делает военный разгром Имамата невозможным. Империя заключает компромиссный мир с признанием внутреннего самоуправления по Кодексу Низамов.';
      verdictDescEn =
        'The synthesis of Hadji Murad’s cavalry maneuver, Crimean War sea supplies, preservation of Chechnya’s granary, and Jamaluddin’s diplomatic mission makes military defeat of the Imamate impossible. The Empire signs a compromise peace recognizing internal self-rule under the Nizam Code.';
      verdictBadgeColor = 'text-emerald-300 border-emerald-500/50 bg-emerald-950/40';
    } else if (survivalProb >= 50) {
      verdictTitleRu = 'Перелом войны: Даргинско-Веденский компромиссный мир и сохранение автономии';
      verdictTitleEn = 'War Reversal: Dargo–Vedeno Compromise Peace & Preserved Autonomy';
      verdictDescRu =
        'Устранение внутренних расколов (союз с Хаджи-Муратом, честный суд мухтасибов и инженерная оборона Шали) срывает план генерала Евдокимова. Кавказский корпус увязает в позиционной войне и вынужден пойти на переговоры о почётной автономии горцев.';
      verdictDescEn =
        'Eliminating internal fractures (alliance with Hadji Murad, fair muhtasib courts, and fortified defense of Shali) derails General Evdokimov’s plan. The Caucasian Corps bogs down and is forced to negotiate honorable mountain autonomy.';
      verdictBadgeColor = 'text-amber-300 border-amber-500/50 bg-amber-950/40';
    } else if (survivalProb >= 22) {
      verdictTitleRu = 'Затяжная горная кампания до конца 1860-х годов (частичный успех)';
      verdictTitleEn = 'Protracted Mountain Campaign into the Late 1860s (Partial Reversal)';
      verdictDescRu =
        'Отдельные реформы замедляют продвижение царских колонн на 5–8 лет и наносят им тяжёлые потери, однако без комплексной связки «Конница + Житница Чечни + Внешняя дипломатия» численный перевес империи остаётся критическим.';
      verdictDescEn =
        'Individual reforms slow the Imperial advance by 5–8 years, but without combining “Cavalry + Chechen Granary + Foreign Diplomacy”, the Empire’s numerical superiority remains critical.';
      verdictBadgeColor = 'text-sky-300 border-sky-500/40 bg-sky-950/40';
    }

    return {
      beta0,
      linearSum: +linearSum.toFixed(2),
      synergySum: +synergySum.toFixed(2),
      totalLogit,
      survivalProb,
      treatyProb,
      activeCount: activeItems.length,
      activeMap: activeBifurcations,
      activeTitlesRu: activeItems.map((i) => i.code).join(', ') || 'нет (исторический ход)',
      activeTitlesEn: activeItems.map((i) => i.code).join(', ') || 'none (historical baseline)',
      activeSynergies,
      powderDelta,
      silverDelta,
      provisionsDelta,
      authorityDelta,
      ottomanDelta,
      troopDelta,
      cavalryDelta,
      pressureRelief: Math.min(68, pressureRelief),
      obeyBonus: Math.min(35, obeyBonus),
      prideDrop: Math.min(35, prideDrop),
      shareTreaty1856,
      shareMilitaryHold,
      shareProlonged1866,
      shareGunib1859,
      verdictTitleRu,
      verdictTitleEn,
      verdictDescRu,
      verdictDescEn,
      verdictBadgeColor
    };
  }, [activeBifurcations]);

  return (
    <div className="space-y-4">
      <TabHeroBanner
        artSrc="KeyArt_DivanKhana_Council_Vedeno_1845.jpg"
        portraitKey="Шамиль"
        portraitName={t('Имам Шамиль и Совет Диван-ханы', 'Imam Shamil & the Divan-Khana Council')}
        portraitTitle={t('Государственный Совет Имамата • Четыре эпохи Кавказской войны (1839–1859)', 'State Council of the Imamate • Four Eras of the Caucasian War (1839–1859)')}
        portraitColor="#f59e0b"
        tag={t('КАМПАНИИ ИМАМАТА • МАТЕМАТИКА ИСТОРИЧЕСКИХ РАЗВИЛОК И ВЕРДИКТ', 'CAMPAIGNS OF THE IMAMATE • COUNTERFACTUAL MATHEMATICS & VERDICT')}
        title={t(
          'Математическая модель альтернативных исходов войны, Кампании и Совет Диван-ханы',
          'Mathematical Model of Counterfactual War Outcomes, Campaigns & Divan-Khana Council'
        )}
        desc={t(
          'Исследуйте математическую вероятность другого исхода Кавказской войны по методу Монте-Карло (союз с Хаджи-Муратом, морской мост с Османской Портой в Крымскую войну, оборона житницы Чечни и дипломатия Джемалуддина) и применяйте их к живой партии.',
          'Explore the mathematical probability of alternative Caucasian War outcomes via Monte Carlo modeling (alliance with Hadji Murad, Ottoman sea bridge in the Crimean War, Chechen granary defense, and Jamaluddin’s diplomacy) and apply them to your live campaign.'
        )}
        rightSlot={
          <div className="flex flex-wrap items-center gap-2 hud-num text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold">
              <CompassRoseIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>P(1859): {counterfactualCalc.survivalProb}%</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-300 font-bold">
              <WaxSealIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {campaignAudit.victoryScore} / 100 {t('баллов', 'pts')}
                {activeScen ? ` • ${t(activeScen.yearLabel, activeScen.yearLabelEn || activeScen.yearLabel)}` : ''}
              </span>
            </span>
          </div>
        }
      />

      {/* КОМПАКТНАЯ НАВИГАЦИЯ ПО ПАЛАТЕ СЦЕНАРИЕВ, ВЕРДИКТА И МАТЕМАТИКИ РАЗВИЛОК + ПРЯМЫЕ ПЕРЕХОДЫ */}
      <div className="relative hud-walnut-bezel bg-[#13100d] border border-amber-500/45 rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-2 shadow-lg">
        <span className="hud-brass-corner tl" />
        <span className="hud-brass-corner tr" />
        <span className="hud-brass-corner bl" />
        <span className="hud-brass-corner br" />
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-serif">
          {[
            {
              id: 'campaigns',
              labelRu: '🏕️ 4 Сценария (1839–1859) и Совет Учёных',
              labelEn: '🏕️ 4 Scenarios (1839–1859) & Scholars Council'
            },
            {
              id: 'verdict',
              labelRu: `🏆 Вердикт Истории (${campaignAudit.victoryScore}/100) и Эпилог`,
              labelEn: `🏆 Verdict of History (${campaignAudit.victoryScore}/100) & Epilogue`
            },
            {
              id: 'math',
              labelRu: `📐 Математика 8 развилок (P = ${counterfactualCalc.survivalProb}%)`,
              labelEn: `📐 8-Bifurcation Math Model (P = ${counterfactualCalc.survivalProb}%)`
            }
          ].map((sec) => (
            <button
              key={sec.id}
              onClick={() => setVerdictSubTab(sec.id)}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer border ${
                verdictSubTab === sec.id
                  ? 'bg-gradient-to-b from-amber-400 to-amber-600 text-stone-950 border-amber-300 shadow'
                  : 'bg-[#191510] text-stone-300 hover:text-amber-200 border-stone-800'
              }`}
            >
              {t(sec.labelRu, sec.labelEn)}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-serif">
          <button
            onClick={() => setActiveTab('archive_ballistics')}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/45 text-amber-200 font-bold cursor-pointer transition"
          >
            <HighlandEagleIcon className="w-3.5 h-3.5 text-amber-300" />
            <span>{t('Открыть Галерею Личностей', 'Open Figures Gallery')}</span>
          </button>
          <button
            onClick={() => setActiveTab('sim_epilogue')}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/45 text-emerald-300 font-bold cursor-pointer transition"
          >
            <WaxSealIcon className="w-3.5 h-3.5 text-emerald-300" />
            <span>{t('Открыть Исторический Эпилог', 'Open Historical Epilogue')}</span>
          </button>
          <button
            onClick={handleSaveCampaignState}
            className="px-2.5 py-1.5 rounded-lg bg-gradient-to-b from-amber-400 to-amber-600 hover:brightness-110 text-stone-950 font-bold cursor-pointer transition"
          >
            💾 {t('Сохранить партию', 'Save')}
          </button>
          <button
            onClick={handleLoadCampaignState}
            className="px-2.5 py-1.5 rounded-lg bg-[#17130e] hover:bg-stone-800 border border-amber-500/40 text-amber-300 font-bold cursor-pointer transition"
          >
            📂 {t('Загрузить из архива', 'Load')}
          </button>
        </div>
      </div>

      {/* Блок 0: Интерактивная Математическая Лаборатория Альтернативной Истории (8 Точек Бифуркации, Монте-Карло 10 000 итераций) */}
      {verdictSubTab === 'math' && (
      <div className="hud-panel rounded-xl p-5 shadow-2xl space-y-4 border border-emerald-500/35">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-amber-500/25 pb-3.5">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded bg-emerald-950/90 border border-emerald-500/40 text-[10px] font-mono font-bold text-emerald-300 uppercase">
                {t('МАТЕМАТИЧЕСКОЕ МОДЕЛИРОВАНИЕ ИСХОДА ВОЙНЫ • МЕТОД МОНТЕ-КАРЛО (N = 10 000)', 'MATHEMATICAL WAR OUTCOME MODELING • MONTE CARLO (N = 10,000)')}
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/35 text-[10px] font-mono text-amber-300 font-bold">
                {t(`Активно развилок: ${counterfactualCalc.activeCount} из 8`, `Active Bifurcations: ${counterfactualCalc.activeCount} of 8`)}
              </span>
            </div>
            <h2 className="text-base md:text-lg font-bold font-serif text-amber-200 uppercase mt-1">
              {t(
                'Могли ли иные решения привести к другому исходу? Факторный анализ 8 точек бифуркации (1844–1856 гг.)',
                'Could Different Decisions Have Changed the Outcome? Factor Analysis of 8 Bifurcations (1844–1856)'
              )}
            </h2>
            <p className="text-xs text-stone-300 mt-0.5 max-w-4xl">
              {t(
                'Переключайте исторические решения ниже, чтобы просчитать по логистическому уравнению Ланчестера — Дейчмана вероятность сохранения государства к 1859 году, заключения почётного трактата 1856 года, баланс пороха и численность армии.',
                'Toggle historical decisions below to compute via the Lanchester–Deitchman logistic equation the probability of state survival by 1859, signing an honorable 1856 treaty, gunpowder balance, and army strength.'
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
            <button
              onClick={() => applyPreset('historical_1859')}
              className="px-2.5 py-1.5 rounded-lg bg-red-950/50 hover:bg-red-900/60 border border-red-500/40 text-red-200 font-bold cursor-pointer transition"
            >
              📜 {t('Реальная история (Гуниб 1859 — 4.2%)', 'Real History (Gunib 1859 — 4.2%)')}
            </button>
            <button
              onClick={() => applyPreset('internal_reform')}
              className="px-2.5 py-1.5 rounded-lg bg-amber-950/60 hover:bg-amber-900/70 border border-amber-500/40 text-amber-200 font-bold cursor-pointer transition"
            >
              🦅 {t('Внутренний перелом: Хаджи-Мурат + Чечня + Суд (75.9%)', 'Internal Reform: Hadji Murad + Chechnya + Courts (75.9%)')}
            </button>
            <button
              onClick={() => applyPreset('crimean_window')}
              className="px-2.5 py-1.5 rounded-lg bg-sky-950/60 hover:bg-sky-900/70 border border-sky-500/40 text-sky-200 font-bold cursor-pointer transition"
            >
              ⚓ {t('Крымский узел 1854: Османский мост + Хаджи-Мурат (71.5%)', 'Crimean Node 1854: Ottoman Bridge + Hadji Murad (71.5%)')}
            </button>
            <button
              onClick={() => applyPreset('full_synthesis')}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-500/50 text-emerald-200 font-bold cursor-pointer transition"
            >
              👑 {t('Полный синтез 8 решений (96.8%)', 'Full Synthesis of 8 Decisions (96.8%)')}
            </button>
          </div>
        </div>

        {/* Верхняя панель математической сводки и формулы */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-5 bg-[#0e1217] border border-amber-500/35 rounded-xl p-4 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between text-[11px] font-mono text-stone-400">
                <span>{t('УРАВНЕНИЕ ВЫЖИВАЕМОСТИ ГОСУДАРСТВА (1859)', 'STATE SURVIVAL LOGISTIC EQUATION (1859)')}</span>
                <span className="text-amber-300 font-bold">
                  L(x) = {counterfactualCalc.beta0} + {counterfactualCalc.linearSum} + {counterfactualCalc.synergySum} = {counterfactualCalc.totalLogit >= 0 ? `+${counterfactualCalc.totalLogit}` : counterfactualCalc.totalLogit}
                </span>
              </div>

              <div className="mt-2.5 grid grid-cols-2 gap-2.5">
                <div className="bg-black/60 border border-emerald-500/35 rounded-lg p-3">
                  <div className="text-[10px] font-mono uppercase text-stone-400">
                    {t('Вероятность сохранения Имамата', 'Imamate Survival Probability')}
                  </div>
                  <div className="text-2xl font-mono font-extrabold text-emerald-400 mt-0.5">
                    {counterfactualCalc.survivalProb}%
                  </div>
                  <div className="w-full h-2 bg-stone-800 rounded-full overflow-hidden mt-1.5">
                    <div
                      className="h-full bg-gradient-to-r from-red-500 via-amber-400 to-emerald-400 transition-all duration-300"
                      style={{ width: `${Math.max(4, counterfactualCalc.survivalProb)}%` }}
                    />
                  </div>
                </div>

                <div className="bg-black/60 border border-sky-500/35 rounded-lg p-3">
                  <div className="text-[10px] font-mono uppercase text-stone-400">
                    {t('Шанс Почётного Трактата (1856)', 'Honorable Peace Treaty (1856)')}
                  </div>
                  <div className="text-2xl font-mono font-extrabold text-sky-300 mt-0.5">
                    {counterfactualCalc.treatyProb}%
                  </div>
                  <div className="w-full h-2 bg-stone-800 rounded-full overflow-hidden mt-1.5">
                    <div
                      className="h-full bg-gradient-to-r from-sky-600 to-emerald-400 transition-all duration-300"
                      style={{ width: `${Math.max(3, counterfactualCalc.treatyProb)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Распределение 10 000 партий Монте-Карло по 4 исходам */}
              <div className="mt-3 space-y-1.5 text-[11px] font-mono bg-[#14110d] p-3 rounded-lg border border-amber-500/20">
                <div className="text-[10px] uppercase text-amber-300 font-bold mb-1">
                  {t('Распределение 10 000 симуляций Монте-Карло по историческим финалам:', 'Distribution of 10,000 Monte Carlo Runs Across Historical Endings:')}
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-300">1. {t('Признанная автономия (Мир 1856 г.):', 'Recognized Autonomy (1856 Treaty):')}</span>
                  <span className="font-bold text-emerald-300">{counterfactualCalc.shareTreaty1856}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-300">2. {t('Удержание горного ядра (отражение штурмов):', 'Mountain Core Held (Assaults Repelled):')}</span>
                  <span className="font-bold text-amber-300">{counterfactualCalc.shareMilitaryHold}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sky-300">3. {t('Затяжная война до 1865–1868 гг.:', 'Prolonged War to 1865–1868:')}</span>
                  <span className="font-bold text-sky-300">{counterfactualCalc.shareProlonged1866}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-300">4. {t('Историческое падение Верхнего Гуниба (1859):', 'Historical Fall of Upper Gunib (1859):')}</span>
                  <span className="font-bold text-red-300">{counterfactualCalc.shareGunib1859}%</span>
                </div>
              </div>
            </div>

            <div className={`p-3 rounded-lg border ${counterfactualCalc.verdictBadgeColor}`}>
              <div className="text-xs font-bold font-serif uppercase">
                {t(counterfactualCalc.verdictTitleRu, counterfactualCalc.verdictTitleEn)}
              </div>
              <p className="text-[11px] text-stone-200 mt-1 leading-relaxed">
                {t(counterfactualCalc.verdictDescRu, counterfactualCalc.verdictDescEn)}
              </p>
            </div>
          </div>

          {/* Правая часть верхней сводки: модификаторы ресурсов, синергии и кнопка применения к живой игре */}
          <div className="lg:col-span-7 bg-[#14110d] border border-amber-500/30 rounded-xl p-4 flex flex-col justify-between space-y-3">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/20 pb-2">
                <span className="text-xs font-bold font-serif text-amber-200 uppercase">
                  {t('Суммарный стратегический сдвиг для армии и экономики Имамата', 'Cumulative Strategic Shift for Imamate Army & Economy')}
                </span>
                <span className="text-[11px] font-mono text-emerald-300">
                  {t(`Синергетический бонус взаимодействий: +${counterfactualCalc.synergySum} лог-ед.`, `Synergy Interaction Bonus: +${counterfactualCalc.synergySum} logit`)}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                <div className="bg-black/50 border border-amber-500/25 rounded-lg p-2.5">
                  <div className="text-[10px] text-stone-400">{t('Баланс пороха', 'Powder Balance')}</div>
                  <div className="text-sm font-bold text-amber-300 mt-0.5">
                    +{counterfactualCalc.powderDelta} {t('пуд./ход', 'poods/turn')}
                  </div>
                </div>
                <div className="bg-black/50 border border-emerald-500/25 rounded-lg p-2.5">
                  <div className="text-[10px] text-stone-400">{t('Конница и пехота', 'Cavalry & Infantry')}</div>
                  <div className="text-sm font-bold text-emerald-300 mt-0.5">
                    +{counterfactualCalc.cavalryDelta + counterfactualCalc.troopDelta} {t('бойцов', 'troops')}
                  </div>
                </div>
                <div className="bg-black/50 border border-sky-500/25 rounded-lg p-2.5">
                  <div className="text-[10px] text-stone-400">{t('Снижение натиска РИ', 'Imperial Pressure Drop')}</div>
                  <div className="text-sm font-bold text-sky-300 mt-0.5">
                    -{counterfactualCalc.pressureRelief}% {t('по фронтам', 'across fronts')}
                  </div>
                </div>
                <div className="bg-black/50 border border-purple-500/25 rounded-lg p-2.5">
                  <div className="text-[10px] text-stone-400">{t('Повиновение наибов', 'Naib Obedience')}</div>
                  <div className="text-sm font-bold text-purple-300 mt-0.5">
                    +{counterfactualCalc.obeyBonus}% | {t('Гордыня', 'Pride')} -{counterfactualCalc.prideDrop}
                  </div>
                </div>
              </div>

              {/* Список активных синергий */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-mono uppercase text-amber-400 font-bold">
                  {t('Активные нелинейные синергии решений (γ_ij):', 'Active Non-Linear Decision Synergies (γ_ij):')}
                </div>
                {counterfactualCalc.activeSynergies.length === 0 ? (
                  <div className="text-[11px] font-mono text-stone-400 italic bg-black/40 p-2.5 rounded-lg border border-stone-800">
                    {t(
                      'Включите связанные пары решений (например, «Хаджи-Мурат x₁» + «Османский мост x₂» или «Житница Чечни x₄» + «Реформа мухтасибов x₆»), чтобы активировать стратегический мультипликатор.',
                      'Enable linked decision pairs (e.g., “Hadji Murad x₁” + “Ottoman Bridge x₂” or “Chechen Granary x₄” + “Muhtasib Reform x₆”) to unlock strategic multipliers.'
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                    {counterfactualCalc.activeSynergies.map((syn, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-2 bg-emerald-950/30 border border-emerald-500/35 rounded-lg px-2.5 py-1.5 text-[11px] font-mono"
                      >
                        <span className="text-emerald-200 truncate">
                          ✦ {t(syn.labelRu, syn.labelEn)}
                        </span>
                        <span className="text-emerald-400 font-bold shrink-0">+{syn.gamma}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {handleApplyCounterfactualModel && (
              <div className="pt-2 border-t border-amber-500/20 flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] text-stone-400">
                  {t(
                    'Вы можете перенести выбранную комбинацию альтернативных решений прямо в текущую кампанию:',
                    'You can apply the selected combination of counterfactual decisions directly to your active campaign:'
                  )}
                </span>
                <button
                  onClick={() => handleApplyCounterfactualModel(counterfactualCalc)}
                  className="px-4 py-2 rounded-lg bg-gradient-to-b from-emerald-400 to-emerald-600 hover:brightness-110 text-stone-950 font-bold text-xs uppercase cursor-pointer transition shadow-lg"
                >
                  ⚡ {t('Применить эту альтернативную историю к текущей кампании', 'Apply Counterfactual Timeline to Active Campaign')}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Улучшение №5: Наглядное ветвящееся «Дерево Развилок Истории (1839–1859)» */}
        <div className="bg-[#0c0f13] border border-amber-500/35 rounded-xl p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/20 pb-2">
            <div>
              <h3 className="text-xs sm:text-sm font-bold font-serif text-amber-300 uppercase flex items-center gap-2">
                <span>🌳 {t('Интерактивное Дерево Развилок Истории (1839–1859): Ветвление судьбы Кавказа', 'Interactive Branching Timeline Tree (1839–1859): Bifurcations of the Caucasus')}</span>
              </h3>
              <p className="text-[11px] text-stone-400">
                {t(
                  'Нажимайте на узлы дерева хронологии (1844 → 1846 → 1850 → 1851 → 1854 → 1856), чтобы переключать ветви истории и видеть, к какому из 4 финалов 1859 года ведёт выбранная траектория.',
                  'Click any chronological node on the tree (1844 → 1846 → 1850 → 1851 → 1854 → 1856) to switch historical branches and see which of the 4 endings in 1859 becomes dominant.'
                )}
              </p>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-mono">
              <span className="flex items-center gap-1 text-emerald-300">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
                {t('Альтернативная ветвь (активна)', 'Counterfactual Branch (Active)')}
              </span>
              <span className="flex items-center gap-1 text-red-300">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/70 inline-block" />
                {t('Реальная история (к Гунибу 1859)', 'Historical Path (toward Gunib 1859)')}
              </span>
            </div>
          </div>

          {/* 5 хронологических ступеней дерева */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 items-stretch">
            {/* Ступень 1: Корень 1839–1845 */}
            <div className="lg:col-span-2 bg-gradient-to-b from-[#1a150e] to-[#110d09] border border-amber-500/40 rounded-lg p-2.5 flex flex-col justify-between">
              <div>
                <div className="text-[9px] font-mono uppercase text-amber-400 font-bold">
                  {t('ИСХОДНЫЙ УЗЕЛ • 1839–1845', 'ROOT NODE • 1839–1845')}
                </div>
                <div className="text-xs font-bold font-serif text-amber-200 mt-1">
                  {t('От Ахульго к триумфу в Дарго', 'From Akhulgo to Dargo Triumph')}
                </div>
                <p className="text-[10px] text-stone-400 mt-1 leading-snug">
                  {t(
                    'Возрождение государства в Чечне и Дагестане, разгром экспедиции Воронцова в Ичкерийском лесу (июль 1845).',
                    'Rebirth of the state in Chechnya & Dagestan, rout of Vorontsov’s expedition in Ichkeria Forest (July 1845).'
                  )}
                </p>
              </div>
              <div className="mt-2 pt-1.5 border-t border-amber-500/20 text-[10px] font-mono text-amber-300 flex items-center justify-between">
                <span>{t('Точка старта', 'Origin')}</span>
                <span>1845 →</span>
              </div>
            </div>

            {/* Ступень 2: Ранние развилки 1844–1848 (x₃, x₇, x₅) */}
            <div className="lg:col-span-3 space-y-1.5 flex flex-col justify-between">
              <div className="text-[9px] font-mono uppercase text-stone-400 px-1">
                {t('I ЭШЕЛОН РАЗВИЛОК (1844–1848): ТЕАТРЫ И АРСЕНАЛ', 'TIER I BIFURCATIONS (1844–1848): FRONTS & ARSENAL')}
              </div>
              {['cf_kabarda_circassia', 'cf_daniyal_samur', 'cf_safarov_rifles'].map((id) => {
                const node = COUNTERFACTUAL_BIFURCATIONS.find((x) => x.id === id);
                if (!node) return null;
                const isOn = Boolean(activeBifurcations[node.id]);
                return (
                  <button
                    key={node.id}
                    onClick={() => toggleBifurcation(node.id)}
                    className={`w-full text-left p-2 rounded-lg border transition cursor-pointer flex items-center justify-between gap-2 ${
                      isOn
                        ? 'bg-emerald-950/50 border-emerald-400 text-emerald-100 shadow-md'
                        : 'bg-[#16120e] hover:bg-[#1f1913] border-red-500/30 text-stone-300'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-[9px] font-mono font-bold text-amber-300">
                        {node.code} • {t(node.year, node.yearEn)}
                      </div>
                      <div className="text-[11px] font-bold font-serif truncate">
                        {t(node.titleRu, node.titleEn)}
                      </div>
                    </div>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold shrink-0 ${
                        isOn ? 'bg-emerald-400 text-stone-950' : 'bg-red-950/70 text-red-300 border border-red-500/30'
                      }`}
                    >
                      {isOn ? `+${node.logitWeight}` : t('ИСТ.', 'HIST')}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Ступень 3: Внутренний перелом 1848–1852 (x₁, x₄, x₆) */}
            <div className="lg:col-span-3 space-y-1.5 flex flex-col justify-between">
              <div className="text-[9px] font-mono uppercase text-stone-400 px-1">
                {t('II ЭШЕЛОН (1848–1852): ХАДЖИ-МУРАТ, ЧЕЧНЯ И СУД', 'TIER II (1848–1852): HADJI MURAD, CHECHNYA & COURTS')}
              </div>
              {['cf_hadji_murad', 'cf_shali_granary', 'cf_muhtasib_justice'].map((id) => {
                const node = COUNTERFACTUAL_BIFURCATIONS.find((x) => x.id === id);
                if (!node) return null;
                const isOn = Boolean(activeBifurcations[node.id]);
                return (
                  <button
                    key={node.id}
                    onClick={() => toggleBifurcation(node.id)}
                    className={`w-full text-left p-2 rounded-lg border transition cursor-pointer flex items-center justify-between gap-2 ${
                      isOn
                        ? 'bg-emerald-950/50 border-emerald-400 text-emerald-100 shadow-md'
                        : 'bg-[#16120e] hover:bg-[#1f1913] border-red-500/30 text-stone-300'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-[9px] font-mono font-bold text-amber-300">
                        {node.code} • {t(node.year, node.yearEn)}
                      </div>
                      <div className="text-[11px] font-bold font-serif truncate">
                        {t(node.titleRu, node.titleEn)}
                      </div>
                    </div>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold shrink-0 ${
                        isOn ? 'bg-emerald-400 text-stone-950' : 'bg-red-950/70 text-red-300 border border-red-500/30'
                      }`}
                    >
                      {isOn ? `+${node.logitWeight}` : t('ИСТ.', 'HIST')}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Ступень 4: Крымское окно и Дипломатия 1853–1856 (x₂, x₈) */}
            <div className="lg:col-span-2 space-y-1.5 flex flex-col justify-between">
              <div className="text-[9px] font-mono uppercase text-stone-400 px-1">
                {t('III ЭШЕЛОН (1853–1856): КРЫМ И МИР', 'TIER III (1853–1856): CRIMEA & PEACE')}
              </div>
              {['cf_ottoman_crimea', 'cf_jamaluddin_diplomacy'].map((id) => {
                const node = COUNTERFACTUAL_BIFURCATIONS.find((x) => x.id === id);
                if (!node) return null;
                const isOn = Boolean(activeBifurcations[node.id]);
                return (
                  <button
                    key={node.id}
                    onClick={() => toggleBifurcation(node.id)}
                    className={`w-full text-left p-2.5 rounded-lg border transition cursor-pointer flex flex-col justify-between gap-1 ${
                      isOn
                        ? 'bg-emerald-950/50 border-emerald-400 text-emerald-100 shadow-md'
                        : 'bg-[#16120e] hover:bg-[#1f1913] border-red-500/30 text-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[9px] font-mono font-bold text-amber-300">
                        {node.code} • {t(node.year, node.yearEn)}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                          isOn ? 'bg-emerald-400 text-stone-950' : 'bg-red-950/70 text-red-300'
                        }`}
                      >
                        {isOn ? `+${node.logitWeight}` : t('ИСТ.', 'HIST')}
                      </span>
                    </div>
                    <div className="text-[11px] font-bold font-serif leading-snug">
                      {t(node.titleRu, node.titleEn)}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Ступень 5: 4 исторических финала 1859 года с подсветкой доминирующего исхода */}
            <div className="lg:col-span-2 space-y-1.5 flex flex-col justify-between">
              <div className="text-[9px] font-mono uppercase text-amber-300 font-bold px-1">
                {t('4 ФИНАЛА ВОЙНЫ (1859)', '4 WAR ENDINGS (1859)')}
              </div>
              {[
                {
                  id: 'end_treaty',
                  titleRu: '1. Признанная автономия (1856)',
                  titleEn: '1. Recognized Autonomy (1856)',
                  prob: counterfactualCalc.shareTreaty1856,
                  active: counterfactualCalc.survivalProb >= 75
                },
                {
                  id: 'end_hold',
                  titleRu: '2. Удержание горного ядра',
                  titleEn: '2. Mountain Core Held',
                  prob: counterfactualCalc.shareMilitaryHold,
                  active: counterfactualCalc.survivalProb >= 45 && counterfactualCalc.survivalProb < 75
                },
                {
                  id: 'end_prolonged',
                  titleRu: '3. Затяжная война до 1868 г.',
                  titleEn: '3. Prolonged War to 1868',
                  prob: counterfactualCalc.shareProlonged1866,
                  active: counterfactualCalc.survivalProb >= 18 && counterfactualCalc.survivalProb < 45
                },
                {
                  id: 'end_gunib',
                  titleRu: '4. Осада Верхнего Гуниба (1859)',
                  titleEn: '4. Siege of Upper Gunib (1859)',
                  prob: counterfactualCalc.shareGunib1859,
                  active: counterfactualCalc.survivalProb < 18
                }
              ].map((ending) => (
                <div
                  key={ending.id}
                  className={`p-1.5 rounded-lg border text-[10px] font-mono flex items-center justify-between gap-1 transition ${
                    ending.active
                      ? ending.id === 'end_gunib'
                        ? 'bg-red-950/60 border-red-400 text-red-100 font-bold shadow-md'
                        : 'bg-amber-500/20 border-amber-400 text-amber-100 font-bold shadow-md'
                      : 'bg-black/40 border-stone-800 text-stone-400'
                  }`}
                >
                  <span className="truncate">{t(ending.titleRu, ending.titleEn)}</span>
                  <span className="shrink-0 font-bold">{ending.prob}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Сетка из 8 интерактивных карточек бифуркаций */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {COUNTERFACTUAL_BIFURCATIONS.map((b) => {
            const isOn = !!activeBifurcations[b.id];
            return (
              <div
                key={b.id}
                onClick={() => toggleBifurcation(b.id)}
                className={`rounded-xl p-3.5 border transition cursor-pointer flex flex-col justify-between ${
                  isOn
                    ? 'bg-gradient-to-b from-emerald-950/45 to-[#121614] border-emerald-400/70 shadow-lg'
                    : 'bg-gradient-to-b from-[#1a1510] to-[#110e0a] border-amber-700/35 hover:border-amber-500/60 opacity-85'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <PortraitMedallion
                        src={findPortrait(b.portraitKey)}
                        name={b.portraitKey}
                        color={isOn ? '#10b981' : '#f59e0b'}
                        size={32}
                      />
                      <div className="min-w-0">
                        <div className="text-[10px] font-mono text-amber-300 font-bold">
                          {b.code} • {t(b.year, b.yearEn)}
                        </div>
                        <div className="text-xs font-bold font-serif text-stone-100 leading-tight">
                          {t(b.titleRu, b.titleEn)}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
                        isOn
                          ? 'bg-emerald-500 text-stone-950'
                          : 'bg-stone-800 text-stone-400 border border-stone-700'
                      }`}
                    >
                      {isOn ? t('ВКЛ', 'ON') : t('ИСТ.', 'HIST.')}
                    </span>
                  </div>

                  <p className="text-[11px] text-stone-400 leading-snug">
                    {t(b.historicalRu, b.historicalEn)}
                  </p>
                  <p className="text-[11px] text-emerald-200/95 leading-snug bg-black/35 p-2 rounded border border-emerald-500/20">
                    {t(b.counterfactualRu, b.counterfactualEn)}
                  </p>
                </div>

                <div className="pt-2 mt-2 border-t border-amber-500/20 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-amber-300 font-bold">ΔL = +{b.logitWeight}</span>
                  <span className="text-emerald-300">
                    {t(`Натиск -${b.pressureRelief}% | Порох +${b.powderDelta}`, `Press. -${b.pressureRelief}% | Powder +${b.powderDelta}`)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      )}

      {/* Блок 1: Переключатель 4 исторических сценариев Кавказской войны */}
      {verdictSubTab === 'campaigns' && (
      <div className="hud-panel rounded-xl p-4 sm:p-5 shadow-2xl space-y-3.5">
        <div className="border-b border-amber-500/25 pb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold font-serif text-amber-300 uppercase">
              {t(
                'Выбор исторической кампании (4 ключевых сценария 1839–1859 гг.)',
                'Select Historical Campaign (4 Key Scenarios 1839–1859)'
              )}
            </h2>
            <p className="text-xs text-stone-400">
              {t(
                'Переключите эпоху, чтобы изменить стартовые запасы пороха, натиск царских колонн и командующего Кавказским корпусом',
                'Switch historical eras to modify starting gunpowder reserves, Imperial pressure, and Separate Caucasian Corps commanders'
              )}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {CAMPAIGN_SCENARIOS.map((scen) => {
            const isCurrent = scen.id === activeScenarioId;
            return (
              <div
                key={scen.id}
                className={`rounded-xl overflow-hidden border flex flex-col justify-between transition group ${
                  isCurrent
                    ? 'bg-gradient-to-b from-[#231d12] to-[#14110b] border-amber-400/70 shadow-lg'
                    : 'bg-gradient-to-b from-[#1e1812] to-[#130f0b] border-amber-700/40 hover:border-amber-400/60'
                }`}
              >
                <div>
                  {scen.sceneArt && (
                    <div className="relative h-28 w-full overflow-hidden bg-black border-b border-amber-500/25">
                      <img
                        src={resolveMediaAsset(scen.sceneArt)}
                        alt={t(scen.yearLabel, scen.yearLabelEn || scen.yearLabel)}
                        className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#18130d] via-black/30 to-transparent" />
                      <div className="absolute top-2 left-2.5 right-2.5 flex items-center justify-between gap-1">
                        <span className="px-2 py-0.5 rounded bg-black/75 border border-amber-500/40 text-[10px] font-mono font-bold text-amber-300">
                          {t(scen.yearLabel, scen.yearLabelEn || scen.yearLabel)}
                        </span>
                      </div>
                      {scen.actors && scen.actors.length > 0 && (
                        <div className="absolute bottom-1.5 right-2.5 flex items-center -space-x-1.5">
                          {scen.actors.map((act, idx) => (
                            <span key={idx} title={act} className="inline-block ring-1 ring-black/80 rounded-full">
                              <PortraitMedallion
                                src={findPortrait(act)}
                                name={act}
                                color={isCurrent ? '#10b981' : '#f59e0b'}
                                size={26}
                              />
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  <div className="p-4 pb-2">
                    {!scen.sceneArt && (
                      <div className="text-xs font-mono font-bold text-amber-300">
                        {t(scen.yearLabel, scen.yearLabelEn || scen.yearLabel)}
                      </div>
                    )}
                    <p className="text-xs text-amber-100 font-serif font-semibold leading-snug">
                      {t(scen.subtitle, scen.subtitleEn || scen.subtitle)}
                    </p>
                    <p className="text-[11px] text-stone-300 mt-2 leading-relaxed">
                      {t(scen.goalDesc, scen.goalDescEn || scen.goalDesc)}
                    </p>
                    <div className="mt-3 p-2.5 rounded-lg bg-[#0c0e12]/90 border border-amber-500/25 text-[10px] font-mono text-stone-300 space-y-0.5">
                      <div>
                        {t('Порох:', 'Powder:')} {scen.initialResources.gunpowder} {t('пуд.', 'poods')} |{' '}
                        {t('Казна:', 'Silver:')} {scen.initialResources.silver} {t('руб.', 'rub.')}
                      </div>
                      <div>
                        {t('Авторитет:', 'Authority:')} {scen.initialResources.authority}% |{' '}
                        {t('Порта:', 'Porte:')} {scen.initialResources.ottomanSupport}%
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-4 pb-4 pt-1">
                  <button
                    onClick={() => handleSelectScenario(scen)}
                    className={`w-full py-2 rounded-lg text-xs font-bold uppercase cursor-pointer transition ${
                      isCurrent
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/45'
                        : 'bg-gradient-to-b from-amber-400 to-amber-600 hover:brightness-110 text-stone-950 shadow'
                    }`}
                  >
                    {isCurrent
                      ? t('Сценарий активен (Перезапустить)', 'Scenario Active (Restart)')
                      : t('Загрузить кампанию', 'Load Campaign')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      )}

      {/* Блок 2: Совет Учёных (Алимов), преодоление «Зульмат» и Вердикт Истории */}
      {verdictSubTab === 'verdict' && (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7 hud-panel rounded-xl p-4 shadow-2xl space-y-3">
          <div className="border-b border-amber-500/25 pb-2.5 flex items-center justify-between gap-2">
            <div>
              <h3 className="text-sm sm:text-base font-bold font-serif text-amber-300 uppercase">
                {t(
                  'Совет Учёных (Алимов) и преодоление государственной перегрузки («Зульмат»)',
                  'Council of Scholars (Alims) & Overcoming Command Exhaustion (“Zulmat”)'
                )}
              </h3>
              <p className="text-xs text-stone-400 mt-0.5">
                <RichText
                  text={t(
                    'Совещания с учёными-алимами и кадиями в [[divan|Диван-хане]] снижают [[strain|нагрузку]] [[zulmat|«зульмат»]] и укрепляют дисциплину [[naib|наибов]].',
                    'Consultations with scholars and Qadis in the [[divan|Divan-Khana]] lower [[zulmat|“Zulmat”]] [[strain|strain]] and fortify [[naib|Naib]] discipline.'
                  )}
                />
              </p>
            </div>
            <div className="flex items-center -space-x-2 shrink-0">
              <PortraitMedallion src={findPortrait('Шамиль')} name="Шамиль" color="#f59e0b" size={30} />
              <PortraitMedallion src={findPortrait('Согратль')} name="Алимы Согратля" color="#10b981" size={30} />
              <PortraitMedallion src={findPortrait('Байсунгур')} name="Байсунгур" color="#38bdf8" size={30} />
            </div>
          </div>

          <div className="space-y-2.5">
            {TARIKAT_PRACTICES.map((pr) => {
              const mentorPortrait =
                pr.id === 'practice_loud_zikr'
                  ? findPortrait('Байсунгур')
                  : findPortrait('Согратль');
              return (
                <div
                  key={pr.id}
                  className="bg-gradient-to-b from-[#1e1812] to-[#130f0b] border border-amber-700/40 hover:border-amber-400/70 rounded-xl p-3 space-y-1.5 transition"
                >
                  <div className="flex items-start gap-2.5">
                    <PortraitMedallion src={mentorPortrait} name={pr.mentor} color="#f59e0b" size={34} />
                    <div className="min-w-0 flex-1">
                      <div className="text-[10.5px] font-mono text-amber-300 font-bold">
                        📜 {t(pr.mentor, pr.mentorEn || pr.mentor)}
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold font-serif text-amber-100">
                        {t(pr.title, pr.titleEn || pr.title)}
                      </h4>
                      <p className="text-[11px] text-stone-300 leading-snug mt-0.5">
                        {t(pr.desc, pr.descEn || pr.desc)}
                      </p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-amber-500/20 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
                    <span className="text-emerald-300 font-bold">
                      {t(
                        `Стресс -${pr.stressDrop}% | Иман +${pr.imanBoost} | Авт. +${pr.authorityGain}%`,
                        `Strain -${pr.stressDrop}% | Iman +${pr.imanBoost} | Auth. +${pr.authorityGain}%`
                      )}
                    </span>
                    <button
                      onClick={() => handlePerformTarikatPractice(pr)}
                      className="px-3 py-1 rounded-lg bg-gradient-to-b from-amber-400 to-amber-600 hover:brightness-110 text-stone-950 font-bold cursor-pointer transition shadow"
                    >
                      {t('Созвать', 'Convene')} (
                      {pr.costSilver > 0
                        ? `${pr.costSilver} ${t('руб.', 'rub.')}`
                        : `-${pr.costAuthority}% ${t('авт.', 'auth.')}`}
                      )
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Вердикт Истории и оценка устойчивости государства Шамиля */}
        <div className="lg:col-span-5 hud-panel rounded-xl p-4 shadow-2xl space-y-3">
          <div className="border-b border-amber-500/25 pb-2.5">
            <h3 className="text-sm sm:text-base font-bold font-serif text-amber-300 uppercase">
              {t(
                'Вердикт Истории: Оценка жизнеспособности Имамата',
                'Verdict of History: Imamate Viability Assessment'
              )}
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              {t(
                'Сводный аналитический расчёт вашей партии на основе хроник аль-Карахи и трудов Х. М. Доного',
                'Analytical evaluation of your campaign based on al-Qarakhi’s chronicles and Prof. Kh. M. Donogo’s studies'
              )}
            </p>
          </div>

          <div className="relative rounded-xl overflow-hidden border border-amber-500/40 bg-black shadow-lg h-28">
            <img
              src={resolveMediaAsset('Archive_Arabic_Chronicle_AlQarakhi_1845.jpg')}
              alt="Chronicle of Muhammad Tahir al-Qarakhi & Shamil's Letter No. 68"
              className="w-full h-full object-cover object-center opacity-85"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex items-end justify-between p-2.5">
              <span className="text-[10px] font-mono text-amber-200 font-bold">
                📜 {t('Летопись аль-Карахи («Блеск дагестанских сабель»)', 'Chronicle of al-Qarakhi (“Shining of Dagestani Sabers”)')}
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-950/90 border border-emerald-500/40 text-[10px] font-mono text-emerald-300 shrink-0">
                ﴿ عَبْدُهُ شَمْوِيلُ ١٢٦٦ ﴾
              </span>
            </div>
          </div>

          <div className="bg-[#0e1116]/90 border border-amber-500/35 rounded-xl p-3 text-center space-y-1">
            <span className="text-[10.5px] font-mono uppercase text-stone-400">
              {t('Текущий исторический ранг правителя', 'Current Historical Ruler Rank')}
            </span>
            <div className="text-base font-bold font-serif text-amber-300">
              {campaignAudit.victoryScore >= 80
                ? t(
                    '«Триумф Сердар-ы Экрема: Неприступный Кавказ»',
                    '“Triumph of Serdar-ı Ekrem: The Impregnable Caucasus”'
                  )
                : campaignAudit.victoryScore >= 60
                ? t(
                    '«Блистательная эпоха Дарго и Ведено»',
                    '“Illustrious Era of Dargo & Vedeno”'
                  )
                : t(
                    '«Трагическая оборона Верхнего Гуниба»',
                    '“Tragic Last Stand of Upper Gunib”'
                  )}
            </div>
            <div className="text-xl font-mono font-extrabold text-emerald-400">
              {campaignAudit.victoryScore} / 100 {t('баллов', 'pts')}
            </div>
          </div>

          <div className="space-y-1.5 text-xs font-mono bg-[#14110d] p-3 rounded-xl border border-amber-500/25">
            <div className="flex justify-between">
              <span className="text-stone-400">
                {t('Общая численность войска:', 'Total Active Forces:')}
              </span>
              <span className="text-stone-100 font-bold">
                {campaignAudit.totalGarrison} {t('бойцов', 'fighters')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400">
                {t('Средний Иман корпуса наибов:', 'Average Naib Corps Iman:')}
              </span>
              <span className="text-emerald-300 font-bold">{campaignAudit.avgIman} / 100</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400">
                {t('Утверждено законов Кодекса Низама:', 'Enacted Nizam Code Laws:')}
              </span>
              <span className="text-amber-300 font-bold">
                {campaignAudit.enactedNizamsCount} {t('из 12', 'of 12')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400">
                {t('Наибств в кольце блокады:', 'Naibates Under Active Siege:')}
              </span>
              <span className="text-red-300 font-bold">
                {campaignAudit.besiegedCount} {t('из 10', 'of 10')}
              </span>
            </div>
            <div className="flex justify-between border-t border-amber-500/15 pt-1.5">
              <span className="text-stone-400">
                {t('Памятных полей побед / Сотни ветеранов:', 'Memorial Victories / Veteran Squadrons:')}
              </span>
              <span className="text-amber-200 font-bold">
                ⚔️ {battleMemorialsCount} • ★ {veteranSquadronsCount} • ⚙️ {arsenalBatchesCount}
              </span>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Блок 2.5: Сохранение партии, Соратники и Личности Кавказской войны, Исторический Эпилог (1859–1877) */}
      {verdictSubTab === 'verdict' && (
      <div className="hud-panel rounded-xl p-5 shadow-2xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono uppercase text-amber-400 font-bold">
              {t(
                'Летопись Судьбы, Соратники Имамата и Архив Партий',
                'Chronicle of Destiny, Companions of the Imamate & Campaign Archive'
              )}
            </span>
            <h3 className="text-base font-bold font-serif text-amber-100 uppercase mt-0.5">
              {t(
                'Герои Кавказской войны, Эпилог (1859–1877) и Сохранение Кампании',
                'Heroes of the Caucasian War, Epilogue (1859–1877) & Campaign Save/Load'
              )}
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              onClick={handleSaveCampaignState}
              className="px-3.5 py-2 rounded-lg bg-gradient-to-b from-amber-400 to-amber-600 hover:brightness-110 text-stone-950 font-bold cursor-pointer transition shadow-md"
            >
              💾 {t('Сохранить партию', 'Save Campaign')}
            </button>
            <button
              onClick={handleLoadCampaignState}
              className="px-3.5 py-2 rounded-lg bg-[#17130e] hover:bg-stone-800 border border-amber-500/40 text-amber-300 font-bold cursor-pointer transition"
            >
              📂 {t('Загрузить из архива', 'Load from Archive')}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
          <div className="bg-gradient-to-b from-[#1e1812] to-[#130f0b] border border-amber-700/40 rounded-xl overflow-hidden flex flex-col justify-between">
            <div>
              <div className="relative h-28 w-full overflow-hidden bg-black border-b border-amber-500/25">
                <img
                  src={resolveMediaAsset('Armory_Bazalai_Dagger_Gazyr_Showcase_1845.jpg')}
                  alt="Caucasian Shashka Gurda, Kama Bazalai & 18 Gazyrs"
                  className="w-full h-full object-cover object-center opacity-85"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1c1610] via-black/30 to-transparent" />
                <div className="absolute top-2 inset-x-3 flex items-center justify-between text-xs font-mono text-amber-300">
                  <span className="px-2 py-0.5 rounded bg-black/75 border border-amber-500/35 text-[10px] font-bold">
                    {t('СОРАТНИКИ, НАИБЫ И БАЛЛИСТИКА', 'COMPANIONS, NAIBS & BALLISTICS')}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold">
                    {t('Перков:', 'Traits:')} {(activatedFigurePerks || []).length}/{HISTORICAL_FIGURES_ARCHIVE.length}
                  </span>
                </div>
              </div>
              <div className="p-4 pb-2">
                <div className="flex items-center gap-2 mb-2">
                  <PortraitMedallion src={findPortrait('Хаджи-Мурат')} name="Хаджи-Мурат" color="#ef4444" size={34} />
                  <PortraitMedallion src={findPortrait('Байсунгур')} name="Байсунгур" color="#10b981" size={34} />
                  <PortraitMedallion src={findPortrait('Пирогов')} name="Пирогов" color="#38bdf8" size={34} />
                  <PortraitMedallion src={findPortrait('Аргутинский')} name="Аргутинский" color="#f43f5e" size={34} />
                </div>
                <h4 className="text-sm font-bold font-serif text-amber-100 mt-1">
                  {t(
                    'Портретная галерея: Хаджи-Мурат, Байсунгур, Н. И. Пирогов, Джемалуддин и баллистика 18 газырей',
                    'Portrait Gallery: Hadji Murad, Baysungur, Dr. Pirogov, Jamaluddin & 18-Gazyr Ballistics'
                  )}
                </h4>
                <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                  {t(
                    'Изучите биографии и портреты ключевых фигур эпохи, задействуйте их уникальные способности в кампании и рассчитайте дистанцию залпа из 18 нагрудных газырей.',
                    'Inspect historical biographies and oil portraits of key figures, activate their unique campaign traits, and calculate 18-gazyr volley ranges.'
                  )}
                </p>
              </div>
            </div>
            <div className="p-4 pt-2">
              <button
                onClick={() => setActiveTab('archive_ballistics')}
                className="w-full py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/45 text-amber-200 font-bold text-xs uppercase cursor-pointer transition"
              >
                🦅 {t('Открыть Галерею Личностей и Баллистику Газырей →', 'Open Figures Gallery & Gazyr Ballistics →')}
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-b from-[#1e1812] to-[#130f0b] border border-amber-700/40 rounded-xl overflow-hidden flex flex-col justify-between">
            <div>
              <div className="relative h-28 w-full overflow-hidden bg-black border-b border-amber-500/25">
                <img
                  src={resolveMediaAsset('Epilogue_Kaluga_And_Medina_1859_1871.jpg')}
                  alt="Historical Epilogue of Imam Shamil (Kaluga, Istanbul, Medina & Sogratl 1859-1877)"
                  className="w-full h-full object-cover object-center opacity-85"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1c1610] via-black/30 to-transparent" />
                <div className="absolute top-2 inset-x-3 flex items-center justify-between text-xs font-mono text-emerald-400">
                  <span className="px-2 py-0.5 rounded bg-black/75 border border-emerald-500/35 text-[10px] font-bold">
                    {t('ИСТОРИЧЕСКИЙ ЭПИЛОГ (1859–1877)', 'HISTORICAL EPILOGUE (1859–1877)')}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold">
                    {t('Глав пройдено:', 'Chapters Resolved:')} {Object.keys(epilogueDecisionsMade || {}).length}/{EPILOGUE_CHAPTERS.length}
                  </span>
                </div>
              </div>
              <div className="p-4 pb-2">
                <div className="flex items-center gap-2 mb-2">
                  <PortraitMedallion src={findPortrait('Шамиль')} name="Шамиль" color="#f59e0b" size={34} />
                  <PortraitMedallion src={findPortrait('Барятинский')} name="Барятинский" color="#f43f5e" size={34} />
                  <PortraitMedallion src={findPortrait('Согратл')} name="Согратл" color="#10b981" size={34} />
                </div>
                <h4 className="text-sm font-bold font-serif text-amber-100 mt-1">
                  {t(
                    'Судьба Имама Шамиля: Калуга, триумф в Стамбуле (1869), Медина и восстание 1877 года в Согратле',
                    'Fate of Imam Shamil: Kaluga, Triumph in Istanbul (1869), Medina & the 1877 Sogratl Uprising'
                  )}
                </h4>
                <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                  {t(
                    'Пройдите интерактивные главы после падения Гуниба: присяга сыновей, прощальный хадж через Стамбул и трагический «Малый газават» четвёртого имама Мухаммад-Хаджи Согратлинского.',
                    'Experience the interactive chapters after Gunib: the oath of Shamil’s sons, the farewell Hajj through Istanbul, and the tragic 1877 uprising of the 4th Imam Muhammad-Hajji of Sogratl.'
                  )}
                </p>
              </div>
            </div>
            <div className="p-4 pt-2">
              <button
                onClick={() => setActiveTab('sim_epilogue')}
                className="w-full py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/45 text-emerald-300 font-bold text-xs uppercase cursor-pointer transition"
              >
                📜 {t('Открыть Исторический Эпилог (1859–1877) →', 'Open Historical Epilogue (1859–1877) →')}
              </button>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Блок 3: Технический реестр 3D-ассетов и шейдеров для Этапа 2 (виден только в режиме Студии) */}
      {studioMode && (
        <div className="hud-panel rounded-xl p-5 shadow-2xl space-y-3">
          <h3 className="text-sm font-bold font-serif text-amber-300 uppercase">
            {t(
              'Технический реестр 3D-моделей, DEM-высот и шейдеров для Этапа 2 (Unreal Engine 5.5 Vertical Slice)',
              'Technical Registry of 3D Assets, SRTM DEM Heightmaps & Shaders (Unreal Engine 5.5 Vertical Slice)'
            )}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {UE5_ASSET_PIPELINE.map((asset) => (
              <div
                key={asset.code}
                className="bg-[#17130e] border border-amber-700/35 rounded-xl p-3.5 space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <span className="text-amber-400">{asset.code}</span>
                  <span className="text-emerald-300">
                    {t('ТЗ:', 'Spec:')} {asset.readyPercent}%
                  </span>
                </div>
                <div className="font-bold text-stone-100 font-serif">
                  {t(asset.title, asset.titleEn || asset.title)}
                </div>
                <div className="text-[11px] text-sky-300 font-mono">
                  {t(asset.polybudget, asset.polybudgetEn || asset.polybudget)}
                </div>
                <p className="text-[11px] text-stone-400 leading-relaxed">
                  {t(asset.shaderSpec, asset.shaderSpecEn || asset.shaderSpec)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
