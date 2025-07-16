import { Router } from 'express';
import { agentsRoutes } from './agents';
import { authRoutes } from './auth';
import { leadsRoutes } from './leads';
import { analyticsRoutes } from './analytics';
import { systemRoutes } from './system';

const router = Router();

// API v1 routes
router.use('/agents', agentsRoutes);
router.use('/auth', authRoutes);
router.use('/leads', leadsRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/system', systemRoutes);

// Version info
router.get('/', (req, res) => {
  res.json({
    version: '1.0.0',
    api: 'v1',
    timestamp: new Date().toISOString(),
    endpoints: {
      agents: '/api/v1/agents',
      auth: '/api/v1/auth',
      leads: '/api/v1/leads',
      analytics: '/api/v1/analytics',
      system: '/api/v1/system',
    },
  });
});

export { router as v1Router };