import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STEP_KEY } from "../../../shared/constants/onboardingStep";
import { clearWidgetForLogout } from "../../../shared/widget/syncWidget";

export async function clearForLogout() {
  try {
    await AsyncStorage.clear();
  } catch {}
  await Promise.allSettled([
    SecureStore.deleteItemAsync("accessToken"),
    SecureStore.deleteItemAsync("refreshToken"),
    SecureStore.deleteItemAsync("nickname"),
    SecureStore.deleteItemAsync("hasOnboarded"),
    SecureStore.deleteItemAsync("email"),
    SecureStore.deleteItemAsync(STEP_KEY),
    SecureStore.deleteItemAsync("deviceId"),
  ]);

  clearWidgetForLogout();
}
export async function clearForDeleteAccount() {
  await clearForLogout();

  await Promise.allSettled([
    SecureStore.deleteItemAsync("hasTrackedAuthView"),
    SecureStore.deleteItemAsync("hasTrackedMainView"),
  ]);
}
export async function clearAuthAndCache(queryClient) {
  try {
    await queryClient.cancelQueries();
    queryClient.clear();
  } catch {}
  await clearForLogout();
}

export async function readAuthForLogout() {
  const [dA, dS, rA, rS] = await Promise.all([
    AsyncStorage.getItem("deviceId"),
    SecureStore.getItemAsync("deviceId"),
    AsyncStorage.getItem("refreshToken"),
    SecureStore.getItemAsync("refreshToken"),
  ]);
  return {
    deviceId: (dA ?? dS ?? "").trim(),
    refreshToken: (rA ?? rS ?? "").trim(),
  };
}
