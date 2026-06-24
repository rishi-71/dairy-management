import { tool } from "ai";
import { z } from "zod";
import { callMCP } from "@/lib/mcpClient";

export const getCustomersList = tool({
  description:
    "Get all active customers",

  inputSchema: z.object({}),

  execute: async () => {
    return await callMCP(
      "getCustomersList"
    );
  },
});

export const getCustomerByName = tool({
  description:
    "Find customer by name",

  inputSchema: z.object({
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

  inputSchema: z.object({}),

  execute: async () => {
    return await callMCP(
      "getDashboardStats"
    );
  },
});

export const createCustomer = tool({
  description:
    "Create a new dairy customer",

  inputSchema: z.object({
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

  inputSchema: z.object({
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

  inputSchema: z.object({
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

  inputSchema: z.object({
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
});

export const logDailyDelivery = tool({
  description: "Log or modify a daily delivery entry (morning/evening milk quantity) for a customer on a particular date. If a log exists for this customer/date/item, it updates it, otherwise it creates a new entry.",

  inputSchema: z.object({
    customerName: z.string().describe("The name of the customer. DO NOT use 'customer', you must use 'customerName'"),
    itemName: z.string().describe("The name of the milk item, e.g. 'Cow Milk' or 'Buffalo Milk'. DO NOT use 'item', you must use 'itemName'"),
    dateStr: z.string().describe("The date in YYYY-MM-DD format (e.g. 2026-06-14). DO NOT use 'deliveryDate' or 'date', you must use 'dateStr'"),
    morningDelivered: z.number().optional().describe("Quantity delivered in the morning (in liters). DO NOT use 'morning', you must use 'morningDelivered'"),
    eveningDelivered: z.number().optional().describe("Quantity delivered in the evening (in liters). DO NOT use 'evening', you must use 'eveningDelivered'"),
  }),

  execute: async (input) => {
    return await callMCP("logDailyDelivery", input);
  },
});