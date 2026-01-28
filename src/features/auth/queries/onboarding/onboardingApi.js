import api from "../../../../shared/lib/api";

export const onboardingApi = {
    completeOnboarding: async ({ skipErrorToast = true } = {}) => {
        const res = await api.post(
            "/api/users/me/onboarding",
            null,
            { meta: { skipErrorToast } },
        );

        return res.data;
    },
};
