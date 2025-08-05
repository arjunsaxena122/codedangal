import { Router } from "express";
import { authVerifyJwt } from "../middlewares/auth.middleware";
import {
  addProblemInPlaylist,
  createPlaylist,
  deletePlaylist,
  getAllPlaylist,
  getPlaylistById,
  removeProblemByIdFromPlaylist,
} from "../controllers/playlist.controller";

const router: Router = Router();

router.route("/get-all-playlist").get(authVerifyJwt, getAllPlaylist);
router.route("/:pid").get(authVerifyJwt, getPlaylistById);
router.route("/create-playlist").post(authVerifyJwt, createPlaylist);
router.route("/:pid/add-problem").post(authVerifyJwt, addProblemInPlaylist);
router.route("/:pid").delete(deletePlaylist);
router
  .route("/:pid/remove-problem/:problemId")
  .delete(removeProblemByIdFromPlaylist);

export default router;
 