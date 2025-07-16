import { useEffect, useRef, useCallback, useState } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';

interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: string;
}

interface UseWebSocketOptions {
  url: string;
  reconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
  onMessage?: (message: WebSocketMessage) => void;
}

export const useWebSocket = (options: UseWebSocketOptions) => {
  const {
    url,
    reconnect = true,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
    onOpen,
    onClose,
    onError,
    onMessage,
  } = options;

  const { user } = useAuthContext();
  const ws = useRef<WebSocket | null>(null);
  const reconnectCount = useRef(0);
  const reconnectTimeout = useRef<NodeJS.Timeout>();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const connect = useCallback(() => {
    if (!user?.token) {
      setConnectionError('Authentication required');
      return;
    }

    try {
      // Add auth token to URL
      const wsUrl = new URL(url);
      wsUrl.searchParams.set('token', user.token);
      
      ws.current = new WebSocket(wsUrl.toString());

      ws.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setConnectionError(null);
        reconnectCount.current = 0;
        onOpen?.();
      };

      ws.current.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        onClose?.();

        // Attempt reconnection
        if (reconnect && reconnectCount.current < maxReconnectAttempts) {
          reconnectTimeout.current = setTimeout(() => {
            reconnectCount.current++;
            console.log(`Reconnecting... Attempt ${reconnectCount.current}`);
            connect();
          }, reconnectInterval);
        } else if (reconnectCount.current >= maxReconnectAttempts) {
          setConnectionError('Max reconnection attempts reached');
        }
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionError('Connection error');
        onError?.(error);
      };

      ws.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          onMessage?.(message);
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };
    } catch (err) {
      console.error('Failed to create WebSocket:', err);
      setConnectionError('Failed to establish connection');
    }
  }, [url, user?.token, reconnect, reconnectInterval, maxReconnectAttempts, onOpen, onClose, onError, onMessage]);

  const disconnect = useCallback(() => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
    }
    
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
    
    setIsConnected(false);
  }, []);

  const sendMessage = useCallback((type: string, payload: any) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected');
      return false;
    }

    try {
      const message: WebSocketMessage = {
        type,
        payload,
        timestamp: new Date().toISOString(),
      };
      
      ws.current.send(JSON.stringify(message));
      return true;
    } catch (err) {
      console.error('Failed to send WebSocket message:', err);
      return false;
    }
  }, []);

  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    connectionError,
    sendMessage,
    reconnect: connect,
    disconnect,
  };
};

// Specialized hook for collaboration real-time updates
export const useCollaborationWebSocket = (collaborationId: string) => {
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  
  const handleMessage = useCallback((message: WebSocketMessage) => {
    switch (message.type) {
      case 'user_typing':
        setTypingUsers(prev => new Set(prev).add(message.payload.userId));
        setTimeout(() => {
          setTypingUsers(prev => {
            const next = new Set(prev);
            next.delete(message.payload.userId);
            return next;
          });
        }, 3000);
        break;
        
      case 'user_online':
        setOnlineUsers(prev => new Set(prev).add(message.payload.userId));
        break;
        
      case 'user_offline':
        setOnlineUsers(prev => {
          const next = new Set(prev);
          next.delete(message.payload.userId);
          return next;
        });
        break;
        
      case 'new_message':
      case 'document_uploaded':
      case 'deliverable_updated':
        // These would trigger data refetch in the collaboration hook
        break;
    }
  }, []);

  const { isConnected, sendMessage } = useWebSocket({
    url: `${process.env.REACT_APP_WS_URL}/collaborations/${collaborationId}`,
    onMessage: handleMessage,
  });

  const sendTypingIndicator = useCallback(() => {
    sendMessage('typing', { collaborationId });
  }, [sendMessage, collaborationId]);

  return {
    isConnected,
    typingUsers: Array.from(typingUsers),
    onlineUsers: Array.from(onlineUsers),
    sendTypingIndicator,
  };
};