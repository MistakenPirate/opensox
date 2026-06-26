/**
 * one-off: rename Plan.display names to Pro / Pro+ by duration.
 * run: npx tsx scripts/rename-plan-display-names.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const yearly = await prisma.plan.updateMany({
    where: { durationMonths: 12 },
    data: { name: "Pro" },
  });

  const fourYear = await prisma.plan.updateMany({
    where: { durationMonths: 48 },
    data: { name: "Pro+" },
  });

  console.log(`updated ${yearly.count} yearly plan(s) → Pro`);
  console.log(`updated ${fourYear.count} 4-year plan(s) → Pro+`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
