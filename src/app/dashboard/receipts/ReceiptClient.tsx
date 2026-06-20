// src/app/dashboard/receipts/ReceiptClient.tsx
"use client";

import { useState, useEffect } from "react";
import { getPendingBills, recordPayment } from "@/actions/receiptActions";

export default function ReceiptClient({ customers }: { customers: any[] }) {
  const today = new Date().toISOString().split('T')[0];
  
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [paymentDate, setPaymentDate] = useState(today);
  const [pendingBills, setPendingBills] = useState<any[]>([]);
  const [selectedBillId, setSelectedBillId] = useState("");
  
  const [amountPaid, setAmountPaid] = useState<number | "">("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);

  useEffect(() => {
    if (selectedCustomerId) {
      fetchBills();
    } else {
      setPendingBills([]);
    }
  }, [selectedCustomerId]);

  const fetchBills = async () => {
    setIsLoading(true);
    setSuccessData(null);
    try {
      const bills = await getPendingBills(Number(selectedCustomerId));
      setPendingBills(bills);
      if (bills.length > 0) {
        setSelectedBillId(bills[0].id.toString());
      } else {
        setSelectedBillId("");
      }
    } catch (error) {
      console.error(error);
    }
    setIsLoading(false);
  };

  const selectedBill = pendingBills.find(b => b.id.toString() === selectedBillId);
  
  // Outstanding amount is Grand Total minus previously paid amount
  const currentOutstanding = selectedBill ? (selectedBill.grandTotal - selectedBill.amountPaid) : 0;
  const remainingAfterPayment = selectedBill ? (currentOutstanding - (Number(amountPaid) || 0)) : 0;

  const handleSavePayment = async () => {
    if (!selectedBill || !amountPaid) return;
    setIsSaving(true);
    try {
      const res = await recordPayment({
        customerId: Number(selectedCustomerId),
        dateStr: paymentDate,
        monthYear: selectedBill.monthYear,
        totalBilled: currentOutstanding,
        amountPaid: Number(amountPaid)
      });
      
      const customerName = customers.find(c => c.id === Number(selectedCustomerId))?.name;
      setSuccessData({
        amount: Number(amountPaid),
        remaining: res.remainingAmount,
        customerName: customerName,
        month: selectedBill.monthYear
      });
      
      setAmountPaid("");
      fetchBills(); // Refresh bills list
    } catch (error) {
      alert("Error saving payment.");
    }
    setIsSaving(false);
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* LEFT FORM PANEL */}
      <div className="w-full md:w-2/3 rounded-3xl border border-slate-200/60 bg-white shadow-xl overflow-hidden relative z-10 animate-in fade-in slide-in-from-bottom-4">
        <div className="bg-slate-800 text-white p-6">
          <h2 className="text-xl font-black tracking-widest uppercase">New Receipt Entry</h2>
        </div>
        
        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">1. Select Customer</label>
              <select value={selectedCustomerId} onChange={(e) => setSelectedCustomerId(e.target.value)} className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer">
                <option value="" disabled>-- Choose Customer --</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.mobile})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">2. Payment Date</label>
              <input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer" />
            </div>
          </div>

          {isLoading ? (
            <div className="p-4 text-center font-bold text-slate-400 animate-pulse">Checking pending bills...</div>
          ) : selectedCustomerId && pendingBills.length === 0 ? (
            <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100 text-center">
              <span className="text-2xl mb-2 block">🎉</span>
              <p className="text-emerald-800 font-bold">No pending bills for this customer!</p>
            </div>
          ) : selectedCustomerId && pendingBills.length > 0 && (
            <div className="space-y-6 animate-in zoom-in-95 duration-300">
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl">
                <label className="block text-sm font-bold text-slate-600 mb-2">3. Select Pending Bill</label>
                <select value={selectedBillId} onChange={(e) => setSelectedBillId(e.target.value)} className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer">
                  {pendingBills.map(b => (
                    <option key={b.id} value={b.id}>
                      {new Date(b.monthYear).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} Bill
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex-1 bg-amber-50 border border-amber-200 p-6 rounded-2xl">
                  <p className="text-xs font-black uppercase tracking-widest text-amber-600/70 mb-1">Total Outstanding</p>
                  <p className="text-3xl font-black text-amber-900">₹{currentOutstanding.toFixed(2)}</p>
                </div>
                
                <div className="flex-1 relative">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Enter Amount Received</p>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-400">₹</span>
                    <input 
                      type="number" 
                      min="0"
                      value={amountPaid} 
                      onChange={(e) => setAmountPaid(parseFloat(e.target.value) || "")}
                      placeholder="0.00"
                      className="block w-full rounded-2xl border-2 border-emerald-200 bg-white pl-10 pr-4 py-4 text-3xl font-black text-slate-900 focus:outline-none focus:border-emerald-500 shadow-sm"
                    />
                  </div>
                </div>
              </div>

              {amountPaid !== "" && (
                <div className="p-4 bg-slate-800 rounded-xl flex justify-between items-center text-white">
                  <span className="text-sm font-bold text-slate-300 uppercase tracking-widest">Calculated Balance Due:</span>
                  <span className="text-xl font-black">₹{remainingAfterPayment.toFixed(2)}</span>
                </div>
              )}

              <button 
                onClick={handleSavePayment} 
                disabled={isSaving || !amountPaid} 
                className="w-full bg-emerald-600 text-white font-black text-lg py-4 rounded-xl shadow-lg hover:bg-emerald-700 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:transform-none flex justify-center items-center gap-2"
              >
                {isSaving ? "Saving..." : "Generate Receipt & Update Balance"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL (SUCCESS PREVIEW) */}
      <div className="w-full md:w-1/3">
        {successData ? (
          <div className="bg-white rounded-3xl shadow-xl border border-emerald-100 p-8 text-center animate-in zoom-in slide-in-from-right-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500"></div>
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-1">Payment Received!</h3>
            <p className="text-sm font-bold text-slate-500 mb-6">{successData.customerName}</p>
            
            <div className="bg-slate-50 rounded-xl p-4 mb-6 text-left space-y-2 border border-slate-200 border-dashed">
              <div className="flex justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase">Paid</span>
                <span className="text-sm font-black text-emerald-600">₹{successData.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase">Bill Month</span>
                <span className="text-sm font-bold text-slate-700">{successData.month}</span>
              </div>
              <hr className="border-slate-200" />
              <div className="flex justify-between">
                <span className="text-xs font-black text-slate-500 uppercase">New Balance Due</span>
                <span className="text-sm font-black text-rose-600">₹{successData.remaining.toFixed(2)}</span>
              </div>
            </div>
            
            <button onClick={() => setSuccessData(null)} className="text-sm font-bold text-emerald-600 hover:text-emerald-800">
              Record another payment
            </button>
          </div>
        ) : (
          <div className="h-full border-2 border-dashed border-slate-200 rounded-3xl flex items-center justify-center p-8 bg-white/30 backdrop-blur-sm">
             <p className="text-slate-400 font-bold text-center">Receipt preview will appear here after saving.</p>
          </div>
        )}
      </div>
    </div>
  );
}