// Общие утилиты релизного шлюза: пути к исходникам, хэш всех модулей игры и запись единого отчёта QA.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT_DIR = path.resolve(__dirname, '..', '..', '..');
const WEB_DIR = path.join(ROOT_DIR, '03_Веб_прототип_Диван_Хана');
// QA_SRC_DIR позволяет прогнать шлюз на копии исходников (для самопроверки шлюза на заведомо сломанном коде)
const SRC_DIR = process.env.QA_SRC_DIR || path.join(WEB_DIR, 'src');
const APP_JSX = path.join(SRC_DIR, 'App.jsx');
const KIT_DIR = path.join(ROOT_DIR, '05_Steam_Release_and_Playtest_Kit');
const STANDALONE_HTML = path.join(KIT_DIR, 'Imamat_DivanKhana_Standalone_Playtest.html');
const REPORT_PATH = process.env.QA_REPORT_PATH || path.join(KIT_DIR, 'QA_Web_Gate_Report.json');

// Все исходные модули игры (App.jsx, data/, game/, views/), отсортированные для стабильного хэша
const listSourceFiles = (dir = SRC_DIR) => {
  const out = [];
  const walk = (d) => {
    for (const entry of fs.readdirSync(d, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))) {
      const p = path.join(d, entry.name);
      if (entry.isDirectory()) walk(p);
      else if (/\.(jsx?|mjs)$/.test(entry.name)) out.push(p);
    }
  };
  walk(dir);
  return out;
};

const readAllSources = () => listSourceFiles().map((f) => fs.readFileSync(f, 'utf8')).join('\n');

// Хэш = sha256 по (относительный путь + содержимое) всех модулей; тот же алгоритм в verify_vertical_slice_integrity.py
const sourcesSha256 = () => {
  const h = crypto.createHash('sha256');
  for (const f of listSourceFiles()) {
    h.update(path.relative(SRC_DIR, f).split(path.sep).join('/'));
    h.update('\0');
    h.update(fs.readFileSync(f));
    h.update('\0');
  }
  return h.digest('hex');
};

// Каждая стадия дописывает свой раздел; отчёт сбрасывается, если исходники изменились с прошлого запуска
const writeStage = (stageName, stageResult) => {
  const sha = sourcesSha256();
  let report = {};
  if (fs.existsSync(REPORT_PATH)) {
    try {
      report = JSON.parse(fs.readFileSync(REPORT_PATH, 'utf8'));
    } catch {
      report = {};
    }
  }
  if (report.sources_sha256 !== sha) report = { sources_sha256: sha, stages: {} };
  report.source_files = listSourceFiles().length;
  report.stages = report.stages || {};
  report.stages[stageName] = { ...stageResult, finished_at: new Date().toISOString() };
  const required = ['lint', 'static_routes', 'runtime_smoke'];
  report.passed = required.every((s) => report.stages[s] && report.stages[s].passed === true);
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), 'utf8');
  return report;
};

module.exports = {
  ROOT_DIR,
  WEB_DIR,
  SRC_DIR,
  APP_JSX,
  KIT_DIR,
  STANDALONE_HTML,
  REPORT_PATH,
  listSourceFiles,
  readAllSources,
  sourcesSha256,
  writeStage
};
