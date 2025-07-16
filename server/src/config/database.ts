import { Pool } from 'pg';
import Redis from 'redis';
import dotenv from 'dotenv';

dotenv.config();

// PostgreSQL connection for production
export const createPgPool = () => {
  return new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'fdx_agents',
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 5000, // Return an error after 5 seconds if connection could not be established
    statement_timeout: 30000, // Timeout statements after 30 seconds
    query_timeout: 30000, // Timeout queries after 30 seconds
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });
};

// Redis connection for caching and sessions
export const createRedisClient = () => {
  const client = Redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    retry_strategy: (options) => {
      if (options.error && options.error.code === 'ECONNREFUSED') {
        console.error('Redis connection refused');
        return new Error('Redis connection refused');
      }
      if (options.total_retry_time > 1000 * 60 * 60) {
        console.error('Redis retry time exhausted');
        return new Error('Redis retry time exhausted');
      }
      if (options.attempt > 10) {
        console.error('Redis connection attempts exhausted');
        return new Error('Redis connection attempts exhausted');
      }
      return Math.min(options.attempt * 100, 3000);
    },
  });

  client.on('error', (err) => {
    console.error('Redis error:', err);
  });

  client.on('connect', () => {
    console.log('✅ Redis connected');
  });

  return client;
};

// Database configuration
export const dbConfig = {
  // Connection pool settings
  pool: {
    min: 2,
    max: 10,
    acquireTimeoutMillis: 30000,
    createTimeoutMillis: 30000,
    destroyTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 200,
  },
  
  // Migration settings
  migrations: {
    directory: './migrations',
    tableName: 'knex_migrations',
  },
  
  // Seed settings
  seeds: {
    directory: './seeds',
  },
};