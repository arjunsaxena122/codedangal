import { Router } from "express";
import verifyJwt from "../middlewares/auth.middlewares.js";
import { executeCode } from "../controllers/execute.controllers.js";

const router = Router();

router.route("/").post(verifyJwt, executeCode);

export default router;
