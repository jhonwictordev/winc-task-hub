const { BrowserWindow, screen } = require('electron');
const path = require('path');
const { getSettings, updateSettings } = require('../db/settingsRepo.cjs');

let widgetWin = null;

function createWidgetWindow(isDev = false, devServerUrl = '') {
  if (widgetWin && !widgetWin.isDestroyed()) {
    return widgetWin;
  }

  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth } = primaryDisplay.workAreaSize;

  const defaultWidth = 420;
  const defaultHeight = 520;
  const defaultX = screenWidth - defaultWidth - 30;
  const defaultY = 60;

  const settings = getSettings();
  const savedOpacity = typeof settings.widgetOpacity === 'number' ? settings.widgetOpacity : 0.96;
  const isAlwaysOnTop = Boolean(settings.alwaysOnTop);

  widgetWin = new BrowserWindow({
    width: defaultWidth,
    height: defaultHeight,
    x: defaultX,
    y: defaultY,
    minWidth: 340,
    minHeight: 240,
    maxWidth: 680,
    maxHeight: 900,
    frame: false,
    transparent: false,
    alwaysOnTop: isAlwaysOnTop,
    skipTaskbar: false,
    resizable: true,
    hasShadow: true,
    show: false,
    backgroundColor: '#0f111a',
    webPreferences: {
      preload: path.join(__dirname, '../preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      devTools: isDev
    }
  });

  widgetWin.setOpacity(savedOpacity);

  const indexPath = path.join(__dirname, '../../dist/index.html');
  if (isDev && devServerUrl) {
    widgetWin.loadURL(`${devServerUrl}#widget`).catch(() => {
      widgetWin.loadFile(indexPath, { hash: 'widget' });
    });
  } else {
    widgetWin.loadFile(indexPath, {
      hash: 'widget'
    });
  }

  // Prevent closing when user hits close; hide instead unless quitting
  widgetWin.on('close', (e) => {
    if (!widgetWin.appIsQuitting) {
      e.preventDefault();
      widgetWin.hide();
    }
  });

  // Track position
  widgetWin.on('moved', () => {
    try {
      const bounds = widgetWin.getBounds();
      updateSettings({
        widgetPosition: bounds
      });
    } catch (e) {}
  });

  return widgetWin;
}

function showWidget(tasksList = null) {
  if (!widgetWin || widgetWin.isDestroyed()) {
    createWidgetWindow();
  }

  if (tasksList && tasksList.length > 0) {
    widgetWin.webContents.send('pinned-tasks-updated', tasksList);
  }

  const settings = getSettings();
  widgetWin.setAlwaysOnTop(Boolean(settings.alwaysOnTop));
  widgetWin.show();
}

function hideWidget() {
  if (widgetWin && !widgetWin.isDestroyed()) {
    widgetWin.hide();
  }
}

function setWidgetCompact(isCompact) {
  if (!widgetWin || widgetWin.isDestroyed()) return;
  const bounds = widgetWin.getBounds();
  if (isCompact) {
    widgetWin.setBounds({
      x: bounds.x,
      y: bounds.y,
      width: 360,
      height: 280
    });
  } else {
    widgetWin.setBounds({
      x: bounds.x,
      y: bounds.y,
      width: 440,
      height: 540
    });
  }
}

function setWidgetOpacity(opacity) {
  if (!widgetWin || widgetWin.isDestroyed()) return;
  widgetWin.setOpacity(Math.max(0.4, Math.min(1.0, opacity)));
  updateSettings({ widgetOpacity: opacity });
}

function getWidgetWindow() {
  return widgetWin;
}

module.exports = {
  createWidgetWindow,
  showWidget,
  hideWidget,
  setWidgetCompact,
  setWidgetOpacity,
  getWidgetWindow
};
