import { Router } from "express";
import {
  getMe,
  login,
  logout,
  signup,
} from "../controllers/user.controllers.js";
import verifyJwt from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/logout").get(verifyJwt, logout);
router.route("/get-me").get(verifyJwt, getMe);

export default router;
