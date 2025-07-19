// API Client service for handling HTTP requests with authentication, retries, and error handling
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
    
    // AI-powered features
    analyzeWithAI: (id: string): Promise<ApiResponse<any>> =>
      tempApiClient.post(`/rfq/${id}/ai-analysis`),
    
    getAIMatches: (id: string, options?: any): Promise<ApiResponse<any[]>> =>
      tempApiClient.post(`/rfq/${id}/ai-matches`, options),
    
    optimizeRequirements: (id: string): Promise<ApiResponse<any>> =>
      tempApiClient.post(`/rfq/${id}/optimize`),
    
    generateSpecifications: (id: string, productType: string): Promise<ApiResponse<any>> =>
      tempApiClient.post(`/rfq/${id}/generate-specs`, { productType }),
    
    validateCompliance: (id: string, targetMarkets: string[]): Promise<ApiResponse<any>> =>
      tempApiClient.post(`/rfq/${id}/validate-compliance`, { targetMarkets }),
    
    predictPricing: (id: string): Promise<ApiResponse<any>> =>
      tempApiClient.post(`/rfq/${id}/predict-pricing`),
    
    recommendSuppliers: (id: string, criteria?: any): Promise<ApiResponse<any[]>> =>
      tempApiClient.post(`/rfq/${id}/recommend-suppliers`, criteria),
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
    
    create: (data: any): Promise<ApiResponse<Order>> =>
      tempApiClient.post('/orders', data),
    
    update: (id: string, data: any): Promise<ApiResponse<Order>> =>
      tempApiClient.put(`/orders/${id}`, data),
    
    updateStatus: (id: string, status: string): Promise<ApiResponse<Order>> =>
      tempApiClient.patch(`/orders/${id}/status`, { status }),
    
    cancel: (id: string, reason: string): Promise<ApiResponse<Order>> =>
      tempApiClient.post(`/orders/${id}/cancel`, { reason }),
    
    approve: (id: string, notes?: string): Promise<ApiResponse<Order>> =>
      tempApiClient.post(`/orders/${id}/approve`, { notes }),
    
    confirm: (id: string, estimatedDeliveryDate: string): Promise<ApiResponse<Order>> =>
      tempApiClient.post(`/orders/${id}/confirm`, { estimatedDeliveryDate }),
    
    getSummary: (dateRange?: { start: string; end: string }): Promise<ApiResponse<any>> => {
      const params = dateRange ? `?start=${dateRange.start}&end=${dateRange.end}` : '';
      return tempApiClient.get(`/orders/summary${params}`);
    },
    
    getDocuments: (id: string): Promise<ApiResponse<any[]>> =>
      tempApiClient.get(`/orders/${id}/documents`),
    
    uploadDocument: (id: string, file: File, type: string): Promise<ApiResponse<any>> => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      return tempApiClient.post(`/orders/${id}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    
    getCommunications: (id: string): Promise<ApiResponse<any[]>> =>
      tempApiClient.get(`/orders/${id}/communications`),
    
    addCommunication: (id: string, data: any): Promise<ApiResponse<any>> =>
      tempApiClient.post(`/orders/${id}/communications`, data),
    
    processPayment: (id: string, paymentDetails: any): Promise<ApiResponse<any>> =>
      tempApiClient.post(`/orders/${id}/payments`, paymentDetails),
    
    getTracking: (id: string): Promise<ApiResponse<any>> =>
      tempApiClient.get(`/orders/${id}/tracking`),
    
    bulkUpdate: (orderIds: string[], updates: any): Promise<ApiResponse<any>> =>
      tempApiClient.post('/orders/bulk-update', { orderIds, updates }),
  },

    // Compliance Management
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
    
    // Certification Management
    getCertifications: (entityType: string, entityId?: string): Promise<ApiResponse<any[]>> =>
      tempApiClient.get('/compliance/certifications', { params: { entityType, entityId } }),
    
    addCertification: (data: any): Promise<ApiResponse<any>> =>
      tempApiClient.post('/compliance/certifications', data),
    
    updateCertification: (id: string, data: any): Promise<ApiResponse<any>> =>
      tempApiClient.put(`/compliance/certifications/${id}`, data),
    
    renewCertification: (id: string): Promise<ApiResponse<any>> =>
      tempApiClient.post(`/compliance/certifications/${id}/renew`),
    
    // Audit Management
    getAudits: (params?: any): Promise<ApiResponse<any[]>> =>
      tempApiClient.get('/compliance/audits', { params }),
    
    createAudit: (data: any): Promise<ApiResponse<any>> =>
      tempApiClient.post('/compliance/audits', data),
    
    updateAudit: (id: string, data: any): Promise<ApiResponse<any>> =>
      tempApiClient.put(`/compliance/audits/${id}`, data),
    
    completeAudit: (id: string, results: any): Promise<ApiResponse<any>> =>
      tempApiClient.post(`/compliance/audits/${id}/complete`, results),
    
    // Compliance Tracking
    getTrackingData: (entityType: string, entityId: string): Promise<ApiResponse<any>> =>
      tempApiClient.get(`/compliance/tracking/${entityType}/${entityId}`),
    
    updateComplianceStatus: (entityType: string, entityId: string, status: any): Promise<ApiResponse<any>> =>
      tempApiClient.put(`/compliance/tracking/${entityType}/${entityId}`, status),
    
    // Document Management
    getComplianceDocuments: (entityType: string, entityId: string): Promise<ApiResponse<any[]>> =>
      tempApiClient.get(`/compliance/documents/${entityType}/${entityId}`),
    
    uploadComplianceDocument: (entityType: string, entityId: string, file: File, docType: string): Promise<ApiResponse<any>> => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', docType);
      return tempApiClient.post(`/compliance/documents/${entityType}/${entityId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    
    // Regulatory Requirements
    getRegulatoryRequirements: (productType: string, markets: string[]): Promise<ApiResponse<any[]>> =>
      tempApiClient.post('/compliance/regulatory-requirements', { productType, markets }),
    
    checkCompliance: (entityType: string, entityId: string, requirements: string[]): Promise<ApiResponse<any>> =>
      tempApiClient.post(`/compliance/check/${entityType}/${entityId}`, { requirements }),
    
    // Analytics & Reporting
    getComplianceMetrics: (dateRange?: any): Promise<ApiResponse<any>> =>
      tempApiClient.get('/compliance/metrics', { params: dateRange }),
    
    generateComplianceReport: (options: any): Promise<ApiResponse<any>> =>
      tempApiClient.post('/compliance/reports/generate', options),
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

    // Sample Requests & Tracking
  samples: {
    getAll: (params?: SearchParams): Promise<ApiResponse<SampleRequest[]>> =>
      tempApiClient.get('/samples', { params }),
    
    getById: (id: string): Promise<ApiResponse<SampleRequest>> =>
      tempApiClient.get(`/samples/${id}`),
    
    create: (data: any): Promise<ApiResponse<SampleRequest>> =>
      tempApiClient.post('/samples', data),
    
    update: (id: string, data: any): Promise<ApiResponse<SampleRequest>> =>
      tempApiClient.put(`/samples/${id}`, data),
    
    updateStatus: (id: string, status: string): Promise<ApiResponse<SampleRequest>> =>
      tempApiClient.patch(`/samples/${id}/status`, { status }),
    
    submitFeedback: (id: string, feedback: any): Promise<ApiResponse> =>
      tempApiClient.post(`/samples/${id}/feedback`, feedback),
    
    // Real-time tracking features
    getTracking: (id: string): Promise<ApiResponse<any>> =>
      tempApiClient.get(`/samples/${id}/tracking`),
    
    updateLocation: (id: string, location: any): Promise<ApiResponse<any>> =>
      tempApiClient.post(`/samples/${id}/location`, location),
    
    addTrackingEvent: (id: string, event: any): Promise<ApiResponse<any>> =>
      tempApiClient.post(`/samples/${id}/events`, event),
    
    getTemperatureLog: (id: string): Promise<ApiResponse<any[]>> =>
      tempApiClient.get(`/samples/${id}/temperature`),
    
    addTemperatureReading: (id: string, reading: any): Promise<ApiResponse<any>> =>
      tempApiClient.post(`/samples/${id}/temperature`, reading),
    
    getChainOfCustody: (id: string): Promise<ApiResponse<any[]>> =>
      tempApiClient.get(`/samples/${id}/chain-of-custody`),
    
    updateCustody: (id: string, custodyData: any): Promise<ApiResponse<any>> =>
      tempApiClient.post(`/samples/${id}/custody-transfer`, custodyData),
    
    generateBarcode: (id: string): Promise<ApiResponse<{ barcode: string; qrCode: string }>> =>
      tempApiClient.post(`/samples/${id}/generate-barcode`),
    
    scanBarcode: (barcode: string): Promise<ApiResponse<SampleRequest>> =>
      tempApiClient.get(`/samples/barcode/${barcode}`),
    
    getAnalyticsData: (dateRange?: any): Promise<ApiResponse<any>> =>
      tempApiClient.get('/samples/analytics', { params: dateRange }),
  },


  // Expert Marketplace
  experts: {
    getAll: (params?: SearchParams): Promise<ApiResponse<any[]>> =>
      tempApiClient.get('/experts', { params }),
    
    getById: (id: string): Promise<ApiResponse<any>> =>
      tempApiClient.get(`/experts/${id}`),
    
    search: (query: any): Promise<ApiResponse<any[]>> =>
      tempApiClient.post('/experts/search', query),
    
    getAvailability: (id: string, dateRange?: any): Promise<ApiResponse<any>> =>
      tempApiClient.get(`/experts/${id}/availability`, { params: dateRange }),
    
    createBooking: (data: any): Promise<ApiResponse<any>> =>
      tempApiClient.post('/experts/bookings', data),
    
    getBookings: (params?: any): Promise<ApiResponse<any[]>> =>
      tempApiClient.get('/experts/bookings', { params }),
    
    updateBooking: (id: string, data: any): Promise<ApiResponse<any>> =>
      tempApiClient.put(`/experts/bookings/${id}`, data),
    
    cancelBooking: (id: string, reason: string): Promise<ApiResponse<any>> =>
      tempApiClient.post(`/experts/bookings/${id}/cancel`, { reason }),
    
    addReview: (expertId: string, review: any): Promise<ApiResponse<any>> =>
      tempApiClient.post(`/experts/${expertId}/reviews`, review),
    
    getReviews: (expertId: string): Promise<ApiResponse<any[]>> =>
      tempApiClient.get(`/experts/${expertId}/reviews`),
    
    createProject: (data: any): Promise<ApiResponse<any>> =>
      tempApiClient.post('/experts/projects', data),
    
    getProjects: (params?: any): Promise<ApiResponse<any[]>> =>
      tempApiClient.get('/experts/projects', { params }),
    
    updateProject: (id: string, data: any): Promise<ApiResponse<any>> =>
      tempApiClient.put(`/experts/projects/${id}`, data),
    
    getAnalytics: (expertId?: string): Promise<ApiResponse<any>> =>
      tempApiClient.get('/experts/analytics', { params: { expertId } }),
  },


  // Supplier Management
  suppliers: {
    getAll: (params?: SearchParams): Promise<ApiResponse<any[]>> =>
      tempApiClient.get('/suppliers', { params }),
    
    getById: (id: string): Promise<ApiResponse<any>> =>
      tempApiClient.get(`/suppliers/${id}`),
    
    create: (data: any): Promise<ApiResponse<any>> =>
      tempApiClient.post('/suppliers', data),
    
    update: (id: string, data: any): Promise<ApiResponse<any>> =>
      tempApiClient.put(`/suppliers/${id}`, data),
    
    delete: (id: string): Promise<ApiResponse> =>
      tempApiClient.delete(`/suppliers/${id}`),
    
    verify: (id: string, verificationData: any): Promise<ApiResponse<any>> =>
      tempApiClient.post(`/suppliers/${id}/verify`, verificationData),
    
    getVerificationStatus: (id: string): Promise<ApiResponse<any>> =>
      tempApiClient.get(`/suppliers/${id}/verification`),
    
    getCertifications: (id: string): Promise<ApiResponse<any[]>> =>
      tempApiClient.get(`/suppliers/${id}/certifications`),
    
    addCertification: (id: string, certification: any): Promise<ApiResponse<any>> =>
      tempApiClient.post(`/suppliers/${id}/certifications`, certification),
    
    getPerformanceMetrics: (id: string, dateRange?: any): Promise<ApiResponse<any>> =>
      tempApiClient.get(`/suppliers/${id}/performance`, { params: dateRange }),
    
    getCapabilities: (id: string): Promise<ApiResponse<any[]>> =>
      tempApiClient.get(`/suppliers/${id}/capabilities`),
    
    updateCapabilities: (id: string, capabilities: any[]): Promise<ApiResponse<any>> =>
      tempApiClient.put(`/suppliers/${id}/capabilities`, { capabilities }),
    
    getAuditHistory: (id: string): Promise<ApiResponse<any[]>> =>
      tempApiClient.get(`/suppliers/${id}/audits`),
    
    scheduleAudit: (id: string, auditData: any): Promise<ApiResponse<any>> =>
      tempApiClient.post(`/suppliers/${id}/audits`, auditData),
    
    getRiskAssessment: (id: string): Promise<ApiResponse<any>> =>
      tempApiClient.get(`/suppliers/${id}/risk-assessment`),
    
    updateRiskProfile: (id: string, riskData: any): Promise<ApiResponse<any>> =>
      tempApiClient.put(`/suppliers/${id}/risk-profile`, riskData),
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