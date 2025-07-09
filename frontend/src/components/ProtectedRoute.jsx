import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const accessToken = localStorage.getItem("access_token");
  // If you want to double-check user object, you can add extra check here
  if (!accessToken) {
    return <Navigate to="/signin" replace />;
  }
  return children;
};

export default ProtectedRoute;
