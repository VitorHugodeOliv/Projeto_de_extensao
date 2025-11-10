import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { getComentarios } from "../apis/apiAxios";
import coracaoCheio from "../assets/icons/heart-filled.svg";
import coracaoVazio from "../assets/icons/heart-outline.svg";
import { useInteracoesHistoria } from "../utils/useInteracoesHistoria";
import ModalHistoria from "../components/ModalHistoria";
import "./css/cssPublicPage.css";
import { useAuth } from "../store/authStore";
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
  categoria_nome?: string;
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
  return `${API_BASE}${url}`.replace(/([^:]\/)\/+/g, "$1");
}

const PublicPage: React.FC = () => {
  const [historias, setHistorias] = useState<Historia[]>([]);
  const [comentariosCount, setComentariosCount] = useState<Record<number, number>>({});
  const [curtidasCount, setCurtidasCount] = useState<Record<number, number>>({});
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [filtro, setFiltro] = useState("recentes");
  const [categoriaFiltro, setCategoriaFiltro] = useState("todas");
  const [historiaSelecionada, setHistoriaSelecionada] = useState<number | null>(null);

  const navigate = useNavigate();
  const { accessToken } = useAuth();

  const { curtido, handleCurtir, setCurtido } = useInteracoesHistoria();

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
            const response = await fetch(`${API_BASE_URL}/historias/${h.id}/curtidas`, {
              headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
            });
            const data = await response.json();
            mapaCurtido[h.id] = data.usuario_curtiu || false;
            mapaCurtidas[h.id] = data.total_curtidas || 0;
          } catch {
            mapaCurtido[h.id] = false;
            mapaCurtidas[h.id] = 0;
          }
        }

        setCurtido(mapaCurtido);
        setCurtidasCount(mapaCurtidas);

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
  }, [accessToken, setCurtido]);

  const historiasFiltradas = historias
    .filter((h) => categoriaFiltro === "todas" || h.categoria_nome === categoriaFiltro)
    .sort((a, b) => {
      if (filtro === "recentes") {
        return new Date(b.data_criacao).getTime() - new Date(a.data_criacao).getTime();
      } else if (filtro === "curtidas") {
        return (curtidasCount[b.id] || 0) - (curtidasCount[a.id] || 0);
      }
      return 0;
    });

  const destaques = [...historias].sort(
    (a, b) => (curtidasCount[b.id] || 0) - (curtidasCount[a.id] || 0)
  ).slice(0, 3);

  if (carregando) return <p className="mensagem-status">Carregando histórias...</p>;
  if (erro) return <p className="mensagem-status erro">{erro}</p>;

  return (
    <div className="public-page">
      <h1 className="titulo-principal">Galeria Cultural</h1>
      {destaques.length > 0 && (
        <div className="destaques-section">
          <h2>✨ Destaques Culturais</h2>
          <div className="destaques-grid">
            {destaques.map((historia) => (
              <div
                key={historia.id}
                className="destaque-card"
                onClick={() => navigate(`/historia/${historia.id}`)}
              >
                <img src={getCapaImagem(historia.arquivos)} alt={historia.titulo} />
                <div className="overlay">
                  <h3>{historia.titulo}</h3>
                  <p>❤️ {curtidasCount[historia.id] || 0} curtidas</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="filtros-container">
        <select value={filtro} onChange={(e) => setFiltro(e.target.value)}>
          <option value="recentes">Mais recentes</option>
          <option value="curtidas">Mais curtidas</option>
        </select>

        <select value={categoriaFiltro} onChange={(e) => setCategoriaFiltro(e.target.value)}>
          <option value="todas">Todas as categorias</option>
          <option value="Teatro">Teatro</option>
          <option value="Dança">Dança</option>
          <option value="Audiovisual">Audiovisual</option>
        </select>
      </div>

      {historiasFiltradas.length === 0 ? (
        <p className="mensagem-status">Nenhuma história encontrada.</p>
      ) : (
        <div key={`${filtro}-${categoriaFiltro}`} className="historias-grid">
          {historiaSelecionada && (
            <ModalHistoria
              historiaId={historiaSelecionada}
              onClose={() => setHistoriaSelecionada(null)}
            />
          )}
          {historiasFiltradas.map((historia) => {
            const capa = getCapaImagem(historia.arquivos);
            const jaCurtiu = curtido[historia.id] ?? false;

            return (
              <div key={historia.id} className="historia-card">
                <div
                  className="historia-click-area"
                  onClick={() => setHistoriaSelecionada(historia.id)}
                >
                  <img src={capa} alt={historia.titulo} className="historia-imagem" />
                  <div className="historia-conteudo">
                    <h2>{historia.titulo}</h2>
                    <p>{historia.subtitulo}</p>
                    <small>
                      Por <strong>{historia.autor_artista || "Autor desconhecido"}</strong> —{" "}
                      {new Date(historia.data_criacao).toLocaleDateString("pt-BR")}
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
