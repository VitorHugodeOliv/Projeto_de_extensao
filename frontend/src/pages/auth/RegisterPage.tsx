import { useEffect } from "react";
import { useNavigate } from "react-router";
import Register from "@features/auth/components/Register";
import { useAuth } from "@lib/store/auth-store";

function RegisterPage() {
  const { accessToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (accessToken) {
      navigate("/dashboard");
    }
  }, [accessToken, navigate]);

  return <div>{!accessToken && <Register />}</div>;
}

export default RegisterPage;