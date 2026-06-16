import Link from "next/link";
import prisma from "@/lib/prisma";
import { getCustomers,deleteCustomer, addCustomer } from "@/actions/customerActions";

export const dynamic = 'force-dynamic';

export default async function CustomersPage() {
  const customers = await getCustomers();

  const activeProducts = await prisma.item.findMany({
    where: { isDeleted: false}
  });

  return (
    <div className="space-y-6">
      
      <div className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-lg shadow-emerald-950/5 backdrop-blur-xl">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Customer Management</h1>
        <p className="mt-1 text-sm text-slate-600">Configure customized product multi-subscriptions per client.</p>
      </div>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        
        {/* LEFT PANEL: Quick Add with Dynamic Product Iteration Inputs */}
        <div className="space-y-6 lg:col-span-4 lg:sticky lg:top-8">
          <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-xl backdrop-blur-xl max-h-[85vh] overflow-y-auto">
            <h2 className="mb-4 text-xl font-bold text-slate-900">Quick Add Account</h2>
            <form action={addCustomer} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Full Name</label>
                <input type="text" name="name" required placeholder="e.g. Rahul Patole" className="block w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2.5 text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 sm:text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Mobile Number</label>
                <input type="tel" name="mobile" required placeholder="e.g. 9876543210" className="block w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2.5 text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 sm:text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Opening Balance (₹)</label>
                <input type="number" name="openingBalance" step="0.01" defaultValue="0" className="block w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2.5 text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 sm:text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Address</label>
                <textarea name="address" rows={2} required placeholder="Delivery address..." className="block w-full resize-none rounded-xl border border-slate-200 bg-white/50 px-4 py-2.5 text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 sm:text-sm" />
              </div>

              {/* Dynamic Subscriptions Sub-Grid section block */}
              <div className="border-t border-slate-200/80 pt-4 mt-2">
                <h3 className="text-sm font-black text-emerald-800 uppercase tracking-wider mb-3">Product Daily Requirements</h3>
                <div className="space-y-4 max-h-48 overflow-y-auto pr-1">
                  {activeProducts.map((product) => (
                    <div key={product.id} className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/40 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-extrabold text-slate-800 truncate max-w-[150px]">{product.name}</span>
                        <span className="text-[11px] font-bold text-slate-400">₹{product.price}/{product.unit.substring(0,3)}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[10px] font-bold text-slate-500">Morning (AM)</span>
                          <input type="number" name={`item_${product.id}_morning`} step="0.1" defaultValue="0" min="0" className="block w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-500">Evening (PM)</span>
                          <input type="number" name={`item_${product.id}_evening`} step="0.1" defaultValue="0" min="0" className="block w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button type="submit" className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 transition-all hover:bg-emerald-700">
                  + Save Customer Account
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Directory Active Client List */}
        <div className="lg:col-span-8">
          <div className="overflow-hidden rounded-3xl border border-white/60 bg-white/80 shadow-xl shadow-emerald-950/5 backdrop-blur-xl">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200/60">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Customer Details</th>
                    <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Address</th>
                    <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Subscribed Items</th>
                    <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Balance</th>
                    <th className="px-6 py-5 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-transparent">
                  {customers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-sm font-medium text-slate-500">No active accounts found.</td>
                    </tr>
                  ) : (
                    customers.map((customer: any) => (
                      <tr key={customer.id} className="transition-colors hover:bg-white/90">
                        <td className="px-6 py-5 whitespace-nowrap">
                          <p className="text-sm font-bold text-slate-900">{customer.name}</p>
                          <p className="text-xs font-medium text-slate-500">{customer.mobile}</p>
                        </td>
                        <td className="px-6 py-5 text-sm font-medium text-slate-600 max-w-xs truncate">{customer.address}</td>
                        
                        {/* Dynamic Subscriptions Column Loop mapping items tags */}
                        <td className="px-6 py-5 max-w-xs">
                          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                            {customer.subscriptions.length === 0 ? (
                              <span className="text-xs text-slate-400 font-medium italic">No sub active</span>
                            ) : (
                              customer.subscriptions.map((sub: any) => (
                                <div key={sub.id} className="inline-flex flex-col rounded-lg bg-emerald-50/70 border border-emerald-100 p-1.5 text-[10px] leading-tight text-slate-800 font-medium">
                                  <span className="font-extrabold text-emerald-900 truncate max-w-[80px]">{sub.item.name}</span>
                                  <span className="text-[9px] text-slate-500">M: <b className="text-slate-700">{sub.morningQty}</b> | E: <b className="text-slate-700">{sub.eveningQty}</b></span>
                                </div>
                              ))
                            )}
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-6 py-5 text-sm font-black text-rose-600">
                          ₹{customer.openingBalance}
                        </td>
                        <td className="whitespace-nowrap px-6 py-5 text-sm flex justify-end gap-4 items-center">
                          <Link href={`/dashboard/customers/${customer.id}`} className="font-semibold text-emerald-600 hover:text-emerald-800">Edit</Link>
                          <form action={deleteCustomer}>
                            <input type="hidden" name="id" value={customer.id} />
                            <button type="submit" className="font-semibold text-rose-500 hover:text-rose-700">Delete</button>
                          </form>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}