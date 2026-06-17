// src/app/dashboard/page.tsx
import prisma from "@/lib/prisma";
import DashboardStats from "./DashboardStats"; 

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  // 1. Fetch Basic Stats
  const activeCustomers = await prisma.customer.findMany({
    where: { isDeleted: false },
    orderBy: { createdAt: 'desc' } // For recent customers
  });
  
  const itemsWithSubs = await prisma.item.findMany({
    where: { isDeleted: false },
    include: { subscriptions: true }
  });

  const totalCustomersCount = activeCustomers.length;
  const totalOutstandingBalance = activeCustomers.reduce((sum, c) => sum + (c.openingBalance ?? 0), 0);
  
  let totalMorningVolume = 0;
  let totalEveningVolume = 0;

  // 2. Calculate Item-wise Distribution
  const itemDistribution = itemsWithSubs.map(item => {
    const morning = item.subscriptions.reduce((sum, sub) => sum + sub.morningQty, 0);
    const evening = item.subscriptions.reduce((sum, sub) => sum + sub.eveningQty, 0);
    const total = morning + evening;
    
    totalMorningVolume += morning;
    totalEveningVolume += evening;

    return {
      id: item.id,
      name: item.name,
      unit: item.unit,
      morning,
      evening,
      total
    };
  }).sort((a, b) => b.total - a.total); // Sort highest volume first

  // 3. Get Top 4 Recent Customers
  const recentCustomers = activeCustomers.slice(0, 4).map(c => ({
    id: c.id,
    name: c.name,
    balance: c.openingBalance,
    date: c.createdAt
  }));

  // 4. Pass everything to Client Component
  return (
    <DashboardStats 
      customers={totalCustomersCount}
      items={itemsWithSubs.length}
      balance={totalOutstandingBalance}
      morningVol={totalMorningVolume}
      eveningVol={totalEveningVolume}
      itemDistribution={itemDistribution}
      recentCustomers={recentCustomers}
    />
  );
}