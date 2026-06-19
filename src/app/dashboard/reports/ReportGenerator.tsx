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
  
  const [billStatus, setBillStatus] = useState<'IDLE' | 'PENDING' | 'GENERATED'>('IDLE');

  // 🚀 FIXED: Added morningAmt and eveningAmt in state
  const [totals, setTotals] = useState({ 
    primaryAmt: 0, extraAmt: 0, openingBalance: 0, grandTotal: 0, 
    morningLtrs: 0, eveningLtrs: 0, morningAmt: 0, eveningAmt: 0 
  });

  const selectedCustomerObj = customers.find(c => c.id === Number(selectedCustomerId));

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
      const [response, isBillGenerated] = await Promise.all([
        getMonthlyLedger(customerIdNum, selectedMonth),
        checkBillExists(customerIdNum, selectedMonth)
      ]);

      setBillStatus(isBillGenerated ? 'GENERATED' : 'PENDING');

      const daysArray = Array.from({ length: response.lastDay }, (_, i) => `${selectedMonth}-${String(i + 1).padStart(2, '0')}`);
      
      // 🚀 FIXED: Variables for morning and evening amounts
      let tPrimaryAmt = 0; let tExtraAmt = 0; 
      let tMorn = 0; let tEve = 0;
      let tMornAmt = 0; let tEveAmt = 0;

      const mappedData = daysArray.map(dateStr => {
        const dayLogs = response.dailyLogs.filter((log: any) => log.dateStr === dateStr);
        const dayExtras = response.extraLogs.filter((ext: any) => ext.dateStr === dateStr);

        let dPrimaryAmt = 0; let dExtraAmt = 0;

        dayLogs.forEach((log: any) => {
          tMorn += log.morningDelivered;
          tEve += log.eveningDelivered;
          tMornAmt += log.morningDelivered * log.price;   // Calculate morning total price
          tEveAmt += log.eveningDelivered * log.price;    // Calculate evening total price
          dPrimaryAmt += (log.morningDelivered + log.eveningDelivered) * log.price;
        });
        dayExtras.forEach((ext: any) => { 
          dExtraAmt += ext.quantity * ext.price; 
        });

        tPrimaryAmt += dPrimaryAmt; tExtraAmt += dExtraAmt;
        
        return { dateStr, dayLogs, dayExtras, dPrimaryAmt, dExtraAmt, hasData: dayLogs.length > 0 || dayExtras.length > 0 };
      });

      setLedgerData(mappedData);
      const openingBal = selectedCustomerObj?.openingBalance || 0;

      setTotals({
        primaryAmt: tPrimaryAmt, extraAmt: tExtraAmt, openingBalance: openingBal,
        grandTotal: tPrimaryAmt + tExtraAmt + openingBal,
        morningLtrs: tMorn, eveningLtrs: tEve,
        morningAmt: tMornAmt, eveningAmt: tEveAmt
      });

    } catch (error) {
      console.error("Error loading report", error);
    }
    setIsLoading(false);
  };

  const handleSaveBill = async () => {
    setIsSaving(true);
    try {
      await saveMonthlyBill({
        customerId: Number(selectedCustomerId), customerName: selectedCustomerObj.name, monthYear: selectedMonth,
        totalMorningLtrs: totals.morningLtrs, totalEveningLtrs: totals.eveningLtrs,
        milkTotalAmount: totals.primaryAmt, extraItemsAmount: totals.extraAmt,
        previousDue: totals.openingBalance, grandTotal: totals.grandTotal
      });
      setBillStatus('GENERATED'); 
      setStatusMsg("✅ Invoice Locked! You can now print or download it.");
      setTimeout(() => setStatusMsg(""), 4000);
    } catch (error) { setStatusMsg("❌ Error generating bill"); }
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      
      {/* SELECTION PANEL */}
      <div className="print:hidden rounded-3xl border border-white/60 bg-white/80 p-6 shadow-xl backdrop-blur-xl flex flex-col sm:flex-row gap-6 items-end relative z-20">
        <div className="w-full sm:w-2/5">
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

        {selectedCustomerId && !isLoading && (
          <div className="w-full sm:w-auto flex-grow flex justify-end pb-1">
            {billStatus === 'GENERATED' ? (
              <span className="flex items-center gap-2 bg-emerald-100 text-emerald-800 border border-emerald-200 px-4 py-2.5 rounded-xl font-black text-sm shadow-sm animate-in zoom-in">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                Bill Locked
              </span>
            ) : (
              <span className="flex items-center gap-2 bg-amber-100 text-amber-800 border border-amber-200 px-4 py-2.5 rounded-xl font-black text-sm shadow-sm animate-in zoom-in">
                <svg className="w-5 h-5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Pending Review
              </span>
            )}
          </div>
        )}
      </div>

      {statusMsg && <div className="print:hidden p-4 bg-emerald-100 text-emerald-800 rounded-2xl font-bold border border-emerald-200 shadow-sm text-center">{statusMsg}</div>}

      {!selectedCustomerId ? (
        <div className="print:hidden rounded-3xl border border-white/60 bg-white/50 p-12 shadow-lg backdrop-blur-xl flex flex-col items-center justify-center min-h-[40vh] border-dashed">
          <h2 className="text-xl font-black text-slate-700">No Account Selected</h2>
        </div>
      ) : (
        /* PRINTABLE INVOICE AREA */
        <div className="rounded-3xl border border-slate-200/60 bg-white shadow-xl overflow-hidden print:shadow-none print:border-none print:m-0 print:p-0">
          
          <div className="hidden print:block text-center border-b-2 border-black pb-4 mb-4">
            <h1 className="text-3xl font-black uppercase tracking-widest text-black">Dairy Farm Invoice</h1>
            <p className="text-sm font-bold text-gray-600">Month: {new Date(selectedMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
          </div>

          <div className="bg-slate-900 text-white p-6 flex justify-between items-center print:bg-white print:text-black print:p-0 print:mb-4">
            <div>
              <h2 className="text-3xl font-black tracking-tight print:text-xl print:uppercase">{selectedCustomerObj?.name}</h2>
              <p className="text-slate-400 mt-1 font-semibold print:text-black print:text-sm">
                Mo: {selectedCustomerObj?.mobile} | Address: {selectedCustomerObj?.address}
              </p>
            </div>
            <div className="text-right print:hidden">
              <p className="text-sm font-bold text-slate-400 uppercase">Invoice Month</p>
              <p className="text-2xl font-black text-emerald-400">{new Date(selectedMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
            </div>
          </div>

          <div className="overflow-x-auto print:overflow-visible">
            <table className="w-full divide-y divide-slate-200/60 relative print:border-collapse print:border-black print:border table-fixed">
              <thead className="bg-slate-100 print:bg-gray-100 print:border-b-2 print:border-black">
                <tr>
                  <th className="w-[10%] px-6 py-4 text-left text-[11px] font-black text-slate-500 uppercase print:text-black print:border-black print:border-r">Date</th>
                  <th className="w-[20%] px-6 py-4 text-left text-[11px] font-black text-slate-500 uppercase print:text-black print:border-black print:border-r">Item Name</th>
                  <th className="w-[25%] px-6 py-4 text-center text-[11px] font-black text-slate-500 uppercase print:text-black print:border-black print:border-r">Morning<br/><span className="text-[9px]">(Qty x Rate)</span></th>
                  <th className="w-[25%] px-6 py-4 text-center text-[11px] font-black text-slate-500 uppercase print:text-black print:border-black print:border-r">Evening<br/><span className="text-[9px]">(Qty x Rate)</span></th>
                  <th className="w-[20%] px-6 py-4 text-left text-[11px] font-black text-slate-500 uppercase print:text-black">Extra Items<br/><span className="text-[9px]">(Qty x Rate)</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white print:border-black">
                {isLoading ? (
                  <tr><td colSpan={5} className="p-10 text-center text-slate-400 font-bold animate-pulse">Generating Report...</td></tr>
                ) : (
                  ledgerData.map((day) => {
                    const dateObj = new Date(day.dateStr);
                    return (
                      <tr key={day.dateStr} className={`print:border-b print:border-gray-300 ${day.hasData ? 'hover:bg-slate-50' : 'bg-slate-50/30 opacity-60 print:hidden'}`}>
                        <td className="px-6 py-3 whitespace-nowrap text-sm font-bold text-slate-700 print:text-black print:border-r print:border-black">
                          {String(dateObj.getDate()).padStart(2, '0')} {dateObj.toLocaleDateString('en-US', { month: 'short' })}
                        </td>
                        <td className="px-6 py-3 print:border-r print:border-black">
                          {day.dayLogs.length > 0 ? day.dayLogs.map((log: any) => (
                            <div key={log.id} className="text-xs font-bold text-slate-800 print:text-black py-1">
                              {log.itemName}
                            </div>
                          )) : <span className="text-xs text-slate-300">-</span>}
                        </td>
                        <td className="px-6 py-3 text-center print:border-r print:border-black whitespace-nowrap">
                          {day.dayLogs.length > 0 ? day.dayLogs.map((log: any) => (
                            <div key={log.id} className="text-xs font-black text-emerald-700 print:text-black py-1">
                              {log.morningDelivered > 0 ? (
                                <span>{log.morningDelivered} <span className="text-slate-400 mx-0.5">x</span> ₹{log.price} <span className="text-slate-400 mx-0.5">=</span> ₹{(log.morningDelivered * log.price).toFixed(2)}</span>
                              ) : '-'}
                            </div>
                          )) : <span className="text-xs text-slate-300">-</span>}
                        </td>
                        <td className="px-6 py-3 text-center print:border-r print:border-black whitespace-nowrap">
                          {day.dayLogs.length > 0 ? day.dayLogs.map((log: any) => (
                            <div key={log.id} className="text-xs font-black text-emerald-700 print:text-black py-1">
                              {log.eveningDelivered > 0 ? (
                                <span>{log.eveningDelivered} <span className="text-slate-400 mx-0.5">x</span> ₹{log.price} <span className="text-slate-400 mx-0.5">=</span> ₹{(log.eveningDelivered * log.price).toFixed(2)}</span>
                              ) : '-'}
                            </div>
                          )) : <span className="text-xs text-slate-300">-</span>}
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          {day.dayExtras.length > 0 ? day.dayExtras.map((ext: any) => (
                            <div key={ext.id} className="text-xs font-bold text-amber-800 print:text-black py-1">
                              {ext.itemName} <span className="text-slate-400 font-medium print:text-gray-600">| {ext.quantity} <span className="mx-0.5">x</span> ₹{ext.price} <span className="mx-0.5">=</span> <span className="text-black">₹{(ext.quantity * ext.price).toFixed(2)}</span></span>
                            </div>
                          )) : <span className="text-xs text-slate-300">-</span>}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>

              {/* 🚀 FIXED: Added Table Footer for Column Totals */}
              {!isLoading && ledgerData.length > 0 && (
                <tfoot className="bg-slate-50 border-t-2 border-slate-200 print:bg-gray-100 print:border-black print:border-t-2">
                  <tr>
                    <td colSpan={2} className="px-6 py-4 text-right text-xs font-black text-slate-500 uppercase tracking-widest print:text-black print:border-r print:border-black">Totals</td>
                    <td className="px-6 py-4 text-center whitespace-nowrap print:border-r print:border-black">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-emerald-700 print:text-black">{totals.morningLtrs.toFixed(1)} <span className="text-xs font-bold text-slate-400 ml-1">Qty</span></span>
                        <span className="text-xs font-black text-emerald-900 print:text-black">₹{totals.morningAmt.toFixed(2)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap print:border-r print:border-black">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-emerald-700 print:text-black">{totals.eveningLtrs.toFixed(1)} <span className="text-xs font-bold text-slate-400 ml-1">Qty</span></span>
                        <span className="text-xs font-black text-emerald-900 print:text-black">₹{totals.eveningAmt.toFixed(2)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-left whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-400">Total Extras Amount</span>
                        <span className="text-sm font-black text-amber-700 print:text-black">₹{totals.extraAmt.toFixed(2)}</span>
                      </div>
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
          
          <div className="bg-slate-50 p-6 sm:p-8 border-t border-slate-200 print:bg-white print:border-black print:border-t-2">
            <div className="flex flex-col sm:flex-row justify-between items-end gap-6">
              <div className="w-full sm:w-1/2 space-y-2 print:text-black">
                {/* 🚀 FIXED: Changed text to generic 'Primary Amount' */}
                <div className="flex justify-between items-center py-2 border-b border-slate-200/60 print:border-black">
                  <span className="text-sm font-bold uppercase print:text-black">Primary Amount</span>
                  <span className="text-base font-black">₹{totals.primaryAmt.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-200/60 print:border-black">
                  <span className="text-sm font-bold uppercase print:text-black">Extra Items Amount</span>
                  <span className="text-base font-black">₹{totals.extraAmt.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-200/60 print:border-black">
                  <span className="text-sm font-bold uppercase print:text-black">Opening Balance (Due)</span>
                  <span className="text-base font-black">₹{totals.openingBalance.toFixed(2)}</span>
                </div>
              </div>

              <div className="text-right bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm w-full sm:w-auto print:shadow-none print:border-black print:border-2">
                <p className="text-xs font-black uppercase tracking-widest mb-1 print:text-black">Grand Total To Pay</p>
                <p className="text-4xl font-black text-slate-900 print:text-black">₹{totals.grandTotal.toFixed(2)}</p>
              </div>
            </div>
            
            <div className="hidden print:block mt-8 text-center text-xs font-bold text-gray-500">
              Generated by Dairy SaaS Management System
            </div>
          </div>
          
          <div className="print:hidden p-5 bg-white border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4 w-full sm:w-auto ml-auto">
              {billStatus === 'GENERATED' ? (
                <>
                  <Link href={`/dashboard/customers/${selectedCustomerId}/ledger`} className="w-full sm:w-auto text-center bg-slate-100 text-slate-700 font-bold px-6 py-3 rounded-xl hover:bg-slate-200 transition-colors">
                    Edit Source Data
                  </Link>
                  <button onClick={() => window.print()} className="w-full sm:w-auto bg-blue-600 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                    Print Bill
                  </button>
                </>
              ) : (
                <button onClick={handleSaveBill} disabled={isSaving || totals.grandTotal === 0} className="w-full sm:w-auto bg-emerald-600 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:bg-emerald-700 hover:-translate-y-0.5 transition-all disabled:opacity-50">
                  {isSaving ? "Locking..." : "Lock & Save Invoice"}
                </button>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}