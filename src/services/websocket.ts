// src/services/websocket.ts
import { io, Socket } from 'socket.io-client';

interface RFQUpdate {
  rfqId: string;
  field: string;
  value: any;
  userId: string;
  timestamp: string;
  complianceStatus: 'valid' | 'error' | 'warning';
}

interface NotificationData {
  type: 'rfq_update' | 'compliance_alert' | 'supplier_response';
  message: string;
  rfqId?: string;
  severity: 'info' | 'warning' | 'error';
}

class WebSocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();

  connect(userId: string) {
    this.socket = io('http://localhost:5000', {
      query: { userId }
    });

    this.socket.on('connect', () => {
      console.log('🔗 Connected to FoodXchange real-time system');
    });

    this.socket.on('rfq_updated', (data: RFQUpdate) => {
      this.emit('rfq_updated', data);
    });

    this.socket.on('compliance_alert', (data: NotificationData) => {
      this.emit('compliance_alert', data);
    });

    this.socket.on('supplier_response', (data: any) => {
      this.emit('supplier_response', data);
    });
  }

  // Real-time RFQ collaboration
  joinRFQRoom(rfqId: string) {
    if (this.socket) {
      this.socket.emit('join_rfq', rfqId);
      console.log(`📝 Joined RFQ room: ${rfqId}`);
    }
  }

  // Broadcast specification changes in real-time
  updateRFQField(
    rfqId: string, 
    field: string, 
    value: any, 
    complianceStatus: 'valid' | 'error' | 'warning'
  ) {
    if (this.socket) {
      const update: RFQUpdate = {
        rfqId,
        field,
        value,
        userId: 'current_user',
        timestamp: new Date().toISOString(),
        complianceStatus
      };

      this.socket.emit('rfq_field_update', update);

      // Show local notification for compliance issues
      if (complianceStatus === 'error') {
        this.showNotification({
          type: 'compliance_alert',
          message: `⚠️ Compliance error in ${rfqId}: Could prevent project failure`,
          severity: 'error',
          rfqId
        });
      }
    }
  }

  // Send compliance alerts to team
  sendComplianceAlert(rfqId: string, message: string, severity: 'warning' | 'error') {
    if (this.socket) {
      this.socket.emit('compliance_alert', {
        rfqId,
        message: `🚨 COMPLIANCE: ${message}`,
        severity,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Event subscription system
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }

  private emit(event: string, data: any) {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(callback => callback(data));
  }

  private showNotification(data: NotificationData) {
    // Browser notification for critical compliance issues
    if (Notification.permission === 'granted') {
      new Notification('FoodXchange Compliance Alert', {
        body: data.message,
        icon: '/favicon.ico'
      });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      console.log('🔌 Disconnected from real-time system');
    }
  }
}

export const websocketService = new WebSocketService();
export default websocketService;