// =============================================================================
// API TYPES - HTTP request/response type definitions
// =============================================================================

import { 
  User, 
  Company, 
  Product, 
  Order, 
  RFQ, 
  Agent, 
  Document,
  AIRecommendation,
  MarketIntelligence 
} from './business';
import { PaginatedResponse, ApiResponse, ApiError } from './common';

// Base API Types
export interface ApiRequest {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
  data?: unknown;
  timeout?: number;
  retries?: number;
}

export interface ApiEndpoint {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  auth?: boolean;
  timeout?: number;
  retries?: number;
  cache?: boolean;
  cacheTTL?: number;
}

// Authentication API Types
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
  twoFactorCode?: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
  expiresAt: string;
  permissions: string[];
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  companyName?: string;
  companyType?: 'buyer' | 'supplier' | 'both';
  agreeToTerms: boolean;
  subscribeToNewsletter?: boolean;
}

export interface RegisterResponse {
  user: User;
  verificationRequired: boolean;
  verificationMethod: 'email' | 'phone' | 'manual';
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface Enable2FARequest {
  password: string;
}

export interface Verify2FARequest {
  code: string;
  backupCode?: string;
}

// User API Types
export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  preferences?: Partial<User['preferences']>;
}

export interface UpdateUserResponse {
  user: User;
}

export interface GetUsersRequest {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: string;
  status?: 'active' | 'inactive' | 'suspended';
  companyId?: string;
  sortBy?: 'name' | 'email' | 'createdAt' | 'lastLoginAt';
  sortOrder?: 'asc' | 'desc';
}

export interface GetUsersResponse extends PaginatedResponse<User> {}

// Company API Types
export interface CreateCompanyRequest {
  name: string;
  legalName: string;
  type: 'buyer' | 'supplier' | 'both';
  industry: string;
  description?: string;
  website?: string;
  logo?: File;
  address: Company['address'];
  contacts: Array<Omit<Company['contacts'][0], 'id'>>;
  businessLicense: string;
  taxId: string;
  yearEstablished: number;
  employeeCount: number;
  annualRevenue?: number;
}

export interface UpdateCompanyRequest extends Partial<CreateCompanyRequest> {}

export interface GetCompaniesRequest {
  page?: number;
  pageSize?: number;
  search?: string;
  type?: 'buyer' | 'supplier' | 'both';
  industry?: string;
  country?: string;
  verified?: boolean;
  sortBy?: 'name' | 'rating' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface GetCompaniesResponse extends PaginatedResponse<Company> {}

// Product API Types
export interface CreateProductRequest {
  name: string;
  description: string;
  categoryId: string;
  subcategory: string;
  sku: string;
  barcode?: string;
  images: File[];
  specifications: Product['specifications'];
  nutritionalInfo?: Product['nutritionalInfo'];
  packaging: Product['packaging'];
  origins: string[];
  certifications: string[];
  shelfLife: number;
  storageConditions: string;
  minimumOrderQuantity: number;
  priceRange: Product['priceRange'];
  availability: Product['availability'];
  tags: string[];
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {}

export interface GetProductsRequest {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: string;
  subcategory?: string;
  supplierId?: string;
  country?: string;
  certifications?: string[];
  priceMin?: number;
  priceMax?: number;
  inStock?: boolean;
  sortBy?: 'name' | 'price' | 'rating' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface GetProductsResponse extends PaginatedResponse<Product> {}

export interface ProductSearchRequest {
  query: string;
  filters?: {
    category?: string;
    priceRange?: { min: number; max: number };
    location?: string;
    certifications?: string[];
    inStock?: boolean;
  };
  page?: number;
  pageSize?: number;
}

export interface ProductSearchResponse extends PaginatedResponse<Product> {
  aggregations: {
    categories: Array<{ name: string; count: number }>;
    priceRanges: Array<{ range: string; count: number }>;
    locations: Array<{ name: string; count: number }>;
    certifications: Array<{ name: string; count: number }>;
  };
}

// Order API Types
export interface CreateOrderRequest {
  supplierId: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
    specifications?: Record<string, string>;
    notes?: string;
  }>;
  shippingAddress: Order['shippingAddress'];
  billingAddress: Order['billingAddress'];
  requestedDeliveryDate: string;
  notes?: string;
  rfqId?: string;
}

export interface UpdateOrderRequest {
  status?: Order['status'];
  items?: CreateOrderRequest['items'];
  shippingAddress?: Order['shippingAddress'];
  billingAddress?: Order['billingAddress'];
  requestedDeliveryDate?: string;
  notes?: string;
}

export interface GetOrdersRequest {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: Order['status'];
  paymentStatus?: Order['paymentStatus'];
  supplierId?: string;
  buyerId?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'orderNumber' | 'createdAt' | 'total' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface GetOrdersResponse extends PaginatedResponse<Order> {}

// RFQ API Types
export interface CreateRFQRequest {
  title: string;
  description: string;
  items: Array<Omit<RFQ['items'][0], 'id'>>;
  requirements: Array<Omit<RFQ['requirements'][0], 'id'>>;
  deliveryLocation: RFQ['deliveryLocation'];
  requestedDeliveryDate: string;
  budgetRange?: RFQ['budgetRange'];
  documents?: File[];
  expiresAt: string;
  isPublic: boolean;
  invitedSuppliers?: string[];
  category: string;
  tags: string[];
}

export interface UpdateRFQRequest extends Partial<CreateRFQRequest> {
  status?: RFQ['status'];
}

export interface GetRFQsRequest {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: RFQ['status'];
  category?: string;
  buyerId?: string;
  supplierId?: string;
  isPublic?: boolean;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'title' | 'createdAt' | 'expiresAt' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface GetRFQsResponse extends PaginatedResponse<RFQ> {}

export interface SubmitRFQResponse {
  items: Array<{
    rfqItemId: string;
    unitPrice: number;
    totalPrice: number;
    specifications: Record<string, string>;
    deliveryTime: number;
    notes?: string;
  }>;
  totalAmount: number;
  currency: string;
  validUntil: string;
  deliveryTime: number;
  paymentTerms: string;
  notes?: string;
  documents?: File[];
}

// Agent API Types
export interface CreateAgentRequest {
  name: string;
  type: Agent['type'];
  description: string;
  capabilities: string[];
  configuration: Record<string, unknown>;
}

export interface UpdateAgentRequest extends Partial<CreateAgentRequest> {
  status?: Agent['status'];
}

export interface GetAgentsRequest {
  page?: number;
  pageSize?: number;
  search?: string;
  type?: Agent['type'];
  status?: Agent['status'];
  sortBy?: 'name' | 'type' | 'createdAt' | 'lastActivity';
  sortOrder?: 'asc' | 'desc';
}

export interface GetAgentsResponse extends PaginatedResponse<Agent> {}

export interface ExecuteAgentTaskRequest {
  agentId: string;
  type: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  input: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface ExecuteAgentTaskResponse {
  taskId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  output?: Record<string, unknown>;
  error?: string;
  duration?: number;
}

// AI & Analytics API Types
export interface GetRecommendationsRequest {
  type?: AIRecommendation['type'];
  category?: string;
  limit?: number;
  minConfidence?: number;
}

export interface GetRecommendationsResponse {
  recommendations: AIRecommendation[];
  metadata: {
    totalCount: number;
    averageConfidence: number;
    categories: string[];
  };
}

export interface GetMarketIntelligenceRequest {
  category?: string;
  region?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface GetMarketIntelligenceResponse {
  intelligence: MarketIntelligence;
  lastUpdated: string;
}

export interface AnalyzeSupplierRequest {
  supplierId: string;
  criteria?: string[];
  includeRisk?: boolean;
  includePerformance?: boolean;
}

export interface AnalyzeSupplierResponse {
  analysis: {
    score: number;
    rating: 'excellent' | 'good' | 'fair' | 'poor';
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    riskFactors: Array<{
      type: string;
      level: 'low' | 'medium' | 'high';
      description: string;
    }>;
    performance: {
      deliveryTime: number;
      quality: number;
      communication: number;
      pricing: number;
    };
  };
  generatedAt: string;
}

// File Upload API Types
export interface UploadFileRequest {
  file: File;
  category?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface UploadFileResponse {
  document: Document;
  uploadId: string;
}

export interface GetDocumentsRequest {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: string;
  tags?: string[];
  uploadedBy?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'name' | 'createdAt' | 'size';
  sortOrder?: 'asc' | 'desc';
}

export interface GetDocumentsResponse extends PaginatedResponse<Document> {}

// Dashboard API Types
export interface GetDashboardMetricsRequest {
  dateRange?: {
    start: string;
    end: string;
  };
  metrics?: string[];
  groupBy?: 'day' | 'week' | 'month' | 'quarter' | 'year';
}

export interface GetDashboardMetricsResponse {
  metrics: Array<{
    name: string;
    value: number;
    previousValue?: number;
    change?: number;
    changeType: 'increase' | 'decrease' | 'neutral';
    trend: number[];
    unit?: string;
  }>;
  charts: Array<{
    type: 'line' | 'bar' | 'pie' | 'area';
    title: string;
    data: unknown;
    config?: Record<string, unknown>;
  }>;
  summary: {
    totalOrders: number;
    totalRevenue: number;
    activeSuppliers: number;
    pendingRFQs: number;
  };
}

// Notification API Types
export interface GetNotificationsRequest {
  page?: number;
  pageSize?: number;
  unreadOnly?: boolean;
  type?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface GetNotificationsResponse extends PaginatedResponse<{ id: string; type: string; title: string; message: string; createdAt: string; read: boolean; }> {}

export interface MarkNotificationReadRequest {
  notificationIds: string[];
}

export interface CreateNotificationRequest {
  type: string;
  title: string;
  message: string;
  recipients: string[];
  data?: Record<string, unknown>;
  scheduledFor?: string;
}

// System API Types
export interface GetSystemHealthResponse {
  status: 'healthy' | 'warning' | 'critical';
  services: Array<{
    name: string;
    status: 'up' | 'down' | 'degraded';
    responseTime: number;
    uptime: number;
    version?: string;
  }>;
  uptime: number;
  lastChecked: string;
}

export interface GetSystemStatsResponse {
  users: {
    total: number;
    active: number;
    new: number;
  };
  companies: {
    total: number;
    verified: number;
    new: number;
  };
  orders: {
    total: number;
    pending: number;
    completed: number;
  };
  products: {
    total: number;
    active: number;
    new: number;
  };
  performance: {
    averageResponseTime: number;
    uptime: number;
    errorRate: number;
  };
}

// Error Types
export interface ValidationError extends ApiError {
  code: 'VALIDATION_ERROR';
  details: {
    field: string;
    message: string;
  }[];
}

export interface AuthenticationError extends ApiError {
  code: 'AUTHENTICATION_ERROR';
  details: {
    reason: 'invalid_credentials' | 'token_expired' | 'account_locked' | 'account_disabled';
  };
}

export interface AuthorizationError extends ApiError {
  code: 'AUTHORIZATION_ERROR';
  details: {
    requiredPermission: string;
    resource: string;
  };
}

export interface NotFoundError extends ApiError {
  code: 'NOT_FOUND';
  details: {
    resource: string;
    id: string;
  };
}

export interface ConflictError extends ApiError {
  code: 'CONFLICT';
  details: {
    resource: string;
    conflictingField: string;
  };
}

export interface RateLimitError extends ApiError {
  code: 'RATE_LIMIT_EXCEEDED';
  details: {
    limit: number;
    remaining: number;
    resetTime: string;
  };
}

// Utility Types
export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type ApiRequestConfig = {
  method: ApiMethod;
  url: string;
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
  data?: unknown;
  timeout?: number;
  retries?: number;
  auth?: boolean;
  cache?: boolean;
  cacheTTL?: number;
};

export type ApiResponseType<T> = ApiResponse<T> | ApiError;

// Type Guards
export const isApiError = (response: unknown): response is ApiError => {
  return typeof response === 'object' && response !== null && 
         'success' in response && !(response as any).success && 
         'message' in response && typeof (response as any).message === 'string';
};

export const isValidationError = (error: unknown): error is ValidationError => {
  return isApiError(error) && error.code === 'VALIDATION_ERROR';
};

export const isAuthenticationError = (error: unknown): error is AuthenticationError => {
  return isApiError(error) && error.code === 'AUTHENTICATION_ERROR';
};

export const isAuthorizationError = (error: unknown): error is AuthorizationError => {
  return isApiError(error) && error.code === 'AUTHORIZATION_ERROR';
};

export const isNotFoundError = (error: unknown): error is NotFoundError => {
  return isApiError(error) && error.code === 'NOT_FOUND';
};

export const isConflictError = (error: unknown): error is ConflictError => {
  return isApiError(error) && error.code === 'CONFLICT';
};

export const isRateLimitError = (error: unknown): error is RateLimitError => {
  return isApiError(error) && error.code === 'RATE_LIMIT_EXCEEDED';
};