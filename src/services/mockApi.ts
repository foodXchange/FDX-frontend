// Mock API service for development without backend
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockApi = {
  auth: {
    login: async (credentials: any) => {
      await delay(500);
      return {
        user: {
          id: '1',
          name: 'Test User',
          email: credentials.email,
          role: 'admin'
        },
        token: 'mock-jwt-token'
      };
    },
    validate: async () => {
      await delay(200);
      return { valid: true };
    }
  },
  rfq: {
    getList: async () => {
      await delay(300);
      return {
        data: [
          {
            id: '1',
            title: 'Cotton Fabric Order',
            status: 'pending',
            createdAt: new Date().toISOString(),
            value: 50000
          }
        ],
        total: 1
      };
    },
    create: async (rfqData: any) => {
      await delay(400);
      return {
        id: Math.random().toString(36).substr(2, 9),
        ...rfqData,
        status: 'draft',
        createdAt: new Date().toISOString()
      };
    },
    update: async (id: string, updates: any) => {
      await delay(300);
      return {
        id,
        ...updates,
        updatedAt: new Date().toISOString()
      };
    }
  },
  suppliers: {
    getList: async () => {
      await delay(400);
      return {
        data: [
          {
            id: '1',
            name: 'Premium Textiles Ltd',
            location: 'Mumbai, India',
            rating: 4.8,
            certifications: ['ISO 9001', 'GOTS']
          }
        ],
        total: 1
      };
    }
  },
  // Payment mock methods
  processPayment: async (paymentData: any) => {
    await delay(800);
    return {
      id: `PAY-${Date.now()}`,
      ...paymentData,
      status: 'processing',
      transactionId: `TXN-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    };
  },
  getPayment: async (paymentId: string) => {
    await delay(300);
    return {
      id: paymentId,
      amount: 15000,
      currency: 'USD',
      status: 'completed',
      method: 'bank_transfer',
      createdAt: new Date().toISOString()
    };
  },
  getPayments: async (params?: any) => {
    await delay(400);
    return {
      payments: [
        {
          id: 'PAY-001',
          amount: 25000,
          currency: 'USD',
          status: 'completed',
          method: 'wire',
          supplierId: 'SUP-001',
          createdAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: 'PAY-002',
          amount: 18500,
          currency: 'USD',
          status: 'processing',
          method: 'bank_transfer',
          supplierId: 'SUP-002',
          createdAt: new Date().toISOString()
        }
      ],
      total: 2,
      pages: 1
    };
  },
  refundPayment: async (paymentId: string, data: any) => {
    await delay(600);
    return {
      id: paymentId,
      status: 'refunded',
      refundAmount: data.amount,
      refundedAt: new Date().toISOString()
    };
  },
  getPaymentAnalytics: async (params?: any) => {
    await delay(300);
    return {
      totalVolume: 2450000,
      totalTransactions: 156,
      averageTransactionSize: 15705,
      byStatus: {
        completed: 142,
        processing: 8,
        pending: 4,
        failed: 2
      },
      byMethod: {
        bank_transfer: 89,
        wire: 34,
        letter_of_credit: 12,
        credit_card: 21
      },
      successRate: 0.91,
      averageProcessingTime: 2.4,
      topCustomers: [
        {
          customerId: 'CUST001',
          customerName: 'Global Foods Inc',
          totalAmount: 456000,
          transactionCount: 23
        }
      ]
    };
  },
  // Invoice mock methods
  createInvoice: async (invoiceData: any) => {
    await delay(500);
    return {
      id: `INV-${Date.now()}`,
      invoiceNumber: `INV-2024-${String(Math.floor(Math.random() * 10000)).padStart(5, '0')}`,
      ...invoiceData,
      status: 'draft',
      totalAmount: invoiceData.lineItems.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0),
      balanceDue: invoiceData.lineItems.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0),
      createdAt: new Date().toISOString()
    };
  },
  getInvoice: async (invoiceId: string) => {
    await delay(300);
    return {
      id: invoiceId,
      invoiceNumber: 'INV-2024-00123',
      amount: 35000,
      status: 'sent',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString()
    };
  },
  getInvoices: async (params?: any) => {
    await delay(400);
    return {
      invoices: [
        {
          id: 'INV-001',
          invoiceNumber: 'INV-2024-00121',
          amount: 35000,
          status: 'sent',
          dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
          buyerId: 'BUYER-001',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'INV-002',
          invoiceNumber: 'INV-2024-00122',
          amount: 42000,
          status: 'overdue',
          dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          buyerId: 'BUYER-002',
          createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString()
        }
      ],
      total: 2,
      pages: 1
    };
  },
  updateInvoice: async (invoiceId: string, data: any) => {
    await delay(400);
    return {
      id: invoiceId,
      ...data,
      updatedAt: new Date().toISOString()
    };
  },
  sendInvoice: async (invoiceId: string, data: any) => {
    await delay(600);
    return {
      id: invoiceId,
      status: 'sent',
      sentTo: data.recipients,
      sentAt: new Date().toISOString()
    };
  },
  getInvoiceAnalytics: async (params?: any) => {
    await delay(300);
    return {
      totalIssued: 234,
      totalAmount: 3456000,
      totalOutstanding: 892000,
      averageDaysToPayment: 28.5,
      overdueAmount: 234000,
      overdueCount: 12,
      byStatus: {
        draft: 8,
        sent: 45,
        viewed: 23,
        partially_paid: 15,
        paid: 134,
        overdue: 12,
        cancelled: 3,
        disputed: 2
      },
      agingReport: [
        { range: '0-30 days', count: 45, amount: 567000 },
        { range: '31-60 days', count: 23, amount: 234000 },
        { range: '61-90 days', count: 8, amount: 67000 },
        { range: '90+ days', count: 4, amount: 24000 }
      ]
    };
  }
};

export default mockApi;