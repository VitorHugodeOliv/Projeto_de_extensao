import React from "react";
import "../components/css/cssHistoryRegister.css";

interface Props {
  midias: FileList | null;
  removerArquivo: (index: number) => void;
}

const PreviewMidias: React.FC<Props> = ({ midias, removerArquivo }) => {
  if (!midias || midias.length === 0) return null;

  const arquivos = Array.from(midias);
  const imagens = arquivos.filter((f) => f.type.startsWith("image/"));
  const videos = arquivos.filter((f) => f.type.startsWith("video/"));
  const audios = arquivos.filter((f) => f.type.startsWith("audio/"));

  return (
    <div className="preview-container">
      {imagens.length > 0 && (
        <div>
          <h4>Imagens:</h4>
          <div className="preview-grid">
            {imagens.map((file, i) => (
              <div key={i} className="preview-item">
                <img src={URL.createObjectURL(file)} alt={file.name} />
                <p>{file.name}</p>
                <button
                  type="button"
                  className="remove-btn"
                  onClick={() => removerArquivo(arquivos.indexOf(file))}
                >
                  Remover
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {videos.length > 0 && (
        <div>
          <h4>Vídeo:</h4>
          {videos.map((file, i) => (
            <div key={i} className="preview-item">
              <video src={URL.createObjectURL(file)} width="200" controls />
              <p>{file.name}</p>
              <button
                type="button"
                className="remove-btn"
                onClick={() => removerArquivo(arquivos.indexOf(file))}
              >
                Remover
              </button>
            </div>
          ))}
        </div>
      )}

      {audios.length > 0 && (
        <div>
          <h4>Áudio:</h4>
          {audios.map((file, i) => (
            <div key={i} className="preview-item">
              <audio src={URL.createObjectURL(file)} controls />
              <p>{file.name}</p>
              <button
                type="button"
                className="remove-btn"
                onClick={() => removerArquivo(arquivos.indexOf(file))}
              >
                Remover
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PreviewMidias;
