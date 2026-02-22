// src/notifications/notifeeEvents.js
import notifee, {EventType} from "@notifee/react-native";
import {logNotificationClick} from "./lib/logNotificationClick";
import {navigationRef} from "../shared/lib/navigationRef";

export function registerNotifeeForegroundEvents() {
  return notifee.onForegroundEvent(async ({type, detail}) => {
    // console.log("foreground event: ", {type, detail});
    if (type === EventType.PRESS) {
      // console.log("notify pressed");
      const data = detail.notification?.data;
      try {
        await logNotificationClick(data, "foreground");
      } catch (e) {
        // console.log("error: ", e);
      }
      if (data?.todoId && navigationRef.isReady()) {
        navigationRef.navigate("TodoDetail", {todoId: data.todoId});
      }
    }
  });
}
