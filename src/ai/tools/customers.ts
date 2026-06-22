import { tool } from "ai";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { fa } from "zod/locales";

export const getCustomersList = tool({
  description:
    "Get all active customers",

  parameters: z.object({}),

  execute: async () => {
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
  },
});

export const getCustomerByName = tool({
  description:
    "Find a dairy customer by their full or partial name. Extract the customer name from the user's query and pass it as the 'name' parameter.",

  parameters: z.object({
    name: z.string().describe(
      "Customer name to search for"
    ),
  }),

  execute: async ({ name }) => {
    console.log("🔥 getCustomerByName CALLED");
    console.log("🔥 Searching:", name);

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

    console.log(
      "🔥 CUSTOMER FOUND:",
      customer
    );

    return customer;
  },
});

export const getCustomerSubscriptions = tool({
  description:
    "Get all subscriptions of a customer",

  parameters: z.object({
    name: z
      .string()
      .describe("Customer name"),
  }),

  execute: async ({ name }) => {
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

    return customer?.subscriptions ?? [];
  },
});