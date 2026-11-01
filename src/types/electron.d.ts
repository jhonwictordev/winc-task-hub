import {
  TaskItem,
  WincClient,
  EvilbearRelease,
  ProspectionLead,
  AppSettings,
  ErrorLogEntry,
  ProjectId
} from './index';

export interface IElectronAPI {
  // Tasks
  getAllTasks: () => Promise<TaskItem[]>;
  getTaskById: (id: string) => Promise<TaskItem | null>;
  getTasksByDate: (dateStr: string) => Promise<TaskItem[]>;
  createTask: (data: Partial<TaskItem> & { title: string; targetDate: string; projectId: ProjectId }) => Promise<TaskItem>;
  updateTask: (id: string, data: Partial<TaskItem>) => Promise<TaskItem>;
  deleteTask: (id: string) => Promise<TaskItem>;
  duplicateTask: (id: string) => Promise<TaskItem>;
  concludeTask: (id: string) => Promise<TaskItem>;
  snoozeTask: (id: string, newDate: string, newTime?: string) => Promise<TaskItem>;
  unpinTask: (id: string) => Promise<TaskItem>;
  pinTask: (id: string) => Promise<TaskItem>;
  getCurrentlyPinnedTasks: () => Promise<TaskItem[]>;

  // Clients
  getAllClients: () => Promise<WincClient[]>;
  createClient: (data: Partial<WincClient> & { name: string }) => Promise<WincClient>;
  updateClient: (id: string, data: Partial<WincClient>) => Promise<WincClient>;
  deleteClient: (id: string) => Promise<WincClient>;

  // Releases
  getAllReleases: () => Promise<EvilbearRelease[]>;
  createRelease: (data: Partial<EvilbearRelease> & { title: string; releaseDate: string }, createTasks?: boolean) => Promise<EvilbearRelease>;
  updateRelease: (id: string, data: Partial<EvilbearRelease>) => Promise<EvilbearRelease>;
  deleteRelease: (id: string) => Promise<EvilbearRelease>;

  // Leads
  getAllLeads: (projectId?: string) => Promise<ProspectionLead[]>;
  createLead: (data: Partial<ProspectionLead> & { name: string; type: 'empresa' | 'artista'; projectId: ProjectId }) => Promise<ProspectionLead>;
  updateLead: (id: string, data: Partial<ProspectionLead> & { noteAppend?: string }) => Promise<ProspectionLead>;
  deleteLead: (id: string) => Promise<ProspectionLead>;
  getProspectionStats: (todayStr: string, monthPrefix: string) => Promise<{
    totalLeads: number;
    todayContacts: number;
    monthContacts: number;
    closedDeals: number;
    waitingResponse: number;
    inNegotiation: number;
  }>;

  // Settings & Backups
  getSettings: () => Promise<AppSettings>;
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<AppSettings>;
  getErrorLogs: () => Promise<ErrorLogEntry[]>;
  clearErrorLogs: () => Promise<boolean>;
  exportBackup: () => Promise<any>;
  importBackup: (backupJson: any) => Promise<boolean>;
  exportCSV: () => Promise<string>;

  // Window Controls & Shortcuts
  openMainWindow: () => Promise<void>;
  hideMainWindow: () => Promise<boolean>;
  toggleMainWindow: () => Promise<boolean>;
  setAlwaysOnTop: (enabled: boolean) => Promise<boolean>;
  focusTaskInMain: (taskId: string) => Promise<void>;
  checkShortcutConflict: (shortcutStr: string) => Promise<{ conflict: boolean; error?: string }>;
  setWidgetCompact: (isCompact: boolean) => Promise<void>;
  setWidgetOpacity: (opacity: number) => Promise<void>;
  hideWidget: () => Promise<void>;
  showWidget: () => Promise<void>;
  hideQuickCapture: () => Promise<void>;
  simulateMidnight: (dateStr: string) => Promise<boolean>;

  // Event Listeners
  onPinnedTasksUpdated: (callback: (tasks: TaskItem[]) => void) => () => void;
  onTaskFocusRequested: (callback: (taskId: string) => void) => () => void;
  onTasksChanged: (callback: () => void) => () => void;
  onSettingsChanged: (callback: (settings: AppSettings) => void) => () => void;
  onNavigateTo: (callback: (view: string) => void) => () => void;
}

declare global {
  interface Window {
    electronAPI?: IElectronAPI;
  }
}
