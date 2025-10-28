import { useEffect, useState } from "react";
import AdminCard from "../components/AdminCard";
import { useNavigate } from "react-router";


function RotaAdminCard () {
  const [token] = useState<string | null>(localStorage.getItem("token"));
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  return <div>{token && <AdminCard token={token} />}</div>;
}

export default RotaAdminCard;