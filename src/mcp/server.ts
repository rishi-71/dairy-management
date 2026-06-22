import dotenv from "dotenv";

dotenv.config();
console.log("DATABASE_URL:", process.env.DATABASE_URL);
import express from "express";
import cors from "cors";
import { createCustomer } from "./tools/customer-write";
import { updateCustomer } from "./tools/customer-update";

import { getCustomersList, getCustomerByName } from "./tools/customers";

import { getDashboardStats } from "./tools/dashboard";

import { getCustomerLedger } from "./tools/ledger";

const app = express();

app.use(cors());
app.use(express.json());

app.post("/mcp", async (req, res) => {
  try {
    const { tool, args } = req.body;

    switch (tool) {
      case "getCustomersList":
        return res.json(await getCustomersList());

      case "getCustomerByName":
        return res.json(await getCustomerByName(args.name));

      case "getDashboardStats":
        return res.json(await getDashboardStats());

      case "createCustomer":
        return res.json(await createCustomer(args));

      case "updateCustomer":
        return res.json(await updateCustomer(args));

       case "getCustomerLedger":
        return res.json( await getCustomerLedger( args.customerName));

      default:
        return res.status(404).json({
          error: "Tool not found",
        });
    }
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "MCP Server Error",
    });
  }
});

app.listen(3001, () => {
  console.log("🚀 MCP Server running on port 3001");
});
