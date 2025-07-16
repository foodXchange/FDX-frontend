import { RouteObject } from 'react-router-dom';
import { lazy } from 'react';

// Lazy load expert marketplace pages
const ExpertMarketplace = lazy(() => import('./pages/ExpertMarketplace'));
const ExpertDiscovery = lazy(() => import('./pages/ExpertDiscovery'));
const ExpertProfile = lazy(() => import('./pages/ExpertProfile'));
const ExpertDashboard = lazy(() => import('./pages/ExpertDashboard'));
const CollaborationWorkspace = lazy(() => import('./pages/CollaborationWorkspace'));
const BookingManagement = lazy(() => import('./pages/BookingManagement'));
const ExpertServices = lazy(() => import('./pages/ExpertServices'));

export const expertMarketplaceRoutes: RouteObject[] = [
  {
    path: 'experts',
    children: [
      {
        index: true,
        element: <ExpertMarketplace />,
      },
      {
        path: 'discover',
        element: <ExpertDiscovery />,
      },
      {
        path: 'profile/:expertId',
        element: <ExpertProfile />,
      },
      {
        path: 'dashboard',
        element: <ExpertDashboard />,
      },
      {
        path: 'services/:serviceId?',
        element: <ExpertServices />,
      },
      {
        path: 'collaborations/:collaborationId',
        element: <CollaborationWorkspace />,
      },
      {
        path: 'bookings',
        element: <BookingManagement />,
      },
    ],
  },
];