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

export async function getLedgerDay(
  customerName: string,
  dateStr: string
) {
  console.log("CUSTOMER NAME:", customerName);
  console.log("DATE:", dateStr);

  if (!customerName || !dateStr) {
    return {
      error: "Missing customerName or dateStr parameter",
      logs: [],
      extras: [],
    };
  }

  const customer = await prisma.customer.findFirst({
    where: {
      name: {
        contains: customerName,
      },
      isDeleted: false,
    },
  });

  if (!customer) {
    return {
      error: `Customer '${customerName}' not found`,
      logs: [],
      extras: [],
    };
  }

  const logs = await prisma.dailyLog.findMany({
    where: {
      customerId: customer.id,
      dateStr: dateStr,
    },
    orderBy: {
      itemName: "asc",
    },
  });

  const extras = await prisma.extraItemLog.findMany({
    where: {
      customerId: customer.id,
      dateStr: dateStr,
    },
    orderBy: {
      itemName: "asc",
    }
  });

  console.log("LOGS:", logs.length);
  console.log("EXTRAS:", extras.length);

  return {
    customerName: customer.name,
    dateStr,
    logs,
    extras,
  };
}