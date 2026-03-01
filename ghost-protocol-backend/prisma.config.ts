// prisma.config.ts — Prisma v7+ requires connection URLs here instead of schema.prisma
// The Prisma CLI (migrate, generate, studio) reads this file for the DB connection.
import { defineConfig } from '@prisma/config';
import { config } from 'dotenv';
import { resolve } from 'path';

// Explicitly load .env from the project root
config({ path: resolve(__dirname, '.env') });

if (!process.env.DATABASE_URL) {
    throw new Error(
        '\n\n❌  DATABASE_URL is not set.\n' +
        '    Copy .env.example → .env and fill in your PostgreSQL connection string.\n' +
        '    Example: DATABASE_URL="postgresql://user:password@localhost:5432/ghost_protocol"\n'
    );
}

export default defineConfig({
    datasource: {
        url: process.env.DATABASE_URL,
    },
});
