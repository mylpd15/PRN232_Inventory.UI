import { Navigate, Outlet } from "react-router-dom";
import { AuthService } from "../services/AuthService";

export default function ProtectedRoute() {
  const isLogin = AuthService.isLogin();
  return isLogin ? <Outlet /> : <Navigate to="/auth/login" replace />;
} 