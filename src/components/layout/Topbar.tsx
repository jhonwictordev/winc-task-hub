import React, { useState, useEffect } from 'react';
import {
  Search,
  Pin,
  Clock,
  Sparkles,
  Plus,
  Moon,
  Calendar,
  Layers
} from 'lucide-react';
import { useTaskHub } from '../../context/TaskHubContext';
import { ProjectId } from '../../types';
import { cn } from '../../lib/utils';

export const Topbar: React.FC = () => {
  const {
    selectedProject,
    setSelectedProject,
    setIsNewTaskModalOpen,
    setIsGlobalSearchOpen,
    pinnedTasks,
    simulateMidnight
  } = useTaskHub();

  const [currentTime, setCurrentTime] = useState('');
  const [currentDateFormatted, setCurrentDateFormatted] = useState('');
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
      setCurrentDateFormatted(
        now.toLocaleDateString('pt-BR', {
          weekday: 'long',
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSimulateMidnight = async () => {
    setSimulating(true);
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const todayStr = `${y}-${m}-${d}`;
    await simulateMidnight(todayStr);
    setTimeout(() => setSimulating(false), 1200);
  };

  const projectTabs: Array<{ id: 'todos' | ProjectId; label: string }> = [
    { id: 'todos', label: 'Todos os Projetos' },
    { id: 'winc', label: 'Agência Winc' },
    { id: 'evilbear', label: 'EVILBEAR.JPG' },
    { id: 'pessoal', label: 'Pessoal' },
  ];

  return (
    <header className="h-16 px-6 bg-[#0e111a]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between select-none z-10 shrink-0">
      {/* Left: Project Selector tabs */}
      <div className="flex items-center gap-1.5 bg-[#141724] p-1 rounded-xl border border-white/5">
        {projectTabs.map((tab) => {
          const isSelected = selectedProject === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedProject(tab.id)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                isSelected
                  ? tab.id === 'winc'
                    ? 'bg-purple-600 text-white shadow-[0_0_12px_rgba(147,51,234,0.35)]'
                    : tab.id === 'evilbear'
                    ? 'bg-red-600 text-white shadow-[0_0_12px_rgba(220,38,38,0.35)]'
                    : tab.id === 'pessoal'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white/15 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Middle: Global Search trigger */}
      <div className="flex-1 max-w-md mx-6">
        <button
          onClick={() => setIsGlobalSearchOpen(true)}
          className="w-full flex items-center justify-between px-3.5 py-1.5 bg-[#141724] hover:bg-[#191d2c] border border-white/5 hover:border-purple-500/30 rounded-xl text-xs text-slate-400 transition-all group"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-500 group-hover:text-purple-400 transition-colors" />
            <span>Buscar tarefas, clientes, leads ou lançamentos...</span>
          </div>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-white/5 border border-white/10 text-slate-400">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Date & Live Clock */}
        <div className="hidden lg:flex flex-col items-end text-right border-r border-white/10 pr-4">
          <span className="text-[11px] font-semibold text-slate-300 capitalize">
            {currentDateFormatted}
          </span>
          <span className="text-[10px] font-mono text-purple-400 font-bold">
            {currentTime}
          </span>
        </div>

        {/* Midnight Simulation Test Button */}
        <button
          onClick={handleSimulateMidnight}
          disabled={simulating}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all',
            simulating
              ? 'bg-purple-600 text-white animate-pulse border-purple-400'
              : 'bg-purple-950/30 hover:bg-purple-900/40 text-purple-300 border-purple-500/30'
          )}
          title="Dispara o gatilho da virada do dia das 00h00 para testar a janela flutuante"
        >
          <Moon className="w-3.5 h-3.5 text-purple-400" />
          <span>{simulating ? 'Disparando...' : 'Testar 00h00'}</span>
        </button>

        {/* Floating Reminders Widget Toggle */}
        <button
          onClick={() => window.electronAPI?.showWidget()}
          className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-200 transition-all"
          title="Abrir Widget Flutuante de Lembretes"
        >
          <Pin className="w-3.5 h-3.5 text-purple-400" />
          <span className="hidden sm:inline">Lembretes</span>
          {pinnedTasks.length > 0 && (
            <span className="flex items-center justify-center w-4 h-4 text-[10px] font-bold bg-purple-500 text-white rounded-full">
              {pinnedTasks.length}
            </span>
          )}
        </button>

        {/* New Task Button */}
        <button
          onClick={() => setIsNewTaskModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-[0_0_15px_rgba(147,51,234,0.3)] transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nova Tarefa</span>
        </button>
      </div>
    </header>
  );
};
