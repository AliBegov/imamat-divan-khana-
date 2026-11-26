// ============================================================================
// IMAMAT: DIVAN-KHANA (1845) — Cross-Platform Electron Desktop Shell (macOS/Win/Linux)
// Run via: npx electron electron-main.cjs
// ============================================================================
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1480,
    height: 920,
    minWidth: 1024,
    minHeight: 680,
    backgroundColor: '#0c0e12',
    title: 'ИМАМАТ: ДИВАН-ХАНА (1845) — Desktop Edition (RU / EN)',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  const distIndex = path.join(__dirname, 'dist', 'index.html');
  win.loadFile(distIndex);
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
