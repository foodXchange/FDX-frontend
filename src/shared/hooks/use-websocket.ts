// File: /src/shared/hooks/use-websocket.ts

import { useState, useEffect, useCallback, useRef } from 'react';
import websocketService, { 
  RFQUpdate, 
  ComplianceUpdate, 
  CollaborationMessage, 
  ActiveUser 
} from '@shared/services/websocket-service';

interface UseWebSocketOptions {
  userId: string;
  autoConnect?: boolean;
  onError?: (error: any) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

interface WebSocketState {
  connectionState: 'disconnected' | 'connecting' | 'connected' | 'reconnecting';
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  queuedMessages: number;
}

export const useWebSocket = (options: UseWebSocketOptions) => {
  const [state, setState] = useState<WebSocketState>({
    connectionState: 'disconnected',
    isConnected: false,
    isConnecting: false,
    error: null,
    queuedMessages: 0
  });

  const optionsRef = useRef(options);
  optionsRef.current = options;

  const connect = useCallback(async () => {
    if (state.isConnected || state.isConnecting) return;

    try {
      setState(prev => ({ ...prev, isConnecting: true, error: null }));
      await websocketService.connect({ 
        userId: optionsRef.current.userId,
        token: localStorage.getItem('authToken') || undefined
      });
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Connection failed',
        isConnecting: false 
      }));
      optionsRef.current.onError?.(error);
    }
  }, [state.isConnected, state.isConnecting]);

  const disconnect = useCallback(() => {
    websocketService.disconnect();
  }, []);

  const retry = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
    connect();
  }, [connect]);

  useEffect(() => {
    const handleConnectionStateChange = (connectionState: string) => {
      setState(prev => ({
        ...prev,
        connectionState: connectionState as any,
        isConnected: connectionState === 'connected',
        isConnecting: connectionState === 'connecting',
        queuedMessages: websocketService.getQueuedMessageCount()
      }));
    };

    const handleConnected = () => {
      setState(prev => ({ ...prev, error: null, isConnecting: false }));
      optionsRef.current.onConnect?.();
    };

    const handleDisconnected = () => {
      setState(prev => ({ ...prev, isConnecting: false }));
      optionsRef.current.onDisconnect?.();
    };

    const handleError = (error: any) => {
      setState(prev => ({ 
        ...prev, 
        error: error.message || 'WebSocket error',
        isConnecting: false 
      }));
      optionsRef.current.onError?.(error);
    };

    // Subscribe to events
    websocketService.on('connectionStateChange', handleConnectionStateChange);
    websocketService.on('connected', handleConnected);
    websocketService.on('disconnected', handleDisconnected);
    websocketService.on('error', handleError);

    // Auto-connect if requested
    if (options.autoConnect && options.userId && !websocketService.isConnected()) {
      connect();
    }

    return () => {
      websocketService.off('connectionStateChange', handleConnectionStateChange);
      websocketService.off('connected', handleConnected);
      websocketService.off('disconnected', handleDisconnected);
      websocketService.off('error', handleError);
    };
  }, [options.autoConnect, options.userId, connect]);

  return {
    ...state,
    connect,
    disconnect,
    retry,
    service: websocketService
  };
};

// Hook for RFQ real-time updates
export const useRFQUpdates = (rfqIds: string[] = []) => {
  const [rfqUpdates, setRFQUpdates] = useState<Record<string, RFQUpdate>>({});
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  useEffect(() => {
    const handleRFQUpdate = (update: RFQUpdate) => {
      setRFQUpdates(prev => ({
        ...prev,
        [update.rfqId]: update
      }));
      setLastUpdate(new Date().toISOString());
    };

    websocketService.on('rfqUpdate', handleRFQUpdate);

    // Subscribe to RFQ updates
    if (rfqIds.length > 0) {
      websocketService.subscribeToRFQUpdates(rfqIds);
    }

    return () => {
      websocketService.off('rfqUpdate', handleRFQUpdate);
      if (rfqIds.length > 0) {
        websocketService.unsubscribeFromRFQUpdates(rfqIds);
      }
    };
  }, [rfqIds]);

  const updateRFQStatus = useCallback((rfqId: string, status: string, data?: any) => {
    websocketService.updateRFQStatus(rfqId, status, data);
  }, []);

  return {
    rfqUpdates,
    lastUpdate,
    updateRFQStatus,
    getUpdateForRFQ: (rfqId: string) => rfqUpdates[rfqId]
  };
};

// Hook for compliance real-time updates
export const useComplianceUpdates = (rfqId?: string) => {
  const [complianceUpdates, setComplianceUpdates] = useState<Record<string, ComplianceUpdate>>({});
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const handleComplianceUpdate = (update: ComplianceUpdate) => {
      setComplianceUpdates(prev => ({
        ...prev,
        [update.rfqId]: update
      }));
      setIsChecking(update.status === 'checking');
    };

    websocketService.on('complianceUpdate', handleComplianceUpdate);

    // Subscribe to compliance updates for specific RFQ
    if (rfqId) {
      websocketService.subscribeToComplianceUpdates(rfqId);
    }

    return () => {
      websocketService.off('complianceUpdate', handleComplianceUpdate);
    };
  }, [rfqId]);

  const requestComplianceCheck = useCallback((targetRfqId: string, specifications: any) => {
    setIsChecking(true);
    websocketService.requestComplianceCheck(targetRfqId, specifications);
  }, []);

  return {
    complianceUpdates,
    isChecking,
    requestComplianceCheck,
    getComplianceForRFQ: (targetRfqId: string) => complianceUpdates[targetRfqId]
  };
};

// Hook for collaboration features
export const useCollaboration = (rfqId: string) => {
  const [messages, setMessages] = useState<CollaborationMessage[]>([]);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    const handleCollaborationMessage = (message: CollaborationMessage) => {
      if (message.rfqId === rfqId) {
        setMessages(prev => [...prev, message].slice(-50)); // Keep last 50 messages
      }
    };

    const handleUserActivity = (user: ActiveUser) => {
      if (user.currentRfq === rfqId) {
        setActiveUsers(prev => {
          const filtered = prev.filter(u => u.userId !== user.userId);
          return [...filtered, user];
        });
      }
    };

    const handleTypingIndicator = (data: { rfqId: string; userId: string; isTyping: boolean }) => {
      if (data.rfqId === rfqId) {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          if (data.isTyping) {
            newSet.add(data.userId);
          } else {
            newSet.delete(data.userId);
          }
          return newSet;
        });
      }
    };

    websocketService.on('collaborationMessage', handleCollaborationMessage);
    websocketService.on('userActivity', handleUserActivity);
    websocketService.on('typingIndicator', handleTypingIndicator);

    // Join RFQ collaboration
    websocketService.joinRFQ(rfqId);

    return () => {
      websocketService.off('collaborationMessage', handleCollaborationMessage);
      websocketService.off('userActivity', handleUserActivity);
      websocketService.off('typingIndicator', handleTypingIndicator);
      websocketService.leaveRFQ(rfqId);
    };
  }, [rfqId]);

  const sendMessage = useCallback((message: string, metadata?: any) => {
    websocketService.sendCollaborationMessage(rfqId, message, metadata);
  }, [rfqId]);

  const setTyping = useCallback((isTyping: boolean) => {
    websocketService.sendTypingIndicator(rfqId, isTyping);
  }, [rfqId]);

  const setStatus = useCallback((status: 'active' | 'idle' | 'away') => {
    websocketService.setUserStatus(rfqId, status);
  }, [rfqId]);

  return {
    messages,
    activeUsers,
    typingUsers: Array.from(typingUsers),
    sendMessage,
    setTyping,
    setStatus
  };
};

// Hook for notifications
export const useNotifications = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const handleNotification = (notification: any) => {
      setNotifications(prev => [notification, ...prev].slice(0, 50)); // Keep last 50
      setUnreadCount(prev => prev + 1);
    };

    websocketService.on('notification', handleNotification);
    websocketService.subscribeToNotifications();

    return () => {
      websocketService.off('notification', handleNotification);
    };
  }, []);

  const markAsRead = useCallback((notificationId: string) => {
    websocketService.markNotificationAsRead(notificationId);
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  return {
    notifications,
    unreadCount,
    markAsRead,
    clearAll
  };
};