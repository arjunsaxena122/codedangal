import { Router } from "express";
import { healthCheck } from "../controllers/healthCheck.controller";

const router: Router = Router();

router.route("/health-check").get(healthCheck);

export default router;
