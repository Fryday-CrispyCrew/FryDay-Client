import api from "../../../../shared/lib/api";

export const accountApi = {
    /**
     * 회원 탈퇴
     * DELETE /api/users/me
     * 응답: { message: string }
     */
    deleteMyAccount: async ({ skipErrorToast = false } = {}) => {
        const res = await api.delete("/api/users/me", {
            meta: { skipErrorToast },
        });
        return res.data;
    },

    /**
     * 로그아웃
     * POST /api/users/me/logout
     * body: { deviceId, refreshToken }
     * 응답: { message: string }
     */
    logout: async ({ deviceId, refreshToken, skipErrorToast = false } = {}) => {
        const res = await api.post(
            "/api/users/me/logout",
            { deviceId, refreshToken },
            { meta: { skipErrorToast } }
        );
        return res.data;
    },
};
