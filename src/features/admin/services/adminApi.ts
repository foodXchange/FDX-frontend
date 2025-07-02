// src/features/admin/services/adminApi.ts
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export interface AdminHealthData {
  status: string;
  uptime: number;
  responseTime: number;
  memoryUsage: number;
  activeConnections: number;
  timestamp: string;
}

export interface AdminStats {
  totalUsers: number;
  totalRFQs: number;
  totalSuppliers: number;
  totalOrders: number;
  systemLoad: number;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  company?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

export interface AdminSystemLog {
  id: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
  timestamp: string;
  userId?: string;
  metadata?: Record<string, any>;
}

class AdminAPIService {
  private apiUrl = `${API_BASE}/admin`;

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${this.apiUrl}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`Admin API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Health & System Monitoring
  async getSystemHealth(): Promise<AdminHealthData> {
    return this.request<AdminHealthData>('/health');
  }

  async getSystemStats(): Promise<AdminStats> {
    return this.request<AdminStats>('/stats');
  }

  async getSystemLogs(params?: {
    level?: string;
    limit?: number;
    offset?: number;
  }): Promise<AdminSystemLog[]> {
    const queryString = params ? new URLSearchParams(params as any).toString() : '';
    return this.request<AdminSystemLog[]>(`/logs?${queryString}`);
  }

  // User Management
  async getAllUsers(params?: {
    search?: string;
    role?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{
    users: AdminUser[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const queryString = params ? new URLSearchParams(params as any).toString() : '';
    return this.request(`/users?${queryString}`);
  }

  async getUserById(userId: string): Promise<AdminUser> {
    return this.request<AdminUser>(`/users/${userId}`);
  }

  async updateUser(userId: string, userData: Partial<AdminUser>): Promise<AdminUser> {
    return this.request<AdminUser>(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deactivateUser(userId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/users/${userId}/deactivate`, {
      method: 'POST',
    });
  }

  async activateUser(userId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/users/${userId}/activate`, {
      method: 'POST',
    });
  }

  // System Operations
  async clearCache(): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>('/cache/clear', {
      method: 'POST',
    });
  }

  async backupDatabase(): Promise<{ success: boolean; backupId: string }> {
    return this.request<{ success: boolean; backupId: string }>('/backup', {
      method: 'POST',
    });
  }

  async restartSystem(): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>('/restart', {
      method: 'POST',
    });
  }

  // Analytics
  async getAnalytics(params?: {
    startDate?: string;
    endDate?: string;
    metric?: string;
  }): Promise<{
    metrics: Array<{
      date: string;
      value: number;
      metric: string;
    }>;
  }> {
    const queryString = params ? new URLSearchParams(params as any).toString() : '';
    return this.request(`/analytics?${queryString}`);
  }

  // Compliance & Audit
  async getAuditLogs(params?: {
    userId?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<Array<{
    id: string;
    userId: string;
    action: string;
    resource: string;
    timestamp: string;
    metadata?: Record<string, any>;
  }>> {
    const queryString = params ? new URLSearchParams(params as any).toString() : '';
    return this.request(`/audit?${queryString}`);
  }

  // Configuration
  async getSystemConfig(): Promise<Record<string, any>> {
    return this.request<Record<string, any>>('/config');
  }

  async updateSystemConfig(config: Record<string, any>): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>('/config', {
      method: 'PUT',
      body: JSON.stringify(config),
    });
  }
}

export const adminApi = new AdminAPIService();
export default adminApi;