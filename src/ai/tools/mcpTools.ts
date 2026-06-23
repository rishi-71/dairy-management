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

export const getLedgerDay = tool({
  description: "Get delivery entries and extra items for a customer on a particular date. The dateStr must be in YYYY-MM-DD format (e.g. 2026-06-14).",

  parameters: z.object({
    customerName: z.string().describe("The name of the customer"),
    dateStr: z.string().describe("The date in YYYY-MM-DD format (e.g. 2026-06-14)"),
  }),

  execute: async ({
    customerName,
    dateStr,
  }) => {
    return await callMCP(
      "getLedgerDay",
      {
        customerName,
        dateStr,
      }
    );
  },
})