import "server-only";
import { PrismaClient } from "../app/generated/prisma/client.ts";
import { createAdapter } from "./adapter.js";

const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.__firstMotoPrisma ?? new PrismaClient({ adapter: createAdapter() });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__firstMotoPrisma = prisma;
}
