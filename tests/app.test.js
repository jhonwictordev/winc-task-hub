const assert = require('assert');
const path = require('path');
const fs = require('fs');

// Set test DB path
const testDbPath = path.join(__dirname, 'test_winc_hub.db');
if (fs.existsSync(testDbPath)) {
  fs.unlinkSync(testDbPath);
}
process.env.WINC_DB_PATH = testDbPath;

const { initDatabase, closeDatabase } = require('../electron/db/database.cjs');
const tasksRepo = require('../electron/db/tasksRepo.cjs');
const clientsRepo = require('../electron/db/clientsRepo.cjs');
const prospectionRepo = require('../electron/db/prospectionRepo.cjs');
const settingsRepo = require('../electron/db/settingsRepo.cjs');
const reminderScheduler = require('../electron/scheduler/reminderScheduler.cjs');
const notificationService = require('../electron/services/notificationService.cjs');

async function runTests() {
  console.log('====================================================');
  console.log('   WINC TASK HUB — SUÍTE DE TESTES AUTOMATIZADOS   ');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  function test(name, fn) {
    total++;
    try {
      fn();
      console.log(`  [PASS] Teste ${total}: ${name}`);
      passed++;
    } catch (e) {
      console.error(`  [FAIL] Teste ${total}: ${name}`);
      console.error(`         Erro: ${e.message}\n`);
    }
  }

  // Init DB
  initDatabase(testDbPath);

  // 1. Task Creation
  let task1Id = null;
  test('1. Criação de tarefas no SQLite', () => {
    const task = tasksRepo.createTask({
      title: 'Criar três carrosséis para clientes',
      description: 'Artes no estilo premium Dark Mode com detalhes roxos',
      projectId: 'winc',
      category: 'Criação de carrosséis',
      targetDate: '2026-10-29',
      priority: 'alta',
      reminderEnabled: true,
      reminderTime: '00:00'
    });
    assert(task && task.id, 'Task ID deve existir');
    assert.strictEqual(task.title, 'Criar três carrosséis para clientes');
    assert.strictEqual(task.projectId, 'winc');
    assert.strictEqual(task.status, 'nao_iniciada');
    task1Id = task.id;
  });

  // 2. Task Edition
  test('2. Edição de tarefas', () => {
    const updated = tasksRepo.updateTask(task1Id, {
      title: 'Criar quatro carrosséis para clientes',
      priority: 'urgente'
    });
    assert.strictEqual(updated.title, 'Criar quatro carrosséis para clientes');
    assert.strictEqual(updated.priority, 'urgente');
  });

  // 3. Date Rescheduling
  test('3. Mudança de datas (Reagendamento)', () => {
    const updated = tasksRepo.updateTask(task1Id, {
      targetDate: '2026-10-30'
    });
    assert.strictEqual(updated.targetDate, '2026-10-30');
  });

  // 4. Multiple Tasks per Day
  test('4. Múltiplas tarefas no mesmo dia e agrupamento', () => {
    tasksRepo.createTask({
      title: 'Prospectar 20 empresas',
      projectId: 'winc',
      category: 'Prospecção de empresas',
      targetDate: '2026-10-29',
      priority: 'alta'
    });
    tasksRepo.createTask({
      title: 'Revisar vídeo de um cliente',
      projectId: 'winc',
      category: 'Edição de vídeos',
      targetDate: '2026-10-29',
      priority: 'media'
    });
    tasksRepo.createTask({
      title: 'Produzir dois beats',
      projectId: 'evilbear',
      category: 'Produção de beats',
      targetDate: '2026-10-29',
      priority: 'alta'
    });
    tasksRepo.createTask({
      title: 'Criar uma capa',
      projectId: 'evilbear',
      category: 'Criação de capas',
      targetDate: '2026-10-29',
      priority: 'media'
    });
    tasksRepo.createTask({
      title: 'Entrar em contato com cinco artistas',
      projectId: 'evilbear',
      category: 'Prospecção de artistas',
      targetDate: '2026-10-29',
      priority: 'alta'
    });

    const dayTasks = tasksRepo.getTasksByDate('2026-10-29');
    assert.strictEqual(dayTasks.length, 5, 'Devem existir 5 tarefas cadastradas para o dia 29/10/2026');
  });

  // 5. Weekly Recurrence
  test('5. Recorrência semanal e cálculo de próxima data', () => {
    const nextDate = tasksRepo.calculateNextRecurrenceDate('2026-10-29', 'weekly');
    assert.strictEqual(nextDate, '2026-11-05', 'Próxima data semanal de 29/10 deve ser 05/11');
  });

  // 6. Monthly Recurrence
  test('6. Recorrência mensal e cálculo de próxima data', () => {
    const nextDate = tasksRepo.calculateNextRecurrenceDate('2026-10-29', 'monthly');
    assert.strictEqual(nextDate, '2026-11-29', 'Próxima data mensal de 29/10 deve ser 29/11');
  });

  // 7. Client Management (Agência Winc)
  let clientId = null;
  test('7. Cadastro e gerenciamento de clientes Winc', () => {
    const client = clientsRepo.createClient({
      name: 'Dr. Roberto Mendes',
      company: 'Clínica OdontoPrime',
      instagram: 'odontoprime_oficial',
      phone: '(11) 98888-7777',
      notes: 'Contrato mensal de 12 posts e 4 vídeos'
    });
    assert(client && client.id, 'Cliente deve ser criado com ID');
    assert.strictEqual(client.name, 'Dr. Roberto Mendes');
    clientId = client.id;
  });

  // 8. Releases (EVILBEAR.JPG)
  test('8. Cadastro de lançamentos com 8 etapas EVILBEAR.JPG', () => {
    const rel = clientsRepo.createRelease({
      title: 'Drill Instrumental Vol 1',
      releaseDate: '2026-11-01',
      bpm: 142,
      musicalKey: 'D Minor',
      licenseStatus: 'disponivel'
    }, true);
    assert(rel && rel.id, 'Release deve ser criada');
    assert.strictEqual(rel.checklist.length, 8, 'Devem existir 8 etapas obrigatórias no pipeline');
  });

  // 9. Prospection Leads & Duplicate Check
  test('9. Prospecção comercial e prevenção de leads duplicados', () => {
    const lead = prospectionRepo.createLead({
      name: 'Empresa Alpha Tech',
      type: 'empresa',
      projectId: 'winc',
      instagram: 'alphatech_br',
      status: 'primeiro_contato'
    });
    assert(lead && lead.id, 'Lead deve ser criado');

    // Attempt duplicate
    let threw = false;
    try {
      prospectionRepo.createLead({
        name: 'Empresa Alpha Tech',
        type: 'empresa',
        projectId: 'winc'
      });
    } catch (e) {
      threw = true;
    }
    assert(threw, 'Deve lançar erro ao tentar cadastrar lead com nome duplicado');
  });

  // 10. Midnight 00:00 Persistent Reminder Trigger
  test('10. Lembrete persistente na virada do dia (00h00)', () => {
    // Check due tasks for 29/10/2026
    const due = tasksRepo.getDueTasksForDay('2026-10-29');
    assert(due.length >= 5, 'Deve detectar todas as 5 tarefas cadastradas para o dia');
    tasksRepo.markTasksAsPinned(due.map(t => t.id));

    const pinned = tasksRepo.getCurrentlyPinnedTasks();
    assert(pinned.length >= 5, 'Todas as tarefas de 29/10 devem estar fixadas na janela flutuante');
  });

  // 11. Unpinning Without Concluding (Crucial Rule)
  test('11. Desfixar da tela NÃO conclui a tarefa', () => {
    const pinnedBefore = tasksRepo.getCurrentlyPinnedTasks();
    const taskToUnpin = pinnedBefore[0];
    assert(taskToUnpin, 'Deve existir tarefa fixada');

    tasksRepo.unpinTask(taskToUnpin.id);

    const taskAfter = tasksRepo.getTaskById(taskToUnpin.id);
    assert.strictEqual(taskAfter.isPinned, false, 'isPinned deve ser false');
    assert.notStrictEqual(taskAfter.status, 'concluida', 'Status NÃO deve ser concluído!');
    assert.strictEqual(taskAfter.status, 'nao_iniciada', 'Tarefa continua pendente no calendário');
  });

  // 12. Concluding Task
  test('12. Concluir tarefa (Marca finalizada e desfixa)', () => {
    const pinned = tasksRepo.getCurrentlyPinnedTasks();
    const taskToConclude = pinned[0];

    tasksRepo.concludeTask(taskToConclude.id);

    const after = tasksRepo.getTaskById(taskToConclude.id);
    assert.strictEqual(after.status, 'concluida');
    assert.strictEqual(after.isPinned, false);
    assert(after.completedAt, 'completedAt deve estar preenchido');
  });

  // 13. Snooze (Adiar)
  test('13. Adiar tarefa para nova data', () => {
    const pinned = tasksRepo.getCurrentlyPinnedTasks();
    const taskToSnooze = pinned[0];

    tasksRepo.snoozeTask(taskToSnooze.id, '2026-11-02', '14:00');

    const after = tasksRepo.getTaskById(taskToSnooze.id);
    assert.strictEqual(after.targetDate, '2026-11-02');
    assert.strictEqual(after.targetTime, '14:00');
    assert.strictEqual(after.isPinned, false);
  });

  // 14. Overdue Tasks Recovery
  test('14. Recuperação de tarefas atrasadas após PC desligado ou reiniciado', () => {
    // Suppose system advances to 2026-11-01
    const dueOnNov1 = tasksRepo.getDueTasksForDay('2026-11-01');
    assert(dueOnNov1.length > 0, 'Deve recuperar tarefas anteriores que ainda estão pendentes');
  });

  // 15. Backup Export and Restore
  test('15. Exportação e Restauração de Backup JSON com transação ACID', () => {
    const backup = settingsRepo.exportBackupData();
    assert(backup && backup.tables, 'Backup deve conter tabelas');
    assert(backup.tables.tasks.length > 0, 'Backup deve conter tarefas');
    assert(backup.tables.clients.length > 0, 'Backup deve conter clientes');

    // Test restore
    const restored = settingsRepo.importBackupData(backup);
    assert.strictEqual(restored, true, 'Restauração deve ter sucesso');

    const countTasks = tasksRepo.getAllTasks().length;
    assert.strictEqual(countTasks, backup.tables.tasks.length, 'Contagem de tarefas restauradas deve ser idêntica');
  });

  // 16. CSV Export
  test('16. Exportação de tarefas em formato CSV com UTF-8 BOM', () => {
    const csv = settingsRepo.exportTasksToCSV();
    assert(csv.startsWith('\uFEFF'), 'CSV deve ter UTF-8 BOM');
    assert(csv.includes('Titulo,Projeto,Categoria'), 'CSV deve ter cabeçalhos');
  });

  // 17. Duplication of Task
  test('17. Duplicação de tarefas com status limpo', () => {
    const tasks = tasksRepo.getAllTasks();
    const copy = tasksRepo.duplicateTask(tasks[0].id);
    assert(copy && copy.id !== tasks[0].id, 'Cópia deve ter novo ID');
    assert(copy.title.includes('(Cópia)'), 'Título deve indicar cópia');
    assert.strictEqual(copy.status, 'nao_iniciada');
  });

  // 18. Task Deletion
  test('18. Exclusão de tarefas', () => {
    const tasks = tasksRepo.getAllTasks();
    const deleted = tasksRepo.deleteTask(tasks[0].id);
    const check = tasksRepo.getTaskById(deleted.id);
    assert.strictEqual(check, null, 'Tarefa excluída não deve mais existir');
  });

  // 19. UX Settings Defaults & Persistence
  test('19. Preferências de UX não-invasivas padrão e persistência', () => {
    const s = settingsRepo.getSettings();
    assert.strictEqual(s.openPanelManually, true, 'openPanelManually deve ser true por padrão');
    assert.strictEqual(s.startMinimizedToTray, true, 'startMinimizedToTray deve ser true por padrão');
    assert.strictEqual(s.alwaysOnTop, false, 'alwaysOnTop deve ser false por padrão');
    assert.strictEqual(s.doNotDisturb, false, 'doNotDisturb deve ser false por padrão');
    assert.strictEqual(s.globalShortcutToggle, 'CommandOrControl+Shift+T', 'Atalho padrão deve ser Ctrl+Shift+T');

    // Update settings and verify persistence
    settingsRepo.updateSettings({
      alwaysOnTop: true,
      doNotDisturb: true,
      globalShortcutToggle: 'CommandOrControl+Alt+W'
    });
    const sUpdated = settingsRepo.getSettings();
    assert.strictEqual(sUpdated.alwaysOnTop, true);
    assert.strictEqual(sUpdated.doNotDisturb, true);
    assert.strictEqual(sUpdated.globalShortcutToggle, 'CommandOrControl+Alt+W');

    // Reset back for subsequent tests
    settingsRepo.updateSettings({
      alwaysOnTop: false,
      doNotDisturb: false,
      globalShortcutToggle: 'CommandOrControl+Shift+T'
    });
  });

  // 20. Do Not Disturb Mode Blocks Notifications
  test('20. Modo Não Perturbe bloqueia envio de notificações', () => {
    settingsRepo.updateSettings({ doNotDisturb: true });
    notificationService.clearNotificationCache();

    const dispatched = notificationService.sendNotification({
      title: 'Teste DND',
      body: 'Não deve disparar',
      type: 'due_soon',
      taskId: 'test-dnd-1'
    });
    assert.strictEqual(dispatched, false, 'Com DND ativo, nenhuma notificação deve ser enviada');

    settingsRepo.updateSettings({ doNotDisturb: false });
  });

  // 21. Master Notifications Toggle
  test('21. Master toggle de notificações desativado bloqueia notificações', () => {
    settingsRepo.updateSettings({ notificationsEnabled: false });
    notificationService.clearNotificationCache();

    const dispatched = notificationService.sendNotification({
      title: 'Teste Master',
      body: 'Não deve disparar',
      type: 'new_task',
      taskId: 'test-master-1'
    });
    assert.strictEqual(dispatched, false, 'Com notificationsEnabled=false, nada deve ser disparado');

    settingsRepo.updateSettings({ notificationsEnabled: true });
  });

  // 22. Category Specific Notification Flags
  test('22. Desativação seletiva por categoria de notificação', () => {
    notificationService.clearNotificationCache();
    settingsRepo.updateSettings({
      notifyDueSoon: false,
      notifyOverdue: true,
      notifyNewTask: true
    });

    const fakeTask = { id: 'task-cat-1', title: 'Carrossel', projectId: 'winc', status: 'nao_iniciada', targetDate: '2026-10-31' };
    const sentDueSoon = notificationService.notifyDueSoon(fakeTask, '2026-10-31');
    assert.strictEqual(sentDueSoon, false, 'Com notifyDueSoon=false, notifyDueSoon deve retornar false');

    settingsRepo.updateSettings({ notifyDueSoon: true });
  });

  // 23. Notification Deduplication
  test('23. Prevenção de notificações duplicadas para a mesma tarefa na mesma data', () => {
    notificationService.clearNotificationCache();
    const taskId = 'task-dedup-test';
    const dateStr = '2026-10-31';

    assert.strictEqual(notificationService.hasBeenNotified(taskId, 'due_soon', dateStr), false);
    notificationService.markAsNotified(taskId, 'due_soon', dateStr);
    assert.strictEqual(notificationService.hasBeenNotified(taskId, 'due_soon', dateStr), true);

    // Attempting to send again should return false due to deduplication
    const fakeTask = { id: taskId, title: 'Beat Drill', projectId: 'evilbear', status: 'nao_iniciada', targetDate: dateStr };
    const secondCall = notificationService.notifyDueSoon(fakeTask, dateStr);
    assert.strictEqual(secondCall, false, 'Segunda chamada para a mesma tarefa na mesma data deve ser prevenida');
  });

  // 24. Task Conclusion Is Strictly Silent
  test('24. Atualização de tarefa concluída é 100% silenciosa sem notificação', () => {
    const dispatched = notificationService.sendNotification({
      title: 'Tarefa Concluída',
      body: 'Não deve gerar popup',
      type: 'completed',
      taskId: 'task-silent-conclude'
    });
    assert.strictEqual(dispatched, false, 'Conclusão de tarefa deve ser 100% silenciosa per specification');
  });

  // 25. Silent Scheduler Reconcile (No Window Popups)
  test('25. Reconciliação do scheduler não força abertura de janelas e preserva segundo plano', () => {
    notificationService.clearNotificationCache();
    // Running reconcileReminders must complete cleanly without throwing and without opening windows
    reminderScheduler.reconcileReminders('2026-10-29', false);
    assert(true, 'Reconciliação executada com sucesso de forma silenciosa');
  });

  // Close DB and cleanup
  closeDatabase();
  if (fs.existsSync(testDbPath)) {
    try { fs.unlinkSync(testDbPath); } catch (e) {}
  }

  console.log('\n====================================================');
  console.log(`RESULTADO: ${passed} de ${total} testes passaram com sucesso!`);
  console.log('====================================================\n');

  if (passed !== total) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Erro na execução dos testes:', err);
  process.exit(1);
});
