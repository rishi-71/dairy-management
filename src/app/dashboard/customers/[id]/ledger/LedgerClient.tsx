"use client";

import { useState, useEffect  } from "react";
import { getMonthlyLedger } from "@/actions/ledgerActions";
import Link from "next/link";

export default function LedgerClient({ customer }: { customer: any}) {
    const today = new Date();
    const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [ledgerData, setLedgerData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [monthlyTotal, setMonthlyTotal] = useState(0);

    useEffect(() => {
        loadLedger();
    }, [selectedMonth]);

    const loadLedger = async () => {
        setIsLoading(true);
        try {
            const response = await getMonthlyLedger(customer.id, selectedMonth);

            const daysArray = Array.from({ length: response.lastDay },(_, i) => {
                const dayNum = String(i + 1).padStart(2, '0');
                return `${selectedMonth}-${dayNum}`;
            } );

            let grandTotal = 0;

            const mappedLedger = daysArray.map(dateStr => {
                const dayLogs = response.dailyLogs.filter((log: any) => log.dateStr === dateStr);
                const dayExtras = response.extraLogs.filter((ext: any) => ext.dateStr === dateStr);

                let dayTotalAmount = 0;

                dayLogs.forEach((log: any) => {
                    dayTotalAmount  += (log.morningDelivered + log.eveningDelivered) * log.price;
                });

                dayExtras.forEach((ext: any) => {
                    dayTotalAmount += ext.quantity * ext.price;
                })

                grandTotal += dayTotalAmount;

                return {
                    dateStr,
                    logs: dayLogs,
                    extras: dayExtras,
                    totalAmount : dayTotalAmount
                };
            });

            setLedgerData(mappedLedger);
            setMonthlyTotal(grandTotal);
        } catch (error) {
            console.error("Error loading ledger: ", error);
        }

        setIsLoading(false);
    };

    return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center rounded-3xl border border-white/60 bg-white/70 p-6 shadow-lg backdrop-blur-xl gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Account Ledger
          </h1>
          <p className="mt-1 flex items-center gap-2 text-sm font-bold text-emerald-700">
            <span className="bg-emerald-100 px-2 py-1 rounded-md">{customer.name}</span>
            <span className="text-slate-500 font-medium">({customer.mobile})</span>
          </p>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
          <label className="text-sm font-bold text-slate-700 pl-2">Select Month:</label>
          <input 
            type="month" 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border-none bg-slate-50 text-slate-900 font-bold px-3 py-2 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
          />
        </div>
      </div>

      {/* Ledger Grid */}
      <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-xl backdrop-blur-xl overflow-hidden">
        
        <div className="flex justify-between items-center mb-4 px-2">
          <h2 className="text-lg font-black text-slate-800">Monthly Statement</h2>
          <div className="text-right">
            <p className="text-xs font-bold text-slate-400 uppercase">Monthly Bill Estimate</p>
            <p className="text-2xl font-black text-rose-600">₹{monthlyTotal.toFixed(2)}</p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200/60 shadow-sm max-h-[60vh]">
          <table className="min-w-full divide-y divide-slate-200/60 relative">
            <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Date</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Primary Subscriptions</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Extra Items</th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Daily Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-slate-500 font-bold animate-pulse">Calculating Ledger Data...</td>
                </tr>
              ) : (
                ledgerData.map((day, idx) => {
                  const dayNum = day.dateStr.split('-')[2];
                  const hasData = day.logs.length > 0 || day.extras.length > 0;
                  
                  return (
                    <tr key={day.dateStr} className={`transition-colors hover:bg-slate-50/80 ${hasData ? 'bg-white' : 'bg-slate-50/30 opacity-70'}`}>
                      {/* Date Column */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-lg font-black text-slate-800">{dayNum}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">
                            {new Date(day.dateStr).toLocaleDateString('en-US', { weekday: 'short' })}
                          </span>
                        </div>
                      </td>
                      
                      {/* Subscriptions Column */}
                      <td className="px-6 py-4">
                        {day.logs.length === 0 ? <span className="text-xs text-slate-400">-</span> : (
                          <div className="space-y-1.5">
                            {day.logs.map((log: any) => (
                              <div key={log.id} className="text-xs font-semibold text-slate-700 bg-emerald-50 border border-emerald-100 rounded-md px-2 py-1 inline-block mr-2">
                                <span className="text-emerald-800 font-black">{log.itemName}</span> 
                                <span className="mx-1 opacity-50">|</span> 
                                M: {log.morningDelivered}L, E: {log.eveningDelivered}L 
                                <span className="text-[9px] text-emerald-600/70 ml-1">(₹{log.price})</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Extra Items Column */}
                      <td className="px-6 py-4">
                        {day.extras.length === 0 ? <span className="text-xs text-slate-400">-</span> : (
                          <div className="space-y-1.5">
                            {day.extras.map((ext: any) => (
                              <div key={ext.id} className="text-xs font-semibold text-slate-700 bg-amber-50 border border-amber-100 rounded-md px-2 py-1 inline-block mr-2">
                                <span className="text-amber-800 font-black">{ext.itemName}</span> 
                                <span className="mx-1 opacity-50">|</span> 
                                Qty: {ext.quantity} 
                                <span className="text-[9px] text-amber-600/70 ml-1">(₹{ext.price})</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Total Column */}
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        {day.totalAmount > 0 ? (
                          <span className="text-sm font-black text-slate-800">₹{day.totalAmount.toFixed(2)}</span>
                        ) : (
                          <span className="text-xs font-bold text-slate-300">₹0.00</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}