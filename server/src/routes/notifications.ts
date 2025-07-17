import { Router } from 'express';

const router = Router();

// Notifications routes
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      message: 'Notifications endpoint',
      timestamp: new Date().toISOString(),
    },
  });
});

export default router;