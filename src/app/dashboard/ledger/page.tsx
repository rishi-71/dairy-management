// src/app/dashboard/ledger/page.tsx
import { getCustomers } from "@/actions/customerActions";
import LedgerSelector from "./LedgerSelector";

export const dynamic = 'force-dynamic';

export default async function GlobalLedgerPage() {
  const customers = await getCustomers();
  
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-lg shadow-emerald-950/5 backdrop-blur-xl">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Customer Ledger Hub</h1>
        <p className="mt-1 text-sm text-slate-600">Select an account to view or edit their detailed daily deliveries.</p>
      </div>
      
      <LedgerSelector customers={customers} />
    </div>
  );
}