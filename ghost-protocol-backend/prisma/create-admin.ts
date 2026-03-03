import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

async function main() {
    console.log('🔧 Bootstrapping admin user...\n');

    // Step 1: Ensure an "Admin" team exists
    let team = await prisma.team.findFirst({ where: { name: 'Admin' } });
    if (!team) {
        team = await prisma.team.create({ data: { name: 'Admin' } });
        console.log(`✔ Created team: Admin (id: ${team.id})`);
    } else {
        console.log(`✔ Using existing team: Admin (id: ${team.id})`);
    }

    // Step 2: Create the admin user (upsert so it's safe to re-run)
    const email = 'admin@eduspine.com';
    const plainPassword = 'Admin@1234';
    const passwordHash = await bcrypt.hash(plainPassword, 12);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        // Update password and role in case they changed
        await prisma.user.update({
            where: { email },
            data: { password: passwordHash, role: 'ADMIN' },
        });
        console.log(`✔ Updated existing user "${email}" — role set to ADMIN`);
    } else {
        await prisma.user.create({
            data: {
                email,
                password: passwordHash,
                role: 'ADMIN',
                teamId: team.id,
            },
        });
        console.log(`✔ Created user "${email}" with role ADMIN`);
    }

    console.log('\n✅ Done! Admin credentials:');
    console.log(`   Email   : ${email}`);
    console.log(`   Password: ${plainPassword}`);
    console.log(`\n   Login at: http://localhost:3001/login`);
}

main()
    .catch(e => { console.error('❌ Error:', e.message); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); pool.end(); });
