import { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import { ApiResponse } from "../utils/api-response";
import { ApiError } from "../utils/api-error";
import prisma from "../db/db";
import {
  generateAccessAndRefreshToken,
  hashedPassword,
  IRequestUser,
  isCheckCorrectPassword,
} from "../helper/auth.helper";
import { env } from "../config/config";

const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Please fill the required fields");
  }

  const existedUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existedUser) {
    throw new ApiError(409, "User already registered, Please login!");
  }

  const user = await prisma.user.create({
    data: {
      email,
      password: await hashedPassword(password),
    },
  });

  const loggedInUser = await prisma.user.findUnique({
    where: {
      id: user.id,
    },
    select: {
      id: true,
      email: true,
      isEmailVerified: true,
      role: true,
    },
  });

  if (!loggedInUser) {
    throw new ApiError(500, "Internal server error, Please try again!");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, "user registered successfully", loggedInUser));
});

const login = asyncHandler(async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Please fill the required fields");
  }

  const existedUser = await prisma.user.findFirst({
    where: {
      OR: [{ username }, { email }],
    },
  });

  if (!existedUser) {
    throw new ApiError(404, "Invalid credentional, Please registered!");
  }

  const isPasswordCorrect = await isCheckCorrectPassword(
    password,
    existedUser?.password,
  );

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid credentional");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    existedUser?.id,
  );

  if (!accessToken || !refreshToken) {
    throw new ApiError(404, "Tokens are not generate");
  }

  const accessOptions = {
    httpOnly: true,
    secure: true,
    sameSite: (env.NODE_ENV !== "production" ? "lax" : "strict") as
      | "lax"
      | "strict",
    maxAge: 1000 * 60 * 60,
  };

  const refreshOptions = {
    httpOnly: true,
    secure: true,
    sameSite: (env.NODE_ENV !== "production" ? "lax" : "strict") as
      | "lax"
      | "strict",
    maxAge: 1000 * 60 * 60 * 24,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, accessOptions)
    .cookie("refreshToken", refreshToken, refreshOptions)
    .json(new ApiResponse(200, "user login successfully"));
});

const logout = asyncHandler(async (req: IRequestUser, res: Response) => {
  if (!req.user) {
    throw new ApiError(404, "request user not exist");
  }

  const userID = req.user;

  if (!userID.id) {
    throw new ApiError(404, "userID not found");
  }

  const user = await prisma.user.findUnique({
    where: { id: userID.id },
  });

  if (!user) {
    throw new ApiError(401, "ERROR: Unauthorised user");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: null },
  });

  const accessOptions = {
    httpOnly: true,
    secure: true,
    sameSite: (env.NODE_ENV !== "production" ? "lax" : "strict") as
      | "lax"
      | "strict",
    maxAge: 1000 * 60 * 60,
    expires: new Date(0),
  };

  const refreshOptions = {
    httpOnly: true,
    secure: true,
    sameSite: (env.NODE_ENV !== "production" ? "lax" : "strict") as
      | "lax"
      | "strict",
    maxAge: 1000 * 60 * 60 * 24,
    expires: new Date(0),
  };

  return res
    .status(204)
    .clearCookie("accessToken", accessOptions)
    .clearCookie("refreshToken", refreshOptions)
    .json(new ApiResponse(204, "user logout successfully"));
});

const authCheck = asyncHandler(async (req: Request, res: Response) => {
  return res.status(200).json(new ApiResponse(200, { isAuth: true }));
});

export { register, login, logout, authCheck };
