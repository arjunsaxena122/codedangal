import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import { ApiError } from "../utils/api-error";
import {
  createSubmissionBatch,
  getSubmissionResult,
} from "../helper/judge0.helper";
import { ApiResponse } from "../utils/api-response";
import prisma from "../db/db";
import { IRequestUser } from "../helper/auth.helper";
import { StatusEnum } from "../constant";
import { Status } from "../generated/prisma";

interface Isubmission {
  sourceCode: string;
  language: number;
  stdin: string[];
  expectedOutput: string[];
  problemId: string;
}

interface Iresults {
  testCase: number;
  stdout: string | null;
  time: string;
  memory: number;
  stderr: string | null;
  token: string;
  expectedOutput: string;
  compile_output: string | null;
  message: string | null;
  status: {
    id: number;
    description: string;
  };
}

const executeCode = asyncHandler(
  async (req: IRequestUser, res: Response, next: NextFunction) => {
    if (!req.user || !req.user?.id) {
      throw new ApiError(401, "Request userId not found, Unauthorised user");
    }

    try {
      const {
        sourceCode,
        language,
        stdin,
        expectedOutput,
        problemId,
      }: Isubmission = req.body;

      const problem = await prisma.problem.findUnique({
        where: { id: problemId },
      });

      if (!problem) {
        throw new ApiError(404, "problem not found");
      }

      if (
        [sourceCode, language, stdin, expectedOutput, problemId].some(
          (r) => r === "",
        )
      ) {
        throw new ApiError(400, "Please fill all the required fields");
      }

      if (
        !Array.isArray(stdin) ||
        stdin.length === 0 ||
        !Array.isArray(expectedOutput) ||
        expectedOutput.length !== stdin.length
      ) {
        throw new ApiError(400, "Invalid testcases input and expected output");
      }

      const submission = stdin.map((input) => ({
        source_code: sourceCode,
        language_id: language,
        stdin: input,
      }));

      const submissionBatch = await createSubmissionBatch(submission);
      // console.log("submission batch execute code", submissionBatch);

      const tokens = submissionBatch.map((r: any) => {
        // console.log("token inside the execute", r);
        return r.token;
      });

      const results = await getSubmissionResult(tokens);
      // console.log("result inside the execute code", results);

      let allPassed = true;

      console.log(results)

      const detailedResult = results.map((result: Iresults, i: number) => {
        const stdout = result?.stdout?.trim();
        const expected_output = expectedOutput[i]?.trim();
        console.log("stdout",stdout)
        console.log("expected_output",expected_output)


        const passed = (stdout === expected_output);

        if (!passed) allPassed = false;

        return {
          testCase: i + 1,
          passed,
          stdout,
          expectedOutput: expected_output,
          stderr: result?.stderr ?? null,
          compile_output: result?.compile_output ?? null,
          status: result?.status?.description,
          memory: result?.memory ? `${result?.memory} KB` : null,
          time: result?.time ? `${result?.time} s` : null,
        };
      });

      const isStatus = detailedResult.map((result: { status: string }) =>
        result.status.toUpperCase(),
      );

      const addSubmission = await prisma.submission.create({
        data: {
          userId: req.user?.id,
          problemId: problemId,
          sourceCode: JSON.stringify(sourceCode),
          language: String(language),
          stdin: stdin.join("\n"),
          stdout: JSON.stringify(
            detailedResult.map((result: Iresults) => result?.stdout),
          ),
          stderr: detailedResult.map((result: Iresults) => result?.stderr)
            ? JSON.stringify(
                detailedResult.map((result: Iresults) => result?.stderr),
              )
            : null,
          compileOutput: detailedResult.map(
            (result: Iresults) => result?.compile_output,
          )
            ? JSON.stringify(
                detailedResult.map(
                  (result: Iresults) => result?.compile_output,
                ),
              )
            : null,
          status: isStatus.includes(StatusEnum.ACCEPTED)
            ? Status.ACCEPTED
            : Status.WRONG,
          memory: detailedResult.some((r: Iresults) => r.memory)
            ? JSON.stringify(detailedResult.map((r: Iresults) => r.memory))
            : null,
          time: detailedResult.some((r: Iresults) => r.time)
            ? JSON.stringify(detailedResult.map((r: Iresults) => r.time))
            : null,
        },
      });

      console.log(allPassed)

      if (allPassed) {
        const solvedProblem = await prisma.problemSolved.upsert({
          where: {
            userId_problemId: {
              userId: req.user?.id,
              problemId,
            },
          },
          update: {},
          create: {
            userId: req.user?.id,
            problemId,
          },
        });

        console.log(solvedProblem)

      }

      const testCaseResult = detailedResult.map((result: Iresults) => ({
        submissionId: addSubmission?.id,
        testCases: Number(result?.testCase),
        stdout: result?.stdout,
        expectedOutput: result?.expectedOutput,
        stderr: result?.stderr,
        compileOutput: result.compile_output,
        status: isStatus.includes(StatusEnum.ACCEPTED)
          ? Status.ACCEPTED
          : Status.WRONG,
        memory: result?.memory,
        time: result?.time,
      }));

      await prisma.testCaseResult.createMany({
        data: testCaseResult,
      });

      const submissionWithTestCases = await prisma.submission.findUnique({
        where: {
          id: addSubmission?.id,
        },
        include: {
          TestCaseResult: true,
        },
      });

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            "code execute successfully!",
            submissionWithTestCases,
          ),
        );
    } catch (error) {
      next(error);
    }
  },
);

export { executeCode };
