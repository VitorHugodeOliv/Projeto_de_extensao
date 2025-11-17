import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/erro-confirmacao.css";

const ErroConfirmacao: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="erro-confirmacao-container">
      <div className="erro-confirmacao-card">
        <h2>⚠️ Link inválido ou expirado</h2>
        <p>
          O link de confirmação que você acessou não é mais válido.
          <br />
          Solicite um novo cadastro ou entre em contato com o suporte.
        </p>
        <button onClick={() => navigate("/login")}>Voltar ao Login</button>
      </div>
    </div>
  );
};

export default ErroConfirmacao;