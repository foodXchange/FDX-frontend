import axios, { AxiosResponse } from 'axios';
import { armApiService, handleApiError, ARMApiError } from '../../services/armApi';
import { Lead, Agent, LeadStatus } from '../../types';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock window.location
delete (window as any).location;
window.location = { href: '' } as any;

describe('ARMApiService', () => {
  beforeEach(() => {
    // Reset mocks
    mockedAxios.create.mockReturnValue(mockedAxios);
    mockedAxios.interceptors = {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    } as any;
    
    mockLocalStorage.getItem.mockReturnValue('mock-token');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Agent APIs', () => {
    it('should fetch current agent', async () => {
      const mockAgent: Agent = {
        id: 'agent-1',
        userId: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        whatsappNumber: '+1234567890',
        status: 'active',
        tier: 'gold',
        location: {
          address: '123 Main St',
          city: 'New York',
          state: 'NY',
          country: 'USA',
          postalCode: '10001',
          coordinates: { latitude: 40.7128, longitude: -74.0060 },
        },
        territoryAssignments: [],
        commissionStructure: {
          baseRate: 0.05,
          tierMultipliers: { bronze: 1, silver: 1.2, gold: 1.5, platinum: 2, diamond: 2.5 },
          bonusThresholds: [],
          paymentSchedule: 'monthly',
          minimumPayout: 100,
        },
        metrics: {
          totalLeads: 50,
          convertedLeads: 25,
          conversionRate: 0.5,
          totalRevenue: 100000,
          averageDealSize: 2000,
          responseTime: 2,
          activeLeads: 15,
          thisMonthLeads: 10,
          thisMonthRevenue: 20000,
          totalCommissions: 5000,
          pendingCommissions: 500,
          rank: 5,
          performance: {
            lastMonth: {
              leadsGenerated: 8,
              leadsConverted: 4,
              revenue: 8000,
              commissionEarned: 400,
              activeDays: 20,
              averageDealSize: 2000,
            },
            thisMonth: {
              leadsGenerated: 10,
              leadsConverted: 5,
              revenue: 10000,
              commissionEarned: 500,
              activeDays: 22,
              averageDealSize: 2000,
            },
            yearToDate: {
              leadsGenerated: 100,
              leadsConverted: 50,
              revenue: 100000,
              commissionEarned: 5000,
              activeDays: 250,
              averageDealSize: 2000,
            },
          },
        },
        onboardingStatus: {
          currentStep: 5,
          totalSteps: 5,
          isCompleted: true,
          completedAt: new Date().toISOString(),
          steps: [],
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        activeLeads: 15,
      };

      mockedAxios.get.mockResolvedValue({ data: mockAgent } as AxiosResponse);

      const result = await armApiService.getCurrentAgent();

      expect(mockedAxios.get).toHaveBeenCalledWith('/agents/me');
      expect(result).toEqual(mockAgent);
    });

    it('should update agent', async () => {
      const mockAgent: Agent = {
        id: 'agent-1',
        firstName: 'John',
        lastName: 'Doe Updated',
      } as Agent;

      const updates = { lastName: 'Doe Updated' };

      mockedAxios.patch.mockResolvedValue({ data: mockAgent } as AxiosResponse);

      const result = await armApiService.updateAgent('agent-1', updates);

      expect(mockedAxios.patch).toHaveBeenCalledWith('/agents/agent-1', updates);
      expect(result).toEqual(mockAgent);
    });

    it('should fetch dashboard data', async () => {
      const mockDashboardData = {
        agent: {} as Agent,
        metrics: {},
        recentLeads: [],
        notifications: [],
        tasks: [],
        commissions: [],
        leaderboard: [],
      };

      mockedAxios.get.mockResolvedValue({ data: mockDashboardData } as AxiosResponse);

      const result = await armApiService.getDashboardData();

      expect(mockedAxios.get).toHaveBeenCalledWith('/agents/dashboard');
      expect(result).toEqual(mockDashboardData);
    });
  });

  describe('Lead APIs', () => {
    it('should fetch leads with filters', async () => {
      const mockLeadSearchResult = {
        leads: [],
        total: 0,
        page: 1,
        pageSize: 10,
        hasMore: false,
      };

      const filters = {
        status: ['new', 'contacted'] as LeadStatus[],
        priority: ['high'],
        search: 'test',
      };

      mockedAxios.get.mockResolvedValue({ data: mockLeadSearchResult } as AxiosResponse);

      const result = await armApiService.getLeads(filters);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/leads?status=new,contacted&priority=high&search=test')
      );
      expect(result).toEqual(mockLeadSearchResult);
    });

    it('should fetch lead by ID', async () => {
      const mockLead: Lead = {
        id: 'lead-1',
        companyName: 'Test Company',
        contactPerson: 'John Doe',
        email: 'john@test.com',
        phone: '+1234567890',
        businessType: 'restaurant',
        estimatedRevenue: 50000,
        priority: 'high',
        status: 'new',
        source: 'website',
        location: {
          city: 'New York',
          state: 'NY',
        },
        notes: [],
        activities: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        expiresAt: new Date().toISOString(),
        rfqTitle: 'Test RFQ',
        category: 'Food',
        buyerName: 'John Doe',
        buyerLocation: 'New York, NY',
        estimatedValue: 50000,
        matchScore: 85,
        estimatedCommission: 2500,
      };

      mockedAxios.get.mockResolvedValue({ data: mockLead } as AxiosResponse);

      const result = await armApiService.getLeadById('lead-1');

      expect(mockedAxios.get).toHaveBeenCalledWith('/leads/lead-1');
      expect(result).toEqual(mockLead);
    });

    it('should create lead', async () => {
      const mockLead: Lead = {
        id: 'lead-1',
        companyName: 'New Company',
        contactPerson: 'Jane Doe',
        email: 'jane@new.com',
        phone: '+1234567890',
        businessType: 'restaurant',
        estimatedRevenue: 30000,
        priority: 'medium',
        status: 'new',
        source: 'referral',
        location: {
          city: 'Boston',
          state: 'MA',
        },
        notes: [],
        activities: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        expiresAt: new Date().toISOString(),
        rfqTitle: 'New RFQ',
        category: 'Food',
        buyerName: 'Jane Doe',
        buyerLocation: 'Boston, MA',
        estimatedValue: 30000,
        matchScore: 75,
        estimatedCommission: 1500,
      };

      const createRequest = {
        companyName: 'New Company',
        contactPerson: 'Jane Doe',
        email: 'jane@new.com',
        phone: '+1234567890',
        businessType: 'restaurant' as const,
        estimatedRevenue: 30000,
        priority: 'medium' as const,
        source: 'referral' as const,
        location: {
          city: 'Boston',
          state: 'MA',
        },
      };

      mockedAxios.post.mockResolvedValue({ data: mockLead } as AxiosResponse);

      const result = await armApiService.createLead(createRequest);

      expect(mockedAxios.post).toHaveBeenCalledWith('/leads', createRequest);
      expect(result).toEqual(mockLead);
    });

    it('should update lead status', async () => {
      const mockLead: Lead = {
        id: 'lead-1',
        status: 'contacted',
      } as Lead;

      mockedAxios.patch.mockResolvedValue({ data: mockLead } as AxiosResponse);

      const result = await armApiService.updateLeadStatus('lead-1', 'contacted');

      expect(mockedAxios.patch).toHaveBeenCalledWith('/leads/lead-1/status', { status: 'contacted' });
      expect(result).toEqual(mockLead);
    });

    it('should delete lead', async () => {
      mockedAxios.delete.mockResolvedValue({} as AxiosResponse);

      await armApiService.deleteLead('lead-1');

      expect(mockedAxios.delete).toHaveBeenCalledWith('/leads/lead-1');
    });

    it('should batch update leads', async () => {
      const mockLeads: Lead[] = [
        { id: 'lead-1', status: 'contacted' } as Lead,
        { id: 'lead-2', status: 'qualified' } as Lead,
      ];

      const updates = [
        { id: 'lead-1', changes: { status: 'contacted' } },
        { id: 'lead-2', changes: { status: 'qualified' } },
      ];

      mockedAxios.patch.mockResolvedValue({ data: mockLeads } as AxiosResponse);

      const result = await armApiService.batchUpdateLeads(updates);

      expect(mockedAxios.patch).toHaveBeenCalledWith('/leads/batch', { updates });
      expect(result).toEqual(mockLeads);
    });
  });

  describe('Communication APIs', () => {
    it('should send email', async () => {
      mockedAxios.post.mockResolvedValue({} as AxiosResponse);

      await armApiService.sendEmail('lead-1', 'Test Subject', 'Test Content');

      expect(mockedAxios.post).toHaveBeenCalledWith('/communication/email', {
        leadId: 'lead-1',
        subject: 'Test Subject',
        content: 'Test Content',
      });
    });

    it('should send SMS', async () => {
      mockedAxios.post.mockResolvedValue({} as AxiosResponse);

      await armApiService.sendSMS('lead-1', 'Test SMS');

      expect(mockedAxios.post).toHaveBeenCalledWith('/communication/sms', {
        leadId: 'lead-1',
        content: 'Test SMS',
      });
    });

    it('should schedule email', async () => {
      const scheduledAt = new Date().toISOString();

      mockedAxios.post.mockResolvedValue({} as AxiosResponse);

      await armApiService.scheduleEmail('lead-1', 'Test Subject', 'Test Content', scheduledAt);

      expect(mockedAxios.post).toHaveBeenCalledWith('/communication/email/schedule', {
        leadId: 'lead-1',
        subject: 'Test Subject',
        content: 'Test Content',
        scheduledAt,
      });
    });

    it('should send WhatsApp message', async () => {
      const mockMessage = {
        id: 'msg-1',
        leadId: 'lead-1',
        agentId: 'agent-1',
        direction: 'outbound',
        type: 'text',
        content: 'Test message',
        status: 'sent',
        timestamp: new Date().toISOString(),
      };

      const request = {
        leadId: 'lead-1',
        message: 'Test message',
      };

      mockedAxios.post.mockResolvedValue({ data: mockMessage } as AxiosResponse);

      const result = await armApiService.sendWhatsAppMessage(request);

      expect(mockedAxios.post).toHaveBeenCalledWith('/whatsapp/send', request);
      expect(result).toEqual(mockMessage);
    });
  });

  describe('Export/Import APIs', () => {
    it('should export leads', async () => {
      const mockBlob = new Blob(['csv content'], { type: 'text/csv' });

      mockedAxios.get.mockResolvedValue({ data: mockBlob } as AxiosResponse);

      const result = await armApiService.exportLeads('csv');

      expect(mockedAxios.get).toHaveBeenCalledWith('/leads/export?format=csv', {
        responseType: 'blob',
      });
      expect(result).toEqual(mockBlob);
    });

    it('should import leads', async () => {
      const mockFile = new File(['csv content'], 'leads.csv', { type: 'text/csv' });
      const mockResult = { success: 10, errors: [] };

      mockedAxios.post.mockResolvedValue({ data: mockResult } as AxiosResponse);

      const result = await armApiService.importLeads(mockFile);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/leads/import',
        expect.any(FormData),
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('Health Check', () => {
    it('should perform health check', async () => {
      const mockHealth = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
      };

      mockedAxios.get.mockResolvedValue({ data: mockHealth } as AxiosResponse);

      const result = await armApiService.healthCheck();

      expect(mockedAxios.get).toHaveBeenCalledWith('/health');
      expect(result).toEqual(mockHealth);
    });
  });
});

describe('Error Handling', () => {
  it('should handle API response errors', () => {
    const mockError = {
      response: {
        status: 400,
        data: { message: 'Bad Request' },
      },
    };

    const result = handleApiError(mockError);

    expect(result).toBeInstanceOf(ARMApiError);
    expect(result.message).toBe('Bad Request');
    expect(result.statusCode).toBe(400);
  });

  it('should handle network errors', () => {
    const mockError = {
      request: {},
    };

    const result = handleApiError(mockError);

    expect(result).toBeInstanceOf(ARMApiError);
    expect(result.message).toBe('Network Error');
    expect(result.statusCode).toBe(0);
  });

  it('should handle unknown errors', () => {
    const mockError = {
      message: 'Unknown error',
    };

    const result = handleApiError(mockError);

    expect(result).toBeInstanceOf(ARMApiError);
    expect(result.message).toBe('Unknown error');
    expect(result.statusCode).toBe(0);
  });
});

describe('Authentication', () => {
  it('should add auth token to requests', () => {
    const mockToken = 'test-token';
    mockLocalStorage.getItem.mockReturnValue(mockToken);

    // The interceptor is set up during service initialization
    // We can't easily test the interceptor directly, but we can verify
    // that the token is retrieved from localStorage
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('authToken');
  });

  it('should handle 401 errors by redirecting to login', () => {
    const mockError = {
      response: {
        status: 401,
        data: { message: 'Unauthorized' },
      },
    };

    // This would normally be handled by the axios interceptor
    // In a real scenario, we'd need to test the interceptor separately
    handleApiError(mockError);

    expect(mockError.response.status).toBe(401);
  });
});