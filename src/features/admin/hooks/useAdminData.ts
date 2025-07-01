import { useState, useEffect } from 'react';
import adminApi from '../services/adminApi';
import { SystemHealth, UsageStats, AIUsage, UserActivity, SecurityAlert } from '../types';

interface AdminData {
  health: SystemHealth | null;
  usage: UsageStats | null;
  aiUsage: AIUsage | null;
  users: UserActivity[];
  alerts: SecurityAlert[];
  loading: boolean;
  error: string | null;
}

export const useAdminData = (refreshInterval: number = 30000) => {
  const [data, setData] = useState<AdminData>({
    health: null,
    usage: null,
    aiUsage: null,
    users: [],
    alerts: [],
    loading: true,
    error: null,
  });

  const fetchData = async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }));
      
      const [health, usage, aiUsage, users, alerts] = await Promise.all([
        adminApi.getSystemHealth(),
        adminApi.getUsageStats(),
        adminApi.getAIUsage(),
        adminApi.getUserActivity(),
        adminApi.getSecurityAlerts(),
      ]);

      setData({
        health,
        usage,
        aiUsage,
        users,
        alerts,
        loading: false,
        error: null,
      });
    } catch (error) {
      setData(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch admin data',
      }));
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  return { ...data, refresh: fetchData };
};
