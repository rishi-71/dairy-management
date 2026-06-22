import { tool } from "ai";
import { z } from "zod";
import { callMCP } from "@/lib/mcpClient";

export const getCustomersList = tool({
  description:
    "Get all active customers",

  parameters: z.object({}),

  execute: async () => {
    return await callMCP(
      "getCustomersList"
    );
  },
});

export const getCustomerByName = tool({
  description:
    "Find customer by name",

  parameters: z.object({
    name: z.string(),
  }),

  execute: async ({ name }) => {
    return await callMCP(
      "getCustomerByName",
      {
        name,
      }
    );
  },
});

export const getDashboardStats = tool({
  description:
    "Get dashboard statistics",

  parameters: z.object({}),

  execute: async () => {
    return await callMCP(
      "getDashboardStats"
    );
  },
});

export const createCustomer = tool({
  description:
    "Create a new dairy customer",

  parameters: z.object({
    name: z.string(),
    mobile: z.string(),
    address: z.string(),
    openingBalance:
      z.number().optional(),
  }),

  execute: async (input) => {
     console.log("🔥 CREATE CUSTOMER TOOL CALLED");
    console.log(input);
    return await callMCP(
      "createCustomer",
      input
    );
  },
});

export const updateCustomer = tool({
  description:
    "Update customer mobile, address or balance",

  parameters: z.object({
    customerName:
      z.string(),

    mobile:
      z.string().optional(),

    address:
      z.string().optional(),

    openingBalance:
      z.number().optional(),
  }),

  execute: async (input) => {
    return await callMCP(
      "updateCustomer",
      input
    );
  },
});

export const getCustomerLedger =
tool({
  description:
    "Get full ledger of a customer",

  parameters: z.object({
    customerName:
      z.string(),
  }),

  execute: async ({
    customerName,
  }) => {
    return await callMCP(
      "getCustomerLedger",
      {
        customerName,
      }
    );
  },
});