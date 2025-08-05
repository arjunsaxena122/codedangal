import { Router } from "express";
import {
  authCheck,
  login,
  logout,
  register,
} from "../controllers/auth.controller";

const router: Router = Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/check-auth").get(authCheck);

export default router;
