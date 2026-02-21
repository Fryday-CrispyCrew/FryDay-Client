// src/notifications/listeners.js
import messaging from "@react-native-firebase/messaging";
import {displayTodoNotification} from "./displayNotification";

export function registerForegroundMessageListener() {
  return messaging().onMessage(async (remoteMessage) => {
    console.log("📩 [FCM] Foreground message received:", remoteMessage);

    console.log("📩 [FCM] notification:", remoteMessage.notification);
    console.log("📩 [FCM] data:", remoteMessage.data);

    // remoteMessage.notification이 있을 수도 있고 data-only일 수도 있음
    const title =
      remoteMessage.notification?.title ?? remoteMessage.data?.title;
    const body = remoteMessage.notification?.body ?? remoteMessage.data?.body;
    console.log("remoteMessage.notification.title: ", title);
    console.log("remoteMessage.notification.body: ", body);
    console.log("remoteMessage.data.title: ", title);
    console.log("remoteMessage.data.body: ", body);
    await displayTodoNotification({
      title,
      body,
      data: remoteMessage.data,
    });
  });
}
