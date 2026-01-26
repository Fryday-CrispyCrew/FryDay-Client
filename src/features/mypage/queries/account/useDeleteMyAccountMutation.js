import { useMutation } from "@tanstack/react-query";
import { accountApi } from "./accountApi";

export function useDeleteMyAccountMutation(options = {}) {
    return useMutation({
        mutationFn: ({ skipErrorToast = false } = {}) =>
            accountApi.deleteMyAccount({ skipErrorToast }),
        ...options,
    });
}
