import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Agent, Lead, EarningsData, PerformanceMetrics } from '@/features/agents/types';

interface AgentState {
  // State
  agent: Agent | null;
  availableLeads: Lead[];
  myLeads: Lead[];
  earnings: EarningsData | null;
  performance: PerformanceMetrics | null;
  isLoadingLeads: boolean;
  isLoadingEarnings: boolean;
  
  // Actions
  setAgent: (agent: Agent | null) => void;
  setAvailableLeads: (leads: Lead[]) => void;
  setMyLeads: (leads: Lead[]) => void;
  setEarnings: (earnings: EarningsData) => void;
  setPerformance: (performance: PerformanceMetrics) => void;
  
  // Lead Management
  claimLead: (leadId: string) => Promise<void>;
  updateLeadStatus: (leadId: string, status: Lead['status']) => void;
  releaseLead: (leadId: string) => void;
  
  // Real-time updates
  addNewLead: (lead: Lead) => void;
  removeLead: (leadId: string) => void;
  updateLead: (leadId: string, updates: Partial<Lead>) => void;
  
  // Utility
  reset: () => void;
}

const initialState = {
  agent: null,
  availableLeads: [],
  myLeads: [],
  earnings: null,
  performance: null,
  isLoadingLeads: false,
  isLoadingEarnings: false,
};

export const useAgentStore = create<AgentState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        
        setAgent: (agent) => set({ agent }),
        
        setAvailableLeads: (leads) => set({ availableLeads: leads, isLoadingLeads: false }),
        
        setMyLeads: (leads) => set({ myLeads: leads }),
        
        setEarnings: (earnings) => set({ earnings, isLoadingEarnings: false }),
        
        setPerformance: (performance) => set({ performance }),
        
        claimLead: async (leadId) => {
          set({ isLoadingLeads: true });
          try {
            // API call would go here
            const lead = get().availableLeads.find(l => l.id === leadId);
            if (lead) {
              set(state => ({
                availableLeads: state.availableLeads.filter(l => l.id !== leadId),
                myLeads: [...state.myLeads, { ...lead, status: 'claimed' as const, claimedAt: new Date() }],
                isLoadingLeads: false
              }));
            }
          } catch (error) {
            set({ isLoadingLeads: false });
            throw error;
          }
        },
        
        updateLeadStatus: (leadId, status) => {
          set(state => ({
            myLeads: state.myLeads.map(lead => 
              lead.id === leadId ? { ...lead, status } : lead
            )
          }));
        },
        
        releaseLead: (leadId) => {
          set(state => {
            const lead = state.myLeads.find(l => l.id === leadId);
            if (lead) {
              return {
                myLeads: state.myLeads.filter(l => l.id !== leadId),
                availableLeads: [...state.availableLeads, { ...lead, status: 'available' as const, claimedBy: undefined, claimedAt: undefined }]
              };
            }
            return state;
          });
        },
        
        addNewLead: (lead) => {
          set(state => ({
            availableLeads: [lead, ...state.availableLeads]
          }));
        },
        
        removeLead: (leadId) => {
          set(state => ({
            availableLeads: state.availableLeads.filter(l => l.id !== leadId),
            myLeads: state.myLeads.filter(l => l.id !== leadId)
          }));
        },
        
        updateLead: (leadId, updates) => {
          set(state => ({
            myLeads: state.myLeads.map(lead => 
              lead.id === leadId ? { ...lead, ...updates } : lead
            ),
            availableLeads: state.availableLeads.map(lead => 
              lead.id === leadId ? { ...lead, ...updates } : lead
            )
          }));
        },
        
        reset: () => set(initialState),
      }),
      {
        name: 'agent-storage',
        partialize: (state) => ({ 
          agent: state.agent,
          myLeads: state.myLeads 
        }),
      }
    )
  )
);