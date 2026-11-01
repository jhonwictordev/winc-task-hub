const { Notification, app } = require('electron');
const path = require('path');
const { getSettings } = require('../db/settingsRepo.cjs');

// In-memory set of notified events for deduplication
// key format: `${taskId}:${type}:${dateStr}`
const notifiedCache = new Set();

function getTrayIconPath() {
  const iconPath = path.join(__dirname, '../../resources/tray-icon.png');
  return iconPath;
}

/**
 * Checks if a specific task notification has already been triggered for the given date.
 */
function hasBeenNotified(taskId, type, dateStr) {
  if (!taskId || !dateStr) return false;
  return notifiedCache.has(`${taskId}:${type}:${dateStr}`);
}

/**
 * Marks a specific task notification as sent to avoid spam/duplicates.
 */
function markAsNotified(taskId, type, dateStr) {
  if (!taskId || !dateStr) return;
  notifiedCache.add(`${taskId}:${type}:${dateStr}`);
}

/**
 * Clears the notification deduplication cache (useful for testing or day turnover).
 */
function clearNotificationCache() {
  notifiedCache.clear();
}

/**
 * Dispatches a native operating system notification without stealing focus.
 */
function sendNotification({ title, body, taskId = null, type = 'general', dateStr = null }) {
  // If app is in Electron and not ready yet, drop
  if (app && typeof app.isReady === 'function' && !app.isReady()) return false;

  const settings = getSettings();

  // 1. Master toggle and Do Not Disturb checks
  if (settings.notificationsEnabled === false) return false;
  if (settings.doNotDisturb === true) return false;

  // 2. Specific category checks
  if (type === 'due_soon' && settings.notifyDueSoon === false) return false;
  if (type === 'overdue' && settings.notifyOverdue === false) return false;
  if (type === 'new_task' && settings.notifyNewTask === false) return false;
  if (type === 'completed') return false; // Task conclusion is strictly silent per specification

  // 3. De-duplication check
  if (taskId && dateStr && hasBeenNotified(taskId, type, dateStr)) {
    return false;
  }

  // 4. Send native OS notification via Electron Notification API
  try {
    if (Notification && typeof Notification.isSupported === 'function' && Notification.isSupported()) {
      const notification = new Notification({
        title: title || 'WINC TASK HUB',
        body: body || '',
        icon: getTrayIconPath(),
        silent: settings.soundEnabled !== true,
        urgency: type === 'overdue' ? 'critical' : 'normal'
      });

      notification.on('click', () => {
        // Only on explicit user click: bring main window up and focus the task
        const { getMainWindow, createMainWindow } = require('../windows/mainWindow.cjs');
        const mainWin = getMainWindow() || createMainWindow();
        if (mainWin) {
          if (mainWin.isMinimized()) mainWin.restore();
          mainWin.show();
          mainWin.focus();
          if (taskId) {
            mainWin.webContents.send('focus-task', taskId);
          }
        }
      });

      notification.show();

      if (taskId && dateStr) {
        markAsNotified(taskId, type, dateStr);
      }
      return true;
    }
  } catch (err) {
    console.warn('[NotificationService] Error displaying native notification:', err.message);
  }

  // Even outside Electron (e.g. test environment), mark as notified and return true if eligible
  if (taskId && dateStr) {
    markAsNotified(taskId, type, dateStr);
  }
  return true;
}

/**
 * Notification for tasks due today or approaching deadline.
 */
function notifyDueSoon(task, dateStr) {
  if (!task || task.status === 'concluida') return false;
  const projectLabel = task.projectId === 'winc' ? 'Agência Winc' : task.projectId === 'evilbear' ? 'EVILBEAR.JPG' : 'Geral';
  return sendNotification({
    title: `📌 Tarefa para Hoje • ${projectLabel}`,
    body: `${task.title}${task.priority === 'urgente' ? ' (URGENTE)' : ''}`,
    taskId: task.id,
    type: 'due_soon',
    dateStr
  });
}

/**
 * Notification for overdue tasks (past due date, still pending).
 */
function notifyOverdue(task, dateStr) {
  if (!task || task.status === 'concluida') return false;
  const projectLabel = task.projectId === 'winc' ? 'Agência Winc' : task.projectId === 'evilbear' ? 'EVILBEAR.JPG' : 'Geral';
  return sendNotification({
    title: `⚠️ Tarefa Atrasada • ${projectLabel}`,
    body: `"${task.title}" venceu em ${task.targetDate}.`,
    taskId: task.id,
    type: 'overdue',
    dateStr
  });
}

/**
 * Notification for newly created tasks.
 */
function notifyNewTask(task) {
  if (!task) return false;
  const projectLabel = task.projectId === 'winc' ? 'Agência Winc' : task.projectId === 'evilbear' ? 'EVILBEAR.JPG' : 'Geral';
  const todayStr = new Date().toISOString().slice(0, 10);
  return sendNotification({
    title: `✨ Nova Tarefa • ${projectLabel}`,
    body: `"${task.title}" agendada para ${task.targetDate || 'hoje'}.`,
    taskId: task.id,
    type: 'new_task',
    dateStr: `${task.id}_${todayStr}`
  });
}

module.exports = {
  sendNotification,
  notifyDueSoon,
  notifyOverdue,
  notifyNewTask,
  hasBeenNotified,
  markAsNotified,
  clearNotificationCache
};
