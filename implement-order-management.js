const fs = require('fs');
const path = require('path');

console.log('📦 IMPLEMENTING: Complete Order Management System...');

// Create comprehensive Order Management types
function createOrderTypes() {
  console.log('📝 Creating order management types...');
  
  if (!fs.existsSync('./src/types')) {
    fs.mkdirSync('./src/types', { recursive: true });
  }
  
  const orderTypes = `// Comprehensive Order Management Types
export interface Order {
  id: string;
  orderNumber: string;
  rfqId?: string;
  supplierId: string;
  buyerId: string;
  status: OrderStatus;
  type: OrderType;
  priority: OrderPriority;
  items: OrderItem[];
  pricing: OrderPricing;
  delivery: DeliveryDetails;
  payment: PaymentDetails;
  documents: OrderDocument[];
  timeline: OrderTimeline[];
  quality: QualityRequirements;
  logistics: LogisticsInfo;
  compliance: ComplianceInfo;
  communication: CommunicationThread[];
  metadata: OrderMetadata;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export enum OrderStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  CONFIRMED = 'confirmed',
  IN_PRODUCTION = 'in_production',
  QUALITY_CHECK = 'quality_check',
  READY_FOR_SHIPMENT = 'ready_for_shipment',
  SHIPPED = 'shipped',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  DISPUTED = 'disputed',
  RETURNED = 'returned'
}

export enum OrderType {
  STANDARD = 'standard',
  URGENT = 'urgent',
  SAMPLE = 'sample',
  BULK = 'bulk',
  CUSTOM = 'custom',
  RECURRING = 'recurring'
}

export enum OrderPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productCode: string;
  category: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  specifications: ProductSpecification[];
  qualityRequirements: QualityRequirement[];
  packaging: PackagingRequirement;
  shelf_life?: number;
  temperature_requirements?: TemperatureRange;
  allergen_info?: AllergenInfo;
  certification?: CertificationRequirement[];
}

export interface ProductSpecification {
  name: string;
  value: string;
  unit?: string;
  tolerance?: number;
  mandatory: boolean;
}

export interface QualityRequirement {
  parameter: string;
  specification: string;
  testMethod: string;
  acceptanceCriteria: string;
  frequency: string;
}

export interface PackagingRequirement {
  type: string;
  material: string;
  dimensions: Dimensions;
  weight: number;
  labeling: LabelingRequirement[];
  sustainability?: SustainabilityInfo;
}

export interface OrderPricing {
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  insuranceCost?: number;
  customsDuties?: number;
  discounts?: Discount[];
  totalAmount: number;
  currency: string;
  exchangeRate?: number;
  paymentTerms: string;
  priceValidUntil: string;
}

export interface Discount {
  type: 'percentage' | 'fixed' | 'volume';
  value: number;
  description: string;
  conditions?: string;
}

export interface DeliveryDetails {
  method: DeliveryMethod;
  carrier?: string;
  trackingNumber?: string;
  estimatedDeliveryDate: string;
  actualDeliveryDate?: string;
  deliveryAddress: Address;
  pickupAddress: Address;
  deliveryInstructions?: string;
  signature_required: boolean;
  insurance_value?: number;
  delivery_window?: TimeWindow;
}

export enum DeliveryMethod {
  STANDARD = 'standard',
  EXPRESS = 'express',
  OVERNIGHT = 'overnight',
  SAME_DAY = 'same_day',
  PICKUP = 'pickup',
  CUSTOM = 'custom'
}

export interface Address {
  name: string;
  company?: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  email?: string;
  coordinates?: GeoLocation;
}

export interface PaymentDetails {
  method: PaymentMethod;
  status: PaymentStatus;
  terms: string;
  dueDate: string;
  invoiceNumber?: string;
  transactions: PaymentTransaction[];
  installments?: PaymentInstallment[];
}

export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  BANK_TRANSFER = 'bank_transfer',
  CHECK = 'check',
  CASH_ON_DELIVERY = 'cash_on_delivery',
  LETTER_OF_CREDIT = 'letter_of_credit',
  ESCROW = 'escrow'
}

export enum PaymentStatus {
  PENDING = 'pending',
  AUTHORIZED = 'authorized',
  CAPTURED = 'captured',
  PAID = 'paid',
  OVERDUE = 'overdue',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

export interface PaymentTransaction {
  id: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  reference: string;
  processedAt: string;
  gateway?: string;
}

export interface OrderDocument {
  id: string;
  type: DocumentType;
  name: string;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
  version: number;
  status: DocumentStatus;
  expiryDate?: string;
  verified: boolean;
}

export enum DocumentType {
  PURCHASE_ORDER = 'purchase_order',
  INVOICE = 'invoice',
  PACKING_LIST = 'packing_list',
  BILL_OF_LADING = 'bill_of_lading',
  CERTIFICATE_OF_ANALYSIS = 'certificate_of_analysis',
  QUALITY_CERTIFICATE = 'quality_certificate',
  INSURANCE_CERTIFICATE = 'insurance_certificate',
  CUSTOMS_DECLARATION = 'customs_declaration',
  DELIVERY_RECEIPT = 'delivery_receipt',
  CONTRACT = 'contract'
}

export interface OrderTimeline {
  id: string;
  timestamp: string;
  event: TimelineEvent;
  description: string;
  userId?: string;
  automaticEvent: boolean;
  metadata?: Record<string, any>;
}

export enum TimelineEvent {
  ORDER_CREATED = 'order_created',
  ORDER_SUBMITTED = 'order_submitted',
  ORDER_APPROVED = 'order_approved',
  ORDER_CONFIRMED = 'order_confirmed',
  PRODUCTION_STARTED = 'production_started',
  QUALITY_CHECK_PASSED = 'quality_check_passed',
  SHIPMENT_PREPARED = 'shipment_prepared',
  ORDER_SHIPPED = 'order_shipped',
  ORDER_DELIVERED = 'order_delivered',
  PAYMENT_RECEIVED = 'payment_received',
  ORDER_COMPLETED = 'order_completed',
  ORDER_CANCELLED = 'order_cancelled',
  ISSUE_REPORTED = 'issue_reported',
  ISSUE_RESOLVED = 'issue_resolved'
}

export interface QualityRequirements {
  standards: QualityStandard[];
  inspections: QualityInspection[];
  testing: QualityTest[];
  certifications: string[];
  traceability: boolean;
}

export interface LogisticsInfo {
  temperatureControlled: boolean;
  hazardousMaterial: boolean;
  fragile: boolean;
  stackable: boolean;
  orientation: 'upright' | 'any';
  customsInfo?: CustomsInfo;
  incoterms: string;
}

export interface ComplianceInfo {
  requiredCertifications: string[];
  regulatoryRequirements: string[];
  auditRequirements?: AuditRequirement[];
  sustainability?: SustainabilityRequirement[];
}

export interface CommunicationThread {
  id: string;
  timestamp: string;
  from: string;
  to: string[];
  subject: string;
  message: string;
  attachments?: string[];
  urgency: 'low' | 'medium' | 'high';
  status: 'unread' | 'read' | 'replied';
}

export interface OrderMetadata {
  source: 'manual' | 'import' | 'api' | 'rfq';
  tags: string[];
  customFields: Record<string, any>;
  internalNotes?: string;
  customerReference?: string;
  supplierReference?: string;
}

// Order Management Operations
export interface CreateOrderRequest {
  rfqId?: string;
  supplierId: string;
  type: OrderType;
  priority: OrderPriority;
  items: Omit<OrderItem, 'id' | 'totalPrice'>[];
  deliveryAddress: Address;
  requestedDeliveryDate: string;
  paymentTerms: string;
  specialInstructions?: string;
}

export interface UpdateOrderRequest {
  status?: OrderStatus;
  items?: Partial<OrderItem>[];
  delivery?: Partial<DeliveryDetails>;
  payment?: Partial<PaymentDetails>;
  priority?: OrderPriority;
}

export interface OrderSearchFilters {
  status?: OrderStatus[];
  supplierId?: string;
  buyerId?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  amountRange?: {
    min: number;
    max: number;
  };
  priority?: OrderPriority[];
  type?: OrderType[];
  searchTerm?: string;
}

export interface OrderSummary {
  totalOrders: number;
  totalValue: number;
  byStatus: Record<OrderStatus, number>;
  byPriority: Record<OrderPriority, number>;
  averageOrderValue: number;
  completionRate: number;
  onTimeDeliveryRate: number;
}`;
  
  fs.writeFileSync('./src/types/order.ts', orderTypes);
  console.log('✅ Created comprehensive order types');
}

// Create Order Management Service
function createOrderService() {
  console.log('🔧 Creating order management service...');
  
  if (!fs.existsSync('./src/services/orders')) {
    fs.mkdirSync('./src/services/orders', { recursive: true });
  }
  
  const orderService = `import { apiClient } from '../security/apiSecurity';
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
} from '../types/order';

export class OrderService {
  private static baseUrl = '/api/orders';

  // Create new order
  static async createOrder(request: CreateOrderRequest): Promise<Order> {
    try {
      const response = await apiClient.post<{ order: Order }>(\`\${this.baseUrl}\`, request);
      this.logOrderEvent(response.order.id, 'ORDER_CREATED', 'Order created successfully');
      return response.order;
    } catch (error) {
      throw this.handleOrderError(error, 'Failed to create order');
    }
  }

  // Get order by ID
  static async getOrder(orderId: string): Promise<Order> {
    try {
      const response = await apiClient.get<{ order: Order }>(\`\${this.baseUrl}/\${orderId}\`);
      return response.order;
    } catch (error) {
      throw this.handleOrderError(error, \`Failed to fetch order \${orderId}\`);
    }
  }

  // Update order
  static async updateOrder(orderId: string, updates: UpdateOrderRequest): Promise<Order> {
    try {
      const response = await apiClient.put<{ order: Order }>(\`\${this.baseUrl}/\${orderId}\`, updates);
      
      if (updates.status) {
        this.logOrderEvent(orderId, 'STATUS_CHANGED', \`Order status changed to \${updates.status}\`);
      }
      
      return response.order;
    } catch (error) {
      throw this.handleOrderError(error, \`Failed to update order \${orderId}\`);
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
      }>(\`\${this.baseUrl}?\${queryParams}\`);

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
      const params = dateRange ? \`?start=\${dateRange.start}&end=\${dateRange.end}\` : '';
      const response = await apiClient.get<{ summary: OrderSummary }>(\`\${this.baseUrl}/summary\${params}\`);
      return response.summary;
    } catch (error) {
      throw this.handleOrderError(error, 'Failed to fetch order summary');
    }
  }

  // Cancel order
  static async cancelOrder(orderId: string, reason: string): Promise<Order> {
    try {
      const response = await apiClient.post<{ order: Order }>(\`\${this.baseUrl}/\${orderId}/cancel\`, {
        reason
      });
      
      this.logOrderEvent(orderId, 'ORDER_CANCELLED', \`Order cancelled: \${reason}\`);
      return response.order;
    } catch (error) {
      throw this.handleOrderError(error, \`Failed to cancel order \${orderId}\`);
    }
  }

  // Approve order
  static async approveOrder(orderId: string, approverNotes?: string): Promise<Order> {
    try {
      const response = await apiClient.post<{ order: Order }>(\`\${this.baseUrl}/\${orderId}/approve\`, {
        notes: approverNotes
      });
      
      this.logOrderEvent(orderId, 'ORDER_APPROVED', 'Order approved');
      return response.order;
    } catch (error) {
      throw this.handleOrderError(error, \`Failed to approve order \${orderId}\`);
    }
  }

  // Confirm order (supplier confirmation)
  static async confirmOrder(orderId: string, estimatedDeliveryDate: string): Promise<Order> {
    try {
      const response = await apiClient.post<{ order: Order }>(\`\${this.baseUrl}/\${orderId}/confirm\`, {
        estimatedDeliveryDate
      });
      
      this.logOrderEvent(orderId, 'ORDER_CONFIRMED', \`Order confirmed with delivery date: \${estimatedDeliveryDate}\`);
      return response.order;
    } catch (error) {
      throw this.handleOrderError(error, \`Failed to confirm order \${orderId}\`);
    }
  }

  // Update order status
  static async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    notes?: string
  ): Promise<Order> {
    try {
      const response = await apiClient.post<{ order: Order }>(\`\${this.baseUrl}/\${orderId}/status\`, {
        status,
        notes
      });
      
      this.logOrderEvent(orderId, 'STATUS_UPDATED', \`Status updated to \${status}\`);
      return response.order;
    } catch (error) {
      throw this.handleOrderError(error, \`Failed to update order status \${orderId}\`);
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
        \`\${this.baseUrl}/\${orderId}/documents\`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      this.logOrderEvent(orderId, 'DOCUMENT_UPLOADED', \`Document uploaded: \${file.name}\`);
      return response.document;
    } catch (error) {
      throw this.handleOrderError(error, 'Failed to upload document');
    }
  }

  // Get order documents
  static async getOrderDocuments(orderId: string): Promise<OrderDocument[]> {
    try {
      const response = await apiClient.get<{ documents: OrderDocument[] }>(\`\${this.baseUrl}/\${orderId}/documents\`);
      return response.documents;
    } catch (error) {
      throw this.handleOrderError(error, \`Failed to fetch documents for order \${orderId}\`);
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
        \`\${this.baseUrl}/\${orderId}/communications\`,
        {
          message,
          recipients,
          subject
        }
      );

      this.logOrderEvent(orderId, 'MESSAGE_SENT', \`Message sent to \${recipients.join(', ')}\`);
      return response.communication;
    } catch (error) {
      throw this.handleOrderError(error, 'Failed to send communication');
    }
  }

  // Get order communications
  static async getOrderCommunications(orderId: string): Promise<CommunicationThread[]> {
    try {
      const response = await apiClient.get<{ communications: CommunicationThread[] }>(
        \`\${this.baseUrl}/\${orderId}/communications\`
      );
      return response.communications;
    } catch (error) {
      throw this.handleOrderError(error, \`Failed to fetch communications for order \${orderId}\`);
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
        \`\${this.baseUrl}/\${orderId}/payments\`,
        paymentDetails
      );

      this.logOrderEvent(orderId, 'PAYMENT_PROCESSED', \`Payment of \${paymentDetails.amount} processed\`);
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
      const response = await apiClient.get(\`\${this.baseUrl}/\${orderId}/tracking\`);
      return response;
    } catch (error) {
      throw this.handleOrderError(error, \`Failed to fetch tracking for order \${orderId}\`);
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

      const response = await fetch(\`\${this.baseUrl}/export?\${queryParams}\`, {
        method: 'GET',
        headers: {
          'Authorization': \`Bearer \${localStorage.getItem('token')}\`
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
        \`\${this.baseUrl}/bulk-update\`,
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
    console.log(\`Order \${orderId}: \${event} - \${description}\`);
    
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

export default OrderService;`;
  
  fs.writeFileSync('./src/services/orders/OrderService.ts', orderService);
  console.log('✅ Created comprehensive order service');
}

// Create Order Management hooks
function createOrderHooks() {
  console.log('🪝 Creating order management hooks...');
  
  if (!fs.existsSync('./src/hooks/orders')) {
    fs.mkdirSync('./src/hooks/orders', { recursive: true });
  }
  
  const orderHooks = `import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import OrderService from '../../services/orders/OrderService';
import {
  Order,
  OrderStatus,
  CreateOrderRequest,
  UpdateOrderRequest,
  OrderSearchFilters,
  OrderSummary
} from '../../types/order';

// Hook for fetching a single order
export function useOrder(orderId: string) {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: () => OrderService.getOrder(orderId),
    enabled: !!orderId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2
  });
}

// Hook for searching orders with filters
export function useOrders(
  filters: OrderSearchFilters = {},
  page = 1,
  limit = 20
) {
  return useQuery({
    queryKey: ['orders', filters, page, limit],
    queryFn: () => OrderService.searchOrders(filters, page, limit),
    keepPreviousData: true,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Hook for order summary statistics
export function useOrderSummary(dateRange?: { start: string; end: string }) {
  return useQuery({
    queryKey: ['order-summary', dateRange],
    queryFn: () => OrderService.getOrderSummary(dateRange),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for creating orders
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateOrderRequest) => OrderService.createOrder(request),
    onSuccess: (newOrder) => {
      // Invalidate and refetch orders list
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order-summary'] });
      
      // Add new order to cache
      queryClient.setQueryData(['order', newOrder.id], newOrder);
    },
    onError: (error) => {
      console.error('Failed to create order:', error);
    }
  });
}

// Hook for updating orders
export function useUpdateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, updates }: { orderId: string; updates: UpdateOrderRequest }) =>
      OrderService.updateOrder(orderId, updates),
    onSuccess: (updatedOrder) => {
      // Update the specific order in cache
      queryClient.setQueryData(['order', updatedOrder.id], updatedOrder);
      
      // Invalidate orders list to reflect changes
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order-summary'] });
    },
    onError: (error) => {
      console.error('Failed to update order:', error);
    }
  });
}

// Hook for order status updates
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      orderId, 
      status, 
      notes 
    }: { 
      orderId: string; 
      status: OrderStatus; 
      notes?: string 
    }) => OrderService.updateOrderStatus(orderId, status, notes),
    onSuccess: (updatedOrder) => {
      queryClient.setQueryData(['order', updatedOrder.id], updatedOrder);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order-summary'] });
    }
  });
}

// Hook for order approval
export function useApproveOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, notes }: { orderId: string; notes?: string }) =>
      OrderService.approveOrder(orderId, notes),
    onSuccess: (updatedOrder) => {
      queryClient.setQueryData(['order', updatedOrder.id], updatedOrder);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    }
  });
}

// Hook for order cancellation
export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, reason }: { orderId: string; reason: string }) =>
      OrderService.cancelOrder(orderId, reason),
    onSuccess: (updatedOrder) => {
      queryClient.setQueryData(['order', updatedOrder.id], updatedOrder);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order-summary'] });
    }
  });
}

// Hook for order documents
export function useOrderDocuments(orderId: string) {
  return useQuery({
    queryKey: ['order-documents', orderId],
    queryFn: () => OrderService.getOrderDocuments(orderId),
    enabled: !!orderId,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook for order communications
export function useOrderCommunications(orderId: string) {
  return useQuery({
    queryKey: ['order-communications', orderId],
    queryFn: () => OrderService.getOrderCommunications(orderId),
    enabled: !!orderId,
    staleTime: 30 * 1000, // 30 seconds for more frequent updates
  });
}

// Hook for order tracking
export function useOrderTracking(orderId: string) {
  return useQuery({
    queryKey: ['order-tracking', orderId],
    queryFn: () => OrderService.getOrderTracking(orderId),
    enabled: !!orderId,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    staleTime: 2 * 60 * 1000,
  });
}

// Hook for advanced order filtering and search
export function useAdvancedOrderSearch() {
  const [filters, setFilters] = useState<OrderSearchFilters>({});
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const ordersQuery = useOrders(filters, page, limit);

  const updateFilters = useCallback((newFilters: Partial<OrderSearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(1); // Reset to first page when filters change
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setPage(1);
  }, []);

  const goToPage = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const changePageSize = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  }, []);

  // Filtered and sorted data
  const processedData = useMemo(() => {
    if (!ordersQuery.data?.orders) return [];

    let orders = [...ordersQuery.data.orders];

    // Apply local sorting
    orders.sort((a, b) => {
      const aValue = a[sortBy as keyof Order];
      const bValue = b[sortBy as keyof Order];
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return orders;
  }, [ordersQuery.data?.orders, sortBy, sortOrder]);

  return {
    orders: processedData,
    total: ordersQuery.data?.total || 0,
    pages: ordersQuery.data?.pages || 0,
    currentPage: page,
    pageSize: limit,
    filters,
    sortBy,
    sortOrder,
    isLoading: ordersQuery.isLoading,
    isError: ordersQuery.isError,
    error: ordersQuery.error,
    updateFilters,
    clearFilters,
    goToPage,
    changePageSize,
    setSortBy,
    setSortOrder,
    refetch: ordersQuery.refetch
  };
}

// Hook for order analytics and insights
export function useOrderAnalytics(dateRange?: { start: string; end: string }) {
  const summaryQuery = useOrderSummary(dateRange);
  const ordersQuery = useOrders({ dateRange }, 1, 1000); // Get more data for analytics

  const analytics = useMemo(() => {
    if (!ordersQuery.data?.orders) return null;

    const orders = ordersQuery.data.orders;
    
    // Calculate trends
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentOrders = orders.filter(order => 
      new Date(order.createdAt) >= thirtyDaysAgo
    );

    // Performance metrics
    const onTimeDeliveries = orders.filter(order => 
      order.status === OrderStatus.DELIVERED && 
      order.delivery?.actualDeliveryDate &&
      new Date(order.delivery.actualDeliveryDate) <= new Date(order.delivery.estimatedDeliveryDate)
    ).length;

    const completedOrders = orders.filter(order => 
      order.status === OrderStatus.COMPLETED
    ).length;

    // Financial metrics
    const totalRevenue = orders
      .filter(order => order.status === OrderStatus.COMPLETED)
      .reduce((sum, order) => sum + order.pricing.totalAmount, 0);

    const averageOrderValue = orders.length > 0 
      ? orders.reduce((sum, order) => sum + order.pricing.totalAmount, 0) / orders.length 
      : 0;

    return {
      totalOrders: orders.length,
      recentOrders: recentOrders.length,
      totalRevenue,
      averageOrderValue,
      onTimeDeliveryRate: orders.length > 0 ? (onTimeDeliveries / orders.length) * 100 : 0,
      completionRate: orders.length > 0 ? (completedOrders / orders.length) * 100 : 0,
      summary: summaryQuery.data
    };
  }, [ordersQuery.data, summaryQuery.data]);

  return {
    analytics,
    isLoading: ordersQuery.isLoading || summaryQuery.isLoading,
    isError: ordersQuery.isError || summaryQuery.isError,
    error: ordersQuery.error || summaryQuery.error,
    refetch: () => {
      ordersQuery.refetch();
      summaryQuery.refetch();
    }
  };
}

// Hook for real-time order updates
export function useOrderRealTimeUpdates(orderId: string) {
  const queryClient = useQueryClient();
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');

  useEffect(() => {
    if (!orderId) return;

    setConnectionStatus('connecting');

    // WebSocket connection for real-time updates
    const ws = new WebSocket(\`\${process.env.REACT_APP_WS_URL}/orders/\${orderId}\`);

    ws.onopen = () => {
      setConnectionStatus('connected');
      console.log(\`Connected to order \${orderId} updates\`);
    };

    ws.onmessage = (event) => {
      try {
        const update = JSON.parse(event.data);
        
        // Update the order in cache
        queryClient.setQueryData(['order', orderId], (oldData: Order | undefined) => {
          if (!oldData) return oldData;
          return { ...oldData, ...update };
        });

        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        queryClient.invalidateQueries({ queryKey: ['order-tracking', orderId] });
        
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      setConnectionStatus('disconnected');
      console.log(\`Disconnected from order \${orderId} updates\`);
    };

    ws.onerror = (error) => {
      console.error(\`WebSocket error for order \${orderId}:\`, error);
      setConnectionStatus('disconnected');
    };

    return () => {
      ws.close();
    };
  }, [orderId, queryClient]);

  return {
    connectionStatus,
    isConnected: connectionStatus === 'connected'
  };
}`;
  
  fs.writeFileSync('./src/hooks/orders/useOrders.ts', orderHooks);
  console.log('✅ Created comprehensive order hooks');
}

// Run order management implementation
async function implementOrderManagement() {
  try {
    createOrderTypes();
    createOrderService();
    createOrderHooks();
    
    console.log('🎉 ORDER MANAGEMENT IMPLEMENTATION COMPLETE!');
    console.log('📦 Features implemented:');
    console.log('  • Comprehensive order types and interfaces');
    console.log('  • Full-featured order service with API integration');
    console.log('  • Advanced order management hooks');
    console.log('  • Real-time order updates with WebSocket');
    console.log('  • Order analytics and insights');
    console.log('  • Document and communication management');
    console.log('  • Payment processing integration');
    console.log('  • Order tracking and logistics');
    console.log('  • Bulk operations and export functionality');
    console.log('📋 Next: Implement order management UI components');
    
  } catch (error) {
    console.error('❌ Error implementing order management:', error);
  }
}

implementOrderManagement();