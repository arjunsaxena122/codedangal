import { db } from "../db/db.js";
import { ApiResponse, asyncHandler } from "../utils/index.js";

const getAllSubmission = asyncHandler(async (req, res) => {
  const userId = req?.user?.id;

  const submission = await db.submission.findMany({
    where: {
      userId,
    },
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, "fetch get all submission successfully", submission)
    );
});

const getSubmissionForProblem = asyncHandler(async (req, res) => {
  const userId = req?.user?.id;

  const { problemId } = req.params;

  const submissionProblem = await db.submission.findMany({
    where: {
      AND: [{ userId }, { problemId }],
    },
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "fetch submission problem successfully",
        submissionProblem
      )
    );
});

const getAllSubmissionCount = asyncHandler(async (req, res) => {
  const { problemId } = req.params;

  const submissionCount = db.submission.count({
    where: {
      problemId,
    },
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "successfully the count the submission",
        submissionCount
      )
    );

});

export { getAllSubmission, getSubmissionForProblem, getAllSubmissionCount };
