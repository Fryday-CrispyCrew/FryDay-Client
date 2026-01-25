import {useMutation} from "@tanstack/react-query";
import {socialLoginApi} from "./socialLoginApi";

export function useCreateAppleLoginMutation(options = {}) {
    return useMutation({
        mutationFn: ({idToken, navigation, skipErrorToast}) =>
            socialLoginApi.createAppleLogin({idToken, navigation}, {skipErrorToast}),
        ...options,
    });
}
