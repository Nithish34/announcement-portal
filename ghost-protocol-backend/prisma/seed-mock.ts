/**
 * Mock Data Seed — Ghost Protocol Hackathon Portal
 * Creates 5 teams with 2–3 participants each (15 users total).
 *
 * Login format for the participant portal (localhost:3000):
 *   "Team ID" field → enter the user's EMAIL
 *   Password        → Test@1234  (for all participants)
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

const PARTICIPANT_PASSWORD = 'Test@1234';

const TEAMS = [
    { name: 'Ghost-Alpha', phase1Pass: true, phase2Pass: true },
    { name: 'Ghost-Beta', phase1Pass: true, phase2Pass: false },
    { name: 'Ghost-Gamma', phase1Pass: true, phase2Pass: false },
    { name: 'Ghost-Delta', phase1Pass: false, phase2Pass: false },
    { name: 'Ghost-Epsilon', phase1Pass: false, phase2Pass: false },
];

// email · result (null = not yet evaluated)
const USERS: Record<string, { email: string; result: 'WINNER' | 'LOSER' | null }[]> = {
    'Ghost-Alpha': [
        { email: 'alpha1@eduspine.com', result: 'WINNER' },
        { email: 'alpha2@eduspine.com', result: 'WINNER' },
        { email: 'alpha3@eduspine.com', result: 'LOSER' },
    ],
    'Ghost-Beta': [
        { email: 'beta1@eduspine.com', result: 'LOSER' },
        { email: 'beta2@eduspine.com', result: 'LOSER' },
    ],
    'Ghost-Gamma': [
        { email: 'gamma1@eduspine.com', result: null },
        { email: 'gamma2@eduspine.com', result: null },
    ],
    'Ghost-Delta': [
        { email: 'delta1@eduspine.com', result: null },
        { email: 'delta2@eduspine.com', result: null },
    ],
    'Ghost-Epsilon': [
        { email: 'epsilon1@eduspine.com', result: null },
        { email: 'epsilon2@eduspine.com', result: null },
        { email: 'epsilon3@eduspine.com', result: null },
    ],
};

async function main() {
    const passwordHash = await bcrypt.hash(PARTICIPANT_PASSWORD, 12);

    console.log('\n🌱  Seeding mock participant data...\n');
    console.log(`    Participant password (all): ${PARTICIPANT_PASSWORD}\n`);

    for (const teamDef of TEAMS) {
        // Upsert team
        const team = await prisma.team.upsert({
            where: { name: teamDef.name },
            update: { phase1Pass: teamDef.phase1Pass, phase2Pass: teamDef.phase2Pass },
            create: { name: teamDef.name, phase1Pass: teamDef.phase1Pass, phase2Pass: teamDef.phase2Pass },
        });

        console.log(`  🏠 Team: ${team.name} (id: ${team.id})`);
        console.log(`     phase1Pass=${team.phase1Pass}  phase2Pass=${team.phase2Pass}`);

        const members = USERS[teamDef.name] ?? [];

        for (const u of members) {
            const existing = await prisma.user.findUnique({ where: { email: u.email } });

            if (existing) {
                await prisma.user.update({
                    where: { email: u.email },
                    data: { password: passwordHash, result: u.result, teamId: team.id },
                });
                console.log(`     ♻  Updated  ${u.email}  (result: ${u.result ?? 'null'})`);
            } else {
                await prisma.user.create({
                    data: {
                        email: u.email,
                        password: passwordHash,
                        role: 'PARTICIPANT',
                        result: u.result,
                        teamId: team.id,
                    },
                });
                console.log(`     ✔  Created  ${u.email}  (result: ${u.result ?? 'null'})`);
            }
        }
        console.log();
    }

    // ── Print credentials table ─────────────────────────────────────────────────
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('  PARTICIPANT LOGIN CREDENTIALS  (use at localhost:3000/login)');
    console.log('  "Team ID" field = EMAIL · Password = Test@1234');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('  EMAIL                      TEAM            RESULT');
    console.log('───────────────────────────────────────────────────────────────');

    for (const teamDef of TEAMS) {
        for (const u of USERS[teamDef.name] ?? []) {
            const resultLabel = u.result ?? 'PENDING';
            console.log(`  ${u.email.padEnd(26)} ${teamDef.name.padEnd(15)} ${resultLabel}`);
        }
    }
    console.log('═══════════════════════════════════════════════════════════════\n');
    console.log('✅  Mock data seed complete!\n');
}

main()
    .catch(e => { console.error('❌ Error:', e.message); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); pool.end(); });
