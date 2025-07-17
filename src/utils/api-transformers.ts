// API response transformer utilities
import { parseISO } from 'date-fns';

// Transform dates in API responses
export const transformDates = <T extends Record<string, any>>(data: T): any => {
  const transformed: any = { ...data };
  
  Object.keys(transformed).forEach(key => {
    const value = transformed[key];
    
    // Check if it's a date string
    if (typeof value === 'string' && isISODateString(value)) {
      transformed[key] = parseISO(value);
    }
    // Recursively transform nested objects
    else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      transformed[key] = transformDates(value);
    }
    // Transform arrays
    else if (Array.isArray(value)) {
      transformed[key] = value.map(item => 
        typeof item === 'object' && item !== null ? transformDates(item) : item
      );
    }
  });
  
  return transformed;
};

// Check if a string is an ISO date string
const isISODateString = (value: string): boolean => {
  const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
  return isoDateRegex.test(value);
};

// Transform data for API requests (dates to strings)
export const transformForRequest = <T extends Record<string, any>>(data: T): any => {
  const transformed: any = { ...data };
  
  Object.keys(transformed).forEach(key => {
    const value = transformed[key];
    
    // Convert Date objects to ISO strings
    if (value instanceof Date) {
      transformed[key] = value.toISOString();
    }
    // Recursively transform nested objects
    else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      transformed[key] = transformForRequest(value);
    }
    // Transform arrays
    else if (Array.isArray(value)) {
      transformed[key] = value.map(item => 
        typeof item === 'object' && item !== null ? transformForRequest(item) : item
      );
    }
  });
  
  return transformed;
};

// Paginated response transformer
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export const transformPaginatedResponse = <T>(response: any): PaginatedResponse<T> => {
  const { data, pagination } = response;
  
  return {
    data: data || [],
    total: pagination?.total || 0,
    page: pagination?.page || 1,
    pageSize: pagination?.pageSize || 20,
    totalPages: pagination?.totalPages || 1,
    hasNext: pagination?.hasNext || false,
    hasPrevious: pagination?.hasPrevious || false,
  };
};

// File size formatter
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Sanitize HTML content
export const sanitizeHtml = (html: string): string => {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
};

// Format currency
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

// Format percentage
export const formatPercentage = (value: number, decimals: number = 2): string => {
  return `${(value * 100).toFixed(decimals)}%`;
};

// Debounce function for API calls
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Throttle function for API calls
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};