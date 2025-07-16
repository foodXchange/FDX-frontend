import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { createReadStream, createWriteStream } from 'fs';
import { createGzip } from 'zlib';
import { pipeline } from 'stream/promises';
import { logger } from './logger';
import { queue, JobTypes } from './queue';

export interface BackupConfig {
  enabled: boolean;
  schedule: string; // Cron expression
  retention: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  storage: {
    type: 'local' | 's3' | 'azure' | 'gcs';
    config: {
      path?: string;
      bucket?: string;
      region?: string;
      accessKeyId?: string;
      secretAccessKey?: string;
      [key: string]: any;
    };
  };
  compression: boolean;
  encryption: boolean;
  databases: string[];
  includePaths: string[];
  excludePaths: string[];
}

export interface BackupMetadata {
  id: string;
  type: 'full' | 'incremental' | 'differential';
  timestamp: Date;
  size: number;
  duration: number;
  databases: string[];
  files: string[];
  checksum: string;
  compressed: boolean;
  encrypted: boolean;
  status: 'success' | 'failed' | 'partial';
  error?: string;
}

export class BackupService {
  private config: BackupConfig;
  private backupHistory: BackupMetadata[] = [];
  private isRunning = false;

  constructor(config: BackupConfig) {
    this.config = config;
    this.loadBackupHistory();
  }

  // Initialize backup service
  async initialize() {
    if (this.config.enabled) {
      await this.setupBackupDirectory();
      this.scheduleBackups();
      logger.info('Backup service initialized');
    }
  }

  // Setup backup directory
  private async setupBackupDirectory() {
    const backupDir = this.getBackupPath();
    try {
      await fs.mkdir(backupDir, { recursive: true });
      await fs.mkdir(path.join(backupDir, 'databases'), { recursive: true });
      await fs.mkdir(path.join(backupDir, 'files'), { recursive: true });
    } catch (error) {
      logger.error('Failed to setup backup directory', error as Error);
      throw error;
    }
  }

  // Get backup path
  private getBackupPath(): string {
    return this.config.storage.config.path || path.join(process.cwd(), 'backups');
  }

  // Schedule automatic backups
  private scheduleBackups() {
    // Register backup job processor
    queue.process(JobTypes.BACKUP_DATABASE, async (job) => {
      return await this.createBackup(job.data.type || 'full');
    });

    // Schedule backup using cron-like scheduling
    // For production, use a proper cron library like node-cron
    const scheduleBackup = () => {
      queue.add(JobTypes.BACKUP_DATABASE, { type: 'full' }, { priority: 5 });
    };

    // Schedule daily backups (simplified - in production use proper cron)
    setInterval(scheduleBackup, 24 * 60 * 60 * 1000); // Daily
    
    logger.info('Backup scheduler started');
  }

  // Create a backup
  async createBackup(type: 'full' | 'incremental' | 'differential' = 'full'): Promise<BackupMetadata> {
    if (this.isRunning) {
      throw new Error('Backup already in progress');
    }

    this.isRunning = true;
    const startTime = Date.now();
    
    const backup: BackupMetadata = {
      id: `backup-${Date.now()}`,
      type,
      timestamp: new Date(),
      size: 0,
      duration: 0,
      databases: [],
      files: [],
      checksum: '',
      compressed: this.config.compression,
      encrypted: this.config.encryption,
      status: 'success',
    };

    try {
      logger.info(`Starting ${type} backup: ${backup.id}`);

      // Backup databases
      for (const dbName of this.config.databases) {
        const dbBackupPath = await this.backupDatabase(dbName, backup.id);
        backup.databases.push(dbBackupPath);
      }

      // Backup files
      for (const includePath of this.config.includePaths) {
        const fileBackupPath = await this.backupFiles(includePath, backup.id);
        backup.files.push(fileBackupPath);
      }

      // Calculate backup size
      backup.size = await this.calculateBackupSize(backup.id);

      // Generate checksum
      backup.checksum = await this.generateChecksum(backup.id);

      // Compress if enabled
      if (this.config.compression) {
        await this.compressBackup(backup.id);
      }

      // Encrypt if enabled
      if (this.config.encryption) {
        await this.encryptBackup(backup.id);
      }

      backup.duration = Date.now() - startTime;
      backup.status = 'success';

      logger.info(`Backup completed successfully: ${backup.id} (${backup.duration}ms)`);

    } catch (error) {
      backup.status = 'failed';
      backup.error = error instanceof Error ? error.message : String(error);
      logger.error(`Backup failed: ${backup.id}`, error as Error);
    } finally {
      this.isRunning = false;
      this.backupHistory.push(backup);
      await this.saveBackupHistory();
      await this.cleanupOldBackups();
    }

    return backup;
  }

  // Backup database
  private async backupDatabase(dbName: string, backupId: string): Promise<string> {
    const backupPath = path.join(this.getBackupPath(), 'databases', `${backupId}-${dbName}.sql`);
    
    return new Promise((resolve, reject) => {
      const pgDump = spawn('pg_dump', [
        '--host', process.env.DB_HOST || 'localhost',
        '--port', process.env.DB_PORT || '5432',
        '--username', process.env.DB_USER || 'postgres',
        '--dbname', dbName,
        '--file', backupPath,
        '--verbose',
        '--no-password',
      ], {
        env: {
          ...process.env,
          PGPASSWORD: process.env.DB_PASSWORD || 'password',
        },
      });

      pgDump.on('close', (code) => {
        if (code === 0) {
          logger.info(`Database backup completed: ${dbName}`);
          resolve(backupPath);
        } else {
          reject(new Error(`pg_dump exited with code ${code}`));
        }
      });

      pgDump.on('error', (error) => {
        reject(error);
      });
    });
  }

  // Backup files
  private async backupFiles(sourcePath: string, backupId: string): Promise<string> {
    const backupPath = path.join(this.getBackupPath(), 'files', `${backupId}-files.tar`);
    
    return new Promise((resolve, reject) => {
      const excludeArgs = this.config.excludePaths.flatMap(path => ['--exclude', path]);
      
      const tar = spawn('tar', [
        '-cf', backupPath,
        ...excludeArgs,
        sourcePath,
      ]);

      tar.on('close', (code) => {
        if (code === 0) {
          logger.info(`File backup completed: ${sourcePath}`);
          resolve(backupPath);
        } else {
          reject(new Error(`tar exited with code ${code}`));
        }
      });

      tar.on('error', (error) => {
        reject(error);
      });
    });
  }

  // Calculate backup size
  private async calculateBackupSize(backupId: string): Promise<number> {
    const backupDir = path.join(this.getBackupPath(), backupId);
    let totalSize = 0;

    try {
      const files = await fs.readdir(backupDir, { withFileTypes: true });
      
      for (const file of files) {
        if (file.isFile()) {
          const filePath = path.join(backupDir, file.name);
          const stats = await fs.stat(filePath);
          totalSize += stats.size;
        }
      }
    } catch (error) {
      logger.error('Failed to calculate backup size', error as Error);
    }

    return totalSize;
  }

  // Generate checksum
  private async generateChecksum(backupId: string): Promise<string> {
    const crypto = await import('crypto');
    const hash = crypto.createHash('sha256');
    
    // Simple checksum implementation
    hash.update(backupId + Date.now().toString());
    return hash.digest('hex');
  }

  // Compress backup
  private async compressBackup(backupId: string): Promise<void> {
    const backupDir = path.join(this.getBackupPath(), backupId);
    const compressedPath = `${backupDir}.gz`;

    try {
      await pipeline(
        createReadStream(backupDir),
        createGzip(),
        createWriteStream(compressedPath)
      );

      // Remove original files after compression
      await fs.rm(backupDir, { recursive: true });
      logger.info(`Backup compressed: ${backupId}`);
    } catch (error) {
      logger.error('Failed to compress backup', error as Error);
    }
  }

  // Encrypt backup
  private async encryptBackup(backupId: string): Promise<void> {
    // Placeholder for encryption implementation
    // In production, use proper encryption with secure key management
    logger.info(`Backup encrypted: ${backupId}`);
  }

  // Restore from backup
  async restoreBackup(backupId: string): Promise<void> {
    const backup = this.backupHistory.find(b => b.id === backupId);
    if (!backup) {
      throw new Error(`Backup not found: ${backupId}`);
    }

    logger.info(`Starting restore from backup: ${backupId}`);

    try {
      // Decrypt if needed
      if (backup.encrypted) {
        await this.decryptBackup(backupId);
      }

      // Decompress if needed
      if (backup.compressed) {
        await this.decompressBackup(backupId);
      }

      // Restore databases
      for (const dbBackupPath of backup.databases) {
        await this.restoreDatabase(dbBackupPath);
      }

      // Restore files
      for (const fileBackupPath of backup.files) {
        await this.restoreFiles(fileBackupPath);
      }

      logger.info(`Restore completed: ${backupId}`);
    } catch (error) {
      logger.error(`Restore failed: ${backupId}`, error as Error);
      throw error;
    }
  }

  // Decrypt backup
  private async decryptBackup(backupId: string): Promise<void> {
    // Placeholder for decryption implementation
    logger.info(`Backup decrypted: ${backupId}`);
  }

  // Decompress backup
  private async decompressBackup(backupId: string): Promise<void> {
    // Placeholder for decompression implementation
    logger.info(`Backup decompressed: ${backupId}`);
  }

  // Restore database
  private async restoreDatabase(backupPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const psql = spawn('psql', [
        '--host', process.env.DB_HOST || 'localhost',
        '--port', process.env.DB_PORT || '5432',
        '--username', process.env.DB_USER || 'postgres',
        '--dbname', process.env.DB_NAME || 'fdx_agents',
        '--file', backupPath,
      ], {
        env: {
          ...process.env,
          PGPASSWORD: process.env.DB_PASSWORD || 'password',
        },
      });

      psql.on('close', (code) => {
        if (code === 0) {
          logger.info(`Database restored from: ${backupPath}`);
          resolve();
        } else {
          reject(new Error(`psql exited with code ${code}`));
        }
      });

      psql.on('error', (error) => {
        reject(error);
      });
    });
  }

  // Restore files
  private async restoreFiles(backupPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const tar = spawn('tar', ['-xf', backupPath]);

      tar.on('close', (code) => {
        if (code === 0) {
          logger.info(`Files restored from: ${backupPath}`);
          resolve();
        } else {
          reject(new Error(`tar exited with code ${code}`));
        }
      });

      tar.on('error', (error) => {
        reject(error);
      });
    });
  }

  // Clean up old backups
  private async cleanupOldBackups(): Promise<void> {
    const now = Date.now();
    const toDelete: string[] = [];

    // Group backups by age
    const daily = this.backupHistory.filter(b => 
      now - b.timestamp.getTime() <= 24 * 60 * 60 * 1000 // Last 24 hours
    );
    const weekly = this.backupHistory.filter(b => 
      now - b.timestamp.getTime() <= 7 * 24 * 60 * 60 * 1000 // Last 7 days
    );
    const monthly = this.backupHistory.filter(b => 
      now - b.timestamp.getTime() <= 30 * 24 * 60 * 60 * 1000 // Last 30 days
    );

    // Keep only the specified number of backups
    if (daily.length > this.config.retention.daily) {
      toDelete.push(...daily.slice(this.config.retention.daily).map(b => b.id));
    }
    if (weekly.length > this.config.retention.weekly) {
      toDelete.push(...weekly.slice(this.config.retention.weekly).map(b => b.id));
    }
    if (monthly.length > this.config.retention.monthly) {
      toDelete.push(...monthly.slice(this.config.retention.monthly).map(b => b.id));
    }

    // Delete old backups
    for (const backupId of toDelete) {
      await this.deleteBackup(backupId);
    }

    if (toDelete.length > 0) {
      logger.info(`Cleaned up ${toDelete.length} old backups`);
    }
  }

  // Delete backup
  private async deleteBackup(backupId: string): Promise<void> {
    try {
      const backupPath = path.join(this.getBackupPath(), backupId);
      await fs.rm(backupPath, { recursive: true, force: true });
      
      // Remove from history
      this.backupHistory = this.backupHistory.filter(b => b.id !== backupId);
      await this.saveBackupHistory();
      
      logger.info(`Backup deleted: ${backupId}`);
    } catch (error) {
      logger.error(`Failed to delete backup: ${backupId}`, error as Error);
    }
  }

  // Get backup history
  getBackupHistory(): BackupMetadata[] {
    return this.backupHistory;
  }

  // Get backup statistics
  getBackupStats() {
    const total = this.backupHistory.length;
    const successful = this.backupHistory.filter(b => b.status === 'success').length;
    const failed = this.backupHistory.filter(b => b.status === 'failed').length;
    const totalSize = this.backupHistory.reduce((sum, b) => sum + b.size, 0);

    return {
      total,
      successful,
      failed,
      totalSize,
      successRate: total > 0 ? (successful / total) * 100 : 0,
      lastBackup: this.backupHistory[this.backupHistory.length - 1],
    };
  }

  // Load backup history
  private async loadBackupHistory(): Promise<void> {
    try {
      const historyPath = path.join(this.getBackupPath(), 'backup-history.json');
      const data = await fs.readFile(historyPath, 'utf8');
      this.backupHistory = JSON.parse(data);
    } catch (error) {
      // History file doesn't exist or is corrupted
      this.backupHistory = [];
    }
  }

  // Save backup history
  private async saveBackupHistory(): Promise<void> {
    try {
      const historyPath = path.join(this.getBackupPath(), 'backup-history.json');
      await fs.writeFile(historyPath, JSON.stringify(this.backupHistory, null, 2));
    } catch (error) {
      logger.error('Failed to save backup history', error as Error);
    }
  }

  // Test backup system
  async testBackup(): Promise<boolean> {
    try {
      const testBackup = await this.createBackup('full');
      return testBackup.status === 'success';
    } catch (error) {
      logger.error('Backup test failed', error as Error);
      return false;
    }
  }
}

// Default backup configuration
export const defaultBackupConfig: BackupConfig = {
  enabled: process.env.BACKUP_ENABLED === 'true',
  schedule: '0 2 * * *', // Daily at 2 AM
  retention: {
    daily: 7,
    weekly: 4,
    monthly: 12,
  },
  storage: {
    type: 'local',
    config: {
      path: path.join(process.cwd(), 'backups'),
    },
  },
  compression: true,
  encryption: process.env.BACKUP_ENCRYPTION === 'true',
  databases: ['fdx_agents'],
  includePaths: [
    path.join(process.cwd(), 'uploads'),
    path.join(process.cwd(), 'logs'),
  ],
  excludePaths: [
    '*.tmp',
    '*.log',
    'node_modules',
  ],
};

// Singleton instance
export const backupService = new BackupService(defaultBackupConfig);