import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession();
    if(!session) {
        redirect("/login");
    }

    return (
    <div className="relative flex min-h-screen overflow-hidden bg-gradient-to-br from-emerald-50 via-slate-50 to-teal-100 text-slate-900 font-sans">
      
      {/* --- BACKDROP GLOW ANIMATIONS --- */}
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:24px_24px] opacity-30"></div>
      <div className="absolute top-[-10%] left-[-10%] -z-10 h-[500px] w-[500px] rounded-full bg-emerald-300/30 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] -z-10 h-[600px] w-[600px] rounded-full bg-teal-300/30 blur-[120px] pointer-events-none" />

      {/* --- FIXED LEFT SIDEBAR --- */}
      <aside className="hidden w-72 border-r border-white/60 bg-white/50 backdrop-blur-xl lg:flex flex-col justify-between p-6 shadow-xl shadow-emerald-950/5 relative z-30">
        <div className="space-y-8">
          
          {/* Logo Brand Header */}
          <div className="flex items-center gap-3 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-slate-900 uppercase">Dairy</span>
              <span className="text-lg font-bold tracking-tight text-emerald-600 uppercase ml-1">SaaS</span>
            </div>
          </div>

          {/* User Profile Snippet */}
          <div className="rounded-2xl border border-white/80 bg-white/60 p-4 shadow-sm backdrop-blur-md">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Logged In As</p>
            <p className="mt-1 text-sm font-extrabold text-slate-800 truncate">{session.user?.name || "Dairy Admin"}</p>
            <p className="text-xs text-emerald-700 font-medium truncate">{session.user?.email}</p>
          </div>

          {/* Navigation Items Link Options */}
          <nav className="space-y-1.5">
            <Link href="/dashboard" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 transition-all hover:bg-white/80 hover:text-emerald-600">
              <svg className="h-5 w-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" /></svg>
              Overview Insights
            </Link>
            <Link href="/dashboard/customers" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 transition-all hover:bg-white/80 hover:text-emerald-600">
              <svg className="h-5 w-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              Manage Customers
            </Link>
            <Link href="/dashboard/items" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 transition-all hover:bg-white/80 hover:text-emerald-600">
              <svg className="h-5 w-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
              Dairy Inventory
            </Link>
          </nav>
        </div>

        {/* Bottom Sign Out Component Toggle */}
        <div>
          <Link href="/api/auth/signout" className="flex w-full items-center gap-3 rounded-xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600 transition-all border border-rose-100 hover:bg-rose-100 shadow-sm">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Sign Out Account
          </Link>
        </div>
      </aside>

      {/* --- RIGHT WORKSPACE PANELS --- */}
      <main className="flex-1 overflow-y-auto h-screen relative z-10 p-4 sm:p-8">
        
        {/* Responsive Mobile Header Navigation Bar */}
        <div className="flex lg:hidden justify-between items-center rounded-2xl border border-white/60 bg-white/70 p-4 shadow-md backdrop-blur-lg mb-6">
          <div className="flex items-center gap-2">
            <span className="text-md font-black tracking-tight text-slate-900 uppercase">Dairy App</span>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard" className="px-3 py-1.5 text-xs font-bold rounded-lg bg-white border border-slate-200">Stats</Link>
            <Link href="/dashboard/customers" className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 text-white">Customers</Link>
            <Link href="/dashboard/items" className="px-3 py-1.5 text-xs font-bold rounded-lg bg-teal-600 text-white">Items</Link>
          </div>
        </div>

        {/* Dynamic Nested View Engine */}
        <div className="mx-auto max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}


