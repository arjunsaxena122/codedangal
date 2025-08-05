import { create } from "zustand";
import { authCheck, register, userLogin, userLogout } from "../apis/auth.api";

interface IAuthStore {
  authUser: boolean | null;
  isSignup: boolean;
  isLogin: boolean;
  isCheckingAuth: boolean;
  checkAuth: () => Promise<void>;
  signup: (data: { email: string; password: string }) => Promise<void>;
  login: (data: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
}

export const authStore = create<IAuthStore>((set) => ({
  authUser: null,
  isSignup: false,
  isLogin: false,
  isCheckingAuth: false,

  checkAuth: async (): Promise<any> => {
    set({ isCheckingAuth: true });
    try {
      const res = await authCheck();
      console.log(`check auth response ${res.data}`);
      set({ authUser: res.data.isAuth });
    } catch (error) {
      set({ authUser: null });
      console.log(error);
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data: { email: string; password: string }) => {
    set({ isSignup: true });
    try {
      const res = await register(data);
      console.log(`response from signing up ${res.data}`);
    } catch (error) {
      console.log(`ERROR: while signing up ${error}`);
    } finally {
      set({ isSignup: false });
    }
  },

  login: async (data: { email: string; password: string }) => {
    set({ isLogin: true });
    try {
      const res = await userLogin(data);
      console.log(`response from login ${res.data}`);
    } catch (error) {
      console.log(`ERROR: while login ${error}`);
    } finally {
      set({ isLogin: false });
    }
  },

  logout: async () => {
    try {
      const res = await userLogout();
      console.log(`response from logout ${res.data}`);
    } catch (error) {
      console.log(`ERROR: while logout ${error}`);
    }
  },
}));
