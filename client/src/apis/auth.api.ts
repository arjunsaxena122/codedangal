import api from "./index";

const register = async (data: { email: string; password: string }) =>
  api.post("/auth/register", data);

const userLogin = async (data: { email: string; password: string }) =>
  api.post("/auth/login", data);

const userLogout = async () => api.get("/auth/logout");

const authCheck = async () => api.get("/auth/check-auth");

export { register, userLogin, userLogout, authCheck };
