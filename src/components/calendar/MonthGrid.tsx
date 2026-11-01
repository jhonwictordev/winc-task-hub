import React, { useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  isToday
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TaskItem, ProjectId } from '../../types';
import { useTaskHub } from '../../context/TaskHubContext';
import { cn } from '../../lib/utils';
import { Clock, Plus, CheckCircle2, AlertCircle } from 'lucide-react';

interface MonthGridProps {
  currentDate: Date;
  tasks: TaskItem[];
}

export const MonthGrid: React.FC<MonthGridProps> = ({ currentDate, tasks }) => {
  const {
    setActiveTaskId,
    setIsNewTaskModalOpen,
    setTargetNewTaskDate,
    updateTask
  } = useTaskHub();

  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  // Month boundary days
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days: Date[] = [];
  let day = startDate;
  while (day <= endDate) {
    days.push(day);
    day = addDays(day, 1);
  }

  const weekDayNames = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

  // Drag and Drop handlers to reschedule
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetDateStr: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      await updateTask(taskId, {
        targetDate: targetDateStr
      });
    }
    setDraggedTaskId(null);
  };

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="flex flex-col h-full bg-[#0d0f17] border border-white/5 rounded-2xl overflow-hidden select-none">
      {/* Week days header */}
      <div className="grid grid-cols-7 border-b border-white/10 bg-[#121522]">
        {weekDayNames.map((d, i) => (
          <div
            key={d}
            className={cn(
              'py-2.5 text-center text-[11px] font-bold tracking-wider',
              i === 0 || i === 6 ? 'text-slate-500' : 'text-slate-300'
            )}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Grid cells */}
      <div className="grid grid-cols-7 flex-1 auto-rows-fr divide-x divide-y divide-white/5 overflow-y-auto">
        {days.map((dateItem) => {
          const dateStr = format(dateItem, 'yyyy-MM-dd');
          const isCurrentMonth = isSameMonth(dateItem, currentDate);
          const isCurrentDay = isToday(dateItem);

          // Find tasks for this day
          const dayTasks = tasks.filter(t => t.targetDate === dateStr);
          const pendingCount = dayTasks.filter(t => t.status !== 'concluida').length;

          return (
            <div
              key={dateStr}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, dateStr)}
              className={cn(
                'group relative flex flex-col p-1.5 min-h-[105px] transition-colors',
                isCurrentMonth ? 'bg-[#0e111a]/60 hover:bg-white/[0.02]' : 'bg-[#090b10]/80 opacity-40',
                isCurrentDay && 'bg-purple-950/15 ring-1 ring-inset ring-purple-500/40'
              )}
            >
              {/* Day Number & Indicator */}
              <div className="flex items-center justify-between pb-1 px-1">
                <span
                  className={cn(
                    'text-xs font-semibold rounded-lg w-6 h-6 flex items-center justify-center transition-all',
                    isCurrentDay
                      ? 'bg-purple-600 text-white font-extrabold shadow-[0_0_10px_#9333ea]'
                      : isCurrentMonth
                      ? 'text-slate-300'
                      : 'text-slate-600'
                  )}
                >
                  {format(dateItem, 'd')}
                </span>

                {/* Day demand badge & Quick Add button */}
                <div className="flex items-center gap-1">
                  {dayTasks.length > 0 && (
                    <span
                      className={cn(
                        'text-[10px] font-bold px-1.5 py-0.2 rounded-full font-mono',
                        pendingCount > 0
                          ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                          : 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                      )}
                    >
                      {dayTasks.length}
                    </span>
                  )}
                  <button
                    onClick={() => {
                      setTargetNewTaskDate(dateStr);
                      setIsNewTaskModalOpen(true);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-opacity"
                    title={`Adicionar tarefa em ${format(dateItem, 'dd/MM/yyyy')}`}
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Tasks Cards list inside cell */}
              <div className="flex-1 space-y-1 overflow-hidden">
                {dayTasks.slice(0, 3).map((task) => {
                  const isConcluded = task.status === 'concluida';
                  const isOverdue = !isConcluded && task.targetDate < todayStr;
                  const isUrgent = task.priority === 'urgente';

                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onClick={() => setActiveTaskId(task.id)}
                      className={cn(
                        'flex items-center justify-between px-2 py-1 rounded-lg text-[11px] cursor-pointer transition-all border group/card truncate',
                        task.projectId === 'winc'
                          ? 'bg-purple-950/40 text-purple-200 border-purple-500/30 hover:border-purple-400'
                          : task.projectId === 'evilbear'
                          ? 'bg-red-950/40 text-red-200 border-red-500/30 hover:border-red-400'
                          : 'bg-emerald-950/40 text-emerald-200 border-emerald-500/30 hover:border-emerald-400',
                        isConcluded && 'opacity-40 line-through',
                        isOverdue && 'border-amber-500/60 shadow-[0_0_8px_rgba(245,158,11,0.2)]',
                        isUrgent && !isConcluded && 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)] animate-pulse'
                      )}
                      title={`${task.title} (${task.category}) - Arraste para reagendar`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <div
                          className={cn(
                            'w-1.5 h-1.5 rounded-full shrink-0',
                            task.projectId === 'winc' ? 'bg-purple-400' :
                            task.projectId === 'evilbear' ? 'bg-red-400' : 'bg-emerald-400'
                          )}
                        />
                        <span className="truncate font-medium">{task.title}</span>
                      </div>
                      {task.targetTime && (
                        <span className="text-[9px] font-mono text-slate-400 shrink-0 ml-1">
                          {task.targetTime}
                        </span>
                      )}
                    </div>
                  );
                })}

                {/* Show "+X mais" if more than 3 tasks */}
                {dayTasks.length > 3 && (
                  <div
                    onClick={() => {
                      setTargetNewTaskDate(dateStr);
                      setIsNewTaskModalOpen(true);
                    }}
                    className="text-[10px] text-purple-400 hover:text-purple-300 font-semibold px-1 cursor-pointer"
                  >
                    +{dayTasks.length - 3} mais demandas
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
