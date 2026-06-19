// src/app/dashboard/reports/page.tsx
import { getCustomers } from "@/actions/customerActions";
import ReportGenerator from "./ReportGenerator";

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
  // Sabhi active customers layenge dropdown ke liye
  const customers = await getCustomers();

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-lg shadow-emerald-950/5 backdrop-blur-xl">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Monthly Billing & Reports</h1>
        <p className="mt-1 text-sm text-slate-600">Select a customer to generate and lock their monthly invoice.</p>
      </div>

      <ReportGenerator customers={customers} />
    </div>
  );
}