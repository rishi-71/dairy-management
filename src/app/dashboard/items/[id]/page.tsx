// src/app/dashboard/items/[id]/page.tsx
import { getItemById, updateItem } from "@/actions/itemActions";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EditItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getItemById(id);

  if (!item) return notFound();

  // FIX: Changed item._id to item.id for MySQL/Prisma compliance
  const updateItemWithId = updateItem.bind(null, item.id);

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
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Edit Item</h1>
            <p className="mt-2 text-sm text-slate-500">Update pricing and unit details.</p>
          </div>

          <form action={updateItemWithId} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Product Name</label>
                <input type="text" name="name" defaultValue={item.name} required className="block w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3.5 text-slate-900 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-teal-500/10 sm:text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Price (₹)</label>
                <input type="number" name="price" defaultValue={item.price} required min="0" step="0.01" className="block w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3.5 text-slate-900 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-teal-500/10 sm:text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Selling Unit</label>
                <select name="unit" defaultValue={item.unit} required className="block w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3.5 text-slate-900 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-teal-500/10 sm:text-sm">
                  <option value="Liter">Liter</option>
                  <option value="Kg">Kg</option>
                  <option value="Packet">Packet</option>
                  <option value="Piece">Piece</option>
                </select>
              </div>
            </div>
            <div className="pt-4 mt-8 flex justify-end gap-4 border-t border-slate-200/60">
              <Link href="/dashboard/items" className="rounded-xl px-6 py-3.5 text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors">Cancel</Link>
              <button type="submit" className="rounded-xl bg-teal-600 px-8 py-3.5 text-base font-bold text-white shadow-lg shadow-teal-500/30 transition-all hover:-translate-y-0.5 hover:bg-teal-700">Update Product</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}