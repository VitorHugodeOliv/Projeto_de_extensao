import React, { useEffect, useState } from "react";
import api from "../apis/apiAxios"
import "./css/cssAdminPanel.css";

interface Historia {
  id: number;
  titulo: string;
  autor_artista: string;
  status: string;
  conteudo: string;
  categoria_nome: string;
  nome_usuario: string;
  data_criacao: string;
}

interface Props {
  token: string;
  setToken: (token: string | null) => void;
}

const AdminPanel: React.FC<Props> = ({ token, setToken }) => {
  const [historias, setHistorias] = useState<Historia[]>([]);
  const [mensagem, setMensagem] = useState("");

  const carregarHistorias = async () => {
    try {
      const res = await api.get("http://localhost:5000/admin/solicitacoes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistorias(res.data.historias || []);
      setMensagem("");
    } catch (err) {
      console.error(err);
      setMensagem("Erro ao carregar histórias.");
    }
  };

  useEffect(() => {
    carregarHistorias();
  }, []);

  const aprovarHistoria = async (id: number) => {
    try {
      await api.patch(
        "http://localhost:5000/admin/solicitacoes",
        { historia_id: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMensagem(`História ${id} aprovada com sucesso!`);
      carregarHistorias();
    } catch (err) {
      console.error(err);
      setMensagem("Erro ao aprovar a história.");
    }
  };

  const rejeitarHistoria = async (id: number) => {
    try {
      await api.delete("http://localhost:5000/admin/solicitacoes", {
        headers: { Authorization: `Bearer ${token}` },
        data: { historia_id: id },
      });
      setMensagem(`História ${id} rejeitada e removida com sucesso!`);
      carregarHistorias();
    } catch (err) {
      console.error(err);
      setMensagem("Erro ao rejeitar a história.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return (
    <div className="admin-panel">
      <h2>Painel do Administrador</h2>

      {mensagem && <div className="admin-message">{mensagem}</div>}

      <button className="logout-btn" onClick={handleLogout}>
        Sair
      </button>

      <div className="admin-lista">
        {historias.length === 0 ? (
          <p className="sem-historias">Nenhuma história cadastrada.</p>
        ) : (
          historias.map((h) => (
            <div key={h.id} className="historia-card">
              <h3>{h.titulo}</h3>
              <p>
                <strong>Autor:</strong> {h.autor_artista || "Não informado"}
              </p>
              <p>
                <strong>Categoria:</strong> {h.categoria_nome}
              </p>
              <p>
                <strong>Enviado por:</strong> {h.nome_usuario}
              </p>
              <p>
                <strong>Data:</strong>{" "}
                {new Date(h.data_criacao).toLocaleString("pt-BR")}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={`status ${
                    h.status === "Aprovada"
                      ? "status-aprovada"
                      : h.status === "Em análise"
                      ? "status-analise"
                      : "status-outro"
                  }`}
                >
                  {h.status}
                </span>
              </p>
              {h.conteudo && (
                <details>
                  <summary>Ver conteúdo</summary>
                  <p className="conteudo">{h.conteudo}</p>
                </details>
              )}

              <div className="botoes-acoes">
                {h.status === "Em análise" ? (
                  <>
                    <button
                      className="btn-aprovar"
                      onClick={() => aprovarHistoria(h.id)}
                    >
                      ✅ Aprovar
                    </button>
                    <button
                      className="btn-rejeitar"
                      onClick={() => rejeitarHistoria(h.id)}
                    >
                      ❌ Rejeitar
                    </button>
                  </>
                ) : (
                  <p className="texto-status-final">
                    {h.status === "Aprovada"
                      ? "História já aprovada."
                      : "História removida."}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
