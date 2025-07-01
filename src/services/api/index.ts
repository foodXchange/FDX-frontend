// API Types
export interface APIResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination: {
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
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
}

export interface Supplier {
  id: string;
  companyName: string;
  email: string;
  country: string;
}

export interface RFQ {
  id: string;
  title: string;
  description: string;
  status: string;
  userId: string;
}

export interface Order {
  id: string;
  rfqId: string;
  supplierId: string;
  status: string;
  amount: number;
}

// API Configuration
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class APIService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    const url = ${API_BASE};
    const token = localStorage.getItem('auth_token');

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: Bearer  }),
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
    return this.request(/products?);
  }

  async getProduct(id: string): Promise<APIResponse<Product>> {
    return this.request(/products/);
  }

  async createProduct(productData: any): Promise<APIResponse<Product>> {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(id: string, productData: any): Promise<APIResponse<Product>> {
    return this.request(/products/, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(id: string): Promise<APIResponse> {
    return this.request(/products/, {
      method: 'DELETE',
    });
  }

  // Suppliers
  async getSuppliers(params?: any): Promise<PaginatedResponse<Supplier>> {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    return this.request(/suppliers?);
  }

  async getSupplier(id: string): Promise<APIResponse<Supplier>> {
    return this.request(/suppliers/);
  }

  // RFQs
  async getRFQs(params?: any): Promise<PaginatedResponse<RFQ>> {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    return this.request(/rfqs?);
  }

  async getRFQ(id: string): Promise<APIResponse<RFQ>> {
    return this.request(/rfqs/);
  }

  async createRFQ(rfqData: any): Promise<APIResponse<RFQ>> {
    return this.request('/rfqs', {
      method: 'POST',
      body: JSON.stringify(rfqData),
    });
  }

  async updateRFQ(id: string, rfqData: any): Promise<APIResponse<RFQ>> {
    return this.request(/rfqs/, {
      method: 'PUT',
      body: JSON.stringify(rfqData),
    });
  }

  async publishRFQ(id: string): Promise<APIResponse<RFQ>> {
    return this.request(/rfqs//publish, {
      method: 'POST',
    });
  }

  async closeRFQ(id: string): Promise<APIResponse<RFQ>> {
    return this.request(/rfqs//close, {
      method: 'POST',
    });
  }

  // Orders
  async getOrders(params?: any): Promise<PaginatedResponse<Order>> {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    return this.request(/orders?);
  }

  async getOrder(id: string): Promise<APIResponse<Order>> {
    return this.request(/orders/);
  }

  async createOrder(orderData: any): Promise<APIResponse<Order>> {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async updateOrderStatus(id: string, status: string): Promise<APIResponse<Order>> {
    return this.request(/orders//status, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Search
  async search(query: string, type?: string): Promise<APIResponse<any>> {
    const params = new URLSearchParams({ q: query });
    if (type) params.append('type', type);
    return this.request(/search?);
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
