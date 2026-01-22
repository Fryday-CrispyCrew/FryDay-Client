import {Platform} from "react-native";
import * as Application from "expo-application";

/**
 * 디바이스 식별자 반환
 * - Android: Application.androidId
 * - iOS: Application.getIosIdForVendorAsync()
 */
export async function getDeviceId() {
  try {
    if (Platform.OS === "android") {
      // androidId는 동기 값 (없을 수도 있으니 fallback 처리)
      const androidId = Application.getAndroidId?.();
      return androidId ?? null;
    }
    if (Platform.OS === "ios") {
      const iosId = await Application.getIosIdForVendorAsync();
      return iosId ?? null;
    }

    return null;
  } catch (e) {
    console.log("[FCM] getDeviceId failed", e);
    return null;
  }
}
