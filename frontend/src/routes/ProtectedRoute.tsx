import React from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  id: number;
  nome: string;
  tipo_usuario: string;
  exp: number;
}

interface ProtectedRouteProps {
  children: React.ReactNode;
  requerAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requerAdmin = false }) => {
  const token = localStorage.getItem("token");

  if (!token) return <Navigate to="/login" replace />;

  try {
    const decoded: DecodedToken = jwtDecode(token);
    const agora = Date.now() / 1000;

    if (decoded.exp < agora) {
      localStorage.removeItem("token");
      return <Navigate to="/login" replace />;
    }

    if (requerAdmin && decoded.tipo_usuario !== "admin") {
      return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
  } catch {
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
