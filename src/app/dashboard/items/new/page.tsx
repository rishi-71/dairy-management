// src/app/dashboard/items/new/page.tsx
import { addItem } from "@/actions/itemActions";
import Link from "next/link";

export default function NewItemPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-50 via-slate-50 to-teal-100 px-4 py-12 sm:px-6 lg:px-8">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:24px_24px] opacity-40"></div>
      <div className="absolute top-0 left-0 -z-10 h-[500px] w-[500px] translate-x-[-20%] translate-y-[-20%] rounded-full bg-emerald-300/40 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 -z-10 h-[600px] w-[600px] translate-x-[20%] translate-y-[20%] rounded-full bg-teal-300/40 blur-[120px] pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-2xl">
        <div className="mb-6 flex justify-center sm:justify-start">
          <Link href="/dashboard/items" className="inline-flex items-center rounded-full border border-teal-200 bg-white/60 px-4 py-1.5 text-sm font-semibold text-teal-700 shadow-sm backdrop-blur-md transition-colors hover:bg-white/80">
            &larr; Back to Inventory
          </Link>
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/60 bg-white/80 p-8 sm:p-10 shadow-2xl shadow-teal-900/10 backdrop-blur-xl">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Add New Item</h1>
            <p className="mt-2 text-sm text-slate-500">Create a new product for your dairy inventory.</p>
          </div>

          <form action={addItem} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Product Name</label>
                <input type="text" name="name" required placeholder="e.g. Buffalo Milk" className="block w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3.5 text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-teal-500/10 sm:text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Price (₹)</label>
                <input type="number" name="price" required min="0" step="0.01" placeholder="e.g. 60" className="block w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3.5 text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-teal-500/10 sm:text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Selling Unit</label>
                <select name="unit" required className="block w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3.5 text-slate-900 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-teal-500/10 sm:text-sm">
                  <option value="Liter">Liter</option>
                  <option value="Kg">Kg</option>
                  <option value="Packet">Packet</option>
                  <option value="Piece">Piece</option>
                </select>
              </div>
            </div>
            <div className="pt-4 mt-8 border-t border-slate-200/60">
              <button type="submit" className="group w-full flex justify-center rounded-xl bg-teal-600 px-4 py-3.5 text-base font-bold text-white shadow-lg shadow-teal-500/30 transition-all hover:-translate-y-0.5 hover:bg-teal-700">Save Product</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}