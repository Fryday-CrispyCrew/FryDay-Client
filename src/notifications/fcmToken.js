// src/notifications/fcmToken.js
import messaging from "@react-native-firebase/messaging";

export async function ensureFcmPermissionAndGetToken() {
  // iOS 포함 권한 요청
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (!enabled) {
    return null;
  }

  // (선택) iOS에서 안정성을 위해 APNs 토큰 체크가 필요한 경우도 있음
  // const apnsToken = await messaging().getAPNSToken();

  const fcmToken = await messaging().getToken();
  return fcmToken;
}

export function subscribeTokenRefresh(onRefresh) {
  return messaging().onTokenRefresh(onRefresh);
}
