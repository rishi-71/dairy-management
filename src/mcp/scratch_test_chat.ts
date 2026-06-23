import dotenv from "dotenv";
dotenv.config();

async function main() {
  console.log("Sending chat request to Next.js API with parts array...");
  try {
    const response = await fetch("http://localhost:3000/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          {
            id: "msg-12345",
            role: "user",
            content: "add 2 litre of buffalo milk for virat kohli for date 17 june 2026",
            parts: [
              {
                type: "text",
                text: "add 2 litre of buffalo milk for virat kohli for date 17 june 2026"
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("No body reader found");
    }

    const decoder = new TextDecoder();
    let done = false;
    let text = "";

    console.log("--- CHAT RESPONSE STREAM START ---");
    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;
      if (value) {
        const chunk = decoder.decode(value, { stream: !done });
        text += chunk;
        process.stdout.write(chunk);
      }
    }
    console.log("\n--- CHAT RESPONSE STREAM END ---");
  } catch (error) {
    console.error("Chat API Test failed:", error);
  }
}

main();
