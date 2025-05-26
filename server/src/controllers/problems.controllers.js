import { ApiError, ApiResponse, asyncHandler } from "../utils/index.js";
import {
  getJudge0LanguageId,
  pollBatchResults,
  submitBatch,
} from "../libs/judge0.lib.js";
import { db } from "../db/db.js";

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
    console.log("resuls ======== problem", results);
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

const getAllProblem = asyncHandler(async (req, res) => {
  const userProblems = await db.problem.findMany();

  console.log(`get all problem ${userProblems}`);

  if (!userProblems) {
    return new ApiError(404, "No Problem found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "fetched all problems successfully"));
});

const getProblem = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const specificProblem = await db.problem.findUnique({
    where: { id },
  });

  if (!specificProblem) {
    throw new ApiError(404, "code problem not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "code problem found successfully"));
});

const updateProblem = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // const updatedProblem = await db.problem.update({
  //   where: { id },
  //   data: {
  //     title,
  //     description,
  //     difficulty,
  //     tags,
  //     examples,
  //     constraints,
  //     testCases,
  //     codeSnippets,
  //     referenceSolution,
  //   },
  // });
});

const deleteProblem = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (req?.user?.role !== "ADMIN") {
    throw new ApiError(403, "permission denied to delete problem");
  }

  const deleteSpecificProblem = await db.problem.delete({
    where: { id },
  });

  if (!deleteSpecificProblem) {
    throw new ApiError(400, "Internal server issue to delete this problem");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "code problem deleted successfully"));
});

const getSolvedProblemByUser = asyncHandler(async (req, res) => {
  const problemId = req.params;

  const allProblem = await db.problem.findMany({
    where: {
      solvedProblem: {
        userId: req?.user?.id,
        problemId,
      },
    },
    include: {
      where: {
        userId: req?.user?.id,
      },
    },
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, "fetched user all solved code problem", allProblem)
    );
});

export {
  createProblem,
  getAllProblem,
  getProblem,
  updateProblem,
  deleteProblem,
  getSolvedProblemByUser,
};
