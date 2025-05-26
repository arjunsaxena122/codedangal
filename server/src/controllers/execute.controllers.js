import { ApiError, ApiResponse, asyncHandler } from "../utils/index.js";
import { pollBatchResults, submitBatch } from "../libs/judge0.lib.js";

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

  const allPasses = true;

  return res
    .status(200)
    .json(
      new ApiResponse(200, "code execute successfully and save in db", results)
    );
});

export { executeCode };
