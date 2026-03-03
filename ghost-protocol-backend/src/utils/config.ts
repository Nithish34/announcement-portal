import { prisma } from '../services/prisma.service';

/**
 * Fetches a single SystemConfig value by key.
 * Throws if the key does not exist.
 */
export async function getConfig(key: string): Promise<string> {
    const row = await prisma.systemConfig.findUnique({ where: { key } });
    if (!row) throw new Error(`Config key "${key}" not found`);
    return row.value;
}

/**
 * Fetches a SystemConfig value and coerces it to a number.
 */
export async function getConfigNumber(key: string): Promise<number> {
    return Number(await getConfig(key));
}

/**
 * Fetches a SystemConfig value and coerces it to a boolean.
 * Returns true only when the stored string is exactly "true".
 */
export async function getConfigBool(key: string): Promise<boolean> {
    return (await getConfig(key)) === 'true';
}
