const { getDatabase } = require('./database.cjs');
const { randomUUID } = require('crypto');

function mapRowToTask(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    projectId: row.project_id,
    category: row.category,
    clientId: row.client_id || undefined,
    clientName: row.client_name || undefined,
    targetDate: row.target_date,
    targetTime: row.target_time || undefined,
    deliveryDate: row.delivery_date || undefined,
    priority: row.priority || 'media',
    status: row.status || 'nao_iniciada',
    checklist: row.checklist_json ? JSON.parse(row.checklist_json) : [],
    attachments: row.attachments_json ? JSON.parse(row.attachments_json) : [],
    recurrence: row.recurrence || 'none',
    recurrenceDays: row.recurrence_days_json ? JSON.parse(row.recurrence_days_json) : [],
    reminderEnabled: Boolean(row.reminder_enabled),
    reminderTime: row.reminder_time || '00:00',
    isPinned: Boolean(row.is_pinned),
    pinnedDismissedAt: row.pinned_dismissed_at || null,
    notifiedAt: row.notified_at || null,
    completedAt: row.completed_at || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function getAllTasks() {
  const db = getDatabase();
  const rows = db.prepare('SELECT * FROM tasks ORDER BY target_date ASC, priority DESC').all();
  return rows.map(mapRowToTask);
}

function getTaskById(id) {
  const db = getDatabase();
  const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  return mapRowToTask(row);
}

function getTasksByDate(dateStr) {
  const db = getDatabase();
  const rows = db.prepare('SELECT * FROM tasks WHERE target_date = ? ORDER BY priority DESC, created_at ASC').all(dateStr);
  return rows.map(mapRowToTask);
}

function getTasksByDateRange(startDate, endDate) {
  const db = getDatabase();
  const rows = db.prepare('SELECT * FROM tasks WHERE target_date >= ? AND target_date <= ? ORDER BY target_date ASC, priority DESC').all(startDate, endDate);
  return rows.map(mapRowToTask);
}

function createTask(taskData) {
  const db = getDatabase();
  const id = taskData.id || randomUUID();
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO tasks (
      id, title, description, project_id, category, client_id, client_name,
      target_date, target_time, delivery_date, priority, status,
      checklist_json, attachments_json, recurrence, recurrence_days_json,
      reminder_enabled, reminder_time, is_pinned, pinned_dismissed_at,
      notified_at, completed_at, created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?
    )
  `);

  stmt.run(
    id,
    taskData.title,
    taskData.description || '',
    taskData.projectId || 'winc',
    taskData.category || 'Geral',
    taskData.clientId || null,
    taskData.clientName || null,
    taskData.targetDate,
    taskData.targetTime || null,
    taskData.deliveryDate || null,
    taskData.priority || 'media',
    taskData.status || 'nao_iniciada',
    JSON.stringify(taskData.checklist || []),
    JSON.stringify(taskData.attachments || []),
    taskData.recurrence || 'none',
    JSON.stringify(taskData.recurrenceDays || []),
    taskData.reminderEnabled !== false ? 1 : 0,
    taskData.reminderTime || '00:00',
    taskData.isPinned ? 1 : 0,
    taskData.pinnedDismissedAt || null,
    taskData.notifiedAt || null,
    taskData.completedAt || null,
    taskData.createdAt || now,
    now
  );

  return getTaskById(id);
}

function updateTask(id, taskData) {
  const db = getDatabase();
  const now = new Date().toISOString();

  const current = getTaskById(id);
  if (!current) {
    throw new Error(`Task with id ${id} not found`);
  }

  const stmt = db.prepare(`
    UPDATE tasks SET
      title = COALESCE(?, title),
      description = COALESCE(?, description),
      project_id = COALESCE(?, project_id),
      category = COALESCE(?, category),
      client_id = ?,
      client_name = ?,
      target_date = COALESCE(?, target_date),
      target_time = ?,
      delivery_date = ?,
      priority = COALESCE(?, priority),
      status = COALESCE(?, status),
      checklist_json = COALESCE(?, checklist_json),
      attachments_json = COALESCE(?, attachments_json),
      recurrence = COALESCE(?, recurrence),
      recurrence_days_json = COALESCE(?, recurrence_days_json),
      reminder_enabled = COALESCE(?, reminder_enabled),
      reminder_time = COALESCE(?, reminder_time),
      is_pinned = COALESCE(?, is_pinned),
      pinned_dismissed_at = ?,
      notified_at = ?,
      completed_at = ?,
      updated_at = ?
    WHERE id = ?
  `);

  stmt.run(
    taskData.title !== undefined ? taskData.title : null,
    taskData.description !== undefined ? taskData.description : null,
    taskData.projectId !== undefined ? taskData.projectId : null,
    taskData.category !== undefined ? taskData.category : null,
    taskData.clientId !== undefined ? taskData.clientId : current.clientId || null,
    taskData.clientName !== undefined ? taskData.clientName : current.clientName || null,
    taskData.targetDate !== undefined ? taskData.targetDate : null,
    taskData.targetTime !== undefined ? taskData.targetTime : current.targetTime || null,
    taskData.deliveryDate !== undefined ? taskData.deliveryDate : current.deliveryDate || null,
    taskData.priority !== undefined ? taskData.priority : null,
    taskData.status !== undefined ? taskData.status : null,
    taskData.checklist !== undefined ? JSON.stringify(taskData.checklist) : null,
    taskData.attachments !== undefined ? JSON.stringify(taskData.attachments) : null,
    taskData.recurrence !== undefined ? taskData.recurrence : null,
    taskData.recurrenceDays !== undefined ? JSON.stringify(taskData.recurrenceDays) : null,
    taskData.reminderEnabled !== undefined ? (taskData.reminderEnabled ? 1 : 0) : null,
    taskData.reminderTime !== undefined ? taskData.reminderTime : null,
    taskData.isPinned !== undefined ? (taskData.isPinned ? 1 : 0) : null,
    taskData.pinnedDismissedAt !== undefined ? taskData.pinnedDismissedAt : current.pinnedDismissedAt || null,
    taskData.notifiedAt !== undefined ? taskData.notifiedAt : current.notifiedAt || null,
    taskData.completedAt !== undefined ? taskData.completedAt : current.completedAt || null,
    now,
    id
  );

  return getTaskById(id);
}

function deleteTask(id) {
  const db = getDatabase();
  const task = getTaskById(id);
  db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
  return task;
}

function duplicateTask(id) {
  const original = getTaskById(id);
  if (!original) throw new Error('Task not found');
  const copyData = {
    ...original,
    id: randomUUID(),
    title: `${original.title} (Cópia)`,
    status: 'nao_iniciada',
    isPinned: false,
    pinnedDismissedAt: null,
    notifiedAt: null,
    completedAt: null,
    createdAt: new Date().toISOString()
  };
  return createTask(copyData);
}

// Calculate the next recurrence date
function calculateNextRecurrenceDate(currentDateStr, recurrence, recurrenceDays = []) {
  const [year, month, day] = currentDateStr.split('-').map(Number);
  const current = new Date(year, month - 1, day);

  if (recurrence === 'daily') {
    current.setDate(current.getDate() + 1);
  } else if (recurrence === 'weekly') {
    current.setDate(current.getDate() + 7);
  } else if (recurrence === 'biweekly') {
    current.setDate(current.getDate() + 14);
  } else if (recurrence === 'monthly') {
    current.setMonth(current.getMonth() + 1);
  } else if (recurrence === 'specific_days' && recurrenceDays && recurrenceDays.length > 0) {
    let daysToAdd = 1;
    let found = false;
    for (let i = 1; i <= 7; i++) {
      const nextDate = new Date(current);
      nextDate.setDate(current.getDate() + i);
      const dayOfWeek = nextDate.getDay();
      if (recurrenceDays.includes(dayOfWeek)) {
        current.setDate(current.getDate() + i);
        found = true;
        break;
      }
    }
    if (!found) current.setDate(current.getDate() + 7);
  } else {
    return null;
  }

  const y = current.getFullYear();
  const m = String(current.getMonth() + 1).padStart(2, '0');
  const d = String(current.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function concludeTask(id) {
  const task = getTaskById(id);
  if (!task) throw new Error('Task not found');

  const now = new Date().toISOString();
  updateTask(id, {
    status: 'concluida',
    completedAt: now,
    isPinned: false,
    pinnedDismissedAt: now
  });

  // If recurring, generate next occurrence independently
  if (task.recurrence && task.recurrence !== 'none') {
    const nextDate = calculateNextRecurrenceDate(task.targetDate, task.recurrence, task.recurrenceDays);
    if (nextDate) {
      createTask({
        title: task.title,
        description: task.description,
        projectId: task.projectId,
        category: task.category,
        clientId: task.clientId,
        clientName: task.clientName,
        targetDate: nextDate,
        targetTime: task.targetTime,
        deliveryDate: task.deliveryDate,
        priority: task.priority,
        status: 'nao_iniciada',
        checklist: task.checklist.map(item => ({ ...item, completed: false })),
        attachments: task.attachments,
        recurrence: task.recurrence,
        recurrenceDays: task.recurrenceDays,
        reminderEnabled: task.reminderEnabled,
        reminderTime: task.reminderTime,
        isPinned: false,
        pinnedDismissedAt: null,
        notifiedAt: null,
        completedAt: null
      });
    }
  }

  return getTaskById(id);
}

function snoozeTask(id, newDateStr, newTimeStr = null) {
  const task = getTaskById(id);
  if (!task) throw new Error('Task not found');

  return updateTask(id, {
    targetDate: newDateStr,
    targetTime: newTimeStr || task.targetTime,
    isPinned: false,
    pinnedDismissedAt: new Date().toISOString(),
    notifiedAt: null // Allows reminder to re-trigger on new date
  });
}

function unpinTask(id) {
  return updateTask(id, {
    isPinned: false,
    pinnedDismissedAt: new Date().toISOString()
  });
}

function pinTask(id) {
  return updateTask(id, {
    isPinned: true,
    pinnedDismissedAt: null
  });
}

function getCurrentlyPinnedTasks() {
  const db = getDatabase();
  const rows = db.prepare(`
    SELECT * FROM tasks
    WHERE is_pinned = 1 AND status != 'concluida'
    ORDER BY priority DESC, target_date ASC
  `).all();
  return rows.map(mapRowToTask);
}

// Critical Midnight & Persistent Reminder query:
// Detects tasks for today or overdue that should be pinned to the sticky floating window.
function getDueTasksForDay(dateStr) {
  const db = getDatabase();
  // Returns tasks scheduled for dateStr or overdue (target_date <= dateStr)
  // that are not concluded, and either not dismissed for today or newly turned over.
  const rows = db.prepare(`
    SELECT * FROM tasks
    WHERE target_date <= ?
      AND status != 'concluida'
      AND reminder_enabled = 1
    ORDER BY
      CASE priority
        WHEN 'urgente' THEN 1
        WHEN 'alta' THEN 2
        WHEN 'media' THEN 3
        ELSE 4
      END ASC,
      target_date ASC
  `).all(dateStr);

  return rows.map(mapRowToTask);
}

// Mark multiple tasks as pinned in floating widget
function markTasksAsPinned(taskIds) {
  if (!taskIds || taskIds.length === 0) return;
  const db = getDatabase();
  const now = new Date().toISOString();
  const stmt = db.prepare(`
    UPDATE tasks
    SET is_pinned = 1, notified_at = COALESCE(notified_at, ?)
    WHERE id = ? AND status != 'concluida'
  `);
  const updateMany = db.transaction((ids) => {
    for (const id of ids) {
      stmt.run(now, id);
    }
  });
  updateMany(taskIds);
}

module.exports = {
  getAllTasks,
  getTaskById,
  getTasksByDate,
  getTasksByDateRange,
  createTask,
  updateTask,
  deleteTask,
  duplicateTask,
  concludeTask,
  snoozeTask,
  unpinTask,
  pinTask,
  getCurrentlyPinnedTasks,
  getDueTasksForDay,
  markTasksAsPinned,
  calculateNextRecurrenceDate
};
