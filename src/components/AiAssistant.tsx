// src/components/AiAssistant.tsx
"use client";

import { useState, useRef, useEffect } from "react";
// 🚀 THE CORRECT IMPORT: Official React SDK
import { useChat } from "@ai-sdk/react"; 

export default function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Vercel ka official useChat hook
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/chat'
  });

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, isOpen]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {isOpen && (
        <div className="mb-4 w-[350px] sm:w-[400px] h-[550px] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 fade-in duration-300">
          
          {/* Header */}
          <div className="bg-slate-900 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center animate-pulse shadow-lg">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <div>
                <h3 className="font-black text-sm tracking-widest uppercase">Dairy AI Core</h3>
                <p className="text-[10px] text-emerald-400 font-bold tracking-wider">Powered by Gemini</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors bg-white/10 rounded-full p-1.5">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-5 overflow-y-auto bg-slate-50 space-y-4">
            
            {error && (
              <div className="bg-rose-100 border border-rose-200 text-rose-800 p-4 rounded-2xl font-bold text-xs shadow-sm">
                🚨 API Error: {error.message}
              </div>
            )}

            {messages.length === 0 && !error && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl p-3.5 text-sm font-semibold shadow-sm bg-white text-slate-700 border border-slate-200 rounded-tl-sm">
                  Hello Admin! 👋 I am connected to your database. Try asking:<br/><br/>
                  <span className="text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md block mt-1">"Who are my registered customers?"</span>
                </div>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div key={msg.id || idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl p-3.5 text-sm shadow-sm ${msg.role === "user" ? "bg-emerald-600 text-white font-semibold rounded-br-sm" : "bg-white text-slate-700 font-medium border border-slate-200 rounded-tl-sm"}`}>
                  
                  {msg.toolInvocations && msg.toolInvocations.length > 0 ? (
                     <div className="text-xs text-slate-400 font-bold flex items-center gap-2 animate-pulse">
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        Fetching database tools...
                     </div>
                  ) : (
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  )}

                </div>
              </div>
            ))}
            
            {isLoading && messages[messages.length - 1]?.role !== 'ai' && (
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

          {/* 🚀 OFFICIAL SAFE INPUT AREA */}
          <div className="p-4 bg-white border-t border-slate-100">
            <form onSubmit={handleSubmit} className="relative flex items-center">
              <input 
                name="prompt"
                type="text" 
                value={input || ""} 
                onChange={(e) => {
                  if (typeof handleInputChange === 'function') {
                    handleInputChange(e);
                  }
                }}
                placeholder="Type your command..."
                disabled={isLoading}
                className="w-full bg-slate-100 text-slate-800 font-bold text-sm rounded-xl py-3.5 pl-4 pr-12 outline-none focus:ring-2 focus:ring-emerald-500/30 disabled:opacity-50 transition-all"
              />
              <button 
                type="submit" 
                disabled={!input || input.trim() === "" || isLoading} 
                className="absolute right-2 p-2 bg-emerald-600 text-white rounded-lg disabled:opacity-50 hover:bg-emerald-700 hover:-translate-y-0.5 transition-all shadow-md"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 12h14M12 5l7 7-7 7" /></svg>
              </button>
            </form>
          </div>

        </div>
      )}

      {/* FLOATING TOGGLE BUTTON */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-full shadow-[0_10px_25px_rgba(16,185,129,0.4)] flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 z-50 relative ${isOpen ? 'bg-slate-800 rotate-90 shadow-slate-900/40' : 'bg-gradient-to-r from-emerald-500 to-teal-600'}`}
      >
        {isOpen ? (
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
        )}
      </button>

    </div>
  );
}