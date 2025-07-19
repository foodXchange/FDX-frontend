import { getWebSocketService, WebSocketService } from './WebSocketService';
import { Notification } from '../components/RealTimeNotifications';

export interface NotificationConfig {
  enableSound?: boolean;
  enableBrowserNotifications?: boolean;
  enableToast?: boolean;
  persistToLocalStorage?: boolean;
}

export class NotificationService {
  private static instance: NotificationService;
  private ws: WebSocketService | null = null;
  private config: NotificationConfig;
  private listeners: Map<string, Set<(notification: Notification) => void>> = new Map();

  private constructor(config: NotificationConfig = {}) {
    this.config = {
      enableSound: true,
      enableBrowserNotifications: true,
      enableToast: true,
      persistToLocalStorage: true,
      ...config
    };

    // Request browser notification permission
    if (this.config.enableBrowserNotifications && 'Notification' in window) {
      Notification.requestPermission();
    }
  }

  static getInstance(config?: NotificationConfig): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService(config);
    }
    return NotificationService.instance;
  }

  initialize(wsService: WebSocketService): void {
    this.ws = wsService;
    
    // Listen for notifications from WebSocket
    this.ws.on('notification', (message) => {
      this.handleNotification(message.data);
    });

    // Listen for business events and convert to notifications
    this.setupBusinessEventListeners();
  }

  private setupBusinessEventListeners(): void {
    if (!this.ws) return;

    // Order updates
    this.ws.on('order_update', (message) => {
      const notification: Notification = {
        id: `order-${Date.now()}`,
        type: this.getTypeFromStatus(message.data.status),
        category: 'order',
        title: 'Order Update',
        message: `Order ${message.data.orderId} status changed to ${message.data.status}`,
        timestamp: new Date().toISOString(),
        read: false,
        actionUrl: `/orders/${message.data.orderId}`,
        metadata: message.data
      };
      this.emit(notification);
    });

    // Payment updates
    this.ws.on('payment_update', (message) => {
      const notification: Notification = {
        id: `payment-${Date.now()}`,
        type: this.getTypeFromStatus(message.data.status),
        category: 'payment',
        title: 'Payment Update',
        message: `Payment ${message.data.paymentId} ${message.data.status}`,
        timestamp: new Date().toISOString(),
        read: false,
        actionUrl: `/payments/${message.data.paymentId}`,
        metadata: message.data
      };
      this.emit(notification);
    });

    // RFQ updates
    this.ws.on('rfq_update', (message) => {
      const notification: Notification = {
        id: `rfq-${Date.now()}`,
        type: 'info',
        category: 'rfq',
        title: 'RFQ Update',
        message: `RFQ ${message.data.rfqId} has been ${message.data.status}`,
        timestamp: new Date().toISOString(),
        read: false,
        actionUrl: `/rfqs/${message.data.rfqId}`,
        metadata: message.data
      };
      this.emit(notification);
    });

    // Sample tracking updates
    this.ws.on('sample_tracking', (message) => {
      const notification: Notification = {
        id: `sample-${Date.now()}`,
        type: message.data.temperature && (message.data.temperature < 2 || message.data.temperature > 8) ? 'warning' : 'info',
        category: 'sample',
        title: 'Sample Tracking Update',
        message: `Sample ${message.data.sampleId} location updated`,
        timestamp: new Date().toISOString(),
        read: false,
        actionUrl: `/samples/${message.data.sampleId}`,
        metadata: message.data
      };
      this.emit(notification);
    });
  }

  private getTypeFromStatus(status: string): 'info' | 'success' | 'warning' | 'error' {
    const successStatuses = ['completed', 'approved', 'paid', 'delivered'];
    const warningStatuses = ['pending', 'processing', 'overdue'];
    const errorStatuses = ['failed', 'rejected', 'cancelled'];

    if (successStatuses.includes(status.toLowerCase())) return 'success';
    if (warningStatuses.includes(status.toLowerCase())) return 'warning';
    if (errorStatuses.includes(status.toLowerCase())) return 'error';
    return 'info';
  }

  private handleNotification(data: any): void {
    const notification: Notification = {
      id: data.id || `notif-${Date.now()}`,
      type: data.type || 'info',
      category: data.category || 'system',
      title: data.title,
      message: data.message,
      timestamp: data.timestamp || new Date().toISOString(),
      read: false,
      actionUrl: data.actionUrl,
      metadata: data.metadata
    };

    this.emit(notification);
  }

  private emit(notification: Notification): void {
    // Emit to all listeners
    this.listeners.forEach((callbacks) => {
      callbacks.forEach(callback => callback(notification));
    });

    // Persist to localStorage if enabled
    if (this.config.persistToLocalStorage) {
      this.saveNotification(notification);
    }
  }

  // Subscribe to notifications
  subscribe(category: string, callback: (notification: Notification) => void): () => void {
    if (!this.listeners.has(category)) {
      this.listeners.set(category, new Set());
    }
    
    this.listeners.get(category)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(category)?.delete(callback);
    };
  }

  // Create notifications programmatically
  createNotification(notification: Partial<Notification>): void {
    const fullNotification: Notification = {
      id: notification.id || `notif-${Date.now()}`,
      type: notification.type || 'info',
      category: notification.category || 'system',
      title: notification.title || 'Notification',
      message: notification.message || '',
      timestamp: notification.timestamp || new Date().toISOString(),
      read: notification.read || false,
      actionUrl: notification.actionUrl,
      metadata: notification.metadata
    };

    this.emit(fullNotification);

    // Send to server if connected
    if (this.ws?.isConnected()) {
      this.ws.send({
        type: 'notification_created',
        data: fullNotification
      });
    }
  }

  // Business-specific notification creators
  notifyOrderCreated(orderId: string, orderNumber: string): void {
    this.createNotification({
      type: 'success',
      category: 'order',
      title: 'Order Created',
      message: `Order ${orderNumber} has been created successfully`,
      actionUrl: `/orders/${orderId}`,
      metadata: { orderId, orderNumber }
    });
  }

  notifyPaymentReceived(paymentId: string, amount: number, currency: string): void {
    this.createNotification({
      type: 'success',
      category: 'payment',
      title: 'Payment Received',
      message: `Payment of ${currency} ${amount.toLocaleString()} has been received`,
      actionUrl: `/payments/${paymentId}`,
      metadata: { paymentId, amount, currency }
    });
  }

  notifyInvoiceOverdue(invoiceId: string, invoiceNumber: string, daysOverdue: number): void {
    this.createNotification({
      type: 'warning',
      category: 'invoice',
      title: 'Invoice Overdue',
      message: `Invoice ${invoiceNumber} is ${daysOverdue} days overdue`,
      actionUrl: `/invoices/${invoiceId}`,
      metadata: { invoiceId, invoiceNumber, daysOverdue }
    });
  }

  notifyRfqResponse(rfqId: string, supplierName: string): void {
    this.createNotification({
      type: 'info',
      category: 'rfq',
      title: 'New RFQ Response',
      message: `${supplierName} has responded to your RFQ`,
      actionUrl: `/rfqs/${rfqId}`,
      metadata: { rfqId, supplierName }
    });
  }

  notifySampleDelivered(sampleId: string, sampleNumber: string): void {
    this.createNotification({
      type: 'success',
      category: 'sample',
      title: 'Sample Delivered',
      message: `Sample ${sampleNumber} has been delivered`,
      actionUrl: `/samples/${sampleId}`,
      metadata: { sampleId, sampleNumber }
    });
  }

  notifyComplianceAlert(complianceId: string, issue: string, severity: 'low' | 'medium' | 'high' | 'critical'): void {
    this.createNotification({
      type: severity === 'critical' || severity === 'high' ? 'error' : 'warning',
      category: 'compliance',
      title: 'Compliance Alert',
      message: issue,
      actionUrl: `/compliance/${complianceId}`,
      metadata: { complianceId, issue, severity }
    });
  }

  // Local storage management
  private saveNotification(notification: Notification): void {
    try {
      const stored = localStorage.getItem('notifications');
      const notifications: Notification[] = stored ? JSON.parse(stored) : [];
      
      // Add new notification at the beginning
      notifications.unshift(notification);
      
      // Keep only last 100 notifications
      if (notifications.length > 100) {
        notifications.splice(100);
      }
      
      localStorage.setItem('notifications', JSON.stringify(notifications));
    } catch (error) {
      console.error('Failed to save notification to localStorage:', error);
    }
  }

  getStoredNotifications(): Notification[] {
    try {
      const stored = localStorage.getItem('notifications');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load notifications from localStorage:', error);
      return [];
    }
  }

  clearStoredNotifications(): void {
    localStorage.removeItem('notifications');
  }

  // Mark notifications as read
  markAsRead(notificationId: string): void {
    if (this.ws?.isConnected()) {
      this.ws.sendNotificationRead(notificationId);
    }
    
    // Update localStorage
    try {
      const stored = localStorage.getItem('notifications');
      if (stored) {
        const notifications: Notification[] = JSON.parse(stored);
        const updated = notifications.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        );
        localStorage.setItem('notifications', JSON.stringify(updated));
      }
    } catch (error) {
      console.error('Failed to update notification read status:', error);
    }
  }

  markAllAsRead(notificationIds: string[]): void {
    if (this.ws?.isConnected()) {
      this.ws.sendNotificationReadAll(notificationIds);
    }
    
    // Update localStorage
    try {
      const stored = localStorage.getItem('notifications');
      if (stored) {
        const notifications: Notification[] = JSON.parse(stored);
        const updated = notifications.map(n => 
          notificationIds.includes(n.id) ? { ...n, read: true } : n
        );
        localStorage.setItem('notifications', JSON.stringify(updated));
      }
    } catch (error) {
      console.error('Failed to update notifications read status:', error);
    }
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();

export default NotificationService;