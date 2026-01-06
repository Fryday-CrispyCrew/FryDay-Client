import NaverLogin from "@react-native-seoul/naver-login";

export async function naverGetAccessToken() {
    const res = await NaverLogin.login();
    const token = res?.successResponse?.accessToken;
    if (!token) throw new Error("Naver accessToken 없음");
    return token;
}
