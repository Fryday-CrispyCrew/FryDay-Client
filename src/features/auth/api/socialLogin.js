import api from "../../../shared/lib/api";
import {Platform} from "react-native";
import {getDeviceId} from "../lib/device";
import {
  saveAccessToken,
  saveRefreshToken,
} from "../../../shared/lib/storage/tokenStorage";
import dayjs from "dayjs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import {STEP_KEY} from "../../../shared/constants/onboardingStep";

function nextRoute(status) {
  switch (status) {
    case "NEEDS_NICKNAME":
      return "Naming";
    case "NEEDS_AGREEMENT":
      return "Main";
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

  const { data } = await api.post(
      "/api/users/social/login",
      {
        provider,
        accessToken,
        deviceId,
        deviceType: Platform.OS === "ios" ? "iOS" : "Android",
        deviceName: "FryDay",
      },
      { headers: { Authorization: undefined } }
  );

  await Promise.all([
    saveAccessToken(String(data?.accessToken ?? "")),
    saveRefreshToken(String(data?.refreshToken ?? "")),
  ]);

  const nick = String(data?.user?.nickname ?? "").trim();
  if (nick) {
    await Promise.allSettled([
      AsyncStorage.setItem("nickname", nick),
      SecureStore.setItemAsync("nickname", nick),
    ]);
  }

  await AsyncStorage.setItem(STEP_KEY, String(data?.onboardingStatus ?? ""));
  const target = nextRoute(data?.onboardingStatus);
  navigation.reset({
    index: 0,
    routes: [{ name: target }],
  });


  // navigation.navigate("Main", {
  //   screen: "Home",
  // });
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
