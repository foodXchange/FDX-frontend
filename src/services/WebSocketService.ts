import { EventEmitter } from 'events';

export interface WebSocketMessage {
  id?: string;
  type: string;
  data?: any;
  timestamp?: string;
  error?: string;
}

export interface WebSocketConfig {
  url: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
}

export class WebSocketService extends EventEmitter {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private messageQueue: WebSocketMessage[] = [];
  private isConnecting = false;

  constructor(config: WebSocketConfig) {
    super();
    this.config = {
      reconnectInterval: 5000,
      maxReconnectAttempts: 10,
      heartbeatInterval: 30000,
      ...config
    };
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      return;
    }

    this.isConnecting = true;
    console.log('WebSocket: Attempting to connect to', this.config.url);

    try {
      this.ws = new WebSocket(this.config.url);
      this.setupEventHandlers();
    } catch (error) {
      console.error('WebSocket: Failed to create connection', error);
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  private setupEventHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('WebSocket: Connected');
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      this.emit('connected');
      
      // Start heartbeat
      this.startHeartbeat();
      
      // Send queued messages
      this.flushMessageQueue();
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as WebSocketMessage;
        console.log('WebSocket: Message received', message.type);
        
        // Handle different message types
        switch (message.type) {
          case 'pong':
            // Heartbeat response
            break;
          case 'notification':
            this.emit('notification', message);
            break;
          case 'order_update':
            this.emit('order_update', message);
            break;
          case 'payment_update':
            this.emit('payment_update', message);
            break;
          case 'rfq_update':
            this.emit('rfq_update', message);
            break;
          case 'sample_tracking':
            this.emit('sample_tracking', message);
            break;
          default:
            this.emit('message', message);
        }
      } catch (error) {
        console.error('WebSocket: Failed to parse message', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket: Error', error);
      this.isConnecting = false;
      this.emit('error', error);
    };

    this.ws.onclose = (event) => {
      console.log('WebSocket: Disconnected', event.code, event.reason);
      this.isConnecting = false;
      this.ws = null;
      this.stopHeartbeat();
      this.emit('disconnected', event);
      
      // Attempt to reconnect if not a normal closure
      if (event.code !== 1000) {
        this.scheduleReconnect();
      }
    };
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= (this.config.maxReconnectAttempts || 10)) {
      console.error('WebSocket: Max reconnection attempts reached');
      this.emit('max_reconnect_attempts');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(
      this.config.reconnectInterval! * Math.pow(1.5, this.reconnectAttempts - 1),
      30000
    );

    console.log(`WebSocket: Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected()) {
        this.send({ type: 'ping' });
      }
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        this.send(message);
      }
    }
  }

  send(message: WebSocketMessage): void {
    if (!message.timestamp) {
      message.timestamp = new Date().toISOString();
    }

    if (this.isConnected()) {
      try {
        this.ws!.send(JSON.stringify(message));
        console.log('WebSocket: Message sent', message.type);
      } catch (error) {
        console.error('WebSocket: Failed to send message', error);
        this.messageQueue.push(message);
      }
    } else {
      // Queue message for later delivery
      this.messageQueue.push(message);
      console.log('WebSocket: Message queued (not connected)', message.type);
    }
  }

  subscribe(channels: string[]): void {
    this.send({
      type: 'subscribe',
      data: { channels }
    });
  }

  unsubscribe(channels: string[]): void {
    this.send({
      type: 'unsubscribe',
      data: { channels }
    });
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  disconnect(): void {
    console.log('WebSocket: Disconnecting');
    
    // Clear timers
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.stopHeartbeat();
    
    // Close connection
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    
    // Clear message queue
    this.messageQueue = [];
    this.reconnectAttempts = 0;
  }

  // Notification-specific methods
  sendNotificationRead(notificationId: string): void {
    this.send({
      type: 'notification_read',
      data: { notificationId }
    });
  }

  sendNotificationReadAll(notificationIds: string[]): void {
    this.send({
      type: 'notifications_read_all',
      data: { notificationIds }
    });
  }

  // Business event methods
  sendOrderUpdate(orderId: string, status: string, details?: any): void {
    this.send({
      type: 'order_update',
      data: {
        orderId,
        status,
        ...details
      }
    });
  }

  sendPaymentUpdate(paymentId: string, status: string, details?: any): void {
    this.send({
      type: 'payment_update',
      data: {
        paymentId,
        status,
        ...details
      }
    });
  }

  sendRfqUpdate(rfqId: string, status: string, details?: any): void {
    this.send({
      type: 'rfq_update',
      data: {
        rfqId,
        status,
        ...details
      }
    });
  }

  sendSampleTracking(sampleId: string, location: any, temperature?: number): void {
    this.send({
      type: 'sample_tracking',
      data: {
        sampleId,
        location,
        temperature,
        timestamp: new Date().toISOString()
      }
    });
  }
}

// Singleton instance
let webSocketInstance: WebSocketService | null = null;

export function getWebSocketService(config?: WebSocketConfig): WebSocketService {
  if (!webSocketInstance && config) {
    webSocketInstance = new WebSocketService(config);
  }
  
  if (!webSocketInstance) {
    throw new Error('WebSocket service not initialized. Please provide config.');
  }
  
  return webSocketInstance;
}

export function initializeWebSocket(config: WebSocketConfig): WebSocketService {
  if (webSocketInstance) {
    webSocketInstance.disconnect();
  }
  
  webSocketInstance = new WebSocketService(config);
  return webSocketInstance;
}

export default WebSocketService;