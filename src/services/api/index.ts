// src/services/api/index.ts
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  company?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  supplierId: string;
}

export interface Supplier {
  id: string;
  name: string;
  email: string;
  country: string;
  certifications: string[];
}

export interface RFQ {
  id: string;
  referenceNumber: string;
  title: string;
  description: string;
  category: string;
  status: 'draft' | 'published' | 'closed';
  createdBy: string;
  deadline: string;
  buyer: {
    companyId: string;
    userId: string;
    companyName: string;
  };
  products: any[];
  requirements: {
    certifications: string[];
    qualityStandards: string[];
    paymentTerms: string[];
    deliveryTerms: string;
  };
}

export interface Order {
  id: string;
  rfqId: string;
  supplierId: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
  total: number;
}

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// Admin interfaces
export interface SystemHealth {
  status: string;
  uptime: number;
  responseTime: number;
  memoryUsage: number;
  activeConnections: number;
  dbStatus: string;
  apis: string[];
}

export interface AdminHealthData {
  status: string;
  uptime: number;
  responseTime: number;
  memoryUsage: number;
  activeConnections: number;
  dbStatus: string;
  apis: string[];
}

class APIService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    const url = `${API_BASE}${endpoint}`;
    const token = localStorage.getItem('auth_token');

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  // Authentication
  async login(email: string, password: string): Promise<APIResponse<{ user: User; token: string }>> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: any): Promise<APIResponse<{ user: User; token: string }>> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout(): Promise<APIResponse> {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  // Users
  async getCurrentUser(): Promise<APIResponse<User>> {
    return this.request('/users/me');
  }

  async updateProfile(userData: Partial<User>): Promise<APIResponse<User>> {
    return this.request('/users/me', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Products
  async getProducts(params?: any): Promise<PaginatedResponse<Product>> {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    return this.request(`/products?${queryString}`);
  }

  async getProduct(id: string): Promise<APIResponse<Product>> {
    return this.request(`/products/${id}`);
  }

  async createProduct(productData: any): Promise<APIResponse<Product>> {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(id: string, productData: any): Promise<APIResponse<Product>> {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(id: string): Promise<APIResponse> {
    return this.request(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  // Suppliers
  async getSuppliers(params?: any): Promise<PaginatedResponse<Supplier>> {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    return this.request(`/suppliers?${queryString}`);
  }

  async getSupplier(id: string): Promise<APIResponse<Supplier>> {
    return this.request(`/suppliers/${id}`);
  }

  // RFQs
  async getRFQs(params?: any): Promise<PaginatedResponse<RFQ>> {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    return this.request(`/rfqs?${queryString}`);
  }

  async getRFQ(id: string): Promise<APIResponse<RFQ>> {
    return this.request(`/rfqs/${id}`);
  }

  async createRFQ(rfqData: any): Promise<APIResponse<RFQ>> {
    return this.request('/rfqs', {
      method: 'POST',
      body: JSON.stringify(rfqData),
    });
  }

  async updateRFQ(id: string, rfqData: any): Promise<APIResponse<RFQ>> {
    return this.request(`/rfqs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(rfqData),
    });
  }

  async publishRFQ(id: string): Promise<APIResponse<RFQ>> {
    return this.request(`/rfqs/${id}/publish`, {
      method: 'POST',
    });
  }

  async closeRFQ(id: string): Promise<APIResponse<RFQ>> {
    return this.request(`/rfqs/${id}/close`, {
      method: 'POST',
    });
  }

  // Orders
  async getOrders(params?: any): Promise<PaginatedResponse<Order>> {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    return this.request(`/orders?${queryString}`);
  }

  async getOrder(id: string): Promise<APIResponse<Order>> {
    return this.request(`/orders/${id}`);
  }

  async createOrder(orderData: any): Promise<APIResponse<Order>> {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async updateOrderStatus(id: string, status: string): Promise<APIResponse<Order>> {
    return this.request(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Search
  async search(query: string, type?: string): Promise<APIResponse<any>> {
    const params = new URLSearchParams({ q: query });
    if (type) params.append('type', type);
    return this.request(`/search?${params.toString()}`);
  }

  // File Upload
  async uploadFile(file: File, type: string): Promise<APIResponse<{ url: string }>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    return this.request('/upload', {
      method: 'POST',
      headers: {}, // Remove Content-Type to let browser set it for FormData
      body: formData,
    });
  }
}

// Admin API Service
class AdminAPIService {
  private api = new APIService();

  async getSystemHealth(): Promise<APIResponse<AdminHealthData>> {
    // Mock data for now - replace with actual API call
    return {
      success: true,
      data: {
        status: 'healthy',
        uptime: 12345,
        responseTime: 45,
        memoryUsage: 68,
        activeConnections: 150,
        dbStatus: 'connected',
        apis: ['auth', 'rfqs', 'products']
      }
    };
  }

  async getUsageStats(): Promise<APIResponse<any>> {
    return {
      success: true,
      data: {
        dailyUsers: 150,
        totalRFQs: 247,
        activeSuppliers: 89
      }
    };
  }

  async getAIUsage(): Promise<APIResponse<any>> {
    return {
      success: true,
      data: {
        totalQueries: 1250,
        successRate: 95.2
      }
    };
  }

  async getUserActivity(): Promise<APIResponse<any>> {
    return {
      success: true,
      data: {
        activeUsers: 45,
        newRegistrations: 12
      }
    };
  }

  async getSecurityAlerts(): Promise<APIResponse<any>> {
    return {
      success: true,
      data: {
        totalAlerts: 3,
        criticalAlerts: 0
      }
    };
  }
}

export const api = new APIService();
export const adminApi = new AdminAPIService();
export default api;