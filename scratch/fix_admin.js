const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("🛠️ Starting Admin Promotion...");
  try {
    const result = await prisma.user.updateMany({
      data: {
        role: 'ADMIN',
        plan: 'BUSINESS'
      }
    });
    console.log(`✅ Success! Updated ${result.count} users to ADMIN status.`);
  } catch (err) {
    console.error("❌ Database Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
