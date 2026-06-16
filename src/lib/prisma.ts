// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const prismaClientSingleton = () => {
  // Convert mysql:// to mariadb:// because the underlying JS driver requires it at runtime
  const connectionUrl = process.env.DATABASE_URL?.replace("mysql://", "mariadb://");
  
  if (!connectionUrl) {
    throw new Error("DATABASE_URL is missing from your environment variables.");
  }

  // Create the runtime driver adapter
  const adapter = new PrismaMariaDb(connectionUrl);
  
  // Pass the adapter directly to Prisma Client
  return new PrismaClient({ adapter });
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;