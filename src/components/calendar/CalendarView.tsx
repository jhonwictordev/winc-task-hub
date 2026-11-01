import React, { useState } from 'react';
import {
  format,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  addYears,
  subYears
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Calendar as CalendarIcon,
  Plus
} from 'lucide-react';
import { useTaskHub } from '../../context/TaskHubContext';
import { MonthGrid } from './MonthGrid';
import { WeekGrid } from './WeekGrid';
import { DayGrid } from './DayGrid';
import { TaskDetailModal } from './TaskDetailModal';
import { NewTaskModal } from './NewTaskModal';
import { cn } from '../../lib/utils';

export const CalendarView: React.FC = () => {
  const {
    tasks,
    selectedProject,
    setIsNewTaskModalOpen
  } = useTaskHub();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarMode, setCalendarMode] = useState<'month' | 'week' | 'day'>('month');

  // Filter tasks based on selected project
  const filteredTasks = tasks.filter(t => {
    if (selectedProject === 'todos') return true;
    return t.projectId === selectedProject;
  });

  // Navigation handlers
  const handlePrev = () => {
    if (calendarMode === 'month') setCurrentDate(subMonths(currentDate, 1));
    else if (calendarMode === 'week') setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(subDays(currentDate, 1));
  };

  const handleNext = () => {
    if (calendarMode === 'month') setCurrentDate(addMonths(currentDate, 1));
    else if (calendarMode === 'week') setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addDays(currentDate, 1));
  };

  const handlePrevYear = () => {
    setCurrentDate(subYears(currentDate, 1));
  };

  const handleNextYear = () => {
    setCurrentDate(addYears(currentDate, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="flex-1 flex flex-col h-full p-6 select-none overflow-hidden">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5">
        {/* Date Navigator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#141724] border border-white/5 rounded-xl p-1">
            <button
              onClick={handlePrevYear}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              title="Ano Anterior"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              title="Mês Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={handleToday}
              className="px-3 py-1 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              Hoje
            </button>

            <button
              onClick={handleNext}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              title="Próximo Mês"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextYear}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              title="Próximo Ano"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>

          {/* Month / Year Label */}
          <h2 className="text-xl font-extrabold text-white capitalize tracking-wide">
            {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
          </h2>
        </div>

        {/* View mode toggle (Month | Week | Day) & New Task */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#141724] border border-white/5 rounded-xl p-1 text-xs font-semibold">
            <button
              onClick={() => setCalendarMode('month')}
              className={cn(
                'px-3 py-1.5 rounded-lg transition-all',
                calendarMode === 'month'
                  ? 'bg-purple-600 text-white shadow-[0_0_12px_rgba(147,51,234,0.35)]'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              Mês
            </button>
            <button
              onClick={() => setCalendarMode('week')}
              className={cn(
                'px-3 py-1.5 rounded-lg transition-all',
                calendarMode === 'week'
                  ? 'bg-purple-600 text-white shadow-[0_0_12px_rgba(147,51,234,0.35)]'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              Semana
            </button>
            <button
              onClick={() => setCalendarMode('day')}
              className={cn(
                'px-3 py-1.5 rounded-lg transition-all',
                calendarMode === 'day'
                  ? 'bg-purple-600 text-white shadow-[0_0_12px_rgba(147,51,234,0.35)]'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              Dia
            </button>
          </div>

          <button
            onClick={() => setIsNewTaskModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-[0_0_15px_rgba(147,51,234,0.3)] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Tarefa</span>
          </button>
        </div>
      </div>

      {/* Main Grid Render */}
      <div className="flex-1 overflow-hidden">
        {calendarMode === 'month' && (
          <MonthGrid currentDate={currentDate} tasks={filteredTasks} />
        )}
        {calendarMode === 'week' && (
          <WeekGrid currentDate={currentDate} tasks={filteredTasks} />
        )}
        {calendarMode === 'day' && (
          <DayGrid currentDate={currentDate} tasks={filteredTasks} />
        )}
      </div>

      {/* Modals */}
      <TaskDetailModal />
      <NewTaskModal />
    </div>
  );
};
