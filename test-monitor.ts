import { performCheck } from './lib/monitoring';
import { prisma } from './lib/prisma';

async function test() {
  const monitors = await prisma.monitor.findMany();
  console.log("Found monitors:", monitors.length);
  for (const m of monitors) {
    console.log("Checking", m.url);
    const res = await performCheck(m.id, m.url);
    console.log("Result:", res);
  }
}

test().catch(console.error).finally(() => process.exit(0));
