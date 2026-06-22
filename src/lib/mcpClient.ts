export async function callMCP(
  tool: string,
  args?: Record<string, any>
) {
  const response = await fetch(
    "http://localhost:3001/mcp",
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