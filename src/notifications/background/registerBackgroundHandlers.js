import messaging from "@react-native-firebase/messaging";
import {fcmBackgroundHandler} from "./fcmBackgroundHandler";
import {registerNotifeeBackgroundEvent} from "./notifeeBackgroundHandler";
import {logNotificationClick} from "../lib/logNotificationClick";

export function registerBackgroundHandlers() {
  // FCM 백그라운드 메시지 핸들러
  messaging().setBackgroundMessageHandler(fcmBackgroundHandler);

  // notifee 백그라운드 이벤트(알림 클릭 등)
  registerNotifeeBackgroundEvent();

  // FCM notification message - 백그라운드 상태에서 알림 클릭 시
  messaging().onNotificationOpenedApp(async (remoteMessage) => {
    await logNotificationClick(remoteMessage.data, "background");
  });

  // Cold start: React Navigation이 Intent를 처리하기 전에 최대한 빨리 호출
  (async () => {
    const initialMessage = await messaging().getInitialNotification();
    if (initialMessage) {
      await logNotificationClick(initialMessage.data, "cold_start");
    }
  })();
}
