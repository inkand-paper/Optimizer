import { prisma } from "../lib/prisma";
import { hashPassword } from "../lib/auth";

async function main() {
  const pass = await hashPassword("password123");
  const user = await prisma.user.upsert({
    where: { email: "admin@nexpulse.dev" },
    update: { passwordHash: pass, emailVerified: new Date(), role: "ADMIN" },
    create: {
      email: "admin@nexpulse.dev",
      name: "Admin User",
      passwordHash: pass,
      emailVerified: new Date(),
      role: "ADMIN",
    },
  });
  console.log("Admin user ready:", user.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
