import api from "../../../../shared/lib/api";
import { Platform } from "react-native";
import { getDeviceId } from "../../lib/device";
import { saveAccessToken, saveRefreshToken } from "../../../../shared/lib/storage/tokenStorage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { STEP_KEY } from "../../../../shared/constants/onboardingStep";

async function persistLoginResult(data, deviceId) {
    await Promise.all([
        saveAccessToken(String(data?.accessToken ?? "")),
        saveRefreshToken(String(data?.refreshToken ?? "")),
    ]);

    await Promise.allSettled([
        AsyncStorage.setItem("deviceId", deviceId),
        SecureStore.setItemAsync("deviceId", deviceId),
    ]);

    const nick = String(data?.user?.nickname ?? "").trim();
    if (nick) {
        await Promise.allSettled([
            AsyncStorage.setItem("nickname", nick),
            SecureStore.setItemAsync("nickname", nick),
        ]);
    }

    await AsyncStorage.setItem(STEP_KEY, String(data?.onboardingStatus ?? ""));
}


export const socialLoginApi = {
    createSocialLogin: async ({ provider, accessToken }, options = {}) => {
        const deviceId = await getDeviceId();

        const res = await api.post(
            "/api/users/social/login",
            {
                provider,
                accessToken,
                deviceId,
                deviceType: Platform.OS === "ios" ? "iOS" : "Android",
                deviceName: "FryDay",
            },
            {
                headers: { Authorization: undefined },
                meta: { skipErrorToast: !!options.skipErrorToast },
            }
        );

        const data = res.data;
        await persistLoginResult(data, deviceId);
        return data;
    },

    createAppleLogin: async ({ idToken }, options = {}) => {
        const deviceId = await getDeviceId();

        const res = await api.post(
            "/api/users/apple/login",
            {
                idToken,
                deviceId,
                deviceType: Platform.OS === "ios" ? "iOS" : "Android",
                deviceName: "FryDay",
            },
            {
                meta: { skipErrorToast: !!options.skipErrorToast },
            }
        );

        const data = res.data;
        await persistLoginResult(data, deviceId);
        return data;
    },
};
