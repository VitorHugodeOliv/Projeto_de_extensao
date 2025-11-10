import { useEffect } from "react";
import AdminPainel from "../components/AdminPanel";
import { useNavigate } from "react-router";
import { useAuth } from "../store/authStore";

function RotaAdminPainel() {
  const { accessToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!accessToken) {
      navigate("/login");
    }
  }, [accessToken, navigate]);

  return <div>{accessToken && <AdminPainel />}</div>;
}

export default RotaAdminPainel;