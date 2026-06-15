import NextAuth from "next-auth";
import  CredentialsProvider  from "next-auth/providers/credentials";
import connectDB from "@/lib/mongodb";
import Admin from "@/models/Admin";
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
        await connectDB();

        if(!credentials?.email || !credentials?.password){
            throw new Error("Please provide both email and password");
        }

        const admin = await Admin.findOne({email: credentials.email});

        if(!admin){
            throw new Error("No admin found with this email");
        }

        const isPasswordMatch = await bcrypt.compare(credentials.password, admin.password);

        if(!isPasswordMatch) {
            throw new Error("Incorrect password");
        }

        return {
            id: admin._id.toString(),
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

export { handler as GET, handler as POST};