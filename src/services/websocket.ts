import { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';

interface WebSocketUpdate {
  field: string;
  value: any;
  complianceStatus: 'valid' | 'error' | 'warning';
  timestamp: string;
  userId: string;
}

interface ComplianceAlert {
  rfqId: string;
  message: string;
  severity: 'error' | 'warning' | 'success';
  timestamp: string;
}

class WebSocketService {
  private socket: Socket | null = null;
  private isConnected: boolean = false;
  private userId: string | null = null;
  private eventHandlers: Map<string, Function[]> = new Map();

  constructor() {
    this.eventHandlers = new Map();
  }

  connect(userId: string): void {
    if (this.isConnected) {
      console.log('WebSocket already connected');
      return;
    }

    this.userId = userId;
    
    this.socket = io('http://localhost:5000', {
      auth: {
        userId: userId,
        token: localStorage.getItem('authToken')
      },
      transports: ['websocket']
    });

    if (this.socket) {
      this.socket.on('connect', () => {
        this.isConnected = true;
        console.log('🔗 WebSocket connected for real-time collaboration');
        this.emit('user_connected', { userId, timestamp: new Date().toISOString() });
      });

      this.socket.on('disconnect', () => {
        this.isConnected = false;
        console.log('❌ WebSocket disconnected');
      });

      this.socket.on('error', (error: any) => {
        console.error('WebSocket error:', error);
      });

      this.setupEventListeners();
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.userId = null;
      console.log('WebSocket disconnected');
    }
  }

  joinRFQRoom(rfqId: string): void {
    if (!this.socket || !this.isConnected) {
      console.error('WebSocket not connected');
      return;
    }

    this.socket.emit('join_rfq_room', {
      rfqId,
      userId: this.userId,
      timestamp: new Date().toISOString()
    });

    console.log('📡 Joined RFQ collaboration room:', rfqId);
  }

  updateRFQField(rfqId: string, field: string, value: any, complianceStatus: 'valid' | 'error' | 'warning'): void {
    if (!this.socket || !this.isConnected) {
      console.error('WebSocket not connected - cannot broadcast field update');
      return;
    }

    const update: WebSocketUpdate = {
      field,
      value,
      complianceStatus,
      timestamp: new Date().toISOString(),
      userId: this.userId!
    };

    this.socket.emit('rfq_field_updated', {
      rfqId,
      update,
      broadcastToRoom: true
    });

    console.log('📡 Broadcasting field update:', field, '=', value, '(' + complianceStatus + ')');
  }

  sendComplianceAlert(rfqId: string, message: string, severity: 'error' | 'warning' | 'success'): void {
    if (!this.socket || !this.isConnected) {
      console.error('WebSocket not connected - cannot send compliance alert');
      return;
    }

    const alert: ComplianceAlert = {
      rfqId,
      message,
      severity,
      timestamp: new Date().toISOString()
    };

    this.socket.emit('compliance_alert', alert);

    console.log('🚨 Compliance alert sent:', message, '(' + severity + ')');
  }

  on(eventName: string, handler: Function): void {
    if (!this.eventHandlers.has(eventName)) {
      this.eventHandlers.set(eventName, []);
    }
    this.eventHandlers.get(eventName)!.push(handler);
  }

  off(eventName: string, handler: Function): void {
    const handlers = this.eventHandlers.get(eventName);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  private emit(eventName: string, data: any): void {
    const handlers = this.eventHandlers.get(eventName);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('rfq_updated', (data: any) => {
      this.emit('rfq_updated', data);
    });

    this.socket.on('compliance_alert_received', (alert: any) => {
      this.emit('compliance_alert', alert);
      
      if (alert.severity === 'error' && 'Notification' in window) {
        new Notification('FoodXchange Compliance Alert', {
          body: alert.message,
          icon: '/favicon.ico'
        });
      }
    });
  }

  isConnectedStatus(): boolean {
    return this.isConnected;
  }

  getCurrentUserId(): string | null {
    return this.userId;
  }
}

const websocketService = new WebSocketService();
export default websocketService;
