// components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../fakeAuth";

export default function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
