import {useMutation} from "@tanstack/react-query";
import {consentApi} from "./consentApi";

export function useCreateConsentMutation(options = {}) {
    return useMutation({
        mutationFn: ({privacyRequired, skipErrorToast}) =>
            consentApi.setConsent(
                {privacyRequired},
                {skipErrorToast},
            ),
        ...options,
    });
}
