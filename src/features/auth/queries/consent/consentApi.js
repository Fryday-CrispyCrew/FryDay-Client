// consentApi.js
import api from "../../../../shared/lib/api";

export const consentApi = {
  setConsent: async (
    {termsRequired, privacyRequired, marketingOptional},
    {skipErrorToast = false} = {},
  ) => {
    const res = await api.post(
      "/api/users/me/consent",
      {
        termsRequired: Boolean(termsRequired),
        privacyRequired: Boolean(privacyRequired),
        marketingOptional: Boolean(marketingOptional),
      },
      {meta: {skipErrorToast}},
    );
    return res.data;
  },
};
