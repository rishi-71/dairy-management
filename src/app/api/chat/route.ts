import { google } from "@ai-sdk/google";
import {
  streamText,
  convertToModelMessages,
  tool,
} from "ai";
import { z } from "zod";
import prisma from "@/lib/prisma";

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

      system: `
You are Dairy AI Core.

You help dairy administrators.

IMPORTANT:

Whenever a tool returns data:

1. Analyze the tool result.
2. Generate a human-readable response.
3. Never stop after tool execution.
4. Summarize results in a friendly format.

Example:

User:
Show customers

Response:

You currently have 4 registered customers:

1. Sachin Tendulkar
   Mobile: 9988776655
   Balance: ₹516

2. Virat Kohli
   Mobile: 8877665544
   Balance: ₹1200
      `,

      messages: modelMessages,

      tools: {
        getCustomersList: tool({
          description:
            "Get all active customers",

          parameters: z.object({}),

          execute: async () => {
            console.log(
              "🔥 TOOL CALLED"
            );

            const customers =
              await prisma.customer.findMany({
                where: {
                  isDeleted: false,
                },
                select: {
                  id: true,
                  name: true,
                  mobile: true,
                  openingBalance: true,
                },
              });

            return customers;
          },
        }),
      },

      maxSteps: 10,
    });

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