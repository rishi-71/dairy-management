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

export async function updateLedgerDay(customerId: number, dateStr: string, logs: any[], extras: any[]) {
  // 1. Update Daily Logs
  for (const log of logs) {
    await prisma.dailyLog.update({
      where: { id: log.id },
      data: { morningDelivered: log.morningDelivered, eveningDelivered: log.eveningDelivered }
    });
  }

  // 2. Update Extra Items
  for (const ext of extras) {
    if (ext.quantity > 0) {
      await prisma.extraItemLog.update({ where: { id: ext.id }, data: { quantity: ext.quantity } });
    } else {
      try { await prisma.extraItemLog.delete({ where: { id: ext.id } }); } catch (e) {}
    }
  }

  // ==========================================
  // 3. 🚀 THE MAGIC: AUTO-SYNC MONTHLY BILL
  // ==========================================
  const monthYear = dateStr.substring(0, 7); // e.g., "2026-06-17" se "2026-06" nikalega
  
  const existingBill = await prisma.monthlyBill.findUnique({
    where: { customerId_monthYear: { customerId, monthYear } }
  });

  // Agar us mahine ka bill lock ho chuka hai, toh usko naye data ke hisaab se update kar do
  if (existingBill) {
    const startDate = `${monthYear}-01`;
    const lastDay = new Date(Number(monthYear.split('-')[0]), Number(monthYear.split('-')[1]), 0).getDate();
    const endDate = `${monthYear}-${lastDay}`;

    const monthLogs = await prisma.dailyLog.findMany({
      where: { customerId, dateStr: { gte: startDate, lte: endDate } }
    });
    
    const monthExtras = await prisma.extraItemLog.findMany({
      where: { customerId, dateStr: { gte: startDate, lte: endDate } }
    });

    let tMorn = 0, tEve = 0, tMilkAmt = 0, tExtraAmt = 0;
    
    monthLogs.forEach((l) => {
      tMorn += l.morningDelivered;
      tEve += l.eveningDelivered;
      tMilkAmt += (l.morningDelivered + l.eveningDelivered) * l.price;
    });
    
    monthExtras.forEach((e) => {
      tExtraAmt += e.quantity * e.price;
    });

    await prisma.monthlyBill.update({
      where: { id: existingBill.id },
      data: {
        totalMorningLtrs: tMorn,
        totalEveningLtrs: tEve,
        milkTotalAmount: tMilkAmt,
        extraItemsAmount: tExtraAmt,
        grandTotal: tMilkAmt + tExtraAmt + existingBill.previousDue // Purana due waisa hi rakhenge
      }
    });
  }

  return { success: true };
}