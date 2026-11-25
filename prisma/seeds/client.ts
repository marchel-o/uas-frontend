import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@/generated/prisma/client";

const connectionString =
  process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL_UNPOOLED atau DATABASE_URL wajib diisi");
}

const adapter = new PrismaNeon({ connectionString });

export const prisma = new PrismaClient({ adapter });

export type SeedClient = typeof prisma;
