import api from "../../../../shared/lib/api";

export const consentApi = {
    setConsent: async (
        { privacyRequired, pushNotificationOptional },
        { skipErrorToast = false } = {},
    ) => {
        const res = await api.post(
            "/api/users/me/consent",
            {
                privacyRequired: Boolean(privacyRequired),
                pushNotificationOptional: Boolean(pushNotificationOptional),
            },
            { meta: { skipErrorToast } },
        );

        return res.data;
    },
};
