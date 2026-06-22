import { tool } from "ai";
import { z } from "zod";
import prisma from "@/lib/prisma";

export const getOutstandingCustomers = tool({
  description:
    "Get customers with unpaid bills and outstanding balances",

  parameters: z.object({}),

  execute: async () => {
    console.log("🔥 getOutstandingCustomers CALLED");

    const bills =
      await prisma.monthlyBill.findMany({
        where: {
          isPaid: false,
        },

        select: {
          customerName: true,
          grandTotal: true,
          amountPaid: true,
          monthYear: true,
        },
      });

    const result = bills.map((bill) => ({
      customerName: bill.customerName,
      monthYear: bill.monthYear,
      dueAmount:
        bill.grandTotal -
        bill.amountPaid,
    }));

    console.log(
      "🔥 OUTSTANDING RESULT:",
      result
    );

    return result;
  },
});