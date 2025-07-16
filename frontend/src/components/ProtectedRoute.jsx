import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  let accessToken = localStorage.getItem("access_token");
  if (!accessToken) {
    accessToken = sessionStorage.getItem("access_token");
  }
  // If you want to double-check user object, you can add extra check here
  if (!accessToken) {
    return <Navigate to="/signin" replace />;
  }
  return children;
};

export default ProtectedRoute;
