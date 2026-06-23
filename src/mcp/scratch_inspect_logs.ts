import dotenv from "dotenv";
dotenv.config();

async function main() {
  const { default: prisma } = await import("@/lib/prisma");
  try {
    const dailyLogs = await prisma.dailyLog.findMany({
      where: { customerId: 1 },
      orderBy: { dateStr: "asc" }
    });
    const extraLogs = await prisma.extraItemLog.findMany({
      where: { customerId: 1 },
      orderBy: { dateStr: "asc" }
    });
    console.log("=== DAILY LOGS ===");
    console.dir(dailyLogs, { depth: null });
    console.log("=== EXTRA LOGS ===");
    console.dir(extraLogs, { depth: null });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
