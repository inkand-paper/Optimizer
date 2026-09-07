const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const DEFAULT_ZOMBIES = [
  { name: "staging-db-replica-v2", provider: "Supabase", type: "Database Instance", costMonthly: 51, status: "idle" },
  { name: "ebs-volume-vol-08f3", provider: "AWS", type: "Unattached Disk", costMonthly: 38, status: "unattached" },
  { name: "legacy-analytics-logs", provider: "Vercel", type: "Excess Log Storage", costMonthly: 29, status: "stale" },
  { name: "unused-elastic-ip-92", provider: "AWS", type: "Unused IPv4 Address", costMonthly: 18, status: "unattached" },
];

async function main() {
  // Find admin user
  const admin = await prisma.user.findUnique({ where: { email: 'admin@nexpulse.dev' } });
  if (!admin) {
    console.error('Admin user not found. Run seed-admin.js first.');
    return;
  }

  // Seed zombie resources if none exist
  const existing = await prisma.zombieResource.count({ where: { userId: admin.id } });
  if (existing === 0) {
    await prisma.zombieResource.createMany({
      data: DEFAULT_ZOMBIES.map(z => ({ ...z, userId: admin.id })),
    });
    console.log(`Seeded ${DEFAULT_ZOMBIES.length} zombie resources for ${admin.email}`);
  } else {
    console.log(`Zombie resources already exist (${existing} records). Skipping seed.`);
  }

  // Seed a default Autopilot incident if none exist
  const incidentCount = await prisma.autopilotIncident.count({ where: { userId: admin.id } });
  if (incidentCount === 0) {
    await prisma.autopilotIncident.create({
      data: {
        userId: admin.id,
        title: "API Latency Degradation — p95 spike",
        severity: "HIGH",
        status: "OPEN",
        mode: "RECOMMEND",
        targetNode: "/api/products",
        impact: "~18% of user requests experiencing latency spikes exceeding 2s SLA",
        rootCause: "PostgreSQL query regression introduced in deployment #a83f21 causing full table scans on the products index",
        confidence: 89,
        recommendedFix: "Roll back deployment #a83f21 and flush Redis query cache pool to restore baseline query plans",
      },
    });
    console.log('Seeded 1 autopilot incident for', admin.email);
  } else {
    console.log(`Autopilot incidents already exist (${incidentCount} records). Skipping seed.`);
  }

  console.log('Done.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
