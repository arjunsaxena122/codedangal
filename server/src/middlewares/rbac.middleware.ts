import { NextFunction, Response } from "express";
import { ApiError } from "../utils/api-error";
import { IRequestUser } from "../helper/auth.helper";
import prisma from "../db/db";

const roleBasedAccessControl =
  (roles: string[]) =>
  async (req: IRequestUser, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        throw new ApiError(401, "Unauthorised access");
      }

      const id = req.user?.id;

      const user = await prisma.user.findUnique({
        where: { id },
        select: { role: true },
      });

      if (!user) {
        throw new ApiError(404, "User not found");
      }

      if (!roles.includes(user?.role)) {
        throw new ApiError(
          403,
          `ERROR : ACCESS DENIED, Only access by ${user?.role}`,
        );
      }

      next();
    } catch (error) {
      next(new ApiError(403, "ERROR: Permission Denied!"));
    }
  };

export default roleBasedAccessControl;
