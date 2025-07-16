import { 
  Agent, 
  AgentDashboardData,
  Lead, 
  LeadSearchFilters, 
  LeadSearchResult,
  CreateLeadRequest,
  UpdateLeadRequest,
  Commission,
  AgentNotification,
  AgentTask,
  WhatsAppMessage,
  WhatsAppTemplate,
  SendWhatsAppRequest,
  OnboardingStatus
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';
const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:3001';

interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

class AgentApiService {
  private baseUrl: string;
  private wsUrl: string;
  private ws: WebSocket | null = null;
  private token: string | null = null;

  constructor() {
    this.baseUrl = API_BASE_URL;
    this.wsUrl = WS_URL;
    this.token = localStorage.getItem('agent_token');
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result: ApiResponse<T> = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'API request failed');
      }

      return result.data;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // Authentication
  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('agent_token', token);
  }

  clearToken(): void {
    this.token = null;
    localStorage.removeItem('agent_token');
  }

  async login(email: string, password: string): Promise<{ agent: Agent; token: string }> {
    const response = await this.request<{ agent: Agent; token: string }>('/agents/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    this.setToken(response.token);
    return response;
  }

  async logout(): Promise<void> {
    await this.request('/agents/logout', { method: 'POST' });
    this.clearToken();
    this.disconnect();
  }

  async getCurrentAgent(): Promise<Agent> {
    return this.request<Agent>('/agents/me');
  }

  async updateAgent(updates: Partial<Agent>): Promise<Agent> {
    return this.request<Agent>('/agents/me', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  // Dashboard
  async getDashboardData(): Promise<AgentDashboardData> {
    return this.request<AgentDashboardData>('/agents/dashboard');
  }

  // Leads
  async searchLeads(filters: LeadSearchFilters = {}, page = 1, pageSize = 20): Promise<LeadSearchResult> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });

    if (filters.search) params.append('search', filters.search);
    if (filters.status?.length) {
      filters.status.forEach(status => params.append('status', status));
    }
    if (filters.priority?.length) {
      filters.priority.forEach(priority => params.append('priority', priority));
    }
    if (filters.source?.length) {
      filters.source.forEach(source => params.append('source', source));
    }
    if (filters.businessType?.length) {
      filters.businessType.forEach(type => params.append('businessType', type));
    }
    if (filters.assignedAgentId) params.append('assignedAgentId', filters.assignedAgentId);
    if (filters.location) params.append('location', filters.location);
    if (filters.dateRange?.startDate) params.append('startDate', filters.dateRange.startDate);
    if (filters.dateRange?.endDate) params.append('endDate', filters.dateRange.endDate);

    return this.request<LeadSearchResult>(`/agents/leads?${params.toString()}`);
  }

  async getLeadById(leadId: string): Promise<Lead> {
    return this.request<Lead>(`/agents/leads/${leadId}`);
  }

  async createLead(leadData: CreateLeadRequest): Promise<Lead> {
    return this.request<Lead>('/agents/leads', {
      method: 'POST',
      body: JSON.stringify(leadData),
    });
  }

  async updateLead(leadId: string, updates: UpdateLeadRequest): Promise<Lead> {
    return this.request<Lead>(`/agents/leads/${leadId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteLead(leadId: string): Promise<void> {
    await this.request(`/agents/leads/${leadId}`, { method: 'DELETE' });
  }

  async claimLead(leadId: string): Promise<Lead> {
    return this.request<Lead>(`/agents/leads/${leadId}/claim`, {
      method: 'POST',
    });
  }

  async addLeadNote(leadId: string, content: string, type: 'general' | 'call' | 'meeting' | 'email' | 'whatsapp', isPrivate = false): Promise<void> {
    await this.request(`/agents/leads/${leadId}/notes`, {
      method: 'POST',
      body: JSON.stringify({ content, type, isPrivate }),
    });
  }

  // Commissions
  async getCommissions(page = 1, pageSize = 20): Promise<{ commissions: Commission[]; total: number }> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });

    return this.request<{ commissions: Commission[]; total: number }>(`/agents/commissions?${params.toString()}`);
  }

  async getCommissionById(commissionId: string): Promise<Commission> {
    return this.request<Commission>(`/agents/commissions/${commissionId}`);
  }

  // Notifications
  async getNotifications(page = 1, pageSize = 20): Promise<{ notifications: AgentNotification[]; total: number }> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });

    return this.request<{ notifications: AgentNotification[]; total: number }>(`/agents/notifications?${params.toString()}`);
  }

  async markNotificationRead(notificationId: string): Promise<void> {
    await this.request(`/agents/notifications/${notificationId}/read`, {
      method: 'PATCH',
    });
  }

  async markAllNotificationsRead(): Promise<void> {
    await this.request('/agents/notifications/read-all', {
      method: 'PATCH',
    });
  }

  // Tasks
  async getTasks(page = 1, pageSize = 20): Promise<{ tasks: AgentTask[]; total: number }> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });

    return this.request<{ tasks: AgentTask[]; total: number }>(`/agents/tasks?${params.toString()}`);
  }

  async createTask(task: Omit<AgentTask, 'id' | 'agentId' | 'createdAt'>): Promise<AgentTask> {
    return this.request<AgentTask>('/agents/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  }

  async updateTask(taskId: string, updates: Partial<AgentTask>): Promise<AgentTask> {
    return this.request<AgentTask>(`/agents/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteTask(taskId: string): Promise<void> {
    await this.request(`/agents/tasks/${taskId}`, { method: 'DELETE' });
  }

  // WhatsApp
  async getWhatsAppTemplates(): Promise<WhatsAppTemplate[]> {
    return this.request<WhatsAppTemplate[]>('/agents/whatsapp/templates');
  }

  async sendWhatsAppMessage(request: SendWhatsAppRequest): Promise<WhatsAppMessage> {
    return this.request<WhatsAppMessage>('/agents/whatsapp/send', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getWhatsAppMessages(leadId: string): Promise<WhatsAppMessage[]> {
    return this.request<WhatsAppMessage[]>(`/agents/whatsapp/messages/${leadId}`);
  }

  // Onboarding
  async getOnboardingStatus(): Promise<OnboardingStatus> {
    return this.request<OnboardingStatus>('/agents/onboarding');
  }

  async updateOnboardingStep(stepId: string, data: Record<string, any>): Promise<OnboardingStatus> {
    return this.request<OnboardingStatus>(`/agents/onboarding/steps/${stepId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async completeOnboardingStep(stepId: string): Promise<OnboardingStatus> {
    return this.request<OnboardingStatus>(`/agents/onboarding/steps/${stepId}/complete`, {
      method: 'POST',
    });
  }

  // Analytics
  async getPerformanceMetrics(period: 'week' | 'month' | 'quarter' | 'year' = 'month'): Promise<any> {
    return this.request(`/agents/analytics/performance?period=${period}`);
  }

  async getLeaderboard(): Promise<any> {
    return this.request('/agents/analytics/leaderboard');
  }

  // WebSocket Connection
  connect(onMessage?: (data: any) => void): void {
    if (!this.token) {
      console.warn('Cannot establish WebSocket connection: No authentication token');
      return;
    }

    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      this.ws = new WebSocket(`${this.wsUrl}?token=${this.token}`);

      this.ws.onopen = () => {
        console.log('WebSocket connection established');
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage?.(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket connection closed:', event.code, event.reason);
        // Attempt to reconnect after 5 seconds
        setTimeout(() => this.connect(onMessage), 5000);
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to establish WebSocket connection:', error);
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(data: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket is not connected');
    }
  }
}

export const agentApi = new AgentApiService();