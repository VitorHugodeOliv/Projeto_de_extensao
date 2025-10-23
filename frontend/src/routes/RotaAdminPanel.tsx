import { useEffect, useState } from "react";
import AdminPainel from "../components/AdminPanel";
import { useNavigate } from "react-router";


function RotaDashboard () {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));

  const navigate = useNavigate()
  
  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

    return (
        <div>
          {token && <AdminPainel token={token} setToken={setToken} />}
        </div>
    );

};

export default RotaDashboard;