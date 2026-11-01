import React, { useState, useEffect } from 'react';
import { X, Target, Phone, Mail, Calendar, Bell, Plus, Trash2 } from 'lucide-react';
import { InstagramIcon } from '../common/Icons';
import { useTaskHub } from '../../context/TaskHubContext';
import { ProspectionLead, LeadType, LeadStatus, ProjectId } from '../../types';

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadToEdit?: ProspectionLead | null;
}

export const LeadModal: React.FC<LeadModalProps> = ({ isOpen, onClose, leadToEdit }) => {
  const { createLead, updateLead } = useTaskHub();

  const [name, setName] = useState('');
  const [type, setType] = useState<LeadType>('empresa');
  const [projectId, setProjectId] = useState<ProjectId>('winc');
  const [instagram, setInstagram] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [contactDate, setContactDate] = useState('');
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');
  const [reminderSet, setReminderSet] = useState(false);
  const [response, setResponse] = useState('');
  const [status, setStatus] = useState<LeadStatus>('novo_lead');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (leadToEdit) {
      setName(leadToEdit.name);
      setType(leadToEdit.type);
      setProjectId(leadToEdit.projectId);
      setInstagram(leadToEdit.instagram || '');
      setPhone(leadToEdit.phone || '');
      setEmail(leadToEdit.email || '');
      setNotes(leadToEdit.notes || '');
      setContactDate(leadToEdit.contactDate || '');
      setNextFollowUpDate(leadToEdit.nextFollowUpDate || '');
      setReminderSet(leadToEdit.reminderSet);
      setResponse(leadToEdit.response || '');
      setStatus(leadToEdit.status);
      setErrorMessage('');
    } else {
      setName('');
      setType('empresa');
      setProjectId('winc');
      setInstagram('');
      setPhone('');
      setEmail('');
      setNotes('');
      const now = new Date();
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const d = String(now.getDate()).padStart(2, '0');
      setContactDate(`${y}-${m}-${d}`);
      setNextFollowUpDate('');
      setReminderSet(false);
      setResponse('');
      setStatus('primeiro_contato');
      setErrorMessage('');
    }
  }, [leadToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setErrorMessage('');

    try {
      if (leadToEdit) {
        await updateLead(leadToEdit.id, {
          name: name.trim(),
          type,
          projectId,
          instagram: instagram.trim().replace(/^@/, ''),
          phone: phone.trim(),
          email: email.trim(),
          notes: notes.trim(),
          contactDate: contactDate || undefined,
          nextFollowUpDate: nextFollowUpDate || undefined,
          reminderSet,
          response: response.trim(),
          status
        });
      } else {
        await createLead({
          name: name.trim(),
          type,
          projectId,
          instagram: instagram.trim().replace(/^@/, ''),
          phone: phone.trim(),
          email: email.trim(),
          notes: notes.trim(),
          contactDate: contactDate || undefined,
          nextFollowUpDate: nextFollowUpDate || undefined,
          reminderSet,
          response: response.trim(),
          status
        });
      }
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao salvar lead.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md select-none overflow-y-auto">
      <div className="w-full max-w-lg bg-[#111420] border border-emerald-500/40 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#141d24]">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">
              {leadToEdit ? 'Editar Lead de Prospecção' : 'Novo Lead Comercial'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/40 text-red-300 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          {/* Type & Project */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Tipo de Prospecção
              </label>
              <select
                value={type}
                onChange={(e) => {
                  const val = e.target.value as LeadType;
                  setType(val);
                  setProjectId(val === 'empresa' ? 'winc' : 'evilbear');
                }}
                className="w-full px-3.5 py-2 rounded-xl bg-[#171b29] border border-white/10 text-white focus:outline-none"
              >
                <option value="empresa">Empresa (Agência Winc)</option>
                <option value="artista">Artista / Cantor (EVILBEAR)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Projeto Vinculado
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value as ProjectId)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#171b29] border border-white/10 text-white focus:outline-none"
              >
                <option value="winc">Agência Winc</option>
                <option value="evilbear">EVILBEAR.JPG</option>
              </select>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Nome da Empresa ou Artista *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: MC Kaio / Ótica Visão Real"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-semibold focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Contacts */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Instagram (@)
              </label>
              <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                <InstagramIcon className="w-3.5 h-3.5 text-purple-400 mr-1.5" />
                <span className="text-slate-500 mr-1">@</span>
                <input
                  type="text"
                  placeholder="perfil"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  className="bg-transparent text-white focus:outline-none w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                WhatsApp / Telefone
              </label>
              <input
                type="text"
                placeholder="(11) 99999-9999"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Status Comercial
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as LeadStatus)}
              className="w-full px-3.5 py-2 rounded-xl bg-[#171b29] border border-white/10 text-white focus:outline-none focus:border-emerald-500 font-medium"
            >
              <option value="novo_lead">Novo lead</option>
              <option value="em_analise">Em análise</option>
              <option value="primeiro_contato">Primeiro contato realizado</option>
              <option value="aguardando_resposta">Aguardando resposta</option>
              <option value="followup_agendado">Follow-up agendado</option>
              <option value="em_negociacao">Em negociação</option>
              <option value="fechado">Cliente fechado</option>
              <option value="nao_interessado">Não interessado</option>
            </select>
          </div>

          {/* Contact Date & Next Followup */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Data do Contato Realizado
              </label>
              <input
                type="date"
                value={contactDate}
                onChange={(e) => setContactDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Data do Próximo Follow-up
              </label>
              <input
                type="date"
                value={nextFollowUpDate}
                onChange={(e) => setNextFollowUpDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Follow-up reminder checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="leadReminder"
              checked={reminderSet}
              onChange={(e) => setReminderSet(e.target.checked)}
              className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
            />
            <label htmlFor="leadReminder" className="text-slate-300 font-medium cursor-pointer">
              Criar lembrete no Calendário e Alerta 00h00 para a data do follow-up
            </label>
          </div>

          {/* Response & Notes */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Resposta Obtida / Retorno do Lead
            </label>
            <input
              type="text"
              placeholder="Ex: Gostou do portfólio, pediu proposta para próxima terça"
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Observações Gerais
            </label>
            <textarea
              rows={2}
              placeholder="Dores do cliente, referências visuais, nicho de atuação..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none resize-none"
            />
          </div>

          {/* History log if editing */}
          {leadToEdit && leadToEdit.history && leadToEdit.history.length > 0 && (
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Histórico de Interações ({leadToEdit.history.length})
              </label>
              <div className="max-h-24 overflow-y-auto space-y-1 p-2 rounded-xl bg-white/5 border border-white/5 text-[11px]">
                {leadToEdit.history.map((h, i) => (
                  <div key={i} className="text-slate-400">
                    <span className="text-slate-500 font-mono text-[10px] mr-2">
                      {h.date.slice(0, 10)}:
                    </span>
                    {h.note}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)]"
            >
              Salvar Lead
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
