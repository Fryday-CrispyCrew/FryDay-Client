// src/notifications/notifeeEvents.js
import notifee, {EventType} from "@notifee/react-native";
import {logNotificationClick} from "./lib/logNotificationClick";

export function registerNotifeeForegroundEvents(navigate) {
  return notifee.onForegroundEvent(async ({type, detail}) => {
    if (type === EventType.PRESS) {
      const data = detail.notification?.data;
      await logNotificationClick(data, "foreground");
      // 예: todoId로 상세 화면 이동
      if (data?.todoId) {
        navigate("TodoDetail", {todoId: data.todoId});
      }
    }
  });
}
