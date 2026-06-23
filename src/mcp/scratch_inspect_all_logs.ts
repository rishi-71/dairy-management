import dotenv from "dotenv";
dotenv.config();

async function main() {
  const { default: prisma } = await import("@/lib/prisma");
  try {
    const allDailyLogs = await prisma.dailyLog.findMany();
    const allExtraLogs = await prisma.extraItemLog.findMany();
    console.log("Total Daily Logs:", allDailyLogs.length);
    console.log("Total Extra Logs:", allExtraLogs.length);

    console.log("=== ALL DAILY LOGS IN DB ===");
    allDailyLogs.forEach(log => {
      console.log(`ID: ${log.id}, Date: ${log.dateStr}, CustID: ${log.customerId}, Name: ${log.customerName}, Item: ${log.itemName}, M: ${log.morningDelivered}, E: ${log.eveningDelivered}`);
    });

    console.log("=== ALL EXTRA LOGS IN DB ===");
    allExtraLogs.forEach(log => {
      console.log(`ID: ${log.id}, Date: ${log.dateStr}, CustID: ${log.customerId}, Name: ${log.customerName}, Item: ${log.itemName}, Qty: ${log.quantity}`);
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
