import { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import { ApiResponse } from "../utils/api-response";

const healthCheck = asyncHandler(async (req: Request, res: Response) => {
  res.status(200).json(new ApiResponse(200, "Server health is good"));
});

export { healthCheck };
