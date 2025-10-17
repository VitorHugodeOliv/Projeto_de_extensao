import { useEffect, useState } from "react";
import Register from "../components/Register";
import { useNavigate } from "react-router";

function RotaRegistro () {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));

  const navigate = useNavigate()

  useEffect(() => {
    if (token) {
      navigate("/dashboard")
    }
  })

  return (
    <div>
      {!token && (
        <>
          <h1>Bem-vindo ao Sistema Cultural</h1>
          <Register setToken={setToken} />
        </>
      )}
    </div>
  );
};

export default RotaRegistro