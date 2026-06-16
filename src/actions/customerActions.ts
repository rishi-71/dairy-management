"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getCustomers() {
    const customers = await prisma.customer.findMany({
        where: {
            isDeleted: false
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
    return customers;
}

export async function getCustomerById(id: string) {
    const customer = await prisma.customer.findUnique({
        where: { id }
    });
    return customer;
}

export async function addCustomer(formData: FormData) {
    const name = formData.get("name") as string;
    const mobile = formData.get("mobile") as string;
    const address = formData.get("address") as string;

    const openingBalanceStr = formData.get("openingBalance") as string;
    const openingBalance = openingBalanceStr ? parseFloat(openingBalanceStr) : 0.0;

    await prisma.customer.create({
        data: { name, mobile, address, openingBalance}
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

    await prisma.customer.update({
        where: { id },
        data: { name, mobile, address, openingBalance}
    });

    revalidatePath("/dashboard/customers");
    redirect("/dashboard/customers");
}

export async function deleteCustomer(formData: FormData) {
    const id = formData.get("id") as string;

    await prisma.customer.update({
        where: { id },
        data: { isDeleted: true}
    });

    revalidatePath("/dashboard/customers");
}