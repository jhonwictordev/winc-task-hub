import React from 'react';
import { format, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TaskItem } from '../../types';
import { useTaskHub } from '../../context/TaskHubContext';
import { cn, formatDatePT } from '../../lib/utils';
import { Plus, Clock, CheckCircle2, User, Flag, AlertCircle } from 'lucide-react';

interface DayGridProps {
  currentDate: Date;
  tasks: TaskItem[];
}

export const DayGrid: React.FC<DayGridProps> = ({ currentDate, tasks }) => {
  const {
    setActiveTaskId,
    setIsNewTaskModalOpen,
    setTargetNewTaskDate,
    concludeTask
  } = useTaskHub();

  const dateStr = format(currentDate, 'yyyy-MM-dd');
  const dayTasks = tasks.filter(t => t.targetDate === dateStr);
  const isCurrentDay = isToday(currentDate);

  const pending = dayTasks.filter(t => t.status !== 'concluida');
  const completed = dayTasks.filter(t => t.status === 'concluida');

  return (
    <div className="flex-1 flex flex-col bg-[#0d0f17] p-6 rounded-2xl border border-white/5 select-none overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
        <div>
          <span className="text-xs font-bold text-purple-400 uppercase tracking-widest block">
            Visualização Diária
          </span>
          <h2 className="text-xl font-extrabold text-white capitalize mt-0.5">
            {format(currentDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </h2>
          <span className="text-xs text-slate-400 mt-1 block">
            {dayTasks.length} {dayTasks.length === 1 ? 'demanda agendada' : 'demandas agendadas'} ({pending.length} pendentes)
          </span>
        </div>

        <button
          onClick={() => {
            setTargetNewTaskDate(dateStr);
            setIsNewTaskModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-[0_0_15px_rgba(147,51,234,0.3)] transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Tarefa Hoje</span>
        </button>
      </div>

      {/* Main List */}
      {dayTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 py-16 text-center">
          <CheckCircle2 className="w-12 h-12 text-slate-600 mb-3" />
          <h3 className="text-sm font-semibold text-slate-300">Nenhuma tarefa agendada para este dia</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            Clique no botão acima ou em qualquer data para agendar uma atividade.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {dayTasks.map((t) => {
            const isConcluded = t.status === 'concluida';
            return (
              <div
                key={t.id}
                onClick={() => setActiveTaskId(t.id)}
                className={cn(
                  'p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between group',
                  t.projectId === 'winc'
                    ? 'bg-purple-950/20 border-purple-500/30 hover:border-purple-400'
                    : t.projectId === 'evilbear'
                    ? 'bg-red-950/20 border-red-500/30 hover:border-red-400'
                    : 'bg-emerald-950/20 border-emerald-500/30 hover:border-emerald-400',
                  isConcluded && 'opacity-50'
                )}
              >
                <div className="flex items-start gap-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      concludeTask(t.id);
                    }}
                    className={cn(
                      'mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-all',
                      isConcluded
                        ? 'bg-emerald-600 border-emerald-500 text-white'
                        : 'border-white/20 hover:border-purple-400 text-transparent hover:text-purple-400'
                    )}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </button>

                  <div>
                    <h4 className={cn('text-sm font-bold text-white', isConcluded && 'line-through text-slate-400')}>
                      {t.title}
                    </h4>
                    {t.description && (
                      <p className="text-xs text-slate-400 mt-1 max-w-xl line-clamp-2">
                        {t.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                      <span className="px-2 py-0.5 rounded bg-white/5 text-slate-300">
                        {t.category}
                      </span>
                      {t.clientName && (
                        <span className="text-purple-300 font-medium">
                          @{t.clientName}
                        </span>
                      )}
                      {t.targetTime && (
                        <span className="font-mono text-slate-300 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-purple-400" />
                          {t.targetTime}
                        </span>
                      )}
                      <span className={cn(
                        'uppercase font-bold text-[10px]',
                        t.priority === 'urgente' ? 'text-red-400' :
                        t.priority === 'alta' ? 'text-purple-400' : 'text-slate-400'
                      )}>
                        Prioridade {t.priority}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className={cn(
                    'text-[10px] uppercase font-bold px-2 py-0.5 rounded-full',
                    isConcluded ? 'bg-emerald-500/20 text-emerald-400' : 'bg-purple-500/20 text-purple-300'
                  )}>
                    {t.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
