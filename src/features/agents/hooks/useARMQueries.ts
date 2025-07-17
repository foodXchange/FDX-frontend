import React from 'react';
import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
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
import { armApiService, handleApiError } from '../services/armApi';

// Query Keys
export const ARM_QUERY_KEYS = {
  agent: ['agent'],
  dashboard: ['dashboard'],
  leads: ['leads'],
  leadById: (id: string) => ['leads', id],
  leadActivities: (leadId: string) => ['leads', leadId, 'activities'],
  leadNotes: (leadId: string) => ['leads', leadId, 'notes'],
  notifications: ['notifications'],
  tasks: ['tasks'],
  whatsappMessages: (leadId: string) => ['whatsapp', 'messages', leadId],
  whatsappTemplates: ['whatsapp', 'templates'],
  analytics: (period: string) => ['analytics', period],
} as const;

// Agent Queries
export const useCurrentAgent = (options?: UseQueryOptions<Agent>) => {
  return useQuery({
    queryKey: ARM_QUERY_KEYS.agent,
    queryFn: armApiService.getCurrentAgent,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

export const useDashboardData = (options?: UseQueryOptions<AgentDashboardData>) => {
  return useQuery({
    queryKey: ARM_QUERY_KEYS.dashboard,
    queryFn: armApiService.getDashboardData,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
    ...options,
  });
};

// Lead Queries
export const useLeads = (filters?: LeadSearchFilters, options?: UseQueryOptions<LeadSearchResult>) => {
  return useQuery({
    queryKey: [...ARM_QUERY_KEYS.leads, filters],
    queryFn: () => armApiService.getLeads(filters),
    staleTime: 1 * 60 * 1000, // 1 minute
    placeholderData: (previousData) => previousData,
    ...options,
  });
};

export const useLeadById = (leadId: string, options?: UseQueryOptions<Lead>) => {
  return useQuery({
    queryKey: ARM_QUERY_KEYS.leadById(leadId),
    queryFn: () => armApiService.getLeadById(leadId),
    enabled: !!leadId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
};

export const useLeadActivities = (leadId: string, options?: UseQueryOptions<LeadActivity[]>) => {
  return useQuery({
    queryKey: ARM_QUERY_KEYS.leadActivities(leadId),
    queryFn: () => armApiService.getLeadActivities(leadId),
    enabled: !!leadId,
    staleTime: 1 * 60 * 1000, // 1 minute
    ...options,
  });
};

export const useLeadNotes = (leadId: string, options?: UseQueryOptions<LeadNote[]>) => {
  return useQuery({
    queryKey: ARM_QUERY_KEYS.leadNotes(leadId),
    queryFn: () => armApiService.getLeadNotes(leadId),
    enabled: !!leadId,
    staleTime: 1 * 60 * 1000, // 1 minute
    ...options,
  });
};

// Notification Queries
export const useNotifications = (options?: UseQueryOptions<AgentNotification[]>) => {
  return useQuery({
    queryKey: ARM_QUERY_KEYS.notifications,
    queryFn: armApiService.getNotifications,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 2 * 60 * 1000, // Refresh every 2 minutes
    ...options,
  });
};

// Task Queries
export const useTasks = (options?: UseQueryOptions<AgentTask[]>) => {
  return useQuery({
    queryKey: ARM_QUERY_KEYS.tasks,
    queryFn: armApiService.getTasks,
    staleTime: 1 * 60 * 1000, // 1 minute
    ...options,
  });
};

// WhatsApp Queries
export const useWhatsAppMessages = (leadId: string, options?: UseQueryOptions<WhatsAppMessage[]>) => {
  return useQuery({
    queryKey: ARM_QUERY_KEYS.whatsappMessages(leadId),
    queryFn: () => armApiService.getWhatsAppMessages(leadId),
    enabled: !!leadId,
    staleTime: 30 * 1000, // 30 seconds
    ...options,
  });
};

export const useWhatsAppTemplates = (options?: UseQueryOptions<WhatsAppTemplate[]>) => {
  return useQuery({
    queryKey: ARM_QUERY_KEYS.whatsappTemplates,
    queryFn: armApiService.getWhatsAppTemplates,
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

// Analytics Queries
export const useAnalytics = (period: 'day' | 'week' | 'month' | 'quarter' | 'year', options?: UseQueryOptions<any>) => {
  return useQuery({
    queryKey: ARM_QUERY_KEYS.analytics(period),
    queryFn: () => armApiService.getAnalytics(period),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

// Mutations
export const useUpdateAgent = (options?: UseMutationOptions<Agent, Error, { agentId: string; updates: Partial<Agent> }>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ agentId, updates }) => armApiService.updateAgent(agentId, updates),
    onSuccess: (data) => {
      queryClient.setQueryData(ARM_QUERY_KEYS.agent, data);
      queryClient.invalidateQueries({ queryKey: ARM_QUERY_KEYS.dashboard });
    },
    onError: handleApiError,
    ...options,
  });
};

export const useCreateLead = (options?: UseMutationOptions<Lead, Error, CreateLeadRequest>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: armApiService.createLead,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ARM_QUERY_KEYS.leads });
      queryClient.invalidateQueries({ queryKey: ARM_QUERY_KEYS.dashboard });
      queryClient.setQueryData(ARM_QUERY_KEYS.leadById(data.id), data);
    },
    onError: handleApiError,
    ...options,
  });
};

export const useUpdateLead = (options?: UseMutationOptions<Lead, Error, { leadId: string; updates: UpdateLeadRequest }>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ leadId, updates }) => armApiService.updateLead(leadId, updates),
    onSuccess: (data) => {
      queryClient.setQueryData(ARM_QUERY_KEYS.leadById(data.id), data);
      queryClient.invalidateQueries({ queryKey: ARM_QUERY_KEYS.leads });
      queryClient.invalidateQueries({ queryKey: ARM_QUERY_KEYS.dashboard });
    },
    onError: handleApiError,
    ...options,
  });
};

export const useUpdateLeadStatus = (options?: UseMutationOptions<Lead, Error, { leadId: string; status: LeadStatus }>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ leadId, status }) => armApiService.updateLeadStatus(leadId, status),
    onSuccess: (data) => {
      queryClient.setQueryData(ARM_QUERY_KEYS.leadById(data.id), data);
      queryClient.invalidateQueries({ queryKey: ARM_QUERY_KEYS.leads });
      queryClient.invalidateQueries({ queryKey: ARM_QUERY_KEYS.dashboard });
    },
    onError: handleApiError,
    ...options,
  });
};

export const useDeleteLead = (options?: UseMutationOptions<void, Error, string>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: armApiService.deleteLead,
    onSuccess: (_, leadId) => {
      queryClient.removeQueries({ queryKey: ARM_QUERY_KEYS.leadById(leadId) });
      queryClient.invalidateQueries({ queryKey: ARM_QUERY_KEYS.leads });
      queryClient.invalidateQueries({ queryKey: ARM_QUERY_KEYS.dashboard });
    },
    onError: handleApiError,
    ...options,
  });
};

export const useCreateLeadActivity = (options?: UseMutationOptions<LeadActivity, Error, { leadId: string; activity: Omit<LeadActivity, 'id' | 'createdAt'> }>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ leadId, activity }) => armApiService.createLeadActivity(leadId, activity),
    onSuccess: (_, { leadId }) => {
      queryClient.invalidateQueries({ queryKey: ARM_QUERY_KEYS.leadActivities(leadId) });
      queryClient.invalidateQueries({ queryKey: ARM_QUERY_KEYS.leadById(leadId) });
    },
    onError: handleApiError,
    ...options,
  });
};

export const useCreateLeadNote = (options?: UseMutationOptions<LeadNote, Error, { leadId: string; note: Omit<LeadNote, 'id' | 'createdAt'> }>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ leadId, note }) => armApiService.createLeadNote(leadId, note),
    onSuccess: (_, { leadId }) => {
      queryClient.invalidateQueries({ queryKey: ARM_QUERY_KEYS.leadNotes(leadId) });
      queryClient.invalidateQueries({ queryKey: ARM_QUERY_KEYS.leadById(leadId) });
    },
    onError: handleApiError,
    ...options,
  });
};

export const useMarkNotificationRead = (options?: UseMutationOptions<void, Error, string>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: armApiService.markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ARM_QUERY_KEYS.notifications });
    },
    onError: handleApiError,
    ...options,
  });
};

export const useBatchMarkNotificationsRead = (options?: UseMutationOptions<void, Error, string[]>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: armApiService.batchMarkNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ARM_QUERY_KEYS.notifications });
    },
    onError: handleApiError,
    ...options,
  });
};

export const useCreateTask = (options?: UseMutationOptions<AgentTask, Error, Omit<AgentTask, 'id' | 'createdAt'>>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: armApiService.createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ARM_QUERY_KEYS.tasks });
    },
    onError: handleApiError,
    ...options,
  });
};

export const useUpdateTask = (options?: UseMutationOptions<AgentTask, Error, { taskId: string; updates: Partial<AgentTask> }>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ taskId, updates }) => armApiService.updateTask(taskId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ARM_QUERY_KEYS.tasks });
    },
    onError: handleApiError,
    ...options,
  });
};

export const useSendWhatsAppMessage = (options?: UseMutationOptions<WhatsAppMessage, Error, SendWhatsAppRequest>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: armApiService.sendWhatsAppMessage,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ARM_QUERY_KEYS.whatsappMessages(data.leadId) });
      queryClient.invalidateQueries({ queryKey: ARM_QUERY_KEYS.leadById(data.leadId) });
    },
    onError: handleApiError,
    ...options,
  });
};

export const useSendEmail = (options?: UseMutationOptions<void, Error, { leadId: string; subject: string; content: string }>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ leadId, subject, content }) => armApiService.sendEmail(leadId, subject, content),
    onSuccess: (_, { leadId }) => {
      queryClient.invalidateQueries({ queryKey: ARM_QUERY_KEYS.leadById(leadId) });
    },
    onError: handleApiError,
    ...options,
  });
};

export const useSendSMS = (options?: UseMutationOptions<void, Error, { leadId: string; content: string }>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ leadId, content }) => armApiService.sendSMS(leadId, content),
    onSuccess: (_, { leadId }) => {
      queryClient.invalidateQueries({ queryKey: ARM_QUERY_KEYS.leadById(leadId) });
    },
    onError: handleApiError,
    ...options,
  });
};

export const useExportLeads = (options?: UseMutationOptions<Blob, Error, { format: 'csv' | 'excel'; filters?: LeadSearchFilters }>) => {
  return useMutation({
    mutationFn: ({ format, filters }) => armApiService.exportLeads(format, filters),
    onError: handleApiError,
    ...options,
  });
};

export const useImportLeads = (options?: UseMutationOptions<{ success: number; errors: any[] }, Error, File>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: armApiService.importLeads,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ARM_QUERY_KEYS.leads });
      queryClient.invalidateQueries({ queryKey: ARM_QUERY_KEYS.dashboard });
    },
    onError: handleApiError,
    ...options,
  });
};

// Custom hook for optimistic updates
export const useOptimisticLeadUpdate = () => {
  const queryClient = useQueryClient();
  
  return {
    optimisticUpdateLead: (leadId: string, updates: Partial<Lead>) => {
      queryClient.setQueryData(ARM_QUERY_KEYS.leadById(leadId), (old: Lead | undefined) => {
        if (!old) return old;
        return { ...old, ...updates };
      });
    },
    
    revertOptimisticUpdate: (leadId: string) => {
      queryClient.invalidateQueries({ queryKey: ARM_QUERY_KEYS.leadById(leadId) });
    },
  };
};

// Prefetch utilities
export const usePrefetchLead = () => {
  const queryClient = useQueryClient();
  
  return (leadId: string) => {
    queryClient.prefetchQuery({
      queryKey: ARM_QUERY_KEYS.leadById(leadId),
      queryFn: () => armApiService.getLeadById(leadId),
      staleTime: 2 * 60 * 1000,
    });
  };
};

export const usePrefetchLeadActivities = () => {
  const queryClient = useQueryClient();
  
  return (leadId: string) => {
    queryClient.prefetchQuery({
      queryKey: ARM_QUERY_KEYS.leadActivities(leadId),
      queryFn: () => armApiService.getLeadActivities(leadId),
      staleTime: 1 * 60 * 1000,
    });
  };
};