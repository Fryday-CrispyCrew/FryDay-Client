import NaverLogin from "@react-native-seoul/naver-login";

export async function naverGetAccessToken() {
    console.log("NAVER CLICKED");
    console.log("NaverLogin =", NaverLogin);

    const res = await NaverLogin.login();
    const token = res?.successResponse?.accessToken;

    console.log("NAVER RES =", res);
    console.log("NAVER token =", token);

    if (!token) throw new Error("Naver accessToken 없음");
    return token;
}
