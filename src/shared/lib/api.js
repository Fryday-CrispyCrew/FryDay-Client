import axios from "axios";
import { toast } from "../components/toast/CenterToast";
import { TOAST_MESSAGES } from "../constants/toastMessages";
import {
    getAccessToken,
    getRefreshToken,
    saveAccessToken,
    saveRefreshToken,
    deleteTokens,
} from "./storage/tokenStorage";
import Constants from "expo-constants";

const baseURL =
    Constants.expoConfig?.extra?.backendUrl ??
    process.env.EXPO_PUBLIC_BACKEND_URL;

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
    (error) => Promise.reject(error)
);

/* =========================
 * Response Interceptor (Token Refresh)
 * ========================= */
api.interceptors.response.use(
    (res) => res,
    async (error) => {
        const originalRequest = error.config;

        // refresh 요청 자체에서 실패 → 로그아웃 처리
        if (originalRequest?.url?.includes("/api/users/token/refresh")) {
            await deleteTokens();
            return Promise.reject(error);
        }

        // accessToken 만료 → refresh 시도
        if (
            error.response?.status === 401 &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;

            const refreshToken = await getRefreshToken();
            if (!refreshToken) {
                await deleteTokens();
                return Promise.reject(error);
            }

            try {
                const { data } = await axios.post(
                    "/api/users/token/refresh",
                    { refreshToken },
                    { baseURL: api.defaults.baseURL }
                );

                await saveAccessToken(data.accessToken);
                await saveRefreshToken(data.refreshToken);

                originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
                return api(originalRequest);
            } catch (e) {
                await deleteTokens();
                return Promise.reject(e);
            }
        }

        const method = error?.config?.method?.toLowerCase();
        const skipErrorToast = Boolean(error?.config?.meta?.skipErrorToast);

        if (!skipErrorToast) {
            if (method === "get") {
                toast.show(TOAST_MESSAGES.GET_ERROR, { position: "center" });
            } else if (["post", "put", "patch", "delete"].includes(method)) {
                toast.show(TOAST_MESSAGES.MUTATION_ERROR, { position: "center" });
            }
        }

        return Promise.reject(error);
    }
);

export default api;
