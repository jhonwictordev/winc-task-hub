import React from 'react';
import {
  format,
  startOfWeek,
  addDays,
  isToday
} from 'date-fns';
import { TaskItem } from '../../types';
import { useTaskHub } from '../../context/TaskHubContext';
import { cn, formatDatePT } from '../../lib/utils';
import { Plus, Clock, CheckCircle2 } from 'lucide-react';

interface WeekGridProps {
  currentDate: Date;
  tasks: TaskItem[];
}

export const WeekGrid: React.FC<WeekGridProps> = ({ currentDate, tasks }) => {
  const {
    setActiveTaskId,
    setIsNewTaskModalOpen,
    setTargetNewTaskDate,
    updateTask
  } = useTaskHub();

  const start = startOfWeek(currentDate);
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    days.push(addDays(start, i));
  }

  const weekDayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  return (
    <div className="flex-1 grid grid-cols-7 gap-3 bg-[#0d0f17] p-3 rounded-2xl border border-white/5 select-none overflow-y-auto">
      {days.map((dateItem, idx) => {
        const dateStr = format(dateItem, 'yyyy-MM-dd');
        const isCurrentDay = isToday(dateItem);
        const dayTasks = tasks.filter(t => t.targetDate === dateStr);

        return (
          <div
            key={dateStr}
            className={cn(
              'flex flex-col rounded-xl border p-2.5 transition-all min-h-[380px]',
              isCurrentDay
                ? 'bg-purple-950/20 border-purple-500/40 shadow-[0_0_15px_rgba(147,51,234,0.15)]'
                : 'bg-[#111420]/70 border-white/5 hover:border-white/10'
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
              <div>
                <span className="text-[11px] font-bold text-slate-400 block uppercase">
                  {weekDayNames[idx]}
                </span>
                <span className={cn(
                  'text-sm font-extrabold',
                  isCurrentDay ? 'text-purple-400' : 'text-white'
                )}>
                  {format(dateItem, 'dd/MM')}
                </span>
              </div>
              <button
                onClick={() => {
                  setTargetNewTaskDate(dateStr);
                  setIsNewTaskModalOpen(true);
                }}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-purple-600 text-slate-300 hover:text-white transition-all"
                title="Adicionar tarefa neste dia"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Tasks list */}
            <div className="flex-1 space-y-2 overflow-y-auto">
              {dayTasks.length === 0 ? (
                <div className="text-[11px] text-slate-600 text-center pt-8">
                  Sem demandas
                </div>
              ) : (
                dayTasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setActiveTaskId(t.id)}
                    className={cn(
                      'p-2.5 rounded-xl border cursor-pointer transition-all hover:scale-[1.02]',
                      t.projectId === 'winc'
                        ? 'bg-purple-950/30 border-purple-500/30 hover:border-purple-400'
                        : t.projectId === 'evilbear'
                        ? 'bg-red-950/30 border-red-500/30 hover:border-red-400'
                        : 'bg-emerald-950/30 border-emerald-500/30 hover:border-emerald-400',
                      t.status === 'concluida' && 'opacity-40 line-through'
                    )}
                  >
                    <div className="text-xs font-semibold text-slate-100 line-clamp-2">
                      {t.title}
                    </div>
                    <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400">
                      <span className="truncate max-w-[100px]">{t.category}</span>
                      {t.targetTime && (
                        <span className="font-mono flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {t.targetTime}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
