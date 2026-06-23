// src/components/AiAssistant.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";

export default function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 🚀 AAPKI LOGIC: Vercel AI Chat Hook
  const chat = useChat({
    api: "/api/chat",
  });

  // 🚀 AAPKI LOGIC: Custom Input State
  const [input, setInput] = useState("");

  // Auto-scroll to bottom jab naya message aaye
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chat.messages, chat.status, isOpen]);

  // 🚀 AAPKI LOGIC: Send Message Function
  async function sendMessage(
    e?: React.FormEvent | React.KeyboardEvent | React.MouseEvent,
  ) {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    // Safety check: Vercel AI SDK usually uses `append`, but maintaining your logic structure safely
    try {
      if (chat.append) {
        await chat.append({ role: "user", content: input.trim() });
      } else if ((chat as any).sendMessage) {
        await (chat as any).sendMessage({ text: input.trim() });
      }
    } catch (err) {
      console.error("Failed to send:", err);
    }

    setInput("");
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* 🚀 BEAUTIFUL CHAT WINDOW */}
      {isOpen && (
        <div className="mb-4 w-[350px] sm:w-[420px] h-[600px] bg-slate-50 rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 fade-in duration-300">
          {/* HEADER */}
          <div className="bg-slate-900 p-4 flex justify-between items-center text-white shadow-md z-10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center animate-pulse shadow-[0_0_15px_rgba(52,211,153,0.5)]">
                <span className="text-lg">🥛</span>
              </div>
              <div>
                <h3 className="font-black text-[15px] tracking-widest uppercase">
                  Dairy AI Core
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={`w-2 h-2 rounded-full ${chat.status === "streaming" || chat.status === "submitted" ? "bg-emerald-400 animate-ping" : "bg-emerald-500"}`}
                  ></span>
                  <p className="text-[10px] text-emerald-400 font-bold tracking-wider uppercase">
                    Status: {chat.status || "Ready"}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white hover:bg-white/10 transition-colors rounded-full p-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* MESSAGES AREA */}
          <div className="flex-1 p-5 overflow-y-auto space-y-5">
            {/* Welcome Message */}
            {chat.messages.length === 0 && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl p-4 text-sm font-semibold shadow-sm bg-white text-slate-700 border border-slate-200 rounded-tl-sm">
                  Hello Admin! 👋 I am ready to fetch data from your database.
                </div>
              </div>
            )}

            {/* Error Message */}
            {chat.error && (
              <div className="bg-rose-100 border border-rose-200 text-rose-800 p-4 rounded-2xl font-bold text-xs shadow-sm">
                🚨 {chat.error.message}
              </div>
            )}

            {/* 🚀 AAPKI LOGIC: Mapping Messages & Parts */}
            {chat.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[90%] rounded-2xl p-4 text-sm shadow-sm ${msg.role === "user" ? "bg-emerald-600 text-white font-medium rounded-br-sm" : "bg-white text-slate-700 border border-slate-200 rounded-tl-sm"}`}
                >
                  {msg.parts?.map((part: any, index: number) => {
                    // 1. STANDARD TEXT
                    if (part.type === "text") {
                      return (
                        <div
                          key={index}
                          className="whitespace-pre-wrap leading-relaxed"
                        >
                          {part.text}
                        </div>
                      );
                    }

                    // 2. TOOL: GET CUSTOMER BY NAME
                    if (part.type === "tool-getCustomerByName") {
                      if (part.state !== "output-available") {
                        return (
                          <LoadingTool
                            key={index}
                            text="Searching customer details..."
                          />
                        );
                      }
                      const customer = part.output;
                      if (!customer)
                        return (
                          <ErrorTool key={index} text="Customer not found" />
                        );

                      return (
                        <div
                          key={index}
                          className="mt-3 bg-slate-50 border border-emerald-100 rounded-xl p-4 shadow-sm"
                        >
                          <h3 className="font-black text-emerald-800 border-b border-emerald-100 pb-2 mb-3 flex items-center gap-2">
                            👤 Customer Details
                          </h3>
                          <div className="space-y-2 text-sm">
                            <p>
                              <span className="text-slate-400 font-bold w-20 inline-block">
                                Name:
                              </span>{" "}
                              <span className="font-semibold text-slate-800">
                                {customer.name}
                              </span>
                            </p>
                            <p>
                              <span className="text-slate-400 font-bold w-20 inline-block">
                                Mobile:
                              </span>{" "}
                              <span className="font-semibold text-slate-800">
                                {customer.mobile}
                              </span>
                            </p>
                            <p>
                              <span className="text-slate-400 font-bold w-20 inline-block">
                                Balance:
                              </span>{" "}
                              <span className="font-bold text-rose-600">
                                ₹{customer.openingBalance}
                              </span>
                            </p>
                            <p>
                              <span className="text-slate-400 font-bold w-20 inline-block">
                                Address:
                              </span>{" "}
                              <span className="text-slate-700">
                                {customer.address}
                              </span>
                            </p>
                          </div>

                          {customer.subscriptions?.length > 0 && (
                            <div className="mt-4 pt-3 border-t border-emerald-100">
                              <span className="text-xs font-black text-emerald-600 uppercase tracking-wider mb-2 block">
                                Active Subscriptions
                              </span>
                              <div className="space-y-2">
                                {customer.subscriptions.map((sub: any) => (
                                  <div
                                    key={sub.id}
                                    className="bg-white border border-slate-200 rounded-lg p-2 flex justify-between items-center shadow-sm"
                                  >
                                    <span className="font-bold text-slate-700">
                                      {sub.itemName}
                                    </span>
                                    <div className="flex gap-2 text-xs font-bold">
                                      <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded">
                                        M: {sub.morningQty}
                                      </span>
                                      <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded">
                                        E: {sub.eveningQty}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    }

                    // 3. TOOL: GET CUSTOMERS LIST
                    if (part.type === "tool-getCustomersList") {
                      if (part.state !== "output-available") {
                        return (
                          <LoadingTool
                            key={index}
                            text="Loading all customers..."
                          />
                        );
                      }
                      return (
                        <div
                          key={index}
                          className="mt-3 bg-white border border-emerald-200 rounded-xl overflow-hidden shadow-sm"
                        >
                          <div className="bg-emerald-50 px-4 py-3 border-b border-emerald-100">
                            <h3 className="font-black text-emerald-800 flex items-center gap-2">
                              👥 Customer Directory
                            </h3>
                          </div>
                          <div className="max-h-[250px] overflow-y-auto divide-y divide-slate-100">
                            {part.output?.map((customer: any) => (
                              <div
                                key={customer.id}
                                className="p-3 hover:bg-slate-50 transition-colors flex justify-between items-center"
                              >
                                <div>
                                  <div className="font-bold text-slate-800">
                                    {customer.name}
                                  </div>
                                  <div className="text-xs text-slate-500 font-medium tracking-wide">
                                    📞 {customer.mobile}
                                  </div>
                                </div>
                                <div className="font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                                  ₹{customer.openingBalance}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }

                    // 4. TOOL: GET DASHBOARD STATS
                    if (part.type === "tool-getDashboardStats") {
                      if (part.state !== "output-available") {
                        return (
                          <LoadingTool
                            key={index}
                            text="Calculating live statistics..."
                          />
                        );
                      }
                      const stats = part.output;
                      return (
                        <div
                          key={index}
                          className="mt-3 bg-slate-900 rounded-xl p-4 shadow-md text-white"
                        >
                          <h3 className="font-black text-emerald-400 border-b border-slate-700 pb-2 mb-3 flex items-center gap-2">
                            📊 Live Dashboard Stats
                          </h3>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                Customers
                              </p>
                              <p className="text-xl font-black text-white">
                                {stats.totalCustomers}
                              </p>
                            </div>
                            <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                Products
                              </p>
                              <p className="text-xl font-black text-white">
                                {stats.totalItems}
                              </p>
                            </div>
                            <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 col-span-2 flex justify-between items-center">
                              <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                  Morning Req.
                                </p>
                                <p className="text-lg font-black text-amber-400">
                                  {stats.morningRequirement} Liters
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                  Total Ledger
                                </p>
                                <p className="text-lg font-black text-emerald-400">
                                  ₹{stats.outstandingLedger}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    // 5. TOOL: CREATE CUSTOMER
                    if (part.type === "tool-createCustomer") {
                      if (part.state !== "output-available") {
                        return (
                          <LoadingTool
                            key={index}
                            text="Registering new customer..."
                          />
                        );
                      }
                      const customer = part.output;
                      return (
                        <div
                          key={index}
                          className="mt-3 bg-emerald-50 border border-emerald-300 rounded-xl p-4 shadow-sm"
                        >
                          <h3 className="font-black text-emerald-700 flex items-center gap-2 mb-2">
                            ✅ Successfully Registered
                          </h3>
                          <div className="text-sm text-emerald-900 space-y-1 bg-white p-3 rounded-lg border border-emerald-100">
                            <p>
                              <b>Name:</b> {customer.name}
                            </p>
                            <p>
                              <b>Mobile:</b> {customer.mobile}
                            </p>
                            <p>
                              <b>Address:</b> {customer.address}
                            </p>
                          </div>
                        </div>
                      );
                    }

                    if (part.type === "tool-updateCustomer") {
                      if (part.state !== "output-available") {
                        return (
                          <LoadingTool
                            key={index}
                            text="Updating customer..."
                          />
                        );
                      }

                      const customer = part.output;

                      return (
                        <div
                          key={index}
                          className="mt-3 bg-blue-50 border border-blue-200 rounded-xl p-4"
                        >
                          <h3 className="font-black text-blue-700 mb-3">
                            ✏️ Customer Updated
                          </h3>

                          <div className="space-y-1">
                            <p>
                              <b>Name:</b> {customer.name}
                            </p>

                            <p>
                              <b>Mobile:</b> {customer.mobile}
                            </p>

                            <p>
                              <b>Address:</b> {customer.address}
                            </p>

                            <p>
                              <b>Balance:</b>₹{customer.openingBalance}
                            </p>
                          </div>
                        </div>
                      );
                    }

                    if (part.type === "tool-getCustomerLedger") {
                      if (part.state !== "output-available") {
                        return (
                          <LoadingTool key={index} text="Loading ledger..." />
                        );
                      }

                      const ledger = part.output;

                      return (
                        <div
                          key={index}
                          className="mt-3 bg-white border rounded-xl p-4"
                        >
                          <h3 className="font-black mb-3">
                            📒 Customer Ledger
                          </h3>

                          <div className="mb-4">
                            <div>
                              <b>{ledger.customer.name}</b>
                            </div>

                            <div>{ledger.customer.mobile}</div>
                          </div>

                          <div className="space-y-2 max-h-64 overflow-y-auto">
                            {ledger.dailyLogs
                              ?.slice(0, 10)
                              .map((log: any, i: number) => (
                                <div key={i} className="border rounded p-2">
                                  <div>{log.dateStr}</div>

                                  <div>{log.itemName}</div>

                                  <div>
                                    M:
                                    {log.morningDelivered}
                                  </div>

                                  <div>
                                    E:
                                    {log.eveningDelivered}
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      );
                    }

                    if (part.type === "tool-getOutstandingCustomers") {
                      if (part.state !== "output-available") {
                        return (
                          <LoadingTool
                            key={index}
                            text="Checking outstanding balances..."
                          />
                        );
                      }

                      return (
                        <div
                          key={index}
                          className="mt-3 bg-red-50 border border-red-200 rounded-xl overflow-hidden"
                        >
                          <div className="bg-red-100 px-4 py-3">
                            <h3 className="font-black text-red-800">
                              💰 Outstanding Customers
                            </h3>
                          </div>

                          <div className="divide-y">
                            {part.output?.map((customer: any, i: number) => (
                              <div key={i} className="p-3 flex justify-between">
                                <div>
                                  <div className="font-bold">
                                    {customer.customerName}
                                  </div>

                                  <div className="text-xs text-gray-500">
                                    {customer.monthYear}
                                  </div>
                                </div>

                                <div className="font-black text-red-600">
                                  ₹{customer.dueAmount}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }

                    if (part.type === "tool-getLedgerDay") {
                      if (part.state !== "output-available") {
                        return (
                          <LoadingTool key={index} text="Loading ledger..." />
                        );
                      }

                      const output = part.output;

                      if (output.error) {
                        return (
                          <ErrorTool key={index} text={output.error} />
                        );
                      }

                      const hasLogs = output.logs && output.logs.length > 0;
                      const hasExtras = output.extras && output.extras.length > 0;

                      if (!hasLogs && !hasExtras) {
                        return (
                          <div
                            key={index}
                            className="mt-3 bg-slate-50 border border-slate-200 rounded-xl p-4 text-center text-slate-500 font-bold text-xs"
                          >
                            📅 No ledger entries found for <b>{output.customerName || "Customer"}</b> on <b>{output.dateStr}</b>.
                          </div>
                        );
                      }

                      return (
                        <div
                          key={index}
                          className="mt-3 bg-slate-50 border border-emerald-100 rounded-xl p-4 shadow-sm w-full"
                        >
                          <h3 className="font-black text-emerald-800 border-b border-emerald-100 pb-2 mb-2 flex items-center gap-2">
                            📅 Ledger Day ({output.dateStr})
                          </h3>
                          <div className="text-[10px] font-black text-slate-400 mb-3 uppercase tracking-wider">
                            Customer: {output.customerName}
                          </div>

                          {hasLogs && (
                            <div className="mb-3">
                              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider mb-1 block">
                                Milk Entries
                              </span>
                              <div className="space-y-1.5">
                                {output.logs.map((log: any, i: number) => (
                                  <div
                                    key={i}
                                    className="bg-white border border-slate-200 rounded-lg p-2 flex justify-between items-center shadow-sm text-xs font-semibold text-slate-700"
                                  >
                                    <span>{log.itemName}</span>
                                    <div className="flex gap-1.5 font-bold">
                                      {log.morningDelivered > 0 && (
                                        <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                                          M: {log.morningDelivered}
                                        </span>
                                      )}
                                      {log.eveningDelivered > 0 && (
                                        <span className="bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded">
                                          E: {log.eveningDelivered}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {hasExtras && (
                            <div>
                              <span className="text-[10px] font-black text-amber-600 uppercase tracking-wider mb-1 block">
                                Extra Items
                              </span>
                              <div className="space-y-1.5">
                                {output.extras.map((item: any, i: number) => (
                                  <div
                                    key={i}
                                    className="bg-white border border-slate-200 rounded-lg p-2 flex justify-between items-center shadow-sm text-xs font-semibold text-slate-700"
                                  >
                                    <span>{item.itemName}</span>
                                    <span className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded font-bold">
                                      Qty: {item.quantity}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    }

                    if (part.type === "tool-logDailyDelivery") {
                      if (part.state !== "output-available") {
                        return (
                          <LoadingTool key={index} text="Logging delivery..." />
                        );
                      }

                      const output = part.output;

                      if (!output.success) {
                        return (
                          <ErrorTool key={index} text={output.error || "Failed to log delivery"} />
                        );
                      }

                      const log = output.log;

                      return (
                        <div
                          key={index}
                          className="mt-3 bg-emerald-50 border border-emerald-300 rounded-xl p-4 shadow-sm w-full animate-in zoom-in-95 duration-200"
                        >
                          <h3 className="font-black text-emerald-800 flex items-center gap-2 mb-2">
                            ✅ {output.message}
                          </h3>
                          <div className="text-sm bg-white p-3 rounded-lg border border-emerald-100 space-y-1.5 font-semibold text-slate-700">
                            <p>
                              <span className="text-slate-400 text-xs font-bold inline-block w-20">Customer:</span>
                              <span className="text-slate-800">{log.customerName}</span>
                            </p>
                            <p>
                              <span className="text-slate-400 text-xs font-bold inline-block w-20">Product:</span>
                              <span className="text-slate-800">{log.itemName}</span>
                            </p>
                            <p>
                              <span className="text-slate-400 text-xs font-bold inline-block w-20">Date:</span>
                              <span className="text-slate-800">{log.dateStr}</span>
                            </p>
                            <p>
                              <span className="text-slate-400 text-xs font-bold inline-block w-20">Morning:</span>
                              <span className={log.morningDelivered > 0 ? "text-amber-600 font-bold" : "text-slate-500"}>
                                {log.morningDelivered} Liters
                              </span>
                            </p>
                            <p>
                              <span className="text-slate-400 text-xs font-bold inline-block w-20">Evening:</span>
                              <span className={log.eveningDelivered > 0 ? "text-indigo-600 font-bold" : "text-slate-500"}>
                                {log.eveningDelivered} Liters
                              </span>
                            </p>
                          </div>
                        </div>
                      );
                    }

                    return null;
                  })}
                </div>
              </div>
            ))}

            {/* Waiting for AI response indicator */}
            {chat.status === "submitted" && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm p-4 shadow-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-75"></span>
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-150"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 🚀 AAPKI LOGIC: Input Area wrapped in UI */}
          <div className="p-4 bg-white border-t border-slate-100">
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Ask Dairy AI..."
                disabled={
                  chat.status === "submitted" || chat.status === "streaming"
                }
                className="w-full bg-slate-100 text-slate-800 font-bold text-sm rounded-xl py-3.5 pl-4 pr-12 outline-none focus:ring-2 focus:ring-emerald-500/30 disabled:opacity-50 transition-all"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || chat.status === "submitted"}
                className="absolute right-2 p-2 bg-emerald-600 text-white rounded-lg disabled:opacity-50 hover:bg-emerald-700 hover:-translate-y-0.5 transition-all shadow-md"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M5 12h14M12 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING TOGGLE BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-full shadow-[0_10px_25px_rgba(16,185,129,0.4)] flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 z-50 relative ${isOpen ? "bg-slate-800 rotate-90 shadow-slate-900/40" : "bg-gradient-to-r from-emerald-500 to-teal-600"}`}
      >
        {isOpen ? (
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <span className="text-3xl">🥛</span>
        )}
      </button>
    </div>
  );
}

// 🚀 Helper Components for clean UI
function LoadingTool({ text }: { text: string }) {
  return (
    <div className="mt-3 text-xs text-slate-400 font-bold flex items-center gap-2 animate-pulse bg-slate-50 p-3 rounded-lg border border-slate-100">
      <svg
        className="w-4 h-4 animate-spin text-emerald-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
      {text}
    </div>
  );
}

function ErrorTool({ text }: { text: string }) {
  return (
    <div className="mt-3 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 p-3 rounded-lg flex items-center gap-2">
      <svg
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      {text}
    </div>
  );
}
