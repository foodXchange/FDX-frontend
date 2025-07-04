// File: C:\Users\foodz\Documents\GitHub\Development\FDX-frontend\src\contexts\WebSocketContext.js

import React, { createContext, useContext, useState, useEffect } from 'react';

const WebSocketContext = createContext();

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Mock WebSocket connection
    const mockSocket = {
      on: (event, callback) => {
        console.log(`Listening for ${event}`);
      },
      off: (event, callback) => {
        console.log(`Stopped listening for ${event}`);
      },
      emit: (event, data) => {
        console.log(`Emitting ${event}:`, data);
      }
    };

    setSocket(mockSocket);
    setIsConnected(true);

    return () => {
      setIsConnected(false);
    };
  }, []);

  const value = {
    socket,
    isConnected
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};