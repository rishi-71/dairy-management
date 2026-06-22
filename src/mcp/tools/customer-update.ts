import prisma from "@/lib/prisma";

type UpdateCustomerInput = {
  id: number;

  name?: string;
  mobile?: string;
  address?: string;
  openingBalance?: number;
  isActive?: boolean;
};

export async function updateCustomer(
  data: UpdateCustomerInput
) {
  const customer =
    await prisma.customer.update({
      where: {
        id: data.id,
      },

      data: {
        ...(data.name && {
          name: data.name,
        }),

        ...(data.mobile && {
          mobile: data.mobile,
        }),

        ...(data.address && {
          address: data.address,
        }),

        ...(data.openingBalance !==
          undefined && {
          openingBalance:
            data.openingBalance,
        }),

        ...(data.isActive !==
          undefined && {
          isActive:
            data.isActive,
        }),
      },
    });

  return customer;
}