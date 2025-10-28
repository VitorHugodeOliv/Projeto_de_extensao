import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../apis/apiAxios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./css/cssAdminCard.css";

interface Arquivo {
  id: number;
  nome: string;
  tipo: string;
  caminho: string;
  tamanho: number;
}

interface Historia {
  id: number;
  titulo: string;
  autor_artista: string;
  status: string;
  conteudo: string;
  categoria_nome: string;
  nome_usuario: string;
  data_criacao: string;
  arquivos: Arquivo[];
}

interface Props {
  token: string;
}

const AdminCard: React.FC<Props> = ({ token }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [historia, setHistoria] = useState<Historia | null>(null);
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState<"success" | "danger" | "">("");

  useEffect(() => {
    const carregarHistoria = async () => {
      try {
        const res = await api.get("http://localhost:5000/admin/solicitacoes", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const encontrada = res.data.historias.find(
          (h: Historia) => h.id === Number(id)
        );
        setHistoria(encontrada || null);
      } catch (err) {
        console.error(err);
        setTipoMensagem("danger");
        setMensagem("Erro ao carregar os detalhes da história.");
      }
    };

    carregarHistoria();
  }, [id, token]);

  const exibirMensagem = (texto: string, tipo: "success" | "danger") => {
    setMensagem(texto);
    setTipoMensagem(tipo);

    setTimeout(() => {
      setMensagem("");
      setTipoMensagem("");
    }, 3000);
  };

  const aprovarHistoria = async () => {
    try {
      await api.patch(
        "http://localhost:5000/admin/solicitacoes/aprovar",
        { historia_id: historia?.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      exibirMensagem("História aprovada com sucesso!", "success");
      setTimeout(() => navigate("/admin"), 1500);
    } catch (err) {
      console.error(err);
      exibirMensagem("Erro ao aprovar a história.", "danger");
    }
  };

  const rejeitarHistoria = async () => {
    try {
      await api.delete("http://localhost:5000/admin/solicitacoes/rejeitar", {
        headers: { Authorization: `Bearer ${token}` },
        data: { historia_id: historia?.id },
      });
      exibirMensagem("História rejeitada e removida com sucesso!", "success");
      setTimeout(() => navigate("/admin"), 1500);
    } catch (err) {
      console.error(err);
      exibirMensagem("Erro ao rejeitar a história.", "danger");
    }
  };

  if (!historia)
    return (
      <div className="admin-card-page">
        <p className="loading-text">Carregando história...</p>
      </div>
    );

  const imagens = historia.arquivos?.filter((a) =>
    ["png", "jpg", "jpeg", "gif"].includes(a.tipo.toLowerCase())
  );
  const videos = historia.arquivos?.filter((a) =>
    ["mp4"].includes(a.tipo.toLowerCase())
  );
  const audios = historia.arquivos?.filter((a) =>
    ["mp3", "wav"].includes(a.tipo.toLowerCase())
  );

  return (
    <div className="admin-card-page">
      <div className="admin-card-header">
        <h2>Detalhes da História</h2>
        <button className="btn-voltar" onClick={() => navigate("/admin")}>
          ⬅️ Voltar
        </button>
      </div>

      <div className="admin-card-detalhe">
        <h3>{historia.titulo}</h3>
        <p>
          <strong>Autor/Artista:</strong>{" "}
          {historia.autor_artista || "Não informado"}
        </p>
        <p>
          <strong>Categoria:</strong> {historia.categoria_nome}
        </p>
        <p>
          <strong>Proponente:</strong> {historia.nome_usuario}
        </p>
        <p>
          <strong>Data de Envio:</strong>{" "}
          {new Date(historia.data_criacao).toLocaleString("pt-BR")}
        </p>
        <span
          className={`status-badge ${historia.status
            .replace(" ", "-")
            .toLowerCase()}`}
        >
          {historia.status}
        </span>

        <div className="conteudo">
          <p>{historia.conteudo || "Nenhum conteúdo textual fornecido."}</p>
        </div>

        <div className="midia-container">
          {imagens.map((img) => (
            <div key={img.id} className="midia-item">
              <img
                src={`http://localhost:5000/${img.caminho}`}
                alt={img.nome}
              />
              <p>📷 {img.nome}</p>
            </div>
          ))}

          {videos.map((vid) => (
            <div key={vid.id} className="midia-item">
              <video controls>
                <source
                  src={`http://localhost:5000/${vid.caminho}`}
                  type="video/mp4"
                />
              </video>
              <p>🎥 {vid.nome}</p>
            </div>
          ))}

          {audios.map((aud) => (
            <div key={aud.id} className="midia-item">
              <audio controls>
                <source
                  src={`http://localhost:5000/${aud.caminho}`}
                  type="audio/mpeg"
                />
              </audio>
              <p>🎧 {aud.nome}</p>
            </div>
          ))}
        </div>

        <div className="botoes-acoes">
          {historia.status === "Em análise" && (
            <>
              <button className="btn-aprovar" onClick={aprovarHistoria}>
                ✅ Aprovar
              </button>
              <button className="btn-rejeitar" onClick={rejeitarHistoria}>
                ❌ Rejeitar
              </button>
            </>
          )}
        </div>
      </div>

      {mensagem && (
        <div
          className={`alert alert-${tipoMensagem} alert-dismissible fade show bootstrap-alert`}
          role="alert"
        >
          {mensagem}
        </div>
      )}
    </div>
  );
};

export default AdminCard;
