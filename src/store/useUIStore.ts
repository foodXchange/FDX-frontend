import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface Modal {
  id: string;
  component: React.ComponentType<any>;
  props?: any;
  options?: {
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    closeOnEscape?: boolean;
    closeOnBackdrop?: boolean;
    showCloseButton?: boolean;
  };
}

interface UIState {
  // Sidebar
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Modals
  modals: Modal[];
  openModal: (modal: Omit<Modal, 'id'>) => string;
  closeModal: (id: string) => void;
  closeAllModals: () => void;

  // Global loading
  loadingTasks: Map<string, string>;
  startLoading: (taskId: string, message?: string) => void;
  stopLoading: (taskId: string) => void;
  isLoading: () => boolean;

  // Breadcrumbs
  breadcrumbs: Array<{ label: string; href?: string }>;
  setBreadcrumbs: (breadcrumbs: UIState['breadcrumbs']) => void;

  // Page metadata
  pageTitle: string;
  setPageTitle: (title: string) => void;

  // Command palette
  commandPaletteOpen: boolean;
  toggleCommandPalette: () => void;

  // Search
  globalSearchQuery: string;
  setGlobalSearchQuery: (query: string) => void;

  // Table preferences
  tablePreferences: Record<string, {
    pageSize: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    hiddenColumns?: string[];
  }>;
  updateTablePreference: (tableId: string, prefs: Partial<UIState['tablePreferences'][string]>) => void;

  // Tour/onboarding
  tourActive: boolean;
  tourStep: number;
  startTour: () => void;
  nextTourStep: () => void;
  skipTour: () => void;

  // Focus management
  focusedElement: string | null;
  setFocusedElement: (elementId: string | null) => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    immer((set, get) => ({
      // Sidebar
      sidebarOpen: true,
      sidebarCollapsed: false,
      toggleSidebar: () =>
        set((state) => {
          state.sidebarOpen = !state.sidebarOpen;
        }),
      setSidebarOpen: (open) =>
        set((state) => {
          state.sidebarOpen = open;
        }),
      setSidebarCollapsed: (collapsed) =>
        set((state) => {
          state.sidebarCollapsed = collapsed;
        }),

      // Modals
      modals: [],
      openModal: (modal) => {
        const id = `modal-${Date.now()}-${Math.random()}`;
        set((state) => {
          state.modals.push({ ...modal, id });
        });
        return id;
      },
      closeModal: (id) =>
        set((state) => {
          state.modals = state.modals.filter((m) => m.id !== id);
        }),
      closeAllModals: () =>
        set((state) => {
          state.modals = [];
        }),

      // Loading
      loadingTasks: new Map(),
      startLoading: (taskId, message = 'Loading...') =>
        set((state) => {
          state.loadingTasks.set(taskId, message);
        }),
      stopLoading: (taskId) =>
        set((state) => {
          state.loadingTasks.delete(taskId);
        }),
      isLoading: () => get().loadingTasks.size > 0,

      // Breadcrumbs
      breadcrumbs: [],
      setBreadcrumbs: (breadcrumbs) =>
        set((state) => {
          state.breadcrumbs = breadcrumbs;
        }),

      // Page metadata
      pageTitle: 'FoodXchange',
      setPageTitle: (title) => {
        document.title = `${title} | FoodXchange`;
        set((state) => {
          state.pageTitle = title;
        });
      },

      // Command palette
      commandPaletteOpen: false,
      toggleCommandPalette: () =>
        set((state) => {
          state.commandPaletteOpen = !state.commandPaletteOpen;
        }),

      // Search
      globalSearchQuery: '',
      setGlobalSearchQuery: (query) =>
        set((state) => {
          state.globalSearchQuery = query;
        }),

      // Table preferences
      tablePreferences: {},
      updateTablePreference: (tableId, prefs) =>
        set((state) => {
          if (!state.tablePreferences[tableId]) {
            state.tablePreferences[tableId] = {
              pageSize: 20,
            };
          }
          Object.assign(state.tablePreferences[tableId], prefs);
        }),

      // Tour
      tourActive: false,
      tourStep: 0,
      startTour: () =>
        set((state) => {
          state.tourActive = true;
          state.tourStep = 0;
        }),
      nextTourStep: () =>
        set((state) => {
          state.tourStep += 1;
        }),
      skipTour: () =>
        set((state) => {
          state.tourActive = false;
          state.tourStep = 0;
        }),

      // Focus
      focusedElement: null,
      setFocusedElement: (elementId) =>
        set((state) => {
          state.focusedElement = elementId;
        }),
    })),
    {
      name: 'ui-store',
    }
  )
);

// Keyboard shortcuts
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', (e) => {
    // Cmd/Ctrl + K for command palette
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      useUIStore.getState().toggleCommandPalette();
    }

    // Escape to close modals
    if (e.key === 'Escape') {
      const state = useUIStore.getState();
      if (state.modals.length > 0) {
        const lastModal = state.modals[state.modals.length - 1];
        if (lastModal.options?.closeOnEscape !== false) {
          state.closeModal(lastModal.id);
        }
      } else if (state.commandPaletteOpen) {
        state.toggleCommandPalette();
      }
    }
  });
}