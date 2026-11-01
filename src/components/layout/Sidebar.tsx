import React from 'react';
import {
  LayoutDashboard,
  Calendar as CalendarIcon,
  Briefcase,
  Music2,
  Target,
  Settings as SettingsIcon,
  Plus,
  ChevronLeft,
  ChevronRight,
  Pin,
  Sparkles
} from 'lucide-react';
import { useTaskHub } from '../../context/TaskHubContext';
import { ProjectId } from '../../types';
import { cn } from '../../lib/utils';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (c: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const {
    selectedView,
    setSelectedView,
    selectedProject,
    setSelectedProject,
    setIsNewTaskModalOpen,
    tasks,
    pinnedTasks
  } = useTaskHub();

  const wincPending = tasks.filter(t => t.projectId === 'winc' && t.status !== 'concluida').length;
  const evilbearPending = tasks.filter(t => t.projectId === 'evilbear' && t.status !== 'concluida').length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'calendar', label: 'Calendário Mensal', icon: CalendarIcon },
    { id: 'winc', label: 'Agência Winc', icon: Briefcase, count: wincPending, badgeColor: 'bg-purple-600/30 text-purple-300' },
    { id: 'evilbear', label: 'EVILBEAR.JPG', icon: Music2, count: evilbearPending, badgeColor: 'bg-red-600/30 text-red-300' },
    { id: 'prospeccao', label: 'Prospecção Comercial', icon: Target },
    { id: 'settings', label: 'Configurações', icon: SettingsIcon },
  ] as const;

  const projectFilters: Array<{ id: 'todos' | ProjectId; label: string; color: string }> = [
    { id: 'todos', label: 'TODOS', color: 'text-slate-300' },
    { id: 'winc', label: 'WINC', color: 'text-purple-400' },
    { id: 'evilbear', label: 'EVILBEAR', color: 'text-red-400' },
    { id: 'pessoal', label: 'PESSOAL', color: 'text-emerald-400' },
  ];

  return (
    <aside
      className={cn(
        'relative flex flex-col h-screen bg-[#0e111a] border-r border-white/5 transition-all duration-300 ease-in-out select-none z-20 shrink-0',
        collapsed ? 'w-18' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/5">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-700 to-indigo-500 flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(147,51,234,0.4)] shrink-0">
            W
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-extrabold text-xs tracking-wider text-white">
                WINC TASK HUB
              </span>
              <span className="text-[10px] text-purple-400 font-semibold tracking-widest uppercase">
                Productivity OS
              </span>
            </div>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          title={collapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Quick Action Button */}
      <div className="p-3">
        <button
          onClick={() => setIsNewTaskModalOpen(true)}
          className={cn(
            'w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-semibold text-xs transition-all shadow-[0_0_20px_rgba(147,51,234,0.3)] active:scale-[0.98]',
            collapsed && 'px-2'
          )}
          title="Criar Nova Demanda / Tarefa"
        >
          <Plus className="w-4 h-4" />
          {!collapsed && <span>Nova Demanda</span>}
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-2.5 py-2 space-y-1 overflow-y-auto">
        {!collapsed && (
          <div className="px-2 pt-1 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Menu Principal
          </div>
        )}

        {navItems.map((item) => {
          const isActive = selectedView === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setSelectedView(item.id)}
              className={cn(
                'w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group relative',
                isActive
                  ? 'bg-purple-600/15 text-purple-300 font-semibold shadow-[inset_0_0_12px_rgba(147,51,234,0.15)] border border-purple-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              )}
              title={collapsed ? item.label : undefined}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    'w-4 h-4 transition-colors',
                    isActive ? 'text-purple-400' : 'text-slate-400 group-hover:text-slate-200'
                  )}
                />
                {!collapsed && <span>{item.label}</span>}
              </div>

              {!collapsed && 'count' in item && typeof item.count === 'number' && item.count > 0 && (
                <span className={cn('text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full', item.badgeColor)}>
                  {item.count}
                </span>
              )}
            </button>
          );
        })}

        {/* Project quick filters */}
        {!collapsed && (
          <div className="pt-6">
            <div className="px-2 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Filtro de Projetos
            </div>
            <div className="space-y-0.5">
              {projectFilters.map((pf) => {
                const isSelected = selectedProject === pf.id;
                return (
                  <button
                    key={pf.id}
                    onClick={() => setSelectedProject(pf.id)}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-all',
                      isSelected
                        ? 'bg-white/10 font-bold text-white border-l-2 border-purple-500'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    )}
                  >
                    <span className={pf.color}>{pf.label}</span>
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Pinned Reminders Quick Bar at bottom */}
      {pinnedTasks.length > 0 && (
        <div className="p-2 border-t border-white/5 bg-[#121522]">
          <button
            onClick={() => window.electronAPI?.showWidget()}
            className={cn(
              'w-full flex items-center justify-between p-2 rounded-xl bg-purple-950/40 border border-purple-500/30 text-purple-300 hover:bg-purple-900/40 transition-all text-xs font-medium',
              collapsed && 'justify-center p-2.5'
            )}
            title="Lembretes fixados na tela flutuante"
          >
            <div className="flex items-center gap-2">
              <Pin className="w-3.5 h-3.5 text-purple-400 animate-bounce" />
              {!collapsed && <span>{pinnedTasks.length} {pinnedTasks.length === 1 ? 'Lembrete Fixado' : 'Lembretes Fixados'}</span>}
            </div>
            {!collapsed && (
              <span className="text-[10px] font-bold bg-purple-500 text-white px-1.5 py-0.5 rounded-full">
                {pinnedTasks.length}
              </span>
            )}
          </button>
        </div>
      )}
    </aside>
  );
};
