import React, { useEffect, useState } from "react";
import axios from "axios";
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
  data_criacao: string;
  arquivos?: Arquivo[]; 
}

const IMAGE_TYPES: ExtensaoImagem[] = ["png", "jpg", "jpeg", "gif"];

function getCapaImagem(arquivos?: Arquivo[]): string | null {
  if (!arquivos || arquivos.length === 0) return null;
  const capa = arquivos.find(a => IMAGE_TYPES.includes(a.tipo as ExtensaoImagem));
  return capa ? `${API_BASE}${capa.url}` : null;
}

const PublicPage: React.FC = () => {
  const [historias, setHistorias] = useState<Historia[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistorias = async () => {
      try {
        const resposta = await axios.get<Historia[]>("http://localhost:5000/historias");
        setHistorias(resposta.data);
      } catch (err) {
        console.error(err);
        setErro("Erro ao carregar as histórias.");
      } finally {
        setCarregando(false);
      }
    };
    fetchHistorias();
  }, []);

  if (carregando) return <p className="mensagem-status">Carregando histórias...</p>;
  if (erro) return <p className="mensagem-status erro">{erro}</p>;

  return (
    <div className="public-page">
      <h1>Histórias Culturais</h1>

      <div className="historias-grid">
        {historias.map((historia) => {
          const capa = getCapaImagem(historia.arquivos);
          return (
            <div key={historia.id} className="historia-card">
              {capa && (
                <img
                  src={capa}
                  alt={historia.titulo}
                  className="historia-imagem"
                />
              )}
              <div className="historia-conteudo">
                <h2>{historia.titulo}</h2>
                <p className="subtitulo">{historia.subtitulo}</p>
                <small>
                  {new Date(historia.data_criacao).toLocaleString("pt-BR")}
                </small>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PublicPage;
