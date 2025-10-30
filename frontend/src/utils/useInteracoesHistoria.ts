import { useState, useEffect } from "react";
import {
  getCurtidas,
  curtirHistoria,
  getComentarios,
  comentarHistoria,
} from "../apis/apiAxios";

const likeSound = new Audio("../assets/sons/like.wav");
const unlikeSound = new Audio("../assets/sons/unlike.wav");
likeSound.volume = 0.4;
unlikeSound.volume = 0.3;

interface Comentario {
  id: number;
  texto: string;
  autor: string;
  data_criacao: string;
}

export function useInteracoesHistoria(id?: number, token?: string | null) {
  const [curtidas, setCurtidas] = useState<Record<number, number>>({});
  const [curtido, setCurtido] = useState<Record<number, boolean>>({});
  const [comentarios, setComentarios] = useState<Record<number, Comentario[]>>({});
  const [novoComentario, setNovoComentario] = useState("");
  const [mensagem, setMensagem] = useState<string | null>(null);

useEffect(() => {
  if (typeof id !== "number" || isNaN(id)) return;

  const carregarInteracoes = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/historias/${id}/curtidas`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();

      setCurtidas((prev) => ({ ...prev, [id]: data.total_curtidas || 0 }));
      setCurtido((prev) => ({ ...prev, [id]: data.usuario_curtiu || false }));

      const listaComentarios = await getComentarios(id);
      setComentarios((prev) => ({ ...prev, [id]: listaComentarios }));

      console.log("💚 Curtidas carregadas:", data);
    } catch (err) {
      console.error("Erro ao carregar curtidas/comentários:", err);
    }
  };

  carregarInteracoes();
}, [id]);

  const handleCurtir = async (historiaId?: number) => {
    const targetId = historiaId ?? id;
    if (typeof targetId !== "number" || isNaN(targetId)) {
      console.warn("ID inválido em handleCurtir:", historiaId, "=>", targetId);
      return;
    }

    if (!token) {
      setMensagem("Faça login para curtir histórias ❤️");
      return;
    }

    try {
      const jaCurtiu = curtido[targetId] ?? false;

      if (jaCurtiu) {
        unlikeSound.currentTime = 0;
        unlikeSound.play();
      } else {
        likeSound.currentTime = 0;
        likeSound.play();
      }

      await curtirHistoria(targetId);

      const total = await getCurtidas(targetId);
      setCurtidas((prev) => ({ ...prev, [targetId]: total }));
      setCurtido((prev) => ({ ...prev, [targetId]: !jaCurtiu }));
    } catch (err) {
      console.error("Erro ao curtir:", err);
    }
  };

  const handleComentar = async (historiaId?: number) => {
    const targetId = historiaId ?? id;
    if (typeof targetId !== "number" || isNaN(targetId)) return;

    if (!token) {
      setMensagem("Faça login para comentar 💬");
      return;
    }
    if (!novoComentario.trim()) return;

    try {
      await comentarHistoria(targetId, novoComentario);
      setNovoComentario("");

      const lista = await getComentarios(targetId);
      setComentarios((prev) => ({ ...prev, [targetId]: lista }));
    } catch (err) {
      console.error("Erro ao comentar:", err);
    }
  };

  return {
    curtidas,
    curtido,
    comentarios,
    novoComentario,
    mensagem,
    setMensagem,
    setNovoComentario,
    setCurtido,
    handleCurtir,
    handleComentar,
  };
}
