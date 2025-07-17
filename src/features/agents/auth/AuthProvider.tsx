import React, { useState, useEffect, useContext, useCallback, createContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { armApiService } from '../services/armApi';
import { Agent } from '../types';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'agent' | 'admin' | 'manager';
  permissions: string[];
  lastLoginAt: string;
}

interface AuthContextType {
  user: AuthUser | null;
  agent: Agent | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is authenticated
  const isAuthenticated = !!user;

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (token && refreshToken) {
          // Verify token is still valid
          const currentAgent = await armApiService.getCurrentAgent();
          
          if (currentAgent) {
            // Extract user info from agent data
            const authUser: AuthUser = {
              id: currentAgent.userId,
              email: currentAgent.email,
              name: `${currentAgent.firstName} ${currentAgent.lastName}`,
              role: 'agent',
              permissions: getAgentPermissions(currentAgent),
              lastLoginAt: currentAgent.lastLoginAt || new Date().toISOString(),
            };
            
            setUser(authUser);
            setAgent(currentAgent);
          } else {
            // Token is invalid, clear storage
            clearAuthStorage();
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        clearAuthStorage();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Auto-refresh token before expiry
  useEffect(() => {
    if (!isAuthenticated) return;

    const refreshInterval = setInterval(async () => {
      try {
        await refreshToken();
      } catch (error) {
        console.error('Token refresh failed:', error);
        logout();
      }
    }, 14 * 60 * 1000); // Refresh every 14 minutes

    return () => clearInterval(refreshInterval);
  }, [isAuthenticated]);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();
      const { token, refreshToken: newRefreshToken, user: userData, agent: agentData } = data;

      // Store tokens
      localStorage.setItem('authToken', token);
      localStorage.setItem('refreshToken', newRefreshToken);

      // Set user and agent data
      setUser(userData);
      setAgent(agentData);

      // Navigate to dashboard
      navigate('/agent/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = useCallback(() => {
    // Clear all auth data
    clearAuthStorage();
    setUser(null);
    setAgent(null);
    
    // Navigate to login
    navigate('/login');
  }, [navigate]);

  const refreshToken = async (): Promise<void> => {
    const currentRefreshToken = localStorage.getItem('refreshToken');
    
    if (!currentRefreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: currentRefreshToken }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      const { token, refreshToken: newRefreshToken } = data;

      // Update tokens
      localStorage.setItem('authToken', token);
      localStorage.setItem('refreshToken', newRefreshToken);
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return user.permissions.includes(permission) || user.role === 'admin';
  };

  const hasRole = (role: string): boolean => {
    if (!user) return false;
    return user.role === role;
  };

  const clearAuthStorage = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  };

  const contextValue: AuthContextType = {
    user,
    agent,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshToken,
    hasPermission,
    hasRole,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Helper function to get agent permissions based on tier and status
const getAgentPermissions = (agent: Agent): string[] => {
  const basePermissions = [
    'view_leads',
    'update_lead_status',
    'add_lead_notes',
    'send_messages',
    'view_own_performance',
  ];

  const tierPermissions: Record<string, string[]> = {
    bronze: [],
    silver: ['export_leads'],
    gold: ['export_leads', 'bulk_update_leads'],
    platinum: ['export_leads', 'bulk_update_leads', 'view_team_performance'],
    diamond: ['export_leads', 'bulk_update_leads', 'view_team_performance', 'manage_territories'],
  };

  return [
    ...basePermissions,
    ...(tierPermissions[agent.tier] || []),
  ];
};

// Hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Protected Route Component
export const ProtectedRoute: React.FC<{ 
  children: React.ReactNode;
  requiredPermission?: string;
  requiredRole?: string;
}> = ({ children, requiredPermission, requiredRole }) => {
  const { isAuthenticated, isLoading, hasPermission, hasRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>You don't have permission to access this page.</div>
      </div>
    );
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>You don't have the required role to access this page.</div>
      </div>
    );
  }

  return <>{children}</>;
};

// Permission-based component wrapper
export const PermissionGate: React.FC<{
  children: React.ReactNode;
  permission: string;
  fallback?: React.ReactNode;
}> = ({ children, permission, fallback = null }) => {
  const { hasPermission } = useAuth();
  
  if (!hasPermission(permission)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};

// Role-based component wrapper
export const RoleGate: React.FC<{
  children: React.ReactNode;
  role: string;
  fallback?: React.ReactNode;
}> = ({ children, role, fallback = null }) => {
  const { hasRole } = useAuth();
  
  if (!hasRole(role)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};