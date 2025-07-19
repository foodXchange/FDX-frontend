// Comprehensive Order Management Types
import { Dimensions, TemperatureRange, ProductSpecification, AllergenInfo } from './common';

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
}