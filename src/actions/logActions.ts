"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function fetchDailyLog(dateStr: string) {

    const allItems = await prisma.item.findMany({
        where: {isDeleted: false},
        select: { id: true, name: true, price: true, unit: true}
    });

    const extraLogs = await prisma.extraItemLog.findMany({
        where: { dateStr }
    });

    const existingLogs = await prisma.dailyLog.findMany({
        where : {dateStr},
        include: { customer: true, item: true}
    });

    if(existingLogs.length > 0) {
        return { type: "EXISTING", data: existingLogs, allItems};
    }

    const defaultSubscriptions = await prisma.subscription.findMany({
        where: { customer : {isDeleted: false},
        OR : [{morningQty: {gt: 0}}, {eveningQty: {gt: 0}}]
        },
        include: { customer: true, item: true}
    });

    return { type: "DEFAULTS", data: defaultSubscriptions, allItems };
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
                price: entry.price,
            },
            create: {
                dateStr: dateStr,
                customerId : entry.customerId,
                itemId : entry.itemId,
                customerName: entry.customerName,
                itemName: entry.itemName,
                morningDelivered : entry.morningQty,
                eveningDelivered: entry.eveningQty,
                price: entry.price,
            }
        })

        if( entry.extraItems && entry.extraItems.length > 0) {
            for (const extra of entry.extraItems){
                if(extra.qty > 0) {
                    await prisma.extraItemLog.upsert({
                        where: { dateStr_customerId_itemId: { dateStr, customerId: entry.customerId,
                            itemId: extra.itemId
                        }},
                        update: { quantity: extra.qty, price: extra.price },
                        create: { dateStr, customerId: entry.customerId, itemId: extra.itemId, customerName: entry.customerName, itemName: extra.itemName, price: extra.price, quantity: extra.qty },
                    });
                } else {
                    try {
                        await prisma.extraItemLog.delete({
                            where: { dateStr_customerId_itemId: { dateStr, customerId: entry.customerId, itemId: extra.itemId }}
                        });
                    } catch (error) {
                        
                    }
                }
            }
        }
    }
    revalidatePath("/dashboard/daily-entry");
    return { success : true}
}