import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";
import api from "@lib/api/api-axios";
import { useAuth } from "@lib/store/auth-store";
import "../../styles/password-reset.css";

const ResetarSenha: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();
  const { accessToken } = useAuth();

  useEffect(() => {
    if (accessToken) {
      navigate("/dashboard");
    }
  }, [accessToken, navigate]);

  const handleReset = async () => {
    if (!senha || !confirmarSenha) {
      toast.warning("Preencha todos os campos!");
      return;
    }

    if (senha !== confirmarSenha) {
      toast.error("As senhas não coincidem!");
      return;
    }

    setCarregando(true);
    try {
      const res = await api.post(`/reset-password/${token}`, { senha });
      toast.success(res.data.message || "Senha redefinida com sucesso! 🔒");

      setTimeout(() => navigate("/login"), 2500);
    } catch (err: any) {
      const msg = err.response?.data?.message || "Erro ao redefinir senha.";
      toast.error(msg);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="reset-container">
      <div className="reset-card">
        <h2>🔒 Redefinir Senha</h2>
        <p>Digite sua nova senha abaixo.</p>

        <div className="input-group">
          <input
            type={mostrarSenha ? "text" : "password"}
            placeholder="Nova senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
          <span
            className="eye-icon"
            onClick={() => setMostrarSenha(!mostrarSenha)}
          >
            {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
          </span>
        </div>

        <div className="input-group">
          <input
            type={mostrarConfirmar ? "text" : "password"}
            placeholder="Confirmar nova senha"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
          />
          <span
            className="eye-icon"
            onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
          >
            {mostrarConfirmar ? <EyeOff size={18} /> : <Eye size={18} />}
          </span>
        </div>

        <button onClick={handleReset} disabled={carregando}>
          {carregando ? "Salvando..." : "Salvar nova senha"}
        </button>
      </div>
    </div>
  );
};

export default ResetarSenha;
