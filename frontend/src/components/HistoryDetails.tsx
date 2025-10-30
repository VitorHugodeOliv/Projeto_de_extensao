import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../apis/apiAxios";
import coracaoCheio from "../assets/icons/heart-filled.svg";
import coracaoVazio from "../assets/icons/heart-outline.svg";
import "./css/cssHistoriaDetalhes.css";
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
  conteudo: string;
  data_criacao: string;
  arquivos?: Arquivo[];
}

const HistoryDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const historiaId = Number(id);
  const [historia, setHistoria] = useState<Historia | null>(null);
  const [carregando, setCarregando] = useState(true);
  const token = localStorage.getItem("token");

  const {
    curtidas,
    curtido,
    comentarios,
    novoComentario,
    mensagem,
    setMensagem,
    setNovoComentario,
    handleCurtir,
    handleComentar,
  } = useInteracoesHistoria(historiaId, token);

  useEffect(() => {
    const carregarHistoria = async () => {
      try {
        const res = await api.get<Historia[]>("/historias");
        const encontrada = res.data.find((h) => h.id === historiaId);
        if (!encontrada) return setMensagem("História não encontrada.");
        setHistoria(encontrada);
      } catch (err) {
        console.error("Erro ao carregar história:", err);
        setMensagem("Erro ao carregar história.");
      } finally {
        setCarregando(false);
      }
    };
    carregarHistoria();
  }, [historiaId]);

  if (carregando) return <p className="mensagem-status">Carregando história...</p>;
  if (mensagem) return <p className="mensagem-status">{mensagem}</p>;
  if (!historia) return null;

  const totalCurtidas = curtidas[historiaId] ?? 0;
  const jaCurtiu = curtido[historiaId] ?? false;
  const listaComentarios = comentarios[historiaId] ?? [];

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
        <div className="midias">
          {historia.arquivos?.map((arq, i) => {
            const tipo = arq.tipo.toLowerCase();
            let url = arq.url.trim();
            if (!url.startsWith("/")) url = "/" + url;
            if (!url.startsWith("/uploads")) url = "/uploads" + url;
            const cleanUrl = `http://localhost:5000${url}`.replace(/([^:]\/)\/+/g, "$1");

            if (tipo.startsWith("image") || ["png", "jpg", "jpeg", "gif"].includes(tipo)) {
              return <img key={i} src={cleanUrl} alt="Imagem da história" />;
            }
            if (tipo.startsWith("video") || tipo === "mp4") {
              return <video key={i} src={cleanUrl} controls />;
            }
            if (tipo.startsWith("audio") || ["mp3", "wav"].includes(tipo)) {
              return <audio key={i} src={cleanUrl} controls />;
            }
            return null;
          })}
        </div>
      </div>

      <div className="acoes-detalhes">
        <button
          className={`btn-curtir ${jaCurtiu ? "ativo pulso" : ""}`}
          onClick={() => handleCurtir(historiaId)}
          onAnimationEnd={(e) => e.currentTarget.classList.remove("pulso")}
        >
          <img
            src={jaCurtiu ? coracaoCheio : coracaoVazio}
            alt={jaCurtiu ? "Coração cheio" : "Coração vazio"}
            className="icone-coracao"
          />
        </button>
        <span className="contador-curtidas">{totalCurtidas} curtidas</span>
      </div>

      <div className="comentarios">
        <h4>Comentários</h4>
        {listaComentarios.length === 0 ? (
          <p className="sem-comentarios">Nenhum comentário ainda.</p>
        ) : (
          listaComentarios.map((c) => (
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
            <button onClick={() => handleComentar(historiaId)}>Enviar</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryDetails;
