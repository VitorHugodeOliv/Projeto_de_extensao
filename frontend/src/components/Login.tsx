import React, { useState } from "react";
import axios from "axios";
import api from "../apis/apiAxios"
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import "./css/cssLogin.css"

interface Props {
  setToken: (token: string | null) => void;
}

const Login: React.FC<Props> = ({ setToken }) => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  
  const navigate = useNavigate()

  const handleNavigate = () => {
    navigate("/dashboard")
  }

  const loginResponse = async () => {
    try {
      const res = await api.post("http://localhost:5000/login", { email, senha });

      const accessToken = res.data.access_token;
      const refreshToken = res.data.refresh_token;
      
      if (accessToken) {
        localStorage.setItem("token", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        setToken(accessToken);
        toast.success("Login realizado com sucesso! 🎉");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response) {
        const status = err.response.status;
        const msgBackend = err.response.data.message;
        if (status === 401 || status === 403) {
          toast.error("Email ou senha incorretos. Tente novamente ⚠️");
        } else if (msgBackend) {
          toast.error(msgBackend);
        } else {
          toast.error("Erro inesperado. Tente novamente mais tarde 😕");
        }
      } else {
        toast.error("Erro de conexão com o servidor 😢");
      }
    }
  };

  const handleLogin = async () => {
    if (!email || !senha) {
      toast.warning("Preencha todos os campos antes de entrar!");
      return;
    }
    await loginResponse()
    handleNavigate()
  }

  const handleRegister = () => {
    navigate("/registro")
  }
  
 return (
    <div className="login-container">
      <h1>Bem-vindo ao Sistema Cultural</h1>
      <input 
        type="email" 
        placeholder="Email" 
        value={email} 
        onChange={e => setEmail(e.target.value)} 
      />
      <input 
        type="password" 
        placeholder="Senha" 
        value={senha} 
        onChange={e => setSenha(e.target.value)} 
      />

      <button onClick={handleLogin}>Entrar</button>

      <p className="register-link" onClick={handleRegister}>
        Ainda não tem uma conta? <span>clique aqui</span>.
      </p>
    </div>
  );
};

export default Login;
