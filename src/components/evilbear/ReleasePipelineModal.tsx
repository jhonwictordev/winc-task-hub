import React, { useState, useEffect } from 'react';
import { X, Music2, Calendar, Clock, Sliders, CheckSquare, Plus, Trash2 } from 'lucide-react';
import { useTaskHub } from '../../context/TaskHubContext';
import { EvilbearRelease, ChecklistItem } from '../../types';
import { cn } from '../../lib/utils';

interface ReleasePipelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  releaseToEdit?: EvilbearRelease | null;
}

const DEFAULT_RELEASE_STEPS = [
  'Finalizar beat',
  'Revisar mixagem',
  'Finalizar masterização',
  'Criar capa',
  'Criar visualizer',
  'Preparar título e descrição',
  'Programar publicação',
  'Divulgar lançamento'
];

export const ReleasePipelineModal: React.FC<ReleasePipelineModalProps> = ({
  isOpen,
  onClose,
  releaseToEdit
}) => {
  const { createRelease, updateRelease } = useTaskHub();

  const [title, setTitle] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [releaseTime, setReleaseTime] = useState('18:00');
  const [recurrence, setRecurrence] = useState('none');
  const [genre, setGenre] = useState('Trap / Boombap');
  const [bpm, setBpm] = useState<number | undefined>(140);
  const [musicalKey, setMusicalKey] = useState('C Minor');
  const [formats, setFormats] = useState<string[]>(['WAV', 'MP3', 'STEMS']);
  const [licenseStatus, setLicenseStatus] = useState<'disponivel' | 'negociando' | 'exclusivo' | 'licenciado'>('disponivel');
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [createCalendarTasks, setCreateCalendarTasks] = useState(true);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (releaseToEdit) {
      setTitle(releaseToEdit.title);
      setReleaseDate(releaseToEdit.releaseDate);
      setReleaseTime(releaseToEdit.releaseTime || '18:00');
      setRecurrence(releaseToEdit.recurrence || 'none');
      setGenre(releaseToEdit.genre || '');
      setBpm(releaseToEdit.bpm);
      setMusicalKey(releaseToEdit.musicalKey || '');
      setFormats(releaseToEdit.formats || ['WAV', 'MP3', 'STEMS']);
      setLicenseStatus(releaseToEdit.licenseStatus || 'disponivel');
      setChecklist(releaseToEdit.checklist || []);
      setNotes(releaseToEdit.notes || '');
      setCreateCalendarTasks(false);
    } else {
      setTitle('');
      const sunday = new Date();
      // Set to next Sunday
      sunday.setDate(sunday.getDate() + ((7 - sunday.getDay()) % 7 || 7));
      const y = sunday.getFullYear();
      const m = String(sunday.getMonth() + 1).padStart(2, '0');
      const d = String(sunday.getDate()).padStart(2, '0');
      setReleaseDate(`${y}-${m}-${d}`);
      setReleaseTime('18:00');
      setRecurrence('weekly'); // Default every Sunday
      setGenre('Trap / Drill');
      setBpm(140);
      setMusicalKey('C Minor');
      setFormats(['WAV', 'MP3', 'STEMS']);
      setLicenseStatus('disponivel');
      setChecklist(
        DEFAULT_RELEASE_STEPS.map((step) => ({
          id: Math.random().toString(),
          title: step,
          completed: false
        }))
      );
      setNotes('');
      setCreateCalendarTasks(true);
    }
  }, [releaseToEdit, isOpen]);

  if (!isOpen) return null;

  const toggleFormat = (fmt: string) => {
    if (formats.includes(fmt)) {
      setFormats(formats.filter(f => f !== fmt));
    } else {
      setFormats([...formats, fmt]);
    }
  };

  const handleToggleStep = (stepId: string) => {
    setChecklist(
      checklist.map(item => item.id === stepId ? { ...item, completed: !item.completed } : item)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !releaseDate) return;

    if (releaseToEdit) {
      await updateRelease(releaseToEdit.id, {
        title: title.trim(),
        releaseDate,
        releaseTime,
        recurrence,
        genre,
        bpm: bpm ? Number(bpm) : undefined,
        musicalKey,
        formats,
        licenseStatus,
        checklist,
        notes
      });
    } else {
      await createRelease(
        {
          title: title.trim(),
          releaseDate,
          releaseTime,
          recurrence,
          genre,
          bpm: bpm ? Number(bpm) : undefined,
          musicalKey,
          formats,
          licenseStatus,
          checklist,
          notes,
          status: 'planejamento'
        },
        createCalendarTasks
      );
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md select-none overflow-y-auto">
      <div className="w-full max-w-xl bg-[#111420] border border-red-500/40 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#161420]">
          <div className="flex items-center gap-2">
            <Music2 className="w-5 h-5 text-red-400" />
            <h3 className="text-sm font-bold text-white">
              {releaseToEdit ? 'Editar Lançamento' : 'Novo Lançamento — EVILBEAR.JPG'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Title */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Título do Instrumental / Pack de Beats *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Dark Trap Instrumental #42 (Evil Pack)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-red-500 font-semibold"
            />
          </div>

          {/* Date, Time & Recurrence */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Data do Lançamento *
              </label>
              <input
                type="date"
                required
                value={releaseDate}
                onChange={(e) => setReleaseDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Horário da Estreia
              </label>
              <input
                type="time"
                value={releaseTime}
                onChange={(e) => setReleaseTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-red-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Recorrência
              </label>
              <select
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#171b29] border border-white/10 text-white focus:outline-none focus:border-red-500"
              >
                <option value="none">Único</option>
                <option value="weekly">Semanal (Todo Domingo)</option>
                <option value="biweekly">Quinzenal</option>
                <option value="monthly">Mensal</option>
              </select>
            </div>
          </div>

          {/* Genre, BPM & Key */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Gênero / Estilo
              </label>
              <input
                type="text"
                placeholder="Ex: Dark Trap / Drill"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                BPM
              </label>
              <input
                type="number"
                placeholder="140"
                value={bpm || ''}
                onChange={(e) => setBpm(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-red-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Tom / Key
              </label>
              <input
                type="text"
                placeholder="Ex: C Minor"
                value={musicalKey}
                onChange={(e) => setMusicalKey(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {/* Formats & Licensing */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Formatos Inclusos
              </label>
              <div className="flex gap-2">
                {['WAV', 'MP3', 'STEMS'].map(fmt => (
                  <button
                    type="button"
                    key={fmt}
                    onClick={() => toggleFormat(fmt)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg font-mono text-[11px] font-bold border transition-all',
                      formats.includes(fmt)
                        ? 'bg-red-600/30 text-red-300 border-red-500'
                        : 'bg-white/5 text-slate-500 border-white/5'
                    )}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Licenciamento Comercial
              </label>
              <select
                value={licenseStatus}
                onChange={(e) => setLicenseStatus(e.target.value as any)}
                className="w-full px-3 py-1.5 rounded-xl bg-[#171b29] border border-white/10 text-white focus:outline-none"
              >
                <option value="disponivel">Disponível para Licença</option>
                <option value="negociando">Em Negociação</option>
                <option value="exclusivo">Exclusivo Fechado</option>
                <option value="licenciado">Licenciado (Lease)</option>
              </select>
            </div>
          </div>

          {/* 8 Release Checklist Steps */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Pipeline de Lançamento (8 Etapas Obrigatórias)
            </label>
            <div className="grid grid-cols-2 gap-1.5 p-3 rounded-xl bg-white/5 border border-white/10">
              {checklist.map((step) => (
                <div
                  key={step.id}
                  onClick={() => handleToggleStep(step.id)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/5 cursor-pointer text-slate-300 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={step.completed}
                    onChange={() => {}}
                    className="w-3.5 h-3.5 accent-red-600 rounded cursor-pointer"
                  />
                  <span className={cn('text-[11px]', step.completed && 'line-through text-slate-500')}>
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Link to Calendar option */}
          {!releaseToEdit && (
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="createTasksCalendar"
                checked={createCalendarTasks}
                onChange={(e) => setCreateCalendarTasks(e.target.checked)}
                className="w-4 h-4 accent-red-600 rounded cursor-pointer"
              />
              <label htmlFor="createTasksCalendar" className="text-slate-300 cursor-pointer font-medium">
                Sincronizar demanda principal com o Calendário Mensal e Lembrete 00h00
              </label>
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
              className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold shadow-[0_0_15px_rgba(220,38,38,0.4)]"
            >
              Salvar Lançamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
