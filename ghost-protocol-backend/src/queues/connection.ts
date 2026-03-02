/**
 * ⭐ Single BullMQ connection config — spread this into every Queue & Worker.
 *
 * Pattern:  new Queue('name', ...bullConnection)
 *           new Worker('name', handler, ...bullConnection)
 *
 * BullMQ manages its own internal Redis connections from these options.
 * You never call Redis yourself — it's purely BullMQ's engine.
 * On Railway: add a Redis service, copy REDIS_HOST + REDIS_PORT from its
 * variables tab, and paste them into your environment. Done.
 */
export const bullConnection = {
    connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT) || 6379,
        // Only set password when the env var is actually provided
        ...(process.env.REDIS_PASSWORD ? { password: process.env.REDIS_PASSWORD } : {}),
    },
} as const;
