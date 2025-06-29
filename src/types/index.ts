// FoodXchange Type Definitions
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'buyer' | 'supplier' | 'admin';
  company?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  minOrder: number;
  supplier: Supplier;
  images: string[];
  certifications: string[];
  category: string;
}

export interface Supplier {
  id: string;
  name: string;
  description: string;
  rating: number;
  verified: boolean;
  location: string;
  categories: string[];
  certifications: string[];
  responseTime: string;
  totalProducts: number;
  website?: string;
}

export interface RFQ {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'published' | 'closed';
  deadline: string;
  products: RFQProduct[];
  buyer: User;
  createdAt: string;
  updatedAt: string;
}

export interface RFQProduct {
  name: string;
  quantity: number;
  unit: string;
  specifications?: string;
}

export interface Order {
  id: string;
  rfqId: string;
  supplierId: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  items: OrderItem[];
  totalAmount: number;
  expectedDelivery: string;
  actualDelivery?: string;
  trackingNumber?: string;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  unit: string;
  price: number;
}

export interface APIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}
