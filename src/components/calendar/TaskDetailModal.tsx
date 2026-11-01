import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  Clock,
  Pin,
  Copy,
  Trash2,
  Calendar,
  Layers,
  Flag,
  User,
  Plus,
  ExternalLink,
  Repeat,
  Sparkles
} from 'lucide-react';
import { useTaskHub } from '../../context/TaskHubContext';
import { TaskItem, TaskPriority, TaskStatus, ChecklistItem } from '../../types';
import { cn, formatDatePT } from '../../lib/utils';
import { playChimeSound } from '../../lib/sounds';

export const TaskDetailModal: React.FC = () => {
  const {
    activeTaskId,
    setActiveTaskId,
    tasks,
    updateTask,
    deleteTask,
    duplicateTask,
    concludeTask,
    snoozeTask,
    unpinTask,
    pinTask
  } = useTaskHub();

  const task = tasks.find(t => t.id === activeTaskId);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('media');
  const [status, setStatus] = useState<TaskStatus>('nao_iniciada');
  const [targetDate, setTargetDate] = useState('');
  const [targetTime, setTargetTime] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [newChecklistText, setNewChecklistText] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setPriority(task.priority);
      setStatus(task.status);
      setTargetDate(task.targetDate);
      setTargetTime(task.targetTime || '');
      setDeliveryDate(task.deliveryDate || '');
      setChecklist(task.checklist || []);
      setIsEditing(false);
    }
  }, [task]);

  if (!task || !activeTaskId) return null;

  const handleToggleChecklist = async (itemId: string) => {
    const updated = checklist.map(i => i.id === itemId ? { ...i, completed: !i.completed } : i);
    setChecklist(updated);
    await updateTask(task.id, { checklist: updated });
  };

  const handleAddChecklistItem = async () => {
    if (!newChecklistText.trim()) return;
    const updated = [
      ...checklist,
      { id: Math.random().toString(), title: newChecklistText.trim(), completed: false }
    ];
    setChecklist(updated);
    setNewChecklistText('');
    await updateTask(task.id, { checklist: updated });
  };

  const handleSaveChanges = async () => {
    await updateTask(task.id, {
      title,
      description,
      priority,
      status,
      targetDate,
      targetTime: targetTime || undefined,
      deliveryDate: deliveryDate || undefined,
      checklist
    });
    setIsEditing(false);
  };

  const handleConclude = async () => {
    await concludeTask(task.id);
    setActiveTaskId(null);
  };

  const handleDelete = async () => {
    if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
      await deleteTask(task.id);
      setActiveTaskId(null);
    }
  };

  const handleDuplicate = async () => {
    await duplicateTask(task.id);
    playChimeSound('success');
  };

  const completedCount = checklist.filter(c => c.completed).length;
  const checklistPercent = checklist.length > 0 ? Math.round((completedCount / checklist.length) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md select-none overflow-y-auto">
      <div className="w-full max-w-2xl bg-[#111420] border border-purple-500/40 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden my-8">
        {/* Top bar with quick action buttons */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-white/10 bg-[#141826]">
          <div className="flex items-center gap-2">
            <span className={cn(
              'px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider',
              task.projectId === 'winc' ? 'bg-purple-600/30 text-purple-300' :
              task.projectId === 'evilbear' ? 'bg-red-600/30 text-red-300' : 'bg-emerald-600/30 text-emerald-300'
            )}>
              {task.projectId === 'winc' ? 'Agência Winc' : task.projectId === 'evilbear' ? 'EVILBEAR.JPG' : 'Pessoal'}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {task.category}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Conclude */}
            <button
              onClick={handleConclude}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all',
                task.status === 'concluida'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white'
              )}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{task.status === 'concluida' ? 'Concluída' : 'Concluir'}</span>
            </button>

            {/* Pin / Unpin */}
            <button
              onClick={() => task.isPinned ? unpinTask(task.id) : pinTask(task.id)}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all',
                task.isPinned
                  ? 'bg-purple-600 text-white shadow-[0_0_12px_rgba(147,51,234,0.4)]'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300'
              )}
              title={task.isPinned ? 'Desfixar da janela flutuante' : 'Fixar na janela flutuante'}
            >
              <Pin className={cn('w-4 h-4', !task.isPinned && 'rotate-45')} />
              <span>{task.isPinned ? 'Fixada' : 'Fixar'}</span>
            </button>

            {/* Duplicate */}
            <button
              onClick={handleDuplicate}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Duplicar tarefa"
            >
              <Copy className="w-4 h-4" />
            </button>

            {/* Delete */}
            <button
              onClick={handleDelete}
              className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Excluir tarefa"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* Close */}
            <button
              onClick={() => setActiveTaskId(null)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Title & Status */}
          <div className="space-y-2">
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setIsEditing(true);
              }}
              className="w-full text-lg font-bold text-white bg-transparent border-b border-transparent hover:border-white/20 focus:border-purple-500 focus:outline-none py-1"
            />
            {task.clientName && (
              <div className="flex items-center gap-1.5 text-xs text-purple-400 font-semibold">
                <User className="w-3.5 h-3.5" />
                <span>Cliente: {task.clientName}</span>
              </div>
            )}
          </div>

          {/* Metadata Cards Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 text-xs">
            {/* Target Date */}
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Data de Execução</span>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => {
                  setTargetDate(e.target.value);
                  setIsEditing(true);
                }}
                className="bg-transparent text-white font-medium text-xs mt-1 w-full focus:outline-none cursor-pointer"
              />
            </div>

            {/* Target Time */}
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Horário</span>
              <input
                type="time"
                value={targetTime}
                onChange={(e) => {
                  setTargetTime(e.target.value);
                  setIsEditing(true);
                }}
                className="bg-transparent text-white font-medium text-xs mt-1 w-full focus:outline-none cursor-pointer font-mono"
              />
            </div>

            {/* Priority */}
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Prioridade</span>
              <select
                value={priority}
                onChange={(e) => {
                  setPriority(e.target.value as TaskPriority);
                  setIsEditing(true);
                }}
                className="bg-transparent text-white font-medium text-xs mt-1 w-full focus:outline-none cursor-pointer"
              >
                <option value="baixa" className="bg-[#171b29]">Baixa</option>
                <option value="media" className="bg-[#171b29]">Média</option>
                <option value="alta" className="bg-[#171b29] text-purple-400">Alta</option>
                <option value="urgente" className="bg-[#171b29] text-red-400 font-bold">Urgente</option>
              </select>
            </div>

            {/* Status */}
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Status</span>
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value as TaskStatus);
                  setIsEditing(true);
                }}
                className="bg-transparent text-white font-medium text-xs mt-1 w-full focus:outline-none cursor-pointer"
              >
                <option value="nao_iniciada" className="bg-[#171b29]">Não iniciada</option>
                <option value="em_andamento" className="bg-[#171b29]">Em andamento</option>
                <option value="aguardando_material" className="bg-[#171b29]">Aguardando material</option>
                <option value="aguardando_aprovacao" className="bg-[#171b29]">Aguardando aprovação</option>
                <option value="em_revisao" className="bg-[#171b29]">Em revisão</option>
                <option value="concluida" className="bg-[#171b29] text-emerald-400 font-bold">Concluída</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Descrição
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setIsEditing(true);
              }}
              placeholder="Adicionar descrição detalhada..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500 resize-none leading-relaxed"
            />
          </div>

          {/* Checklist Progress Bar & Items */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Checklist ({completedCount}/{checklist.length})
              </label>
              <span className="text-xs font-mono font-bold text-purple-400">
                {checklistPercent}%
              </span>
            </div>

            {/* Progress bar */}
            {checklist.length > 0 && (
              <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  style={{ width: `${checklistPercent}%` }}
                  className="h-full bg-gradient-to-r from-purple-500 to-emerald-400 transition-all duration-300"
                />
              </div>
            )}

            {/* Checklist Items list */}
            <div className="space-y-1 max-h-40 overflow-y-auto pt-1">
              {checklist.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleToggleChecklist(item.id)}
                  className="flex items-center gap-3 p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 cursor-pointer text-xs transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => {}}
                    className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                  />
                  <span className={cn(
                    item.completed ? 'line-through text-slate-500' : 'text-slate-200'
                  )}>
                    {item.title}
                  </span>
                </div>
              ))}
            </div>

            {/* Add checklist item */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="Adicionar etapa ou subtarefa..."
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
                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold"
              >
                Adicionar
              </button>
            </div>
          </div>

          {/* Recurrence & Lembrete summary info */}
          <div className="grid grid-cols-2 gap-3 text-[11px] pt-2 border-t border-white/5 text-slate-400">
            <div className="flex items-center gap-1.5">
              <Repeat className="w-3.5 h-3.5 text-purple-400" />
              <span>
                Recorrência: {task.recurrence === 'daily' ? 'Diária' : task.recurrence === 'weekly' ? 'Semanal' : task.recurrence === 'monthly' ? 'Mensal' : 'Nenhuma'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-purple-400" />
              <span>
                Lembrete automático: {task.reminderEnabled ? `Sim (${task.reminderTime || '00:00'})` : 'Desativado'}
              </span>
            </div>
          </div>

          {/* Footer Save Button if modified */}
          {isEditing && (
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                onClick={handleSaveChanges}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-[0_0_15px_rgba(147,51,234,0.4)] transition-all"
              >
                Salvar Alterações
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
