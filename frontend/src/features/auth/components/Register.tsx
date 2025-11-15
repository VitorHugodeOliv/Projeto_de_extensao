import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import { Eye, EyeOff } from "lucide-react";
import api from "@lib/api/api-axios";
import { useAuth } from "@lib/store/auth-store";
import "../styles/register.css";

const Register: React.FC = () => {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [endereco, setEndereco] = useState("");
  const [idade, setIdade] = useState<number | "">("");
  const [apelido, setApelido] = useState("");
  const [areaArtistica, setAreaArtistica] = useState("");
  const navigate = useNavigate();
  const { setTokens } = useAuth();

  const handleRegister = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!nome || !email || !senha || !confirmarSenha) {
      toast.warning("⚠️ Preencha todos os campos obrigatórios (nome, email e senha).");
      return;
    }

    if (!emailRegex.test(email)) {
      toast.warning("📧 Digite um email válido!");
      return;
    }

    if (senha !== confirmarSenha) {
      toast.error("🔑 As senhas não coincidem!");
      return;
    }

    if (idade && idade < 0) {
      toast.warning("🚫 A idade não pode ser negativa!");
      return;
    }

    try {
      const res = await api.post("/register", {
        nome,
        email,
        senha,
        endereco,
        idade: idade === "" ? null : idade,
        apelido,
        area_artistica: areaArtistica,
      });

      toast.success("🎉 Cadastro realizado com sucesso!");
      localStorage.setItem("email_registro", email);

      const accessToken = res.data.access_token;
      const refreshToken = res.data.refresh_token;

      if (accessToken) {
        setTokens({ accessToken, refreshToken });
      }

      if (res.status === 201) {
        navigate("/registro-confirmado");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response) {
        const msg = err.response.data.message || "Erro ao registrar usuário.";
        toast.error(`❌ ${msg}`);
      } else {
        toast.error("😢 Erro de conexão com o servidor.");
      }
    }
  };

  return (
    <div className="register-container">
      <h2>Cadastro</h2>

      <input
        type="text"
        placeholder="Nome"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <div className="input-group">
        <input
          type={mostrarSenha ? "text" : "password"}
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />
        <span className="eye-icon" onClick={() => setMostrarSenha(!mostrarSenha)}>
          {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
        </span>
      </div>

      <div className="input-group">
        <input
          type={mostrarConfirmar ? "text" : "password"}
          placeholder="Confirmar Senha"
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

      <input
        type="text"
        placeholder="Endereço"
        value={endereco}
        onChange={(e) => setEndereco(e.target.value)}
      />
      <input
        type="number"
        placeholder="Idade"
        value={idade}
        onChange={(e) =>
          setIdade(e.target.value === "" ? "" : Number(e.target.value))
        }
      />
      <input
        type="text"
        placeholder="Apelido"
        value={apelido}
        onChange={(e) => setApelido(e.target.value)}
      />
      <input
        type="text"
        placeholder="Área Artística"
        value={areaArtistica}
        onChange={(e) => setAreaArtistica(e.target.value)}
      />

      <button onClick={handleRegister}>Cadastrar</button>
    </div>
  );
};

export default Register;
