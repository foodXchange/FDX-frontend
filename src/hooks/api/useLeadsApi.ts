import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys, optimisticUpdate } from '@/services/api/queryClient';
import { Lead, LeadActivity, LeadNote } from '@/features/agents/types';

// Mock API service (replace with actual API calls)
const leadsApi = {
  getLeads: async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockLeads;
  },
  
  getLead: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockLeads.find(lead => lead.id === id);
  },
  
  updateLead: async (id: string, data: Partial<Lead>) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return { ...mockLeads.find(l => l.id === id), ...data };
  },
  
  getActivities: async (leadId: string) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockActivities.filter(a => a.leadId === leadId);
  },
  
  addActivity: async (leadId: string, activity: Partial<LeadActivity>) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { ...activity, id: Date.now().toString(), leadId };
  },
};

// Fetch all leads
export const useLeads = (filters = {}) => {
  return useQuery({
    queryKey: queryKeys.leads.list(filters),
    queryFn: () => leadsApi.getLeads(),
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Fetch single lead
export const useLead = (id: string) => {
  return useQuery({
    queryKey: queryKeys.leads.detail(id),
    queryFn: () => leadsApi.getLead(id),
    enabled: !!id,
  });
};

// Fetch lead activities
export const useLeadActivities = (leadId: string) => {
  return useQuery({
    queryKey: queryKeys.leads.activities(leadId),
    queryFn: () => leadsApi.getActivities(leadId),
    enabled: !!leadId,
  });
};

// Update lead with optimistic updates
export const useUpdateLead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Lead> }) =>
      leadsApi.updateLead(id, data),
    
    onMutate: async ({ id, data }) => {
      // Cancel ongoing queries
      await queryClient.cancelQueries({ queryKey: queryKeys.leads.detail(id) });
      
      // Optimistically update the lead
      const previousLead = optimisticUpdate<Lead>(
        queryKeys.leads.detail(id),
        (old) => ({ ...old, ...data })
      );
      
      // Also update in the list
      queryClient.setQueriesData(
        { queryKey: queryKeys.leads.lists() },
        (old: Lead[] | undefined) => {
          if (!old) return old;
          return old.map(lead => lead.id === id ? { ...lead, ...data } : lead);
        }
      );
      
      return { previousLead };
    },
    
    onError: (err, { id }, context) => {
      // Rollback on error
      if (context?.previousLead) {
        queryClient.setQueryData(queryKeys.leads.detail(id), context.previousLead);
      }
    },
    
    onSettled: (data, error, { id }) => {
      // Always refetch after mutation
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.lists() });
    },
  });
};

// Add activity to lead
export const useAddLeadActivity = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ leadId, activity }: { leadId: string; activity: Partial<LeadActivity> }) =>
      leadsApi.addActivity(leadId, activity),
    
    onSuccess: (newActivity, { leadId }) => {
      // Update activities cache
      queryClient.setQueryData<LeadActivity[]>(
        queryKeys.leads.activities(leadId),
        (old = []) => [...old, newActivity as LeadActivity]
      );
      
      // Update lead's last contact date
      queryClient.setQueryData<Lead>(
        queryKeys.leads.detail(leadId),
        (old) => old ? { ...old, lastContact: new Date() } : old
      );
      
      // Invalidate lead list to update any aggregated data
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.lists() });
    },
  });
};

// Prefetch lead data
export const usePrefetchLead = () => {
  const queryClient = useQueryClient();
  
  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.leads.detail(id),
      queryFn: () => leadsApi.getLead(id),
    });
    
    queryClient.prefetchQuery({
      queryKey: queryKeys.leads.activities(id),
      queryFn: () => leadsApi.getActivities(id),
    });
  };
};

// Mock data (remove when connecting to real API)
const mockLeads: Lead[] = [
  {
    id: '1',
    company: 'ABC Corp',
    contactPerson: 'John Doe',
    email: 'john@abc.com',
    phone: '+1234567890',
    status: 'hot',
    dealValue: 50000,
    lastContact: new Date('2024-01-15'),
    nextFollowUp: new Date('2024-01-22'),
    source: 'Website',
    engagementScore: 85,
    tags: ['Enterprise', 'High-Value'],
    assignedAgent: 'agent1',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
  },
];

const mockActivities: LeadActivity[] = [
  {
    id: '1',
    leadId: '1',
    type: 'call',
    title: 'Initial Discovery Call',
    description: 'Discussed requirements and budget',
    date: new Date('2024-01-15'),
    duration: 30,
    outcome: 'positive',
    createdBy: 'agent1',
    createdAt: new Date('2024-01-15'),
  },
];