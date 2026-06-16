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
  const updateCustomerWithId = updateCustomer.bind(null, customer.id);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-50 via-slate-50 to-teal-100 px-4 py-12 sm:px-6 lg:px-8">
      <div className="relative z-10 w-full max-w-3xl">
        <div className="overflow-hidden rounded-3xl border border-white/60 bg-white/80 p-8 shadow-2xl shadow-emerald-950/10 backdrop-blur-xl">
          <div className="mb-6">
            <h1 className="text-2xl font-extrabold text-slate-900">Modify Subscriptions</h1>
          </div>

          <form action={updateCustomerWithId} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
                <input type="text" name="name" defaultValue={customer.name} required className="block w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2.5 text-slate-900 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Mobile</label>
                <input type="tel" name="mobile" defaultValue={customer.mobile} required className="block w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2.5 text-slate-900 focus:outline-none" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Opening Balance</label>
                <input type="number" name="openingBalance" defaultValue={customer.openingBalance} step="0.01" className="block w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2.5 text-slate-900 focus:outline-none" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Address</label>
                <textarea name="address" rows={2} defaultValue={customer.address} required className="block w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2.5 text-slate-900 resize-none focus:outline-none" />
              </div>
            </div>

            {/* Dynamic Loop injection inside Edit Option */}
            <div className="border-t border-slate-200 pt-4">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-3">Product Matrix Requirements</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 max-h-64 overflow-y-auto p-1">
                {activeProducts.map((product) => {
                  const subMatch = customer.subscriptions.find((s: any) => s.itemId === product.id);
                  return (
                    <div key={product.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                      <p className="text-xs font-black text-slate-800 truncate">{product.name}</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[10px] font-bold text-slate-500">Morning</span>
                          <input type="number" name={`item_${product.id}_morning`} step="0.1" defaultValue={subMatch?.morningQty ?? 0} min="0" className="block w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-900 focus:outline-none" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-500">Evening</span>
                          <input type="number" name={`item_${product.id}_evening`} step="0.1" defaultValue={subMatch?.eveningQty ?? 0} min="0" className="block w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-900 focus:outline-none" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

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