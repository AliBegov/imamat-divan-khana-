#!/usr/bin/env bash
# ==============================================================================
# IMAMAT: DIVAN-KHANA — Web QA Gate (ESLint + статические маршруты + браузерный тест)
# Использование:
#   run_web_qa_gate.sh static    — ESLint и проверка маршрутов (до сборки)
#   run_web_qa_gate.sh runtime   — дымовой тест собранного автономного HTML в headless Chrome
#   run_web_qa_gate.sh all       — обе стадии
# Любая ошибка возвращает ненулевой код и останавливает релизный конвейер.
# ==============================================================================
set -euo pipefail

QA_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MODE="${1:-all}"

# Зависимости шлюза ставятся один раз в отдельную папку и не попадают в сборку игры
if [ ! -d "$QA_DIR/node_modules/eslint" ] || [ ! -d "$QA_DIR/node_modules/puppeteer-core" ]; then
  echo "  -> Установка зависимостей QA-шлюза (однократно)..."
  npm --prefix "$QA_DIR" install --no-audit --no-fund --silent
fi

if [ "$MODE" = "static" ] || [ "$MODE" = "all" ]; then
  node "$QA_DIR/lint_gate.cjs"
  node "$QA_DIR/static_route_check.cjs"
  npm --prefix "$QA_DIR/../../../03_Веб_прототип_Диван_Хана" test
fi

if [ "$MODE" = "runtime" ] || [ "$MODE" = "all" ]; then
  node "$QA_DIR/runtime_smoke_test.cjs"
fi
