import {useMutation} from "@tanstack/react-query";
import {socialLoginApi} from "./socialLoginApi";

export function useCreateSocialLoginMutation(options = {}) {
    return useMutation({
        mutationFn: ({provider, accessToken, navigation, skipErrorToast}) =>
            socialLoginApi.createSocialLogin(
                {provider, accessToken, navigation},
                {skipErrorToast},
            ),
        ...options,
    });
}
