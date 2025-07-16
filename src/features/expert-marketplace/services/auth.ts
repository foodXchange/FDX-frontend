import { api } from '@/services/api-client';

interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'client' | 'expert' | 'admin';
  avatar?: string;
  token: string;
  refreshToken: string;
  isVerified: boolean;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'client' | 'expert';
  acceptedTerms: boolean;
}

class ExpertMarketplaceAuthService {
  private tokenKey = 'expert_marketplace_token';
  private refreshTokenKey = 'expert_marketplace_refresh_token';
  private userKey = 'expert_marketplace_user';

  async login(credentials: LoginCredentials): Promise<AuthUser> {
    const response = await api.post('/auth/login', credentials);
    const user = response.data;
    
    this.setTokens(user.token, user.refreshToken);
    this.setUser(user);
    
    return user;
  }

  async register(data: RegisterData): Promise<AuthUser> {
    const response = await api.post('/auth/register', data);
    const user = response.data;
    
    this.setTokens(user.token, user.refreshToken);
    this.setUser(user);
    
    return user;
  }

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuth();
    }
  }

  async refreshToken(): Promise<string | null> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return null;

    try {
      const response = await api.post('/auth/refresh', {
        refreshToken,
      });
      
      const { token, refreshToken: newRefreshToken } = response.data;
      this.setTokens(token, newRefreshToken);
      
      return token;
    } catch (error) {
      this.clearAuth();
      return null;
    }
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    const token = this.getToken();
    if (!token) return null;

    try {
      const response = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const user = response.data;
      this.setUser(user);
      
      return user;
    } catch (error) {
      this.clearAuth();
      return null;
    }
  }

  async verifyEmail(token: string): Promise<void> {
    await api.post('/auth/verify-email', { token });
  }

  async requestPasswordReset(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await api.post('/auth/reset-password', { token, password: newPassword });
  }

  // Token management
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  getUser(): AuthUser | null {
    const userData = localStorage.getItem(this.userKey);
    return userData ? JSON.parse(userData) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  hasRole(role: string): boolean {
    const user = this.getUser();
    return user?.role === role;
  }

  isExpert(): boolean {
    return this.hasRole('expert');
  }

  isClient(): boolean {
    return this.hasRole('client');
  }

  private setTokens(token: string, refreshToken: string): void {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.refreshTokenKey, refreshToken);
  }

  private setUser(user: AuthUser): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  private clearAuth(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.userKey);
  }
}

export const expertAuthService = new ExpertMarketplaceAuthService();