import NaverLogin from "@react-native-seoul/naver-login";

const NAVER_CONSUMER_KEY = process.env.EXPO_PUBLIC_NAVER_CLIENT_ID;
const NAVER_CONSUMER_SECRET = process.env.EXPO_PUBLIC_NAVER_CLIENT_SECRET;
const NAVER_APP_NAME = "FryDay";

let inited = false;

export async function naverGetAccessToken() {
    if (!NAVER_CONSUMER_KEY || !NAVER_CONSUMER_SECRET) {
        throw new Error("NAVER env 누락 (EXPO_PUBLIC_NAVER_CLIENT_ID / SECRET)");
    }

    const scheme = `frydaynaver`;

    if (!inited) {
        NaverLogin.initialize({
            consumerKey: NAVER_CONSUMER_KEY,
            consumerSecret: NAVER_CONSUMER_SECRET,
            appName: NAVER_APP_NAME,
            serviceUrlSchemeIOS: scheme,
        });
        inited = true;
    }

    const result = await NaverLogin.login();
    const token = result?.successResponse?.accessToken;

    if (!token) {
        throw new Error(`NAVER token 없음: ${JSON.stringify(result)}`);
    }

    return token;
}
