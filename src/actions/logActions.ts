"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function fetchDailyLog(dateStr: string) {
    const existingLogs = await prisma.dailyLog.findMany({
        where : {dateStr},
        include: { customer: true, item: true}
    });

    if(existingLogs.length > 0) {
        return { type: "EXISTING", data: existingLogs}
    }

    const defaultSubscriptions = await prisma.subscription.findMany({
        where: { customer : {isDeleted: false},
        OR : [{morningQty: {gt: 0}}, {eveningQty: {gt: 0}}]
        },
        include: { customer: true, item: true}
    });

    return { type: "DEFAULTS", data: defaultSubscriptions}
}

export async function saveDailyLog(dateStr: string, entries: any[]) {
    for(const entry of entries){
        await prisma.dailyLog.upsert({
            where: {
                dateStr_customerId_itemId: {
                    dateStr : dateStr,
                    customerId: entry.customerId,
                    itemId: entry.itemId
                }
            },
            update: {
                morningDelivered: entry.morningQty,
                eveningDelivered: entry.eveningQty,
                customerName: entry.customerName,
                itemName: entry.itemName,
            },
            create: {
                dateStr: dateStr,
                customerId : entry.customerId,
                itemId : entry.itemId,
                customerName: entry.customerName,
                itemName: entry.itemName,
                morningDelivered : entry.morningQty,
                eveningDelivered: entry.eveningQty
            }
        })
    }
    revalidatePath("/dashboard/daily-entry");
    return { success : true}
}