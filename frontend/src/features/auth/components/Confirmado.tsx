import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@lib/store/auth-store";
import "../styles/confirmado.css";

const Confirmado: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setTokens } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const access = params.get("access");
    const refresh = params.get("refresh");

    if (access && refresh) {
      setTokens({ accessToken: access, refreshToken: refresh });

      setTimeout(() => navigate("/dashboard"), 2000);
    } else {
      navigate("/login");
    }
  }, [location, navigate, setTokens]);

  return (
    <div className="confirmado-container">
      <div className="confirmado-card">
        <h2>🎉 Conta ativada com sucesso!</h2>
        <p>Você será redirecionado ao seu painel em instantes...</p>
      </div>
    </div>
  );
};

export default Confirmado;
