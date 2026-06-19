// src/app/dashboard/customers/[id]/ledger/LedgerClient.tsx
"use client";

import { useState, useEffect } from "react";
import { getMonthlyLedger, updateLedgerDay } from "@/actions/ledgerActions";

export default function LedgerClient({ customer }: { customer: any }) {
  const today = new Date();
  const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [ledgerData, setLedgerData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [totalVolume, setTotalVolume] = useState(0);
  const [activeDays, setActiveDays] = useState(0);

  // 🚀 MODAL STATES
  const [editModal, setEditModal] = useState<{ isOpen: boolean; dayStr: string }>({ isOpen: false, dayStr: "" });
  const [editLogs, setEditLogs] = useState<any[]>([]);
  const [editExtras, setEditExtras] = useState<any[]>([]);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  useEffect(() => {
    loadLedger();
  }, [selectedMonth]);

  const loadLedger = async () => {
    setIsLoading(true);
    try {
      const response = await getMonthlyLedger(customer.id, selectedMonth);
      const daysArray = Array.from({ length: response.lastDay }, (_, i) => `${selectedMonth}-${String(i + 1).padStart(2, '0')}`);

      let grandTotal = 0; let totalVol = 0; let daysActive = 0;

      const mappedLedger = daysArray.map(dateStr => {
        const dayLogs = response.dailyLogs.filter((log: any) => log.dateStr === dateStr);
        const dayExtras = response.extraLogs.filter((ext: any) => ext.dateStr === dateStr);

        let dayTotalAmount = 0; let dayVol = 0;
        dayLogs.forEach((log: any) => {
          dayTotalAmount += (log.morningDelivered + log.eveningDelivered) * log.price;
          dayVol += (log.morningDelivered + log.eveningDelivered);
        });
        dayExtras.forEach((ext: any) => { dayTotalAmount += ext.quantity * ext.price; });

        grandTotal += dayTotalAmount; totalVol += dayVol;
        if (dayLogs.length > 0 || dayExtras.length > 0) daysActive++;

        return { dateStr, logs: dayLogs, extras: dayExtras, totalAmount: dayTotalAmount, dayVol };
      });

      setLedgerData(mappedLedger); setMonthlyTotal(grandTotal); setTotalVolume(totalVol); setActiveDays(daysActive);
    } catch (error) { console.error("Error loading ledger:", error); }
    setIsLoading(false);
  };

  // 🚀 OPEN MODAL HANDLER
  const openEditModal = (day: any) => {
    // Deep copy data for editing
    setEditLogs(day.logs.map((l: any) => ({ ...l })));
    setEditExtras(day.extras.map((e: any) => ({ ...e })));
    setEditModal({ isOpen: true, dayStr: day.dateStr });
  };

  // 🚀 LIVE CALCULATION IN MODAL
  const modalLiveTotal = editLogs.reduce((sum, l) => sum + ((l.morningDelivered + l.eveningDelivered) * l.price), 0) + 
                         editExtras.reduce((sum, e) => sum + (e.quantity * e.price), 0);

  // 🚀 SAVE EDITS HANDLER
  const handleSaveEdit = async () => {
    setIsSavingEdit(true);
    try {
      // 🚀 FIXED: Passing customer.id and editModal.dayStr
      await updateLedgerDay(customer.id, editModal.dayStr, editLogs, editExtras);
      setEditModal({ isOpen: false, dayStr: "" }); // Close Modal
      await loadLedger(); // Refresh Background Grid
    } catch (error) {
      alert("Failed to save changes");
    }
    setIsSavingEdit(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center rounded-3xl border border-white/60 bg-white/70 p-6 shadow-lg backdrop-blur-xl gap-4">
        <div className="flex items-center gap-5">
          <div className="h-14 w-14 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-black text-xl shadow-md">
            {customer.name.substring(0, 1).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Account Ledger</h1>
            <p className="mt-1 flex items-center gap-2 text-sm font-bold text-slate-600">
              {customer.name} <span className="opacity-50">•</span> {customer.mobile}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
          <svg className="w-5 h-5 text-emerald-600 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="border-none bg-transparent text-slate-900 font-black px-1 focus:outline-none cursor-pointer" />
        </div>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-3xl border border-white/60 bg-white/70 p-5 shadow-sm backdrop-blur-xl flex flex-col justify-center">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Deliveries</p>
          <p className="mt-1 text-2xl font-black text-slate-800">{activeDays} <span className="text-sm font-semibold text-slate-500">Days</span></p>
        </div>
        <div className="rounded-3xl border border-white/60 bg-white/70 p-5 shadow-sm backdrop-blur-xl flex flex-col justify-center">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Milk Volume</p>
          <p className="mt-1 text-2xl font-black text-blue-600">{totalVolume.toFixed(1)} <span className="text-sm font-semibold text-blue-400">Litres</span></p>
        </div>
        <div className="rounded-3xl border border-white/60 bg-gradient-to-br from-emerald-600 to-teal-700 p-5 shadow-lg shadow-emerald-900/20 text-white flex flex-col justify-center transform transition-transform hover:scale-[1.02]">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-100">Estimated Monthly Bill</p>
          <p className="mt-1 text-3xl font-black">₹{monthlyTotal.toFixed(2)}</p>
        </div>
      </div>

      {/* Ledger Grid */}
      <div className="rounded-3xl border border-slate-200/60 bg-white shadow-xl overflow-hidden relative">
        <div className="overflow-x-auto max-h-[65vh]">
          <table className="min-w-full divide-y divide-slate-100 relative">
            <thead className="bg-slate-50/90 backdrop-blur-md sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-widest text-slate-400">Date</th>
                <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-widest text-slate-400">Primary Delivery</th>
                <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-widest text-slate-400">Extra Items</th>
                <th className="px-6 py-4 text-right text-[11px] font-black uppercase tracking-widest text-slate-400">Daily Total</th>
                <th className="px-4 py-4 text-center text-[11px] font-black uppercase tracking-widest text-slate-400">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80 bg-white">
              {isLoading ? (
                <tr><td colSpan={5} className="p-12 text-center text-slate-400 font-bold animate-pulse">Calculating Ledger Data...</td></tr>
              ) : (
                ledgerData.map((day) => {
                  const dateObj = new Date(day.dateStr);
                  const dayNum = String(dateObj.getDate()).padStart(2, '0');
                  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                  const hasData = day.logs.length > 0 || day.extras.length > 0;
                  
                  return (
                    <tr key={day.dateStr} className={`group transition-all hover:bg-slate-50 ${hasData ? '' : 'bg-slate-50/30'}`}>
                      <td className="px-6 py-3 whitespace-nowrap">
                        <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl border ${hasData ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-white border-slate-100 text-slate-400'}`}>
                          <span className="text-[10px] font-bold uppercase leading-none mb-0.5">{dayName}</span>
                          <span className="text-lg font-black leading-none">{dayNum}</span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        {!hasData ? <span className="text-xs font-semibold text-slate-300 italic">No delivery recorded</span> : (
                          <div className="space-y-2">
                            {day.logs.map((log: any) => (
                              <div key={log.id} className="flex items-center gap-2">
                                <span className="text-xs font-black text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">{log.itemName}</span> 
                                <span className="text-xs font-bold text-slate-500">M: <span className="text-slate-800">{log.morningDelivered}</span> <span className="mx-1 opacity-40">|</span> E: <span className="text-slate-800">{log.eveningDelivered}</span></span>
                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">₹{log.price}/u</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        {day.extras.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {day.extras.map((ext: any) => (
                              <div key={ext.id} className="flex items-center gap-1.5 text-xs font-bold text-amber-900 bg-amber-50 border border-amber-200/60 rounded-lg px-2.5 py-1.5">
                                <span>{ext.itemName}</span> 
                                <span className="px-1.5 py-0.5 bg-white rounded-md shadow-sm border border-amber-100">Qty: {ext.quantity}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        {day.totalAmount > 0 ? <span className="text-base font-black text-slate-800">₹{day.totalAmount.toFixed(2)}</span> : <span className="text-sm font-bold text-slate-300">-</span>}
                      </td>

                      {/* Edit Button */}
                      <td className="px-4 py-4 text-center whitespace-nowrap">
                        {hasData && (
                          <button onClick={() => openEditModal(day)} className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg hover:bg-emerald-600">
                            Edit Day
                          </button>
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

      {/* ========================================== */}
      {/* 🚀 THE MAGIC EDIT MODAL */}
      {/* ========================================== */}
      {editModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-lg font-black text-slate-800">Edit Records</h3>
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">{new Date(editModal.dayStr).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
              </div>
              <button onClick={() => setEditModal({isOpen: false, dayStr: ""})} className="text-slate-400 hover:text-rose-500 transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
              {/* PRIMARY SUBSCRIPTIONS EDIT */}
              {editLogs.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Primary Milk Delivery</h4>
                  {editLogs.map((log, idx) => (
                    <div key={log.id} className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-black text-emerald-900">{log.itemName}</p>
                        <p className="text-[10px] font-bold text-emerald-600 bg-white inline-block px-1.5 py-0.5 rounded shadow-sm border border-emerald-100 mt-1">Locked @ ₹{log.price}</p>
                      </div>
                      <div className="flex gap-2">
                        <div className="text-center">
                          <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Morn (L)</label>
                          <input type="number" step="0.1" min="0" value={log.morningDelivered} 
                            onChange={(e) => { const newLogs = [...editLogs]; newLogs[idx].morningDelivered = parseFloat(e.target.value) || 0; setEditLogs(newLogs); }}
                            className="w-14 text-center text-sm font-bold p-1 rounded-md border border-emerald-200 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
                        </div>
                        <div className="text-center">
                          <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Eve (L)</label>
                          <input type="number" step="0.1" min="0" value={log.eveningDelivered} 
                            onChange={(e) => { const newLogs = [...editLogs]; newLogs[idx].eveningDelivered = parseFloat(e.target.value) || 0; setEditLogs(newLogs); }}
                            className="w-14 text-center text-sm font-bold p-1 rounded-md border border-emerald-200 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* EXTRA ITEMS EDIT */}
              {editExtras.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Extra Items (Set 0 to remove)</h4>
                  {editExtras.map((ext, idx) => (
                    <div key={ext.id} className="p-3 bg-amber-50/50 border border-amber-100 rounded-2xl flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-black text-amber-900">{ext.itemName}</p>
                        <p className="text-[10px] font-bold text-amber-600 bg-white inline-block px-1.5 py-0.5 rounded shadow-sm border border-amber-100 mt-1">Locked @ ₹{ext.price}</p>
                      </div>
                      <div className="text-center">
                        <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Qty</label>
                        <input type="number" step="0.5" min="0" value={ext.quantity} 
                          onChange={(e) => { const newExt = [...editExtras]; newExt[idx].quantity = parseFloat(e.target.value) || 0; setEditExtras(newExt); }}
                          className="w-16 text-center text-sm font-bold p-1 rounded-md border border-amber-200 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* MODAL FOOTER WITH LIVE CALCULATION */}
            <div className="p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Revised Daily Total</p>
                <p className="text-xl font-black text-slate-800">₹{modalLiveTotal.toFixed(2)}</p>
              </div>
              <button onClick={handleSaveEdit} disabled={isSavingEdit} className="bg-emerald-600 text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-lg hover:bg-emerald-700 hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center gap-2">
                {isSavingEdit ? "Saving..." : (
                  <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Save Changes</>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}