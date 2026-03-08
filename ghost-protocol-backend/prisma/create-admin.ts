/**
 * create-admin.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * Bootstraps the first admin account in the dedicated Admin table.
 * Safe to re-run — performs an upsert (updates password if admin already exists).
 *
 * Run with:
 *   npx tsx prisma/create-admin.ts
 * ──────────────────────────────────────────────────────────────────────────────
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

const ADMIN_EMAIL = 'admin@eduspine.com';
const ADMIN_PASSWORD = 'Admin@1234';
const ADMIN_NAME = 'Super Admin';

async function main() {
    console.log('🔧 Bootstrapping Admin account...\n');

    const hash = await bcrypt.hash(ADMIN_PASSWORD, 12);

    const existing = await prisma.admin.findUnique({ where: { email: ADMIN_EMAIL } });

    if (existing) {
        // Update password in case it changed
        await prisma.admin.update({
            where: { email: ADMIN_EMAIL },
            data: { password: hash, name: ADMIN_NAME },
        });
        console.log(`✔ Updated existing admin "${ADMIN_EMAIL}"`);
    } else {
        const admin = await prisma.admin.create({
            data: { email: ADMIN_EMAIL, password: hash, name: ADMIN_NAME },
            select: { id: true, email: true, name: true },
        });
        console.log(`✔ Created admin "${admin.email}" (id: ${admin.id})`);
    }

    console.log('\n✅ Done! Admin credentials:');
    console.log(`   Email   : ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log(`\n   Login at: http://localhost:3001/login\n`);
}

main()
    .catch(e => { console.error('❌ Error:', e.message); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); await pool.end(); });
