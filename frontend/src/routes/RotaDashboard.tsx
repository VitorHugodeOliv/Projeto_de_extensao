import { useEffect } from "react";
import Dashboard from "../components/Dashboard";
import { useNavigate } from "react-router";
import { useAuth } from "../store/authStore";

function RotaDashboard() {
  const { accessToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!accessToken) {
      navigate("/login");
    }
  }, [accessToken, navigate]);

  return <div>{accessToken && <Dashboard />}</div>;
}

export default RotaDashboard;