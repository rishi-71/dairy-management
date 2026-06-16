// src/app/dashboard/items/page.tsx
import Link from "next/link";
import { getItems, deleteItem, addItem } from "@/actions/itemActions";

export default async function ItemsPage() {
  const items = await getItems();

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-emerald-50 via-slate-50 to-teal-100 p-4 sm:p-8 text-slate-900">
      
      {/* Background Elements */}
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:24px_24px] opacity-40"></div>
      <div className="absolute top-[-10%] left-[-10%] -z-10 h-[500px] w-[500px] rounded-full bg-emerald-300/40 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] -z-10 h-[600px] w-[600px] rounded-full bg-teal-300/40 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -z-10 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/60 blur-[100px] pointer-events-none" />

      {/* --- MAIN CONTENT CONTAINER --- */}
      <div className="relative z-10 mx-auto max-w-7xl space-y-6">
        


        {/* Header Section */}
        <div className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-lg shadow-teal-900/5 backdrop-blur-xl">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Dairy Inventory</h1>
          <p className="mt-1 text-sm text-slate-600">Manage your product catalog, update pricing, and set selling units.</p>
        </div>

        {/* --- SPLIT SCREEN GRID --- */}
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          
          {/* LEFT COLUMN (Stats & Add Form) */}
          <div className="space-y-6 lg:col-span-4 lg:sticky lg:top-8">
            
            {/* Quick Stats Box */}
            <div className="flex items-center justify-between rounded-3xl border border-white/60 bg-white/80 p-6 shadow-xl shadow-teal-900/5 backdrop-blur-xl">
              <div>
                <p className="text-sm font-semibold text-slate-500">Active Products</p>
                <p className="mt-1 text-4xl font-extrabold text-teal-600">{items.length}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100 text-teal-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
              </div>
            </div>

            {/* Inline Quick Add Form */}
            <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-xl shadow-teal-900/5 backdrop-blur-xl">
              <h2 className="mb-4 text-xl font-bold text-slate-900">Quick Add Item</h2>
              <form action={addItem} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Product Name</label>
                  <input type="text" name="name" required placeholder="e.g. Cow Milk" className="block w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-teal-500/10 sm:text-sm" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Price (₹)</label>
                  <input type="number" name="price" required min="0" step="0.01" placeholder="e.g. 60" className="block w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-teal-500/10 sm:text-sm" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Selling Unit</label>
                  <select name="unit" required className="block w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 text-slate-900 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-teal-500/10 sm:text-sm">
                    <option value="Liter">Liter</option>
                    <option value="Kg">Kg</option>
                    <option value="Packet">Packet</option>
                    <option value="Piece">Piece</option>
                  </select>
                </div>
                <div className="pt-2">
                  <button type="submit" className="w-full rounded-xl bg-teal-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-teal-500/30 transition-all hover:-translate-y-0.5 hover:bg-teal-700">
                    + Save Product
                  </button>
                </div>
              </form>
            </div>

          </div>

          {/* RIGHT COLUMN (Inventory Table) */}
          <div className="lg:col-span-8">
            <div className="overflow-hidden rounded-3xl border border-white/60 bg-white/80 shadow-xl shadow-teal-900/5 backdrop-blur-xl">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200/60">
                  <thead className="bg-slate-50/50">
                    <tr>
                      <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Item Name</th>
                      <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Price (₹)</th>
                      <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Unit</th>
                      <th className="px-6 py-5 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-transparent">
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-12 text-center text-sm font-medium text-slate-500">
                          No items in inventory. Use the quick add form to create one!
                        </td>
                      </tr>
                    ) : (
                      items.map((item: any) => (
                        // FIX: Key points to item.id instead of ._id
                        <tr key={item.id} className="transition-colors hover:bg-white/90">
                          <td className="whitespace-nowrap px-6 py-5 text-sm font-bold text-slate-900">{item.name}</td>
                          <td className="whitespace-nowrap px-6 py-5 text-sm font-medium text-slate-600">₹{item.price}</td>
                          <td className="whitespace-nowrap px-6 py-5 text-sm font-medium text-slate-600">per {item.unit}</td>
                          {/* FIX: Actions correctly route using item.id */}
                          <td className="whitespace-nowrap px-6 py-5 text-sm flex justify-end gap-4 items-center">
                            <Link href={`/dashboard/items/${item.id}`} className="font-semibold text-teal-600 hover:text-teal-800">
                              Edit
                            </Link>
                            <form action={deleteItem}>
                              <input type="hidden" name="id" value={item.id} />
                              <button type="submit" className="font-semibold text-rose-500 hover:text-rose-700">
                                Delete
                              </button>
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
    </div>
  );
}