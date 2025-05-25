import config from "../config/config.js";
import { db } from "../db/db.js";
import { ApiError, asyncHandler } from "../utils/index.js";
import jwt from "jsonwebtoken";

const verifyJwt = asyncHandler(async (req, _, next) => {
  const token =
    req?.cookies?.short_token ?? req?.headers["authorization"]?.split(" ")[1];

  if (!token) {
    throw new ApiError(401, "unauthorised access");
  }

  const decodeToken = jwt.verify(token, config.access_token_key);

  if (!decodeToken) {
    throw new ApiError(401, "unauthorised access");
  }

  const user = await db.user.findUnique({
    where: { id: decodeToken.id },
    omit: {
      name: true,
      username: true,
      password: true,
      validateToken: true,
      resetToken: true,
      resetTokenExpire: true,
      refreshToken: true,
    },
  });

  req.user = user;
  next();
});

export default verifyJwt;
