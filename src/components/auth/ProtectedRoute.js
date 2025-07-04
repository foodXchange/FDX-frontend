// File: C:\Users\foodz\Documents\GitHub\Development\FDX-frontend\src\components\auth\ProtectedRoute.js

import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * ProtectedRoute Component - Authentication Guard
 * Protects routes that require authentication
 * Redirects unauthenticated users to login
 */
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, isAuthenticated, isLoading, checkAuth } = useAuth();
  const location = useLocation();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        await checkAuth();
      } catch (error) {
        console.error('Auth verification failed:', error);
      } finally {
        setAuthChecked(true);
      }
    };

    if (!authChecked) {
      verifyAuth();
    }
  }, [checkAuth, authChecked]);

  // Show loading spinner while checking authentication
  if (isLoading || !authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <Navigate 
        to="/login" 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // Check role-based access if required
  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 mb-4">
            <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            You don't have permission to access this page. Required role: {requiredRole}
          </p>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // User is authenticated and has required role - render protected content
  return children;
};

/**
 * Higher-order component for protecting components with authentication
 * Usage: export default withAuth(MyComponent);
 */
export const withAuth = (Component, requiredRole = null) => {
  return function AuthenticatedComponent(props) {
    return (
      <ProtectedRoute requiredRole={requiredRole}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
};

/**
 * Hook for role-based conditional rendering
 * Usage: const canAccess = useRoleAccess('admin');
 */
export const useRoleAccess = (requiredRole) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated || !user) return false;
  if (!requiredRole) return true;
  
  return user.role === requiredRole || user.role === 'admin';
};

/**
 * Component for conditional role-based rendering
 * Usage: <RoleGuard role="admin"><AdminPanel /></RoleGuard>
 */
export const RoleGuard = ({ children, role, fallback = null }) => {
  const canAccess = useRoleAccess(role);
  
  return canAccess ? children : fallback;
};

export default ProtectedRoute;