import { prisma } from './src/services/prisma.service';
import bcrypt from 'bcryptjs';

async function main() {
    console.log("Creating some users without team...");
    for (let i = 0; i < 5; i++) {
        await prisma.user.create({
            data: {
                email: `testuser${i}@test.com`,
                password: await bcrypt.hash('password', 10),
                teamId: '' // wait, teamId is a foreign key?
            }
        });
    }
}
main().catch(console.error).finally(() => prisma.$disconnect());
