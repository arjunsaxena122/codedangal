import dotenv from "dotenv";

dotenv.config({
  path: "./.env",
});

const config = {
  port: process.env.PORT ? Number(process.env.PORT) : 3000,
  node_env: process.env.NODE_ENV,
  access_token_key: process.env.ACCESS_TOKEN_KEY,
  access_token_expires: process.env.ACCESS_TOKEN_EXPIRES,
  refresh_token_key: process.env.REFRESH_TOKEN_KEY,
  refresh_token_expires: process.env.REFRESH_TOKEN_EXPIRES,
  judge0_uri : process.env.JUDGE0_URI
};

export default config;
