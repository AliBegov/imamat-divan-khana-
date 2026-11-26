// Стадия 2: статическая проверка игровых маршрутов. Ловит переходы на несуществующие вкладки
// (setActiveTab('tactical') при отсутствии экрана 'tactical' давал пустой экран) и неизвестные режимы боя.
const fs = require('fs');
const { readAllSources, writeStage } = require('./qa_common.cjs');

// Переходы и экраны разнесены по модулям (App.jsx + views/**), поэтому проверяем объединённый текст всех исходников
const src = readAllSources();
const lines = src.split('\n');

// Проверяемые пары «сеттер состояния → значения, которые реально отрисовываются»
const ROUTE_CHECKS = [
  { setter: 'setActiveTab', state: 'activeTab', label: 'вкладка' },
  { setter: 'setTacticalMode', state: 'tacticalMode', label: 'режим тактического боя' },
  { setter: 'setCommandDockTab', state: 'commandDockTab', label: 'вкладка командного дока' }
];

const problems = [];
const summary = {};

for (const { setter, state, label } of ROUTE_CHECKS) {
  const rendered = new Set(
    [...src.matchAll(new RegExp(`${state} === '([A-Za-z0-9_]+)'`, 'g'))].map((m) => m[1])
  );
  // Значения из массивов вкладок вида { id: 'units', ... } + setX(tab.id) тоже считаются отрисованными
  const targets = new Map();
  lines.forEach((line, idx) => {
    for (const m of line.matchAll(new RegExp(`${setter}\\('([A-Za-z0-9_]+)'\\)`, 'g'))) {
      if (!targets.has(m[1])) targets.set(m[1], []);
      targets.get(m[1]).push(idx + 1);
    }
  });
  const missing = [...targets.entries()].filter(([value]) => !rendered.has(value));
  missing.forEach(([value, at]) =>
    problems.push(`${setter}('${value}') — ${label} не существует (строки объединённого исходника ${at.slice(0, 5).join(', ')})`)
  );
  summary[state] = { rendered: rendered.size, targets: targets.size, missing: missing.length };
}

const passed = problems.length === 0;
writeStage('static_routes', { passed, summary, problems });

Object.entries(summary).forEach(([state, s]) =>
  console.log(`  ${state}: ${s.targets} переход(ов) → ${s.rendered} экран(ов), без экрана: ${s.missing}`)
);
problems.forEach((p) => console.log(`    ✗ ${p}`));
if (!passed) {
  console.error('  [FAIL] Найдены переходы в несуществующие экраны — релиз остановлен.');
  process.exit(1);
}
console.log('  [PASS] Статическая проверка маршрутов');
