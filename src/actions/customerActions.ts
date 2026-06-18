// src/actions/customerActions.ts
"use server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getCustomers() {
  return await prisma.customer.findMany({ where: { isDeleted: false }, include: { subscriptions: { include: { item: true } } }, orderBy: { createdAt: 'desc' } });
}

export async function getCustomerById(id: string) {
  return await prisma.customer.findUnique({
    where: { id: Number(id) }, // 🚀 FIX: Convert to Number
    include: { subscriptions: { include: { item: true } } }
  });
}

export async function addCustomer(formData: FormData) {
  const name = formData.get("name") as string;
  const mobile = formData.get("mobile") as string;
  const address = formData.get("address") as string;
  const openingBalance = parseFloat(formData.get("openingBalance") as string || "0.0");

  const existingCustomer = await prisma.customer.findUnique({ where: { mobile } });
  if (existingCustomer) throw new Error("This mobile number is already registered!");

  const customer = await prisma.customer.create({ data: { name, mobile, address, openingBalance } });

  const singleItemId = formData.get("singleItemId") as string;
  const singleMorning = parseFloat(formData.get("singleMorning") as string || "0");
  const singleEvening = parseFloat(formData.get("singleEvening") as string || "0");

  if (singleItemId && (singleMorning > 0 || singleEvening > 0)) {
    const matchedItem = await prisma.item.findUnique({ where: { id: Number(singleItemId) } }); // 🚀 FIX: Convert to Number
    if (matchedItem) {
      await prisma.subscription.create({
        data: { customerId: customer.id, itemId: Number(singleItemId), customerName: name, itemName: matchedItem.name, morningQty: singleMorning, eveningQty: singleEvening }
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
    where: { id: Number(id) }, // 🚀 FIX: Convert to Number
    data: { name, mobile, address, openingBalance },
  });

  const activeItems = await prisma.item.findMany({ where: { isDeleted: false } });

  for (const item of activeItems) {
    if (formData.has(`item_${item.id}_morning`) || formData.has(`item_${item.id}_evening`)) {
      const mQty = parseFloat(formData.get(`item_${item.id}_morning`) as string || "0.0");
      const eQty = parseFloat(formData.get(`item_${item.id}_evening`) as string || "0.0");
      await prisma.subscription.upsert({
        where: { customerId_itemId: { customerId: Number(id), itemId: item.id } }, // 🚀 FIX: Convert to Number
        update: { morningQty: mQty, eveningQty: eQty, customerName: name, itemName: item.name },
        create: { customerId: Number(id), itemId: item.id, customerName: name, itemName: item.name, morningQty: mQty, eveningQty: eQty }
      });
    }
  }

  const newItemId = formData.get("newItemId") as string;
  const newMorning = parseFloat(formData.get("newMorning") as string || "0.0");
  const newEvening = parseFloat(formData.get("newEvening") as string || "0.0");

  if (newItemId && (newMorning > 0 || newEvening > 0)) {
    const matchedItem = activeItems.find(i => i.id === Number(newItemId)); // 🚀 FIX: Convert to Number
    if (matchedItem) {
      await prisma.subscription.upsert({
        where: { customerId_itemId: { customerId: Number(id), itemId: Number(newItemId) } }, // 🚀 FIX: Convert to Number
        update: { morningQty: newMorning, eveningQty: newEvening, customerName: name, itemName: matchedItem.name },
        create: { customerId: Number(id), itemId: Number(newItemId), customerName: name, itemName: matchedItem.name, morningQty: newMorning, eveningQty: newEvening }
      });
    }
  }
  revalidatePath("/dashboard/customers");
  redirect("/dashboard/customers");
}

export async function deleteCustomer(formData: FormData) {
  const id = Number(formData.get("id")); // 🚀 FIX: Convert to Number
  const customer = await prisma.customer.findUnique({ where: { id } });
  
  if (customer) {
    await prisma.customer.update({
      where: { id },
      data: { isDeleted: true, mobile: `${customer.mobile}_del_${Date.now()}` },
    });
  }
  revalidatePath("/dashboard/customers");
}