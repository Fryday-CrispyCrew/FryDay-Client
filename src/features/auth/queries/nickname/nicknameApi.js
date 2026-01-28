import api from "../../../../shared/lib/api";

export const nicknameApi = {
    checkNickname: async ({nickname}) => {
        const res = await api.get("/api/users/nickname/check", {
            params: {nickname},
            meta: {skipErrorToast: true},
        });
        return res.data; // { available, message, ... }
    },

    setMyNickname: async ({nickname}, options = {}) => {
        const res = await api.post(
            "/api/users/me/nickname",
            {nickname},
            {meta: {skipErrorToast: !!options.skipErrorToast}},
        );
        return res.data; // { message, ... }
    },
};
