import { useMutation } from "@tanstack/react-query";
import { accountApi } from "./accountApi";

export function useLogoutMutation(options = {}) {
    return useMutation({
        mutationFn: ({ deviceId, refreshToken, skipErrorToast = false } = {}) =>
            accountApi.logout({ deviceId, refreshToken, skipErrorToast }),
        ...options,
    });
}
