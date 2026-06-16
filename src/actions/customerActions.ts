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
    include: { subscriptions: true }
  });
  return customer;
}

export async function addCustomer(formData: FormData) {
  const name = formData.get("name") as string;
  const mobile = formData.get("mobile") as string;
  const address = formData.get("address") as string;
  const openingBalance = parseFloat(formData.get("openingBalance") as string || "0.0");

  const customer = await prisma.customer.create({
    data: { name, mobile, address, openingBalance},
  });

  const activeItems = await prisma.item.findMany({ where: { isDeleted: false }});

  for(const item of activeItems) {
    const mQty = parseFloat(formData.get(`item_${item.id}_morning`) as string || "0.0");
    const eQty = parseFloat(formData.get(`item_${item.id}_evening`) as string || "0.0");

    if(mQty > 0 || eQty > 0) {
        await prisma.subscription.create({
            data: {
                customerId: customer.id,
                itemId: item.id,
                morningQty: mQty,
                eveningQty: eQty
            }
        });
    }
  }

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

  for (const item of activeItems) {
    const mQty = parseFloat(formData.get(`item_${item.id}_morning`) as string || "0.0");
    const eQty = parseFloat(formData.get(`item_${item.id}_evening`) as string || "0.0");

    // Upsert method keeps synchronization running without duplication
    await prisma.subscription.upsert({
      where: {
        customerId_itemId: { customerId: id, itemId: item.id }
      },
      update: { morningQty: mQty, eveningQty: eQty },
      create: {
        customerId: id,
        itemId: item.id,
        morningQty: mQty,
        eveningQty: eQty
      }
    });
  }

  revalidatePath("/dashboard/customers");
  redirect("/dashboard/customers");
}

export async function deleteCustomer(formData: FormData) {
  const id = formData.get("id") as string;
  await prisma.customer.update({
    where: { id },
    data: { isDeleted: true },
  });
  revalidatePath("/dashboard/customers");
}