# 🦅 «ИМАМАТ: ДИВАН-ХАНА (1845)» — Протокол «слепого» плейтеста (Волны 1–2)
**Blind Playtest Protocol & Tester Invite Kit (Waves 1–2 • Build `0.9.0-Playtest-Wave1-2`)**

- **Живая ссылка без установки (Chrome / Safari / Edge / Firefox):** https://alibegov.github.io/imamat-divan-khana-/
- **Приём багов и отзывов (встроено прямо в игру):** кнопка **`💬 Отзыв / Баг`** в правом верхнем углу экрана (автоматически прикрепляет сценарий, ход, ресурсы, прогресс воронки первых 5 ходов и ошибки JS).
- **Цель Фазы 5 / Quality Gate 5:** `> 70%` новых игроков самостоятельно проходят первые 5 ходов без подсказок разработчика; средняя сессия `> 25 мин`; `0` критических блокеров.

---

## 1. Текст приглашения для тестеров (Волна 1: 5–10 игроков → Волна 2: 20–30 игроков)

> Привет! Приглашаю на «слепой» плейтест исторической 3D-стратегии **«Имамат: Диван-Хана (1845)»** (в духе *Crusader Kings III / Total War*).
>
> - **Играть прямо в браузере (ничего скачивать не нужно):** https://alibegov.github.io/imamat-divan-khana-/
> - **Как тестировать:** запустите игру и попробуйте сыграть **5+ ходов** (15–30 минут) без сторонних подсказок — выберите любой из 3 флагманских сценариев (**1845 Дарго**, **1847–1849 Война осад** или **1839 Ахульго**).
> - **Как отправить отзыв за 20 секунд:** нажмите кнопку **`💬 Отзыв / Баг`** вверху экрана. Можно в 1 клик отправить готовый репорт в **GitHub Issues**, **скопировать для Telegram/Discord** или **скачать `.json` пакет**.
> - **Что нам важнее всего узнать:**
>   1. Что показалось непонятным в первые **5 минут**?
>   2. На каком ходе возник первый «вау-момент» или наоборот — потеря интереса?
>   3. Как ощущается баланс (порох, осады, политика наибов, 25 орденов, 32 дилеммы с отголосками) и адаптивный звук?

---

## 2. Метрики разбора после Волны 1 (5–10 игроков) и Волны 2 (20–30 игроков)

| Метрика Gate 5 | Целевой порог | Как собирается автоматически |
| :--- | :---: | :--- |
| Прохождение первых 5 ходов без помощи | **> 70%** | `context.reachedTurn5` + `context.funnelCompleted` (`X/5`) |
| Понятность первых 5 минут | **≥ 4.0 / 5.0** | `ratings.first5MinClarity` |
| Увлекательность и атмосфера | **≥ 4.2 / 5.0** | `ratings.funAndImmersion` |
| Средняя длительность сессии | **> 25 мин** | `context.sessionDurationMin` |
| Критические баги (`blocker`) / ошибки JS | **0** | `severity === 'blocker'` + `context.runtimeErrorsCount` |

---

## 3. English Tester Invite (for International Strategy Communities)

> Join the blind browser playtest of **IMAMAT: DIVAN-KHANA (1845)** — a 3D historical grand strategy & tactical mountain warfare game (*CK3 / Total War* inspired, WebGL2 + Blender 3D assets, RU/EN switchable on Title Screen).
>
> - **Play instantly (no install):** https://alibegov.github.io/imamat-divan-khana-/
> - Switch to **English** on the Title Screen, pick **1845 Dargo**, **1847–1849 War of Sieges**, or **1839 Akhulgo**, and play **5+ turns** blind.
> - Click **`💬 Feedback`** in the top bar anytime to submit a pre-filled **GitHub Issue**, **copy Markdown for Discord**, or download a **`.json` playtest telemetry packet**.
