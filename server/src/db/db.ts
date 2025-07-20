import { env } from "../config/config";
import { PrismaClient } from "../generated/prisma";

// ? -> intersection "&" from ts, they have combination of gloableThis and prisma,we need both of them

const globalWithPrisma = globalThis as typeof globalThis & {
  prisma: PrismaClient;
};

const prisma = globalWithPrisma.prisma ?? new PrismaClient();

if (env.NODE_ENV !== "production") globalWithPrisma.prisma = prisma;

export default prisma;
