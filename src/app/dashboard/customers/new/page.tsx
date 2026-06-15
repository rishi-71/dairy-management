// src/app/dashboard/customers/new/page.tsx
import { addCustomer } from "@/actions/customerActions";
import Link from "next/link";

export default function NewCustomerPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-50 via-slate-50 to-teal-100 px-4 py-12 sm:px-6 lg:px-8">
      
      {/* --- BACKGROUND ELEMENTS --- */}
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:24px_24px] opacity-40"></div>
      <div className="absolute top-0 left-0 -z-10 h-[500px] w-[500px] translate-x-[-20%] translate-y-[-20%] rounded-full bg-emerald-300/40 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 -z-10 h-[600px] w-[600px] translate-x-[20%] translate-y-[20%] rounded-full bg-teal-300/40 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -z-10 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/70 blur-[100px] pointer-events-none" />

      {/* --- FORM CONTAINER --- */}
      <div className="relative z-10 w-full max-w-2xl">
        
        {/* Header Link */}
        <div className="mb-6 flex justify-center sm:justify-start">
          <Link href="/dashboard/customers" className="inline-flex items-center rounded-full border border-emerald-200 bg-white/60 px-4 py-1.5 text-sm font-semibold text-emerald-700 shadow-sm backdrop-blur-md transition-colors hover:bg-white/80">
            &larr; Back to Directory
          </Link>
        </div>

        {/* Glassmorphic Form Card */}
        <div className="overflow-hidden rounded-3xl border border-white/60 bg-white/80 p-8 sm:p-10 shadow-2xl shadow-emerald-900/10 backdrop-blur-xl">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Add New Customer</h1>
            <p className="mt-2 text-sm text-slate-500">Enter the subscriber's contact and delivery details below.</p>
          </div>

          <form action={addCustomer} className="space-y-6">
            
            <div className="space-y-5">
              {/* Name Input */}
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  placeholder="e.g. Rahul Sharma"
                  className="block w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3.5 text-slate-900 placeholder-slate-400 transition-all focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 sm:text-sm"
                />
              </div>

              {/* Mobile Input */}
              <div>
                <label htmlFor="mobile" className="block text-sm font-semibold text-slate-700 mb-1.5">Mobile Number</label>
                <input
                  type="tel"
                  name="mobile"
                  id="mobile"
                  required
                  placeholder="e.g. 9876543210"
                  className="block w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3.5 text-slate-900 placeholder-slate-400 transition-all focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 sm:text-sm"
                />
              </div>

              {/* Address Input */}
              <div>
                <label htmlFor="address" className="block text-sm font-semibold text-slate-700 mb-1.5">Delivery Address</label>
                <textarea
                  name="address"
                  id="address"
                  rows={3}
                  required
                  placeholder="Enter full house number, street, and landmark..."
                  className="block w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3.5 text-slate-900 placeholder-slate-400 transition-all focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 sm:text-sm resize-none"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 mt-8 border-t border-slate-200/60">
              <button
                type="submit"
                className="group w-full flex justify-center rounded-xl bg-emerald-600 px-4 py-3.5 text-base font-bold text-white shadow-lg shadow-emerald-500/30 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-emerald-600/40 focus:outline-none focus:ring-4 focus:ring-emerald-200"
              >
                Save Customer Profile
              </button>
            </div>
            
          </form>
        </div>
      </div>
    </div>
  );
}