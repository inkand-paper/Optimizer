const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("🔐 [SECURITY] Re-locking Database Roles...");
  try {
    // 1. Demote everyone first
    await prisma.user.updateMany({
      data: { role: 'DEVELOPER', plan: 'FREE' }
    });

    // 2. Promote the Master Admin (tabir)
    await prisma.user.update({
      where: { email: 'tabir8431@gmail.com' },
      data: { role: 'ADMIN', plan: 'BUSINESS' }
    });

    // 3. Promote the secondary Admin (tahsinabir103) if needed
    await prisma.user.update({
      where: { email: 'tahsinabir103@gmail.com' },
      data: { role: 'ADMIN', plan: 'BUSINESS' }
    });

    console.log("✅ Database secured. tabir and tahsinabir103 are ADMINS. Others are DEVELOPERS.");
  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
