// src/app/dashboard/customers/page.tsx
import Link from "next/link";
import { getCustomers, deleteCustomer, addCustomer } from "@/actions/customerActions";

export default async function CustomersPage() {
  const customers = await getCustomers();

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-emerald-50 via-slate-50 to-teal-100 p-4 sm:p-8 text-slate-900">
      
      {/* Background Elements */}
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:24px_24px] opacity-40"></div>
      <div className="absolute top-[-10%] left-[-10%] -z-10 h-[500px] w-[500px] rounded-full bg-emerald-300/40 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] -z-10 h-[600px] w-[600px] rounded-full bg-teal-300/40 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -z-10 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/60 blur-[100px] pointer-events-none" />

      {/* --- MAIN CONTENT CONTAINER --- */}
      <div className="relative z-10 mx-auto max-w-7xl space-y-6">
        
        {/* Navigation Back Button */}
        <div>
          <Link href="/dashboard" className="inline-flex items-center rounded-full border border-emerald-200 bg-white/60 px-4 py-1.5 text-sm font-semibold text-emerald-700 shadow-sm backdrop-blur-md transition-colors hover:bg-white/80">
            &larr; Back to Dashboard
          </Link>
        </div>

        {/* Header Section */}
        <div className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-lg shadow-emerald-900/5 backdrop-blur-xl">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Customer Management</h1>
          <p className="mt-1 text-sm text-slate-600">Manage your subscribers, add new routes, and track deliveries.</p>
        </div>

        {/* --- SPLIT SCREEN GRID --- */}
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          
          {/* LEFT COLUMN (Stats & Add Form) */}
          <div className="space-y-6 lg:col-span-4 lg:sticky lg:top-8">
            
            {/* Quick Stats Box */}
            <div className="flex items-center justify-between rounded-3xl border border-white/60 bg-white/80 p-6 shadow-xl shadow-emerald-900/5 backdrop-blur-xl">
              <div>
                <p className="text-sm font-semibold text-slate-500">Total Customers</p>
                <p className="mt-1 text-4xl font-extrabold text-emerald-600">{customers.length}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              </div>
            </div>

            {/* Inline Quick Add Form */}
            <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-xl shadow-emerald-900/5 backdrop-blur-xl">
              <h2 className="mb-4 text-xl font-bold text-slate-900">Quick Add</h2>
              <form action={addCustomer} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Full Name</label>
                  <input type="text" name="name" required placeholder="e.g. Rahul Sharma" className="block w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 sm:text-sm" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Mobile Number</label>
                  <input type="tel" name="mobile" required placeholder="e.g. 9876543210" className="block w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 sm:text-sm" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Opening Balance (₹)</label>
                  <input type="number" name="openingBalance" step="0.01" defaultValue="0" placeholder="e.g. 500" className="block w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 sm:text-sm" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Address</label>
                  <textarea name="address" rows={2} required placeholder="Delivery address..." className="block w-full resize-none rounded-xl border border-slate-200 bg-white/50 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 sm:text-sm" />
                </div>
                <div className="pt-2">
                  <button type="submit" className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-0.5 hover:bg-emerald-700">
                    + Save Customer
                  </button>
                </div>
              </form>
            </div>

          </div>

          {/* RIGHT COLUMN (Directory Table) */}
          <div className="lg:col-span-8">
            <div className="overflow-hidden rounded-3xl border border-white/60 bg-white/80 shadow-xl shadow-emerald-900/5 backdrop-blur-xl">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200/60">
                  <thead className="bg-slate-50/50">
                    <tr>
                      <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Name</th>
                      <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Mobile</th>
                      <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Address</th>
                      <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Balance</th>
                      <th className="px-6 py-5 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-transparent">
                    {customers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-12 text-center text-sm font-medium text-slate-500">
                          No active customers found. Use the quick add form to create one!
                        </td>
                      </tr>
                    ) : (
                      customers.map((customer: any) => (
                        // FIX: Key points to customer.id
                        <tr key={customer.id} className="transition-colors hover:bg-white/90">
                          <td className="whitespace-nowrap px-6 py-5 text-sm font-bold text-slate-900">{customer.name}</td>
                          <td className="whitespace-nowrap px-6 py-5 text-sm font-medium text-slate-600">{customer.mobile}</td>
                          {/* FIX: Re-added Address Cell */}
                          <td className="px-6 py-5 text-sm font-medium text-slate-600 max-w-xs truncate">{customer.address}</td>
                          <td className="whitespace-nowrap px-6 py-5 text-sm font-bold text-rose-600">
                            {customer.openingBalance > 0 ? `₹${customer.openingBalance}` : "₹0"}
                          </td>
                          {/* FIX: Actions point to customer.id instead of customer._id */}
                          <td className="whitespace-nowrap px-6 py-5 text-sm flex justify-end gap-4 items-center">
                            <Link href={`/dashboard/customers/${customer.id}`} className="font-semibold text-emerald-600 hover:text-emerald-800">
                              Edit
                            </Link>
                            <form action={deleteCustomer}>
                              <input type="hidden" name="id" value={customer.id} />
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