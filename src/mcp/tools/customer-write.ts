import prisma from "@/lib/prisma";

type CreateCustomerInput = {
  name: string;
  mobile: string;
  address: string;
  openingBalance?: number;
};

export async function createCustomer(
  data: CreateCustomerInput
) {
  const customer =
    await prisma.customer.create({
      data: {
        name: data.name,
        mobile: data.mobile,
        address: data.address,
        openingBalance:
          data.openingBalance ?? 0,
      },
    });

  return customer;
}