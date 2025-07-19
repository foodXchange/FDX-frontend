import { ApiResponse } from '../api-client';

// Enhanced Mock API Service for Development
class MockApiService {
  private static delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  
  // Simulate network delay
  private static async mockApiCall<T>(data: T, delay = 500): Promise<ApiResponse<T>> {
    await this.delay(delay);
    return {
      success: true,
      data,
      message: 'Mock API response',
      statusCode: 200,
      requestId: `mock-${Date.now()}`
    };
  }

  // Orders Mock API
  static orders = {
    getAll: async (params?: any) => {
      const mockOrders = [
        {
          id: 'ord-001',
          orderNumber: 'ORD-2024-001',
          status: 'confirmed',
          supplierId: 'sup-001',
          buyerId: 'buy-001',
          items: [
            {
              id: 'item-001',
              productName: 'Organic Wheat Flour',
              quantity: 1000,
              unit: 'kg',
              unitPrice: 2.50,
              totalPrice: 2500
            }
          ],
          pricing: {
            subtotal: 2500,
            taxAmount: 250,
            totalAmount: 2750,
            currency: 'USD'
          },
          createdAt: new Date().toISOString()
        }
      ];
      return this.mockApiCall(mockOrders);
    },

    getById: async (id: string) => {
      const mockOrder = {
        id,
        orderNumber: `ORD-2024-${id.slice(-3)}`,
        status: 'in_production',
        tracking: {
          trackingNumber: 'TRK123456789',
          updates: [
            {
              timestamp: new Date().toISOString(),
              status: 'In Production',
              location: 'Manufacturing Facility',
              description: 'Order is being processed'
            }
          ]
        }
      };
      return this.mockApiCall(mockOrder);
    },

    create: async (data: any) => {
      const mockOrder = {
        id: `ord-${Date.now()}`,
        orderNumber: `ORD-2024-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        ...data,
        status: 'pending_approval',
        createdAt: new Date().toISOString()
      };
      return this.mockApiCall(mockOrder);
    }
  };

  // Experts Mock API
  static experts = {
    search: async (query: any) => {
      const mockExperts = [
        {
          id: 'exp-001',
          profile: {
            name: 'Dr. Sarah Johnson',
            title: 'Food Safety Consultant',
            expertise: ['HACCP', 'Food Safety', 'Compliance'],
            rating: 4.9,
            hourlyRate: 150
          },
          availability: {
            nextAvailable: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          }
        }
      ];
      return this.mockApiCall(mockExperts);
    },

    getAvailability: async (id: string, dateRange?: any) => {
      const mockAvailability = {
        slots: [
          {
            start: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            end: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
            available: true
          }
        ]
      };
      return this.mockApiCall(mockAvailability);
    }
  };

  // RFQ Mock API with AI features
  static rfqs = {
    analyzeWithAI: async (id: string) => {
      const mockAnalysis = {
        suggestions: [
          'Consider adding temperature requirements for storage',
          'Specify packaging materials for better compliance'
        ],
        riskFactors: ['Seasonal pricing volatility', 'Limited supplier availability'],
        complianceFlags: ['FDA registration required', 'Organic certification needed']
      };
      return this.mockApiCall(mockAnalysis, 2000); // Longer delay for AI
    },

    getAIMatches: async (id: string, options?: any) => {
      const mockMatches = [
        {
          supplierId: 'sup-001',
          matchScore: 0.95,
          reasons: ['Exact product match', 'Competitive pricing', 'Excellent track record'],
          estimatedPrice: 2.45,
          deliveryTime: '2-3 weeks'
        }
      ];
      return this.mockApiCall(mockMatches, 1500);
    },

    recommendSuppliers: async (id: string, criteria?: any) => {
      const mockRecommendations = [
        {
          supplierId: 'sup-001',
          name: 'Premium Foods Ltd',
          score: 0.92,
          pricing: { competitive: true, estimate: '$2.40-2.60/kg' },
          capabilities: ['Organic certification', 'High volume', 'Global shipping']
        }
      ];
      return this.mockApiCall(mockRecommendations, 1000);
    }
  };

  // Sample Tracking Mock API
  static samples = {
    getTracking: async (id: string) => {
      const mockTracking = {
        currentLocation: 'Quality Lab - Station 3',
        temperature: { current: 4.2, min: 2.0, max: 8.0 },
        events: [
          {
            timestamp: new Date().toISOString(),
            event: 'Sample received at lab',
            location: 'Quality Lab',
            temperature: 4.1
          }
        ],
        chainOfCustody: [
          {
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            from: 'Supplier Facility',
            to: 'Quality Lab',
            handledBy: 'Lab Technician - John Doe'
          }
        ]
      };
      return this.mockApiCall(mockTracking);
    }
  };

  // Supplier Management Mock API
  static suppliers = {
    verify: async (id: string, verificationData: any) => {
      const mockVerification = {
        status: 'verified',
        score: 88,
        checklist: {
          businessLicense: true,
          insuranceCoverage: true,
          qualityCertifications: true,
          financialStability: true
        },
        verifiedAt: new Date().toISOString()
      };
      return this.mockApiCall(mockVerification, 3000); // Longer for verification
    },

    getPerformanceMetrics: async (id: string, dateRange?: any) => {
      const mockMetrics = {
        onTimeDelivery: 0.94,
        qualityScore: 0.89,
        responseTime: '2.3 hours',
        costCompetitiveness: 0.87,
        trends: {
          lastMonth: { onTimeDelivery: 0.92, qualityScore: 0.91 },
          improvement: true
        }
      };
      return this.mockApiCall(mockMetrics);
    }
  };

  // Compliance Mock API
  static compliance = {
    getComplianceMetrics: async (dateRange?: any) => {
      const mockMetrics = {
        overallScore: 0.91,
        certificationStatus: {
          total: 45,
          active: 42,
          expiring: 3,
          expired: 0
        },
        auditResults: {
          passed: 28,
          failed: 2,
          pending: 5
        },
        trends: {
          improving: true,
          scoreChange: +0.03
        }
      };
      return this.mockApiCall(mockMetrics);
    },

    checkCompliance: async (entityType: string, entityId: string, requirements: string[]) => {
      const mockCheck = {
        compliant: true,
        score: 0.94,
        requirements: requirements.map(req => ({
          requirement: req,
          status: Math.random() > 0.1 ? 'compliant' : 'non-compliant',
          lastChecked: new Date().toISOString()
        }))
      };
      return this.mockApiCall(mockCheck, 2000);
    }
  };
}

export default MockApiService;

// Development flag to use mock APIs
export const USE_MOCK_API = process.env.REACT_APP_USE_MOCK_API === 'true' || !process.env.REACT_APP_API_URL;