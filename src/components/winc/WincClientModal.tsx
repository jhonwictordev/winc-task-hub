import React, { useState, useEffect } from 'react';
import { X, Briefcase, Phone, Mail, FileText, Check } from 'lucide-react';
import { InstagramIcon } from '../common/Icons';
import { useTaskHub } from '../../context/TaskHubContext';
import { WincClient } from '../../types';

interface WincClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientToEdit?: WincClient | null;
}

export const WincClientModal: React.FC<WincClientModalProps> = ({ isOpen, onClose, clientToEdit }) => {
  const { createClient, updateClient } = useTaskHub();

  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [instagram, setInstagram] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (clientToEdit) {
      setName(clientToEdit.name);
      setCompany(clientToEdit.company || '');
      setInstagram(clientToEdit.instagram || '');
      setPhone(clientToEdit.phone || '');
      setEmail(clientToEdit.email || '');
      setNotes(clientToEdit.notes || '');
      setActive(clientToEdit.active);
    } else {
      setName('');
      setCompany('');
      setInstagram('');
      setPhone('');
      setEmail('');
      setNotes('');
      setActive(true);
    }
  }, [clientToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (clientToEdit) {
      await updateClient(clientToEdit.id, {
        name: name.trim(),
        company: company.trim(),
        instagram: instagram.trim().replace(/^@/, ''),
        phone: phone.trim(),
        email: email.trim(),
        notes: notes.trim(),
        active
      });
    } else {
      await createClient({
        name: name.trim(),
        company: company.trim(),
        instagram: instagram.trim().replace(/^@/, ''),
        phone: phone.trim(),
        email: email.trim(),
        notes: notes.trim(),
        active
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md select-none">
      <div className="w-full max-w-lg bg-[#111420] border border-purple-500/40 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#141826]">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-bold text-white">
              {clientToEdit ? 'Editar Cliente' : 'Novo Cliente — Agência Winc'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Nome do Contato ou Responsável *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Carlos Silva"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Nome da Empresa / Marca
            </label>
            <input
              type="text"
              placeholder="Ex: Empresa X Motors"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500"
            />
          </div>

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
                  placeholder="empresa_x"
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
                className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              E-mail de Contato
            </label>
            <input
              type="email"
              placeholder="contato@empresa.com.br"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Observações & Contrato
            </label>
            <textarea
              rows={3}
              placeholder="Pacote contratado, preferências de design, prazos padrão..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="clientActive"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
            />
            <label htmlFor="clientActive" className="text-slate-300 font-medium cursor-pointer">
              Cliente com contrato ativo
            </label>
          </div>

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
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-[0_0_15px_rgba(147,51,234,0.3)]"
            >
              Salvar Cliente
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
