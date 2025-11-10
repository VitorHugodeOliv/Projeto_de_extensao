import React, { useEffect, useState } from "react";
import api from "../../apis/apiAxios";
import { toast } from "react-toastify";
import "../css/cssPerfil/cssPerfilUsuario.css";
import { useAuth } from "../../store/authStore";

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

const PerfilUsuario: React.FC = () => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [editando, setEditando] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const { accessToken } = useAuth();

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const res = await api.get("/perfil");
        setUsuario(res.data);
      } catch (err) {
        console.error("Erro ao carregar perfil:", err);
        toast.error("Erro ao carregar informações do perfil.");
      } finally {
        setCarregando(false);
      }
    };
    if (accessToken) {
      fetchPerfil();
    }
  }, [accessToken]);

  const handleSalvar = async () => {
    try {
      const res = await api.put("/perfil", usuario);
      toast.success(res.data.message || "Alterações salvas com sucesso! 🎉");
      setEditando(false);
    } catch (err) {
      console.error("Erro ao salvar perfil:", err);
      toast.error("Erro ao salvar alterações 😕");
    }
  };

  if (carregando) return <p>Carregando perfil...</p>;
  if (!usuario) return <p>Não foi possível carregar o perfil.</p>;

  return (
    <div className="perfil-dashboard">
      <h2>👤 Meu Perfil</h2>

      {!editando && (
        <div className="perfil-visualizacao">
          <p><strong>Nome:</strong> {usuario.nome}</p>
          <p><strong>Email:</strong> {usuario.email}</p>
          <p><strong>Apelido:</strong> {usuario.apelido || "—"}</p>
          <p><strong>Endereço:</strong> {usuario.endereco || "—"}</p>
          <p><strong>Idade:</strong> {usuario.idade || "—"}</p>
          <p><strong>Área Artística:</strong> {usuario.area_artistica || "—"}</p>
          {usuario.data_criacao && (
            <p>
              <strong>Conta criada em:</strong>{" "}
              {new Date(usuario.data_criacao).toLocaleDateString("pt-BR")}
            </p>
          )}

          <button className="btn-alterar" onClick={() => setEditando(true)}>
            ✏️ Alterar informações
          </button>
        </div>
      )}

      {editando && (
        <div className="perfil-edicao">
          <label>Nome:</label>
          <input
            type="text"
            value={usuario.nome}
            onChange={(e) => setUsuario({ ...usuario, nome: e.target.value })}
          />

          <label>Apelido:</label>
          <input
            type="text"
            value={usuario.apelido || ""}
            onChange={(e) => setUsuario({ ...usuario, apelido: e.target.value })}
          />

          <label>Endereço:</label>
          <input
            type="text"
            value={usuario.endereco || ""}
            onChange={(e) => setUsuario({ ...usuario, endereco: e.target.value })}
          />

          <label>Idade:</label>
          <input
            type="number"
            value={usuario.idade || ""}
            onChange={(e) =>
              setUsuario({
                ...usuario,
                idade: e.target.value ? parseInt(e.target.value) : undefined,
              })
            }
          />

          <label>Área Artística:</label>
          <input
            type="text"
            value={usuario.area_artistica || ""}
            onChange={(e) =>
              setUsuario({ ...usuario, area_artistica: e.target.value })
            }
          />

          <div className="botoes-edicao">
            <button className="btn-salvar" onClick={handleSalvar}>
              💾 Salvar
            </button>
            <button className="btn-cancelar" onClick={() => setEditando(false)}>
              ❌ Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerfilUsuario;
