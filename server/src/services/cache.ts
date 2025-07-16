import Redis from 'redis';
import { createRedisClient } from '../config/database';

export class CacheService {
  private client: Redis.RedisClientType;
  private defaultTTL = 3600; // 1 hour

  constructor() {
    this.client = createRedisClient();
  }

  async initialize() {
    await this.client.connect();
    console.log('✅ Cache service initialized');
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      await this.client.setEx(key, ttl || this.defaultTTL, serialized);
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  }

  async flush(): Promise<void> {
    try {
      await this.client.flushAll();
    } catch (error) {
      console.error('Cache flush error:', error);
    }
  }

  async keys(pattern: string): Promise<string[]> {
    try {
      return await this.client.keys(pattern);
    } catch (error) {
      console.error('Cache keys error:', error);
      return [];
    }
  }

  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    try {
      const values = await this.client.mGet(keys);
      return values.map(value => value ? JSON.parse(value) : null);
    } catch (error) {
      console.error('Cache mget error:', error);
      return keys.map(() => null);
    }
  }

  async mset(keyValuePairs: Record<string, any>, ttl?: number): Promise<void> {
    try {
      const pipeline = this.client.multi();
      
      for (const [key, value] of Object.entries(keyValuePairs)) {
        const serialized = JSON.stringify(value);
        pipeline.setEx(key, ttl || this.defaultTTL, serialized);
      }
      
      await pipeline.exec();
    } catch (error) {
      console.error('Cache mset error:', error);
    }
  }

  async increment(key: string, amount: number = 1): Promise<number> {
    try {
      return await this.client.incrBy(key, amount);
    } catch (error) {
      console.error('Cache increment error:', error);
      return 0;
    }
  }

  async expire(key: string, ttl: number): Promise<void> {
    try {
      await this.client.expire(key, ttl);
    } catch (error) {
      console.error('Cache expire error:', error);
    }
  }

  async ttl(key: string): Promise<number> {
    try {
      return await this.client.ttl(key);
    } catch (error) {
      console.error('Cache ttl error:', error);
      return -1;
    }
  }

  // Specialized methods for common use cases
  async cacheWithFallback<T>(
    key: string,
    fallbackFn: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    try {
      // Try to get from cache first
      const cached = await this.get<T>(key);
      if (cached !== null) {
        return cached;
      }

      // If not in cache, call fallback function
      const result = await fallbackFn();
      
      // Cache the result
      await this.set(key, result, ttl);
      
      return result;
    } catch (error) {
      console.error('Cache with fallback error:', error);
      // If caching fails, still return the result from fallback
      return await fallbackFn();
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await this.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
    } catch (error) {
      console.error('Cache invalidate pattern error:', error);
    }
  }

  // Session management
  async setSession(sessionId: string, data: any, ttl: number = 3600): Promise<void> {
    await this.set(`session:${sessionId}`, data, ttl);
  }

  async getSession<T>(sessionId: string): Promise<T | null> {
    return await this.get<T>(`session:${sessionId}`);
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.del(`session:${sessionId}`);
  }

  // Rate limiting
  async rateLimit(key: string, limit: number, windowMs: number): Promise<{ allowed: boolean; remaining: number }> {
    try {
      const current = await this.increment(`rate:${key}`, 1);
      
      if (current === 1) {
        // First request in window, set expiry
        await this.expire(`rate:${key}`, Math.ceil(windowMs / 1000));
      }
      
      const remaining = Math.max(0, limit - current);
      const allowed = current <= limit;
      
      return { allowed, remaining };
    } catch (error) {
      console.error('Rate limit error:', error);
      return { allowed: true, remaining: limit };
    }
  }

  // Pub/Sub for real-time features
  async publish(channel: string, message: any): Promise<void> {
    try {
      await this.client.publish(channel, JSON.stringify(message));
    } catch (error) {
      console.error('Cache publish error:', error);
    }
  }

  async subscribe(channel: string, callback: (message: any) => void): Promise<void> {
    try {
      const subscriber = this.client.duplicate();
      await subscriber.connect();
      
      await subscriber.subscribe(channel, (message) => {
        try {
          const parsed = JSON.parse(message);
          callback(parsed);
        } catch (error) {
          console.error('Cache subscribe parse error:', error);
        }
      });
    } catch (error) {
      console.error('Cache subscribe error:', error);
    }
  }

  async close(): Promise<void> {
    try {
      await this.client.quit();
      console.log('✅ Cache service closed');
    } catch (error) {
      console.error('Cache close error:', error);
    }
  }
}