// src/actions/customerActions.ts
"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getCustomers() {
  const customers = await prisma.customer.findMany({
    where: {
      isDeleted: false,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return customers;
}

export async function getCustomerById(id: string) {
  const customer = await prisma.customer.findUnique({
    where: { id },
  });
  return customer;
}

export async function addCustomer(formData: FormData) {
  const name = formData.get("name") as string;
  const mobile = formData.get("mobile") as string;
  const address = formData.get("address") as string;

  const openingBalanceStr = formData.get("openingBalance") as string;
  const openingBalance = openingBalanceStr ? parseFloat(openingBalanceStr) : 0.0;

  const morningQuantityStr = formData.get("morningQuantity") as string;
  const morningQuantity = morningQuantityStr ? parseFloat(morningQuantityStr) : 0.0;

  const eveningQuantityStr = formData.get("eveningQuantity") as string;
  const eveningQuantity = eveningQuantityStr ? parseFloat(eveningQuantityStr) : 0.0;

  console.log("--- SUBMITTED FORM DATA ---");
  console.log("Morning Raw String:", morningQuantityStr);
  console.log("Morning Parsed Float:", morningQuantity);
  console.log("Evening Raw String:", eveningQuantityStr);
  console.log("Evening Parsed Float:", eveningQuantity);
  console.log("----------------------------");

  await prisma.customer.create({
    data: { name, mobile, address, openingBalance, morningQuantity, eveningQuantity },
  });

  revalidatePath("/dashboard/customers");
  redirect("/dashboard/customers");
}

export async function updateCustomer(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const mobile = formData.get("mobile") as string;
  const address = formData.get("address") as string;

  const openingBalanceStr = formData.get("openingBalance") as string;
  const openingBalance = openingBalanceStr ? parseFloat(openingBalanceStr) : 0.0;

  const morningQuantityStr = formData.get("morningQuantity") as string;
  const morningQuantity = morningQuantityStr ? parseFloat(morningQuantityStr) : 0.0;

  const eveningQuantityStr = formData.get("eveningQuantity") as string;
  const eveningQuantity = eveningQuantityStr ? parseFloat(eveningQuantityStr) : 0.0;

  // ✅ FIXED: 'morningOuantity' ko badal kar sahi 'morningQuantity' kar diya hai
  await prisma.customer.update({
    where: { id },
    data: { name, mobile, address, openingBalance, morningQuantity, eveningQuantity },
  });

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