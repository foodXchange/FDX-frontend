import { apiClient } from '../api-client';
import {
  Order,
  OrderStatus,
  CreateOrderRequest,
  UpdateOrderRequest,
  OrderSearchFilters,
  OrderSummary,
  OrderDocument,
  CommunicationThread,
  PaymentTransaction
} from '../../types/order';

export class OrderService {
  private static baseUrl = '/api/orders';

  // Create new order
  static async createOrder(request: CreateOrderRequest): Promise<Order> {
    try {
      const response = await apiClient.post<{ order: Order }>(`${this.baseUrl}`, request);
      this.logOrderEvent(response.order.id, 'ORDER_CREATED', 'Order created successfully');
      return response.order;
    } catch (error) {
      throw this.handleOrderError(error, 'Failed to create order');
    }
  }

  // Get order by ID
  static async getOrder(orderId: string): Promise<Order> {
    try {
      const response = await apiClient.get<{ order: Order }>(`${this.baseUrl}/${orderId}`);
      return response.order;
    } catch (error) {
      throw this.handleOrderError(error, `Failed to fetch order ${orderId}`);
    }
  }

  // Update order
  static async updateOrder(orderId: string, updates: UpdateOrderRequest): Promise<Order> {
    try {
      const response = await apiClient.put<{ order: Order }>(`${this.baseUrl}/${orderId}`, updates);
      
      if (updates.status) {
        this.logOrderEvent(orderId, 'STATUS_CHANGED', `Order status changed to ${updates.status}`);
      }
      
      return response.order;
    } catch (error) {
      throw this.handleOrderError(error, `Failed to update order ${orderId}`);
    }
  }

  // Search orders with filters
  static async searchOrders(
    filters: OrderSearchFilters = {},
    page = 1,
    limit = 20
  ): Promise<{ orders: Order[]; total: number; pages: number }> {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...this.buildFilterParams(filters)
      });

      const response = await apiClient.get<{
        orders: Order[];
        total: number;
        pages: number;
      }>(`${this.baseUrl}?${queryParams}`);

      return response;
    } catch (error) {
      throw this.handleOrderError(error, 'Failed to search orders');
    }
  }

  // Get order summary statistics
  static async getOrderSummary(
    dateRange?: { start: string; end: string }
  ): Promise<OrderSummary> {
    try {
      const params = dateRange ? `?start=${dateRange.start}&end=${dateRange.end}` : '';
      const response = await apiClient.get<{ summary: OrderSummary }>(`${this.baseUrl}/summary${params}`);
      return response.summary;
    } catch (error) {
      throw this.handleOrderError(error, 'Failed to fetch order summary');
    }
  }

  // Cancel order
  static async cancelOrder(orderId: string, reason: string): Promise<Order> {
    try {
      const response = await apiClient.post<{ order: Order }>(`${this.baseUrl}/${orderId}/cancel`, {
        reason
      });
      
      this.logOrderEvent(orderId, 'ORDER_CANCELLED', `Order cancelled: ${reason}`);
      return response.order;
    } catch (error) {
      throw this.handleOrderError(error, `Failed to cancel order ${orderId}`);
    }
  }

  // Approve order
  static async approveOrder(orderId: string, approverNotes?: string): Promise<Order> {
    try {
      const response = await apiClient.post<{ order: Order }>(`${this.baseUrl}/${orderId}/approve`, {
        notes: approverNotes
      });
      
      this.logOrderEvent(orderId, 'ORDER_APPROVED', 'Order approved');
      return response.order;
    } catch (error) {
      throw this.handleOrderError(error, `Failed to approve order ${orderId}`);
    }
  }

  // Confirm order (supplier confirmation)
  static async confirmOrder(orderId: string, estimatedDeliveryDate: string): Promise<Order> {
    try {
      const response = await apiClient.post<{ order: Order }>(`${this.baseUrl}/${orderId}/confirm`, {
        estimatedDeliveryDate
      });
      
      this.logOrderEvent(orderId, 'ORDER_CONFIRMED', `Order confirmed with delivery date: ${estimatedDeliveryDate}`);
      return response.order;
    } catch (error) {
      throw this.handleOrderError(error, `Failed to confirm order ${orderId}`);
    }
  }

  // Update order status
  static async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    notes?: string
  ): Promise<Order> {
    try {
      const response = await apiClient.post<{ order: Order }>(`${this.baseUrl}/${orderId}/status`, {
        status,
        notes
      });
      
      this.logOrderEvent(orderId, 'STATUS_UPDATED', `Status updated to ${status}`);
      return response.order;
    } catch (error) {
      throw this.handleOrderError(error, `Failed to update order status ${orderId}`);
    }
  }

  // Upload order document
  static async uploadDocument(
    orderId: string,
    file: File,
    documentType: string
  ): Promise<OrderDocument> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', documentType);

      const response = await apiClient.post<{ document: OrderDocument }>(
        `${this.baseUrl}/${orderId}/documents`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      this.logOrderEvent(orderId, 'DOCUMENT_UPLOADED', `Document uploaded: ${file.name}`);
      return response.document;
    } catch (error) {
      throw this.handleOrderError(error, 'Failed to upload document');
    }
  }

  // Get order documents
  static async getOrderDocuments(orderId: string): Promise<OrderDocument[]> {
    try {
      const response = await apiClient.get<{ documents: OrderDocument[] }>(`${this.baseUrl}/${orderId}/documents`);
      return response.documents;
    } catch (error) {
      throw this.handleOrderError(error, `Failed to fetch documents for order ${orderId}`);
    }
  }

  // Add communication to order
  static async addCommunication(
    orderId: string,
    message: string,
    recipients: string[],
    subject?: string
  ): Promise<CommunicationThread> {
    try {
      const response = await apiClient.post<{ communication: CommunicationThread }>(
        `${this.baseUrl}/${orderId}/communications`,
        {
          message,
          recipients,
          subject
        }
      );

      this.logOrderEvent(orderId, 'MESSAGE_SENT', `Message sent to ${recipients.join(', ')}`);
      return response.communication;
    } catch (error) {
      throw this.handleOrderError(error, 'Failed to send communication');
    }
  }

  // Get order communications
  static async getOrderCommunications(orderId: string): Promise<CommunicationThread[]> {
    try {
      const response = await apiClient.get<{ communications: CommunicationThread[] }>(
        `${this.baseUrl}/${orderId}/communications`
      );
      return response.communications;
    } catch (error) {
      throw this.handleOrderError(error, `Failed to fetch communications for order ${orderId}`);
    }
  }

  // Process payment
  static async processPayment(
    orderId: string,
    paymentDetails: {
      method: string;
      amount: number;
      reference?: string;
    }
  ): Promise<PaymentTransaction> {
    try {
      const response = await apiClient.post<{ transaction: PaymentTransaction }>(
        `${this.baseUrl}/${orderId}/payments`,
        paymentDetails
      );

      this.logOrderEvent(orderId, 'PAYMENT_PROCESSED', `Payment of ${paymentDetails.amount} processed`);
      return response.transaction;
    } catch (error) {
      throw this.handleOrderError(error, 'Failed to process payment');
    }
  }

  // Get order tracking information
  static async getOrderTracking(orderId: string): Promise<{
    trackingNumber?: string;
    carrier?: string;
    trackingUrl?: string;
    updates: Array<{
      timestamp: string;
      location: string;
      status: string;
      description: string;
    }>;
  }> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${orderId}/tracking`);
      return response;
    } catch (error) {
      throw this.handleOrderError(error, `Failed to fetch tracking for order ${orderId}`);
    }
  }

  // Export orders to various formats
  static async exportOrders(
    filters: OrderSearchFilters,
    format: 'csv' | 'excel' | 'pdf' = 'csv'
  ): Promise<Blob> {
    try {
      const queryParams = new URLSearchParams({
        format,
        ...this.buildFilterParams(filters)
      });

      const response = await fetch(`${this.baseUrl}/export?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      return await response.blob();
    } catch (error) {
      throw this.handleOrderError(error, 'Failed to export orders');
    }
  }

  // Bulk operations
  static async bulkUpdateOrders(
    orderIds: string[],
    updates: Partial<UpdateOrderRequest>
  ): Promise<{ success: string[]; failed: string[] }> {
    try {
      const response = await apiClient.post<{ success: string[]; failed: string[] }>(
        `${this.baseUrl}/bulk-update`,
        {
          orderIds,
          updates
        }
      );

      return response;
    } catch (error) {
      throw this.handleOrderError(error, 'Failed to bulk update orders');
    }
  }

  // Private helper methods
  private static buildFilterParams(filters: OrderSearchFilters): Record<string, string> {
    const params: Record<string, string> = {};

    if (filters.status?.length) {
      params.status = filters.status.join(',');
    }
    if (filters.supplierId) {
      params.supplierId = filters.supplierId;
    }
    if (filters.buyerId) {
      params.buyerId = filters.buyerId;
    }
    if (filters.dateRange) {
      params.startDate = filters.dateRange.start;
      params.endDate = filters.dateRange.end;
    }
    if (filters.amountRange) {
      params.minAmount = filters.amountRange.min.toString();
      params.maxAmount = filters.amountRange.max.toString();
    }
    if (filters.priority?.length) {
      params.priority = filters.priority.join(',');
    }
    if (filters.type?.length) {
      params.type = filters.type.join(',');
    }
    if (filters.searchTerm) {
      params.search = filters.searchTerm;
    }

    return params;
  }

  private static handleOrderError(error: any, defaultMessage: string): Error {
    console.error('Order service error:', error);
    
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    
    if (error.message) {
      return new Error(error.message);
    }
    
    return new Error(defaultMessage);
  }

  private static logOrderEvent(orderId: string, event: string, description: string): void {
    console.log(`Order ${orderId}: ${event} - ${description}`);
    
    // In a real implementation, this would send to the monitoring service
    if (window.rumMonitor) {
      window.rumMonitor.trackMetric('order_event', 1, {
        orderId,
        event,
        description
      });
    }
  }
}

export default OrderService;