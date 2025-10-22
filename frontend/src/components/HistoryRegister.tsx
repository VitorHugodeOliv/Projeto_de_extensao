import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import { validarArquivos } from "../utils/validarArquivos"
import PreviewMidias from "./PreviewMidias";
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
  const [sucesso, setSucesso] = useState(false);

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

  const handleMidiaChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const arquivos = e.target.files;
    if (!arquivos) return;

    const todos = new DataTransfer();
    if (midias) {
      for (let i = 0; i < midias.length; i++) todos.items.add(midias[i]);
    }
    for (let i = 0; i < arquivos.length; i++) todos.items.add(arquivos[i]);

    const novaLista = todos.files;
    const validos = await validarArquivos(novaLista);
    if (!validos) {
      e.target.value = "";
      return;
    }

    setMidias(novaLista);
    e.target.value = "";
  };

  const removerArquivo = (index: number) => {
    if (!midias) return;
    const data = new DataTransfer();
    Array.from(midias).forEach((file, i) => {
      if (i !== index) data.items.add(file);
    });
    setMidias(data.files);
  };

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
      
      setSucesso(true);
      setMensagem("História e mídias enviadas com sucesso!");
      setTitulo("");
      setAutorArtista("");
      setCategoriaId(undefined);
      setConteudo("");
      setMidias(null)

      setTimeout(() => {
        setSucesso(false);
        setMensagem("");
      }, 4000);
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
  <div className="history-register">
    <h2>Enviar História</h2>
    
    {sucesso && (
      <div className="mensagem-sucesso">
        ✅ História e mídias enviadas com sucesso!
      </div>
    )}

    <div className="history-form">
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
      <textarea value={conteudo} onChange={(e) => setConteudo(e.target.value)} />

      <label>Mídias (fotos, vídeos, áudios):</label>
      <input
        type="file"
        multiple
        accept=".png,.jpg,.jpeg,.gif,.mp4,.mp3,.wav"
        onChange={handleMidiaChange}
      />
      <small>
        <ul>
          <li>Até 5 imagens (.png, .jpg, .jpeg, .gif)</li>
          <li>1 vídeo (.mp4) de até 5 minutos</li>
          <li>1 áudio (.mp3 ou .wav) de até 21 minutos</li>
        </ul>
      </small>

      <PreviewMidias midias={midias} removerArquivo={removerArquivo} />

      <button onClick={handleSubmit}>Enviar História</button>
      <button onClick={handleLogout}>Sair</button>
    </div>

    {mensagem && <p className="mensagem">{mensagem}</p>}
  </div>
);

};

export default HistoryRegister;
