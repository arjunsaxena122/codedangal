import { ApiError, ApiResponse, asyncHandler } from "../utils/index.js";
import { db } from "../db/db.js";

const getAllPlaylist = asyncHandler(async (req, res) => {
  const { userId } = req?.user?.id;

  const allPlaylist = await db.playlist.findMany({
    where: {
      userId,
    },
    include: {
      name: true,
    },
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, "successfully fetched all playlist", allPlaylist)
    );
});

const getPlaylistProblem = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  const playlistProblem = await db.playlist.findMany({
    where: {
      id: playlistId,
      userId: req?.user?.id,
    },
    include: {
      ProblemPlaylist: {
        include: {
          problem: true,
        },
      },
    },
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "successfully fetched all playlist related problem",
        playlistProblem
      )
    );
});

const createPlaylist = asyncHandler(async (req, res) => {
  const { name } = req.body;

  const { userId } = req?.user?.id;

  const createPlaylist = await db.playlist.create({
    data: { name, userId },
  });

  return res
    .status(201)
    .json(new ApiResponse(201, "Playlist create successfully", createPlaylist));
});

const addProblem = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { problemIds } = req.body;

  if (!Array.isArray(problemIds) && problemIds.length > 0) {
    throw new ApiError(400, "Invalid ProblemIds");
  }

  const addingProblemInPlaylist = await db.problemPlaylist.createMany({
    data: problemIds.map((problemId) => ({
      playlistId,
      problemId,
    })),
  });

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        "successfuly problem add in playlist",
        addingProblemInPlaylist
      )
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  const deleteParticularPlaylist = await db.playlist.delete({
    where: {
      id: playlistId,
    },
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "successfully playlist deleted",
        deleteParticularPlaylist
      )
    );
});

const deleteProblemFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  const { problemId } = req.body;

  const deletedSpecificProblemInPlaylist = await db.ProblemPlaylist.delete({
    where: {
      id: playlistId,
      problemId: problemId,
    },
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "successfully problem deleted from playlist",
        deletedSpecificProblemInPlaylist
      )
    );
});

export {
  getAllPlaylist,
  getPlaylistProblem,
  createPlaylist,
  addProblem,
  deletePlaylist,
  deleteProblemFromPlaylist,
};
