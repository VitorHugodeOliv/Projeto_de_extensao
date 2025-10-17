import { useState } from "react";
import Login from "../components/Login";
import Dashboard from "../components/Dashboard";


function RotaLogin () {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));

  return (
    <div>
      {!token && (
        <>
          <h1>Bem-vindo ao Sistema Cultural</h1>
          <Login setToken={setToken} />
        </>
      )}
      {token && <Dashboard token={token} />}
    </div>
  );
};

export default RotaLogin