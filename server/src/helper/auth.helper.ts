import bcrypt from "bcryptjs";
import crypto from "crypto";
import { ApiError } from "../utils/api-error";
import prisma from "../db/db";
import jwt from "jsonwebtoken";
import { env } from "../config/config";
import { User } from "../generated/prisma";
import { Request } from "express";

const randString = () => {
  return crypto.randomBytes(32).toString("hex");
};

export const hashedPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 10);
};

export const isCheckCorrectPassword = async (
  password: string,
  hashedPassword: string,
) => {
  return await bcrypt.compare(password, hashedPassword);
};

export const generateAccessAndRefreshToken = async (
  id: string,
): Promise<{ accessToken: string; refreshToken: string }> => {
  if (!id) {
    throw new ApiError(404, "user id not found");
  }

  const accessToken = jwt.sign({ id }, env.ACCESS_TOKEN_KEY, {
    expiresIn: env.ACCESS_TOKEN_EXPIRY as jwt.SignOptions["expiresIn"],
  });
  const refreshToken = jwt.sign({ id }, env.REFRESH_TOKEN_KEY, {
    expiresIn: env.REFRESH_TOKEN_EXPIRY as jwt.SignOptions["expiresIn"],
  });

  const user = await prisma.user.update({
    where: {
      id,
    },
    data: {
      refreshToken,
    },
  });

  if (!user.refreshToken) {
    throw new ApiError(404, "refresh token isn't updated");
  }

  return { accessToken, refreshToken };
};

export interface IRequestUser extends Request {
  user?: User;
}
