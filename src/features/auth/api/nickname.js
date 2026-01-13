import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

async function parseError(res) {
    try {
        return await res.json();
    } catch {
        return {};
    }
}

export async function checkNickname(nickname) {
    const url = `${BASE_URL}/api/users/nickname/check?nickname=${encodeURIComponent(nickname)}`;
    const res = await fetch(url, { method: "GET" });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        throw Object.assign(new Error(data.message ?? `닉네임 확인 실패 (${res.status})`), {
            status: res.status,
            body: data,
        });
    }

    return data;
}


export async function setMyNickname(nickname) {
    const token = await AsyncStorage.getItem("accessToken");
    if (!token) throw new Error("인증 토큰이 없습니다.");

    console.log("[setMyNickname] token =", token ? `OK(len:${token.length})` : "MISSING");


    const url = `${BASE_URL}/api/users/me/nickname`;
    console.log("[setMyNickname] url =", url);

    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nickname }),
    });

    console.log("[setMyNickname] status =", res.status);

    const data = await res.json().catch(() => ({}));
    console.log("[setMyNickname] body =", data);

    if (!res.ok) {
        const err = new Error(data.message ?? `닉네임 설정 실패 (${res.status})`);
        err.status = res.status;
        err.code = data.code;
        throw err;
    }

    return data;
}

