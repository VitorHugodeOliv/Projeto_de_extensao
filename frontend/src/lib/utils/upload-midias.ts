import axios from "axios";
import type { AxiosProgressEvent } from "axios";
import { API_BASE_URL } from "../config/api-config";
import { authStore } from "../store/auth-store";

export const uploadMidias = async (
  historiaId: number,
  arquivos: FileList,
  onProgress: (percent: number) => void
) => {
  const formData = new FormData();
  for (let i = 0; i < arquivos.length; i++) {
    formData.append("arquivos", arquivos[i]);
  }
  formData.append("historia_id", String(historiaId));

  const controller = new AbortController();
  const token = authStore.getState().accessToken;

  const res = await axios.post(`${API_BASE_URL}/upload`, formData, {
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
