"use server";

import connectDB from "@/lib/mongodb";
import Customer from "@/models/Customer";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getCustomers() {
    await connectDB();
    const customers = await Customer.find().sort({ createdAt: -1}).lean();

    return JSON.parse(JSON.stringify(customers));
}

export async function addCustomer(formData: FormData) {
    await connectDB();

    const name = formData.get("name");
    const mobile = formData.get("mobile");
    const address = formData.get("address");

    await Customer.create({ name, mobile, address});

    revalidatePath("/dashboard/customers");
    redirect("/dashboard/customers");
}

export async function deleteCustomer(formData: FormData) {
    await connectDB();

    const id = formData.get('id');
    await Customer.findByIdAndDelete(id);

    revalidatePath("/dashboard/customers");
}

export async function getCustomerById(id: string) {
    await connectDB();
    const customer = await Customer.findById(id).lean();
    return JSON.parse(JSON.stringify(customer));
}

export async function updateCustomer(id: string, formData: FormData) {
  await connectDB();
  
  const name = formData.get("name");
  const mobile = formData.get("mobile");
  const address = formData.get("address");

  // Find the customer by ID and update their fields securely
  await Customer.findByIdAndUpdate(id, { name, mobile, address });
  
  // Clear the cache to show the updated data, then redirect
  revalidatePath("/dashboard/customers");
  redirect("/dashboard/customers");
}