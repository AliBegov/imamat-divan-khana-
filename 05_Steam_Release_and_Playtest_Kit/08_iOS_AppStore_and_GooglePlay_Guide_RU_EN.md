# Публикация «ИМАМАТ: Диван-Хана» в Apple App Store (iOS) и Google Play (Android)

Этот комплект содержит все готовые манифесты, без-альфа иконки и конфигурации **Capacitor** для выпуска WebGL2-игры как нативного приложения для **iPhone / iPad (iOS 16+)** и **Android (API 26–35)**, а также мгновенной установки **PWA («На экран Домой»)**.

---

## 1. Что уже встроено в движок игры
1. **Мультитач 3D-камера во всех 3 сценах Three.js** (`CaucasusTable3DViewport`, `GorgeCutaway3DViewport`, `ForestAmbush3DViewport`):
   - **1 палец (проведение)** — плавное орбитальное вращение над горами Кавказа, Салтами и лесом Речель (`touch-action: none` блокирует рывки страницы в Safari/Chrome).
   - **2 пальца (щипок + сдвиг)** — одновременный **Pinch-to-Zoom** и панорамирование с бесшовным переходом при отпускании пальца.
   - **Тап 1 пальцем** — 3D-рейкаст по сотням мюридов, аулам, мостам, сигнальным кострам, секторам засек и отправка конницы в марш по горным тропам + мгновенная разблокировка пространственного 3D-звука WebAudio.
2. **Авто-губернатор 60 FPS для мобильных GPU (`caucasusMobileTouchAndPerf.js`)**:
   - Автоматически определяет мобильный GPU (`pointer: coarse` / iOS / Android), ограничивает `devicePixelRatio` (`1.35x–1.5x`), переводит карту теней на `1024×1024`, отключает тяжёлый проход `GTAOPass` по умолчанию на смартфонах (с ручным переключателем `⚡ Авто / ⚡ 60 FPS / 💎 Ультра` в HUD) и следит за временем кадра каждые 90 кадров.
3. **Safe-Area UI (`viewport-fit=cover` + `env(safe-area-inset-*)`)**:
   - Адаптировано под вырез **Dynamic Island** на iPhone и жестовую полосу снизу, с горизонтальной прокруткой панелей ракурсов и палат Диван-ханы без переполнения на экранах от `390px`.

---

## 2. Мгновенная установка на телефон без магазинов (PWA)
- **iPhone / iPad (Safari)**: откройте `https://imamat-divan-khana.netlify.app` → нажмите **Поделиться** → **На экран «Домой» (Add to Home Screen)**. Игра запустится в полноэкранном режиме с чеканной золотой иконкой печати Шамиля.
- **Android (Chrome)**: откройте сайт → меню `⋮` → **Установить приложение (Install App)**.

---

## 3. Сборка для Apple App Store (iOS / iPadOS через Xcode)

Требования: Mac с установленным **Xcode 16+** и аккаунт **Apple Developer Program**.

```bash
cd "03_Веб_прототип_Диван_Хана"

# 1. Установить Capacitor iOS (один раз)
npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/status-bar @capacitor/splash-screen
npx cap add ios

# 2. Скопировать готовые манифесты App Store и иконку 1024x1024 (без альфа-канала)
cp "../05_Steam_Release_and_Playtest_Kit/Mobile_AppStore_GooglePlay_Kit/ios/App/App/Info.plist" ios/App/App/Info.plist
cp "../05_Steam_Release_and_Playtest_Kit/Mobile_AppStore_GooglePlay_Kit/ios/App/App/PrivacyInfo.xcprivacy" ios/App/App/PrivacyInfo.xcprivacy
cp "../05_Steam_Release_and_Playtest_Kit/Mobile_AppStore_GooglePlay_Kit/icons/AppIcon_1024x1024_AppStore.png" ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png

# 3. Собрать веб-бандл и открыть проект в Xcode
npm run cap:ios
```

В открывшемся **Xcode**:
1. Выберите вашу команду подписи в **Signing & Capabilities → Team** (`Bundle Identifier: com.imamat.divankhana`).
2. Выберите цель **Any iOS Device (arm64)** → меню **Product → Archive**.
3. Нажмите **Distribute App → App Store Connect → Upload** — сборка появится в **TestFlight** и **App Store Connect** (`ITSAppUsesNonExemptEncryption = false` и обязательный `PrivacyInfo.xcprivacy` уже прописаны).

---

## 4. Сборка для Google Play (Android `.aab` через Android Studio)

Требования: **Android Studio Ladybug+** (JDK 21, Android SDK 35) и аккаунт **Google Play Console**.

```bash
cd "03_Веб_прототип_Диван_Хана"

# 1. Установить Capacitor Android (один раз)
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/status-bar @capacitor/splash-screen
npx cap add android

# 2. Скопировать готовый AndroidManifest.xml (OpenGL ES 3.0 / WebGL2) и build.gradle (targetSdk 35)
cp "../05_Steam_Release_and_Playtest_Kit/Mobile_AppStore_GooglePlay_Kit/android/app/src/main/AndroidManifest.xml" android/app/src/main/AndroidManifest.xml

# 3. Собрать веб-бандл и открыть проект в Android Studio
npm run cap:android
```

В **Android Studio**:
1. Выберите **Build → Generate Signed App Bundle or APK → Android App Bundle (`.aab`)**.
2. Создайте или выберите ваш ключ подписи (`upload-keystore.jks`) и соберите `release` AAB.
3. Загрузите `app-release.aab`, иконку `icons/PlayStore_HiResIcon_512x512.png` и баннер `icons/PlayStore_FeatureGraphic_1024x500.png` в **Google Play Console**.
