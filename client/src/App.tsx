import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import Error from "./components/error/Error";
import Layout from "./layout/Layout";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import ProtectedRoute from "./helper/ProtectedRoute";
import { authStore } from "./store/auth.store";
import { useEffect } from "react";
import { LuLoaderCircle } from "react-icons/lu";

function App() {
  const { isCheckingAuth, checkAuth, authUser } = authStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth && !authUser) {
    return <LuLoaderCircle />;
  }

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<Layout />} errorElement={<Error />}>
        <Route index element={<ProtectedRoute children={<Home />} />} />
        <Route path="/signup" element={<Register />} />
        <Route path="/login" element={<Login />} />
      </Route>
    )
  );
  return <RouterProvider router={router}></RouterProvider>;
}

export default App;
