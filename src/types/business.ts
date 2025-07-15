// =============================================================================
// BUSINESS TYPES - Domain-specific type definitions for FoodXchange
// =============================================================================

import { BaseEntity } from './common';

// User & Authentication Types
export interface User extends BaseEntity {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  company?: Company;
  role: UserRole;
  permissions: string[];
  preferences: UserPreferences;
  lastLoginAt?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  twoFactorEnabled: boolean;
  status: 'active' | 'inactive' | 'suspended';
}

export interface UserRole {
  id: string;
  name: string;
  type: 'admin' | 'buyer' | 'supplier' | 'agent';
  permissions: string[];
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  notifications: NotificationPreferences;
  dashboard: DashboardPreferences;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  orderUpdates: boolean;
  rfqUpdates: boolean;
  marketAlerts: boolean;
  systemAlerts: boolean;
}

export interface DashboardPreferences {
  widgets: string[];
  layout: 'grid' | 'list';
  defaultTab: string;
}

// Company Types
export interface Company extends BaseEntity {
  name: string;
  legalName: string;
  type: 'buyer' | 'supplier' | 'both';
  industry: string;
  description?: string;
  website?: string;
  logo?: string;
  address: Address;
  contacts: Contact[];
  certifications: Certification[];
  businessLicense: string;
  taxId: string;
  yearEstablished: number;
  employeeCount: number;
  annualRevenue?: number;
  status: 'active' | 'pending' | 'suspended' | 'verified';
  verificationDate?: string;
  rating: number;
  reviewCount: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface Contact {
  id: string;
  name: string;
  title: string;
  email: string;
  phone: string;
  isPrimary: boolean;
  department: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  number: string;
  issuedAt: string;
  expiresAt: string;
  status: 'valid' | 'expired' | 'pending';
  documentUrl?: string;
}

// Product Types
export interface Product extends BaseEntity {
  name: string;
  description: string;
  category: ProductCategory;
  subcategory: string;
  sku: string;
  barcode?: string;
  images: ProductImage[];
  specifications: ProductSpecification[];
  nutritionalInfo?: NutritionalInfo;
  packaging: PackagingInfo;
  origins: string[];
  certifications: string[];
  shelfLife: number;
  storageConditions: string;
  minimumOrderQuantity: number;
  priceRange: PriceRange;
  availability: ProductAvailability;
  supplier: Company;
  tags: string[];
  status: 'active' | 'inactive' | 'out_of_stock' | 'discontinued';
  rating: number;
  reviewCount: number;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  children?: ProductCategory[];
  icon?: string;
  image?: string;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
  order: number;
}

export interface ProductSpecification {
  name: string;
  value: string;
  unit?: string;
  category: string;
  isRequired: boolean;
}

export interface NutritionalInfo {
  servingSize: string;
  servingsPerContainer: number;
  calories: number;
  nutrients: Array<{
    name: string;
    amount: number;
    unit: string;
    dailyValue?: number;
  }>;
}

export interface PackagingInfo {
  type: string;
  material: string;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
  unitsPerPackage: number;
  packagesPerCarton: number;
  cartonsPerPallet: number;
}

export interface PriceRange {
  min: number;
  max: number;
  currency: string;
  unit: string;
  priceBreaks?: Array<{
    quantity: number;
    price: number;
  }>;
}

export interface ProductAvailability {
  inStock: boolean;
  stockLevel: number;
  leadTime: number;
  nextRestockDate?: string;
  regions: string[];
}

// Order Types
export interface Order extends BaseEntity {
  orderNumber: string;
  buyer: Company;
  supplier: Company;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  currency: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  shippingAddress: Address;
  billingAddress: Address;
  requestedDeliveryDate: string;
  actualDeliveryDate?: string;
  notes?: string;
  documents: Document[];
  tracking: TrackingInfo[];
  rfqId?: string;
  agentId?: string;
  metadata: Record<string, any>;
}

export interface OrderItem {
  id: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specifications?: Record<string, string>;
  notes?: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
}

export type OrderStatus = 
  | 'draft'
  | 'pending'
  | 'confirmed'
  | 'in_production'
  | 'ready_to_ship'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned';

export type PaymentStatus = 
  | 'pending'
  | 'paid'
  | 'partially_paid'
  | 'overdue'
  | 'cancelled'
  | 'refunded';

export interface TrackingInfo {
  id: string;
  status: string;
  description: string;
  location: string;
  timestamp: string;
  carrier?: string;
  trackingNumber?: string;
}

// RFQ (Request for Quote) Types
export interface RFQ extends BaseEntity {
  rfqNumber: string;
  title: string;
  description: string;
  buyer: Company;
  items: RFQItem[];
  requirements: RFQRequirement[];
  deliveryLocation: Address;
  requestedDeliveryDate: string;
  budgetRange?: PriceRange;
  documents: Document[];
  status: RFQStatus;
  submissions: RFQSubmission[];
  selectedSubmission?: RFQSubmission;
  expiresAt: string;
  isPublic: boolean;
  invitedSuppliers: string[];
  category: string;
  tags: string[];
  metadata: Record<string, any>;
}

export interface RFQItem {
  id: string;
  productName: string;
  description: string;
  quantity: number;
  unit: string;
  specifications: Record<string, string>;
  estimatedPrice?: number;
  category: string;
  images?: string[];
}

export interface RFQRequirement {
  id: string;
  type: 'certification' | 'delivery' | 'payment' | 'quality' | 'other';
  description: string;
  mandatory: boolean;
  details?: Record<string, any>;
}

export type RFQStatus = 
  | 'draft'
  | 'published'
  | 'in_review'
  | 'under_negotiation'
  | 'awarded'
  | 'cancelled'
  | 'expired';

export interface RFQSubmission extends BaseEntity {
  rfqId: string;
  supplier: Company;
  items: RFQSubmissionItem[];
  totalAmount: number;
  currency: string;
  validUntil: string;
  deliveryTime: number;
  paymentTerms: string;
  notes?: string;
  documents: Document[];
  status: 'submitted' | 'under_review' | 'accepted' | 'rejected' | 'expired';
  feedback?: string;
  score?: number;
}

export interface RFQSubmissionItem {
  rfqItemId: string;
  unitPrice: number;
  totalPrice: number;
  specifications: Record<string, string>;
  deliveryTime: number;
  notes?: string;
  alternatives?: Array<{
    description: string;
    price: number;
    specifications: Record<string, string>;
  }>;
}

// Document Types
export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
  tags: string[];
  metadata: Record<string, any>;
}

// AI & Analytics Types
export interface AIRecommendation {
  id: string;
  type: 'product' | 'supplier' | 'price' | 'market_trend';
  title: string;
  description: string;
  data: Record<string, any>;
  confidence: number;
  reasoning: string[];
  actionable: boolean;
  actions?: Array<{
    label: string;
    type: string;
    data: Record<string, any>;
  }>;
  createdAt: string;
  validUntil?: string;
}

export interface MarketIntelligence {
  id: string;
  category: string;
  region: string;
  insights: MarketInsight[];
  trends: MarketTrend[];
  priceAnalysis: PriceAnalysis;
  suppliers: SupplierAnalysis[];
  lastUpdated: string;
}

export interface MarketInsight {
  type: 'demand' | 'supply' | 'price' | 'regulatory' | 'seasonal';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  timeframe: string;
  data: Record<string, any>;
}

export interface MarketTrend {
  indicator: string;
  value: number;
  change: number;
  changeType: 'increase' | 'decrease' | 'stable';
  period: string;
  forecast?: number[];
}

export interface PriceAnalysis {
  currentPrice: number;
  priceRange: PriceRange;
  priceHistory: Array<{
    date: string;
    price: number;
  }>;
  priceFactors: string[];
  forecast: Array<{
    date: string;
    price: number;
    confidence: number;
  }>;
}

export interface SupplierAnalysis {
  supplier: Company;
  score: number;
  strengths: string[];
  weaknesses: string[];
  riskFactors: string[];
  recommendations: string[];
  performance: {
    deliveryTime: number;
    quality: number;
    communication: number;
    pricing: number;
  };
}

// Agent Types
export interface Agent extends BaseEntity {
  name: string;
  type: 'procurement' | 'sales' | 'logistics' | 'quality' | 'market_research';
  description: string;
  capabilities: string[];
  status: 'active' | 'inactive' | 'training';
  configuration: Record<string, any>;
  performance: AgentPerformance;
  tasks: AgentTask[];
  lastActivity: string;
}

export interface AgentPerformance {
  tasksCompleted: number;
  successRate: number;
  averageResponseTime: number;
  accuracy: number;
  userSatisfaction: number;
  efficiency: number;
  lastEvaluated: string;
}

export interface AgentTask extends BaseEntity {
  agentId: string;
  type: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  input: Record<string, any>;
  output?: Record<string, any>;
  startedAt?: string;
  completedAt?: string;
  duration?: number;
  error?: string;
  metadata: Record<string, any>;
}

// Dashboard Types
export interface DashboardMetric {
  id: string;
  name: string;
  value: number;
  previousValue?: number;
  change?: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  format: 'number' | 'currency' | 'percentage';
  trend: number[];
  target?: number;
  unit?: string;
  description?: string;
}

export interface DashboardWidget {
  id: string;
  type: 'metric' | 'chart' | 'table' | 'list' | 'map' | 'calendar';
  title: string;
  description?: string;
  size: 'small' | 'medium' | 'large';
  position: { x: number; y: number };
  data: any;
  config: Record<string, any>;
  refreshInterval?: number;
  lastUpdated: string;
}

// System Types
export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  services: ServiceHealth[];
  uptime: number;
  lastChecked: string;
  issues: SystemIssue[];
}

export interface ServiceHealth {
  name: string;
  status: 'up' | 'down' | 'degraded';
  responseTime: number;
  uptime: number;
  lastChecked: string;
  version?: string;
}

export interface SystemIssue {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  service: string;
  startedAt: string;
  resolvedAt?: string;
  status: 'open' | 'investigating' | 'resolved';
}

// Export utility functions for type checking
export const isUser = (obj: any): obj is User => {
  return obj && typeof obj.id === 'string' && typeof obj.email === 'string';
};

export const isOrder = (obj: any): obj is Order => {
  return obj && typeof obj.id === 'string' && typeof obj.orderNumber === 'string';
};

export const isProduct = (obj: any): obj is Product => {
  return obj && typeof obj.id === 'string' && typeof obj.name === 'string';
};

export const isRFQ = (obj: any): obj is RFQ => {
  return obj && typeof obj.id === 'string' && typeof obj.rfqNumber === 'string';
};