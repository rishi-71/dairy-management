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
  
  useEffect(() => {
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
      <div className="rounded-3xl border border-white/60 bg-white/70 p-6 sm:p-8 shadow-lg shadow-emerald-950/5 backdrop-blur-xl flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            {greeting}, Admin 👋
          </h1>
          <p className="mt-2 text-sm text-slate-600">Here is your live enterprise overview.</p>
        </div>
        <div className="hidden sm:block text-right">
          <p className="text-2xl font-black text-emerald-600 tracking-tighter">
            {currentTime.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute:'2-digit', second:'2-digit' })}
          </p>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
            {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* --- 4 KPI CARDS --- */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="group rounded-3xl border border-white/60 bg-white/70 p-6 shadow-md backdrop-blur-xl transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-900/10 flex flex-col justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Subscribers</p>
          <p className="mt-3 text-4xl font-black text-emerald-600">{Math.floor(animCustomers)}</p>
        </div>
        <div className="group rounded-3xl border border-white/60 bg-white/70 p-6 shadow-md backdrop-blur-xl transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-teal-900/10 flex flex-col justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Inventory Catalog</p>
          <p className="mt-3 text-4xl font-black text-teal-600">{Math.floor(animItems)}</p>
        </div>
        <div className="group rounded-3xl border border-white/60 bg-white/70 p-6 shadow-md backdrop-blur-xl transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-900/10 flex flex-col justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Morning Vol Req.</p>
          <p className="mt-3 text-4xl font-black text-blue-600">{animMorning.toFixed(1)}L</p>
        </div>
        <div className="group rounded-3xl border border-white/60 bg-white/70 p-6 shadow-md backdrop-blur-xl transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-rose-900/10 flex flex-col justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Outstanding Ledger</p>
          <p className="mt-3 text-4xl font-black text-rose-600">₹{animBalance.toFixed(2)}</p>
        </div>
      </div>

      {/* --- BOTTOM SECTION: CHARTS & ACTIVITY --- */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 items-start">
        
        {/* LEFT PANEL: Product Distribution Bar Chart (CSS Based) */}
        <div className="lg:col-span-2 rounded-3xl border border-white/60 bg-white/70 p-6 shadow-lg backdrop-blur-xl">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Product Subscription Distribution</h2>
          <div className="space-y-6">
            {itemDistribution.map((item: any) => {
              const widthPercentage = (item.total / maxVolume) * 100;
              return (
                <div key={item.id} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-bold text-slate-700">{item.name}</span>
                    <span className="font-black text-emerald-700">{item.total.toFixed(1)} {item.unit}</span>
                  </div>
                  {/* Tailwind Progress Bar */}
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: `${widthPercentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <span>M: {item.morning.toFixed(1)}</span>
                    <span>E: {item.evening.toFixed(1)}</span>
                  </div>
                </div>
              );
            })}
            
            {itemDistribution.length === 0 && (
               <p className="text-sm text-slate-500 text-center py-6">No active subscriptions found.</p>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: Recent Customers Activity Feed */}
        <div className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-lg backdrop-blur-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-900">Recent Onboardings</h2>
            <Link href="/dashboard/customers" className="text-xs font-bold text-emerald-600 hover:underline">View All</Link>
          </div>
          <div className="space-y-4">
            {recentCustomers.map((customer: any) => (
              <div key={customer.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/50 hover:bg-white transition-colors border border-transparent hover:border-slate-100">
                <div className="flex items-center gap-3">
                  {/* Avatar Circle */}
                  <div className="h-10 w-10 flex items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-black text-sm uppercase">
                    {customer.name.substring(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{customer.name}</p>
                    <p className="text-xs text-slate-400 font-medium">
                      {new Date(customer.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-rose-500">₹{customer.balance}</p>
                </div>
              </div>
            ))}

            {recentCustomers.length === 0 && (
               <p className="text-sm text-slate-500 text-center py-4">No customers added yet.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}