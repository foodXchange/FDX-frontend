// File: C:\Users\foodz\Documents\GitHub\Development\FDX-frontend\src\App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import { NotificationProvider } from './contexts/NotificationContext';

// Authentication Components
import AuthForms from './components/auth/AuthForms';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Main Application Components
import Dashboard from './components/Dashboard';
import RFQList from './components/rfq/RFQList';
import RFQForm from './components/rfq/RFQForm';
import RFQDetail from './components/rfq/RFQDetail';
import Marketplace from './components/marketplace/Marketplace';
import ProductDetail from './components/marketplace/ProductDetail';
import SupplierDirectory from './components/suppliers/SupplierDirectory';
import SupplierProfile from './components/suppliers/SupplierProfile';
import OrderList from './components/orders/OrderList';
import OrderDetail from './components/orders/OrderDetail';
import ComplianceCenter from './components/compliance/ComplianceCenter';
import LogisticsTracker from './components/logistics/LogisticsTracker';
import Analytics from './components/analytics/Analytics';
import UserProfile from './components/profile/UserProfile';
import Settings from './components/settings/Settings';

// Layout Components
import MainLayout from './components/layout/MainLayout';
import AuthLayout from './components/layout/AuthLayout';

// Utility Components
import LoadingSpinner from './components/ui/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';
import NotFound from './components/NotFound';

// Styles
import './App.css';

/**
 * Main Application Component
 * Handles routing, authentication, and global state management
 */
function App() {
  return (
    <ErrorBoundary>
      <div className="App">
        <AuthProvider>
          <WebSocketProvider>
            <NotificationProvider>
              <Router>
                <Routes>
                  {/* Public Routes - Authentication */}
                  <Route path="/login" element={
                    <AuthLayout>
                      <AuthForms mode="login" />
                    </AuthLayout>
                  } />
                  
                  <Route path="/register" element={
                    <AuthLayout>
                      <AuthForms mode="register" />
                    </AuthLayout>
                  } />
                  
                  <Route path="/forgot-password" element={
                    <AuthLayout>
                      <div className="text-center">
                        <h2 className="text-2xl font-bold mb-4">Forgot Password</h2>
                        <p className="text-gray-600">Password reset functionality coming soon...</p>
                      </div>
                    </AuthLayout>
                  } />

                  {/* Protected Routes - Main Application */}
                  <Route path="/" element={
                    <ProtectedRoute>
                      <MainLayout>
                        <Navigate to="/dashboard" replace />
                      </MainLayout>
                    </ProtectedRoute>
                  } />

                  {/* Dashboard */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <MainLayout>
                        <Dashboard />
                      </MainLayout>
                    </ProtectedRoute>
                  } />

                  {/* RFQ Management */}
                  <Route path="/rfqs" element={
                    <ProtectedRoute>
                      <MainLayout>
                        <RFQList />
                      </MainLayout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/rfqs/new" element={
                    <ProtectedRoute>
                      <MainLayout>
                        <RFQForm />
                      </MainLayout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/rfqs/:id" element={
                    <ProtectedRoute>
                      <MainLayout>
                        <RFQDetail />
                      </MainLayout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/rfqs/:id/edit" element={
                    <ProtectedRoute>
                      <MainLayout>
                        <RFQForm />
                      </MainLayout>
                    </ProtectedRoute>
                  } />

                  {/* Marketplace */}
                  <Route path="/marketplace" element={
                    <ProtectedRoute>
                      <MainLayout>
                        <Marketplace />
                      </MainLayout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/marketplace/products/:id" element={
                    <ProtectedRoute>
                      <MainLayout>
                        <ProductDetail />
                      </MainLayout>
                    </ProtectedRoute>
                  } />

                  {/* Suppliers */}
                  <Route path="/suppliers" element={
                    <ProtectedRoute>
                      <MainLayout>
                        <SupplierDirectory />
                      </MainLayout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/suppliers/:id" element={
                    <ProtectedRoute>
                      <MainLayout>
                        <SupplierProfile />
                      </MainLayout>
                    </ProtectedRoute>
                  } />

                  {/* Orders */}
                  <Route path="/orders" element={
                    <ProtectedRoute>
                      <MainLayout>
                        <OrderList />
                      </MainLayout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/orders/:id" element={
                    <ProtectedRoute>
                      <MainLayout>
                        <OrderDetail />
                      </MainLayout>
                    </ProtectedRoute>
                  } />

                  {/* Compliance */}
                  <Route path="/compliance" element={
                    <ProtectedRoute>
                      <MainLayout>
                        <ComplianceCenter />
                      </MainLayout>
                    </ProtectedRoute>
                  } />

                  {/* Logistics */}
                  <Route path="/logistics" element={
                    <ProtectedRoute>
                      <MainLayout>
                        <LogisticsTracker />
                      </MainLayout>
                    </ProtectedRoute>
                  } />

                  {/* Analytics */}
                  <Route path="/analytics" element={
                    <ProtectedRoute>
                      <MainLayout>
                        <Analytics />
                      </MainLayout>
                    </ProtectedRoute>
                  } />

                  {/* User Profile */}
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <MainLayout>
                        <UserProfile />
                      </MainLayout>
                    </ProtectedRoute>
                  } />

                  {/* Settings */}
                  <Route path="/settings" element={
                    <ProtectedRoute>
                      <MainLayout>
                        <Settings />
                      </MainLayout>
                    </ProtectedRoute>
                  } />

                  {/* Admin Routes */}
                  <Route path="/admin/*" element={
                    <ProtectedRoute requiredRole="admin">
                      <MainLayout>
                        <div className="p-6">
                          <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
                          <p className="text-gray-600">Admin functionality coming soon...</p>
                        </div>
                      </MainLayout>
                    </ProtectedRoute>
                  } />

                  {/* 404 Not Found */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Router>
            </NotificationProvider>
          </WebSocketProvider>
        </AuthProvider>
      </div>
    </ErrorBoundary>
  );
}

export default App;