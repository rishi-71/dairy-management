import dotenv from "dotenv";
dotenv.config();

async function main() {
  console.log("Starting Monthly Bill Synchronization Test...");

  // Dynamically import to ensure dotenv.config() runs first
  const { default: prisma } = await import("../lib/prisma");
  const { syncMonthlyBill } = await import("../lib/billUtils");

  // 1. Fetch an active customer
  const customer = await prisma.customer.findFirst({
    where: { isDeleted: false }
  });

  if (!customer) {
    console.error("No customers found in DB to run test.");
    return;
  }
  console.log(`Using Customer: ${customer.name} (ID: ${customer.id})`);

  // 2. Fetch or create a Monthly Bill for June 2026
  const testMonth = "2026-06";
  let bill = await prisma.monthlyBill.findUnique({
    where: {
      customerId_monthYear: {
        customerId: customer.id,
        monthYear: testMonth
      }
    }
  });

  if (!bill) {
    console.log(`No existing monthly bill for ${testMonth}. Creating a dummy locked bill...`);
    bill = await prisma.monthlyBill.create({
      data: {
        customerId: customer.id,
        customerName: customer.name,
        monthYear: testMonth,
        totalMorningLtrs: 0,
        totalEveningLtrs: 0,
        milkTotalAmount: 0,
        extraItemsAmount: 0,
        previousDue: 100, // Starting outstanding due
        grandTotal: 100
      }
    });
  }
  console.log("Original Bill state:", {
    milkTotal: bill.milkTotalAmount,
    extraTotal: bill.extraItemsAmount,
    grandTotal: bill.grandTotal
  });

  // 3. Create or update a Daily Log for this customer on June 14, 2026
  const testDate = `${testMonth}-14`;
  
  // Find or create an item
  let item = await prisma.item.findFirst({
    where: { isDeleted: false }
  });
  if (!item) {
    console.log("No items found. Creating a test item...");
    item = await prisma.item.create({
      data: { name: "Buffalo Milk", price: 70, unit: "litre" }
    });
  }

  console.log(`Upserting daily log for ${testDate}...`);
  await prisma.dailyLog.upsert({
    where: {
      dateStr_customerId_itemId: {
        dateStr: testDate,
        customerId: customer.id,
        itemId: item.id
      }
    },
    update: {
      morningDelivered: 5, // 5 liters morning
      eveningDelivered: 0,
      price: item.price
    },
    create: {
      dateStr: testDate,
      customerId: customer.id,
      itemId: item.id,
      customerName: customer.name,
      itemName: item.name,
      morningDelivered: 5,
      eveningDelivered: 0,
      price: item.price
    }
  });

  // 4. Create an Extra Item Log for June 14, 2026
  console.log(`Upserting extra item log for ${testDate}...`);
  await prisma.extraItemLog.upsert({
    where: {
      dateStr_customerId_itemId: {
        dateStr: testDate,
        customerId: customer.id,
        itemId: item.id
      }
    },
    update: {
      quantity: 2, // 2 units extra
      price: item.price
    },
    create: {
      dateStr: testDate,
      customerId: customer.id,
      itemId: item.id,
      customerName: customer.name,
      itemName: item.name,
      quantity: 2,
      price: item.price
    }
  });

  // 5. Call syncMonthlyBill
  console.log("Running syncMonthlyBill...");
  await syncMonthlyBill(customer.id, testMonth);

  // 6. Fetch updated bill state
  const updatedBill = await prisma.monthlyBill.findUnique({
    where: { id: bill.id }
  });

  if (updatedBill) {
    console.log("Updated Bill state:", {
      milkTotal: updatedBill.milkTotalAmount,
      extraTotal: updatedBill.extraItemsAmount,
      grandTotal: updatedBill.grandTotal
    });

    // 7. Recalculate directly from all DB entries to compare
    const [monthLogs, monthExtras] = await Promise.all([
      prisma.dailyLog.findMany({
        where: { customerId: customer.id, dateStr: { gte: "2026-06-01", lte: "2026-06-30" } }
      }),
      prisma.extraItemLog.findMany({
        where: { customerId: customer.id, dateStr: { gte: "2026-06-01", lte: "2026-06-30" } }
      })
    ]);

    let expectedMilkTotal = 0;
    let expectedExtraTotal = 0;
    monthLogs.forEach((l) => { expectedMilkTotal += (l.morningDelivered + l.eveningDelivered) * l.price; });
    monthExtras.forEach((e) => { expectedExtraTotal += e.quantity * e.price; });
    const expectedGrandTotal = expectedMilkTotal + expectedExtraTotal + updatedBill.previousDue;

    console.log("EXPECTED VALUES:", {
      milkTotal: expectedMilkTotal,
      extraTotal: expectedExtraTotal,
      grandTotal: expectedGrandTotal
    });

    if (
      updatedBill.milkTotalAmount === expectedMilkTotal &&
      updatedBill.extraItemsAmount === expectedExtraTotal &&
      updatedBill.grandTotal === expectedGrandTotal
    ) {
      console.log("SUCCESS: Monthly bill synced perfectly!");
    } else {
      console.error("FAILURE: Sync mismatch!");
    }
  } else {
    console.error("FAILURE: Monthly bill not found after sync!");
  }

  await prisma.$disconnect();
}

main().catch(console.error);
