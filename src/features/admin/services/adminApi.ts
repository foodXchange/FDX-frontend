import { SystemHealth, UsageStats, AIUsage, UserActivity, SecurityAlert, ResourceMetrics } from '../types';

class AdminApiService {
  private apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(${this.apiUrl}, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: Bearer  }),
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(Admin API Error: );
    }

    return response.json();
  }

  // System Health
  async getSystemHealth(): Promise<SystemHealth> {
    return this.request('/admin/health');
  }

  // Usage Statistics
  async getUsageStats(): Promise<UsageStats> {
    return this.request('/admin/usage');
  }

  // AI Usage & Costs
  async getAIUsage(): Promise<AIUsage> {
    return this.request('/admin/ai-usage');
  }

  // User Activity
  async getUserActivity(): Promise<UserActivity[]> {
    return this.request('/admin/users/activity');
  }

  // Security Alerts
  async getSecurityAlerts(): Promise<SecurityAlert[]> {
    return this.request('/admin/security/alerts');
  }

  // Compliance Status
  async getComplianceStatus(): Promise<any> {
    return this.request('/admin/compliance');
  }

  // Resource Metrics
  async getResourceMetrics(): Promise<ResourceMetrics> {
    return this.request('/admin/resources');
  }

  // Analytics Data
  async getAnalytics(): Promise<any> {
    return this.request('/admin/analytics');
  }

  // Generate Reports
  async generateReport(type: string, params: any): Promise<any> {
    return this.request('/admin/reports', {
      method: 'POST',
      body: JSON.stringify({ type, params }),
    });
  }

  // Real-time Alerts
  async getAlerts(): Promise<any[]> {
    return this.request('/admin/alerts');
  }
}

export const adminApi = new AdminApiService();
export default adminApi;
