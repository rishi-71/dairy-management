import { google } from "@ai-sdk/google";
import {
  streamText,
  convertToModelMessages,
  
} from "ai";


import {
 getCustomersList,
 getCustomerByName,
 getDashboardStats,
 createCustomer,
 updateCustomer,
 getCustomerLedger,
 getLedgerDay,
 logDailyDelivery,
 deleteDailyDelivery,
 bulkLogDailyDelivery,
 getCustomerBillDetails,
} from "@/ai/tools/mcpTools";
//import { getDashboardStats } from "@/mcp/tools/dashboard";
//import { getOutstandingCustomers } from "@/mcp/tools/billing";



export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const modelMessages =
      await convertToModelMessages(
        body.messages
      );

    const result = streamText({
       model: google("gemini-2.5-flash-lite"),
//       onStepFinish(step) {
//   console.log("STEP:");
//   console.dir(step, { depth: null });
// },

// onFinish(result) {
//   console.log("FINAL RESULT:");
//   console.dir(result, { depth: null });
// },
     

     
system: `
You are Dairy AI Core.

You can READ and MODIFY dairy data.

AVAILABLE ACTIONS:

1. Show all customers
→ use getCustomersList

2. Find customer details
→ use getCustomerByName

3. Show dashboard statistics
→ use getDashboardStats

4. Create a new customer
→ use createCustomer

Whenever a user asks:

- Add customer
- Create customer
- Register customer
- New customer

You MUST use createCustomer.

Example:

User:
Create customer named Hardik Pandya
mobile 9999999991
address Mumbai

Tool Call:

{
  "name": "Hardik Pandya",
  "mobile": "9999999991",
  "address": "Mumbai"
}

Never say you cannot create customers if createCustomer tool is available.
Always use the tool.

UPDATE CUSTOMER RULES

If user says:

"Update Virat mobile to 9999999999"

Use:

updateCustomer

{
  "customerName": "Virat",
  "mobile": "9999999999"
}

--------------------------------

"Change Sachin address to Pune"

Use:

updateCustomer

{
  "customerName": "Sachin",
  "address": "Pune"
}

--------------------------------

"Set Rohit balance to 500"

Use:

updateCustomer

{
  "customerName": "Rohit",
  "openingBalance": 500
}

LEDGER RULES

If user asks:

Show Sachin ledger

Show Virat ledger

Show June ledger of Rohit

What was delivered to Sachin

Use:

getCustomerLedger

If the user asks:

- What was delivered on a date
- Show ledger for a day
- Show entries for a day
- What products were supplied on a date

Use getLedgerDay. You MUST convert any relative or absolute dates mentioned by the user (like "14 june", "today", "yesterday") into the "YYYY-MM-DD" format relative to the current local time. Supply the customerName (e.g. "Sachin") and the formatted date.

ADD ENTRY RULES

If the user asks to add or modify a daily log entry (e.g., "add 1.5 litre of cow milk for Virat on 14 June", "record 2L buffalo milk delivery for Rohit today"):
- Use logDailyDelivery.
- Map the quantity to morningDelivered or eveningDelivered. If morning/evening is not specified, default to morningDelivered and set eveningDelivered to 0.
- Convert any relative or absolute dates mentioned by the user (like "14 june", "today", "yesterday") into "YYYY-MM-DD" format relative to current local time.
- Identify the item (e.g., "Cow Milk", "Buffalo Milk").

Tool Call Structure Example:
If user says: "add 2 litre of buffalo milk for Virat Kohli for date 17 June 2026"
Use:
logDailyDelivery
{
  "customerName": "Virat Kohli",
  "itemName": "Buffalo Milk",
  "dateStr": "2026-06-17",
  "morningDelivered": 2,
  "eveningDelivered": 0
}

Note: You MUST use the exact parameter names 'customerName', 'itemName', 'dateStr', 'morningDelivered', and 'eveningDelivered'. DO NOT use 'customer', 'item', 'deliveryDate', 'date', 'morning', or 'evening'.

AMBIGUITY RESOLUTION RULE:
- If any tool execution result returns an error with the code 'AMBIGUOUS_NAME', it means multiple customers matched the search name.
- You MUST ask the user to clarify by listing the candidates (with their names and mobile numbers) shown in the 'matches' field.
- Once the user chooses the correct customer, call the tool again using the corresponding 'customerId' from the candidate's object.

BULK LOG, DELETION & BILL DETAILS:
1. Bulk Log entries for a whole month:
   - When the user asks to do a bulk entry for a customer for a whole month (e.g. "do bulk entry for Hardik Pandya for June"), use bulkLogDailyDelivery.
   - If they specify dates to skip (e.g. "skip dates 3, 4, 5"), pass them as an array of numbers in 'skipDates'.
   - If year is not mentioned, it defaults to the current year 2026.
2. Delete entry:
   - When the user asks to delete a delivery entry on a specific date (e.g. "delete Virat Kohli entry for 15 June"), use deleteDailyDelivery.
   - Make sure to format date to YYYY-MM-DD.
3. Get bill details:
   - When the user asks for bill details of a month (e.g. "get June bill for Hardik Pandya"), use getCustomerBillDetails.
`

,

      messages: modelMessages,

      tools: {
        getCustomersList,
        getCustomerByName,
        getDashboardStats,
        createCustomer,
        updateCustomer,
        getCustomerLedger,
        getLedgerDay,
        logDailyDelivery,
        deleteDailyDelivery,
        bulkLogDailyDelivery,
        getCustomerBillDetails,
      },

      toolChoice: "auto",

    });

//     console.log("TEXT:");
// console.log(result.text);

// console.log("TOOLS:");
// console.dir(
//   result.toolResults,
//   { depth: null }
//);

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error(
      "🚨 BACKEND AI ERROR:",
      error
    );

    return Response.json(
      {
        error: "Backend Error",
      },
      {
        status: 500,
      }
    );
  }
}