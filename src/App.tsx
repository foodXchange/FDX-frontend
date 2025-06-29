// src/App.tsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import LoginPage from './features/auth/components/LoginPage';
import Dashboard from './components/Dashboard';

// Mock authentication state
interface AuthState {
  isAuthenticated: boolean;
  user: any | null;
  loading: boolean;
}

function App() {
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true
  });

  useEffect(() => {
    // Simulate checking authentication status
    const checkAuth = async () => {
      // In a real app, you'd check for a valid token or session
      const token = localStorage.getItem('auth_token');
      
      if (token) {
        // Mock user data
        setAuth({
          isAuthenticated: true,
          user: {
            id: '1',
            email: 'demo@foodxchange.com',
            name: 'Demo User',
            company: 'Demo Company'
          },
          loading: false
        });
      } else {
        setAuth({
          isAuthenticated: false,
          user: null,
          loading: false
        });
      }
    };

    checkAuth();
  }, []);

  // Loading state
  if (auth.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading FoodXchange...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/login" 
            element={
              auth.isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <LoginPage />
              )
            } 
          />
          
          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              auth.isAuthenticated ? (
                <Dashboard />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          
          {/* Default Route */}
          <Route 
            path="/" 
            element={
              <Navigate 
                to={auth.isAuthenticated ? "/dashboard" : "/login"} 
                replace 
              />
            } 
          />
          
          {/* Catch-all route */}
          <Route 
            path="*" 
            element={
              <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                  <p className="text-gray-600 mb-4">Page not found</p>
                  <a 
                    href="/dashboard" 
                    className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700"
                  >
                    Go to Dashboard
                  </a>
                </div>
              </div>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
