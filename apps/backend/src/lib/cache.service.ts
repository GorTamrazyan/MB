import { redis } from '../config/redis';

export class CacheService {
  async get<T>(key: string): Promise<T | null> {
    const value = await redis.get(key);
    if (!value) return null;
    return JSON.parse(value) as T;
  }

  async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    await redis.setex(key, ttlSeconds, JSON.stringify(value));
  }

  async getOrSet<T>(key: string, ttlSeconds: number, fetcher: () => Promise<T>): Promise<T> {
    try {
      const cached = await this.get<T>(key);
      if (cached !== null) return cached;
      const fresh = await fetcher();
      await this.set(key, fresh, ttlSeconds).catch(() => {});
      return fresh;
    } catch {
      return fetcher();
    }
  }

  async invalidate(key: string): Promise<void> {
    try { await redis.del(key); } catch {}
  }

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      let cursor = '0';
      do {
        const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
        cursor = nextCursor;
        if (keys.length > 0) await redis.del(...keys);
      } while (cursor !== '0');
    } catch {}
  }

  async increment(key: string, amount = 1): Promise<number> {
    try { return await redis.incrby(key, amount); } catch { return 0; }
  }

  async expire(key: string, ttlSeconds: number): Promise<void> {
    try { await redis.expire(key, ttlSeconds); } catch {}
  }
}

export const cacheService = new CacheService();
