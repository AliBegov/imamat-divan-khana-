# 🚀 Steam «Coming Soon» Storefront & Desktop Packaging Launch Checklist (RU / EN)
**Спринт 11 (Фаза 6) — «ИМАМАТ: ДИВАН-ХАНА (1845)» • AppID `3481840` (Pre-release)**

## 1. Десктопные сборки macOS & Windows + Steamworks SDK Bridge

| Артефакт | Путь | Назначение |
| :--- | :--- | :--- |
| **Нативный macOS `.app` (arm64 signed)** | `05_Steam_Release_and_Playtest_Kit/Imamat_DivanKhana_macOS.app` + `Imamat_DivanKhana_macOS_App.zip` | Подписанный Mach-O бандл с встроенным `window.imamatSteamBridge` и локальным Auto-Cloud хранилищем (`~/Library/Application Support/ImamatDivanKhana/SteamCloud/`). |
| **Windows Portable Desktop Bundle** | `05_Steam_Release_and_Playtest_Kit/Imamat_DivanKhana_Windows_Portable.zip` | Готовый пакет Windows (`Launch_Imamat_Windows_Desktop.bat`, `electron-main.cjs`, `electron-preload.cjs`, `steam_appid.txt`, `Workshop_Mods/`). |
| **Electron + Steamworks IPC Package** | `05_Steam_Release_and_Playtest_Kit/Steam_Desktop_Package/` | `package.json` (`electron-builder` для macOS Universal `.dmg` и Windows NSIS/Portable `.exe`), `steamworks.js` optionalDependency, `stage_steam_depots.sh`. |
| **Игровой адаптер Steamworks** | `03_Веб_прототип_Диван_Хана/src/game/steamworksBridge.js` | Автоматическая синхронизация **12 достижений**, **Steam Cloud Saves (`.imamat-save`, квота 100 МБ)**, двуязычный **Rich Presence** и **Steam Overlay (`Shift+Tab`)**. |

## 2. Манифесты Steamworks Partner (`05_Steam_Release_and_Playtest_Kit/Steamworks_Partner_Config/`)
1. `app_build_imamat_vertical_slice.vdf` — мастер-скрипт загрузки через `steamcmd`.
2. `depot_build_win64_3481841.vdf` — депо Windows 64-bit.
3. `depot_build_macos_3481842.vdf` — депо macOS Apple Silicon / Universal.
4. `steam_cloud_autocloud.vdf` — правила Steam Auto-Cloud (`*.imamat-save`, `WinAppDataRoaming`, `MacAppSupport`, `LinuxXdgDataHome`, квота `100 MB`).
5. `steam_achievements_schema.json` — все 12 исторических достижений RU/EN.
6. `steam_input_action_manifest.vdf` — профиль управления для **Steam Deck (`1280×800`)**.

## 3. Графические капсулы, скриншоты и 60-сек трейлер для публикации «Coming Soon»
Папка: `05_Steam_Release_and_Playtest_Kit/Steam_Store_Coming_Soon_Kit/`
- **7 обязательных капсул Valve (проверены по точным пикселям):**
  - `header_capsule_920x430.png` (`920×430`)
  - `small_capsule_462x174.png` (`462×174`)
  - `main_capsule_1232x706.png` (`1232×706`)
  - `vertical_capsule_748x896.png` (`748×896`)
  - `library_capsule_600x900.png` (`600×900`)
  - `library_hero_3840x1240.png` (`3840×1240`)
  - `library_logo_1280x720.png` (`1280×720` RGBA)
- **5 официальных геймплейных скриншотов `1920×1080`:** 3D-стол Кавказа, 3D-разрез осады Салты, Политика наибов и 25 орденов, Лесная засада в Ичкерии, Steam Deck `1280×800` Verified HUD.
- **60-секундный геймплейный трейлер `1920×1080` H.264 + AAC:** `05_Steam_Release_and_Playtest_Kit/Trailer_PostProduction/Imamat_DivanKhana_Steam_Trailer_60s_1080p.mp4` + субтитры RU/EN `.srt` + монтажный лист `.edl`.

## 4. Шаги публикации в Steamworks Partner (10 минут)
1. Зарегистрировать реальный AppID в Steam Direct и обновить число `3481840` в `steam_appid.txt`, `generate_steamworks_vdf.py` и `steamworksBridge.js`.
2. Загрузить тексты из `01_Steam_Store_Page_RU_EN.md` (RU + EN), 7 капсул, 5 скриншотов `1920×1080` и 60-сек трейлер `.mp4` в раздел **Store Presence**.
3. Импортировать `steam_achievements_schema.json`, `steam_cloud_autocloud.vdf` и `steam_input_action_manifest.vdf` в **Technical Tools**.
4. Выполнить `bash 05_Steam_Release_and_Playtest_Kit/Steam_Desktop_Package/stage_steam_depots.sh` и загрузить сборку через `steamcmd`.
5. Отправить страницу **«Coming Soon»** на проверку Valve (3–5 рабочих дней) и перейти к **Спринту 12 (Steam Next Fest Playable Demo → v1.0)**!
