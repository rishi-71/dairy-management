import Link from "next/link";

export default function HomePage() {
  return (
    // 1. Added a full-page diagonal gradient base instead of a flat slate color
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-50 via-slate-50 to-teal-100 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/20 text-slate-900 dark:text-slate-150 text-center">
      
      {/* --- BACKGROUND ELEMENTS --- */}
      
      {/* 2. Grid Pattern (Slightly more visible) */}
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-40 dark:opacity-15"></div>
      
      {/* 3. Richer, More Vibrant Color Blobs to fill the empty space */}
      <div className="absolute top-0 left-0 -z-10 h-[500px] w-[500px] translate-x-[-20%] translate-y-[-20%] rounded-full bg-emerald-300/50 dark:bg-emerald-600/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 -z-10 h-[600px] w-[600px] translate-x-[20%] translate-y-[20%] rounded-full bg-teal-300/50 dark:bg-teal-600/10 blur-[120px] pointer-events-none" />
      
      {/* A central white glow to make the text highly readable against the colors */}
      <div className="absolute top-1/2 left-1/2 -z-10 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/70 dark:bg-slate-900/10 blur-[100px] pointer-events-none" />
 
      {/* --- FOREGROUND CONTENT --- */}
      
      <div className="relative z-10 mx-auto max-w-4xl px-6 py-20">
        
        {/* Modern Top Badge */}
        <div className="mb-8 inline-flex animate-fade-in items-center rounded-full border border-emerald-200 dark:border-emerald-800/40 bg-white/80 dark:bg-slate-900/80 px-4 py-1.5 text-sm font-semibold text-emerald-700 dark:text-emerald-400 shadow-sm backdrop-blur-md">
          <span className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Dairy Management System v2.0
        </div>
 
        {/* Hero Heading */}
        <h1 className="mb-8 text-5xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-7xl">
          Supercharge Your <br className="hidden sm:block" />
          <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent drop-shadow-sm">
            Dairy Operations
          </span>
        </h1>
        
        {/* Description */}
        <p className="mx-auto mb-12 max-w-2xl text-lg text-slate-700 dark:text-slate-350 sm:text-xl leading-relaxed font-medium">
          A centralized, intelligent hub to manage your daily milk distribution, track customer subscriptions, and monitor inventory seamlessly.
        </p>
        
        {/* Call-to-Action Button */}
        <div className="flex justify-center gap-4">
          <Link 
            href="/login" 
            className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-emerald-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all duration-300 hover:-translate-y-1 hover:bg-emerald-700 dark:hover:bg-emerald-500 hover:shadow-emerald-600/40 focus:outline-none focus:ring-4 focus:ring-emerald-200"
          >
            Go to Admin Dashboard
            <svg 
              className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1.5" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
 
      </div>

    </div>
  );
}