// Comprehensive Payment & Invoicing Types

import { DateRange } from './common';

// Payment Types
export interface Payment {
  id: string;
  paymentNumber: string;
  orderId?: string;
  invoiceId?: string;
  supplierId: string;
  buyerId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: PaymentMethod;
  type: PaymentType;
  reference?: string;
  transactionId?: string;
  paymentDate?: string;
  dueDate?: string;
  terms: PaymentTerms;
  bankDetails?: BankDetails;
  cardDetails?: CardDetails;
  wireDetails?: WireTransferDetails;
  fees?: PaymentFees;
  metadata?: PaymentMetadata;
  notes?: string;
  attachments?: PaymentDocument[];
  reconciliation?: ReconciliationInfo;
  approvals?: PaymentApproval[];
  audit?: AuditTrail[];
  createdAt: string;
  updatedAt: string;
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
  ON_HOLD = 'on_hold',
  DISPUTED = 'disputed'
}

export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  BANK_TRANSFER = 'bank_transfer',
  ACH = 'ach',
  WIRE = 'wire',
  CHECK = 'check',
  LETTER_OF_CREDIT = 'letter_of_credit',
  ESCROW = 'escrow',
  CRYPTO = 'crypto',
  PAYPAL = 'paypal',
  OTHER = 'other'
}

export enum PaymentType {
  ADVANCE = 'advance',
  PARTIAL = 'partial',
  FULL = 'full',
  DEPOSIT = 'deposit',
  INSTALLMENT = 'installment',
  MILESTONE = 'milestone',
  RECURRING = 'recurring'
}

export interface PaymentTerms {
  type: PaymentTermType;
  netDays?: number;
  discountPercentage?: number;
  discountDays?: number;
  lateFeePercentage?: number;
  customTerms?: string;
  creditLimit?: number;
  paymentSchedule?: PaymentSchedule[];
}

export enum PaymentTermType {
  IMMEDIATE = 'immediate',
  NET_15 = 'net_15',
  NET_30 = 'net_30',
  NET_45 = 'net_45',
  NET_60 = 'net_60',
  NET_90 = 'net_90',
  TWO_TEN_NET_30 = '2_10_net_30', // 2% discount if paid within 10 days
  COD = 'cod',
  CIA = 'cia', // Cash in advance
  EOM = 'eom', // End of month
  CUSTOM = 'custom'
}

export interface PaymentSchedule {
  id: string;
  dueDate: string;
  amount: number;
  percentage?: number;
  status: PaymentStatus;
  paidDate?: string;
  milestone?: string;
}

// Invoice Types
export interface Invoice {
  id: string;
  invoiceNumber: string;
  orderId?: string;
  rfqId?: string;
  supplierId: string;
  buyerId: string;
  status: InvoiceStatus;
  type: InvoiceType;
  issueDate: string;
  dueDate: string;
  paymentTerms: PaymentTerms;
  billingAddress: Address;
  shippingAddress?: Address;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  taxDetails: TaxDetail[];
  totalTax: number;
  shipping: number;
  handling: number;
  discount?: DiscountDetail;
  totalAmount: number;
  currency: string;
  exchangeRate?: number;
  payments: PaymentRecord[];
  balanceDue: number;
  notes?: string;
  termsAndConditions?: string;
  attachments?: InvoiceDocument[];
  customFields?: Record<string, any>;
  reminders?: InvoiceReminder[];
  disputes?: InvoiceDispute[];
  audit?: AuditTrail[];
  createdAt: string;
  updatedAt: string;
  version: number;
}

export enum InvoiceStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  VIEWED = 'viewed',
  PARTIALLY_PAID = 'partially_paid',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
  DISPUTED = 'disputed',
  WRITTEN_OFF = 'written_off'
}

export enum InvoiceType {
  STANDARD = 'standard',
  PROFORMA = 'proforma',
  COMMERCIAL = 'commercial',
  CREDIT_NOTE = 'credit_note',
  DEBIT_NOTE = 'debit_note',
  RECURRING = 'recurring',
  INTERIM = 'interim',
  FINAL = 'final'
}

export interface InvoiceLineItem {
  id: string;
  productId?: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  subtotal: number;
  tax?: TaxDetail;
  discount?: DiscountDetail;
  total: number;
  hsCode?: string;
  customsValue?: number;
  notes?: string;
}

export interface TaxDetail {
  type: TaxType;
  rate: number;
  amount: number;
  taxId?: string;
  jurisdiction?: string;
  description?: string;
}

export enum TaxType {
  VAT = 'vat',
  GST = 'gst',
  SALES_TAX = 'sales_tax',
  CUSTOMS = 'customs',
  EXCISE = 'excise',
  OTHER = 'other'
}

export interface DiscountDetail {
  type: DiscountType;
  value: number;
  amount: number;
  reason?: string;
}

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
  VOLUME = 'volume',
  EARLY_PAYMENT = 'early_payment',
  PROMOTIONAL = 'promotional'
}

// Financial Management Types
export interface CreditLimit {
  id: string;
  customerId: string;
  limit: number;
  currency: string;
  used: number;
  available: number;
  status: CreditLimitStatus;
  validFrom: string;
  validUntil?: string;
  approvedBy: string;
  approvedAt: string;
  terms?: string;
  reviews: CreditReview[];
}

export enum CreditLimitStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  EXCEEDED = 'exceeded',
  UNDER_REVIEW = 'under_review',
  EXPIRED = 'expired'
}

export interface CreditReview {
  id: string;
  reviewDate: string;
  previousLimit: number;
  newLimit: number;
  reason: string;
  reviewedBy: string;
  decision: 'approved' | 'rejected' | 'pending';
  notes?: string;
}

// Bank and Card Details
export interface BankDetails {
  accountName: string;
  accountNumber: string;
  routingNumber?: string;
  swiftCode?: string;
  iban?: string;
  bankName: string;
  bankAddress?: Address;
  intermediaryBank?: BankDetails;
}

export interface CardDetails {
  last4: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
  holderName: string;
  tokenId?: string;
}

export interface WireTransferDetails {
  referenceNumber: string;
  senderBank: string;
  receiverBank: string;
  transferDate: string;
  confirmationCode?: string;
}

// Payment Processing
export interface PaymentFees {
  processingFee: number;
  gatewayFee: number;
  currencyConversionFee?: number;
  otherFees?: Array<{
    type: string;
    amount: number;
    description?: string;
  }>;
  totalFees: number;
}

export interface PaymentMetadata {
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  deviceId?: string;
  location?: {
    country: string;
    region?: string;
    city?: string;
  };
  customData?: Record<string, any>;
}

// Reconciliation
export interface ReconciliationInfo {
  status: ReconciliationStatus;
  matchedAt?: string;
  matchedBy?: string;
  bankStatement?: string;
  discrepancies?: Discrepancy[];
  notes?: string;
}

export enum ReconciliationStatus {
  PENDING = 'pending',
  MATCHED = 'matched',
  PARTIAL = 'partial',
  UNMATCHED = 'unmatched',
  DISPUTED = 'disputed'
}

export interface Discrepancy {
  type: string;
  expectedValue: any;
  actualValue: any;
  difference: number;
  resolved: boolean;
  resolution?: string;
}

// Documents
export interface PaymentDocument {
  id: string;
  type: PaymentDocumentType;
  name: string;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface InvoiceDocument {
  id: string;
  type: InvoiceDocumentType;
  name: string;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
}

export enum PaymentDocumentType {
  RECEIPT = 'receipt',
  BANK_STATEMENT = 'bank_statement',
  WIRE_CONFIRMATION = 'wire_confirmation',
  CHECK_IMAGE = 'check_image',
  OTHER = 'other'
}

export enum InvoiceDocumentType {
  INVOICE_PDF = 'invoice_pdf',
  SUPPORTING_DOCUMENT = 'supporting_document',
  PURCHASE_ORDER = 'purchase_order',
  DELIVERY_NOTE = 'delivery_note',
  OTHER = 'other'
}

// Approvals and Audit
export interface PaymentApproval {
  id: string;
  level: number;
  status: ApprovalStatus;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  comments?: string;
  requiredRole?: string;
}

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ESCALATED = 'escalated'
}

export interface AuditTrail {
  id: string;
  timestamp: string;
  action: string;
  performedBy: string;
  details: Record<string, any>;
  ipAddress?: string;
}

// Supporting Types
export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  country: string;
  postalCode: string;
}

export interface PaymentRecord {
  id: string;
  paymentId: string;
  amount: number;
  paymentDate: string;
  method: PaymentMethod;
  reference?: string;
}

export interface InvoiceReminder {
  id: string;
  sentAt: string;
  type: 'email' | 'sms' | 'in_app';
  recipient: string;
  template: string;
  nextReminder?: string;
}

export interface InvoiceDispute {
  id: string;
  raisedBy: string;
  raisedAt: string;
  reason: string;
  status: 'open' | 'investigating' | 'resolved' | 'escalated';
  resolution?: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

// API Request/Response Types
export interface CreateInvoiceRequest {
  orderId?: string;
  type: InvoiceType;
  dueDate: string;
  paymentTerms: PaymentTerms;
  lineItems: Omit<InvoiceLineItem, 'id'>[];
  billingAddress: Address;
  shippingAddress?: Address;
  notes?: string;
  customFields?: Record<string, any>;
}

export interface ProcessPaymentRequest {
  invoiceId?: string;
  orderId?: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  bankDetails?: BankDetails;
  cardToken?: string;
  reference?: string;
  notes?: string;
}

export interface PaymentSearchFilters {
  status?: PaymentStatus[];
  method?: PaymentMethod[];
  dateRange?: DateRange;
  amountRange?: {
    min: number;
    max: number;
  };
  supplierId?: string;
  buyerId?: string;
  searchTerm?: string;
}

export interface InvoiceSearchFilters {
  status?: InvoiceStatus[];
  type?: InvoiceType[];
  dateRange?: DateRange;
  amountRange?: {
    min: number;
    max: number;
  };
  supplierId?: string;
  buyerId?: string;
  overdue?: boolean;
  searchTerm?: string;
}

// Analytics
export interface PaymentAnalytics {
  totalVolume: number;
  totalTransactions: number;
  averageTransactionSize: number;
  byStatus: Record<PaymentStatus, number>;
  byMethod: Record<PaymentMethod, number>;
  successRate: number;
  averageProcessingTime: number;
  topCustomers: Array<{
    customerId: string;
    customerName: string;
    totalAmount: number;
    transactionCount: number;
  }>;
}

export interface InvoiceAnalytics {
  totalIssued: number;
  totalAmount: number;
  totalOutstanding: number;
  averageDaysToPayment: number;
  overdueAmount: number;
  overdueCount: number;
  byStatus: Record<InvoiceStatus, number>;
  agingReport: Array<{
    range: string;
    count: number;
    amount: number;
  }>;
}