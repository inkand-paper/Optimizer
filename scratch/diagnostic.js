const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("🔍 [DIAGNOSTIC] Checking User Database...");
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        plan: true,
        _count: { select: { monitors: true } }
      }
    });
    
    console.table(users);

    const monitors = await prisma.monitor.findMany({
      select: {
        id: true,
        name: true,
        userId: true
      }
    });
    console.log("\n🔍 [DIAGNOSTIC] Checking Monitors...");
    console.table(monitors);

  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
