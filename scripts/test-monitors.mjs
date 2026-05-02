import { performCheck } from '../lib/monitoring.js';
import { prisma } from '../lib/prisma.js';

async function test() {
  console.log("🚀 Starting Monitor Infrastructure Test...");
  const monitors = await prisma.monitor.findMany();
  
  if (monitors.length === 0) {
    console.log("⚠️ No monitors found in database. Create one in the dashboard first.");
    return;
  }

  console.log(`🔍 Found ${monitors.length} monitors. Testing...`);
  
  for (const m of monitors) {
    process.stdout.write(`   • Checking ${m.name} (${m.url}) `);
    const res = await performCheck(m.id, m.url);
    if (res.status === 'UP') {
      console.log("✅ UP");
    } else {
      console.log(`❌ DOWN (${res.message})`);
    }
  }
  
  console.log("\n✨ Test completed.");
}

test().catch(console.error).finally(() => {
  prisma.$disconnect();
  process.exit(0);
});
