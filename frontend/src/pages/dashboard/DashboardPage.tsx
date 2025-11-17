import { useEffect } from "react";
import { useNavigate } from "react-router";
import Dashboard from "@features/dashboard/components/Dashboard";
import { useAuth } from "@lib/store/auth-store";

function DashboardPage() {
  const { accessToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!accessToken) {
      navigate("/login");
    }
  }, [accessToken, navigate]);

  return <div>{accessToken && <Dashboard />}</div>;
}

export default DashboardPage;