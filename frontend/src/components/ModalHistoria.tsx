import React, { useEffect, useState } from "react";
import api from "../apis/apiAxios";
import coracaoCheio from "../assets/icons/heart-filled.svg";
import coracaoVazio from "../assets/icons/heart-outline.svg";
import { useInteracoesHistoria } from "../utils/useInteracoesHistoria";
import "./css/cssModalHistoria.css";
import { API_BASE_URL } from "../apis/config";

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

interface ModalHistoriaProps {
  historiaId: number;
  onClose: () => void;
}

const ModalHistoria: React.FC<ModalHistoriaProps> = ({ historiaId, onClose }) => {
  const [historia, setHistoria] = useState<Historia | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [midiaAtual, setMidiaAtual] = useState(0);
  const [expandida, setExpandida] = useState(false);

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
  } = useInteracoesHistoria(historiaId);

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

  const totalCurtidas = curtidas[historiaId] ?? 0;
  const jaCurtiu = curtido[historiaId] ?? false;
  const listaComentarios = comentarios[historiaId] ?? [];

  if (carregando) {
    return (
      <div className="modal-overlay">
        <div className="modal-container">
          <p className="mensagem-status">Carregando história...</p>
        </div>
      </div>
    );
  }

  if (mensagem) {
    return (
        <div className="modal-overlay">
        <div className="modal-container">
          <p className="mensagem-status">{mensagem}</p>
          <button onClick={onClose} className="btn-fechar">Fechar</button>
        </div>
      </div>
    );
  }

  if (!historia) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="btn-fechar" onClick={onClose}>
          ✕
        </button>

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
    <div className="midias-galeria">
    {historia.arquivos && historia.arquivos.length > 0 ? (
        <>
        <button
            className="seta seta-esquerda"
            onClick={(e) => {
            e.stopPropagation();
            setMidiaAtual((prev) =>
                prev === 0 ? historia.arquivos!.length - 1 : prev - 1
            );
            }}
        >
            ‹
        </button>
        {historia.arquivos.map((arq, i) => {
            const tipo = arq.tipo.toLowerCase();
            let url = arq.url.trim();
            if (!url.startsWith("/")) url = "/" + url;
            if (!url.startsWith("/uploads")) url = "/uploads" + url;
            const cleanUrl = `${API_BASE_URL}${url}`.replace(/([^:]\/)\/+/g, "$1");

            if (i !== midiaAtual) return null;

            return (
            <div key={i} className="midia-ativa">
                {tipo.startsWith("image") || ["png", "jpg", "jpeg", "gif"].includes(tipo) ? (
                <img
                    src={cleanUrl}
                    alt="Imagem da história"
                    onClick={() => setExpandida(true)}
                />
                ) : tipo.startsWith("video") || tipo === "mp4" ? (
                <video src={cleanUrl} controls onClick={() => setExpandida(true)} />
                ) : tipo.startsWith("audio") || ["mp3", "wav"].includes(tipo) ? (
                <audio src={cleanUrl} controls />
                ) : null}
            </div>
            );
        })}
        <button
            className="seta seta-direita"
            onClick={(e) => {
            e.stopPropagation();
            setMidiaAtual((prev) =>
                prev === historia.arquivos!.length - 1 ? 0 : prev + 1
            );
            }}
        >
            ›
        </button>
        {expandida && (
            <div className="overlay-expandida" onClick={() => setExpandida(false)}>
            <button
                className="btn-fechar-expandida"
                onClick={(e) => {
                e.stopPropagation();
                setExpandida(false);
                }}
            >
                ✕ Fechar
            </button>

            {(() => {
                const arq = historia.arquivos![midiaAtual];
                const tipo = arq.tipo.toLowerCase();
                let url = arq.url.trim();
                if (!url.startsWith("/")) url = "/" + url;
                if (!url.startsWith("/uploads")) url = "/uploads" + url;
                const cleanUrl = `${API_BASE_URL}${url}`.replace(/([^:]\/)\/+/g, "$1");

                if (tipo.startsWith("image") || ["png", "jpg", "jpeg", "gif"].includes(tipo)) {
                return <img src={cleanUrl} alt="Imagem expandida" className="midia-expandida" />;
                }
                if (tipo.startsWith("video") || tipo === "mp4") {
                return <video src={cleanUrl} controls className="midia-expandida" />;
                }
                if (tipo.startsWith("audio") || ["mp3", "wav"].includes(tipo)) {
                return <audio src={cleanUrl} controls className="midia-expandida" />;
                }
                return null;
            })()}
            </div>
        )}
        </>
    ) : (
        <p className="sem-midias">Nenhuma mídia disponível.</p>
    )}
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
    </div>
  );
};

export default ModalHistoria;
