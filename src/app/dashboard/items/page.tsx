// src/app/dashboard/items/page.tsx
import Link from "next/link";
import { getItems, deleteItem } from "@/actions/itemActions";

export default async function ItemsPage() {
  const items = await getItems();

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-emerald-50 via-slate-50 to-teal-100 p-4 sm:p-8 text-slate-900">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:24px_24px] opacity-40"></div>
      <div className="absolute top-[-10%] left-[-10%] -z-10 h-[500px] w-[500px] rounded-full bg-emerald-300/40 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] -z-10 h-[600px] w-[600px] rounded-full bg-teal-300/40 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -z-10 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/60 blur-[100px] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-6xl space-y-6">
        
        {/* Navigation Back Button */}
        <div>
          <Link href="/dashboard" className="inline-flex items-center rounded-full border border-teal-200 bg-white/60 px-4 py-1.5 text-sm font-semibold text-teal-700 shadow-sm backdrop-blur-md transition-colors hover:bg-white/80">
            &larr; Back to Dashboard
          </Link>
        </div>

        {/* Header Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-3xl border border-white/60 bg-white/70 p-6 shadow-lg shadow-teal-900/5 backdrop-blur-xl">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Dairy Inventory</h1>
            <p className="mt-1 text-sm text-slate-600">Manage your product pricing and units.</p>
          </div>
          <Link href="/dashboard/items/new" className="inline-flex items-center justify-center rounded-xl bg-teal-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-teal-500/30 transition-all duration-300 hover:-translate-y-0.5 hover:bg-teal-700">
            + Add Product
          </Link>
        </div>

        {/* Table Container */}
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
                    <td colSpan={4} className="p-12 text-center text-sm font-medium text-slate-500">No items found.</td>
                  </tr>
                ) : (
                  items.map((item: any) => (
                    <tr key={item._id} className="transition-colors hover:bg-white/90">
                      <td className="whitespace-nowrap px-6 py-5 text-sm font-bold text-slate-900">{item.name}</td>
                      <td className="whitespace-nowrap px-6 py-5 text-sm font-medium text-slate-600">₹{item.price}</td>
                      <td className="whitespace-nowrap px-6 py-5 text-sm font-medium text-slate-600">per {item.unit}</td>
                      <td className="whitespace-nowrap px-6 py-5 text-sm flex justify-end gap-4 items-center">
                        <Link href={`/dashboard/items/${item._id}`} className="font-semibold text-teal-600 hover:text-teal-800">Edit</Link>
                        <form action={deleteItem}>
                          <input type="hidden" name="id" value={item._id} />
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
  );
}