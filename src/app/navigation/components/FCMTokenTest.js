import * as Notifications from "expo-notifications";
// import * as Device from "expo-device";
import {Platform} from "react-native";

export async function getFcmToken() {
  // if (!Device.isDevice) {
  //   console.log("❌ 실제 기기에서만 FCM 토큰 발급 가능");
  //   return;
  // }
  console.log("start");
  // 1️⃣ 알림 권한 요청
  const {status: existingStatus} = await Notifications.getPermissionsAsync();

  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    const {status} = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  console.log("after request permission");

  if (finalStatus !== "granted") {
    console.log("❌ 알림 권한 거부됨");
    return;
  }

  // 2️⃣ FCM Token 발급
  const token = (await Notifications.getDevicePushTokenAsync()).data;

  console.log("✅ FCM registration token:", token);

  return token;
}
