import { useEffect } from "react";
import AdminCard from "../components/AdminCard";
import { useNavigate } from "react-router";
import { useAuth } from "../store/authStore";

function RotaAdminCard() {
  const { accessToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!accessToken) {
      navigate("/login");
    }
  }, [accessToken, navigate]);

  return <div>{accessToken && <AdminCard />}</div>;
}

export default RotaAdminCard;