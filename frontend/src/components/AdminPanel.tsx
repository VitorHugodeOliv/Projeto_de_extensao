import React, { useEffect, useState } from "react";
import api from "../apis/apiAxios";
import "./css/cssAdminPanel.css";

interface Arquivo {
  id: number;
  nome: string;
  tipo: string;
  caminho: string;
  tamanho: number;
}

interface Historia {
  id: number;
  titulo: string;
  autor_artista: string;
  status: string;
  conteudo: string;
  categoria_nome: string;
  nome_usuario: string;
  data_criacao: string;
  arquivos: Arquivo[];
}

interface Props {
  token: string;
  setToken: (token: string | null) => void;
}

type Filtro =
  | "em-analise"
  | "todas"
  | "aprovadas"
  | "rejeitadas"
  | "mais-recentes"
  | "mais-antigas";

const AdminPanel: React.FC<Props> = ({ token, setToken }) => {
  const [historias, setHistorias] = useState<Historia[]>([]);
  const [historiasFiltradas, setHistoriasFiltradas] = useState<Historia[]>([]);
  const [filtroAtivo, setFiltroAtivo] = useState<Filtro>("em-analise");
  const [mensagem, setMensagem] = useState("");
  const [menuAberto, setMenuAberto] = useState(false);

  const carregarHistorias = async () => {
    try {
      const res = await api.get("http://localhost:5000/admin/solicitacoes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const todas = res.data.historias || [];
      console.log("🧩 [DEBUG FRONT] Histórias recebidas:", res.data.historias);

      if (res.data.historias?.length) {
        console.log("📸 [DEBUG FRONT] Primeira história:", res.data.historias[0]);
        if (res.data.historias[0].arquivos) {
          console.log("📂 [DEBUG FRONT] Arquivos da primeira história:", res.data.historias[0].arquivos);
        } else {
          console.warn("⚠️ [DEBUG FRONT] Nenhum campo 'arquivos' encontrado!");
        }
      }
      setHistorias(todas);
      aplicarFiltro(filtroAtivo, todas);
      setMensagem("");
    } catch (err) {
      console.error(err);
      setMensagem("Erro ao carregar histórias.");
    }
  };

  useEffect(() => {
    carregarHistorias();
  }, []);

  const aplicarFiltro = (filtro: Filtro, base?: Historia[]) => {
    const lista = base || historias;
    let filtradas: Historia[] = [];

    switch (filtro) {
      case "todas":
        filtradas = [...lista];
        break;
      case "em-analise":
        filtradas = lista.filter((h) =>
          ["em análise", "pendente"].includes(h.status.toLowerCase())
        );
        break;
      case "aprovadas":
        filtradas = lista.filter(
          (h) => h.status.toLowerCase() === "aprovada"
        );
        break;
      case "rejeitadas":
        filtradas = lista.filter(
          (h) => h.status.toLowerCase() === "rejeitada"
        );
        break;
      case "mais-recentes":
        filtradas = [...lista].sort(
          (a, b) =>
            new Date(b.data_criacao).getTime() -
            new Date(a.data_criacao).getTime()
        );
        break;
      case "mais-antigas":
        filtradas = [...lista].sort(
          (a, b) =>
            new Date(a.data_criacao).getTime() -
            new Date(b.data_criacao).getTime()
        );
        break;
    }

    setFiltroAtivo(filtro);
    setHistoriasFiltradas(filtradas);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return (
    <div className="admin-container">
      <button
        className="menu-toggle"
        onClick={() => setMenuAberto(!menuAberto)}
      >
        ☰
      </button>

      <aside className={`admin-sidebar ${menuAberto ? "aberto" : ""}`}>
        <h3>Filtros</h3>
        <ul>
          <li
            className={filtroAtivo === "em-analise" ? "ativo" : ""}
            onClick={() => aplicarFiltro("em-analise")}
          >
            🟠 Em Análise
          </li>
          <li
            className={filtroAtivo === "todas" ? "ativo" : ""}
            onClick={() => aplicarFiltro("todas")}
          >
            📋 Todas
          </li>
          <li
            className={filtroAtivo === "aprovadas" ? "ativo" : ""}
            onClick={() => aplicarFiltro("aprovadas")}
          >
            🟢 Aprovadas
          </li>
          <li
            className={filtroAtivo === "rejeitadas" ? "ativo" : ""}
            onClick={() => aplicarFiltro("rejeitadas")}
          >
            🔴 Rejeitadas
          </li>
          <hr />
          <li
            className={filtroAtivo === "mais-recentes" ? "ativo" : ""}
            onClick={() => aplicarFiltro("mais-recentes")}
          >
            ⏰ Mais recentes
          </li>
          <li
            className={filtroAtivo === "mais-antigas" ? "ativo" : ""}
            onClick={() => aplicarFiltro("mais-antigas")}
          >
            🕰️ Mais antigas
          </li>
        </ul>
        <button className="logout-btn" onClick={handleLogout}>
          Sair
        </button>
      </aside>

      <main className="admin-main">
        <h2>Painel do Administrador</h2>

        {mensagem && <div className="admin-message">{mensagem}</div>}

        {historiasFiltradas.length === 0 ? (
          <p className="sem-historias">Nenhuma história encontrada.</p>
        ) : (
          <div className="admin-grid">
            {historiasFiltradas.map((h) => {
              const imagemPreview = h.arquivos?.find((a) =>
                a.tipo.startsWith("image/")
              )?.caminho;

              return (
                <div
                  key={h.id}
                  className="admin-card"
                  onClick={() =>
                    (window.location.href = `/admin-card/${h.id}`)
                  }
                >
                  {imagemPreview ? (
                    <img
                      src={`http://localhost:5000/${imagemPreview}`}
                      alt={h.titulo}
                      className="card-thumb"
                    />
                  ) : (
                    <div className="no-thumb">Sem imagem</div>
                  )}

                  <div className="card-body">
                    <h3 className="card-title">{h.titulo}</h3>
                    <p>
                      <strong>Proponente:</strong> {h.nome_usuario}
                    </p>
                    <p>
                      <strong>Data:</strong>{" "}
                      {new Date(h.data_criacao).toLocaleDateString("pt-BR")}
                    </p>
                    <span
                      className={`status-badge ${h.status
                        .replace(" ", "-")
                        .toLowerCase()}`}
                    >
                      {h.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPanel;
