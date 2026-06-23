import dotenv from "dotenv";

dotenv.config();
console.log("DATABASE_URL:", process.env.DATABASE_URL);
import express from "express";
import cors from "cors";
import { createCustomer } from "./tools/customer-write";
import { updateCustomer } from "./tools/customer-update";

import { getCustomersList, getCustomerByName } from "./tools/customers";

import { getDashboardStats } from "./tools/dashboard";

import { getCustomerLedger, getLedgerDay } from "./tools/ledger";
import { logDailyDelivery } from "./tools/daily-log";

const app = express();

app.use(cors());
app.use(express.json());

app.post("/mcp", async (req, res) => {
  try {
    const { tool, args } = req.body;
    console.log("📥 MCP SERVER RECEIVED:", { tool, args });

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

        case "getLedgerDay":
  return res.json(
    await getLedgerDay(
      args.customerName,
      args.dateStr
    )
  );

        case "logDailyDelivery":
  return res.json(
    await logDailyDelivery(args)
  );

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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 MCP Server running on port ${PORT}`);
});
