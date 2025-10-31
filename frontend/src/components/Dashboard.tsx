import React, { useEffect, useState } from "react";
import api from "../apis/apiAxios";
import { toast } from "react-toastify";
import PerfilUsuario from "./perfil/PerfilUsuario";
import PainelAdmin from "./perfil/PainelAdmin";

interface Usuario {
  id: number;
  nome: string;
  email: string;
  tipo_usuario: string;
}

const Dashboard: React.FC = () => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const res = await api.get("/perfil");
        setUsuario(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Erro ao carregar dados do usuário");
      } finally {
        setCarregando(false);
      }
    };
    fetchPerfil();
  }, []);

  if (carregando) return <p>Carregando painel...</p>;
  if (!usuario) return <p>Usuário não encontrado.</p>;

  return (
    <div className="dashboard-container">
      <h2>Bem-vindo, {usuario.nome}</h2>

      {usuario.tipo_usuario === "admin" ? (
        <PainelAdmin usuario={usuario} />
      ) : (
        <PerfilUsuario usuario={usuario} />
      )}
    </div>
  );
};

export default Dashboard;
