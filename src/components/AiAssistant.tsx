"use client";
import { useEffect, useRef, useState } from "react";

export default function AiAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");

    const [messages, setMessages] = useState([
        { role: 'ai', content: "Hello Admin! I am your Dairy AI Assistant. You can ask me to fetch ledgers, update daily entries, or generate bills."}
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth"});
    }, [messages, isTyping]);

    const handleSend = (e?: React.FormEvent) =>{
        e?.preventDefault();
        if(!input.trim()) return;

        const userMsg = input.trim();
        setMessages((prev) => [...prev, { role: "user", content: userMsg}]);
        setInput("");
        setIsTyping(true);

        setTimeout(()=> {
            setMessages((prev) => [...prev, {
                role: "ai",
                content: `Mera backend abhi MCP server se connect nhi h, par maine aapka message sun liya : "${userMsg}`
            }]);
            setIsTyping(false);

        }, 1500);
    };
    return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* CHAT WINDOW (Jab open ho tabhi dikhegi) */}
      {isOpen && (
        <div className="mb-4 w-[350px] sm:w-[400px] h-[500px] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 fade-in duration-300">
          
          {/* Header */}
          <div className="bg-slate-900 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center animate-pulse">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <div>
                <h3 className="font-black text-sm tracking-widest uppercase">Dairy AI Core</h3>
                <p className="text-[10px] text-emerald-400 font-bold">MCP Client Ready</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl p-3 text-sm font-semibold shadow-sm ${msg.role === "user" ? "bg-emerald-600 text-white rounded-br-none" : "bg-white text-slate-700 border border-slate-200 rounded-bl-none"}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            
            {/* AI Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 text-slate-400 rounded-2xl rounded-bl-none p-3 shadow-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce delay-75"></span>
                  <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce delay-150"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-slate-100">
            <form onSubmit={handleSend} className="relative flex items-center">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask AI to update records..."
                className="w-full bg-slate-100 text-slate-700 font-semibold text-sm rounded-xl py-3 pl-4 pr-12 outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
              <button type="submit" disabled={!input.trim()} className="absolute right-2 p-1.5 bg-emerald-600 text-white rounded-lg disabled:opacity-50 hover:bg-emerald-700 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M12 5l7 7-7 7" /></svg>
              </button>
            </form>
          </div>

        </div>
      )}

      {/* FLOATING TOGGLE BUTTON */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 ${isOpen ? 'bg-slate-800' : 'bg-gradient-to-r from-emerald-500 to-teal-600'}`}
      >
        {isOpen ? (
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
          <svg className="w-7 h-7 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
        )}
      </button>

    </div>
  );


}