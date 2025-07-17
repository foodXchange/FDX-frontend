import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import { withOptimizations, lazyWithOptimizations } from '@/components/shared/withOptimizations';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { RoleGuard } from '@/components/auth/RoleGuard';

// Layouts - Load immediately as they're needed for all routes
const DashboardLayout = withOptimizations(
  lazy(() => import('@/layouts/DashboardLayout').then(m => ({ default: m.DashboardLayout }))),
  { preload: true }
);

const AuthLayout = withOptimizations(
  lazy(() => import('@/layouts/AuthLayout').then(m => ({ default: m.AuthLayout }))),
  { preload: true }
);

// Auth pages - High priority
const Login = lazyWithOptimizations(() => import('@/features/auth/Login'));
const Register = lazyWithOptimizations(() => import('@/features/auth/Register'));
const ForgotPassword = lazyWithOptimizations(() => import('@/features/auth/ForgotPassword'));

// Core pages - Medium priority
const Dashboard = lazyWithOptimizations(
  () => import('@/features/dashboard/Dashboard'),
  { preload: true }
);

const Profile = lazyWithOptimizations(() => import('@/features/profile/Profile'));
const Settings = lazyWithOptimizations(() => import('@/features/profile/Settings'));

// Feature modules - Lazy loaded with code splitting
const rfqRoutes = lazy(() => import('./features/rfqRoutes'));
const orderRoutes = lazy(() => import('./features/orderRoutes'));
const agentRoutes = lazy(() => import('./features/agentRoutes'));
const analyticsRoutes = lazy(() => import('./features/analyticsRoutes'));
const complianceRoutes = lazy(() => import('./features/complianceRoutes'));
const expertMarketplaceRoutes = lazy(() => import('./features/expertMarketplaceRoutes'));

// Error pages
const NotFound = lazyWithOptimizations(() => import('@/pages/NotFound'));
const Unauthorized = lazyWithOptimizations(() => import('@/features/auth/Unauthorized'));

// Optimized route configuration
export const optimizedRoutes: RouteObject[] = [
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      { path: 'forgot-password', element: <ForgotPassword /> },
    ],
  },
  {
    path: '/',
    element: (
      <AuthGuard>
        <DashboardLayout />
      </AuthGuard>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'profile', element: <Profile /> },
      { path: 'settings', element: <Settings /> },
      
      // Lazy loaded feature routes
      {
        path: 'rfq/*',
        lazy: async () => {
          const module = await import('./features/rfqRoutes');
          return { Component: module.default };
        },
      },
      {
        path: 'orders/*',
        lazy: async () => {
          const module = await import('./features/orderRoutes');
          return { Component: module.default };
        },
      },
      {
        path: 'agents/*',
        element: <RoleGuard allowedRoles={['agent', 'admin']} />,
        lazy: async () => {
          const module = await import('./features/agentRoutes');
          return { Component: module.default };
        },
      },
      {
        path: 'analytics/*',
        element: <RoleGuard allowedRoles={['admin', 'analyst']} />,
        lazy: async () => {
          const module = await import('./features/analyticsRoutes');
          return { Component: module.default };
        },
      },
      {
        path: 'compliance/*',
        lazy: async () => {
          const module = await import('./features/complianceRoutes');
          return { Component: module.default };
        },
      },
      {
        path: 'experts/*',
        lazy: async () => {
          const module = await import('./features/expertMarketplaceRoutes');
          return { Component: module.default };
        },
      },
    ],
  },
  { path: 'unauthorized', element: <Unauthorized /> },
  { path: '*', element: <NotFound /> },
];

// Preload critical routes
export const preloadCriticalRoutes = () => {
  // Preload dashboard as it's the most common landing page
  import('@/features/dashboard/Dashboard');
  
  // Preload based on user role
  const userRole = localStorage.getItem('userRole');
  
  if (userRole === 'agent') {
    import('./features/agentRoutes');
  } else if (userRole === 'admin') {
    import('./features/analyticsRoutes');
  }
};

// Route prefetching on hover/focus
export const prefetchRoute = (path: string) => {
  switch (true) {
    case path.includes('/rfq'):
      import('./features/rfqRoutes');
      break;
    case path.includes('/orders'):
      import('./features/orderRoutes');
      break;
    case path.includes('/agents'):
      import('./features/agentRoutes');
      break;
    case path.includes('/analytics'):
      import('./features/analyticsRoutes');
      break;
    case path.includes('/compliance'):
      import('./features/complianceRoutes');
      break;
    case path.includes('/experts'):
      import('./features/expertMarketplaceRoutes');
      break;
  }
};