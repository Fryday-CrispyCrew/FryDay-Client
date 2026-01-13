import * as KakaoLogins from "@react-native-seoul/kakao-login";

export async function kakaoGetAccessToken() {
    const res = await KakaoLogins.login();
    console.log(res.accessToken);
    if (!res?.accessToken) throw new Error("Kakao accessToken 없음");
    return res.accessToken;
}
