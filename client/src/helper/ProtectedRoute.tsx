import { Navigate } from "react-router-dom";

const ProtectedRoute = ({children}:any) => {
  let authUser = true;
  return authUser ? children : <Navigate to={"/"} />;
};

export default ProtectedRoute;
