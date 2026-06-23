// src/actions/receiptActions.ts
"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Pending bills fetch karne ka function
export async function getPendingBills(customerId: number) {
  const bills = await prisma.monthlyBill.findMany({
    where: { 
      customerId: customerId,
      isPaid: false // Sirf woh bills jo poore pay nahi hue hain
    },
    orderBy: { monthYear: 'desc' }
  });

  // Fetch extra items for each bill month
  const billsWithExtras = await Promise.all(
    bills.map(async (bill) => {
      const [year, month] = bill.monthYear.split('-');
      const lastDay = new Date(Number(year), Number(month), 0).getDate();
      const startDate = `${bill.monthYear}-01`;
      const endDate = `${bill.monthYear}-${lastDay}`;

      const extraItems = await prisma.extraItemLog.findMany({
        where: {
          customerId: customerId,
          dateStr: { gte: startDate, lte: endDate }
        }
      });

      return {
        ...bill,
        extraItems
      };
    })
  );

  return billsWithExtras;
}

// Payment save karne ka function
export async function recordPayment(data: {
  customerId: number;
  dateStr: string;
  monthYear: string;
  totalBilled: number;
  amountPaid: number;
}) {
  const remainingAmount = data.totalBilled - data.amountPaid;

  // 1. Create Receipt Record
  await prisma.receipt.create({
    data: {
      customerId: data.customerId,
      dateStr: data.dateStr,
      monthYear: data.monthYear,
      totalBilled: data.totalBilled,
      amountPaid: data.amountPaid,
      remainingDue: remainingAmount
    }
  });

  // 2. Update Monthly Bill Status
  await prisma.monthlyBill.update({
    where: { customerId_monthYear: { customerId: data.customerId, monthYear: data.monthYear } },
    data: {
      amountPaid: { increment: data.amountPaid },
      isPaid: remainingAmount <= 0 // Agar paise poore aa gaye, toh bill close
    }
  });

  // 3. Update Customer's Opening Balance (Taki agle mahine carry forward ho sake)
  await prisma.customer.update({
    where: { id: data.customerId },
    data: { openingBalance: remainingAmount }
  });

  revalidatePath("/dashboard/receipts");
  return { success: true, remainingAmount };
}