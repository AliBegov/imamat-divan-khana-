// ============================================================================
// ДВИЖОК КОНТРОЛЯ ЛОКАЛИЗАЦИИ (RU/EN) И МАТРИЦЫ РАЗРЕШЕНИЙ (Спринт 10 / Gate 5)
// Автоматический аудит утечек кириллицы в EN, полнота словарей и проверка Steam Deck -> 4K.
// ============================================================================

export const TARGET_RESOLUTION_MATRIX = [
  { id: 'steam_deck', label: 'Steam Deck (1280×800)', width: 1280, height: 800, dpr: 1, maxHeaderHeight: 92, minCanvasWidth: 720 },
  { id: 'laptop_1440', label: 'Laptop HD+ (1440×900)', width: 1440, height: 900, dpr: 2, maxHeaderHeight: 84, minCanvasWidth: 820 },
  { id: 'macbook_1540', label: 'MacBook Retina (1540×940)', width: 1540, height: 940, dpr: 2, maxHeaderHeight: 84, minCanvasWidth: 880 },
  { id: 'full_hd', label: 'Full HD (1920×1080)', width: 1920, height: 1080, dpr: 1, maxHeaderHeight: 84, minCanvasWidth: 960 },
  { id: 'uhd_4k', label: '4K UHD / Retina (3840×2160)', width: 3840, height: 2160, dpr: 1, maxHeaderHeight: 84, minCanvasWidth: 1040 }
];

const ALLOWED_CYRILLIC_LANGUAGE_TOGGLES = ['Русский', 'Язык:', 'Язык'];

export function detectCyrillicLeaksInEnglishText(text = '') {
  const lines = String(text || '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const leaks = [];
  for (const line of lines) {
    if (ALLOWED_CYRILLIC_LANGUAGE_TOGGLES.some((okTok) => line.includes(okTok))) continue;
    if (/[А-Яа-яЁё]{2,}/.test(line)) {
      leaks.push(line);
    }
  }
  return {
    ok: leaks.length === 0,
    leakCount: leaks.length,
    leakedLines: [...new Set(leaks)]
  };
}

export function auditBilingualDataCatalog(items = [], fieldPairs = [['name', 'nameEn']]) {
  const missing = [];
  const cyrillicInEn = [];

  (items || []).forEach((item, idx) => {
    const id = item?.id || `#${idx}`;
    fieldPairs.forEach(([ruKey, enKey]) => {
      const ruVal = item?.[ruKey];
      const enVal = item?.[enKey];
      if (ruVal && (!enVal || !String(enVal).trim())) {
        missing.push(`${id}.${enKey}`);
      } else if (enVal && /[А-Яа-яЁё]{2,}/.test(String(enVal))) {
        cyrillicInEn.push(`${id}.${enKey}`);
      }
    });
  });

  return {
    checkedCount: (items || []).length,
    missing,
    cyrillicInEn,
    ok: missing.length === 0 && cyrillicInEn.length === 0
  };
}

export function evaluateResolutionMatrixGate5(measuredPresets = []) {
  const failures = [];
  (measuredPresets || []).forEach((m) => {
    const spec = TARGET_RESOLUTION_MATRIX.find((s) => s.id === m.id || s.width === m.innerWidth);
    if ((m.overflowX || 0) > 0) {
      failures.push(`${m.preset || m.id}: horizontal overflow ${m.overflowX}px`);
    }
    if (spec && m.headerHeight > spec.maxHeaderHeight) {
      failures.push(`${m.preset || m.id}: headerHeight ${m.headerHeight}px > ${spec.maxHeaderHeight}px`);
    }
    if (spec && m.canvasWidth > 0 && m.canvasWidth < spec.minCanvasWidth) {
      failures.push(`${m.preset || m.id}: canvasWidth ${m.canvasWidth}px < ${spec.minCanvasWidth}px`);
    }
  });
  return {
    checkedPresets: (measuredPresets || []).length,
    failures,
    pass: (measuredPresets || []).length >= 4 && failures.length === 0
  };
}

export function localizeLogEntry(entry, t = (ru) => ru) {
  if (!entry) return '';
  if (typeof entry === 'string') return entry;
  return t(entry.ru || '', entry.en || entry.ru || '');
}
