import { Router } from "express";
import verifyJwt from "../middlewares/auth.middlewares.js";
import {
  getAllSubmission,
  getAllSubmissionCount,
  getSubmissionForProblem,
} from "../controllers/submission.controllers.js";

const router = Router();

router.route("/get-all-submissions").get(verifyJwt, getAllSubmission);
router
  .route("/get-submissions/:problemId")
  .get(verifyJwt, getSubmissionForProblem);
router
  .route("/get-submissions-count/:problemId")
  .get(verifyJwt, getAllSubmissionCount);

export default router;
