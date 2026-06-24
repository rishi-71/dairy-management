"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid email or password");
        setIsLoading(false);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-50 via-slate-50 to-teal-100 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/20 px-4 sm:px-6 lg:px-8">
      
      {/* --- BACKGROUND ELEMENTS (Matching the Landing Page) --- */}
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-40 dark:opacity-15"></div>
      
      {/* Glowing Orbs */}
      <div className="absolute top-0 left-0 -z-10 h-[500px] w-[500px] translate-x-[-20%] translate-y-[-20%] rounded-full bg-emerald-300/40 dark:bg-emerald-600/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 -z-10 h-[600px] w-[600px] translate-x-[20%] translate-y-[20%] rounded-full bg-teal-300/40 dark:bg-teal-600/10 blur-[120px] pointer-events-none" />

      {/* --- LOGIN CARD --- */}
      <div className="relative z-10 w-full max-w-md">
        
        {/* Logo / Back to Home */}
        <div className="mb-6 flex justify-center">
          <Link href="/" className="inline-flex animate-fade-in items-center rounded-full border border-emerald-200 dark:border-emerald-850 bg-white/60 dark:bg-slate-900/60 px-4 py-1.5 text-sm font-semibold text-emerald-700 dark:text-emerald-400 shadow-sm backdrop-blur-md transition-colors hover:bg-white/80 dark:hover:bg-slate-900/80">
            &larr; Back to Home
          </Link>
        </div>

        {/* Glassmorphism Container */}
        <div className="overflow-hidden rounded-3xl border border-white/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 p-10 shadow-2xl shadow-emerald-950/10 backdrop-blur-xl">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              Admin Login
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Sign in to manage your dairy operations
            </p>
          </div>

          <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-xl border border-red-100 dark:border-red-950/40 bg-red-50 dark:bg-red-950/20 p-4 text-center text-sm font-medium text-red-650 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-slate-350 mb-1.5">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 px-4 py-3.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-550 transition-all focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 sm:text-sm"
                  placeholder="admin@dairy.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700 dark:text-slate-350 mb-1.5">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 px-4 py-3.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-550 transition-all focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 sm:text-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="group relative flex w-full justify-center overflow-hidden rounded-xl bg-emerald-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-emerald-600/40 focus:outline-none focus:ring-4 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  "Sign in to Dashboard"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      
    </div>

  );
}