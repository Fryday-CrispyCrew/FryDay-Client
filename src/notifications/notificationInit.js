// src/notifications/notificationInit.js
import {Platform} from "react-native";
import notifee, {AndroidImportance} from "@notifee/react-native";

export async function initNotifeeChannel() {
  if (Platform.OS === "android") {
    // Android 13+ 알림 권한
    await notifee.requestPermission();

    // 채널 생성 (헤드업/배너 뜨려면 중요도 HIGH 권장)
    await notifee.createChannel({
      id: "todo",
      name: "Todo Notifications",
      importance: AndroidImportance.HIGH,
    });
  } else {
    // iOS 권한 요청(알림 표시/사운드/배지)
    await notifee.requestPermission({
      alert: true,
      badge: true,
      sound: true,
    });
  }
}
