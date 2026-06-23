import dotenv from "dotenv";
dotenv.config();

async function main() {
  console.log("Starting Paid Bill Synchronization Test...");

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

  // Record customer's current openingBalance
  const startingCustomerBalance = customer.openingBalance;
  console.log(`Starting customer running balance: ₹${startingCustomerBalance}`);

  const testMonth = "2026-06";
  
  // 2. Fetch or create the Monthly Bill
  let bill = await prisma.monthlyBill.findUnique({
    where: {
      customerId_monthYear: {
        customerId: customer.id,
        monthYear: testMonth
      }
    }
  });

  if (!bill) {
    console.log(`No existing monthly bill for ${testMonth}. Creating a dummy bill...`);
    bill = await prisma.monthlyBill.create({
      data: {
        customerId: customer.id,
        customerName: customer.name,
        monthYear: testMonth,
        totalMorningLtrs: 0,
        totalEveningLtrs: 0,
        milkTotalAmount: 0,
        extraItemsAmount: 0,
        previousDue: 0,
        grandTotal: 100
      }
    });
  }

  // 3. Force the bill to be fully PAID
  console.log("Setting monthly bill state to fully PAID in database...");
  bill = await prisma.monthlyBill.update({
    where: { id: bill.id },
    data: {
      isPaid: true,
      amountPaid: bill.grandTotal // fully paid
    }
  });

  console.log("Original PAID Bill state:", {
    grandTotal: bill.grandTotal,
    amountPaid: bill.amountPaid,
    isPaid: bill.isPaid
  });

  // 4. Find or create an item
  let item = await prisma.item.findFirst({
    where: { isDeleted: false }
  });
  if (!item) {
    item = await prisma.item.create({
      data: { name: "Buffalo Milk", price: 70, unit: "litre" }
    });
  }

  // 5. Add a new Daily Log entry (adds ₹140 worth of milk)
  const testDate = `${testMonth}-28`;
  console.log(`Adding new daily log entry on ${testDate} for ₹140 (2 liters at ₹70/L)...`);
  
  const existingLog = await prisma.dailyLog.findUnique({
    where: {
      dateStr_customerId_itemId: {
        dateStr: testDate,
        customerId: customer.id,
        itemId: item.id
      }
    }
  });

  const oldLogMorningQty = existingLog ? existingLog.morningDelivered : 0;
  const oldLogEveningQty = existingLog ? existingLog.eveningDelivered : 0;

  await prisma.dailyLog.upsert({
    where: {
      dateStr_customerId_itemId: {
        dateStr: testDate,
        customerId: customer.id,
        itemId: item.id
      }
    },
    update: {
      morningDelivered: oldLogMorningQty + 2, // add 2 liters
      price: 70
    },
    create: {
      dateStr: testDate,
      customerId: customer.id,
      itemId: item.id,
      customerName: customer.name,
      itemName: item.name,
      morningDelivered: 2,
      eveningDelivered: 0,
      price: 70
    }
  });

  // 6. Run the Sync Monthly Bill function
  console.log("Running syncMonthlyBill...");
  await syncMonthlyBill(customer.id, testMonth);

  // 7. Verify the results
  const updatedBill = await prisma.monthlyBill.findUnique({
    where: { id: bill.id }
  });

  const updatedCustomer = await prisma.customer.findUnique({
    where: { id: customer.id }
  });

  if (updatedBill && updatedCustomer) {
    console.log("Updated Bill state after adding entry:", {
      grandTotal: updatedBill.grandTotal,
      amountPaid: updatedBill.amountPaid,
      isPaid: updatedBill.isPaid
    });

    console.log(`Updated customer running balance: ₹${updatedCustomer.openingBalance}`);

    const expectedBillIncrease = 140;
    const expectedNewGrandTotal = bill.grandTotal + expectedBillIncrease;
    const expectedNewCustomerBalance = startingCustomerBalance + expectedBillIncrease;

    console.log("VALIDATING RESULTS:");
    console.log(`- Is Bill marked unpaid (isPaid === false)? ${updatedBill.isPaid === false ? "YES" : "NO"}`);
    console.log(`- Is grandTotal correct (expected ${expectedNewGrandTotal})? ${updatedBill.grandTotal === expectedNewGrandTotal ? "YES" : "NO"}`);
    console.log(`- Is customer balance correct (expected ${expectedNewCustomerBalance})? ${updatedCustomer.openingBalance === expectedNewCustomerBalance ? "YES" : "NO"}`);

    if (
      updatedBill.isPaid === false &&
      updatedBill.grandTotal === expectedNewGrandTotal &&
      updatedCustomer.openingBalance === expectedNewCustomerBalance
    ) {
      console.log("SUCCESS: Fully paid bill successfully reverted to unpaid, and customer running balance incremented!");
    } else {
      console.error("FAILURE: Validation mismatch!");
    }
  } else {
    console.error("FAILURE: Could not retrieve updated records!");
  }

  // Cleanup test log entry to prevent database pollution
  console.log("Cleaning up test logs...");
  if (existingLog) {
    await prisma.dailyLog.update({
      where: { id: existingLog.id },
      data: {
        morningDelivered: oldLogMorningQty,
        eveningDelivered: oldLogEveningQty
      }
    });
  } else {
    await prisma.dailyLog.delete({
      where: {
        dateStr_customerId_itemId: {
          dateStr: testDate,
          customerId: customer.id,
          itemId: item.id
        }
      }
    });
  }
  await syncMonthlyBill(customer.id, testMonth);

  // Restore customer starting balance
  await prisma.customer.update({
    where: { id: customer.id },
    data: { openingBalance: startingCustomerBalance }
  });

  await prisma.$disconnect();
}

main().catch(console.error);
