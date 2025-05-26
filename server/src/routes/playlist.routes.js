import { Router } from "express";
import verifyJwt from "../middlewares/auth.middlewares.js";
import {
  addProblem,
  createPlaylist, 
  deletePlaylist,
  deleteProblemFromPlaylist,
  getAllPlaylist,
  getPlaylistProblem,
} from "../controllers/playlist.controllers.js";

const router = Router();

router.route("/get-all-playlist").get(verifyJwt, getAllPlaylist);
router
  .route("/get-playlist-problem/:playlistId")
  .get(verifyJwt, getPlaylistProblem);
router.route("/create-playlist").post(verifyJwt, createPlaylist);
router.route("/:problemId/add-problem").post(verifyJwt, addProblem);
router.route("/:playlistId").delete(verifyJwt, deletePlaylist);
router
  .route("/:playlistId/delete-problem")
  .delete(verifyJwt, deleteProblemFromPlaylist);

export default router;
 