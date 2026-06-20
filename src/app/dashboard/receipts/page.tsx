// src/app/dashboard/receipts/page.tsx
import { getCustomers } from "@/actions/customerActions";
import ReceiptClient from "./ReceiptClient";

export const dynamic = 'force-dynamic';

export default async function ReceiptsPage() {
  const customers = await getCustomers();
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-lg shadow-emerald-950/5 backdrop-blur-xl">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Payment Receipts</h1>
        <p className="mt-1 text-sm text-slate-600">Record customer payments and automatically update their balances.</p>
      </div>
      <ReceiptClient customers={customers} />
    </div>
  );
}