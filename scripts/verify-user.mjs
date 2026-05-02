import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const email = "tabir8431@gmail.com";
  await prisma.user.update({
    where: { email },
    data: { emailVerified: new Date() }
  });
  console.log(`Verified ${email}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
