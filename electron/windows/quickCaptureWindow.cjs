const { BrowserWindow, screen } = require('electron');
const path = require('path');

let quickCaptureWin = null;

function createQuickCaptureWindow(isDev = false, devServerUrl = '') {
  if (quickCaptureWin && !quickCaptureWin.isDestroyed()) {
    return quickCaptureWin;
  }

  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

  const width = 560;
  const height = 340;
  const x = Math.round((screenWidth - width) / 2);
  const y = Math.round(screenHeight * 0.22); // Elegant upper-third positioning

  quickCaptureWin = new BrowserWindow({
    width,
    height,
    x,
    y,
    frame: false,
    transparent: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    show: false,
    backgroundColor: '#0f111a',
    webPreferences: {
      preload: path.join(__dirname, '../preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      devTools: isDev
    }
  });

  const indexPath = path.join(__dirname, '../../dist/index.html');
  if (isDev && devServerUrl) {
    quickCaptureWin.loadURL(`${devServerUrl}#quick-capture`).catch(() => {
      quickCaptureWin.loadFile(indexPath, { hash: 'quick-capture' });
    });
  } else {
    quickCaptureWin.loadFile(indexPath, {
      hash: 'quick-capture'
    });
  }

  quickCaptureWin.on('blur', () => {
    quickCaptureWin.hide();
  });

  quickCaptureWin.on('close', (e) => {
    if (!quickCaptureWin.appIsQuitting) {
      e.preventDefault();
      quickCaptureWin.hide();
    }
  });

  return quickCaptureWin;
}

function showQuickCapture() {
  if (!quickCaptureWin || quickCaptureWin.isDestroyed()) {
    createQuickCaptureWindow();
  }
  quickCaptureWin.show();
  quickCaptureWin.focus();
}

function hideQuickCapture() {
  if (quickCaptureWin && !quickCaptureWin.isDestroyed()) {
    quickCaptureWin.hide();
  }
}

function getQuickCaptureWindow() {
  return quickCaptureWin;
}

module.exports = {
  createQuickCaptureWindow,
  showQuickCapture,
  hideQuickCapture,
  getQuickCaptureWindow
};
