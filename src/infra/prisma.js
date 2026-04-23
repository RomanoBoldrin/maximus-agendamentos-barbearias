/**
 * Prisma Client Singleton
 * -----------------------
 * This file is responsible for creating and exporting a single shared instance
 * of PrismaClient across the entire application.
 *
 * Why this exists:
 * - Each PrismaClient instance maintains its own database connection pool.
 * - Creating multiple instances (e.g., on every request or file reload)
 *   can quickly exhaust the database's connection limit.
 *
 * How it works:
 * - In development, Next.js hot-reloads modules frequently, which can cause
 *   multiple PrismaClient instances to be created.
 * - To prevent this, we store the Prisma instance on `globalThis` and reuse it
 *   if it already exists.
 * - In production, modules are typically loaded once, so a single instance is
 *   naturally maintained.
 *
 * Usage:
 * - Import this `prisma` instance anywhere in the app instead of creating a new one.
 *
 *   import { prisma } from "@/infra/database.js";
 *
 * - Do NOT call `new PrismaClient()` in other files. Thanks.
 *
 */


import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

// Fail fast in case DATABASE_URL is not defined
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const connectionString = process.env.DATABASE_URL;
const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.__prisma ||
  new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "warn", "error"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__prisma = prisma;
}
