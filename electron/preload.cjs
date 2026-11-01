const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Tasks
  getAllTasks: () => ipcRenderer.invoke('tasks:getAll'),
  getTaskById: (id) => ipcRenderer.invoke('tasks:getById', id),
  getTasksByDate: (dateStr) => ipcRenderer.invoke('tasks:getByDate', dateStr),
  createTask: (data) => ipcRenderer.invoke('tasks:create', data),
  updateTask: (id, data) => ipcRenderer.invoke('tasks:update', id, data),
  deleteTask: (id) => ipcRenderer.invoke('tasks:delete', id),
  duplicateTask: (id) => ipcRenderer.invoke('tasks:duplicate', id),
  concludeTask: (id) => ipcRenderer.invoke('tasks:conclude', id),
  snoozeTask: (id, newDate, newTime) => ipcRenderer.invoke('tasks:snooze', id, newDate, newTime),
  unpinTask: (id) => ipcRenderer.invoke('tasks:unpin', id),
  pinTask: (id) => ipcRenderer.invoke('tasks:pin', id),
  getCurrentlyPinnedTasks: () => ipcRenderer.invoke('tasks:getPinned'),

  // Clients (Winc)
  getAllClients: () => ipcRenderer.invoke('clients:getAll'),
  createClient: (data) => ipcRenderer.invoke('clients:create', data),
  updateClient: (id, data) => ipcRenderer.invoke('clients:update', id, data),
  deleteClient: (id) => ipcRenderer.invoke('clients:delete', id),

  // Releases (EVILBEAR.JPG)
  getAllReleases: () => ipcRenderer.invoke('releases:getAll'),
  createRelease: (data, createLinkedTasks) => ipcRenderer.invoke('releases:create', data, createLinkedTasks),
  updateRelease: (id, data) => ipcRenderer.invoke('releases:update', id, data),
  deleteRelease: (id) => ipcRenderer.invoke('releases:delete', id),

  // Leads & Prospection
  getAllLeads: (projectId) => ipcRenderer.invoke('leads:getAll', projectId),
  createLead: (data) => ipcRenderer.invoke('leads:create', data),
  updateLead: (id, data) => ipcRenderer.invoke('leads:update', id, data),
  deleteLead: (id) => ipcRenderer.invoke('leads:delete', id),
  getProspectionStats: (todayStr, monthPrefix) => ipcRenderer.invoke('leads:getStats', todayStr, monthPrefix),

  // Settings, Logs & Backups
  getSettings: () => ipcRenderer.invoke('settings:get'),
  updateSettings: (newSettings) => ipcRenderer.invoke('settings:update', newSettings),
  getErrorLogs: () => ipcRenderer.invoke('logs:getAll'),
  clearErrorLogs: () => ipcRenderer.invoke('logs:clear'),
  exportBackup: () => ipcRenderer.invoke('backup:export'),
  importBackup: (backupJson) => ipcRenderer.invoke('backup:import', backupJson),
  exportCSV: () => ipcRenderer.invoke('backup:exportCSV'),

  // Window Controls & Shortcuts
  openMainWindow: () => ipcRenderer.invoke('window:openMain'),
  hideMainWindow: () => ipcRenderer.invoke('window:hideMain'),
  toggleMainWindow: () => ipcRenderer.invoke('window:toggleMain'),
  setAlwaysOnTop: (enabled) => ipcRenderer.invoke('window:setAlwaysOnTop', enabled),
  focusTaskInMain: (taskId) => ipcRenderer.invoke('window:focusTask', taskId),
  checkShortcutConflict: (shortcutStr) => ipcRenderer.invoke('shortcut:checkConflict', shortcutStr),
  setWidgetCompact: (isCompact) => ipcRenderer.invoke('widget:setCompact', isCompact),
  setWidgetOpacity: (opacity) => ipcRenderer.invoke('widget:setOpacity', opacity),
  hideWidget: () => ipcRenderer.invoke('widget:hide'),
  showWidget: () => ipcRenderer.invoke('widget:show'),
  hideQuickCapture: () => ipcRenderer.invoke('quickCapture:hide'),
  simulateMidnight: (dateStr) => ipcRenderer.invoke('debug:simulateMidnight', dateStr),

  // Event Listeners (renderer side)
  onPinnedTasksUpdated: (callback) => {
    const handler = (event, tasks) => callback(tasks);
    ipcRenderer.on('pinned-tasks-updated', handler);
    return () => ipcRenderer.removeListener('pinned-tasks-updated', handler);
  },
  onTaskFocusRequested: (callback) => {
    const handler = (event, taskId) => callback(taskId);
    ipcRenderer.on('focus-task', handler);
    return () => ipcRenderer.removeListener('focus-task', handler);
  },
  onTasksChanged: (callback) => {
    const handler = () => callback();
    ipcRenderer.on('tasks-changed', handler);
    return () => ipcRenderer.removeListener('tasks-changed', handler);
  },
  onSettingsChanged: (callback) => {
    const handler = (event, settings) => callback(settings);
    ipcRenderer.on('settings-changed', handler);
    return () => ipcRenderer.removeListener('settings-changed', handler);
  },
  onNavigateTo: (callback) => {
    const handler = (event, viewName) => callback(viewName);
    ipcRenderer.on('navigate-to', handler);
    return () => ipcRenderer.removeListener('navigate-to', handler);
  }
});
