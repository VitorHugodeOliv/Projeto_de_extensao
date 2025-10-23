import React, { useState } from "react";
import axios from "axios";
import api from "../apis/apiAxios"

interface Props {
  setToken: (token: string | null) => void;
}

const Register: React.FC<Props> = ({ setToken }) => {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [endereco, setEndereco] = useState("");
  const [idade, setIdade] = useState<number | "">("")
  const [apelido, setApelido] = useState("");
  const [areaArtistica, setAreaArtistica] = useState("");
  const [mensagem, setMensagem] = useState("");

  const handleRegister = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!nome || !email || !senha) {
    setMensagem("Preencha todos os campos obrigatórios (nome, email e senha).");
    return;
    }

    if (!emailRegex.test(email)) {
    setMensagem("Digite um email válido!");
    return;
    }

    if (idade && idade < 0) {
    setMensagem("A idade não pode ser negativa!");
    return;
    }

    try {
      const res = await api.post("http://localhost:5000/register", {
        nome,
        email,
        senha,
        endereco,
        idade: idade === '' ? null : idade,
        apelido,
        area_artistica: areaArtistica
      });

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

  return (
    <div style={{ maxWidth: "400px", margin: "auto" }}>
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
      <input
        type="password"
        placeholder="Senha"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
      />

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
        onChange={(e) => setIdade(e.target.value === "" ? "" : Number(e.target.value))}
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
      <p>{mensagem}</p>
    </div>
  );
};

export default Register;
