import { useState } from "react";
import Dashboard from "../components/Dashboard";
import Register from "../components/Register";

function RotaRegistro () {
    const [token, setToken] = useState<string | null>(localStorage.getItem("token"));

    return (
      <div>
        {!token && (
          <>
            <h1>Bem-vindo ao Sistema Cultural</h1>
            <Register setToken={setToken} />
          </>
        )}
        {token && <Dashboard token={token} />}
      </div>
    );
};

export default RotaRegistro