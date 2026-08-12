import Redis from 'ioredis';

const redisUrl = process.env.LOCAL_REDIS_URL || 'redis://localhost:6379';

const client = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 200, 3000);
    return delay;
  },
});

// Graceful shutdown (Node.js runtime only)
if (typeof process !== 'undefined' && typeof process.on === 'function') {
  process.on('SIGTERM', () => client.disconnect());
  process.on('SIGINT', () => client.disconnect());
}

/**
 * Local Redis client wrapping ioredis to match the subset of Upstash Redis
 * methods that Latch uses. This ensures all existing code works unchanged
 * when switching from cloud (Upstash HTTP) to local (ioredis TCP).
 */
export const redis = {
  lpush: async (key: string, ...values: string[]) => {
    await client.lpush(key, ...values);
  },

  rpop: async <T>(key: string): Promise<T | null> => {
    const raw = await client.rpop(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return raw as T;
    }
  },

  get: async (key: string) => {
    return client.get(key);
  },

  set: async (key: string, value: string, opts?: { ex?: number }) => {
    if (opts?.ex) {
      await client.set(key, value, 'EX', opts.ex);
    } else {
      await client.set(key, value);
    }
  },

  ping: async () => {
    return client.ping();
  },

  /**
   * Publish a message to a Redis Pub/Sub channel.
   * Used for instant SSE delivery and tunnel relay in local mode.
   */
  publish: async (channel: string, message: string) => {
    await client.publish(channel, message);
  },

  /**
   * Create a new Redis connection for Pub/Sub subscriptions.
   * Each subscriber needs its own connection because subscribing
   * puts the connection into subscriber mode.
   */
  createSubscriber: () => {
    return new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        const delay = Math.min(times * 200, 3000);
        return delay;
      },
    });
  },

  /**
   * Increment a key by 1, used for rate limiting counters.
   */
  incr: async (key: string) => {
    return client.incr(key);
  },

  /**
   * Set a TTL (expiry) on a key.
   */
  expire: async (key: string, seconds: number) => {
    await client.expire(key, seconds);
  },

  /**
   * Get the TTL remaining on a key.
   */
  ttl: async (key: string) => {
    return client.ttl(key);
  },

  /**
   * Add a member to a Redis Set.
   */
  sadd: async (key: string, member: string) => {
    return client.sadd(key, member);
  },

  /**
   * Remove a member from a Redis Set.
   */
  srem: async (key: string, member: string) => {
    return client.srem(key, member);
  },

  /**
   * Get the number of members in a Redis Set (for connection limiting).
   */
  scard: async (key: string) => {
    return client.scard(key);
  },
};
