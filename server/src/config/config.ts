import dotenv from "dotenv";
import { z } from "zod";
import { ApiError } from "../utils/api-error";

dotenv.config({
  path: "./.env",
});

const envSchema = z.object({
  PORT: z.string().optional(),
  NODE_ENV: z.string(),
  DATABASE_URL: z.string(),
  ACCESS_TOKEN_KEY: z.string(),
  ACCESS_TOKEN_EXPIRY: z.string(),
  REFRESH_TOKEN_KEY: z.string(),
  REFRESH_TOKEN_EXPIRY: z.string(),
});

const createEnv = (env: NodeJS.ProcessEnv) => {
  const validateEnv = envSchema.safeParse(env);

  if (validateEnv?.error) {
    throw new ApiError(400, "Env validation failed", [validateEnv?.error]);
  }

  return validateEnv?.data;
};

export const env = createEnv(process.env);
