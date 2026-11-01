import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  TaskItem,
  WincClient,
  EvilbearRelease,
  ProspectionLead,
  AppSettings,
  ProjectId
} from '../types';
import { playChimeSound } from '../lib/sounds';

interface TaskHubContextType {
  tasks: TaskItem[];
  clients: WincClient[];
  releases: EvilbearRelease[];
  leads: ProspectionLead[];
  settings: AppSettings;
  pinnedTasks: TaskItem[];
  selectedProject: 'todos' | ProjectId;
  setSelectedProject: (p: 'todos' | ProjectId) => void;
  selectedView: 'dashboard' | 'calendar' | 'winc' | 'evilbear' | 'prospeccao' | 'settings';
  setSelectedView: (v: 'dashboard' | 'calendar' | 'winc' | 'evilbear' | 'prospeccao' | 'settings') => void;
  activeTaskId: string | null;
  setActiveTaskId: (id: string | null) => void;
  isNewTaskModalOpen: boolean;
  setIsNewTaskModalOpen: (open: boolean) => void;
  isGlobalSearchOpen: boolean;
  setIsGlobalSearchOpen: (open: boolean) => void;
  targetNewTaskDate?: string;
  setTargetNewTaskDate: (d?: string) => void;

  // Actions
  refreshAll: () => Promise<void>;
  createTask: (data: Partial<TaskItem> & { title: string; targetDate: string; projectId: ProjectId }) => Promise<TaskItem>;
  updateTask: (id: string, data: Partial<TaskItem>) => Promise<TaskItem>;
  deleteTask: (id: string) => Promise<void>;
  duplicateTask: (id: string) => Promise<TaskItem>;
  concludeTask: (id: string) => Promise<void>;
  snoozeTask: (id: string, newDate: string, newTime?: string) => Promise<void>;
  unpinTask: (id: string) => Promise<void>;
  pinTask: (id: string) => Promise<void>;

  createClient: (data: Partial<WincClient> & { name: string }) => Promise<WincClient>;
  updateClient: (id: string, data: Partial<WincClient>) => Promise<WincClient>;
  deleteClient: (id: string) => Promise<void>;

  createRelease: (data: Partial<EvilbearRelease> & { title: string; releaseDate: string }, createTasks?: boolean) => Promise<EvilbearRelease>;
  updateRelease: (id: string, data: Partial<EvilbearRelease>) => Promise<EvilbearRelease>;
  deleteRelease: (id: string) => Promise<void>;

  createLead: (data: Partial<ProspectionLead> & { name: string; type: 'empresa' | 'artista'; projectId: ProjectId }) => Promise<ProspectionLead>;
  updateLead: (id: string, data: Partial<ProspectionLead> & { noteAppend?: string }) => Promise<ProspectionLead>;
  deleteLead: (id: string) => Promise<void>;

  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  simulateMidnight: (dateStr: string) => Promise<void>;
}

const defaultSettings: AppSettings = {
  openPanelManually: true,
  startMinimizedToTray: true,
  alwaysOnTop: false,
  doNotDisturb: false,
  globalShortcutToggle: 'CommandOrControl+Shift+T',
  notificationsEnabled: true,
  notifyDueSoon: true,
  notifyOverdue: true,
  notifyNewTask: true,
  startWithWindows: false,
  minimizeToTrayOnClose: true,
  soundEnabled: false,
  defaultReminderTime: '00:00',
  keepRemindersPinned: false,
  widgetOpacity: 0.95,
  widgetCompactMode: false,
  widgetMonitor: 'primary',
  wincColor: '#9333ea',
  evilbearColor: '#dc2626',
  personalColor: '#10b981',
  dailyProspectionGoal: 20,
  monthlyProspectionGoal: 400,
  theme: 'dark'
};

const TaskHubContext = createContext<TaskHubContextType | undefined>(undefined);

export const TaskHubProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [clients, setClients] = useState<WincClient[]>([]);
  const [releases, setReleases] = useState<EvilbearRelease[]>([]);
  const [leads, setLeads] = useState<ProspectionLead[]>([]);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [pinnedTasks, setPinnedTasks] = useState<TaskItem[]>([]);
  const [selectedProject, setSelectedProject] = useState<'todos' | ProjectId>('todos');
  const [selectedView, setSelectedView] = useState<'dashboard' | 'calendar' | 'winc' | 'evilbear' | 'prospeccao' | 'settings'>('dashboard');
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const [targetNewTaskDate, setTargetNewTaskDate] = useState<string | undefined>(undefined);

  const api = window.electronAPI;

  const refreshAll = useCallback(async () => {
    if (api) {
      try {
        const [t, c, r, l, s, p] = await Promise.all([
          api.getAllTasks(),
          api.getAllClients(),
          api.getAllReleases(),
          api.getAllLeads(),
          api.getSettings(),
          api.getCurrentlyPinnedTasks()
        ]);
        setTasks(t);
        setClients(c);
        setReleases(r);
        setLeads(l);
        if (s) setSettings(s);
        setPinnedTasks(p);
      } catch (err) {
        console.error('Failed to refresh data from Electron:', err);
      }
    } else {
      // LocalStorage fallback for non-electron development
      try {
        const localTasks = localStorage.getItem('winc_local_tasks');
        if (localTasks) setTasks(JSON.parse(localTasks));
      } catch (e) {}
    }
  }, [api]);

  useEffect(() => {
    refreshAll();

    if (api) {
      const unsubChanges = api.onTasksChanged(() => {
        refreshAll();
      });
      const unsubPinned = api.onPinnedTasksUpdated((newPinned) => {
        setPinnedTasks(newPinned);
        if (settings.soundEnabled && newPinned.length > 0) {
          playChimeSound('reminder');
        }
      });
      const unsubFocus = api.onTaskFocusRequested((taskId) => {
        setActiveTaskId(taskId);
      });
      const unsubSettings = api.onSettingsChanged?.((newSettings) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
      });
      const unsubNav = api.onNavigateTo?.((view) => {
        if (['dashboard', 'calendar', 'winc', 'evilbear', 'prospeccao', 'settings'].includes(view)) {
          setSelectedView(view as any);
        }
      });

      return () => {
        unsubChanges();
        unsubPinned();
        unsubFocus();
        if (unsubSettings) unsubSettings();
        if (unsubNav) unsubNav();
      };
    }
  }, [api, refreshAll, settings.soundEnabled]);

  // Tasks actions
  const createTask = async (data: Partial<TaskItem> & { title: string; targetDate: string; projectId: ProjectId }) => {
    if (api) {
      const created = await api.createTask(data);
      await refreshAll();
      return created;
    }
    const fake: TaskItem = {
      id: Math.random().toString(),
      title: data.title,
      description: data.description || '',
      projectId: data.projectId,
      category: data.category || 'Geral',
      targetDate: data.targetDate,
      priority: data.priority || 'media',
      status: 'nao_iniciada',
      checklist: [],
      attachments: [],
      recurrence: data.recurrence || 'none',
      reminderEnabled: true,
      reminderTime: '00:00',
      isPinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updated = [...tasks, fake];
    setTasks(updated);
    localStorage.setItem('winc_local_tasks', JSON.stringify(updated));
    return fake;
  };

  const updateTask = async (id: string, data: Partial<TaskItem>) => {
    if (api) {
      const res = await api.updateTask(id, data);
      await refreshAll();
      return res;
    }
    const updated = tasks.map(t => (t.id === id ? { ...t, ...data } : t));
    setTasks(updated);
    return updated.find(t => t.id === id)!;
  };

  const deleteTask = async (id: string) => {
    if (api) {
      await api.deleteTask(id);
      await refreshAll();
      return;
    }
    setTasks(tasks.filter(t => t.id !== id));
  };

  const duplicateTask = async (id: string) => {
    if (api) {
      const res = await api.duplicateTask(id);
      await refreshAll();
      return res;
    }
    const orig = tasks.find(t => t.id === id);
    if (!orig) throw new Error('Not found');
    return createTask({ ...orig, title: `${orig.title} (Cópia)` });
  };

  const concludeTask = async (id: string) => {
    if (api) {
      await api.concludeTask(id);
      await refreshAll();
    } else {
      setTasks(tasks.map(t => t.id === id ? { ...t, status: 'concluida', isPinned: false } : t));
    }
    if (settings.soundEnabled) playChimeSound('success');
  };

  const snoozeTask = async (id: string, newDate: string, newTime?: string) => {
    if (api) {
      await api.snoozeTask(id, newDate, newTime);
      await refreshAll();
    } else {
      setTasks(tasks.map(t => t.id === id ? { ...t, targetDate: newDate, targetTime: newTime, isPinned: false } : t));
    }
  };

  const unpinTask = async (id: string) => {
    if (api) {
      await api.unpinTask(id);
      await refreshAll();
    } else {
      setTasks(tasks.map(t => t.id === id ? { ...t, isPinned: false } : t));
    }
  };

  const pinTask = async (id: string) => {
    if (api) {
      await api.pinTask(id);
      await refreshAll();
    }
  };

  // Client actions
  const createClient = async (data: Partial<WincClient> & { name: string }) => {
    if (api) {
      const res = await api.createClient(data);
      await refreshAll();
      return res;
    }
    const fake = { id: Math.random().toString(), active: true, createdAt: new Date().toISOString(), ...data };
    setClients([...clients, fake as WincClient]);
    return fake as WincClient;
  };

  const updateClient = async (id: string, data: Partial<WincClient>) => {
    if (api) {
      const res = await api.updateClient(id, data);
      await refreshAll();
      return res;
    }
    const updated = clients.map(c => c.id === id ? { ...c, ...data } : c);
    setClients(updated);
    return updated.find(c => c.id === id)!;
  };

  const deleteClient = async (id: string) => {
    if (api) {
      await api.deleteClient(id);
      await refreshAll();
    }
  };

  // Release actions
  const createRelease = async (data: Partial<EvilbearRelease> & { title: string; releaseDate: string }, createTasks?: boolean) => {
    if (api) {
      const res = await api.createRelease(data, createTasks);
      await refreshAll();
      return res;
    }
    const fake = { id: Math.random().toString(), checklist: [], formats: ['WAV', 'MP3', 'STEMS'], licenseStatus: 'disponivel' as const, status: 'planejamento' as const, createdAt: new Date().toISOString(), ...data };
    setReleases([...releases, fake as EvilbearRelease]);
    return fake as EvilbearRelease;
  };

  const updateRelease = async (id: string, data: Partial<EvilbearRelease>) => {
    if (api) {
      const res = await api.updateRelease(id, data);
      await refreshAll();
      return res;
    }
    const updated = releases.map(r => r.id === id ? { ...r, ...data } : r);
    setReleases(updated);
    return updated.find(r => r.id === id)!;
  };

  const deleteRelease = async (id: string) => {
    if (api) {
      await api.deleteRelease(id);
      await refreshAll();
    }
  };

  // Lead actions
  const createLead = async (data: Partial<ProspectionLead> & { name: string; type: 'empresa' | 'artista'; projectId: ProjectId }) => {
    if (api) {
      const res = await api.createLead(data);
      await refreshAll();
      return res;
    }
    const fake = { id: Math.random().toString(), status: 'novo_lead' as const, reminderSet: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ...data };
    setLeads([...leads, fake as ProspectionLead]);
    return fake as ProspectionLead;
  };

  const updateLead = async (id: string, data: Partial<ProspectionLead> & { noteAppend?: string }) => {
    if (api) {
      const res = await api.updateLead(id, data);
      await refreshAll();
      return res;
    }
    const updated = leads.map(l => l.id === id ? { ...l, ...data } : l);
    setLeads(updated);
    return updated.find(l => l.id === id)!;
  };

  const deleteLead = async (id: string) => {
    if (api) {
      await api.deleteLead(id);
      await refreshAll();
    }
  };

  // Settings
  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    if (api) {
      const updated = await api.updateSettings(newSettings);
      setSettings(updated);
    } else {
      setSettings(prev => ({ ...prev, ...newSettings }));
    }
  };

  const simulateMidnight = async (dateStr: string) => {
    if (api) {
      await api.simulateMidnight(dateStr);
      await refreshAll();
    }
  };

  return (
    <TaskHubContext.Provider
      value={{
        tasks,
        clients,
        releases,
        leads,
        settings,
        pinnedTasks,
        selectedProject,
        setSelectedProject,
        selectedView,
        setSelectedView,
        activeTaskId,
        setActiveTaskId,
        isNewTaskModalOpen,
        setIsNewTaskModalOpen,
        isGlobalSearchOpen,
        setIsGlobalSearchOpen,
        targetNewTaskDate,
        setTargetNewTaskDate,
        refreshAll,
        createTask,
        updateTask,
        deleteTask,
        duplicateTask,
        concludeTask,
        snoozeTask,
        unpinTask,
        pinTask,
        createClient,
        updateClient,
        deleteClient,
        createRelease,
        updateRelease,
        deleteRelease,
        createLead,
        updateLead,
        deleteLead,
        updateSettings,
        simulateMidnight
      }}
    >
      {children}
    </TaskHubContext.Provider>
  );
};

export function useTaskHub() {
  const context = useContext(TaskHubContext);
  if (!context) {
    throw new Error('useTaskHub must be used within a TaskHubProvider');
  }
  return context;
}
