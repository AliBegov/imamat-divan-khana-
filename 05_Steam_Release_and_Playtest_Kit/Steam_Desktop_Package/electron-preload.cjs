// ============================================================================
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
