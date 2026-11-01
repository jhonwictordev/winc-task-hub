import React, { useState } from 'react';
import {
  Music2,
  Disc3,
  Plus,
  Play,
  Calendar,
  Clock,
  CheckCircle2,
  ExternalLink,
  Sliders,
  Sparkles,
  Layers
} from 'lucide-react';
import { useTaskHub } from '../../context/TaskHubContext';
import { EvilbearRelease, EVILBEAR_CATEGORIES } from '../../types';
import { cn, formatDatePT } from '../../lib/utils';
import { ReleasePipelineModal } from './ReleasePipelineModal';

export const EvilbearView: React.FC = () => {
  const {
    tasks,
    releases,
    setActiveTaskId,
    setIsNewTaskModalOpen,
    concludeTask
  } = useTaskHub();

  const [activeTab, setActiveTab] = useState<'releases' | 'demandas' | 'catalogo'>('releases');
  const [isReleaseModalOpen, setIsReleaseModalOpen] = useState(false);
  const [releaseToEdit, setReleaseToEdit] = useState<EvilbearRelease | null>(null);

  // Filter tasks belonging to EVILBEAR.JPG
  const evilbearTasks = tasks.filter(t => t.projectId === 'evilbear');
  const pendingTasks = evilbearTasks.filter(t => t.status !== 'concluida');
  const concludedTasks = evilbearTasks.filter(t => t.status === 'concluida');

  return (
    <div className="flex-1 flex flex-col h-full p-6 select-none overflow-y-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400 shadow-[0_0_15px_rgba(220,38,38,0.3)]">
            <Music2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-wide">
              EVILBEAR.JPG
            </h1>
            <p className="text-xs text-red-300 font-medium">
              Produção Musical • Beats • Instrumentais • Lançamentos Semanais
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setReleaseToEdit(null);
              setIsReleaseModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold transition-all"
          >
            <Disc3 className="w-3.5 h-3.5 text-red-400" />
            <span>Programar Lançamento</span>
          </button>
          <button
            onClick={() => setIsNewTaskModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-[0_0_15px_rgba(220,38,38,0.35)] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Tarefa EVILBEAR</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
        <div className="p-4 rounded-2xl bg-[#111420] border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Lançamentos Programados</span>
            <span className="text-2xl font-extrabold text-red-400 mt-1 block">{releases.length}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-600/10 flex items-center justify-center text-red-400">
            <Disc3 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#111420] border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Demandas de Produção</span>
            <span className="text-2xl font-extrabold text-white mt-1 block">{pendingTasks.length} pendentes</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-300">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#111420] border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Beats Finalizados</span>
            <span className="text-2xl font-extrabold text-emerald-400 mt-1 block">{concludedTasks.length}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-600/10 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-3 mb-5">
        <button
          onClick={() => setActiveTab('releases')}
          className={cn(
            'px-4 py-2 rounded-xl text-xs font-bold transition-all',
            activeTab === 'releases'
              ? 'bg-red-600/20 text-red-300 border border-red-500/30 shadow-[0_0_12px_rgba(220,38,38,0.15)]'
              : 'text-slate-400 hover:text-white'
          )}
        >
          Pipeline de Lançamentos ({releases.length})
        </button>
        <button
          onClick={() => setActiveTab('demandas')}
          className={cn(
            'px-4 py-2 rounded-xl text-xs font-bold transition-all',
            activeTab === 'demandas'
              ? 'bg-red-600/20 text-red-300 border border-red-500/30 shadow-[0_0_12px_rgba(220,38,38,0.15)]'
              : 'text-slate-400 hover:text-white'
          )}
        >
          Demandas & Produção ({evilbearTasks.length})
        </button>
      </div>

      {/* Tab: Releases */}
      {activeTab === 'releases' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {releases.length === 0 ? (
            <div className="col-span-full py-16 text-center text-slate-500">
              <Disc3 className="w-12 h-12 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-300">Nenhum lançamento musical cadastrado no pipeline.</p>
              <button
                onClick={() => {
                  setReleaseToEdit(null);
                  setIsReleaseModalOpen(true);
                }}
                className="mt-3 px-4 py-2 rounded-xl bg-red-600 text-white font-bold text-xs"
              >
                Cadastrar Lançamento Musical
              </button>
            </div>
          ) : (
            releases.map((rel) => {
              const completedSteps = (rel.checklist || []).filter(c => c.completed).length;
              const totalSteps = (rel.checklist || []).length || 8;
              const percent = Math.round((completedSteps / totalSteps) * 100);

              return (
                <div
                  key={rel.id}
                  className="p-5 rounded-2xl bg-[#111420] border border-white/5 hover:border-red-500/30 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Top title & status */}
                    <div className="flex items-center justify-between pb-3 border-b border-white/5">
                      <div>
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          <Disc3 className="w-4 h-4 text-red-400" />
                          <span>{rel.title}</span>
                        </h3>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 font-mono">
                          <span>{rel.genre || 'Instrumental'}</span>
                          {rel.bpm && <span>• {rel.bpm} BPM</span>}
                          {rel.musicalKey && <span>• {rel.musicalKey}</span>}
                        </div>
                      </div>

                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                        {rel.licenseStatus}
                      </span>
                    </div>

                    {/* Formats badges */}
                    <div className="flex items-center gap-1.5 py-3">
                      {(rel.formats || []).map(f => (
                        <span key={f} className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[10px] font-mono text-slate-300">
                          {f}
                        </span>
                      ))}
                    </div>

                    {/* Checklist Steps summary */}
                    <div className="space-y-2 py-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-medium">
                          Etapas do Lançamento ({completedSteps}/{totalSteps})
                        </span>
                        <span className="font-mono font-bold text-red-400">
                          {percent}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                          style={{ width: `${percent}%` }}
                          className="h-full bg-gradient-to-r from-red-600 to-amber-500 transition-all duration-300"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/5 text-xs">
                    <span className="text-slate-400 flex items-center gap-1 font-mono text-[11px]">
                      <Calendar className="w-3.5 h-3.5 text-red-400" />
                      {formatDatePT(rel.releaseDate)} {rel.releaseTime ? `às ${rel.releaseTime}` : ''}
                    </span>

                    <button
                      onClick={() => {
                        setReleaseToEdit(rel);
                        setIsReleaseModalOpen(true);
                      }}
                      className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold"
                    >
                      Editar Pipeline
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab: Demandas */}
      {activeTab === 'demandas' && (
        <div className="space-y-2.5">
          {evilbearTasks.length === 0 ? (
            <div className="py-16 text-center text-slate-500">
              <CheckCircle2 className="w-12 h-12 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-300">Nenhuma demanda do EVILBEAR.JPG cadastrada.</p>
            </div>
          ) : (
            evilbearTasks.map((task) => {
              const isConcluded = task.status === 'concluida';
              return (
                <div
                  key={task.id}
                  onClick={() => setActiveTaskId(task.id)}
                  className={cn(
                    'p-4 rounded-xl border transition-all cursor-pointer bg-[#111420]/80 hover:bg-[#141826] border-white/5 hover:border-red-500/30 flex items-center justify-between group',
                    isConcluded && 'opacity-50'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        concludeTask(task.id);
                      }}
                      className={cn(
                        'mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-all',
                        isConcluded
                          ? 'bg-emerald-600 border-emerald-500 text-white'
                          : 'border-white/20 hover:border-red-400 text-transparent hover:text-red-400'
                      )}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </button>

                    <div>
                      <h4 className={cn('text-sm font-bold text-white', isConcluded && 'line-through text-slate-400')}>
                        {task.title}
                      </h4>
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
                        <span className="px-2 py-0.5 rounded bg-white/5 text-red-300">
                          {task.category}
                        </span>
                        <span className="font-mono text-slate-400">
                          {formatDatePT(task.targetDate)}
                        </span>
                        <span className="uppercase text-[10px] text-slate-500 font-bold">
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-white/5 text-slate-300">
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Release Pipeline Modal */}
      <ReleasePipelineModal
        isOpen={isReleaseModalOpen}
        onClose={() => setIsReleaseModalOpen(false)}
        releaseToEdit={releaseToEdit}
      />
    </div>
  );
};
