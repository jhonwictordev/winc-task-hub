import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Calendar,
  Clock,
  Layers,
  Flag,
  CornerDownLeft,
  X
} from 'lucide-react';
import { ProjectId, TaskPriority, WINC_CATEGORIES, EVILBEAR_CATEGORIES, PESSOAL_CATEGORIES } from '../../types';
import { cn } from '../../lib/utils';
import { playChimeSound } from '../../lib/sounds';

export const QuickCaptureApp: React.FC = () => {
  const [title, setTitle] = useState('');
  const [projectId, setProjectId] = useState<ProjectId>('winc');
  const [category, setCategory] = useState<string>(WINC_CATEGORIES[0]);
  const [targetDate, setTargetDate] = useState<string>(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  });
  const [targetTime, setTargetTime] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('media');
  const [description, setDescription] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);
  const api = window.electronAPI;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Update default category when project changes
  const handleProjectChange = (p: ProjectId) => {
    setProjectId(p);
    if (p === 'winc') setCategory(WINC_CATEGORIES[0]);
    else if (p === 'evilbear') setCategory(EVILBEAR_CATEGORIES[0]);
    else setCategory(PESSOAL_CATEGORIES[0]);
  };

  const handleClose = () => {
    if (api) {
      api.hideQuickCapture();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (api) {
      await api.createTask({
        title: title.trim(),
        description: description.trim(),
        projectId,
        category,
        targetDate,
        targetTime: targetTime || undefined,
        priority,
        reminderEnabled: true,
        reminderTime: '00:00'
      });
      playChimeSound('success');
      setTitle('');
      setDescription('');
      api.hideQuickCapture();
    }
  };

  // Keyboard navigation: Escape closes
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  const categories = projectId === 'winc'
    ? WINC_CATEGORIES
    : projectId === 'evilbear'
    ? EVILBEAR_CATEGORIES
    : PESSOAL_CATEGORIES;

  return (
    <div
      onKeyDown={handleKeyDown}
      className="flex flex-col w-full h-full bg-[#111420] border border-purple-500/40 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.8)] p-4 text-slate-100 select-none overflow-hidden"
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="font-bold tracking-wider text-purple-300 uppercase">
            Captura Rápida
          </span>
        </div>
        <button
          onClick={handleClose}
          className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between pt-3">
        {/* Main Title Input */}
        <div>
          <input
            ref={inputRef}
            type="text"
            placeholder="O que você precisa fazer?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-transparent text-base font-medium placeholder-slate-500 text-white focus:outline-none"
          />
          <input
            type="text"
            placeholder="Detalhes ou notas adicionais (opcional)..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-transparent text-xs text-slate-400 placeholder-slate-600 focus:outline-none mt-2"
          />
        </div>

        {/* Project Selector Pills */}
        <div className="flex items-center gap-2 my-3">
          {(['winc', 'evilbear', 'pessoal'] as ProjectId[]).map((p) => {
            const isSelected = projectId === p;
            const labels = {
              winc: 'Agência Winc',
              evilbear: 'EVILBEAR.JPG',
              pessoal: 'Pessoal'
            };
            return (
              <button
                type="button"
                key={p}
                onClick={() => handleProjectChange(p)}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all border',
                  isSelected
                    ? p === 'winc'
                      ? 'bg-purple-600/30 text-purple-300 border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                      : p === 'evilbear'
                      ? 'bg-red-600/30 text-red-300 border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.3)]'
                      : 'bg-emerald-600/30 text-emerald-300 border-emerald-500/50'
                    : 'bg-white/5 text-slate-400 border-white/5 hover:border-white/20'
                )}
              >
                {labels[p]}
              </button>
            );
          })}
        </div>

        {/* Category, Date & Priority Controls */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          {/* Category */}
          <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5">
            <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-transparent text-[11px] text-slate-200 focus:outline-none w-full truncate cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c} value={c} className="bg-[#171b29] text-white">
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5">
            <Calendar className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="bg-transparent text-[11px] text-slate-200 focus:outline-none w-full cursor-pointer"
            />
          </div>

          {/* Priority */}
          <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5">
            <Flag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="bg-transparent text-[11px] text-slate-200 focus:outline-none w-full cursor-pointer"
            >
              <option value="baixa" className="bg-[#171b29] text-slate-300">Baixa</option>
              <option value="media" className="bg-[#171b29] text-slate-300">Média</option>
              <option value="alta" className="bg-[#171b29] text-purple-400">Alta</option>
              <option value="urgente" className="bg-[#171b29] text-red-400 font-bold">Urgente</option>
            </select>
          </div>
        </div>

        {/* Footer info & Submit */}
        <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/10 text-xs">
          <span className="text-[10px] text-slate-500">
            Esc para cancelar • ↵ para salvar
          </span>
          <button
            type="submit"
            disabled={!title.trim()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_12px_rgba(147,51,234,0.3)]"
          >
            <span>Salvar Tarefa</span>
            <CornerDownLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
};
