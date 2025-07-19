import React, { createContext, useContext, useEffect, ReactNode, useCallback } from 'react';
import { useWebSocket, WebSocketMessage, WebSocketState } from "../hooks/useWebSocket";
import { useNotification } from "../hooks/useNotification";
import { useAuth } from "../contexts/AuthContext";

interface WebSocketContextType {
  connectionState: WebSocketState;
  isConnected: boolean;
  lastMessage: WebSocketMessage | null;
  sendMessage: (type: string, data: any) => void;
  subscribe: (channel: string) => void;
  unsubscribe: (channel: string) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within WebSocketProvider');
  }
  return context;
};

interface WebSocketProviderProps {
  children: ReactNode;
  url?: string;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children, url }) => {
  const { showInfo, showError } = useNotification();
  const { user } = useAuth();

  const handleMessage = useCallback((message: WebSocketMessage) => {
    console.log('Received WebSocket message:', message);
    
    // Handle different message types
    switch (message.type) {
      case 'notification':
        showInfo(message.data.message);
        break;
      case 'error':
        showError(message.data.message);
        break;
      case 'user_update':
        // Handle user-specific updates
        console.log('User update:', message.data);
        break;
      default:
        console.log('Unhandled message type:', message.type);
    }
  }, [showInfo, showError]);

  const {
    connectionState,
    isConnected,
    lastMessage,
    sendMessage: wsSendMessage,
    connect,
    disconnect
  } = useWebSocket(url, {
    onConnect: () => {
      console.log('WebSocket connected');
      showInfo('Real-time connection established');
    },
    onDisconnect: () => {
      console.log('WebSocket disconnected');
    },
    onMessage: handleMessage,
    onError: (error) => {
      console.error('WebSocket error:', error);
      showError('Connection error occurred');
    },
    reconnect: true,
    reconnectInterval: 3000,
    reconnectAttempts: 5
  });

  const sendMessage = useCallback((type: string, data: any) => {
    if (isConnected) {
      wsSendMessage({ type, data });
    } else {
      console.warn('Cannot send message: WebSocket not connected');
    }
  }, [isConnected, wsSendMessage]);

  const subscribe = useCallback((channel: string) => {
    sendMessage('subscribe', { channel });
  }, [sendMessage]);

  const unsubscribe = useCallback((channel: string) => {
    sendMessage('unsubscribe', { channel });
  }, [sendMessage]);

  // Auto-connect when user is authenticated
  useEffect(() => {
    if (user && url) {
      connect();
    } else {
      disconnect();
    }
  }, [user, url, connect, disconnect]);

  const contextValue: WebSocketContextType = {
    connectionState,
    isConnected,
    lastMessage,
    sendMessage,
    subscribe,
    unsubscribe
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};

export default WebSocketProvider;