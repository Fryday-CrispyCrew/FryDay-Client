import AsyncStorage from "@react-native-async-storage/async-storage";
const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

async function parseJson(res) {
    try {
        return await res.json();
    } catch {
        return {};
    }
}

async function getAccessToken() {
    return await AsyncStorage.getItem("accessToken");
}

export async function setConsent({ privacyRequired, pushNotificationOptional }) {
    const token = await getAccessToken();
    if (!token) throw new Error("인증 토큰이 없습니다.");

    const url = `${BASE_URL}/api/users/me/consent`;
    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            privacyRequired: !!privacyRequired,
            pushNotificationOptional: !!pushNotificationOptional,
        }),
    });

    const data = await parseJson(res);

    if (!res.ok) {
        const err = new Error(data.message ?? `동의 설정 실패 (${res.status})`);
        err.status = res.status;
        err.code = data.code;
        err.body = data;
        throw err;
    }

    return data;
}

export async function completeOnboarding() {
    const token = await getAccessToken();
    if (!token) throw new Error("인증 토큰이 없습니다.");

    const url = `${BASE_URL}/api/users/me/onboarding`;
    const res = await fetch(url, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await parseJson(res);

    if (!res.ok) {
        const err = new Error(data.message ?? `온보딩 완료 처리 실패 (${res.status})`);
        err.status = res.status;
        err.code = data.code;
        err.body = data;
        throw err;
    }

    return data;
}
