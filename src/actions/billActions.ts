// src/actions/billActions.ts
"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function saveMonthlyBill(data: {
  customerId: number;
  customerName: string;
  monthYear: string;
  totalMorningLtrs: number;
  totalEveningLtrs: number;
  milkTotalAmount: number;
  extraItemsAmount: number;
  previousDue: number;
  grandTotal: number;
}) {
  // Upsert use kar rahe hain taaki agar bill dobara generate karein toh duplicate na bane
  await prisma.monthlyBill.upsert({
    where: {
      customerId_monthYear: {
        customerId: data.customerId,
        monthYear: data.monthYear,
      }
    },
    update: {
      totalMorningLtrs: data.totalMorningLtrs,
      totalEveningLtrs: data.totalEveningLtrs,
      milkTotalAmount: data.milkTotalAmount,
      extraItemsAmount: data.extraItemsAmount,
      previousDue: data.previousDue,
      grandTotal: data.grandTotal,
    },
    create: {
      customerId: data.customerId,
      customerName: data.customerName,
      monthYear: data.monthYear,
      totalMorningLtrs: data.totalMorningLtrs,
      totalEveningLtrs: data.totalEveningLtrs,
      milkTotalAmount: data.milkTotalAmount,
      extraItemsAmount: data.extraItemsAmount,
      previousDue: data.previousDue,
      grandTotal: data.grandTotal,
    }
  });

  revalidatePath("/dashboard/reports");
  return { success: true };
}

export async function checkBillExists(customerId: number, monthYear: string) {
  const bill = await prisma.monthlyBill.findUnique({
    where: {
      customerId_monthYear: {
        customerId,
        monthYear,
      }
    }
  });
  return !!bill; // True if exists, False if pending
}