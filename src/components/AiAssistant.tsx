"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";

export default function AiAssistant() {
  const chat = useChat({
    api: "/api/chat",
  });

  const [input, setInput] = useState("");

  async function sendMessage() {
    if (!input.trim()) return;

    await chat.sendMessage({
      text: input,
    });

    setInput("");
  }

  return (
    <div className="p-4 border rounded-lg bg-white">
      <h2 className="text-xl font-bold mb-4">Dairy AI Core</h2>

      <div className="space-y-4 mb-4">
        {chat.messages.map((msg) => (
          <div key={msg.id}>
            <div className="font-bold mb-2 capitalize">{msg.role}</div>

            {msg.parts?.map((part, index) => {
              // Normal text response
              console.log("PART: ", part);
              console.log("PART TYPE:", part.type);
              if (part.type === "text") {
                return (
                  <p key={index} className="mb-2">
                    {part.text}
                  </p>
                );
              }

              if (part.type === "tool-getDashboardStats") {
  console.log("DASHBOARD PART:", part);

  // Tool is still executing
  if (part.state !== "output-available") {
    return (
      <div
        key={index}
        className="bg-purple-50 border p-3 rounded"
      >
        Loading dashboard stats...
      </div>
    );
  }

  const stats = part.output;

  return (
    <div
      key={index}
      className="bg-purple-50 border p-3 rounded"
    >
      <h3 className="font-bold mb-2">
        Dashboard Summary
      </h3>

      <div>
        Customers: {stats.totalCustomers}
      </div>

      <div>
        Products: {stats.totalItems}
      </div>

      <div>
        Morning Requirement:
        {" "}
        {stats.morningRequirement} L
      </div>

      <div>
        Outstanding Ledger:
        ₹{stats.outstandingLedger}
      </div>
    </div>
  );
}

if (
  part.type ===
  "tool-getOutstandingCustomers"
) {
  if (
    part.state !==
    "output-available"
  ) {
    return (
      <div
        key={index}
        className="bg-red-50 border p-3 rounded"
      >
        Loading outstanding customers...
      </div>
    );
  }

  return (
    <div
      key={index}
      className="bg-red-50 border border-red-200 p-3 rounded"
    >
      <h3 className="font-bold mb-2">
        Outstanding Customers
      </h3>

      {part.output.map(
        (customer: any, i: number) => (
          <div
            key={i}
            className="border-b py-2"
          >
            <div className="font-semibold">
              {customer.customerName}
            </div>

            <div>
              Month:
              {" "}
              {customer.monthYear}
            </div>

            <div className="text-red-600">
              Due:
              {" "}
              ₹
              {customer.dueAmount}
            </div>
          </div>
        )
      )}
    </div>
  );
}
              if (part.type === "tool-getCustomerByName") {
                const customer = part.output;

                if (!customer) {
                  return (
                    <div key={index} className="text-red-500">
                      Customer not found
                    </div>
                  );
                }

                if (part.type === "tool-getCustomerSubscriptions") {
                  return (
                    <div
                      key={index}
                      className="bg-yellow-50 border p-3 rounded"
                    >
                      <h3 className="font-bold">Subscriptions</h3>

                      {part.output?.map((sub: any) => (
                        <div key={sub.id}>
                          {sub.itemName} M:
                          {sub.morningQty} E:
                          {sub.eveningQty}
                        </div>
                      ))}
                    </div>
                  );
                }

                return (
                  <div
                    key={index}
                    className="bg-blue-50 border border-blue-200 p-3 rounded-lg"
                  >
                    <h3 className="font-bold mb-2">Customer Details</h3>

                    <div>
                      <b>Name:</b> {customer.name}
                    </div>

                    <div>
                      <b>Mobile:</b> {customer.mobile}
                    </div>

                    <div>
                      <b>Balance:</b> ₹{customer.openingBalance}
                    </div>

                    <div>
                      <b>Address:</b> {customer.address}
                    </div>

                    {customer.subscriptions?.length > 0 && (
                      <div className="mt-3">
                        <b>Subscriptions:</b>

                        {customer.subscriptions.map((sub: any) => (
                          <div key={sub.id} className="ml-3">
                            • {sub.itemName} (M:
                            {sub.morningQty} E:
                            {sub.eveningQty})
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              // Customer tool output
              if (part.type === "tool-getCustomersList") {
                return (
                  <div
                    key={index}
                    className="bg-green-50 border border-green-200 p-3 rounded-lg"
                  >
                    <h3 className="font-bold mb-3">Registered Customers</h3>

                    {part.output?.map((customer: any) => (
                      <div
                        key={customer.id}
                        className="border-b py-2 last:border-b-0"
                      >
                        <div className="font-semibold">{customer.name}</div>

                        <div className="text-sm text-gray-600">
                          📞 {customer.mobile}
                        </div>

                        <div className="text-sm text-green-700">
                          Balance: ₹{customer.openingBalance}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              }

              // Loading state while tool runs
              if (
                part.type === "tool-getCustomersList" &&
                part.state === "input-available"
              ) {
                return (
                  <div key={index} className="text-sm text-gray-500">
                    Fetching customer data...
                  </div>
                );
              }

              return null;
            })}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type message..."
          className="border p-2 flex-1 rounded"
        />

        <button
          onClick={sendMessage}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Send
        </button>
      </div>

      <div className="mt-4 text-sm">Status: {chat.status}</div>

      {chat.error && (
        <div className="text-red-500 mt-2">{chat.error.message}</div>
      )}
    </div>
  );
}
