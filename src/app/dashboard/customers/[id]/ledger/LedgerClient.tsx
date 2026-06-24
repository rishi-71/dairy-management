// src/app/dashboard/customers/[id]/ledger/LedgerClient.tsx
"use client";

import { useState, useEffect } from "react";
import { getMonthlyLedger, updateLedgerDay } from "@/actions/ledgerActions";

export default function LedgerClient({ customer }: { customer: any }) {
  const today = new Date();
  const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [ledgerData, setLedgerData] = useState<any[]>([]);
  const [allItems, setAllItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // MODAL STATES
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
      setAllItems(response.allItems || []);
      
      const daysArray = Array.from({ length: response.lastDay }, (_, i) => `${selectedMonth}-${String(i + 1).padStart(2, '0')}`);

      const mappedLedger = daysArray.map(dateStr => {
        const dayLogs = response.dailyLogs.filter((log: any) => log.dateStr === dateStr);
        const dayExtras = response.extraLogs.filter((ext: any) => ext.dateStr === dateStr);

        let dayTotalAmount = 0;
        dayLogs.forEach((log: any) => { dayTotalAmount += (log.morningDelivered + log.eveningDelivered) * log.price; });
        dayExtras.forEach((ext: any) => { dayTotalAmount += ext.quantity * ext.price; });

        return { dateStr, logs: dayLogs, extras: dayExtras, totalAmount: dayTotalAmount };
      });

      setLedgerData(mappedLedger);
    } catch (error) { console.error("Error loading ledger:", error); }
    setIsLoading(false);
  };

  const openEditModal = (day: any) => {
    setEditLogs(day.logs.map((l: any) => ({ ...l })));
    setEditExtras(day.extras.map((e: any) => ({ ...e })));
    setEditModal({ isOpen: true, dayStr: day.dateStr });
  };

  // 🚀 LIVE CALCULATION IN MODAL
  const modalLiveTotal = editLogs.reduce((sum, l) => sum + ((l.morningDelivered + l.eveningDelivered) * l.price), 0) + 
                         editExtras.reduce((sum, e) => sum + (e.quantity * e.price), 0);

  const handleSaveEdit = async () => {
    setIsSavingEdit(true);
    try {
      await updateLedgerDay(customer.id, editModal.dayStr, editLogs, editExtras);
      setEditModal({ isOpen: false, dayStr: "" });
      await loadLedger();
    } catch (error) {
      alert("Failed to save changes");
    }
    setIsSavingEdit(false);
  };

  // ADD NEW ITEM LOGIC IN MODAL
  const handleAddNewPrimary = (itemId: string) => {
    if(!itemId) return;
    const item = allItems.find(i => i.id === Number(itemId));
    if(item && !editLogs.find(l => l.itemId === item.id)) {
      setEditLogs([...editLogs, { itemId: item.id, itemName: item.name, price: item.price, morningDelivered: 0, eveningDelivered: 0 }]);
    }
  };

  const handleAddNewExtra = (itemId: string) => {
    if(!itemId) return;
    const item = allItems.find(i => i.id === Number(itemId));
    if(item && !editExtras.find(e => e.itemId === item.id)) {
      setEditExtras([...editExtras, { itemId: item.id, itemName: item.name, price: item.price, quantity: 1 }]);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 🚀 HEADER PANEL */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center rounded-3xl border border-white/40 bg-white/40 p-6 sm:p-8 shadow-xl shadow-slate-100/30 backdrop-blur-3xl gap-4 hover:shadow-slate-100/50 transition-all duration-300">
        <div className="flex items-center gap-5">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-emerald-500 via-emerald-600 to-teal-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-emerald-500/20">
            {customer.name.substring(0, 1).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Account Ledger</h1>
            <p className="mt-1 flex items-center gap-2 text-sm font-bold text-slate-600">
              {customer.name} <span className="opacity-50">•</span> {customer.mobile}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm p-2.5 rounded-2xl border border-white/80 shadow-sm transition-all duration-300 hover:bg-white hover:shadow-md hover:border-slate-200/80">
          <svg className="w-5 h-5 text-emerald-600 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="border-none bg-transparent text-slate-900 font-black px-1 focus:outline-none cursor-pointer" />
        </div>
      </div>

      {/* 🚀 LEDGER GRID (Clean, Clickable Rows) */}
      <div className="rounded-3xl border border-white/40 bg-white/30 backdrop-blur-3xl shadow-xl shadow-slate-100/40 overflow-hidden relative">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-3 text-center text-xs font-extrabold tracking-wider uppercase shadow-md relative z-20">
          Click on any row to edit or add missing deliveries
        </div>
        <div className="overflow-x-auto max-h-[65vh]">
          <table className="min-w-full divide-y divide-slate-100 relative">
            <thead className="bg-slate-50/90 backdrop-blur-md sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-widest text-slate-400">Date</th>
                <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-widest text-slate-400">Primary Delivery</th>
                <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-widest text-slate-400">Extra Items</th>
                <th className="px-6 py-4 text-right text-[11px] font-black uppercase tracking-widest text-slate-400">Daily Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/40 bg-white/20">
              {isLoading ? (
                <tr><td colSpan={4} className="p-12 text-center text-slate-400 font-bold animate-pulse">Calculating Ledger Data...</td></tr>
              ) : (
                ledgerData.map((day) => {
                  const dateObj = new Date(day.dateStr);
                  const dayNum = String(dateObj.getDate()).padStart(2, '0');
                  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                  const hasData = day.logs.length > 0 || day.extras.length > 0;
                  
                  return (
                    <tr 
                      key={day.dateStr} 
                      onClick={() => openEditModal(day)}
                      className={`group cursor-pointer transition-all hover:bg-white/70 backdrop-blur-sm ${hasData ? '' : 'bg-slate-50/10'}`}
                    >
                      <td className="px-6 py-3 whitespace-nowrap">
                        <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl border transition-all duration-300 ${hasData ? 'bg-emerald-50/80 border-emerald-100/80 text-emerald-700 shadow-sm' : 'bg-white/60 border-slate-100 text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-700 group-hover:border-emerald-200/50 group-hover:shadow-sm'}`}>
                          <span className="text-[10px] font-bold uppercase leading-none mb-0.5">{dayName}</span>
                          <span className="text-lg font-black leading-none">{dayNum}</span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        {!hasData ? <span className="text-xs font-semibold text-slate-450 italic group-hover:text-emerald-600 transition-colors">Tap to add delivery +</span> : (
                          <div className="space-y-2">
                            {day.logs.map((log: any) => (
                              <div key={log.id} className="flex items-center gap-2">
                                <span className="text-xs font-extrabold text-slate-700 bg-white/80 border border-slate-200/40 px-2.5 py-1 rounded-lg shadow-sm">{log.itemName}</span> 
                                <span className="text-xs font-bold text-slate-500">M: <span className="text-slate-800">{log.morningDelivered}</span> <span className="mx-1 opacity-40">|</span> E: <span className="text-slate-800">{log.eveningDelivered}</span></span>
                                <span className="text-[10px] font-bold text-emerald-650 bg-emerald-50/80 px-1.5 py-0.5 rounded">₹{log.price}/u</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        {day.extras.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {day.extras.map((ext: any) => (
                              <div key={ext.id} className="flex items-center gap-1.5 text-xs font-bold text-amber-900 bg-amber-50/80 border border-amber-200/40 rounded-xl px-2.5 py-1.5 shadow-sm">
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
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================== */}
      {/* 🚀 THE ADVANCED EDIT MODAL */}
      {/* ========================================== */}
      {editModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md transition-opacity duration-300">
          <div className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/60 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            
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
              
              {/* PRIMARY SUBSCRIPTIONS SECTION */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-wider flex justify-between">
                  <span>Primary Deliveries</span>
                  <span className="text-[9px] text-rose-450 normal-case">(Set both 0 to remove)</span>
                </h4>
                {editLogs.map((log, idx) => (
                  <div key={`log-${log.itemId}`} className="p-3 bg-white/60 border border-emerald-100/50 rounded-2xl flex items-center justify-between gap-4 relative group hover:bg-white/85 transition-colors duration-200">
                    <div>
                      <p className="text-sm font-black text-emerald-900">{log.itemName}</p>
                      <p className="text-[10px] font-bold text-emerald-600 bg-white inline-block px-1.5 py-0.5 rounded shadow-sm border border-emerald-100 mt-1">₹{log.price}/u</p>
                    </div>
                    <div className="flex gap-2">
                      <div className="text-center">
                        <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Morn (L)</label>
                        <input type="number" step="0.1" min="0" value={log.morningDelivered} 
                          onChange={(e) => { const newLogs = [...editLogs]; newLogs[idx].morningDelivered = parseFloat(e.target.value) || 0; setEditLogs(newLogs); }}
                          className="w-14 text-center text-sm font-bold p-1 rounded-lg border border-emerald-200/80 bg-white/80 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all" />
                      </div>
                      <div className="text-center">
                        <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Eve (L)</label>
                        <input type="number" step="0.1" min="0" value={log.eveningDelivered} 
                          onChange={(e) => { const newLogs = [...editLogs]; newLogs[idx].eveningDelivered = parseFloat(e.target.value) || 0; setEditLogs(newLogs); }}
                          className="w-14 text-center text-sm font-bold p-1 rounded-lg border border-emerald-200/80 bg-white/80 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all" />
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* 🚀 Dropdown to ADD missing primary item */}
                <select 
                  onChange={(e) => handleAddNewPrimary(e.target.value)} value=""
                  className="w-full text-xs font-bold text-emerald-600 bg-white/60 border border-dashed border-emerald-200 rounded-xl px-3 py-2 outline-none cursor-pointer hover:bg-emerald-50 hover:border-emerald-300 transition-all"
                >
                  <option value="" disabled>+ Add Delivery for this day</option>
                  {allItems.filter(i => !editLogs.find(l => l.itemId === i.id)).map(item => (
                    <option key={item.id} value={item.id}>{item.name} (₹{item.price})</option>
                  ))}
                </select>
              </div>

              {/* EXTRA ITEMS SECTION */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-wider flex justify-between">
                  <span>Extra Items</span>
                  <span className="text-[9px] text-rose-455 normal-case">(Set 0 to remove)</span>
                </h4>
                {editExtras.map((ext, idx) => (
                  <div key={`ext-${ext.itemId}`} className="p-3 bg-white/60 border border-amber-100/50 rounded-2xl flex items-center justify-between gap-4 hover:bg-white/85 transition-colors duration-200">
                    <div>
                      <p className="text-sm font-black text-amber-900">{ext.itemName}</p>
                      <p className="text-[10px] font-bold text-amber-600 bg-white inline-block px-1.5 py-0.5 rounded shadow-sm border border-amber-100 mt-1">₹{ext.price}/u</p>
                    </div>
                    <div className="text-center">
                      <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Qty</label>
                      <input type="number" step="0.5" min="0" value={ext.quantity} 
                        onChange={(e) => { const newExt = [...editExtras]; newExt[idx].quantity = parseFloat(e.target.value) || 0; setEditExtras(newExt); }}
                        className="w-16 text-center text-sm font-bold p-1 rounded-lg border border-amber-200/80 bg-white/80 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:bg-white transition-all" />
                    </div>
                  </div>
                ))}

                {/* 🚀 Dropdown to ADD missing extra item */}
                <select 
                  onChange={(e) => handleAddNewExtra(e.target.value)} value=""
                  className="w-full text-xs font-bold text-amber-600 bg-white/60 border border-dashed border-amber-200 rounded-xl px-3 py-2 outline-none cursor-pointer hover:bg-amber-50 hover:border-amber-355 transition-all"
                >
                  <option value="" disabled>+ Add Extra Item for this day</option>
                  {allItems.filter(i => !editExtras.find(e => e.itemId === i.id)).map(item => (
                    <option key={item.id} value={item.id}>{item.name} (₹{item.price})</option>
                  ))}
                </select>
              </div>

            </div>

            <div className="p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Revised Daily Total</p>
                <p className="text-xl font-black text-slate-800">₹{modalLiveTotal.toFixed(2)}</p>
              </div>
              <button onClick={handleSaveEdit} disabled={isSavingEdit} className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-lg shadow-emerald-600/15 hover:from-emerald-700 hover:to-teal-700 hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center gap-2">
                {isSavingEdit ? "Saving..." : "Save Changes"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}