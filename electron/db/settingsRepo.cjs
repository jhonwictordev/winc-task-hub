const { getDatabase } = require('./database.cjs');
const { randomUUID } = require('crypto');

const DEFAULT_SETTINGS = {
  openPanelManually: true,
  startMinimizedToTray: true,
  alwaysOnTop: false,
  doNotDisturb: false,
  globalShortcutToggle: 'CommandOrControl+Shift+T',
  notificationsEnabled: true,
  notifyDueSoon: true,
  notifyOverdue: true,
  notifyNewTask: true,
  startWithWindows: false,
  minimizeToTrayOnClose: true,
  soundEnabled: false,
  defaultReminderTime: '00:00',
  keepRemindersPinned: false,
  widgetOpacity: 0.95,
  widgetCompactMode: false,
  widgetMonitor: 'primary',
  wincColor: '#9333ea',
  evilbearColor: '#dc2626',
  personalColor: '#10b981',
  dailyProspectionGoal: 20,
  monthlyProspectionGoal: 400,
  theme: 'dark'
};

function getSettings() {
  const db = getDatabase();
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get('app_settings');
  if (row && row.value) {
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(row.value) };
    } catch (e) {
      console.error('Error parsing settings:', e);
    }
  }
  return { ...DEFAULT_SETTINGS };
}

function updateSettings(newSettings) {
  const db = getDatabase();
  const current = getSettings();
  const merged = { ...current, ...newSettings };
  db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(
    'app_settings',
    JSON.stringify(merged)
  );
  return merged;
}

function logError(level, message, details = '') {
  try {
    const db = getDatabase();
    const id = randomUUID();
    const timestamp = new Date().toISOString();
    db.prepare(`
      INSERT INTO error_logs (id, timestamp, level, message, details)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, timestamp, level, message, details);
  } catch (e) {
    console.error('Failed to log error to DB:', e);
  }
}

function getErrorLogs(limit = 100) {
  const db = getDatabase();
  return db.prepare('SELECT * FROM error_logs ORDER BY timestamp DESC LIMIT ?').all(limit);
}

function clearErrorLogs() {
  const db = getDatabase();
  db.prepare('DELETE FROM error_logs').run();
  return true;
}

// Full database backup export
function exportBackupData() {
  const db = getDatabase();
  const tasks = db.prepare('SELECT * FROM tasks').all();
  const clients = db.prepare('SELECT * FROM clients').all();
  const releases = db.prepare('SELECT * FROM releases').all();
  const leads = db.prepare('SELECT * FROM leads').all();
  const settings = db.prepare('SELECT * FROM settings').all();

  return {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    tables: {
      tasks,
      clients,
      releases,
      leads,
      settings
    }
  };
}

// Restore data from backup JSON with transaction safety
function importBackupData(backupData) {
  if (!backupData || !backupData.tables) {
    throw new Error('Arquivo de backup inválido ou corrompido.');
  }

  // Security: Strict column whitelists to prevent dynamic SQL injection via manipulated backup payloads
  const ALLOWED_TASK_COLUMNS = new Set([
    'id', 'title', 'description', 'project_id', 'category', 'client_id', 'client_name',
    'target_date', 'target_time', 'due_date', 'priority', 'status', 'is_pinned',
    'recurrence', 'recurrence_days', 'reminder_at_midnight', 'reminder_at_time',
    'reminder_minutes_before', 'links', 'attachments', 'subtasks', 'checklist',
    'created_at', 'updated_at'
  ]);

  const ALLOWED_CLIENT_COLUMNS = new Set([
    'id', 'name', 'company_name', 'segment', 'instagram', 'phone', 'email',
    'contract_value', 'notes', 'status', 'created_at', 'updated_at'
  ]);

  const ALLOWED_RELEASE_COLUMNS = new Set([
    'id', 'title', 'release_date', 'release_time', 'recurrence', 'genre',
    'bpm', 'musical_key', 'formats', 'license_type', 'cover_art_url',
    'audio_preview_url', 'steps_checklist', 'created_at', 'updated_at'
  ]);

  const ALLOWED_LEAD_COLUMNS = new Set([
    'id', 'project_id', 'name', 'type', 'instagram', 'phone', 'email',
    'notes', 'status', 'approach_date', 'next_follow_up_date', 'reminder_set',
    'history', 'created_at', 'updated_at'
  ]);

  const db = getDatabase();
  const restoreTransaction = db.transaction((tables) => {
    // Clear existing tables in a safe ACID transaction
    db.prepare('DELETE FROM tasks').run();
    db.prepare('DELETE FROM clients').run();
    db.prepare('DELETE FROM releases').run();
    db.prepare('DELETE FROM leads').run();

    // Insert tasks with whitelisted columns
    if (Array.isArray(tables.tasks) && tables.tasks.length > 0) {
      const taskCols = Object.keys(tables.tasks[0]).filter(c => ALLOWED_TASK_COLUMNS.has(c));
      if (taskCols.length > 0) {
        const placeholders = taskCols.map(() => '?').join(', ');
        const stmt = db.prepare(`INSERT INTO tasks (${taskCols.join(', ')}) VALUES (${placeholders})`);
        for (const t of tables.tasks) {
          stmt.run(...taskCols.map(c => t[c]));
        }
      }
    }

    // Insert clients with whitelisted columns
    if (Array.isArray(tables.clients) && tables.clients.length > 0) {
      const clientCols = Object.keys(tables.clients[0]).filter(c => ALLOWED_CLIENT_COLUMNS.has(c));
      if (clientCols.length > 0) {
        const placeholders = clientCols.map(() => '?').join(', ');
        const stmt = db.prepare(`INSERT INTO clients (${clientCols.join(', ')}) VALUES (${placeholders})`);
        for (const c of tables.clients) {
          stmt.run(...clientCols.map(col => c[col]));
        }
      }
    }

    // Insert releases with whitelisted columns
    if (Array.isArray(tables.releases) && tables.releases.length > 0) {
      const relCols = Object.keys(tables.releases[0]).filter(c => ALLOWED_RELEASE_COLUMNS.has(c));
      if (relCols.length > 0) {
        const placeholders = relCols.map(() => '?').join(', ');
        const stmt = db.prepare(`INSERT INTO releases (${relCols.join(', ')}) VALUES (${placeholders})`);
        for (const r of tables.releases) {
          stmt.run(...relCols.map(col => r[col]));
        }
      }
    }

    // Insert leads with whitelisted columns
    if (Array.isArray(tables.leads) && tables.leads.length > 0) {
      const leadCols = Object.keys(tables.leads[0]).filter(c => ALLOWED_LEAD_COLUMNS.has(c));
      if (leadCols.length > 0) {
        const placeholders = leadCols.map(() => '?').join(', ');
        const stmt = db.prepare(`INSERT INTO leads (${leadCols.join(', ')}) VALUES (${placeholders})`);
        for (const l of tables.leads) {
          stmt.run(...leadCols.map(col => l[col]));
        }
      }
    }

    // Insert settings safely
    if (Array.isArray(tables.settings) && tables.settings.length > 0) {
      const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
      for (const s of tables.settings) {
        if (typeof s.key === 'string' && typeof s.value === 'string') {
          stmt.run(s.key, s.value);
        }
      }
    }
  });

  restoreTransaction(backupData.tables);
  return true;
}

// Security: Neutralize CSV Formula Injection (CWE-1236)
function sanitizeCSVField(val) {
  if (val === null || val === undefined) return '""';
  let str = String(val);
  // If the cell begins with formula characters, prefix with single quote
  if (/^[=+\-@\t\r]/.test(str)) {
    str = "'" + str;
  }
  return `"${str.replace(/"/g, '""')}"`;
}

// Export Tasks to CSV format with formula neutralization and UTF-8 BOM
function exportTasksToCSV() {
  const db = getDatabase();
  const tasks = db.prepare('SELECT * FROM tasks ORDER BY target_date ASC').all();

  const headers = ['ID', 'Titulo', 'Projeto', 'Categoria', 'Data', 'Horario', 'Prazo_Entrega', 'Prioridade', 'Status', 'Lembrete_Ativo'];
  const rows = tasks.map(t => [
    sanitizeCSVField(t.id),
    sanitizeCSVField(t.title),
    sanitizeCSVField(t.project_id),
    sanitizeCSVField(t.category),
    sanitizeCSVField(t.target_date),
    sanitizeCSVField(t.target_time || ''),
    sanitizeCSVField(t.delivery_date || ''),
    sanitizeCSVField(t.priority),
    sanitizeCSVField(t.status),
    sanitizeCSVField(t.reminder_enabled ? 'Sim' : 'Nao')
  ]);

  // UTF-8 BOM (\uFEFF)
  return '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
}

module.exports = {
  getSettings,
  updateSettings,
  logError,
  getErrorLogs,
  clearErrorLogs,
  exportBackupData,
  importBackupData,
  exportTasksToCSV
};
