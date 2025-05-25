import app from "./app.js";
import config from "./config/config.js";
import { db } from "./db/db.js";

db.$connect()
  .then(() => {
    app.listen(config.port, () => {
      console.log(`Server running at port ${config.port}`);
    });
  })
  .catch((err) => {
    console.log(`ERROR: Postgres connection failed ${err}`);
    process.exit(1);
  });
