// src/actions/logActions.ts
"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function fetchDailyLog(dateStr: string) {
  const allItems = await prisma.item.findMany({ 
    where: { isDeleted: false }, 
    select: { id: true, name: true, price: true, unit: true } 
  });
  
  // Extra items DB se uthana
  const extraLogs = await prisma.extraItemLog.findMany({ 
    where: { dateStr } 
  });
  
  const existingLogs = await prisma.dailyLog.findMany({ 
    where: { dateStr }, 
    include: { customer: true, item: true } 
  });

  if (existingLogs.length > 0) {
    return { type: "EXISTING", data: existingLogs, allItems, extraLogs };
  }

  const defaultSubscriptions = await prisma.subscription.findMany({
    where: { customer: { isDeleted: false }, OR: [{ morningQty: { gt: 0 } }, { eveningQty: { gt: 0 } }] },
    include: { customer: true, item: true }
  });

  return { type: "DEFAULTS", data: defaultSubscriptions, allItems, extraLogs: [] };
}

export async function saveDailyLog(dateStr: string, entries: any[]) {
  for (const entry of entries) {
    // 1. Primary Item Save (With Price Lock)
    await prisma.dailyLog.upsert({
      where: { dateStr_customerId_itemId: { dateStr, customerId: entry.customerId, itemId: entry.itemId } },
      update: { 
        morningDelivered: entry.morningQty, 
        eveningDelivered: entry.eveningQty, 
        customerName: entry.customerName, 
        itemName: entry.itemName, 
        price: entry.price 
      },
      create: { 
        dateStr, 
        customerId: entry.customerId, 
        itemId: entry.itemId, 
        customerName: entry.customerName, 
        itemName: entry.itemName, 
        morningDelivered: entry.morningQty, 
        eveningDelivered: entry.eveningQty, 
        price: entry.price 
      }
    });

    // 2. Extra Items Save
    if (entry.extraItems && entry.extraItems.length > 0) {
      for (const extra of entry.extraItems) {
        if (extra.qty > 0) {
          await prisma.extraItemLog.upsert({
            where: { dateStr_customerId_itemId: { dateStr, customerId: entry.customerId, itemId: extra.itemId } },
            update: { quantity: Number(extra.qty), price: Number(extra.price) },
            create: { 
              dateStr, 
              customerId: entry.customerId, 
              itemId: extra.itemId, 
              customerName: entry.customerName, 
              itemName: extra.itemName, 
              price: Number(extra.price), 
              quantity: Number(extra.qty) 
            }
          });
        } else {
          // Quantity 0 ho jaye toh DB se delete kardo
          try { 
            await prisma.extraItemLog.delete({ 
              where: { dateStr_customerId_itemId: { dateStr, customerId: entry.customerId, itemId: extra.itemId } } 
            }); 
          } catch (e) {}
        }
      }
    }
  }

  revalidatePath("/dashboard/daily-entry");
  return { success: true };
}