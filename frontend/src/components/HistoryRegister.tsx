import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import "./css/cssHistoryRegister.css";

interface Props {
  token: string;
  setToken: (token: string | null) => void;
}

interface Categoria {
  id: number;
  nome: string;
}

const HistoryRegister: React.FC<Props> = ({ token, setToken }) => {
  const [titulo, setTitulo] = useState("");
  const [autorArtista, setAutorArtista] = useState("");
  const [categoriaId, setCategoriaId] = useState<number | undefined>();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [status, setStatus] = useState("Em análise");
  const [conteudo, setConteudo] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [midias, setMidias] = useState<FileList | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const res = await axios.get("http://localhost:5000/categorias");
        setCategorias(res.data);
      } catch (err) {
        console.error("Erro ao buscar categorias:", err);
      }
    };
    fetchCategorias();
  }, []);

  const handleSubmit = async () => {
    if (!titulo.trim()) {
      alert("O campo 'Título' é obrigatório!");
      return;
    }

    if (!categoriaId) {
      alert("Selecione uma categoria antes de enviar!");
      return;
    }

    try {
      const historiaRes = await axios.post(
        "http://localhost:5000/historias",
        {
          titulo,
          autor_artista: autorArtista || null,
          categoria_id: categoriaId,
          status,
          conteudo: conteudo || null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const historiaId = historiaRes.data.id;

      if (midias && midias.length > 0) {
        const formData = new FormData();

        for (let i = 0; i < midias.length; i++) {
          formData.append("arquivos", midias[i]);
        }

        formData.append("historia_id", historiaId);
        
        await axios.post("http://localhost:5000/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });
      }
      
      alert("História e mídias enviadas com sucesso!");
      setMensagem("História e mídias enviadas com sucesso!");
      setTitulo("");
      setAutorArtista("");
      setCategoriaId(undefined);
      setConteudo("");
      setStatus("Em análise");
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response) {
        setMensagem(err.response.data.message);
      } else {
        setMensagem("Erro desconhecido ao enviar história.");
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    navigate("/login");
  };

  return (
    <div>
      <h2>Enviar História</h2>

      <div>
        <label>Título:</label>
        <input
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          required
        />

        <label>Autor/Artista:</label>
        <input
          type="text"
          value={autorArtista}
          onChange={(e) => setAutorArtista(e.target.value)}
        />
        <label>Categoria:</label>
        <select
          value={categoriaId ?? ""}
          onChange={(e) => setCategoriaId(Number(e.target.value))}
          required
        >
          <option value="">Selecione uma categoria</option>
          {categorias.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.nome}
            </option>
          ))}
        </select>

        <label>Conteúdo:</label>
        <textarea
          value={conteudo}
          onChange={(e) => setConteudo(e.target.value)}
        />

        <label>Mídias (fotos, vídeos, áudios):</label>
        <input
          type="file"
          multiple
          accept="image/*,video/*,audio/*"
          onChange={(e) => setMidias(e.target.files)}
        />

        <button onClick={handleSubmit}>Enviar História</button>
        <button onClick={handleLogout}>Sair</button>
      </div>

      {mensagem && <p>{mensagem}</p>}
    </div>
  );
};

export default HistoryRegister;
