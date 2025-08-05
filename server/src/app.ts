import express, { Application, Response, Request } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { customErrorHandler } from "./middlewares/error.middleware";

const app: Application = express();

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

const options = {
  origin: ["*", "http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credential: true,
};
app.use(cors(options));

// app.use("/about", async (req: Request, res: Response) => {
//   let response;
//   let data;
//   try {
//     const url = "https://judge0-ce.p.sulu.sh/about";

//     response = await axios.get(url, {
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${env.SULU_JUDGE0_API_KEY}`,
//         Accept: "application/json",
//       },
//     });

//     data = response?.data;
//   } catch (error) {
//     console.log(error);
//   }

//   return res.status(200).json({ message: data });
// });

// Import Routers
import healthRouter from "./routes/health.route";
import authRouter from "./routes/auth.route";
import problemRouter from "./routes/problem.route";
import executeRouter from "./routes/execute.route";
import submissionRouter from "./routes/submission.route";
import playlistRouter from "./routes/playlist.route";

app.use("/api/v1/health", healthRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/problem", problemRouter);
app.use("/api/v1/execute", executeRouter);
app.use("/api/v1/submission", submissionRouter);
app.use("/api/v1/playlist", playlistRouter);

// Custom Error Middleware
app.use(customErrorHandler);

export default app;
