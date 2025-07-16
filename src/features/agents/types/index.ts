export interface Agent {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  whatsappNumber: string;
  profilePicture?: string;
  status: AgentStatus;
  tier: AgentTier;
  location: AgentLocation;
  territoryAssignments: TerritoryAssignment[];
  commissionStructure: CommissionStructure;
  metrics: AgentMetrics;
  onboardingStatus: OnboardingStatus;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AgentLocation {
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export interface TerritoryAssignment {
  id: string;
  agentId: string;
  territoryType: 'city' | 'region' | 'postal_code' | 'custom';
  territoryData: {
    name: string;
    boundaries: string[];
    population?: number;
    businessCount?: number;
  };
  assignedAt: string;
  isActive: boolean;
}

export interface Lead {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  businessType: BusinessType;
  estimatedRevenue: number;
  priority: LeadPriority;
  status: LeadStatus;
  source: LeadSource;
  assignedAgentId?: string;
  location: {
    city: string;
    state: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  notes: LeadNote[];
  activities: LeadActivity[];
  followUpDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeadNote {
  id: string;
  leadId: string;
  agentId: string;
  content: string;
  type: 'general' | 'call' | 'meeting' | 'email' | 'whatsapp';
  isPrivate: boolean;
  createdAt: string;
}

export interface LeadActivity {
  id: string;
  leadId: string;
  agentId: string;
  type: ActivityType;
  description: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface Commission {
  id: string;
  agentId: string;
  leadId?: string;
  orderId?: string;
  type: CommissionType;
  amount: number;
  currency: string;
  rate: number;
  baseAmount: number;
  status: CommissionStatus;
  paymentDate?: string;
  period: {
    startDate: string;
    endDate: string;
  };
  metadata: Record<string, any>;
  createdAt: string;
}

export interface CommissionStructure {
  baseRate: number;
  tierMultipliers: Record<AgentTier, number>;
  bonusThresholds: BonusThreshold[];
  paymentSchedule: 'weekly' | 'biweekly' | 'monthly';
  minimumPayout: number;
}

export interface BonusThreshold {
  minimumLeads: number;
  minimumRevenue: number;
  bonusPercentage: number;
  description: string;
}

export interface AgentMetrics {
  totalLeads: number;
  convertedLeads: number;
  conversionRate: number;
  totalRevenue: number;
  averageDealSize: number;
  responseTime: number;
  activeLeads: number;
  thisMonthLeads: number;
  thisMonthRevenue: number;
  totalCommissions: number;
  pendingCommissions: number;
  rank: number;
  performance: {
    lastMonth: PerformanceMetrics;
    thisMonth: PerformanceMetrics;
    yearToDate: PerformanceMetrics;
  };
}

export interface PerformanceMetrics {
  leadsGenerated: number;
  leadsConverted: number;
  revenue: number;
  commissionEarned: number;
  activeDays: number;
}

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  type: 'info' | 'form' | 'document' | 'verification' | 'training';
  isRequired: boolean;
  isCompleted: boolean;
  completedAt?: string;
  data?: Record<string, any>;
}

export interface OnboardingStatus {
  currentStep: number;
  totalSteps: number;
  isCompleted: boolean;
  completedAt?: string;
  steps: OnboardingStep[];
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  category: 'marketing' | 'utility' | 'authentication';
  language: string;
  status: 'approved' | 'pending' | 'rejected';
  components: WhatsAppComponent[];
  createdAt: string;
}

export interface WhatsAppComponent {
  type: 'header' | 'body' | 'footer' | 'buttons';
  format?: 'text' | 'media' | 'location';
  text?: string;
  parameters?: WhatsAppParameter[];
  buttons?: WhatsAppButton[];
}

export interface WhatsAppParameter {
  type: 'text' | 'currency' | 'date_time';
  text?: string;
}

export interface WhatsAppButton {
  type: 'quick_reply' | 'url' | 'phone_number';
  text: string;
  url?: string;
  phone_number?: string;
}

export interface WhatsAppMessage {
  id: string;
  leadId: string;
  agentId: string;
  direction: 'inbound' | 'outbound';
  type: 'text' | 'template' | 'media' | 'document';
  content: string;
  templateId?: string;
  mediaUrl?: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
}

export interface AgentNotification {
  id: string;
  agentId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  readAt?: string;
}

export interface AgentTask {
  id: string;
  agentId: string;
  leadId?: string;
  type: TaskType;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  dueDate?: string;
  completedAt?: string;
  reminder?: {
    reminderAt: string;
    isActive: boolean;
  };
  createdAt: string;
}

// Enums and Types
export type AgentStatus = 'active' | 'inactive' | 'suspended' | 'pending_approval';
export type AgentTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost' | 'nurturing';
export type LeadPriority = 'low' | 'medium' | 'high' | 'urgent';
export type LeadSource = 'website' | 'referral' | 'cold_call' | 'social_media' | 'advertisement' | 'event' | 'partner';
export type BusinessType = 'restaurant' | 'grocery' | 'catering' | 'food_truck' | 'bakery' | 'farm' | 'distributor' | 'other';
export type ActivityType = 'call' | 'email' | 'whatsapp' | 'meeting' | 'proposal_sent' | 'contract_signed' | 'follow_up' | 'note_added';
export type CommissionType = 'new_signup' | 'monthly_revenue' | 'referral' | 'bonus' | 'penalty';
export type CommissionStatus = 'pending' | 'approved' | 'paid' | 'disputed' | 'cancelled';
export type NotificationType = 'new_lead' | 'lead_update' | 'commission_earned' | 'target_achieved' | 'reminder' | 'system' | 'whatsapp_message';
export type TaskType = 'follow_up' | 'call_back' | 'send_proposal' | 'schedule_meeting' | 'update_lead' | 'research' | 'training';

// API Response Types
export interface LeadSearchFilters {
  status?: LeadStatus[];
  priority?: LeadPriority[];
  source?: LeadSource[];
  businessType?: BusinessType[];
  assignedAgentId?: string;
  location?: string;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  search?: string;
}

export interface LeadSearchResult {
  leads: Lead[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface AgentDashboardData {
  agent: Agent;
  metrics: AgentMetrics;
  recentLeads: Lead[];
  notifications: AgentNotification[];
  tasks: AgentTask[];
  commissions: Commission[];
  leaderboard: AgentRanking[];
}

export interface AgentRanking {
  agentId: string;
  agentName: string;
  rank: number;
  metrics: {
    leadsConverted: number;
    revenue: number;
    commissionEarned: number;
  };
  tier: AgentTier;
}

// Form Types
export interface CreateLeadRequest {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  businessType: BusinessType;
  estimatedRevenue?: number;
  priority: LeadPriority;
  source: LeadSource;
  location: {
    city: string;
    state: string;
    address?: string;
  };
  notes?: string;
}

export interface UpdateLeadRequest {
  companyName?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  businessType?: BusinessType;
  estimatedRevenue?: number;
  priority?: LeadPriority;
  status?: LeadStatus;
  followUpDate?: string;
}

export interface SendWhatsAppRequest {
  leadId: string;
  message: string;
  templateId?: string;
  parameters?: Record<string, string>;
}

// Store Types
export interface AgentStore {
  // Agent data
  currentAgent: Agent | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Dashboard data
  dashboardData: AgentDashboardData | null;
  
  // Leads
  leads: Lead[];
  leadFilters: LeadSearchFilters;
  leadLoading: boolean;
  selectedLead: Lead | null;
  
  // Notifications
  notifications: AgentNotification[];
  unreadCount: number;
  
  // Tasks
  tasks: AgentTask[];
  
  // WhatsApp
  whatsappMessages: WhatsAppMessage[];
  whatsappTemplates: WhatsAppTemplate[];
  
  // Real-time updates
  isOnline: boolean;
  lastSyncAt: string | null;
  
  // Actions
  setAgent: (agent: Agent) => void;
  setDashboardData: (data: AgentDashboardData) => void;
  setLeads: (leads: Lead[]) => void;
  updateLead: (leadId: string, updates: Partial<Lead>) => void;
  addLead: (lead: Lead) => void;
  setLeadFilters: (filters: LeadSearchFilters) => void;
  setSelectedLead: (lead: Lead | null) => void;
  addNotification: (notification: AgentNotification) => void;
  markNotificationRead: (notificationId: string) => void;
  addTask: (task: AgentTask) => void;
  updateTask: (taskId: string, updates: Partial<AgentTask>) => void;
  addWhatsAppMessage: (message: WhatsAppMessage) => void;
  setOnlineStatus: (isOnline: boolean) => void;
  updateLastSync: () => void;
  logout: () => void;
}