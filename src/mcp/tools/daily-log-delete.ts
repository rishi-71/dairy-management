// src/mcp/tools/daily-log-delete.ts
import prisma from "@/lib/prisma";
import { syncMonthlyBill } from "@/lib/billUtils";
import { resolveCustomer, parseDateInput } from "./utils";

export interface DeleteDailyDeliveryInput {
  customerName?: string;
  customerId?: number;
  itemName?: string; // Optional: delete specific item delivery, or all items if omitted
  dateStr: string;
}

export async function deleteDailyDelivery(data: DeleteDailyDeliveryInput) {
  const { customerName = "", customerId, itemName, dateStr } = data;

  // 1. Resolve Customer (with Ambiguity Check)
  const resolution = await resolveCustomer(customerName, customerId);
  if (resolution.error) {
    return resolution;
  }
  const customer = resolution.customer!;

  // 2. Normalize date string
  const targetDateStr = parseDateInput(dateStr);

  if (!targetDateStr) {
    return {
      success: false,
      error: "INVALID_INPUT",
      message: "dateStr parameter is required.",
    };
  }

  let deletedCount = 0;

  if (itemName) {
    // Resolve Item
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

    // Delete single item log
    const deleteResult = await prisma.dailyLog.deleteMany({
      where: {
        customerId: customer.id,
        itemId: item.id,
        dateStr: targetDateStr,
      },
    });
    deletedCount = deleteResult.count;
  } else {
    // Delete all logs for customer on this date
    const deleteResult = await prisma.dailyLog.deleteMany({
      where: {
        customerId: customer.id,
        dateStr: targetDateStr,
      },
    });
    deletedCount = deleteResult.count;
  }

  // 3. Sync monthly bill for customer (if bill exists or to trigger updates)
  const monthYear = targetDateStr.substring(0, 7);
  await syncMonthlyBill(customer.id, monthYear);

  return {
    success: true,
    message: `Successfully deleted ${deletedCount} delivery logs for ${customer.name} on ${targetDateStr}.`,
    details: {
      customerId: customer.id,
      customerName: customer.name,
      dateStr: targetDateStr,
      deletedCount,
    },
  };
}
