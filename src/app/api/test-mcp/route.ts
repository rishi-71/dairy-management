import { callMCP } from "@/lib/mcpClient";

export async function GET() {
  const customers =
    await callMCP(
      "getCustomersList"
    );

  return Response.json(
    customers
  );
}