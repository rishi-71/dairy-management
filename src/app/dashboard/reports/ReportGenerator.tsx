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

  // Updated Totals State to include Opening Balance
  const [totals, setTotals] = useState({ 
    primaryAmt: 0, 
    extraAmt: 0, 
    openingBalance: 0, 
    grandTotal: 0 
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
      let tPrimaryAmt = 0; let tExtraAmt = 0;

      const mappedData = daysArray.map(dateStr => {
        const dayLogs = response.dailyLogs.filter((log: any) => log.dateStr === dateStr);
        const dayExtras = response.extraLogs.filter((ext: any) => ext.dateStr === dateStr);

        let dPrimaryAmt = 0; let dExtraAmt = 0;

        dayLogs.forEach((log: any) => {
          dPrimaryAmt += (log.morningDelivered + log.eveningDelivered) * log.price;
        });
        dayExtras.forEach((ext: any) => { 
          dExtraAmt += ext.quantity * ext.price; 
        });

        tPrimaryAmt += dPrimaryAmt; 
        tExtraAmt += dExtraAmt;
        
        return { dateStr, dayLogs, dayExtras, dPrimaryAmt, dExtraAmt, dailyTotal: dPrimaryAmt + dExtraAmt };
      });

      setLedgerData(mappedData);
      
      const openingBal = selectedCustomerObj?.openingBalance || 0;

      setTotals({
        primaryAmt: tPrimaryAmt,
        extraAmt: tExtraAmt,
        openingBalance: openingBal,
        grandTotal: tPrimaryAmt + tExtraAmt + openingBal
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
        customerId: Number(selectedCustomerId),
        customerName: selectedCustomerObj.name,
        monthYear: selectedMonth,
        totalMorningLtrs: 0, // Simplified as we shifted to dynamic items
        totalEveningLtrs: 0,
        milkTotalAmount: totals.primaryAmt,
        extraItemsAmount: totals.extraAmt,
        previousDue: totals.openingBalance,
        grandTotal: totals.grandTotal
      });
      
      setBillStatus('GENERATED'); 
      setStatusMsg("✅ Invoice Locked! You can now print or download it.");
      setTimeout(() => setStatusMsg(""), 4000);
    } catch (error) {
      setStatusMsg("❌ Error generating bill");
    }
    setIsSaving(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* 🚀 HIDDEN IN PRINT: SELECTION PANEL */}
      <div className="print:hidden rounded-3xl border border-white/60 bg-white/80 p-6 shadow-xl backdrop-blur-xl flex flex-col sm:flex-row gap-6 items-end relative z-20">
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
      </div>

      {statusMsg && (
        <div className="print:hidden p-4 bg-emerald-100 text-emerald-800 rounded-2xl font-bold border border-emerald-200 shadow-sm text-center animate-in slide-in-from-top-4">
          {statusMsg}
        </div>
      )}

      {!selectedCustomerId ? (
        <div className="print:hidden rounded-3xl border border-white/60 bg-white/50 p-12 shadow-lg backdrop-blur-xl flex flex-col items-center justify-center min-h-[40vh] border-dashed">
          <div className="bg-slate-100 p-6 rounded-full mb-4 shadow-inner">
            <svg className="w-16 h-16 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-black text-slate-700">No Account Selected</h2>
          <p className="text-slate-500 font-medium mt-2 max-w-sm text-center">Please choose a customer from the dropdown above to view or generate their monthly billing report.</p>
        </div>
      ) : (
        /* 🚀 THE PRINTABLE INVOICE AREA */
        <div className="rounded-3xl border border-slate-200/60 bg-white shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 print:shadow-none print:border-none print:m-0 print:p-0">
          
          {/* INVOICE HEADER (Visible strongly in print) */}
          <div className="bg-slate-900 text-white p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-center print:bg-slate-100 print:text-black print:border-b-2 print:border-slate-800">
            <div>
              <h2 className="text-3xl font-black tracking-tight">{selectedCustomerObj?.name}</h2>
              <p className="text-slate-400 mt-1 font-semibold print:text-slate-600">
                Mo: {selectedCustomerObj?.mobile} | Address: {selectedCustomerObj?.address}
              </p>
            </div>
            <div className="mt-4 sm:mt-0 text-right">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest print:text-slate-500">Invoice Month</p>
              <p className="text-2xl font-black text-emerald-400 print:text-slate-800">
                {new Date(selectedMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
              
              <div className="mt-2 inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-lg print:hidden">
                {billStatus === 'GENERATED' ? (
                  <><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span><span className="text-xs font-bold text-emerald-100 uppercase tracking-wider">Locked</span></>
                ) : (
                  <><span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span><span className="text-xs font-bold text-amber-100 uppercase tracking-wider">Pending</span></>
                )}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto print:overflow-visible">
            <table className="min-w-full divide-y divide-slate-200/60 relative">
              <thead className="bg-slate-100 print:bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest">Date</th>
                  <th className="px-6 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest">Primary Subscriptions</th>
                  <th className="px-6 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest">Extra Items</th>
                  <th className="px-6 py-4 text-right text-[11px] font-black text-slate-500 uppercase tracking-widest">Daily ₹</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {isLoading ? (
                  <tr><td colSpan={4} className="p-16 text-center font-bold text-slate-400 animate-pulse">Generating Report...</td></tr>
                ) : (
                  ledgerData.map((day) => {
                    const dateObj = new Date(day.dateStr);
                    const hasData = day.dailyTotal > 0;
                    return (
                      <tr key={day.dateStr} className={`transition-colors ${hasData ? 'hover:bg-slate-50' : 'bg-slate-50/30 opacity-60 print:hidden'}`}>
                        <td className="px-6 py-3 whitespace-nowrap text-sm font-bold text-slate-700">
                          {String(dateObj.getDate()).padStart(2, '0')} {dateObj.toLocaleDateString('en-US', { month: 'short' })}
                        </td>
                        
                        {/* Dynamic Primary Items */}
                        <td className="px-6 py-3">
                          {day.dayLogs.length > 0 ? (
                            <div className="flex flex-col gap-1">
                              {day.dayLogs.map((log: any) => (
                                <span key={log.id} className="text-xs font-bold text-emerald-800">
                                  {log.itemName} <span className="text-slate-400 font-medium">| M:{log.morningDelivered} E:{log.eveningDelivered} @ ₹{log.price}</span>
                                </span>
                              ))}
                            </div>
                          ) : <span className="text-xs font-medium text-slate-300">-</span>}
                        </td>

                        {/* Dynamic Extra Items */}
                        <td className="px-6 py-3">
                          {day.dayExtras.length > 0 ? (
                            <div className="flex flex-col gap-1">
                              {day.dayExtras.map((ext: any) => (
                                <span key={ext.id} className="text-xs font-bold text-amber-800">
                                  {ext.itemName} <span className="text-slate-400 font-medium">| Qty:{ext.quantity} @ ₹{ext.price}</span>
                                </span>
                              ))}
                            </div>
                          ) : <span className="text-xs font-medium text-slate-300">-</span>}
                        </td>

                        <td className="px-6 py-3 text-right font-black text-slate-800">
                          {day.dailyTotal > 0 ? `₹${day.dailyTotal.toFixed(2)}` : '-'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          
          {/* 🚀 THE NEW GRAND TOTAL FOOTER */}
          <div className="bg-slate-50 p-6 sm:p-8 border-t-2 border-slate-200 print:break-inside-avoid">
            <div className="flex flex-col sm:flex-row justify-between items-end gap-6">
              
              <div className="w-full sm:w-1/2 space-y-2">
                <div className="flex justify-between items-center py-2 border-b border-slate-200/60">
                  <span className="text-sm font-bold text-slate-500 uppercase">Primary Amount</span>
                  <span className="text-base font-black text-emerald-700">₹{totals.primaryAmt.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-200/60">
                  <span className="text-sm font-bold text-slate-500 uppercase">Extra Items Amount</span>
                  <span className="text-base font-black text-amber-700">₹{totals.extraAmt.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-200/60">
                  <span className="text-sm font-bold text-slate-500 uppercase">Previous Opening Balance</span>
                  <span className="text-base font-black text-rose-600">₹{totals.openingBalance.toFixed(2)}</span>
                </div>
              </div>

              <div className="text-right bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm w-full sm:w-auto">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Final Invoice Total</p>
                <p className="text-4xl font-black text-slate-900">₹{totals.grandTotal.toFixed(2)}</p>
              </div>

            </div>
          </div>
          
          {/* 🚀 BUTTONS (Hidden in Print) */}
          <div className="print:hidden p-5 bg-white border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
            {billStatus === 'GENERATED' ? (
              <p className="text-sm font-bold text-slate-500">
                ✅ Invoice locked. Ready for distribution.
              </p>
            ) : (
              <p className="text-sm font-bold text-amber-600 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                Please lock the bill before printing.
              </p>
            )}

            <div className="flex items-center gap-4 w-full sm:w-auto">
              {billStatus === 'GENERATED' ? (
                <>
                  <Link href={`/dashboard/customers/${selectedCustomerId}/ledger`} className="w-full sm:w-auto text-center bg-slate-100 text-slate-700 font-bold px-6 py-3 rounded-xl hover:bg-slate-200 transition-colors">
                    Edit Ledger
                  </Link>
                  <button onClick={handlePrint} className="w-full sm:w-auto bg-blue-600 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                    Print Invoice
                  </button>
                </>
              ) : (
                <button onClick={handleSaveBill} disabled={isSaving || totals.grandTotal === 0} className="w-full sm:w-auto bg-emerald-600 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:bg-emerald-700 hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
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