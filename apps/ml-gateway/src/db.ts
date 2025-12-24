import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { PrismaClient } from "./generated/prisma/index.js";

const { Pool } = pg;

// Singleton pattern for Prisma Client
// Prevents multiple instances in development with hot-reload
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: typeof Pool.prototype | undefined;
};

const createPrismaClient = () => {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const pool = new Pool({ connectionString: databaseUrl });
  const adapter = new PrismaPg(pool);

  const client = new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

  // Store pool for cleanup
  globalForPrisma.pool = pool;

  // Graceful shutdown
  process.on("beforeExit", async () => {
    await client.$disconnect();
    await pool.end();
  });

  return client;
};

export const prisma =
  globalForPrisma.prisma ??
  ((process.env.NODE_ENV === "test"
    ? undefined
    : createPrismaClient()) as PrismaClient);

if (process.env.NODE_ENV !== "production" && prisma) {
  globalForPrisma.prisma = prisma;
}
