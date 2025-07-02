export interface User {
  id: string;
  email: string;
  name: string;
  company: string;
  role: 'buyer' | 'supplier' | 'broker' | 'admin';
}

export interface RFQ {
  id: string;
  title: string;
  description: string;
  productType: string;
  status: 'draft' | 'published' | 'closed';
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  supplierId: string;
  price: number;
}

export interface Order {
  id: string;
  rfqId: string;
  buyerId: string;
  supplierId: string;
  status: 'confirmed' | 'shipped' | 'delivered';
}

export interface DashboardStats {
  totalRFQs: number;
  activeRFQs: number;
  totalOrders: number;
  totalRevenue: number;
}

export interface Notification {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  message: string;
  timestamp: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
