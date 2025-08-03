import { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import { IRequestUser } from "../helper/auth.helper";
import { ApiError } from "../utils/api-error";
import prisma from "../db/db";
import { ApiResponse } from "../utils/api-response";

const getAllSubmission = asyncHandler(
  async (req: IRequestUser, res: Response) => {
    if (!req.user || !req.user.id)
      throw new ApiError(401, "Request userId not found, Unauthroised user");

    const userId = req.user.id.toString();

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new ApiError(404, "user not found");

    const submission = await prisma.submission.findMany({
      where: { userId: userId },
    });

    if (!submission) throw new ApiError(404, "No submission available");

    return res
      .status(200)
      .json(new ApiResponse(200, "all submission fetched", submission));
  },
);

const getAllSubmissionProblem = asyncHandler(
  async (req: IRequestUser, res: Response) => {
    if (!req.user || !req.user.id)
      throw new ApiError(401, "Request userId not found, Unauthroised user");

    const userId = req.user.id.toString();
    const { pid } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new ApiError(404, "user not found");

    const problem = await prisma.problem.findUnique({
      where: { id: pid },
    });

    if (!problem) throw new ApiError(404, "problem doesn't exist");

    const submission = await prisma.submission.findMany({
      where: {
        AND: [{ userId }, { problemId: pid }],
      },
    });

    if (!submission)
      throw new ApiError(404, "No submission available for this problem");

    return res
      .status(200)
      .json(new ApiResponse(200, "all submission fetched", submission));
  },
);

const getCountSubmissionProblem = asyncHandler(
  async (req: IRequestUser, res: Response) => {
    if (!req.user || !req.user.id)
      throw new ApiError(401, "Request userId not found, Unauthroised user");

    const userId = req.user.id.toString();
    const { pid } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new ApiError(404, "user not found");

    const problem = await prisma.problem.findUnique({
      where: { id: pid },
    });

    if (!problem) throw new ApiError(404, "problem doesn't exist");

    const count = await prisma.submission.count({
      where: {
        AND: [{ userId }, { problemId: pid }],
      },
    });

    if (!count)
      throw new ApiError(404, "No count available for the submission problem");

    return res
      .status(200)
      .json(new ApiResponse(200, "all submission fetched", count));
  },
);

export { getAllSubmission, getAllSubmissionProblem, getCountSubmissionProblem };
