import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

const defaultConfigs = [
    { key: 'phase1_timer_seconds', value: '10' },
    { key: 'phase2_timer_seconds', value: '5' },
    { key: 'max_slots', value: '20' },
    { key: 'current_phase', value: '1' },
    { key: 'registration_open', value: 'true' },
    { key: 'results_locked', value: 'true' },
    { key: 'phase2_score_threshold', value: '95' },
    { key: 'announcement_interval', value: '30' },
];

async function main(): Promise<void> {
    console.log('🌱 Seeding SystemConfig defaults…');

    for (const cfg of defaultConfigs) {
        await prisma.systemConfig.upsert({
            where: { key: cfg.key },
            update: {},               // do NOT overwrite if already customised
            create: cfg,
        });
        console.log(`   ✔ ${cfg.key} = ${cfg.value}`);
    }

    console.log('✅ Seed complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        pool.end();
    });
