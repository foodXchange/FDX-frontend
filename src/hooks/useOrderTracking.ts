import { useState, useEffect, useCallback } from 'react';
import { websocket } from '../services/websocket';

export interface OrderLineUpdate {
  id: string;
  lineNumber: number;
  orderId: string;
  productName: string;
  fulfilledQuantity: number;
  remainingQuantity: number;
  status: 'pending' | 'partial' | 'fulfilled' | 'cancelled';
  temperature?: {
    current: number;
    required: { min: number; max: number };
    status: 'normal' | 'warning' | 'critical';
  };
  trackingNumber?: string;
  estimatedDelivery?: Date;
  lastUpdate: Date;
}

export interface OrderUpdate {
  orderId: string;
  lines: OrderLineUpdate[];
  totalValue: number;
  overallStatus: 'pending' | 'processing' | 'partial' | 'completed' | 'cancelled';
  timestamp: Date;
}

interface UseOrderTrackingOptions {
  autoConnect?: boolean;
  reconnectOnError?: boolean;
}

export const useOrderTracking = (options: UseOrderTrackingOptions = {}) => {
  const { autoConnect = true, reconnectOnError = true } = options;
  
  const [isConnected, setIsConnected] = useState(false);
  const [orderUpdates, setOrderUpdates] = useState<OrderUpdate[]>([]);
  const [lineUpdates, setLineUpdates] = useState<OrderLineUpdate[]>([]);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Handle order updates from WebSocket
  const handleOrderUpdate = useCallback((data: OrderUpdate) => {
    setOrderUpdates(prev => {
      const existingIndex = prev.findIndex(update => update.orderId === data.orderId);
      if (existingIndex >= 0) {
        // Update existing order
        const updated = [...prev];
        updated[existingIndex] = data;
        return updated;
      } else {
        // Add new order update
        return [...prev, data];
      }
    });
  }, []);

  // Handle individual line updates
  const handleOrderLineUpdate = useCallback((data: OrderLineUpdate) => {
    setLineUpdates(prev => {
      const existingIndex = prev.findIndex(update => update.id === data.id);
      if (existingIndex >= 0) {
        // Update existing line
        const updated = [...prev];
        updated[existingIndex] = data;
        return updated;
      } else {
        // Add new line update
        return [...prev, data];
      }
    });

    // Also update the line within order updates
    setOrderUpdates(prev => prev.map(orderUpdate => ({
      ...orderUpdate,
      lines: orderUpdate.lines.map(line => 
        line.id === data.id ? data : line
      )
    })));
  }, []);

  // Handle fulfillment updates
  const handleFulfillmentUpdate = useCallback((data: { 
    lineId: string; 
    orderId: string;
    fulfilledQuantity: number; 
    remainingQuantity: number;
    status: OrderLineUpdate['status'];
  }) => {
    setLineUpdates(prev => prev.map(update => 
      update.id === data.lineId 
        ? { 
            ...update, 
            fulfilledQuantity: data.fulfilledQuantity,
            remainingQuantity: data.remainingQuantity,
            status: data.status,
            lastUpdate: new Date()
          }
        : update
    ));
  }, []);

  // Handle temperature updates for order lines
  const handleOrderTemperatureUpdate = useCallback((data: { 
    lineId: string; 
    temperature: number;
    status: 'normal' | 'warning' | 'critical';
  }) => {
    setLineUpdates(prev => prev.map(update => 
      update.id === data.lineId 
        ? { 
            ...update, 
            temperature: update.temperature ? {
              ...update.temperature,
              current: data.temperature,
              status: data.status
            } : undefined,
            lastUpdate: new Date()
          }
        : update
    ));
  }, []);

  // Handle tracking number updates
  const handleTrackingUpdate = useCallback((data: {
    lineId: string;
    trackingNumber: string;
    estimatedDelivery?: Date;
  }) => {
    setLineUpdates(prev => prev.map(update => 
      update.id === data.lineId 
        ? { 
            ...update, 
            trackingNumber: data.trackingNumber,
            estimatedDelivery: data.estimatedDelivery,
            lastUpdate: new Date()
          }
        : update
    ));
  }, []);

  // Subscribe to order-specific updates
  const subscribeToOrder = useCallback((orderId: string) => {
    if (isConnected) {
      websocket.send('subscribe', { channel: 'order_tracking', orderId });
    }
  }, [isConnected]);

  // Subscribe to order line updates
  const subscribeToOrderLine = useCallback((lineId: string) => {
    if (isConnected) {
      websocket.send('subscribe', { channel: 'order_line_tracking', lineId });
    }
  }, [isConnected]);

  // Unsubscribe from order updates
  const unsubscribeFromOrder = useCallback((orderId: string) => {
    if (isConnected) {
      websocket.send('unsubscribe', { channel: 'order_tracking', orderId });
    }
  }, [isConnected]);

  // Unsubscribe from order line updates
  const unsubscribeFromOrderLine = useCallback((lineId: string) => {
    if (isConnected) {
      websocket.send('unsubscribe', { channel: 'order_line_tracking', lineId });
    }
  }, [isConnected]);

  // Clear updates for specific order or all
  const clearOrderUpdates = useCallback((orderId?: string) => {
    if (orderId) {
      setOrderUpdates(prev => prev.filter(update => update.orderId !== orderId));
      setLineUpdates(prev => prev.filter(update => update.orderId !== orderId));
    } else {
      setOrderUpdates([]);
      setLineUpdates([]);
    }
  }, []);

  // Get updates for a specific order
  const getOrderUpdates = useCallback((orderId: string): OrderUpdate[] => {
    return orderUpdates.filter(update => update.orderId === orderId);
  }, [orderUpdates]);

  // Get line updates for a specific order
  const getOrderLineUpdates = useCallback((orderId: string): OrderLineUpdate[] => {
    return lineUpdates.filter(update => update.orderId === orderId);
  }, [lineUpdates]);

  // Get latest update for an order
  const getLatestOrderUpdate = useCallback((orderId: string): OrderUpdate | null => {
    const updates = getOrderUpdates(orderId);
    return updates.length > 0 ? updates[updates.length - 1] : null;
  }, [getOrderUpdates]);

  // Get fulfillment percentage for an order
  const getOrderFulfillmentPercentage = useCallback((orderId: string): number => {
    const lines = getOrderLineUpdates(orderId);
    if (lines.length === 0) return 0;
    
    const totalOrdered = lines.reduce((sum, line) => sum + (line.fulfilledQuantity + line.remainingQuantity), 0);
    const totalFulfilled = lines.reduce((sum, line) => sum + line.fulfilledQuantity, 0);
    
    return totalOrdered > 0 ? (totalFulfilled / totalOrdered) * 100 : 0;
  }, [getOrderLineUpdates]);

  useEffect(() => {
    if (!autoConnect) return;

    // Connection event handlers
    const handleConnect = () => {
      setIsConnected(true);
      setConnectionError(null);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleError = (error: any) => {
      setConnectionError(error?.message || 'WebSocket connection error');
      if (reconnectOnError) {
        setTimeout(() => {
          websocket.connect();
        }, 3000);
      }
    };

    // Register event listeners
    websocket.on('connected', handleConnect);
    websocket.on('disconnected', handleDisconnect);
    websocket.on('error', handleError);
    
    // Order tracking specific events
    websocket.on('order_update', handleOrderUpdate);
    websocket.on('order_line_update', handleOrderLineUpdate);
    websocket.on('fulfillment_update', handleFulfillmentUpdate);
    websocket.on('order_temperature_update', handleOrderTemperatureUpdate);
    websocket.on('tracking_update', handleTrackingUpdate);

    // Connect if not already connected
    websocket.connect();

    // Cleanup on unmount
    return () => {
      websocket.off('connected', handleConnect);
      websocket.off('disconnected', handleDisconnect);
      websocket.off('error', handleError);
      websocket.off('order_update', handleOrderUpdate);
      websocket.off('order_line_update', handleOrderLineUpdate);
      websocket.off('fulfillment_update', handleFulfillmentUpdate);
      websocket.off('order_temperature_update', handleOrderTemperatureUpdate);
      websocket.off('tracking_update', handleTrackingUpdate);
    };
  }, [
    autoConnect, 
    reconnectOnError, 
    handleOrderUpdate, 
    handleOrderLineUpdate, 
    handleFulfillmentUpdate, 
    handleOrderTemperatureUpdate,
    handleTrackingUpdate
  ]);

  return {
    isConnected,
    connectionError,
    orderUpdates,
    lineUpdates,
    subscribeToOrder,
    subscribeToOrderLine,
    unsubscribeFromOrder,
    unsubscribeFromOrderLine,
    clearOrderUpdates,
    getOrderUpdates,
    getOrderLineUpdates,
    getLatestOrderUpdate,
    getOrderFulfillmentPercentage,
    // Connection control
    connect: () => websocket.connect(),
    disconnect: () => websocket.disconnect(),
  };
};