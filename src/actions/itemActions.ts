"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getItems() {
  const items = await prisma.item.findMany({
    where: { isDeleted: false},
    orderBy: { createdAt: 'desc'}
  });
  return items;
}

export async function getItemById(id: string) {
  const item = await prisma.item.findUnique({
    where: { id: Number(id) }
  });
  return item;
}

export async function addItem(formData: FormData) {
  const name = formData.get("name") as string;
  const unit = formData.get("unit") as string;

  const priceStr = formData.get("price") as string;
  const price = parseFloat(priceStr);

  await prisma.item.create({
    data: { name, price, unit }
  });

  revalidatePath("/dashboard/items");
  redirect("/dashboard/items");
}

export async function updateItem(id:string, formData: FormData) {
  const name = formData.get("name") as string;
  const unit = formData.get("unit") as string;

  const priceStr = formData.get("price") as string;
  const price = parseFloat(priceStr);

  await prisma.item.update({
    where: { id: Number(id) },
    data: { name, price, unit }
  });

  revalidatePath("/dashboard/items");
  redirect("/dashboard/items");
}

export async function deleteItem(formData: FormData) {
  const id = Number(formData.get("id"));

  await prisma.item.update({
    where: { id },
    data : { isDeleted: true }
  });
  revalidatePath("/dashboard/items");
}