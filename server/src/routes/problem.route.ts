import { Router } from "express";
import {
  createProblem,
  deleteProblemById,
  getAllProblem,
  getProblemById,
  getAllSolvedProblemByUser,
  updateProblemById,
} from "../controllers/problem.controller";
import { authVerifyJwt } from "../middlewares/auth.middleware";
import rbac from "../middlewares/rbac.middleware";
import { AuthRolesEnum } from "../constant";

const router: Router = Router();

router
  .route("/create-problem")
  .post(authVerifyJwt, rbac([AuthRolesEnum.ADMIN]), createProblem);

router
  .route("/get-all-problem")
  .get(
    authVerifyJwt,
    rbac([AuthRolesEnum.ADMIN, AuthRolesEnum.USER]),
    getAllProblem,
  );

router
  .route("/get-problem/:pid")
  .get(
    authVerifyJwt,
    rbac([AuthRolesEnum.ADMIN, AuthRolesEnum.USER]),
    getProblemById,
  );

router
  .route("/get-solved-problem")
  .get(
    authVerifyJwt,
    rbac([AuthRolesEnum.ADMIN, AuthRolesEnum.USER]),
    getAllSolvedProblemByUser,
  );

router
  .route("/update-problem/:pid")
  .put(authVerifyJwt, rbac([AuthRolesEnum.ADMIN]), updateProblemById);
router
  .route("/delete-problem/:pid")
  .delete(authVerifyJwt, rbac([AuthRolesEnum.ADMIN]), deleteProblemById);

export default router;
