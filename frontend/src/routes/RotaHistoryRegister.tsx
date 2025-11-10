import { useEffect } from "react";
import HistoryRegister from "../components/HistoryRegister";
import { useNavigate } from "react-router";
import { useAuth } from "../store/authStore";

function RotaHistoryRegister() {
  const { accessToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!accessToken) {
      navigate("/login");
    }
  }, [accessToken, navigate]);

  return <div>{accessToken && <HistoryRegister />}</div>;
}

export default RotaHistoryRegister;