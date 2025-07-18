import app from "./app";
import { env } from "./config/config";

const port = Number(env.PORT ?? 3000);

app.listen(port, () => {
  console.log(`server running at port ${port}`);
});
