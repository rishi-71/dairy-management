"use server";

import prisma from "@/lib/prisma";
import { start } from "repl";

export async function getMonthlyLedger(customerId: number, yearMonth: string) {
    const [year, month] = yearMonth.split('-');

    const lastDay = new Date(Number(year), Number(month), 0).getDate();

    const startDate = `${yearMonth}-01`;
    const endDate = `${yearMonth}-${lastDay}`;

    const dailyLogs = await prisma.dailyLog.findMany({
        where : {
            customerId: customerId,
            dateStr: { gte: startDate, lte: endDate }
        }
    });

    const extraLogs = await prisma.extraItemLog.findMany({
        where: {
            customerId: customerId,
            dateStr: { gte: startDate, lte: endDate }
        }
    });

    return { dailyLogs, extraLogs, lastDay};
}