import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const activeCustomers = await prisma.customer.findMany({
    where: { isDeleted: false }
  });

  const activeItemsCount = await prisma.item.count({
    where: { isDeleted: false}
  });

  const totalCustomersCount = activeCustomers.length;

  const totalOutstandingBalance = activeCustomers.reduce(
    (sum, customer) => sum + (customer.openingBalance ?? 0), 0
  );

  const totalMorningVolume = activeCustomers.reduce(
    (sum, customer) => sum + (customer.morningQuantity ?? 0), 0
  );

  const totalEveningVolume = activeCustomers.reduce(
    (sum, customer) => sum + (customer.eveningQuantity ?? 0), 0
  );

  return (
    <div className="space-y-8">
      
      {/* Top Welcome Title Grid Header */}
      <div className="rounded-3xl border border-white/60 bg-white/70 p-6 sm:p-8 shadow-lg shadow-emerald-950/5 backdrop-blur-xl">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">System Overview</h1>
        <p className="mt-2 text-sm text-slate-600">Real-time enterprise metrics from your synced MySQL local database.</p>
      </div>

      {/* --- BUSINESS INTELLIGENCE CARDS BLOCK --- */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Total Registered Subscribers Summary */}
        <div className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-md backdrop-blur-xl flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Subscribers</p>
            <p className="mt-3 text-4xl font-black text-emerald-600">{totalCustomersCount}</p>
          </div>
          <p className="mt-4 text-xs font-semibold text-emerald-800 bg-emerald-50 rounded-lg px-2.5 py-1 w-max">Active Routing</p>
        </div>

        {/* Active Products Summary */}
        <div className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-md backdrop-blur-xl flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Inventory Catalog</p>
            <p className="mt-3 text-4xl font-black text-teal-600">{activeItemsCount}</p>
          </div>
          <p className="mt-4 text-xs font-semibold text-teal-800 bg-teal-50 rounded-lg px-2.5 py-1 w-max">Products Synced</p>
        </div>

        {/* Total Morning target volume allocation */}
        <div className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-md backdrop-blur-xl flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Morning Volume Req.</p>
            <p className="mt-3 text-4xl font-black text-blue-600">{totalMorningVolume.toFixed(1)}L</p>
          </div>
          <p className="mt-4 text-xs font-semibold text-blue-800 bg-blue-50 rounded-lg px-2.5 py-1 w-max">AM Distribution</p>
        </div>

        {/* Total Collective ledger opening balance values outstanding */}
        <div className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-md backdrop-blur-xl flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Outstanding Book Value</p>
            <p className="mt-3 text-4xl font-black text-rose-600">₹{totalOutstandingBalance.toFixed(2)}</p>
          </div>
          <p className="mt-4 text-xs font-semibold text-rose-800 bg-rose-50 rounded-lg px-2.5 py-1 w-max">Ledger Accounts Receivable</p>
        </div>

      </div>

      {/* --- RECENT INSIGHTS LOGS LAYOUT --- */}
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
        
        {/* Morning Allocation Target Route Progression Widget */}
        <div className="lg:col-span-2 rounded-3xl border border-white/60 bg-white/80 p-6 shadow-xl backdrop-blur-xl space-y-4">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Distribution Forecast</h2>
          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <span className="text-sm font-bold text-slate-700">Total Evening Shift Volume Targets</span>
              <span className="text-sm font-black text-teal-600">{totalEveningVolume.toFixed(1)} Liters</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <span className="text-sm font-bold text-slate-700">Gross Fleet Delivery Runs Required</span>
              <span className="text-sm font-bold text-slate-500">2 Delivery Shifts Daily</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-slate-700">Operational Log Status</span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-full">System Normal</span>
            </div>
          </div>
        </div>

        {/* Fast Action Quick Jump Panels Shortcuts info display */}
        <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-xl backdrop-blur-xl space-y-4">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">System Logs</h2>
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60 text-xs text-amber-800 leading-relaxed font-medium">
            <strong>System Notice:</strong> Transaction Ledger generation rules and automated daily subscription distribution logs will initialize on the next development cycle context phase expansion.
          </div>
        </div>

      </div>

    </div>
  );
}