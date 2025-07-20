import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/api-error";
import jwt from "jsonwebtoken";
import { env } from "../config/config";
import prisma from "../db/db";

const authVerifyJwt = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token =
      req?.cookies?.accessToken ||
      req.header("authorization")?.replace("Bearer", "").trim();

    if (!token) {
      throw new ApiError(404, "ERROR: token not found");
    }

    const decodeToken = jwt.verify(
      token,
      env.ACCESS_TOKEN_KEY,
    ) as jwt.JwtPayload;

    if (!decodeToken) {
      throw new ApiError(401, "ERROR: ACCESS DENID, Unauthroised access");
    }

    const user = await prisma.user.findUnique({
      where: { id: decodeToken?.id },
    });

    if (!user) {
      throw new ApiError(404, "user not found");
    }

    req.user = user;
    next();
  } catch (err) {
    next(new ApiError(403, "ERROR: ACCESS DENIED"));
  }
};

export { authVerifyJwt };
