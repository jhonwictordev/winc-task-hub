export type ProjectId = 'winc' | 'evilbear' | 'pessoal';

export type TaskStatus =
  | 'nao_iniciada'
  | 'em_andamento'
  | 'aguardando_material'
  | 'aguardando_aprovacao'
  | 'em_revisao'
  | 'concluida';

export type TaskPriority = 'baixa' | 'media' | 'alta' | 'urgente';

export type RecurrenceType =
  | 'none'
  | 'daily'
  | 'weekly'
  | 'biweekly'
  | 'monthly'
  | 'specific_days';

export interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskAttachment {
  id: string;
  name: string;
  url: string;
  type?: 'link' | 'file';
}

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  projectId: ProjectId;
  category: string;
  clientId?: string;
  clientName?: string;
  targetDate: string; // YYYY-MM-DD
  targetTime?: string; // HH:mm
  deliveryDate?: string; // YYYY-MM-DD (prazo de entrega)
  priority: TaskPriority;
  status: TaskStatus;
  checklist: ChecklistItem[];
  attachments: TaskAttachment[];
  recurrence: RecurrenceType;
  recurrenceDays?: number[]; // [1, 2, 3, ...] (0 = Domingo)
  reminderEnabled: boolean;
  reminderTime: string; // default "00:00"
  isPinned: boolean; // Sticky floating widget state
  pinnedDismissedAt?: string | null; // Unpinned without concluding
  notifiedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WincClient {
  id: string;
  name: string;
  company?: string;
  instagram?: string;
  phone?: string;
  email?: string;
  notes?: string;
  active: boolean;
  createdAt: string;
}

export interface EvilbearRelease {
  id: string;
  title: string;
  releaseDate: string; // YYYY-MM-DD
  releaseTime?: string;
  recurrence?: string;
  genre?: string;
  bpm?: number;
  musicalKey?: string;
  formats: string[]; // ['WAV', 'MP3', 'STEMS']
  licenseStatus: 'disponivel' | 'negociando' | 'exclusivo' | 'licenciado';
  checklist: ChecklistItem[];
  notes?: string;
  status: 'planejamento' | 'producao' | 'finalizado' | 'programado' | 'lancado';
  createdAt: string;
}

export type LeadType = 'empresa' | 'artista';

export type LeadStatus =
  | 'novo_lead'
  | 'em_analise'
  | 'primeiro_contato'
  | 'aguardando_resposta'
  | 'followup_agendado'
  | 'em_negociacao'
  | 'fechado'
  | 'nao_interessado';

export interface ProspectionLead {
  id: string;
  name: string;
  type: LeadType;
  projectId: ProjectId;
  instagram?: string;
  phone?: string;
  email?: string;
  notes?: string;
  contactDate?: string; // YYYY-MM-DD
  nextFollowUpDate?: string; // YYYY-MM-DD
  reminderSet: boolean;
  response?: string;
  status: LeadStatus;
  history?: Array<{
    date: string;
    note: string;
    status: LeadStatus;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  openPanelManually: boolean;
  startMinimizedToTray: boolean;
  alwaysOnTop: boolean;
  doNotDisturb: boolean;
  globalShortcutToggle: string;
  notificationsEnabled: boolean;
  notifyDueSoon: boolean;
  notifyOverdue: boolean;
  notifyNewTask: boolean;
  startWithWindows: boolean;
  minimizeToTrayOnClose: boolean;
  soundEnabled: boolean;
  defaultReminderTime: string;
  keepRemindersPinned: boolean;
  widgetOpacity: number;
  widgetCompactMode: boolean;
  widgetMonitor: string;
  wincColor: string;
  evilbearColor: string;
  personalColor: string;
  dailyProspectionGoal: number;
  monthlyProspectionGoal: number;
  theme: 'dark' | 'light';
}

export interface ErrorLogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  details?: string;
}

export const WINC_CATEGORIES = [
  'Criação de artes estáticas',
  'Criação de carrosséis',
  'Edição de vídeos',
  'Motion design',
  'Produção de vídeos comerciais',
  'Criação de roteiros',
  'Social media',
  'Publicação de conteúdo',
  'Gerenciamento de clientes',
  'Desenvolvimento de sites',
  'Criação de apresentações comerciais',
  'Identidade visual',
  'Tráfego pago',
  'Automação e inteligência artificial',
  'Prospecção de empresas',
  'Follow-up comercial',
  'Reuniões',
  'Revisões e entregas',
] as const;

export const EVILBEAR_CATEGORIES = [
  'Produção de beats',
  'Criação de melodias',
  'Mixagem',
  'Masterização',
  'Criação de capas',
  'Visualizers',
  'Vídeos promocionais',
  'Upload no YouTube',
  'Publicação no Instagram',
  'Organização do catálogo',
  'Lançamento de instrumentais',
  'Prospecção de artistas',
  'Negociação comercial',
  'Licenciamento de beats',
  'Entrega de WAV, MP3 e STEMS',
] as const;

export const PESSOAL_CATEGORIES = [
  'Compromissos pessoais',
  'Desenvolvimento de sistemas',
  'Estudos',
  'Novos projetos',
  'Saúde e bem-estar',
  'Finanças',
] as const;
