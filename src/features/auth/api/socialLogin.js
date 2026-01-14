import api from "../../../shared/lib/api";
import {Platform} from "react-native";
import {getDeviceId} from "../lib/device";
import {
  saveAccessToken,
  saveRefreshToken,
} from "../../../shared/lib/storage/tokenStorage";

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

  const {data} = await api.post("/api/users/social/login", {
    provider,
    accessToken,
    deviceId,
    deviceType: Platform.OS === "ios" ? "iOS" : "Android",
    deviceName: "FryDay",
  });

  console.log("response", data);

  await Promise.all([
    saveAccessToken(String(data.accessToken ?? "")),
    saveRefreshToken(String(data.refreshToken ?? "")),
  ]);

  // navigation.reset({
  //   index: 0,
  //   routes: [{name: nextRoute(data.onboardingStatus)}],
  // });
  navigation.navigate("Category", {
    screen: "CategList",
  });
}

export async function loginWithCode(provider, code, navigation) {
  const deviceId = await getDeviceId();

  const {data} = await api.post("/api/users/social/login", {
    provider,
    code,
    deviceId,
    deviceType: Platform.OS === "ios" ? "iOS" : "Android",
  });

  await Promise.all([
    saveAccessToken(String(data.accessToken ?? "")),
    saveRefreshToken(String(data.refreshToken ?? "")),
  ]);

  // navigation.reset({
  //   index: 0,
  //   routes: [{name: nextRoute(data.onboardingStatus)}],
  // });
  navigation.navigate("Category", {
    screen: "CategList",
  });
}
