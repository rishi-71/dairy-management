// src/app/api/chat/route.ts
import { google } from '@ai-sdk/google';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import prisma from '@/lib/prisma'; 

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const result = streamText({
      model: google('gemini-1.5-flash'),
      system: `You are the core AI Assistant for a Dairy SaaS Application. 
      You help the admin manage customers and view ledgers.`,
      messages,
      tools: {
        getCustomersList: tool({
          description: 'Get a list of all active customers and their balances.',
          parameters: z.object({}),
          execute: async () => {
            const customers = await prisma.customer.findMany({
              where: { isDeleted: false },
              select: { id: true, name: true, mobile: true, openingBalance: true }
            });
            return customers;
          },
        }),
      },
      maxSteps: 5, 
    });

    return result.toDataStreamResponse();
    
  } catch (error) {
    // 🚀 YEH TERMINAL MEIN ASLI ERROR BATAYEGA
    console.error("🚨 BACKEND AI ERROR:", error);
    return new Response(JSON.stringify({ error: "Backend crash ho gaya" }), { status: 500 });
  }
}