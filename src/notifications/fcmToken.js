// src/notifications/fcmToken.js
import messaging from "@react-native-firebase/messaging";

export async function ensureFcmPermissionAndGetToken() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (!enabled) {
    return {enabled: false, token: null};
  }

  const fcmToken = await messaging().getToken();
  return {enabled: true, token: fcmToken};
}

export function subscribeTokenRefresh(onRefresh) {
  return messaging().onTokenRefresh(onRefresh);
}
