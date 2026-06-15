import connectDB from "@/lib/mongodb";
import Admin from "@/models/Admin";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function GET() {
    try {
        await connectDB();

        const existingAdmin = await Admin.findOne({ email: "admin@dairy.com"});

        if(existingAdmin){
            return NextResponse.json({ message: "Admin already exists."});
        }

        const hashedPassword = await bcrypt.hash("admin123",10);

        await Admin.create({
            name: "Dairy Admin",
            email: "admin@dairy.com",
            password: hashedPassword,
        });

        return NextResponse.json({ message: "Admin created successfully"})
    } catch (error) {
        return NextResponse.json({ error: "Failed to create admin" }, { status: 500 });
        
    }
}