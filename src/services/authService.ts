// Authentication service for user login, registration, and session management
import { User } from '@/contexts/AuthContext';
import { apiClient } from './api-client';

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

class AuthService {
  private baseURL = '/api/auth';

  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await apiClient.post(`${this.baseURL}/login`, {
        email,
        password,
      });
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error && 'response' in error 
        ? (error as any).response?.data?.message || 'Invalid credentials'
        : 'Invalid credentials';
      throw new Error(errorMessage);
    }
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post(`${this.baseURL}/logout`);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  async register(data: RegisterData): Promise<LoginResponse> {
    try {
      const response = await apiClient.post(`${this.baseURL}/register`, data);
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error && 'response' in error 
        ? (error as any).response?.data?.message || 'Registration failed'
        : 'Registration failed';
      throw new Error(errorMessage);
    }
  }

  async validateToken(token: string): Promise<User> {
    try {
      const response = await apiClient.get(`${this.baseURL}/validate`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.user;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  async refreshToken(token: string): Promise<LoginResponse> {
    try {
      const response = await apiClient.post(`${this.baseURL}/refresh`, { token });
      return response.data;
    } catch (error) {
      throw new Error('Token refresh failed');
    }
  }

  async updateProfile(userId: string, data: Partial<User>): Promise<User> {
    try {
      const response = await apiClient.patch(`${this.baseURL}/users/${userId}`, data);
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error && 'response' in error 
        ? (error as any).response?.data?.message || 'Profile update failed'
        : 'Profile update failed';
      throw new Error(errorMessage);
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      await apiClient.post(`${this.baseURL}/reset-password`, { email });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error && 'response' in error 
        ? (error as any).response?.data?.message || 'Password reset failed'
        : 'Password reset failed';
      throw new Error(errorMessage);
    }
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    try {
      await apiClient.post(`${this.baseURL}/change-password`, {
        userId,
        oldPassword,
        newPassword,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error && 'response' in error 
        ? (error as any).response?.data?.message || 'Password change failed'
        : 'Password change failed';
      throw new Error(errorMessage);
    }
  }

  // Helper method to set auth header for all requests
  setAuthHeader(token: string): void {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // Helper method to remove auth header
  removeAuthHeader(): void {
    delete apiClient.defaults.headers.common['Authorization'];
  }
}

export const authService = new AuthService();