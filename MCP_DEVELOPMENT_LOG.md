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
| `logDailyDelivery` | Log or modify a daily delivery entry (morning/evening milk quantity) | `logDailyDelivery(data)` in `src/mcp/tools/daily-log.ts` |

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

### [2026-06-23] Feature: Add/Modify Daily Delivery Entry (logDailyDelivery)
- **Action**: Built a new MCP tool `logDailyDelivery` to create or modify milk delivery logs for any customer and date.
- **Why**: Admins need to be able to dynamically log or correct daily milk quantities directly from the chatbot dialog without leaving the chat interface.
- **How**:
  1. Created `src/mcp/tools/daily-log.ts` implementing `logDailyDelivery(data)` which performs a Prisma `upsert` (create/update) for `DailyLog` based on `customerName`, `itemName`, and `dateStr`.
  2. Registered the tool case on the Express server (`src/mcp/server.ts`) and exported the Vercel AI SDK wrapper (`src/ai/tools/mcpTools.ts`).
  3. Configured system parsing rules in `src/app/api/chat/route.ts` so the model extracts quantity (morning/evening), maps item names, and formats dates into `YYYY-MM-DD`.
  4. Programmed a responsive green confirmation layout inside `src/components/AiAssistant.tsx` displaying the customer, item, date, and updated morning/evening totals.

### [2026-06-23] Bug Fix: Parameter Hallucination in logDailyDelivery Tool Call
- **Action**: Resolved parameter alignment errors where the AI model sent `item` and `deliveryDate` instead of the schema-defined `itemName` and `dateStr`.
- **Why**: When invoking `logDailyDelivery` through the frontend chat assistant, the LLM hallucinated parameter keys, causing Express schema validation to fail on missing required fields.
- **How**:
  1. Updated the Zod schema description in `src/ai/tools/mcpTools.ts` to include explicit warnings against using parameter aliases.
  2. Modified system prompt instructions in `src/app/api/chat/route.ts` with a concrete example of a tool call structure and explicit warnings not to use alternative parameter names.
  3. Added a robust parameter normalization layer at the beginning of `logDailyDelivery` in `src/mcp/tools/daily-log.ts` to map potential parameter aliases (like `item`, `deliveryDate`, `customer`, `morning`, `evening`) to the expected schema fields.
  4. Verified using `scratch_test_chat.ts`, confirming successful execution and response stream mapping.

### [2026-06-23] Feature: Detailed Receipt Generation with Extra Items
- **Action**: Improved the payment receipt creation flow to produce an itemized paper receipt preview containing milk logs and extra items with quick-print functions.
- **Why**: Admins need to generate clear, clean, and complete print-ready bills that break down exactly what the customer is paying for (both base milk and extra products).
- **How**:
  1. Updated the `getPendingBills` server action in `src/actions/receiptActions.ts` to query and append corresponding `extraItems` from `ExtraItemLog` for the specific month.
  2. Enhanced `handleSavePayment` and state handling in `src/app/dashboard/receipts/ReceiptClient.tsx` to collect payment dates, mobile numbers, and the itemized lists.
  3. Replaced the basic success card on the right-hand panel with a styled, minimalist paper receipt showing header, metadata, itemized breakdown (milk log + extra items), total amounts, amount paid, and new outstanding balances.
  4. Programmed a "Print Receipt" feature that opens a styled, print-only browser window layout and automatically triggers the printer dialog.

### [2026-06-23] Bug Fix: Receipt Preview Disappearing Instantly after Saving
- **Action**: Prevented the receipt preview from resetting to empty after generating a receipt.
- **Why**: When clicking "Generate Receipt & Update Balance", the database successfully saved the payment and populated `successData`. However, the code immediately invoked `fetchBills()`, which unconditionally set `successData` to `null` before the browser could render the receipt preview.
- **How**:
  1. Updated `fetchBills` in `src/app/dashboard/receipts/ReceiptClient.tsx` to take a boolean parameter `clearSuccess` (defaulting to `true`).
  2. Modified the conditional check inside `fetchBills` to only call `setSuccessData(null)` if `clearSuccess` is `true`.
  3. Updated the `handleSavePayment` invocation to call `fetchBills(false)`, which refreshes the billing lists but preserves the newly created `successData` receipt details in the UI.

### [2026-06-23] Feature: Paid Bill Re-opening and Customer Running Balance Auto-adjustment
- **Action**: Modified `syncMonthlyBill` to automatically re-open fully paid bills and atomically adjust the customer's outstanding balance when ledger entries are edited.
- **Why**: If an admin edited the customer ledger for a month that was already fully paid (`isPaid: true`), the bill totals would update in the background, but the bill would stay marked as paid. This prevented it from showing up in pending bills on the Receipts page, leaving a gap where new ledger additions were never paid for.
- **How**:
  1. Updated `syncMonthlyBill` in `src/lib/billUtils.ts` to compute the outstanding balance difference before and after ledger edits.
  2. If the new outstanding balance is positive (e.g. we added a ledger entry, so total billed > amount paid), we set `isPaid` to `false` and clear the `paymentDate`.
  3. Atomically updated the `Customer.openingBalance` (representing their current outstanding balance due) by using Prisma's `increment` set to the delta difference (`outstandingChange`). This ensures additions increase the due balance and deletions decrease it accordingly.
  4. Verified using the test script `scratch_test_paid_bill_sync.ts`.

### [2026-06-23] Feature: Print Report Option and Clean Invoice Styling
- **Action**: Renamed the "Print Bill" button to "Print Report" and optimized the printable layout of the monthly bill/invoice.
- **Why**: The default browser print layout included harsh, heavy black borders (reminiscent of basic Microsoft Word tables) and oversized, boxed total panels which looked cluttered and unpolished.
- **How**:
  1. Renamed "Print Bill" to "Print Report" in `src/app/dashboard/reports/ReportGenerator.tsx`.
  2. Redesigned the printable header to feature a left-aligned clean logo title layout and right-aligned billing month metadata.
  3. Styled the printable customer card to render inside a clean gray background panel (`print:bg-slate-50`) with slate borders and a "Billed To" helper header.
  4. Removed all heavy black vertical and horizontal borders (`print:border-black`, `print:border-r`) from the table, replacing them with modern, lightweight slate line separators (`print:border-b print:border-slate-100`).
  5. Redesigned the "Grand Total to Pay" print panel to display as a compact, neat gray receipt block (`print:bg-slate-50 print:p-4`) with smaller, high-contrast totals (`print:text-2xl`) and added a professional "Thank you for choosing Dairy Farm services!" print footer.





