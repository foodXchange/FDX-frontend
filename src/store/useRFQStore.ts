import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { RFQ } from '@shared/types';
import { api } from '@/services/api-client';

interface RFQFilters {
  status?: string;
  category?: string;
  dateRange?: [Date, Date];
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface RFQState {
  // RFQ list
  rfqs: RFQ[];
  totalRFQs: number;
  currentPage: number;
  pageSize: number;
  isLoading: boolean;
  error: string | null;

  // Filters
  filters: RFQFilters;
  setFilters: (filters: RFQFilters) => void;
  resetFilters: () => void;

  // Selected RFQ
  selectedRFQ: RFQ | null;
  setSelectedRFQ: (rfq: RFQ | null) => void;

  // CRUD operations
  fetchRFQs: (page?: number) => Promise<void>;
  fetchRFQById: (id: string) => Promise<void>;
  createRFQ: (data: Partial<RFQ>) => Promise<RFQ | undefined>;
  updateRFQ: (id: string, data: Partial<RFQ>) => Promise<void>;
  deleteRFQ: (id: string) => Promise<void>;
  updateRFQStatus: (id: string, status: string) => Promise<void>;

  // Bulk operations
  selectedRFQIds: Set<string>;
  toggleRFQSelection: (id: string) => void;
  selectAllRFQs: () => void;
  clearSelection: () => void;
  bulkUpdateStatus: (status: string) => Promise<void>;
  bulkDelete: () => Promise<void>;

  // Draft management
  draftRFQ: Partial<RFQ> | null;
  saveDraft: (data: Partial<RFQ>) => void;
  clearDraft: () => void;
}

export const useRFQStore = create<RFQState>()(
  devtools(
    immer((set, get) => ({
      // Initial state
      rfqs: [],
      totalRFQs: 0,
      currentPage: 1,
      pageSize: 20,
      isLoading: false,
      error: null,
      filters: {},
      selectedRFQ: null,
      selectedRFQIds: new Set(),
      draftRFQ: null,

      // Filter management
      setFilters: (filters) =>
        set((state) => {
          state.filters = { ...state.filters, ...filters };
          state.currentPage = 1; // Reset to first page on filter change
        }),

      resetFilters: () =>
        set((state) => {
          state.filters = {};
          state.currentPage = 1;
        }),

      // Selection
      setSelectedRFQ: (rfq) =>
        set((state) => {
          state.selectedRFQ = rfq;
        }),

      // Fetch RFQs
      fetchRFQs: async (page) => {
        const currentPage = page || get().currentPage;
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          const response = await api.rfqs.getAll({
            page: currentPage,
            limit: get().pageSize,
            ...get().filters,
          });

          set((state) => {
            state.rfqs = response.data || [];
            state.totalRFQs = response.pagination?.total || 0;
            state.currentPage = currentPage;
            state.isLoading = false;
          });
        } catch (error: unknown) {
          set((state) => {
            state.error = error instanceof Error ? error.message : 'Unknown error occurred';
            state.isLoading = false;
          });
        }
      },

      // Fetch single RFQ
      fetchRFQById: async (id) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          const response = await api.rfqs.getById(id);
          set((state) => {
            state.selectedRFQ = response.data || null;
            state.isLoading = false;
          });
        } catch (error: unknown) {
          set((state) => {
            state.error = error instanceof Error ? error.message : 'Unknown error occurred';
            state.isLoading = false;
          });
        }
      },

      // Create RFQ
      createRFQ: async (data) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          const response = await api.rfqs.create(data);
          const newRFQ = response.data;

          set((state) => {
            if (newRFQ) state.rfqs.unshift(newRFQ);
            state.totalRFQs += 1;
            state.isLoading = false;
            state.draftRFQ = null;
          });

          return newRFQ;
        } catch (error: unknown) {
          set((state) => {
            state.error = error instanceof Error ? error.message : 'Unknown error occurred';
            state.isLoading = false;
          });
          throw error;
        }
      },

      // Update RFQ
      updateRFQ: async (id, data) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          const response = await api.rfqs.update(id, data);
          const updatedRFQ = response.data;

          set((state) => {
            const index = state.rfqs.findIndex((rfq) => rfq.id === id);
            if (index !== -1) {
              if (updatedRFQ) state.rfqs[index] = updatedRFQ;
            }
            if (state.selectedRFQ?.id === id) {
              state.selectedRFQ = updatedRFQ || null;
            }
            state.isLoading = false;
          });
        } catch (error: unknown) {
          set((state) => {
            state.error = error instanceof Error ? error.message : 'Unknown error occurred';
            state.isLoading = false;
          });
          throw error;
        }
      },

      // Delete RFQ
      deleteRFQ: async (id) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          await api.rfqs.delete(id);

          set((state) => {
            state.rfqs = state.rfqs.filter((rfq) => rfq.id !== id);
            state.totalRFQs -= 1;
            state.selectedRFQIds.delete(id);
            if (state.selectedRFQ?.id === id) {
              state.selectedRFQ = null;
            }
            state.isLoading = false;
          });
        } catch (error: unknown) {
          set((state) => {
            state.error = error instanceof Error ? error.message : 'Unknown error occurred';
            state.isLoading = false;
          });
          throw error;
        }
      },

      // Update status
      updateRFQStatus: async (id, status) => {
        await get().updateRFQ(id, { status } as Partial<RFQ>);
      },

      // Selection management
      toggleRFQSelection: (id) =>
        set((state) => {
          if (state.selectedRFQIds.has(id)) {
            state.selectedRFQIds.delete(id);
          } else {
            state.selectedRFQIds.add(id);
          }
        }),

      selectAllRFQs: () =>
        set((state) => {
          state.rfqs.forEach((rfq) => state.selectedRFQIds.add(rfq.id));
        }),

      clearSelection: () =>
        set((state) => {
          state.selectedRFQIds.clear();
        }),

      // Bulk operations
      bulkUpdateStatus: async (status) => {
        const ids = Array.from(get().selectedRFQIds);
        set((state) => {
          state.isLoading = true;
        });

        try {
          await Promise.all(ids.map((id) => api.rfqs.updateStatus(id, status)));
          
          set((state) => {
            state.rfqs.forEach((rfq) => {
              if (state.selectedRFQIds.has(rfq.id)) {
                // TODO: Ensure status type is properly defined in RFQ interface
                (rfq as any).status = status;
              }
            });
            state.selectedRFQIds.clear();
            state.isLoading = false;
          });
        } catch (error: unknown) {
          set((state) => {
            state.error = error instanceof Error ? error.message : 'Unknown error occurred';
            state.isLoading = false;
          });
          throw error;
        }
      },

      bulkDelete: async () => {
        const ids = Array.from(get().selectedRFQIds);
        set((state) => {
          state.isLoading = true;
        });

        try {
          await Promise.all(ids.map((id) => api.rfqs.delete(id)));
          
          set((state) => {
            state.rfqs = state.rfqs.filter((rfq) => !state.selectedRFQIds.has(rfq.id));
            state.totalRFQs -= state.selectedRFQIds.size;
            state.selectedRFQIds.clear();
            state.isLoading = false;
          });
        } catch (error: unknown) {
          set((state) => {
            state.error = error instanceof Error ? error.message : 'Unknown error occurred';
            state.isLoading = false;
          });
          throw error;
        }
      },

      // Draft management
      saveDraft: (data) =>
        set((state) => {
          state.draftRFQ = data;
        }),

      clearDraft: () =>
        set((state) => {
          state.draftRFQ = null;
        }),
    })),
    {
      name: 'rfq-store',
    }
  )
);