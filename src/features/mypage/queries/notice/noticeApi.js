// noticesApi.js
import api from "../../../../shared/lib/api";

export const noticesApi = {
  getNotices: async ({ skipErrorToast = false } = {}) => {
    const res = await api.get("/api/notices", { meta: { skipErrorToast } });
    return res.data;
  },
};
