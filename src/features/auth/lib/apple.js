import * as AppleAuthentication from "expo-apple-authentication";

export async function appleGetIdToken() {
    const res = await AppleAuthentication.signInAsync({
        requestedScopes: [
            AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
            AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
    });

    const idToken = res.identityToken;

    if (!idToken) throw new Error("Apple identityToken 없음");
    return idToken;
}
