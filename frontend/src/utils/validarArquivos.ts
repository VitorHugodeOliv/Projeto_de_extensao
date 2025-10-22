export async function validarArquivos(arquivos: FileList): Promise<boolean> {
  const imagens = Array.from(arquivos).filter((f) =>
    ["image/png", "image/jpeg", "image/jpg", "image/gif"].includes(f.type)
  );
  const videos = Array.from(arquivos).filter((f) => f.type.startsWith("video/"));
  const audios = Array.from(arquivos).filter((f) => f.type.startsWith("audio/"));

  if (imagens.length > 5) {
    alert("Você pode enviar no máximo 5 imagens.");
    return false;
  }
  if (videos.length > 1) {
    alert("Você pode enviar apenas 1 vídeo.");
    return false;
  }
  if (audios.length > 1) {
    alert("Você pode enviar apenas 1 áudio.");
    return false;
  }

  const checarDuracao = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const media = file.type.startsWith("video/") ? document.createElement("video") : document.createElement("audio");
      media.preload = "metadata";
      media.src = url;
      media.onloadedmetadata = () => {
        resolve(media.duration);
        URL.revokeObjectURL(url);
      };
      media.onerror = () => {
        reject(new Error("Erro ao carregar metadados."));
      };
    });
  };

  for (const video of videos) {
    const duracao = await checarDuracao(video);
    if (duracao > 300) {
      alert("O vídeo deve ter no máximo 5 minutos.");
      return false;
    }
  }

  for (const audio of audios) {
    const duracao = await checarDuracao(audio);
    if (duracao > 1260) {
      alert("O áudio deve ter no máximo 21 minutos.");
      return false;
    }
  }

  return true;
}