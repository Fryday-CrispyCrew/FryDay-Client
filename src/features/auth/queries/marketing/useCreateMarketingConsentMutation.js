import {useMutation} from "@tanstack/react-query";
import {marketingApi} from "./marketingApi";

export function useCreateMarketingConsentMutation(options = {}) {
    return useMutation({
        mutationFn: ({ marketingOptional, skipErrorToast }) =>
            marketingApi.createMarketingConsent(
                { marketingOptional },
                { skipErrorToast },
            ),
        ...options,
    });
}


