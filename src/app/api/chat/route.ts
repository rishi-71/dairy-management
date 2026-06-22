import { google } from "@ai-sdk/google";
import {
  streamText,
  convertToModelMessages,
  
} from "ai";


import { getCustomersList, getCustomerByName } from "@/ai/tools/customers";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const modelMessages =
      await convertToModelMessages(
        body.messages
      );

    const result = streamText({
       model: google("gemini-2.5-flash"),
      onStepFinish(step) {
  console.log("STEP:");
  console.dir(step, { depth: null });
},

onFinish(result) {
  console.log("FINAL RESULT:");
  console.dir(result, { depth: null });
},
     

     
system: `
You are Dairy AI Core.

You are connected to the dairy management database.

IMPORTANT RULES:

Whenever a user mentions a person's name,
ALWAYS check the customer database first.

Examples:

"Tell me about Virat Kohli"
→ use getCustomerByName

"Show Sachin details"
→ use getCustomerByName

"What is Rohit's balance?"
→ use getCustomerByName

"Show all customers"
→ use getCustomersList

Never assume a person is not a customer.
Always search the database first.

IMPORTANT:

When using getCustomerByName:

Example:

User:
"Show Virat Kohli details"

Tool Call:
{
  "name": "Virat Kohli"
}

User:
"Tell me about Sachin"

Tool Call:
{
  "name": "Sachin"
}

Always extract the person's name and pass it to the tool.
`,

      messages: modelMessages,

      tools: {
       getCustomersList,
       getCustomerByName,
      },

    });

    console.log("TEXT:");
console.log(result.text);

console.log("TOOLS:");
console.dir(
  result.toolResults,
  { depth: null }
);

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