// src/types/index.ts
// FoodXchange TypeScript Type Definitions

export interface User {
  id: string;
  email: string;
  name: string;
  company: string;
  role: 'buyer' | 'supplier' | 'admin';
  avatar?: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: string;
  name: string;
  type: 'buyer' | 'supplier';
  description: string;
  website?: string;
  logo?: string;
  address: Address;
  certifications: Certification[];
  verified: boolean;
  rating: number;
  totalTrades: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface Certification {
  id: string;
  type: string;
  name: string;
  authority: string;
  number: string;
  validFrom: string;
  validUntil: string;
  documentUrl?: string;
  verified: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  supplier: Supplier;
  images: string[];
  specifications: Record<string, any>;
  certifications: string[];
  pricing: {
    unitPrice: number;
    currency: string;
    unit: string;
    minimumOrder: number;
    priceBreaks?: PriceBreak[];
  };
  availability: {
    inStock: boolean;
    quantity: number;
    leadTime: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PriceBreak {
  minQuantity: number;
  price: number;
  leadTime?: number;
}

export interface Supplier {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  country: string;
  verified: boolean;
  rating: number;
  totalProducts: number;
  specialties: string[];
  certifications: string[];
}

export interface RFQ {
  id: string;
  referenceNumber: string;
  title: string;
  description: string;
  category: string;
  buyer: {
    companyId: string;
    userId: string;
    companyName: string;
  };
  products: RFQProduct[];
  requirements: {
    certifications: string[];
    qualityStandards: string[];
    paymentTerms: string[];
    deliveryTerms: string;
  };
  timeline: {
    publishedAt: string;
    deadline: string;
    deliveryDate: string;
  };
  status: 'draft' | 'published' | 'closed' | 'awarded';
  responses: RFQResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface RFQProduct {
  name: string;
  specifications: Record<string, any>;
  quantity: number;
  unit: string;
  targetPrice?: number;
  samples: boolean;
}

export interface RFQResponse {
  id: string;
  rfqId: string;
  supplier: Supplier;
  products: RFQResponseProduct[];
  totalPrice: number;
  currency: string;
  deliveryTerms: string;
  paymentTerms: string;
  validUntil: string;
  notes?: string;
  status: 'submitted' | 'accepted' | 'rejected';
  submittedAt: string;
}

export interface RFQResponseProduct {
  name: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  leadTime: number;
  specifications: Record<string, any>;
  samples?: {
    available: boolean;
    cost: number;
    deliveryTime: number;
  };
}

export interface Order {
  id: string;
  orderNumber: string;
  rfqId?: string;
  buyer: Company;
  supplier: Company;
  products: OrderProduct[];
  pricing: {
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
    currency: string;
  };
  delivery: {
    address: Address;
    method: string;
    estimatedDate: string;
    actualDate?: string;
    trackingNumber?: string;
  };
  payment: {
    method: string;
    terms: string;
    status: 'pending' | 'paid' | 'failed';
    dueDate: string;
    paidAt?: string;
  };
  status: 'draft' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  documents: OrderDocument[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderProduct {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specifications: Record<string, any>;
}

export interface OrderDocument {
  id: string;
  type: 'invoice' | 'contract' | 'certificate' | 'shipping';
  name: string;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
}

// API Response Types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  company: string;
  role: 'buyer' | 'supplier';
  phone: string;
  country: string;
}

export interface RFQFormData {
  title: string;
  description: string;
  category: string;
  products: RFQProduct[];
  certifications: string[];
  deliveryDate: string;
  deliveryLocation: string;
}

// Filter and Search Types
export interface ProductFilters {
  category?: string;
  supplier?: string;
  country?: string;
  certifications?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  inStock?: boolean;
}

export interface SearchParams {
  query?: string;
  filters?: ProductFilters;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// UI Component Types
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface TableColumn<T = any> {
  key: keyof T;
  title: string;
  sortable?: boolean;
  render?: (value: any, record: T) => React.ReactNode;
}

export interface NotificationData {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}
