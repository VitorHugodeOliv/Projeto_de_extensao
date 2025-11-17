import { useEffect } from "react";
import { useNavigate } from "react-router";
import Login from "@features/auth/components/Login";
import { useAuth } from "@lib/store/auth-store";

function LoginPage() {
  const { accessToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (accessToken) {
      navigate("/dashboard");
    }
  }, [accessToken, navigate]);

  return <div>{!accessToken && <Login />}</div>;
}

export default LoginPage;