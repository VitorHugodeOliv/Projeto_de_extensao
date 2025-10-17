import { useEffect, useState } from "react";
import Login from "../components/Login";
import { useNavigate } from "react-router";


function RotaLogin () {
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
          <Login setToken={setToken} />
        </>
      )}
    </div>
  );
};

export default RotaLogin