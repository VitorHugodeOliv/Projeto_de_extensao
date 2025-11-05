import React, { useEffect, useState } from "react";
import api from "../../apis/apiAxios";
import "../css/cssPerfil/cssHistoricoUsuario.css";

interface Historia {
  id: number;
  titulo: string;
  subtitulo: string;
  categoria_nome: string;
  status: string;
  data_criacao: string;
  autor_artista: string;
  motivo_rejeicao?: string;
}

interface Resumo {
  total: number;
  aprovadas: number;
  rejeitadas: number;
  em_analise: number;
}

const HistoricoUsuario: React.FC = () => {
  const [historias, setHistorias] = useState<Historia[]>([]);
  const [resumo, setResumo] = useState<Resumo | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregarHistorico = async () => {
      try {
        const res = await api.get("/historias/usuario");
        setHistorias(res.data.historias || []);
        setResumo(res.data.resumo || null);
      } catch (err) {
        console.error("Erro ao carregar histórico:", err);
      } finally {
        setCarregando(false);
      }
    };

    carregarHistorico();
  }, []);

  if (carregando) return <p>Carregando histórico...</p>;

  return (
    <div className="historico-container">
      <h2>📚 Histórico de Histórias</h2>

      {resumo && (
        <div className="cards-resumo">
          <div className="card-resumo total">
            <h4>Total</h4>
            <p>{resumo.total}</p>
          </div>
          <div className="card-resumo aprovadas">
            <h4>Aprovadas</h4>
            <p>{resumo.aprovadas}</p>
          </div>
          <div className="card-resumo rejeitadas">
            <h4>Rejeitadas</h4>
            <p>{resumo.rejeitadas}</p>
          </div>
          <div className="card-resumo analise">
            <h4>Em Análise</h4>
            <p>{resumo.em_analise}</p>
          </div>
        </div>
      )}

      {historias.length === 0 ? (
        <p className="sem-historias">Você ainda não enviou nenhuma história.</p>
      ) : (
        <div className="lista-historias">
          {historias.map((h) => (
            <div
              key={h.id}
              className={`card-historia ${h.status
                .toLowerCase()
                .replace(" ", "-")}`}
            >
              <h3>{h.titulo}</h3>
              {h.subtitulo && <p className="subtitulo">{h.subtitulo}</p>}
              <p>
                <strong>Categoria:</strong>{" "}
                {h.categoria_nome || "Sem categoria"}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={`status ${h.status
                    .toLowerCase()
                    .replace(" ", "-")}`}
                >
                  {h.status}
                </span>
              </p>

              {h.status === "Rejeitada" && h.motivo_rejeicao && (
                <p className="motivo-rejeicao">
                  <strong>Motivo da rejeição:</strong> {h.motivo_rejeicao}
                </p>
              )}

              <p>
                <strong>Data de Envio:</strong>{" "}
                {new Date(h.data_criacao).toLocaleDateString("pt-BR")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoricoUsuario;
