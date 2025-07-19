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
  }
};

export default mockApi;