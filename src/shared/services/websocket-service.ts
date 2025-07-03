// File: /src/shared/services/websocket-service.ts
import { EventEmitter } from 'events';

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
  issues: ComplianceIssue[];
  status: 'compliant' | 'non_compliant' | 'pending' | 'checking';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface ComplianceIssue {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  field?: string;
  suggestion?: string;
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

class FoodXchangeWebSocketService extends EventEmitter {
  private ws: WebSocket | null = null;
  private connectionState: 'disconnected' | 'connecting' | 'connected' | 'reconnecting' = 'disconnected';
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private messageQueue: WebSocketMessage[] = [];
  private connectionOptions: ConnectionOptions | null = null;

  constructor(private baseUrl: string = process.env.REACT_APP_WS_URL || 'ws://localhost:3001') {
    super();
    this.setMaxListeners(50);
  }

  async connect(options: ConnectionOptions): Promise<void> {
    this.connectionOptions = options;
    return new Promise((resolve, reject) => {
      if (this.connectionState === 'connected') {
        resolve();
        return;
      }

      this.connectionState = 'connecting';
      this.emit('connectionStateChange', 'connecting');

      try {
        const wsUrl = `${this.baseUrl}/ws?userId=${options.userId}&token=${options.token || this.getAuthToken()}`;
        this.ws = new WebSocket(wsUrl);

        const connectionTimeout = setTimeout(() => {
          if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
            this.ws.close();
            reject(new Error('Connection timeout'));
          }
        }, 10000);

        this.ws.onopen = () => {
          clearTimeout(connectionTimeout);
          console.log('FoodXchange WebSocket connected');
          this.connectionState = 'connected';
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          this.processMessageQueue();
          this.emit('connected', { userId: options.userId });
          this.emit('connectionStateChange', 'connected');
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleIncomingMessage(message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
            this.emit('error', { type: 'parse_error', error });
          }
        };

        this.ws.onerror = (error) => {
          clearTimeout(connectionTimeout);
          console.error('WebSocket error:', error);
          this.emit('error', { type: 'connection_error', error });
        };

        this.ws.onclose = (event) => {
          clearTimeout(connectionTimeout);
          console.log('WebSocket disconnected:', event.code, event.reason);
          this.connectionState = 'disconnected';
          this.stopHeartbeat();
          this.emit('disconnected', { code: event.code, reason: event.reason });
          this.emit('connectionStateChange', 'disconnected');

          if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect();
          }
        };

      } catch (error) {
        this.connectionState = 'disconnected';
        this.emit('connectionStateChange', 'disconnected');
        console.error('WebSocket connection failed:', error);
        reject(error);
      }
    });
  }

  disconnect(): void {
    this.stopHeartbeat();
    this.clearReconnectTimeout();
    if (this.ws) {
      this.ws.close(1000, 'User disconnected');
      this.ws = null;
    }
    this.connectionState = 'disconnected';
    this.emit('connectionStateChange', 'disconnected');
    this.messageQueue = [];
  }

  private handleIncomingMessage(message: WebSocketMessage): void {
    console.log('WebSocket message received:', message.type);

    switch (message.type) {
      case 'rfq_update':
        this.emit('rfqUpdate', message.payload as RFQUpdate);
        break;
      case 'compliance_update':
        this.emit('complianceUpdate', message.payload as ComplianceUpdate);
        break;
      case 'collaboration_message':
        this.emit('collaborationMessage', message.payload as CollaborationMessage);
        break;
      case 'user_activity':
        this.emit('userActivity', message.payload as ActiveUser);
        break;
      case 'notification':
        this.emit('notification', {
          id: message.messageId || Date.now().toString(),
          title: message.payload.title,
          message: message.payload.message,
          type: message.payload.type || 'info',
          timestamp: message.timestamp,
          rfqId: message.rfqId
        });
        break;
      case 'heartbeat_ack':
        break;
      case 'error':
        this.emit('serverError', message.payload);
        break;
      default:
        console.warn('Unknown message type:', message.type);
        this.emit('unknownMessage', message);
    }
  }

  private sendMessage(type: string, payload: any, targetRfqId?: string): void {
    const message: WebSocketMessage = {
      type,
      payload,
      timestamp: new Date().toISOString(),
      userId: this.connectionOptions?.userId,
      rfqId: targetRfqId,
      messageId: this.generateMessageId()
    };

    if (this.isConnected()) {
      this.ws!.send(JSON.stringify(message));
    } else {
      this.messageQueue.push(message);
      console.warn('WebSocket not connected, message queued:', type);
    }
  }

  // RFQ Methods
  joinRFQ(rfqId: string): void {
    this.sendMessage('join_rfq', { rfqId });
    this.emit('joinedRFQ', rfqId);
  }

  leaveRFQ(rfqId: string): void {
    this.sendMessage('leave_rfq', { rfqId });
    this.emit('leftRFQ', rfqId);
  }

  updateRFQStatus(rfqId: string, status: string, data?: any): void {
    this.sendMessage('rfq_status_update', {
      rfqId,
      status,
      data,
      timestamp: new Date().toISOString()
    });
  }

  subscribeToRFQUpdates(rfqIds: string[]): void {
    this.sendMessage('subscribe_rfqs', { rfqIds });
  }

  unsubscribeFromRFQUpdates(rfqIds: string[]): void {
    this.sendMessage('unsubscribe_rfqs', { rfqIds });
  }

  // Collaboration Methods
  sendCollaborationMessage(rfqId: string, message: string, metadata?: any): void {
    this.sendMessage('collaboration_message', {
      rfqId,
      message,
      metadata,
      userName: this.getCurrentUserName()
    });
  }

  setUserStatus(rfqId: string, status: 'active' | 'idle' | 'away'): void {
    this.sendMessage('user_status', { rfqId, status });
  }

  sendTypingIndicator(rfqId: string, isTyping: boolean): void {
    this.sendMessage('typing_indicator', { rfqId, isTyping });
  }

  // Compliance Methods
  requestComplianceCheck(rfqId: string, specifications: any): void {
    this.sendMessage('compliance_check_request', {
      rfqId,
      specifications,
      priority: 'normal'
    });
  }

  subscribeToComplianceUpdates(rfqId: string): void {
    this.sendMessage('subscribe_compliance', { rfqId });
  }

  // Notification Methods
  markNotificationAsRead(notificationId: string): void {
    this.sendMessage('notification_read', { notificationId });
  }

  subscribeToNotifications(types: string[] = ['all']): void {
    this.sendMessage('subscribe_notifications', { types });
  }

  // Private utility methods
  private startHeartbeat(): void {
    const interval = this.connectionOptions?.heartbeatInterval || 30000;
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected()) {
        this.sendMessage('heartbeat', { timestamp: Date.now() });
      }
    }, interval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.emit('maxReconnectAttemptsReached');
      return;
    }

    this.reconnectAttempts++;
    this.connectionState = 'reconnecting';
    this.emit('connectionStateChange', 'reconnecting');

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts - 1), 30000);
    console.log(`Attempting reconnect ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);

    this.reconnectTimeout = setTimeout(() => {
      if (this.connectionOptions) {
        this.connect(this.connectionOptions).catch(error => {
          console.error('Reconnection failed:', error);
          this.scheduleReconnect();
        });
      }
    }, delay);
  }

  private clearReconnectTimeout(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  private processMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.isConnected()) {
      const message = this.messageQueue.shift();
      if (message) {
        this.ws!.send(JSON.stringify(message));
      }
    }
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  getConnectionState(): string {
    return this.connectionState;
  }

  getQueuedMessageCount(): number {
    return this.messageQueue.length;
  }

  private getAuthToken(): string {
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken') || '';
  }

  private getCurrentUserName(): string {
    return localStorage.getItem('userName') || 'Anonymous User';
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  destroy(): void {
    this.disconnect();
    this.removeAllListeners();
  }

  getStats(): any {
    return {
      connectionState: this.connectionState,
      reconnectAttempts: this.reconnectAttempts,
      queuedMessages: this.messageQueue.length,
      listenerCount: this.listenerCount('rfqUpdate'),
      isConnected: this.isConnected()
    };
  }
}

export const websocketService = new FoodXchangeWebSocketService();

export default websocketService;
export type {
  WebSocketMessage,
  RFQUpdate,
  ComplianceUpdate,
  CollaborationMessage,
  ActiveUser,
  ConnectionOptions
};
