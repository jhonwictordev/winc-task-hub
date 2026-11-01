import React from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Flame,
  Calendar,
  Briefcase,
  Music2,
  Target,
  TrendingUp,
  Plus,
  ArrowRight,
  Disc3,
  Sparkles
} from 'lucide-react';
import { useTaskHub } from '../../context/TaskHubContext';
import { TaskItem, ProjectId } from '../../types';
import { cn, formatDatePT } from '../../lib/utils';

export const DashboardOverview: React.FC = () => {
  const {
    tasks,
    releases,
    leads,
    selectedProject,
    setSelectedView,
    setIsNewTaskModalOpen,
    setActiveTaskId,
    concludeTask
  } = useTaskHub();

  const todayStr = new Date().toISOString().slice(0, 10);

  // Filter tasks based on selected project
  const filteredTasks = tasks.filter(t => {
    if (selectedProject === 'todos') return true;
    return t.projectId === selectedProject;
  });

  const todayTasks = filteredTasks.filter(t => t.targetDate === todayStr);
  const pendingTasks = filteredTasks.filter(t => t.status !== 'concluida');
  const completedTasks = filteredTasks.filter(t => t.status === 'concluida');
  const overdueTasks = filteredTasks.filter(t => t.status !== 'concluida' && t.targetDate < todayStr);
  const urgentTasks = filteredTasks.filter(t => t.status !== 'concluida' && (t.priority === 'urgente' || t.priority === 'alta'));

  const totalTasks = filteredTasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

  // Project distribution
  const wincCount = tasks.filter(t => t.projectId === 'winc').length;
  const evilbearCount = tasks.filter(t => t.projectId === 'evilbear').length;
  const personalCount = tasks.filter(t => t.projectId === 'pessoal').length;

  const upcomingReleases = releases.slice(0, 3);

  return (
    <div className="flex-1 flex flex-col h-full p-6 select-none overflow-y-auto space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/40 via-[#141828] to-[#121524] border border-purple-500/20 shadow-[0_0_30px_rgba(147,51,234,0.1)] flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-purple-400 uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Visão Geral de Produtividade
          </span>
          <h1 className="text-2xl font-black text-white mt-1">
            Painel Executivo WINC TASK HUB
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gerenciamento de alta performance para Agência Winc, EVILBEAR.JPG e Atividades Pessoais.
          </p>
        </div>

        <button
          onClick={() => setIsNewTaskModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-[0_0_15px_rgba(147,51,234,0.4)] transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Nova Demanda</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Today */}
        <div className="p-4 rounded-xl bg-[#111420] border border-white/5 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Hoje</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-white">{todayTasks.length}</span>
            <Calendar className="w-4 h-4 text-purple-400" />
          </div>
          <span className="text-[10px] text-purple-300 mt-1">
            {todayTasks.filter(t => t.status !== 'concluida').length} pendentes
          </span>
        </div>

        {/* Pending */}
        <div className="p-4 rounded-xl bg-[#111420] border border-white/5 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pendentes</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-white">{pendingTasks.length}</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <span className="text-[10px] text-slate-400 mt-1">demandas ativas</span>
        </div>

        {/* Completed */}
        <div className="p-4 rounded-xl bg-[#111420] border border-white/5 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Concluídas</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-emerald-400">{completedTasks.length}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-[10px] text-emerald-400/80 mt-1">{completionRate}% taxa conclusão</span>
        </div>

        {/* Overdue */}
        <div className="p-4 rounded-xl bg-[#111420] border border-white/5 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Atrasadas</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-amber-400">{overdueTasks.length}</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-[10px] text-amber-400/80 mt-1">requerem atenção</span>
        </div>

        {/* Urgent */}
        <div className="p-4 rounded-xl bg-[#111420] border border-white/5 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Prioritárias</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-red-400">{urgentTasks.length}</span>
            <Flame className="w-4 h-4 text-red-400" />
          </div>
          <span className="text-[10px] text-red-400/80 mt-1">alta / urgente</span>
        </div>

        {/* Leads */}
        <div className="p-4 rounded-xl bg-[#111420] border border-white/5 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Prospecção</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-teal-400">{leads.length}</span>
            <Target className="w-4 h-4 text-teal-400" />
          </div>
          <span className="text-[10px] text-teal-400/80 mt-1">leads no pipeline</span>
        </div>
      </div>

      {/* Main Grid: Urgent & Today Tasks + Project Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Today & Urgent Tasks (2 cols on lg) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today Tasks Section */}
          <div className="p-5 rounded-2xl bg-[#111420] border border-white/5">
            <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white">Tarefas de Hoje ({todayTasks.length})</h3>
              </div>
              <button
                onClick={() => setSelectedView('calendar')}
                className="text-xs text-purple-400 hover:underline flex items-center gap-1"
              >
                <span>Ver Calendário</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {todayTasks.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                Nenhuma tarefa agendada para hoje. Aproveite para planejar os próximos dias!
              </div>
            ) : (
              <div className="space-y-2">
                {todayTasks.map((t) => {
                  const isConcluded = t.status === 'concluida';
                  return (
                    <div
                      key={t.id}
                      onClick={() => setActiveTaskId(t.id)}
                      className={cn(
                        'p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between',
                        t.projectId === 'winc'
                          ? 'bg-purple-950/20 border-purple-500/20 hover:border-purple-500/40'
                          : t.projectId === 'evilbear'
                          ? 'bg-red-950/20 border-red-500/20 hover:border-red-500/40'
                          : 'bg-emerald-950/20 border-emerald-500/20 hover:border-emerald-500/40',
                        isConcluded && 'opacity-40'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            concludeTask(t.id);
                          }}
                          className={cn(
                            'w-5 h-5 rounded-lg border flex items-center justify-center transition-colors',
                            isConcluded ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-white/20 hover:border-purple-400'
                          )}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                        <div>
                          <span className={cn('text-xs font-semibold text-white block', isConcluded && 'line-through text-slate-400')}>
                            {t.title}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {t.category} {t.targetTime ? `• às ${t.targetTime}` : ''}
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] uppercase font-bold text-slate-400 px-2 py-0.5 rounded bg-white/5">
                        {t.priority}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Urgent & High Priority Tasks */}
          <div className="p-5 rounded-2xl bg-[#111420] border border-white/5">
            <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-red-400" />
                <h3 className="text-sm font-bold text-white">Demandas Prioritárias ({urgentTasks.length})</h3>
              </div>
            </div>

            {urgentTasks.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                Nenhuma demanda urgente ou de alta prioridade pendente no momento.
              </div>
            ) : (
              <div className="space-y-2">
                {urgentTasks.slice(0, 4).map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setActiveTaskId(t.id)}
                    className="p-3 rounded-xl bg-red-950/20 border border-red-500/30 hover:border-red-400 transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{t.title}</span>
                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-red-500/20 text-red-300">
                          {t.priority}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        {t.category} • Para {formatDatePT(t.targetDate)}
                      </span>
                    </div>

                    <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Project Breakdown & Upcoming Releases */}
        <div className="space-y-6">
          {/* Project Distribution Card */}
          <div className="p-5 rounded-2xl bg-[#111420] border border-white/5">
            <h3 className="text-sm font-bold text-white pb-3 border-b border-white/5 mb-4">
              Distribuição por Projeto
            </h3>

            <div className="space-y-3 text-xs">
              {/* Winc */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-purple-300 font-semibold flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-purple-400" />
                    Agência Winc
                  </span>
                  <span className="font-mono text-slate-400">{wincCount} demandas</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    style={{ width: `${totalTasks > 0 ? (wincCount / totalTasks) * 100 : 0}%` }}
                    className="h-full bg-purple-500"
                  />
                </div>
              </div>

              {/* Evilbear */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-red-300 font-semibold flex items-center gap-1.5">
                    <Music2 className="w-3.5 h-3.5 text-red-400" />
                    EVILBEAR.JPG
                  </span>
                  <span className="font-mono text-slate-400">{evilbearCount} demandas</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    style={{ width: `${totalTasks > 0 ? (evilbearCount / totalTasks) * 100 : 0}%` }}
                    className="h-full bg-red-500"
                  />
                </div>
              </div>

              {/* Pessoal */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-emerald-300 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Pessoal / Outras
                  </span>
                  <span className="font-mono text-slate-400">{personalCount} demandas</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    style={{ width: `${totalTasks > 0 ? (personalCount / totalTasks) * 100 : 0}%` }}
                    className="h-full bg-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Releases Widget */}
          <div className="p-5 rounded-2xl bg-[#111420] border border-white/5">
            <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3">
              <div className="flex items-center gap-2">
                <Disc3 className="w-4 h-4 text-red-400" />
                <h3 className="text-sm font-bold text-white">Próximos Lançamentos</h3>
              </div>
              <button
                onClick={() => setSelectedView('evilbear')}
                className="text-xs text-red-400 hover:underline"
              >
                Ver Todos
              </button>
            </div>

            {upcomingReleases.length === 0 ? (
              <div className="py-6 text-center text-slate-500 text-xs">
                Nenhum lançamento no radar.
              </div>
            ) : (
              <div className="space-y-2.5">
                {upcomingReleases.map(r => (
                  <div
                    key={r.id}
                    onClick={() => setSelectedView('evilbear')}
                    className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 cursor-pointer transition-colors"
                  >
                    <div className="text-xs font-bold text-white">{r.title}</div>
                    <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400 font-mono">
                      <span>{r.genre || 'Instrumental'}</span>
                      <span className="text-red-400">{formatDatePT(r.releaseDate)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
