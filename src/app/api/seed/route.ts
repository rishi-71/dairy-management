import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
    try {
        const existingAdmin = await prisma.admin.findUnique({
            where: { email: "admin@dairy.com"}
        });

        if(existingAdmin) {
            return NextResponse.json(
                { message: "Admin already exists"},
                { status: 200}
            );
        }

        const hashedPassword = await bcrypt.hash("admin123", 10);

        await prisma.admin.create({
            data: {
                name: "Dairy Admin",
                email: "admin@dairy.com",
                password: hashedPassword,
            }
        });

        return NextResponse.json(
            { message: "Admin created successfully"},
            { status: 201}
        );
    } catch (error) {
        console.error("Seed error: ",error);
        return NextResponse.json(
            { error: "Failed to seed database"},
            { status: 500}
        );
    }
}