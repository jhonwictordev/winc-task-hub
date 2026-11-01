import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  HardDrive,
  Download,
  Upload,
  FileSpreadsheet,
  Bell,
  BellOff,
  Monitor,
  CheckCircle2,
  AlertCircle,
  FileText,
  Trash2,
  Keyboard,
  Shield,
  Eye,
  Minimize2
} from 'lucide-react';
import { useTaskHub } from '../../context/TaskHubContext';
import { ErrorLogEntry } from '../../types';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    refreshAll
  } = useTaskHub();

  const [logs, setLogs] = useState<ErrorLogEntry[]>([]);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [customShortcut, setCustomShortcut] = useState(settings.globalShortcutToggle || 'CommandOrControl+Shift+T');
  const [shortcutStatus, setShortcutStatus] = useState<{ conflict?: boolean; message?: string }>({});

  const api = window.electronAPI;

  const loadLogs = async () => {
    if (api) {
      const errorLogs = await api.getErrorLogs();
      setLogs(errorLogs);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  useEffect(() => {
    if (settings.globalShortcutToggle) {
      setCustomShortcut(settings.globalShortcutToggle);
    }
  }, [settings.globalShortcutToggle]);

  const handleToggle = async (key: keyof typeof settings, value: any) => {
    await updateSettings({ [key]: value });
    showSuccess('Configuração atualizada com sucesso!');
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(''), 4000);
  };

  // Test and update shortcut
  const handleApplyShortcut = async () => {
    if (!api) return;
    try {
      const test = await api.checkShortcutConflict(customShortcut);
      if (test.conflict && customShortcut !== settings.globalShortcutToggle) {
        setShortcutStatus({ conflict: true, message: 'Conflito detectado: este atalho já está em uso por outro aplicativo.' });
        showError('Conflito: atalho já em uso.');
        return;
      }

      await updateSettings({ globalShortcutToggle: customShortcut });
      setShortcutStatus({ conflict: false, message: 'Atalho registrado com sucesso!' });
      showSuccess(`Atalho atualizado para "${customShortcut.replace('CommandOrControl', 'Ctrl')}"`);
    } catch (e: any) {
      setShortcutStatus({ conflict: true, message: e.message });
      showError('Erro ao registrar atalho: ' + e.message);
    }
  };

  const handleResetShortcut = async () => {
    const defaultSc = 'CommandOrControl+Shift+T';
    setCustomShortcut(defaultSc);
    if (api) {
      await updateSettings({ globalShortcutToggle: defaultSc });
      setShortcutStatus({ conflict: false, message: 'Atalho redefinido para o padrão (Ctrl + Shift + T).' });
      showSuccess('Atalho restaurado para Ctrl + Shift + T');
    }
  };

  // Export JSON Backup
  const handleExportBackup = async () => {
    if (api) {
      try {
        const backupData = await api.exportBackup();
        const jsonStr = JSON.stringify(backupData, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `winc_task_hub_backup_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showSuccess('Backup JSON exportado com sucesso!');
      } catch (e: any) {
        showError('Erro ao exportar backup: ' + e.message);
      }
    }
  };

  // Import JSON Backup
  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (api) {
          await api.importBackup(json);
          await refreshAll();
          showSuccess('Dados restaurados com sucesso a partir do backup!');
        }
      } catch (err: any) {
        showError('Falha ao restaurar: arquivo JSON inválido ou incompatível.');
      }
    };
    reader.readAsText(file);
  };

  // Export CSV
  const handleExportCSV = async () => {
    if (api) {
      try {
        const csvContent = await api.exportCSV();
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `winc_tarefas_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        showSuccess('Tarefas exportadas para CSV com sucesso!');
      } catch (e: any) {
        showError('Erro ao exportar CSV: ' + e.message);
      }
    }
  };

  const handleClearLogs = async () => {
    if (api) {
      await api.clearErrorLogs();
      setLogs([]);
      showSuccess('Logs limpos.');
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full p-6 select-none overflow-y-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-6 border-b border-white/5">
        <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
          <SettingsIcon className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-wide">
            CONFIGURAÇÕES DE UX & SISTEMA
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            Comportamento silencioso, acesso sob demanda, atalhos, notificações discretas e integridade do banco de dados.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Grid: Non-Intrusive UX, Notifications, Shortcuts, Backups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. Comportamento Não Invasivo & Acesso Sob Demanda */}
        <div className="p-5 rounded-2xl bg-[#111420] border border-white/5 space-y-4">
          <h3 className="text-sm font-bold text-white pb-2 border-b border-white/5 flex items-center gap-2">
            <Monitor className="w-4 h-4 text-purple-400" />
            <span>Comportamento do Painel (Não Invasivo)</span>
          </h3>

          <div className="space-y-3 text-xs">
            {/* Abrir Painel Manualmente */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
              <div className="pr-2">
                <span className="font-semibold text-white block">Abrir painel apenas manualmente</span>
                <span className="text-[11px] text-slate-400">
                  O painel nunca abre sozinho. Exibe somente sob sua solicitação via atalho, clique ou bandeja.
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.openPanelManually ?? true}
                onChange={(e) => handleToggle('openPanelManually', e.target.checked)}
                className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
              />
            </div>

            {/* Iniciar Minimizado na Bandeja */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
              <div className="pr-2">
                <span className="font-semibold text-white block">Iniciar minimizado na bandeja</span>
                <span className="text-[11px] text-slate-400">
                  Ao abrir o app ou iniciar o Windows, permanece silencioso na bandeja sem exibir janela na tela.
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.startMinimizedToTray ?? true}
                onChange={(e) => handleToggle('startMinimizedToTray', e.target.checked)}
                className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
              />
            </div>

            {/* Always On Top (Modo Sempre Visível) */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
              <div className="pr-2">
                <span className="font-semibold text-white block">Modo sempre visível (Always on Top)</span>
                <span className="text-[11px] text-slate-400">
                  Mantém a janela fixada acima de outros programas. (Desativado por padrão para não interromper seu foco).
                </span>
              </div>
              <input
                type="checkbox"
                checked={Boolean(settings.alwaysOnTop)}
                onChange={(e) => handleToggle('alwaysOnTop', e.target.checked)}
                className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
              />
            </div>

            {/* Modo Não Perturbe */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
              <div className="pr-2">
                <span className="font-semibold text-white block">Modo Não Perturbe (DND)</span>
                <span className="text-[11px] text-slate-400">
                  Silencia temporariamente todas as notificações sem pausar os serviços de tarefas.
                </span>
              </div>
              <input
                type="checkbox"
                checked={Boolean(settings.doNotDisturb)}
                onChange={(e) => handleToggle('doNotDisturb', e.target.checked)}
                className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
              />
            </div>

            {/* Minimizar para a Bandeja ao Fechar */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
              <div className="pr-2">
                <span className="font-semibold text-white block">Ocultar ao clicar em Fechar (X)</span>
                <span className="text-[11px] text-slate-400">
                  Oculta a janela completamente mantendo os serviços em segundo plano na bandeja do sistema.
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.minimizeToTrayOnClose ?? true}
                onChange={(e) => handleToggle('minimizeToTrayOnClose', e.target.checked)}
                className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
              />
            </div>

            {/* Iniciar com o Windows */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
              <div className="pr-2">
                <span className="font-semibold text-white block">Iniciar com o Windows</span>
                <span className="text-[11px] text-slate-400">
                  Inicia automaticamente em segundo plano ao ligar o computador.
                </span>
              </div>
              <input
                type="checkbox"
                checked={Boolean(settings.startWithWindows)}
                onChange={(e) => handleToggle('startWithWindows', e.target.checked)}
                className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* 2. Atalhos de Acesso Rápido Globais */}
        <div className="p-5 rounded-2xl bg-[#111420] border border-white/5 space-y-4">
          <h3 className="text-sm font-bold text-white pb-2 border-b border-white/5 flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-purple-400" />
            <span>Atalhos Globais de Acesso Rápido</span>
          </h3>

          <div className="space-y-3 text-xs">
            {/* Atalho de Abertura do Painel */}
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-white block">Atalho de Abertura / Alternância</span>
                  <span className="text-[11px] text-slate-400">
                    Abre ou oculta o WINC Task Hub instantaneamente a partir de qualquer aplicativo.
                  </span>
                </div>
                <kbd className="px-2.5 py-1 font-mono text-xs rounded bg-purple-950/60 border border-purple-500/40 text-purple-300 font-bold">
                  {customShortcut.replace('CommandOrControl', 'Ctrl')}
                </kbd>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={customShortcut}
                  onChange={(e) => setCustomShortcut(e.target.value)}
                  placeholder="Ex: CommandOrControl+Shift+T"
                  className="flex-1 px-3 py-1.5 rounded-lg bg-[#171b29] border border-white/10 text-white font-mono text-xs focus:border-purple-500 focus:outline-none"
                />
                <button
                  onClick={handleApplyShortcut}
                  className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-colors shrink-0"
                >
                  Salvar
                </button>
                <button
                  onClick={handleResetShortcut}
                  className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs transition-colors shrink-0"
                  title="Restaurar padrão Ctrl + Shift + T"
                >
                  Padrão
                </button>
              </div>

              {shortcutStatus.message && (
                <div className={`text-[11px] font-medium mt-1 ${shortcutStatus.conflict ? 'text-red-400' : 'text-emerald-400'}`}>
                  {shortcutStatus.message}
                </div>
              )}
            </div>

            {/* Formas de Acesso Rápido Info */}
            <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 space-y-2 text-[11px] text-purple-200">
              <span className="font-bold block text-white">3 Formas Práticas de Acessar o Painel:</span>
              <ul className="list-disc list-inside space-y-1 text-slate-300">
                <li><strong className="text-purple-300">Ícone na Bandeja (System Tray):</strong> clique para abrir ou fechar.</li>
                <li><strong className="text-purple-300">Atalho Global:</strong> pressione <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono">Ctrl + Shift + T</kbd>.</li>
                <li><strong className="text-purple-300">Clique no Ícone do App:</strong> abre ou restaura o painel se já estiver em execução.</li>
              </ul>
            </div>

            {/* Captura Rápida Info */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
              <div>
                <span className="font-semibold text-white block">Captura Rápida de Tarefas</span>
                <span className="text-[11px] text-slate-400">
                  Modal instantâneo centralizado para cadastrar ideias em 3 segundos.
                </span>
              </div>
              <kbd className="px-2 py-0.5 font-mono text-[11px] rounded bg-white/10 text-white">
                Ctrl + Shift + Espaço
              </kbd>
            </div>
          </div>
        </div>

        {/* 3. Notificações Inteligentes do Sistema */}
        <div className="p-5 rounded-2xl bg-[#111420] border border-white/5 space-y-4">
          <h3 className="text-sm font-bold text-white pb-2 border-b border-white/5 flex items-center gap-2">
            <Bell className="w-4 h-4 text-purple-400" />
            <span>Notificações Inteligentes do Sistema</span>
          </h3>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            Substituem as janelas invasivas por notificações nativas e discretas do Windows. Elas nunca roubam o foco da sua tela e você pode clicar nelas para abrir a tarefa correspondente.
          </p>

          <div className="space-y-3 text-xs">
            {/* Master Toggle Notificações */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-purple-950/30 border border-purple-500/30">
              <div className="pr-2">
                <span className="font-semibold text-white block">Ativar Notificações do Sistema</span>
                <span className="text-[11px] text-slate-400">
                  Alertas discretos via Central de Ações do Windows.
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.notificationsEnabled ?? true}
                onChange={(e) => handleToggle('notificationsEnabled', e.target.checked)}
                className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
              />
            </div>

            {/* Tarefas Próximas do Prazo */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
              <div className="pr-2">
                <span className="font-semibold text-white block">Tarefas com prazo hoje</span>
                <span className="text-[11px] text-slate-400">
                  Notifica discretamente tarefas agendadas para o dia atual.
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.notifyDueSoon ?? true}
                onChange={(e) => handleToggle('notifyDueSoon', e.target.checked)}
                className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
              />
            </div>

            {/* Tarefas Vencidas */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
              <div className="pr-2">
                <span className="font-semibold text-white block">Tarefas vencidas (atrasadas)</span>
                <span className="text-[11px] text-slate-400">
                  Notifica tarefas pendentes de dias anteriores para evitar esquecimentos.
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.notifyOverdue ?? true}
                onChange={(e) => handleToggle('notifyOverdue', e.target.checked)}
                className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
              />
            </div>

            {/* Novas Tarefas */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
              <div className="pr-2">
                <span className="font-semibold text-white block">Novas tarefas cadastradas</span>
                <span className="text-[11px] text-slate-400">
                  Notifica confirmação discreta ao adicionar uma nova demanda.
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.notifyNewTask ?? true}
                onChange={(e) => handleToggle('notifyNewTask', e.target.checked)}
                className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
              />
            </div>

            {/* Tarefa Concluída: Nota Silenciosa */}
            <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-emerald-300 text-[11px] flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Conclusão de tarefas: atualização 100% silenciosa sem emissão de popups.</span>
            </div>
          </div>
        </div>

        {/* 4. Backup & Armazenamento Local */}
        <div className="p-5 rounded-2xl bg-[#111420] border border-white/5 space-y-4">
          <h3 className="text-sm font-bold text-white pb-2 border-b border-white/5 flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-purple-400" />
            <span>Armazenamento Local & Backup de Segurança</span>
          </h3>

          <p className="text-xs text-slate-400 leading-relaxed">
            Seus dados são salvos localmente em banco SQLite com transações atômicas ACID e modo WAL (Write-Ahead Logging). Exporte ou restaure backups a qualquer momento de forma offline.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {/* Export JSON */}
            <button
              onClick={handleExportBackup}
              className="p-3.5 rounded-xl bg-purple-950/30 hover:bg-purple-900/40 border border-purple-500/30 text-purple-300 flex items-center gap-3 text-xs font-semibold transition-all group"
            >
              <Download className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <span className="block text-white font-bold">Exportar Backup JSON</span>
                <span className="text-[10px] text-slate-400 font-normal">Todas as tabelas do SQLite</span>
              </div>
            </button>

            {/* Import JSON */}
            <label className="p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 flex items-center gap-3 text-xs font-semibold cursor-pointer transition-all group">
              <Upload className="w-5 h-5 text-slate-400 group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <span className="block text-white font-bold">Restaurar Backup</span>
                <span className="text-[10px] text-slate-400 font-normal">Carregar arquivo .json</span>
              </div>
              <input
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
              />
            </label>

            {/* Export CSV */}
            <button
              onClick={handleExportCSV}
              className="p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 flex items-center gap-3 text-xs font-semibold transition-all group sm:col-span-2"
            >
              <FileSpreadsheet className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <span className="block text-white font-bold">Exportar Demandas em CSV</span>
                <span className="text-[10px] text-slate-400 font-normal">Compatível com Excel e Google Planilhas (UTF-8 BOM)</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Error Logs Section */}
      <div className="p-5 rounded-2xl bg-[#111420] border border-white/5">
        <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-white">Registro de Eventos & Logs de Erro</h3>
          </div>
          {logs.length > 0 && (
            <button
              onClick={handleClearLogs}
              className="text-xs text-slate-400 hover:text-red-400 flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpar Logs</span>
            </button>
          )}
        </div>

        {logs.length === 0 ? (
          <div className="py-6 text-center text-slate-500 text-xs">
            Nenhum erro registrado. O sistema está funcionando de forma silenciosa e estável.
          </div>
        ) : (
          <div className="max-h-48 overflow-y-auto space-y-2 text-xs">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-2.5 rounded-lg bg-white/5 border border-white/5 flex items-start justify-between gap-3 font-mono text-[11px]"
              >
                <div>
                  <span className="text-purple-400 font-bold mr-2">[{log.level.toUpperCase()}]</span>
                  <span className="text-white">{log.message}</span>
                  {log.details && (
                    <div className="text-slate-400 text-[10px] mt-1">{log.details}</div>
                  )}
                </div>
                <span className="text-slate-500 text-[10px] shrink-0">{log.timestamp.slice(0, 19)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
