import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import { ProtectedRoute } from '@components/auth/ProtectedRoute';
import { PERMISSIONS } from '@hooks/usePermissions';

// Layouts
const MainLayout = lazy(() => import('@/layouts/MainLayout'));
const AuthLayout = lazy(() => import('@/layouts/AuthLayout'));

// Landing Page
const LandingPage = lazy(() => import('@/pages/LandingPage'));

// Auth Pages
const Login = lazy(() => import('@features/auth/Login').then(m => ({ default: m.Login })));
const Register = lazy(() => import('@features/auth/Register').then(m => ({ default: m.Register })));
const ForgotPassword = lazy(() => import('@features/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('@features/auth/ResetPassword'));
const Unauthorized = lazy(() => import('@features/auth/Unauthorized').then(m => ({ default: m.Unauthorized })));

// Dashboard
const Dashboard = lazy(() => import('@features/dashboard/EnhancedDashboard').then(m => ({ default: m.EnhancedDashboard })));
const TrackingDashboard = lazy(() => import('@features/dashboard/TrackingDashboard').then(m => ({ default: m.TrackingDashboard })));

// Analytics
const AdvancedAnalyticsDashboard = lazy(() => import('@features/analytics/components/AdvancedAnalyticsDashboard').then(m => ({ default: m.AdvancedAnalyticsDashboard })));
const MultiRoleDashboard = lazy(() => import('@features/analytics/components/MultiRoleDashboard').then(m => ({ default: m.MultiRoleDashboard })));
const ReportingEngine = lazy(() => import('@features/analytics/components/ReportingEngine').then(m => ({ default: m.ReportingEngine })));
const SupplierAnalytics = lazy(() => import('@features/analytics/components/SupplierAnalytics').then(m => ({ default: m.SupplierAnalytics })));

// RFQ
const RFQList = lazy(() => import('@features/rfq/RFQList').then(m => ({ default: m.RFQList })));
const CreateRFQ = lazy(() => import('@features/rfq/CreateRFQ').then(m => ({ default: m.CreateRFQ })));
const RFQDetail = lazy(() => import('@features/rfq/RFQDetail').then(m => ({ default: m.RFQDetail })));

// Orders
const OrderLinesTable = lazy(() => import('@features/orders/OrderLinesTable').then(m => ({ default: m.OrderLinesTable })));
const StandingOrderManager = lazy(() => import('@features/orders/StandingOrderManager').then(m => ({ default: m.StandingOrderManager })));

// Products
const ProductList = lazy(() => import('@features/marketplace/ProductList').then(m => ({ default: m.ProductList })));
const MarketplaceView = lazy(() => import('@features/marketplace/MarketplaceView').then(m => ({ default: m.MarketplaceView })));

// Suppliers
const SupplierDirectory = lazy(() => import('@features/marketplace/SupplierDirectory').then(m => ({ default: m.SupplierDirectory })));

// Compliance
const ComplianceDashboard = lazy(() => import('@features/compliance/ComplianceDashboard').then(m => ({ default: m.ComplianceDashboard })));
const ComplianceValidator = lazy(() => import('@features/compliance/ComplianceValidator').then(m => ({ default: m.ComplianceValidator })));
const CertificationManager = lazy(() => import('@features/compliance/components/CertificationManager').then(m => ({ default: m.CertificationManager })));
const AuditManager = lazy(() => import('@features/compliance/components/AuditManager').then(m => ({ default: m.AuditManager })));
const ComplianceTracker = lazy(() => import('@features/analytics/components/ComplianceTracker').then(m => ({ default: m.ComplianceTracker })));

// Documents
const DocumentUploadCenter = lazy(() => import('@features/documents/DocumentUploadCenter').then(m => ({ default: m.DocumentUploadCenter })));

// Monitoring
const TemperatureMonitor = lazy(() => import('@features/monitoring/TemperatureMonitor').then(m => ({ default: m.TemperatureMonitor })));

// Tracking
const SampleTracker = lazy(() => import('@features/tracking/SampleTracker').then(m => ({ default: m.SampleTracker })));

// Admin
const DataImport = lazy(() => import('@features/admin/DataImport').then(m => ({ default: m.DataImport })));

// Profile
const Profile = lazy(() => import('@features/profile/Profile'));
const Settings = lazy(() => import('@features/profile/Settings'));

// Agent Features
const AgentDashboard = lazy(() => import('@features/agents/components/AgentDashboard').then(m => ({ default: m.AgentDashboard })));
const LeadManagement = lazy(() => import('@features/agents/components/LeadManagement').then(m => ({ default: m.LeadManagement })));
const CommissionDashboard = lazy(() => import('@features/agents/components/CommissionDashboard').then(m => ({ default: m.CommissionDashboard })));
const ARMTestPage = lazy(() => import('@features/agents/pages/ARMTestPage').then(m => ({ default: m.ARMTestPage })));

// AI Recommendations
const AIRecommendationEngine = lazy(() => import('@features/ai-recommendations/components/AIRecommendationEngine').then(m => ({ default: m.AIRecommendationEngine })));
const VisualSimilarityMatching = lazy(() => import('@features/ai-recommendations/components/VisualSimilarityMatching').then(m => ({ default: m.VisualSimilarityMatching })));
const PredictiveAnalytics = lazy(() => import('@features/ai-recommendations/components/PredictiveAnalytics').then(m => ({ default: m.PredictiveAnalytics })));

// Collaboration
const CollaborationHub = lazy(() => import('@features/collaboration/pages/CollaborationHub').then(m => ({ default: m.CollaborationHub })));
const ProjectManagement = lazy(() => import('@features/collaboration/components/ProjectManagement').then(m => ({ default: m.ProjectManagement })));

// Error Pages
const NotFound = lazy(() => import('@/pages/NotFound'));

export const routes: RouteObject[] = [
  // Landing page (public)
  {
    path: '/',
    element: <LandingPage />,
  },
  
  // Auth routes (public)
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'register',
        element: <Register />,
      },
      {
        path: 'forgot-password',
        element: <ForgotPassword />,
      },
      {
        path: 'reset-password',
        element: <ResetPassword />,
      },
      {
        path: 'unauthorized',
        element: <Unauthorized />,
      },
    ],
  },

  // Protected routes
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      // Dashboard
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'tracking',
        element: <TrackingDashboard />,
      },
      
      // Analytics
      {
        path: 'analytics',
        children: [
          {
            index: true,
            element: <AdvancedAnalyticsDashboard />,
          },
          {
            path: 'multi-role',
            element: <MultiRoleDashboard />,
          },
          {
            path: 'reporting',
            element: <ReportingEngine />,
          },
          {
            path: 'suppliers',
            element: <SupplierAnalytics />,
          },
          {
            path: 'compliance',
            element: <ComplianceTracker />,
          },
        ],
      },

      // AI Recommendations
      {
        path: 'ai-recommendations',
        children: [
          {
            index: true,
            element: <AIRecommendationEngine />,
          },
          {
            path: 'visual-similarity',
            element: <VisualSimilarityMatching />,
          },
          {
            path: 'predictive-analytics',
            element: <PredictiveAnalytics />,
          },
        ],
      },

      // Collaboration
      {
        path: 'collaboration',
        children: [
          {
            index: true,
            element: <CollaborationHub />,
          },
          {
            path: 'projects',
            element: <ProjectManagement />,
          },
        ],
      },

      // RFQ Management
      {
        path: 'rfq',
        children: [
          {
            index: true,
            element: <RFQList />,
          },
          {
            path: 'create',
            element: (
              <ProtectedRoute requiredPermission={PERMISSIONS.RFQ_CREATE}>
                <CreateRFQ />
              </ProtectedRoute>
            ),
          },
          {
            path: ':id',
            element: <RFQDetail />,
          },
        ],
      },

      // Orders
      {
        path: 'orders',
        children: [
          {
            index: true,
            element: <OrderLinesTable />,
          },
          {
            path: 'standing',
            element: <StandingOrderManager />,
          },
        ],
      },

      // Marketplace
      {
        path: 'marketplace',
        children: [
          {
            index: true,
            element: <MarketplaceView />,
          },
          {
            path: 'products',
            element: <ProductList />,
          },
          {
            path: 'suppliers',
            element: <SupplierDirectory />,
          },
        ],
      },

      // Compliance
      {
        path: 'compliance',
        children: [
          {
            index: true,
            element: (
              <ProtectedRoute requiredPermission={PERMISSIONS.COMPLIANCE_VIEW}>
                <ComplianceDashboard />
              </ProtectedRoute>
            ),
          },
          {
            path: 'certifications',
            element: (
              <ProtectedRoute requiredPermission={PERMISSIONS.COMPLIANCE_VIEW}>
                <CertificationManager />
              </ProtectedRoute>
            ),
          },
          {
            path: 'audits',
            element: (
              <ProtectedRoute requiredPermission={PERMISSIONS.COMPLIANCE_VIEW}>
                <AuditManager />
              </ProtectedRoute>
            ),
          },
          {
            path: 'tracker',
            element: (
              <ProtectedRoute requiredPermission={PERMISSIONS.COMPLIANCE_VIEW}>
                <ComplianceTracker />
              </ProtectedRoute>
            ),
          },
          {
            path: 'validator',
            element: (
              <ProtectedRoute requiredPermission={PERMISSIONS.COMPLIANCE_MANAGE}>
                <ComplianceValidator />
              </ProtectedRoute>
            ),
          },
        ],
      },

      // Documents
      {
        path: 'documents',
        element: (
          <ProtectedRoute requiredPermission={PERMISSIONS.DOCUMENT_VIEW}>
            <DocumentUploadCenter />
          </ProtectedRoute>
        ),
      },

      // Monitoring
      {
        path: 'monitoring',
        element: <TemperatureMonitor />,
      },

      // Tracking
      {
        path: 'samples',
        element: <SampleTracker />,
      },

      // Admin
      {
        path: 'admin',
        children: [
          {
            path: 'import',
            element: (
              <ProtectedRoute requiredRole="admin">
                <DataImport />
              </ProtectedRoute>
            ),
          },
        ],
      },

      // Agent Routes
      {
        path: 'agent',
        children: [
          {
            index: true,
            element: (
              <ProtectedRoute requiredRole="agent">
                <AgentDashboard />
              </ProtectedRoute>
            ),
          },
          {
            path: 'leads',
            element: (
              <ProtectedRoute requiredRole="agent">
                <LeadManagement />
              </ProtectedRoute>
            ),
          },
          {
            path: 'earnings',
            element: (
              <ProtectedRoute requiredRole="agent">
                <CommissionDashboard />
              </ProtectedRoute>
            ),
          },
          {
            path: 'arm-test',
            element: <ARMTestPage />,
          },
        ],
      },

      // Profile
      {
        path: 'profile',
        element: <Profile />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
    ],
  },

  // 404
  {
    path: '*',
    element: <NotFound />,
  },
];

// Route metadata for breadcrumbs and navigation
export const routeMetadata: Record<string, { title: string; icon?: string }> = {
  '/': { title: 'Home' },
  '/dashboard': { title: 'Dashboard', icon: 'dashboard' },
  '/tracking': { title: 'Tracking Dashboard', icon: 'track_changes' },
  '/rfq': { title: 'RFQ Management', icon: 'request_quote' },
  '/rfq/create': { title: 'Create RFQ', icon: 'add' },
  '/orders': { title: 'Orders', icon: 'shopping_cart' },
  '/orders/standing': { title: 'Standing Orders', icon: 'repeat' },
  '/marketplace': { title: 'Marketplace', icon: 'store' },
  '/marketplace/products': { title: 'Products', icon: 'inventory' },
  '/marketplace/suppliers': { title: 'Suppliers', icon: 'groups' },
  '/compliance': { title: 'Compliance', icon: 'verified' },
  '/compliance/certifications': { title: 'Certification Manager', icon: 'verified_user' },
  '/compliance/audits': { title: 'Audit Manager', icon: 'assignment' },
  '/compliance/tracker': { title: 'Compliance Tracker', icon: 'track_changes' },
  '/compliance/validator': { title: 'Validator', icon: 'rule' },
  '/documents': { title: 'Documents', icon: 'folder' },
  '/monitoring': { title: 'Monitoring', icon: 'monitor' },
  '/samples': { title: 'Sample Tracking', icon: 'science' },
  '/admin/import': { title: 'Data Import', icon: 'upload' },
  '/agent': { title: 'Agent Dashboard', icon: 'badge' },
  '/agent/leads': { title: 'Lead Management', icon: 'work' },
  '/agent/earnings': { title: 'Earnings', icon: 'payments' },
  '/ai-recommendations': { title: 'AI Recommendations', icon: 'auto_awesome' },
  '/ai-recommendations/visual-similarity': { title: 'Visual Similarity', icon: 'image_search' },
  '/ai-recommendations/predictive-analytics': { title: 'Predictive Analytics', icon: 'analytics' },
  '/collaboration': { title: 'Collaboration Hub', icon: 'group' },
  '/collaboration/projects': { title: 'Project Management', icon: 'assignment' },
  '/profile': { title: 'Profile', icon: 'person' },
  '/settings': { title: 'Settings', icon: 'settings' },
};