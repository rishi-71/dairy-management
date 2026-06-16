// src/proxy.ts
import { withAuth } from "next-auth/middleware";

// Explicitly defining the function satisfies the Next.js 16 compiler
export default function proxy(req: any, ctx: any) {
  return withAuth(req, ctx);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/customers/:path*",
    "/items/:path*",
  ],
};