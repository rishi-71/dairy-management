import { tool } from "ai";
import { z } from "zod";
import prisma from "@/lib/prisma";

export const getDashboardStats = tool({
  description:
    "Get overall dashboard statistics for the dairy business",

  parameters: z.object({}),

  execute: async () => {

    console.log("🔥 getDashboardStats CALLED");
    const customerCount =

      await prisma.customer.count({
        where: {
          isDeleted: false,
        },
      });

    const itemCount =
      await prisma.item.count({
        where: {
          isDeleted: false,
        },
      });

    const subscriptions =
      await prisma.subscription.findMany();

    let morningRequirement = 0;

    for (const sub of subscriptions) {
      morningRequirement +=
        sub.morningQty;
    }

    const bills =
      await prisma.monthlyBill.findMany({
        where: {
          isPaid: false,
        },
      });

    let outstanding = 0;

    for (const bill of bills) {
      outstanding +=
        bill.grandTotal -
        bill.amountPaid;
    }

    const result = {
      totalCustomers: customerCount,
      totalItems: itemCount,
      morningRequirement,
      outstandingLedger: outstanding,
    };

    console.log("🔥 DASHBOARD RESULT:", result);

    return result;
  },
});