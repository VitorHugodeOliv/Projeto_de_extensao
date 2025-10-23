import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import api from "../apis/apiAxios"

interface Usuario {
  nome: string;
  email: string;
  tipo_usuario: string;
  endereco?: string;
  idade?: number;
  apelido?: string;
  area_artistica?: string;
  data_criacao?: string;
}

interface Props {
  token: string;
  setToken: (token: string | null) => void;
}

const Perfil: React.FC<Props> = ({ token, setToken }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [mensagem, setMensagem] = useState("");
  const [editando, setEditando] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const res = await api.get("http://localhost:5000/perfil", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsuario(res.data);
      } catch (err: unknown) {
        console.error(err);
        setMensagem("Erro ao carregar perfil.");
      }
    };
    fetchPerfil();
  }, [token]);

  const handleSalvar = async () => {
    try {
      const res = await api.put(
        "http://localhost:5000/perfil",
        usuario,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMensagem(res.data.message);
      setEditando(false);
    } catch (err: unknown) {
      console.error(err);
      setMensagem("Erro ao salvar alterações.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    navigate("/login");
  };

  if (!usuario) {
    return <p>Carregando...</p>;
  }

  return (
    <div>
      <h2>Perfil do Usuário</h2>

      <div>
        <label>Nome:</label>
        <input
          type="text"
          value={usuario.nome}
          disabled={!editando}
          onChange={(e) => setUsuario({ ...usuario, nome: e.target.value })}
        />

        <label>Email:</label>
        <input type="email" value={usuario.email} disabled />

        <label>Apelido:</label>
        <input
          type="text"
          value={usuario.apelido || ""}
          disabled={!editando}
          onChange={(e) => setUsuario({ ...usuario, apelido: e.target.value })}
        />

        <label>Endereço:</label>
        <input
          type="text"
          value={usuario.endereco || ""}
          disabled={!editando}
          onChange={(e) => setUsuario({ ...usuario, endereco: e.target.value })}
        />

        <label>Idade:</label>
        <input
          type="number"
          value={usuario.idade || ""}
          disabled={!editando}
          onChange={(e) =>
            setUsuario({ ...usuario, idade: parseInt(e.target.value) })
          }
        />

        <label>Área Artística:</label>
        <input
          type="text"
          value={usuario.area_artistica || ""}
          disabled={!editando}
          onChange={(e) =>
            setUsuario({ ...usuario, area_artistica: e.target.value })
          }
        />

        <div>
          {!editando ? (
            <button onClick={() => setEditando(true)}>Editar</button>
          ) : (
            <button onClick={handleSalvar}>Salvar</button>
          )}
          <button onClick={handleLogout}>Sair</button>
        </div>

        {mensagem && <p>{mensagem}</p>}
      </div>
    </div>
  );
};

export default Perfil;
