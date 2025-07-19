import { api, apiClient } from './api-client';
import MockApiService, { USE_MOCK_API } from './mock/MockApiService';

// API Integration Helper - automatically switches between real and mock APIs
export class ApiIntegration {
  // Orders
  static orders = {
    getAll: async (params?: any) => {
      if (USE_MOCK_API) {
        return MockApiService.orders.getAll(params);
      }
      return api.orders.getAll(params);
    },

    getById: async (id: string) => {
      if (USE_MOCK_API) {
        return MockApiService.orders.getById(id);
      }
      return api.orders.getById(id);
    },

    create: async (data: any) => {
      if (USE_MOCK_API) {
        return MockApiService.orders.create(data);
      }
      return api.orders.create(data);
    },

    // ... other order methods use the same pattern
  };

  // Experts
  static experts = {
    search: async (query: any) => {
      if (USE_MOCK_API) {
        return MockApiService.experts.search(query);
      }
      return api.experts.search(query);
    },

    getAvailability: async (id: string, dateRange?: any) => {
      if (USE_MOCK_API) {
        return MockApiService.experts.getAvailability(id, dateRange);
      }
      return api.experts.getAvailability(id, dateRange);
    },

    // ... other expert methods
  };

  // RFQs with AI
  static rfqs = {
    analyzeWithAI: async (id: string) => {
      if (USE_MOCK_API) {
        return MockApiService.rfqs.analyzeWithAI(id);
      }
      return api.rfqs.analyzeWithAI(id);
    },

    getAIMatches: async (id: string, options?: any) => {
      if (USE_MOCK_API) {
        return MockApiService.rfqs.getAIMatches(id, options);
      }
      return api.rfqs.getAIMatches(id, options);
    },

    recommendSuppliers: async (id: string, criteria?: any) => {
      if (USE_MOCK_API) {
        return MockApiService.rfqs.recommendSuppliers(id, criteria);
      }
      return api.rfqs.recommendSuppliers(id, criteria);
    },

    // ... other RFQ methods
  };

  // Sample Tracking
  static samples = {
    getTracking: async (id: string) => {
      if (USE_MOCK_API) {
        return MockApiService.samples.getTracking(id);
      }
      return api.samples.getTracking(id);
    },

    // ... other sample methods
  };

  // Supplier Management
  static suppliers = {
    verify: async (id: string, verificationData: any) => {
      if (USE_MOCK_API) {
        return MockApiService.suppliers.verify(id, verificationData);
      }
      return api.suppliers.verify(id, verificationData);
    },

    getPerformanceMetrics: async (id: string, dateRange?: any) => {
      if (USE_MOCK_API) {
        return MockApiService.suppliers.getPerformanceMetrics(id, dateRange);
      }
      return api.suppliers.getPerformanceMetrics(id, dateRange);
    },

    // ... other supplier methods
  };

  // Compliance
  static compliance = {
    getComplianceMetrics: async (dateRange?: any) => {
      if (USE_MOCK_API) {
        return MockApiService.compliance.getComplianceMetrics(dateRange);
      }
      return api.compliance.getComplianceMetrics(dateRange);
    },

    checkCompliance: async (entityType: string, entityId: string, requirements: string[]) => {
      if (USE_MOCK_API) {
        return MockApiService.compliance.checkCompliance(entityType, entityId, requirements);
      }
      return api.compliance.checkCompliance(entityType, entityId, requirements);
    },

    // ... other compliance methods
  };

  // Payment Integration
  static payments = {
    process: async (paymentData: any) => {
      if (USE_MOCK_API) {
        return mockApi.processPayment(paymentData);
      }
      return api.payments.process(paymentData);
    },
    get: async (paymentId: string) => {
      if (USE_MOCK_API) {
        return mockApi.getPayment(paymentId);
      }
      return api.payments.get(paymentId);
    },
    getAll: async (params?: any) => {
      if (USE_MOCK_API) {
        return mockApi.getPayments(params);
      }
      return api.payments.getAll(params);
    },
    refund: async (paymentId: string, data: any) => {
      if (USE_MOCK_API) {
        return mockApi.refundPayment(paymentId, data);
      }
      return api.payments.refund(paymentId, data);
    },
    getAnalytics: async (params?: any) => {
      if (USE_MOCK_API) {
        return mockApi.getPaymentAnalytics(params);
      }
      return api.payments.getAnalytics(params);
    }
  };

  // Invoice Integration
  static invoices = {
    create: async (invoiceData: any) => {
      if (USE_MOCK_API) {
        return mockApi.createInvoice(invoiceData);
      }
      return api.invoices.create(invoiceData);
    },
    get: async (invoiceId: string) => {
      if (USE_MOCK_API) {
        return mockApi.getInvoice(invoiceId);
      }
      return api.invoices.get(invoiceId);
    },
    getAll: async (params?: any) => {
      if (USE_MOCK_API) {
        return mockApi.getInvoices(params);
      }
      return api.invoices.getAll(params);
    },
    update: async (invoiceId: string, data: any) => {
      if (USE_MOCK_API) {
        return mockApi.updateInvoice(invoiceId, data);
      }
      return api.invoices.update(invoiceId, data);
    },
    send: async (invoiceId: string, data: any) => {
      if (USE_MOCK_API) {
        return mockApi.sendInvoice(invoiceId, data);
      }
      return api.invoices.send(invoiceId, data);
    },
    getAnalytics: async (params?: any) => {
      if (USE_MOCK_API) {
        return mockApi.getInvoiceAnalytics(params);
      }
      return api.invoices.getAnalytics(params);
    }
  };

  // Contract Management
  static contracts = {
    create: async (contractData: any) => {
      if (USE_MOCK_API) {
        return contractData; // Mock returns the data as-is
      }
      return api.contracts.create(contractData);
    },
    get: async (contractId: string) => {
      if (USE_MOCK_API) {
        return null; // Will use local storage
      }
      return api.contracts.get(contractId);
    },
    update: async (contractId: string, updates: any) => {
      if (USE_MOCK_API) {
        return { id: contractId, ...updates };
      }
      return api.contracts.update(contractId, updates);
    },
    search: async (params: any) => {
      if (USE_MOCK_API) {
        return null; // Will use local search
      }
      return api.contracts.search(params);
    },
    getAnalytics: async (params?: any) => {
      if (USE_MOCK_API) {
        return null; // Will use local analytics
      }
      return api.contracts.getAnalytics(params);
    },
    approve: async (contractId: string, approvalData: any) => {
      if (USE_MOCK_API) {
        return { success: true };
      }
      return api.contracts.approve(contractId, approvalData);
    },
    renew: async (contractId: string, renewalData: any) => {
      if (USE_MOCK_API) {
        return { success: true };
      }
      return api.contracts.renew(contractId, renewalData);
    },
    getPerformanceReport: async (contractId: string, periodStart: string, periodEnd: string) => {
      if (USE_MOCK_API) {
        return null; // Will use local report generation
      }
      return api.contracts.getPerformanceReport(contractId, periodStart, periodEnd);
    }
  };

  // Health check to test API connectivity
  static async healthCheck(): Promise<{ status: 'healthy' | 'degraded' | 'down'; usingMock: boolean }> {
    if (USE_MOCK_API) {
      return { status: 'healthy', usingMock: true };
    }

    try {
      await apiClient.get('/health');
      return { status: 'healthy', usingMock: false };
    } catch (error) {
      console.warn('API health check failed, falling back to mock data:', error);
      return { status: 'down', usingMock: false };
    }
  }
}

// Export for use in components
export default ApiIntegration;