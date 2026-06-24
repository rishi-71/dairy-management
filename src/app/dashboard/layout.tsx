// src/app/dashboard/layout.tsx
import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import SidebarNav from "./SidebarNav"; // 🚀 Imported our new dynamic navigation component
import AiAssistant from "@/components/AiAssistant";
import ThemeToggle from "@/components/ThemeToggle";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-gradient-to-br from-emerald-50 via-slate-50 to-teal-100 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/20 text-slate-900 dark:text-slate-150 font-sans">
      
      {/* --- BACKDROP GLOW ANIMATIONS --- */}
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-30 dark:opacity-15"></div>
      <div className="absolute top-[-10%] left-[-10%] -z-10 h-[500px] w-[500px] rounded-full bg-emerald-300/30 dark:bg-emerald-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] -z-10 h-[600px] w-[600px] rounded-full bg-teal-300/30 dark:bg-teal-600/10 blur-[120px] pointer-events-none" />

      {/* --- FIXED LEFT SIDEBAR --- */}
      <aside className="hidden w-72 border-r border-white/40 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl lg:flex flex-col justify-between p-6 shadow-[0_8px_32px_0_rgba(148,163,184,0.08)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.2)] relative z-30">
        <div className="space-y-8">
          
          {/* Logo Brand Header */}
          <div className="flex items-center justify-between gap-3 px-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 via-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <div>
                <span className="text-lg font-black tracking-tight text-slate-900 dark:text-slate-100 uppercase">Dairy</span>
                <span className="text-lg font-bold tracking-tight text-emerald-600 dark:text-emerald-400 uppercase ml-1">Farm</span>
              </div>
            </div>
            <ThemeToggle />
          </div>

          {/* User Profile Snippet */}
          <div className="rounded-2xl border border-white/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50 p-4 shadow-sm backdrop-blur-md hover:bg-white/60 dark:hover:bg-slate-900/60 transition-all duration-300 group">
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Logged In As</p>
            <p className="mt-1 text-sm font-extrabold text-slate-800 dark:text-slate-200 truncate transition-colors group-hover:text-emerald-700 dark:group-hover:text-emerald-400">{session.user?.name || "Dairy Admin"}</p>
            <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80 font-medium truncate">{session.user?.email}</p>
          </div>

          {/* 🚀 Dynamic Navigation Menu */}
          <SidebarNav />

        </div>

        {/* Bottom Sign Out Component Toggle */}
        <div>
          <Link href="/api/auth/signout" className="flex w-full items-center gap-3 rounded-xl bg-white/40 dark:bg-slate-900/40 hover:bg-rose-50/80 dark:hover:bg-rose-950/20 px-4 py-3 text-sm font-bold text-rose-600 dark:text-rose-400 transition-all duration-300 border border-white/40 dark:border-slate-800/40 hover:border-rose-200/50 dark:hover:border-rose-900/30 shadow-sm backdrop-blur-sm hover:shadow-md">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Sign Out Account
          </Link>
        </div>
      </aside>

      {/* --- RIGHT WORKSPACE PANELS --- */}
      <main className="flex-1 overflow-y-auto h-screen relative z-10 p-4 sm:p-8">
        
        {/* Responsive Mobile Header Navigation Bar */}
        <div className="flex lg:hidden justify-between items-center rounded-2xl border border-white/40 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 p-4 shadow-lg shadow-slate-100/40 dark:shadow-none backdrop-blur-2xl mb-6">
          <div className="flex items-center gap-2">
            <span className="text-md font-black tracking-tight text-slate-900 dark:text-slate-100 uppercase">Dairy Farm</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5 sm:gap-2">
              <Link href="/dashboard" className="px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-lg bg-white/80 border border-slate-200/60 dark:bg-slate-900/80 dark:border-slate-800 dark:text-slate-300 shadow-sm text-slate-700 hover:bg-white dark:hover:bg-slate-800 transition-colors duration-200">Stats</Link>
              <Link href="/dashboard/customers" className="px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/15">Customers</Link>
              <Link href="/dashboard/daily-entry" className="px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-lg bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md shadow-emerald-600/15">Entries</Link>
              <Link href="/dashboard/reports" className="px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/15">Reports</Link>
            </div>
            <ThemeToggle />
          </div>
        </div>

        {/* Dynamic Nested View Engine */}
        <div className="mx-auto max-w-7xl">
          {children}
        </div>
      </main>
      <AiAssistant />
    </div>
  );
}