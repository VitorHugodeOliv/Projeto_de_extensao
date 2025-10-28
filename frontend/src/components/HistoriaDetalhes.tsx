import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api, { getCurtidas, curtirHistoria, getComentarios, comentarHistoria } from "../apis/apiAxios";
import "./css/cssHistoriaDetalhes.css";

const API_BASE = "http://localhost:5000/";

interface Arquivo {
  tipo: string;
  url: string;
}

interface Historia {
  id: number;
  titulo: string;
  subtitulo: string;
  autor_artista?: string;
  conteudo: string;
  data_criacao: string;
  arquivos?: Arquivo[];
}

const HistoriaDetalhes: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [historia, setHistoria] = useState<Historia | null>(null);
  const [curtidas, setCurtidas] = useState<number>(0);
  const [comentarios, setComentarios] = useState<
    { id: number; texto: string; autor: string; data_criacao: string }[]
  >([]);
  const [novoComentario, setNovoComentario] = useState("");
  const [curtido, setCurtido] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [mensagem, setMensagem] = useState<string | null>(null);

  const token = localStorage.getItem("token");

  // 🔊 sons opcionais
  const likeSound = new Audio("/sons/like.mp3");
  const unlikeSound = new Audio("/sons/unlike.mp3");
  likeSound.volume = 0.4;
  unlikeSound.volume = 0.3;

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const res = await api.get<Historia[]>(`/historias`);
        const historiaEncontrada = res.data.find((h) => h.id === Number(id));
        if (!historiaEncontrada) return setMensagem("História não encontrada.");

        setHistoria(historiaEncontrada);

        // Contagem de curtidas e comentários
        const totalCurtidas = await getCurtidas(Number(id));
        const listaComentarios = await getComentarios(Number(id));

        setCurtidas(totalCurtidas);
        setComentarios(listaComentarios);
      } catch (err) {
        console.error("Erro ao carregar história:", err);
        setMensagem("Erro ao carregar história.");
      } finally {
        setCarregando(false);
      }
    };
    carregarDados();
  }, [id]);

  const handleCurtir = async () => {
    if (!token) {
      setMensagem("Faça login para curtir histórias ❤️");
      return;
    }

    try {
      if (curtido) {
        unlikeSound.currentTime = 0;
        unlikeSound.play();
      } else {
        likeSound.currentTime = 0;
        likeSound.play();
      }

      await curtirHistoria(Number(id));
      const total = await getCurtidas(Number(id));
      setCurtidas(total);
      setCurtido(!curtido);
    } catch (err) {
      console.error("Erro ao curtir:", err);
    }
  };

  const handleComentar = async () => {
    if (!token) {
      setMensagem("Faça login para comentar 💬");
      return;
    }
    if (!novoComentario.trim()) return;

    try {
      await comentarHistoria(Number(id), novoComentario);
      setNovoComentario("");
      const lista = await getComentarios(Number(id));
      setComentarios(lista);
    } catch (err) {
      console.error("Erro ao comentar:", err);
    }
  };

  if (carregando) return <p className="mensagem-status">Carregando história...</p>;
  if (mensagem) return <p className="mensagem-status">{mensagem}</p>;
  if (!historia) return null;

  return (
    <div className="historia-detalhes">
      <div className="cabecalho">
        <h1>{historia.titulo}</h1>
        <h3>{historia.subtitulo}</h3>
        <p className="autor">
          Por <strong>{historia.autor_artista || "Autor desconhecido"}</strong> —{" "}
          {new Date(historia.data_criacao).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      <div className="conteudo">
        <p>{historia.conteudo}</p>

        {/* Mídias anexadas */}
        <div className="midias">
          {historia.arquivos?.map((arq, i) => {
            const url = `${API_BASE}${arq.url}`;
            if (arq.tipo.startsWith("image")) {
              return <img key={i} src={url} alt="Imagem da história" />;
            }
            if (arq.tipo.startsWith("video")) {
              return <video key={i} src={url} controls />;
            }
            if (arq.tipo.startsWith("audio")) {
              return <audio key={i} src={url} controls />;
            }
            return null;
          })}
        </div>
      </div>

      {/* Curtidas */}
      <div className="acoes-detalhes">
        <button
          className={`btn-curtir ${curtido ? "ativo pulso" : ""}`}
          onClick={handleCurtir}
          onAnimationEnd={(e) => e.currentTarget.classList.remove("pulso")}
        >
          <img
            src={
              curtido
                ? "/imagens/icons/heart-filled.svg"
                : "/imagens/icons/heart-outline.svg"
            }
            alt={curtido ? "Coração cheio" : "Coração vazio"}
            className="icone-coracao"
          />
        </button>
        <span className="contador-curtidas">{curtidas} curtidas</span>
      </div>

      {/* Comentários */}
      <div className="comentarios">
        <h4>Comentários</h4>
        {comentarios.length === 0 ? (
          <p className="sem-comentarios">Nenhum comentário ainda.</p>
        ) : (
          comentarios.map((c) => (
            <div key={c.id} className="comentario">
              <p className="texto">{c.texto}</p>
              <small>
                — <strong>{c.autor}</strong>,{" "}
                {new Date(c.data_criacao).toLocaleDateString("pt-BR")}
              </small>
            </div>
          ))
        )}

        {token && (
          <div className="novo-comentario">
            <textarea
              placeholder="Escreva um comentário..."
              value={novoComentario}
              onChange={(e) => setNovoComentario(e.target.value)}
            />
            <button onClick={handleComentar}>Enviar</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoriaDetalhes;
