const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

let dbInstance = null;

function getDbPath(customPath = null) {
  if (customPath) return customPath;
  if (process.env.WINC_DB_PATH) return process.env.WINC_DB_PATH;

  let baseDir = process.cwd();
  try {
    const { app } = require('electron');
    if (app && app.getPath) {
      baseDir = app.getPath('userData');
    }
  } catch (e) {
    // If running in standalone node/test
  }

  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }

  return path.join(baseDir, 'winc_task_hub.db');
}

function initDatabase(customPath = null) {
  if (dbInstance) return dbInstance;

  const dbPath = getDbPath(customPath);
  console.log('[SQLite] Initializing database at:', dbPath);

  try {
    dbInstance = new Database(dbPath);
    dbInstance.pragma('journal_mode = WAL');
    dbInstance.pragma('foreign_keys = ON');

    // Create tables
    dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT DEFAULT '',
        project_id TEXT NOT NULL, -- 'winc' | 'evilbear' | 'pessoal'
        category TEXT NOT NULL,
        client_id TEXT,
        client_name TEXT,
        target_date TEXT NOT NULL, -- YYYY-MM-DD
        target_time TEXT, -- HH:mm
        delivery_date TEXT,
        priority TEXT DEFAULT 'media', -- 'baixa' | 'media' | 'alta' | 'urgente'
        status TEXT DEFAULT 'nao_iniciada', -- 'nao_iniciada' | 'em_andamento' | 'aguardando_material' | 'aguardando_aprovacao' | 'em_revisao' | 'concluida'
        checklist_json TEXT DEFAULT '[]',
        attachments_json TEXT DEFAULT '[]',
        recurrence TEXT DEFAULT 'none',
        recurrence_days_json TEXT DEFAULT '[]',
        reminder_enabled INTEGER DEFAULT 1,
        reminder_time TEXT DEFAULT '00:00',
        is_pinned INTEGER DEFAULT 0,
        pinned_dismissed_at TEXT,
        notified_at TEXT,
        completed_at TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_tasks_target_date ON tasks(target_date);
      CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
      CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
      CREATE INDEX IF NOT EXISTS idx_tasks_pinned ON tasks(is_pinned);

      CREATE TABLE IF NOT EXISTS clients (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        company TEXT DEFAULT '',
        instagram TEXT DEFAULT '',
        phone TEXT DEFAULT '',
        email TEXT DEFAULT '',
        notes TEXT DEFAULT '',
        active INTEGER DEFAULT 1,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS releases (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        release_date TEXT NOT NULL,
        release_time TEXT,
        recurrence TEXT DEFAULT 'none',
        genre TEXT DEFAULT '',
        bpm INTEGER,
        musical_key TEXT DEFAULT '',
        formats_json TEXT DEFAULT '["WAV", "MP3", "STEMS"]',
        license_status TEXT DEFAULT 'disponivel',
        checklist_json TEXT DEFAULT '[]',
        notes TEXT DEFAULT '',
        status TEXT DEFAULT 'planejamento',
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS leads (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL, -- 'empresa' | 'artista'
        project_id TEXT NOT NULL,
        instagram TEXT DEFAULT '',
        phone TEXT DEFAULT '',
        email TEXT DEFAULT '',
        notes TEXT DEFAULT '',
        contact_date TEXT,
        next_followup_date TEXT,
        reminder_set INTEGER DEFAULT 0,
        response TEXT DEFAULT '',
        status TEXT DEFAULT 'novo_lead',
        history_json TEXT DEFAULT '[]',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_leads_project ON leads(project_id);
      CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
      CREATE INDEX IF NOT EXISTS idx_leads_followup ON leads(next_followup_date);

      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS error_logs (
        id TEXT PRIMARY KEY,
        timestamp TEXT NOT NULL,
        level TEXT NOT NULL,
        message TEXT NOT NULL,
        details TEXT
      );
    `);

    // Insert default settings if not exists
    const getSettingStmt = dbInstance.prepare('SELECT value FROM settings WHERE key = ?');
    const setSettingStmt = dbInstance.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');

    const defaultSettings = {
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

    const existingSettings = getSettingStmt.get('app_settings');
    if (!existingSettings) {
      setSettingStmt.run('app_settings', JSON.stringify(defaultSettings));
    } else {
      try {
        const parsed = JSON.parse(existingSettings.value);
        const merged = { ...defaultSettings, ...parsed };
        setSettingStmt.run('app_settings', JSON.stringify(merged));
      } catch (e) {}
    }

    return dbInstance;
  } catch (err) {
    console.error('[SQLite] Initialization failed:', err);
    throw err;
  }
}

function getDatabase() {
  if (!dbInstance) {
    return initDatabase();
  }
  return dbInstance;
}

function closeDatabase() {
  if (dbInstance) {
    try {
      dbInstance.close();
    } catch (e) {
      console.warn('Error closing DB:', e);
    }
    dbInstance = null;
  }
}

module.exports = {
  initDatabase,
  getDatabase,
  closeDatabase,
  getDbPath
};
