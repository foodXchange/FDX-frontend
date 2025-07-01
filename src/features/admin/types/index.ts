// Admin System Types
export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  responseTime: number;
  dbStatus: boolean;
  apis: {
    endpoint: string;
    status: number;
    latency: number;
  }[];
}

export interface UsageStats {
  activeUsers: number;
  dailyRfqs: number;
  totalRevenue: number;
  avgSessionTime: number;
  topFeatures: {
    name: string;
    usage: number;
  }[];
}

export interface AIUsage {
  openaiCosts: number;
  azureCosts: number;
  requestCount: number;
  tokenUsage: number;
  errors: number;
  rateLimits: {
    limit: number;
    used: number;
  }[];
}

export interface UserActivity {
  userId: string;
  email: string;
  lastActive: Date;
  actions: number;
  role: string;
  complianceScore: number;
}

export interface SecurityAlert {
  id: string;
  type: 'login_failed' | 'suspicious_activity' | 'compliance_violation';
  severity: 'low' | 'medium' | 'high';
  timestamp: Date;
  details: string;
}

export interface ResourceMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
}
