const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔓 Unlocking all existing accounts...');
  
  const result = await prisma.user.updateMany({
    where: {
      emailVerified: false
    },
    data: {
      emailVerified: true
    }
  });

  console.log(`✅ Success! ${result.count} accounts have been auto-verified.`);
}

main()
  .catch(e => {
    console.error('❌ Error unlocking accounts:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
