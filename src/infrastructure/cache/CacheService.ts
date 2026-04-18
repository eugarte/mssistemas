import Redis from 'ioredis';

export class CacheService {
  private client: Redis;
  private defaultTTL: number;

  constructor() {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    this.defaultTTL = parseInt(process.env.CACHE_TTL || '300', 10); // 5 minutes default
    
    this.client = new Redis(redisUrl, {
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
    });

    this.client.on('error', (err) => {
      console.error('Redis error:', err);
    });
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      const expiration = ttl || this.defaultTTL;
      await this.client.setex(key, expiration, serialized);
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  async deletePattern(pattern: string): Promise<void> {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
    } catch (error) {
      console.error('Cache delete pattern error:', error);
    }
  }

  async flush(): Promise<void> {
    try {
      await this.client.flushdb();
    } catch (error) {
      console.error('Cache flush error:', error);
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

  generateKey(prefix: string, ...parts: string[]): string {
    return `${prefix}:${parts.join(':')}`;
  }

  async disconnect(): Promise<void> {
    await this.client.quit();
  }
}
