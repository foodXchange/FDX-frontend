import dotenv from 'dotenv';
import { logger } from '../services/logger';

// Load environment variables
dotenv.config();

export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  ssl: boolean | { rejectUnauthorized: boolean };
  maxConnections: number;
  idleTimeoutMillis: number;
  connectionTimeoutMillis: number;
  statementTimeout: number;
  queryTimeout: number;
}

export interface RedisConfig {
  url: string;
  password?: string;
  maxRetriesPerRequest: number;
  retryDelayOnFailover: number;
  enableReadyCheck: boolean;
}

export interface AppConfig {
  port: number;
  nodeEnv: string;
  logLevel: string;
  jwtSecret: string;
  corsOrigins: string[];
  rateLimitMax: number;
  rateLimitWindowMs: number;
  uploadMaxSize: number;
  uploadDir: string;
  sessionSecret: string;
  sessionMaxAge: number;
}

export interface BackupConfig {
  enabled: boolean;
  schedule: string;
  retention: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  compression: boolean;
  encryption: boolean;
  path: string;
}

export interface MonitoringConfig {
  enabled: boolean;
  metricsPort: number;
  healthCheckInterval: number;
  alertThresholds: {
    cpu: number;
    memory: number;
    disk: number;
    responseTime: number;
  };
}

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
}

export interface SecurityConfig {
  bcryptRounds: number;
  jwtExpiresIn: string;
  jwtRefreshExpiresIn: string;
  maxLoginAttempts: number;
  lockoutDuration: number;
  passwordMinLength: number;
  passwordRequireSpecial: boolean;
  csrfEnabled: boolean;
  httpsOnly: boolean;
}

class EnvironmentConfig {
  private static instance: EnvironmentConfig;
  
  public readonly app: AppConfig;
  public readonly database: DatabaseConfig;
  public readonly redis: RedisConfig;
  public readonly backup: BackupConfig;
  public readonly monitoring: MonitoringConfig;
  public readonly email: EmailConfig;
  public readonly security: SecurityConfig;

  private constructor() {
    this.app = this.loadAppConfig();
    this.database = this.loadDatabaseConfig();
    this.redis = this.loadRedisConfig();
    this.backup = this.loadBackupConfig();
    this.monitoring = this.loadMonitoringConfig();
    this.email = this.loadEmailConfig();
    this.security = this.loadSecurityConfig();

    this.validateConfig();
  }

  public static getInstance(): EnvironmentConfig {
    if (!EnvironmentConfig.instance) {
      EnvironmentConfig.instance = new EnvironmentConfig();
    }
    return EnvironmentConfig.instance;
  }

  private loadAppConfig(): AppConfig {
    return {
      port: this.getNumber('PORT', 3000),
      nodeEnv: this.getString('NODE_ENV', 'development'),
      logLevel: this.getString('LOG_LEVEL', 'info'),
      jwtSecret: this.getString('JWT_SECRET', 'your-jwt-secret-change-in-production'),
      corsOrigins: this.getString('CORS_ORIGINS', 'http://localhost:3000,http://localhost:8080')
        .split(',')
        .map(origin => origin.trim()),
      rateLimitMax: this.getNumber('RATE_LIMIT_MAX', 100),
      rateLimitWindowMs: this.getNumber('RATE_LIMIT_WINDOW_MS', 900000), // 15 minutes
      uploadMaxSize: this.getNumber('UPLOAD_MAX_SIZE', 10 * 1024 * 1024), // 10MB
      uploadDir: this.getString('UPLOAD_DIR', './uploads'),
      sessionSecret: this.getString('SESSION_SECRET', 'your-session-secret-change-in-production'),
      sessionMaxAge: this.getNumber('SESSION_MAX_AGE', 24 * 60 * 60 * 1000), // 24 hours
    };
  }

  private loadDatabaseConfig(): DatabaseConfig {
    return {
      host: this.getString('DB_HOST', 'localhost'),
      port: this.getNumber('DB_PORT', 5432),
      user: this.getString('DB_USER', 'postgres'),
      password: this.getString('DB_PASSWORD', 'password'),
      database: this.getString('DB_NAME', 'fdx_agents'),
      ssl: this.app.nodeEnv === 'production' 
        ? { rejectUnauthorized: false }
        : false,
      maxConnections: this.getNumber('DB_MAX_CONNECTIONS', 20),
      idleTimeoutMillis: this.getNumber('DB_IDLE_TIMEOUT', 30000),
      connectionTimeoutMillis: this.getNumber('DB_CONNECTION_TIMEOUT', 5000),
      statementTimeout: this.getNumber('DB_STATEMENT_TIMEOUT', 30000),
      queryTimeout: this.getNumber('DB_QUERY_TIMEOUT', 30000),
    };
  }

  private loadRedisConfig(): RedisConfig {
    return {
      url: this.getString('REDIS_URL', 'redis://localhost:6379'),
      password: this.getString('REDIS_PASSWORD', undefined),
      maxRetriesPerRequest: this.getNumber('REDIS_MAX_RETRIES', 3),
      retryDelayOnFailover: this.getNumber('REDIS_RETRY_DELAY', 100),
      enableReadyCheck: this.getBoolean('REDIS_READY_CHECK', true),
    };
  }

  private loadBackupConfig(): BackupConfig {
    return {
      enabled: this.getBoolean('BACKUP_ENABLED', false),
      schedule: this.getString('BACKUP_SCHEDULE', '0 2 * * *'), // Daily at 2 AM
      retention: {
        daily: this.getNumber('BACKUP_RETENTION_DAILY', 7),
        weekly: this.getNumber('BACKUP_RETENTION_WEEKLY', 4),
        monthly: this.getNumber('BACKUP_RETENTION_MONTHLY', 12),
      },
      compression: this.getBoolean('BACKUP_COMPRESSION', true),
      encryption: this.getBoolean('BACKUP_ENCRYPTION', false),
      path: this.getString('BACKUP_PATH', './backups'),
    };
  }

  private loadMonitoringConfig(): MonitoringConfig {
    return {
      enabled: this.getBoolean('MONITORING_ENABLED', true),
      metricsPort: this.getNumber('METRICS_PORT', 9090),
      healthCheckInterval: this.getNumber('HEALTH_CHECK_INTERVAL', 30000),
      alertThresholds: {
        cpu: this.getNumber('ALERT_CPU_THRESHOLD', 80),
        memory: this.getNumber('ALERT_MEMORY_THRESHOLD', 80),
        disk: this.getNumber('ALERT_DISK_THRESHOLD', 80),
        responseTime: this.getNumber('ALERT_RESPONSE_TIME_THRESHOLD', 5000),
      },
    };
  }

  private loadEmailConfig(): EmailConfig {
    return {
      host: this.getString('EMAIL_HOST', 'smtp.gmail.com'),
      port: this.getNumber('EMAIL_PORT', 587),
      secure: this.getBoolean('EMAIL_SECURE', false),
      auth: {
        user: this.getString('EMAIL_USER', ''),
        pass: this.getString('EMAIL_PASS', ''),
      },
      from: this.getString('EMAIL_FROM', 'noreply@fdx-agents.com'),
    };
  }

  private loadSecurityConfig(): SecurityConfig {
    return {
      bcryptRounds: this.getNumber('BCRYPT_ROUNDS', 12),
      jwtExpiresIn: this.getString('JWT_EXPIRES_IN', '15m'),
      jwtRefreshExpiresIn: this.getString('JWT_REFRESH_EXPIRES_IN', '7d'),
      maxLoginAttempts: this.getNumber('MAX_LOGIN_ATTEMPTS', 5),
      lockoutDuration: this.getNumber('LOCKOUT_DURATION', 15 * 60 * 1000), // 15 minutes
      passwordMinLength: this.getNumber('PASSWORD_MIN_LENGTH', 8),
      passwordRequireSpecial: this.getBoolean('PASSWORD_REQUIRE_SPECIAL', true),
      csrfEnabled: this.getBoolean('CSRF_ENABLED', this.app.nodeEnv === 'production'),
      httpsOnly: this.getBoolean('HTTPS_ONLY', this.app.nodeEnv === 'production'),
    };
  }

  private getString(key: string, defaultValue?: string): string {
    const value = process.env[key];
    if (value === undefined) {
      if (defaultValue === undefined) {
        throw new Error(`Environment variable ${key} is required`);
      }
      return defaultValue;
    }
    return value;
  }

  private getNumber(key: string, defaultValue?: number): number {
    const value = process.env[key];
    if (value === undefined) {
      if (defaultValue === undefined) {
        throw new Error(`Environment variable ${key} is required`);
      }
      return defaultValue;
    }
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) {
      throw new Error(`Environment variable ${key} must be a number`);
    }
    return parsed;
  }

  private getBoolean(key: string, defaultValue?: boolean): boolean {
    const value = process.env[key];
    if (value === undefined) {
      if (defaultValue === undefined) {
        throw new Error(`Environment variable ${key} is required`);
      }
      return defaultValue;
    }
    return value.toLowerCase() === 'true';
  }

  private validateConfig() {
    const errors: string[] = [];

    // Validate required production settings
    if (this.app.nodeEnv === 'production') {
      if (this.app.jwtSecret === 'your-jwt-secret-change-in-production') {
        errors.push('JWT_SECRET must be set in production');
      }
      if (this.app.sessionSecret === 'your-session-secret-change-in-production') {
        errors.push('SESSION_SECRET must be set in production');
      }
      if (!this.email.auth.user || !this.email.auth.pass) {
        errors.push('EMAIL_USER and EMAIL_PASS must be set in production');
      }
    }

    // Validate port ranges
    if (this.app.port < 1 || this.app.port > 65535) {
      errors.push('PORT must be between 1 and 65535');
    }
    if (this.database.port < 1 || this.database.port > 65535) {
      errors.push('DB_PORT must be between 1 and 65535');
    }

    // Validate positive numbers
    if (this.database.maxConnections <= 0) {
      errors.push('DB_MAX_CONNECTIONS must be positive');
    }
    if (this.app.rateLimitMax <= 0) {
      errors.push('RATE_LIMIT_MAX must be positive');
    }
    if (this.app.uploadMaxSize <= 0) {
      errors.push('UPLOAD_MAX_SIZE must be positive');
    }

    // Validate log level
    const validLogLevels = ['error', 'warn', 'info', 'debug'];
    if (!validLogLevels.includes(this.app.logLevel)) {
      errors.push(`LOG_LEVEL must be one of: ${validLogLevels.join(', ')}`);
    }

    // Validate node environment
    const validNodeEnvs = ['development', 'test', 'production'];
    if (!validNodeEnvs.includes(this.app.nodeEnv)) {
      errors.push(`NODE_ENV must be one of: ${validNodeEnvs.join(', ')}`);
    }

    if (errors.length > 0) {
      const errorMessage = `Configuration validation failed:\n${errors.join('\n')}`;
      logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    logger.info('Configuration validation passed', {
      nodeEnv: this.app.nodeEnv,
      port: this.app.port,
      dbHost: this.database.host,
      redisUrl: this.redis.url,
      backupEnabled: this.backup.enabled,
      monitoringEnabled: this.monitoring.enabled,
    });
  }

  // Helper method to get all configuration as a safe object (without secrets)
  public getSafeConfig() {
    return {
      app: {
        ...this.app,
        jwtSecret: '***',
        sessionSecret: '***',
      },
      database: {
        ...this.database,
        password: '***',
      },
      redis: {
        ...this.redis,
        password: this.redis.password ? '***' : undefined,
      },
      backup: this.backup,
      monitoring: this.monitoring,
      email: {
        ...this.email,
        auth: {
          user: this.email.auth.user,
          pass: this.email.auth.pass ? '***' : '',
        },
      },
      security: {
        ...this.security,
      },
    };
  }

  // Environment-specific feature flags
  public get isDevelopment(): boolean {
    return this.app.nodeEnv === 'development';
  }

  public get isProduction(): boolean {
    return this.app.nodeEnv === 'production';
  }

  public get isTest(): boolean {
    return this.app.nodeEnv === 'test';
  }
}

// Export singleton instance
export const config = EnvironmentConfig.getInstance();

// Export individual configs for convenience
export const {
  app: appConfig,
  database: databaseConfig,
  redis: redisConfig,
  backup: backupConfig,
  monitoring: monitoringConfig,
  email: emailConfig,
  security: securityConfig,
} = config;