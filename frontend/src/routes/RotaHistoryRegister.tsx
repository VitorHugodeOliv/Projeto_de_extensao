import { useEffect, useState } from "react";
import HistoryRegister from "../components/HistoryRegister";
import { useNavigate } from "react-router";

function RotaHistoryRegister () {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));

  const navigate = useNavigate()
  
  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);
  
    return (
        <div>
            {token && <HistoryRegister token={token} setToken={setToken} />}
        </div>
    )
}

export default RotaHistoryRegister;