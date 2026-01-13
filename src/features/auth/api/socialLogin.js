import api from "../../../shared/lib/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { getDeviceId } from "../lib/device";

function nextRoute(status) {
    switch (status) {
        case "NEEDS_NICKNAME":
            return "Naming";
        case "NEEDS_AGREEMENT":
            return "Agreement";
        case "NEEDS_ONBOARDING":
            return "Onboarding";
        case "COMPLETED":
            return "Main";
        default:
            return "Naming";
    }
}

export async function loginWithAccessToken(provider, accessToken, navigation) {
    const deviceId = await getDeviceId();

    console.log("provider", provider);
    console.log("tokenLen", accessToken?.length);
    console.log("deviceId", deviceId);

    if (!deviceId) throw new Error("deviceId 없음");

    const { data } = await api.post("/api/users/social/login", {
        provider,
        accessToken,
        deviceId,
        deviceType: Platform.OS === "ios" ? "iOS" : "Android",
        deviceName: "FryDay",
    });

    await AsyncStorage.setItem("accessToken", data.accessToken);
    await AsyncStorage.setItem("refreshToken", data.refreshToken);

    navigation.reset({
        index: 0,
        routes: [{ name: nextRoute(data.onboardingStatus) }],
    });
}

export async function loginWithCode(provider, code, navigation) {
    const deviceId = await getDeviceId();

    const { data } = await api.post("/api/users/social/login", {
        provider,
        code,
        deviceId,
        deviceType: Platform.OS === "ios" ? "iOS" : "Android",
    });

    await AsyncStorage.setItem("accessToken", data.accessToken);
    await AsyncStorage.setItem("refreshToken", data.refreshToken);

    navigation.reset({
        index: 0,
        routes: [{ name: nextRoute(data.onboardingStatus) }],
    });
}
