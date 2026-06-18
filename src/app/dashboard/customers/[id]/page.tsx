// src/app/dashboard/customers/[id]/page.tsx
import { getCustomerById, updateCustomer } from "@/actions/customerActions";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await getCustomerById(id);
  if (!customer) return notFound();

  const activeProducts = await prisma.item.findMany({ where: { isDeleted: false } });
  
  // Aise items nikal rahe hain jo customer ne abhi tak subscribe nahi kiye
  const unSubscribedProducts = activeProducts.filter(
    (p) => !customer.subscriptions.some((sub: any) => sub.itemId === p.id)
  );

  const updateCustomerWithId = updateCustomer.bind(null, customer.id.toString());

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-50 via-slate-50 to-teal-100 px-4 py-12 sm:px-6 lg:px-8">
      <div className="relative z-10 w-full max-w-3xl">
        <div className="overflow-hidden rounded-3xl border border-white/60 bg-white/80 p-8 shadow-2xl shadow-emerald-950/10 backdrop-blur-xl">
          <div className="mb-6">
            <h1 className="text-2xl font-extrabold text-slate-900">Modify Account</h1>
          </div>

          <form action={updateCustomerWithId} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
                <input type="text" name="name" defaultValue={customer.name} required className="block w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Mobile</label>
                <input type="tel" name="mobile" defaultValue={customer.mobile} required className="block w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Opening Balance</label>
                <input type="number" name="openingBalance" defaultValue={customer.openingBalance} step="0.01" className="block w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Address</label>
                <textarea name="address" rows={2} defaultValue={customer.address} required className="block w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2.5 text-slate-900 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
              </div>
            </div>

            {/* 🚀 FIXED: Only show ALREADY SUBSCRIBED items */}
            <div className="border-t border-slate-200 pt-4">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-3">Active Subscriptions</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 max-h-64 overflow-y-auto p-1">
                
                {customer.subscriptions.length === 0 && (
                  <p className="text-sm text-slate-500 col-span-2">No active products. Please add one below.</p>
                )}

                {customer.subscriptions.map((sub: any) => (
                  <div key={sub.itemId} className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-3">
                    <p className="text-xs font-black text-emerald-800 truncate">{sub.item.name}</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500">Morning Qty</span>
                        <input type="number" name={`item_${sub.itemId}_morning`} step="0.1" defaultValue={sub.morningQty} min="0" className="block w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-500">Evening Qty</span>
                        <input type="number" name={`item_${sub.itemId}_evening`} step="0.1" defaultValue={sub.eveningQty} min="0" className="block w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 🚀 NEW: Add New Product Dropdown (Just in case) */}
            {unSubscribedProducts.length > 0 && (
              <div className="border-t border-slate-200 pt-4 bg-slate-50/50 rounded-2xl p-4 mt-2 border-dashed">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3">+ Add New Product to Subscription</h3>
                <div className="space-y-3">
                  <select name="newItemId" defaultValue="" className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 focus:outline-none">
                    <option value="" disabled>-- Select a product --</option>
                    {unSubscribedProducts.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} (₹{p.price})</option>
                    ))}
                  </select>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="number" name="newMorning" step="0.1" defaultValue="0" min="0" placeholder="Morning Qty" className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none" />
                    <input type="number" name="newEvening" step="0.1" defaultValue="0" min="0" placeholder="Evening Qty" className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none" />
                  </div>
                </div>
              </div>
            )}

            <div className="pt-4 flex justify-end gap-4 border-t border-slate-200">
              <Link href="/dashboard/customers" className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors">Cancel</Link>
              <button type="submit" className="rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:bg-emerald-700">Save Changes</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}