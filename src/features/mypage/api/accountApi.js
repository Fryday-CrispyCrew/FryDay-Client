import api from "../../../shared/lib/api";

/**
 * 회원 탈퇴
 * DELETE /api/users/me
 * 응답: { message: string }
 */
export async function deleteMyAccount(options = {}) {
    const { data } = await api.delete(
        "/api/users/me",
        {
            meta: { skipErrorToast: !!options.skipErrorToast },
        }
    );
    return data;
}
