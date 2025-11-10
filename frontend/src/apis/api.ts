import api from "./apiAxios";
import { API_BASE_URL } from "./config";
import { authStore } from "../store/authStore";

// ======================
//  LOGIN & USUÁRIOS
// ======================

export const apiAuth = {
  login: async (email: string, senha: string) => {
    const res = await api.post("/login", { email, senha });
    return res.data;
  },

  registro: async (dados: {
    nome: string;
    email: string;
    senha: string;
    tipo_usuario?: string;
  }) => {
    const res = await api.post("/register", dados);
    return res.data;
  },

  perfil: async () => {
    const res = await api.get("/perfil");
    return res.data;
  },
};

// ======================
//  HISTÓRIAS
// ======================

export const apiHistorias = {
  listarAprovadas: async () => {
    const res = await api.get("/historias");
    return res.data.filter((h: any) => h.status === "Aprovada");
  },

  criar: async (dados: any) => {
    const res = await api.post("/historias", dados);
    return res.data;
  },
};

// ======================
//  ADMIN
// ======================

export const apiAdmin = {
  listarSolicitacoes: async (page = 1, limit = 6) => {
    const token = authStore.getState().accessToken;
    if (!token) {
      throw new Error("Usuário não autenticado");
    }

    const res = await fetch(
      `${API_BASE_URL}/admin/solicitacoes?page=${page}&limit=${limit}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return res.json();
  },

  aprovarHistoria: async (historiaId: number) => {
    const res = await api.patch("/admin/solicitacoes/aprovar", {
      historia_id: historiaId,
    });
    return res.data;
  },

  rejeitarHistoria: async (historiaId: number, motivo?: string) => {
  const res = await api.patch("/admin/solicitacoes/rejeitar", {
    historia_id: historiaId,
    motivo: motivo?.trim() || "Rejeição sem motivo informado",
  });
  return res.data;
},
};