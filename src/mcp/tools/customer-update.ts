import prisma from "@/lib/prisma";

export interface UpdateCustomerInput {
  customerName: string;
  mobile?: string;
  address?: string;
  openingBalance?: number;
}

export async function updateCustomer(
  data: UpdateCustomerInput
) {
  const customer =
    await prisma.customer.findFirst({
      where: {
        name: {
          contains:
            data.customerName,
        },
        isDeleted: false,
      },
    });

  if (!customer) {
    throw new Error(
      "Customer not found"
    );
  }

  const updated =
    await prisma.customer.update({
      where: {
        id: customer.id,
      },

      data: {
        ...(data.mobile && {
          mobile: data.mobile,
        }),

        ...(data.address && {
          address: data.address,
        }),

        ...(typeof data.openingBalance ===
          "number" && {
          openingBalance:
            data.openingBalance,
        }),
      },
    });

  return updated;
}