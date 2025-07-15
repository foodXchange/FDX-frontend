export interface Agent {
  id: string;
  userId: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  specializations: string[];
  territories: string[];
  rating: number;
  totalEarnings: number;
  monthlyEarnings: number;
  activeLeads: number;
  completedDeals: number;
  joinedDate: Date;
  status: 'active' | 'inactive' | 'suspended';
}

export interface Lead {
  id: string;
  rfqId: string;
  rfqTitle: string;
  buyerName: string;
  buyerLocation: string;
  category: string;
  estimatedValue: number;
  estimatedCommission: number;
  matchScore: number;
  status: 'available' | 'claimed' | 'contacted' | 'negotiating' | 'won' | 'lost';
  claimedBy?: string;
  claimedAt?: Date;
  expiresAt: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  notes?: string;
}

export interface Commission {
  id: string;
  agentId: string;
  orderId: string;
  rfqId: string;
  amount: number;
  percentage: number;
  status: 'pending' | 'approved' | 'paid' | 'disputed';
  createdAt: Date;
  paidAt?: Date;
  paymentMethod?: string;
}

export interface EarningsData {
  today: number;
  thisWeek: number;
  thisMonth: number;
  pending: number;
  lifetime: number;
  recentTransactions: Commission[];
}

export interface PerformanceMetrics {
  conversionRate: number;
  averageDealSize: number;
  responseTime: number;
  customerSatisfaction: number;
  rank: number;
  totalAgents: number;
}

export interface AgentNotification {
  id: string;
  type: 'new_lead' | 'lead_expiring' | 'commission_paid' | 'tier_upgrade';
  title: string;
  message: string;
  data?: any;
  createdAt: Date;
  read: boolean;
}