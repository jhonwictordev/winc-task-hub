import React, { useState, useEffect } from 'react';
import {
  Pin,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sliders,
  Calendar,
  AlertCircle,
  X,
  Volume2,
  Sparkles
} from 'lucide-react';
import { TaskItem, ProjectId } from '../../types';
import { cn, formatDatePT } from '../../lib/utils';
import { playChimeSound } from '../../lib/sounds';

export const FloatingWidgetApp: React.FC = () => {
  const [pinnedTasks, setPinnedTasks] = useState<TaskItem[]>([]);
  const [isCompact, setIsCompact] = useState(false);
  const [opacity, setOpacity] = useState(0.96);
  const [showOpacitySlider, setShowOpacitySlider] = useState(false);
  const [snoozeTaskId, setSnoozeTaskId] = useState<string | null>(null);

  const api = window.electronAPI;

  const loadPinned = async () => {
    if (api) {
      const tasks = await api.getCurrentlyPinnedTasks();
      setPinnedTasks(tasks);
    }
  };

  useEffect(() => {
    loadPinned();
    if (api) {
      const unsub = api.onPinnedTasksUpdated((tasks) => {
        setPinnedTasks(tasks);
      });
      const unsubChanges = api.onTasksChanged(() => {
        loadPinned();
      });
      return () => {
        unsub();
        unsubChanges();
      };
    }
  }, [api]);

  const handleConclude = async (id: string) => {
    playChimeSound('success');
    if (api) {
      await api.concludeTask(id);
    } else {
      setPinnedTasks(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleUnpin = async (id: string) => {
    if (api) {
      await api.unpinTask(id);
    } else {
      setPinnedTasks(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleSnooze = async (id: string, daysToAdd: number) => {
    const target = new Date();
    target.setDate(target.getDate() + daysToAdd);
    const y = target.getFullYear();
    const m = String(target.getMonth() + 1).padStart(2, '0');
    const d = String(target.getDate()).padStart(2, '0');
    const newDateStr = `${y}-${m}-${d}`;

    if (api) {
      await api.snoozeTask(id, newDateStr);
    } else {
      setPinnedTasks(prev => prev.filter(t => t.id !== id));
    }
    setSnoozeTaskId(null);
  };

  const handleOpenTask = async (id: string) => {
    if (api) {
      await api.focusTaskInMain(id);
    }
  };

  const toggleCompact = () => {
    const nextState = !isCompact;
    setIsCompact(nextState);
    if (api) {
      api.setWidgetCompact(nextState);
    }
  };

  const handleOpacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setOpacity(val);
    if (api) {
      api.setWidgetOpacity(val);
    }
  };

  // Group tasks by project
  const groupedTasks: Record<ProjectId, TaskItem[]> = {
    winc: pinnedTasks.filter(t => t.projectId === 'winc'),
    evilbear: pinnedTasks.filter(t => t.projectId === 'evilbear'),
    pessoal: pinnedTasks.filter(t => t.projectId === 'pessoal')
  };

  const projectLabels: Record<ProjectId, { name: string; color: string; border: string; bg: string }> = {
    winc: {
      name: 'AGÊNCIA WINC',
      color: 'text-purple-400',
      border: 'border-purple-500/40',
      bg: 'bg-purple-950/40'
    },
    evilbear: {
      name: 'EVILBEAR.JPG',
      color: 'text-red-400',
      border: 'border-red-500/40',
      bg: 'bg-red-950/40'
    },
    pessoal: {
      name: 'OUTRAS ATIVIDADES',
      color: 'text-emerald-400',
      border: 'border-emerald-500/40',
      bg: 'bg-emerald-950/40'
    }
  };

  return (
    <div
      style={{ opacity }}
      className="flex flex-col h-screen w-full bg-[#0d0f17] border border-purple-500/40 rounded-xl overflow-hidden shadow-2xl text-slate-100 select-none transition-all duration-150"
    >
      {/* Header (Draggable) */}
      <div className="app-drag-region flex items-center justify-between px-3.5 py-2.5 bg-gradient-to-r from-[#171b29] to-[#121520] border-b border-white/10 cursor-move">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse shadow-[0_0_8px_#a855f7]" />
          <span className="text-xs font-bold tracking-wider text-purple-300 uppercase">
            WINC TASK HUB
          </span>
          <span className="text-[10px] text-slate-400 font-medium px-1.5 py-0.5 rounded bg-white/5 border border-white/5">
            {pinnedTasks.length} {pinnedTasks.length === 1 ? 'pendência' : 'pendências'}
          </span>
        </div>

        {/* Window controls (No-drag) */}
        <div className="app-no-drag flex items-center gap-1">
          <button
            onClick={() => setShowOpacitySlider(!showOpacitySlider)}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Transparência"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={toggleCompact}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title={isCompact ? 'Expandir' : 'Modo Compacto'}
          >
            {isCompact ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => api?.hideWidget()}
            className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Ocultar para a bandeja"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Subheader Title */}
      <div className="px-3.5 py-2 bg-[#0e111a] border-b border-white/5 flex items-center justify-between">
        <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          SUAS TAREFAS DE HOJE
        </div>
        <button
          onClick={() => api?.openMainWindow()}
          className="app-no-drag text-[10px] text-purple-400 hover:text-purple-300 hover:underline flex items-center gap-1"
        >
          <span>Abrir Painel</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>

      {/* Opacity slider popup */}
      {showOpacitySlider && (
        <div className="app-no-drag px-3.5 py-2 bg-[#141824] border-b border-purple-500/20 flex items-center gap-3 text-xs text-slate-300">
          <span className="text-[10px] uppercase font-bold text-slate-400">Opacidade:</span>
          <input
            type="range"
            min="0.5"
            max="1.0"
            step="0.05"
            value={opacity}
            onChange={handleOpacityChange}
            className="w-full accent-purple-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
          />
          <span className="text-[10px] font-mono text-purple-300 w-8">{Math.round(opacity * 100)}%</span>
        </div>
      )}

      {/* Tasks List (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {pinnedTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8 text-slate-400">
            <CheckCircle2 className="w-10 h-10 text-emerald-500/50 mb-2" />
            <p className="text-xs font-medium text-slate-300">Todas as tarefas de hoje foram concluídas ou desfixadas!</p>
            <p className="text-[10px] text-slate-500 mt-1">Lembretes automáticos reaparecerão na próxima data programada.</p>
          </div>
        ) : (
          (['winc', 'evilbear', 'pessoal'] as ProjectId[]).map((projId) => {
            const list = groupedTasks[projId];
            if (!list || list.length === 0) return null;
            const meta = projectLabels[projId];

            return (
              <div key={projId} className="space-y-2">
                {/* Project Header */}
                <div className="flex items-center gap-2 px-1">
                  <span className={cn('text-[11px] font-bold tracking-wider', meta.color)}>
                    {meta.name}
                  </span>
                  <div className="h-[1px] flex-1 bg-white/10" />
                  <span className="text-[10px] text-slate-500 font-medium">
                    {list.length}
                  </span>
                </div>

                {/* Tasks Cards */}
                <div className="space-y-2">
                  {list.map((task) => {
                    const isUrgent = task.priority === 'urgente';
                    const isAlta = task.priority === 'alta';

                    return (
                      <div
                        key={task.id}
                        className={cn(
                          'p-2.5 rounded-lg border transition-all duration-200 bg-[#141724]/90 backdrop-blur-md',
                          isUrgent
                            ? 'border-red-500/60 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                            : isAlta
                            ? 'border-purple-500/40'
                            : 'border-white/10 hover:border-white/20'
                        )}
                      >
                        {/* Title & Priority Badge */}
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-semibold text-slate-100 leading-snug line-clamp-2">
                            {task.title}
                          </h4>
                          {isUrgent && (
                            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/40 shrink-0">
                              Urgente
                            </span>
                          )}
                          {!isUrgent && isAlta && (
                            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0">
                              Alta
                            </span>
                          )}
                        </div>

                        {/* Description */}
                        {!isCompact && task.description && (
                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                            {task.description}
                          </p>
                        )}

                        {/* Meta info (Category, Client, Time) */}
                        <div className="flex flex-wrap items-center gap-2 mt-2 text-[10px] text-slate-400">
                          <span className="px-1.5 py-0.5 rounded bg-white/5 text-slate-300">
                            {task.category}
                          </span>
                          {task.clientName && (
                            <span className="text-purple-300 font-medium">
                              @{task.clientName}
                            </span>
                          )}
                          {task.targetTime && (
                            <span className="flex items-center gap-1 text-slate-400 font-mono">
                              <Clock className="w-3 h-3" />
                              {task.targetTime}
                            </span>
                          )}
                          <span className="text-slate-500">
                            {formatDatePT(task.targetDate)}
                          </span>
                        </div>

                        {/* Snooze options menu */}
                        {snoozeTaskId === task.id && (
                          <div className="app-no-drag mt-2 p-2 bg-[#1b2030] rounded border border-purple-500/30 flex items-center justify-between gap-1 text-[10px]">
                            <span className="text-slate-400">Adiar para:</span>
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleSnooze(task.id, 1)}
                                className="px-2 py-0.5 rounded bg-white/10 hover:bg-purple-600 text-white transition-colors"
                              >
                                Amanhã
                              </button>
                              <button
                                onClick={() => handleSnooze(task.id, 2)}
                                className="px-2 py-0.5 rounded bg-white/10 hover:bg-purple-600 text-white transition-colors"
                              >
                                +2 dias
                              </button>
                              <button
                                onClick={() => handleSnooze(task.id, 7)}
                                className="px-2 py-0.5 rounded bg-white/10 hover:bg-purple-600 text-white transition-colors"
                              >
                                +1 sem
                              </button>
                              <button
                                onClick={() => setSnoozeTaskId(null)}
                                className="p-0.5 text-slate-400 hover:text-white"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Actions buttons */}
                        <div className="app-no-drag flex items-center justify-between gap-1.5 mt-2.5 pt-2 border-t border-white/5">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleConclude(task.id)}
                              className="px-2 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white text-[10px] font-semibold flex items-center gap-1 transition-all"
                              title="Marcar como Concluída"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Concluir</span>
                            </button>
                            <button
                              onClick={() => setSnoozeTaskId(snoozeTaskId === task.id ? null : task.id)}
                              className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] font-medium flex items-center gap-1 transition-all"
                              title="Adiar para outra data"
                            >
                              <Clock className="w-3 h-3" />
                              <span>Adiar</span>
                            </button>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleUnpin(task.id)}
                              className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 text-[10px] font-medium flex items-center gap-1 transition-all"
                              title="Desfixar da tela (continua pendente no calendário)"
                            >
                              <Pin className="w-3 h-3 rotate-45" />
                              <span>Desfixar</span>
                            </button>
                            <button
                              onClick={() => handleOpenTask(task.id)}
                              className="p-1 rounded text-slate-400 hover:text-purple-300 hover:bg-white/5 transition-all"
                              title="Abrir tarefa no painel completo"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="px-3.5 py-2 bg-[#0d0f17] border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500">
        <span>Permanecerá fixado até sua ação</span>
        <button
          onClick={() => api?.simulateMidnight(new Date().toISOString().slice(0, 10))}
          className="app-no-drag hover:text-purple-400 transition-colors"
          title="Forçar checagem agora"
        >
          Reverificar
        </button>
      </div>
    </div>
  );
};
