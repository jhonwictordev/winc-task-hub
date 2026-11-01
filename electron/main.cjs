const { app, BrowserWindow, Tray, Menu, nativeImage, globalShortcut, ipcMain, session } = require('electron');
const path = require('path');
const fs = require('fs');

// Repositories & Database
const { initDatabase, closeDatabase } = require('./db/database.cjs');
const { seedInitialDataIfEmpty } = require('./db/seed.cjs');
const tasksRepo = require('./db/tasksRepo.cjs');
const clientsRepo = require('./db/clientsRepo.cjs');
const prospectionRepo = require('./db/prospectionRepo.cjs');
const settingsRepo = require('./db/settingsRepo.cjs');

// Windows & Schedulers
const {
  createMainWindow,
  getMainWindow,
  showMainWindow,
  hideMainWindow,
  toggleMainWindow,
  setMainWindowAlwaysOnTop
} = require('./windows/mainWindow.cjs');

const {
  createWidgetWindow,
  showWidget,
  hideWidget,
  setWidgetCompact,
  setWidgetOpacity,
  getWidgetWindow
} = require('./windows/widgetWindow.cjs');

const { createQuickCaptureWindow, showQuickCapture, hideQuickCapture } = require('./windows/quickCaptureWindow.cjs');
const reminderScheduler = require('./scheduler/reminderScheduler.cjs');
const notificationService = require('./services/notificationService.cjs');

const isDev = process.env.NODE_ENV === 'development';
const devServerUrl = process.env.VITE_DEV_SERVER_URL || null;

let tray = null;
let isQuitting = false;
let currentToggleShortcut = null;

// 1. Single Instance Lock
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  console.log('[App] Outra instância do WINC TASK HUB já está em execução. Encerrando duplicata.');
  app.quit();
} else {
  app.on('second-instance', () => {
    // When the user clicks the app icon or runs the binary while running, bring the main window up
    const win = showMainWindow(true);
    if (win) {
      if (win.isMinimized()) win.restore();
      win.show();
      win.focus();
    }
  });
}

function broadcastToAllWindows(channel, ...args) {
  const windows = BrowserWindow.getAllWindows();
  for (const win of windows) {
    if (!win.isDestroyed()) {
      win.webContents.send(channel, ...args);
    }
  }
}

// Generate or retrieve the Tray icon
function createDefaultTrayIcon() {
  const iconPath = path.join(__dirname, '../resources/tray-icon.png');
  if (fs.existsSync(iconPath)) {
    return nativeImage.createFromPath(iconPath);
  }
  // Fallback: 16x16 purple square native image buffer
  const size = 16;
  const buffer = Buffer.alloc(size * size * 4);
  for (let i = 0; i < size * size; i++) {
    buffer[i * 4] = 147;     // R
    buffer[i * 4 + 1] = 51;  // G
    buffer[i * 4 + 2] = 234; // B
    buffer[i * 4 + 3] = 255; // A
  }
  return nativeImage.createFromBuffer(buffer, { width: size, height: size });
}

function updateTrayMenu() {
  if (!tray) return;
  const settings = settingsRepo.getSettings();
  const mainWin = getMainWindow();
  const isVisible = mainWin && !mainWin.isDestroyed() && mainWin.isVisible();

  const contextMenu = Menu.buildFromTemplate([
    {
      label: isVisible ? 'Ocultar WINC Task Hub' : 'Abrir WINC Task Hub',
      click: () => {
        toggleMainWindow();
      }
    },
    {
      label: 'Nova Tarefa Rápida (Ctrl+Shift+Espaço)',
      click: () => {
        showQuickCapture();
      }
    },
    { type: 'separator' },
    {
      label: 'Sempre Visível (Always on Top)',
      type: 'checkbox',
      checked: Boolean(settings.alwaysOnTop),
      click: (menuItem) => {
        const updated = settingsRepo.updateSettings({ alwaysOnTop: menuItem.checked });
        setMainWindowAlwaysOnTop(menuItem.checked);
        broadcastToAllWindows('settings-changed', updated);
      }
    },
    {
      label: 'Modo Não Perturbe',
      type: 'checkbox',
      checked: Boolean(settings.doNotDisturb),
      click: (menuItem) => {
        const updated = settingsRepo.updateSettings({ doNotDisturb: menuItem.checked });
        broadcastToAllWindows('settings-changed', updated);
      }
    },
    { type: 'separator' },
    {
      label: 'Configurações',
      click: () => {
        const win = showMainWindow(true);
        if (win) {
          win.webContents.send('navigate-to', 'settings');
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Encerrar WINC Task Hub',
      click: () => {
        isQuitting = true;
        const currentWin = getMainWindow();
        if (currentWin) currentWin.appIsQuitting = true;
        const widgetWin = getWidgetWindow();
        if (widgetWin) widgetWin.appIsQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);
}

function setupTray() {
  try {
    const icon = createDefaultTrayIcon();
    tray = new Tray(icon);
    tray.setToolTip('WINC TASK HUB');

    updateTrayMenu();

    // Single-click on Tray icon toggles panel
    tray.on('click', () => {
      toggleMainWindow();
      updateTrayMenu();
    });

    // Double-click also toggles panel
    tray.on('double-click', () => {
      toggleMainWindow();
      updateTrayMenu();
    });
  } catch (err) {
    console.warn('[Tray] Setup error (ignoring if headless):', err.message);
  }
}

function registerGlobalToggleShortcut(shortcutStr = 'CommandOrControl+Shift+T') {
  if (currentToggleShortcut) {
    try {
      globalShortcut.unregister(currentToggleShortcut);
    } catch (e) {}
    currentToggleShortcut = null;
  }

  if (!shortcutStr) return { success: true };

  try {
    const isRegistered = globalShortcut.isRegistered(shortcutStr);
    if (isRegistered) {
      console.warn(`[Shortcut] Conflito detectado: "${shortcutStr}" já está registrado por outro processo.`);
      settingsRepo.logError('warn', 'Conflito de atalho global', `O atalho "${shortcutStr}" já está em uso por outro aplicativo.`);
      return { success: false, error: `Conflito: atalho "${shortcutStr}" já em uso por outro aplicativo.` };
    }

    const ok = globalShortcut.register(shortcutStr, () => {
      toggleMainWindow();
    });

    if (!ok) {
      console.warn(`[Shortcut] Falha ao registrar atalho "${shortcutStr}".`);
      return { success: false, error: `Não foi possível registrar o atalho "${shortcutStr}".` };
    }

    currentToggleShortcut = shortcutStr;
    console.log(`[Shortcut] Atalho global registrado com sucesso: ${shortcutStr}`);
    return { success: true };
  } catch (err) {
    console.error(`[Shortcut] Erro ao registrar atalho:`, err.message);
    return { success: false, error: err.message };
  }
}

// Security: Validate IPC sender to ensure requests only originate from trusted local application frames
function validateIpcSender(event) {
  if (!event || !event.senderFrame) return true;
  const frameUrl = event.senderFrame.url;
  if (!frameUrl) return false;
  if (isDev && devServerUrl && frameUrl.startsWith(devServerUrl)) return true;
  return frameUrl.startsWith('file://');
}

function registerIPCHandlers() {
  // Tasks
  ipcMain.handle('tasks:getAll', (event) => {
    if (!validateIpcSender(event)) throw new Error('Unauthorized IPC sender');
    return tasksRepo.getAllTasks();
  });

  ipcMain.handle('tasks:getById', (event, id) => {
    if (!validateIpcSender(event)) throw new Error('Unauthorized IPC sender');
    if (typeof id !== 'string' || !id) throw new Error('Invalid task ID');
    return tasksRepo.getTaskById(id);
  });

  ipcMain.handle('tasks:getByDate', (event, dateStr) => {
    if (!validateIpcSender(event)) throw new Error('Unauthorized IPC sender');
    if (typeof dateStr !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) throw new Error('Invalid date format');
    return tasksRepo.getTasksByDate(dateStr);
  });

  ipcMain.handle('tasks:create', (event, data) => {
    if (!validateIpcSender(event)) throw new Error('Unauthorized IPC sender');
    if (!data || typeof data !== 'object') throw new Error('Invalid task data');
    const res = tasksRepo.createTask(data);
    notificationService.notifyNewTask(res);
    broadcastToAllWindows('tasks-changed');
    return res;
  });

  ipcMain.handle('tasks:update', (event, id, data) => {
    if (!validateIpcSender(event)) throw new Error('Unauthorized IPC sender');
    if (typeof id !== 'string' || !id || !data || typeof data !== 'object') throw new Error('Invalid update parameters');
    const res = tasksRepo.updateTask(id, data);
    broadcastToAllWindows('tasks-changed');
    return res;
  });

  ipcMain.handle('tasks:delete', (event, id) => {
    if (!validateIpcSender(event)) throw new Error('Unauthorized IPC sender');
    if (typeof id !== 'string' || !id) throw new Error('Invalid task ID');
    const res = tasksRepo.deleteTask(id);
    broadcastToAllWindows('tasks-changed');
    return res;
  });

  ipcMain.handle('tasks:duplicate', (event, id) => {
    if (!validateIpcSender(event)) throw new Error('Unauthorized IPC sender');
    if (typeof id !== 'string' || !id) throw new Error('Invalid task ID');
    const res = tasksRepo.duplicateTask(id);
    broadcastToAllWindows('tasks-changed');
    return res;
  });

  ipcMain.handle('tasks:conclude', (event, id) => {
    if (!validateIpcSender(event)) throw new Error('Unauthorized IPC sender');
    if (typeof id !== 'string' || !id) throw new Error('Invalid task ID');
    const res = tasksRepo.concludeTask(id);
    broadcastToAllWindows('tasks-changed');
    return res;
  });

  ipcMain.handle('tasks:snooze', (event, id, newDate, newTime) => {
    if (!validateIpcSender(event)) throw new Error('Unauthorized IPC sender');
    if (typeof id !== 'string' || !id || typeof newDate !== 'string') throw new Error('Invalid snooze parameters');
    const res = tasksRepo.snoozeTask(id, newDate, newTime);
    broadcastToAllWindows('tasks-changed');
    return res;
  });

  ipcMain.handle('tasks:unpin', (event, id) => {
    if (!validateIpcSender(event)) throw new Error('Unauthorized IPC sender');
    if (typeof id !== 'string' || !id) throw new Error('Invalid task ID');
    const res = tasksRepo.unpinTask(id);
    broadcastToAllWindows('tasks-changed');
    return res;
  });

  ipcMain.handle('tasks:pin', (event, id) => {
    if (!validateIpcSender(event)) throw new Error('Unauthorized IPC sender');
    if (typeof id !== 'string' || !id) throw new Error('Invalid task ID');
    const res = tasksRepo.pinTask(id);
    broadcastToAllWindows('tasks-changed');
    return res;
  });

  ipcMain.handle('tasks:getPinned', (event) => {
    if (!validateIpcSender(event)) throw new Error('Unauthorized IPC sender');
    return tasksRepo.getCurrentlyPinnedTasks();
  });

  // Clients
  ipcMain.handle('clients:getAll', (event) => {
    if (!validateIpcSender(event)) throw new Error('Unauthorized IPC sender');
    return clientsRepo.getAllClients();
  });

  ipcMain.handle('clients:create', (event, data) => {
    if (!validateIpcSender(event)) throw new Error('Unauthorized IPC sender');
    if (!data || typeof data !== 'object') throw new Error('Invalid client data');
    return clientsRepo.createClient(data);
  });

  ipcMain.handle('clients:update', (event, id, data) => {
    if (!validateIpcSender(event)) throw new Error('Unauthorized IPC sender');
    if (typeof id !== 'string' || !id || !data || typeof data !== 'object') throw new Error('Invalid update parameters');
    return clientsRepo.updateClient(id, data);
  });

  ipcMain.handle('clients:delete', (event, id) => {
    if (!validateIpcSender(event)) throw new Error('Unauthorized IPC sender');
    if (typeof id !== 'string' || !id) throw new Error('Invalid client ID');
    return clientsRepo.deleteClient(id);
  });

  // Releases
  ipcMain.handle('releases:getAll', (event) => {
    if (!validateIpcSender(event)) throw new Error('Unauthorized IPC sender');
    return clientsRepo.getAllReleases();
  });

  ipcMain.handle('releases:create', (event, data, createTasks) => {
    if (!validateIpcSender(event)) throw new Error('Unauthorized IPC sender');
    if (!data || typeof data !== 'object') throw new Error('Invalid release data');
    const res = clientsRepo.createRelease(data, createTasks);
    if (createTasks) broadcastToAllWindows('tasks-changed');
    return res;
  });

  ipcMain.handle('releases:update', (event, id, data) => {
    if (!validateIpcSender(event)) throw new Error('Unauthorized IPC sender');
    if (typeof id !== 'string' || !id || !data || typeof data !== 'object') throw new Error('Invalid update parameters');
    return clientsRepo.updateRelease(id, data);
  });

  ipcMain.handle('releases:delete', (event, id) => {
    if (!validateIpcSender(event)) throw new Error('Unauthorized IPC sender');
    if (typeof id !== 'string' || !id) throw new Error('Invalid release ID');
    return clientsRepo.deleteRelease(id);
  });

  // Leads
  ipcMain.handle('leads:getAll', (event, projectId) => {
    if (!validateIpcSender(event)) throw new Error('Unauthorized IPC sender');
    return prospectionRepo.getAllLeads(projectId);
  });

  ipcMain.handle('leads:create', (event, data) => {
    if (!validateIpcSender(event)) throw new Error('Unauthorized IPC sender');
    if (!data || typeof data !== 'object') throw new Error('Invalid lead data');
    const res = prospectionRepo.createLead(data);
    if (data.reminderSet && data.nextFollowUpDate) {
      broadcastToAllWindows('tasks-changed');
    }
    return res;
  });

  ipcMain.handle('leads:update', (event, id, data) => {
    if (!validateIpcSender(event)) throw new Error('Unauthorized IPC sender');
    if (typeof id !== 'string' || !id || !data || typeof data !== 'object') throw new Error('Invalid update parameters');
    return prospectionRepo.updateLead(id, data);
  });

  ipcMain.handle('leads:delete', (event, id) => {
    if (!validateIpcSender(event)) throw new Error('Unauthorized IPC sender');
    if (typeof id !== 'string' || !id) throw new Error('Invalid lead ID');
    return prospectionRepo.deleteLead(id);
  });

  ipcMain.handle('leads:getStats', (event, todayStr, monthPrefix) => {
    if (!validateIpcSender(event)) throw new Error('Unauthorized IPC sender');
    return prospectionRepo.getProspectionStats(todayStr, monthPrefix);
  });

  // Settings & Logs
  ipcMain.handle('settings:get', (event) => {
    if (!validateIpcSender(event)) throw new Error('Unauthorized IPC sender');
    return settingsRepo.getSettings();
  });

  ipcMain.handle('settings:update', (event, newSettings) => {
    if (!validateIpcSender(event)) throw new Error('Unauthorized IPC sender');
    if (!newSettings || typeof newSettings !== 'object') throw new Error('Invalid settings object');
    const updated = settingsRepo.updateSettings(newSettings);
    // Auto-launch setting
    if (newSettings.startWithWindows !== undefined) {
      app.setLoginItemSettings({
        openAtLogin: Boolean(newSettings.startWithWindows),
        path: process.execPath,
        args: ['--hidden']
      });
    }
    // Always-on-top setting
    if (newSettings.alwaysOnTop !== undefined) {
      setMainWindowAlwaysOnTop(newSettings.alwaysOnTop);
    }
    // Global shortcut setting
    if (newSettings.globalShortcutToggle !== undefined && typeof newSettings.globalShortcutToggle === 'string') {
      registerGlobalToggleShortcut(newSettings.globalShortcutToggle);
    }
    updateTrayMenu();
    broadcastToAllWindows('settings-changed', updated);
    return updated;
  });

  ipcMain.handle('logs:getAll', (event) => {
    if (!validateIpcSender(event)) throw new Error('Unauthorized IPC sender');
    return settingsRepo.getErrorLogs();
  });

  ipcMain.handle('logs:clear', (event) => {
    if (!validateIpcSender(event)) throw new Error('Unauthorized IPC sender');
    return settingsRepo.clearErrorLogs();
  });

  // Backups
  ipcMain.handle('backup:export', (event) => {
    if (!validateIpcSender(event)) throw new Error('Unauthorized IPC sender');
    return settingsRepo.exportBackupData();
  });

  ipcMain.handle('backup:import', (event, backupJson) => {
    if (!validateIpcSender(event)) throw new Error('Unauthorized IPC sender');
    const res = settingsRepo.importBackupData(backupJson);
    broadcastToAllWindows('tasks-changed');
    return res;
  });

  ipcMain.handle('backup:exportCSV', (event) => {
    if (!validateIpcSender(event)) throw new Error('Unauthorized IPC sender');
    return settingsRepo.exportTasksToCSV();
  });

  // Window Controls
  ipcMain.handle('window:toggleMain', (event) => {
    if (!validateIpcSender(event)) throw new Error('Unauthorized IPC sender');
    return toggleMainWindow();
  });

  ipcMain.handle('window:openMain', (event) => {
    if (!validateIpcSender(event)) throw new Error('Unauthorized IPC sender');
    showMainWindow(true);
    return true;
  });

  ipcMain.handle('window:hideMain', (event) => {
    if (!validateIpcSender(event)) throw new Error('Unauthorized IPC sender');
    hideMainWindow();
    return true;
  });

  ipcMain.handle('window:setAlwaysOnTop', (event, enabled) => {
    if (!validateIpcSender(event)) throw new Error('Unauthorized IPC sender');
    setMainWindowAlwaysOnTop(Boolean(enabled));
    return true;
  });

  ipcMain.handle('window:focusTask', (event, taskId) => {
    if (!validateIpcSender(event)) throw new Error('Unauthorized IPC sender');
    if (typeof taskId !== 'string' || !taskId) throw new Error('Invalid task ID');
    const mainWin = showMainWindow(true);
    if (mainWin) {
      mainWin.webContents.send('focus-task', taskId);
    }
  });

  // Shortcut Verification
  ipcMain.handle('shortcut:checkConflict', (event, shortcutStr) => {
    if (!validateIpcSender(event)) throw new Error('Unauthorized IPC sender');
    if (typeof shortcutStr !== 'string') return { conflict: false };
    try {
      const isReg = globalShortcut.isRegistered(shortcutStr);
      return { conflict: isReg };
    } catch (e) {
      return { conflict: true, error: e.message };
    }
  });

  // Widget Controls
  ipcMain.handle('widget:setCompact', (event, isCompact) => {
    if (!validateIpcSender(event)) throw new Error('Unauthorized IPC sender');
    return setWidgetCompact(Boolean(isCompact));
  });

  ipcMain.handle('widget:setOpacity', (event, opacity) => {
    if (!validateIpcSender(event)) throw new Error('Unauthorized IPC sender');
    const clamped = Math.max(0.1, Math.min(1.0, Number(opacity) || 0.95));
    return setWidgetOpacity(clamped);
  });

  ipcMain.handle('widget:hide', (event) => {
    if (!validateIpcSender(event)) throw new Error('Unauthorized IPC sender');
    return hideWidget();
  });

  ipcMain.handle('widget:show', (event) => {
    if (!validateIpcSender(event)) throw new Error('Unauthorized IPC sender');
    const pinned = tasksRepo.getCurrentlyPinnedTasks();
    showWidget(pinned);
  });

  ipcMain.handle('quickCapture:hide', (event) => {
    if (!validateIpcSender(event)) throw new Error('Unauthorized IPC sender');
    return hideQuickCapture();
  });

  // Debug/Test Midnight Rollover Simulation
  ipcMain.handle('debug:simulateMidnight', (_, dateStr) => {
    reminderScheduler.simulateDateRollover(dateStr);
    return true;
  });
}

app.whenReady().then(() => {
  // Security: Deny all unneeded browser/hardware permission requests
  try {
    session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
      callback(false);
    });
  } catch (e) {}

  // 0. Set AppUserModelId for native Windows Toast Notifications
  try {
    app.setAppUserModelId('com.winc.taskhub');
  } catch (e) {}

  // 1. Initialize SQLite Database & Seed
  initDatabase();
  seedInitialDataIfEmpty();

  // 2. Register IPC handlers
  registerIPCHandlers();

  // 3. Create Windows
  // Notice: mainWindow will remain hidden if startMinimizedToTray is true (default)
  createMainWindow(isDev, devServerUrl);
  createQuickCaptureWindow(isDev, devServerUrl);

  // 4. Setup Tray
  setupTray();

  // 5. Global Shortcut for Panel Toggle (Ctrl+Shift+T) and Quick Capture (Ctrl+Shift+Space)
  const currentSettings = settingsRepo.getSettings();
  registerGlobalToggleShortcut(currentSettings.globalShortcutToggle || 'CommandOrControl+Shift+T');

  try {
    globalShortcut.register('CommandOrControl+Shift+Space', () => {
      showQuickCapture();
    });
  } catch (e) {
    console.warn('Failed to register global quick capture shortcut:', e);
  }

  // 6. Start Persistent Reminder Scheduler (runs quietly in background)
  reminderScheduler.startScheduler();
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
  reminderScheduler.stopScheduler();
  closeDatabase();
});

app.on('window-all-closed', () => {
  // If minimizeToTray is configured, do not quit
  const settings = settingsRepo.getSettings();
  if (!settings.minimizeToTrayOnClose && isQuitting) {
    app.quit();
  }
});
