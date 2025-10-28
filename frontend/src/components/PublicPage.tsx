import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"
import api, {
  curtirHistoria,
  getComentarios,
} from "../apis/apiAxios";
import coraçãoCheio from "../../public/icons/heart-filled.svg"
import coraçãoVazio from "../../public/icons/heart-outline.svg"
import "./css/cssPublicPage.css";

const API_BASE = "http://localhost:5000/";

type ExtensaoImagem = "png" | "jpg" | "jpeg" | "gif";

interface Arquivo {
  tipo: string;
  url: string;
}

interface Historia {
  id: number;
  titulo: string;
  subtitulo: string;
  autor?: string;
  status?: string;
  data_criacao: string;
  arquivos?: Arquivo[];
}

const likeSound = new Audio("../../public/sons/like.wav");
const unlikeSound = new Audio("../../public/sons/unlike.wav");

const IMAGE_TYPES: ExtensaoImagem[] = ["png", "jpg", "jpeg", "gif"];

function getCapaImagem(arquivos?: Arquivo[]): string {
  if (!arquivos || arquivos.length === 0) return "/imagens/placeholder.jpg";
  const capa = arquivos.find((a) => IMAGE_TYPES.includes(a.tipo as ExtensaoImagem));
  return capa ? `${API_BASE}${capa.url}` : "/imagens/placeholder.jpg";
}

const PublicPage: React.FC = () => {
  const [historias, setHistorias] = useState<Historia[]>([]);
  const [curtidasAtivas, setCurtidasAtivas] = useState<number[]>([]);
  const [comentariosCount, setComentariosCount] = useState<Record<number, number>>({});
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [mensagemLogin, setMensagemLogin] = useState<string | null>(null);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistorias = async () => {
      try {
        const res = await api.get<Historia[]>("/historias");
        const aprovadas = res.data.filter((h) => h.status === "Aprovada");
        setHistorias(aprovadas);

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
  }, []);

  const handleCurtir = async (historiaId: number) => {
    if (!token) {
      setMensagemLogin("Faça login para curtir histórias ❤️");
      return;
    }

    const jaCurtiu = curtidasAtivas.includes(historiaId);

    if (jaCurtiu) {
    unlikeSound.currentTime = 0;
    unlikeSound.play();
  } else {
    likeSound.currentTime = 0;
    likeSound.play();
  }


    setCurtidasAtivas((prev) =>
      jaCurtiu ? prev.filter((id) => id !== historiaId) : [...prev, historiaId]
    );

    try {
      await curtirHistoria(historiaId);
    } catch (err) {
      console.error("Erro ao curtir:", err);
    }
  };

  if (carregando) return <p className="mensagem-status">Carregando histórias...</p>;
  if (erro) return <p className="mensagem-status erro">{erro}</p>;

  return (
    <div className="public-page">
      <h1 className="titulo-principal">Histórias Culturais</h1>

      {mensagemLogin && (
        <div className="alerta-login">
          {mensagemLogin}
          <button onClick={() => setMensagemLogin(null)}>Fechar</button>
        </div>
      )}

      {historias.length === 0 ? (
        <p className="mensagem-status">Nenhuma história aprovada disponível.</p>
      ) : (
        <div className="historias-grid">
          {historias.map((historia) => {
            const capa = getCapaImagem(historia.arquivos);
            const curtiu = curtidasAtivas.includes(historia.id);

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
                      Por <strong>{historia.autor || "Autor desconhecido"}</strong> —{" "}
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
                    className={`btn-curtir ${curtiu ? "ativo pulso" : ""}`}
                    onClick={() => handleCurtir(historia.id)}
                    title={curtiu ? "Remover curtida" : "Curtir história"}
                    onAnimationEnd={(e) => e.currentTarget.classList.remove("pulso")}
                  >
                    <img
                      src={
                        curtiu
                          ? coraçãoCheio
                          : coraçãoVazio
                      }
                      alt={curtiu ? "Coração cheio" : "Coração vazio"}
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
