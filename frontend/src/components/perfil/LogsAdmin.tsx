import React, { useEffect, useState } from "react";
import api from "../../apis/apiAxios";
import "../css/cssPerfil/cssLogsAdmin.css";

interface LogResponse {
  message: string;
  page: number;
  per_page: number;
  total_linhas: number;
  total_paginas: number;
  logs: string[];
}

const LogsAdmin: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [filtro, setFiltro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const fetchLogs = async (pagina: number = 1) => {
    setCarregando(true);
    try {
      const res = await api.get<LogResponse>(`/admin/logs?page=${pagina}&per_page=50`);
      setLogs(res.data.logs);
      setPage(res.data.page);
      setTotalPaginas(res.data.total_paginas);
    } catch (err) {
      console.error("Erro ao buscar logs:", err);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // 🔍 Aplica o filtro digitado
  const logsFiltrados = logs.filter((linha) =>
    linha.toLowerCase().includes(filtro.toLowerCase())
  );

  // 📦 Agrupa linhas que pertencem ao mesmo log (começam com data)
  const blocosDeLog: string[][] = [];
  let blocoAtual: string[] = [];

  for (const linha of logsFiltrados) {
    if (/^\d{4}-\d{2}-\d{2}/.test(linha)) {
      if (blocoAtual.length) blocosDeLog.push(blocoAtual);
      blocoAtual = [linha];
    } else {
      blocoAtual.push(linha);
    }
  }
  if (blocoAtual.length) blocosDeLog.push(blocoAtual);

  return (
    <div className="logs-admin-container">
      <h2>🧾 Logs do Sistema</h2>
      <p>Visualize os erros e avisos registrados no servidor.</p>

      <div className="filtros-logs">
        <input
          type="text"
          placeholder="🔍 Filtrar (ex: error, token, mysql...)"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
        <button onClick={() => fetchLogs(1)}>🔄 Atualizar</button>
      </div>

      {carregando ? (
        <p>Carregando logs...</p>
      ) : blocosDeLog.length > 0 ? (
        <div className="logs-lista">
          {blocosDeLog.map((bloco, index) => (
            <div key={index} className="log-card">
              <code>
                {bloco.map((linha, i) => (
                  <div key={i}>{linha}</div>
                ))}
              </code>
            </div>
          ))}
        </div>
      ) : (
        <p>Nenhum log encontrado.</p>
      )}

      <div className="paginacao-logs">
        <button disabled={page <= 1} onClick={() => fetchLogs(page - 1)}>
          ◀ Anterior
        </button>
        <span>
          Página {page} de {totalPaginas}
        </span>
        <button disabled={page >= totalPaginas} onClick={() => fetchLogs(page + 1)}>
          Próxima ▶
        </button>
      </div>
    </div>
  );
};

export default LogsAdmin;
