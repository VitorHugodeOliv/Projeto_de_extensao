import { useEffect } from "react";
import Register from "../components/Register";
import { useNavigate } from "react-router";
import { useAuth } from "../store/authStore";

function RotaRegistro() {
  const { accessToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (accessToken) {
      navigate("/dashboard");
    }
  }, [accessToken, navigate]);

  return <div>{!accessToken && <Register />}</div>;
}

export default RotaRegistro;