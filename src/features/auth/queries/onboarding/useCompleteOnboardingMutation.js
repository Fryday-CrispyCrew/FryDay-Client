import {useMutation} from "@tanstack/react-query";
import {onboardingApi} from "./onboardingApi";

export function useCompleteOnboardingMutation(options = {}) {
    return useMutation({
        mutationFn: () => onboardingApi.completeOnboarding(),
        ...options,
    });
}
