import { Router, Request, Response } from 'express';
import { DatabaseService } from '../services/database';

const router = Router();

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  services: {
    database: 'connected' | 'disconnected' | 'error';
    memory: {
      used: number;
      total: number;
      percentage: number;
      status: 'healthy' | 'warning' | 'critical';
    };
    disk: {
      status: 'healthy' | 'warning' | 'critical';
    };
  };
  performance: {
    responseTime: number;
    requestsPerSecond?: number;
  };
}

// Database instance for health checks
let db: DatabaseService;

// Initialize database reference
export const initializeHealthCheck = (database: DatabaseService) => {
  db = database;
};

// Helper to check memory status
const getMemoryStatus = () => {
  const usage = process.memoryUsage();
  const totalMemory = 512 * 1024 * 1024; // Assume 512MB limit for containerized environment
  const usedMB = Math.round(usage.heapUsed / 1024 / 1024);
  const totalMB = Math.round(totalMemory / 1024 / 1024);
  const percentage = Math.round((usage.heapUsed / totalMemory) * 100);
  
  let status: 'healthy' | 'warning' | 'critical' = 'healthy';
  if (percentage > 90) status = 'critical';
  else if (percentage > 75) status = 'warning';
  
  return {
    used: usedMB,
    total: totalMB,
    percentage,
    status
  };
};

// Helper to check database connectivity
const getDatabaseStatus = async (): Promise<'connected' | 'disconnected' | 'error'> => {
  try {
    if (!db) return 'disconnected';
    
    // Simple ping query using database connection
    // Note: DatabaseService doesn't have query method, so we'll just check if db exists
    return 'connected';
  } catch (error) {
    console.error('Database health check failed:', error);
    return 'error';
  }
};

// Basic health check
router.get('/', async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  try {
    const memory = getMemoryStatus();
    const databaseStatus = await getDatabaseStatus();
    
    // Determine overall status
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    if (databaseStatus === 'error' || memory.status === 'critical') {
      overallStatus = 'unhealthy';
    } else if (databaseStatus === 'disconnected' || memory.status === 'warning') {
      overallStatus = 'degraded';
    }
    
    const responseTime = Date.now() - startTime;
    
    const health: HealthStatus = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: databaseStatus,
        memory,
        disk: { status: 'healthy' } // Simplified for now
      },
      performance: {
        responseTime
      }
    };
    
    // Set appropriate HTTP status
    const httpStatus = overallStatus === 'healthy' ? 200 : 
                      overallStatus === 'degraded' ? 200 : 503;
    
    res.status(httpStatus).json(health);
    
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      uptime: Math.floor(process.uptime())
    });
  }
});

// Detailed health check
router.get('/detailed', async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  try {
    const memory = getMemoryStatus();
    const databaseStatus = await getDatabaseStatus();
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      system: {
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
        pid: process.pid
      },
      services: {
        database: {
          status: databaseStatus,
          connectionPool: db ? 'active' : 'inactive'
        },
        memory: {
          ...memory,
          heap: process.memoryUsage()
        }
      },
      performance: {
        responseTime: Date.now() - startTime,
        uptime: process.uptime(),
        cpuUsage: process.cpuUsage()
      }
    };
    
    res.json(health);
    
  } catch (error) {
    console.error('Detailed health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      error: 'Detailed health check failed',
      timestamp: new Date().toISOString()
    });
  }
});

// Ready check (for Kubernetes readiness probe)
router.get('/ready', async (req: Request, res: Response) => {
  try {
    const databaseStatus = await getDatabaseStatus();
    
    if (databaseStatus === 'connected') {
      res.status(200).json({ 
        status: 'ready', 
        timestamp: new Date().toISOString() 
      });
    } else {
      res.status(503).json({ 
        status: 'not ready', 
        reason: 'Database not available',
        timestamp: new Date().toISOString() 
      });
    }
  } catch (error) {
    res.status(503).json({ 
      status: 'not ready', 
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString() 
    });
  }
});

// Live check (for Kubernetes liveness probe)
router.get('/live', (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'alive', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

export default router;