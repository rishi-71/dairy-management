import dotenv from "dotenv";

dotenv.config({
  path: process.cwd() + "/.env",
});

console.log("DATABASE_URL:");
console.log(process.env.DATABASE_URL);