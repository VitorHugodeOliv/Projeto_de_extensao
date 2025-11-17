import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { apiAdmin } from "@lib/api/api";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/admin-card.css";

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
  motivo_rejeicao: string;
  categoria_nome: string;
  nome_usuario: string;
  data_criacao: string;
  arquivos: Arquivo[];
}

const AdminCard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [historia, setHistoria] = useState<Historia | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [motivo, setMotivo] = useState("");

  useEffect(() => {
    const carregarHistoria = async () => {
      try {
        const res = await apiAdmin.listarSolicitacoes();
        const encontrada = res.historias.find(
          (h: Historia) => h.id === Number(id)
        );
        if (!encontrada) {
          toast.warning("História não encontrada ⚠️");
          navigate("/admin");
          return;
        }
        setHistoria(encontrada);
      } catch (err) {
        console.error("Erro ao carregar história:", err);
        toast.error("Erro ao carregar os detalhes da história 😢");
      } finally {
        setCarregando(false);
      }
    };
    carregarHistoria();
  }, [id, navigate]);

  const aprovarHistoria = async () => {
    if (!historia?.id) return;
    try {
      await apiAdmin.aprovarHistoria(historia.id);
      toast.success("História aprovada com sucesso! 🎉");
      setTimeout(() => navigate("/admin"), 1500);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao aprovar a história 😕");
    }
  };

  const confirmarRejeicao = async () => {
    if (!historia?.id) return;
    if (!motivo || motivo.trim().length < 5) {
      toast.error("Informe a rejeição com detalhes")
    }
    if (!motivo.trim()) {
      toast.warning("Informe um motivo antes de rejeitar.");
      return;
    }

    try {
      await apiAdmin.rejeitarHistoria(historia.id, motivo);
      toast.info("História rejeitada com sucesso.");
      setMostrarModal(false);
      setMotivo("");
      setTimeout(() => navigate("/admin"), 1500);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao rejeitar a história 😢");
    }
  };

  if (carregando)
    return (
      <div className="admin-card-page">
        <p className="loading-text">Carregando história...</p>
      </div>
    );

  if (!historia)
    return (
      <div className="admin-card-page">
        <p className="loading-text">História não encontrada.</p>
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

      <div className="conteudo">
        <p>{historia.conteudo || "Nenhum conteúdo textual fornecido."}</p>
      </div>
      {historia.status === "Rejeitada" && historia["motivo_rejeicao"] && (
        <div className="motivo-rejeicao">
          <h5>🚫 Motivo da Rejeição</h5>
          <p>{historia["motivo_rejeicao"]}</p>
        </div>
      )}

      <div className="midia-container">
        {imagens.map((img) => (
          <div key={img.id} className="midia-item">
            <img src={`http://localhost:5000/${img.caminho}`} alt={img.nome} />
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

      {historia.status === "Em análise" && (
        <div className="botoes-acoes">
          <button className="btn-aprovar" onClick={aprovarHistoria}>
            ✅ Aprovar
          </button>
          <button
            className="btn-rejeitar"
            onClick={() => setMostrarModal(true)}
          >
            ❌ Rejeitar
          </button>
        </div>
      )}
    </div>

    {mostrarModal && (
      <div className="modal-overlay">
        <div className="modal-content">
          <h4>Motivo da Rejeição</h4>
          <textarea
            placeholder="Descreva brevemente o motivo..."
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
          />
          <div className="modal-buttons">
            <button
              className="btn-cancelar"
              onClick={() => setMostrarModal(false)}
            >
              Cancelar
            </button>
            <button className="btn-confirmar" onClick={confirmarRejeicao}>
              Confirmar
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);
};

export default AdminCard;
