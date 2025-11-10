import axios from "axios";
import { authStore } from "../store/authStore";
import { API_BASE_URL } from "./config";

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = authStore.getState().accessToken;
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
        const newAccessToken = await authStore.refreshTokens();
        if (!newAccessToken) {
          throw new Error("Sem token de acesso");
        }

        api.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error("Erro ao renovar token:", refreshError);
        authStore.logout();
        window.location.href = "/login";
      }
    }

    if (error.response?.status === 401) {
      authStore.logout();
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
