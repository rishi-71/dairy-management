// src/app/dashboard/daily-entry/page.tsx
"use client";

import { useState, useEffect } from "react";
import { fetchDailyLog, saveDailyLog } from "@/actions/logActions";
import { useRouter } from "next/navigation";

export default function DailyEntryPage() {
    const router = useRouter();
  // Setup today's date as default (YYYY-MM-DD)
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);
  
  const [entries, setEntries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const [hasExistingData, setHasExistingData] = useState(false);
  const [isEditMode, setIsEditMode] = useState(true);

  // Function to load data whenever the date changes
  const loadDataForDate = async (date: string) => {
    setIsLoading(true);
    setStatusMsg("");
    try {
      const response = await fetchDailyLog(date);

      const existing = response.type === "EXISTING";
      setHasExistingData(existing);

      setIsEditMode(!existing);
      
      // Map the backend response to a unified frontend state array
      if (existing) {
        const mappedData = response.data.map((log: any) => ({
          customerId: log.customerId,
          itemId: log.itemId,
          customerName: log.customerName || log.customer.name,
          itemName: log.itemName || log.item.name,
          morningQty: log.morningDelivered,
          eveningQty: log.eveningDelivered,
         // isExisting: true
        }));
        setEntries(mappedData);
      } else {
        const mappedData = response.data.map((sub: any) => ({
          customerId: sub.customerId,
          itemId: sub.itemId,
          customerName: sub.customer.name,
          itemName: sub.item.name,
          morningQty: sub.morningQty,
          eveningQty: sub.eveningQty,
          //isExisting: false
        }));
        setEntries(mappedData);
      }
    } catch (error) {
      console.error("Failed to load data", error);
    }
    setIsLoading(false);
  };

  // Run on initial load and when selectedDate changes
  useEffect(() => {
    loadDataForDate(selectedDate);
  }, [selectedDate]);

  // Handle Input Changes inside the grid
  const handleQuantityChange = (index: number, field: string, value: string) => {
    const updatedEntries = [...entries];
    updatedEntries[index][field] = parseFloat(value) || 0;
    setEntries(updatedEntries);
  };

  // Handle Save Button Click
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveDailyLog(selectedDate, entries);
      setStatusMsg("✅ Records for this date are saved successfully!");
      setTimeout(() => setStatusMsg(""), 4000);

      router.refresh();
      
      // Reloading data will automatically set hasExistingData=true and isEditMode=false
      await loadDataForDate(selectedDate);
      
      // Re-fetch to turn them into 'EXISTING' mode
      await loadDataForDate(selectedDate); 
    } catch (error) {
      setStatusMsg("Error saving data.");
    }
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Date Picker */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center rounded-3xl border border-white/60 bg-white/70 p-6 shadow-lg backdrop-blur-xl gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Daily Deliveries</h1>
          <p className="mt-1 text-sm text-slate-600">Select a date to view or edit customer milk distributions.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
          <label className="text-sm font-bold text-slate-700 pl-2">Select Date:</label>
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border-none bg-slate-50 text-slate-900 font-bold px-3 py-2 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
          />
        </div>
      </div>

      {statusMsg && (
        <div className="p-4 bg-emerald-100 text-emerald-800 rounded-2xl font-bold border border-emerald-200 shadow-sm flex items-center justify-center transition-all animate-in fade-in slide-in-from-top-4">
          {statusMsg}
        </div>
      )}

      {/* Editable Table Grid */}
      <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-xl backdrop-blur-xl">
        {isLoading ? (
          <div className="py-12 text-center text-slate-500 font-bold animate-pulse">Loading records for {selectedDate}...</div>
        ) : (
          <div className="space-y-6">
            
            <div className="flex justify-between items-center px-2">
              <span className={`text-sm font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg ${
                hasExistingData 
                  ? isEditMode ? "bg-amber-100 text-amber-800 border border-amber-200" : "bg-blue-100 text-blue-800 border border-blue-200"
                  : "bg-emerald-100 text-emerald-800 border border-emerald-200"
              }`}>
                {hasExistingData ? (isEditMode ? '✏️ Editing Saved Records' : '🔒 Viewing Saved Records') : '✨ Loading New Subscriptions'}
              </span>
              <span className="text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded-lg">
                Total Rows: {entries.length}
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200/60 shadow-sm">
              <table className="min-w-full divide-y divide-slate-200/60">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Customer Name</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Product</th>
                    <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-500">Morning (Ltr)</th>
                    <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-500">Evening (Ltr)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {entries.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-500 font-medium">No active subscriptions found for this date.</td>
                    </tr>
                  ) : (
                    entries.map((entry, idx) => (
                      <tr key={`${entry.customerId}-${entry.itemId}`} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 text-sm font-bold text-slate-900">{entry.customerName}</td>
                        <td className="px-6 py-4 text-sm font-bold text-emerald-700">{entry.itemName}</td>
                        
                        <td className="px-6 py-4 text-center">
                          {/* 🚀 Dynamic UI: Input field when editing, simple text when locked */}
                          {isEditMode ? (
                            <input 
                              type="number" 
                              step="0.1"
                              min="0"
                              value={entry.morningQty}
                              onChange={(e) => handleQuantityChange(idx, 'morningQty', e.target.value)}
                              className="w-24 text-center rounded-lg border border-slate-300 bg-white py-2 font-semibold text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                            />
                          ) : (
                            <span className="inline-block w-24 py-2 text-slate-700 font-bold bg-slate-50 rounded-lg border border-transparent">
                              {entry.morningQty} L
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {isEditMode ? (
                            <input 
                              type="number" 
                              step="0.1"
                              min="0"
                              value={entry.eveningQty}
                              onChange={(e) => handleQuantityChange(idx, 'eveningQty', e.target.value)}
                              className="w-24 text-center rounded-lg border border-slate-300 bg-white py-2 font-semibold text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                            />
                          ) : (
                            <span className="inline-block w-24 py-2 text-slate-700 font-bold bg-slate-50 rounded-lg border border-transparent">
                              {entry.eveningQty} L
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* 🚀 SMART DYNAMIC BUTTONS */}
            {entries.length > 0 && (
              <div className="flex justify-end pt-2">
                {!isEditMode ? (
                  // State 1: Viewing existing data (Read-Only) -> Show "Edit" button
                  <button 
                    onClick={() => setIsEditMode(true)}
                    className="rounded-xl bg-slate-800 px-8 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:bg-slate-900 hover:-translate-y-0.5 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                    Edit Records
                  </button>
                ) : (
                  // State 2: Edit mode is ON. Check if it's new data or existing data.
                  <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="rounded-xl bg-emerald-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:bg-emerald-700 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
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