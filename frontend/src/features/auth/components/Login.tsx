import React, { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { apiAuth } from "@lib/api/api";
import { useAuth } from "@lib/store/auth-store";
import styles from "../styles/login.module.css";

const LoginPage: React.FC = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const navigate = useNavigate();
  const { setTokens } = useAuth();

  const handleSubmitEmail = () => {
    if (!email.trim()) {
      toast.warning("Digite seu email.");
      return;
    }
    setStep(2);
  };

  const handleLogin = async () => {
    if (!senha.trim()) {
      toast.warning("Digite sua senha.");
      return;
    }

    try {
      const res = await apiAuth.login(email, senha);

      const accessToken = res.access_token;
      const refreshToken = res.refresh_token;

      if (accessToken) {
        setTokens({ accessToken, refreshToken });
        toast.success("Login realizado com sucesso! 🎉");
        navigate("/dashboard");
      }
    } catch (err: any) {
      if (err.response) {
        const status = err.response.status;
        const msgBackend = err.response.data.message;

        if (status === 401 || status === 403) {
          toast.error("Email ou senha incorretos.");
        } else if (msgBackend) {
          toast.error(msgBackend);
        } else {
          toast.error("Erro inesperado.");
        }
      } else {
        toast.error("Erro de conexão com o servidor.");
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.blurLayer}></div>

      <div className={styles.card}>
        <h2 className={styles.title}>Login</h2>

        <p className={styles.subtitle}>
          Ainda não tem uma conta?{" "}
          <span onClick={() => navigate("/registro")}>Registre-se</span>
        </p>

        {step === 1 && (
          <>
            <div className={styles.separator}>endereço de email</div>
            <input
              type="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button className={styles.button} onClick={handleSubmitEmail}>
              Continuar
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <button
              className={styles.backButton}
              onClick={() => setStep(1)}
              >
              &lt;
            </button>
            <div className={styles.separator}>senha</div>
            <input
              type="password"
              placeholder="Senha"
              className={styles.input}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />

            <button className={styles.button} onClick={handleLogin}>
              Entrar
            </button>

            <p
              className={styles.forgot}
              onClick={() => navigate("/esqueci-senha")}
            >
              Esqueceu sua senha?
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
