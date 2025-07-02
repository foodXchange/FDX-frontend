// src/services/api/admin.ts
import { api } from './index';

export interface SystemHealth {
  status: string;
  uptime: number;
  responseTime: number;
  memoryUsage: number;
  activeConnections: number;
  dbStatus: string;
  apis: {
    name: string;
    status: string;
    responseTime: number;
  }[];
}

export interface UsageStats {
  totalRequests: number;
  activeUsers: number;
  rfqsCreated: number;
  ordersProcessed: number;
}

export interface AIUsageData {
  totalQueries: number;
  successRate: number;
  averageResponseTime: number;
  topFeatures: string[];
}

export interface UserActivity {
  userId: string;
  email: string;
  lastLogin: string;
  actionsToday: number;
}

export interface SecurityAlert {
  id: string;
  type: 'login_attempt' | 'data_breach' | 'suspicious_activity';
  message: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
}

class AdminAPIService {
  async getSystemHealth(): Promise<SystemHealth> {
    // Mock data - replace with real API call
    return {
      status: 'healthy',
      uptime: 12345,
      responseTime: 45,
      memoryUsage: 68,
      activeConnections: 150,
      dbStatus: 'connected',
      apis: [
        { name: 'Auth API', status: 'healthy', responseTime: 12 },
        { name: 'RFQ API', status: 'healthy', responseTime: 25 },
        { name: 'Products API', status: 'healthy', responseTime: 18 }
      ]
    };
  }

  async getUsageStats(): Promise<UsageStats> {
    // Mock data - replace with real API call
    return {
      totalRequests: 15420,
      activeUsers: 89,
      rfqsCreated: 247,
      ordersProcessed: 156
    };
  }

  async getAIUsage(): Promise<AIUsageData> {
    // Mock data - replace with real API call
    return {
      totalQueries: 1250,
      successRate: 94.5,
      averageResponseTime: 850,
      topFeatures: [
        'Supplier Matching',
        'Price Prediction',
        'Quality Analysis',
        'Risk Assessment'
      ]
    };
  }

  async getUserActivity(): Promise<UserActivity[]> {
    // Mock data - replace with real API call
    return [
      {
        userId: '1',
        email: 'supplier@foodco.com',
        lastLogin: '2025-07-02T08:30:00Z',
        actionsToday: 15
      },
      {
        userId: '2',
        email: 'buyer@retailchain.com',
        lastLogin: '2025-07-02T07:45:00Z',
        actionsToday: 8
      }
    ];
  }

  async getSecurityAlerts(): Promise<SecurityAlert[]> {
    // Mock data - replace with real API call
    return [
      {
        id: '1',
        type: 'login_attempt',
        message: 'Multiple failed login attempts from IP 192.168.1.100',
        timestamp: '2025-07-02T09:15:00Z',
        severity: 'medium'
      },
      {
        id: '2',
        type: 'suspicious_activity',
        message: 'Unusual API usage pattern detected',
        timestamp: '2025-07-02T08:30:00Z',
        severity: 'low'
      }
    ];
  }
}

export const adminApi = new AdminAPIService();