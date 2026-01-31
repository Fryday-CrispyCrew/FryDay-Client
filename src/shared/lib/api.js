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
 * 동시 401 시 refresh 한 번만 실행, 나머지는 그 결과를 기다린 뒤 재시도
 * ========================= */
let refreshPromise = null;

function executeRefresh() {
  const p = (async () => {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) {
      await deleteTokens();
      throw new Error("No refresh token");
    }
    const {data} = await api.post(
      "/api/users/token/refresh",
      {refreshToken},
      {meta: {skipErrorToast: true}},
    );
    await saveAccessToken(data.accessToken);
    await saveRefreshToken(data.refreshToken);
    return data.accessToken;
  })().finally(() => {
    refreshPromise = null;
  });
  refreshPromise = p;
  return p;
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (originalRequest?.url?.includes("/api/users/token/refresh")) {
      await deleteTokens();
      error.isSessionExpired = true;
      return Promise.reject(error);
    }

    if (error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;

      let newAccessToken;
      try {
        if (refreshPromise) {
          newAccessToken = await refreshPromise;
        } else {
          newAccessToken = await executeRefresh();
        }
      } catch (e) {
        await deleteTokens();
        e.isSessionExpired = true;
        return Promise.reject(e);
      }

      originalRequest.headers = {
        ...(originalRequest.headers || {}),
        Authorization: `Bearer ${newAccessToken}`,
      };
      return api(originalRequest);
    }

    // 이하 toast 로직: 재시도(GET) 실패·세션 만료 시 일반 API 토스트 생략
    const method = error?.config?.method?.toLowerCase();
    const skipErrorToast = Boolean(error?.config?.meta?.skipErrorToast);
    const isRetryRequest = Boolean(originalRequest?._retry);
    const isSessionExpired = Boolean(error?.isSessionExpired);

    const shouldSkipToast =
      skipErrorToast ||
      isSessionExpired ||
      (isRetryRequest && method === "get"); // 백그라운드 refetch 재시도 실패 시 토스트 생략

    if (!shouldSkipToast) {
      if (method === "get")
        toast.show(TOAST_MESSAGES.GET_ERROR, {position: "center"});
      else if (["post", "put", "patch", "delete"].includes(method)) {
        toast.show(TOAST_MESSAGES.MUTATION_ERROR, {position: "center"});
      }
    }

    return Promise.reject(error);
  },
);

export default api;
