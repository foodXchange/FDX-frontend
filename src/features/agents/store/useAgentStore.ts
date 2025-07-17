import React from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { 
  Agent, 
  AgentDashboardData, 
  Lead, 
  LeadSearchFilters, 
  AgentNotification, 
  AgentTask, 
  WhatsAppMessage, 
  AgentStore 
} from '../types';

const initialFilters: LeadSearchFilters = {
  status: undefined,
  priority: undefined,
  source: undefined,
  businessType: undefined,
  assignedAgentId: undefined,
  location: undefined,
  dateRange: undefined,
  search: undefined,
};

export const useAgentStore = create<AgentStore>()(
  persist(
    (set) => ({
      // Agent data
      currentAgent: null,
      isAuthenticated: false,
      isLoading: false,
      
      // Dashboard data
      dashboardData: null,
      
      // Leads
      leads: [],
      leadFilters: initialFilters,
      leadLoading: false,
      selectedLead: null,
      
      // Notifications
      notifications: [],
      unreadCount: 0,
      
      // Tasks
      tasks: [],
      
      // WhatsApp
      whatsappMessages: [],
      whatsappTemplates: [],
      
      // Real-time updates
      isOnline: navigator.onLine,
      lastSyncAt: null,
      
      // Actions
      setAgent: (agent: Agent) => {
        set({ 
          currentAgent: agent, 
          isAuthenticated: true,
          isLoading: false 
        });
      },

      setDashboardData: (data: AgentDashboardData) => {
        set({ dashboardData: data });
      },

      setLeads: (leads: Lead[]) => {
        set({ leads, leadLoading: false });
      },

      updateLead: (leadId: string, updates: Partial<Lead>) => {
        set((state) => ({
          leads: state.leads.map((lead) =>
            lead.id === leadId ? { ...lead, ...updates } : lead
          ),
          selectedLead: state.selectedLead?.id === leadId 
            ? { ...state.selectedLead, ...updates } 
            : state.selectedLead,
        }));
      },

      addLead: (lead: Lead) => {
        set((state) => ({
          leads: [lead, ...state.leads],
        }));
      },

      setLeadFilters: (filters: LeadSearchFilters) => {
        set({ leadFilters: filters });
      },

      setSelectedLead: (lead: Lead | null) => {
        set({ selectedLead: lead });
      },

      addNotification: (notification: AgentNotification) => {
        set((state) => ({
          notifications: [notification, ...state.notifications],
          unreadCount: notification.isRead ? state.unreadCount : state.unreadCount + 1,
        }));
      },

      markNotificationRead: (notificationId: string) => {
        set((state) => {
          const notification = state.notifications.find(n => n.id === notificationId);
          const wasUnread = notification && !notification.isRead;
          
          return {
            notifications: state.notifications.map((n) =>
              n.id === notificationId ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
            ),
            unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
          };
        });
      },

      addTask: (task: AgentTask) => {
        set((state) => ({
          tasks: [task, ...state.tasks],
        }));
      },

      updateTask: (taskId: string, updates: Partial<AgentTask>) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId ? { ...task, ...updates } : task
          ),
        }));
      },

      addWhatsAppMessage: (message: WhatsAppMessage) => {
        set((state) => ({
          whatsappMessages: [...state.whatsappMessages, message],
        }));
      },

      setOnlineStatus: (isOnline: boolean) => {
        set({ isOnline });
      },

      updateLastSync: () => {
        set({ lastSyncAt: new Date().toISOString() });
      },

      updateAgent: (updates: Partial<Agent>) => {
        set((state) => ({
          currentAgent: state.currentAgent 
            ? { ...state.currentAgent, ...updates }
            : null,
        }));
      },

      logout: () => {
        set({
          currentAgent: null,
          isAuthenticated: false,
          dashboardData: null,
          leads: [],
          leadFilters: initialFilters,
          selectedLead: null,
          notifications: [],
          unreadCount: 0,
          tasks: [],
          whatsappMessages: [],
          lastSyncAt: null,
        });
      },
    }),
    {
      name: 'agent-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentAgent: state.currentAgent,
        isAuthenticated: state.isAuthenticated,
        leadFilters: state.leadFilters,
        lastSyncAt: state.lastSyncAt,
      }),
    }
  )
);

// Selector hooks for performance optimization
export const useAgent = () => useAgentStore((state) => state.currentAgent);
export const useIsAuthenticated = () => useAgentStore((state) => state.isAuthenticated);
export const useDashboardData = () => useAgentStore((state) => state.dashboardData);
export const useLeads = () => useAgentStore((state) => state.leads);
export const useSelectedLead = () => useAgentStore((state) => state.selectedLead);
export const useNotifications = () => useAgentStore((state) => ({
  notifications: state.notifications,
  unreadCount: state.unreadCount,
}));
export const useTasks = () => useAgentStore((state) => state.tasks);
export const useWhatsAppMessages = () => useAgentStore((state) => state.whatsappMessages);
export const useOnlineStatus = () => useAgentStore((state) => state.isOnline);

// Effect to handle online/offline status
if (typeof window !== 'undefined') {
  const handleOnline = () => useAgentStore.getState().setOnlineStatus(true);
  const handleOffline = () => useAgentStore.getState().setOnlineStatus(false);
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
}