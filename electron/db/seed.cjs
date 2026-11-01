const { getDatabase } = require('./database.cjs');
const tasksRepo = require('./tasksRepo.cjs');
const clientsRepo = require('./clientsRepo.cjs');
const prospectionRepo = require('./prospectionRepo.cjs');

function seedInitialDataIfEmpty() {
  const db = getDatabase();
  const taskCount = db.prepare('SELECT COUNT(*) as count FROM tasks').get().count;

  if (taskCount > 0) {
    return; // Already initialized with data
  }

  console.log('[Seed] Populating initial WINC TASK HUB data and scenario...');

  // 1. Clients
  const client1 = clientsRepo.createClient({
    name: 'Empresa X (Tecnologia)',
    company: 'Empresa X Tech',
    instagram: 'empresax_tech',
    phone: '(11) 98765-4321',
    email: 'comercial@empresax.com.br',
    notes: 'Demanda prioritária: 5 artes e 2 vídeos mensais.',
    active: true
  });

  const client2 = clientsRepo.createClient({
    name: 'Dra. Vanessa Martins',
    company: 'Estética & Saúde',
    instagram: 'dra.vanessamartins',
    phone: '(11) 99123-4567',
    notes: 'Contrato social media ativo: 3 carrosséis semanais.',
    active: true
  });

  // Today and Tomorrow strings
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const todayStr = `${y}-${m}-${d}`;

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const ty = tomorrow.getFullYear();
  const tm = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const td = String(tomorrow.getDate()).padStart(2, '0');
  const tomorrowStr = `${ty}-${tm}-${td}`;

  // 2. Exact scenario tasks:
  // AGÊNCIA WINC:
  tasksRepo.createTask({
    title: 'Criar três carrosséis',
    description: 'Carrosséis educativos e de posicionamento para Dr. Vanessa e Empresa X.',
    projectId: 'winc',
    category: 'Criação de carrosséis',
    clientId: client2.id,
    clientName: client2.name,
    targetDate: tomorrowStr,
    targetTime: '10:00',
    deliveryDate: tomorrowStr,
    priority: 'alta',
    status: 'nao_iniciada',
    reminderEnabled: true,
    reminderTime: '00:00',
    checklist: [
      { id: '1', title: 'Definir roteiro do carrossel', completed: true },
      { id: '2', title: 'Criar artes no Photoshop/Figma', completed: false },
      { id: '3', title: 'Enviar para aprovação do cliente', completed: false }
    ]
  });

  tasksRepo.createTask({
    title: 'Prospectar 20 empresas',
    description: 'Prospecção ativa no Instagram e LinkedIn para agência de marketing.',
    projectId: 'winc',
    category: 'Prospecção de empresas',
    targetDate: tomorrowStr,
    targetTime: '14:00',
    priority: 'alta',
    status: 'nao_iniciada',
    reminderEnabled: true,
    reminderTime: '00:00'
  });

  tasksRepo.createTask({
    title: 'Revisar vídeo de um cliente',
    description: 'Revisão de cortes, color grading e legendas comerciais da Empresa X.',
    projectId: 'winc',
    category: 'Edição de vídeos',
    clientId: client1.id,
    clientName: client1.name,
    targetDate: tomorrowStr,
    targetTime: '16:30',
    deliveryDate: tomorrowStr,
    priority: 'urgente',
    status: 'em_revisao',
    reminderEnabled: true,
    reminderTime: '00:00'
  });

  // EVILBEAR.JPG:
  tasksRepo.createTask({
    title: 'Produzir dois beats',
    description: 'Dois instrumentais Dark Trap / Boombap pesados para a sessão de domingo.',
    projectId: 'evilbear',
    category: 'Produção de beats',
    targetDate: tomorrowStr,
    targetTime: '15:00',
    priority: 'alta',
    status: 'nao_iniciada',
    reminderEnabled: true,
    reminderTime: '00:00',
    checklist: [
      { id: '10', title: 'Compor melodia principal e 808', completed: false },
      { id: '11', title: 'Ajustar mix e sidechain', completed: false }
    ]
  });

  tasksRepo.createTask({
    title: 'Criar uma capa',
    description: 'Design de capa conceitual para o lançamento de domingo no YouTube.',
    projectId: 'evilbear',
    category: 'Criação de capas',
    targetDate: tomorrowStr,
    targetTime: '17:00',
    priority: 'media',
    status: 'nao_iniciada',
    reminderEnabled: true,
    reminderTime: '00:00'
  });

  tasksRepo.createTask({
    title: 'Entrar em contato com cinco artistas',
    description: 'Abordar novos cantores no Instagram e Soundcloud para licença exclusiva.',
    projectId: 'evilbear',
    category: 'Prospecção de artistas',
    targetDate: tomorrowStr,
    targetTime: '19:00',
    priority: 'alta',
    status: 'nao_iniciada',
    reminderEnabled: true,
    reminderTime: '00:00'
  });

  // Also one today task so dashboard has immediate live activity
  tasksRepo.createTask({
    title: 'Planejamento semanal da Agência Winc & Evilbear',
    description: 'Alinhamento do cronograma de postagens e metas de prospecção.',
    projectId: 'winc',
    category: 'Reuniões',
    targetDate: todayStr,
    targetTime: '09:00',
    priority: 'urgente',
    status: 'em_andamento',
    reminderEnabled: true,
    reminderTime: '00:00',
    isPinned: true
  });

  // 3. EVILBEAR Release Pipeline
  clientsRepo.createRelease({
    title: 'Night Stalker Instrumental (Evil Pack Vol. 1)',
    releaseDate: tomorrowStr,
    releaseTime: '18:00',
    recurrence: 'weekly',
    genre: 'Dark Trap',
    bpm: 140,
    musicalKey: 'C Minor',
    formats: ['WAV', 'MP3', 'STEMS'],
    licenseStatus: 'disponivel',
    notes: 'Programado para distribuição nos canais oficiais.'
  }, false);

  // 4. Sample Leads
  try {
    prospectionRepo.createLead({
      name: 'Studio Prime Hair',
      type: 'empresa',
      projectId: 'winc',
      instagram: 'studioprimehair',
      phone: '(11) 97777-6666',
      notes: 'Interessado em gestão de redes sociais e anúncios.',
      contactDate: todayStr,
      status: 'aguardando_resposta'
    });

    prospectionRepo.createLead({
      name: 'MC Derek',
      type: 'artista',
      projectId: 'evilbear',
      instagram: 'mcderek_trap',
      notes: 'Gostou do último beat no YouTube, pediu proposta exclusiva.',
      contactDate: todayStr,
      status: 'em_negociacao'
    });
  } catch (e) {}

  console.log('[Seed] Scenario seeding completed.');
}

module.exports = {
  seedInitialDataIfEmpty
};
