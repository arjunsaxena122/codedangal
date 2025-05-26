import { ApiError, ApiResponse, asyncHandler } from "../utils/index.js";
import {
  getJudge0LanguageId,
  pollBatchResults,
  submitBatch,
} from "../libs/judge0.lib.js";
import { db } from "../db/db.js";

const executeCode = asyncHandler(async (req, res) => {
  const { source_code, language_id, stdin, expected_outputs, problemId } =
    req.body;

  if (
    [source_code, language_id, stdin, expected_outputs, problemId].some(
      (find) => find.trim() !== ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const userId = req?.user?.id;

  if (
    (stdin.length > 0 && !Array.isArray(stdin)) ||
    (expected_outputs.length !== stdin.length &&
      !Array.isArray(expected_outputs))
  ) {
    throw new ApiError(400, "Invalid test cases");
  }

  const submissions = stdin.map((input) => ({
    source_code,
    language_id,
    stdin: input,
  }));

  //   if(!submissions){
  //     throw new ApiError(400,"")
  //   }

  const submitResponse = await submitBatch(submissions);

  const tokens = submitResponse.map((res) => res.token);

  const results = await pollBatchResults(tokens);

  console.log("execute code results", results);

  let allPassed = true;

  const detaildResult = results.map((result, i) => {
    const stdout = result.stdout?.trim();
    const expected_output = result.expected_outputs[i]?.trim();
    const passed = stdout === expected_output;

    if (!passed) {
      return (allPassed = false);
    }

    return {
      testCase: i + 1,
      passed,
      stdout,
      expected: expected_output,
      stderr: result.stderr || null,
      compile_output: result.compile_output || null,
      status: result.status.description,
      memory: result.memory ? `${result.memory} KB` : undefined,
      time: result.time ? `${result.time} s` : undefined,
    };
  });

  console.log(detaildResult);

  const submission = await db.submission.create({
    data: {
      userId,
      problemId,
      sourceCode: source_code,
      lanugage: getJudge0LanguageId(language_id),
      stdin: stdin.join("\n"),
      stdout: JSON.stringify(detaildResult.map((r) => r.stdout)),
      stderr: JSON.stringify(detaildResult.some((r) => r.stderr)) || null,
      compileOutput:
        JSON.stringify(detaildResult.some((r) => r.compile_output)) || null,

      status: allPassed ? "ACCEPTED" : "WRONG",
      memory: JSON.stringify(detaildResult.some((r) => r.memory)) || null,
      time: JSON.stringify(detaildResult.some((r) => r.time)) || null,
    },
  });

  // ? upsert if record doesn't exist toh create it otherwise update it

  if (allPassed) {
    await db.SolvedProblem.upsert({
      where: {
        userId_problemId: {
          userId,
          problemId,
        },
      },
      update: {},
      create: {
        userId,
        problemId,
      },
    });
  }

  const testCaseResults = detaildResult.map((result) => ({
    submissionId: submission.id,
    testCase: result.testCase,
    passed: result.passed,
    stdout: result.stdout,
    expected: result.expected,
    stderr: result.stderr,
    compileOutput: result.compile_output,
    status: result.status,
    memory: result.memory,
    time: result.time,
  }));

  await db.testCases.createMany({
    data: {
      testCaseResults,
    },
  });

  const submissionWithTestCases = await db.submission.findUnique({
    where: {
      id: submission.id,
    },
    include: {
      testCase: true,
    },
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, "code execute successfully and save in db"),
      submissionWithTestCases
    );
});

export { executeCode };
