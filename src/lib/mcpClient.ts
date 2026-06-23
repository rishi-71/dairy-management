export async function callMCP(
  tool: string,
  args?: Record<string, any>
) {
  const mcpUrl = process.env.MCP_SERVER_URL || "http://localhost:3001/mcp";
  const response = await fetch(
    mcpUrl,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        tool,
        args,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      "MCP request failed"
    );
  }

  return response.json();
}