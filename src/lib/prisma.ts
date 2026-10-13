import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  const isCloudDb = connectionString?.includes("supabase.co") || connectionString?.includes("pooler.supabase.com");
  const pool = new Pool({
    connectionString: connectionString || "postgresql://localhost:5432/unused",
    ssl: isCloudDb ? { rejectUnauthorized: false } : undefined,
  });
  const adapter = new PrismaPg(pool);
  globalForPrisma.pool = pool;

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function isDatabaseConnected(): Promise<boolean> {
  try {
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.trim() === "") {
      return false;
    }
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}
