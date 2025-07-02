// src/features/admin/hooks/useAdminData.ts
import { useState, useEffect } from 'react';
import { 
  adminApi, 
  SystemHealth, 
  UsageStats, 
  AIUsageData, 
  UserActivity, 
  SecurityAlert 
} from '../../../services/api/admin';

interface AdminData {
  health: SystemHealth | null;
  usage: UsageStats | null;
  aiUsage: AIUsageData | null;
  users: UserActivity[] | null;
  alerts: SecurityAlert[] | null;
}

export const useAdminData = () => {
  const [data, setData] = useState<AdminData>({
    health: null,
    usage: null,
    aiUsage: null,
    users: null,
    alerts: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        setError(null);

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
          alerts
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch admin data');
        console.error('Admin data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const refetch = () => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        setError(null);

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
          alerts
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch admin data');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  };

  return {
    ...data,
    loading,
    error,
    refetch
  };
};