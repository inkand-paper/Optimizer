import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2] || process.env.ADMIN_EMAIL;
  
  if (!email) {
    console.error("❌ Error: Please provide an email address as an argument or set ADMIN_EMAIL in .env");
    console.log("Usage: node scripts/verify-user.mjs user@example.com");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  
  if (!user) {
    console.error(`❌ Error: User with email ${email} not found.`);
    process.exit(1);
  }

  await prisma.user.update({
    where: { email },
    data: { emailVerified: new Date() }
  });
  
  console.log(`✅ Success: Verified ${email}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
