// src/mcp/tools/billing-details.ts
import prisma from "@/lib/prisma";
import { resolveCustomer, parseMonthYearInput } from "./utils";

export interface GetCustomerBillDetailsInput {
  customerName?: string;
  customerId?: number;
  monthYear: string; // e.g. "june", "2026-06", "06"
}

export async function getCustomerBillDetails(data: GetCustomerBillDetailsInput) {
  const { customerName = "", customerId, monthYear } = data;

  // 1. Resolve Customer (with Ambiguity Check)
  const resolution = await resolveCustomer(customerName, customerId);
  if (resolution.error) {
    return resolution;
  }
  const customer = resolution.customer!;

  // 2. Normalize monthYear (e.g., "june" -> "2026-06")
  const targetMonthYear = parseMonthYearInput(monthYear);

  if (!targetMonthYear || !/^\d{4}-\d{2}$/.test(targetMonthYear)) {
    return {
      success: false,
      error: "INVALID_INPUT",
      message: `Invalid monthYear format: '${monthYear}'. Must be YYYY-MM or a month name.`,
    };
  }

  // 3. Try to find saved MonthlyBill
  const savedBill = await prisma.monthlyBill.findUnique({
    where: {
      customerId_monthYear: {
        customerId: customer.id,
        monthYear: targetMonthYear,
      },
    },
  });

  if (savedBill) {
    return {
      success: true,
      finalized: true,
      bill: savedBill,
    };
  }

  // 4. Calculate dynamic bill on-the-fly if not finalized yet
  const [year, month] = targetMonthYear.split("-");
  const startDate = `${targetMonthYear}-01`;
  const lastDay = new Date(Number(year), Number(month), 0).getDate();
  const endDate = `${targetMonthYear}-${lastDay}`;

  const [monthLogs, monthExtras] = await Promise.all([
    prisma.dailyLog.findMany({
      where: {
        customerId: customer.id,
        dateStr: { gte: startDate, lte: endDate },
      },
    }),
    prisma.extraItemLog.findMany({
      where: {
        customerId: customer.id,
        dateStr: { gte: startDate, lte: endDate },
      },
    }),
  ]);

  let totalMorningLtrs = 0;
  let totalEveningLtrs = 0;
  let milkTotalAmount = 0;
  let extraItemsAmount = 0;

  monthLogs.forEach((l) => {
    totalMorningLtrs += l.morningDelivered;
    totalEveningLtrs += l.eveningDelivered;
    milkTotalAmount += (l.morningDelivered + l.eveningDelivered) * l.price;
  });

  monthExtras.forEach((e) => {
    extraItemsAmount += e.quantity * e.price;
  });

  // Calculate previous month's due (simplified)
  let previousDue = 0;
  const prevDate = new Date(Number(year), Number(month) - 2, 1);
  const prevMonthYear = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}`;
  const previousBill = await prisma.monthlyBill.findUnique({
    where: {
      customerId_monthYear: {
        customerId: customer.id,
        monthYear: prevMonthYear,
      },
    },
  });
  if (previousBill) {
    previousDue = previousBill.grandTotal - previousBill.amountPaid;
  }

  const grandTotal = milkTotalAmount + extraItemsAmount + previousDue;

  return {
    success: true,
    finalized: false,
    message: "Bill is not finalized yet. Showing calculated estimate.",
    bill: {
      monthYear: targetMonthYear,
      customerId: customer.id,
      customerName: customer.name,
      totalMorningLtrs,
      totalEveningLtrs,
      milkTotalAmount,
      extraItemsAmount,
      previousDue,
      grandTotal,
      isPaid: false,
      amountPaid: 0,
      paymentDate: null,
    },
  };
}
