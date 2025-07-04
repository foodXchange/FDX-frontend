// File: C:\Users\foodz\Documents\GitHub\Development\FDX-frontend\src\contexts\AuthContext.js

import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext<any>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        // Mock user for now - replace with real API call
        const mockUser = {
          id: 1,
          email: 'demo@foodxchange.com',
          firstName: 'Demo',
          lastName: 'User',
          company: 'FoodXchange Demo',
          role: 'buyer'
        };
        setUser(mockUser);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Mock login - replace with real API call
      if (email === 'demo@foodxchange.com' && password === 'demo123') {
        const mockUser = {
          id: 1,
          email: email,
          firstName: 'Demo',
          lastName: 'User',
          company: 'FoodXchange Demo',
          role: 'buyer'
        };
        
        localStorage.setItem('token', 'mock-jwt-token');
        setUser(mockUser);
        setIsAuthenticated(true);
        return mockUser;
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Mock registration - replace with real API call
      const newUser = {
        id: Date.now(),
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        company: userData.company,
        role: userData.role
      };
      
      localStorage.setItem('token', 'mock-jwt-token');
      setUser(newUser);
      setIsAuthenticated(true);
      return newUser;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};



