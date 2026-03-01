// Prisma singleton using the pg driver adapter (required in Prisma v7+)
// The PrismaClient no longer reads from schema.prisma datasource url.
// It must receive the connection either via `adapter` or `accelerateUrl`.
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

function createPrismaClient(): PrismaClient {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);
}

// Singleton pattern — prevents multiple connections during ts-node-dev hot-reloads
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma: PrismaClient = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}
