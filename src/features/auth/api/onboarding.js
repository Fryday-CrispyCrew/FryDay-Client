import api from "../../../shared/lib/api";
import {getAccessToken} from "../../../shared/lib/storage/tokenStorage";

export async function setConsent(
  {privacyRequired, pushNotificationOptional},
  options = {}
) {
  const token = await getAccessToken();
  if (!token) throw new Error("인증 토큰이 없습니다.");

  const {data} = await api.post(
    "/api/users/me/consent",
    {
      privacyRequired: !!privacyRequired,
      pushNotificationOptional: !!pushNotificationOptional,
    },
    {
      headers: {Authorization: `Bearer ${token}`},
      meta: {skipErrorToast: !!options.skipErrorToast},
    }
  );

  return data;
}

export async function completeOnboarding(options = {}) {
  const token = await getAccessToken();
  if (!token) throw new Error("인증 토큰이 없습니다.");

  const {data} = await api.post("/api/users/me/onboarding", null, {
    headers: {Authorization: `Bearer ${token}`},
    meta: {skipErrorToast: true},
  });

  return data;
}
