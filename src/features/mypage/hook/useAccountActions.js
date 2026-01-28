import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useDeleteMyAccountMutation } from "../queries/account/useDeleteMyAccountMutation";
import { useLogoutMutation } from "../queries/account/useLogoutMutation";
import { clearAuthAndCache, readAuthForLogout } from "../lib/authCleanup";

export function useAccountActions(navigation) {
    const queryClient = useQueryClient();
    const { mutateAsync: deleteMyAccountAsync } = useDeleteMyAccountMutation();
    const { mutateAsync: logoutAsync } = useLogoutMutation();

    const goAuthLogin = useCallback(() => {
        const root = navigation?.getParent?.("root") ?? navigation?.getParent?.();
        const routes = [{ name: "Auth", params: { screen: "Login" } }];
        root?.reset ? root.reset({ index: 0, routes }) : navigation?.reset?.({ index: 0, routes });
    }, [navigation]);

    const logout = useCallback(async () => {
        try {
            const { deviceId, refreshToken } = await readAuthForLogout();
            console.log("[logout] request", { deviceId, refreshToken });

            if (deviceId && refreshToken) {
                const res = await logoutAsync({ deviceId, refreshToken, skipErrorToast: true });
                console.log("[logout] response", res);
            } else {
                console.log("[logout] missing auth data");
            }
        } catch (e) {
            console.log("[logout] error", e?.response?.data || e?.message);
        }

        await clearAuthAndCache(queryClient);
        goAuthLogin();
    }, [logoutAsync, queryClient, goAuthLogin]);

    const deleteAccount = useCallback(async () => {
        try {
            const res = await deleteMyAccountAsync({ skipErrorToast: true });
            console.log("[delete] response", res);
        } catch (e) {
            console.log("[delete] error", e?.response?.data || e?.message);
        }

        await clearAuthAndCache(queryClient);
        goAuthLogin();
    }, [deleteMyAccountAsync, queryClient, goAuthLogin]);

    return { logout, deleteAccount };
}
