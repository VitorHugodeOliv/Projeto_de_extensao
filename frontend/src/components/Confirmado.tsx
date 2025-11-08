import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../components/css/cssAdminPanel.css";

const Confirmado: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const access = params.get("access");
    const refresh = params.get("refresh");

    if (access && refresh) {
      localStorage.setItem("token", access);
      localStorage.setItem("refresh_token", refresh);

      setTimeout(() => navigate("/dashboard"), 2000);
    } else {
      navigate("/login");
    }
  }, [location, navigate]);

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
