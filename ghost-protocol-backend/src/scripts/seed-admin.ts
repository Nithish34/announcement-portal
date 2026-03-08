/**
 * seed-admin.ts
 * ---------------------------------------------------------------------------
 * One-time script to create the very first Admin account in the Admin table.
 *
 * Run with:
 *   npx tsx src/scripts/seed-admin.ts
 *
 * Override defaults with environment variables:
 *   SEED_ADMIN_EMAIL    (default: admin@ghostprotocol.dev)
 *   SEED_ADMIN_PASSWORD (default: ChangeMe123!)
 *   SEED_ADMIN_NAME     (default: Super Admin)
 * ---------------------------------------------------------------------------
 */

// Must be loaded BEFORE the prisma service so DATABASE_URL is available
import 'dotenv/config';

// Use the project's Prisma singleton (includes the pg adapter required by Prisma v7)
import { prisma } from '../services/prisma.service';
import bcrypt from 'bcryptjs';

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'admin@ghostprotocol.dev';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMe123!';
const ADMIN_NAME = process.env.SEED_ADMIN_NAME ?? 'Super Admin';

async function main() {
    const existing = await prisma.admin.findUnique({ where: { email: ADMIN_EMAIL } });

    if (existing) {
        console.log(`⚠️  Admin "${ADMIN_EMAIL}" already exists — skipping.`);
        return;
    }

    const hash = await bcrypt.hash(ADMIN_PASSWORD, 12);
    const admin = await prisma.admin.create({
        data: { email: ADMIN_EMAIL, password: hash, name: ADMIN_NAME },
        select: { id: true, email: true, name: true, createdAt: true },
    });

    console.log(`\n✅  Bootstrap admin created:`);
    console.log(`    ID:    ${admin.id}`);
    console.log(`    Email: ${admin.email}`);
    console.log(`    Name:  ${admin.name}`);
    console.log(`\n⚡  Login at the admin dashboard with:`);
    console.log(`    Email:    ${ADMIN_EMAIL}`);
    console.log(`    Password: ${ADMIN_PASSWORD}`);
    console.log(`\n   ⚠️  CHANGE THE PASSWORD after first login!\n`);
}

main()
    .catch(e => { console.error('Seed failed:', e); process.exit(1); })
    .finally(() => prisma.$disconnect());
