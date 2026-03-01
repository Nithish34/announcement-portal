import Redis from 'ioredis';

/** Raw options — used directly by BullMQ (avoids the bundled-ioredis type conflict) */
export const redisConnectionOptions = {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: null as null, // required by BullMQ
};

/** Singleton ioredis client — used for direct cache operations */
let client: Redis | null = null;

export function getRedisClient(): Redis {
    if (!client) {
        client = new Redis(redisConnectionOptions);
        client.on('connect', () => console.log('✅ Redis connected'));
        client.on('error', (err) => console.error('❌ Redis error:', err));
    }
    return client;
}

/** Cache a value with optional TTL in seconds (default 5 min) */
export async function cacheSet(key: string, value: unknown, ttlSeconds = 300): Promise<void> {
    await getRedisClient().set(key, JSON.stringify(value), 'EX', ttlSeconds);
}

/** Retrieve a cached value, or null if not found */
export async function cacheGet<T>(key: string): Promise<T | null> {
    const data = await getRedisClient().get(key);
    return data ? (JSON.parse(data) as T) : null;
}

/** Delete a cached key */
export async function cacheDel(key: string): Promise<void> {
    await getRedisClient().del(key);
}
