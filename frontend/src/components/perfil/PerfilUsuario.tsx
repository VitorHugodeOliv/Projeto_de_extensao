import React, { useEffect, useState } from "react";
import api from "../../apis/apiAxios";

interface Usuario {
  id: number;
  nome: string;
  email: string;
  tipo_usuario: string;
}

interface Historia {
  id: number;
  titulo: string;
  status: string;
  data_criacao: string;
}

const PerfilUsuario: React.FC<{ usuario: Usuario }> = ({ usuario }) => {
  const [historias, setHistorias] = useState<Historia[]>([]);

  useEffect(() => {
    const carregarHistorias = async () => {
      const res = await api.get(`/usuarios/${usuario.id}/historias`);
      setHistorias(res.data);
    };
    carregarHistorias();
  }, [usuario.id]);

  return (
    <div className="perfil-usuario">
      <h3>📋 Meus Dados</h3>
      <p><strong>Nome:</strong> {usuario.nome}</p>
      <p><strong>Email:</strong> {usuario.email}</p>
      <hr />

      <h3>📚 Minhas Histórias</h3>
      {historias.length === 0 ? (
        <p>Você ainda não enviou nenhuma história.</p>
      ) : (
        <ul>
          {historias.map((h) => (
            <li key={h.id}>
              <strong>{h.titulo}</strong> — <em>{h.status}</em> ({new Date(h.data_criacao).toLocaleDateString("pt-BR")})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PerfilUsuario;
