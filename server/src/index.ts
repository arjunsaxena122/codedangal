import app from "./app";
import { env } from "./config/config";
import prisma from "./db/db";
import { ApiError } from "./utils/api-error";

const port = Number(env.PORT ?? 3000);

prisma
  .$connect()
  .then(() =>
    app.listen(port, () => {
      console.log(`server running at port ${port}`);
    }),
  )
  .catch((err) => {
    new ApiError(400, `ERROR: Database connection lost -> ${err} `);
    process.exit(1);
  });
