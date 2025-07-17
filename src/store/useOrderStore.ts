import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { Order } from '@shared/types';
import { api } from '@/services/api-client';

interface OrderFilters {
  status?: string;
  supplier?: string;
  dateRange?: [Date, Date];
  search?: string;
  orderType?: 'standard' | 'standing';
}

interface OrderState {
  // Orders
  orders: Order[];
  totalOrders: number;
  currentPage: number;
  pageSize: number;
  isLoading: boolean;
  error: string | null;

  // Filters
  filters: OrderFilters;
  setFilters: (filters: OrderFilters) => void;
  resetFilters: () => void;

  // Selected order
  selectedOrder: Order | null;
  setSelectedOrder: (order: Order | null) => void;

  // CRUD operations
  fetchOrders: (page?: number) => Promise<void>;
  fetchOrderById: (id: string) => Promise<void>;
  updateOrderStatus: (id: string, status: string) => Promise<void>;

  // Cart management
  cart: {
    items: Array<{
      productId: string;
      productName: string;
      quantity: number;
      price: number;
      unit: string;
    }>;
    supplierId?: string;
    notes?: string;
  };
  addToCart: (item: OrderState['cart']['items'][0]) => void;
  updateCartItem: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  calculateCartTotal: () => number;
  submitCart: () => Promise<Order>;

  // Standing orders
  standingOrders: Order[];
  fetchStandingOrders: () => Promise<void>;
  createStandingOrder: (data: Partial<Order>) => Promise<Order>;
  pauseStandingOrder: (id: string) => Promise<void>;
  resumeStandingOrder: (id: string) => Promise<void>;
}

export const useOrderStore = create<OrderState>()(
  devtools(
    immer((set, get) => ({
      // Initial state
      orders: [],
      totalOrders: 0,
      currentPage: 1,
      pageSize: 20,
      isLoading: false,
      error: null,
      filters: {},
      selectedOrder: null,
      cart: { items: [] },
      standingOrders: [],

      // Filter management
      setFilters: (filters) =>
        set((state) => {
          state.filters = { ...state.filters, ...filters };
          state.currentPage = 1;
        }),

      resetFilters: () =>
        set((state) => {
          state.filters = {};
          state.currentPage = 1;
        }),

      // Selection
      setSelectedOrder: (order) =>
        set((state) => {
          state.selectedOrder = order;
        }),

      // Fetch orders
      fetchOrders: async (page) => {
        const currentPage = page || get().currentPage;
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          const response = await api.orders.getAll({
            page: currentPage,
            limit: get().pageSize,
            ...get().filters,
          });

          set((state) => {
            state.orders = response.data || [];
            state.totalOrders = response.pagination?.total || 0;
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

      // Fetch single order
      fetchOrderById: async (id) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          const response = await api.orders.getById(id);
          set((state) => {
            state.selectedOrder = response.data || null;
            state.isLoading = false;
          });
        } catch (error: unknown) {
          set((state) => {
            state.error = error instanceof Error ? error.message : 'Unknown error occurred';
            state.isLoading = false;
          });
        }
      },

      // Update order status
      updateOrderStatus: async (id, status) => {
        set((state) => {
          state.isLoading = true;
        });

        try {
          const response = await api.orders.updateStatus(id, status);
          const updatedOrder = response.data;

          set((state) => {
            const index = state.orders.findIndex((order) => order.id === id);
            if (index !== -1) {
              state.orders[index] = updatedOrder || state.orders[index];
            }
            if (state.selectedOrder?.id === id) {
              state.selectedOrder = updatedOrder || null;
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

      // Cart management
      addToCart: (item) =>
        set((state) => {
          const existingItem = state.cart.items.find(
            (i) => i.productId === item.productId
          );
          if (existingItem) {
            existingItem.quantity += item.quantity;
          } else {
            state.cart.items.push(item);
          }
        }),

      updateCartItem: (productId, quantity) =>
        set((state) => {
          const item = state.cart.items.find((i) => i.productId === productId);
          if (item) {
            if (quantity <= 0) {
              state.cart.items = state.cart.items.filter(
                (i) => i.productId !== productId
              );
            } else {
              item.quantity = quantity;
            }
          }
        }),

      removeFromCart: (productId) =>
        set((state) => {
          state.cart.items = state.cart.items.filter(
            (i) => i.productId !== productId
          );
        }),

      clearCart: () =>
        set((state) => {
          state.cart = { items: [] };
        }),

      calculateCartTotal: () => {
        const { items } = get().cart;
        return items.reduce((total, item) => total + item.price * item.quantity, 0);
      },

      submitCart: async () => {
        const { cart } = get();
        if (cart.items.length === 0) {
          throw new Error('Cart is empty');
        }

        set((state) => {
          state.isLoading = true;
        });

        try {
          // Create order from cart
          const orderData = {
            items: cart.items,
            supplierId: cart.supplierId,
            notes: cart.notes,
            totalAmount: get().calculateCartTotal(),
          };

          // In a real app, this would be a specific endpoint
          // TODO: Add proper create method to API
          const response = await (api as any).post('/orders', orderData) as { data: Order };
          const newOrder = response.data;

          set((state) => {
            state.orders.unshift(newOrder);
            state.cart = { items: [] };
            state.isLoading = false;
          });

          return newOrder;
        } catch (error: unknown) {
          set((state) => {
            state.error = error instanceof Error ? error.message : 'Unknown error occurred';
            state.isLoading = false;
          });
          throw error;
        }
      },

      // Standing orders
      fetchStandingOrders: async () => {
        set((state) => {
          state.isLoading = true;
        });

        try {
          const response = await api.orders.getAll({
            // TODO: Add orderType filter to SearchParams interface
            orderType: 'standing',
          } as any);

          set((state) => {
            state.standingOrders = response.data || [];
            state.isLoading = false;
          });
        } catch (error: unknown) {
          set((state) => {
            state.error = error instanceof Error ? error.message : 'Unknown error occurred';
            state.isLoading = false;
          });
        }
      },

      createStandingOrder: async (data) => {
        set((state) => {
          state.isLoading = true;
        });

        try {
          // TODO: Add proper create method to API
          const response = await (api as any).post('/orders', {
            ...data,
            orderType: 'standing',
          }) as { data: Order };
          const newOrder = response.data;

          set((state) => {
            state.standingOrders.push(newOrder);
            state.isLoading = false;
          });

          return newOrder;
        } catch (error: unknown) {
          set((state) => {
            state.error = error instanceof Error ? error.message : 'Unknown error occurred';
            state.isLoading = false;
          });
          throw error;
        }
      },

      pauseStandingOrder: async (id) => {
        await get().updateOrderStatus(id, 'paused');
      },

      resumeStandingOrder: async (id) => {
        await get().updateOrderStatus(id, 'active');
      },
    })),
    {
      name: 'order-store',
    }
  )
);