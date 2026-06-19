// src/app/dashboard/ledger/LedgerSelector.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LedgerSelector({ customers }: { customers: any[] }) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleSelect = (customerId: string) => {
    setIsNavigating(true);
    // Jaise hi select hoga, yeh automatically aapko aapke purane mast wale Ledger page par le jayega
    router.push(`/dashboard/customers/${customerId}/ledger`);
  };

  return (
    <div className="rounded-3xl border border-white/60 bg-white/50 p-12 shadow-lg backdrop-blur-xl flex flex-col items-center justify-center min-h-[50vh] border-dashed relative overflow-hidden">
      
      {/* Loading Overlay when routing */}
      {isNavigating && (
        <div className="absolute inset-0 z-20 bg-white/60 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200">
           <div className="flex flex-col items-center gap-3">
             <svg className="w-10 h-10 text-emerald-600 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
             <p className="text-sm font-bold text-slate-700 animate-pulse tracking-widest uppercase">Opening Ledger...</p>
           </div>
        </div>
      )}

      <div className="bg-emerald-100 p-6 rounded-full mb-6 shadow-inner border border-emerald-200">
        <svg className="w-16 h-16 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      </div>
      
      <h2 className="text-2xl font-black text-slate-800 mb-2">Access Customer Ledger</h2>
      <p className="text-slate-500 font-medium mb-8 max-w-md text-center">
        Choose a customer from the list below to access their full delivery history, manage records, and track their monthly totals.
      </p>

      {/* Modern Select Input */}
      <div className="w-full max-w-md relative group z-10">
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
           <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
        <select 
          onChange={(e) => handleSelect(e.target.value)} 
          defaultValue=""
          className="block w-full pl-12 pr-10 py-4 text-base font-bold text-slate-700 bg-white border-2 border-slate-200 rounded-2xl appearance-none focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 hover:border-emerald-300 transition-all cursor-pointer shadow-sm"
        >
          <option value="" disabled>-- Search & Select a Customer --</option>
          {customers.map(c => (
            <option key={c.id} value={c.id}>{c.name} ({c.mobile})</option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
          <svg className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
        </div>
      </div>

    </div>
  );
}