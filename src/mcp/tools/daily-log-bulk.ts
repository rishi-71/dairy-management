// src/mcp/tools/daily-log-bulk.ts
import prisma from "@/lib/prisma";
import { syncMonthlyBill } from "@/lib/billUtils";
import { resolveCustomer, parseMonthYearInput } from "./utils";

export interface BulkLogDailyDeliveryInput {
  customerName?: string;
  customerId?: number;
  itemName: string;
  month: string | number; // e.g. "june", "06", 6
  year?: number;
  morningDelivered?: number;
  eveningDelivered?: number;
  skipDates?: number[]; // e.g. [3, 4, 5]
}

export async function bulkLogDailyDelivery(data: BulkLogDailyDeliveryInput) {
  const { customerName = "", customerId, itemName, month, year, morningDelivered = 0, eveningDelivered = 0, skipDates = [] } = data;

  // 1. Resolve Customer (with Ambiguity Check)
  const resolution = await resolveCustomer(customerName, customerId);
  if (resolution.error) {
    return resolution;
  }
  const customer = resolution.customer!;

  // 2. Resolve Item
  const item = await prisma.item.findFirst({
    where: {
      name: {
        contains: itemName,
      },
      isDeleted: false,
    },
  });

  if (!item) {
    return {
      success: false,
      error: "NOT_FOUND",
      message: `Item '${itemName}' not found.`,
    };
  }

  // 3. Resolve Month & Year
  const currentYear = new Date().getFullYear();
  let targetYear = year || currentYear;
  let targetMonthNum = 0;

  if (typeof month === "number") {
    targetMonthNum = month;
  } else {
    // Parse using our month-year helper
    const parsedMY = parseMonthYearInput(month);
    const parts = parsedMY.split("-");
    if (parts.length === 2) {
      targetYear = year || Number(parts[0]);
      targetMonthNum = Number(parts[1]);
    }
  }

  if (targetMonthNum < 1 || targetMonthNum > 12) {
    return {
      success: false,
      error: "INVALID_INPUT",
      message: `Invalid month: '${month}'. Must be 1-12 or a month name.`,
    };
  }

  const monthYear = `${targetYear}-${String(targetMonthNum).padStart(2, "0")}`;
  const lastDay = new Date(targetYear, targetMonthNum, 0).getDate();

  let createdCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;

  // 4. Batch Logs Generation Loop
  const operations = [];
  for (let day = 1; day <= lastDay; day++) {
    if (skipDates.includes(day)) {
      skippedCount++;
      continue;
    }

    const dateStr = `${monthYear}-${String(day).padStart(2, "0")}`;
    
    // Check if entry already exists
    const existingLog = await prisma.dailyLog.findUnique({
      where: {
        dateStr_customerId_itemId: {
          dateStr,
          customerId: customer.id,
          itemId: item.id,
        },
      },
    });

    if (existingLog) {
      operations.push(
        prisma.dailyLog.update({
          where: { id: existingLog.id },
          data: {
            customerName: customer.name,
            itemName: item.name,
            price: item.price,
            morningDelivered,
            eveningDelivered,
          },
        })
      );
      updatedCount++;
    } else {
      operations.push(
        prisma.dailyLog.create({
          data: {
            dateStr,
            customerId: customer.id,
            itemId: item.id,
            customerName: customer.name,
            itemName: item.name,
            price: item.price,
            morningDelivered,
            eveningDelivered,
          },
        })
      );
      createdCount++;
    }
  }

  // Execute all Prisma operations in transaction
  if (operations.length > 0) {
    await prisma.$transaction(operations);
  }

  // 5. Synchronize Monthly Bill for customer (if bill exists or to trigger updates)
  await syncMonthlyBill(customer.id, monthYear);

  return {
    success: true,
    message: `Bulk log completed for ${customer.name}.`,
    details: {
      monthYear,
      created: createdCount,
      updated: updatedCount,
      skipped: skippedCount,
      totalDays: lastDay,
    },
  };
}
