// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const user = JSON.parse(localStorage.getItem("user")); // or use context if available

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
