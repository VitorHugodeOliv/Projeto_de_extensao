import { useEffect } from "react";
import { useNavigate } from "react-router";
import AdminPanel from "@features/admin/components/AdminPanel";
import { useAuth } from "@lib/store/auth-store";

function AdminPanelPage() {
  const { accessToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!accessToken) {
      navigate("/login");
    }
  }, [accessToken, navigate]);

  return <div>{accessToken && <AdminPanel />}</div>;
}

export default AdminPanelPage;