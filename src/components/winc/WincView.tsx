import React, { useState } from 'react';
import {
  Briefcase,
  Users,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ExternalLink,
  Phone,
  Mail,
  AlertCircle
} from 'lucide-react';
import { InstagramIcon } from '../common/Icons';
import { useTaskHub } from '../../context/TaskHubContext';
import { WINC_CATEGORIES, TaskStatus, WincClient } from '../../types';
import { cn, formatDatePT } from '../../lib/utils';
import { WincClientModal } from './WincClientModal';

export const WincView: React.FC = () => {
  const {
    tasks,
    clients,
    setActiveTaskId,
    setIsNewTaskModalOpen,
    concludeTask
  } = useTaskHub();

  const [activeTab, setActiveTab] = useState<'demandas' | 'clientes'>('demandas');
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');
  const [selectedStatus, setSelectedStatus] = useState<string>('todos');
  const [selectedClientId, setSelectedClientId] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<WincClient | null>(null);

  // Filter tasks belonging to Agência Winc
  const wincTasks = tasks.filter(t => t.projectId === 'winc');

  const filteredTasks = wincTasks.filter(t => {
    if (selectedCategory !== 'todas' && t.category !== selectedCategory) return false;
    if (selectedStatus !== 'todos' && t.status !== selectedStatus) return false;
    if (selectedClientId !== 'todos' && t.clientId !== selectedClientId) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.clientName?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const pendingCount = wincTasks.filter(t => t.status !== 'concluida').length;
  const concludedCount = wincTasks.filter(t => t.status === 'concluida').length;
  const activeClientsCount = clients.filter(c => c.active).length;

  const statusLabels: Record<TaskStatus, { label: string; color: string; bg: string }> = {
    nao_iniciada: { label: 'Não iniciada', color: 'text-slate-400', bg: 'bg-slate-800' },
    em_andamento: { label: 'Em andamento', color: 'text-blue-400', bg: 'bg-blue-950/40' },
    aguardando_material: { label: 'Aguardando material', color: 'text-amber-400', bg: 'bg-amber-950/40' },
    aguardando_aprovacao: { label: 'Aguardando aprovação', color: 'text-purple-400', bg: 'bg-purple-950/40' },
    em_revisao: { label: 'Em revisão', color: 'text-indigo-400', bg: 'bg-indigo-950/40' },
    concluida: { label: 'Concluída', color: 'text-emerald-400', bg: 'bg-emerald-950/40' }
  };

  return (
    <div className="flex-1 flex flex-col h-full p-6 select-none overflow-y-auto">
      {/* Module Title Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-white tracking-wide">
                AGÊNCIA WINC
              </h1>
              <p className="text-xs text-purple-300 font-medium">
                Marketing • Design Gráfico • Vídeos • Automações • Social Media
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setClientToEdit(null);
              setIsClientModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold transition-all"
          >
            <Users className="w-3.5 h-3.5 text-purple-400" />
            <span>Novo Cliente</span>
          </button>
          <button
            onClick={() => setIsNewTaskModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-[0_0_15px_rgba(147,51,234,0.35)] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Demanda Winc</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
        <div className="p-4 rounded-2xl bg-[#111420] border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Demandas Pendentes</span>
            <span className="text-2xl font-extrabold text-purple-400 mt-1 block">{pendingCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-600/10 flex items-center justify-center text-purple-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#111420] border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Demandas Concluídas</span>
            <span className="text-2xl font-extrabold text-emerald-400 mt-1 block">{concludedCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-600/10 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#111420] border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Clientes com Contrato</span>
            <span className="text-2xl font-extrabold text-white mt-1 block">{activeClientsCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-300">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tabs Switcher (Demandas vs Clientes) */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-3 mb-5">
        <button
          onClick={() => setActiveTab('demandas')}
          className={cn(
            'px-4 py-2 rounded-xl text-xs font-bold transition-all',
            activeTab === 'demandas'
              ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 shadow-[0_0_12px_rgba(147,51,234,0.15)]'
              : 'text-slate-400 hover:text-white'
          )}
        >
          Demandas & Produção ({wincTasks.length})
        </button>
        <button
          onClick={() => setActiveTab('clientes')}
          className={cn(
            'px-4 py-2 rounded-xl text-xs font-bold transition-all',
            activeTab === 'clientes'
              ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 shadow-[0_0_12px_rgba(147,51,234,0.15)]'
              : 'text-slate-400 hover:text-white'
          )}
        >
          Carteira de Clientes ({clients.length})
        </button>
      </div>

      {activeTab === 'demandas' ? (
        <>
          {/* Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-5">
            {/* Search */}
            <div className="flex items-center bg-[#141724] border border-white/5 rounded-xl px-3 py-2 text-xs">
              <Search className="w-3.5 h-3.5 text-slate-500 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Buscar demandas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-white placeholder-slate-500 focus:outline-none w-full"
              />
            </div>

            {/* Category filter (18 categories) */}
            <div className="flex items-center bg-[#141724] border border-white/5 rounded-xl px-3 py-2 text-xs">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent text-slate-200 focus:outline-none w-full cursor-pointer truncate"
              >
                <option value="todas" className="bg-[#171b29]">Todas as 18 Categorias</option>
                {WINC_CATEGORIES.map(c => (
                  <option key={c} value={c} className="bg-[#171b29]">{c}</option>
                ))}
              </select>
            </div>

            {/* Status filter */}
            <div className="flex items-center bg-[#141724] border border-white/5 rounded-xl px-3 py-2 text-xs">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-transparent text-slate-200 focus:outline-none w-full cursor-pointer"
              >
                <option value="todos" className="bg-[#171b29]">Todos os Status</option>
                <option value="nao_iniciada" className="bg-[#171b29]">Não iniciada</option>
                <option value="em_andamento" className="bg-[#171b29]">Em andamento</option>
                <option value="aguardando_material" className="bg-[#171b29]">Aguardando material</option>
                <option value="aguardando_aprovacao" className="bg-[#171b29]">Aguardando aprovação</option>
                <option value="em_revisao" className="bg-[#171b29]">Em revisão</option>
                <option value="concluida" className="bg-[#171b29]">Concluída</option>
              </select>
            </div>

            {/* Client filter */}
            <div className="flex items-center bg-[#141724] border border-white/5 rounded-xl px-3 py-2 text-xs">
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="bg-transparent text-slate-200 focus:outline-none w-full cursor-pointer"
              >
                <option value="todos" className="bg-[#171b29]">Todos os Clientes</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id} className="bg-[#171b29]">{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Demands List */}
          {filteredTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-slate-500">
              <CheckCircle2 className="w-12 h-12 text-slate-600 mb-2" />
              <p className="text-sm font-semibold text-slate-300">Nenhuma demanda da Agência Winc encontrada com estes filtros.</p>
              <button
                onClick={() => setIsNewTaskModalOpen(true)}
                className="mt-3 px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs"
              >
                Cadastrar Demanda
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredTasks.map((task) => {
                const statusMeta = statusLabels[task.status] || statusLabels.nao_iniciada;
                const isConcluded = task.status === 'concluida';
                const isUrgent = task.priority === 'urgente';

                return (
                  <div
                    key={task.id}
                    onClick={() => setActiveTaskId(task.id)}
                    className={cn(
                      'p-4 rounded-xl border transition-all cursor-pointer bg-[#111420]/80 hover:bg-[#141826] border-white/5 hover:border-purple-500/30 flex items-center justify-between group',
                      isConcluded && 'opacity-50',
                      isUrgent && !isConcluded && 'border-red-500/40 shadow-[0_0_12px_rgba(239,68,68,0.15)]'
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          concludeTask(task.id);
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
                        <div className="flex items-center gap-2">
                          <h4 className={cn('text-sm font-bold text-white', isConcluded && 'line-through text-slate-400')}>
                            {task.title}
                          </h4>
                          {isUrgent && (
                            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                              Urgente
                            </span>
                          )}
                        </div>

                        {task.description && (
                          <p className="text-xs text-slate-400 mt-1 max-w-xl line-clamp-1">
                            {task.description}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-slate-400">
                          <span className="px-2 py-0.5 rounded bg-white/5 text-purple-300 font-medium">
                            {task.category}
                          </span>
                          {task.clientName && (
                            <span className="text-slate-300 font-semibold">
                              Cliente: {task.clientName}
                            </span>
                          )}
                          <span className="flex items-center gap-1 font-mono text-slate-400">
                            <Clock className="w-3 h-3 text-purple-400" />
                            {formatDatePT(task.targetDate)} {task.targetTime ? `às ${task.targetTime}` : ''}
                          </span>
                          {task.deliveryDate && (
                            <span className="text-amber-400 font-medium">
                              Prazo: {formatDatePT(task.deliveryDate)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={cn('text-[10px] font-bold uppercase px-2.5 py-1 rounded-full', statusMeta.bg, statusMeta.color)}>
                        {statusMeta.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        /* Clientes Tab */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.length === 0 ? (
            <div className="col-span-full py-16 text-center text-slate-500">
              <Users className="w-12 h-12 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-300">Nenhum cliente cadastrado ainda.</p>
              <button
                onClick={() => {
                  setClientToEdit(null);
                  setIsClientModalOpen(true);
                }}
                className="mt-3 px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs"
              >
                Cadastrar Primeiro Cliente
              </button>
            </div>
          ) : (
            clients.map((c) => {
              const clientDemands = wincTasks.filter(t => t.clientId === c.id);
              const pending = clientDemands.filter(t => t.status !== 'concluida').length;

              return (
                <div
                  key={c.id}
                  className="p-5 rounded-2xl bg-[#111420] border border-white/5 hover:border-purple-500/30 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-white/5">
                      <div>
                        <h3 className="text-sm font-bold text-white">{c.name}</h3>
                        {c.company && (
                          <span className="text-xs text-purple-400 font-medium block">
                            {c.company}
                          </span>
                        )}
                      </div>
                      <span className={cn(
                        'text-[10px] font-bold px-2 py-0.5 rounded-full',
                        c.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'
                      )}>
                        {c.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>

                    {/* Contacts info */}
                    <div className="space-y-1.5 py-3 text-xs text-slate-400">
                      {c.instagram && (
                        <div className="flex items-center gap-2">
                          <InstagramIcon className="w-3.5 h-3.5 text-purple-400" />
                          <span className="font-mono text-slate-300">@{c.instagram}</span>
                        </div>
                      )}
                      {c.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-purple-400" />
                          <span>{c.phone}</span>
                        </div>
                      )}
                      {c.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-purple-400" />
                          <span>{c.email}</span>
                        </div>
                      )}
                      {c.notes && (
                        <p className="text-[11px] text-slate-500 pt-1 line-clamp-2">
                          {c.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Footer with demands count and edit */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs">
                    <span className="text-[11px] text-slate-400">
                      <strong className="text-purple-300 font-mono">{pending}</strong> pendentes de {clientDemands.length}
                    </span>
                    <button
                      onClick={() => {
                        setClientToEdit(c);
                        setIsClientModalOpen(true);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-medium text-xs transition-colors"
                    >
                      Editar
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Client Modal */}
      <WincClientModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        clientToEdit={clientToEdit}
      />
    </div>
  );
};
