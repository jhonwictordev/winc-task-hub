const { getDatabase } = require('./database.cjs');
const { randomUUID } = require('crypto');
const { createTask } = require('./tasksRepo.cjs');

function mapRowToLead(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    projectId: row.project_id,
    instagram: row.instagram || '',
    phone: row.phone || '',
    email: row.email || '',
    notes: row.notes || '',
    contactDate: row.contact_date || undefined,
    nextFollowUpDate: row.next_followup_date || undefined,
    reminderSet: Boolean(row.reminder_set),
    response: row.response || '',
    status: row.status,
    history: row.history_json ? JSON.parse(row.history_json) : [],
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function getAllLeads(projectId = null) {
  const db = getDatabase();
  let query = 'SELECT * FROM leads';
  const params = [];
  if (projectId && projectId !== 'todos') {
    query += ' WHERE project_id = ?';
    params.push(projectId);
  }
  query += ' ORDER BY created_at DESC';
  const rows = db.prepare(query).all(...params);
  return rows.map(mapRowToLead);
}

function getLeadById(id) {
  const db = getDatabase();
  const row = db.prepare('SELECT * FROM leads WHERE id = ?').get(id);
  return mapRowToLead(row);
}

function checkDuplicateLead(name, instagram = '', excludeId = null) {
  const db = getDatabase();
  let query = `
    SELECT id, name, instagram FROM leads
    WHERE (LOWER(name) = LOWER(?) OR (? != '' AND LOWER(instagram) = LOWER(?)))
  `;
  const params = [name.trim(), instagram.trim(), instagram.trim()];
  if (excludeId) {
    query += ' AND id != ?';
    params.push(excludeId);
  }
  const match = db.prepare(query).get(...params);
  return Boolean(match);
}

function createLead(data) {
  const db = getDatabase();

  // Duplicate check
  if (checkDuplicateLead(data.name, data.instagram || '')) {
    throw new Error(`Lead já cadastrado com este nome (${data.name}) ou Instagram (${data.instagram || 'N/A'})!`);
  }

  const id = data.id || randomUUID();
  const now = new Date().toISOString();

  const history = [
    {
      date: now,
      note: 'Lead cadastrado no sistema.',
      status: data.status || 'novo_lead'
    }
  ];

  db.prepare(`
    INSERT INTO leads (
      id, name, type, project_id, instagram, phone, email, notes,
      contact_date, next_followup_date, reminder_set, response,
      status, history_json, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.name.trim(),
    data.type || 'empresa',
    data.projectId || 'winc',
    data.instagram ? data.instagram.trim().replace(/^@/, '') : '',
    data.phone ? data.phone.trim() : '',
    data.email ? data.email.trim() : '',
    data.notes || '',
    data.contactDate || null,
    data.nextFollowUpDate || null,
    data.reminderSet ? 1 : 0,
    data.response || '',
    data.status || 'novo_lead',
    JSON.stringify(history),
    now,
    now
  );

  // If follow-up reminder is set, create a calendar task!
  if (data.reminderSet && data.nextFollowUpDate) {
    createTask({
      title: `Follow-up: ${data.name} (${data.type === 'empresa' ? 'Empresa' : 'Artista'})`,
      description: `Follow-up comercial via ${data.instagram ? '@' + data.instagram : data.phone || data.email || 'contato'}.\nNotas: ${data.notes || ''}`,
      projectId: data.projectId || 'winc',
      category: data.projectId === 'winc' ? 'Follow-up comercial' : 'Prospecção de artistas',
      targetDate: data.nextFollowUpDate,
      priority: 'alta',
      status: 'nao_iniciada',
      reminderEnabled: true,
      reminderTime: '00:00'
    });
  }

  return getLeadById(id);
}

function updateLead(id, data) {
  const db = getDatabase();
  const current = getLeadById(id);
  if (!current) throw new Error('Lead not found');

  if (data.name || data.instagram) {
    const isDup = checkDuplicateLead(
      data.name || current.name,
      data.instagram !== undefined ? data.instagram : current.instagram,
      id
    );
    if (isDup) {
      throw new Error('Outro lead já utiliza este nome ou Instagram!');
    }
  }

  const now = new Date().toISOString();
  const history = current.history || [];

  if (data.status && data.status !== current.status) {
    history.push({
      date: now,
      note: `Status alterado de "${current.status}" para "${data.status}".`,
      status: data.status
    });
  }

  if (data.noteAppend) {
    history.push({
      date: now,
      note: data.noteAppend,
      status: data.status || current.status
    });
  }

  db.prepare(`
    UPDATE leads SET
      name = COALESCE(?, name),
      type = COALESCE(?, type),
      project_id = COALESCE(?, project_id),
      instagram = COALESCE(?, instagram),
      phone = COALESCE(?, phone),
      email = COALESCE(?, email),
      notes = COALESCE(?, notes),
      contact_date = ?,
      next_followup_date = ?,
      reminder_set = COALESCE(?, reminder_set),
      response = COALESCE(?, response),
      status = COALESCE(?, status),
      history_json = ?,
      updated_at = ?
    WHERE id = ?
  `).run(
    data.name !== undefined ? data.name.trim() : null,
    data.type !== undefined ? data.type : null,
    data.projectId !== undefined ? data.projectId : null,
    data.instagram !== undefined ? data.instagram.trim().replace(/^@/, '') : null,
    data.phone !== undefined ? data.phone.trim() : null,
    data.email !== undefined ? data.email.trim() : null,
    data.notes !== undefined ? data.notes : null,
    data.contactDate !== undefined ? data.contactDate : current.contactDate || null,
    data.nextFollowUpDate !== undefined ? data.nextFollowUpDate : current.nextFollowUpDate || null,
    data.reminderSet !== undefined ? (data.reminderSet ? 1 : 0) : null,
    data.response !== undefined ? data.response : null,
    data.status !== undefined ? data.status : null,
    JSON.stringify(history),
    now,
    id
  );

  return getLeadById(id);
}

function deleteLead(id) {
  const db = getDatabase();
  const lead = getLeadById(id);
  db.prepare('DELETE FROM leads WHERE id = ?').run(id);
  return lead;
}

function getProspectionStats(todayStr, monthPrefix) {
  const db = getDatabase();

  const totalLeads = db.prepare('SELECT COUNT(*) as count FROM leads').get().count;

  const todayContacts = db.prepare(`
    SELECT COUNT(*) as count FROM leads
    WHERE contact_date = ?
  `).get(todayStr).count;

  const monthContacts = db.prepare(`
    SELECT COUNT(*) as count FROM leads
    WHERE contact_date LIKE ?
  `).get(`${monthPrefix}%`).count;

  const closedDeals = db.prepare(`
    SELECT COUNT(*) as count FROM leads
    WHERE status = 'fechado'
  `).get().count;

  const waitingResponse = db.prepare(`
    SELECT COUNT(*) as count FROM leads
    WHERE status = 'aguardando_resposta'
  `).get().count;

  const inNegotiation = db.prepare(`
    SELECT COUNT(*) as count FROM leads
    WHERE status = 'em_negociacao'
  `).get().count;

  return {
    totalLeads,
    todayContacts,
    monthContacts,
    closedDeals,
    waitingResponse,
    inNegotiation
  };
}

module.exports = {
  getAllLeads,
  getLeadById,
  checkDuplicateLead,
  createLead,
  updateLead,
  deleteLead,
  getProspectionStats
};
