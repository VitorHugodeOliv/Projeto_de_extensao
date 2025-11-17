import React from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "@lib/store/auth-store";

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
  const { accessToken, user, logout } = useAuth();

  if (!accessToken) return <Navigate to="/login" replace />;

  try {
    const decoded: DecodedToken = jwtDecode(accessToken);
    const agora = Date.now() / 1000;

    if (decoded.exp < agora) {
      logout();
      return <Navigate to="/login" replace />;
    }

    const tipoUsuario = user?.tipo_usuario ?? decoded.tipo_usuario;

    if (requerAdmin && tipoUsuario !== "admin") {
      return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
  } catch {
    logout();
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
