// File: /src/shared/hooks/use-websocket.ts
import { useState, useEffect, useCallback, useRef } from 'react';
// Note: We'll create a simple EventEmitter alternative since 'events' module causes issues

interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: string;
  userId?: string;
  rfqId?: string;
  messageId?: string;
}

interface ConnectionOptions {
  userId: string;
  token?: string;
  reconnectAttempts?: number;
  heartbeatInterval?: number;
}

interface RFQUpdate {
  rfqId: string;
  status: 'draft' | 'published' | 'receiving_bids' | 'evaluating' | 'awarded';
  bidCount: number;
  lastActivity: string;
  newBids?: any[];
  complianceScore?: number;
  bestPrice?: number;
}

interface ComplianceUpdate {
  rfqId: string;
  complianceScore: number;
  issues: any[];
  status: 'compliant' | 'non_compliant' | 'pending' | 'checking';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface CollaborationMessage {
  id: string;
  rfqId: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
  type: 'message' | 'status_change' | 'user_joined' | 'user_left';
  metadata?: any;
}

interface ActiveUser {
  userId: string;
  userName: string;
  role: string;
  lastSeen: string;
  currentRfq?: string;
}

// Mock WebSocket service for now - will be replaced with real implementation
class MockWebSocketService {
  private connected = false;

  connect(options: ConnectionOptions): Promise<void> {
    return new Promise((resolve) => {
      this.connected = true;
      setTimeout(resolve, 100);
    });
  }

  disconnect(): void {
    this.connected = false;
  }

  isConnected(): boolean {
    return this.connected;
  }

  on(event: string, handler: Function): void {
    // Mock event listener
  }

  off(event: string, handler: Function): void {
    // Mock event listener removal
  }

  emit(event: string, data?: any): void {
    // Mock event emission
  }

  updateRFQStatus(rfqId: string, status: string, data?: any): void {
    console.log('Mock: Update RFQ status', rfqId, status);
  }

  joinRFQ(rfqId: string): void {
    console.log('Mock: Join RFQ', rfqId);
  }

  leaveRFQ(rfqId: string): void {
    console.log('Mock: Leave RFQ', rfqId);
  }

  subscribeToRFQUpdates(rfqIds: string[]): void {
    console.log('Mock: Subscribe to RFQ updates', rfqIds);
  }

  sendCollaborationMessage(rfqId: string, message: string, metadata?: any): void {
    console.log('Mock: Send collaboration message', rfqId, message);
  }

  sendTypingIndicator(rfqId: string, isTyping: boolean): void {
    console.log('Mock: Send typing indicator', rfqId, isTyping);
  }

  setUserStatus(rfqId: string, status: string): void {
    console.log('Mock: Set user status', rfqId, status);
  }

  requestComplianceCheck(rfqId: string, specifications: any): void {
    console.log('Mock: Request compliance check', rfqId);
  }

  subscribeToComplianceUpdates(rfqId: string): void {
    console.log('Mock: Subscribe to compliance updates', rfqId);
  }

  markNotificationAsRead(notificationId: string): void {
    console.log('Mock: Mark notification as read', notificationId);
  }

  subscribeToNotifications(types: string[]): void {
    console.log('Mock: Subscribe to notifications', types);
  }

  getStats(): any {
    return {
      connectionState: this.connected ? 'connected' : 'disconnected',
      reconnectAttempts: 0,
      queuedMessages: 0,
      listenerCount: 0,
      isConnected: this.connected
    };
  }
}

const websocketService = new MockWebSocketService();

// Hook for basic WebSocket connection management
export function useWebSocket(options: ConnectionOptions & { 
  autoConnect?: boolean; 
  onConnect?: () => void; 
  onError?: (error: any) => void 
}) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionState, setConnectionState] = useState<string>('disconnected');
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>({});

  const connect = useCallback(async () => {
    if (isConnecting || isConnected) return;

    try {
      setIsConnecting(true);
      setError(null);
      await websocketService.connect(options);
      setIsConnected(true);
      setConnectionState('connected');
      options.onConnect?.();
    } catch (err: any) {
      console.error('WebSocket connection failed:', err);
      setError(err.message || 'Connection failed');
      options.onError?.(err);
    } finally {
      setIsConnecting(false);
    }
  }, [options, isConnecting, isConnected]);

  const disconnect = useCallback(() => {
    websocketService.disconnect();
    setIsConnected(false);
    setConnectionState('disconnected');
  }, []);

  const retry = useCallback(() => {
    if (!isConnecting) {
      connect();
    }
  }, [connect, isConnecting]);

  const updateStats = useCallback(() => {
    setStats(websocketService.getStats());
  }, []);

  useEffect(() => {
    if (options.autoConnect) {
      connect();
    }
  }, [connect, options.autoConnect]);

  return {
    isConnected,
    isConnecting,
    connectionState,
    error,
    stats,
    connect,
    disconnect,
    retry,
    updateStats
  };
}

// Hook for RFQ real-time updates
export function useRFQUpdates(rfqIds: string[]) {
  const [rfqUpdates, setRfqUpdates] = useState<Record<string, RFQUpdate>>({});
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const updateRFQStatus = useCallback((rfqId: string, status: string, data?: any) => {
    websocketService.updateRFQStatus(rfqId, status, data);
  }, []);

  const subscribeToRFQ = useCallback((rfqId: string) => {
    websocketService.joinRFQ(rfqId);
  }, []);

  const unsubscribeFromRFQ = useCallback((rfqId: string) => {
    websocketService.leaveRFQ(rfqId);
  }, []);

  useEffect(() => {
    if (rfqIds.length > 0) {
      websocketService.subscribeToRFQUpdates(rfqIds);
    }
  }, [rfqIds]);

  return {
    rfqUpdates,
    lastUpdate,
    updateRFQStatus,
    subscribeToRFQ,
    unsubscribeFromRFQ
  };
}

// Hook for live collaboration features
export function useCollaboration(rfqId: string) {
  const [messages, setMessages] = useState<CollaborationMessage[]>([]);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [userStatus, setUserStatus] = useState<'active' | 'idle' | 'away'>('active');
  const typingTimeout = useRef<number | undefined>(undefined);

  const sendMessage = useCallback((message: string, metadata?: any) => {
    if (rfqId && message.trim()) {
      websocketService.sendCollaborationMessage(rfqId, message.trim(), metadata);
    }
  }, [rfqId]);

  const setTyping = useCallback((isTyping: boolean) => {
    if (rfqId) {
      websocketService.sendTypingIndicator(rfqId, isTyping);
      
      if (isTyping) {
        if (typingTimeout.current) {
          clearTimeout(typingTimeout.current);
        }
        typingTimeout.current = window.setTimeout(() => {
          websocketService.sendTypingIndicator(rfqId, false);
        }, 3000);
      }
    }
  }, [rfqId]);

  const updateUserStatus = useCallback((status: 'active' | 'idle' | 'away') => {
    if (rfqId) {
      setUserStatus(status);
      websocketService.setUserStatus(rfqId, status);
    }
  }, [rfqId]);

  useEffect(() => {
    if (rfqId) {
      websocketService.joinRFQ(rfqId);
    }

    return () => {
      if (rfqId) {
        websocketService.leaveRFQ(rfqId);
      }
      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current);
      }
    };
  }, [rfqId]);

  return {
    messages,
    activeUsers,
    typingUsers,
    userStatus,
    sendMessage,
    setTyping,
    updateUserStatus
  };
}

// Hook for notifications
export function useNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const markAsRead = useCallback((notificationId: string) => {
    websocketService.markNotificationAsRead(notificationId);
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    const unreadNotifications = notifications.filter(n => !n.read);
    unreadNotifications.forEach(n => websocketService.markNotificationAsRead(n.id));
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, [notifications]);

  useEffect(() => {
    websocketService.subscribeToNotifications(['all']);
  }, []);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead
  };
}

// Hook for compliance updates
export function useComplianceUpdates() {
  const [complianceUpdates, setComplianceUpdates] = useState<Record<string, ComplianceUpdate>>({});
  const [isChecking, setIsChecking] = useState<Record<string, boolean>>({});

  const requestComplianceCheck = useCallback((rfqId: string, specifications: any) => {
    setIsChecking(prev => ({ ...prev, [rfqId]: true }));
    websocketService.requestComplianceCheck(rfqId, specifications);
  }, []);

  const subscribeToCompliance = useCallback((rfqId: string) => {
    websocketService.subscribeToComplianceUpdates(rfqId);
  }, []);

  return {
    complianceUpdates,
    isChecking,
    requestComplianceCheck,
    subscribeToCompliance
  };
}
