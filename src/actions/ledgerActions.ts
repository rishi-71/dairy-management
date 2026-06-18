"use server";

import prisma from "@/lib/prisma";
import { start } from "repl";

export async function getMonthlyLedger(customerId: number, yearMonth: string) {
    const [year, month] = yearMonth.split('-');

    const lastDay = new Date(Number(year), Number(month), 0).getDate();

    const startDate = `${yearMonth}-01`;
    const endDate = `${yearMonth}-${lastDay}`;

    const dailyLogs = await prisma.dailyLog.findMany({
        where : {
            customerId: customerId,
            dateStr: { gte: startDate, lte: endDate }
        }
    });

    const extraLogs = await prisma.extraItemLog.findMany({
        where: {
            customerId: customerId,
            dateStr: { gte: startDate, lte: endDate }
        }
    });

    return { dailyLogs, extraLogs, lastDay};
}

export async function updateLedgerDay(logs: any[], extras: any[]) {
  // 1. Update Daily Logs (Morning/Evening Qty)
  for (const log of logs) {
    await prisma.dailyLog.update({
      where: { id: log.id },
      data: {
        morningDelivered: log.morningDelivered,
        eveningDelivered: log.eveningDelivered,
        // Price hum change nahi kar rahe, jo us din lock hua tha wahi rahega
      }
    });
  }

  // 2. Update Extra Items
  for (const ext of extras) {
    if (ext.quantity > 0) {
      await prisma.extraItemLog.update({
        where: { id: ext.id },
        data: { quantity: ext.quantity }
      });
    } else {
      // Agar quantity 0 kar di modal mein, toh record delete kar do
      try {
        await prisma.extraItemLog.delete({ where: { id: ext.id } });
      } catch (e) {}
    }
  }

  return { success: true };
}