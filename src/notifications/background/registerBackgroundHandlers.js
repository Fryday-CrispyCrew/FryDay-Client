import messaging from "@react-native-firebase/messaging";
import {fcmBackgroundHandler} from "./fcmBackgroundHandler";
import {registerNotifeeBackgroundEvent} from "./notifeeBackgroundHandler";

export function registerBackgroundHandlers() {
  // FCM 백그라운드 메시지 핸들러
  messaging().setBackgroundMessageHandler(fcmBackgroundHandler);

  // notifee 백그라운드 이벤트(알림 클릭 등)
  registerNotifeeBackgroundEvent();
}
