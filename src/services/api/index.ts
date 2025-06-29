import { User, Product, Supplier, RFQ, Order, APIResponse, PaginatedResponse } from '../types';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class APIService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    const token = localStorage.getItem('foodxchange_token');
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  }

  // Authentication
  async login(email: string, password: string): Promise<APIResponse<{ token: string; user: User }>> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async logout(): Promise<void> {
    localStorage.removeItem('foodxchange_token');
    localStorage.removeItem('foodxchange_user');
  }

  // Products
  async getProducts(filters?: any): Promise<PaginatedResponse<Product>> {
    const params = new URLSearchParams(filters).toString();
    return this.request(`/products?${params}`);
  }

  async getProduct(id: string): Promise<APIResponse<Product>> {
    return this.request(`/products/${id}`);
  }

  // Suppliers
  async getSuppliers(filters?: any): Promise<PaginatedResponse<Supplier>> {
    const params = new URLSearchParams(filters).toString();
    return this.request(`/suppliers?${params}`);
  }

  async getSupplier(id: string): Promise<APIResponse<Supplier>> {
    return this.request(`/suppliers/${id}`);
  }

  // RFQs
  async getRFQs(status?: string): Promise<PaginatedResponse<RFQ>> {
    const params = status ? `?status=${status}` : '';
    return this.request(`/rfqs${params}`);
  }

  async createRFQ(rfq: Partial<RFQ>): Promise<APIResponse<RFQ>> {
    return this.request('/rfqs', {
      method: 'POST',
      body: JSON.stringify(rfq),
    });
  }

  async getRFQ(id: string): Promise<APIResponse<RFQ>> {
    return this.request(`/rfqs/${id}`);
  }

  // Orders
  async getOrders(filters?: any): Promise<PaginatedResponse<Order>> {
    const params = new URLSearchParams(filters).toString();
    return this.request(`/orders?${params}`);
  }

  async getOrder(id: string): Promise<APIResponse<Order>> {
    return this.request(`/orders/${id}`);
  }

  // Health check
  async healthCheck(): Promise<{ status: string; message: string }> {
    return this.request('/health');
  }
}

export const apiService = new APIService();
export default apiService;
