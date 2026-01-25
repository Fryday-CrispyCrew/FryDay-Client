import api from "../../../../shared/lib/api";

export const marketingApi = {
    createMarketingConsent: async (
        { marketingOptional },
        { skipErrorToast = false } = {},
    ) => {
        const res = await api.patch(
            "/api/users/me/marketing",
            { marketingOptional: Boolean(marketingOptional) },
            { meta: { skipErrorToast } },
        );

        return res.data;
    },
};
