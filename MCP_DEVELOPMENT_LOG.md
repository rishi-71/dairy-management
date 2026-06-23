# Dairy Farm - MCP Development Log

This document serves as a comprehensive log and architectural map for the **Dairy Farm** project. It details the project's features, codebase architecture, and MCP (Model Context Protocol) integration. It will be updated iteratively as we refine, add, or modify the system's capabilities.

---

## 1. Project Overview & Core Features

**Dairy Farm** is a dairy-management system built using **Next.js**, **Prisma ORM**, and **MariaDB/MySQL**. It is designed to help dairy administrators manage customers, track daily milk deliveries, record extra items, manage billing, and process payments.

### Core Features:
1. **Customer Management**:
   - Add/register customers with details (Name, Mobile, Address, Opening Balance).
   - Set up recurring daily requirements (Morning/Evening quantity subscriptions) for items.
2. **Daily Logs (Entries)**:
   - Record daily delivered milk quantities (morning and evening deliveries) for each customer.
3. **Extra Item Logs**:
   - Record one-off extra item purchases (e.g., butter, ghee, paneer) for customers on specific dates.
4. **Customer Ledger**:
   - Access comprehensive historical entries for any customer, including daily deliveries and extra items, enabling admins to view records month-by-month and date-by-date.
5. **Billing & Receipts**:
   - Track outstanding balances, compute monthly totals, record paid amounts, and manage payment receipts.
6. **AI Assistant Integration (MCP)**:
   - Provide an in-app chat interface ("Dairy AI Core") enabling administrators to query dashboard statistics, search/add/update customers, and retrieve ledger details directly via natural language.

---

## 2. Technology Stack & Key Libraries

- **Frontend & App Framework**: Next.js (version 16) with React 19.
- **Styling**: TailwindCSS (v4) & Vanilla CSS.
- **Database Layer**: Prisma ORM with MariaDB client adapter (`@prisma/adapter-mariadb`) and MySQL provider configuration.
- **AI Integration**: Vercel AI SDK (`ai` and `@ai-sdk/react`, `@ai-sdk/google`) using Gemini (`gemini-2.5-flash-lite` or similar).
- **Custom MCP Server**: Express server running on port `3001` to bridge AI tool execution with database operations.

---

## 3. Database Schema (`prisma/schema.prisma`)

The database consists of the following key models:

1. **Admin**: Authentication credentials for system administrators.
2. **Customer**: Details of customers (name, mobile, address, active status, opening balance).
3. **Item**: Dairy products available for subscription or extra log entries (price, unit).
4. **Subscription**: Stores default recurring requirements (morning quantity, evening quantity) for a customer and item.
5. **DailyLog**: Records actual milk quantity delivered on specific dates (`dateStr`).
6. **ExtraItemLog**: Records actual extra items (butter, etc.) purchased on specific dates (`dateStr`).
7. **MonthlyBill**: Stores computed monthly statements (milk quantities, extra items amount, previous dues, grand totals, and payment status).
8. **Receipt**: Records individual payments processed against bills.

---

## 4. Current MCP Server Architecture

Rather than standard standard-input/output (Stdio) or Server-Sent Events (SSE) standard Model Context Protocol, the project currently uses a custom **HTTP POST bridge** running on **Port 3001**.

```
┌─────────────────┐             ┌─────────────────────┐             ┌─────────────────────┐
│  Next.js App    │             │   mcpClient.ts      │             │  Express Server     │
│  (Chat Widget)  │  ─────────> │   (callMCP helper)  │  ─────────> │  (Port 3001: /mcp)  │
└─────────────────┘             └─────────────────────┘             └─────────────────────┘
         ▲                                                                     │
         │                                                                     ▼
         │                                                            ┌───────────────────┐
         └────────────────────────────────────────────────────────────│   Prisma Client   │
                           Returns JSON Response                      │     (Database)    │
                                                                      └───────────────────┘
```

### Components:
1. **Express Server (`src/mcp/server.ts` & `src/mcp/bootstrap.ts`)**:
   - Run separately using `tsx` on port `3001` (concurrently started with `next dev`).
   - Standard `/mcp` POST endpoint which accepts a JSON payload: `{ tool: string, args: Record<string, any> }`.
   - Maps requested tools to local TypeScript functions executing Prisma database queries.
2. **Client Helper (`src/lib/mcpClient.ts`)**:
   - Exports `callMCP(toolName, args)` which performs a `fetch` request to `http://localhost:3001/mcp`.
3. **AI Tool Registration (`src/ai/tools/mcpTools.ts`)**:
   - Wraps MCP client calls in Zod schemas for parameters and tool descriptions.
4. **Chat API Endpoint (`src/app/api/chat/route.ts`)**:
   - Next.js API route that handles streaming chat conversations via Gemini.
   - Registers the tools defined in `mcpTools.ts`. When Gemini decides to call a tool, the corresponding `execute` function calls `callMCP`, which queries the Express server.
5. **Chat Interface (`src/components/AiAssistant.tsx`)**:
   - Floating widget UI which uses the `@ai-sdk/react` `useChat` hook to interact with `/api/chat`.
   - Includes custom renderers for different tool states and output structures (e.g. lists, dashboard cards, customer profiles).

---

## 5. Active MCP Tools & Handlers

Here is the current list of tool names and their mapped functions:

| Tool Name | Action Description | Target Endpoint / Handler Function |
|---|---|---|
| `getCustomersList` | Fetch all active customers | `getCustomersList()` in `src/mcp/tools/customers.ts` |
| `getCustomerByName` | Find customer details & subscriptions | `getCustomerByName(name)` in `src/mcp/tools/customers.ts` |
| `getDashboardStats` | Fetch total customers, items, morning req, & outstanding balance | `getDashboardStats()` in `src/mcp/tools/dashboard.ts` |
| `createCustomer` | Add a new customer to the database | `createCustomer(data)` in `src/mcp/tools/customer-write.ts` |
| `updateCustomer` | Update customer phone number, address, or opening balance | `updateCustomer(data)` in `src/mcp/tools/customer-update.ts` |
| `getCustomerLedger` | Get ledger logs (deliveries & extra items) of a customer | `getCustomerLedger(customerName)` in `src/mcp/tools/ledger.ts` |
| `getLedgerDay` | Get delivery entries for a specific customer and date | `getLedgerDay(customerName, dateStr)` in `src/mcp/tools/ledger.ts` |

---

## 6. Execution & Verification Log

### [2026-06-23] Initial Project Analysis
- **Action**: Performed complete project structure scanning, analyzed file contents, and mapped the database schema and active MCP connections.
- **Why**: Established architectural alignment and recorded the baseline system status.
- **How**: Inspected directories, reviewed files like `package.json`, `prisma/schema.prisma`, `src/mcp/server.ts`, and frontend components. Created this log file to document project state.

### [2026-06-23] Fix getLedgerDay Parameter and Rendering Logic
- **Action**: Modified the `getLedgerDay` tool to filter only the requested customer and date, adding "not found" checks and a styled UI in the chatbot.
- **Why**: Previously, `getLedgerDay` required `customerId` (which the AI chatbot couldn't easily retrieve without sequential tool calls) and returned all logs in the database when arguments were unresolved. Also, the UI was displaying entries from all customers and didn't gracefully indicate when no records were found.
- **How**:
  1. Updated `getLedgerDay` in `src/mcp/tools/ledger.ts` to accept `customerName: string` instead of `customerId: number` and find the customer record first.
  2. Updated Express routing (`src/mcp/server.ts`) and AI tool registration (`src/ai/tools/mcpTools.ts`) to forward `customerName`.
  3. Added explicit system instructions in `src/app/api/chat/route.ts` to guide Gemini to convert queries (like "14 June") into `YYYY-MM-DD` format.
  4. Redesigned the renderer in `src/components/AiAssistant.tsx` to handle customer-not-found errors, empty states ("no entries found"), and style matching records inside clean, distinct layouts.
