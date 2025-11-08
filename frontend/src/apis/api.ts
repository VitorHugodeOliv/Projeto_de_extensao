import api from "./apiAxios";

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

  uploadMidias: async (historiaId: number, arquivos: FileList) => {
    const formData = new FormData();
    for (let i = 0; i < arquivos.length; i++) {
      formData.append("arquivos", arquivos[i]);
    }
    formData.append("historia_id", String(historiaId));

    const res = await api.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
};

// ======================
//  ADMIN
// ======================

export const apiAdmin = {
  listarSolicitacoes: async (page = 1, limit = 6) => {
    const res = await fetch(`http://localhost:5000/admin/solicitacoes?page=${page}&limit=${limit}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
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