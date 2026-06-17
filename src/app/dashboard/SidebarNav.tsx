// src/app/dashboard/SidebarNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SidebarNav() {
  const pathname = usePathname();

  // Navigation Data Array
  const navItems = [
    {
      name: "Overview Insights",
      href: "/dashboard",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" /></svg>
      )
    },
    {
      name: "Manage Customers",
      href: "/dashboard/customers",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
      )
    },
    {
      name: "Dairy Inventory",
      href: "/dashboard/items",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
      )
    },
    {
      name: "Daily Entries",
      href: "/dashboard/daily-entry",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
      )
    }
  ];

  return (
    <nav className="space-y-2">
      {navItems.map((item) => {
        // Dashboard ke liye exact match chahiye, baki sabke liye startsWith() taaki sub-pages (edit pages) par bhi highlight rahe
        const isActive = item.href === "/dashboard" 
          ? pathname === "/dashboard" 
          : pathname.startsWith(item.href);

        return (
          <Link 
            key={item.name} 
            href={item.href} 
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all border ${
              isActive 
                ? "bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200 text-emerald-800 font-black shadow-sm" 
                : "border-transparent text-slate-600 font-bold hover:bg-white/80 hover:text-emerald-600"
            }`}
          >
            <div className={`${isActive ? "text-emerald-600" : "opacity-70"}`}>
              {item.icon}
            </div>
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}