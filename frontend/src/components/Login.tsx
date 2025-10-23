import React, { useState } from "react";
import axios from "axios";
import api from "../apis/apiAxios"
import { useNavigate } from "react-router";

interface Props {
  setToken: (token: string | null) => void;
}

const Login: React.FC<Props> = ({ setToken }) => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mensagem, setMensagem] = useState("");
  
  const navigate = useNavigate()

  const handleNavigate = () => {
    navigate("/dashboard")
  }

  const loginResponse = async () => {
    try {
      const res = await api.post("http://localhost:5000/login", { email, senha });
      setMensagem(res.data.message);

      const accessToken = res.data.access_token;
      const refreshToken = res.data.refresh_token;
      
      if (accessToken) {
        localStorage.setItem("token", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        setToken(accessToken);
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response) {
        setMensagem(err.response.data.message);
      } else {
        setMensagem("Erro desconhecido");
      }
    }
  };

  const handleLogin = async () => {
    await loginResponse()
    handleNavigate()
  }

  const handleRegister = () => {
    navigate("/registro")
  }
  
  return (
    <div>
      <h2>Login</h2>
      <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Senha" value={senha} onChange={e => setSenha(e.target.value)} />
      <button onClick={handleLogin}>Entrar</button>
      <text onClick={handleRegister}>Ainda não tem uma conta? clique aqui.</text>
      <p>{mensagem}</p>
    </div>
  );
};

export default Login;
