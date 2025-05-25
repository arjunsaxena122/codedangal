import { ApiError, ApiResponse, asyncHandler } from "../utils/index.js";
import { db } from "../db/db.js";
import bcrypt from "bcryptjs";
import config from "../config/config.js";
import jwt from "jsonwebtoken";

const signup = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await db.user.findUnique({
    where: { email },
  });

  if (existedUser) {
    throw new ApiError(400, "user already exist");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await db.user.create({
    data: {
      email,
      password: hashedPassword,
    },
  });

  const loggedInUser = await db.user.findUnique({
    where: {
      id: user.id,
    },
    omit: {
      name: true,
      username: true,
      password: true,
      validateToken: true,
      refreshToken: true,
      resetToken: true,
      resetTokenExpire: true,
    },
  });

  if (!loggedInUser) {
    throw new ApiError(500, "Internal server Please try again signup process");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, "user signup successfully", loggedInUser));
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await db.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new ApiError(400, "Invalid Credentionals");
  }

  const isCheckPassword = await bcrypt.compare(password, user.password);

  if (!isCheckPassword) {
    throw new ApiError(400, "Invalid Credentionals");
  }

  const accessToken = jwt.sign({ id: user.id }, config.access_token_key, {
    expiresIn: config.access_token_expires,
  });

  const refreshToken = jwt.sign({ id: user.id }, config.refresh_token_key, {
    expiresIn: config.refresh_token_expires,
  });

  const updatedUser = await db.user.update({
    where: { email },
    data: { refreshToken },
    omit: {
      name: true,
      username: true,
      password: true,
      validateToken: true,
      resetToken: true,
      resetTokenExpire: true,
      refreshToken: true,
    },
  });

  let options = {
    httpOnly: true,
    secure: config.node_env !== "development",
    samesite: "strict",
    maxAge: 1000 * 60 * 60,
  };

  return res
    .status(200)
    .cookie("short_token", accessToken, options)
    .cookie("long_token", refreshToken, options)
    .json(new ApiResponse(200, "login successfully", updatedUser));
});

const logout = asyncHandler(async (req, res) => {
  const { id } = req?.user;
  console.log(id);

  const user = await db.user.update({
    where: { id },
    data: {
      refreshToken: null,
    },
    omit: {
      name: true,
      username: true,
      password: true,
      validateToken: true,
      resetToken: true,
      resetTokenExpire: true,
    },
  });

  if (!user) {
    throw new ApiError(400, "unauthorised user");
  }

  let options = {
    httpOnly: true,
    secure: config.node_env !== "development",
    samesite: "strict",
    maxAge: 1000 * 60 * 60,
  };

  return res
    .status(200)
    .clearCookie("short_token", options)
    .clearCookie("long_token", options)
    .json(new ApiResponse(200, "logout successfully", user));
});

const getMe = asyncHandler(async (req, res) => {
  const { id } = req?.user;

  const user = await db.user.findUnique({
    where: { id },
    omit: {
      password: true,
      validateToken: true,
      refreshToken: true,
      resetToken: true,
      resetTokenExpire: true,
    },
  });

  if (!user) {
    throw new ApiError(400, "unauthorised user");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "user data fetched successfully", user));
});

export { signup, login, logout, getMe };
