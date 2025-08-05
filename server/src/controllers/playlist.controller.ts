import { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import { ApiError } from "../utils/api-error";
import prisma from "../db/db";
import { IRequestUser } from "../helper/auth.helper";
import { ApiResponse } from "../utils/api-response";

interface IPlaylist {
  name: string;
  description: string;
  userId: string;
}

interface IProblem {
  problemId: string;
}

const getAllPlaylist = asyncHandler(
  async (req: IRequestUser, res: Response) => {
    if (!req.user || !req.user.id) {
      throw new ApiError(401, "Requested userId not found, Unauthorised user");
    }

    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError(404, "user not found");
    }

    const playlist = await prisma.playlist.findMany({
      where: {
        userId,
      },
    });

    if (!playlist) {
      throw new ApiError(404, "Playlist not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, "Playlist fetched successfully", playlist));
  },
);

const getPlaylistById = asyncHandler(
  async (req: IRequestUser, res: Response) => {
    if (!req.user || !req.user.id) {
      throw new ApiError(401, "Requested userId not found, Unauthorised user");
    }

    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError(404, "user not found");
    }

    const { pid } = req.params;

    if (!pid) {
      throw new ApiError(404, "playlistId not found");
    }

    const playlist = await prisma.playlist.findUnique({
      where: {
        id: pid,
        userId,
      },
    });

    if (!playlist) {
      throw new ApiError(404, "playlist not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, `${playlist?.name} here`, playlist));
  },
);

const createPlaylist = asyncHandler(
  async (req: IRequestUser, res: Response) => {
    if (!req.user || !req.user.id) {
      throw new ApiError(401, "Requested userId not found, Unauthorised user");
    }

    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError(404, "user not found");
    }

    const { name, description }: IPlaylist = req.body;

    if (!name || !description) {
      throw new ApiError(400, "Please fill all the required fields");
    }

    const existedPlaylist = await prisma.playlist.findUnique({
      where: {
        name,
      },
    });

    if (existedPlaylist) {
      throw new ApiError(409, "Playlist already exist");
    }

    const playlist = await prisma.playlist.create({
      data: {
        name,
        description,
        userId,
      },
    });

    const isCheckCreatedPlaylist = await prisma.playlist.findUnique({
      where: {
        id: playlist.id,
      },
    });

    if (!isCheckCreatedPlaylist) {
      throw new ApiError(500, "Internal server error, Please try again!");
    }

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          "Playlist created successfully",
          isCheckCreatedPlaylist,
        ),
      );
  },
);

const addProblemInPlaylist = asyncHandler(
  async (req: IRequestUser, res: Response) => {
    if (!req.user || !req.user.id) {
      throw new ApiError(401, "Requested userId not found, Unauthorised user");
    }

    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError(404, "user not found");
    }

    const { pid } = req.params;
    const { problemId }: IProblem = req.body;

    if (!pid) {
      throw new ApiError(404, "playlistId not found");
    }

    if (!problemId) {
      throw new ApiError(400, "no problemId available");
    }

    const playlist = await prisma.playlist.findUnique({
      where: {
        id: pid,
        userId,
      },
    });

    if (!playlist) {
      throw new ApiError(404, "playlist not found");
    }

    const alreadyAddProblem = await prisma.problemInPlaylist.findUnique({
      where: {
        playlistId: pid,
        problemId,
      },
    });

    if (alreadyAddProblem) {
      throw new ApiError(409, "problem already exist in playlist");
    }

    const addProblem = await prisma.problemInPlaylist.create({
      data: {
        playlistId: pid,
        problemId,
      },
    });

    const isCheckAddProblem = await prisma.problemInPlaylist.findUnique({
      where: {
        id: addProblem?.id,
      },
    });

    if (!isCheckAddProblem) {
      throw new ApiError(500, "Internal server error, Please try again!");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, `problem add successfully`, isCheckAddProblem),
      );
  },
);

const deletePlaylist = asyncHandler(
  async (req: IRequestUser, res: Response) => {
    if (!req.user || !req.user.id) {
      throw new ApiError(401, "Requested userId not found, Unauthorised user");
    }

    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError(404, "user not found");
    }

    const { pid } = req.params;

    if (!pid) {
      throw new ApiError(404, "playlistId not found");
    }

    const playlist = await prisma.playlist.findUnique({
      where: { id: pid },
    });

    if (!playlist) {
      throw new ApiError(404, "playlist not found");
    }

    const removePlaylist = await prisma.playlist.delete({
      where: { id: pid },
    });

    if (!removePlaylist) {
      throw new ApiError(
        500,
        "Internal server error, Please try again to remove playlist!",
      );
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, "Playlist removed successfullly", removePlaylist),
      );
  },
);

const removeProblemByIdFromPlaylist = asyncHandler(
  async (req: IRequestUser, res: Response) => {
    if (!req.user || !req.user.id) {
      throw new ApiError(401, "Requested userId not found, Unauthorised user");
    }

    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError(404, "user not found");
    }

    const { pid, problemId } = req.params;

    if (!pid || !problemId) {
      throw new ApiError(404, "playlistId not found");
    }

    const playlist = await prisma.playlist.findUnique({
      where: { id: pid },
    });

    if (!playlist) {
      throw new ApiError(404, "playlist not found");
    }

    const problemInPlaylist = await prisma.problemInPlaylist.findUnique({
      where: {
        playlistId_problemId: {
          playlistId: pid,
          problemId,
        },
      },
    });

    if (!problemInPlaylist) {
      throw new ApiError(404, "problem not found in playlist");
    }

    const removeProblemInPlaylist = await prisma.problemInPlaylist.delete({
      where: {
        playlistId_problemId: {
          playlistId: pid,
          problemId,
        },
      },
      include: {
        problem: true,
      },
    });

    if (!removeProblemInPlaylist) {
      throw new ApiError(
        500,
        `Internal server error, Please try again to remove problem from the ${playlist?.name}`,
      );
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          `${removeProblemInPlaylist?.problem?.title}`,
          removeProblemInPlaylist,
        ),
      );
  },
);

export {
  getAllPlaylist,
  getPlaylistById,
  createPlaylist,
  addProblemInPlaylist,
  deletePlaylist,
  removeProblemByIdFromPlaylist,
};
