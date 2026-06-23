// src/lib/billUtils.ts
import prisma from "./prisma";

/**
 * Recomputes all totals (milk, extra items, grand total) for an existing monthly bill
 * and updates it in the database. If no bill has been generated yet for this month, does nothing.
 */
export async function syncMonthlyBill(customerId: number, monthYear: string) {
  const existingBill = await prisma.monthlyBill.findUnique({
    where: {
      customerId_monthYear: {
        customerId,
        monthYear,
      }
    }
  });

  if (existingBill) {
    const [year, month] = monthYear.split('-');
    const startDate = `${monthYear}-01`;
    const lastDay = new Date(Number(year), Number(month), 0).getDate();
    const endDate = `${monthYear}-${lastDay}`;

    // Fetch all logs for this customer and month
    const [monthLogs, monthExtras] = await Promise.all([
      prisma.dailyLog.findMany({
        where: { 
          customerId, 
          dateStr: { gte: startDate, lte: endDate } 
        }
      }),
      prisma.extraItemLog.findMany({
        where: { 
          customerId, 
          dateStr: { gte: startDate, lte: endDate } 
        }
      })
    ]);

    let tMorn = 0;
    let tEve = 0;
    let tMilkAmt = 0;
    let tExtraAmt = 0;
    
    monthLogs.forEach((l) => {
      tMorn += l.morningDelivered;
      tEve += l.eveningDelivered;
      tMilkAmt += (l.morningDelivered + l.eveningDelivered) * l.price;
    });

    monthExtras.forEach((e) => {
      tExtraAmt += e.quantity * e.price;
    });

    const newGrandTotal = tMilkAmt + tExtraAmt + existingBill.previousDue;
    
    // Calculate the change in outstanding amount to update the customer's openingBalance
    const oldOutstanding = existingBill.grandTotal - existingBill.amountPaid;
    const newOutstanding = newGrandTotal - existingBill.amountPaid;
    const outstandingChange = newOutstanding - oldOutstanding;

    const isPaid = newOutstanding <= 0;

    // Update the Monthly Bill
    await prisma.monthlyBill.update({
      where: { id: existingBill.id },
      data: {
        totalMorningLtrs: tMorn,
        totalEveningLtrs: tEve,
        milkTotalAmount: tMilkAmt,
        extraItemsAmount: tExtraAmt,
        grandTotal: newGrandTotal,
        isPaid: isPaid,
        paymentDate: isPaid ? existingBill.paymentDate : null
      }
    });

    // Update the Customer's openingBalance (current running outstanding balance)
    if (outstandingChange !== 0) {
      await prisma.customer.update({
        where: { id: customerId },
        data: {
          openingBalance: {
            increment: outstandingChange
          }
        }
      });
    }
  }
}
