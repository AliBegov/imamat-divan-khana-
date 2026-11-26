// Стадия 3: дымовой тест собранной игры в headless Chrome.
// Открывает автономный HTML, нажимает ключевые кнопки, все вкладки, колесо приказов и окна,
// и останавливает релиз при любой ошибке JavaScript, ошибке консоли, 404 или «белом экране».
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');
const { STANDALONE_HTML, KIT_DIR, writeStage } = require('./qa_common.cjs');

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser'
].filter(Boolean);

// Кнопки 3D-диорамы и радара, которые обязаны существовать и нажиматься без ошибок
const REQUIRED_BUTTONS = [
  'Отдалить (Небо и тучи)',
  'Приблизить (Фигурки)',
  'Приблизить (Фигурки)',
  'Инструменты и слои',
  'Сброс',
  'Залп орудий',
  'Ночная вылазка',
  'Спецэффекты',
  'Спецэффекты',
  'Стол на весь экран',
  'Обычный вид',
  'Радар угроз',
  'Осада аула',
  'Перехват главной колонны РИ',
  'Прикрыть караван селитры',
  'Залп батарей (-85 шт.)',
  'Радар угроз',
  'Инструменты и слои',
  'ЗАВЕРШИТЬ ХОД',
  'ЗАВЕРШИТЬ ХОД'
];
const TIME_OF_DAY_LABELS = ['☀️ День', '🌅 Закат', '🌙 Ночь'];
const WHEEL_PETALS = ['В поход сюда', 'Залп батарей', 'Гонец', 'Диорама боя'];
// Окна верхней панели (игровые + Студия). Каждое открывается на чистой странице.
const MODAL_BUTTONS = ['Словарь', 'Достижения', 'Звук 2.0', 'Хронограф', 'Устав', 'Музей', 'Депеши', 'Телеметрия', 'Моддинг', 'Трейлер', 'Релиз v2.0'];
const EXPECTED_TABS_PLAYER = 8;
const EXPECTED_TABS_STUDIO = 11;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const chromePath = CHROME_CANDIDATES.find((p) => fs.existsSync(p));
  if (!chromePath) {
    writeStage('runtime_smoke', { passed: false, problems: ['Не найден Chrome/Chromium (задайте CHROME_PATH)'] });
    console.error('  [FAIL] Не найден Chrome/Chromium. Установите Chrome или задайте переменную CHROME_PATH.');
    process.exit(1);
  }
  if (!fs.existsSync(STANDALONE_HTML)) {
    writeStage('runtime_smoke', { passed: false, problems: ['Нет собранного автономного HTML'] });
    console.error(`  [FAIL] Нет файла ${STANDALONE_HTML}`);
    process.exit(1);
  }

  const url = 'file://' + STANDALONE_HTML;
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--window-size=1600,1000', '--autoplay-policy=no-user-gesture-required']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1000 });

  const jsErrors = [];
  const failedRequests = [];
  const problems = [];
  const steps = [];
  let currentStep = 'загрузка';
  page.on('pageerror', (e) => jsErrors.push(`[${currentStep}] ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error') jsErrors.push(`[${currentStep}] console: ${m.text()}`);
  });
  page.on('response', (r) => {
    if (r.status() >= 400) failedRequests.push(`${r.status()} ${r.url()}`);
  });
  page.on('requestfailed', (r) => {
    if (!r.url().startsWith('data:')) failedRequests.push(`FAILED ${r.url()} (${r.failure() && r.failure().errorText})`);
  });

  const load = async () => {
    await page.goto(url, { waitUntil: 'load', timeout: 30000 });
    await sleep(1200);
    // Титульный экран (GameHUD): входим в кампанию так же, как игрок
    const entered = await tryClickVisibleButton('Продолжить кампанию');
    if (!entered) problems.push('[загрузка] Не найден титульный экран с кнопкой «Продолжить кампанию»');
    await sleep(250);
  };

  // «Белый экран»: React размонтирует всё дерево при необработанной ошибке рендера
  const assertNotBlank = async (stepName) => {
    const len = await page.evaluate(() => {
      const root = document.getElementById('root');
      return root ? root.innerText.length : 0;
    });
    if (len < 1500) problems.push(`[${stepName}] экран пустой или почти пустой (${len} симв.)`);
  };

  const tryClickVisibleButton = (label) =>
    page.evaluate((lbl) => {
      const btns = [...document.querySelectorAll('button')].filter((b) => b.offsetParent !== null);
      const b = btns.find((x) => x.textContent.replace(/\s+/g, ' ').includes(lbl));
      if (!b) return false;
      b.click();
      return true;
    }, label);

  const clickButton = async (label) => {
    if (await tryClickVisibleButton(label)) return true;
    // Если кнопка скрыта в компактном меню («Инструменты и слои», «Ещё разделы», «Архив и настройки»), раскрываем его
    for (const menuToggle of ['Инструменты и слои', 'Ещё разделы', 'Архив и настройки']) {
      if (label === menuToggle) continue;
      if (await tryClickVisibleButton(menuToggle)) {
        await sleep(120);
        if (await tryClickVisibleButton(label)) return true;
        // Закрываем обратно, если не в этом меню
        await tryClickVisibleButton(menuToggle);
        await sleep(80);
      }
    }
    return false;
  };

  const ensureMoreTabsOpen = async () => {
    const count = await page.evaluate(
      () =>
        [...document.querySelectorAll('header button')].filter(
          (b) => b.offsetParent !== null && /^\s*\d+\.\s/.test(b.textContent)
        ).length
    );
    if (count <= 4) {
      await tryClickVisibleButton('Ещё разделы');
      await sleep(150);
    }
  };

  const navTabs = async () => {
    await ensureMoreTabsOpen();
    return page.evaluate(() =>
      [...document.querySelectorAll('header button')]
        .filter((b) => b.offsetParent !== null && /^\s*\d+\.\s/.test(b.textContent))
        .map((b) => b.textContent.trim())
    );
  };

  await load();
  await assertNotBlank('загрузка');

  // 0. Игровой фронт-энд: меню паузы по Esc и возврат к столу
  currentStep = 'меню паузы (Esc)';
  await page.keyboard.press('Escape');
  await sleep(200);
  const pauseOk = await tryClickVisibleButton('Вернуться к столу');
  if (!pauseOk) problems.push('Меню паузы по Esc не открылось');
  steps.push(`${pauseOk ? 'OK ' : 'MISS'} Esc → меню паузы`);
  await sleep(200);

  // 1. Обязательные кнопки 3D-диорамы и радара угроз (в режиме «Живой 3D-Кавказ WebGL2» по умолчанию)
  const webglCanvasOk = await page.evaluate(() => {
    const c = document.querySelector('main canvas');
    if (!c) return false;
    const r = c.getBoundingClientRect();
    return r.width >= 400 && r.height >= 260;
  });
  if (!webglCanvasOk) problems.push('3D WebGL2 холст Кавказа не запущен по умолчанию');
  steps.push(`${webglCanvasOk ? 'OK ' : 'MISS'} Живой 3D-Кавказ WebGL2 по умолчанию`);

  // 1.1. Проверка оперативного свитка и модального окна 4-фазного исторического эпизода
  currentStep = '4-фазный исторический эпизод';
  const epOpenOk = await clickButton('Открыть фазу операции');
  await sleep(250);
  const epDialogVisible = await page.evaluate(() => !!document.querySelector('[role="dialog"]'));
  await page.keyboard.press('Escape');
  await sleep(200);
  if (!epOpenOk || !epDialogVisible) problems.push('Оперативный свиток 4-фазного эпизода не открылся');
  steps.push(`${epOpenOk && epDialogVisible ? 'OK ' : 'MISS'} 4-фазный исторический эпизод`);

  for (const lbl of REQUIRED_BUTTONS) {
    currentStep = `кнопка «${lbl}»`;
    const ok = await clickButton(lbl);
    if (!ok) problems.push(`Не найдена обязательная кнопка «${lbl}»`);
    await sleep(350);
    steps.push(`${ok ? 'OK ' : 'MISS'} ${lbl}`);
  }
  await assertNotBlank('кнопки диорамы');

  // Переключаемся на «Тактический План» для проверки проективной гомографии 2D-штабной карты и колеса приказов
  currentStep = 'переключение на Тактический План (2D)';
  const switchedTo2D = await clickButton('Тактический План');
  if (!switchedTo2D) problems.push('Не найдена кнопка переключения «Тактический План»');
  await sleep(300);

  // 1.5. Тест точности клика по 3D-карте (проективная гомография при 3D-наклоне и зуме), колеса мыши и отсутствия наложения боевых сводок
  currentStep = 'точность клика 3D-карты и очередь сводок';
  const measureWatchtowerProjectionError = () =>
    page.evaluate(() => {
      const svg = [...document.querySelectorAll('svg')].find((s) => s.querySelector('#towerStoneGrad'));
      const proj = window.__imamatClientToMapPoint;
      if (!svg || typeof proj !== 'function') return { maxErr: 999, checked: 0, bannerCount: 0, viewBox: '' };
      const towers = [...svg.querySelectorAll('g.cursor-pointer')]
        .map((g) => {
          const tf = g.getAttribute('transform') || '';
          const m = tf.match(/translate\(([-\d.]+),\s*([-\d.]+)\)/);
          const base = g.querySelector(':scope > ellipse');
          const poly = g.querySelector(':scope > polygon[fill="url(#towerStoneGrad)"]');
          if (!m || !base || !poly) return null;
          const r = base.getBoundingClientRect();
          return {
            x: +m[1],
            y: +m[2],
            sx: r.left + r.width / 2,
            sy: r.top + r.height / 2
          };
        })
        .filter(Boolean);
      const svgRect = svg.getBoundingClientRect();
      let maxErr = 0;
      let checked = 0;
      for (const tw of towers) {
        if (tw.sx < svgRect.left + 8 || tw.sx > svgRect.right - 8 || tw.sy < svgRect.top + 8 || tw.sy > svgRect.bottom - 8) {
          continue;
        }
        const pt = proj(svg, tw.sx, tw.sy);
        const err = Math.hypot(pt.x - tw.x, pt.y - tw.y - 6);
        if (err > maxErr) maxErr = err;
        checked++;
      }
      const bannerCount = svg.querySelectorAll('[data-combat-popup-banner]').length;
      return {
        maxErr: Math.round(maxErr * 100) / 100,
        checked,
        bannerCount,
        viewBox: svg.getAttribute('viewBox')
      };
    });

  const projAt1x = await measureWatchtowerProjectionError();
  if (projAt1x.checked < 8 || projAt1x.maxErr >= 3.5) {
    problems.push(`Ошибка проекции клика 3D-карты (×1.0): maxErr=${projAt1x.maxErr} (проверено башен: ${projAt1x.checked})`);
  }
  if (projAt1x.bannerCount > 1) {
    problems.push(`На карте одновременно отрисовано ${projAt1x.bannerCount} всплывающих боевых сводок (должно быть не более 1)`);
  }
  steps.push(
    `${projAt1x.checked >= 8 && projAt1x.maxErr < 3.5 && projAt1x.bannerCount <= 1 ? 'OK ' : 'MISS'} Точность клика 3D-карты ×1.0 (погрешность ${projAt1x.maxErr} ед., сводок: ${projAt1x.bannerCount})`
  );

  // Обычная прокрутка колесом без Ctrl не должна менять зум карты и не должна вызывать ошибок passive wheel listener
  const svgCenter = await page.evaluate(() => {
    const svg = [...document.querySelectorAll('svg')].find((s) => s.querySelector('#towerStoneGrad'));
    const r = svg.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  });
  await page.mouse.move(svgCenter.x, svgCenter.y);
  await page.mouse.wheel({ deltaY: -180 });
  await sleep(150);
  const vbAfterPlainWheel = await page.evaluate(() => {
    const svg = [...document.querySelectorAll('svg')].find((s) => s.querySelector('#towerStoneGrad'));
    return svg ? svg.getAttribute('viewBox') : '';
  });
  if (vbAfterPlainWheel !== '0 0 700 460') {
    problems.push(`Обычное колесо мыши без Ctrl изменило viewBox: ${vbAfterPlainWheel}`);
  }

  // Зум Ctrl + колесо и перетаскивание карты мышью (drag-to-pan) + повторная проверка точности клика
  await page.keyboard.down('Control');
  await page.mouse.wheel({ deltaY: -45 });
  await page.keyboard.up('Control');
  await sleep(200);
  await page.mouse.move(svgCenter.x, svgCenter.y);
  await page.mouse.down();
  await page.mouse.move(svgCenter.x - 80, svgCenter.y - 40, { steps: 6 });
  await page.mouse.up();
  await sleep(200);
  const projZoomed = await measureWatchtowerProjectionError();
  if (projZoomed.viewBox === '0 0 700 460' || projZoomed.checked < 3 || projZoomed.maxErr >= 3.5) {
    problems.push(
      `Ошибка проекции клика после Ctrl+колесо и панорамирования: viewBox="${projZoomed.viewBox}", maxErr=${projZoomed.maxErr}`
    );
  }
  steps.push(
    `${projZoomed.viewBox !== '0 0 700 460' && projZoomed.maxErr < 3.5 ? 'OK ' : 'MISS'} Зум Ctrl+колесо + панорама + точность клика (погрешность ${projZoomed.maxErr} ед.)`
  );
  await clickButton('Сброс');
  await sleep(250);

  // 2. Смена времени суток: три нажатия должны пройти полный цикл
  currentStep = 'время суток';
  let todClicks = 0;
  for (let i = 0; i < 3; i++) {
    for (const lbl of TIME_OF_DAY_LABELS) {
      if (await clickButton(lbl)) {
        todClicks++;
        break;
      }
    }
    await sleep(300);
  }
  if (todClicks < 3) problems.push(`Кнопка времени суток сработала ${todClicks}/3 раз`);
  steps.push(`${todClicks === 3 ? 'OK ' : 'MISS'} Время суток (3 нажатия)`);

  // 3. Колесо приказов: клик по башне наибства, затем по каждому лепестку
  for (const petal of WHEEL_PETALS) {
    currentStep = `колесо → ${petal}`;
    await page.evaluate(() => {
      const t = [...document.querySelectorAll('button')].find((b) => /^\s*1\.\s/.test(b.textContent));
      if (t) t.click();
    });
    await sleep(300);
    const opened = await page.evaluate(() => {
      const towers = [...document.querySelectorAll('svg g.cursor-pointer')].filter((g) =>
        g.querySelector(':scope > polygon[fill="url(#towerStoneGrad)"]')
      );
      const tw = towers[1] || towers[0];
      if (!tw) return false;
      tw.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      return true;
    });
    await sleep(300);
    const clicked = await page.evaluate((p) => {
      const g = [...document.querySelectorAll('svg g.cursor-pointer')].find(
        (x) => x.querySelector(':scope > rect[rx="6"]') && x.querySelector(':scope > text') && x.querySelector(':scope > text').textContent.includes(p)
      );
      if (!g) return false;
      g.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      return true;
    }, petal);
    await sleep(450);
    if (!opened || !clicked) problems.push(`Колесо приказов: лепесток «${petal}» не найден`);
    steps.push(`${opened && clicked ? 'OK ' : 'MISS'} Колесо → ${petal}`);
    await assertNotBlank(`колесо → ${petal}`);
  }

  // Возвращаем режим «Настоящее 3D (WebGL)» на стратегическом столе
  currentStep = 'возврат в Настоящее 3D (WebGL)';
  await page.evaluate(() => {
    const t = [...document.querySelectorAll('button')].find((b) => /^\s*1\.\s/.test(b.textContent));
    if (t) t.click();
  });
  await sleep(250);
  const backTo3DOk = await clickButton('Настоящее 3D (WebGL)');
  await sleep(350);
  if (!backTo3DOk) problems.push('Не удалось вернуться в режим «Настоящее 3D (WebGL)»');
  steps.push(`${backTo3DOk ? 'OK ' : 'MISS'} Возврат в Настоящее 3D (WebGL)`);

  // 4. Вкладки: в режиме игрока 8, в режиме Студии 11; каждая должна отрисоваться
  currentStep = 'вкладки (игрок)';
  const playerTabs = await navTabs();
  if (playerTabs.length !== EXPECTED_TABS_PLAYER)
    problems.push(`Вкладок у игрока: ${playerTabs.length}, ожидалось ${EXPECTED_TABS_PLAYER}`);

  // 4.1 Проверка внутриигровых переходов в режиме игрока (3D-ущелье из Поля Боя, Галерея личностей и Эпилог из Суда/Сценариев)
  currentStep = 'игровой переход Поле Боя ↔ 3D-Ущелье';
  await clickButton('4. Поле Боя');
  await sleep(300);
  const ok3D = await clickButton('3D-Ущелье и Наводка Орудий');
  await sleep(350);
  await assertNotBlank('3D-Ущелье (игрок)');
  const okBackSiege = await clickButton('К Полю Боя');
  await sleep(300);
  if (!ok3D || !okBackSiege) problems.push('Переход Поле Боя ↔ 3D-Ущелье не сработал');
  steps.push(`${ok3D && okBackSiege ? 'OK ' : 'MISS'} Поле Боя ↔ 3D-Ущелье`);

  currentStep = 'игровой переход Сценарии ↔ Личности и Эпилог';
  await clickButton('8. Суд, Казна и Сценарии');
  await sleep(300);
  const okFigs = await clickButton('Открыть Галерею Личностей');
  await sleep(350);
  await assertNotBlank('Галерея Личностей (игрок)');
  const okBackVerdict1 = await clickButton('К Сценариям и Суду');
  await sleep(300);
  const okEpilogue = await clickButton('Открыть Исторический Эпилог');
  await sleep(350);
  await assertNotBlank('Исторический Эпилог (игрок)');
  const okBackVerdict2 = await clickButton('К Сценариям и Суду');
  await sleep(300);
  if (!okFigs || !okBackVerdict1 || !okEpilogue || !okBackVerdict2)
    problems.push('Переход Сценарии ↔ Личности/Эпилог не сработал');
  steps.push(`${okFigs && okBackVerdict1 && okEpilogue && okBackVerdict2 ? 'OK ' : 'MISS'} Сценарии ↔ Личности и Эпилог`);

  if (!(await clickButton('Студия'))) problems.push('Не найдена кнопка «Студия»');
  await sleep(300);
  const studioTabs = await navTabs();
  if (studioTabs.length !== EXPECTED_TABS_STUDIO)
    problems.push(`Вкладок в Студии: ${studioTabs.length}, ожидалось ${EXPECTED_TABS_STUDIO}`);
  for (let i = 0; i < studioTabs.length; i++) {
    currentStep = `вкладка «${studioTabs[i]}»`;
    await page.evaluate((idx) => {
      const nav = [...document.querySelectorAll('header button')].filter(
        (b) => b.offsetParent !== null && /^\s*\d+\.\s/.test(b.textContent)
      );
      if (nav[idx]) nav[idx].click();
    }, i);
    await sleep(450);
    await assertNotBlank(currentStep);
  }
  steps.push(`OK  Вкладки: игрок ${playerTabs.length}, Студия ${studioTabs.length}`);

  // 5. Окна верхней панели — каждое на свежей странице
  for (const lbl of MODAL_BUTTONS) {
    currentStep = `окно «${lbl}»`;
    await load();
    await clickButton('Студия');
    await sleep(250);
    const ok = await clickButton(lbl);
    await sleep(600);
    const overlay = await page.evaluate(() => !!document.querySelector('.fixed.inset-0'));
    if (!ok) problems.push(`Не найдена кнопка окна «${lbl}»`);
    else if (!overlay) problems.push(`Окно «${lbl}» не открылось`);
    steps.push(`${ok && overlay ? 'OK ' : 'MISS'} Окно «${lbl}»`);
  }

  // 6. Итоговый снимок экрана для отчёта
  currentStep = 'финальный снимок';
  await load();
  const screenshotPath = path.join(KIT_DIR, 'QA_Web_Gate_Screenshot.png');
  await page.screenshot({ path: screenshotPath });
  await browser.close();

  const uniqueFailed = [...new Set(failedRequests)];
  uniqueFailed.forEach((r) => problems.push(`Ресурс не загрузился: ${r}`));
  jsErrors.forEach((e) => problems.push(`Ошибка JS: ${e}`));

  const passed = problems.length === 0;
  writeStage('runtime_smoke', {
    passed,
    browser: path.basename(chromePath),
    steps,
    js_errors: jsErrors.length,
    failed_requests: uniqueFailed.length,
    tabs_player: playerTabs.length,
    tabs_studio: studioTabs.length,
    problems: problems.slice(0, 60),
    screenshot: path.basename(screenshotPath)
  });

  steps.forEach((s) => console.log(`    ${s}`));
  console.log(`  Ошибок JS: ${jsErrors.length}, незагруженных ресурсов: ${uniqueFailed.length}, проблем всего: ${problems.length}`);
  problems.slice(0, 30).forEach((p) => console.log(`    ✗ ${p}`));
  if (!passed) {
    console.error('  [FAIL] Браузерный тест нашёл проблемы — релиз остановлен.');
    process.exit(1);
  }
  console.log('  [PASS] Браузерный дымовой тест');
})().catch((e) => {
  writeStage('runtime_smoke', { passed: false, problems: [`Тест упал: ${e.message}`] });
  console.error('  [FAIL] Браузерный тест упал:', e.message);
  process.exit(1);
});
