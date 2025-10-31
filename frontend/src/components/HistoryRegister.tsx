import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import PreviewMidias from "../utils/PreviewMidias";
import { validarArquivos } from "../utils/validarArquivos";
import { apiHistorias } from "../apis/api";
import api from "../apis/apiAxios";
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
  const [subtitulo, setSubtitulo] = useState("");
  const [autorArtista, setAutorArtista] = useState("");
  const [categoriaId, setCategoriaId] = useState<number | undefined>();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [status, setStatus] = useState("Em análise");
  const [conteudo, setConteudo] = useState("");
  const [midias, setMidias] = useState<FileList | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/login");
      setTimeout(() => {
        toast.error("Você precisa estar logado para enviar uma história.");
      }, 300);
    }
  }, [token, navigate]);

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const res = await api.get("/categorias");
        setCategorias(res.data);
      } catch (err) {
        console.error("Erro ao buscar categorias:", err);
        toast.error("Erro ao carregar categorias. Tente novamente mais tarde.");
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
      toast.warning("Alguns arquivos não atendem aos critérios de envio.");
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
    toast.info("Arquivo removido da lista.");
  };

  const handleSubmit = async () => {
    if (!titulo.trim()) {
      toast.warning("O campo 'Título' é obrigatório!");
      return;
    }
    if (!categoriaId) {
      toast.warning("Selecione uma categoria antes de enviar!");
      return;
    }
    if (conteudo.trim().length < 20) {
      toast.warning("O campo 'Conteúdo' deve ter no mínimo 20 caracteres.");
      return;
    }
    if (!midias || midias.length === 0) {
      toast.warning("Envie pelo menos uma mídia (imagem, vídeo ou áudio).");
      return;
    }

    try {
      const historiaRes = await apiHistorias.criar({
        titulo,
        subtitulo,
        autor_artista: autorArtista || null,
        categoria_id: categoriaId,
        status,
        conteudo: conteudo || null,
      });

      const historiaId = historiaRes.id;

      if (midias && midias.length > 0) {
        setIsUploading(true);
        setUploadProgress(0);

        await apiHistorias.uploadMidias(historiaId, midias);

        setIsUploading(false);
        setUploadProgress(100);
      }

      toast.success("História e mídias enviadas com sucesso! 🎉");

      setTitulo("");
      setSubtitulo("");
      setAutorArtista("");
      setCategoriaId(undefined);
      setConteudo("");
      setMidias(null);
      setStatus("Em análise");
      setUploadProgress(0);

    } catch (err: unknown) {
      setIsUploading(false);
      setUploadProgress(0);

      if (axios.isAxiosError(err) && err.response) {
        const msg = err.response.data.message || "Erro ao enviar história.";
        toast.error(msg);
      } else {
        toast.error("Erro desconhecido ao enviar história.");
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    toast.info("Sessão encerrada. Até logo!");
    navigate("/login");
  };

  return (
    <div className="history-register">
      <h2>Enviar História</h2>

      <div className="history-form">
        <label>Título:</label>
        <input
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          required
        />

        <label>Subtítulo:</label>
        <input
          type="text"
          value={subtitulo}
          onChange={(e) => setSubtitulo(e.target.value)}
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

        {isUploading && (
          <div className="upload-progress">
            <div
              className="progress-bar"
              style={{ width: `${uploadProgress}%` }}
            ></div>
            <p>{uploadProgress}%</p>
          </div>
        )}

        <button onClick={handleSubmit} disabled={isUploading}>
          {isUploading ? "Enviando..." : "Enviar História"}
        </button>

        <button onClick={handleLogout}>Sair</button>
      </div>
    </div>
  );
};

export default HistoryRegister;
