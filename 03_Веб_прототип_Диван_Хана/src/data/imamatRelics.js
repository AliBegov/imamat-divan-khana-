// ============================================================================
// ФАЗА 1 ГЕНЕРАЛЬНОГО ПЛАНА: АРХИТЕКТУРА УДЕРЖАНИЯ, ПАМЯТИ НАИБОВ И РЕЛИКВИЙ ДИВАН-ХАНЫ
// 1. Живая память наибов (Куначество / Долг / Затаённая обида) -> прямое влияние на P(exec)
// 2. Мета-прогрессия между кампаниями («Сокровищница Реликвий Имамата» в localStorage)
// ============================================================================

export const RELICS_STORAGE_KEY = 'imamat_unlocked_relics_v1';
export const ACTIVE_RELICS_STORAGE_KEY = 'imamat_active_relics_v1';

export const IMAMAT_RELICS_CATALOG = [
  {
    id: 'relic_shamil_seal_ring',
    icon: '💍',
    unlockedByDefault: true,
    titleRu: 'Восьмиугольный перстень-печать Шамиля',
    titleEn: 'Shamil’s Octagonal Signet Seal',
    originRu: 'Стартовая реликвия Диван-ханы (Ведено, 1845 г.)',
    originEn: 'Foundational Divan-Khana Relic (Vedeno, 1845)',
    unlockCondRu: 'Открыто с начала первой кампании',
    unlockCondEn: 'Available from the first campaign',
    bonusSummaryRu: '+6% к повиновению P(exec) всех гонцов и +5% стартового Авторитета',
    bonusSummaryEn: '+6% envoy P(exec) obedience & +5% starting Authority',
    obedienceBonus: 6,
    powderStartBonus: 0,
    silverStartBonus: 0,
    winterAttritionMult: 1.0,
    combatWinBonus: 0
  },
  {
    id: 'relic_hadji_murat_burka',
    icon: '🐎',
    unlockedByDefault: true,
    titleRu: 'Белая андийская бурка Хаджи-Мурата',
    titleEn: 'Hadji Murad’s White Andi Burka',
    originRu: 'Почётный дар конному авангарду Хунзаха',
    originEn: 'Honorary gift of the Khunzakh cavalry vanguard',
    unlockCondRu: 'Открыто для испытания конных рейдов по тылам кордона',
    unlockCondEn: 'Unlocked for deep cavalry interdiction raids',
    bonusSummaryRu: '+20 ОХ всем конным сотням и +15 руб. трофейного серебра за перехват обозов',
    bonusSummaryEn: '+20 MP to cavalry squadrons & +15r extra silver on convoy raids',
    obedienceBonus: 0,
    mpBonus: 20,
    convoySilverBonus: 15,
    winterAttritionMult: 1.0,
    combatWinBonus: 4
  },
  {
    id: 'relic_safarov_copper_basin',
    icon: '🛡️',
    unlockedByDefault: false,
    titleRu: 'Медный сейсмоскоп инженера Хаджи-Юсуфа',
    titleEn: 'Engineer Hajji Yusuf’s Copper Seismoscope',
    originRu: 'Оборона Гергебиля и Салты (инженерный корпус)',
    originEn: 'Defense of Gergebil & Salty (Engineering Corps)',
    unlockCondRu: 'Открывается после первой победы в осаде или подрыва камуфлета',
    unlockCondEn: 'Unlocks after winning a siege battle or detonating a counter-mine camouflet',
    bonusSummaryRu: '+25 пудов пороха в Арсенал и -30% потерь гарнизона от мортир',
    bonusSummaryEn: '+25 poods starting powder & -30% mortar casualties in sieges',
    obedienceBonus: 2,
    powderStartBonus: 25,
    silverStartBonus: 0,
    winterAttritionMult: 1.0,
    combatWinBonus: 5
  },
  {
    id: 'relic_baysungur_banner',
    icon: '🏴',
    unlockedByDefault: false,
    titleRu: 'Зелёное знамя Беноевской сотни Байсунгура',
    titleEn: 'Green Banner of Baysungur’s Benoy Hundred',
    originRu: 'Засеки буковых лесов Ичкерии (Дарго, 1845 г.)',
    originEn: 'Beech forest abatis of Ichkeria (Dargo, 1845)',
    unlockCondRu: 'Открывается за разгром колонны или обоза РИ в лесной теснине',
    unlockCondEn: 'Unlocks by routing an Imperial column or supply train',
    bonusSummaryRu: '+7% к шансу победы в ущельях и несокрушимая стойкость в засадах',
    bonusSummaryEn: '+7% combat win chance in defiles & unbreakable ambush morale',
    obedienceBonus: 4,
    powderStartBonus: 0,
    silverStartBonus: 0,
    winterAttritionMult: 1.0,
    combatWinBonus: 7
  },
  {
    id: 'relic_jabrail_unicorn_sight',
    icon: '💣',
    unlockedByDefault: false,
    titleRu: 'Латунный квадрант литейщика устаза Джабраила',
    titleEn: 'Foundry Master Jabrail’s Brass Quadrant',
    originRu: 'Пушечный двор столицы Дарго-Ведено',
    originEn: 'Cannon Foundry of Capital Dargo-Vedeno',
    unlockCondRu: 'Открывается при выполнении любого заказа в Арсенале Ведено',
    unlockCondEn: 'Unlocks upon completing any commission in Vedeno Arsenal',
    bonusSummaryRu: '+1 горный единорог артиллерии Талхига и +30 пуд. селитры',
    bonusSummaryEn: '+1 mountain unicorn to Talkhig’s artillery & +30 poods powder',
    obedienceBonus: 0,
    powderStartBonus: 30,
    silverStartBonus: 0,
    winterAttritionMult: 1.0,
    combatWinBonus: 5
  },
  {
    id: 'relic_alqarakhi_chronicle_inkwell',
    icon: '🖋️',
    unlockedByDefault: false,
    titleRu: 'Походная чернильница аль-Карахи и Кубачинский ларец',
    titleEn: 'Al-Qarakhi’s Campaign Inkwell & Kubachi Coffer',
    originRu: 'Походная канцелярия Имамата и казна Байт аль-маль',
    originEn: 'Imamate Chancellery & Bayt al-Mal Treasury',
    unlockCondRu: 'Открывается при вручении серебряного ордена или выполнении Целей эпохи',
    unlockCondEn: 'Unlocks upon awarding a Silver Order or completing Era Goals',
    bonusSummaryRu: '+120 руб. серебром в казну и смягчение зимних заносов на перевалах (-50%)',
    bonusSummaryEn: '+120 silver rubles & -50% winter snowbound pass drain',
    obedienceBonus: 5,
    powderStartBonus: 0,
    silverStartBonus: 120,
    winterAttritionMult: 0.5,
    combatWinBonus: 2
  }
];

export function loadUnlockedRelicIds() {
  const defaults = IMAMAT_RELICS_CATALOG.filter((r) => r.unlockedByDefault).map((r) => r.id);
  try {
    const raw = window.localStorage.getItem(RELICS_STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return defaults;
    return Array.from(new Set([...defaults, ...parsed]));
  } catch {
    return defaults;
  }
}

export function loadActiveRelicIds() {
  const fallback = ['relic_shamil_seal_ring', 'relic_hadji_murat_burka'];
  try {
    const raw = window.localStorage.getItem(ACTIVE_RELICS_STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return fallback;
    return parsed.slice(0, 2);
  } catch {
    return fallback;
  }
}

export function computeActiveRelicBonuses(activeIds = []) {
  return activeIds.reduce(
    (acc, id) => {
      const rel = IMAMAT_RELICS_CATALOG.find((r) => r.id === id);
      if (!rel) return acc;
      acc.obedienceBonus += rel.obedienceBonus || 0;
      acc.combatWinBonus += rel.combatWinBonus || 0;
      acc.mpBonus += rel.mpBonus || 0;
      acc.convoySilverBonus += rel.convoySilverBonus || 0;
      acc.powderStartBonus += rel.powderStartBonus || 0;
      acc.silverStartBonus += rel.silverStartBonus || 0;
      acc.winterAttritionMult *= rel.winterAttritionMult ?? 1.0;
      return acc;
    },
    {
      obedienceBonus: 0,
      combatWinBonus: 0,
      mpBonus: 0,
      convoySilverBonus: 0,
      powderStartBonus: 0,
      silverStartBonus: 0,
      winterAttritionMult: 1.0
    }
  );
}

export function getNaibLoyaltyMemory(naib) {
  const score = Math.max(-3, Math.min(3, Math.round(naib?.trustScore ?? 0)));
  if (score >= 2) {
    return {
      score,
      obedienceMod: score * 4,
      icon: '🤝',
      badgeRu: score === 3 ? 'Кровный кунак (+12% P)' : 'Верный соратник (+8% P)',
      badgeEn: score === 3 ? 'Sworn Kunak (+12% P)' : 'Trusted Companion (+8% P)',
      toneClass: 'bg-emerald-950/85 border-emerald-400/65 text-emerald-200',
      reasonRu:
        naib?.lastMemoryRu ||
        'Помнит присланные караваны пороха и серебряные знаки отличия Диван-ханы.',
      reasonEn:
        naib?.lastMemoryEn ||
        'Remembers timely powder convoys and silver honors bestowed by the Divan-Khana.'
    };
  }
  if (score <= -1) {
    const mod = score * 6;
    return {
      score,
      obedienceMod: mod,
      icon: '💢',
      badgeRu: score <= -2 ? `Глубокая обида (${mod}% P)` : `Обида наиба (${mod}% P)`,
      badgeEn: score <= -2 ? `Bitter Grudge (${mod}% P)` : `Naib Resentment (${mod}% P)`,
      toneClass: 'bg-rose-950/85 border-rose-400/70 text-rose-200',
      reasonRu:
        naib?.lastMemoryRu ||
        'Уязвлён отказом в помощи под осадой или обделён при разделе трофеев.',
      reasonEn:
        naib?.lastMemoryEn ||
        'Stung by lack of relief under siege or slighted in trophy distribution.'
    };
  }
  return {
    score,
    obedienceMod: score * 4,
    icon: '⚖️',
    badgeRu: score === 1 ? 'Почёт и долг (+4% P)' : 'Ровная служба (0% P)',
    badgeEn: score === 1 ? 'Dutiful Respect (+4% P)' : 'Steady Duty (0% P)',
    toneClass: 'bg-stone-900/90 border-amber-500/35 text-amber-100',
    reasonRu:
      naib?.lastMemoryRu ||
      'Исполняет низам по присяге; ждёт справедливых решений Имама.',
    reasonEn:
      naib?.lastMemoryEn ||
      'Serves under oath to the Nizam; awaits just decrees from the Imam.'
  };
}
