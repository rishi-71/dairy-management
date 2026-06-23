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
      fetchBills(true);
    } else {
      setPendingBills([]);
      setSuccessData(null);
    }
  }, [selectedCustomerId]);

  const fetchBills = async (clearSuccess = true) => {
    setIsLoading(true);
    if (clearSuccess) {
      setSuccessData(null);
    }
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
      
      const customer = customers.find(c => c.id === Number(selectedCustomerId));
      setSuccessData({
        amount: Number(amountPaid),
        remaining: res.remainingAmount,
        customerName: customer?.name || "",
        customerMobile: customer?.mobile || "",
        paymentDate: paymentDate,
        month: new Date(selectedBill.monthYear + "-02").toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        milkTotalAmount: selectedBill.milkTotalAmount,
        extraItemsAmount: selectedBill.extraItemsAmount,
        extraItems: selectedBill.extraItems || [],
        previousDue: selectedBill.previousDue,
        grandTotal: selectedBill.grandTotal
      });
      
      setAmountPaid("");
      fetchBills(false); // Refresh bills list but KEEP success data!
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
                      {new Date(b.monthYear + "-02").toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} Bill
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
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 p-6 text-slate-800 animate-in zoom-in slide-in-from-right-8 relative overflow-hidden flex flex-col justify-between">
            {/* Top decorative edge */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500"></div>

            {/* Receipt Paper */}
            <div id="receipt-paper" className="space-y-4">
              {/* Logo / Header */}
              <div className="text-center pb-2">
                <span className="inline-block p-1 px-3 bg-emerald-50 text-emerald-700 rounded-full font-black text-[10px] uppercase tracking-widest mb-1 border border-emerald-100">
                  Receipt
                </span>
                <h3 className="text-xl font-black text-slate-900 tracking-wider">DAIRY FARM</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Official Payment Voucher</p>
              </div>

              {/* Receipt Metadata */}
              <div className="border-t border-b border-dashed border-slate-200 py-3 text-xs space-y-1.5">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-400">Date:</span>
                  <span className="text-slate-800 font-bold">
                    {new Date(successData.paymentDate).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                  </span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-slate-400">Customer:</span>
                  <span className="text-slate-800 font-bold">{successData.customerName}</span>
                </div>
                {successData.customerMobile && (
                  <div className="flex justify-between font-medium">
                    <span className="text-slate-400">Mobile:</span>
                    <span className="text-slate-800 font-bold">{successData.customerMobile}</span>
                  </div>
                )}
                <div className="flex justify-between font-medium">
                  <span className="text-slate-400">Bill Period:</span>
                  <span className="text-slate-800 font-bold">{successData.month}</span>
                </div>
              </div>

              {/* Items / Breakdown */}
              <div className="space-y-2 text-xs">
                <p className="font-black text-slate-400 uppercase text-[10px] tracking-wider mb-1">Bill Details</p>
                <div className="flex justify-between">
                  <span className="text-slate-600">Monthly Milk Log</span>
                  <span className="font-bold text-slate-800">₹{successData.milkTotalAmount.toFixed(2)}</span>
                </div>

                {successData.extraItems.length > 0 && (
                  <div className="pt-1.5 border-t border-slate-100 space-y-1">
                    <span className="text-slate-400 font-bold text-[10px] uppercase block mb-1">Extra Items</span>
                    {successData.extraItems.map((item: any, idx: number) => (
                      <div key={item.id || idx} className="flex justify-between text-slate-600 pl-2">
                        <span>{item.itemName} (x{item.quantity})</span>
                        <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {successData.previousDue > 0 && (
                  <div className="flex justify-between pt-1.5 border-t border-slate-100 text-slate-500">
                    <span>Previous Outstanding</span>
                    <span>₹{successData.previousDue.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between pt-2 border-t border-slate-200 font-bold text-sm text-slate-900">
                  <span>Grand Total</span>
                  <span>₹{successData.grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-medium">Amount Received</span>
                  <span className="font-black text-emerald-600 text-sm">₹{successData.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs pt-1.5 border-t border-slate-200 border-dashed">
                  <span className="text-slate-500 font-medium">New Balance Due</span>
                  <span className="font-black text-rose-600 text-sm">₹{successData.remaining.toFixed(2)}</span>
                </div>
              </div>

              <div className="text-center pt-2">
                <p className="text-[10px] text-slate-400 font-bold italic">Thank you for your business!</p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-col gap-2">
              <button 
                onClick={() => {
                  const printContent = document.getElementById("receipt-paper")?.innerHTML;
                  if (printContent) {
                    const newWin = window.open("", "_blank");
                    if (newWin) {
                      newWin.document.write(`
                        <html>
                          <head>
                            <title>Receipt - ${successData.customerName}</title>
                            <style>
                              body { font-family: monospace; padding: 40px; color: #333; max-width: 300px; margin: 0 auto; }
                              .text-center { text-align: center; }
                              .pb-2 { padding-bottom: 8px; }
                              .py-3 { padding-top: 12px; padding-bottom: 12px; }
                              .pt-1 { padding-top: 4px; }
                              .pt-1.5 { padding-top: 6px; }
                              .pt-2 { padding-top: 8px; }
                              .mt-6 { margin-top: 24px; }
                              .space-y-4 > * + * { margin-top: 16px; }
                              .space-y-2 > * + * { margin-top: 8px; }
                              .space-y-1.5 > * + * { margin-top: 6px; }
                              .space-y-1 > * + * { margin-top: 4px; }
                              .flex { display: flex; }
                              .justify-between { justify-content: space-between; }
                              .border-t { border-top: 1px solid #eee; }
                              .border-b { border-bottom: 1px solid #eee; }
                              .border-dashed { border-style: dashed; }
                              .text-xs { font-size: 12px; }
                              .text-sm { font-size: 14px; }
                              .text-xl { font-size: 20px; }
                              .font-bold { font-weight: bold; }
                              .font-black { font-weight: 900; }
                              .font-medium { font-weight: 500; }
                              .text-slate-400 { color: #888; }
                              .text-slate-500 { color: #666; }
                              .text-slate-600 { color: #444; }
                              .text-slate-800 { color: #222; }
                              .text-slate-900 { color: #000; }
                              .bg-slate-50 { background-color: #fafafa; padding: 10px; border-radius: 6px; border: 1px solid #eee; }
                              .italic { font-style: italic; }
                              .pl-2 { padding-left: 8px; }
                              .mb-1 { margin-bottom: 4px; }
                              .uppercase { text-transform: uppercase; }
                              .block { display: block; }
                              .tracking-wider { letter-spacing: 0.05em; }
                              .tracking-widest { letter-spacing: 0.1em; }
                              @media print {
                                body { padding: 0; margin: 0; }
                              }
                            </style>
                          </head>
                          <body onload="window.print(); window.close();">
                            <div class="space-y-4">${printContent}</div>
                          </body>
                        </html>
                      `);
                      newWin.document.close();
                    }
                  }
                }}
                className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold text-sm py-3 px-4 rounded-xl shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                Print Receipt
              </button>
              
              <button 
                onClick={() => setSuccessData(null)} 
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm py-3 px-4 rounded-xl transition-all cursor-pointer"
              >
                Record Another Payment
              </button>
            </div>
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