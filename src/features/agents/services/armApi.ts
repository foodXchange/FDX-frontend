import React from 'react';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  Lead, 
  LeadStatus, 
  LeadActivity, 
  LeadNote, 
  Agent, 
  AgentNotification, 
  AgentTask, 
  WhatsAppMessage, 
  WhatsAppTemplate,
  LeadSearchFilters,
  LeadSearchResult,
  AgentDashboardData,
  CreateLeadRequest,
  UpdateLeadRequest,
  SendWhatsAppRequest
} from '../types';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
const API_TIMEOUT = 10000;

// Create axios instance with default config
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor for auth token
  client.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor for error handling
  client.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Handle token expiration
        localStorage.removeItem('authToken');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  return client;
};

class ARMApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = createApiClient();
  }

  // Agent APIs
  async getCurrentAgent(): Promise<Agent> {
    const response = await this.client.get<Agent>('/agents/me');
    return response.data;
  }

  async updateAgent(agentId: string, updates: Partial<Agent>): Promise<Agent> {
    const response = await this.client.patch<Agent>(`/agents/${agentId}`, updates);
    return response.data;
  }

  async getDashboardData(): Promise<AgentDashboardData> {
    const response = await this.client.get<AgentDashboardData>('/agents/dashboard');
    return response.data;
  }

  // Lead APIs
  async getLeads(filters?: LeadSearchFilters): Promise<LeadSearchResult> {
    const params = new URLSearchParams();
    
    if (filters?.status?.length) {
      params.append('status', filters.status.join(','));
    }
    if (filters?.priority?.length) {
      params.append('priority', filters.priority.join(','));
    }
    if (filters?.source?.length) {
      params.append('source', filters.source.join(','));
    }
    if (filters?.businessType?.length) {
      params.append('businessType', filters.businessType.join(','));
    }
    if (filters?.assignedAgentId) {
      params.append('assignedAgentId', filters.assignedAgentId);
    }
    if (filters?.location) {
      params.append('location', filters.location);
    }
    if (filters?.search) {
      params.append('search', filters.search);
    }
    if (filters?.dateRange) {
      params.append('startDate', filters.dateRange.startDate);
      params.append('endDate', filters.dateRange.endDate);
    }
    if (filters?.estimatedRevenue) {
      params.append('minRevenue', filters.estimatedRevenue.min.toString());
      params.append('maxRevenue', filters.estimatedRevenue.max.toString());
    }

    const response = await this.client.get<LeadSearchResult>(`/leads?${params}`);
    return response.data;
  }

  async getLeadById(leadId: string): Promise<Lead> {
    const response = await this.client.get<Lead>(`/leads/${leadId}`);
    return response.data;
  }

  async createLead(leadData: CreateLeadRequest): Promise<Lead> {
    const response = await this.client.post<Lead>('/leads', leadData);
    return response.data;
  }

  async updateLead(leadId: string, updates: UpdateLeadRequest): Promise<Lead> {
    const response = await this.client.patch<Lead>(`/leads/${leadId}`, updates);
    return response.data;
  }

  async updateLeadStatus(leadId: string, status: LeadStatus): Promise<Lead> {
    const response = await this.client.patch<Lead>(`/leads/${leadId}/status`, { status });
    return response.data;
  }

  async deleteLead(leadId: string): Promise<void> {
    await this.client.delete(`/leads/${leadId}`);
  }

  async batchUpdateLeads(updates: Array<{ id: string; changes: Partial<Lead> }>): Promise<Lead[]> {
    const response = await this.client.patch<Lead[]>('/leads/batch', { updates });
    return response.data;
  }

  // Lead Activities APIs
  async getLeadActivities(leadId: string): Promise<LeadActivity[]> {
    const response = await this.client.get<LeadActivity[]>(`/leads/${leadId}/activities`);
    return response.data;
  }

  async createLeadActivity(leadId: string, activity: Omit<LeadActivity, 'id' | 'createdAt'>): Promise<LeadActivity> {
    const response = await this.client.post<LeadActivity>(`/leads/${leadId}/activities`, activity);
    return response.data;
  }

  async updateLeadActivity(leadId: string, activityId: string, updates: Partial<LeadActivity>): Promise<LeadActivity> {
    const response = await this.client.patch<LeadActivity>(`/leads/${leadId}/activities/${activityId}`, updates);
    return response.data;
  }

  async deleteLeadActivity(leadId: string, activityId: string): Promise<void> {
    await this.client.delete(`/leads/${leadId}/activities/${activityId}`);
  }

  // Lead Notes APIs
  async getLeadNotes(leadId: string): Promise<LeadNote[]> {
    const response = await this.client.get<LeadNote[]>(`/leads/${leadId}/notes`);
    return response.data;
  }

  async createLeadNote(leadId: string, note: Omit<LeadNote, 'id' | 'createdAt'>): Promise<LeadNote> {
    const response = await this.client.post<LeadNote>(`/leads/${leadId}/notes`, note);
    return response.data;
  }

  async updateLeadNote(leadId: string, noteId: string, updates: Partial<LeadNote>): Promise<LeadNote> {
    const response = await this.client.patch<LeadNote>(`/leads/${leadId}/notes/${noteId}`, updates);
    return response.data;
  }

  async deleteLeadNote(leadId: string, noteId: string): Promise<void> {
    await this.client.delete(`/leads/${leadId}/notes/${noteId}`);
  }

  // Notifications APIs
  async getNotifications(): Promise<AgentNotification[]> {
    const response = await this.client.get<AgentNotification[]>('/notifications');
    return response.data;
  }

  async markNotificationRead(notificationId: string): Promise<void> {
    await this.client.patch(`/notifications/${notificationId}/read`);
  }

  async batchMarkNotificationsRead(notificationIds: string[]): Promise<void> {
    await this.client.patch('/notifications/batch-read', { notificationIds });
  }

  async deleteNotification(notificationId: string): Promise<void> {
    await this.client.delete(`/notifications/${notificationId}`);
  }

  // Tasks APIs
  async getTasks(): Promise<AgentTask[]> {
    const response = await this.client.get<AgentTask[]>('/tasks');
    return response.data;
  }

  async createTask(task: Omit<AgentTask, 'id' | 'createdAt'>): Promise<AgentTask> {
    const response = await this.client.post<AgentTask>('/tasks', task);
    return response.data;
  }

  async updateTask(taskId: string, updates: Partial<AgentTask>): Promise<AgentTask> {
    const response = await this.client.patch<AgentTask>(`/tasks/${taskId}`, updates);
    return response.data;
  }

  async deleteTask(taskId: string): Promise<void> {
    await this.client.delete(`/tasks/${taskId}`);
  }

  // WhatsApp APIs
  async getWhatsAppMessages(leadId: string): Promise<WhatsAppMessage[]> {
    const response = await this.client.get<WhatsAppMessage[]>(`/whatsapp/messages/${leadId}`);
    return response.data;
  }

  async sendWhatsAppMessage(request: SendWhatsAppRequest): Promise<WhatsAppMessage> {
    const response = await this.client.post<WhatsAppMessage>('/whatsapp/send', request);
    return response.data;
  }

  async scheduleWhatsAppMessage(
    request: SendWhatsAppRequest & { scheduledAt: string }
  ): Promise<WhatsAppMessage> {
    const response = await this.client.post<WhatsAppMessage>('/whatsapp/schedule', request);
    return response.data;
  }

  async getWhatsAppTemplates(): Promise<WhatsAppTemplate[]> {
    const response = await this.client.get<WhatsAppTemplate[]>('/whatsapp/templates');
    return response.data;
  }

  // Communication APIs
  async sendEmail(leadId: string, subject: string, content: string): Promise<void> {
    await this.client.post('/communication/email', {
      leadId,
      subject,
      content,
    });
  }

  async sendSMS(leadId: string, content: string): Promise<void> {
    await this.client.post('/communication/sms', {
      leadId,
      content,
    });
  }

  async scheduleEmail(
    leadId: string,
    subject: string,
    content: string,
    scheduledAt: string
  ): Promise<void> {
    await this.client.post('/communication/email/schedule', {
      leadId,
      subject,
      content,
      scheduledAt,
    });
  }

  async scheduleSMS(
    leadId: string,
    content: string,
    scheduledAt: string
  ): Promise<void> {
    await this.client.post('/communication/sms/schedule', {
      leadId,
      content,
      scheduledAt,
    });
  }

  // Analytics APIs
  async getAnalytics(period: 'day' | 'week' | 'month' | 'quarter' | 'year'): Promise<any> {
    const response = await this.client.get(`/analytics?period=${period}`);
    return response.data;
  }

  async getLeadConversionMetrics(): Promise<any> {
    const response = await this.client.get('/analytics/conversion');
    return response.data;
  }

  async getPerformanceMetrics(): Promise<any> {
    const response = await this.client.get('/analytics/performance');
    return response.data;
  }

  // Export APIs
  async exportLeads(format: 'csv' | 'excel', filters?: LeadSearchFilters): Promise<Blob> {
    const params = new URLSearchParams();
    params.append('format', format);
    
    if (filters) {
      if (filters.status?.length) params.append('status', filters.status.join(','));
      if (filters.priority?.length) params.append('priority', filters.priority.join(','));
      if (filters.dateRange) {
        params.append('startDate', filters.dateRange.startDate);
        params.append('endDate', filters.dateRange.endDate);
      }
    }

    const response = await this.client.get(`/leads/export?${params}`, {
      responseType: 'blob',
    });
    
    return response.data;
  }

  async importLeads(file: File): Promise<{ success: number; errors: any[] }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.client.post('/leads/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await this.client.get('/health');
    return response.data;
  }
}

// Create and export singleton instance
export const armApiService = new ARMApiService();

// Export error types for better error handling
export class ARMApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ARMApiError';
  }
}

// Utility function to handle API errors
export const handleApiError = (error: any): ARMApiError => {
  if (error.response) {
    return new ARMApiError(
      error.response.data?.message || 'API Error',
      error.response.status,
      error.response.data
    );
  } else if (error.request) {
    return new ARMApiError('Network Error', 0);
  } else {
    return new ARMApiError(error.message || 'Unknown Error', 0);
  }
};