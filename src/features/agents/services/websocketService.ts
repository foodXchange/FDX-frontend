import React, { useEffect } from 'react';
import { Lead, AgentNotification, AgentTask, WhatsAppMessage } from '../types';

interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
}

interface WebSocketEventHandlers {
  onLeadUpdate?: (lead: Lead) => void;
  onLeadStatusChange?: (leadId: string, status: string) => void;
  onNewNotification?: (notification: AgentNotification) => void;
  onTaskUpdate?: (task: AgentTask) => void;
  onWhatsAppMessage?: (message: WhatsAppMessage) => void;
  onAgentOnlineStatus?: (agentId: string, isOnline: boolean) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

export class WebSocketService {
  private socket: WebSocket | null = null;
  private handlers: WebSocketEventHandlers = {};
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private isConnected = false;
  private agentId: string | null = null;
  private url: string;

  constructor(url?: string) {
    this.url = url || process.env.REACT_APP_WS_URL || 'ws://localhost:3001';
  }

  connect(agentId: string): void {
    this.agentId = agentId;
    
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.disconnect();
    }

    try {
      const token = localStorage.getItem('authToken');
      const wsUrl = `${this.url}/ws?token=${token}&agentId=${agentId}`;
      
      this.socket = new WebSocket(wsUrl);
      
      this.socket.onopen = this.handleOpen.bind(this);
      this.socket.onmessage = this.handleMessage.bind(this);
      this.socket.onclose = this.handleClose.bind(this);
      this.socket.onerror = this.handleError.bind(this);
      
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.handleError(error as Event);
    }
  }

  disconnect(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    
    this.isConnected = false;
    this.reconnectAttempts = 0;
  }

  private handleOpen(): void {
    console.log('WebSocket connected');
    this.isConnected = true;
    this.reconnectAttempts = 0;
    
    // Start heartbeat
    this.startHeartbeat();
    
    // Send authentication message
    this.send({
      type: 'authenticate',
      data: {
        agentId: this.agentId,
        timestamp: new Date().toISOString(),
      },
    });
    
    if (this.handlers.onConnect) {
      this.handlers.onConnect();
    }
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      
      switch (message.type) {
        case 'lead_update':
          if (this.handlers.onLeadUpdate) {
            this.handlers.onLeadUpdate(message.data);
          }
          break;
          
        case 'lead_status_change':
          if (this.handlers.onLeadStatusChange) {
            this.handlers.onLeadStatusChange(message.data.leadId, message.data.status);
          }
          break;
          
        case 'new_notification':
          if (this.handlers.onNewNotification) {
            this.handlers.onNewNotification(message.data);
          }
          break;
          
        case 'task_update':
          if (this.handlers.onTaskUpdate) {
            this.handlers.onTaskUpdate(message.data);
          }
          break;
          
        case 'whatsapp_message':
          if (this.handlers.onWhatsAppMessage) {
            this.handlers.onWhatsAppMessage(message.data);
          }
          break;
          
        case 'agent_online_status':
          if (this.handlers.onAgentOnlineStatus) {
            this.handlers.onAgentOnlineStatus(message.data.agentId, message.data.isOnline);
          }
          break;
          
        case 'pong':
          // Heartbeat response
          break;
          
        default:
          console.warn('Unknown WebSocket message type:', message.type);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }

  private handleClose(event: CloseEvent): void {
    console.log('WebSocket disconnected:', event.code, event.reason);
    this.isConnected = false;
    
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    
    if (this.handlers.onDisconnect) {
      this.handlers.onDisconnect();
    }
    
    // Attempt to reconnect if not manually closed
    if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
      this.attemptReconnect();
    }
  }

  private handleError(event: Event): void {
    console.error('WebSocket error:', event);
    
    if (this.handlers.onError) {
      this.handlers.onError(new Error('WebSocket connection error'));
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }
    
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      if (this.agentId) {
        this.connect(this.agentId);
      }
    }, delay);
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected) {
        this.send({
          type: 'ping',
          data: {},
        });
      }
    }, 30000); // Send heartbeat every 30 seconds
  }

  private send(message: Omit<WebSocketMessage, 'timestamp'>): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        ...message,
        timestamp: new Date().toISOString(),
      }));
    }
  }

  // Public methods to set event handlers
  setHandlers(handlers: WebSocketEventHandlers): void {
    this.handlers = { ...this.handlers, ...handlers };
  }

  // Public methods to send messages
  sendLeadUpdate(leadId: string, updates: Partial<Lead>): void {
    this.send({
      type: 'update_lead',
      data: { leadId, updates },
    });
  }

  sendTypingIndicator(leadId: string, isTyping: boolean): void {
    this.send({
      type: 'typing_indicator',
      data: { leadId, isTyping },
    });
  }

  sendAgentStatusUpdate(status: 'online' | 'away' | 'busy'): void {
    this.send({
      type: 'agent_status_update',
      data: { status },
    });
  }

  // Utility methods
  isConnectedToServer(): boolean {
    return this.isConnected;
  }

  getConnectionState(): string {
    if (!this.socket) return 'disconnected';
    
    switch (this.socket.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'connected';
      case WebSocket.CLOSING:
        return 'closing';
      case WebSocket.CLOSED:
        return 'closed';
      default:
        return 'unknown';
    }
  }
}

// Create and export singleton instance
export const websocketService = new WebSocketService();

// Import React for hooks

// React hook for using WebSocket in components
export const useWebSocket = (agentId: string | null, handlers: WebSocketEventHandlers) => {
  React.useEffect(() => {
    if (!agentId) return;
    
    websocketService.setHandlers(handlers);
    websocketService.connect(agentId);
    
    return () => {
      websocketService.disconnect();
    };
  }, [agentId]);
  
  return {
    isConnected: websocketService.isConnectedToServer(),
    connectionState: websocketService.getConnectionState(),
    sendLeadUpdate: websocketService.sendLeadUpdate.bind(websocketService),
    sendTypingIndicator: websocketService.sendTypingIndicator.bind(websocketService),
    sendAgentStatusUpdate: websocketService.sendAgentStatusUpdate.bind(websocketService),
  };
};

// Types for better TypeScript support
export type { WebSocketMessage, WebSocketEventHandlers };