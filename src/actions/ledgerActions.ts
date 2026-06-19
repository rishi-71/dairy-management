// src/actions/ledgerActions.ts
"use server";

import prisma from "@/lib/prisma";

export async function getMonthlyLedger(customerId: number, yearMonth: string) {
  const [year, month] = yearMonth.split('-');
  const lastDay = new Date(Number(year), Number(month), 0).getDate();
  const startDate = `${yearMonth}-01`;
  const endDate = `${yearMonth}-${lastDay}`;

  const dailyLogs = await prisma.dailyLog.findMany({
    where: { customerId: customerId, dateStr: { gte: startDate, lte: endDate } }
  });

  const extraLogs = await prisma.extraItemLog.findMany({
    where: { customerId: customerId, dateStr: { gte: startDate, lte: endDate } }
  });

  // 🚀 NEW: Fetch all active items to show in the Edit Modal dropdown
  const allItems = await prisma.item.findMany({
    where: { isDeleted: false }
  });

  return { dailyLogs, extraLogs, lastDay, allItems };
}

export async function updateLedgerDay(customerId: number, dateStr: string, logs: any[], extras: any[]) {
  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  const customerName = customer?.name || "";

  // Fetch current DB state for this day to detect deletions
  const existingLogs = await prisma.dailyLog.findMany({ where: { customerId, dateStr } });
  const existingExtras = await prisma.extraItemLog.findMany({ where: { customerId, dateStr } });

  // 1. DELETE REMOVED PRIMARY LOGS
  for (const exLog of existingLogs) {
    const stillExists = logs.find(l => l.itemId === exLog.itemId && (l.morningDelivered > 0 || l.eveningDelivered > 0));
    if (!stillExists) await prisma.dailyLog.delete({ where: { id: exLog.id } });
  }

  // 2. DELETE REMOVED EXTRA LOGS
  for (const exExt of existingExtras) {
    const stillExists = extras.find(e => e.itemId === exExt.itemId && e.quantity > 0);
    if (!stillExists) await prisma.extraItemLog.delete({ where: { id: exExt.id } });
  }

  // 3. UPSERT (Update or Create) PRIMARY LOGS
  for (const log of logs) {
    if (log.morningDelivered > 0 || log.eveningDelivered > 0) {
      await prisma.dailyLog.upsert({
        where: { dateStr_customerId_itemId: { dateStr, customerId, itemId: log.itemId } },
        update: { morningDelivered: log.morningDelivered, eveningDelivered: log.eveningDelivered },
        create: {
          dateStr, customerId, itemId: log.itemId,
          customerName, itemName: log.itemName,
          morningDelivered: log.morningDelivered, eveningDelivered: log.eveningDelivered,
          price: log.price
        }
      });
    }
  }

  // 4. UPSERT (Update or Create) EXTRA LOGS
  for (const ext of extras) {
    if (ext.quantity > 0) {
      await prisma.extraItemLog.upsert({
        where: { dateStr_customerId_itemId: { dateStr, customerId, itemId: ext.itemId } },
        update: { quantity: ext.quantity },
        create: {
          dateStr, customerId, itemId: ext.itemId,
          customerName, itemName: ext.itemName,
          quantity: ext.quantity, price: ext.price
        }
      });
    }
  }

  // 5. AUTO-SYNC MONTHLY BILL
  const monthYear = dateStr.substring(0, 7);
  const existingBill = await prisma.monthlyBill.findUnique({ where: { customerId_monthYear: { customerId, monthYear } } });

  if (existingBill) {
    const startDate = `${monthYear}-01`;
    const lastDay = new Date(Number(monthYear.split('-')[0]), Number(monthYear.split('-')[1]), 0).getDate();
    const endDate = `${monthYear}-${lastDay}`;

    const monthLogs = await prisma.dailyLog.findMany({ where: { customerId, dateStr: { gte: startDate, lte: endDate } } });
    const monthExtras = await prisma.extraItemLog.findMany({ where: { customerId, dateStr: { gte: startDate, lte: endDate } } });

    let tMorn = 0, tEve = 0, tMilkAmt = 0, tExtraAmt = 0;
    
    monthLogs.forEach((l) => {
      tMorn += l.morningDelivered; tEve += l.eveningDelivered; tMilkAmt += (l.morningDelivered + l.eveningDelivered) * l.price;
    });
    monthExtras.forEach((e) => { tExtraAmt += e.quantity * e.price; });

    await prisma.monthlyBill.update({
      where: { id: existingBill.id },
      data: {
        totalMorningLtrs: tMorn, totalEveningLtrs: tEve,
        milkTotalAmount: tMilkAmt, extraItemsAmount: tExtraAmt,
        grandTotal: tMilkAmt + tExtraAmt + existingBill.previousDue
      }
    });
  }

  return { success: true };
}