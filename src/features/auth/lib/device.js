import * as Application from "expo-application";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const KEY = "deviceId";

export async function getDeviceId() {
    if (Platform.OS === "ios") {
        const id = await Application.getIosIdForVendorAsync();
        if (id) return id;
    } else {
        const id = Application.getAndroidId?.();
        if (id) return id;
    }

    const saved = await SecureStore.getItemAsync(KEY);
    if (saved) return saved;

    const uuid =
        globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;

    await SecureStore.setItemAsync(KEY, uuid);
    return uuid;
}
