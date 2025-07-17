import { QueryClient } from '@tanstack/react-query';
import { toast } from 'notistack';

// Default options for React Query
const defaultOptions = {
  queries: {
    // Cache data for 5 minutes
    staleTime: 5 * 60 * 1000,
    // Keep cache for 10 minutes
    gcTime: 10 * 60 * 1000,
    // Retry failed requests 2 times
    retry: 2,
    // Retry delay doubles each time (exponential backoff)
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
    // Don't refetch on window focus in production
    refetchOnWindowFocus: process.env.NODE_ENV === 'development',
    // Don't refetch on reconnect
    refetchOnReconnect: 'always',
  },
  mutations: {
    // Retry mutations once
    retry: 1,
    // Show error messages
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'An error occurred';
      toast.error(message);
    },
  },
};

// Create the query client
export const queryClient = new QueryClient({
  defaultOptions,
});

// Query key factory for consistent key generation
export const queryKeys = {
  // RFQ keys
  rfq: {
    all: ['rfq'] as const,
    lists: () => [...queryKeys.rfq.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.rfq.lists(), filters] as const,
    details: () => [...queryKeys.rfq.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.rfq.details(), id] as const,
  },
  
  // Order keys
  orders: {
    all: ['orders'] as const,
    lists: () => [...queryKeys.orders.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.orders.lists(), filters] as const,
    details: () => [...queryKeys.orders.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.orders.details(), id] as const,
    tracking: (id: string) => [...queryKeys.orders.detail(id), 'tracking'] as const,
  },
  
  // Lead keys
  leads: {
    all: ['leads'] as const,
    lists: () => [...queryKeys.leads.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.leads.lists(), filters] as const,
    details: () => [...queryKeys.leads.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.leads.details(), id] as const,
    activities: (id: string) => [...queryKeys.leads.detail(id), 'activities'] as const,
  },
  
  // Analytics keys
  analytics: {
    all: ['analytics'] as const,
    dashboard: () => [...queryKeys.analytics.all, 'dashboard'] as const,
    metrics: (type: string) => [...queryKeys.analytics.all, 'metrics', type] as const,
    reports: () => [...queryKeys.analytics.all, 'reports'] as const,
    report: (id: string) => [...queryKeys.analytics.reports(), id] as const,
  },
  
  // User keys
  user: {
    all: ['user'] as const,
    current: () => [...queryKeys.user.all, 'current'] as const,
    profile: (id: string) => [...queryKeys.user.all, 'profile', id] as const,
    preferences: () => [...queryKeys.user.all, 'preferences'] as const,
  },
};

// Prefetch helper
export const prefetchQuery = async (
  key: readonly unknown[],
  fetcher: () => Promise<any>,
  staleTime?: number
) => {
  await queryClient.prefetchQuery({
    queryKey: key,
    queryFn: fetcher,
    staleTime: staleTime || 5 * 60 * 1000,
  });
};

// Invalidation helpers
export const invalidateQueries = (key: readonly unknown[]) => {
  return queryClient.invalidateQueries({ queryKey: key });
};

export const invalidateAndRefetch = async (key: readonly unknown[]) => {
  await queryClient.invalidateQueries({ queryKey: key });
  return queryClient.refetchQueries({ queryKey: key });
};

// Optimistic update helper
export const optimisticUpdate = <T>(
  key: readonly unknown[],
  updater: (old: T) => T
) => {
  const previousData = queryClient.getQueryData<T>(key);
  
  if (previousData) {
    queryClient.setQueryData(key, updater(previousData));
  }
  
  return previousData;
};

// Mutation helpers
export const createOptimisticMutation = <TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: {
    onMutate?: (variables: TVariables) => Promise<any> | any;
    onSuccess?: (data: TData, variables: TVariables) => Promise<any> | any;
    onError?: (error: any, variables: TVariables, context: any) => Promise<any> | any;
    invalidateKeys?: readonly unknown[][];
  }
) => ({
  mutationFn,
  onMutate: options.onMutate,
  onSuccess: async (data: TData, variables: TVariables) => {
    // Invalidate related queries
    if (options.invalidateKeys) {
      await Promise.all(
        options.invalidateKeys.map(key => invalidateQueries(key))
      );
    }
    
    // Call custom onSuccess
    if (options.onSuccess) {
      await options.onSuccess(data, variables);
    }
  },
  onError: options.onError,
});

// Infinite query helper
export const getNextPageParam = (
  lastPage: { data: any[]; hasMore: boolean; nextCursor?: string },
  pages: any[]
) => {
  return lastPage.hasMore ? lastPage.nextCursor || pages.length : undefined;
};