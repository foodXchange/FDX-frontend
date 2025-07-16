import { rest } from 'msw';
import { mockLeadData, mockAgentData } from './test-utils';

// Base API URL
const API_BASE = '/api/v1';

// Mock data stores
let mockLeads = mockLeadData.multiple(10);
let mockAgents = [mockAgentData.basic()];
let mockNotifications: any[] = [];
let mockAnalytics = {
  totalLeads: mockLeads.length,
  convertedLeads: 3,
  revenue: 125000,
  avgResponseTime: 2.5,
};

// Utility functions
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const findItemById = <T extends { id: string }>(items: T[], id: string) => 
  items.find(item => item.id === id);

const paginate = <T>(items: T[], page: number = 1, limit: number = 10) => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedItems = items.slice(startIndex, endIndex);
  
  return {
    data: paginatedItems,
    pagination: {
      page,
      limit,
      total: items.length,
      totalPages: Math.ceil(items.length / limit),
      hasNext: endIndex < items.length,
      hasPrev: page > 1,
    },
  };
};

// Authentication handlers
export const authHandlers = [
  rest.post(`${API_BASE}/auth/login`, async (req, res, ctx) => {
    const { email, password } = await req.json();
    
    await delay(500); // Simulate network delay
    
    if (email === 'test@example.com' && password === 'password') {
      return res(
        ctx.status(200),
        ctx.json({
          success: true,
          data: {
            user: {
              id: 'user-1',
              email: 'test@example.com',
              name: 'Test User',
              role: 'agent',
            },
            token: 'mock-jwt-token',
            expiresIn: 3600,
          },
        })
      );
    }
    
    return res(
      ctx.status(401),
      ctx.json({
        success: false,
        error: 'Invalid credentials',
      })
    );
  }),

  rest.post(`${API_BASE}/auth/logout`, async (req, res, ctx) => {
    await delay(200);
    return res(
      ctx.status(200),
      ctx.json({ success: true })
    );
  }),

  rest.get(`${API_BASE}/auth/me`, async (req, res, ctx) => {
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader || !authHeader.includes('Bearer')) {
      return res(
        ctx.status(401),
        ctx.json({ success: false, error: 'Unauthorized' })
      );
    }
    
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: {
          id: 'user-1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'agent',
        },
      })
    );
  }),

  rest.get(`${API_BASE}/csrf-token`, async (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        token: 'mock-csrf-token',
        expiresIn: 3600,
      })
    );
  }),
];

// Lead management handlers
export const leadHandlers = [
  rest.get(`${API_BASE}/leads`, async (req, res, ctx) => {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search');
    const status = url.searchParams.get('status');
    const priority = url.searchParams.get('priority');
    
    await delay(300);
    
    let filteredLeads = [...mockLeads];
    
    // Apply filters
    if (search) {
      filteredLeads = filteredLeads.filter(lead =>
        lead.companyName.toLowerCase().includes(search.toLowerCase()) ||
        lead.contactName.toLowerCase().includes(search.toLowerCase()) ||
        lead.email.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (status) {
      filteredLeads = filteredLeads.filter(lead => lead.status === status);
    }
    
    if (priority) {
      filteredLeads = filteredLeads.filter(lead => lead.priority === priority);
    }
    
    const result = paginate(filteredLeads, page, limit);
    
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        ...result,
      })
    );
  }),

  rest.get(`${API_BASE}/leads/:id`, async (req, res, ctx) => {
    const { id } = req.params;
    const lead = findItemById(mockLeads, id as string);
    
    await delay(200);
    
    if (!lead) {
      return res(
        ctx.status(404),
        ctx.json({
          success: false,
          error: 'Lead not found',
        })
      );
    }
    
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: lead,
      })
    );
  }),

  rest.post(`${API_BASE}/leads`, async (req, res, ctx) => {
    const leadData = await req.json();
    
    await delay(400);
    
    // Validate required fields
    if (!leadData.companyName || !leadData.contactName || !leadData.email) {
      return res(
        ctx.status(400),
        ctx.json({
          success: false,
          error: 'Missing required fields',
          details: {
            companyName: !leadData.companyName ? 'Company name is required' : null,
            contactName: !leadData.contactName ? 'Contact name is required' : null,
            email: !leadData.email ? 'Email is required' : null,
          },
        })
      );
    }
    
    const newLead = {
      id: `lead-${Date.now()}`,
      ...leadData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    mockLeads.unshift(newLead);
    
    return res(
      ctx.status(201),
      ctx.json({
        success: true,
        data: newLead,
      })
    );
  }),

  rest.put(`${API_BASE}/leads/:id`, async (req, res, ctx) => {
    const { id } = req.params;
    const updateData = await req.json();
    
    await delay(300);
    
    const leadIndex = mockLeads.findIndex(lead => lead.id === id);
    
    if (leadIndex === -1) {
      return res(
        ctx.status(404),
        ctx.json({
          success: false,
          error: 'Lead not found',
        })
      );
    }
    
    const updatedLead = {
      ...mockLeads[leadIndex],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };
    
    mockLeads[leadIndex] = updatedLead;
    
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: updatedLead,
      })
    );
  }),

  rest.delete(`${API_BASE}/leads/:id`, async (req, res, ctx) => {
    const { id } = req.params;
    
    await delay(250);
    
    const leadIndex = mockLeads.findIndex(lead => lead.id === id);
    
    if (leadIndex === -1) {
      return res(
        ctx.status(404),
        ctx.json({
          success: false,
          error: 'Lead not found',
        })
      );
    }
    
    mockLeads.splice(leadIndex, 1);
    
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        message: 'Lead deleted successfully',
      })
    );
  }),
];

// Agent management handlers
export const agentHandlers = [
  rest.get(`${API_BASE}/agents`, async (req, res, ctx) => {
    await delay(200);
    
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: mockAgents,
      })
    );
  }),

  rest.get(`${API_BASE}/agents/:id`, async (req, res, ctx) => {
    const { id } = req.params;
    const agent = findItemById(mockAgents, id as string);
    
    await delay(150);
    
    if (!agent) {
      return res(
        ctx.status(404),
        ctx.json({
          success: false,
          error: 'Agent not found',
        })
      );
    }
    
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: agent,
      })
    );
  }),
];

// Analytics handlers
export const analyticsHandlers = [
  rest.get(`${API_BASE}/analytics/overview`, async (req, res, ctx) => {
    await delay(400);
    
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: mockAnalytics,
      })
    );
  }),

  rest.get(`${API_BASE}/analytics/leads/conversion`, async (req, res, ctx) => {
    await delay(350);
    
    const conversionData = [
      { month: 'Jan', leads: 45, conversions: 8 },
      { month: 'Feb', leads: 52, conversions: 12 },
      { month: 'Mar', leads: 38, conversions: 7 },
      { month: 'Apr', leads: 61, conversions: 15 },
      { month: 'May', leads: 55, conversions: 11 },
      { month: 'Jun', leads: 67, conversions: 18 },
    ];
    
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: conversionData,
      })
    );
  }),

  rest.get(`${API_BASE}/analytics/performance`, async (req, res, ctx) => {
    await delay(500);
    
    const performanceData = {
      responseTime: {
        current: 2.3,
        previous: 2.8,
        trend: 'improving',
      },
      satisfaction: {
        current: 4.6,
        previous: 4.4,
        trend: 'improving',
      },
      efficiency: {
        current: 87.5,
        previous: 82.1,
        trend: 'improving',
      },
    };
    
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: performanceData,
      })
    );
  }),
];

// Notification handlers
export const notificationHandlers = [
  rest.get(`${API_BASE}/notifications`, async (req, res, ctx) => {
    await delay(200);
    
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: mockNotifications,
      })
    );
  }),

  rest.post(`${API_BASE}/notifications/:id/read`, async (req, res, ctx) => {
    const { id } = req.params;
    
    await delay(100);
    
    const notification = findItemById(mockNotifications, id as string);
    
    if (notification) {
      notification.read = true;
    }
    
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: notification,
      })
    );
  }),
];

// File upload handlers
export const fileHandlers = [
  rest.post(`${API_BASE}/upload`, async (req, res, ctx) => {
    await delay(1000); // Simulate upload time
    
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: {
          url: 'https://example.com/uploaded-file.jpg',
          filename: 'uploaded-file.jpg',
          size: 1024000,
          type: 'image/jpeg',
        },
      })
    );
  }),
];

// Error simulation handlers
export const errorHandlers = [
  rest.get(`${API_BASE}/error/500`, async (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({
        success: false,
        error: 'Internal server error',
      })
    );
  }),

  rest.get(`${API_BASE}/error/timeout`, async (req, res, ctx) => {
    await delay(10000); // Simulate timeout
    return res(
      ctx.status(408),
      ctx.json({
        success: false,
        error: 'Request timeout',
      })
    );
  }),

  rest.get(`${API_BASE}/error/network`, async (req, res, ctx) => {
    return res.networkError('Network connection failed');
  }),
];

// Security testing handlers
export const securityHandlers = [
  rest.get(`${API_BASE}/security/headers`, async (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.set('X-Content-Type-Options', 'nosniff'),
      ctx.set('X-Frame-Options', 'DENY'),
      ctx.set('X-XSS-Protection', '1; mode=block'),
      ctx.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains'),
      ctx.set('Content-Security-Policy', "default-src 'self'"),
      ctx.json({ success: true })
    );
  }),
];

// Combine all handlers
export const handlers = [
  ...authHandlers,
  ...leadHandlers,
  ...agentHandlers,
  ...analyticsHandlers,
  ...notificationHandlers,
  ...fileHandlers,
  ...errorHandlers,
  ...securityHandlers,
];

// Helper functions for test setup
export const resetMockData = () => {
  mockLeads = mockLeadData.multiple(10);
  mockAgents = [mockAgentData.basic()];
  mockNotifications = [];
};

export const addMockLead = (lead: any) => {
  mockLeads.unshift(lead);
};

export const addMockAgent = (agent: any) => {
  mockAgents.push(agent);
};

export const getMockLeads = () => [...mockLeads];
export const getMockAgents = () => [...mockAgents];

export default handlers;