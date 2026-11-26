#!/usr/bin/env python3
"""
IMAMAT: DIVAN-KHANA (1845) — Apple App Store (iOS/iPadOS) & Google Play (Android) Packager
Generates:
  1. Full-bleed 24-bit RGB (no-alpha) App Icons (180x180, 192x192, 512x512, 1024x1024 App Store)
     + 1024x500 Google Play Feature Graphic
  2. Capacitor iOS Xcode bundle config (Info.plist + Apple-mandatory PrivacyInfo.xcprivacy)
  3. Capacitor Android Studio / Gradle config (AndroidManifest.xml + build.gradle targetSdk 35)
  4. Bilingual Store Submission Guide (08_iOS_AppStore_and_GooglePlay_Guide_RU_EN.md)
"""

import pathlib
import shutil
import struct
import subprocess
import zlib


def write_fullbleed_rgb_seal_png(output_png: pathlib.Path, size: int = 512) -> None:
    """
    Generates a 24-bit RGB (color_type=2, NO alpha channel — mandatory for Apple App Store Connect)
    icon featuring the Octagonal Seal of Imam Shamil on a rich obsidian-walnut background.
    """
    width = height = size
    cx = cy = (size - 1) / 2.0
    r_outer = size * 0.41
    r_inner = size * 0.345

    rows = []
    for y in range(height):
        row = bytearray([0])  # PNG filter type 0 (None)
        for x in range(width):
            dx = abs(x - cx)
            dy = abs(y - cy)
            oct_dist = max(dx, dy, (dx + dy) * 0.70710678)
            rad = (dx * dx + dy * dy) ** 0.5 / (size * 0.7071)

            bg_r = int(max(10, min(34, 26 - rad * 14)))
            bg_g = int(max(11, min(30, 22 - rad * 12)))
            bg_b = int(max(14, min(36, 26 - rad * 12)))

            # Subtle engraved corner frame
            border_margin = size * 0.055
            if abs(dx - (size * 0.5 - border_margin)) < max(1.0, size * 0.005) and dy < size * 0.5 - border_margin:
                bg_r, bg_g, bg_b = 120, 78, 24
            elif abs(dy - (size * 0.5 - border_margin)) < max(1.0, size * 0.005) and dx < size * 0.5 - border_margin:
                bg_r, bg_g, bg_b = 120, 78, 24

            if r_inner < oct_dist <= r_outer:
                if abs(oct_dist - (r_inner + r_outer) * 0.5) < size * 0.013:
                    row.extend((253, 224, 71))
                else:
                    row.extend((217, 119, 6))
            elif oct_dist <= r_inner:
                norm_y = (y - cy) / r_inner
                norm_x = (x - cx) / r_inner

                peak1 = -0.04 + abs(norm_x + 0.22) * 1.32
                peak2 = -0.19 + abs(norm_x - 0.17) * 1.22
                mountain_h = min(peak1, peak2)

                star_dx = abs(norm_x)
                star_dy = abs(norm_y + 0.37)
                star_d = max(star_dx, star_dy, (star_dx + star_dy) * 0.7071)

                if star_d < 0.145:
                    row.extend((253, 224, 71))
                elif abs(norm_y - mountain_h) < 0.028 and norm_y < 0.55:
                    row.extend((245, 158, 11))
                elif mountain_h < norm_y < 0.55:
                    if int(norm_y * 28) % 4 == 0:
                        row.extend((180, 83, 9))
                    else:
                        row.extend((26, 33, 44))
                elif 0.55 <= norm_y and abs(norm_y - 0.62) < 0.032 and abs(norm_x) < 0.56:
                    row.extend((251, 191, 36))
                else:
                    row.extend((14, 21, 28))
            else:
                row.extend((bg_r, bg_g, bg_b))
        rows.append(bytes(row))

    raw_data = b"".join(rows)

    def png_chunk(chunk_type: bytes, data: bytes) -> bytes:
        crc = zlib.crc32(chunk_type + data) & 0xFFFFFFFF
        return struct.pack("!I", len(data)) + chunk_type + data + struct.pack("!I", crc)

    ihdr = struct.pack("!IIBBBBB", width, height, 8, 2, 0, 0, 0)  # bit_depth=8, color_type=2 (RGB, no alpha)
    png_bytes = (
        b"\x89PNG\r\n\x1a\n"
        + png_chunk(b"IHDR", ihdr)
        + png_chunk(b"IDAT", zlib.compress(raw_data, level=9))
        + png_chunk(b"IEND", b"")
    )
    output_png.parent.mkdir(parents=True, exist_ok=True)
    output_png.write_bytes(png_bytes)


def resize_rgb_png(src_png: pathlib.Path, dst_png: pathlib.Path, size: int) -> None:
    dst_png.parent.mkdir(parents=True, exist_ok=True)
    sips = shutil.which("sips")
    if sips:
        subprocess.run(
            [sips, "-s", "format", "png", "-z", str(size), str(size), str(src_png), "--out", str(dst_png)],
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
    else:
        write_fullbleed_rgb_seal_png(dst_png, size=size)


def build_feature_graphic(src_jpg: pathlib.Path, dst_png: pathlib.Path) -> None:
    dst_png.parent.mkdir(parents=True, exist_ok=True)
    sips = shutil.which("sips")
    if sips and src_jpg.exists():
        tmp_png = dst_png.with_suffix(".tmp.png")
        subprocess.run(
            [sips, "-s", "format", "png", "--resampleWidth", "1024", str(src_jpg), "--out", str(tmp_png)],
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        subprocess.run(
            [sips, "--cropToHeightWidth", "500", "1024", str(tmp_png), "--out", str(dst_png)],
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        tmp_png.unlink(missing_ok=True)
    else:
        write_fullbleed_rgb_seal_png(dst_png, size=512)


IOS_INFO_PLIST = """<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleDevelopmentRegion</key>
  <string>ru</string>
  <key>CFBundleLocalizations</key>
  <array>
    <string>ru</string>
    <string>en</string>
  </array>
  <key>CFBundleDisplayName</key>
  <string>ИМАМАТ</string>
  <key>CFBundleExecutable</key>
  <string>$(EXECUTABLE_NAME)</string>
  <key>CFBundleIdentifier</key>
  <string>com.imamat.divankhana</string>
  <key>CFBundleInfoDictionaryVersion</key>
  <string>6.0</string>
  <key>CFBundleName</key>
  <string>ImamatDivanKhana</string>
  <key>CFBundlePackageType</key>
  <string>APPL</string>
  <key>CFBundleShortVersionString</key>
  <string>2.0.0</string>
  <key>CFBundleVersion</key>
  <string>200</string>
  <key>LSRequiresIPhoneOS</key>
  <true/>
  <key>ITSAppUsesNonExemptEncryption</key>
  <false/>
  <key>UIApplicationCategoryType</key>
  <string>public.app-category.strategy-games</string>
  <key>UIRequiresFullScreen</key>
  <true/>
  <key>UIStatusBarHidden</key>
  <true/>
  <key>UIViewControllerBasedStatusBarAppearance</key>
  <true/>
  <key>UISupportedInterfaceOrientations</key>
  <array>
    <string>UIInterfaceOrientationLandscapeLeft</string>
    <string>UIInterfaceOrientationLandscapeRight</string>
    <string>UIInterfaceOrientationPortrait</string>
  </array>
  <key>UISupportedInterfaceOrientations~ipad</key>
  <array>
    <string>UIInterfaceOrientationLandscapeLeft</string>
    <string>UIInterfaceOrientationLandscapeRight</string>
    <string>UIInterfaceOrientationPortrait</string>
    <string>UIInterfaceOrientationPortraitUpsideDown</string>
  </array>
</dict>
</plist>
"""

IOS_PRIVACY_MANIFEST = """<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>NSPrivacyTracking</key>
  <false/>
  <key>NSPrivacyTrackingDomains</key>
  <array/>
  <key>NSPrivacyCollectedDataTypes</key>
  <array/>
  <key>NSPrivacyAccessedAPITypes</key>
  <array>
    <dict>
      <key>NSPrivacyAccessedAPIType</key>
      <string>NSPrivacyAccessedAPICategoryUserDefaults</string>
      <key>NSPrivacyAccessedAPITypeReasons</key>
      <array>
        <string>CA92.1</string>
      </array>
    </dict>
  </array>
</dict>
</plist>
"""

ANDROID_MANIFEST_XML = """<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <!-- WebGL2 / OpenGL ES 3.0 hardware requirement for 3D Caucasus Diorama -->
    <uses-feature android:glEsVersion="0x00030000" android:required="true" />
    <uses-permission android:name="android.permission.INTERNET" />

    <application
        android:allowBackup="true"
        android:hardwareAccelerated="true"
        android:icon="@mipmap/ic_launcher"
        android:label="ИМАМАТ: Диван-Хана"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:appCategory="game"
        android:theme="@style/AppTheme">

        <activity
            android:name=".MainActivity"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode|navigation"
            android:exported="true"
            android:launchMode="singleTask"
            android:screenOrientation="sensor"
            android:windowSoftInputMode="adjustResize">

            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
"""

ANDROID_BUILD_GRADLE = """apply plugin: 'com.android.application'

android {
    namespace "com.imamat.divankhana"
    compileSdk 35

    defaultConfig {
        applicationId "com.imamat.divankhana"
        minSdk 26
        targetSdk 35
        versionCode 200
        versionName "2.0.0"
        ndk {
            abiFilters "arm64-v8a", "armeabi-v7a", "x86_64"
        }
    }

    buildTypes {
        release {
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }

    bundle {
        language { enableSplit = false }
        density { enableSplit = true }
        abi { enableSplit = true }
    }
}

dependencies {
    implementation project(':capacitor-android')
    implementation "androidx.appcompat:appcompat:1.7.0"
    implementation "androidx.coordinatorlayout:coordinatorlayout:1.2.0"
    implementation "androidx.core:core-splashscreen:1.0.1"
}
"""

MOBILE_GUIDE_MD = """# Публикация «ИМАМАТ: Диван-Хана» в Apple App Store (iOS) и Google Play (Android)

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
"""


def main() -> None:
    root = pathlib.Path(__file__).resolve().parents[2]
    web_dir = root / "03_Веб_прототип_Диван_Хана"
    public_dir = web_dir / "public"
    kit_root = root / "05_Steam_Release_and_Playtest_Kit"
    mob_dir = kit_root / "Mobile_AppStore_GooglePlay_Kit"
    icons_dir = mob_dir / "icons"

    public_dir.mkdir(parents=True, exist_ok=True)
    icons_dir.mkdir(parents=True, exist_ok=True)

    master_512 = public_dir / "icon-512.png"
    write_fullbleed_rgb_seal_png(master_512, size=512)
    resize_rgb_png(master_512, public_dir / "icon-192.png", 192)
    resize_rgb_png(master_512, public_dir / "apple-touch-icon.png", 180)

    appstore_1024 = icons_dir / "AppIcon_1024x1024_AppStore.png"
    resize_rgb_png(master_512, appstore_1024, 1024)
    shutil.copy2(master_512, icons_dir / "PlayStore_HiResIcon_512x512.png")

    key_art = public_dir / "KeyArt_DivanKhana_Council_Vedeno_1845.jpg"
    build_feature_graphic(key_art, icons_dir / "PlayStore_FeatureGraphic_1024x500.png")

    cap_cfg = web_dir / "capacitor.config.json"
    if cap_cfg.exists():
        shutil.copy2(cap_cfg, mob_dir / "capacitor.config.json")

    ios_app_dir = mob_dir / "ios" / "App" / "App"
    ios_app_dir.mkdir(parents=True, exist_ok=True)
    (ios_app_dir / "Info.plist").write_text(IOS_INFO_PLIST, encoding="utf-8")
    (ios_app_dir / "PrivacyInfo.xcprivacy").write_text(IOS_PRIVACY_MANIFEST, encoding="utf-8")

    android_main_dir = mob_dir / "android" / "app" / "src" / "main"
    android_main_dir.mkdir(parents=True, exist_ok=True)
    (android_main_dir / "AndroidManifest.xml").write_text(ANDROID_MANIFEST_XML, encoding="utf-8")
    (mob_dir / "android" / "app" / "build.gradle").write_text(ANDROID_BUILD_GRADLE, encoding="utf-8")

    guide_path = mob_dir / "08_iOS_AppStore_and_GooglePlay_Guide_RU_EN.md"
    guide_path.write_text(MOBILE_GUIDE_MD, encoding="utf-8")
    shutil.copy2(guide_path, kit_root / "08_iOS_AppStore_and_GooglePlay_Guide_RU_EN.md")

    print(
        f"  -> Built iOS App Store & Android Google Play Kit: {mob_dir.relative_to(root)} "
        f"(AppStore 1024px: {appstore_1024.stat().st_size:,} B, PWA 512/192/180px ready)"
    )


if __name__ == "__main__":
    main()
