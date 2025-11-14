import { useEffect } from "react";
import { useNavigate } from "react-router";
import AdminCard from "@features/admin/components/AdminCard";
import { useAuth } from "@lib/store/auth-store";

function AdminStoryDetailsPage() {
  const { accessToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!accessToken) {
      navigate("/login");
    }
  }, [accessToken, navigate]);

  return <div>{accessToken && <AdminCard />}</div>;
}

export default AdminStoryDetailsPage;