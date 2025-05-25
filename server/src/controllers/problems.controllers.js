import { ApiError, ApiResponse, asyncHandler } from "../utils/index.js";
import {
  getJudge0LanguageId,
  pollBatchResults,
  submitBatch,
} from "../libs/judge0.lib.js";
import db from "../db/db.js";

const createProblem = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    difficulty,
    tags,
    examples,
    constraints,
    testCases,
    codeSnippets,
    referenceSolution,
  } = req.body;

  if (
    [
      title,
      description,
      difficulty,
      tags,
      examples,
      constraints,
      testCases,
      codeSnippets,
      referenceSolution,
    ].some((emt) => emt !== "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  if (req?.user?.role !== "ADMIN") {
    throw new ApiError(403, "permission denied to create problem");
  }

  for (const [language, solutionCode] of Object.entries()) {
    const languageId = getJudge0LanguageId(language);

    if (!languageId) {
      throw new ApiError(
        400,
        `This ${language} programming lanugage doesn't supported`
      );
    }

    const submission = testCases.map(({ input, output }) => ({
      source_code: solutionCode,
      language_id: languageId,
      stdin: input,
      expected_output: output,
    }));

    const submissionResult = await submitBatch(submission);

    const tokens = submissionResult.map((res) => res.token);

    const results = await pollBatchResults(tokens);

    for (let i = 0; i < results.length; i++) {
      const result = results[i];

      if (result.status.id !== 3) {
        throw new ApiError(400, `Testcase ${i + 1} failed`);
      }
    }

    const newProblem = await db.problem.create({
      data: {
        title,
        description,
        difficulty,
        tags,
        examples,
        constraints,
        testCases,
        codeSnippets,
        referenceSolution,
        userId: req.user.id,
      },
    });

    console.log(newProblem);

    return res
      .status(201)
      .json(new ApiResponse(201, "code problem created successfully"));
  }
});

const getAllProblem = asyncHandler(async (req, res) => {});

const getProblem = asyncHandler(async (req, res) => {});

const updateProblem = asyncHandler(async (req, res) => {});

const deleteProblem = asyncHandler(async (req, res) => {});

const getSolvedProblemByUser = asyncHandler(async (req, res) => {});

export {
  createProblem,
  getAllProblem,
  getProblem,
  updateProblem,
  deleteProblem,
  getSolvedProblemByUser,
};
