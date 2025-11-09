import axios from "axios";
import type { AxiosProgressEvent } from "axios";

export const uploadMidias = async (
  historiaId: number,
  arquivos: FileList,
  onProgress: (percent: number) => void,
  token?: string
) => {
  const formData = new FormData();
  for (let i = 0; i < arquivos.length; i++) {
    formData.append("arquivos", arquivos[i]);
  }
  formData.append("historia_id", String(historiaId));

  const controller = new AbortController();

  const res = await axios.post("http://localhost:5000/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    signal: controller.signal,
    onUploadProgress: (evt: AxiosProgressEvent) => {
      if (evt.total) {
        const percent = Math.round((evt.loaded * 100) / evt.total);
        onProgress(percent);
      }
    },
  });

  return {
    data: res.data,
    abort: () => controller.abort(),
  };
};
