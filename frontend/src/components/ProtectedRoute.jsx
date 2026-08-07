import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const loggedIn = localStorage.getItem("isLoggedIn") === "true";

  if (!loggedIn) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
