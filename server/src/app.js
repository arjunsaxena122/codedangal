import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// Middleware
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

let corsOptions = {
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true,
};
app.use(cors(corsOptions));

// Routes
import userRouter from "./routes/user.routes.js";
import userProblems from "./routes/problems.routes.js";
import execCodeRouter from "./routes/execCode.routes.js";
import submissionRouter from "./routes/submission.routes.js";
import playlistRouter from "./routes/playlist.routes.js";

app.use("/api/v1/user", userRouter);
app.use("/api/v1/problems", userProblems);
app.use("/api/v1/exce-code", execCodeRouter);
app.use("/api/v1/submission", submissionRouter);
app.use("/api/v1/playist", playlistRouter);

export default app;
