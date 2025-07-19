// Mock authentication service for development
import { User } from "../contexts/AuthContext";

interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  company: string;
  role?: 'supplier' | 'buyer';
}

// Mock users database
const mockUsers: Record<string, { password: string; user: User }> = {
  'demo@foodchange.com': {
    password: 'Demo123!',
    user: {
      id: '1',
      email: 'demo@foodchange.com',
      name: 'Demo User',
      role: 'admin',
      company: 'Demo Foods Inc.',
      permissions: ['all'],
      avatar: 'https://ui-avatars.com/api/?name=Demo+User&background=1E4C8A&color=fff',
      lastLogin: new Date(),
      preferences: {
        theme: 'light',
        language: 'en',
        notifications: true
      }
    }
  },
  'demo@foodsupply.com': {
    password: 'Demo123!',
    user: {
      id: '2',
      email: 'demo@foodsupply.com',
      name: 'Supply Manager',
      role: 'supplier',
      company: 'Fresh Supply Co.',
      permissions: ['supplier_manage'],
      avatar: 'https://ui-avatars.com/api/?name=Supply+Manager&background=2D5C3F&color=fff',
      lastLogin: new Date(),
      preferences: {
        theme: 'light',
        language: 'en',
        notifications: true
      }
    }
  },
  'buyer@marketplace.com': {
    password: 'Buyer123!',
    user: {
      id: '3',
      email: 'buyer@marketplace.com',
      name: 'Procurement Lead',
      role: 'buyer',
      company: 'Global Foods Corp',
      permissions: ['buyer_manage'],
      avatar: 'https://ui-avatars.com/api/?name=Procurement+Lead&background=8B5A3C&color=fff',
      lastLogin: new Date(),
      preferences: {
        theme: 'light',
        language: 'en',
        notifications: true
      }
    }
  }
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockAuthService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    await delay(1000); // Simulate network delay

    const userRecord = mockUsers[email.toLowerCase()];
    
    if (!userRecord || userRecord.password !== password) {
      throw new Error('Invalid email or password');
    }

    // Update last login
    userRecord.user.lastLogin = new Date();

    return {
      user: userRecord.user,
      token: `mock-jwt-token-${userRecord.user.id}`,
      refreshToken: `mock-refresh-token-${userRecord.user.id}`
    };
  },

  register: async (data: RegisterData): Promise<LoginResponse> => {
    await delay(1500);

    // Check if user already exists
    if (mockUsers[data.email.toLowerCase()]) {
      throw new Error('User already exists with this email');
    }

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email: data.email,
      name: data.name,
      role: data.role || 'buyer',
      company: data.company,
      permissions: data.role === 'supplier' ? ['supplier_manage'] : ['buyer_manage'],
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=1E4C8A&color=fff`,
      lastLogin: new Date(),
      preferences: {
        theme: 'light',
        language: 'en',
        notifications: true
      }
    };

    // Store in mock database
    mockUsers[data.email.toLowerCase()] = {
      password: data.password,
      user: newUser
    };

    return {
      user: newUser,
      token: `mock-jwt-token-${newUser.id}`,
      refreshToken: `mock-refresh-token-${newUser.id}`
    };
  },

  validateToken: async (token: string): Promise<User | null> => {
    await delay(300);

    // Extract user ID from token (mock implementation)
    const userId = token.replace('mock-jwt-token-', '');
    
    // Find user by ID
    for (const userRecord of Object.values(mockUsers)) {
      if (userRecord.user.id === userId) {
        return userRecord.user;
      }
    }

    return null;
  },

  refreshToken: async (refreshToken: string): Promise<{ token: string; refreshToken: string }> => {
    await delay(200);

    const userId = refreshToken.replace('mock-refresh-token-', '');
    
    // Find user by ID
    for (const userRecord of Object.values(mockUsers)) {
      if (userRecord.user.id === userId) {
        return {
          token: `mock-jwt-token-${userId}`,
          refreshToken: `mock-refresh-token-${userId}`
        };
      }
    }

    throw new Error('Invalid refresh token');
  },

  logout: async (): Promise<void> => {
    await delay(100);
    // In a real app, this would invalidate the token on the server
    console.log('User logged out');
  },

  resetPassword: async (email: string): Promise<void> => {
    await delay(800);

    if (!mockUsers[email.toLowerCase()]) {
      throw new Error('No user found with this email address');
    }

    // In a real app, this would send a password reset email
    console.log(`Password reset email sent to ${email}`);
  },

  changePassword: async (_currentPassword: string, _newPassword: string): Promise<void> => {
    await delay(500);
    
    // In a real app, this would validate the current password and update it
    console.log('Password changed successfully');
  }
};

export default mockAuthService;