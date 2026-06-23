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

    /* 🚀 FALSE CONDITION: Agar customer select HO GAYA hai (Invoice Area) */
    <div className="rounded-3xl border border-slate-200/60 bg-white shadow-xl overflow-hidden print:shadow-none print:border-none print:m-0 print:p-0">
      
      {/* Print Header */}
      <div className="hidden print:flex justify-between items-center border-b pb-6 mb-6 border-slate-200">
        <div>
          <h1 className="text-2xl font-black tracking-wider text-slate-900">DAIRY FARM</h1>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Monthly Invoice Report</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400 font-bold uppercase">Billing Month</p>
          <p className="text-lg font-black text-slate-800">
            {new Date(selectedMonth + "-02").toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

          {/* Customer Details Block */}
          <div className="bg-slate-900 text-white p-6 flex justify-between items-center print:bg-slate-50 print:text-slate-950 print:p-5 print:rounded-2xl print:border print:border-slate-200/80 print:mb-6">
            <div>
              <span className="hidden print:inline-block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Billed To</span>
              <h2 className="text-3xl font-black tracking-tight print:text-lg print:leading-tight">{selectedCustomerObj?.name}</h2>
              <p className="text-slate-400 mt-1 font-semibold print:text-slate-600 print:text-xs">
                Mobile: {selectedCustomerObj?.mobile} | Address: {selectedCustomerObj?.address}
              </p>
            </div>
            <div className="text-right print:hidden">
              <p className="text-sm font-bold text-slate-400 uppercase">Invoice Month</p>
              <p className="text-2xl font-black text-emerald-400">{new Date(selectedMonth + "-02").toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
            </div>
          </div>

          <div className="overflow-x-auto print:overflow-visible">
            <table className="w-full divide-y divide-slate-200/60 relative print:border-collapse print:border-b print:border-slate-200 table-fixed">
              <thead className="bg-slate-100 print:bg-slate-50 print:border-b print:border-slate-300">
                <tr>
                  <th className="w-[12%] px-6 py-4 text-left text-[11px] font-black text-slate-500 uppercase print:text-slate-700">Date</th>
                  <th className="w-[18%] px-6 py-4 text-left text-[11px] font-black text-slate-500 uppercase print:text-slate-700">Item Name</th>
                  <th className="w-[25%] px-6 py-4 text-center text-[11px] font-black text-slate-500 uppercase print:text-slate-700">Morning<br/><span className="text-[9px] font-bold text-slate-400">(Qty x Rate)</span></th>
                  <th className="w-[25%] px-6 py-4 text-center text-[11px] font-black text-slate-500 uppercase print:text-slate-700">Evening<br/><span className="text-[9px] font-bold text-slate-400">(Qty x Rate)</span></th>
                  <th className="w-[20%] px-6 py-4 text-left text-[11px] font-black text-slate-500 uppercase print:text-slate-700">Extra Items<br/><span className="text-[9px] font-bold text-slate-400">(Qty x Rate)</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white print:border-slate-100">
                {isLoading ? (
                  <tr><td colSpan={5} className="p-10 text-center text-slate-400 font-bold animate-pulse">Generating Report...</td></tr>
                ) : (
                  ledgerData.map((day) => {
                    const dateObj = new Date(day.dateStr);
                    return (
                      <tr key={day.dateStr} className={`print:border-b print:border-slate-100 ${day.hasData ? 'hover:bg-slate-50' : 'bg-slate-50/30 opacity-60 print:hidden'}`}>
                        <td className="px-6 py-3 whitespace-nowrap text-sm font-bold text-slate-700 print:text-slate-800">
                          {String(dateObj.getDate()).padStart(2, '0')} {dateObj.toLocaleDateString('en-US', { month: 'short' })}
                        </td>
                        <td className="px-6 py-3 print:text-slate-800">
                          {day.dayLogs.length > 0 ? day.dayLogs.map((log: any) => (
                            <div key={log.id} className="text-xs font-bold text-slate-800 print:text-slate-700 py-1">
                              {log.itemName}
                            </div>
                          )) : <span className="text-xs text-slate-300">-</span>}
                        </td>
                        <td className="px-6 py-3 text-center whitespace-nowrap">
                          {day.dayLogs.length > 0 ? day.dayLogs.map((log: any) => (
                            <div key={log.id} className="text-xs font-black text-emerald-700 print:text-slate-800 py-1">
                              {log.morningDelivered > 0 ? (
                                <span>{log.morningDelivered} <span className="text-slate-400 mx-0.5 print:text-slate-400">x</span> ₹{log.price} <span className="text-slate-400 mx-0.5 print:text-slate-400">=</span> ₹{(log.morningDelivered * log.price).toFixed(2)}</span>
                              ) : '-'}
                            </div>
                          )) : <span className="text-xs text-slate-300">-</span>}
                        </td>
                        <td className="px-6 py-3 text-center whitespace-nowrap">
                          {day.dayLogs.length > 0 ? day.dayLogs.map((log: any) => (
                            <div key={log.id} className="text-xs font-black text-emerald-700 print:text-slate-800 py-1">
                              {log.eveningDelivered > 0 ? (
                                <span>{log.eveningDelivered} <span className="text-slate-400 mx-0.5 print:text-slate-400">x</span> ₹{log.price} <span className="text-slate-400 mx-0.5 print:text-slate-400">=</span> ₹{(log.eveningDelivered * log.price).toFixed(2)}</span>
                              ) : '-'}
                            </div>
                          )) : <span className="text-xs text-slate-300">-</span>}
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          {day.dayExtras.length > 0 ? day.dayExtras.map((ext: any) => (
                            <div key={ext.id} className="text-xs font-bold text-amber-800 print:text-slate-800 py-1">
                              {ext.itemName} <span className="text-slate-400 font-medium print:text-slate-500">| {ext.quantity} <span className="mx-0.5">x</span> ₹{ext.price} <span className="mx-0.5">=</span> <span className="text-black print:text-slate-800 font-bold">₹{(ext.quantity * ext.price).toFixed(2)}</span></span>
                            </div>
                          )) : <span className="text-xs text-slate-300">-</span>}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>

              {!isLoading && ledgerData.length > 0 && (
                <tfoot className="bg-slate-50 border-t-2 border-slate-200 print:bg-slate-50 print:border-t-2 print:border-slate-300">
                  <tr>
                    <td colSpan={2} className="px-6 py-4 text-right text-xs font-black text-slate-500 uppercase tracking-widest print:text-slate-700">Totals</td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-emerald-700 print:text-slate-800">{totals.morningLtrs.toFixed(1)} <span className="text-xs font-bold text-slate-400 ml-1">Qty</span></span>
                        <span className="text-xs font-black text-emerald-900 print:text-slate-600">₹{totals.morningAmt.toFixed(2)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-emerald-700 print:text-slate-800">{totals.eveningLtrs.toFixed(1)} <span className="text-xs font-bold text-slate-400 ml-1">Qty</span></span>
                        <span className="text-xs font-black text-emerald-900 print:text-slate-600">₹{totals.eveningAmt.toFixed(2)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-left whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-400">Total Extras Amount</span>
                        <span className="text-sm font-black text-amber-700 print:text-slate-800">₹{totals.extraAmt.toFixed(2)}</span>
                      </div>
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
          
          <div className="bg-slate-50 p-6 sm:p-8 border-t border-slate-200 print:bg-white print:border-t-0 print:pt-4">
            <div className="flex flex-col sm:flex-row justify-between items-end gap-6">
              <div className="w-full sm:w-1/2 space-y-2 print:text-black">
                <div className="flex justify-between items-center py-2 border-b border-slate-200/60 print:border-slate-200">
                  <span className="text-sm font-bold uppercase print:text-slate-500 print:text-xs">Primary Amount</span>
                  <span className="text-base font-black print:text-slate-800">₹{totals.primaryAmt.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-200/60 print:border-slate-200">
                  <span className="text-sm font-bold uppercase print:text-slate-500 print:text-xs">Extra Items Amount</span>
                  <span className="text-base font-black print:text-slate-800">₹{totals.extraAmt.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-200/60 print:border-slate-200">
                  <span className="text-sm font-bold uppercase print:text-slate-500 print:text-xs">Opening Balance (Due)</span>
                  <span className="text-base font-black print:text-slate-800">₹{totals.openingBalance.toFixed(2)}</span>
                </div>
              </div>

              <div className="text-right bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm w-full sm:w-auto print:shadow-none print:border-slate-200 print:bg-slate-50 print:p-4">
                <p className="text-xs font-black uppercase tracking-widest mb-1 print:text-slate-400 print:text-[10px]">Grand Total To Pay</p>
                <p className="text-4xl font-black text-slate-900 print:text-slate-950 print:text-2xl">₹{totals.grandTotal.toFixed(2)}</p>
              </div>
            </div>
            
            <div className="hidden print:block mt-8 text-center text-xs font-bold text-gray-400">
              Thank you for choosing Dairy Farm services!
            </div>
          </div>
          
          <div className="print:hidden p-5 bg-white border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4 w-full sm:w-auto ml-auto">
              {billStatus === 'GENERATED' ? (
                <>
                  <Link href={`/dashboard/customers/${selectedCustomerId}/ledger`} className="w-full sm:w-auto text-center bg-slate-100 text-slate-700 font-bold px-6 py-3 rounded-xl hover:bg-slate-200 transition-colors">
                    Edit Source Data
                  </Link>
                  <button onClick={() => window.print()} className="w-full sm:w-auto bg-blue-600 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                    Print Report
                  </button>
                </>
              ) : (
                <button onClick={handleSaveBill} disabled={isSaving || totals.grandTotal === 0} className="w-full sm:w-auto bg-emerald-600 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:bg-emerald-700 hover:-translate-y-0.5 transition-all disabled:opacity-50 cursor-pointer">
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
