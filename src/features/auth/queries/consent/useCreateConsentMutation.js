// useCreateConsentMutation.js
import {useMutation} from "@tanstack/react-query";
import {consentApi} from "./consentApi";

export function useCreateConsentMutation(options = {}) {
  return useMutation({
    mutationFn: ({
      termsRequired,
      privacyRequired,
      marketingOptional,
      skipErrorToast,
    }) =>
      consentApi.setConsent(
        {termsRequired, privacyRequired, marketingOptional},
        {skipErrorToast},
      ),
    ...options,
  });
}
