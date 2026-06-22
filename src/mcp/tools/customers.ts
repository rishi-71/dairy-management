import prisma from "@/lib/prisma";

export async function getCustomersList() {
  const customers =
    await prisma.customer.findMany({
      where: {
        isDeleted: false,
      },
      select: {
        id: true,
        name: true,
        mobile: true,
        openingBalance: true,
      },
    });

  return customers;
}

export async function getCustomerByName(
  name: string
) {
  const customer =
    await prisma.customer.findFirst({
      where: {
        name: {
          contains: name,
        },
        isDeleted: false,
      },
      include: {
        subscriptions: true,
      },
    });

  return customer;
}