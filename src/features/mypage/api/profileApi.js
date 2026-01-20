import api from "../../../shared/lib/api";

/**
 * 닉네임 수정
 * PATCH /api/users/me/nickname
 * body: { nickname: string } (2~10자)
 * 응답: { message: string }
 */
export async function updateMyNickname(nickname, options = {}) {
    const { data } = await api.patch(
        "/api/users/me/nickname",
        { nickname },
        {
            meta: { skipErrorToast: !!options.skipErrorToast },
        }
    );
    return data;
}
