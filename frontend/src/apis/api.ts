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
  listarSolicitacoes: async () => {
    const res = await api.get("/admin/solicitacoes");
    return res.data;
  },

  aprovarHistoria: async (id: number) => {
    const res = await api.patch(`/admin/solicitacoes/${id}`, { status: "Aprovada" });
    return res.data;
  },

  rejeitarHistoria: async (id: number, motivo: string) => {
    const res = await api.delete(`/admin/solicitacoes/${id}`, {
      data: { motivo },
    });
    return res.data;
  },
};
