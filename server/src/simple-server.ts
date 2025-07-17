import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import path from 'path';
import fs from 'fs/promises';
import { logger } from './services/logger';
import { uploadSingle } from './middleware/upload';
import { UPLOAD_CONFIG } from './config/upload';

const app = express();
const PORT = process.env.PORT || 3003;

// Basic security for development
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development
  crossOriginEmbedderPolicy: false,
}));

// Compression
app.use(compression());

// CORS - more permissive for development
app.use(cors({
  origin: true,
  credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Simple request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// Create uploads directory
const uploadsDir = path.join(process.cwd(), UPLOAD_CONFIG.UPLOAD_DIR);
const initializeDirectories = async () => {
  const dirs = [
    uploadsDir,
    path.join(uploadsDir, 'images'),
    path.join(uploadsDir, 'documents'),
    path.join(uploadsDir, 'general'),
  ];
  
  for (const dir of dirs) {
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true });
      logger.info(`Created directory: ${dir}`);
    }
  }
};

// Serve static files with proper headers
app.use('/uploads', express.static(uploadsDir, {
  maxAge: '1h',
  etag: true,
  setHeaders: (res, filePath) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
  },
}));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Upload endpoint - simplified for development
app.post('/api/upload', uploadSingle('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded',
      });
    }

    // Get file category from middleware
    const category = req.file.path.includes('/images/') ? 'images' : 
                    req.file.path.includes('/documents/') ? 'documents' : 'general';

    res.json({
      success: true,
      data: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        category,
        url: `/uploads/${category}/${req.file.filename}`,
      },
    });

    logger.info('File uploaded successfully', {
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
      category,
    });
  } catch (error) {
    logger.error('Upload error', error as Error);
    res.status(500).json({
      success: false,
      error: 'Upload failed',
    });
  }
});

// Basic API endpoints
app.get('/api/agents', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        status: 'active',
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        status: 'active',
      },
    ],
  });
});

app.get('/api/leads', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        name: 'Alice Johnson',
        email: 'alice@example.com',
        status: 'new',
      },
      {
        id: '2',
        name: 'Bob Wilson',
        email: 'bob@example.com',
        status: 'contacted',
      },
    ],
  });
});

app.get('/api/analytics', (req, res) => {
  res.json({
    success: true,
    data: {
      totalLeads: 150,
      totalAgents: 25,
      conversionRate: 18.5,
      revenue: 125000,
    },
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl,
  });
});

// Error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});

// Start server
const startServer = async () => {
  try {
    await initializeDirectories();
    
    app.listen(PORT, () => {
      logger.info(`🚀 Development server running on port ${PORT}`);
      logger.info(`📊 Health check: http://localhost:${PORT}/health`);
      logger.info(`📁 Uploads directory: ${uploadsDir}`);
      logger.info(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error('Failed to start server', error as Error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

startServer();

export default app;