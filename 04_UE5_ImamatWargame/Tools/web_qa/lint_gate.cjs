// Стадия 1: ESLint по всем модулям веб-прототипа (App.jsx, data/, game/, views/).
// Любая ошибка (no-undef — например, значение, не переданное во вкладку через props) останавливает релиз.
const path = require('path');
const { ESLint } = require('eslint');
const { SRC_DIR, listSourceFiles, writeStage } = require('./qa_common.cjs');

(async () => {
  // cwd = папка исходников: иначе flat-config ESLint считает файлы вне cwd игнорируемыми
  const eslint = new ESLint({
    cwd: SRC_DIR,
    overrideConfigFile: path.join(__dirname, 'eslint.config.mjs')
  });
  const files = listSourceFiles();
  const results = await eslint.lintFiles(files);
  let errors = 0;
  let warnings = 0;
  const errorList = [];
  for (const r of results) {
    errors += r.errorCount;
    warnings += r.warningCount;
    for (const m of r.messages) {
      if (m.severity === 2) {
        errorList.push(`${path.relative(SRC_DIR, r.filePath)}:${m.line}:${m.column} ${m.message} (${m.ruleId})`);
      }
    }
  }
  const passed = errors === 0;
  writeStage('lint', { passed, files: results.length, errors, warnings, error_list: errorList.slice(0, 50) });

  console.log(`  ESLint: ${results.length} файл(ов), ошибок: ${errors}, предупреждений: ${warnings}`);
  errorList.slice(0, 30).forEach((e) => console.log(`    ✗ ${e}`));
  if (!passed) {
    console.error('  [FAIL] ESLint нашёл ошибки — релиз остановлен.');
    process.exit(1);
  }
  console.log('  [PASS] ESLint');
})().catch((e) => {
  console.error('  [FAIL] ESLint не запустился:', e.message);
  process.exit(1);
});
