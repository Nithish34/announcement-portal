import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

async function main() {
    // Mark any team named "Admin", "ADMIN", "admin", or "Admins" as the admin team
    const result = await prisma.team.updateMany({
        where: { name: { in: ['Admin', 'ADMIN', 'admin', 'Admins', 'admins'] } },
        data: { isAdminTeam: true },
    });
    console.log(`✔ Marked ${result.count} team(s) as isAdminTeam = true`);

    // Show all teams so you can verify / spot the right name
    const all = await prisma.team.findMany({ select: { name: true, isAdminTeam: true } });
    console.log('\nAll teams:');
    all.forEach(t => console.log(`  ${t.isAdminTeam ? '[ADMIN]' : '[team ]'} ${t.name}`));
}

main()
    .catch(e => { console.error('Error:', e.message); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); await pool.end(); });
