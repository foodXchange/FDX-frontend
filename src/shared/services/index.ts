// File: /src/shared/services/index.ts
// Shared services exports

// Import websocket service to ensure it's a module
import websocketServiceDefault from './websocket-service';

// WebSocket service
export { default as websocketService } from './websocket-service';
export type {
  WebSocketMessage,
  RFQUpdate,
  ComplianceUpdate,
  CollaborationMessage,
  ActiveUser,
  ConnectionOptions
} from './websocket-service';

// API client 
export const apiClient = {
  get: async (url: string) => {
    const response = await fetch(`${process.env.REACT_APP_API_URL}${url}`, {
      headers: {
        'Authorization': `Bearer ${serviceUtils.getAuthToken()}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },
  
  post: async (url: string, data: any) => {
    const response = await fetch(`${process.env.REACT_APP_API_URL}${url}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceUtils.getAuthToken()}`
      },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  put: async (url: string, data: any) => {
    const response = await fetch(`${process.env.REACT_APP_API_URL}${url}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceUtils.getAuthToken()}`
      },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  delete: async (url: string) => {
    const response = await fetch(`${process.env.REACT_APP_API_URL}${url}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${serviceUtils.getAuthToken()}`
      }
    });
    return response.json();
  }
};

// Service utilities
export const serviceUtils = {
  getAuthToken: (): string => {
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken') || '';
  },
  
  getUserInfo: () => {
    return {
      userId: localStorage.getItem('userId') || 'user_001',
      userName: localStorage.getItem('userName') || 'Anonymous User',
      email: localStorage.getItem('userEmail') || ''
    };
  },

  setAuthToken: (token: string) => {
    localStorage.setItem('authToken', token);
  },

  clearAuth: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
  }
};

// Export the websocket service instance for direct use
export default websocketServiceDefault;
