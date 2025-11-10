import { useEffect } from "react";
import Login from "../components/Login";
import { useNavigate } from "react-router";
import { useAuth } from "../store/authStore";

function RotaLogin() {
  const { accessToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (accessToken) {
      navigate("/dashboard");
    }
  }, [accessToken, navigate]);

  return <div>{!accessToken && <Login />}</div>;
}

export default RotaLogin;