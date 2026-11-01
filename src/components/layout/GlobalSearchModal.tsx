import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  CheckCircle2,
  Briefcase,
  Music2,
  Target,
  ArrowRight
} from 'lucide-react';
import { useTaskHub } from '../../context/TaskHubContext';
import { formatDatePT } from '../../lib/utils';

export const GlobalSearchModal: React.FC = () => {
  const {
    isGlobalSearchOpen,
    setIsGlobalSearchOpen,
    tasks,
    clients,
    releases,
    leads,
    setActiveTaskId,
    setSelectedView
  } = useTaskHub();

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsGlobalSearchOpen(true);
      }
      if (e.key === 'Escape' && isGlobalSearchOpen) {
        setIsGlobalSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGlobalSearchOpen, setIsGlobalSearchOpen]);

  useEffect(() => {
    if (isGlobalSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isGlobalSearchOpen]);

  if (!isGlobalSearchOpen) return null;

  const q = query.toLowerCase().trim();

  const matchedTasks = q
    ? tasks.filter(t => t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q) || t.category?.toLowerCase().includes(q))
    : [];

  const matchedClients = q
    ? clients.filter(c => c.name.toLowerCase().includes(q) || c.company?.toLowerCase().includes(q) || c.instagram?.toLowerCase().includes(q))
    : [];

  const matchedReleases = q
    ? releases.filter(r => r.title.toLowerCase().includes(q) || r.genre?.toLowerCase().includes(q))
    : [];

  const matchedLeads = q
    ? leads.filter(l => l.name.toLowerCase().includes(q) || l.instagram?.toLowerCase().includes(q) || l.notes?.toLowerCase().includes(q))
    : [];

  const hasResults = matchedTasks.length > 0 || matchedClients.length > 0 || matchedReleases.length > 0 || matchedLeads.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/70 backdrop-blur-md select-none">
      <div className="w-full max-w-2xl bg-[#111420] border border-purple-500/30 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[75vh]">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10 bg-[#141826]">
          <Search className="w-5 h-5 text-purple-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Pesquise por tarefas, clientes, beats, leads..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="px-2 py-0.5 text-[10px] font-mono rounded bg-white/5 border border-white/10 text-slate-400">
            Esc
          </kbd>
        </div>

        {/* Results container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!q ? (
            <div className="text-center py-10 text-slate-500 text-xs">
              Digite uma palavra-chave para buscar globalmente em todo o sistema.
            </div>
          ) : !hasResults ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              Nenhum resultado encontrado para &quot;{query}&quot;.
            </div>
          ) : (
            <>
              {/* Tasks */}
              {matchedTasks.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Tarefas ({matchedTasks.length})
                  </div>
                  <div className="space-y-1">
                    {matchedTasks.slice(0, 5).map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          setActiveTaskId(t.id);
                          setIsGlobalSearchOpen(false);
                          setSelectedView('calendar');
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-left text-xs transition-colors group"
                      >
                        <div className="flex items-center gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-purple-400" />
                          <div>
                            <span className="font-semibold text-slate-200 group-hover:text-purple-300">
                              {t.title}
                            </span>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              {t.category} • {formatDatePT(t.targetDate)}
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-white" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Clients */}
              {matchedClients.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Clientes Winc ({matchedClients.length})
                  </div>
                  <div className="space-y-1">
                    {matchedClients.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setIsGlobalSearchOpen(false);
                          setSelectedView('winc');
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-left text-xs transition-colors group"
                      >
                        <div className="flex items-center gap-2.5">
                          <Briefcase className="w-4 h-4 text-purple-400" />
                          <div>
                            <span className="font-semibold text-slate-200 group-hover:text-purple-300">
                              {c.name}
                            </span>
                            {c.company && (
                              <span className="text-[10px] text-slate-500 ml-2">
                                ({c.company})
                              </span>
                            )}
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-white" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Releases */}
              {matchedReleases.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Lançamentos EVILBEAR ({matchedReleases.length})
                  </div>
                  <div className="space-y-1">
                    {matchedReleases.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => {
                          setIsGlobalSearchOpen(false);
                          setSelectedView('evilbear');
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-left text-xs transition-colors group"
                      >
                        <div className="flex items-center gap-2.5">
                          <Music2 className="w-4 h-4 text-red-400" />
                          <div>
                            <span className="font-semibold text-slate-200 group-hover:text-red-300">
                              {r.title}
                            </span>
                            <span className="text-[10px] text-slate-500 ml-2">
                              {formatDatePT(r.releaseDate)}
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-white" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Leads */}
              {matchedLeads.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Prospecção & Leads ({matchedLeads.length})
                  </div>
                  <div className="space-y-1">
                    {matchedLeads.map((l) => (
                      <button
                        key={l.id}
                        onClick={() => {
                          setIsGlobalSearchOpen(false);
                          setSelectedView('prospeccao');
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-left text-xs transition-colors group"
                      >
                        <div className="flex items-center gap-2.5">
                          <Target className="w-4 h-4 text-emerald-400" />
                          <div>
                            <span className="font-semibold text-slate-200 group-hover:text-emerald-300">
                              {l.name}
                            </span>
                            {l.instagram && (
                              <span className="text-[10px] text-purple-400 ml-2 font-mono">
                                @{l.instagram}
                              </span>
                            )}
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-white" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
