import prisma from "@/lib/prisma";

export async function getDashboardStats() {
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

  const morningRequirement =
    subscriptions.reduce(
      (sum, sub) =>
        sum + sub.morningQty,
      0
    );

  const unpaidBills =
    await prisma.monthlyBill.findMany({
      where: {
        isPaid: false,
      },
    });

  const outstandingLedger =
    unpaidBills.reduce(
      (sum, bill) =>
        sum +
        (bill.grandTotal -
          bill.amountPaid),
      0
    );

  return {
    totalCustomers:
      customerCount,

    totalItems:
      itemCount,

    morningRequirement,

    outstandingLedger,
  };
}