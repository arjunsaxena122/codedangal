import { Router } from "express";
import { executeCode } from "../controllers/execute.controller";
import { authVerifyJwt } from "../middlewares/auth.middleware";
import rbac from "../middlewares/rbac.middleware";
import { AuthRolesEnum } from "../constant";

const router: Router = Router();

router
  .route("/")
  .post(
    authVerifyJwt,
    rbac([AuthRolesEnum.ADMIN, AuthRolesEnum.USER]),
    executeCode,
  );

export default router;
