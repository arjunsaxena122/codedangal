import { PrismaClient } from "../generated/prisma/index.js";
import config from "../config/config.js";

const globleForPrisma = globalThis;

export const db = globleForPrisma.prisma || new PrismaClient();

if (config.node_env !== "production") globleForPrisma.prisma = db;
