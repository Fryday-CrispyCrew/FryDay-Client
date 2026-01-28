import {useQuery} from "@tanstack/react-query";
import {nicknameApi} from "./nicknameApi";
import {nicknameKeys} from "./nicknameKeys";

export function useCheckNicknameQuery(nickname, options = {}) {
    const value = String(nickname ?? "").trim();

    return useQuery({
        queryKey: nicknameKeys.check(value),
        queryFn: () => nicknameApi.checkNickname({nickname: value}),
        enabled: value.length > 0 && (options.enabled ?? true),
        ...options,
    });
}
