const { BrowserWindow, screen } = require('electron');
const path = require('path');
const { getSettings, logError } = require('../db/settingsRepo.cjs');

let mainWin = null;

function createMainWindow(isDev = false, devServerUrl = '') {
  if (mainWin && !mainWin.isDestroyed()) {
    return mainWin;
  }

  const settings = getSettings();
  const isAlwaysOnTop = Boolean(settings.alwaysOnTop);
  const isHidden = process.argv.includes('--hidden') || process.argv.includes('--minimized');

  let winWidth = 1200;
  let winHeight = 720;
  try {
    const primaryDisplay = screen.getPrimaryDisplay();
    if (primaryDisplay && primaryDisplay.workAreaSize) {
      const { width: sWidth, height: sHeight } = primaryDisplay.workAreaSize;
      winWidth = Math.min(1280, Math.max(900, Math.round(sWidth * 0.92)));
      winHeight = Math.min(800, Math.max(560, Math.round(sHeight * 0.88)));
    }
  } catch (e) {}

  mainWin = new BrowserWindow({
    width: winWidth,
    height: winHeight,
    minWidth: 800,
    minHeight: 520,
    center: true,
    title: 'WINC TASK HUB',
    backgroundColor: '#0b0d13',
    frame: true,
    show: !isHidden,
    alwaysOnTop: isAlwaysOnTop,
    webPreferences: {
      preload: path.join(__dirname, '../preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      devTools: isDev
    }
  });

  // Security: Block unexpected new windows and route external links to default browser
  const { shell } = require('electron');
  mainWin.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://') || url.startsWith('http://')) {
      shell.openExternal(url).catch(() => {});
    }
    return { action: 'deny' };
  });

  // Security: Prevent in-window navigation away from local bundle
  mainWin.webContents.on('will-navigate', (event, navigationUrl) => {
    if (isDev && devServerUrl && navigationUrl.startsWith(devServerUrl)) return;
    try {
      const parsed = new URL(navigationUrl);
      if (parsed.protocol === 'file:') return;
    } catch (e) {}
    event.preventDefault();
    if (navigationUrl.startsWith('https://') || navigationUrl.startsWith('http://')) {
      shell.openExternal(navigationUrl).catch(() => {});
    }
  });

  const indexPath = path.join(__dirname, '../../dist/index.html');
  if (isDev && devServerUrl) {
    mainWin.loadURL(devServerUrl).catch(() => {
      mainWin.loadFile(indexPath);
    });
  } else {
    mainWin.loadFile(indexPath);
  }

  mainWin.webContents.on('console-message', (event, level, message, line, sourceId) => {
    if (level >= 3) {
      console.error(`[Renderer Error] ${message} (${sourceId}:${line})`);
      logError('error', `Renderer: ${message}`, `${sourceId}:${line}`);
    }
  });

  mainWin.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('[MainWindow] did-fail-load:', errorCode, errorDescription);
    logError('error', 'did-fail-load', `${errorCode}: ${errorDescription}`);
  });

  if (!isHidden) {
    let hasShown = false;
    const doShow = () => {
      if (hasShown || !mainWin || mainWin.isDestroyed()) return;
      hasShown = true;
      showMainWindow(true);
    };

    mainWin.once('ready-to-show', doShow);
    mainWin.webContents.once('did-finish-load', doShow);
    setTimeout(doShow, 500);
  }

  // Minimize to tray behavior on close button ('X')
  mainWin.on('close', (e) => {
    const currentSettings = getSettings();
    if (!mainWin.appIsQuitting && (currentSettings.minimizeToTrayOnClose !== false)) {
      e.preventDefault();
      mainWin.hide();
    }
  });

  return mainWin;
}

function getMainWindow() {
  return mainWin;
}

function showMainWindow(focus = true) {
  if (!mainWin || mainWin.isDestroyed()) {
    createMainWindow();
  }
  const settings = getSettings();
  const persistentAlwaysOnTop = Boolean(settings.alwaysOnTop);

  if (mainWin.isMinimized()) {
    mainWin.restore();
  }
  mainWin.show();

  if (focus) {
    // Bring window to front reliably on Windows
    mainWin.setAlwaysOnTop(true);
    mainWin.focus();
    if (!persistentAlwaysOnTop) {
      setTimeout(() => {
        if (mainWin && !mainWin.isDestroyed()) {
          mainWin.setAlwaysOnTop(false);
        }
      }, 200);
    }
  }
  return mainWin;
}

function hideMainWindow() {
  if (mainWin && !mainWin.isDestroyed()) {
    mainWin.hide();
  }
}

function toggleMainWindow() {
  if (!mainWin || mainWin.isDestroyed()) {
    showMainWindow(true);
    return true;
  }

  if (mainWin.isVisible() && !mainWin.isMinimized() && mainWin.isFocused()) {
    // If active and focused, user wants to close/dismiss it
    mainWin.hide();
    return false;
  } else {
    // Hidden, minimized, or in background -> bring to front
    showMainWindow(true);
    return true;
  }
}

function setMainWindowAlwaysOnTop(enabled) {
  if (mainWin && !mainWin.isDestroyed()) {
    mainWin.setAlwaysOnTop(Boolean(enabled));
  }
}

module.exports = {
  createMainWindow,
  getMainWindow,
  showMainWindow,
  hideMainWindow,
  toggleMainWindow,
  setMainWindowAlwaysOnTop
};
