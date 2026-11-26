// ИГРОВОЙ ФРОНТ-ЭНД УРОВНЯ ЛУЧШИХ СТРАТЕГИЙ
// Собраны проверенные приёмы интерфейса:
//  • Total War / Crusader Kings III — кинематографичный титульный экран с key-art и меню паузы по Esc;
//  • Crusader Kings III / Victoria 3 — богатые всплывающие подсказки ресурсов с разбивкой и изменением за ход;
//  • Europa Universalis IV / Stellaris — полоса алертов-иконок «что требует внимания» в шапке;
//  • Civilization VI / VII — кнопка хода с подсказкой следующего действия и заставка смены хода;
//  • Civilization / Old World — тосты уведомлений, не сдвигающие экран;
//  • Total War / Paradox — горячие клавиши (Enter — ход, 1–8 — разделы, Esc — меню).
//  • Crusader Kings III — вложенные подсказки (подчёркнутые термины раскрываются новой подсказкой) и портреты в подсказках.
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { resolveMediaAsset } from '../../data/embeddedMediaAssets.js';
import { ShamilOrdersHeraldicStrip } from '../shared/ShamilOrdersSvg.jsx';
import {
  CompassRoseIcon,
  HighlandEagleIcon,
  PowderFlaskIcon,
  ShashkaSabersIcon,
  WaxSealIcon
} from './PeriodIcons.jsx';

// ===== Язык для HUD-компонентов без явного пропса t =====
export const HudLangContext = createContext((ru) => ru);

// ===== Намерение наведения: подсказка закрывается с задержкой, чтобы мышь успела перейти на неё (как в CK3) =====
export function useHoverIntent(closeDelay = 200) {
  const [open, setOpen] = useState(false);
  const timer = useRef(null);
  const show = () => {
    clearTimeout(timer.current);
    setOpen(true);
  };
  const hide = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(false), closeDelay);
  };
  useEffect(() => () => clearTimeout(timer.current), []);
  return { open, show, hide, setOpen };
}

// ===== Портреты персонажей (CK3): медальон с портретом или монограммой =====
const PORTRAIT_RULES = [
  { match: /Гази-Мухаммад|Ghazi|karata/i, src: 'Portrait_Ghazi_Muhammad_Karata_1845.jpg' },
  { match: /Даниял|Daniyal|irib/i, src: 'Portrait_Daniyal_Bek_Irib_1845.jpg' },
  { match: /Кибит|Kibit|teletl/i, src: 'Portrait_Kibit_Magoma_Teletl_1845.jpg' },
  { match: /Аргутинск|Argutinsk|Граббе|Grabbe/i, src: 'Portrait_General_Argutinsky_1847.jpg' },
  { match: /Фрейтаг|Freytag|Freitag/i, src: 'Portrait_General_Freytag_1845.jpg' },
  { match: /Барятинск|Baryatinsk|Евдокимов|Evdokimov/i, src: 'Portrait_Prince_Baryatinsky_1859.jpg' },
  { match: /Воронцов|Vorontsov|Клюки|Klugenau/i, src: 'Portrait_Vorontsov_1845.jpg' },
  { match: /Шамил|Shamil|imam/i, src: 'Portrait_Imam_Shamil_Vedeno_1845.jpg' },
  { match: /Хаджи-Мурат|Hadji Mura|hadji_murat|khunzakh/i, src: 'Portrait_Hadji_Murat_Khunzakh_1851.jpg' },
  { match: /Байсунгур|Baysungur|benoy/i, src: 'Portrait_Baysungur_Benoy_1845.jpg' },
  { match: /Талгик|Talkhig|talkhig|shali/i, src: 'Portrait_Talkhig_Shali_1845.jpg' },
  { match: /Юсуф|Сафаров|Yusuf|Safarov|powder_caravan|gergebil|Идрис|Idris|Омер-паша|Omer/i, src: 'Portrait_Hadji_Yusuf_Safarov_1845.jpg' },
  { match: /Исмаил|Ismail|chapar_vedeno|Мухаммад-Амин|Muhammad-Amin/i, src: 'Portrait_Ismail_Chapar_1845.jpg' },
  { match: /Пирогов|Pirogov/i, src: 'Portrait_Pirogov_Salty_1847.jpg' },
  { match: /Согратл|Sogratl|chokh|Магомед|Muhammad|Карахи|Qarakhi/i, src: 'Portrait_Muhammad_Hajji_Sogratl_1877.jpg' }
];
export const findPortrait = (...keys) => {
  const hay = keys.filter(Boolean).join(' ');
  const found = PORTRAIT_RULES.find((r) => r.match.test(hay))?.src || null;
  return found ? resolveMediaAsset(found) : null;
};
const TITLE_WORDS = /^(Наиб|Сотник|Мудир|Инженер|Имам|Ген\.|Генерал|Naib|Centurion|Mudir|Engineer|Imam|Gen\.|муртазеков|Murtazek)$/i;
const monogramOf = (name = '') => {
  const word = name.split(/\s+/).find((w) => w && !TITLE_WORDS.test(w)) || name;
  return (word[0] || '?').toUpperCase();
};

export function PortraitMedallion({ src, name = '', color = '#d97706', size = 40, selected = false, dim = false }) {
  return (
    <span
      className={`hud-portrait relative inline-flex shrink-0 items-center justify-center rounded-full overflow-hidden ${
        selected ? 'hud-portrait-selected' : ''
      } ${dim ? 'grayscale opacity-70' : ''}`}
      style={{ width: size, height: size, borderColor: color }}
      aria-hidden="true"
    >
      {src ? (
        <img src={resolveMediaAsset(src)} alt="" className="w-full h-full object-cover object-top" draggable={false} />
      ) : (
        <span
          className="w-full h-full flex items-center justify-center font-serif font-extrabold text-stone-950"
          style={{ background: `radial-gradient(circle at 35% 30%, #fff8, ${color} 60%)`, fontSize: size * 0.42 }}
        >
          {monogramOf(name)}
        </span>
      )}
    </span>
  );
}

// ===== Вложенные подсказки CK3: термины [[ключ|подпись]] раскрываются новой подсказкой =====
export const HUD_GLOSSARY = {
  naib: {
    ru: 'Наиб',
    en: 'Naib',
    textRu: 'Наместник Имама в [[naibate|наибстве]]: собирает [[zakat|закят]], командует [[murtazek|муртазеками]] и ополчением, отвечает перед [[divan|Диваном]].',
    textEn: 'The Imam’s deputy in a [[naibate|naibate]]: collects [[zakat|zakat]], commands [[murtazek|murtazeks]] and militia, answers to the [[divan|Divan]].'
  },
  naibate: {
    ru: 'Наибство',
    en: 'Naibate',
    textRu: 'Военно-административный округ Имамата во главе с [[naib|наибом]]. Под [[siege|осадой]] перестаёт давать провиант и порох.',
    textEn: 'A military-administrative district led by a [[naib|naib]]. Under [[siege|siege]] it stops yielding provisions and powder.'
  },
  murtazek: {
    ru: 'Муртазеки',
    en: 'Murtazeks',
    textRu: 'Постоянная конная гвардия Имамата: один всадник с каждых десяти дворов, на содержании [[baytalmal|Байт аль-маль]].',
    textEn: 'The Imamate’s standing cavalry guard: one rider per ten households, paid by the [[baytalmal|Bayt al-Mal]].'
  },
  zakat: {
    ru: 'Закят',
    en: 'Zakat',
    textRu: 'Обязательный шариатский налог. Поступает в [[baytalmal|Байт аль-маль]]; поборы сверх меры подрывают [[authority|авторитет]].',
    textEn: 'The obligatory sharia levy. Flows into the [[baytalmal|Bayt al-Mal]]; overtaxing erodes [[authority|authority]].'
  },
  baytalmal: {
    ru: 'Байт аль-маль',
    en: 'Bayt al-Mal',
    textRu: 'Казна Имамата: [[zakat|закят]], пятая часть военной добычи и выкупы. Оплачивает послов, мастеров и [[murtazek|муртазеков]].',
    textEn: 'The Imamate treasury: [[zakat|zakat]], a fifth of spoils and ransoms. Pays envoys, craftsmen and [[murtazek|murtazeks]].'
  },
  divan: {
    ru: 'Диван-хана',
    en: 'Divan-Khana',
    textRu: 'Государственный совет при Имаме в Ведено: [[naib|наибы]], алимы и мудиры обсуждают [[nizam|низамы]] и войну.',
    textEn: 'The state council of the Imam at Vedeno: [[naib|naibs]], scholars and mudirs debate [[nizam|nizams]] and war.'
  },
  nizam: {
    ru: 'Низам',
    en: 'Nizam',
    textRu: 'Указ-уложение Шамиля. Каждый действующий низам добавляет [[strain|нагрузку на Имама]], но укрепляет порядок.',
    textEn: 'Shamil’s statute. Each active nizam adds [[strain|command strain]] but strengthens order.'
  },
  authority: {
    ru: 'Авторитет Имама',
    en: 'Imam’s Authority',
    textRu: 'Насколько точно [[naib|наибы]] исполняют приказы. Ниже 55% — риск отпадения [[naibate|наибств]].',
    textEn: 'How faithfully [[naib|naibs]] carry out orders. Below 55% [[naibate|naibates]] may defect.'
  },
  strain: {
    ru: 'Нагрузка на Имама',
    en: 'Command Strain',
    textRu: 'Растёт с числом дел и [[nizam|низамов]]. Выше 70% приказы теряются в пути и падает [[authority|авторитет]].',
    textEn: 'Grows with affairs and [[nizam|nizams]]. Above 70% orders get lost and [[authority|authority]] drops.'
  },
  siege: {
    ru: 'Осада',
    en: 'Siege',
    textRu: 'Колонна РИ блокирует аул. Каждый ход гарнизон тает, пока его не деблокируют конница или [[powder|порох]] для вылазки.',
    textEn: 'An Imperial column blockades an aul. The garrison dwindles each turn until relieved by cavalry or [[powder|powder]] for a sortie.'
  },
  powder: {
    ru: 'Порох',
    en: 'Powder',
    textRu: 'Делается на мельницах Ведено и Телетля из селитры. Нужен для батарей, вылазок и обороны при [[siege|осаде]].',
    textEn: 'Made in the Vedeno & Teletl mills from saltpetre. Needed for batteries, sorties and [[siege|siege]] defence.'
  },
  cordon: {
    ru: 'Кордонная линия',
    en: 'Cordon Line',
    textRu: 'Цепь русских крепостей (Грозная, Внезапная, Шура). Из них выходят колонны, грозящие [[siege|осадой]] аулам.',
    textEn: 'The chain of Russian forts (Groznaya, Vnezapnaya, Shura). Columns march out of them, threatening auls with [[siege|siege]].'
  },
  adat: {
    ru: 'Адат',
    en: 'Adat',
    textRu: 'Родовой обычай горских джамаатов (кровная месть, выкуп по обычаю). Шамиль заменил адаты единым [[sharia|шариатом]] и [[nizam|низамами]].',
    textEn: 'Customary clan law of highland jamaats (blood feud, traditional fines). Shamil replaced Adat with unified [[sharia|Sharia]] and [[nizam|Nizams]].'
  },
  sharia: {
    ru: 'Шариат',
    en: 'Sharia',
    textRu: 'Каноническое исламское право, по которому судят кадии и [[muhtasib|мухтасибы]] под надзором [[divan|Диван-ханы]].',
    textEn: 'Canonical Islamic law administered by Qadis and [[muhtasib|Muhtasibs]] under the supervision of the [[divan|Divan-Khana]].'
  },
  muhtasib: {
    ru: 'Мухтасиб',
    en: 'Muhtasib',
    textRu: 'Ревизор законности, воинской дисциплины и сборов [[zakat|закята]] в [[naibate|наибстве]], подотчётный [[divan|Дивану]].',
    textEn: 'Inspector of legality, military discipline, and [[zakat|zakat]] collection in a [[naibate|naibate]], reporting to the [[divan|Divan]].'
  },
  porte: {
    ru: 'Блистательная Порта',
    en: 'Sublime Porte',
    textRu: 'Османский двор султана Абдул-Меджида I в Стамбуле. Через Трабзон и Синоп идут тайные поставки [[powder|пороха]] и свинца за серебро [[baytalmal|Байт аль-маль]].',
    textEn: 'The Ottoman court of Sultan Abdülmecid I in Istanbul. Secret shipments of [[powder|powder]] and lead arrive via Trabzon paid from the [[baytalmal|Bayt al-Mal]].'
  },
  unicorn: {
    ru: 'Горный единорог',
    en: 'Mountain Unicorn',
    textRu: 'Лёгкое медное орудие, отливаемое устазом Джабраилом в Ведено. Ведёт навесной и картечный огонь на [[powder|порохе]] при обороне [[siege|осаждённых]] аулов.',
    textEn: 'Lightweight bronze gun cast by Ustaz Jabrail in Vedeno. Fires shell and canister using [[powder|powder]] in defence of [[siege|besieged]] auls.'
  },
  gazyr: {
    ru: 'Газыри',
    en: 'Gazyrs',
    textRu: '18 нагрудных трубочек черкески с готовыми мерками [[powder|пороха]] и пулей — позволяют [[murtazek|муртазеку]] перезаряжать ружьё на скаку.',
    textEn: '18 chest cartridge tubes on a cherkesska holding pre-measured [[powder|powder]] charges, letting a [[murtazek|murtazek]] reload at a gallop.'
  },
  zulmat: {
    ru: '«Зульмат»',
    en: '“Zulmat”',
    textRu: 'Тяжёлое переутомление и перегрузка правителя от [[strain|бремени власти]], потерь и [[siege|осад]]. Преодолевается через [[tariqa|Совет учёных-алимов]].',
    textEn: 'Severe command exhaustion from extreme [[strain|command strain]], casualties and [[siege|sieges]]. Overcome through the [[tariqa|Council of Scholars]].'
  },
  tariqa: {
    ru: 'Совет учёных (Алимов)',
    en: 'Council of Scholars (Alims)',
    textRu: 'Собрание учёных-правоведов (алимов) и кадиев Имамата — опора [[authority|авторитета]] Имама и законности [[naib|наибов]].',
    textEn: 'The assembly of legal scholars (alims) and Qadis of the Imamate — pillar of the Imam’s [[authority|authority]] and [[naib|naib]] discipline.'
  }
};

export function RichText({ text, depth = 0 }) {
  if (!text || typeof text !== 'string') return text || null;
  const parts = [];
  const re = /\[\[([a-z_]+)(?:\|([^\]]+))?\]\]/g;
  let last = 0;
  let m;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    parts.push(<HudTerm key={`${m.index}-${m[1]}`} id={m[1]} label={m[2]} depth={depth} />);
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}

export function HudTerm({ id, label, depth = 0 }) {
  const t = useContext(HudLangContext);
  const entry = HUD_GLOSSARY[id];
  const hover = useHoverIntent(220);
  const ref = useRef(null);
  const [alignRight, setAlignRight] = useState(false);
  if (!entry) return <span>{label || id}</span>;
  const onEnter = () => {
    const r = ref.current?.getBoundingClientRect();
    if (r) setAlignRight(r.left + 250 > window.innerWidth - 8);
    hover.show();
  };
  return (
    <span ref={ref} className="relative inline" onMouseEnter={onEnter} onMouseLeave={hover.hide}>
      <span className="hud-term">{label || t(entry.ru, entry.en)}</span>
      {hover.open && depth < 5 && (
        <span
          className={`hud-tooltip hud-tooltip-nested absolute top-full mt-1 w-[240px] z-[80] text-left font-sans not-italic ${
            alignRight ? 'right-0' : 'left-0'
          }`}
          style={{ zIndex: 80 + depth }}
          onMouseEnter={hover.show}
          onMouseLeave={hover.hide}
        >
          <span className="block text-[11.5px] font-serif font-bold text-amber-300 border-b border-amber-500/30 pb-1 mb-1">
            {t(entry.ru, entry.en)}
          </span>
          <span className="block text-[10.5px] text-stone-300 leading-snug">
            <RichText text={t(entry.textRu, entry.textEn)} depth={depth + 1} />
          </span>
        </span>
      )}
    </span>
  );
}

const hasTerms = (text) => typeof text === 'string' && text.includes('[[');

// ===== Шапка сюжетной вкладки в духе CK3 / Victoria 3 (фоновое полотно, орехово-латунный багет, медальон с портретом) =====
export function TabHeroBanner({ artSrc, portraitKey, portraitName, portraitTitle, portraitColor = '#d97706', tag, title, desc, rightSlot }) {
  const portraitSrc = findPortrait(portraitKey, portraitName);
  return (
    <div className="relative hud-panel hud-walnut-bezel rounded-xl shadow-2xl">
      <span className="hud-brass-corner tl" />
      <span className="hud-brass-corner tr" />
      <span className="hud-brass-corner bl" />
      <span className="hud-brass-corner br" />
      <div className="relative p-4 sm:p-5">
        {artSrc && (
          <div className="absolute inset-0 rounded-[9px] overflow-hidden pointer-events-none">
            <img
              src={resolveMediaAsset(artSrc)}
              alt=""
              className="w-full h-full object-cover object-center opacity-30 select-none"
              draggable={false}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#120e0a]/95 via-[#16120d]/85 to-[#120e0a]/90" />
          </div>
        )}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0 flex-1">
            {portraitName && (
              <div className="relative shrink-0">
                <PortraitMedallion src={portraitSrc} name={portraitName} color={portraitColor} size={56} selected />
              </div>
            )}
            <div className="min-w-0">
              {tag && (
                <div className="inline-flex items-center gap-1.5 text-[10px] font-serif uppercase tracking-widest text-amber-300/95 font-bold mb-0.5">
                  <WaxSealIcon className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>{tag}</span>
                </div>
              )}
              <h2 className="text-base sm:text-lg font-bold font-serif text-amber-200 leading-snug">{title}</h2>
              {portraitName && (
                <div className="text-[11px] hud-num text-stone-300 mt-0.5">
                  <span className="text-amber-200 font-semibold">{portraitName}</span>
                  {portraitTitle ? <span className="text-stone-400"> • {portraitTitle}</span> : null}
                </div>
              )}
              {desc && (
                <p className="text-xs text-stone-300 mt-1.5 leading-relaxed max-w-4xl">
                  <RichText text={desc} />
                </p>
              )}
            </div>
          </div>
          {rightSlot && <div className="relative z-10 flex flex-wrap items-center gap-2 shrink-0 hud-num">{rightSlot}</div>}
        </div>
      </div>
    </div>
  );
}

const isInteractiveTarget = (el) => {
  if (!el) return false;
  const tag = el.tagName;
  return (
    el.isContentEditable ||
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    tag === 'BUTTON' ||
    tag === 'A'
  );
};

// ===== Изменение ресурсов за прошлый ход (как «+12/мес» в Victoria 3 и CK3) =====
export function useResourceDeltas(resources, turn) {
  const latestResourcesRef = useRef(resources);
  latestResourcesRef.current = resources;
  const snapshotRef = useRef({ turn, values: resources });
  const [deltas, setDeltas] = useState({});
  useEffect(() => {
    if (snapshotRef.current.turn === turn) return;
    const cur = latestResourcesRef.current;
    const prev = snapshotRef.current.values;
    const next = {};
    Object.keys(cur).forEach((k) => {
      next[k] = (cur[k] ?? 0) - (prev[k] ?? 0);
    });
    snapshotRef.current = { turn, values: cur };
    setDeltas(next);
    // Снимок берётся строго в момент смены хода
  }, [turn]);
  return deltas;
}

// ===== Ресурс с подсказкой в стиле CK3 (заголовок, значение, изменение, разбивка, пояснение) =====
export function ResourceChip({ icon, value, unit, label, colorClass, delta, desc, rows = [], warn = false, hiddenClass = '', portrait = null }) {
  const t = useContext(HudLangContext);
  const { open, show, hide, setOpen } = useHoverIntent(220);
  const hasDelta = typeof delta === 'number' && delta !== 0;
  return (
    <span
      className={`relative ${hiddenClass || 'flex'} items-center`}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={() => setOpen(false)}
      tabIndex={0}
      aria-label={`${label}: ${value}${unit ? ` ${unit}` : ''}`}
    >
      <span
        className={`px-1.5 py-0.5 rounded flex items-center gap-1 font-bold cursor-help transition hover:bg-white/5 ${colorClass} ${
          warn ? 'hud-warn-pulse' : ''
        }`}
      >
        {icon}
        <span>
          {value}
          {unit ? ` ${unit}` : ''}
        </span>
        {hasDelta && (
          <span className={`text-[9.5px] font-extrabold ${delta > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {delta > 0 ? '▲' : '▼'}
            {Math.abs(delta)}
          </span>
        )}
      </span>
      {open && (
        <span className="hud-tooltip absolute right-0 top-full mt-2 w-[270px] z-[70] text-left font-sans">
          {portrait ? (
            <span className="flex items-center gap-2 border-b border-amber-500/30 pb-1.5 mb-1.5">
              <PortraitMedallion src={portrait.src} name={portrait.name} color={portrait.color} size={38} />
              <span className="min-w-0">
                <span className="block text-[12px] font-serif font-bold text-amber-300 leading-tight">{label}</span>
                <span className="block text-[10px] text-stone-400 truncate">
                  {portrait.name}
                  {portrait.title ? ` • ${portrait.title}` : ''}
                </span>
              </span>
            </span>
          ) : (
            <span className="block text-[12px] font-serif font-bold text-amber-300 border-b border-amber-500/30 pb-1 mb-1.5">
              {label}
            </span>
          )}
          <span className="flex items-baseline justify-between text-[11px] mb-1">
            <span className="text-stone-400">{t('Сейчас', 'Now')}</span>
            <span className={`font-mono font-extrabold ${colorClass}`}>
              {value}
              {unit ? ` ${unit}` : ''}
            </span>
          </span>
          {typeof delta === 'number' && (
            <span className="flex items-baseline justify-between text-[11px] mb-1.5">
              <span className="text-stone-400">{t('За прошлый ход', 'Last turn')}</span>
              <span
                className={`font-mono font-bold ${
                  delta > 0 ? 'text-emerald-400' : delta < 0 ? 'text-rose-400' : 'text-stone-400'
                }`}
              >
                {delta > 0 ? `+${delta}` : delta}
              </span>
            </span>
          )}
          {rows.length > 0 && (
            <span className="block border-t border-stone-800 pt-1.5 mt-1 space-y-0.5">
              {rows.map((r) => (
                <span key={r.label} className="flex items-baseline justify-between text-[10.5px]">
                  <span className="text-stone-300">{r.label}</span>
                  <span
                    className={`font-mono font-bold ${
                      r.tone === 'good' ? 'text-emerald-400' : r.tone === 'bad' ? 'text-rose-400' : 'text-amber-200'
                    }`}
                  >
                    {r.value}
                  </span>
                </span>
              ))}
            </span>
          )}
          {desc && (
            <span className="block text-[10.5px] text-stone-400 italic leading-snug mt-1.5">
              <RichText text={desc} />
            </span>
          )}
          {hasTerms(desc) && (
            <span className="block text-[9.5px] text-stone-500 font-mono mt-1.5 pt-1 border-t border-stone-800">
              {t('Наведите на подчёркнутое — вложенная подсказка', 'Hover underlined terms for nested tooltips')}
            </span>
          )}
        </span>
      )}
    </span>
  );
}

// ===== Полоса алертов (EU4 / Stellaris): только то, что требует решения игрока =====
const SEVERITY_STYLES = {
  critical: 'bg-rose-950/80 border-rose-500/70 text-rose-200 hud-alert-critical',
  warning: 'bg-amber-950/70 border-amber-500/60 text-amber-200',
  info: 'bg-sky-950/70 border-sky-500/50 text-sky-200'
};

function AlertItem({ a }) {
  const { open, show, hide, setOpen } = useHoverIntent(220);
  return (
    <div className="relative" role="listitem" onMouseEnter={show} onMouseLeave={hide}>
      <button
        onClick={a.onClick}
        onFocus={show}
        onBlur={() => setOpen(false)}
        aria-label={a.title}
        className={`hud-alert relative w-7 h-7 rounded-md border flex items-center justify-center text-[14px] cursor-pointer transition hover:scale-110 ${
          SEVERITY_STYLES[a.severity] || SEVERITY_STYLES.info
        }`}
      >
        {a.icon}
        {a.count > 1 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[15px] h-[15px] px-0.5 rounded-full bg-stone-950 border border-current text-[9px] font-mono font-extrabold flex items-center justify-center">
            {a.count}
          </span>
        )}
      </button>
      {open && (
        <div className="hud-tooltip absolute left-1/2 -translate-x-1/2 top-full mt-2 w-[270px] z-[70]">
          {a.portrait ? (
            <div className="flex items-center gap-2 mb-1.5">
              <PortraitMedallion src={a.portrait.src} name={a.portrait.name} color={a.portrait.color} size={38} />
              <div className="min-w-0">
                <div className="text-[12px] font-serif font-bold text-amber-300 leading-tight">{a.title}</div>
                <div className="text-[10px] text-stone-400 truncate">{a.portrait.name}</div>
              </div>
            </div>
          ) : (
            <div className="text-[12px] font-serif font-bold text-amber-300 mb-1">{a.title}</div>
          )}
          <div className="text-[10.5px] text-stone-300 leading-snug">
            <RichText text={a.detail} />
          </div>
          <div className="text-[10px] text-sky-300 font-mono mt-1.5">🖱 {a.action}</div>
        </div>
      )}
    </div>
  );
}

export function AlertBar({ alerts, t }) {
  if (!alerts.length) {
    return (
      <span className="hidden lg:flex items-center gap-1 text-[10px] font-mono text-emerald-400/80 px-2">
        ✓ {t('Всё спокойно — можно завершать ход', 'All quiet — ready to end turn')}
      </span>
    );
  }
  return (
    <div className="flex items-center gap-1" role="list" aria-label={t('Требует внимания', 'Needs attention')}>
      {alerts.map((a) => (
        <AlertItem key={a.id} a={a} />
      ))}
    </div>
  );
}

// ===== Кнопка хода (Civilization): месяц, счётчик нерешённых дел, горячая клавиша =====
export function EndTurnButton({ turn, monthLabel, pendingCount, onEndTurn, t }) {
  return (
    <button
      onClick={onEndTurn}
      title={t('Завершить ход (Enter)', 'End turn (Enter)')}
      className={`hud-end-turn relative bg-gradient-to-b from-amber-400 via-amber-500 to-amber-700 hover:from-amber-300 hover:via-amber-400 hover:to-amber-600 text-stone-950 font-extrabold pl-1 pr-3 py-0.5 rounded-md shadow-md flex items-center gap-1.5 text-xs transition cursor-pointer border border-amber-300/70 ${
        pendingCount === 0 ? 'hud-end-turn-ready' : ''
      }`}
    >
      <span className="w-6 h-6 rounded-full bg-stone-950 text-amber-300 font-mono text-[10px] flex items-center justify-center border border-amber-300/70">
        {turn}
      </span>
      <span className="flex flex-col items-start leading-none">
        <span>{t('ЗАВЕРШИТЬ ХОД', 'END TURN')}</span>
        <span className="text-[8.5px] font-mono font-bold text-stone-900/80 normal-case">
          {pendingCount > 0
            ? t(`⚠ ${pendingCount} ждут решения • Enter`, `⚠ ${pendingCount} pending • Enter`)
            : `${monthLabel} • Enter`}
        </span>
      </span>
    </button>
  );
}

// ===== Заставка смены хода (Civilization / Total War): дата, хиджра, батальная иллюстрация и итог хода =====
const TURN_SPLASH_SCENES = [
  {
    art: 'KeyArt_DivanKhana_Council_Vedeno_1845.jpg',
    portraitKey: 'Шамиль',
    captionRu: 'Акт II • Совет Диван-ханы в Дарго-Ведено',
    captionEn: 'Act II • State Council of the Divan-Khana at Dargo-Vedeno',
    quoteRu: '«Сила государства — не в камнях стен, а в справедливости закона и единстве наибов»',
    quoteEn: '“The strength of a state lies not in stone walls, but in just law and united Naibs.”'
  },
  {
    art: 'Diorama_Ichkeria_Forest_Ambush_1845.jpg',
    portraitKey: 'Байсунгур',
    captionRu: 'Акт II • Буковые засеки Ичкерии и хребет Речель',
    captionEn: 'Act II • Beech Abatis of Ichkeria & Rechel Ridge',
    quoteRu: 'Байсунгур: «Пусть Воронцов войдёт в Дарго — дорогу назад он будет покупать кровью за каждый сухарь!»',
    quoteEn: 'Baysungur: “Let Vorontsov enter Dargo—he will buy his road back with blood for every biscuit!”'
  },
  {
    art: 'Crisis_Kabarda_Tatartup_1846.jpg',
    portraitKey: 'Хаджи-Мурат',
    captionRu: 'Акт III • Конный прорыв к Тереку и Татартупу',
    captionEn: 'Act III • Cavalry Breakthrough to the Terek at Tatartup',
    quoteRu: 'Хаджи-Мурат: «Где проходит конь мюрида — там нет кордонных линий!»',
    quoteEn: 'Hadji Murad: “Where a murid’s steed passes, no cordon line can stand!”'
  },
  {
    art: 'Diorama_Siege_TopDown_Salty_1847.jpg',
    portraitKey: 'Сафаров',
    captionRu: 'Акт III • Подземные блиндажи и минная оборона Салтов',
    captionEn: 'Act III • Subterranean Blindages & Counter-Mines at Salty',
    quoteRu: 'Сафаров: «Пока дрожит вода в медном тазу — русские сапёры роют под нами. Готовьте пороховой горн!»',
    quoteEn: 'Safarov: “While water trembles in the copper basin, sappers dig beneath us. Prime the powder mine!”'
  },
  {
    art: 'Diplomacy_Trabzon_Felucca_Smuggling_1846.jpg',
    portraitKey: 'Мухаммад-Амин',
    captionRu: 'Акт III • Ночной прорыв фелуки с порохом из Трапезунда',
    captionEn: 'Act III • Midnight Gunpowder Felucca Run from Trabzon',
    quoteRu: 'Мухаммад-Амин: «Пока Черкесия держит берег моря, караваны со свинцом не иссякнут»',
    quoteEn: 'Muhammad-Amin: “So long as Circassia holds the coast, the lead caravans shall not cease.”'
  },
  {
    art: 'Crisis_Chokh_Siege_1849.jpg',
    portraitKey: 'Кибит-Магома',
    captionRu: 'Акт III • 22 000 ядер генерала Аргутинского над Чохом',
    captionEn: 'Act III • 22,000 Shells of Gen. Argutinsky Over Chokh',
    quoteRu: 'Кибит-Магома: «Скалы Чоха крошатся от ядер, но дух гарнизона крепче базальта!»',
    quoteEn: 'Kibit-Magoma: “The cliffs of Chokh crumble under shells, yet the garrison’s spirit is harder than basalt!”'
  },
  {
    art: 'Crisis_Shali_Forest_Clearing_1850.jpg',
    portraitKey: 'Талхиг',
    captionRu: 'Акт IV • «Война топором» на Шалинской просеке',
    captionEn: 'Act IV • “War by the Axe” on the Shali Clearing',
    quoteRu: 'Талхиг: «На каждую вырубленную версту леса мы ответим тремя линиями крытых окопов!»',
    quoteEn: 'Talkhig: “For every verst of felled forest we shall answer with three lines of covered trenches!”'
  },
  {
    art: 'KeyArt_Michik_1855_Jamaluddin_Exchange.jpg',
    portraitKey: 'Шамиль',
    captionRu: 'Акт IV • Размен на реке Мичик и возвращение сына Джемалуддина',
    captionEn: 'Act IV • The Michik River Exchange & Return of Son Jamaluddin',
    quoteRu: 'Джемалуддин: «Шестнадцать лет в Петербурге я помнил орлов над скалой Ахульго, отец…»',
    quoteEn: 'Jamaluddin: “For sixteen years in St. Petersburg I remembered the eagles above Akhulgo, Father…”'
  }
];

export function TurnTransitionOverlay({ turn, dateLabel, deltas, suppressed = false, t }) {
  const prevTurnRef = useRef(turn);
  const [visibleTurn, setVisibleTurn] = useState(null);
  useEffect(() => {
    if (prevTurnRef.current === turn) {
      return undefined;
    }
    prevTurnRef.current = turn;
    if (suppressed || turn <= 1) {
      setVisibleTurn(null);
      return undefined;
    }
    setVisibleTurn(turn);
    const id = setTimeout(() => setVisibleTurn(null), 1350);
    return () => clearTimeout(id);
  }, [turn, suppressed]);
  if (visibleTurn === null || suppressed) return null;
  const scene = TURN_SPLASH_SCENES[Math.abs(visibleTurn - 1) % TURN_SPLASH_SCENES.length];
  const items = [
    ['🔥', t('Порох', 'Powder'), deltas.gunpowder],
    ['🌾', t('Провиант', 'Provisions'), deltas.provisions],
    ['🪙', t('Казна', 'Treasury'), deltas.silver],
    ['👑', t('Авторитет', 'Authority'), deltas.authority]
  ].filter(([, , v]) => typeof v === 'number');
  return (
    <div className="fixed inset-0 z-[80] pointer-events-none flex items-center justify-center p-4" aria-live="polite">
      <div className="hud-turn-splash relative overflow-hidden rounded-2xl max-w-xl w-full border-2 border-amber-400/75 shadow-2xl bg-[#0e0b08]">
        <div className="relative h-36 sm:h-44 w-full overflow-hidden">
          <img
            src={resolveMediaAsset(scene.art)}
            alt={scene.captionEn}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e0b08] via-[#0e0b08]/45 to-black/30" />
          <div className="absolute top-2.5 left-3 right-3 flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded bg-black/75 border border-amber-400/50 text-[10px] font-mono uppercase tracking-[0.25em] text-amber-300 font-bold">
              {t('Ход кампании', 'Campaign Turn')} #{visibleTurn}
            </span>
            <span className="px-2.5 py-0.5 rounded bg-black/75 border border-amber-500/35 text-[10px] font-serif text-amber-200">
              📜 {t(scene.captionRu, scene.captionEn)}
            </span>
          </div>
        </div>
        <div className="px-6 pb-4 -mt-6 relative z-10 text-center">
          <div className="inline-flex items-center justify-center mb-1.5">
            <PortraitMedallion
              src={findPortrait(scene.portraitKey)}
              name={scene.captionRu}
              color="#f59e0b"
              size={48}
            />
          </div>
          <div className="text-xl sm:text-2xl font-serif font-bold text-amber-100 hud-title-glow">
            {dateLabel}
          </div>
          {scene.quoteRu && (
            <p className="mt-1 text-xs font-serif italic text-amber-200/90 max-w-md mx-auto leading-snug">
              {t(scene.quoteRu, scene.quoteEn || scene.quoteRu)}
            </p>
          )}
          <div className="hud-divider my-2" />
          {items.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-[12px] font-mono">
              {items.map(([icon, label, v]) => (
                <span
                  key={label}
                  className={`px-2 py-0.5 rounded bg-black/50 border border-stone-800 ${
                    v > 0 ? 'text-emerald-300' : v < 0 ? 'text-rose-300' : 'text-stone-400'
                  }`}
                >
                  {icon} {label} {v > 0 ? `+${v}` : v}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ===== Тост уведомления (не сдвигает раскладку, сам исчезает) =====
export function ToastBanner({ text, onClose, t }) {
  if (!text) return null;
  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[75] max-w-[640px] w-[92vw]" role="status" aria-live="polite">
      <div key={text} className="hud-toast flex items-start gap-3 px-4 py-2.5">
        <span className="text-lg leading-none mt-0.5">📜</span>
        <span className="flex-1 text-[12px] text-amber-100 leading-snug">{text}</span>
        <button
          onClick={onClose}
          aria-label={t('Закрыть уведомление', 'Dismiss')}
          className="text-amber-300 hover:text-white font-bold cursor-pointer"
        >
          ✕
        </button>
        <span className="hud-toast-timer" />
      </div>
    </div>
  );
}

// ===== Титульный экран (Total War / CK3): key-art, выбор исторического сценария (1839–1859), сложность и слоты летописи =====
export function TitleScreen({
  t,
  lang,
  setLang,
  onContinue,
  onStartSpectator,
  onLoadSave,
  hasSave,
  saveMetaSummary = null,
  onOpenManual,
  scenarios = [],
  activeScenarioId = 'camp_1845',
  onSelectScenario = null,
  difficultyWeight = 1.0,
  onChangeDifficulty = null
}) {
  const activeScenario = scenarios.find((s) => s.id === activeScenarioId) || scenarios[2] || scenarios[0];
  const DIFFICULTY_TIERS = [
    { weight: 0.85, ru: 'Наиб (Обычная)', en: 'Naib (Normal)' },
    { weight: 1.0, ru: 'Имам (Историческая)', en: 'Imam (Historical)' },
    { weight: 1.22, ru: 'Ахульго (Суровая)', en: 'Akhulgo (Hardcore)' }
  ];

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-black text-stone-100" role="dialog" aria-modal="true">
      <div
        className="fixed inset-0 hud-kenburns bg-cover bg-center"
        style={{
          backgroundImage: `url("${resolveMediaAsset(activeScenario?.sceneArt || 'KeyArt_DivanKhana_Council_Vedeno_1845.jpg')}")`
        }}
      />
      <div className="fixed inset-0 bg-gradient-to-r from-black/92 via-black/75 to-black/55" />
      <div className="fixed inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/45" />
      <div className="hud-embers fixed inset-0 pointer-events-none" />

      <div className="hud-safe-screen relative min-h-full max-w-[1440px] mx-auto px-5 sm:px-12 py-6 sm:py-8 flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8 hud-fade-up">
        {/* Левая колонна: Герб Диван-ханы и Главное меню */}
        <div className="w-full max-w-[540px]">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-500/45 text-[10.5px] font-serif uppercase tracking-[0.28em] text-amber-300">
            <WaxSealIcon className="w-3.5 h-3.5 text-amber-400" />
            <span>{t('Северо-Восточный Кавказ • 1839–1859', 'North-Eastern Caucasus • 1839–1859')}</span>
          </div>
          <h1 className="mt-3 text-5xl sm:text-6xl font-serif font-bold text-amber-100 hud-title-glow leading-none">
            {t('ИМАМАТ', 'IMAMAT')}
          </h1>
          <div className="mt-2 text-xl sm:text-2xl font-serif text-amber-300 tracking-wide flex items-center gap-2">
            <ShashkaSabersIcon className="w-5 h-5 text-amber-400" />
            <span>{t('Диван-Хана', 'Divan-Khana')}</span>
          </div>
          <div className="hud-divider my-4 w-72" />
          <p className="text-[13px] text-stone-300 leading-relaxed max-w-[490px]">
            {t(
              'Пять актов исторической военной драмы (1839–1859): от клятвы на окровавленной скале Ахульго и буковой западни Дарго — до суда над Хаджи-Муратом, возвращения сына Джемалуддина на реке Мичик и последнего боя на Верхнем Гунибе.',
              'Five acts of historical military drama (1839–1859): from the oath on blood-soaked Akhulgo and the Dargo forest trap to the trial of Hadji Murad, son Jamaluddin’s return on the Michik River, and the final stand on Upper Gunib.'
            )}
          </p>

          <nav className="mt-6 flex flex-col items-start gap-1.5" aria-label={t('Главное меню', 'Main menu')}>
            <button onClick={onContinue} className="hud-menu-item hud-menu-primary" autoFocus>
              ▶ {t('Продолжить кампанию', 'Continue Campaign')}
              {activeScenario && (
                <span className="ml-1.5 text-[10.5px] font-normal text-stone-900/85">
                  ({t(activeScenario.yearLabel.split('—')[0].trim(), activeScenario.yearLabelEn.split('—')[0].trim())})
                </span>
              )}
            </button>
            {onStartSpectator && (
              <button onClick={onStartSpectator} className="hud-menu-item border-emerald-500/60 bg-emerald-950/50 text-emerald-200 hover:bg-emerald-900/60">
                <HighlandEagleIcon className="w-4 h-4 inline mr-1.5 text-emerald-300" />
                {t('Режим Наблюдателя: ИИ делает ходы', 'Spectator Mode: Watch AI Play')}
              </button>
            )}
            {hasSave && (
              <button onClick={onLoadSave} className="hud-menu-item">
                📂 {t('Загрузить сохранённую летопись', 'Load Saved Chronicle')}
                {saveMetaSummary && (
                  <span className="ml-1.5 hud-num text-[10.5px] text-amber-300/90">({saveMetaSummary})</span>
                )}
              </button>
            )}
            <button onClick={onOpenManual} className="hud-menu-item">
              <CompassRoseIcon className="w-4 h-4 inline mr-1.5 text-amber-300" />
              {t('Полевое наставление новичку', 'Beginner’s Field Guide')}
            </button>
            <button onClick={() => setLang(lang === 'ru' ? 'en' : 'ru')} className="hud-menu-item">
              🌐 {lang === 'ru' ? 'Language: English' : 'Язык: Русский'}
            </button>
          </nav>

          <ShamilOrdersHeraldicStrip t={t} className="mt-4 max-w-[490px]" />

          <div className="mt-4 text-[10.5px] hud-num text-stone-400">
            Enter — {t('начать поход', 'begin campaign')} • Esc — {t('шатёр паузы и слоты сохранений', 'pause tent & save slots')}
          </div>
        </div>

        {/* Правая колонна: Орехово-латунная палата выбора исторической кампании и сложности */}
        {scenarios.length > 0 && (
          <div className="relative w-full max-w-[600px] hud-walnut-bezel bg-[#120e0b]/92 border border-amber-500/50 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-3.5">
            <span className="hud-brass-corner tl" />
            <span className="hud-brass-corner tr" />
            <span className="hud-brass-corner bl" />
            <span className="hud-brass-corner br" />

            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/25 pb-2.5">
              <div>
                <div className="text-[10px] font-serif uppercase tracking-[0.22em] text-amber-400 font-bold flex items-center gap-1.5">
                  <WaxSealIcon className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t('Выбор исторического сценария', 'Select Historical Campaign')}</span>
                </div>
                <div className="text-sm sm:text-base font-serif font-bold text-amber-100 mt-0.5">
                  {t('Четыре эпохи Кавказской войны (1839–1859)', 'Four Eras of the Caucasian War (1839–1859)')}
                </div>
              </div>
              {onChangeDifficulty && (
                <div className="flex items-center gap-1 bg-[#0b0907] p-1 rounded-lg border border-amber-700/40">
                  {DIFFICULTY_TIERS.map((tier) => {
                    const isSel = Math.abs(difficultyWeight - tier.weight) < 0.08;
                    return (
                      <button
                        key={tier.weight}
                        onClick={() => onChangeDifficulty(tier.weight)}
                        className={`px-2 py-1 rounded text-[10px] font-serif font-bold cursor-pointer transition ${
                          isSel
                            ? 'bg-amber-500 text-stone-950 shadow'
                            : 'text-stone-300 hover:text-amber-200'
                        }`}
                      >
                        {t(tier.ru, tier.en)}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {scenarios.map((scen) => {
                const isSelected = scen.id === activeScenarioId;
                return (
                  <button
                    key={scen.id}
                    onClick={() => onSelectScenario && onSelectScenario(scen)}
                    className={`group text-left rounded-xl overflow-hidden border transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-amber-400 bg-gradient-to-b from-[#261c12] to-[#17110b] ring-1 ring-amber-400/60 shadow-lg'
                        : 'border-stone-800 bg-[#14100c]/85 hover:border-amber-600/60'
                    }`}
                  >
                    <div>
                      <div className="relative h-20 w-full overflow-hidden">
                        <img
                          src={resolveMediaAsset(scen.sceneArt)}
                          alt=""
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-500 opacity-80"
                          draggable={false}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#14100c] via-black/30 to-transparent" />
                        <span
                          className={`absolute top-1.5 right-1.5 px-2 py-0.5 rounded text-[9.5px] font-serif font-bold ${
                            isSelected
                              ? 'bg-amber-400 text-stone-950'
                              : 'bg-black/75 text-amber-200 border border-amber-500/35'
                          }`}
                        >
                          {isSelected ? t('✓ Выбрано', '✓ Selected') : t('Выбрать', 'Select')}
                        </span>
                      </div>
                      <div className="p-2.5 space-y-1">
                        <div className="text-xs font-serif font-bold text-amber-200 leading-snug">
                          {t(scen.yearLabel, scen.yearLabelEn || scen.yearLabel)}
                        </div>
                        <p className="text-[10.5px] text-stone-300 leading-snug line-clamp-2">
                          {t(scen.subtitle, scen.subtitleEn || scen.subtitle)}
                        </p>
                      </div>
                    </div>
                    <div className="px-2.5 pb-2 pt-1 border-t border-stone-800/80 flex items-center justify-between text-[10px] hud-num text-amber-300/90">
                      <span className="inline-flex items-center gap-1">
                        <PowderFlaskIcon className="w-3 h-3 text-amber-400" />
                        <span>{scen.initialResources.gunpowder}п</span>
                      </span>
                      <span>🪙 {scen.initialResources.silver}₽</span>
                      <span>👑 {scen.initialResources.authority}%</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {activeScenario && (
              <div className="bg-[#0d0a08] border border-amber-500/30 rounded-xl px-3 py-2 flex items-center justify-between gap-3">
                <div className="text-[11px] text-stone-300 leading-snug">
                  <strong className="text-amber-300 font-serif">{t('Цель кампании:', 'Campaign Goal:')}</strong>{' '}
                  {t(activeScenario.goalDesc, activeScenario.goalDescEn || activeScenario.goalDesc)}
                </div>
                <button
                  onClick={onContinue}
                  className="shrink-0 px-3 py-1.5 rounded-lg bg-gradient-to-b from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-stone-950 font-serif text-xs font-extrabold cursor-pointer shadow"
                >
                  {t('Начать →', 'Start →')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ===== Меню паузы по Esc (Total War / Paradox) с картой горячих клавиш =====
const HOTKEYS = [
  ['Enter', 'Завершить ход', 'End turn'],
  ['1 – 4', 'Главные разделы', 'Main sections'],
  ['5 – 8', 'Дополнительные разделы', 'Extra sections'],
  ['Ctrl/⌘ + колесо', 'Зум 3D-стола к курсору', 'Zoom table to cursor'],
  ['Перетаскивание', 'Панорама при приближении', 'Pan when zoomed'],
  ['Esc', 'Это меню', 'This menu']
];

export function PauseMenu({
  t,
  onResume,
  onSave,
  onLoad,
  saveSlotsMeta = [],
  onSaveSlot,
  onLoadSlot,
  onTitle,
  onToggleSound,
  soundEnabled
}) {
  return (
    <div className="fixed inset-0 z-[90] bg-black/75 backdrop-blur-sm flex items-center justify-center p-3" role="dialog" aria-modal="true" onClick={onResume}>
      <div className="relative hud-panel hud-walnut-bezel w-[490px] max-w-[94vw] max-h-[90vh] overflow-y-auto p-5 hud-fade-up" onClick={(e) => e.stopPropagation()}>
        <span className="hud-brass-corner tl" />
        <span className="hud-brass-corner tr" />
        <span className="hud-brass-corner bl" />
        <span className="hud-brass-corner br" />
        <div className="text-center">
          <div className="text-[10px] font-serif uppercase tracking-[0.35em] text-amber-400 font-bold flex items-center justify-center gap-1.5">
            <WaxSealIcon className="w-3.5 h-3.5 text-amber-400" />
            <span>{t('Походный шатёр • Пауза', 'Field Tent • Paused')}</span>
          </div>
          <div className="text-xl font-serif font-bold text-amber-200 mt-0.5">{t('Шатёр Имама', 'The Imam’s Tent')}</div>
          <div className="hud-divider my-3" />
        </div>
        <div className="flex flex-col gap-1.5">
          <button onClick={onResume} className="hud-menu-item hud-menu-primary w-full" autoFocus>
            ▶ {t('Вернуться к столу', 'Return to the Table')}
          </button>

          {saveSlotsMeta.length > 0 ? (
            <div className="my-1.5 rounded-xl bg-[#0d0a08]/90 border border-amber-600/35 p-2.5 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-serif uppercase tracking-wider text-amber-300 font-bold px-0.5">
                <span>📜 {t('Архив летописей (3 слота + Автосейв)', 'Chronicle Archive (3 Slots + Autosave)')}</span>
                <span className="hud-num text-stone-400">UImamatSaveGame</span>
              </div>
              {saveSlotsMeta.map((slot) => (
                <div
                  key={slot.id}
                  className="flex items-center justify-between gap-2 rounded-lg bg-[#16120e] border border-stone-800 px-2.5 py-1.5 text-[11px]"
                >
                  <div className="min-w-0">
                    <div className="font-serif font-bold text-amber-200 truncate">
                      {slot.isAuto
                        ? t('⚡ Автосохранение хода', '⚡ Turn Autosave')
                        : `${t('Слот', 'Slot')} #${slot.id}`}
                      {slot.exists && (
                        <span className="ml-1.5 hud-num text-[10px] text-emerald-300">
                          • {t(`Ход ${slot.turn}`, `Turn ${slot.turn}`)}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] hud-num text-stone-400 truncate">
                      {slot.exists
                        ? `${slot.seasonShort || ''} • ${slot.savedAt || t('в архиве', 'archived')}`
                        : t('Пустой свиток — готов к записи', 'Empty scroll — ready to record')}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {!slot.isAuto && onSaveSlot && (
                      <button
                        onClick={() => onSaveSlot(slot.id)}
                        className="px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/35 border border-amber-400/50 text-amber-200 font-serif text-[10.5px] font-bold cursor-pointer transition"
                      >
                        💾 {t('Записать', 'Save')}
                      </button>
                    )}
                    {onLoadSlot && (
                      <button
                        onClick={() => onLoadSlot(slot.id)}
                        disabled={!slot.exists}
                        className="px-2 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/35 disabled:opacity-35 disabled:cursor-not-allowed border border-emerald-400/50 text-emerald-200 font-serif text-[10.5px] font-bold cursor-pointer transition"
                      >
                        📂 {t('Загрузить', 'Load')}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <button onClick={onSave} className="hud-menu-item w-full">💾 {t('Сохранить кампанию', 'Save Campaign')}</button>
              <button onClick={onLoad} className="hud-menu-item w-full">📂 {t('Загрузить кампанию', 'Load Campaign')}</button>
            </>
          )}

          <button onClick={onToggleSound} className="hud-menu-item w-full">
            {soundEnabled ? '🔊' : '🔇'} {t('Звук и эмбиент Кавказа', 'Sound & Caucasus Ambient')}: {soundEnabled ? t('вкл', 'on') : t('выкл', 'off')}
          </button>
          <button onClick={onTitle} className="hud-menu-item w-full">🏔️ {t('В главное меню и сценарии', 'Main Menu & Scenarios')}</button>
        </div>
        <div className="mt-3.5 border-t border-amber-500/20 pt-2.5">
          <div className="text-[10px] font-serif uppercase tracking-wider text-amber-400 mb-1.5 font-bold">⌨️ {t('Горячие клавиши', 'Hotkeys')}</div>
          <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[11px]">
            {HOTKEYS.map(([k, ru, en]) => (
              <React.Fragment key={k}>
                <kbd className="hud-kbd">{k}</kbd>
                <span className="text-stone-300">{t(ru, en)}</span>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== Глобальные горячие клавиши =====
export function useGameHotkeys({ enabled, onEndTurn, onTab, onEscape }) {
  const handlersRef = useRef({ onEndTurn, onTab, onEscape });
  handlersRef.current = { onEndTurn, onTab, onEscape };
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        handlersRef.current.onEscape();
        return;
      }
      if (!enabled || e.ctrlKey || e.metaKey || e.altKey || isInteractiveTarget(e.target)) return;
      if (e.key === 'Enter') {
        e.preventDefault();
        handlersRef.current.onEndTurn();
      } else if (/^[1-8]$/.test(e.key)) {
        handlersRef.current.onTab(Number(e.key));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [enabled]);
}
