// src/services/api/index.ts
import { User, Product, Supplier, RFQ, Order, APIResponse, PaginatedResponse } from '../../types';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class APIService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    const url = {API_BASE}{endpoint};
    const token = localStorage.getItem('auth_token');

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: Bearer {token} }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
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
    return this.request(/products?{queryString});
  }

  async getProduct(id: string): Promise<APIResponse<Product>> {
    return this.request(/products/{id});
  }

  async createProduct(productData: any): Promise<APIResponse<Product>> {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(id: string, productData: any): Promise<APIResponse<Product>> {
    return this.request(/products/{id}, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(id: string): Promise<APIResponse> {
    return this.request(/products/{id}, {
      method: 'DELETE',
    });
  }

  // Suppliers
  async getSuppliers(params?: any): Promise<PaginatedResponse<Supplier>> {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    return this.request(/suppliers?{queryString});
  }

  async getSupplier(id: string): Promise<APIResponse<Supplier>> {
    return this.request(/suppliers/{id});
  }

  // RFQs
  async getRFQs(params?: any): Promise<PaginatedResponse<RFQ>> {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    return this.request(/rfqs?{queryString});
  }

  async getRFQ(id: string): Promise<APIResponse<RFQ>> {
    return this.request(/rfqs/{id});
  }

  async createRFQ(rfqData: any): Promise<APIResponse<RFQ>> {
    return this.request('/rfqs', {
      method: 'POST',
      body: JSON.stringify(rfqData),
    });
  }

  async updateRFQ(id: string, rfqData: any): Promise<APIResponse<RFQ>> {
    return this.request(/rfqs/{id}, {
      method: 'PUT',
      body: JSON.stringify(rfqData),
    });
  }

  async publishRFQ(id: string): Promise<APIResponse<RFQ>> {
    return this.request(/rfqs/{id}/publish, {
      method: 'POST',
    });
  }

  async closeRFQ(id: string): Promise<APIResponse<RFQ>> {
    return this.request(/rfqs/{id}/close, {
      method: 'POST',
    });
  }

  // Orders
  async getOrders(params?: any): Promise<PaginatedResponse<Order>> {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    return this.request(/orders?{queryString});
  }

  async getOrder(id: string): Promise<APIResponse<Order>> {
    return this.request(/orders/{id});
  }

  async createOrder(orderData: any): Promise<APIResponse<Order>> {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async updateOrderStatus(id: string, status: string): Promise<APIResponse<Order>> {
    return this.request(/orders/{id}/status, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Search
  async search(query: string, type?: string): Promise<APIResponse<any>> {
    const params = new URLSearchParams({ q: query });
    if (type) params.append('type', type);
    return this.request(/search?{params.toString()});
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

export const api = new APIService();
export default api;
