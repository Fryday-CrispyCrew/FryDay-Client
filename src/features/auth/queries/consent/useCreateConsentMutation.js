import {useMutation} from "@tanstack/react-query";
import {consentApi} from "./consentApi";

export function useCreateConsentMutation(options = {}) {
    return useMutation({
        mutationFn: ({privacyRequired, pushNotificationOptional, skipErrorToast}) =>
            consentApi.setConsent(
                {privacyRequired, pushNotificationOptional},
                {skipErrorToast},
            ),
        ...options,
    });
}
