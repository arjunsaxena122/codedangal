import { NextFunction, Request, Response } from "express";
import { env } from "../config/config";

const customErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const statusCode = err.statusCode ?? 500;

  return res.status(statusCode).json({
    message: err?.message || "Internal server error",
    success: err?.success || false,
    errors: err?.errors || [],
    stack: env.NODE_ENV !== "production" ? err?.stack : undefined,
  });
};

export { customErrorHandler };
