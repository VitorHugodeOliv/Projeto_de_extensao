import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000",
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      error.response.data.message === "Token expirado" &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          console.warn("Sem refresh token disponível, usuário deve logar novamente.");
          throw new Error("Sem refresh token");
        }

        const res = await axios.post("http://localhost:5000/refresh", {
          refresh_token: refreshToken,
        });

        const newAccessToken = res.data.access_token;

        localStorage.setItem("token", newAccessToken);
        api.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;

        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error("Erro ao renovar token:", refreshError);
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export const curtirHistoria = async (historiaId: number) => {
  return api.post(`/historias/${historiaId}/curtir`);
};

export const getCurtidas = async (historiaId: number) => {
  const res = await api.get(`/historias/${historiaId}/curtidas`);
  return res.data.total_curtidas as number;
};

export const comentarHistoria = async (historiaId: number, texto: string) => {
  return api.post(`/historias/${historiaId}/comentarios`, { texto });
};

export const getComentarios = async (historiaId: number) => {
  const res = await api.get(`/historias/${historiaId}/comentarios`);
  return res.data as { id: number; texto: string; autor: string; data_criacao: string }[];
};

export default api;
