import React, { useEffect, useState } from "react";
import axios from "axios";

interface Props {
  token: string;
}

const Dashboard: React.FC<Props> = ({ token }) => {
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axios.get("http://localhost:5000/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMensagem(res.data.message);
      } catch (err: unknown) {
        if (axios.isAxiosError(err) && err.response) {
          setMensagem(err.response.data.message);
        } else {
          setMensagem("Erro desconhecido");
        }
      }
    };
    fetchDashboard();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  return (
    <div>
      <h2>Dashboard</h2>
      <p>{mensagem}</p>
      <button onClick={handleLogout}>Sair</button>
    </div>
  );
};

export default Dashboard;
