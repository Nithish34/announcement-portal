import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  const email = 'admin@eduspine.com';
  const password = 'Admin@1234';
  
  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) {
    console.log('Admin not found!');
    return;
  }
  
  const valid = await bcrypt.compare(password, admin.password);
  console.log('Password valid?', valid);
}
main().catch(console.error).finally(() => prisma.$disconnect());
