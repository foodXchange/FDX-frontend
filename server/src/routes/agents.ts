import { Router } from 'express';
import { uploadSingle } from '../middleware/upload';

const router = Router();

// Agent routes
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      message: 'Agents endpoint',
      timestamp: new Date().toISOString(),
    },
  });
});

router.post('/upload', uploadSingle('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'No file uploaded',
    });
  }

  res.json({
    success: true,
    data: {
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size,
      url: `/uploads/${req.file.filename}`,
    },
  });
});

export default router;