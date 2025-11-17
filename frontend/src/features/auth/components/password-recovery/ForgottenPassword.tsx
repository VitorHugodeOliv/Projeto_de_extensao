import React, { useState } from "react";
import { toast } from "react-toastify";
import api from "@lib/api/api-axios";
import "../../styles/forgotten-password.css";

const ForgottenPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async () => {
    if (!email) {
      toast.warning("Digite seu e-mail para recuperar a senha.");
      return;
    }

    setEnviando(true);
    try {
      const res = await api.post("/forgot-password", { email });
      toast.success(res.data.message || "E-mail de recuperação enviado! 📬");
    } catch (err: any) {
      const msg = err.response?.data?.message || "Erro ao enviar e-mail de recuperação.";
      toast.error(msg);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="forgot-container">
      <div className="forgot-card">
        <h2>🔑 Recuperar Senha</h2>
        <p>
          Informe o e-mail cadastrado no sistema.  
          Você receberá um link para redefinir sua senha.
        </p>

        <input
          type="email"
          placeholder="Digite seu e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button onClick={handleSubmit} disabled={enviando}>
          {enviando ? "Enviando..." : "Enviar link de recuperação"}
        </button>
      </div>
    </div>
  );
};

export default ForgottenPassword;
