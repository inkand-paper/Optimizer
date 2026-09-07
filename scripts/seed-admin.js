const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('password123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'admin@nexpulse.dev' },
    update: {
      passwordHash: hash,
      emailVerified: new Date(),
      role: 'ADMIN',
    },
    create: {
      email: 'admin@nexpulse.dev',
      name: 'Admin User',
      passwordHash: hash,
      emailVerified: new Date(),
      role: 'ADMIN',
    },
  });
  console.log('SUCCESS: Admin user created/updated:', user.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
