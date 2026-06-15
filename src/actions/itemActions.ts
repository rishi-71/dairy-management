// src/actions/itemActions.ts
"use server";

import connectDB from "@/lib/mongodb";
import Item from "@/models/Item";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// READ: Fetch all items
export async function getItems() {
  await connectDB();
  const items = await Item.find().sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(items));
}

// READ: Fetch single item for editing
export async function getItemById(id: string) {
  await connectDB();
  const item = await Item.findById(id).lean();
  return JSON.parse(JSON.stringify(item));
}

// CREATE: Add a new dairy item
export async function addItem(formData: FormData) {
  await connectDB();
  
  const name = formData.get("name");
  const price = formData.get("price");
  const unit = formData.get("unit");
  

  await Item.create({ name, price, unit });
  
  revalidatePath("/dashboard/items");
  redirect("/dashboard/items");
}

// UPDATE: Edit an existing item
export async function updateItem(id: string, formData: FormData) {
  await connectDB();
  
  const name = formData.get("name");
  const price = formData.get("price");
  const unit = formData.get("unit");

  await Item.findByIdAndUpdate(id, { name, price, unit, stock });
  
  revalidatePath("/dashboard/items");
  redirect("/dashboard/items");
}

// DELETE: Remove an item
export async function deleteItem(formData: FormData) {
  await connectDB();
  
  const id = formData.get("id");
  await Item.findByIdAndDelete(id);
  
  revalidatePath("/dashboard/items");
}