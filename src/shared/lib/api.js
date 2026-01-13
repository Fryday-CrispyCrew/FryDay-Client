// src/shared/lib/api.js
import axios from "axios";
import {toast} from "../components/toast/CenterToast";
import {TOAST_MESSAGES} from "../constants/toastMessages";
import {getAccessToken} from "./storage/tokenStorage";

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 10000,
});

api.interceptors.request.use(
  async (config) => {
    const accessToken = await getAccessToken();

    if (accessToken) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${accessToken}`,
      };
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const method = error?.config?.method?.toLowerCase();

    // ✅ 특정 요청은 토스트 스킵
    const skipErrorToast = Boolean(error?.config?.meta?.skipErrorToast);
    if (skipErrorToast) {
      return Promise.reject(error);
    }

    if (method === "get") {
      toast.show(TOAST_MESSAGES.GET_ERROR, {position: "center"});
    } else if (["post", "put", "patch", "delete"].includes(method)) {
      toast.show(TOAST_MESSAGES.MUTATION_ERROR, {position: "center"});
    }

    return Promise.reject(error);
  }
);

export default api;
