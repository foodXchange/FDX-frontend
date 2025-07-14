import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '@services/authService';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'supplier' | 'buyer' | 'viewer';
  company: string;
  permissions: string[];
  avatar?: string;
  lastLogin?: Date;
  preferences?: {
    theme?: 'light' | 'dark';
    language?: string;
    notifications?: boolean;
  };
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  refreshToken: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  company: string;
  role?: 'supplier' | 'buyer';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          const user = await authService.validateToken(token);
          setState({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } else {
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        localStorage.removeItem('authToken');
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const { user, token } = await authService.login(email, password);
      localStorage.setItem('authToken', token);
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Login failed',
      }));
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      await authService.logout();
      localStorage.removeItem('authToken');
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, clear local state
      localStorage.removeItem('authToken');
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const { user, token } = await authService.register(data);
      localStorage.setItem('authToken', token);
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Registration failed',
      }));
      throw error;
    }
  }, []);

  const updateProfile = useCallback(async (data: Partial<User>) => {
    if (!state.user) return;
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const updatedUser = await authService.updateProfile(state.user.id, data);
      setState(prev => ({
        ...prev,
        user: updatedUser,
        isLoading: false,
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Profile update failed',
      }));
      throw error;
    }
  }, [state.user]);

  const resetPassword = useCallback(async (email: string) => {
    try {
      await authService.resetPassword(email);
    } catch (error: any) {
      throw new Error(error.message || 'Password reset failed');
    }
  }, []);

  const changePassword = useCallback(async (oldPassword: string, newPassword: string) => {
    if (!state.user) return;
    
    try {
      await authService.changePassword(state.user.id, oldPassword, newPassword);
    } catch (error: any) {
      throw new Error(error.message || 'Password change failed');
    }
  }, [state.user]);

  const refreshToken = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No token found');
      
      const { user, token: newToken } = await authService.refreshToken(token);
      localStorage.setItem('authToken', newToken);
      setState(prev => ({
        ...prev,
        user,
        isAuthenticated: true,
      }));
    } catch (error) {
      await logout();
      throw error;
    }
  }, [logout]);

  const hasPermission = useCallback((permission: string) => {
    if (!state.user) return false;
    return state.user.permissions.includes(permission) || state.user.role === 'admin';
  }, [state.user]);

  const hasRole = useCallback((role: string) => {
    if (!state.user) return false;
    return state.user.role === role || state.user.role === 'admin';
  }, [state.user]);

  // Set up token refresh interval
  useEffect(() => {
    if (!state.isAuthenticated) return;

    const refreshInterval = setInterval(() => {
      refreshToken().catch(console.error);
    }, 15 * 60 * 1000); // Refresh every 15 minutes

    return () => clearInterval(refreshInterval);
  }, [state.isAuthenticated, refreshToken]);

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    register,
    updateProfile,
    resetPassword,
    changePassword,
    refreshToken,
    hasPermission,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};