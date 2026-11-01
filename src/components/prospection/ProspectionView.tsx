import React, { useState } from 'react';
import {
  Target,
  Users,
  Plus,
  Search,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Clock,
  Sparkles,
  Edit2,
  Trash2
} from 'lucide-react';
import { InstagramIcon } from '../common/Icons';
import { useTaskHub } from '../../context/TaskHubContext';
import { ProspectionLead, LeadStatus, ProjectId } from '../../types';
import { cn, formatDatePT } from '../../lib/utils';
import { LeadModal } from './LeadModal';

export const ProspectionView: React.FC = () => {
  const {
    leads,
    settings,
    updateSettings,
    deleteLead
  } = useTaskHub();

  const [selectedProject, setSelectedProject] = useState<'todos' | ProjectId>('todos');
  const [selectedStatus, setSelectedStatus] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [leadToEdit, setLeadToEdit] = useState<ProspectionLead | null>(null);
  const [isEditingGoals, setIsEditingGoals] = useState(false);
  const [dailyGoalInput, setDailyGoalInput] = useState(settings.dailyProspectionGoal || 20);
  const [monthlyGoalInput, setMonthlyGoalInput] = useState(settings.monthlyProspectionGoal || 400);

  const todayStr = new Date().toISOString().slice(0, 10);
  const monthPrefix = todayStr.slice(0, 7);

  // Filter leads
  const filteredLeads = leads.filter(l => {
    if (selectedProject !== 'todos' && l.projectId !== selectedProject) return false;
    if (selectedStatus !== 'todos' && l.status !== selectedStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        l.name.toLowerCase().includes(q) ||
        l.instagram?.toLowerCase().includes(q) ||
        l.notes?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Calculate real DB metrics
  const contactsToday = leads.filter(l => l.contactDate === todayStr).length;
  const contactsMonth = leads.filter(l => l.contactDate && l.contactDate.startsWith(monthPrefix)).length;
  const closedDeals = leads.filter(l => l.status === 'fechado').length;
  const waitingResponse = leads.filter(l => l.status === 'aguardando_resposta').length;
  const inNegotiation = leads.filter(l => l.status === 'em_negociacao').length;

  const dailyGoal = settings.dailyProspectionGoal || 20;
  const monthlyGoal = settings.monthlyProspectionGoal || 400;

  const dailyPercent = Math.min(100, Math.round((contactsToday / dailyGoal) * 100));
  const monthlyPercent = Math.min(100, Math.round((contactsMonth / monthlyGoal) * 100));

  const handleSaveGoals = async () => {
    await updateSettings({
      dailyProspectionGoal: Number(dailyGoalInput) || 20,
      monthlyProspectionGoal: Number(monthlyGoalInput) || 400
    });
    setIsEditingGoals(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Excluir lead "${name}"?`)) {
      await deleteLead(id);
    }
  };

  const statusBadge: Record<LeadStatus, { label: string; color: string; bg: string }> = {
    novo_lead: { label: 'Novo Lead', color: 'text-slate-300', bg: 'bg-slate-800' },
    em_analise: { label: 'Em Análise', color: 'text-blue-300', bg: 'bg-blue-950/40 border border-blue-500/30' },
    primeiro_contato: { label: '1º Contato Feito', color: 'text-cyan-300', bg: 'bg-cyan-950/40 border border-cyan-500/30' },
    aguardando_resposta: { label: 'Aguardando Resposta', color: 'text-amber-300', bg: 'bg-amber-950/40 border border-amber-500/30' },
    followup_agendado: { label: 'Follow-up Agendado', color: 'text-purple-300', bg: 'bg-purple-950/40 border border-purple-500/30' },
    em_negociacao: { label: 'Em Negociação', color: 'text-indigo-300', bg: 'bg-indigo-950/40 border border-indigo-500/30' },
    fechado: { label: 'Cliente Fechado', color: 'text-emerald-300', bg: 'bg-emerald-950/40 border border-emerald-500/30 font-bold' },
    nao_interessado: { label: 'Não Interessado', color: 'text-slate-500', bg: 'bg-slate-900 border border-slate-700' }
  };

  return (
    <div className="flex-1 flex flex-col h-full p-6 select-none overflow-y-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-wide">
              PAINEL DE PROSPECÇÃO COMERCIAL
            </h1>
            <p className="text-xs text-emerald-300 font-medium">
              Empresas (Agência Winc) • Artistas & Cantores (EVILBEAR.JPG)
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setLeadToEdit(null);
            setIsLeadModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-[0_0_15px_rgba(16,185,129,0.35)] transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Lead Comercial</span>
        </button>
      </div>

      {/* Goal Trackers (Daily & Monthly) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
        {/* Daily Goal Card */}
        <div className="p-5 rounded-2xl bg-[#111420] border border-white/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                Meta Diária de Prospecção
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400">
                {contactsToday} de {dailyGoal} contatos ({dailyPercent}%)
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden my-2">
              <div
                style={{ width: `${dailyPercent}%` }}
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 text-[11px] text-slate-500">
            <span>Contatos realizados hoje: {contactsToday}</span>
            <button
              onClick={() => setIsEditingGoals(!isEditingGoals)}
              className="text-emerald-400 hover:underline"
            >
              {isEditingGoals ? 'Fechar' : 'Editar Metas'}
            </button>
          </div>
        </div>

        {/* Monthly Goal Card */}
        <div className="p-5 rounded-2xl bg-[#111420] border border-white/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
                Meta Mensal de Prospecção
              </span>
              <span className="text-xs font-mono font-bold text-purple-400">
                {contactsMonth} de {monthlyGoal} contatos ({monthlyPercent}%)
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden my-2">
              <div
                style={{ width: `${monthlyPercent}%` }}
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 transition-all duration-300"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 text-[11px] text-slate-500">
            <span>Contatos realizados no mês: {contactsMonth}</span>
            <span>Fechamentos no mês: <strong className="text-emerald-400 font-mono">{closedDeals}</strong></span>
          </div>
        </div>
      </div>

      {/* Edit Goals Mini Form */}
      {isEditingGoals && (
        <div className="p-4 rounded-xl bg-[#141a24] border border-emerald-500/30 mb-6 flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-300 font-medium">Meta Diária:</span>
            <input
              type="number"
              value={dailyGoalInput}
              onChange={(e) => setDailyGoalInput(Number(e.target.value))}
              className="w-20 px-2 py-1 rounded bg-[#0d0f17] border border-white/10 text-white font-mono"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-300 font-medium">Meta Mensal:</span>
            <input
              type="number"
              value={monthlyGoalInput}
              onChange={(e) => setMonthlyGoalInput(Number(e.target.value))}
              className="w-24 px-2 py-1 rounded bg-[#0d0f17] border border-white/10 text-white font-mono"
            />
          </div>
          <button
            onClick={handleSaveGoals}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
          >
            Salvar Metas
          </button>
        </div>
      )}

      {/* Stats Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="p-3 rounded-xl bg-[#111420] border border-white/5">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Total de Leads</span>
          <span className="text-lg font-bold text-white mt-0.5 block">{leads.length}</span>
        </div>
        <div className="p-3 rounded-xl bg-[#111420] border border-white/5">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Aguardando Resposta</span>
          <span className="text-lg font-bold text-amber-400 mt-0.5 block">{waitingResponse}</span>
        </div>
        <div className="p-3 rounded-xl bg-[#111420] border border-white/5">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Em Negociação</span>
          <span className="text-lg font-bold text-indigo-400 mt-0.5 block">{inNegotiation}</span>
        </div>
        <div className="p-3 rounded-xl bg-[#111420] border border-white/5">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Clientes Fechados</span>
          <span className="text-lg font-bold text-emerald-400 mt-0.5 block">{closedDeals}</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <div className="flex items-center bg-[#141724] border border-white/5 rounded-xl px-3 py-2 text-xs">
          <Search className="w-3.5 h-3.5 text-slate-500 mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Buscar por nome, Instagram ou notas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-white placeholder-slate-500 focus:outline-none w-full"
          />
        </div>

        <div className="flex items-center bg-[#141724] border border-white/5 rounded-xl px-3 py-2 text-xs">
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value as any)}
            className="bg-transparent text-slate-200 focus:outline-none w-full cursor-pointer"
          >
            <option value="todos" className="bg-[#171b29]">Todos os Projetos</option>
            <option value="winc" className="bg-[#171b29]">Empresas (Agência Winc)</option>
            <option value="evilbear" className="bg-[#171b29]">Artistas (EVILBEAR.JPG)</option>
          </select>
        </div>

        <div className="flex items-center bg-[#141724] border border-white/5 rounded-xl px-3 py-2 text-xs">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-transparent text-slate-200 focus:outline-none w-full cursor-pointer"
          >
            <option value="todos" className="bg-[#171b29]">Todos os Status Comerciais</option>
            <option value="novo_lead" className="bg-[#171b29]">Novo lead</option>
            <option value="em_analise" className="bg-[#171b29]">Em análise</option>
            <option value="primeiro_contato" className="bg-[#171b29]">Primeiro contato realizado</option>
            <option value="aguardando_resposta" className="bg-[#171b29]">Aguardando resposta</option>
            <option value="followup_agendado" className="bg-[#171b29]">Follow-up agendado</option>
            <option value="em_negociacao" className="bg-[#171b29]">Em negociação</option>
            <option value="fechado" className="bg-[#171b29]">Cliente fechado</option>
            <option value="nao_interessado" className="bg-[#171b29]">Não interessado</option>
          </select>
        </div>
      </div>

      {/* Leads Table/Cards */}
      {filteredLeads.length === 0 ? (
        <div className="py-16 text-center text-slate-500">
          <Target className="w-12 h-12 text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-300">Nenhum lead encontrado com estes filtros.</p>
          <button
            onClick={() => {
              setLeadToEdit(null);
              setIsLeadModalOpen(true);
            }}
            className="mt-3 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
          >
            Cadastrar Novo Lead
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredLeads.map((lead) => {
            const meta = statusBadge[lead.status] || statusBadge.novo_lead;
            return (
              <div
                key={lead.id}
                className="p-4 rounded-xl bg-[#111420]/80 border border-white/5 hover:border-emerald-500/30 transition-all flex flex-wrap items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-slate-300 shrink-0 font-bold text-xs">
                    {lead.type === 'empresa' ? 'W' : 'E'}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">
                        {lead.name}
                      </h4>
                      <span className="text-[10px] font-semibold text-slate-500 uppercase px-1.5 py-0.2 rounded bg-white/5">
                        {lead.type === 'empresa' ? 'Empresa' : 'Artista'}
                      </span>
                    </div>

                    {/* Contacts line */}
                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-400">
                      {lead.instagram && (
                        <span className="flex items-center gap-1 font-mono text-purple-300">
                          <InstagramIcon className="w-3 h-3 text-purple-400" />
                          @{lead.instagram}
                        </span>
                      )}
                      {lead.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-emerald-400" />
                          {lead.phone}
                        </span>
                      )}
                      {lead.contactDate && (
                        <span className="flex items-center gap-1 text-slate-500">
                          <Calendar className="w-3 h-3" />
                          Contato: {formatDatePT(lead.contactDate)}
                        </span>
                      )}
                      {lead.nextFollowUpDate && (
                        <span className="flex items-center gap-1 text-amber-400 font-medium">
                          <Clock className="w-3 h-3" />
                          Follow-up: {formatDatePT(lead.nextFollowUpDate)}
                        </span>
                      )}
                    </div>

                    {lead.response && (
                      <p className="text-xs text-emerald-300/80 mt-1.5 italic">
                        &quot;{lead.response}&quot;
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={cn('text-[10px] font-bold uppercase px-2.5 py-1 rounded-full', meta.bg, meta.color)}>
                    {meta.label}
                  </span>

                  <button
                    onClick={() => {
                      setLeadToEdit(lead);
                      setIsLeadModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                    title="Editar lead"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(lead.id, lead.name)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Excluir lead"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lead Modal */}
      <LeadModal
        isOpen={isLeadModalOpen}
        onClose={() => setIsLeadModalOpen(false)}
        leadToEdit={leadToEdit}
      />
    </div>
  );
};
