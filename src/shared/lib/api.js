import axios from "axios";
import {toast} from "../components/toast/CenterToast";
import {TOAST_MESSAGES} from "../constants/toastMessages";
import {
  getAccessToken,
  getRefreshToken,
  saveAccessToken,
  saveRefreshToken,
  deleteTokens,
} from "./storage/tokenStorage";

const baseURL =
  process.env.EXPO_PUBLIC_BACKEND_URL_DEV ??
  process.env.EXPO_PUBLIC_BACKEND_URL_PROD;

const api = axios.create({
  baseURL,
  timeout: 10000,
});

/* =========================
 * Request Interceptor
 * ========================= */
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
  (error) => Promise.reject(error),
);

/* =========================
 * Response Interceptor (Token Refresh)
 * ========================= */
api.interceptors.response.use(
    (res) => res,
    async (error) => {
        const originalRequest = error.config;

        if (originalRequest?.url?.includes("/api/users/token/refresh")) {
            await deleteTokens();
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = await getRefreshToken();
            if (!refreshToken) {
                await deleteTokens();
                return Promise.reject(error);
            }

            try {
                const { data } = await api.post(
                    "/api/users/token/refresh",
                    { refreshToken },
                    { meta: { skipErrorToast: true } }
                );

                await saveAccessToken(data.accessToken);
                await saveRefreshToken(data.refreshToken);

                originalRequest.headers = {
                    ...(originalRequest.headers || {}),
                    Authorization: `Bearer ${data.accessToken}`,
                };

                return api(originalRequest);
            } catch (e) {
                await deleteTokens();
                return Promise.reject(e);
            }
        }

        // 이하 toast 로직은 그대로
        const method = error?.config?.method?.toLowerCase();
        const skipErrorToast = Boolean(error?.config?.meta?.skipErrorToast);

        if (!skipErrorToast) {
            if (method === "get") toast.show(TOAST_MESSAGES.GET_ERROR, { position: "center" });
            else if (["post", "put", "patch", "delete"].includes(method)) {
                toast.show(TOAST_MESSAGES.MUTATION_ERROR, { position: "center" });
            }
        }

        return Promise.reject(error);
    }
);


export default api;
