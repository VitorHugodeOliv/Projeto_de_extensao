import React, { useEffect, useState } from "react";
import axios from "axios";
import api from "../apis/apiAxios"
import { useNavigate } from "react-router";

interface Props {
  token: string;
  setToken: (token: string | null) => void;
}

const Dashboard: React.FC<Props> = ({ token, setToken }) => {
  const [mensagem, setMensagem] = useState("");

  const navigate = useNavigate()

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get("http://localhost:5000/dashboard", {
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
    setToken(null);
    setTimeout(() => navigate("/login"), 50);
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
