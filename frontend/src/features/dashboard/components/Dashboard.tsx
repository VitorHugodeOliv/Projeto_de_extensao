import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import HistoricoCurtidas from "./HistoricoCurtidas";
import HistoricoUsuario from "./HistoricoUsuario";
import LogsAdmin from "./LogsAdmin";
import PainelAdmin from "./PainelAdmin";
import PerfilUsuario from "./PerfilUsuario";
import api from "@lib/api/api-axios";
import { useAuth } from "@lib/store/auth-store";
import "../styles/dashboard.css";

const Dashboard: React.FC = () => {
  const [abaAtiva, setAbaAtiva] = useState<string>("perfil");
  const [usuario, setUsuario] = useState<any>(null);
  const [menuAberto, setMenuAberto] = useState(false);
  const navigate = useNavigate();
  const { accessToken } = useAuth();

  useEffect(() => {
    if (!accessToken) {
      navigate("/login");
      return;
    }

    const fetchDados = async () => {
      try {
        const res = await api.get("/dashboard");
        setUsuario(res.data);
      } catch (err) {
        console.error("Erro ao carregar dashboard:", err);
        toast.error("Erro ao carregar dados do usuário 😕");
      }
    };

    fetchDados();
  }, [accessToken, navigate]);

  const renderConteudo = () => {
    switch (abaAtiva) {
      case "perfil":
        return <PerfilUsuario />;
      case "historico":
        return <HistoricoUsuario />;
      case "curtidas":
        return <HistoricoCurtidas usuarioId={usuario.user_id} />;
      case "config":
        return <p>⚙️ Configurações de conta e preferências (em breve).</p>;
      case "logs":
        return usuario?.tipo_usuario === "admin" ? (
          <LogsAdmin />
        ) : (
          <p>Acesso restrito aos administradores 🚫</p>
        );
      case "graficos":
        return usuario?.tipo_usuario === "admin" ? (
          <PainelAdmin />
        ) : (
          <p>Acesso restrito aos administradores 🚫</p>
        );
      default:
        return <p>Selecione uma opção no menu.</p>;
    }
  };

  if (!usuario) return <p>Carregando informações...</p>;

  return (
    <div className="dashboard-container">
      <button
        className="btn-hamburguer"
        onClick={() => setMenuAberto(!menuAberto)}
      >
        ☰
      </button>

      <aside className={`sidebar ${menuAberto ? "aberta" : ""}`}>
        <h2 className="sidebar-title">Painel do Usuário</h2>
        <p className="sidebar-user">
          Olá, {usuario.message.split(",")[1].replace("!", "")} 👋
        </p>

        <nav className="sidebar-menu">
          <button
            className={abaAtiva === "perfil" ? "ativo" : ""}
            onClick={() => {
              setAbaAtiva("perfil");
              setMenuAberto(false);
            }}
          >
            👤 Perfil
          </button>

          <button
            className={abaAtiva === "historico" ? "ativo" : ""}
            onClick={() => {
              setAbaAtiva("historico");
              setMenuAberto(false);
            }}
          >
            📚 Histórico
          </button>

          <button
            className={abaAtiva === "curtidas" ? "ativo" : ""}
            onClick={() => {
              setAbaAtiva("curtidas");
              setMenuAberto(false);
            }}
          >
            💚 Curtidas
          </button>

          <button
            className={abaAtiva === "config" ? "ativo" : ""}
            onClick={() => {
              setAbaAtiva("config");
              setMenuAberto(false);
            }}
          >
            ⚙️ Configurações
          </button>
         {usuario?.tipo_usuario === "admin" && (
           <>
              <button
                className={abaAtiva === "graficos" ? "ativo" : ""}
                onClick={() => {
                  setAbaAtiva("graficos");
                  setMenuAberto(false);
                }}
              >
                📊 Gráficos
              </button>

              <button
                className={abaAtiva === "logs" ? "ativo" : ""}
                onClick={() => {
                setAbaAtiva("logs");
                setMenuAberto(false);
              }}
              >
                🧾 Logs do Sistema
              </button>
           </>
          )}
        </nav>
      </aside>
      <main className="dashboard-conteudo">{renderConteudo()}</main>
    </div>
  );
};

export default Dashboard;
