import { type PropsWithChildren, useEffect } from "react";
import { apiAuth } from "@lib/api/api";
import { authStore, useAuth } from "@lib/store/auth-store";

const AuthProvider = ({ children }: PropsWithChildren) => {
  const { accessToken, user } = useAuth();

  useEffect(() => {
    let active = true;

    const fetchProfile = async () => {
      if (!accessToken || user || !active) return;

      try {
        const profile = await apiAuth.perfil();
        if (active) {
          authStore.setUser(profile);
        }
      } catch (error) {
        console.error("Erro ao carregar perfil do usuário:", error);
        if (active) {
          authStore.logout();
        }
      }
    };

    fetchProfile();

    return () => {
      active = false;
    };
  }, [accessToken, user]);

  return children;
};

export default AuthProvider;
