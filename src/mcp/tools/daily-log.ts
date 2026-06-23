import prisma from "@/lib/prisma";

export interface LogDailyDeliveryInput {
  customerName: string;
  itemName: string;
  dateStr: string;
  morningDelivered?: number;
  eveningDelivered?: number;
}

export async function logDailyDelivery(data: LogDailyDeliveryInput) {
  // Normalize fields in case of AI parameter hallucination (e.g. item, deliveryDate, morning, evening, customer)
  const raw = data as any;
  const customerName = raw.customerName || raw.customer;
  const itemName = raw.itemName || raw.item;
  const dateStr = raw.dateStr || raw.deliveryDate || raw.date;
  const morningDelivered = raw.morningDelivered !== undefined ? raw.morningDelivered : raw.morning;
  const eveningDelivered = raw.eveningDelivered !== undefined ? raw.eveningDelivered : raw.evening;

  if (!customerName || !itemName || !dateStr) {
    throw new Error("customerName, itemName, and dateStr are required.");
  }

  // 1. Find Customer
  const customer = await prisma.customer.findFirst({
    where: {
      name: {
        contains: customerName,
      },
      isDeleted: false,
    },
  });

  if (!customer) {
    throw new Error(`Customer '${customerName}' not found.`);
  }

  // 2. Find Item
  const item = await prisma.item.findFirst({
    where: {
      name: {
        contains: itemName,
      },
      isDeleted: false,
    },
  });

  if (!item) {
    throw new Error(`Item '${itemName}' not found.`);
  }

  // 3. Check for existing log
  const existingLog = await prisma.dailyLog.findUnique({
    where: {
      dateStr_customerId_itemId: {
        dateStr,
        customerId: customer.id,
        itemId: item.id,
      },
    },
  });

  let result;
  if (existingLog) {
    // Modify existing entry
    result = await prisma.dailyLog.update({
      where: {
        id: existingLog.id,
      },
      data: {
        customerName: customer.name,
        itemName: item.name,
        price: item.price,
        morningDelivered: morningDelivered !== undefined ? morningDelivered : existingLog.morningDelivered,
        eveningDelivered: eveningDelivered !== undefined ? eveningDelivered : existingLog.eveningDelivered,
      },
    });
  } else {
    // Create new entry
    result = await prisma.dailyLog.create({
      data: {
        dateStr,
        customerId: customer.id,
        itemId: item.id,
        customerName: customer.name,
        itemName: item.name,
        price: item.price,
        morningDelivered: morningDelivered ?? 0,
        eveningDelivered: eveningDelivered ?? 0,
      },
    });
  }

  return {
    success: true,
    message: existingLog ? "Delivery log updated successfully" : "Delivery log created successfully",
    log: result,
  };
}
