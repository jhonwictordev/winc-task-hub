const { powerMonitor } = require('electron');
const { getDueTasksForDay } = require('../db/tasksRepo.cjs');
const { logError, getSettings } = require('../db/settingsRepo.cjs');
const { notifyDueSoon, notifyOverdue, clearNotificationCache } = require('../services/notificationService.cjs');

let checkIntervalId = null;
let lastKnownDateStr = '';

function getLocalDateString(dateObj = new Date()) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Reconciles tasks for today and any overdue pending tasks.
 * Dispatches non-intrusive OS notifications without opening windows or stealing focus.
 */
function reconcileReminders(overrideDate = null, isRollover = false) {
  try {
    const todayStr = overrideDate || getLocalDateString();
    const settings = getSettings();

    // If notifications are completely disabled or in Do Not Disturb, do not process
    if (settings.notificationsEnabled === false || settings.doNotDisturb === true) {
      return;
    }

    // Fetch tasks scheduled for today or earlier that are not concluded and have reminders enabled
    const dueTasks = getDueTasksForDay(todayStr);

    for (const task of dueTasks) {
      if (task.status === 'concluida') continue;

      if (task.targetDate === todayStr) {
        // Due today: notify discreetly
        notifyDueSoon(task, todayStr);
      } else if (task.targetDate < todayStr) {
        // Overdue: notify discreetly
        notifyOverdue(task, todayStr);
      }
    }
  } catch (err) {
    console.error('[ReminderScheduler] Error reconciling reminders:', err);
    logError('error', 'Falha ao reconciliar lembretes', err.message);
  }
}

/**
 * Checks for date change (midnight 00:00 rollover) and periodic status checks.
 * Runs silently in the background.
 */
function tickCheck() {
  const currentDateStr = getLocalDateString();

  // Midnight rollover detection:
  if (lastKnownDateStr && currentDateStr !== lastKnownDateStr) {
    console.log(`[ReminderScheduler] Virada do dia detectada: ${lastKnownDateStr} -> ${currentDateStr}`);
    lastKnownDateStr = currentDateStr;
    clearNotificationCache(); // Clear cache for new day notifications
    reconcileReminders(currentDateStr, true);
    return;
  }

  lastKnownDateStr = currentDateStr;

  // Regular reconciliation (every 30 seconds, non-intrusive)
  reconcileReminders(currentDateStr, false);
}

function startScheduler() {
  lastKnownDateStr = getLocalDateString();
  console.log('[ReminderScheduler] Scheduler de lembretes silencioso iniciado em', lastKnownDateStr);

  // 1. Initial background check on launch (discreetly notifies if tasks are pending)
  reconcileReminders(lastKnownDateStr, false);

  // 2. Periodic background check interval (every 30 seconds)
  if (checkIntervalId) clearInterval(checkIntervalId);
  checkIntervalId = setInterval(tickCheck, 30000);

  // 3. System Power & Resume Listeners:
  // When system resumes or unlocks, reconcile quietly
  try {
    if (powerMonitor) {
      powerMonitor.on('resume', () => {
        console.log('[ReminderScheduler] Sistema acordou de suspensão. Reconciliando lembretes silenciosamente...');
        reconcileReminders(null, true);
      });

      powerMonitor.on('unlock-screen', () => {
        console.log('[ReminderScheduler] Tela desbloqueada. Reconciliando lembretes silenciosamente...');
        reconcileReminders(null, true);
      });
    }
  } catch (e) {
    console.warn('[ReminderScheduler] powerMonitor indisponível:', e.message);
  }
}

function stopScheduler() {
  if (checkIntervalId) {
    clearInterval(checkIntervalId);
    checkIntervalId = null;
  }
}

// For simulated testing and verification
function simulateDateRollover(testDateStr) {
  console.log('[ReminderScheduler] Simulando virada de data para:', testDateStr);
  lastKnownDateStr = testDateStr;
  clearNotificationCache();
  reconcileReminders(testDateStr, true);
}

module.exports = {
  startScheduler,
  stopScheduler,
  reconcileReminders,
  simulateDateRollover,
  getLocalDateString
};
