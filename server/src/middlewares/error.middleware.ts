import { NextFunction, Request, Response } from "express";

const customErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
    const statusCode = err.statusCode ?? 500

    return res.status(statusCode).json({
        message : err?.message || "Internal server error",
        success : err?.success || false,
        errors : err?.errros || [],
        
    })
};

export {customErrorHandler}