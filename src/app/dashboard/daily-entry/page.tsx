// src/app/dashboard/daily-entry/page.tsx
"use client";

import { useState, useEffect } from "react";
import { fetchDailyLog, saveDailyLog } from "@/actions/logActions";
import { useRouter } from "next/navigation";

export default function DailyEntryPage() {
  const router = useRouter();
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);
  
  const [entries, setEntries] = useState<any[]>([]);
  const [allItems, setAllItems] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [hasExistingData, setHasExistingData] = useState(false);
  const [isEditMode, setIsEditMode] = useState(true);
  
  // 🚀 Naya State
  const [isDayLogged, setIsDayLogged] = useState(false);

  const loadDataForDate = async (date: string) => {
    setIsLoading(true);
    setStatusMsg("");
    try {
      const response = await fetchDailyLog(date);
      
      const existing = response.type === "EXISTING";
      setHasExistingData(existing);
      setIsEditMode(!existing); 
      setAllItems(response.allItems || []);
      
      // 🚀 Agar existing data hai, toh isko true kardo
      setIsDayLogged(existing);

      let mappedData: any[] = [];
      const sourceData = response.data || [];

      // 1. Map Primary Data
      mappedData = sourceData.map((log: any) => ({
        customerId: log.customerId,
        itemId: log.itemId,
        customerName: log.customerName || log.customer?.name,
        itemName: log.itemName || log.item?.name,
        morningQty: existing ? log.morningDelivered : log.morningQty,
        eveningQty: existing ? log.eveningDelivered : log.eveningQty,
        price: existing ? log.price : (log.item?.price || 0),
        extraItems: []
      }));
      
      // 2. Safely Map Extra Items fetched from DB
      if (response.extraLogs && response.extraLogs.length > 0) {
        response.extraLogs.forEach((extra: any) => {
          const targetRow = mappedData.find(e => e.customerId === extra.customerId);
          if (targetRow) {
            targetRow.extraItems.push({
              itemId: extra.itemId,
              itemName: extra.itemName,
              price: extra.price,
              qty: extra.quantity
            });
          }
        });
      }

      mappedData.sort((a, b) => a.customerName.localeCompare(b.customerName));
      setEntries(mappedData);

    } catch (error) {
      console.error("Failed to load data", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadDataForDate(selectedDate);
  }, [selectedDate]);

  const handleQuantityChange = (index: number, field: string, value: string) => {
    const updatedEntries = [...entries];
    updatedEntries[index] = { ...updatedEntries[index], [field]: parseFloat(value) || 0 };
    setEntries(updatedEntries);
  };

  const handleAddExtraItem = (entryIndex: number, itemId: string) => {
    if (!itemId) return;
    const itemToAdd = allItems.find(i => i.id === Number(itemId));
    if (!itemToAdd) return;

    const updatedEntries = [...entries];
    updatedEntries[entryIndex] = {
      ...updatedEntries[entryIndex],
      extraItems: [...updatedEntries[entryIndex].extraItems]
    };

    updatedEntries[entryIndex].extraItems.push({
      itemId: itemToAdd.id,
      itemName: itemToAdd.name,
      price: itemToAdd.price,
      qty: 1
    });
    setEntries(updatedEntries);
  };

  const handleExtraQtyChange = (entryIndex: number, extraIndex: number, value: string) => {
    const updatedEntries = [...entries];
    updatedEntries[entryIndex] = {
      ...updatedEntries[entryIndex],
      extraItems: [...updatedEntries[entryIndex].extraItems]
    };
    updatedEntries[entryIndex].extraItems[extraIndex] = {
      ...updatedEntries[entryIndex].extraItems[extraIndex],
      qty: parseFloat(value) || 0
    };
    setEntries(updatedEntries);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveDailyLog(selectedDate, entries);
      // 🚀 Save hote hi indicator update
      setIsDayLogged(true); 
      setStatusMsg("✅ Records for this date are saved successfully!");
      setTimeout(() => setStatusMsg(""), 4000);
      router.refresh();
      await loadDataForDate(selectedDate); 
    } catch (error) {
      setStatusMsg("❌ Error saving data.");
    }
    setIsSaving(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center rounded-3xl border border-white/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/70 p-6 shadow-lg shadow-emerald-950/5 dark:shadow-none backdrop-blur-xl gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">Daily Deliveries</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Select a date to view or edit customer milk distributions.</p>
        </div>
        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300 pl-2">Select Date:</label>
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="border-none bg-transparent text-slate-900 dark:text-slate-100 font-black px-1 focus:outline-none cursor-pointer" />
        </div>
      </div>

      {statusMsg && (
        <div className="p-4 bg-emerald-100 text-emerald-800 rounded-2xl font-bold border border-emerald-200 shadow-sm flex items-center justify-center transition-all animate-in fade-in slide-in-from-top-4">
          {statusMsg}
        </div>
      )}

      <div className="rounded-3xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 shadow-xl dark:shadow-none overflow-hidden relative">
        {isLoading ? (
          <div className="py-12 text-center text-slate-400 dark:text-slate-500 font-bold animate-pulse">Loading records for {selectedDate}...</div>
        ) : (
          <div className="space-y-4 p-6">
            <div className="flex justify-between items-center px-2">
              
              {/* 🚀 SMART INDICATOR BADGE */}
              <div className="flex items-center">
                {isDayLogged ? (
                  <span className="inline-flex items-center gap-1.5 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-400 px-3 py-1.5 rounded-lg text-[11px] font-black tracking-wider uppercase border border-emerald-200 dark:border-emerald-900/30 shadow-sm animate-in zoom-in">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                    Records Saved
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 bg-amber-100 dark:bg-amber-950/30 text-amber-800 dark:text-amber-400 px-3 py-1.5 rounded-lg text-[11px] font-black tracking-wider uppercase border border-amber-200 dark:border-amber-900/30 shadow-sm animate-in zoom-in">
                    <svg className="w-4 h-4 animate-[spin_3s_linear_infinite]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Pending Entry
                  </span>
                )}
              </div>

              <span className="text-[11px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-450 px-3 py-1.5 rounded-lg">Total Customers: {entries.length}</span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm max-h-[60vh]">
              <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800/60 relative">
                <thead className="bg-slate-50/90 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Customer Name</th>
                    <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Product</th>
                    <th className="px-6 py-4 text-center text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Morning (Ltr)</th>
                    <th className="px-6 py-4 text-center text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Evening (Ltr)</th>
                    <th className="px-6 py-4 text-right text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 min-w-[200px]">Extra Items</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/80 dark:divide-slate-800/50 bg-white dark:bg-slate-900">
                  {entries.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400 font-medium">No active subscriptions found for this date.</td>
                    </tr>
                  ) : (
                    entries.map((entry, idx) => {
                      
                      const customerCurrentItems = entries.filter(e => e.customerId === entry.customerId).map(e => e.itemId);
                      entry.extraItems.forEach((ex: any) => customerCurrentItems.push(ex.itemId));
                      const availableExtraItems = (allItems || []).filter(i => !customerCurrentItems.includes(i.id));

                      return (
                        <tr key={`${entry.customerId}-${entry.itemId}`} className="hover:bg-slate-50 dark:hover:bg-slate-950/20 transition-colors">
                          <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-slate-150 whitespace-nowrap">{entry.customerName}</td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-bold text-emerald-700 dark:text-emerald-450">{entry.itemName}</p>
                            <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500">Locked @ ₹{entry.price}/unit</p>
                          </td>
                          
                          <td className="px-6 py-4 text-center">
                            {isEditMode ? (
                              <input type="number" step="0.1" min="0" value={entry.morningQty} onChange={(e) => handleQuantityChange(idx, 'morningQty', e.target.value)} className="w-20 text-center rounded-lg border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 py-1.5 font-bold text-slate-900 dark:text-slate-100 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white dark:focus:bg-slate-950 outline-none transition-all" />
                            ) : (
                              <span className="inline-block w-20 py-1.5 text-emerald-700 dark:text-emerald-400 font-black bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-transparent">{entry.morningQty}</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {isEditMode ? (
                              <input type="number" step="0.1" min="0" value={entry.eveningQty} onChange={(e) => handleQuantityChange(idx, 'eveningQty', e.target.value)} className="w-20 text-center rounded-lg border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 py-1.5 font-bold text-slate-900 dark:text-slate-100 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white dark:focus:bg-slate-950 outline-none transition-all" />
                            ) : (
                              <span className="inline-block w-20 py-1.5 text-emerald-700 dark:text-emerald-400 font-black bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-transparent">{entry.eveningQty}</span>
                            )}
                          </td>

                          <td className="px-6 py-4 text-right">
                            <div className="flex flex-col gap-2 items-end">
                              {entry.extraItems.map((extra: any, extraIdx: number) => (
                                <div key={extra.itemId} className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/20 px-2 py-1.5 rounded-lg border border-amber-100 dark:border-amber-900/30">
                                  <span className="text-[11px] font-bold text-amber-900 dark:text-amber-400">{extra.itemName} <span className="text-[9px] text-amber-600/70 dark:text-amber-450/70">(₹{extra.price})</span></span>
                                  {isEditMode ? (
                                    <input type="number" step="0.5" min="0" value={extra.qty} onChange={(e) => handleExtraQtyChange(idx, extraIdx, e.target.value)} className="w-14 text-center text-xs p-1 rounded-md border border-slate-300 dark:border-slate-800 dark:bg-slate-950 focus:outline-none focus:border-amber-500 dark:focus:border-amber-500 font-bold dark:text-slate-100" />
                                  ) : (
                                    <span className="text-xs font-black bg-white dark:bg-slate-950 px-2 py-1 rounded-md text-amber-800 dark:text-amber-400 shadow-sm border border-amber-100 dark:border-amber-900/30">Qty: {extra.qty}</span>
                                  )}
                                </div>
                              ))}

                              {isEditMode && availableExtraItems.length > 0 && (
                                <select 
                                  className="text-[10px] font-bold text-slate-500 bg-white dark:bg-slate-950 border border-dashed border-slate-300 dark:border-slate-850 rounded-lg px-2 py-1.5 outline-none cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors max-w-[150px] uppercase tracking-wider dark:text-slate-300"
                                  onChange={(e) => handleAddExtraItem(idx, e.target.value)}
                                  value=""
                                >
                                  <option value="" disabled className="dark:bg-slate-900">+ Extra Item</option>
                                  {availableExtraItems.map(item => (
                                    <option key={item.id} value={item.id} className="dark:bg-slate-900">{item.name} (₹{item.price})</option>
                                  ))}
                                </select>
                              )}
                              
                              {!isEditMode && entry.extraItems.length === 0 && (
                                <span className="text-xs text-slate-300 dark:text-slate-550 font-medium">-</span>
                              )}
                            </div>
                          </td>

                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {entries.length > 0 && (
              <div className="flex justify-end pt-4 bg-slate-50 dark:bg-slate-950/40 -mx-6 -mb-6 px-6 py-4 border-t border-slate-200 dark:border-slate-800/80">
                {!isEditMode ? (
                  <button onClick={() => setIsEditMode(true)} className="rounded-xl bg-slate-800 dark:bg-slate-950 px-8 py-3.5 text-sm font-bold text-white dark:text-slate-250 shadow-lg transition-all hover:bg-slate-900 dark:hover:bg-slate-900 hover:-translate-y-0.5 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg> Edit Records
                  </button>
                ) : (
                  <button onClick={handleSave} disabled={isSaving} className="rounded-xl bg-emerald-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:bg-emerald-700 hover:-translate-y-0.5 disabled:opacity-50 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    {isSaving ? "Saving..." : hasExistingData ? "Update Changes" : "Save Daily Records"}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}