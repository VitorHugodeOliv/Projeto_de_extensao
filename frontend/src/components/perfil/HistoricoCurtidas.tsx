import React, { useEffect, useState } from "react";
import api from "../../apis/apiAxios";
import "../css/cssPerfil/cssHistoricoUsuario.css";

interface Historia {
  id: number;
  titulo: string;
  subtitulo?: string;
  autor_artista?: string;
  categoria_nome?: string;
  status: string;
  data_criacao: string;
}

const HistoricoCurtidas: React.FC<{ usuarioId: number }> = ({ usuarioId }) => {
  const [curtidas, setCurtidas] = useState<Historia[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregarCurtidas = async () => {
      try {
        const res = await api.get(`/usuarios/${usuarioId}/curtidas`);
        setCurtidas(res.data || []);
        console.log(res.data)
      } catch (err) {
        console.error("Erro ao carregar curtidas:", err);
      } finally {
        setCarregando(false);
      }
    };

    carregarCurtidas();
  }, [usuarioId]);

  if (carregando) return <p>Carregando curtidas...</p>;

  return (
    <div className="historico-container">
      <h2>💚 Histórias Curtidas</h2>

      {curtidas.length === 0 ? (
        <p className="sem-historias">
          Você ainda não curtiu nenhuma história.
        </p>
      ) : (
        <div className="lista-historias">
          {curtidas.map((h) => (
            <div key={h.id} className={`card-historia ${h.status.toLowerCase()}`}>
              <h3>{h.titulo}</h3>
              {h.subtitulo && <p className="subtitulo">{h.subtitulo}</p>}
              <p>
                <strong>Autor:</strong> {h.autor_artista || "Desconhecido"}
              </p>
              <p>
                <strong>Categoria:</strong> {h.categoria_nome || "Sem categoria"}
              </p>
              <p>
                <strong>Status:</strong> {h.status}
              </p>
              <p>
                <strong>Data:</strong>{" "}
                {new Date(h.data_criacao).toLocaleDateString("pt-BR")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoricoCurtidas;
