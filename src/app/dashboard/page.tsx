// src/app/dashboard/page.tsx
import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma"; // Clean Prisma Client Import

export default async function DashboardPage() {
  const session = await getServerSession();
  
  if (!session) {
    redirect("/login");
  }

  // Fetch real MySQL statistics using Prisma (Filtering out soft-deleted records)
  const customerCount = await prisma.customer.count({
    where: { isDeleted: false }
  });
  
  const itemCount = await prisma.item.count({
    where: { isDeleted: false }
  });

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-emerald-50 via-slate-50 to-teal-100 p-4 sm:p-8 text-slate-900">
      
      {/* --- BACKGROUND ELEMENTS --- */}
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:24px_24px] opacity-40"></div>
      <div className="absolute top-[-10%] left-[-10%] -z-10 h-[500px] w-[500px] rounded-full bg-emerald-300/40 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] -z-10 h-[600px] w-[600px] rounded-full bg-teal-300/40 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -z-10 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/60 blur-[100px] pointer-events-none" />

      {/* --- MAIN CONTENT --- */}
      <div className="relative z-10 mx-auto max-w-6xl space-y-8">
        
        {/* Glassmorphic Header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-3xl border border-white/60 bg-white/70 p-8 shadow-xl shadow-emerald-900/5 backdrop-blur-xl">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Admin Dashboard
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Welcome back, <span className="font-semibold text-emerald-700">{session.user?.name || "Admin"}</span>. Here is your overview for today.
            </p>
          </div>
          <Link 
            href="/api/auth/signout"
            className="inline-flex items-center justify-center rounded-xl bg-rose-50 px-5 py-2.5 text-sm font-semibold text-rose-600 shadow-sm ring-1 ring-inset ring-rose-200 transition-all hover:bg-rose-100 hover:shadow-md"
          >
            Sign Out
          </Link>
        </header>

        {/* Quick Stats Row (Powered by MySQL + Prisma) */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-3xl border border-white/60 bg-white/60 p-6 shadow-lg shadow-emerald-900/5 backdrop-blur-xl">
            <p className="text-sm font-medium text-slate-500">Total Customers</p>
            <p className="mt-2 text-4xl font-extrabold text-emerald-600">{customerCount}</p>
          </div>
          <div className="rounded-3xl border border-white/60 bg-white/60 p-6 shadow-lg shadow-emerald-900/5 backdrop-blur-xl">
            <p className="text-sm font-medium text-slate-500">Active Dairy Items</p>
            <p className="mt-2 text-4xl font-extrabold text-teal-600">{itemCount}</p>
          </div>
          <div className="rounded-3xl border border-white/60 bg-white/60 p-6 shadow-lg shadow-emerald-900/5 backdrop-blur-xl opacity-70">
            <p className="text-sm font-medium text-slate-500">Today's Deliveries</p>
            <p className="mt-2 text-4xl font-extrabold text-slate-400">--</p>
            <p className="mt-1 text-xs text-slate-400">Coming soon</p>
          </div>
        </div>

        {/* Navigation Cards */}
        <h2 className="text-xl font-bold text-slate-800 pt-4">Management Modules</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          
          {/* Customers Card */}
          <div className="group relative flex flex-col justify-between rounded-3xl border border-white/60 bg-white/80 p-8 shadow-xl shadow-emerald-900/5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:bg-white/90 hover:shadow-2xl hover:shadow-emerald-900/10">
            <div>
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/30">
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Customer Directory</h2>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                Add new customers, update delivery addresses, and manage your subscriber contact information.
              </p>
            </div>
            <div className="mt-8">
              <Link href="/dashboard/customers" className="inline-flex items-center text-sm font-bold text-emerald-600 transition-colors group-hover:text-emerald-700">
                Open Directory <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1.5">&rarr;</span>
              </Link>
            </div>
          </div>

          {/* Items Card */}
          <div className="group relative flex flex-col justify-between rounded-3xl border border-white/60 bg-white/80 p-8 shadow-xl shadow-teal-900/5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:bg-white/90 hover:shadow-2xl hover:shadow-teal-900/10">
            <div>
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 text-white shadow-lg shadow-teal-500/30">
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Dairy Inventory</h2>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                Manage your product catalog, update prices, and configure selling units (Liter, Kg, Packet).
              </p>
            </div>
            <div className="mt-8">
              <Link href="/dashboard/items" className="inline-flex items-center text-sm font-bold text-teal-600 transition-colors group-hover:text-teal-700">
                Open Inventory <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1.5">&rarr;</span>
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}