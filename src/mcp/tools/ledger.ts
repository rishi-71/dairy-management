import prisma from "@/lib/prisma";

export async function getCustomerLedger(
  customerName: string
) {
  const customer =
    await prisma.customer.findFirst({
      where: {
        name: {
          contains: customerName,
        },
      },
    });

  if (!customer) {
    throw new Error(
      "Customer not found"
    );
  }

  const dailyLogs =
    await prisma.dailyLog.findMany({
      where: {
        customerId:
          customer.id,
      },

      orderBy: {
        dateStr: "desc",
      },
    });

  const extraItems =
    await prisma.extraItemLog.findMany({
      where: {
        customerId:
          customer.id,
      },

      orderBy: {
        dateStr: "desc",
      },
    });

  return {
    customer: {
      id: customer.id,
      name: customer.name,
      mobile:
        customer.mobile,
    },

    dailyLogs,

    extraItems,
  };
}