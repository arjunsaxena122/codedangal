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


app.use("/api/v1/health", healthRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/problem", problemRouter);

// Custom Error Middleware
app.use(customErrorHandler);

export default app;
