import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  Layers,
  Flag,
  User,
  Repeat,
  Bell,
  CheckSquare,
  Plus,
  Trash2,
  Sparkles
} from 'lucide-react';
import { useTaskHub } from '../../context/TaskHubContext';
import {
  ProjectId,
  TaskPriority,
  TaskStatus,
  RecurrenceType,
  ChecklistItem,
  WINC_CATEGORIES,
  EVILBEAR_CATEGORIES,
  PESSOAL_CATEGORIES
} from '../../types';
import { cn } from '../../lib/utils';
import { playChimeSound } from '../../lib/sounds';

export const NewTaskModal: React.FC = () => {
  const {
    isNewTaskModalOpen,
    setIsNewTaskModalOpen,
    targetNewTaskDate,
    setTargetNewTaskDate,
    selectedProject,
    clients,
    createTask
  } = useTaskHub();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState<ProjectId>(
    selectedProject !== 'todos' ? selectedProject : 'winc'
  );
  const [category, setCategory] = useState<string>(WINC_CATEGORIES[0]);
  const [clientId, setClientId] = useState<string>('');
  const [targetDate, setTargetDate] = useState<string>('');
  const [targetTime, setTargetTime] = useState<string>('');
  const [deliveryDate, setDeliveryDate] = useState<string>('');
  const [priority, setPriority] = useState<TaskPriority>('media');
  const [status, setStatus] = useState<TaskStatus>('nao_iniciada');
  const [recurrence, setRecurrence] = useState<RecurrenceType>('none');
  const [recurrenceDays, setRecurrenceDays] = useState<number[]>([]);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderTime, setReminderTime] = useState('00:00');
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [newChecklistText, setNewChecklistText] = useState('');

  useEffect(() => {
    if (isNewTaskModalOpen) {
      const defaultDate = targetNewTaskDate || (() => {
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const d = String(now.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
      })();
      setTargetDate(defaultDate);
      if (selectedProject !== 'todos') {
        setProjectId(selectedProject);
        if (selectedProject === 'winc') setCategory(WINC_CATEGORIES[0]);
        else if (selectedProject === 'evilbear') setCategory(EVILBEAR_CATEGORIES[0]);
        else setCategory(PESSOAL_CATEGORIES[0]);
      }
    }
  }, [isNewTaskModalOpen, targetNewTaskDate, selectedProject]);

  if (!isNewTaskModalOpen) return null;

  const handleProjectSelect = (p: ProjectId) => {
    setProjectId(p);
    if (p === 'winc') setCategory(WINC_CATEGORIES[0]);
    else if (p === 'evilbear') setCategory(EVILBEAR_CATEGORIES[0]);
    else setCategory(PESSOAL_CATEGORIES[0]);
  };

  const handleAddChecklistItem = () => {
    if (!newChecklistText.trim()) return;
    setChecklist([
      ...checklist,
      { id: Math.random().toString(), title: newChecklistText.trim(), completed: false }
    ]);
    setNewChecklistText('');
  };

  const handleRemoveChecklistItem = (id: string) => {
    setChecklist(checklist.filter(i => i.id !== id));
  };

  const handleToggleDay = (day: number) => {
    if (recurrenceDays.includes(day)) {
      setRecurrenceDays(recurrenceDays.filter(d => d !== day));
    } else {
      setRecurrenceDays([...recurrenceDays, day]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !targetDate) return;

    const clientObj = clients.find(c => c.id === clientId);

    await createTask({
      title: title.trim(),
      description: description.trim(),
      projectId,
      category,
      clientId: clientId || undefined,
      clientName: clientObj?.name || undefined,
      targetDate,
      targetTime: targetTime || undefined,
      deliveryDate: deliveryDate || undefined,
      priority,
      status,
      recurrence,
      recurrenceDays,
      reminderEnabled,
      reminderTime: reminderTime || '00:00',
      checklist
    });

    playChimeSound('success');
    setIsNewTaskModalOpen(false);
    setTargetNewTaskDate(undefined);
    // Reset state
    setTitle('');
    setDescription('');
    setChecklist([]);
  };

  const categories = projectId === 'winc'
    ? WINC_CATEGORIES
    : projectId === 'evilbear'
    ? EVILBEAR_CATEGORIES
    : PESSOAL_CATEGORIES;

  const daysOfWeek = [
    { num: 0, label: 'D' },
    { num: 1, label: 'S' },
    { num: 2, label: 'T' },
    { num: 3, label: 'Q' },
    { num: 4, label: 'Q' },
    { num: 5, label: 'S' },
    { num: 6, label: 'S' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md select-none overflow-y-auto">
      <div className="w-full max-w-2xl bg-[#111420] border border-purple-500/40 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#141826]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h2 className="text-base font-bold text-white tracking-wide">
              Nova Demanda / Tarefa
            </h2>
          </div>
          <button
            onClick={() => {
              setIsNewTaskModalOpen(false);
              setTargetNewTaskDate(undefined);
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Project Choice */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Projeto Principal
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['winc', 'evilbear', 'pessoal'] as ProjectId[]).map((p) => {
                const isSelected = projectId === p;
                const labels = {
                  winc: 'Agência Winc',
                  evilbear: 'EVILBEAR.JPG',
                  pessoal: 'Pessoal / Outras'
                };
                return (
                  <button
                    type="button"
                    key={p}
                    onClick={() => handleProjectSelect(p)}
                    className={cn(
                      'py-2 px-3 rounded-xl text-xs font-semibold border transition-all',
                      isSelected
                        ? p === 'winc'
                          ? 'bg-purple-600/30 text-purple-300 border-purple-500 shadow-[0_0_15px_rgba(147,51,234,0.3)]'
                          : p === 'evilbear'
                          ? 'bg-red-600/30 text-red-300 border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.3)]'
                          : 'bg-emerald-600/30 text-emerald-300 border-emerald-500'
                        : 'bg-white/5 text-slate-400 border-white/5 hover:border-white/20'
                    )}
                  >
                    {labels[p]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Título da Tarefa *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Criar carrosséis para os clientes"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Descrição Detalhada
            </label>
            <textarea
              rows={3}
              placeholder="Instruções, especificações, referências..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>

          {/* Category & Client */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Categoria
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#171b29] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {projectId === 'winc' && (
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Cliente Associado (Opcional)
                </label>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#171b29] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
                >
                  <option value="">Nenhum cliente selecionado</option>
                  {clients.filter(c => c.active).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.company ? `(${c.company})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Dates & Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Data de Execução *
              </label>
              <input
                type="date"
                required
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#171b29] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Horário (Opcional)
              </label>
              <input
                type="time"
                value={targetTime}
                onChange={(e) => setTargetTime(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#171b29] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Prazo de Entrega Final
              </label>
              <input
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#171b29] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Priority & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Prioridade
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#171b29] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
              >
                <option value="baixa">Baixa</option>
                <option value="media">Média</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Status Inicial
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#171b29] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
              >
                <option value="nao_iniciada">Não iniciada</option>
                <option value="em_andamento">Em andamento</option>
                <option value="aguardando_material">Aguardando material</option>
                <option value="aguardando_aprovacao">Aguardando aprovação</option>
                <option value="em_revisao">Em revisão</option>
                <option value="concluida">Concluída</option>
              </select>
            </div>
          </div>

          {/* Recurrence Engine */}
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <Repeat className="w-4 h-4 text-purple-400" />
                <span>Repetição / Recorrência Automática</span>
              </div>
              <select
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value as RecurrenceType)}
                className="px-2.5 py-1 rounded-lg bg-[#171b29] border border-white/10 text-xs text-white focus:outline-none"
              >
                <option value="none">Sem repetição</option>
                <option value="daily">Diária (Todos os dias)</option>
                <option value="weekly">Semanal</option>
                <option value="biweekly">Quinzenal</option>
                <option value="monthly">Mensal</option>
                <option value="specific_days">Dias específicos da semana</option>
              </select>
            </div>

            {recurrence === 'specific_days' && (
              <div className="flex items-center gap-1.5 pt-2">
                <span className="text-[11px] text-slate-400 mr-2">Repetir em:</span>
                {daysOfWeek.map((d) => {
                  const active = recurrenceDays.includes(d.num);
                  return (
                    <button
                      type="button"
                      key={d.num}
                      onClick={() => handleToggleDay(d.num)}
                      className={cn(
                        'w-7 h-7 rounded-lg text-xs font-bold transition-all',
                        active
                          ? 'bg-purple-600 text-white shadow-[0_0_10px_rgba(147,51,234,0.4)]'
                          : 'bg-white/5 text-slate-400 hover:bg-white/10'
                      )}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Persistent Midnight Reminder Box */}
          <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-600/20 text-purple-400">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-purple-200 block">
                  Lembrete Persistente na Virada do Dia (00h00)
                </span>
                <span className="text-[10px] text-slate-400">
                  Fixará automaticamente na janela flutuante Always-On-Top ao iniciar a data.
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="px-2 py-1 rounded bg-[#171b29] border border-purple-500/30 text-xs text-purple-300 font-mono"
              />
              <input
                type="checkbox"
                checked={reminderEnabled}
                onChange={(e) => setReminderEnabled(e.target.checked)}
                className="w-4 h-4 accent-purple-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Checklist Section */}
          <div className="space-y-2">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Checklist / Subtarefas
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Adicionar item à checklist..."
                value={newChecklistText}
                onChange={(e) => setNewChecklistText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddChecklistItem();
                  }
                }}
                className="flex-1 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddChecklistItem}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-purple-600 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar</span>
              </button>
            </div>

            {checklist.length > 0 && (
              <div className="space-y-1 pt-1 max-h-32 overflow-y-auto">
                {checklist.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5 text-xs text-slate-200"
                  >
                    <span>{item.title}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveChecklistItem(item.id)}
                      className="p-1 text-slate-400 hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => {
                setIsNewTaskModalOpen(false);
                setTargetNewTaskDate(undefined);
              }}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-[0_0_15px_rgba(147,51,234,0.4)] transition-all"
            >
              Criar Demanda
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
