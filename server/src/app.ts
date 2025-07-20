import express, { Application } from "express";
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


// Import Routers
import healthRouter from "./routes/health.route"
import authRouter from "./routes/auth.route"

app.use("/api/v1",healthRouter)
app.use("/api/v1/auth",authRouter)



// Custom Error Middleware
app.use(customErrorHandler);

export default app;
