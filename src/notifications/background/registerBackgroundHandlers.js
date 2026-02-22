import messaging from "@react-native-firebase/messaging";
import notifee from "@notifee/react-native";
import {fcmBackgroundHandler} from "./fcmBackgroundHandler";
import {registerNotifeeBackgroundEvent} from "./notifeeBackgroundHandler";
import {logNotificationClick} from "../lib/logNotificationClick";

// cold start 알림 데이터를 앱 마운트 전에 미리 가져온 뒤,
// Firebase Analytics가 준비된 시점(AppProviders)에서 로그를 남기기 위해 Promise로 보관.
// FCM notification message와 Notifee 알림(포그라운드 표시) 두 경로를 모두 커버.
let _coldStartPromise = null;

export function getColdStartNotificationPromise() {
  return _coldStartPromise;
}

export function registerBackgroundHandlers() {
  // FCM 백그라운드 메시지 핸들러
  messaging().setBackgroundMessageHandler(fcmBackgroundHandler);

  // notifee 백그라운드 이벤트(알림 클릭 등)
  registerNotifeeBackgroundEvent();

  // FCM notification message - 백그라운드 상태에서 알림 클릭 시
  messaging().onNotificationOpenedApp(async (remoteMessage) => {
    await logNotificationClick(remoteMessage.data, "background");
  });

  // Cold start: FCM 알림과 Notifee 알림 두 경로를 모두 확인.
  // 실제 Analytics 로깅은 앱 마운트 후 AppProviders에서 수행 (Analytics 초기화 보장).
  _coldStartPromise = Promise.all([
    messaging().getInitialNotification().catch(() => null),
    notifee.getInitialNotification().catch(() => null),
  ]).then(([fcmMessage, notifeeResult]) => {
    // data 페이로드 유무와 상관없이, 메시지 자체가 존재하면 cold start로 판단
    if (fcmMessage != null) return fcmMessage.data ?? {};
    if (notifeeResult?.notification != null) return notifeeResult.notification.data ?? {};
    return null;
  });
}
