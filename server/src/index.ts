import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/auth';
import leadsRoutes from './routes/leads';
import agentsRoutes from './routes/agents';
import analyticsRoutes from './routes/analytics';
import uploadRoutes from './routes/upload';
import securityRoutes from './routes/security';
import notificationRoutes from './routes/notifications';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { securityMiddleware } from './middleware/security';
import { authMiddleware } from './middleware/auth';

// Import services
import { DatabaseService } from './services/database';
import { WebSocketService } from './services/websocket';
import { AnalyticsService } from './services/analytics';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3001;

// Initialize services
const db = new DatabaseService();
const wss = new WebSocketServer({ server });
const wsService = new WebSocketService(wss);
const analyticsService = new AnalyticsService(db);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Basic middleware
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 30 * 60 * 1000, // 30 minutes
  },
}));

// Custom middleware
app.use(requestLogger);
app.use(securityMiddleware);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.version,
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', authMiddleware, leadsRoutes);
app.use('/api/agents', authMiddleware, agentsRoutes);
app.use('/api/analytics', authMiddleware, analyticsRoutes);
app.use('/api/upload', authMiddleware, uploadRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/notifications', authMiddleware, notificationRoutes);

// Serve static files for development
if (process.env.NODE_ENV !== 'production') {
  app.use('/uploads', express.static('uploads'));
}

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl,
  });
});

// Initialize database and start server
async function startServer() {
  try {
    // Initialize database
    await db.initialize();
    console.log('✅ Database initialized successfully');

    // Start WebSocket service
    wsService.initialize();
    console.log('✅ WebSocket service initialized');

    // Start analytics service
    analyticsService.initialize();
    console.log('✅ Analytics service initialized');

    // Start server
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔒 Environment: ${process.env.NODE_ENV || 'development'}`);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📛 SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    db.close();
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('📛 SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    db.close();
    process.exit(0);
  });
});

// Start the server
startServer();

export default app;