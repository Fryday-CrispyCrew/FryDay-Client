import {useMutation} from "@tanstack/react-query";
import {nicknameApi} from "./nicknameApi";

export function useCreateMyNicknameMutation(options = {}) {
    return useMutation({
        mutationFn: ({nickname, skipErrorToast}) =>
            nicknameApi.setMyNickname({nickname}, {skipErrorToast}),
        ...options,
    });
}
