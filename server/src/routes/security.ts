import { Router } from 'express';

const router = Router();

// Security routes
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      message: 'Security endpoint',
      timestamp: new Date().toISOString(),
    },
  });
});

export default router;