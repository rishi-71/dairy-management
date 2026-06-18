// src/actions/customerActions.ts
"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getCustomers() {
  const customers = await prisma.customer.findMany({
    where: { isDeleted: false},
    include: {
        subscriptions: {
            where: {
                OR: [
                    { morningQty: {gt: 0}},
                    {eveningQty: {gt: 0}}
                ]
            },
            include: { item: true}
        }
    },
    orderBy: { createdAt: "desc"}
  })
  return customers;
}

export async function getCustomerById(id: string) {
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: { 
      subscriptions: {
        include: {
          item: true // 🚀 YEH LINE MISSING THI! Iske bina item data fetch nahi ho raha tha
        }
      } 
    }
  });
  return customer;
}

export async function addCustomer(formData: FormData) {
  const name = formData.get("name") as string;
  const mobile = formData.get("mobile") as string;
  const address = formData.get("address") as string;
  const openingBalance = parseFloat(formData.get("openingBalance") as string || "0.0");

  // 1. Check if mobile already exists for an active user (Prevents Crash)
  const existingCustomer = await prisma.customer.findUnique({ where: { mobile } });
  if (existingCustomer) {
    throw new Error("This mobile number is already registered!"); 
  }

  // 2. Create Customer
  const customer = await prisma.customer.create({
    data: { name, mobile, address, openingBalance },
  });

  // 3. 🚀 NEW: Single Item Subcription Logic
  const singleItemId = formData.get("singleItemId") as string;
  const singleMorning = parseFloat(formData.get("singleMorning") as string || "0");
  const singleEvening = parseFloat(formData.get("singleEvening") as string || "0");

  if (singleItemId && (singleMorning > 0 || singleEvening > 0)) {
    const matchedItem = await prisma.item.findUnique({ where: { id: singleItemId } });
    if (matchedItem) {
      await prisma.subscription.create({
        data: {
          customerId: customer.id,
          itemId: singleItemId,
          customerName: name,
          itemName: matchedItem.name,
          morningQty: singleMorning,
          eveningQty: singleEvening
        }
      });
    }
  }

  revalidatePath("/dashboard/customers");
  redirect("/dashboard/customers");
}

export async function updateCustomer(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const mobile = formData.get("mobile") as string;
  const address = formData.get("address") as string;
  const openingBalance = parseFloat(formData.get("openingBalance") as string || "0.0");

  await prisma.customer.update({
    where: { id },
    data: { name, mobile, address, openingBalance },
  });

  const activeItems = await prisma.item.findMany({ where: { isDeleted: false } });

  // 1. Update Existing Subscriptions
  for (const item of activeItems) {
    // 🚀 FIXED: Check if the input exists in the form before trying to update it
    if (formData.has(`item_${item.id}_morning`) || formData.has(`item_${item.id}_evening`)) {
      const mQty = parseFloat(formData.get(`item_${item.id}_morning`) as string || "0.0");
      const eQty = parseFloat(formData.get(`item_${item.id}_evening`) as string || "0.0");

      await prisma.subscription.upsert({
        where: { customerId_itemId: { customerId: id, itemId: item.id } },
        update: { morningQty: mQty, eveningQty: eQty, customerName: name, itemName: item.name },
        create: { customerId: id, itemId: item.id, customerName: name, itemName: item.name, morningQty: mQty, eveningQty: eQty }
      });
    }
  }

  // 2. Add New Subscription (If selected from the dropdown)
  const newItemId = formData.get("newItemId") as string;
  const newMorning = parseFloat(formData.get("newMorning") as string || "0.0");
  const newEvening = parseFloat(formData.get("newEvening") as string || "0.0");

  if (newItemId && (newMorning > 0 || newEvening > 0)) {
    const matchedItem = activeItems.find(i => i.id === newItemId);
    if (matchedItem) {
      await prisma.subscription.upsert({
        where: { customerId_itemId: { customerId: id, itemId: newItemId } },
        update: { morningQty: newMorning, eveningQty: newEvening, customerName: name, itemName: matchedItem.name },
        create: { customerId: id, itemId: newItemId, customerName: name, itemName: matchedItem.name, morningQty: newMorning, eveningQty: newEvening }
      });
    }
  }

  revalidatePath("/dashboard/customers");
  redirect("/dashboard/customers");
}

export async function deleteCustomer(formData: FormData) {
  const id = formData.get("id") as string;
  
  // 🚀 FIX: Fetch customer first to get their current mobile
  const customer = await prisma.customer.findUnique({ where: { id } });
  
  if (customer) {
    await prisma.customer.update({
      where: { id },
      data: { 
        isDeleted: true,
        // Number ke aage timestamp laga diya taaki original number free ho jaye
        mobile: `${customer.mobile}_del_${Date.now()}` 
      },
    });
  }

  revalidatePath("/dashboard/customers");
}