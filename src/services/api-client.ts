// API Client Configuration for Frontend
// Copy this file to your frontend project: src/services/api-client.ts

import axios, { AxiosInstance, AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import type {
  ApiResponse,
  ApiError,
  LoginRequest,
  LoginResponse,
  User,
  Product,
  RFQ,
  Proposal,
  Order,
  SearchParams,
  ComplianceValidation,
  SampleRequest,
  AIAnalysisResponse,
  AIMatchingResult
} from '@shared/types';

// Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const REQUEST_TIMEOUT = 30000; // 30 seconds
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000; // 1 second

// Retry configuration
interface RetryConfig extends AxiosRequestConfig {
  _retryCount?: number;
  _retryDelay?: number;
}

// Request queue for offline support
class RequestQueue {
  private queue: Array<{ config: AxiosRequestConfig; timestamp: number }> = [];
  private processing = false;

  add(config: AxiosRequestConfig) {
    this.queue.push({ config, timestamp: Date.now() });
    this.process();
  }

  async process() {
    if (this.processing || !navigator.onLine) return;
    
    this.processing = true;
    while (this.queue.length > 0 && navigator.onLine) {
      const request = this.queue.shift();
      if (request) {
        try {
          await axios(request.config);
        } catch (error) {
          // If still failing, add back to queue
          if (!isNetworkError(error)) {
            this.queue.unshift(request);
          }
        }
      }
    }
    this.processing = false;
  }
}

const requestQueue = new RequestQueue();

// Helper to check if error is network related
const isNetworkError = (error: any): boolean => {
  return !error.response && error.code !== 'ECONNABORTED';
};

// Helper to determine if request should be retried
const shouldRetry = (error: AxiosError, config: RetryConfig): boolean => {
  const retryCount = config._retryCount || 0;
  
  // Don't retry if max attempts reached
  if (retryCount >= MAX_RETRY_ATTEMPTS) return false;
  
  // Retry on network errors or 5xx errors
  if (!error.response) return true;
  if (error.response.status >= 500) return true;
  if (error.response.status === 429) return true; // Rate limit
  
  return false;
};

// Sleep helper for retry delay
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Create axios instance
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: REQUEST_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // Add auth token
      const token = localStorage.getItem('authToken');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Add request ID for tracking
      if (config.headers) {
        config.headers['X-Request-ID'] = generateRequestId();
      }

      // Add timestamp for request timing
      (config as any).metadata = { startTime: Date.now() };

      return config;
    },
    (error) => {
      console.error('Request error:', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor
  client.interceptors.response.use(
    (response) => {
      // Log response time
      const config = response.config as any;
      if (config.metadata) {
        const duration = Date.now() - config.metadata.startTime;
        console.debug(`API call to ${config.url} took ${duration}ms`);
      }

      // Return data directly
      return response.data;
    },
    async (error: AxiosError<ApiError>) => {
      const originalRequest = error.config as RetryConfig;
      
      // Handle retry logic
      if (originalRequest && shouldRetry(error, originalRequest)) {
        originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
        const delay = originalRequest._retryDelay || RETRY_DELAY;
        originalRequest._retryDelay = delay * 2; // Exponential backoff
        
        console.warn(`Retrying request (attempt ${originalRequest._retryCount}/${MAX_RETRY_ATTEMPTS})`);
        await sleep(delay);
        
        return client(originalRequest);
      }

      // Handle offline mode
      if (isNetworkError(error) && originalRequest) {
        // Queue the request for later
        requestQueue.add(originalRequest);
        return Promise.reject({
          success: false,
          message: 'You are offline. Request will be sent when connection is restored.',
          errors: ['Network error'],
          statusCode: 0,
          requestId: generateRequestId(),
        } as ApiError);
      }

      const { response } = error;

      if (response) {
        // Handle specific error cases
        switch (response.status) {
          case 401:
            // Unauthorized - try to refresh token first
            if (originalRequest && !originalRequest.url?.includes('/auth/refresh')) {
              try {
                const refreshResponse = await client.post('/auth/refresh');
                const newToken = refreshResponse.data.token;
                localStorage.setItem('authToken', newToken);
                
                // Retry original request with new token
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${newToken}`;
                }
                return client(originalRequest);
              } catch (refreshError) {
                // Refresh failed - clear token and redirect
                localStorage.removeItem('authToken');
                window.location.href = '/login';
              }
            }
            break;
          
          case 403:
            // Forbidden - emit event for global error handling
            window.dispatchEvent(new CustomEvent('api:forbidden', { detail: response.data }));
            break;
          
          case 429:
            // Rate limited - show appropriate message
            const retryAfter = response.headers['retry-after'];
            window.dispatchEvent(new CustomEvent('api:rate-limited', { 
              detail: { retryAfter, message: response.data.message }
            }));
            break;
          
          case 500:
          case 502:
          case 503:
          case 504:
            // Server error
            window.dispatchEvent(new CustomEvent('api:server-error', { detail: response.data }));
            break;
        }

        // Return the error response
        return Promise.reject(response.data);
      }

      // Unknown error
      return Promise.reject({
        success: false,
        message: error.message || 'An unexpected error occurred',
        errors: [error.message || 'Unknown error'],
        statusCode: 0,
        requestId: generateRequestId(),
      } as ApiError);
    }
  );

  return client;
};

// Generate unique request ID
const generateRequestId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Create temporary instance for internal use
const tempApiClient = createApiClient();

// API Service Methods
export const api = {
  // Health check
  get: (endpoint: string): Promise<ApiResponse> =>
    tempApiClient.get(endpoint),
    
  // Authentication
  auth: {
    login: (data: LoginRequest): Promise<ApiResponse<LoginResponse>> =>
      tempApiClient.post('/auth/login', data),
    
    register: (data: any): Promise<ApiResponse<User>> =>
      tempApiClient.post('/auth/register', data),
    
    logout: (): Promise<ApiResponse> =>
      tempApiClient.post('/auth/logout'),
    
    refreshToken: (): Promise<ApiResponse<{ token: string }>> =>
      tempApiClient.post('/auth/refresh'),
    
    forgotPassword: (email: string): Promise<ApiResponse> =>
      tempApiClient.post('/auth/forgot-password', { email }),
    
    resetPassword: (token: string, password: string): Promise<ApiResponse> =>
      tempApiClient.post('/auth/reset-password', { token, password }),
  },

  // Products
  products: {
    getAll: (params?: SearchParams): Promise<ApiResponse<Product[]>> =>
      tempApiClient.get('/products', { params }),
    
    getById: (id: string): Promise<ApiResponse<Product>> =>
      tempApiClient.get(`/products/${id}`),
    
    getFeatured: (): Promise<ApiResponse<Product[]>> =>
      tempApiClient.get('/products/featured'),
    
    getCategories: (): Promise<ApiResponse<any[]>> =>
      tempApiClient.get('/products/categories'),
    
    create: (data: FormData): Promise<ApiResponse<Product>> =>
      tempApiClient.post('/products', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    
    update: (id: string, data: Partial<Product>): Promise<ApiResponse<Product>> =>
      tempApiClient.put(`/products/${id}`, data),
    
    delete: (id: string): Promise<ApiResponse> =>
      tempApiClient.delete(`/products/${id}`),
    
    requestSample: (productId: string, data: any): Promise<ApiResponse<SampleRequest>> =>
      tempApiClient.post(`/products/${productId}/sample-request`, data),
  },

  // RFQs
  rfqs: {
    getAll: (params?: SearchParams): Promise<ApiResponse<RFQ[]>> =>
      tempApiClient.get('/rfq', { params }),
    
    getById: (id: string): Promise<ApiResponse<RFQ>> =>
      tempApiClient.get(`/rfq/${id}`),
    
    create: (data: Partial<RFQ>): Promise<ApiResponse<RFQ>> =>
      tempApiClient.post('/rfq', data),
    
    update: (id: string, data: Partial<RFQ>): Promise<ApiResponse<RFQ>> =>
      tempApiClient.put(`/rfq/${id}`, data),
    
    updateStatus: (id: string, status: string): Promise<ApiResponse<RFQ>> =>
      tempApiClient.patch(`/rfq/${id}/status`, { status }),
    
    delete: (id: string): Promise<ApiResponse> =>
      tempApiClient.delete(`/rfq/${id}`),
  },

  // Proposals
  proposals: {
    create: (data: Partial<Proposal>): Promise<ApiResponse<Proposal>> =>
      tempApiClient.post('/proposals', data),
    
    getByRFQ: (rfqId: string): Promise<ApiResponse<Proposal[]>> =>
      tempApiClient.get(`/proposals/rfq/${rfqId}`),
    
    getById: (id: string): Promise<ApiResponse<Proposal>> =>
      tempApiClient.get(`/proposals/${id}`),
    
    accept: (id: string): Promise<ApiResponse<Proposal>> =>
      tempApiClient.put(`/proposals/${id}/accept`),
  },

  // Orders
  orders: {
    getAll: (params?: SearchParams): Promise<ApiResponse<Order[]>> =>
      tempApiClient.get('/orders', { params }),
    
    getById: (id: string): Promise<ApiResponse<Order>> =>
      tempApiClient.get(`/orders/${id}`),
    
    updateStatus: (id: string, status: string): Promise<ApiResponse<Order>> =>
      tempApiClient.patch(`/orders/${id}/status`, { status }),
  },

  // Compliance
  compliance: {
    validate: (data: any): Promise<ApiResponse<ComplianceValidation>> =>
      tempApiClient.post('/compliance/validate', data),
    
    validateField: (field: string, value: any): Promise<ApiResponse> =>
      tempApiClient.post('/compliance/validate-field', { field, value }),
    
    getHistory: (params?: SearchParams): Promise<ApiResponse<ComplianceValidation[]>> =>
      tempApiClient.get('/compliance/history', { params }),
    
    getRules: (productType: string, targetMarket?: string): Promise<ApiResponse<any>> =>
      tempApiClient.get(`/compliance/rules/${productType}${targetMarket ? `/${targetMarket}` : ''}`),
    
    getReport: (rfqId: string): Promise<ApiResponse<any>> =>
      tempApiClient.get(`/compliance/report/${rfqId}`),
  },

  // AI Services
  ai: {
    analyzeRFQ: (rfqData: any): Promise<ApiResponse<AIMatchingResult[]>> =>
      tempApiClient.post('/ai/rfq/analyze', rfqData),
    
    analyzeProduct: (productId: string): Promise<ApiResponse<AIAnalysisResponse>> =>
      tempApiClient.post(`/ai/product/${productId}/analyze`),
    
    batchAnalyzeProducts: (productIds: string[]): Promise<ApiResponse<AIAnalysisResponse[]>> =>
      tempApiClient.post('/ai/products/batch-analyze', { productIds }),
  },

  // Sample Requests
  samples: {
    getAll: (params?: SearchParams): Promise<ApiResponse<SampleRequest[]>> =>
      tempApiClient.get('/samples', { params }),
    
    getById: (id: string): Promise<ApiResponse<SampleRequest>> =>
      tempApiClient.get(`/samples/${id}`),
    
    updateStatus: (id: string, status: string): Promise<ApiResponse<SampleRequest>> =>
      tempApiClient.patch(`/samples/${id}/status`, { status }),
    
    submitFeedback: (id: string, feedback: any): Promise<ApiResponse> =>
      tempApiClient.post(`/samples/${id}/feedback`, feedback),
  },

  // File Upload
  upload: {
    single: (file: File, type: string): Promise<ApiResponse<{ url: string }>> => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      
      return tempApiClient.post('/upload/single', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    
    multiple: (files: File[], type: string): Promise<ApiResponse<{ urls: string[] }>> => {
      const formData = new FormData();
      files.forEach((file) => formData.append('files', file));
      formData.append('type', type);
      
      return tempApiClient.post('/upload/multiple', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
  },

  // Import
  import: {
    products: (file: File): Promise<ApiResponse<any>> => {
      const formData = new FormData();
      formData.append('file', file);
      
      return tempApiClient.post('/import/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
  },
};

// Monitor online/offline status
window.addEventListener('online', () => {
  console.log('Back online - processing queued requests');
  requestQueue.process();
});

// Export configured axios instance
export const apiClient = createApiClient();

// Helper functions
export const setAuthToken = (token: string): void => {
  localStorage.setItem('authToken', token);
  apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export const clearAuthToken = (): void => {
  localStorage.removeItem('authToken');
  delete apiClient.defaults.headers.common['Authorization'];
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

// Export default instance for backward compatibility
export default apiClient;

// Export types for convenience
export type { ApiResponse, ApiError } from '@shared/types';