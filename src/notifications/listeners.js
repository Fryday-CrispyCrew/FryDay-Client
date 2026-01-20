// src/notifications/listeners.js
import messaging from "@react-native-firebase/messaging";
import { displayTodoNotification } from "./displayNotification";

export function registerForegroundMessageListener() {
  return messaging().onMessage(async (remoteMessage) => {
    // remoteMessage.notification이 있을 수도 있고 data-only일 수도 있음
    const title =
      remoteMessage.notification?.title ?? remoteMessage.data?.title;
    const body =
      remoteMessage.notification?.body ?? remoteMessage.data?.body;

    await displayTodoNotification({
      title,
      body,
      data: remoteMessage.data,
    });
  });
}
