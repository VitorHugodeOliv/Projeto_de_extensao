import { useEffect, useState } from "react";
import Perfil from "../components/Perfil";
import { useNavigate } from "react-router";

function RotaPerfil() {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  return (
    <div>
      {token && <Perfil token={token} setToken={setToken} />}
    </div>
  );
}

export default RotaPerfil;
