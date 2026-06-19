// src/app/dashboard/reports/ReportGenerator.tsx
"use client";

import { useState, useEffect } from "react";
import { getMonthlyLedger } from "@/actions/ledgerActions";
import { saveMonthlyBill, checkBillExists } from "@/actions/billActions";
import Link from "next/link";

export default function ReportGenerator({ customers }: { customers: any[] }) {
  const today = new Date();
  const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [ledgerData, setLedgerData] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  
  // 🚀 NEW: Bill Status State ('IDLE', 'PENDING', 'GENERATED')
  const [billStatus, setBillStatus] = useState<'IDLE' | 'PENDING' | 'GENERATED'>('IDLE');

  const [totals, setTotals] = useState({ morningLtrs: 0, eveningLtrs: 0, milkTotalAmt: 0, extraItemsAmt: 0, grandTotal: 0 });

  useEffect(() => {
    if (selectedCustomerId) {
      loadReportData();
    } else {
      setLedgerData([]);
      setBillStatus('IDLE');
    }
  }, [selectedCustomerId, selectedMonth]);

  const loadReportData = async () => {
    setIsLoading(true);
    try {
      const customerIdNum = Number(selectedCustomerId);
      
      // 🚀 NEW: Parallel fetch of Ledger Data AND Bill Existence
      const [response, isBillGenerated] = await Promise.all([
        getMonthlyLedger(customerIdNum, selectedMonth),
        checkBillExists(customerIdNum, selectedMonth)
      ]);

      setBillStatus(isBillGenerated ? 'GENERATED' : 'PENDING');

      const daysArray = Array.from({ length: response.lastDay }, (_, i) => `${selectedMonth}-${String(i + 1).padStart(2, '0')}`);
      let tMorn = 0; let tEve = 0; let tMilkAmt = 0; let tExtraAmt = 0;

      const mappedData = daysArray.map(dateStr => {
        const dayLogs = response.dailyLogs.filter((log: any) => log.dateStr === dateStr);
        const dayExtras = response.extraLogs.filter((ext: any) => ext.dateStr === dateStr);

        let dMorn = 0; let dEve = 0; let dMilkAmt = 0; let dExtraAmt = 0;

        dayLogs.forEach((log: any) => {
          dMorn += log.morningDelivered;
          dEve += log.eveningDelivered;
          dMilkAmt += (log.morningDelivered + log.eveningDelivered) * log.price;
        });
        dayExtras.forEach((ext: any) => { dExtraAmt += ext.quantity * ext.price; });

        tMorn += dMorn; tEve += dEve; tMilkAmt += dMilkAmt; tExtraAmt += dExtraAmt;
        return { dateStr, dayLogs, dayExtras, dMorn, dEve, dMilkAmt, dExtraAmt, dailyTotal: dMilkAmt + dExtraAmt };
      });

      setLedgerData(mappedData);
      
      // 🚀 FIXED: Removed previousDue logic for now
      setTotals({
        morningLtrs: tMorn,
        eveningLtrs: tEve,
        milkTotalAmt: tMilkAmt,
        extraItemsAmt: tExtraAmt,
        grandTotal: tMilkAmt + tExtraAmt 
      });

    } catch (error) {
      console.error("Error loading report", error);
    }
    setIsLoading(false);
  };

  const handleSaveBill = async () => {
    setIsSaving(true);
    try {
      const customerObj = customers.find(c => c.id === Number(selectedCustomerId));
      await saveMonthlyBill({
        customerId: Number(selectedCustomerId),
        customerName: customerObj.name,
        monthYear: selectedMonth,
        totalMorningLtrs: totals.morningLtrs,
        totalEveningLtrs: totals.eveningLtrs,
        milkTotalAmount: totals.milkTotalAmt,
        extraItemsAmount: totals.extraItemsAmt,
        previousDue: 0, // Set to 0, handling later in Receipts
        grandTotal: totals.grandTotal
      });
      
      setBillStatus('GENERATED'); // Update UI indicator immediately
      setStatusMsg("✅ Bill generated and locked successfully!");
      setTimeout(() => setStatusMsg(""), 4000);
    } catch (error) {
      setStatusMsg("❌ Error generating bill");
    }
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      {/* SELECTION PANEL */}
      <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-xl backdrop-blur-xl flex flex-col sm:flex-row gap-6 items-end relative z-20">
        <div className="w-full sm:w-1/2">
          <label className="block text-sm font-bold text-slate-600 mb-2">Select Customer</label>
          <select value={selectedCustomerId} onChange={(e) => setSelectedCustomerId(e.target.value)} className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer">
            <option value="" disabled>-- Choose a customer --</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.mobile})</option>)}
          </select>
        </div>
        <div className="w-full sm:w-1/4">
          <label className="block text-sm font-bold text-slate-600 mb-2">Select Month</label>
          <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer" />
        </div>
        
        {/* 🚀 NEW: Dynamic Status Indicator */}
        {selectedCustomerId && !isLoading && (
          <div className="w-full sm:w-1/4 flex justify-end pb-1">
            {billStatus === 'GENERATED' ? (
              <span className="flex items-center gap-2 bg-emerald-100 text-emerald-800 border border-emerald-200 px-4 py-2 rounded-xl font-black text-sm shadow-sm animate-in zoom-in">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                Bill Locked
              </span>
            ) : (
              <span className="flex items-center gap-2 bg-amber-100 text-amber-800 border border-amber-200 px-4 py-2 rounded-xl font-black text-sm shadow-sm animate-in zoom-in">
                <svg className="w-5 h-5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Pending Review
              </span>
            )}
          </div>
        )}
      </div>

      {statusMsg && (
        <div className="p-4 bg-emerald-100 text-emerald-800 rounded-2xl font-bold border border-emerald-200 shadow-sm text-center animate-in slide-in-from-top-4">
          {statusMsg}
        </div>
      )}

      {/* 🚀 NEW: Premium Empty State */}
      {!selectedCustomerId ? (
        <div className="rounded-3xl border border-white/60 bg-white/50 p-12 shadow-lg backdrop-blur-xl flex flex-col items-center justify-center min-h-[40vh] border-dashed">
          <div className="bg-slate-100 p-6 rounded-full mb-4 shadow-inner">
            <svg className="w-16 h-16 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-black text-slate-700">No Account Selected</h2>
          <p className="text-slate-500 font-medium mt-2 max-w-sm text-center">Please choose a customer from the dropdown above to view or generate their monthly billing report.</p>
        </div>
      ) : (
        /* REPORT GRID */
        <div className="rounded-3xl border border-slate-200/60 bg-white shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="overflow-x-auto max-h-[55vh]">
            <table className="min-w-full divide-y divide-slate-200/60 relative">
              <thead className="bg-slate-800 text-white sticky top-0 z-10 shadow-md">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest">Date</th>
                  <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-widest">Morning (L)</th>
                  <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-widest">Evening (L)</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest">Extra Items</th>
                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-widest">Daily ₹</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {isLoading ? (
                  <tr><td colSpan={5} className="p-16 text-center font-bold text-slate-400 animate-pulse">Fetching records...</td></tr>
                ) : (
                  ledgerData.map((day) => {
                    const dateObj = new Date(day.dateStr);
                    const hasData = day.dailyTotal > 0;
                    return (
                      <tr key={day.dateStr} className={`hover:bg-slate-50 transition-colors ${hasData ? '' : 'bg-slate-50/40 opacity-70'}`}>
                        <td className="px-6 py-3 whitespace-nowrap text-sm font-bold text-slate-700">
                          {String(dateObj.getDate()).padStart(2, '0')} {dateObj.toLocaleDateString('en-US', { month: 'short' })}
                        </td>
                        <td className="px-6 py-3 text-center font-bold text-emerald-700">{day.dMorn > 0 ? day.dMorn : '-'}</td>
                        <td className="px-6 py-3 text-center font-bold text-emerald-700">{day.dEve > 0 ? day.dEve : '-'}</td>
                        <td className="px-6 py-3">
                          {day.dayExtras.length > 0 ? (
                            <div className="flex flex-col gap-1">
                              {day.dayExtras.map((ext: any) => (
                                <span key={ext.id} className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 w-max">
                                  {ext.itemName} (x{ext.quantity}) @ ₹{ext.price}
                                </span>
                              ))}
                            </div>
                          ) : <span className="text-xs text-slate-300">-</span>}
                        </td>
                        <td className="px-6 py-3 text-right font-black text-slate-800">
                          {day.dailyTotal > 0 ? `₹${day.dailyTotal.toFixed(2)}` : '-'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              
              <tfoot className="bg-emerald-50 border-t border-emerald-200 sticky bottom-0 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <tr>
                  <td className="px-6 py-5 text-right text-sm font-black text-emerald-900 uppercase">Totals:</td>
                  <td className="px-6 py-5 text-center text-lg font-black text-emerald-700">{totals.morningLtrs.toFixed(1)} L</td>
                  <td className="px-6 py-5 text-center text-lg font-black text-emerald-700">{totals.eveningLtrs.toFixed(1)} L</td>
                  <td className="px-6 py-5 text-left text-sm font-black text-amber-700">
                    Extras: ₹{totals.extraItemsAmt.toFixed(2)}<br/>
                    <span className="text-emerald-700 text-xs">Milk: ₹{totals.milkTotalAmt.toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Grand Total</span>
                      <span className="text-2xl font-black text-rose-600">₹{totals.grandTotal.toFixed(2)}</span>
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          {/* 🚀 NEW: Smart Bottom Action Bar */}
          <div className="p-5 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
            {billStatus === 'GENERATED' ? (
              <p className="text-sm font-bold text-slate-500">
                ⚠️ This bill is already locked. To make changes, edit the source data.
              </p>
            ) : (
              <p className="text-sm font-bold text-slate-500">
                Please verify all records before locking the invoice.
              </p>
            )}

            {billStatus === 'GENERATED' ? (
               <Link 
                href={`/dashboard/customers/${selectedCustomerId}/ledger`}
                className="bg-slate-800 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:bg-slate-900 hover:-translate-y-0.5 transition-all flex items-center gap-2"
               >
                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                 Edit Source in Ledger
               </Link>
            ) : (
              <button onClick={handleSaveBill} disabled={isSaving || totals.grandTotal === 0} className="bg-emerald-600 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:bg-emerald-700 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                {isSaving ? "Locking..." : "Lock & Save Monthly Bill"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}