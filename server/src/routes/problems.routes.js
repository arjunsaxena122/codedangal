import { Router } from "express";
import {
  createProblem,
  deleteProblem,
  getAllProblem,
  getProblem,
  getSolvedProblemByUser,
  updateProblem,
} from "../controllers/problems.controllers.js";
import verifyJwt from "../middlewares/auth.middlewares.js";
import verifyAdmin from "../middlewares/admin.middlewares.js";

const router = Router();

router.route("/create-problem").post(verifyJwt, verifyAdmin, createProblem);

router.route("/get-all-problem").get(verifyJwt, getAllProblem);

router.route("/get-problem/:id").get(verifyJwt, getProblem);

router.route("/update-problem/:id").put(verifyJwt, verifyAdmin, updateProblem);

router
  .route("/delete-problem/:id")
  .delete(verifyJwt, verifyAdmin, deleteProblem);

router.route("/get-solved-problem").get(verifyJwt, getSolvedProblemByUser);

export default router;
