// ============================================================================
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
