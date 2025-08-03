import { Router } from "express";
import {
  getAllSubmission,
  getAllSubmissionProblem,
  getCountSubmissionProblem,
} from "../controllers/submission.controller";
import { authVerifyJwt } from "../middlewares/auth.middleware";

const router: Router = Router();

router.route("/get-all-submission").get(authVerifyJwt, getAllSubmission);
router
  .route("/get-all-submission-problem/:pid")
  .get(authVerifyJwt, getAllSubmissionProblem);
router
  .route("/get-count-submission-problem/:pid")
  .get(authVerifyJwt, getCountSubmissionProblem);

export default router;
