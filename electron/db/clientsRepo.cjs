const { getDatabase } = require('./database.cjs');
const { randomUUID } = require('crypto');
const { createTask } = require('./tasksRepo.cjs');

// Clients
function mapRowToClient(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    company: row.company || '',
    instagram: row.instagram || '',
    phone: row.phone || '',
    email: row.email || '',
    notes: row.notes || '',
    active: Boolean(row.active),
    createdAt: row.created_at
  };
}

function getAllClients() {
  const db = getDatabase();
  const rows = db.prepare('SELECT * FROM clients ORDER BY active DESC, name ASC').all();
  return rows.map(mapRowToClient);
}

function getClientById(id) {
  const db = getDatabase();
  const row = db.prepare('SELECT * FROM clients WHERE id = ?').get(id);
  return mapRowToClient(row);
}

function createClient(data) {
  const db = getDatabase();
  const id = data.id || randomUUID();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO clients (id, name, company, instagram, phone, email, notes, active, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.name,
    data.company || '',
    data.instagram || '',
    data.phone || '',
    data.email || '',
    data.notes || '',
    data.active !== false ? 1 : 0,
    now
  );

  return getClientById(id);
}

function updateClient(id, data) {
  const db = getDatabase();
  db.prepare(`
    UPDATE clients SET
      name = COALESCE(?, name),
      company = COALESCE(?, company),
      instagram = COALESCE(?, instagram),
      phone = COALESCE(?, phone),
      email = COALESCE(?, email),
      notes = COALESCE(?, notes),
      active = COALESCE(?, active)
    WHERE id = ?
  `).run(
    data.name !== undefined ? data.name : null,
    data.company !== undefined ? data.company : null,
    data.instagram !== undefined ? data.instagram : null,
    data.phone !== undefined ? data.phone : null,
    data.email !== undefined ? data.email : null,
    data.notes !== undefined ? data.notes : null,
    data.active !== undefined ? (data.active ? 1 : 0) : null,
    id
  );
  return getClientById(id);
}

function deleteClient(id) {
  const db = getDatabase();
  const client = getClientById(id);
  db.prepare('DELETE FROM clients WHERE id = ?').run(id);
  return client;
}

// Releases (EVILBEAR.JPG)
function mapRowToRelease(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    releaseDate: row.release_date,
    releaseTime: row.release_time || undefined,
    recurrence: row.recurrence || 'none',
    genre: row.genre || '',
    bpm: row.bpm || undefined,
    musicalKey: row.musical_key || '',
    formats: row.formats_json ? JSON.parse(row.formats_json) : ['WAV', 'MP3', 'STEMS'],
    licenseStatus: row.license_status || 'disponivel',
    checklist: row.checklist_json ? JSON.parse(row.checklist_json) : [],
    notes: row.notes || '',
    status: row.status || 'planejamento',
    createdAt: row.created_at
  };
}

function getAllReleases() {
  const db = getDatabase();
  const rows = db.prepare('SELECT * FROM releases ORDER BY release_date DESC').all();
  return rows.map(mapRowToRelease);
}

function getReleaseById(id) {
  const db = getDatabase();
  const row = db.prepare('SELECT * FROM releases WHERE id = ?').get(id);
  return mapRowToRelease(row);
}

const DEFAULT_RELEASE_STEPS = [
  'Finalizar beat',
  'Revisar mixagem',
  'Finalizar masterização',
  'Criar capa',
  'Criar visualizer',
  'Preparar título e descrição',
  'Programar publicação',
  'Divulgar lançamento'
];

function createRelease(data, createLinkedTasks = false) {
  const db = getDatabase();
  const id = data.id || randomUUID();
  const now = new Date().toISOString();

  const checklist = (data.checklist && data.checklist.length > 0)
    ? data.checklist
    : DEFAULT_RELEASE_STEPS.map(title => ({ id: randomUUID(), title, completed: false }));

  db.prepare(`
    INSERT INTO releases (
      id, title, release_date, release_time, recurrence, genre, bpm, musical_key,
      formats_json, license_status, checklist_json, notes, status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.title,
    data.releaseDate,
    data.releaseTime || null,
    data.recurrence || 'none',
    data.genre || '',
    data.bpm || null,
    data.musicalKey || '',
    JSON.stringify(data.formats || ['WAV', 'MP3', 'STEMS']),
    data.licenseStatus || 'disponivel',
    JSON.stringify(checklist),
    data.notes || '',
    data.status || 'planejamento',
    now
  );

  // If user requested creating calendar tasks for these release steps
  if (createLinkedTasks) {
    // Main release task
    createTask({
      title: `Lançamento: ${data.title}`,
      description: `Lançamento oficial EVILBEAR.JPG - ${data.genre || 'Instrumental'} | ${data.bpm ? data.bpm + ' BPM' : ''} | Formatos: ${(data.formats || []).join(', ')}`,
      projectId: 'evilbear',
      category: 'Lançamento de instrumentais',
      targetDate: data.releaseDate,
      targetTime: data.releaseTime || '18:00',
      priority: 'alta',
      status: 'nao_iniciada',
      checklist: checklist.map(c => ({ id: c.id, title: c.title, completed: false })),
      recurrence: data.recurrence || 'none',
      reminderEnabled: true,
      reminderTime: '00:00'
    });
  }

  return getReleaseById(id);
}

function updateRelease(id, data) {
  const db = getDatabase();
  db.prepare(`
    UPDATE releases SET
      title = COALESCE(?, title),
      release_date = COALESCE(?, release_date),
      release_time = ?,
      recurrence = COALESCE(?, recurrence),
      genre = COALESCE(?, genre),
      bpm = ?,
      musical_key = COALESCE(?, musical_key),
      formats_json = COALESCE(?, formats_json),
      license_status = COALESCE(?, license_status),
      checklist_json = COALESCE(?, checklist_json),
      notes = COALESCE(?, notes),
      status = COALESCE(?, status)
    WHERE id = ?
  `).run(
    data.title !== undefined ? data.title : null,
    data.releaseDate !== undefined ? data.releaseDate : null,
    data.releaseTime !== undefined ? data.releaseTime : null,
    data.recurrence !== undefined ? data.recurrence : null,
    data.genre !== undefined ? data.genre : null,
    data.bpm !== undefined ? data.bpm : null,
    data.musicalKey !== undefined ? data.musicalKey : null,
    data.formats !== undefined ? JSON.stringify(data.formats) : null,
    data.licenseStatus !== undefined ? data.licenseStatus : null,
    data.checklist !== undefined ? JSON.stringify(data.checklist) : null,
    data.notes !== undefined ? data.notes : null,
    data.status !== undefined ? data.status : null,
    id
  );
  return getReleaseById(id);
}

function deleteRelease(id) {
  const db = getDatabase();
  const release = getReleaseById(id);
  db.prepare('DELETE FROM releases WHERE id = ?').run(id);
  return release;
}

module.exports = {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  getAllReleases,
  getReleaseById,
  createRelease,
  updateRelease,
  deleteRelease,
  DEFAULT_RELEASE_STEPS
};
