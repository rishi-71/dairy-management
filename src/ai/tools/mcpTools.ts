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