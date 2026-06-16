import NextAuth from "next-auth";
import prisma from "@/lib/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@dairy.com" },
        password: { label: "Password", type: "password" }
      },
      
      async authorize(credentials) {
        // 1. 'await prisma()' ko hata diya kyunki Prisma client auto-connect karta hai, use function ki tarah call nahi karna padta.

        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please provide both email and password");
        }

        // 2. Mongoose 'Admin.findOne' ki jagah Prisma ka strict 'findUnique' query use kiya MySQL ke liye
        const admin = await prisma.admin.findUnique({
          where: { email: credentials.email }
        });

        if (!admin) {
          throw new Error("No admin found with this email");
        }

        const isPasswordMatch = await bcrypt.compare(credentials.password, admin.password);

        if (!isPasswordMatch) {
          throw new Error("Incorrect password");
        }

        // 3. Prisma mein MongoDB ki tarah '_id' nahi hota, hamne schema mein seedha string 'id' banaya hai.
        return {
          id: admin.id,
          name: admin.name,
          email: admin.email
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login"
  }
});

export { handler as GET, handler as POST };