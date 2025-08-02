import { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import { IRequestUser } from "../helper/auth.helper";
import { ApiError } from "../utils/api-error";
import prisma from "../db/db";
import { AuthRolesEnum } from "../constant";
import {
  createSubmissionBatch,
  getLanguageId,
  getSubmissionResult,
} from "../helper/judge0.helper";
import { ApiResponse } from "../utils/api-response";

const createProblem = asyncHandler(async (req: IRequestUser, res: Response) => {
  if (!req.user || !req.user.id) {
    throw new ApiError(401, "Unauthorised user");
  }

  const id = req.user?.id;

  const user = await prisma.user.findUnique({
    where: { id },
    select: { role: true },
  });

  if (user?.role !== AuthRolesEnum.ADMIN) {
    throw new ApiError(403, "ERROR: ACCESS DENIED: Only access by Admin");
  }

  const {
    title,
    description,
    difficulty,
    tags,
    examples,
    constraints,
    // hints,
    // editorial,
    testCases,
    codeSnippets,
    referenceSolutions,
  } = req.body;

  if (
    [
      title,
      description,
      difficulty,
      tags,
      examples,
      constraints,
      // hints,
      // editorial,
      testCases,
      codeSnippets,
      referenceSolutions,
    ].some((result) => result === "")
  ) {
    throw new ApiError(400, "Please fill the all required fields");
  }

  try {
    for (const [language, solutionCode] of Object.entries(referenceSolutions)) {
      const languagesId = await getLanguageId(language);

      if (!languagesId) {
        throw new ApiError(404, "Language not found");
      }

      const submission = testCases.map(
        ({ input, output }: { input: string; output: string }) => ({
          source_code: solutionCode,
          language_id: languagesId,
          stdin: input,
          expected_output: output,
        }),
      );

      const submissionBatch = await createSubmissionBatch(submission);

      const submissionToken = submissionBatch.map(
        (t: { token: string }) => t.token,
      );

      const submissionResult = await getSubmissionResult(submissionToken);

      console.log(submissionResult);

      for (let i = 0; i < submissionResult.length; i++) {
        const result = submissionResult[i];

        if (result.status.id !== 3) {
          throw new ApiError(
            400,
            `ERROR: Testcase failed  ${i + 1} for this language ${language}`,
          );
        }
      }
    }

    const existedProblem = await prisma.problem.findUnique({
      where: {
        title,
      },
    });

    if (existedProblem) {
      throw new ApiError(409, "Problem already existed!");
    }

    const problem = await prisma.problem.create({
      data: {
        title,
        description,
        difficulty,
        tags,
        examples,
        constraints,
        // hints,
        // editorial,
        testCases,
        codeSnippets,
        referenceSolutions,
        userId: id,
      },
    });

    const isCheckAddProblem = await prisma.problem.findUnique({
      where: {
        id: problem?.id,
      },
    });

    if (!isCheckAddProblem) {
      throw new ApiError(500, "Internal server error, Please retry!");
    }

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          "Your problem added successfully",
          isCheckAddProblem,
        ),
      );
  } catch (error) {
    throw new ApiError(400, `ERROR: ${error}`);
  }
});

const getAllProblem = asyncHandler(async (req: Request, res: Response) => {
  const allProblem = await prisma.problem.findMany();

  if (!allProblem) {
    throw new ApiError(404, "No problem found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Problem fetched successfully", allProblem));
});

const getProblemById = asyncHandler(async (req: Request, res: Response) => {
  const { pid } = req.params;

  console.log(pid);

  if (!pid) {
    throw new ApiError(404, "No found problemId");
  }

  const problem = await prisma.problem.findUnique({
    where: { id: pid },
  });

  if (!problem) {
    throw new ApiError(404, "problem not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, `${problem?.title} fetched successfully`, problem),
    );
});

const getSolvedProblem = asyncHandler(
  async (req: Request, res: Response) => {},
);

const updateProblemById = asyncHandler(
  async (req: IRequestUser, res: Response) => {
    if (!req.user || !req.user.id) {
      throw new ApiError(401, "Unauthorised user");
    }

    const userId = req.user?.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (user?.role !== AuthRolesEnum.ADMIN) {
      throw new ApiError(403, "ERROR: ACCESS DENIED: Only access by Admin");
    }

    const { pid } = req.params;

    if (!pid) {
      throw new ApiError(404, "No found problemId");
    }

    const problem = await prisma.problem.findUnique({
      where: { id: pid },
    });

    if (!problem) {
      throw new ApiError(404, "problem not found");
    }

    const {
      title,
      description,
      difficulty,
      tags,
      examples,
      constraints,
      // hints,
      // editorial,
      testCases,
      codeSnippets,
      referenceSolutions,
    } = req.body;

    if (
      [
        title,
        description,
        difficulty,
        tags,
        examples,
        constraints,
        // hints,
        // editorial,
        testCases,
        codeSnippets,
        referenceSolutions,
      ].some((result) => result === "")
    ) {
      throw new ApiError(400, "Please fill the all required fields");
    }

    try {
      for (const [language, solutionCode] of Object.entries(
        referenceSolutions,
      )) {
        const languagesId = await getLanguageId(language);

        if (!languagesId) {
          throw new ApiError(404, "Language not found");
        }

        const submission = testCases.map(
          ({ input, output }: { input: string; output: string }) => ({
            source_code: solutionCode,
            language_id: languagesId,
            stdin: input,
            expected_output: output,
          }),
        );

        const submissionBatch = await createSubmissionBatch(submission);

        const submissionToken = submissionBatch.map(
          (t: { token: string }) => t.token,
        );

        const submissionResult = await getSubmissionResult(submissionToken);

        console.log(submissionResult);

        for (let i = 0; i < submissionResult.length; i++) {
          const result = submissionResult[i];

          if (result.status.id !== 3) {
            throw new ApiError(
              400,
              `ERROR: Testcase failed  ${i + 1} for this language ${language}`,
            );
          }
        }
      }

      const existedProblem = await prisma.problem.findUnique({
        where: {
          title,
        },
      });

      if (existedProblem) {
        throw new ApiError(409, "Problem already existed!");
      }

      const problem = await prisma.problem.update({
        where: { id: pid.toString() },
        data: {
          title,
          description,
          difficulty,
          tags,
          examples,
          constraints,
          // hints,
          // editorial,
          testCases,
          codeSnippets,
          referenceSolutions,
          userId,
        },
      });

      const isCheckAddProblem = await prisma.problem.findUnique({
        where: {
          id: problem?.id,
        },
      });

      if (!isCheckAddProblem) {
        throw new ApiError(500, "Internal server error, Please retry!");
      }

      return res
        .status(201)
        .json(
          new ApiResponse(
            201,
            "Your problem added successfully",
            isCheckAddProblem,
          ),
        );
    } catch (error) {
      throw new ApiError(400, `ERROR: ${error}`);
    }
  },
);

const deleteProblemById = asyncHandler(
  async (req: IRequestUser, res: Response) => {
    if (!req.user || !req.user.id) {
      throw new ApiError(401, "Unauthorised user");
    }

    const id = req.user?.id;

    const user = await prisma.user.findUnique({
      where: { id },
      select: { role: true },
    });

    if (user?.role !== AuthRolesEnum.ADMIN) {
      throw new ApiError(403, "ERROR: ACCESS DENIED: Only access by Admin");
    }

    const { pid } = req.params;

    if (!pid) {
      throw new ApiError(404, "No found problemId");
    }

    const problem = await prisma.problem.findUnique({
      where: { id: pid },
    });

    if (!problem) {
      throw new ApiError(404, "problem not found");
    }

    const removeProblem = await prisma.problem.delete({
      where: { id: pid },
    });

    const isCheckRemoveProblem = await prisma.problem.findUnique({
      where: {
        id: removeProblem?.id,
      },
    });

    if (isCheckRemoveProblem) {
      throw new ApiError(500, "Internal server error, Please try again!");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          ` ${removeProblem?.title} problem remove`,
          removeProblem,
        ),
      );
  },
);

export {
  createProblem,
  getAllProblem,
  getProblemById,
  getSolvedProblem,
  updateProblemById,
  deleteProblemById,
};
