import { db } from "../db/db.js";
import { ApiError, asyncHandler } from "../utils/index.js";

const verifyAdmin = asyncHandler(async (req, res, next) => {
  const { id } = req?.user;

  const user = await db.user.findUnique({
    where: { id },
  });

  if (!user && user.role !== "ADMIN") {
    throw new ApiError(403, "Access denied by Admin");
  }

  console.log("check Admin", user);

  next();
});

export default verifyAdmin;
