import { EventEmitter } from 'events';
import { logger } from './logger';

export interface Job {
  id: string;
  type: string;
  data: any;
  priority: number;
  attempts: number;
  maxAttempts: number;
  delay: number;
  createdAt: Date;
  processedAt?: Date;
  completedAt?: Date;
  failedAt?: Date;
  error?: string;
  progress?: number;
}

export interface JobProcessor {
  (job: Job): Promise<any>;
}

export interface QueueOptions {
  concurrency?: number;
  maxRetries?: number;
  retryDelay?: number;
  defaultJobTimeout?: number;
  cleanupInterval?: number;
}

export class QueueService extends EventEmitter {
  private jobs: Map<string, Job> = new Map();
  private processors: Map<string, JobProcessor> = new Map();
  private processing: Set<string> = new Set();
  private options: Required<QueueOptions>;
  private cleanupTimer?: NodeJS.Timer;

  constructor(options: QueueOptions = {}) {
    super();
    
    this.options = {
      concurrency: options.concurrency || 5,
      maxRetries: options.maxRetries || 3,
      retryDelay: options.retryDelay || 5000,
      defaultJobTimeout: options.defaultJobTimeout || 30000,
      cleanupInterval: options.cleanupInterval || 60000,
    };

    this.startCleanup();
  }

  // Register a job processor
  process(jobType: string, processor: JobProcessor) {
    this.processors.set(jobType, processor);
    logger.info(`Registered processor for job type: ${jobType}`);
  }

  // Add a job to the queue
  async add(
    type: string,
    data: any,
    options: {
      priority?: number;
      delay?: number;
      maxAttempts?: number;
    } = {}
  ): Promise<string> {
    const job: Job = {
      id: `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      priority: options.priority || 0,
      attempts: 0,
      maxAttempts: options.maxAttempts || this.options.maxRetries,
      delay: options.delay || 0,
      createdAt: new Date(),
    };

    this.jobs.set(job.id, job);
    
    logger.info(`Job added to queue: ${job.id} (type: ${type})`);
    
    // Process immediately if no delay
    if (job.delay === 0) {
      setImmediate(() => this.processNextJob());
    } else {
      // Schedule for later processing
      setTimeout(() => this.processNextJob(), job.delay);
    }

    return job.id;
  }

  // Get job by ID
  getJob(jobId: string): Job | undefined {
    return this.jobs.get(jobId);
  }

  // Get jobs by status
  getJobs(filter?: {
    type?: string;
    status?: 'waiting' | 'processing' | 'completed' | 'failed';
    limit?: number;
  }): Job[] {
    const jobs = Array.from(this.jobs.values());
    
    let filtered = jobs;
    
    if (filter?.type) {
      filtered = filtered.filter(job => job.type === filter.type);
    }
    
    if (filter?.status) {
      filtered = filtered.filter(job => {
        switch (filter.status) {
          case 'waiting':
            return !job.processedAt && !job.completedAt && !job.failedAt;
          case 'processing':
            return job.processedAt && !job.completedAt && !job.failedAt;
          case 'completed':
            return !!job.completedAt;
          case 'failed':
            return !!job.failedAt;
          default:
            return true;
        }
      });
    }
    
    // Sort by priority (higher first) then by creation time
    filtered.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      return a.createdAt.getTime() - b.createdAt.getTime();
    });
    
    if (filter?.limit) {
      filtered = filtered.slice(0, filter.limit);
    }
    
    return filtered;
  }

  // Process the next job in the queue
  private async processNextJob() {
    if (this.processing.size >= this.options.concurrency) {
      return; // At max concurrency
    }

    const waitingJobs = this.getJobs({ status: 'waiting', limit: 1 });
    if (waitingJobs.length === 0) {
      return; // No jobs to process
    }

    const job = waitingJobs[0];
    await this.processJob(job);
  }

  // Process a specific job
  private async processJob(job: Job) {
    if (this.processing.has(job.id)) {
      return; // Already processing
    }

    const processor = this.processors.get(job.type);
    if (!processor) {
      logger.error(`No processor found for job type: ${job.type}`, undefined, { jobId: job.id });
      return;
    }

    this.processing.add(job.id);
    job.processedAt = new Date();
    job.attempts++;

    logger.info(`Processing job: ${job.id} (attempt ${job.attempts})`);
    
    try {
      // Set timeout for job processing
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Job timeout')), this.options.defaultJobTimeout);
      });

      const result = await Promise.race([
        processor(job),
        timeoutPromise,
      ]);

      job.completedAt = new Date();
      job.progress = 100;
      
      logger.info(`Job completed: ${job.id}`);
      this.emit('job:completed', job, result);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      job.error = errorMessage;
      
      logger.error(`Job failed: ${job.id}`, error as Error, { 
        jobId: job.id, 
        attempts: job.attempts,
        maxAttempts: job.maxAttempts 
      });

      if (job.attempts < job.maxAttempts) {
        // Retry the job
        logger.info(`Retrying job: ${job.id} (attempt ${job.attempts + 1})`);
        setTimeout(() => {
          job.processedAt = undefined;
          this.processNextJob();
        }, this.options.retryDelay);
      } else {
        // Mark as failed
        job.failedAt = new Date();
        logger.error(`Job permanently failed: ${job.id}`);
        this.emit('job:failed', job, error);
      }
    } finally {
      this.processing.delete(job.id);
      
      // Process next job
      setImmediate(() => this.processNextJob());
    }
  }

  // Update job progress
  updateProgress(jobId: string, progress: number) {
    const job = this.jobs.get(jobId);
    if (job) {
      job.progress = Math.max(0, Math.min(100, progress));
      this.emit('job:progress', job);
    }
  }

  // Cancel a job
  cancel(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (!job) {
      return false;
    }

    if (job.completedAt || job.failedAt) {
      return false; // Already finished
    }

    if (this.processing.has(jobId)) {
      // Job is currently processing, mark for cancellation
      job.error = 'Cancelled';
      job.failedAt = new Date();
      this.emit('job:cancelled', job);
      return true;
    }

    // Job is waiting, remove it
    this.jobs.delete(jobId);
    this.emit('job:cancelled', job);
    return true;
  }

  // Get queue statistics
  getStats() {
    const jobs = Array.from(this.jobs.values());
    
    return {
      total: jobs.length,
      waiting: jobs.filter(job => !job.processedAt && !job.completedAt && !job.failedAt).length,
      processing: this.processing.size,
      completed: jobs.filter(job => job.completedAt).length,
      failed: jobs.filter(job => job.failedAt).length,
      processors: this.processors.size,
    };
  }

  // Clean up old jobs
  private startCleanup() {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.options.cleanupInterval);
  }

  private cleanup() {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
    let cleaned = 0;

    for (const [jobId, job] of this.jobs.entries()) {
      if ((job.completedAt || job.failedAt) && 
          (job.completedAt || job.failedAt)! < cutoff) {
        this.jobs.delete(jobId);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.info(`Cleaned up ${cleaned} old jobs`);
    }
  }

  // Pause job processing
  pause() {
    this.emit('queue:paused');
    logger.info('Queue paused');
  }

  // Resume job processing
  resume() {
    this.emit('queue:resumed');
    logger.info('Queue resumed');
    
    // Process any waiting jobs
    for (let i = 0; i < this.options.concurrency; i++) {
      setImmediate(() => this.processNextJob());
    }
  }

  // Stop the queue
  async stop() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    // Wait for all processing jobs to complete
    while (this.processing.size > 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    logger.info('Queue stopped');
  }
}

// Singleton instance
export const queue = new QueueService();

// Common job types
export const JobTypes = {
  SEND_EMAIL: 'send-email',
  PROCESS_LEAD: 'process-lead',
  GENERATE_REPORT: 'generate-report',
  SYNC_DATA: 'sync-data',
  BACKUP_DATABASE: 'backup-database',
  CLEANUP_FILES: 'cleanup-files',
  SEND_NOTIFICATION: 'send-notification',
  PROCESS_PAYMENT: 'process-payment',
  GENERATE_INVOICE: 'generate-invoice',
  UPDATE_ANALYTICS: 'update-analytics',
} as const;

// Job processors
export const setupJobProcessors = () => {
  // Email processor
  queue.process(JobTypes.SEND_EMAIL, async (job) => {
    const { to, subject, body } = job.data;
    logger.info(`Sending email to ${to}: ${subject}`);
    
    // Simulate email sending
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return { sent: true, messageId: `msg-${Date.now()}` };
  });

  // Lead processing
  queue.process(JobTypes.PROCESS_LEAD, async (job) => {
    const { leadId, source } = job.data;
    logger.info(`Processing lead ${leadId} from ${source}`);
    
    // Simulate lead processing
    queue.updateProgress(job.id, 25);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    queue.updateProgress(job.id, 50);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    queue.updateProgress(job.id, 75);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    queue.updateProgress(job.id, 100);
    
    return { processed: true, leadId, score: Math.random() * 100 };
  });

  // Report generation
  queue.process(JobTypes.GENERATE_REPORT, async (job) => {
    const { reportType, filters } = job.data;
    logger.info(`Generating ${reportType} report`);
    
    // Simulate report generation
    for (let i = 0; i <= 100; i += 20) {
      queue.updateProgress(job.id, i);
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    return { 
      reportUrl: `/reports/${reportType}-${Date.now()}.pdf`,
      generatedAt: new Date().toISOString()
    };
  });

  logger.info('Job processors registered');
};