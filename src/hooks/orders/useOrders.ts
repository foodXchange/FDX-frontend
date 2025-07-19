import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import OrderService from '../../services/orders/OrderService';
import {
  Order,
  OrderStatus,
  CreateOrderRequest,
  UpdateOrderRequest,
  OrderSearchFilters,
  OrderSummary
} from '../../types/order';

// Hook for fetching a single order
export function useOrder(orderId: string) {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: () => OrderService.getOrder(orderId),
    enabled: !!orderId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2
  });
}

// Hook for searching orders with filters
export function useOrders(
  filters: OrderSearchFilters = {},
  page = 1,
  limit = 20
) {
  return useQuery({
    queryKey: ['orders', filters, page, limit],
    queryFn: () => OrderService.searchOrders(filters, page, limit),
    keepPreviousData: true,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Hook for order summary statistics
export function useOrderSummary(dateRange?: { start: string; end: string }) {
  return useQuery({
    queryKey: ['order-summary', dateRange],
    queryFn: () => OrderService.getOrderSummary(dateRange),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for creating orders
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateOrderRequest) => OrderService.createOrder(request),
    onSuccess: (newOrder) => {
      // Invalidate and refetch orders list
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order-summary'] });
      
      // Add new order to cache
      queryClient.setQueryData(['order', newOrder.id], newOrder);
    },
    onError: (error) => {
      console.error('Failed to create order:', error);
    }
  });
}

// Hook for updating orders
export function useUpdateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, updates }: { orderId: string; updates: UpdateOrderRequest }) =>
      OrderService.updateOrder(orderId, updates),
    onSuccess: (updatedOrder) => {
      // Update the specific order in cache
      queryClient.setQueryData(['order', updatedOrder.id], updatedOrder);
      
      // Invalidate orders list to reflect changes
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order-summary'] });
    },
    onError: (error) => {
      console.error('Failed to update order:', error);
    }
  });
}

// Hook for order status updates
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      orderId, 
      status, 
      notes 
    }: { 
      orderId: string; 
      status: OrderStatus; 
      notes?: string 
    }) => OrderService.updateOrderStatus(orderId, status, notes),
    onSuccess: (updatedOrder) => {
      queryClient.setQueryData(['order', updatedOrder.id], updatedOrder);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order-summary'] });
    }
  });
}

// Hook for order approval
export function useApproveOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, notes }: { orderId: string; notes?: string }) =>
      OrderService.approveOrder(orderId, notes),
    onSuccess: (updatedOrder) => {
      queryClient.setQueryData(['order', updatedOrder.id], updatedOrder);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    }
  });
}

// Hook for order cancellation
export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, reason }: { orderId: string; reason: string }) =>
      OrderService.cancelOrder(orderId, reason),
    onSuccess: (updatedOrder) => {
      queryClient.setQueryData(['order', updatedOrder.id], updatedOrder);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order-summary'] });
    }
  });
}

// Hook for order documents
export function useOrderDocuments(orderId: string) {
  return useQuery({
    queryKey: ['order-documents', orderId],
    queryFn: () => OrderService.getOrderDocuments(orderId),
    enabled: !!orderId,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook for order communications
export function useOrderCommunications(orderId: string) {
  return useQuery({
    queryKey: ['order-communications', orderId],
    queryFn: () => OrderService.getOrderCommunications(orderId),
    enabled: !!orderId,
    staleTime: 30 * 1000, // 30 seconds for more frequent updates
  });
}

// Hook for order tracking
export function useOrderTracking(orderId: string) {
  return useQuery({
    queryKey: ['order-tracking', orderId],
    queryFn: () => OrderService.getOrderTracking(orderId),
    enabled: !!orderId,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    staleTime: 2 * 60 * 1000,
  });
}

// Hook for advanced order filtering and search
export function useAdvancedOrderSearch() {
  const [filters, setFilters] = useState<OrderSearchFilters>({});
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const ordersQuery = useOrders(filters, page, limit);

  const updateFilters = useCallback((newFilters: Partial<OrderSearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(1); // Reset to first page when filters change
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setPage(1);
  }, []);

  const goToPage = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const changePageSize = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  }, []);

  // Filtered and sorted data
  const processedData = useMemo(() => {
    if (!ordersQuery.data?.orders) return [];

    let orders = [...ordersQuery.data.orders];

    // Apply local sorting
    orders.sort((a, b) => {
      const aValue = a[sortBy as keyof Order];
      const bValue = b[sortBy as keyof Order];
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return orders;
  }, [ordersQuery.data?.orders, sortBy, sortOrder]);

  return {
    orders: processedData,
    total: ordersQuery.data?.total || 0,
    pages: ordersQuery.data?.pages || 0,
    currentPage: page,
    pageSize: limit,
    filters,
    sortBy,
    sortOrder,
    isLoading: ordersQuery.isLoading,
    isError: ordersQuery.isError,
    error: ordersQuery.error,
    updateFilters,
    clearFilters,
    goToPage,
    changePageSize,
    setSortBy,
    setSortOrder,
    refetch: ordersQuery.refetch
  };
}

// Hook for order analytics and insights
export function useOrderAnalytics(dateRange?: { start: string; end: string }) {
  const summaryQuery = useOrderSummary(dateRange);
  const ordersQuery = useOrders({ dateRange }, 1, 1000); // Get more data for analytics

  const analytics = useMemo(() => {
    if (!ordersQuery.data?.orders) return null;

    const orders = ordersQuery.data.orders;
    
    // Calculate trends
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentOrders = orders.filter(order => 
      new Date(order.createdAt) >= thirtyDaysAgo
    );

    // Performance metrics
    const onTimeDeliveries = orders.filter(order => 
      order.status === OrderStatus.DELIVERED && 
      order.delivery?.actualDeliveryDate &&
      new Date(order.delivery.actualDeliveryDate) <= new Date(order.delivery.estimatedDeliveryDate)
    ).length;

    const completedOrders = orders.filter(order => 
      order.status === OrderStatus.COMPLETED
    ).length;

    // Financial metrics
    const totalRevenue = orders
      .filter(order => order.status === OrderStatus.COMPLETED)
      .reduce((sum, order) => sum + order.pricing.totalAmount, 0);

    const averageOrderValue = orders.length > 0 
      ? orders.reduce((sum, order) => sum + order.pricing.totalAmount, 0) / orders.length 
      : 0;

    return {
      totalOrders: orders.length,
      recentOrders: recentOrders.length,
      totalRevenue,
      averageOrderValue,
      onTimeDeliveryRate: orders.length > 0 ? (onTimeDeliveries / orders.length) * 100 : 0,
      completionRate: orders.length > 0 ? (completedOrders / orders.length) * 100 : 0,
      summary: summaryQuery.data
    };
  }, [ordersQuery.data, summaryQuery.data]);

  return {
    analytics,
    isLoading: ordersQuery.isLoading || summaryQuery.isLoading,
    isError: ordersQuery.isError || summaryQuery.isError,
    error: ordersQuery.error || summaryQuery.error,
    refetch: () => {
      ordersQuery.refetch();
      summaryQuery.refetch();
    }
  };
}

// Hook for real-time order updates
export function useOrderRealTimeUpdates(orderId: string) {
  const queryClient = useQueryClient();
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');

  useEffect(() => {
    if (!orderId) return;

    setConnectionStatus('connecting');

    // WebSocket connection for real-time updates
    const ws = new WebSocket(`${process.env.REACT_APP_WS_URL}/orders/${orderId}`);

    ws.onopen = () => {
      setConnectionStatus('connected');
      console.log(`Connected to order ${orderId} updates`);
    };

    ws.onmessage = (event) => {
      try {
        const update = JSON.parse(event.data);
        
        // Update the order in cache
        queryClient.setQueryData(['order', orderId], (oldData: Order | undefined) => {
          if (!oldData) return oldData;
          return { ...oldData, ...update };
        });

        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        queryClient.invalidateQueries({ queryKey: ['order-tracking', orderId] });
        
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      setConnectionStatus('disconnected');
      console.log(`Disconnected from order ${orderId} updates`);
    };

    ws.onerror = (error) => {
      console.error(`WebSocket error for order ${orderId}:`, error);
      setConnectionStatus('disconnected');
    };

    return () => {
      ws.close();
    };
  }, [orderId, queryClient]);

  return {
    connectionStatus,
    isConnected: connectionStatus === 'connected'
  };
}