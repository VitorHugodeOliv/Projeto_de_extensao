import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "@lib/api/api-axios";
import "../styles/registro-confirmacao.css";

const RegistroConfirmado: React.FC = () => {
  const [email, setEmail] = useState("");

  useEffect(() => {
    const emailSalvo = localStorage.getItem("email_registro");
    if (emailSalvo) {
      setEmail(emailSalvo);
    }
  }, []);

  const handleResend = async () => {
    if (!email) {
      toast.warn("E-mail não encontrado. Refaça o cadastro, por favor.");
      return;
    }

    try {
      const res = await api.post("/resend-confirmation", { email });
      toast.success(res.data.message || "E-mail de confirmação reenviado!");
    } catch (err: any) {
      const msg = err.response?.data?.message || "Erro ao reenviar e-mail.";
      toast.error(msg);
    }
  };

  return (
    <div className="confirmacao-container">
      <div className="confirmacao-card">
        <h2>🎉 Cadastro realizado com sucesso!</h2>
        <p>
          Verifique seu e-mail e ative sua conta antes de fazer login.
          <br />
          Assim que confirmar, você será redirecionado automaticamente ao painel do sistema.
        </p>

        <div className="resend-confirmation">
          <p>Não recebeu o e-mail de confirmação?</p>
          <button onClick={handleResend}>Reenviar confirmação</button>
        </div>
      </div>
    </div>
  );
};

export default RegistroConfirmado;
