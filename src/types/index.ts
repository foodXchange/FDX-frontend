// src/types/index.ts - Main type definitions

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'buyer' | 'supplier' | 'admin';
  company?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

// Authentication Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  company: string;
  role: 'buyer' | 'supplier';
}

// Product Types
export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  unit: string;
  supplierId: string;
  supplierName: string;
  image?: string;
  specifications: ProductSpecification[];
  certifications: string[];
  origin: string;
  minOrderQuantity: number;
  leadTime: number; // days
  createdAt: string;
  updatedAt: string;
}

export interface ProductSpecification {
  name: string;
  value: string;
  unit?: string;
}

// RFQ Types
export interface RFQ {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'published' | 'closed' | 'awarded';
  createdBy: string;
  buyerCompany: string;
  products: RFQProduct[];
  requirements: RFQRequirements;
  timeline: RFQTimeline;
  budget?: {
    min: number;
    max: number;
    currency: string;
  };
  proposals: RFQProposal[];
  createdAt: string;
  updatedAt: string;
  deadline: string;
}

export interface RFQProduct {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  specifications: ProductSpecification[];
  description?: string;
}

export interface RFQRequirements {
  certifications: string[];
  qualityStandards: string[];
  paymentTerms: string[];
  deliveryTerms: string;
  packagingRequirements?: string;
  labeling?: string[];
}

export interface RFQTimeline {
  proposalDeadline: string;
  expectedDelivery: string;
  evaluationPeriod: number; // days
}

export interface RFQProposal {
  id: string;
  rfqId: string;
  supplierId: string;
  supplierName: string;
  status: 'submitted' | 'under_review' | 'accepted' | 'rejected';
  pricing: ProposalPricing[];
  documents: string[];
  notes?: string;
  submittedAt: string;
}

export interface ProposalPricing {
  productId: string;
  unitPrice: number;
  totalPrice: number;
  currency: string;
  leadTime: number;
}

// Order Types
export interface Order {
  id: string;
  rfqId: string;
  proposalId: string;
  buyerId: string;
  supplierId: string;
  status: 'pending' | 'confirmed' | 'in_production' | 'shipped' | 'delivered' | 'cancelled';
  items: OrderItem[];
  total: number;
  currency: string;
  paymentStatus: 'pending' | 'paid' | 'overdue';
  shipping: ShippingDetails;
  timeline: OrderTimeline;
  documents: OrderDocument[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  specifications: ProductSpecification[];
}

export interface ShippingDetails {
  method: string;
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery: string;
  address: Address;
}

export interface OrderTimeline {
  ordered: string;
  confirmed?: string;
  inProduction?: string;
  shipped?: string;
  delivered?: string;
}

export interface OrderDocument {
  id: string;
  type: 'invoice' | 'contract' | 'certificate' | 'shipping_label' | 'other';
  name: string;
  url: string;
  uploadedAt: string;
}

// Supplier Types
export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone?: string;
  country: string;
  address: Address;
  certifications: string[];
  specialties: string[];
  description?: string;
  website?: string;
  logo?: string;
  verified: boolean;
  rating: number;
  totalOrders: number;
  onTimeDelivery: number; // percentage
  createdAt: string;
  updatedAt: string;
}

// Common Types
export interface Address {
  street: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Dashboard Types
export interface DashboardStats {
  totalRFQs: number;
  activeRFQs: number;
  totalOrders: number;
  totalSuppliers: number;
  pendingApprovals: number;
  revenue: number;
}

// Notification Types
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

// Export all types from sub-modules
export * from './auth';
export * from './rfq';