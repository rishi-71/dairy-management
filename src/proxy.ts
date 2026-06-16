
export { default } from "next-auth/middleware";

export const config = {
  // Specify the routes you want to protect from unauthorized access
  matcher: [
    "/dashboard/:path*",
    "/customers/:path*",
    "/items/:path*",
  ],
};