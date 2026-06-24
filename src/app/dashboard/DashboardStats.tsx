// src/app/dashboard/DashboardStats.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// Hook for Number Counting Animation
function useCountUp(end: number, duration: number = 1500) {
  const [count, setCount] = useState(0);
 

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - percentage, 4);
      setCount(end * easeOutQuart);

      if (percentage < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return count;
}

export default function DashboardStats({ customers, items, balance, morningVol, eveningVol, itemDistribution, recentCustomers }: any) {
  const [currentTime, setCurrentTime] = useState(new Date());
   const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hour = currentTime.getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  const animCustomers = useCountUp(customers);
  const animItems = useCountUp(items);
  const animBalance = useCountUp(balance);
  const animMorning = useCountUp(morningVol);

  // Find max volume to scale the progress bars proportionally
  const maxVolume = Math.max(...itemDistribution.map((i:any) => i.total), 1);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Top Welcome Header with Live Clock */}
      <div className="rounded-3xl border border-white/40 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 p-6 sm:p-8 shadow-xl shadow-slate-100/30 dark:shadow-none backdrop-blur-3xl flex justify-between items-center transition-all duration-500 hover:shadow-slate-100/50">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            {greeting}, Admin 👋
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Here is your live enterprise overview.</p>
        </div>
        <div className="hidden sm:block text-right">
           <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tighter">
             {isMounted ? currentTime.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' }) : "00:00:00"}
           </p>
           <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
             {isMounted ? currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : "Loading date..."}
           </p>
         </div>
      </div>

      {/* --- 4 KPI CARDS --- */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="group rounded-3xl border border-white/40 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.02)] backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300/50 dark:hover:border-emerald-800/50 hover:shadow-lg hover:shadow-emerald-500/5 dark:hover:shadow-emerald-950/20 flex flex-col justify-between min-h-[120px]">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 transition-colors group-hover:text-slate-500">Total Subscribers</p>
          <p className="mt-3 text-4xl font-black text-emerald-600 dark:text-emerald-400 transition-transform duration-300 group-hover:scale-102 origin-left">{Math.floor(animCustomers)}</p>
        </div>
        <div className="group rounded-3xl border border-white/40 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.02)] backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:border-teal-300/50 dark:hover:border-teal-800/50 hover:shadow-lg hover:shadow-teal-500/5 dark:hover:shadow-teal-950/20 flex flex-col justify-between min-h-[120px]">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 transition-colors group-hover:text-slate-500">Inventory Catalog</p>
          <p className="mt-3 text-4xl font-black text-teal-600 dark:text-teal-400 transition-transform duration-300 group-hover:scale-102 origin-left">{Math.floor(animItems)}</p>
        </div>
        <div className="group rounded-3xl border border-white/40 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.02)] backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:border-blue-300/50 dark:hover:border-blue-800/50 hover:shadow-lg hover:shadow-blue-500/5 dark:hover:shadow-blue-950/20 flex flex-col justify-between min-h-[120px]">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 transition-colors group-hover:text-slate-500">Morning Vol Req.</p>
          <p className="mt-3 text-4xl font-black text-blue-600 dark:text-blue-450 transition-transform duration-300 group-hover:scale-102 origin-left">{animMorning.toFixed(1)}L</p>
        </div>
        <div className="group rounded-3xl border border-white/40 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.02)] backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:border-rose-300/50 dark:hover:border-rose-800/50 hover:shadow-lg hover:shadow-rose-500/5 dark:hover:shadow-rose-950/20 flex flex-col justify-between min-h-[120px]">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 transition-colors group-hover:text-slate-500">Outstanding Ledger</p>
          <p className="mt-3 text-4xl font-black text-rose-600 dark:text-rose-450 transition-transform duration-300 group-hover:scale-102 origin-left">₹{animBalance.toFixed(2)}</p>
        </div>
      </div>

      {/* --- BOTTOM SECTION: CHARTS & ACTIVITY --- */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 items-start">
        
        {/* LEFT PANEL: Product Distribution Bar Chart (CSS Based) */}
        <div className="lg:col-span-2 rounded-3xl border border-white/40 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 p-6 shadow-[0_8px_32px_0_rgba(148,163,184,0.04)] dark:shadow-none backdrop-blur-3xl transition-all duration-300 hover:shadow-[0_8px_32px_0_rgba(148,163,184,0.08)]">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-6">Product Subscription Distribution</h2>
          <div className="space-y-6">
            {itemDistribution.map((item: any) => {
              const widthPercentage = (item.total / maxVolume) * 100;
              return (
                <div key={item.id} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-bold text-slate-700 dark:text-slate-300">{item.name}</span>
                    <span className="font-black text-emerald-700 dark:text-emerald-400">{item.total.toFixed(1)} {item.unit}</span>
                  </div>
                  {/* Tailwind Progress Bar */}
                  <div className="h-2.5 w-full bg-slate-100/80 dark:bg-slate-800/80 rounded-full overflow-hidden flex border border-slate-200/10 dark:border-slate-700/30 shadow-inner">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(16,185,129,0.2)]" 
                      style={{ width: `${widthPercentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    <span>M: {item.morning.toFixed(1)}</span>
                    <span>E: {item.evening.toFixed(1)}</span>
                  </div>
                </div>
              );
            })}
            
            {itemDistribution.length === 0 && (
               <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-6">No active subscriptions found.</p>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: Recent Customers Activity Feed */}
        <div className="rounded-3xl border border-white/40 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 p-6 shadow-[0_8px_32px_0_rgba(148,163,184,0.04)] dark:shadow-none backdrop-blur-3xl transition-all duration-300 hover:shadow-[0_8px_32px_0_rgba(148,163,184,0.08)]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Recent Onboardings</h2>
            <Link href="/dashboard/customers" className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline">View All</Link>
          </div>
          <div className="space-y-4">
            {recentCustomers.map((customer: any) => (
              <div key={customer.id} className="flex items-center justify-between p-3 rounded-2xl bg-white/30 dark:bg-slate-900/30 hover:bg-white/75 dark:hover:bg-slate-950/40 transition-all duration-300 border border-white/30 dark:border-slate-800/30 hover:border-emerald-100/50 dark:hover:border-emerald-900/50 hover:shadow-sm group">
                <div className="flex items-center gap-3">
                  {/* Avatar Circle */}
                  <div className="h-10 w-10 flex items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-900/50 font-black text-sm uppercase transition-all group-hover:scale-105">
                    {customer.name.substring(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 transition-colors group-hover:text-emerald-700 dark:group-hover:text-emerald-400">{customer.name}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                      {new Date(customer.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-rose-500 dark:text-rose-450 text-emerald-600 dark:text-emerald-400">₹{customer.balance}</p>
                </div>
              </div>
            ))}

            {recentCustomers.length === 0 && (
               <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">No customers added yet.</p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}