import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { getComentarios } from "../apis/apiAxios";
import coracaoCheio from "../assets/icons/heart-filled.svg";
import coracaoVazio from "../assets/icons/heart-outline.svg";
import "./css/cssPublicPage.css";
import { useInteracoesHistoria } from "../utils/useInteracoesHistoria";

interface Arquivo {
  tipo: string;
  url: string;
}

interface Historia {
  id: number;
  titulo: string;
  subtitulo: string;
  autor_artista?: string;
  status?: string;
  data_criacao: string;
  arquivos?: Arquivo[];
}

function getCapaImagem(arquivos?: Arquivo[]): string {
  if (!arquivos || arquivos.length === 0) return "/imagens/placeholder.jpg";

  const capa = arquivos.find(
    (a) =>
      a.tipo.toLowerCase().startsWith("image") ||
      ["png", "jpg", "jpeg", "gif"].includes(a.tipo.toLowerCase())
  );

  if (!capa) return "/imagens/placeholder.jpg";

  const API_BASE = "http://localhost:5000";
  let url = capa.url.trim();
  if (!url.startsWith("/")) url = "/" + url;
  if (!url.startsWith("/uploads")) url = "/uploads" + url;

  const cleanUrl = `${API_BASE}${url}`.replace(/([^:]\/)\/+/g, "$1");
  return cleanUrl;
}

const PublicPage: React.FC = () => {
  const [historias, setHistorias] = useState<Historia[]>([]);
  const [comentariosCount, setComentariosCount] = useState<Record<number, number>>({});
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const {
    curtido,
    mensagem,
    setMensagem,
    handleCurtir,
    setCurtido,
  } = useInteracoesHistoria(undefined, token);

  useEffect(() => {
    const fetchHistorias = async () => {
      try {
        const res = await api.get<Historia[]>("/historias");
        const aprovadas = res.data.filter((h) => h.status === "Aprovada");
        setHistorias(aprovadas);

        const mapaCurtido: Record<number, boolean> = {};
        const mapaCurtidas: Record<number, number> = {};

        for (const h of aprovadas) {
          try {
            const response = await fetch(`http://localhost:5000/historias/${h.id}/curtidas`, {
              headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            const data = await response.json();
            mapaCurtido[h.id] = data.usuario_curtiu || false;
            mapaCurtidas[h.id] = data.total_curtidas || 0;
          } catch (err) {
            console.error(`Erro ao buscar curtidas da história ${h.id}:`, err);
            mapaCurtido[h.id] = false;
            mapaCurtidas[h.id] = 0;
          }
        }

        setCurtido(mapaCurtido);

        for (const h of aprovadas) {
          const listaComentarios = await getComentarios(h.id);
          setComentariosCount((prev) => ({
            ...prev,
            [h.id]: listaComentarios.length,
          }));
        }
      } catch (err) {
        console.error(err);
        setErro("Erro ao carregar as histórias.");
      } finally {
        setCarregando(false);
      }
    };

    fetchHistorias();
  }, [token, setCurtido]);

  if (carregando) return <p className="mensagem-status">Carregando histórias...</p>;
  if (erro) return <p className="mensagem-status erro">{erro}</p>;

  return (
    <div className="public-page">
      <h1 className="titulo-principal">Histórias Culturais</h1>

      {mensagem && (
        <div className="alerta-login">
          {mensagem}
          <button onClick={() => setMensagem(null)}>Fechar</button>
        </div>
      )}

      {historias.length === 0 ? (
        <p className="mensagem-status">Nenhuma história aprovada disponível.</p>
      ) : (
        <div className="historias-grid">
          {historias.map((historia) => {
            const capa = getCapaImagem(historia.arquivos);
            const jaCurtiu = curtido[historia.id] ?? false;

            return (
              <div key={historia.id} className="historia-card">
                <div
                  className="historia-click-area"
                  onClick={() => navigate(`/historia/${historia.id}`)}
                >
                  <div className="imagem-container">
                    <img
                      src={capa}
                      alt={historia.titulo}
                      className="historia-imagem"
                    />
                  </div>
                  <div className="historia-conteudo">
                    <h2 className="historia-titulo">{historia.titulo}</h2>
                    <p className="historia-subtitulo">{historia.subtitulo}</p>
                    <small className="historia-info">
                      Por <strong>{historia.autor_artista || "Autor desconhecido"}</strong> —{" "}
                      {new Date(historia.data_criacao).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </small>
                  </div>
                </div>

                <div className="acoes-card">
                  <button
                    className={`btn-curtir ${jaCurtiu ? "ativo pulso" : ""}`}
                    onClick={() => handleCurtir(historia.id)}
                    onAnimationEnd={(e) => e.currentTarget.classList.remove("pulso")}
                  >
                    <img
                      src={jaCurtiu ? coracaoCheio : coracaoVazio}
                      alt={jaCurtiu ? "Coração cheio" : "Coração vazio"}
                      className="icone-coracao"
                    />
                  </button>
                  <button
                    className="btn-comentar"
                    title="Ver comentários"
                    onClick={() => navigate(`/historia/${historia.id}`)}
                  >
                    💬 {comentariosCount[historia.id] || 0}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PublicPage;
