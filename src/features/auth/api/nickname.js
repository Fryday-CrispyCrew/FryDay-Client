import api from "../../../shared/lib/api";

export async function checkNickname(nickname, options = {}) {
    const { data } = await api.get(
        "/api/users/nickname/check",
        {
            params: { nickname },
            meta: { skipErrorToast: true },
        }
    );

    return data; // { available, message }
}

export async function setMyNickname(nickname, options = {}) {
    const { data } = await api.post(
        "/api/users/me/nickname",
        { nickname },
        {
            meta: { skipErrorToast: !!options.skipErrorToast },
        }
    );

    return data; // { message }
}
