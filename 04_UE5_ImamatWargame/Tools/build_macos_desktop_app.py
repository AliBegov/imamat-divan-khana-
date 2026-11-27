#!/usr/bin/env python3
"""
IMAMAT: DIVAN-KHANA (1845) — Native macOS (.app) & Windows Desktop Packager
Milestone M22: Native Cocoa + WKWebView macOS Application Bundle (.app) + .icns Icon + Windows Launcher
"""

import os
import pathlib
import shutil
import struct
import subprocess
import sys
import zipfile
import zlib


def create_octagonal_icon_png(output_png: pathlib.Path, size: int = 512) -> None:
    """
    Generates a rich 32-bit RGBA PNG icon featuring the dark obsidian & gold
    Octagonal Seal of Imam Shamil (Диван-хана 1261 AH / 1845) with Kubachi niello geometry.
    """
    width = height = size
    cx = cy = size / 2.0
    r_outer = size * 0.45
    r_gold = size * 0.42
    r_inner = size * 0.37

    rows = []
    for y in range(height):
        row = bytearray()
        row.append(0)  # PNG filter type 0 (None)
        for x in range(width):
            dx = abs(x - cx)
            dy = abs(y - cy)
            # Octagonal norm: max(|dx|, |dy|, (|dx|+|dy|)/sqrt(2))
            oct_dist = max(dx, dy, (dx + dy) * 0.70710678)

            # Rounded background squircle for macOS Big Sur / Sonoma icon style
            sq_dist = ((dx / (size * 0.46)) ** 4 + (dy / (size * 0.46)) ** 4) ** 0.25

            if sq_dist > 1.0:
                row.extend((0, 0, 0, 0))
                continue

            # Radial glow
            rad = (dx * dx + dy * dy) ** 0.5 / (size * 0.5)
            bg_r = int(max(10, min(32, 24 - rad * 12)))
            bg_g = int(max(12, min(38, 28 - rad * 14)))
            bg_b = int(max(18, min(48, 36 - rad * 16)))

            if r_inner < oct_dist <= r_outer:
                # Gold octagonal rim of Imam Shamil's signet ring
                if abs(oct_dist - (r_inner + r_outer) * 0.5) < size * 0.012:
                    row.extend((252, 211, 77, 255))  # Bright gold highlight
                else:
                    row.extend((217, 119, 6, 255))   # Deep amber gold
            elif oct_dist <= r_inner:
                # Inner emerald-obsidian field with geometric star & crescent/mountain motif
                norm_y = (y - cy) / r_inner
                norm_x = (x - cx) / r_inner

                # Twin mountain peaks (Akhulgo & Gunib) inside the seal
                peak1 = -0.05 + abs(norm_x + 0.22) * 1.35
                peak2 = -0.18 + abs(norm_x - 0.18) * 1.25
                mountain_h = min(peak1, peak2)

                # 8-pointed star of the Mudir in the upper sky
                star_dx = abs(norm_x)
                star_dy = abs(norm_y + 0.36)
                star_d = max(star_dx, star_dy, (star_dx + star_dy) * 0.7071)

                if star_d < 0.14:
                    row.extend((252, 211, 77, 255))
                elif abs(norm_y - mountain_h) < 0.025 and norm_y < 0.55:
                    row.extend((245, 158, 11, 255))  # Gold mountain ridge line
                elif norm_y > mountain_h and norm_y < 0.55:
                    # Mountain body with Milyutin contour stripes
                    stripe = int((norm_y * 28)) % 4 == 0
                    if stripe:
                        row.extend((180, 83, 9, 255))
                    else:
                        row.extend((28, 34, 43, 255))
                elif norm_y >= 0.55 and abs(norm_y - 0.62) < 0.03 and abs(norm_x) < 0.55:
                    # Gold calligraphic bar at base
                    row.extend((251, 191, 36, 255))
                else:
                    row.extend((14, 22, 28, 255))
            else:
                row.extend((bg_r, bg_g, bg_b, 255))
        rows.append(bytes(row))

    raw_data = b"".join(rows)

    def make_chunk(chunk_type: bytes, data: bytes) -> bytes:
        crc = zlib.crc32(chunk_type + data) & 0xFFFFFFFF
        return struct.pack(">I", len(data)) + chunk_type + data + struct.pack(">I", crc)

    ihdr = struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)
    compressed = zlib.compress(raw_data, level=9)
    png_bytes = (
        b"\x89PNG\r\n\x1a\n"
        + make_chunk(b"IHDR", ihdr)
        + make_chunk(b"IDAT", compressed)
        + make_chunk(b"IEND", b"")
    )
    output_png.write_bytes(png_bytes)


def build_icns(resources_dir: pathlib.Path, work_dir: pathlib.Path) -> pathlib.Path:
    iconset_dir = work_dir / "AppIcon.iconset"
    if iconset_dir.exists():
        shutil.rmtree(iconset_dir)
    iconset_dir.mkdir(parents=True, exist_ok=True)

    master_png = work_dir / "master_icon_1024.png"
    create_octagonal_icon_png(master_png, size=512)

    sizes = [
        (16, "icon_16x16.png"),
        (32, "icon_16x16@2x.png"),
        (32, "icon_32x32.png"),
        (64, "icon_32x32@2x.png"),
        (128, "icon_128x128.png"),
        (256, "icon_128x128@2x.png"),
        (256, "icon_256x256.png"),
        (512, "icon_256x256@2x.png"),
        (512, "icon_512x512.png"),
        (512, "icon_512x512@2x.png"),
    ]
    for px, filename in sizes:
        dest = iconset_dir / filename
        subprocess.run(
            ["/usr/bin/sips", "-z", str(px), str(px), str(master_png), "--out", str(dest)],
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )

    icns_path = resources_dir / "AppIcon.icns"
    subprocess.run(
        ["/usr/bin/iconutil", "-c", "icns", str(iconset_dir), "-o", str(icns_path)],
        check=True,
    )
    shutil.rmtree(iconset_dir, ignore_errors=True)
    master_png.unlink(missing_ok=True)
    return icns_path


SWIFT_APP_SOURCE = r'''
import Cocoa
import WebKit

class AppDelegate: NSObject, NSApplicationDelegate, WKScriptMessageHandler, WKUIDelegate, WKNavigationDelegate {
    var window: NSWindow!
    var webView: WKWebView!

    func applicationDidFinishLaunching(_ notification: Notification) {
        NSApp.appearance = NSAppearance(named: .darkAqua)
        setupMainMenu()

        let screenFrame = NSScreen.main?.visibleFrame ?? NSRect(x: 0, y: 0, width: 1440, height: 900)
        let winWidth = min(1480.0, screenFrame.width * 0.94)
        let winHeight = min(920.0, screenFrame.height * 0.92)
        let winRect = NSRect(
            x: screenFrame.origin.x + (screenFrame.width - winWidth) * 0.5,
            y: screenFrame.origin.y + (screenFrame.height - winHeight) * 0.5,
            width: winWidth,
            height: winHeight
        )

        window = NSWindow(
            contentRect: winRect,
            styleMask: [.titled, .closable, .miniaturizable, .resizable, .fullSizeContentView],
            backing: .buffered,
            defer: false
        )
        window.title = "ИМАМАТ: ДИВАН-ХАНА (1845) — Native macOS Edition (RU / EN)"
        window.minSize = NSSize(width: 1024, height: 680)
        window.backgroundColor = NSColor(calibratedRed: 0.047, green: 0.055, blue: 0.071, alpha: 1.0)
        window.collectionBehavior = [.fullScreenPrimary]
        window.isReleasedWhenClosed = false

        let contentController = WKUserContentController()
        contentController.add(self, name: "imamatSaveFile")
        contentController.add(self, name: "imamatSteamCloud")
        contentController.add(self, name: "imamatSteamAchievement")

        // Intercept blob downloads & expose native macOS Steam Cloud + Achievements bridge (Sprint 11)
        let downloadBridgeJS = """
        (function() {
          window.imamatSteamBridge = {
            mode: 'macos_native_app',
            appId: 3481840,
            cloudEnabled: true,
            overlayAvailable: false,
            personaName: 'macOS Commander',
            writeCloudSave: function(filename, content) {
              if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.imamatSteamCloud) {
                window.webkit.messageHandlers.imamatSteamCloud.postMessage({ filename: filename, content: content });
                return true;
              }
              return false;
            },
            unlockAchievement: function(apiName) {
              if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.imamatSteamAchievement) {
                window.webkit.messageHandlers.imamatSteamAchievement.postMessage({ apiName: apiName });
                return true;
              }
              return false;
            },
            setRichPresence: function() { return true; },
            openSteamOverlay: function() { return false; }
          };

          const origClick = HTMLAnchorElement.prototype.click;
          HTMLAnchorElement.prototype.click = function() {
            if (this.download && this.href && this.href.startsWith('blob:') && window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.imamatSaveFile) {
              const fname = this.download || 'Imamat_Export.txt';
              fetch(this.href)
                .then(r => r.text())
                .then(text => {
                  window.webkit.messageHandlers.imamatSaveFile.postMessage({ filename: fname, content: text });
                })
                .catch(err => console.error('Native save bridge error:', err));
              return;
            }
            return origClick.apply(this, arguments);
          };
        })();
        """
        let userScript = WKUserScript(source: downloadBridgeJS, injectionTime: .atDocumentStart, forMainFrameOnly: false)
        contentController.addUserScript(userScript)

        let config = WKWebViewConfiguration()
        config.userContentController = contentController
        config.mediaTypesRequiringUserActionForPlayback = []
        config.preferences.setValue(true, forKey: "allowFileAccessFromFileURLs")

        webView = WKWebView(frame: window.contentView!.bounds, configuration: config)
        webView.autoresizingMask = [.width, .height]
        webView.uiDelegate = self
        webView.navigationDelegate = self
        webView.setValue(false, forKey: "drawsBackground")

        window.contentView?.addSubview(webView)
        window.makeKeyAndOrderFront(nil)
        NSApp.activate(ignoringOtherApps: true)

        loadGameBundle()
    }

    func loadGameBundle() {
        guard let resURL = Bundle.main.resourceURL else { return }
        let htmlURL = resURL.appendingPathComponent("Imamat_DivanKhana_Standalone_Playtest.html")
        if FileManager.default.fileExists(atPath: htmlURL.path) {
            webView.loadFileURL(htmlURL, allowingReadAccessTo: resURL)
        }
    }

    @objc func reloadGame(_ sender: Any?) {
        webView.reload()
    }

    // WKScriptMessageHandler: Save exported files, Steam Auto-Cloud .imamat-save & achievements locally
    func steamCloudDirectoryURL() -> URL? {
        guard let appSupport = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first else {
            return nil
        }
        let dir = appSupport.appendingPathComponent("ImamatDivanKhana/SteamCloud", isDirectory: true)
        try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        return dir
    }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        if message.name == "imamatSteamCloud",
           let dict = message.body as? [String: Any],
           let rawName = dict["filename"] as? String,
           let content = dict["content"] as? String,
           let dir = steamCloudDirectoryURL() {
            let safeName = URL(fileURLWithPath: rawName).lastPathComponent
            let target = dir.appendingPathComponent(safeName)
            try? content.write(to: target, atomically: true, encoding: .utf8)
            return
        }

        if message.name == "imamatSteamAchievement",
           let dict = message.body as? [String: Any],
           let apiName = dict["apiName"] as? String,
           let dir = steamCloudDirectoryURL() {
            let achFile = dir.appendingPathComponent("achievements.json")
            var unlocked: [String] = []
            if let existing = try? Data(contentsOf: achFile),
               let parsed = try? JSONSerialization.jsonObject(with: existing) as? [String] {
                unlocked = parsed
            }
            if !unlocked.contains(apiName) {
                unlocked.append(apiName)
                if let encoded = try? JSONSerialization.data(withJSONObject: unlocked, options: [.prettyPrinted]) {
                    try? encoded.write(to: achFile)
                }
            }
            return
        }

        guard message.name == "imamatSaveFile",
              let dict = message.body as? [String: Any],
              let filename = dict["filename"] as? String,
              let content = dict["content"] as? String else {
            return
        }

        let savePanel = NSSavePanel()
        savePanel.title = "Сохранить документ Диван-ханы / Save Divan-Khana Document"
        savePanel.nameFieldStringValue = filename
        savePanel.canCreateDirectories = true
        if let downloadsURL = FileManager.default.urls(for: .downloadsDirectory, in: .userDomainMask).first {
            savePanel.directoryURL = downloadsURL
        }

        savePanel.beginSheetModal(for: self.window) { response in
            if response == .OK, let targetURL = savePanel.url {
                do {
                    try content.write(to: targetURL, atomically: true, encoding: .utf8)
                } catch {
                    let alert = NSAlert(error: error)
                    alert.runModal()
                }
            }
        }
    }

    // WKUIDelegate: Support <input type="file"> for loading Workshop Mods & Campaign Saves (.json)
    func webView(_ webView: WKWebView, runOpenPanelWith parameters: WKOpenPanelParameters, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping ([URL]?) -> Void) {
        let openPanel = NSOpenPanel()
        openPanel.canChooseFiles = true
        openPanel.canChooseDirectories = false
        openPanel.allowsMultipleSelection = parameters.allowsMultipleSelection
        if let resURL = Bundle.main.resourceURL {
            let modsURL = resURL.appendingPathComponent("Workshop_Mods")
            if FileManager.default.fileExists(atPath: modsURL.path) {
                openPanel.directoryURL = modsURL
            }
        }
        openPanel.beginSheetModal(for: self.window) { response in
            if response == .OK {
                completionHandler(openPanel.urls)
            } else {
                completionHandler(nil)
            }
        }
    }

    func webView(_ webView: WKWebView, runJavaScriptAlertPanelWithMessage message: String, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping () -> Void) {
        let alert = NSAlert()
        alert.messageText = "ИМАМАТ: ДИВАН-ХАНА"
        alert.informativeText = message
        alert.addButton(withTitle: "OK")
        alert.beginSheetModal(for: self.window) { _ in
            completionHandler()
        }
    }

    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool {
        return true
    }

    func setupMainMenu() {
        let mainMenu = NSMenu()
        NSApp.mainMenu = mainMenu

        // 1. App Menu
        let appMenuItem = NSMenuItem()
        mainMenu.addItem(appMenuItem)
        let appMenu = NSMenu()
        appMenuItem.submenu = appMenu
        appMenu.addItem(withTitle: "О программе «ИМАМАТ: ДИВАН-ХАНА»", action: #selector(NSApplication.orderFrontStandardAboutPanel(_:)), keyEquivalent: "")
        appMenu.addItem(NSMenuItem.separator())
        appMenu.addItem(withTitle: "Скрыть", action: #selector(NSApplication.hide(_:)), keyEquivalent: "h")
        appMenu.addItem(NSMenuItem.separator())
        appMenu.addItem(withTitle: "Выйти из «ИМАМАТ: ДИВАН-ХАНА»", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q")

        // 2. View Menu
        let viewMenuItem = NSMenuItem()
        mainMenu.addItem(viewMenuItem)
        let viewMenu = NSMenu(title: "Вид / View")
        viewMenuItem.submenu = viewMenu
        viewMenu.addItem(withTitle: "Перезагрузить интерфейс / Reload", action: #selector(reloadGame(_:)), keyEquivalent: "r")
        let fullScreenItem = NSMenuItem(title: "Полный экран / Toggle Full Screen", action: #selector(NSWindow.toggleFullScreen(_:)), keyEquivalent: "f")
        fullScreenItem.keyEquivalentModifierMask = [.command, .control]
        viewMenu.addItem(fullScreenItem)

        // 3. Window Menu
        let windowMenuItem = NSMenuItem()
        mainMenu.addItem(windowMenuItem)
        let windowMenu = NSMenu(title: "Окно / Window")
        windowMenuItem.submenu = windowMenu
        windowMenu.addItem(withTitle: "Свернуть / Minimize", action: #selector(NSWindow.performMiniaturize(_:)), keyEquivalent: "m")
        windowMenu.addItem(withTitle: "Изменить масштаб / Zoom", action: #selector(NSWindow.performZoom(_:)), keyEquivalent: "")
    }
}

let app = NSApplication.shared
app.setActivationPolicy(.regular)
let delegate = AppDelegate()
app.delegate = delegate
app.run()
'''


INFO_PLIST_TEMPLATE = """<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDevelopmentRegion</key>
    <string>ru</string>
    <key>CFBundleDisplayName</key>
    <string>ИМАМАТ: ДИВАН-ХАНА (1845)</string>
    <key>CFBundleExecutable</key>
    <string>ImamatDivanKhana</string>
    <key>CFBundleIconFile</key>
    <string>AppIcon</string>
    <key>CFBundleIdentifier</key>
    <string>com.imamat.divankhana.desktop</string>
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>CFBundleName</key>
    <string>ImamatDivanKhana</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>2.0.0</string>
    <key>CFBundleVersion</key>
    <string>22</string>
    <key>LSMinimumSystemVersion</key>
    <string>12.0</string>
    <key>NSHighResolutionCapable</key>
    <true/>
    <key>NSSupportsAutomaticGraphicsSwitching</key>
    <true/>
    <key>NSHumanReadableCopyright</key>
    <string>© 2026 IMAMAT: DIVAN-KHANA (1845) — Historical Strategy &amp; 3D Wargame Vertical Slice</string>
</dict>
</plist>
"""


WINDOWS_BAT_LAUNCHER = r"""@echo off
chcp 65001 >nul
title IMAMAT: DIVAN-KHANA (1845) — Desktop App Mode Launcher
set "APP_HTML=%~dp0Imamat_DivanKhana_Standalone_Playtest.html"

if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" (
    start "" "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" --app="file:///%APP_HTML:\=/%" --window-size=1480,920
    exit /b 0
)
if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" (
    start "" "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" --app="file:///%APP_HTML:\=/%" --window-size=1480,920
    exit /b 0
)
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" --app="file:///%APP_HTML:\=/%" --window-size=1480,920
    exit /b 0
)
start "" "%APP_HTML%"
"""


ELECTRON_MAIN_CJS = """// ============================================================================
// IMAMAT: DIVAN-KHANA (1845) — Commercial Steamworks Electron Desktop Shell
// Sprint 11 (Phase 6): macOS / Windows / Steam Deck with Steamworks IPC Bridge
// Supports optional steamworks.js (Cloud Saves, 12 Achievements, Rich Presence, Overlay)
// with automatic graceful fallback to local userData/SteamCloud/ mirror outside Steam.
// ============================================================================
const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');

const STEAM_APP_ID = 3481840;
let steamClient = null;
let steamMode = 'desktop_cloud_mirror';

try {
  // Optional Steamworks SDK binding (bundled in Steamworks production builds)
  const steamworks = require('steamworks.js');
  steamClient = steamworks.init(STEAM_APP_ID);
  steamMode = 'steamworks';
  if (typeof steamworks.electronEnableSteamOverlay === 'function') {
    steamworks.electronEnableSteamOverlay();
  }
} catch {
  steamClient = null;
  steamMode = 'desktop_cloud_mirror';
}

function getCloudDir() {
  const dir = path.join(app.getPath('userData'), 'SteamCloud');
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

ipcMain.on('steam:getStatusSync', (event) => {
  event.returnValue = {
    mode: steamMode,
    appId: STEAM_APP_ID,
    connected: Boolean(steamClient),
    cloudEnabled: true,
    overlayAvailable: Boolean(steamClient),
    personaName: steamClient?.localplayer?.getName?.() || 'Desktop Commander'
  };
});

ipcMain.on('steam:writeCloudSave', (_event, { filename, content }) => {
  const safeName = path.basename(String(filename || 'imamat_save_slot_1.imamat-save'));
  try {
    if (steamClient?.cloud?.writeFile) {
      steamClient.cloud.writeFile(safeName, String(content || ''));
    }
  } catch {
    // fallback to local Steam Auto-Cloud directory below
  }
  try {
    fs.writeFileSync(path.join(getCloudDir(), safeName), String(content || ''), 'utf8');
  } catch {
    // ignore disk errors
  }
});

ipcMain.on('steam:unlockAchievement', (_event, apiName) => {
  const id = String(apiName || '').trim();
  if (!id) return;
  try {
    if (steamClient?.achievement?.activate) {
      steamClient.achievement.activate(id);
    }
  } catch {
    // ignore outside Steam client
  }
  try {
    const file = path.join(getCloudDir(), 'achievements.json');
    const prev = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : [];
    if (!prev.includes(id)) {
      prev.push(id);
      fs.writeFileSync(file, JSON.stringify(prev, null, 2), 'utf8');
    }
  } catch {
    // ignore
  }
});

ipcMain.on('steam:setRichPresence', (_event, { key, value }) => {
  try {
    if (steamClient?.localplayer?.setRichPresence) {
      steamClient.localplayer.setRichPresence('steam_display', String(key || '#Status_DivanKhana'));
      steamClient.localplayer.setRichPresence('status', String(value || ''));
    }
  } catch {
    // ignore
  }
});

ipcMain.on('steam:openOverlaySync', (event, target) => {
  try {
    if (steamClient?.overlay?.activateDialog) {
      steamClient.overlay.activateDialog(String(target || 'Achievements'));
      event.returnValue = true;
      return;
    }
  } catch {
    // ignore
  }
  event.returnValue = false;
});

function createWindow() {
  const win = new BrowserWindow({
    width: 1540,
    height: 940,
    minWidth: 1280,
    minHeight: 760,
    backgroundColor: '#0c0e12',
    title: 'IMAMAT: DIVAN-KHANA (1845) — Steam Desktop Edition (RU / EN)',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'electron-preload.cjs')
    }
  });

  const standaloneLocal = path.join(__dirname, 'Imamat_DivanKhana_Standalone_Playtest.html');
  const distIndex = path.join(__dirname, 'dist', 'index.html');
  win.loadFile(fs.existsSync(distIndex) ? distIndex : standaloneLocal);
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
"""


ELECTRON_PRELOAD_CJS = """// ============================================================================
// IMAMAT: DIVAN-KHANA (1845) — Secure Context-Isolated Steamworks Preload Bridge
// Exposes window.imamatSteamBridge to src/game/steamworksBridge.js
// ============================================================================
const { contextBridge, ipcRenderer } = require('electron');

const status = ipcRenderer.sendSync('steam:getStatusSync') || {
  mode: 'desktop_cloud_mirror',
  appId: 3481840,
  connected: false,
  cloudEnabled: true,
  overlayAvailable: false,
  personaName: 'Desktop Commander'
};

contextBridge.exposeInMainWorld('imamatSteamBridge', {
  mode: status.mode,
  appId: status.appId,
  connected: status.connected,
  cloudEnabled: status.cloudEnabled,
  overlayAvailable: status.overlayAvailable,
  personaName: status.personaName,
  writeCloudSave: (filename, content) => {
    ipcRenderer.send('steam:writeCloudSave', { filename, content });
    return true;
  },
  unlockAchievement: (apiName) => {
    ipcRenderer.send('steam:unlockAchievement', apiName);
    return true;
  },
  setRichPresence: (key, value) => {
    ipcRenderer.send('steam:setRichPresence', { key, value });
    return true;
  },
  openSteamOverlay: (target) => Boolean(ipcRenderer.sendSync('steam:openOverlaySync', target))
});
"""


STEAM_DESKTOP_PACKAGE_JSON = """{
  "name": "imamat-divan-khana-steam",
  "productName": "IMAMAT: DIVAN-KHANA (1845)",
  "version": "1.0.0-rc1",
  "description": "Historical Grand Strategy & 3D Mountain Warfare Wargame (1834-1859)",
  "main": "electron-main.cjs",
  "scripts": {
    "start": "electron .",
    "dist:win": "electron-builder --win nsis portable --x64",
    "dist:mac": "electron-builder --mac dmg zip --universal",
    "stage:steam": "bash ./stage_steam_depots.sh"
  },
  "optionalDependencies": {
    "steamworks.js": "^0.3.1"
  },
  "devDependencies": {
    "electron": "^34.0.0",
    "electron-builder": "^25.1.8"
  },
  "build": {
    "appId": "com.imamat.divankhana.steam",
    "productName": "ImamatDivanKhana",
    "files": [
      "electron-main.cjs",
      "electron-preload.cjs",
      "steam_appid.txt",
      "Imamat_DivanKhana_Standalone_Playtest.html",
      "Workshop_Mods/**/*"
    ],
    "mac": {
      "category": "public.app-category.strategy-games",
      "hardenedRuntime": true,
      "gatekeeperAssess": false,
      "target": ["dmg", "zip"]
    },
    "win": {
      "target": [
        { "target": "nsis", "arch": ["x64"] },
        { "target": "portable", "arch": ["x64"] }
      ]
    }
  }
}
"""


STAGE_STEAM_DEPOTS_SH = """#!/usr/bin/env bash
set -euo pipefail
# Stage Windows (Depot 3481841) and macOS (Depot 3481842) builds for Valve SteamPipe upload
PKG_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
KIT_DIR="$(cd "$PKG_DIR/.." && pwd)"
STAGE_DIR="$KIT_DIR/StagedBuilds"

rm -rf "$STAGE_DIR"
mkdir -p "$STAGE_DIR/Windows" "$STAGE_DIR/Mac"

# Stage Windows Depot (3481841)
cp "$KIT_DIR/Imamat_DivanKhana_Standalone_Playtest.html" "$STAGE_DIR/Windows/"
cp "$KIT_DIR/Launch_Imamat_Windows_Desktop.bat" "$STAGE_DIR/Windows/"
cp "$PKG_DIR/electron-main.cjs" "$PKG_DIR/electron-preload.cjs" "$PKG_DIR/steam_appid.txt" "$STAGE_DIR/Windows/"
cp -R "$KIT_DIR/Workshop_Mods" "$STAGE_DIR/Windows/Workshop_Mods"

# Stage macOS Depot (3481842)
cp -R "$KIT_DIR/Imamat_DivanKhana_macOS.app" "$STAGE_DIR/Mac/"
cp "$PKG_DIR/steam_appid.txt" "$STAGE_DIR/Mac/"

echo "[OK] SteamPipe depots staged at: $STAGE_DIR"
echo "     Run: steamcmd +login <partner_account> +run_app_build ../Steamworks_Partner_Config/app_build_imamat_vertical_slice.vdf +quit"
"""


def main() -> int:
    script_dir = pathlib.Path(__file__).resolve().parent
    root_dir = script_dir.parent.parent
    kit_dir = root_dir / "05_Steam_Release_and_Playtest_Kit"
    web_dir = root_dir / "03_Веб_прототип_Диван_Хана"

    app_bundle = kit_dir / "Imamat_DivanKhana_macOS.app"
    contents_dir = app_bundle / "Contents"
    macos_dir = contents_dir / "MacOS"
    resources_dir = contents_dir / "Resources"

    if app_bundle.exists():
        shutil.rmtree(app_bundle)

    macos_dir.mkdir(parents=True, exist_ok=True)
    resources_dir.mkdir(parents=True, exist_ok=True)

    # 1. Write Info.plist & PkgInfo
    (contents_dir / "Info.plist").write_text(INFO_PLIST_TEMPLATE, encoding="utf-8")
    (contents_dir / "PkgInfo").write_text("APPL????", encoding="utf-8")

    # 2. Generate AppIcon.icns
    icns_path = build_icns(resources_dir, kit_dir)
    print(f"  -> Generated macOS Retina Icon: {icns_path.name} ({icns_path.stat().st_size:,} bytes)")

    # 3. Compile Native Swift Cocoa + WKWebView Binary using CommandLineTools
    swift_src = kit_dir / "_build_ImamatMacApp.swift"
    swift_src.write_text(SWIFT_APP_SOURCE, encoding="utf-8")
    bin_path = macos_dir / "ImamatDivanKhana"

    clt_env = {**os.environ, "DEVELOPER_DIR": "/Library/Developer/CommandLineTools"}
    if not pathlib.Path("/Library/Developer/CommandLineTools").exists():
        clt_env = dict(os.environ)

    subprocess.run(
        [
            "/usr/bin/swiftc",
            "-O",
            str(swift_src),
            "-o",
            str(bin_path),
            "-framework",
            "Cocoa",
            "-framework",
            "WebKit",
        ],
        check=True,
        env=clt_env,
    )
    swift_src.unlink(missing_ok=True)
    os.chmod(bin_path, 0o755)
    print(f"  -> Compiled Native arm64 Mach-O Binary: {bin_path.name} ({bin_path.stat().st_size:,} bytes)")

    # 4. Copy Standalone HTML, Pitch Deck, all historical .jpg artworks & Workshop Mods into Contents/Resources/
    assets_to_copy = [
        "Imamat_DivanKhana_Standalone_Playtest.html",
        "Imamat_Publisher_Pitch_Deck_Interactive.html",
    ] + [p.name for p in sorted(kit_dir.glob("*.jpg"))]
    for asset_name in dict.fromkeys(assets_to_copy):
        src = kit_dir / asset_name
        if src.exists():
            shutil.copy2(src, resources_dir / asset_name)

    mods_src = kit_dir / "Workshop_Mods"
    if mods_src.exists():
        shutil.copytree(mods_src, resources_dir / "Workshop_Mods", dirs_exist_ok=True)

    # 5. Ad-hoc codesign the .app bundle so macOS Gatekeeper opens it cleanly
    subprocess.run(
        ["/usr/bin/codesign", "--force", "--deep", "--sign", "-", str(app_bundle)],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    print(f"  -> Signed Native macOS Bundle: {app_bundle.name}")

    # 6. Create Windows App-Mode Launcher (.bat), Electron+Steamworks IPC Shell & Steam Desktop Package
    win_bat = kit_dir / "Launch_Imamat_Windows_Desktop.bat"
    win_bat.write_text(WINDOWS_BAT_LAUNCHER, encoding="utf-8")
    electron_path = web_dir / "electron-main.cjs"
    electron_path.write_text(ELECTRON_MAIN_CJS, encoding="utf-8")
    preload_path = web_dir / "electron-preload.cjs"
    preload_path.write_text(ELECTRON_PRELOAD_CJS, encoding="utf-8")

    steam_pkg_dir = kit_dir / "Steam_Desktop_Package"
    steam_pkg_dir.mkdir(parents=True, exist_ok=True)
    (steam_pkg_dir / "electron-main.cjs").write_text(ELECTRON_MAIN_CJS, encoding="utf-8")
    (steam_pkg_dir / "electron-preload.cjs").write_text(ELECTRON_PRELOAD_CJS, encoding="utf-8")
    (steam_pkg_dir / "package.json").write_text(STEAM_DESKTOP_PACKAGE_JSON, encoding="utf-8")
    (steam_pkg_dir / "steam_appid.txt").write_text("3481840\n", encoding="utf-8")
    stage_sh = steam_pkg_dir / "stage_steam_depots.sh"
    stage_sh.write_text(STAGE_STEAM_DEPOTS_SH, encoding="utf-8")
    os.chmod(stage_sh, 0o755)

    # Package portable Windows Steam/Desktop ZIP
    win_zip = kit_dir / "Imamat_DivanKhana_Windows_Portable.zip"
    with zipfile.ZipFile(win_zip, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        for src, arc in [
            (kit_dir / "Imamat_DivanKhana_Standalone_Playtest.html", "Imamat_DivanKhana_Windows/Imamat_DivanKhana_Standalone_Playtest.html"),
            (win_bat, "Imamat_DivanKhana_Windows/Launch_Imamat_Windows_Desktop.bat"),
            (steam_pkg_dir / "electron-main.cjs", "Imamat_DivanKhana_Windows/electron-main.cjs"),
            (steam_pkg_dir / "electron-preload.cjs", "Imamat_DivanKhana_Windows/electron-preload.cjs"),
            (steam_pkg_dir / "package.json", "Imamat_DivanKhana_Windows/package.json"),
            (steam_pkg_dir / "steam_appid.txt", "Imamat_DivanKhana_Windows/steam_appid.txt"),
        ]:
            if src.exists():
                zf.write(src, arcname=arc)
        if mods_src.exists():
            for mf in sorted(mods_src.glob("*.json")):
                zf.write(mf, arcname=f"Imamat_DivanKhana_Windows/Workshop_Mods/{mf.name}")

    print(
        f"  -> Created Windows Desktop Launcher ({win_bat.name}), Electron+Steamworks IPC ({electron_path.name} + preload) "
        f"& Windows Portable ZIP ({win_zip.stat().st_size:,} bytes)"
    )

    # 7. Package Imamat_DivanKhana_macOS_App.zip preserving Unix permissions & copy to root workspace
    mac_zip = kit_dir / "Imamat_DivanKhana_macOS_App.zip"
    if mac_zip.exists():
        mac_zip.unlink()
    subprocess.run(
        ["/usr/bin/ditto", "-c", "-k", "--sequesterRsrc", "--keepParent", str(app_bundle), str(mac_zip)],
        check=True,
    )
    print(f"  -> Packaged Redistributable macOS App Archive: {mac_zip.name} ({mac_zip.stat().st_size:,} bytes)")

    root_app_copy = root_dir / "ИМАМАТ — Диван-Хана (1845).app"
    if root_app_copy.exists():
        shutil.rmtree(root_app_copy)
    shutil.copytree(app_bundle, root_app_copy)
    subprocess.run(
        ["/usr/bin/codesign", "--force", "--deep", "--sign", "-", str(root_app_copy)],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    print(f"  -> Installed Root Desktop Application: {root_app_copy.name}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
